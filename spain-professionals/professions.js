// What each of the eight professions actually is, and what to ask before engaging one.
//
// WHY THIS FILE EXISTS
// A Norwegian owner does not know what a gestoría is, how it differs from an abogado, or
// why an administrador de fincas keeps emailing them. That gap is the single most useful
// thing this page can close, and it cannot be closed by a directory listing. So the page
// explains the profession before it shows any names.
//
// The prose itself lives in the locale files, because it has to read naturally in six
// languages. This file is only the shape: which keys make up an explainer, in which order.
//
// WHAT IS DELIBERATELY NOT HERE
// Prices. Fees for these professions vary by town, by firm and by job, and several of them
// are negotiated rather than published. A number we cannot stand behind would be worse
// than no number, so `cost` describes HOW someone charges and never how much. See
// pro_ex_cost_note, which says that on the page rather than leaving the reader to wonder.

import { PROFESSIONALS } from '../spain-directory/categories.js';

// The four things a reader needs before a list of names means anything, in the order they
// need them: what this person is, whether it is them they need, what the money looks like,
// and what to say when they get someone on the phone.
export const EXPLAINER_PARTS = [
  { key: 'does', label: 'pro_ex_does' },
  { key: 'when', label: 'pro_ex_when' },
  { key: 'cost', label: 'pro_ex_cost' },
];

export const PROFESSION_SLUGS = PROFESSIONALS.map(p => p.slug);

// i18n key helpers, kept in one place so a renamed key breaks in one file rather than five.
export const doesKey = (slug) => `pro_does_${slug}`;
export const whenKey = (slug) => `pro_when_${slug}`;
export const costKey = (slug) => `pro_cost_${slug}`;
export const askKey  = (slug) => `pro_ask_${slug}`;
export const nameKey = (slug) => `cat_${slug}`;
export const pluralKey = (slug) => `cat_${slug}_pl`;

export const partKey = (slug, part) =>
  part === 'does' ? doesKey(slug) : part === 'when' ? whenKey(slug) : costKey(slug);
