// The posts Pratik writes under his own name in Facebook groups, in all six site languages.
//
// WHAT THIS IS, AND WHAT IT IS EMPHATICALLY NOT
// This is a personal surface. One person writes these, one person posts them by hand into
// groups, and nobody else sees the deck. It has nothing to do with api/_lk_*.js, with
// linkedin_posts, or with the team deck at /internal-linkedin. Those are reviewed by John
// and go out over the team's names. Nothing in this file may be copied there and nothing
// from there may be copied here. The two surfaces share no module, no table and no helper,
// which is the point: a mistake in one cannot reach the other.
//
// HOW THESE ARE WRITTEN
// First person, the way a person writes in a group, not the way a brand writes an ad.
//   - Every factual claim traces to a verified rule in ../rules. The `rules` array on each
//     idea names them, so the deck can show the article behind a sentence before it is
//     posted. If a figure is not in the rules base it does not go in a post.
//   - The first person is a builder, never an owner. Pratik does not own property in Spain,
//     so no post says or implies that he does. What he can honestly say is that he reads
//     the BOE pages, gets the same question repeatedly, and built something.
//   - No brand name. These go into groups whose rules bar promotion, and a free tool posted
//     honestly is welcome in a way that a company link is not.
//   - No emoji, no em dash, no competitor named, no penalty-flavoured urgency.
//
// {link} is substituted at seed time with the localised tool URL, so a translated post can
// never end up pointing at the English page.

