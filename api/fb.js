// One serverless function for Pratik's own Facebook post deck at /internal-pratik.
//
// SEPARATION, WHICH IS THE WHOLE POINT OF THIS FILE EXISTING SEPARATELY
// The team's LinkedIn surface is api/linkedin.js with its api/_lk_*.js handlers, reading
// and writing linkedin_posts. This router shares nothing with it: not a handler, not a
// helper, not a table, not an env var beyond the Supabase connection itself. Nothing here
// imports anything named _lk_, and nothing there imports anything named _fb_. That is
// asserted by a test (fb_isolation.test.mjs) so it stays true.
//
// The shape follows api/linkedin.js for the same reason that one exists: a plain filename
// at the api root, the action as an ordinary query parameter, handlers prefixed with an
// underscore so Vercel does not route them and the whole surface costs one function slot.

const ROUTES = {
  posts:  () => import('./_fb_posts.js'),
  decide: () => import('./_fb_decide.js'),
  seed:   () => import('./_fb_seed.js'),
};

export const ACTIONS = Object.keys(ROUTES);

export function resolveAction(req) {
  const candidates = [];
  const path = String(req.url || '').split('?')[0].replace(/\/+$/, '');
  const last = path.split('/').pop() || '';
  candidates.push(last);
  if (last.startsWith('fb-')) candidates.push(last.slice('fb-'.length));
  const q = req.query && req.query.action;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  if (fromQuery) candidates.push(String(fromQuery));

  for (const c of candidates) {
    let key;
    try { key = decodeURIComponent(c).toLowerCase(); }
    catch { key = String(c).toLowerCase(); }
    if (Object.prototype.hasOwnProperty.call(ROUTES, key)) return key;
  }
  return null;
}

export default async function handler(req, res) {
  try {
    const action = resolveAction(req);
    if (!action) {
      return res.status(404).json({
        error: 'Unknown action.',
        requested: String(req.url || '').split('?')[0],
        available: ACTIONS,
      });
    }
    const mod = await ROUTES[action]();
    const fn = mod && mod.default;
    if (typeof fn !== 'function') {
      return res.status(500).json({ error: `The handler for "${action}" does not export a default function.` });
    }
    return await fn(req, res);
  } catch (e) {
    if (!res.headersSent) {
      return res.status(500).json({ error: String((e && e.message) || e), where: 'api/fb.js router' });
    }
  }
}
