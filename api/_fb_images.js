// The image that goes with each post, one per language.
//
// WHAT CHANGED ON 8 OCTOBER 2026
// Until then every language shared one stock photograph. Pratik asked for the format of the
// 24/7 Spain infographics instead, with the text on the image, and for the text on the image
// to be in the post's own language. So each post now has seven images: the English post gets
// the English image, the Norwegian post the Norwegian one, and so on.
//
// WHERE THEY COME FROM
// studio/renderer/fb_cards.py renders them from studio/facebook/cards/<lang>.json, on top of
// the approved simple3 editorial template. They are committed under public/fb-cards/ and
// served by the site at https://www.247spain.es/fb-cards/<post>/<lang>.jpg. To change the
// text on an image, edit the card JSON for that language and render again.
//
// WHAT CHANGED LATER ON 8 OCTOBER 2026
// Pratik: the logo sat in a white box and every image looked the same. The images are now
// rendered by studio/renderer/fb_cards2.py from studio/facebook/cards2/<lang>.json: six
// templates that differ in structure, a transparent logo, and sixteen licensed photos in
// studio/photos. No two posts in a row share a template. Version 2.
//
// CARD_VERSION goes on the end of every address. Bump it after a re-render so that nobody,
// email clients included, keeps showing an old copy.
import { IDEAS, LANGS } from './_fb_content.js';

const SITE = 'https://www.247spain.es';
export const CARD_VERSION = '4';

export const cardFor = (ideaKey, lang = 'en') =>
  `${SITE}/fb-cards/${ideaKey}/${LANGS.includes(lang) ? lang : 'en'}.jpg?v=${CARD_VERSION}`;

// Every language's image for one post, in the order the email prints them.
export const cardsFor = (ideaKey) => Object.fromEntries(LANGS.map(l => [l, cardFor(ideaKey, l)]));

// The deck shows the English image. There is nothing to choose between any more, so the
// only option offered is the post's own English image; a pasted address still works.
export function imageOptionsFor(ideaKey) {
  return IDEAS.some(i => i.key === ideaKey) ? [cardFor(ideaKey, 'en')] : [];
}

export function imageFor(ideaKey, fallback = null) {
  const opts = imageOptionsFor(ideaKey);
  return opts.length ? opts[0] : (fallback ?? null);
}

// Is this address one of our own post images? A custom image pasted in the deck is not, and
// then the email uses that one image for every language, because it is what Pratik chose.
export const isCard = (url) => typeof url === 'string' && url.startsWith(`${SITE}/fb-cards/`);

export const IMAGE_KEYS = IDEAS.map(i => i.key);
