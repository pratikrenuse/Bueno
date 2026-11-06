// One serverless function for the Spain 24/7 Instagram reels. The work is in api/_reels.js.
//
//   POST /api/reels?action=plan        writes today's English script      (render token or passcode)
//   POST /api/reels?action=translate   translates it into five languages  (render token or passcode)
//   GET  /api/reels?action=jobs        scripts waiting to be rendered     (render token or passcode)
//   POST /api/reels?action=upload-url  signed Storage URL for one file     (render token or passcode)
//   POST /api/reels?action=done        records the videos, sends the email (render token or passcode)
//   GET  /api/reels?action=list        the /internal-reels page           (passcode)
//   POST /api/reels?action=resend      sends a reel's email again         (passcode)
//   POST /api/reels?action=rerender    puts a reel back in the render queue (passcode)
//   GET  /api/reels?action=health      env vars, table, bucket, next story (passcode)
//
// Kept apart from api/news.js on purpose: the idealista digest is live and stays untouched.
// The reels only read its stories.

const ROUTES = {
  plan: async () => (await import('./_reels.js')).plan,
  translate: async () => (await import('./_reels.js')).translate,
  jobs: async () => (await import('./_reels.js')).jobs,
  'upload-url': async () => (await import('./_reels.js')).uploadUrl,
  done: async () => (await import('./_reels.js')).done,
  list: async () => (await import('./_reels.js')).list,
  resend: async () => (await import('./_reels.js')).resend,
  rerender: async () => (await import('./_reels.js')).rerender,
  health: async () => (await import('./_reels.js')).health,
};

// Writing or translating a script with Claude takes 15 to 40 seconds.
export const config = { maxDuration: 60 };

export const ACTIONS = Object.keys(ROUTES);

export function resolveAction(req) {
  const q = req.query && req.query.action;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  const path = String(req.url || '').split('?')[0].replace(/\/+$/, '');
  const last = path.split('/').pop() || '';
  for (const c of [fromQuery, last, last.replace(/^reels-/, '')]) {
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
    if (!res.headersSent) return res.status(500).json({ error: String((e && e.message) || e), where: 'api/reels.js router' });
  }
}
