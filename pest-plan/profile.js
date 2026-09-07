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

export function buildProfile(a, c) {
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

  const why = {
    cockroaches:
      empty
        ? 'Every property has pipes and cockroaches do not mind coming in up one, which puts them near the top whatever else you told us. A property that stands empty for months hands them free rein for long periods, and that is the condition the guide singles out.'
        : 'Every property has pipes, and the guide is clear that cockroaches do not mind coming into a home that way. That is why they sit high here regardless of your other answers. Being lived in is genuine protection, because most of what keeps them out is daily habit.',
    rats:
      house
        ? `A house with its own roof${around('garden') ? ' and a garden' : ''} is precisely what the guide describes: rats are a real problem in rural settings, and in homes with roofs or gardens they can hide in.${inland ? ' Inland, both halves of that apply at once.' : ''}`
        : `An apartment gives them less to hide in than a house does, so they sit lower here.${inland ? ' Inland is the exception the guide names, because rural settings are where they are a real problem.' : ''}`,
    mosquitoes:
      warm === 0
        ? 'The guide places mosquitoes in the warm months, so a winter question puts them well down the list. They come back with the weather.'
        : `The guide names two conditions and you have ${veg && around('pool') ? 'both' : 'one'}: mosquitoes are very common in Spain, especially in humid areas or where there is a lot of vegetation.${around('pool') ? ' A pool keeps the ground and the air around it damp.' : ''}${veg ? ' Planting and trees are the vegetation half.' : ''}`,
    ants:
      inland
        ? 'This is the one place the guide gets regionally specific. Ants are named as a particular nuisance in more rural areas, and interior villages are the example it gives.'
        : 'Ants turn up across Spain, but the guide puts them at their worst in rural areas and interior villages rather than on the coast.',
    moths:
      empty
        ? 'This is the pest of an empty house. Pantry moths and cockroaches both get free rein over a long absence, and with moths the bill is the whole dry food store.'
        : 'Pantry moths are mostly a problem of dry food left standing for months. A property in regular use gets through its cupboards, which is most of the defence.',
    flies:
      warm === 0
        ? 'The guide describes flies as a nuisance of the warmer months, which puts them low for a winter question.'
        : 'Flies are a real nuisance in the warmer months, and what they are coming for is food left out and a bin that has been standing in Spanish heat.',
    fruitflies:
      around('garden')
        ? 'Fruit flies love hot and humid conditions, and the guide gives two examples of exactly what you have: well watered pot plants, and ripe Spanish fruit lying around.'
        : 'Fruit flies want hot and humid conditions and something ripe to go at. Without planting or fruit sitting out they have less reason to be there.',
  };

  const signs = {
    cockroaches: [
      'Seeing one. The guide is blunt about this: the first time you see a cockroach scuttle across the floorboards, more are likely to be lurking nearby.',
      'Hissing from behind the cupboards.',
      'Do not rule them out because it was in the air. Some types of cockroach in Spain can fly.',
    ],
    rats: [
      'Scuttling in the roof.',
      'Gnaw marks, droppings, damaged fabrics and furniture.',
      'An unaccounted for smell in the house.',
      'A dog or a cat behaving oddly, or spending time in a part of the house it did not use before.',
    ],
    mosquitoes: [
      'The sound, usually just as you are about to fall asleep.',
    ],
    ants: [
      'You see them, and by then they are already going somewhere specific. The guide describes no earlier sign than the insect itself, and honestly there is not much of one.',
    ],
    moths: [
      'Moths flying in every direction, and at that point almost all of the dry food store has to be thrown away.',
    ],
    flies: [
      'You see them. Flies are the one on this list that does not hide.',
    ],
    fruitflies: [
      'They show up around the pot plants and the fruit first, which is also where the cause is sitting.',
    ],
  };

  const action = {
    cockroaches: 'Insect sprays sold in any Spanish supermarket work well against cockroaches, and bay leaves at the back of the cupboards repel them for the price of a jar. An established infestation is a pest control job.',
    rats: 'Not yours. The guide is direct: with mice and rats you may have to take more drastic measures, and a pest control company is what actually clears vermin.',
    mosquitoes: 'Prevention rather than treatment. Window nets and a screen door are what keep them out, and basil, mint, lavender and lemongrass are the plants that repel them.',
    ants: 'Yours to handle. Keep food sealed and shut the ways in, and use a supermarket spray on the trail if it comes to that.',
    moths: 'Yours to handle, and mostly by emptying the cupboards. Bay leaves at the back of the shelf repel moths as well as cockroaches.',
    flies: 'Yours to handle. An electric fly swat or sticky paper deals with what is already inside, and supermarket sprays work well against flies. Nets stop the next lot.',
    fruitflies: 'Yours to handle. Take away the fruit and the standing damp in the pot saucers and they leave, because there is nothing else keeping them there.',
  };

  const ranked = CATALOGUE
    .map((p, i) => ({ ...p, order: i, score: score[p.key], why: why[p.key], signs: signs[p.key], action: action[p.key] }))
    .sort((x, y) => (y.score - x.score) || (x.order - y.order))
    .map((p, i) => ({ ...p, rank: i + 1, route: p.key === 'rats' ? 'pro' : 'diy' }));

  return {
    ranked,
    top: ranked.slice(0, 3),
    rest: ranked.slice(3),
    ratsHigh: ranked.slice(0, 3).some(p => p.key === 'rats'),
    isWinter: a.season === 'winter',
    coverage: coverageFor(a.region),
    generalSigns: [
      'The pest itself. Obvious, and still the one most owners see first.',
      'Signs they have been there: gnaw marks, droppings, dead plants, damaged fabrics and furniture.',
      'An unaccounted for smell.',
      'Pets behaving oddly, or spending time in a part of the house they did not use before.',
      'Strange noises. Hissing behind the cupboards is cockroaches. Scuttling in the roof is rats or mice.',
    ],
    prevention: prevention(a, c, { veg, empty, around }),
    diy: [
      'Insect traps for what is already inside: an electric fly swat, or sticky paper.',
      'Insect sprays, sold in most Spanish supermarkets, which work well against cockroaches and flies.',
      'Repellent plants: basil, mint, lavender, lemongrass.',
      'Bay leaves at the back of the cupboards. They repel moths and cockroaches, and they need nobody to be in the house.',
    ],
    pro: [
      'Mice and rats. This is where doing it yourself stops and more drastic measures start.',
      'Anything established rather than occasional, whatever the species.',
      'Pest control companies operate across Spain. Many are conscious of the stigma and work in unmarked vans, which matters more than it should if you have neighbours in a block.',
    ],
  };
}

