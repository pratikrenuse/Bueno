import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, NumberField, DateField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import copyDict from './copy.js';
import { computeSale } from './calc.js';

// What a non-resident nets on a Spanish sale, and which returns fall due when.
//
// Every figure here is read from the rules base. Four of them decide the whole tool.
//
// The capital gains rate is ONE rate for everyone. The 19 and 24 percent split applies to
// imputed and rental income and has nothing to do with a gain on sale. calc.js takes a
// single rate and has no country argument, so the error cannot be made here.
//
// The buyer's retention is a percentage of the agreed consideration, so of the price. On a
// loss-making sale it is charged in full, which is precisely the case where the seller is
// owed all of it back and has to file to get it.
//
// The seller's own window opens one month after the transfer and closes four months after.
// The April rule that now governs rental income does not reach this flow.
//
// And the part that surprises people: where the seller is non-resident the buyer becomes
// sustituto del contribuyente for plusvalia, so the buyer's lawyer retains an estimate of
// it at completion ON TOP of the retention. That is market practice, not a legal rule, and
// it is labelled that way on the page. No amount is computed for it, because plusvalia is
// municipal and this tool cannot know the local coefficients or rate.

const RATES = rule('irnr.rates');
const RETENTION = rule('irnr.sale.retention');
const SALE_WINDOW = rule('deadline.210.sale');
const PLUSVALIA_DUE = rule('plusvalia.deadlines');

// Read at load so the page cannot render if any of them stops being displayable. rule()
// throws on an unverified, annulled or myth status, and these four are quoted in prose
// rather than as a number, which is exactly the case a silent status change would slip past.
rule('irnr.sale.gain_base');
rule('plusvalia.non_resident_seller');
rule('plusvalia.municipal_variation');
rule('plusvalia.no_gain');
rule('irnr.rental.deductibility');

const CGT_RATE = RATES.value.capital_gain.all;
const RETENTION_RATE = RETENTION.value.rate;
const RETENTION_MODEL = RETENTION.value.model;
const RETENTION_MONTHS = RETENTION.value.deadline_months;
const OPENS_MONTHS = SALE_WINDOW.value.opens_months_after;
const WINDOW_MONTHS = SALE_WINDOW.value.window_months;
const PLUSVALIA_DAYS = PLUSVALIA_DUE.value.sale_working_days;

const STEPS = ['country', 'bought', 'sold', 'completion'];

function euro(n) {
  if (!Number.isFinite(n)) return '';
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `${n < 0 ? 'minus ' : ''}${s} euros`;
}

