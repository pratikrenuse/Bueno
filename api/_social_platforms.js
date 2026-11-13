// Everything the social posting tool says to Instagram, Facebook and LinkedIn.
//
// Only the platforms' own official APIs are used, with a token the account owner granted by
// clicking Allow on the platform's own screen. Nothing here logs in with a password, opens a
// browser, likes, follows, comments or sends messages. It publishes posts and nothing else.
//
//   Instagram  Instagram API with Instagram Login (graph.instagram.com). Creator or Business
//              accounts. Photo, carousel or reel.
//   Facebook   Pages API (graph.facebook.com). Pages only: Meta has no API for posting to a
//              personal profile or a group. Text, photos or one video.
//   LinkedIn   Posts API (api.linkedin.com/rest/posts) with the member's own permission
//              (w_member_social). Text or photos.
//
// Every platform exposes the same five things: env(), authUrl(), exchange(), refresh() and
// publish(). An error thrown from here carries flags the dispatcher acts on:
//   auth       the token no longer works, so the account has to be connected again
//   ambiguous  the last call that actually publishes got no clear answer, so the post may or
//              may not be live. It is never retried automatically, because a retry could post
//              it twice.

export const timing = { poll: 3000 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function errorText(j, text, status) {
  if (j && typeof j === 'object') {
    if (j.error && typeof j.error === 'object') return j.error.error_user_msg || j.error.message || JSON.stringify(j.error).slice(0, 300);
    if (j.error_message) return j.error_message;
    if (j.error_description) return j.error_description;
    if (j.message) return j.message;
    if (typeof j.error === 'string') return j.error;
  }
  return `HTTP ${status}: ${String(text || '').slice(0, 200)}`;
}

// One request. Throws a flagged Error on anything but a clean answer.
export async function http(url, init = {}, { step = 'Request', final = false } = {}) {
  let r, text;
  try {
    r = await fetch(url, init);
    text = await r.text();
  } catch (e) {
    const err = new Error(`${step}: the platform did not answer (${String((e && e.message) || e)}).`);
    err.network = true; err.ambiguous = final;
    throw err;
  }
  let j = null;
  try { j = text ? JSON.parse(text) : {}; } catch { j = null; }
  const metaError = j && j.error && typeof j.error === 'object' ? j.error : null;
  if (!r.ok || metaError) {
    const err = new Error(`${step}: ${errorText(j, text, r.status)}`);
    err.status = r.status;
    err.code = metaError ? metaError.code : (j && (j.code || j.serviceErrorCode)) || null;
    err.auth = r.status === 401 || (metaError && (metaError.code === 190 || metaError.code === 102));
    err.ambiguous = final && r.status >= 500;
    throw err;
  }
  return { json: j || {}, headers: r.headers, status: r.status };
}

const form = (o) => new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)));
const inSeconds = (s) => (Number(s) > 0 ? new Date(Date.now() + Number(s) * 1000).toISOString() : null);
const isVideo = (m) => m && m.type === 'video';

// ---------------------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------------------

const IG = 'https://graph.instagram.com';

