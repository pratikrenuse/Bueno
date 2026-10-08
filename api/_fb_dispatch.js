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
//
//   dry=1    say what would be sent, and to which groups, without sending anything
//   force=1  send even though something already went out today
import { gateCron, rest, readBody } from './_fb_db.js';
import { queueOf, nextDay, sentOn, withCurrentTranslations, deliver, save } from './_fb_queue.js';
import { groupsToday, sendQueueEmpty, finalText } from './_fb_email.js';

const truthy = (v) => v === true || v === 1 || v === '1' || v === 'true';

export default async function handler(req, res) {
  if (!gateCron(req, res)) return;

  const body = readBody(req);
  const q = req.query || {};
  const dry = truthy(q.dry) || truthy(body.dry);
  const force = truthy(q.force) || truthy(body.force);

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
      groups: groupsToday(day),
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

  const r = await deliver(res, ready.row, day, ready.patch);
  if (!r.ok) return;
  if (!r.sent) {
    return res.status(500).json({ ok: false, sent: false, idea_key: next.idea_key, error: r.error });
  }
  res.json({
    ok: true, sent: true, day, idea_key: next.idea_key, queued: queue.length - 1,
    retranslated: ready.retranslated, warning: r.warning,
  });
}
