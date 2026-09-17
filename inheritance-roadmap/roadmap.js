// The inheritance roadmap, as a pure function.
//
// It answers three questions in order, because that is the order in which getting one
// wrong spoils the next:
//   1. Which country's succession law governs the estate.
//   2. Which inheritance tax rules the heirs may use.
//   3. What has to be gathered and filed, by when.
//
// No figure is typed here. Months and working days arrive in R from the rules base.
// The roadmap is written in English and Spanish; the client letter is in letter.js.

import { addMonths } from '../sale-tax/calc.js';

export const DOC_LANGS = ['en', 'es'];

// The regions a tool must branch on for civil law. Held in the rules base as
// succession.foral; the page passes the list in.
export function lawOutcome(a) {
  if (a.choice === 'yes' && a.nationality === 'other') return 'nationality';
  if (a.residence === 'abroad') return 'residence_abroad';
  return 'spanish';
}

export function taxOutcome(a) {
  if (a.heirs === 'spain') return 'resident_heirs';
  return a.residence === 'spain' ? 'nonres_heirs_resident_deceased' : 'nonres_heirs_nonresident_deceased';
}

const T = {
  en: {
    law_t: 'Which succession law applies',
    law_nationality: 'The will chose the law of the deceased’s nationality, so that law governs the whole estate, including the Spanish property. Spanish forced heirship rules do not apply.',
    law_residence_abroad: 'With no choice of law in a will, the law of the country where the deceased habitually lived at death governs the whole estate, including the Spanish property.',
    law_spanish: 'The deceased lived in Spain and made no choice of another law, so Spanish law governs the estate.',
    law_unsure: 'Check every will for a clause choosing the law of the deceased’s nationality. It changes the answer above.',
    foral: 'Spanish law is not one law. If the deceased had civil neighbourhood in {foral}, that region’s own succession law applies instead of the Civil Code. Confirm it before advising on shares.',
    legitima: 'Under the Civil Code, children and descendants are entitled to two thirds of the estate, of which one third may be used to favour some of them. One third is free.',
    spouse: 'A surviving spouse who inherits alongside children takes the life interest (usufruct) in the third used to favour descendants.',
    gananciales: 'If the marriage was under a community property regime, split the community first. Only the deceased’s half, plus their private assets, forms the estate.',
    tax_t: 'Which inheritance tax rules the heirs can use',
    tax_nonres_heirs_resident_deceased: 'Heirs who do not live in Spain may choose between the state rules and the rules of {region}, where the deceased lived. They are not stuck with the state rules.',
    tax_nonres_heirs_nonresident_deceased: 'Heirs who do not live in Spain may choose between the state rules and the rules of {region}, the region where the greatest value of the Spanish assets is located.',
    tax_resident_heirs: 'Heirs resident in Spain are taxed under regional rules. Which region applies depends on where the deceased lived; confirm it with the adviser handling the return.',
    tax_region_missing: 'Choose the region to see which rules apply.',
    tax_state_scale: 'The state scale runs from {bottom} percent to {top} percent, before the multipliers for kinship and existing wealth. Regional allowances can reduce the bill sharply, so compare both before filing.',
    tax_insurance: 'Life insurance paid to someone who is not an heir can only be taxed under the state rules.',
    tax_model: 'Non-resident heirs file the inheritance tax return on Modelo 650.',
    dl_t: 'Deadlines',
    dl_isd: 'Inheritance tax: within {m} months of death{d}. An extension of a further {e} months can be requested before that deadline runs out.',
    dl_pv: 'Plusvalía on the Spanish property: within {m} months of death{d}, extendable to {x} months if requested within the first {m}.',
    by: ' (by {d})',
    docs_t: 'Documents and steps',
    who: { heir: 'Heirs', lawyer: 'Lawyer', notary: 'Notary', gestor: 'Gestor', bank: 'Bank' },
    d_death: 'Death certificate from the country of death, with an apostille and a sworn translation.',
    d_ultimas: 'Certificate from the Spanish General Registry of Last Wills, which shows whether a Spanish will exists.',
    d_will: 'Every will, Spanish or foreign. A foreign will needs an apostille and a sworn translation.',
    d_foreignlaw: 'Evidence of the foreign law that governs the estate, or a European Certificate of Succession where the country issues one.',
    d_nie: 'An NIE for every heir.',
    d_property: 'The title deed, the latest IBI receipt and the Catastro reference value of the property.',
    d_bank: 'A certificate of the balances held in Spanish accounts on the date of death.',
    d_acceptance: 'The deed of acceptance and division of the inheritance, signed before a Spanish notary.',
    d_isd: 'The inheritance tax return, filed and paid within the deadline.',
    d_pv: 'The plusvalía return to the town hall where the property is.',
    d_registry: 'Registration of the heirs as owners at the Land Registry.',
    d_210: 'From the next year, each heir who does not live in Spain files the annual non-resident return for the property.',
  },
  es: {
    law_t: 'Qué ley sucesoria se aplica',
    law_nationality: 'El testamento eligió la ley de la nacionalidad del causante, que rige toda la sucesión, incluido el inmueble en España. No se aplican las legítimas españolas.',
    law_residence_abroad: 'Sin elección de ley en testamento, rige toda la sucesión la ley del país de residencia habitual del causante al fallecer, incluido el inmueble en España.',
    law_spanish: 'El causante residía en España y no eligió otra ley, por lo que rige la ley española.',
    law_unsure: 'Revise todos los testamentos por si contienen una elección de la ley de la nacionalidad. Cambiaría la respuesta anterior.',
    foral: 'La ley española no es única. Si el causante tenía vecindad civil en {foral}, se aplica el derecho civil propio de esa comunidad en lugar del Código Civil. Confírmelo antes de calcular cuotas.',
    legitima: 'Según el Código Civil, la legítima de hijos y descendientes es de dos tercios de la herencia, de los que un tercio puede destinarse a mejora. Un tercio es de libre disposición.',
    spouse: 'El cónyuge viudo que concurre con hijos recibe el usufructo del tercio de mejora.',
    gananciales: 'Si el matrimonio estaba en régimen de gananciales, liquide primero la sociedad. Solo la mitad del causante, más sus bienes privativos, forma la herencia.',
    tax_t: 'Qué normativa del impuesto pueden aplicar los herederos',
    tax_nonres_heirs_resident_deceased: 'Los herederos no residentes pueden optar entre la normativa estatal y la de {region}, donde residía el causante.',
    tax_nonres_heirs_nonresident_deceased: 'Los herederos no residentes pueden optar entre la normativa estatal y la de {region}, la comunidad donde se sitúa el mayor valor de los bienes en España.',
    tax_resident_heirs: 'Los herederos residentes tributan según normativa autonómica. La comunidad depende de la residencia del causante; confírmelo con quien presente la autoliquidación.',
    tax_region_missing: 'Elija la comunidad para ver qué normativa se aplica.',
    tax_state_scale: 'La tarifa estatal va del {bottom} por ciento al {top} por ciento, antes de los coeficientes por parentesco y patrimonio previo. Las reducciones autonómicas pueden rebajar mucho la cuota, así que compare ambas antes de presentar.',
    tax_insurance: 'El seguro de vida cobrado por quien no es heredero solo puede tributar con la normativa estatal.',
    tax_model: 'Los herederos no residentes presentan la autoliquidación en el Modelo 650.',
    dl_t: 'Plazos',
    dl_isd: 'Impuesto sobre Sucesiones: en {m} meses desde el fallecimiento{d}. Puede pedirse una prórroga de otros {e} meses antes de que venza el plazo.',
    dl_pv: 'Plusvalía del inmueble: en {m} meses desde el fallecimiento{d}, prorrogable hasta {x} meses si se solicita dentro de los primeros {m}.',
    by: ' (hasta el {d})',
    docs_t: 'Documentos y pasos',
    who: { heir: 'Herederos', lawyer: 'Abogado', notary: 'Notario', gestor: 'Gestor', bank: 'Banco' },
    d_death: 'Certificado de defunción del país del fallecimiento, apostillado y con traducción jurada.',
    d_ultimas: 'Certificado del Registro General de Actos de Última Voluntad, que indica si existe testamento en España.',
    d_will: 'Todos los testamentos, españoles o extranjeros. El extranjero necesita apostilla y traducción jurada.',
    d_foreignlaw: 'Prueba de la ley extranjera que rige la sucesión, o un certificado sucesorio europeo si el país lo expide.',
    d_nie: 'NIE de cada heredero.',
    d_property: 'La escritura de propiedad, el último recibo del IBI y el valor de referencia del Catastro.',
    d_bank: 'Certificado de saldos de las cuentas en España a la fecha del fallecimiento.',
    d_acceptance: 'Escritura de aceptación y adjudicación de herencia ante notario español.',
    d_isd: 'Autoliquidación del Impuesto sobre Sucesiones, presentada y pagada en plazo.',
    d_pv: 'Declaración de plusvalía en el ayuntamiento donde está el inmueble.',
    d_registry: 'Inscripción de los herederos en el Registro de la Propiedad.',
    d_210: 'Desde el año siguiente, cada heredero no residente presenta la declaración anual de no residentes por el inmueble.',
  },
};

