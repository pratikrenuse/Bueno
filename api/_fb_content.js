// The posts Pratik writes under his own name in Facebook groups, and their translations.
//
// WHAT THIS IS, AND WHAT IT IS EMPHATICALLY NOT
// This is a personal surface. Pratik reviews and approves; Himanshu publishes. It has nothing
// to do with api/_lk_*.js, with linkedin_posts, or with the team deck at /internal-linkedin.
// Those are reviewed by John and go out over the team's names. Nothing in this file may be
// copied there and nothing from there may be copied here.
//
// HOW THESE ARE WRITTEN, AND WHY THEY READ THE WAY THEY DO
// The first version of this file was correct and unreadable. Every post opened with its own
// thesis and stayed there, so twenty of them sounded like twenty pages of the same reference
// note. Nobody talks like that in a Facebook group, and nobody stops scrolling for it.
//
// These open on a moment instead. Something that happened, something people keep asking,
// something that took a while to work out. The fact arrives inside the telling rather than
// as a heading. Sentences are short and uneven, contractions are used the way people use
// them, and the tool gets mentioned the way you would mention it to someone in a pub, not
// the way a landing page mentions itself.
//
// WHAT DOES NOT BEND FOR THE SAKE OF VOICE
//   - Every figure traces to a verified rule in ../rules. The `rules` array names the ids.
//     Warmth is a matter of how a fact is said, never of which facts are allowed.
//   - The first person is a builder, never an owner. Pratik does not own property in Spain,
//     so no post says or implies that he does. What he can honestly say is that this gets
//     asked in these groups constantly, that he read the official page, and that he built
//     something. He never invents a private conversation or a villa.
//   - No brand name. These go into groups whose rules bar promotion.
//   - No emoji, no em dash, no competitor named, no penalty-flavoured urgency.
//
// {link} is substituted at seed time with the localised tool URL, so a translated post can
// never end up pointing at the English page.

export const SITE = 'https://www.247spain.es';
export const LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
export const TRANSLATION_LANGS = LANGS.filter(l => l !== 'en');
export const LANG_NAME = {
  en: 'English', no: 'Norwegian', sv: 'Swedish',
  de: 'German', fr: 'French', nl: 'Dutch',
};

export function linkFor(tool, lang) {
  return lang === 'en' ? `${SITE}/${tool}` : `${SITE}/${lang}/${tool}`;
}

export function renderPost(idea, lang) {
  const body = idea.text[lang];
  if (!body) return null;
  return body.replace(/\{link\}/g, linkFor(idea.tool, lang)).trim();
}

