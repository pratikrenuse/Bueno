// Every word that ends up in a title, a description, an H1 or a static intro paragraph.
//
// WHY THIS FILE IS SEPARATE FROM routes.js
// routes.js decides which URLs exist. This file decides what they say. Keeping them apart
// means a copy change never risks changing the URL set, which is the thing a sitemap and a
// set of canonicals depend on being stable.
//
// PURE ON PURPOSE. Nothing here touches the filesystem and nothing here imports a locale
// JSON file. That keeps the module safe to import from the browser bundle as well as from
// the Node build scripts, so the on page linking work and the prerender can share it.
//
// A NOTE ON WHERE THE SENTENCES CAME FROM
// The static block is a no JavaScript fallback that React paints over. It must not say
// anything the rendered app does not also say. So the method, language and honesty
// sentences below are the ones already in the six locale files, shortened but not changed
// in meaning: calc_directory.method_1, method_3, method_lang, honest_1, honest_2,
// meta_free and sorted_note. The town, province and coast sentences are our own facts from
// localities.js. Nothing here comes from Google.

export const SITE_ORIGIN = 'https://www.247spain.es';
export const SITE_NAME = 'Spain 24/7';

export const LOCALES = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
export const DEFAULT_LOCALE = 'en';

export const HREFLANG = { en: 'en', no: 'no', sv: 'sv', de: 'de', fr: 'fr', nl: 'nl' };
export const OG_LOCALE = { en: 'en_GB', no: 'nb_NO', sv: 'sv_SE', de: 'de_DE', fr: 'fr_FR', nl: 'nl_NL' };

export const TITLE_MIN = 20;
export const TITLE_MAX = 65;
export const DESC_MIN = 110;
export const DESC_MAX = 165;

// --- small helpers ------------------------------------------------------------------

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// FNV-1a. Deterministic between builds, which is the whole point: the same town and trade
// must pick the same title pattern every time or every rebuild churns the whole sitemap.
export function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function rotate(list, n) {
  if (!list.length) return list;
  const k = n % list.length;
  return list.slice(k).concat(list.slice(0, k));
}

function trimTo(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:]+$/, '');
}

// Pick the first candidate title that lands inside the length window, starting the search
// at a position derived from the page's own slug. That is what stops two thousand town
// pages all using pattern one.
export function fitTitle(candidates, seed, site = SITE_NAME) {
  const ordered = rotate(candidates.filter(Boolean), hash(seed));
  for (const c of ordered) {
    if (c.length >= TITLE_MIN && c.length <= TITLE_MAX) return c;
  }
  // Nothing landed. Grow the shortest one, or trim the longest, rather than shipping a
  // title the gate will reject.
  const short = ordered.filter(c => c.length < TITLE_MIN).sort((a, b) => b.length - a.length)[0];
  if (short) {
    const grown = `${short} | ${site}`;
    if (grown.length <= TITLE_MAX) return grown;
  }
  const any = ordered.sort((a, b) => a.length - b.length)[0] || site;
  return trimTo(any, TITLE_MAX);
}

// A title and an H1 that read the same are a wasted heading, and the build gate rejects it.
// When the pattern rotation happens to land on the H1, take the next candidate instead.
//
// This lives here rather than in routes.js because the hub pages set their own document
// title on the client, and it has to be the same string the prerendered file carries. Two
// implementations of "pick a title" would eventually disagree.
export function distinctTitle(candidates, seed, h1) {
  const first = fitTitle(candidates, seed);
  if (first.toLowerCase() !== String(h1).toLowerCase()) return first;
  const rest = candidates.filter(c => c.toLowerCase() !== String(h1).toLowerCase());
  return rest.length ? fitTitle(rest, seed + '#alt') : `${first} | ${SITE_NAME}`;
}

// Assemble a description out of sentences until it is long enough, never past the ceiling.
// Descriptions that differ only in a town name read as duplicates to a person and very
// nearly to a crawler, so the lead sentence has variants too and the tail is rotated.
//
// The search over leads and over rotations of the tail is what stops the odd page landing a
// few characters short of the floor. Sentence lengths differ between six languages and one
// fixed order cannot land inside a 55 character window every time. The first combination
// tried is the plain rotation, so this only does extra work where the plain rotation failed.
export function fitDesc({ leads, tail }, seed) {
  const seedN = hash(seed + '#d');
  const orderedLeads = rotate((leads || []).filter(Boolean), seedN);
  const pool = rotate((tail || []).filter(Boolean), seedN);
  let best = '';

  for (const lead of orderedLeads) {
    const base = lead.length > DESC_MAX ? trimTo(lead, DESC_MAX - 1) + '.' : lead;
    for (let shift = 0; shift < Math.max(1, pool.length); shift++) {
      const tries = rotate(pool, shift);
      let out = base;
      for (const s of tries) {
        if (out.length >= DESC_MIN) break;
        if (out.length + 1 + s.length <= DESC_MAX) out = `${out} ${s}`;
      }
      if (out.length >= DESC_MIN && out.length <= DESC_MAX) return out;
      if (out.length > best.length && out.length <= DESC_MAX) best = out;
    }
  }
  return best || (orderedLeads[0] || '');
}

export function shortTownName(name) {
  return String(name).replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s*\/\s*/g, ' / ').trim();
}

export function localePath(locale, path) {
  const clean = path === '/' ? '' : path;
  if (locale === DEFAULT_LOCALE) return clean || '/';
  return `/${locale}${clean}`;
}

export function absolute(path) {
  return SITE_ORIGIN + (path === '/' ? '/' : path);
}

// --- category names, taken verbatim from the six locale files so the static block and
// the rendered page always use the same word for the same trade ------------------------

export const CAT_NAME = {
  en: {
    plumber: "Plumber",
    electrician: "Electrician",
    locksmith: "Locksmith",
    aircon: "Air conditioning and heating",
    pool: "Pool maintenance",
    builder: "Builder and reformas",
    "real-estate": "Estate agent",
    lawyer: "Property lawyer",
    gestoria: "Gestoría",
    architect: "Architect",
    "community-admin": "Community administrator",
    surveyor: "Surveyor and valuer",
    insurance: "Insurance broker",
    translator: "Sworn translator"
  },
  no: {
    plumber: "Rørlegger",
    electrician: "Elektriker",
    locksmith: "Låsesmed",
    aircon: "Klimaanlegg og varme",
    pool: "Vedlikehold av basseng",
    builder: "Byggmester og oppussing",
    "real-estate": "Eiendomsmegler",
    lawyer: "Eiendomsadvokat",
    gestoria: "Gestoría",
    architect: "Arkitekt",
    "community-admin": "Sameieforvalter",
    surveyor: "Takstmann",
    insurance: "Forsikringsmegler",
    translator: "Statsautorisert translatør"
  },
  sv: {
    plumber: "Rörmokare",
    electrician: "Elektriker",
    locksmith: "Låssmed",
    aircon: "Luftkonditionering och värme",
    pool: "Poolunderhåll",
    builder: "Byggare och renovering",
    "real-estate": "Fastighetsmäklare",
    lawyer: "Fastighetsjurist",
    gestoria: "Gestoría",
    architect: "Arkitekt",
    "community-admin": "Föreningsförvaltare",
    surveyor: "Värderingsman",
    insurance: "Försäkringsmäklare",
    translator: "Auktoriserad översättare"
  },
  de: {
    plumber: "Installateur",
    electrician: "Elektriker",
    locksmith: "Schlüsseldienst",
    aircon: "Klimaanlage und Heizung",
    pool: "Poolwartung",
    builder: "Bauunternehmen und Renovierung",
    "real-estate": "Immobilienmakler",
    lawyer: "Immobilienanwalt",
    gestoria: "Gestoría",
    architect: "Architekt",
    "community-admin": "Hausverwaltung",
    surveyor: "Gutachter",
    insurance: "Versicherungsmakler",
    translator: "Beeidigter Übersetzer"
  },
  fr: {
    plumber: "Plombier",
    electrician: "Électricien",
    locksmith: "Serrurier",
    aircon: "Climatisation et chauffage",
    pool: "Entretien de piscine",
    builder: "Entreprise de rénovation",
    "real-estate": "Agent immobilier",
    lawyer: "Avocat immobilier",
    gestoria: "Gestoría",
    architect: "Architecte",
    "community-admin": "Syndic de copropriété",
    surveyor: "Expert immobilier",
    insurance: "Courtier en assurance",
    translator: "Traducteur assermenté"
  },
  nl: {
    plumber: "Loodgieter",
    electrician: "Elektricien",
    locksmith: "Slotenmaker",
    aircon: "Airconditioning en verwarming",
    pool: "Zwembadonderhoud",
    builder: "Aannemer en verbouwing",
    "real-estate": "Makelaar",
    lawyer: "Vastgoedadvocaat",
    gestoria: "Gestoría",
    architect: "Architect",
    "community-admin": "VvE-beheerder",
    surveyor: "Taxateur",
    insurance: "Verzekeringsmakelaar",
    translator: "Beëdigd vertaler"
  }
};

export const CAT_PL = {
  en: {
    plumber: "plumbers",
    electrician: "electricians",
    locksmith: "locksmiths",
    aircon: "air conditioning engineers",
    pool: "pool services",
    builder: "builders",
    "real-estate": "estate agents",
    lawyer: "property lawyers",
    gestoria: "gestorías",
    architect: "architects",
    "community-admin": "community administrators",
    surveyor: "surveyors and valuers",
    insurance: "insurance brokers",
    translator: "sworn translators"
  },
  no: {
    plumber: "rørleggere",
    electrician: "elektrikere",
    locksmith: "låsesmeder",
    aircon: "klimateknikere",
    pool: "bassengfirmaer",
    builder: "byggmestere",
    "real-estate": "eiendomsmeglere",
    lawyer: "eiendomsadvokater",
    gestoria: "gestorías",
    architect: "arkitekter",
    "community-admin": "sameieforvaltere",
    surveyor: "takstmenn",
    insurance: "forsikringsmeglere",
    translator: "statsautoriserte translatører"
  },
  sv: {
    plumber: "rörmokare",
    electrician: "elektriker",
    locksmith: "låssmeder",
    aircon: "luftkonditioneringstekniker",
    pool: "poolfirmor",
    builder: "byggare",
    "real-estate": "fastighetsmäklare",
    lawyer: "fastighetsjurister",
    gestoria: "gestorías",
    architect: "arkitekter",
    "community-admin": "föreningsförvaltare",
    surveyor: "värderingsmän",
    insurance: "försäkringsmäklare",
    translator: "auktoriserade översättare"
  },
  de: {
    plumber: "Installateure",
    electrician: "Elektriker",
    locksmith: "Schlüsseldienste",
    aircon: "Klimatechniker",
    pool: "Poolservices",
    builder: "Bauunternehmen",
    "real-estate": "Immobilienmakler",
    lawyer: "Immobilienanwälte",
    gestoria: "Gestorías",
    architect: "Architekten",
    "community-admin": "Hausverwaltungen",
    surveyor: "Gutachter",
    insurance: "Versicherungsmakler",
    translator: "beeidigte Übersetzer"
  },
  fr: {
    plumber: "plombiers",
    electrician: "électriciens",
    locksmith: "serruriers",
    aircon: "climaticiens",
    pool: "services de piscine",
    builder: "entreprises de rénovation",
    "real-estate": "agents immobiliers",
    lawyer: "avocats immobiliers",
    gestoria: "gestorías",
    architect: "architectes",
    "community-admin": "syndics de copropriété",
    surveyor: "experts immobiliers",
    insurance: "courtiers en assurance",
    translator: "traducteurs assermentés"
  },
  nl: {
    plumber: "loodgieters",
    electrician: "elektriciens",
    locksmith: "slotenmakers",
    aircon: "airco-monteurs",
    pool: "zwembadservices",
    builder: "aannemers",
    "real-estate": "makelaars",
    lawyer: "vastgoedadvocaten",
    gestoria: "gestorías",
    architect: "architecten",
    "community-admin": "VvE-beheerders",
    surveyor: "taxateurs",
    insurance: "verzekeringsmakelaars",
    translator: "beëdigde vertalers"
  }
};

