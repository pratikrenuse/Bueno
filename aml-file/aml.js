// The anti-money-laundering client file for estate agents, as a pure function.
//
// This is a record and a prompt, not a compliance system. It tells the agent whether the
// operation is in scope, what has not been done yet, and whether the file needs enhanced
// measures, and it prints a record the agency keeps. It does not replace the agency's own
// internal procedures, and it never decides whether something should be reported: that
// judgement stays with the agency.
//
// Thresholds and the retention period arrive in R from rules/professional.json.

export const DOC_LANGS = ['en', 'es'];

export const FLAG_KEYS = ['price_mismatch', 'quick_resale', 'reluctant', 'structure', 'urgency', 'third_party', 'cash', 'country'];
export const FUNDS_KEYS = ['mortgage', 'savings', 'sale', 'inheritance', 'business', 'other'];
export const PAYMENT_KEYS = ['es_bank', 'foreign_bank', 'cash', 'third_party', 'unknown'];

export function inScope(a, R) {
  if (a.op !== 'lease') return true;
  const m = Number(a.rent) || 0;
  return m >= R.leaseMonthly || m * 12 >= R.leaseAnnual;
}

export function assess(a, R) {
  if (!inScope(a, R)) return { verdict: 'out_of_scope', stops: [], reasons: [] };
  const stops = [];
  if (a.idChecked !== 'yes') stops.push('stop_id');
  if (a.clientType === 'company' && a.bo !== 'yes') stops.push('stop_bo');
  const reasons = [];
  if (a.pep === 'yes') reasons.push('why_pep');
  if (a.pep === 'unknown') reasons.push('why_pep_unknown');
  if (a.fundsEvidence !== 'yes') reasons.push('why_funds');
  if (['cash', 'third_party', 'unknown'].includes(a.payment)) reasons.push(`why_pay_${a.payment}`);
  if ((a.flags || []).length) reasons.push('why_flags');
  const verdict = stops.length ? 'stop' : reasons.length ? 'enhanced' : 'standard';
  return { verdict, stops, reasons };
}

