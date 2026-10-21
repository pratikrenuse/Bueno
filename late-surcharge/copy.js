// Every string the late-surcharge tool renders, in all six site languages.
//
// Figures never live here. Every percentage, date and count arrives from the rules base
// through a {placeholder}, so a translation cannot go stale when a rule changes.
// Two light markers are read by index.jsx: **text** is set in bold, and [label](/path)
// becomes a link to another tool on the site in the reader's language.
// Spanish procedure names (modelo 210, recargo, requerimiento, propuesta de liquidacion,
// declaracion extemporanea sin requerimiento previo, Ley General Tributaria) stay in
// Spanish in every language, because they are the words printed on the letter.

const en = {
  eyebrow: 'Free tool',
  headline: 'You filed your Spanish tax return late. What does it cost?',
  body: 'Less than most owners fear, and on a completely different scale once a letter has arrived. The number depends on one thing above all: whether you got there before the tax office did.',
  points: [
    'The surcharge, the total, and the name of the procedure',
    'The deadline your clock ran from, worked out from the tax year',
    'The eight-day gap that makes owners think they have paid',
  ],
  cta: 'Work out what I owe',
  minutes: 'Under two minutes',
  note: 'Guidance for property owners in Spain. Not tax advice.',
  next: 'Continue',
  source: 'Source',

  q_return: 'Which return is it?',
  q_return_hint: 'Both are modelo 210. They have different deadlines and the deadlines moved recently, which is most of why people are late.',
  return_imputed: 'The annual return for a property you use yourself',
  return_imputed_d: 'Imputed income. Filed every year on a Spanish property that is not let out, even though no money changed hands',
  return_rental: 'The return for rent you received',
  return_rental_d: 'Rental income from letting the property, short term or long term',

  q_year: 'Which tax year?',
  q_year_hint: 'The year the income belonged to, not the year you should have filed. A Spanish return is always filed in the year after the one it covers.',
  year_filed: 'Filed during {year}',

  q_amount: 'How much tax was owed on that return?',
  q_amount_hint: 'If you do not know it yet, leave this blank. You will still get the percentage and the deadline, and you can come back with the figure.',
  amount_label: 'Tax owed on the return',
  amount_skip: 'Leave blank if you do not know',

  q_letter: 'Has the tax office already contacted you about this return?',
  q_letter_hint: 'This is the question that changes everything. A requerimiento, a propuesta de liquidacion, or any letter naming this return or this year. A general notice, a padron letter or the IBI bill from the town hall is not this.',
  letter_no: 'No, nothing has arrived',
  letter_no_d: 'You worked out yourself that the return is late',
  letter_yes: 'Yes, a letter has arrived about it',
  letter_yes_d: 'The tax office named this return or this year before you filed',

  result_surcharge: 'A surcharge, not a fine',
  result_notlate: 'You are not late',
  result_unknown: 'We cannot date your deadline for that year',
  result_penalty: 'A letter changes which regime you are in',

  head_notlate_due: 'This one is due {date}',
  head_amount: '{extra} on top of the tax, {total} in total',
  head_pct: 'A {pct} percent surcharge',
  head_pct_interest: 'A {pct} percent surcharge, plus interest',

  sub_penalty: 'Once the tax office has named this return, the surcharge for filing late of your own accord is no longer available. What follows is a sanction procedure, and it is a heavier regime. We are not going to put a percentage on it, and the reason is below.',
  sub_unknown: 'Rental income for that year sat in the old quarterly regime, and we do not hold a confirmed filing window for it. We would rather tell you that than date your deadline by guesswork and build a surcharge on top of it.',
  sub_notlate: 'Nothing is owed as a surcharge, because the window has not closed. There is one date below that is earlier than the one you were expecting, and it is worth reading.',
  sub_surcharge: 'This is a recargo por declaracion extemporanea sin requerimiento previo: the surcharge for coming forward on your own. It is not a fine, and no penalty may be added on top of it.',

  return_name_imputed: 'Imputed income, modelo 210',
  return_name_rental: 'Rental income, modelo 210',

  owe_title: 'What you owe',
  row_return: 'Return',
  row_year: 'Tax year',
  row_deadline: 'The deadline the clock ran from',
  row_month: 'Month of delay you are in',
  row_month_value: 'Month {n}',
  row_surcharge: 'Surcharge',
  row_pct: '{pct} percent',
  row_pct_flat: '{pct} percent, flat',
  row_tax: 'Tax owed on the return',
  row_interest: 'Late-payment interest',
  row_total: 'Total payable',
  owe_no_tax: 'You did not give us the tax figure, so the percentage is as far as we can take it. Put the amount from the return into this tool and it will do the rest.',

  name_title: 'The name of the procedure, so you can say it out loud',
  name_p1: 'You are filing a **declaracion extemporanea sin requerimiento previo**, a late self-assessment made without a prior demand, and what you pay on top is a **recargo**, a surcharge, under art. 27 of the Ley General Tributaria. It is not a sancion and it is not a multa. If anyone tells you that filing late of your own accord means a fine, that is the wrong word for this.',
  name_p2: 'The surcharge starts at {base} percent and adds another {per_month} percent for each complete month, to a maximum of {max} percent at twelve months. From month {from_month} it stops climbing and becomes a flat {flat} percent, with late-payment interest running from the day after the twelfth month.',

  reduce_title: 'Pay on time and this drops by {pct} percent',
  reduce_p: 'When the tax office notifies you of the surcharge it opens a payment window. Pay the surcharge in full inside that window, with the tax debt itself settled, and the surcharge is reduced by {pct} percent. It is the cheapest {pct} percent available to you and it is lost by doing nothing.',
  row_assessed: 'Surcharge as assessed',
  row_reduced: 'Reduced by {pct} percent',
  row_total_window: 'Total if you pay inside the window',

  interest_title: 'Interest, and how far we can price it',
  interest_p1: 'Past twelve months the surcharge goes flat and late-payment interest starts running from the day after the twelfth month, which for you was {date}. The rate we hold is {rate} percent for {year}, and the same rate applied the year before.',
  interest_p2: 'Your delay reaches back further than the rate we hold. We have priced {priced} days and left {unpriced} days unpriced rather than apply a rate to a period it did not cover, so treat the interest line as understated by that stretch.',

  changed_title: 'What has changed',
  changed_p1: 'The surcharge in art. 27 is the price of coming forward first. It is available only where you file before the tax office asks. Once a demand naming this return has gone out, that door is shut. What you are in now is a sanction procedure: the conduct is treated as a tax infraction, and the charge is a proportional fine on the amount left unpaid, together with late-payment interest.',
  changed_p2: 'It is a materially heavier regime than the surcharge, and the {pct} percent reduction that goes with the surcharge is not part of it.',

  nonumber_title: 'Why there is no number here',
  nonumber_p: 'We could not read the governing article of the Ley General Tributaria in full from the official consolidated text, which truncates it. We hold an unconfirmed minimum figure and we are not going to print it as though it were settled, as a percentage in a headline is exactly how an unconfirmed figure becomes something an owner repeats to their gestor. Take the letter to a professional and have the proposed amount checked against the article itself.',

  week_title: 'What to do this week',
  week_steps: [
    'Read the deadline printed in the letter. That is now the date that governs everything, and it is usually shorter than people assume.',
    'Get the return itself filed and the tax paid if it is still outstanding. The unpaid amount is what the fine is proportional to, so it is not a neutral thing to leave sitting.',
    'Take the letter to a gestor before you reply to it. A proposal is a proposal, and the response window is where any argument about it belongs.',
    'If the letter turns out not to be about this return or this year, come back and answer that question differently. The two routes have nothing in common and we will not show you both at once.',
  ],

  window_title: 'Your window',
  row_opens: 'Filing opens',
  row_closes: 'Filing closes',
  row_debit: 'Direct debit closes',
  nothing_title: 'Nothing is owed yet',
  nothing_p: 'The surcharge only starts once the filing window has closed. From the day after it does, it begins at {base} percent and climbs {per_month} percent a month. Filing early costs nothing and removes the whole question.',

  cantell_title: 'What we can tell you',
  cantell_p1: 'The surcharge ladder itself does not depend on the year. It starts at {base} percent, adds {per_month} percent for each complete month, caps at {max} percent at twelve months, and from month {from_month} becomes a flat {flat} percent with interest. The {pct} percent reduction for paying inside the window applies the same way.',
  cantell_p2: 'What we cannot do is place your return on that ladder, because that needs the filing deadline for a year we do not hold a verified window for. Ask your gestor for the exact date the window closed, count the complete months from it, and the ladder above gives you the rest.',
  recent_title: 'If you also have a more recent year',
  recent_p: 'Start again and pick {year} or later. Those windows are in the rules base and the tool will date them for you.',

  gap_title: 'The gap almost nobody is told about',
  gap_p1: 'Filing and paying by direct debit close on different days. For this return the filing window runs to {deadline}, but if you want the tax collected by direct debit the return has to be in by {debit}. That is {days} days earlier.',
  gap_p2: 'Submit inside those last {days} days and the return is on time, but the direct debit option has gone. Owners who assumed the money would be taken automatically discover months later that it never was, and the return that was filed on time becomes a debt that was paid late. If you are anywhere near the end of the window, pay by card or transfer and take the confirmation.',

  quarterly_title: 'One last quarterly return, and then it changes',
  quarterly_p: 'Rental filing moved off the quarterly cycle. The final quarterly return covers {quarter} and is filed between {from} and {to}. Rent accrued after that goes into the annual April window instead. If you have been filing quarterly out of habit, this is the last one, and the next date you need is in April.',

  regimes_title: 'Two regimes, and we have shown you one',
  regimes_penalty: 'Everything above is the demanded route. The voluntary surcharge, the ladder and the reduction that goes with it are a different regime and none of it applies once a letter has arrived, so we have not shown you those figures here.',
  regimes_voluntary: 'Everything above is the voluntary route, which is the one you are on because no letter has arrived. If one does arrive before you file, none of these figures apply and the answer changes shape entirely. That is a reason to file first rather than a reason to worry.',
  regimes_links: 'The tax itself is a separate question from what being late costs. If you are still working out what the return should have said, our [rental income tax calculator](/rental-tax) and our [non-resident tax calculator](/tax-calculator) handle that side.',

  disclaimer: 'This is an estimate based on the published rules on the dates shown. It is not tax or legal advice, and the figure that binds you is the one your gestor or the tax office produces.',
  restart: 'Start again',
};

