// Builds the ordered utility plan from the six answers.
//
// The value of this tool is the sequence and the dependencies, which prose hides. Three
// of them matter more than everything else:
//
//   1. The NIE gates contracting. A supply contract is issued to a named person with a
//      Spanish identity number, so without it nothing goes into your name.
//   2. The Spanish account gates the direct debits, and the direct debits are how the
//      supply stays on once you leave the country.
//   3. On a property that has been off supply, the electrical installation certificate
//      gates energisation, and it needs a physical visit. It is the longest lead time on
//      the page and almost nobody puts it first.
//
// Same rule as the other generators: every item earns its place by preventing something
// specific, and the "why" says what. No figures anywhere in this file. The gas inspection
// cost, the certificate cost and the antiquity periods that appear in the source articles
// are not in the rules base, so they are described and not quoted.

import copyDict from './copy.js';

// Item text, gate rows and contacts live in copy.js in all six languages. This file only
// decides which ids apply. Called without a copy function it reads English.
const enCopy = path => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), copyDict.en) ?? path;

const off = a => a.supply === 'off';
const dormant = a => a.supply === 'dormant';
const unknownSupply = a => a.supply === 'unknown';
const mayNeedBoletin = a => off(a) || dormant(a) || unknownSupply(a);
const buying = a => a.stage === 'buying';

// --- the gates ------------------------------------------------------------------------
// Returned separately from the list because this is the answer, and the answer goes above
// the list rather than inside it.
export function buildGates(a, c = enCopy) {
  const nieOpen = a.nie !== 'have';
  const accountOpen = a.account !== 'spanish';
  const supplyOpen = mayNeedBoletin(a);

  const verdict = nieOpen ? 'nie' : supplyOpen ? 'installer' : accountOpen ? 'account' : 'clear';

  const rows = [
    {
      label: c('gate.contract'),
      value: nieOpen
        ? c(a.nie === 'applied' ? 'gate.contract_waiting' : 'gate.contract_blocked')
        : c('gate.open'),
      strong: nieOpen,
    },
    {
      label: c('gate.dd'),
      value: a.account === 'spanish'
        ? c('gate.open')
        : a.account === 'foreign'
          ? c('gate.dd_foreign')
          : c('gate.dd_blocked'),
      strong: accountOpen,
    },
    {
      label: c('gate.power'),
      value: off(a)
        ? c('gate.power_off')
        : dormant(a)
          ? c('gate.power_dormant')
          : unknownSupply(a)
            ? c('gate.power_unknown')
            : c('gate.power_live'),
      strong: supplyOpen,
    },
    {
      label: c('gate.water'),
      value: c('gate.water_value'),
    },
  ];

  return { verdict, rows, nieOpen, accountOpen, supplyOpen };
}