export const DOC = {
  en: {
    title: 'Client due diligence record', sub: 'Anti-money-laundering file, Ley 10/2010',
    f_client: 'Client', f_op: 'Operation', f_prop: 'Property', f_date: 'Date of this record', f_by: 'Checked by', f_sign: 'Signature',
    op_sale: 'Sale', op_lease: 'Lease', side_buyer: 'Acting with the buyer', side_seller: 'Acting with the seller', side_both: 'Acting with both parties',
    t_person: 'Individual', t_company: 'Company or other legal entity',
    v_standard: 'Standard due diligence. No point on this record calls for more.',
    v_enhanced: 'Enhanced review. At least one point below needs more than the standard checks before the operation goes ahead.',
    v_stop: 'Do not proceed yet. Identification is incomplete.',
    v_out_of_scope: 'This lease is below the rent at which agents become obliged subjects. Keeping this record is still good practice.',
    stop_id: 'The client’s identity has not been checked against a valid official document.',
    stop_bo: 'The beneficial owners of the company have not all been identified.',
    why_pep: 'The client, a family member or a close associate is a politically exposed person. Enhanced measures apply.',
    why_pep_unknown: 'Whether the client is a politically exposed person has not been checked.',
    why_funds: 'There is no evidence yet of where the funds come from.',
    why_pay_cash: 'Payment in cash has been proposed.',
    why_pay_third_party: 'Someone other than the client will pay.',
    why_pay_unknown: 'How the price will be paid is not known.',
    why_flags: 'Warning signs were noted below.',
    s_checks: 'Checks', s_funds: 'Source and route of funds', s_flags: 'Warning signs noted', s_actions: 'What the agency must do',
    c_id: 'Identity checked against a valid official document, copy kept', c_bo: 'Beneficial owners identified (anyone holding more than {bo} percent, or otherwise in control)', c_pep: 'Checked whether the client is a politically exposed person',
    yes: 'Yes', no: 'No', unknown: 'Not checked', na: 'Not applicable',
    funds_mortgage: 'Mortgage', funds_savings: 'Savings', funds_sale: 'Sale of another property', funds_inheritance: 'Inheritance', funds_business: 'Business income', funds_other: 'Other',
    evidence: 'Evidence of the source seen',
    pay_es_bank: 'Transfer from a Spanish bank account in the client’s name', pay_foreign_bank: 'Transfer from a foreign bank account in the client’s name', pay_cash: 'Cash', pay_third_party: 'Paid by someone other than the client', pay_unknown: 'Not known yet',
    flag_price_mismatch: 'Price well above or below the market without a clear reason', flag_quick_resale: 'Property bought and resold within a short time', flag_reluctant: 'Client reluctant to give information or documents', flag_structure: 'Complex ownership structure or intermediaries with no clear purpose', flag_urgency: 'Unusual urgency or indifference to price and conditions', flag_third_party: 'A third party pays or gives instructions', flag_cash: 'Cash offered for all or part of the price', flag_country: 'Funds or parties linked to a high-risk jurisdiction',
    flags_none: 'None noted.',
    flags_note: 'These are common warning signs in property transactions, not an official list.',
    a_keep: 'Keep this record and copies of the documents for {years} years from the end of the relationship or the operation.',
    a_report: 'If anything suggests money laundering, report it to SEPBLAC. Never tell the client a report has been made or considered.',
    a_enhanced: 'Apply enhanced measures before continuing: obtain and check evidence of the source of funds, and record who decided to go ahead and why.',
    a_internal: 'Follow the agency’s own internal procedures. This record does not replace them.',
  },
  es: {
    title: 'Registro de diligencia debida', sub: 'Expediente de prevención del blanqueo, Ley 10/2010',
    f_client: 'Cliente', f_op: 'Operación', f_prop: 'Inmueble', f_date: 'Fecha del registro', f_by: 'Revisado por', f_sign: 'Firma',
    op_sale: 'Compraventa', op_lease: 'Arrendamiento', side_buyer: 'Intervención con el comprador', side_seller: 'Intervención con el vendedor', side_both: 'Intervención con ambas partes',
    t_person: 'Persona física', t_company: 'Sociedad u otra persona jurídica',
    v_standard: 'Diligencia debida normal. Ningún punto de este registro exige más.',
    v_enhanced: 'Revisión reforzada. Al menos un punto requiere más que las medidas normales antes de continuar.',
    v_stop: 'No continuar todavía. La identificación está incompleta.',
    v_out_of_scope: 'Este arrendamiento no alcanza la renta a partir de la cual el agente es sujeto obligado. Aun así, conservar este registro es una buena práctica.',
    stop_id: 'No se ha comprobado la identidad del cliente con un documento oficial válido.',
    stop_bo: 'No se han identificado todos los titulares reales de la sociedad.',
    why_pep: 'El cliente, un familiar o un allegado es persona con responsabilidad pública. Se aplican medidas reforzadas.',
    why_pep_unknown: 'No se ha comprobado si el cliente es persona con responsabilidad pública.',
    why_funds: 'Aún no hay acreditación del origen de los fondos.',
    why_pay_cash: 'Se ha propuesto pagar en efectivo.',
    why_pay_third_party: 'Pagará una persona distinta del cliente.',
    why_pay_unknown: 'No se sabe cómo se pagará el precio.',
    why_flags: 'Se han anotado señales de alerta.',
    s_checks: 'Comprobaciones', s_funds: 'Origen y medio de pago', s_flags: 'Señales de alerta anotadas', s_actions: 'Qué debe hacer la agencia',
    c_id: 'Identidad comprobada con documento oficial válido, copia conservada', c_bo: 'Titulares reales identificados (quien tenga más del {bo} por ciento o controle de otro modo)', c_pep: 'Comprobado si el cliente es persona con responsabilidad pública',
    yes: 'Sí', no: 'No', unknown: 'Sin comprobar', na: 'No aplica',
    funds_mortgage: 'Hipoteca', funds_savings: 'Ahorros', funds_sale: 'Venta de otro inmueble', funds_inheritance: 'Herencia', funds_business: 'Ingresos empresariales', funds_other: 'Otro',
    evidence: 'Acreditación del origen revisada',
    pay_es_bank: 'Transferencia desde cuenta española a nombre del cliente', pay_foreign_bank: 'Transferencia desde cuenta extranjera a nombre del cliente', pay_cash: 'Efectivo', pay_third_party: 'Paga una persona distinta del cliente', pay_unknown: 'Aún no se sabe',
    flag_price_mismatch: 'Precio muy superior o inferior al de mercado sin motivo claro', flag_quick_resale: 'Inmueble comprado y revendido en poco tiempo', flag_reluctant: 'Cliente reacio a facilitar información o documentos', flag_structure: 'Estructura de titularidad compleja o intermediarios sin finalidad clara', flag_urgency: 'Prisa inusual o indiferencia ante el precio y las condiciones', flag_third_party: 'Un tercero paga o da instrucciones', flag_cash: 'Se ofrece efectivo para todo o parte del precio', flag_country: 'Fondos o partes vinculados a una jurisdicción de riesgo',
    flags_none: 'Ninguna anotada.',
    flags_note: 'Son señales de alerta habituales en operaciones inmobiliarias, no una lista oficial.',
    a_keep: 'Conservar este registro y las copias de los documentos durante {years} años desde el fin de la relación o la operación.',
    a_report: 'Si algo indica blanqueo de capitales, comunicarlo al SEPBLAC. No revelar nunca al cliente que se ha comunicado o se está valorando hacerlo.',
    a_enhanced: 'Aplicar medidas reforzadas antes de continuar: obtener y comprobar la acreditación del origen de los fondos, y dejar constancia de quién decidió seguir y por qué.',
    a_internal: 'Seguir los procedimientos internos de la agencia. Este registro no los sustituye.',
  },
};

export function fill(s, v) {
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : ''));
}
