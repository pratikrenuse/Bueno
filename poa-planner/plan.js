// The power of attorney planner, as a pure function.
//
// Two routes exist for a client who cannot come to Spain to sign: before a Spanish consul,
// or before a local notary with an apostille. This compares them for the client's country
// and purposes, lists the powers the document should name, and writes the client a letter.
// Which countries are Apostille parties comes from rules/professional.json.

export const DOC_LANGS = ['en', 'es'];
export const PURPOSE_KEYS = ['buy', 'sell', 'inherit', 'mortgage', 'nie', 'bank', 'taxes'];
export const COUNTRY_KEYS = ['Norway', 'Sweden', 'Germany', 'France', 'Netherlands', 'United Kingdom', 'Belgium', 'Denmark', 'Finland', 'Ireland', 'Switzerland', 'United States', 'Italy', 'Poland', 'other'];

export function route(a, R) {
  if (a.consulate === 'yes') return 'consular';
  return R.apostille.includes(a.country) ? 'notary_apostille' : 'notary_check';
}

const T = {
  en: {
    rec_t: 'Recommended route',
    rec_consular: 'Sign before the Spanish consulate. A power granted before a Spanish consul is valid in Spain without an apostille.',
    rec_notary_apostille: 'Sign before a local notary and add an apostille. {country} is a party to the Hague Apostille Convention.',
    rec_notary_check: 'Sign before a local notary. This country is not on our list of Apostille parties, so check whether it has joined the Convention; if not, the document needs legalisation through the consular chain.',
    a_t: 'Route A: Spanish consulate',
    a_steps: ['Book an appointment at the Spanish consulate that covers the client’s address. Appointments can be scarce.', 'Send the consulate the draft wording prepared with the Spanish notary who will use the power.', 'The client signs before the consul with a valid passport and NIE if they have one.', 'The consulate issues the authorised copy, which is sent to Spain. No apostille and no translation are needed.'],
    b_t: 'Route B: local notary',
    b_steps: ['Prepare the draft with the Spanish notary who will use it, in Spanish or as a bilingual document with Spanish.', 'The client signs before a local notary.', 'The competent authority of that country adds the apostille.', 'If the document is not in Spanish, obtain a sworn translation into Spanish.', 'Send the original by courier. The Spanish notary checks that it is equivalent to a Spanish power and sufficient for the act.'],
    translation_needed: 'The document is not in Spanish, so a sworn translation into Spanish is needed on route B.',
    translation_bilingual: 'A bilingual document with Spanish avoids a separate sworn translation.',
    powers_t: 'Powers the document should name',
    p_buy: ['Sign the purchase deed for the named property and pay the price', 'Pay the taxes and fees of the purchase', 'Sign utility contracts and register the property'],
    p_sell: ['Sign the sale deed for the named property and receive the price', 'Deal with the non-resident retention and the plusvalía', 'Cancel any mortgage on the property'],
    p_inherit: ['Accept the inheritance and sign the division deed', 'Request certificates from registries, including the Registry of Last Wills', 'File and pay inheritance tax and plusvalía'],
    p_mortgage: ['Sign the mortgage deed and the related bank documents'],
    p_nie: ['Apply for and collect the NIE'],
    p_bank: ['Open, operate and close Spanish bank accounts'],
    p_taxes: ['File and pay Spanish taxes and deal with the tax office'],
    tips_t: 'Before anyone signs',
    tips: ['Name the property and the acts precisely. A narrow, specific power is accepted more easily than a vague general one.', 'Ask the Spanish notary who will use the power to approve the draft before it is signed abroad.', 'Allow for courier time and for the notary’s review before the completion date.'],
  },
  es: {
    rec_t: 'Vía recomendada',
    rec_consular: 'Firmar ante el consulado de España. El poder otorgado ante cónsul español es válido en España sin apostilla.',
    rec_notary_apostille: 'Firmar ante notario local y apostillar. {country} es parte del Convenio de La Haya sobre la Apostilla.',
    rec_notary_check: 'Firmar ante notario local. Este país no figura en nuestra lista de Estados parte del Convenio de la Apostilla; compruebe si se ha adherido y, si no, el documento necesitará legalización por vía consular.',
    a_t: 'Vía A: consulado de España',
    a_steps: ['Pedir cita en el consulado de España que corresponda al domicilio del cliente. Las citas pueden escasear.', 'Enviar al consulado el borrador preparado con el notario español que usará el poder.', 'El cliente firma ante el cónsul con pasaporte válido y NIE si lo tiene.', 'El consulado expide la copia autorizada, que se envía a España. No necesita apostilla ni traducción.'],
    b_t: 'Vía B: notario local',
    b_steps: ['Preparar el borrador con el notario español que lo usará, en español o bilingüe con español.', 'El cliente firma ante notario local.', 'La autoridad competente de ese país pone la apostilla.', 'Si el documento no está en español, obtener una traducción jurada al español.', 'Enviar el original por mensajería. El notario español comprueba la equivalencia con un poder español y su suficiencia para el acto.'],
    translation_needed: 'El documento no está en español, por lo que en la vía B hace falta traducción jurada al español.',
    translation_bilingual: 'Un documento bilingüe con español evita una traducción jurada aparte.',
    powers_t: 'Facultades que debe recoger el poder',
    p_buy: ['Firmar la escritura de compraventa del inmueble indicado y pagar el precio', 'Pagar los impuestos y gastos de la compra', 'Firmar contratos de suministros e inscribir el inmueble'],
    p_sell: ['Firmar la escritura de venta del inmueble indicado y cobrar el precio', 'Gestionar la retención de no residentes y la plusvalía', 'Cancelar la hipoteca que grave el inmueble'],
    p_inherit: ['Aceptar la herencia y firmar la escritura de adjudicación', 'Solicitar certificados de registros, incluido el de Actos de Última Voluntad', 'Presentar y pagar el Impuesto sobre Sucesiones y la plusvalía'],
    p_mortgage: ['Firmar la escritura de hipoteca y la documentación bancaria'],
    p_nie: ['Solicitar y recoger el NIE'],
    p_bank: ['Abrir, operar y cancelar cuentas bancarias en España'],
    p_taxes: ['Presentar y pagar impuestos en España y actuar ante la Agencia Tributaria'],
    tips_t: 'Antes de firmar',
    tips: ['Identifique con precisión el inmueble y los actos. Un poder concreto se acepta con más facilidad que uno genérico.', 'Pida al notario español que usará el poder que apruebe el borrador antes de firmarlo en el extranjero.', 'Cuente con el tiempo de mensajería y la revisión notarial antes de la fecha de firma.'],
  },
};