// --- the ordered list -----------------------------------------------------------------
export function buildSteps(a, c = enCopy) {
  const groups = [];
  const it = id => ({ text: c(`items.${id}.text`), why: c(`items.${id}.why`) });

  // 1. The gates. Only appears when something is actually blocking, so an owner who is
  //    ready does not read a group of things that do not apply to them.
  const gates = [];
  if (a.nie === 'none') {
    gates.push(it('gate_nie_apply'));
  }
  if (a.nie === 'applied') {
    gates.push(it('gate_nie_cert'));
  }
  if (a.account === 'none') {
    gates.push(it('gate_account_open'));
  }
  if (a.account === 'foreign') {
    gates.push(it('gate_iban_test'));
  }
  if (mayNeedBoletin(a)) {
    gates.push(it('gate_installer'));
  }
  if (gates.length) groups.push({ title: c('g_gates'), note: c('g_gates_note'), items: gates });

  // 2. The document pack. Identical for every counter, which is the point.
  const folder = [
    it('doc_id'),
    it('doc_nie'),
    it('doc_iban'),
    it('doc_ownership'),
  ];
  if (buying(a)) {
    folder.push(it('buy_last_bills'));
    folder.push(it('buy_paid_up'));
    folder.push(it('buy_meter_photos'));
    folder.push(it('buy_no_cancel'));
  }
  groups.push({ title: c('g_folder'), note: c('g_folder_note'), items: folder });

  // 3. Electricity. Ordered by lead time, longest first.
  const elec = [];
  if (mayNeedBoletin(a)) {
    elec.push(it('elec_boletin'));
  }
  if (off(a) || unknownSupply(a)) {
    elec.push(it('elec_supply_point'));
  }
  if (a.plan === 'takeover' || a.plan === 'unsure') {
    elec.push(it('elec_titularidad'));
  }
  if (a.plan === 'switch') {
    elec.push(it('elec_name_first'));
    elec.push(it('elec_three_questions'));
  }
  elec.push(it('elec_potencia'));
  if (a.type === 'villa' || a.type === 'rural') {
    elec.push(it('elec_phase'));
  }
  if (a.type === 'apartment') {
    elec.push(it('elec_block'));
  }
  if (a.type === 'rural') {
    elec.push(it('elec_no_mains'));
  }
  groups.push({ title: c('g_elec'), note: c('g_elec_note'), items: elec });

  // 4. Water. Municipal, so it starts at a counter rather than a call centre.
  const water = [
    it('water_counter'),
    it('water_folder'),
  ];
  if (off(a) || unknownSupply(a)) {
    water.push(it('water_no_connection'));
  }
  if (a.type === 'apartment') {
    water.push(it('water_own_meter'));
  }
  if (a.type === 'rural') {
    water.push(it('water_well'));
    water.push(it('water_deposit'));
  }
  water.push(it('water_meter_access'));
  water.push(it('water_other_charges'));
  groups.push({ title: c('g_water'), note: c('g_water_note'), items: water });

  // 5. Gas. Often nothing to do, and saying so is the useful part.
  const gas = [
    it('gas_mains'),
    it('gas_bottles'),
    it('gas_inspection'),
  ];
  if (dormant(a) || off(a)) {
    gas.push(it('gas_old_install'));
  }
  if (a.plan === 'switch') {
    gas.push(it('gas_combined'));
  }
  groups.push({ title: c('g_gas'), note: c('g_gas_note'), items: gas });

  // 6. Internet.
  const net = [
    it('net_coverage'),
    it('net_keep_line'),
    it('net_min_term'),
  ];
  if (a.type === 'apartment') {
    net.push(it('net_block_fibre'));
  }
  if (a.type === 'rural') {
    net.push(it('net_no_fibre'));
  }
  groups.push({ title: c('g_net'), note: c('g_net_note'), items: net });

  // 7. The council. The one nobody is told about.
  const council = [
    it('council_register'),
    it('council_billing'),
    it('council_dd'),
    it('council_ibi'),
  ];
  if (a.type === 'apartment') {
    council.push(it('council_community'));
  }
  groups.push({ title: c('g_council'), note: c('g_council_note'), items: council });

  // 8. Direct debits. Its own group, because this is where a working set of utilities
  //    quietly stops working.
  const dd = [
    it('dd_same_time'),
    it('dd_name'),
    it('dd_date'),
    it('dd_buffer'),
    it('dd_returned'),
    it('dd_receipts'),
    it('dd_change_bank'),
    it('dd_old_account'),
    it('dd_first_bill'),
  ];
  if (a.account === 'foreign') {
    dd.push(it('dd_foreign_start'));
  }
  groups.push({ title: c('g_dd'), note: c('g_dd_note'), items: dd });

  // 9. What it all commits you to. The part the setup guides leave out.
  const ongoing = [
    it('on_cycle'),
    it('on_standing'),
    it('on_gas_inspection'),
    it('on_estimates'),
    it('on_refuse'),
    it('on_tariff'),
  ];
  if (a.type === 'apartment') {
    ongoing.push(it('on_community'));
  }
  groups.push({ title: c('g_ongoing'), note: c('g_ongoing_note'), items: ongoing });

  return groups;
}

// Who you deal with for each supply. Flat, because the answer differs per utility and
// that is exactly the thing owners get wrong. buildContacts reads the same rows from
// copy.js in the reader's language; CONTACTS stays as the English export.
const CONTACT_KEYS = ['electricity', 'water', 'gas', 'internet', 'refuse'];
export function buildContacts(c = enCopy) {
  return CONTACT_KEYS.map(k => ({ label: c(`contacts.${k}.label`), value: c(`contacts.${k}.value`) }));
}

export const CONTACTS = [
  { label: 'Electricity', value: 'The supplier you choose, direct. Faults at the meter belong to the distribution company, which you do not choose.' },
  { label: 'Water', value: 'The ayuntamiento, or the company holding its concession. There is no choice of supplier.' },
  { label: 'Gas', value: 'Mains: the supplier, like electricity. Bottled or tank: the local depot.' },
  { label: 'Internet', value: 'The provider, direct. Nothing goes through the town hall.' },
  { label: 'Refuse', value: 'The ayuntamiento. Billed to the property, on its own calendar.' },
];
