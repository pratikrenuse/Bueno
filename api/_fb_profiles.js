// Personal profile posts for the Maria Lopez persona accounts (17 November 2026).
//
// WHAT THIS IS
// Pratik runs seven persona profiles on each of four platforms (Instagram, Facebook, LinkedIn,
// X), one profile per language. Every day one post goes out on all of them: a short vertical
// video (a reel) made from the profile's own avatar and one photo of the same persona, with the
// words on screen, plus a caption in that language. Written as a person sharing what she has
// learned living in Spain, never as a business. Topics: foreign owners and estate agents in Spain.
//
// THE RULE THAT MUST NEVER BREAK
// Three personas, never mixed. A language always uses the same persona, the same avatar and the
// same language, every time. PERSONA_BY_LANG and AVATAR below are the only place that decides
// it, the renderer (studio/personas/render_reels.py) reads the same table from
// studio/personas/plan.json, and fb_profiles.test.mjs checks that both agree.
//
// HOW A DAY GOES OUT
// Nothing needs approving. The daily task email (api/_fb_dispatch.js) carries the next post in
// PROFILE_ORDER that has not gone out and that Pratik has not parked in the deck. The videos are
// rendered ahead in batches and committed under public/persona-reels/<post>/<lang>.mp4. When fewer
// than PROFILE_LOW posts are left, Pratik alone gets a note.

export const LANGS7 = ['en', 'no', 'sv', 'da', 'de', 'fr', 'nl'];
export const LANG_LABEL = {
  en: 'English', no: 'Norwegian', sv: 'Swedish', da: 'Danish', de: 'German', fr: 'French', nl: 'Dutch',
};

// Persona folders under "Claude outputs/" (INSTAGRAM_PERSONAS.md). Danish uses SD, the same
// woman as Swedish and Dutch (its Instagram picture, DA_hindi.jpg, came from that folder).
export const PERSONAS = {
  NE: 'Maria NE Lopez', SD: 'Maria SD Lopez', FG: 'Maria FG Lopez',
};
export const PERSONA_BY_LANG = {
  en: 'NE', no: 'NE', sv: 'SD', nl: 'SD', da: 'SD', fr: 'FG', de: 'FG',
};

const SITE = 'https://www.247spain.es';
// The profile picture each language uses everywhere, set on all its accounts on 12 and 17 Nov.
export const AVATAR = {
  en: `${SITE}/ig-setup/EN_Spain24x7.jpg`,
  no: `${SITE}/ig-setup/NO_p.jpg`,
  sv: `${SITE}/ig-setup/SV_ibex.jpg`,
  nl: `${SITE}/ig-setup/NL_xyz.jpg`,
  da: `${SITE}/ig-setup/DA_hindi.jpg`,
  fr: `${SITE}/ig-setup/FR_gmp.jpg`,
  de: `${SITE}/ig-setup/DE_pr.jpg`,
};

// The 28 profiles, from Pratik's sheet (17 November 2026). The account numbers differ per
// platform, so everything here is matched by language, never by number.
export const PROFILES = {
  en: {
    instagram: { n: 2, handle: 'maria.lopez.spain', login: 'pratik.be.cc@gmail.com' },
    facebook: { n: 1, name: 'Sandra Ni', login: 'gmp.digimarketing@gmail.com' },
    linkedin: { n: 1, name: 'Maria Lopez', login: 'superkoolpratik@gmail.com' },
    x: { n: 1, handle: 'maverickTom199', login: 'pratik.be.cc@gmail.com' },
  },
  no: {
    instagram: { n: 3, handle: 'maria.lopez.spania', login: 'pratikadsrenuse@gmail.com' },
    facebook: { n: 3, name: 'Sharon Keller', login: 'sharonkeller@growthcake.co' },
    linkedin: { n: 2, name: 'Maria Lopez', login: 'renusepropertyrentals@gmail.com' },
    x: { n: 2, handle: 'GrowthMistakes', login: 'pratik@pratikrenuse.com' },
  },
  sv: {
    instagram: { n: 4, handle: 'maria.lopez.ispanien', login: 'ibexwatch@gmail.com' },
    facebook: { n: 4, name: 'Maria Lopez', login: 'hello@joinnest.io' },
    linkedin: { n: 3, name: 'Maria Lopez', login: 'vitpune1993@gmail.com' },
    x: { n: 3, handle: 'marialopezspain', login: 'maria.buenoteam@gmail.com' },
  },
  da: {
    instagram: { n: 1, handle: 'maria.lopez.spanien', login: 'phone 8767982710', note: 'Until it is renamed it still shows as hindi.quotes.illustrations.' },
    facebook: { n: 2, name: 'Sharon Smith', login: 'sharonsmith5@growthcake.co' },
    linkedin: { n: 4, name: 'Maria Lopez', login: 'joinnestio@gmail.com' },
    x: { n: 4, handle: 'lopezmariaspain', login: 'pratikadsrenuse@gmail.com' },
  },
  de: {
    instagram: { n: 7, handle: 'maria.lopez.inspanien', login: 'pratik@pratikrenuse.com' },
    facebook: { n: 5, name: 'Maria Lopez', login: 'hey@talktous.world' },
    linkedin: { n: 5, name: 'Maria Lopez', login: 'enetordigital@gmail.com' },
    x: { n: 5, handle: 'marialopezsp', login: 'enetordigital@gmail.com' },
  },
  fr: {
    instagram: { n: 6, handle: 'maria.lopez.espange', login: 'gmp.digimarketing@gmail.com' },
    facebook: { n: 7, name: 'Maria Lopez', login: 'pratik.be.cc@gmail.com' },
    linkedin: { n: 6, name: 'Maria Lopez', login: 'maria.buenoteam@gmail.com' },
    x: { n: 6, handle: 'lopezmariasp', login: 'joinnestio@gmail.com' },
  },
  nl: {
    instagram: { n: 5, handle: 'maria.lopez.inspanje', login: 'social@pratikrenuse.com' },
    facebook: { n: 6, name: 'Maria Lopez', login: 'social@pratikrenuse.com' },
    linkedin: { n: 7, name: 'Maria Lopez', login: 'pratik.secure.renuse@gmail.com' },
    x: { n: 7, handle: 'gmp06727323', login: 'gmp.digimarketing@gmail.com' },
  },
};
export const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', how: 'Post the video as a Reel, with the caption.' },
  { key: 'facebook', label: 'Facebook', how: 'Post the video as a Reel on the profile, with the caption.' },
  { key: 'linkedin', label: 'LinkedIn', how: 'Post the video with the caption.' },
  { key: 'x', label: 'X', how: 'Post the video with the short text.' },
];

export const HASHTAGS = {
  en: '#spain #expatlife #propertyinspain',
  no: '#spania #livetispania #boligispania',
  sv: '#spanien #livetispanien #bostadispanien',
  da: '#spanien #livetispanien #boligispanien',
  de: '#spanien #lebeninspanien #immobilienspanien',
  fr: '#espagne #vieenespagne #immobilierespagne',
  nl: '#spanje #woneninspanje #vastgoedspanje',
};

