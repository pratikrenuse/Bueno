// POST or GET /api/fb?action=dispatch
//
// The daily send. Takes the post at the front of the queue and emails it to the publisher,
// with every language's version and the groups each one goes into that day.
//
// WHO CALLS THIS
// The GitHub Actions schedule in .github/workflows/fb-daily.yml, once a day. Vercel's Hobby
// plan allows two cron jobs and the LinkedIn programme uses both, so the clock lives in
// GitHub and the work lives here. The deck can also call it.
//
// WHAT CANNOT HAPPEN
//   - Two posts in one day. If anything has already gone out today (UTC) this does nothing,
//     unless it is called with force=1, which is a person choosing to.
//   - A send nobody approved. Only posts with status approved are ever in the queue.
//   - A silent empty day. When the queue is empty Pratik gets a short email saying so, and
//     nothing goes to the publisher.
//   - Running dry without warning. After a send, if fewer than LOW_QUEUE_DAYS approved posts
//     are left, Pratik gets a short reminder to approve more (him only, once a day).
//
//   dry=1    say what would be sent, and to which groups, without sending anything
//   force=1  send even though something already went out today
import { gateCron, rest, readBody, nextChannelNews, countChannelNews, markChannelNewsUsed } from './_fb_db.js';
import { queueOf, nextDay, sentOn, withCurrentTranslations, deliver, save } from './_fb_queue.js';
import { groupsToday, sendQueueEmpty, sendQueueLow, LOW_QUEUE_DAYS, finalText } from './_fb_email.js';
import { DAILY_START } from './_fb_groups.js';
import { dueNotices, sendNotices } from './_fb_notice.js';
import { channelDaysLeft, channelPostFor, channelFromNews } from './_fb_whatsapp.js';
import { sendMail, PRATIK_ONLY } from './_fb_email.js';

const truthy = (v) => v === true || v === 1 || v === '1' || v === 'true';

export default async function handler(req, res) {
  if (!gateCron(req, res)) return;

  const body = readBody(req);
  const q = req.query || {};
  const dry = truthy(q.dry) || truthy(body.dry);
  const force = truthy(q.force) || truthy(body.force);

  // Nothing goes out before the first posting day. The days before it are for joining the
  // groups. A dry run still answers, so the setup can be checked in advance.
  const today = new Date().toISOString().slice(0, 10);
  if (today < DAILY_START && !force && !dry) {
    return res.json({ ok: true, sent: false, reason: `posting starts on ${DAILY_START}`, today });
  }

  const rows = await rest(res, '?select=*');
  if (rows === null) return;

  const queue = queueOf(rows);
  const day = nextDay(rows);

  if (!queue.length) {
    if (dry) return res.json({ ok: true, dry: true, sent: false, reason: 'queue empty', queued: 0, day });
    // The schedule calls this once a day, so this is at most one short email a day.
    const told = await sendQueueEmpty(day);
    return res.json({ ok: true, sent: false, reason: 'queue empty', queued: 0, day, told_pratik: told.ok });
  }

  const next = queue[0];

  if (dry) {
    return res.json({
      ok: true, dry: true, sent: false, day, queued: queue.length,
      would_send: { idea_key: next.idea_key, tool_slug: next.tool_slug, hook: (finalText(next).split('\n')[0] || '').slice(0, 120) },
      already_sent_today: sentOn(rows),
      notices: dueNotices(rows).map(n => n.id),
      groups: groupsToday(day),
      channel_today: channelPostFor(today) ? 'written by hand' : (((await nextChannelNews()).item || {}).title_en || 'none'),
      then: queue.slice(1, 6).map(r => r.idea_key),
    });
  }

  if (sentOn(rows) && !force) {
    return res.json({ ok: true, sent: false, reason: 'already sent today', queued: queue.length, day });
  }

  const ready = await withCurrentTranslations(next);
  if (!ready.ok) {
    const out = await save(res, next.id, { send_error: `Not sent. ${ready.error}` });
    if (out === null) return;
    // 500 on purpose: the scheduled job fails loudly, which is how anyone finds out.
    return res.status(500).json({ ok: false, sent: false, idea_key: next.idea_key, error: `Nothing was sent. ${ready.error}` });
  }

  // On a day with no hand-written channel post, the next approved newsletter story fills the
  // WhatsApp channel section (api/news.js). Any problem reading it only means no channel post.
  const news = channelPostFor(today) ? null : (await nextChannelNews()).item;
  const channel = channelFromNews(news);
  const r = await deliver(res, ready.row, day, ready.patch, { channel });
  if (!r.ok) return;
  if (!r.sent) {
    return res.status(500).json({ ok: false, sent: false, idea_key: next.idea_key, error: r.error });
  }
  // One-off task briefs ride with the first post sent on or after their date (api/_fb_notice.js).
  const notices = await sendNotices(rows);
  let channelNews = null;
  if (channel && news) {
    const m = await markChannelNewsUsed(news.id, today);
    channelNews = { id: news.id, title: news.title_en, marked_used: !!m.ok };
  }
  // The WhatsApp channel posts are written ahead by date. When fewer than three days are left,
  // Pratik alone gets a short note so the next batch is written before they run out.
  const channelLeft = channelDaysLeft(new Date().toISOString().slice(0, 10)) + await countChannelNews();
  let channelWarned = false;
  if (channelLeft < 3) {
    const n = await sendMail({ to: PRATIK_ONLY, subject: `WhatsApp channel posts: ${channelLeft} day${channelLeft === 1 ? '' : 's'} left`,
      html: `<p style="font-family:Arial,sans-serif;font-size:14px">Only ${channelLeft} day${channelLeft === 1 ? '' : 's'} of WhatsApp channel posts are written. Approve a few more news stories at https://www.247spain.es/internal-news so Poornima does not run out.</p>` });
    channelWarned = !!n.ok;
  }
  const left = queue.length - 1;
  let lowWarned = false;
  if (left < LOW_QUEUE_DAYS) {
    const told = await sendQueueLow(left);
    lowWarned = !!told.ok;
  }
  res.json({
    ok: true, sent: true, day, idea_key: next.idea_key, queued: left,
    retranslated: ready.retranslated, warning: r.warning, low_queue_warned: lowWarned, notices, channel_days_left: channelLeft, channel_warned: channelWarned, channel_news: channelNews,
  });
}
