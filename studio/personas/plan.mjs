// Writes studio/personas/plan.json: one entry per post and language, saying exactly which
// avatar, which persona photo and which words go into each reel. The renderer
// (render_reels.py) reads only this file, so the persona lock lives in one place
// (api/_fb_profiles.js) and fb_profiles.test.mjs can check the plan against it.
//
//   node studio/personas/plan.mjs
//
// Photo rule: a language draws from its own persona's list only. Languages that share a
// persona start at different points in the list, so on any one day they show different
// photos, and within one account a photo does not come back until the whole list has been used.
import { readFileSync, writeFileSync } from 'node:fs';
import { PROFILE_POSTS, LANGS7, PERSONA_BY_LANG, PERSONAS, AVATAR, PROFILE_ORDER } from '../../api/_fb_profiles.js';

const here = new URL('.', import.meta.url);
const pools = JSON.parse(readFileSync(new URL('photos.json', here), 'utf8'));

// Where each language starts in its persona's list.
const LANGS_OF = {};
for (const l of LANGS7) (LANGS_OF[PERSONA_BY_LANG[l]] ||= []).push(l);

const items = [];
PROFILE_ORDER.forEach((key, i) => {
  const post = PROFILE_POSTS.find(p => p.key === key);
  for (const lang of LANGS7) {
    const persona = PERSONA_BY_LANG[lang];
    const pool = pools[persona];
    const sharing = LANGS_OF[persona];
    const offset = Math.floor((sharing.indexOf(lang) * pool.length) / sharing.length);
    // Three photos per reel, one per scene: the lead photo walks the list day by day,
    // the other two sit 7 and 14 places further on, so all three are always different.
    const photos = [0, 7, 14].map(k => pool[(offset + i + k) % pool.length]);
    const photo = photos[0];
    for (const ph of photos) if (!ph.startsWith(`Claude outputs/${PERSONAS[persona]}/`)) throw new Error(`${lang}: ${ph} is not a ${PERSONAS[persona]} photo`);
    items.push({
      key, lang, persona, folder: PERSONAS[persona],
      avatar: `public/ig-setup/${AVATAR[lang].split('/').pop()}`,
      photo, photos, lines: post.overlay[lang],
    });
  }
});

writeFileSync(new URL('plan.json', here), JSON.stringify({ items }, null, 1));
console.log(`plan.json: ${items.length} reels`);
