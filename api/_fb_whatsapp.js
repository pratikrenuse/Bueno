// The WhatsApp parts of the publisher's daily email (November 2026).
//
// 1. CHANNEL_POSTS: one short update a day for the six Spain 24/7 WhatsApp channels, one per
//    language. Keyed by date. A day with no entry simply has no channel section.
// 2. AGENT_POSTS: a short post about the estate agents' WhatsApp group, for Facebook groups
//    where estate agents are, plus the comment that carries the link. They rotate, starting
//    on AGENT_POSTS_FROM, which is after the publisher has joined those groups.
//
// Every fact in a channel post was checked against its source on 1 November 2026. Anything
// that still depends on a vote says so in the post itself.
import { WHATSAPP_AGENTS_HUB } from './_fb_content.js';

export const CHANNEL_LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
export const CHANNEL_NAME = {
  en: 'Spain 24/7 (English)', no: 'Spania 24/7 (Norwegian)', sv: 'Spanien 24/7 Svenska (Swedish)',
  de: 'Spanien 24/7 (German)', fr: 'Espagne 24/7 (French)', nl: 'Spanje 24/7 (Dutch)',
};

const SITE = 'https://www.247spain.es';
const link = (lang, path) => `${SITE}${lang === 'en' ? '' : `/${lang}`}${path}`;

