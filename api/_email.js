// Shared email plumbing for the LinkedIn program.
// Who receives what. This was one list called OVERSIGHT, and it was three different
// audiences wearing the same name.
//
// John signs the posts off. Pratik runs the programme and wants sight of everything.
// Everybody else is a team member who posts from their own LinkedIn profile.
const JOHN = 'john@getbueno.com';
const PRATIK = 'pratik.y.renuse@gmail.com';

// The review reminder. John is the one who has to act on it, so it is addressed to him and
// Pratik is copied. Putting both in To made it nobody's job in particular.
export const REVIEW_TO = [JOHN];
export const REVIEW_CC = [PRATIK];

// The preview that goes out the moment a post is approved, so both of them can see what
// was signed off before the team gets it. Addressed to both: it is a record, not a task.
export const APPROVAL_TO = [JOHN, PRATIK];

// Copied on what the team actually receives. John is a team member himself now and gets
// his own English post, so he is deliberately NOT here: he does not want the five that go
// to Amina, Izahbel, Monique, Petter and Yenna. That is thirty emails a month.
export const TEAM_CC = [PRATIK];
// The call to action appended to every post the team receives.
//
// ONE PLACE, ON PURPOSE. Writing it into 255 database rows would mean 255 rows to correct
// the next time the wording or the country count changes. Appending it here means the team
// copies the current version out of the email every time, and a change lands everywhere at
// once.
//
// THE NUMBER. getbueno.com says "trusted by homeowners from 25+ countries" in English,
// "boligeiere fra over 25 land" in Norwegian and "über 25 Ländern" in German. The internal
// brief says 28+, a draft of this CTA said 30+, and two posts say 28. Only 25+ is
// supported by anything a reader can check, so 25+ is what goes out. If the real figure is
// higher, change the website first and this line second.
//
// THE LINKS. Each language points at a page that returns 200, verified by reading the
// actual words on it rather than trusting the html lang attribute.
//
// THE PATHS ARE COUNTRY CODES, NOT LANGUAGE CODES, for the Nordics. Swedish is /se, not
// /sv, and Danish is /dk, not /da. An earlier version of this file tested /sv, got a 404,
// and concluded there was no Swedish site at all. There is: getbueno.com/se, and it is the
// market Izahbel posts into. Check the site's own language switcher before adding a locale.
export const CTA = {
  en: 'Owning or planning to buy property in Spain? Bueno is trusted by homeowners from 25+ countries. getbueno.com',
  no: 'Eier du bolig i Spania, eller vurderer du å kjøpe? Bueno brukes av boligeiere fra over 25 land. getbueno.com/no',
  sv: 'Äger du bostad i Spanien, eller funderar du på att köpa? Bueno används av husägare från över 25 länder. getbueno.com/se',
  de: 'Sie besitzen eine Immobilie in Spanien oder planen einen Kauf? Bueno wird von Eigentümern in über 25 Ländern genutzt. getbueno.com/de',
  fr: "Vous possédez un bien en Espagne, ou vous envisagez d'acheter ? Bueno est utilisé par des propriétaires de plus de 25 pays. getbueno.com/fr",
  nl: 'Bezit u een woning in Spanje, of overweegt u te kopen? Bueno wordt gebruikt door huiseigenaren uit meer dan 25 landen. getbueno.com/nl',
  es: '¿Tiene una propiedad en España o está pensando en comprar? Bueno lo utilizan propietarios de más de 25 países. getbueno.com/es',
};

// The page each language is sent to. All eight verified live: status 200, and the words on
// the page are in that language.
//   /      English      /se   Swedish      /dk   Danish       /no   Norwegian
//   /de    German       /fr   French       /es   Spanish      /nl   Dutch
export const CTA_URL = {
  en: 'https://getbueno.com',      no: 'https://getbueno.com/no',
  sv: 'https://getbueno.com/se',   de: 'https://getbueno.com/de',
  fr: 'https://getbueno.com/fr',   nl: 'https://getbueno.com/nl',
  es: 'https://getbueno.com/es',   da: 'https://getbueno.com/dk',
};

/** The post text with the call to action on the end, in the reader's language. */
// Used ONLY by _lk_refresh.js, when a post is written into the table. By the time a post
// reaches the deck the CTA is already part of post_text, so a reviewer sees it, can edit
// it, and what they approve is exactly what the team is sent. The send path must never
// call this: nothing is added to a post after review.
export function withCta(text, lang) {
  const line = CTA[lang] || CTA.en;
  if (!text) return line;
  // Never append twice, whatever else has been done to the post.
  if (text.includes('getbueno.com')) return text;
  return `${text.trimEnd()}\n\n${line}`;
}

