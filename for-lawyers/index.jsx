import { useEffect, useRef } from 'react';
import { LLink, useLocale } from '../i18n.jsx';
import { useCopy } from '../ToolShell.jsx';
import copy from './copy.js';
import { WHATSAPP_LAWYERS_URL } from '../whatsapp.js';
import { buenoHome } from '../SiteFooter.jsx';
import {
  WaIcon, WhatsAppBar, ProNav, ProFooter, useReveal, useSolidNav, useWaBar,
  useClientLinks, LangButtons, CopyButton,
} from '../ProShell.jsx';

// The lawyers' page, rebuilt October 2026. Calm and editorial: a large headline, a wide photo,
// a numbered index of the tools, the owner tools to send a client laid out like a document,
// a slim WhatsApp banner and the sponsor. Words in copy.js (six languages). Layout is
// deliberately different from the owners' home page and the estate agents' page.

const IMG = (f) => `/images/pro/${f}`;
const TOOLS = [
  ['i1', '/deal-checklist', 'away.jpg'],
  ['i2', '/poa-planner', 'repairs.jpg'],
  ['i3', '/inheritance-roadmap', 'bay.jpg'],
  ['i4', '/purchase-costs', 'costs.jpg'],
];
const SHARE = ['tax-calculator', 'rental-tax', 'late-surcharge', 'day-counter', 'your-rights', 'storm-claim'];

export default function ForLawyers() {
  const c = useCopy(copy);
  const { locale } = useLocale();
  const rootRef = useRef(null);
  const parRef = useRef(null);
  const [bar, closeBar] = useWaBar();
  const solid = useSolidNav();
  const links = useClientLinks();
  useReveal(rootRef);

  useEffect(() => { document.title = 'Spain 24/7 | For lawyers in Spain'; }, []);

  // The wide photo drifts a little as the page scrolls.
  useEffect(() => {
    const img = parRef.current;
    if (!img || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    const on = () => {
      const r = img.parentElement.getBoundingClientRect();
      img.style.transform = `translateY(${Math.max(-120, Math.min(0, r.top * -0.15 - 60))}px)`;
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const jump = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`p7 lw7${bar ? ' p7-bar-on' : ''}`} ref={rootRef}>
      {bar && <WhatsAppBar c={c} url={WHATSAPP_LAWYERS_URL} onClose={closeBar} />}
      <ProNav current="lawyers" c={c} solid={solid} />

      <main>
        <section className="lw7-hero">
          <div className="p7-wrap">
            <h1 className="p7-load d1">{c('h1')} <em>{c('em')}</em></h1>
            <div className="lw7-row">
              <p className="lw7-lead p7-load d2">{c('lead')}</p>
              <div className="lw7-ctas p7-load d3">
                <a className="p7-btn p7-btn-navy" href="#tools" onClick={jump('tools')}>{c('cta_tools')} <span className="p7-arr">&#8594;</span></a>
                <a className="p7-btn p7-btn-line" href="#whatsapp" onClick={jump('whatsapp')}>{c('cta_wa')}</a>
              </div>
            </div>
            <div className="lw7-band p7-load d4">
              <img ref={parRef} src={IMG('bay_hero.jpg')} alt="Tiled roofs above a bay on the Spanish coast" />
              <div className="lw7-note"><b>{c('note_t')}</b><span>{c('note_d')}</span></div>
            </div>
          </div>
        </section>

        <section className="lw7-index" id="tools">
          <div className="p7-wrap">
            <div className="lw7-head p7-rv">
              <h2>{c('idx_t')} <em>{c('idx_em')}</em></h2>
              <p>{c('idx_d')}</p>
            </div>
            <div>
              {TOOLS.map(([k, to, img], i) => (
                <LLink key={k} to={to} className="lw7-irow p7-rv">
                  <span className="lw7-n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{c(`${k}_t`)}</h3>
                  <p>{c(`${k}_d`)}</p>
                  <span className="lw7-go" aria-hidden="true">&#8594;</span>
                  <span className="lw7-peek" aria-hidden="true"><img src={IMG(img)} alt="" loading="lazy" /></span>
                </LLink>
              ))}
            </div>
          </div>
        </section>

        <section className="lw7-share" id="share">
          <div className="p7-wrap">
            <div className="p7-rv">
              <h2>{c('share_t')} <em>{c('share_em')}</em></h2>
              <p>{c('share_d')}</p>
              <LangButtons lang={links.lang} setLang={links.setLang} label={c('lang_label')} className="lw7-langs" />
            </div>
            <div className="lw7-paper p7-rv s1">
              {SHARE.map(slug => (
                <div key={slug} className="lw7-prow">
                  <a href={links.url(slug)} target="_blank" rel="noopener">{links.name(slug)}</a>
                  <CopyButton text={links.url(slug)} label={c('copy')} done={c('copied')} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lw7-wa" id="whatsapp">
          <div className="p7-wrap">
            <div className="lw7-wa-band p7-rv">
              <div><h3>{c('wa_t')}</h3><p>{c('wa_d')}</p></div>
              <a className="p7-btn p7-btn-light" href={WHATSAPP_LAWYERS_URL} target="_blank" rel="noopener"><WaIcon /> {c('wa_cta')}</a>
            </div>
          </div>
        </section>

        <section className="lw7-partner" id="partner">
          <div className="p7-wrap">
            <div className="p7-rv">
              <img className="lw7-logo" src={IMG('bueno-logo-navy.png')} alt="Bueno" />
              <h2>{c('p_t')} <em>{c('p_em')}</em></h2>
              <p>{c('p_d')}</p>
              <a className="p7-btn p7-btn-primary" href={buenoHome(locale)} target="_blank" rel="noopener">{c('p_cta')} <span className="p7-arr">&#8594;</span></a>
              <p className="lw7-fine">{c('p_fine')}</p>
            </div>
            <div className="lw7-pic p7-rv s1"><img src="/images/home/couple.jpg" alt="" loading="lazy" /></div>
          </div>
        </section>
      </main>

      <ProFooter c={c} />
    </div>
  );
}