export const CHANNEL_POSTS = {
  '2026-11-02': {
    en: 'Welcome to Spain 24/7 on WhatsApp. We post short updates here for people who own a home in Spain.\n\nFirst update: a housing decree in force since 8 October 2026 says holiday lets of 30 nights or fewer will pay 10% VAT from 1 December 2026, unless the home is the owner\'s main home. Spain\'s parliament still has to confirm the decree, so this could still change. We will post here as soon as it is decided.',
    no: 'Velkommen til Spain 24/7 på WhatsApp. Her legger vi ut korte oppdateringer for deg som eier bolig i Spania.\n\nFørste oppdatering: en boligforordning som har gjeldt siden 8. oktober 2026 sier at ferieutleie på 30 netter eller mindre skal betale 10\u00a0% merverdiavgift fra 1. desember 2026, med mindre boligen er eierens hovedbolig. Det spanske parlamentet må fortsatt bekrefte forordningen, så dette kan fortsatt endre seg. Vi skriver her så snart det er avgjort.',
    sv: 'Välkommen till Spain 24/7 på WhatsApp. Här lägger vi upp korta uppdateringar för dig som äger en bostad i Spanien.\n\nFörsta uppdateringen: en bostadsförordning som gäller sedan den 8 oktober 2026 säger att semesteruthyrning på 30 nätter eller färre ska betala 10\u00a0% moms från den 1 december 2026, om bostaden inte är ägarens huvudbostad. Spaniens parlament måste fortfarande bekräfta förordningen, så detta kan fortfarande ändras. Vi skriver här så snart det är beslutat.',
    de: 'Willkommen bei Spain 24/7 auf WhatsApp. Hier veröffentlichen wir kurze Neuigkeiten für alle mit einem Zuhause in Spanien.\n\nErste Neuigkeit: Ein Wohnungsdekret, das seit dem 8. Oktober 2026 gilt, sieht vor, dass Ferienvermietungen von 30 Nächten oder weniger ab dem 1. Dezember 2026 mit 10\u00a0% Mehrwertsteuer belegt werden, außer das Haus ist der Hauptwohnsitz des Eigentümers. Das spanische Parlament muss das Dekret noch bestätigen, es kann sich also noch ändern. Wir melden uns hier, sobald es entschieden ist.',
    fr: 'Bienvenue sur Spain 24/7 sur WhatsApp. Nous publions ici de courtes nouvelles pour ceux qui ont une maison en Espagne.\n\nPremière nouvelle : un décret sur le logement en vigueur depuis le 8 octobre 2026 prévoit que les locations de vacances de 30 nuits ou moins paieront 10\u00a0% de TVA à partir du 1er décembre 2026, sauf si le logement est la résidence principale du propriétaire. Le parlement espagnol doit encore confirmer le décret, cela peut donc encore changer. Nous vous le dirons ici dès que ce sera décidé.',
    nl: 'Welkom bij Spain 24/7 op WhatsApp. Hier plaatsen we korte updates voor wie een huis in Spanje heeft.\n\nEerste update: een woningdecreet dat sinds 8 oktober 2026 geldt, bepaalt dat vakantieverhuur van 30 nachten of minder vanaf 1 december 2026 10% btw betaalt, tenzij de woning de hoofdverblijfplaats van de eigenaar is. Het Spaanse parlement moet het decreet nog bevestigen, dus dit kan nog veranderen. We melden het hier zodra het besloten is.',
  },
  '2026-11-03': {
    en: 'You may have seen headlines about a 100% tax on homes bought by non-EU buyers who do not live in Spain. It is still only a proposal. It has never been passed, and Spain\'s parliament was dissolved in October ahead of the general election. If you already own a home in Spain, nothing has changed for you.',
    no: 'Du har kanskje sett overskrifter om en skatt på 100\u00a0% på boliger kjøpt av kjøpere utenfor EU som ikke bor i Spania. Det er fortsatt bare et forslag. Det har aldri blitt vedtatt, og det spanske parlamentet ble oppløst i oktober før valget. Eier du allerede bolig i Spania, har ingenting endret seg for deg.',
    sv: 'Du har kanske sett rubriker om en skatt på 100\u00a0% på bostäder som köps av köpare utanför EU som inte bor i Spanien. Det är fortfarande bara ett förslag. Det har aldrig antagits, och Spaniens parlament upplöstes i oktober inför valet. Äger du redan en bostad i Spanien har ingenting ändrats för dig.',
    de: 'Vielleicht haben Sie Schlagzeilen über eine Steuer von 100\u00a0% auf Immobilien gelesen, die Käufer von außerhalb der EU ohne Wohnsitz in Spanien erwerben. Das ist weiterhin nur ein Vorschlag. Er wurde nie beschlossen, und das spanische Parlament wurde im Oktober vor der Wahl aufgelöst. Wenn Sie bereits eine Immobilie in Spanien besitzen, ändert sich für Sie nichts.',
    fr: 'Vous avez peut-être vu des titres sur une taxe de 100\u00a0% sur les logements achetés par des acheteurs hors UE qui ne vivent pas en Espagne. Ce n\'est toujours qu\'une proposition. Elle n\'a jamais été adoptée, et le parlement espagnol a été dissous en octobre avant les élections. Si vous avez déjà une maison en Espagne, rien n\'a changé pour vous.',
    nl: 'Misschien heeft u koppen gezien over een belasting van 100% op woningen die worden gekocht door kopers van buiten de EU die niet in Spanje wonen. Het is nog steeds alleen een voorstel. Het is nooit aangenomen, en het Spaanse parlement werd in oktober ontbonden voor de verkiezingen. Heeft u al een huis in Spanje, dan verandert er voor u niets.',
  },
  '2026-11-04': {
    en: 'Home sales in Spain rose 3.4% in August 2026 compared with August 2025, to 49,319 sales, according to Spain\'s statistics office (INE). From January to August, sales are still 2.3% lower than in the same months of last year.',
    no: 'Boligsalget i Spania økte med 3,4\u00a0% i august 2026 sammenlignet med august 2025, til 49\u00a0319 salg, ifølge det spanske statistikkbyrået (INE). Fra januar til august er salget fortsatt 2,3\u00a0% lavere enn i de samme månedene i fjor.',
    sv: 'Bostadsförsäljningen i Spanien ökade med 3,4\u00a0% i augusti 2026 jämfört med augusti 2025, till 49\u00a0319 försäljningar, enligt Spaniens statistikmyndighet (INE). Från januari till augusti är försäljningen fortfarande 2,3\u00a0% lägre än samma månader förra året.',
    de: 'Die Zahl der Immobilienverkäufe in Spanien stieg im August 2026 gegenüber August 2025 um 3,4\u00a0% auf 49.319 Verkäufe, so das spanische Statistikamt (INE). Von Januar bis August liegen die Verkäufe noch 2,3\u00a0% unter denselben Monaten des Vorjahres.',
    fr: 'Les ventes de logements en Espagne ont augmenté de 3,4\u00a0% en août 2026 par rapport à août 2025, à 49\u00a0319 ventes, selon l\'institut national de la statistique espagnol (INE). De janvier à août, les ventes restent 2,3\u00a0% plus basses que sur les mêmes mois de l\'an dernier.',
    nl: 'De woningverkopen in Spanje stegen in augustus 2026 met 3,4% ten opzichte van augustus 2025, tot 49.319 verkopen, volgens het Spaanse statistiekbureau (INE). Van januari tot en met augustus liggen de verkopen nog 2,3% lager dan in dezelfde maanden vorig jaar.',
  },
  '2026-11-05': {
    en: `If you own a home in Spain that you do not rent out, you pay a yearly non-resident tax on it. The return for 2025 is due by 31 December 2026, and if you want to pay by direct debit you need to file by 23 December. You can work out what you owe here: ${link('en', '/tax-calculator')}`,
    no: `Eier du en bolig i Spania som du ikke leier ut, betaler du en årlig skatt for ikke-bosatte. Skattemeldingen for 2025 må leveres innen 31. desember 2026, og vil du betale med autotrekk, må du levere innen 23. desember. Her kan du regne ut hva du skal betale: ${link('no', '/tax-calculator')}`,
    sv: `Äger du en bostad i Spanien som du inte hyr ut betalar du en årlig skatt för personer som inte är bosatta. Deklarationen för 2025 ska lämnas senast den 31 december 2026, och vill du betala med autogiro måste du lämna den senast den 23 december. Här kan du räkna ut vad du ska betala: ${link('sv', '/tax-calculator')}`,
    de: `Wenn Sie in Spanien eine Immobilie besitzen, die Sie nicht vermieten, zahlen Sie dafür jährlich eine Steuer für Nichtansässige. Die Erklärung für 2025 ist bis zum 31. Dezember 2026 fällig, und wer per Lastschrift zahlen möchte, muss bis zum 23. Dezember einreichen. Hier können Sie ausrechnen, was Sie zahlen: ${link('de', '/tax-calculator')}`,
    fr: `Si vous avez en Espagne un logement que vous ne louez pas, vous payez chaque année un impôt de non-résident. La déclaration pour 2025 doit être déposée au plus tard le 31 décembre 2026, et pour payer par prélèvement, il faut déposer avant le 23 décembre. Calculez ce que vous devez ici : ${link('fr', '/tax-calculator')}`,
    nl: `Heeft u in Spanje een woning die u niet verhuurt, dan betaalt u daar elk jaar belasting voor niet-ingezetenen over. De aangifte over 2025 moet uiterlijk 31 december 2026 binnen zijn, en wilt u via automatische incasso betalen, dan moet u uiterlijk 23 december aangifte doen. Hier rekent u uit wat u betaalt: ${link('nl', '/tax-calculator')}`,
  },
  '2026-11-06': {
    en: 'The same October housing decree lets town halls in areas with a stressed housing market charge extra property tax (IBI) on homes used as holiday lets, from 1 January 2027. The extra can be up to 50%, rising to 100% for owners with two or more such homes and 150% with four or more. Each town hall decides whether to use it, and the decree still needs parliament\'s approval.',
    no: 'Den samme boligforordningen fra oktober lar kommuner i områder med presset boligmarked kreve ekstra eiendomsskatt (IBI) på boliger som brukes til ferieutleie, fra 1. januar 2027. Tillegget kan være opptil 50\u00a0%, og 100\u00a0% for eiere med to eller flere slike boliger og 150\u00a0% med fire eller flere. Hver kommune bestemmer selv om den vil bruke det, og forordningen må fortsatt godkjennes av parlamentet.',
    sv: 'Samma bostadsförordning från oktober låter kommuner i områden med ansträngd bostadsmarknad ta ut extra fastighetsskatt (IBI) på bostäder som används för semesteruthyrning, från den 1 januari 2027. Tillägget kan vara upp till 50\u00a0%, och 100\u00a0% för ägare med två eller fler sådana bostäder och 150\u00a0% med fyra eller fler. Varje kommun bestämmer själv om den vill använda det, och förordningen måste fortfarande godkännas av parlamentet.',
    de: 'Dasselbe Wohnungsdekret vom Oktober erlaubt Gemeinden in Gebieten mit angespanntem Wohnungsmarkt, ab dem 1. Januar 2027 einen Zuschlag auf die Grundsteuer (IBI) für Ferienwohnungen zu erheben. Der Zuschlag kann bis zu 50\u00a0% betragen, 100\u00a0% bei Eigentümern mit zwei oder mehr solchen Wohnungen und 150\u00a0% ab vier. Jede Gemeinde entscheidet selbst, ob sie ihn nutzt, und das Dekret braucht noch die Zustimmung des Parlaments.',
    fr: 'Le même décret d\'octobre permet aux mairies des zones où le marché du logement est tendu d\'appliquer une majoration de la taxe foncière (IBI) sur les logements loués aux vacanciers, à partir du 1er janvier 2027. La majoration peut aller jusqu\'à 50\u00a0%, 100\u00a0% pour les propriétaires de deux logements de ce type ou plus et 150\u00a0% à partir de quatre. Chaque mairie décide si elle l\'applique, et le décret doit encore être approuvé par le parlement.',
    nl: 'Hetzelfde woningdecreet van oktober staat gemeenten in gebieden met een gespannen woningmarkt toe om vanaf 1 januari 2027 een toeslag op de onroerendgoedbelasting (IBI) te heffen op woningen die als vakantiewoning worden verhuurd. De toeslag kan oplopen tot 50%, 100% voor eigenaren met twee of meer van zulke woningen en 150% vanaf vier. Elke gemeente beslist zelf of ze die toepast, en het decreet moet nog door het parlement worden goedgekeurd.',
  },
  '2026-11-07': {
    en: `Leaving your Spanish home empty for the winter? Turn the water off at the mains, leave the fridge door open if you switch it off, and ask someone to look in after a storm. Our free checklist makes a list for your own home: ${link('en', '/closing-up')}`,
    no: `Skal boligen i Spania stå tom i vinter? Steng vannet ved hovedkranen, la kjøleskapsdøren stå åpen hvis du slår det av, og be noen se innom etter et uvær. Den gratis sjekklisten vår lager en liste for din bolig: ${link('no', '/closing-up')}`,
    sv: `Ska huset i Spanien stå tomt i vinter? Stäng av vattnet vid huvudkranen, låt kylskåpsdörren stå öppen om du stänger av det, och be någon titta in efter ett oväder. Vår gratis checklista gör en lista för just ditt hus: ${link('sv', '/closing-up')}`,
    de: `Steht Ihr Haus in Spanien diesen Winter leer? Drehen Sie das Wasser am Haupthahn ab, lassen Sie die Kühlschranktür offen, wenn Sie ihn ausschalten, und bitten Sie jemanden, nach einem Sturm nachzusehen. Unsere kostenlose Checkliste erstellt eine Liste für Ihr Haus: ${link('de', '/closing-up')}`,
    fr: `Votre maison en Espagne reste vide cet hiver ? Coupez l'eau au robinet principal, laissez la porte du frigo ouverte si vous l'éteignez, et demandez à quelqu'un de passer après une tempête. Notre checklist gratuite fait une liste pour votre maison : ${link('fr', '/closing-up')}`,
    nl: `Staat uw huis in Spanje deze winter leeg? Draai het water dicht bij de hoofdkraan, laat de koelkastdeur open als u hem uitzet, en vraag iemand om na een storm even te kijken. Onze gratis checklist maakt een lijst voor uw eigen huis: ${link('nl', '/closing-up')}`,
  },
};