const no = {
  eyebrow: "Gratis verktøy",
  headline: "Du leverte den spanske skattemeldingen for sent. Hva koster det?",
  body: "Mindre enn de fleste eiere frykter, og noe helt annet når et brev først har kommet. Beløpet avhenger av én ting fremfor alt: om du kom skattemyndighetene i forkjøpet.",
  points: [
    "Du får se tillegget, totalbeløpet og navnet på prosedyren.",
    "Du får fristen klokken løp fra, regnet ut fra skatteåret.",
    "Du får se de åtte dagene som får eiere til å tro at de har betalt.",
  ],
  cta: "Regn ut hva jeg skylder",
  minutes: "Under to minutter",
  note: "Veiledning for boligeiere i Spania. Ikke skatterådgivning.",
  next: "Fortsett",
  source: "Kilde",

  q_return: "Hvilken skattemelding gjelder det?",
  q_return_hint: "Begge er modelo 210. De har ulike frister, og fristene ble nylig flyttet. Det er hovedgrunnen til at folk kommer for sent.",
  return_imputed: "Den årlige meldingen for en bolig du bruker selv",
  return_imputed_d: "Beregnet inntekt. Leveres hvert år for en spansk bolig som ikke leies ut, selv om ingen penger har skiftet hender.",
  return_rental: "Meldingen for leie du har fått",
  return_rental_d: "Leieinntekt fra utleie av boligen, enten kort- eller langtid.",

  q_year: "Hvilket skatteår?",
  q_year_hint: "Året inntekten hørte til, ikke året du skulle ha levert. En spansk skattemelding leveres alltid året etter det året den gjelder.",
  year_filed: "Leveres i løpet av {year}",

  q_amount: "Hvor mye skatt skulle den meldingen gi?",
  q_amount_hint: "Hvis du ikke vet det ennå, kan du la feltet stå tomt. Du får fortsatt prosentsatsen og fristen, og du kan komme tilbake med tallet.",
  amount_label: "Skatt å betale etter meldingen",
  amount_skip: "La feltet stå tomt hvis du ikke vet det.",

  q_letter: "Har skattemyndighetene allerede kontaktet deg om denne meldingen?",
  q_letter_hint: "Dette er spørsmålet som endrer alt. Et requerimiento, en propuesta de liquidacion eller et annet brev som nevner denne meldingen eller dette året. Et generelt varsel, et padron-brev eller IBI-regningen fra kommunen teller ikke.",
  letter_no: "Nei, ingenting har kommet",
  letter_no_d: "Du fant selv ut at meldingen er for sent levert.",
  letter_yes: "Ja, det har kommet et brev om det",
  letter_yes_d: "Skattemyndighetene nevnte denne meldingen eller dette året før du leverte.",

  result_surcharge: "Et tillegg, ikke en bot",
  result_notlate: "Du er ikke for sent ute",
  result_unknown: "Vi kan ikke tidfeste fristen din for det året",
  result_penalty: "Et brev endrer hvilket regelverk du er i",

  head_notlate_due: "Denne har frist {date}",
  head_amount: "{extra} i tillegg til skatten, {total} totalt",
  head_pct: "Et tillegg på {pct} prosent",
  head_pct_interest: "Et tillegg på {pct} prosent, pluss renter",

  sub_penalty: "Når skattemyndighetene har nevnt denne meldingen, er tillegget for å levere for sent på eget initiativ ikke lenger tilgjengelig. Det som følger er en sanksjonsprosess, og det er et strengere regelverk. Vi setter ikke en prosentsats på det, og grunnen står nedenfor.",
  sub_unknown: "Leieinntekt for det året hørte til den gamle kvartalsordningen, og vi har ikke et bekreftet leveringsvindu for den. Vi sier heller det enn å gjette på fristen din og bygge et tillegg oppå gjetningen.",
  sub_notlate: "Det skyldes ikke noe tillegg, fordi vinduet ikke har stengt. Det står én dato nedenfor som er tidligere enn den du ventet, og den er verdt å lese.",
  sub_surcharge: "Dette er et recargo por declaracion extemporanea sin requerimiento previo: tillegget for å melde deg selv. Det er ikke en bot, og ingen sanksjon kan legges oppå det.",

  return_name_imputed: "Beregnet inntekt, modelo 210",
  return_name_rental: "Leieinntekt, modelo 210",

  owe_title: "Hva du skylder",
  row_return: "Skattemelding",
  row_year: "Skatteår",
  row_deadline: "Fristen klokken løp fra",
  row_month: "Forsinkelsesmåned du er i",
  row_month_value: "Måned {n}",
  row_surcharge: "Tillegg",
  row_pct: "{pct} prosent",
  row_pct_flat: "{pct} prosent, fast",
  row_tax: "Skatt å betale etter meldingen",
  row_interest: "Forsinkelsesrente",
  row_total: "Totalt å betale",
  owe_no_tax: "Du oppga ikke skattebeløpet, så prosentsatsen er så langt vi kommer. Legg inn beløpet fra meldingen, så gjør verktøyet resten.",

  name_title: "Navnet på prosedyren, så du kan si det høyt",
  name_p1: "Du leverer en **declaracion extemporanea sin requerimiento previo**, en forsinket egenmelding uten forutgående krav, og det du betaler i tillegg er et **recargo**, et tillegg, etter art. 27 i Ley General Tributaria. Det er ikke en sancion og ikke en multa. Hvis noen sier at forsinket levering på eget initiativ betyr bot, er det feil ord for dette.",
  name_p2: "Tillegget starter på {base} prosent og øker med {per_month} prosent for hver hele måned, opp til {max} prosent ved tolv måneder. Fra måned {from_month} slutter det å stige og blir fast {flat} prosent, med forsinkelsesrente fra dagen etter den tolvte måneden.",

  reduce_title: "Betal i tide, så faller dette med {pct} prosent",
  reduce_p: "Når skattemyndighetene varsler deg om tillegget, åpner de et betalingsvindu. Betaler du hele tillegget innenfor vinduet, og selve skatten er gjort opp, reduseres tillegget med {pct} prosent. Det er de billigste {pct} prosentene du kan få, og de går tapt hvis du ikke gjør noe.",
  row_assessed: "Tillegg som fastsatt",
  row_reduced: "Redusert med {pct} prosent",
  row_total_window: "Totalt hvis du betaler innenfor vinduet",

  interest_title: "Renter, og hvor langt vi kan beregne dem",
  interest_p1: "Etter tolv måneder blir tillegget fast, og forsinkelsesrenten begynner å løpe fra dagen etter den tolvte måneden. For deg var det {date}. Satsen vi har er {rate} prosent for {year}, og samme sats gjaldt året før.",
  interest_p2: "Forsinkelsen din strekker seg lenger tilbake enn satsen vi har. Vi har beregnet {priced} dager og latt {unpriced} dager stå uberegnet, i stedet for å bruke en sats på en periode den ikke gjaldt for. Rentelinjen er derfor for lav med den perioden.",

  changed_title: "Hva som har endret seg",
  changed_p1: "Tillegget i art. 27 er prisen for å melde seg først. Det gjelder bare når du leverer før skattemyndighetene spør. Når et krav som nevner denne meldingen er sendt, er den døren lukket. Du er nå i en sanksjonsprosess: forholdet behandles som en skatteovertredelse, og beløpet er en forholdsmessig bot på det som står ubetalt, sammen med forsinkelsesrente.",
  changed_p2: "Det er et klart strengere regelverk enn tillegget, og reduksjonen på {pct} prosent som hører til tillegget er ikke en del av det.",

  nonumber_title: "Hvorfor det ikke står noe tall her",
  nonumber_p: "Vi kunne ikke lese hele den aktuelle artikkelen i Ley General Tributaria i den offisielle konsoliderte teksten, som kutter den av. Vi har et ubekreftet minstetall, og vi trykker det ikke som om det var avklart. En prosentsats i en overskrift er nettopp slik et ubekreftet tall blir noe en eier gjentar til sin gestor. Ta brevet med til en fagperson og få det foreslåtte beløpet sjekket mot selve artikkelen.",

  week_title: "Hva du gjør denne uken",
  week_steps: [
    "Les fristen som står i brevet. Det er nå datoen som styrer alt, og den er som regel kortere enn folk tror.",
    "Få selve meldingen levert og skatten betalt hvis den fortsatt står ute. Boten er forholdsmessig med det ubetalte beløpet, så det er ikke likegyldig å la det ligge.",
    "Ta brevet med til en gestor før du svarer. Et forslag er et forslag, og svarfristen er der en eventuell uenighet hører hjemme.",
    "Hvis brevet viser seg ikke å gjelde denne meldingen eller dette året, kan du komme tilbake og svare annerledes på det spørsmålet. De to sporene har ingenting felles, og vi viser deg ikke begge samtidig.",
  ],

  window_title: "Vinduet ditt",
  row_opens: "Levering åpner",
  row_closes: "Levering stenger",
  row_debit: "Direkte trekk stenger",
  nothing_title: "Ingenting skyldes ennå",
  nothing_p: "Tillegget starter først når leveringsvinduet har stengt. Fra dagen etter begynner det på {base} prosent og stiger {per_month} prosent i måneden. Å levere tidlig koster ingenting og fjerner hele spørsmålet.",

  cantell_title: "Hva vi kan si",
  cantell_p1: "Selve tilleggsstigen avhenger ikke av året. Den starter på {base} prosent, øker med {per_month} prosent for hver hele måned, stopper på {max} prosent ved tolv måneder og blir fra måned {from_month} fast {flat} prosent med renter. Reduksjonen på {pct} prosent for å betale innenfor vinduet gjelder på samme måte.",
  cantell_p2: "Det vi ikke kan, er å plassere meldingen din på stigen, fordi det krever leveringsfristen for et år vi ikke har et bekreftet vindu for. Spør din gestor om den nøyaktige datoen vinduet stengte, tell de hele månedene fra den, så gir stigen over deg resten.",
  recent_title: "Hvis du også har et nyere år",
  recent_p: "Start på nytt og velg {year} eller senere. De vinduene finnes i regelbasen, og verktøyet tidfester dem for deg.",

  gap_title: "Gapet nesten ingen får høre om",
  gap_p1: "Levering og betaling med direkte trekk stenger på ulike dager. For denne meldingen løper leveringsvinduet til {deadline}, men hvis du vil at skatten skal trekkes direkte, må meldingen være inne innen {debit}. Det er {days} dager tidligere.",
  gap_p2: "Leverer du i løpet av de siste {days} dagene, er meldingen levert i tide, men muligheten for direkte trekk er borte. Eiere som trodde pengene ville bli trukket automatisk, oppdager måneder senere at det aldri skjedde, og en melding levert i tide blir en gjeld betalt for sent. Er du i nærheten av slutten av vinduet, betal med kort eller overføring og ta vare på bekreftelsen.",

  quarterly_title: "En siste kvartalsmelding, og så endres det",
  quarterly_p: "Leveringen for utleie er flyttet bort fra kvartalssyklusen. Den siste kvartalsmeldingen gjelder {quarter} og leveres mellom {from} og {to}. Leie opptjent etter det går i stedet inn i det årlige aprilvinduet. Har du levert kvartalsvis av vane, er dette den siste, og neste dato du trenger er i april.",

  regimes_title: "To regelverk, og vi har vist deg ett",
  regimes_penalty: "Alt ovenfor gjelder sporet etter et krav. Det frivillige tillegget, stigen og reduksjonen som hører til, er et annet regelverk, og ingenting av det gjelder når et brev har kommet. Derfor har vi ikke vist deg de tallene her.",
  regimes_voluntary: "Alt ovenfor gjelder det frivillige sporet, som er der du er fordi det ikke har kommet noe brev. Kommer det et brev før du leverer, gjelder ingen av disse tallene, og svaret ser helt annerledes ut. Det er en grunn til å levere først, ikke en grunn til å bekymre seg.",
  regimes_links: "Selve skatten er et annet spørsmål enn hva forsinkelsen koster. Hvis du fortsatt finner ut hva meldingen skulle ha inneholdt, tar vår [kalkulator for skatt på leieinntekt](/rental-tax) og vår [skattekalkulator for ikke-residenter](/tax-calculator) seg av den delen.",

  disclaimer: "Dette er et anslag basert på de publiserte reglene på datoene som vises. Det er ikke skatte- eller juridisk rådgivning, og tallet som binder deg er det din gestor eller skattemyndighetene kommer fram til.",
  restart: "Start på nytt",
};

