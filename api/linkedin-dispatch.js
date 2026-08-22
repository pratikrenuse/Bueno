// GET or POST /api/linkedin-dispatch
// The daily send: for each stream, takes the next APPROVED post not yet sent and emails it
// (ready to copy) to that stream's active team members. Runs weekdays 15:00 UTC via Vercel
// cron, and manually from the dashboard's "Send now" button.
// ?dry=1 previews what would be sent without sending anything.
// Auth: team passcode (header/query), CRON_SECRET bearer if configured, or Vercel cron itself.

import { syncTranslations, hashText, getApiKey } from './_translate.js';
import { OVERSIGHT, SITE, esc, sendMail, COPY, STREAM_LABEL } from './_email.js';

export default async function handler(req, res) {
  try {
    const pass = req.headers['x-passcode'] || req.query.pass;
    const auth = req.headers['authorization'] || '';
    const isCron = !!req.headers['x-vercel-cron'] || (req.headers['user-agent'] || '').startsWith('vercel-cron');
    const cronOk = process.env.CRON_SECRET ? auth === `Bearer ${process.env.CRON_SECRET}` : isCron;
    if (pass !== process.env.INTERNAL_PASSCODE && !cronOk) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });
    const dry = req.query.dry === '1';
    if (!resendKey && !dry) return res.status(500).json({ error: 'Missing env var: RESEND_API_KEY. Add it in Vercel and redeploy.' });
    const from = process.env.RESEND_FROM || '24/7 Spain <onboarding@resend.dev>';
    const anthropicKey = getApiKey();
    const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

    const mr = await fetch(`${url}/rest/v1/team_members?active=eq.true&order=name.asc&select=*`, { headers: H });
    if (!mr.ok) return res.status(500).json({ error: `Supabase members ${mr.status}: ${await mr.text()}` });
    let members = (await mr.json()).filter(m => m.email && m.email.includes('@'));

    // ?member=Name sends to that one person only. Default: everyone.
    const only = (req.body && req.body.member) || req.query.member;
    if (only && only !== 'all') {
      members = members.filter(m => m.name.toLowerCase() === String(only).toLowerCase());
      if (!members.length) return res.status(400).json({ error: `No active team member with an email named "${only}".` });
    }

    const results = [];
    for (const stream of ['owners', 'agents', 'attorneys']) {
      const streamMembers = members.filter(m => (m.stream || 'owners') === stream);
      if (!streamMembers.length) { results.push({ stream, skipped: 'no members with email' }); continue; }

      const pr = await fetch(
        `${url}/rest/v1/linkedin_posts?status=eq.approved&sent_at=is.null&audience=eq.${stream}&language=eq.en&order=day.asc&limit=1&select=*`,
        { headers: H });
      if (!pr.ok) return res.status(500).json({ error: `Supabase posts ${pr.status}: ${await pr.text()}` });
      const post = (await pr.json())[0];
      if (!post) { results.push({ stream, skipped: 'no approved unsent posts' }); continue; }

      // The English master is what John approves. Each member receives that same post in
      // their own language. Before sending we refresh any translation that is missing or
      // stale (John edited the English after it was translated), so edits always carry through.
      const langs = [...new Set(streamMembers.map(m => m.language || 'en'))].filter(l => l !== 'en');
      let translations = {}, retranslated = null;
      if (langs.length) {
        if (anthropicKey && !dry) {
          try {
            const sync = await syncTranslations({ apiKey: anthropicKey, url, headers: H, post, langs });
            if (sync.updated.length || sync.failed.length) retranslated = sync;
          } catch (e) { retranslated = { failed: [String((e && e.message) || e).slice(0, 200)] }; }
        }
        const tr = await fetch(
          `${url}/rest/v1/linkedin_posts?slug=eq.${encodeURIComponent(post.slug)}&audience=eq.${stream}&language=in.(${langs.join(',')})&select=language,post_text,edited_text,title,source_hash`,
          { headers: H });
        if (!tr.ok) return res.status(500).json({ error: `Supabase translations ${tr.status}: ${await tr.text()}` });
        (await tr.json()).forEach(t => { translations[t.language] = t; });
      }
      const masterHash = hashText(post.edited_text || post.post_text);
      const forMember = (m) => {
        const lang = m.language || 'en';
        if (lang === 'en') return { text: post.edited_text || post.post_text, title: post.title, lang: 'en', translated: true, stale: false };
        const t = translations[lang];
        if (t) {
          // A translation whose source_hash no longer matches was made from older English.
          const stale = !!t.source_hash && t.source_hash !== masterHash;
          return { text: t.edited_text || t.post_text, title: t.title || post.title, lang, translated: true, stale };
        }
        return { text: post.edited_text || post.post_text, title: post.title, lang, translated: false, stale: false };
      };

      if (dry) {
        results.push({
          stream, would_send: post.title, day: post.day,
          to: streamMembers.map(m => `${m.name} (${forMember(m).translated ? (m.language || 'en') : (m.language || 'en') + ': TRANSLATION MISSING, would send English'})`),
        });
        continue;
      }

      // What is queued behind this one, for the "coming up" section of the email.
      const ur = await fetch(
        `${url}/rest/v1/linkedin_posts?status=eq.approved&sent_at=is.null&audience=eq.${stream}&language=eq.en&day=gt.${post.day}&order=day.asc&select=day,title`,
        { headers: H });
      const upcoming = ur.ok ? await ur.json() : [];

      let sent = 0, failed = 0, missingTranslations = [], staleTranslations = [];
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

        await fetch(`${url}/rest/v1/linkedin_emails`, {
          method: 'POST',
          headers: { ...H, Prefer: 'return=minimal' },
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
          method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
          body: JSON.stringify({ sent_at: new Date().toISOString() }),
        });
      }
      results.push({ stream, post: post.title, day: post.day, sent, failed, cc: OVERSIGHT.join(', '),
        ...(retranslated ? { retranslated } : {}),
        ...(missingTranslations.length ? { translations_missing: missingTranslations } : {}),
        ...(staleTranslations.length ? { translations_stale: staleTranslations } : {}) });
    }

    res.json({ ok: true, dry, ...(only && only !== 'all' ? { sent_to_only: only } : {}), results });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}

// The member email, in their language: context first, then the post and its image,
// then what is coming next.
function memberEmail({ member, post, text, lang, stream, upcoming, translated, stale }) {
  const c = COPY[lang] || COPY.en;
  const audience = (STREAM_LABEL[lang] || STREAM_LABEL.en)[stream] || stream;

  let warn = '';
  if (!translated) {
    warn = `<p style="margin:0 0 14px;font-size:13px;color:#8a1f1f;background:#FAEDED;border-radius:8px;padding:10px 12px">The ${esc(String(lang).toUpperCase())} version was not ready, so this is the English original. Please translate it before posting.</p>`;
  } else if (stale) {
    warn = `<p style="margin:0 0 14px;font-size:13px;color:#7a611c;background:#FBF3DF;border-radius:8px;padding:10px 12px">The English original was edited after this version was translated, so give it a quick read before posting.</p>`;
  }

  const context = `
    <p style="margin:0 0 10px;font-size:14px;color:#3a3f52">${esc(c.what)}</p>
    <p style="margin:0 0 6px;font-size:14px;color:#3a3f52">${esc(c.how)}</p>
    <p style="margin:0 0 16px;font-size:13px;color:#8a8fa3">${esc(c.dayLine(post.day, audience))}</p>`;

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
        ${context}
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