function fill(s, v) {
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : ''));
}

export function buildPlan(a, R, lang = 'en', countryLabel = x => x) {
  const t = T[lang] || T.en;
  const r = route(a, R);
  const powers = PURPOSE_KEYS.filter(k => (a.purposes || []).includes(k)).flatMap(k => t[`p_${k}`]);
  const translation = a.language === 'spanish' ? null : a.language === 'bilingual' ? t.translation_bilingual : t.translation_needed;
  const rules = r === 'consular' ? ['poa.consular', 'poa.foreign_notary', 'poa.apostille_parties'] : ['poa.foreign_notary', 'poa.apostille_parties', 'poa.consular'];
  return {
    route: r,
    recTitle: t.rec_t,
    rec: fill(t[`rec_${r}`], { country: countryLabel(a.country) }),
    routes: [
      { key: 'a', title: t.a_t, steps: t.a_steps, preferred: r === 'consular' },
      { key: 'b', title: t.b_t, steps: t.b_steps, preferred: r !== 'consular' },
    ],
    translation,
    powersTitle: t.powers_t,
    powers,
    tipsTitle: t.tips_t,
    tips: t.tips,
    rules,
  };
}

// The client letter, in seven languages.
const W = {
  en: {
    dear: 'Dear {name},', hello: 'Hello,',
    intro: 'As you cannot be in Spain to sign, someone can sign for you with a power of attorney. Here is how we suggest doing it.',
    consular: 'The simplest route is to sign at the Spanish consulate. A power signed there is valid in Spain without an apostille or a translation. Please book an appointment as soon as you can, as they can be scarce.',
    notary: 'Please sign the power before a notary where you live. It then needs an apostille, and a sworn translation into Spanish unless the document is already bilingual. We will send you the wording first.',
    powers: 'The power will cover: {list}.',
    passport: 'Please bring a valid passport, and your NIE if you already have one.',
    post: 'Once it is signed, send us the original by courier. Our notary checks it before the completion date.',
    close: 'I will send you the draft wording shortly. Please contact me with any question.',
    note: 'This letter is general guidance, not legal advice on your particular case.',
    regards: 'Kind regards,',
    list: { buy: 'buying the property', sell: 'selling the property', inherit: 'the inheritance', mortgage: 'the mortgage', nie: 'your NIE', bank: 'Spanish bank accounts', taxes: 'Spanish taxes' },
  },
  es: {
    dear: 'Estimado/a {name}:', hello: 'Buenos días:',
    intro: 'Como no puede venir a España a firmar, otra persona puede hacerlo por usted con un poder notarial. Le explico cómo proponemos hacerlo.',
    consular: 'La vía más sencilla es firmar en el consulado de España. Un poder firmado allí es válido en España sin apostilla ni traducción. Le recomiendo pedir cita cuanto antes, porque puede haber poca disponibilidad.',
    notary: 'Firme el poder ante un notario de su país. Después necesitará la apostilla y una traducción jurada al español, salvo que el documento ya sea bilingüe. Le enviaremos antes el texto.',
    powers: 'El poder cubrirá: {list}.',
    passport: 'Lleve un pasaporte válido y su NIE si ya lo tiene.',
    post: 'Una vez firmado, envíenos el original por mensajería. Nuestro notario lo revisará antes de la fecha de firma.',
    close: 'Le enviaré el borrador en breve. No dude en consultarme cualquier duda.',
    note: 'Esta carta es una orientación general, no asesoramiento jurídico sobre su caso concreto.',
    regards: 'Un cordial saludo,',
    list: { buy: 'la compra del inmueble', sell: 'la venta del inmueble', inherit: 'la herencia', mortgage: 'la hipoteca', nie: 'su NIE', bank: 'cuentas bancarias en España', taxes: 'impuestos en España' },
  },
  no: {
    dear: 'Hei {name},', hello: 'Hei,',
    intro: 'Siden du ikke kan være i Spania for å signere, kan noen signere for deg med en fullmakt. Slik foreslår vi at det gjøres.',
    consular: 'Det enkleste er å signere på det spanske konsulatet. En fullmakt signert der er gyldig i Spania uten apostille eller oversettelse. Bestill time så snart du kan, for det kan være få ledige.',
    notary: 'Signer fullmakten hos en notar der du bor. Deretter trenger den apostille, og en autorisert oversettelse til spansk hvis dokumentet ikke allerede er tospråklig. Vi sender deg teksten først.',
    powers: 'Fullmakten skal gjelde: {list}.',
    passport: 'Ta med gyldig pass, og NIE hvis du allerede har det.',
    post: 'Når den er signert, send oss originalen med kurér. Notaren vår kontrollerer den før overtakelsen.',
    close: 'Jeg sender deg utkastet snart. Ta gjerne kontakt med spørsmål.',
    note: 'Dette brevet er generell veiledning, ikke juridisk rådgivning i din konkrete sak.',
    regards: 'Med vennlig hilsen',
    list: { buy: 'kjøpet av boligen', sell: 'salget av boligen', inherit: 'arven', mortgage: 'boliglånet', nie: 'NIE-nummeret ditt', bank: 'spanske bankkonti', taxes: 'spanske skatter' },
  },
  sv: {
    dear: 'Hej {name},', hello: 'Hej,',
    intro: 'Eftersom du inte kan vara i Spanien för att skriva under kan någon skriva under åt dig med en fullmakt. Så här föreslår vi att det görs.',
    consular: 'Det enklaste är att skriva under på det spanska konsulatet. En fullmakt som undertecknas där gäller i Spanien utan apostille eller översättning. Boka tid så snart du kan, eftersom det kan vara ont om tider.',
    notary: 'Skriv under fullmakten hos en notarie där du bor. Därefter behövs apostille, och en auktoriserad översättning till spanska om dokumentet inte redan är tvåspråkigt. Vi skickar dig texten först.',
    powers: 'Fullmakten ska omfatta: {list}.',
    passport: 'Ta med giltigt pass, och ditt NIE om du redan har ett.',
    post: 'När den är undertecknad, skicka originalet till oss med bud. Vår notarie granskar den före tillträdet.',
    close: 'Jag skickar utkastet inom kort. Hör gärna av dig med frågor.',
    note: 'Det här brevet är allmän vägledning, inte juridisk rådgivning i ditt enskilda fall.',
    regards: 'Med vänliga hälsningar',
    list: { buy: 'köpet av bostaden', sell: 'försäljningen av bostaden', inherit: 'arvet', mortgage: 'bolånet', nie: 'ditt NIE', bank: 'spanska bankkonton', taxes: 'spanska skatter' },
  },
  de: {
    dear: 'Guten Tag {name},', hello: 'Guten Tag,',
    intro: 'Da Sie zur Unterschrift nicht nach Spanien kommen können, kann jemand mit einer Vollmacht für Sie unterschreiben. So schlagen wir es vor.',
    consular: 'Am einfachsten ist die Unterschrift beim spanischen Konsulat. Eine dort erteilte Vollmacht gilt in Spanien ohne Apostille und ohne Übersetzung. Bitte vereinbaren Sie möglichst bald einen Termin, da Termine knapp sein können.',
    notary: 'Bitte unterschreiben Sie die Vollmacht bei einem Notar an Ihrem Wohnort. Danach braucht sie eine Apostille und eine beglaubigte Übersetzung ins Spanische, sofern das Dokument nicht zweisprachig ist. Den Wortlaut senden wir Ihnen vorab.',
    powers: 'Die Vollmacht umfasst: {list}.',
    passport: 'Bitte bringen Sie einen gültigen Reisepass mit, und Ihre NIE, falls vorhanden.',
    post: 'Senden Sie uns das unterschriebene Original bitte per Kurier. Unser Notar prüft es vor dem Beurkundungstermin.',
    close: 'Den Entwurf erhalten Sie in Kürze. Bei Fragen melden Sie sich gern.',
    note: 'Dieses Schreiben ist eine allgemeine Orientierung, keine Rechtsberatung zu Ihrem Einzelfall.',
    regards: 'Mit freundlichen Grüßen',
    list: { buy: 'den Kauf der Immobilie', sell: 'den Verkauf der Immobilie', inherit: 'die Erbschaft', mortgage: 'die Hypothek', nie: 'Ihre NIE', bank: 'spanische Bankkonten', taxes: 'spanische Steuern' },
  },
  fr: {
    dear: 'Bonjour {name},', hello: 'Bonjour,',
    intro: 'Comme vous ne pouvez pas venir en Espagne pour signer, quelqu’un peut signer pour vous grâce à une procuration. Voici ce que nous proposons.',
    consular: 'Le plus simple est de signer au consulat d’Espagne. Une procuration signée là-bas est valable en Espagne sans apostille ni traduction. Prenez rendez-vous dès que possible, les créneaux peuvent être rares.',
    notary: 'Signez la procuration devant un notaire de votre pays. Elle devra ensuite être apostillée et traduite en espagnol par un traducteur assermenté, sauf si le document est déjà bilingue. Nous vous enverrons d’abord le texte.',
    powers: 'La procuration couvrira : {list}.',
    passport: 'Munissez-vous d’un passeport valide, et de votre NIE si vous l’avez déjà.',
    post: 'Une fois signée, envoyez-nous l’original par coursier. Notre notaire la vérifiera avant la date de signature.',
    close: 'Je vous envoie le projet sous peu. N’hésitez pas à me contacter pour toute question.',
    note: 'Cette lettre est une information générale, pas un conseil juridique sur votre situation.',
    regards: 'Bien cordialement,',
    list: { buy: 'l’achat du bien', sell: 'la vente du bien', inherit: 'la succession', mortgage: 'le prêt immobilier', nie: 'votre NIE', bank: 'des comptes bancaires espagnols', taxes: 'les impôts espagnols' },
  },
  nl: {
    dear: 'Beste {name},', hello: 'Goedendag,',
    intro: 'Omdat u niet naar Spanje kunt komen om te tekenen, kan iemand met een volmacht voor u tekenen. Zo stellen wij het voor.',
    consular: 'Het eenvoudigst is tekenen op het Spaanse consulaat. Een volmacht die daar wordt getekend, is in Spanje geldig zonder apostille of vertaling. Maak zo snel mogelijk een afspraak, want er is vaak weinig plek.',
    notary: 'Teken de volmacht bij een notaris waar u woont. Daarna heeft die een apostille nodig, en een beëdigde vertaling in het Spaans tenzij het document al tweetalig is. We sturen u eerst de tekst.',
    powers: 'De volmacht geldt voor: {list}.',
    passport: 'Neem een geldig paspoort mee, en uw NIE als u die al heeft.',
    post: 'Stuur ons na ondertekening het origineel per koerier. Onze notaris controleert het vóór de overdrachtsdatum.',
    close: 'Ik stuur u binnenkort het concept. Neem gerust contact op met vragen.',
    note: 'Deze brief is algemene informatie, geen juridisch advies over uw situatie.',
    regards: 'Met vriendelijke groet,',
    list: { buy: 'de aankoop van de woning', sell: 'de verkoop van de woning', inherit: 'de erfenis', mortgage: 'de hypotheek', nie: 'uw NIE', bank: 'Spaanse bankrekeningen', taxes: 'Spaanse belastingen' },
  },
};

export const POA_LETTER = W;

export function buildPoaLetter(a, plan, lang) {
  const w = W[lang] || W.en;
  const name = (a.clientName || '').trim();
  const items = PURPOSE_KEYS.filter(k => (a.purposes || []).includes(k)).map(k => w.list[k]);
  const p = [w.intro, plan.route === 'consular' ? w.consular : w.notary];
  if (items.length) p.push(fill(w.powers, { list: items.join(', ') }));
  p.push(w.passport, w.post, w.close);
  return { greeting: name ? fill(w.dear, { name }) : w.hello, paragraphs: p, note: w.note, regards: w.regards };
}

export const COUNTRY_ES = {
  Norway: 'Noruega', Sweden: 'Suecia', Germany: 'Alemania', France: 'Francia', Netherlands: 'Países Bajos',
  'United Kingdom': 'Reino Unido', Belgium: 'Bélgica', Denmark: 'Dinamarca', Finland: 'Finlandia', Ireland: 'Irlanda',
  Switzerland: 'Suiza', 'United States': 'Estados Unidos', Italy: 'Italia', Poland: 'Polonia',
};