const sv = {
  eyebrow: "Gratis guide",
  headline: "Du lämnade in din spanska deklaration för sent. Vad kostar det?",
  body: "Mindre än de flesta fastighetsägare fruktar, och något helt annat när ett brev väl har kommit. Beloppet beror framför allt på en sak: om du hann före skattemyndigheten.",
  points: [
    "Du får se påslaget, totalen och namnet på förfarandet.",
    "Du får den deadline som klockan räknas från, utifrån beskattningsåret.",
    "Du får se de åtta dagar som får ägare att tro att de har betalat.",
  ],
  cta: "Räkna ut vad jag är skyldig",
  minutes: "Under två minuter",
  note: "Vägledning för fastighetsägare i Spanien. Inte skatterådgivning.",
  next: "Fortsätt",
  source: "Källa",

  q_return: "Vilken deklaration gäller det?",
  q_return_hint: "Båda är modelo 210. De har olika deadlines, och dessa flyttades nyligen. Det är huvudorsaken till att folk blir sena.",
  return_imputed: "Den årliga deklarationen för en fastighet du själv använder",
  return_imputed_d: "Schablonintäkt. Lämnas in varje år för en spansk fastighet som inte hyrs ut, även om inga pengar har bytt ägare.",
  return_rental: "Deklarationen för hyra du har fått",
  return_rental_d: "Hyresintäkt från uthyrning av fastigheten, kort- eller långtid.",

  q_year: "Vilket beskattningsår?",
  q_year_hint: "Året som inkomsten hörde till, inte året du borde ha deklarerat. En spansk deklaration lämnas alltid in året efter det år den gäller.",
  year_filed: "Lämnas in under {year}",

  q_amount: "Hur mycket skatt skulle den deklarationen ge?",
  q_amount_hint: "Om du inte vet det än kan du lämna fältet tomt. Du får ändå procentsatsen och din deadline, och du kan komma tillbaka med siffran.",
  amount_label: "Skatt att betala enligt deklarationen",
  amount_skip: "Lämna tomt om du inte vet.",

  q_letter: "Har skattemyndigheten redan kontaktat dig om den här deklarationen?",
  q_letter_hint: "Det här är frågan som ändrar allt. Ett requerimiento, en propuesta de liquidacion eller något annat brev som nämner den här deklarationen eller det här året. Ett allmänt meddelande, ett padron-brev eller IBI-räkningen från kommunen räknas inte.",
  letter_no: "Nej, inget har kommit",
  letter_no_d: "Du kom själv fram till att deklarationen är sen.",
  letter_yes: "Ja, ett brev om det har kommit",
  letter_yes_d: "Skattemyndigheten nämnde den här deklarationen eller det här året innan du lämnade in.",

  result_surcharge: "Ett påslag, inte böter",
  result_notlate: "Du är inte sen",
  result_unknown: "Vi kan inte datera din deadline för det året",
  result_penalty: "Ett brev ändrar vilket regelverk du befinner dig i",

  head_notlate_due: "Den här ska vara inne senast {date}",
  head_amount: "{extra} utöver skatten, {total} totalt",
  head_pct: "Ett påslag på {pct} procent",
  head_pct_interest: "Ett påslag på {pct} procent, plus ränta",

  sub_penalty: "När skattemyndigheten väl har nämnt den här deklarationen går påslaget för att deklarera sent på eget initiativ inte längre att få. Det som följer är ett sanktionsförfarande, och det är ett strängare regelverk. Vi sätter ingen procentsats på det, och skälet står nedan.",
  sub_unknown: "Hyresintäkt för det året hörde till det gamla kvartalssystemet, och vi har inget bekräftat inlämningsfönster för det. Vi säger hellre det än gissar din deadline och bygger ett påslag ovanpå gissningen.",
  sub_notlate: "Inget påslag ska betalas, eftersom fönstret inte har stängt. Det finns ett datum nedan som är tidigare än det du väntade dig, och det är värt att läsa.",
  sub_surcharge: "Det här är ett recargo por declaracion extemporanea sin requerimiento previo: påslaget för att själv träda fram. Det är inte böter, och ingen sanktion får läggas ovanpå det.",

  return_name_imputed: "Schablonintäkt, modelo 210",
  return_name_rental: "Hyresintäkt, modelo 210",

  owe_title: "Vad du är skyldig",
  row_return: "Deklaration",
  row_year: "Beskattningsår",
  row_deadline: "Den deadline klockan räknas från",
  row_month: "Förseningsmånad du befinner dig i",
  row_month_value: "Månad {n}",
  row_surcharge: "Påslag",
  row_pct: "{pct} procent",
  row_pct_flat: "{pct} procent, fast",
  row_tax: "Skatt att betala enligt deklarationen",
  row_interest: "Dröjsmålsränta",
  row_total: "Totalt att betala",
  owe_no_tax: "Du angav inte skattebeloppet, så procentsatsen är så långt vi kan komma. Fyll i beloppet från deklarationen, så gör guiden resten.",

  name_title: "Namnet på förfarandet, så att du kan säga det högt",
  name_p1: "Du lämnar in en **declaracion extemporanea sin requerimiento previo**, en sen egendeklaration utan föregående krav, och det du betalar utöver är ett **recargo**, ett påslag, enligt art. 27 i Ley General Tributaria. Det är inte en sancion och inte en multa. Om någon säger att sen deklaration på eget initiativ betyder böter, är det fel ord för det här.",
  name_p2: "Påslaget börjar på {base} procent och ökar med {per_month} procent för varje hel månad, upp till högst {max} procent vid tolv månader. Från månad {from_month} slutar det att öka och blir fast {flat} procent, med dröjsmålsränta från dagen efter den tolfte månaden.",

  reduce_title: "Betala i tid så sjunker det med {pct} procent",
  reduce_p: "När skattemyndigheten meddelar dig om påslaget öppnas ett betalningsfönster. Betalar du hela påslaget inom fönstret, och själva skatten är betald, minskas påslaget med {pct} procent. Det är de billigaste {pct} procent du kan få, och de går förlorade om du inte gör något.",
  row_assessed: "Påslag enligt beslut",
  row_reduced: "Minskat med {pct} procent",
  row_total_window: "Totalt om du betalar inom fönstret",

  interest_title: "Ränta, och hur långt vi kan räkna på den",
  interest_p1: "Efter tolv månader blir påslaget fast, och dröjsmålsräntan börjar löpa från dagen efter den tolfte månaden. För dig var det {date}. Räntesatsen vi har är {rate} procent för {year}, och samma sats gällde året innan.",
  interest_p2: "Din försening sträcker sig längre bakåt än den räntesats vi har. Vi har räknat på {priced} dagar och lämnat {unpriced} dagar oräknade, i stället för att använda en sats för en period den inte gällde. Räntan är därför för lågt räknad för den perioden.",

  changed_title: "Vad som har ändrats",
  changed_p1: "Påslaget i art. 27 är priset för att träda fram först. Det gäller bara om du lämnar in innan skattemyndigheten frågar. När ett krav som nämner den här deklarationen har skickats är den dörren stängd. Du befinner dig nu i ett sanktionsförfarande: agerandet behandlas som en skatteöverträdelse, och avgiften är proportionella böter på det obetalda beloppet, tillsammans med dröjsmålsränta.",
  changed_p2: "Det är ett klart strängare regelverk än påslaget, och minskningen på {pct} procent som hör till påslaget ingår inte.",

  nonumber_title: "Varför det inte står någon siffra här",
  nonumber_p: "Vi kunde inte läsa hela den aktuella artikeln i Ley General Tributaria i den officiella konsoliderade texten, som klipper av den. Vi har en obekräftad lägsta siffra, och vi tänker inte skriva ut den som om den vore fastställd. En procentsats i en rubrik är precis hur en obekräftad siffra blir något en ägare upprepar för sin gestor. Ta med brevet till en expert och låt det föreslagna beloppet kontrolleras mot själva artikeln.",

  week_title: "Vad du gör den här veckan",
  week_steps: [
    "Läs den deadline som står i brevet. Det är nu det datum som styr allt, och den är oftast kortare än folk tror.",
    "Se till att själva deklarationen lämnas in och skatten betalas om den fortfarande är obetald. Böterna är proportionella mot det obetalda beloppet, så det är inte neutralt att låta det ligga.",
    "Ta med brevet till en gestor innan du svarar. Ett förslag är ett förslag, och svarstiden är där en eventuell invändning hör hemma.",
    "Om brevet visar sig inte gälla den här deklarationen eller det här året, kom tillbaka och svara annorlunda på den frågan. De två spåren har inget gemensamt, och vi visar dig inte båda samtidigt.",
  ],

  window_title: "Ditt fönster",
  row_opens: "Inlämning öppnar",
  row_closes: "Inlämning stänger",
  row_debit: "Autogiro stänger",
  nothing_title: "Inget ska betalas ännu",
  nothing_p: "Påslaget börjar först när inlämningsfönstret har stängt. Från dagen efter börjar det på {base} procent och ökar med {per_month} procent i månaden. Att lämna in tidigt kostar ingenting och tar bort hela frågan.",

  cantell_title: "Vad vi kan säga",
  cantell_p1: "Själva påslagstrappan beror inte på året. Den börjar på {base} procent, ökar med {per_month} procent för varje hel månad, stannar på {max} procent vid tolv månader och blir från månad {from_month} fast {flat} procent med ränta. Minskningen på {pct} procent för betalning inom fönstret gäller på samma sätt.",
  cantell_p2: "Det vi inte kan göra är att placera din deklaration i trappan, eftersom det kräver inlämningsdatumet för ett år där vi saknar ett bekräftat fönster. Fråga din gestor om det exakta datum då fönstret stängde, räkna de hela månaderna från det, så ger trappan ovan dig resten.",
  recent_title: "Om du också har ett senare år",
  recent_p: "Börja om och välj {year} eller senare. De fönstren finns i regelbasen, och guiden daterar dem åt dig.",

  gap_title: "Glappet nästan ingen får höra talas om",
  gap_p1: "Inlämning och betalning via autogiro stänger på olika dagar. För den här deklarationen löper inlämningsfönstret till {deadline}, men om du vill att skatten dras via autogiro måste deklarationen vara inne senast {debit}. Det är {days} dagar tidigare.",
  gap_p2: "Lämnar du in under de sista {days} dagarna är deklarationen i tid, men möjligheten till autogiro är borta. Ägare som trodde att pengarna skulle dras automatiskt upptäcker månader senare att det aldrig skedde, och en deklaration inlämnad i tid blir en skuld betald för sent. Är du nära slutet av fönstret, betala med kort eller överföring och spara bekräftelsen.",

  quarterly_title: "En sista kvartalsdeklaration, sedan ändras det",
  quarterly_p: "Deklarationen för uthyrning har flyttats från kvartalscykeln. Den sista kvartalsdeklarationen gäller {quarter} och lämnas in mellan {from} och {to}. Hyra som uppstår efter det går i stället in i det årliga aprilfönstret. Har du deklarerat kvartalsvis av vana är det här den sista, och nästa datum du behöver är i april.",

  regimes_title: "Två regelverk, och vi har visat dig ett",
  regimes_penalty: "Allt ovan gäller spåret efter ett krav. Det frivilliga påslaget, trappan och minskningen som hör till är ett annat regelverk, och inget av det gäller när ett brev har kommit. Därför har vi inte visat dig de siffrorna här.",
  regimes_voluntary: "Allt ovan gäller det frivilliga spåret, som är det du är på eftersom inget brev har kommit. Kommer ett brev innan du lämnar in gäller inga av de här siffrorna, och svaret ser helt annorlunda ut. Det är ett skäl att lämna in först, inte ett skäl att oroa sig.",
  regimes_links: "Själva skatten är en annan fråga än vad förseningen kostar. Om du fortfarande räknar ut vad deklarationen borde ha innehållit, hanterar vår [guide för skatt på hyresintäkt](/rental-tax) och vår [skatteguide för icke-residenter](/tax-calculator) den delen.",

  disclaimer: "Detta är en uppskattning baserad på de publicerade reglerna vid de datum som visas. Det är inte skatte- eller juridisk rådgivning, och den siffra som binder dig är den som din gestor eller skattemyndigheten tar fram.",
  restart: "Börja om",
};

