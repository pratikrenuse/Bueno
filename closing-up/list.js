// Builds the checklist from the five answers.
//
// The rule of this file: every item earns its place by preventing something specific, and
// the "why" says what. A checklist of generic advice is worse than the article it came
// from. Items are ordered by what they protect, and groups are ordered by how much damage
// skipping them does in that particular situation.

const has = (a, k) => a.extras.includes(k);
const isLong = a => a.away === 'long';
const isShortish = a => a.away === 'short';

export function buildList(a, c) {
  const groups = [];
  // Each item's text and why live in copy.js under items.<key>, in every locale.
  const it = k => ({ text: c(`items.${k}.t`), why: c(`items.${k}.w`) });

  // --- Water. First, always. A slow leak is the most expensive thing in an empty house.
  const water = [
    it('stopcock'),
    it('drain_taps'),
    it('heater'),
    it('check_sinks'),
  ];
  if (!isShortish(a)) {
    water.push(it('appliances'));
  }
  if (a.season === 'winter' && a.type === 'villa') {
    water.push(it('outdoor_pipes'));
  }
  groups.push({ title: c('g_water'), note: c('g_water_note'), items: water });

  // --- Power.
  const power = [
    it('unplug'),
    it('decide_on'),
  ];
  if (isShortish(a)) {
    power.push(it('fridge_on'));
  } else {
    power.push(it('fridge_empty'));
  }
  if (has(a, 'aircon')) {
    power.push(it('aircon_fan'));
    power.push(it('aircon_filters'));
  }
  groups.push({ title: c('g_power'), items: power });

  // --- Pests.
  const pests = [
    it('bins'),
    it('food'),
    it('oil'),
    it('lids'),
    it('seals'),
  ];
  if (a.season === 'summer' || a.season === 'shoulder') {
    pests.push(it('standing_water'));
  }
  if (a.type === 'villa' && has(a, 'garden')) {
    pests.push(it('cut_back'));
  }
  groups.push({ title: c('g_pests'), note: c('g_pests_note'), items: pests });

  // --- Damp and air.
  const damp = [
    it('doors_open'),
    it('furniture'),
  ];
  if (a.season === 'winter' || isLong(a)) {
    damp.push(it('absorbers'));
    damp.push(it('vent'));
  }
  if (a.type === 'apartment') {
    damp.push(it('administrador'));
  }
  groups.push({ title: c('g_damp'), items: damp });

  // --- Security and occupation.
  // NOTE: no 48-hour rule. It does not exist in Spanish law. See rules/squatting.json.
  const sec = [
    it('timers'),
    it('persianas'),
    it('photos'),
    it('meters'),
    it('keys'),
  ];
  if (a.checker === 'no') {
    sec.push(it('find_someone'));
  } else {
    sec.push(it('give_key'));
    sec.push(it('agree_checks'));
  }
  if (isLong(a)) {
    sec.push(it('evidence'));
    sec.push(it('company'));
  }
  sec.push(it('policy_unoccupied'));
  groups.push({ title: c('g_security'), note: c('g_security_note'), items: sec });

  // --- Pool.
  if (has(a, 'pool')) {
    const pool = [
      it('pool_balance'),
      it('pool_pump'),
      it('pool_level'),
    ];
    if (!isShortish(a)) pool.push(it('pool_service'));
    if (a.season === 'winter') pool.push(it('pool_cover'));
    groups.push({ title: c('g_pool'), items: pool });
  }

  // --- Garden.
  if (has(a, 'garden')) {
    const garden = [
      it('irrigation'),
      it('pots'),
      it('grass'),
    ];
    if (isLong(a)) garden.push(it('cut_once'));
    groups.push({ title: c('g_garden'), items: garden });
  }

  // --- Money and paperwork.
  const money = [
    it('debit_balance'),
    it('community_fee'),
    it('expiry'),
    it('bank_reach'),
  ];
  if (isLong(a)) {
    money.push(it('tax_dates'));
  }
  groups.push({ title: c('g_money'), note: c('g_money_note'), items: money });

  // --- Arrange before you fly.
  const arrange = [
    it('key_holder'),
    it('alarm'),
    it('emergency'),
  ];
  if (!isShortish(a)) arrange.push(it('post'));
  groups.push({ title: c('g_arrange'), items: arrange });

  return groups;
}
