// The sale readiness checklist, as a pure function.
//
// No legal figure is typed here. Every rate and window arrives in `R`, which index.jsx
// builds from the rules base, and the test builds from the same JSON. The only numbers in
// this file are array positions.
//
// The working checklist is written in English and Spanish, because it is the professional's
// own document and Spanish is the working language of the transaction. The client letter
// lives in letter.js and is written in seven languages.
//
// Every item carries `who`, because the question a professional actually has on a live
// sale is rarely "what is left" and usually "whose move is it".

import { addMonths, addWorkingDays } from '../sale-tax/calc.js';

export const DOC_LANGS = ['en', 'es'];

const T = {
  en: {
    g_now: 'Before the reservation',
    g_contract: 'Before the private contract',
    g_notary: 'Before the notary',
    g_completion: 'On completion day',
    g_after: 'After completion',
    who: { buyer: 'Buyer', seller: 'Seller', agent: 'Agent', lawyer: 'Lawyer', notary: 'Notary', bank: 'Bank', gestor: 'Gestor' },
    m_seller: 'The seller’s tax residency. It decides whether the buyer must withhold part of the price.',
    m_buyer: 'The buyer’s tax residency. It changes what the buyer files every year after completion.',
    m_finance: 'How the purchase is funded.',
    m_nie: 'Whether the buyer already has an NIE.',
    m_account: 'Whether the buyer has a Spanish account or another way to pay in euros.',
    m_signing: 'Who signs in person and who signs by power of attorney.',
    m_date: 'The planned completion date. Without it no deadline can be dated.',
  },
  es: {
    g_now: 'Antes de la reserva',
    g_contract: 'Antes del contrato privado',
    g_notary: 'Antes de la notaría',
    g_completion: 'El día de la firma',
    g_after: 'Después de la firma',
    who: { buyer: 'Comprador', seller: 'Vendedor', agent: 'Agente', lawyer: 'Abogado', notary: 'Notario', bank: 'Banco', gestor: 'Gestor' },
    m_seller: 'La residencia fiscal del vendedor. Decide si el comprador debe retener parte del precio.',
    m_buyer: 'La residencia fiscal del comprador. Cambia lo que el comprador declara cada año después de la firma.',
    m_finance: 'Cómo se financia la compra.',
    m_nie: 'Si el comprador ya tiene NIE.',
    m_account: 'Si el comprador tiene cuenta en España u otra forma de pagar en euros.',
    m_signing: 'Quién firma en persona y quién firma con poder.',
    m_date: 'La fecha prevista de firma. Sin ella no se puede fechar ningún plazo.',
  },
};

// Each item: [when, who, en, es, whyEn, whyEs]. `when` is a predicate on the answers.
// Placeholders in braces are filled from R and the computed dates.
const sellerSide = a => a.side !== 'buyer';
const buyerSide = a => a.side !== 'seller';
const nonResSeller = a => a.seller !== 'resident';
const always = () => true;

