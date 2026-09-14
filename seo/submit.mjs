#!/usr/bin/env node
// Telling search engines that something changed.
//
// TWO ENGINES, TWO COMPLETELY DIFFERENT ANSWERS, AND ONE OF THEM IS "YOU CANNOT"
//
// Bing, and with it ChatGPT search and Copilot, accepts IndexNow: a POST carrying the urls
// that changed, verified by a key file at the site root. Yandex, Seznam and Naver share the
// protocol, so one POST reaches all of them. This is real, it is instant, and it is built
// here.
//
// Google has no equivalent for an ordinary page, and it is worth being exact about why,
// because plenty of tools claim otherwise:
//   - The Indexing API is documented as usable only for pages carrying JobPosting or
//     BroadcastEvent. Calling it for a tax answer page does nothing and is against its terms.
//   - The sitemap ping endpoint, google.com/ping?sitemap=, was deprecated in 2023 and is
//     gone. Google's own post announcing it said to rely on lastmod instead.
// So the Google lever is an honest lastmod, which is why seo/lastmod.mjs exists and why this
// file only ever submits what actually changed. The one API call that is real is resubmitting
// the sitemap through Search Console, which needs a service account, and is done below when
// one is configured.
//
// NOTHING IS SUBMITTED WHEN NOTHING CHANGED. A deploy that only rebuilds the bundle reports
// zero changed pages and this exits without a request. Submitting unchanged urls is how a
// site gets rate limited and, worse, stops being believed.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const HOST = 'www.247spain.es';
const ORIGIN = `https://${HOST}`;

// The endpoint. api.indexnow.org fans the submission out to every participating engine, so
// one call reaches Bing, Yandex, Seznam and Naver rather than four calls reaching four.
const INDEXNOW = 'https://api.indexnow.org/indexnow';
const MAX_PER_POST = 10000;

/** The key is whichever <hex>.txt sits in public/. One file, so there is one answer. */
export function findKey() {
  const pub = join(ROOT, 'public');
  if (!existsSync(pub)) return null;
  const files = readdirSync(pub).filter(f => /^[a-f0-9]{8,128}\.txt$/i.test(f));
  if (files.length !== 1) return null;
  const key = files[0].replace(/\.txt$/i, '');
  const contents = readFileSync(join(pub, files[0]), 'utf8').trim();
  // The file has to contain the key, or the engine returns 403 and the submission is wasted.
  return contents === key ? { key, file: files[0] } : null;
}

export function changedUrls() {
  const p = join(DIST, 'changed-urls.json');
  if (!existsSync(p)) return { changed: [], seeded: false, missing: true };
  return JSON.parse(readFileSync(p, 'utf8'));
}

export async function submitToIndexNow(urls, { key, dryRun = false } = {}) {
  if (!urls.length) return { ok: true, skipped: 'nothing changed', sent: 0 };
  if (!key) return { ok: false, error: 'no key file in public/, so a submission would be refused' };

  const batches = [];
  for (let i = 0; i < urls.length; i += MAX_PER_POST) batches.push(urls.slice(i, i + MAX_PER_POST));

  const results = [];
  for (const urlList of batches) {
    const body = { host: HOST, key: key.key, keyLocation: `${ORIGIN}/${key.file}`, urlList };
    if (dryRun) { results.push({ status: 'dry-run', count: urlList.length }); continue; }
    try {
      const r = await fetch(INDEXNOW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      });
      // 200 accepted, 202 accepted with the key still being verified. Both are success.
      results.push({ status: r.status, ok: r.status === 200 || r.status === 202, count: urlList.length,
        note: EXPLAIN[r.status] || '' });
    } catch (e) {
      results.push({ status: 'error', ok: false, count: urlList.length, note: String(e.message || e) });
    }
  }
  return { ok: results.every(r => r.ok || r.status === 'dry-run'), sent: urls.length, results };
}

const EXPLAIN = {
  200: 'accepted',
  202: 'accepted, key still being validated',
  400: 'bad request, the body was malformed',
  403: 'key rejected, the key file is missing or does not contain the key',
  422: 'the urls do not belong to this host, or the key does not match',
  429: 'rate limited, too many submissions',
};

/**
 * Google, honestly.
 *
 * With a service account that has been added as an owner in Search Console, the sitemap can
 * be resubmitted through the Search Console API. That is the only Google call that does
 * anything for ordinary pages, and it is a nudge to recrawl the sitemap, not a request to
 * index a url. Without the credential this prints what to do rather than pretending.
 */
export async function resubmitGoogleSitemap({ dryRun = false } = {}) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return {
      ok: true,
      skipped: 'no GOOGLE_SERVICE_ACCOUNT_JSON set',
      instead: 'Google has no per url submit for ordinary pages. The lastmod dates in the '
        + 'sitemap are the signal, and they are now accurate. To automate the sitemap resubmit, '
        + 'create a service account, add its email as an owner of the property in Search '
        + 'Console, and put the json in GOOGLE_SERVICE_ACCOUNT_JSON.',
    };
  }
  if (dryRun) return { ok: true, skipped: 'dry run' };

  let creds;
  try { creds = JSON.parse(raw); }
  catch { return { ok: false, error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not valid json' }; }

  try {
    const token = await googleAccessToken(creds, 'https://www.googleapis.com/auth/webmasters');
    if (!token) return { ok: false, error: 'could not get a Google access token' };
    const site = encodeURIComponent(`${ORIGIN}/`);
    const feed = encodeURIComponent(`${ORIGIN}/sitemap.xml`);
    const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${feed}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: r.status === 204 || r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

/** A service account JWT, signed locally, exchanged for an access token. No dependencies. */
async function googleAccessToken(creds, scope) {
  const { createSign } = await import('node:crypto');
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: creds.client_email, scope, aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now,
  })}`;
  const sign = createSign('RSA-SHA256');
  sign.update(unsigned);
  const jwt = `${unsigned}.${sign.sign(creds.private_key, 'base64url')}`;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const j = await r.json().catch(() => ({}));
  return j.access_token || null;
}

// --- run as a script -------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run') || !process.env.VERCEL_ENV;
  const key = findKey();
  const { changed = [], seeded, missing } = changedUrls();

  if (missing) {
    console.log('submit: no changed-urls.json, run the sitemap step first');
  } else if (seeded) {
    console.log('submit: the lastmod ledger was seeded this build, so nothing is claimed as changed');
  } else if (!changed.length) {
    console.log('submit: nothing changed, nothing submitted');
  } else {
    const res = await submitToIndexNow(changed, { key, dryRun });
    console.log(`submit: IndexNow ${dryRun ? '(dry run) ' : ''}${changed.length} urls`,
      res.results ? JSON.stringify(res.results) : res.skipped || res.error || '');
  }

  const g = await resubmitGoogleSitemap({ dryRun });
  console.log('submit: Google', g.skipped ? g.skipped : JSON.stringify(g));
  if (g.instead) console.log('       ', g.instead);
  if (!key) console.log('submit: no IndexNow key file found in public/');
  else console.log(`submit: IndexNow key file is public/${key.file}`);
}
