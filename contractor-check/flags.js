// The red-flag logic for a builder quote.
//
// Twelve questions, each with a defined outcome: clear, unconfirmed, or a red flag. Five
// of the reds are marked critical, meaning that one of them on its own is enough to stop
// a signature rather than to slow it down. Those five are the ones where the money is
// usually already gone by the time the owner realises: no written quote at all, payment
// in cash or off invoice, most or all of the price up front, a contractor deciding for
// himself that no licence is needed, and bank details that changed mid-job.
//
// Every unresolved item carries the sentence to say back, in the reader's language and in
// Spanish, because the owner reading this is usually negotiating in a language they do
// not have.
//
// No figures anywhere in this file. There is no stated fine, no ICIO rate, no deposit
// percentage and no legalisation period, because none of those are in the rules base.
// Where the source material carried one, the point is made qualitatively instead.

import copyDict from './copy.js';

// The words around each question live in copy.js under q.<id>, in all six languages:
// clear (what an answer that checks out reads as), ask (the line to send back), prevents
// (why it matters), and ask_<value> where one answer needs a different line. The Spanish
// sentence, es, stays here because it is the same whatever language the owner reads.
// Called without a copy function, everything reads English.
const enCopy = path => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), copyDict.en) ?? path;

export const QUESTIONS = [
  {
    id: 'written',
    es: '¿Me puede enviar el presupuesto por escrito, con el nombre fiscal de la empresa, la dirección y el CIF?',
    options: [
      { value: 'formal', level: 'clear' },
      { value: 'informal', level: 'red' },
      { value: 'verbal', level: 'red', critical: true },
    ],
  },
  {
    id: 'itemised',
    es: '¿Me lo puede desglosar por partidas, con materiales y mano de obra separados?',
    options: [
      { value: 'full', level: 'clear' },
      { value: 'partial', level: 'red' },
      { value: 'total', level: 'red' },
    ],
  },
  {
    id: 'iva',
    es: '¿El precio incluye IVA? ¿Me lo puede indicar en el presupuesto?',
    options: [
      { value: 'stated', level: 'clear' },
      { value: 'silent', level: 'red' },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'fixed',
    es: '¿Es un precio cerrado o un presupuesto orientativo? Si puede variar, ¿me puede indicar por escrito qué lo haría variar?',
    options: [
      { value: 'closed', level: 'clear' },
      { value: 'variable', level: 'amber' },
      { value: 'silent', level: 'red' },
    ],
  },
  {
    id: 'registered',
    es: '¿Me puede enviar el CIF o el alta de autónomo y un certificado de estar al corriente con Hacienda y la Seguridad Social?',
    options: [
      { value: 'seen', level: 'clear' },
      { value: 'told', level: 'red' },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'insurance',
    es: '¿Me puede enviar la póliza de responsabilidad civil con las fechas de cobertura?',
    options: [
      { value: 'seen', level: 'clear' },
      { value: 'told', level: 'red' },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'licence',
    es: '¿Esta obra necesita licencia del ayuntamiento? ¿Quién la solicita, usted o yo? ¿Lo podemos poner por escrito antes de empezar?',
    askByValue: ['none_needed'],
    options: [
      { value: 'contractor', level: 'clear' },
      { value: 'owner', level: 'clear' },
      { value: 'none_needed', level: 'red', critical: true },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'deposit',
    es: '¿Qué cubre exactamente esta señal? ¿Me da factura y un calendario de pagos por hitos de obra?',
    askByValue: ['most'],
    options: [
      { value: 'none', level: 'clear' },
      { value: 'small', level: 'clear' },
      { value: 'half', level: 'red' },
      { value: 'most', level: 'red', critical: true },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'cash',
    es: 'Necesito factura de todos los pagos y haré todas las transferencias por banco.',
    options: [
      { value: 'no', level: 'clear' },
      { value: 'part', level: 'red', critical: true },
      { value: 'all', level: 'red', critical: true },
    ],
  },
  {
    id: 'dates',
    es: '¿Qué fecha de inicio y de finalización podemos poner por escrito? ¿Qué ocurre si se retrasa?',
    options: [
      { value: 'written', level: 'clear' },
      { value: 'verbal', level: 'red' },
      { value: 'none', level: 'red' },
    ],
  },
  {
    id: 'price',
    es: 'Su precio está bastante por debajo de los otros presupuestos. ¿Qué incluye y qué no incluye exactamente?',
    askByValue: ['only'],
    options: [
      { value: 'inline', level: 'clear' },
      { value: 'below', level: 'red' },
      { value: 'only', level: 'red' },
    ],
  },
  {
    id: 'bank',
    es: 'Antes de transferir le llamo al número que ya tengo para confirmar la cuenta. Por favor, no me envíe datos bancarios por correo.',
    askByValue: ['changed'],
    options: [
      { value: 'verified', level: 'clear' },
      { value: 'email', level: 'red' },
      { value: 'changed', level: 'red', critical: true },
      { value: 'none_yet', level: 'amber' },
    ],
  },
];

// Asked regardless of the answers. These come straight out of the questions the source
// material says to put to a building company, and they are the ones no scorecard answer
// can settle for you.
export const ALWAYS_ASK = [
  { id: 'subcontract', es: '¿Realiza usted toda la obra o subcontrata parte? ¿A quién?' },
  { id: 'materials', es: '¿Qué marca y modelo de material está incluido en el presupuesto?' },
  { id: 'references', es: '¿Puedo ver una obra terminada suya y hablar con ese cliente?' },
  { id: 'guarantee', es: '¿Qué garantía tiene la obra y por cuánto tiempo?' },
  { id: 'changes', es: 'Cualquier cambio lo ponemos por escrito antes de ejecutarlo.' },
  { id: 'second_quote', es: null },
];

const byId = id => QUESTIONS.find(q => q.id === id);

export function assess(answers, c = enCopy) {
  const red = [];
  const amber = [];
  const clear = [];
  let criticals = 0;

  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (!v) continue;
    const o = q.options.find(x => x.value === v);
    if (!o) continue;

    if (o.level === 'clear') {
      clear.push({ id: q.id, text: c(`q.${q.id}.clear`) });
      continue;
    }
    if (o.critical) criticals += 1;

    const ask = q.askByValue && q.askByValue.includes(v) ? c(`q.${q.id}.ask_${v}`) : c(`q.${q.id}.ask`);
    const item = {
      id: q.id,
      critical: !!o.critical,
      text: ask,
      why: `${c('say_in_spanish')} "${q.es}" ${c(`q.${q.id}.prevents`)}`,
    };
    (o.level === 'red' ? red : amber).push(item);
  }

  const verdict =
    criticals > 0 ? 'stop'
    : red.length >= 4 ? 'rework'
    : red.length > 0 ? 'fixable'
    : amber.length > 0 ? 'confirm'
    : 'clear';

  return {
    red,
    amber,
    clear,
    criticals,
    verdict,
    counts: { red: red.length, amber: amber.length, clear: clear.length, total: QUESTIONS.length },
  };
}

// The always-ask list in the reader's language. The Spanish line stays Spanish, because it
// is what the owner sends to the contractor.
export function buildAlways(c = enCopy) {
  return ALWAYS_ASK.map(x => ({
    text: c(`always.${x.id}.text`),
    why: x.es ? `${c('ask_in_spanish')} "${x.es}" ${c(`always.${x.id}.why`)}` : c(`always.${x.id}.why`),
  }));
}

export function buildGroups(result, c = enCopy) {
  const groups = [];
  const critical = result.red.filter(i => i.critical);
  const ordinary = result.red.filter(i => !i.critical);
  if (critical.length) {
    groups.push({ title: c('g_critical'), note: c('g_critical_note'), items: critical.map(i => ({ text: i.text, why: i.why })) });
  }
  if (ordinary.length) {
    groups.push({ title: c('g_red'), note: c('g_red_note'), items: ordinary.map(i => ({ text: i.text, why: i.why })) });
  }
  if (result.amber.length) {
    groups.push({ title: c('g_amber'), note: c('g_amber_note'), items: result.amber.map(i => ({ text: i.text, why: i.why })) });
  }
  groups.push({ title: c('g_always'), note: c('g_always_note'), items: buildAlways(c) });
  if (result.clear.length) {
    groups.push({ title: c('g_clear'), note: c('g_clear_note'), items: result.clear.map(i => i.text) });
  }
  return groups;
}

export { byId };
