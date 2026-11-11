"""Builds the 10 Nov 2026 Bueno Newsletter in English, Norwegian and Swedish from one template."""
import html, json, pathlib

IMG = 'https://www.247spain.es/images'
GUIDE = 'https://www.247spain.es/newsletter-guides/Bueno-Guide-Community-Fees-In-Spain-{L}.pdf'

C = {
 'en': dict(
  subject='This Week in Spanish Property: Prices Hit an All-Time Record, Plus More Updates',
  preview='Record prices, a 19% drop in rental listings and a Supreme Court ruling on community late fees.',
  intro=['Welcome to the Bueno Newsletter, your trusted source for what is happening with property in Spain.',
         'It has been a big fortnight. Prices hit a new record, rental listings dropped sharply, and the Supreme Court ruled on a community fee that many owners will recognise. Here is what you need to know.'],
  l_news='News', news_h='This fortnight in Spanish property', news_k='The three updates foreign owners are talking about.',
  news=[('Used home prices hit an all-time record', 'Used homes in Spain averaged 2,955 euros per square metre in October, 11.2% more than a year ago and the highest idealista has ever recorded. Málaga, Palma, Barcelona and Madrid are all above 3,000 euros, and Madrid and Barcelona are now above 5,000. It is a good moment to see what your own home is worth today.'),
        ('26,531 rental listings vanished in one month', "After the government's first housing decrees on 29 September, rental listings on idealista fell by 19% in a single month. Two new decrees have taken their place, and Congress votes on them on Thursday 12 November. If you let your home, that vote decides which rules you will be letting under."),
        ('The Supreme Court strikes down a 50 cent a day late fee', "One community of owners charged 50 cents for every day a fee was late, which could reach 182.50 euros a year on a garage fee of 135 euros. Spain's Supreme Court called it disproportionate and struck it down. Communities can still chase unpaid fees, but their penalties have to stay reasonable.")],
  news_btn='Get Bueno today',
  tax_h='Your 2025 <span style="color:#C9A96E;">non-resident tax</span> return is due by 31 December',
  tax=['Owning a home in Spain as a non-resident means a yearly national tax return, the Modelo 210, on top of your local property tax. The return for 2025 has to be filed by 31 December 2026.',
       'Bueno can file it for you, starting from 50 euros. If you have not filed for earlier years, we can help you file and pay those too.'],
  tax_cta='Just reply to this email and we will take it from there.',
  l_guide='Free guide', guide_h='Community fees in Spain: what you pay and your rights',
  guide_p="After this fortnight's Supreme Court ruling, we have written a new guide on community fees. It explains what you pay, how decisions are made and what your rights are if something goes wrong.",
  guide_in='Inside the guide you will find:',
  guide_list=['What your community fees pay for, and how your share is set.', 'How the yearly meeting works, and who gets to vote.',
              'What can happen when a payment is late, including the new Supreme Court ruling.', 'Why old debts follow the home when it is bought or sold.',
              'How to challenge a decision you disagree with, and the deadlines that apply.'],
  guide_btn='Read the guide',
  l_region='Region spotlight', region_h='Marbella and the western <span style="color:#C9A96E;">Costa del Sol</span>',
  region=['The OECD has named the Málaga and Marbella area as the hardest place in Spain to buy a home. Buying here takes 4.52 more years of income than the Spanish average, ahead of Palma de Mallorca at 4.33 years.',
          "Prices tell the same story. Used homes in Málaga city are now above 3,000 euros per square metre, according to idealista's October figures. Across Spain, fewer homes are being sold than at any time in six years, yet the average price of those that do sell is up 12.8% on last year.",
          "Bueno customers can see their property's current value in the Bueno property section."],
  region_btn='See what your home is worth',
  l_q="Reader's question", q='"Our community wants to fine owners who pay their fees late. Are they allowed to do that?"',
  a=['Yes, a community of owners can act against owners who do not pay, and it can agree on penalties at a meeting. But the Supreme Court has just made it clear that those penalties must be in proportion to what is owed. A flat charge that keeps growing every day, whatever the amount, can be struck down.',
     'If you disagree with a decision your community has taken, you can challenge it in court. The usual deadline is three months from the meeting, or one year if the decision goes against the law.',
     'The simplest protection is never to be late. Most owners already pay their community fees by direct debit, so check that yours comes from an account that always has money in it.',
     'With Bueno, you can register any change to a direct debit in the app, and our team takes care of the rest.'],
  l_join='Bueno', join_h='Owning a home in Spain should feel <span style="color:#C9A96E;">simple</span>',
  join_p='Bueno is used by property owners from over 30 countries, who rate us 4.9 out of 5. For 99 euros a year:',
  join_list=['Our team is there when you need us, by phone, WhatsApp, chat and email.', 'You register a direct debit change in the app, and we handle it.',
             'You can see what your home is worth today.', 'Your property papers are kept safe in one place.', 'We file your Spanish non-resident tax return for you.'],
  join_btn='Join Bueno today', join_url='https://getbueno.com',
  sign=['Until the next edition,', 'Maria<br>The Bueno Team'],
  foot="Regulated by Banco de España. Sources for the figures in this edition: idealista, Spain's notaries, the OECD and Spain's Supreme Court.",
  alts=['White apartments above the sea at sunset in Spain', 'A shaded terrace with a view in Spain', 'A marina with white apartments on the Costa del Sol', 'A couple looking out over the sea from their terrace']),

 'no': dict(
  subject='Denne uken i det spanske eiendomsmarkedet: Prisene er rekordhøye, pluss flere nyheter',
  preview='Rekordpriser, 19 % færre utleieannonser og en dom fra Høyesterett om gebyrer i sameier.',
  intro=['Velkommen til Bueno Nyhetsbrev, din kilde til det som skjer i eiendomsmarkedet i Spania.',
         'Det har vært to begivenhetsrike uker. Prisene har nådd ny rekord, utleieannonsene har falt kraftig, og Høyesterett har avgjort en sak om et gebyr i et sameie som mange eiere vil kjenne igjen. Her er det du trenger å vite.'],
  l_news='Nyheter', news_h='Disse to ukene i det spanske eiendomsmarkedet', news_k='De tre nyhetene utenlandske boligeiere snakker om.',
  news=[('Bruktboliger har aldri vært dyrere', 'Bruktboliger i Spania kostet i snitt 2 955 euro per kvadratmeter i oktober, 11,2 % mer enn for et år siden og det høyeste idealista noen gang har målt. Málaga, Palma, Barcelona og Madrid ligger alle over 3 000 euro, og Madrid og Barcelona er nå over 5 000. Det er et godt tidspunkt å sjekke hva din egen bolig er verdt i dag.'),
        ('26 531 utleieannonser forsvant på én måned', 'Etter regjeringens første boligdekreter 29. september falt antallet utleieannonser på idealista med 19 % på én måned. To nye dekreter har tatt over, og Kongressen stemmer over dem torsdag 12. november. Leier du ut boligen, avgjør den avstemningen hvilke regler du leier ut etter.'),
        ('Høyesterett stopper et gebyr på 50 cent per dag', 'Et sameie krevde 50 cent for hver dag en betaling var forsinket, noe som kunne bli 182,50 euro i året på en garasjeplass med en årlig utgift på 135 euro. Spanias høyesterett mente gebyret var uforholdsmessig og opphevet det. Sameier kan fortsatt kreve inn ubetalte utgifter, men gebyrene må være rimelige.')],
  news_btn='Bli kunde i Bueno',
  tax_h='Skattemeldingen for 2025 for <span style="color:#C9A96E;">ikke-residenter</span> skal leveres innen 31. desember',
  tax=['Eier du bolig i Spania uten å bo der fast, må du levere en årlig nasjonal skattemelding, Modelo 210, i tillegg til den lokale eiendomsskatten. Skattemeldingen for 2025 skal leveres innen 31. desember 2026.',
       'Bueno kan levere den for deg, fra 50 euro. Har du ikke levert for tidligere år, kan vi hjelpe deg med å levere og betale for dem også.'],
  tax_cta='Svar på denne e-posten, så tar vi det derfra.',
  l_guide='Gratis guide', guide_h='Fellesutgifter i Spania: hva du betaler og dine rettigheter',
  guide_p='Etter dommen fra Høyesterett har vi skrevet en ny guide om fellesutgifter. Den forklarer hva du betaler, hvordan vedtak fattes og hvilke rettigheter du har hvis noe går galt.',
  guide_in='I guiden finner du:',
  guide_list=['Hva fellesutgiftene dekker, og hvordan din andel blir satt.', 'Hvordan årsmøtet fungerer, og hvem som har stemmerett.',
              'Hva som kan skje når en betaling er forsinket, inkludert den nye dommen fra Høyesterett.', 'Hvorfor gammel gjeld følger boligen når den kjøpes eller selges.',
              'Hvordan du kan klage på et vedtak du er uenig i, og hvilke frister som gjelder.'],
  guide_btn='Les guiden',
  l_region='Regionen i søkelyset', region_h='Marbella og den vestlige <span style="color:#C9A96E;">Costa del Sol</span>',
  region=['OECD peker på området rundt Málaga og Marbella som det vanskeligste stedet i Spania å kjøpe bolig. Her tar et boligkjøp 4,52 flere årslønner enn snittet i Spania, foran Palma de Mallorca med 4,33 år.',
          'Prisene forteller det samme. Bruktboliger i Málaga by koster nå over 3 000 euro per kvadratmeter, ifølge idealistas tall for oktober. I hele Spania selges det færre boliger enn på seks år, men snittprisen på boligene som selges, har steget 12,8 % siden i fjor.',
          'Bueno-kunder kan se eiendommens verdivurdering i eiendomsseksjonen vår.'],
  region_btn='Se hva boligen din er verdt',
  l_q='Leserens spørsmål', q='«Sameiet vårt vil ilegge gebyr til eiere som betaler fellesutgiftene for sent. Har de lov til det?»',
  a=['Ja, et sameie kan gå til tiltak mot eiere som ikke betaler, og det kan vedta gebyrer på et møte. Men Høyesterett har nå gjort det klart at gebyrene må stå i forhold til det som er skyldig. Et fast tillegg som vokser hver dag, uansett hvor mye som skyldes, kan bli opphevet.',
     'Er du uenig i et vedtak i sameiet, kan du klage det inn for retten. Fristen er som regel tre måneder fra møtet, eller ett år hvis vedtaket strider mot loven.',
     'Den enkleste beskyttelsen er å aldri betale for sent. De fleste eiere betaler allerede fellesutgiftene med autotrekk, så sjekk at ditt går fra en konto som alltid har penger på seg.',
     'Med Bueno kan du registrere en endring av autotrekk i appen, og teamet vårt tar seg av resten.'],
  l_join='Bueno', join_h='Å eie bolig i Spania skal føles <span style="color:#C9A96E;">enkelt</span>',
  join_p='Bueno brukes av eiendomseiere fra over 30 land, som gir oss 4,9 av 5. For 99 euro i året får du:',
  join_list=['Teamet vårt er der når du trenger oss, på telefon, WhatsApp, chat og e-post.', 'Du registrerer en endring av autotrekk i appen, og vi ordner resten.',
             'Du kan se hva boligen din er verdt i dag.', 'Eiendomspapirene dine er trygt samlet på ett sted.', 'Vi leverer den spanske skattemeldingen for ikke-residenter for deg.'],
  join_btn='Bli kunde i dag', join_url='https://getbueno.com/no',
  sign=['Vi snakkes i neste utgave,', 'Maria<br>Teamet i Bueno'],
  foot='Regulert av Banco de España. Kilder til tallene i denne utgaven: idealista, de spanske notarene, OECD og Spanias høyesterett.',
  alts=['Hvite leiligheter over havet i solnedgang i Spania', 'En skyggefull terrasse med utsikt i Spania', 'En marina med hvite leiligheter på Costa del Sol', 'Et par som ser utover havet fra terrassen']),

 'sv': dict(
  subject='Den här veckan på den spanska fastighetsmarknaden: Priserna är rekordhöga, plus fler nyheter',
  preview='Rekordpriser, 19 % färre hyresannonser och en dom från Högsta domstolen om förseningsavgifter i samfälligheter.',
  intro=['Välkommen till Buenos nyhetsbrev, din källa till vad som händer på fastighetsmarknaden i Spanien.',
         'Det har varit två händelserika veckor. Priserna har nått ett nytt rekord, hyresannonserna har minskat kraftigt och Högsta domstolen har avgjort ett fall om en avgift i en samfällighet som många ägare känner igen. Här är det du behöver veta.'],
  l_news='Nyheter', news_h='De här två veckorna på den spanska fastighetsmarknaden', news_k='De tre nyheterna som utländska fastighetsägare pratar om.',
  news=[('Begagnade bostäder har aldrig varit dyrare', 'Begagnade bostäder i Spanien kostade i snitt 2 955 euro per kvadratmeter i oktober, 11,2 % mer än för ett år sedan och det högsta idealista någonsin har uppmätt. Málaga, Palma, Barcelona och Madrid ligger alla över 3 000 euro, och Madrid och Barcelona ligger nu över 5 000. Det är ett bra tillfälle att se vad din egen bostad är värd i dag.'),
        ('26 531 hyresannonser försvann på en månad', 'Efter regeringens första bostadsdekret den 29 september minskade antalet hyresannonser på idealista med 19 % på en enda månad. Två nya dekret har tagit deras plats, och kongressen röstar om dem torsdagen den 12 november. Om du hyr ut din bostad avgör den omröstningen vilka regler du hyr ut under.'),
        ('Högsta domstolen stoppar en avgift på 50 cent per dag', 'En samfällighet tog ut 50 cent för varje dag en betalning var sen, vilket kunde bli 182,50 euro om året på en garageplats med en årsavgift på 135 euro. Spaniens högsta domstol ansåg avgiften oproportionerlig och upphävde den. Samfälligheter får fortfarande driva in obetalda avgifter, men förseningsavgifterna måste vara rimliga.')],
  news_btn='Bli kund hos Bueno',
  tax_h='Deklarationen för 2025 för <span style="color:#C9A96E;">icke-residenter</span> ska lämnas senast den 31 december',
  tax=['Äger du en bostad i Spanien utan att bo där året runt ska du lämna en årlig nationell deklaration, Modelo 210, utöver den lokala fastighetsskatten. Deklarationen för 2025 ska lämnas senast den 31 december 2026.',
       'Bueno kan lämna den åt dig, från 50 euro. Om du inte har deklarerat för tidigare år kan vi hjälpa dig att deklarera och betala även för dem.'],
  tax_cta='Svara bara på det här mejlet så tar vi det därifrån.',
  l_guide='Gratis guide', guide_h='Samfällighetsavgifter i Spanien: vad du betalar och dina rättigheter',
  guide_p='Efter Högsta domstolens dom har vi skrivit en ny guide om samfällighetsavgifter. Den förklarar vad du betalar, hur beslut fattas och vilka rättigheter du har om något går fel.',
  guide_in='I guiden hittar du:',
  guide_list=['Vad samfällighetsavgifterna betalar för, och hur din andel bestäms.', 'Hur årsstämman fungerar, och vem som får rösta.',
              'Vad som kan hända när en betalning är sen, inklusive Högsta domstolens nya dom.', 'Varför gamla skulder följer med bostaden när den köps eller säljs.',
              'Hur du överklagar ett beslut du inte håller med om, och vilka tidsfrister som gäller.'],
  guide_btn='Läs guiden',
  l_region='Regionen i fokus', region_h='Marbella och västra <span style="color:#C9A96E;">Costa del Sol</span>',
  region=['OECD pekar ut området kring Málaga och Marbella som det svåraste stället i Spanien att köpa bostad på. Här krävs 4,52 fler årsinkomster än genomsnittet i Spanien, före Palma de Mallorca med 4,33 år.',
          'Priserna berättar samma sak. Begagnade bostäder i Málaga stad kostar nu över 3 000 euro per kvadratmeter, enligt idealistas siffror för oktober. I hela Spanien säljs färre bostäder än på sex år, men snittpriset på de bostäder som säljs har stigit med 12,8 % sedan i fjol.',
          'Bueno-kunder kan se fastighetens aktuella värdering i vår fastighetsdel.'],
  region_btn='Se vad din bostad är värd',
  l_q='Läsarens fråga', q='”Vår samfällighet vill ta ut en avgift av ägare som betalar sina avgifter för sent. Får de göra det?”',
  a=['Ja, en samfällighet kan vidta åtgärder mot ägare som inte betalar, och den kan besluta om förseningsavgifter på en stämma. Men Högsta domstolen har nu gjort klart att avgifterna måste stå i proportion till det som är skyldigt. En fast avgift som växer varje dag, oavsett skuldens storlek, kan upphävas.',
     'Om du inte håller med om ett beslut i samfälligheten kan du överklaga det till domstol. Fristen är oftast tre månader från stämman, eller ett år om beslutet strider mot lagen.',
     'Det enklaste skyddet är att aldrig betala för sent. De flesta ägare betalar redan samfällighetsavgifterna via autogiro, så kontrollera att ditt dras från ett konto som alltid har pengar på.',
     'Med Bueno kan du registrera en ändring av autogiro i appen, och vårt team sköter resten.'],
  l_join='Bueno', join_h='Att äga en bostad i Spanien ska kännas <span style="color:#C9A96E;">enkelt</span>',
  join_p='Bueno används av fastighetsägare från över 30 länder, som ger oss 4,9 av 5. För 99 euro om året får du:',
  join_list=['Vårt team finns där när du behöver oss, via telefon, WhatsApp, chatt och e-post.', 'Du registrerar en ändring av autogiro i appen, och vi sköter resten.',
             'Du kan se vad din bostad är värd i dag.', 'Dina fastighetspapper finns tryggt samlade på ett ställe.', 'Vi lämnar din spanska deklaration för icke-residenter åt dig.'],
  join_btn='Bli kund i dag', join_url='https://getbueno.com/se',
  sign=['Vi hörs i nästa nummer,', 'Maria<br>Teamet på Bueno'],
  foot='Reglerat av Banco de España. Källor till siffrorna i det här numret: idealista, de spanska notarierna, OECD och Spaniens högsta domstol.',
  alts=['Vita lägenheter ovanför havet i solnedgången i Spanien', 'En skuggig terrass med utsikt i Spanien', 'En marina med vita lägenheter på Costa del Sol', 'Ett par som blickar ut över havet från terrassen']),
}

