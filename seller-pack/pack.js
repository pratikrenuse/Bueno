// The arithmetic and the words of the seller meeting pack.
//
// The arithmetic is deliberately modest. It turns the agent's own comparables into a price
// per square metre, finds the typical figure for asking prices and for sold prices
// separately, and says where the seller's hoped price sits. It never produces a valuation:
// that is the agent's judgement, and the pack says so.
//
// Asking and sold prices are never mixed into one average. A median of the two together
// would describe nothing that happened.
//
// No legal figure is typed here. The retention rate for a non-resident seller arrives from
// the rules base through index.jsx.

export const PACK_LANGS = ['en', 'es', 'no', 'sv', 'de', 'fr', 'nl'];

// A comparable whose size differs from the subject by more than this share is flagged,
// because price per square metre stops being comparable across very different sizes.
// This is an analytical threshold, not a legal one.
export const SIZE_GAP = 0.25;

const num = v => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[\s.,](?=\d{3}\b)/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export function median(values) {
  const v = values.filter(x => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

export function analyse({ area, price, low, high, comps }) {
  const subjectArea = num(area);
  const hoped = num(price);
  let lo = num(low);
  let hi = num(high);
  if (lo && hi && hi < lo) [lo, hi] = [hi, lo];

  const rows = (comps || [])
    .map(c => {
      const p = num(c.price);
      const m = num(c.area);
      return {
        label: String(c.label || '').trim(),
        status: c.status === 'sold' ? 'sold' : 'asking',
        price: p,
        area: m,
        note: String(c.note || '').trim(),
        ppm: p && m ? Math.round(p / m) : null,
        sizeGap: subjectArea && m ? Math.abs(m - subjectArea) / subjectArea > SIZE_GAP : false,
      };
    })
    .filter(r => r.price > 0 || r.label);

  const priced = rows.filter(r => r.ppm != null);
  const medAsking = median(priced.filter(r => r.status === 'asking').map(r => r.ppm));
  const medSold = median(priced.filter(r => r.status === 'sold').map(r => r.ppm));
  const ppms = priced.map(r => r.ppm);
  const minPpm = ppms.length ? Math.min(...ppms) : null;
  const maxPpm = ppms.length ? Math.max(...ppms) : null;

  const subjectPpm = subjectArea && hoped ? Math.round(hoped / subjectArea) : null;
  let position = null;
  if (subjectPpm != null && ppms.length >= 2) {
    position = subjectPpm > maxPpm ? 'above' : subjectPpm < minPpm ? 'below' : 'within';
  }

  const pct = (base) => (subjectPpm != null && base ? Math.round(((subjectPpm - base) / base) * 100) : null);

  return {
    rows,
    subjectArea,
    hoped,
    low: lo,
    high: hi,
    subjectPpm,
    lowPpm: subjectArea && lo ? Math.round(lo / subjectArea) : null,
    highPpm: subjectArea && hi ? Math.round(hi / subjectArea) : null,
    medAsking: medAsking != null ? Math.round(medAsking) : null,
    medSold: medSold != null ? Math.round(medSold) : null,
    vsAsking: pct(medAsking),
    vsSold: pct(medSold),
    position,
    anySizeGap: rows.some(r => r.sizeGap),
    pricedCount: priced.length,
  };
}

const NUM_LOCALE = { en: 'en-GB', es: 'es-ES', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };

// Euro sign before the amount in every language, as the translation guide requires, with
// the language's own thousands separator.
export function fmtEUR(lang, n) {
  if (n == null || !Number.isFinite(n)) return '';
  return '€' + new Intl.NumberFormat(NUM_LOCALE[lang] || 'en-GB', { maximumFractionDigits: 0 }).format(n);
}
export function fmtNum(lang, n) {
  if (n == null || !Number.isFinite(n)) return '';
  return new Intl.NumberFormat(NUM_LOCALE[lang] || 'en-GB', { maximumFractionDigits: 0 }).format(n);
}
export function fmtDate(lang, iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(NUM_LOCALE[lang] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export const MARKETING_KEYS = ['photos', 'plan', 'video', 'portals', 'languages', 'database', 'viewings', 'social'];
export const TYPE_KEYS = ['apartment', 'townhouse', 'villa', 'other'];
export const REVIEW_WEEKS = [2, 4, 6, 8];

// The document's words. {x} placeholders are filled by the page.
export const PACK = {
  en: {
    doc_title: 'Selling your home', prepared_for: 'Prepared for {name}', prepared_by: 'Prepared by', meeting: 'Meeting on {date}',
    s_property: 'The property', l_type: 'Type', l_area: 'Built area', l_beds: 'Bedrooms', l_baths: 'Bathrooms', l_plot: 'Plot',
    t_apartment: 'Apartment', t_townhouse: 'Townhouse', t_villa: 'Villa', t_other: 'Other',
    s_evidence: 'What the market evidence shows',
    h_home: 'Home', h_status: 'Status', h_price: 'Price', h_area: 'Built area', h_ppm: 'Per m²', h_note: 'Notes',
    st_asking: 'For sale', st_sold: 'Sold',
    med_asking: 'Typical asking price per m² among these homes: {x}.',
    med_sold: 'Typical sold price per m² among these homes: {x}.',
    at_hoped: 'The price you have in mind, {p}, works out at {x} per m².',
    pos_above: 'That is higher than every comparable listed here.',
    pos_within: 'That sits within the range of the comparables listed here.',
    pos_below: 'That is lower than every comparable listed here.',
    vs_sold_up: 'It is {n} percent above the typical sold price per m².', vs_sold_down: 'It is {n} percent below the typical sold price per m².', vs_sold_eq: 'It matches the typical sold price per m².',
    vs_ask_up: 'It is {n} percent above the typical asking price per m².', vs_ask_down: 'It is {n} percent below the typical asking price per m².', vs_ask_eq: 'It matches the typical asking price per m².',
    size_note: 'Homes marked * differ in size by more than a quarter, so their price per m² is a weaker guide.',
    no_evidence: 'No comparables with a price and a size were added, so there is no figure to compare against yet.',
    limits_t: 'What this evidence cannot tell us',
    limit_1: 'Asking prices are what sellers hope for, not what buyers paid.',
    limit_2: 'No two homes are the same. Condition, views, orientation, parking and community fees all move the price.',
    limit_3: 'The comparables were chosen by your agent. They are a guide for our conversation, not a formal valuation.',
    s_price: 'Our recommendation',
    rec_range: 'We recommend marketing your home between {lo} and {hi}.',
    rec_from: 'We recommend marketing your home from {lo}.',
    rec_upto: 'We recommend marketing your home at up to {hi}.',
    rec_ppm: 'That is {a} to {b} per m².',
    s_plan: 'How we will market it',
    m_photos: 'Professional photography', m_plan: 'A floor plan', m_video: 'A video or virtual tour', m_portals: 'Listing on the main property portals',
    m_languages: 'The listing written in several languages for international buyers', m_database: 'Direct contact with our registered buyers',
    m_viewings: 'Accompanied viewings with feedback after each one', m_social: 'A social media campaign',
    s_review: 'When we will review',
    review: 'We will review the response together after {n} weeks: enquiries, viewings and what buyers said. If the evidence says the price should change, we will show you why before anything changes.',
    s_costs: 'Costs of selling to plan for',
    cost_fee: 'The agency fee, as agreed in writing.',
    cost_plusvalia: 'The municipal tax on the increase in land value (plusvalía), set by the town hall.',
    cost_gain: 'Tax on any capital gain.',
    cost_mortgage: 'Cancelling any mortgage on the property.',
    cost_certs: 'The energy performance certificate, and any other certificate the sale needs.',
    s_nonres: 'If you are not tax resident in Spain',
    nonres: 'The buyer must hold back {ret} percent of the price at the notary and pay it to the Spanish tax office. It is an advance on your tax, not an extra cost, and if it is more than the tax you owe, the difference can be reclaimed.',
    nonres_link: 'You can estimate your own position here: {url}',
    notes_t: 'Notes from your agent',
    disclaimer: 'This pack is a marketing proposal prepared for our meeting. It is not a formal valuation, and it is not tax or legal advice.',
  },
  es: {
    doc_title: 'La venta de su vivienda', prepared_for: 'Preparado para {name}', prepared_by: 'Preparado por', meeting: 'Reunión del {date}',
    s_property: 'La vivienda', l_type: 'Tipo', l_area: 'Superficie construida', l_beds: 'Dormitorios', l_baths: 'Baños', l_plot: 'Parcela',
    t_apartment: 'Piso', t_townhouse: 'Adosado', t_villa: 'Chalet', t_other: 'Otro',
    s_evidence: 'Qué muestran los datos del mercado',
    h_home: 'Vivienda', h_status: 'Estado', h_price: 'Precio', h_area: 'Superficie', h_ppm: 'Por m²', h_note: 'Notas',
    st_asking: 'En venta', st_sold: 'Vendida',
    med_asking: 'Precio de oferta habitual por m² entre estas viviendas: {x}.',
    med_sold: 'Precio de venta habitual por m² entre estas viviendas: {x}.',
    at_hoped: 'El precio que tiene en mente, {p}, supone {x} por m².',
    pos_above: 'Es superior a todas las viviendas comparables de esta lista.',
    pos_within: 'Se sitúa dentro del rango de las viviendas comparables de esta lista.',
    pos_below: 'Es inferior a todas las viviendas comparables de esta lista.',
    vs_sold_up: 'Está un {n} por ciento por encima del precio de venta habitual por m².', vs_sold_down: 'Está un {n} por ciento por debajo del precio de venta habitual por m².', vs_sold_eq: 'Coincide con el precio de venta habitual por m².',
    vs_ask_up: 'Está un {n} por ciento por encima del precio de oferta habitual por m².', vs_ask_down: 'Está un {n} por ciento por debajo del precio de oferta habitual por m².', vs_ask_eq: 'Coincide con el precio de oferta habitual por m².',
    size_note: 'Las viviendas marcadas con * difieren en tamaño en más de una cuarta parte, por lo que su precio por m² es una referencia más débil.',
    no_evidence: 'No se han añadido comparables con precio y superficie, así que aún no hay una cifra con la que comparar.',
    limits_t: 'Lo que estos datos no pueden decirnos',
    limit_1: 'Los precios de oferta reflejan lo que esperan los vendedores, no lo que pagaron los compradores.',
    limit_2: 'No hay dos viviendas iguales. El estado, las vistas, la orientación, el aparcamiento y los gastos de comunidad influyen en el precio.',
    limit_3: 'Las viviendas comparables las ha elegido su agente. Son una guía para nuestra conversación, no una tasación oficial.',
    s_price: 'Nuestra recomendación',
    rec_range: 'Recomendamos comercializar su vivienda entre {lo} y {hi}.',
    rec_from: 'Recomendamos comercializar su vivienda a partir de {lo}.',
    rec_upto: 'Recomendamos comercializar su vivienda hasta {hi}.',
    rec_ppm: 'Equivale a entre {a} y {b} por m².',
    s_plan: 'Cómo la vamos a comercializar',
    m_photos: 'Fotografía profesional', m_plan: 'Un plano de la vivienda', m_video: 'Un vídeo o visita virtual', m_portals: 'Publicación en los principales portales inmobiliarios',
    m_languages: 'El anuncio redactado en varios idiomas para compradores internacionales', m_database: 'Contacto directo con nuestros compradores registrados',
    m_viewings: 'Visitas acompañadas con comentarios después de cada una', m_social: 'Una campaña en redes sociales',
    s_review: 'Cuándo lo revisaremos',
    review: 'Revisaremos juntos la respuesta al cabo de {n} semanas: consultas, visitas y lo que dijeron los compradores. Si los datos indican que el precio debe cambiar, le explicaremos por qué antes de cambiar nada.',
    s_costs: 'Gastos de la venta a tener en cuenta',
    cost_fee: 'Los honorarios de la agencia, según lo acordado por escrito.',
    cost_plusvalia: 'El impuesto municipal sobre el incremento del valor de los terrenos (plusvalía), que fija el ayuntamiento.',
    cost_gain: 'El impuesto sobre la ganancia patrimonial, si la hay.',
    cost_mortgage: 'La cancelación de la hipoteca, si existe.',
    cost_certs: 'El certificado de eficiencia energética y cualquier otro certificado que requiera la venta.',
    s_nonres: 'Si no es residente fiscal en España',
    nonres: 'El comprador debe retener el {ret} por ciento del precio en la notaría e ingresarlo en Hacienda. Es un pago a cuenta de su impuesto, no un coste añadido, y si supera el impuesto que le corresponde, puede solicitar la devolución de la diferencia.',
    nonres_link: 'Puede estimar su situación aquí: {url}',
    notes_t: 'Notas de su agente',
    disclaimer: 'Este dosier es una propuesta comercial preparada para nuestra reunión. No es una tasación oficial ni asesoramiento fiscal o jurídico.',
  },
  no: {
    doc_title: 'Salg av boligen din', prepared_for: 'Utarbeidet for {name}', prepared_by: 'Utarbeidet av', meeting: 'Møte {date}',
    s_property: 'Boligen', l_type: 'Type', l_area: 'Bebygd areal', l_beds: 'Soverom', l_baths: 'Bad', l_plot: 'Tomt',
    t_apartment: 'Leilighet', t_townhouse: 'Rekkehus', t_villa: 'Villa', t_other: 'Annet',
    s_evidence: 'Hva markedstallene viser',
    h_home: 'Bolig', h_status: 'Status', h_price: 'Pris', h_area: 'Areal', h_ppm: 'Per m²', h_note: 'Merknader',
    st_asking: 'Til salgs', st_sold: 'Solgt',
    med_asking: 'Typisk prisantydning per m² blant disse boligene: {x}.',
    med_sold: 'Typisk salgspris per m² blant disse boligene: {x}.',
    at_hoped: 'Prisen du ser for deg, {p}, tilsvarer {x} per m².',
    pos_above: 'Det er høyere enn alle de sammenlignbare boligene her.',
    pos_within: 'Det ligger innenfor spennet til de sammenlignbare boligene her.',
    pos_below: 'Det er lavere enn alle de sammenlignbare boligene her.',
    vs_sold_up: 'Det er {n} prosent over typisk salgspris per m².', vs_sold_down: 'Det er {n} prosent under typisk salgspris per m².', vs_sold_eq: 'Det tilsvarer typisk salgspris per m².',
    vs_ask_up: 'Det er {n} prosent over typisk prisantydning per m².', vs_ask_down: 'Det er {n} prosent under typisk prisantydning per m².', vs_ask_eq: 'Det tilsvarer typisk prisantydning per m².',
    size_note: 'Boliger merket * avviker mer enn en fjerdedel i størrelse, så prisen per m² er en svakere pekepinn.',
    no_evidence: 'Det er ikke lagt inn sammenlignbare boliger med både pris og areal, så det finnes ingen tall å sammenligne med ennå.',
    limits_t: 'Hva tallene ikke kan fortelle oss',
    limit_1: 'Prisantydning er det selgerne håper på, ikke det kjøperne betalte.',
    limit_2: 'Ingen boliger er like. Standard, utsikt, solforhold, parkering og fellesutgifter påvirker prisen.',
    limit_3: 'De sammenlignbare boligene er valgt av megleren din. De er et utgangspunkt for samtalen vår, ikke en formell verdivurdering.',
    s_price: 'Vår anbefaling',
    rec_range: 'Vi anbefaler å markedsføre boligen mellom {lo} og {hi}.',
    rec_from: 'Vi anbefaler å markedsføre boligen fra {lo}.',
    rec_upto: 'Vi anbefaler å markedsføre boligen for opptil {hi}.',
    rec_ppm: 'Det tilsvarer {a} til {b} per m².',
    s_plan: 'Slik markedsfører vi den',
    m_photos: 'Profesjonell fotografering', m_plan: 'En plantegning', m_video: 'Video eller virtuell visning', m_portals: 'Annonsering på de største boligportalene',
    m_languages: 'Annonsen skrevet på flere språk for internasjonale kjøpere', m_database: 'Direkte kontakt med våre registrerte kjøpere',
    m_viewings: 'Visninger med oppfølging og tilbakemelding etter hver', m_social: 'En kampanje i sosiale medier',
    s_review: 'Når vi evaluerer',
    review: 'Vi går gjennom responsen sammen etter {n} uker: henvendelser, visninger og hva kjøperne sa. Hvis tallene tilsier at prisen bør endres, viser vi deg hvorfor før noe endres.',
    s_costs: 'Salgskostnader å planlegge for',
    cost_fee: 'Meglerhonoraret, slik det er avtalt skriftlig.',
    cost_plusvalia: 'Kommunens skatt på verdiøkningen av tomten (plusvalía), fastsatt av kommunen.',
    cost_gain: 'Skatt på eventuell gevinst.',
    cost_mortgage: 'Innfrielse av eventuelt boliglån.',
    cost_certs: 'Energiattesten og andre attester salget krever.',
    s_nonres: 'Hvis du ikke er skattemessig bosatt i Spania',
    nonres: 'Kjøperen må holde tilbake {ret} prosent av prisen hos notaren og betale det til det spanske skattekontoret. Det er et forskudd på skatten din, ikke en ekstra kostnad, og er det mer enn skatten du skylder, kan differansen kreves tilbake.',
    nonres_link: 'Du kan anslå din egen situasjon her: {url}',
    notes_t: 'Merknader fra megleren',
    disclaimer: 'Denne pakken er et markedsføringsforslag laget til møtet vårt. Den er ikke en formell verdivurdering, og den er ikke skatterådgivning eller juridisk rådgivning.',
  },
  sv: {
    doc_title: 'Försäljningen av din bostad', prepared_for: 'Framtaget för {name}', prepared_by: 'Framtaget av', meeting: 'Möte {date}',
    s_property: 'Fastigheten', l_type: 'Typ', l_area: 'Boarea', l_beds: 'Sovrum', l_baths: 'Badrum', l_plot: 'Tomt',
    t_apartment: 'Lägenhet', t_townhouse: 'Radhus', t_villa: 'Villa', t_other: 'Annat',
    s_evidence: 'Vad marknadsunderlaget visar',
    h_home: 'Bostad', h_status: 'Status', h_price: 'Pris', h_area: 'Boarea', h_ppm: 'Per m²', h_note: 'Anteckningar',
    st_asking: 'Till salu', st_sold: 'Såld',
    med_asking: 'Typiskt utgångspris per m² bland dessa bostäder: {x}.',
    med_sold: 'Typiskt försäljningspris per m² bland dessa bostäder: {x}.',
    at_hoped: 'Priset du har i tankarna, {p}, motsvarar {x} per m².',
    pos_above: 'Det är högre än alla jämförbara bostäder här.',
    pos_within: 'Det ligger inom spannet för de jämförbara bostäderna här.',
    pos_below: 'Det är lägre än alla jämförbara bostäder här.',
    vs_sold_up: 'Det är {n} procent över det typiska försäljningspriset per m².', vs_sold_down: 'Det är {n} procent under det typiska försäljningspriset per m².', vs_sold_eq: 'Det motsvarar det typiska försäljningspriset per m².',
    vs_ask_up: 'Det är {n} procent över det typiska utgångspriset per m².', vs_ask_down: 'Det är {n} procent under det typiska utgångspriset per m².', vs_ask_eq: 'Det motsvarar det typiska utgångspriset per m².',
    size_note: 'Bostäder markerade med * skiljer sig mer än en fjärdedel i storlek, så deras pris per m² är en svagare vägledning.',
    no_evidence: 'Inga jämförbara bostäder med både pris och storlek har lagts till, så det finns ännu ingen siffra att jämföra med.',
    limits_t: 'Vad underlaget inte kan säga oss',
    limit_1: 'Utgångspriser är vad säljarna hoppas på, inte vad köparna betalade.',
    limit_2: 'Inga två bostäder är lika. Skick, utsikt, väderstreck, parkering och avgifter påverkar priset.',
    limit_3: 'De jämförbara bostäderna är valda av din mäklare. De är ett underlag för vårt samtal, inte en formell värdering.',
    s_price: 'Vår rekommendation',
    rec_range: 'Vi rekommenderar att bostaden marknadsförs mellan {lo} och {hi}.',
    rec_from: 'Vi rekommenderar att bostaden marknadsförs från {lo}.',
    rec_upto: 'Vi rekommenderar att bostaden marknadsförs för upp till {hi}.',
    rec_ppm: 'Det motsvarar {a} till {b} per m².',
    s_plan: 'Så marknadsför vi den',
    m_photos: 'Professionell fotografering', m_plan: 'En planritning', m_video: 'Video eller virtuell visning', m_portals: 'Annonsering på de största bostadsportalerna',
    m_languages: 'Annonsen skriven på flera språk för internationella köpare', m_database: 'Direktkontakt med våra registrerade köpare',
    m_viewings: 'Visningar med återkoppling efter varje tillfälle', m_social: 'En kampanj i sociala medier',
    s_review: 'När vi utvärderar',
    review: 'Vi går igenom responsen tillsammans efter {n} veckor: förfrågningar, visningar och vad köparna sa. Om underlaget visar att priset bör ändras visar vi dig varför innan något ändras.',
    s_costs: 'Försäljningskostnader att planera för',
    cost_fee: 'Mäklararvodet, enligt skriftlig överenskommelse.',
    cost_plusvalia: 'Kommunens skatt på markens värdeökning (plusvalía), som kommunen bestämmer.',
    cost_gain: 'Skatt på eventuell vinst.',
    cost_mortgage: 'Lösen av eventuellt bolån.',
    cost_certs: 'Energideklarationen och andra intyg som försäljningen kräver.',
    s_nonres: 'Om du inte har skatterättslig hemvist i Spanien',
    nonres: 'Köparen måste hålla inne {ret} procent av priset hos notarien och betala det till den spanska skattemyndigheten. Det är en förskottsbetalning av din skatt, inte en extra kostnad, och är det mer än skatten du ska betala kan mellanskillnaden begäras tillbaka.',
    nonres_link: 'Du kan uppskatta din egen situation här: {url}',
    notes_t: 'Anteckningar från din mäklare',
    disclaimer: 'Det här paketet är ett marknadsföringsförslag inför vårt möte. Det är inte en formell värdering och inte skatterådgivning eller juridisk rådgivning.',
  },
  de: {
    doc_title: 'Der Verkauf Ihrer Immobilie', prepared_for: 'Erstellt für {name}', prepared_by: 'Erstellt von', meeting: 'Termin am {date}',
    s_property: 'Die Immobilie', l_type: 'Art', l_area: 'Wohnfläche', l_beds: 'Schlafzimmer', l_baths: 'Bäder', l_plot: 'Grundstück',
    t_apartment: 'Wohnung', t_townhouse: 'Reihenhaus', t_villa: 'Villa', t_other: 'Sonstiges',
    s_evidence: 'Was die Marktdaten zeigen',
    h_home: 'Objekt', h_status: 'Status', h_price: 'Preis', h_area: 'Fläche', h_ppm: 'Pro m²', h_note: 'Anmerkungen',
    st_asking: 'Im Angebot', st_sold: 'Verkauft',
    med_asking: 'Typischer Angebotspreis pro m² bei diesen Objekten: {x}.',
    med_sold: 'Typischer Verkaufspreis pro m² bei diesen Objekten: {x}.',
    at_hoped: 'Ihr Wunschpreis von {p} entspricht {x} pro m².',
    pos_above: 'Das liegt über allen hier aufgeführten Vergleichsobjekten.',
    pos_within: 'Das liegt innerhalb der Spanne der hier aufgeführten Vergleichsobjekte.',
    pos_below: 'Das liegt unter allen hier aufgeführten Vergleichsobjekten.',
    vs_sold_up: 'Das sind {n} Prozent über dem typischen Verkaufspreis pro m².', vs_sold_down: 'Das sind {n} Prozent unter dem typischen Verkaufspreis pro m².', vs_sold_eq: 'Das entspricht dem typischen Verkaufspreis pro m².',
    vs_ask_up: 'Das sind {n} Prozent über dem typischen Angebotspreis pro m².', vs_ask_down: 'Das sind {n} Prozent unter dem typischen Angebotspreis pro m².', vs_ask_eq: 'Das entspricht dem typischen Angebotspreis pro m².',
    size_note: 'Mit * markierte Objekte weichen in der Größe um mehr als ein Viertel ab, ihr Preis pro m² ist daher ein schwächerer Anhaltspunkt.',
    no_evidence: 'Es wurden keine Vergleichsobjekte mit Preis und Fläche erfasst, daher gibt es noch keinen Vergleichswert.',
    limits_t: 'Was diese Daten nicht zeigen können',
    limit_1: 'Angebotspreise zeigen, was Verkäufer erhoffen, nicht was Käufer bezahlt haben.',
    limit_2: 'Keine zwei Immobilien sind gleich. Zustand, Aussicht, Ausrichtung, Stellplatz und Gemeinschaftskosten beeinflussen den Preis.',
    limit_3: 'Die Vergleichsobjekte hat Ihr Makler ausgewählt. Sie sind eine Grundlage für unser Gespräch, kein förmliches Wertgutachten.',
    s_price: 'Unsere Empfehlung',
    rec_range: 'Wir empfehlen, Ihre Immobilie zwischen {lo} und {hi} anzubieten.',
    rec_from: 'Wir empfehlen, Ihre Immobilie ab {lo} anzubieten.',
    rec_upto: 'Wir empfehlen, Ihre Immobilie für bis zu {hi} anzubieten.',
    rec_ppm: 'Das entspricht {a} bis {b} pro m².',
    s_plan: 'So vermarkten wir sie',
    m_photos: 'Professionelle Fotos', m_plan: 'Ein Grundriss', m_video: 'Ein Video oder ein virtueller Rundgang', m_portals: 'Inserate auf den wichtigsten Immobilienportalen',
    m_languages: 'Das Exposé in mehreren Sprachen für internationale Käufer', m_database: 'Direkte Ansprache unserer vorgemerkten Käufer',
    m_viewings: 'Begleitete Besichtigungen mit Rückmeldung nach jedem Termin', m_social: 'Eine Kampagne in den sozialen Medien',
    s_review: 'Wann wir Bilanz ziehen',
    review: 'Nach {n} Wochen besprechen wir gemeinsam die Resonanz: Anfragen, Besichtigungen und das Feedback der Käufer. Wenn die Zahlen für eine Preisänderung sprechen, zeigen wir Ihnen vorher, warum.',
    s_costs: 'Verkaufskosten, die Sie einplanen sollten',
    cost_fee: 'Die Maklerprovision, wie schriftlich vereinbart.',
    cost_plusvalia: 'Die kommunale Steuer auf den Wertzuwachs des Grundstücks (plusvalía), festgelegt von der Gemeinde.',
    cost_gain: 'Steuer auf einen etwaigen Veräußerungsgewinn.',
    cost_mortgage: 'Die Ablösung einer etwaigen Hypothek.',
    cost_certs: 'Der Energieausweis und weitere Bescheinigungen, die der Verkauf erfordert.',
    s_nonres: 'Wenn Sie in Spanien nicht steuerlich ansässig sind',
    nonres: 'Der Käufer muss beim Notar {ret} Prozent des Kaufpreises einbehalten und an das spanische Finanzamt abführen. Das ist eine Vorauszahlung auf Ihre Steuer, keine zusätzliche Belastung, und übersteigt sie Ihre Steuer, kann die Differenz zurückgefordert werden.',
    nonres_link: 'Ihre eigene Lage können Sie hier abschätzen: {url}',
    notes_t: 'Anmerkungen Ihres Maklers',
    disclaimer: 'Diese Unterlagen sind ein Vermarktungsvorschlag für unser Gespräch. Sie sind kein förmliches Wertgutachten und keine Steuer- oder Rechtsberatung.',
  },
  fr: {
    doc_title: 'La vente de votre bien', prepared_for: 'Préparé pour {name}', prepared_by: 'Préparé par', meeting: 'Rendez-vous du {date}',
    s_property: 'Le bien', l_type: 'Type', l_area: 'Surface construite', l_beds: 'Chambres', l_baths: 'Salles de bains', l_plot: 'Terrain',
    t_apartment: 'Appartement', t_townhouse: 'Maison mitoyenne', t_villa: 'Villa', t_other: 'Autre',
    s_evidence: 'Ce que montrent les données du marché',
    h_home: 'Bien', h_status: 'Statut', h_price: 'Prix', h_area: 'Surface', h_ppm: 'Au m²', h_note: 'Remarques',
    st_asking: 'En vente', st_sold: 'Vendu',
    med_asking: 'Prix affiché habituel au m² pour ces biens : {x}.',
    med_sold: 'Prix de vente habituel au m² pour ces biens : {x}.',
    at_hoped: 'Le prix que vous envisagez, {p}, représente {x} au m².',
    pos_above: 'C’est plus élevé que tous les biens comparables listés ici.',
    pos_within: 'Cela se situe dans la fourchette des biens comparables listés ici.',
    pos_below: 'C’est plus bas que tous les biens comparables listés ici.',
    vs_sold_up: 'C’est {n} pour cent au-dessus du prix de vente habituel au m².', vs_sold_down: 'C’est {n} pour cent en dessous du prix de vente habituel au m².', vs_sold_eq: 'Cela correspond au prix de vente habituel au m².',
    vs_ask_up: 'C’est {n} pour cent au-dessus du prix affiché habituel au m².', vs_ask_down: 'C’est {n} pour cent en dessous du prix affiché habituel au m².', vs_ask_eq: 'Cela correspond au prix affiché habituel au m².',
    size_note: 'Les biens marqués d’un * diffèrent en surface de plus d’un quart, leur prix au m² est donc un repère moins fiable.',
    no_evidence: 'Aucun bien comparable avec un prix et une surface n’a été ajouté, il n’y a donc pas encore de chiffre de comparaison.',
    limits_t: 'Ce que ces données ne peuvent pas dire',
    limit_1: 'Les prix affichés sont ce qu’espèrent les vendeurs, pas ce qu’ont payé les acheteurs.',
    limit_2: 'Aucun bien n’est identique. L’état, la vue, l’orientation, le stationnement et les charges influencent le prix.',
    limit_3: 'Les biens comparables ont été choisis par votre agent. Ils servent de base à notre échange, pas d’estimation officielle.',
    s_price: 'Notre recommandation',
    rec_range: 'Nous recommandons de proposer votre bien entre {lo} et {hi}.',
    rec_from: 'Nous recommandons de proposer votre bien à partir de {lo}.',
    rec_upto: 'Nous recommandons de proposer votre bien jusqu’à {hi}.',
    rec_ppm: 'Cela représente de {a} à {b} au m².',
    s_plan: 'Comment nous allons le commercialiser',
    m_photos: 'Des photos professionnelles', m_plan: 'Un plan du logement', m_video: 'Une vidéo ou une visite virtuelle', m_portals: 'Une annonce sur les principaux portails immobiliers',
    m_languages: 'L’annonce rédigée en plusieurs langues pour les acheteurs internationaux', m_database: 'Un contact direct avec nos acheteurs enregistrés',
    m_viewings: 'Des visites accompagnées avec un retour après chacune', m_social: 'Une campagne sur les réseaux sociaux',
    s_review: 'Quand nous ferons le point',
    review: 'Nous ferons le point ensemble après {n} semaines : demandes, visites et avis des acheteurs. Si les données montrent que le prix doit évoluer, nous vous expliquerons pourquoi avant tout changement.',
    s_costs: 'Frais de vente à prévoir',
    cost_fee: 'Les honoraires de l’agence, tels que convenus par écrit.',
    cost_plusvalia: 'La taxe municipale sur la plus-value du terrain (plusvalía), fixée par la mairie.',
    cost_gain: 'L’impôt sur une éventuelle plus-value.',
    cost_mortgage: 'Le remboursement d’un éventuel prêt immobilier.',
    cost_certs: 'Le certificat énergétique et tout autre certificat requis pour la vente.',
    s_nonres: 'Si vous n’êtes pas résident fiscal en Espagne',
    nonres: 'L’acheteur doit retenir {ret} pour cent du prix chez le notaire et le verser à l’administration fiscale espagnole. C’est un acompte sur votre impôt, pas un coût supplémentaire, et s’il dépasse l’impôt dû, la différence peut être récupérée.',
    nonres_link: 'Vous pouvez estimer votre situation ici : {url}',
    notes_t: 'Remarques de votre agent',
    disclaimer: 'Ce dossier est une proposition commerciale préparée pour notre rendez-vous. Ce n’est ni une estimation officielle, ni un conseil fiscal ou juridique.',
  },
  nl: {
    doc_title: 'De verkoop van uw woning', prepared_for: 'Opgesteld voor {name}', prepared_by: 'Opgesteld door', meeting: 'Afspraak op {date}',
    s_property: 'De woning', l_type: 'Type', l_area: 'Woonoppervlak', l_beds: 'Slaapkamers', l_baths: 'Badkamers', l_plot: 'Perceel',
    t_apartment: 'Appartement', t_townhouse: 'Rijtjeshuis', t_villa: 'Villa', t_other: 'Anders',
    s_evidence: 'Wat de marktgegevens laten zien',
    h_home: 'Woning', h_status: 'Status', h_price: 'Prijs', h_area: 'Oppervlak', h_ppm: 'Per m²', h_note: 'Opmerkingen',
    st_asking: 'Te koop', st_sold: 'Verkocht',
    med_asking: 'Gebruikelijke vraagprijs per m² bij deze woningen: {x}.',
    med_sold: 'Gebruikelijke verkoopprijs per m² bij deze woningen: {x}.',
    at_hoped: 'De prijs die u voor ogen heeft, {p}, komt neer op {x} per m².',
    pos_above: 'Dat is hoger dan alle vergelijkbare woningen in dit overzicht.',
    pos_within: 'Dat valt binnen de bandbreedte van de vergelijkbare woningen in dit overzicht.',
    pos_below: 'Dat is lager dan alle vergelijkbare woningen in dit overzicht.',
    vs_sold_up: 'Dat is {n} procent boven de gebruikelijke verkoopprijs per m².', vs_sold_down: 'Dat is {n} procent onder de gebruikelijke verkoopprijs per m².', vs_sold_eq: 'Dat komt overeen met de gebruikelijke verkoopprijs per m².',
    vs_ask_up: 'Dat is {n} procent boven de gebruikelijke vraagprijs per m².', vs_ask_down: 'Dat is {n} procent onder de gebruikelijke vraagprijs per m².', vs_ask_eq: 'Dat komt overeen met de gebruikelijke vraagprijs per m².',
    size_note: 'Woningen met een * wijken meer dan een kwart af in grootte, dus hun prijs per m² is een zwakkere leidraad.',
    no_evidence: 'Er zijn geen vergelijkbare woningen met prijs en oppervlak toegevoegd, dus er is nog geen cijfer om mee te vergelijken.',
    limits_t: 'Wat deze gegevens niet kunnen vertellen',
    limit_1: 'Vraagprijzen zijn wat verkopers hopen, niet wat kopers betaalden.',
    limit_2: 'Geen twee woningen zijn gelijk. Staat, uitzicht, ligging, parkeren en servicekosten beïnvloeden de prijs.',
    limit_3: 'De vergelijkbare woningen zijn gekozen door uw makelaar. Ze zijn een leidraad voor ons gesprek, geen formele taxatie.',
    s_price: 'Ons advies',
    rec_range: 'Wij adviseren uw woning aan te bieden tussen {lo} en {hi}.',
    rec_from: 'Wij adviseren uw woning aan te bieden vanaf {lo}.',
    rec_upto: 'Wij adviseren uw woning aan te bieden voor maximaal {hi}.',
    rec_ppm: 'Dat is {a} tot {b} per m².',
    s_plan: 'Zo brengen we de woning op de markt',
    m_photos: 'Professionele fotografie', m_plan: 'Een plattegrond', m_video: 'Een video of virtuele rondleiding', m_portals: 'Plaatsing op de belangrijkste woningportalen',
    m_languages: 'De advertentie in meerdere talen voor internationale kopers', m_database: 'Direct contact met onze ingeschreven kopers',
    m_viewings: 'Begeleide bezichtigingen met terugkoppeling na elke bezichtiging', m_social: 'Een campagne op sociale media',
    s_review: 'Wanneer we evalueren',
    review: 'Na {n} weken bespreken we samen de respons: aanvragen, bezichtigingen en wat kopers zeiden. Als de gegevens erop wijzen dat de prijs moet veranderen, laten we u eerst zien waarom.',
    s_costs: 'Verkoopkosten om rekening mee te houden',
    cost_fee: 'De makelaarscourtage, zoals schriftelijk afgesproken.',
    cost_plusvalia: 'De gemeentelijke belasting op de waardestijging van de grond (plusvalía), vastgesteld door de gemeente.',
    cost_gain: 'Belasting over een eventuele winst.',
    cost_mortgage: 'Het aflossen van een eventuele hypotheek.',
    cost_certs: 'Het energielabel en andere verklaringen die de verkoop vereist.',
    s_nonres: 'Als u niet fiscaal in Spanje woont',
    nonres: 'De koper moet bij de notaris {ret} procent van de prijs inhouden en afdragen aan de Spaanse Belastingdienst. Dat is een voorschot op uw belasting, geen extra kosten, en is het meer dan de belasting die u verschuldigd bent, dan kan het verschil worden teruggevraagd.',
    nonres_link: 'U kunt uw eigen situatie hier inschatten: {url}',
    notes_t: 'Opmerkingen van uw makelaar',
    disclaimer: 'Deze map is een verkoopvoorstel voor ons gesprek. Het is geen formele taxatie en geen fiscaal of juridisch advies.',
  },
};

export function fill(s, vars) {
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
}