// Every fact below comes from api/_reels_facts.js (checked for the LinkedIn programme) or from
// the WhatsApp channel posts checked on 1 November 2026. `facts` names which.
// overlay: the three lines on screen, each a complete sentence. caption: the post text.
export const PROFILE_POSTS = [
  {
    key: 'foreign-buyers-record', audience: 'owners and buyers', facts: ['idealista 2026-11-10', 'idealista 2026-11-06', 'nontax_proposal', 'nota_simple', 'community_debt', 'itp_rates'],
    overlay: {
      en: ['Okay, this one honestly surprised me.', 'Spaniards are buying fewer homes, but foreigners are buying more than ever.', 'We bought 16% of every home sold last quarter.'],
      no: ['Ok, denne overrasket meg ærlig talt.', 'Spanjolene kjøper færre boliger, men utlendinger kjøper mer enn noen gang.', 'Vi kjøpte 16 % av alle boliger som ble solgt sist kvartal.'],
      sv: ['Okej, den här överraskade mig faktiskt.', 'Spanjorerna köper färre bostäder, men utlänningar köper mer än någonsin.', 'Vi köpte 16 % av alla bostäder som såldes förra kvartalet.'],
      da: ['Okay, den her overraskede mig ærligt talt.', 'Spanierne køber færre boliger, men udlændinge køber mere end nogensinde.', 'Vi købte 16 % af alle boliger, der blev solgt sidste kvartal.'],
      de: ['Okay, das hat mich ehrlich überrascht.', 'Die Spanier kaufen weniger Wohnungen, aber Ausländer kaufen mehr denn je.', 'Wir haben letztes Quartal 16 % aller Wohnungen gekauft.'],
      fr: ['Bon, celle-là m\'a vraiment surprise.', 'Les Espagnols achètent moins de logements, mais les étrangers en achètent plus que jamais.', 'Nous avons acheté 16 % des logements vendus le trimestre dernier.'],
      nl: ['Oké, deze verraste me echt.', 'Spanjaarden kopen minder woningen, maar buitenlanders kopen er meer dan ooit.', 'Wij kochten vorig kwartaal 16% van alle verkochte woningen.'],
    },
    caption: {
      en: `Okay, this one honestly surprised me.

Home sales in Spain fell 5.9% last quarter. Foreign buyers went the other way: up 11.2%, more than 26,300 homes, 16% of everything sold. That's the highest share the property registrars have ever recorded. The British, the Moroccans and the Dutch bought the most.

What it means for you and me:

1. We're not a side story anymore. When one in six homes goes to a foreigner, politicians notice. That's why you keep hearing about a tax of up to 100% on non-EU buyers. It has never become law, but it shows which way the wind can blow.

2. Sellers know we're coming. On the coast, a lot of asking prices are set with a foreign buyer in mind. Prices are up 37% since 2018 according to Spain's notaries, so don't treat the first number as the real one.

3. Do your homework like a local would:
Ask for a Nota Simple from the Land Registry. It costs 9.02 euros plus VAT and shows the owner and any mortgage on the home.
Check the community fees. A seller's unpaid fees can stay with the flat for this year and the three years before it.
Know the purchase tax: 6% in Madrid, 7% in Andalusia, 7.75% in Murcia and 9% in the Valencia region, up to one million euros.

Locals do all this without thinking. A lot of us skip it because we've fallen in love with the view.

Did you buy here recently, or are you still looking?`,
      no: `Ok, denne overrasket meg ærlig talt.

Boligsalget i Spania falt med 5,9 % sist kvartal. Utenlandske kjøpere gikk motsatt vei: opp 11,2 %, over 26 300 boliger, 16 % av alt som ble solgt. Det er den høyeste andelen tinglysingen noen gang har registrert. Britene, marokkanerne og nederlenderne kjøpte mest.

Hva betyr det for deg og meg?

1. Vi er ikke en bisak lenger. Når hver sjette bolig går til en utlending, legger politikerne merke til det. Derfor hører du stadig om en skatt på opptil 100 % for kjøpere utenfor EU. Den har aldri blitt lov, men den viser hvilken vei vinden kan blåse.

2. Selgerne vet at vi kommer. Langs kysten er mange prisantydninger satt med en utenlandsk kjøper i tankene. Prisene har steget 37 % siden 2018 ifølge de spanske notarene, så ikke ta det første tallet for god fisk.

3. Gjør leksene dine som en lokal:
Be om en Nota Simple fra tinglysingsregisteret. Den koster 9,02 euro pluss moms og viser eieren og eventuelle lån på boligen.
Sjekk fellesutgiftene. Selgerens ubetalte fellesutgifter kan følge leiligheten for i år og de tre årene før.
Kjenn kjøpsskatten: 6 % i Madrid, 7 % i Andalucía, 7,75 % i Murcia og 9 % i Valencia-regionen, opptil én million euro.

De lokale gjør alt dette uten å tenke over det. Mange av oss hopper over det fordi vi har forelsket oss i utsikten.

Har du kjøpt her nylig, eller leter du fortsatt?`,
      sv: `Okej, den här överraskade mig faktiskt.

Bostadsförsäljningen i Spanien föll med 5,9 % förra kvartalet. Utländska köpare gick åt andra hållet: upp 11,2 %, över 26 300 bostäder, 16 % av allt som såldes. Det är den högsta andelen fastighetsregistret någonsin har noterat. Britter, marockaner och holländare köpte mest.

Vad betyder det för dig och mig?

1. Vi är inte en bisak längre. När var sjätte bostad går till en utlänning märker politikerna det. Det är därför du hela tiden hör om en skatt på upp till 100 % för köpare utanför EU. Den har aldrig blivit lag, men den visar åt vilket håll vinden kan blåsa.

2. Säljarna vet att vi kommer. Längs kusten sätts många utgångspriser med en utländsk köpare i tankarna. Priserna har stigit 37 % sedan 2018 enligt de spanska notarierna, så ta inte första siffran som den riktiga.

3. Gör hemläxan som en lokal:
Be om en Nota Simple från fastighetsregistret. Den kostar 9,02 euro plus moms och visar ägaren och eventuella lån på bostaden.
Kolla avgifterna till föreningen. Säljarens obetalda avgifter kan följa med lägenheten för i år och de tre åren innan.
Känn till köpskatten: 6 % i Madrid, 7 % i Andalusien, 7,75 % i Murcia och 9 % i Valenciaregionen, upp till en miljon euro.

Lokalbefolkningen gör allt det här utan att tänka. Många av oss hoppar över det för att vi har blivit kära i utsikten.

Har du köpt här nyligen, eller letar du fortfarande?`,
      da: `Okay, den her overraskede mig ærligt talt.

Boligsalget i Spanien faldt med 5,9 % sidste kvartal. Udenlandske købere gik den modsatte vej: op 11,2 %, over 26.300 boliger, 16 % af alt, der blev solgt. Det er den højeste andel, tingbogen nogensinde har registreret. Briterne, marokkanerne og hollænderne købte mest.

Hvad betyder det for dig og mig?

1. Vi er ikke en sidehistorie længere. Når hver sjette bolig går til en udlænding, lægger politikerne mærke til det. Derfor hører du hele tiden om en skat på op til 100 % for købere uden for EU. Den er aldrig blevet lov, men den viser, hvilken vej vinden kan blæse.

2. Sælgerne ved, at vi kommer. Langs kysten er mange udbudspriser sat med en udenlandsk køber i tankerne. Priserne er steget 37 % siden 2018 ifølge de spanske notarer, så tag ikke det første tal som det rigtige.

3. Lav dit hjemmearbejde som en lokal:
Bed om en Nota Simple fra tingbogen. Den koster 9,02 euro plus moms og viser ejeren og eventuelle lån i boligen.
Tjek fællesudgifterne. Sælgerens ubetalte fællesudgifter kan følge med lejligheden for i år og de tre år før.
Kend købsskatten: 6 % i Madrid, 7 % i Andalusien, 7,75 % i Murcia og 9 % i Valencia-regionen, op til en million euro.

De lokale gør alt det her uden at tænke over det. Mange af os springer det over, fordi vi er blevet forelsket i udsigten.

Har du købt her for nylig, eller leder du stadig?`,
      de: `Okay, das hat mich ehrlich überrascht.

Die Immobilienverkäufe in Spanien sind letztes Quartal um 5,9 % gefallen. Ausländische Käufer sind in die andere Richtung gegangen: plus 11,2 %, über 26.300 Wohnungen, 16 % von allem, was verkauft wurde. Das ist der höchste Anteil, den die Grundbuchämter je erfasst haben. Briten, Marokkaner und Niederländer haben am meisten gekauft.

Was heißt das für dich und mich?

1. Wir sind keine Randnotiz mehr. Wenn jede sechste Wohnung an Ausländer geht, merkt das die Politik. Deshalb hörst du ständig von einer Steuer von bis zu 100 % für Käufer außerhalb der EU. Sie ist nie Gesetz geworden, aber sie zeigt, woher der Wind wehen kann.

2. Die Verkäufer wissen, dass wir kommen. An der Küste werden viele Angebotspreise mit einem ausländischen Käufer im Kopf gemacht. Laut den spanischen Notaren sind die Preise seit 2018 um 37 % gestiegen, also nimm die erste Zahl nicht als die echte.

3. Mach deine Hausaufgaben wie ein Einheimischer:
Hol dir eine Nota Simple vom Grundbuchamt. Sie kostet 9,02 Euro plus Mehrwertsteuer und zeigt den Eigentümer und eingetragene Hypotheken.
Prüf die Gemeinschaftskosten. Offene Beiträge des Verkäufers können für dieses Jahr und die drei Jahre davor an der Wohnung hängen.
Kenn die Grunderwerbsteuer: 6 % in Madrid, 7 % in Andalusien, 7,75 % in Murcia und 9 % in der Region Valencia, bis zu einer Million Euro.

Einheimische machen das alles ganz automatisch. Viele von uns lassen es aus, weil wir uns in die Aussicht verliebt haben.

Hast du hier vor Kurzem gekauft, oder suchst du noch?`,
      fr: `Bon, celle-là m'a vraiment surprise.

Les ventes de logements en Espagne ont baissé de 5,9 % le trimestre dernier. Les acheteurs étrangers, eux, sont allés dans l'autre sens : plus 11,2 %, plus de 26 300 logements, 16 % de toutes les ventes. C'est la part la plus élevée jamais enregistrée par les registres fonciers. Les Britanniques, les Marocains et les Néerlandais ont le plus acheté.

Ce que ça veut dire pour vous et moi :

1. Nous ne sommes plus un détail. Quand un logement sur six part à un étranger, les politiques le remarquent. C'est pour ça que vous entendez parler d'une taxe allant jusqu'à 100 % pour les acheteurs hors UE. Elle n'a jamais été adoptée, mais elle montre d'où le vent peut tourner.

2. Les vendeurs savent que nous arrivons. Sur la côte, beaucoup de prix affichés sont fixés en pensant à un acheteur étranger. Selon les notaires espagnols, les prix ont augmenté de 37 % depuis 2018, alors ne prenez pas le premier chiffre pour le vrai.

3. Faites vos devoirs comme un local :
Demandez une Nota Simple au registre foncier. Elle coûte 9,02 euros plus TVA et indique le propriétaire et les hypothèques éventuelles.
Vérifiez les charges de copropriété. Les impayés du vendeur peuvent rester attachés à l'appartement pour cette année et les trois années précédentes.
Connaissez la taxe d'achat : 6 % à Madrid, 7 % en Andalousie, 7,75 % à Murcie et 9 % dans la région de Valence, jusqu'à un million d'euros.

Les locaux font tout ça sans y penser. Beaucoup d'entre nous sautent cette étape parce qu'on est tombés amoureux de la vue.

Vous avez acheté ici récemment, ou vous cherchez encore ?`,
      nl: `Oké, deze verraste me echt.

De woningverkopen in Spanje daalden vorig kwartaal met 5,9%. Buitenlandse kopers gingen de andere kant op: plus 11,2%, ruim 26.300 woningen, 16% van alles wat verkocht werd. Dat is het hoogste aandeel dat het kadaster ooit heeft gemeten. Britten, Marokkanen en Nederlanders kochten het meest.

Wat betekent dat voor jou en mij?

1. We zijn geen bijzaak meer. Als een op de zes woningen naar een buitenlander gaat, merkt de politiek dat. Daarom hoor je steeds over een belasting van tot 100% voor kopers van buiten de EU. Die is nooit wet geworden, maar het laat zien uit welke hoek de wind kan waaien.

2. Verkopers weten dat we komen. Aan de kust worden veel vraagprijzen bepaald met een buitenlandse koper in gedachten. Volgens de Spaanse notarissen zijn de prijzen sinds 2018 met 37% gestegen, dus zie het eerste getal niet als het echte.

3. Doe je huiswerk zoals een local:
Vraag een Nota Simple op bij het eigendomsregister. Die kost 9,02 euro plus btw en laat de eigenaar en eventuele hypotheken zien.
Check de servicekosten. Onbetaalde kosten van de verkoper kunnen aan het appartement blijven hangen, voor dit jaar en de drie jaren daarvoor.
Ken de overdrachtsbelasting: 6% in Madrid, 7% in Andalusië, 7,75% in Murcia en 9% in de regio Valencia, tot een miljoen euro.

Locals doen dit allemaal zonder erbij na te denken. Veel van ons slaan het over omdat we verliefd zijn geworden op het uitzicht.

Heb jij hier onlangs gekocht, of ben je nog aan het zoeken?`,
    },
  },
  {
    key: 'prices-record-sales-falling', audience: 'owners and buyers', facts: ['idealista 2026-11-17', 'idealista 2026-11-04', 'idealista 2026-11-10', 'valor_ref'],
    overlay: {
      en: ['Everyone keeps asking me if prices are about to drop.', 'Sales just had their biggest fall in over two years.', 'Prices hit a record anyway.'],
      no: ['Alle spør meg om prisene snart skal falle.', 'Salget har nettopp hatt sitt største fall på over to år.', 'Prisene satte rekord likevel.'],
      sv: ['Alla frågar mig om priserna snart ska sjunka.', 'Försäljningen har just haft sitt största ras på över två år.', 'Priserna slog rekord ändå.'],
      da: ['Alle spørger mig, om priserne snart falder.', 'Salget har lige haft sit største fald i over to år.', 'Priserne satte rekord alligevel.'],
      de: ['Alle fragen mich, ob die Preise bald fallen.', 'Die Verkäufe hatten gerade den größten Einbruch seit über zwei Jahren.', 'Die Preise haben trotzdem einen Rekord erreicht.'],
      fr: ['Tout le monde me demande si les prix vont baisser.', 'Les ventes viennent de connaître leur plus forte chute depuis plus de deux ans.', 'Les prix ont quand même battu un record.'],
      nl: ['Iedereen vraagt me of de prijzen gaan dalen.', 'De verkopen hadden net hun grootste daling in ruim twee jaar.', 'De prijzen braken toch een record.'],
    },
    caption: {
      en: `Everyone keeps asking me the same thing: should I wait, are prices about to drop?

Here's what the numbers say right now.

In September, home sales in Spain fell 13.4% compared with a year earlier. That's the biggest drop since May 2024. The Basque Country, the Balearics and Madrid all fell more than 20%. Navarra was the only region that didn't fall.

And yet in October, used homes hit a record 2,955 euros per square metre on average, up 11.2% in a year. Madrid, Barcelona, Palma and Málaga are all above 3,000, and Madrid and Barcelona average more than 5,000.

How can both be true? Fewer homes are changing hands, but there still aren't enough of them. Fewer sales doesn't mean cheaper homes. It means fewer people can afford them. Buying now takes around 38% of a household's income.

What the experts expect:
Spain's property valuers don't see prices settling before 2028.
A University of Barcelona study expects sales to fall about 8% in 2027, with price growth slowing to under 5% by the end of 2027. Slowing, not falling.

My honest take:
If you're waiting for a crash, the data isn't on your side.
If you're selling, you're still in a strong position.
If you're buying, negotiate on the details: the condition, the timing, what's included.
And remember the purchase tax is based on the Catastro reference value, so it can be higher than the price you paid suggests.

Would you buy now or wait it out?`,
      no: `Alle spør meg om det samme: bør jeg vente, skal prisene falle snart?

Her er hva tallene sier akkurat nå.

I september falt boligsalget i Spania med 13,4 % sammenlignet med året før. Det er det største fallet siden mai 2024. Baskerland, Balearene og Madrid falt alle med over 20 %. Navarra var den eneste regionen som ikke falt.

Likevel nådde brukte boliger i oktober en rekord på 2 955 euro per kvadratmeter i snitt, opp 11,2 % på et år. Madrid, Barcelona, Palma og Málaga ligger alle over 3 000, og Madrid og Barcelona ligger i snitt over 5 000.

Hvordan kan begge deler stemme? Færre boliger skifter eier, men det er fortsatt ikke nok av dem. Færre salg betyr ikke billigere boliger. Det betyr at færre har råd. Å kjøpe nå tar rundt 38 % av en husholdnings inntekt.

Hva ekspertene venter:
De spanske takstmennene ser ikke at prisene roer seg før 2028.
En studie fra Universitetet i Barcelona venter at salget faller rundt 8 % i 2027, og at prisveksten bremser til under 5 % innen slutten av 2027. Bremser, ikke faller.

Min ærlige mening:
Venter du på et krakk, er ikke tallene på din side.
Selger du, står du fortsatt sterkt.
Kjøper du, forhandle om detaljene: standen, tidspunktet, hva som følger med.
Og husk at kjøpsskatten regnes ut fra Catastros referanseverdi, så den kan bli høyere enn prisen du betalte tilsier.

Ville du kjøpt nå eller ventet?`,
      sv: `Alla frågar mig samma sak: ska jag vänta, ska priserna sjunka snart?

Så här ser siffrorna ut just nu.

I september föll bostadsförsäljningen i Spanien med 13,4 % jämfört med året innan. Det är det största raset sedan maj 2024. Baskien, Balearerna och Madrid föll alla med över 20 %. Navarra var den enda regionen som inte föll.

Ändå nådde begagnade bostäder i oktober ett rekord på 2 955 euro per kvadratmeter i snitt, upp 11,2 % på ett år. Madrid, Barcelona, Palma och Málaga ligger alla över 3 000, och Madrid och Barcelona ligger i snitt över 5 000.

Hur kan båda stämma? Färre bostäder byter ägare, men det finns fortfarande inte tillräckligt många. Färre affärer betyder inte billigare bostäder. Det betyder att färre har råd. Att köpa nu tar runt 38 % av ett hushålls inkomst.

Vad experterna väntar sig:
De spanska värderarna ser inte att priserna lugnar sig före 2028.
En studie från Barcelonas universitet räknar med att försäljningen faller runt 8 % 2027, och att prisökningen bromsar till under 5 % i slutet av 2027. Bromsar, inte faller.

Min ärliga tanke:
Väntar du på en krasch är siffrorna inte på din sida.
Säljer du står du fortfarande starkt.
Köper du, förhandla om detaljerna: skicket, tidpunkten, vad som ingår.
Och kom ihåg att köpskatten räknas på Catastros referensvärde, så den kan bli högre än priset du betalade antyder.

Skulle du köpa nu eller vänta?`,
      da: `Alle spørger mig om det samme: skal jeg vente, falder priserne snart?

Her er, hvad tallene siger lige nu.

I september faldt boligsalget i Spanien med 13,4 % i forhold til året før. Det er det største fald siden maj 2024. Baskerlandet, De Baleariske Øer og Madrid faldt alle med over 20 %. Navarra var den eneste region, der ikke faldt.

Alligevel nåede brugte boliger i oktober en rekord på 2.955 euro pr. kvadratmeter i gennemsnit, op 11,2 % på et år. Madrid, Barcelona, Palma og Málaga ligger alle over 3.000, og Madrid og Barcelona ligger i gennemsnit over 5.000.

Hvordan kan begge dele passe? Færre boliger skifter ejer, men der er stadig ikke nok af dem. Færre handler betyder ikke billigere boliger. Det betyder, at færre har råd. At købe nu tager omkring 38 % af en husstands indkomst.

Hvad eksperterne forventer:
De spanske vurderingsfolk ser ikke priserne falde til ro før 2028.
En undersøgelse fra Barcelonas universitet forventer, at salget falder omkring 8 % i 2027, og at prisstigningerne bremser op til under 5 % ved udgangen af 2027. Bremser op, falder ikke.

Min ærlige vurdering:
Venter du på et krak, er tallene ikke på din side.
Sælger du, står du stadig stærkt.
Køber du, så forhandl om detaljerne: standen, tidspunktet, hvad der følger med.
Og husk, at købsskatten beregnes ud fra Catastros referenceværdi, så den kan blive højere, end prisen du betalte, antyder.

Ville du købe nu eller vente?`,
      de: `Alle fragen mich dasselbe: Soll ich warten, fallen die Preise bald?

Hier ist, was die Zahlen gerade sagen.

Im September sind die Immobilienverkäufe in Spanien um 13,4 % gegenüber dem Vorjahr gefallen. Das ist der größte Rückgang seit Mai 2024. Das Baskenland, die Balearen und Madrid sind alle um mehr als 20 % gefallen. Navarra war die einzige Region ohne Rückgang.

Und trotzdem haben gebrauchte Wohnungen im Oktober einen Rekord von durchschnittlich 2.955 Euro pro Quadratmeter erreicht, plus 11,2 % in einem Jahr. Madrid, Barcelona, Palma und Málaga liegen alle über 3.000, Madrid und Barcelona im Schnitt über 5.000.

Wie passt das zusammen? Es wechseln weniger Wohnungen den Besitzer, aber es gibt immer noch nicht genug. Weniger Verkäufe heißt nicht billigere Wohnungen. Es heißt, dass sich weniger Leute eine leisten können. Ein Kauf kostet gerade rund 38 % des Haushaltseinkommens.

Was die Experten erwarten:
Die spanischen Gutachter sehen keine Beruhigung der Preise vor 2028.
Eine Studie der Universität Barcelona erwartet, dass die Verkäufe 2027 um etwa 8 % sinken und das Preiswachstum bis Ende 2027 auf unter 5 % abbremst. Abbremsen, nicht fallen.

Meine ehrliche Meinung:
Wenn du auf einen Crash wartest, sind die Zahlen nicht auf deiner Seite.
Wenn du verkaufst, bist du immer noch in einer starken Position.
Wenn du kaufst, verhandle über die Details: Zustand, Zeitpunkt, was dabei ist.
Und denk daran, dass die Grunderwerbsteuer auf dem Referenzwert des Katasters beruht, also höher sein kann, als dein Kaufpreis vermuten lässt.

Würdest du jetzt kaufen oder abwarten?`,
      fr: `Tout le monde me pose la même question : est-ce que je dois attendre, est-ce que les prix vont baisser ?

Voici ce que disent les chiffres en ce moment.

En septembre, les ventes de logements en Espagne ont baissé de 13,4 % sur un an. C'est la plus forte baisse depuis mai 2024. Le Pays basque, les Baléares et Madrid ont tous chuté de plus de 20 %. La Navarre est la seule région qui n'a pas baissé.

Et pourtant, en octobre, les logements anciens ont atteint un record de 2 955 euros le mètre carré en moyenne, plus 11,2 % en un an. Madrid, Barcelone, Palma et Malaga sont toutes au-dessus de 3 000, et Madrid et Barcelone dépassent les 5 000 en moyenne.

Comment les deux peuvent être vrais ? Moins de logements changent de mains, mais il n'y en a toujours pas assez. Moins de ventes ne veut pas dire des logements moins chers. Ça veut dire que moins de gens peuvent se les offrir. Acheter aujourd'hui demande environ 38 % des revenus d'un ménage.

Ce qu'attendent les experts :
Les experts en évaluation espagnols ne voient pas les prix se calmer avant 2028.
Une étude de l'Université de Barcelone prévoit une baisse des ventes d'environ 8 % en 2027, et une hausse des prix qui ralentit sous les 5 % d'ici fin 2027. Ralentit, ne baisse pas.

Mon avis honnête :
Si vous attendez un krach, les chiffres ne sont pas de votre côté.
Si vous vendez, vous êtes toujours en position de force.
Si vous achetez, négociez sur les détails : l'état, le calendrier, ce qui est inclus.
Et n'oubliez pas que la taxe d'achat se calcule sur la valeur de référence du Catastro, elle peut donc être plus élevée que ce que suggère le prix payé.

Vous achèteriez maintenant ou vous attendriez ?`,
      nl: `Iedereen vraagt me hetzelfde: moet ik wachten, gaan de prijzen dalen?

Dit zeggen de cijfers op dit moment.

In september daalden de woningverkopen in Spanje met 13,4% ten opzichte van een jaar eerder. Dat is de grootste daling sinds mei 2024. Baskenland, de Balearen en Madrid daalden allemaal met meer dan 20%. Navarra was de enige regio zonder daling.

En toch bereikten bestaande woningen in oktober een record van gemiddeld 2.955 euro per vierkante meter, 11,2% meer dan een jaar eerder. Madrid, Barcelona, Palma en Málaga zitten allemaal boven de 3.000, en Madrid en Barcelona gemiddeld boven de 5.000.

Hoe kan allebei kloppen? Er wisselen minder woningen van eigenaar, maar er zijn er nog steeds te weinig. Minder verkopen betekent niet goedkopere woningen. Het betekent dat minder mensen het kunnen betalen. Een woning kopen kost nu zo'n 38% van het inkomen van een huishouden.

Wat de experts verwachten:
De Spaanse taxateurs zien de prijzen niet tot rust komen vóór 2028.
Een studie van de Universiteit van Barcelona verwacht dat de verkopen in 2027 met zo'n 8% dalen, en dat de prijsstijging eind 2027 afremt tot onder de 5%. Afremmen, niet dalen.

Mijn eerlijke mening:
Wacht je op een crash, dan staan de cijfers niet aan jouw kant.
Verkoop je, dan sta je nog steeds sterk.
Koop je, onderhandel dan over de details: de staat, het moment, wat erbij zit.
En onthoud dat de overdrachtsbelasting wordt berekend op de referentiewaarde van het Catastro, dus die kan hoger uitvallen dan je aankoopprijs doet vermoeden.

Zou jij nu kopen of wachten?`,
    },
  },
  {
    key: 'rentals-vanished', audience: 'owners who let', facts: ['idealista 2026-11-05', 'idealista 2026-11-13', 'idealista 2026-11-06', 'idealista 2026-11-16', 'nr_rates', 'rent_annual', 'epc'],
    overlay: {
      en: ['26,531 rental homes disappeared in one month.', 'And that is from just one website.', 'If you rent out your home in Spain, read this.'],
      no: ['26 531 utleieboliger forsvant på én måned.', 'Og det er bare fra ett nettsted.', 'Leier du ut boligen din i Spania, les dette.'],
      sv: ['26 531 hyresbostäder försvann på en månad.', 'Och det är bara från en enda sajt.', 'Hyr du ut din bostad i Spanien, läs det här.'],
      da: ['26.531 lejeboliger forsvandt på én måned.', 'Og det er kun fra én hjemmeside.', 'Lejer du din bolig ud i Spanien, så læs det her.'],
      de: ['26.531 Mietwohnungen sind in einem Monat verschwunden.', 'Und das nur auf einer einzigen Website.', 'Wenn du deine Wohnung in Spanien vermietest, lies das.'],
      fr: ['26 531 locations ont disparu en un mois.', 'Et ce n\'est que sur un seul site.', 'Si vous louez votre logement en Espagne, lisez ceci.'],
      nl: ['26.531 huurwoningen verdwenen in één maand.', 'En dat is maar van één website.', 'Verhuur je je woning in Spanje, lees dit dan.'],
    },
    caption: {
      en: `26,531 rental homes disappeared from idealista in a single month.

That's 19% of its rental listings, gone, after the government's new housing decrees.

What actually happened: the government tightened the rules on renting. One decree was confirmed by parliament by 35 votes to 34. It's mainly about rentals and includes tax incentives for small landlords. The other one, which would have made rental contracts indefinite, was rejected by exactly the same margin. That one is not law.

Owners reacted the way owners always react when rules get stricter. Some took their homes off the market. The estate agents' federation expects 25 to 30% fewer rental deals in the coming months.

Meanwhile rents keep climbing:
15.1 euros per square metre on average in October, up 5.6% in a year.
Madrid is the most expensive city at 23.4 euros.
In San Sebastián 37% of homes were let within 24 hours. In Barcelona, 35%.

If you rent out your home and live abroad, three things to know:
You pay 19% tax on rental income if you live in the EU, Iceland or Norway, and 24% if you live anywhere else, including the UK.
From 2026 income onwards you declare it once a year, between 1 and 20 April of the following year.
You need an energy certificate, and its rating has to be in every advert.

Less supply usually means the owners who stay do better. Just make sure you're doing it by the book.

Do you rent out your home in Spain? Has anything changed for you?`,
      no: `26 531 utleieboliger forsvant fra idealista på én eneste måned.

Det er 19 % av utleieannonsene, borte, etter regjeringens nye boligforordninger.

Hva som faktisk skjedde: regjeringen strammet inn reglene for utleie. Én forordning ble bekreftet av parlamentet med 35 mot 34 stemmer. Den handler mest om utleie og har skattefordeler for små utleiere. Den andre, som ville gjort leiekontrakter tidsubegrensede, ble stemt ned med nøyaktig samme margin. Den er ikke lov.

Eierne reagerte slik eiere alltid gjør når reglene blir strengere. Noen tok boligen av markedet. Meglernes forbund venter 25 til 30 % færre leieavtaler de neste månedene.

Imens fortsetter leiene å stige:
15,1 euro per kvadratmeter i snitt i oktober, opp 5,6 % på et år.
Madrid er dyrest med 23,4 euro.
I San Sebastián ble 37 % av boligene leid ut innen 24 timer. I Barcelona 35 %.

Leier du ut boligen og bor i utlandet, er det tre ting du bør vite:
Du betaler 19 % skatt på leieinntekten hvis du bor i EU, Island eller Norge, og 24 % hvis du bor et annet sted, også i Storbritannia.
Fra inntektsåret 2026 oppgir du den én gang i året, mellom 1. og 20. april året etter.
Du trenger en energiattest, og karakteren skal stå i hver annonse.

Mindre tilbud betyr som regel at eierne som blir, gjør det bedre. Bare sørg for at alt er i orden.

Leier du ut boligen din i Spania? Har noe endret seg for deg?`,
      sv: `26 531 hyresbostäder försvann från idealista på en enda månad.

Det är 19 % av hyresannonserna, borta, efter regeringens nya bostadsförordningar.

Vad som faktiskt hände: regeringen skärpte reglerna för uthyrning. En förordning godkändes av parlamentet med 35 röster mot 34. Den handlar mest om uthyrning och innehåller skattelättnader för små hyresvärdar. Den andra, som skulle ha gjort hyreskontrakt tillsvidare, röstades ner med exakt samma marginal. Den är inte lag.

Ägarna reagerade som ägare alltid gör när reglerna blir hårdare. Vissa tog bort sina bostäder från marknaden. Mäklarnas förbund räknar med 25 till 30 % färre hyresaffärer de kommande månaderna.

Samtidigt fortsätter hyrorna att stiga:
15,1 euro per kvadratmeter i snitt i oktober, upp 5,6 % på ett år.
Madrid är dyrast med 23,4 euro.
I San Sebastián hyrdes 37 % av bostäderna ut inom 24 timmar. I Barcelona 35 %.

Hyr du ut din bostad och bor utomlands, finns det tre saker att veta:
Du betalar 19 % skatt på hyresintäkten om du bor i EU, Island eller Norge, och 24 % om du bor någon annanstans, även i Storbritannien.
Från inkomståret 2026 deklarerar du den en gång om året, mellan 1 och 20 april året efter.
Du behöver en energideklaration, och klassningen ska stå i varje annons.

Mindre utbud brukar betyda att ägarna som stannar kvar klarar sig bättre. Se bara till att allt är rätt gjort.

Hyr du ut din bostad i Spanien? Har något förändrats för dig?`,
      da: `26.531 lejeboliger forsvandt fra idealista på én enkelt måned.

Det er 19 % af lejeannoncerne, væk, efter regeringens nye boligdekreter.

Hvad der faktisk skete: regeringen strammede reglerne for udlejning. Ét dekret blev bekræftet af parlamentet med 35 stemmer mod 34. Det handler mest om udlejning og indeholder skattefordele for små udlejere. Det andet, som ville have gjort lejekontrakter tidsubegrænsede, blev stemt ned med nøjagtig samme margin. Det er ikke lov.

Ejerne reagerede, som ejere altid gør, når reglerne bliver strammere. Nogle tog deres bolig af markedet. Mæglernes forbund forventer 25 til 30 % færre lejeaftaler i de kommende måneder.

Imens bliver huslejerne ved med at stige:
15,1 euro pr. kvadratmeter i gennemsnit i oktober, op 5,6 % på et år.
Madrid er dyrest med 23,4 euro.
I San Sebastián blev 37 % af boligerne lejet ud inden for 24 timer. I Barcelona 35 %.

Lejer du din bolig ud og bor i udlandet, er der tre ting, du skal vide:
Du betaler 19 % skat af lejeindtægten, hvis du bor i EU, Island eller Norge, og 24 %, hvis du bor et andet sted, også i Storbritannien.
Fra indkomståret 2026 oplyser du den én gang om året, mellem 1. og 20. april året efter.
Du skal have en energimærkning, og mærket skal stå i hver annonce.

Mindre udbud betyder som regel, at de ejere, der bliver, klarer sig bedre. Bare sørg for at gøre det efter reglerne.

Lejer du din bolig ud i Spanien? Har noget ændret sig for dig?`,
      de: `26.531 Mietwohnungen sind in einem einzigen Monat von idealista verschwunden.

Das sind 19 % der Mietanzeigen, einfach weg, nach den neuen Wohnungsdekreten der Regierung.

Was wirklich passiert ist: Die Regierung hat die Regeln fürs Vermieten verschärft. Ein Dekret wurde vom Parlament mit 35 zu 34 Stimmen bestätigt. Es geht vor allem um Vermietung und enthält Steuervorteile für kleine Vermieter. Das andere, das Mietverträge unbefristet gemacht hätte, wurde mit genau derselben Mehrheit abgelehnt. Das ist kein Gesetz.

Die Eigentümer haben reagiert, wie Eigentümer immer reagieren, wenn die Regeln strenger werden. Manche haben ihre Wohnung vom Markt genommen. Der Maklerverband erwartet in den kommenden Monaten 25 bis 30 % weniger Mietabschlüsse.

Die Mieten steigen derweil weiter:
15,1 Euro pro Quadratmeter im Schnitt im Oktober, plus 5,6 % in einem Jahr.
Madrid ist am teuersten mit 23,4 Euro.
In San Sebastián wurden 37 % der Wohnungen innerhalb von 24 Stunden vermietet. In Barcelona 35 %.

Wenn du deine Wohnung vermietest und im Ausland lebst, solltest du drei Dinge wissen:
Du zahlst 19 % Steuer auf die Mieteinnahmen, wenn du in der EU, Island oder Norwegen lebst, und 24 %, wenn du woanders lebst, auch in Großbritannien.
Ab den Einnahmen von 2026 erklärst du sie einmal im Jahr, zwischen dem 1. und 20. April des Folgejahres.
Du brauchst einen Energieausweis, und die Effizienzklasse muss in jeder Anzeige stehen.

Weniger Angebot heißt meistens, dass es den Eigentümern, die bleiben, besser geht. Mach es nur sauber und nach Vorschrift.

Vermietest du deine Wohnung in Spanien? Hat sich für dich etwas geändert?`,
      fr: `26 531 logements à louer ont disparu d'idealista en un seul mois.

C'est 19 % des annonces de location, envolées, après les nouveaux décrets logement du gouvernement.

Ce qui s'est vraiment passé : le gouvernement a durci les règles de la location. Un décret a été validé par le parlement par 35 voix contre 34. Il porte surtout sur la location et prévoit des avantages fiscaux pour les petits propriétaires. L'autre, qui aurait rendu les baux à durée indéterminée, a été rejeté exactement avec le même écart. Celui-là n'est pas une loi.

Les propriétaires ont réagi comme ils le font toujours quand les règles se durcissent. Certains ont retiré leur logement du marché. La fédération des agents immobiliers s'attend à 25 à 30 % de locations en moins dans les prochains mois.

Pendant ce temps, les loyers continuent de grimper :
15,1 euros le mètre carré en moyenne en octobre, plus 5,6 % en un an.
Madrid est la ville la plus chère avec 23,4 euros.
À Saint-Sébastien, 37 % des logements ont été loués en moins de 24 heures. À Barcelone, 35 %.

Si vous louez votre logement et vivez à l'étranger, trois choses à savoir :
Vous payez 19 % d'impôt sur les loyers si vous vivez dans l'UE, en Islande ou en Norvège, et 24 % si vous vivez ailleurs, Royaume-Uni compris.
À partir des revenus de 2026, vous les déclarez une fois par an, entre le 1er et le 20 avril de l'année suivante.
Il vous faut un certificat énergétique, et sa classe doit figurer dans chaque annonce.

Moins d'offre veut généralement dire que les propriétaires qui restent s'en sortent mieux. Faites simplement les choses dans les règles.

Vous louez votre logement en Espagne ? Quelque chose a changé pour vous ?`,
      nl: `26.531 huurwoningen verdwenen in één maand van idealista.

Dat is 19% van de huuradvertenties, weg, na de nieuwe woningdecreten van de regering.

Wat er echt gebeurde: de regering maakte de regels voor verhuur strenger. Eén decreet werd door het parlement bevestigd met 35 tegen 34 stemmen. Het gaat vooral over verhuur en bevat belastingvoordelen voor kleine verhuurders. Het andere, dat huurcontracten voor onbepaalde tijd zou maken, werd met precies dezelfde marge weggestemd. Dat is geen wet.

Eigenaren reageerden zoals eigenaren altijd doen als de regels strenger worden. Sommigen haalden hun woning van de markt. De makelaarsfederatie verwacht de komende maanden 25 tot 30% minder huurdeals.

Ondertussen blijven de huren stijgen:
15,1 euro per vierkante meter gemiddeld in oktober, 5,6% meer dan een jaar eerder.
Madrid is het duurst met 23,4 euro.
In San Sebastián werd 37% van de woningen binnen 24 uur verhuurd. In Barcelona 35%.

Verhuur je je woning en woon je in het buitenland, dan zijn er drie dingen om te weten:
Je betaalt 19% belasting over huurinkomsten als je in de EU, IJsland of Noorwegen woont, en 24% als je ergens anders woont, ook in het Verenigd Koninkrijk.
Vanaf de inkomsten over 2026 geef je ze één keer per jaar aan, tussen 1 en 20 april van het jaar daarna.
Je hebt een energielabel nodig, en het label moet in elke advertentie staan.

Minder aanbod betekent meestal dat de eigenaren die blijven het beter doen. Zorg er alleen voor dat je het netjes volgens de regels doet.

Verhuur jij je woning in Spanje? Is er voor jou iets veranderd?`,
    },
  },
  {
    key: 'agency-fee-court', audience: 'buyers, sellers and agents', facts: ['idealista 2026-11-05', 'arras', 'mortgage_10days', 'sale_3pct', 'plusvalia_buyer', 'cash_limit'],
    overlay: {
      en: ['An agency asked a couple for 9,000 euros in fees.', 'The sale never even happened.', 'A court said they do not have to pay a cent.'],
      no: ['Et byrå krevde 9 000 euro i honorar fra et par.', 'Salget ble aldri noe av.', 'En domstol sa at de ikke trenger å betale en krone.'],
      sv: ['En mäklarbyrå krävde ett par på 9 000 euro i arvode.', 'Affären blev aldrig av.', 'En domstol sa att de inte behöver betala ett öre.'],
      da: ['Et mæglerfirma krævede 9.000 euro i salær af et par.', 'Handlen blev aldrig til noget.', 'En domstol sagde, at de ikke skal betale en krone.'],
      de: ['Ein Makler wollte von einem Paar 9.000 Euro Provision.', 'Der Verkauf ist nie zustande gekommen.', 'Ein Gericht sagt, sie müssen keinen Cent zahlen.'],
      fr: ['Une agence a réclamé 9 000 euros de frais à un couple.', 'La vente n\'a même jamais eu lieu.', 'Un tribunal a dit qu\'ils ne doivent pas un centime.'],
      nl: ['Een makelaar vroeg een stel 9.000 euro aan courtage.', 'De verkoop is nooit doorgegaan.', 'Een rechter zegt dat ze geen cent hoeven te betalen.'],
    },
    caption: {
      en: `An estate agency asked a couple for more than 9,000 euros in fees. For a sale that never happened.

They refused. It went to court in Cáceres, and they won.

The court gave three reasons:
1. The agency couldn't prove the buyers had actually hired it.
2. The contract said the fee was only due once the sellers formally accepted the offer. They never did.
3. The agency hadn't given the information consumer rules require before you sign.

Before you sign anything with an agent in Spain, ask:
When exactly is the fee due?
Who pays it, the buyer or the seller?
What happens if the sale falls through?
If it isn't written down, ask for it in writing. A good agent won't mind.

A few more things that catch people out:
A deposit contract only lets you walk away losing the deposit, or the seller walk away paying back double, if the contract clearly says so.
If you're getting a mortgage, the lender has to give you the offer and the draft contract at least ten calendar days before you sign at the notary.
If the seller lives abroad, the buyer has to hold back 3% of the price for the tax office, and also pays the council's plusvalía tax on the seller's behalf.
Paying 1,000 euros or more in cash isn't allowed when one side is a business.

Agents, what do you always put in writing on day one?`,
      no: `Et eiendomsbyrå krevde over 9 000 euro i honorar fra et par. For et salg som aldri ble noe av.

De nektet. Saken havnet i retten i Cáceres, og de vant.

Retten ga tre grunner:
1. Byrået kunne ikke bevise at kjøperne faktisk hadde engasjert det.
2. Kontrakten sa at honoraret først skulle betales når selgerne formelt hadde godtatt budet. Det gjorde de aldri.
3. Byrået hadde ikke gitt informasjonen forbrukerreglene krever før du signerer.

Før du signerer noe med en megler i Spania, spør:
Når skal honoraret betales, helt konkret?
Hvem betaler, kjøper eller selger?
Hva skjer hvis salget ikke blir noe av?
Står det ikke skriftlig, be om å få det skriftlig. En god megler har ikke noe imot det.

Noen flere ting folk går i fella på:
En depositumskontrakt lar deg bare trekke deg ved å miste depositumet, eller selgeren trekke seg ved å betale tilbake det dobbelte, hvis kontrakten sier det tydelig.
Tar du opp boliglån, må banken gi deg tilbudet og utkastet til kontrakt minst ti kalenderdager før du signerer hos notarius.
Bor selgeren i utlandet, må kjøperen holde tilbake 3 % av prisen til skattekontoret, og betaler også kommunens plusvalía-skatt for selgeren.
Det er ikke lov å betale 1 000 euro eller mer i kontanter når den ene parten er en bedrift.

Meglere, hva skriver dere alltid ned første dag?`,
      sv: `En mäklarbyrå krävde ett par på över 9 000 euro i arvode. För en affär som aldrig blev av.

De vägrade. Det gick till domstol i Cáceres, och de vann.

Domstolen gav tre skäl:
1. Byrån kunde inte bevisa att köparna faktiskt hade anlitat den.
2. Avtalet sa att arvodet bara skulle betalas när säljarna formellt hade accepterat budet. Det gjorde de aldrig.
3. Byrån hade inte gett den information som konsumentreglerna kräver innan man skriver på.

Innan du skriver på något med en mäklare i Spanien, fråga:
När exakt ska arvodet betalas?
Vem betalar, köparen eller säljaren?
Vad händer om affären går i stöpet?
Står det inte på papper, be att få det skriftligt. En bra mäklare har inget emot det.

Några fler saker som folk går i fällan på:
Ett handpenningsavtal låter dig bara dra dig ur genom att förlora handpenningen, eller säljaren dra sig ur genom att betala tillbaka det dubbla, om avtalet tydligt säger det.
Tar du bolån måste banken ge dig erbjudandet och utkastet till avtal minst tio kalenderdagar innan du skriver på hos notarien.
Bor säljaren utomlands måste köparen hålla inne 3 % av priset till skattemyndigheten, och betalar även kommunens plusvalía-skatt åt säljaren.
Det är inte tillåtet att betala 1 000 euro eller mer kontant när ena parten är ett företag.

Mäklare, vad skriver ni alltid ner första dagen?`,
      da: `Et ejendomsmæglerfirma krævede over 9.000 euro i salær af et par. For en handel, der aldrig blev til noget.

De nægtede. Sagen kom for retten i Cáceres, og de vandt.

Retten gav tre grunde:
1. Firmaet kunne ikke bevise, at køberne faktisk havde hyret det.
2. Kontrakten sagde, at salæret først skulle betales, når sælgerne formelt havde accepteret buddet. Det gjorde de aldrig.
3. Firmaet havde ikke givet de oplysninger, som forbrugerreglerne kræver, før man skriver under.

Før du skriver under på noget med en mægler i Spanien, så spørg:
Hvornår skal salæret helt præcist betales?
Hvem betaler, køber eller sælger?
Hvad sker der, hvis handlen falder igennem?
Står det ikke på skrift, så bed om at få det skriftligt. En god mægler har ikke noget imod det.

Et par ting mere, folk falder i:
En depositumskontrakt lader dig kun træde tilbage ved at miste depositummet, eller sælgeren træde tilbage ved at betale det dobbelte tilbage, hvis kontrakten tydeligt siger det.
Tager du et boliglån, skal banken give dig tilbuddet og udkastet til kontrakten mindst ti kalenderdage, før du skriver under hos notaren.
Bor sælgeren i udlandet, skal køberen tilbageholde 3 % af prisen til skattevæsenet og betaler også kommunens plusvalía-skat på sælgerens vegne.
Det er ikke tilladt at betale 1.000 euro eller mere kontant, når den ene part er en virksomhed.

Mæglere, hvad skriver I altid ned på dag ét?`,
      de: `Ein Makler wollte von einem Paar über 9.000 Euro Provision. Für einen Verkauf, der nie stattgefunden hat.

Sie haben sich geweigert. Es ging vor Gericht in Cáceres, und sie haben gewonnen.

Das Gericht hat drei Gründe genannt:
1. Der Makler konnte nicht beweisen, dass die Käufer ihn überhaupt beauftragt hatten.
2. Laut Vertrag war die Provision erst fällig, wenn die Verkäufer das Angebot formell angenommen hatten. Das haben sie nie.
3. Der Makler hatte nicht die Informationen gegeben, die das Verbraucherrecht vor der Unterschrift verlangt.

Bevor du in Spanien irgendetwas mit einem Makler unterschreibst, frag:
Wann genau ist die Provision fällig?
Wer zahlt sie, Käufer oder Verkäufer?
Was passiert, wenn der Verkauf platzt?
Wenn es nicht schriftlich steht, lass es dir schriftlich geben. Ein guter Makler hat damit kein Problem.

Noch ein paar Dinge, über die viele stolpern:
Ein Anzahlungsvertrag erlaubt dir nur dann auszusteigen und die Anzahlung zu verlieren, oder dem Verkäufer auszusteigen und das Doppelte zurückzuzahlen, wenn das klar im Vertrag steht.
Wenn du eine Hypothek nimmst, muss die Bank dir das Angebot und den Vertragsentwurf mindestens zehn Kalendertage vor dem Notartermin geben.
Wenn der Verkäufer im Ausland lebt, muss der Käufer 3 % des Preises für das Finanzamt einbehalten und zahlt außerdem die Plusvalía der Gemeinde für den Verkäufer.
Barzahlungen von 1.000 Euro oder mehr sind nicht erlaubt, wenn eine Seite ein Unternehmen ist.

Liebe Makler, was haltet ihr am ersten Tag immer schriftlich fest?`,
      fr: `Une agence immobilière a réclamé plus de 9 000 euros de frais à un couple. Pour une vente qui n'a jamais eu lieu.

Ils ont refusé. L'affaire est allée au tribunal à Cáceres, et ils ont gagné.

Le tribunal a donné trois raisons :
1. L'agence n'a pas pu prouver que les acheteurs l'avaient vraiment mandatée.
2. Le contrat disait que les frais n'étaient dus qu'une fois l'offre formellement acceptée par les vendeurs. Ils ne l'ont jamais fait.
3. L'agence n'avait pas donné les informations que le droit de la consommation exige avant la signature.

Avant de signer quoi que ce soit avec un agent en Espagne, demandez :
Quand exactement les frais sont-ils dus ?
Qui les paie, l'acheteur ou le vendeur ?
Que se passe-t-il si la vente ne se fait pas ?
Si ce n'est pas écrit, demandez-le par écrit. Un bon agent ne s'en offusquera pas.

Quelques autres pièges classiques :
Un contrat d'arrhes ne vous permet de vous retirer en perdant l'acompte, ou au vendeur de se retirer en remboursant le double, que si le contrat le dit clairement.
Si vous prenez un prêt, la banque doit vous remettre l'offre et le projet de contrat au moins dix jours calendaires avant la signature chez le notaire.
Si le vendeur vit à l'étranger, l'acheteur doit retenir 3 % du prix pour le fisc, et paie aussi la plusvalía de la mairie à la place du vendeur.
Payer 1 000 euros ou plus en espèces est interdit quand l'une des parties est une entreprise.

Les agents, qu'est-ce que vous mettez toujours par écrit dès le premier jour ?`,
      nl: `Een makelaarskantoor vroeg een stel meer dan 9.000 euro aan courtage. Voor een verkoop die nooit is doorgegaan.

Ze weigerden. Het kwam voor de rechter in Cáceres, en ze wonnen.

De rechter gaf drie redenen:
1. Het kantoor kon niet bewijzen dat de kopers het echt hadden ingeschakeld.
2. Volgens het contract was de courtage pas verschuldigd als de verkopers het bod formeel hadden aanvaard. Dat hebben ze nooit gedaan.
3. Het kantoor had niet de informatie gegeven die het consumentenrecht vóór het tekenen verplicht stelt.

Voordat je in Spanje iets tekent met een makelaar, vraag:
Wanneer precies is de courtage verschuldigd?
Wie betaalt, de koper of de verkoper?
Wat gebeurt er als de verkoop niet doorgaat?
Staat het niet op papier, vraag het dan schriftelijk. Een goede makelaar vindt dat geen probleem.

Nog een paar dingen waar mensen in trappen:
Een aanbetalingscontract laat je alleen afzien van de koop door de aanbetaling te verliezen, of de verkoper door het dubbele terug te betalen, als het contract dat duidelijk zegt.
Neem je een hypotheek, dan moet de bank je het aanbod en het conceptcontract minstens tien kalenderdagen vóór de notaris geven.
Woont de verkoper in het buitenland, dan moet de koper 3% van de prijs inhouden voor de belastingdienst, en betaalt hij ook de plusvalía van de gemeente namens de verkoper.
Contant betalen van 1.000 euro of meer mag niet als een van beide partijen een bedrijf is.

Makelaars, wat zetten jullie op dag één altijd op papier?`,
    },
  },
  {
    key: 'election-housing-promises', audience: 'owners who let', facts: ['idealista 2026-11-16', 'idealista 2026-11-17', 'idealista 2026-11-04', 'idealista 2026-11-13', 'idealista 2026-11-09'],
    overlay: {
      en: ['Spain votes on 29 November.', 'If you rent out a home here, this one matters.', 'The two main parties want very different rules.'],
      no: ['Spania går til valg 29. november.', 'Leier du ut en bolig her, betyr dette valget mye.', 'De to store partiene vil ha helt forskjellige regler.'],
      sv: ['Spanien går till val den 29 november.', 'Hyr du ut en bostad här spelar det här valet roll.', 'De två stora partierna vill ha helt olika regler.'],
      da: ['Spanien går til valg den 29. november.', 'Lejer du en bolig ud her, betyder det her valg noget.', 'De to store partier vil have vidt forskellige regler.'],
      de: ['Spanien wählt am 29. November.', 'Wenn du hier vermietest, ist diese Wahl wichtig.', 'Die zwei großen Parteien wollen ganz andere Regeln.'],
      fr: ['L\'Espagne vote le 29 novembre.', 'Si vous louez un logement ici, ce vote compte.', 'Les deux grands partis veulent des règles très différentes.'],
      nl: ['Spanje stemt op 29 november.', 'Verhuur je hier een woning, dan doet deze verkiezing ertoe.', 'De twee grote partijen willen heel andere regels.'],
    },
    caption: {
      en: `Spain votes on 29 November, and if you rent out a home here, this election matters more than most.

I've read what the two main parties are promising on housing. Here it is without the noise.

PP, led by Alberto Núñez Feijóo:
Scrap the current Housing Law, which would end the stressed-market zones and the rent price index.
Abolish the Housing Ministry and put housing under a vice presidency.
Talk to the banks about lending, with a goal of one million new homes.
Cut purchase taxes for young people and pass an anti-squatting law. The Badalona mayor leading that plan wants owners to get a squatted home back within 48 hours, through the police instead of the courts.

PSOE:
Put 1% of GDP into housing every year.
Build a state stock of 100,000 homes for affordable rent.
Make rental contracts longer and keep freezing rent increases.
Raise taxes on so-called vulture funds.

Important: these are all promises. None of it is law today.

What is law today is the housing decree parliament confirmed this month, by 35 votes to 34. The one that would have made rental contracts indefinite was rejected.

For owners like us, rent limits, how long contracts last and how fast you can get a squatted home back could go in very different directions depending on who governs.

I'm not telling anyone how to vote. I just think that if you own here, you should know what's on the table.

What are you hoping changes, if anything?`,
      no: `Spania går til valg 29. november, og leier du ut en bolig her, betyr dette valget mer enn de fleste.

Jeg har lest hva de to største partiene lover om bolig. Her er det, uten støyen.

PP, ledet av Alberto Núñez Feijóo:
Skrote dagens boliglov, som ville fjerne de pressede boligsonene og leieprisindeksen.
Legge ned boligdepartementet og legge bolig under en visestatsminister.
Snakke med bankene om utlån, med mål om én million nye boliger.
Kutte kjøpsskatten for unge og vedta en lov mot okkupasjon. Ordføreren i Badalona som leder den planen, vil at eiere skal få tilbake en okkupert bolig innen 48 timer, via politiet i stedet for domstolene.

PSOE:
Bruke 1 % av BNP på bolig hvert år.
Bygge opp en statlig beholdning på 100 000 boliger til rimelig leie.
Gjøre leiekontrakter lengre og fortsette å fryse leieøkninger.
Øke skatten på såkalte gribbefond.

Viktig: alt dette er løfter. Ingenting av det er lov i dag.

Det som er lov i dag, er boligforordningen parlamentet bekreftet denne måneden, med 35 mot 34 stemmer. Den som ville gjort leiekontrakter tidsubegrensede, ble stemt ned.

For eiere som oss kan leietak, hvor lenge kontrakter varer og hvor fort du får tilbake en okkupert bolig, gå i helt forskjellige retninger avhengig av hvem som styrer.

Jeg sier ikke til noen hva de skal stemme. Jeg mener bare at eier du her, bør du vite hva som ligger på bordet.

Hva håper du endrer seg, om noe?`,
      sv: `Spanien går till val den 29 november, och hyr du ut en bostad här betyder det här valet mer än de flesta.

Jag har läst vad de två största partierna lovar om bostäder. Här är det, utan bruset.

PP, med Alberto Núñez Feijóo i spetsen:
Skrota nuvarande bostadslag, vilket skulle ta bort de ansträngda bostadszonerna och hyresprisindexet.
Lägga ner bostadsdepartementet och lägga bostäder under en vice regeringschef.
Prata med bankerna om utlåning, med målet en miljon nya bostäder.
Sänka köpskatten för unga och införa en lag mot husockupation. Borgmästaren i Badalona som leder den planen vill att ägare ska få tillbaka en ockuperad bostad inom 48 timmar, via polisen i stället för domstolarna.

PSOE:
Lägga 1 % av BNP på bostäder varje år.
Bygga upp ett statligt bestånd på 100 000 bostäder med överkomlig hyra.
Göra hyreskontrakt längre och fortsätta frysa hyreshöjningar.
Höja skatten för så kallade gamfonder.

Viktigt: allt det här är löften. Inget av det är lag i dag.

Det som är lag i dag är bostadsförordningen som parlamentet godkände den här månaden, med 35 röster mot 34. Den som skulle ha gjort hyreskontrakt tillsvidare röstades ner.

För ägare som oss kan hyrestak, hur länge kontrakt gäller och hur snabbt du får tillbaka en ockuperad bostad gå åt helt olika håll beroende på vem som styr.

Jag säger inte åt någon hur de ska rösta. Jag tycker bara att äger du här ska du veta vad som ligger på bordet.

Vad hoppas du ska förändras, om något?`,
      da: `Spanien går til valg den 29. november, og lejer du en bolig ud her, betyder det her valg mere end de fleste.

Jeg har læst, hvad de to største partier lover om boliger. Her er det, uden støjen.

PP, med Alberto Núñez Feijóo i spidsen:
Skrotte den nuværende boliglov, hvilket ville fjerne de pressede boligzoner og lejeprisindekset.
Nedlægge boligministeriet og lægge boliger under en vicestatsminister.
Tale med bankerne om udlån, med et mål om en million nye boliger.
Sænke købsskatten for unge og vedtage en lov mod besættelser. Borgmesteren i Badalona, der leder den plan, vil have, at ejere kan få en besat bolig tilbage inden for 48 timer, via politiet i stedet for domstolene.

PSOE:
Bruge 1 % af BNP på boliger hvert år.
Opbygge en statslig beholdning på 100.000 boliger til overkommelig leje.
Gøre lejekontrakter længere og blive ved med at fastfryse huslejestigninger.
Hæve skatten på såkaldte gribbefonde.

Vigtigt: alt det her er løfter. Intet af det er lov i dag.

Det, der er lov i dag, er boligdekretet, som parlamentet bekræftede i denne måned, med 35 stemmer mod 34. Det, der ville have gjort lejekontrakter tidsubegrænsede, blev stemt ned.

For ejere som os kan huslejeloft, hvor længe kontrakter løber, og hvor hurtigt man får en besat bolig tilbage, gå i vidt forskellige retninger, alt efter hvem der regerer.

Jeg siger ikke til nogen, hvad de skal stemme. Jeg synes bare, at ejer du noget her, så bør du vide, hvad der ligger på bordet.

Hvad håber du ændrer sig, hvis noget?`,
      de: `Spanien wählt am 29. November, und wenn du hier eine Wohnung vermietest, ist diese Wahl wichtiger als die meisten.

Ich habe gelesen, was die zwei großen Parteien beim Thema Wohnen versprechen. Hier ist es, ohne das Getöse.

PP, angeführt von Alberto Núñez Feijóo:
Das aktuelle Wohnungsgesetz abschaffen, womit die angespannten Wohnungsmarktzonen und der Mietpreisindex wegfallen würden.
Das Wohnungsministerium auflösen und das Thema einer Vizepräsidentschaft unterstellen.
Mit den Banken über Kredite sprechen, mit dem Ziel von einer Million neuer Wohnungen.
Die Grunderwerbsteuer für junge Leute senken und ein Gesetz gegen Hausbesetzungen verabschieden. Der Bürgermeister von Badalona, der diesen Plan anführt, will, dass Eigentümer eine besetzte Wohnung innerhalb von 48 Stunden zurückbekommen, über die Polizei statt über die Gerichte.

PSOE:
Jedes Jahr 1 % des BIP in Wohnraum stecken.
Einen staatlichen Bestand von 100.000 Wohnungen zu bezahlbarer Miete aufbauen.
Mietverträge verlängern und Mieterhöhungen weiter einfrieren.
Die Steuern für sogenannte Geierfonds erhöhen.

Wichtig: Das sind alles Versprechen. Nichts davon ist heute Gesetz.

Heute Gesetz ist das Wohnungsdekret, das das Parlament diesen Monat mit 35 zu 34 Stimmen bestätigt hat. Das Dekret für unbefristete Mietverträge wurde abgelehnt.

Für Eigentümer wie uns können Mietobergrenzen, die Laufzeit von Verträgen und wie schnell man eine besetzte Wohnung zurückbekommt, in ganz verschiedene Richtungen gehen, je nachdem, wer regiert.

Ich sage niemandem, was er wählen soll. Ich finde nur, wenn du hier Eigentum hast, solltest du wissen, was auf dem Tisch liegt.

Was hoffst du, ändert sich, wenn überhaupt?`,
      fr: `L'Espagne vote le 29 novembre, et si vous louez un logement ici, cette élection compte plus que la plupart.

J'ai lu ce que les deux grands partis promettent sur le logement. Le voici, sans le bruit.

Le PP, mené par Alberto Núñez Feijóo :
Abroger l'actuelle loi sur le logement, ce qui supprimerait les zones tendues et l'indice des loyers.
Supprimer le ministère du Logement et placer le logement sous une vice-présidence.
Discuter avec les banques des conditions de crédit, avec l'objectif d'un million de logements neufs.
Baisser les taxes d'achat pour les jeunes et voter une loi anti-squat. Le maire de Badalone qui porte ce projet veut que les propriétaires récupèrent un logement squatté en 48 heures, par la police plutôt que par les tribunaux.

Le PSOE :
Consacrer chaque année 1 % du PIB au logement.
Constituer un parc public de 100 000 logements à loyer abordable.
Allonger les baux et continuer à geler les hausses de loyer.
Augmenter les impôts des fonds dits vautours.

Important : ce ne sont que des promesses. Rien de tout ça n'est une loi aujourd'hui.

Ce qui est la loi aujourd'hui, c'est le décret logement validé ce mois-ci par le parlement, par 35 voix contre 34. Celui qui aurait rendu les baux à durée indéterminée a été rejeté.

Pour les propriétaires comme nous, le plafonnement des loyers, la durée des baux et la rapidité pour récupérer un logement squatté pourraient aller dans des directions très différentes selon qui gouverne.

Je ne dis à personne pour qui voter. Je pense juste que si vous êtes propriétaire ici, vous devez savoir ce qui est sur la table.

Qu'espérez-vous voir changer, s'il y a quelque chose ?`,
      nl: `Spanje stemt op 29 november, en verhuur je hier een woning, dan doet deze verkiezing er meer toe dan de meeste.

Ik heb gelezen wat de twee grootste partijen beloven over wonen. Hier is het, zonder de ruis.

PP, onder leiding van Alberto Núñez Feijóo:
De huidige woningwet schrappen, waardoor de gespannen woningmarktzones en de huurprijsindex verdwijnen.
Het ministerie van Wonen opheffen en wonen onder een vicepremier brengen.
Met de banken praten over leningen, met als doel een miljoen nieuwe woningen.
De overdrachtsbelasting voor jongeren verlagen en een wet tegen kraken invoeren. De burgemeester van Badalona die dat plan leidt, wil dat eigenaren een gekraakte woning binnen 48 uur terugkrijgen, via de politie in plaats van de rechter.

PSOE:
Elk jaar 1% van het bbp in wonen steken.
Een staatsvoorraad van 100.000 woningen met betaalbare huur opbouwen.
Huurcontracten langer maken en huurverhogingen bevroren houden.
De belasting voor zogenaamde aasgierfondsen verhogen.

Belangrijk: dit zijn allemaal beloftes. Niets ervan is vandaag wet.

Wat vandaag wel wet is, is het woningdecreet dat het parlement deze maand bevestigde, met 35 tegen 34 stemmen. Het decreet voor huurcontracten voor onbepaalde tijd werd weggestemd.

Voor eigenaren zoals wij kunnen huurplafonds, de looptijd van contracten en hoe snel je een gekraakte woning terugkrijgt alle kanten op gaan, afhankelijk van wie er gaat regeren.

Ik zeg niemand wat hij moet stemmen. Ik vind alleen dat als je hier iets bezit, je moet weten wat er op tafel ligt.

Wat hoop jij dat er verandert, als er iets verandert?`,
    },
  },
  {
    key: 'deposit-repaint-court', audience: 'owners who let', facts: ['idealista 2026-11-10', 'idealista 2026-11-12', 'idealista 2026-11-16', 'idealista 2026-11-17'],
    overlay: {
      en: ['Keeping your tenant\'s deposit for a fresh coat of paint?', 'A court in Barcelona just said no.', 'Here is what you can and cannot charge.'],
      no: ['Skal du beholde depositumet for å male på nytt?', 'En domstol i Barcelona sa nettopp nei.', 'Her er hva du kan og ikke kan kreve.'],
      sv: ['Tänker du behålla depositionen för en ny målning?', 'En domstol i Barcelona sa just nej.', 'Här är vad du får och inte får ta betalt för.'],
      da: ['Vil du beholde depositummet til en ny gang maling?', 'En domstol i Barcelona har lige sagt nej.', 'Her er, hvad du må og ikke må kræve.'],
      de: ['Willst du die Kaution für einen neuen Anstrich behalten?', 'Ein Gericht in Barcelona hat gerade Nein gesagt.', 'Das darfst du verlangen und das nicht.'],
      fr: ['Vous comptez garder la caution pour repeindre ?', 'Un tribunal de Barcelone vient de dire non.', 'Voici ce que vous pouvez facturer, et ce que vous ne pouvez pas.'],
      nl: ['Wil je de borg houden voor een nieuw likje verf?', 'Een rechter in Barcelona zei net nee.', 'Dit mag je wel en niet in rekening brengen.'],
    },
    caption: {
      en: `If you rent out your home in Spain, this court case is worth two minutes.

Barcelona. The tenants move out. The landlords want them to pay for a full clean and a full repaint, and they keep the deposit.

The court said no. Normal wear and tear is part of renting. Tenants don't pay for a full clean or a full repaint at the end of a lease unless there's real damage or changes they made without permission.

It wasn't a total loss for the landlords:
The tenants had painted three rooms in their own colours without asking, so they paid to repaint those.
The landlords got 1,612 euros for damaged or missing furniture and items.
They still had to return the full 3,200 euro deposit, plus interest.

What I'd do:
Take dated photos and write an inventory on the day the tenant moves in.
Put in the contract that changes like painting need your written okay.
At the end, claim only for real damage, and keep the receipts.

Two more things worth knowing:
A court in Madrid said a community can't stop you renting out rooms just because its statutes ban hotels or guesthouses. Tenants coming and going isn't a nuisance on its own.
Scams work both ways. Before you hand over keys, check that what a candidate tells you matches the documents they show you.

Rooms are in demand, by the way. The average room in Spain now rents for 494 euros a month, up 11% in a year.

Landlords, do you take photos when a tenant moves in?`,
      no: `Leier du ut boligen din i Spania, er denne rettssaken verdt to minutter.

Barcelona. Leietakerne flytter ut. Utleierne vil at de skal betale for full vask og full maling, og beholder depositumet.

Retten sa nei. Vanlig slitasje er en del av det å leie ut. Leietakere betaler ikke for full vask eller full maling når leieforholdet slutter, med mindre det er reelle skader eller endringer de har gjort uten lov.

Det var ikke et rent tap for utleierne:
Leietakerne hadde malt tre rom i egne farger uten å spørre, så de betalte for å male dem på nytt.
Utleierne fikk 1 612 euro for ødelagte eller manglende møbler og ting.
De måtte likevel betale tilbake hele depositumet på 3 200 euro, pluss renter.

Det jeg ville gjort:
Ta daterte bilder og lag en inventarliste den dagen leietakeren flytter inn.
Skriv i kontrakten at endringer som maling krever ditt skriftlige ja.
Til slutt, krev bare for reelle skader, og ta vare på kvitteringene.

To ting til som er verdt å vite:
En domstol i Madrid sa at et sameie ikke kan stoppe deg fra å leie ut rom bare fordi vedtektene forbyr hotell eller pensjonat. At leietakere kommer og går, er ikke sjenanse i seg selv.
Svindel går begge veier. Før du gir fra deg nøklene, sjekk at det en søker forteller deg stemmer med dokumentene de viser.

Rom er forresten populære. Et rom i Spania leies nå ut for 494 euro i måneden i snitt, opp 11 % på et år.

Utleiere, tar dere bilder når en leietaker flytter inn?`,
      sv: `Hyr du ut din bostad i Spanien är det här rättsfallet värt två minuter.

Barcelona. Hyresgästerna flyttar ut. Hyresvärdarna vill att de ska betala för storstädning och ommålning av allt, och behåller depositionen.

Domstolen sa nej. Normalt slitage är en del av att hyra ut. Hyresgäster betalar inte för storstädning eller ommålning när hyran tar slut, om det inte finns verkliga skador eller ändringar de gjort utan lov.

Det var inte en total förlust för hyresvärdarna:
Hyresgästerna hade målat tre rum i egna färger utan att fråga, så de betalade för att måla om dem.
Hyresvärdarna fick 1 612 euro för skadade eller saknade möbler och saker.
De fick ändå betala tillbaka hela depositionen på 3 200 euro, plus ränta.

Det jag skulle göra:
Ta daterade bilder och skriv en inventarielista den dag hyresgästen flyttar in.
Skriv i kontraktet att ändringar som målning kräver ditt skriftliga okej.
I slutet, kräv bara ersättning för verkliga skador, och spara kvittona.

Två saker till som är bra att veta:
En domstol i Madrid sa att en förening inte kan hindra dig från att hyra ut rum bara för att stadgarna förbjuder hotell eller pensionat. Att hyresgäster kommer och går är inte en olägenhet i sig.
Bedrägerier går åt båda håll. Innan du lämnar över nycklarna, kontrollera att det en sökande berättar stämmer med dokumenten de visar.

Rum är förresten eftertraktade. Ett rum i Spanien hyrs nu ut för 494 euro i månaden i snitt, upp 11 % på ett år.

Hyresvärdar, tar ni bilder när en hyresgäst flyttar in?`,
      da: `Lejer du din bolig ud i Spanien, er den her retssag to minutter værd.

Barcelona. Lejerne flytter ud. Udlejerne vil have dem til at betale for en hovedrengøring og en komplet ommaling, og de beholder depositummet.

Retten sagde nej. Almindeligt slid er en del af at leje ud. Lejere betaler ikke for hovedrengøring eller komplet ommaling, når lejemålet slutter, medmindre der er reelle skader eller ændringer, de har lavet uden lov.

Det var ikke et rent tab for udlejerne:
Lejerne havde malet tre rum i deres egne farver uden at spørge, så de betalte for at male dem om.
Udlejerne fik 1.612 euro for ødelagte eller manglende møbler og ting.
De skulle stadig betale hele depositummet på 3.200 euro tilbage, plus renter.

Det ville jeg gøre:
Tag daterede billeder og skriv en inventarliste den dag, lejeren flytter ind.
Skriv i kontrakten, at ændringer som maling kræver dit skriftlige ja.
Til sidst skal du kun kræve betaling for reelle skader, og gem kvitteringerne.

To ting mere, der er værd at vide:
En domstol i Madrid sagde, at en ejerforening ikke kan forhindre dig i at udleje værelser, bare fordi vedtægterne forbyder hotel eller pensionat. At lejere kommer og går, er ikke en gene i sig selv.
Svindel går begge veje. Før du afleverer nøglerne, så tjek, at det, en ansøger fortæller dig, passer med de dokumenter, de viser dig.

Værelser er i øvrigt efterspurgte. Et værelse i Spanien udlejes nu for 494 euro om måneden i gennemsnit, op 11 % på et år.

Udlejere, tager I billeder, når en lejer flytter ind?`,
      de: `Wenn du deine Wohnung in Spanien vermietest, ist dieser Fall zwei Minuten wert.

Barcelona. Die Mieter ziehen aus. Die Vermieter wollen, dass sie eine Komplettreinigung und einen kompletten Neuanstrich zahlen, und behalten die Kaution.

Das Gericht hat Nein gesagt. Normale Abnutzung gehört zum Vermieten dazu. Mieter zahlen am Ende des Mietverhältnisses keine Komplettreinigung und keinen kompletten Anstrich, außer es gibt echte Schäden oder Änderungen ohne Erlaubnis.

Ganz leer gingen die Vermieter nicht aus:
Die Mieter hatten drei Zimmer ungefragt in eigenen Farben gestrichen, also mussten sie den Anstrich dort zahlen.
Die Vermieter bekamen 1.612 Euro für beschädigte oder fehlende Möbel und Gegenstände.
Trotzdem mussten sie die ganze Kaution von 3.200 Euro zurückzahlen, plus Zinsen.

Was ich machen würde:
Am Einzugstag datierte Fotos machen und eine Inventarliste schreiben.
In den Vertrag schreiben, dass Änderungen wie Streichen deine schriftliche Zustimmung brauchen.
Am Ende nur echte Schäden verlangen und die Belege aufheben.

Zwei Dinge, die man noch wissen sollte:
Ein Gericht in Madrid hat entschieden, dass eine Eigentümergemeinschaft dir die Zimmervermietung nicht verbieten kann, nur weil die Satzung Hotels oder Pensionen verbietet. Dass Mieter kommen und gehen, ist für sich allein keine Belästigung.
Betrug gibt es in beide Richtungen. Bevor du die Schlüssel übergibst, prüf, ob das, was dir ein Bewerber erzählt, zu den Dokumenten passt, die er zeigt.

Zimmer sind übrigens gefragt. Ein Zimmer in Spanien kostet jetzt im Schnitt 494 Euro im Monat, plus 11 % in einem Jahr.

Liebe Vermieter, macht ihr beim Einzug Fotos?`,
      fr: `Si vous louez votre logement en Espagne, cette affaire vaut deux minutes.

Barcelone. Les locataires partent. Les propriétaires veulent leur faire payer un grand ménage et une peinture complète, et gardent la caution.

Le tribunal a dit non. L'usure normale fait partie de la location. Les locataires ne paient pas un grand ménage ou une peinture complète en fin de bail, sauf en cas de vrais dégâts ou de changements faits sans autorisation.

Ce n'était pas une perte totale pour les propriétaires :
Les locataires avaient repeint trois pièces dans leurs propres couleurs sans demander, ils ont donc payé pour les repeindre.
Les propriétaires ont obtenu 1 612 euros pour des meubles et objets abîmés ou manquants.
Ils ont quand même dû rendre toute la caution de 3 200 euros, avec les intérêts.

Ce que je ferais :
Prendre des photos datées et faire un inventaire le jour de l'entrée du locataire.
Écrire dans le contrat que les changements comme la peinture demandent votre accord écrit.
À la fin, ne réclamer que les vrais dégâts, et garder les factures.

Deux autres choses à savoir :
Un tribunal de Madrid a jugé qu'une copropriété ne peut pas vous empêcher de louer des chambres juste parce que son règlement interdit les hôtels ou les pensions. Les allées et venues des locataires ne sont pas une nuisance en soi.
Les arnaques vont dans les deux sens. Avant de donner les clés, vérifiez que ce que vous dit un candidat correspond aux documents qu'il vous montre.

Les chambres sont d'ailleurs très demandées. Une chambre en Espagne se loue maintenant 494 euros par mois en moyenne, plus 11 % en un an.

Les propriétaires, vous prenez des photos à l'entrée du locataire ?`,
      nl: `Verhuur je je woning in Spanje, dan is deze rechtszaak twee minuten waard.

Barcelona. De huurders vertrekken. De verhuurders willen dat ze een grote schoonmaak en een complete schilderbeurt betalen, en houden de borg.

De rechter zei nee. Normale slijtage hoort bij verhuren. Huurders betalen aan het einde van de huur geen grote schoonmaak of complete schilderbeurt, tenzij er echte schade is of ze zonder toestemming iets hebben veranderd.

Het was geen totaal verlies voor de verhuurders:
De huurders hadden drie kamers zonder te vragen in hun eigen kleuren geverfd, dus ze betaalden om die over te schilderen.
De verhuurders kregen 1.612 euro voor beschadigde of ontbrekende meubels en spullen.
Ze moesten toch de hele borg van 3.200 euro terugbetalen, plus rente.

Wat ik zou doen:
Maak gedateerde foto's en een inventarislijst op de dag dat de huurder intrekt.
Zet in het contract dat veranderingen zoals schilderen jouw schriftelijke oké nodig hebben.
Vraag aan het einde alleen vergoeding voor echte schade, en bewaar de bonnetjes.

Nog twee dingen die het weten waard zijn:
Een rechter in Madrid zei dat een vereniging je niet kan verbieden kamers te verhuren alleen omdat de statuten hotels of pensions verbieden. Huurders die komen en gaan zijn op zich geen overlast.
Oplichting werkt twee kanten op. Voordat je de sleutels geeft, check of wat een kandidaat vertelt klopt met de documenten die hij laat zien.

Kamers zijn trouwens gewild. Een kamer in Spanje wordt nu gemiddeld voor 494 euro per maand verhuurd, 11% meer dan een jaar eerder.

Verhuurders, maken jullie foto's als een huurder intrekt?`,
    },
  },
  {
    key: 'community-late-fee-supreme-court', audience: 'owners', facts: ['idealista 2026-11-06', 'tourist_35', 'tourist_20', 'idealista 2026-11-11', 'community_cert'],
    overlay: {
      en: ['A community fined late payers 50 cents a day.', 'Spain\'s Supreme Court shut it down.', 'Your community cannot just make up penalties.'],
      no: ['Et sameie bøtela sene betalere med 50 cent om dagen.', 'Spanias høyesterett satte en stopper for det.', 'Sameiet ditt kan ikke bare finne på straffer.'],
      sv: ['En förening tog 50 cent om dagen av dem som betalade sent.', 'Spaniens högsta domstol satte stopp för det.', 'Din förening kan inte bara hitta på straffavgifter.'],
      da: ['En ejerforening tog 50 cent om dagen af dem, der betalte for sent.', 'Spaniens højesteret satte en stopper for det.', 'Din ejerforening kan ikke bare finde på straffe.'],
      de: ['Eine Gemeinschaft verlangte 50 Cent pro Tag von Säumigen.', 'Spaniens Oberster Gerichtshof hat das gekippt.', 'Deine Gemeinschaft kann sich keine Strafen ausdenken.'],
      fr: ['Une copropriété facturait 50 centimes par jour de retard.', 'La Cour suprême espagnole y a mis fin.', 'Votre copropriété ne peut pas inventer des pénalités.'],
      nl: ['Een vereniging rekende 50 cent per dag voor te laat betalen.', 'Het Spaanse hooggerechtshof heeft er een eind aan gemaakt.', 'Je vereniging kan niet zomaar boetes verzinnen.'],
    },
    caption: {
      en: `A community of owners in Spain decided to charge 50 cents a day to anyone who paid their fees late.

Sounds small, right? Over a year it could reach 182.50 euros. That was on a garage space where the yearly fee was 135 euros, so the penalty could end up bigger than the bill. And it was the same whether you owed 5 euros or 500.

Spain's Supreme Court said it was disproportionate. Not allowed.

Communities can go after unpaid fees. They just have to stay within the law and can't use abusive surcharges.

Other community rules every owner here should know:
Since April 2025, a new holiday let in a building needs a yes from three fifths of the owners, who also hold three fifths of the shares.
The community can raise a holiday-let flat's share of the common costs by up to 20%.
It can restrict activities in a home that cause a nuisance, like noise or a steady flow of visitors, but an existing business doesn't automatically have to close. That depends on the statutes or a court.
If you're buying a flat, the community secretary has to give you a certificate of the seller's unpaid fees within seven calendar days of asking.

Why this matters if you live abroad:
A lot of us miss the community meetings, and that's exactly when things like this get voted in.
Ask your administrator for the minutes, even if it's months later.

Has your community ever voted for something you didn't agree with?`,
      no: `Et sameie i Spania bestemte seg for å kreve 50 cent om dagen av alle som betalte fellesutgiftene for sent.

Høres lite ut, ikke sant? På et år kunne det bli 182,50 euro. Det gjaldt en garasjeplass der årsavgiften var 135 euro, så boten kunne bli større enn regningen. Og den var like stor enten du skyldte 5 euro eller 500.

Spanias høyesterett sa at det var uforholdsmessig. Ikke lov.

Sameier kan gå etter ubetalte avgifter. De må bare holde seg innenfor loven og kan ikke bruke urimelige tillegg.

Andre sameieregler alle eiere her bør kjenne til:
Siden april 2025 trenger ny ferieutleie i en bygning ja fra tre femtedeler av eierne, som også må eie tre femtedeler av andelene.
Sameiet kan øke en ferieutleieleilighets andel av fellesutgiftene med opptil 20 %.
Det kan begrense aktiviteter i en bolig som er til sjenanse, som støy eller en jevn strøm av besøkende, men en eksisterende virksomhet må ikke automatisk stenge. Det avhenger av vedtektene eller en domstol.
Kjøper du en leilighet, må sameiets sekretær gi deg en attest om selgerens ubetalte avgifter innen sju kalenderdager etter at du ber om det.

Hvorfor dette betyr noe hvis du bor i utlandet:
Mange av oss går glipp av sameiemøtene, og det er akkurat da slikt blir vedtatt.
Be forvalteren om referatet, selv om det er måneder senere.

Har sameiet ditt noen gang vedtatt noe du var uenig i?`,
      sv: `En förening i Spanien bestämde sig för att ta 50 cent om dagen av alla som betalade avgiften sent.

Låter lite, eller hur? På ett år kunde det bli 182,50 euro. Det gällde en garageplats där årsavgiften var 135 euro, så straffavgiften kunde bli större än räkningen. Och den var lika stor oavsett om du var skyldig 5 euro eller 500.

Spaniens högsta domstol sa att det var oproportionerligt. Inte tillåtet.

Föreningar får driva in obetalda avgifter. De måste bara hålla sig inom lagen och får inte ta oskäliga tillägg.

Andra föreningsregler som alla ägare här borde känna till:
Sedan april 2025 behöver ny semesteruthyrning i en byggnad ett ja från tre femtedelar av ägarna, som också måste äga tre femtedelar av andelarna.
Föreningen kan höja en semesteruthyrd lägenhets andel av de gemensamma kostnaderna med upp till 20 %.
Den kan begränsa verksamhet i en bostad som stör, som buller eller ett jämnt flöde av besökare, men en befintlig verksamhet måste inte automatiskt stänga. Det beror på stadgarna eller en domstol.
Köper du en lägenhet måste föreningens sekreterare ge dig ett intyg om säljarens obetalda avgifter inom sju kalenderdagar efter att du frågat.

Varför det här spelar roll om du bor utomlands:
Många av oss missar föreningsmötena, och det är precis då sådant här röstas igenom.
Be förvaltaren om protokollet, även om det är månader senare.

Har din förening någon gång röstat igenom något du inte höll med om?`,
      da: `En ejerforening i Spanien besluttede at tage 50 cent om dagen af alle, der betalte deres bidrag for sent.

Lyder ikke af meget, vel? På et år kunne det blive 182,50 euro. Det var på en garageplads, hvor det årlige bidrag var 135 euro, så straffen kunne blive større end regningen. Og den var den samme, uanset om du skyldte 5 euro eller 500.

Spaniens højesteret sagde, at det var uforholdsmæssigt. Ikke tilladt.

Ejerforeninger må gerne gå efter ubetalte bidrag. De skal bare holde sig inden for loven og må ikke bruge urimelige tillæg.

Andre ejerforeningsregler, som alle ejere her bør kende:
Siden april 2025 kræver ny ferieudlejning i en bygning et ja fra tre femtedele af ejerne, som også skal eje tre femtedele af andelene.
Ejerforeningen kan hæve en ferieudlejet lejligheds andel af fællesudgifterne med op til 20 %.
Den kan begrænse aktiviteter i en bolig, der er til gene, som støj eller en konstant strøm af besøgende, men en eksisterende virksomhed skal ikke automatisk lukke. Det afhænger af vedtægterne eller en domstol.
Køber du en lejlighed, skal ejerforeningens sekretær give dig en attest om sælgerens ubetalte bidrag inden for syv kalenderdage, efter du har spurgt.

Hvorfor det betyder noget, hvis du bor i udlandet:
Mange af os går glip af generalforsamlingerne, og det er præcis der, den slags bliver vedtaget.
Bed administratoren om referatet, også selvom det er måneder senere.

Har din ejerforening nogensinde vedtaget noget, du ikke var enig i?`,
      de: `Eine Eigentümergemeinschaft in Spanien hat beschlossen, von jedem, der seine Beiträge zu spät zahlt, 50 Cent pro Tag zu verlangen.

Klingt nach wenig, oder? Aufs Jahr gerechnet konnten das 182,50 Euro werden. Es ging um einen Garagenstellplatz mit einem Jahresbeitrag von 135 Euro, die Strafe konnte also höher sein als die Rechnung. Und sie war gleich, egal ob du 5 Euro oder 500 schuldig warst.

Spaniens Oberster Gerichtshof hat gesagt: unverhältnismäßig. Nicht erlaubt.

Gemeinschaften dürfen offene Beiträge eintreiben. Sie müssen nur im Rahmen des Gesetzes bleiben und dürfen keine missbräuchlichen Zuschläge verlangen.

Weitere Regeln, die jeder Eigentümer hier kennen sollte:
Seit April 2025 braucht eine neue Ferienvermietung in einem Gebäude das Ja von drei Fünfteln der Eigentümer, die auch drei Fünftel der Anteile halten.
Die Gemeinschaft kann den Anteil einer Ferienwohnung an den gemeinsamen Kosten um bis zu 20 % erhöhen.
Sie kann Tätigkeiten in einer Wohnung einschränken, die stören, wie Lärm oder ständige Besucher, aber ein bestehendes Geschäft muss nicht automatisch schließen. Das hängt von der Satzung oder einem Gericht ab.
Wenn du eine Wohnung kaufst, muss der Sekretär der Gemeinschaft dir innerhalb von sieben Kalendertagen nach Anfrage eine Bescheinigung über die offenen Beiträge des Verkäufers geben.

Warum das wichtig ist, wenn du im Ausland lebst:
Viele von uns verpassen die Eigentümerversammlungen, und genau dann wird so etwas beschlossen.
Frag den Verwalter nach dem Protokoll, auch wenn es Monate später ist.

Hat deine Gemeinschaft schon mal etwas beschlossen, womit du nicht einverstanden warst?`,
      fr: `Une copropriété en Espagne a décidé de faire payer 50 centimes par jour à quiconque réglait ses charges en retard.

Ça paraît peu, non ? Sur un an, ça pouvait atteindre 182,50 euros. C'était sur une place de garage dont les charges annuelles étaient de 135 euros, donc la pénalité pouvait dépasser la facture. Et c'était pareil que vous deviez 5 euros ou 500.

La Cour suprême espagnole a jugé que c'était disproportionné. Interdit.

Les copropriétés peuvent poursuivre les impayés. Elles doivent juste rester dans la loi et ne pas appliquer de majorations abusives.

D'autres règles de copropriété que tout propriétaire ici devrait connaître :
Depuis avril 2025, une nouvelle location touristique dans un immeuble demande le oui des trois cinquièmes des propriétaires, qui doivent aussi détenir les trois cinquièmes des quotes-parts.
La copropriété peut augmenter jusqu'à 20 % la part des charges communes d'un appartement loué aux touristes.
Elle peut limiter les activités qui dérangent dans un logement, comme le bruit ou un passage constant de visiteurs, mais une activité existante ne doit pas fermer automatiquement. Cela dépend du règlement ou d'un tribunal.
Si vous achetez un appartement, le secrétaire de la copropriété doit vous remettre un certificat des impayés du vendeur dans les sept jours calendaires suivant votre demande.

Pourquoi c'est important si vous vivez à l'étranger :
Beaucoup d'entre nous ratent les assemblées, et c'est justement là que ce genre de choses est voté.
Demandez le procès-verbal au syndic, même des mois plus tard.

Votre copropriété a-t-elle déjà voté quelque chose avec lequel vous n'étiez pas d'accord ?`,
      nl: `Een vereniging van eigenaren in Spanje besloot 50 cent per dag te rekenen aan iedereen die de bijdrage te laat betaalde.

Klinkt weinig, toch? Over een jaar kon het oplopen tot 182,50 euro. Het ging om een garageplek met een jaarbijdrage van 135 euro, dus de boete kon hoger worden dan de rekening. En hij was hetzelfde of je nu 5 euro of 500 schuldig was.

Het Spaanse hooggerechtshof zei dat het buiten proportie was. Niet toegestaan.

Verenigingen mogen achterstallige bijdragen innen. Ze moeten alleen binnen de wet blijven en mogen geen onredelijke toeslagen rekenen.

Andere regels die elke eigenaar hier zou moeten kennen:
Sinds april 2025 heeft nieuwe vakantieverhuur in een gebouw een ja nodig van drie vijfde van de eigenaren, die ook drie vijfde van de aandelen moeten hebben.
De vereniging kan het aandeel van een vakantieappartement in de gemeenschappelijke kosten met maximaal 20% verhogen.
Ze kan activiteiten in een woning beperken die overlast geven, zoals lawaai of een constante stroom bezoekers, maar een bestaand bedrijf hoeft niet automatisch te sluiten. Dat hangt af van de statuten of een rechter.
Koop je een appartement, dan moet de secretaris van de vereniging je binnen zeven kalenderdagen na je verzoek een verklaring geven over de achterstallige bijdragen van de verkoper.

Waarom dit ertoe doet als je in het buitenland woont:
Veel van ons missen de vergaderingen, en juist dan wordt zoiets erdoor gestemd.
Vraag de beheerder om de notulen, ook al is het maanden later.

Heeft jouw vereniging ooit iets besloten waar jij het niet mee eens was?`,
    },
  },
];