const DOCS = [
  ['d_death', ['heir', 'lawyer']],
  ['d_ultimas', ['lawyer', 'gestor']],
  ['d_will', ['heir', 'lawyer']],
  ['d_foreignlaw', ['lawyer'], a => lawOutcome(a) !== 'spanish'],
  ['d_nie', ['heir', 'gestor'], a => a.heirs !== 'spain'],
  ['d_property', ['heir', 'gestor']],
  ['d_bank', ['bank']],
  ['d_acceptance', ['notary', 'lawyer']],
  ['d_isd', ['gestor', 'lawyer']],
  ['d_pv', ['gestor']],
  ['d_registry', ['notary', 'gestor']],
  ['d_210', ['heir', 'gestor'], a => a.heirs !== 'spain'],
];

function fill(s, v) {
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : ''));
}

/**
 * @param a  answers: residence, deceasedRegion, choice, nationality, heirs, assetsRegion, married, death
 * @param R  { isdMonths, isdExtension, pvMonths, pvExtendTo, stateBottom, stateTop, foral: [] }
 * @param regionLabel  display name for a region key
 */
export function buildRoadmap(a, R, lang = 'en', fmtDate = x => x, regionLabel = x => x) {
  const t = T[lang] || T.en;
  const law = lawOutcome(a);
  const lawLines = [t[`law_${law}`]];
  if (a.choice === 'unsure' || a.choice === 'nowill') lawLines.push(t.law_unsure);
  if (law === 'spanish') {
    lawLines.push(fill(t.foral, { foral: R.foral.join(', ') }));
    lawLines.push(t.legitima);
    if (a.married === 'yes') lawLines.push(t.spouse);
  }
  if (a.married === 'yes') lawLines.push(t.gananciales);

  const tax = taxOutcome(a);
  const taxLines = [];
  if (tax === 'resident_heirs') {
    taxLines.push(t.tax_resident_heirs);
  } else {
    const regionKey = tax === 'nonres_heirs_resident_deceased' ? a.deceasedRegion : a.assetsRegion;
    taxLines.push(regionKey ? fill(t[`tax_${tax}`], { region: regionLabel(regionKey) }) : t.tax_region_missing);
    taxLines.push(t.tax_model);
    taxLines.push(fill(t.tax_state_scale, { bottom: fmtNum(R.stateBottom, lang), top: fmtNum(R.stateTop, lang) }));
    taxLines.push(t.tax_insurance);
  }

  const death = a.death || '';
  const isdDue = death ? addMonths(death, R.isdMonths) : null;
  const pvDue = death ? addMonths(death, R.pvMonths) : null;
  const deadlines = [
    fill(t.dl_isd, { m: R.isdMonths, e: R.isdExtension, d: isdDue ? fill(t.by, { d: fmtDate(isdDue) }) : '' }),
    fill(t.dl_pv, { m: R.pvMonths, x: R.pvExtendTo, d: pvDue ? fill(t.by, { d: fmtDate(pvDue) }) : '' }),
  ];

  const docs = DOCS.filter(([, , when]) => !when || when(a)).map(([k, who]) => ({ text: t[k], who: who.map(w => t.who[w]) }));

  const rules = ['succession.eu_election'];
  if (law === 'spanish') rules.push('succession.foral', 'succession.legitima');
  if (law === 'spanish' && a.married === 'yes') rules.push('succession.spouse_usufruct');
  if (a.married === 'yes') rules.push('succession.gananciales_first');
  if (tax !== 'resident_heirs') rules.push('isd.nonresident_option', 'isd.nonresident_which_region', 'isd.state_scale');
  rules.push('isd.deadlines', 'plusvalia.deadlines');

  return {
    law, tax,
    sections: [
      { key: 'law', title: t.law_t, lines: lawLines },
      { key: 'tax', title: t.tax_t, lines: taxLines },
      { key: 'deadlines', title: t.dl_t, lines: deadlines },
    ],
    docsTitle: t.docs_t,
    docs,
    dates: death ? { death, isdDue, pvDue } : null,
    rules,
  };
}

function fmtNum(n, lang) {
  return lang === 'en' ? String(n) : String(n).replace('.', ',');
}