export const REPLY_TO = 'pratik.y.renuse@gmail.com';
// The www host, because that is the one that answers. The apex 301s to it, and an <img>
// in an email is fetched by the mail client or its image proxy, so every redirect is a
// chance for a picture not to appear.
export const SITE = 'https://www.247spain.es';

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const senderFrom = () => process.env.RESEND_FROM || '24/7 Spain <onboarding@resend.dev>';

export async function sendMail({ to, subject, html, cc }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: senderFrom(), to, ...(cc && cc.length ? { cc } : {}), reply_to: REPLY_TO, subject, html }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    return { ok: true, id: j.id || null };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

// The card layout used by every email in this program.
export function shell({ heading, greeting, intro, notice = '', body, footer = '' }) {
  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN${heading ? `<span style="font-weight:normal;font-size:12px;color:#CBEFFF"> ${esc(heading)}</span>` : ''}
      </div>
      <div style="padding:22px">
        ${greeting ? `<p style="margin:0 0 4px;font-size:15px;color:#010221">${esc(greeting)}</p>` : ''}
        ${intro ? `<p style="margin:0 0 16px;font-size:14px;color:#3a3f52">${esc(intro)}</p>` : ''}
        ${notice}
        <div style="background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111;white-space:pre-wrap">${esc(body)}</div>
        ${footer}
      </div>
    </div>
  </div>`;
}

// Everything the member-facing email says, in each team language.
export const COPY = {
  en: {
    greeting: (n) => `Hi ${n},`,
    subject: (t) => `Post today: ${t}`,
    what: 'This is your post for today. One arrives every Tuesday and Thursday, already written and translated, ready to publish from your own LinkedIn profile.',
    how: 'Copy the text below and post it. Adjust the wording so it sounds like you, but please keep the facts, the numbers and the structure as they are.',
    goal: (a) => `The idea: give ${a} something genuinely useful about property in Spain, so you are the person they remember when they need help.`,
    postLabel: 'Your post for today',
    imageLabel: 'Attach this image to the post. Tap and hold, or right click, to save it.',
    nextLabel: 'Coming up',
    remaining: (n) => `${n} more posts approved and waiting after this one.`,
    dayLine: (d, s) => `Day ${d} of the plan, ${s} series.`,
    reply: 'Questions, or want a different angle? Just reply to this email. Pratik is on copy.',
  },
  nl: {
    greeting: (n) => `Beste ${n},`,
    subject: (t) => `Vandaag plaatsen: ${t}`,
    what: 'Dit is uw post voor vandaag. U ontvangt er een op dinsdag en donderdag, al geschreven en vertaald, klaar om te plaatsen op uw eigen LinkedIn-profiel.',
    how: 'Kopieer de tekst hieronder en plaats de post. Pas de formulering aan zodat het als uzelf klinkt, maar houd de feiten, de cijfers en de structuur ongewijzigd.',
    goal: (a) => `Het idee: ${a} iets echt bruikbaars geven over vastgoed in Spanje, zodat u degene bent die zij onthouden.`,
    postLabel: 'Uw post voor vandaag',
    imageLabel: 'Voeg deze afbeelding toe aan de post. Tik en houd vast, of klik rechts, om op te slaan.',
    nextLabel: 'Binnenkort',
    remaining: (n) => `Nog ${n} goedgekeurde posts staan na deze klaar.`,
    dayLine: (d, s) => `Dag ${d} van het plan, serie ${s}.`,
    reply: 'Vragen, of liever een andere invalshoek? Beantwoord deze e-mail. Pratik staat in de kopie.',
  },
  sv: {
    greeting: (n) => `Hej ${n},`,
    subject: (t) => `Publicera idag: ${t}`,
    what: 'Det här är ditt inlägg för idag. Du får ett på tisdagar och torsdagar, redan skrivet och översatt, klart att publicera från din egen LinkedIn-profil.',
    how: 'Kopiera texten nedan och publicera. Justera formuleringarna så att det låter som du, men behåll fakta, siffror och struktur som de är.',
    goal: (a) => `Tanken: ge ${a} något som verkligen är användbart om fastigheter i Spanien, så att du blir den de kommer ihåg.`,
    postLabel: 'Ditt inlägg idag',
    imageLabel: 'Bifoga den här bilden till inlägget. Tryck och håll, eller högerklicka, för att spara.',
    nextLabel: 'Kommande',
    remaining: (n) => `${n} godkända inlägg väntar efter det här.`,
    dayLine: (d, s) => `Dag ${d} i planen, serien ${s}.`,
    reply: 'Frågor, eller vill du ha en annan vinkel? Svara bara på det här mejlet. Pratik har kopia.',
  },
  no: {
    greeting: (n) => `Hei ${n},`,
    subject: (t) => `Publiser i dag: ${t}`,
    what: 'Dette er innlegget ditt for i dag. Du får ett på tirsdager og torsdager, allerede skrevet og oversatt, klart til å publiseres fra din egen LinkedIn-profil.',
    how: 'Kopier teksten under og publiser. Juster formuleringene så det høres ut som deg, men behold fakta, tall og struktur som de er.',
    goal: (a) => `Tanken: gi ${a} noe som faktisk er nyttig om bolig i Spania, slik at du blir den de husker.`,
    postLabel: 'Innlegget ditt i dag',
    imageLabel: 'Legg ved dette bildet i innlegget. Trykk og hold, eller høyreklikk, for å lagre.',
    nextLabel: 'Kommer',
    remaining: (n) => `${n} godkjente innlegg står klare etter dette.`,
    dayLine: (d, s) => `Dag ${d} i planen, serien ${s}.`,
    reply: 'Spørsmål, eller vil du ha en annen vinkling? Bare svar på denne e-posten. Pratik står i kopi.',
  },
  es: {
    greeting: (n) => `Hola ${n},`,
    subject: (t) => `Publicar hoy: ${t}`,
    what: 'Esta es tu publicación de hoy. Recibes una los martes y los jueves, ya escrita y traducida, lista para publicar desde tu propio perfil de LinkedIn.',
    how: 'Copia el texto de abajo y publícalo. Ajusta la redacción para que suene a ti, pero mantén los datos, las cifras y la estructura tal como están.',
    goal: (a) => `La idea: dar a ${a} algo realmente útil sobre la propiedad en España, para que seas tú a quien recuerden.`,
    postLabel: 'Tu publicación de hoy',
    imageLabel: 'Adjunta esta imagen a la publicación. Mantén pulsado, o haz clic derecho, para guardarla.',
    nextLabel: 'Próximamente',
    remaining: (n) => `Quedan ${n} publicaciones aprobadas después de esta.`,
    dayLine: (d, s) => `Día ${d} del plan, serie ${s}.`,
    reply: '¿Dudas, o prefieres otro enfoque? Responde a este correo. Pratik está en copia.',
  },
  fr: {
    greeting: (n) => `Bonjour ${n},`,
    subject: (t) => `A publier aujourd'hui : ${t}`,
    what: 'Voici votre publication du jour. Vous en recevez une le mardi et le jeudi, deja redigee et traduite, prete a etre publiee depuis votre profil LinkedIn.',
    how: 'Copiez le texte ci-dessous et publiez-le. Ajustez la formulation pour qu\'elle vous ressemble, mais conservez les faits, les chiffres et la structure tels quels.',
    goal: (a) => `L'idee : apporter aux ${a} quelque chose de vraiment utile sur l\'immobilier en Espagne, pour que ce soit vous dont ils se souviennent.`,
    postLabel: 'Votre publication du jour',
    imageLabel: 'Ajoutez cette image a la publication. Appuyez longuement, ou faites un clic droit, pour l\'enregistrer.',
    nextLabel: 'A venir',
    remaining: (n) => `${n} publications approuvees attendent apres celle-ci.`,
    dayLine: (d, s) => `Jour ${d} du plan, serie ${s}.`,
    reply: 'Une question, ou envie d\'un autre angle ? Repondez simplement a cet e-mail. Pratik est en copie.',
  },
};

