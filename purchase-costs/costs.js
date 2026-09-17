// What a buyer pays on top of the price, by region.
//
// No rate is typed in this file. The regional tables arrive from rules/itp-ajd.json and the
// IVA and IGIC figures from rules/vat-igic.json, both passed in by the caller, so this runs
// under plain node for the tests.
//
// What it gets right, because these are the mistakes the published calculators make:
//   1. A banded region is taxed slice by slice, never at one rate on the whole price.
//   2. A region we have no confirmed rate for says so. It never falls back to a guess.
//   3. Reduced rates are not offered. Almost all of them need the home to be the buyer's
//      main residence, which a non-resident's holiday home is not.
//   4. The tax is computed on the price entered, and the page says it is a minimum: the base
//      is the higher of the price and the Catastro reference value.
//   5. A new home on the Canary Islands pays IGIC, not IVA.

// The AJD table spells three regions differently from the ITP table.
const AJD_ALIAS = {
  'Principado de Asturias': 'Asturias',
  'Comunidad Foral de Navarra': 'Navarra',
};

const usable = s => s === 'verified' || s === 'partial';

// Tax on a price under a banded scale.
// Two shapes exist in the rules file: rows with from/cumulative_cuota/rate, and rows with
// upto/above/rate. Both are progressive by tranche.
export function bandedTax(price, bands) {
  if (!Array.isArray(bands) || !bands.length) return null;
  if (bands[0].cumulative_cuota !== undefined) {
    let row = bands[0];
    for (const b of bands) if (price > Math.floor(b.from)) row = b;
    const floor = Math.floor(row.from);
    return round2(row.cumulative_cuota + (price - floor) * row.rate / 100);
  }
  let tax = 0;
  let lower = 0;
  for (const b of bands) {
    const upper = b.upto ?? Infinity;
    if (price > lower) tax += (Math.min(price, upper) - lower) * b.rate / 100;
    lower = upper;
    if (b.above !== undefined) break;
  }
  return round2(tax);
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Valencia: the 9 percent general rate is confirmed, but whether the 11 percent band above
// one million euros survived the June 2026 cut is not. Above that line we say nothing.
const VALENCIA_UNCONFIRMED_ABOVE = 1000000;

/**
 * @param {object} a  { region, kind: 'resale'|'newbuild', price }
 * @param {object} T  { itp: itp_resale[], ajd: ajd_new_build[], iva: number, igic: number }
 * @returns lines, total, and what could not be covered
 */
export function computeCosts(a, T) {
  const price = Number(a.price) || 0;
  const out = { lines: [], total: 0, gaps: [], caveats: [], sources: [] };
  if (!(price > 0) || !a.region) return out;

  const add = (key, amount, rate, source, status, notes) => {
    out.lines.push({ key, amount, rate });
    out.total = round2(out.total + amount);
    if (source) out.sources.push({ key, source });
    if (status === 'partial' && notes) out.caveats.push({ key, notes });
  };

  if (a.kind !== 'newbuild') {
    const r = T.itp.find(x => x.region === a.region);
    if (!r || !usable(r.status)) {
      out.gaps.push('itp');
      return out;
    }
    if (a.region === 'Comunitat Valenciana' && price > VALENCIA_UNCONFIRMED_ABOVE) {
      out.gaps.push('itp_valencia_high');
      return out;
    }
    const amount = r.banded && r.bands ? bandedTax(price, r.bands) : round2(price * r.general / 100);
    if (amount == null) { out.gaps.push('itp'); return out; }
    const effective = round2((amount / price) * 100);
    add('itp', amount, r.banded && r.bands ? { effective, banded: true } : { flat: r.general }, r.source, r.status, r.notes);
    if (a.region === 'Extremadura') out.caveats.push({ key: 'itp', notes: r.notes });
    return out;
  }

  // New build: indirect tax on the price, then stamp duty on the deed.
  if (a.region === 'Ceuta' || a.region === 'Melilla') {
    out.gaps.push('vat_ceuta_melilla');
  } else if (a.region === 'Canarias') {
    add('igic', round2(price * T.igic / 100), { flat: T.igic }, null);
  } else {
    add('iva', round2(price * T.iva / 100), { flat: T.iva }, null);
  }

  const name = AJD_ALIAS[a.region] || a.region;
  const j = T.ajd.find(x => x.region === name);
  if (!j || !usable(j.status) || typeof j.rate !== 'number') {
    out.gaps.push('ajd');
  } else {
    add('ajd', round2(price * j.rate / 100), { flat: j.rate }, j.source, j.status, j.notes);
  }
  return out;
}
