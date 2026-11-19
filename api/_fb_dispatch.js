// POST or GET /api/fb?action=dispatch
//
// The daily send, run by two Vercel crons (01:30 UTC = 07:00 India time, and a catch-up at
// 12:00 UTC). Since 17 November 2026 it sends one email a day to the publisher, Pratik in CC,
// with nothing to approve first:
//
//   1. Today's persona profile post: the next post in api/_fb_profiles.js that has not gone
//      out and that Pratik has not parked, in all seven languages, with each language's video
//      and its Instagram, Facebook, LinkedIn and X accounts.
//   2. Today's WhatsApp channel post, chosen by itself:
//        a story already approved and translated, if one is in line;
//        otherwise the newest story the idealista digest kept in the last two weeks, which
//        this approves in the digest (that translates it) and uses;
//        otherwise an evergreen post from the written Facebook posts, already in every
//        language, the one that went out longest ago (or never).
//
// The catch-up run sends only what the morning run did not. The Facebook group posts are paused
// (FB_GROUPS_ON in Vercel); while they are, their queue is not touched.
//
//   dry=1    say what would go out, and send nothing
//   force=1  send again even though today's email already went
import { gateCron, rest, readBody, nextChannelNews, markChannelNewsUsed, channelSentOn, logChannelSend,
  autoChannelCandidates, getChannelNews, allChannelSends, personaRows, setPersona } from './_fb_db.js';
import { queueOf, nextDay, sentOn, withCurrentTranslations, deliver, save } from './_fb_queue.js';
import { groupsToday, sendQueueEmpty, sendQueueLow, LOW_QUEUE_DAYS, finalText, sendDailyTasks, sendProfilesLow } from './_fb_email.js';
import { DAILY_START } from './_fb_groups.js';
import { dueNotices, sendNotices } from './_fb_notice.js';
import { channelFromNews, CHANNEL_LANGS, CHANNEL_PHOTOS, photoUrl } from './_fb_whatsapp.js';
import { approveInDigest, assignPhotos } from './_fb_channels.js';
import { IDEAS, QUEUE_ORDER, renderBody } from './_fb_content.js';
import { nextProfilePost, profilesLeft, PROFILE_LOW } from './_fb_profiles.js';

// 5 November 2026: the Facebook group posts are on hold until Pratik picks them up again.
// To bring them back, set FB_GROUPS_ON to 1 in Vercel and redeploy; nothing else changes.
export const facebookGroupsOn = () => process.env.FB_GROUPS_ON === '1';

const truthy = (v) => v === true || v === 1 || v === '1' || v === 'true';

export default async function handler(req, res) {
  if (!gateCron(req, res)) return;

  const body = readBody(req);
  const q = req.query || {};
  const dry = truthy(q.dry) || truthy(body.dry);
  const force = truthy(q.force) || truthy(body.force);
  const today = new Date().toISOString().slice(0, 10);

  const daily = await dailyTasks(today, { dry, force });
  const fbOn = facebookGroupsOn();
  const facebook = fbOn ? await facebookPost(req, res, today, { dry, force }) : { paused: true };
  if (res.headersSent) return;
  const failed = !dry && !!(daily.error || facebook.error);
  // With the Facebook posts on, their result also sits at the top level, as it always did.
  return res.status(failed ? 500 : 200).json({ ...(fbOn ? facebook : {}), ok: !failed, dry, today, daily, facebook });
}

// --- 1 and 2: the daily task email ------------------------------------------------------

async function dailyTasks(today, { dry, force }) {
  const rows = await personaRows();
  if (!rows.ok) return { error: `Could not read persona_posts: ${rows.error}` };
  const profileDone = !force && rows.data.some(r => r.sent_on === today);
  const profile = profileDone ? null : nextProfilePost(rows.data);
  const channelDone = !force && await channelSentOn(today);
  const channel = channelDone ? null : await pickChannel({ dry });

  const report = {
    profile: profileDone ? 'already sent today' : (profile ? profile.key : 'none left'),
    channel: channelDone ? 'already sent today' : (channel ? `${channel.source}: ${channel.title || ''}` : 'none'),
    profiles_left: profilesLeft(rows.data),
  };
  if (channel && channel.error) report.channel_problem = channel.error;
  if (dry) return report;

  const texts = channel && channel.texts;
  if (!profile && !texts) {
    // Nothing to send. Tell Pratik once, on the morning run, if the profile batch ran out.
    if (!profileDone && new Date().getUTCHours() < 6) report.told_pratik = !!(await sendProfilesLow(0)).ok;
    return { ...report, sent: false };
  }

  const r = await sendDailyTasks(today, { profile, channel: texts || null });
  if (!r.ok) return { ...report, sent: false, error: r.error };

  if (profile) {
    const m = await setPersona(profile.key, { sent_on: today, sent_at: new Date().toISOString() });
    if (!m.ok) report.record_problem = m.error;
  }
  if (texts) await recordChannel(today, channel);

  const left = profilesLeft((await personaRows()).data || []);
  report.profiles_left = left;
  if (profile && left < PROFILE_LOW && new Date().getUTCHours() < 6) report.low_warned = !!(await sendProfilesLow(left)).ok;
  return { ...report, sent: true, email_id: r.id || null };
}