function coverageFor(region) {
  if (region === 'inland') {
    return {
      kind: 'named',
      body: 'Inland is the one place the guide behind this tool is regionally specific about, and it is specific about ants: they are worst in more rural areas, and interior villages are the example given. Rats get the same treatment, named as a real problem in rural settings. Everything else in your ranking comes from your property and the season.',
    };
  }
  if (region === 'costa-blanca') {
    return {
      kind: 'partial',
      body: 'The guide names the Costa Blanca once, and it names the interior villages rather than the coast, for ants. Nothing in it is specific to your stretch of coastline. So the ranking above is built from your property, the season, and what the guide says about damp and vegetation, and not from anything about the Costa Blanca itself.',
    };
  }
  if (region === 'north') {
    return {
      kind: 'none',
      body: 'The guide behind this tool has nothing region specific about the north coast, and it is written around warm, dry Spain. Yours is neither. Treat the ranking as a starting point built from your property and the season rather than from your climate, and weigh damp related trouble higher than this page can.',
    };
  }
  const names = {
    'costa-del-sol': 'the Costa del Sol',
    balearics: 'the Balearics',
    canaries: 'the Canaries',
  };
  return {
    kind: 'none',
    body: `The guide behind this tool says nothing specific about ${names[region] || 'your region'}. We would rather say that than invent a local pest for you. The ranking above still holds, because it is built from things you told us that the guide does cover: the season, whether there is vegetation and damp next to the building, whether it has its own roof and garden, and how long it stands empty.`,
  };
}

