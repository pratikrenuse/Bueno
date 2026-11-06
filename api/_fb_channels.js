// GET  /api/fb?action=channels                              the deck's WhatsApp channels view
// POST /api/fb?action=channels { id, action, image? }       approve | skip | undo | image
//
// WHY (6 November 2026)
// Pratik: every idealista newsletter should show up in /internal-poornima for the WhatsApp
// channels, and nothing goes into the channels unless he approves it. This lists the stories
// the digest kept in the last week that wait for his decision, the approved ones in the order
// they will go out (one a day, in the daily task email, with a photo and the text in all six
// channel languages), and what already went out.
//
//   approve  translates the story into the five other languages and puts it in line. The
//            translating belongs to the digest (api/_news_decide.js) and is reached over HTTP,
//            never by import, so the two surfaces stay apart.
//   skip     "not for the channels". The story stays kept, so the LinkedIn deck is not affected.
//   undo     back to waiting for review, from approved or skipped, as long as it has not gone.
//   image    the photo that goes with it, a Pexels photo from GET ?action=channels&photos=<id>.
import { gate, readBody, readNews, queuedChannelNews, reviewChannelNews, recentChannelSends, channelSentOn, getChannelNews, patchChannelNews, usedChannelImages } from './_fb_db.js';
import { CHANNEL_LANGS, CHANNEL_NAME, channelFromNews, channelImageFor, isChannelPhoto, photoIdOf } from './_fb_whatsapp.js';

const SITE = 'https://www.247spain.es';
const englishOf = (i) => (i.edited_en && String(i.edited_en).trim()) ? i.edited_en : (i.en || '');

async function approveInDigest(pass, id) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 55000);
  try {
    const r = await fetch(`${process.env.NEWS_SITE || SITE}/api/news?action=decide`, {
      method: 'POST', headers: { 'x-passcode': pass, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'approve' }), signal: ctl.signal,
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.ok ? { ok: true } : { ok: false, error: j.error || `The digest answered ${r.status}.` };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  } finally { clearTimeout(t); }
}

// Photos: plain photographs of Spain from Pexels (6 November 2026, Pratik: Spain 24/7 only,
// no Bueno logo, none of the LinkedIn tool's images). The search follows the story's topic and
// varies with its place in the newsletter, so neighbouring stories look different.
const QUERIES = {
  'tax-and-law': ['spanish old town street', 'seville street', 'spanish town square', 'toledo spain'],
  market: ['spain apartment buildings', 'malaga city', 'valencia spain architecture', 'alicante coast city'],
  letting: ['spain apartment balcony', 'mediterranean terrace sea view', 'barcelona balconies', 'spanish apartment building'],
  'buying-selling': ['spanish villa', 'white village andalusia', 'costa del sol houses', 'mallorca house'],
  squatting: ['spanish house front door', 'old door spain', 'spanish house facade'],
  politics: ['madrid city', 'madrid street', 'madrid architecture'],
  other: ['spanish coastal town', 'spanish village', 'spain old town', 'costa brava town'],
};
const queriesFor = (i) => {
  const list = QUERIES[i.category] || QUERIES.other;
  const start = Number(i.position || 0) % list.length;
  return [...list.slice(start), ...list.slice(0, start), ...QUERIES.other];
};
const PEXELS = 'https://api.pexels.com/v1/search';
// A photo at a size that suits WhatsApp and email, from its Pexels id.
export const photoFromId = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

