import { useMemo, useState } from 'react';
import LangSwitcher from '../LangSwitcher.jsx';
import SiteNav from '../SiteNav.jsx';
import SiteFooter from '../SiteFooter.jsx';
import { useCopy } from '../ToolShell.jsx';
import { rule, ruleStatus, RULES } from '../rules/index.js';
import { SITUATIONS, COVER_CHAPTER } from './situations.js';
import copy from './copy.js';
import metaDefault from './meta.js';

// Spain 24/7: where you stand.
//
// THE JOB THIS PAGE DOES
// Something has gone wrong with a property the owner does not live next to, and they are
// about to do one of two expensive things: leave it too long, or pay a lawyer privately
// for a case their own insurance would have funded.
//
// So the page answers exactly two questions and refuses every other one.
//   1. How long have I got, and from when does that count.
//   2. Am I already covered, and what do I say to find out.
//
// WHAT IT IS NOT
// It is not advice, it does not tell anyone whether they will win, and it never says
// "you are covered". It says: this is the clock, these are the words to look for in your
// own document, this is what to ask. Every period comes from the rules base with its
// article and its source. Nothing is written into this component.
//
// LANGUAGE
// Not one reader-facing string lives in this file. The rules base stays in one language
// because it is the audited record; the sentence the reader sees comes from copy.js keyed
// by rule id, and the period badge and the article link are injected from the rule. A
// figure can therefore only come from a verified rule, while the words around it read
// naturally in all six languages.
//
// The four steps of the result are deliberate: the clock first because it is the thing
// that expires, then the cover because it is the thing nobody checks, then the evidence
// because it disappears, then the people, because by then the owner knows what to ask for.

export const meta = metaDefault;

const GOLD = '#C9A96E';

// useCopy returns the path itself when a key is absent, which is the right behaviour for a
// missing translation but the wrong one for an optional field. Most rules carry no caveat,
// so a lookup that came back as its own key means "nothing to show", not "show the key".
const opt = (c, path) => {
  const v = c(path);
  return v === path ? null : v;
};

// Rule ids contain dots and the copy resolver reads dots as nesting, so the rule map is
// keyed with underscores. One place to convert, so an id is never hand-flattened at a call
// site and a typo cannot silently fall through to the key.
const rkey = (id) => `rule.${String(id).replace(/\./g, '_')}`;

// A rule the page can show. Unverified rules never reach here: ruleStatus lets the page
// skip one gracefully rather than throwing mid render.
function useRule(id) {
  return useMemo(() => {
    const st = ruleStatus(id);
    if (st === 'verified' || st === 'partial') {
      try { return rule(id); } catch { return null; }
    }
    // An annulled rule is shown as a warning that a route people still believe in is
    // gone. rule() refuses to hand it over, correctly, so it is read straight from the
    // index and rendered struck through with no value attached.
    if (st === 'annulled') return RULES[id] || null;
    return null;
  }, [id]);
}

const SINGULAR = { years: 'year', months: 'month', days: 'day' };

function unitWord(c, unit, n) {
  if (!unit) return '';
  const key = n === 1 ? (SINGULAR[unit] || unit) : unit;
  const w = c(`units.${key}`);
  return w === `units.${key}` ? unit : w;
}

// A bare number tells the reader nothing, and one of these rules counts calendar years
// inside a compound value that has no unit of its own. Where there is no unit there is no
// badge, and the statement carries the meaning instead.
const numUnit = (c, n, unit) => (unit ? `${n} ${unitWord(c, unit, n)}`.trim() : null);

// A few rule values carry their unit inside the string, for example "3 months". Translate
// those rather than letting an English word through. An ISO date is left alone: it is
// unambiguous in every language and reformatting it would only invite a misread.
function fromString(c, v) {
  const m = /^(\d+)\s+(year|years|month|months|day|days)$/.exec(v);
  if (!m) return v;
  const n = Number(m[1]);
  const unit = m[2].endsWith('s') ? m[2] : `${m[2]}s`;
  return numUnit(c, n, unit);
}

function periodLabel(r, c) {
  if (r.value == null || r.status === 'annulled') return null;
  if (typeof r.value === 'number') return numUnit(c, r.value, r.unit);
  if (typeof r.value === 'string') return fromString(c, r.value);
  if (Array.isArray(r.value)) return null;
  // Several rules carry more than one period, for example three months on one ground and
  // a year on another. Show them all rather than dropping the badge. If any one part comes
  // back unlabelled the whole badge goes, because a half legible badge is worse than none.
  if (typeof r.value === 'object') {
    const parts = Object.values(r.value)
      .filter(v => typeof v === 'number' || typeof v === 'string')
      .map(v => (typeof v === 'number' ? numUnit(c, v, r.unit) : fromString(c, v)));
    if (!parts.length || parts.some(x => !x)) return null;
    return parts.join(' / ');
  }
  return null;
}

