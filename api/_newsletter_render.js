// Builds an issue's full content and renders it as paste-ready text and as HTML.
//
// Pure functions with no Node or browser dependencies, so the same code runs in the API
// (the approval email to Pratik) and in the deck (the preview and the Copy button). What
// John approves in the deck is byte for byte what Pratik receives.
import { SHELL, LINKS, LANGS } from './_newsletter_shell.js';

/** The complete, editable content of one issue in one language. */
export function buildLang(issue, lang) {
  const s = SHELL[lang];
  const v = issue.content[lang];
  return {
    subject: v.subject,
    preview: v.preview,
    intro: [...s.intro],
    labels: { ...s.labels },
    news_heading: s.news_heading,
    news_kicker: s.news_kicker,
    news: v.news.map(n => ({ title: n.title, body: n.body })),
    news_button: s.news_button,
    news_url: LINKS.account[lang],
    tax: { title: s.tax.title, paras: [...s.tax.paras] },
    guide: {
      title: v.guide.title,
      intro: v.guide.intro,
      topics_label: s.guide_topics_label,
      topics: [...v.guide.topics],
      button: s.guide_button,
      url: (issue.guide_url && issue.guide_url[lang]) || '',
    },
    region: {
      title: `${s.region_prefix} ${v.region.title}`,
      paras: [...v.region.paras],
      note: s.region_note,
      button: s.region_button,
      url: LINKS.property[lang],
    },
    question: { prefix: s.question_prefix, q: v.question.q, paras: [...v.question.paras] },
    survey: v.survey ? { enabled: true, question: v.survey.question, options: [...v.survey.options] }
      : { enabled: false, question: '', options: [] },
    join: { ...s.join },
    signoff: [...s.signoff],
  };
}

export function buildContent(issue) {
  const out = {};
  for (const l of LANGS) out[l] = buildLang(issue, l);
  return out;
}

/** The content actually in force: John's edit if there is one, else the original. */
export function current(row, lang) {
  return (row.edited && row.edited[lang]) || (row.content && row.content[lang]) || null;
}

const join = (arr) => (arr || []).filter(x => x && String(x).trim()).join('\n\n');

/** Paste-ready text, section by section, in the same order as Newsletter 12. */
export function toText(c) {
  if (!c) return '';
  const parts = [];
  parts.push(`SUBJECT: ${c.subject}`);
  if (c.preview) parts.push(`PREVIEW TEXT: ${c.preview}`);
  parts.push('');
  parts.push(join(c.intro));
  parts.push(`\n${c.labels.news}\n\n${c.news_heading}\n${c.news_kicker}`);
  for (const n of c.news) parts.push(`${n.title}\n\n${n.body}`);
  parts.push(`[Button: ${c.news_button}] ${c.news_url}`);
  parts.push(`\n${c.tax.title}\n${join(c.tax.paras)}`);
  parts.push(`\n${c.labels.guide}\n\n${c.guide.title}\n${c.guide.intro}\n\n${c.guide.topics_label}\n\n${join(c.guide.topics)}`);
  parts.push(`[Button: ${c.guide.button}] ${c.guide.url}`);
  parts.push(`\n${c.labels.property}\n\n${c.region.title}\n\n${join(c.region.paras)}\n\n${c.region.note}`);
  parts.push(`[Button: ${c.region.button}] ${c.region.url}`);
  parts.push(`\n${c.labels.question}\n${c.question.prefix} ${c.question.q}\n\n${join(c.question.paras)}`);
  if (c.survey && c.survey.enabled && c.survey.question) {
    parts.push(`\n${c.labels.survey}\n${c.survey.question}\n${(c.survey.options || []).map(o => `( ) ${o}`).join('\n')}`);
  }
  parts.push(`\n${c.labels.join}\n\n${c.join.title}\n${c.join.body}\n\n${c.join.line}`);
  parts.push(`\n${c.signoff.join('\n')}`);
  return parts.join('\n\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Email-safe HTML of the issue, laid out like the beehiiv newsletter. */
export function toHtml(c) {
  if (!c) return '';
  const label = (t) => `<div style="display:inline-block;background:#CBEFFF;color:#010221;font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:4px 10px;border-radius:12px;margin:0 0 10px">${esc(t)}</div>`;
  const p = (t) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#2B2E45">${esc(t)}</p>`;
  const h = (t, size = 20) => `<h2 style="margin:0 0 10px;font-size:${size}px;line-height:1.3;color:#010221;font-weight:600">${esc(t)}</h2>`;
  const btn = (t, u) => `<p style="margin:14px 0 4px"><a href="${esc(u)}" style="display:inline-block;background:#010221;color:#fff;text-decoration:none;padding:11px 22px;border-radius:24px;font-size:14px">${esc(t)}</a></p>`;
  const sec = (inner) => `<div style="padding:22px 0;border-top:1px solid #E3E0DA">${inner}</div>`;
  let out = '';
  out += c.intro.map(p).join('');
  out += sec(label(c.labels.news) + h(c.news_heading) + p(c.news_kicker)
    + c.news.map(n => `<h3 style="margin:16px 0 6px;font-size:16px;color:#010221">${esc(n.title)}</h3>${p(n.body)}`).join('')
    + btn(c.news_button, c.news_url));
  out += sec(h(c.tax.title, 18) + c.tax.paras.map(p).join(''));
  out += sec(label(c.labels.guide) + h(c.guide.title) + p(c.guide.intro) + p(c.guide.topics_label)
    + `<ul style="margin:0 0 8px 18px;padding:0">${c.guide.topics.map(t => `<li style="font-size:15px;line-height:1.6;color:#2B2E45;margin:0 0 6px">${esc(t)}</li>`).join('')}</ul>`
    + btn(c.guide.button, c.guide.url));
  out += sec(label(c.labels.property) + h(c.region.title) + c.region.paras.map(p).join('') + p(c.region.note) + btn(c.region.button, c.region.url));
  out += sec(label(c.labels.question) + h(`${c.question.prefix} ${c.question.q}`, 17) + c.question.paras.map(p).join(''));
  if (c.survey && c.survey.enabled && c.survey.question) {
    out += sec(label(c.labels.survey) + h(c.survey.question, 17) + (c.survey.options || []).map(o => p(`( ) ${o}`)).join(''));
  }
  out += sec(label(c.labels.join) + h(c.join.title) + p(c.join.body) + p(c.join.line));
  out += `<div style="padding:8px 0 0">${c.signoff.map(p).join('')}</div>`;
  return `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff;padding:24px">${out}</div>`;
}