export const STREAM_LABEL = {
  en: { owners: 'property owners', agents: 'estate agents', attorneys: 'legal advisers' },
  nl: { owners: 'woningeigenaren', agents: 'makelaars', attorneys: 'juridisch adviseurs' },
  sv: { owners: 'fastighetsagare', agents: 'maklare', attorneys: 'juridiska radgivare' },
  no: { owners: 'boligeiere', agents: 'meglere', attorneys: 'juridiske radgivere' },
  es: { owners: 'propietarios', agents: 'agentes inmobiliarios', attorneys: 'asesores legales' },
  fr: { owners: 'proprietaires', agents: 'agents immobiliers', attorneys: 'conseillers juridiques' },
};

// An image can live on our own site as a path, or on a stock CDN as a full URL. Both are
// valid: the team downloads the picture out of the email either way, and a hosted stock URL
// means a new image needs no deploy and no file in the repo.
export const imageSrc = (imageUrl) => {
  if (!imageUrl) return '';
  return /^https?:\/\//i.test(imageUrl) ? imageUrl : `${SITE}${imageUrl}`;
};

export const imageBlock = (imageUrl, label = 'Attach this image to the post (tap and hold or right click to save):') =>
  imageUrl
    ? `<p style="margin:18px 0 6px;font-size:13px;color:#5a5f73">${esc(label)}</p>
       <img src="${imageSrc(imageUrl)}" alt="" style="width:100%;max-width:520px;border-radius:10px;display:block" />`
    : '';
