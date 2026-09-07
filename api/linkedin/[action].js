// One serverless function that serves the entire /api/linkedin-* surface.
//
// Why this exists: Vercel's Hobby plan allows 12 serverless functions per deployment.
// The eight linkedin-* handlers used two thirds of that budget on their own, which left
// no room to ship anything new. Each handler now lives beside this file as
// api/_lk_<action>.js. Vercel does not treat a file whose name starts with "_" as a
// route, so the whole LinkedIn surface now costs one function instead of eight.
//
// Nothing about the handlers themselves changed. They were copied byte for byte, they
// sit in the same directory as before so their relative imports (./_email.js,
// ./_translate.js, ./_dispatch.js, ./_linkedin_*.js) still resolve, and vercel.json
// rewrites every original /api/linkedin-<action> path to this router. Approval links
// already sitting in people's inboxes keep working, the dashboard needs no change, and
// the two cron jobs point straight at the canonical paths below.
//
// The handlers are loaded with dynamic import() so a request for /posts does not pay the
// cold-start cost of parsing the large translation and content modules that only
// /refresh needs. The import specifiers are literal strings so Vercel's bundler still
// traces and includes every one of them.

const ROUTES = {
  decide:    () => import('../_lk_decide.js'),
  dispatch:  () => import('../_lk_dispatch.js'),
  emails:    () => import('../_lk_emails.js'),
  health:    () => import('../_lk_health.js'),
  posts:     () => import('../_lk_posts.js'),
  refresh:   () => import('../_lk_refresh.js'),
  remind:    () => import('../_lk_remind.js'),
  translate: () => import('../_lk_translate.js'),
};

// Work out which handler this request wants. Three sources are checked, because the same
// handler can be reached as /api/linkedin/posts (direct), /api/linkedin-posts (rewritten
// legacy path) or via the [action] route parameter. Whichever resolves first wins, so a
// stray ?action= in a caller's query string can never redirect the request.
function resolveAction(req) {
  const candidates = [];

  const path = String(req.url || '').split('?')[0].replace(/\/+$/, '');
  const last = path.split('/').pop() || '';
  candidates.push(last);
  if (last.startsWith('linkedin-')) candidates.push(last.slice('linkedin-'.length));

  const q = req.query && req.query.action;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  if (fromQuery) candidates.push(String(fromQuery));

  for (const c of candidates) {
    const key = decodeURIComponent(c).toLowerCase();
    if (Object.prototype.hasOwnProperty.call(ROUTES, key)) return key;
  }
  return null;
}

export default async function handler(req, res) {
  try {
    const action = resolveAction(req);
    if (!action) {
      return res.status(404).json({
        error: 'Unknown LinkedIn action.',
        requested: String(req.url || '').split('?')[0],
        available: Object.keys(ROUTES),
      });
    }

    const mod = await ROUTES[action]();
    const fn = mod && mod.default;
    if (typeof fn !== 'function') {
      return res.status(500).json({
        error: `The handler for "${action}" does not export a default function. Check api/_lk_${action}.js.`,
      });
    }

    return await fn(req, res);
  } catch (e) {
    // Never let Vercel emit a bare FUNCTION_INVOCATION_FAILED. The dashboard parses JSON.
    if (!res.headersSent) {
      return res.status(500).json({
        error: String((e && e.message) || e),
        where: 'api/linkedin/[action].js router',
      });
    }
  }
}