const instagram = {
  name: 'Instagram',
  env() {
    const id = process.env.INSTAGRAM_APP_ID, secret = process.env.INSTAGRAM_APP_SECRET;
    return { id, secret, missing: [!id && 'INSTAGRAM_APP_ID', !secret && 'INSTAGRAM_APP_SECRET'].filter(Boolean) };
  },
  authUrl({ redirect, state }) {
    return `https://www.instagram.com/oauth/authorize?${form({
      client_id: this.env().id, redirect_uri: redirect, response_type: 'code',
      scope: 'instagram_business_basic,instagram_business_content_publish', state,
    })}`;
  },
  async exchange({ code, redirect }) {
    const { id, secret } = this.env();
    const short = await http('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: form({ client_id: id, client_secret: secret, grant_type: 'authorization_code', redirect_uri: redirect, code: String(code).replace(/#_$/, '') }),
    }, { step: 'Instagram sign-in' });
    const first = Array.isArray(short.json.data) ? short.json.data[0] : short.json;
    const long = await http(`${IG}/access_token?${form({ grant_type: 'ig_exchange_token', client_secret: secret, access_token: first.access_token })}`, {}, { step: 'Instagram long-lived token' });
    const me = await http(`${IG}/me?${form({ fields: 'user_id,username', access_token: long.json.access_token })}`, {}, { step: 'Instagram account lookup' });
    return [{
      platform: 'instagram',
      external_id: String(me.json.user_id || me.json.id || first.user_id),
      username: me.json.username || null,
      access_token: long.json.access_token,
      refresh_token: null,
      token_expires_at: inSeconds(long.json.expires_in),
    }];
  },
  // A long-lived Instagram token lasts 60 days and can be renewed for another 60 at any
  // point after its first day, with no one having to sign in again.
  async refresh(account) {
    const r = await http(`${IG}/refresh_access_token?${form({ grant_type: 'ig_refresh_token', access_token: account.access_token })}`, {}, { step: 'Instagram token renewal' });
    return { access_token: r.json.access_token, refresh_token: null, token_expires_at: inSeconds(r.json.expires_in) };
  },
  async status(container, token) {
    const r = await http(`${IG}/${container}?${form({ fields: 'status_code', access_token: token })}`, {}, { step: 'Instagram processing check' });
    return r.json.status_code || 'IN_PROGRESS';
  },
  async wait(container, token, deadline) {
    for (;;) {
      const s = await this.status(container, token);
      if (s !== 'IN_PROGRESS') return s;
      if (Date.now() + timing.poll > deadline) return 'IN_PROGRESS';
      await sleep(timing.poll);
    }
  },
  async container(account, params, step) {
    const post = (who) => http(`${IG}/${who}/media`, { method: 'POST', body: form({ ...params, access_token: account.access_token }) }, { step });
    try {
      return (await post(account.external_id)).json.id;
    } catch (e) {
      // Some accounts answer only to "me". Tried once, and only when Instagram says the
      // account id itself is the problem.
      if (e.code === 100 && /does not exist|unsupported (post|get) request/i.test(e.message)) return (await post('me')).json.id;
      throw e;
    }
  },
  async publish(account, post, { deadline }) {
    const token = account.access_token;
    const media = post.media || [];
    let container = post.container_id || null;

    if (!container) {
      if (!media.length) throw new Error('An Instagram post needs a photo or a video.');
      if (media.length === 1) {
        const m = media[0];
        container = await this.container(account, isVideo(m)
          ? { media_type: 'REELS', video_url: m.url, caption: post.caption }
          : { image_url: m.url, caption: post.caption }, 'Instagram could not take the file');
      } else {
        const children = [];
        for (const m of media) {
          const child = await this.container(account, isVideo(m)
            ? { media_type: 'VIDEO', video_url: m.url, is_carousel_item: 'true' }
            : { image_url: m.url, is_carousel_item: 'true' }, 'Instagram could not take one of the files');
          if (isVideo(m)) {
            const s = await this.wait(child, token, deadline);
            if (s !== 'FINISHED') throw new Error(`Instagram had not finished processing a video in the carousel (${s}). It will be tried again on the next run.`);
          }
          children.push(child);
        }
        container = await this.container(account, { media_type: 'CAROUSEL', children: children.join(','), caption: post.caption }, 'Instagram could not build the carousel');
      }
    }

    const state = await this.wait(container, token, deadline);
    // A container that already says PUBLISHED means an earlier run got the post out and then
    // lost its footing before recording it. It is recorded now, and not posted a second time.
    if (state === 'PUBLISHED') return { id: null, permalink: null, already: true, container_id: container };
    if (state === 'IN_PROGRESS') return { pending: true, container_id: container };
    if (state !== 'FINISHED') {
      const err = new Error(`Instagram could not process the file (${state}). Check that it is a JPEG photo or an MP4 video with a shape Instagram accepts.`);
      err.resetContainer = true;
      throw err;
    }

    const done = await http(`${IG}/${account.external_id}/media_publish`, {
      method: 'POST', body: form({ creation_id: container, access_token: token }),
    }, { step: 'Instagram publish', final: true });
    const id = done.json.id;
    let permalink = null;
    try { permalink = (await http(`${IG}/${id}?${form({ fields: 'permalink', access_token: token })}`, {}, { step: 'Instagram link lookup' })).json.permalink || null; } catch { /* the post is live either way */ }
    return { id, permalink, container_id: container };
  },
};

// ---------------------------------------------------------------------------------------
// Facebook Pages
// ---------------------------------------------------------------------------------------

const FB = 'https://graph.facebook.com';

