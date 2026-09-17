import { useState } from 'react';
import { useLocale, LLink, LOCALE_LABELS } from './i18n.jsx';
import ToolShell, { useCopy } from './ToolShell.jsx';
import AudienceSwitch from './AudienceSwitch.jsx';
import { BrandProfileEditor } from './BrandProfile.jsx';
import { TOOL_COPY, SITE_ORIGIN, localePath, LOCALES } from './seo/copy.js';

// The page every professional audience lands on. for-agents/ and for-lawyers/ are thin
// wrappers that pass their own words and their own list of tools; the layout lives here so
// a third audience is a copy file, not a new page.
//
// Two kinds of card:
//   own    a professional tool, branded with the visitor's details. Text from the hub copy.
//   share  an owner tool the professional sends to a client. Text comes from TOOL_COPY in
//          seo/copy.js, the same words the static page carries, so the card cannot drift
//          from the page it links to. The link is copied in the client's language.

const SHARED_UI = {
  en: { own: 'Branded with your details', share: 'Send to your client', open: 'Open', copy: 'Copy link', copied: 'Link copied', copy_fail: 'Select the link and copy it', client_lang: "Your client's language", share_hint: 'Links open in the language you pick. Your client does not need an account and nothing is shared with us.', supported: 'Supported by Bueno' },
  no: { own: 'Med dine detaljer', share: 'Send til kunden din', open: 'Åpne', copy: 'Kopier lenke', copied: 'Lenken er kopiert', copy_fail: 'Merk lenken og kopier den', client_lang: 'Kundens språk', share_hint: 'Lenkene åpnes på språket du velger. Kunden trenger ingen konto, og ingenting deles med oss.', supported: 'Støttet av Bueno' },
  sv: { own: 'Med dina uppgifter', share: 'Skicka till din kund', open: 'Öppna', copy: 'Kopiera länk', copied: 'Länken är kopierad', copy_fail: 'Markera länken och kopiera den', client_lang: 'Kundens språk', share_hint: 'Länkarna öppnas på det språk du väljer. Kunden behöver inget konto och ingenting delas med oss.', supported: 'Med stöd av Bueno' },
  de: { own: 'Mit Ihrem Briefkopf', share: 'An Ihren Kunden senden', open: 'Öffnen', copy: 'Link kopieren', copied: 'Link kopiert', copy_fail: 'Link markieren und kopieren', client_lang: 'Sprache Ihres Kunden', share_hint: 'Die Links öffnen sich in der gewählten Sprache. Ihr Kunde braucht kein Konto, und nichts wird mit uns geteilt.', supported: 'Unterstützt von Bueno' },
  fr: { own: 'À vos couleurs', share: 'À envoyer à votre client', open: 'Ouvrir', copy: 'Copier le lien', copied: 'Lien copié', copy_fail: 'Sélectionnez le lien et copiez-le', client_lang: 'Langue de votre client', share_hint: "Les liens s'ouvrent dans la langue choisie. Votre client n'a pas besoin de compte et rien ne nous est transmis.", supported: 'Avec le soutien de Bueno' },
  nl: { own: 'Met uw gegevens', share: 'Stuur naar uw klant', open: 'Openen', copy: 'Link kopiëren', copied: 'Link gekopieerd', copy_fail: 'Selecteer de link en kopieer hem', client_lang: 'Taal van uw klant', share_hint: 'De links openen in de taal die u kiest. Uw klant heeft geen account nodig en er wordt niets met ons gedeeld.', supported: 'Met steun van Bueno' },
};

function shareUrl(lang, path) {
  return SITE_ORIGIN + localePath(lang, path);
}

