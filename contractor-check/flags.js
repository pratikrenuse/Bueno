// The red-flag logic for a builder quote.
//
// Twelve questions, each with a defined outcome: clear, unconfirmed, or a red flag. Five
// of the reds are marked critical, meaning that one of them on its own is enough to stop
// a signature rather than to slow it down. Those five are the ones where the money is
// usually already gone by the time the owner realises: no written quote at all, payment
// in cash or off invoice, most or all of the price up front, a contractor deciding for
// himself that no licence is needed, and bank details that changed mid-job.
//
// Every unresolved item carries the sentence to say back, in English and in Spanish,
// because the owner reading this is usually negotiating in a language they do not have.
//
// No figures anywhere in this file. There is no stated fine, no ICIO rate, no deposit
// percentage and no legalisation period, because none of those are in the rules base.
// Where the source material carried one, the point is made qualitatively instead.

export const QUESTIONS = [
  {
    id: 'written',
    clearLabel: 'The quote is a proper written presupuesto',
    ask: 'Please send the presupuesto in writing, on your company paper, with your full trading name, address and CIF on it.',
    es: '¿Me puede enviar el presupuesto por escrito, con el nombre fiscal de la empresa, la dirección y el CIF?',
    prevents: 'A quote you cannot produce later is a quote that did not exist. The company details are also how you check the business is real, and how a lawyer or your insurer identifies who you dealt with.',
    options: [
      { value: 'formal', level: 'clear' },
      { value: 'informal', level: 'red' },
      { value: 'verbal', level: 'red', critical: true },
    ],
  },
  {
    id: 'itemised',
    clearLabel: 'The price is broken down line by line',
    ask: 'Can you break it down by trade, with materials and labour separate, and quantities where it makes sense?',
    es: '¿Me lo puede desglosar por partidas, con materiales y mano de obra separados?',
    prevents: 'One total tells you nothing and cannot be compared with anything. It also makes a mid-job extra impossible to argue about, because nobody wrote down what the first number included.',
    options: [
      { value: 'full', level: 'clear' },
      { value: 'partial', level: 'red' },
      { value: 'total', level: 'red' },
    ],
  },
  {
    id: 'iva',
    clearLabel: 'The quote says clearly whether IVA is included',
    ask: 'Does this price include IVA? Please write the IVA line on the quote either way.',
    es: '¿El precio incluye IVA? ¿Me lo puede indicar en el presupuesto?',
    prevents: 'A quote that is silent on IVA is the most common way a Spanish renovation ends up costing more than the number the owner agreed to. It is one line, and asking for it costs nothing.',
    options: [
      { value: 'stated', level: 'clear' },
      { value: 'silent', level: 'red' },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'fixed',
    clearLabel: 'The quote says whether the price is closed or can move',
    ask: 'Is this a closed price or an estimate? If it can move, write down what would move it and how you tell me before it does.',
    es: '¿Es un precio cerrado o un presupuesto orientativo? Si puede variar, ¿me puede indicar por escrito qué lo haría variar?',
    prevents: 'An estimate is not dishonest. Silence about which one you are holding is what leaves you arguing about a final bill you had no way to predict. Prices that move should move for reasons written down in advance.',
    options: [
      { value: 'closed', level: 'clear' },
      { value: 'variable', level: 'amber' },
      { value: 'silent', level: 'red' },
    ],
  },
  {
    id: 'registered',
    clearLabel: 'You have seen proof the business is registered and up to date',
    ask: 'Can you send me your CIF or autonomo registration, and a certificate that you are up to date with Hacienda and the Seguridad Social?',
    es: '¿Me puede enviar el CIF o el alta de autónomo y un certificado de estar al corriente con Hacienda y la Seguridad Social?',
    prevents: 'An unregistered trade cannot give you a valid invoice, which means no guarantee you can enforce and no record of what you paid. The up to date certificate is a normal request here and takes a registered business minutes to produce.',
    options: [
      { value: 'seen', level: 'clear' },
      { value: 'told', level: 'red' },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'insurance',
    clearLabel: 'You have seen a current third party liability policy',
    ask: 'Can you send me your responsabilidad civil policy, with the dates of cover?',
    es: '¿Me puede enviar la póliza de responsabilidad civil con las fechas de cobertura?',
    prevents: 'Something falls onto a neighbour car, or water gets into the flat below. Without the contractor policy that becomes your problem and your home insurance claim, and the dates matter because a policy that lapses mid-job covers nothing.',
    options: [
      { value: 'seen', level: 'clear' },
      { value: 'told', level: 'red' },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'licence',
    clearLabel: 'It is written down who applies for the licence',
    ask: 'Does this work need a licence from the ayuntamiento? Who applies, you or me, and can we put that in the contract with the licence reference before work starts?',
    es: '¿Esta obra necesita licencia del ayuntamiento? ¿Quién la solicita, usted o yo? ¿Lo podemos poner por escrito antes de empezar?',
    prevents: 'Both parties assuming the other one applied is how work starts without a licence. Whoever applies, you are the owner, so the consequence of there not being one lands on your property and on your sale, not on the builder.',
    askByValue: {
      none_needed: 'I would rather confirm that with the ayuntamiento than take it as read. Can you put in writing that you consider no licence is required, and why?',
    },
    options: [
      { value: 'contractor', level: 'clear' },
      { value: 'owner', level: 'clear' },
      { value: 'none_needed', level: 'red', critical: true },
      { value: 'unsure', level: 'amber' },
    ],
  },
  {
    id: 'deposit',
    clearLabel: 'The deposit is proportionate and receipted',
    ask: 'What exactly does this deposit pay for? I would like an invoice for it, and a payment schedule tied to stages I can see finished.',
    es: '¿Qué cubre exactamente esta señal? ¿Me da factura y un calendario de pagos por hitos de obra?',
    prevents: 'Money paid before anything exists is money with nothing behind it. Staged payments against work you can walk in and look at keep your position and the contractor incentive pointing the same way.',
    askByValue: {
      most: 'I am not able to pay most of it before work starts. Can we agree a payment schedule tied to stages, with an invoice for each one?',
    },
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
    clearLabel: 'Everything is invoiced and paid by transfer',
    ask: 'I need an invoice for every payment, and I will pay everything by bank transfer.',
    es: 'Necesito factura de todos los pagos y haré todas las transferencias por banco.',
    prevents: 'Without an invoice there is no proof you paid, no guarantee to enforce and nothing to put against the cost of the property when you eventually sell. Spain also caps cash payments where a business is involved, and the penalty for going over it falls on both sides, so a contractor splitting payments to stay under a limit is asking you to carry his risk. Your gestor can tell you what the current limit is.',
    options: [
      { value: 'no', level: 'clear' },
      { value: 'part', level: 'red', critical: true },
      { value: 'all', level: 'red', critical: true },
    ],
  },
  {
    id: 'dates',
    clearLabel: 'Start and completion dates are in writing',
    ask: 'What start date and completion date can we put in writing, and what happens if it runs over?',
    es: '¿Qué fecha de inicio y de finalización podemos poner por escrito? ¿Qué ocurre si se retrasa?',
    prevents: 'Renovations here do run over, and a good contractor will tell you that. A date in writing is not there to punish anyone. It is there so that a delay becomes a conversation rather than a silence you cannot do anything about from another country.',
    options: [
      { value: 'written', level: 'clear' },
      { value: 'verbal', level: 'red' },
      { value: 'none', level: 'red' },
    ],
  },
  {
    id: 'price',
    clearLabel: 'The price sits alongside other quotes you have',
    ask: 'Your price is noticeably below the others I have. Can you tell me what is included here that I might be comparing wrongly, and what is not included at all?',
    es: 'Su precio está bastante por debajo de los otros presupuestos. ¿Qué incluye y qué no incluye exactamente?',
    prevents: 'A price far below the others is usually explained by something that has been left out, by materials of a different grade, or by work nobody intends to declare. Sometimes it is genuinely a better price. The question tells you which, and a good contractor answers it happily.',
    askByValue: {
      only: 'Get two more quotes for the same written specification before you sign this one.',
    },
    options: [
      { value: 'inline', level: 'clear' },
      { value: 'below', level: 'red' },
      { value: 'only', level: 'red' },
    ],
  },
  {
    id: 'bank',
    clearLabel: 'The bank details were verified by voice, on a number you already had',
    ask: 'Before I transfer anything, I will call you on the number I already have to confirm the account. Please do not send bank details by email.',
    es: 'Antes de transferir le llamo al número que ya tengo para confirmar la cuenta. Por favor, no me envíe datos bancarios por correo.',
    prevents: 'Criminals impersonate builders, agents and lawyers to foreign owners here, intercepting email and altering the account number, usually with a reason to hurry. A payment sent to the wrong account is very rarely recovered. Thirty seconds on a number you dialled yourself defeats the whole thing.',
    askByValue: {
      changed: 'The account details have changed, so I will not transfer anything until I have confirmed the new account by voice on the number I already had. Please expect that call.',
    },
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
  {
    text: 'Do you do all of this yourself, or is any of it subcontracted, and to whom?',
    why: 'Ask in Spanish: "¿Realiza usted toda la obra o subcontrata parte? ¿A quién?" The company you checked may not be the company on site, and a subcontractor is not covered by the main contractor insurance unless someone has arranged it.',
  },
  {
    text: 'Which brand and model of material is in the price?',
    why: 'Ask in Spanish: "¿Qué marca y modelo de material está incluido en el presupuesto?" A named material is one you can check against what arrives. First quality is not a specification and cannot be checked against anything.',
  },
  {
    text: 'Can I see a job you have finished nearby, and speak to that customer?',
    why: 'Ask in Spanish: "¿Puedo ver una obra terminada suya y hablar con ese cliente?" This is the check that actually works here. Word of mouth in your own area beats any document, and a contractor with finished work nearby is usually pleased to show it.',
  },
  {
    text: 'What guarantee is there on the work, and for how long?',
    why: 'Ask in Spanish: "¿Qué garantía tiene la obra y por cuánto tiempo?" A guarantee only exists on top of an invoice. Ask what it covers as well as how long it runs.',
  },
  {
    text: 'Put every change in writing, including the ones agreed on site.',
    why: 'Ask in Spanish: "Cualquier cambio lo ponemos por escrito antes de ejecutarlo." Verbal variations agreed at the property are the most common reason a final bill does not match the quote, and neither side remembers it the same way.',
  },
  {
    text: 'If the answer to any of this feels wrong, get a second quote.',
    why: 'Nothing on this page is a substitute for that instinct. Scams and bad jobs both rely on the owner feeling that asking again would be rude, and on the pressure of having flown out for the week.',
  },
];

const byId = id => QUESTIONS.find(q => q.id === id);

export function assess(answers) {
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
      clear.push({ id: q.id, text: q.clearLabel });
      continue;
    }
    if (o.critical) criticals += 1;

    const ask = (q.askByValue && q.askByValue[v]) || q.ask;
    const item = {
      id: q.id,
      critical: !!o.critical,
      text: ask,
      why: `Say it in Spanish: "${q.es}" ${q.prevents}`,
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

export function buildGroups(result, c) {
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
  groups.push({ title: c('g_always'), note: c('g_always_note'), items: ALWAYS_ASK });
  if (result.clear.length) {
    groups.push({ title: c('g_clear'), note: c('g_clear_note'), items: result.clear.map(i => i.text) });
  }
  return groups;
}

export { byId };