// Facebook groups for estate agents. Posted in English, from whichever accounts have joined
// those groups, from AGENT_POSTS_FROM onwards (the publisher joins the groups on 2 and 3 November).
export const AGENT_POSTS_FROM = '2026-11-04';
export const AGENT_GROUPS_PER_DAY = 3;
export const AGENT_POSTS = [
  'For estate agents in Spain who sell to foreign buyers: we have started a WhatsApp group where agents ask the questions their clients ask them, like the yearly non-resident tax, the 3% held back when a non-resident sells, or what to do when a buyer cannot fly in for the notary. We answer them, and we share rule changes every week. It is free to join, and the link is in the comments.',
  'A quick question for the agents here: what is the one thing your foreign buyers ask that you never have a clear answer to? We collect those questions in our agents\' WhatsApp group and answer them properly, with the official source. The link is in the comments if you want to join.',
  'Agents, the October housing decree adds 10% VAT on short holiday lets from 1 December, if parliament confirms it. Buyers who plan to let will ask you about it. We explain changes like this in plain English every week in our agents\' WhatsApp group, and the link is in the comments.',
  'If you sell to Norwegian, Swedish, German, Dutch or French buyers, they will ask you about Spanish tax after the sale. We have free tools that answer it in their own language, and a WhatsApp group for agents where we answer everything else. The link is in the comments.',
];
export const AGENT_COMMENT = `Here is the link to the estate agents' WhatsApp group: ${WHATSAPP_AGENTS_HUB}`;

