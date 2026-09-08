import { useT, useLocale } from './i18n.jsx';

// Everything Google's terms require on a page that shows Places content, in one file.
//
// The two directories now look nothing like each other, which is the point. What must NOT
// diverge is this: the attribution, the per-review author and link, the statement of how
// results were ordered and filtered, and our own line about what the page is not. Putting
// them here means a redesign of either page cannot quietly drop one of them.
//
// Do not inline any of this into a page. Do not "simplify" a review card by removing the
// author photo, the profile link or the link to the review. See DIRECTORY_RUNBOOK.md,
// "What must not be removed".

export function langName(code, locale) {
  try { return new Intl.DisplayNames([locale], { type: 'language' }).of(code); }
  catch { return String(code || '').toUpperCase(); }
}

export const STARS = (rating) => {
  const full = Math.round(Number(rating) || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
};

// One quoted review, with the four things Google requires: the reviewer's name, their
// photo, a link to their profile, and a link to the review itself. The date is the link
// to the review, because a separate "read this on Google Maps" line was six words of
// chrome under every fifteen words of content.
export function Review({ rv, variant = 'default' }) {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  return (
    <div className={`dir-quote dir-quote-${variant}`}>
      <div className="dir-quote-head">
        {rv.author_photo && <img src={rv.author_photo} alt="" loading="lazy" />}
        {rv.author_uri
          ? <a className="dir-quote-who" href={rv.author_uri} target="_blank" rel="noopener noreferrer">{rv.author}</a>
          : <span className="dir-quote-who">{rv.author}</span>}
        {rv.uri
          ? <a className="dir-quote-when" href={rv.uri} target="_blank" rel="noopener noreferrer"
              title={tt('read_on_google')} aria-label={tt('read_on_google')}>{rv.relative}</a>
          : <span className="dir-quote-when">{rv.relative}</span>}
      </div>
      <p className="dir-quote-text">{rv.text}</p>
    </div>
  );
}

// The attribution line. Required, and it may not be styled into invisibility.
export function Attribution({ className = 'dir-attrib' }) {
  const t = useT();
  return <p className={className}>{t('calc_directory.powered_by')} Google Maps</p>;
}

// How results were ordered and filtered, plus our own honesty note. Google requires the
// first part. The second part is ours, and it stays because we have not met any of these
// businesses and the page should say so.
export function Method({ extraNote, open = false }) {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  return (
    <>
      <p className="dir-more-title">{tt('method_title')}</p>
      <Attribution />
      <details className="dir-more" open={open}>
        <summary>{tt('how_summary')}</summary>
        <div className="dir-more-body">
          <p>{tt('method_1')}</p>
          <p>{tt('method_2')}</p>
          <p>{tt('method_3')}</p>
          <p>{tt('method_lang')}</p>
          <p><strong>{tt('honest_title')}</strong> {tt('honest_1')}</p>
          <p>{tt('honest_2')}</p>
          <p>{tt('honest_lang')}</p>
          {extraNote && <p><strong>{tt(extraNote)}</strong></p>}
        </div>
      </details>
    </>
  );
}

// The link to the business on Google Maps. Required wherever we show its details.
export function OnGoogle({ uri }) {
  const t = useT();
  if (!uri) return null;
  return (
    <a href={uri} target="_blank" rel="noopener noreferrer">{t('calc_directory.on_google')}</a>
  );
}

// A language evidence label.
//
// THE MOST IMPORTANT COMPONENT ON EITHER PAGE, because it is the one that could turn
// evidence into a claim. It renders "reviewed in Norwegian", never "speaks Norwegian".
// A business that has been reviewed in a language has served a customer who writes it.
// That is all we know and all this may ever say.
export function LanguageEvidence({ evidence, want, compact = false }) {
  const t = useT();
  const { locale } = useLocale();
  const tt = (k) => t(`calc_directory.${k}`);
  if (!evidence) {
    return compact ? null : (
      <span className="dir-lang dir-lang-none" title={tt('lang_none_help')}>{tt('lang_none')}</span>
    );
  }
  const name = langName(want, locale);
  if (evidence.kind === 'reviewed_in') {
    return (
      <span className="dir-lang dir-lang-strong">
        {tt(evidence.count === 1 ? 'lang_reviewed_one' : 'lang_reviewed_many')
          .replace('{n}', evidence.count).replace('{lang}', name)}
      </span>
    );
  }
  if (evidence.kind === 'reviewed_in_english') {
    return (
      <span className="dir-lang dir-lang-mid">
        {tt(evidence.count === 1 ? 'lang_english_one' : 'lang_english_many')
          .replace('{n}', evidence.count)}
      </span>
    );
  }
  return <span className="dir-lang dir-lang-weak">{tt('lang_mentioned')}</span>;
}

// The other fit signals, as evidence with the quote behind them. Same rule: a reviewer
// mentioned this, the business did not tell us.
const FIT_ORDER = ['remote', 'updates', 'paperwork', 'access'];

export function FitSignals({ evidence, limit = 3 }) {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  if (!evidence) return null;
  const found = FIT_ORDER.filter(k => evidence[k]).slice(0, limit);
  if (!found.length) return null;
  return (
    <ul className="dir-fit">
      {found.map(k => (
        <li key={k} className="dir-fit-item">
          <span className="dir-fit-label">{tt(`fit_${k}`)}</span>
          <span className="dir-fit-quote">{evidence[k].quote}</span>
        </li>
      ))}
    </ul>
  );
}