const ITEMS = {
  now: [
    [always, ['agent'], 'Confirm in writing who acts for the buyer and who acts for the seller.', 'Confirme por escrito quién actúa para el comprador y quién para el vendedor.',
      'Two agencies on one sale is common in Spain, and the fee split is where disputes start.', 'Es habitual que dos agencias intervengan en una venta, y el reparto de honorarios es donde empiezan los conflictos.'],
    [always, ['agent', 'lawyer'], 'Get a recent nota simple and check that the owner, the charges and the description match the listing.', 'Pida una nota simple reciente y compruebe que el titular, las cargas y la descripción coinciden con el anuncio.',
      'A mortgage or an embargo on the registry has to be cleared before completion, not discovered at it.', 'Una hipoteca o un embargo registrado debe cancelarse antes de la firma, no descubrirse en ella.'],
    [sellerSide, ['seller'], 'Ask for the registered energy performance certificate and its label.', 'Solicite el certificado de eficiencia energética registrado y su etiqueta.',
      'A copy of the registered certificate and the label are annexed to the sale contract.', 'La copia del certificado registrado y la etiqueta se anexan al contrato de compraventa.', 'epc.requirement'],
    [sellerSide, ['seller'], 'Collect the latest IBI receipt and a statement from the community that fees are paid up to date.', 'Reúna el último recibo del IBI y un certificado de la comunidad de estar al corriente de pago.',
      'The IBI receipt carries the cadastral value, which the seller’s tax calculations need later.', 'El recibo del IBI indica el valor catastral, que se necesita después para los cálculos fiscales del vendedor.'],
    [buyerSide, ['agent'], 'Agree the reservation terms in writing: the amount, what happens if finance fails, and when it becomes part of the price.', 'Acuerde por escrito las condiciones de la reserva: el importe, qué ocurre si falla la financiación y cuándo se descuenta del precio.',
      null, null],
    [a => buyerSide(a) && a.nie !== 'yes', ['buyer', 'lawyer'], 'Start the buyer’s NIE now.', 'Inicie ya el NIE del comprador.',
      'Nothing at the notary moves without it, and appointments can take weeks.', 'Sin NIE no se puede firmar en notaría, y las citas pueden tardar semanas.'],
    [a => buyerSide(a) && a.account !== 'yes', ['buyer', 'bank'], 'Open a Spanish account for the buyer, or confirm how the funds will reach Spain.', 'Abra una cuenta española para el comprador o confirme cómo llegarán los fondos a España.',
      'The notary needs to see where the money comes from, and a transfer from abroad needs time.', 'La notaría necesita ver el origen del dinero, y una transferencia desde el extranjero requiere tiempo.'],
    [a => buyerSide(a) && a.buyer === 'unsure', ['lawyer'], 'Establish the buyer’s tax residency.', 'Determine la residencia fiscal del comprador.',
      'It does not change the purchase price. It changes what the buyer files every year afterwards.', 'No cambia el precio de compra. Cambia lo que el comprador declara cada año después.', 'residency.tests'],
  ],
  contract: [
    [always, ['lawyer'], 'Check the planning status and any open infractions with the town hall.', 'Compruebe en el ayuntamiento la situación urbanística y si hay expedientes abiertos.',
      'An extension built without a licence stays with the property, and with the new owner.', 'Una ampliación sin licencia sigue a la vivienda, y al nuevo propietario.'],
    [a => a.property === 'newbuild', ['lawyer'], 'Check the first occupation licence or its regional equivalent, and the building guarantee insurance.', 'Compruebe la licencia de primera ocupación o su equivalente autonómico, y el seguro decenal.',
      null, null],
    [a => buyerSide(a) && a.finance === 'mortgage', ['buyer', 'bank'], 'Book the lender’s valuation and get the binding offer (FEIN) before the deposit becomes non-refundable.', 'Solicite la tasación y la oferta vinculante (FEIN) antes de que las arras dejen de ser recuperables.',
      'If the valuation comes in low, the loan shrinks and the gap has to be found in cash.', 'Si la tasación sale baja, el préstamo se reduce y la diferencia hay que cubrirla en efectivo.'],
    [a => buyerSide(a) && a.finance === 'undecided', ['buyer'], 'Settle how the purchase is funded before the private contract is signed.', 'Defina cómo se financia la compra antes de firmar el contrato privado.',
      'Deposits under a private contract are commonly forfeited if the buyer withdraws.', 'Con arras penitenciales, el comprador que desiste suele perder la señal.'],
    [always, ['agent', 'lawyer'], 'Agree who pays which costs, and write it into the contract.', 'Acuerde quién paga cada gasto y déjelo por escrito en el contrato.', null, null],
    [nonResSeller, ['lawyer'], 'Write the {ret} percent retention into the contract so the seller expects it at the notary.', 'Incluya en el contrato la retención del {ret} por ciento para que el vendedor la espere en la notaría.',
      'It is {ret} percent of the price, not of the gain, and the buyer pays it to the tax office.', 'Es el {ret} por ciento del precio, no de la ganancia, y el comprador la ingresa en Hacienda.', 'irnr.sale.retention'],
    [nonResSeller, ['lawyer'], 'Agree how the estimated plusvalía will be handled at completion.', 'Acuerde cómo se tratará la plusvalía estimada en la firma.',
      'With a non-resident seller the buyer can be pursued for it, so buyers’ lawyers commonly hold it back from the price.', 'Con vendedor no residente el comprador responde como sustituto, por lo que es habitual retenerla del precio.', 'plusvalia.non_resident_seller'],
  ],
  notary: [
    [always, ['agent', 'lawyer'], 'Book the notary and send the file early.', 'Reserve la notaría y envíe la documentación con antelación.', null, null],
    [a => a.signing === 'poa', ['lawyer'], 'Prepare the power of attorney. If it is signed abroad, it needs an apostille and, where required, a sworn translation.', 'Prepare el poder. Si se firma en el extranjero, necesita apostilla y, si procede, traducción jurada.',
      'Check the notary will accept the wording before it is signed.', 'Confirme con la notaría que acepta el texto antes de firmarlo.'],
    [a => a.signing === 'undecided', ['lawyer'], 'Decide who signs in person and who signs by power of attorney.', 'Decida quién firma en persona y quién firma con poder.',
      'A power signed abroad can take several weeks to be usable in Spain.', 'Un poder firmado en el extranjero puede tardar varias semanas en poder usarse en España.'],
    [buyerSide, ['buyer', 'bank'], 'Arrange how the price is paid on the day: banker’s draft or transfer, as the notary requires.', 'Prepare cómo se paga el precio: cheque bancario o transferencia, según indique la notaría.', null, null],
    [always, ['agent'], 'Confirm the buyer’s funds are traceable. Notaries and agencies both have anti-money-laundering duties.', 'Confirme que los fondos del comprador son trazables. Notarías e inmobiliarias tienen obligaciones de prevención de blanqueo.',
      'This tool does not carry out or record those checks.', 'Esta herramienta no realiza ni registra esas comprobaciones.'],
    [sellerSide, ['seller', 'bank'], 'If there is a mortgage, get the bank’s settlement figure and arrange cancellation at completion.', 'Si hay hipoteca, pida al banco el saldo pendiente y organice la cancelación en la firma.', null, null],
    [always, ['agent'], 'Collect the utility contracts and arrange meter readings for the change of name.', 'Reúna los contratos de suministros y organice la lectura de contadores para el cambio de titular.', null, null],
  ],
  completion: [
    [nonResSeller, ['buyer', 'lawyer'], 'The buyer withholds {ret} percent of the price for the tax office.', 'El comprador retiene el {ret} por ciento del precio para Hacienda.', null, null, 'irnr.sale.retention'],
    [a => a.property === 'newbuild' && a.region !== 'canarias', ['buyer'], 'The buyer pays IVA at {iva} percent on a new home in mainland Spain or the Balearics.', 'El comprador paga IVA del {iva} por ciento en una vivienda nueva en la Península o Baleares.', null, null, 'vat.newbuild.mainland'],
    [a => a.property === 'newbuild' && a.region === 'canarias', ['buyer'], 'The buyer pays IGIC, not IVA. The general rate is {igic} percent; the lower rates apply only to a main residence.', 'El comprador paga IGIC, no IVA. El tipo general es del {igic} por ciento; los tipos reducidos solo se aplican a vivienda habitual.', null, null, 'igic.canarias'],
    [a => a.property !== 'newbuild', ['buyer'], 'The buyer pays transfer tax (ITP) at the regional rate, on the higher of the price and the official reference value.', 'El comprador paga ITP al tipo de su comunidad, sobre el mayor entre el precio y el valor de referencia.', null, null],
    [always, ['agent'], 'Hand over the keys, sign the meter readings and photograph them.', 'Entregue las llaves, firme las lecturas de contadores y fotografíelas.', null, null],
  ],
  after: [
    [nonResSeller, ['buyer', 'gestor'], 'The buyer files Modelo 211 and pays the retention within {m211} {mword} of completion{d211}.', 'El comprador presenta el Modelo 211 e ingresa la retención en el plazo de {m211} {mword} desde la firma{d211}.', null, null, 'irnr.sale.retention'],
    [always, ['lawyer', 'gestor'], 'Declare the plusvalía to the town hall within {pv} working days of the deed{dpv}.', 'Declare la plusvalía en el ayuntamiento en el plazo de {pv} días hábiles desde la escritura{dpv}.',
      'Holidays are not counted here, so the real deadline can fall later. Confirm it with the town hall.', 'Aquí no se descuentan festivos, por lo que el plazo real puede terminar después. Confírmelo con el ayuntamiento.', 'plusvalia.deadlines'],
    [nonResSeller, ['seller', 'gestor'], 'The seller files the capital gains return (Modelo 210){w210}.', 'El vendedor presenta la declaración de la ganancia (Modelo 210){w210}.',
      'If the retention is more than the tax due, this return is how the difference is reclaimed.', 'Si la retención supera el impuesto, con esta declaración se solicita la devolución.', 'deadline.210.sale'],
    [always, ['notary', 'lawyer'], 'Present the deed to the land registry and confirm it is registered.', 'Presente la escritura en el Registro de la Propiedad y confirme la inscripción.', null, null],
    [buyerSide, ['buyer', 'agent'], 'Move the utility contracts, the IBI and the community fees into the buyer’s name.', 'Cambie a nombre del comprador los suministros, el IBI y la comunidad.', null, null],
    [a => buyerSide(a) && a.buyer !== 'resident', ['buyer', 'gestor'], 'Tell the buyer that a non-resident owner files a Modelo 210 for the property every year.', 'Explique al comprador que un propietario no residente presenta cada año un Modelo 210 por el inmueble.',
      'Send the buyer the property tax calculator on Spain 24/7.', 'Envíe al comprador la calculadora de impuestos de Spain 24/7.', 'irnr.imputed.base'],
  ],
};

