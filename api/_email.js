// Shared email plumbing for the LinkedIn program.
export const OVERSIGHT = ['pratik.y.renuse@gmail.com', 'john@getbueno.com'];
export const REPLY_TO = 'pratik.y.renuse@gmail.com';
export const SITE = 'https://247spain.es';

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
    subject: (t) => `Your LinkedIn post for tomorrow: ${t}`,
    what: 'This is your post for tomorrow. Every weekday you get one, already written and translated, ready to publish from your own LinkedIn profile.',
    how: 'Copy the text below, change anything that does not sound like you, attach the image, and post it. It is your profile, so your voice wins.',
    postLabel: 'Your post',
    imageLabel: 'Attach this image to the post. Tap and hold, or right click, to save it.',
    nextLabel: 'Coming up',
    remaining: (n) => `${n} more posts approved and waiting after this one.`,
    dayLine: (d, s) => `Day ${d} of the plan, ${s} series.`,
    reply: 'Questions, or want a different angle? Just reply to this email. Pratik and John are on copy.',
  },
  nl: {
    greeting: (n) => `Beste ${n},`,
    subject: (t) => `Uw LinkedIn-post voor morgen: ${t}`,
    what: 'Dit is uw post voor morgen. Elke werkdag ontvangt u er een, al geschreven en vertaald, klaar om te plaatsen op uw eigen LinkedIn-profiel.',
    how: 'Kopieer de tekst hieronder, pas aan wat niet bij u past, voeg de afbeelding toe en plaats de post. Het is uw profiel, dus uw eigen stem telt.',
    postLabel: 'Uw post',
    imageLabel: 'Voeg deze afbeelding toe aan de post. Tik en houd vast, of klik rechts, om op te slaan.',
    nextLabel: 'Binnenkort',
    remaining: (n) => `Nog ${n} goedgekeurde posts staan na deze klaar.`,
    dayLine: (d, s) => `Dag ${d} van het plan, serie ${s}.`,
    reply: 'Vragen, of liever een andere invalshoek? Beantwoord deze e-mail. Pratik en John staan in de kopie.',
  },
  sv: {
    greeting: (n) => `Hej ${n},`,
    subject: (t) => `Ditt LinkedIn-inlägg för imorgon: ${t}`,
    what: 'Det här är ditt inlägg för imorgon. Varje vardag får du ett, redan skrivet och översatt, klart att publicera från din egen LinkedIn-profil.',
    how: 'Kopiera texten nedan, ändra det som inte låter som du, bifoga bilden och publicera. Det är din profil, så din röst gäller.',
    postLabel: 'Ditt inlägg',
    imageLabel: 'Bifoga den här bilden till inlägget. Tryck och håll, eller högerklicka, för att spara.',
    nextLabel: 'Kommande',
    remaining: (n) => `${n} godkända inlägg väntar efter det här.`,
    dayLine: (d, s) => `Dag ${d} i planen, serien ${s}.`,
    reply: 'Frågor, eller vill du ha en annan vinkel? Svara bara på det här mejlet. Pratik och John har kopia.',
  },
  no: {
    greeting: (n) => `Hei ${n},`,
    subject: (t) => `LinkedIn-innlegget ditt for i morgen: ${t}`,
    what: 'Dette er innlegget ditt for i morgen. Hver ukedag får du ett, allerede skrevet og oversatt, klart til å publiseres fra din egen LinkedIn-profil.',
    how: 'Kopier teksten under, endre det som ikke høres ut som deg, legg ved bildet og publiser. Det er din profil, så din egen stemme gjelder.',
    postLabel: 'Innlegget ditt',
    imageLabel: 'Legg ved dette bildet i innlegget. Trykk og hold, eller høyreklikk, for å lagre.',
    nextLabel: 'Kommer',
    remaining: (n) => `${n} godkjente innlegg står klare etter dette.`,
    dayLine: (d, s) => `Dag ${d} i planen, serien ${s}.`,
    reply: 'Spørsmål, eller vil du ha en annen vinkling? Bare svar på denne e-posten. Pratik og John står i kopi.',
  },
  es: {
    greeting: (n) => `Hola ${n},`,
    subject: (t) => `Tu publicación de LinkedIn para mañana: ${t}`,
    what: 'Esta es tu publicación para mañana. Cada día laborable recibes una, ya escrita y traducida, lista para publicar desde tu propio perfil de LinkedIn.',
    how: 'Copia el texto de abajo, cambia lo que no suene a ti, adjunta la imagen y publícala. Es tu perfil, así que manda tu voz.',
    postLabel: 'Tu publicación',
    imageLabel: 'Adjunta esta imagen a la publicación. Mantén pulsado, o haz clic derecho, para guardarla.',
    nextLabel: 'Próximamente',
    remaining: (n) => `Quedan ${n} publicaciones aprobadas después de esta.`,
    dayLine: (d, s) => `Día ${d} del plan, serie ${s}.`,
    reply: '¿Dudas, o prefieres otro enfoque? Responde a este correo. Pratik y John están en copia.',
  },
  fr: {
    greeting: (n) => `Bonjour ${n},`,
    subject: (t) => `Votre publication LinkedIn pour demain : ${t}`,
    what: 'Voici votre publication pour demain. Chaque jour ouvre, vous en recevez une, deja redigee et traduite, prete a etre publiee depuis votre profil LinkedIn.',
    how: 'Copiez le texte ci-dessous, modifiez ce qui ne vous ressemble pas, ajoutez l\'image et publiez. C\'est votre profil, donc votre voix prime.',
    postLabel: 'Votre publication',
    imageLabel: 'Ajoutez cette image a la publication. Appuyez longuement, ou faites un clic droit, pour l\'enregistrer.',
    nextLabel: 'A venir',
    remaining: (n) => `${n} publications approuvees attendent apres celle-ci.`,
    dayLine: (d, s) => `Jour ${d} du plan, serie ${s}.`,
    reply: 'Une question, ou envie d\'un autre angle ? Repondez simplement a cet e-mail. Pratik et John sont en copie.',
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

export const imageBlock = (imageUrl, label = 'Attach this image to the post (tap and hold or right click to save):') =>
  imageUrl
    ? `<p style="margin:18px 0 6px;font-size:13px;color:#5a5f73">${esc(label)}</p>
       <img src="${SITE}${imageUrl}" alt="" style="width:100%;max-width:520px;border-radius:10px;display:block" />`
    : '';
