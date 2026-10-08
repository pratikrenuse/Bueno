// The posts that go into Facebook groups for 24/7 Spain and Bueno, and their translations.
//
// WHAT THIS IS, AND WHAT IT IS EMPHATICALLY NOT
// This is a personal surface. Pratik reviews and approves; Poornima publishes. It has nothing
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
//   - In the tool posts the first person is a builder, never an owner. Pratik does not own property in Spain,
//     so no post says or implies that he does. What he can honestly say is that this gets
//     asked in these groups constantly, that he read the official page, and that he built
//     something. He never invents a private conversation or a villa.
//   - No emoji, no em dash, no competitor named, no penalty-flavoured urgency.
//
// THE VOICE, SINCE 8 OCTOBER 2026
// All thirty posts were rewritten to TASTE.md at the repo root, the house voice taken from
// the human written getbueno.com blog: the reader's own question first, one small aside,
// practical detail, a calm close. Read TASTE.md before changing any text here. The facts
// did not move; every figure still traces to the rules named on each idea.
//
// WHAT CHANGED IN OCTOBER 2026
// Pratik's decision on 6 October 2026: the goal of these posts is tax leads for Bueno, so
// the old "no brand name" rule is gone and every post now names Bueno.
//   - There are two kinds of post. The original twenty point at a free tool on 24/7 Spain
//     and end with one line saying the site is sponsored by Bueno (SPONSOR below). Ten new
//     ones are about Bueno's own tax filing service and point at getbueno.com. Those have
//     tool 'bueno-tax', and they are written as "we", by the team, because that is who is
//     speaking. The figures about the service were read from getbueno.com on 6 October 2026.
//   - Danish is the seventh language. 24/7 Spain has no Danish pages, so a Danish tool post
//     links to the English tool and says so, and its sponsor line carries getbueno.com/dk.
//     A Danish Bueno post links to Bueno's own Danish tax page.
//   - QUEUE_ORDER is the order posts go out in, one a day. It alternates a Bueno post with a
//     24/7 Spain tax tool post for as long as both last, then runs through the rest.
//
// {link} is substituted at seed time with the localised URL, so a translated post can never
// end up pointing at the wrong page. The sponsor line is added by renderPost, which means it
// is part of the text Pratik reads and approves. Nothing is added after approval.

export const SITE = 'https://www.247spain.es';
export const BUENO = 'https://getbueno.com';
export const LANGS = ['en', 'no', 'sv', 'da', 'de', 'fr', 'nl'];
export const TRANSLATION_LANGS = LANGS.filter(l => l !== 'en');
export const LANG_NAME = {
  en: 'English', no: 'Norwegian', sv: 'Swedish', da: 'Danish',
  de: 'German', fr: 'French', nl: 'Dutch',
};

// The tool slug that marks a post about Bueno's own tax filing service. It is not a folder
// in this repo; it is a destination on getbueno.com.
export const BUENO_TOOL = 'bueno-tax';
export const isBuenoPost = (tool) => tool === BUENO_TOOL;

// Bueno's tax filing page in each language, as linked from the language switcher on
// getbueno.com on 6 October 2026.
const BUENO_TAX_PATH = {
  en: '/products/non-resident-tax-return/',
  no: '/no/eiendomslosninger/skatt/',
  sv: '/se/fastighetslosningar/fastighetsskatt/',
  da: '/dk/ejendomslosninger/ejendomsskat/',
  de: '/de/immobilienlosungen/grundsteuer/',
  fr: '/fr/solutions-immobilieres/taxe/',
  nl: '/nl/eigendomoplossingen/belasting/',
};

// The line that closes every 24/7 Spain tool post. Written out per language rather than
// translated at run time, so it is always the same sentence and always names Bueno.
export const SPONSOR = {
  en: '24/7 Spain is free to use and is sponsored by Bueno (getbueno.com).',
  no: '24/7 Spain er gratis å bruke og er sponset av Bueno (getbueno.com/no).',
  sv: '24/7 Spain är gratis att använda och sponsras av Bueno (getbueno.com/se).',
  da: 'Værktøjet er på engelsk. 24/7 Spain er gratis at bruge og er sponsoreret af Bueno (getbueno.com/dk).',
  de: '24/7 Spain ist kostenlos und wird von Bueno gesponsert (getbueno.com/de).',
  fr: '24/7 Spain est gratuit et sponsorisé par Bueno (getbueno.com/fr).',
  nl: '24/7 Spain is gratis te gebruiken en wordt gesponsord door Bueno (getbueno.com/nl).',
};

export function linkFor(tool, lang) {
  if (isBuenoPost(tool)) return `${BUENO}${BUENO_TAX_PATH[lang] || BUENO_TAX_PATH.en}`;
  // 24/7 Spain has no Danish pages, so Danish readers get the English tool.
  return lang === 'en' || lang === 'da' ? `${SITE}/${tool}` : `${SITE}/${lang}/${tool}`;
}

// The body of a post with its link in place and nothing after it.
export function renderBody(idea, lang) {
  const body = idea.text[lang];
  if (!body) return null;
  return body.replace(/\{link\}/g, linkFor(idea.tool, lang)).trim();
}

// The whole post as it is reviewed and published. A 24/7 Spain tool post closes with the
// sponsor line. A Bueno post already says who is speaking, so it gets nothing extra.
export function renderPost(idea, lang) {
  const body = renderBody(idea, lang);
  if (!body) return null;
  return isBuenoPost(idea.tool) ? body : `${body}\n\n${SPONSOR[lang]}`;
}

// Take the sponsor line back off an English text, so that an edited post can be translated
// as a body and have each language's own sponsor line put back on.
export function splitSponsor(text) {
  const t = String(text ?? '').trim();
  return t.endsWith(SPONSOR.en) ? { body: t.slice(0, -SPONSOR.en.length).trim(), sponsored: true } : { body: t, sponsored: false };
}

