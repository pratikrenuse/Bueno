import { useEffect, useRef } from 'react';
import { LLink } from '../i18n.jsx';
import { useCopy } from '../ToolShell.jsx';
import copy from './copy.js';
import { WHATSAPP_AGENTS_URL, BUENO_PARTNER_URL } from '../whatsapp.js';
import {
  WaIcon, WhatsAppBar, ProNav, ProFooter, useReveal, useSolidNav, useWaBar,
  useClientLinks, LangButtons, CopyButton,
} from '../ProShell.jsx';

// The estate agents' page, rebuilt October 2026. It follows a sale from the listing to the
// keys: each stage holds the tools an agent needs at that moment. Then the owner tools to send
// a client, the agents' WhatsApp group, and the Bueno partnership. Words in copy.js (six
// languages). Layout is deliberately different from the owners' home page and the lawyers'.

const IMG = (f) => `/images/pro/${f}`;
const SHARE = ['sale-tax', 'day-counter', 'utility-setup', 'tax-calculator', 'rental-tax', 'closing-up'];

function Task({ c, k, to }) {
  return (
    <LLink to={to} className="ag7-task">
      <b>{c(`${k}_t`)}</b>
      <span>{c(`${k}_d`)}</span>
      <i>{c(`${k}_cta`)} &#8594;</i>
    </LLink>
  );
}

export default function ForAgents() {
  const c = useCopy(copy);
  const rootRef = useRef(null);
  const [bar, closeBar] = useWaBar();
  const solid = useSolidNav();
  const links = useClientLinks();
  useReveal(rootRef);

  useEffect(() => { document.title = 'Spain 24/7 | For estate agents in Spain'; }, []);

  const jump = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`p7 ag7${bar ? ' p7-bar-on' : ''}`} ref={rootRef}>
      {bar && <WhatsAppBar c={c} url={WHATSAPP_AGENTS_URL} onClose={closeBar} />}
      <ProNav current="agents" c={c} solid={solid} />

      <main>
        <section className="ag7-hero">
          <div className="p7-wrap">
            <div>
              <h1 className="p7-load d1">{c('h1')} <em>{c('em')}</em></h1>
              <p className="ag7-lead p7-load d2">{c('lead')}</p>
              <div className="ag7-ctas p7-load d3">
                <a className="p7-btn p7-btn-primary" href="#tools" onClick={jump('tools')}>{c('cta_tools')} <span className="p7-arr">&#8594;</span></a>
                <a className="p7-btn p7-btn-line" href="#whatsapp" onClick={jump('whatsapp')}>{c('cta_wa')}</a>
              </div>
            </div>
            <div className="ag7-photo p7-load d2">
              <div className="ag7-img"><img src={IMG('marina.jpg')} alt="Marina and white apartments on the Spanish coast" /></div>
              <div className="ag7-float f1"><span className="ag7-tick">&#10003;</span><div><b>{c('f1_t')}</b><span>{c('f1_b')}</span></div></div>
              <div className="ag7-float f2"><span className="ag7-tick">&#8364;</span><div><b>{c('f2_t')}</b><span>{c('f2_b')}</span></div></div>
            </div>
          </div>
        </section>

        <section className="ag7-flow" id="tools">
          <div className="p7-wrap">
            <div className="ag7-flow-head p7-rv">
              <h2>{c('flow_t')} <em>{c('flow_em')}</em></h2>
              <p>{c('flow_d')}</p>
            </div>
            <div className="ag7-track p7-watch p7-rv">
              <span className="ag7-fill" />
              <div className="ag7-stage"><div className="ag7-dot">1</div><h3>{c('st1')}</h3>
                <Task c={c} k="seller" to="/seller-pack" />
              </div>
              <div className="ag7-stage"><div className="ag7-dot">2</div><h3>{c('st2')}</h3>
                <Task c={c} k="costs" to="/purchase-costs" />
                <Task c={c} k="aml" to="/aml-file" />
              </div>
              <div className="ag7-stage"><div className="ag7-dot">3</div><h3>{c('st3')}</h3>
                <Task c={c} k="check" to="/deal-checklist" />
                <Task c={c} k="poa" to="/poa-planner" />
              </div>
              <div className="ag7-stage"><div className="ag7-dot">4</div><h3>{c('st4')}</h3>
                <a className="ag7-task" href="#share" onClick={jump('share')}>
                  <b>{c('after_t')}</b><span>{c('after_d')}</span><i>{c('after_cta')} &#8595;</i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="ag7-share" id="share">
          <div className="p7-wrap">
            <div className="ag7-share-top p7-rv">
              <h2>{c('share_t')} <em>{c('share_em')}</em></h2>
              <div>
                <p>{c('share_d')}</p>
                <LangButtons lang={links.lang} setLang={links.setLang} label={c('lang_label')} />
              </div>
            </div>
            <div className="ag7-chips p7-rv">
              {SHARE.map(slug => (
                <div key={slug} className="ag7-chip">
                  <a href={links.url(slug)} target="_blank" rel="noopener">{links.name(slug)}</a>
                  <CopyButton text={links.url(slug)} label={c('copy')} done={c('copied')} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ag7-wa" id="whatsapp">
          <div className="p7-wrap">
            <div className="p7-rv">
              <h2>{c('wa_t')} <em>{c('wa_em')}</em></h2>
              <p>{c('wa_d')}</p>
              <ul>
                <li>{c('wa_1')}</li>
                <li>{c('wa_2')}</li>
                <li>{c('wa_3')}</li>
              </ul>
              <a className="p7-btn p7-btn-navy" href={WHATSAPP_AGENTS_URL} target="_blank" rel="noopener"><WaIcon /> {c('wa_cta')}</a>
            </div>
            <div className="p7-rv s1">
              <div className="ag7-phone p7-watch">
                <div className="ag7-screen">
                  <div className="ag7-chat-top"><span className="ag7-av">24</span><div>{c('chat_name')}<small>{c('chat_group')}</small></div></div>
                  <div className="ag7-msgs">
                    <div className="ag7-msg l"><small>Spain 24/7</small>{c('chat_1')}</div>
                    <div className="ag7-msg r">{c('chat_2')}</div>
                    <div className="ag7-msg l"><small>Spain 24/7</small>{c('chat_3')}</div>
                    <div className="ag7-msg r">{c('chat_4')}</div>
                  </div>
                </div>
              </div>
              <p className="ag7-example">{c('chat_note')}</p>
            </div>
          </div>
        </section>

        <section className="ag7-partner" id="partner">
          <div className="p7-wrap">
            <div className="p7-rv">
              <img className="ag7-logo" src={IMG('bueno-logo-navy.png')} alt="Bueno" />
              <h2>{c('p_t')} <em>{c('p_em')}</em></h2>
              <p>{c('p_d')}</p>
              <a className="p7-btn p7-btn-primary" href={BUENO_PARTNER_URL} target="_blank" rel="noopener">{c('p_cta')} <span className="p7-arr">&#8594;</span></a>
              <p className="ag7-fine">{c('p_fine')}</p>
            </div>
            <div className="ag7-steps">
              <div className="ag7-st p7-rv"><b>1</b><span>{c('p_1')}</span></div>
              <div className="ag7-st p7-rv s1"><b>2</b><span>{c('p_2')}</span></div>
              <div className="ag7-st p7-rv s2"><b>3</b><span>{c('p_3')}</span></div>
            </div>
          </div>
        </section>
      </main>

      <ProFooter c={c} />
    </div>
  );
}