function prevention(a, c, { veg, empty, around }) {
  const groups = [];

  const food = [
    {
      text: 'Put food away, in something sealed, every time',
      why: 'The guide puts this first of everything, and it is the part entirely inside your control. Flies, fruit flies and cockroaches are all heading for the same place.',
    },
    {
      text: 'Empty the bins far more often than you would at home',
      why: 'Spanish heat turns waste faster, which is why the street bins are emptied so often. Your kitchen bin is on the same clock and nobody empties that one for you.',
    },
  ];
  if (around('garden') || around('trees')) {
    food.push({
      text: 'Pick up the fallen fruit and do not leave ripe fruit sitting out',
      why: 'Ripe fruit lying around is the thing fruit flies come for. It is the cheapest fix on this page and the one most often skipped.',
    });
  }
  groups.push({ title: c('g_food'), note: c('g_food_note'), items: food });

  const ways = [
    {
      text: 'Fit window nets, and a screen door on the doorway you actually use',
      why: 'A window net is a mesh frame that fits on the outside of the window. It is what lets you sleep with the window open in Spain instead of choosing between heat and mosquitoes. A bead door does the same job on a doorway and plenty of people still swear by them.',
    },
    {
      text: 'Clean out the backs of the cupboards and fill every hole and crack you find',
      why: 'A crack at the back of a cupboard with food in front of it is a door with a sign on it. This is the job that gets put off because nothing visible is wrong.',
    },
    {
      text: 'Put the plug in the drain overnight, and pour boiling water down the plugholes regularly',
      why: 'Cockroaches do not mind coming into a house up a pipe. A plug and a kettle is most of the defence against the pest the guide calls the worst of them.',
    },
  ];
  groups.push({ title: c('g_ways'), note: c('g_ways_note'), items: ways });

  if (veg || around('pool')) {
    const outside = [];
    if (veg) {
      outside.push({
        text: 'Keep the garden cut and the hedges and trees trimmed back off the walls and the roofline',
        why: 'An overgrown garden is where the pests you do not want hide, and growth touching the building is a way up onto the roof for the ones that want the roof.',
      });
    }
    if (around('pool')) {
      outside.push({
        text: 'Keep the pool treated and filtering in the weeks you are not there, not only the weeks you are',
        why: 'Untreated water fills with bacteria and fungi, and the pool area is standing damp of exactly the kind mosquitoes are drawn to. Neither problem waits for your next visit.',
      });
    }
    groups.push({ title: c('g_outside'), items: outside });
  }

  if (empty) {
    groups.push({
      title: c('g_away'),
      note: c('g_away_note'),
      items: [
        {
          text: 'Empty the cupboards of every dry food before you fly: flour, pasta, grains, tea',
          why: 'Pantry moths and cockroaches love having free rein for long periods, and with moths the end of it is throwing out the whole dry store, usually the containers with it.',
        },
        {
          text: 'Empty every bin and take the rubbish off the property, not onto the terrace',
          why: 'Anything left in a bin over a Spanish summer stops being rubbish and becomes bait.',
        },
        {
          text: 'Put bay leaves at the back of any cupboard you leave stocked',
          why: 'They repel moths and cockroaches, they cost almost nothing, and they are the only thing on this list that keeps working with nobody in the house.',
        },
        {
          text: 'Leave the plugs in the drains',
          why: 'Same reason as the overnight plug, for months instead of a night.',
        },
      ],
    });
  }

  return groups;
}
