// One serverless function for the social posting tool. The work is in api/_social.js.
//
//   GET  /api/social?action=health        what is set up and what is missing   (passcode)
//   GET  /api/social?action=accounts      connected accounts, never tokens     (passcode)
//   POST /api/social?action=connect-link  a link that starts a sign-in         (passcode)
//   GET  /api/social/connect?t=...        opens the platform's permission page (signed link)
//   GET  /api/social/callback             the platform sends the person back   (signed state)
//   POST /api/social?action=account       pause, resume or remove an account   (passcode)
//   GET  /api/social?action=posts         the queue and the history            (passcode)
//   POST /api/social?action=create        add posts                            (passcode)
//   POST /api/social?action=decide        approve, hold, edit, retry, delete   (passcode)
//   POST /api/social?action=upload-url    signed address for one file          (passcode)
//   GET  /api/social/run                  publish what is due                  (cron or passcode)
//
// Kept apart from every other surface on purpose. It imports nothing from the LinkedIn deck,
// the Facebook deck, the news, the newsletter or the reels, and touches none of their tables.

const ROUTES = {
  health: async () => (await import('./_social.js')).health,
  accounts: async () => (await import('./_social.js')).accounts,
  'connect-link': async () => (await import('./_social.js')).connectLink,
  connect: async () => (await import('./_social.js')).connect,
  callback: async () => (await import('./_social.js')).callback,
  account: async () => (await import('./_social.js')).account,
  posts: async () => (await import('./_social.js')).posts,
  create: async () => (await import('./_social.js')).create,
  decide: async () => (await import('./_social.js')).decide,
  'upload-url': async () => (await import('./_social.js')).uploadUrl,
  run: async () => (await import('./_social.js')).run,
};

// A reel can take most of a minute to be processed by Instagram before it can be published.
export const config = { maxDuration: 60 };

export const ACTIONS = Object.keys(ROUTES);

export function resolveAction(req) {
  const q = req.query && req.query.action;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  const path = String(req.url || '').split('?')[0].replace(/\/+$/, '');
  const last = path.split('/').pop() || '';
  for (const c of [fromQuery, last, last.replace(/^social-/, '')]) {
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
    if (!res.headersSent) return res.status(500).json({ error: String((e && e.message) || e), where: 'api/social.js router' });
  }
}
