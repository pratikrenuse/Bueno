// GET /api/fb?action=posts&status=pending
//
// There is no language parameter. Pratik reviews English; the translations travel with the
// row and are only ever read, never filtered on.
//
// Approving no longer sends. An approved post waits in a queue and one goes out each day, so
// every approved post that has not gone yet carries its place in that queue, and the counts
// say how many are waiting and how many have been sent.
//
// THE DASHBOARD (12 Oct 2026)
// The same call also returns `dashboard`: every email that went to the publisher with the
// groups it carried, the queue with the date each post is expected to go, failed sends,
// parked posts and the totals. It is worked out from fb_posts and the group rotation, the
// same two things the daily email uses, so the dashboard and the inbox always agree.
import { gate, rest } from './_fb_db.js';
import { queueOf, nextDay, sentOn } from './_fb_queue.js';
import { groupsToday, finalText } from './_fb_email.js';
import { DAILY_START } from './_fb_groups.js';

const STATUSES = ['pending', 'approved', 'rejected', 'posted', 'all'];

// The Vercel cron fires at 03:30 UTC (09:00 India time) and on the Hobby plan may run any time
// in that hour, so until 04:30 UTC today's send is still to come.
const CRON_DONE_BY_UTC_MIN = 4 * 60 + 30;

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// The calendar date (UTC, which is also the India date at 09:00) the first queued post goes.
export function firstSendDate(rows, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
  let first = (sentOn(rows, now) || mins >= CRON_DONE_BY_UTC_MIN) ? addDays(today, 1) : today;
  if (first < DAILY_START) first = DAILY_START;
  return first;
}

const hookOf = (r) => (finalText(r).split('\n').find(l => l.trim()) || '').trim().slice(0, 140);
const linkKind = (r) => (r.tool_slug === 'bueno-tax' ? 'bueno' : 'spain247');
const groupCount = (g) => g.reduce((n, l) => n + l.groups.length, 0);

export function buildDashboard(all, now = new Date()) {
  const queue = queueOf(all);
  const day0 = nextDay(all);
  const first = firstSendDate(all, now);

  const sent = all
    .filter(r => r.sent_at)
    .sort((a, b) => String(b.sent_at).localeCompare(String(a.sent_at)))
    .map(r => {
      const groups = r.send_day ? groupsToday(Number(r.send_day)) : [];
      return {
        id: r.id, idea_key: r.idea_key, hook: hookOf(r), kind: r.kind, link: linkKind(r),
        tool_slug: r.tool_slug, sent_at: r.sent_at, sent_to: r.sent_to, day: r.send_day || null,
        live: r.status === 'posted', posted_at: r.posted_at || null,
        groups, group_count: groupCount(groups),
      };
    });

  const upcoming = queue.map((r, i) => {
    const groups = groupsToday(day0 + i);
    return {
      id: r.id, idea_key: r.idea_key, hook: hookOf(r), kind: r.kind, link: linkKind(r),
      tool_slug: r.tool_slug, pos: i + 1, day: day0 + i, date: addDays(first, i),
      edited: !!(r.edited_text && r.edited_text.trim()), groups, group_count: groupCount(groups),
    };
  });

  const failed = all
    .filter(r => r.send_error)
    .map(r => ({ id: r.id, idea_key: r.idea_key, hook: hookOf(r), error: r.send_error, status: r.status }));

  const parked = all
    .filter(r => r.status === 'rejected')
    .map(r => ({ id: r.id, idea_key: r.idea_key, hook: hookOf(r), reason: r.reject_comment || '', link: linkKind(r) }));

  const by = (list, key) => list.reduce((m, x) => { m[x[key]] = (m[x[key]] || 0) + 1; return m; }, {});
  const today = now.toISOString().slice(0, 10);

  return {
    now: now.toISOString(),
    sent_today: sentOn(all, now),
    next_send_date: upcoming.length ? upcoming[0].date : null,
    runs_until: upcoming.length ? upcoming[upcoming.length - 1].date : null,
    days_since_start: today >= DAILY_START
      ? Math.round((new Date(`${today}T00:00:00Z`) - new Date(`${DAILY_START}T00:00:00Z`)) / 864e5) + 1 : 0,
    daily_start: DAILY_START,
    totals: {
      posts: all.length,
      to_review: all.filter(r => r.status === 'pending').length,
      queued: queue.length,
      sent: sent.length,
      live: all.filter(r => r.status === 'posted').length,
      parked: parked.length,
      failed: failed.length,
      group_posts_sent: sent.reduce((n, s) => n + s.group_count, 0),
      group_posts_queued: upcoming.reduce((n, s) => n + s.group_count, 0),
    },
    split: {
      sent: by(sent, 'link'),
      queued: by(upcoming, 'link'),
      all: by(all.map(r => ({ link: linkKind(r) })), 'link'),
    },
    sent, upcoming, failed, parked,
  };
}

export default async function handler(req, res) {
  if (!gate(req, res)) return;

  const status = STATUSES.includes(req.query.status) ? req.query.status : 'all';

  const all = await rest(res, '?order=idea_key.asc&select=*');
  if (all === null) return;

  const queue = queueOf(all);
  const place = new Map(queue.map((r, i) => [r.id, i + 1]));
  const withPlace = all.map(r => (place.has(r.id) ? { ...r, queue_pos: place.get(r.id) } : r));
  const rows = status === 'all' ? withPlace : withPlace.filter(r => r.status === status);

  const counts = { pending: 0, approved: 0, rejected: 0, posted: 0, all: all.length };
  for (const r of all) if (counts[r.status] != null) counts[r.status] += 1;
  counts.queued = queue.length;
  counts.sent = all.filter(r => r.sent_at).length;

  res.json({ posts: rows, counts, total: rows.length, next_day: nextDay(all), dashboard: buildDashboard(all) });
}
