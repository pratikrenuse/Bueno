// The Facebook groups each language's post goes into, and which account posts there.
//
// WHERE THIS COMES FROM
// The list is the "Active groups" sheet of
// Claude outputs/247Spain_Facebook_Groups_and_Daily_Plan.xlsx, built on 6 October 2026 from
// Pratik's own list of groups and the September research. The order here is the order in
// that sheet, and the rotation below is the same arithmetic as its "Daily plan" sheet, so
// the links in the daily email and the rows in the workbook always agree. If a group is
// added or dropped, change both.
//
// ONE ACCOUNT PER LANGUAGE
// The publisher has seven Facebook accounts, numbered 1 to 7. Each one looks after one
// language, so every account posts every day and a group only ever sees one account.
//

export const ACCOUNT = { en: 1, no: 2, sv: 3, da: 4, de: 5, fr: 6, nl: 7 };

export const GROUPS = {
  en: [
    ["Property sales spain", "https://www.facebook.com/groups/205985732845546"],
    ["Malaga Spain - Expats Forum", "https://www.facebook.com/groups/2155579588092100/"],
    ["Northern Spain Expat/international community.", "https://www.facebook.com/groups/3383904228385390"],
    ["LOVE LOCAL L'ALFAS DEL PI & ALTEA", "https://www.facebook.com/groups/529630147992603"],
    ["Expats in Spain", "https://www.facebook.com/groups/guirisinspain/"],
    ["British Ex-Pats in Spain", "https://www.facebook.com/groups/311583547374/"],
    ["Expats in Malaga", "https://www.facebook.com/groups/expatsmalaga/"],
    ["Expats in Spain", "https://www.facebook.com/groups/expatsinspaingroup/"],
    ["Moving To Spain", "https://www.facebook.com/groups/1383221861813902/"],
    ["Spain long and short term rentals and sales", "https://www.facebook.com/groups/814827978926444"],
    ["Digital Nomads SPAIN (Malaga)", "https://www.facebook.com/groups/5104707899555756"],
    ["Entrepreneurs of Spain", "https://www.facebook.com/groups/1ib.marioschaefer.031"],
    ["Jobs In UAE US Spain and East Europe", "https://www.facebook.com/groups/1134168447447463"],
    ["Digital Nomads Spain", "https://www.facebook.com/groups/digitalnomadsspain/"],
    ["Spain Holiday Rentals - Owners and Guests Community", "https://www.facebook.com/groups/HolidayRentalsSpain"],
    ["Expats living and working in Basque Country", "https://www.facebook.com/groups/expats.living.and.working.in.basque.country"],
    ["British moving to Spain", "https://www.facebook.com/groups/219172750091364"],
    ["Expats Valencia", "https://www.facebook.com/groups/1411999335713930/"],
    ["Filipino In Malaga Spain", "https://www.facebook.com/groups/163108704437630"],
    ["Jobs in Costa Blanca North, Benidorm, Calpe, Javea, Denia", "https://www.facebook.com/groups/JobsinCostaBlancaNorthBenidormCalpeJavea"],
    ["Properties in Costa Blanca & Costa Calida (Spain)", "https://www.facebook.com/groups/properties.costa.blanca.spain/"],
    ["Properties For Sale or Rent Murcia Almeria Costa Blanca", "https://www.facebook.com/groups/885465738967836/"],
    ["Property, Wanted, For Sale & Rentals, Mojacar Area", "https://www.facebook.com/groups/447125222337830/"],
    ["Expats retired or working and living in Spain", "https://www.facebook.com/groups/4172728182/"],
    ["American Expats in Spain", "https://www.facebook.com/groups/americanexpatsinspaingroup/"],
    ["Expats Costa Blanca", "https://www.facebook.com/groups/expatscostablanca/"],
    ["Expats World in Torrevieja", "https://www.facebook.com/groups/expatsworldtorrevieja/"],
    ["Brits in Spain post-Brexit mutual support group", "https://www.facebook.com/groups/402114137571202/"],
    ["Expats in Spain, Info, Help & Advice Forum", "https://www.facebook.com/groups/581068579793177/"],
    ["Buy and sell properties in Spain", "https://www.facebook.com/groups/517036155434490"],
    ["SPAIN PROPERTY... selling, swapping or long term rental property in Spain", "https://www.facebook.com/groups/812750985480385"],
    ["LONG TERM RENTAL OFFERS IN SPAIN, ONLY 1 YEAR CONTRACTS MIN.", "https://www.facebook.com/groups/TEHUURLANGETERMIJNSPANJE"],
    ["The Friends of Spain", "https://www.facebook.com/groups/circleofspain"],
    ["Alicante Expats", "https://www.facebook.com/groups/alicanteexpats"],
    ["Alicante Province Expats - Spain", "https://www.facebook.com/groups/ilovealicantetoo/"],
    ["Valencia Expats", "https://www.facebook.com/groups/valenciaexpats/"],
    ["Spain's help group for expats", "https://www.facebook.com/groups/1556813121287509/"],
    ["Expats in Andalusia, Spain", "https://www.facebook.com/groups/1691765441056300/"],
    ["Expats in Spain", "https://www.facebook.com/groups/348560391936954/"],
    ["British Expats in Spain", "https://www.facebook.com/groups/BritishExpatsInSpain/"],
    ["Expats living and working in Valencia", "https://www.facebook.com/groups/expats.living.and.working.in.valencia/"],
    ["Expats in Barcelona", "https://www.facebook.com/groups/641945222594419/"],
    ["Official Tenerife Forum", "https://www.facebook.com/groups/tenerifeforum/"],
    ["GOSPAIN - Moving To And Living In Spain", "https://www.facebook.com/groups/gospain.co.uk/"],
    ["Spain Jobs Careers", "https://www.facebook.com/groups/SpainJobsCareers"],
    ["Jobs In Spain", "https://www.facebook.com/groups/findJobsInSpain"],
    ["We Love Spain Excursions", "https://www.facebook.com/groups/welovespain2"],
    ["Jobs in Spain", "https://www.facebook.com/groups/314316395858638"],
    ["Friends from Spain", "https://www.facebook.com/groups/2387585857925290"],
    ["Filipinos in Spain", "https://www.facebook.com/groups/FilipinosInSpain"],
  ],
  no: [
    ["Kjøp Salg Costa Blanca Nord", "https://www.facebook.com/groups/903121083056506/"],
    ["Norsk i Torrevieja, Orihuela Costa, Guardamar og Santa Pola", "https://www.facebook.com/groups/norsktorrevieja/"],
    ["ALBIRS VENNER/ FRIENDS OF ALBIR", "https://www.facebook.com/groups/1791377787804561"],
    ["Nordmenn på fastlandet i Spania", "https://www.facebook.com/groups/nordmennispania"],
    ["CASA VITAL Altea Spain", "https://www.facebook.com/groups/306161013831"],
    ["SPANIAPORTALEN", "https://www.facebook.com/groups/357676054576576"],
    ["Skandinaver på Costa Blanca", "https://www.facebook.com/groups/487747667919856"],
    ["Nordmenn i Spania på fastlandet", "https://www.facebook.com/groups/spaniafornordmenn"],
    ["Vi som trives på Costa Blanca", "https://www.facebook.com/groups/ViSomTrivesCostaBlanca/"],
    ["Costa Blanca for Skandinaver", "https://www.facebook.com/groups/244157526835867"],
    ["Nordmenn på Gran Canaria", "https://www.facebook.com/groups/819306401472155/"],
    ["Nordmenn i Malaga", "https://www.facebook.com/groups/2541499126129945/"],
    ["Nordmenn i Torrevieja", "https://www.facebook.com/groups/Nordmennitorrevieja/"],
    ["Norsk i Spania", "https://www.facebook.com/groups/NorskSpania/"],
    ["Bo i Spania", "https://www.facebook.com/groups/227525467375814/"],
    ["Ditt Spania", "https://www.facebook.com/groups/339503130860695/"],
    ["Norsk i Albir, Altea, Alfaz del Pi og La Nucia", "https://www.facebook.com/groups/norskalbiraltea/"],
    ["Gran Canaria ferie.no", "https://www.facebook.com/groups/724058962464694/"],
    ["REKLAMESIDE FOR FIRMAER og PRIVATE I SPANIA", "https://www.facebook.com/groups/nordmennispaniasinrekalmeside/"],
    ["Treff nye venner i områdene rundt Albir, Alfaz & Altea", "https://www.facebook.com/groups/447461922031404"],
    ["Jobb i Spania pa norsk.es", "https://www.facebook.com/groups/jobbispania/"],
    ["Corona viruset i Spania, Hjelp, rad og nyheter til Nordmenn i Spania", "https://www.facebook.com/groups/2457982984532029/"],
    ["Jobb i Spania, Costa del Sol", "https://www.facebook.com/groups/jobbeispania/"],
  ],
  sv: [
    ["Svenskar med bostad i Spanien.", "https://www.facebook.com/groups/349275328863940/"],
    ["Svenskar i Torrevieja, Tips och Information om forsaljning/kop av fastighet", "https://www.facebook.com/groups/2043840269164081/"],
    ["Svenskar och Norrmänn i Fuengirola", "https://www.facebook.com/groups/939146222841936/"],
    ["Svenskar i Torrevieja", "https://www.facebook.com/groups/svenskaritorrevieja/"],
    ["Svenskar i Marbella", "https://www.facebook.com/groups/212241382240433/"],
    ["Svenskar i Spanien, tipsa om olika aktiviteter för varann", "https://www.facebook.com/groups/1608471532705235/"],
    ["Svenskar i Alicante", "https://www.facebook.com/groups/528657023914613/"],
    ["Svenskar i Madrid", "https://www.facebook.com/groups/svenskarimadrid/"],
    ["Svenskar & Skandinaver på COSTA DEL SOL", "https://www.facebook.com/groups/1643152569235596/"],
    ["Svenskar & Skandinaver på MALLORCA", "https://www.facebook.com/groups/1653563224860024/"],
    ["Svenskar i Spanien, tipsa om olika aktiviteter för varann", "https://www.facebook.com/groups/svenskarispanien/"],
    ["Torrevieja Svenskar", "https://www.facebook.com/groups/1431808357063773/"],
    ["Svenskar på Costa Blanca", "https://www.facebook.com/groups/1512665092287008/"],
    ["Svenskar & Skandinaver i TORREVIEJA", "https://www.facebook.com/groups/1045808755431289/"],
    ["Svenskar i Malaga", "https://www.facebook.com/groups/svenskarimalaga/"],
    ["Svenskar på Costa del Sol", "https://www.facebook.com/groups/809202249108256/"],
    ["Svenskar i Spanien, tipsa om olika aktiviteter för varann", "https://www.facebook.com/groups/1846521848907288/"],
    ["Vi som Älskar Spanien", "https://www.facebook.com/groups/visomalskarspanien/"],
    ["Spanien-Svenskar", "https://www.facebook.com/groups/SpanienSvenskar"],
    ["Svenskar i Marbella", "https://www.facebook.com/groups/673214493236192/"],
    ["Svenskar i Fuengirola", "https://www.facebook.com/groups/464955336908232/"],
    ["Jobb och bostad i Spanien", "https://www.facebook.com/groups/474700669264705/"],
    ["Jobb i Spanien", "https://www.facebook.com/groups/jobbispanien/"],
  ],
  da: [
    ["Forum for danskere med ejendom i Spanien", "https://www.facebook.com/groups/112158645492060/"],
    ["Danskere på Mallorca", "https://www.facebook.com/groups/danskerepaamallorca/"],
    ["Danskere i hele Spanien", "https://www.facebook.com/groups/191188050664/"],
    ["Danskere i Malaga", "https://www.facebook.com/groups/1173851506039305/"],
    ["Danskere i Fuengirola", "https://www.facebook.com/groups/346960195463514/"],
    ["Dansker på Gran Canaria", "https://www.facebook.com/groups/1562958707283140/"],
    ["Danskere på Solkysten, Spain", "https://www.facebook.com/groups/29181184860/"],
    ["Danskere på Costa del Sol", "https://www.facebook.com/groups/170463836622067/"],
  ],
  de: [
    ["Deutsche in Spanien - Die Gruppe für Auswanderer, Urlauber und Residenten", "https://www.facebook.com/groups/deutscheinspanien/"],
    ["Deutsche in Spanien", "https://www.facebook.com/groups/346643102204215"],
    ["Deutsche in Spanien, 2.0", "https://www.facebook.com/groups/754696715102677/"],
    ["Deutsche die in Spanien leben oder leben wollen", "https://www.facebook.com/groups/585134778360279/"],
    ["Deutsche in Spanien", "https://www.facebook.com/groups/123195078355444/"],
    ["Mallorca 2025", "https://www.facebook.com/groups/290979467633096/"],
    ["Deutsche auf Mallorca", "https://www.facebook.com/groups/422837494396902"],
    ["Mallorca Deutscher Club", "https://www.facebook.com/groups/deutscherclubmallorca"],
    ["Leben, Wohnen und Urlauben in Spanien- deutschsprachige Gruppe", "https://www.facebook.com/groups/706147816615528/"],
    ["Alemanes en Madrid", "https://www.facebook.com/groups/15824567023/"],
    ["Deutsche an der Costa Blanca, das ORIGINAL !", "https://www.facebook.com/groups/costablancatreff/"],
    ["Deutsche Auswanderer an der Costa Blanca", "https://www.facebook.com/groups/1303867623122836/"],
    ["Auswandern nach Spanien", "https://www.facebook.com/groups/1940875842811739/"],
    ["Auswandern nach Spanien, Deutsche Community, Tipps & Erfahrungen", "https://www.facebook.com/groups/spanienleben/"],
  ],
  fr: [
    ["Vivre et Investir en Espagne", "https://www.facebook.com/groups/vivreetinvestirenespagne/"],
    ["Les Francophones d'Alicante et de sa Province", "https://www.facebook.com/groups/francophones.en.alicante/"],
    ["Les Français au sud de l'Espagne", "https://www.facebook.com/groups/262682974170319/"],
    ["Les Français et Francophones de Torrevieja", "https://www.facebook.com/groups/733290380161196/"],
    ["Les français en Espagne", "https://www.facebook.com/groups/castellplatjadaro/"],
    ["Les Francais et Francophones de Barcelone", "https://www.facebook.com/groups/francaisbarcelone/"],
    ["Alicante et ses francophones", "https://www.facebook.com/groups/Alicantefrancophones/"],
    ["Les Francais et Francophones de Alicante et Torrevieja", "https://www.facebook.com/groups/561472117622626/"],
    ["Union francophone de Valencia", "https://www.facebook.com/groups/338836464542/"],
    ["Expat Francais et francophone Espagne Alicante Benidorm Altea Calpe Denia", "https://www.facebook.com/groups/1835099096714678/"],
    ["Les francophones d'Alicante", "https://www.facebook.com/groups/2330788943802126/"],
    ["Les Algeriens d'Alicante", "https://www.facebook.com/groups/425409201973255/"],
    ["Tunisiens en Espagne", "https://www.facebook.com/groups/1625875210885067/"],
    ["algeriens a alicante", "https://www.facebook.com/groups/346768156799990/"],
  ],
  nl: [
    ["Nederlanders en Belgen in Spanje", "https://www.facebook.com/groups/NederlandersenBelgeninSpanje/"],
    ["Nederlanders in Spanje", "https://www.facebook.com/groups/337056859820646/"],
    ["Nederlanders in Spanje - Dutch in Spain / Holandeses en Espana", "https://www.facebook.com/groups/5078631925/"],
    ["Belgen en Nederlanders in Alicante", "https://www.facebook.com/groups/satcomdigital/"],
    ["Nederlandstaligen in Alicante", "https://www.facebook.com/groups/379888877591070/"],
    ["Belgen en Nederlanders in Almeria", "https://www.facebook.com/groups/291021641614701/"],
    ["Nederlanders en Vlamingen in Andalusie", "https://www.facebook.com/groups/nederlandersenvlamingeninandalusie/"],
    ["Nederlanders en Belgen in Aspe en omgeving (Spanje)", "https://www.facebook.com/groups/165424010556026/"],
    ["Nederlanders op de Balearen (Ibiza, Mallorca en Menorca)", "https://www.facebook.com/groups/885025855224170/"],
    ["Nederlanders en Vlamingen in Barcelona", "https://www.facebook.com/groups/NederlandersenVlamingeninBarcelona/"],
    ["Nederlanders in Barcelona", "https://www.facebook.com/groups/1691415041166618/"],
    ["Nederlanders in Barcelona (New in Barcelona)", "https://www.facebook.com/groups/nederlandersinbarcelona/"],
    ["Belgen en Nederlanders in Benidorm", "https://www.facebook.com/groups/396319767158009/"],
    ["Overwinteren en wonen in Benidorm", "https://www.facebook.com/groups/433774757352118/"],
    ["Nederlandstaligen op de Canarische Eilanden", "https://www.facebook.com/groups/canarischeeilanden/"],
    ["Nederlanders in Catalonie", "https://www.facebook.com/groups/nederlandersincatalunya/"],
    ["Nederlanders in Catalunya", "https://www.facebook.com/groups/141927485864969/"],
    ["Nederlanders en Vlamingen in Ciudad Quesada en omgeving", "https://www.facebook.com/groups/579328320166485/"],
    ["Nederlanders/Belgen wonen in Albox, Huercal Overa, Purchena", "https://www.facebook.com/groups/207127855425644/"],
    ["Nederlandstaligen omgeving Albox, Oria, Arboleas", "https://www.facebook.com/groups/410959638038308/"],
  ],
};

