#!/usr/bin/env node
// The call to action that goes out on every post.
//
// Three things have to hold, and each has already been got wrong once:
//   1. The country count matches what getbueno.com publicly says. The site says 25+, the
//      internal brief said 28+, a draft of this line said 30+, and two posts say 28.
//      A number the reader can check has to be the number we use.
//   2. Every language links to a page that returns 200. The Nordic paths are COUNTRY codes,
//      not language codes: Swedish is /se and Danish is /dk. An earlier version of this
//      tested /sv, got a 404, and wrongly concluded there was no Swedish site.
//   3. It is never appended twice, however many times a post is edited or resent.
//   4. It is part of the post BEFORE review, not bolted on at send time. What John sees in
//      the deck, and whatever he edits it to, is exactly what the team receives. The send
//      path is forbidden from touching the text at all.

import { CTA, CTA_URL, withCta, imageSrc } from './api/_email.js';

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};
const ok_ = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log(`FAIL ${name} ${extra}`));

// Every language a team member actually posts in.
const TEAM_LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl', 'es'];
for (const l of TEAM_LANGS) {
  ok_(`${l}: a call to action exists`, typeof CTA[l] === 'string' && CTA[l].length > 40);
  ok_(`${l}: it links to getbueno.com`, /getbueno\.com/.test(CTA[l]));
  ok_(`${l}: it names the country count`, /\b25\b/.test(CTA[l]), CTA[l]);
  ok_(`${l}: it does not overclaim`, !/\b(?:28|30|35|40)\s*\+?\s*(?:countries|land|länder|Ländern|pays|landen|países)/i.test(CTA[l]), CTA[l]);
  // Brand rules apply to this line like any other.
  ok_(`${l}: no em dash`, !/[–—]/.test(CTA[l]));
  ok_(`${l}: no emoji`, !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(CTA[l]));
  ok_(`${l}: never says banking`, !/\bbank(?:ing)?\b/i.test(CTA[l]), CTA[l]);
  ok_(`${l}: no banned adjective`, !/revolutionary|disruptive|game.changing/i.test(CTA[l]));
}

// The link in the text has to be the link we verified, not a different one.
for (const l of TEAM_LANGS) {
  const inText = (CTA[l].match(/getbueno\.com\S*/) || [''])[0].replace(/[.,]$/, '');
  eq(`${l}: the link in the text matches the checked URL`, 'https://' + inText, CTA_URL[l]);
}

// Swedish goes to /se. Not /sv, which is a 404 and is the language code rather than the
// country code the site actually uses.
eq('Swedish points at the Swedish site', CTA_URL.sv, 'https://getbueno.com/se');
eq('Swedish never points at the 404', /getbueno\.com\/sv\b/.test(CTA.sv), false);
eq('Danish is /dk, not /da', CTA_URL.da, 'https://getbueno.com/dk');
// Every language a member posts in reaches a real page rather than the English homepage.
for (const l of ['no', 'sv', 'de', 'fr', 'nl', 'es']) {
  ok_(`${l}: goes to a locale page, not the English homepage`,
    CTA_URL[l] !== 'https://getbueno.com', CTA_URL[l]);
}

// --- appending ------------------------------------------------------------------
const post = 'Some post text about Spanish property.\n\n#SpainProperty';
ok_('the call to action is appended', withCta(post, 'no').endsWith(CTA.no));
ok_('the post itself is untouched', withCta(post, 'no').startsWith(post));
ok_('there is a blank line between them', withCta(post, 'no').includes('\n\n' + CTA.no));
eq('appending twice changes nothing', withCta(withCta(post, 'no'), 'no'), withCta(post, 'no'));
eq('a post that already links is left alone', withCta('Already says getbueno.com here', 'de'), 'Already says getbueno.com here');
eq('an unknown language falls back to English', withCta(post, 'zz'), withCta(post, 'en'));
eq('empty text still gets the line', withCta('', 'fr'), CTA.fr);
eq('null text still gets the line', withCta(null, 'es'), CTA.es);
ok_('trailing whitespace does not stack up', !/\n\n\n/.test(withCta(post + '\n\n\n', 'en')));