const DAY_MS = 24 * 3600 * 1000;
// 6 November 2026, Pratik: nothing goes into the channels unless he has approved it in the
// deck's WhatsApp channels view. These hand-written days were never approved there, so they
// are no longer sent. Kept for the record; set to true only if he asks for them back.
export const WRITTEN_CHANNEL_POSTS_ON = false;
export function channelPostFor(date) {
  return WRITTEN_CHANNEL_POSTS_ON ? (CHANNEL_POSTS[date] || null) : null;
}

// The photo that goes with a channel post. 6 November 2026, Pratik: the licensed stock photos
// from the folder (studio/photos, published at /photos by the build), plain, with no Bueno logo
// and no mention of Bueno, because the WhatsApp channels are Spain 24/7. These are the 15
// different pictures in that folder: the greyscale call-centre shot (g00) and the files that
// are the same picture under another name (golden_coast, arch_terrace, coast_bay,
// sunset_village, terrace_sunset) are left out. A story gets the photo used least so far
// (api/_fb_channels.js) and keeps it; "Change photo" offers all 15.
export const CHANNEL_PHOTOS = [
  'g07', 'g02', 'g08', 'g04', 'pool_dusk', 'couple_beach', 'g03', 'g05', 'marina', 'g06',
  'g09', 'cove_house', 'g01', 'g10', 'poolside',
];
const SITE_PHOTOS = 'https://www.247spain.es/photos';
export const photoUrl = (name) => `${SITE_PHOTOS}/${name}.jpg`;
export const photoNameOf = (url) => {
  const m = String(url || '').match(/^https:\/\/www\.247spain\.es\/photos\/([a-z0-9_]+)\.jpg$/);
  return m && CHANNEL_PHOTOS.includes(m[1]) ? m[1] : null;
};
export const isChannelPhoto = (url) => !!photoNameOf(url);
export function channelImageFor(item) {
  return item && isChannelPhoto(item.channel_image) ? item.channel_image : null;
}