// --- breadcrumb and section labels, matching the words the app's own menu uses ---------

export const UI = {
  en: { home: 'Home', areas: 'Areas', trades: 'Home repairs', pros: 'Property experts', tools: 'Free tools' },
  no: { home: 'Hjem', areas: 'Områder', trades: 'Reparasjoner', pros: 'Boligeksperter', tools: 'Gratis verktøy' },
  sv: { home: 'Hem', areas: 'Områden', trades: 'Reparationer', pros: 'Bostadsexperter', tools: 'Gratis verktyg' },
  de: { home: 'Startseite', areas: 'Regionen', trades: 'Reparaturen', pros: 'Immobilienexperten', tools: 'Gratis-Tools' },
  fr: { home: 'Accueil', areas: 'Régions', trades: 'Réparations', pros: 'Experts immobiliers', tools: 'Outils gratuits' },
  nl: { home: 'Home', areas: "Regio's", trades: 'Reparaties', pros: 'Vastgoedexperts', tools: 'Gratis tools' },
};

// A tool page says the same thing in six languages. Ten of the sixteen tools run their
// own screens in English only, which is why LOCALE_ENGLISH_NOTE exists: on a locale
// prefixed URL for one of those, the static block says so plainly rather than implying a
// translation that is not there.
export const LOCALE_ENGLISH_NOTE = {
  en: '',
  no: 'Selve verktøyet kjører på engelsk.',
  sv: 'Själva verktyget körs på engelska.',
  de: 'Das Tool selbst läuft auf Englisch.',
  fr: "L'outil lui même fonctionne en anglais.",
  nl: 'De tool zelf is in het Engels.',
};

export const TOOL_TAIL = {
  en: ['Free, and no sign up.', 'Built for people who own in Spain and live somewhere else.', 'It takes a few minutes.'],
  no: ['Gratis, og ingen registrering.', 'Laget for deg som eier i Spania og bor et annet sted.', 'Det tar noen få minutter.'],
  sv: ['Gratis, och ingen registrering.', 'Gjort för dig som äger i Spanien och bor någon annanstans.', 'Det tar några minuter.'],
  de: ['Kostenlos und ohne Anmeldung.', 'Für Menschen, die in Spanien besitzen und woanders leben.', 'Es dauert wenige Minuten.'],
  fr: ['Gratuit, sans inscription.', 'Pensé pour ceux qui possèdent en Espagne et vivent ailleurs.', 'Quelques minutes suffisent.'],
  nl: ['Gratis, en zonder aanmelden.', 'Gemaakt voor wie in Spanje bezit en elders woont.', 'Het kost een paar minuten.'],
};

