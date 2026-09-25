// One-off internal page for the estate-agent outreach list. No meta.js on purpose, so it
// never appears as a card on the home page. The whole folder, plus api/_leads.js and the
// three lines it adds to api/directory.js, gets deleted once the CSV is in hand.
//
// It does three things, in order, and each one can be repeated safely:
//   1. Run the searches. Pages already fetched are served from the cache and cost nothing.
//   2. Collect the stored results, a few towns per request so nothing times out.
//   3. Download the CSV, deduplicated by agency and by email address, best first.
import React, { useState } from 'react';

// Towns that were not in the first pass.
const NEW_TOWNS = ['mahon', 'ciutadella', 'alcudia', 'manacor', 'santanyi', 'santa-eulalia',
  'san-antonio', 'costa-teguise', 'arrecife', 'caleta-de-fuste', 'puerto-del-rosario',
  'morro-jable', 'playa-de-las-americas', 'golf-del-sur', 'los-gigantes', 'el-medano',
  'cartagena', 'torre-pacheco', 'santiago-de-la-ribera', 'murcia', 'el-campello',
  'gran-alacant', 'elche', 'gandia', 'oliva', 'garrucha', 'almeria', 'la-cala-de-mijas',
  'alhaurin-el-grande', 'coin', 'ronda', 'rincon-de-la-victoria', 'velez-malaga',
  'salobrena', 'blanes', 'platja-daro', 'lescala', 'begur', 'salou', 'cambrils',
  'barcelona', 'madrid'];

// Inland towns and the two cities do not get the Nordic-language searches.
const INLAND = ['murcia', 'elche', 'ronda', 'coin', 'alhaurin-el-grande', 'madrid', 'barcelona'];

// Towns from the first pass that are worth a German and Dutch search.
const DE_NL_TOWNS = ['alfaz-del-pi', 'albir', 'altea', 'benidorm', 'calpe', 'moraira', 'javea',
  'denia', 'torrevieja', 'orihuela-costa', 'ciudad-quesada', 'rojales', 'guardamar', 'alicante',
  'los-alcazares', 'mazarron', 'mojacar', 'vera', 'nerja', 'torremolinos', 'benalmadena',
  'fuengirola', 'mijas', 'marbella', 'estepona', 'san-pedro-alcantara', 'malaga', 'palma',
  'santa-ponsa', 'maspalomas', 'playa-del-ingles', 'costa-adeje', 'los-cristianos',
  'empuriabrava', 'roses', 'lloret-de-mar'];

// And the core Nordic towns a Danish search.
const DA_TOWNS = ['alfaz-del-pi', 'altea', 'benidorm', 'calpe', 'alicante', 'torrevieja',
  'orihuela-costa', 'malaga', 'benalmadena', 'fuengirola', 'marbella', 'las-palmas',
  'playa-del-ingles', 'arguineguin', 'costa-adeje', 'palma'];

const COLS = ['tier', 'score', 'agency', 'email', 'town', 'region', 'website', 'site_languages',
  'nordic_site', 'nordic_name', 'nordic_reviews', 'resale', 'newbuild_only', 'franchise',
  'emails_all', 'found_by', 'place_id'];

const cell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function toCsv(rows) {
  const byId = new Map();
  for (const r of rows) {
    const prev = byId.get(r.place_id);
    if (!prev || r.score > prev.score) byId.set(r.place_id, r);
  }
  const byEmail = new Map();
  for (const r of byId.values()) {
    if (!r.email) continue;
    const prev = byEmail.get(r.email);
    if (!prev || r.score > prev.score) byEmail.set(r.email, r);
  }
  const list = [...byEmail.values()].sort((a, b) => b.score - a.score);
  return {
    csv: [COLS.join(','), ...list.map(r => COLS.map(c => cell(r[c])).join(','))].join('\n'),
    count: list.length,
    tierA: list.filter(r => r.tier === 'A').length,
  };
}

const S = {
  page: { minHeight: '100vh', background: '#010221', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: 24 },
  card: { background: '#fff', padding: 32, borderRadius: 12, maxWidth: 520, width: '100%' },
  h: { margin: '0 0 8px', color: '#010221', fontSize: 26 },
  p: { margin: '0 0 20px', color: '#333', fontSize: 15, lineHeight: 1.5 },
  input: { width: '100%', padding: 12, fontSize: 16, border: '1px solid #ccc', borderRadius: 8, boxSizing: 'border-box' },
  btn: { marginTop: 12, width: '100%', padding: 16, fontSize: 17, background: '#5B7FCC', color: '#fff', border: 0, borderRadius: 8, cursor: 'pointer' },
  btnQuiet: { marginTop: 12, width: '100%', padding: 14, fontSize: 16, background: '#fff', color: '#010221', border: '1px solid #5B7FCC', borderRadius: 8, cursor: 'pointer' },
  status: { margin: '16px 0 0', color: '#010221', fontSize: 14, lineHeight: 1.5 },
};