async function searchPhotos(query, page = 1) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return { ok: false, error: 'Missing env var: PEXELS_API_KEY.' };
  try {
    const r = await fetch(`${PEXELS}?query=${encodeURIComponent(query)}&orientation=landscape&per_page=40&page=${page}`, { headers: { Authorization: key } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Pexels ${r.status}` };
    return { ok: true, ids: (j.photos || []).map(p => String(p.id)) };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

// Up to n photos for a story that no other story has.
async function freshPhotos(item, used, n) {
  const out = [];
  let error = null;
  for (const q of queriesFor(item)) {
    const r = await searchPhotos(q);
    if (!r.ok) { error = r.error; break; }
    for (const id of r.ids) {
      if (!used.has(id) && !out.includes(id)) out.push(id);
      if (out.length >= n) return { ok: true, ids: out };
    }
  }
  return out.length ? { ok: true, ids: out } : { ok: false, error: error || 'Pexels found no photo.' };
}

async function usedIds() {
  const used = await usedChannelImages();
  return new Set([...used].map(photoIdOf).filter(Boolean));
}

// Gives every story without a photo its own one and saves it, so it never changes by itself.
async function assignPhotos(items) {
  const missing = items.filter(i => !isChannelPhoto(i.channel_image))
    .sort((a, b) => (a.received_on < b.received_on ? -1 : a.received_on > b.received_on ? 1 : (a.position || 0) - (b.position || 0)));
  if (!missing.length) return null;
  const used = await usedIds();
  for (const i of missing) {
    const f = await freshPhotos(i, used, 1);
    if (!f.ok) return f.error;
    used.add(f.ids[0]);
    const url = photoFromId(f.ids[0]);
    const p = await patchChannelNews(i.id, { channel_image: url });
    if (p.ok) i.channel_image = url;
  }
  return null;
}

const card = (i) => ({
  id: i.id, received_on: i.received_on, title: i.title_en || i.title_es, score: i.score,
  is_proposal: !!i.is_proposal, link: i.link || null, status: i.status,
  image: channelImageFor(i), english: englishOf(i), texts: channelFromNews(i),
});

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  const pass = req.headers['x-passcode'] || (req.query && req.query.pass);

  if (req.method === 'POST') {
    const { id, action, image } = readBody(req);
    if (!id || !action) return res.status(400).json({ error: 'id and action are required' });
    const item = await getChannelNews(id);
    if (!item) return res.status(404).json({ error: 'No such story.' });
    if (item.used_on) return res.status(409).json({ error: 'This one has already gone out to the channels.' });

    if (action === 'image') {
      if (!isChannelPhoto(image)) return res.status(400).json({ error: 'Unknown photo.' });
      const taken = await usedIds();
      if (taken.has(photoIdOf(image)) && photoIdOf(image) !== photoIdOf(item.channel_image)) return res.status(409).json({ error: 'Another story already has that photo.' });
      const p = await patchChannelNews(id, { channel_image: photoFromId(photoIdOf(image)) });
      if (!p.ok) return res.status(500).json({ error: p.error });
    } else if (action === 'approve') {
      if (item.status !== 'pending') return res.status(409).json({ error: 'Only a story waiting for review can be approved.' });
      // The photo shown in the deck goes with it, so the email carries exactly that one.
      await assignPhotos([item]);
      const a = await approveInDigest(pass, id);
      if (!a.ok) return res.status(502).json({ error: `Not approved. ${a.error}` });
    } else if (action === 'skip') {
      if (item.status !== 'pending') return res.status(409).json({ error: 'Only a story waiting for review can be set aside.' });
      const p = await patchChannelNews(id, { status: 'skipped', decided_at: new Date().toISOString() });
      if (!p.ok) return res.status(500).json({ error: p.error });
    } else if (action === 'undo') {
      if (!['approved', 'skipped'].includes(item.status)) return res.status(409).json({ error: 'There is nothing to undo.' });
      const p = await patchChannelNews(id, { status: 'pending', decided_at: null });
      if (!p.ok) return res.status(500).json({ error: p.error });
    } else {
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    const after = await getChannelNews(id);
    return res.json({ ok: true, item: after ? card(after) : null });
  }

  // Photo choices for one story, for "Change photo".
  if (req.query && req.query.photos) {
    const item = await getChannelNews(req.query.photos);
    if (!item) return res.status(404).json({ error: 'No such story.' });
    const f = await freshPhotos(item, await usedIds(), 18);
    if (!f.ok) return res.status(502).json({ error: f.error });
    return res.json({ ok: true, photos: f.ids.map(photoFromId) });
  }

  const today = new Date().toISOString().slice(0, 10);
  const [review, queued, sent, doneToday, emails] = await Promise.all([
    reviewChannelNews(), queuedChannelNews(), recentChannelSends(60), channelSentOn(today),
    readNews('?select=received_at,subject,status,stories,kept&source=eq.idealista&order=received_at.desc&limit=10', 'news_emails'),
  ]);
  for (const r of [review, queued, sent]) if (!r.ok) return res.status(500).json({ error: r.error });
  const photoError = await assignPhotos([...review.data, ...queued.data]);

  res.json({
    ok: true, today, sent_today: doneToday,
    langs: CHANNEL_LANGS, names: CHANNEL_NAME,
    photo_error: photoError,
    review: review.data.map(card),
    queued: queued.data.map(card),
    sent: sent.data,
    newsletters: emails.ok ? emails.data : [],
  });
}