function ShareCard({ slug, clientLang, ui }) {
  const { locale } = useLocale();
  const copy = TOOL_COPY[slug]?.[locale] || TOOL_COPY[slug]?.en;
  const [state, setState] = useState('idle');
  if (!copy) return null;
  const path = `/${slug}`;
  const url = shareUrl(clientLang, path);

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState('done');
    } catch {
      setState('fail');
    }
    setTimeout(() => setState('idle'), 2500);
  };

  return (
    <article className="hub-card hub-card-share">
      <span className="hub-badge">{ui.share}</span>
      <h3 className="hub-card-title">{copy.h1}</h3>
      <p className="hub-card-desc">{copy.lead}</p>
      <div className="hub-card-actions">
        <button type="button" className="hub-btn" onClick={doCopy}>{ui.copy}</button>
        <LLink to={path} className="hub-link">{ui.open} &#8594;</LLink>
      </div>
      <p className="hub-card-status" role="status" aria-live="polite">
        {state === 'done' && ui.copied}
        {state === 'fail' && <>{ui.copy_fail}: <input className="hub-url" readOnly value={url} onFocus={e => e.target.select()} /></>}
      </p>
    </article>
  );
}

function OwnCard({ item, c, ui }) {
  return (
    <LLink to={item.path} className="hub-card hub-card-own">
      <span className="hub-badge gold">{ui.own}</span>
      <h3 className="hub-card-title">{c(`${item.key}_t`)}</h3>
      <p className="hub-card-desc">{c(`${item.key}_d`)}</p>
      <span className="hub-link">{c(`${item.key}_cta`)} &#8594;</span>
    </LLink>
  );
}

export default function AudienceHub({ audience, copy, sections, upcoming = [] }) {
  const c = useCopy(copy);
  const ui = useCopy(SHARED_UI);
  const uiObj = Object.fromEntries(Object.keys(SHARED_UI.en).map(k => [k, ui(k)]));
  const { locale } = useLocale();
  const [clientLang, setClientLang] = useState(locale);
  const hasShare = sections.some(s => s.items.some(i => i.share));

  return (
    <ToolShell title={c('h1')} note={c('note')}>
      <div className="hub">
        <AudienceSwitch current={audience} tone="light" />

        <header className="hub-hero">
          <p className="tk-eyebrow">{c('eyebrow')}</p>
          <h1 className="hub-h1">{c('h1')}</h1>
          <p className="hub-lead">{c('body')}</p>
          <div className="hub-supported">
            <img src="/images/bueno-logo-transparent.png" alt="Bueno" className="hub-supported-logo" />
            <div>
              <p className="hub-supported-title">{ui('supported')}</p>
              <p className="hub-supported-body">{c('bueno_body')}</p>
              <p className="hub-supported-body">{c('bueno_referral')}</p>
            </div>
          </div>
        </header>

        <BrandProfileEditor />

        {hasShare && (
          <div className="hub-langbar">
            <label className="hub-langbar-label" htmlFor="hub-client-lang">{ui('client_lang')}</label>
            <select id="hub-client-lang" className="dirfeat-select hub-select" value={clientLang}
              onChange={e => setClientLang(e.target.value)}>
              {LOCALES.map(l => <option key={l} value={l}>{LOCALE_LABELS[l]}</option>)}
            </select>
            <p className="hub-langbar-hint">{ui('share_hint')}</p>
          </div>
        )}

        {sections.map((s, i) => (
          <section key={s.key} className="hub-section" aria-labelledby={`hub-s-${s.key}`}>
            <div className="hub-section-head">
              <span className="hub-section-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 id={`hub-s-${s.key}`} className="hub-h2">{c(`s_${s.key}`)}</h2>
                <p className="hub-section-desc">{c(`s_${s.key}_d`)}</p>
              </div>
            </div>
            <div className="hub-grid">
              {s.items.map(item => item.share
                ? <ShareCard key={item.share} slug={item.share} clientLang={clientLang} ui={uiObj} />
                : <OwnCard key={item.key} item={item} c={c} ui={uiObj} />)}
            </div>
          </section>
        ))}

        {upcoming.length > 0 && (
          <section className="hub-section hub-upcoming" aria-labelledby="hub-upcoming">
            <h2 id="hub-upcoming" className="hub-h2">{c('upcoming_t')}</h2>
            <p className="hub-section-desc">{c('upcoming_d')}</p>
            <ul className="hub-upcoming-list">
              {upcoming.map(k => <li key={k}>{c(`up_${k}`)}</li>)}
            </ul>
          </section>
        )}
      </div>
    </ToolShell>
  );
}