// Today's channel post: { source, title, texts, news? } or null. Never throws.
async function pickChannel({ dry }) {
  // a. Already approved and translated.
  const queued = await nextChannelNews();
  const q = queued.item && channelFromNews(queued.item);
  if (q) return { source: 'news', title: queued.item.title_en, texts: q, news: queued.item };

  // b. The newest kept story, approved here and now.
  const cands = await autoChannelCandidates(3);
  let problem = null;
  if (cands.ok && cands.data.length) {
    const item = cands.data[0];
    if (dry) return { source: 'news (will be approved and translated)', title: item.title_en };
    const pass = process.env.INTERNAL_PASSCODE;
    if (!pass) problem = 'INTERNAL_PASSCODE is not set, so the story could not be approved.';
    else {
      await assignPhotos([item]);
      const a = await approveInDigest(pass, item.id);
      if (a.ok) {
        const fresh = await getChannelNews(item.id);
        const texts = channelFromNews(fresh);
        if (texts) return { source: 'news', title: fresh.title_en, texts, news: fresh };
        problem = 'The story was approved but its translations are incomplete.';
      } else problem = a.error;
    }
  } else if (!cands.ok) problem = cands.error;

  // c. Evergreen: a written post that is already in every channel language.
  const ever = await evergreen();
  if (ever) return problem ? { ...ever, error: problem } : ever;
  return problem ? { source: 'none', error: problem } : null;
}

export async function evergreen() {
  const sends = await allChannelSends();
  const last = new Map();
  for (const s of (sends.ok ? sends.data : [])) {
    if (isEvergreenSend(s) && s.title && !last.has(s.title)) last.set(s.title, s.day);
  }
  const usable = QUEUE_ORDER
    .map(k => IDEAS.find(i => i.key === k))
    .filter(i => i && CHANNEL_LANGS.every(l => renderBody(i, l)));
  if (!usable.length) return null;
  // Never sent first, in QUEUE_ORDER; then the one sent longest ago.
  const pick = usable.find(i => !last.has(i.key))
    || [...usable].sort((a, b) => (last.get(a.key) < last.get(b.key) ? -1 : 1))[0];
  const texts = {};
  for (const l of CHANNEL_LANGS) texts[l] = renderBody(pick, l);
  const n = sends.ok ? sends.data.filter(isEvergreenSend).length : 0;
  texts.image = photoUrl(CHANNEL_PHOTOS[n % CHANNEL_PHOTOS.length]);
  return { source: 'evergreen', title: pick.key, texts };
}

// The table's check constraint accepts only 'written' and 'news' as a source, so an evergreen
// post is logged as 'written' (19 November 2026). Before this, every evergreen send was
// refused without an error, nothing was logged, and the same day could go out twice.
const isEvergreenSend = (s) => s.source === 'evergreen' || s.source === 'written';

async function recordChannel(today, channel) {
  if (channel.news) await markChannelNewsUsed(channel.news.id, today);
  await logChannelSend({
    day: today, source: channel.source === 'evergreen' ? 'written' : 'news',
    news_id: channel.news ? channel.news.id : null, title: channel.title || null,
    texts: channel.texts, via: 'daily tasks',
  });
}

// --- The Facebook group posts (paused) --------------------------------------------------

async function facebookPost(req, res, today, { dry, force }) {
  if (today < DAILY_START && !force && !dry) return { sent: false, reason: `posting starts on ${DAILY_START}` };
  const rows = await rest(res, '?select=*');
  if (rows === null) return { error: 'fb_posts could not be read' };
  const queue = queueOf(rows);
  const day = nextDay(rows);
  if (!queue.length) {
    if (dry) return { sent: false, reason: 'queue empty', day };
    const told = await sendQueueEmpty(day);
    return { sent: false, reason: 'queue empty', day, told_pratik: told.ok };
  }
  const next = queue[0];
  if (dry) {
    return { sent: false, day, queued: queue.length,
      would_send: { idea_key: next.idea_key, tool_slug: next.tool_slug, hook: (finalText(next).split('\n')[0] || '').slice(0, 120) },
      already_sent_today: sentOn(rows), groups: groupsToday(day), notices: dueNotices(rows).map(n => n.id),
      then: queue.slice(1, 6).map(r => r.idea_key) };
  }
  if (sentOn(rows) && !force) return { sent: false, reason: 'already sent today', queued: queue.length, day };
  const ready = await withCurrentTranslations(next);
  if (!ready.ok) {
    await save(res, next.id, { send_error: `Not sent. ${ready.error}` });
    return { sent: false, idea_key: next.idea_key, error: `Nothing was sent. ${ready.error}` };
  }
  // The WhatsApp channels travel in the daily task email now, never in this one.
  const r = await deliver(res, ready.row, day, ready.patch, { channel: false });
  if (!r.ok || !r.sent) return { sent: false, idea_key: next.idea_key, error: r.error || 'database refused' };
  const notices = await sendNotices(rows);
  const left = queue.length - 1;
  let lowWarned = false;
  if (left < LOW_QUEUE_DAYS) lowWarned = !!(await sendQueueLow(left)).ok;
  return { sent: true, day, idea_key: next.idea_key, queued: left, notices, warning: r.warning,
    retranslated: ready.retranslated, low_queue_warned: lowWarned };
}
