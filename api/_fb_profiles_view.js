// GET  /api/fb?action=profiles                    the deck's profile posts view
// POST /api/fb?action=profiles { key, action }    park | unpark
//
// Nothing here needs approving (Pratik, 17 November 2026): the posts go out one a day in
// PROFILE_ORDER. Parking one keeps it out of the daily email until it is unparked.
import { gate, readBody, personaRows, setPersona, channelSentOn } from './_fb_db.js';
import {
  PROFILE_POSTS, PROFILE_ORDER, LANGS7, LANG_LABEL, PERSONA_BY_LANG, PERSONAS, AVATAR, PROFILES,
  captionFor, xTextFor, videoUrl, posterUrl, profileByKey, PROFILE_LOW,
} from './_fb_profiles.js';

const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

export default async function handler(req, res) {
  if (!gate(req, res)) return;

  if (req.method === 'POST') {
    const { key, action } = readBody(req);
    if (!profileByKey(key)) return res.status(404).json({ error: 'No such post.' });
    if (!['park', 'unpark'].includes(action)) return res.status(400).json({ error: `Unknown action: ${action}` });
    const rows = await personaRows();
    if (!rows.ok) return res.status(500).json({ error: rows.error });
    const row = rows.data.find(r => r.post_key === key);
    if (row && row.sent_on) return res.status(409).json({ error: 'This one has already gone out.' });
    const p = await setPersona(key, { parked: action === 'park' });
    if (!p.ok) return res.status(500).json({ error: p.error });
    return res.json({ ok: true });
  }

  const rows = await personaRows();
  if (!rows.ok) return res.status(500).json({ error: rows.error });
  const byKey = new Map(rows.data.map(r => [r.post_key, r]));
  const today = new Date().toISOString().slice(0, 10);
  const sentToday = rows.data.some(r => r.sent_on === today);
  // The morning send is at 01:30 UTC with a catch-up at 12:00 UTC.
  let next = (!sentToday && new Date().getUTCHours() < 12) ? today : addDays(today, 1);

  const posts = PROFILE_ORDER.map(key => {
    const p = PROFILE_POSTS.find(x => x.key === key);
    const r = byKey.get(key) || {};
    let status = 'waiting';
    let date = null;
    if (r.sent_on) { status = 'sent'; date = r.sent_on; }
    else if (r.parked) status = 'parked';
    else { date = next; next = addDays(next, 1); }
    return {
      key, audience: p.audience, facts: p.facts, status, date,
      langs: LANGS7.map(lang => ({
        lang, label: LANG_LABEL[lang], persona: PERSONAS[PERSONA_BY_LANG[lang]],
        video: videoUrl(key, lang), poster: posterUrl(key, lang),
        overlay: p.overlay[lang], caption: captionFor(p, lang), x: xTextFor(p, lang),
      })),
    };
  });

  const waiting = posts.filter(p => p.status === 'waiting').length;
  res.json({
    ok: true, today, sent_today: sentToday, channel_sent_today: await channelSentOn(today),
    waiting, low: waiting < PROFILE_LOW, posts,
    accounts: LANGS7.map(lang => ({
      lang, label: LANG_LABEL[lang], persona: PERSONAS[PERSONA_BY_LANG[lang]], avatar: AVATAR[lang], ...PROFILES[lang],
    })),
  });
}
