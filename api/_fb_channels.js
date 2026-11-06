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
//   image    the photo that goes with it, one of the 15 folder photos (GET ?action=channels&photos=<id>).
import { gate, readBody, readNews, queuedChannelNews, reviewChannelNews, recentChannelSends, channelSentOn, getChannelNews, patchChannelNews, usedChannelImages } from './_fb_db.js';
import { CHANNEL_LANGS, CHANNEL_NAME, CHANNEL_PHOTOS, channelFromNews, channelImageFor, isChannelPhoto, photoNameOf, photoUrl } from './_fb_whatsapp.js';

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

// Photos: the 15 licensed stock photos from the folder, plain, no logo (6 November 2026,
// Pratik). A story gets the photo used least so far, so the 15 go round in turn, and keeps it.
async function photoCounts() {
  const counts = new Map(CHANNEL_PHOTOS.map(p => [p, 0]));
  for (const url of await usedChannelImages()) {
    const n = photoNameOf(url);
    if (n) counts.set(n, counts.get(n) + 1);
  }
  return counts;
}

async function assignPhotos(items) {
  const missing = items.filter(i => !isChannelPhoto(i.channel_image))
    .sort((a, b) => (a.received_on < b.received_on ? -1 : a.received_on > b.received_on ? 1 : (a.position || 0) - (b.position || 0)));
  if (!missing.length) return null;
  const counts = await photoCounts();
  for (const i of missing) {
    const name = CHANNEL_PHOTOS.reduce((best, p) => (counts.get(p) < counts.get(best) ? p : best), CHANNEL_PHOTOS[0]);
    counts.set(name, counts.get(name) + 1);
    const p = await patchChannelNews(i.id, { channel_image: photoUrl(name) });
    if (p.ok) i.channel_image = photoUrl(name);
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
      const p = await patchChannelNews(id, { channel_image: image });
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

  // Photo choices for "Change photo": all 15, the least used first.
  if (req.query && req.query.photos) {
    const counts = await photoCounts();
    return res.json({ ok: true, photos: [...CHANNEL_PHOTOS].sort((a, b) => counts.get(a) - counts.get(b)).map(photoUrl) });
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