// The order the posts go out in. A parked post is skipped; nothing waits for it.
export const PROFILE_ORDER = PROFILE_POSTS.map(p => p.key);
export const profileByKey = (key) => PROFILE_POSTS.find(p => p.key === key) || null;
// 18 November 2026: the first run is a 7-day trial (18 to 24 November): seven posts, one a day,
// written from idealista news in Maria's own voice. Pratik is told when the batch is ending,
// so he can look at how it went before the next batch is written.
export const PROFILE_LOW = 2;

// What she copies: the caption with the hashtags under it, and a short text for X, which
// allows only 280 characters on a free account.
export const captionFor = (post, lang) => `${post.caption[lang]}\n\n${HASHTAGS[lang]}`;
export const xTextFor = (post, lang) => post.overlay[lang].join(' ');

const REELS = `${SITE}/persona-reels`;
// REELS_VERSION busts caches when a batch is re-rendered. Bump it with every new render.
export const REELS_VERSION = 3;
export const videoUrl = (key, lang) => `${REELS}/${key}/${lang}.mp4?v=${REELS_VERSION}`;
export const posterUrl = (key, lang) => `${REELS}/${key}/${lang}.jpg?v=${REELS_VERSION}`;

// The next post to go out, given the persona_posts rows: the first in PROFILE_ORDER that has
// not gone out and is not parked. null when the batch has run out.
export function nextProfilePost(rows = []) {
  const byKey = new Map(rows.map(r => [r.post_key, r]));
  for (const key of PROFILE_ORDER) {
    const r = byKey.get(key);
    if (r && (r.sent_on || r.parked)) continue;
    return profileByKey(key);
  }
  return null;
}
export function profilesLeft(rows = []) {
  const byKey = new Map(rows.map(r => [r.post_key, r]));
  return PROFILE_ORDER.filter(k => { const r = byKey.get(k); return !(r && (r.sent_on || r.parked)); }).length;
}