const de = {
  eyebrow: "Kostenloses Tool",
  headline: "Sie haben Ihre spanische Steuererklärung zu spät abgegeben. Was kostet das?",
  body: "Weniger, als die meisten Eigentümer befürchten, und etwas ganz anderes, sobald ein Brief eingetroffen ist. Der Betrag hängt vor allem von einer Sache ab: ob Sie dem Finanzamt zuvorgekommen sind.",
  points: [
    "Sie sehen den Zuschlag, die Gesamtsumme und den Namen des Verfahrens.",
    "Sie erfahren, ab welcher Frist die Uhr lief, berechnet aus dem Steuerjahr.",
    "Sie sehen die acht Tage, wegen derer Eigentümer glauben, bezahlt zu haben.",
  ],
  cta: "Berechnen, was ich schulde",
  minutes: "Unter zwei Minuten",
  note: "Orientierung für Eigentümer in Spanien. Keine Steuerberatung.",
  next: "Weiter",
  source: "Quelle",

  q_return: "Um welche Erklärung geht es?",
  q_return_hint: "Beides ist modelo 210. Die Fristen sind unterschiedlich und wurden kürzlich verschoben. Das ist der Hauptgrund, warum Menschen zu spät dran sind.",
  return_imputed: "Die jährliche Erklärung für eine Immobilie, die Sie selbst nutzen",
  return_imputed_d: "Unterstelltes Einkommen. Wird jedes Jahr für eine spanische Immobilie abgegeben, die nicht vermietet wird, auch wenn kein Geld geflossen ist.",
  return_rental: "Die Erklärung für erhaltene Miete",
  return_rental_d: "Mieteinkommen aus der Vermietung der Immobilie, kurz- oder langfristig.",

  q_year: "Welches Steuerjahr?",
  q_year_hint: "Das Jahr, zu dem das Einkommen gehörte, nicht das Jahr, in dem Sie hätten abgeben müssen. Eine spanische Erklärung wird immer im Jahr nach dem abgegeben, das sie betrifft.",
  year_filed: "Abgabe im Jahr {year}",

  q_amount: "Wie viel Steuer ergab diese Erklärung?",
  q_amount_hint: "Wenn Sie es noch nicht wissen, lassen Sie das Feld leer. Sie erhalten trotzdem den Prozentsatz und die Frist und können mit der Zahl zurückkommen.",
  amount_label: "Steuer laut Erklärung",
  amount_skip: "Lassen Sie das Feld leer, wenn Sie es nicht wissen.",

  q_letter: "Hat das Finanzamt Sie wegen dieser Erklärung bereits angeschrieben?",
  q_letter_hint: "Das ist die Frage, die alles ändert. Ein requerimiento, eine propuesta de liquidacion oder ein anderer Brief, der diese Erklärung oder dieses Jahr nennt. Eine allgemeine Mitteilung, ein padron-Schreiben oder die IBI-Rechnung der Gemeinde zählen nicht.",
  letter_no: "Nein, es ist nichts gekommen",
  letter_no_d: "Sie haben selbst festgestellt, dass die Erklärung verspätet ist.",
  letter_yes: "Ja, es ist ein Brief dazu gekommen",
  letter_yes_d: "Das Finanzamt hat diese Erklärung oder dieses Jahr genannt, bevor Sie abgegeben haben.",

  result_surcharge: "Ein Zuschlag, keine Geldbuße",
  result_notlate: "Sie sind nicht zu spät",
  result_unknown: "Wir können Ihre Frist für dieses Jahr nicht datieren",
  result_penalty: "Ein Brief ändert, welches Regelwerk für Sie gilt",

  head_notlate_due: "Die Frist dafür ist der {date}",
  head_amount: "{extra} zusätzlich zur Steuer, {total} insgesamt",
  head_pct: "Ein Zuschlag von {pct} Prozent",
  head_pct_interest: "Ein Zuschlag von {pct} Prozent, plus Zinsen",

  sub_penalty: "Sobald das Finanzamt diese Erklärung genannt hat, steht der Zuschlag für eine freiwillige verspätete Abgabe nicht mehr zur Verfügung. Es folgt ein Sanktionsverfahren, und das ist ein strengeres Regelwerk. Wir nennen dafür keinen Prozentsatz, und den Grund finden Sie unten.",
  sub_unknown: "Mieteinkommen für dieses Jahr fiel noch unter die alte Quartalsregelung, und wir haben dafür kein bestätigtes Abgabefenster. Das sagen wir Ihnen lieber, als Ihre Frist zu raten und einen Zuschlag darauf aufzubauen.",
  sub_notlate: "Es ist kein Zuschlag fällig, weil das Fenster noch nicht geschlossen ist. Unten steht ein Datum, das früher liegt als das, mit dem Sie gerechnet haben, und es lohnt sich, es zu lesen.",
  sub_surcharge: "Das ist ein recargo por declaracion extemporanea sin requerimiento previo: der Zuschlag dafür, sich selbst zu melden. Es ist keine Geldbuße, und keine Sanktion darf hinzukommen.",

  return_name_imputed: "Unterstelltes Einkommen, modelo 210",
  return_name_rental: "Mieteinkommen, modelo 210",

  owe_title: "Was Sie schulden",
  row_return: "Erklärung",
  row_year: "Steuerjahr",
  row_deadline: "Die Frist, ab der die Uhr lief",
  row_month: "Verzugsmonat, in dem Sie sich befinden",
  row_month_value: "Monat {n}",
  row_surcharge: "Zuschlag",
  row_pct: "{pct} Prozent",
  row_pct_flat: "{pct} Prozent, pauschal",
  row_tax: "Steuer laut Erklärung",
  row_interest: "Verzugszinsen",
  row_total: "Insgesamt zu zahlen",
  owe_no_tax: "Sie haben uns den Steuerbetrag nicht genannt, daher ist der Prozentsatz so weit, wie wir kommen. Geben Sie den Betrag aus der Erklärung ein, dann erledigt das Tool den Rest.",

  name_title: "Der Name des Verfahrens, damit Sie ihn aussprechen können",
  name_p1: "Sie geben eine **declaracion extemporanea sin requerimiento previo** ab, eine verspätete Selbstveranlagung ohne vorherige Aufforderung, und was Sie zusätzlich zahlen, ist ein **recargo**, ein Zuschlag, nach Art. 27 der Ley General Tributaria. Es ist keine sancion und keine multa. Wenn Ihnen jemand sagt, eine freiwillige verspätete Abgabe bedeute eine Geldbuße, ist das das falsche Wort dafür.",
  name_p2: "Der Zuschlag beginnt bei {base} Prozent und steigt um {per_month} Prozent für jeden vollen Monat, bis höchstens {max} Prozent nach zwölf Monaten. Ab Monat {from_month} steigt er nicht weiter und beträgt pauschal {flat} Prozent, mit Verzugszinsen ab dem Tag nach dem zwölften Monat.",

  reduce_title: "Zahlen Sie rechtzeitig, sinkt dies um {pct} Prozent",
  reduce_p: "Wenn das Finanzamt Ihnen den Zuschlag mitteilt, öffnet es ein Zahlungsfenster. Zahlen Sie den Zuschlag vollständig innerhalb dieses Fensters und ist die Steuerschuld selbst beglichen, wird der Zuschlag um {pct} Prozent reduziert. Es sind die günstigsten {pct} Prozent, die Sie bekommen können, und sie gehen verloren, wenn Sie nichts tun.",
  row_assessed: "Zuschlag laut Bescheid",
  row_reduced: "Um {pct} Prozent reduziert",
  row_total_window: "Insgesamt bei Zahlung innerhalb des Fensters",

  interest_title: "Zinsen, und wie weit wir sie beziffern können",
  interest_p1: "Nach zwölf Monaten wird der Zuschlag pauschal, und ab dem Tag nach dem zwölften Monat laufen Verzugszinsen. Bei Ihnen war das der {date}. Der Satz, den wir haben, beträgt {rate} Prozent für {year}, und derselbe Satz galt im Jahr davor.",
  interest_p2: "Ihr Verzug reicht weiter zurück als der Satz, den wir haben. Wir haben {priced} Tage berechnet und {unpriced} Tage unberechnet gelassen, statt einen Satz auf einen Zeitraum anzuwenden, für den er nicht galt. Die Zinszeile ist daher um diesen Zeitraum zu niedrig.",

  changed_title: "Was sich geändert hat",
  changed_p1: "Der Zuschlag nach Art. 27 ist der Preis dafür, sich zuerst zu melden. Er gilt nur, wenn Sie abgeben, bevor das Finanzamt fragt. Sobald eine Aufforderung zu dieser Erklärung verschickt ist, ist diese Tür zu. Sie befinden sich jetzt in einem Sanktionsverfahren: Das Verhalten gilt als Steuerordnungswidrigkeit, und die Forderung ist eine anteilige Geldbuße auf den unbezahlten Betrag, zusammen mit Verzugszinsen.",
  changed_p2: "Es ist ein deutlich strengeres Regelwerk als der Zuschlag, und die Ermäßigung um {pct} Prozent, die zum Zuschlag gehört, ist nicht Teil davon.",

  nonumber_title: "Warum hier keine Zahl steht",
  nonumber_p: "Wir konnten den maßgeblichen Artikel der Ley General Tributaria im offiziellen konsolidierten Text nicht vollständig lesen, weil er dort abgeschnitten ist. Wir haben eine unbestätigte Mindestzahl und drucken sie nicht, als wäre sie gesichert. Ein Prozentsatz in einer Überschrift ist genau der Weg, auf dem eine unbestätigte Zahl zu etwas wird, das ein Eigentümer seinem gestor wiederholt. Bringen Sie den Brief zu einer Fachperson und lassen Sie den vorgeschlagenen Betrag am Artikel selbst prüfen.",

  week_title: "Was Sie diese Woche tun",
  week_steps: [
    "Lesen Sie die Frist, die im Brief steht. Sie ist jetzt das Datum, das alles bestimmt, und sie ist meist kürzer, als man denkt.",
    "Geben Sie die Erklärung selbst ab und zahlen Sie die Steuer, wenn sie noch offen ist. Die Geldbuße bemisst sich am unbezahlten Betrag, daher ist es nicht folgenlos, ihn liegen zu lassen.",
    "Bringen Sie den Brief zu einem gestor, bevor Sie antworten. Ein Vorschlag ist ein Vorschlag, und die Antwortfrist ist der Ort für jeden Einwand.",
    "Wenn sich herausstellt, dass der Brief nicht diese Erklärung oder dieses Jahr betrifft, kommen Sie zurück und beantworten Sie diese Frage anders. Die beiden Wege haben nichts gemeinsam, und wir zeigen Ihnen nicht beide zugleich.",
  ],

  window_title: "Ihr Fenster",
  row_opens: "Abgabe öffnet",
  row_closes: "Abgabe schließt",
  row_debit: "Lastschrift schließt",
  nothing_title: "Noch ist nichts fällig",
  nothing_p: "Der Zuschlag beginnt erst, wenn das Abgabefenster geschlossen ist. Ab dem Tag danach beginnt er bei {base} Prozent und steigt um {per_month} Prozent pro Monat. Frühzeitig abzugeben kostet nichts und erledigt die ganze Frage.",

  cantell_title: "Was wir Ihnen sagen können",
  cantell_p1: "Die Zuschlagsstaffel selbst hängt nicht vom Jahr ab. Sie beginnt bei {base} Prozent, steigt um {per_month} Prozent für jeden vollen Monat, endet bei {max} Prozent nach zwölf Monaten und beträgt ab Monat {from_month} pauschal {flat} Prozent mit Zinsen. Die Ermäßigung um {pct} Prozent bei Zahlung innerhalb des Fensters gilt genauso.",
  cantell_p2: "Was wir nicht können, ist Ihre Erklärung in diese Staffel einzuordnen, denn dafür braucht es die Abgabefrist eines Jahres, für das wir kein bestätigtes Fenster haben. Fragen Sie Ihren gestor nach dem genauen Datum, an dem das Fenster schloss, zählen Sie die vollen Monate ab dann, und die Staffel oben liefert den Rest.",
  recent_title: "Wenn Sie auch ein neueres Jahr haben",
  recent_p: "Beginnen Sie neu und wählen Sie {year} oder später. Diese Fenster sind in der Regelbasis hinterlegt, und das Tool datiert sie für Sie.",

  gap_title: "Die Lücke, von der kaum jemand erfährt",
  gap_p1: "Abgabe und Zahlung per Lastschrift schließen an unterschiedlichen Tagen. Für diese Erklärung läuft das Abgabefenster bis zum {deadline}, aber wenn die Steuer per Lastschrift eingezogen werden soll, muss die Erklärung bis zum {debit} eingereicht sein. Das ist {days} Tage früher.",
  gap_p2: "Reichen Sie in diesen letzten {days} Tagen ein, ist die Erklärung pünktlich, aber die Lastschrift ist nicht mehr möglich. Eigentümer, die dachten, das Geld werde automatisch eingezogen, merken Monate später, dass das nie geschah, und aus einer pünktlichen Erklärung wird eine verspätet bezahlte Schuld. Wenn Sie nahe am Ende des Fensters sind, zahlen Sie per Karte oder Überweisung und bewahren Sie die Bestätigung auf.",

  quarterly_title: "Eine letzte Quartalserklärung, dann ändert es sich",
  quarterly_p: "Die Abgabe für Vermietung ist vom Quartalsrhythmus abgerückt. Die letzte Quartalserklärung betrifft {quarter} und wird zwischen dem {from} und dem {to} abgegeben. Danach entstandene Miete fällt stattdessen in das jährliche Aprilfenster. Wenn Sie aus Gewohnheit vierteljährlich abgegeben haben, ist dies die letzte, und das nächste Datum, das Sie brauchen, liegt im April.",

  regimes_title: "Zwei Regelwerke, und wir haben Ihnen eines gezeigt",
  regimes_penalty: "Alles oben betrifft den Weg nach einer Aufforderung. Der freiwillige Zuschlag, die Staffel und die zugehörige Ermäßigung sind ein anderes Regelwerk, und nichts davon gilt, sobald ein Brief eingetroffen ist. Deshalb zeigen wir Ihnen diese Zahlen hier nicht.",
  regimes_voluntary: "Alles oben betrifft den freiwilligen Weg, auf dem Sie sind, weil kein Brief gekommen ist. Kommt einer, bevor Sie abgeben, gilt keine dieser Zahlen mehr, und die Antwort sieht völlig anders aus. Das ist ein Grund, zuerst abzugeben, kein Grund zur Sorge.",
  regimes_links: "Die Steuer selbst ist eine andere Frage als die Kosten der Verspätung. Wenn Sie noch herausfinden, was in der Erklärung hätte stehen sollen, helfen unser [Rechner für die Steuer auf Mieteinkommen](/rental-tax) und unser [Steuerrechner für Nicht-Residenten](/tax-calculator) bei diesem Teil.",

  disclaimer: "Dies ist eine Schätzung auf Grundlage der veröffentlichten Regeln zu den angegebenen Daten. Es ist keine Steuer- oder Rechtsberatung, und verbindlich ist die Zahl, die Ihr gestor oder das Finanzamt ermittelt.",
  restart: "Neu beginnen",
};