// Per tool, per locale: the page heading, the sentence that leads the description, and one
// more sentence of substance. The title tag is assembled from the heading, so the heading
// is deliberately short.
export const TOOL_COPY = {
  'tax-calculator': {
    en: { h1: 'Spanish property tax calculator', lead: 'Work out the Modelo 210 you owe on a Spanish property you do not live in.', extra: 'Personal use, holiday letting, long term letting and mixed use, plus any unfiled years.' },
    no: { h1: 'Kalkulator for spansk eiendomsskatt', lead: 'Regn ut hvor mye Modelo 210 du skylder på en spansk bolig du ikke bor i.', extra: 'Egen bruk, ferieutleie, langtidsutleie og blandet bruk, og år du ennå ikke har levert.' },
    sv: { h1: 'Kalkylator för spansk fastighetsskatt', lead: 'Räkna ut hur mycket Modelo 210 du ska betala för en spansk bostad du inte bor i.', extra: 'Egen användning, semesteruthyrning, långtidsuthyrning, blandat bruk och odeklarerade år.' },
    de: { h1: 'Steuerrechner für spanische Immobilien', lead: 'Berechnen Sie die Modelo 210, die Sie ohne Wohnsitz für eine spanische Immobilie schulden.', extra: 'Eigennutzung, Ferienvermietung, Dauervermietung, gemischte Nutzung und offene Jahre.' },
    fr: { h1: 'Calculateur du Modelo 210 espagnol', lead: "Calculez le Modelo 210 dû sur un bien espagnol que vous n'habitez pas.", extra: 'Usage personnel, location saisonnière, location longue durée et années non déclarées.' },
    nl: { h1: 'Rekenhulp Spaanse woningbelasting', lead: 'Bereken de Modelo 210 die u verschuldigd bent voor een Spaanse woning waar u niet woont.', extra: 'Eigen gebruik, vakantieverhuur, langdurige verhuur, gemengd gebruik en openstaande jaren.' },
  },
  'cost-audit': {
    en: { h1: 'Spanish property cost audit', lead: 'See what your Spanish home actually costs you over a year, line by line.', extra: 'Account fees, energy, water, insurance and the community charge, with the overpayment shown.' },
    no: { h1: 'Kostnadsgjennomgang for spansk bolig', lead: 'Se hva den spanske boligen din faktisk koster deg i løpet av et år, post for post.', extra: 'Kontogebyrer, strøm, vann, forsikring og fellesutgifter, med overbetalingen vist.' },
    sv: { h1: 'Kostnadsgenomgång för spansk bostad', lead: 'Se vad din spanska bostad faktiskt kostar dig under ett år, post för post.', extra: 'Kontoavgifter, el, vatten, försäkring och samfällighetsavgift, med överbetalningen synlig.' },
    de: { h1: 'Kostenprüfung für spanische Immobilien', lead: 'Sehen Sie, was Ihre spanische Immobilie im Jahr wirklich kostet, Posten für Posten.', extra: 'Kontogebühren, Strom, Wasser, Versicherung und Gemeinschaftskosten, samt Überzahlung.' },
    fr: { h1: "Audit des coûts d'un bien espagnol", lead: 'Voyez ce que votre logement espagnol vous coûte vraiment sur une année, poste par poste.', extra: 'Frais de compte, énergie, eau, assurance et charges de copropriété, avec le trop payé.' },
    nl: { h1: 'Kostenoverzicht Spaanse woning', lead: 'Zie wat uw Spaanse woning u in een jaar werkelijk kost, post voor post.', extra: 'Rekeningkosten, energie, water, verzekering en servicekosten, met het te veel betaalde.' },
  },
  'rental-tax': {
    en: { h1: 'Rental income tax in Spain', lead: 'Work out the Spanish tax on your rental income after every deduction you can claim.', extra: 'EU and EEA residents can deduct expenses, utilities, management and depreciation.' },
    no: { h1: 'Skatt på leieinntekt i Spania', lead: 'Regn ut den spanske skatten på leieinntekten din etter alle fradrag du kan kreve.', extra: 'Bosatte i EU og EØS kan trekke fra utgifter, strøm, forvaltning og avskrivning.' },
    sv: { h1: 'Skatt på hyresintäkter i Spanien', lead: 'Räkna ut den spanska skatten på dina hyresintäkter efter alla avdrag du får göra.', extra: 'Boende i EU och EES får dra av kostnader, el, förvaltning och avskrivning.' },
    de: { h1: 'Steuer auf Mieteinnahmen in Spanien', lead: 'Berechnen Sie die spanische Steuer auf Ihre Mieteinnahmen nach allen möglichen Abzügen.', extra: 'In EU und EWR Ansässige setzen Kosten, Energie, Verwaltung und Abschreibung ab.' },
    fr: { h1: 'Impôt sur les revenus locatifs espagnols', lead: "Calculez l'impôt espagnol sur vos revenus locatifs après toutes les déductions possibles.", extra: "Les résidents de l'UE et de l'EEE déduisent charges, énergie, gestion et amortissement." },
    nl: { h1: 'Belasting op huurinkomsten in Spanje', lead: 'Bereken de Spaanse belasting op uw huurinkomsten na alle aftrekposten die u mag opvoeren.', extra: 'Inwoners van de EU en EER mogen kosten, energie, beheer en afschrijving aftrekken.' },
  },
  'mortgage-claim': {
    en: { h1: 'Spanish mortgage compensation check', lead: 'Took out a Spanish mortgage between 2000 and 2019? Some of the cost may be reclaimable.', extra: 'Set up fees, floor clause interest and insurance sold alongside the loan.' },
    no: { h1: 'Sjekk krav på spansk boliglån', lead: 'Tok du opp spansk boliglån mellom 2000 og 2019? Deler av kostnaden kan kreves tilbake.', extra: 'Etableringsgebyr, rentegulv og forsikring som ble solgt sammen med lånet.' },
    sv: { h1: 'Kolla krav på spanskt bolån', lead: 'Tog du ett spanskt bolån mellan 2000 och 2019? Delar av kostnaden kan krävas tillbaka.', extra: 'Uppläggningsavgift, räntegolv och försäkring som såldes ihop med lånet.' },
    de: { h1: 'Spanische Hypothekenkosten prüfen', lead: 'Spanische Hypothek zwischen 2000 und 2019 aufgenommen? Ein Teil ist oft rückforderbar.', extra: 'Bearbeitungsgebühren, Mindestzinsklauseln und mitverkaufte Versicherungen.' },
    fr: { h1: "Frais d'un prêt immobilier espagnol", lead: 'Prêt immobilier espagnol entre 2000 et 2019 ? Une partie des frais est souvent récupérable.', extra: 'Frais de dossier, clause plancher et assurance vendue avec le prêt.' },
    nl: { h1: 'Spaanse hypotheekkosten terugvorderen', lead: 'Spaanse hypotheek afgesloten tussen 2000 en 2019? Een deel is vaak terug te vorderen.', extra: 'Afsluitkosten, rentevloerclausules en verzekeringen die bij de lening werden verkocht.' },
  },
  'closing-up': {
    en: { h1: 'Closing up a Spanish home', lead: 'Leaving the property empty for a few weeks or a whole winter? Get a dated last day list.', extra: 'Built around how long you are away, the season, and whether anyone is checking on it.' },
    no: { h1: 'Stenge ned den spanske boligen', lead: 'Skal boligen stå tom noen uker eller hele vinteren? Få en datert liste for siste dag.', extra: 'Bygget på hvor lenge du er borte, årstiden, og om noen ser til boligen.' },
    sv: { h1: 'Stänga ner den spanska bostaden', lead: 'Ska bostaden stå tom några veckor eller hela vintern? Få en daterad lista för sista dagen.', extra: 'Byggd på hur länge du är borta, årstiden, och om någon ser till bostaden.' },
    de: { h1: 'Spanische Immobilie sicher schließen', lead: 'Steht die Immobilie Wochen oder den ganzen Winter leer? Eine Liste für den letzten Tag.', extra: 'Abgestimmt auf die Dauer, die Jahreszeit und darauf, ob jemand nach dem Haus sieht.' },
    fr: { h1: 'Fermer sa maison en Espagne', lead: "Le logement reste vide quelques semaines ou tout l'hiver ? Une liste pour le dernier jour.", extra: "Adaptée à la durée de l'absence, à la saison, et au fait que quelqu'un passe ou non." },
    nl: { h1: 'Spaanse woning afsluiten', lead: 'Blijft de woning enkele weken of de hele winter leeg? Een lijst voor de laatste dag.', extra: 'Afgestemd op hoe lang u weg bent, het seizoen, en of iemand naar de woning omkijkt.' },
  },
  'storm-claim': {
    en: { h1: 'Storm and flood damage in Spain', lead: 'After a storm or a flood in Spain, the claim does not always go to your own insurer.', extra: 'Four questions and you know whether it is the policy or the Consorcio that answers.' },
    no: { h1: 'Storm og flomskade i Spania', lead: 'Etter storm eller flom i Spania går ikke kravet alltid til ditt eget forsikringsselskap.', extra: 'Fire spørsmål, og du vet om det er polisen eller Consorcio som svarer.' },
    sv: { h1: 'Storm och översvämning i Spanien', lead: 'Efter storm eller översvämning i Spanien går anspråket inte alltid till ditt eget bolag.', extra: 'Fyra frågor, och du vet om det är försäkringen eller Consorcio som svarar.' },
    de: { h1: 'Sturm und Hochwasser in Spanien', lead: 'Nach Sturm oder Hochwasser in Spanien geht der Schaden nicht immer an Ihren Versicherer.', extra: 'Vier Fragen, und Sie wissen, ob die Police oder das Consorcio zuständig ist.' },
    fr: { h1: 'Tempête et inondation en Espagne', lead: "Après une tempête ou une inondation en Espagne, le sinistre ne va pas toujours à l'assureur.", extra: "Quatre questions, et vous savez si c'est le contrat ou le Consorcio qui répond." },
    nl: { h1: 'Storm en overstroming in Spanje', lead: 'Na storm of overstroming in Spanje gaat de claim niet altijd naar uw eigen verzekeraar.', extra: 'Vier vragen, en u weet of de polis of het Consorcio aan zet is.' },
  },
  'maintenance-schedule': {
    en: { h1: 'A maintenance year in Spain', lead: 'Sun, salt and a wet winter break different things at different times of the year.', extra: 'Five questions and you get a twelve month schedule, each job saying what it prevents.' },
    no: { h1: 'Vedlikeholdsår for spansk bolig', lead: 'Sol, salt og en våt vinter ødelegger forskjellige ting til forskjellige tider av året.', extra: 'Fem spørsmål gir en tolv måneders plan, der hver jobb sier hva den forhindrer.' },
    sv: { h1: 'Underhållsår för spansk bostad', lead: 'Sol, salt och en blöt vinter sliter på olika saker vid olika tider på året.', extra: 'Fem frågor ger ett tolvmånadersschema, där varje jobb säger vad det förebygger.' },
    de: { h1: 'Wartungsjahr für spanische Immobilien', lead: 'Sonne, Salz und ein nasser Winter setzen zu verschiedenen Zeiten Verschiedenem zu.', extra: 'Fünf Fragen und Sie erhalten einen Zwölfmonatsplan, jede Aufgabe mit ihrem Zweck.' },
    fr: { h1: "Année d'entretien en Espagne", lead: 'Le soleil, le sel et un hiver humide abîment des choses différentes selon la saison.', extra: 'Cinq questions et vous obtenez un calendrier de douze mois, chaque tâche expliquée.' },
    nl: { h1: 'Onderhoudsjaar voor uw Spaanse woning', lead: 'Zon, zout en een natte winter tasten op verschillende momenten verschillende dingen aan.', extra: 'Vijf vragen en u krijgt een schema van twaalf maanden, met per klus wat die voorkomt.' },
  },
  'pest-plan': {
    en: { h1: 'Pests a Spanish property attracts', lead: 'Warm weather, a garden and long empty periods each attract something different.', extra: 'Five questions, then the likely pests, the early signs, and which are not a job for you.' },
    no: { h1: 'Skadedyr i spanske boliger', lead: 'Varmt vær, en hage og lange tomme perioder tiltrekker seg hver sin type skadedyr.', extra: 'Fem spørsmål, så de mest sannsynlige, tegnene å se etter, og hva du ikke bør gjøre selv.' },
    sv: { h1: 'Skadedjur i spanska bostäder', lead: 'Varmt väder, en trädgård och långa tomma perioder lockar var för sig olika skadedjur.', extra: 'Fem frågor, sedan de troliga, tecknen att leta efter, och vad du inte bör göra själv.' },
    de: { h1: 'Schädlinge an spanischen Immobilien', lead: 'Warmes Wetter, ein Garten und langer Leerstand ziehen jeweils etwas anderes an.', extra: 'Fünf Fragen, dann die wahrscheinlichen Arten, die frühen Zeichen und was Fachsache ist.' },
    fr: { h1: 'Nuisibles dans un logement espagnol', lead: "La chaleur, un jardin et de longues périodes d'inoccupation attirent chacun autre chose.", extra: 'Cinq questions, puis les nuisibles probables, les premiers signes et ce qui relève du pro.' },
    nl: { h1: 'Ongedierte in een Spaanse woning', lead: 'Warm weer, een tuin en lange lege periodes trekken elk iets anders aan.', extra: 'Vijf vragen, dan de waarschijnlijke soorten, de eerste signalen en wat vakwerk is.' },
  },
  'utility-setup': {
    en: { h1: 'Getting the utilities on in Spain', lead: 'Power, water, gas, internet and the council charge are five separate processes.', extra: 'Two of them cannot start until something else is finished. This is the order they go in.' },
    no: { h1: 'Få strøm og vann på i Spania', lead: 'Strøm, vann, gass, internett og kommunal avgift er fem separate prosesser.', extra: 'To av dem kan ikke starte før noe annet er ferdig. Dette er rekkefølgen de må gå i.' },
    sv: { h1: 'Få igång el och vatten i Spanien', lead: 'El, vatten, gas, internet och den kommunala avgiften är fem separata processer.', extra: 'Två av dem kan inte börja förrän något annat är klart. Detta är ordningen de sker i.' },
    de: { h1: 'Strom und Wasser anmelden in Spanien', lead: 'Strom, Wasser, Gas, Internet und die Gemeindeabgabe sind fünf getrennte Vorgänge.', extra: 'Zwei starten erst, wenn etwas anderes fertig ist. Das ist die richtige Reihenfolge.' },
    fr: { h1: 'Ouvrir les compteurs en Espagne', lead: 'Électricité, eau, gaz, internet et taxe communale sont cinq démarches distinctes.', extra: "Deux ne peuvent commencer qu'une fois autre chose terminé. Voici l'ordre à suivre." },
    nl: { h1: 'Nutsvoorzieningen aanvragen in Spanje', lead: 'Stroom, water, gas, internet en de gemeentelijke heffing zijn vijf losse processen.', extra: 'Twee ervan kunnen pas starten als iets anders klaar is. Dit is de juiste volgorde.' },
  },
  'contractor-check': {
    en: { h1: 'Checking a builder quote in Spain', lead: 'Most bad building jobs in Spain are visible in the quote, usually as something missing.', extra: 'Twelve questions, a red flag count, and the words to put back to the contractor.' },
    no: { h1: 'Sjekk tilbudet fra byggmesteren', lead: 'De fleste dårlige byggejobber i Spania synes i tilbudet, oftest som noe som mangler.', extra: 'Tolv spørsmål, en telling av røde flagg, og ordene du kan sende tilbake til firmaet.' },
    sv: { h1: 'Granska byggofferten i Spanien', lead: 'De flesta dåliga byggjobb i Spanien syns i offerten, oftast som något som saknas.', extra: 'Tolv frågor, en räkning av varningstecken, och orden att skicka tillbaka till firman.' },
    de: { h1: 'Ein Bauangebot in Spanien prüfen', lead: 'Die meisten schlechten Bauarbeiten in Spanien stehen schon im Angebot, meist als Lücke.', extra: 'Zwölf Fragen, eine Zahl von Warnzeichen, und die Sätze für die Rückfrage an die Firma.' },
    fr: { h1: 'Vérifier un devis de travaux espagnol', lead: 'La plupart des mauvais chantiers en Espagne se voient déjà dans le devis, par une absence.', extra: "Douze questions, un compte des signaux d'alerte, et les phrases à renvoyer à l'entreprise." },
    nl: { h1: 'Een bouwofferte in Spanje checken', lead: 'De meeste slechte bouwklussen in Spanje zijn al zichtbaar in de offerte, als iets ontbreekt.', extra: 'Twaalf vragen, een telling van rode vlaggen, en de woorden om terug te leggen bij de aannemer.' },
  },
  'day-counter': {
    en: { h1: 'Your 90 days in Spain', lead: 'A non EU passport gets 90 days in any rolling 180, not 90 days a year.', extra: 'Add the trips you have taken and the ones you have booked, and see the days left.' },
    no: { h1: 'Dine 90 dager i Spania', lead: 'Et pass utenfor EU gir 90 dager i enhver rullerende 180, ikke 90 dager i året.', extra: 'Legg inn turene du har tatt og de du har booket, og se hvor mange dager du har igjen.' },
    sv: { h1: 'Dina 90 dagar i Spanien', lead: 'Ett pass utanför EU ger 90 dagar under varje rullande 180, inte 90 dagar per år.', extra: 'Lägg in resorna du gjort och de du bokat, och se hur många dagar du har kvar.' },
    de: { h1: 'Ihre 90 Tage in Spanien', lead: 'Ein Pass außerhalb der EU gibt 90 Tage in jeweils 180, nicht 90 Tage pro Jahr.', extra: 'Tragen Sie gemachte und gebuchte Reisen ein und sehen Sie die verbleibenden Tage.' },
    fr: { h1: 'Vos 90 jours en Espagne', lead: 'Un passeport hors UE donne 90 jours sur toute période de 180, pas 90 jours par an.', extra: 'Ajoutez les séjours passés et ceux réservés, et voyez les jours qui vous restent.' },
    nl: { h1: 'Uw 90 dagen in Spanje', lead: 'Een paspoort van buiten de EU geeft 90 dagen per 180, niet 90 dagen per jaar.', extra: 'Voer gemaakte en geboekte reizen in en zie hoeveel dagen u nog over heeft.' },
  },
  'sale-tax': {
    en: { h1: 'Selling a Spanish property', lead: 'Work out the gain, the tax on it, and the three percent the buyer holds back.', extra: 'Every deadline comes out as a real date counted from your completion day.' },
    no: { h1: 'Salg av spansk bolig uten bosted', lead: 'Regn ut gevinsten, skatten på den, og de tre prosentene kjøperen holder tilbake.', extra: 'Hver frist kommer ut som en faktisk dato, regnet fra overtakelsesdagen.' },
    sv: { h1: 'Sälja spansk bostad utan hemvist', lead: 'Räkna ut vinsten, skatten på den, och de tre procent som köparen håller inne.', extra: 'Varje tidsfrist kommer ut som ett verkligt datum, räknat från tillträdesdagen.' },
    de: { h1: 'Verkauf einer spanischen Immobilie', lead: 'Berechnen Sie den Gewinn, die Steuer darauf und die drei Prozent, die der Käufer einbehält.', extra: 'Jede Frist kommt als echtes Datum heraus, gerechnet ab dem Tag der Beurkundung.' },
    fr: { h1: 'Vendre un bien en Espagne', lead: "Calculez la plus value, l'impôt correspondant et les trois pour cent retenus par l'acheteur.", extra: 'Chaque échéance sort sous forme de date réelle, comptée depuis la signature.' },
    nl: { h1: 'Een Spaanse woning verkopen', lead: 'Bereken de winst, de belasting daarop en de drie procent die de koper inhoudt.', extra: 'Elke termijn komt eruit als een echte datum, geteld vanaf de overdrachtsdag.' },
  },
  'rental-vat': {
    en: { h1: 'IVA on a Spanish holiday let', lead: 'Exempt, ten percent or twenty one? The band does not turn on how long guests stay.', extra: 'It turns on what you provide during the stay and on who the guest books from.' },
    no: { h1: 'IVA på spansk ferieutleie', lead: 'Fritatt, ti prosent eller tjueen? Satsen avhenger ikke av hvor lenge gjestene bor.', extra: 'Den avhenger av hva du tilbyr under oppholdet, og av hvem gjesten booker hos.' },
    sv: { h1: 'IVA på spansk semesteruthyrning', lead: 'Undantagen, tio procent eller tjugoen? Satsen avgörs inte av hur länge gästerna bor.', extra: 'Den avgörs av vad du erbjuder under vistelsen, och av vem gästen bokar hos.' },
    de: { h1: 'IVA auf spanische Ferienvermietung', lead: 'Befreit, zehn Prozent oder einundzwanzig? Nicht die Aufenthaltsdauer entscheidet.', extra: 'Entscheidend ist, was Sie während des Aufenthalts bieten und bei wem der Gast bucht.' },
    fr: { h1: 'IVA sur une location saisonnière', lead: 'Exonéré, dix pour cent ou vingt et un ? Le taux ne dépend pas de la durée du séjour.', extra: 'Il dépend de ce que vous fournissez pendant le séjour et de qui reçoit la réservation.' },
    nl: { h1: 'IVA op Spaanse vakantieverhuur', lead: 'Vrijgesteld, tien procent of eenentwintig? Het tarief hangt niet af van de verblijfsduur.', extra: 'Het hangt af van wat u tijdens het verblijf biedt en bij wie de gast boekt.' },
  },
  'late-surcharge': {
    en: { h1: 'Filing a Spanish return late', lead: 'A late Modelo 210 costs a surcharge that rises by one point a month.', extra: 'It becomes something else entirely once the tax office has written to you first.' },
    no: { h1: 'Levere spansk skattemelding sent', lead: 'En for sen Modelo 210 koster et tillegg som stiger med ett poeng i måneden.', extra: 'Det blir noe helt annet dersom skattekontoret har skrevet til deg først.' },
    sv: { h1: 'Lämna spansk deklaration sent', lead: 'En försenad Modelo 210 kostar ett tillägg som stiger med en punkt i månaden.', extra: 'Det blir något helt annat om skattekontoret har skrivit till dig först.' },
    de: { h1: 'Spanische Erklärung zu spät abgeben', lead: 'Eine verspätete Modelo 210 kostet einen Zuschlag, der monatlich um einen Punkt steigt.', extra: 'Es ist etwas ganz anderes, wenn das Finanzamt Ihnen zuerst geschrieben hat.' },
    fr: { h1: 'Déclaration espagnole en retard', lead: "Un Modelo 210 en retard coûte une majoration qui monte d'un point par mois.", extra: "C'est tout autre chose si l'administration vous a écrit la première." },
    nl: { h1: 'Spaanse aangifte te laat indienen', lead: 'Een te late Modelo 210 kost een toeslag die met een punt per maand oploopt.', extra: 'Het wordt iets heel anders als de Belastingdienst u eerst heeft aangeschreven.' },
  },
};