export const IDEAS = [
{
  key: 'ninety-days',
  tool: 'day-counter',
  kind: 'story',
  rules: ['schengen.short_stay', 'schengen.entry_exit_days'],
  text: {
    en: `Is it 90 days a year, or 90 days in 180? This keeps coming up in these groups, and the answers rarely agree.

It's 90 days in any rolling 180, not per calendar year. The day you land counts as a full day, and so does the day you fly home. So a long weekend uses four days, not two.

The rolling window is where people slip. You can be well under the limit in March and over it in May without booking a single extra trip, because a trip from last November or December can still be inside the window.

I got tired of working it out on the back of an envelope, so I built a free counter. Put in the trips you've taken and the ones you've booked. It shows what's left, the date the window clears, and the exact day a planned trip would tip you over.

Nothing to sign up for. If it disagrees with your own count, tell me (I'd rather fix it than have you trust it blindly).

Then book the flights and enjoy the time there.

{link}`,
    no: `Er det 90 dager i året, eller 90 dager av 180? Dette dukker stadig opp i disse gruppene, og svarene er sjelden enige.

Det er 90 dager innenfor enhver rullerende periode på 180, ikke per kalenderår. Dagen du lander, teller som en hel dag, og det gjør dagen du flyr hjem også. En langhelg bruker altså fire dager, ikke to.

Det rullerende vinduet er der folk sklir. Du kan ligge godt under grensen i mars og over den i mai uten å ha bestilt en eneste ekstra tur, fordi en tur fra november eller desember i fjor fortsatt kan ligge inne i vinduet.

Jeg ble lei av å regne det ut på baksiden av en konvolutt, så jeg laget en gratis teller. Legg inn turene du har tatt og dem du har bestilt. Den viser hva du har igjen, datoen vinduet blir fritt, og nøyaktig hvilken dag en planlagt tur ville tippet deg over.

Ingenting å registrere seg for. Er den uenig med din egen telling, si fra (jeg vil heller rette den enn at du stoler blindt på den).

Så kan du bestille flybillettene og nyte tiden der.

{link}`,
    sv: `Är det 90 dagar om året, eller 90 dagar av 180? Det här dyker upp hela tiden i de här grupperna, och svaren stämmer sällan överens.

Det är 90 dagar inom varje rullande period på 180, inte per kalenderår. Dagen du landar räknas som en hel dag, och det gör dagen du flyger hem också. En långhelg använder alltså fyra dagar, inte två.

Det rullande fönstret är där folk snubblar. Du kan ligga långt under gränsen i mars och över den i maj utan att ha bokat en enda extra resa, eftersom en resa i november eller december i fjol fortfarande kan ligga inom fönstret.

Jag tröttnade på att räkna på baksidan av ett kuvert, så jag byggde en gratis räknare. Lägg in resorna du har gjort och de du har bokat. Den visar vad du har kvar, datumet då fönstret blir fritt och exakt vilken dag en planerad resa skulle ta dig över gränsen.

Inget att registrera sig för. Stämmer den inte med din egen räkning, säg till (jag rättar den hellre än att du litar blint på den).

Sedan kan du boka flygen och njuta av tiden där.

{link}`,
    da: `Er det 90 dage om året, eller 90 dage ud af 180? Det dukker hele tiden op i de her grupper, og svarene er sjældent enige.

Det er 90 dage inden for enhver rullende periode på 180, ikke pr. kalenderår. Den dag, du lander, tæller som en hel dag, og det gør den dag, du flyver hjem, også. Så en forlænget weekend bruger fire dage, ikke to.

Det rullende vindue er der, hvor folk smutter. Du kan ligge langt under grænsen i marts og over den i maj uden at have bestilt en eneste ekstra tur, fordi en tur fra sidste november eller december stadig kan ligge inde i vinduet.

Jeg blev træt af at regne det ud på bagsiden af en kuvert, så jeg byggede en gratis tæller. Læg de ture ind, du har været på, og dem, du har bestilt. Den viser, hvad du har tilbage, hvilken dato vinduet er ryddet, og præcis hvilken dag en planlagt tur ville sende dig over grænsen.

Du skal ikke oprette dig nogen steder. Er den uenig med din egen optælling, så sig til (jeg vil hellere rette den, end at du stoler blindt på den).

Så kan du bestille flybilletterne og nyde tiden dernede.

{link}`,
    de: `Sind es 90 Tage im Jahr oder 90 Tage in 180? Die Frage kommt in diesen Gruppen immer wieder, und die Antworten stimmen selten überein.

Es sind 90 Tage in jedem rollierenden Zeitraum von 180 Tagen, nicht pro Kalenderjahr. Der Tag der Ankunft zählt als ganzer Tag, der Tag des Rückflugs ebenso. Ein langes Wochenende verbraucht also vier Tage, nicht zwei.

Beim rollierenden Fenster stolpern die Leute. Sie können im März weit unter der Grenze liegen und im Mai darüber, ohne eine einzige zusätzliche Reise zu buchen, weil eine Reise vom letzten November oder Dezember noch im Fenster liegen kann.

Ich hatte es satt, das auf der Rückseite eines Umschlags auszurechnen, also habe ich einen kostenlosen Zähler gebaut. Tragen Sie die Reisen ein, die Sie gemacht und die Sie gebucht haben. Er zeigt, was übrig ist, an welchem Tag das Fenster frei wird, und genau den Tag, an dem eine geplante Reise Sie über die Grenze bringen würde.

Keine Anmeldung nötig. Wenn er Ihrer eigenen Zählung widerspricht, sagen Sie es mir (ich repariere ihn lieber, als dass Sie ihm blind vertrauen).

Dann buchen Sie die Flüge und genießen Sie die Zeit dort.

{link}`,
    fr: `C'est 90 jours par an, ou 90 jours sur 180 ? La question revient sans cesse dans ces groupes, et les réponses concordent rarement.

C'est 90 jours sur toute période glissante de 180 jours, pas par année civile. Le jour de votre arrivée compte comme une journée entière, et le jour de votre retour aussi. Un long week-end utilise donc quatre jours, pas deux.

C'est la période glissante qui fait trébucher. Vous pouvez être bien en dessous de la limite en mars et au-dessus en mai sans avoir réservé un seul voyage de plus, parce qu'un séjour de novembre ou décembre dernier peut encore se trouver dans la fenêtre.

J'en ai eu assez de calculer au dos d'une enveloppe, alors j'ai créé un compteur gratuit. Entrez les voyages faits et ceux déjà réservés. Il vous montre ce qu'il reste, la date où la fenêtre se libère, et le jour exact où un voyage prévu vous ferait dépasser.

Aucune inscription n'est nécessaire. S'il ne donne pas le même résultat que votre propre calcul, dites-le-moi (je préfère le corriger plutôt que de vous voir lui faire confiance aveuglément).

Ensuite, réservez les vols et profitez de votre séjour.

{link}`,
    nl: `Is het 90 dagen per jaar, of 90 dagen binnen 180? Dit komt in deze groepen steeds terug, en de antwoorden zijn het zelden eens.

Het is 90 dagen binnen elke voortschrijdende periode van 180, niet per kalenderjaar. De dag dat u landt telt als hele dag, en de dag dat u terugvliegt ook. Een lang weekend kost dus vier dagen, geen twee.

Bij dat voortschrijdende venster gaat het mis. U kunt in maart ruim onder de grens zitten en in mei eroverheen zonder ook maar één extra reis te boeken, omdat een reis van afgelopen november of december nog in het venster kan vallen.

Ik werd het zat om het op de achterkant van een envelop uit te rekenen, dus heb ik een gratis teller gemaakt. Vul de reizen in die u heeft gemaakt en die u heeft geboekt. Hij toont wat er over is, de datum waarop het venster vrijkomt, en precies de dag waarop een geplande reis u eroverheen zou brengen.

U hoeft zich nergens voor aan te melden. Spreekt hij uw eigen telling tegen, laat het me weten (ik repareer hem liever dan dat u er blind op vertrouwt).

Boek dan de vluchten en geniet van de tijd daar.

{link}`,
  },
},
{
  key: 'imputed-income-empty-home',
  tool: 'tax-calculator',
  kind: 'informative',
  rules: ['irnr.imputed.base', 'irnr.imputed.no_deductions', 'irnr.rates'],
  text: {
    en: `Yes, you can owe Spanish tax on a home you never rent out. Even one you only use for three weeks a year.

It's called imputed income. Spain treats a second home that sits there at your disposal as if it earned an income, and then taxes that income.

The base isn't what you paid, and it isn't what the place is worth now. It's the cadastral value, the number printed on your IBI bill. Dig out the last one and have a look, because it's usually nothing like either of the other two.

Nothing comes off it either. Not the community fee, not the insurance, not even the IBI itself (which stings if you're used to deducting costs at home).

The rate is 19 percent if you live in the EU, Norway, Iceland or Liechtenstein, and 24 percent for everyone else.

This keeps coming up in these groups, so I built a free calculator that works it out from your cadastral value, including any earlier years you might not have filed.

{link}`,
    no: `Ja, du kan skylde spansk skatt på en bolig du aldri leier ut. Selv en du bare bruker tre uker i året.

Det heter imputert inntekt. Spania behandler en fritidsbolig som står til din disposisjon som om den ga en inntekt, og skattlegger så den inntekten.

Grunnlaget er ikke det du betalte, og det er ikke det boligen er verdt i dag. Det er katastralverdien, tallet som står trykt på IBI-regningen din. Finn frem den siste og ta en titt, for den ligner som regel ikke på noen av de to andre.

Ingenting trekkes fra heller. Ikke fellesutgiftene, ikke forsikringen, ikke engang selve IBI (det svir litt hvis du er vant til å trekke fra kostnader hjemme).

Satsen er 19 prosent hvis du bor i EU, Norge, Island eller Liechtenstein, og 24 prosent for alle andre.

Dette dukker stadig opp i disse gruppene, så jeg laget en gratis kalkulator som regner det ut fra katastralverdien din, inkludert tidligere år du kanskje ikke har levert for.

{link}`,
    sv: `Ja, du kan vara skyldig spansk skatt på en bostad du aldrig hyr ut. Även en som du bara använder tre veckor om året.

Det kallas schablonintäkt. Spanien behandlar ett fritidshus som står till ditt förfogande som om det gav en inkomst, och beskattar sedan den inkomsten.

Underlaget är inte vad du betalade, och inte vad bostaden är värd i dag. Det är taxeringsvärdet, siffran som står på din IBI-avi. Leta fram den senaste och titta, för den brukar inte likna någon av de andra två.

Inget dras av heller. Inte samfällighetsavgiften, inte försäkringen, inte ens IBI självt (vilket svider om du är van att dra av kostnader hemma).

Skattesatsen är 19 procent om du bor i EU, Norge, Island eller Liechtenstein, och 24 procent för alla andra.

Det här dyker upp hela tiden i de här grupperna, så jag byggde en gratis räknare som räknar ut det ur ditt taxeringsvärde, inklusive tidigare år som du kanske inte har deklarerat.

{link}`,
    da: `Ja, du kan skylde spansk skat af en bolig, du aldrig lejer ud. Også en, du kun bruger tre uger om året.

Det kaldes beregnet indkomst. Spanien behandler en fritidsbolig, der står til din rådighed, som om den gav en indtægt, og beskatter så den indtægt.

Grundlaget er ikke det, du betalte, og det er ikke det, boligen er værd i dag. Det er katasterværdien, det tal, der står trykt på din IBI-regning. Find den seneste frem og kig efter, for tallet ligner som regel ingen af de to andre.

Der bliver heller ikke trukket noget fra. Ikke fællesudgifterne, ikke forsikringen, ikke engang selve IBI (og det svier, hvis du er vant til at trække udgifter fra derhjemme).

Satsen er 19 procent, hvis du bor i EU, Norge, Island eller Liechtenstein, og 24 procent for alle andre.

Spørgsmålet dukker hele tiden op i de her grupper, så jeg byggede en gratis beregner, der regner det ud fra din katasterværdi, også for tidligere år, du måske ikke har indberettet.

{link}`,
    de: `Ja, Sie können spanische Steuer auf ein Haus schulden, das Sie nie vermieten. Selbst auf eines, das Sie nur drei Wochen im Jahr nutzen.

Das heißt fiktives Einkommen. Spanien behandelt eine Zweitwohnung, die Ihnen zur Verfügung steht, als würde sie ein Einkommen bringen, und besteuert dann dieses Einkommen.

Die Grundlage ist nicht der Kaufpreis und auch nicht der heutige Wert. Es ist der Katasterwert, die Zahl auf Ihrem IBI-Bescheid. Suchen Sie den letzten heraus und schauen Sie nach, denn meist hat er mit den beiden anderen Zahlen wenig zu tun.

Abziehen lässt sich auch nichts. Nicht das Hausgeld, nicht die Versicherung, nicht einmal die IBI selbst (das tut weh, wenn Sie es von zu Hause gewohnt sind, Kosten abzusetzen).

Der Satz liegt bei 19 Prozent, wenn Sie in der EU, in Norwegen, Island oder Liechtenstein leben, und bei 24 Prozent für alle anderen.

Die Frage kommt in diesen Gruppen immer wieder, also habe ich einen kostenlosen Rechner gebaut, der es aus Ihrem Katasterwert ausrechnet, auch für frühere Jahre, die Sie vielleicht nicht erklärt haben.

{link}`,
    fr: `Oui, vous pouvez devoir de l'impôt espagnol sur un logement que vous ne louez jamais. Même un logement que vous n'occupez que trois semaines par an.

Cela s'appelle le revenu imputé. L'Espagne considère qu'une résidence secondaire qui reste là, à votre disposition, produit un revenu, puis impose ce revenu.

La base n'est pas ce que vous avez payé, ni ce que le bien vaut aujourd'hui. C'est la valeur cadastrale, le chiffre imprimé sur votre avis d'IBI. Ressortez le dernier et regardez, parce qu'il ne ressemble en général à aucun des deux autres.

Rien ne s'en déduit non plus. Ni les charges de copropriété, ni l'assurance, ni même l'IBI (ce qui pique un peu si vous avez l'habitude de déduire vos frais chez vous).

Le taux est de 19 pour cent si vous vivez dans l'UE, en Norvège, en Islande ou au Liechtenstein, et de 24 pour cent pour tous les autres.

La question revient sans cesse dans ces groupes, alors j'ai créé un calculateur gratuit qui fait le calcul à partir de votre valeur cadastrale, y compris pour les années précédentes que vous n'auriez peut-être pas déclarées.

{link}`,
    nl: `Ja, u kunt Spaanse belasting verschuldigd zijn over een woning die u nooit verhuurt. Zelfs over een woning die u maar drie weken per jaar gebruikt.

Het heet fictief inkomen. Spanje behandelt een tweede woning die gewoon tot uw beschikking staat alsof die inkomen oplevert, en belast dan dat inkomen.

De grondslag is niet wat u betaalde, en ook niet wat de woning nu waard is. Het is de kadastrale waarde, het getal op uw IBI-aanslag. Zoek de laatste eens op en kijk ernaar, want het lijkt meestal op geen van beide andere bedragen.

Er gaat ook niets vanaf. Niet de VvE-bijdrage, niet de verzekering, zelfs de IBI zelf niet (en dat doet pijn als u gewend bent thuis kosten af te trekken).

Het tarief is 19 procent als u in de EU, Noorwegen, IJsland of Liechtenstein woont, en 24 procent voor alle anderen.

Deze vraag komt in deze groepen steeds terug, dus ik heb een gratis rekenhulp gemaakt die het uitrekent op basis van uw kadastrale waarde, inclusief eerdere jaren die u misschien niet heeft aangegeven.

{link}`,
  },
},
{
  key: 'quarterly-rental-filing-ends',
  tool: 'rental-tax',
  kind: 'informative',
  rules: ['deadline.rental.last_quarterly', 'deadline.rental.from_2026'],
  text: {
    en: `Q3 2026 is the last quarterly rental return. If you let a place in Spain, it's due between 1 and 20 October 2026, so you have until Tuesday.

After that, the rhythm changes. Rental income from 1 October onwards doesn't get its own quarter any more. It rolls into one annual return, filed in the first 20 days of April the following year.

So the next thing you file after this October isn't in January. It's April 2027, and it covers the last quarter of 2026.

This is the sort of change that catches organised people (four filings a year soon becomes a habit). Put April 2027 in the calendar now, while you're thinking about it.

I read the official order when it came out, and the question keeps coming up in these groups, so I built a free rental tax calculator. It works out what's owed on your rental income once the deductions you're entitled to are taken off.

{link}`,
    no: `Tredje kvartal 2026 er den siste kvartalsvise skattemeldingen for utleie. Leier du ut en bolig i Spania, skal den leveres mellom 1. og 20. oktober 2026, så du har frist til tirsdag.

Etter det endrer rytmen seg. Leieinntekt fra 1. oktober og utover får ikke lenger sitt eget kvartal. Den samles i én årlig skattemelding, som leveres de første 20 dagene i april året etter.

Det neste du leverer etter denne oktober, er altså ikke i januar. Det er april 2027, og det gjelder siste kvartal av 2026.

Dette er den typen endring som tar de ryddigste blant oss (fire leveringer i året blir fort en vane). Skriv april 2027 inn i kalenderen nå, mens du tenker på det.

Jeg leste den offisielle forskriften da den kom, og spørsmålet dukker stadig opp i disse gruppene, så jeg laget en gratis kalkulator for utleieskatt. Den regner ut hva du skylder på leieinntekten din når fradragene du har krav på, er trukket fra.

{link}`,
    sv: `Q3 2026 är den sista kvartalsvisa hyresdeklarationen. Hyr du ut en bostad i Spanien ska den in mellan 1 och 20 oktober 2026, så du har på dig till tisdag.

Därefter ändras rytmen. Hyresintäkter från 1 oktober och framåt får inget eget kvartal längre. De går in i en enda årsdeklaration, som lämnas in under de första 20 dagarna i april året därpå.

Nästa gång du deklarerar efter den här oktober är alltså inte i januari. Det är i april 2027, och den deklarationen täcker sista kvartalet 2026.

Det är den sortens ändring som tar ordningsamma människor på sängen (fyra deklarationer om året blir snabbt en vana). Skriv in april 2027 i kalendern nu, medan du tänker på det.

Jag läste den officiella förordningen när den kom, och frågan dyker upp hela tiden i de här grupperna, så jag byggde en gratis räknare för hyresskatt. Den räknar ut vad som ska betalas på dina hyresintäkter när de avdrag du har rätt till är dragna.

{link}`,
    da: `Q3 2026 er den sidste kvartalsvise selvangivelse for udlejning. Lejer du en bolig ud i Spanien, skal den ind mellem 1. og 20. oktober 2026, så du har til tirsdag.

Derefter ændrer rytmen sig. Lejeindtægt fra 1. oktober og frem får ikke længere sit eget kvartal. Den ryger ind i én årlig selvangivelse, som indsendes i de første 20 dage af april året efter.

Så det næste, du indsender efter oktober i år, ligger ikke i januar. Det er april 2027, og det dækker sidste kvartal af 2026.

Det er den slags ændring, der fanger folk, som har styr på tingene (fire indberetninger om året bliver hurtigt en vane). Skriv april 2027 i kalenderen nu, mens du tænker på det.

Jeg læste den officielle bekendtgørelse, da den kom, og spørgsmålet dukker hele tiden op i de her grupper, så jeg byggede en gratis beregner til skat af udlejning. Den regner ud, hvad du skylder af din lejeindtægt, når de fradrag, du har ret til, er trukket fra.

{link}`,
    de: `Q3 2026 ist die letzte vierteljährliche Mieterklärung. Wenn Sie in Spanien vermieten, ist sie zwischen dem 1. und dem 20. Oktober 2026 fällig, Sie haben also bis Dienstag Zeit.

Danach ändert sich der Rhythmus. Mieteinkünfte ab dem 1. Oktober bekommen kein eigenes Quartal mehr. Sie gehen in eine einzige Jahreserklärung ein, abzugeben in den ersten 20 Tagen des April im Folgejahr.

Das Nächste, was Sie nach diesem Oktober abgeben, ist also nicht im Januar. Es ist im April 2027, und es betrifft das letzte Quartal 2026.

Genau so eine Änderung erwischt die ordentlichen Leute (vier Erklärungen im Jahr werden schnell zur Gewohnheit). Tragen Sie den April 2027 jetzt in den Kalender ein, solange Sie daran denken.

Ich habe die offizielle Verordnung gelesen, als sie erschien, und die Frage kommt in diesen Gruppen immer wieder, also habe ich einen kostenlosen Rechner für die Mietsteuer gebaut. Er rechnet aus, was auf Ihre Mieteinkünfte zu zahlen ist, nachdem die Abzüge abgezogen sind, die Ihnen zustehen.

{link}`,
    fr: `Le troisième trimestre 2026 est la dernière déclaration locative trimestrielle. Si vous louez un bien en Espagne, elle est à déposer entre le 1er et le 20 octobre 2026, vous avez donc jusqu'à mardi.

Ensuite, le rythme change. Les revenus locatifs à partir du 1er octobre n'ont plus leur propre trimestre. Ils entrent dans une seule déclaration annuelle, déposée dans les 20 premiers jours d'avril de l'année suivante.

La prochaine déclaration après cet octobre n'est donc pas en janvier. C'est en avril 2027, et elle couvre le dernier trimestre 2026.

C'est le genre de changement qui piège les gens organisés (quatre déclarations par an, ça devient vite une habitude). Notez avril 2027 dans l'agenda maintenant, pendant que vous y pensez.

J'ai lu l'arrêté officiel à sa publication, et la question revient sans cesse dans ces groupes, alors j'ai créé un calculateur gratuit d'impôt locatif. Il calcule ce qui est dû sur vos revenus locatifs une fois déduits les frais auxquels vous avez droit.

{link}`,
    nl: `Q3 2026 is de laatste kwartaalaangifte voor huurinkomsten. Verhuurt u een woning in Spanje, dan moet die tussen 1 en 20 oktober 2026 binnen zijn, dus u heeft tot dinsdag.

Daarna verandert het ritme. Huurinkomsten vanaf 1 oktober krijgen geen eigen kwartaal meer. Ze gaan op in één jaarlijkse aangifte, in te dienen in de eerste 20 dagen van april van het jaar daarna.

Het eerstvolgende dat u na deze oktober indient is dus niet in januari. Het is april 2027, en het gaat over het laatste kwartaal van 2026.

Dit is het soort verandering dat juist georganiseerde mensen overvalt (vier aangiftes per jaar wordt al snel een gewoonte). Zet april 2027 nu in de agenda, nu u er toch aan denkt.

Ik heb de officiële regeling gelezen toen die uitkwam, en de vraag komt in deze groepen steeds terug, dus ik heb een gratis rekenhulp voor huurbelasting gemaakt. Die rekent uit wat er over uw huurinkomsten verschuldigd is nadat de aftrekposten waar u recht op heeft eraf zijn gehaald.

{link}`,
  },
},
{
  key: 'late-filing-two-regimes',
  tool: 'late-surcharge',
  kind: 'informative',
  rules: ['late.recargo.voluntary', 'late.recargo.excludes_penalty', 'late.recargo.reduction'],
  text: {
    en: `Before you work out what a late modelo 210 will cost, check one thing. Has the tax office written to you yet?

The answer puts you in one of two quite different regimes.

If you file late on your own, before any letter arrives, it's a surcharge. One percent, plus another one percent for every full month you're late, up to twelve. From month thirteen it becomes a flat fifteen percent plus interest. That surcharge replaces any penalty you could otherwise have been given. It's also reduced by twenty five percent if you pay in full inside the payment window that opens once they notify you.

Once a demand has arrived, none of that applies. You're in the other regime.

So if there's an unfiled year sitting at the back of your mind, start with the post, not the calculator. Spanish envelopes are easy to leave unopened on the hall table.

I built a free page for this. It asks which of the two you're in, works out the figure and shows you the date your clock started from.

{link}`,
    no: `Før du regner ut hva en for sent levert modelo 210 vil koste, sjekk én ting. Har skattekontoret skrevet til deg ennå?

Svaret plasserer deg i ett av to ganske ulike regelsett.

Leverer du for sent av deg selv, før noe brev har kommet, er det et tillegg. Én prosent, pluss én prosent til for hver hele måned du er forsinket, opp til tolv. Fra måned tretten blir det flate femten prosent pluss renter. Det tillegget erstatter en bot du ellers kunne ha fått. Det reduseres også med tjuefem prosent hvis du betaler alt innenfor betalingsfristen som åpner når de varsler deg.

Har et krav først kommet, gjelder ingenting av dette. Da er du i det andre regelsettet.

Har du et år du ikke har levert for i bakhodet, så begynn med posten, ikke kalkulatoren. Spanske konvolutter blir fort liggende uåpnet på bordet i gangen.

Jeg laget en gratis side for dette. Den spør hvilken av de to du er i, regner ut beløpet og viser deg datoen klokken din begynte å løpe fra.

{link}`,
    sv: `Innan du räknar ut vad en sen modelo 210 kommer att kosta, kolla en sak. Har skattemyndigheten skrivit till dig än?

Svaret placerar dig i ett av två ganska olika regelverk.

Lämnar du in sent på eget initiativ, innan något brev kommer, blir det ett tillägg. En procent, plus ytterligare en procent för varje hel månad du är sen, upp till tolv. Från månad tretton blir det fast femton procent plus ränta. Tillägget ersätter den sanktionsavgift du annars kunde ha fått. Det sätts också ned med tjugofem procent om du betalar hela beloppet inom den betalningsfrist som öppnar när de har underrättat dig.

När ett krav väl har kommit gäller inget av det. Då är du i det andra regelverket.

Har du ett odeklarerat år i bakhuvudet, börja alltså med posten, inte med räknaren. Spanska kuvert är lätta att lämna oöppnade på hallbordet.

Jag byggde en gratis sida för det här. Den frågar vilket av de två du befinner dig i, räknar ut beloppet och visar datumet din klocka började löpa från.

{link}`,
    da: `Før du regner ud, hvad en forsinket modelo 210 kommer til at koste, så tjek én ting. Har skattevæsenet skrevet til dig endnu?

Svaret placerer dig i ét af to ret forskellige regelsæt.

Indsender du for sent på eget initiativ, før der kommer noget brev, er det et tillæg. En procent, plus en procent mere for hver hele måned, du er forsinket, op til tolv. Fra måned tretten bliver det faste femten procent plus renter. Tillægget træder i stedet for den bøde, du ellers kunne have fået. Det bliver også sat ned med femogtyve procent, hvis du betaler det fulde beløb inden for den betalingsfrist, der åbner, når de har givet dig besked.

Er der først kommet et påkrav, gælder intet af det. Så er du i det andet regelsæt.

Så hvis der ligger et år, du ikke har indberettet, et sted i baghovedet, så start med posten, ikke med lommeregneren. Spanske kuverter er nemme at lade ligge uåbnede på bordet i entréen.

Jeg byggede en gratis side til det her. Den spørger, hvilket af de to du er i, regner beløbet ud og viser dig den dato, dit ur begyndte at tælle fra.

{link}`,
    de: `Bevor Sie ausrechnen, was eine verspätete modelo 210 kostet, prüfen Sie eine Sache. Hat Ihnen das Finanzamt schon geschrieben?

Die Antwort bringt Sie in eines von zwei ganz verschiedenen Regimen.

Geben Sie von sich aus verspätet ab, bevor ein Brief kommt, ist es ein Zuschlag. Ein Prozent, plus ein weiteres Prozent für jeden vollen Monat Verspätung, bis zu zwölf. Ab Monat dreizehn sind es pauschal fünfzehn Prozent plus Zinsen. Dieser Zuschlag ersetzt jede Sanktion, die Sie sonst hätten bekommen können. Er sinkt außerdem um fünfundzwanzig Prozent, wenn Sie ihn vollständig innerhalb der Zahlungsfrist begleichen, die nach der Mitteilung beginnt.

Ist eine Aufforderung einmal da, gilt nichts davon. Dann sind Sie im anderen Regime.

Wenn also irgendwo ein nicht erklärtes Jahr in Ihrem Hinterkopf sitzt, fangen Sie mit der Post an, nicht mit dem Rechner. Spanische Umschläge bleiben leicht ungeöffnet auf der Kommode im Flur liegen.

Ich habe dafür eine kostenlose Seite gebaut. Sie fragt, in welchem der beiden Fälle Sie sind, rechnet den Betrag aus und zeigt Ihnen das Datum, ab dem Ihre Frist lief.

{link}`,
    fr: `Avant de calculer ce que va coûter un modelo 210 en retard, vérifiez une chose. Le fisc vous a-t-il déjà écrit ?

La réponse vous place dans l'un de deux régimes bien différents.

Si vous déposez en retard de vous-même, avant l'arrivée de toute lettre, c'est une majoration. Un pour cent, plus un pour cent par mois complet de retard, jusqu'à douze. À partir du treizième mois, elle devient quinze pour cent forfaitaires plus les intérêts. Cette majoration remplace la sanction que vous auriez pu recevoir autrement. Elle est aussi réduite de vingt-cinq pour cent si vous payez la totalité dans le délai de paiement qui s'ouvre une fois la notification reçue.

Une fois qu'une mise en demeure est arrivée, rien de tout cela ne s'applique. Vous êtes dans l'autre régime.

Donc si une année non déclarée vous trotte dans la tête, commencez par le courrier, pas par la calculette. Les enveloppes espagnoles restent facilement fermées sur la console de l'entrée.

J'ai créé une page gratuite pour ça. Elle vous demande dans lequel des deux régimes vous êtes, calcule le montant et vous montre la date à partir de laquelle votre délai a commencé à courir.

{link}`,
    nl: `Voordat u uitrekent wat een te late modelo 210 gaat kosten, controleer eerst één ding. Heeft de belastingdienst u al geschreven?

Het antwoord plaatst u in een van twee heel verschillende regimes.

Dient u uit eigen beweging te laat in, voordat er een brief komt, dan is het een toeslag. Eén procent, plus nog eens één procent voor elke volle maand dat u te laat bent, tot twaalf. Vanaf maand dertien wordt het een vaste vijftien procent plus rente. Die toeslag komt in plaats van de boete die u anders had kunnen krijgen. Hij wordt bovendien met vijfentwintig procent verlaagd als u volledig betaalt binnen de betaaltermijn die opent zodra u de kennisgeving ontvangt.

Zodra er een aanmaning is gekomen, geldt daar niets meer van. Dan zit u in het andere regime.

Heeft u dus ergens in uw achterhoofd een jaar liggen dat niet is aangegeven, begin dan bij de post, niet bij de rekenhulp. Spaanse enveloppen blijven makkelijk ongeopend op het tafeltje in de gang liggen.

Ik heb hiervoor een gratis pagina gemaakt. Hij vraagt in welke van de twee u zit, rekent het bedrag uit en laat de datum zien waarvandaan uw termijn begon te lopen.

{link}`,
  },
},
{
  key: 'eu-eea-deductions',
  tool: 'rental-tax',
  kind: 'story',
  rules: ['irnr.rental.deductibility', 'irnr.rates'],
  text: {
    en: `Same flat, same rent, and two very different tax bills. It depends on where the owner lives.

I had to read the official page twice. Picture two flats in the same building, on the same floor, let for the same rent in the same year.

If the owner lives in an EU country, or in Norway, Iceland or Liechtenstein, they can deduct their costs. Management fees, insurance, repairs, the community charge, the mortgage interest, the depreciation. They're taxed on what's left, at 19 percent.

If the owner lives anywhere else, it's the gross rent. No deductions at all, at 24 percent.

The only thing that changed was where the owner sleeps at night.

If you're on the deductible side, go through the whole list and not just the obvious two or three. So I turned the list into a free page. You go through what you actually paid, line by line, and it shows you what you're allowed to claim.

Worth ten minutes, I think, before the next rental season starts.

{link}`,
    no: `Samme leilighet, samme leie, og to svært ulike skatteregninger. Det kommer an på hvor eieren bor.

Jeg måtte lese den offisielle siden to ganger. Se for deg to leiligheter i samme bygg, i samme etasje, leid ut for samme leie i samme år.

Bor eieren i et EU-land, eller i Norge, Island eller Liechtenstein, kan eieren trekke fra kostnadene sine. Administrasjonsgebyrer, forsikring, reparasjoner, fellesutgiftene, renter på boliglånet, avskrivningen. Det som er igjen, skattlegges med 19 prosent.

Bor eieren et annet sted, er det brutto leie. Ingen fradrag i det hele tatt, og 24 prosent.

Det eneste som var forskjellig, var hvor eieren sover om natten.

Er du på fradragssiden, gå gjennom hele listen og ikke bare de to-tre åpenbare. Så jeg gjorde listen om til en gratis side. Du går gjennom det du faktisk har betalt, linje for linje, og den viser deg hva du har lov til å trekke fra.

Verdt ti minutter, tror jeg, før neste utleiesesong starter.

{link}`,
    sv: `Samma lägenhet, samma hyra, och två mycket olika skatteräkningar. Det beror på var ägaren bor.

Jag fick läsa den officiella sidan två gånger. Tänk dig två lägenheter i samma hus, på samma våning, uthyrda för samma hyra samma år.

Bor ägaren i ett EU-land, eller i Norge, Island eller Liechtenstein, får ägaren dra av sina kostnader. Förvaltningsavgifter, försäkring, reparationer, samfällighetsavgiften, räntan på bolånet, avskrivningen. Skatten tas ut på det som blir kvar, med 19 procent.

Bor ägaren någon annanstans gäller bruttohyran. Inga avdrag alls, och 24 procent.

Det enda som skilde var var ägaren sover om natten.

Är du på den sidan där avdrag är tillåtna, gå igenom hela listan och inte bara de två eller tre självklara. Så jag gjorde om listan till en gratis sida. Du går igenom vad du faktiskt har betalat, rad för rad, och den visar vad du får dra av.

Värt tio minuter, tycker jag, innan nästa uthyrningssäsong börjar.

{link}`,
    da: `Samme lejlighed, samme leje og to vidt forskellige skatteregninger. Det afhænger af, hvor ejeren bor.

Jeg måtte læse den officielle side to gange. Forestil dig to lejligheder i samme bygning, på samme etage, udlejet til samme leje i samme år.

Bor ejeren i et EU-land, eller i Norge, Island eller Liechtenstein, kan vedkommende trække sine udgifter fra. Administration, forsikring, reparationer, fællesudgifter, renter på boliglånet, afskrivning. Skatten beregnes af det, der er tilbage, med 19 procent.

Bor ejeren et hvilket som helst andet sted, er det bruttolejen. Ingen fradrag overhovedet, med 24 procent.

Det eneste, der var anderledes, var, hvor ejeren sover om natten.

Er du på fradragssiden, så gå hele listen igennem og ikke kun de oplagte to eller tre. Derfor lavede jeg listen om til en gratis side. Du går igennem det, du rent faktisk har betalt, post for post, og den viser dig, hvad du har lov til at trække fra.

Det er ti minutter værd, synes jeg, før næste udlejningssæson starter.

{link}`,
    de: `Gleiche Wohnung, gleiche Miete und zwei ganz verschiedene Steuerbescheide. Es kommt darauf an, wo der Eigentümer lebt.

Ich musste die offizielle Seite zweimal lesen. Stellen Sie sich zwei Wohnungen im selben Haus vor, auf demselben Stockwerk, im selben Jahr zur selben Miete vermietet.

Lebt der Eigentümer in einem EU-Land oder in Norwegen, Island oder Liechtenstein, kann er seine Kosten absetzen. Verwaltungsgebühren, Versicherung, Reparaturen, Hausgeld, Hypothekenzinsen, Abschreibung. Besteuert wird, was übrig bleibt, mit 19 Prozent.

Lebt der Eigentümer anderswo, gilt die Bruttomiete. Gar keine Abzüge, und das mit 24 Prozent.

Das Einzige, was sich geändert hat, ist, wo der Eigentümer nachts schläft.

Wenn Sie auf der abzugsfähigen Seite stehen, gehen Sie die ganze Liste durch und nicht nur die offensichtlichen zwei oder drei Posten. Deshalb habe ich die Liste in eine kostenlose Seite verwandelt. Sie gehen Posten für Posten durch, was Sie tatsächlich gezahlt haben, und die Seite zeigt Ihnen, was Sie geltend machen dürfen.

Zehn Minuten wert, finde ich, bevor die nächste Mietsaison beginnt.

{link}`,
    fr: `Même appartement, même loyer, et deux factures fiscales très différentes. Tout dépend de l'endroit où vit le propriétaire.

J'ai dû lire la page officielle deux fois. Imaginez deux appartements dans le même immeuble, au même étage, loués au même loyer la même année.

Si le propriétaire vit dans un pays de l'UE, ou en Norvège, en Islande ou au Liechtenstein, il peut déduire ses frais. Frais de gestion, assurance, réparations, charges de copropriété, intérêts du prêt, amortissement. Il est imposé sur ce qui reste, à 19 pour cent.

Si le propriétaire vit ailleurs, c'est le loyer brut. Aucune déduction, et 24 pour cent.

La seule chose qui change, c'est l'endroit où le propriétaire dort la nuit.

Si vous êtes du côté où l'on déduit, parcourez toute la liste, pas seulement les deux ou trois postes évidents. J'ai donc transformé la liste en une page gratuite. Vous passez en revue ce que vous avez réellement payé, ligne par ligne, et elle vous montre ce que vous avez le droit de déduire.

Ça vaut dix minutes, je trouve, avant le début de la prochaine saison de location.

{link}`,
    nl: `Zelfde appartement, zelfde huur, en twee heel verschillende belastingaanslagen. Het hangt af van waar de eigenaar woont.

Ik moest de officiële pagina twee keer lezen. Stel u twee appartementen voor in hetzelfde gebouw, op dezelfde verdieping, verhuurd voor dezelfde huur in hetzelfde jaar.

Woont de eigenaar in een EU-land, of in Noorwegen, IJsland of Liechtenstein, dan mag hij zijn kosten aftrekken. Beheerkosten, verzekering, reparaties, de VvE-bijdrage, de hypotheekrente, de afschrijving. Hij wordt belast over wat overblijft, tegen 19 procent.

Woont de eigenaar ergens anders, dan geldt de brutohuur. Helemaal geen aftrek, tegen 24 procent.

Het enige dat verschilde, is waar de eigenaar 's nachts slaapt.

Zit u aan de aftrekbare kant, loop dan de hele lijst door en niet alleen de voor de hand liggende twee of drie posten. Daarom heb ik van de lijst een gratis pagina gemaakt. U loopt regel voor regel door wat u werkelijk betaalde, en hij laat zien wat u mag opvoeren.

Tien minuten waard, denk ik, voordat het volgende verhuurseizoen begint.

{link}`,
  },
},
{
  key: 'three-percent-retention',
  tool: 'sale-tax',
  kind: 'informative',
  rules: ['irnr.sale.retention', 'deadline.210.sale', 'irnr.rates'],
  text: {
    en: `When you sell in Spain as a non-resident, the buyer holds back 3 percent of the agreed price. That 3 percent is a payment towards your tax, not the tax itself.

The buyer pays it to the tax office on modelo 211 within a month of the sale. Think of it as a deposit against your capital gains tax, paid on your behalf, in advance.

Your actual capital gains tax is 19 percent of the gain. Not of the price, of the gain. And it's 19 percent for everybody, wherever you live.

So you have 3 percent of one number and 19 percent of a completely different number, and they can land either way round. If the 3 percent came to more than you owe, the difference comes back to you. If your gain was small, or you sold at a loss, most of it comes back.

The window for claiming it is an odd one. It opens a month after completion and closes three months after that, so put both dates in the calendar on completion day.

Selling questions keep coming up in these groups, so I built a free page that does the gain, the tax, the retention and the refund, and turns every deadline into a real date from your completion day.

{link}`,
    no: `Når du selger i Spania som ikke-bosatt, holder kjøperen tilbake 3 prosent av avtalt pris. De 3 prosentene er en innbetaling på skatten din, ikke selve skatten.

Kjøperen betaler det til skattekontoret på modelo 211 innen en måned etter salget. Tenk på det som et depositum mot gevinstskatten din, betalt på dine vegne, på forskudd.

Selve gevinstskatten er 19 prosent av gevinsten. Ikke av prisen, av gevinsten. Og det er 19 prosent for alle, uansett hvor du bor.

Du har altså 3 prosent av ett tall og 19 prosent av et helt annet tall, og de kan slå ut begge veier. Ble de 3 prosentene mer enn du skylder, får du differansen tilbake. Var gevinsten liten, eller solgte du med tap, kommer det meste tilbake.

Fristen for å kreve det er litt underlig. Den åpner en måned etter overtakelsen og lukker tre måneder etter det, så skriv begge datoene inn i kalenderen samme dag som overtakelsen.

Spørsmål om salg dukker stadig opp i disse gruppene, så jeg laget en gratis side som regner ut gevinsten, skatten, tilbakeholdet og refusjonen, og gjør hver frist om til en faktisk dato fra overtakelsesdagen din.

{link}`,
    sv: `När du säljer i Spanien som icke-bosatt håller köparen inne 3 procent av det avtalade priset. De 3 procenten är en betalning i förskott på din skatt, inte själva skatten.

Köparen betalar in dem till skattemyndigheten på modelo 211 inom en månad efter försäljningen. Se det som en handpenning på din kapitalvinstskatt, betald för din räkning, i förväg.

Din faktiska kapitalvinstskatt är 19 procent av vinsten. Inte av priset, av vinsten. Och den är 19 procent för alla, var du än bor.

Du har alltså 3 procent av ett tal och 19 procent av ett helt annat tal, och de kan landa åt vilket håll som helst. Var de 3 procenten mer än du är skyldig får du tillbaka mellanskillnaden. Var vinsten liten, eller sålde du med förlust, kommer det mesta tillbaka.

Fönstret för att begära tillbaka det är lite udda. Det öppnar en månad efter tillträdet och stänger tre månader efter det, så skriv in båda datumen i kalendern på tillträdesdagen.

Frågor om försäljning dyker upp hela tiden i de här grupperna, så jag byggde en gratis sida som räknar ut vinsten, skatten, innehållandet och återbetalningen, och gör om varje frist till ett riktigt datum utifrån din tillträdesdag.

{link}`,
    da: `Når du sælger i Spanien som ikke-resident, holder køberen 3 procent af den aftalte pris tilbage. De 3 procent er en betaling på din skat, ikke selve skatten.

Køberen betaler dem til skattevæsenet på modelo 211 inden for en måned efter salget. Tænk på det som et depositum på din avanceskat, betalt på dine vegne, på forskud.

Din egentlige avanceskat er 19 procent af gevinsten. Ikke af prisen, af gevinsten. Og det er 19 procent for alle, uanset hvor du bor.

Så du har 3 procent af ét tal og 19 procent af et helt andet tal, og det kan falde ud til begge sider. Blev de 3 procent til mere, end du skylder, får du forskellen tilbage. Var din gevinst lille, eller solgte du med tab, får du det meste tilbage.

Fristen for at søge om det er lidt sær. Den åbner en måned efter overdragelsen og lukker tre måneder efter det, så skriv begge datoer i kalenderen på overdragelsesdagen.

Spørgsmål om salg dukker hele tiden op i de her grupper, så jeg byggede en gratis side, der regner gevinsten, skatten, tilbageholdelsen og tilbagebetalingen ud og laver hver frist om til en rigtig dato ud fra din overdragelsesdag.

{link}`,
    de: `Wenn Sie als Nichtresident in Spanien verkaufen, behält der Käufer 3 Prozent des vereinbarten Preises ein. Diese 3 Prozent sind eine Zahlung auf Ihre Steuer, nicht die Steuer selbst.

Der Käufer führt sie innerhalb eines Monats nach dem Verkauf mit modelo 211 an das Finanzamt ab. Betrachten Sie es als Anzahlung auf Ihre Steuer auf den Veräußerungsgewinn, für Sie geleistet, im Voraus.

Ihre eigentliche Steuer auf den Veräußerungsgewinn beträgt 19 Prozent des Gewinns. Nicht des Preises, des Gewinns. Und es sind 19 Prozent für alle, egal wo Sie leben.

Sie haben also 3 Prozent von einer Zahl und 19 Prozent von einer ganz anderen, und das kann in beide Richtungen ausgehen. Waren die 3 Prozent mehr, als Sie schulden, bekommen Sie die Differenz zurück. War Ihr Gewinn klein, oder haben Sie mit Verlust verkauft, kommt das meiste davon zurück.

Das Fenster für den Antrag ist eigenartig. Es öffnet sich einen Monat nach der Übergabe und schließt drei Monate danach, also tragen Sie beide Daten am Tag der Übergabe in den Kalender ein.

Fragen zum Verkauf kommen in diesen Gruppen immer wieder, also habe ich eine kostenlose Seite gebaut, die Gewinn, Steuer, Einbehalt und Erstattung berechnet und jede Frist ab Ihrem Übergabetag in ein echtes Datum verwandelt.

{link}`,
    fr: `Quand vous vendez en Espagne en tant que non-résident, l'acheteur retient 3 pour cent du prix convenu. Ces 3 pour cent sont un acompte sur votre impôt, pas l'impôt lui-même.

L'acheteur les verse au fisc sur le modelo 211 dans le mois qui suit la vente. Voyez-les comme un dépôt sur votre impôt sur la plus-value, versé pour vous, à l'avance.

Votre véritable impôt sur la plus-value est de 19 pour cent du gain. Pas du prix, du gain. Et c'est 19 pour cent pour tout le monde, où que vous viviez.

Vous avez donc 3 pour cent d'un chiffre et 19 pour cent d'un tout autre chiffre, et la balance peut pencher dans un sens comme dans l'autre. Si les 3 pour cent dépassent ce que vous devez, la différence vous revient. Si votre gain était faible, ou si vous avez vendu à perte, l'essentiel vous revient.

La fenêtre pour le réclamer est curieuse. Elle s'ouvre un mois après la signature et se ferme trois mois plus tard, alors notez les deux dates le jour de la signature.

Les questions sur la vente reviennent sans cesse dans ces groupes, alors j'ai créé une page gratuite qui calcule le gain, l'impôt, la retenue et le remboursement, et transforme chaque échéance en date réelle à partir de votre jour de signature.

{link}`,
    nl: `Verkoopt u in Spanje als niet-resident, dan houdt de koper 3 procent van de afgesproken prijs in. Die 3 procent is een betaling op uw belasting, niet de belasting zelf.

De koper draagt het binnen een maand na de verkoop met modelo 211 af aan de belastingdienst. Zie het als een voorschot op uw vermogenswinstbelasting, namens u vooruitbetaald.

Uw werkelijke vermogenswinstbelasting is 19 procent van de winst. Niet van de prijs, van de winst. En dat is 19 procent voor iedereen, waar u ook woont.

U heeft dus 3 procent van het ene bedrag en 19 procent van een heel ander bedrag, en het kan beide kanten op vallen. Was die 3 procent meer dan u verschuldigd bent, dan krijgt u het verschil terug. Was uw winst klein, of verkocht u met verlies, dan komt het meeste terug.

Het venster om het terug te vragen is een vreemde. Het opent een maand na de overdracht en sluit drie maanden daarna, dus zet beide data op de dag van de overdracht in de agenda.

Vragen over verkopen komen in deze groepen steeds terug, dus ik heb een gratis pagina gemaakt die de winst, de belasting, de inhouding en de teruggaaf uitrekent, en elke termijn omzet in een echte datum vanaf uw overdrachtsdag.

{link}`,
  },
},
{
  key: 'plusvalia-two-methods',
  tool: 'sale-tax',
  kind: 'informative',
  rules: ['plusvalia.methods', 'plusvalia.no_gain', 'plusvalia.deadlines'],
  text: {
    en: `Most sellers meet the plusvalia for the first time at the notary's table, about ninety seconds before they're asked to accept it.

It's the municipal tax on the sale, and three things make it much less frightening than it sounds.

There are two ways of calculating it, and you can pick. The objective method takes the cadastral value of the land (the land only, not the whole property) and multiplies it by a coefficient for how long you owned it. The real gain method uses the actual increase between what the two deeds say. Whichever comes out lower is the one you can go with.

If there was no increase at all, there's nothing to pay. You still declare the sale and hand over both deeds, but there's no bill.

The deadline is thirty working days from the date of the deed. Working days, not calendar days.

One honest caveat. The coefficients, the rate, and whether your town wants a declaration or a self assessment all vary by municipality, so the final number comes from the town hall.

I built a free tool that walks through both methods, so you can sit down at the notary already knowing what to ask:

{link}`,
    no: `De fleste selgere møter plusvalia for første gang ved notarens bord, omtrent nitti sekunder før de blir bedt om å godta den.

Det er den kommunale skatten ved salget, og tre ting gjør den langt mindre skremmende enn den høres ut.

Det finnes to måter å beregne den på, og du kan velge. Den objektive metoden tar katastralverdien av tomten (bare tomten, ikke hele eiendommen) og ganger den med en koeffisient for hvor lenge du eide den. Metoden for faktisk gevinst bruker den reelle økningen mellom det de to skjøtene sier. Den som gir lavest beløp, er den du kan gå for.

Var det ingen økning i det hele tatt, er det ingenting å betale. Du oppgir likevel salget og leverer begge skjøtene, men det kommer ingen regning.

Fristen er tretti virkedager fra datoen på skjøtet. Virkedager, ikke kalenderdager.

Ett ærlig forbehold. Koeffisientene, satsen og om kommunen din vil ha en erklæring eller en egenberegning, varierer fra kommune til kommune, så det endelige tallet kommer fra rådhuset.

Jeg laget et gratis verktøy som går gjennom begge metodene, så du kan sette deg ved notarens bord og allerede vite hva du skal spørre om:

{link}`,
    sv: `De flesta säljare möter plusvalian för första gången vid notariens bord, ungefär nittio sekunder innan de ombeds godkänna den.

Det är den kommunala skatten vid försäljning, och tre saker gör den mycket mindre skrämmande än den låter.

Det finns två sätt att räkna ut den, och du får välja. Den objektiva metoden tar taxeringsvärdet för marken (bara marken, inte hela fastigheten) och multiplicerar det med en koefficient för hur länge du ägt den. Metoden med verklig vinst använder den faktiska ökningen mellan vad de två köpebreven säger. Den som ger lägst belopp är den du kan välja.

Blev det ingen ökning alls finns det inget att betala. Du deklarerar ändå försäljningen och lämnar in båda köpebreven, men det kommer ingen räkning.

Fristen är trettio arbetsdagar från datumet på köpebrevet. Arbetsdagar, inte kalenderdagar.

En ärlig reservation. Koefficienterna, skattesatsen och om din kommun vill ha en anmälan eller en egen beräkning varierar mellan kommuner, så den slutliga siffran kommer från kommunen.

Jag byggde ett gratis verktyg som går igenom båda metoderna, så att du kan sätta dig hos notarien och redan veta vad du ska fråga om:

{link}`,
    da: `De fleste sælgere møder plusvalia for første gang ved notarens bord, cirka halvfems sekunder før de bliver bedt om at acceptere den.

Det er den kommunale skat på salget, og tre ting gør den meget mindre skræmmende, end den lyder.

Den kan beregnes på to måder, og du må vælge. Den objektive metode tager grundens katasterværdi (kun grunden, ikke hele boligen) og ganger den med en koefficient for, hvor længe du har ejet den. Metoden med reel gevinst bruger den faktiske stigning mellem det, der står i de to skøder. Den, der giver det laveste beløb, er den, du kan gå med.

Var der slet ingen stigning, er der intet at betale. Du skal stadig anmelde salget og aflevere begge skøder, men der kommer ingen regning.

Fristen er tredive arbejdsdage fra skødets dato. Arbejdsdage, ikke kalenderdage.

Ét ærligt forbehold. Koefficienterne, satsen og om din kommune vil have en anmeldelse eller en selvberegning, varierer fra kommune til kommune, så det endelige tal kommer fra rådhuset.

Jeg byggede et gratis værktøj, der går begge metoder igennem, så du kan sætte dig ved notarens bord og allerede vide, hvad du skal spørge om:

{link}`,
    de: `Die meisten Verkäufer begegnen der Plusvalia zum ersten Mal am Tisch des Notars, etwa neunzig Sekunden, bevor sie sie akzeptieren sollen.

Es ist die kommunale Steuer auf den Verkauf, und drei Dinge machen sie viel weniger beängstigend, als sie klingt.

Es gibt zwei Berechnungsarten, und Sie dürfen wählen. Die objektive Methode nimmt den Katasterwert des Grundstücks (nur des Bodens, nicht der ganzen Immobilie) und multipliziert ihn mit einem Koeffizienten für die Besitzdauer. Die Methode des realen Gewinns nimmt den tatsächlichen Wertzuwachs zwischen den Angaben der beiden Urkunden. Die Methode mit dem niedrigeren Ergebnis ist die, die Sie wählen können.

Gab es überhaupt keinen Wertzuwachs, ist nichts zu zahlen. Sie melden den Verkauf trotzdem und legen beide Urkunden vor, aber es kommt keine Rechnung.

Die Frist beträgt dreißig Arbeitstage ab dem Datum der Urkunde. Arbeitstage, nicht Kalendertage.

Ein ehrlicher Vorbehalt. Die Koeffizienten, der Satz und ob Ihre Gemeinde eine Erklärung oder eine Selbstveranlagung verlangt, sind von Gemeinde zu Gemeinde verschieden, die endgültige Zahl kommt also vom Rathaus.

Ich habe ein kostenloses Tool gebaut, das beide Methoden durchgeht, damit Sie beim Notar schon wissen, was Sie fragen sollten:

{link}`,
    fr: `La plupart des vendeurs découvrent la plusvalia à la table du notaire, environ quatre-vingt-dix secondes avant qu'on leur demande de l'accepter.

C'est l'impôt municipal sur la vente, et trois choses la rendent bien moins effrayante qu'elle n'en a l'air.

Il y a deux façons de la calculer, et vous pouvez choisir. La méthode objective prend la valeur cadastrale du terrain (le terrain seul, pas tout le bien) et la multiplie par un coefficient lié à la durée de détention. La méthode du gain réel retient l'augmentation effective entre ce que disent les deux actes. Celle qui donne le montant le plus bas est celle que vous pouvez retenir.

S'il n'y a eu aucune augmentation, il n'y a rien à payer. Vous déclarez tout de même la vente et remettez les deux actes, mais il n'y a pas de facture.

Le délai est de trente jours ouvrables à compter de la date de l'acte. Ouvrables, pas calendaires.

Une réserve honnête. Les coefficients, le taux, et le fait que votre commune demande une déclaration ou une autoliquidation varient d'une commune à l'autre, donc le chiffre final vient de la mairie.

J'ai créé un outil gratuit qui parcourt les deux méthodes, pour que vous arriviez chez le notaire en sachant déjà quoi demander :

{link}`,
    nl: `De meeste verkopers maken voor het eerst kennis met de plusvalia aan de tafel van de notaris, ongeveer negentig seconden voordat ze hem moeten accepteren.

Het is de gemeentelijke belasting op de verkoop, en drie dingen maken hem een stuk minder eng dan hij klinkt.

Er zijn twee manieren om hem te berekenen, en u mag kiezen. De objectieve methode neemt de kadastrale waarde van de grond (alleen de grond, niet de hele woning) en vermenigvuldigt die met een coëfficiënt voor hoe lang u de woning in bezit had. De methode van de werkelijke winst gebruikt de feitelijke stijging tussen wat de twee aktes zeggen. Welke het laagst uitkomt, daarvoor mag u kiezen.

Was er helemaal geen stijging, dan valt er niets te betalen. U geeft de verkoop nog steeds aan en levert beide aktes in, maar er komt geen rekening.

De termijn is dertig werkdagen vanaf de datum van de akte. Werkdagen, geen kalenderdagen.

Eén eerlijk voorbehoud. De coëfficiënten, het tarief en of uw gemeente een aangifte of een zelfaanslag wil, verschillen per gemeente, dus het eindbedrag komt van het gemeentehuis.

Ik heb een gratis hulpmiddel gemaakt dat beide methodes doorloopt, zodat u bij de notaris al weet wat u moet vragen:

{link}`,
  },
},
{
  key: 'iva-holiday-let',
  tool: 'rental-vat',
  kind: 'informative',
  rules: ['vat.letting'],
  text: {
    en: `Does IVA apply to my holiday let? Most people will tell you it depends how long the guest stays. It doesn't. It depends on what you do for them while they're there.

Let the place with no services and it's exempt from IVA. Add hotel type services during the stay and it's taxed at 10 percent. Twenty one percent is for something that's neither an exempt residential let nor a hotel type service.

"Hotel type" is the phrase doing all the work, and it means services during the stay. A clean and fresh sheets between guests is a different thing from a daily clean, a reception desk or breakfast. Two owners on the same landing, letting the same week at the same price, can end up on opposite sides of this.

Then there's who the guest books through, which can change the answer again.

I read the official text on this and built a free tool around it. Three questions, and you get a straight answer for your own let:

{link}`,
    no: `Gjelder IVA for ferieutleien min? De fleste vil si at det kommer an på hvor lenge gjesten blir. Det gjør det ikke. Det kommer an på hva du gjør for gjestene mens de er der.

Leier du ut uten tjenester, er det fritatt for IVA. Legger du til hotellignende tjenester under oppholdet, skattlegges det med 10 prosent. Tjueen prosent er for noe som verken er en fritatt boligutleie eller en hotellignende tjeneste.

«Hotellignende» er ordet som gjør hele jobben, og det betyr tjenester under oppholdet. En rengjøring og rent sengetøy mellom gjester er noe annet enn daglig rengjøring, en resepsjon eller frokost. To eiere i samme oppgang, som leier ut samme uke til samme pris, kan havne på hver sin side av dette.

Så er det hvem gjesten booker gjennom, og det kan endre svaret igjen.

Jeg leste den offisielle teksten om dette og bygde et gratis verktøy rundt den. Tre spørsmål, og du får et rett svar for din egen utleie:

{link}`,
    sv: `Gäller IVA för min semesteruthyrning? De flesta säger att det beror på hur länge gästen stannar. Det gör det inte. Det beror på vad du gör för gästerna under vistelsen.

Hyr du ut bostaden utan några tjänster är den undantagen från IVA. Lägger du till hotelliknande tjänster under vistelsen beskattas den med 10 procent. Tjugoen procent gäller för något som varken är en undantagen bostadsuthyrning eller en hotelliknande tjänst.

”Hotelliknande” är ordet som gör hela jobbet, och det betyder tjänster under vistelsen. Städning och rena lakan mellan gästerna är något annat än daglig städning, en reception eller frukost. Två ägare i samma trapphus, som hyr ut samma vecka till samma pris, kan hamna på var sin sida.

Sedan spelar det roll vem gästen bokar via, vilket kan ändra svaret igen.

Jag läste den officiella texten om det här och byggde ett gratis verktyg kring den. Tre frågor, och du får ett rakt svar för just din uthyrning:

{link}`,
    da: `Er der IVA på min ferieudlejning? De fleste vil sige, at det afhænger af, hvor længe gæsten bliver. Det gør det ikke. Det afhænger af, hvad du gør for dem, mens de er der.

Lejer du stedet ud uden nogen ydelser, er det fritaget for IVA. Lægger du hotellignende ydelser oveni under opholdet, beskattes det med 10 procent. Enogtyve procent er til det, der hverken er en fritaget boligudlejning eller en hotellignende ydelse.

"Hotellignende" er det ord, der bærer hele vægten, og det betyder ydelser under opholdet. Rengøring og rent sengetøj mellem to gæster er noget andet end daglig rengøring, en reception eller morgenmad. To ejere i samme opgang, der lejer ud i samme uge til samme pris, kan ende på hver sin side af grænsen.

Så er der spørgsmålet om, hvem gæsten booker igennem, og det kan ændre svaret igen.

Jeg læste den officielle tekst om det og byggede et gratis værktøj ud fra den. Tre spørgsmål, og du får et klart svar for din egen udlejning:

{link}`,
    de: `Fällt auf meine Ferienvermietung IVA an? Die meisten werden Ihnen sagen, es hänge davon ab, wie lange der Gast bleibt. Tut es nicht. Es hängt davon ab, was Sie für ihn tun, während er da ist.

Vermieten Sie ohne Dienstleistungen, ist es von der IVA befreit. Kommen während des Aufenthalts hotelähnliche Dienstleistungen dazu, wird es mit 10 Prozent besteuert. Einundzwanzig Prozent gelten für etwas, das weder eine befreite Wohnvermietung noch eine hotelähnliche Dienstleistung ist.

„Hotelähnlich“ ist das Wort, auf das alles ankommt, und es meint Leistungen während des Aufenthalts. Eine Reinigung und frische Bettwäsche zwischen zwei Gästen sind etwas anderes als eine tägliche Reinigung, eine Rezeption oder Frühstück. Zwei Eigentümer auf demselben Treppenabsatz, die in derselben Woche zum selben Preis vermieten, können auf entgegengesetzten Seiten landen.

Dann ist da noch die Frage, über wen der Gast bucht, und das kann die Antwort noch einmal ändern.

Ich habe den offiziellen Text dazu gelesen und ein kostenloses Tool darum gebaut. Drei Fragen, und Sie bekommen eine klare Antwort für Ihre eigene Vermietung:

{link}`,
    fr: `L'IVA s'applique-t-elle à ma location saisonnière ? La plupart des gens vous diront que ça dépend de la durée du séjour. Non. Ça dépend de ce que vous faites pour vos hôtes pendant qu'ils sont là.

Louez sans services et c'est exonéré d'IVA. Ajoutez des services de type hôtelier pendant le séjour et c'est taxé à 10 pour cent. Vingt et un pour cent, c'est pour ce qui n'est ni une location résidentielle exonérée ni un service de type hôtelier.

« Type hôtelier », c'est l'expression qui porte tout, et elle désigne des services pendant le séjour. Un ménage et des draps propres entre deux locataires, ce n'est pas la même chose qu'un ménage quotidien, une réception ou un petit-déjeuner. Deux propriétaires du même palier, qui louent la même semaine au même prix, peuvent se retrouver de part et d'autre de cette ligne.

Et puis il y a la question de savoir auprès de qui le client réserve, ce qui peut encore changer la réponse.

J'ai lu le texte officiel sur le sujet et construit un outil gratuit autour. Trois questions, et vous obtenez une réponse claire pour votre propre location :

{link}`,
    nl: `Geldt IVA voor mijn vakantieverhuur? De meeste mensen zullen u vertellen dat het afhangt van hoe lang de gast blijft. Dat is niet zo. Het hangt af van wat u voor de gast doet terwijl hij er is.

Verhuurt u de woning zonder diensten, dan is het vrijgesteld van IVA. Voegt u hotelachtige diensten toe tijdens het verblijf, dan wordt het belast tegen 10 procent. Eenentwintig procent is voor iets dat noch een vrijgestelde woonverhuur, noch een hotelachtige dienst is.

"Hotelachtig" is het woord dat al het werk doet, en het gaat om diensten tijdens het verblijf. Schoonmaken en schoon beddengoed tussen gasten is iets anders dan dagelijks schoonmaken, een receptie of ontbijt. Twee eigenaren op dezelfde overloop, die dezelfde week voor dezelfde prijs verhuren, kunnen aan weerszijden van deze grens uitkomen.

En dan is er nog via wie de gast boekt, en dat kan het antwoord opnieuw veranderen.

Ik heb de officiële tekst hierover gelezen en er een gratis hulpmiddel omheen gebouwd. Drie vragen, en u krijgt een recht antwoord voor uw eigen verhuur:

{link}`,
  },
},
{
  key: 'consorcio-storm',
  tool: 'storm-claim',
  kind: 'story',
  rules: ['consorcio.perils', 'consorcio.wind_threshold', 'consorcio.precondition'],
  text: {
    en: `After a storm, who do you actually phone? Your insurer, or someone else?

For some kinds of damage in Spain, your insurer isn't the one who pays. A public body called the Consorcio de Compensación de Seguros is. That covers earthquake, extraordinary flood, volcanic eruption, atypical cyclonic storm and a short list of others.

Wind has an actual number attached, which surprised me when I read the official text. Gusts above 120 km an hour, measured as a three second gust. Below that, storm damage goes to your own insurer under the storm cover in your policy. Above it, it may be the Consorcio instead.

You don't buy this cover separately. If you hold an ordinary policy in a qualifying branch, the surcharge is already collected with your premium, automatically (whether or not you've ever heard the name).

So the useful question the morning after is which of the two to phone. I built a free tool for exactly that. Four questions and it tells you, so you can spend the day sorting the garden rather than the paperwork.

{link}`,
    no: `Etter en storm, hvem ringer du egentlig? Forsikringsselskapet ditt, eller noen andre?

For noen typer skader i Spania er det ikke forsikringsselskapet ditt som betaler. Det gjør et offentlig organ som heter Consorcio de Compensación de Seguros. Det dekker jordskjelv, ekstraordinær flom, vulkanutbrudd, atypisk syklonstorm og en kort liste med andre.

Vind har faktisk et tall knyttet til seg, noe som overrasket meg da jeg leste den offisielle teksten. Vindkast over 120 km i timen, målt som et kast over tre sekunder. Under det går stormskader til ditt eget forsikringsselskap under stormdekningen i forsikringen din. Over det kan det være Consorcio i stedet.

Du kjøper ikke denne dekningen separat. Har du en vanlig forsikring i en gren som omfattes, er tillegget allerede innkrevd sammen med premien din, automatisk (enten du har hørt navnet før eller ikke).

Det nyttige spørsmålet morgenen etter er altså hvem av de to du skal ringe. Jeg laget et gratis verktøy for akkurat det. Fire spørsmål, og det forteller deg svaret, så du kan bruke dagen på å rydde i hagen i stedet for i papirene.

{link}`,
    sv: `Vem ringer du egentligen efter en storm? Ditt försäkringsbolag, eller någon annan?

För vissa typer av skador i Spanien är det inte ditt försäkringsbolag som betalar. Det gör ett offentligt organ som heter Consorcio de Compensación de Seguros. Det gäller jordbävning, extraordinär översvämning, vulkanutbrott, atypisk cyklonstorm och en kort lista till.

Vinden har en faktisk siffra, vilket förvånade mig när jag läste den officiella texten. Vindbyar över 120 km i timmen, mätt som en tresekundersby. Under det går stormskadan till ditt eget försäkringsbolag, under stormskyddet i din försäkring. Över det kan det vara Consorcio i stället.

Det här skyddet köper du inte separat. Har du en vanlig försäkring i en gren som omfattas tas tillägget redan ut med din premie, automatiskt (oavsett om du någonsin hört namnet).

Den användbara frågan morgonen efter är alltså vem av de två du ska ringa. Jag byggde ett gratis verktyg för just det. Fyra frågor, sedan säger det dig svaret, så att du kan ägna dagen åt trädgården i stället för pappersarbetet.

{link}`,
    da: `Efter en storm, hvem ringer du så egentlig til? Dit forsikringsselskab eller en anden?

Ved visse typer skader i Spanien er det ikke dit forsikringsselskab, der betaler. Det er et offentligt organ, der hedder Consorcio de Compensación de Seguros. Det dækker jordskælv, ekstraordinær oversvømmelse, vulkanudbrud, atypisk cyklonstorm og en kort liste med andre.

Vind har et konkret tal knyttet til sig, og det overraskede mig, da jeg læste den officielle tekst. Vindstød over 120 km i timen, målt som et vindstød på tre sekunder. Under det går stormskader til dit eget forsikringsselskab under stormdækningen i din police. Over det kan det i stedet være Consorcio.

Du køber ikke den dækning separat. Har du en almindelig police i en gren, der er omfattet, bliver tillægget allerede opkrævet sammen med din præmie, helt automatisk (uanset om du nogensinde har hørt navnet).

Så det nyttige spørgsmål morgenen efter er, hvem af de to du skal ringe til. Jeg byggede et gratis værktøj til præcis det. Fire spørgsmål, og så fortæller det dig svaret, så du kan bruge dagen på haven i stedet for papirerne.

{link}`,
    de: `Wen rufen Sie nach einem Sturm eigentlich an? Ihren Versicherer oder jemand anderen?

Für manche Schäden in Spanien zahlt nicht Ihr Versicherer, sondern eine öffentliche Einrichtung namens Consorcio de Compensación de Seguros. Das betrifft Erdbeben, außergewöhnliche Überschwemmungen, Vulkanausbrüche, atypische Wirbelstürme und eine kurze Liste weiterer Fälle.

Für Wind gibt es eine echte Zahl, was mich überrascht hat, als ich den offiziellen Text gelesen habe. Böen über 120 km/h, gemessen als Drei-Sekunden-Böe. Darunter gehen Sturmschäden an Ihren eigenen Versicherer, über die Sturmdeckung in Ihrer Police. Darüber kann stattdessen das Consorcio zuständig sein.

Diesen Schutz kaufen Sie nicht separat. Haben Sie eine normale Police in einer der betroffenen Sparten, wird der Zuschlag automatisch mit Ihrer Prämie eingezogen (ob Sie den Namen je gehört haben oder nicht).

Die nützliche Frage am Morgen danach ist also, wen von beiden Sie anrufen. Genau dafür habe ich ein kostenloses Tool gebaut. Vier Fragen, und es sagt es Ihnen, damit Sie den Tag mit dem Garten verbringen statt mit dem Papierkram.

{link}`,
    fr: `Après une tempête, qui appelez-vous vraiment ? Votre assureur, ou quelqu'un d'autre ?

Pour certains types de dommages en Espagne, ce n'est pas votre assureur qui paie. C'est un organisme public, le Consorcio de Compensación de Seguros. Cela couvre les séismes, les inondations extraordinaires, les éruptions volcaniques, les tempêtes cycloniques atypiques et une courte liste d'autres cas.

Pour le vent, il y a un vrai chiffre, ce qui m'a surpris en lisant le texte officiel. Des rafales de plus de 120 km/h, mesurées sur trois secondes. En dessous, les dégâts de tempête relèvent de votre propre assureur, au titre de la garantie tempête de votre contrat. Au-dessus, cela peut être le Consorcio.

Cette couverture ne s'achète pas à part. Si vous avez un contrat ordinaire dans une branche éligible, la surprime est déjà perçue avec votre prime, automatiquement (que vous ayez déjà entendu ce nom ou non).

Le lendemain matin, la question utile est donc de savoir lequel des deux appeler. J'ai créé un outil gratuit exactement pour ça. Quatre questions, et il vous le dit, pour que vous passiez la journée à remettre le jardin en ordre plutôt que les papiers.

{link}`,
    nl: `Wie belt u eigenlijk na een storm? Uw verzekeraar, of iemand anders?

Bij sommige soorten schade in Spanje betaalt uw verzekeraar niet. Dat doet een publieke instelling, het Consorcio de Compensación de Seguros. Het gaat om aardbeving, buitengewone overstroming, vulkaanuitbarsting, atypische cycloonstorm en een korte lijst andere gevallen.

Aan wind hangt een echt getal, wat me verraste toen ik de officiële tekst las. Windstoten boven 120 km per uur, gemeten als stoot van drie seconden. Daaronder valt stormschade onder uw eigen verzekeraar, via de stormdekking in uw polis. Daarboven kan het juist het Consorcio zijn.

Deze dekking koopt u niet apart. Heeft u een gewone polis in een branche die meetelt, dan wordt de opslag al automatisch met uw premie geïnd (of u de naam ooit heeft gehoord of niet).

De nuttige vraag de ochtend erna is dus wie van de twee u moet bellen. Daarvoor heb ik een gratis hulpmiddel gemaakt. Vier vragen en het zegt het u, zodat u de dag kunt besteden aan de tuin in plaats van aan het papierwerk.

{link}`,
  },
},
{
  key: 'legal-cover-you-already-pay-for',
  tool: 'your-rights',
  kind: 'story',
  rules: ['cover.free_choice', 'cover.separate_chapter', 'cover.search_terms', 'cover.policy_must_state'],
  text: {
    en: `A lot of Spanish home policies have a legal expenses chapter in them, called defensa juridica. It pays your lawyer, the procurador and the court costs when you're actually in a case. Of everything I read for the rights page, this surprised me most.

Inside a combined home policy it has to appear as its own chapter, with its own premium line. So if you look and there's no separate premium for it, that alone is worth a phone call.

Then the bigger point. You have the right to choose your own lawyer. Not one off their list. Yours. And the lawyer you pick takes instructions from you, not from the insurer. That right doesn't depend on the insurer agreeing, or on there being a conflict of interest. The policy has to spell it out in so many words.

So before anyone pays a lawyer out of their own pocket, half an hour with the policy is well spent. Search it for phrases like "defensa juridica" and "libre eleccion de abogado". Finding them tells you what you have. Not finding them tells you what to ask about.

I built a free page with the phrases, the articles and the time limits:

{link}`,
    no: `Mange spanske boligforsikringer har et kapittel om rettshjelp, kalt defensa juridica. Det betaler advokaten din, procuradoren og saksomkostningene når du faktisk står i en sak. Av alt jeg leste til siden om rettigheter, var det dette som overrasket meg mest.

I en kombinert boligforsikring må det stå som et eget kapittel, med sin egen premielinje. Ser du etter og det ikke finnes en egen premie for det, er det i seg selv verdt en telefon.

Så det større poenget. Du har rett til å velge din egen advokat. Ikke en fra listen deres. Din. Og advokaten du velger, tar imot instrukser fra deg, ikke fra forsikringsselskapet. Den retten avhenger ikke av at forsikringsselskapet sier ja, eller av at det finnes en interessekonflikt. Vilkårene må si det rett ut.

Så før noen betaler en advokat av egen lomme, er en halvtime med forsikringsvilkårene vel anvendt. Søk etter uttrykk som «defensa juridica» og «libre eleccion de abogado». Finner du dem, vet du hva du har. Finner du dem ikke, vet du hva du skal spørre om.

Jeg laget en gratis side med uttrykkene, paragrafene og fristene:

{link}`,
    sv: `Många spanska hemförsäkringar har ett kapitel om rättsskydd, kallat defensa juridica. Det betalar din advokat, procuradorn och rättegångskostnaderna när du faktiskt är i ett mål. Av allt jag läste till sidan om rättigheter var det här det som förvånade mig mest.

I en kombinerad hemförsäkring måste det finnas som ett eget kapitel, med en egen rad för premien. Så om du tittar och det inte finns någon separat premie för det är det i sig värt ett telefonsamtal.

Sedan det större. Du har rätt att välja din egen advokat. Inte en från deras lista. Din. Och advokaten du väljer tar instruktioner från dig, inte från försäkringsbolaget. Den rätten beror inte på att försäkringsbolaget går med på det, eller på att det finns en intressekonflikt. Villkoren måste säga det i klartext.

Innan någon betalar en advokat ur egen ficka är alltså en halvtimme med försäkringsvillkoren väl använd tid. Sök efter fraser som ”defensa juridica” och ”libre eleccion de abogado”. Hittar du dem vet du vad du har. Hittar du dem inte vet du vad du ska fråga om.

Jag byggde en gratis sida med fraserna, artiklarna och tidsfristerna:

{link}`,
    da: `Mange spanske husforsikringer har et kapitel om retshjælp, der hedder defensa juridica. Det betaler din advokat, din procurador og sagsomkostningerne, når du rent faktisk står i en sag. Af alt det, jeg læste til siden om dine rettigheder, var det her det, der overraskede mig mest.

I en kombineret husforsikring skal det stå som sit eget kapitel med sin egen præmielinje. Så hvis du kigger efter og ikke finder en særskilt præmie for det, er det alene en opringning værd.

Så det større punkt. Du har ret til at vælge din egen advokat. Ikke en fra deres liste. Din egen. Og den advokat, du vælger, tager imod instrukser fra dig, ikke fra forsikringsselskabet. Den ret afhænger ikke af, at selskabet siger ja, eller af, at der er en interessekonflikt. Policen skal skrive det med rene ord.

Så før nogen betaler en advokat af egen lomme, er en halv time med policen godt givet ud. Søg efter udtryk som "defensa juridica" og "libre eleccion de abogado". Finder du dem, ved du, hvad du har. Finder du dem ikke, ved du, hvad du skal spørge om.

Jeg byggede en gratis side med udtrykkene, artiklerne og fristerne:

{link}`,
    de: `Viele spanische Hausversicherungen enthalten ein Kapitel für Rechtskosten, genannt defensa juridica. Es bezahlt Ihren Anwalt, den procurador und die Gerichtskosten, wenn Sie tatsächlich in einem Verfahren stecken. Von allem, was ich für die Seite über Ihre Rechte gelesen habe, hat mich das am meisten überrascht.

In einer kombinierten Hausversicherung muss es als eigenes Kapitel erscheinen, mit einer eigenen Prämienzeile. Wenn Sie nachsehen und es keine separate Prämie dafür gibt, ist das allein schon einen Anruf wert.

Dann der wichtigere Punkt. Sie haben das Recht, Ihren eigenen Anwalt zu wählen. Nicht einen von deren Liste. Ihren. Und der Anwalt, den Sie wählen, nimmt Weisungen von Ihnen an, nicht vom Versicherer. Dieses Recht hängt nicht davon ab, dass der Versicherer zustimmt oder dass ein Interessenkonflikt besteht. Die Police muss es ausdrücklich so formulieren.

Bevor also jemand einen Anwalt aus eigener Tasche bezahlt, ist eine halbe Stunde mit der Police gut investiert. Suchen Sie darin nach Formulierungen wie „defensa juridica“ und „libre eleccion de abogado“. Finden Sie sie, wissen Sie, was Sie haben. Finden Sie sie nicht, wissen Sie, wonach Sie fragen sollten.

Ich habe eine kostenlose Seite mit den Formulierungen, den Artikeln und den Fristen gebaut:

{link}`,
    fr: `Beaucoup de contrats habitation espagnols contiennent un chapitre de protection juridique, appelé defensa juridica. Il paie votre avocat, le procurador et les frais de justice quand vous êtes réellement dans une procédure. De tout ce que j'ai lu pour la page sur vos droits, c'est ce qui m'a le plus surpris.

Dans un contrat multirisque, il doit figurer comme un chapitre à part, avec sa propre ligne de prime. Donc si vous cherchez et qu'il n'y a pas de prime distincte, cela seul mérite un coup de fil.

Ensuite, le point le plus important. Vous avez le droit de choisir votre propre avocat. Pas un de leur liste. Le vôtre. Et l'avocat que vous choisissez reçoit ses instructions de vous, pas de l'assureur. Ce droit ne dépend ni de l'accord de l'assureur, ni de l'existence d'un conflit d'intérêts. Le contrat doit l'énoncer noir sur blanc.

Donc avant que quiconque paie un avocat de sa poche, une demi-heure avec le contrat est bien employée. Cherchez-y des expressions comme « defensa juridica » et « libre eleccion de abogado ». Les trouver vous dit ce que vous avez. Ne pas les trouver vous dit quoi demander.

J'ai créé une page gratuite avec les expressions, les articles et les délais :

{link}`,
    nl: `In veel Spaanse woonpolissen zit een hoofdstuk rechtsbijstand, defensa juridica genoemd. Het betaalt uw advocaat, de procurador en de proceskosten als u werkelijk in een zaak zit. Van alles wat ik voor de pagina over uw rechten las, verraste dit me het meest.

Binnen een gecombineerde woonpolis moet het als een eigen hoofdstuk staan, met een eigen premieregel. Kijkt u dus en is er geen aparte premie voor, dan is dat alleen al een telefoontje waard.

Dan het belangrijkere punt. U heeft het recht uw eigen advocaat te kiezen. Niet een van hun lijst. De uwe. En de advocaat die u kiest neemt instructies van u aan, niet van de verzekeraar. Dat recht hangt niet af van de instemming van de verzekeraar, en ook niet van een belangenconflict. De polis moet het met zoveel woorden vermelden.

Dus voordat iemand een advocaat uit eigen zak betaalt, is een half uur met de polis goed besteed. Zoek naar termen als "defensa juridica" en "libre eleccion de abogado". Vindt u ze, dan weet u wat u heeft. Vindt u ze niet, dan weet u waar u naar moet vragen.

Ik heb een gratis pagina gemaakt met de termen, de artikelen en de termijnen:

{link}`,
  },
},
{
  key: 'community-decision-clock',
  tool: 'your-rights',
  kind: 'informative',
  rules: ['limit.community.challenge', 'limit.community.challenge.absent', 'limit.community.challenge.standing'],
  text: {
    en: `You weren't at the last owners meeting, and a decision was made without you. How long do you have to challenge it?

Three months if your ground is that it seriously harms the community or unfairly harms one owner. A year if your ground is that it breaks the law or the statutes.

If you live abroad, this is the rule to remember. When you weren't at the meeting, your clock doesn't start at the meeting. It starts the day the decision was communicated to you.

So keep the envelope, or the email, with its date on it. That date is your starting line. A letter from the community is easy to bin (it happens), and then there's no way to show when your window opened.

One condition to check before you plan anything. To challenge a decision you generally need to be up to date with the community payments, or to have paid the disputed amount into court first.

I put the clocks, the articles they come from and what to gather into one free page.

{link}`,
    no: `Du var ikke på siste sameiermøte, og et vedtak ble fattet uten deg. Hvor lang tid har du på å angripe det?

Tre måneder hvis grunnlaget ditt er at det skader sameiet alvorlig eller rammer én eier urimelig. Ett år hvis grunnlaget er at det bryter loven eller vedtektene.

Bor du i utlandet, er dette regelen å huske. Var du ikke på møtet, starter ikke klokken din på møtet. Den starter den dagen vedtaket ble meddelt deg.

Så ta vare på konvolutten, eller e-posten, med datoen på. Den datoen er startstreken din. Et brev fra sameiet er lett å kaste (det skjer), og da finnes det ingen måte å vise når vinduet ditt åpnet.

Én betingelse å sjekke før du planlegger noe. For å angripe et vedtak må du som regel være à jour med fellesutgiftene, eller først ha betalt det omstridte beløpet inn til retten.

Jeg samlet fristene, paragrafene de kommer fra og hva du bør ha klart, på én gratis side.

{link}`,
    sv: `Du var inte på senaste ägarstämman, och ett beslut fattades utan dig. Hur lång tid har du på dig att klandra det?

Tre månader om din grund är att det allvarligt skadar samfälligheten eller orättvist drabbar en ägare. Ett år om din grund är att det strider mot lag eller stadgar.

Bor du utomlands är det här regeln att komma ihåg. Var du inte på stämman startar inte din klocka vid stämman. Den startar den dag beslutet meddelades dig.

Spara alltså kuvertet, eller mejlet, med datumet på. Det datumet är din startlinje. Ett brev från samfälligheten är lätt att slänga (det händer), och sedan finns det inget sätt att visa när ditt fönster öppnade.

Ett villkor att kolla innan du planerar något. För att klandra ett beslut behöver du normalt vara i fas med avgifterna till samfälligheten, eller först ha deponerat det omtvistade beloppet hos domstolen.

Jag samlade fristerna, lagrummen de kommer från och vad du bör samla in på en gratis sida.

{link}`,
    da: `Du var ikke med til den seneste generalforsamling i ejerforeningen, og der blev truffet en beslutning uden dig. Hvor lang tid har du til at anfægte den?

Tre måneder, hvis din begrundelse er, at den skader ejerforeningen alvorligt eller rammer én ejer urimeligt. Et år, hvis din begrundelse er, at den strider mod loven eller vedtægterne.

Bor du i udlandet, er det den her regel, du skal huske. Var du ikke med til mødet, begynder din frist ikke ved mødet. Den begynder den dag, beslutningen blev meddelt dig.

Så gem kuverten, eller mailen, med datoen på. Den dato er din startlinje. Et brev fra ejerforeningen er nemt at smide ud (det sker), og så er der ingen måde at vise, hvornår din frist begyndte.

Én betingelse skal du tjekke, før du planlægger noget. For at anfægte en beslutning skal du som regel være ajour med fællesudgifterne eller først have deponeret det omstridte beløb hos retten.

Jeg samlede fristerne, de artikler, de kommer fra, og hvad du bør samle sammen, på én gratis side.

{link}`,
    de: `Sie waren nicht bei der letzten Eigentümerversammlung, und ohne Sie wurde ein Beschluss gefasst. Wie lange haben Sie Zeit, ihn anzufechten?

Drei Monate, wenn Ihr Grund ist, dass er der Gemeinschaft ernsthaft schadet oder einem Eigentümer unfair schadet. Ein Jahr, wenn Ihr Grund ist, dass er gegen das Gesetz oder die Satzung verstößt.

Wenn Sie im Ausland leben, ist das die Regel, die Sie sich merken sollten. Waren Sie nicht bei der Versammlung, beginnt Ihre Frist nicht mit der Versammlung. Sie beginnt an dem Tag, an dem Ihnen der Beschluss mitgeteilt wurde.

Bewahren Sie also den Umschlag oder die E-Mail mit dem Datum auf. Dieses Datum ist Ihre Startlinie. Ein Brief von der Gemeinschaft landet leicht im Papierkorb (das passiert), und dann lässt sich nicht mehr zeigen, wann Ihr Fenster begonnen hat.

Eine Bedingung sollten Sie prüfen, bevor Sie etwas planen. Um einen Beschluss anzufechten, müssen Sie in der Regel mit den Zahlungen an die Gemeinschaft auf dem Laufenden sein oder den strittigen Betrag vorher beim Gericht hinterlegt haben.

Ich habe die Fristen, die Artikel, aus denen sie stammen, und was Sie sammeln sollten, auf eine kostenlose Seite gebracht.

{link}`,
    fr: `Vous n'étiez pas à la dernière assemblée des copropriétaires, et une décision a été prise sans vous. Combien de temps avez-vous pour la contester ?

Trois mois si votre motif est qu'elle nuit gravement à la copropriété ou lèse injustement un copropriétaire. Un an si votre motif est qu'elle enfreint la loi ou les statuts.

Si vous vivez à l'étranger, c'est la règle à retenir. Si vous n'étiez pas à l'assemblée, votre délai ne démarre pas à l'assemblée. Il démarre le jour où la décision vous a été communiquée.

Gardez donc l'enveloppe, ou le courriel, avec sa date. Cette date est votre ligne de départ. Un courrier de la copropriété part facilement à la poubelle (ça arrive), et ensuite rien ne permet de prouver quand votre délai s'est ouvert.

Une condition à vérifier avant de prévoir quoi que ce soit. Pour contester une décision, il faut en général être à jour des charges de copropriété, ou avoir d'abord consigné le montant contesté au tribunal.

J'ai rassemblé les délais, les articles d'où ils viennent et ce qu'il faut réunir sur une seule page gratuite.

{link}`,
    nl: `U was niet op de laatste eigenarenvergadering, en er is een besluit genomen zonder u. Hoe lang heeft u om het aan te vechten?

Drie maanden als uw grond is dat het de gemeenschap ernstig schaadt of één eigenaar onredelijk benadeelt. Een jaar als uw grond is dat het in strijd is met de wet of de statuten.

Woont u in het buitenland, dan is dit de regel om te onthouden. Was u niet op de vergadering, dan begint uw klok niet bij de vergadering. Hij begint op de dag dat het besluit aan u is meegedeeld.

Bewaar dus de envelop, of de e-mail, met de datum erop. Die datum is uw startstreep. Een brief van de VvE is snel weggegooid (het gebeurt), en dan kunt u niet meer aantonen wanneer uw termijn begon.

Eén voorwaarde om te controleren voordat u iets plant. Om een besluit aan te vechten moet u doorgaans bij zijn met de bijdragen aan de gemeenschap, of het betwiste bedrag eerst bij de rechter in bewaring hebben gegeven.

Ik heb de termijnen, de artikelen waar ze vandaan komen en wat u moet verzamelen op één gratis pagina gezet.

{link}`,
  },
},
{
  key: 'builder-quote-red-flags',
  tool: 'contractor-check',
  kind: 'story',
  rules: [],
  text: {
    en: `When a building job goes wrong, the trouble often starts with the quote. Not a wrong one, a thin one.

Look for what the paper doesn't say. No start date and no finish date. No payment schedule tied to stages, so the money goes out on trust. Nothing about who applies for the licence, or what happens to the rubble. No mention of the sign off certificate or its date, which is the date every guarantee period counts from. And a single total with no breakdown, so when extras turn up there's nothing to compare them against.

None of that looks alarming on its own. Together it's a quote that leaves every expensive question open, and open questions tend to get answered later by whoever is holding the money.

This keeps coming up in these groups, so I turned it into twelve free questions you can answer from the quote in front of you. You get a count of what's missing and the exact wording to send back, in English and Spanish (so you're not translating a tricky conversation while you're having it).

Then the builder can get on with it, and so can you.

{link}`,
    no: `Når en byggejobb går galt, starter problemene ofte med tilbudet. Ikke et feil tilbud, men et tynt et.

Se etter det papiret ikke sier. Ingen startdato og ingen sluttdato. Ingen betalingsplan knyttet til faser, så pengene går ut på tillit. Ingenting om hvem som søker om lisensen, eller hva som skjer med byggeavfallet. Ingen omtale av ferdigattesten eller datoen på den, som er datoen hver garantiperiode regnes fra. Og én totalsum uten spesifikasjon, så når tillegg dukker opp, har du ingenting å sammenligne dem med.

Ingenting av dette ser alarmerende ut alene. Sammen blir det et tilbud som lar alle de dyre spørsmålene stå åpne, og åpne spørsmål blir gjerne besvart senere av den som sitter på pengene.

Dette dukker stadig opp i disse gruppene, så jeg gjorde det om til tolv gratis spørsmål du kan svare på ut fra tilbudet foran deg. Du får en oversikt over hva som mangler, og den nøyaktige ordlyden du kan sende tilbake, på engelsk og spansk (så du slipper å oversette en vanskelig samtale mens du står midt i den).

Så kan byggmesteren komme i gang, og det kan du også.

{link}`,
    sv: `När ett byggjobb går snett börjar problemen ofta med offerten. Inte en felaktig offert, en tunn.

Titta efter vad papperet inte säger. Inget startdatum och inget slutdatum. Ingen betalningsplan kopplad till etapper, så pengarna går ut på förtroende. Ingenting om vem som söker bygglovet, eller vad som händer med byggavfallet. Inget om slutbeviset eller dess datum, som är datumet varje garantitid räknas från. Och en enda totalsumma utan uppdelning, så när extrakostnader dyker upp finns det inget att jämföra dem med.

Inget av det ser alarmerande ut för sig. Tillsammans blir det en offert som lämnar varje dyr fråga öppen, och öppna frågor brukar besvaras senare av den som håller i pengarna.

Det här dyker upp hela tiden i de här grupperna, så jag gjorde om det till tolv gratis frågor som du kan besvara utifrån offerten framför dig. Du får en sammanräkning av vad som saknas och exakt vilka formuleringar du kan skicka tillbaka, på engelska och spanska (så att du inte behöver översätta ett knepigt samtal medan du har det).

Sedan kan byggaren sätta igång, och det kan du också.

{link}`,
    da: `Når et byggeprojekt går galt, starter problemerne tit med tilbuddet. Ikke et forkert tilbud, et tyndt et.

Kig efter det, papiret ikke siger. Ingen startdato og ingen slutdato. Ingen betalingsplan knyttet til etaper, så pengene bliver betalt på tillid. Intet om, hvem der søger tilladelsen, eller hvad der sker med byggeaffaldet. Intet om færdigattesten eller dens dato, som er den dato, alle garantiperioder regnes fra. Og én samlet pris uden specifikation, så der ikke er noget at sammenligne med, når ekstraarbejdet dukker op.

Intet af det ser alarmerende ud hver for sig. Tilsammen er det et tilbud, der lader alle de dyre spørgsmål stå åbne, og åbne spørgsmål bliver gerne besvaret senere af den, der sidder på pengene.

Det dukker hele tiden op i de her grupper, så jeg lavede det om til tolv gratis spørgsmål, du kan besvare ud fra det tilbud, du har foran dig. Du får en optælling af, hvad der mangler, og den præcise formulering, du kan sende tilbage, på engelsk og spansk (så du ikke skal oversætte en svær samtale, mens du fører den).

Så kan håndværkeren komme i gang, og det kan du også.

{link}`,
    de: `Wenn bei einem Bauvorhaben etwas schiefgeht, beginnt der Ärger oft beim Kostenvoranschlag. Nicht bei einem falschen, sondern bei einem dünnen.

Achten Sie auf das, was nicht darin steht. Kein Startdatum und kein Enddatum. Kein Zahlungsplan, der an Bauabschnitte geknüpft ist, also fließt das Geld auf Vertrauen. Nichts dazu, wer die Genehmigung beantragt oder was mit dem Bauschutt passiert. Keine Erwähnung der Abnahmebescheinigung oder ihres Datums, und ab diesem Datum laufen alle Gewährleistungsfristen. Und eine einzige Gesamtsumme ohne Aufschlüsselung, sodass es nichts gibt, womit man Extras vergleichen kann, wenn sie auftauchen.

Nichts davon wirkt für sich allein alarmierend. Zusammen ist es ein Angebot, das jede teure Frage offenlässt, und offene Fragen werden später meist von dem beantwortet, der das Geld hält.

Das Thema kommt in diesen Gruppen immer wieder, also habe ich daraus zwölf kostenlose Fragen gemacht, die Sie anhand des Angebots vor Ihnen beantworten können. Sie sehen, wie viel fehlt, und bekommen die genaue Formulierung zum Zurückschicken, auf Englisch und Spanisch (damit Sie ein heikles Gespräch nicht übersetzen müssen, während Sie es führen).

Dann kann der Bauunternehmer loslegen, und Sie auch.

{link}`,
    fr: `Quand un chantier tourne mal, le problème commence souvent par le devis. Pas un devis faux, un devis trop mince.

Cherchez ce que le papier ne dit pas. Pas de date de début ni de date de fin. Pas d'échéancier lié aux étapes, donc l'argent part sur la confiance. Rien sur qui demande le permis, ni sur le sort des gravats. Aucune mention du certificat de réception ni de sa date, qui est la date d'où part chaque période de garantie. Et un total unique sans détail, donc quand les suppléments arrivent, il n'y a rien à quoi les comparer.

Rien de tout cela n'est alarmant isolément. Ensemble, c'est un devis qui laisse ouverte chaque question coûteuse, et les questions ouvertes ont tendance à être tranchées plus tard par celui qui tient l'argent.

Le sujet revient sans cesse dans ces groupes, alors j'en ai fait douze questions gratuites auxquelles vous répondez à partir du devis que vous avez sous les yeux. Vous obtenez le nombre de points manquants et la formulation exacte à renvoyer, en anglais et en espagnol (pour ne pas traduire une conversation délicate pendant que vous la menez).

Ensuite, l'artisan peut se mettre au travail, et vous aussi.

{link}`,
    nl: `Als een bouwklus misgaat, begint het probleem vaak bij de offerte. Geen foute offerte, een magere.

Let op wat het papier niet zegt. Geen begindatum en geen einddatum. Geen betalingsschema gekoppeld aan fases, dus het geld gaat op vertrouwen de deur uit. Niets over wie de vergunning aanvraagt, of wat er met het puin gebeurt. Geen vermelding van het opleveringscertificaat of de datum ervan, terwijl elke garantietermijn vanaf die datum telt. En één totaalbedrag zonder specificatie, zodat er niets is om meerwerk mee te vergelijken als dat opduikt.

Niets daarvan oogt op zichzelf alarmerend. Samen is het een offerte die elke dure vraag openlaat, en open vragen worden later meestal beantwoord door wie het geld vasthoudt.

Dit komt in deze groepen steeds terug, dus ik heb er twaalf gratis vragen van gemaakt die u kunt beantwoorden met de offerte voor u. U ziet hoeveel er ontbreekt en krijgt de precieze formulering om terug te sturen, in het Engels en het Spaans (zodat u een lastig gesprek niet hoeft te vertalen terwijl u het voert).

Dan kan de aannemer aan de slag, en u ook.

{link}`,
  },
},
{
  key: 'what-a-year-actually-costs',
  tool: 'cost-audit',
  kind: 'story',
  rules: [],
  text: {
    en: `Most owners can tell you to the euro what their place in Spain cost to buy. Ask what it costs to keep and almost nobody can answer without going to look.

That's not carelessness. The costs arrive one at a time, at different points in the year, sometimes in different currencies, from six or seven different places. Account charges. The standing charge on the electricity, which runs whether anyone's there or not. Water. Insurance. The community fee. IBI. The gestoria.

On its own, none of them is worth a morning of your attention, so none of them gets one. That's how a few hundred euros a year can go unnoticed for a decade.

So I built a free page that puts the whole year in one column. You enter what you actually pay, line by line, and it shows you the total and where it sits next to what the same kind of property usually costs.

The point is not to make anyone feel bad about a number. You just can't decide whether a cost is worth paying until you see it next to the others. Then the bills stop nagging and the terrace gets your evenings back.

{link}`,
    no: `De fleste eiere kan fortelle deg på euroen hva boligen i Spania kostet å kjøpe. Spør hva den koster å ha, og nesten ingen kan svare uten å gå og sjekke.

Det er ikke slurv. Kostnadene kommer én om gangen, på ulike tidspunkter i året, noen ganger i ulike valutaer, fra seks eller sju forskjellige steder. Kontogebyrer. Fastleddet på strømmen, som løper enten noen er der eller ikke. Vann. Forsikring. Fellesutgiftene. IBI. Gestoria.

Hver for seg er ingen av dem verdt en formiddag av oppmerksomheten din, så ingen av dem får en. Slik kan noen hundre euro i året gå ubemerket hen i et tiår.

Så jeg laget en gratis side som setter hele året i én kolonne. Du legger inn det du faktisk betaler, linje for linje, og den viser deg totalen og hvor den ligger sammenlignet med hva samme type bolig vanligvis koster.

Poenget er ikke å få noen til å føle seg dårlig over et tall. Du kan bare ikke avgjøre om en kostnad er verdt å betale før du ser den ved siden av de andre. Så slutter regningene å mase, og terrassen får kveldene dine tilbake.

{link}`,
    sv: `De flesta ägare kan säga på euron vad deras ställe i Spanien kostade att köpa. Fråga vad det kostar att behålla, och nästan ingen kan svara utan att gå och titta.

Det är inte slarv. Kostnaderna kommer en i taget, vid olika tidpunkter under året, ibland i olika valutor, från sex eller sju olika håll. Kontoavgifter. Den fasta avgiften för elen, som löper oavsett om någon är där eller inte. Vatten. Försäkring. Samfällighetsavgiften. IBI. Gestorian.

Var för sig är ingen av dem värd en förmiddag av din uppmärksamhet, så ingen av dem får någon. Så kan några hundra euro om året gå obemärkt förbi i tio år.

Så jag byggde en gratis sida som samlar hela året i en kolumn. Du fyller i vad du faktiskt betalar, rad för rad, och den visar totalen och var den hamnar jämfört med vad samma sorts bostad brukar kosta.

Poängen är inte att någon ska skämmas över en siffra. Man kan bara inte avgöra om en kostnad är värd att betala förrän man ser den bredvid de andra. Sedan slutar räkningarna gnaga, och terrassen får tillbaka dina kvällar.

{link}`,
    da: `De fleste ejere kan sige på euroen, hvad deres sted i Spanien kostede at købe. Spørg, hvad det koster at have, og næsten ingen kan svare uden at gå hen og kigge efter.

Det er ikke sjusk. Udgifterne kommer én ad gangen, på forskellige tidspunkter af året, nogle gange i forskellige valutaer, fra seks eller syv forskellige steder. Kontogebyrer. Det faste abonnement på strømmen, som løber, uanset om der er nogen der eller ej. Vand. Forsikring. Fællesudgifterne. IBI. Gestoriaen.

Hver for sig er ingen af dem en formiddags opmærksomhed værd, så ingen af dem får den. Sådan kan nogle hundrede euro om året gå ubemærket hen i ti år.

Så jeg byggede en gratis side, der samler hele året i én kolonne. Du taster ind, hvad du faktisk betaler, post for post, og den viser dig totalen, og hvor den ligger i forhold til, hvad samme slags bolig normalt koster.

Pointen er ikke at give nogen dårlig samvittighed over et tal. Du kan bare ikke afgøre, om en udgift er værd at betale, før du ser den ved siden af de andre. Så holder regningerne op med at nage, og terrassen får dine aftener tilbage.

{link}`,
    de: `Die meisten Eigentümer können Ihnen auf den Euro genau sagen, was ihr Haus in Spanien beim Kauf gekostet hat. Fragen Sie, was es im Unterhalt kostet, und kaum jemand kann antworten, ohne nachzusehen.

Das ist keine Nachlässigkeit. Die Kosten kommen einzeln, zu verschiedenen Zeitpunkten im Jahr, manchmal in verschiedenen Währungen, von sechs oder sieben verschiedenen Stellen. Kontogebühren. Die Grundgebühr für den Strom, die läuft, ob jemand da ist oder nicht. Wasser. Versicherung. Das Hausgeld. IBI. Die Gestoria.

Für sich genommen ist keiner dieser Posten einen Vormittag Ihrer Aufmerksamkeit wert, also bekommt ihn auch keiner. So können ein paar hundert Euro im Jahr ein Jahrzehnt lang unbemerkt bleiben.

Also habe ich eine kostenlose Seite gebaut, die das ganze Jahr in eine Spalte bringt. Sie tragen Posten für Posten ein, was Sie tatsächlich zahlen, und die Seite zeigt Ihnen die Summe und wo sie im Vergleich zu dem liegt, was eine ähnliche Immobilie üblicherweise kostet.

Es geht nicht darum, dass sich jemand wegen einer Zahl schlecht fühlt. Sie können nur nicht entscheiden, ob sich ein Posten lohnt, bevor Sie ihn neben den anderen sehen. Dann hören die Rechnungen auf zu nerven, und die Terrasse bekommt Ihre Abende zurück.

{link}`,
    fr: `La plupart des propriétaires peuvent vous dire à l'euro près ce que leur bien en Espagne a coûté à l'achat. Demandez-leur ce qu'il coûte à garder et presque personne ne peut répondre sans aller vérifier.

Ce n'est pas de la négligence. Les coûts arrivent un par un, à des moments différents de l'année, parfois dans des devises différentes, depuis six ou sept endroits différents. Les frais de compte. L'abonnement électrique, qui court que quelqu'un soit là ou non. L'eau. L'assurance. Les charges de copropriété. L'IBI. La gestoria.

Pris isolément, aucun ne mérite une matinée d'attention, donc aucun n'en reçoit. C'est ainsi que quelques centaines d'euros par an peuvent passer inaperçues pendant dix ans.

Alors j'ai créé une page gratuite qui met l'année entière dans une seule colonne. Vous saisissez ce que vous payez réellement, ligne par ligne, et elle vous montre le total, et où il se situe par rapport à ce que coûte habituellement le même type de bien.

Le but n'est pas de culpabiliser qui que ce soit à cause d'un chiffre. On ne peut simplement pas décider si une dépense vaut la peine avant de la voir à côté des autres. Ensuite, les factures cessent de vous tracasser et la terrasse retrouve vos soirées.

{link}`,
    nl: `De meeste eigenaren kunnen u tot op de euro vertellen wat hun woning in Spanje kostte om te kopen. Vraag wat hij kost om te houden en bijna niemand kan antwoorden zonder het op te zoeken.

Dat is geen slordigheid. De kosten komen één voor één, op verschillende momenten in het jaar, soms in verschillende valuta, uit zes of zeven verschillende hoeken. Rekeningkosten. Het vastrecht op de stroom, dat doorloopt of er nu iemand is of niet. Water. Verzekering. De VvE-bijdrage. IBI. De gestoria.

Op zichzelf is geen ervan een ochtend van uw aandacht waard, dus krijgt geen ervan die. Zo blijven een paar honderd euro per jaar tien jaar lang onopgemerkt.

Daarom heb ik een gratis pagina gemaakt die het hele jaar in één kolom zet. U vult regel voor regel in wat u werkelijk betaalt, en hij toont het totaal en waar dat staat naast wat hetzelfde soort woning gewoonlijk kost.

Het gaat er niet om dat iemand zich slecht voelt over een bedrag. U kunt alleen niet bepalen of een kostenpost het waard is voordat u hem naast de andere ziet. Dan houden de rekeningen op met zeuren en krijgt het terras uw avonden terug.

{link}`,
  },
},
{
  key: 'leaving-it-empty',
  tool: 'closing-up',
  kind: 'story',
  rules: ['squat.second_home_is_morada'],
  text: {
    en: `What do I actually need to do before I lock up for the winter?

The short answer depends on three things. How long you'll be away, what time of year you're leaving, and whether anyone will look in while you're gone. Those change the list far more than the size of the place does.

One thing to say plainly, because it comes up in these groups with a lot of worry attached. Under Spanish law, a second home or a seasonal home counts as a morada (a dwelling), provided the people entitled to be there carry on their private life there, even occasionally. That's a more reassuring position than many owners abroad assume they're in.

I built a free checklist that takes those three answers and gives you a dated list for the last day, instead of a generic one you have to filter yourself.

If there's a pool, deal with it before the water turns cold. Then close the shutters knowing the place is ready for when you're back.

{link}`,
    no: `Hva må jeg egentlig gjøre før jeg låser for vinteren?

Det korte svaret avhenger av tre ting. Hvor lenge du er borte, hvilken årstid du reiser, og om noen kommer til å se innom mens du er borte. De endrer listen langt mer enn størrelsen på boligen gjør.

Én ting vil jeg si rett ut, fordi den dukker opp i disse gruppene med mye bekymring rundt seg. Etter spansk lov regnes en fritidsbolig eller sesongbolig som en morada (en bopel), så lenge de som har rett til å være der, fører sitt private liv der, selv om det bare er av og til. Det er en tryggere posisjon enn mange eiere i utlandet tror de er i.

Jeg laget en gratis sjekkliste som tar de tre svarene og gir deg en datert liste for siste dag, i stedet for en generell liste du må sile selv.

Har du basseng, ta deg av det før vannet blir kaldt. Så kan du lukke skoddene og vite at stedet er klart til du kommer tilbake.

{link}`,
    sv: `Vad behöver jag egentligen göra innan jag låser för vintern?

Det korta svaret beror på tre saker. Hur länge du är borta, vilken tid på året du åker, och om någon kommer att titta till stället medan du är borta. De ändrar listan mycket mer än bostadens storlek gör.

En sak vill jag säga rakt ut, eftersom den dyker upp i de här grupperna med mycket oro kring sig. Enligt spansk lag räknas ett fritidshus eller en säsongsbostad som en morada (en bostad), förutsatt att de som har rätt att vara där lever sitt privatliv där, även om det bara är ibland. Det är en tryggare position än många ägare utomlands tror att de har.

Jag byggde en gratis checklista som tar de tre svaren och ger dig en daterad lista för sista dagen, i stället för en allmän lista som du måste sålla i själv.

Finns det en pool, ta hand om den innan vattnet blir kallt. Stäng sedan luckorna med vetskapen att stället är redo för när du kommer tillbaka.

{link}`,
    da: `Hvad skal jeg egentlig gøre, før jeg låser af for vinteren?

Det korte svar afhænger af tre ting. Hvor længe du er væk, hvilken årstid du rejser i, og om der er nogen, der kigger forbi, mens du er væk. De ændrer listen langt mere, end boligens størrelse gør.

Én ting vil jeg sige ligeud, for den dukker op i de her grupper med en masse bekymring hæftet på. Efter spansk ret regnes en fritidsbolig eller en sæsonbolig som en morada (en bolig), forudsat at de personer, der har ret til at være der, lever deres privatliv der, også selvom det kun er en gang imellem. Det er en mere betryggende situation, end mange ejere i udlandet tror, de står i.

Jeg byggede en gratis tjekliste, der tager de tre svar og giver dig en dateret liste til den sidste dag, i stedet for en generel liste, du selv skal sortere i.

Har du pool, så tag dig af den, før vandet bliver koldt. Så kan du lukke skodderne og vide, at stedet er klar, når du kommer tilbage.

{link}`,
    de: `Was muss ich eigentlich erledigen, bevor ich für den Winter abschließe?

Die kurze Antwort hängt von drei Dingen ab. Wie lange Sie weg sind, zu welcher Jahreszeit Sie abreisen und ob jemand nach dem Rechten sieht, während Sie fort sind. Diese drei verändern die Liste viel stärker als die Größe des Hauses.

Eines möchte ich klar sagen, weil es in diesen Gruppen oft mit viel Sorge verbunden auftaucht. Nach spanischem Recht gilt ein Zweit- oder Saisonhaus als morada (eine Wohnung), sofern die Menschen, die dort sein dürfen, dort ihr Privatleben führen, auch nur gelegentlich. Das ist eine beruhigendere Lage, als viele Eigentümer im Ausland annehmen.

Ich habe eine kostenlose Checkliste gebaut, die diese drei Antworten nimmt und Ihnen eine datierte Liste für den letzten Tag gibt, statt einer allgemeinen, die Sie selbst filtern müssen.

Wenn es einen Pool gibt, kümmern Sie sich darum, bevor das Wasser kalt wird. Dann schließen Sie die Fensterläden in dem Wissen, dass alles für Ihre Rückkehr bereit ist.

{link}`,
    fr: `Que faut-il vraiment faire avant de fermer pour l'hiver ?

La réponse courte dépend de trois choses. Combien de temps vous serez absent, à quelle période de l'année vous partez, et si quelqu'un passera jeter un œil pendant votre absence. Ces trois points changent la liste bien plus que la taille du logement.

Une chose mérite d'être dite clairement, parce qu'elle revient dans ces groupes avec beaucoup d'inquiétude. En droit espagnol, une résidence secondaire ou saisonnière compte comme une morada (un domicile), dès lors que les personnes qui ont le droit d'y être y mènent leur vie privée, même occasionnellement. C'est une position plus rassurante que ce que supposent beaucoup de propriétaires à l'étranger.

J'ai créé une checklist gratuite qui prend ces trois réponses et vous donne une liste datée pour le dernier jour, plutôt qu'une liste générique à trier vous-même.

S'il y a une piscine, occupez-vous-en avant que l'eau refroidisse. Ensuite, fermez les volets en sachant que tout est prêt pour votre retour.

{link}`,
    nl: `Wat moet ik eigenlijk doen voordat ik voor de winter afsluit?

Het korte antwoord hangt af van drie dingen. Hoe lang u weg bent, in welk seizoen u vertrekt, en of er iemand komt kijken terwijl u weg bent. Die veranderen de lijst veel meer dan de grootte van de woning.

Eén ding wil ik ronduit zeggen, want het komt in deze groepen op met veel zorg eraan vast. Naar Spaans recht telt een tweede woning of een seizoenswoning als een morada (een woning in juridische zin), mits degenen die er mogen zijn er hun privéleven leiden, al is het af en toe. Dat is een geruststellender positie dan veel eigenaren in het buitenland denken.

Ik heb een gratis checklist gemaakt die die drie antwoorden neemt en u een gedateerde lijst voor de laatste dag geeft, in plaats van een algemene die u zelf moet uitfilteren.

Heeft u een zwembad, regel dat dan voordat het water koud wordt. Sluit daarna de luiken, in de wetenschap dat de woning klaar is voor als u terugkomt.

{link}`,
  },
},
{
  key: 'utilities-in-order',
  tool: 'utility-setup',
  kind: 'informative',
  rules: ['nie.form', 'nie.fee'],
  text: {
    en: `Getting the power and water on in a Spanish property is five jobs, and two of them can't start until something else has finished.

Electricity, water, gas, internet and the council charge. Five offices, five forms, five document lists, and none of them tells you about the other four.

The order is what costs people weeks. Start the wrong one first and you wait, find out it can't go ahead, and start again from the beginning.

Two small things help right at the start, because this is where people get sent home. The NIE application is form EX-15. The EX-18 is the EU citizen registration certificate, a different procedure entirely, and turning up with the wrong one costs you the morning. The fee for assigning a NIE is €9.84, which is useful to know before anyone quotes you something else.

I built a free page that asks six questions about your situation and gives you the order the five have to happen in, with the documents each one needs.

Then the lights come on, the tap runs, and the place starts to feel like yours.

{link}`,
    no: `Å få strøm og vann i en spansk bolig er fem jobber, og to av dem kan ikke starte før noe annet er ferdig.

Strøm, vann, gass, internett og den kommunale avgiften. Fem kontorer, fem skjemaer, fem dokumentlister, og ingen av dem forteller deg om de fire andre.

Det er rekkefølgen som koster folk uker. Starter du med feil jobb først, venter du, finner ut at den ikke kan gå videre, og begynner på nytt fra starten.

To små ting hjelper helt i begynnelsen, for det er her folk blir sendt hjem. Søknaden om NIE er skjema EX-15. EX-18 er registreringsbeviset for EU-borgere, en helt annen prosedyre, og møter du opp med feil skjema, koster det deg formiddagen. Gebyret for å få tildelt NIE er €9,84, som er greit å vite før noen oppgir noe annet.

Jeg laget en gratis side som stiller seks spørsmål om situasjonen din og gir deg rekkefølgen de fem må skje i, med dokumentene hver av dem trenger.

Så kommer lyset på, kranen renner, og stedet begynner å føles som ditt.

{link}`,
    sv: `Att få igång el och vatten i en spansk bostad är fem jobb, och två av dem kan inte börja förrän något annat är klart.

El, vatten, gas, internet och den kommunala avgiften. Fem kontor, fem blanketter, fem dokumentlistor, och ingen av dem berättar om de andra fyra.

Det är ordningen som kostar folk veckor. Börjar du med fel först får du vänta, upptäcker att det inte kan gå vidare och börjar om från början.

Två små saker hjälper redan från start, för det är här folk blir hemskickade. Ansökan om NIE görs på blankett EX-15. EX-18 är registreringsintyget för EU-medborgare, en helt annan procedur, och att dyka upp med fel blankett kostar dig förmiddagen. Avgiften för att tilldelas ett NIE är €9,84, vilket är bra att veta innan någon nämner ett annat belopp.

Jag byggde en gratis sida som ställer sex frågor om din situation och ger dig ordningen de fem måste göras i, med de dokument var och en kräver.

Sedan tänds lamporna, kranen rinner och stället börjar kännas som ditt.

{link}`,
    da: `At få strøm og vand i en spansk bolig er fem opgaver, og to af dem kan ikke gå i gang, før noget andet er afsluttet.

El, vand, gas, internet og den kommunale afgift. Fem kontorer, fem formularer, fem lister over dokumenter, og ingen af dem fortæller dig om de fire andre.

Det er rækkefølgen, der koster folk uger. Starter du med den forkerte, venter du, finder ud af, at den ikke kan komme videre, og begynder forfra.

To små ting hjælper helt fra starten, for det er her, folk bliver sendt hjem. Ansøgningen om NIE er formular EX-15. EX-18 er registreringsbeviset for EU-borgere, en helt anden procedure, og møder du op med den forkerte, koster det dig formiddagen. Gebyret for at få tildelt et NIE er €9,84, hvilket er nyttigt at vide, før nogen nævner en anden pris.

Jeg byggede en gratis side, der stiller seks spørgsmål om din situation og giver dig den rækkefølge, de fem skal ske i, med de dokumenter, hver af dem kræver.

Så tænder lyset, vandet løber, og stedet begynder at føles som dit.

{link}`,
    de: `Wer in einer spanischen Immobilie Strom und Wasser anmelden will, hat fünf Aufgaben vor sich, und zwei davon können erst beginnen, wenn etwas anderes abgeschlossen ist.

Strom, Wasser, Gas, Internet und die Gemeindeabgabe. Fünf Stellen, fünf Formulare, fünf Dokumentenlisten, und keine davon erwähnt die anderen vier.

Die Reihenfolge ist das, was Leute Wochen kostet. Fangen Sie mit der falschen an, warten Sie, erfahren dann, dass es nicht weitergeht, und beginnen von vorn.

Zwei kleine Dinge helfen gleich am Anfang, denn genau hier werden Leute wieder nach Hause geschickt. Der NIE-Antrag ist das Formular EX-15. Das EX-18 ist die Registrierungsbescheinigung für EU-Bürger, ein völlig anderes Verfahren, und wer mit dem falschen erscheint, verliert den Vormittag. Die Gebühr für die Zuteilung einer NIE beträgt €9,84, und das ist gut zu wissen, bevor Ihnen jemand etwas anderes nennt.

Ich habe eine kostenlose Seite gebaut, die sechs Fragen zu Ihrer Situation stellt und Ihnen die Reihenfolge gibt, in der die fünf erledigt werden müssen, mit den Dokumenten, die jede braucht.

Dann geht das Licht an, das Wasser läuft, und das Haus fühlt sich langsam wie Ihres an.

{link}`,
    fr: `Mettre l'électricité et l'eau en service dans un bien espagnol, c'est cinq démarches, et deux d'entre elles ne peuvent pas commencer tant qu'autre chose n'est pas terminé.

Électricité, eau, gaz, internet et la taxe communale. Cinq guichets, cinq formulaires, cinq listes de pièces, et aucun ne vous parle des quatre autres.

C'est l'ordre qui coûte des semaines. Commencez par la mauvaise, et vous attendez, vous apprenez qu'elle ne peut pas avancer, et vous recommencez depuis le début.

Deux petites choses aident dès le départ, parce que c'est là qu'on renvoie les gens chez eux. La demande de NIE se fait avec le formulaire EX-15. L'EX-18 est le certificat d'enregistrement des citoyens de l'UE, une procédure entièrement différente, et se présenter avec le mauvais vous coûte la matinée. La taxe pour l'attribution d'un NIE est de 9,84 €, bon à savoir avant qu'on vous annonce autre chose.

J'ai créé une page gratuite qui pose six questions sur votre situation et vous donne l'ordre dans lequel les cinq démarches doivent se faire, avec les documents que chacune demande.

Ensuite, la lumière s'allume, l'eau coule au robinet, et le lieu commence à vous ressembler.

{link}`,
    nl: `Stroom en water aansluiten in een Spaanse woning bestaat uit vijf klussen, en twee daarvan kunnen pas beginnen als iets anders klaar is.

Stroom, water, gas, internet en de gemeentelijke heffing. Vijf loketten, vijf formulieren, vijf documentenlijsten, en geen van alle vertelt u over de andere vier.

De volgorde is wat mensen weken kost. Begin met de verkeerde en u wacht, hoort dat het zo niet verder kan, en begint weer helemaal opnieuw.

Twee kleine dingen helpen helemaal aan het begin, want hier worden mensen naar huis gestuurd. De NIE-aanvraag is formulier EX-15. De EX-18 is het registratiebewijs voor EU-burgers, een heel andere procedure, en met de verkeerde komen opdagen kost u de ochtend. De leges voor het toekennen van een NIE zijn €9,84, handig om te weten voordat iemand u iets anders noemt.

Ik heb een gratis pagina gemaakt die zes vragen over uw situatie stelt en u de volgorde geeft waarin de vijf moeten gebeuren, met de documenten die elk ervan nodig heeft.

Dan gaat het licht aan, loopt de kraan, en begint de woning echt als de uwe te voelen.

{link}`,
  },
},
{
  key: 'tradesperson-in-your-language',
  tool: 'spain-directory',
  kind: 'story',
  rules: [],
  text: {
    en: `Someone in a group like this needs a plumber, twenty people reply with a name, and none of them answers the real question. Will I be able to make myself understood on the phone when water is coming through the ceiling?

Recommendations are personal, and they don't travel well. A plumber who's brilliant for someone who speaks Spanish isn't always the right call for someone who doesn't, and you tend to find that out at the worst moment.

So I built a free directory that sorts on exactly that. Plumbers, electricians, locksmiths, air conditioning, pool service and builders, across 660 Spanish towns, ranked from reviews. The ones already reviewed in your own language come first. Pick the language you need help in and the page reorders itself.

There's no listing fee, and nobody pays to sit higher up. If your town looks thin or something is out of date, tell me and I'll look into it.

Then, next time the ceiling drips, you'll know who to ring (and that they'll understand you).

{link}`,
    no: `Noen i en gruppe som denne trenger en rørlegger, tjue personer svarer med et navn, og ingen av dem svarer på det egentlige spørsmålet. Kommer jeg til å kunne gjøre meg forstått på telefonen når vannet renner gjennom taket?

Anbefalinger er personlige, og de reiser dårlig. En rørlegger som er strålende for noen som snakker spansk, er ikke alltid riktig valg for noen som ikke gjør det, og det oppdager man gjerne i verst tenkelige øyeblikk.

Så jeg laget en gratis katalog som sorterer på akkurat det. Rørleggere, elektrikere, låsesmeder, aircondition, bassengservice og byggmestere, i 660 spanske byer og tettsteder, rangert ut fra omtaler. De som allerede har fått omtaler på ditt eget språk, kommer først. Velg språket du trenger hjelp på, og siden sorterer seg selv på nytt.

Det koster ingenting å bli oppført, og ingen betaler for å komme høyere opp. Ser byen din tynn ut, eller er noe utdatert, si fra, så ser jeg på det.

Så vet du, neste gang det drypper fra taket, hvem du skal ringe (og at de forstår deg).

{link}`,
    sv: `Någon i en grupp som den här behöver en rörmokare, tjugo personer svarar med ett namn, och ingen av dem besvarar den egentliga frågan. Kommer jag att kunna göra mig förstådd i telefon när vattnet rinner genom taket?

Rekommendationer är personliga, och de reser dåligt. En rörmokare som är lysande för någon som talar spanska är inte alltid rätt val för någon som inte gör det, och det brukar man upptäcka i sämsta tänkbara ögonblick.

Så jag byggde en gratis katalog som sorterar på just det. Rörmokare, elektriker, låssmeder, luftkonditionering, poolservice och byggare, i 660 spanska orter, rankade utifrån omdömen. De som redan har omdömen på ditt eget språk kommer först. Välj språket du behöver hjälp på, så sorterar sidan om sig själv.

Det finns ingen listningsavgift, och ingen betalar för att hamna högre upp. Ser din ort tunn ut eller är något inaktuellt, säg till så tittar jag på det.

Nästa gång det droppar från taket vet du sedan vem du ska ringa (och att de förstår dig).

{link}`,
    da: `Nogen i en gruppe som den her har brug for en VVS'er, tyve personer svarer med et navn, og ingen af dem svarer på det egentlige spørgsmål. Kan jeg gøre mig forståelig i telefonen, når vandet løber ned gennem loftet?

Anbefalinger er personlige, og de rejser dårligt. En VVS'er, der er fantastisk for en, der taler spansk, er ikke altid det rigtige opkald for en, der ikke gør, og det finder man som regel ud af på det værst tænkelige tidspunkt.

Så jeg byggede en gratis oversigt, der sorterer efter præcis det. VVS'ere, elektrikere, låsesmede, aircondition, poolservice og byggefolk i 660 spanske byer, rangeret ud fra anmeldelser. Dem, der allerede er anmeldt på dit eget sprog, kommer først. Vælg det sprog, du har brug for hjælp på, og siden sorterer sig selv om.

Det koster intet at blive listet, og ingen betaler for at ligge højere oppe. Ser din by tynd ud, eller er noget forældet, så sig til, så kigger jeg på det.

Så ved du næste gang, loftet drypper, hvem du skal ringe til (og at de forstår dig).

{link}`,
    de: `Jemand in einer Gruppe wie dieser braucht einen Klempner, zwanzig Leute antworten mit einem Namen, und keiner beantwortet die eigentliche Frage. Kann ich mich am Telefon verständlich machen, wenn Wasser durch die Decke kommt?

Empfehlungen sind persönlich, und sie lassen sich schlecht übertragen. Ein Klempner, der für jemanden, der Spanisch spricht, großartig ist, ist nicht immer die richtige Wahl für jemanden, der es nicht spricht, und das merkt man meist im schlechtesten Moment.

Deshalb habe ich ein kostenloses Verzeichnis gebaut, das genau danach sortiert. Klempner, Elektriker, Schlüsseldienste, Klimaanlagen, Poolservice und Bauunternehmer, in 660 spanischen Orten, geordnet nach Bewertungen. Wer schon Bewertungen in Ihrer eigenen Sprache hat, steht oben. Wählen Sie die Sprache, in der Sie Hilfe brauchen, und die Seite ordnet sich neu.

Es gibt keine Eintragsgebühr, und niemand zahlt, um weiter oben zu stehen. Wenn Ihr Ort dünn besetzt aussieht oder etwas veraltet ist, sagen Sie es mir, und ich sehe es mir an.

Dann wissen Sie beim nächsten Tropfen von der Decke, wen Sie anrufen (und dass man Sie versteht).

{link}`,
    fr: `Dans un groupe comme celui-ci, quelqu'un cherche un plombier, vingt personnes répondent avec un nom, et aucune ne répond à la vraie question. Est-ce que j'arriverai à me faire comprendre au téléphone quand l'eau traverse le plafond ?

Les recommandations sont personnelles, et elles voyagent mal. Un plombier génial pour quelqu'un qui parle espagnol n'est pas toujours le bon choix pour quelqu'un qui ne le parle pas, et on le découvre en général au pire moment.

Alors j'ai créé un annuaire gratuit qui trie exactement sur ce critère. Plombiers, électriciens, serruriers, climatisation, entretien de piscine et maçons, dans 660 communes espagnoles, classés à partir des avis. Ceux qui ont déjà des avis dans votre langue apparaissent en premier. Choisissez la langue dans laquelle vous avez besoin d'aide et la page se réorganise.

Il n'y a pas de frais d'inscription, et personne ne paie pour être mieux placé. Si votre commune paraît peu fournie ou si quelque chose n'est plus à jour, dites-le-moi et j'irai voir.

Ainsi, la prochaine fois que le plafond goutte, vous saurez qui appeler (et que l'on vous comprendra).

{link}`,
    nl: `Iemand in een groep als deze heeft een loodgieter nodig, twintig mensen antwoorden met een naam, en geen van hen beantwoordt de echte vraag. Kan ik me aan de telefoon verstaanbaar maken als er water door het plafond komt?

Aanbevelingen zijn persoonlijk, en ze laten zich slecht verplaatsen. Een loodgieter die geweldig is voor iemand die Spaans spreekt, is niet altijd de juiste keuze voor iemand die dat niet doet, en daar komt u meestal op het slechtste moment achter.

Daarom heb ik een gratis gids gemaakt die precies daarop sorteert. Loodgieters, elektriciens, slotenmakers, airco, zwembadonderhoud en aannemers, in 660 Spaanse plaatsen, gerangschikt op reviews. Wie al in uw eigen taal is beoordeeld, staat bovenaan. Kies de taal waarin u hulp nodig heeft en de pagina sorteert zichzelf opnieuw.

Er zijn geen vermeldingskosten, en niemand betaalt om hoger te staan. Ziet uw plaats er mager uit of is iets verouderd, laat het me weten, dan zoek ik het uit.

Dan weet u de volgende keer dat het plafond lekt wie u moet bellen (en dat ze u begrijpen).

{link}`,
  },
},
{
  key: 'who-does-what',
  tool: 'spain-professionals',
  kind: 'informative',
  rules: [],
  text: {
    en: `Abogado, gestoría, administrador de fincas, procurador. Four Spanish job titles that get used as if they meant the same thing, and picking the wrong one usually costs you a fortnight rather than money.

An abogado is a lawyer and runs the case. A gestoría handles filings and paperwork and doesn't go to court. An administrador de fincas runs the community of owners, its accounts and its meetings. A procurador represents you procedurally in front of the court, alongside your abogado.

Get it wrong and you explain the whole situation to someone who was never the right person, they're polite about it, and a week later you explain it all again to somebody else.

Then there's a second layer. Estate agent, architect, valuer, insurance broker, sworn translator. Each turns up in a property problem, and each does something narrow and specific.

So the free page I built explains what each one actually does before it shows you a single name. Then it ranks your town, with the ones already reviewed in your language first.

One call to the right person, and you can get back to the terrace.

{link}`,
    no: `Abogado, gestoría, administrador de fincas, procurador. Fire spanske yrkestitler som brukes som om de betydde det samme, og å velge feil koster deg som regel fjorten dager heller enn penger.

En abogado er advokat og fører saken. En gestoría tar seg av innleveringer og papirarbeid og går ikke i retten. En administrador de fincas driver sameiet, regnskapet og møtene. En procurador representerer deg prosessuelt overfor retten, sammen med abogadoen din.

Velger du feil, forklarer du hele situasjonen til noen som aldri var riktig person, de er høflige om det, og en uke senere forklarer du alt på nytt til noen andre.

Så er det et lag til. Eiendomsmegler, arkitekt, takstmann, forsikringsmegler, statsautorisert translatør. Hver av dem dukker opp i et boligproblem, og hver gjør noe smalt og spesifikt.

Så den gratis siden jeg laget, forklarer hva hver av dem faktisk gjør før den viser deg et eneste navn. Deretter rangerer den byen din, med dem som allerede har omtaler på ditt språk først.

Én telefon til riktig person, og du kan gå tilbake til terrassen.

{link}`,
    sv: `Abogado, gestoría, administrador de fincas, procurador. Fyra spanska yrkestitlar som används som om de betydde samma sak, och att välja fel kostar dig oftast två veckor snarare än pengar.

En abogado är advokat och driver ärendet. En gestoría sköter inlämningar och pappersarbete och går inte till domstol. En administrador de fincas driver samfälligheten, dess räkenskaper och dess stämmor. En procurador företräder dig processuellt inför domstolen, vid sidan av din abogado.

Blir det fel förklarar du hela situationen för någon som aldrig var rätt person, de är artiga om det, och en vecka senare förklarar du allt igen för någon annan.

Sedan finns det ett lager till. Mäklare, arkitekt, värderingsman, försäkringsmäklare, auktoriserad translator. Var och en dyker upp i ett fastighetsproblem, och var och en gör något smalt och specifikt.

Så den gratis sidan jag byggde förklarar vad var och en faktiskt gör innan den visar dig ett enda namn. Sedan rankar den din ort, med dem som redan har omdömen på ditt språk först.

Ett samtal till rätt person, och du kan gå tillbaka till terrassen.

{link}`,
    da: `Abogado, gestoría, administrador de fincas, procurador. Fire spanske titler, der bliver brugt, som om de betød det samme, og vælger du den forkerte, koster det dig som regel fjorten dage snarere end penge.

En abogado er advokat og fører sagen. En gestoría tager sig af indberetninger og papirarbejde og går ikke i retten. En administrador de fincas driver ejerforeningen, dens regnskab og dens møder. En procurador repræsenterer dig processuelt over for retten, ved siden af din abogado.

Tager du fejl, forklarer du hele situationen til en, der aldrig var den rette person, vedkommende er høflig omkring det, og en uge senere forklarer du det hele igen til en anden.

Så er der et lag mere. Ejendomsmægler, arkitekt, vurderingsmand, forsikringsmægler, statsautoriseret translatør. Hver af dem dukker op i et problem med en bolig, og hver laver noget snævert og helt bestemt.

Så den gratis side, jeg byggede, forklarer, hvad hver af dem faktisk laver, før den viser dig et eneste navn. Derefter rangerer den din by, med dem, der allerede er anmeldt på dit sprog, først.

Ét opkald til den rette person, og du kan vende tilbage til terrassen.

{link}`,
    de: `Abogado, gestoría, administrador de fincas, procurador. Vier spanische Berufsbezeichnungen, die verwendet werden, als bedeuteten sie dasselbe, und wer die falsche wählt, verliert meist zwei Wochen statt Geld.

Ein abogado ist ein Anwalt und führt den Fall. Eine gestoría kümmert sich um Anträge und Papierkram und geht nicht vor Gericht. Ein administrador de fincas verwaltet die Eigentümergemeinschaft, ihre Konten und ihre Versammlungen. Ein procurador vertritt Sie verfahrensrechtlich vor Gericht, an der Seite Ihres abogado.

Liegen Sie falsch, erklären Sie die ganze Lage jemandem, der nie der Richtige war, er bleibt höflich, und eine Woche später erklären Sie alles noch einmal jemand anderem.

Dann gibt es eine zweite Ebene. Immobilienmakler, Architekt, Gutachter, Versicherungsmakler, vereidigter Übersetzer. Jeder taucht bei Immobilienproblemen auf, und jeder macht etwas Enges und Bestimmtes.

Die kostenlose Seite, die ich gebaut habe, erklärt deshalb, was jeder davon tatsächlich macht, bevor sie Ihnen einen einzigen Namen zeigt. Dann ordnet sie die Anbieter in Ihrem Ort, mit denen zuerst, die schon in Ihrer Sprache bewertet wurden.

Ein Anruf bei der richtigen Person, und Sie sind wieder auf der Terrasse.

{link}`,
    fr: `Abogado, gestoría, administrador de fincas, procurador. Quatre intitulés espagnols employés comme s'ils voulaient dire la même chose, et se tromper vous coûte en général quinze jours plutôt que de l'argent.

Un abogado est avocat et mène le dossier. Une gestoría s'occupe des déclarations et de la paperasse et ne va pas au tribunal. Un administrador de fincas gère la copropriété, ses comptes et ses assemblées. Un procurador vous représente sur le plan procédural devant le tribunal, aux côtés de votre abogado.

Si vous vous trompez, vous exposez toute la situation à quelqu'un qui n'a jamais été la bonne personne, il reste poli, et une semaine plus tard vous expliquez tout à nouveau à quelqu'un d'autre.

Et il y a une deuxième couche. Agent immobilier, architecte, expert évaluateur, courtier en assurance, traducteur assermenté. Chacun intervient dans un problème immobilier, et chacun fait quelque chose de précis et limité.

La page gratuite que j'ai créée explique donc ce que fait réellement chacun avant de vous montrer le moindre nom. Ensuite, elle classe les professionnels de votre commune, avec en tête ceux déjà évalués dans votre langue.

Un appel à la bonne personne, et vous pouvez retourner sur la terrasse.

{link}`,
    nl: `Abogado, gestoría, administrador de fincas, procurador. Vier Spaanse beroepen die worden gebruikt alsof ze hetzelfde betekenen, en de verkeerde kiezen kost u meestal twee weken, geen geld.

Een abogado is advocaat en voert de zaak. Een gestoría doet aangiftes en papierwerk en gaat niet naar de rechter. Een administrador de fincas beheert de vereniging van eigenaren, de boekhouding en de vergaderingen. Een procurador vertegenwoordigt u procesrechtelijk voor de rechter, naast uw abogado.

Zit u ernaast, dan legt u de hele situatie uit aan iemand die er nooit de juiste persoon voor was, die daar beleefd over is, en een week later legt u alles opnieuw uit aan iemand anders.

Dan is er nog een tweede laag. Makelaar, architect, taxateur, verzekeringsmakelaar, beëdigd vertaler. Ze duiken allemaal op bij een probleem met een woning, en elk doet iets smals en specifieks.

Daarom legt de gratis pagina die ik maakte eerst uit wat elk van hen werkelijk doet, voordat hij u ook maar één naam laat zien. Daarna rangschikt hij uw plaats, met bovenaan wie al in uw taal is beoordeeld.

Eén telefoontje naar de juiste persoon, en u kunt weer terug naar het terras.

{link}`,
  },
},
{
  key: 'maintenance-is-a-year',
  tool: 'maintenance-schedule',
  kind: 'story',
  rules: [],
  text: {
    en: `Maintenance on a Spanish property works better as a calendar than as a list of jobs.

Sun, salt and a wet winter break different things, and they break them at different times of year. Do a job in the right month and it prevents something. Do exactly the same job in the wrong month and it's just work you paid for.

There's a second half if you're not there most of the year, which is true for most people in these groups. Some jobs can't be done by the owner at all, because they have to happen while nobody is in the country. Knowing which ones is the difference between a list and a plan you can hand to somebody.

So I built it as a free twelve month schedule rather than a checklist. Five questions about the property, and every job comes out saying what it prevents and what has to happen while you're away.

Then the place is ready when you arrive, and the first week there is a holiday rather than a list of chores.

{link}`,
    no: `Vedlikehold av en spansk bolig fungerer bedre som en kalender enn som en liste over jobber.

Sol, salt og en våt vinter ødelegger ulike ting, og de gjør det på ulike tider av året. Gjør du en jobb i riktig måned, forebygger den noe. Gjør du nøyaktig samme jobb i feil måned, er det bare arbeid du har betalt for.

Det finnes en andre halvdel hvis du ikke er der mesteparten av året, noe som gjelder de fleste i disse gruppene. Noen jobber kan ikke eieren gjøre i det hele tatt, fordi de må skje mens ingen er i landet. Å vite hvilke, er forskjellen mellom en liste og en plan du kan gi videre til noen.

Så jeg laget det som en gratis tolvmånedersplan i stedet for en sjekkliste. Fem spørsmål om boligen, og hver jobb kommer ut med hva den forebygger og hva som må skje mens du er borte.

Så er stedet klart når du kommer, og den første uken der er ferie i stedet for en liste med gjøremål.

{link}`,
    sv: `Underhåll av en spansk bostad fungerar bättre som en kalender än som en lista med jobb.

Sol, salt och en blöt vinter förstör olika saker, och de gör det vid olika tider på året. Gör ett jobb i rätt månad så förebygger det något. Gör exakt samma jobb i fel månad så är det bara arbete du har betalat för.

Det finns en andra halva om du inte är där större delen av året, vilket gäller de flesta i de här grupperna. Vissa jobb kan ägaren inte göra alls, eftersom de måste ske medan ingen är i landet. Att veta vilka är skillnaden mellan en lista och en plan som du kan lämna över till någon.

Så jag byggde det som ett gratis tolvmånadersschema i stället för en checklista. Fem frågor om bostaden, och varje jobb kommer ut med vad det förebygger och vad som måste ske medan du är borta.

Sedan är stället redo när du kommer, och första veckan där är semester i stället för en lista med sysslor.

{link}`,
    da: `Vedligeholdelse af en spansk bolig fungerer bedre som en kalender end som en liste over opgaver.

Sol, salt og en våd vinter ødelægger forskellige ting, og de gør det på forskellige tidspunkter af året. Laver du en opgave i den rigtige måned, forebygger den noget. Laver du præcis den samme opgave i den forkerte måned, er det bare arbejde, du har betalt for.

Der er en anden halvdel, hvis du ikke er der det meste af året, og det gælder de fleste i de her grupper. Nogle opgaver kan ejeren slet ikke selv lave, fordi de skal ske, mens ingen er i landet. At vide, hvilke det er, er forskellen på en liste og en plan, du kan give videre til nogen.

Så jeg byggede det som en gratis plan over tolv måneder i stedet for en tjekliste. Fem spørgsmål om boligen, og hver opgave kommer ud med, hvad den forebygger, og hvad der skal ske, mens du er væk.

Så er stedet klar, når du kommer, og den første uge dernede er ferie i stedet for en liste over pligter.

{link}`,
    de: `Instandhaltung bei einer spanischen Immobilie funktioniert besser als Kalender denn als Liste von Aufgaben.

Sonne, Salz und ein nasser Winter machen verschiedene Dinge kaputt, und das zu verschiedenen Zeiten im Jahr. Erledigen Sie eine Arbeit im richtigen Monat, verhindert sie etwas. Erledigen Sie genau dieselbe Arbeit im falschen Monat, ist es nur Arbeit, die Sie bezahlt haben.

Es gibt eine zweite Hälfte, wenn Sie die meiste Zeit des Jahres nicht dort sind, und das gilt für die meisten in diesen Gruppen. Manche Arbeiten kann der Eigentümer gar nicht selbst erledigen, weil sie stattfinden müssen, während niemand im Land ist. Zu wissen, welche das sind, macht den Unterschied zwischen einer Liste und einem Plan, den Sie jemandem übergeben können.

Deshalb habe ich es als kostenlosen Zwölfmonatsplan gebaut statt als Checkliste. Fünf Fragen zur Immobilie, und jede Arbeit kommt mit dem, was sie verhindert, und dem, was während Ihrer Abwesenheit passieren muss.

Dann ist das Haus bereit, wenn Sie ankommen, und die erste Woche dort ist Urlaub statt einer Liste von Pflichten.

{link}`,
    fr: `L'entretien d'un bien espagnol fonctionne mieux comme un calendrier que comme une liste de travaux.

Le soleil, le sel et un hiver humide abîment des choses différentes, et à des moments différents de l'année. Faites un travail au bon mois et il prévient un problème. Faites exactement le même travail au mauvais mois et ce n'est que du travail que vous avez payé.

Il y a une deuxième moitié si vous n'êtes pas sur place la plus grande partie de l'année, ce qui est le cas de la plupart des membres de ces groupes. Certains travaux ne peuvent pas du tout être faits par le propriétaire, parce qu'ils doivent avoir lieu quand personne n'est dans le pays. Savoir lesquels, c'est la différence entre une liste et un plan que vous pouvez confier à quelqu'un.

Je l'ai donc construit comme un calendrier gratuit sur douze mois plutôt que comme une checklist. Cinq questions sur le bien, et chaque travail ressort en indiquant ce qu'il prévient et ce qui doit se faire pendant votre absence.

Ensuite, le logement est prêt quand vous arrivez, et la première semaine sur place ressemble à des vacances plutôt qu'à une liste de corvées.

{link}`,
    nl: `Onderhoud aan een Spaanse woning werkt beter als kalender dan als lijst met klussen.

Zon, zout en een natte winter breken verschillende dingen, en dat doen ze op verschillende momenten in het jaar. Doe een klus in de juiste maand en hij voorkomt iets. Doe precies dezelfde klus in de verkeerde maand en het is alleen werk waarvoor u betaald heeft.

Er is een tweede helft als u er het grootste deel van het jaar niet bent, en dat geldt voor de meeste mensen in deze groepen. Sommige klussen kan de eigenaar helemaal niet zelf doen, omdat ze moeten gebeuren terwijl er niemand in het land is. Weten welke dat zijn is het verschil tussen een lijst en een plan dat u aan iemand kunt overdragen.

Daarom heb ik het gemaakt als een gratis schema van twaalf maanden in plaats van een checklist. Vijf vragen over de woning, en bij elke klus staat wat hij voorkomt en wat er moet gebeuren terwijl u weg bent.

Dan is de woning klaar als u aankomt, en is de eerste week daar vakantie in plaats van een lijst met karweitjes.

{link}`,
  },
},
{
  key: 'pests-by-property',
  tool: 'pest-plan',
  kind: 'informative',
  rules: [],
  text: {
    en: `Warm weather, a garden, and long stretches with nobody in the place. Each one attracts something different in a Spanish property, and they barely overlap.

That's why general advice never quite fits. What works for a ground floor flat with a terrace isn't the advice for a villa with pines and a pool, and neither is right for somewhere that stands empty from October to April.

The empty months are the ones owners abroad tend to underestimate, and it's easy to see why. Nothing gets disturbed, nothing gets noticed, and the first sign is the one you see when you walk in at Easter. By then, the useful moment was months ago.

I built a free page that asks five questions and gives you the pests most likely for your property, the signs to look for, what prevents each one, and which ones honestly aren't a job for the owner (some are a phone call, not a Saturday).

Sort it once, and Easter can be about the first lunch on the terrace instead.

{link}`,
    no: `Varmt vær, en hage og lange perioder uten noen i boligen. Hver av dem tiltrekker seg noe forskjellig i en spansk bolig, og de overlapper knapt.

Derfor passer generelle råd aldri helt. Det som fungerer for en leilighet på bakkeplan med terrasse, er ikke rådet for en villa med furutrær og basseng, og ingen av dem er riktige for et sted som står tomt fra oktober til april.

De tomme månedene er dem eiere i utlandet gjerne undervurderer, og det er lett å forstå hvorfor. Ingenting blir forstyrret, ingenting blir lagt merke til, og det første tegnet er det du ser når du går inn døren i påsken. Da var det nyttige øyeblikket for flere måneder siden.

Jeg laget en gratis side som stiller fem spørsmål og gir deg skadedyrene som er mest sannsynlige for boligen din, tegnene du skal se etter, hva som forebygger hvert av dem, og hvilke som ærlig talt ikke er en jobb for eieren (noen er en telefon, ikke en lørdag).

Ordne det én gang, så kan påsken heller handle om den første lunsjen på terrassen.

{link}`,
    sv: `Varmt väder, en trädgård och långa perioder utan någon i huset. Var och en lockar till sig något olika i en spansk bostad, och de överlappar knappt.

Det är därför allmänna råd aldrig riktigt passar. Det som fungerar för en bottenvåningslägenhet med terrass är inte rådet för en villa med pinjer och pool, och inget av dem stämmer för ett ställe som står tomt från oktober till april.

De tomma månaderna är de som ägare utomlands brukar underskatta, och det är lätt att förstå varför. Ingenting störs, ingenting märks, och det första tecknet är det du ser när du kliver in till påsk. Då låg det användbara ögonblicket månader bakåt.

Jag byggde en gratis sida som ställer fem frågor och ger dig de skadedjur som är mest sannolika för din bostad, tecknen att leta efter, vad som förebygger vart och ett, och vilka som ärligt talat inte är ett jobb för ägaren (vissa är ett telefonsamtal, inte en lördag).

Ta hand om det en gång, så kan påsken handla om den första lunchen på terrassen i stället.

{link}`,
    da: `Varmt vejr, en have og lange perioder uden nogen i huset. Hver af dem tiltrækker noget forskelligt i en spansk bolig, og de overlapper næsten ikke.

Derfor passer generelle råd aldrig helt. Det, der virker for en stuelejlighed med terrasse, er ikke rådet til en villa med fyrretræer og pool, og ingen af delene passer til et sted, der står tomt fra oktober til april.

De tomme måneder er dem, ejere i udlandet tit undervurderer, og det er let at forstå hvorfor. Intet bliver forstyrret, intet bliver opdaget, og det første tegn er det, du ser, når du træder ind ad døren til påske. Til den tid lå det nyttige øjeblik flere måneder tilbage.

Jeg byggede en gratis side, der stiller fem spørgsmål og giver dig de skadedyr, der er mest sandsynlige for din bolig, de tegn, du skal holde øje med, hvad der forebygger hvert af dem, og hvilke der helt ærligt ikke er en opgave for ejeren (nogle kræver et opkald, ikke en lørdag).

Få det ordnet én gang, så kan påsken handle om den første frokost på terrassen i stedet.

{link}`,
    de: `Warmes Wetter, ein Garten und lange Zeiten, in denen niemand im Haus ist. Jedes davon zieht in einer spanischen Immobilie etwas anderes an, und das überschneidet sich kaum.

Deshalb passt allgemeiner Rat nie ganz. Was für eine Erdgeschosswohnung mit Terrasse funktioniert, ist nicht der Rat für eine Villa mit Pinien und Pool, und beides passt nicht für ein Haus, das von Oktober bis April leer steht.

Die leeren Monate unterschätzen Eigentümer im Ausland gern, und es ist leicht zu verstehen, warum. Nichts wird gestört, nichts wird bemerkt, und das erste Anzeichen ist das, das Sie sehen, wenn Sie zu Ostern hereinkommen. Dann war der richtige Moment schon Monate vorher.

Ich habe eine kostenlose Seite gebaut, die fünf Fragen stellt und Ihnen die wahrscheinlichsten Schädlinge für Ihre Immobilie nennt, die Anzeichen, auf die Sie achten sollten, was jeweils vorbeugt, und welche ehrlich gesagt keine Aufgabe für den Eigentümer sind (manche sind ein Anruf, kein Samstag).

Einmal erledigt, und zu Ostern geht es stattdessen um das erste Mittagessen auf der Terrasse.

{link}`,
    fr: `La chaleur, un jardin, et de longues périodes sans personne dans la maison. Chacun attire quelque chose de différent dans un bien espagnol, et ils se recoupent à peine.

C'est pourquoi les conseils généraux ne conviennent jamais tout à fait. Ce qui marche pour un rez-de-chaussée avec terrasse n'est pas le conseil pour une villa avec des pins et une piscine, et aucun des deux ne convient à un logement vide d'octobre à avril.

Les mois vides sont ceux que les propriétaires à l'étranger sous-estiment, et on comprend pourquoi. Rien n'est dérangé, rien n'est remarqué, et le premier signe est celui que vous voyez en entrant à Pâques. À ce stade, le moment utile remonte à des mois.

J'ai créé une page gratuite qui pose cinq questions et vous donne les nuisibles les plus probables pour votre bien, les signes à repérer, ce qui prévient chacun, et ceux qui, honnêtement, ne sont pas un travail de propriétaire (certains sont un coup de téléphone, pas un samedi).

Réglez-le une fois, et Pâques pourra plutôt être le moment du premier déjeuner sur la terrasse.

{link}`,
    nl: `Warm weer, een tuin, en lange periodes zonder iemand in huis. Elk daarvan trekt in een Spaanse woning iets anders aan, en ze overlappen nauwelijks.

Daarom past algemeen advies nooit helemaal. Wat werkt voor een benedenwoning met terras is niet het advies voor een villa met pijnbomen en een zwembad, en geen van beide klopt voor een huis dat van oktober tot april leegstaat.

Die lege maanden onderschatten eigenaren in het buitenland vaak, en dat is goed te begrijpen. Er wordt niets verstoord, niemand merkt iets op, en het eerste teken is wat u ziet als u met Pasen binnenloopt. Dan lag het nuttige moment al maanden terug.

Ik heb een gratis pagina gemaakt die vijf vragen stelt en u de plagen geeft die voor uw woning het waarschijnlijkst zijn, de signalen om op te letten, wat elk ervan voorkomt, en welke eerlijk gezegd geen klus voor de eigenaar zijn (sommige zijn een telefoontje, geen zaterdag).

Regel het één keer, dan kan Pasen weer draaien om de eerste lunch op het terras.

{link}`,
  },
},
{
  key: 'pre-2019-mortgage-costs',
  tool: 'mortgage-claim',
  kind: 'informative',
  rules: [],
  text: {
    en: `If your Spanish mortgage dates from somewhere between 2000 and 2019, dig the file out one evening and read the completion costs. Most people signed those pages without reading them, which is entirely understandable.

Three things come up again and again in loans from that period. Set up fees charged entirely to the borrower. Floor clauses that stopped the rate falling below a set level. And insurance sold alongside the loan.

Whether any of that applies to you depends on your deed and your conditions. Not on what happened to somebody else with the same lender, which is how a lot of these conversations start in groups like this.

I want to be straight about what a calculator can and can't do. It can estimate what was charged and what a claim of that type usually covers. It can't tell you whether a claim is still in time, because that depends on the type of claim and is contested. That part needs an abogado (a Spanish lawyer) with your deed in front of them.

What the free page I built is good for is finding out in two minutes whether the question is worth asking at all.

{link}`,
    no: `Er det spanske boliglånet ditt fra en gang mellom 2000 og 2019, så finn frem mappen en kveld og les gjennom kostnadene ved låneopptaket. De fleste skrev under på de sidene uten å lese dem, og det er helt forståelig.

Tre ting dukker opp igjen og igjen i lån fra den perioden. Etableringsgebyrer som ble lagt helt på låntakeren. Rentegulv som hindret renten i å falle under et visst nivå. Og forsikring som ble solgt sammen med lånet.

Om noe av dette gjelder deg, avhenger av skjøtet og vilkårene dine. Ikke av hva som skjedde med noen andre med samme långiver, som er slik mange av disse samtalene starter i grupper som denne.

Jeg vil være ærlig om hva en kalkulator kan og ikke kan gjøre. Den kan anslå hva som ble belastet, og hva et krav av den typen vanligvis dekker. Den kan ikke si om et krav fortsatt er innenfor fristen, for det avhenger av typen krav og er omstridt. Den delen krever en abogado (en spansk advokat) med skjøtet ditt foran seg.

Det den gratis siden jeg laget er god for, er å finne ut på to minutter om spørsmålet i det hele tatt er verdt å stille.

{link}`,
    sv: `Är ditt spanska bolån från någon gång mellan 2000 och 2019, leta fram pärmen en kväll och läs igenom kostnaderna vid tillträdet. De flesta skrev under de sidorna utan att läsa dem, vilket är helt förståeligt.

Tre saker återkommer gång på gång i lån från den perioden. Uppläggningsavgifter som lades helt på låntagaren. Räntegolv som hindrade räntan från att sjunka under en viss nivå. Och försäkringar som såldes tillsammans med lånet.

Om något av det gäller dig beror på din lånehandling och dina villkor. Inte på vad som hände någon annan med samma långivare, vilket är hur många av de här samtalen börjar i grupper som den här.

Jag vill vara ärlig om vad en räknare kan och inte kan göra. Den kan uppskatta vad som togs ut och vad ett anspråk av den typen brukar omfatta. Den kan inte säga om ett anspråk fortfarande ligger inom tiden, eftersom det beror på typen av anspråk och är omtvistat. Den delen behöver en abogado (en spansk advokat) med din handling framför sig.

Det den gratis sidan jag byggde är bra för är att på två minuter ta reda på om frågan alls är värd att ställa.

{link}`,
    da: `Er dit spanske boliglån fra et sted mellem 2000 og 2019, så find mappen frem en aften og læs omkostningerne ved oprettelsen. De fleste skrev under på de sider uden at læse dem, og det er helt forståeligt.

Tre ting går igen og igen i lån fra den periode. Etableringsgebyrer, som låntageren betalte fuldt ud. Rentegulve, der forhindrede renten i at falde under et bestemt niveau. Og forsikringer, der blev solgt sammen med lånet.

Om noget af det gælder for dig, afhænger af dit skøde og dine vilkår. Ikke af, hvad der skete for en anden med samme långiver, og det er ellers sådan, mange af de her samtaler begynder i grupper som denne.

Jeg vil gerne være ærlig om, hvad en beregner kan og ikke kan. Den kan give et skøn over, hvad du blev opkrævet, og hvad et krav af den type normalt dækker. Den kan ikke sige, om et krav stadig er rettidigt, for det afhænger af kravets type og er omstridt. Den del kræver en abogado (en spansk advokat), der sidder med dit skøde foran sig.

Det, den gratis side, jeg byggede, er god til, er at finde ud af på to minutter, om spørgsmålet overhovedet er værd at stille.

{link}`,
    de: `Wenn Ihre spanische Hypothek irgendwann zwischen 2000 und 2019 abgeschlossen wurde, holen Sie an einem Abend die Unterlagen heraus und lesen Sie die Abschlusskosten. Die meisten haben diese Seiten unterschrieben, ohne sie zu lesen, und das ist völlig verständlich.

Bei Darlehen aus dieser Zeit tauchen drei Dinge immer wieder auf. Bearbeitungsgebühren, die komplett dem Kreditnehmer berechnet wurden. Zinsuntergrenzen, die verhinderten, dass der Zins unter ein bestimmtes Niveau fiel. Und Versicherungen, die zusammen mit dem Darlehen verkauft wurden.

Ob davon etwas auf Sie zutrifft, hängt von Ihrer Urkunde und Ihren Bedingungen ab. Nicht davon, was jemand anderem mit demselben Kreditgeber passiert ist, und so beginnen viele dieser Gespräche in Gruppen wie dieser.

Ich will ehrlich sagen, was ein Rechner kann und was nicht. Er kann schätzen, was berechnet wurde und was ein Anspruch dieser Art üblicherweise abdeckt. Er kann Ihnen nicht sagen, ob ein Anspruch noch rechtzeitig ist, denn das hängt von der Art des Anspruchs ab und ist umstritten. Dafür braucht es einen abogado (einen spanischen Anwalt), der Ihre Urkunde vor sich hat.

Wofür die kostenlose Seite, die ich gebaut habe, gut ist: in zwei Minuten herauszufinden, ob sich die Frage überhaupt lohnt.

{link}`,
    fr: `Si votre prêt immobilier espagnol date de quelque part entre 2000 et 2019, ressortez le dossier un soir et lisez les frais de signature. La plupart des gens ont signé ces pages sans les lire, ce qui est parfaitement compréhensible.

Trois choses reviennent sans cesse dans les prêts de cette période. Des frais de dossier mis entièrement à la charge de l'emprunteur. Des clauses plancher qui empêchaient le taux de descendre sous un certain niveau. Et des assurances vendues avec le prêt.

Que tout cela vous concerne dépend de votre acte et de vos conditions. Pas de ce qui est arrivé à quelqu'un d'autre chez le même prêteur, et c'est pourtant ainsi que commencent beaucoup de ces conversations dans des groupes comme celui-ci.

Je veux être clair sur ce qu'un calculateur peut faire et ne peut pas faire. Il peut estimer ce qui a été facturé et ce qu'une réclamation de ce type couvre habituellement. Il ne peut pas vous dire si une réclamation est encore dans les délais, parce que cela dépend du type de réclamation et fait débat. Cette partie demande un abogado (un avocat espagnol) avec votre acte sous les yeux.

Ce à quoi sert la page gratuite que j'ai créée, c'est à savoir en deux minutes si la question mérite seulement d'être posée.

{link}`,
    nl: `Dateert uw Spaanse hypotheek van ergens tussen 2000 en 2019, haal dan op een avond het dossier tevoorschijn en lees de afsluitkosten. De meeste mensen tekenden die bladzijden zonder ze te lezen, en dat is volkomen begrijpelijk.

Drie dingen komen keer op keer terug bij leningen uit die periode. Afsluitkosten die volledig bij de kredietnemer werden gelegd. Bodemrenteclausules die verhinderden dat de rente onder een bepaald niveau zakte. En verzekeringen die samen met de lening werden verkocht.

Of daar iets van op u van toepassing is, hangt af van uw akte en uw voorwaarden. Niet van wat iemand anders bij dezelfde verstrekker overkwam, en zo beginnen veel van deze gesprekken in groepen als deze.

Ik wil eerlijk zijn over wat een rekenhulp wel en niet kan. Hij kan schatten wat er in rekening is gebracht en wat een claim van dat type doorgaans dekt. Hij kan niet zeggen of een claim nog op tijd is, want dat hangt af van het soort claim en daarover wordt gestreden. Dat deel vraagt om een abogado (een Spaanse advocaat) met uw akte voor zich.

Waar de gratis pagina die ik maakte goed voor is: in twee minuten uitvinden of de vraag überhaupt de moeite waard is.

{link}`,
  },
},
{
  key: 'bueno-rented-part-of-the-year',
  tool: BUENO_TOOL,
  kind: 'informative',
  rules: ['deadline.rental.last_quarterly', 'deadline.rental.from_2026', 'irnr.rental.deductibility'],
  text: {
    en: `I rented it out in the summer and it sat empty the rest of the year. Which tax return do I file?

Both kinds (yes, both). It's the same form 210, used two ways.

For the weeks it was rented, you declare the rent. For the weeks it was empty or you stayed there yourself, you declare a notional income worked out from the cadastral value, the figure on your IBI receipt.

If the rent came in between July and September, that return is due between 1 and 20 October. It's also the last quarterly one. Rent from 1 October onwards goes into a single yearly return, filed in the first 20 days of April 2027.

Expenses are the fiddly bit. If you live in the EU, Norway, Iceland or Liechtenstein, you can deduct costs like community fees, IBI and repairs for the rented weeks. Everyone else pays on the full rent.

At Bueno, we file both returns for owners who live abroad. The rental return has a fixed fee per owner, plus an hourly fee if there are expenses to go through. It helps to keep the receipts in one folder.

Then you can get back to enjoying the place.

{link}`,
    no: `Jeg leide den ut om sommeren, og resten av året sto den tom. Hvilken skattemelding skal jeg levere?

Begge typer (ja, begge). Det er det samme skjema 210, brukt på to måter.

For ukene den var utleid, oppgir du leieinntekten. For ukene den sto tom eller du bodde der selv, oppgir du en beregnet inntekt ut fra katastralverdien, tallet på IBI-kvitteringen din.

Kom leien inn mellom juli og september, skal den skattemeldingen leveres mellom 1. og 20. oktober. Det er også den siste kvartalsvise. Leie fra 1. oktober og utover går inn i én årlig skattemelding, som leveres de første 20 dagene i april 2027.

Utgiftene er den plundrete delen. Bor du i EU, Norge, Island eller Liechtenstein, kan du trekke fra kostnader som fellesutgifter, IBI og reparasjoner for de utleide ukene. Alle andre betaler skatt av hele leien.

Hos Bueno leverer vi begge skattemeldingene for eiere som bor i utlandet. Skattemeldingen for utleie har en fast pris per eier, pluss en timepris hvis det er utgifter som må gjennomgås. Det hjelper å samle kvitteringene i én mappe.

Så kan du gå tilbake til å nyte stedet.

{link}`,
    sv: `Jag hyrde ut den på sommaren och resten av året stod den tom. Vilken deklaration ska jag lämna in?

Båda sorterna (ja, båda). Det är samma blankett 210, använd på två sätt.

För veckorna den var uthyrd deklarerar du hyran. För veckorna den stod tom eller du bodde där själv deklarerar du en beräknad inkomst som räknas fram ur taxeringsvärdet, siffran på din IBI-avi.

Kom hyran in mellan juli och september ska den deklarationen lämnas in mellan 1 och 20 oktober. Det är också den sista kvartalsvisa. Hyra från 1 oktober och framåt går in i en enda årsdeklaration, som lämnas in under de första 20 dagarna i april 2027.

Kostnaderna är den pilliga biten. Bor du i EU, Norge, Island eller Liechtenstein kan du dra av kostnader som samfällighetsavgift, IBI och reparationer för de uthyrda veckorna. Alla andra betalar på hela hyran.

Hos Bueno lämnar vi in båda deklarationerna åt ägare som bor utomlands. Hyresdeklarationen har en fast avgift per ägare, plus en timavgift om det finns kostnader att gå igenom. Det underlättar att samla kvittona i en mapp.

Sedan kan du gå tillbaka till att njuta av stället.

{link}`,
    da: `Jeg lejede den ud om sommeren, og resten af året stod den tom. Hvilken selvangivelse skal jeg indsende?

Begge slags (ja, begge). Det er den samme formular 210, brugt på to måder.

For de uger, hvor den var lejet ud, angiver du lejeindtægten. For de uger, hvor den stod tom, eller du selv boede der, angiver du en beregnet indtægt, som regnes ud fra katasterværdien, altså det tal, der står på din IBI-kvittering.

Kom lejen ind mellem juli og september, skal den selvangivelse indsendes mellem 1. og 20. oktober. Det er også den sidste kvartalsvise. Leje fra 1. oktober og frem kommer med i én årlig selvangivelse, som indsendes i de første 20 dage af april 2027.

Udgifterne er den besværlige del. Bor du i EU, Norge, Island eller Liechtenstein, kan du trække udgifter som fællesudgifter, IBI og reparationer fra for de udlejede uger. Alle andre betaler af hele lejen.

Hos Bueno indsender vi begge selvangivelser for ejere, der bor i udlandet. Selvangivelsen for udlejning har et fast gebyr pr. ejer plus et timegebyr, hvis der er udgifter at gå igennem. Det hjælper at samle kvitteringerne i én mappe.

Så kan du vende tilbage til at nyde stedet.

{link}`,
    de: `Ich habe im Sommer vermietet, und den Rest des Jahres stand die Wohnung leer. Welche Steuererklärung gebe ich ab?

Beide Arten (ja, beide). Es ist dasselbe Formular 210, nur auf zwei Weisen genutzt.

Für die Wochen, in denen vermietet war, erklären Sie die Miete. Für die Wochen, in denen die Wohnung leer stand oder Sie selbst dort waren, erklären Sie ein fiktives Einkommen, das aus dem Katasterwert berechnet wird, der Zahl auf Ihrem IBI-Bescheid.

Kam die Miete zwischen Juli und September herein, ist diese Erklärung zwischen dem 1. und dem 20. Oktober fällig. Es ist auch die letzte vierteljährliche. Miete ab dem 1. Oktober geht in eine einzige Jahreserklärung, abzugeben in den ersten 20 Tagen des April 2027.

Knifflig sind die Ausgaben. Wenn Sie in der EU, in Norwegen, Island oder Liechtenstein leben, können Sie für die vermieteten Wochen Kosten wie Hausgeld, IBI und Reparaturen absetzen. Alle anderen zahlen auf die volle Miete.

Bei Bueno reichen wir beide Erklärungen für Eigentümer ein, die im Ausland leben. Für die Mieterklärung gibt es eine feste Gebühr pro Eigentümer, plus einen Stundensatz, wenn Ausgaben durchzugehen sind. Es hilft, die Belege in einem Ordner zu sammeln.

Und dann können Sie die Wohnung wieder einfach genießen.

{link}`,
    fr: `Je l'ai loué l'été et il est resté vide le reste de l'année. Quelle déclaration dois-je faire ?

Les deux (oui, les deux). C'est le même modèle 210, utilisé de deux façons.

Pour les semaines louées, vous déclarez les loyers. Pour les semaines où le logement était vide ou où vous l'occupiez vous-même, vous déclarez un revenu fictif calculé à partir de la valeur cadastrale, le chiffre inscrit sur votre avis d'IBI.

Si les loyers ont été perçus entre juillet et septembre, cette déclaration est à déposer entre le 1er et le 20 octobre. C'est aussi la dernière déclaration trimestrielle. Les loyers à partir du 1er octobre vont dans une seule déclaration annuelle, déposée dans les 20 premiers jours d'avril 2027.

Les frais, c'est la partie délicate. Si vous vivez dans l'UE, en Norvège, en Islande ou au Liechtenstein, vous pouvez déduire des frais comme les charges de copropriété, l'IBI et les réparations pour les semaines louées. Tous les autres paient sur la totalité du loyer.

Chez Bueno, nous déposons les deux déclarations pour les propriétaires qui vivent à l'étranger. La déclaration des loyers a un tarif fixe par propriétaire, plus un tarif horaire s'il y a des frais à examiner. Ça aide de garder les justificatifs dans un même dossier.

Ensuite, vous pouvez retourner profiter de l'endroit.

{link}`,
    nl: `Ik heb de woning in de zomer verhuurd en de rest van het jaar stond hij leeg. Welke aangifte moet ik doen?

Allebei (ja, allebei). Het is hetzelfde formulier 210, op twee manieren gebruikt.

Over de weken dat de woning verhuurd was, geeft u de huur aan. Over de weken dat hij leegstond of u er zelf verbleef, geeft u een fictief inkomen aan op basis van de kadastrale waarde, het bedrag op uw IBI-aanslag.

Kwam de huur binnen tussen juli en september, dan moet die aangifte tussen 1 en 20 oktober worden ingediend. Het is meteen ook de laatste kwartaalaangifte. Huur vanaf 1 oktober gaat in één jaaraangifte, in te dienen in de eerste 20 dagen van april 2027.

De kosten zijn het lastige stuk. Woont u in de EU, Noorwegen, IJsland of Liechtenstein, dan mag u kosten als de VvE-bijdrage, IBI en reparaties voor de verhuurde weken aftrekken. Alle anderen betalen over de volledige huur.

Bij Bueno dienen we beide aangiftes in voor eigenaren die in het buitenland wonen. Voor de huuraangifte geldt een vast tarief per eigenaar, plus een uurtarief als er kosten moeten worden doorgenomen. Het helpt als u de bonnetjes in één map bewaart.

Daarna kunt u weer gewoon van de woning genieten.

{link}`,
  },
},
{
  key: 'bueno-year-end-return',
  tool: BUENO_TOOL,
  kind: 'informative',
  rules: ['deadline.imputed.upto_2025', 'irnr.rates', 'irnr.imputed.base'],
  text: {
    en: `Nobody rented it last year. Do I still file?

Yes. If you own a home in Spain and live somewhere else, there's a return due for 2025 even if the place was never let for a single night. It's the non-resident return on form 210, and for 2025 it can be filed any time up to 31 December this year.

If you pay by direct debit, that closes a little earlier, on 23 December. It's an easy one to miss in the run-up to Christmas.

The return is worked out from the cadastral value on your IBI receipt, not from what the place would sell for. The rate is 19 percent for residents of the EU, Norway, Iceland and Liechtenstein, and 24 percent for everyone else.

At Bueno, we prepare and file it for you, starting from €50. The price depends on how many owners there are, because each owner files for their own share. What we need from you is short: the IBI receipt, your share of the property and where you're tax resident.

Then it's off the list, and December is yours again.

{link}`,
    no: `Ingen leide den i fjor. Må jeg likevel levere?

Ja. Eier du en bolig i Spania og bor et annet sted, skal det leveres en skattemelding for 2025, selv om boligen aldri har vært leid ut en eneste natt. Det er skattemeldingen for ikke-bosatte på skjema 210, og for 2025 kan den leveres når som helst frem til 31. desember i år.

Betaler du med direkte belastning, stenger det litt tidligere, 23. desember. Den er lett å glemme i innspurten mot jul.

Skattemeldingen beregnes ut fra katastralverdien på IBI-kvitteringen, ikke ut fra hva boligen kan selges for. Satsen er 19 prosent for bosatte i EU, Norge, Island og Liechtenstein, og 24 prosent for alle andre.

Hos Bueno forbereder og leverer vi den for deg, fra €50. Prisen avhenger av hvor mange eiere det er, fordi hver eier leverer for sin egen andel. Det vi trenger fra deg, er kort: IBI-kvitteringen, din andel av boligen og hvor du er skattemessig bosatt.

Så er det krysset av på listen, og desember er din igjen.

{link}`,
    sv: `Ingen hyrde den förra året. Ska jag ändå deklarera?

Ja. Äger du en bostad i Spanien och bor någon annanstans ska en deklaration för 2025 lämnas in, även om bostaden aldrig hyrts ut en enda natt. Det är deklarationen för icke-bosatta på blankett 210, och för 2025 kan den lämnas in när som helst fram till 31 december i år.

Betalar du via autogiro stänger det lite tidigare, den 23 december. Det är lätt att missa i veckorna före jul.

Deklarationen räknas fram ur taxeringsvärdet på din IBI-avi, inte ur vad bostaden skulle säljas för. Skattesatsen är 19 procent för den som bor i EU, Norge, Island eller Liechtenstein, och 24 procent för alla andra.

Hos Bueno förbereder och lämnar vi in den åt dig, från €50. Priset beror på hur många ägare det är, eftersom varje ägare deklarerar för sin egen andel. Det vi behöver från dig är kort: IBI-avin, din andel av bostaden och var du har din skattehemvist.

Sedan är den avbockad, och december är din igen.

{link}`,
    da: `Ingen lejede den sidste år. Skal jeg så stadig indsende?

Ja. Ejer du en bolig i Spanien og bor et andet sted, skal der indsendes en selvangivelse for 2025, også selvom stedet aldrig blev lejet ud en eneste nat. Det er selvangivelsen for ikke-residenter på formular 210, og for 2025 kan den indsendes når som helst frem til 31. december i år.

Betaler du via automatisk træk, lukker det lidt tidligere, den 23. december. Den er nem at overse i ugerne op til jul.

Selvangivelsen regnes ud fra katasterværdien på din IBI-kvittering, ikke ud fra hvad stedet kunne sælges for. Satsen er 19 procent for dem, der bor i EU, Norge, Island og Liechtenstein, og 24 procent for alle andre.

Hos Bueno udarbejder og indsender vi den for dig fra €50. Prisen afhænger af, hvor mange ejere der er, fordi hver ejer indsender for sin egen andel. Det, vi skal bruge fra dig, er kort: IBI-kvitteringen, din andel af boligen og hvor du er skattemæssigt hjemmehørende.

Så er den streget af listen, og december er din igen.

{link}`,
    de: `Letztes Jahr hat niemand gemietet. Muss ich trotzdem eine Erklärung abgeben?

Ja. Wenn Sie in Spanien ein Haus besitzen und woanders leben, ist für 2025 eine Erklärung fällig, auch wenn dort keine einzige Nacht vermietet wurde. Es ist die Erklärung für Nichtresidenten auf Formular 210, und für 2025 kann sie jederzeit bis zum 31. Dezember dieses Jahres eingereicht werden.

Wenn Sie per Lastschrift zahlen, schließt das etwas früher, am 23. Dezember. Das übersieht man leicht, wenn Weihnachten näher rückt.

Berechnet wird die Erklärung aus dem Katasterwert auf Ihrem IBI-Bescheid, nicht aus dem, was die Immobilie beim Verkauf bringen würde. Der Satz liegt bei 19 Prozent für Ansässige in der EU, in Norwegen, Island und Liechtenstein und bei 24 Prozent für alle anderen.

Bei Bueno bereiten wir sie für Sie vor und reichen sie ein, ab €50. Der Preis hängt davon ab, wie viele Eigentümer es gibt, weil jeder Eigentümer für seinen eigenen Anteil erklärt. Von Ihnen brauchen wir nur wenig: den IBI-Bescheid, Ihren Anteil an der Immobilie und wo Sie steuerlich ansässig sind.

Dann ist das erledigt, und der Dezember gehört wieder Ihnen.

{link}`,
    fr: `Personne ne l'a loué l'an dernier. Dois-je quand même faire une déclaration ?

Oui. Si vous possédez un logement en Espagne et vivez ailleurs, il y a une déclaration à faire pour 2025, même si le bien n'a jamais été loué une seule nuit. C'est la déclaration des non-résidents, sur le modèle 210, et pour 2025 elle peut être déposée à tout moment jusqu'au 31 décembre de cette année.

Si vous payez par prélèvement automatique, l'option se ferme un peu plus tôt, le 23 décembre. C'est un détail facile à oublier à l'approche de Noël.

La déclaration se calcule à partir de la valeur cadastrale indiquée sur votre avis d'IBI, pas du prix auquel le bien se vendrait. Le taux est de 19 pour cent pour les résidents de l'UE, de Norvège, d'Islande et du Liechtenstein, et de 24 pour cent pour tous les autres.

Chez Bueno, nous la préparons et la déposons pour vous, à partir de 50 €. Le prix dépend du nombre de propriétaires, parce que chacun déclare sa propre part. Ce qu'il nous faut de votre côté tient en peu de choses : l'avis d'IBI, votre part du bien et votre pays de résidence fiscale.

Ensuite, c'est rayé de la liste, et décembre vous appartient à nouveau.

{link}`,
    nl: `Niemand heeft de woning vorig jaar gehuurd. Moet ik dan nog steeds aangifte doen?

Ja. Heeft u een woning in Spanje en woont u ergens anders, dan moet er over 2025 een aangifte komen, ook als de woning geen enkele nacht verhuurd is geweest. Het gaat om de aangifte voor niet-residenten op formulier 210, en die over 2025 kunt u op elk moment tot en met 31 december van dit jaar indienen.

Betaalt u via automatische incasso, dan sluit dat iets eerder, op 23 december. In de drukte voor Kerst is dat makkelijk over het hoofd te zien.

De aangifte wordt berekend op basis van de kadastrale waarde op uw IBI-aanslag, niet op wat de woning bij verkoop zou opbrengen. Het tarief is 19 procent voor inwoners van de EU, Noorwegen, IJsland en Liechtenstein, en 24 procent voor alle anderen.

Bij Bueno bereiden we de aangifte voor en dienen we die voor u in, vanaf €50. De prijs hangt af van het aantal eigenaren, omdat iedere eigenaar aangifte doet voor zijn eigen aandeel. Wat we van u nodig hebben is kort: de IBI-aanslag, uw aandeel in de woning en het land waar u fiscaal inwoner bent.

Dan is het van uw lijstje, en is december weer van u.

{link}`,
  },
},
{
  key: 'bueno-ibi-is-not-this',
  tool: BUENO_TOOL,
  kind: 'story',
  rules: ['irnr.imputed.base'],
  text: {
    en: `"But I already pay my property tax in Spain."

That's nearly always IBI, and it's a different tax.

IBI is the local one. It goes to your town hall (ayuntamiento), and most owners have it on direct debit, so it feels like the tax side is covered.

The non-resident return is separate. It's national, it goes to the Spanish tax office on form 210, and nobody sends you a bill for it. You declare it yourself every year, even if the home sat empty and earned nothing.

Your IBI receipt does help, though. The return is worked out from the cadastral value printed on it, not from what you paid for the place or what it's worth today, and that value normally sits well below the market price. So keep the receipt somewhere you can find it.

At Bueno, we file this return for owners who live abroad. It starts from €50, and the price depends on how many owners there are. If you've only ever paid IBI, this is the page to read.

{link}`,
    no: `«Men jeg betaler jo allerede eiendomsskatten min i Spania.»

Det er nesten alltid IBI, og det er en annen skatt.

IBI er den lokale. Den går til kommunen (ayuntamiento), og de fleste eiere har den på direkte belastning, så det føles som om skattesiden er i orden.

Skattemeldingen for ikke-bosatte er noe annet. Den er nasjonal, den går til det spanske skattekontoret på skjema 210, og ingen sender deg en regning for den. Du oppgir den selv hvert år, selv om boligen sto tom og ikke ga noen inntekt.

IBI-kvitteringen din hjelper likevel. Skattemeldingen beregnes ut fra katastralverdien som står på den, ikke ut fra hva du betalte for boligen eller hva den er verdt i dag, og den verdien ligger normalt godt under markedsprisen. Så ta vare på kvitteringen et sted der du finner den igjen.

Hos Bueno leverer vi denne skattemeldingen for eiere som bor i utlandet. Det starter fra €50, og prisen avhenger av hvor mange eiere det er. Har du bare betalt IBI til nå, er dette siden å lese.

{link}`,
    sv: `”Men jag betalar ju redan min fastighetsskatt i Spanien.”

Det är nästan alltid IBI, och det är en annan skatt.

IBI är den lokala. Den går till kommunen (ayuntamiento), och de flesta ägare har den på autogiro, så det känns som om skattebiten är ordnad.

Deklarationen för icke-bosatta är något separat. Den är statlig, går till den spanska skattemyndigheten på blankett 210, och ingen skickar någon räkning för den. Du deklarerar den själv varje år, även om bostaden stod tom och inte gav något.

Din IBI-avi hjälper dock. Deklarationen räknas fram ur taxeringsvärdet som står på den, inte ur vad du betalade för bostaden eller vad den är värd i dag, och det värdet ligger normalt en bra bit under marknadspriset. Så spara avin där du hittar den.

Hos Bueno lämnar vi in den här deklarationen åt ägare som bor utomlands. Det kostar från €50, och priset beror på hur många ägare det är. Har du bara någonsin betalat IBI är det här sidan att läsa.

{link}`,
    da: `"Men jeg betaler jo allerede ejendomsskat i Spanien."

Det er næsten altid IBI, og det er en anden skat.

IBI er den lokale. Den går til din kommune (ayuntamiento), og de fleste ejere har den på automatisk træk, så det føles, som om skattesiden er i orden.

Selvangivelsen for ikke-residenter er noget for sig. Den er national, den går til det spanske skattevæsen på formular 210, og ingen sender dig en regning for den. Du angiver den selv hvert år, også selvom boligen stod tom og ikke gav nogen indtægt.

Din IBI-kvittering hjælper dog. Selvangivelsen regnes ud fra den katasterværdi, der står trykt på den, ikke ud fra hvad du gav for stedet, eller hvad det er værd i dag, og den værdi ligger normalt et godt stykke under markedsprisen. Så gem kvitteringen et sted, hvor du kan finde den.

Hos Bueno indsender vi denne selvangivelse for ejere, der bor i udlandet. Det starter fra €50, og prisen afhænger af, hvor mange ejere der er. Har du kun nogensinde betalt IBI, er det denne side, du skal læse.

{link}`,
    de: `„Aber ich zahle doch schon meine Immobiliensteuer in Spanien.“

Das ist fast immer die IBI, und das ist eine andere Steuer.

Die IBI ist die lokale. Sie geht an Ihr Rathaus (ayuntamiento), und die meisten Eigentümer zahlen sie per Lastschrift, deshalb fühlt es sich an, als sei die Steuerseite erledigt.

Die Erklärung für Nichtresidenten ist etwas anderes. Sie ist national, sie geht mit Formular 210 an das spanische Finanzamt, und niemand schickt Ihnen dafür eine Rechnung. Sie erklären sie selbst, jedes Jahr, auch wenn das Haus leer stand und nichts eingebracht hat.

Ihr IBI-Bescheid hilft trotzdem. Die Erklärung wird aus dem Katasterwert berechnet, der darauf steht, nicht aus dem Kaufpreis oder dem heutigen Wert, und dieser Wert liegt normalerweise deutlich unter dem Marktpreis. Bewahren Sie den Bescheid also so auf, dass Sie ihn wiederfinden.

Bei Bueno reichen wir diese Erklärung für Eigentümer ein, die im Ausland leben. Sie beginnt bei €50, und der Preis hängt davon ab, wie viele Eigentümer es gibt. Wenn Sie bisher nur die IBI gezahlt haben, ist das die Seite zum Lesen.

{link}`,
    fr: `« Mais je paie déjà ma taxe foncière en Espagne. »

Il s'agit presque toujours de l'IBI, et c'est un autre impôt.

L'IBI est l'impôt local. Il va à votre mairie (ayuntamiento), et la plupart des propriétaires le règlent par prélèvement automatique, d'où l'impression que le volet fiscal est couvert.

La déclaration des non-résidents, c'est autre chose. Elle est nationale, elle va à l'administration fiscale espagnole sur le modèle 210, et personne ne vous envoie de facture. C'est à vous de la faire chaque année, même si le logement est resté vide et n'a rien rapporté.

Votre avis d'IBI reste utile, cela dit. La déclaration se calcule à partir de la valeur cadastrale qui y figure, pas du prix d'achat ni de la valeur actuelle du bien, et cette valeur est normalement bien inférieure au prix du marché. Gardez donc l'avis là où vous pourrez le retrouver.

Chez Bueno, nous déposons cette déclaration pour les propriétaires qui vivent à l'étranger. Le tarif démarre à 50 €, et le prix dépend du nombre de propriétaires. Si vous n'avez jamais payé que l'IBI, c'est la page à lire.

{link}`,
    nl: `"Maar ik betaal mijn onroerendgoedbelasting in Spanje toch al."

Dat is bijna altijd de IBI, en dat is een andere belasting.

De IBI is de lokale belasting. Die gaat naar uw gemeente (ayuntamiento), en de meeste eigenaren betalen haar via automatische incasso, dus het voelt alsof de belastingkant geregeld is.

De aangifte voor niet-residenten staat daar los van. Die is nationaal, gaat op formulier 210 naar de Spaanse belastingdienst, en niemand stuurt u er een rekening voor. U geeft haar elk jaar zelf aan, ook als de woning leegstond en niets opbracht.

Uw IBI-aanslag helpt wel. De aangifte wordt berekend op basis van de kadastrale waarde die erop staat, niet op wat u voor de woning betaalde of wat die vandaag waard is, en die waarde ligt normaal gesproken ruim onder de marktprijs. Bewaar de aanslag dus ergens waar u hem terugvindt.

Bij Bueno dienen we deze aangifte in voor eigenaren die in het buitenland wonen. Dat kan vanaf €50, en de prijs hangt af van het aantal eigenaren. Heeft u altijd alleen IBI betaald, dan is dit de pagina om te lezen.

{link}`,
  },
},
{
  key: 'bueno-two-owners-two-returns',
  tool: BUENO_TOOL,
  kind: 'story',
  rules: ['irnr.imputed.base'],
  text: {
    en: `We own the place together, so that's one tax return, right?

It's two. For the non-resident return in Spain, each owner declares their own share of the property. If you and your partner own half each, that's two forms, each based on half of the cadastral value on the IBI receipt. Three siblings who inherited a flat means three.

It's easy to miss when you buy, because the IBI receipt still arrives as one bill. It's also why quotes for filing can look confusing. The work is per owner, so the price usually is too.

At Bueno, that's how we price it. Filing starts from €50, and what you pay depends on the number of owners. We prepare and file a form 210 for each of you.

If you've been filing one return for a jointly owned home, or none at all, it's worth putting straight. Then you can both get back to enjoying the place together.

{link}`,
    no: `Vi eier boligen sammen, så det blir én skattemelding, ikke sant?

Det blir to. I skattemeldingen for ikke-bosatte i Spania oppgir hver eier sin egen andel av boligen. Eier du og partneren din halvparten hver, blir det to skjemaer, hvert basert på halvparten av katastralverdien på IBI-kvitteringen. Tre søsken som har arvet en leilighet, betyr tre.

Det er lett å overse når man kjøper, fordi IBI-kvitteringen fortsatt kommer som én regning. Det er også derfor pristilbud på levering kan virke forvirrende. Arbeidet er per eier, så prisen er det som regel også.

Hos Bueno er det slik vi priser det. Levering starter fra €50, og hva du betaler, avhenger av antall eiere. Vi forbereder og leverer et skjema 210 for hver av dere.

Har dere levert én skattemelding for en bolig dere eier sammen, eller ingen i det hele tatt, er det verdt å rydde opp i. Så kan dere begge gå tilbake til å nyte stedet sammen.

{link}`,
    sv: `Vi äger stället tillsammans, så det blir väl en deklaration?

Det blir två. I deklarationen för icke-bosatta i Spanien deklarerar varje ägare sin egen andel av bostaden. Äger du och din partner hälften var blir det två blanketter, var och en baserad på halva taxeringsvärdet på IBI-avin. Tre syskon som ärvt en lägenhet betyder tre.

Det är lätt att missa när man köper, eftersom IBI-avin fortfarande kommer som en enda räkning. Det är också därför offerter för deklarationen kan se förvirrande ut. Arbetet görs per ägare, så priset gör oftast det också.

Hos Bueno är det så vi sätter priset. Deklarationen kostar från €50, och vad du betalar beror på antalet ägare. Vi förbereder och lämnar in en blankett 210 för var och en av er.

Har ni lämnat in en enda deklaration för en gemensamt ägd bostad, eller ingen alls, är det värt att rätta till. Sedan kan ni båda gå tillbaka till att njuta av stället tillsammans.

{link}`,
    da: `Vi ejer stedet sammen, så det er vel én selvangivelse?

Det er to. I selvangivelsen for ikke-residenter i Spanien angiver hver ejer sin egen andel af boligen. Ejer du og din partner halvdelen hver, er det to formularer, som hver bygger på halvdelen af katasterværdien på IBI-kvitteringen. Tre søskende, der har arvet en lejlighed, betyder tre.

Det er let at overse, når man køber, fordi IBI-kvitteringen stadig kommer som én regning. Det er også derfor, tilbud på indsendelse kan se forvirrende ud. Arbejdet er pr. ejer, så det er prisen som regel også.

Hos Bueno er det sådan, vi sætter prisen. Indsendelse starter fra €50, og hvad du betaler, afhænger af antallet af ejere. Vi udarbejder og indsender en formular 210 for hver af jer.

Har I indsendt én selvangivelse for en bolig, I ejer sammen, eller slet ingen, er det værd at få rettet op på. Så kan I begge vende tilbage til at nyde stedet sammen.

{link}`,
    de: `Die Wohnung gehört uns zusammen, also ist das eine Steuererklärung, oder?

Es sind zwei. Bei der Erklärung für Nichtresidenten in Spanien erklärt jeder Eigentümer seinen eigenen Anteil an der Immobilie. Gehört Ihnen und Ihrem Partner je die Hälfte, sind das zwei Formulare, jedes auf Basis der Hälfte des Katasterwerts auf dem IBI-Bescheid. Drei Geschwister, die eine Wohnung geerbt haben, bedeuten drei.

Beim Kauf übersieht man das leicht, weil der IBI-Bescheid weiterhin als eine Rechnung kommt. Deshalb wirken auch Angebote für die Abgabe oft verwirrend. Die Arbeit fällt pro Eigentümer an, also meist auch der Preis.

Bei Bueno rechnen wir genau so. Die Abgabe beginnt bei €50, und was Sie zahlen, hängt von der Zahl der Eigentümer ab. Wir bereiten für jeden von Ihnen ein Formular 210 vor und reichen es ein.

Wenn Sie für ein gemeinsames Haus bisher eine Erklärung abgegeben haben, oder gar keine, lohnt es sich, das in Ordnung zu bringen. Dann können Sie das Haus wieder gemeinsam genießen.

{link}`,
    fr: `Nous possédons le bien ensemble, donc cela fait une seule déclaration, non ?

Cela en fait deux. Pour la déclaration des non-résidents en Espagne, chaque propriétaire déclare sa propre part du bien. Si vous et votre conjoint en possédez chacun la moitié, cela fait deux formulaires, chacun basé sur la moitié de la valeur cadastrale indiquée sur l'avis d'IBI. Trois frères et sœurs qui ont hérité d'un appartement, cela en fait trois.

C'est facile à manquer à l'achat, parce que l'avis d'IBI arrive toujours sous la forme d'une seule facture. C'est aussi pour cela que les devis pour le dépôt peuvent sembler déroutants. Le travail se fait par propriétaire, donc le prix aussi, le plus souvent.

Chez Bueno, c'est ainsi que nous fixons nos tarifs. Le dépôt démarre à 50 €, et ce que vous payez dépend du nombre de propriétaires. Nous préparons et déposons un modèle 210 pour chacun de vous.

Si vous déposez une seule déclaration pour un bien détenu à deux, ou aucune, cela vaut la peine de remettre les choses en ordre. Ensuite, vous pourrez tous les deux retourner profiter de l'endroit, ensemble.

{link}`,
    nl: `De woning is van ons samen, dus dat is één belastingaangifte, toch?

Het zijn er twee. Bij de aangifte voor niet-residenten in Spanje geeft iedere eigenaar zijn eigen aandeel in de woning aan. Bezitten u en uw partner elk de helft, dan zijn dat twee formulieren, elk op basis van de helft van de kadastrale waarde op de IBI-aanslag. Hebben drie broers en zussen samen een appartement geërfd, dan zijn het er drie.

Bij de aankoop ziet u dat makkelijk over het hoofd, omdat de IBI-aanslag nog steeds als één rekening binnenkomt. Het is ook de reden dat offertes voor de aangifte verwarrend kunnen lijken. Het werk is per eigenaar, dus de prijs meestal ook.

Bij Bueno rekenen we precies zo. De aangifte kan vanaf €50, en wat u betaalt hangt af van het aantal eigenaren. Voor ieder van u bereiden we een formulier 210 voor en dienen we het in.

Heeft u voor een gezamenlijke woning steeds één aangifte ingediend, of helemaal geen, dan is het de moeite waard om dat recht te zetten. Daarna kunt u allebei weer samen van de woning genieten.

{link}`,
  },
},
{
  key: 'bueno-what-goes-into-it',
  tool: BUENO_TOOL,
  kind: 'informative',
  rules: ['irnr.imputed.base', 'irnr.imputed.rate_special_2023_2025', 'irnr.rates', 'irnr.imputed.no_deductions'],
  text: {
    en: `The Spanish non-resident return is shorter than it looks. For a home that wasn't rented out, four details make up the whole thing.

The cadastral value of the property. It's printed on your IBI receipt (look for valor catastral).

Whether that value was revised from 2012 onwards. If it was, the return for 2025 uses 1.1 percent of it as the taxable amount.

Your share of the property.

Where you're tax resident. The rate is 19 percent if that's the EU, Norway, Iceland or Liechtenstein, and 24 percent anywhere else.

That's it. No expenses come into it for a home that wasn't let.

At Bueno, we take those details once and file the form 210 for each owner. We keep last year's form too, so next year's return starts as a draft and not a blank page. Filing starts from €50.

One less thing on the list, and more time for the place itself.

{link}`,
    no: `Den spanske skattemeldingen for ikke-bosatte er kortere enn den ser ut. For en bolig som ikke ble leid ut, er det fire opplysninger som utgjør hele greia.

Katastralverdien til boligen. Den står trykt på IBI-kvitteringen din (se etter valor catastral).

Om verdien er revidert fra 2012 og utover. Er den det, bruker skattemeldingen for 2025 1,1 prosent av den som skattegrunnlag.

Din andel av boligen.

Hvor du er skattemessig bosatt. Satsen er 19 prosent hvis det er EU, Norge, Island eller Liechtenstein, og 24 prosent alle andre steder.

Det er alt. Ingen utgifter kommer inn for en bolig som ikke var utleid.

Hos Bueno tar vi imot disse opplysningene én gang og leverer skjema 210 for hver eier. Vi tar også vare på fjorårets skjema, så neste års skattemelding starter som et utkast og ikke som et blankt ark. Levering starter fra €50.

Én ting mindre på listen, og mer tid til selve stedet.

{link}`,
    sv: `Deklarationen för icke-bosatta i Spanien är kortare än den ser ut. För en bostad som inte hyrts ut består hela deklarationen av fyra uppgifter.

Bostadens taxeringsvärde. Det står på din IBI-avi (leta efter valor catastral).

Om värdet har reviderats från 2012 och framåt. Har det det, används 1,1 procent av det som beskattningsunderlag i deklarationen för 2025.

Din andel av bostaden.

Var du har din skattehemvist. Skattesatsen är 19 procent om det är EU, Norge, Island eller Liechtenstein, och 24 procent överallt annars.

Det är allt. Inga kostnader kommer in i bilden för en bostad som inte hyrts ut.

Hos Bueno tar vi emot de uppgifterna en gång och lämnar in blankett 210 för varje ägare. Vi sparar också förra årets blankett, så nästa års deklaration börjar som ett utkast och inte som ett tomt papper. Det kostar från €50.

En sak mindre på listan, och mer tid för själva stället.

{link}`,
    da: `Den spanske selvangivelse for ikke-residenter er kortere, end den ser ud. For en bolig, der ikke har været lejet ud, består det hele af fire oplysninger.

Boligens katasterværdi. Den står trykt på din IBI-kvittering (kig efter valor catastral).

Om den værdi er blevet revideret fra 2012 og frem. Er den det, bruger selvangivelsen for 2025 1,1 procent af den som skattegrundlag.

Din andel af boligen.

Hvor du er skattemæssigt hjemmehørende. Satsen er 19 procent, hvis det er EU, Norge, Island eller Liechtenstein, og 24 procent alle andre steder.

Det er det hele. Der indgår ingen udgifter for en bolig, som ikke har været lejet ud.

Hos Bueno får vi de oplysninger én gang og indsender formular 210 for hver ejer. Vi gemmer også sidste års formular, så næste års selvangivelse starter som en kladde og ikke som en blank side. Indsendelse starter fra €50.

Én ting mindre på listen og mere tid til selve stedet.

{link}`,
    de: `Die spanische Erklärung für Nichtresidenten ist kürzer, als sie aussieht. Für ein Haus, das nicht vermietet war, besteht sie aus vier Angaben.

Der Katasterwert der Immobilie. Er steht auf Ihrem IBI-Bescheid (suchen Sie nach valor catastral).

Ob dieser Wert ab 2012 revidiert wurde. Wenn ja, setzt die Erklärung für 2025 davon 1,1 Prozent als steuerpflichtigen Betrag an.

Ihr Anteil an der Immobilie.

Wo Sie steuerlich ansässig sind. Der Satz liegt bei 19 Prozent, wenn das die EU, Norwegen, Island oder Liechtenstein ist, und bei 24 Prozent überall sonst.

Das ist alles. Ausgaben spielen bei einem Haus, das nicht vermietet war, keine Rolle.

Bei Bueno nehmen wir diese Angaben einmal auf und reichen für jeden Eigentümer das Formular 210 ein. Wir bewahren auch das Formular vom Vorjahr auf, damit die Erklärung im nächsten Jahr als Entwurf beginnt und nicht als leeres Blatt. Die Abgabe beginnt bei €50.

Eine Sache weniger auf der Liste, und mehr Zeit für das Haus selbst.

{link}`,
    fr: `La déclaration espagnole des non-résidents est plus courte qu'elle n'en a l'air. Pour un logement qui n'a pas été loué, quatre informations suffisent.

La valeur cadastrale du bien. Elle figure sur votre avis d'IBI (cherchez valor catastral).

Si cette valeur a été révisée à partir de 2012. Si c'est le cas, la déclaration pour 2025 retient 1,1 pour cent de cette valeur comme base imposable.

Votre part du bien.

Votre pays de résidence fiscale. Le taux est de 19 pour cent s'il s'agit de l'UE, de la Norvège, de l'Islande ou du Liechtenstein, et de 24 pour cent partout ailleurs.

C'est tout. Aucun frais n'entre en compte pour un logement qui n'a pas été loué.

Chez Bueno, nous prenons ces informations une seule fois et déposons le modèle 210 pour chaque propriétaire. Nous conservons aussi le formulaire de l'année précédente, pour que la déclaration suivante démarre comme un brouillon et non comme une page blanche. Le dépôt démarre à 50 €.

Une chose de moins sur la liste, et plus de temps pour profiter du lieu.

{link}`,
    nl: `De Spaanse aangifte voor niet-residenten is korter dan ze lijkt. Voor een woning die niet verhuurd is, bestaat het hele verhaal uit vier gegevens.

De kadastrale waarde van de woning. Die staat op uw IBI-aanslag (zoek naar valor catastral).

Of die waarde vanaf 2012 is herzien. Is dat zo, dan gebruikt de aangifte over 2025 1,1 procent ervan als belastbaar bedrag.

Uw aandeel in de woning.

Het land waar u fiscaal inwoner bent. Het tarief is 19 procent als dat de EU, Noorwegen, IJsland of Liechtenstein is, en 24 procent overal elders.

Dat is alles. Bij een woning die niet verhuurd is, spelen kosten geen rol.

Bij Bueno nemen we die gegevens één keer op en dienen we voor iedere eigenaar het formulier 210 in. We bewaren ook het formulier van vorig jaar, zodat de aangifte van volgend jaar begint als concept en niet als lege pagina. De aangifte kan vanaf €50.

Eén ding minder op uw lijstje, en meer tijd voor de woning zelf.

{link}`,
  },
},
{
  key: 'bueno-direct-debit-date',
  tool: BUENO_TOOL,
  kind: 'informative',
  rules: ['deadline.imputed.upto_2025'],
  text: {
    en: `The 2025 non-resident return can be filed until 31 December. Paying it by direct debit can't.

If you want the tax office to collect the payment from your Spanish account, that option closes on 23 December, eight days earlier. After that you can still file. You just have to pay another way, and from abroad that is where owners tend to get stuck.

It's an easy one to miss. You file on the 28th, expect the payment to be collected like last year, and it isn't, because the direct debit window had already shut.

So the simple fix is not to leave it for the last week of the year (nobody wants to spend that week on Spanish tax anyway).

At Bueno, we file the non-resident return for owners who live outside Spain. You send us the details once and we take it from there. It starts from €50, and the price depends on the number of owners.

If 2025 is still open for you, you can get it started here, and December can go back to being about the people you spend it with.

{link}`,
    no: `Skattemeldingen for ikke-bosatte for 2025 kan leveres frem til 31. desember. Å betale den med direkte belastning kan ikke det.

Vil du at skattekontoret skal trekke betalingen fra den spanske kontoen din, stenger det alternativet 23. desember, åtte dager tidligere. Etter det kan du fortsatt levere. Du må bare betale på en annen måte, og fra utlandet er det der eiere ofte står fast.

Den er lett å overse. Du leverer den 28., regner med at betalingen trekkes som i fjor, og så skjer det ikke, fordi vinduet for direkte belastning allerede var stengt.

Den enkle løsningen er altså å ikke vente til årets siste uke (ingen har lyst til å bruke den uken på spansk skatt uansett).

Hos Bueno leverer vi skattemeldingen for ikke-bosatte for eiere som bor utenfor Spania. Du sender oss opplysningene én gang, så tar vi det derfra. Det starter fra €50, og prisen avhenger av antall eiere.

Er 2025 fortsatt åpent for deg, kan du komme i gang her, så kan desember igjen handle om menneskene du tilbringer den med.

{link}`,
    sv: `Deklarationen för icke-bosatta för 2025 kan lämnas in till 31 december. Att betala den via autogiro kan man inte.

Vill du att skattemyndigheten drar betalningen från ditt spanska konto stänger det alternativet den 23 december, åtta dagar tidigare. Efter det kan du fortfarande deklarera. Du måste bara betala på annat sätt, och från utlandet är det där ägare brukar fastna.

Det är lätt att missa. Du deklarerar den 28:e, räknar med att betalningen dras som förra året, och det gör den inte, eftersom autogirofönstret redan hade stängt.

Den enkla lösningen är alltså att inte lämna det till årets sista vecka (ingen vill ändå ägna den veckan åt spansk skatt).

Hos Bueno lämnar vi in deklarationen för icke-bosatta åt ägare som bor utanför Spanien. Du skickar uppgifterna till oss en gång och vi tar det därifrån. Det kostar från €50, och priset beror på antalet ägare.

Är 2025 fortfarande öppet för dig kan du komma igång här, och december kan återgå till att handla om människorna du firar med.

{link}`,
    da: `Selvangivelsen for ikke-residenter for 2025 kan indsendes frem til 31. december. Betaling via automatisk træk kan ikke.

Vil du have, at skattevæsenet trækker betalingen fra din spanske konto, lukker den mulighed den 23. december, otte dage tidligere. Derefter kan du stadig indsende. Du skal bare betale på en anden måde, og fra udlandet er det dér, ejere tit går i stå.

Den er nem at overse. Du indsender den 28., regner med, at betalingen bliver trukket som sidste år, og det bliver den ikke, fordi vinduet for automatisk træk allerede var lukket.

Så den enkle løsning er ikke at gemme det til årets sidste uge (ingen har lyst til at bruge den uge på spansk skat alligevel).

Hos Bueno indsender vi selvangivelsen for ikke-residenter for ejere, der bor uden for Spanien. Du sender os oplysningerne én gang, og så tager vi den derfra. Det starter fra €50, og prisen afhænger af antallet af ejere.

Står 2025 stadig åbent for dig, kan du sætte det i gang her, og så kan december igen handle om de mennesker, du bruger den sammen med.

{link}`,
    de: `Die Erklärung für Nichtresidenten 2025 kann bis zum 31. Dezember eingereicht werden. Die Zahlung per Lastschrift nicht.

Wenn das Finanzamt die Zahlung von Ihrem spanischen Konto einziehen soll, schließt diese Möglichkeit am 23. Dezember, acht Tage früher. Danach können Sie immer noch einreichen. Sie müssen nur anders zahlen, und genau dort bleiben Eigentümer im Ausland oft hängen.

Das übersieht man leicht. Sie reichen am 28. ein, erwarten, dass die Zahlung wie im letzten Jahr eingezogen wird, und das passiert nicht, weil das Lastschriftfenster schon zu war.

Die einfache Lösung ist also, es nicht in der letzten Woche des Jahres zu machen (diese Woche will ohnehin niemand mit spanischer Steuer verbringen).

Bei Bueno reichen wir die Erklärung für Nichtresidenten für Eigentümer ein, die außerhalb Spaniens leben. Sie schicken uns die Angaben einmal, und wir kümmern uns um den Rest. Es beginnt bei €50, und der Preis hängt von der Zahl der Eigentümer ab.

Wenn 2025 bei Ihnen noch offen ist, können Sie hier anfangen, und im Dezember geht es wieder um die Menschen, mit denen Sie ihn verbringen.

{link}`,
    fr: `La déclaration des non-résidents pour 2025 peut être déposée jusqu'au 31 décembre. Le paiement par prélèvement automatique, non.

Si vous voulez que l'administration fiscale prélève le paiement sur votre compte espagnol, cette option se ferme le 23 décembre, huit jours plus tôt. Après cette date, vous pouvez toujours déposer. Il faut simplement payer autrement, et depuis l'étranger, c'est là que les propriétaires ont tendance à rester bloqués.

C'est facile à rater. Vous déposez le 28, vous pensez que le paiement sera prélevé comme l'an dernier, et ce n'est pas le cas, parce que la période du prélèvement était déjà close.

La solution est donc simple : ne pas attendre la dernière semaine de l'année (personne n'a envie de la passer sur l'impôt espagnol, de toute façon).

Chez Bueno, nous déposons la déclaration des non-résidents pour les propriétaires qui vivent hors d'Espagne. Vous nous envoyez les informations une fois et nous nous occupons du reste. Le tarif démarre à 50 €, et le prix dépend du nombre de propriétaires.

Si 2025 n'est pas encore réglé pour vous, vous pouvez commencer ici, et décembre pourra redevenir le mois des gens avec qui vous le passez.

{link}`,
    nl: `De aangifte voor niet-residenten over 2025 kunt u tot en met 31 december indienen. Betalen via automatische incasso kan niet zo lang.

Wilt u dat de belastingdienst het bedrag van uw Spaanse rekening int, dan sluit die mogelijkheid op 23 december, acht dagen eerder. Daarna kunt u nog steeds indienen. U moet alleen op een andere manier betalen, en juist daar lopen eigenaren in het buitenland vaak vast.

Het is makkelijk over het hoofd te zien. U dient in op de 28e, gaat ervan uit dat het bedrag net als vorig jaar wordt afgeschreven, en dat gebeurt niet, omdat de termijn voor incasso al gesloten was.

De eenvoudige oplossing is dus om het niet te laten liggen tot de laatste week van het jaar (niemand wil die week toch aan Spaanse belasting besteden).

Bij Bueno dienen we de aangifte voor niet-residenten in voor eigenaren die buiten Spanje wonen. U stuurt ons de gegevens één keer en wij regelen de rest. Dat kan vanaf €50, en de prijs hangt af van het aantal eigenaren.

Staat 2025 bij u nog open, dan kunt u hier beginnen, en kan december weer draaien om de mensen met wie u het doorbrengt.

{link}`,
  },
},
{
  key: 'bueno-why-from-fifty',
  tool: BUENO_TOOL,
  kind: 'story',
  rules: [],
  text: {
    en: `Why does Bueno file the non-resident return from €50, when some owners have been quoted a few hundred for the same form? It's a fair question, so here's the honest answer.

The return doesn't change much from one year to the next. Same property, same owners, same cadastral value on the IBI receipt, unless the town hall revises it. Most of the cost of filing is somebody typing the same details in again every twelve months.

So at Bueno, we don't. We store last year's form and use it to fill in this year's as a draft. What's left is checking what changed, which is often very little.

The price depends on the number of owners, because each owner files for their own share. A home owned by one person is the simplest case. A couple is two returns (one each, even for the same house).

If your situation is more involved and you'd like a quote first, register and tell us. Otherwise the details are here, and the return becomes one less thing to think about on your next trip down:

{link}`,
    no: `Hvorfor leverer Bueno skattemeldingen for ikke-bosatte fra €50, når noen eiere har fått pristilbud på noen hundre for det samme skjemaet? Det er et rimelig spørsmål, så her er det ærlige svaret.

Skattemeldingen endrer seg ikke mye fra ett år til det neste. Samme bolig, samme eiere, samme katastralverdi på IBI-kvitteringen, med mindre kommunen reviderer den. Mesteparten av kostnaden ved å levere er at noen skriver inn de samme opplysningene på nytt hver tolvte måned.

Så hos Bueno gjør vi ikke det. Vi lagrer fjorårets skjema og bruker det til å fylle ut årets som et utkast. Det som gjenstår, er å sjekke hva som har endret seg, og det er ofte veldig lite.

Prisen avhenger av antall eiere, fordi hver eier leverer for sin egen andel. En bolig som eies av én person, er det enkleste tilfellet. Et par er to skattemeldinger (én hver, selv for samme hus).

Er situasjonen din mer sammensatt og du vil ha et pristilbud først, registrer deg og fortell oss. Ellers finner du detaljene her, og skattemeldingen blir én ting mindre å tenke på neste gang du reiser ned:

{link}`,
    sv: `Varför lämnar Bueno in deklarationen för icke-bosatta från €50, när en del ägare har fått offerter på några hundra för samma blankett? Det är en rimlig fråga, så här är det ärliga svaret.

Deklarationen ändras inte mycket från ett år till nästa. Samma bostad, samma ägare, samma taxeringsvärde på IBI-avin, om inte kommunen reviderar det. Det mesta av kostnaden för att deklarera är att någon skriver in samma uppgifter igen var tolfte månad.

Så hos Bueno gör vi inte det. Vi sparar förra årets blankett och använder den för att fylla i årets som ett utkast. Det som återstår är att kolla vad som har ändrats, vilket ofta är väldigt lite.

Priset beror på antalet ägare, eftersom varje ägare deklarerar för sin egen andel. En bostad som ägs av en person är det enklaste fallet. Ett par är två deklarationer (en var, även för samma hus).

Är din situation mer invecklad och du vill ha en offert först, registrera dig och berätta. Annars finns detaljerna här, och deklarationen blir en sak mindre att tänka på nästa gång du åker ner:

{link}`,
    da: `Hvorfor indsender Bueno selvangivelsen for ikke-residenter fra €50, når nogle ejere har fået tilbud på et par hundrede for den samme formular? Det er et rimeligt spørgsmål, så her er det ærlige svar.

Selvangivelsen ændrer sig ikke meget fra år til år. Samme bolig, samme ejere, samme katasterværdi på IBI-kvitteringen, medmindre kommunen reviderer den. Det meste af det, en indsendelse koster, er, at nogen taster de samme oplysninger ind igen hver tolvte måned.

Så det gør vi ikke hos Bueno. Vi gemmer sidste års formular og bruger den til at udfylde dette års som en kladde. Tilbage er at tjekke, hvad der har ændret sig, og det er ofte meget lidt.

Prisen afhænger af antallet af ejere, fordi hver ejer indsender for sin egen andel. En bolig med én ejer er det enkleste tilfælde. Et par er to selvangivelser (én hver, også for det samme hus).

Er din situation mere indviklet, og vil du gerne have et tilbud først, så registrer dig og fortæl os om den. Ellers står detaljerne her, og selvangivelsen bliver én ting mindre at tænke på, næste gang du tager derned:

{link}`,
    de: `Warum reicht Bueno die Erklärung für Nichtresidenten ab €50 ein, wenn manchen Eigentümern für dasselbe Formular ein paar hundert genannt wurden? Eine berechtigte Frage, also hier die ehrliche Antwort.

Die Erklärung ändert sich von Jahr zu Jahr kaum. Dieselbe Immobilie, dieselben Eigentümer, derselbe Katasterwert auf dem IBI-Bescheid, außer das Rathaus passt ihn an. Der Großteil der Kosten entsteht, weil jemand alle zwölf Monate dieselben Angaben neu eintippt.

Bei Bueno machen wir das nicht. Wir speichern das Formular vom Vorjahr und füllen damit das diesjährige als Entwurf aus. Übrig bleibt, zu prüfen, was sich geändert hat, und das ist oft sehr wenig.

Der Preis hängt von der Zahl der Eigentümer ab, weil jeder Eigentümer für seinen eigenen Anteil erklärt. Ein Haus mit einem Eigentümer ist der einfachste Fall. Ein Paar bedeutet zwei Erklärungen (je eine, auch für dasselbe Haus).

Wenn Ihre Situation komplizierter ist und Sie zuerst ein Angebot möchten, registrieren Sie sich und sagen Sie es uns. Ansonsten finden Sie die Details hier, und die Erklärung wird zu einer Sache weniger, an die Sie bei Ihrer nächsten Reise in den Süden denken müssen:

{link}`,
    fr: `Pourquoi Bueno dépose-t-il la déclaration des non-résidents à partir de 50 €, alors que certains propriétaires se sont vu proposer quelques centaines d'euros pour le même formulaire ? C'est une question légitime, alors voici la réponse honnête.

La déclaration change peu d'une année à l'autre. Même bien, mêmes propriétaires, même valeur cadastrale sur l'avis d'IBI, sauf si la mairie la révise. L'essentiel du coût du dépôt, c'est quelqu'un qui ressaisit les mêmes informations tous les douze mois.

Alors chez Bueno, nous ne le faisons pas. Nous conservons le formulaire de l'an dernier et nous nous en servons pour préremplir celui de cette année sous forme de brouillon. Il reste à vérifier ce qui a changé, ce qui est souvent très peu.

Le prix dépend du nombre de propriétaires, parce que chacun déclare sa propre part. Un logement détenu par une seule personne, c'est le cas le plus simple. Un couple, c'est deux déclarations (une chacun, même pour la même maison).

Si votre situation est plus complexe et que vous préférez d'abord un devis, inscrivez-vous et dites-le-nous. Sinon, les détails sont ici, et la déclaration devient une chose de moins à penser lors de votre prochain séjour là-bas :

{link}`,
    nl: `Waarom dient Bueno de aangifte voor niet-residenten in vanaf €50, terwijl sommige eigenaren voor hetzelfde formulier een offerte van een paar honderd euro kregen? Dat is een terechte vraag, dus hier is het eerlijke antwoord.

De aangifte verandert van jaar tot jaar weinig. Dezelfde woning, dezelfde eigenaren, dezelfde kadastrale waarde op de IBI-aanslag, tenzij de gemeente die herziet. Het grootste deel van de kosten zit in iemand die elke twaalf maanden dezelfde gegevens opnieuw intypt.

Dus doen we dat bij Bueno niet. We bewaren het formulier van vorig jaar en gebruiken het om dat van dit jaar als concept in te vullen. Wat overblijft is nakijken wat er veranderd is, en dat is vaak heel weinig.

De prijs hangt af van het aantal eigenaren, omdat iedere eigenaar aangifte doet voor zijn eigen aandeel. Een woning van één persoon is het eenvoudigste geval. Een stel betekent twee aangiftes (één per persoon, ook voor hetzelfde huis).

Is uw situatie ingewikkelder en wilt u eerst een offerte, registreer u dan en laat het ons weten. Anders staan de details hier, en wordt de aangifte één ding minder om aan te denken bij uw volgende reis naar het zuiden:

{link}`,
  },
},
{
  key: 'bueno-included-in-select',
  tool: BUENO_TOOL,
  kind: 'informative',
  rules: ['deadline.imputed.upto_2025'],
  text: {
    en: `If you're already with Bueno, check which plan you're on before you pay anyone to file your 2025 return.

On Select, the annual non-resident tax return is included, for up to two owners and two properties. You don't book it separately or look for someone new each year. Select is €199 a year.

If you rent the home out as well, Premium at €299 a year includes the rental tax return too, again for up to two owners.

On Standard, or not with Bueno at all, you can still have the return filed on its own. That starts from €50 and depends on the number of owners.

Why mention it now? The return for 2025 can be filed until 31 December, and October is a far nicer month to deal with it than the last week of the year (by then you'd rather be thinking about anything else).

At Bueno, we'd rather you spent December at the table than on a tax form. Everything about the tax service is on this page:

{link}`,
    no: `Er du allerede hos Bueno, sjekk hvilken plan du har før du betaler noen for å levere skattemeldingen for 2025.

Med Select er den årlige skattemeldingen for ikke-bosatte inkludert, for opptil to eiere og to boliger. Du trenger ikke bestille den separat eller lete etter noen nye hvert år. Select koster €199 i året.

Leier du også ut boligen, inkluderer Premium til €299 i året også skattemeldingen for utleie, igjen for opptil to eiere.

Med Standard, eller uten Bueno i det hele tatt, kan du fortsatt få skattemeldingen levert for seg. Det starter fra €50 og avhenger av antall eiere.

Hvorfor nevne det nå? Skattemeldingen for 2025 kan leveres frem til 31. desember, og oktober er en langt hyggeligere måned å ta seg av den på enn årets siste uke (da vil du heller tenke på hva som helst annet).

Hos Bueno vil vi heller at du tilbringer desember rundt bordet enn med et skatteskjema. Alt om skattetjenesten finner du på denne siden:

{link}`,
    sv: `Är du redan kund hos Bueno, kolla vilket abonnemang du har innan du betalar någon för att lämna in din deklaration för 2025.

Med Select ingår den årliga deklarationen för icke-bosatta, för upp till två ägare och två bostäder. Du bokar den inte separat och letar inte upp någon ny varje år. Select kostar €199 per år.

Hyr du dessutom ut bostaden ingår även hyresdeklarationen i Premium för €299 per år, också där för upp till två ägare.

Har du Standard, eller är du inte kund hos Bueno alls, kan du ändå få deklarationen gjord separat. Det kostar från €50 och beror på antalet ägare.

Varför ta upp det nu? Deklarationen för 2025 kan lämnas in till 31 december, och oktober är en mycket trevligare månad att ta tag i den än årets sista vecka (då vill man hellre tänka på precis vad som helst annat).

Hos Bueno vill vi hellre att du tillbringar december vid bordet än med en skatteblankett. Allt om skattetjänsten finns på den här sidan:

{link}`,
    da: `Er du allerede hos Bueno, så tjek, hvilken plan du har, før du betaler nogen for at indsende din selvangivelse for 2025.

Med Select er den årlige selvangivelse for ikke-residenter inkluderet, for op til to ejere og to boliger. Du skal ikke bestille den separat eller finde en ny hvert år. Select koster €199 om året.

Lejer du også boligen ud, inkluderer Premium til €299 om året også selvangivelsen for udlejning, igen for op til to ejere.

Har du Standard, eller er du slet ikke hos Bueno, kan du stadig få selvangivelsen indsendt for sig. Det starter fra €50 og afhænger af antallet af ejere.

Hvorfor nævne det nu? Selvangivelsen for 2025 kan indsendes frem til 31. december, og oktober er en langt rarere måned at ordne det i end årets sidste uge (til den tid vil man hellere tænke på alt muligt andet).

Hos Bueno vil vi hellere have, at du bruger december ved bordet end på en skatteformular. Alt om skatteservicen står på denne side:

{link}`,
    de: `Wenn Sie schon bei Bueno sind, prüfen Sie, welchen Tarif Sie haben, bevor Sie jemanden für Ihre Erklärung 2025 bezahlen.

Bei Select ist die jährliche Steuererklärung für Nichtresidenten enthalten, für bis zu zwei Eigentümer und zwei Immobilien. Sie buchen sie nicht separat und suchen nicht jedes Jahr jemand Neues. Select kostet €199 im Jahr.

Wenn Sie das Haus auch vermieten, ist bei Premium für €299 im Jahr zusätzlich die Mietsteuererklärung enthalten, ebenfalls für bis zu zwei Eigentümer.

Bei Standard, oder wenn Sie gar nicht bei Bueno sind, können Sie die Erklärung trotzdem einzeln einreichen lassen. Das beginnt bei €50 und hängt von der Zahl der Eigentümer ab.

Warum das jetzt? Die Erklärung für 2025 kann bis zum 31. Dezember eingereicht werden, und der Oktober ist ein viel angenehmerer Monat dafür als die letzte Woche des Jahres (dann denkt man lieber an alles andere).

Bei Bueno sehen wir Sie im Dezember lieber am Tisch als über einem Steuerformular. Alles zum Steuerservice steht auf dieser Seite:

{link}`,
    fr: `Si vous êtes déjà chez Bueno, vérifiez votre formule avant de payer qui que ce soit pour déposer votre déclaration 2025.

Avec Select, la déclaration annuelle des non-résidents est incluse, pour deux propriétaires et deux biens au maximum. Vous n'avez pas à la réserver à part ni à chercher quelqu'un de nouveau chaque année. Select coûte 199 € par an.

Si vous louez aussi le logement, Premium à 299 € par an inclut en plus la déclaration des revenus locatifs, là encore pour deux propriétaires au maximum.

Avec Standard, ou si vous n'êtes pas chez Bueno, vous pouvez toujours faire déposer la déclaration seule. Le tarif démarre à 50 € et dépend du nombre de propriétaires.

Pourquoi en parler maintenant ? La déclaration 2025 peut être déposée jusqu'au 31 décembre, et octobre est un mois bien plus agréable pour s'en occuper que la dernière semaine de l'année (à ce moment-là, on préfère penser à tout autre chose).

Chez Bueno, nous préférons que vous passiez décembre à table plutôt que sur un formulaire fiscal. Tout sur le service fiscal se trouve sur cette page :

{link}`,
    nl: `Bent u al klant bij Bueno, kijk dan welk abonnement u heeft voordat u iemand betaalt om uw aangifte over 2025 in te dienen.

Bij Select is de jaarlijkse aangifte voor niet-residenten inbegrepen, voor maximaal twee eigenaren en twee woningen. U hoeft die niet apart te boeken of elk jaar iemand nieuw te zoeken. Select kost €199 per jaar.

Verhuurt u de woning ook, dan is bij Premium voor €299 per jaar ook de aangifte voor huurinkomsten inbegrepen, opnieuw voor maximaal twee eigenaren.

Heeft u Standard, of bent u helemaal geen klant van Bueno, dan kunt u de aangifte nog steeds los laten indienen. Dat kan vanaf €50 en hangt af van het aantal eigenaren.

Waarom we dit nu noemen? De aangifte over 2025 kan tot en met 31 december worden ingediend, en oktober is een veel prettigere maand om het te regelen dan de laatste week van het jaar (dan denkt u liever aan iets heel anders).

Bij Bueno zien we u in december liever aan tafel zitten dan achter een belastingformulier. Alles over de belastingservice staat op deze pagina:

{link}`,
  },
},
{
  key: 'bueno-never-filed',
  tool: BUENO_TOOL,
  kind: 'informative',
  rules: ['late.recargo.voluntary', 'late.recargo.excludes_penalty'],
  text: {
    en: `I've owned a place in Spain for years and never filed the non-resident return. What happens now?

Well, it can be put right. Usually nobody told the owner the return existed in the first place.

You can file late on your own initiative. If you do it before the tax office asks, there's a surcharge on the tax due: 1 percent, plus 1 percent for each full month of delay, for the first twelve months. After that it's a flat 15 percent plus interest. That surcharge takes the place of a penalty.

So a year that's a few months late adds a few percent to the tax for that year.

The harder part is doing it from abroad, in Spanish, with one form per owner for each year (for a couple with several years open, that is a stack of forms).

At Bueno, we file the non-resident return for owners who live outside Spain. If you have earlier years open, register, tell us which ones, and we'll come back to you with a quote. Once they're done, the house is just the house again.

{link}`,
    no: `Jeg har eid en bolig i Spania i mange år og aldri levert skattemeldingen for ikke-bosatte. Hva skjer nå?

Vel, det kan rettes opp. Som regel var det ingen som fortalte eieren at skattemeldingen fantes i det hele tatt.

Du kan levere for sent på eget initiativ. Gjør du det før skattekontoret spør, kommer det et tillegg på skatten: 1 prosent, pluss 1 prosent for hver hele måned forsinkelse, de første tolv månedene. Etter det er det flate 15 prosent pluss renter. Det tillegget kommer i stedet for en bot.

Et år som er noen måneder forsinket, legger altså noen prosent til skatten for det året.

Det vanskelige er å gjøre det fra utlandet, på spansk, med ett skjema per eier for hvert år (for et par med flere åpne år blir det en hel bunke skjemaer).

Hos Bueno leverer vi skattemeldingen for ikke-bosatte for eiere som bor utenfor Spania. Har du tidligere år som står åpne, registrer deg, fortell oss hvilke, så kommer vi tilbake til deg med et pristilbud. Når de er ordnet, er huset bare huset igjen.

{link}`,
    sv: `Jag har ägt ett ställe i Spanien i flera år och aldrig lämnat in deklarationen för icke-bosatta. Vad händer nu?

Tja, det går att rätta till. Oftast har ingen berättat för ägaren att deklarationen fanns från början.

Du kan deklarera sent på eget initiativ. Gör du det innan skattemyndigheten frågar blir det ett tillägg på skatten: 1 procent, plus 1 procent för varje hel månads försening, under de första tolv månaderna. Därefter är det fast 15 procent plus ränta. Tillägget ersätter en sanktionsavgift.

Ett år som är några månader sent lägger alltså till några procent på skatten för det året.

Det svårare är att göra det från utlandet, på spanska, med en blankett per ägare och år (för ett par med flera öppna år blir det en hel bunt blanketter).

Hos Bueno lämnar vi in deklarationen för icke-bosatta åt ägare som bor utanför Spanien. Har du tidigare år öppna, registrera dig, berätta vilka och så återkommer vi med en offert. När de är klara är huset bara huset igen.

{link}`,
    da: `Jeg har ejet et sted i Spanien i årevis og har aldrig indsendt selvangivelsen for ikke-residenter. Hvad sker der nu?

Tja, det kan rettes op. Som regel har ingen fortalt ejeren, at selvangivelsen overhovedet fandtes.

Du kan indsende for sent på eget initiativ. Gør du det, før skattevæsenet spørger, er der et tillæg til den skyldige skat: 1 procent plus 1 procent for hver hele måneds forsinkelse, i de første tolv måneder. Derefter er det faste 15 procent plus renter. Tillægget træder i stedet for en bøde.

Så et år, der er nogle måneder forsinket, lægger nogle få procent oven i skatten for det år.

Det svære er at gøre det fra udlandet, på spansk, med én formular pr. ejer for hvert år (for et par med flere åbne år bliver det en hel stak formularer).

Hos Bueno indsender vi selvangivelsen for ikke-residenter for ejere, der bor uden for Spanien. Har du tidligere år, der står åbne, så registrer dig, fortæl os hvilke, og så vender vi tilbage med et tilbud. Når de er på plads, er huset bare huset igen.

{link}`,
    de: `Ich besitze seit Jahren ein Haus in Spanien und habe die Erklärung für Nichtresidenten nie abgegeben. Was passiert jetzt?

Nun, es lässt sich in Ordnung bringen. Meist hat dem Eigentümer schlicht niemand gesagt, dass es diese Erklärung überhaupt gibt.

Sie können von sich aus verspätet abgeben. Tun Sie das, bevor das Finanzamt fragt, gibt es einen Zuschlag auf die fällige Steuer: 1 Prozent, plus 1 Prozent für jeden vollen Monat Verspätung, in den ersten zwölf Monaten. Danach sind es pauschal 15 Prozent plus Zinsen. Dieser Zuschlag tritt an die Stelle einer Sanktion.

Ein Jahr, das ein paar Monate zu spät ist, erhöht die Steuer für dieses Jahr also um ein paar Prozent.

Schwieriger ist es, das vom Ausland aus zu erledigen, auf Spanisch, mit einem Formular pro Eigentümer und Jahr (für ein Paar mit mehreren offenen Jahren ist das ein ganzer Stapel).

Bei Bueno reichen wir die Erklärung für Nichtresidenten für Eigentümer ein, die außerhalb Spaniens leben. Wenn frühere Jahre offen sind, registrieren Sie sich, sagen Sie uns, welche, und wir melden uns mit einem Angebot. Sind sie erledigt, ist das Haus wieder einfach nur das Haus.

{link}`,
    fr: `Je possède un bien en Espagne depuis des années et je n'ai jamais déposé la déclaration des non-résidents. Que se passe-t-il maintenant ?

Eh bien, cela peut se régulariser. En général, personne n'avait dit au propriétaire que cette déclaration existait.

Vous pouvez déposer en retard de votre propre initiative. Si vous le faites avant que l'administration fiscale ne vous le demande, une majoration s'applique sur l'impôt dû : 1 pour cent, plus 1 pour cent par mois complet de retard, pendant les douze premiers mois. Au-delà, c'est 15 pour cent forfaitaires plus les intérêts. Cette majoration remplace la sanction.

Une année en retard de quelques mois ajoute donc quelques pour cent à l'impôt de cette année-là.

Le plus difficile, c'est de le faire depuis l'étranger, en espagnol, avec un formulaire par propriétaire et par année (pour un couple avec plusieurs années en suspens, cela fait une pile de formulaires).

Chez Bueno, nous déposons la déclaration des non-résidents pour les propriétaires qui vivent hors d'Espagne. Si vous avez des années antérieures en suspens, inscrivez-vous, dites-nous lesquelles, et nous reviendrons vers vous avec un devis. Une fois qu'elles sont réglées, la maison redevient simplement la maison.

{link}`,
    nl: `Ik heb al jaren een woning in Spanje en heb nog nooit de aangifte voor niet-residenten ingediend. Wat nu?

Nou, het is recht te zetten. Meestal heeft niemand de eigenaar ooit verteld dat de aangifte bestond.

U kunt op eigen initiatief te laat indienen. Doet u dat voordat de belastingdienst erom vraagt, dan geldt een toeslag op de verschuldigde belasting: 1 procent, plus 1 procent voor elke volle maand vertraging, gedurende de eerste twaalf maanden. Daarna is het een vaste 15 procent plus rente. Die toeslag komt in de plaats van een boete.

Een jaar dat een paar maanden te laat is, voegt dus een paar procent toe aan de belasting over dat jaar.

Het lastigere deel is om het vanuit het buitenland te doen, in het Spaans, met één formulier per eigenaar voor elk jaar (voor een stel met meerdere open jaren is dat een flinke stapel formulieren).

Bij Bueno dienen we de aangifte voor niet-residenten in voor eigenaren die buiten Spanje wonen. Heeft u eerdere jaren openstaan, registreer u dan, laat ons weten welke, en we komen bij u terug met een offerte. Zodra die klaar zijn, is het huis gewoon weer het huis.

{link}`,
  },
},
{
  key: 'bueno-form-changes-2027',
  tool: BUENO_TOOL,
  kind: 'informative',
  rules: ['deadline.210.new_fields_2027', 'deadline.imputed.from_2026'],
  text: {
    en: `For those of you who file your own non-resident return: form 210 changes on 1 January 2027.

It gets new annexes and fields. Among them are the days the property was available and your ownership percentage. They apply to every return submitted from that date, whichever year it's for.

The filing window is moving as well. The return for 2026 opens on 1 April 2027, not in January, and runs to 31 December.

None of this is dramatic. It changes what you type in and when, which is exactly the kind of thing that turns a ten minute job into a whole evening.

At Bueno, we keep up with these changes so owners don't have to. We file form 210 for people who live outside Spain, starting from €50, and we keep your details from one year to the next.

If you'd rather hand it over before the form changes, this is the place:

{link}`,
    no: `Til dere som leverer skattemeldingen for ikke-bosatte selv: skjema 210 endres 1. januar 2027.

Det får nye vedlegg og felt. Blant dem er dagene boligen var tilgjengelig, og eierandelen din. De gjelder alle skattemeldinger som sendes inn fra den datoen, uansett hvilket år de gjelder.

Leveringsvinduet flytter seg også. Skattemeldingen for 2026 åpner 1. april 2027, ikke i januar, og løper til 31. desember.

Ingenting av dette er dramatisk. Det endrer hva du skriver inn og når, og det er nettopp den typen ting som gjør en jobb på ti minutter til en hel kveld.

Hos Bueno holder vi oss oppdatert på disse endringene, så eierne slipper. Vi leverer skjema 210 for folk som bor utenfor Spania, fra €50, og vi tar vare på opplysningene dine fra ett år til det neste.

Vil du heller overlate det til oss før skjemaet endres, er dette stedet:

{link}`,
    sv: `Till dig som lämnar in deklarationen för icke-bosatta själv: blankett 210 ändras den 1 januari 2027.

Den får nya bilagor och fält. Bland dem finns antalet dagar bostaden var tillgänglig och din ägarandel i procent. De gäller för varje deklaration som lämnas in från det datumet, oavsett vilket år den avser.

Deklarationsperioden flyttar också. Deklarationen för 2026 öppnar den 1 april 2027, inte i januari, och pågår till 31 december.

Inget av det här är dramatiskt. Det ändrar vad du skriver in och när, vilket är precis den sortens sak som gör ett tiominutersjobb till en hel kväll.

Hos Bueno håller vi koll på de här ändringarna så att ägarna slipper. Vi lämnar in blankett 210 åt dem som bor utanför Spanien, från €50, och vi sparar dina uppgifter från ett år till nästa.

Vill du hellre lämna över det innan blanketten ändras är det här stället:

{link}`,
    da: `Til dig, der selv indsender din selvangivelse for ikke-residenter: formular 210 ændres den 1. januar 2027.

Den får nye bilag og felter. Blandt dem er de dage, boligen har været til rådighed, og din ejerandel i procent. De gælder for alle selvangivelser, der indsendes fra den dato, uanset hvilket år de vedrører.

Indsendelsesperioden flytter sig også. Selvangivelsen for 2026 åbner den 1. april 2027, ikke i januar, og løber til 31. december.

Intet af det er dramatisk. Det ændrer, hvad du skal taste ind og hvornår, og det er præcis den slags, der gør en opgave på ti minutter til en hel aften.

Hos Bueno følger vi med i de ændringer, så ejerne ikke behøver det. Vi indsender formular 210 for folk, der bor uden for Spanien, fra €50, og vi gemmer dine oplysninger fra det ene år til det næste.

Vil du hellere give det fra dig, før formularen ændrer sig, så er det her:

{link}`,
    de: `Für alle, die ihre Erklärung für Nichtresidenten selbst einreichen: Formular 210 ändert sich am 1. Januar 2027.

Es bekommt neue Anlagen und Felder. Dazu gehören die Tage, an denen die Immobilie verfügbar war, und Ihr Eigentumsanteil in Prozent. Sie gelten für jede Erklärung, die ab diesem Datum eingereicht wird, egal für welches Jahr.

Auch das Abgabefenster verschiebt sich. Die Erklärung für 2026 öffnet am 1. April 2027, nicht im Januar, und läuft bis zum 31. Dezember.

Nichts davon ist dramatisch. Es ändert, was Sie eintippen und wann, und genau so etwas macht aus einer Arbeit von zehn Minuten einen ganzen Abend.

Bei Bueno behalten wir diese Änderungen im Blick, damit Eigentümer es nicht müssen. Wir reichen Formular 210 für Menschen ein, die außerhalb Spaniens leben, ab €50, und wir bewahren Ihre Angaben von einem Jahr zum nächsten auf.

Wenn Sie es lieber abgeben möchten, bevor sich das Formular ändert, ist das der richtige Ort:

{link}`,
    fr: `Pour ceux d'entre vous qui déposent eux-mêmes leur déclaration de non-résident : le modèle 210 change le 1er janvier 2027.

Il reçoit de nouvelles annexes et de nouveaux champs. Parmi eux, les jours où le bien était disponible et votre pourcentage de propriété. Ils s'appliquent à toute déclaration déposée à partir de cette date, quelle que soit l'année concernée.

La période de dépôt change aussi. La déclaration pour 2026 ouvre le 1er avril 2027, et non en janvier, et court jusqu'au 31 décembre.

Rien de tout cela n'est dramatique. Cela change ce que vous saisissez et quand, ce qui est exactement le genre de chose qui transforme un travail de dix minutes en une soirée entière.

Chez Bueno, nous suivons ces changements pour que les propriétaires n'aient pas à le faire. Nous déposons le modèle 210 pour les personnes qui vivent hors d'Espagne, à partir de 50 €, et nous conservons vos informations d'une année à l'autre.

Si vous préférez nous le confier avant que le formulaire ne change, c'est ici :

{link}`,
    nl: `Voor wie zelf de aangifte voor niet-residenten indient: formulier 210 verandert op 1 januari 2027.

Het krijgt nieuwe bijlagen en velden. Daaronder vallen de dagen dat de woning beschikbaar was en uw eigendomspercentage. Ze gelden voor elke aangifte die vanaf die datum wordt ingediend, over welk jaar die ook gaat.

Ook de indieningsperiode verschuift. De aangifte over 2026 opent op 1 april 2027, niet in januari, en loopt tot en met 31 december.

Niets hiervan is dramatisch. Het verandert wat u intypt en wanneer, en dat is precies het soort ding dat van een klusje van tien minuten een hele avond maakt.

Bij Bueno houden we deze wijzigingen bij, zodat eigenaren dat niet hoeven te doen. We dienen formulier 210 in voor mensen die buiten Spanje wonen, vanaf €50, en we bewaren uw gegevens van jaar tot jaar.

Draagt u het liever over voordat het formulier verandert, dan kan dat hier:

{link}`,
  },
},
];