P = 'margin:0 0 12px;font-size:15px;line-height:1.65;color:#2B2E45;'
PILL = 'display:inline-block;background:#CBEFFF;color:#010221;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border-radius:12px;'
H2 = 'margin:14px 0 10px;font-size:22px;line-height:1.3;font-weight:normal;color:#010221;'
BTN = 'display:inline-block;background:{bg};color:#FFFFFF;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;padding:13px 26px;border-radius:24px;'
e = html.escape

def img(src, alt):
    return f'<tr><td><img src="{src}" width="600" alt="{e(alt)}" style="display:block;width:100%;height:auto;border:0;"></td></tr>'

def ul(items):
    return '<ul style="margin:0 0 6px 20px;padding:0;font-size:15px;line-height:1.65;color:#2B2E45;">' + ''.join(f'<li style="margin:0 0 6px;">{e(i)}</li>' for i in items) + '</ul>'

def build(L):
    c = C[L]
    news = ''.join(f'''<tr><td style="padding:{18 if i == 0 else 22}px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="44" valign="top" style="font-size:28px;line-height:1;color:#C9A96E;">{i+1}</td><td valign="top">
<h3 style="margin:0 0 8px;font-size:18px;line-height:1.35;color:#010221;">{e(t)}</h3><p style="margin:0;font-size:15px;line-height:1.65;color:#2B2E45;">{e(b)}</p>
</td></tr></table></td></tr>''' for i, (t, b) in enumerate(c['news']))
    return f'''<!DOCTYPE html>
<html lang="{L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{e(c['subject'])}</title></head>
<body style="margin:0;padding:0;background:#F8F7F4;">
<div style="display:none;max-height:0;overflow:hidden;">{e(c['preview'])}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F7F4;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#FFFFFF;font-family:Georgia,'Times New Roman',serif;color:#010221;">
<tr><td style="padding:28px 32px 22px;border-bottom:4px solid #010221;"><img src="{IMG}/pro/bueno-logo-navy.png" width="260" alt="Bueno | Property Simplified" style="display:block;width:260px;height:auto;border:0;"></td></tr>
{img(IMG + '/home/hero.jpg', c['alts'][0])}
<tr><td style="padding:30px 32px 6px;">{''.join(f'<p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#2B2E45;">{e(p)}</p>' for p in c['intro'])}</td></tr>
<tr><td style="padding:26px 32px 8px;"><div style="{PILL}">{e(c['l_news'])}</div>
<h2 style="margin:14px 0 6px;font-size:24px;line-height:1.3;font-weight:normal;color:#010221;">{e(c['news_h'])}</h2>
<p style="margin:0;font-size:15px;line-height:1.6;color:#5B5F75;">{e(c['news_k'])}</p></td></tr>
{news}
<tr><td style="padding:24px 32px 30px;"><a href="{c['join_url']}" style="{BTN.format(bg='#010221')}">{e(c['news_btn'])}</a></td></tr>
<tr><td style="padding:0 32px 30px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#010221;border-radius:6px;"><tr><td style="padding:26px 28px;">
<h2 style="margin:0 0 12px;font-size:21px;line-height:1.3;font-weight:normal;color:#FFFFFF;">{c['tax_h']}</h2>
{''.join(f'<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#E6E8F2;">{e(p)}</p>' for p in c['tax'])}
<p style="margin:0;font-size:15px;line-height:1.65;color:#CBEFFF;">{e(c['tax_cta'])}</p></td></tr></table></td></tr>
{img(IMG + '/home/away.jpg', c['alts'][1])}
<tr><td style="padding:26px 32px 30px;"><div style="{PILL}">{e(c['l_guide'])}</div>
<h2 style="{H2}">{e(c['guide_h'])}</h2><p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#2B2E45;">{e(c['guide_p'])}</p>
<p style="margin:0 0 8px;font-size:15px;line-height:1.65;color:#2B2E45;">{e(c['guide_in'])}</p>{ul(c['guide_list'])}
<p style="margin:18px 0 0;"><a href="{GUIDE.format(L=L.upper())}" style="{BTN.format(bg='#5B7FCC')}">{e(c['guide_btn'])}</a></p></td></tr>
{img(IMG + '/pro/marina.jpg', c['alts'][2])}
<tr><td style="padding:26px 32px 30px;"><div style="{PILL}">{e(c['l_region'])}</div><h2 style="{H2}">{c['region_h']}</h2>
{''.join(f'<p style="{P}">{e(p)}</p>' for p in c['region'])}
<p style="margin:16px 0 0;"><a href="https://go.getbueno.com/property-en/" style="{BTN.format(bg='#010221')}">{e(c['region_btn'])}</a></p></td></tr>
<tr><td style="padding:0 32px 30px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F8FB;border-left:4px solid #5B7FCC;"><tr><td style="padding:24px 26px;">
<div style="{PILL.replace('#CBEFFF', '#FFFFFF')}">{e(c['l_q'])}</div>
<h2 style="margin:14px 0 12px;font-size:19px;line-height:1.4;font-weight:normal;color:#010221;">{e(c['q'])}</h2>
{''.join(f'<p style="{P}">{e(p)}</p>' for p in c['a'])}</td></tr></table></td></tr>
{img(IMG + '/hero-audit.jpg', c['alts'][3])}
<tr><td style="padding:26px 32px 30px;"><div style="{PILL}">{e(c['l_join'])}</div><h2 style="{H2}">{c['join_h']}</h2>
<p style="margin:0 0 10px;font-size:15px;line-height:1.65;color:#2B2E45;">{e(c['join_p'])}</p>{ul(c['join_list'])}
<p style="margin:18px 0 0;"><a href="{c['join_url']}" style="{BTN.format(bg='#010221')}">{e(c['join_btn'])}</a></p></td></tr>
<tr><td style="padding:0 32px 34px;"><p style="margin:0 0 4px;font-size:15px;line-height:1.65;color:#2B2E45;">{e(c['sign'][0])}</p><p style="margin:0;font-size:15px;line-height:1.65;color:#2B2E45;">{c['sign'][1]}</p></td></tr>
<tr><td style="background:#010221;padding:22px 32px;"><img src="{IMG}/home/bueno-logo-white.png" width="170" alt="Bueno" style="display:block;width:170px;height:auto;border:0;margin:0 0 10px;">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B9BDD3;">{e(c['foot'])}</p></td></tr>
</table></td></tr></table></body></html>'''