function Clock({ id }) {
  const c = useCopy(copy);
  const r = useRule(id);
  if (!r) return null;
  const period = periodLabel(r, c);
  const note = opt(c, `${rkey(id)}.n`);
  return (
    <li className="yr-rule">
      {period && <span className="yr-period">{period}</span>}
      <span className="yr-rule-body">
        <span className="yr-statement">{c(`${rkey(id)}.s`)}</span>
        {r.status === 'partial' && note && <em className="yr-caveat">{note}</em>}
        {r.status === 'annulled' && <em className="yr-caveat">{c('goneLabel')} {note}</em>}
        <a className="yr-src" href={r.source.url} target="_blank" rel="noopener noreferrer">
          {r.source.ref}
        </a>
      </span>
    </li>
  );
}

export default function YourRights() {
  const c = useCopy(copy);
  const [picked, setPicked] = useState(null);
  const s = picked ? SITUATIONS.find(x => x.key === picked) : null;

  const freeChoice = useRule('cover.free_choice');
  const separate = useRule('cover.separate_chapter');
  const mustState = useRule('cover.policy_must_state');
  const limitingForm = useRule('cover.limiting_clause_form');
  const arbitration = useRule('cover.arbitration_repealed');
  const complaint = useRule('cover.complaint_route');
  const terms = useRule('cover.search_terms');
  const catalonia = useRule('limit.catalonia');
  const interruption = useRule('limit.interruption');

  const chapter = s ? COVER_CHAPTER[s.cover] : null;
  const evidence = s ? c(`sit.${s.key}.evidence`) : null;

  return (
    <div className="yr">
      <header className="yr-head">
        <div className="yr-head-in">
          <a className="yr-brand" href="/">24<span style={{ color: GOLD }}>/</span>7 SPAIN</a>
          <SiteNav active="rights" />
          <LangSwitcher />
        </div>
      </header>

      <main className="yr-main">
        <h1>{c('h1')}</h1>
        <p className="yr-lede">{c('lede')}</p>
        <p className="yr-not">{c('notAdvice')}</p>

        <h2 className="yr-q">{c('q')}</h2>
        <div className="yr-picker">
          {SITUATIONS.map(x => (
            <button key={x.key}
              className={`yr-choice${picked === x.key ? ' current' : ''}`}
              aria-pressed={picked === x.key}
              onClick={() => setPicked(picked === x.key ? null : x.key)}>
              <b>{c(`sit.${x.key}.label`)}</b>
              <span>{c(`sit.${x.key}.lead`)}</span>
            </button>
          ))}
        </div>

        {s && (
          <section className="yr-result" aria-live="polite">
            <h2>{c(`sit.${s.key}.label`)}</h2>

            <div className="yr-step">
              <span className="yr-step-n">1</span>
              <div>
                <h3>{c('step1')}</h3>
                <ul className="yr-rules">
                  {s.clock.map(id => <Clock key={id} id={id} />)}
                </ul>
                <p className="yr-watch"><b>{c('watchLabel')}</b> {c(`sit.${s.key}.watch`)}</p>
                {interruption && (
                  <p className="yr-note">
                    {c(`${rkey('limit.interruption')}.s`)} {opt(c, `${rkey('limit.interruption')}.n`)}
                  </p>
                )}
                {catalonia && (
                  <p className="yr-note yr-warn">{c(`${rkey('limit.catalonia')}.s`)}</p>
                )}
              </div>
            </div>

            <div className="yr-step">
              <span className="yr-step-n">2</span>
              <div>
                <h3>{c('step2')}</h3>
                {chapter && (
                  <p className="yr-chapter">
                    {c('findPrefix')} <code>{chapter.find}</code>.
                    <span> {c(`chapter.${s.cover}.says`)}</span>
                  </p>
                )}
                <ul className="yr-facts">
                  {[separate, freeChoice, mustState, limitingForm, complaint].filter(Boolean).map(r => (
                    <li key={r.id}>
                      {c(`${rkey(r.id)}.s`)}
                      {r.status === 'partial' && opt(c, `${rkey(r.id)}.n`) && (
                        <em className="yr-caveat">{opt(c, `${rkey(r.id)}.n`)}</em>
                      )}
                      <a className="yr-src" href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.ref}</a>
                    </li>
                  ))}
                  {arbitration && (
                    <li className="yr-struck">
                      {c(`${rkey('cover.arbitration_repealed')}.s`)}
                      <a className="yr-src" href={arbitration.source.url} target="_blank" rel="noopener noreferrer">{arbitration.source.ref}</a>
                    </li>
                  )}
                </ul>
                {terms && Array.isArray(terms.value) && (
                  <>
                    <p className="yr-note">{c(`${rkey('cover.search_terms')}.s`)}</p>
                    <ul className="yr-terms">
                      {terms.value.map(w => <li key={w}><code>{w}</code></li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="yr-step">
              <span className="yr-step-n">3</span>
              <div>
                <h3>{c('step3')}</h3>
                <p className="yr-note">{c('gatherNote')}</p>
                <ul className="yr-eth">
                  {(Array.isArray(evidence) ? evidence : []).map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            </div>

            <div className="yr-step">
              <span className="yr-step-n">4</span>
              <div>
                <h3>{c('step4')}</h3>
                <p className="yr-note">{c('whoNote')}</p>
                <a className="yr-cta" href="/spain-professionals">{c('cta')}</a>
              </div>
            </div>
          </section>
        )}

        {!s && (
          <p className="yr-empty">{c('empty')}</p>
        )}
      </main>

      <SiteFooter note={c('footer')} />
    </div>
  );
}
