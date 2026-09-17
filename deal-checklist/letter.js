// The client letter, in the client's language.
//
// Short, plain sentences chosen from the same answers as the checklist. It tells the client
// what matters to them and nothing that is the professional's job to track. Figures arrive
// in `R` from the rules base; dates are formatted by the caller in the letter's language.

export const LETTER_LANGS = ['en', 'es', 'no', 'sv', 'de', 'fr', 'nl'];

export const LETTER_LANG_LABELS = {
  en: 'English', es: 'Español', no: 'Norsk', sv: 'Svenska', de: 'Deutsch', fr: 'Français', nl: 'Nederlands',
};

export const DATE_LOCALE = {
  en: 'en-GB', es: 'es-ES', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL',
};

const W = {
  en: {
    dear: 'Dear {name},', hello: 'Hello,',
    intro_buy: 'Here is where your purchase{prop} stands, and what happens next.',
    intro_sell: 'Here is where your sale{prop} stands, and what happens next.',
    prop: ' of {p}',
    date: 'Completion is planned for {d}.',
    nie: 'You need a Spanish tax identification number (NIE) before you can sign at the notary. We should start it now.',
    account: 'You will need a way to pay in euros in Spain. A Spanish account is the usual route, and it takes some time to open.',
    mortgage: 'Your lender will value the property and send you a binding offer before you sign. Please do not commit to a non-refundable deposit before that offer arrives.',
    poa: 'If you cannot be in Spain to sign, a power of attorney lets someone sign for you. Signed abroad, it needs an apostille and can take several weeks.',
    newbuild: 'As this is a new home, the purchase carries IVA at {iva} percent on the price.',
    canarias: 'As this is a new home in the Canary Islands, the purchase carries IGIC rather than IVA. The general rate is {igic} percent.',
    resale: 'As this is a resale, you pay transfer tax set by the region, on the higher of the price and the official reference value.',
    buyer_nonres: 'As an owner who is not tax resident in Spain, you will file a short Spanish tax return for the property every year.',
    ret: 'Because you are not tax resident in Spain, the buyer must hold back {ret} percent of the price and pay it to the Spanish tax office. It is an advance on your tax, not an extra cost. If it is more than the tax you owe, you can reclaim the difference.',
    ret_unsure: 'We still need to confirm your tax residency. If you are not tax resident in Spain, the buyer must hold back {ret} percent of the price for the tax office.',
    window: 'Your capital gains return can be filed from {open} to {close}.',
    pv: 'The town hall tax on the increase in land value (plusvalía) must be declared within {pv} working days of signing.',
    docs: 'Please send us the energy performance certificate, your latest IBI receipt and a statement from the community that the fees are paid.',
    close: 'I will keep you updated at each step. If anything here is unclear, please call or write to me.',
    note: 'This letter is general guidance, not tax or legal advice.',
    regards: 'Kind regards,',
  },
  es: {
    dear: 'Estimado/a {name}:', hello: 'Buenos días:',
    intro_buy: 'Le resumo en qué punto está su compra{prop} y cuáles son los próximos pasos.',
    intro_sell: 'Le resumo en qué punto está su venta{prop} y cuáles son los próximos pasos.',
    prop: ' de {p}',
    date: 'La firma está prevista para el {d}.',
    nie: 'Necesita un número de identidad de extranjero (NIE) antes de firmar en la notaría. Conviene iniciarlo ya.',
    account: 'Necesitará una forma de pagar en euros en España. Lo habitual es una cuenta española, y abrirla lleva algo de tiempo.',
    mortgage: 'El banco tasará la vivienda y le enviará una oferta vinculante antes de la firma. Le recomiendo no comprometer una señal no recuperable antes de recibirla.',
    poa: 'Si no puede venir a España a firmar, un poder permite que otra persona firme por usted. Si se firma en el extranjero, necesita apostilla y puede tardar varias semanas.',
    newbuild: 'Al ser vivienda nueva, la compra lleva IVA del {iva} por ciento sobre el precio.',
    canarias: 'Al ser vivienda nueva en Canarias, la compra lleva IGIC en lugar de IVA. El tipo general es del {igic} por ciento.',
    resale: 'Al ser vivienda de segunda mano, paga el impuesto de transmisiones de su comunidad autónoma, sobre el mayor entre el precio y el valor de referencia.',
    buyer_nonres: 'Como propietario no residente fiscal en España, presentará cada año una breve declaración por el inmueble.',
    ret: 'Como no es residente fiscal en España, el comprador debe retener el {ret} por ciento del precio e ingresarlo en Hacienda. Es un pago a cuenta de su impuesto, no un coste añadido. Si supera el impuesto que le corresponde, puede solicitar la devolución de la diferencia.',
    ret_unsure: 'Aún debemos confirmar su residencia fiscal. Si no es residente fiscal en España, el comprador debe retener el {ret} por ciento del precio para Hacienda.',
    window: 'La declaración de la ganancia puede presentarse del {open} al {close}.',
    pv: 'La plusvalía municipal debe declararse en el ayuntamiento en el plazo de {pv} días hábiles desde la firma.',
    docs: 'Por favor, envíenos el certificado energético, el último recibo del IBI y un certificado de la comunidad de estar al corriente de pago.',
    close: 'Le mantendré informado en cada paso. Si algo no queda claro, llámeme o escríbame.',
    note: 'Esta carta es una orientación general, no asesoramiento fiscal ni jurídico.',
    regards: 'Un cordial saludo,',
  },
  no: {
    dear: 'Hei {name},', hello: 'Hei,',
    intro_buy: 'Her er status for kjøpet ditt{prop}, og hva som skjer videre.',
    intro_sell: 'Her er status for salget ditt{prop}, og hva som skjer videre.',
    prop: ' av {p}',
    date: 'Overtakelsen er planlagt til {d}.',
    nie: 'Du trenger et spansk identifikasjonsnummer for utlendinger (NIE) før du kan signere hos notaren. Vi bør starte på det nå.',
    account: 'Du trenger en måte å betale i euro i Spania. En spansk konto er det vanlige, og det tar litt tid å åpne den.',
    mortgage: 'Banken takserer boligen og sender deg et bindende tilbud før du signerer. Ikke bind deg til et depositum du ikke får tilbake før tilbudet er kommet.',
    poa: 'Hvis du ikke kan være i Spania for å signere, kan en fullmakt la noen signere for deg. Signeres den i utlandet, trenger den apostille og kan ta flere uker.',
    newbuild: 'Siden dette er en ny bolig, kommer det IVA på {iva} prosent av prisen.',
    canarias: 'Siden dette er en ny bolig på Kanariøyene, kommer det IGIC i stedet for IVA. Den generelle satsen er {igic} prosent.',
    resale: 'Siden dette er en brukt bolig, betaler du dokumentavgift fastsatt av regionen, av det høyeste av prisen og den offisielle referanseverdien.',
    buyer_nonres: 'Som eier uten skattemessig bosted i Spania leverer du en kort spansk skattemelding for boligen hvert år.',
    ret: 'Fordi du ikke er skattemessig bosatt i Spania, må kjøperen holde tilbake {ret} prosent av prisen og betale det til det spanske skattekontoret. Det er et forskudd på skatten din, ikke en ekstra kostnad. Er det mer enn skatten du skylder, kan du kreve differansen tilbake.',
    ret_unsure: 'Vi må fortsatt bekrefte hvor du er skattemessig bosatt. Er du ikke skattemessig bosatt i Spania, må kjøperen holde tilbake {ret} prosent av prisen til skattekontoret.',
    window: 'Skattemeldingen for gevinsten kan leveres fra {open} til {close}.',
    pv: 'Kommunens skatt på verdiøkningen av tomten (plusvalía) må meldes innen {pv} virkedager etter signering.',
    docs: 'Send oss energiattesten, den siste IBI-kvitteringen og en bekreftelse fra sameiet på at fellesutgiftene er betalt.',
    close: 'Jeg holder deg oppdatert underveis. Er noe her uklart, er det bare å ringe eller skrive til meg.',
    note: 'Dette brevet er generell veiledning, ikke skatterådgivning eller juridisk rådgivning.',
    regards: 'Med vennlig hilsen',
  },
  sv: {
    dear: 'Hej {name},', hello: 'Hej,',
    intro_buy: 'Här är läget för ditt köp{prop}, och vad som händer härnäst.',
    intro_sell: 'Här är läget för din försäljning{prop}, och vad som händer härnäst.',
    prop: ' av {p}',
    date: 'Tillträdet är planerat till {d}.',
    nie: 'Du behöver ett spanskt identitetsnummer för utlänningar (NIE) innan du kan skriva under hos notarien. Vi bör börja med det nu.',
    account: 'Du behöver ett sätt att betala i euro i Spanien. Ett spanskt konto är det vanliga, och det tar en tid att öppna.',
    mortgage: 'Banken värderar fastigheten och skickar ett bindande erbjudande innan du skriver under. Bind dig inte vid en handpenning som inte återbetalas innan erbjudandet har kommit.',
    poa: 'Om du inte kan vara i Spanien för att skriva under kan en fullmakt låta någon skriva under åt dig. Undertecknas den utomlands behövs apostille, och det kan ta flera veckor.',
    newbuild: 'Eftersom det är en nyproducerad bostad tillkommer IVA på {iva} procent av priset.',
    canarias: 'Eftersom det är en nyproducerad bostad på Kanarieöarna tillkommer IGIC i stället för IVA. Den allmänna satsen är {igic} procent.',
    resale: 'Eftersom det är en begagnad bostad betalar du överlåtelseskatt som regionen bestämmer, på det högsta av priset och det officiella referensvärdet.',
    buyer_nonres: 'Som ägare utan skatterättslig hemvist i Spanien lämnar du varje år en kort spansk deklaration för fastigheten.',
    ret: 'Eftersom du inte har skatterättslig hemvist i Spanien måste köparen hålla inne {ret} procent av priset och betala det till den spanska skattemyndigheten. Det är en förskottsbetalning av din skatt, inte en extra kostnad. Är det mer än skatten du ska betala kan du begära tillbaka mellanskillnaden.',
    ret_unsure: 'Vi behöver fortfarande bekräfta din skatterättsliga hemvist. Har du inte hemvist i Spanien måste köparen hålla inne {ret} procent av priset till skattemyndigheten.',
    window: 'Deklarationen för vinsten kan lämnas från {open} till {close}.',
    pv: 'Kommunens skatt på markens värdeökning (plusvalía) ska anmälas inom {pv} arbetsdagar från undertecknandet.',
    docs: 'Skicka oss energideklarationen, det senaste IBI-kvittot och ett intyg från samfälligheten om att avgifterna är betalda.',
    close: 'Jag håller dig uppdaterad i varje steg. Om något är oklart går det bra att ringa eller skriva till mig.',
    note: 'Det här brevet är allmän vägledning, inte skatterådgivning eller juridisk rådgivning.',
    regards: 'Med vänliga hälsningar',
  },
  de: {
    dear: 'Guten Tag {name},', hello: 'Guten Tag,',
    intro_buy: 'Hier ist der Stand Ihres Kaufs{prop} und was als Nächstes geschieht.',
    intro_sell: 'Hier ist der Stand Ihres Verkaufs{prop} und was als Nächstes geschieht.',
    prop: ' von {p}',
    date: 'Die Beurkundung ist für den {d} geplant.',
    nie: 'Sie benötigen eine spanische Ausländeridentifikationsnummer (NIE), bevor Sie beim Notar unterschreiben können. Wir sollten sie jetzt beantragen.',
    account: 'Sie brauchen eine Möglichkeit, in Spanien in Euro zu zahlen. Üblich ist ein spanisches Konto, und die Eröffnung dauert etwas.',
    mortgage: 'Ihre Bank bewertet die Immobilie und sendet Ihnen vor der Unterschrift ein verbindliches Angebot. Bitte leisten Sie keine nicht erstattungsfähige Anzahlung, bevor dieses Angebot vorliegt.',
    poa: 'Wenn Sie zur Unterschrift nicht nach Spanien kommen können, kann jemand mit einer Vollmacht für Sie unterschreiben. Im Ausland unterzeichnet, benötigt sie eine Apostille und kann mehrere Wochen dauern.',
    newbuild: 'Da es sich um einen Neubau handelt, fällt auf den Kaufpreis IVA in Höhe von {iva} Prozent an.',
    canarias: 'Da es sich um einen Neubau auf den Kanarischen Inseln handelt, fällt IGIC statt IVA an. Der allgemeine Satz beträgt {igic} Prozent.',
    resale: 'Da es sich um eine Bestandsimmobilie handelt, zahlen Sie die von der Region festgelegte Grunderwerbsteuer auf den höheren Wert aus Kaufpreis und amtlichem Referenzwert.',
    buyer_nonres: 'Als Eigentümer ohne steuerlichen Wohnsitz in Spanien geben Sie für die Immobilie jedes Jahr eine kurze spanische Steuererklärung ab.',
    ret: 'Da Sie in Spanien nicht steuerlich ansässig sind, muss der Käufer {ret} Prozent des Kaufpreises einbehalten und an das spanische Finanzamt abführen. Das ist eine Vorauszahlung auf Ihre Steuer, keine zusätzliche Belastung. Ist der Betrag höher als Ihre Steuer, können Sie die Differenz zurückfordern.',
    ret_unsure: 'Wir müssen Ihren steuerlichen Wohnsitz noch bestätigen. Sind Sie in Spanien nicht steuerlich ansässig, muss der Käufer {ret} Prozent des Kaufpreises für das Finanzamt einbehalten.',
    window: 'Die Erklärung zum Veräußerungsgewinn kann vom {open} bis zum {close} abgegeben werden.',
    pv: 'Die kommunale Steuer auf den Wertzuwachs des Grundstücks (plusvalía) muss innerhalb von {pv} Werktagen nach der Beurkundung erklärt werden.',
    docs: 'Bitte senden Sie uns den Energieausweis, den letzten IBI-Beleg und eine Bestätigung der Eigentümergemeinschaft, dass die Beiträge bezahlt sind.',
    close: 'Ich halte Sie bei jedem Schritt auf dem Laufenden. Wenn etwas unklar ist, rufen Sie mich gern an oder schreiben Sie mir.',
    note: 'Dieses Schreiben ist eine allgemeine Orientierung, keine Steuer- oder Rechtsberatung.',
    regards: 'Mit freundlichen Grüßen',
  },
  fr: {
    dear: 'Bonjour {name},', hello: 'Bonjour,',
    intro_buy: 'Voici où en est votre achat{prop}, et ce qui va suivre.',
    intro_sell: 'Voici où en est votre vente{prop}, et ce qui va suivre.',
    prop: ' de {p}',
    date: 'La signature est prévue le {d}.',
    nie: "Vous avez besoin d'un numéro d'identification d'étranger (NIE) avant de pouvoir signer chez le notaire. Il faut le demander dès maintenant.",
    account: "Vous aurez besoin d'un moyen de payer en euros en Espagne. Un compte espagnol est la solution habituelle, et son ouverture prend un peu de temps.",
    mortgage: "Votre banque évaluera le bien et vous enverra une offre ferme avant la signature. Ne vous engagez pas sur un acompte non remboursable avant de l'avoir reçue.",
    poa: "Si vous ne pouvez pas venir en Espagne pour signer, une procuration permet à quelqu'un de signer pour vous. Signée à l'étranger, elle doit être apostillée et peut prendre plusieurs semaines.",
    newbuild: "S'agissant d'un logement neuf, l'achat est soumis à l'IVA de {iva} pour cent sur le prix.",
    canarias: "S'agissant d'un logement neuf aux Canaries, l'achat est soumis à l'IGIC et non à l'IVA. Le taux général est de {igic} pour cent.",
    resale: "S'agissant d'un bien ancien, vous payez les droits de mutation fixés par la région, sur le plus élevé du prix et de la valeur de référence officielle.",
    buyer_nonres: "En tant que propriétaire non résident fiscal en Espagne, vous déposerez chaque année une courte déclaration espagnole pour le bien.",
    ret: "Comme vous n'êtes pas résident fiscal en Espagne, l'acheteur doit retenir {ret} pour cent du prix et le verser à l'administration fiscale espagnole. C'est un acompte sur votre impôt, pas un coût supplémentaire. S'il dépasse l'impôt dû, vous pouvez récupérer la différence.",
    ret_unsure: "Nous devons encore confirmer votre résidence fiscale. Si vous n'êtes pas résident fiscal en Espagne, l'acheteur doit retenir {ret} pour cent du prix pour l'administration fiscale.",
    window: 'La déclaration de plus-value peut être déposée du {open} au {close}.',
    pv: "La taxe municipale sur la plus-value du terrain (plusvalía) doit être déclarée dans les {pv} jours ouvrables suivant la signature.",
    docs: "Merci de nous envoyer le certificat énergétique, le dernier avis d'IBI et une attestation de la copropriété indiquant que les charges sont payées.",
    close: "Je vous tiendrai informé à chaque étape. Si un point n'est pas clair, n'hésitez pas à m'appeler ou à m'écrire.",
    note: 'Cette lettre est une information générale, pas un conseil fiscal ou juridique.',
    regards: 'Bien cordialement,',
  },
  nl: {
    dear: 'Beste {name},', hello: 'Goedendag,',
    intro_buy: 'Hier leest u hoe het staat met uw aankoop{prop}, en wat er nu gebeurt.',
    intro_sell: 'Hier leest u hoe het staat met uw verkoop{prop}, en wat er nu gebeurt.',
    prop: ' van {p}',
    date: 'De overdracht is gepland op {d}.',
    nie: 'U heeft een Spaans identificatienummer voor buitenlanders (NIE) nodig voordat u bij de notaris kunt tekenen. We kunnen dat het beste nu aanvragen.',
    account: 'U heeft een manier nodig om in Spanje in euro te betalen. Een Spaanse rekening is gebruikelijk, en het openen daarvan kost wat tijd.',
    mortgage: 'Uw bank laat de woning taxeren en stuurt u een bindend aanbod voordat u tekent. Ga geen aanbetaling aan die u niet terugkrijgt voordat dat aanbod er is.',
    poa: 'Als u niet naar Spanje kunt komen om te tekenen, kan iemand met een volmacht voor u tekenen. Getekend in het buitenland heeft die een apostille nodig en dat kan enkele weken duren.',
    newbuild: 'Omdat het om nieuwbouw gaat, wordt over de prijs IVA van {iva} procent geheven.',
    canarias: 'Omdat het om nieuwbouw op de Canarische Eilanden gaat, wordt IGIC geheven in plaats van IVA. Het algemene tarief is {igic} procent.',
    resale: 'Omdat het om een bestaande woning gaat, betaalt u overdrachtsbelasting die de regio vaststelt, over het hoogste van de prijs en de officiële referentiewaarde.',
    buyer_nonres: 'Als eigenaar die niet fiscaal in Spanje woont, doet u elk jaar een korte Spaanse aangifte voor de woning.',
    ret: 'Omdat u niet fiscaal in Spanje woont, moet de koper {ret} procent van de prijs inhouden en afdragen aan de Spaanse Belastingdienst. Dat is een voorschot op uw belasting, geen extra kosten. Is het meer dan de belasting die u verschuldigd bent, dan kunt u het verschil terugvragen.',
    ret_unsure: 'We moeten uw fiscale woonplaats nog bevestigen. Woont u fiscaal niet in Spanje, dan moet de koper {ret} procent van de prijs inhouden voor de Belastingdienst.',
    window: 'De aangifte over de winst kan worden ingediend van {open} tot {close}.',
    pv: 'De gemeentelijke belasting op de waardestijging van de grond (plusvalía) moet binnen {pv} werkdagen na ondertekening worden aangegeven.',
    docs: 'Stuur ons alstublieft het energielabel, het laatste IBI-aanslagbiljet en een verklaring van de vereniging van eigenaren dat de bijdragen zijn betaald.',
    close: 'Ik houd u bij elke stap op de hoogte. Is er iets onduidelijk, bel of schrijf me gerust.',
    note: 'Deze brief is algemene informatie, geen fiscaal of juridisch advies.',
    regards: 'Met vriendelijke groet,',
  },
};