const fr = {
  eyebrow: "Outil gratuit",
  headline: "Vous avez déposé votre déclaration fiscale espagnole en retard. Combien cela coûte-t-il ?",
  body: "Moins que ce que craignent la plupart des propriétaires, et tout autre chose dès qu'un courrier est arrivé. Le montant dépend avant tout d'une chose : si vous êtes arrivé avant l'administration fiscale.",
  points: [
    "Vous voyez la majoration, le total et le nom de la procédure.",
    "Vous obtenez l'échéance à partir de laquelle le délai a couru, calculée selon l'année fiscale.",
    "Vous voyez l'écart de huit jours qui fait croire aux propriétaires qu'ils ont payé.",
  ],
  cta: "Calculer ce que je dois",
  minutes: "Moins de deux minutes",
  note: "Informations pour les propriétaires en Espagne. Ce n'est pas un conseil fiscal.",
  next: "Continuer",
  source: "Source",

  q_return: "De quelle déclaration s'agit-il ?",
  q_return_hint: "Les deux sont des modelo 210. Leurs échéances diffèrent et ont changé récemment, ce qui explique la plupart des retards.",
  return_imputed: "La déclaration annuelle d'un bien que vous utilisez vous-même",
  return_imputed_d: "Revenu imputé. Déclaré chaque année pour un bien espagnol qui n'est pas loué, même si aucun argent n'a changé de mains.",
  return_rental: "La déclaration des loyers perçus",
  return_rental_d: "Revenu locatif tiré de la location du bien, de courte ou de longue durée.",

  q_year: "Quelle année fiscale ?",
  q_year_hint: "L'année à laquelle le revenu se rattache, pas l'année où vous auriez dû déclarer. Une déclaration espagnole se dépose toujours l'année qui suit celle qu'elle couvre.",
  year_filed: "Déposée au cours de {year}",

  q_amount: "Quel était l'impôt dû sur cette déclaration ?",
  q_amount_hint: "Si vous ne le savez pas encore, laissez ce champ vide. Vous obtiendrez quand même le pourcentage et l'échéance, et vous pourrez revenir avec le montant.",
  amount_label: "Impôt dû sur la déclaration",
  amount_skip: "Laissez vide si vous ne le savez pas.",

  q_letter: "L'administration fiscale vous a-t-elle déjà contacté au sujet de cette déclaration ?",
  q_letter_hint: "C'est la question qui change tout. Un requerimiento, une propuesta de liquidacion ou tout courrier mentionnant cette déclaration ou cette année. Un avis général, un courrier du padron ou l'avis d'IBI de la mairie ne comptent pas.",
  letter_no: "Non, rien n'est arrivé",
  letter_no_d: "Vous avez constaté vous-même que la déclaration est en retard.",
  letter_yes: "Oui, un courrier est arrivé à ce sujet",
  letter_yes_d: "L'administration fiscale a mentionné cette déclaration ou cette année avant votre dépôt.",

  result_surcharge: "Une majoration, pas une amende",
  result_notlate: "Vous n'êtes pas en retard",
  result_unknown: "Nous ne pouvons pas dater votre échéance pour cette année",
  result_penalty: "Un courrier change le régime qui s'applique à vous",

  head_notlate_due: "Celle-ci est à déposer au plus tard le {date}",
  head_amount: "{extra} en plus de l'impôt, {total} au total",
  head_pct: "Une majoration de {pct} pour cent",
  head_pct_interest: "Une majoration de {pct} pour cent, plus des intérêts",

  sub_penalty: "Dès que l'administration fiscale a mentionné cette déclaration, la majoration pour dépôt tardif spontané n'est plus possible. Ce qui suit est une procédure de sanction, et c'est un régime plus lourd. Nous n'y mettrons pas de pourcentage, et la raison se trouve plus bas.",
  sub_unknown: "Le revenu locatif de cette année relevait de l'ancien régime trimestriel, et nous n'avons pas de période de dépôt confirmée pour celui-ci. Nous préférons vous le dire plutôt que de deviner votre échéance et d'y ajouter une majoration.",
  sub_notlate: "Aucune majoration n'est due, car la période n'est pas close. Il y a plus bas une date antérieure à celle que vous attendiez, et elle mérite d'être lue.",
  sub_surcharge: "Il s'agit d'un recargo por declaracion extemporanea sin requerimiento previo : la majoration pour s'être manifesté de soi-même. Ce n'est pas une amende, et aucune sanction ne peut s'y ajouter.",

  return_name_imputed: "Revenu imputé, modelo 210",
  return_name_rental: "Revenu locatif, modelo 210",

  owe_title: "Ce que vous devez",
  row_return: "Déclaration",
  row_year: "Année fiscale",
  row_deadline: "L'échéance à partir de laquelle le délai a couru",
  row_month: "Mois de retard dans lequel vous êtes",
  row_month_value: "Mois {n}",
  row_surcharge: "Majoration",
  row_pct: "{pct} pour cent",
  row_pct_flat: "{pct} pour cent, forfaitaire",
  row_tax: "Impôt dû sur la déclaration",
  row_interest: "Intérêts de retard",
  row_total: "Total à payer",
  owe_no_tax: "Vous ne nous avez pas donné le montant de l'impôt, le pourcentage est donc tout ce que nous pouvons calculer. Saisissez le montant de la déclaration et l'outil fera le reste.",

  name_title: "Le nom de la procédure, pour pouvoir le dire à voix haute",
  name_p1: "Vous déposez une **declaracion extemporanea sin requerimiento previo**, une autoliquidation tardive sans demande préalable, et ce que vous payez en plus est un **recargo**, une majoration, au titre de l'art. 27 de la Ley General Tributaria. Ce n'est pas une sancion ni une multa. Si quelqu'un vous dit qu'un dépôt tardif spontané entraîne une amende, ce n'est pas le bon mot.",
  name_p2: "La majoration commence à {base} pour cent et augmente de {per_month} pour cent par mois complet, jusqu'à {max} pour cent au maximum à douze mois. À partir du mois {from_month}, elle cesse d'augmenter et devient un forfait de {flat} pour cent, avec des intérêts de retard à compter du lendemain du douzième mois.",

  reduce_title: "Payez à temps et elle baisse de {pct} pour cent",
  reduce_p: "Lorsque l'administration fiscale vous notifie la majoration, elle ouvre une période de paiement. Payez la majoration en totalité pendant cette période, l'impôt lui-même étant réglé, et la majoration est réduite de {pct} pour cent. Ce sont les {pct} pour cent les moins chers que vous puissiez obtenir, et vous les perdez en ne faisant rien.",
  row_assessed: "Majoration notifiée",
  row_reduced: "Réduite de {pct} pour cent",
  row_total_window: "Total si vous payez dans la période",

  interest_title: "Les intérêts, et jusqu'où nous pouvons les chiffrer",
  interest_p1: "Au-delà de douze mois, la majoration devient forfaitaire et les intérêts de retard courent à partir du lendemain du douzième mois, soit pour vous le {date}. Le taux dont nous disposons est de {rate} pour cent pour {year}, et le même taux s'appliquait l'année précédente.",
  interest_p2: "Votre retard remonte plus loin que le taux dont nous disposons. Nous avons chiffré {priced} jours et laissé {unpriced} jours sans calcul, plutôt que d'appliquer un taux à une période qu'il ne couvrait pas. La ligne des intérêts est donc sous-estimée pour cette période.",

  changed_title: "Ce qui a changé",
  changed_p1: "La majoration de l'art. 27 est le prix pour s'être manifesté en premier. Elle ne s'applique que si vous déposez avant que l'administration fiscale ne le demande. Une fois qu'une demande mentionnant cette déclaration a été envoyée, cette porte est fermée. Vous êtes désormais dans une procédure de sanction : le comportement est traité comme une infraction fiscale, et le montant est une amende proportionnelle à la somme restée impayée, avec des intérêts de retard.",
  changed_p2: "C'est un régime nettement plus lourd que la majoration, et la réduction de {pct} pour cent qui accompagne la majoration n'en fait pas partie.",

  nonumber_title: "Pourquoi il n'y a pas de chiffre ici",
  nonumber_p: "Nous n'avons pas pu lire en entier l'article applicable de la Ley General Tributaria dans le texte consolidé officiel, qui le tronque. Nous avons un chiffre minimum non confirmé et nous ne l'imprimerons pas comme s'il était établi. Un pourcentage dans un titre est exactement la façon dont un chiffre non confirmé devient quelque chose qu'un propriétaire répète à son gestor. Montrez le courrier à un professionnel et faites vérifier le montant proposé au regard de l'article lui-même.",

  week_title: "Ce qu'il faut faire cette semaine",
  week_steps: [
    "Lisez l'échéance indiquée dans le courrier. C'est désormais la date qui gouverne tout, et elle est souvent plus courte qu'on ne le pense.",
    "Faites déposer la déclaration elle-même et payez l'impôt s'il est encore dû. L'amende est proportionnelle au montant impayé, il n'est donc pas neutre de le laisser en suspens.",
    "Montrez le courrier à un gestor avant d'y répondre. Une proposition reste une proposition, et le délai de réponse est le moment de la contester.",
    "Si le courrier ne concerne finalement pas cette déclaration ou cette année, revenez et répondez autrement à cette question. Les deux voies n'ont rien en commun et nous ne vous montrerons pas les deux à la fois.",
  ],

  window_title: "Votre période",
  row_opens: "Ouverture du dépôt",
  row_closes: "Clôture du dépôt",
  row_debit: "Clôture du prélèvement",
  nothing_title: "Rien n'est encore dû",
  nothing_p: "La majoration ne commence qu'une fois la période de dépôt close. Dès le lendemain, elle démarre à {base} pour cent et augmente de {per_month} pour cent par mois. Déposer tôt ne coûte rien et règle toute la question.",

  cantell_title: "Ce que nous pouvons vous dire",
  cantell_p1: "Le barème de majoration lui-même ne dépend pas de l'année. Il commence à {base} pour cent, augmente de {per_month} pour cent par mois complet, plafonne à {max} pour cent à douze mois et devient, à partir du mois {from_month}, un forfait de {flat} pour cent avec intérêts. La réduction de {pct} pour cent en cas de paiement dans la période s'applique de la même façon.",
  cantell_p2: "Ce que nous ne pouvons pas faire, c'est situer votre déclaration sur ce barème, car il faut pour cela l'échéance de dépôt d'une année pour laquelle nous n'avons pas de période vérifiée. Demandez à votre gestor la date exacte de clôture, comptez les mois complets à partir de celle-ci, et le barème ci-dessus vous donne le reste.",
  recent_title: "Si vous avez aussi une année plus récente",
  recent_p: "Recommencez et choisissez {year} ou une année ultérieure. Ces périodes figurent dans la base de règles et l'outil les datera pour vous.",

  gap_title: "L'écart dont presque personne ne parle",
  gap_p1: "Le dépôt et le paiement par prélèvement ne se clôturent pas le même jour. Pour cette déclaration, la période de dépôt court jusqu'au {deadline}, mais si vous voulez que l'impôt soit prélevé, la déclaration doit être déposée au plus tard le {debit}. C'est {days} jours plus tôt.",
  gap_p2: "Déposez pendant ces {days} derniers jours et la déclaration est dans les temps, mais l'option de prélèvement a disparu. Des propriétaires qui pensaient que l'argent serait prélevé automatiquement découvrent des mois plus tard qu'il ne l'a jamais été, et une déclaration déposée à temps devient une dette payée en retard. Si vous approchez de la fin de la période, payez par carte ou par virement et gardez la confirmation.",

  quarterly_title: "Une dernière déclaration trimestrielle, puis cela change",
  quarterly_p: "La déclaration des loyers a quitté le cycle trimestriel. La dernière déclaration trimestrielle couvre {quarter} et se dépose entre le {from} et le {to}. Les loyers perçus après cette date relèvent désormais de la période annuelle d'avril. Si vous déclariez chaque trimestre par habitude, c'est la dernière, et la prochaine date utile est en avril.",

  regimes_title: "Deux régimes, et nous vous en avons montré un",
  regimes_penalty: "Tout ce qui précède concerne la voie après une demande. La majoration spontanée, le barème et la réduction qui l'accompagne relèvent d'un autre régime, et rien de cela ne s'applique une fois qu'un courrier est arrivé. C'est pourquoi nous ne vous montrons pas ces chiffres ici.",
  regimes_voluntary: "Tout ce qui précède concerne la voie spontanée, la vôtre puisqu'aucun courrier n'est arrivé. Si un courrier arrive avant votre dépôt, aucun de ces chiffres ne s'applique et la réponse change complètement. C'est une raison de déposer en premier, pas une raison de s'inquiéter.",
  regimes_links: "L'impôt lui-même est une autre question que le coût du retard. Si vous cherchez encore ce que la déclaration aurait dû contenir, notre [calculateur d'impôt sur les revenus locatifs](/rental-tax) et notre [calculateur d'impôt pour non-résidents](/tax-calculator) traitent cette partie.",

  disclaimer: "Il s'agit d'une estimation fondée sur les règles publiées aux dates indiquées. Ce n'est pas un conseil fiscal ou juridique, et le montant qui vous engage est celui établi par votre gestor ou par l'administration fiscale.",
  restart: "Recommencer",
};