// HOW MANY GROUPS A DAY
// Never more than three per language, which is the most Pratik wants a single account to
// post in on one day. And the start is gentle, so that new accounts are not flagged: the
// first day's post goes into one group per language, the second into two, and from the third
// day on into three.
export const MAX_PER_DAY = 3;
export const RAMP = [1, 2];

// The first day a post goes out. 9 to 11 October 2026 are for joining the groups and getting
// the accounts going, so the daily send does nothing before this date unless someone forces it.
export const DAILY_START = '2026-10-12';

export const perDay = (lang, day = MAX_PER_DAY + 1) => {
  const n = (GROUPS[lang] || []).length;
  const d = Math.max(1, Number(day) || 1);
  const want = d <= RAMP.length ? RAMP[d - 1] : MAX_PER_DAY;
  return Math.min(want, n);
};

// Where in the list a day starts: the sum of every earlier day's count.
const offsetFor = (lang, day) => {
  let o = 0;
  for (let k = 1; k < day; k += 1) o += perDay(lang, k);
  return o;
};

/**
 * The groups one language posts in on a given day. Day 1 is the first post ever sent, day 2
 * the second, and so on, so a day with no send does not skip any group.
 * Returns [{ name, url }].
 */
export function groupsFor(lang, day) {
  const list = GROUPS[lang] || [];
  if (!list.length) return [];
  const d = Math.max(1, Number(day) || 1);
  const per = perDay(lang, d);
  const start = offsetFor(lang, d);
  const out = [];
  for (let s = 0; s < per; s += 1) {
    const [name, url] = list[(start + s) % list.length];
    out.push({ name, url });
  }
  return out;
}