// --- image sources ----------------------------------------------------------------
// A post's image can be a path on our own site or a full URL on a stock CDN. Getting this
// wrong produces "https://www.247spain.eshttps://images.pexels.com/..." in six inboxes.
eq('a site path gets the site prefix', imageSrc('/photos/cove_house.jpg'), 'https://www.247spain.es/photos/cove_house.jpg');
eq('an https URL is left alone', imageSrc('https://images.pexels.com/photos/123/x.jpg'), 'https://images.pexels.com/photos/123/x.jpg');
eq('an http URL is left alone', imageSrc('http://example.com/a.jpg'), 'http://example.com/a.jpg');
eq('a protocol is matched case insensitively', imageSrc('HTTPS://images.pexels.com/a.jpg'), 'HTTPS://images.pexels.com/a.jpg');
eq('no image means no src', imageSrc(null), '');
eq('an empty image means no src', imageSrc(''), '');
ok_('a full URL is never double prefixed', !imageSrc('https://images.pexels.com/a.jpg').includes('247spain.es'));


// ---------------------------------------------------------------------------
// The CTA belongs to the post, not to the email.
//
// It used to be appended by the dispatcher, which meant a reviewer approved one thing and
// the team was sent another. Now _lk_refresh.js bakes it in when the row is written, and
// the send path passes the text through untouched. These tests hold that line.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs';

const dispatchSrc = readFileSync(new URL('./api/_dispatch.js', import.meta.url), 'utf8');
const decideSrc   = readFileSync(new URL('./api/_lk_decide.js', import.meta.url), 'utf8');
const refreshSrc  = readFileSync(new URL('./api/_lk_refresh.js', import.meta.url), 'utf8');

ok_('the dispatcher never appends anything', !/withCta/.test(dispatchSrc));
ok_('approval mail never appends anything', !/withCta/.test(decideSrc));
ok_('the refresh is what bakes the CTA in', /withCta\(p\.post_text, language\)/.test(refreshSrc));
ok_('the dispatcher sends the stored text as-is', /text: post\.edited_text \|\| post\.post_text/.test(dispatchSrc));
ok_('a translation is sent as-is too', /text: t\.edited_text \|\| t\.post_text/.test(dispatchSrc));

// An edit by the reviewer must survive to the inbox unchanged, CTA included or removed.
const edited = 'John rewrote this entirely.\n\nAnd left his own link: getbueno.com/no';
eq('an edited post is not re-appended to', withCta(edited, 'no'), edited);

// The image is resolved the same way: chosen once, stored on the row, never swapped later.
const { imageFor, IMAGE_COUNT } = await import('./api/_lk_images.js');
eq('every post has a photograph', IMAGE_COUNT, 105);
ok_('the refresh resolves the image too', /imageFor\(audience, day/.test(refreshSrc));
ok_('a post outside the map keeps whatever it had', imageFor('owners', 999, '/photos/x.jpg') === '/photos/x.jpg');
ok_('and gets null rather than a broken URL', imageFor('owners', 999) === null);
for (const [aud, day] of [['owners', 1], ['owners', 60], ['agents', 30], ['attorneys', 15]]) {
  const u = imageFor(aud, day);
  ok_(`${aud} ${day}: has an image`, typeof u === 'string' && u.startsWith('https://images.pexels.com/photos/'), String(u));
  ok_(`${aud} ${day}: renders at LinkedIn's ratio`, /w=1200&h=630&fit=crop$/.test(u), String(u));
}

// Nothing anywhere credits a photographer. The Pexels licence does not ask for it and the
// posts must read as ours.
for (const [name, src] of [['dispatch', dispatchSrc], ['decide', decideSrc], ['refresh', refreshSrc]]) {
  ok_(`${name}: never renders a credit`, !/photographer|photo credit|courtesy of/i.test(src));
}


// A Sync must not undo any of this, and must not swap reviewed copy for unrelated copy.
// Nine partner slugs point at different posts in the source modules than in the table.
ok_('a re-pointed slug is detected by title', /slugRepointed/.test(refreshSrc));
ok_('and only its image is refreshed', /\{ image_url: p\.image_url, updated_at/.test(refreshSrc));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
