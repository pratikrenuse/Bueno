// POST /api/fb?action=trial    the instructions and the next post, to Pratik only
// POST /api/fb?action=intro    the instructions, to Poornima with Pratik copied
//
// WHY A TRIAL EXISTS
// Pratik asked to see every email Poornima will get, in his own inbox, before she gets any of
// them. The trial sends him two emails: the instructions, and the post that is next in line,
// built exactly the way the daily send builds it, with that day's groups. Both say "Trial" at
// the top. Nothing is marked as sent, the day number does not move, and she receives nothing.
//
// WHICH POST THE TRIAL SHOWS
// The one at the front of the queue, if anything is approved. Otherwise the first post in
// the written order, straight from the content module, so a trial works before anything has
// been approved or even loaded into the table.
//
// THE REAL INSTRUCTIONS
// intro sends the same instructions to Poornima, copied to Pratik. It needs confirm: true in
// the body, so it can only ever be a deliberate press of the button in the deck.
import { gate, rest, readBody } from './_fb_db.js';
import { queueOf, nextDay } from './_fb_queue.js';
import { sendTrial, sendIntro, SEND_TO } from './_fb_email.js';
import { IDEAS, QUEUE_ORDER, TRANSLATION_LANGS, renderPost, linkFor } from './_fb_content.js';
import { imageFor } from './_fb_images.js';

const fromContent = (key) => {
  const idea = IDEAS.find(i => i.key === key) || IDEAS[0];
  return {
    idea_key: idea.key,
    tool_slug: idea.tool,
    tool_url: linkFor(idea.tool, 'en'),
    post_text: renderPost(idea, 'en'),
    translations: Object.fromEntries(TRANSLATION_LANGS.map(l => [l, renderPost(idea, l)])),
    image_url: imageFor(idea.key),
    note: null,
  };
};

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const action = String((req.query && req.query.action) || '').toLowerCase()
    || (String(req.url || '').includes('intro') ? 'intro' : 'trial');

  if (action === 'intro') {
    const { confirm } = readBody(req);
    if (confirm !== true) return res.status(400).json({ error: 'Sending the instructions to Poornima needs confirm: true.' });
    const r = await sendIntro();
    if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
    return res.json({ ok: true, to: SEND_TO.join(', '), warning: r.warning || null });
  }

  const rows = await rest(res, '?select=*');
  if (rows === null) return;
  const queue = queueOf(rows);
  const day = nextDay(rows);
  const post = queue[0] || fromContent(QUEUE_ORDER[0]);

  const r = await sendTrial(post, day);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, to: r.to.join(', '), day, idea_key: post.idea_key, from_queue: !!queue[0], warning: r.warning });
}