export const IDEAS = [
{
  key: 'ninety-days',
  tool: 'day-counter',
  kind: 'story',
  rules: ['schengen.short_stay', 'schengen.entry_exit_days'],
  text: {
    en: `Every few weeks someone in a group like this asks the same question, and it always gets about four different answers.

Is it 90 days a year, or 90 days in 180?

It's 90 in any rolling 180. Not per calendar year. And here's the bit that catches people: the day you land counts as a whole day, and so does the day you fly home. So a long weekend isn't two days. It's four.

The rolling part is the sneaky one. You can be nowhere near your limit in March and over it in May without booking a single extra trip, because last October is still sitting inside the window, quietly counting against you.

I got fed up working it out on the back of an envelope, so I built a counter. You put in the trips you've taken and the ones you've already booked, and it tells you what's left, the date the window clears, and the exact day a planned trip would tip you over.

{link}

Free, nothing to sign up for. And if it argues with your own count, tell me. I'd much rather fix it than have you trust it.`,
    no: `Med noen ukers mellomrom spør noen i en gruppe som denne om det samme, og det kommer alltid fire ulike svar.

Er det 90 dager i året, eller 90 dager av 180?

Det er 90 innenfor enhver rullerende 180-dagersperiode. Ikke per kalenderår. Og her er det folk går på: dagen du lander teller som en hel dag, og det gjør dagen du flyr hjem også. En lang helg er altså ikke to dager. Det er fire.

Det rullerende er det lumske. Du kan ligge langt under grensen i mars og over den i mai uten å ha bestilt en eneste ekstra tur, fordi oktober i fjor fortsatt ligger inne i vinduet og teller i det stille.

Jeg ble lei av å regne på baksiden av en konvolutt, så jeg bygde en teller. Du legger inn turene du har tatt og de du allerede har bestilt, og den sier hva du har igjen, datoen vinduet friskner opp, og nøyaktig hvilken dag en planlagt tur ville tippet deg over.

{link}

Gratis, ingenting å registrere seg for. Og er den uenig med din egen telling, si fra. Jeg fikser den heller enn at du skal stole blindt på den.`,
    sv: `Med några veckors mellanrum ställer någon i en grupp som den här samma fråga, och det kommer alltid ungefär fyra olika svar.

Är det 90 dagar om året, eller 90 dagar av 180?

Det är 90 inom varje rullande 180-dagarsperiod. Inte per kalenderår. Och här är det folk går bet: dagen du landar räknas som en hel dag, och det gör dagen du flyger hem också. En långhelg är alltså inte två dagar. Det är fyra.

Det rullande är det lömska. Du kan ligga långt under gränsen i mars och över den i maj utan att ha bokat en enda extra resa, för oktober i fjol ligger fortfarande kvar i fönstret och räknas i tysthet.

Jag tröttnade på att räkna på baksidan av ett kuvert, så jag byggde en räknare. Du lägger in resorna du gjort och de du redan bokat, och den säger vad du har kvar, datumet då fönstret förnyas, och exakt vilken dag en planerad resa skulle tippa över.

{link}

Gratis, inget att registrera sig för. Och om den säger emot din egen räkning, hör av dig. Jag fixar hellre den än att du litar blint på den.`,
    de: `Alle paar Wochen stellt jemand in einer Gruppe wie dieser dieselbe Frage, und es kommen immer etwa vier verschiedene Antworten.

Sind es 90 Tage im Jahr oder 90 Tage in 180?

Es sind 90 in jedem rollierenden Zeitraum von 180 Tagen. Nicht pro Kalenderjahr. Und hier stolpern die Leute: der Tag der Ankunft zählt als ganzer Tag, und der Tag des Rückflugs auch. Ein langes Wochenende sind also keine zwei Tage. Es sind vier.

Das Rollierende ist das Tückische. Sie können im März weit unter der Grenze liegen und im Mai darüber, ohne eine einzige zusätzliche Reise gebucht zu haben, weil der letzte Oktober noch im Fenster steckt und leise mitzählt.

Ich hatte es satt, das auf einem Briefumschlag auszurechnen, also habe ich einen Zähler gebaut. Sie tragen die Reisen ein, die Sie gemacht und die Sie schon gebucht haben, und er sagt Ihnen, was übrig ist, wann sich das Fenster erneuert, und genau den Tag, an dem eine geplante Reise zu viel wäre.

{link}

Kostenlos, nichts anzumelden. Und wenn er Ihrer eigenen Rechnung widerspricht, sagen Sie mir Bescheid. Mir ist lieber, ich repariere ihn, als dass Sie ihm blind vertrauen.`,
    fr: `Toutes les deux ou trois semaines, quelqu'un dans un groupe comme celui-ci pose la même question, et il arrive toujours quatre réponses différentes.

C'est 90 jours par an, ou 90 jours sur 180 ?

C'est 90 sur toute période glissante de 180 jours. Pas par année civile. Et voilà où les gens se font avoir : le jour de l'arrivée compte comme une journée entière, et le jour du retour aussi. Un long week-end, ce n'est donc pas deux jours. C'est quatre.

Le glissant, c'est le piège. Vous pouvez être loin de la limite en mars et au-dessus en mai sans avoir réservé un seul voyage de plus, parce qu'octobre dernier est encore dans la fenêtre et compte en silence.

J'en ai eu assez de calculer au dos d'une enveloppe, alors j'ai fait un compteur. Vous entrez les voyages faits et ceux déjà réservés, et il vous dit ce qu'il reste, la date où la fenêtre se renouvelle, et le jour exact où un voyage prévu vous ferait dépasser.

{link}

Gratuit, rien à créer. Et s'il contredit votre propre calcul, dites-le-moi. Je préfère le corriger que vous le voir croire sur parole.`,
    nl: `Om de paar weken stelt iemand in een groep als deze dezelfde vraag, en er komen altijd een stuk of vier verschillende antwoorden.

Is het 90 dagen per jaar, of 90 dagen van 180?

Het is 90 binnen elke voortschrijdende periode van 180 dagen. Niet per kalenderjaar. En hier gaan mensen de mist in: de dag dat u landt telt als hele dag, en de dag dat u terugvliegt ook. Een lang weekend is dus geen twee dagen. Het zijn er vier.

Het voortschrijdende is het gemene. U kunt in maart ver onder de grens zitten en in mei eroverheen zonder ook maar één extra reis te hebben geboekt, want afgelopen oktober zit nog in het venster en telt stilletjes mee.

Ik werd het zat om het op de achterkant van een envelop uit te rekenen, dus bouwde ik een teller. U vult de reizen in die u heeft gemaakt en die u al heeft geboekt, en hij zegt wat er over is, wanneer het venster ververst, en precies de dag waarop een geplande reis eroverheen zou gaan.

{link}

Gratis, niets om aan te melden. En spreekt hij uw eigen telling tegen, laat het me weten. Ik repareer hem liever dan dat u er blind op vertrouwt.`,
  },
},
{
  key: 'imputed-income-empty-home',
  tool: 'tax-calculator',
  kind: 'informative',
  rules: ['irnr.imputed.base', 'irnr.imputed.no_deductions', 'irnr.rates'],
  text: {
    en: `This is the one that makes people put their coffee down.

You can owe Spanish tax on a place you never rent out, never advertise, and use for three weeks a year. It's called imputed income. Spain treats a second home that's sitting there at your disposal as if it produced an income, and then taxes that imaginary income.

Two things about it that nobody tells you until it's too late.

The base isn't what you paid, and it isn't what the place is worth now. It's the cadastral value, the number printed on your IBI bill. Go and look at it, because it's usually nothing like either of the other two.

And nothing comes off it. Not the community fee, not the insurance, not even the IBI itself. If you're used to deducting your costs at home, that one stings.

The rate is 19 percent if you live in the EU, Norway, Iceland or Liechtenstein. 24 percent for everyone else.

I put the whole thing on a page, including the years you might quietly not have filed:

{link}`,
    no: `Dette er den som får folk til å sette fra seg kaffekoppen.

Du kan skylde spansk skatt på en bolig du aldri leier ut, aldri annonserer, og bruker tre uker i året. Det heter imputert inntekt. Spania behandler en sekundærbolig som står der til din disposisjon som om den ga en inntekt, og skattlegger så den innbilte inntekten.

To ting om den som ingen forteller deg før det er for sent.

Grunnlaget er ikke det du betalte, og det er ikke det boligen er verdt nå. Det er matrikkelverdien, tallet som står trykt på IBI-regningen. Gå og se på det, for det ligner som regel ikke på noen av de to andre.

Og ingenting trekkes fra. Ikke fellesutgiftene, ikke forsikringen, ikke engang IBI selv. Er du vant til å føre kostnadene dine hjemme, svir den.

Satsen er 19 prosent hvis du bor i EU, Norge, Island eller Liechtenstein. 24 prosent for alle andre.

Jeg la hele greia på en side, inkludert årene du kanskje stille har unnlatt å levere for:

{link}`,
    sv: `Det här är den som får folk att ställa ifrån sig kaffekoppen.

Du kan vara skyldig spansk skatt på en bostad du aldrig hyr ut, aldrig annonserar och använder tre veckor om året. Det kallas schablonintäkt. Spanien behandlar en andrabostad som står där till ditt förfogande som om den gav en inkomst, och beskattar sedan den inbillade inkomsten.

Två saker som ingen berättar förrän det är för sent.

Underlaget är inte vad du betalade, och inte vad bostaden är värd i dag. Det är taxeringsvärdet, siffran som står tryckt på IBI-avin. Gå och titta på den, för den brukar inte likna någon av de två andra.

Och ingenting dras av. Inte samfällighetsavgiften, inte försäkringen, inte ens IBI självt. Är du van att dra av dina kostnader hemma så svider den.

Skattesatsen är 19 procent om du bor i EU, Norge, Island eller Liechtenstein. 24 procent för alla andra.

Jag lade hela saken på en sida, inklusive de år du kanske tyst har låtit bli att deklarera:

{link}`,
    de: `Das ist die, bei der die Leute die Kaffeetasse abstellen.

Sie können spanische Steuer auf eine Immobilie schulden, die Sie nie vermieten, nie inserieren und drei Wochen im Jahr nutzen. Das heißt fiktive Einkünfte. Spanien behandelt eine Zweitwohnung, die Ihnen einfach zur Verfügung steht, so, als brächte sie einen Ertrag, und besteuert dann diesen eingebildeten Ertrag.

Zwei Dinge dazu, die einem niemand sagt, bis es zu spät ist.

Die Grundlage ist nicht der Kaufpreis, und auch nicht der heutige Wert. Es ist der Katasterwert, die Zahl, die auf Ihrem IBI-Bescheid steht. Schauen Sie sie sich an, denn sie ähnelt meist keiner der beiden anderen.

Und es geht nichts ab. Nicht das Hausgeld, nicht die Versicherung, nicht einmal die IBI selbst. Wenn Sie es gewohnt sind, Ihre Kosten zu Hause abzusetzen, tut das weh.

Der Satz liegt bei 19 Prozent, wenn Sie in der EU, Norwegen, Island oder Liechtenstein leben. 24 Prozent für alle anderen.

Ich habe das Ganze auf eine Seite gelegt, samt der Jahre, die Sie vielleicht still und leise nicht erklärt haben:

{link}`,
    fr: `C'est celle qui fait poser la tasse de café.

Vous pouvez devoir de l'impôt espagnol sur un bien que vous ne louez jamais, que vous n'annoncez nulle part et que vous occupez trois semaines par an. Cela s'appelle le revenu imputé. L'Espagne considère qu'une résidence secondaire qui reste là, à votre disposition, produit un revenu, puis impose ce revenu imaginaire.

Deux choses que personne ne vous dit avant qu'il soit trop tard.

La base, ce n'est pas ce que vous avez payé, et ce n'est pas ce que le bien vaut aujourd'hui. C'est la valeur cadastrale, le chiffre imprimé sur votre avis d'IBI. Allez le regarder, parce qu'il ne ressemble en général à aucun des deux autres.

Et rien ne s'en déduit. Ni les charges, ni l'assurance, ni même l'IBI. Si vous avez l'habitude de déduire vos frais chez vous, celle-là pique.

Le taux est de 19 pour cent si vous vivez dans l'UE, en Norvège, en Islande ou au Liechtenstein. 24 pour cent pour tous les autres.

J'ai mis tout ça sur une page, y compris les années que vous n'avez peut-être jamais déclarées :

{link}`,
    nl: `Dit is degene waarbij mensen hun kopje neerzetten.

U kunt Spaanse belasting verschuldigd zijn over een woning die u nooit verhuurt, nooit adverteert en drie weken per jaar gebruikt. Het heet fictief inkomen. Spanje behandelt een tweede woning die daar gewoon tot uw beschikking staat alsof die inkomen oplevert, en belast dan dat ingebeelde inkomen.

Twee dingen die niemand u vertelt tot het te laat is.

De grondslag is niet wat u betaalde, en niet wat de woning nu waard is. Het is de kadastrale waarde, het getal dat op uw IBI-aanslag staat. Ga er eens naar kijken, want het lijkt meestal op geen van beide andere.

En er gaat niets af. Niet de VvE-bijdrage, niet de verzekering, zelfs de IBI niet. Bent u gewend uw kosten thuis af te trekken, dan doet die pijn.

Het tarief is 19 procent als u in de EU, Noorwegen, IJsland of Liechtenstein woont. 24 procent voor alle anderen.

Ik heb het hele verhaal op een pagina gezet, inclusief de jaren die u misschien stilletjes niet heeft aangegeven:

{link}`,
  },
},
{
  key: 'quarterly-rental-filing-ends',
  tool: 'rental-tax',
  kind: 'informative',
  rules: ['deadline.rental.last_quarterly', 'deadline.rental.from_2026'],
  text: {
    en: `If you let a place in Spain, the rhythm you've got used to is about to change, and it's the kind of change that catches people precisely because they're organised.

Four filings a year, every year, and then suddenly not.

Q3 2026 is the last quarterly rental return. It's due between 1 and 20 October 2026. After that, rental income from 1 October onwards doesn't get its own quarter. It rolls into one annual return, filed in the first 20 days of April the following year.

So the next thing you file after this October isn't in January. It's April 2027, and it covers the last quarter of 2026.

Put it in the calendar now, while you're thinking about it. Habits are the easiest thing in the world to keep doing after they've stopped being right.

The page I built works out what's actually owed on rental income once you've taken the deductions you're entitled to, which is usually more than people claim:

{link}`,
    no: `Leier du ut en bolig i Spania, er rytmen du har vent deg til i ferd med å endre seg, og det er den typen endring som tar folk nettopp fordi de er ryddige.

Fire leveringer i året, hvert år, og så plutselig ikke.

Q3 2026 er den siste kvartalsvise leieoppgaven. Den skal leveres mellom 1. og 20. oktober 2026. Etter det får ikke leieinntekt fra 1. oktober og utover sitt eget kvartal. Den går inn i én årlig oppgave, levert i de første 20 dagene i april året etter.

Det neste du leverer etter oktober i år er altså ikke i januar. Det er april 2027, og det dekker siste kvartal 2026.

Legg det i kalenderen nå, mens du tenker på det. Vaner er det letteste i verden å fortsette med etter at de har sluttet å stemme.

Siden jeg laget regner ut hva som faktisk skal betales på leieinntekt når du har tatt de fradragene du har rett på, som regel flere enn folk fører:

{link}`,
    sv: `Hyr du ut en bostad i Spanien håller rytmen du vant dig vid på att ändras, och det är den sortens ändring som tar folk just för att de är ordningsamma.

Fyra deklarationer om året, varje år, och så plötsligt inte.

Q3 2026 är den sista kvartalsvisa hyresdeklarationen. Den ska in mellan 1 och 20 oktober 2026. Därefter får hyresinkomst från 1 oktober och framåt inget eget kvartal. Den går in i en enda årlig deklaration, inlämnad under de första 20 dagarna i april året därpå.

Nästa gång du deklarerar efter den här oktober är alltså inte i januari. Det är april 2027, och den täcker sista kvartalet 2026.

Lägg in det i kalendern nu, medan du tänker på det. Vanor är det lättaste i världen att fortsätta med sedan de slutat stämma.

Sidan jag byggde räknar ut vad som faktiskt ska betalas på hyresinkomst när du tagit de avdrag du har rätt till, oftast fler än folk tar upp:

{link}`,
    de: `Wenn Sie in Spanien vermieten, ändert sich gleich der Rhythmus, an den Sie sich gewöhnt haben, und es ist die Art Änderung, die gerade die Ordentlichen erwischt.

Vier Erklärungen im Jahr, jedes Jahr, und dann plötzlich nicht mehr.

Q3 2026 ist die letzte vierteljährliche Mieterklärung. Sie ist zwischen dem 1. und dem 20. Oktober 2026 fällig. Danach bekommen Mieteinkünfte ab dem 1. Oktober kein eigenes Quartal mehr. Sie gehen in eine einzige Jahreserklärung ein, abzugeben in den ersten 20 Tagen des April im Folgejahr.

Das Nächste, was Sie nach diesem Oktober abgeben, ist also nicht im Januar. Es ist der April 2027, und er betrifft das letzte Quartal 2026.

Schreiben Sie es sich jetzt in den Kalender, solange Sie daran denken. Gewohnheiten sind das Einfachste der Welt, um sie beizubehalten, nachdem sie aufgehört haben zu stimmen.

Die Seite, die ich gebaut habe, rechnet aus, was auf Mieteinkünfte wirklich zu zahlen ist, wenn Sie die Abzüge genommen haben, die Ihnen zustehen, meist mehr als angesetzt werden:

{link}`,
    fr: `Si vous louez un bien en Espagne, le rythme auquel vous vous êtes habitué va changer, et c'est le genre de changement qui piège surtout les gens organisés.

Quatre déclarations par an, tous les ans, et puis d'un coup non.

Le troisième trimestre 2026 est la dernière déclaration locative trimestrielle. Elle est à déposer entre le 1er et le 20 octobre 2026. Ensuite, les revenus locatifs à partir du 1er octobre n'ont plus leur propre trimestre. Ils entrent dans une seule déclaration annuelle, déposée dans les 20 premiers jours d'avril de l'année suivante.

La prochaine échéance après cet octobre n'est donc pas en janvier. C'est avril 2027, et elle couvre le dernier trimestre 2026.

Mettez-le dans l'agenda maintenant, pendant que vous y pensez. Les habitudes sont la chose la plus facile au monde à poursuivre une fois qu'elles ont cessé d'être justes.

La page que j'ai faite calcule ce qui est réellement dû sur les revenus locatifs une fois prises les déductions auxquelles vous avez droit, en général plus que ce que les gens déclarent :

{link}`,
    nl: `Verhuurt u een woning in Spanje, dan verandert het ritme waaraan u gewend bent, en het is het soort verandering dat juist de georganiseerde mensen te pakken neemt.

Vier aangiftes per jaar, elk jaar, en dan ineens niet meer.

Q3 2026 is de laatste kwartaalaangifte voor huurinkomsten. Die moet tussen 1 en 20 oktober 2026 binnen zijn. Daarna krijgen huurinkomsten vanaf 1 oktober geen eigen kwartaal meer. Ze gaan op in één jaarlijkse aangifte, in te dienen in de eerste 20 dagen van april van het jaar daarna.

Het eerstvolgende dat u na deze oktober indient is dus niet in januari. Het is april 2027, en het betreft het laatste kwartaal van 2026.

Zet het nu in de agenda, nu u eraan denkt. Gewoontes zijn het makkelijkste ter wereld om vol te houden nadat ze zijn opgehouden te kloppen.

De pagina die ik maakte rekent uit wat er werkelijk over huurinkomsten verschuldigd is nadat u de aftrekposten heeft genomen waar u recht op heeft, meestal meer dan mensen opvoeren:

{link}`,
  },
},
{
  key: 'late-filing-two-regimes',
  tool: 'late-surcharge',
  kind: 'informative',
  rules: ['late.recargo.voluntary', 'late.recargo.excludes_penalty', 'late.recargo.reduction'],
  text: {
    en: `If a modelo 210 is late, there's one question worth answering before anything else, and it isn't how much.

It's whether the tax office has written to you yet.

Those two situations aren't a bit different from each other. They're two different regimes, and the gap between them is enormous.

File late on your own, before any letter arrives, and it's a surcharge. One percent, plus another one percent for every full month you're late, up to twelve. From month thirteen it becomes a flat fifteen percent plus interest. And here's the part almost nobody knows: that surcharge replaces the penalty you could otherwise have been given. There's also a twenty five percent reduction on it if you pay inside the voluntary window once they notify you.

Once a demand has landed, none of that is on the table any more. You're somewhere else entirely.

So if you're sitting on an unfiled year, the useful thing is to check the post, not the calculator.

Then the page asks you which of the two you're in, works out the figure, and shows you the date your clock actually started from:

{link}`,
    no: `Er en modelo 210 levert for sent, er det ett spørsmål som er verdt å svare på før alt annet, og det er ikke hvor mye.

Det er om skattekontoret har skrevet til deg ennå.

De to situasjonene er ikke litt forskjellige fra hverandre. De er to ulike regelsett, og avstanden mellom dem er enorm.

Leverer du for sent av deg selv, før noe brev kommer, er det et tillegg. Én prosent, pluss én prosent til for hver hele måned du er forsinket, opp til tolv. Fra måned tretten blir det flate femten prosent pluss renter. Og her er delen nesten ingen kjenner: det tillegget erstatter boten du ellers kunne fått. Det finnes også en reduksjon på tjuefem prosent av det hvis du betaler innenfor den frivillige fristen etter varselet.

Har kravet først landet, er ingenting av dette på bordet lenger. Da er du et helt annet sted.

Sitter du på et år du ikke har levert for, er det altså posten som er verdt å sjekke, ikke kalkulatoren.

Så spør siden hvilken av de to du er i, regner ut beløpet, og viser datoen klokken din faktisk begynte å løpe fra:

{link}`,
    sv: `Är en modelo 210 försenad finns det en fråga värd att besvara före allt annat, och det är inte hur mycket.

Det är om skattemyndigheten har skrivit till dig än.

De två situationerna är inte lite olika varandra. De är två skilda regelverk, och avståndet mellan dem är enormt.

Deklarerar du sent på eget bevåg, innan något brev kommer, är det ett tillägg. En procent, plus ytterligare en procent för varje hel månad du är sen, upp till tolv. Från månad tretton blir det platta femton procent plus ränta. Och här är den del nästan ingen känner till: det tillägget ersätter den sanktionsavgift du annars kunde ha fått. Det finns också en nedsättning på tjugofem procent av det om du betalar inom den frivilliga fristen efter underrättelsen.

Har kravet väl landat är inget av det här kvar på bordet. Då är du någon helt annanstans.

Sitter du på ett år du inte deklarerat är det alltså posten som är värd att kolla, inte kalkylatorn.

Sedan frågar sidan vilken av de två du befinner dig i, räknar ut beloppet, och visar datumet din klocka faktiskt började löpa från:

{link}`,
    de: `Ist eine modelo 210 verspätet, gibt es eine Frage, die sich vor allem anderen lohnt, und es ist nicht die nach der Höhe.

Es ist die, ob das Finanzamt Ihnen schon geschrieben hat.

Diese beiden Lagen sind nicht ein bisschen verschieden. Es sind zwei verschiedene Regime, und der Abstand dazwischen ist gewaltig.

Geben Sie von sich aus verspätet ab, bevor ein Brief kommt, ist es ein Zuschlag. Ein Prozent, plus ein weiteres Prozent für jeden vollen Monat Verspätung, bis zu zwölf. Ab Monat dreizehn sind es pauschal fünfzehn Prozent plus Zinsen. Und hier der Teil, den fast niemand kennt: dieser Zuschlag tritt an die Stelle der Sanktion, die Sie sonst bekommen hätten. Es gibt außerdem eine Minderung um fünfundzwanzig Prozent, wenn Sie nach der Mitteilung innerhalb der freiwilligen Frist zahlen.

Ist die Aufforderung einmal da, liegt nichts davon mehr auf dem Tisch. Dann sind Sie an einem ganz anderen Ort.

Wenn Sie also auf einem nicht erklärten Jahr sitzen, lohnt sich der Blick in die Post, nicht in den Rechner.

Dann fragt die Seite, in welcher der beiden Lagen Sie sind, rechnet den Betrag aus und zeigt das Datum, ab dem Ihre Frist wirklich lief:

{link}`,
    fr: `Si une modelo 210 est en retard, il y a une question à trancher avant toutes les autres, et ce n'est pas combien.

C'est de savoir si le fisc vous a déjà écrit.

Ces deux situations ne sont pas un peu différentes l'une de l'autre. Ce sont deux régimes distincts, et l'écart entre eux est énorme.

Déclarez de vous-même, avant l'arrivée de la moindre lettre, et c'est une majoration. Un pour cent, plus un pour cent par mois complet de retard, jusqu'à douze. À partir du treizième mois, quinze pour cent forfaitaires plus les intérêts. Et voici ce que presque personne ne sait : cette majoration remplace la sanction que vous auriez pu recevoir autrement. Il existe aussi une réduction de vingt-cinq pour cent si vous payez dans le délai volontaire une fois la notification reçue.

Une fois la mise en demeure arrivée, plus rien de tout cela n'est sur la table. Vous êtes ailleurs.

Donc si vous avez une année non déclarée qui traîne, ce qui vaut la peine d'être vérifié, c'est le courrier, pas la calculette.

Ensuite la page vous demande dans laquelle des deux vous êtes, calcule le montant, et affiche la date à partir de laquelle votre délai a réellement couru :

{link}`,
    nl: `Is een modelo 210 te laat, dan is er één vraag die het waard is om eerst te beantwoorden, en dat is niet hoeveel.

Het is of de belastingdienst u al heeft aangeschreven.

Die twee situaties verschillen niet een beetje van elkaar. Het zijn twee verschillende regimes, en het gat ertussen is enorm.

Dient u uit eigen beweging te laat in, voordat er een brief komt, dan is het een toeslag. Eén procent, plus nog eens één procent voor elke volle maand dat u te laat bent, tot twaalf. Vanaf maand dertien wordt het een vlakke vijftien procent plus rente. En dit is het deel dat bijna niemand weet: die toeslag komt in plaats van de boete die u anders had kunnen krijgen. Er is ook een vermindering van vijfentwintig procent als u na de kennisgeving binnen de vrijwillige termijn betaalt.

Zodra de aanmaning binnen is, ligt daar niets meer van op tafel. Dan zit u ergens heel anders.

Heeft u dus een jaar liggen dat niet is aangegeven, dan is het de post die het controleren waard is, niet de rekenhulp.

Daarna vraagt de pagina in welke van de twee u zit, rekent het bedrag uit, en toont de datum waarvandaan uw termijn werkelijk liep:

{link}`,
  },
},
{
  key: 'eu-eea-deductions',
  tool: 'rental-tax',
  kind: 'story',
  rules: ['irnr.rental.deductibility', 'irnr.rates'],
  text: {
    en: `I read this three times because I was sure I'd misunderstood it. The line is that sharp.

Two flats. Same building, same floor, same tenant paying the same rent in the same year.

If you live in an EU country, or in Norway, Iceland or Liechtenstein, you can deduct your costs. Management fees, insurance, repairs, the community charge, the mortgage interest, the depreciation. You're taxed on what's left, at 19 percent.

If you live anywhere else, you're taxed on the gross rent. No deductions at all. At 24 percent.

Same flat. The only thing that moved was where the owner sleeps at night.

And what I keep noticing is that even people firmly on the deductible side put through two or three of the categories and stop. Not because they're being cautious. Because nobody ever handed them the full list.

So I turned the list into a page. You go through what you actually paid, line by line, and it shows you the gap between that and what you're allowed to claim.

{link}

Worth ten minutes, I think.`,
    no: `Jeg leste dette tre ganger fordi jeg var sikker på at jeg hadde misforstått. Så skarp er grensen.

To leiligheter. Samme bygg, samme etasje, samme leietaker som betaler samme leie samme år.

Bor du i et EU-land, eller i Norge, Island eller Liechtenstein, kan du trekke fra kostnadene dine. Forvaltning, forsikring, reparasjoner, fellesutgifter, renter på lånet, avskrivning. Du skattlegges av det som står igjen, med 19 prosent.

Bor du et annet sted, skattlegges du av brutto leie. Ingen fradrag i det hele tatt. Med 24 prosent.

Samme leilighet. Det eneste som flyttet seg var hvor eieren sover om natten.

Og det jeg stadig legger merke til, er at selv folk godt på fradragssiden fører to eller tre av postene og stopper der. Ikke fordi de er forsiktige. Fordi ingen noen gang ga dem hele listen.

Så jeg gjorde listen om til en side. Du går gjennom det du faktisk har betalt, post for post, og den viser avstanden mellom det og det du har lov til å føre.

{link}

Verdt ti minutter, tenker jeg.`,
    sv: `Jag läste det här tre gånger för jag var säker på att jag missförstått. Så skarp är gränsen.

Två lägenheter. Samma hus, samma våning, samma hyresgäst som betalar samma hyra samma år.

Bor du i ett EU-land, eller i Norge, Island eller Liechtenstein, får du dra av dina kostnader. Förvaltning, försäkring, reparationer, samfällighetsavgift, räntan på lånet, avskrivning. Du beskattas på det som blir kvar, med 19 procent.

Bor du någon annanstans beskattas du på bruttohyran. Inga avdrag alls. Med 24 procent.

Samma lägenhet. Det enda som flyttade sig var var ägaren sover om natten.

Och det jag ständigt lägger märke till är att även folk med god marginal på avdragssidan tar upp två eller tre poster och stannar där. Inte för att de är försiktiga. För att ingen någonsin gav dem hela listan.

Så jag gjorde listan till en sida. Du går igenom vad du faktiskt betalat, rad för rad, och den visar skillnaden mellan det och vad du får dra av.

{link}

Värt tio minuter, tycker jag.`,
    de: `Ich habe das dreimal gelesen, weil ich sicher war, es falsch verstanden zu haben. So scharf ist die Grenze.

Zwei Wohnungen. Gleiches Haus, gleiches Stockwerk, derselbe Mieter, dieselbe Miete, dasselbe Jahr.

Wenn Sie in einem EU-Land leben, oder in Norwegen, Island oder Liechtenstein, können Sie Ihre Kosten absetzen. Verwaltung, Versicherung, Reparaturen, Hausgeld, Kreditzinsen, Abschreibung. Besteuert wird, was übrig bleibt, mit 19 Prozent.

Leben Sie anderswo, wird die Bruttomiete besteuert. Gar keine Abzüge. Mit 24 Prozent.

Dieselbe Wohnung. Das Einzige, was sich bewegt hat, ist, wo der Eigentümer nachts schläft.

Und was mir immer wieder auffällt: selbst Leute, die klar auf der abzugsberechtigten Seite stehen, setzen zwei oder drei Posten an und hören dann auf. Nicht aus Vorsicht. Weil ihnen nie jemand die vollständige Liste gegeben hat.

Also habe ich die Liste zu einer Seite gemacht. Sie gehen durch, was Sie tatsächlich gezahlt haben, Posten für Posten, und sie zeigt den Abstand zu dem, was Sie ansetzen dürfen.

{link}

Zehn Minuten wert, finde ich.`,
    fr: `J'ai relu ça trois fois parce que j'étais sûr d'avoir mal compris. La ligne est nette à ce point.

Deux appartements. Même immeuble, même étage, même locataire qui paie le même loyer la même année.

Si vous vivez dans un pays de l'UE, ou en Norvège, en Islande ou au Liechtenstein, vous déduisez vos charges. Gestion, assurance, réparations, charges de copropriété, intérêts du prêt, amortissement. Vous êtes imposé sur ce qui reste, à 19 pour cent.

Si vous vivez ailleurs, vous êtes imposé sur le loyer brut. Aucune déduction. À 24 pour cent.

Même appartement. La seule chose qui a bougé, c'est l'endroit où le propriétaire dort la nuit.

Et ce que je remarque sans cesse, c'est que même des gens franchement du bon côté portent deux ou trois postes et s'arrêtent là. Pas par prudence. Parce que personne ne leur a jamais donné la liste complète.

J'ai donc transformé la liste en une page. Vous parcourez ce que vous avez réellement payé, ligne par ligne, et elle montre l'écart avec ce que vous avez le droit de déduire.

{link}

Ça vaut dix minutes, je trouve.`,
    nl: `Ik heb dit drie keer gelezen omdat ik zeker wist dat ik het verkeerd begreep. Zo scherp is de grens.

Twee appartementen. Zelfde gebouw, zelfde verdieping, dezelfde huurder die dezelfde huur betaalt in hetzelfde jaar.

Woont u in een EU-land, of in Noorwegen, IJsland of Liechtenstein, dan trekt u uw kosten af. Beheer, verzekering, reparaties, VvE-bijdrage, hypotheekrente, afschrijving. U wordt belast over wat overblijft, tegen 19 procent.

Woont u ergens anders, dan wordt u belast over de brutohuur. Helemaal geen aftrek. Tegen 24 procent.

Hetzelfde appartement. Het enige dat verschoof, is waar de eigenaar 's nachts slaapt.

En wat me steeds opvalt: zelfs mensen die ruim aan de aftrekbare kant zitten voeren twee of drie posten op en stoppen daar. Niet uit voorzichtigheid. Omdat niemand hun ooit de volledige lijst gaf.

Dus maakte ik van die lijst een pagina. U loopt door wat u werkelijk betaalde, regel voor regel, en hij toont het gat tussen dat en wat u mag opvoeren.

{link}

Tien minuten waard, denk ik.`,
  },
},
{
  key: 'three-percent-retention',
  tool: 'sale-tax',
  kind: 'informative',
  rules: ['irnr.sale.retention', 'deadline.210.sale', 'irnr.rates'],
  text: {
    en: `Nothing on a Spanish sale confuses non-residents more than the three percent, and it's because of one word nobody says out loud.

It isn't a tax.

The buyer has to hold back three percent of the agreed price and pay it to the tax office on modelo 211 within a month of the sale. That's it. It's a deposit against your capital gains tax, paid on your behalf, in advance.

Your actual capital gains tax is 19 percent of the gain. Not of the price. Of the gain. And that's 19 percent for everybody, wherever you live.

So you've got three percent of one number and 19 percent of a completely different number, and they can land either way round. If the three percent came to more than you owe, the difference comes back to you. If your gain was small, or you sold at a loss, most of it comes back.

The catch is the window for claiming it, and it's an odd one. It opens a month after completion and closes three months after that.

The page does the gain, the tax, the retention and the refund, and turns every deadline into a real date off your completion day:

{link}`,
    no: `Ingenting ved et spansk salg forvirrer ikke-bosatte mer enn de tre prosentene, og det skyldes ett ord ingen sier høyt.

Det er ikke en skatt.

Kjøperen må holde tilbake tre prosent av avtalt pris og betale det til skattekontoret på modelo 211 innen en måned etter salget. Det er alt. Det er et depositum mot gevinstskatten din, betalt på dine vegne, på forskudd.

Selve gevinstskatten er 19 prosent av gevinsten. Ikke av prisen. Av gevinsten. Og det er 19 prosent for alle, uansett hvor du bor.

Du har altså tre prosent av ett tall og 19 prosent av et helt annet tall, og de kan slå ut begge veier. Ble de tre prosentene mer enn du skylder, kommer differansen tilbake. Var gevinsten liten, eller solgte du med tap, kommer det meste tilbake.

Haken er fristen for å kreve det, og den er underlig. Den åpner en måned etter overdragelsen og lukker tre måneder etter det igjen.

Siden regner gevinsten, skatten, tilbakeholdet og refusjonen, og gjør hver frist om til en faktisk dato fra din overdragelsesdag:

{link}`,
    sv: `Inget vid en spansk försäljning förvirrar icke-bosatta mer än de tre procenten, och det beror på ett ord ingen säger högt.

Det är inte en skatt.

Köparen måste hålla inne tre procent av det avtalade priset och betala in det till skattemyndigheten på modelo 211 inom en månad från försäljningen. Det är allt. Det är en deposition mot din kapitalvinstskatt, inbetald för din räkning, i förskott.

Själva kapitalvinstskatten är 19 procent av vinsten. Inte av priset. Av vinsten. Och det är 19 procent för alla, var du än bor.

Du har alltså tre procent av ett tal och 19 procent av ett helt annat tal, och de kan slå åt båda hållen. Blev de tre procenten mer än du är skyldig kommer mellanskillnaden tillbaka. Var vinsten liten, eller sålde du med förlust, kommer det mesta tillbaka.

Haken är fristen för att kräva det, och den är egendomlig. Den öppnar en månad efter tillträdet och stänger tre månader efter det.

Sidan räknar vinsten, skatten, innehållandet och återbetalningen, och gör varje frist till ett verkligt datum från din tillträdesdag:

{link}`,
    de: `Nichts an einem spanischen Verkauf verwirrt Nichtansässige mehr als die drei Prozent, und das liegt an einem Wort, das niemand ausspricht.

Es ist keine Steuer.

Der Käufer muss drei Prozent des vereinbarten Preises einbehalten und binnen eines Monats nach dem Verkauf mit modelo 211 ans Finanzamt abführen. Das ist alles. Es ist eine Anzahlung auf Ihre Gewinnsteuer, für Sie geleistet, im Voraus.

Ihre eigentliche Gewinnsteuer beträgt 19 Prozent des Gewinns. Nicht des Preises. Des Gewinns. Und das sind 19 Prozent für alle, egal wo Sie leben.

Sie haben also drei Prozent von einer Zahl und 19 Prozent von einer völlig anderen, und es kann in beide Richtungen ausgehen. Waren die drei Prozent mehr, als Sie schulden, kommt die Differenz zurück. War der Gewinn klein, oder haben Sie mit Verlust verkauft, kommt das meiste zurück.

Der Haken ist die Frist, um es zurückzuholen, und die ist merkwürdig. Sie öffnet einen Monat nach dem Notartermin und schließt drei Monate danach.

Die Seite rechnet Gewinn, Steuer, Einbehalt und Erstattung und verwandelt jede Frist in ein echtes Datum ab Ihrem Übergabetag:

{link}`,
    fr: `Rien dans une vente espagnole ne trouble davantage les non-résidents que les trois pour cent, et c'est à cause d'un mot que personne ne dit tout haut.

Ce n'est pas un impôt.

L'acheteur doit retenir trois pour cent du prix convenu et les verser au fisc sur le modelo 211 dans le mois qui suit la vente. C'est tout. C'est un acompte sur votre impôt sur la plus-value, versé pour vous, à l'avance.

Votre impôt sur la plus-value, lui, est de 19 pour cent du gain. Pas du prix. Du gain. Et c'est 19 pour cent pour tout le monde, où que vous viviez.

Vous avez donc trois pour cent d'un chiffre et 19 pour cent d'un chiffre complètement différent, et cela peut pencher des deux côtés. Si les trois pour cent dépassent ce que vous devez, la différence revient. Si le gain était faible, ou si vous avez vendu à perte, l'essentiel revient.

Le hic, c'est la fenêtre pour le réclamer, et elle est bizarre. Elle s'ouvre un mois après la signature et se ferme trois mois plus tard.

La page calcule le gain, l'impôt, la retenue et le remboursement, et transforme chaque échéance en date réelle à partir de votre jour de signature :

{link}`,
    nl: `Niets aan een Spaanse verkoop verwart niet-inwoners meer dan de drie procent, en dat komt door één woord dat niemand hardop zegt.

Het is geen belasting.

De koper moet drie procent van de overeengekomen prijs inhouden en binnen een maand na de verkoop met modelo 211 aan de belastingdienst afdragen. Dat is het. Het is een voorschot op uw vermogenswinstbelasting, namens u betaald, vooruit.

Uw werkelijke vermogenswinstbelasting is 19 procent over de winst. Niet over de prijs. Over de winst. En dat is 19 procent voor iedereen, waar u ook woont.

U heeft dus drie procent van het ene bedrag en 19 procent van een heel ander bedrag, en het kan beide kanten op vallen. Waren de drie procent meer dan u verschuldigd bent, dan komt het verschil terug. Was de winst klein, of verkocht u met verlies, dan komt het meeste terug.

De adder is het venster om het terug te vragen, en dat is een vreemde. Het opent een maand na de overdracht en sluit drie maanden daarna.

De pagina rekent de winst, de belasting, de inhouding en de teruggaaf, en zet elke termijn om in een echte datum vanaf uw overdrachtsdag:

{link}`,
  },
},
{
  key: 'plusvalia-two-methods',
  tool: 'sale-tax',
  kind: 'informative',
  rules: ['plusvalia.methods', 'plusvalia.no_gain', 'plusvalia.deadlines'],
  text: {
    en: `Most sellers meet the plusvalia for the first time at the notary's table, about ninety seconds before they're asked to accept it. Not ideal.

It's the municipal tax on the sale, and three things make it a lot less frightening than it sounds when someone says the number out loud.

There are two ways of calculating it, and you get to pick. The objective method takes the cadastral value of the land and multiplies it by a coefficient for how long you owned the place. The real gain method uses the actual increase between what the two deeds say. Whichever comes out lower is the one you can go with.

If there was no increase at all, there's nothing to pay. You still have to declare the sale and hand over both deeds, but there's no bill.

The deadline is thirty working days from the date of the deed. Working days. Not thirty days.

One honest caveat, because I'd rather say it than have you rely on me: the coefficients, the rate, and whether your town wants a declaration or a self assessment all vary by municipality. The final number has to come from the town hall.

{link}`,
    no: `De fleste selgere møter plusvalia for første gang ved notarens bord, omtrent nitti sekunder før de blir bedt om å godta den. Ikke ideelt.

Det er den kommunale skatten på salget, og tre ting gjør den langt mindre skremmende enn den høres ut når noen sier tallet høyt.

Den kan regnes på to måter, og du velger. Den objektive metoden tar matrikkelverdien på grunnen og ganger den med en koeffisient for hvor lenge du eide stedet. Metoden med reell gevinst bruker den faktiske økningen mellom det de to skjøtene sier. Den som gir lavest beløp er den du kan gå for.

Var det ingen økning i det hele tatt, er det ingenting å betale. Salget må fortsatt meldes og begge skjøtene leveres, men det kommer ingen regning.

Fristen er tretti virkedager fra datoen på skjøtet. Virkedager. Ikke tretti dager.

Ett ærlig forbehold, for jeg sier det heller enn at du skal stole på meg: koeffisientene, satsen og om kommunen din vil ha melding eller egenfastsetting varierer fra kommune til kommune. Det endelige tallet må komme fra rådhuset.

{link}`,
    sv: `De flesta säljare möter plusvalia för första gången vid notariens bord, ungefär nittio sekunder innan de ombeds godta den. Inte idealiskt.

Det är den kommunala skatten på försäljningen, och tre saker gör den betydligt mindre skrämmande än den låter när någon säger siffran högt.

Den kan räknas på två sätt, och du får välja. Den objektiva metoden tar markens taxeringsvärde och multiplicerar med en koefficient för hur länge du ägt stället. Metoden med verklig vinst använder den faktiska ökningen mellan vad de två handlingarna säger. Den som blir lägst är den du kan ta.

Fanns ingen ökning alls finns inget att betala. Försäljningen måste ändå anmälas och båda handlingarna lämnas in, men det kommer ingen räkning.

Fristen är trettio arbetsdagar från datumet på handlingen. Arbetsdagar. Inte trettio dagar.

En ärlig reservation, för jag säger den hellre än att du ska lita på mig: koefficienterna, skattesatsen och om din kommun vill ha anmälan eller självdeklaration varierar mellan kommuner. Den slutliga siffran måste komma från kommunhuset.

{link}`,
    de: `Die meisten Verkäufer begegnen der plusvalia zum ersten Mal am Tisch des Notars, ungefähr neunzig Sekunden bevor sie sie akzeptieren sollen. Nicht ideal.

Es ist die kommunale Steuer auf den Verkauf, und drei Dinge machen sie deutlich weniger bedrohlich, als sie klingt, wenn jemand die Zahl laut ausspricht.

Es gibt zwei Berechnungswege, und Sie dürfen wählen. Die objektive Methode nimmt den Katasterwert des Grundstücks und multipliziert ihn mit einem Koeffizienten für Ihre Haltedauer. Die Methode des tatsächlichen Gewinns nimmt die reale Steigerung zwischen dem, was die beiden Urkunden sagen. Was niedriger herauskommt, dürfen Sie nehmen.

Gab es gar keine Steigerung, ist nichts zu zahlen. Der Verkauf muss trotzdem erklärt und beide Urkunden müssen vorgelegt werden, aber es kommt keine Rechnung.

Die Frist beträgt dreißig Werktage ab dem Datum der Urkunde. Werktage. Nicht dreißig Tage.

Ein ehrlicher Vorbehalt, weil ich ihn lieber ausspreche, als dass Sie sich auf mich verlassen: die Koeffizienten, der Satz und ob Ihre Gemeinde eine Erklärung oder eine Selbstveranlagung will, sind von Gemeinde zu Gemeinde verschieden. Die endgültige Zahl muss vom Rathaus kommen.

{link}`,
    fr: `La plupart des vendeurs découvrent la plusvalia pour la première fois à la table du notaire, environ quatre-vingt-dix secondes avant qu'on leur demande de l'accepter. Pas idéal.

C'est l'impôt municipal sur la vente, et trois choses la rendent bien moins effrayante qu'elle n'en a l'air quand quelqu'un prononce le chiffre.

Il y a deux façons de la calculer, et c'est vous qui choisissez. La méthode objective prend la valeur cadastrale du terrain et la multiplie par un coefficient lié à la durée de détention. La méthode du gain réel prend l'augmentation effective entre ce que disent les deux actes. Celle qui sort la plus basse, vous pouvez la prendre.

S'il n'y a eu aucune augmentation, il n'y a rien à payer. La vente doit tout de même être déclarée et les deux actes fournis, mais il n'arrive pas de facture.

Le délai est de trente jours ouvrables à compter de la date de l'acte. Ouvrables. Pas trente jours.

Une réserve honnête, parce que je préfère la dire que vous voir vous fier à moi : les coefficients, le taux et le fait que votre commune veuille une déclaration ou une autoliquidation varient d'une commune à l'autre. Le chiffre final doit venir de la mairie.

{link}`,
    nl: `De meeste verkopers ontmoeten de plusvalia voor het eerst aan de tafel van de notaris, ongeveer negentig seconden voordat ze worden gevraagd hem te aanvaarden. Niet ideaal.

Het is de gemeentelijke belasting op de verkoop, en drie dingen maken hem een stuk minder eng dan hij klinkt als iemand het bedrag hardop zegt.

Er zijn twee manieren om hem te berekenen, en u mag kiezen. De objectieve methode neemt de kadastrale grondwaarde en vermenigvuldigt die met een coëfficiënt voor hoe lang u de woning had. De methode van de werkelijke winst neemt de feitelijke stijging tussen wat de twee akten zeggen. Welke het laagst uitkomt, mag u nemen.

Was er helemaal geen stijging, dan valt er niets te betalen. De verkoop moet nog steeds worden aangegeven en beide akten ingeleverd, maar er komt geen rekening.

De termijn is dertig werkdagen vanaf de datum van de akte. Werkdagen. Geen dertig dagen.

Eén eerlijk voorbehoud, want ik zeg het liever dan dat u op mij vaart: de coëfficiënten, het tarief en of uw gemeente een aangifte of een zelfaanslag wil, verschillen per gemeente. Het eindbedrag moet van het gemeentehuis komen.

{link}`,
  },
},
{
  key: 'iva-holiday-let',
  tool: 'rental-vat',
  kind: 'informative',
  rules: ['vat.letting'],
  text: {
    en: `Ask ten people whether IVA applies to a holiday let and you'll get told it depends how long the guest stays. It doesn't. That's the wrong question, and it's been the wrong question for years.

It depends on what you do for them while they're there.

Let the place with no services and it's exempt from IVA. Add hotel type services during the stay and it's taxed at 10 percent. Twenty one percent is for something that's neither an exempt residential let nor a hotel type service.

"Hotel type" is the phrase carrying all the weight, and it means services during the stay. A clean and fresh sheets between guests is not the same animal as a daily clean, a reception desk, or breakfast. Two owners on the same landing, letting the same week at the same price, can genuinely end up on opposite sides of this.

Then there's the second half of it, which is who the guest actually books through. That can change the answer all over again.

Three questions and a straight answer, here:

{link}`,
    no: `Spør ti personer om IVA gjelder for korttidsutleie, og du får høre at det avhenger av hvor lenge gjesten blir. Det gjør det ikke. Det er feil spørsmål, og det har vært feil spørsmål i årevis.

Det avhenger av hva du gjør for dem mens de er der.

Leier du ut uten tjenester, er det fritatt for IVA. Legger du til hotelliknende tjenester under oppholdet, beskattes det med 10 prosent. Tjueen prosent er for noe som verken er en fritatt boligutleie eller en hotelliknende tjeneste.

Hotelliknende er uttrykket som bærer hele vekten, og det betyr tjenester under oppholdet. Vask og rene laken mellom gjester er ikke samme dyr som daglig renhold, resepsjon eller frokost. To eiere i samme oppgang, som leier ut samme uke til samme pris, kan reelt havne på hver sin side av dette.

Så er det den andre halvdelen, nemlig hvem gjesten faktisk bestiller gjennom. Det kan snu svaret på nytt.

Tre spørsmål og et rett svar, her:

{link}`,
    sv: `Fråga tio personer om IVA gäller för korttidsuthyrning så får du höra att det beror på hur länge gästen stannar. Det gör det inte. Det är fel fråga, och det har varit fel fråga i åratal.

Det beror på vad du gör för dem medan de är där.

Hyr ut utan tjänster så är det undantaget från IVA. Lägg till hotelliknande tjänster under vistelsen så beskattas det med 10 procent. Tjugoen procent är för något som varken är en undantagen bostadsuthyrning eller en hotelliknande tjänst.

Hotelliknande är uttrycket som bär hela tyngden, och det betyder tjänster under vistelsen. Städning och rena lakan mellan gäster är inte samma djur som daglig städning, reception eller frukost. Två ägare i samma trapphus, som hyr ut samma vecka till samma pris, kan verkligen hamna på var sin sida.

Sedan finns andra halvan, nämligen vem gästen faktiskt bokar genom. Det kan vända svaret igen.

Tre frågor och ett rakt svar, här:

{link}`,
    de: `Fragen Sie zehn Leute, ob auf eine Ferienvermietung IVA anfällt, und man sagt Ihnen, es komme darauf an, wie lange der Gast bleibt. Tut es nicht. Das ist die falsche Frage, und sie ist seit Jahren die falsche.

Es kommt darauf an, was Sie für ihn tun, solange er da ist.

Vermieten Sie ohne Leistungen, ist es von der IVA befreit. Kommen hotelartige Leistungen während des Aufenthalts dazu, sind es 10 Prozent. Einundzwanzig Prozent gelten für etwas, das weder eine befreite Wohnraumvermietung noch eine hotelartige Leistung ist.

Hotelartig ist der Begriff, der die ganze Last trägt, und er meint Leistungen während des Aufenthalts. Einmal putzen und frische Bettwäsche zwischen zwei Gästen ist nicht dasselbe Tier wie tägliche Reinigung, Rezeption oder Frühstück. Zwei Eigentümer auf demselben Treppenabsatz, die dieselbe Woche zum selben Preis vermieten, können hier tatsächlich auf verschiedenen Seiten landen.

Dann gibt es die zweite Hälfte, nämlich über wen der Gast tatsächlich bucht. Das kann die Antwort noch einmal drehen.

Drei Fragen und eine klare Antwort, hier:

{link}`,
    fr: `Demandez à dix personnes si l'IVA s'applique à une location saisonnière et on vous dira que ça dépend de la durée du séjour. Non. C'est la mauvaise question, et elle l'est depuis des années.

Ça dépend de ce que vous faites pour eux pendant qu'ils sont là.

Louez sans services et c'est exonéré d'IVA. Ajoutez des services de type hôtelier pendant le séjour et c'est taxé à 10 pour cent. Vingt et un pour cent, c'est pour quelque chose qui n'est ni une location résidentielle exonérée ni un service de type hôtelier.

« Type hôtelier », voilà l'expression qui porte tout le poids, et elle vise des services pendant le séjour. Un ménage et des draps propres entre deux séjours, ce n'est pas la même bête qu'un ménage quotidien, une réception ou un petit déjeuner. Deux propriétaires du même palier, louant la même semaine au même prix, peuvent vraiment se retrouver de part et d'autre.

Et puis il y a l'autre moitié : auprès de qui le client réserve réellement. Ça peut retourner la réponse une fois de plus.

Trois questions et une réponse nette, ici :

{link}`,
    nl: `Vraag tien mensen of IVA geldt bij vakantieverhuur en u krijgt te horen dat het afhangt van hoe lang de gast blijft. Dat doet het niet. Dat is de verkeerde vraag, en dat is het al jaren.

Het hangt af van wat u voor ze doet terwijl ze er zijn.

Verhuurt u zonder diensten, dan is het vrijgesteld van IVA. Voegt u hoteldiensten toe tijdens het verblijf, dan wordt het belast tegen 10 procent. Eenentwintig procent is voor iets dat noch een vrijgestelde woonverhuur, noch een hotelmatige dienst is.

Hotelmatig is de term die al het gewicht draagt, en die slaat op diensten tijdens het verblijf. Schoonmaken en schoon beddengoed tussen gasten is niet hetzelfde beest als dagelijks schoonmaken, een receptie of ontbijt. Twee eigenaren op dezelfde overloop, die dezelfde week voor dezelfde prijs verhuren, kunnen echt aan weerszijden uitkomen.

En dan is er de tweede helft: via wie de gast eigenlijk boekt. Dat kan het antwoord opnieuw omdraaien.

Drie vragen en een recht antwoord, hier:

{link}`,
  },
},
{
  key: 'consorcio-storm',
  tool: 'storm-claim',
  kind: 'story',
  rules: ['consorcio.perils', 'consorcio.wind_threshold', 'consorcio.precondition'],
  text: {
    en: `I learned this one reading a claim refusal that was completely correct and still left the owner believing the wrong thing.

For certain kinds of damage in Spain, your insurer isn't the one who pays. A public body called the Consorcio de Compensacion de Seguros is. Earthquake, extraordinary flood, volcanic eruption, atypical cyclonic storm, and a short list of others.

And the wind one has an actual number attached, which I didn't expect. Gusts above 120 km an hour, measured as a three second gust. Below that, storm damage is your own insurer's problem under the storm cover in your policy. Above it, you might be looking at the Consorcio instead.

Here's the part worth knowing before anything happens: this isn't something you buy. If you hold an ordinary policy in a qualifying branch, the surcharge is already being collected with your premium, automatically. You've been paying for it whether or not you'd ever heard the name.

So the morning after a storm, the useful question isn't what your policy covers. It's which of the two you should be phoning.

Four questions and it tells you:

{link}`,
    no: `Denne lærte jeg av å lese et avslag som var helt korrekt og likevel etterlot eieren med feil oppfatning.

For visse typer skade i Spania er det ikke forsikringsselskapet ditt som betaler. Det er et offentlig organ som heter Consorcio de Compensacion de Seguros. Jordskjelv, ekstraordinær flom, vulkanutbrudd, atypisk syklonstorm, og en kort liste til.

Og vindgrensen har et faktisk tall festet til seg, noe jeg ikke hadde ventet. Kast over 120 km i timen, målt som tresekunders kast. Under det er stormskade ditt eget selskaps problem under stormdekningen i polisen. Over det kan det være Consorcio i stedet.

Her er det som er verdt å vite før noe skjer: dette er ikke noe du kjøper. Har du en ordinær polise i en kvalifiserende bransje, kreves tillegget allerede inn sammen med premien, automatisk. Du har betalt for det enten du hadde hørt navnet eller ikke.

Så morgenen etter en storm er det nyttige spørsmålet ikke hva polisen din dekker. Det er hvem av de to du skal ringe.

Fire spørsmål, så sier den det:

{link}`,
    sv: `Den här lärde jag mig av att läsa ett avslag som var helt korrekt och ändå lämnade ägaren med fel uppfattning.

För vissa typer av skada i Spanien är det inte ditt försäkringsbolag som betalar. Det är ett offentligt organ som heter Consorcio de Compensacion de Seguros. Jordbävning, extraordinär översvämning, vulkanutbrott, atypisk cyklonstorm, och en kort lista till.

Och vindgränsen har en faktisk siffra fäst vid sig, vilket jag inte väntat mig. Byar över 120 km i timmen, mätt som tresekundersby. Under det är stormskada ditt eget bolags problem under stormskyddet i försäkringen. Över det kan det vara Consorcio i stället.

Här är det värt att veta innan något händer: det här är inget du köper. Har du en vanlig försäkring i en kvalificerande gren tas tillägget redan ut med premien, automatiskt. Du har betalat för det oavsett om du hört namnet eller inte.

Så morgonen efter en storm är den användbara frågan inte vad din försäkring täcker. Det är vem av de två du ska ringa.

Fyra frågor, sedan säger den det:

{link}`,
    de: `Das habe ich beim Lesen einer Ablehnung gelernt, die völlig richtig war und den Eigentümer trotzdem mit der falschen Vorstellung zurückließ.

Bei bestimmten Schadensarten in Spanien zahlt nicht Ihr Versicherer. Das tut eine öffentliche Stelle namens Consorcio de Compensacion de Seguros. Erdbeben, außergewöhnliche Überschwemmung, Vulkanausbruch, atypischer Zyklonsturm und eine kurze weitere Liste.

Und beim Wind hängt eine echte Zahl daran, womit ich nicht gerechnet hatte. Böen über 120 km pro Stunde, gemessen als Dreisekundenbö. Darunter ist Sturmschaden das Problem Ihres eigenen Versicherers unter der Sturmdeckung der Police. Darüber kann stattdessen der Consorcio zuständig sein.

Und hier das, was man vorher wissen sollte: das kauft man nicht. Halten Sie eine gewöhnliche Police in einer qualifizierenden Sparte, wird der Zuschlag bereits automatisch mit der Prämie eingezogen. Sie zahlen dafür, ob Sie den Namen je gehört hatten oder nicht.

Am Morgen nach einem Sturm lautet die nützliche Frage also nicht, was Ihre Police deckt. Sondern welchen der beiden Sie anrufen sollten.

Vier Fragen, dann sagt sie es Ihnen:

{link}`,
    fr: `J'ai appris celle-ci en lisant un refus de sinistre parfaitement fondé qui laissait pourtant le propriétaire avec une idée fausse.

Pour certains types de dommages en Espagne, ce n'est pas votre assureur qui paie. C'est un organisme public appelé Consorcio de Compensacion de Seguros. Séisme, inondation extraordinaire, éruption volcanique, tempête cyclonique atypique, et une courte liste d'autres cas.

Et pour le vent, il y a un vrai chiffre attaché, ce à quoi je ne m'attendais pas. Des rafales au-dessus de 120 km par heure, mesurées sur trois secondes. En dessous, le dégât de tempête est l'affaire de votre propre assureur au titre de la garantie tempête. Au-dessus, c'est peut-être le Consorcio.

Et voici ce qu'il vaut mieux savoir avant que quoi que ce soit arrive : cela ne s'achète pas. Si vous détenez un contrat ordinaire dans une branche éligible, la surprime est déjà prélevée avec votre cotisation, automatiquement. Vous la payez que vous ayez entendu le nom ou non.

Donc le lendemain d'une tempête, la question utile n'est pas ce que couvre votre contrat. C'est lequel des deux appeler.

Quatre questions et elle vous le dit :

{link}`,
    nl: `Deze leerde ik door een afwijzing te lezen die volkomen juist was en de eigenaar toch met het verkeerde idee achterliet.

Bij bepaalde soorten schade in Spanje betaalt uw verzekeraar niet. Dat doet een publiek orgaan dat Consorcio de Compensacion de Seguros heet. Aardbeving, buitengewone overstroming, vulkaanuitbarsting, atypische cycloonstorm, en een korte lijst andere gevallen.

En aan de wind hangt een echt getal, wat ik niet had verwacht. Windstoten boven 120 km per uur, gemeten als drie-secondenstoot. Daaronder is stormschade het probleem van uw eigen verzekeraar onder de stormdekking in de polis. Daarboven kan het juist het Consorcio zijn.

En dit is het wat u wilt weten voordat er iets gebeurt: dit koopt u niet. Heeft u een gewone polis in een kwalificerende branche, dan wordt de opslag al automatisch met uw premie geïnd. U betaalt ervoor, of u de naam ooit had gehoord of niet.

De ochtend na een storm is de nuttige vraag dus niet wat uw polis dekt. Het is wie van de twee u moet bellen.

Vier vragen en hij zegt het:

{link}`,
  },
},
{
  key: 'legal-cover-you-already-pay-for',
  tool: 'your-rights',
  kind: 'story',
  rules: ['cover.free_choice', 'cover.separate_chapter', 'cover.search_terms', 'cover.policy_must_state'],
  text: {
    en: `This is the one I wasn't expecting to find, and honestly it's the reason the whole page exists.

A lot of Spanish home policies have a legal expenses chapter buried in them. Defensa juridica. It pays your lawyer, the procurador and the court costs when you're actually in a case. And inside a combined home policy it has to appear as its own chapter, with its own premium line. So if you go looking and there's no separate premium for it, that alone is worth a phone call.

Then there's the part that genuinely surprised me. You have the right to choose your own lawyer. Not one off their list. Yours. And the lawyer you pick takes instructions from you, not from the insurer. That right doesn't depend on the insurer agreeing to it, and it doesn't depend on there being a conflict of interest. The policy has to spell it out in so many words.

So before anyone pays a lawyer out of their own pocket, it's worth half an hour with the policy and the Spanish phrases to search for. Finding them tells you what you've got. Not finding them tells you what to ask about.

The phrases, the articles and the time limits are all on one page:

{link}`,
    no: `Dette er den jeg ikke ventet å finne, og ærlig talt er den grunnen til at hele siden finnes.

Mange spanske husforsikringer har et kapittel om juridisk bistand begravd i seg. Defensa juridica. Det dekker advokaten din, prosessfullmektigen og rettsomkostningene når du faktisk står i en sak. Og inne i en kombinert husforsikring må det stå som sitt eget kapittel, med sin egen premielinje. Så leter du og finner ingen egen premie for det, er allerede det verdt en telefon.

Så kommer delen som faktisk overrasket meg. Du har rett til å velge din egen advokat. Ikke en fra deres liste. Din. Og advokaten du velger tar instruks fra deg, ikke fra selskapet. Den retten er ikke avhengig av at selskapet sier ja, og ikke av at det foreligger en interessekonflikt. Polisen må si det med rene ord.

Så før noen betaler en advokat av egen lomme, er det verdt en halvtime med polisen og de spanske uttrykkene å søke etter. Finner du dem, vet du hva du har. Finner du dem ikke, vet du hva du skal spørre om.

Uttrykkene, lovhjemlene og fristene ligger alle på én side:

{link}`,
    sv: `Det här är den jag inte väntade mig att hitta, och ärligt talat är den skälet till att hela sidan finns.

Många spanska hemförsäkringar har ett kapitel om rättsskydd begravt i sig. Defensa juridica. Det betalar din advokat, ombudet och rättegångskostnaderna när du faktiskt står i ett ärende. Och inuti en kombinerad hemförsäkring måste det stå som ett eget kapitel, med en egen premierad. Så letar du och hittar ingen egen premie för det, är redan det värt ett telefonsamtal.

Sedan kommer den del som verkligen förvånade mig. Du har rätt att välja din egen advokat. Inte en från deras lista. Din. Och den advokat du väljer tar instruktioner av dig, inte av bolaget. Den rätten beror inte på att bolaget säger ja, och inte på att det finns en intressekonflikt. Försäkringsbrevet måste säga det rent ut.

Så innan någon betalar en advokat ur egen ficka är det värt en halvtimme med försäkringsbrevet och de spanska uttrycken att söka på. Hittar du dem vet du vad du har. Hittar du dem inte vet du vad du ska fråga om.

Uttrycken, lagrummen och fristerna ligger alla på en sida:

{link}`,
    de: `Das ist die Sache, mit der ich nicht gerechnet hatte, und ehrlich gesagt der Grund, warum es die Seite überhaupt gibt.

In vielen spanischen Wohngebäudepolicen steckt ein Kapitel Rechtsschutz. Defensa juridica. Es zahlt Ihren Anwalt, den Prozessvertreter und die Gerichtskosten, wenn Sie tatsächlich in einem Verfahren stehen. Und in einer kombinierten Police muss es als eigenes Kapitel erscheinen, mit eigener Prämienzeile. Wenn Sie also nachsehen und keine eigene Prämie dafür finden, ist allein das einen Anruf wert.

Dann kommt der Teil, der mich wirklich überrascht hat. Sie haben das Recht, Ihren eigenen Anwalt zu wählen. Keinen von deren Liste. Ihren. Und der Anwalt, den Sie wählen, nimmt Weisungen von Ihnen entgegen, nicht vom Versicherer. Dieses Recht hängt nicht davon ab, dass der Versicherer zustimmt, und nicht davon, dass ein Interessenkonflikt vorliegt. Die Police muss es ausdrücklich benennen.

Bevor also jemand einen Anwalt aus eigener Tasche bezahlt, lohnt sich eine halbe Stunde mit der Police und den spanischen Suchbegriffen. Sie zu finden sagt Ihnen, was Sie haben. Sie nicht zu finden sagt Ihnen, wonach Sie fragen sollten.

Die Begriffe, die Artikel und die Fristen stehen alle auf einer Seite:

{link}`,
    fr: `C'est celle que je ne m'attendais pas à trouver, et honnêtement c'est la raison pour laquelle toute la page existe.

Beaucoup de contrats habitation espagnols contiennent un chapitre de protection juridique enfoui dedans. Defensa juridica. Il paie votre avocat, le procurador et les frais de justice quand vous êtes réellement dans une procédure. Et dans un contrat multirisque, il doit figurer comme son propre chapitre, avec sa propre ligne de prime. Donc si vous cherchez et qu'il n'y a pas de prime distincte, cela seul mérite un coup de fil.

Puis vient la partie qui m'a vraiment surpris. Vous avez le droit de choisir votre propre avocat. Pas un de leur liste. Le vôtre. Et l'avocat que vous choisissez reçoit ses instructions de vous, pas de l'assureur. Ce droit ne dépend pas de l'accord de l'assureur, ni de l'existence d'un conflit d'intérêts. Le contrat doit l'énoncer noir sur blanc.

Donc avant que quiconque paie un avocat de sa poche, ça vaut une demi-heure avec le contrat et les expressions espagnoles à chercher. Les trouver vous dit ce que vous avez. Ne pas les trouver vous dit ce qu'il faut demander.

Les expressions, les articles et les délais sont tous sur une seule page :

{link}`,
    nl: `Dit is degene die ik niet verwachtte te vinden, en eerlijk gezegd is het de reden dat de hele pagina bestaat.

In veel Spaanse woonpolissen zit een hoofdstuk rechtsbijstand begraven. Defensa juridica. Het betaalt uw advocaat, de procurador en de proceskosten als u werkelijk in een zaak zit. En binnen een gecombineerde woonpolis moet het als een eigen hoofdstuk staan, met een eigen premieregel. Dus gaat u kijken en is er geen aparte premie voor, dan is dat alleen al een telefoontje waard.

Dan komt het deel dat me echt verraste. U heeft het recht uw eigen advocaat te kiezen. Niet een van hun lijst. De uwe. En de advocaat die u kiest neemt instructies van u aan, niet van de verzekeraar. Dat recht hangt niet af van de instemming van de verzekeraar, en niet van het bestaan van een belangenconflict. De polis moet het met zoveel woorden vastleggen.

Dus voordat iemand een advocaat uit eigen zak betaalt, loont een half uur met de polis en de Spaanse zoektermen. Ze vinden zegt u wat u heeft. Ze niet vinden zegt u waar u naar moet vragen.

De termen, de artikelen en de termijnen staan allemaal op één pagina:

{link}`,
  },
},
{
  key: 'community-decision-clock',
  tool: 'your-rights',
  kind: 'informative',
  rules: ['limit.community.challenge', 'limit.community.challenge.absent', 'limit.community.challenge.standing'],
  text: {
    en: `If you own in a building and you weren't at the last owners meeting, there's one rule that's worth more to you than all the others put together.

You get three months to challenge a decision if your ground is that it seriously harms the community or unfairly harms one owner. A year if your ground is that it breaks the law or the statutes.

And here's the bit for anyone who lives abroad: if you weren't at the meeting, your clock doesn't start at the meeting. It starts the day the decision was communicated to you.

Which means the envelope matters. Or the email. Keep it, with its date on it, because that date is your starting line and nothing else is. People throw those away all the time and then can't prove when their window opened.

One condition to check before you plan anything, because it catches people out: to challenge a decision you generally need to be up to date with the community payments, or to have paid the disputed amount into court first.

The clocks, the articles they come from, and what to gather while you still can, all here:

{link}`,
    no: `Eier du i et sameie og ikke var på siste sameiermøte, finnes det én regel som er verdt mer for deg enn alle de andre til sammen.

Du får tre måneder på å angripe et vedtak hvis grunnlaget ditt er at det skader sameiet alvorlig eller rammer én eier urimelig. Ett år hvis grunnlaget er at det bryter loven eller vedtektene.

Og her er delen for alle som bor i utlandet: var du ikke på møtet, starter ikke klokken din på møtet. Den starter den dagen vedtaket ble meddelt deg.

Det betyr at konvolutten betyr noe. Eller e-posten. Ta vare på den, med datoen på, for den datoen er startstreken din, og ingenting annet er det. Folk kaster slike hele tiden og kan så ikke bevise når vinduet deres åpnet.

Én betingelse å sjekke før du planlegger noe, for den tar folk: for å angripe et vedtak må du som regel være à jour med fellesutgiftene, eller først ha deponert det omtvistede beløpet i retten.

Fristene, lovhjemlene de kommer fra, og hva du bør sikre mens du ennå kan, alt sammen her:

{link}`,
    sv: `Äger du i en samfällighet och inte var på senaste stämman finns det en regel som är värd mer för dig än alla de andra tillsammans.

Du får tre månader att klandra ett beslut om din grund är att det allvarligt skadar samfälligheten eller drabbar en ägare oskäligt. Ett år om grunden är att det strider mot lag eller stadgar.

Och här är biten för alla som bor utomlands: var du inte på stämman startar inte din klocka vid stämman. Den startar den dag beslutet meddelades dig.

Vilket betyder att kuvertet spelar roll. Eller mejlet. Spara det, med datumet på, för det datumet är din startlinje och inget annat är det. Folk slänger sådana hela tiden och kan sedan inte visa när deras fönster öppnade.

Ett villkor att kolla innan du planerar något, för det tar folk på sängen: för att klandra ett beslut behöver du normalt vara i fas med samfällighetsavgifterna, eller först ha deponerat det omtvistade beloppet i domstol.

Fristerna, lagrummen de kommer från, och vad du bör samla in medan du ännu kan, allt här:

{link}`,
    de: `Wenn Sie in einer Eigentümergemeinschaft besitzen und bei der letzten Versammlung nicht dabei waren, gibt es eine Regel, die für Sie mehr wert ist als alle anderen zusammen.

Sie haben drei Monate, um einen Beschluss anzufechten, wenn Ihr Grund ist, dass er die Gemeinschaft schwer schädigt oder einen Eigentümer unbillig benachteiligt. Ein Jahr, wenn Ihr Grund ist, dass er gegen Gesetz oder Satzung verstößt.

Und hier der Teil für alle, die im Ausland leben: waren Sie nicht bei der Versammlung, beginnt Ihre Frist nicht mit der Versammlung. Sie beginnt an dem Tag, an dem Ihnen der Beschluss mitgeteilt wurde.

Das heißt, der Umschlag zählt. Oder die E-Mail. Heben Sie ihn auf, mit dem Datum darauf, denn dieses Datum ist Ihre Startlinie, kein anderes. Solche Dinge werden ständig weggeworfen, und dann lässt sich nicht mehr belegen, wann das Fenster aufging.

Eine Bedingung, die Sie prüfen sollten, bevor Sie etwas planen, weil sie die Leute erwischt: um anzufechten, müssen Sie in der Regel mit den Gemeinschaftszahlungen aktuell sein oder den streitigen Betrag zuvor bei Gericht hinterlegt haben.

Die Fristen, die Artikel, aus denen sie stammen, und was zu sammeln ist, solange es noch geht, alles hier:

{link}`,
    fr: `Si vous êtes propriétaire en copropriété et que vous n'étiez pas à la dernière assemblée, il y a une règle qui vaut plus pour vous que toutes les autres réunies.

Vous avez trois mois pour contester une décision si votre motif est qu'elle nuit gravement à la copropriété ou lèse injustement un copropriétaire. Un an si votre motif est qu'elle enfreint la loi ou les statuts.

Et voici le passage pour ceux qui vivent à l'étranger : si vous n'étiez pas à l'assemblée, votre délai ne démarre pas à l'assemblée. Il démarre le jour où la décision vous a été communiquée.

Ce qui veut dire que l'enveloppe compte. Ou le courriel. Gardez-le, avec sa date, parce que cette date est votre ligne de départ et aucune autre. Les gens jettent ça sans arrêt et ne peuvent plus prouver quand leur fenêtre s'est ouverte.

Une condition à vérifier avant de prévoir quoi que ce soit, parce qu'elle piège : pour contester une décision, il faut en général être à jour des charges, ou avoir préalablement consigné en justice le montant contesté.

Les délais, les articles d'où ils viennent, et ce qu'il faut rassembler tant que c'est possible, tout est ici :

{link}`,
    nl: `Bezit u in een VvE en was u niet op de laatste vergadering, dan is er één regel die meer voor u waard is dan alle andere bij elkaar.

U heeft drie maanden om een besluit aan te vechten als uw grond is dat het de vereniging ernstig schaadt of een eigenaar onredelijk benadeelt. Een jaar als uw grond is dat het in strijd is met de wet of de statuten.

En dit is het stuk voor wie in het buitenland woont: was u niet op de vergadering, dan begint uw klok niet bij de vergadering. Hij begint op de dag dat het besluit aan u is meegedeeld.

Wat betekent dat de envelop ertoe doet. Of de e-mail. Bewaar hem, met de datum erop, want die datum is uw startstreep en geen andere. Mensen gooien zulke dingen voortdurend weg en kunnen dan niet meer aantonen wanneer hun venster openging.

Eén voorwaarde om te controleren voordat u iets plant, want die verrast mensen: om een besluit aan te vechten moet u doorgaans bij zijn met de bijdragen, of het betwiste bedrag eerst bij de rechtbank hebben gestort.

De termijnen, de artikelen waar ze vandaan komen, en wat u moet verzamelen zolang het nog kan, staan hier allemaal:

{link}`,
  },
},
{
  key: 'builder-quote-red-flags',
  tool: 'contractor-check',
  kind: 'story',
  rules: [],
  text: {
    en: `I spent a while reading through building jobs that went badly, expecting to find bad builders. Mostly I found bad quotes.

And not wrong ones. Missing ones. The trouble was almost always something the piece of paper didn't say.

No start date and no finish date. No payment schedule tied to stages, so the money goes out on trust. Nothing about who applies for the licence. Nothing about what happens to the rubble. No mention of the sign off certificate or its date, which is the date every guarantee period counts from, so you've lost your starting line before you've begun. And a single total with no breakdown, which means when the extras turn up there's nothing to compare them against.

None of that looks alarming on its own. That's the point. Put together it's a quote that's left every expensive question open, and open questions get answered later by whoever is holding the money.

So I turned it into twelve questions you can answer from the paper in front of you. It gives you a count of what's missing and the exact wording to send back, in English and in Spanish, so you're not translating a difficult conversation while you're having it.

{link}`,
    no: `Jeg brukte en stund på å lese gjennom byggejobber som gikk galt, og ventet å finne dårlige håndverkere. Stort sett fant jeg dårlige tilbud.

Og ikke feil tilbud. Manglende. Problemet var nesten alltid noe arket ikke sa.

Ingen startdato og ingen sluttdato. Ingen betalingsplan knyttet til faser, så pengene går ut på tillit. Ingenting om hvem som søker om tillatelsen. Ingenting om hva som skjer med riveavfallet. Ingen omtale av ferdigattesten eller datoen på den, som er datoen alle garantiperioder løper fra, så du har mistet startstreken før du har begynt. Og én totalsum uten oppdeling, som betyr at når tilleggene dukker opp finnes det ingenting å sammenligne dem med.

Ingenting av dette ser alarmerende ut alene. Det er nettopp poenget. Til sammen er det et tilbud som har latt hvert eneste dyre spørsmål stå åpent, og åpne spørsmål blir besvart senere av den som sitter på pengene.

Så jeg gjorde det om til tolv spørsmål du kan svare på fra arket foran deg. Den teller opp hva som mangler og gir deg den eksakte ordlyden å sende tilbake, på engelsk og på spansk, så du slipper å oversette en vanskelig samtale mens du har den.

{link}`,
    sv: `Jag ägnade ett tag åt att läsa igenom byggjobb som gick illa, och väntade mig att hitta dåliga byggare. Mest hittade jag dåliga offerter.

Och inte felaktiga. Ofullständiga. Problemet var nästan alltid något pappret inte sa.

Inget startdatum och inget slutdatum. Ingen betalningsplan kopplad till etapper, så pengarna går ut på förtroende. Inget om vem som söker bygglovet. Inget om vad som händer med rivningsmassorna. Ingen nämnd av slutbeskedet eller dess datum, som är det datum varje garantitid räknas från, så du har tappat startlinjen innan du börjat. Och en enda totalsumma utan uppdelning, vilket betyder att när tilläggen dyker upp finns inget att jämföra dem med.

Inget av det ser alarmerande ut för sig. Det är just poängen. Tillsammans är det en offert som lämnat varje dyr fråga öppen, och öppna frågor besvaras senare av den som håller i pengarna.

Så jag gjorde om det till tolv frågor du kan besvara utifrån pappret framför dig. Den räknar vad som saknas och ger dig den exakta formuleringen att skicka tillbaka, på engelska och på spanska, så du slipper översätta ett svårt samtal medan du har det.

{link}`,
    de: `Ich habe eine Weile schiefgegangene Bauvorhaben durchgelesen und erwartet, schlechte Handwerker zu finden. Gefunden habe ich vor allem schlechte Angebote.

Und zwar nicht falsche. Unvollständige. Das Problem war fast immer etwas, das auf dem Blatt nicht stand.

Kein Anfangs- und kein Endtermin. Kein an Bauabschnitte gekoppelter Zahlungsplan, das Geld geht also auf Vertrauen hinaus. Nichts dazu, wer die Genehmigung beantragt. Nichts dazu, was mit dem Bauschutt passiert. Keine Erwähnung der Abnahmebescheinigung oder ihres Datums, und das ist das Datum, ab dem jede Gewährleistungsfrist zählt, Sie haben Ihre Startlinie also verloren, bevor es losging. Und eine einzige Gesamtsumme ohne Aufschlüsselung, was heißt: wenn die Nachträge kommen, gibt es nichts zum Vergleichen.

Nichts davon wirkt für sich alarmierend. Genau das ist der Punkt. Zusammen ist es ein Angebot, das jede teure Frage offengelassen hat, und offene Fragen beantwortet später derjenige, der das Geld hält.

Also habe ich daraus zwölf Fragen gemacht, die Sie vom Blatt vor sich beantworten können. Sie zählt, was fehlt, und gibt Ihnen den genauen Wortlaut für die Rückfrage, auf Englisch und auf Spanisch, damit Sie ein schwieriges Gespräch nicht übersetzen müssen, während Sie es führen.

{link}`,
    fr: `J'ai passé un moment à lire des chantiers qui avaient mal tourné, en m'attendant à trouver de mauvais artisans. J'ai surtout trouvé de mauvais devis.

Et pas des devis faux. Des devis incomplets. Le problème était presque toujours quelque chose que la feuille ne disait pas.

Pas de date de début ni de date de fin. Pas d'échéancier adossé aux étapes, donc l'argent part sur la confiance. Rien sur qui demande le permis. Rien sur le sort des gravats. Aucune mention du certificat de réception ni de sa date, qui est pourtant la date d'où part chaque garantie : vous avez perdu votre ligne de départ avant même de commencer. Et un total unique sans détail, ce qui veut dire que quand les suppléments arrivent, il n'y a rien à comparer.

Rien de tout cela n'est alarmant isolément. C'est justement le point. Ensemble, c'est un devis qui a laissé ouverte chaque question coûteuse, et les questions ouvertes sont tranchées plus tard par celui qui tient l'argent.

J'en ai donc fait douze questions auxquelles vous répondez à partir de la feuille devant vous. Elle compte ce qui manque et vous donne la formulation exacte à renvoyer, en anglais et en espagnol, pour ne pas traduire une conversation difficile pendant que vous la menez.

{link}`,
    nl: `Ik heb een tijd bouwklussen doorgelezen die misgingen, en verwachtte slechte aannemers te vinden. Vooral vond ik slechte offertes.

En niet foute. Onvolledige. Het probleem was bijna altijd iets dat het papier niet zei.

Geen begindatum en geen einddatum. Geen betalingsschema gekoppeld aan fases, dus het geld gaat op vertrouwen de deur uit. Niets over wie de vergunning aanvraagt. Niets over wat er met het puin gebeurt. Geen vermelding van het opleveringscertificaat of de datum ervan, en dat is de datum waarvandaan elke garantietermijn telt, dus u bent uw startstreep kwijt voordat u begonnen bent. En één totaalbedrag zonder specificatie, wat betekent dat er niets is om het meerwerk mee te vergelijken als het opduikt.

Niets daarvan oogt op zichzelf alarmerend. Dat is precies het punt. Samen is het een offerte die elke dure vraag open heeft gelaten, en open vragen worden later beantwoord door wie het geld vasthoudt.

Dus maakte ik er twaalf vragen van die u vanaf het papier voor u kunt beantwoorden. Hij telt wat ontbreekt en geeft u de exacte formulering om terug te sturen, in het Engels en in het Spaans, zodat u een lastig gesprek niet hoeft te vertalen terwijl u het voert.

{link}`,
  },
},
{
  key: 'what-a-year-actually-costs',
  tool: 'cost-audit',
  kind: 'story',
  rules: [],
  text: {
    en: `Ask anyone what their place in Spain cost to buy and they'll tell you to the euro. Ask what it costs to keep and almost nobody can answer without going and looking.

That isn't carelessness. It's arithmetic that's been deliberately scattered.

The costs arrive one at a time, at different points in the year, sometimes in different currencies, from six or seven different places. Account charges. The standing charge on the electricity, which runs whether anyone's there or not. Water. Insurance. The community fee. IBI. The gestoria. On its own, not one of them is worth a morning of anyone's attention, so not one of them gets it. And that's exactly how a few hundred euros a year goes unnoticed for a decade.

So I built a page that puts the whole year in one column. You put in what you actually pay, line by line, and it shows you the total, and where that total sits next to what the same kind of property usually costs.

It isn't there to make anyone feel bad about a number. It's that you can't decide whether a cost is worth paying until you can see it standing next to the others.

{link}`,
    no: `Spør hvem som helst hva boligen i Spania kostet å kjøpe, og de svarer deg på euroen. Spør hva den koster å ha, og nesten ingen kan svare uten å gå og se etter.

Det er ikke slurv. Det er regnestykker som er blitt spredt med vilje.

Kostnadene kommer én om gangen, på ulike tidspunkt i året, noen ganger i ulike valutaer, fra seks eller sju forskjellige steder. Kontogebyrer. Fastleddet på strømmen, som løper enten noen er der eller ikke. Vann. Forsikring. Fellesutgifter. IBI. Gestoria. Alene er ingen av dem verdt en formiddag av noens oppmerksomhet, så ingen av dem får det. Og det er nøyaktig slik noen hundre euro i året går upåaktet hen i ti år.

Så jeg bygde en side som setter hele året i én kolonne. Du legger inn det du faktisk betaler, post for post, og den viser deg totalen, og hvor den totalen ligger ved siden av det samme type bolig vanligvis koster.

Den er ikke der for å få noen til å føle seg dårlig over et tall. Den er der fordi du ikke kan avgjøre om en kostnad er verdt å betale før du ser den stå ved siden av de andre.

{link}`,
    sv: `Fråga vem som helst vad bostaden i Spanien kostade att köpa, så svarar de på euron. Fråga vad den kostar att ha, och nästan ingen kan svara utan att gå och kolla.

Det är inte slarv. Det är räkneuppgifter som spridits ut med flit.

Kostnaderna kommer en i taget, vid olika tidpunkter på året, ibland i olika valutor, från sex eller sju olika håll. Kontoavgifter. Den fasta elavgiften, som löper oavsett om någon är där. Vatten. Försäkring. Samfällighetsavgiften. IBI. Gestorian. Var för sig är ingen av dem värd en förmiddag av någons uppmärksamhet, så ingen får det. Och det är precis så några hundra euro om året går obemärkt i tio år.

Så jag byggde en sida som lägger hela året i en kolumn. Du fyller i vad du faktiskt betalar, rad för rad, och den visar totalen, och var den totalen ligger bredvid vad samma sorts bostad brukar kosta.

Den finns inte för att få någon att må dåligt över en siffra. Den finns för att du inte kan avgöra om en kostnad är värd att betala förrän du ser den stå bredvid de andra.

{link}`,
    de: `Fragen Sie irgendwen, was die Immobilie in Spanien im Kauf gekostet hat, und Sie bekommen die Antwort auf den Euro genau. Fragen Sie, was sie im Unterhalt kostet, und fast niemand kann antworten, ohne erst nachzusehen.

Das ist keine Nachlässigkeit. Das ist Rechnerei, die absichtlich verstreut wurde.

Die Kosten kommen einzeln, zu verschiedenen Zeitpunkten im Jahr, manchmal in verschiedenen Währungen, aus sechs oder sieben Richtungen. Kontoentgelte. Der Grundpreis beim Strom, der läuft, ob jemand da ist oder nicht. Wasser. Versicherung. Das Hausgeld. IBI. Die gestoria. Für sich genommen ist keine davon einen Vormittag Aufmerksamkeit wert, also bekommt keine einen. Und genau so bleiben ein paar hundert Euro im Jahr zehn Jahre lang unbemerkt.

Also habe ich eine Seite gebaut, die das ganze Jahr in eine Spalte legt. Sie tragen ein, was Sie tatsächlich zahlen, Posten für Posten, und sie zeigt Ihnen die Summe, und wo diese Summe im Vergleich zu dem liegt, was dieselbe Art Immobilie üblicherweise kostet.

Sie ist nicht da, um jemandem wegen einer Zahl ein schlechtes Gefühl zu machen. Sie ist da, weil man nicht entscheiden kann, ob eine Kostenposition ihr Geld wert ist, solange man sie nicht neben den anderen stehen sieht.

{link}`,
    fr: `Demandez à n'importe qui ce que son bien en Espagne a coûté à l'achat et il vous répondra à l'euro près. Demandez ce qu'il coûte à garder et presque personne ne peut répondre sans aller vérifier.

Ce n'est pas de la négligence. C'est un calcul qu'on a délibérément éparpillé.

Les coûts arrivent un par un, à des moments différents de l'année, parfois dans des devises différentes, depuis six ou sept endroits différents. Les frais de compte. L'abonnement électrique, qui court que quelqu'un soit là ou non. L'eau. L'assurance. Les charges. L'IBI. Le gestoria. Pris isolément, aucun ne mérite une matinée d'attention, donc aucun n'en reçoit. Et c'est exactement comme ça que quelques centaines d'euros par an passent inaperçus pendant dix ans.

Alors j'ai fait une page qui met l'année entière dans une seule colonne. Vous saisissez ce que vous payez réellement, ligne par ligne, et elle vous montre le total, et où ce total se situe à côté de ce que coûte habituellement le même type de bien.

Elle n'est pas là pour faire culpabiliser sur un chiffre. Elle est là parce qu'on ne peut pas décider si une dépense vaut la peine avant de la voir posée à côté des autres.

{link}`,
    nl: `Vraag wie dan ook wat zijn woning in Spanje kostte om te kopen en u krijgt het antwoord tot op de euro. Vraag wat hij kost om te houden en bijna niemand kan antwoorden zonder het op te zoeken.

Dat is geen slordigheid. Het is rekenwerk dat bewust is uitgesmeerd.

De kosten komen één voor één, op verschillende momenten in het jaar, soms in verschillende valuta, uit zes of zeven verschillende hoeken. Rekeningkosten. Het vastrecht op de stroom, dat doorloopt of er nu iemand is of niet. Water. Verzekering. De VvE-bijdrage. IBI. De gestoria. Op zichzelf is geen ervan een ochtend aandacht waard, dus krijgt geen ervan die. En precies zo blijven een paar honderd euro per jaar tien jaar lang onopgemerkt.

Dus bouwde ik een pagina die het hele jaar in één kolom zet. U vult in wat u werkelijk betaalt, regel voor regel, en hij toont u het totaal, en waar dat totaal staat naast wat hetzelfde soort woning normaal kost.

Hij is er niet om iemand een rotgevoel te geven over een bedrag. Hij is er omdat u niet kunt bepalen of een kostenpost het waard is voordat u hem naast de andere ziet staan.

{link}`,
  },
},
{
  key: 'leaving-it-empty',
  tool: 'closing-up',
  kind: 'story',
  rules: ['squat.second_home_is_morada'],
  text: {
    en: `Every autumn, the same question turns up in these groups. What do I actually need to do before I lock up for the winter?

There's a long answer and a short one, and the short one depends on three things almost nobody gets asked about. How long you'll be away. What time of year it is. And whether anyone is going to look in while you're gone. Those three change the list far more than the size of the place does.

One thing worth saying plainly, because it comes up in every single one of these conversations and usually with a lot of worry attached: under Spanish law a second home or a seasonal home does count as a morada, provided the people entitled to be there carry on their private life there, even occasionally. That's a considerably more reassuring position than most owners abroad assume they're in.

The checklist takes those three answers and gives you a dated list for the last day, rather than a generic one you have to sit and filter yourself.

{link}

If yours is somewhere with a pool, do it before the water goes cold. Trust me on that one.`,
    no: `Hver høst dukker det samme spørsmålet opp i disse gruppene. Hva må jeg egentlig gjøre før jeg låser for vinteren?

Det finnes et langt svar og et kort, og det korte avhenger av tre ting nesten ingen blir spurt om. Hvor lenge du blir borte. Hvilken årstid det er. Og om noen kommer til å se innom mens du er borte. De tre endrer listen langt mer enn størrelsen på stedet gjør.

Én ting er verdt å si rett ut, for den kommer opp i hver eneste av disse samtalene, og som regel med mye bekymring festet til seg: etter spansk rett regnes en sekundærbolig eller en sesongbolig som en morada, forutsatt at de som har rett til å være der lever sitt privatliv der, om enn leilighetsvis. Det er en betydelig mer betryggende posisjon enn de fleste eiere i utlandet tror de står i.

Sjekklisten tar de tre svarene og gir deg en datert liste for den siste dagen, i stedet for en generisk en du selv må sitte og sile.

{link}

Har du basseng, gjør det før vannet blir kaldt. Stol på meg der.`,
    sv: `Varje höst dyker samma fråga upp i de här grupperna. Vad behöver jag egentligen göra innan jag låser för vintern?

Det finns ett långt svar och ett kort, och det korta beror på tre saker nästan ingen får frågan om. Hur länge du är borta. Vilken årstid det är. Och om någon kommer att titta till stället medan du är borta. De tre ändrar listan långt mer än bostadens storlek gör.

En sak är värd att säga rakt ut, för den kommer upp i vartenda sådant samtal, och oftast med mycket oro fäst vid sig: enligt spansk rätt räknas en andrabostad eller en säsongsbostad som en morada, förutsatt att de som har rätt att vara där lever sitt privatliv där, om än tillfälligt. Det är ett betydligt tryggare läge än de flesta ägare utomlands tror att de befinner sig i.

Checklistan tar de tre svaren och ger dig en daterad lista för sista dagen, i stället för en generisk som du själv får sitta och sålla i.

{link}

Har du pool, gör det innan vattnet blir kallt. Lita på mig där.`,
    de: `Jeden Herbst taucht in diesen Gruppen dieselbe Frage auf. Was muss ich eigentlich tun, bevor ich für den Winter abschließe?

Es gibt eine lange und eine kurze Antwort, und die kurze hängt an drei Dingen, nach denen fast niemand gefragt wird. Wie lange Sie weg sind. Welche Jahreszeit es ist. Und ob jemand nach dem Rechten sieht, während Sie fort sind. Diese drei verändern die Liste weit stärker als die Größe der Immobilie.

Eines lohnt es, klar zu sagen, weil es in jedem einzelnen dieser Gespräche aufkommt, meist mit viel Sorge im Schlepptau: nach spanischem Recht gilt eine Zweitwohnung oder eine Saisonwohnung sehr wohl als morada, sofern die Berechtigten dort ihr Privatleben führen, und sei es gelegentlich. Das ist eine deutlich beruhigendere Lage, als die meisten Eigentümer im Ausland annehmen.

Die Checkliste nimmt diese drei Antworten und gibt Ihnen eine datierte Liste für den letzten Tag, statt einer allgemeinen, die Sie selbst durchsieben müssen.

{link}

Wenn ein Pool dazugehört, machen Sie es, bevor das Wasser kalt wird. Da können Sie mir glauben.`,
    fr: `Chaque automne, la même question revient dans ces groupes. Qu'est-ce qu'il faut vraiment faire avant de fermer pour l'hiver ?

Il y a une réponse longue et une courte, et la courte dépend de trois choses sur lesquelles presque personne n'est interrogé. Combien de temps vous serez absent. La saison. Et si quelqu'un passera jeter un œil pendant votre absence. Ces trois-là changent la liste bien plus que la taille du bien.

Une chose mérite d'être dite franchement, parce qu'elle revient dans chacune de ces conversations, en général avec beaucoup d'inquiétude accrochée : en droit espagnol, une résidence secondaire ou saisonnière est bien une morada, dès lors que ceux qui ont le droit d'y être y mènent leur vie privée, même de temps en temps. C'est une position nettement plus rassurante que ce que supposent la plupart des propriétaires à l'étranger.

La liste prend ces trois réponses et vous donne une liste datée pour le dernier jour, plutôt qu'une liste générique que vous devez filtrer vous-même.

{link}

Si vous avez une piscine, faites-le avant que l'eau refroidisse. Croyez-moi là-dessus.`,
    nl: `Elk najaar duikt dezelfde vraag op in deze groepen. Wat moet ik eigenlijk doen voordat ik voor de winter afsluit?

Er is een lang antwoord en een kort, en het korte hangt af van drie dingen waar bijna niemand naar wordt gevraagd. Hoe lang u weg bent. Welk seizoen het is. En of er iemand gaat kijken terwijl u weg bent. Die drie veranderen de lijst veel meer dan de grootte van de woning doet.

Eén ding is het waard om ronduit te zeggen, want het komt in elk van deze gesprekken op, meestal met veel zorg eraan vast: naar Spaans recht telt een tweede woning of een seizoenswoning wel degelijk als een morada, mits degenen die er mogen zijn er hun privéleven leiden, al is het af en toe. Dat is een aanzienlijk geruststellender positie dan de meeste eigenaren in het buitenland aannemen.

De checklist neemt die drie antwoorden en geeft u een gedateerde lijst voor de laatste dag, in plaats van een algemene die u zelf moet zitten uitfilteren.

{link}

Heeft u een zwembad, doe het voordat het water koud wordt. Geloof me daarin.`,
  },
},
{
  key: 'utilities-in-order',
  tool: 'utility-setup',
  kind: 'informative',
  rules: ['nie.form', 'nie.fee'],
  text: {
    en: `Getting the power and water on in a Spanish property isn't one job. It's five, and two of them can't start until something else has finished.

Electricity, water, gas, internet and the council charge. Five offices, five forms, five document lists, and no one of them tells you about the other four.

The order is what costs people weeks. Start the wrong one first and you wait, find out it can't proceed, and start it again from the beginning.

Two small things that save a lot of confusion right at the front of it, because this is where people get sent home. The NIE application is the EX-15. The EX-18 is the EU citizen registration certificate and is a completely different procedure, so turning up with the wrong one is common and it costs you the morning. And the fee for assigning a NIE is 9.84 euros, which is worth knowing before someone quotes you something else.

The page asks six questions about your situation and gives you the order the five have to happen in, with the documents each one needs.

{link}`,
    no: `Å få strøm og vann på plass i en spansk bolig er ikke én jobb. Det er fem, og to av dem kan ikke starte før noe annet er ferdig.

Strøm, vann, gass, internett og den kommunale avgiften. Fem kontorer, fem skjemaer, fem dokumentlister, og ingen av dem forteller deg om de fire andre.

Rekkefølgen er det som koster folk uker. Start med feil, og du venter, får vite at den ikke kan gå videre, og starter på nytt fra begynnelsen.

To små ting som sparer mye forvirring helt i starten, for det er her folk blir sendt hjem. NIE-søknaden er EX-15. EX-18 er registreringsbeviset for EU-borgere og er en helt annen prosedyre, så det er vanlig å møte opp med feil skjema, og det koster deg formiddagen. Og gebyret for tildeling av NIE er 9,84 euro, verdt å vite før noen oppgir deg noe annet.

Siden stiller seks spørsmål om situasjonen din og gir deg rekkefølgen de fem må skje i, med dokumentene hver av dem trenger.

{link}`,
    sv: `Att få igång el och vatten i en spansk bostad är inte ett jobb. Det är fem, och två av dem kan inte börja förrän något annat är klart.

El, vatten, gas, internet och den kommunala avgiften. Fem kontor, fem blanketter, fem dokumentlistor, och inget av dem berättar om de andra fyra.

Ordningen är det som kostar folk veckor. Börja med fel, så väntar du, får veta att den inte kan gå vidare, och börjar om från början.

Två små saker som sparar mycket förvirring alldeles i början, för det är här folk blir hemskickade. NIE-ansökan är EX-15. EX-18 är registreringsbeviset för EU-medborgare och är en helt annan procedur, så att dyka upp med fel blankett är vanligt och kostar dig förmiddagen. Och avgiften för tilldelning av NIE är 9,84 euro, värt att veta innan någon uppger något annat.

Sidan ställer sex frågor om din situation och ger dig ordningen de fem måste ske i, med dokumenten var och en behöver.

{link}`,
    de: `Strom und Wasser in einer spanischen Immobilie anzumelden ist nicht eine Aufgabe. Es sind fünf, und zwei davon können nicht beginnen, bevor etwas anderes fertig ist.

Strom, Wasser, Gas, Internet und die kommunale Abgabe. Fünf Ämter, fünf Formulare, fünf Dokumentenlisten, und keines erzählt Ihnen von den anderen vier.

Die Reihenfolge kostet die Leute Wochen. Fangen Sie mit dem Falschen an, warten Sie, erfahren, dass es so nicht weitergeht, und fangen von vorn an.

Zwei Kleinigkeiten, die ganz am Anfang viel Verwirrung ersparen, denn hier werden die Leute nach Hause geschickt. Der NIE-Antrag ist das EX-15. Das EX-18 ist die Anmeldebescheinigung für EU-Bürger und ein völlig anderes Verfahren, mit dem falschen Formular anzukommen ist häufig und kostet Sie den Vormittag. Und die Gebühr für die Zuteilung einer NIE beträgt 9,84 Euro, gut zu wissen, bevor Ihnen jemand etwas anderes nennt.

Die Seite stellt sechs Fragen zu Ihrer Lage und gibt Ihnen die Reihenfolge, in der die fünf ablaufen müssen, mit den Unterlagen, die jede braucht.

{link}`,
    fr: `Mettre l'électricité et l'eau en service dans un bien espagnol, ce n'est pas une démarche. C'en est cinq, et deux d'entre elles ne peuvent pas commencer tant qu'autre chose n'est pas terminé.

Électricité, eau, gaz, internet et la taxe communale. Cinq guichets, cinq formulaires, cinq listes de pièces, et aucun ne vous parle des quatre autres.

C'est l'ordre qui coûte des semaines. Commencez par la mauvaise, vous attendez, on vous apprend qu'elle ne peut pas avancer, et vous recommencez du début.

Deux petites choses qui évitent beaucoup de confusion tout au début, parce que c'est là qu'on renvoie les gens chez eux. La demande de NIE, c'est l'EX-15. L'EX-18 est le certificat d'enregistrement des citoyens de l'UE et relève d'une procédure entièrement différente : se présenter avec le mauvais imprimé est courant et vous coûte la matinée. Et la taxe pour l'attribution d'un NIE est de 9,84 euros, bon à savoir avant qu'on vous annonce autre chose.

La page pose six questions sur votre situation et vous donne l'ordre dans lequel les cinq doivent se dérouler, avec les documents que chacune demande.

{link}`,
    nl: `Stroom en water aansluiten in een Spaanse woning is niet één klus. Het zijn er vijf, en twee daarvan kunnen pas beginnen als iets anders klaar is.

Stroom, water, gas, internet en de gemeentelijke heffing. Vijf loketten, vijf formulieren, vijf documentenlijsten, en geen van alle vertelt u over de andere vier.

De volgorde is wat mensen weken kost. Begin met de verkeerde en u wacht, hoort dat het zo niet verder kan, en begint opnieuw vanaf het begin.

Twee kleine dingen die helemaal vooraan veel verwarring besparen, want hier worden mensen naar huis gestuurd. De NIE-aanvraag is de EX-15. De EX-18 is het registratiebewijs voor EU-burgers en is een heel andere procedure, dus met het verkeerde formulier komen opdagen gebeurt vaak en kost u de ochtend. En de leges voor toekenning van een NIE zijn 9,84 euro, goed om te weten voordat iemand u iets anders noemt.

De pagina stelt zes vragen over uw situatie en geeft u de volgorde waarin de vijf moeten gebeuren, met de documenten die elk ervan nodig heeft.

{link}`,
  },
},
{
  key: 'tradesperson-in-your-language',
  tool: 'spain-directory',
  kind: 'story',
  rules: [],
  text: {
    en: `Here's a pattern I keep seeing in this group and every group like it.

Someone needs a plumber. Twenty people reply with a name. And not one of the twenty answers the thing the person actually needs to know, which is whether they'll be able to make themselves understood on the phone when there's water coming through the ceiling.

Recommendations are personal, and they don't travel. The plumber who's brilliant for someone who speaks Spanish isn't necessarily the right call for someone who doesn't, and the moment you find that out is the worst possible moment.

So I built a directory that sorts on exactly that. Plumber, electrician, locksmith, air conditioning, pool service, builder, across 660 Spanish towns, ranked from Google reviews, with the ones already reviewed in your own language coming first. You say what language you need help in and the page reorders itself.

It's free, there's no listing fee, and nobody pays to sit higher up. If your town looks thin, or something's out of date, tell me and I'll go and look at it.

{link}`,
    no: `Her er et mønster jeg stadig ser i denne gruppen og alle grupper som den.

Noen trenger en rørlegger. Tjue personer svarer med et navn. Og ikke én av de tjue svarer på det personen faktisk trenger å vite, nemlig om de kommer til å gjøre seg forstått på telefonen når det renner vann gjennom taket.

Anbefalinger er personlige, og de lar seg ikke flytte. Rørleggeren som er strålende for en som snakker spansk er ikke nødvendigvis riktig samtale for en som ikke gjør det, og øyeblikket du finner det ut på er det verst tenkelige.

Så jeg bygde en katalog som sorterer på nøyaktig det. Rørlegger, elektriker, låsesmed, klimaanlegg, bassengservice, byggmester, i 660 spanske byer, rangert fra Google-anmeldelser, med de som allerede er vurdert på ditt eget språk først. Du sier hvilket språk du trenger hjelp på, og siden sorterer seg om.

Den er gratis, det er ingen oppføringsavgift, og ingen betaler for å ligge høyere. Ser byen din tynn ut, eller er noe utdatert, si fra så går jeg og ser på det.

{link}`,
    sv: `Här är ett mönster jag ser om och om igen i den här gruppen och alla grupper som den.

Någon behöver en rörmokare. Tjugo personer svarar med ett namn. Och inte en av de tjugo svarar på det personen faktiskt behöver veta, nämligen om de kommer att göra sig förstådda i telefon när det rinner vatten genom taket.

Rekommendationer är personliga, och de går inte att flytta. Rörmokaren som är lysande för någon som talar spanska är inte nödvändigtvis rätt samtal för någon som inte gör det, och stunden du får veta det är den sämsta tänkbara.

Så jag byggde en katalog som sorterar på precis det. Rörmokare, elektriker, låssmed, luftkonditionering, poolservice, byggare, i 660 spanska orter, rankade utifrån Google-omdömen, med dem som redan är omdömda på ditt eget språk först. Du säger vilket språk du behöver hjälp på och sidan sorterar om sig.

Den är gratis, det finns ingen listningsavgift, och ingen betalar för att ligga högre. Ser din ort tunn ut, eller är något inaktuellt, säg till så går jag och tittar.

{link}`,
    de: `Hier ist ein Muster, das mir in dieser Gruppe und in jeder Gruppe wie ihr immer wieder begegnet.

Jemand braucht einen Installateur. Zwanzig Leute antworten mit einem Namen. Und nicht einer der zwanzig beantwortet das, was die Person wirklich wissen muss, nämlich ob sie sich am Telefon verständlich machen kann, wenn Wasser durch die Decke läuft.

Empfehlungen sind persönlich, und sie lassen sich nicht übertragen. Der Installateur, der für jemanden mit Spanisch großartig ist, ist nicht zwangsläufig der richtige Anruf für jemanden ohne, und der Moment, in dem man das herausfindet, ist der denkbar schlechteste.

Also habe ich ein Verzeichnis gebaut, das genau danach sortiert. Installateur, Elektriker, Schlüsseldienst, Klimatechnik, Poolservice, Bauunternehmer, in 660 spanischen Orten, nach Google-Bewertungen gereiht, mit denen zuerst, die bereits in Ihrer Sprache bewertet wurden. Sie sagen, in welcher Sprache Sie Hilfe brauchen, und die Seite ordnet sich um.

Sie ist kostenlos, es gibt keine Eintragsgebühr, und niemand zahlt dafür, weiter oben zu stehen. Wirkt Ihr Ort dünn besetzt oder ist etwas veraltet, sagen Sie Bescheid, dann sehe ich es mir an.

{link}`,
    fr: `Voici un schéma que je vois sans arrêt dans ce groupe et dans tous les groupes du même genre.

Quelqu'un cherche un plombier. Vingt personnes répondent avec un nom. Et pas une des vingt ne répond à ce que la personne a réellement besoin de savoir : est-ce qu'elle arrivera à se faire comprendre au téléphone avec de l'eau qui traverse le plafond.

Les recommandations sont personnelles, et elles ne se transportent pas. Le plombier génial pour quelqu'un qui parle espagnol n'est pas forcément le bon appel pour quelqu'un qui ne le parle pas, et le moment où on l'apprend est le pire possible.

Alors j'ai construit un annuaire qui trie exactement là-dessus. Plombier, électricien, serrurier, climatisation, entretien de piscine, maçon, dans 660 communes espagnoles, classés à partir des avis Google, avec en tête ceux déjà évalués dans votre langue. Vous dites dans quelle langue vous avez besoin d'aide et la page se réorganise.

C'est gratuit, il n'y a pas de frais d'inscription, et personne ne paie pour remonter. Si votre commune paraît vide, ou si quelque chose n'est plus à jour, dites-le-moi et j'irai voir.

{link}`,
    nl: `Hier is een patroon dat ik steeds zie in deze groep en in elke groep zoals deze.

Iemand heeft een loodgieter nodig. Twintig mensen antwoorden met een naam. En geen van de twintig beantwoordt wat die persoon echt moet weten: of ze zich aan de telefoon verstaanbaar kunnen maken terwijl er water door het plafond komt.

Aanbevelingen zijn persoonlijk, en ze laten zich niet verplaatsen. De loodgieter die geweldig is voor iemand die Spaans spreekt, is niet per se het juiste telefoontje voor iemand die dat niet doet, en het moment waarop u daarachter komt is het slechtst denkbare.

Dus bouwde ik een gids die precies daarop sorteert. Loodgieter, elektricien, slotenmaker, airco, zwembadservice, aannemer, in 660 Spaanse plaatsen, gerangschikt op Google-recensies, met bovenaan degenen die al in uw eigen taal zijn beoordeeld. U zegt in welke taal u hulp nodig heeft en de pagina sorteert zichzelf opnieuw.

Hij is gratis, er zijn geen vermeldingskosten, en niemand betaalt om hoger te staan. Ziet uw plaats er mager uit, of is iets verouderd, laat het me weten dan ga ik kijken.

{link}`,
  },
},
{
  key: 'who-does-what',
  tool: 'spain-professionals',
  kind: 'informative',
  rules: [],
  text: {
    en: `Four Spanish job titles that get used as if they meant the same thing. They don't, and picking the wrong one usually costs you a fortnight rather than money.

An abogado is a lawyer and runs the case. A gestoria handles filings and paperwork and does not go to court. An administrador de fincas runs the community of owners, its accounts and its meetings. A procurador represents you procedurally in front of the court, alongside your abogado.

What actually happens when you get it wrong is this. You explain the whole situation to someone who was never the right person for it, they're polite about it, and then you explain the whole situation again to somebody else a week later.

There's a second layer too. Estate agent, architect, valuer, insurance broker, sworn translator. All of them turn up in a property problem, and each one does something narrow and specific.

So the page explains what each of them actually does before it shows you a single name. Then it ranks your town, with the ones already reviewed in your language first.

{link}`,
    no: `Fire spanske yrkestitler som brukes som om de betydde det samme. Det gjør de ikke, og å velge feil koster deg som regel fjorten dager, ikke penger.

En abogado er advokat og fører saken. En gestoria tar seg av innleveringer og papirarbeid og går ikke i retten. En administrador de fincas driver sameiet, regnskapet og møtene. En procurador representerer deg prosessuelt for domstolen, ved siden av advokaten din.

Det som faktisk skjer når du bommer, er dette. Du forklarer hele situasjonen til en som aldri var rett person for den, vedkommende er høflig om det, og så forklarer du hele situasjonen på nytt til en annen en uke senere.

Det finnes et lag til. Eiendomsmegler, arkitekt, takstmann, forsikringsmegler, statsautorisert translatør. Alle dukker opp i et eiendomsproblem, og hver av dem gjør noe smalt og bestemt.

Så siden forklarer hva hver av dem faktisk gjør før den viser deg et eneste navn. Deretter rangerer den byen din, med de som allerede er vurdert på ditt språk først.

{link}`,
    sv: `Fyra spanska yrkestitlar som används som om de betydde samma sak. Det gör de inte, och att välja fel kostar dig oftast fjorton dagar, inte pengar.

En abogado är advokat och driver ärendet. En gestoria sköter inlämningar och pappersarbete och går inte i rätten. En administrador de fincas driver samfälligheten, dess räkenskaper och dess stämmor. En procurador företräder dig processuellt inför domstolen, vid sidan av din advokat.

Det som faktiskt händer när du missar är det här. Du förklarar hela situationen för någon som aldrig var rätt person, den är artig om saken, och sedan förklarar du hela situationen igen för någon annan en vecka senare.

Det finns ett lager till. Mäklare, arkitekt, värderingsman, försäkringsmäklare, auktoriserad translator. Alla dyker upp i ett fastighetsproblem, och var och en gör något smalt och bestämt.

Så sidan förklarar vad var och en faktiskt gör innan den visar dig ett enda namn. Sedan rankar den din ort, med dem som redan är omdömda på ditt språk först.

{link}`,
    de: `Vier spanische Berufsbezeichnungen, die benutzt werden, als bedeuteten sie dasselbe. Tun sie nicht, und die falsche zu wählen kostet Sie meist zwei Wochen, nicht Geld.

Ein abogado ist Anwalt und führt den Fall. Eine gestoria erledigt Anmeldungen und Papierkram und geht nicht vor Gericht. Ein administrador de fincas führt die Eigentümergemeinschaft, ihre Abrechnung und ihre Versammlungen. Ein procurador vertritt Sie verfahrensrechtlich vor Gericht, neben Ihrem Anwalt.

Was tatsächlich passiert, wenn man danebengreift, ist Folgendes. Sie schildern die ganze Lage jemandem, der nie der Richtige dafür war, er ist höflich dabei, und eine Woche später schildern Sie die ganze Lage noch einmal jemand anderem.

Es gibt noch eine zweite Ebene. Makler, Architekt, Gutachter, Versicherungsmakler, beeidigter Übersetzer. Alle tauchen in einem Immobilienproblem auf, und jeder macht etwas Enges und Bestimmtes.

Die Seite erklärt daher, was jeder von ihnen tatsächlich tut, bevor sie Ihnen einen einzigen Namen zeigt. Danach reiht sie Ihren Ort, mit denen zuerst, die bereits in Ihrer Sprache bewertet wurden.

{link}`,
    fr: `Quatre intitulés espagnols employés comme s'ils voulaient dire la même chose. Non, et se tromper vous coûte en général quinze jours, pas de l'argent.

Un abogado est avocat et mène le dossier. Un gestoria s'occupe des déclarations et de la paperasse et ne va pas au tribunal. Un administrador de fincas gère la copropriété, ses comptes et ses assemblées. Un procurador vous représente sur le plan procédural devant le tribunal, aux côtés de votre avocat.

Ce qui se passe réellement quand on se trompe, c'est ceci. Vous exposez toute la situation à quelqu'un qui n'était pas la bonne personne, il est poli à ce sujet, et une semaine plus tard vous exposez toute la situation à quelqu'un d'autre.

Il y a une deuxième couche aussi. Agent immobilier, architecte, expert évaluateur, courtier en assurance, traducteur assermenté. Tous apparaissent dans un problème immobilier, et chacun fait quelque chose d'étroit et de précis.

La page explique donc ce que chacun fait réellement avant de vous montrer le moindre nom. Ensuite elle classe votre commune, avec en tête ceux déjà évalués dans votre langue.

{link}`,
    nl: `Vier Spaanse beroepsaanduidingen die worden gebruikt alsof ze hetzelfde betekenen. Dat doen ze niet, en de verkeerde kiezen kost u meestal veertien dagen, geen geld.

Een abogado is advocaat en voert de zaak. Een gestoria doet aangiftes en papierwerk en gaat niet naar de rechtbank. Een administrador de fincas runt de vereniging van eigenaren, de administratie en de vergaderingen. Een procurador vertegenwoordigt u procesrechtelijk voor de rechtbank, naast uw advocaat.

Wat er werkelijk gebeurt als u ernaast zit, is dit. U legt de hele situatie uit aan iemand die er nooit de juiste persoon voor was, die is er beleefd over, en een week later legt u de hele situatie opnieuw uit aan iemand anders.

Er is ook een tweede laag. Makelaar, architect, taxateur, verzekeringsmakelaar, beëdigd vertaler. Ze duiken allemaal op bij een vastgoedprobleem, en elk doet iets smals en specifieks.

Dus legt de pagina uit wat elk van hen werkelijk doet voordat hij u ook maar één naam laat zien. Daarna rangschikt hij uw plaats, met bovenaan degenen die al in uw taal zijn beoordeeld.

{link}`,
  },
},
{
  key: 'maintenance-is-a-year',
  tool: 'maintenance-schedule',
  kind: 'story',
  rules: [],
  text: {
    en: `Took me a while to see this one, and once I did I couldn't unsee it.

Maintenance on a Spanish property isn't a list of jobs. It's a calendar.

Sun, salt and a wet winter break different things, and they break them at different times of year. Do a job in the right month and it prevents something. Do exactly the same job in the wrong month and it's just work you paid for.

And there's a second half to it if you're not there most of the year, which most people reading this aren't. Some of these jobs can't be done by the owner at all, because they have to happen while nobody is in the country. Knowing which ones those are is the difference between a list and a plan you can actually hand to somebody.

So I built it as a twelve month schedule rather than a checklist. Five questions about the property, and every job comes out saying what it prevents and what has to happen while you're away.

{link}`,
    no: `Det tok meg en stund å se denne, og da jeg først gjorde det kunne jeg ikke se den bort igjen.

Vedlikehold på en spansk eiendom er ikke en liste over oppgaver. Det er en kalender.

Sol, salt og en våt vinter ødelegger ulike ting, og de gjør det på ulike tider av året. Gjør en jobb i riktig måned, og den forebygger noe. Gjør nøyaktig samme jobb i feil måned, og det er bare arbeid du har betalt for.

Og det finnes en andre halvdel hvis du ikke er der mesteparten av året, noe de fleste som leser dette ikke er. Noen av disse jobbene kan eieren ikke gjøre i det hele tatt, fordi de må skje mens ingen er i landet. Å vite hvilke det er, er forskjellen mellom en liste og en plan du faktisk kan gi videre til noen.

Så jeg bygde det som et tolvmånedersskjema i stedet for en sjekkliste. Fem spørsmål om eiendommen, og hver jobb kommer ut med hva den forebygger og hva som må skje mens du er borte.

{link}`,
    sv: `Det tog mig ett tag att se den här, och när jag väl gjorde det kunde jag inte sluta se den.

Underhåll på en spansk fastighet är inte en lista över jobb. Det är en kalender.

Sol, salt och en blöt vinter förstör olika saker, och de gör det vid olika tider på året. Gör ett jobb i rätt månad och det förebygger något. Gör exakt samma jobb i fel månad och det är bara arbete du betalat för.

Och det finns en andra halva om du inte är där större delen av året, vilket de flesta som läser det här inte är. Vissa av de här jobben kan ägaren inte göra alls, för de måste ske medan ingen är i landet. Att veta vilka de är är skillnaden mellan en lista och en plan du faktiskt kan lämna över till någon.

Så jag byggde det som ett tolvmånadersschema i stället för en checklista. Fem frågor om fastigheten, och varje jobb kommer ut med vad det förebygger och vad som måste ske medan du är borta.

{link}`,
    de: `Ich habe eine Weile gebraucht, um das zu sehen, und als ich es einmal gesehen hatte, ging es nicht mehr weg.

Instandhaltung an einer spanischen Immobilie ist keine Liste von Arbeiten. Sie ist ein Kalender.

Sonne, Salz und ein nasser Winter zerstören Unterschiedliches, und sie tun es zu unterschiedlichen Zeiten im Jahr. Machen Sie eine Arbeit im richtigen Monat, verhindert sie etwas. Machen Sie genau dieselbe Arbeit im falschen Monat, ist es nur Arbeit, die Sie bezahlt haben.

Und es gibt eine zweite Hälfte, wenn Sie den größten Teil des Jahres nicht dort sind, was auf die meisten, die das lesen, zutrifft. Manche dieser Arbeiten kann der Eigentümer gar nicht selbst erledigen, weil sie stattfinden müssen, während niemand im Land ist. Zu wissen, welche das sind, ist der Unterschied zwischen einer Liste und einem Plan, den man wirklich jemandem in die Hand geben kann.

Also habe ich es als Zwölfmonatsplan gebaut statt als Checkliste. Fünf Fragen zur Immobilie, und jede Arbeit kommt mit dem heraus, was sie verhindert, und dem, was geschehen muss, während Sie weg sind.

{link}`,
    fr: `J'ai mis un moment à voir celle-ci, et une fois vue, impossible de ne plus la voir.

L'entretien d'un bien espagnol n'est pas une liste de travaux. C'est un calendrier.

Le soleil, le sel et un hiver humide abîment des choses différentes, et à des moments différents de l'année. Faites un travail au bon mois et il prévient quelque chose. Faites exactement le même travail au mauvais mois et c'est juste du travail que vous avez payé.

Et il y a une deuxième moitié si vous n'êtes pas sur place la plupart de l'année, ce qui est le cas de la plupart des gens qui lisent ceci. Certains de ces travaux, le propriétaire ne peut pas les faire du tout, parce qu'ils doivent avoir lieu quand personne n'est dans le pays. Savoir lesquels, c'est la différence entre une liste et un plan que vous pouvez réellement confier à quelqu'un.

Je l'ai donc construit comme un calendrier sur douze mois plutôt qu'une checklist. Cinq questions sur le bien, et chaque travail ressort en disant ce qu'il prévient et ce qui doit se passer pendant votre absence.

{link}`,
    nl: `Het duurde even voordat ik dit zag, en toen ik het eenmaal zag kon ik het niet meer ontzien.

Onderhoud aan een Spaanse woning is geen lijst met klussen. Het is een kalender.

Zon, zout en een natte winter slopen verschillende dingen, en ze doen dat op verschillende momenten in het jaar. Doe een klus in de juiste maand en hij voorkomt iets. Doe precies dezelfde klus in de verkeerde maand en het is alleen werk waarvoor u betaald heeft.

En er is een tweede helft als u er het grootste deel van het jaar niet bent, wat voor de meeste lezers hier geldt. Sommige van deze klussen kan de eigenaar helemaal niet zelf doen, omdat ze moeten gebeuren terwijl er niemand in het land is. Weten welke dat zijn is het verschil tussen een lijst en een plan dat u werkelijk aan iemand kunt overdragen.

Dus bouwde ik het als een twaalfmaandsschema in plaats van een checklist. Vijf vragen over de woning, en elke klus komt eruit met wat hij voorkomt en wat er moet gebeuren terwijl u weg bent.

{link}`,
  },
},
{
  key: 'pests-by-property',
  tool: 'pest-plan',
  kind: 'informative',
  rules: [],
  text: {
    en: `Three things about a Spanish property each attract something completely different, and they barely overlap. Warm weather. A garden. Long stretches with nobody in the place.

Which is why the general advice never quite fits anyone. What works for a ground floor flat with a terrace is not the advice for a villa with pines and a pool, and neither of those is the advice for somewhere that stands empty from October to April.

That last one is the one owners abroad underestimate, and I understand why. Nothing gets disturbed, nothing gets noticed, and the first sign of a problem is the one you see when you walk in at Easter. By which point the useful moment to do anything about it was months ago.

The page asks five questions and gives you the pests most likely for your particular property, the signs to look for, what prevents each one, and which ones are honestly not a job for the owner.

That last part matters more than it sounds. Some of these are a phone call, not a Saturday.

{link}`,
    no: `Tre ting ved en spansk eiendom tiltrekker seg hver sin helt ulike ting, og de overlapper knapt. Varmt vær. En hage. Lange strekk uten folk i huset.

Derfor passer de generelle rådene aldri helt for noen. Det som fungerer for en leilighet i første etasje med terrasse er ikke rådet for en villa med furu og basseng, og ingen av dem er rådet for et sted som står tomt fra oktober til april.

Det siste er det eiere i utlandet undervurderer, og jeg skjønner hvorfor. Ingenting blir forstyrret, ingenting blir lagt merke til, og det første tegnet på et problem er det du ser når du går inn i påsken. Og da var det nyttige øyeblikket for å gjøre noe med det måneder siden.

Siden stiller fem spørsmål og gir deg skadedyrene som er mest sannsynlige for akkurat din eiendom, tegnene å se etter, hva som forebygger hver av dem, og hvilke som ærlig talt ikke er en jobb for eieren.

Den siste delen betyr mer enn den høres ut. Noen av disse er en telefonsamtale, ikke en lørdag.

{link}`,
    sv: `Tre saker hos en spansk fastighet drar var sin helt olika sak till sig, och de överlappar knappt. Varmt väder. En trädgård. Långa perioder utan folk i huset.

Därför passar de allmänna råden aldrig riktigt någon. Det som fungerar för en bottenvåning med terrass är inte rådet för en villa med tallar och pool, och inget av dem är rådet för ett ställe som står tomt från oktober till april.

Det sista är det ägare utomlands underskattar, och jag förstår varför. Inget störs, inget märks, och det första tecknet på ett problem är det du ser när du kliver in vid påsk. Och då var det nyttiga ögonblicket att göra något åt det månader sedan.

Sidan ställer fem frågor och ger dig de skadedjur som är mest sannolika för just din fastighet, tecknen att leta efter, vad som förebygger vart och ett, och vilka som ärligt talat inte är ett jobb för ägaren.

Den sista delen betyder mer än den låter. Några av dem är ett telefonsamtal, inte en lördag.

{link}`,
    de: `Drei Dinge an einer spanischen Immobilie ziehen jeweils etwas völlig Verschiedenes an, und sie überschneiden sich kaum. Warmes Wetter. Ein Garten. Lange Strecken, in denen niemand im Haus ist.

Deshalb passen die allgemeinen Ratschläge nie ganz zu irgendjemandem. Was für eine Erdgeschosswohnung mit Terrasse funktioniert, ist nicht der Rat für eine Villa mit Pinien und Pool, und keines von beidem ist der Rat für ein Haus, das von Oktober bis April leer steht.

Das Letzte unterschätzen Eigentümer im Ausland, und ich verstehe warum. Nichts wird gestört, nichts fällt auf, und das erste Anzeichen eines Problems ist das, was Sie sehen, wenn Sie zu Ostern hereinkommen. Und da lag der nützliche Moment, etwas zu tun, Monate zurück.

Die Seite stellt fünf Fragen und nennt Ihnen die für genau Ihre Immobilie wahrscheinlichsten Schädlinge, die Anzeichen, worauf zu achten ist, was jeden davon verhindert, und welche ehrlicherweise keine Aufgabe für den Eigentümer sind.

Der letzte Teil zählt mehr, als er klingt. Einige davon sind ein Telefonat, kein Samstag.

{link}`,
    fr: `Trois choses dans un bien espagnol attirent chacune quelque chose de complètement différent, et elles se recoupent à peine. La chaleur. Un jardin. De longues périodes sans personne dans la maison.

C'est pourquoi les conseils généraux ne conviennent jamais tout à fait à quelqu'un. Ce qui marche pour un rez-de-chaussée avec terrasse n'est pas le conseil pour une villa avec des pins et une piscine, et aucun des deux n'est le conseil pour un logement vide d'octobre à avril.

Ce dernier cas est celui que les propriétaires à l'étranger sous-estiment, et je comprends pourquoi. Rien n'est dérangé, rien n'est remarqué, et le premier signe d'un problème est celui que vous voyez en entrant à Pâques. Alors que le bon moment pour agir remontait à des mois.

La page pose cinq questions et vous donne les nuisibles les plus probables pour votre bien précis, les signes à repérer, ce qui prévient chacun, et ceux qui, honnêtement, ne sont pas un travail de propriétaire.

Cette dernière partie compte plus qu'il n'y paraît. Certains d'entre eux sont un coup de téléphone, pas un samedi.

{link}`,
    nl: `Drie dingen aan een Spaanse woning trekken elk iets totaal anders aan, en ze overlappen nauwelijks. Warm weer. Een tuin. Lange periodes zonder mensen in huis.

Daarom past algemeen advies nooit helemaal bij iemand. Wat werkt voor een benedenwoning met terras is niet het advies voor een villa met pijnbomen en een zwembad, en geen van beide is het advies voor een huis dat van oktober tot april leegstaat.

Dat laatste onderschatten eigenaren in het buitenland, en ik snap waarom. Er wordt niets verstoord, er valt niets op, en het eerste teken van een probleem is wat u ziet als u met Pasen binnenloopt. En dan lag het nuttige moment om er iets aan te doen maanden terug.

De pagina stelt vijf vragen en geeft u de plagen die voor precies uw woning het waarschijnlijkst zijn, de signalen om op te letten, wat elk ervan voorkomt, en welke eerlijk gezegd geen klus voor de eigenaar zijn.

Dat laatste deel telt zwaarder dan het klinkt. Sommige hiervan zijn een telefoontje, geen zaterdag.

{link}`,
  },
},
{
  key: 'pre-2019-mortgage-costs',
  tool: 'mortgage-claim',
  kind: 'informative',
  rules: [],
  text: {
    en: `If you took out a Spanish mortgage somewhere between 2000 and 2019, it's worth digging the file out one evening and actually reading the completion costs. Most people signed those pages without reading them, which is entirely understandable and is also the whole point.

Three things come up again and again in loans from that period. Set up fees charged entirely to the borrower. Floor clauses that stopped the rate falling below a level you never agreed to think about. And insurance sold alongside the loan.

Whether any of that applies to you depends on your deed and your conditions. Not on what happened to somebody else with the same lender, which is how most of these conversations start in groups like this.

And I want to be straight about what a calculator can and can't do here. It can estimate what was charged and what a claim of that type usually covers. It cannot tell you whether a claim is still in time, because that depends on the type of claim and is genuinely contested. That part needs an abogado with your deed in front of them.

What the page is good for is finding out in two minutes whether it's worth asking the question at all.

{link}`,
    no: `Tok du opp et spansk boliglån et sted mellom 2000 og 2019, er det verdt å grave fram mappen en kveld og faktisk lese kostnadene ved opprettelsen. De fleste signerte de sidene uten å lese dem, noe som er helt forståelig, og som også er hele poenget.

Tre ting går igjen og igjen i lån fra den perioden. Etableringsgebyrer belastet låntakeren i sin helhet. Gulvklausuler som hindret renten i å falle under et nivå du aldri gikk med på å tenke over. Og forsikring solgt sammen med lånet.

Om noe av det gjelder deg, avhenger av ditt dokument og dine vilkår. Ikke av hva som skjedde med en annen i samme bank, som er slik de fleste av disse samtalene starter i grupper som denne.

Og jeg vil være ærlig om hva en kalkulator kan og ikke kan her. Den kan anslå hva som ble belastet og hva et krav av den typen vanligvis dekker. Den kan ikke si om et krav fortsatt er i tide, for det avhenger av kravtypen og er reelt omstridt. Den delen krever en abogado med dokumentet ditt foran seg.

Det siden er god til, er å finne ut på to minutter om det i det hele tatt er verdt å stille spørsmålet.

{link}`,
    sv: `Tog du ett spanskt bolån någon gång mellan 2000 och 2019 är det värt att gräva fram pärmen en kväll och faktiskt läsa kostnaderna vid uppläggningen. De flesta skrev under de sidorna utan att läsa dem, vilket är fullt begripligt, och också hela poängen.

Tre saker återkommer gång på gång i lån från den perioden. Uppläggningsavgifter som lades helt på låntagaren. Golvklausuler som hindrade räntan från att falla under en nivå du aldrig gick med på att fundera över. Och försäkring som såldes ihop med lånet.

Om något av det gäller dig beror på din handling och dina villkor. Inte på vad som hände någon annan i samma bank, vilket är så de flesta av de här samtalen börjar i grupper som den här.

Och jag vill vara rak om vad en kalkylator kan och inte kan här. Den kan uppskatta vad som togs ut och vad ett krav av den typen brukar täcka. Den kan inte säga om ett krav fortfarande är i tid, för det beror på kravtypen och är verkligt omtvistat. Den delen kräver en abogado med din handling framför sig.

Det sidan är bra på är att på två minuter ta reda på om det alls är värt att ställa frågan.

{link}`,
    de: `Wenn Sie irgendwann zwischen 2000 und 2019 ein spanisches Hypothekendarlehen aufgenommen haben, lohnt es sich, die Akte eines Abends herauszuholen und die Abschlusskosten wirklich zu lesen. Die meisten haben diese Seiten unterschrieben, ohne sie zu lesen, was völlig verständlich ist und zugleich der ganze Punkt.

Drei Dinge tauchen bei Darlehen aus dieser Zeit immer wieder auf. Bearbeitungsgebühren, die komplett dem Darlehensnehmer auferlegt wurden. Zinsuntergrenzen, die verhinderten, dass der Satz unter ein Niveau fiel, über das Sie nie nachzudenken zugestimmt hatten. Und Versicherungen, die zusammen mit dem Darlehen verkauft wurden.

Ob davon etwas auf Sie zutrifft, hängt von Ihrer Urkunde und Ihren Bedingungen ab. Nicht davon, was jemand anderem beim selben Institut widerfahren ist, und genau so beginnen die meisten dieser Gespräche in Gruppen wie dieser.

Und ich will offen sein, was ein Rechner hier leisten kann und was nicht. Er kann schätzen, was berechnet wurde und was ein Anspruch dieser Art üblicherweise umfasst. Er kann nicht sagen, ob ein Anspruch noch rechtzeitig ist, denn das hängt von der Anspruchsart ab und ist wirklich umstritten. Dieser Teil braucht einen abogado mit Ihrer Urkunde vor sich.

Wofür die Seite gut ist: in zwei Minuten herauszufinden, ob es sich überhaupt lohnt, die Frage zu stellen.

{link}`,
    fr: `Si vous avez souscrit un prêt immobilier espagnol quelque part entre 2000 et 2019, cela vaut la peine de ressortir le dossier un soir et de lire vraiment les frais de mise en place. La plupart des gens ont signé ces pages sans les lire, ce qui est parfaitement compréhensible, et c'est aussi tout le problème.

Trois choses reviennent encore et encore dans les prêts de cette période. Des frais de dossier mis entièrement à la charge de l'emprunteur. Des clauses plancher qui empêchaient le taux de descendre sous un niveau auquel vous n'aviez jamais accepté de réfléchir. Et des assurances vendues avec le prêt.

Que tout cela vous concerne dépend de votre acte et de vos conditions. Pas de ce qui est arrivé à quelqu'un d'autre chez le même prêteur, et c'est pourtant comme ça que commencent la plupart de ces conversations dans des groupes comme celui-ci.

Et je veux être clair sur ce qu'un calculateur peut et ne peut pas faire ici. Il peut estimer ce qui a été facturé et ce qu'une réclamation de ce type couvre habituellement. Il ne peut pas vous dire si une réclamation est encore dans les délais, parce que cela dépend du type et fait réellement débat. Cette partie demande un abogado, votre acte sous les yeux.

Ce à quoi la page sert, c'est à savoir en deux minutes si la question mérite seulement d'être posée.

{link}`,
    nl: `Heeft u ergens tussen 2000 en 2019 een Spaanse hypotheek afgesloten, dan is het de moeite waard om het dossier op een avond op te diepen en de afsluitkosten écht te lezen. De meeste mensen tekenden die bladzijden zonder ze te lezen, wat volkomen begrijpelijk is, en ook meteen de hele kern.

Drie dingen komen keer op keer terug bij leningen uit die periode. Afsluitkosten die volledig bij de kredietnemer werden gelegd. Bodemclausules die verhinderden dat de rente onder een niveau zakte waarover u nooit had ingestemd na te denken. En verzekeringen die naast de lening werden verkocht.

Of daar iets van op u van toepassing is, hangt af van uw akte en uw voorwaarden. Niet van wat iemand anders bij dezelfde verstrekker overkwam, en zo beginnen de meeste van deze gesprekken in groepen als deze nu juist wel.

En ik wil eerlijk zijn over wat een rekenhulp hier wel en niet kan. Hij kan schatten wat er in rekening is gebracht en wat een vordering van dat type doorgaans dekt. Hij kan niet zeggen of een vordering nog op tijd is, want dat hangt van het soort af en is werkelijk betwist. Dat deel vraagt om een abogado met uw akte erbij.

Waar de pagina goed voor is, is in twee minuten uitvinden of de vraag überhaupt de moeite waard is.

{link}`,
  },
},
];