function fill(s, vars) {
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
}

// Returns { greeting, paragraphs, note, regards }. `recipient` is 'buyer' or 'seller'.
export function buildLetter(a, R, lang, dates, fmtDate) {
  const w = W[lang] || W.en;
  const recipient = a.side === 'seller' ? 'seller' : a.side === 'buyer' ? 'buyer' : (a.recipient || 'buyer');
  const vars = {
    name: (a.clientName || '').trim(),
    p: (a.propertyRef || '').trim(),
    ret: R.retentionRate, iva: R.ivaNewBuild, igic: R.igicGeneral, pv: R.plusvaliaWorkingDays,
  };
  vars.prop = vars.p ? fill(w.prop, vars) : '';

  const out = [];
  out.push(fill(recipient === 'seller' ? w.intro_sell : w.intro_buy, vars));
  if (dates) out.push(fill(w.date, { d: fmtDate(dates.completion) }));

  if (recipient === 'buyer') {
    if (a.nie !== 'yes') out.push(w.nie);
    if (a.account !== 'yes') out.push(w.account);
    if (a.finance === 'mortgage') out.push(w.mortgage);
    if (a.signing === 'poa' || a.signing === 'undecided') out.push(w.poa);
    if (a.property === 'newbuild') out.push(fill(a.region === 'canarias' ? w.canarias : w.newbuild, vars));
    else out.push(w.resale);
    if (a.buyer !== 'resident') out.push(w.buyer_nonres);
  } else {
    if (a.seller === 'nonresident') out.push(fill(w.ret, vars));
    if (a.seller === 'unsure') out.push(fill(w.ret_unsure, vars));
    if (a.seller !== 'resident' && dates) out.push(fill(w.window, { open: fmtDate(dates.open210), close: fmtDate(dates.close210) }));
    out.push(fill(w.pv, vars));
    out.push(w.docs);
    if (a.signing === 'poa' || a.signing === 'undecided') out.push(w.poa);
  }
  out.push(w.close);

  return {
    greeting: vars.name ? fill(w.dear, vars) : w.hello,
    paragraphs: out,
    note: w.note,
    regards: w.regards,
    recipient,
  };
}
