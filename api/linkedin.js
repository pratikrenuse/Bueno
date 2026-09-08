// One serverless function that serves the entire /api/linkedin-* surface.
//
// WHY THIS FILE IS AT api/linkedin.js AND NOT api/linkedin/[action].js
//
// The previous version of this router lived at `api/linkedin/[action].js`. In production
// that function was simply absent: both `/api/linkedin-posts` and the direct
// `/api/linkedin/posts` returned the SPA's index.html with a 200, which is what a request
// gets when no function matches and the catch-all rewrite takes over. Every other function
// in the deployment was live, so it was not a build failure and not the rewrites. That one
// file did not make it into the deployment.
//
// Square brackets in a filename are glob metacharacters. They survive git and Vercel in
// the normal case, but they are mangled by enough tooling in between that betting the
// whole LinkedIn surface on one bracketed filename in a nested folder was a bad trade for
// no benefit. A plain filename at the api root cannot fail that way, and the action now
// arrives as an ordinary query parameter that a rewrite supplies.
//
// Behaviour is unchanged. The handlers still live beside this file as api/_lk_<action>.js,
// Vercel does not route a file whose name starts with "_", so the whole surface is still
// one function rather than eight, and every legacy /api/linkedin-<action> URL still works
// so approval links already sitting in inboxes keep working.
//
// The handlers are loaded with dynamic import() so a request for /posts does not pay the
// cold-start cost of parsing the large translation and content modules that only /refresh
// needs. The import specifiers are literal strings so Vercel's bundler still traces and
// includes every one of them.

const ROUTES = {
  decide:    () => import('./_lk_decide.js'),
  dispatch:  () => import('./_lk_dispatch.js'),
  emails:    () => import('./_lk_emails.js'),
  health:    () => import('./_lk_health.js'),
  posts:     () => import('./_lk_posts.js'),
  refresh:   () => import('./_lk_refresh.js'),
  remind:    () => import('./_lk_remind.js'),
  translate: () => import('./_lk_translate.js'),
};

export const ACTIONS = Object.keys(ROUTES);

// Work out which handler this request wants.
//
// Four shapes are accepted, because the same handler can arrive as any of them and a URL
// that used to work must keep working:
//   /api/linkedin?action=posts     the canonical form a rewrite produces
//   /api/linkedin-posts            the legacy URL, in inboxes and in the deck
//   /api/linkedin/posts            the shape the previous router used
//   /api/linkedin/posts?action=x   path wins, so a stray query cannot redirect a request
export function resolveAction(req) {
  const candidates = [];

  const path = String(req.url || '').split('?')[0].replace(/\/+$/, '');
  const last = path.split('/').pop() || '';
  candidates.push(last);
  if (last.startsWith('linkedin-')) candidates.push(last.slice('linkedin-'.length));

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
        error: 'Unknown LinkedIn action.',
        requested: String(req.url || '').split('?')[0],
        available: ACTIONS,
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
    // Never let Vercel emit a bare FUNCTION_INVOCATION_FAILED. The deck parses JSON, and
    // an HTML error page is exactly the failure this whole file exists to prevent.
    if (!res.headersSent) {
      return res.status(500).json({
        error: String((e && e.message) || e),
        where: 'api/linkedin.js router',
      });
    }
  }
}
