// The letter to the heirs, in their language. Short and plain: what governs the estate,
// which tax rules they can use, the deadline, and what we need from them.

const W = {
  en: {
    dear: 'Dear {name},', hello: 'Hello,',
    intro: 'I am sorry for your loss. Here is how the Spanish part of the estate works, and what happens next.',
    law_nationality: 'The will chose the law of the deceased’s nationality. That law governs the whole estate, including the property in Spain.',
    law_residence_abroad: 'The law of the country where the deceased lived governs the whole estate, including the property in Spain.',
    law_spanish: 'Spanish law governs the estate. We will confirm which Spanish rules apply before anything is divided.',
    tax_nonres: 'As you do not live in Spain, you can choose between the national rules and the rules of {region} for inheritance tax. We will compare both before filing.',
    tax_nonres_noregion: 'As you do not live in Spain, you can choose between the national rules and one region’s rules for inheritance tax. We will compare both before filing.',
    tax_res: 'As you live in Spain, regional inheritance tax rules apply. We will confirm which region.',
    deadline: 'The inheritance tax return is due within {m} months of the death{d}. An extension can be requested before then.',
    by: ', that is by {d}',
    needs: 'To start, please send us: the death certificate, any wills, and a copy of your passport. We will tell you which ones need an apostille and a translation.',
    nie: 'Each heir who does not already have one needs a Spanish tax identification number (NIE). We can arrange this.',
    close: 'I will keep you informed at every step. Please contact me with any question.',
    note: 'This letter is general guidance, not tax or legal advice on your particular case.',
    regards: 'Kind regards,',
  },
  es: {
    dear: 'Estimado/a {name}:', hello: 'Buenos días:',
    intro: 'Le acompaño en el sentimiento. Le explico cómo funciona la parte española de la herencia y cuáles son los próximos pasos.',
    law_nationality: 'El testamento eligió la ley de la nacionalidad del causante, que rige toda la herencia, incluido el inmueble en España.',
    law_residence_abroad: 'La ley del país donde residía el causante rige toda la herencia, incluido el inmueble en España.',
    law_spanish: 'La herencia se rige por la ley española. Confirmaremos qué normas españolas se aplican antes de repartir nada.',
    tax_nonres: 'Como no reside en España, puede optar entre la normativa estatal y la de {region} en el Impuesto sobre Sucesiones. Compararemos ambas antes de presentar.',
    tax_nonres_noregion: 'Como no reside en España, puede optar entre la normativa estatal y la de una comunidad autónoma en el Impuesto sobre Sucesiones. Compararemos ambas antes de presentar.',
    tax_res: 'Como reside en España, se aplica la normativa autonómica del impuesto. Confirmaremos qué comunidad.',
    deadline: 'La declaración del impuesto debe presentarse en {m} meses desde el fallecimiento{d}. Se puede pedir una prórroga antes de esa fecha.',
    by: ', es decir, hasta el {d}',
    needs: 'Para empezar, envíenos el certificado de defunción, los testamentos que haya y una copia de su pasaporte. Le indicaremos cuáles necesitan apostilla y traducción.',
    nie: 'Cada heredero que aún no lo tenga necesita un número de identidad de extranjero (NIE). Podemos tramitarlo.',
    close: 'Le mantendré informado en cada paso. No dude en consultarme cualquier duda.',
    note: 'Esta carta es una orientación general, no asesoramiento fiscal ni jurídico sobre su caso concreto.',
    regards: 'Un cordial saludo,',
  },
  no: {
    dear: 'Kjære {name},', hello: 'Hei,',
    intro: 'Jeg kondolerer. Her er hvordan den spanske delen av arven fungerer, og hva som skjer videre.',
    law_nationality: 'Testamentet valgte loven i avdødes statsborgerland. Den loven gjelder hele arven, også boligen i Spania.',
    law_residence_abroad: 'Loven i landet der avdøde bodde, gjelder hele arven, også boligen i Spania.',
    law_spanish: 'Spansk lov gjelder arven. Vi bekrefter hvilke spanske regler som gjelder før noe fordeles.',
    tax_nonres: 'Siden du ikke bor i Spania, kan du velge mellom de nasjonale reglene og reglene i {region} for arveavgiften. Vi sammenligner begge før innlevering.',
    tax_nonres_noregion: 'Siden du ikke bor i Spania, kan du velge mellom de nasjonale reglene og én regions regler for arveavgiften. Vi sammenligner begge før innlevering.',
    tax_res: 'Siden du bor i Spania, gjelder regionale regler for arveavgiften. Vi bekrefter hvilken region.',
    deadline: 'Arveavgiften skal meldes innen {m} måneder etter dødsfallet{d}. Det kan søkes om forlengelse før fristen går ut.',
    by: ', det vil si innen {d}',
    needs: 'For å komme i gang, send oss dødsattesten, eventuelle testamenter og en kopi av passet ditt. Vi sier fra hvilke som trenger apostille og oversettelse.',
    nie: 'Hver arving som ikke allerede har det, trenger et spansk identifikasjonsnummer for utlendinger (NIE). Vi kan ordne det.',
    close: 'Jeg holder deg oppdatert underveis. Ta gjerne kontakt med spørsmål.',
    note: 'Dette brevet er generell veiledning, ikke skatterådgivning eller juridisk rådgivning i din konkrete sak.',
    regards: 'Med vennlig hilsen',
  },
  sv: {
    dear: 'Hej {name},', hello: 'Hej,',
    intro: 'Jag beklagar sorgen. Här är hur den spanska delen av arvet fungerar och vad som händer härnäst.',
    law_nationality: 'Testamentet valde lagen i den avlidnes medborgarskapsland. Den lagen gäller hela arvet, även bostaden i Spanien.',
    law_residence_abroad: 'Lagen i det land där den avlidne bodde gäller hela arvet, även bostaden i Spanien.',
    law_spanish: 'Spansk lag gäller arvet. Vi bekräftar vilka spanska regler som gäller innan något fördelas.',
    tax_nonres: 'Eftersom du inte bor i Spanien kan du välja mellan de nationella reglerna och reglerna i {region} för arvsskatten. Vi jämför båda innan vi deklarerar.',
    tax_nonres_noregion: 'Eftersom du inte bor i Spanien kan du välja mellan de nationella reglerna och en regions regler för arvsskatten. Vi jämför båda innan vi deklarerar.',
    tax_res: 'Eftersom du bor i Spanien gäller regionala regler för arvsskatten. Vi bekräftar vilken region.',
    deadline: 'Arvsskatten ska deklareras inom {m} månader från dödsfallet{d}. Anstånd kan begäras innan dess.',
    by: ', alltså senast {d}',
    needs: 'Skicka oss till att börja med dödsbeviset, eventuella testamenten och en kopia av ditt pass. Vi talar om vilka som behöver apostille och översättning.',
    nie: 'Varje arvinge som inte redan har ett behöver ett spanskt identitetsnummer för utlänningar (NIE). Vi kan ordna det.',
    close: 'Jag håller dig informerad i varje steg. Hör gärna av dig med frågor.',
    note: 'Det här brevet är allmän vägledning, inte skatterådgivning eller juridisk rådgivning i ditt enskilda fall.',
    regards: 'Med vänliga hälsningar',
  },
  de: {
    dear: 'Sehr geehrte/r {name},', hello: 'Guten Tag,',
    intro: 'Mein aufrichtiges Beileid. Hier erkläre ich, wie der spanische Teil des Nachlasses abläuft und was als Nächstes geschieht.',
    law_nationality: 'Das Testament hat das Recht der Staatsangehörigkeit des Erblassers gewählt. Dieses Recht gilt für den gesamten Nachlass, auch für die Immobilie in Spanien.',
    law_residence_abroad: 'Das Recht des Landes, in dem der Erblasser lebte, gilt für den gesamten Nachlass, auch für die Immobilie in Spanien.',
    law_spanish: 'Für den Nachlass gilt spanisches Recht. Wir klären, welche spanischen Regeln gelten, bevor etwas aufgeteilt wird.',
    tax_nonres: 'Da Sie nicht in Spanien leben, können Sie bei der Erbschaftsteuer zwischen den staatlichen Regeln und den Regeln von {region} wählen. Wir vergleichen beides vor der Abgabe.',
    tax_nonres_noregion: 'Da Sie nicht in Spanien leben, können Sie bei der Erbschaftsteuer zwischen den staatlichen Regeln und denen einer Region wählen. Wir vergleichen beides vor der Abgabe.',
    tax_res: 'Da Sie in Spanien leben, gelten regionale Regeln für die Erbschaftsteuer. Wir klären, welche Region.',
    deadline: 'Die Erbschaftsteuererklärung ist innerhalb von {m} Monaten nach dem Todesfall fällig{d}. Vorher kann eine Verlängerung beantragt werden.',
    by: ', also bis zum {d}',
    needs: 'Bitte senden Sie uns zunächst die Sterbeurkunde, alle Testamente und eine Kopie Ihres Reisepasses. Wir sagen Ihnen, was eine Apostille und eine Übersetzung braucht.',
    nie: 'Jeder Erbe, der noch keine hat, benötigt eine spanische Ausländeridentifikationsnummer (NIE). Wir können das übernehmen.',
    close: 'Ich halte Sie bei jedem Schritt auf dem Laufenden. Bei Fragen melden Sie sich gern.',
    note: 'Dieses Schreiben ist eine allgemeine Orientierung, keine Steuer- oder Rechtsberatung zu Ihrem Einzelfall.',
    regards: 'Mit freundlichen Grüßen',
  },
  fr: {
    dear: 'Bonjour {name},', hello: 'Bonjour,',
    intro: 'Je vous présente mes sincères condoléances. Voici comment se déroule la partie espagnole de la succession et ce qui va suivre.',
    law_nationality: 'Le testament a choisi la loi de la nationalité du défunt. Cette loi régit toute la succession, y compris le bien en Espagne.',
    law_residence_abroad: 'La loi du pays où vivait le défunt régit toute la succession, y compris le bien en Espagne.',
    law_spanish: 'La succession est régie par la loi espagnole. Nous confirmerons quelles règles espagnoles s’appliquent avant tout partage.',
    tax_nonres: 'Comme vous ne résidez pas en Espagne, vous pouvez choisir entre les règles nationales et celles de {region} pour les droits de succession. Nous comparerons les deux avant la déclaration.',
    tax_nonres_noregion: 'Comme vous ne résidez pas en Espagne, vous pouvez choisir entre les règles nationales et celles d’une région pour les droits de succession. Nous comparerons les deux avant la déclaration.',
    tax_res: 'Comme vous résidez en Espagne, les règles régionales s’appliquent. Nous confirmerons quelle région.',
    deadline: 'La déclaration de succession doit être déposée dans les {m} mois suivant le décès{d}. Une prolongation peut être demandée avant cette date.',
    by: ', soit au plus tard le {d}',
    needs: 'Pour commencer, merci de nous envoyer l’acte de décès, les testaments éventuels et une copie de votre passeport. Nous vous dirons lesquels doivent être apostillés et traduits.',
    nie: 'Chaque héritier qui n’en a pas encore a besoin d’un numéro d’identification d’étranger (NIE). Nous pouvons nous en charger.',
    close: 'Je vous tiendrai informé à chaque étape. N’hésitez pas à me contacter pour toute question.',
    note: 'Cette lettre est une information générale, pas un conseil fiscal ou juridique sur votre situation.',
    regards: 'Bien cordialement,',
  },
  nl: {
    dear: 'Beste {name},', hello: 'Goedendag,',
    intro: 'Gecondoleerd met uw verlies. Hier leest u hoe het Spaanse deel van de nalatenschap verloopt en wat er nu gebeurt.',
    law_nationality: 'Het testament koos het recht van de nationaliteit van de overledene. Dat recht geldt voor de hele nalatenschap, ook voor de woning in Spanje.',
    law_residence_abroad: 'Het recht van het land waar de overledene woonde, geldt voor de hele nalatenschap, ook voor de woning in Spanje.',
    law_spanish: 'Op de nalatenschap is Spaans recht van toepassing. We bevestigen welke Spaanse regels gelden voordat er iets wordt verdeeld.',
    tax_nonres: 'Omdat u niet in Spanje woont, kunt u voor de erfbelasting kiezen tussen de landelijke regels en die van {region}. We vergelijken beide voordat we aangifte doen.',
    tax_nonres_noregion: 'Omdat u niet in Spanje woont, kunt u voor de erfbelasting kiezen tussen de landelijke regels en die van een regio. We vergelijken beide voordat we aangifte doen.',
    tax_res: 'Omdat u in Spanje woont, gelden regionale regels voor de erfbelasting. We bevestigen welke regio.',
    deadline: 'De aangifte erfbelasting moet binnen {m} maanden na het overlijden worden gedaan{d}. Vooraf kan uitstel worden gevraagd.',
    by: ', dus uiterlijk {d}',
    needs: 'Stuur ons om te beginnen de overlijdensakte, eventuele testamenten en een kopie van uw paspoort. We laten weten welke een apostille en een vertaling nodig hebben.',
    nie: 'Elke erfgenaam die er nog geen heeft, heeft een Spaans identificatienummer voor buitenlanders (NIE) nodig. Dat kunnen wij regelen.',
    close: 'Ik houd u bij elke stap op de hoogte. Neem gerust contact op met vragen.',
    note: 'Deze brief is algemene informatie, geen fiscaal of juridisch advies over uw situatie.',
    regards: 'Met vriendelijke groet,',
  },
};

export const LETTER_KEYS = Object.keys(W.en);

function fill(s, v) {
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : ''));
}

export function buildHeirLetter(a, R, road, lang, fmtDate, regionLabel) {
  const w = W[lang] || W.en;
  const name = (a.clientName || '').trim();
  const p = [w.intro, w[`law_${road.law}`]];
  if (road.tax === 'resident_heirs') p.push(w.tax_res);
  else {
    const key = road.tax === 'nonres_heirs_resident_deceased' ? a.deceasedRegion : a.assetsRegion;
    p.push(key ? fill(w.tax_nonres, { region: regionLabel(key) }) : w.tax_nonres_noregion);
  }
  p.push(fill(w.deadline, { m: R.isdMonths, d: road.dates ? fill(w.by, { d: fmtDate(road.dates.isdDue) }) : '' }));
  p.push(w.needs);
  if (a.heirs !== 'spain') p.push(w.nie);
  p.push(w.close);
  return { greeting: name ? fill(w.dear, { name }) : w.hello, paragraphs: p, note: w.note, regards: w.regards };
}

export const HEIR_LETTER = W;