const facebook = {
  name: 'Facebook',
  env() {
    const id = process.env.FACEBOOK_APP_ID, secret = process.env.FACEBOOK_APP_SECRET;
    return { id, secret, missing: [!id && 'FACEBOOK_APP_ID', !secret && 'FACEBOOK_APP_SECRET'].filter(Boolean) };
  },
  authUrl({ redirect, state }) {
    return `https://www.facebook.com/dialog/oauth?${form({
      client_id: this.env().id, redirect_uri: redirect, response_type: 'code',
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts', state,
    })}`;
  },
  // One sign-in returns every Page the person manages, each with its own Page token. A Page
  // token made from a long-lived user token does not expire.
  async exchange({ code, redirect }) {
    const { id, secret } = this.env();
    const short = await http(`${FB}/oauth/access_token?${form({ client_id: id, client_secret: secret, redirect_uri: redirect, code })}`, {}, { step: 'Facebook sign-in' });
    const long = await http(`${FB}/oauth/access_token?${form({ grant_type: 'fb_exchange_token', client_id: id, client_secret: secret, fb_exchange_token: short.json.access_token })}`, {}, { step: 'Facebook long-lived token' });
    const pages = await http(`${FB}/me/accounts?${form({ fields: 'id,name,access_token', limit: 100, access_token: long.json.access_token })}`, {}, { step: 'Facebook Page list' });
    return (pages.json.data || []).filter((p) => p.id && p.access_token).map((p) => ({
      platform: 'facebook', external_id: String(p.id), username: p.name || null,
      access_token: p.access_token, refresh_token: null, token_expires_at: null,
    }));
  },
  async refresh() { return null; },
  async publish(account, post) {
    const page = account.external_id, token = account.access_token;
    const media = post.media || [];
    if (media.some(isVideo)) {
      if (media.length > 1) throw new Error('A Facebook post can carry one video or several photos, not both.');
      const v = await http(`https://graph-video.facebook.com/${page}/videos`, {
        method: 'POST', body: form({ file_url: media[0].url, description: post.caption, access_token: token }),
      }, { step: 'Facebook video publish', final: true });
      return { id: v.json.id, permalink: `https://www.facebook.com/${page}/videos/${v.json.id}` };
    }
    const body = { message: post.caption, access_token: token };
    // Photos are uploaded unpublished first and then attached to one feed post, which is the
    // documented way to post one photo or several with the same call.
    for (let i = 0; i < media.length; i++) {
      const up = await http(`${FB}/${page}/photos`, {
        method: 'POST', body: form({ url: media[i].url, published: 'false', access_token: token }),
      }, { step: 'Facebook could not take a photo' });
      body[`attached_media[${i}]`] = JSON.stringify({ media_fbid: up.json.id });
    }
    const done = await http(`${FB}/${page}/feed`, { method: 'POST', body: form(body) }, { step: 'Facebook publish', final: true });
    return { id: done.json.id, permalink: `https://www.facebook.com/${done.json.id}` };
  },
};

// ---------------------------------------------------------------------------------------
// LinkedIn
// ---------------------------------------------------------------------------------------

const LI = 'https://api.linkedin.com';
let workingVersion = null;

// LinkedIn's API wants a version month in a header and retires each version after about a
// year. Hardcoding one month would stop the tool on the day it is retired, so the tool
// walks back from last month until LinkedIn accepts one, and remembers it.
export function linkedinVersions(today = new Date()) {
  const out = [];
  if (process.env.LINKEDIN_VERSION) out.push(String(process.env.LINKEDIN_VERSION));
  if (workingVersion) out.unshift(workingVersion);
  for (let i = 1; i <= 8; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    out.push(`${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return [...new Set(out)];
}
export const _resetLinkedinVersion = () => { workingVersion = null; };

async function li(path, token, init, opts) {
  let last;
  for (const v of linkedinVersions()) {
    try {
      const r = await http(`${LI}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, 'LinkedIn-Version': v, 'X-Restli-Protocol-Version': '2.0.0', 'Content-Type': 'application/json', ...((init && init.headers) || {}) },
      }, opts);
      workingVersion = v;
      return r;
    } catch (e) {
      const versionProblem = e.status === 426 || /NONEXISTENT_VERSION|VERSION_MISSING|version .* (is not active|not supported)/i.test(`${e.code} ${e.message}`);
      if (!versionProblem) throw e;
      e.ambiguous = false;
      last = e;
    }
  }
  throw last || new Error('LinkedIn did not accept any API version.');
}

