// The newsletter issues, written ahead of time. Plain data, read by the seed action.
//
// WHAT IS FIXED AND WHAT CHANGES
// The fixed blocks (welcome, Bueno Tax, Get Bueno, sign-off) live in _newsletter_shell.js.
// Each issue below carries only the parts that change: the three news items, the guide,
// the region spotlight, the reader's question and the optional survey.
//
// NEWS IS REFRESHED CLOSE TO THE SEND DATE
// An issue whose news_status is 'to_refresh' carries placeholder news. The fortnightly
// research job (studio/newsletter/newsletter-research.yml, parked until launch) researches the latest Spanish
// property news on the alert day, writes it into the issue in all three languages, and
// only then emails Pratik and John. It never touches an issue that has been approved, and
// never overwrites anything John has edited.
//
// NO REPEATS
// Every guide, region and reader topic is checked against _newsletter_registry.js, which
// also lists everything used in issues 4 to 12. The health action fails if two issues share
// a guide, a region or a reader topic.
//
// SOURCES
// Every figure in news and region text is listed in `sources` with the page it came from,
// so a reviewer can check any number in one click.

const GUIDE_BASE = 'https://www.247spain.es/newsletter-guides';
const guideUrls = (file) => ({
  en: `${GUIDE_BASE}/Bueno-Guide-${file}-EN.pdf`,
  no: `${GUIDE_BASE}/Bueno-Guide-${file}-NO.pdf`,
  sv: `${GUIDE_BASE}/Bueno-Guide-${file}-SV.pdf`,
});

const PENDING_NEWS = {
  en: [
    { title: 'News is researched on the alert day', body: 'The three updates for this issue are researched and written in the days before it goes out, so they are current when it is sent.' },
    { title: 'Second update to follow', body: 'This slot is filled by the research job.' },
    { title: 'Third update to follow', body: 'This slot is filled by the research job.' },
  ],
  no: [
    { title: 'Nyhetene hentes inn på varslingsdagen', body: 'De tre nyhetene i denne utgaven blir funnet og skrevet dagene før den sendes, slik at de er oppdaterte.' },
    { title: 'Nyhet nummer to kommer', body: 'Denne plassen fylles av research-jobben.' },
    { title: 'Nyhet nummer tre kommer', body: 'Denne plassen fylles av research-jobben.' },
  ],
  sv: [
    { title: 'Nyheterna tas fram på aviseringsdagen', body: 'De tre nyheterna i det här numret tas fram och skrivs dagarna innan det skickas, så att de är aktuella.' },
    { title: 'Nyhet nummer två kommer', body: 'Den här platsen fylls av researchjobbet.' },
    { title: 'Nyhet nummer tre kommer', body: 'Den här platsen fylls av researchjobbet.' },
  ],
};

