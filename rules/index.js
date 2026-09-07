// The rules base. Every rate, threshold and deadline any tool displays comes from here.
// Nothing is hardcoded in a tool. See ../CORRECTNESS_PROTOCOL.md.
//
// Two build gates guard this folder: validate_rules.mjs (schema, sources, review dates)
// and test_rules.mjs (official worked examples and threshold boundaries). Both run in CI.

import irnr from './irnr.json';
import deadlines from './deadlines.json';
import lateFiling from './late-filing.json';
import itpAjd from './itp-ajd.json';
import vatIgic from './vat-igic.json';
import wealthTax from './wealth-tax.json';
import plusvalia from './plusvalia.json';
import taxResidency from './tax-residency.json';
import lphCommunity from './lph-community.json';
import rentalRegistry from './rental-registry.json';
import regionalTouristLicence from './regional-tourist-licence.json';
import lauSeasonal from './lau-seasonal.json';
import parteViajeros from './parte-viajeros.json';
import immigration from './immigration-documents.json';
import schengen from './schengen-short-stay.json';
import squatting from './squatting.json';
import succession from './succession.json';
import consorcio from './insurance-consorcio.json';
import epc from './epc.json';

const FILES = [
  irnr, deadlines, lateFiling, itpAjd, vatIgic, wealthTax, plusvalia, taxResidency,
  lphCommunity, rentalRegistry, regionalTouristLicence, lauSeasonal, parteViajeros,
  immigration, schengen, squatting, succession, consorcio, epc,
];

// Flatten every rule that carries an id into one lookup.
const INDEX = {};
for (const file of FILES) {
  for (const r of file.rules || []) if (r.id) INDEX[r.id] = r;
}

export const RULES = INDEX;

// The only way a tool should read a rule.
//
// Throws on an unknown id, because a typo that silently renders nothing is worse than a
// build that stops. Throws on an unverified rule, because the protocol says an unverified
// figure must never reach a user; a tool that wants to handle that case gracefully should
// call `ruleStatus` first and show its own "not covered" state.
export function rule(id) {
  const r = INDEX[id];
  if (!r) throw new Error(`rules: unknown id "${id}"`);
  if (r.status === 'unverified' || r.status === 'annulled' || r.status === 'myth') {
    throw new Error(`rules: "${id}" has status "${r.status}" and must not be displayed as a value`);
  }
  return r;
}

export function ruleStatus(id) {
  return INDEX[id] ? INDEX[id].status : 'missing';
}

// Regional tables are shaped differently from single rules, so they get their own readers.
export const itpResale = itpAjd.itp_resale;
export const ajdNewBuild = itpAjd.ajd_new_build;
export const valorReferencia = itpAjd.minimum_base;
export const touristRegions = regionalTouristLicence.rules;

export function verifiedItpRegions() {
  return itpResale.filter(r => r.status === 'verified' || r.status === 'partial');
}
export function unverifiedItpRegions() {
  return itpResale.filter(r => r.status === 'unverified').map(r => r.region);
}