// --- per locale page copy --------------------------------------------------------------
//
// `notes` are the method, language and honesty sentences, taken from the six locale files
// so that the static block never says anything the rendered app does not also say.

export const S = {
  en: {
    notes: {
      method: 'Businesses are ranked by rating, weighted for how many reviews it rests on. A 5.0 from three people does not outrank a 4.7 from four hundred.',
      lang: 'Where a language is noted, it means a review was written in that language, or a reviewer mentioned it. It is not something the business has told us.',
      honest: 'This is a reading of public Google reviews, nothing more. We have not met these businesses, we have not checked their licences or insurance, and none of them pay to appear here. A high rating is a good sign, not a guarantee.',
      refresh: 'Ratings and reviews are refreshed at least every 30 days.',
      free: 'Free, and nobody pays to be listed.',
      written: 'Always agree a written price before work starts, and ask for a factura.',
      loads: 'The list itself loads when the page opens.',
    },
    home: {
      titles: ['Spain 24/7: free tools for property owners in Spain', 'Free tools for foreign property owners in Spain', 'Own a home in Spain? Free tools and a directory'],
      h1: 'Know your Spanish property inside out.',
      leads: ['Free tools for people who own a home in Spain and live somewhere else.'],
      tail: ['Work out the tax, see what the year really costs, and find a tradesperson.', 'No sign up, and nobody pays to be listed.'],
      intro: ['Free tools for foreign property owners in Spain. Understand your tax obligations, check if you are overpaying, and manage everything with confidence.', 'There is also a directory of tradespeople and property professionals in 660 Spanish towns, ranked from public Google reviews.'],
    },
    trades_hub: {
      titles: ['Home repairs in Spain: plumbers and electricians', 'Find a plumber or an electrician in Spain', 'Tradespeople in 660 Spanish towns'],
      h1: 'Water through the ceiling, and you are not in the country.',
      leads: ['Plumbers, electricians, locksmiths, air conditioning engineers, pool services and builders in 660 Spanish towns.'],
      tail: ['Ranked from public Google reviews.', 'Free, and nobody pays to be listed.'],
      intro: ['The best reviewed plumbers, electricians, locksmiths, air conditioning engineers, pool services and builders in 660 Spanish towns. Ranked from Google reviews, with the language each review was written in shown against every name.'],
    },
    pros_hub: {
      titles: ['Property experts in Spain: lawyers and gestorías', 'Find a lawyer or a gestoría in Spain', 'Property professionals in 660 Spanish towns'],
      h1: 'Owning in Spain means dealing with professions you have never heard of, in a language you do not speak.',
      leads: ['Estate agents, lawyers, gestorías, architects, community administrators, valuers, brokers and sworn translators.'],
      tail: ['Ranked from public Google reviews.', 'Free, and nobody pays to be listed.'],
      intro: ['This page does two things. It explains who each of these people is and what they are actually for, and it shows the best reviewed ones in your town, with anyone already reviewed by somebody writing in your language at the top.'],
    },
    areas: {
      titles: ['Spain by province and by coast', 'Every area the directory covers', 'Provinces and coasts of Spain'],
      h1: 'Every province and coast we cover',
      leads: ['The whole directory laid out by province and by coast, so that every town is one click away.', '660 Spanish towns, sorted into 52 provinces and nine coasts.'],
      tail: ['Pick a province, then a town, then the trade you need.', 'Free, and nobody pays to be listed.'],
      intro: ['The directory covers 660 towns across Spain. This page is the way into them: 52 provinces and nine coasts, each one listing the towns it holds.'],
    },
    province: {
      titles: p => [`Property services in ${p.prov}`, `${p.prov}: tradespeople and property experts`, `Find a tradesperson in ${p.prov}`, `Towns in ${p.prov} the directory covers`],
      h1: p => p.prov,
      leads: p => [
        `Every town in ${p.prov} the directory covers, with six trades and eight property professions in each.`,
        `${p.prov}, town by town. Pick one and see which businesses the reviews actually rate.`,
        `The ${p.townCount} towns in ${p.prov} the directory covers, and who you can find in each of them.`,
      ],
      tail: ['Ranked from public Google reviews.', 'Free, and nobody pays to be listed.', 'Refreshed at least every 30 days.'],
      intro: p => [
        `${p.prov} is one of the 52 Spanish provinces the directory covers. It holds ${p.townCount} towns in the town menu.`,
        p.pageCount ? `${p.pageCount} of them have a page of their own for each trade and each profession. The rest are reachable from the town menu on either directory page.` : 'None of them has a page of its own yet. They are all reachable from the town menu on either directory page.',
      ],
    },
    coast: {
      titles: c => [`${c.coast}: trades and property experts`, `${c.coast} town by town`, `Find a tradesperson: ${c.coast}`, `Property services across ${c.coast}`],
      h1: c => c.coast,
      leads: c => [
        `The towns on ${c.coast} the directory covers, with six trades and eight property professions in each.`,
        `${c.coast}, town by town. Pick one and see which businesses the reviews actually rate.`,
        `${c.townCount} towns along ${c.coast}, each with a plumber, an electrician, a lawyer and six more to choose from.`,
      ],
      tail: ['Ranked from public Google reviews.', 'Free, and nobody pays to be listed.', 'Refreshed at least every 30 days.'],
      intro: c => [
        `${c.coast} covers ${c.provList}. The directory holds ${c.townCount} towns there.`,
        c.pageCount ? `${c.pageCount} of them have a page of their own for each trade and each profession.` : 'They are reachable from the town menu on either directory page.',
      ],
    },
  },

  no: {
    notes: {
      method: 'Bedriftene rangeres etter vurdering, vektet for hvor mange omtaler den bygger på. En 5,0 fra tre personer slår ikke en 4,7 fra fire hundre.',
      lang: 'Der et språk er notert, betyr det at en anmeldelse ble skrevet på det språket, eller at en anmelder nevnte det. Det er ikke noe virksomheten har fortalt oss.',
      honest: 'Dette er en lesning av offentlige Google-omtaler, ikke noe mer. Vi har ikke møtt disse bedriftene, vi har ikke sjekket lisenser eller forsikring, og ingen betaler for å stå her. Høy vurdering er et godt tegn, ikke en garanti.',
      refresh: 'Vurderinger og omtaler oppdateres minst hver 30. dag.',
      free: 'Gratis, og ingen betaler for å stå her.',
      written: 'Avtal alltid en skriftlig pris før arbeidet starter, og be om factura.',
      loads: 'Selve listen lastes når siden åpnes.',
    },
    home: {
      titles: ['Spain 24/7: gratis verktøy for boligeiere i Spania', 'Gratis verktøy for utenlandske boligeiere i Spania', 'Eier du bolig i Spania? Gratis verktøy og register'],
      h1: 'Få full oversikt over den spanske boligen din.',
      leads: ['Gratis verktøy for deg som eier en bolig i Spania og bor et annet sted.'],
      tail: ['Regn ut skatten, se hva året faktisk koster, og finn en håndverker.', 'Ingen registrering, og ingen betaler for å stå her.'],
      intro: ['Gratis verktøy for utenlandske boligeiere i Spania. Forstå skatteforpliktelsene dine, se om du betaler for mye, og hold oversikten.', 'Her finnes også et register over håndverkere og boligeksperter i 660 spanske byer, rangert etter offentlige Google-omtaler.'],
    },
    trades_hub: {
      titles: ['Reparasjoner i Spania: rørlegger og elektriker', 'Finn rørlegger eller elektriker i Spania', 'Håndverkere i 660 spanske byer'],
      h1: 'Vann gjennom taket, og du er ikke i landet.',
      leads: ['Rørleggere, elektrikere, låsesmeder, klimateknikere, bassengfirmaer og byggmestere i 660 spanske byer.'],
      tail: ['Rangert etter offentlige Google-omtaler.', 'Gratis, og ingen betaler for å stå her.'],
      intro: ['De best omtalte rørleggerne, elektrikerne, låsesmedene, klimateknikerne, bassengfirmaene og byggmesterne i 660 spanske byer. Rangert etter Google-omtaler, med språket hver omtale er skrevet på vist ved hvert navn.'],
    },
    pros_hub: {
      titles: ['Boligeksperter i Spania: advokat og gestoría', 'Finn advokat eller gestoría i Spania', 'Boligyrker i 660 spanske byer'],
      h1: 'Å eie i Spania betyr å forholde seg til yrker du aldri har hørt om, på et språk du ikke snakker.',
      leads: ['Eiendomsmeglere, advokater, gestorías, arkitekter, sameieforvaltere, takstmenn, meglere og statsautoriserte translatører.'],
      tail: ['Rangert etter offentlige Google-omtaler.', 'Gratis, og ingen betaler for å stå her.'],
      intro: ['Denne siden gjør to ting. Den forklarer hvem hver av disse menneskene er og hva de faktisk brukes til, og den viser de best omtalte i byen din, med dem som allerede er omtalt av noen som skriver på ditt språk øverst.'],
    },
    areas: {
      titles: ['Spania etter provins og kyst', 'Alle områdene registeret dekker', 'Provinser og kyster i Spania'],
      h1: 'Hver provins og kyst vi dekker',
      leads: ['Hele registeret sortert etter provins og kyst, slik at hver by er ett klikk unna.', '660 spanske byer, sortert i 52 provinser og ni kyststrekninger.'],
      tail: ['Velg en provins, så en by, så faget du trenger.', 'Gratis, og ingen betaler for å stå her.'],
      intro: ['Registeret dekker 660 byer i Spania. Denne siden er veien inn: 52 provinser og ni kyststrekninger, hver med byene den rommer.'],
    },
    province: {
      titles: p => [`Boligtjenester i ${p.prov}`, `${p.prov}: håndverkere og boligeksperter`, `Finn en håndverker i ${p.prov}`, `Byer i ${p.prov} som registeret dekker`],
      h1: p => p.prov,
      leads: p => [
        `Alle byene i ${p.prov} som registeret dekker, med seks håndverksfag og åtte boligyrker i hver.`,
        `${p.prov}, by for by. Velg en by og se hvem omtalene faktisk anbefaler.`,
        `De ${p.townCount} byene i ${p.prov} som registeret dekker, og hvem du finner i hver av dem.`,
      ],
      tail: ['Rangert etter offentlige Google-omtaler.', 'Gratis, og ingen betaler for å stå her.', 'Oppdateres minst hver 30. dag.'],
      intro: p => [
        `${p.prov} er en av de 52 spanske provinsene registeret dekker. Den rommer ${p.townCount} byer i bymenyen.`,
        p.pageCount ? `${p.pageCount} av dem har egen side for hvert fag og hvert yrke. Resten nås fra bymenyen på begge registersidene.` : 'Ingen av dem har egen side ennå. Alle nås fra bymenyen på begge registersidene.',
      ],
    },
    coast: {
      titles: c => [`${c.coast}: håndverkere og boligeksperter`, `${c.coast} by for by`, `Finn en håndverker: ${c.coast}`, `Boligtjenester langs ${c.coast}`],
      h1: c => c.coast,
      leads: c => [
        `Byene langs ${c.coast} som registeret dekker, med seks håndverksfag og åtte boligyrker i hver.`,
        `${c.coast}, by for by. Velg en by og se hvem omtalene faktisk anbefaler.`,
        `${c.townCount} byer langs ${c.coast}, hver med rørlegger, elektriker, advokat og seks yrker til.`,
      ],
      tail: ['Rangert etter offentlige Google-omtaler.', 'Gratis, og ingen betaler for å stå her.', 'Oppdateres minst hver 30. dag.'],
      intro: c => [
        `${c.coast} dekker ${c.provList}. Registeret rommer ${c.townCount} byer der.`,
        c.pageCount ? `${c.pageCount} av dem har egen side for hvert fag og hvert yrke.` : 'De nås fra bymenyen på begge registersidene.',
      ],
    },
  },

  sv: {
    notes: {
      method: 'Företagen rankas efter betyg, viktat för hur många omdömen det vilar på. En 5,0 från tre personer slår inte en 4,7 från fyra hundra.',
      lang: 'Där ett språk anges betyder det att en recension skrevs på det språket, eller att en recensent nämnde det. Det är inte något företaget har sagt till oss.',
      honest: 'Detta är en läsning av offentliga Google-omdömen, inget mer. Vi har inte träffat företagen, vi har inte kontrollerat licenser eller försäkringar, och ingen betalar för att synas här. Ett högt betyg är ett gott tecken, inte en garanti.',
      refresh: 'Betyg och omdömen uppdateras minst var 30:e dag.',
      free: 'Gratis, och ingen betalar för att synas.',
      written: 'Kom alltid överens om ett skriftligt pris innan arbetet börjar, och be om factura.',
      loads: 'Själva listan laddas när sidan öppnas.',
    },
    home: {
      titles: ['Spain 24/7: gratis verktyg för bostadsägare', 'Gratis verktyg för utländska bostadsägare i Spanien', 'Äger du bostad i Spanien? Gratis verktyg och register'],
      h1: 'Få en fullständig översikt över din spanska fastighet.',
      leads: ['Gratis verktyg för dig som äger en bostad i Spanien och bor någon annanstans.'],
      tail: ['Räkna ut skatten, se vad året faktiskt kostar, och hitta en hantverkare.', 'Ingen registrering, och ingen betalar för att synas.'],
      intro: ['Gratis verktyg för utländska fastighetsägare i Spanien. Förstå dina skatteskyldigheter, se om du betalar för mycket, och behåll överblicken.', 'Här finns också ett register över hantverkare och bostadsexperter på 660 spanska orter, rankat efter offentliga Google-omdömen.'],
    },
    trades_hub: {
      titles: ['Reparationer i Spanien: rörmokare och elektriker', 'Hitta rörmokare eller elektriker i Spanien', 'Hantverkare på 660 spanska orter'],
      h1: 'Vatten genom taket, och du är inte i landet.',
      leads: ['Rörmokare, elektriker, låssmeder, kyl- och värmetekniker, poolfirmor och byggare på 660 spanska orter.'],
      tail: ['Rankade efter offentliga Google-omdömen.', 'Gratis, och ingen betalar för att synas.'],
      intro: ['De bäst betygsatta rörmokarna, elektrikerna, låssmederna, kyl- och värmeteknikerna, poolfirmorna och byggarna på 660 spanska orter. Rankade efter Google-omdömen, med språket varje omdöme är skrivet på visat vid varje namn.'],
    },
    pros_hub: {
      titles: ['Bostadsexperter i Spanien: advokat och gestoría', 'Hitta advokat eller gestoría i Spanien', 'Bostadsyrken på 660 spanska orter'],
      h1: 'Att äga i Spanien innebär att ha med yrken att göra som du aldrig har hört talas om, på ett språk du inte talar.',
      leads: ['Mäklare, advokater, gestorías, arkitekter, samfällighetsförvaltare, värderingsmän, försäkringsmäklare och auktoriserade översättare.'],
      tail: ['Rankade efter offentliga Google-omdömen.', 'Gratis, och ingen betalar för att synas.'],
      intro: ['Den här sidan gör två saker. Den förklarar vem var och en av dessa personer är och vad de faktiskt behövs till, och den visar de bäst omdömessatta i din stad, med dem som redan fått omdöme av någon som skriver på ditt språk överst.'],
    },
    areas: {
      titles: ['Spanien efter provins och kust', 'Alla områden registret täcker', 'Provinser och kuster i Spanien'],
      h1: 'Varje provins och kust vi täcker',
      leads: ['Hela registret sorterat efter provins och kust, så att varje ort är ett klick bort.', '660 spanska orter, sorterade i 52 provinser och nio kuststräckor.'],
      tail: ['Välj en provins, sedan en ort, sedan yrket du behöver.', 'Gratis, och ingen betalar för att synas.'],
      intro: ['Registret täcker 660 orter i Spanien. Den här sidan är vägen in: 52 provinser och nio kuststräckor, var och en med de orter den rymmer.'],
    },
    province: {
      titles: p => [`Bostadstjänster i ${p.prov}`, `${p.prov}: hantverkare och bostadsexperter`, `Hitta en hantverkare i ${p.prov}`, `Orter i ${p.prov} som registret täcker`],
      h1: p => p.prov,
      leads: p => [
        `Alla orter i ${p.prov} som registret täcker, med sex hantverksyrken och åtta bostadsyrken i varje.`,
        `${p.prov}, ort för ort. Välj en ort och se vilka omdömena faktiskt lyfter fram.`,
        `De ${p.townCount} orterna i ${p.prov} som registret täcker, och vilka du hittar i var och en.`,
      ],
      tail: ['Rankade efter offentliga Google-omdömen.', 'Gratis, och ingen betalar för att synas.', 'Uppdateras minst var 30:e dag.'],
      intro: p => [
        `${p.prov} är en av de 52 spanska provinser registret täcker. Den rymmer ${p.townCount} orter i ortmenyn.`,
        p.pageCount ? `${p.pageCount} av dem har en egen sida för varje yrke. Resten nås från ortmenyn på båda registersidorna.` : 'Ingen av dem har en egen sida ännu. Alla nås från ortmenyn på båda registersidorna.',
      ],
    },
    coast: {
      titles: c => [`${c.coast}: hantverkare och bostadsexperter`, `${c.coast} ort för ort`, `Hitta en hantverkare: ${c.coast}`, `Bostadstjänster längs ${c.coast}`],
      h1: c => c.coast,
      leads: c => [
        `Orterna längs ${c.coast} som registret täcker, med sex hantverksyrken och åtta bostadsyrken i varje.`,
        `${c.coast}, ort för ort. Välj en ort och se vilka omdömena faktiskt lyfter fram.`,
        `${c.townCount} orter längs ${c.coast}, var och en med rörmokare, elektriker, advokat och sex yrken till.`,
      ],
      tail: ['Rankade efter offentliga Google-omdömen.', 'Gratis, och ingen betalar för att synas.', 'Uppdateras minst var 30:e dag.'],
      intro: c => [
        `${c.coast} täcker ${c.provList}. Registret rymmer ${c.townCount} orter där.`,
        c.pageCount ? `${c.pageCount} av dem har en egen sida för varje yrke.` : 'De nås från ortmenyn på båda registersidorna.',
      ],
    },
  },

  de: {
    notes: {
      method: 'Betriebe werden nach Bewertung sortiert, gewichtet danach, auf wie vielen Bewertungen sie beruht. Eine 5,0 von drei Personen schlägt keine 4,7 von vierhundert.',
      lang: 'Wo eine Sprache vermerkt ist, bedeutet das, dass eine Bewertung in dieser Sprache geschrieben wurde oder ein Bewerter sie erwähnt hat. Es ist nichts, was das Unternehmen uns mitgeteilt hat.',
      honest: 'Das ist eine Auswertung öffentlicher Google-Bewertungen, nicht mehr. Wir kennen diese Betriebe nicht persönlich, wir haben weder Lizenzen noch Versicherungen geprüft, und niemand bezahlt für einen Platz hier. Eine hohe Bewertung ist ein gutes Zeichen, keine Garantie.',
      refresh: 'Bewertungen werden mindestens alle 30 Tage aktualisiert.',
      free: 'Kostenlos, und niemand bezahlt für einen Platz.',
      written: 'Vereinbaren Sie immer einen schriftlichen Preis, bevor die Arbeit beginnt, und verlangen Sie eine factura.',
      loads: 'Die Liste selbst lädt beim Öffnen der Seite.',
    },
    home: {
      titles: ['Spain 24/7: Gratis-Tools für Immobilienbesitzer', 'Kostenlose Tools für ausländische Eigentümer in Spanien', 'Immobilie in Spanien? Kostenlose Tools und Verzeichnis'],
      h1: 'Kennen Sie Ihre spanische Immobilie ganz genau.',
      leads: ['Kostenlose Tools für Menschen, die eine Immobilie in Spanien besitzen und woanders leben.'],
      tail: ['Steuer berechnen, Jahreskosten prüfen und einen Handwerker finden.', 'Keine Anmeldung, und niemand bezahlt für einen Platz.'],
      intro: ['Kostenlose Tools für ausländische Immobilienbesitzer in Spanien. Verstehen Sie Ihre Steuerpflichten, prüfen Sie, ob Sie zu viel zahlen, und behalten Sie den Überblick.', 'Dazu ein Verzeichnis von Handwerkern und Immobilienexperten in 660 spanischen Orten, sortiert nach öffentlichen Google-Bewertungen.'],
    },
    trades_hub: {
      titles: ['Reparaturen in Spanien: Installateur und Elektriker', 'Installateur oder Elektriker in Spanien finden', 'Handwerker in 660 spanischen Orten'],
      h1: 'Wasser durch die Decke, und Sie sind nicht im Land.',
      leads: ['Installateure, Elektriker, Schlüsseldienste, Klimatechniker, Poolservices und Bauunternehmen in 660 spanischen Orten.'],
      tail: ['Sortiert nach öffentlichen Google-Bewertungen.', 'Kostenlos, und niemand bezahlt für einen Platz.'],
      intro: ['Die am besten bewerteten Installateure, Elektriker, Schlüsseldienste, Klimatechniker, Poolservices und Bauunternehmen in 660 spanischen Orten. Sortiert nach Google-Bewertungen, mit der Sprache, in der jede Bewertung geschrieben wurde, neben jedem Namen.'],
    },
    pros_hub: {
      titles: ['Immobilienexperten in Spanien: Anwalt und Gestoría', 'Anwalt oder Gestoría in Spanien finden', 'Immobilienberufe in 660 Orten Spaniens'],
      h1: 'Eine Immobilie in Spanien zu besitzen heißt, mit Berufen zu tun zu haben, von denen Sie nie gehört haben.',
      leads: ['Makler, Anwälte, Gestorías, Architekten, Hausverwalter, Gutachter, Versicherungsmakler und vereidigte Übersetzer.'],
      tail: ['Sortiert nach öffentlichen Google-Bewertungen.', 'Kostenlos, und niemand bezahlt für einen Platz.'],
      intro: ['Diese Seite tut zwei Dinge. Sie erklärt, wer diese Menschen jeweils sind und wofür man sie wirklich braucht, und sie zeigt die am besten bewerteten in Ihrer Stadt, mit denen zuerst, die jemand in Ihrer Sprache bereits bewertet hat.'],
    },
    areas: {
      titles: ['Spanien nach Provinz und Küste', 'Alle Regionen, die wir abdecken', 'Provinzen und Küsten Spaniens'],
      h1: 'Jede Provinz und jede Küste',
      leads: ['Das ganze Verzeichnis nach Provinz und Küste geordnet, sodass jeder Ort einen Klick entfernt ist.', '660 spanische Orte, geordnet in 52 Provinzen und neun Küsten.'],
      tail: ['Wählen Sie eine Provinz, dann einen Ort, dann das Gewerk.', 'Kostenlos, und niemand bezahlt für einen Platz.'],
      intro: ['Das Verzeichnis deckt 660 Orte in Spanien ab. Diese Seite ist der Weg hinein: 52 Provinzen und neun Küsten, jede mit den Orten, die sie umfasst.'],
    },
    province: {
      titles: p => [`Immobiliendienste in ${p.prov}`, `${p.prov}: Handwerker und Immobilienexperten`, `Einen Handwerker in ${p.prov} finden`, `Orte in ${p.prov} im Verzeichnis`],
      h1: p => p.prov,
      leads: p => [
        `Alle Orte in ${p.prov}, die das Verzeichnis abdeckt, mit sechs Gewerken und acht Immobilienberufen je Ort.`,
        `${p.prov}, Ort für Ort. Wählen Sie einen Ort und sehen Sie, wen die Bewertungen wirklich empfehlen.`,
        `Die ${p.townCount} Orte in ${p.prov} im Verzeichnis, und wen Sie in jedem davon finden.`,
      ],
      tail: ['Sortiert nach öffentlichen Google-Bewertungen.', 'Kostenlos, und niemand bezahlt für einen Platz.', 'Mindestens alle 30 Tage aktualisiert.'],
      intro: p => [
        `${p.prov} ist eine der 52 spanischen Provinzen im Verzeichnis. Sie umfasst ${p.townCount} Orte im Ortsmenü.`,
        p.pageCount ? `${p.pageCount} davon haben eine eigene Seite je Gewerk und Beruf. Die übrigen erreichen Sie über das Ortsmenü.` : 'Keiner davon hat bisher eine eigene Seite. Alle sind über das Ortsmenü erreichbar.',
      ],
    },
    coast: {
      titles: c => [`${c.coast}: Handwerker und Immobilienexperten`, `${c.coast} Ort für Ort`, `Handwerker finden: ${c.coast}`, `Immobiliendienste an der ${c.coast}`],
      h1: c => c.coast,
      leads: c => [
        `Die Orte an ${c.coast}, die das Verzeichnis abdeckt, mit sechs Gewerken und acht Immobilienberufen je Ort.`,
        `${c.coast}, Ort für Ort. Wählen Sie einen Ort und sehen Sie, wen die Bewertungen wirklich empfehlen.`,
        `${c.townCount} Orte entlang ${c.coast}, jeder mit Installateur, Elektriker, Anwalt und sechs weiteren Berufen.`,
      ],
      tail: ['Sortiert nach öffentlichen Google-Bewertungen.', 'Kostenlos, und niemand bezahlt für einen Platz.', 'Mindestens alle 30 Tage aktualisiert.'],
      intro: c => [
        `${c.coast} umfasst ${c.provList}. Das Verzeichnis führt dort ${c.townCount} Orte.`,
        c.pageCount ? `${c.pageCount} davon haben eine eigene Seite je Gewerk und Beruf.` : 'Sie sind über das Ortsmenü auf beiden Verzeichnisseiten erreichbar.',
      ],
    },
  },

  fr: {
    notes: {
      method: "Les entreprises sont classées selon leur note, pondérée par le nombre d'avis sur lequel elle repose. Un 5,0 donné par trois personnes ne devance pas un 4,7 donné par quatre cents.",
      lang: "Lorsqu'une langue est indiquée, cela signifie qu'un avis a été rédigé dans cette langue, ou qu'un client l'a mentionnée. Ce n'est pas une information fournie par l'entreprise.",
      honest: "Il s'agit d'une lecture des avis publics Google, rien de plus. Nous n'avons pas rencontré ces entreprises, nous n'avons vérifié ni licences ni assurances, et personne ne paie pour figurer ici. Une bonne note est un bon signe, pas une garantie.",
      refresh: 'Les notes et les avis sont actualisés au moins tous les 30 jours.',
      free: 'Gratuit, et personne ne paie pour figurer ici.',
      written: "Convenez toujours d'un prix écrit avant le début des travaux, et demandez une factura.",
      loads: "La liste elle même se charge à l'ouverture de la page.",
    },
    home: {
      titles: ['Spain 24/7 : outils gratuits pour propriétaires', 'Outils gratuits pour propriétaires étrangers en Espagne', 'Un bien en Espagne ? Outils gratuits et annuaire'],
      h1: 'Connaissez votre bien immobilier espagnol dans les moindres détails.',
      leads: ["Des outils gratuits pour ceux qui possèdent un logement en Espagne et vivent ailleurs."],
      tail: ["Calculez l'impôt, voyez le coût réel de l'année, et trouvez un artisan.", 'Sans inscription, et personne ne paie pour figurer ici.'],
      intro: ["Des outils gratuits pour les propriétaires étrangers en Espagne. Comprenez vos obligations fiscales, vérifiez si vous payez trop, et gardez la maîtrise.", "S'y ajoute un annuaire d'artisans et d'experts immobiliers dans 660 communes espagnoles, classé selon les avis publics Google."],
    },
    trades_hub: {
      titles: ['Réparations en Espagne : plombier et électricien', 'Trouver un plombier ou un électricien en Espagne', 'Artisans dans 660 communes espagnoles'],
      h1: "De l'eau au plafond, et vous n'êtes pas dans le pays.",
      leads: ['Plombiers, électriciens, serruriers, techniciens en climatisation, entreprises de piscine et maçons dans 660 communes.'],
      tail: ['Classés selon les avis publics Google.', 'Gratuit, et personne ne paie pour figurer ici.'],
      intro: ["Les plombiers, électriciens, serruriers, techniciens en climatisation, entreprises de piscine et maçons les mieux notés dans 660 communes espagnoles. Classés selon les avis Google, avec la langue de chaque avis indiquée à côté de chaque nom."],
    },
    pros_hub: {
      titles: ['Experts immobiliers en Espagne : avocat et gestoría', 'Trouver un avocat ou une gestoría en Espagne', 'Professions immobilières dans 660 communes'],
      h1: "Posséder un bien en Espagne, c'est traiter avec des professions dont vous n'avez jamais entendu parler.",
      leads: ['Agents, avocats, gestorías, architectes, syndics, experts en évaluation, courtiers et traducteurs assermentés.'],
      tail: ['Classés selon les avis publics Google.', 'Gratuit, et personne ne paie pour figurer ici.'],
      intro: ["Cette page fait deux choses. Elle explique qui est chacune de ces personnes et à quoi elle sert vraiment, et elle montre les mieux notées dans votre commune, en plaçant en tête celles qu'un client écrivant dans votre langue a déjà évaluées."],
    },
    areas: {
      titles: ["L'Espagne par province et par côte", 'Toutes les régions couvertes', "Provinces et côtes d'Espagne"],
      h1: 'Chaque province et chaque côte',
      leads: ["Tout l'annuaire classé par province et par côte, pour que chaque commune soit à un clic.", '660 communes espagnoles, réparties en 52 provinces et neuf côtes.'],
      tail: ['Choisissez une province, puis une commune, puis le métier.', 'Gratuit, et personne ne paie pour figurer ici.'],
      intro: ["L'annuaire couvre 660 communes en Espagne. Cette page en est l'entrée : 52 provinces et neuf côtes, chacune avec les communes qu'elle contient."],
    },
    province: {
      titles: p => [`Services immobiliers dans ${p.prov}`, `${p.prov} : artisans et experts immobiliers`, `Trouver un artisan dans ${p.prov}`, `Communes de ${p.prov} couvertes`],
      h1: p => p.prov,
      leads: p => [
        `Toutes les communes de ${p.prov} couvertes par l'annuaire, avec six métiers du bâtiment et huit professions immobilières.`,
        `${p.prov}, commune par commune. Choisissez et voyez qui les avis recommandent vraiment.`,
        `Les ${p.townCount} communes de ${p.prov} couvertes par l'annuaire, et qui vous y trouverez.`,
      ],
      tail: ['Classées selon les avis publics Google.', 'Gratuit, et personne ne paie pour figurer ici.', 'Actualisé au moins tous les 30 jours.'],
      intro: p => [
        `${p.prov} est l'une des 52 provinces espagnoles couvertes. Elle compte ${p.townCount} communes dans le menu.`,
        p.pageCount ? `${p.pageCount} d'entre elles ont leur propre page par métier et par profession. Les autres restent accessibles par le menu.` : "Aucune n'a encore de page propre. Toutes restent accessibles par le menu des communes.",
      ],
    },
    coast: {
      titles: c => [`${c.coast} : artisans et experts immobiliers`, `${c.coast}, commune par commune`, `Trouver un artisan : ${c.coast}`, `Services immobiliers sur ${c.coast}`],
      h1: c => c.coast,
      leads: c => [
        `Les communes de ${c.coast} couvertes par l'annuaire, avec six métiers du bâtiment et huit professions immobilières.`,
        `${c.coast}, commune par commune. Choisissez et voyez qui les avis recommandent vraiment.`,
        `${c.townCount} communes le long de ${c.coast}, chacune avec plombier, électricien, avocat et six métiers de plus.`,
      ],
      tail: ['Classées selon les avis publics Google.', 'Gratuit, et personne ne paie pour figurer ici.', 'Actualisé au moins tous les 30 jours.'],
      intro: c => [
        `${c.coast} couvre ${c.provList}. L'annuaire y compte ${c.townCount} communes.`,
        c.pageCount ? `${c.pageCount} d'entre elles ont leur propre page par métier et par profession.` : 'Elles restent accessibles par le menu des communes.',
      ],
    },
  },

  nl: {
    notes: {
      method: 'Bedrijven worden gerangschikt op cijfer, gewogen naar het aantal beoordelingen waarop dat rust. Een 5,0 van drie mensen verslaat geen 4,7 van vierhonderd.',
      lang: 'Waar een taal wordt vermeld, betekent dat dat een recensie in die taal is geschreven of dat een recensent die noemde. Het is niet iets dat het bedrijf ons heeft verteld.',
      honest: 'Dit is een weergave van openbare Google-beoordelingen, meer niet. Wij hebben deze bedrijven niet ontmoet, wij hebben geen vergunningen of verzekeringen gecontroleerd, en niemand betaalt om hier te staan. Een hoog cijfer is een goed teken, geen garantie.',
      refresh: 'Cijfers en beoordelingen worden minstens elke 30 dagen ververst.',
      free: 'Gratis, en niemand betaalt om vermeld te worden.',
      written: 'Spreek altijd een schriftelijke prijs af voordat het werk begint, en vraag om een factura.',
      loads: 'De lijst zelf laadt zodra de pagina opent.',
    },
    home: {
      titles: ['Spain 24/7: gratis tools voor woningeigenaren', 'Gratis tools voor buitenlandse woningeigenaren in Spanje', 'Woning in Spanje? Gratis tools en een gids'],
      h1: 'Ken uw Spaanse woning tot in detail.',
      leads: ['Gratis tools voor mensen die een woning in Spanje bezitten en ergens anders wonen.'],
      tail: ['Bereken de belasting, zie wat het jaar echt kost, en vind een vakman.', 'Geen aanmelding, en niemand betaalt om vermeld te worden.'],
      intro: ['Gratis tools voor buitenlandse woningeigenaren in Spanje. Begrijp uw belastingplichten, controleer of u te veel betaalt, en houd het overzicht.', 'Daarnaast een gids van vakmensen en vastgoedexperts in 660 Spaanse plaatsen, gerangschikt op openbare Google-beoordelingen.'],
    },
    trades_hub: {
      titles: ['Reparaties in Spanje: loodgieter en elektricien', 'Loodgieter of elektricien vinden in Spanje', 'Vakmensen in 660 Spaanse plaatsen'],
      h1: 'Water door het plafond, en u bent niet in het land.',
      leads: ['Loodgieters, elektriciens, slotenmakers, airco-monteurs, zwembadbedrijven en aannemers in 660 Spaanse plaatsen.'],
      tail: ['Gerangschikt op openbare Google-beoordelingen.', 'Gratis, en niemand betaalt om vermeld te worden.'],
      intro: ['De best beoordeelde loodgieters, elektriciens, slotenmakers, airco-monteurs, zwembadbedrijven en aannemers in 660 Spaanse plaatsen. Gerangschikt op Google-beoordelingen, met de taal waarin elke beoordeling is geschreven naast elke naam.'],
    },
    pros_hub: {
      titles: ['Vastgoedexperts in Spanje: advocaat en gestoría', 'Advocaat of gestoría vinden in Spanje', 'Vastgoedberoepen in 660 Spaanse plaatsen'],
      h1: 'Een woning bezitten in Spanje betekent omgaan met beroepen waarvan u nooit hebt gehoord.',
      leads: ['Makelaars, advocaten, gestorías, architecten, VvE-beheerders, taxateurs, verzekeringsmakelaars en beëdigde vertalers.'],
      tail: ['Gerangschikt op openbare Google-beoordelingen.', 'Gratis, en niemand betaalt om vermeld te worden.'],
      intro: ['Deze pagina doet twee dingen. Ze legt uit wie elk van deze mensen is en waar ze werkelijk voor dienen, en ze toont de best beoordeelde in uw plaats, met bovenaan wie al beoordeeld is door iemand die in uw taal schrijft.'],
    },
    areas: {
      titles: ['Spanje per provincie en kust', "Alle regio's die de gids dekt", 'Provincies en kusten van Spanje'],
      h1: 'Elke provincie en elke kust',
      leads: ['De hele gids geordend op provincie en kust, zodat elke plaats één klik weg is.', '660 Spaanse plaatsen, verdeeld over 52 provincies en negen kusten.'],
      tail: ['Kies een provincie, dan een plaats, dan het vak.', 'Gratis, en niemand betaalt om vermeld te worden.'],
      intro: ['De gids dekt 660 plaatsen in Spanje. Deze pagina is de ingang: 52 provincies en negen kusten, elk met de plaatsen die zij bevat.'],
    },
    province: {
      titles: p => [`Woondiensten in ${p.prov}`, `${p.prov}: vakmensen en vastgoedexperts`, `Een vakman vinden in ${p.prov}`, `Plaatsen in ${p.prov} in de gids`],
      h1: p => p.prov,
      leads: p => [
        `Alle plaatsen in ${p.prov} die de gids dekt, met zes bouwvakken en acht vastgoedberoepen per plaats.`,
        `${p.prov}, plaats voor plaats. Kies er een en zie wie de beoordelingen echt aanraden.`,
        `De ${p.townCount} plaatsen in ${p.prov} die de gids dekt, en wie u er kunt vinden.`,
      ],
      tail: ['Gerangschikt op openbare Google-beoordelingen.', 'Gratis, en niemand betaalt om vermeld te worden.', 'Minstens elke 30 dagen ververst.'],
      intro: p => [
        `${p.prov} is een van de 52 Spaanse provincies die de gids dekt. Er staan ${p.townCount} plaatsen in het menu.`,
        p.pageCount ? `${p.pageCount} daarvan hebben een eigen pagina per vak en per beroep. De rest bereikt u via het plaatsmenu.` : 'Nog geen daarvan heeft een eigen pagina. Alle zijn bereikbaar via het plaatsmenu.',
      ],
    },
    coast: {
      titles: c => [`${c.coast}: vakmensen en vastgoedexperts`, `${c.coast}, plaats voor plaats`, `Een vakman vinden: ${c.coast}`, `Woondiensten aan ${c.coast}`],
      h1: c => c.coast,
      leads: c => [
        `De plaatsen aan ${c.coast} die de gids dekt, met zes bouwvakken en acht vastgoedberoepen per plaats.`,
        `${c.coast}, plaats voor plaats. Kies er een en zie wie de beoordelingen echt aanraden.`,
        `${c.townCount} plaatsen langs ${c.coast}, elk met loodgieter, elektricien, advocaat en zes beroepen meer.`,
      ],
      tail: ['Gerangschikt op openbare Google-beoordelingen.', 'Gratis, en niemand betaalt om vermeld te worden.', 'Minstens elke 30 dagen ververst.'],
      intro: c => [
        `${c.coast} beslaat ${c.provList}. De gids telt daar ${c.townCount} plaatsen.`,
        c.pageCount ? `${c.pageCount} daarvan hebben een eigen pagina per vak en per beroep.` : 'Ze zijn bereikbaar via het plaatsmenu op beide gidspagina’s.',
      ],
    },
  },
};

