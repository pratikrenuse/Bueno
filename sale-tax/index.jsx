import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, NumberField, DateField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import { useLocale } from '../i18n.jsx';
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

// Number and date formatting follow the page language.
const INTL = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };

export default function SaleTax() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const intl = INTL[locale] || INTL.en;
  // Copy lookup with {placeholder} substitution.
  const f = (k, vars = {}) => String(c(k)).replace(/\{(\w+)\}/g, (m, n) => (n in vars ? vars[n] : m));

  function euro(n) {
    if (!Number.isFinite(n)) return '';
    const abs = Math.abs(n);
    const s = abs.toLocaleString(intl, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return f(n < 0 ? 'euro_neg' : 'euro', { n: s });
  }

  function fmt(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(intl, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

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
  const rate = { rate: RETENTION_RATE };
  const src = c('source');

  const headline = r.outcome === 'refund'
    ? f('head_refund', { amount: euro(r.refund) })
    : r.outcome === 'balance'
      ? f('head_balance', { amount: euro(r.balanceDue) })
      : c('head_square');

  const sub = r.isLoss
    ? f('sub_loss', rate)
    : r.outcome === 'refund'
      ? f('sub_refund', rate)
      : f('sub_balance', rate);

  const tone = r.outcome === 'refund' ? 'good' : 'neutral';

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note={c('note')}>

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
          onNext={() => setStep('sold')} nextDisabled={!(Number(a.boughtPrice) > 0)} nextLabel={c('next')}>
          <NumberField label={c('bought_price')} value={a.boughtPrice} prefix="EUR" min={0}
            onChange={v => set('boughtPrice', v)} />
          <NumberField label={c('bought_costs')} value={a.boughtCosts} prefix="EUR" min={0}
            hint={c('bought_costs_hint')} onChange={v => set('boughtCosts', v)} />
          <SourceNote ids="irnr.sale.gain_base" label={c('src_acquisition')} />
        </Step>
      )}

      {step === 'sold' && (
        <Step n={3} of={4} question={c('q_sold')} hint={c('q_sold_hint')} onBack={back}
          onNext={() => setStep('completion')} nextDisabled={!(Number(a.soldPrice) > 0)} nextLabel={c('next')}>
          <NumberField label={c('sold_price')} value={a.soldPrice} prefix="EUR" min={0}
            onChange={v => set('soldPrice', v)} />
          <NumberField label={c('sold_agent')} value={a.agentPct} suffix="%" min={0} max={20}
            hint={c('sold_agent_hint')} onChange={v => set('agentPct', v)} />
          <SourceNote ids="irnr.sale.gain_base" label={c('src_transfer')} />
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

          <Panel title={c('gain_title')} kind="key">
            <Rows items={[
              { label: c('row_sale'), value: euro(Number(a.soldPrice) || 0) },
              { label: c('row_less_agent'), value: euro(-r.agentFee) },
              { label: c('row_transfer'), value: euro(r.transferValue) },
              { label: c('row_purchase'), value: euro(Number(a.boughtPrice) || 0) },
              { label: c('row_plus_costs'), value: euro(Number(a.boughtCosts) || 0) },
              { label: c('row_acquisition'), value: euro(r.acquisitionValue) },
              { label: r.isLoss ? c('row_loss') : c('row_gain'), value: euro(r.gain), strong: true },
              { label: f('row_cgt', { rate: CGT_RATE }), value: euro(r.taxDue), strong: true },
            ]} />
            <p className="tk-para">
              {f('gain_p', { rate: CGT_RATE, eu: RATES.value.imputed.eu_eea, other: RATES.value.imputed.other })}
            </p>
            <SourceNote ids={['irnr.rates', 'irnr.sale.gain_base']} label={src} />
          </Panel>

          <Panel title={f('ret_title', rate)}>
            <Rows items={[
              { label: f('row_ret', rate), value: euro(r.retention), strong: true },
              { label: c('row_tax_gain'), value: euro(r.taxDue) },
              r.outcome === 'refund'
                ? { label: c('row_refund'), value: euro(r.refund), strong: true }
                : r.outcome === 'balance'
                  ? { label: c('row_balance'), value: euro(r.balanceDue), strong: true }
                  : { label: c('row_diff'), value: euro(0) },
            ]} />
            <p className="tk-para">
              {f('ret_p', {
                rate: RETENTION_RATE,
                model: RETENTION_MODEL,
                within: RETENTION_MONTHS === 1 ? c('within_one') : f('within_n', { n: RETENTION_MONTHS }),
              })}
            </p>
            {r.outcome === 'refund' && <p className="tk-para">{c('ret_refund_p')}</p>}
            <SourceNote ids="irnr.sale.retention" label={src} />
          </Panel>

          <Panel title={c('day_title')}>
            <Rows items={[
              { label: c('row_sale'), value: euro(Number(a.soldPrice) || 0) },
              { label: c('row_less_agent'), value: euro(-r.agentFee) },
              { label: f('row_less_ret', rate), value: euro(-r.retention) },
              { label: c('row_less_plusvalia'), value: c('not_known') },
              { label: c('row_before'), value: euro(r.netBeforePlusvalia), strong: true },
            ]} />
            <p className="tk-para">
              {c('day_p')}
              {r.outcome === 'refund'
                ? ` ${f('day_p_refund', { amount: euro(r.refund) })}`
                : r.outcome === 'balance'
                  ? ` ${f('day_p_balance', { amount: euro(r.balanceDue) })}`
                  : ''}
            </p>
            <SourceNote ids="irnr.sale.retention" label={src} />
          </Panel>

          <Panel title={c('plus_title')} kind="dark">
            <p className="tk-para">{c('plus_p1')}</p>
            <p className="tk-para">{f('plus_p2', rate)}</p>
            <p className="tk-para">{c('plus_p3')}</p>
            <p className="tk-para">{c('plus_p4')}</p>
            <SourceNote ids={['plusvalia.non_resident_seller', 'plusvalia.municipal_variation', 'plusvalia.no_gain']} label={src} />
          </Panel>

          {r.dates && (
            <Panel title={c('dates_title')} kind="quiet">
              <Rows items={[
                { label: c('row_completion'), value: fmt(r.dates.completion) },
                { label: f('row_buyer_files', { model: RETENTION_MODEL }), value: fmt(r.dates.buyer211Due) },
                { label: c('row_plusvalia_earliest'), value: fmt(r.dates.plusvaliaEarliest) },
                { label: c('row_opens'), value: fmt(r.dates.sellerWindowOpens) },
                { label: c('row_closes'), value: fmt(r.dates.sellerWindowCloses), strong: true },
              ]} />
              <p className="tk-para">
                {f('dates_p1', {
                  opens: OPENS_MONTHS === 1 ? c('months_one') : f('months_n', { n: OPENS_MONTHS }),
                  closes: OPENS_MONTHS + WINDOW_MONTHS,
                })}
              </p>
              <p className="tk-para">{f('dates_p2', { days: PLUSVALIA_DAYS })}</p>
              <SourceNote ids={['deadline.210.sale', 'irnr.sale.retention', 'plusvalia.deadlines']} label={src} />
            </Panel>
          )}

          <Panel title={c('notinc_title')} kind="quiet">
            <p className="tk-para">{c('notinc_p1')}</p>
            <p className="tk-para">{c('notinc_p2')}</p>
            <p className="tk-para">{euEea ? c('notinc_eu') : c('notinc_other')}</p>
            <SourceNote ids={['irnr.sale.gain_base', 'irnr.rates', 'irnr.rental.deductibility']} label={src} />
          </Panel>

          <ToolDisclaimer>{c('disclaimer')}</ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
