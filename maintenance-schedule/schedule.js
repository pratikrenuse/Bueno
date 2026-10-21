// Builds the twelve-month maintenance schedule from the five answers.
//
// Same rule as closing-up/list.js: every item earns its place by preventing something
// specific, and the "why" says what. "Check for damage" is not a job, it is a shrug.
//
// Two answers do most of the work here.
//
// Coastal. Salt gets into metal fixtures and they end up replaced rather than repaired,
// and coastal humidity brings mould, wood rot and corrosion with it. So a coastal property
// gets jobs an inland one does not need at all, and gets them earlier.
//
// How often the owner visits. A schedule spread across twelve months is useless to someone
// who lands once a year. For them the seasons still explain why each job sits where it
// does, but the work gets batched into the visit that pays best and the rest becomes
// somebody else's job.

import copyDict from './copy.js';

// Item text lives in copy.js under items.<id>, in all six languages, so the logic below
// only decides which ids apply. Called without a copy function it reads English.
const enCopy = path => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), copyDict.en) ?? path;

const has = (a, k) => a.features.includes(k);
const coastal = a => a.location === 'coastal';
const older = a => a.age === 'pre1980' || a.age === '8090';
const absent = a => a.visits === 'rare' || a.visits === 'few';

export function buildSchedule(a, c = enCopy) {
  const groups = [];
  const it = id => ({ text: c(`items.${id}.text`), why: c(`items.${id}.why`) });

  // --- Do this first. Only what the answers actually flagged. ----------------
  const first = [];

  if (a.age === 'unsure') {
    first.push(it('unsure_year'));
  }

  if (coastal(a) && older(a)) {
    first.push(it('coastal_rust'));
  }

  if (has(a, 'pool') && absent(a)) {
    first.push(it('pool_service'));
  }

  if (has(a, 'solar')) {
    first.push(it('solar_cover'));
  }

  if (has(a, 'garden') && a.visits === 'rare') {
    first.push(it('garden_away'));
  }

  if (coastal(a) && has(a, 'aircon') && !older(a)) {
    first.push(it('aircon_salt'));
  }

  if (first.length) {
    groups.push({ title: c('g_first'), note: c('g_first_note'), items: first });
  }

  // --- Spring. Undo the winter, get in front of the summer. ------------------
  const spring = [
    it('gutters_spring'),
    it('facade'),
    it('taps'),
    it('damp_wardrobes'),
  ];

  if (has(a, 'aircon')) {
    spring.push(it('aircon_filters'));
  }

  if (coastal(a)) {
    spring.push(it('salt_wash'));
  }

  if (older(a)) {
    spring.push(it('frames'));
  }

  if (has(a, 'garden')) {
    spring.push(it('garden_spring'));
  }

  if (has(a, 'pool')) {
    spring.push(it('pool_open'));
  }

  groups.push({ title: c('g_spring'), note: c('note_spring'), items: spring });

  // --- Summer. Outdoor systems under load, so faults show. -------------------
  const summer = [
    it('outdoor_pipes'),
    it('descale'),
    it('insurance_read'),
    it('community_invoice'),
  ];

  if (has(a, 'pool')) {
    summer.push(it('pool_summer'));
  }

  if (coastal(a)) {
    summer.push(it('softener'));
  }

  if (has(a, 'aircon') && a.visits === 'monthly') {
    summer.push(it('aircon_rinse'));
  }

  groups.push({ title: c('g_summer'), note: c('note_summer'), items: summer });

  // --- Autumn. The heaviest season. Everything sits in front of the rain. ----
  const autumn = [];

  if (a.type === 'house') {
    autumn.push(it('roof_house'));
  } else {
    autumn.push(it('roof_flat'));
  }

  autumn.push(it('gutters_autumn'));

  autumn.push(it('alarm_test'));

  autumn.push(it('repaint'));

  if (has(a, 'boiler')) {
    autumn.push(it('boiler'));
  }

  if (has(a, 'garden')) {
    autumn.push(it('garden_walls'));
  }

  if (has(a, 'pool')) {
    autumn.push(it('pool_winter'));
  }

  autumn.push(it('ibi_dates'));

  groups.push({
    title: c('g_autumn'),
    note: a.visits === 'rare' ? c('note_autumn_rare') : c('note_autumn'),
    items: autumn,
  });

  // --- Winter. Mostly desk work, which suits an owner who is not there. ------
  const winter = [
    it('ceilings'),
    it('floors'),
    it('review_year'),
    it('ring_round'),
  ];

  if (a.location === 'inland') {
    winter.push(it('freeze'));
  }

  if (a.visits === 'monthly') {
    winter.push(it('heating_run'));
  }

  groups.push({ title: c('g_winter'), note: c('note_winter'), items: winter });

  // --- What has to happen when you are not there. ---------------------------
  if (absent(a)) {
    const away = [];

    if (a.visits === 'rare') {
      away.push(it('batch_autumn'));
    }

    away.push(it('keyholder'));

    away.push(it('storm_photos'));

    away.push(it('alarm_monitored'));

    if (has(a, 'pool')) {
      away.push(it('pool_visits'));
    }

    if (has(a, 'garden')) {
      away.push(it('garden_cut'));
    }

    away.push(it('dd_account'));

    groups.push({
      title: c('g_absent'),
      note: a.visits === 'rare' ? c('note_absent_rare') : c('note_absent_few'),
      items: away,
    });
  }

  return groups;
}

// True when the answers produced a "do this first" block, so the result screen can lead
// with that rather than with the calendar.
export function hasUrgent(a) {
  return (
    a.age === 'unsure' ||
    (a.location === 'coastal' && (a.age === 'pre1980' || a.age === '8090')) ||
    (a.features.includes('pool') && (a.visits === 'rare' || a.visits === 'few')) ||
    a.features.includes('solar') ||
    (a.features.includes('garden') && a.visits === 'rare') ||
    (a.location === 'coastal' && a.features.includes('aircon'))
  );
}