// An approved story from the newsletter digest (news_items), in the same shape as a
// CHANNEL_POSTS day: one text per channel language. Used only on a day CHANNEL_POSTS has no
// entry for, so a post written by hand always wins. Returns null unless every language is there.
export function channelFromNews(item) {
  if (!item) return null;
  const en = (item.edited_en && String(item.edited_en).trim()) ? item.edited_en : item.en;
  const t = item.translations || {};
  const out = { en: String(en || '').trim() };
  for (const l of CHANNEL_LANGS.filter(x => x !== 'en')) out[l] = String(t[l] || '').trim();
  if (!CHANNEL_LANGS.every(l => out[l])) return null;
  out.image = channelImageFor(item);
  return out;
}
export function agentPostFor(date) {
  if (date < AGENT_POSTS_FROM) return null;
  const n = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${AGENT_POSTS_FROM}T00:00:00Z`)) / DAY_MS);
  return AGENT_POSTS[n % AGENT_POSTS.length];
}

// Posts for inside the estate agents' WhatsApp group (Agents' WhatsApp Hub). Off until Pratik
// says a few agents have joined: then set HUB_POSTS_ON to true, commit and push. They rotate daily.
export const HUB_POSTS_ON = false;
export const HUB_POSTS_FROM = '2026-11-02';
export const HUB_POSTS = [
  'Welcome to the hub. This is a place for estate agents in Spain who sell to foreign buyers. Post any question a client has asked you that you could not answer, and we will come back with a clear answer and the official source.',
  'A question buyers ask a lot: what is held back when a non-resident sells? The buyer keeps back 3% of the price and pays it to the tax office for the seller. The seller then files a return to settle the real tax, and gets back anything paid too much. The full answer is here: https://www.247spain.es/answers/three-percent-withheld-when-selling-spanish-property',
  'For buyers who cannot fly in to sign: a power of attorney can be signed at a Spanish consulate, or at a notary at home with an apostille. Our planner sets out the steps for each country: https://www.247spain.es/poa-planner',
  'Buyers who plan to let their home will ask about the October housing decree. It adds 10% VAT on holiday lets of 30 nights or fewer from 1 December, unless the home is the owner\'s main home, and it still needs parliament\'s confirmation. We will post here as soon as it is decided.',
  'A tool you can send to any buyer before they sign: the buying costs for every region, with the taxes worked out for their price, in their own language. https://www.247spain.es/purchase-costs',
];
export function hubPostFor(date) {
  if (!HUB_POSTS_ON || date < HUB_POSTS_FROM) return null;
  const n = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${HUB_POSTS_FROM}T00:00:00Z`)) / DAY_MS);
  return HUB_POSTS[((n % HUB_POSTS.length) + HUB_POSTS.length) % HUB_POSTS.length];
}

// Days of channel posts still written from `date` onwards (used for Pratik's reminder).
export function channelDaysLeft(date) {
  if (!WRITTEN_CHANNEL_POSTS_ON) return 0;
  return Object.keys(CHANNEL_POSTS).filter(d => d >= date).length;
}