const nl = {
  eyebrow: "Gratis tool",
  headline: "U heeft uw Spaanse belastingaangifte te laat ingediend. Wat kost dat?",
  body: "Minder dan de meeste eigenaren vrezen, en iets heel anders zodra er een brief is gekomen. Het bedrag hangt vooral van één ding af: of u de belastingdienst voor was.",
  points: [
    "U ziet de toeslag, het totaal en de naam van de procedure.",
    "U krijgt de deadline vanaf wanneer de klok liep, berekend uit het belastingjaar.",
    "U ziet het gat van acht dagen waardoor eigenaren denken dat ze betaald hebben.",
  ],
  cta: "Bereken wat ik verschuldigd ben",
  minutes: "Minder dan twee minuten",
  note: "Informatie voor eigenaren in Spanje. Geen belastingadvies.",
  next: "Verder",
  source: "Bron",

  q_return: "Om welke aangifte gaat het?",
  q_return_hint: "Beide zijn modelo 210. Ze hebben verschillende deadlines, en die zijn onlangs verschoven. Dat is de belangrijkste reden dat mensen te laat zijn.",
  return_imputed: "De jaarlijkse aangifte voor een woning die u zelf gebruikt",
  return_imputed_d: "Toegerekend inkomen. Wordt elk jaar ingediend voor een Spaanse woning die niet verhuurd wordt, ook als er geen geld is ontvangen.",
  return_rental: "De aangifte voor ontvangen huur",
  return_rental_d: "Huurinkomen uit verhuur van de woning, voor korte of lange termijn.",

  q_year: "Welk belastingjaar?",
  q_year_hint: "Het jaar waartoe het inkomen behoorde, niet het jaar waarin u had moeten aangeven. Een Spaanse aangifte wordt altijd ingediend in het jaar na het jaar waarop ze betrekking heeft.",
  year_filed: "In te dienen in {year}",

  q_amount: "Hoeveel belasting was er op die aangifte verschuldigd?",
  q_amount_hint: "Weet u het nog niet, laat dit veld dan leeg. U krijgt toch het percentage en de deadline, en u kunt later terugkomen met het bedrag.",
  amount_label: "Verschuldigde belasting volgens de aangifte",
  amount_skip: "Laat leeg als u het niet weet.",

  q_letter: "Heeft de belastingdienst al contact met u opgenomen over deze aangifte?",
  q_letter_hint: "Dit is de vraag die alles verandert. Een requerimiento, een propuesta de liquidacion of een andere brief die deze aangifte of dit jaar noemt. Een algemene mededeling, een padron-brief of de IBI-aanslag van de gemeente telt niet.",
  letter_no: "Nee, er is niets gekomen",
  letter_no_d: "U heeft zelf vastgesteld dat de aangifte te laat is.",
  letter_yes: "Ja, er is een brief over gekomen",
  letter_yes_d: "De belastingdienst noemde deze aangifte of dit jaar voordat u indiende.",

  result_surcharge: "Een toeslag, geen boete",
  result_notlate: "U bent niet te laat",
  result_unknown: "We kunnen uw deadline voor dat jaar niet dateren",
  result_penalty: "Een brief verandert welk regime voor u geldt",

  head_notlate_due: "Deze moet uiterlijk {date} binnen zijn",
  head_amount: "{extra} bovenop de belasting, {total} in totaal",
  head_pct: "Een toeslag van {pct} procent",
  head_pct_interest: "Een toeslag van {pct} procent, plus rente",

  sub_penalty: "Zodra de belastingdienst deze aangifte heeft genoemd, is de toeslag voor vrijwillig te laat indienen niet meer beschikbaar. Wat volgt is een sanctieprocedure, en dat is een zwaarder regime. We zetten er geen percentage op, en de reden staat hieronder.",
  sub_unknown: "Huurinkomen over dat jaar viel nog onder de oude kwartaalregeling, en we hebben daarvoor geen bevestigd indieningsvenster. Dat zeggen we liever dan uw deadline te raden en daar een toeslag op te bouwen.",
  sub_notlate: "Er is geen toeslag verschuldigd, omdat het venster nog niet gesloten is. Hieronder staat één datum die eerder valt dan u verwachtte, en die is het lezen waard.",
  sub_surcharge: "Dit is een recargo por declaracion extemporanea sin requerimiento previo: de toeslag voor het uit uzelf melden. Het is geen boete, en er mag geen sanctie bovenop komen.",

  return_name_imputed: "Toegerekend inkomen, modelo 210",
  return_name_rental: "Huurinkomen, modelo 210",

  owe_title: "Wat u verschuldigd bent",
  row_return: "Aangifte",
  row_year: "Belastingjaar",
  row_deadline: "De deadline vanaf wanneer de klok liep",
  row_month: "Maand van vertraging waarin u zit",
  row_month_value: "Maand {n}",
  row_surcharge: "Toeslag",
  row_pct: "{pct} procent",
  row_pct_flat: "{pct} procent, vast",
  row_tax: "Verschuldigde belasting volgens de aangifte",
  row_interest: "Rente wegens te late betaling",
  row_total: "Totaal te betalen",
  owe_no_tax: "U heeft ons het belastingbedrag niet gegeven, dus verder dan het percentage kunnen we niet gaan. Vul het bedrag uit de aangifte in en de tool doet de rest.",

  name_title: "De naam van de procedure, zodat u die hardop kunt zeggen",
  name_p1: "U dient een **declaracion extemporanea sin requerimiento previo** in, een te late eigen aangifte zonder voorafgaand verzoek, en wat u extra betaalt is een **recargo**, een toeslag, op grond van art. 27 van de Ley General Tributaria. Het is geen sancion en geen multa. Als iemand u vertelt dat vrijwillig te laat indienen een boete betekent, is dat het verkeerde woord.",
  name_p2: "De toeslag begint bij {base} procent en stijgt met {per_month} procent voor elke volle maand, tot maximaal {max} procent na twaalf maanden. Vanaf maand {from_month} stijgt hij niet meer en wordt hij een vaste {flat} procent, met rente wegens te late betaling vanaf de dag na de twaalfde maand.",

  reduce_title: "Betaal op tijd en dit daalt met {pct} procent",
  reduce_p: "Wanneer de belastingdienst u de toeslag meedeelt, opent hij een betalingsvenster. Betaal de toeslag volledig binnen dat venster, met de belastingschuld zelf voldaan, en de toeslag wordt met {pct} procent verlaagd. Het zijn de goedkoopste {pct} procent die u kunt krijgen, en u verliest ze door niets te doen.",
  row_assessed: "Toeslag zoals vastgesteld",
  row_reduced: "Verlaagd met {pct} procent",
  row_total_window: "Totaal als u binnen het venster betaalt",

  interest_title: "Rente, en hoe ver we die kunnen berekenen",
  interest_p1: "Na twaalf maanden wordt de toeslag vast en begint de rente te lopen vanaf de dag na de twaalfde maand. Voor u was dat {date}. Het tarief dat wij hebben is {rate} procent voor {year}, en hetzelfde tarief gold het jaar ervoor.",
  interest_p2: "Uw vertraging gaat verder terug dan het tarief dat wij hebben. We hebben {priced} dagen berekend en {unpriced} dagen onberekend gelaten, in plaats van een tarief toe te passen op een periode waarvoor het niet gold. De renteregel is daarom over die periode te laag.",

  changed_title: "Wat er is veranderd",
  changed_p1: "De toeslag van art. 27 is de prijs voor het zelf eerst melden. Hij geldt alleen als u indient voordat de belastingdienst erom vraagt. Zodra er een verzoek over deze aangifte is verstuurd, is die deur dicht. U zit nu in een sanctieprocedure: het gedrag wordt behandeld als een belastingovertreding, en het bedrag is een evenredige boete over wat onbetaald is gebleven, samen met rente wegens te late betaling.",
  changed_p2: "Het is een duidelijk zwaarder regime dan de toeslag, en de verlaging van {pct} procent die bij de toeslag hoort, maakt er geen deel van uit.",

  nonumber_title: "Waarom hier geen bedrag staat",
  nonumber_p: "We konden het toepasselijke artikel van de Ley General Tributaria niet volledig lezen in de officiële geconsolideerde tekst, die het afkapt. We hebben een onbevestigd minimumcijfer en dat drukken we niet af alsof het vaststaat. Een percentage in een kop is precies hoe een onbevestigd cijfer iets wordt dat een eigenaar tegen zijn gestor herhaalt. Neem de brief mee naar een professional en laat het voorgestelde bedrag toetsen aan het artikel zelf.",

  week_title: "Wat u deze week doet",
  week_steps: [
    "Lees de deadline die in de brief staat. Dat is nu de datum die alles bepaalt, en die is meestal korter dan men denkt.",
    "Laat de aangifte zelf indienen en betaal de belasting als die nog openstaat. De boete is evenredig aan het onbetaalde bedrag, dus het is niet neutraal om het te laten liggen.",
    "Neem de brief mee naar een gestor voordat u reageert. Een voorstel is een voorstel, en de reactietermijn is de plek voor elk bezwaar.",
    "Blijkt de brief niet over deze aangifte of dit jaar te gaan, kom dan terug en beantwoord die vraag anders. De twee routes hebben niets gemeen en we tonen u ze niet allebei tegelijk.",
  ],

  window_title: "Uw venster",
  row_opens: "Indienen opent",
  row_closes: "Indienen sluit",
  row_debit: "Automatische incasso sluit",
  nothing_title: "Er is nog niets verschuldigd",
  nothing_p: "De toeslag begint pas als het indieningsvenster gesloten is. Vanaf de dag erna begint hij bij {base} procent en stijgt hij {per_month} procent per maand. Vroeg indienen kost niets en neemt de hele vraag weg.",

  cantell_title: "Wat we u kunnen vertellen",
  cantell_p1: "De toeslagladder zelf hangt niet af van het jaar. Hij begint bij {base} procent, stijgt met {per_month} procent voor elke volle maand, stopt bij {max} procent na twaalf maanden en wordt vanaf maand {from_month} een vaste {flat} procent met rente. De verlaging van {pct} procent bij betaling binnen het venster geldt op dezelfde manier.",
  cantell_p2: "Wat we niet kunnen, is uw aangifte op die ladder plaatsen, want daarvoor is de indieningsdeadline nodig van een jaar waarvoor we geen bevestigd venster hebben. Vraag uw gestor naar de exacte datum waarop het venster sloot, tel de volle maanden vanaf die datum, en de ladder hierboven geeft u de rest.",
  recent_title: "Als u ook een recenter jaar heeft",
  recent_p: "Begin opnieuw en kies {year} of later. Die vensters staan in de regelbasis en de tool dateert ze voor u.",

  gap_title: "Het gat waar bijna niemand over hoort",
  gap_p1: "Indienen en betalen via automatische incasso sluiten op verschillende dagen. Voor deze aangifte loopt het indieningsvenster tot {deadline}, maar als u de belasting via automatische incasso wilt laten afschrijven, moet de aangifte uiterlijk {debit} binnen zijn. Dat is {days} dagen eerder.",
  gap_p2: "Dient u in tijdens die laatste {days} dagen, dan is de aangifte op tijd, maar is de incasso-optie verdwenen. Eigenaren die dachten dat het geld automatisch zou worden afgeschreven, ontdekken maanden later dat dat nooit gebeurde, en een tijdig ingediende aangifte wordt een te laat betaalde schuld. Zit u dicht bij het einde van het venster, betaal dan met een kaart of overboeking en bewaar de bevestiging.",

  quarterly_title: "Nog één laatste kwartaalaangifte, en dan verandert het",
  quarterly_p: "De aangifte voor verhuur is losgekoppeld van de kwartaalcyclus. De laatste kwartaalaangifte betreft {quarter} en wordt ingediend tussen {from} en {to}. Huur die daarna wordt opgebouwd, valt in plaats daarvan in het jaarlijkse aprilvenster. Diende u uit gewoonte per kwartaal in, dan is dit de laatste, en de volgende datum die u nodig heeft valt in april.",

  regimes_title: "Twee regimes, en we hebben u er één getoond",
  regimes_penalty: "Alles hierboven gaat over de route na een verzoek. De vrijwillige toeslag, de ladder en de bijbehorende verlaging horen bij een ander regime, en niets daarvan geldt zodra er een brief is gekomen. Daarom tonen we u die cijfers hier niet.",
  regimes_voluntary: "Alles hierboven gaat over de vrijwillige route, waarop u zit omdat er geen brief is gekomen. Komt er een brief voordat u indient, dan gelden geen van deze cijfers en ziet het antwoord er heel anders uit. Dat is een reden om eerst in te dienen, geen reden om u zorgen te maken.",
  regimes_links: "De belasting zelf is een andere vraag dan wat te laat zijn kost. Bent u nog aan het uitzoeken wat er in de aangifte had moeten staan, dan helpen onze [rekenhulp voor belasting op huurinkomen](/rental-tax) en onze [belastingcalculator voor niet-residenten](/tax-calculator) met dat deel.",

  disclaimer: "Dit is een schatting op basis van de gepubliceerde regels op de getoonde data. Het is geen belasting- of juridisch advies, en het bedrag dat voor u bindend is, is het bedrag dat uw gestor of de belastingdienst vaststelt.",
  restart: "Opnieuw beginnen",
};

export default { en, no, sv, de, fr, nl };
