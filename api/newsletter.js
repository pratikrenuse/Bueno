// One serverless function for the Bueno newsletter review tool at /internal-newsletter.
//
// Same shape as api/fb.js: a plain file at the api root, the action as a query parameter,
// handlers in underscore files so Vercel does not route them and the whole surface costs
// one function slot. Shares nothing with the LinkedIn (_lk_) or Facebook (_fb_) surfaces.

const ROUTES = {
  issues: () => import('./_nl_issues.js'),
  decide: () => import('./_nl_decide.js'),
  seed:   () => import('./_nl_seed.js'),
  alert:  () => import('./_nl_alert.js'),
  news:   () => import('./_nl_news.js'),
  health: () => import('./_nl_health.js'),
};

export const ACTIONS = Object.keys(ROUTES);

export function resolveAction(req) {
  const candidates = [];
  const path = String(req.url || '').split('?')[0].replace(/\/+$/, '');
  const last = path.split('/').pop() || '';
  candidates.push(last);
  if (last.startsWith('newsletter-')) candidates.push(last.slice('newsletter-'.length));
  const q = req.query && req.query.action;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  if (fromQuery) candidates.push(String(fromQuery));
  for (const c of candidates) {
    let key;
    try { key = decodeURIComponent(c).toLowerCase(); } catch { key = String(c).toLowerCase(); }
    if (Object.prototype.hasOwnProperty.call(ROUTES, key)) return key;
  }
  return null;
}

export default async function handler(req, res) {
  try {
    const action = resolveAction(req);
    if (!action) return res.status(404).json({ error: 'Unknown action.', available: ACTIONS });
    const mod = await ROUTES[action]();
    return await mod.default(req, res);
  } catch (e) {
    if (!res.headersSent) return res.status(500).json({ error: String((e && e.message) || e), where: 'api/newsletter.js router' });
  }
}
