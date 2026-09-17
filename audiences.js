// Who the site is for.
//
// Spain 24/7 has one section per audience. Owners are the default and live at the root,
// exactly as before. Each professional audience has its own hub page, and every tool says
// which audiences it serves in its own meta.js:
//
//   audiences: ['agents', 'lawyers']
//
// A tool with no `audiences` field is an owner tool. That default is deliberate: it means
// the sixteen existing tools did not need to be touched for this split, and the owner home
// page shows exactly what it showed before.
//
// To add an audience (gestores, tax advisers, property managers):
//   1. add it to AUDIENCES and give it labels in all six languages below,
//   2. create its hub folder with index.jsx, meta.js and copy.js (copy for-lawyers/),
//   3. add its hub to TOOL_COPY in seo/copy.js so the static page has a title.
// Nothing else changes. The internal decks do not read this file and are not affected.

export const AUDIENCES = [
  { key: 'owners',  path: '/' },
  { key: 'agents',  path: '/for-agents' },
  { key: 'lawyers', path: '/for-lawyers' },
];

export const AUDIENCE_KEYS = AUDIENCES.map(a => a.key);

// The group a hub page's meta.js carries. Hubs are pages, not tools, so the owner grid
// never lists them.
export const HUB_GROUP = 'audience';

export function audiencesOf(meta) {
  const list = meta && Array.isArray(meta.audiences) ? meta.audiences.filter(a => AUDIENCE_KEYS.includes(a)) : [];
  return list.length ? list : ['owners'];
}

export function isForAudience(meta, key) {
  if (!meta || meta.group === HUB_GROUP) return false;
  return audiencesOf(meta).includes(key);
}

export const AUDIENCE_LABELS = {
  en: { lead: 'This site is for', owners: 'Property owners', agents: 'Estate agents', lawyers: 'Lawyers', switch_label: 'Choose who you are', for_agents: 'For estate agents', for_lawyers: 'For lawyers' },
  no: { lead: 'Denne siden er for', owners: 'Boligeiere', agents: 'Eiendomsmeglere', lawyers: 'Advokater', switch_label: 'Velg hvem du er', for_agents: 'For meglere', for_lawyers: 'For advokater' },
  sv: { lead: 'Den här sidan är för', owners: 'Fastighetsägare', agents: 'Fastighetsmäklare', lawyers: 'Advokater', switch_label: 'Välj vem du är', for_agents: 'För mäklare', for_lawyers: 'För advokater' },
  de: { lead: 'Diese Seite ist für', owners: 'Eigentümer', agents: 'Immobilienmakler', lawyers: 'Anwälte', switch_label: 'Wählen Sie, wer Sie sind', for_agents: 'Für Makler', for_lawyers: 'Für Anwälte' },
  fr: { lead: 'Ce site est pour', owners: 'Propriétaires', agents: 'Agents immobiliers', lawyers: 'Avocats', switch_label: 'Choisissez votre profil', for_agents: 'Pour les agents', for_lawyers: 'Pour les avocats' },
  nl: { lead: 'Deze site is voor', owners: 'Eigenaren', agents: 'Makelaars', lawyers: 'Advocaten', switch_label: 'Kies wie u bent', for_agents: 'Voor makelaars', for_lawyers: 'Voor advocaten' },
};

export function audienceLabels(locale) {
  return AUDIENCE_LABELS[locale] || AUDIENCE_LABELS.en;
}