export const ISSUES = [
  // ---------------------------------------------------------------------------------------
  {
    key: 'nl-13',
    number: 13,
    send_date: '2026-10-08',
    alert_date: '2026-10-02',
    news_status: 'researched',
    guide: 'closing-up-for-winter',
    region: 'murcia',
    reader_topic: 'ibi-missed-payment',
    sources: {
      news: [
        'https://en.ara.cat/economy/the-euribor-closes-september-at-two-year-highs-and-stands-at-3-24_1_5865184.html',
        'https://www.idealista.com/news/inmobiliario/vivienda/2026/09/30/916382-las-compraventas-de-viviendas-caen-a-doble-digito-en-julio-mientras-los-precios',
        'https://www.idealista.com/en/news/property-for-rent-in-spain/2026/09/22/914893-renting-in-spain-in-2026-demand-shifts-from-cities-to-cheaper-towns',
      ],
      region: [
        'https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/murcia-region/',
        'https://www.idealista.com/news/inmobiliario/vivienda/2026/09/30/916382-las-compraventas-de-viviendas-caen-a-doble-digito-en-julio-mientras-los-precios',
      ],
      question: ['Ley 58/2003 General Tributaria, article 28 (recargos del periodo ejecutivo)'],
    },
    content: {
      en: {
        subject: 'Bueno Newsletter 13',
        preview: 'Euribor passes 3%, sales slow while prices rise, and a guide to closing up your home for winter.',
        news: [
          { title: 'Euribor has climbed to its highest level in two years', body: 'The 12-month Euribor averaged 3.247% in September, up from 2.954% in August and 2.172% a year ago, according to preliminary Bank of Spain data. For a €150,000 variable mortgage over 30 years, that adds about €98 a month at the next review.' },
          { title: 'Fewer homes are selling, but prices keep rising', body: 'Notaries recorded 65,395 home sales in July, 11.1% fewer than a year earlier. Over the same period the average price rose 7.7% to €2,112 per square metre.' },
          { title: 'Renters are moving from the cities to cheaper towns nearby', body: 'Rents rose 5.8% in the year to August, according to idealista. In 27 of 50 provinces a town outside the capital now sees more demand than the capital itself, and seasonal lets make up 29% of homes for rent.' },
        ],
        guide: {
          title: 'Leaving Your Spanish Home for the Winter: What to Do Before You Lock the Door',
          intro: 'A home that sits closed for weeks or months needs a little preparation. Most of the expensive surprises owners find in spring start with something small that nobody was there to see. This guide walks you through the checks that matter, in the order that matters.',
          topics: [
            'The water and power checks that prevent the most expensive damage',
            'How to keep damp and pests out of a closed home',
            'Simple security steps that make an empty home look lived in',
            'The bills and payments to check before you fly',
            'The winter dates to keep in mind and what a missed bill costs',
          ],
        },
        region: {
          title: 'Murcia and the Costa Cálida in Focus',
          paras: [
            'Notaries recorded a 22.3% rise in prices in the Region of Murcia in July, while sales there fell only 3.7%, against 11.1% nationally. Asking prices on idealista reached €1,681 per square metre in August, up 13.8% on a year earlier.',
            'Murcia remains one of the more affordable stretches of the Mediterranean coast, and demand is holding up better than in most regions. If you own on the Mar Menor or along the coast towards Águilas, the market is still moving in your direction.',
          ],
        },
        question: {
          q: 'My town hall has sent me an IBI bill, but I am not back in Spain until spring. What happens if I miss the payment date?',
          paras: [
            'Nothing happens on the first day, but the cost starts to climb, so it is worth sorting out now.',
            'Every town hall sets a voluntary payment period for the IBI, the local property tax. Pay within it and you pay the bill as it is. Miss it, and a 5% surcharge is added if you pay in full before the town hall sends a formal demand. Once that demand arrives, the surcharge is 10% if you pay within the period it gives you, and 20% plus interest after that.',
            'Left unpaid, the debt can be collected from a Spanish account or registered against the property, and it stays with the home if you sell.',
            'Simple steps to stay safe: Ask your town hall, or the office that collects the IBI for it, to send notices to you electronically. Set up a direct debit so the bill is paid on time even while you are away. Check that the cadastral reference on the bill matches your property.',
            'A Bueno account gives you a Spanish IBAN for direct debits, and a multilingual team who can explain what any letter from the town hall actually says.',
          ],
        },
        survey: null,
      },
      no: {
        subject: 'Bueno Nyhetsbrev 13',
        preview: 'Euribor over 3 %, færre boligsalg mens prisene stiger, og en guide til å stenge boligen for vinteren.',
        news: [
          { title: 'Euribor har steget til det høyeste nivået på to år', body: '12-måneders Euribor var i snitt 3,247 % i september, opp fra 2,954 % i august og 2,172 % for ett år siden, ifølge foreløpige tall fra den spanske sentralbanken. For et boliglån med flytende rente på €150 000 over 30 år betyr det rundt €98 mer i måneden ved neste renteregulering.' },
          { title: 'Færre boliger blir solgt, men prisene fortsetter å stige', body: 'Notarene registrerte 65 395 boligsalg i juli, 11,1 % færre enn året før. I samme periode steg snittprisen med 7,7 % til €2 112 per kvadratmeter.' },
          { title: 'Leietakere flytter fra byene til billigere tettsteder i nærheten', body: 'Leieprisene steg 5,8 % i året frem til august, ifølge idealista. I 27 av 50 provinser er etterspørselen nå større i et tettsted utenfor provinshovedstaden enn i selve hovedstaden, og sesongutleie utgjør 29 % av boligene som leies ut.' },
        ],
        guide: {
          title: 'Når du forlater boligen i Spania for vinteren: Dette bør du gjøre før du låser døren',
          intro: 'En bolig som står stengt i uker eller måneder trenger litt forberedelse. De fleste dyre overraskelsene eiere finner om våren starter med noe lite som ingen var der og så. Guiden tar deg gjennom sjekkene som betyr noe, i riktig rekkefølge.',
          topics: [
            'Vann og strøm: sjekkene som hindrer de dyreste skadene',
            'Slik holder du fukt og skadedyr ute av en stengt bolig',
            'Enkle sikkerhetsgrep som får en tom bolig til å se bebodd ut',
            'Regningene og betalingene du bør sjekke før du reiser',
            'Vinterens viktige datoer, og hva en ubetalt regning koster',
          ],
        },
        region: {
          title: 'Murcia og Costa Cálida i fokus',
          paras: [
            'Notarene registrerte en prisøkning på 22,3 % i regionen Murcia i juli, mens salget der falt med bare 3,7 %, mot 11,1 % på landsbasis. Prisantydningene på idealista nådde €1 681 per kvadratmeter i august, 13,8 % høyere enn året før.',
            'Murcia er fortsatt en av de rimeligere delene av middelhavskysten, og etterspørselen holder seg bedre enn i de fleste regioner. Eier du ved Mar Menor eller langs kysten mot Águilas, går markedet fortsatt i eiers retning.',
          ],
        },
        question: {
          q: 'Kommunen har sendt meg en IBI-regning, men jeg er ikke tilbake i Spania før til våren. Hva skjer hvis jeg ikke betaler innen fristen?',
          paras: [
            'Ingenting skjer den første dagen, men kostnaden begynner å øke, så det lønner seg å ordne det nå.',
            'Hver kommune fastsetter en frivillig betalingsperiode for IBI, den lokale eiendomsskatten. Betaler du innenfor den, betaler du regningen slik den er. Går du glipp av den, kommer et tillegg på 5 % hvis du betaler hele beløpet før kommunen sender et formelt betalingskrav. Når kravet har kommet, er tillegget 10 % hvis du betaler innen fristen i kravet, og 20 % pluss renter etter det.',
            'Blir gjelden stående ubetalt, kan den inndrives fra en spansk konto eller tinglyses på eiendommen, og den følger boligen hvis du selger.',
            'Enkle grep for å være trygg: Be kommunen, eller kontoret som krever inn IBI for den, om å sende varsler elektronisk. Opprett avtalegiro slik at regningen betales i tide også mens du er borte. Sjekk at matrikkelnummeret på regningen stemmer med eiendommen din.',
            'En Bueno-konto gir deg et spansk IBAN-nummer for avtalegiro, og et flerspråklig team som kan forklare hva et brev fra kommunen faktisk sier.',
          ],
        },
        survey: null,
      },
      sv: {
        subject: 'Buenos nyhetsbrev 13',
        preview: 'Euribor över 3 %, färre försäljningar medan priserna stiger, och en guide till att stänga bostaden inför vintern.',
        news: [
          { title: 'Euribor har stigit till sin högsta nivå på två år', body: '12-månaders Euribor låg i genomsnitt på 3,247 % i september, upp från 2,954 % i augusti och 2,172 % för ett år sedan, enligt preliminära siffror från den spanska centralbanken. För ett bolån med rörlig ränta på €150 000 över 30 år innebär det ungefär €98 mer i månaden vid nästa ränteomräkning.' },
          { title: 'Färre bostäder säljs, men priserna fortsätter att stiga', body: 'Notarierna registrerade 65 395 bostadsförsäljningar i juli, 11,1 % färre än året innan. Under samma period steg genomsnittspriset med 7,7 % till €2 112 per kvadratmeter.' },
          { title: 'Hyresgäster flyttar från städerna till billigare orter i närheten', body: 'Hyrorna steg 5,8 % under året fram till augusti, enligt idealista. I 27 av 50 provinser är efterfrågan nu större i en ort utanför provinshuvudstaden än i själva huvudstaden, och säsongsuthyrning utgör 29 % av bostäderna som hyrs ut.' },
        ],
        guide: {
          title: 'När du lämnar din fastighet i Spanien över vintern: Det här bör du göra innan du låser dörren',
          intro: 'En bostad som står stängd i veckor eller månader behöver lite förberedelse. De flesta dyra överraskningar som ägare hittar på våren börjar med något litet som ingen var där och såg. Guiden tar dig igenom kontrollerna som spelar roll, i rätt ordning.',
          topics: [
            'Kontrollerna av vatten och el som förebygger de dyraste skadorna',
            'Så håller du fukt och skadedjur borta från en stängd bostad',
            'Enkla säkerhetsåtgärder som får en tom bostad att se bebodd ut',
            'Räkningarna och betalningarna du bör kontrollera innan du reser',
            'Vinterns viktiga datum och vad en obetald räkning kostar',
          ],
        },
        region: {
          title: 'Murcia och Costa Cálida i fokus',
          paras: [
            'Notarierna registrerade en prisökning på 22,3 % i regionen Murcia i juli, medan försäljningen där bara minskade med 3,7 %, jämfört med 11,1 % i hela landet. Utropspriserna på idealista nådde €1 681 per kvadratmeter i augusti, 13,8 % högre än året innan.',
            'Murcia är fortfarande en av de mer prisvärda delarna av Medelhavskusten, och efterfrågan håller i sig bättre än i de flesta regioner. Äger du vid Mar Menor eller längs kusten mot Águilas rör sig marknaden fortfarande åt ditt håll.',
          ],
        },
        question: {
          q: 'Kommunen har skickat mig en IBI-räkning, men jag kommer inte tillbaka till Spanien förrän i vår. Vad händer om jag missar betalningsdagen?',
          paras: [
            'Ingenting händer den första dagen, men kostnaden börjar öka, så det lönar sig att ordna det nu.',
            'Varje kommun bestämmer en frivillig betalningsperiod för IBI, den lokala fastighetsskatten. Betalar du inom den betalar du räkningen som den är. Missar du den tillkommer 5 % om du betalar hela beloppet innan kommunen skickar ett formellt betalningskrav. När kravet har kommit är tillägget 10 % om du betalar inom den tid som anges i kravet, och 20 % plus ränta efter det.',
            'Lämnas skulden obetald kan den drivas in från ett spanskt konto eller registreras mot fastigheten, och den följer med bostaden om du säljer.',
            'Enkla sätt att vara på den säkra sidan: Be kommunen, eller kontoret som tar in IBI åt den, att skicka meddelanden elektroniskt. Lägg upp autogiro så att räkningen betalas i tid även när du är borta. Kontrollera att fastighetsbeteckningen på räkningen stämmer med din fastighet.',
            'Ett Bueno-konto ger dig ett spanskt IBAN för autogiro, och ett flerspråkigt team som kan förklara vad ett brev från kommunen faktiskt säger.',
          ],
        },
        survey: null,
      },
    },
    guide_url: guideUrls('Closing-Up-Your-Spanish-Home-For-Winter'),
  },

  // ---------------------------------------------------------------------------------------
  {
    key: 'nl-14',
    number: 14,
    send_date: '2026-10-22',
    alert_date: '2026-10-16',
    news_status: 'to_refresh',
    guide: 'non-resident-property-tax',
    region: 'canary-islands',
    reader_topic: 'co-owners-modelo-210',
    sources: {
      news: [],
      region: [
        'https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/canarias/',
        'https://www.idealista.com/news/inmobiliario/vivienda/2026/09/30/916382-las-compraventas-de-viviendas-caen-a-doble-digito-en-julio-mientras-los-precios',
      ],
      question: ['Bueno guide: Non-resident property tax in Spain (Sep 2026), section 02'],
    },
    content: {
      en: {
        subject: 'Bueno Newsletter 14',
        preview: 'This fortnight in Spanish property, your Modelo 210 explained, and the Canary Islands in focus.',
        news: PENDING_NEWS.en,
        guide: {
          title: 'Non-Resident Property Tax in Spain: What to File, When and How Much',
          intro: 'If you own a home in Spain but live somewhere else, Spain asks you to file a short tax return for it every year. It is called the Modelo 210, and for homes that are not rented out, this year’s deadline is 31 December. This guide shows you exactly what applies to you.',
          topics: [
            'Which of the five owner situations applies to you',
            'How the tax is worked out from the cadastral value',
            'A worked example with real numbers',
            'What changes if you rent your home out',
            'The three dates to keep in mind and what late filing costs',
          ],
        },
        region: {
          title: 'The Canary Islands in Focus',
          paras: [
            'Asking prices across the Canary Islands reached €3,336 per square metre in August, up 6.7% on a year earlier, according to idealista. Las Palmas rose fastest, by 11.0% to €3,105, while Santa Cruz de Tenerife rose 3.9% to €3,500.',
            'Prices eased 0.6% in August after a record in June, a pause rather than a turn. For owners on the islands, values remain well above where they were a year ago.',
          ],
        },
        question: {
          q: 'My wife and I own our apartment together. Do we file one Modelo 210 or two?',
          paras: [
            'Two. In Spain each owner is taxed on their own share, so each of you files your own return.',
            'If you own half each, you each declare half of the property and pay half of the tax. A couple who owe €174.75 between them would pay about €87 each. The same applies if there are more owners, or if the shares are not equal.',
            'This also means each owner needs their own NIE, and each return has its own deadline. For a home that is not rented out, that is 31 December, or 23 December if you want to pay by direct debit.',
            'Simple steps to stay safe: Check the ownership shares on your deeds. File both returns at the same time so neither is forgotten. Keep a copy of each one.',
            'Bueno can file the Modelo 210 for every owner of a property, in your language, and pay it from your Spanish IBAN account.',
          ],
        },
        survey: null,
      },
      no: {
        subject: 'Bueno Nyhetsbrev 14',
        preview: 'Siste nytt fra eiendomsmarkedet i Spania, Modelo 210 forklart, og Kanariøyene i fokus.',
        news: PENDING_NEWS.no,
        guide: {
          title: 'Eiendomsskatt for ikke-residenter i Spania: Hva du skal levere, når og hvor mye',
          intro: 'Eier du bolig i Spania, men bor et annet sted, må du levere en spansk selvangivelse for boligen hvert år. Den heter Modelo 210, og for boliger som ikke leies ut er årets frist 31. desember. Guiden viser deg nøyaktig hva som gjelder for deg.',
          topics: [
            'Hvilken av de fem eiersituasjonene som gjelder deg',
            'Hvordan skatten beregnes ut fra matrikkelverdien',
            'Et regneeksempel med ekte tall',
            'Hva som endrer seg hvis du leier ut boligen',
            'De tre datoene du bør huske, og hva for sen levering koster',
          ],
        },
        region: {
          title: 'Kanariøyene i fokus',
          paras: [
            'Prisantydningene på Kanariøyene nådde €3 336 per kvadratmeter i august, 6,7 % høyere enn året før, ifølge idealista. Las Palmas steg mest, med 11,0 % til €3 105, mens Santa Cruz de Tenerife steg 3,9 % til €3 500.',
            'Prisene falt 0,6 % i august etter en rekord i juni, en pause snarere enn en vending. For eiere på øyene ligger verdiene fortsatt godt over nivået for ett år siden.',
          ],
        },
        question: {
          q: 'Kona mi og jeg eier leiligheten sammen. Leverer vi én Modelo 210 eller to?',
          paras: [
            'To. I Spania skattlegges hver eier for sin egen andel, så hver av dere leverer sin egen selvangivelse.',
            'Eier dere halvparten hver, oppgir hver av dere halve eiendommen og betaler halve skatten. Et par som til sammen skal betale €174,75, betaler omtrent €87 hver. Det samme gjelder hvis det er flere eiere, eller hvis andelene er ulike.',
            'Det betyr også at hver eier trenger sitt eget NIE, og at hver selvangivelse har sin egen frist. For en bolig som ikke leies ut er det 31. desember, eller 23. desember hvis du vil betale med trekk fra kontoen.',
            'Enkle grep for å være trygg: Sjekk eierandelene i skjøtet. Lever begge selvangivelsene samtidig, så ingen blir glemt. Ta vare på en kopi av hver.',
            'Bueno kan levere Modelo 210 for alle eierne av en eiendom, på norsk, og betale skatten fra den spanske IBAN-kontoen din.',
          ],
        },
        survey: null,
      },
      sv: {
        subject: 'Buenos nyhetsbrev 14',
        preview: 'Det senaste från den spanska fastighetsmarknaden, Modelo 210 förklarad, och Kanarieöarna i fokus.',
        news: PENDING_NEWS.sv,
        guide: {
          title: 'Fastighetsskatt för icke-residenter i Spanien: Vad du ska deklarera, när och hur mycket',
          intro: 'Äger du en fastighet i Spanien men bor någon annanstans behöver du lämna en kort spansk deklaration för den varje år. Den heter Modelo 210, och för fastigheter som inte hyrs ut är årets deadline den 31 december. Guiden visar exakt vad som gäller för dig.',
          topics: [
            'Vilken av de fem ägarsituationerna som gäller dig',
            'Hur skatten räknas ut från taxeringsvärdet',
            'Ett räkneexempel med verkliga siffror',
            'Vad som ändras om du hyr ut din fastighet',
            'De tre datumen att hålla koll på och vad sen deklaration kostar',
          ],
        },
        region: {
          title: 'Kanarieöarna i fokus',
          paras: [
            'Utropspriserna på Kanarieöarna nådde €3 336 per kvadratmeter i augusti, 6,7 % högre än året innan, enligt idealista. Las Palmas steg mest, med 11,0 % till €3 105, medan Santa Cruz de Tenerife steg 3,9 % till €3 500.',
            'Priserna sjönk 0,6 % i augusti efter ett rekord i juni, en paus snarare än en vändning. För ägare på öarna ligger värdena fortfarande klart över nivån för ett år sedan.',
          ],
        },
        question: {
          q: 'Min fru och jag äger lägenheten tillsammans. Lämnar vi en Modelo 210 eller två?',
          paras: [
            'Två. I Spanien beskattas varje ägare för sin egen andel, så ni lämnar var sin deklaration.',
            'Äger ni hälften var deklarerar ni hälften av fastigheten och betalar hälften av skatten var. Ett par som tillsammans ska betala €174,75 betalar ungefär €87 var. Detsamma gäller om det finns fler ägare eller om andelarna är olika.',
            'Det innebär också att varje ägare behöver ett eget NIE, och att varje deklaration har sin egen deadline. För en fastighet som inte hyrs ut är det den 31 december, eller den 23 december om du vill betala via autogiro.',
            'Enkla sätt att vara på den säkra sidan: Kontrollera ägarandelarna i köpebrevet. Lämna båda deklarationerna samtidigt så att ingen glöms bort. Spara en kopia av varje.',
            'Bueno kan lämna Modelo 210 för alla ägare av en fastighet, på svenska, och betala skatten från ditt spanska IBAN-konto.',
          ],
        },
        survey: null,
      },
    },
    guide_url: guideUrls('Non-Resident-Property-Tax-Spain-2026'),
  },

  // ---------------------------------------------------------------------------------------
  // Issues 15 to 17: guides, regions and reader questions researched 1 Oct 2026.
  {
    "key": "nl-15",
    "number": 15,
    "send_date": "2026-11-05",
    "alert_date": "2026-10-30",
    "news_status": "to_refresh",
    "guide": "electricity-bills",
    "region": "balearic-islands",
    "reader_topic": "empty-home-high-electricity-bill",
    "sources": {
      "news": [],
      "region": [
        "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/baleares/",
        "https://www.idealista.com/news/inmobiliario/vivienda/2026/09/02/912069-el-precio-de-la-vivienda-acumula-20-meses-de-subidas-anuales-a-doble-digito-tras-el",
        "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736152838&menu=ultiDatos&idp=1254735976607",
        "https://www.menorca.info/balears/noticias/2026/09/07/2703481/precio-vivienda-baleares-sube-segundo-trimestre.html"
      ],
      "question": [
        "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-26348",
        "https://sede.agenciatributaria.gob.es/Sede/impuestos-especiales-medioambientales/impuesto-especial-sobre-electricidad/liquidacion-pago-impuesto/tipo-impositivo.html",
        "https://www.repsol.es/particulares/asesoramiento-consumo/subida-iva-luz-como-me-afecta/",
        "https://www.rankia.com/blog/luz-y-gas/7481645-cuanto-cuesta-subir-potencia-luz"
      ],
      "guide": [
        "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-26348",
        "https://sede.agenciatributaria.gob.es/Sede/impuestos-especiales-medioambientales/impuesto-especial-sobre-electricidad/liquidacion-pago-impuesto/tipo-impositivo.html",
        "https://www.repsol.es/particulares/asesoramiento-consumo/subida-iva-luz-como-me-afecta/",
        "https://www.repsol.es/particulares/asesoramiento-consumo/impuesto-electricidad-que-es-como-se-paga/",
        "https://www.hacienda.gob.es/en-GB/Prensa/Noticias/paginas/2026/20260929-np-cm-medidas-fiscales.aspx",
        "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/presidencia/Paginas/2026/290926-decreto-crisis-oriente-medio.aspx",
        "https://www.que.es/2026/08/28/subida-luz-agosto-2026-iva/",
        "https://eleiaenergia.com/tarifas-electricas-2-0td-tramos-horarios-y-potencias/",
        "https://okdiario.com/economia/tu-tarifa-regulada-luz-cambia-2026-que-significa-nuevo-pvpc-que-sera-menos-volatil-16071759",
        "https://www.rankia.com/blog/luz-y-gas/7481645-cuanto-cuesta-subir-potencia-luz",
        "https://lucera.es/blog/comprar-contador-de-luz",
        "https://www.miteco.gob.es/en/energia/energia-electrica/electricidad/contratacion-suministro/cambios-suministrador.html",
        "https://www.miteco.gob.es/en/energia/energia-electrica/electricidad/contratacion-suministro/cortes-suministro.html"
      ]
    },
    "content": {
      "en": {
        "subject": "Bueno Newsletter 15",
        "preview": "Why an empty holiday home still gets an electricity bill, and how to read yours with confidence.",
        "guide": {
          "title": "Your Electricity Bill in Spain, Explained: What You Pay For and How to Keep It Under Control",
          "intro": "A Spanish electricity bill is built from the same few parts every month, and once you know them it takes a minute to check. This guide explains each line, the time bands and the choice between the regulated tariff and free-market offers. It also shows how to size the contract of a holiday home and keep every bill paid while you are away.",
          "topics": [
            "The five parts of every Spanish electricity bill",
            "Peak, standard and off-peak hours on the 2.0TD tariff",
            "The regulated PVPC tariff compared with free-market offers",
            "How to size the contracted power of a holiday home",
            "Reading the bill, switching supplier and paying by direct debit"
          ]
        },
        "region": {
          "title": "The Balearic Islands in Focus",
          "paras": [
            "The Balearic Islands remain the most expensive region in Spain to buy a home. According to idealista, asking prices reached €5,595 per m² in August 2026, which is 5.1% more than a year earlier. The Community of Madrid follows at €5,059 per m².",
            "Official figures based on completed sales show a stronger rise. The INE housing price index for the islands was 13.7% higher in the second quarter of 2026 than a year before, compared with 12.2% for Spain as a whole. Resale homes rose by 14.9%, while new homes rose by 3%."
          ]
        },
        "question": {
          "q": "My electricity bill is high even though nobody was in the house for three months. Why?",
          "paras": [
            "Part of every Spanish electricity bill is fixed. You pay for your contracted power every day, whether anyone is in the home or not, and tax, meter rental and VAT are added on top.",
            "The power term is charged per kilowatt for each day of the billing period. On a contract sized for a family living there all year, it can be the largest line on the bill of an empty home. The electricity tax of about 5.11% and 21% VAT then apply to it as well.",
            "The rest usually comes from appliances that keep running, such as a water heater, a fridge, a pool pump or devices on standby. It is also worth checking whether earlier bills used estimated readings, because a real reading later corrects the difference in one bill.",
            "Simple steps to stay safe: First, check the highest demand your smart meter has recorded and ask to lower your contracted power if it is far above what you use. Second, switch off the water heater and anything you do not need before you leave. Third, check the readings on each bill and make sure they are real, not estimated.",
            "A Bueno account gives you a Spanish IBAN to pay your electricity by direct debit, and Bueno Energy can help you review your contract, so every bill stays easy to follow from wherever you are."
          ]
        },
        "survey": null,
        "news": PENDING_NEWS.en
      },
      "no": {
        "subject": "Bueno Nyhetsbrev 15",
        "preview": "Hvorfor en tom feriebolig likevel får strømregning, og hvordan du leser din med trygghet.",
        "guide": {
          "title": "Strømregningen i Spania, forklart: Hva du betaler for og hvordan du holder den under kontroll",
          "intro": "En spansk strømregning består av de samme få delene hver måned, og når du kjenner dem, tar det et minutt å sjekke den. Denne guiden forklarer hver linje, tidsperiodene og valget mellom den regulerte tariffen og tilbud i det frie markedet. Den viser også hvordan du tilpasser avtalen for en feriebolig og holder regningene betalt mens du er borte.",
          "topics": [
            "De fem delene i hver spansk strømregning",
            "Dyre, middels og billige timer på 2.0TD-tariffen",
            "Den regulerte PVPC-tariffen sammenlignet med tilbud i det frie markedet",
            "Slik tilpasser du effekten i avtalen til en feriebolig",
            "Slik leser du regningen, bytter leverandør og betaler med trekk fra kontoen"
          ]
        },
        "region": {
          "title": "Balearene i fokus",
          "paras": [
            "Balearene er fortsatt den dyreste regionen i Spania å kjøpe bolig i. Ifølge idealista lå prisantydningen på €5 595 per m² i august 2026, som er 5,1 % mer enn ett år tidligere. Madrid-regionen følger med €5 059 per m².",
            "Offisielle tall basert på gjennomførte salg viser en sterkere økning. INEs boligprisindeks for øyene var 13,7 % høyere i andre kvartal 2026 enn året før, mot 12,2 % for Spania samlet. Brukte boliger steg med 14,9 %, mens nye boliger steg med 3 %."
          ]
        },
        "question": {
          "q": "Strømregningen min er høy selv om ingen har vært i huset på tre måneder. Hvorfor?",
          "paras": [
            "En del av hver spansk strømregning er fast. Du betaler for effekten i avtalen hver dag, uansett om noen er i boligen, og elavgift, leie av måler og merverdiavgift kommer i tillegg.",
            "Effektleddet beregnes per kilowatt for hver dag i faktureringsperioden. Med en avtale tilpasset en familie som bor der hele året, kan det være den største linjen på regningen for en tom bolig. Elavgiften på omtrent 5,11 % og 21 % merverdiavgift kommer i tillegg også på dette beløpet.",
            "Resten kommer som regel fra apparater som fortsetter å gå, som varmtvannsbereder, kjøleskap, bassengpumpe eller utstyr i hvilemodus. Det er også lurt å sjekke om tidligere regninger brukte estimerte avlesninger, fordi en faktisk avlesning senere retter opp differansen på én regning.",
            "Enkle steg for å være trygg: Først bør du sjekke det høyeste effektuttaket den smarte måleren har registrert, og be om lavere effekt hvis den ligger langt over det du bruker. Deretter slår du av varmtvannsberederen og alt du ikke trenger før du reiser. Til slutt sjekker du avlesningene på hver regning og ser at de er faktiske, ikke estimerte.",
            "En Bueno-konto gir deg et spansk IBAN-nummer for å betale strømmen med trekk fra kontoen, og Bueno Energy kan hjelpe deg med å gå gjennom avtalen, slik at hver regning er enkel å følge uansett hvor du er."
          ]
        },
        "survey": null,
        "news": PENDING_NEWS.no
      },
      "sv": {
        "subject": "Buenos nyhetsbrev 15",
        "preview": "Varför ett tomt fritidshus ändå får en elräkning, och hur du läser din med trygghet.",
        "guide": {
          "title": "Elräkningen i Spanien, förklarad: Vad du betalar för och hur du håller den under kontroll",
          "intro": "En spansk elräkning består av samma få delar varje månad, och när du känner till dem tar det en minut att kontrollera den. Den här guiden förklarar varje rad, tidsperioderna och valet mellan den reglerade tariffen och erbjudanden på den fria marknaden. Den visar också hur du anpassar avtalet för ett fritidshus och håller räkningarna betalda medan du är borta.",
          "topics": [
            "De fem delarna i varje spansk elräkning",
            "Dyra, mellan och billiga timmar på 2.0TD-tariffen",
            "Den reglerade PVPC-tariffen jämfört med erbjudanden på den fria marknaden",
            "Så anpassar du den avtalade effekten för ett fritidshus",
            "Så läser du räkningen, byter elhandlare och betalar via autogiro"
          ]
        },
        "region": {
          "title": "Balearerna i fokus",
          "paras": [
            "Balearerna är fortfarande den dyraste regionen i Spanien att köpa bostad i. Enligt idealista låg utgångspriserna på €5 595 per m² i augusti 2026, vilket är 5,1 % mer än ett år tidigare. Madridregionen följer med €5 059 per m².",
            "Officiella siffror baserade på genomförda försäljningar visar en kraftigare ökning. INE:s bostadsprisindex för öarna var 13,7 % högre under andra kvartalet 2026 än året innan, jämfört med 12,2 % för Spanien som helhet. Begagnade bostäder steg med 14,9 %, medan nyproduktion steg med 3 %."
          ]
        },
        "question": {
          "q": "Min elräkning är hög trots att ingen har varit i huset på tre månader. Varför?",
          "paras": [
            "En del av varje spansk elräkning är fast. Du betalar för den avtalade effekten varje dag, oavsett om någon är i bostaden, och elskatt, mätarhyra och moms läggs till.",
            "Effektavgiften tas ut per kilowatt för varje dag i faktureringsperioden. Med ett avtal anpassat för en familj som bor där hela året kan den vara den största raden på räkningen för en tom fastighet. Elskatten på ungefär 5,11 % och 21 % moms läggs också på det beloppet.",
            "Resten kommer oftast från apparater som fortsätter att gå, som varmvattenberedare, kylskåp, poolpump eller utrustning i viloläge. Det är också värt att kontrollera om tidigare räkningar byggde på uppskattade mätarställningar, eftersom en verklig avläsning senare rättar skillnaden på en enda räkning.",
            "Enkla steg för att vara trygg: Kontrollera först det högsta effektuttaget som den smarta mätaren har registrerat och be om lägre effekt om den ligger långt över vad du använder. Stäng sedan av varmvattenberedaren och allt du inte behöver innan du åker. Kontrollera till sist mätarställningarna på varje räkning och se att de är verkliga, inte uppskattade.",
            "Ett Bueno-konto ger dig ett spanskt IBAN för att betala elen via autogiro, och Bueno Energy kan hjälpa dig att se över ditt avtal, så att varje räkning är lätt att följa var du än befinner dig."
          ]
        },
        "survey": null,
        "news": PENDING_NEWS.sv
      }
    },
    "guide_url": guideUrls('Electricity-Bills-In-Spain')
  },
  {
    "key": "nl-16",
    "number": 16,
    "send_date": "2026-11-19",
    "alert_date": "2026-11-13",
    "news_status": "to_refresh",
    "guide": "renting-out-legally",
    "region": "valencia",
    "reader_topic": "declaring-summer-lets",
    "sources": {
      "news": [],
      "region": [
        "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/comunitat-valenciana/",
        "https://www.idealista.com/news/inmobiliario/vivienda/2026/08/06/909350-el-precio-de-la-vivienda-en-valencia-ya-alcanza-los-3-485-euros-m2-en-julio-de-2026",
        "https://www.merca2.es/2026/09/08/precio-vivienda-valencia-3469-idealista-2450225/",
        "https://valenciaplaza.com/valenciaplaza/valencia/valencia-impone-138-sanciones-por-mas-de-15-millones-a-apartamentos-turisticos-ilegales"
      ],
      "question": [
        "https://sede.agenciatributaria.gob.es/Sede/no-residentes/irnr-sin-establecimiento-permanente/cuestiones-especificas-sobre-tributacion-inmuebles/rendimientos-inmuebles-arrendados.html",
        "https://sede.agenciatributaria.gob.es/Sede/no-residentes/irnr-sin-establecimiento-permanente/declaracion-irnr-sin-establecimiento-permanente/modelo-plazo-declaracion.html",
        "https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-renta-no-residentes/modelo-210-irnr______a-no-residentes-permanente_/nota-modificaciones-plazos-presentacion-modelo-210.html",
        "https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/declaraciones-informativas/modelo-238-decl_____informacion-parte-operadores-plataformas/preguntas-frecuentes/dac-7-informacion-vendedores.html"
      ],
      "guide": [
        "https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906",
        "https://www.navarroselfaabogados.es/2025/09/03/regimen-legal-del-alquiler-turistico-en-las-comunidades-de-propietarios-tras-la-ley-organica-1-2025/",
        "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17461",
        "https://www.idealista.com/news/inmobiliario/vivienda/2026/05/21/898563-el-supremo-tumba-el-registro-unico-de-alquiler-de-corta-duracion-por-invadir",
        "https://www.hayderecho.com/2026/07/01/anulacion-tribunal-supremo-registro-unico-de-arrendamientos/",
        "https://www.cuatrecasas.com/es/spain/inmobiliario/art/arrendamientos-corta-duracion-numero-registro",
        "https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Oficina-de-Comunicacion/Notas-de-prensa/El-Tribunal-Supremo-anula-el-Registro-Unico-de-arrendamientos-de-corta-duracion-por-considerar-que-el-Estado-carece-de-competencia-para-su-creacion",
        "https://eur-lex.europa.eu/eli/reg/2024/1028/oj/eng",
        "https://ga-p.com/publicaciones/las-principales-modificaciones-que-trae-consigo-el-decreto-ley-9-2024-del-consell-respecto-a-las-viviendas-de-uso-turistico-en-la-comunidad-valenciana/",
        "https://www.devesa.law/me-pueden-sancionar-comercializar-vivienda-uso-turistico-sin-estar-inscrita-correspondiente-registro-ambito-la-comunidad-valenciana/",
        "https://valenciaplaza.com/valenciaplaza/valencia/valencia-impone-138-sanciones-por-mas-de-15-millones-a-apartamentos-turisticos-ilegales",
        "https://sede.agenciatributaria.gob.es/Sede/no-residentes/irnr-sin-establecimiento-permanente/cuestiones-especificas-sobre-tributacion-inmuebles/rendimientos-inmuebles-arrendados.html",
        "https://sede.agenciatributaria.gob.es/Sede/vivienda-otros-inmuebles/tributacion-arrendador-viviendas-otros-inmuebles/tributacion-alquiler-apartamentos-turisticos/impuesto-sobre-renta-no-residentes.html",
        "https://sede.agenciatributaria.gob.es/Sede/no-residentes/irnr-sin-establecimiento-permanente/declaracion-irnr-sin-establecimiento-permanente/modelo-plazo-declaracion.html",
        "https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-renta-no-residentes/modelo-210-irnr______a-no-residentes-permanente_/nota-modificaciones-plazos-presentacion-modelo-210.html",
        "https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/declaraciones-informativas/modelo-238-decl_____informacion-parte-operadores-plataformas/preguntas-frecuentes/dac-7-informacion-vendedores.html",
        "https://www.lamoncloa.gob.es/consejodeministros/resumenes/Paginas/2026/290926-rueda-prensa-ministros.aspx",
        "https://www.ultimahora.es/noticias/local/2026/09/30/2719267/gobierno-impone-iva-del-pisos-turisticos-recargos-ibi.html",
        "https://www.elindependiente.com/economia/2026/09/29/subidas-alquiler-medidas-decreto-vivienda/",
        "https://www.idealista.com/news/finanzas/economia/2026/09/29/916383-el-gobierno-acuerda-proteger-los-desahucios-hasta-2030-y-prohibir-la-compra-por-fondos"
      ]
    },
    "content": {
      "en": {
        "subject": "Bueno Newsletter 16",
        "preview": "How to let your Spanish home legally, what Valencia's prices are doing, and how summer lets are taxed.",
        "guide": {
          "title": "Renting Out Your Spanish Home Legally: Licences, Neighbours and Tax",
          "intro": "Letting your Spanish home can cover its costs, but the rules come from your region, your community of owners and the tax office at the same time. This guide explains each one as it stands in October 2026, including what changed after the Supreme Court annulled the national rental register.",
          "topics": [
            "The difference between tourist, seasonal and long-term lets",
            "Your regional tourist licence and what happened to the national register",
            "What your community of owners can decide, and how to register guests",
            "How non-residents are taxed on rental income through the Modelo 210",
            "The April filing dates and verified examples of fines"
          ]
        },
        "region": {
          "title": "Valencia in Focus",
          "paras": [
            "Valencia city is now one of Spain's most expensive housing markets. According to idealista, homes in the city were offered at an average of €3,469 per m² in August 2026, 6.1% more than a year earlier and close to the record of €3,485 per m². Across the province the average was €2,207 per m², up 17.1% in a year, the fastest rise of the three Valencian provinces.",
            "The city is also enforcing its tourist letting rules. Valencia City Council has imposed 138 fines, worth more than €1.5 million, on tourist homes that did not meet the legal requirements in the 18 months since March 2025. For owners who let, a valid regional registration is the first thing to check."
          ]
        },
        "question": {
          "q": "I let my apartment in Spain for a few weeks each summer, and I already report the income at home. Do I need to declare it in Spain as well?",
          "paras": [
            "Yes. Rent from a home in Spain is taxed in Spain, even when you also report it in the country where you live.",
            "As a non-resident, you declare the rent on the Modelo 210. If you live in the EU or the EEA, which includes Norway and Sweden, you pay 19% on the net income. You can deduct costs such as IBI, community fees, insurance, utilities and repairs, in proportion to the days the home was let.",
            "The return for a whole year's rent is filed once, between 1 and 20 April of the following year, so income from summer 2026 is declared in April 2027. For the days your home was not let, a separate return for imputed income is due between 1 April and 31 December.",
            "Booking platforms report what they paid you, for which property and for how many days, and that information is shared with your home country. Your home tax office decides how the Spanish tax is taken into account, so keep your Spanish return and proof of payment.",
            "Simple steps to stay safe: Keep every invoice for the home's running costs, note the exact nights you let each year, and file your Modelo 210 between 1 and 20 April.",
            "Bueno can file your Modelo 210 for rental income from €50, and the Bueno Account gives you a Spanish IBAN where the rent arrives and the bills are paid."
          ]
        },
        "survey": null,
        "news": PENDING_NEWS.en
      },
      "no": {
        "subject": "Bueno Nyhetsbrev 16",
        "preview": "Slik leier du ut boligen i Spania lovlig, hva som skjer med prisene i Valencia, og hvordan sommerutleie skattlegges.",
        "guide": {
          "title": "Slik leier du ut boligen i Spania lovlig: lisens, naboer og skatt",
          "intro": "Utleie av boligen i Spania kan dekke kostnadene, men reglene kommer fra regionen, sameiet og skattekontoret på samme tid. Denne guiden forklarer hver av dem slik de står i oktober 2026, også hva som endret seg etter at Høyesterett opphevet det nasjonale utleieregisteret.",
          "topics": [
            "Forskjellen mellom turistutleie, sesongutleie og langtidsutleie",
            "Den regionale turistlisensen og hva som skjedde med det nasjonale registeret",
            "Hva sameiet kan bestemme, og hvordan du registrerer gjester",
            "Hvordan ikke-residenter skattlegges for leieinntekter gjennom Modelo 210",
            "Fristene i april og bekreftede eksempler på bøter"
          ]
        },
        "region": {
          "title": "Valencia i fokus",
          "paras": [
            "Valencia by er nå et av Spanias dyreste boligmarkeder. Ifølge idealista ble boliger i byen tilbudt til i snitt €3 469 per m² i august 2026, 6,1 % mer enn året før og nær rekorden på €3 485 per m². I provinsen som helhet var snittet €2 207 per m², opp 17,1 % på ett år, den største økningen av de tre provinsene i Valencia-regionen.",
            "Byen håndhever også reglene for turistutleie. Bystyret i Valencia har ilagt 138 bøter, til sammen over €1,5 millioner, mot turistboliger som ikke oppfylte lovkravene i de 18 månedene siden mars 2025. For eiere som leier ut, er en gyldig regional registrering det første du bør sjekke."
          ]
        },
        "question": {
          "q": "Jeg leier ut leiligheten min i Spania noen uker hver sommer, og jeg oppgir allerede inntekten hjemme. Må jeg oppgi den i Spania også?",
          "paras": [
            "Ja. Leie fra en bolig i Spania skattlegges i Spania, også når du oppgir den i landet der du bor.",
            "Som ikke-resident oppgir du leien på Modelo 210. Bor du i EU eller EØS, som omfatter Norge, betaler du 19 % av nettoinntekten. Du kan trekke fra kostnader som IBI, fellesutgifter, forsikring, strøm, vann og reparasjoner, i forhold til antall dager boligen var utleid.",
            "Oppgaven for et helt års leie leveres én gang, mellom 1. og 20. april året etter, så inntekter fra sommeren 2026 oppgis i april 2027. For dagene boligen ikke var utleid, leveres en egen selvangivelse for beregnet inntekt mellom 1. april og 31. desember.",
            "Bookingplattformene rapporterer hva de har betalt deg, for hvilken eiendom og for hvor mange dager, og opplysningene deles med hjemlandet ditt. Skattekontoret hjemme avgjør hvordan den spanske skatten tas hensyn til, så ta vare på den spanske oppgaven og betalingsbekreftelsen.",
            "Enkle steg for å være trygg: Ta vare på alle fakturaer for driften av boligen, noter nøyaktig hvilke netter du leier ut hvert år, og lever Modelo 210 mellom 1. og 20. april.",
            "Bueno kan levere din Modelo 210 for leieinntekter fra €50, og Bueno-kontoen gir deg et spansk IBAN der leien kommer inn og regningene betales."
          ]
        },
        "survey": null,
        "news": PENDING_NEWS.no
      },
      "sv": {
        "subject": "Buenos nyhetsbrev 16",
        "preview": "Så hyr du ut din fastighet i Spanien lagligt, vad som händer med priserna i Valencia och hur sommaruthyrning beskattas.",
        "guide": {
          "title": "Så hyr du ut din fastighet i Spanien lagligt: tillstånd, grannar och skatt",
          "intro": "Att hyra ut din fastighet i Spanien kan täcka kostnaderna, men reglerna kommer från regionen, samfälligheten och skattemyndigheten på samma gång. Den här guiden förklarar var och en så som de ser ut i oktober 2026, även vad som ändrades när Högsta domstolen upphävde det nationella uthyrningsregistret.",
          "topics": [
            "Skillnaden mellan turistuthyrning, säsongsuthyrning och långtidsuthyrning",
            "Ditt regionala turisttillstånd och vad som hände med det nationella registret",
            "Vad samfälligheten kan besluta och hur du registrerar gäster",
            "Hur icke-residenter beskattas för hyresintäkter via Modelo 210",
            "Datumen i april och bekräftade exempel på böter"
          ]
        },
        "region": {
          "title": "Valencia i fokus",
          "paras": [
            "Staden Valencia är nu en av Spaniens dyraste bostadsmarknader. Enligt idealista utbjöds bostäder i staden för i snitt €3 469 per m² i augusti 2026, 6,1 % mer än ett år tidigare och nära rekordet på €3 485 per m². I provinsen som helhet var snittet €2 207 per m², upp 17,1 % på ett år, den största ökningen av de tre provinserna i Valenciaregionen.",
            "Staden upprätthåller också reglerna för turistuthyrning. Valencias kommun har utfärdat 138 böter, till ett värde av över €1,5 miljoner, mot turistbostäder som inte uppfyllde lagkraven under de 18 månaderna sedan mars 2025. För fastighetsägare som hyr ut är en giltig regional registrering det första att kontrollera."
          ]
        },
        "question": {
          "q": "Jag hyr ut min lägenhet i Spanien några veckor varje sommar och redovisar redan intäkten hemma. Måste jag deklarera den i Spanien också?",
          "paras": [
            "Ja. Hyra från en fastighet i Spanien beskattas i Spanien, även när du också redovisar den i landet där du bor.",
            "Som icke-resident deklarerar du hyran på Modelo 210. Bor du i EU eller EES, som omfattar Sverige, betalar du 19 % på nettointäkten. Du får dra av kostnader som IBI, samfällighetsavgifter, försäkring, el, vatten och reparationer, i proportion till antalet dagar fastigheten var uthyrd.",
            "Deklarationen för ett helt års hyresintäkt lämnas en gång, mellan den 1 och 20 april året därpå, så intäkter från sommaren 2026 deklareras i april 2027. För de dagar fastigheten inte var uthyrd lämnas en separat deklaration med schablonintäkt mellan den 1 april och 31 december.",
            "Bokningsplattformarna rapporterar vad de har betalat dig, för vilken fastighet och för hur många dagar, och uppgifterna delas med ditt hemland. Skatteverket avgör hur den spanska skatten räknas in, så spara den spanska deklarationen och betalningsbeviset.",
            "Enkla steg för att vara på den säkra sidan: Spara alla fakturor för fastighetens driftskostnader, anteckna exakt vilka nätter du hyr ut varje år och lämna din Modelo 210 mellan den 1 och 20 april.",
            "Bueno kan lämna din Modelo 210 för hyresintäkter från €50, och Bueno-kontot ger dig ett spanskt IBAN där hyran kommer in och räkningarna betalas."
          ]
        },
        "survey": null,
        "news": PENDING_NEWS.sv
      }
    },
    "guide_url": guideUrls('Renting-Out-Your-Spanish-Home-Legally')
  },
  {
    "key": "nl-17",
    "number": 17,
    "send_date": "2026-12-03",
    "alert_date": "2026-11-27",
    "news_status": "to_refresh",
    "guide": "owner-calendar",
    "region": "almeria",
    "reader_topic": "january-to-do",
    "sources": {
      "news": [],
      "region": [
        "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/andalucia/almeria-provincia/",
        "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/almeria-provincia/"
      ],
      "question": [
        "Real Decreto Legislativo 2/2004 (TRLRHL), art. 75: https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214",
        "Orden HAC/623/2026, de 12 de junio (BOE 23 June 2026): https://www.boe.es/buscar/doc.php?id=BOE-A-2026-13573",
        "https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-renta-no-residentes/modelo-210-irnr______a-no-residentes-permanente_/nota-modificaciones-plazos-presentacion-modelo-210.html",
        "Ley 50/1980 de Contrato de Seguro, art. 22: https://www.boe.es/buscar/act.php?id=BOE-A-1980-22501"
      ],
      "guide": [
        "https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-renta-no-residentes/modelo-210-irnr______a-no-residentes-permanente_/nota-modificaciones-plazos-presentacion-modelo-210.html",
        "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-13573",
        "https://www.fieldfisher.com/es-es/locations/espana/actualidad/plazos-210-no-residentes-inmuebles",
        "https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214",
        "https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906",
        "https://www.boe.es/buscar/act.php?id=BOE-A-1980-22501",
        "https://sede.agenciatributaria.gob.es/Sede/declaraciones-informativas-otros-impuestos-tasas/impuesto-sobre-patrimonio/quienes-estan-obligados-presentar-declaracion-ipatrimonio.html",
        "https://www.iberiantax.com/es/blog/impuesto-sobre-el-patrimonio-en-espana-para-no-residentes-modelo-714",
        "https://www.idealista.com/news/inmobiliario/vivienda/2026/05/21/898563-el-supremo-tumba-el-registro-unico-de-alquiler-de-corta-duracion-por-invadir",
        "https://www.merca2.es/2026/07/18/registro-unico-arrendamientos-sentencia-supremo-2419974/"
      ]
    },
    "content": {
      "en": {
        "subject": "Bueno Newsletter 17",
        "preview": "Your 2027 calendar for your Spanish home, a look at Almería and what to do in January.",
        "guide": {
          "title": "Your Year as a Spanish Property Owner: The 2027 Calendar",
          "intro": "Owning a home in Spain comes with a handful of yearly tasks, spread across the year and set by different offices. Our new guide puts every filing, payment and good habit for 2027 into one calm calendar. It also covers the new Modelo 210 dates that start next year.",
          "topics": [
            "What to check in winter, from IBI to direct debits",
            "The new 2027 dates for your Modelo 210",
            "The spring and summer jobs, from the community meeting to the cadastral value",
            "How to renew or change your home insurance on time",
            "The paperwork worth keeping in one place"
          ]
        },
        "region": {
          "title": "Almería in Focus",
          "paras": [
            "Homes in the province of Almería cost an average of €1,667 per square metre in August 2026, according to idealista. That is 15.8% more than a year earlier. In the city of Almería itself, the average was €1,807 per square metre, up 11.3% over the year.",
            "On the coast, Mojácar is the most expensive town at €2,633 per square metre. Rents across the province averaged €9.0 per square metre a month in August, 4.6% more than a year before."
          ]
        },
        "question": {
          "q": "Is there anything I have to do in January for my Spanish home, or can it wait until I am back in summer?",
          "paras": [
            "Very little has to be done in January, and from 2027 even less than before.",
            "IBI, the local property tax, is fixed on 1 January. Whoever owns the home on that day pays for the whole year, but the bill itself only arrives when your town hall collects it, which is often in the second half of the year.",
            "The Modelo 210 has also moved. From 2027, the return for a home you do not let can be filed from 1 April to 31 December, and rental income is reported between 1 and 20 April. Neither can be done in January. The return for 2025 still follows the old timetable and is due by 31 December 2026, or 23 December 2026 if you pay by direct debit.",
            "Simple steps to stay safe: check that the account your direct debits come from is funded for the new year's amounts, put last year's receipts and statements in one folder, and note the renewal date of your home insurance, since any change must be sent in writing at least one month before it.",
            "With Bueno, your bills are paid from your Bueno Account and our multilingual team is here whenever a letter arrives, so January can stay quiet."
          ]
        },
        "survey": {
          "question": "Which topic would you like us to cover next?",
          "options": [
            "Renovations and building permits",
            "Selling a property in Spain",
            "Inheritance and your Spanish home",
            "Lowering your energy bills"
          ]
        },
        "news": PENDING_NEWS.en
      },
      "no": {
        "subject": "Bueno Nyhetsbrev 17",
        "preview": "Kalenderen for 2027 for boligen i Spania, et blikk på Almería og hva du bør gjøre i januar.",
        "guide": {
          "title": "Ditt år som boligeier i Spania: kalenderen for 2027",
          "intro": "Å eie bolig i Spania følger med en håndfull årlige oppgaver, spredt utover året og fastsatt av ulike kontorer. Den nye guiden vår samler alle innleveringer, betalinger og gode vaner for 2027 i én rolig kalender. Den forklarer også de nye datoene for Modelo 210 som starter neste år.",
          "topics": [
            "Hva du bør sjekke om vinteren, fra IBI til trekk fra kontoen",
            "De nye datoene for Modelo 210 i 2027",
            "Vår- og sommeroppgavene, fra sameiemøtet til matrikkelverdien",
            "Slik fornyer eller bytter du boligforsikring i tide",
            "Papirene som er verdt å samle på ett sted"
          ]
        },
        "region": {
          "title": "Almería i fokus",
          "paras": [
            "Boliger i provinsen Almería kostet i snitt €1 667 per kvadratmeter i august 2026, ifølge idealista. Det er 15,8 % mer enn året før. I selve byen Almería var snittet €1 807 per kvadratmeter, en økning på 11,3 % på ett år.",
            "På kysten er Mojácar den dyreste byen med €2 633 per kvadratmeter. Leieprisene i provinsen var i snitt €9,0 per kvadratmeter i måneden i august, 4,6 % mer enn året før."
          ]
        },
        "question": {
          "q": "Er det noe jeg må gjøre i januar for boligen i Spania, eller kan det vente til jeg er tilbake til sommeren?",
          "paras": [
            "Svært lite må gjøres i januar, og fra 2027 enda mindre enn før.",
            "IBI, den lokale eiendomsskatten, fastsettes 1. januar. Den som eier boligen den dagen, betaler for hele året, men selve regningen kommer først når kommunen krever den inn, ofte i andre halvår.",
            "Modelo 210 har også fått nye datoer. Fra 2027 kan selvangivelsen for en bolig du ikke leier ut leveres fra 1. april til 31. desember, og leieinntekter rapporteres mellom 1. og 20. april. Ingen av dem kan leveres i januar. Selvangivelsen for 2025 følger fortsatt de gamle fristene og skal leveres innen 31. desember 2026, eller 23. desember 2026 hvis du betaler med trekk fra kontoen.",
            "Enkle steg for å være trygg: sjekk at kontoen trekkene går fra har dekning for årets nye beløp, legg fjorårets kvitteringer og oppgjør i én mappe, og noter fornyelsesdatoen for boligforsikringen, siden en endring må sendes skriftlig minst én måned før.",
            "Med Bueno betales regningene fra Bueno-kontoen, og det flerspråklige teamet vårt er her når et brev kommer, så januar kan være rolig."
          ]
        },
        "survey": {
          "question": "Hvilket tema vil du at vi skal ta opp neste gang?",
          "options": [
            "Oppussing og byggetillatelser",
            "Salg av eiendom i Spania",
            "Arv og boligen i Spania",
            "Lavere strømregninger"
          ]
        },
        "news": PENDING_NEWS.no
      },
      "sv": {
        "subject": "Buenos nyhetsbrev 17",
        "preview": "Kalendern för 2027 för din fastighet i Spanien, en titt på Almería och vad du bör göra i januari.",
        "guide": {
          "title": "Ditt år som fastighetsägare i Spanien: kalendern för 2027",
          "intro": "Att äga en fastighet i Spanien innebär en handfull årliga uppgifter, utspridda över året och bestämda av olika myndigheter. Vår nya guide samlar alla deklarationer, betalningar och goda vanor för 2027 i en lugn kalender. Den förklarar också de nya datumen för Modelo 210 som börjar gälla nästa år.",
          "topics": [
            "Vad du bör kontrollera på vintern, från IBI till autogiro",
            "De nya datumen för Modelo 210 under 2027",
            "Vårens och sommarens uppgifter, från stämman till taxeringsvärdet",
            "Så förnyar eller byter du hemförsäkring i tid",
            "Papperen som är värda att samla på ett ställe"
          ]
        },
        "region": {
          "title": "Almería i fokus",
          "paras": [
            "Bostäder i provinsen Almería kostade i genomsnitt €1 667 per kvadratmeter i augusti 2026, enligt idealista. Det är 15,8 % mer än ett år tidigare. I själva staden Almería låg snittet på €1 807 per kvadratmeter, en ökning med 11,3 % på ett år.",
            "Vid kusten är Mojácar den dyraste orten med €2 633 per kvadratmeter. Hyrorna i provinsen låg i genomsnitt på €9,0 per kvadratmeter och månad i augusti, 4,6 % mer än året innan."
          ]
        },
        "question": {
          "q": "Finns det något jag måste göra i januari för min fastighet i Spanien, eller kan det vänta tills jag är tillbaka i sommar?",
          "paras": [
            "Väldigt lite behöver göras i januari, och från 2027 ännu mindre än tidigare.",
            "IBI, den lokala fastighetsskatten, bestäms den 1 januari. Den som äger fastigheten den dagen betalar för hela året, men själva räkningen kommer först när kommunen tar ut den, ofta under andra halvåret.",
            "Modelo 210 har också fått nya datum. Från 2027 kan deklarationen för en fastighet du inte hyr ut lämnas från 1 april till 31 december, och hyresintäkter redovisas mellan 1 och 20 april. Ingen av dem kan lämnas i januari. Deklarationen för 2025 följer fortfarande de gamla tiderna och ska vara inlämnad senast den 31 december 2026, eller den 23 december 2026 om du betalar via autogiro.",
            "Enkla steg för att vara på den säkra sidan: kontrollera att kontot dina autogiron dras från har täckning för årets nya belopp, lägg förra årets kvitton och besked i en pärm, och notera förnyelsedagen för hemförsäkringen, eftersom en ändring måste skickas skriftligt minst en månad innan.",
            "Med Bueno betalas dina räkningar från ditt Bueno-konto, och vårt flerspråkiga team finns här när ett brev kommer, så januari kan förbli lugn."
          ]
        },
        "survey": {
          "question": "Vilket ämne vill du att vi tar upp nästa gång?",
          "options": [
            "Renovering och bygglov",
            "Att sälja en fastighet i Spanien",
            "Arv och din fastighet i Spanien",
            "Lägre elräkningar"
          ]
        },
        "news": PENDING_NEWS.sv
      }
    },
    "guide_url": guideUrls('Your-Year-As-A-Spanish-Property-Owner')
  },
];