// --- the English town pages -------------------------------------------------------------
//
// English only, deliberately. 133 towns times 14 categories times six languages is a page
// count no new domain gets crawled at, and five thin translations of a page that has not
// ranked yet cost more than they return. The other locales reach the same towns through
// the app, which is fully translated.
//
// Titles rotate through eight shapes and descriptions through four openings and five
// closings, chosen from a hash of the slug pair. Deterministic, so a rebuild does not churn
// the sitemap, and varied, so two thousand pages do not share one sentence.

export const TOWN = {
  // "on the Costa Blanca" reads correctly, "on the Islas Baleares" does not.
  coastPreposition: coast => (/^Islas/.test(coast) ? 'in the' : 'on the'),

  category: {
    titles: c => [
      `${c.CatPl} in ${c.town}`,
      `${c.CatPl} in ${c.town}, ${c.prov}`,
      `Find ${c.catPl} in ${c.town}`,
      `${c.town} ${c.catPl}, ranked from reviews`,
      `Best reviewed ${c.catPl} in ${c.town}`,
      `${c.CatPl} near ${c.town}, ${c.prov}`,
      `Looking for ${c.catPl} in ${c.town}?`,
      `${c.town} ${c.catPl}: what the reviews say`,
    ],
    h1: c => `The best rated ${c.catPl} in ${c.townFull}`,
    leads: c => [
      `The best rated ${c.catPl} in ${c.town}, ${c.prov}, read out of public Google reviews.`,
      `${c.CatPl} in ${c.town}, ranked by rating and weighted by how many reviews it rests on.`,
      `Looking for ${c.catPl} in ${c.town}? This list is built from public Google reviews.`,
      `Every one of the ${c.catPl} we can find near ${c.town}, ${c.prov}, in a single ranked list.`,
    ],
    tail: [
      'A 5.0 from three people does not outrank a 4.7 from four hundred.',
      'The language each review was written in is shown by every name.',
      'Free, and nobody pays to be listed.',
      'Refreshed at least every 30 days.',
      'We have not met them. Read the reviews and decide.',
    ],
  },

  tradesHub: {
    titles: t => [
      `Home repairs in ${t.town}`,
      `Find a tradesperson in ${t.town}, ${t.prov}`,
      `${t.town} plumbers, electricians and builders`,
      `Tradespeople in ${t.town}, ${t.prov}`,
      `Who to call in ${t.town} when something breaks`,
    ],
    h1: t => `Trades in ${t.townFull}`,
    leads: t => [
      `The six trades the directory covers in ${t.town}, ${t.prov}, each list ranked from public Google reviews.`,
      `Something broken in ${t.town}? Plumber, electrician, locksmith, air conditioning, pool or builder.`,
      `${t.town}, ${t.prov}. Six trades, each one ranked from what reviewers actually wrote.`,
    ],
    tail: [
      'The language each review was written in is shown by every name.',
      'Free, and nobody pays to be listed.',
      'Refreshed at least every 30 days.',
    ],
  },

  prosHub: {
    titles: t => [
      `Property experts in ${t.town}`,
      `Lawyers and gestorías in ${t.town}, ${t.prov}`,
      `${t.town} property professionals`,
      `Who to ask in ${t.town}, ${t.prov}`,
      `Property help in ${t.town}, ${t.prov}`,
    ],
    h1: t => `Property professionals in ${t.townFull}`,
    leads: t => [
      `The eight property professions the directory covers in ${t.town}, ${t.prov}, ranked from Google reviews.`,
      `Buying, selling or filing in ${t.town}? Start with what each of these people actually does.`,
      `${t.town}, ${t.prov}. Agents, lawyers, gestorías, architects, valuers, brokers and translators.`,
    ],
    tail: [
      'Each one says what the job is before it shows you anyone.',
      'Free, and nobody pays to be listed.',
      'Refreshed at least every 30 days.',
    ],
  },
};