const ORDER = ['now', 'contract', 'notary', 'completion', 'after'];

export function computeDates(completion, R) {
  if (!completion) return null;
  const d211 = addMonths(completion, R.retentionMonths);
  const open210 = addMonths(completion, R.saleOpensMonths);
  const close210 = addMonths(completion, R.saleOpensMonths + R.saleWindowMonths);
  const pv = addWorkingDays(completion, R.plusvaliaWorkingDays);
  if (!d211 || !open210 || !close210 || !pv) return null;
  return { completion, d211, open210, close210, pv };
}

function fill(s, vars) {
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
}

// fmtDate is passed in so the test can use a fixed format and the page can use the
// document language's.
export function buildDeal(a, R, lang = 'en', fmtDate = x => x) {
  const L = T[lang] ? lang : 'en';
  const t = T[L];
  const dates = computeDates(a.completion, R);
  const on = L === 'es' ? ' (hasta el {d})' : ' (by {d})';
  const vars = {
    ret: R.retentionRate,
    iva: R.ivaNewBuild,
    igic: R.igicGeneral,
    m211: R.retentionMonths,
    pv: R.plusvaliaWorkingDays,
    mword: L === 'es' ? (R.retentionMonths === 1 ? 'mes' : 'meses') : (R.retentionMonths === 1 ? 'month' : 'months'),
    d211: dates ? fill(on, { d: fmtDate(dates.d211) }) : '',
    dpv: dates ? (L === 'es' ? ` (no antes del ${fmtDate(dates.pv)})` : ` (no earlier than ${fmtDate(dates.pv)})`) : '',
    w210: dates
      ? (L === 'es' ? ` entre el ${fmtDate(dates.open210)} y el ${fmtDate(dates.close210)}` : ` between ${fmtDate(dates.open210)} and ${fmtDate(dates.close210)}`)
      : (L === 'es' ? ` entre ${R.saleOpensMonths} y ${R.saleOpensMonths + R.saleWindowMonths} meses después de la firma` : ` between ${R.saleOpensMonths} and ${R.saleOpensMonths + R.saleWindowMonths} months after completion`),
  };

  const groups = [];
  for (const key of ORDER) {
    const items = [];
    for (const [when, who, en, es, whyEn, whyEs, ruleId] of ITEMS[key]) {
      if (!when(a)) continue;
      items.push({
        text: fill(L === 'es' ? es : en, vars),
        why: (L === 'es' ? whyEs : whyEn) ? fill(L === 'es' ? whyEs : whyEn, vars) : null,
        who: who.map(w => t.who[w]),
        rule: ruleId || null,
      });
    }
    if (items.length) groups.push({ key, title: t[`g_${key}`], items });
  }

  const missing = [];
  // The seller's residency matters on either side of the deal: the buyer is the one who
  // withholds, so a buyer's agent needs it as much as the seller's.
  if (a.seller === 'unsure') missing.push(t.m_seller);
  if (a.buyer === 'unsure' && a.side !== 'seller') missing.push(t.m_buyer);
  if (a.finance === 'undecided' && a.side !== 'seller') missing.push(t.m_finance);
  if (a.nie === 'unsure' && a.side !== 'seller') missing.push(t.m_nie);
  if (a.account === 'unsure' && a.side !== 'seller') missing.push(t.m_account);
  if (a.signing === 'undecided') missing.push(t.m_signing);
  if (!dates) missing.push(t.m_date);

  const rules = [...new Set(groups.flatMap(g => g.items.map(i => i.rule)).filter(Boolean))];
  return { groups, missing, dates, rules };
}