// The order posts go out in, one a day. A Bueno post, then a 24/7 Spain tax or money tool
// post, for twenty days, then the ten that are about the home itself. A post that is parked
// or not yet approved is simply skipped, so the order never blocks a send.
export const QUEUE_ORDER = [
  'bueno-rented-part-of-the-year',
  'imputed-income-empty-home',
  'bueno-year-end-return',
  'late-filing-two-regimes',
  'bueno-ibi-is-not-this',
  'quarterly-rental-filing-ends',
  'bueno-two-owners-two-returns',
  'eu-eea-deductions',
  'bueno-what-goes-into-it',
  'three-percent-retention',
  'bueno-direct-debit-date',
  'plusvalia-two-methods',
  'bueno-why-from-fifty',
  'iva-holiday-let',
  'bueno-included-in-select',
  'what-a-year-actually-costs',
  'bueno-never-filed',
  'pre-2019-mortgage-costs',
  'bueno-form-changes-2027',
  'legal-cover-you-already-pay-for',
  'ninety-days',
  'consorcio-storm',
  'community-decision-clock',
  'builder-quote-red-flags',
  'leaving-it-empty',
  'utilities-in-order',
  'tradesperson-in-your-language',
  'who-does-what',
  'maintenance-is-a-year',
  'pests-by-property',
];

export const queueIndex = (ideaKey) => {
  const i = QUEUE_ORDER.indexOf(ideaKey);
  return i === -1 ? QUEUE_ORDER.length : i;
};
