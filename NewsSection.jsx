import { useEffect, useState } from 'react';
import { useT, useLocale } from './i18n.jsx';
import { whatsappChannel } from './whatsapp.js';
import { WaIcon } from './WhatsAppFollow.jsx';

// The news section on the home page, in the reader's language.
//
// The stories come from api/_news_site.js: the property news that matters to owners and
// buyers, a headline and a few sentences each, written once per language. New ones come in
// every weekday, so the section says so and shows when it was last updated. Anyone who wants
// each story as it comes in is pointed to the WhatsApp channel, which carries the same news.
// If the call fails or nothing is ready, the section is simply not shown, so the home page
// never carries an empty box or an error.

const DATE_LOCALE = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };

export function formatDate(iso, locale) {
  try {
    const d = new Date(`${iso}T12:00:00Z`);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(DATE_LOCALE[locale] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
  } catch { return ''; }
}

export default function NewsSection() {
  const t = useT();
  const { locale } = useLocale();
  const [data, setData] = useState({ stories: [], updated: null });

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await fetch(`/api/news?action=public&lang=${encodeURIComponent(locale)}`);
        const text = await r.text();
        let j = {};
        try { j = JSON.parse(text); } catch { j = {}; }
        if (live && r.ok && Array.isArray(j.stories)) setData({ stories: j.stories, updated: j.updated || null });
      } catch { /* no section rather than a broken one */ }
    })();
    return () => { live = false; };
  }, [locale]);

  const { stories, updated } = data;
  if (!stories.length) return null;
  const updatedOn = updated ? formatDate(updated, locale) : '';

  return (
    <section className="h7-news" id="news" aria-labelledby="h7-news-title">
      <div className="h7-wrap">
        <div className="h7-news-top">
          <div className="h7-head">
            <h2 id="h7-news-title">{t('home2.news_title')}</h2>
            <p>{t('home2.news_sub')}</p>
          </div>
          <div className="h7-news-live" role="status">
            <span className="h7-news-dot" aria-hidden="true" />
            <div>
              <p className="h7-news-live-a">{t('home2.news_live')}</p>
              {updatedOn && <p className="h7-news-live-b">{t('home2.news_updated').replace('{date}', updatedOn)}</p>}
            </div>
          </div>
        </div>
        <div className="h7-news-grid">
          {stories.map((s) => (
            <article key={s.id} className="h7-news-item" lang={locale}>
              <time dateTime={s.date}>{formatDate(s.date, locale)}</time>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {s.proposal && <p className="h7-news-flag">{t('home2.news_proposal')}</p>}
            </article>
          ))}
        </div>
        <div className="h7-news-follow">
          <p>{t('home2.news_follow')}</p>
          <a className="h7-btn h7-btn-navy" href={whatsappChannel(locale)} target="_blank" rel="noopener">
            <WaIcon className="h7-wa-ico" /> {t('home2.comm_chan_cta')}
          </a>
        </div>
      </div>
    </section>
  );
}
