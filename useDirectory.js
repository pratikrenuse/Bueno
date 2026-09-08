import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocale } from './i18n.jsx';
import { LOCALITIES, LOCALITY_BY_SLUG, REGIONS } from './spain-directory/localities.js';
import { SUPPORTED_PREF_LANGS, defaultPrefLang, rankForLanguage } from './directory-ranking.js';

// Re-exported so a page can import everything directory related from one place.
export { SUPPORTED_PREF_LANGS, defaultPrefLang, evidenceFor, rankForLanguage } from './directory-ranking.js';

// Everything the two directories share: the town list, the fetch, the URL round trip,
// the language preference and the re-ranking that follows from it.
//
// The two pages used to share a whole component, which kept the ranking and the Google
// attribution rules in one place but made a plumber page and a lawyer page look like the
// same page. They are not the same job. A burst pipe is an emergency and you want a phone
// number; choosing a lawyer is a decision and you want to compare. So the logic stays
// shared here and the presentation splits.
//
// PERSONALISATION, AND WHY IT IS THE POINT
// A Norwegian owner does not want the best rated electrician in Alicante. They want one
// where somebody has already been helped in a language they speak. The API now returns,
// per business, which languages its reviews were written in and what those reviews said
// about language, remote owners, updates, paperwork and access. This hook turns that into
// an order and a set of labels. It never turns it into a claim: see api/_fit.js.

export function useDirectory({ bySlug, defaultCategory, path }) {
  const { locale } = useLocale();
  const [params, setParams] = useSearchParams();

  const urlTown = params.get('town') || '';
  const urlTrade = params.get('trade') || '';
  const urlLang = params.get('lang') || '';
  const deepLinked = !!(LOCALITY_BY_SLUG[urlTown] && bySlug[urlTrade]);

  const [town, setTown] = useState(LOCALITY_BY_SLUG[urlTown] ? urlTown : '');
  const [trade, setTrade] = useState(bySlug[urlTrade] ? urlTrade : defaultCategory);
  const [prefLang, setPrefLang] = useState(
    SUPPORTED_PREF_LANGS.includes(urlLang) ? urlLang : defaultPrefLang(locale)
  );
  const [picking, setPicking] = useState(!deepLinked);
  const [shown, setShown] = useState(null);
  const [state, setState] = useState('idle');
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');

  const grouped = useMemo(() => {
    const out = [];
    for (const [key, label] of Object.entries(REGIONS)) {
      const items = LOCALITIES.filter(l => l.region === key).sort((a, b) => a.name.localeCompare(b.name));
      if (items.length) out.push({ key, label, items });
    }
    return out;
  }, []);

  useEffect(() => {
    if (deepLinked) run(urlTown, urlTrade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function writeUrl(t, c, l) {
    const next = { town: t, trade: c };
    // Only carry the language in the URL once the visitor has actually chosen one, so a
    // shared link does not silently impose the sharer's language on whoever opens it.
    if (l && l !== defaultPrefLang(locale)) next.lang = l;
    setParams(next, { replace: true });
  }

  async function run(townSlug, tradeSlug, lang = prefLang) {
    if (!townSlug) return;
    setState('loading');
    setMessage('');
    setProviders([]);
    setShown({ town: townSlug, trade: tradeSlug });
    setPicking(false);
    writeUrl(townSlug, tradeSlug, lang);
    try {
      const r = await fetch(`/api/directory?locality=${encodeURIComponent(townSlug)}&category=${encodeURIComponent(tradeSlug)}`);
      const raw = await r.text();
      let data;
      try { data = JSON.parse(raw); }
      catch { throw new Error(`Could not read the reply from the directory (${r.status})`); }
      if (!r.ok) {
        setState('error');
        setMessage(data.message || data.error || `Something went wrong (${r.status})`);
        return;
      }
      setProviders(Array.isArray(data.providers) ? data.providers : []);
      setState('done');
    } catch (e) {
      setState('error');
      setMessage(String((e && e.message) || e));
    }
  }

  function choosePrefLang(next) {
    setPrefLang(next);
    if (shown) writeUrl(shown.town, shown.trade, next);
  }

  const ranked = useMemo(() => rankForLanguage(providers, prefLang), [providers, prefLang]);

  // How many of the results have any evidence in the visitor's language. This drives the
  // one honest sentence at the top of the results, which is the whole value proposition:
  // "Four of these nine have been reviewed by someone writing in Norwegian."
  const withEvidence = ranked.filter(r => r.ev && r.ev.kind !== 'mentioned').length;
  const withAnyEvidence = ranked.filter(r => r.ev).length;

  return {
    // selection
    town, setTown, trade, setTrade, picking, setPicking, grouped,
    // language preference
    prefLang, setPrefLang: choosePrefLang,
    // results
    run, state, providers, ranked, message, shown,
    shownTown: shown && LOCALITY_BY_SLUG[shown.town],
    shownTrade: shown && shown.trade,
    busy: state === 'loading',
    withEvidence, withAnyEvidence,
    total: ranked.length,
  };
}
