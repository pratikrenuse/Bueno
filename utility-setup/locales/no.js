// Norsk (bokmål). Same key paths as the English block in ../copy.js.
export default {
  eyebrow: 'Gratis verktøy',
  headline: 'Få strøm, vann og resten på plass, i den rekkefølgen det må skje',
  body: 'Strøm, vann, gass, internett og kommunens avgift er fem separate prosesser med fem ulike skranker, og to av dem kan ikke starte før noe annet er ferdig. Her settes de seks svarene dine i rekkefølge, og du får vite hva hver av dem krever.',
  points: [
    'Seks spørsmål, og så en ordnet liste du kan skrive ut',
    'Viser hva som er blokkert, og av hva',
    'Dokumentene, kontaktpunktet og regningen hver av dem fører med seg',
  ],
  cta: 'Lag rekkefølgen min',
  minutes: 'Omtrent ett minutt',

  q_stage: 'Hvor er du i prosessen med boligen?',
  q_stage_hint: 'Arbeidet er det samme uansett. Rekkefølgen endrer seg, og det gjør også hvem du fortsatt kan be om dokumenter.',
  stage_buying: 'Jeg kjøper, eller har nettopp overtatt',
  stage_buying_d: 'Abonnementene står fortsatt i selgerens navn, eller er nettopp flyttet',
  stage_owner: 'Jeg eier den allerede',
  stage_owner_d: 'Noe er allerede satt opp, og jeg endrer eller ordner det',

  q_supply: 'Hvordan står det til med forsyningene i dag?',
  q_supply_hint: 'Hvis ingen har vært i boligen nylig, så si det. Det er gjetting her som fører til en bortkastet måned.',
  supply_live: 'Tilkoblet og i orden',
  supply_live_d: 'Det er strøm og vann i boligen nå',
  supply_dormant: 'Tilkoblet, men boligen har stått tom lenge',
  supply_dormant_d: 'Målerne er der. Spørsmålet er om forsyningen fortsatt er aktiv.',
  supply_off: 'Frakoblet, eller aldri tilkoblet',
  supply_off_d: 'Ingenting ved måleren, eller ingen måler i det hele tatt',
  supply_unknown: 'Jeg vet ikke ennå',
  supply_unknown_d: 'Ingen har vært og sjekket',

  q_nie: 'Har du NIE-nummeret ditt?',
  q_nie_hint: 'NIE er det spanske identitetsnummeret for utlendinger. Det er nummeret en forsyningsavtale utstedes mot, så det avgjør hvor mye av denne listen du kan begynne på.',
  nie_have: 'Ja, jeg har sertifikatet',
  nie_applied: 'Søkt, venter fortsatt',
  nie_none: 'Ikke ennå',

  q_account: 'Har du en spansk konto til regningene?',
  q_account_hint: 'Nesten alt her betales med automatisk trekk, og flere leverandører tilbyr ingen annen betalingsmåte.',
  account_spanish: 'Ja, en spansk konto i mitt navn',
  account_foreign: 'Jeg har en eurokonto, men ikke en spansk',
  account_foreign_d: 'En IBAN i euro utstedt utenfor Spania',
  account_none: 'Nei, ikke ennå',

  q_type: 'Hva slags bolig er det?',
  q_type_hint: 'Det endrer hvem du snakker med, og om noen av disse i det hele tatt er dine å inngå avtale om.',
  type_apartment: 'Leilighet',
  type_apartment_d: 'I en blokk, med et sameie',
  type_villa: 'Hus eller villa',
  type_villa_d: 'På egen tomt, i eller nær en by',
  type_rural: 'Landlig eller avsidesliggende',
  type_rural_d: 'Utenfor landsbyens nett, eller ute i campo',

  q_plan: 'Ta over det som er der, eller bytte leverandør?',
  q_plan_hint: 'Det finnes en riktig rekkefølge her, og å gjøre det motsatt er hvordan folk mister forsyningen.',
  plan_takeover: 'Ta over det som allerede er der',
  plan_takeover_d: 'Raskest, og forsyningen forblir aktiv',
  plan_switch: 'Jeg vil bytte leverandør',
  plan_switch_d: 'Bedre tariff, eller en leverandør som snakker mitt språk',
  plan_unsure: 'Jeg har ikke bestemt meg',

  result_nie: 'Begynn med NIE. Alt nedenfor venter på det.',
  result_nie_sub: 'Avtaler om strøm, vann og gass utstedes til en navngitt person med spansk identitetsnummer, og ayuntamiento registrerer ikke et eierskifte uten et slikt nummer. Du kan likevel samle dokumenter og bestille en elektriker i dag. Du kan bare ikke sette noe i ditt navn.',
  result_installer: 'Bestill elektrikeren først. Resten kan gjøres fra telefonen.',
  result_installer_sub: 'En forsyning som har vært frakoblet, kan ikke settes under spenning på et sertifikat ingen har utstedt ennå, og elektrikeren må på befaring for å utstede det. Det er den lengste ventetiden på denne siden, så den kommer først, selv om det ikke er det første noen tenker på.',
  result_account: 'Du kan inngå avtalene. Det er betalingen som ikke er klar.',
  result_account_sub: 'Ingenting her er blokkert, men de automatiske trekkene er det, og en forsyningsavtale uten et fungerende trekk bak seg er den versjonen av dette som svikter om tre måneder mens du er i et annet land.',
  result_clear: 'Ingenting blokkerer deg. Her er rekkefølgen.',
  result_clear_sub: 'Du har de to tingene som styrer resten, så dette er nå en rekkefølge og ikke en ventetid. Jobb deg nedover. De lange ventetidene står øverst, og det du kan gjøre fra telefonen står lenger ned.',

  restart: 'Endre svarene mine',

  who_title: 'Hvem du faktisk har med å gjøre',
  gates_title: 'Hva som er blokkert, og av hva',

  g_gates: 'Først. Det alt annet venter på',
  g_gates_note: 'Ingen av disse er jobber med strøm eller vann. De er grunnen til at slike jobber mislykkes.',
  g_folder: 'Mappen du vil bli bedt om, hver eneste gang',
  g_folder_note: 'Alle leverandører og ayuntamiento ber om de samme fire tingene. Skann dem én gang, og ha dem et sted du kan nå fra utlandet.',
  g_elec: 'Strøm',
  g_elec_note: 'Du velger leverandøren selv og kontakter dem direkte, på telefon eller nett.',
  g_water: 'Vann',
  g_water_note: 'Den ene forsyningen du ikke velger selv. Begynn hos ayuntamiento, som enten fakturerer deg selv eller sier hvilket selskap som har konsesjonen for gaten din.',
  g_gas: 'Gass',
  g_gas_note: 'Bare noen byer har gass fra ledningsnett. Der det ikke finnes, er gass en leveringsavtale med et lokalt depot, ikke en tilkobling.',
  g_net: 'Internett og telefon',
  g_net_note: 'Ingenting juridisk avhenger av denne, og derfor står den her nede. Det er også den som krever et teknikerbesøk, så bestill den rundt et opphold.',
  g_council: 'Ayuntamiento: renovasjon og alt annet som faktureres på boligen',
  g_council_note: 'Ingen sender et velkomstbrev om dette. Avgiften finnes enten noen har fortalt deg om den eller ikke.',
  g_dd: 'Automatisk trekk. Det er her det faktisk svikter',
  g_dd_note: 'Alt her tar minutter nå og er virkelig vanskelig å rette opp fra et annet land. Et avvist trekk for strøm er hvordan forsyningen blir stengt mens eieren er i utlandet.',
  g_ongoing: 'Hva hver av disse forplikter deg til, fra nå av',
  g_ongoing_note: 'Å sette opp en forsyning tar en dag. Å beholde den er en kalender.',

  shell_note: 'Praktisk veiledning for boligeiere i Spania. Ikke juridisk rådgivning.',
  gates_para: 'Disse fire henger sammen. NIE-nummeret må finnes før noe kan settes i ditt navn, kontoen må finnes før et automatisk trekk kan knyttes til den, og i en bolig som har vært uten forsyning må installasjonssertifikatet finnes før noen vil slå på strømmen igjen. Å gjøre dem i en annen rekkefølge er det som gjør en uke til en hel sesong.',
  epc_title: 'Hvis du skal selge boligen, eller leie den ut til en ny leietaker',
  epc_p1: 'Et registrert energisertifikat kreves for å selge, og for å leie ut til en ny leietaker. Det er ikke en del av å få forsyningene på plass, og det er ikke noe en leverandør utsteder. En sertifisert tekniker kommer på besøk, vurderer boligen og registrerer sertifikatet hos regionen din.',
  epc_p2: 'Maksimal gyldighet er {default_years} år, bortsett fra når karakteren er G, da er den {g_years}. En stor del av den eldre boligmassen langs kysten har karakter E, F eller G, så hvis boligen kom med et sertifikat, bør du finne bokstaven i tillegg til datoen før du antar hvor lang tid du har. Å fornye en leieavtale med samme leietaker utløser ikke plikten i seg selv. En ny leietaker gjør det.',
  epc_p3: 'Brudd blir sanksjonert, og håndhevingen ligger hos regionene. Vi har ikke klart å finne bøtesatsene i primærkilden, så vi oppgir ikke noe tall for dem her.',
  source_label: 'Kilde',
  disclaimer: 'Dette er praktisk veiledning, ikke juridisk rådgivning. Praksis varierer virkelig mellom kommunene, så der denne listen sier at du skal spørre ayuntamiento, er det fordi svaret er deres å gi og ikke vårt.',

  gate: {
    contract: 'Sette en avtale i ditt navn',
    contract_waiting: 'Venter på NIE-sertifikatet',
    contract_blocked: 'Blokkert til du har NIE',
    open: 'Åpent for deg nå',
    dd: 'Betale med automatisk trekk',
    dd_foreign: 'Mulig, men test det før du stoler på det',
    dd_blocked: 'Blokkert til du har en konto',
    power: 'Få strømmen slått på',
    power_off: 'Krever et installasjonssertifikat først',
    power_dormant: 'Kan kreve et installasjonssertifikat først',
    power_unknown: 'Uvisst til noen har sett på måleren',
    power_live: 'Allerede aktiv, så dette er et bytte av abonnent',
    water: 'Opprette vannavtalen',
    water_value: 'Hos ayuntamiento, når du har NIE og dokumentasjon på eierskap',
  },

  contacts: {
    electricity: { label: 'Strøm', value: 'Leverandøren du velger, direkte. Feil ved måleren hører til nettselskapet, som du ikke velger selv.' },
    water: { label: 'Vann', value: 'Ayuntamiento, eller selskapet som har konsesjonen. Du kan ikke velge leverandør.' },
    gas: { label: 'Gass', value: 'Ledningsnett: leverandøren, som for strøm. Flasker eller tank: det lokale depotet.' },
    internet: { label: 'Internett', value: 'Leverandøren, direkte. Ingenting går via rådhuset.' },
    refuse: { label: 'Renovasjon', value: 'Ayuntamiento. Faktureres på boligen, etter kommunens egen kalender.' },
  },

  items: {
    gate_nie_apply: {
      text: 'Søk om NIE før du kontakter en eneste leverandør',
      why: 'Avtaler om strøm, vann og gass utstedes mot et spansk identitetsnummer, og ayuntamiento registrerer ikke et eierskifte på vannet uten et slikt nummer. Alle gruppene under venter på det.',
    },
    gate_nie_cert: {
      text: 'Få selve sertifikatet i hånden, og ta bilde av det',
      why: 'Referansenummeret fra timen er ikke dokumentet. Leverandørene ber om sertifikatet, og hver av dem ber om det separat, så du kommer til å sende det fire eller fem ganger.',
    },
    gate_account_open: {
      text: 'Åpne en spansk konto før du signerer en eneste forsyningsavtale',
      why: 'Automatisk trekk er den vanlige betalingsmåten her, og for noen leverandører den eneste. Signerer du først og ordner betalingen etterpå, må du tilbake til hver leverandør for seg, og det er en langt større jobb enn å gjøre det i samme samtale.',
    },
    gate_iban_test: {
      text: 'Test den utenlandske IBAN-en på én regning før du stoler på den for alle',
      why: 'Etter SEPA-reglene skal en leverandør godta enhver IBAN i euro. I praksis avviser ayuntamientos, vannkonsesjoner og mindre leverandører den fortsatt, eller taster den inn feil, og feilen når deg som en ubetalt regning og ikke som et avslag.',
    },
    gate_installer: {
      text: 'Bestill elektrikeren nå, før du velger leverandør',
      why: 'Det er besøket som er flaskehalsen, ikke papirarbeidet. Å velge tariff tar en kveld. Å få en elektriker ut til en bolig i august gjør det ikke.',
    },
    doc_id: {
      text: 'Pass eller nasjonalt ID-kort, og en skannet kopi',
      why: 'Du blir bedt om det når du inngår avtalen, og igjen av alle som senere skal endre noe på kontoen.',
    },
    doc_nie: {
      text: 'NIE-sertifikatet',
      why: 'Dette er nummeret avtalen utstedes mot, og det er det som knytter forsyningen til deg og ikke til adressen.',
    },
    doc_iban: {
      text: 'Den spanske IBAN-en, og navnet på kontoinnehaveren nøyaktig slik banken skriver det',
      why: 'Et navn som ikke stemmer, er en av de vanligste grunnene til at en trekkfullmakt stille og rolig blir avvist uker etter at du signerte.',
    },
    doc_ownership: {
      text: 'Dokumentasjon på din rett til boligen: escrituraen, en nota simple eller leiekontrakten',
      why: 'Leverandører setter ikke en forsyning i navnet til noen som ikke kan vise en tilknytning til adressen.',
    },
    buy_last_bills: {
      text: 'Den siste regningen for hver forsyning, fra selgeren, hos notarius',
      why: 'Hver av dem viser referansen til forsyningspunktet, CUPS for strøm og gass, og den avtalte effekten. Uten den ber du en leverandør finne boligen din etter adresse, noe som er tregt og av og til finner feil bolig. Etter overtakelsen har selgeren ingen grunn til å svare telefonen.',
    },
    buy_paid_up: {
      text: 'Skriftlig bekreftelse fra selgeren på at alle forsyningsregninger er betalt frem til i dag',
      why: 'Gjeld som ligger på et forsyningspunkt, kan holde igjen et bytte av abonnent, og det er langt enklere å ta opp før overtakelsen enn å jage etterpå.',
    },
    buy_meter_photos: {
      text: 'Et bilde av hver måler den dagen du får nøklene',
      why: 'Avlesningen på overtakelsesdagen er det som avgjør hvem som betaler for forbruket før du kom. Det tar tretti sekunder og er umulig å bestride.',
    },
    buy_no_cancel: {
      text: 'Be selgeren skriftlig om ikke å si opp noe',
      why: 'Et bytte av abonnent på en aktiv forsyning er et skjema. En ny tilkobling på en død forsyning er et sertifikat, en tekniker og en ventetid. Selgere sier opp forsyninger for å stoppe sine egne regninger, og de gjør det uten å si fra til noen.',
    },
    elec_boletin: {
      text: 'La en autorisert elektriker utstede installasjonssertifikatet, boletin eller CIE',
      why: 'En leverandør setter ikke spenning på en forsyning som har vært frakoblet lenge uten et gyldig sertifikat, og bare en elektriker som har sett boligen kan utstede det. Hvor lenge som regnes som lenge nok, fastsettes regionalt, så gå ut fra at du trenger et og la elektrikeren si noe annet.',
    },
    elec_supply_point: {
      text: 'Spør om forsyningspunktet fortsatt finnes eller er sagt opp',
      why: 'En forsyning som var suspendert, er en gjenoppkobling. En forsyning som ble sagt opp, er en ny tilkobling, som prises og planlegges annerledes. Leverandøren kan svare på ett minutt ut fra CUPS, og det endrer hva du bør budsjettere med.',
    },
    elec_titularidad: {
      text: 'Be uttrykkelig om en cambio de titularidad, et bytte av abonnent',
      why: 'Det holder forsyningen aktiv og flytter den over i ditt navn i ett steg. Å si opp og inngå ny avtale i stedet bryter forsyningen, og å få den tilbake er et gebyr og en ventetid i stedet for en telefonsamtale.',
    },
    elec_name_first: {
      text: 'Sett avtalen i ditt navn først. Bytt leverandør etterpå',
      why: 'Du kan ikke flytte en avtale som ikke er din, og så lenge den står i selgerens navn, kan de si den opp under deg. Bytt abonnent, lev med tariffen én periode, og bytt deretter.',
    },
    elec_three_questions: {
      text: 'Før du signerer den nye tariffen, still tre spørsmål: fast eller indeksert pris, bindingstid, og hva fastleddet er',
      why: 'Det er enhetsprisen som blir reklamert for. For en bolig som står tom halve året, betyr fastleddet og bindingstiden mer enn enhetsprisen.',
    },
    elec_potencia: {
      text: 'Sjekk den avtalte effekten, potencia contratada, på siste regning før du godtar den',
      why: 'Fastleddet bestemmes av den avtalte effekten, og det betales enten boligen er i bruk eller står tom hele vinteren. Et feriehus med effekten en fastboende familie trengte, betaler for det hver måned hele året, og å senke den er én telefonsamtale.',
    },
    elec_phase: {
      text: 'Spør om forsyningen er enfase eller trefase, og hva installasjonen faktisk tåler',
      why: 'Bassengpumpe, aircondition og induksjonstopp samtidig er en annen belastning enn et gammelt hus ble koblet for. Å øke den avtalte effekten utover det installasjonen tillater, betyr et nytt sertifikat og kanskje arbeid ved måleren, og det er en mye bedre samtale å ta før håndverkerne drar.',
    },
    elec_block: {
      text: 'Spør administrador de fincas hva som faktureres sameiet og hva som faktureres deg',
      why: 'Trappelys, heis og bassengpumpe er sameiets forsyning og kommer til deg gjennom fellesutgiftene. Bare din egen måler hører hjemme på din avtale.',
    },
    elec_no_mains: {
      text: 'Finnes det ingen tilkobling til strømnettet, skaff en skriftlig utredning og pris før du går ut fra at det blir en',
      why: 'Å føre frem en ny forsyning til en avsidesliggende tomt er et prosjekt med et pristilbud, ikke en avtaleendring. Eiere finner dette ut etter at de har kjøpt, og da er solceller med batteri ofte det ærlige svaret og ikke bare et alternativ.',
    },
    water_counter: {
      text: 'Gå til ayuntamiento, registrer eierskiftet og opprett den nye avtalen',
      why: 'Dette er den ene forsyningen som ikke finnes på noen sammenligningsside. Rådhuset fakturerer deg enten direkte eller forteller hvilket selskap som har konsesjonen for gaten din, og det finnes ikke noe annet alternativ å handle hos.',
    },
    water_folder: {
      text: 'Ta med den samme mappen. ID, NIE, IBAN og dokumentasjon på eierskap',
      why: 'De ber om nøyaktig det samme som leverandørene. Et manglende dokument her betyr en tur til, ikke en e-post i etterkant.',
    },
    water_no_connection: {
      text: 'Finnes det ingen vanntilkobling i det hele tatt, start med dette før alt annet på siden',
      why: 'Å koble til en bolig som aldri har vært tilkoblet, er et kommunalt anleggsarbeid og ikke en avtaleendring, og det tar måneder, ikke dager. Alt annet på listen kan lettere vente på dette enn dette kan vente på dem.',
    },
    water_own_meter: {
      text: 'Sjekk om leiligheten din har egen måler, eller om blokken deler én',
      why: 'Noen blokker har én felles vannavtale og fordeler den gjennom sameiets regnskap. Gjør din det, er det ingenting for deg å inngå avtale om, og risikoen blir i stedet å betale en regning som aldri var din.',
    },
    water_well: {
      text: 'Kommer vannet fra en brønn, et borehull eller en tank, be om å få se tillatelsen til uttak',
      why: 'Uttak av grunnvann godkjennes av vassdragsmyndigheten, Confederacion Hidrografica. Enten fulgte tillatelsen med boligen, eller så fantes den aldri, og det er umulig å se på pumpen.',
    },
    water_deposit: {
      text: 'Er det en tank med levering, finn ut hvem som leverer og hvor lang ventetiden er i august',
      why: 'En tank som går tom den uken hele kysten fyller opp sine, er den typen problem som ikke har noen papirløsning.',
    },
    water_meter_access: {
      text: 'Spør hvor måleren er, og om avleseren faktisk kommer til den',
      why: 'En måler bak en låst port får stipulerte avlesninger. Stipuleringene blir rettet til slutt, og rettelsen kommer som én regning i stedet for flere.',
    },
    water_other_charges: {
      text: 'Spør ayuntamiento hva mer som faktureres på denne boligen',
      why: 'Renovasjonsavgiften, og noen ganger avløpsavgiften, kommer på vannregningen eller fra samme kontor. Å spørre én gang ved skranken er mye billigere enn å finne det ut gjennom et betalingskrav.',
    },
    gas_mains: {
      text: 'Finn ut om gaten har gass fra ledningsnett før du ser etter en gasstariff',
      why: 'Gass fra ledningsnett når et mindretall av spanske adresser. I store deler av landet er det ærlige svaret at det ikke finnes noe å inngå avtale om, og da er saken avsluttet.',
    },
    gas_bottles: {
      text: 'Går det på gassflasker, finn det lokale depotet og spør hvordan levering fungerer når ingen er der',
      why: 'En flaskeavtale inngås med et depot, ikke med en nasjonal leverandør. En levering som krever at noen står i døren, er lite verdt for en eier som er der to ganger i året, og en avtale med naboen er det de fleste faktisk ender med.',
    },
    gas_inspection: {
      text: 'Finnes det et gassanlegg, før opp den periodiske sikkerhetskontrollen i kalenderen',
      why: 'Et gassanlegg må kontrolleres med faste mellomrom, for din regning, og kontrolløren må komme inn. Det er en jobb å planlegge rundt et besøk, ikke noe å bli overrasket av mens du er i et annet land.',
    },
    gas_old_install: {
      text: 'Regn med en kontroll før et gammelt gassanlegg tas i bruk igjen',
      why: 'Et anlegg som har stått ubrukt i årevis, blir ikke bare slått på igjen, og å finne det ut den dagen du kommer med familien er feil dag.',
    },
    gas_combined: {
      text: 'Hent pris på en kombinert tariff for gass og strøm, og deretter på hver for seg',
      why: 'Kombinerte tariffer er vanlige her og noen ganger virkelig billigere. Andre ganger er de to middels priser i stedet for to gode, og den eneste måten å vite det på er å be om begge.',
    },
    net_coverage: {
      text: 'Sjekk dekningen på den nøyaktige adressen, ikke byen',
      why: 'Tilgang til fiber endrer seg fra gate til gate langs kysten og stopper brått utenfor landsbyene. At byen har dekning, betyr svært lite.',
    },
    net_keep_line: {
      text: 'Behold en eksisterende linje til den nye fungerer',
      why: 'Sier du opp først, står du uten forbindelse og uten mulighet til å styre noe annet på avstand, og en ny installasjon betyr et nytt teknikerbesøk du må være til stede på.',
    },
    net_min_term: {
      text: 'Sjekk bindingstiden, og hva som skjer med ruteren hvis du sier opp',
      why: 'Bindingstid er vanlig her, og utstyret må som regel leveres tilbake. Begge deler er langt billigere å vite om nå enn når du skal avslutte.',
    },
    net_block_fibre: {
      text: 'Spør administradoren om blokken allerede har fiber frem til døren, og hvilken vei nye kabler må gå',
      why: 'Sameier har regler om boring og kabelkanaler, og en tekniker som overser dem, blir stoppet av en nabo midt i jobben.',
    },
    net_no_fibre: {
      text: 'Spør hva løsningen er hvis fiberen ikke når frem til deg',
      why: 'Fast trådløst og mobilrutere er det vanlige svaret i innlandet. Utstyret og avtalen er annerledes, så det er verdt å vite før du binder deg til noe som ikke kan installeres.',
    },
    council_register: {
      text: 'Registrer eierskiftet for renovasjonsavgiften, tasa de basura',
      why: 'Den belastes boligen etter kommunens egen kalender, og til noen sier fra til kommunen, fortsetter regningen å gå til forrige eier. Det gjør ikke gjelden.',
    },
    council_billing: {
      text: 'Spør hvordan og hvor ofte den faktureres, for det varierer mellom kommunene',
      why: 'Noen fakturerer den sammen med vannet, noen én gang i året for seg, noen sammen med IBI. Det finnes ikke noe nasjonalt svar, bare rådhusets svar, og det er et spørsmål på to minutter ved skranken.',
    },
    council_dd: {
      text: 'Sett opp automatisk trekk for den mens du står der',
      why: 'En kommunal avgift som ikke blir betalt, går over i en innkrevingsprosess med et tillegg, og det første du hører om det, er et brev på spansk som kommer til en bolig du ikke er i.',
    },
    council_ibi: {
      text: 'Mens du står ved skranken, sjekk at IBI trekkes fra den samme kontoen',
      why: 'Den kommer fra samme kontor, den faktureres én gang i året, og en årlig betaling er akkurat den typen en eier i utlandet går glipp av.',
    },
    council_community: {
      text: 'Spør om sameiet ordner søppeltømmingen for blokken',
      why: 'Søppelkassene kan godt være felles. Avgiften er likevel din, og de to blir blandet sammen ofte nok til at det er verdt ti sekunder.',
    },
    dd_same_time: {
      text: 'Sett opp domiciliacion i samme samtale som avtalen',
      why: 'Å legge det til etterpå er en egen prosess hos hver leverandør, én om gangen, og flere godtar bare instruksen fra deg og ikke fra en bank.',
    },
    dd_name: {
      text: 'Oppgi navnet på kontoinnehaveren nøyaktig slik banken har det',
      why: 'En fullmakt med et litt annet navn er en fullmakt som blir avvist, og avvisningen viser seg som en ubetalt regning og ikke som en feilmelding du har fått.',
    },
    dd_date: {
      text: 'Regn med at leverandøren velger trekkdatoen, ikke du',
      why: 'Spanske leverandører bestemmer sine egne trekkdatoer og har ingen plikt til å tilpasse dem lønningsdagen din i et annet land. En konto som fylles på etter en plan som passer hjemme, er en konto som er tom den dagen de trekker.',
    },
    dd_buffer: {
      text: 'Ha en fast buffer på kontoen i stedet for det nøyaktige beløpet',
      why: 'Regningene endrer seg med forbruket og årstiden. Et trekk på noen få euro mer enn du lot stå igjen, blir avvist akkurat som alle andre.',
    },
    dd_returned: {
      text: 'Behandle et avvist trekk for strøm som noe som haster, ikke som administrasjon',
      why: 'Et avvist trekk er hvordan forsyningen blir stengt mens eieren er i utlandet. Gjenoppkobling er treg og koster penger, og i mellomtiden er kjøleskapet, alarmen og avfukteren slått av uten at noen er der og merker det.',
    },
    dd_receipts: {
      text: 'Last ned og ta vare på kvitteringen for hvert automatisk trekk',
      why: 'Hver av dem viser kundenummeret leverandøren trenger før de vil endre noe. Det er det ene dokumentet som gjør det mulig å flytte et trekk senere, og det er mye enklere å lagre nå enn å rekonstruere.',
    },
    dd_change_bank: {
      text: 'Bytter du noen gang bank, regn med å måtte gi beskjed til hver leverandør selv',
      why: 'Det finnes ingen automatisk byttetjeneste her av den typen noen land har. Du gir hver leverandør beskjed om endringen, noen godtar den bare fra kunden selv, og før hver av dem har bekreftet, har ingenting faktisk flyttet seg.',
    },
    dd_old_account: {
      text: 'La det stå penger på den gamle kontoen i én hel faktureringsperiode etter en endring',
      why: 'Forfaller en betaling kort tid etter at du ba om endringen, kan leverandøren fortsatt trekke den fra den gamle kontoen. Endringen er reell først når du har sett en hel periode gå fra den nye.',
    },
    dd_first_bill: {
      text: 'Sjekk den første regningen etter en endring, både beløpet og kontoen',
      why: 'Det er nå en feil fortsatt er liten og fortsatt din å rette opp.',
    },
    dd_foreign_start: {
      text: 'Begynn hos ayuntamiento hvis du bruker en utenlandsk IBAN',
      why: 'Kommunale skranker og vannkonsesjoner er der en ikke-spansk IBAN oftest blir avvist eller tastet feil. Skal det gå galt, går det galt der, og det vil du vite før fire andre leverandører er avhengige av den.',
    },
    on_cycle: {
      text: 'Regningene kommer etter leverandørens syklus, ikke din',
      why: 'Månedlig, annenhver måned eller kvartalsvis, avhengig av hvem du har avtale med og hvor boligen ligger. Noter hvilken, slik at en regning som ikke kommer, er noe du merker og ikke noe du oppdager.',
    },
    on_standing: {
      text: 'Et fastledd løper enten det er noen i boligen eller ikke',
      why: 'Både strøm og vann tar betalt for å være tilkoblet. Et tomt feriehus har et gulv for regningene sine, og den avtalte effekten er som regel det eneste reelle grepet du har på det.',
    },
    on_gas_inspection: {
      text: 'Gassanlegget må kontrolleres med jevne mellomrom, for din regning, med noen til stede',
      why: 'Det er ikke valgfritt, og kontrolløren må komme inn, noe som for en eier i utlandet betyr planlegging og ikke brannslukking.',
    },
    on_estimates: {
      text: 'Avlesningene blir stipulert når ingen kommer til måleren',
      why: 'Stipuleringene blir rettet til slutt, og rettelsen blir ikke fordelt utover. Den kommer samlet.',
    },
    on_refuse: {
      text: 'Renovasjonsavgiften løper så lenge du eier boligen',
      why: 'Den er knyttet til boligen, ikke til om noen bruker den eller om søppelet noen gang ble satt ut.',
    },
    on_tariff: {
      text: 'Se på tariffen én gang i året i stedet for aldri',
      why: 'Tariffer fornyes i det stille. En årlig gjennomgang av fastleddet og den avtalte effekten er som regel der pengene ligger, og ikke i enhetsprisen alle sammenligner.',
    },
    on_community: {
      text: 'Fellesutgiftene til sameiet kommer i tillegg til alt dette, og de stopper ikke',
      why: 'Gjeld til sameiet følger boligen i Spania, ikke eieren som opparbeidet den, så den følger huset og den følger med ved et salg.',
    },
  },
};
