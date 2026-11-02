// One serverless function for the newsletter digest (idealista/news first).
//
//   POST /api/news?action=inbound    Resend webhook (email.received). No passcode, see _news_inbound.js.
//   GET  /api/news?action=items      the review page's list           (passcode)
//   POST /api/news?action=decide     approve, reject, edit, undo        (passcode)
//   POST /api/news?action=ingest     paste a newsletter by hand         (passcode)
//   POST /api/news?action=reprocess  retry an email that failed         (passcode)
//   GET  /api/news?action=health     env vars, tables, last email       (passcode)
//
// Same shape as api/fb.js and api/linkedin.js: helpers start with "_" so the whole surface
// costs one function slot. Nothing here imports from the LinkedIn, Facebook or newsletter
// surfaces. The Facebook daily email reads approved stories from news_items on its own side.

const ROUTES = {
  inbound: async () => (await import('./_news_inbound.js')).default,
  items: async () => (await import('./_news_items.js')).items,
  health: async () => (await import('./_news_items.js')).health,
  decide: async () => (await import('./_news_decide.js')).decide,
  ingest: async () => (await import('./_news_decide.js')).ingest,
  reprocess: async () => (await import('./_news_decide.js')).reprocess,
};

// Sorting one newsletter with Claude takes 20 to 40 seconds.
export const config = { maxDuration: 60 };

export const ACTIONS = Object.keys(ROUTES);

export function resolveAction(req) {
  const q = req.query && req.query.action;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  const path = String(req.url || '').split('?')[0].replace(/\/+$/, '');
  const last = path.split('/').pop() || '';
  for (const c of [fromQuery, last, last.replace(/^news-/, '')]) {
    const key = String(c || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(ROUTES, key)) return key;
  }
  return null;
}

export default async function handler(req, res) {
  try {
    const action = resolveAction(req);
    if (!action) return res.status(404).json({ error: 'Unknown action.', available: ACTIONS });
    const fn = await ROUTES[action]();
    if (typeof fn !== 'function') return res.status(500).json({ error: `No handler for "${action}".` });
    return await fn(req, res);
  } catch (e) {
    if (!res.headersSent) return res.status(500).json({ error: String((e && e.message) || e), where: 'api/news.js router' });
  }
}
