// Svenska. Same key paths as the English block in ../copy.js.
export default {
  eyebrow: 'Gratis guide',
  headline: 'Få el, vatten och resten på plats, i den ordning det måste ske',
  body: 'El, vatten, gas, internet och kommunens avgift är fem separata processer med fem olika diskar, och två av dem kan inte börja förrän något annat är klart. Här sätts dina sex svar i ordning, och du får veta vad var och en kräver.',
  points: [
    'Sex frågor, sedan en ordnad lista du kan skriva ut',
    'Visar vad som är blockerat, och av vad',
    'Dokumenten, kontakten och räkningen som var och en för med sig',
  ],
  cta: 'Skapa min ordning',
  minutes: 'Ungefär en minut',

  q_stage: 'Var befinner du dig med fastigheten?',
  q_stage_hint: 'Arbetet är detsamma i båda fallen. Ordningen ändras, och det gör också vem du fortfarande kan be om dokument.',
  stage_buying: 'Jag köper, eller har precis tillträtt',
  stage_buying_d: 'Abonnemangen står fortfarande på säljaren, eller har precis flyttats',
  stage_owner: 'Jag äger den redan',
  stage_owner_d: 'Något är redan uppsatt och jag ändrar eller fixar det',

  q_supply: 'Hur ser det ut med försörjningen i dag?',
  q_supply_hint: 'Om ingen har varit i fastigheten nyligen, säg det. Det är gissningar här som leder till en bortkastad månad.',
  supply_live: 'Ansluten och fungerar',
  supply_live_d: 'Det finns el och vatten i fastigheten nu',
  supply_dormant: 'Ansluten, men fastigheten har stått tom länge',
  supply_dormant_d: 'Mätarna finns där. Frågan är om leveransen fortfarande är aktiv.',
  supply_off: 'Avstängd, eller aldrig ansluten',
  supply_off_d: 'Ingenting vid mätaren, eller ingen mätare alls',
  supply_unknown: 'Jag vet inte ännu',
  supply_unknown_d: 'Ingen har varit där och kontrollerat',

  q_nie: 'Har du ditt NIE?',
  q_nie_hint: 'NIE är det spanska identitetsnumret för utlänningar. Det är numret ett leveransavtal utfärdas mot, så det avgör hur mycket av den här listan du kan börja med.',
  nie_have: 'Ja, jag har intyget',
  nie_applied: 'Ansökt, väntar fortfarande',
  nie_none: 'Inte ännu',

  q_account: 'Har du ett spanskt konto för räkningarna?',
  q_account_hint: 'Nästan allt här betalas via autogiro, och flera leverantörer erbjuder inget annat sätt.',
  account_spanish: 'Ja, ett spanskt konto i mitt namn',
  account_foreign: 'Jag har ett eurokonto, men inte ett spanskt',
  account_foreign_d: 'En IBAN i euro utfärdad utanför Spanien',
  account_none: 'Nej, inte ännu',

  q_type: 'Vilken typ av fastighet är det?',
  q_type_hint: 'Det ändrar vem du pratar med, och om några av dessa ens är dina att teckna.',
  type_apartment: 'Lägenhet',
  type_apartment_d: 'I ett flerbostadshus, med en samfällighet',
  type_villa: 'Hus eller villa',
  type_villa_d: 'På egen tomt, i eller nära en stad',
  type_rural: 'Lantligt eller avskilt',
  type_rural_d: 'Utanför byns nät, eller ute i campo',

  q_plan: 'Ta över det som finns, eller byta leverantör?',
  q_plan_hint: 'Det finns en rätt ordning här, och att göra det tvärtom är hur folk förlorar leveransen.',
  plan_takeover: 'Ta över det som redan finns',
  plan_takeover_d: 'Snabbast, och leveransen förblir aktiv',
  plan_switch: 'Jag vill byta leverantör',
  plan_switch_d: 'Bättre taxa, eller en leverantör som pratar mitt språk',
  plan_unsure: 'Jag har inte bestämt mig',

  result_nie: 'Börja med ditt NIE. Allt nedan väntar på det.',
  result_nie_sub: 'Avtal om el, vatten och gas utfärdas till en namngiven person med spanskt identitetsnummer, och ditt ayuntamiento registrerar inte ett ägarbyte utan ett sådant. Du kan ändå samla dokument och boka en elinstallatör i dag. Du kan bara inte sätta något i ditt namn.',
  result_installer: 'Boka elinstallatören först. Resten kan göras från telefonen.',
  result_installer_sub: 'En leverans som har varit avstängd kan inte spänningssättas på ett intyg som ingen har utfärdat ännu, och installatören måste komma på besök för att utfärda det. Det är den längsta väntetiden på sidan, så den kommer först, även om det inte är det första någon tänker på.',
  result_account: 'Du kan teckna avtalen. Det är betalningen som inte är klar.',
  result_account_sub: 'Inget här är blockerat, men autogirona är det, och ett leveransavtal utan ett fungerande autogiro bakom är den version av det här som fallerar om tre månader medan du är i ett annat land.',
  result_clear: 'Inget blockerar dig. Här är ordningen.',
  result_clear_sub: 'Du har de två saker som styr resten, så det här är nu en ordningsföljd och ingen väntan. Arbeta dig nedåt. De långa väntetiderna står överst och det du kan göra från telefonen står längre ner.',

  restart: 'Ändra mina svar',

  who_title: 'Vem du faktiskt har att göra med',
  gates_title: 'Vad som är blockerat, och av vad',

  g_gates: 'Först. Det som allt annat väntar på',
  g_gates_note: 'Inget av detta är el- eller vattenjobb. Det är anledningen till att sådana jobb misslyckas.',
  g_folder: 'Mappen du kommer att bli ombedd att visa, varje gång',
  g_folder_note: 'Alla leverantörer och ditt ayuntamiento frågar efter samma fyra saker. Skanna dem en gång och spara dem någonstans du når från utlandet.',
  g_elec: 'El',
  g_elec_note: 'Du väljer leverantör och kontaktar dem direkt, per telefon eller på nätet.',
  g_water: 'Vatten',
  g_water_note: 'Den enda försörjning du inte väljer själv. Börja hos ditt ayuntamiento, som antingen fakturerar dig själv eller talar om vilket bolag som har koncessionen för din gata.',
  g_gas: 'Gas',
  g_gas_note: 'Bara vissa orter har stadsgas. Där det inte finns är gas ett leveransavtal med en lokal depå, inte en anslutning.',
  g_net: 'Internet och telefon',
  g_net_note: 'Inget juridiskt hänger på den här, och därför står den längre ner. Det är också den som kräver ett teknikerbesök, så boka den kring ett besök.',
  g_council: 'Ditt ayuntamiento: sophämtning och allt annat som faktureras på fastigheten',
  g_council_note: 'Ingen skickar ett välkomstbrev om det här. Avgiften finns oavsett om någon har berättat om den eller inte.',
  g_dd: 'Autogiro. Det är här det faktiskt går sönder',
  g_dd_note: 'Allt här tar några minuter nu och är verkligen svårt att rätta till från ett annat land. Ett returnerat autogiro för el är hur leveransen stängs av medan ägaren är utomlands.',
  g_ongoing: 'Vad var och en av dessa binder dig till, från och med nu',
  g_ongoing_note: 'Att sätta upp en leverans tar en dag. Att behålla den är en kalender.',

  shell_note: 'Praktisk vägledning för fastighetsägare i Spanien. Inte juridisk rådgivning.',
  gates_para: 'De här fyra hänger ihop. Ditt NIE måste finnas innan något kan sättas i ditt namn, kontot måste finnas innan ett autogiro kan kopplas till det, och i en fastighet som har varit utan leverans måste installationsintyget finnas innan någon slår på strömmen igen. Att göra dem i en annan ordning är det som gör en vecka till en hel säsong.',
  epc_title: 'Om du ska sälja fastigheten, eller hyra ut den till en ny hyresgäst',
  epc_p1: 'En registrerad energideklaration krävs för att sälja, och för att hyra ut till en ny hyresgäst. Den är inte en del av att få försörjningen på plats, och det är inget en leverantör utfärdar. En certifierad tekniker kommer på besök, bedömer fastigheten och registrerar deklarationen hos din region.',
  epc_p2: 'Den längsta giltighetstiden är {default_years} år, utom när klassningen är G, då är den {g_years}. En stor del av det äldre beståndet längs kusten har klass E, F eller G, så om fastigheten kom med en deklaration, leta upp bokstaven och inte bara datumet innan du räknar med hur lång tid du har. Att förnya ett hyresavtal med samma hyresgäst utlöser inte skyldigheten i sig. En ny hyresgäst gör det.',
  epc_p3: 'Överträdelser sanktioneras, och tillsynen ligger hos regionerna. Vi har inte kunnat hämta sanktionsnivåerna ur primärtexten, så vi anger ingen siffra för dem här.',
  source_label: 'Källa',
  disclaimer: 'Det här är praktisk vägledning, inte juridisk rådgivning. Kommunernas praxis skiljer sig verkligen åt, så där listan säger att du ska fråga ditt ayuntamiento är det för att svaret är deras att ge och inte vårt.',

  gate: {
    contract: 'Sätta ett avtal i ditt namn',
    contract_waiting: 'Väntar på NIE-intyget',
    contract_blocked: 'Blockerat tills du har ett NIE',
    open: 'Öppet för dig nu',
    dd: 'Betala via autogiro',
    dd_foreign: 'Möjligt, men testa innan du förlitar dig på det',
    dd_blocked: 'Blockerat tills du har ett konto',
    power: 'Få strömmen påslagen',
    power_off: 'Kräver ett installationsintyg först',
    power_dormant: 'Kan kräva ett installationsintyg först',
    power_unknown: 'Okänt tills någon har tittat på mätaren',
    power_live: 'Redan aktiv, så det här är ett byte av abonnent',
    water: 'Teckna vattenavtalet',
    water_value: 'Hos ditt ayuntamiento, när du har ditt NIE och bevis på ägande',
  },

  contacts: {
    electricity: { label: 'El', value: 'Leverantören du väljer, direkt. Fel vid mätaren hör till nätbolaget, som du inte väljer själv.' },
    water: { label: 'Vatten', value: 'Ditt ayuntamiento, eller bolaget som har koncessionen. Det finns inget val av leverantör.' },
    gas: { label: 'Gas', value: 'Stadsgas: leverantören, precis som för el. Gasol på flaska eller tank: den lokala depån.' },
    internet: { label: 'Internet', value: 'Leverantören, direkt. Inget går via kommunhuset.' },
    refuse: { label: 'Sophämtning', value: 'Ditt ayuntamiento. Faktureras på fastigheten, enligt kommunens egen kalender.' },
  },

  items: {
    gate_nie_apply: {
      text: 'Ansök om NIE innan du kontaktar en enda leverantör',
      why: 'Avtal om el, vatten och gas utfärdas mot ett spanskt identitetsnummer, och ditt ayuntamiento registrerar inte ett ägarbyte på vattnet utan ett sådant. Varje grupp nedan väntar på det.',
    },
    gate_nie_cert: {
      text: 'Få själva intyget i handen, och fotografera det',
      why: 'Referensnumret från besöket är inte dokumentet. Leverantörerna frågar efter intyget, och var och en frågar för sig, så du kommer att skicka det fyra eller fem gånger.',
    },
    gate_account_open: {
      text: 'Öppna ett spanskt konto innan du skriver under något leveransavtal',
      why: 'Autogiro är det vanliga betalsättet här och för vissa leverantörer det enda. Att skriva under först och ordna betalningen efteråt betyder att du får gå tillbaka till varje leverantör för sig, vilket är ett mycket större jobb än att göra det i samma samtal.',
    },
    gate_iban_test: {
      text: 'Testa det utländska IBAN-numret på en räkning innan du förlitar dig på det för alla',
      why: 'Enligt SEPA-reglerna måste en leverantör godta varje IBAN i euro. I praktiken avvisar ayuntamientos, vattenkoncessioner och mindre leverantörer det fortfarande, eller knappar in det fel, och felet når dig som en obetald räkning och inte som ett avslag.',
    },
    gate_installer: {
      text: 'Boka elinstallatören nu, innan du väljer leverantör',
      why: 'Det är besöket som är flaskhalsen, inte pappersarbetet. Att välja taxa tar en kväll. Att få en installatör till en fastighet i augusti gör det inte.',
    },
    doc_id: {
      text: 'Pass eller nationellt id-kort, och en skannad kopia',
      why: 'Det efterfrågas när du tecknar avtalet, och igen av alla som senare behöver ändra något på kontot.',
    },
    doc_nie: {
      text: 'NIE-intyget',
      why: 'Det är numret avtalet utfärdas mot, och det är det som knyter leveransen till dig och inte till adressen.',
    },
    doc_iban: {
      text: 'Det spanska IBAN-numret, och kontohavarens namn exakt som banken skriver det',
      why: 'Ett namn som inte stämmer är en av de vanligaste orsakerna till att ett autogiromedgivande tyst avvisas flera veckor efter att du skrev under.',
    },
    doc_ownership: {
      text: 'Bevis på din rätt till fastigheten: din escritura, en nota simple eller hyresavtalet',
      why: 'Leverantörer sätter inte en leverans i namnet på någon som inte kan visa en koppling till adressen.',
    },
    buy_last_bills: {
      text: 'Den senaste räkningen för varje leverans, från säljaren, hos notarien',
      why: 'Var och en anger referensen för leveranspunkten, CUPS för el och gas, och den avtalade effekten. Utan den ber du en leverantör hitta din fastighet via adressen, vilket är långsamt och ibland hittar fel fastighet. Efter tillträdet har säljaren ingen anledning att svara i telefon.',
    },
    buy_paid_up: {
      text: 'Skriftlig bekräftelse från säljaren på att varje räkning för försörjningen är betald till dags dato',
      why: 'Skulder på en leveranspunkt kan hålla upp ett byte av abonnent, och det är mycket enklare att ta upp före tillträdet än att jaga efteråt.',
    },
    buy_meter_photos: {
      text: 'Ett foto av varje mätare den dag du får nycklarna',
      why: 'Mätarställningen på tillträdesdagen avgör vem som betalar för det som förbrukades innan du kom. Det tar trettio sekunder och går inte att ifrågasätta.',
    },
    buy_no_cancel: {
      text: 'Be säljaren skriftligt att inte säga upp något',
      why: 'Ett byte av abonnent på en aktiv leverans är en blankett. En ny anslutning på en död leverans är ett intyg, en tekniker och en väntan. Säljare säger upp leveranser för att stoppa sina egna räkningar, och de gör det utan att säga något till någon.',
    },
    elec_boletin: {
      text: 'Låt en behörig elinstallatör utfärda installationsintyget, boletin eller CIE',
      why: 'En leverantör spänningssätter inte en leverans som har varit avstängd länge utan ett giltigt intyg, och bara en installatör som har sett fastigheten kan utfärda det. Hur länge som räknas som tillräckligt länge bestäms regionalt, så räkna med att du behöver ett och låt installatören säga något annat.',
    },
    elec_supply_point: {
      text: 'Fråga om leveranspunkten fortfarande finns eller har sagts upp',
      why: 'En leverans som var avstängd är en återinkoppling. En leverans som sades upp är en ny anslutning, som prissätts och planeras på ett annat sätt. Leverantören kan svara på en minut utifrån CUPS, och det ändrar vad du bör budgetera för.',
    },
    elec_titularidad: {
      text: 'Be uttryckligen om en cambio de titularidad, ett byte av abonnent',
      why: 'Det håller leveransen aktiv och flyttar den till ditt namn i ett steg. Att säga upp och teckna nytt i stället bryter leveransen, och att få tillbaka den kostar en avgift och en väntan i stället för ett telefonsamtal.',
    },
    elec_name_first: {
      text: 'Sätt avtalet i ditt namn först. Byt leverantör sedan',
      why: 'Du kan inte flytta ett avtal som inte är ditt, och så länge det står på säljaren kan de säga upp det under fötterna på dig. Byt abonnent, lev med taxan en period och byt sedan.',
    },
    elec_three_questions: {
      text: 'Innan du skriver under den nya taxan, ställ tre frågor: fast eller rörligt pris, bindningstid och hur stor den fasta avgiften är',
      why: 'Det är priset per enhet som annonseras. För en fastighet som står tom halva året spelar den fasta avgiften och en bindningstid större roll än priset per enhet.',
    },
    elec_potencia: {
      text: 'Kontrollera den avtalade effekten, potencia contratada, på den senaste räkningen innan du godtar den',
      why: 'Den fasta avgiften styrs av den avtalade effekten och betalas oavsett om fastigheten används eller står tom hela vintern. Ett fritidshus med den effekt en helårsboende familj behövde betalar för det varje månad hela året, och att sänka den är ett telefonsamtal.',
    },
    elec_phase: {
      text: 'Fråga om leveransen är enfas eller trefas, och vad installationen faktiskt klarar',
      why: 'Poolpump, luftkonditionering och induktionshäll samtidigt är en annan belastning än ett gammalt hus drogs för. Att höja den avtalade effekten utöver vad installationen tillåter kräver ett nytt intyg och kanske arbete vid mätaren, och det är ett mycket bättre samtal att ta innan hantverkarna åker.',
    },
    elec_block: {
      text: 'Fråga din administrador de fincas vad som faktureras huset och vad som faktureras dig',
      why: 'Trappbelysning, hiss och poolpump är samfällighetens leverans och når dig via samfällighetsavgiften. Bara din egen mätare hör hemma på ditt avtal.',
    },
    elec_no_mains: {
      text: 'Om det inte finns någon anslutning till elnätet, skaffa en skriftlig utredning och ett pris innan du räknar med att det blir en',
      why: 'Att dra fram en ny leverans till en avskild tomt är ett projekt med en offert, inte en avtalsändring. Ägare får reda på det efter köpet, och då är solceller med batteri ofta det ärliga svaret snarare än bara ett alternativ.',
    },
    water_counter: {
      text: 'Gå till ditt ayuntamiento, registrera ägarbytet och teckna det nya avtalet',
      why: 'Det här är den enda leveransen som inte finns på någon jämförelsesajt. Kommunhuset fakturerar dig antingen direkt eller talar om vilket bolag som har koncessionen för din gata, och det finns inget annat alternativ att välja.',
    },
    water_folder: {
      text: 'Ta med samma mapp. Id-handling, NIE, IBAN och bevis på ägande',
      why: 'De frågar efter exakt samma saker som leverantörerna. Ett dokument som saknas här betyder en resa till, inte ett mejl i efterhand.',
    },
    water_no_connection: {
      text: 'Om det inte finns någon vattenanslutning alls, börja med det före allt annat på sidan',
      why: 'Att ansluta en fastighet som aldrig har varit ansluten är ett kommunalt anläggningsarbete och inte en avtalsändring, och det tar månader snarare än dagar. Allt annat på listan kan lättare vänta på det här än det här kan vänta på dem.',
    },
    water_own_meter: {
      text: 'Kontrollera om din lägenhet har en egen mätare eller om huset delar en',
      why: 'Vissa hus har ett gemensamt vattenavtal och fördelar kostnaden via samfällighetens räkenskaper. Gör ditt det finns det inget för dig att teckna, och risken blir i stället att betala en räkning som aldrig var din.',
    },
    water_well: {
      text: 'Om vattnet kommer från en brunn, ett borrhål eller en tank, be att få se tillståndet för vattenuttag',
      why: 'Uttag av grundvatten godkänns av avrinningsmyndigheten, Confederacion Hidrografica. Antingen följde tillståndet med fastigheten eller så fanns det aldrig, och det går inte att se på pumpen.',
    },
    water_deposit: {
      text: 'Om det finns en tank och leveranser, ta reda på vem som levererar och hur lång väntetiden är i augusti',
      why: 'En tank som tar slut samma vecka som hela kusten fyller på sina är den sortens problem som inte har någon papperslösning.',
    },
    water_meter_access: {
      text: 'Fråga var mätaren sitter och om avläsaren faktiskt kommer åt den',
      why: 'En mätare bakom en låst grind får uppskattade avläsningar. Uppskattningarna rättas till slut, och rättelsen kommer som en enda räkning i stället för flera.',
    },
    water_other_charges: {
      text: 'Fråga ditt ayuntamiento vad mer som faktureras på den här fastigheten',
      why: 'Sophämtningsavgiften, och ibland avloppsavgiften, följer med vattenräkningen eller kommer från samma kontor. Att fråga en gång vid disken är mycket billigare än att få veta det genom ett betalningskrav.',
    },
    gas_mains: {
      text: 'Ta reda på om gatan har stadsgas innan du letar efter en gastaxa',
      why: 'Stadsgas når en minoritet av spanska adresser. I stora delar av landet är det ärliga svaret att det inte finns något att teckna, och då är frågan avklarad.',
    },
    gas_bottles: {
      text: 'Om det går på gasolflaskor, hitta den lokala depån och fråga hur leveranser fungerar när ingen är där',
      why: 'Ett flaskavtal tecknas med en depå, inte med en nationell leverantör. En leverans som kräver att någon öppnar dörren är inte till mycket hjälp för en ägare som är där två gånger om året, och en överenskommelse med grannen är vad de flesta faktiskt landar i.',
    },
    gas_inspection: {
      text: 'Om det finns en gasinstallation, för in den återkommande säkerhetsbesiktningen i kalendern',
      why: 'En gasinstallation måste besiktigas med fasta intervall, på din bekostnad, och besiktningsmannen måste komma in. Det är ett jobb att planera kring ett besök, inte något att överraskas av medan du är i ett annat land.',
    },
    gas_old_install: {
      text: 'Räkna med en besiktning innan en gammal gasinstallation tas i bruk igen',
      why: 'En installation som har stått oanvänd i åratal slås inte bara på igen, och att upptäcka det samma dag som du kommer med familjen är fel dag.',
    },
    gas_combined: {
      text: 'Ta in pris på en kombinerad taxa för gas och el, och sedan på var och en för sig',
      why: 'Kombinerade taxor är vanliga här och ibland verkligen billigare. Ibland är de två medelmåttiga priser i stället för två bra, och det enda sättet att veta är att fråga om båda.',
    },
    net_coverage: {
      text: 'Kontrollera täckningen på den exakta adressen, inte orten',
      why: 'Tillgången till fiber ändras från gata till gata längs kusten och upphör tvärt utanför byarna. Att orten har täckning betyder väldigt lite.',
    },
    net_keep_line: {
      text: 'Behåll en befintlig linje tills den nya fungerar',
      why: 'Säger du upp först står du utan uppkoppling och utan möjlighet att sköta något annat på distans, och en ny installation betyder ett andra teknikerbesök som du måste vara på plats för.',
    },
    net_min_term: {
      text: 'Kontrollera bindningstiden, och vad som händer med routern om du säger upp',
      why: 'Bindningstider är vanliga här och utrustningen ska oftast lämnas tillbaka. Båda är mycket billigare att känna till nu än när du ska avsluta.',
    },
    net_block_fibre: {
      text: 'Fråga administradorn om huset redan har fiber fram till dörren, och vilken väg nya kablar måste ta',
      why: 'Samfälligheter har regler om borrning och kabelkanaler, och en tekniker som struntar i dem blir stoppad av en granne mitt i jobbet.',
    },
    net_no_fibre: {
      text: 'Fråga vad lösningen blir om fibern inte når fram till dig',
      why: 'Fast trådlöst och mobila routrar är det vanliga svaret i inlandet. Utrustningen och avtalet är annorlunda, så det är värt att veta innan du binder dig för något som inte går att installera.',
    },
    council_register: {
      text: 'Registrera ägarbytet för sophämtningsavgiften, tasa de basura',
      why: 'Den debiteras fastigheten enligt kommunens egen kalender, och tills någon meddelar kommunen fortsätter räkningen att gå till den tidigare ägaren. Det gör inte skulden.',
    },
    council_billing: {
      text: 'Fråga hur och hur ofta den faktureras, eftersom det skiljer sig mellan kommuner',
      why: 'Vissa fakturerar den med vattnet, vissa en gång om året för sig, vissa tillsammans med IBI. Det finns inget nationellt svar, bara kommunhusets svar, och det är en fråga på två minuter vid disken.',
    },
    council_dd: {
      text: 'Lägg upp autogiro för den medan du står där',
      why: 'En kommunal avgift som inte betalas går över till indrivning med ett tillägg, och det första du hör om det är ett brev på spanska som kommer till en fastighet där du inte är.',
    },
    council_ibi: {
      text: 'Medan du står vid disken, kontrollera att IBI dras från samma konto',
      why: 'Den kommer från samma kontor, den faktureras en gång om året, och en årlig betalning är precis den sort som en ägare utomlands missar.',
    },
    council_community: {
      text: 'Fråga om samfälligheten sköter sophämtningen för huset',
      why: 'Soptunnorna kan mycket väl vara gemensamma. Avgiften är ändå din, och de två blandas ihop tillräckligt ofta för att det ska vara värt tio sekunder.',
    },
    dd_same_time: {
      text: 'Lägg upp domiciliacion i samma samtal som avtalet',
      why: 'Att lägga till det efteråt är en separat process hos varje leverantör, en i taget, och flera godtar bara instruktionen från dig och inte från en bank.',
    },
    dd_name: {
      text: 'Ange kontohavarens namn exakt som banken har det',
      why: 'Ett medgivande med ett något annorlunda namn är ett medgivande som avvisas, och avvisningen syns som en obetald räkning och inte som ett felmeddelande du har fått.',
    },
    dd_date: {
      text: 'Räkna med att leverantören väljer dragningsdag, inte du',
      why: 'Spanska leverantörer bestämmer sina egna dragningsdagar och har ingen skyldighet att anpassa dem efter din lönedag i ett annat land. Ett konto som fylls på enligt ett schema som passar hemma är ett konto som är tomt den dag de drar.',
    },
    dd_buffer: {
      text: 'Ha en fast buffert på kontot i stället för det exakta beloppet',
      why: 'Räkningarna följer förbrukningen och årstiden. En dragning på några euro mer än du lämnade kvar blir returnerad precis som vilken annan som helst.',
    },
    dd_returned: {
      text: 'Behandla ett returnerat autogiro för el som något brådskande, inte som administration',
      why: 'Ett returnerat autogiro är hur leveransen stängs av medan ägaren är utomlands. Återinkoppling är långsam och kostar, och under tiden är kylskåpet, larmet och avfuktaren avstängda utan att någon är där och märker det.',
    },
    dd_receipts: {
      text: 'Ladda ner och spara betalningskvittot för varje autogiro',
      why: 'Varje kvitto anger det kundnummer leverantören behöver innan de ändrar något. Det är det enda dokument som gör det möjligt att flytta ett autogiro senare, och det är mycket lättare att spara nu än att rekonstruera.',
    },
    dd_change_bank: {
      text: 'Om du någon gång byter bank, räkna med att själv meddela varje leverantör',
      why: 'Här finns ingen automatisk flyttjänst av det slag som vissa länder har. Du meddelar varje leverantör ändringen, vissa godtar den bara från kunden, och tills var och en har bekräftat har ingenting faktiskt flyttats.',
    },
    dd_old_account: {
      text: 'Låt det finnas pengar kvar på det gamla kontot under en hel faktureringsperiod efter en ändring',
      why: 'Om en betalning förfaller kort efter att du begärt ändringen kan leverantören fortfarande dra den från det gamla kontot. Ändringen är verklig först när du har sett en hel period dras från det nya.',
    },
    dd_first_bill: {
      text: 'Kontrollera den första räkningen efter en ändring, både beloppet och kontot',
      why: 'Det är nu ett misstag fortfarande är litet och fortfarande ditt att rätta till.',
    },
    dd_foreign_start: {
      text: 'Börja hos ditt ayuntamiento om du använder ett utländskt IBAN-nummer',
      why: 'Kommunala diskar och vattenkoncessioner är där ett icke-spanskt IBAN-nummer oftast avvisas eller knappas in fel. Ska det gå fel så går det fel där, och det vill du veta innan fyra andra leverantörer förlitar sig på det.',
    },
    on_cycle: {
      text: 'Räkningarna kommer enligt leverantörens cykel, inte din',
      why: 'Varje månad, varannan månad eller varje kvartal, beroende på vem du har avtal med och var fastigheten ligger. Notera vilken, så att en räkning som uteblir är något du märker och inte något du upptäcker.',
    },
    on_standing: {
      text: 'En fast avgift löper oavsett om någon är i fastigheten eller inte',
      why: 'Både el och vatten tar betalt för att vara anslutna. Ett tomt fritidshus har ett golv för sina räkningar, och den avtalade effekten är oftast den enda verkliga spaken du har på det.',
    },
    on_gas_inspection: {
      text: 'Gasinstallationen måste besiktigas regelbundet, på din bekostnad, med någon på plats',
      why: 'Det är inte frivilligt och kräver tillträde, vilket för en ägare utomlands betyder planering snarare än brandkårsutryckning.',
    },
    on_estimates: {
      text: 'Avläsningar uppskattas när ingen kommer åt mätaren',
      why: 'Uppskattningarna rättas till slut, och rättelsen fördelas inte. Den kommer i ett enda stycke.',
    },
    on_refuse: {
      text: 'Sophämtningsavgiften löper så länge du äger fastigheten',
      why: 'Den är knuten till fastigheten, inte till om någon använder den eller om soporna någonsin ställdes ut.',
    },
    on_tariff: {
      text: 'Titta på taxan en gång om året i stället för aldrig',
      why: 'Taxor förlängs i det tysta. En årlig genomgång av den fasta avgiften och den avtalade effekten är oftast där pengarna finns, snarare än i priset per enhet som alla jämför.',
    },
    on_community: {
      text: 'Samfällighetsavgiften är skild från allt detta, och den upphör inte',
      why: 'Skulder till samfälligheten följer fastigheten i Spanien, inte ägaren som drog på sig dem, så de följer huset och de följer med vid en försäljning.',
    },
  },
};
