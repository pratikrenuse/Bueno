// Internal page for the Bueno Club partner list: restaurants, cafes and shops in the towns
// where Nordic owners live. No meta.js on purpose, so it never appears on the home page.
// Backed by api/_venues.js through api/directory.js (?venues=...).
//
// Three steps, each safe to repeat:
//   1. Run the searches. Pages already fetched come from the cache and cost nothing.
//   2. Collect the list, a few towns per request so nothing times out.
//   3. Download the CSV, one row per venue, best first.
// Google's terms: delete the stored search data within 30 days of the harvest.
import React, { useState } from 'react';

const COLS = ['tier', 'score', 'name', 'category', 'google_type', 'town', 'region', 'phone_intl', 'phone', 'email', 'website',
  'instagram', 'facebook', 'rating', 'reviews', 'price', 'nordic_reviews', 'foreign_reviews', 'review_languages', 'nordic_mention',
  'nordic_site', 'nordic_name', 'site_languages', 'offer_signals', 'offer_snippet', 'chain', 'address', 'maps_url', 'found_by', 'place_id'];

const cell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function dedupe(rows) {
  const byId = new Map();
  for (const r of rows) {
    const prev = byId.get(r.place_id);
    if (!prev || r.score > prev.score) byId.set(r.place_id, r);
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}

const S = {
  page: { minHeight: '100vh', background: '#010221', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: 24 },
  card: { background: '#fff', padding: 32, borderRadius: 12, maxWidth: 560, width: '100%' },
  h: { margin: '0 0 8px', color: '#010221', fontSize: 26 },
  p: { margin: '0 0 20px', color: '#333', fontSize: 15, lineHeight: 1.5 },
  input: { width: '100%', padding: 12, fontSize: 16, border: '1px solid #ccc', borderRadius: 8, boxSizing: 'border-box' },
  btn: { marginTop: 12, width: '100%', padding: 16, fontSize: 17, background: '#5B7FCC', color: '#fff', border: 0, borderRadius: 8, cursor: 'pointer' },
  btnQuiet: { marginTop: 12, width: '100%', padding: 14, fontSize: 16, background: '#fff', color: '#010221', border: '1px solid #5B7FCC', borderRadius: 8, cursor: 'pointer' },
  status: { margin: '16px 0 0', color: '#010221', fontSize: 14, lineHeight: 1.5 },
  error: { margin: '16px 0 0', color: '#9b1c1c', background: '#fdecec', padding: 12, borderRadius: 8, fontSize: 14, lineHeight: 1.5 },
};

export default function InternalClub() {
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);

  const call = async (url) => {
    const r = await fetch(url, { headers: { 'x-passcode': pass } });
    if (r.status === 401) throw new Error('That passcode was not accepted.');
    const text = await r.text();
    try { return JSON.parse(text); } catch { throw new Error(`The server answered with something that is not JSON: ${text.slice(0, 160)}`); }
  };

  const pool = async (jobs, n = 6) => {
    let i = 0;
    const out = [];
    let stop = null;
    await Promise.all(Array.from({ length: n }, async () => {
      while (i < jobs.length && !stop) {
        const k = i++;
        out[k] = await jobs[k]();
        if (out[k] && out[k].error === 'daily_cap') stop = 'daily_cap';
      }
    }));
    return { out, stop };
  };

  const runSearches = async () => {
    setBusy(true); setError('');
    const progress = { done: 0, total: 0, venues: 0, failed: 0, lastError: '' };
    window.__clubProgress = progress;
    try {
      const meta = await call('/api/directory?venues=towns');
      if (!meta.towns) throw new Error(meta.error || 'The endpoint did not answer as expected.');
      const run = async (town, q, page, token) => {
        try {
          const j = await call(`/api/directory?venues=run&town=${town}&q=${q}&page=${page}` + (token ? `&token=${encodeURIComponent(token)}` : ''));
          progress.done += 1;
          if (j.error) { progress.failed += 1; progress.lastError = `${town}: ${j.error} ${j.detail || ''}`.trim(); }
          progress.venues += j.found || 0;
          setStatus(`Searching. ${progress.done} of about ${progress.total} searches done, ${progress.venues} venues read.`);
          return { ...j, town, q };
        } catch (e) {
          progress.failed += 1; progress.lastError = String(e.message || e);
          return { error: String(e.message || e), town, q };
        }
      };
      // Restaurants first in every town, then the shops, so a stop at the daily limit
      // still leaves the core of the club covered everywhere.
      const order = meta.queries.map((q, i) => i);
      const jobs = [];
      for (const qi of order) for (const t of meta.towns) jobs.push(() => run(t, qi, 0));
      progress.total = jobs.length;
      const first = await pool(jobs);
      let capped = first.stop;
      if (!capped) {
        const deep = first.out.filter(r => r && r.next && meta.queries[r.q] && meta.queries[r.q].pages > 1);
        progress.total += deep.length;
        const second = await pool(deep.map(r => () => run(r.town, r.q, 1, r.next)));
        capped = second.stop;
        if (!capped) {
          const deeper = second.out.filter(r => r && r.next && meta.queries[r.q] && meta.queries[r.q].pages > 2);
          progress.total += deeper.length;
          const third = await pool(deeper.map(r => () => run(r.town, r.q, 2, r.next)));
          capped = third.stop;
        }
      }
      progress.finished = true;
      progress.capped = !!capped;
      setStatus(capped
        ? `Stopped at the daily limit after ${progress.done} searches. Everything fetched is saved. Press this again tomorrow to finish.`
        : `Searching finished. ${progress.done} searches, ${progress.failed} failed. Now press Collect the list.`);
      if (progress.failed) setError(`Some searches failed. The last error was: ${progress.lastError}`);
    } catch (e) {
      progress.finished = true; progress.fatal = String(e.message || e);
      setError(String(e.message || e));
    }
    setBusy(false);
  };

  const collect = async () => {
    setBusy(true); setError('');
    try {
      const meta = await call('/api/directory?venues=towns');
      if (!meta.towns) throw new Error(meta.error || 'The endpoint did not answer as expected.');
      const all = [];
      for (let i = 0; i < meta.towns.length; i += 4) {
        const batch = meta.towns.slice(i, i + 4).join(',');
        const j = await call(`/api/directory?venues=export&format=rows&towns=${batch}`);
        if (j.error) throw new Error(j.error);
        if (j.rows) all.push(...j.rows);
        setStatus(`Collected ${all.length} venue records.`);
      }
      const list = dedupe(all);
      setRows(list);
      window.__clubRows = list;
      const a = list.filter(r => r.tier === 'A').length;
      const offers = list.filter(r => r.offer_signals).length;
      setStatus(`${list.length} venues. ${a} are Tier A, ${offers} already advertise an offer, card or partnership. Press Download to save the file.`);
    } catch (e) {
      setError(String(e.message || e));
    }
    setBusy(false);
  };

  const download = () => {
    const csv = [COLS.join(','), ...rows.map(r => COLS.map(c => cell(r[c])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bueno-club-venues.csv';
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Saved bueno-club-venues.csv with ${rows.length} venues.`);
  };

  const wipe = async () => {
    setBusy(true); setError('');
    try {
      const j = await call('/api/directory?venues=purge');
      setStatus(`Stored search data deleted (${j.deleted || 0} files). The CSV you downloaded is unaffected.`);
    } catch (e) {
      setError(String(e.message || e));
    }
    setBusy(false);
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.h}>Bueno Club partner list</h1>
        <p style={S.p}>
          This page searches Google for restaurants, cafes and shops in the towns where Nordic
          owners live, reads each venue's own website for offers and contact details, and builds
          the partner list. Searches already paid for are never charged twice.
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
        {error ? <p style={S.error}>{error}</p> : null}
      </div>
    </div>
  );
}
