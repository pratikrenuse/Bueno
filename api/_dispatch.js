// Sending one approved post to its team, shared by /api/linkedin-decide (fires the moment
// John approves) and /api/linkedin-dispatch (the safety net that catches anything approved
// but never sent). Each member gets the post in their own language, with Pratik and John cc'd.
import { syncTranslations, hashText } from './_translate.js';
import { OVERSIGHT, SITE, esc, sendMail, COPY, STREAM_LABEL } from './_email.js';

export async function sendPostToTeam({ url, headers, post, members, anthropicKey }) {
  const stream = post.audience || 'owners';
  const streamMembers = members.filter(m => (m.stream || 'owners') === stream && m.email && m.email.includes('@'));
  if (!streamMembers.length) return { stream, skipped: 'no members with an email on this stream' };

  // Refresh translations that are missing or made from older English.
  const langs = [...new Set(streamMembers.map(m => m.language || 'en'))].filter(l => l !== 'en');
  let translations = {}, retranslated = null;
  if (langs.length) {
    if (anthropicKey) {
      try {
        const sync = await syncTranslations({ apiKey: anthropicKey, url, headers, post, langs });
        if (sync.updated.length || sync.failed.length) retranslated = sync;
      } catch (e) { retranslated = { failed: [String((e && e.message) || e).slice(0, 200)] }; }
    }
    const tr = await fetch(
      `${url}/rest/v1/linkedin_posts?slug=eq.${encodeURIComponent(post.slug)}&audience=eq.${stream}&language=in.(${langs.join(',')})&select=language,post_text,edited_text,title,source_hash`,
      { headers });
    if (tr.ok) (await tr.json()).forEach(t => { translations[t.language] = t; });
  }

  const masterHash = hashText(post.edited_text || post.post_text);
  const forMember = (m) => {
    const lang = m.language || 'en';
    if (lang === 'en') return { text: post.edited_text || post.post_text, title: post.title, lang, translated: true, stale: false };
    const t = translations[lang];
    if (t) return { text: t.edited_text || t.post_text, title: t.title || post.title, lang, translated: true, stale: !!t.source_hash && t.source_hash !== masterHash };
    return { text: post.edited_text || post.post_text, title: post.title, lang, translated: false, stale: false };
  };

  // What is queued behind this one, for the "coming up" section.
  const ur = await fetch(
    `${url}/rest/v1/linkedin_posts?status=eq.approved&sent_at=is.null&audience=eq.${stream}&language=eq.en&day=gt.${post.day}&order=day.asc&select=day,title`,
    { headers });
  const upcoming = ur.ok ? await ur.json() : [];

  let sent = 0, failed = 0;
  const missingTranslations = [], staleTranslations = [], errors = [];
  for (const m of streamMembers) {
    const v = forMember(m);
    if (!v.translated) missingTranslations.push(`${m.name} (${v.lang})`);
    else if (v.stale) staleTranslations.push(`${m.name} (${v.lang})`);

    const mail = await sendMail({
      to: [m.email],
      cc: OVERSIGHT,
      subject: (COPY[v.lang] || COPY.en).subject(v.title),
      html: memberEmail({ member: m, post, text: v.text, lang: v.lang, stream, upcoming, translated: v.translated, stale: v.stale }),
    });
    if (!mail.ok) errors.push(`${m.name}: ${mail.error}`);

    await fetch(`${url}/rest/v1/linkedin_emails`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        post_id: post.id, post_slug: post.slug, post_title: post.title,
        member_name: `${m.name} (${v.lang}${v.translated ? '' : ', EN fallback'}, cc Pratik + John)`,
        member_email: m.email, status: mail.ok ? 'sent' : 'failed',
        error: mail.ok ? null : mail.error, resend_id: mail.id || null,
      }),
    });
    if (mail.ok) sent += 1; else failed += 1;
  }

  if (sent > 0) {
    await fetch(`${url}/rest/v1/linkedin_posts?id=eq.${post.id}`, {
      method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ sent_at: new Date().toISOString() }),
    });
  }

  return {
    stream, post: post.title, day: post.day, sent, failed, cc: OVERSIGHT.join(', '),
    ...(retranslated ? { retranslated } : {}),
    ...(missingTranslations.length ? { translations_missing: missingTranslations } : {}),
    ...(staleTranslations.length ? { translations_stale: staleTranslations } : {}),
    ...(errors.length ? { errors } : {}),
  };
}

// The member email: context first, then the post and its image, then what is coming next.
export function memberEmail({ member, post, text, lang, stream, upcoming, translated, stale }) {
  const c = COPY[lang] || COPY.en;
  const audience = (STREAM_LABEL[lang] || STREAM_LABEL.en)[stream] || stream;

  let warn = '';
  if (!translated) {
    warn = `<p style="margin:0 0 14px;font-size:13px;color:#8a1f1f;background:#FAEDED;border-radius:8px;padding:10px 12px">The ${esc(String(lang).toUpperCase())} version was not ready, so this is the English original. Please translate it before posting.</p>`;
  } else if (stale) {
    warn = `<p style="margin:0 0 14px;font-size:13px;color:#7a611c;background:#FBF3DF;border-radius:8px;padding:10px 12px">The English original was edited after this version was translated, so give it a quick read before posting.</p>`;
  }

  const img = post.image_url
    ? `<p style="margin:18px 0 6px;font-size:13px;color:#5a5f73">${esc(c.imageLabel)}</p>
       <img src="${SITE}${post.image_url}" alt="" style="width:100%;max-width:520px;border-radius:10px;display:block" />`
    : '';

  const next = (upcoming && upcoming.length)
    ? `<div style="margin-top:22px;border-top:1px solid #EDEBE6;padding-top:14px">
         <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#010221">${esc(c.nextLabel)}</p>
         <ul style="margin:0 0 8px;padding-left:18px;font-size:13px;color:#5a5f73">
           ${upcoming.slice(0, 3).map(u => `<li style="margin-bottom:3px">${esc(u.title || '')}</li>`).join('')}
         </ul>
         <p style="margin:0;font-size:13px;color:#8a8fa3">${esc(c.remaining(upcoming.length))}</p>
       </div>`
    : '';

  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN
      </div>
      <div style="padding:22px">
        <p style="margin:0 0 10px;font-size:15px;color:#010221">${esc(c.greeting(member.name))}</p>
        <p style="margin:0 0 10px;font-size:14px;color:#3a3f52">${esc(c.what)}</p>
        <p style="margin:0 0 12px;font-size:14px;color:#3a3f52">${esc(c.how)}</p>
        <p style="margin:0 0 16px;font-size:13px;color:#5a5f73;background:#F4F2EE;border-radius:8px;padding:10px 12px">${esc(c.goal ? c.goal(audience) : '')}</p>
        ${warn}
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#5B7FCC">${esc(c.postLabel)}</p>
        <div style="background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111;white-space:pre-wrap">${esc(text)}</div>
        ${img}
        ${next}
        <p style="margin:18px 0 0;font-size:13px;color:#5a5f73">${esc(c.reply)}</p>
      </div>
    </div>
  </div>`;
}
