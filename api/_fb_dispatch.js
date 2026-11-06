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
import { gateCron, rest, readBody, nextChannelNews, countChannelNews, markChannelNewsUsed, channelSentOn, logChannelSend, reviewChannelNews } from './_fb_db.js';
import { queueOf, nextDay, sentOn, withCurrentTranslations, deliver, save } from './_fb_queue.js';
import { groupsToday, sendQueueEmpty, sendQueueLow, LOW_QUEUE_DAYS, finalText } from './_fb_email.js';
import { DAILY_START } from './_fb_groups.js';
import { dueNotices, sendNotices } from './_fb_notice.js';
import { channelDaysLeft, channelPostFor, channelFromNews } from './_fb_whatsapp.js';
import { sendMail, PRATIK_ONLY, sendChannelOnly } from './_fb_email.js';

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

  // Today's WhatsApp channel post: the approved story that has waited longest (Pratik approves
  // each one in the deck's WhatsApp channels view). Nothing when the channels already had
  // their post today, because the daily send runs twice.
  const channelDone = await channelSentOn(today);
  const written = channelPostFor(today);
  const news = channelDone || written ? null : (await nextChannelNews()).item;
  const channel = channelDone ? null : (written || channelFromNews(news));

  if (!queue.length) {
    // 6 November 2026: the Facebook posts are on hold, but an approved channel post still goes
    // out every day, so the daily task email goes out with only the WhatsApp tasks in it.
    // With nothing approved, nothing goes to the publisher.
    if (dry) return res.json({ ok: true, dry: true, sent: false, reason: 'queue empty', queued: 0, day,
      channel_only: channel ? (written ? 'written by hand' : news.title_en) : (channelDone ? 'already sent today' : 'none') });
    let channelSent = null;
    if (channel) {
      const c = await sendChannelOnly(today, channel);
      channelSent = c.ok ? true : c.error;
      if (c.ok) await recordChannel(today, written, news, channel, 'channel only');
    }
    // Pratik hears about the empty Facebook queue once a day, on the first run.
    const told = channelDone ? { ok: false } : await sendQueueEmpty(day);
    return res.json({ ok: true, sent: false, reason: 'queue empty', queued: 0, day, told_pratik: told.ok, channel_sent: channelSent,
      channel_warned: await remindChannelLow() });
  }

  const next = queue[0];

  if (dry) {
    return res.json({
      ok: true, dry: true, sent: false, day, queued: queue.length,
      would_send: { idea_key: next.idea_key, tool_slug: next.tool_slug, hook: (finalText(next).split('\n')[0] || '').slice(0, 120) },
      already_sent_today: sentOn(rows),
      notices: dueNotices(rows).map(n => n.id),
      groups: groupsToday(day),
      channel_today: channelDone ? 'already sent today' : written ? 'written by hand' : ((news || {}).title_en || 'none'),
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

  // false keeps the channel section out when the channels already had their post today.
  const r = await deliver(res, ready.row, day, ready.patch, { channel: channelDone ? false : channelFromNews(news) });
  if (!r.ok) return;
  if (!r.sent) {
    return res.status(500).json({ ok: false, sent: false, idea_key: next.idea_key, error: r.error });
  }
  // One-off task briefs ride with the first post sent on or after their date (api/_fb_notice.js).
  const notices = await sendNotices(rows);
  let channelNews = null;
  if (channel) {
    const m = await recordChannel(today, written, news, channel, 'with the Facebook post');
    if (news) channelNews = { id: news.id, title: news.title_en, marked_used: !!m };
  }
  const channelLeft = channelDaysLeft(today) + await countChannelNews();
  const channelWarned = await remindChannelLow();
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

// Marks the story used and writes the day into wa_channel_sends. Returns true when the story
// (if there was one) was marked.
async function recordChannel(today, written, news, channel, via) {
  let marked = true;
  if (!written && news) marked = !!(await markChannelNewsUsed(news.id, today)).ok;
  await logChannelSend({
    day: today, source: written ? 'written' : 'news', news_id: written ? null : (news && news.id) || null,
    title: written ? null : (news && news.title_en) || null, texts: channel, via,
  });
  return marked;
}

// A reminder to Pratik alone, on the morning run only (the send runs at 01:30 and 12:00 UTC),
// when fewer than CHANNEL_LOW approved WhatsApp posts are left, with how many idealista stories
// are waiting for him in the deck. A reminder is the only thing that goes out unapproved.
export const CHANNEL_LOW = 3;
async function remindChannelLow() {
  if (new Date().getUTCHours() >= 6) return false;
  const left = await countChannelNews();
  if (left >= CHANNEL_LOW) return false;
  const r = await reviewChannelNews();
  const waiting = r.ok ? r.data.length : 0;
  const posts = left === 1 ? '1 approved WhatsApp channel post is' : `${left} approved WhatsApp channel posts are`;
  const n = await sendMail({ to: PRATIK_ONLY,
    subject: left === 0 ? 'WhatsApp channels: nothing approved for tomorrow' : `WhatsApp channels: only ${left} approved post${left === 1 ? '' : 's'} left`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#010221"><p>Hi Pratik,</p>
      <p>${left === 0 ? 'No WhatsApp channel post is approved, so nothing will go into the channels tomorrow.' : `Only ${posts} left in line, and one goes out each day.`}
      ${waiting ? `There ${waiting === 1 ? 'is 1 idealista story' : `are ${waiting} idealista stories`} waiting for you to review.` : ''}</p>
      <p>Approve more in the WhatsApp channels tab: <a href="https://www.247spain.es/internal-poornima" style="color:#5B7FCC">https://www.247spain.es/internal-poornima</a></p></div>` });
  return !!n.ok;
}