function fmt(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function SaleTax() {
  const c = useCopy(copyDict);
  const [step, setStep] = useState('intro');
  const [a, setA] = useState({
    country: '', boughtPrice: '', boughtCosts: '', soldPrice: '', agentPct: '', completion: '',
  });

  const idx = STEPS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / STEPS.length) * 100;

  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const back = () => setStep(idx <= 0 ? 'intro' : STEPS[idx - 1]);
  const restart = () => {
    setA({ country: '', boughtPrice: '', boughtCosts: '', soldPrice: '', agentPct: '', completion: '' });
    setStep('intro');
  };

  const chooseCountry = v => { set('country', v); setTimeout(() => setStep('bought'), 150); };

  const r = computeSale({
    purchasePrice: a.boughtPrice,
    purchaseCosts: a.boughtCosts,
    salePrice: a.soldPrice,
    agentPct: a.agentPct,
    completion: a.completion,
    cgtRate: CGT_RATE,
    retentionRate: RETENTION_RATE,
    retentionMonths: RETENTION_MONTHS,
    saleOpensMonths: OPENS_MONTHS,
    saleWindowMonths: WINDOW_MONTHS,
    plusvaliaWorkingDays: PLUSVALIA_DAYS,
  });

  const euEea = a.country === 'eu' || a.country === 'eea';

  const headline = r.outcome === 'refund'
    ? `You are owed about ${euro(r.refund)} back`
    : r.outcome === 'balance'
      ? `You have about ${euro(r.balanceDue)} still to pay`
      : `The retention covers the tax exactly`;

  const sub = r.isLoss
    ? `You are selling at a loss, so there is no capital gains tax. The buyer still has to hold back ${RETENTION_RATE} percent of the price and pay it to the tax office, and you only get it back by filing for it.`
    : r.outcome === 'refund'
      ? `The ${RETENTION_RATE} percent the buyer holds back is more than the tax on your gain. The difference is not refunded automatically. You have to claim it.`
      : `The ${RETENTION_RATE} percent the buyer holds back is a payment on account, not the tax itself. Your gain is larger than it covers, so the balance falls due with your own return.`;

  const tone = r.outcome === 'refund' ? 'good' : 'neutral';

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Guidance for property owners in Spain. Not tax advice.">

      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('country')} />
      )}

      {step === 'country' && (
        <Step n={1} of={4} question={c('q_country')} hint={c('q_country_hint')}>
          <Options items={[
            { value: 'eu', label: c('country_eu'), desc: c('country_eu_d') },
            { value: 'eea', label: c('country_eea'), desc: c('country_eea_d') },
            { value: 'other', label: c('country_other'), desc: c('country_other_d') },
          ]} value={a.country} onChange={chooseCountry} />
        </Step>
      )}

      {step === 'bought' && (
        <Step n={2} of={4} question={c('q_bought')} hint={c('q_bought_hint')} onBack={back}
          onNext={() => setStep('sold')} nextDisabled={!(Number(a.boughtPrice) > 0)}>
          <NumberField label={c('bought_price')} value={a.boughtPrice} prefix="EUR" min={0}
            onChange={v => set('boughtPrice', v)} />
          <NumberField label={c('bought_costs')} value={a.boughtCosts} prefix="EUR" min={0}
            hint={c('bought_costs_hint')} onChange={v => set('boughtCosts', v)} />
          <SourceNote ids="irnr.sale.gain_base" label="What counts as the acquisition value" />
        </Step>
      )}

      {step === 'sold' && (
        <Step n={3} of={4} question={c('q_sold')} hint={c('q_sold_hint')} onBack={back}
          onNext={() => setStep('completion')} nextDisabled={!(Number(a.soldPrice) > 0)}>
          <NumberField label={c('sold_price')} value={a.soldPrice} prefix="EUR" min={0}
            onChange={v => set('soldPrice', v)} />
          <NumberField label={c('sold_agent')} value={a.agentPct} suffix="%" min={0} max={20}
            hint={c('sold_agent_hint')} onChange={v => set('agentPct', v)} />
          <SourceNote ids="irnr.sale.gain_base" label="What comes off the transfer value" />
        </Step>
      )}

      {step === 'completion' && (
        <Step n={4} of={4} question={c('q_completion')} hint={c('q_completion_hint')} onBack={back}
          onNext={() => setStep('result')} nextDisabled={!a.completion} nextLabel={c('see')}>
          <DateField label={c('completion_label')} value={a.completion}
            onChange={v => set('completion', v)} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={headline} sub={sub} tone={tone} onRestart={restart} restartLabel={c('restart')}>

          <Panel title="The gain, and the tax on it" kind="key">
            <Rows items={[
              { label: 'Sale price', value: euro(Number(a.soldPrice) || 0) },
              { label: 'Less agent commission', value: euro(-r.agentFee) },
              { label: 'Transfer value', value: euro(r.transferValue) },
              { label: 'Purchase price', value: euro(Number(a.boughtPrice) || 0) },
              { label: 'Plus costs of buying', value: euro(Number(a.boughtCosts) || 0) },
              { label: 'Acquisition value', value: euro(r.acquisitionValue) },
              { label: r.isLoss ? 'Loss on the sale' : 'Gain on the sale', value: euro(r.gain), strong: true },
              { label: `Capital gains tax at ${CGT_RATE} percent`, value: euro(r.taxDue), strong: true },
            ]} />
            <p className="tk-para">
              The {CGT_RATE} percent is the same wherever you are tax resident. Being resident in
              an EU or EEA state changes the rate on rental and imputed income, and it changes
              whether letting costs are deductible, but it does not change this one. Several
              guides split gains {RATES.value.imputed.eu_eea} and {RATES.value.imputed.other} the
              way rental income is split. That is the wrong rate on the wrong income.
            </p>
            <SourceNote ids={['irnr.rates', 'irnr.sale.gain_base']} />
          </Panel>

          <Panel title={`The ${RETENTION_RATE} percent the buyer holds back`}>
            <Rows items={[
              { label: `${RETENTION_RATE} percent of the sale price`, value: euro(r.retention), strong: true },
              { label: 'Tax on your gain', value: euro(r.taxDue) },
              r.outcome === 'refund'
                ? { label: 'Refund you can claim', value: euro(r.refund), strong: true }
                : r.outcome === 'balance'
                  ? { label: 'Balance still to pay', value: euro(r.balanceDue), strong: true }
                  : { label: 'Difference', value: euro(0) },
            ]} />
            <p className="tk-para">
              It is {RETENTION_RATE} percent of the agreed price, not of the gain. That is why it
              is charged in full on a sale at a loss. The buyer pays it over on modelo{' '}
              {RETENTION_MODEL} within {RETENTION_MONTHS === 1 ? 'one month' : `${RETENTION_MONTHS} months`} of
              the transfer, and gives you the stamped copy. Ask for that copy at the notary. You
              cannot claim anything back without it.
            </p>
            {r.outcome === 'refund' && (
              <p className="tk-para">
                Nothing repays this on its own. The refund exists only once you file your own
                return inside the window below, and it is paid to a bank account in your name.
              </p>
            )}
            <SourceNote ids="irnr.sale.retention" />
          </Panel>

          <Panel title="What actually reaches you on the day">
            <Rows items={[
              { label: 'Sale price', value: euro(Number(a.soldPrice) || 0) },
              { label: 'Less agent commission', value: euro(-r.agentFee) },
              { label: `Less the ${RETENTION_RATE} percent retention`, value: euro(-r.retention) },
              { label: 'Less the estimated plusvalia', value: 'not known here' },
              { label: 'Before plusvalia and your own costs', value: euro(r.netBeforePlusvalia), strong: true },
            ]} />
            <p className="tk-para">
              That figure is before the municipal tax below, and before your own legal costs and
              anything still owed on a mortgage.
              {r.outcome === 'refund'
                ? ` The ${euro(r.refund)} you are owed does not come back on the day. It arrives separately, and only once you have filed for it.`
                : r.outcome === 'balance'
                  ? ` The balance of ${euro(r.balanceDue)} falls due with your own return, so keep it aside rather than moving it all home.`
                  : ''}
            </p>
            <SourceNote ids="irnr.sale.retention" />
          </Panel>

          <Panel title="Plusvalia, the one nobody budgets for" kind="dark">
            <p className="tk-para">
              Plusvalia municipal is a separate tax, charged by the town hall on the increase in
              the value of the land. Where the seller is non-resident the buyer becomes sustituto
              del contribuyente, meaning the council can pursue the buyer for it.
            </p>
            <p className="tk-para">
              What follows from that is market practice rather than a rule of law, and it is the
              part that catches sellers out. Because the buyer carries the risk, buyers and their
              lawyers routinely retain an estimate of the plusvalia out of the price at
              completion, on top of the {RETENTION_RATE} percent. Expect both deductions at the
              notary and ask for the figure in writing before the day.
            </p>
            <p className="tk-para">
              This tool does not put a number on it, and you should distrust any that does
              without asking your postcode. The coefficients, the rate, and whether the town hall
              works by declaration or self-assessment are all set by local ordinance. The base is
              the cadastral value of the LAND only, not the total cadastral value on your IBI
              receipt. Ring the ayuntamiento for the property, or ask your gestor to, and get the
              estimate before you sign.
            </p>
            <p className="tk-para">
              Two things worth knowing. Where there was no increase in value there is no
              liability, but the transfer still has to be declared with both deeds attached. And
              where the actual increase is lower than the objective calculation, you can ask for
              the lower figure, with evidence of what you paid and what you sold for.
            </p>
            <SourceNote ids={['plusvalia.non_resident_seller', 'plusvalia.municipal_variation', 'plusvalia.no_gain']} />
          </Panel>

          {r.dates && (
            <Panel title="Your dates" kind="quiet">
              <Rows items={[
                { label: 'Completion', value: fmt(r.dates.completion) },
                { label: `Buyer files modelo ${RETENTION_MODEL} by`, value: fmt(r.dates.buyer211Due) },
                { label: 'Plusvalia, at the earliest', value: fmt(r.dates.plusvaliaEarliest) },
                { label: 'Your own return opens', value: fmt(r.dates.sellerWindowOpens) },
                { label: 'Your own return closes', value: fmt(r.dates.sellerWindowCloses), strong: true },
              ]} />
              <p className="tk-para">
                Your window opens {OPENS_MONTHS === 1 ? 'one month' : `${OPENS_MONTHS} months`} after
                the transfer and closes {OPENS_MONTHS + WINDOW_MONTHS} months after it. You cannot
                file early, which surprises sellers who want it finished before they fly home, and
                the whole of the first month is dead time. Put the closing date in a calendar now.
              </p>
              <p className="tk-para">
                The plusvalia date is {PLUSVALIA_DAYS} working days from the deed. Saturdays and
                Sundays do not count, and August does count for this tax. The date above excludes
                weekends only, so national, regional and local holidays push it later. Treat it as
                the earliest it can fall, and confirm the real one with the ayuntamiento.
              </p>
              <SourceNote ids={['deadline.210.sale', 'irnr.sale.retention', 'plusvalia.deadlines']} />
            </Panel>
          )}

          <Panel title="What this figure does not include" kind="quiet">
            <p className="tk-para">
              If the property was ever let, the depreciation you deducted against that rental
              income comes off the acquisition value, which raises the gain. This tool cannot know
              that figure, so the gain above is the version before that adjustment. Take your
              filed returns to your gestor rather than guessing at it.
            </p>
            <p className="tk-para">
              Properties bought before the end of 1994 have a transitional regime that can reduce
              the gain, and this tool does not apply it. Improvements you paid for, as opposed to
              repairs, also add to the acquisition value and are not in the figures above.
            </p>
            <p className="tk-para">
              {euEea
                ? 'One more thing for the same year. Being resident in an EU or EEA state means your letting costs were deductible against rental income and your rate on that income was the lower one. Neither affects the gain above, but both affect the final return you file for the year you sell.'
                : 'One more thing for the same year. Outside the EU and EEA, rental income is taxed on the gross rent with no deduction for costs, at the higher of the two rates. That does not change the gain above, but it does change the final return you file for the year you sell.'}
            </p>
            <SourceNote ids={['irnr.sale.gain_base', 'irnr.rates', 'irnr.rental.deductibility']} />
          </Panel>

          <ToolDisclaimer />
        </Result>
      )}
    </ToolShell>
  );
}