// What each of the eight property professions is for. These are the exact lines the
// professionals page prints on screen under each name, so the static block and the rendered
// page agree word for word.
export const PROFESSION_DOES = {
  'real-estate': 'Buying or selling, and what things really go for locally.',
  lawyer: 'Contracts, disputes, inheritance, anything with a deadline.',
  gestoria: 'NIE, residency paperwork, tax filings, vehicle admin.',
  architect: 'Licences, extensions, and the energy certificate.',
  'community-admin': 'Runs the community your flat belongs to.',
  surveyor: 'What the property is worth on paper, for a bank or a court.',
  insurance: 'Home and contents cover that pays out from abroad.',
  translator: 'The only translations a Spanish registry will accept.',
};

// The section headings and small counts the hub pages render on screen.
//
// These are page furniture rather than content: the static block keeps its links in one
// flat list under a single heading, and the rendered page groups the same links under
// these. Nothing here is a claim about anybody, and none of it comes from Google.
export const HUB_UI = {
  en: {
    byCoast: 'By coast', byProvince: 'By province', provinces: 'Provinces',
    towns: 'Towns with their own pages',
    townCount: n => `${n} towns`, pageCount: n => `${n} with a page`,
    directories: 'Both directories',
  },
  no: {
    byCoast: 'Etter kyst', byProvince: 'Etter provins', provinces: 'Provinser',
    towns: 'Byer med egne sider',
    townCount: n => `${n} byer`, pageCount: n => `${n} med egen side`,
    directories: 'Begge oversiktene',
  },
  sv: {
    byCoast: 'Efter kust', byProvince: 'Efter provins', provinces: 'Provinser',
    towns: 'Orter med egna sidor',
    townCount: n => `${n} orter`, pageCount: n => `${n} med egen sida`,
    directories: 'Båda katalogerna',
  },
  de: {
    byCoast: 'Nach Küste', byProvince: 'Nach Provinz', provinces: 'Provinzen',
    towns: 'Orte mit eigener Seite',
    townCount: n => `${n} Orte`, pageCount: n => `${n} mit eigener Seite`,
    directories: 'Beide Verzeichnisse',
  },
  fr: {
    byCoast: 'Par côte', byProvince: 'Par province', provinces: 'Provinces',
    towns: 'Communes avec leur propre page',
    townCount: n => `${n} communes`, pageCount: n => `${n} avec une page`,
    directories: 'Les deux annuaires',
  },
  nl: {
    byCoast: 'Per kust', byProvince: 'Per provincie', provinces: 'Provincies',
    towns: 'Plaatsen met een eigen pagina',
    townCount: n => `${n} plaatsen`, pageCount: n => `${n} met een eigen pagina`,
    directories: 'Beide overzichten',
  },
};

// Labels for the two headings the static block adds. Short, and the same words the app
// uses for the same idea.
export const BLOCK = {
  en: { links: 'Pages from here', also: 'Also covered in the town menu', crumb: 'Breadcrumb' },
  no: { links: 'Sider herfra', also: 'Dekkes også i bymenyen', crumb: 'Brødsmulesti' },
  sv: { links: 'Sidor härifrån', also: 'Täcks också i ortmenyn', crumb: 'Brödsmulor' },
  de: { links: 'Seiten von hier', also: 'Ebenfalls im Ortsmenü', crumb: 'Brotkrumenpfad' },
  fr: { links: "Pages accessibles d'ici", also: 'Également dans le menu des communes', crumb: "Fil d'Ariane" },
  nl: { links: 'Pagina’s vanaf hier', also: 'Ook in het plaatsmenu', crumb: 'Kruimelpad' },
};
