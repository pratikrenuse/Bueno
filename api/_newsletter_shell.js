// The fixed parts of every Bueno newsletter, per language.
//
// These are the sections that stay the same from issue to issue: the welcome, the section
// labels, the Bueno Tax block, the "Get Bueno" close and the sign-off. They are copied into
// each issue when it is seeded, so John can still adjust them for one issue without
// changing every other issue. Change them here to change them for all future issues.
//
// English and Norwegian are taken word for word from Bueno Newsletter 12 (4 Sep 2026).
// Swedish is written to the same structure, using the glossary in TRANSLATIONS.md.

export const LANGS = ['en', 'no', 'sv'];
export const LANG_LABEL = { en: 'English', no: 'Norsk', sv: 'Svenska' };

export const LINKS = {
  account: { en: 'https://getbueno.com', no: 'https://getbueno.com/no', sv: 'https://getbueno.com/se' },
  property: {
    en: 'https://go.getbueno.com/property-en/',
    no: 'https://go.getbueno.com/property-en/',
    sv: 'https://go.getbueno.com/property-en/',
  },
};

export const SHELL = {
  en: {
    intro: [
      'Welcome to Bueno Newsletter, your trusted source for the latest insights on Spanish property.',
      'Here’s what’s new this week:',
    ],
    labels: { news: 'News', guide: 'Guide', property: 'Property', question: 'Reader’s Question', join: 'Join Bueno', survey: 'Quick question' },
    news_heading: 'This week in Spanish Property',
    news_kicker: 'The top 3 updates and market moves in Spanish property this week:',
    news_button: 'Get Bueno Today',
    tax: {
      title: 'Bueno Tax',
      paras: [
        'Some foreign owners might not be aware of the national tax obligations related to their property in Spain. Non-residents pay both local property taxes and a national tax.',
        'Bueno can assist with your national tax returns, the annual tax return (imputed income) for 2025 is soon due, our fee starts from little as €50.',
        'If you have unpaid tax for previous years (2021-2024) we can assist with the tax reporting and payment of the outstanding tax.',
        'Reply to this email to learn more.',
      ],
    },
    guide_topics_label: 'Key topics covered:',
    guide_button: 'Read Now',
    region_prefix: 'Region Spotlight:',
    region_note: 'Bueno customers can see their property’s current valuation in our property section.',
    region_button: 'Visit Bueno Property',
    question_prefix: 'Q:',
    join: {
      title: 'Get Bueno Today',
      body: 'Owning property in Spain should feel simple, not stressful. With Bueno, you get a Spanish IBAN account built for non residents, up to 50 percent savings on bills, and exclusive Bueno Club perks including special discounts with over 50 trusted partners such as Audible, NordVPN, Just Eat, MediaMarkt, Bosch, ClassPass, Expedia, and Iberostar, all backed by real multilingual human support for €99 per year with no hidden fees.',
      line: 'Join Bueno today at https://getbueno.com',
    },
    signoff: ['Until next edition,', 'Maria', 'The Bueno Team'],
  },
  no: {
    intro: [
      'Velkommen til Bueno Nyhetsbrev',
      'En god kilde til informasjon og endringer om eiendomsmarkedet i Spania.',
      'Enten du allerede eier bolig i Spania eller planlegger å kjøpe, her har vi oversikt for deg.',
      'Dette er nytt denne uken:',
    ],
    labels: { news: 'Nyheter', guide: 'Guide', property: 'Eiendom', question: 'Leserens spørsmål', join: 'Bueno', survey: 'Et raskt spørsmål' },
    news_heading: 'Denne uken om det spanske eiendomsmarkedet',
    news_kicker: 'De 3 største endringene utenlandske boligeiere må kjenne til:',
    news_button: 'ÅPNE KONTO',
    tax: {
      title: 'Bueno Skatt',
      paras: [
        'Noen utenlandske eiere er kanskje ikke klar over de nasjonale skatteforpliktelsene knyttet til eiendommen sin i Spania. Ikke-residenter betaler både lokal eiendomsskatt og en nasjonal skatt.',
        'Bueno kan bistå med den nasjonale skattemeldingen din. Årsoppgaven for 2025 (spansk selvangivelse) har snart frist for innlevering, vi kan bistå deg med priser som starter fra så lite som 50 euro.',
        'Har du ubetalt skatt for tidligere år (2021 til 2024), kan vi bistå med rapportering og innbetaling av utestående skatt. Svar på denne e-posten for å få vite mer.',
      ],
    },
    guide_topics_label: 'Viktige temaer som dekkes:',
    guide_button: 'Les mer',
    region_prefix: 'Regionen i søkelyset:',
    region_note: 'Bueno-kunder kan se eiendommens verdivurdering i eiendomsseksjonen vår.',
    region_button: 'Besøk Bueno Property',
    question_prefix: 'Spørsmål:',
    join: {
      title: 'Bli en del av Bueno i dag',
      body: 'Å eie bolig i Spania skal føles enkelt, ikke stressende. Med Bueno får du en spansk IBAN-konto og en plattform tilpasset deg som ikke bor fast i Spania. Spar penger med vår strømavtale, og motta eksklusive Bueno Club-fordeler med rabatter hos en rekke kjente merkevarer. Få bistand fra vår flerspråklig kundeservice, fra et team som forstår deg og dine utfordringer i Spania. Alt dette for kun €99 per år uten skjulte gebyrer.',
      line: 'Bli kund i dag på https://getbueno.com/no',
    },
    signoff: ['Maria', 'Teamet i Bueno'],
  },
  sv: {
    intro: [
      'Välkommen till Buenos nyhetsbrev',
      'En pålitlig källa till information och förändringar på fastighetsmarknaden i Spanien.',
      'Oavsett om du redan äger en fastighet i Spanien eller planerar att köpa, har vi samlat det viktigaste för dig.',
      'Det här är nytt den här veckan:',
    ],
    labels: { news: 'Nyheter', guide: 'Guide', property: 'Fastighet', question: 'Läsarens fråga', join: 'Bueno', survey: 'En snabb fråga' },
    news_heading: 'Den här veckan på den spanska fastighetsmarknaden',
    news_kicker: 'De 3 viktigaste förändringarna som utländska fastighetsägare behöver känna till:',
    news_button: 'ÖPPNA KONTO',
    tax: {
      title: 'Bueno Skatt',
      paras: [
        'Alla utländska ägare känner kanske inte till de nationella skatteskyldigheter som hör till deras fastighet i Spanien. Icke-residenter betalar både lokal fastighetsskatt och en nationell skatt.',
        'Bueno kan hjälpa dig med den nationella deklarationen. Årsdeklarationen för 2025 (den spanska deklarationen för icke-residenter) ska snart lämnas in, och vi kan hjälpa dig från så lite som 50 euro.',
        'Har du obetald skatt för tidigare år (2021 till 2024) kan vi hjälpa dig att deklarera och betala den utestående skatten. Svara på det här mejlet så berättar vi mer.',
      ],
    },
    guide_topics_label: 'Det här tar guiden upp:',
    guide_button: 'Läs mer',
    region_prefix: 'Regionen i fokus:',
    region_note: 'Bueno-kunder kan se fastighetens aktuella värdering i vår fastighetsdel.',
    region_button: 'Besök Bueno Property',
    question_prefix: 'Fråga:',
    join: {
      title: 'Bli en del av Bueno i dag',
      body: 'Att äga en fastighet i Spanien ska kännas enkelt, inte stressigt. Med Bueno får du ett spanskt IBAN-konto och en plattform anpassad för dig som inte bor i Spanien året runt. Spara pengar med vårt elavtal och få exklusiva Bueno Club-förmåner med rabatter hos en rad kända varumärken. Få hjälp av vår flerspråkiga kundtjänst, ett team som förstår dig och dina utmaningar i Spanien. Allt detta för endast €99 per år utan dolda avgifter.',
      line: 'Bli kund i dag på https://getbueno.com/se',
    },
    signoff: ['Maria', 'Teamet på Bueno'],
  },
};