def text(L):
    c = C[L]
    strip = lambda s: s.replace('<span style="color:#C9A96E;">', '').replace('</span>', '').replace('<br>', '\n')
    out = [*c['intro'], '', f"{c['l_news'].upper()}: {c['news_h']}"]
    for i, (t, b) in enumerate(c['news']): out += ['', f'{i+1}. {t}', b]
    out += ['', f"{c['news_btn']}: {c['join_url']}", '', strip(c['tax_h']).upper(), *c['tax'], c['tax_cta'],
            '', f"{c['l_guide'].upper()}: {c['guide_h']}", c['guide_p'], *[f'- {x}' for x in c['guide_list']], f"{c['guide_btn']}: {GUIDE.format(L=L.upper())}",
            '', f"{c['l_region'].upper()}: {strip(c['region_h'])}", *c['region'], f"{c['region_btn']}: https://go.getbueno.com/property-en/",
            '', f"{c['l_q'].upper()}: {c['q']}", *c['a'], '', strip(c['join_h']).upper(), c['join_p'], *[f'- {x}' for x in c['join_list']],
            f"{c['join_btn']}: {c['join_url']}", '', c['sign'][0], strip(c['sign'][1]), '', c['foot']]
    return '\n'.join(out)

if __name__ == '__main__':
    out = pathlib.Path('/home/claude/nl/editions'); out.mkdir(exist_ok=True)
    for L in C:
        (out / f'Bueno-Newsletter-2026-11-10-{L.upper()}.html').write_text(build(L))
        (out / f'Bueno-Newsletter-2026-11-10-{L.upper()}.txt').write_text(text(L))
        h = build(L)
        assert '—' not in h and '–' not in h, L
        print(L, len(h), C[L]['subject'])
    json.dump({L: C[L]['subject'] for L in C}, open(out / 'subjects.json', 'w'), ensure_ascii=False)
