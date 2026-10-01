// GET /api/newsletter?action=health
// Read-only. Answers "is it working?" with specifics: env vars, table, seeded issues,
// guide PDFs reachable, nothing repeated, news filled before each alert date.
import { gate, rest, emailsLive } from './_nl_db.js';
import { ISSUES } from './_newsletter_issues.js';
import { PAST, usedGuides, usedRegions, usedTopics } from './_newsletter_registry.js';
import { LANGS } from './_newsletter_shell.js';

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail });

  for (const v of ['SUPABASE_SERVICE_KEY', 'INTERNAL_PASSCODE', 'RESEND_API_KEY', 'RESEND_FROM']) add(`env ${v}`, !!process.env[v], process.env[v] ? 'set' : 'missing');
  add('env SUPABASE_URL', !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL));
  add('emails switched on', emailsLive(), emailsLive() ? 'NEWSLETTER_EMAILS_LIVE=true, emails go out' : 'off, nothing is emailed (set NEWSLETTER_EMAILS_LIVE=true to launch)');

  const rows = await rest(res, '?select=issue_key,number,send_date,alert_date,status,news_status,guide,region,reader_topic,content,edited');
  if (rows === null) return;
  add('table newsletter_issues', true, `${rows.length} issues stored`);
  const missing = ISSUES.filter(i => !rows.some(r => r.issue_key === i.key)).map(i => i.key);
  add('all written issues are seeded', !missing.length, missing.length ? `not yet seeded: ${missing.join(', ')} (press Sync)` : `${ISSUES.length} of ${ISSUES.length}`);

  const dup = (field, past) => {
    const seen = new Map(); const bad = [];
    for (const r of rows) {
      const v = r[field]; if (!v) continue;
      if (past.has(v)) bad.push(`${r.issue_key} reuses ${v} from an earlier newsletter`);
      if (seen.has(v)) bad.push(`${r.issue_key} and ${seen.get(v)} share ${v}`);
      seen.set(v, r.issue_key);
    }
    add(`no repeated ${field.replace('_', ' ')}`, !bad.length, bad.join('; ') || 'none repeated');
  };
  dup('guide', usedGuides()); dup('region', usedRegions()); dup('reader_topic', usedTopics());

  const late = rows.filter(r => r.news_status === 'to_refresh' && r.alert_date && r.alert_date < today() && r.status === 'pending');
  add('news researched before each alert date', !late.length, late.length ? `still placeholder: ${late.map(r => r.issue_key).join(', ')}` : 'ok');

  // Every guide PDF the issues link to must actually open.
  const urls = new Set();
  for (const r of rows) for (const l of LANGS) { const c = (r.edited && r.edited[l]) || r.content[l]; if (c?.guide?.url) urls.add(c.guide.url); }
  const broken = [];
  await Promise.all([...urls].map(async u => {
    try { const x = await fetch(u, { method: 'HEAD' }); const t = x.headers.get('content-type') || ''; if (!x.ok || !/pdf|octet/.test(t)) broken.push(`${u} (${x.status} ${t})`); }
    catch (e) { broken.push(`${u} (${e.message})`); }
  }));
  add('guide PDFs open', !broken.length, broken.join('; ') || `${urls.size} links checked`);

  const upcoming = rows.filter(r => r.send_date >= today()).length;
  add('runway', upcoming >= 2, `${upcoming} upcoming issues written (${upcoming * 2} weeks)`);
  add('past newsletters on record', PAST.length > 0, `${PAST.length} past issues checked for repeats`);

  res.json({ ok: checks.every(c => c.ok || c.name === 'emails switched on'), checks });
}