export default function InternalLeads() {
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState([]);

  const headers = () => ({ 'x-passcode': pass });

  const call = async (url) => {
    const r = await fetch(url, { headers: headers() });
    if (r.status === 401) throw new Error('That passcode was not accepted.');
    return r.json();
  };

  const pool = async (jobs, n = 8) => {
    let i = 0;
    const out = [];
    let stop = null;
    await Promise.all(Array.from({ length: n }, async () => {
      while (i < jobs.length && !stop) {
        const k = i++;
        out[k] = await jobs[k]();
        if (out[k] && (out[k].error === 'daily_cap' || out[k].error === 'total_cap')) stop = out[k].error;
      }
    }));
    return { out, stop };
  };

  const runSearches = async () => {
    setBusy(true);
    try {
      const meta = await call('/api/directory?leads=towns');
      if (!meta.towns) throw new Error('The endpoint did not answer as expected.');
      let done = 0;
      const run = async (town, q, page, token) => {
        try {
          const j = await call(`/api/directory?leads=run&town=${town}&q=${q}&page=${page}` + (token ? `&token=${encodeURIComponent(token)}` : ''));
          done += 1;
          setStatus(`Searching. ${done} searches done.`);
          return { ...j, town, q };
        } catch (e) {
          return { error: String(e.message || e), town, q };
        }
      };
      const jobs = [];
      for (const t of NEW_TOWNS) { jobs.push(() => run(t, 0, 0)); jobs.push(() => run(t, 1, 0)); }
      for (const t of NEW_TOWNS.filter(x => !INLAND.includes(x))) { jobs.push(() => run(t, 2, 0)); jobs.push(() => run(t, 3, 0)); }
      for (const t of DE_NL_TOWNS) { jobs.push(() => run(t, 4, 0)); jobs.push(() => run(t, 5, 0)); }
      for (const t of DA_TOWNS) jobs.push(() => run(t, 6, 0));

      const first = await pool(jobs);
      const deeper = first.out.filter(r => r && r.next && (r.found || 0) >= 12);
      const second = await pool(deeper.map(r => () => run(r.town, r.q, 1, r.next)));
      const capped = first.stop || second.stop;
      setStatus(capped
        ? `Stopped at the daily limit after ${done} searches. Everything fetched is saved. Press this again tomorrow to finish the rest.`
        : `Searching finished. ${done} searches. Now press Collect the list.`);
    } catch (e) {
      setStatus(String(e.message || e));
    }
    setBusy(false);
  };

  const collect = async () => {
    setBusy(true);
    try {
      const meta = await call('/api/directory?leads=towns');
      const all = [];
      for (let i = 0; i < meta.towns.length; i += 6) {
        const batch = meta.towns.slice(i, i + 6).join(',');
        const j = await call(`/api/directory?leads=export&format=rows&towns=${batch}`);
        if (j.rows) all.push(...j.rows);
        setStatus(`Collected ${all.length} agency records.`);
      }
      setRows(all);
      const { count, tierA } = toCsv(all);
      setStatus(`${all.length} records collected. ${count} agencies have an email address, ${tierA} of them Tier A. Press Download to save the file.`);
    } catch (e) {
      setStatus(String(e.message || e));
    }
    setBusy(false);
  };

  const download = () => {
    const { csv, count } = toCsv(rows);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spain-agents-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Saved spain-agents-leads.csv with ${count} agencies.`);
  };

  const wipe = async () => {
    setBusy(true);
    try {
      const j = await call('/api/directory?leads=purge');
      setStatus(`Stored search data deleted (${j.deleted || 0} files). The CSV you downloaded is unaffected.`);
    } catch (e) {
      setStatus(String(e.message || e));
    }
    setBusy(false);
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.h}>Estate agent list</h1>
        <p style={S.p}>
          This page is a one-off. It searches Google for estate agencies, reads their websites for
          email addresses, and builds the outreach list. Searches already paid for are never
          charged twice.
        </p>
        <input
          style={S.input}
          type="password"
          value={pass}
          placeholder="Passcode"
          onChange={e => setPass(e.target.value)}
        />
        <button style={S.btn} disabled={busy || !pass} onClick={runSearches}>
          1. Run the searches
        </button>
        <button style={S.btn} disabled={busy || !pass} onClick={collect}>
          2. Collect the list
        </button>
        <button style={S.btnQuiet} disabled={busy || !rows.length} onClick={download}>
          3. Download the CSV
        </button>
        <button style={S.btnQuiet} disabled={busy || !pass} onClick={wipe}>
          Delete the stored search data
        </button>
        {status ? <p style={S.status}>{status}</p> : null}
      </div>
    </div>
  );
}
