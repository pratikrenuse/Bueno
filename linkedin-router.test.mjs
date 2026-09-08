// Tests for the LinkedIn router's action resolution.
//
// Four URL shapes have to keep working, because approval links already sitting in people's
// inboxes use the legacy one and the deck uses another. Getting this wrong does not throw,
// it just quietly 404s, which is how the previous version failed unnoticed.

import { resolveAction, ACTIONS } from './api/linkedin.js';

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = got === want;
  ok ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};
const req = (url, query) => resolveAction({ url, query });

// --- the canonical form a rewrite produces ------------------------------------
eq('query form', req('/api/linkedin?action=posts', { action: 'posts' }), 'posts');
eq('query form, every action', ACTIONS.every(a => req(`/api/linkedin?action=${a}`, { action: a }) === a), true);

// --- the legacy URL, the one in inboxes ---------------------------------------
eq('legacy URL', req('/api/linkedin-posts'), 'posts');
eq('legacy URL with a query string attached', req('/api/linkedin-decide?token=abc'), 'decide');
eq('legacy URL, every action', ACTIONS.every(a => req(`/api/linkedin-${a}`) === a), true);

// --- the path form the previous router used -----------------------------------
eq('path form', req('/api/linkedin/posts'), 'posts');
eq('path form with a trailing slash', req('/api/linkedin/health/'), 'health');
eq('path form, every action', ACTIONS.every(a => req(`/api/linkedin/${a}`) === a), true);

// --- the path must win over the query -----------------------------------------
// Otherwise a caller who happens to send ?action= could redirect somebody else's request
// to a different handler.
eq('path beats a conflicting query', req('/api/linkedin/posts?action=dispatch', { action: 'dispatch' }), 'posts');
eq('legacy path beats a conflicting query', req('/api/linkedin-posts?action=refresh', { action: 'refresh' }), 'posts');

// --- rubbish resolves to nothing rather than to something -----------------------
eq('unknown action', req('/api/linkedin/nonsense'), null);
eq('unknown legacy action', req('/api/linkedin-nonsense'), null);
eq('unknown query action', req('/api/linkedin?action=nonsense', { action: 'nonsense' }), null);
eq('bare router path with no action', req('/api/linkedin'), null);
eq('no url at all', resolveAction({}), null);
eq('empty url', req(''), null);

// --- shapes that could throw ----------------------------------------------------
eq('a malformed percent escape does not throw', req('/api/linkedin/%E0%A4%A'), null);
eq('an array query takes the first value', req('/api/linkedin', { action: ['posts', 'dispatch'] }), 'posts');
eq('case is ignored', req('/api/linkedin/POSTS'), 'posts');
eq('a prototype key is not an action', req('/api/linkedin/constructor'), null);
eq('__proto__ is not an action', req('/api/linkedin/__proto__'), null);

// --- the full set is what we think it is ---------------------------------------
eq('eight actions', ACTIONS.length, 8);
eq('the two cron actions exist', ACTIONS.includes('dispatch') && ACTIONS.includes('remind'), true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