// LinkedIn reads these characters as markup, so each is escaped. A plain #hashtag is written
// in LinkedIn's own hashtag form so that it still becomes a working hashtag.
export function linkedinText(s) {
  const escapePlain = (t) => t.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`);
  const text = String(s || '');
  const rx = /(^|[^\p{L}\p{N}_#])#([\p{L}\p{N}]+)(?![\p{L}\p{N}_])/gu;
  let out = '', at = 0, m;
  while ((m = rx.exec(text))) {
    out += escapePlain(text.slice(at, m.index) + m[1]) + `{hashtag|\\#|${m[2]}}`;
    at = m.index + m[0].length;
  }
  return out + escapePlain(text.slice(at));
}

const linkedin = {
  name: 'LinkedIn',
  env() {
    const id = process.env.LINKEDIN_CLIENT_ID, secret = process.env.LINKEDIN_CLIENT_SECRET;
    return { id, secret, missing: [!id && 'LINKEDIN_CLIENT_ID', !secret && 'LINKEDIN_CLIENT_SECRET'].filter(Boolean) };
  },
  authUrl({ redirect, state }) {
    return `https://www.linkedin.com/oauth/v2/authorization?${form({
      response_type: 'code', client_id: this.env().id, redirect_uri: redirect, scope: 'openid profile w_member_social', state,
    })}`;
  },
  async token(params) {
    const { id, secret } = this.env();
    const r = await http('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form({ ...params, client_id: id, client_secret: secret }),
    }, { step: 'LinkedIn sign-in' });
    return r.json;
  },
  async exchange({ code, redirect }) {
    const t = await this.token({ grant_type: 'authorization_code', code, redirect_uri: redirect });
    const me = await http(`${LI}/v2/userinfo`, { headers: { Authorization: `Bearer ${t.access_token}` } }, { step: 'LinkedIn profile lookup' });
    return [{
      platform: 'linkedin', external_id: `urn:li:person:${me.json.sub}`, username: me.json.name || null,
      access_token: t.access_token, refresh_token: t.refresh_token || null, token_expires_at: inSeconds(t.expires_in),
    }];
  },
  // LinkedIn gives a refresh token only to some apps. Without one, the access lasts 60 days
  // and the owner has to click Connect again; the dispatcher emails a reminder before then.
  async refresh(account) {
    if (!account.refresh_token) return null;
    const t = await this.token({ grant_type: 'refresh_token', refresh_token: account.refresh_token });
    return { access_token: t.access_token, refresh_token: t.refresh_token || account.refresh_token, token_expires_at: inSeconds(t.expires_in) };
  },
  async uploadImage(account, url) {
    let bytes, type;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      bytes = Buffer.from(await r.arrayBuffer());
      type = r.headers.get('content-type') || 'image/jpeg';
    } catch (e) {
      throw new Error(`The photo could not be downloaded from ${url} (${String((e && e.message) || e)}).`);
    }
    const init = await li('/rest/images?action=initializeUpload', account.access_token, {
      method: 'POST', body: JSON.stringify({ initializeUploadRequest: { owner: account.external_id } }),
    }, { step: 'LinkedIn photo upload' });
    const { uploadUrl, image } = init.json.value || {};
    if (!uploadUrl || !image) throw new Error('LinkedIn photo upload: LinkedIn did not return an upload address.');
    await http(uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': type }, body: bytes }, { step: 'LinkedIn photo upload' });
    return image;
  },
  async publish(account, post) {
    const media = post.media || [];
    if (media.some(isVideo)) throw new Error('This tool posts text and photos to LinkedIn. Video on LinkedIn is not supported yet.');
    const body = {
      author: account.external_id,
      commentary: linkedinText(post.caption),
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };
    const images = [];
    for (const m of media) images.push(await this.uploadImage(account, m.url));
    if (images.length === 1) body.content = { media: { id: images[0] } };
    if (images.length > 1) body.content = { multiImage: { images: images.map((id) => ({ id })) } };
    const done = await li('/rest/posts', account.access_token, { method: 'POST', body: JSON.stringify(body) }, { step: 'LinkedIn publish', final: true });
    const id = done.headers.get('x-restli-id') || done.json.id || null;
    return { id, permalink: id ? `https://www.linkedin.com/feed/update/${id}/` : null };
  },
};

export const PLATFORMS = { instagram, facebook, linkedin };
export const PLATFORM_KEYS = Object.keys(PLATFORMS);
