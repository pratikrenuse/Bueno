// Builds the pest risk profile from the five answers.
//
// Every species, every warning sign and every treatment on this page comes from one
// published guide to pest problems in Spanish holiday homes. Nothing has been added to
// that list, and where the guide gives a sign, the sign is in its words.
//
// That constraint decides how the ranking works. The guide is explicit about a small
// number of drivers and silent about the rest, so only the explicit ones move a score:
//
//   warm months            flies, mosquitoes, fruit flies
//   humidity or vegetation mosquitoes
//   well watered pots      fruit flies
//   rural or interior      ants, rats
//   a roof or a garden     rats
//   long empty periods     cockroaches, pantry moths
//   dry food over summer   pantry moths
//
// Cockroaches, ants and rats are given no seasonal movement at all, because the guide
// does not give them any. Inventing one would be the easiest thing on this page to get
// wrong and the hardest for a reader to check.
//
// The regions are the other honesty problem. The guide names exactly one: the interior
// villages of the Costa Blanca, and it names them for ants. For every other region this
// file returns a coverage note saying so, rather than dressing up a guess.

import copyDict from './copy.js';

// Called without a copy function, the profile reads English.
const enCopy = path => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), copyDict.en) ?? path;

// The English names stay here as the record of the catalogue. What the reader sees comes
// from copy.js under names.<key>.
const CATALOGUE = [
  // Ordered by how much trouble each one is, which is also the tiebreak when two score
  // the same. The guide calls cockroaches "probably the worst of them".
  { key: 'cockroaches', name: 'Cockroaches' },
  { key: 'rats', name: 'Rats' },
  { key: 'mosquitoes', name: 'Mosquitoes' },
  { key: 'ants', name: 'Ants' },
  { key: 'moths', name: 'Pantry moths' },
  { key: 'flies', name: 'Flies' },
  { key: 'fruitflies', name: 'Fruit flies' },
];

const WARM = { summer: 3, spring: 2, autumn: 2, winter: 0 };

export function buildProfile(a, c = enCopy) {
  const around = k => a.around.includes(k);
  const veg = around('garden') || around('trees');
  const empty = a.empty === 'yes';
  const inland = a.region === 'inland';
  const house = a.type === 'house';
  const warm = WARM[a.season] ?? 0;

  const score = {
    cockroaches: 4 + (empty ? 2 : 0),
    rats: 2 + (house ? 2 : 0) + (around('garden') ? 2 : 0) + (around('trees') ? 1 : 0) + (inland ? 2 : 0),
    mosquitoes: 2 + warm + (veg ? 2 : 0) + (around('pool') ? 1 : 0),
    ants: 2 + (inland ? 3 : 0),
    moths: 1 + (empty ? 3 : 0) + (a.season === 'summer' ? 2 : 0),
    flies: 2 + warm,
    fruitflies: 1 + warm + (around('garden') ? 2 : 0),
  };

  // Every sentence below is read from copy.js, in the reader's language. The branches are
  // the same ones the English was written with; each variant is a whole sentence in copy.
  const add = (base, extra) => (extra ? `${base} ${extra}` : base);
  const why = {
    cockroaches: c(empty ? 'why.cockroaches_empty' : 'why.cockroaches'),
    rats: house
      ? add(c(around('garden') ? 'why.rats_house_garden' : 'why.rats_house'), inland && c('why.rats_house_inland'))
      : add(c('why.rats_flat'), inland && c('why.rats_flat_inland')),
    mosquitoes:
      warm === 0
        ? c('why.mosquitoes_winter')
        : add(add(c(veg && around('pool') ? 'why.mosquitoes_both' : 'why.mosquitoes_one'),
            around('pool') && c('why.mosquitoes_pool')), veg && c('why.mosquitoes_veg')),
    ants: c(inland ? 'why.ants_inland' : 'why.ants'),
    moths: c(empty ? 'why.moths_empty' : 'why.moths'),
    flies: c(warm === 0 ? 'why.flies_winter' : 'why.flies'),
    fruitflies: c(around('garden') ? 'why.fruitflies_garden' : 'why.fruitflies'),
  };

  const signs = Object.fromEntries(CATALOGUE.map(p => [p.key, c(`signs.${p.key}`)]));
  const action = Object.fromEntries(CATALOGUE.map(p => [p.key, c(`action.${p.key}`)]));

  const ranked = CATALOGUE
    .map((p, i) => ({ ...p, name: c(`names.${p.key}`), order: i, score: score[p.key], why: why[p.key], signs: signs[p.key], action: action[p.key] }))
    .sort((x, y) => (y.score - x.score) || (x.order - y.order))
    .map((p, i) => ({ ...p, rank: i + 1, route: p.key === 'rats' ? 'pro' : 'diy' }));

  return {
    ranked,
    top: ranked.slice(0, 3),
    rest: ranked.slice(3),
    ratsHigh: ranked.slice(0, 3).some(p => p.key === 'rats'),
    isWinter: a.season === 'winter',
    coverage: coverageFor(a.region, c),
    generalSigns: c('general_signs'),
    prevention: prevention(a, c, { veg, empty, around }),
    diy: c('diy'),
    pro: c('pro'),
  };
}

function coverageFor(region, c) {
  if (region === 'inland') return { kind: 'named', body: c('coverage.inland') };
  if (region === 'costa-blanca') return { kind: 'partial', body: c('coverage.costa_blanca') };
  if (region === 'north') return { kind: 'none', body: c('coverage.north') };
  const known = ['costa-del-sol', 'balearics', 'canaries'].includes(region);
  const name = c(`coverage.region_${known ? region.replace(/-/g, '_') : 'other'}`);
  return { kind: 'none', body: c('coverage.none').replace('{region}', name) };
}

function prevention(a, c, { veg, empty, around }) {
  const groups = [];
  const it = id => ({ text: c(`items.${id}.text`), why: c(`items.${id}.why`) });

  const food = [
    it('food_sealed'),
    it('bins'),
  ];
  if (around('garden') || around('trees')) {
    food.push(it('fallen_fruit'));
  }
  groups.push({ title: c('g_food'), note: c('g_food_note'), items: food });

  const ways = [
    it('nets'),
    it('cupboards'),
    it('plugs'),
  ];
  groups.push({ title: c('g_ways'), note: c('g_ways_note'), items: ways });

  if (veg || around('pool')) {
    const outside = [];
    if (veg) {
      outside.push(it('garden_trim'));
    }
    if (around('pool')) {
      outside.push(it('pool_treated'));
    }
    groups.push({ title: c('g_outside'), items: outside });
  }

  if (empty) {
    groups.push({
      title: c('g_away'),
      note: c('g_away_note'),
      items: [
        it('away_dry_food'),
        it('away_bins'),
        it('away_bay'),
        it('away_plugs'),
      ],
    });
  }

  return groups;
}