export const SITE = 'https://www.247spain.es';
export const LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];

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
    en: `A question I kept getting wrong in my own head: is it 90 days a year, or 90 days in 180?

It is 90 days in any rolling 180. Not per calendar year. And the day you land counts as a full day, the same as the day you fly home. A long weekend is four days, not two.

The rolling part is what catches people out. You can be comfortably inside your limit in March and over it in May without taking a single extra trip, because last autumn is still sitting inside the window.

I got tired of working it out on paper, so I built a counter. You put in the trips you have taken and the ones you have booked, and it gives you the days left, the date the window refreshes, and the exact day a planned trip would tip you over.

{link}

Free, nothing to sign up for. If it disagrees with your own count I would rather hear about it than have you trust it blindly.`,
    no: `Et spørsmål jeg selv rotet med lenge: er det 90 dager i året, eller 90 dager av 180?

Det er 90 dager innenfor enhver rullerende 180-dagersperiode. Ikke per kalenderår. Og dagen du lander teller som en hel dag, akkurat som dagen du reiser hjem. En lang helg er fire dager, ikke to.

Det er det rullerende som lurer folk. Du kan ligge godt innenfor i mars og over grensen i mai uten å ha tatt en eneste ekstra tur, fordi dagene fra i høst fortsatt ligger inne i vinduet.

Jeg ble lei av å regne på papir, så jeg bygde en teller. Du legger inn turene du har tatt og de du har bestilt, og den gir deg dagene du har igjen, datoen vinduet friskner opp, og nøyaktig hvilken dag en planlagt tur ville tippet deg over.

{link}

Gratis, ingenting å registrere seg for. Er den uenig med din egen telling, vil jeg heller høre det enn at du stoler blindt på den.`,
    sv: `En fråga jag själv hade fel om länge: är det 90 dagar om året, eller 90 dagar av 180?

Det är 90 dagar inom varje rullande 180-dagarsperiod. Inte per kalenderår. Och dagen du landar räknas som en hel dag, precis som dagen du flyger hem. En långhelg är fyra dagar, inte två.

Det är det rullande som lurar folk. Du kan ligga med god marginal i mars och vara över i maj utan att ha gjort en enda extra resa, eftersom dagarna från i höstas fortfarande ligger kvar i fönstret.

Jag tröttnade på att räkna på papper och byggde en räknare. Du lägger in resorna du har gjort och de du har bokat, och den ger dig dagarna du har kvar, datumet då fönstret förnyas, och exakt vilken dag en planerad resa skulle tippa över.

{link}

Gratis, inget att registrera sig för. Om den inte stämmer med din egen räkning vill jag hellre veta det än att du litar blint på den.`,
    de: `Eine Frage, bei der ich selbst lange danebenlag: sind es 90 Tage im Jahr oder 90 Tage in 180?

Es sind 90 Tage in jedem rollierenden Zeitraum von 180 Tagen. Nicht pro Kalenderjahr. Und der Tag der Ankunft zählt als voller Tag, genauso wie der Tag des Rückflugs. Ein langes Wochenende sind vier Tage, nicht zwei.

Das Rollierende ist es, was die Leute erwischt. Sie können im März bequem darunter liegen und im Mai darüber sein, ohne eine einzige zusätzliche Reise gemacht zu haben, weil die Tage vom letzten Herbst noch im Fenster stecken.

Ich hatte keine Lust mehr, das auf Papier zu rechnen, also habe ich einen Zähler gebaut. Sie tragen die Reisen ein, die Sie gemacht haben, und die, die Sie gebucht haben, und er nennt Ihnen die verbleibenden Tage, das Datum, an dem sich das Fenster erneuert, und genau den Tag, an dem eine geplante Reise zu viel wäre.

{link}

Kostenlos, nichts anzumelden. Wenn er Ihrer eigenen Rechnung widerspricht, höre ich das lieber, als dass Sie ihm blind vertrauen.`,
    fr: `Une question sur laquelle je me trompais moi-même : est-ce 90 jours par an, ou 90 jours sur 180 ?

C'est 90 jours sur toute période glissante de 180 jours. Pas par année civile. Et le jour de l'arrivée compte comme une journée entière, tout comme le jour du retour. Un long week-end fait quatre jours, pas deux.

C'est le caractère glissant qui piège. Vous pouvez être largement dans les clous en mars et au-dessus en mai sans avoir fait un seul voyage de plus, parce que les jours de l'automne dernier sont encore dans la fenêtre.

J'en ai eu assez de calculer sur papier, alors j'ai construit un compteur. Vous saisissez les voyages faits et ceux que vous avez réservés, et il vous donne les jours restants, la date à laquelle la fenêtre se renouvelle, et le jour exact où un voyage prévu vous ferait dépasser.

{link}

Gratuit, rien à créer comme compte. S'il contredit votre propre calcul, je préfère l'entendre plutôt que vous le croyiez sur parole.`,
    nl: `Een vraag waar ik zelf lang naast zat: is het 90 dagen per jaar, of 90 dagen van 180?

Het is 90 dagen binnen elke voortschrijdende periode van 180 dagen. Niet per kalenderjaar. En de dag dat u landt telt als hele dag, net als de dag dat u terugvliegt. Een lang weekend is vier dagen, geen twee.

Het voortschrijdende deel is wat mensen verrast. U kunt in maart ruim binnen de grens zitten en in mei eroverheen, zonder ook maar een extra reis te hebben gemaakt, omdat de dagen van afgelopen najaar nog in het venster zitten.

Ik werd het zat om het op papier uit te rekenen, dus bouwde ik een teller. U vult de reizen in die u heeft gemaakt en die u heeft geboekt, en hij geeft u de resterende dagen, de datum waarop het venster ververst, en precies de dag waarop een geplande reis eroverheen zou gaan.

{link}

Gratis, niets om aan te melden. Klopt hij niet met uw eigen telling, dan hoor ik dat liever dan dat u er blind op vertrouwt.`,
  },
},
{
  key: 'imputed-income-empty-home',
  tool: 'tax-calculator',
  kind: 'informative',
  rules: ['irnr.imputed.base', 'irnr.imputed.no_deductions', 'irnr.rates'],
  text: {
    en: `The one that surprises people most: you can owe Spanish tax on a property you never rent out and barely use.

It is called imputed income. Spain treats a second home at your disposal as producing a notional income, and taxes that. Two things worth knowing about it.

First, the base is the cadastral value on your IBI receipt, not what you paid and not what the place is worth today. Those three numbers are usually nowhere near each other.

Second, nothing is deductible against it. Not the community fee, not the insurance, not the IBI itself. That surprises people who are used to deducting costs at home.

The rate is 19 percent for residents of the EU, Norway, Iceland and Liechtenstein, and 24 percent for everyone else.

I put the whole calculation into a free page, including the years you may not have filed:

{link}`,
    no: `Den som overrasker flest: du kan skylde spansk skatt på en bolig du aldri leier ut og knapt bruker.

Det heter imputert inntekt. Spania behandler en sekundærbolig som står til din disposisjon som om den gir en tenkt inntekt, og skattlegger den. To ting er verdt å vite.

For det første er grunnlaget matrikkelverdien som står på IBI-regningen, ikke det du betalte og ikke det boligen er verdt i dag. De tre tallene ligger som regel langt fra hverandre.

For det andre kan ingenting trekkes fra. Ikke fellesutgiftene, ikke forsikringen, ikke IBI selv. Det overrasker folk som er vant til å trekke fra kostnader hjemme.

Satsen er 19 prosent for bosatte i EU, Norge, Island og Liechtenstein, og 24 prosent for alle andre.

Jeg la hele regnestykket inn på en gratis side, inkludert årene du kanskje ikke har levert for:

{link}`,
    sv: `Den som överraskar flest: du kan vara skyldig spansk skatt på en bostad du aldrig hyr ut och knappt använder.

Det kallas schablonintäkt. Spanien behandlar en andrabostad som står till ditt förfogande som om den ger en tänkt inkomst, och beskattar den. Två saker är värda att veta.

För det första är underlaget taxeringsvärdet som står på IBI-avin, inte vad du betalade och inte vad bostaden är värd i dag. De tre siffrorna ligger oftast långt ifrån varandra.

För det andra får ingenting dras av. Inte samfällighetsavgiften, inte försäkringen, inte IBI självt. Det överraskar den som är van att dra av kostnader hemma.

Skattesatsen är 19 procent för boende i EU, Norge, Island och Liechtenstein, och 24 procent för alla andra.

Jag lade hela uträkningen på en gratis sida, inklusive de år du kanske inte har deklarerat:

{link}`,
    de: `Das, was die meisten überrascht: Sie können spanische Steuer auf eine Immobilie schulden, die Sie nie vermieten und kaum nutzen.

Das nennt sich fiktive Einkünfte. Spanien behandelt eine Zweitwohnung, die Ihnen zur Verfügung steht, so, als brächte sie einen gedachten Ertrag, und besteuert diesen. Zwei Dinge sind dazu wichtig.

Erstens ist die Bemessungsgrundlage der Katasterwert auf Ihrem IBI-Bescheid, nicht der Kaufpreis und nicht der heutige Wert. Diese drei Zahlen liegen meist weit auseinander.

Zweitens ist nichts abziehbar. Nicht das Hausgeld, nicht die Versicherung, nicht die IBI selbst. Das überrascht alle, die es gewohnt sind, zu Hause Kosten abzusetzen.

Der Satz beträgt 19 Prozent für Ansässige in der EU, Norwegen, Island und Liechtenstein und 24 Prozent für alle übrigen.

Ich habe die ganze Rechnung auf eine kostenlose Seite gelegt, samt der Jahre, die Sie womöglich nicht erklärt haben:

{link}`,
    fr: `Celle qui surprend le plus : vous pouvez devoir de l'impôt espagnol sur un bien que vous ne louez jamais et que vous utilisez à peine.

Cela s'appelle le revenu imputé. L'Espagne considère qu'une résidence secondaire à votre disposition produit un revenu théorique, et l'impose. Deux choses à savoir.

D'abord, la base est la valeur cadastrale figurant sur votre avis d'IBI, pas le prix payé ni la valeur actuelle du bien. Ces trois chiffres sont rarement proches.

Ensuite, rien n'est déductible. Ni les charges de copropriété, ni l'assurance, ni l'IBI lui-même. Cela surprend ceux qui ont l'habitude de déduire leurs frais chez eux.

Le taux est de 19 pour cent pour les résidents de l'UE, de Norvège, d'Islande et du Liechtenstein, et de 24 pour cent pour tous les autres.

J'ai mis tout le calcul sur une page gratuite, y compris les années que vous n'avez peut-être pas déclarées :

{link}`,
    nl: `Degene die de meeste mensen verrast: u kunt Spaanse belasting verschuldigd zijn over een woning die u nooit verhuurt en nauwelijks gebruikt.

Het heet fictief inkomen. Spanje behandelt een tweede woning die u ter beschikking staat alsof die een gedacht inkomen oplevert, en belast dat. Twee dingen die u moet weten.

Ten eerste is de grondslag de kadastrale waarde op uw IBI-aanslag, niet wat u betaalde en niet wat de woning nu waard is. Die drie bedragen liggen meestal ver uit elkaar.

Ten tweede is niets aftrekbaar. Niet de VvE-bijdrage, niet de verzekering, niet de IBI zelf. Dat verrast wie gewend is thuis kosten af te trekken.

Het tarief is 19 procent voor inwoners van de EU, Noorwegen, IJsland en Liechtenstein, en 24 procent voor alle anderen.

Ik heb de hele berekening op een gratis pagina gezet, inclusief de jaren die u misschien niet heeft aangegeven:

{link}`,
  },
},
{
  key: 'quarterly-rental-filing-ends',
  tool: 'rental-tax',
  kind: 'informative',
  rules: ['deadline.rental.last_quarterly', 'deadline.rental.from_2026'],
  text: {
    en: `If you let a place in Spain, the quarterly filing rhythm you are used to is about to stop.

Q3 2026 is the last quarterly rental return. It is due between 1 and 20 October 2026.

Rental income accrued from 1 October 2026 onwards does not get its own quarterly return. It goes into a single annual return filed in the first 20 calendar days of April the following year. So the next thing you file after this October is in April 2027, and it covers the last quarter of 2026.

Worth putting in a calendar now, because the muscle memory of four filings a year is exactly the sort of thing that quietly stops matching reality.

I built a free page that works out what is owed on rental income after the deductions you are actually entitled to:

{link}`,
    no: `Leier du ut en bolig i Spania, er den kvartalsvise leveringsrytmen du er vant til i ferd med å ta slutt.

Q3 2026 er den siste kvartalsvise leieoppgaven. Den skal leveres mellom 1. og 20. oktober 2026.

Leieinntekt som påløper fra 1. oktober 2026 får ikke sin egen kvartalsoppgave. Den går inn i én årlig oppgave som leveres i de første 20 kalenderdagene i april året etter. Det neste du leverer etter oktober i år er altså i april 2027, og det dekker siste kvartal 2026.

Verdt å legge i kalenderen nå, for vanen med fire leveringer i året er nettopp den typen ting som stille slutter å stemme.

Jeg laget en gratis side som regner ut hva som skal betales på leieinntekt etter de fradragene du faktisk har rett på:

{link}`,
    sv: `Hyr du ut en bostad i Spanien håller den kvartalsvisa rytmen du är van vid på att ta slut.

Q3 2026 är den sista kvartalsvisa hyresdeklarationen. Den ska lämnas mellan 1 och 20 oktober 2026.

Hyresinkomst som uppkommer från och med 1 oktober 2026 får ingen egen kvartalsdeklaration. Den går in i en enda årlig deklaration som lämnas under de första 20 kalenderdagarna i april året därpå. Nästa gång du deklarerar efter den här oktober är alltså i april 2027, och den täcker sista kvartalet 2026.

Värt att lägga in i kalendern nu, för vanan vid fyra deklarationer om året är precis den sortens sak som tyst slutar stämma.

Jag byggde en gratis sida som räknar ut vad som ska betalas på hyresinkomst efter de avdrag du faktiskt har rätt till:

{link}`,
    de: `Wenn Sie in Spanien vermieten, endet der vierteljährliche Rhythmus, den Sie gewohnt sind, demnächst.

Q3 2026 ist die letzte vierteljährliche Mieterklärung. Sie ist zwischen dem 1. und dem 20. Oktober 2026 abzugeben.

Mieteinkünfte, die ab dem 1. Oktober 2026 anfallen, bekommen keine eigene Quartalserklärung mehr. Sie gehen in eine einzige Jahreserklärung ein, die in den ersten 20 Kalendertagen des April des Folgejahres abzugeben ist. Das Nächste, was Sie nach diesem Oktober abgeben, ist also im April 2027 und betrifft das letzte Quartal 2026.

Jetzt in den Kalender zu schreiben, denn die Gewohnheit von vier Erklärungen im Jahr ist genau die Art Sache, die still und leise aufhört zu stimmen.

Ich habe eine kostenlose Seite gebaut, die ausrechnet, was auf Mieteinkünfte zu zahlen ist, nach den Abzügen, die Ihnen wirklich zustehen:

{link}`,
    fr: `Si vous louez un bien en Espagne, le rythme trimestriel auquel vous êtes habitué va s'arrêter.

Le troisième trimestre 2026 est la dernière déclaration locative trimestrielle. Elle est à déposer entre le 1er et le 20 octobre 2026.

Les revenus locatifs perçus à partir du 1er octobre 2026 n'ont plus de déclaration trimestrielle propre. Ils entrent dans une déclaration annuelle unique, déposée pendant les 20 premiers jours d'avril de l'année suivante. La prochaine échéance après cet octobre est donc avril 2027, et elle couvre le dernier trimestre 2026.

À noter dans l'agenda dès maintenant, car l'habitude de quatre déclarations par an est exactement le genre de chose qui cesse discrètement de correspondre à la réalité.

J'ai fait une page gratuite qui calcule ce qui est dû sur les revenus locatifs après les déductions auxquelles vous avez réellement droit :

{link}`,
    nl: `Verhuurt u een woning in Spanje, dan houdt het kwartaalritme waaraan u gewend bent binnenkort op.

Q3 2026 is de laatste kwartaalaangifte voor huurinkomsten. Die moet tussen 1 en 20 oktober 2026 worden ingediend.

Huurinkomsten vanaf 1 oktober 2026 krijgen geen eigen kwartaalaangifte meer. Die gaan op in één jaarlijkse aangifte, in te dienen in de eerste 20 kalenderdagen van april van het jaar daarna. Het eerstvolgende dat u na deze oktober indient is dus in april 2027, en dat betreft het laatste kwartaal van 2026.

De moeite waard om nu in de agenda te zetten, want de gewoonte van vier aangiftes per jaar is precies het soort ding dat stilletjes ophoudt te kloppen.

Ik heb een gratis pagina gemaakt die uitrekent wat over huurinkomsten verschuldigd is, na de aftrekposten waar u werkelijk recht op heeft:

{link}`,
  },
},
{
  key: 'late-filing-two-regimes',
  tool: 'late-surcharge',
  kind: 'informative',
  rules: ['late.recargo.voluntary', 'late.recargo.excludes_penalty', 'late.recargo.reduction'],
  text: {
    en: `If a modelo 210 is late, the single most useful thing to establish is whether the tax office has written to you yet. The two situations are not variations of each other, they are different regimes.

File late on your own initiative, before any demand, and it is a surcharge. One percent, plus another one percent for each complete month of delay, up to twelve months. From month thirteen it becomes a flat fifteen percent plus late payment interest. That surcharge excludes any penalty that could otherwise have been imposed, which is the part most people do not realise.

There is also a twenty five percent reduction on the surcharge if you pay within the voluntary period once you are notified.

Once a demand has landed, none of that applies and you are somewhere else entirely.

I built a page that asks which of the two you are in, works out the figure, and shows the date your clock actually started running from:

{link}`,
    no: `Er en modelo 210 levert for sent, er det mest nyttige å avklare om skattekontoret allerede har skrevet til deg. De to situasjonene er ikke varianter av hverandre, de er ulike regelsett.

Leverer du for sent på eget initiativ, før noe krav er kommet, er det et tillegg. Én prosent, pluss én prosent til for hver hele måned forsinkelse, opp til tolv måneder. Fra måned tretten blir det flate femten prosent pluss forsinkelsesrente. Det tillegget utelukker enhver bot som ellers kunne blitt ilagt, og det er den delen de fleste ikke er klar over.

Det finnes også en reduksjon på tjuefem prosent av tillegget hvis du betaler innenfor den frivillige perioden etter varsel.

Har kravet først kommet, gjelder ingenting av dette, og du er et helt annet sted.

Jeg laget en side som spør hvilken av de to du er i, regner ut beløpet, og viser datoen klokken din faktisk begynte å løpe fra:

{link}`,
    sv: `Är en modelo 210 försenad är det mest användbara att klargöra om skattemyndigheten redan har skrivit till dig. De två situationerna är inte varianter av varandra, de är olika regelverk.

Deklarerar du sent på eget initiativ, innan något krav kommit, är det ett tillägg. En procent, plus ytterligare en procent för varje hel månads dröjsmål, upp till tolv månader. Från månad tretton blir det platta femton procent plus dröjsmålsränta. Det tillägget utesluter varje sanktionsavgift som annars hade kunnat påföras, och det är den delen de flesta inte känner till.

Det finns också en nedsättning på tjugofem procent av tillägget om du betalar inom den frivilliga perioden efter underrättelse.

Har kravet väl kommit gäller inget av detta, och då är du någon helt annanstans.

Jag byggde en sida som frågar vilken av de två du befinner dig i, räknar ut beloppet, och visar datumet din klocka faktiskt började löpa från:

{link}`,
    de: `Ist eine modelo 210 verspätet, ist das Nützlichste zunächst zu klären, ob das Finanzamt Ihnen schon geschrieben hat. Die beiden Situationen sind keine Spielarten voneinander, es sind unterschiedliche Regime.

Geben Sie aus eigenem Antrieb verspätet ab, bevor eine Aufforderung kommt, ist es ein Zuschlag. Ein Prozent, plus ein weiteres Prozent für jeden vollen Monat Verzug, bis zu zwölf Monaten. Ab Monat dreizehn sind es pauschal fünfzehn Prozent plus Verzugszinsen. Dieser Zuschlag schließt jede Sanktion aus, die sonst hätte verhängt werden können, und das ist der Teil, den die meisten nicht kennen.

Es gibt außerdem eine Minderung des Zuschlags um fünfundzwanzig Prozent, wenn Sie nach der Mitteilung innerhalb der freiwilligen Frist zahlen.

Ist die Aufforderung erst einmal da, gilt nichts davon, und Sie sind an einem ganz anderen Ort.

Ich habe eine Seite gebaut, die fragt, in welcher der beiden Lagen Sie sind, den Betrag ausrechnet und das Datum zeigt, ab dem Ihre Frist tatsächlich lief:

{link}`,
    fr: `Si une modelo 210 est en retard, la chose la plus utile à établir est de savoir si le fisc vous a déjà écrit. Les deux situations ne sont pas des variantes l'une de l'autre, ce sont deux régimes différents.

Déclarez de votre propre initiative, avant toute mise en demeure, et c'est une majoration. Un pour cent, plus un pour cent par mois complet de retard, jusqu'à douze mois. À partir du treizième mois, c'est quinze pour cent forfaitaires plus les intérêts de retard. Cette majoration exclut toute sanction qui aurait autrement pu être infligée, et c'est la partie que la plupart des gens ignorent.

Il existe aussi une réduction de vingt-cinq pour cent de la majoration si vous payez dans le délai volontaire ouvert par la notification.

Une fois la mise en demeure arrivée, rien de tout cela ne s'applique et vous êtes ailleurs.

J'ai fait une page qui demande dans laquelle des deux vous êtes, calcule le montant, et affiche la date à partir de laquelle votre délai a réellement couru :

{link}`,
    nl: `Is een modelo 210 te laat, dan is het nuttigste om eerst vast te stellen of de belastingdienst u al heeft aangeschreven. De twee situaties zijn geen varianten van elkaar, het zijn verschillende regimes.

Dient u uit eigen beweging te laat in, voordat er een aanmaning is, dan is het een toeslag. Eén procent, plus nog eens één procent voor elke volle maand vertraging, tot twaalf maanden. Vanaf maand dertien wordt het een vlakke vijftien procent plus vertragingsrente. Die toeslag sluit elke boete uit die anders opgelegd had kunnen worden, en dat is het deel dat de meesten niet weten.

Er is ook een vermindering van vijfentwintig procent op de toeslag als u betaalt binnen de vrijwillige termijn na de kennisgeving.

Zodra de aanmaning er is, geldt hier niets van en zit u ergens heel anders.

Ik heb een pagina gemaakt die vraagt in welke van de twee u zit, het bedrag uitrekent, en de datum toont waarvandaan uw termijn werkelijk liep:

{link}`,
  },
},
{
  key: 'eu-eea-deductions',
  tool: 'rental-tax',
  kind: 'story',
  rules: ['irnr.rental.deductibility', 'irnr.rates'],
  text: {
    en: `I spent a while convinced I had misread this, because it is such a sharp line.

If you are resident in an EU country, or in Norway, Iceland or Liechtenstein, you can deduct expenses against Spanish rental income. Management fees, insurance, repairs, the community charge, the interest, the depreciation. You are taxed on what is left, at 19 percent.

If you are resident anywhere else, you are taxed on the gross rent. No deductions at all, at 24 percent.

Same flat, same tenant, same year. The number that decides it is where the owner lives.

What I keep seeing is owners on the deductible side who claim two or three of the categories and not the rest, usually because nobody ever handed them the full list.

So I made the list into a page. You go through what you actually paid and it shows the gap between that and what you are entitled to claim:

{link}`,
    no: `Jeg brukte en stund på å tro at jeg hadde lest feil, for skillet er så skarpt.

Bor du i et EU-land, eller i Norge, Island eller Liechtenstein, kan du trekke fra utgifter mot spansk leieinntekt. Forvaltningshonorar, forsikring, reparasjoner, fellesutgifter, renter, avskrivning. Du skattlegges av det som står igjen, med 19 prosent.

Bor du et annet sted, skattlegges du av brutto leie. Ingen fradrag i det hele tatt, med 24 prosent.

Samme leilighet, samme leietaker, samme år. Det som avgjør, er hvor eieren bor.

Det jeg stadig ser, er eiere på fradragssiden som fører to eller tre av postene og ikke resten, som regel fordi ingen noen gang ga dem hele listen.

Så jeg gjorde listen om til en side. Du går gjennom det du faktisk har betalt, og den viser avstanden mellom det og det du har rett til å føre:

{link}`,
    sv: `Jag var ett tag övertygad om att jag hade läst fel, för gränsen är så skarp.

Bor du i ett EU-land, eller i Norge, Island eller Liechtenstein, får du dra av kostnader mot spansk hyresinkomst. Förvaltningsarvode, försäkring, reparationer, samfällighetsavgift, ränta, avskrivning. Du beskattas på det som blir kvar, med 19 procent.

Bor du någon annanstans beskattas du på bruttohyran. Inga avdrag alls, med 24 procent.

Samma lägenhet, samma hyresgäst, samma år. Det som avgör är var ägaren bor.

Det jag ser om och om igen är ägare på avdragssidan som tar upp två eller tre av posterna och inte resten, oftast för att ingen någonsin gav dem hela listan.

Så jag gjorde listan till en sida. Du går igenom vad du faktiskt betalat och den visar skillnaden mellan det och vad du har rätt att dra av:

{link}`,
    de: `Ich war eine Weile überzeugt, mich verlesen zu haben, so scharf ist diese Grenze.

Sind Sie in einem EU-Land ansässig, oder in Norwegen, Island oder Liechtenstein, können Sie Kosten gegen spanische Mieteinkünfte absetzen. Verwaltungshonorar, Versicherung, Reparaturen, Hausgeld, Zinsen, Abschreibung. Besteuert wird, was übrig bleibt, mit 19 Prozent.

Sind Sie anderswo ansässig, wird die Bruttomiete besteuert. Gar keine Abzüge, mit 24 Prozent.

Dieselbe Wohnung, derselbe Mieter, dasselbe Jahr. Entschieden wird es davon, wo der Eigentümer lebt.

Was mir immer wieder begegnet, sind Eigentümer auf der abzugsberechtigten Seite, die zwei oder drei der Posten ansetzen und den Rest nicht, meist weil ihnen nie jemand die vollständige Liste gegeben hat.

Also habe ich die Liste zu einer Seite gemacht. Sie gehen durch, was Sie tatsächlich gezahlt haben, und sie zeigt den Abstand zu dem, was Sie ansetzen dürften:

{link}`,
    fr: `J'ai mis un moment à croire que j'avais bien lu, tant la ligne est nette.

Si vous résidez dans un pays de l'UE, ou en Norvège, en Islande ou au Liechtenstein, vous pouvez déduire vos charges des revenus locatifs espagnols. Honoraires de gestion, assurance, réparations, charges de copropriété, intérêts, amortissement. Vous êtes imposé sur ce qui reste, à 19 pour cent.

Si vous résidez ailleurs, vous êtes imposé sur le loyer brut. Aucune déduction, à 24 pour cent.

Même appartement, même locataire, même année. Ce qui tranche, c'est le lieu de résidence du propriétaire.

Ce que je vois sans arrêt, ce sont des propriétaires du côté déductible qui portent deux ou trois postes et pas le reste, en général parce que personne ne leur a jamais donné la liste complète.

J'ai donc transformé la liste en une page. Vous parcourez ce que vous avez réellement payé et elle montre l'écart avec ce que vous auriez le droit de déduire :

{link}`,
    nl: `Ik was er een tijd van overtuigd dat ik het verkeerd had gelezen, zo scherp is de grens.

Woont u in een EU-land, of in Noorwegen, IJsland of Liechtenstein, dan mag u kosten aftrekken van Spaanse huurinkomsten. Beheerkosten, verzekering, reparaties, VvE-bijdrage, rente, afschrijving. U wordt belast over wat overblijft, tegen 19 procent.

Woont u ergens anders, dan wordt u belast over de brutohuur. Helemaal geen aftrek, tegen 24 procent.

Dezelfde woning, dezelfde huurder, hetzelfde jaar. Wat het beslist is waar de eigenaar woont.

Wat ik steeds weer zie zijn eigenaren aan de aftrekbare kant die twee of drie posten opvoeren en de rest niet, meestal omdat niemand hun ooit de volledige lijst heeft gegeven.

Dus maakte ik van die lijst een pagina. U loopt door wat u werkelijk betaalde, en hij toont het gat tussen dat en wat u mag opvoeren:

{link}`,
  },
},
{
  key: 'three-percent-retention',
  tool: 'sale-tax',
  kind: 'informative',
  rules: ['irnr.sale.retention', 'deadline.210.sale', 'irnr.rates'],
  text: {
    en: `Selling as a non-resident, the three percent is the part that confuses everyone, so here is what it actually is.

The buyer must hold back three percent of the agreed price and pay it to the tax office on modelo 211 within a month of the transfer. It is not a tax and it is not a fee. It is a payment on account of your capital gains tax.

Your actual capital gains tax is 19 percent of the gain, for everyone, resident of anywhere. So the three percent of the whole price and the 19 percent of the gain are two different numbers, and they can land either way round. If the three percent overshoots what you owe, the difference comes back to you. If your gain was small or you sold at a loss, most of it comes back.

The window for your own return is a strange one. It opens one month after completion and closes three months later.

I built a page that does the gain, the tax, the retention and the refund position, and turns every deadline into a real date from your completion day:

{link}`,
    no: `Selger du som ikke-bosatt, er de tre prosentene det som forvirrer alle, så her er hva det faktisk er.

Kjøperen må holde tilbake tre prosent av avtalt pris og betale det til skattekontoret på modelo 211 innen en måned etter overdragelsen. Det er verken en skatt eller et gebyr. Det er en akontobetaling på din gevinstskatt.

Selve gevinstskatten er 19 prosent av gevinsten, for alle, uansett hvor du bor. Tre prosent av hele prisen og 19 prosent av gevinsten er altså to forskjellige tall, og de kan slå ut begge veier. Skyter de tre prosentene over det du skylder, kommer differansen tilbake til deg. Var gevinsten liten eller solgte du med tap, kommer det meste tilbake.

Fristen for din egen oppgave er en underlig en. Den åpner en måned etter overdragelsen og lukker tre måneder senere.

Jeg laget en side som regner gevinsten, skatten, tilbakeholdet og refusjonssituasjonen, og gjør hver frist om til en faktisk dato fra din overdragelsesdag:

{link}`,
    sv: `Säljer du som icke-bosatt är de tre procenten det som förvirrar alla, så här är vad det faktiskt är.

Köparen måste hålla inne tre procent av det avtalade priset och betala in det till skattemyndigheten på modelo 211 inom en månad från överlåtelsen. Det är varken en skatt eller en avgift. Det är en preliminär betalning på din kapitalvinstskatt.

Själva kapitalvinstskatten är 19 procent av vinsten, för alla, oavsett var du bor. Tre procent av hela priset och 19 procent av vinsten är alltså två olika tal, och de kan slå åt båda hållen. Skjuter de tre procenten över vad du är skyldig kommer mellanskillnaden tillbaka. Var vinsten liten eller sålde du med förlust kommer det mesta tillbaka.

Fönstret för din egen deklaration är egendomligt. Det öppnar en månad efter tillträdet och stänger tre månader senare.

Jag byggde en sida som räknar vinsten, skatten, innehållandet och återbetalningsläget, och gör varje frist till ett verkligt datum från din tillträdesdag:

{link}`,
    de: `Beim Verkauf als Nichtansässiger sind die drei Prozent das, was alle verwirrt, also hier, was sie wirklich sind.

Der Käufer muss drei Prozent des vereinbarten Preises einbehalten und sie binnen eines Monats nach der Übertragung mit modelo 211 an das Finanzamt abführen. Es ist weder eine Steuer noch eine Gebühr. Es ist eine Vorauszahlung auf Ihre Gewinnsteuer.

Ihre eigentliche Gewinnsteuer beträgt 19 Prozent des Gewinns, für alle, ganz gleich wo sie ansässig sind. Drei Prozent vom ganzen Preis und 19 Prozent vom Gewinn sind also zwei verschiedene Zahlen, und es kann in beide Richtungen ausgehen. Übersteigen die drei Prozent das Geschuldete, kommt die Differenz zurück. War der Gewinn klein oder haben Sie mit Verlust verkauft, kommt das meiste zurück.

Die Frist für Ihre eigene Erklärung ist eine seltsame. Sie öffnet einen Monat nach dem Notartermin und schließt drei Monate später.

Ich habe eine Seite gebaut, die Gewinn, Steuer, Einbehalt und Erstattungslage rechnet und jede Frist in ein echtes Datum ab Ihrem Übergabetag verwandelt:

{link}`,
    fr: `À la vente en tant que non-résident, les trois pour cent sont ce qui trouble tout le monde, alors voici ce que c'est réellement.

L'acheteur doit retenir trois pour cent du prix convenu et les verser au fisc sur le modelo 211 dans le mois suivant la transmission. Ce n'est ni un impôt ni des frais. C'est un acompte sur votre impôt sur la plus-value.

Votre impôt sur la plus-value est lui de 19 pour cent du gain, pour tout le monde, où que vous résidiez. Trois pour cent du prix total et 19 pour cent du gain sont donc deux chiffres différents, et cela peut pencher dans les deux sens. Si les trois pour cent dépassent ce que vous devez, la différence vous revient. Si le gain était faible ou si vous avez vendu à perte, l'essentiel revient.

La fenêtre de votre propre déclaration est particulière. Elle s'ouvre un mois après la signature et se ferme trois mois plus tard.

J'ai fait une page qui calcule le gain, l'impôt, la retenue et la position de remboursement, et transforme chaque échéance en date réelle à partir de votre jour de signature :

{link}`,
    nl: `Bij verkoop als niet-inwoner zijn de drie procent wat iedereen in verwarring brengt, dus hier is wat het werkelijk is.

De koper moet drie procent van de overeengekomen prijs inhouden en binnen een maand na de overdracht met modelo 211 aan de belastingdienst afdragen. Het is geen belasting en geen kosten. Het is een voorschot op uw vermogenswinstbelasting.

Uw werkelijke vermogenswinstbelasting is 19 procent over de winst, voor iedereen, waar u ook woont. Drie procent van de hele prijs en 19 procent van de winst zijn dus twee verschillende bedragen, en het kan beide kanten op vallen. Schieten de drie procent over wat u verschuldigd bent, dan komt het verschil terug. Was de winst klein of verkocht u met verlies, dan komt het meeste terug.

Het venster voor uw eigen aangifte is een vreemde. Het opent een maand na de overdracht en sluit drie maanden later.

Ik heb een pagina gemaakt die de winst, de belasting, de inhouding en de teruggaafpositie berekent, en elke termijn omzet in een echte datum vanaf uw overdrachtsdag:

{link}`,
  },
},
{
  key: 'plusvalia-two-methods',
  tool: 'sale-tax',
  kind: 'informative',
  rules: ['plusvalia.methods', 'plusvalia.no_gain', 'plusvalia.deadlines'],
  text: {
    en: `The municipal tax on a sale, the plusvalia, is the one most sellers first hear about at the notary. Three things make it less alarming than it sounds.

There are two ways of working it out. The objective method takes the cadastral land value and multiplies it by a coefficient for how long you held the property. The real gain method uses the actual increase between the two deeds. You may choose whichever produces the lower figure.

If there was no increase at all, there is no liability. You still have to declare the transfer and attach both deeds, but there is nothing to assess.

The deadline is thirty working days from the date of the public deed. Working days, not calendar days.

One honest caveat: the coefficients, the rate, and whether your town works by declaration or self assessment all vary by municipality, so the final number has to come from the town hall.

I built a page that does the gain, the national tax, the retention and this one, with every deadline as a real date:

{link}`,
    no: `Den kommunale skatten ved salg, plusvalia, er den de fleste selgere først hører om hos notaren. Tre ting gjør den mindre skremmende enn den høres ut.

Den kan regnes på to måter. Den objektive metoden tar matrikkelverdien på grunnen og ganger den med en koeffisient for hvor lenge du eide eiendommen. Metoden med reell gevinst bruker den faktiske økningen mellom de to skjøtene. Du kan velge den som gir lavest beløp.

Var det ingen økning i det hele tatt, er det ingen skatt. Overdragelsen må fortsatt meldes, med begge skjøtene vedlagt, men det er ingenting å utligne.

Fristen er tretti virkedager fra datoen på det offentlige skjøtet. Virkedager, ikke kalenderdager.

Et ærlig forbehold: koeffisientene, satsen og om kommunen din bruker melding eller egenfastsetting varierer fra kommune til kommune, så det endelige tallet må komme fra rådhuset.

Jeg laget en side som regner gevinsten, den nasjonale skatten, tilbakeholdet og denne, med hver frist som en faktisk dato:

{link}`,
    sv: `Den kommunala skatten vid försäljning, plusvalia, är den de flesta säljare först hör talas om hos notarien. Tre saker gör den mindre skrämmande än den låter.

Den kan räknas på två sätt. Den objektiva metoden tar markens taxeringsvärde och multiplicerar med en koefficient för hur länge du ägt fastigheten. Metoden med verklig vinst använder den faktiska ökningen mellan de två handlingarna. Du får välja den som ger lägst belopp.

Fanns ingen ökning alls finns ingen skatt. Överlåtelsen måste ändå anmälas, med båda handlingarna bifogade, men det finns inget att påföra.

Fristen är trettio arbetsdagar från datumet på den offentliga handlingen. Arbetsdagar, inte kalenderdagar.

En ärlig reservation: koefficienterna, skattesatsen och om din kommun arbetar med anmälan eller självdeklaration varierar mellan kommuner, så den slutliga siffran måste komma från kommunhuset.

Jag byggde en sida som räknar vinsten, den nationella skatten, innehållandet och den här, med varje frist som ett verkligt datum:

{link}`,
    de: `Die kommunale Steuer beim Verkauf, die plusvalia, ist die, von der die meisten Verkäufer zuerst beim Notar hören. Drei Dinge machen sie weniger bedrohlich, als sie klingt.

Es gibt zwei Berechnungswege. Die objektive Methode nimmt den Katasterwert des Grundes und multipliziert ihn mit einem Koeffizienten für die Haltedauer. Die Methode des tatsächlichen Gewinns nimmt die reale Wertsteigerung zwischen den beiden Urkunden. Sie dürfen die wählen, die den niedrigeren Betrag ergibt.

Gab es gar keine Steigerung, entsteht keine Steuer. Die Übertragung ist trotzdem zu erklären, mit beiden Urkunden, aber es gibt nichts festzusetzen.

Die Frist beträgt dreißig Werktage ab dem Datum der öffentlichen Urkunde. Werktage, nicht Kalendertage.

Ein ehrlicher Vorbehalt: die Koeffizienten, der Satz und ob Ihre Gemeinde mit Erklärung oder Selbstveranlagung arbeitet, sind von Gemeinde zu Gemeinde verschieden, die endgültige Zahl muss also vom Rathaus kommen.

Ich habe eine Seite gebaut, die den Gewinn, die staatliche Steuer, den Einbehalt und diese hier rechnet, mit jeder Frist als echtem Datum:

{link}`,
    fr: `L'impôt municipal sur la vente, la plusvalia, est celui dont la plupart des vendeurs entendent parler pour la première fois chez le notaire. Trois choses le rendent moins inquiétant qu'il n'y paraît.

Il y a deux façons de le calculer. La méthode objective prend la valeur cadastrale du terrain et la multiplie par un coefficient lié à la durée de détention. La méthode du gain réel utilise l'augmentation effective entre les deux actes. Vous pouvez choisir celle qui donne le montant le plus faible.

S'il n'y a eu aucune augmentation, il n'y a pas d'impôt. La transmission doit tout de même être déclarée, avec les deux actes joints, mais il n'y a rien à liquider.

Le délai est de trente jours ouvrables à compter de la date de l'acte public. Jours ouvrables, pas jours calendaires.

Une réserve honnête : les coefficients, le taux et le fait que votre commune fonctionne par déclaration ou par autoliquidation varient d'une commune à l'autre, le chiffre final doit donc venir de la mairie.

J'ai fait une page qui calcule le gain, l'impôt national, la retenue et celui-ci, avec chaque échéance en date réelle :

{link}`,
    nl: `De gemeentelijke belasting bij verkoop, de plusvalia, is degene waar de meeste verkopers pas bij de notaris van horen. Drie dingen maken hem minder alarmerend dan hij klinkt.

Er zijn twee manieren om hem te berekenen. De objectieve methode neemt de kadastrale grondwaarde en vermenigvuldigt die met een coëfficiënt voor de bezitsduur. De methode van de werkelijke winst gebruikt de feitelijke stijging tussen de twee akten. U mag degene kiezen die het laagste bedrag oplevert.

Was er helemaal geen stijging, dan is er geen belasting. De overdracht moet nog steeds worden aangegeven, met beide akten erbij, maar er valt niets op te leggen.

De termijn is dertig werkdagen vanaf de datum van de notariële akte. Werkdagen, geen kalenderdagen.

Een eerlijk voorbehoud: de coëfficiënten, het tarief en of uw gemeente met aangifte of zelfaanslag werkt, verschillen per gemeente, dus het eindbedrag moet van het gemeentehuis komen.

Ik heb een pagina gemaakt die de winst, de landelijke belasting, de inhouding en deze berekent, met elke termijn als echte datum:

{link}`,
  },
},
{
  key: 'iva-holiday-let',
  tool: 'rental-vat',
  kind: 'informative',
  rules: ['vat.letting'],
  text: {
    en: `A holiday let question that gets answered wrongly more often than almost any other: does IVA depend on how long the guest stays?

No. It turns on what you provide during the stay.

A residential let with no services is exempt from IVA. Add hotel type services during the stay, and the let is taxed at 10 percent. Twenty one percent is for an operation that is neither an exempt residential let nor a hotel type accommodation service.

Hotel type is the phrase doing the work, and it means services during the stay. A clean and a change of linen between guests is not the same thing as a daily clean, reception, or breakfast. Two owners on the same corridor, letting for the same week at the same price, can genuinely land on different sides of this.

The other half of the question is who the guest actually books from, which changes the answer again.

Three questions and a straight answer here:

{link}`,
    no: `Et spørsmål om korttidsutleie som besvares feil oftere enn nesten alle andre: avhenger IVA av hvor lenge gjesten blir?

Nei. Det avhenger av hva du leverer under oppholdet.

En boligutleie uten tjenester er fritatt for IVA. Legger du til hotelliknende tjenester under oppholdet, beskattes utleien med 10 prosent. Tjueen prosent gjelder en virksomhet som verken er en fritatt boligutleie eller en hotelliknende overnattingstjeneste.

Hotelliknende er uttrykket som gjør jobben, og det betyr tjenester under oppholdet. Vask og skift av sengetøy mellom gjester er ikke det samme som daglig renhold, resepsjon eller frokost. To eiere i samme korridor, som leier ut samme uke til samme pris, kan reelt havne på hver sin side av dette.

Den andre halvdelen av spørsmålet er hvem gjesten faktisk bestiller fra, noe som endrer svaret igjen.

Tre spørsmål og et rett svar her:

{link}`,
    sv: `En fråga om korttidsuthyrning som besvaras fel oftare än nästan alla andra: beror IVA på hur länge gästen stannar?

Nej. Det beror på vad du tillhandahåller under vistelsen.

En bostadsuthyrning utan tjänster är undantagen från IVA. Lägger du till hotelliknande tjänster under vistelsen beskattas uthyrningen med 10 procent. Tjugoen procent gäller en verksamhet som varken är en undantagen bostadsuthyrning eller en hotelliknande logitjänst.

Hotelliknande är uttrycket som gör jobbet, och det betyder tjänster under vistelsen. Städning och byte av lakan mellan gäster är inte samma sak som daglig städning, reception eller frukost. Två ägare i samma trappuppgång, som hyr ut samma vecka till samma pris, kan verkligen hamna på var sin sida av detta.

Den andra halvan av frågan är vem gästen faktiskt bokar av, vilket ändrar svaret igen.

Tre frågor och ett rakt svar här:

{link}`,
    de: `Eine Frage zur Ferienvermietung, die häufiger falsch beantwortet wird als fast jede andere: hängt die IVA davon ab, wie lange der Gast bleibt?

Nein. Sie hängt davon ab, was Sie während des Aufenthalts erbringen.

Eine Wohnraumvermietung ohne Leistungen ist von der IVA befreit. Kommen hotelartige Leistungen während des Aufenthalts hinzu, wird die Vermietung mit 10 Prozent besteuert. Einundzwanzig Prozent gelten für einen Vorgang, der weder eine befreite Wohnraumvermietung noch eine hotelartige Beherbergungsleistung ist.

Hotelartig ist der Begriff, auf den es ankommt, und er meint Leistungen während des Aufenthalts. Eine Reinigung und ein Wäschewechsel zwischen den Gästen sind nicht dasselbe wie tägliche Reinigung, Rezeption oder Frühstück. Zwei Eigentümer im selben Treppenhaus, die dieselbe Woche zum selben Preis vermieten, können hier tatsächlich auf verschiedenen Seiten landen.

Die andere Hälfte der Frage ist, bei wem der Gast tatsächlich bucht, und das ändert die Antwort erneut.

Drei Fragen und eine klare Antwort hier:

{link}`,
    fr: `Une question sur la location saisonnière à laquelle on répond mal plus souvent qu'à presque toute autre : l'IVA dépend-elle de la durée du séjour ?

Non. Elle dépend de ce que vous fournissez pendant le séjour.

Une location résidentielle sans services est exonérée d'IVA. Ajoutez des services de type hôtelier pendant le séjour, et la location est taxée à 10 pour cent. Vingt et un pour cent s'appliquent à une opération qui n'est ni une location résidentielle exonérée ni un service d'hébergement de type hôtelier.

Type hôtelier est l'expression qui fait le travail, et elle vise des services pendant le séjour. Un ménage et un changement de linge entre deux séjours, ce n'est pas la même chose qu'un ménage quotidien, une réception ou un petit déjeuner. Deux propriétaires du même palier, louant la même semaine au même prix, peuvent réellement se retrouver de part et d'autre de cette ligne.

L'autre moitié de la question est de savoir auprès de qui le client réserve vraiment, ce qui change encore la réponse.

Trois questions et une réponse nette ici :

{link}`,
    nl: `Een vraag over vakantieverhuur die vaker verkeerd wordt beantwoord dan bijna elke andere: hangt de IVA af van hoe lang de gast blijft?

Nee. Het hangt af van wat u tijdens het verblijf levert.

Woonruimteverhuur zonder diensten is vrijgesteld van IVA. Voegt u hoteldiensten toe tijdens het verblijf, dan wordt de verhuur belast tegen 10 procent. Eenentwintig procent geldt voor een activiteit die noch een vrijgestelde woonverhuur, noch een hotelmatige logiesdienst is.

Hotelmatig is de term die het werk doet, en die slaat op diensten tijdens het verblijf. Schoonmaken en beddengoed verschonen tussen gasten is niet hetzelfde als dagelijks schoonmaken, receptie of ontbijt. Twee eigenaren in hetzelfde portiek, die dezelfde week voor dezelfde prijs verhuren, kunnen hier werkelijk aan weerszijden uitkomen.

De andere helft van de vraag is bij wie de gast eigenlijk boekt, en dat verandert het antwoord opnieuw.

Drie vragen en een recht antwoord hier:

{link}`,
  },
},
{
  key: 'consorcio-storm',
  tool: 'storm-claim',
  kind: 'story',
  rules: ['consorcio.perils', 'consorcio.wind_threshold', 'consorcio.precondition'],
  text: {
    en: `I learned this one the slow way, reading a claim refusal that was entirely correct and still left the owner with the wrong idea.

For certain kinds of damage in Spain, your insurer is not who pays. A public body called the Consorcio de Compensacion de Seguros does. Earthquake, extraordinary flood, volcanic eruption, atypical cyclonic storm, and a short list of others.

The wind threshold is a real number: gusts above 120 km per hour, measured as a three second gust. Below that, storm damage is an ordinary matter for your own insurer under the storm cover of your policy. Above it, you may be looking at the Consorcio instead.

The part worth knowing in advance: this is not something you buy. If you hold an ordinary policy in a qualifying branch, the surcharge is already collected with your premium automatically. You are paying for it whether or not you have heard of it.

So after a storm the useful question is not what your policy covers, it is which of the two you should be calling.

Four questions and it tells you:

{link}`,
    no: `Denne lærte jeg den langsomme veien, ved å lese et avslag som var helt korrekt og likevel etterlot eieren med feil oppfatning.

For visse typer skade i Spania er det ikke forsikringsselskapet ditt som betaler. Det er et offentlig organ som heter Consorcio de Compensacion de Seguros. Jordskjelv, ekstraordinær flom, vulkanutbrudd, atypisk syklonstorm, og en kort liste til.

Vindgrensen er et reelt tall: kast over 120 km i timen, målt som tresekunders kast. Under det er stormskade en ordinær sak for ditt eget selskap under stormdekningen i polisen. Over det kan det være Consorcio som gjelder.

Det som er verdt å vite på forhånd: dette er ikke noe du kjøper. Har du en ordinær polise i en kvalifiserende bransje, kreves tillegget allerede inn sammen med premien, automatisk. Du betaler for det enten du har hørt om det eller ikke.

Etter en storm er derfor det nyttige spørsmålet ikke hva polisen din dekker, men hvem av de to du skal ringe.

Fire spørsmål, så sier den det:

{link}`,
    sv: `Den här lärde jag mig den långsamma vägen, genom att läsa ett avslag som var helt korrekt och ändå lämnade ägaren med fel uppfattning.

För vissa typer av skada i Spanien är det inte ditt försäkringsbolag som betalar. Det är ett offentligt organ som heter Consorcio de Compensacion de Seguros. Jordbävning, extraordinär översvämning, vulkanutbrott, atypisk cyklonstorm, och en kort lista till.

Vindgränsen är ett verkligt tal: byar över 120 km i timmen, mätt som tresekundersby. Under det är stormskada en vanlig sak för ditt eget bolag under stormskyddet i försäkringen. Över det kan det vara Consorcio som gäller.

Det som är värt att veta i förväg: detta är inget du köper. Har du en vanlig försäkring i en kvalificerande gren tas tillägget redan ut tillsammans med premien, automatiskt. Du betalar för det oavsett om du har hört talas om det eller inte.

Efter en storm är därför den användbara frågan inte vad din försäkring täcker, utan vem av de två du ska ringa.

Fyra frågor, sedan säger den det:

{link}`,
    de: `Das habe ich auf dem langsamen Weg gelernt, beim Lesen einer Ablehnung, die völlig richtig war und den Eigentümer trotzdem mit der falschen Vorstellung zurückließ.

Bei bestimmten Schadensarten in Spanien zahlt nicht Ihr Versicherer. Das tut eine öffentliche Stelle namens Consorcio de Compensacion de Seguros. Erdbeben, außergewöhnliche Überschwemmung, Vulkanausbruch, atypischer Zyklonsturm und eine kurze weitere Liste.

Die Windschwelle ist eine echte Zahl: Böen über 120 km pro Stunde, gemessen als Dreisekundenbö. Darunter ist Sturmschaden eine gewöhnliche Sache für Ihren eigenen Versicherer unter der Sturmdeckung der Police. Darüber kann stattdessen der Consorcio zuständig sein.

Das, was man vorher wissen sollte: das kauft man nicht. Halten Sie eine gewöhnliche Police in einer qualifizierenden Sparte, wird der Zuschlag bereits automatisch mit der Prämie eingezogen. Sie zahlen dafür, ob Sie davon gehört haben oder nicht.

Nach einem Sturm lautet die nützliche Frage also nicht, was Ihre Police deckt, sondern welchen der beiden Sie anrufen sollten.

Vier Fragen, dann sagt sie es Ihnen:

{link}`,
    fr: `J'ai appris celle-ci lentement, en lisant un refus de sinistre parfaitement fondé qui laissait pourtant le propriétaire avec une idée fausse.

Pour certains types de dommages en Espagne, ce n'est pas votre assureur qui paie. C'est un organisme public appelé Consorcio de Compensacion de Seguros. Séisme, inondation extraordinaire, éruption volcanique, tempête cyclonique atypique, et une courte liste d'autres cas.

Le seuil de vent est un chiffre réel : des rafales supérieures à 120 km par heure, mesurées sur trois secondes. En dessous, le dégât de tempête relève normalement de votre propre assureur au titre de la garantie tempête. Au-dessus, c'est peut-être le Consorcio.

Ce qu'il vaut mieux savoir à l'avance : cela ne s'achète pas. Si vous détenez un contrat ordinaire dans une branche éligible, la surprime est déjà prélevée avec votre cotisation, automatiquement. Vous la payez, que vous en ayez entendu parler ou non.

Après une tempête, la vraie question n'est donc pas ce que couvre votre contrat, mais lequel des deux appeler.

Quatre questions, et elle vous le dit :

{link}`,
    nl: `Deze heb ik langzaam geleerd, door een afwijzing te lezen die volkomen juist was en de eigenaar toch met het verkeerde idee achterliet.

Bij bepaalde soorten schade in Spanje betaalt uw verzekeraar niet. Dat doet een publiek orgaan dat Consorcio de Compensacion de Seguros heet. Aardbeving, buitengewone overstroming, vulkaanuitbarsting, atypische cycloonstorm, en een korte lijst andere gevallen.

De windgrens is een echt getal: windstoten boven 120 km per uur, gemeten als drie-secondenstoot. Daaronder is stormschade een gewone zaak voor uw eigen verzekeraar onder de stormdekking van de polis. Daarboven kan het juist het Consorcio zijn.

Wat u vooraf wilt weten: dit koopt u niet. Heeft u een gewone polis in een kwalificerende branche, dan wordt de opslag al automatisch met uw premie geïnd. U betaalt ervoor, of u er nu van gehoord heeft of niet.

Na een storm is de nuttige vraag dus niet wat uw polis dekt, maar wie van de twee u moet bellen.

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
    en: `This is the one I did not expect to find, and it is the reason I built the page at all.

A lot of Spanish home policies contain a legal expenses chapter. Defensa juridica. It pays your lawyer, the procurador and court costs when you are in a case. Inside a combined home policy it has to appear as a separate chapter with its own premium, so if you cannot find a separate premium line for it, that alone is worth asking about.

And the part that surprised me most: you have the right to choose your own lawyer. The lawyer you choose takes instructions from you, not from the insurer. That right does not depend on the insurer agreeing and it does not depend on there being a conflict of interest. The policy has to say so in so many words.

So before anyone pays a lawyer privately, it is worth opening the policy and searching for those Spanish phrases. Finding them tells you what you have. Not finding them tells you what to ask about.

I put the phrases, the articles and the clocks on one page:

{link}`,
    no: `Dette er den jeg ikke ventet å finne, og grunnen til at jeg laget siden i det hele tatt.

Mange spanske husforsikringer inneholder et kapittel om juridisk bistand. Defensa juridica. Det dekker advokaten din, prosessfullmektigen og rettsomkostninger når du står i en sak. Inne i en kombinert husforsikring må det stå som et eget kapittel med egen premie, så finner du ingen egen premielinje for det, er allerede det verdt å spørre om.

Og det som overrasket meg mest: du har rett til å velge din egen advokat. Advokaten du velger tar instruks fra deg, ikke fra selskapet. Den retten er ikke avhengig av at selskapet samtykker, og ikke av at det foreligger en interessekonflikt. Polisen må si det uttrykkelig.

Så før noen betaler en advokat av egen lomme, er det verdt å åpne polisen og søke etter de spanske uttrykkene. Finner du dem, vet du hva du har. Finner du dem ikke, vet du hva du skal spørre om.

Jeg samlet uttrykkene, lovhjemlene og fristene på én side:

{link}`,
    sv: `Det här är den jag inte väntade mig att hitta, och skälet till att jag byggde sidan över huvud taget.

Många spanska hemförsäkringar innehåller ett kapitel om rättsskydd. Defensa juridica. Det betalar din advokat, ombudet och rättegångskostnader när du står i ett ärende. Inuti en kombinerad hemförsäkring måste det stå som ett eget kapitel med egen premie, så hittar du ingen egen premierad för det är redan det värt att fråga om.

Och det som förvånade mig mest: du har rätt att välja din egen advokat. Den advokat du väljer tar instruktioner av dig, inte av bolaget. Den rätten beror inte på att bolaget går med på det, och inte på att det finns en intressekonflikt. Försäkringsbrevet måste säga det uttryckligen.

Så innan någon betalar en advokat ur egen ficka är det värt att öppna försäkringsbrevet och söka på de spanska uttrycken. Hittar du dem vet du vad du har. Hittar du dem inte vet du vad du ska fråga om.

Jag samlade uttrycken, lagrummen och fristerna på en sida:

{link}`,
    de: `Das ist die Sache, mit der ich nicht gerechnet hatte, und der Grund, warum ich die Seite überhaupt gebaut habe.

Viele spanische Wohngebäudepolicen enthalten ein Kapitel Rechtsschutz. Defensa juridica. Es zahlt Ihren Anwalt, den Prozessvertreter und Gerichtskosten, wenn Sie in einem Verfahren stehen. In einer kombinierten Police muss es als eigenes Kapitel mit eigener Prämie erscheinen, wenn Sie also keine eigene Prämienzeile dafür finden, lohnt allein das die Nachfrage.

Und was mich am meisten überrascht hat: Sie haben das Recht, Ihren eigenen Anwalt zu wählen. Der Anwalt, den Sie wählen, nimmt Weisungen von Ihnen entgegen, nicht vom Versicherer. Dieses Recht hängt weder von dessen Zustimmung noch vom Vorliegen eines Interessenkonflikts ab. Die Police muss es ausdrücklich benennen.

Bevor also jemand einen Anwalt aus eigener Tasche bezahlt, lohnt es, die Police zu öffnen und nach diesen spanischen Begriffen zu suchen. Sie zu finden sagt Ihnen, was Sie haben. Sie nicht zu finden sagt Ihnen, wonach Sie fragen sollten.

Ich habe die Begriffe, die Artikel und die Fristen auf eine Seite gelegt:

{link}`,
    fr: `C'est celle que je ne m'attendais pas à trouver, et la raison pour laquelle j'ai fait cette page.

Beaucoup de contrats habitation espagnols contiennent un chapitre de protection juridique. Defensa juridica. Il paie votre avocat, le procurador et les frais de justice quand vous êtes dans une procédure. Dans un contrat multirisque il doit figurer comme un chapitre distinct avec sa propre prime, donc si vous ne trouvez pas de ligne de prime distincte, cela seul mérite une question.

Et ce qui m'a le plus surpris : vous avez le droit de choisir votre propre avocat. L'avocat que vous choisissez reçoit ses instructions de vous, pas de l'assureur. Ce droit ne dépend ni de son accord ni de l'existence d'un conflit d'intérêts. Le contrat doit l'énoncer expressément.

Donc avant que quiconque paie un avocat de sa poche, il vaut la peine d'ouvrir le contrat et de chercher ces expressions espagnoles. Les trouver vous dit ce que vous avez. Ne pas les trouver vous dit ce qu'il faut demander.

J'ai mis les expressions, les articles et les délais sur une seule page :

{link}`,
    nl: `Dit is degene die ik niet verwachtte te vinden, en de reden dat ik de pagina überhaupt heb gemaakt.

Veel Spaanse woonpolissen bevatten een hoofdstuk rechtsbijstand. Defensa juridica. Het betaalt uw advocaat, de procurador en de proceskosten als u in een zaak zit. Binnen een gecombineerde woonpolis moet het als apart hoofdstuk met een eigen premie staan, dus vindt u geen aparte premieregel, dan is dat alleen al een vraag waard.

En wat mij het meest verraste: u heeft het recht uw eigen advocaat te kiezen. De advocaat die u kiest neemt instructies van u aan, niet van de verzekeraar. Dat recht hangt niet af van instemming van de verzekeraar en niet van het bestaan van een belangenconflict. De polis moet het met zoveel woorden vastleggen.

Dus voordat iemand een advocaat uit eigen zak betaalt, loont het de polis te openen en op die Spaanse termen te zoeken. Ze vinden zegt u wat u heeft. Ze niet vinden zegt u waar u naar moet vragen.

Ik heb de termen, de artikelen en de termijnen op één pagina gezet:

{link}`,
  },
},
{
  key: 'community-decision-clock',
  tool: 'your-rights',
  kind: 'informative',
  rules: ['limit.community.challenge', 'limit.community.challenge.absent', 'limit.community.challenge.standing'],
  text: {
    en: `For anyone who owns in a building and was not at the last owners meeting, this is the rule most worth knowing.

If you want to challenge a decision, the window is three months where the ground is that it seriously harms the community or unfairly harms one owner, and one year where the ground is that it breaks the law or the statutes.

Here is the part that matters for an owner abroad: if you were not at the meeting, your window runs from the day the decision was communicated to you. Not from the day of the meeting. So keep the envelope, or the email, with its date. That date is your starting line and nothing else is.

One condition worth checking before you plan anything: to challenge, you generally need to be up to date with community payments, or have paid the disputed amount into court first.

I put the clocks, the articles they come from and what to gather on one page:

{link}`,
    no: `For alle som eier i et sameie og ikke var på siste sameiermøte, er dette regelen det er mest verdt å kunne.

Vil du angripe et vedtak, er fristen tre måneder når grunnlaget er at det skader sameiet alvorlig eller rammer én eier urimelig, og ett år når grunnlaget er at det bryter loven eller vedtektene.

Her er det som betyr noe for en eier i utlandet: var du ikke på møtet, løper fristen din fra dagen vedtaket ble meddelt deg. Ikke fra møtedagen. Så ta vare på konvolutten, eller e-posten, med datoen. Den datoen er startstreken din, og ingenting annet.

Én betingelse det er verdt å sjekke før du planlegger noe: for å angripe må du som regel være à jour med fellesutgiftene, eller først ha deponert det omtvistede beløpet i retten.

Jeg samlet fristene, lovhjemlene de kommer fra og hva du bør sikre, på én side:

{link}`,
    sv: `För alla som äger i en samfällighet och inte var på senaste stämman är det här den regel som är mest värd att kunna.

Vill du klandra ett beslut är fristen tre månader när grunden är att det allvarligt skadar samfälligheten eller drabbar en ägare oskäligt, och ett år när grunden är att det strider mot lag eller stadgar.

Här är det som spelar roll för en ägare utomlands: var du inte på stämman löper din frist från den dag beslutet meddelades dig. Inte från stämmodagen. Så spara kuvertet, eller mejlet, med dess datum. Det datumet är din startlinje och inget annat.

Ett villkor värt att kontrollera innan du planerar något: för att klandra behöver du normalt vara i fas med samfällighetsavgifterna, eller först ha deponerat det omtvistade beloppet i domstol.

Jag samlade fristerna, lagrummen de kommer från och vad du bör samla in på en sida:

{link}`,
    de: `Für alle, die in einer Eigentümergemeinschaft besitzen und bei der letzten Versammlung nicht dabei waren, ist das die Regel, die man am ehesten kennen sollte.

Wollen Sie einen Beschluss anfechten, beträgt die Frist drei Monate, wenn der Grund ist, dass er die Gemeinschaft schwer schädigt oder einen Eigentümer unbillig benachteiligt, und ein Jahr, wenn der Grund ist, dass er gegen Gesetz oder Satzung verstößt.

Und nun der Teil, auf den es für einen Eigentümer im Ausland ankommt: waren Sie nicht bei der Versammlung, läuft Ihre Frist ab dem Tag, an dem Ihnen der Beschluss mitgeteilt wurde. Nicht ab dem Versammlungstag. Heben Sie also den Umschlag oder die E-Mail mit ihrem Datum auf. Dieses Datum ist Ihre Startlinie, kein anderes.

Eine Bedingung, die sich vorher zu prüfen lohnt: um anzufechten, müssen Sie in der Regel mit den Gemeinschaftszahlungen aktuell sein oder den streitigen Betrag zuvor bei Gericht hinterlegt haben.

Ich habe die Fristen, die Artikel, aus denen sie stammen, und was zu sammeln ist, auf eine Seite gelegt:

{link}`,
    fr: `Pour toute personne propriétaire en copropriété qui n'était pas à la dernière assemblée, c'est la règle qu'il vaut le plus la peine de connaître.

Si vous voulez contester une décision, le délai est de trois mois lorsque le motif est qu'elle nuit gravement à la copropriété ou lèse injustement un copropriétaire, et d'un an lorsque le motif est qu'elle enfreint la loi ou les statuts.

Voici ce qui compte pour un propriétaire à l'étranger : si vous n'étiez pas à l'assemblée, votre délai court à partir du jour où la décision vous a été communiquée. Pas du jour de l'assemblée. Gardez donc l'enveloppe, ou le courriel, avec sa date. Cette date est votre ligne de départ, et aucune autre.

Une condition à vérifier avant de prévoir quoi que ce soit : pour contester, il faut en général être à jour des charges de copropriété, ou avoir préalablement consigné en justice le montant contesté.

J'ai mis les délais, les articles dont ils viennent et ce qu'il faut rassembler sur une seule page :

{link}`,
    nl: `Voor iedereen die in een VvE bezit en niet op de laatste vergadering was, is dit de regel die het meest de moeite waard is om te kennen.

Wilt u een besluit aanvechten, dan is de termijn drie maanden als de grond is dat het de vereniging ernstig schaadt of een eigenaar onredelijk benadeelt, en een jaar als de grond is dat het in strijd is met de wet of de statuten.

Dit is het deel dat telt voor een eigenaar in het buitenland: was u niet op de vergadering, dan loopt uw termijn vanaf de dag waarop het besluit aan u is meegedeeld. Niet vanaf de vergaderdag. Bewaar dus de envelop, of de e-mail, met de datum erop. Die datum is uw startstreep en geen andere.

Eén voorwaarde die het waard is vooraf te controleren: om aan te vechten moet u doorgaans bij zijn met de bijdragen aan de vereniging, of het betwiste bedrag eerst bij de rechtbank hebben gestort.

Ik heb de termijnen, de artikelen waar ze vandaan komen en wat u moet verzamelen op één pagina gezet:

{link}`,
  },
},
{
  key: 'builder-quote-red-flags',
  tool: 'contractor-check',
  kind: 'story',
  rules: [],
  text: {
    en: `Something I noticed reading through building jobs that went badly: the trouble was usually visible in the quote, and usually as something missing rather than something wrong.

No start and finish dates. No payment schedule tied to stages. Nothing saying who applies for the licence. Nothing about what happens to the rubble. No mention of the sign off certificate or its date, which is the date every guarantee period counts from. A total with no breakdown, so there is nothing to compare when the extras arrive.

None of that looks alarming on its own. Together it is a quote that has left every expensive question open, and open questions get answered later by whoever is holding the money.

I turned it into twelve questions you can answer from the piece of paper in front of you. It gives you a count of what is missing and the exact words to put back to the contractor, in English and in Spanish, so you are not translating a difficult conversation at the same time as having it.

{link}`,
    no: `Noe jeg la merke til da jeg leste gjennom byggejobber som gikk galt: problemet var som regel synlig i tilbudet, og som regel som noe som manglet, ikke noe som var feil.

Ingen start- og sluttdato. Ingen betalingsplan knyttet til faser. Ingenting om hvem som søker om tillatelsen. Ingenting om hva som skjer med riveavfallet. Ingen omtale av ferdigattesten eller datoen på den, som er datoen alle garantiperioder løper fra. En totalsum uten oppdeling, så det er ingenting å sammenligne med når tilleggene kommer.

Ingenting av dette ser alarmerende ut alene. Til sammen er det et tilbud som har latt hvert eneste dyre spørsmål stå åpent, og åpne spørsmål blir besvart senere av den som sitter på pengene.

Jeg gjorde det om til tolv spørsmål du kan svare på fra arket foran deg. Den gir deg en telling over det som mangler og de eksakte ordene du skal sende tilbake til entreprenøren, på engelsk og på spansk, så du slipper å oversette en vanskelig samtale mens du har den.

{link}`,
    sv: `Något jag lade märke till när jag gick igenom byggjobb som gick illa: problemet syntes oftast redan i offerten, och oftast som något som saknades snarare än något som var fel.

Inga start- och slutdatum. Ingen betalningsplan kopplad till etapper. Inget om vem som söker bygglovet. Inget om vad som händer med rivningsmassorna. Ingen nämnd av slutbeskedet eller dess datum, som är det datum varje garantitid räknas från. En totalsumma utan uppdelning, så det finns inget att jämföra med när tilläggen kommer.

Inget av det ser alarmerande ut för sig. Tillsammans är det en offert som lämnat varje dyr fråga öppen, och öppna frågor besvaras senare av den som håller i pengarna.

Jag gjorde om det till tolv frågor du kan besvara utifrån pappret framför dig. Den ger dig en räkning av vad som saknas och de exakta orden att skicka tillbaka till entreprenören, på engelska och på spanska, så du slipper översätta ett svårt samtal samtidigt som du har det.

{link}`,
    de: `Etwas, das mir beim Durchlesen schiefgegangener Bauvorhaben auffiel: das Problem war meist schon im Angebot sichtbar, und meist als etwas Fehlendes, nicht als etwas Falsches.

Kein Anfangs- und Endtermin. Kein an Bauabschnitte gekoppelter Zahlungsplan. Nichts dazu, wer die Genehmigung beantragt. Nichts dazu, was mit dem Bauschutt geschieht. Keine Erwähnung der Abnahmebescheinigung oder ihres Datums, und das ist das Datum, ab dem jede Gewährleistungsfrist zählt. Eine Gesamtsumme ohne Aufschlüsselung, sodass es nichts zu vergleichen gibt, wenn die Nachträge kommen.

Nichts davon wirkt für sich genommen alarmierend. Zusammen ist es ein Angebot, das jede teure Frage offengelassen hat, und offene Fragen beantwortet später derjenige, der das Geld hält.

Ich habe daraus zwölf Fragen gemacht, die Sie vom Blatt vor sich beantworten können. Sie bekommen eine Zählung dessen, was fehlt, und die genauen Worte für die Rückfrage an den Unternehmer, auf Englisch und auf Spanisch, damit Sie ein schwieriges Gespräch nicht auch noch übersetzen müssen, während Sie es führen.

{link}`,
    fr: `Quelque chose que j'ai remarqué en parcourant des chantiers qui ont mal tourné : le problème était en général déjà visible dans le devis, et le plus souvent comme un manque plutôt qu'une erreur.

Pas de dates de début et de fin. Pas d'échéancier de paiement adossé aux étapes. Rien sur qui demande le permis. Rien sur le sort des gravats. Aucune mention du certificat de réception ni de sa date, qui est pourtant la date d'où part chaque garantie. Un total sans détail, donc rien à comparer quand les suppléments arrivent.

Rien de tout cela n'est alarmant isolément. Ensemble, c'est un devis qui a laissé ouverte chaque question coûteuse, et les questions ouvertes sont tranchées plus tard par celui qui tient l'argent.

J'en ai fait douze questions auxquelles vous pouvez répondre à partir de la feuille devant vous. Elle vous donne le compte de ce qui manque et les mots exacts à renvoyer à l'entreprise, en anglais et en espagnol, pour ne pas avoir à traduire une conversation difficile en même temps que vous la menez.

{link}`,
    nl: `Iets dat me opviel bij het doorlezen van bouwklussen die misgingen: het probleem was meestal al zichtbaar in de offerte, en meestal als iets dat ontbrak in plaats van iets dat fout was.

Geen begin- en einddatum. Geen betalingsschema gekoppeld aan fases. Niets over wie de vergunning aanvraagt. Niets over wat er met het puin gebeurt. Geen vermelding van het opleveringscertificaat of de datum daarvan, en dat is de datum waarvandaan elke garantietermijn telt. Een totaalbedrag zonder specificatie, dus niets om mee te vergelijken als het meerwerk komt.

Niets daarvan oogt op zichzelf alarmerend. Samen is het een offerte die elke dure vraag open heeft gelaten, en open vragen worden later beantwoord door wie het geld vasthoudt.

Ik heb er twaalf vragen van gemaakt die u kunt beantwoorden vanaf het papier dat voor u ligt. Hij geeft u een telling van wat ontbreekt en de exacte woorden om terug te leggen bij de aannemer, in het Engels en in het Spaans, zodat u een lastig gesprek niet ook nog hoeft te vertalen terwijl u het voert.

{link}`,
  },
},
{
  key: 'what-a-year-actually-costs',
  tool: 'cost-audit',
  kind: 'story',
  rules: [],
  text: {
    en: `Every owner I have talked to can tell me what their place cost to buy. Almost nobody can tell me what it costs to keep, without going and looking.

That is not carelessness. The costs arrive separately and at different times of year, in different currencies sometimes, from six or seven different places. Account charges. Electricity standing charge, which runs whether anyone is there or not. Water. Insurance. The community charge. IBI. The gestoria. Individually none of them is worth a morning's attention, so none of them gets one.

I built a page that puts the year in one column. You put in what you actually pay, line by line, and it shows you the total and where it sits against what the same property typically costs.

The point is not to make anyone feel bad about a number. It is that you cannot decide whether a cost is worth it until you can see it next to the others.

{link}`,
    no: `Hver eier jeg har snakket med kan si hva boligen kostet å kjøpe. Nesten ingen kan si hva den koster å ha, uten å gå og se etter.

Det er ikke slurv. Kostnadene kommer hver for seg og på ulike tider av året, noen ganger i ulike valutaer, fra seks eller sju forskjellige steder. Kontogebyrer. Fastledd på strøm, som løper enten noen er der eller ikke. Vann. Forsikring. Fellesutgifter. IBI. Gestoria. Hver for seg er ingen av dem verdt en formiddag, så ingen av dem får en.

Jeg laget en side som setter hele året i én kolonne. Du legger inn det du faktisk betaler, post for post, og den viser totalen og hvor den ligger mot det samme type bolig vanligvis koster.

Poenget er ikke å få noen til å føle seg dårlig over et tall. Det er at du ikke kan avgjøre om en kostnad er verdt det før du ser den ved siden av de andre.

{link}`,
    sv: `Varje ägare jag har talat med kan säga vad bostaden kostade att köpa. Nästan ingen kan säga vad den kostar att ha, utan att gå och kolla.

Det är inte slarv. Kostnaderna kommer var för sig och vid olika tider på året, ibland i olika valutor, från sex eller sju olika håll. Kontoavgifter. Fast elavgift, som löper oavsett om någon är där. Vatten. Försäkring. Samfällighetsavgiften. IBI. Gestorian. Var för sig är ingen av dem värd en förmiddag, så ingen får en.

Jag byggde en sida som lägger hela året i en kolumn. Du fyller i vad du faktiskt betalar, rad för rad, och den visar totalen och var den ligger mot vad samma sorts bostad brukar kosta.

Poängen är inte att få någon att må dåligt över en siffra. Det är att du inte kan avgöra om en kostnad är värd den förrän du ser den bredvid de andra.

{link}`,
    de: `Jeder Eigentümer, mit dem ich gesprochen habe, kann mir sagen, was die Immobilie im Kauf gekostet hat. Fast niemand kann sagen, was sie im Unterhalt kostet, ohne erst nachzusehen.

Das ist keine Nachlässigkeit. Die Kosten kommen getrennt und zu verschiedenen Zeiten im Jahr, manchmal in verschiedenen Währungen, aus sechs oder sieben verschiedenen Richtungen. Kontoentgelte. Der Grundpreis beim Strom, der läuft, ob jemand da ist oder nicht. Wasser. Versicherung. Das Hausgeld. IBI. Die gestoria. Einzeln ist keine davon einen Vormittag wert, also bekommt keine einen.

Ich habe eine Seite gebaut, die das ganze Jahr in eine Spalte legt. Sie tragen ein, was Sie tatsächlich zahlen, Posten für Posten, und sie zeigt die Summe und wo sie im Vergleich zu dem liegt, was dieselbe Art Immobilie üblicherweise kostet.

Es geht nicht darum, jemandem wegen einer Zahl ein schlechtes Gefühl zu machen. Es geht darum, dass man nicht entscheiden kann, ob eine Kostenposition es wert ist, solange man sie nicht neben den anderen sieht.

{link}`,
    fr: `Chaque propriétaire à qui j'ai parlé peut me dire ce que son bien a coûté à l'achat. Presque personne ne peut dire ce qu'il coûte à garder, sans aller vérifier.

Ce n'est pas de la négligence. Les coûts arrivent séparément et à différents moments de l'année, parfois dans différentes devises, de six ou sept endroits différents. Les frais de compte. L'abonnement électrique, qui court que quelqu'un soit là ou non. L'eau. L'assurance. Les charges de copropriété. L'IBI. Le gestoria. Pris isolément, aucun ne vaut une matinée d'attention, donc aucun n'en reçoit.

J'ai fait une page qui met l'année entière dans une seule colonne. Vous saisissez ce que vous payez réellement, ligne par ligne, et elle affiche le total et sa position par rapport à ce que coûte habituellement le même type de bien.

L'idée n'est pas de faire culpabiliser sur un chiffre. C'est qu'on ne peut pas décider si une dépense en vaut la peine avant de la voir à côté des autres.

{link}`,
    nl: `Elke eigenaar met wie ik heb gesproken kan zeggen wat de woning kostte om te kopen. Bijna niemand kan zeggen wat hij kost om te houden, zonder het op te zoeken.

Dat is geen slordigheid. De kosten komen apart en op verschillende momenten in het jaar, soms in verschillende valuta, uit zes of zeven verschillende hoeken. Rekeningkosten. Het vastrecht op stroom, dat doorloopt of er nu iemand is of niet. Water. Verzekering. De VvE-bijdrage. IBI. De gestoria. Afzonderlijk is geen ervan een ochtend aandacht waard, dus krijgt geen ervan die.

Ik heb een pagina gemaakt die het hele jaar in één kolom zet. U vult in wat u werkelijk betaalt, regel voor regel, en hij toont het totaal en waar dat staat ten opzichte van wat hetzelfde soort woning normaal kost.

Het gaat er niet om iemand een rotgevoel te geven over een bedrag. Het gaat erom dat u niet kunt bepalen of een kostenpost het waard is voordat u hem naast de andere ziet.

{link}`,
  },
},
{
  key: 'leaving-it-empty',
  tool: 'closing-up',
  kind: 'story',
  rules: ['squat.second_home_is_morada'],
  text: {
    en: `The question I get more than any other in autumn: what do I actually need to do before I lock up for the winter?

There is a long version and a short version, and the short version depends on three things nobody asks about. How long you will be away. Which season it is. And whether anyone is going to look in while you are gone. Those three change the list more than the size of the property does.

One thing worth knowing, since it comes up in every one of these conversations: a second home or a seasonal residence does count as a morada under Spanish law, provided the legitimate occupiers carry on their private life there, even occasionally. That is a more reassuring position than most owners abroad assume they are in.

I built a checklist that takes those three answers and gives you a dated list for the last day, rather than a generic one you have to filter yourself:

{link}`,
    no: `Spørsmålet jeg får mer enn noe annet om høsten: hva må jeg egentlig gjøre før jeg låser for vinteren?

Det finnes en lang og en kort versjon, og den korte avhenger av tre ting ingen spør om. Hvor lenge du blir borte. Hvilken årstid det er. Og om noen kommer til å se innom mens du er borte. De tre endrer listen mer enn størrelsen på boligen gjør.

Én ting er verdt å vite, siden den kommer opp i hver eneste av disse samtalene: en sekundærbolig eller en sesongbolig regnes som en morada etter spansk rett, forutsatt at de rettmessige beboerne lever sitt privatliv der, selv leilighetsvis. Det er en mer betryggende posisjon enn de fleste eiere i utlandet antar at de står i.

Jeg laget en sjekkliste som tar de tre svarene og gir deg en datert liste for den siste dagen, i stedet for en generisk en du selv må sile:

{link}`,
    sv: `Frågan jag får mer än någon annan på hösten: vad behöver jag egentligen göra innan jag låser för vintern?

Det finns en lång och en kort version, och den korta beror på tre saker ingen frågar om. Hur länge du är borta. Vilken årstid det är. Och om någon kommer att titta till stället medan du är borta. De tre ändrar listan mer än bostadens storlek gör.

En sak är värd att veta, eftersom den kommer upp i vartenda sådant samtal: en andrabostad eller en säsongsbostad räknas som en morada enligt spansk rätt, förutsatt att de rättmätiga boende lever sitt privatliv där, om än tillfälligt. Det är ett tryggare läge än de flesta ägare utomlands utgår från att de befinner sig i.

Jag byggde en checklista som tar de tre svaren och ger dig en daterad lista för sista dagen, i stället för en generisk som du själv måste sålla i:

{link}`,
    de: `Die Frage, die ich im Herbst häufiger bekomme als jede andere: was muss ich eigentlich tun, bevor ich für den Winter abschließe?

Es gibt eine lange und eine kurze Fassung, und die kurze hängt an drei Dingen, nach denen niemand fragt. Wie lange Sie weg sind. Welche Jahreszeit es ist. Und ob jemand nach dem Rechten sieht, während Sie fort sind. Diese drei verändern die Liste stärker als die Größe der Immobilie.

Eines lohnt zu wissen, weil es in jedem dieser Gespräche aufkommt: eine Zweitwohnung oder eine Saisonwohnung gilt nach spanischem Recht sehr wohl als morada, sofern die rechtmäßigen Bewohner dort ihr Privatleben führen, und sei es gelegentlich. Das ist eine beruhigendere Lage, als die meisten Eigentümer im Ausland annehmen.

Ich habe eine Checkliste gebaut, die diese drei Antworten nimmt und Ihnen eine datierte Liste für den letzten Tag gibt, statt einer allgemeinen, die Sie selbst filtern müssen:

{link}`,
    fr: `La question que l'on me pose le plus en automne : que faut-il vraiment faire avant de fermer pour l'hiver ?

Il y a une version longue et une version courte, et la courte dépend de trois choses que personne ne demande. Combien de temps vous serez absent. La saison. Et si quelqu'un passera jeter un œil pendant votre absence. Ces trois-là changent la liste davantage que la taille du bien.

Une chose vaut la peine d'être sue, car elle revient dans chacune de ces conversations : une résidence secondaire ou saisonnière est bien une morada en droit espagnol, dès lors que les occupants légitimes y mènent leur vie privée, même occasionnellement. C'est une position plus rassurante que ce que supposent la plupart des propriétaires à l'étranger.

J'ai fait une liste qui prend ces trois réponses et vous donne une liste datée pour le dernier jour, plutôt qu'une liste générique à filtrer vous-même :

{link}`,
    nl: `De vraag die ik in het najaar vaker krijg dan welke andere ook: wat moet ik eigenlijk doen voordat ik voor de winter afsluit?

Er is een lange en een korte versie, en de korte hangt af van drie dingen waar niemand naar vraagt. Hoe lang u weg bent. Welk seizoen het is. En of er iemand gaat kijken terwijl u weg bent. Die drie veranderen de lijst meer dan de grootte van de woning doet.

Eén ding is het waard te weten, omdat het in elk van deze gesprekken opkomt: een tweede woning of een seizoenswoning telt naar Spaans recht wel degelijk als een morada, mits de rechtmatige bewoners er hun privéleven leiden, al is het af en toe. Dat is een geruststellender positie dan de meeste eigenaren in het buitenland aannemen.

Ik heb een checklist gemaakt die die drie antwoorden neemt en u een gedateerde lijst voor de laatste dag geeft, in plaats van een algemene die u zelf moet uitfilteren:

{link}`,
  },
},
{
  key: 'utilities-in-order',
  tool: 'utility-setup',
  kind: 'informative',
  rules: ['nie.form', 'nie.fee'],
  text: {
    en: `Getting the utilities on in a Spanish property is not one process. It is five, and two of them cannot start until something else has finished.

Power, water, gas, internet and the council charge each have their own office, their own form and their own document list. The ordering is the part that costs people weeks: start the wrong one first and you wait, then start it again.

Two small things that save a lot of confusion at the front of it. The NIE application form is the EX-15. The EX-18 is the EU citizen registration certificate and is a different procedure entirely, so being sent away with the wrong one is common. The tasa for assignment of a NIE is 9.84 euros.

I built a page that asks six questions about your situation and gives you the order the five have to happen in, with the documents each one needs:

{link}`,
    no: `Å få strøm og vann på plass i en spansk bolig er ikke én prosess. Det er fem, og to av dem kan ikke starte før noe annet er ferdig.

Strøm, vann, gass, internett og den kommunale avgiften har hver sitt kontor, sitt skjema og sin dokumentliste. Rekkefølgen er det som koster folk uker: starter du med feil, venter du, og så starter du på nytt.

To små ting som sparer mye forvirring i starten. Søknadsskjemaet for NIE er EX-15. EX-18 er registreringsbeviset for EU-borgere og er en helt annen prosedyre, så det er vanlig å bli sendt bort med feil skjema. Gebyret for tildeling av NIE er 9,84 euro.

Jeg laget en side som stiller seks spørsmål om situasjonen din og gir deg rekkefølgen de fem må skje i, med dokumentene hver av dem krever:

{link}`,
    sv: `Att få igång el och vatten i en spansk bostad är inte en process. Det är fem, och två av dem kan inte börja förrän något annat är klart.

El, vatten, gas, internet och den kommunala avgiften har var sitt kontor, sin blankett och sin dokumentlista. Ordningen är det som kostar folk veckor: börjar du med fel sak får du vänta, och sedan börja om.

Två små saker som sparar mycket förvirring i början. Ansökningsblanketten för NIE är EX-15. EX-18 är registreringsbeviset för EU-medborgare och är en helt annan procedur, så det är vanligt att bli bortskickad med fel blankett. Avgiften för tilldelning av NIE är 9,84 euro.

Jag byggde en sida som ställer sex frågor om din situation och ger dig ordningen de fem måste ske i, med dokumenten var och en kräver:

{link}`,
    de: `Die Versorgung in einer spanischen Immobilie anzumelden ist nicht ein Vorgang. Es sind fünf, und zwei davon können nicht beginnen, bevor etwas anderes fertig ist.

Strom, Wasser, Gas, Internet und die kommunale Abgabe haben je ein eigenes Amt, ein eigenes Formular und eine eigene Dokumentenliste. Die Reihenfolge kostet die Leute Wochen: fängt man mit dem Falschen an, wartet man und fängt dann noch einmal an.

Zwei Kleinigkeiten, die am Anfang viel Verwirrung ersparen. Das Antragsformular für die NIE ist das EX-15. Das EX-18 ist die Anmeldebescheinigung für EU-Bürger und ein völlig anderes Verfahren, weshalb es häufig vorkommt, dass man mit dem falschen Formular weggeschickt wird. Die Gebühr für die Zuteilung einer NIE beträgt 9,84 Euro.

Ich habe eine Seite gebaut, die sechs Fragen zu Ihrer Lage stellt und Ihnen die Reihenfolge nennt, in der die fünf ablaufen müssen, mit den Unterlagen, die jeder Schritt braucht:

{link}`,
    fr: `Mettre les compteurs en service dans un bien espagnol n'est pas une démarche. C'en est cinq, et deux d'entre elles ne peuvent pas commencer tant qu'autre chose n'est pas terminé.

Électricité, eau, gaz, internet et la taxe communale ont chacun leur guichet, leur formulaire et leur liste de pièces. C'est l'ordre qui coûte des semaines : commencez par la mauvaise et vous attendez, puis vous recommencez.

Deux petites choses qui évitent beaucoup de confusion au départ. Le formulaire de demande de NIE est l'EX-15. L'EX-18 est le certificat d'enregistrement des citoyens de l'UE et relève d'une procédure entièrement différente, d'où le nombre de gens renvoyés avec le mauvais imprimé. La taxe pour l'attribution d'un NIE est de 9,84 euros.

J'ai fait une page qui pose six questions sur votre situation et vous donne l'ordre dans lequel les cinq doivent se dérouler, avec les documents que chacune réclame :

{link}`,
    nl: `De nutsvoorzieningen aansluiten in een Spaanse woning is niet één proces. Het zijn er vijf, en twee daarvan kunnen pas beginnen als iets anders klaar is.

Stroom, water, gas, internet en de gemeentelijke heffing hebben elk hun eigen loket, hun eigen formulier en hun eigen documentenlijst. De volgorde is wat mensen weken kost: begin je met de verkeerde, dan wacht je, en begin je opnieuw.

Twee kleine dingen die vooraan veel verwarring besparen. Het aanvraagformulier voor de NIE is de EX-15. De EX-18 is het registratiebewijs voor EU-burgers en is een heel andere procedure, dus met het verkeerde formulier weggestuurd worden komt vaak voor. De leges voor toekenning van een NIE bedragen 9,84 euro.

Ik heb een pagina gemaakt die zes vragen over uw situatie stelt en u de volgorde geeft waarin de vijf moeten gebeuren, met de documenten die elk ervan nodig heeft:

{link}`,
  },
},
{
  key: 'tradesperson-in-your-language',
  tool: 'spain-directory',
  kind: 'story',
  rules: [],
  text: {
    en: `A pattern I kept seeing in this group and others: someone needs a plumber, twenty people reply with a name, and none of the replies says the one thing the person actually needs to know, which is whether the plumber can be understood on the phone in a hurry.

Recommendations are personal and they do not travel. The plumber who is perfect for someone who speaks Spanish is not necessarily the right call for someone who does not, especially when the call happens with water coming through a ceiling.

So I built a directory that sorts on exactly that. Plumber, electrician, locksmith, air conditioning engineer, pool service or builder, in 660 Spanish towns, ranked from Google reviews, with the ones already reviewed in your own language coming first. You say which language you need help in and the page reorders itself.

It is free, there is no listing fee and nobody pays to be higher up. If your town looks thin or something is out of date, tell me and I will look at it.

{link}`,
    no: `Et mønster jeg stadig ser i denne gruppen og andre: noen trenger en rørlegger, tjue personer svarer med et navn, og ingen av svarene sier det ene personen faktisk trenger å vite, nemlig om rørleggeren kan forstås på telefonen når det haster.

Anbefalinger er personlige, og de lar seg ikke flytte. Rørleggeren som er perfekt for en som snakker spansk er ikke nødvendigvis riktig samtale for en som ikke gjør det, særlig når samtalen skjer med vann gjennom taket.

Så jeg bygde en katalog som sorterer på nøyaktig det. Rørlegger, elektriker, låsesmed, klimaanleggmontør, bassengservice eller byggmester, i 660 spanske byer, rangert fra Google-anmeldelser, med de som allerede er vurdert på ditt eget språk først. Du sier hvilket språk du trenger hjelp på, og siden sorterer seg om.

Den er gratis, det finnes ingen oppføringsavgift og ingen betaler for å ligge høyere. Ser byen din tynn ut, eller er noe utdatert, si fra så ser jeg på det.

{link}`,
    sv: `Ett mönster jag ser om och om igen i den här gruppen och andra: någon behöver en rörmokare, tjugo personer svarar med ett namn, och inget av svaren säger det enda personen faktiskt behöver veta, nämligen om rörmokaren går att förstå i telefon när det brådskar.

Rekommendationer är personliga och de går inte att flytta. Rörmokaren som är perfekt för någon som talar spanska är inte nödvändigtvis rätt samtal för någon som inte gör det, särskilt när samtalet sker med vatten genom taket.

Så jag byggde en katalog som sorterar på precis det. Rörmokare, elektriker, låssmed, luftkonditioneringstekniker, poolservice eller byggare, i 660 spanska orter, rankade utifrån Google-omdömen, med dem som redan är omdömda på ditt eget språk först. Du anger vilket språk du behöver hjälp på och sidan sorterar om sig.

Den är gratis, det finns ingen listningsavgift och ingen betalar för att ligga högre. Ser din ort tunn ut, eller är något inaktuellt, säg till så tittar jag på det.

{link}`,
    de: `Ein Muster, das mir in dieser und anderen Gruppen immer wieder auffällt: jemand braucht einen Installateur, zwanzig Leute antworten mit einem Namen, und keine der Antworten sagt das Eine, was die Person wirklich wissen muss, nämlich ob man den Installateur am Telefon in Eile versteht.

Empfehlungen sind persönlich und lassen sich nicht übertragen. Der Installateur, der für jemanden perfekt ist, der Spanisch spricht, ist nicht zwangsläufig der richtige Anruf für jemanden, der es nicht tut, erst recht nicht, wenn der Anruf stattfindet, während Wasser durch die Decke kommt.

Also habe ich ein Verzeichnis gebaut, das genau danach sortiert. Installateur, Elektriker, Schlüsseldienst, Klimatechniker, Poolservice oder Bauunternehmer, in 660 spanischen Orten, nach Google-Bewertungen gereiht, mit denen zuerst, die bereits in Ihrer eigenen Sprache bewertet wurden. Sie sagen, in welcher Sprache Sie Hilfe brauchen, und die Seite ordnet sich um.

Sie ist kostenlos, es gibt keine Eintragsgebühr und niemand zahlt dafür, weiter oben zu stehen. Wirkt Ihr Ort dünn besetzt oder ist etwas veraltet, sagen Sie mir Bescheid, dann sehe ich es mir an.

{link}`,
    fr: `Un schéma que je vois sans cesse dans ce groupe et dans d'autres : quelqu'un cherche un plombier, vingt personnes répondent avec un nom, et aucune des réponses ne dit la seule chose que la personne a vraiment besoin de savoir, à savoir si l'on comprend ce plombier au téléphone quand c'est urgent.

Les recommandations sont personnelles et elles ne se transportent pas. Le plombier parfait pour quelqu'un qui parle espagnol n'est pas forcément le bon appel pour quelqu'un qui ne le parle pas, surtout quand l'appel se passe avec de l'eau qui traverse un plafond.

J'ai donc construit un annuaire qui trie exactement là-dessus. Plombier, électricien, serrurier, technicien de climatisation, entretien de piscine ou maçon, dans 660 communes espagnoles, classés à partir des avis Google, avec en premier ceux déjà évalués dans votre propre langue. Vous indiquez la langue dans laquelle vous avez besoin d'aide et la page se réorganise.

C'est gratuit, il n'y a pas de frais d'inscription et personne ne paie pour remonter. Si votre commune paraît peu fournie, ou si quelque chose n'est plus à jour, dites-le-moi et j'irai voir.

{link}`,
    nl: `Een patroon dat ik steeds zie in deze groep en in andere: iemand heeft een loodgieter nodig, twintig mensen antwoorden met een naam, en geen van de antwoorden zegt het enige dat die persoon echt moet weten, namelijk of de loodgieter aan de telefoon te verstaan is als het haast heeft.

Aanbevelingen zijn persoonlijk en laten zich niet verplaatsen. De loodgieter die perfect is voor iemand die Spaans spreekt, is niet per se het juiste telefoontje voor iemand die dat niet doet, zeker niet als dat telefoontje plaatsvindt terwijl er water door een plafond komt.

Dus bouwde ik een gids die precies daarop sorteert. Loodgieter, elektricien, slotenmaker, airco-monteur, zwembadservice of aannemer, in 660 Spaanse plaatsen, gerangschikt op Google-recensies, met degenen die al in uw eigen taal zijn beoordeeld bovenaan. U geeft aan in welke taal u hulp nodig heeft en de pagina sorteert zichzelf opnieuw.

Hij is gratis, er is geen vermeldingskosten en niemand betaalt om hoger te staan. Ziet uw plaats er mager uit, of is iets verouderd, laat het me weten dan kijk ik ernaar.

{link}`,
  },
},
{
  key: 'who-does-what',
  tool: 'spain-professionals',
  kind: 'informative',
  rules: [],
  text: {
    en: `Four Spanish job titles that get used as if they were interchangeable, and are not.

An abogado is a lawyer and runs a case. A gestoria handles administrative filings and paperwork, and does not litigate. An administrador de fincas manages the community of owners, its accounts and its meetings. A procurador represents you procedurally before the court alongside your abogado.

Getting this wrong costs time rather than money, usually. You explain the whole situation to someone who was never the right person for it, and then explain it again.

There is a second layer too. Estate agent, architect, valuer, insurance broker and sworn translator all show up in a property problem and each does a narrow, specific thing.

So I built a page that explains what each one actually does before it shows you anyone. Then it ranks your town, with the ones already reviewed in your language first.

{link}`,
    no: `Fire spanske yrkestitler som brukes som om de var utbyttbare, og ikke er det.

En abogado er advokat og fører saken. En gestoria tar seg av administrative innleveringer og papirarbeid, og fører ikke rettssaker. En administrador de fincas forvalter sameiet, regnskapet og møtene. En procurador representerer deg prosessuelt overfor domstolen ved siden av advokaten din.

Å bomme på dette koster som regel tid, ikke penger. Du forklarer hele situasjonen til en som aldri var rett person for den, og så forklarer du den en gang til.

Det finnes et lag til. Eiendomsmegler, arkitekt, takstmann, forsikringsmegler og statsautorisert translatør dukker alle opp i et eiendomsproblem, og hver av dem gjør én smal, bestemt ting.

Så jeg laget en side som forklarer hva hver av dem faktisk gjør før den viser deg noen. Deretter rangerer den byen din, med de som allerede er vurdert på ditt språk først.

{link}`,
    sv: `Fyra spanska yrkestitlar som används som om de vore utbytbara, och inte är det.

En abogado är advokat och driver ärendet. En gestoria sköter administrativa inlämningar och pappersarbete, och driver inte processer. En administrador de fincas förvaltar samfälligheten, dess räkenskaper och dess stämmor. En procurador företräder dig processuellt inför domstolen vid sidan av din advokat.

Att missa det här kostar oftast tid, inte pengar. Du förklarar hela situationen för någon som aldrig var rätt person för den, och sedan förklarar du den en gång till.

Det finns ett lager till. Mäklare, arkitekt, värderingsman, försäkringsmäklare och auktoriserad translator dyker alla upp i ett fastighetsproblem, och var och en gör en smal, bestämd sak.

Så jag byggde en sida som förklarar vad var och en faktiskt gör innan den visar dig någon. Sedan rankar den din ort, med dem som redan är omdömda på ditt språk först.

{link}`,
    de: `Vier spanische Berufsbezeichnungen, die benutzt werden, als wären sie austauschbar, und es nicht sind.

Ein abogado ist Anwalt und führt den Fall. Eine gestoria erledigt Verwaltungsanmeldungen und Papierkram und prozessiert nicht. Ein administrador de fincas verwaltet die Eigentümergemeinschaft, ihre Abrechnung und ihre Versammlungen. Ein procurador vertritt Sie verfahrensrechtlich vor Gericht, neben Ihrem Anwalt.

Das zu verwechseln kostet meist Zeit, nicht Geld. Sie schildern die ganze Lage jemandem, der nie der Richtige dafür war, und schildern sie dann noch einmal.

Es gibt noch eine zweite Ebene. Makler, Architekt, Gutachter, Versicherungsmakler und beeidigter Übersetzer tauchen alle in einem Immobilienproblem auf, und jeder macht eine enge, bestimmte Sache.

Also habe ich eine Seite gebaut, die erklärt, was jeder tatsächlich tut, bevor sie Ihnen irgendjemanden zeigt. Danach reiht sie Ihren Ort, mit denen zuerst, die bereits in Ihrer Sprache bewertet wurden.

{link}`,
    fr: `Quatre intitulés espagnols que l'on emploie comme s'ils étaient interchangeables, et qui ne le sont pas.

Un abogado est un avocat et mène le dossier. Un gestoria s'occupe des déclarations administratives et de la paperasse, et ne plaide pas. Un administrador de fincas gère la copropriété, ses comptes et ses assemblées. Un procurador vous représente sur le plan procédural devant le tribunal, aux côtés de votre avocat.

Se tromper là-dessus coûte du temps plutôt que de l'argent, en général. Vous exposez toute la situation à quelqu'un qui n'était pas la bonne personne, puis vous l'exposez une seconde fois.

Il y a une deuxième couche. Agent immobilier, architecte, expert évaluateur, courtier en assurance et traducteur assermenté apparaissent tous dans un problème immobilier, et chacun fait une chose étroite et précise.

J'ai donc fait une page qui explique ce que chacun fait réellement avant de vous montrer qui que ce soit. Ensuite elle classe votre commune, avec en premier ceux déjà évalués dans votre langue.

{link}`,
    nl: `Vier Spaanse beroepsaanduidingen die worden gebruikt alsof ze uitwisselbaar zijn, en dat niet zijn.

Een abogado is advocaat en voert de zaak. Een gestoria doet administratieve aangiftes en papierwerk, en procedeert niet. Een administrador de fincas beheert de vereniging van eigenaren, de administratie en de vergaderingen. Een procurador vertegenwoordigt u procesrechtelijk bij de rechtbank, naast uw advocaat.

Dit verwarren kost meestal tijd, geen geld. U legt de hele situatie uit aan iemand die er nooit de juiste persoon voor was, en legt hem daarna nog een keer uit.

Er is nog een tweede laag. Makelaar, architect, taxateur, verzekeringsmakelaar en beëdigd vertaler duiken allemaal op bij een vastgoedprobleem, en elk doet één smalle, specifieke ding.

Dus maakte ik een pagina die uitlegt wat elk van hen werkelijk doet voordat hij u iemand laat zien. Daarna rangschikt hij uw plaats, met degenen die al in uw taal zijn beoordeeld bovenaan.

{link}`,
  },
},
{
  key: 'maintenance-is-a-year',
  tool: 'maintenance-schedule',
  kind: 'story',
  rules: [],
  text: {
    en: `Something that took me a while to see: maintenance on a Spanish property is not a list of jobs, it is a calendar.

Sun, salt and a wet winter break different things, and they break them at different times of year. A job done in the right month prevents something. The same job done in the wrong month is just work.

The other half of it, for anyone who is not there most of the year, is that some of these cannot be done by the owner at all, because they have to happen while nobody is in the country. Knowing which ones those are is what turns a list into a plan you can hand to someone.

So I built it as a twelve month schedule rather than a checklist. Five questions about the property, and each job comes out saying what it prevents and what has to happen when you are not there.

{link}`,
    no: `Noe det tok meg en stund å se: vedlikehold på en spansk eiendom er ikke en liste over oppgaver, det er en kalender.

Sol, salt og en våt vinter ødelegger ulike ting, og de gjør det på ulike tider av året. En jobb gjort i riktig måned forebygger noe. Den samme jobben i feil måned er bare arbeid.

Den andre halvdelen, for alle som ikke er der mesteparten av året, er at noen av disse ikke kan gjøres av eieren i det hele tatt, fordi de må skje mens ingen er i landet. Å vite hvilke det er, er det som gjør en liste om til en plan du kan gi videre til noen.

Så jeg bygde det som et tolvmånedersskjema i stedet for en sjekkliste. Fem spørsmål om eiendommen, og hver jobb kommer ut med hva den forebygger og hva som må skje når du ikke er der.

{link}`,
    sv: `Något det tog mig ett tag att se: underhåll på en spansk fastighet är inte en lista över jobb, det är en kalender.

Sol, salt och en blöt vinter förstör olika saker, och de gör det vid olika tider på året. Ett jobb gjort i rätt månad förebygger något. Samma jobb i fel månad är bara arbete.

Den andra halvan, för alla som inte är där större delen av året, är att vissa av dem inte kan göras av ägaren alls, eftersom de måste ske medan ingen är i landet. Att veta vilka de är gör en lista till en plan du kan lämna över till någon.

Så jag byggde det som ett tolvmånadersschema i stället för en checklista. Fem frågor om fastigheten, och varje jobb kommer ut med vad det förebygger och vad som måste ske när du inte är där.

{link}`,
    de: `Etwas, das ich eine Weile gebraucht habe zu sehen: Instandhaltung an einer spanischen Immobilie ist keine Liste von Arbeiten, sie ist ein Kalender.

Sonne, Salz und ein nasser Winter zerstören Unterschiedliches, und sie tun es zu unterschiedlichen Zeiten im Jahr. Eine Arbeit im richtigen Monat verhindert etwas. Dieselbe Arbeit im falschen Monat ist nur Arbeit.

Die andere Hälfte davon, für alle, die den größten Teil des Jahres nicht dort sind: manche dieser Arbeiten kann der Eigentümer gar nicht selbst erledigen, weil sie stattfinden müssen, während niemand im Land ist. Zu wissen, welche das sind, macht aus einer Liste einen Plan, den man jemandem in die Hand geben kann.

Also habe ich es als Zwölfmonatsplan gebaut statt als Checkliste. Fünf Fragen zur Immobilie, und jede Arbeit kommt mit dem heraus, was sie verhindert, und dem, was geschehen muss, wenn Sie nicht da sind.

{link}`,
    fr: `Quelque chose que j'ai mis du temps à voir : l'entretien d'un bien espagnol n'est pas une liste de travaux, c'est un calendrier.

Le soleil, le sel et un hiver humide abîment des choses différentes, et à des moments différents de l'année. Un travail fait au bon mois prévient quelque chose. Le même travail au mauvais mois n'est que du travail.

L'autre moitié, pour qui n'est pas sur place la plupart de l'année, c'est que certains de ces travaux ne peuvent pas être faits par le propriétaire du tout, parce qu'ils doivent avoir lieu quand personne n'est dans le pays. Savoir lesquels, c'est ce qui transforme une liste en un plan que l'on peut confier à quelqu'un.

Je l'ai donc construit comme un calendrier sur douze mois plutôt qu'une checklist. Cinq questions sur le bien, et chaque travail ressort en disant ce qu'il prévient et ce qui doit se passer quand vous n'êtes pas là.

{link}`,
    nl: `Iets waar ik een tijd over deed om te zien: onderhoud aan een Spaanse woning is geen lijst met klussen, het is een kalender.

Zon, zout en een natte winter slopen verschillende dingen, en ze doen dat op verschillende momenten in het jaar. Een klus in de juiste maand voorkomt iets. Dezelfde klus in de verkeerde maand is alleen maar werk.

De andere helft, voor wie er het grootste deel van het jaar niet is: sommige klussen kan de eigenaar helemaal niet zelf doen, omdat ze moeten gebeuren terwijl er niemand in het land is. Weten welke dat zijn, maakt van een lijst een plan dat u aan iemand kunt overdragen.

Dus bouwde ik het als een twaalfmaandsschema in plaats van een checklist. Vijf vragen over de woning, en elke klus komt eruit met wat hij voorkomt en wat er moet gebeuren als u er niet bent.

{link}`,
  },
},
{
  key: 'pests-by-property',
  tool: 'pest-plan',
  kind: 'informative',
  rules: [],
  text: {
    en: `Three things about a Spanish property each attract something different, and they hardly overlap: warm weather, a garden, and long empty periods.

Which is why the general advice never quite fits. The advice that works for a ground floor flat with a terrace is not the advice for a villa with pines and a pool, and neither is the advice for somewhere that stands empty from October to April.

The empty period is the one owners abroad underestimate. Nothing is disturbed, nothing is noticed, and the first sign of a problem is the one you see in the spring, by which point the useful moment to act was months ago.

I built a page that asks five questions and gives you the pests most likely for your particular property, the signs to look for, what prevents each one, and which ones are honestly not a job for the owner.

That last part matters. Some of these are a phone call, not a Saturday.

{link}`,
    no: `Tre ting ved en spansk eiendom tiltrekker seg hver sin ting, og de overlapper knapt: varmt vær, en hage, og lange perioder uten folk.

Derfor passer de generelle rådene aldri helt. Rådet som fungerer for en leilighet i første etasje med terrasse er ikke rådet for en villa med furu og basseng, og ingen av dem er rådet for et sted som står tomt fra oktober til april.

Den tomme perioden er den eiere i utlandet undervurderer. Ingenting blir forstyrret, ingenting blir lagt merke til, og det første tegnet på et problem er det du ser om våren, og da var det nyttige øyeblikket for å handle måneder siden.

Jeg laget en side som stiller fem spørsmål og gir deg de skadedyrene som er mest sannsynlige for akkurat din eiendom, tegnene å se etter, hva som forebygger hver av dem, og hvilke som ærlig talt ikke er en jobb for eieren.

Den siste delen betyr noe. Noen av disse er en telefonsamtale, ikke en lørdag.

{link}`,
    sv: `Tre saker hos en spansk fastighet drar var sin sak till sig, och de överlappar knappt: varmt väder, en trädgård, och långa tomma perioder.

Därför passar de allmänna råden aldrig riktigt. Rådet som fungerar för en bottenvåning med terrass är inte rådet för en villa med tallar och pool, och inget av dem är rådet för ett ställe som står tomt från oktober till april.

Den tomma perioden är den ägare utomlands underskattar. Inget störs, inget märks, och det första tecknet på ett problem är det du ser på våren, och då var det nyttiga ögonblicket att agera månader sedan.

Jag byggde en sida som ställer fem frågor och ger dig de skadedjur som är mest sannolika för just din fastighet, tecknen att leta efter, vad som förebygger vart och ett, och vilka som ärligt talat inte är ett jobb för ägaren.

Den sista delen spelar roll. Några av dem är ett telefonsamtal, inte en lördag.

{link}`,
    de: `Drei Dinge an einer spanischen Immobilie ziehen jeweils Verschiedenes an, und sie überschneiden sich kaum: warmes Wetter, ein Garten und lange leerstehende Zeiten.

Deshalb passen die allgemeinen Ratschläge nie ganz. Der Rat, der für eine Erdgeschosswohnung mit Terrasse gilt, ist nicht der Rat für eine Villa mit Pinien und Pool, und keiner von beiden ist der Rat für ein Haus, das von Oktober bis April leer steht.

Die leere Zeit ist die, die Eigentümer im Ausland unterschätzen. Nichts wird gestört, nichts fällt auf, und das erste Zeichen eines Problems ist das, was Sie im Frühjahr sehen, und da lag der nützliche Moment zum Handeln Monate zurück.

Ich habe eine Seite gebaut, die fünf Fragen stellt und Ihnen die für genau Ihre Immobilie wahrscheinlichsten Schädlinge nennt, die Anzeichen, worauf zu achten ist, was jeden davon verhindert, und welche ehrlicherweise keine Aufgabe für den Eigentümer sind.

Der letzte Teil zählt. Einige davon sind ein Telefonat, kein Samstag.

{link}`,
    fr: `Trois choses dans un bien espagnol attirent chacune quelque chose de différent, et elles se recoupent à peine : la chaleur, un jardin, et de longues périodes d'inoccupation.

C'est pourquoi les conseils généraux ne conviennent jamais tout à fait. Le conseil valable pour un rez-de-chaussée avec terrasse n'est pas celui d'une villa avec des pins et une piscine, et aucun des deux n'est celui d'un logement vide d'octobre à avril.

La période vide est celle que les propriétaires à l'étranger sous-estiment. Rien n'est dérangé, rien n'est remarqué, et le premier signe d'un problème est celui que vous voyez au printemps, alors que le bon moment pour agir était des mois plus tôt.

J'ai fait une page qui pose cinq questions et vous donne les nuisibles les plus probables pour votre bien précis, les signes à repérer, ce qui prévient chacun, et ceux qui, honnêtement, ne sont pas un travail de propriétaire.

Cette dernière partie compte. Certains d'entre eux sont un coup de téléphone, pas un samedi.

{link}`,
    nl: `Drie dingen aan een Spaanse woning trekken elk iets anders aan, en ze overlappen nauwelijks: warm weer, een tuin, en lange lege periodes.

Daarom past algemeen advies nooit helemaal. Het advies dat werkt voor een benedenwoning met terras is niet het advies voor een villa met pijnbomen en een zwembad, en geen van beide is het advies voor een huis dat van oktober tot april leegstaat.

De lege periode is degene die eigenaren in het buitenland onderschatten. Er wordt niets verstoord, er valt niets op, en het eerste teken van een probleem is wat u in het voorjaar ziet, en dan lag het nuttige moment om te handelen maanden terug.

Ik heb een pagina gemaakt die vijf vragen stelt en u de plagen geeft die voor precies uw woning het waarschijnlijkst zijn, de signalen om op te letten, wat elk ervan voorkomt, en welke eerlijk gezegd geen klus voor de eigenaar zijn.

Dat laatste deel doet ertoe. Sommige hiervan zijn een telefoontje, geen zaterdag.

{link}`,
  },
},
{
  key: 'pre-2019-mortgage-costs',
  tool: 'mortgage-claim',
  kind: 'informative',
  rules: [],
  text: {
    en: `If you took out a Spanish mortgage between 2000 and 2019, it is worth getting the file out and reading the completion costs.

Three things come up repeatedly in mortgages from that period: set-up fees charged entirely to the borrower, floor clauses that stopped the rate falling below a set level, and insurance sold alongside the loan. Whether any of them applies to you depends on your own deed and your own conditions, not on what happened to someone else with the same lender.

I want to be straight about the limits of a calculator here. It can estimate what was charged and what a claim of that type would typically cover. It cannot tell you whether a claim is still in time, because that depends on the type of claim and is genuinely contested. That part is a question for an abogado, with your deed in front of them.

What the page is good for is finding out in a couple of minutes whether it is worth asking the question at all:

{link}`,
    no: `Tok du opp et spansk boliglån mellom 2000 og 2019, er det verdt å finne fram mappen og lese gjennom kostnadene ved opprettelsen.

Tre ting går igjen i lån fra den perioden: etableringsgebyrer belastet låntakeren i sin helhet, gulvklausuler som hindret renten i å falle under et fastsatt nivå, og forsikring solgt sammen med lånet. Om noen av dem gjelder deg, avhenger av ditt eget dokument og dine egne vilkår, ikke av hva som skjedde med en annen i samme bank.

Jeg vil være ærlig om hva en kalkulator kan og ikke kan. Den kan anslå hva som ble belastet og hva et krav av den typen vanligvis dekker. Den kan ikke si om et krav fortsatt er i tide, for det avhenger av kravtypen og er reelt omstridt. Den delen er et spørsmål for en abogado, med dokumentet ditt foran seg.

Det siden er god til, er å finne ut på et par minutter om det i det hele tatt er verdt å stille spørsmålet:

{link}`,
    sv: `Tog du ett spanskt bolån mellan 2000 och 2019 är det värt att ta fram pärmen och läsa igenom kostnaderna vid uppläggningen.

Tre saker återkommer i lån från den perioden: uppläggningsavgifter som lades helt på låntagaren, golvklausuler som hindrade räntan från att falla under en viss nivå, och försäkring som såldes ihop med lånet. Om något av det gäller dig beror på din egen handling och dina egna villkor, inte på vad som hände någon annan i samma bank.

Jag vill vara rak om vad en kalkylator kan. Den kan uppskatta vad som togs ut och vad ett krav av den typen normalt täcker. Den kan inte säga om ett krav fortfarande är i tid, för det beror på kravtypen och är verkligt omtvistat. Den delen är en fråga för en abogado, med din handling framför sig.

Det sidan är bra på är att på ett par minuter ta reda på om det alls är värt att ställa frågan:

{link}`,
    de: `Haben Sie zwischen 2000 und 2019 ein spanisches Hypothekendarlehen aufgenommen, lohnt es, die Akte herauszuholen und die Abschlusskosten zu lesen.

Drei Dinge tauchen bei Darlehen aus dieser Zeit immer wieder auf: Bearbeitungsgebühren, die vollständig dem Darlehensnehmer auferlegt wurden, Zinsuntergrenzen, die verhinderten, dass der Satz unter ein festgelegtes Niveau fiel, und Versicherungen, die zusammen mit dem Darlehen verkauft wurden. Ob etwas davon auf Sie zutrifft, hängt von Ihrer eigenen Urkunde und Ihren eigenen Bedingungen ab, nicht davon, was jemand anderem bei demselben Institut widerfahren ist.

Ich will offen sein, was ein Rechner leisten kann. Er kann schätzen, was berechnet wurde und was ein Anspruch dieser Art typischerweise umfasst. Er kann nicht sagen, ob ein Anspruch noch rechtzeitig ist, denn das hängt von der Anspruchsart ab und ist wirklich umstritten. Dieser Teil ist eine Frage für einen abogado, mit Ihrer Urkunde vor sich.

Wofür die Seite gut ist: in ein paar Minuten herauszufinden, ob es überhaupt lohnt, die Frage zu stellen:

{link}`,
    fr: `Si vous avez souscrit un prêt immobilier espagnol entre 2000 et 2019, cela vaut la peine de ressortir le dossier et de relire les frais de mise en place.

Trois choses reviennent régulièrement dans les prêts de cette période : des frais de dossier mis entièrement à la charge de l'emprunteur, des clauses plancher empêchant le taux de descendre sous un niveau fixé, et des assurances vendues avec le prêt. Que l'une d'elles vous concerne dépend de votre propre acte et de vos propres conditions, pas de ce qui est arrivé à quelqu'un d'autre chez le même prêteur.

Je veux être clair sur les limites d'un calculateur. Il peut estimer ce qui a été facturé et ce qu'une réclamation de ce type couvre habituellement. Il ne peut pas vous dire si une réclamation est encore dans les délais, car cela dépend du type de réclamation et fait réellement débat. Cette partie est une question pour un abogado, votre acte sous les yeux.

Ce à quoi la page sert, c'est à savoir en deux minutes si la question mérite d'être posée :

{link}`,
    nl: `Heeft u tussen 2000 en 2019 een Spaanse hypotheek afgesloten, dan is het de moeite waard het dossier erbij te pakken en de afsluitkosten door te lezen.

Drie dingen komen telkens terug bij leningen uit die periode: afsluitkosten die volledig bij de kredietnemer werden gelegd, bodemclausules die verhinderden dat de rente onder een vastgesteld niveau zakte, en verzekeringen die naast de lening werden verkocht. Of iets daarvan op u van toepassing is, hangt af van uw eigen akte en uw eigen voorwaarden, niet van wat iemand anders bij dezelfde verstrekker overkwam.

Ik wil eerlijk zijn over wat een rekenhulp kan. Hij kan schatten wat er in rekening is gebracht en wat een vordering van dat type doorgaans dekt. Hij kan niet zeggen of een vordering nog op tijd is, want dat hangt van het soort vordering af en is werkelijk betwist. Dat deel is een vraag voor een abogado, met uw akte erbij.

Waar de pagina goed voor is, is in een paar minuten uitvinden of de vraag überhaupt de moeite waard is:

{link}`,
  },
},
];
