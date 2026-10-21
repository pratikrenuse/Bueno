// All user-facing text for the pest plan.
//
// The pest names, the warning signs and the treatments all come from one published guide
// to pest problems in Spanish holiday homes. Nothing is added to that list. Where the guide
// gives a warning sign, this copy uses its words.
import no from './locales/no.js';
import sv from './locales/sv.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import nl from './locales/nl.js';

// English is here; the other five languages live in locales/, one file each, with the
// same key paths. profile.js reads every sentence it shows from these keys.
const en = {
  eyebrow: 'Free tool',
  headline: 'What is likely to get into your Spanish property, and what stops it',
  body: 'Warmer weather brings pests that owners from northern Europe have never had to think about. Which ones you get depends on where the property is, what is growing around it, and how long it stands empty.',
  points: [
    'Five questions, then a ranked list for your property',
    'The signs to look for, in each case',
    'And a straight answer on which ones are not a job for you',
  ],
  cta: 'Build my pest plan',
  minutes: 'About a minute',

  q_region: 'Where is the property?',
  q_region_hint: 'We are honest about the limits of this one. The guide behind this tool names only a couple of places, so if yours is not one of them we will say so rather than guess.',
  region_costa_blanca: 'Costa Blanca',
  region_costa_del_sol: 'Costa del Sol',
  region_balearics: 'The Balearics',
  region_canaries: 'The Canaries',
  region_inland: 'Inland Spain',
  region_inland_d: 'An interior town or village, away from the coast',
  region_north: 'The north coast',
  region_north_d: 'Galicia, Asturias, Cantabria, the Basque Country',

  q_type: 'What kind of property is it?',
  type_apartment: 'Apartment',
  type_apartment_d: 'In a block, with neighbours above and below',
  type_house: 'House or villa',
  type_house_d: 'Its own roof, its own walls, its own way in',

  q_around: 'What is right next to the building?',
  q_around_hint: 'Tap any that apply. Vegetation and damp are two of the three things that decide this.',
  around_garden: 'A garden or planted terrace',
  around_pool: 'A pool',
  around_trees: 'Trees close to the walls or roof',
  around_none: 'None of these',

  q_empty: 'Does it stand empty for long stretches?',
  q_empty_hint: 'Months at a time, rather than a fortnight between visits. Some pests are specifically a problem of an empty house.',
  empty_yes: 'Yes, months at a time',
  empty_no: 'No, it is lived in or visited often',

  q_season: 'Which season are you asking about?',
  q_season_hint: 'Most of this list is warm weather trouble. The winter answer looks very different, and shorter.',
  season_summer: 'Summer',
  season_spring: 'Spring',
  season_autumn: 'Autumn',
  season_winter: 'Winter',

  result_sub_pre: 'Ranked for',
  s_type_apartment: 'an apartment',
  s_type_house: 'a house',
  s_with: 'with',
  s_around_garden: 'a garden',
  s_around_pool: 'a pool',
  s_around_trees: 'trees close to the building',
  s_region_costa_blanca: 'on the Costa Blanca',
  s_region_costa_del_sol: 'on the Costa del Sol',
  s_region_balearics: 'in the Balearics',
  s_region_canaries: 'in the Canaries',
  s_region_inland: 'inland',
  s_region_north: 'on the north coast',
  s_empty: 'left empty for months at a time',
  s_season_summer: 'in summer',
  s_season_spring: 'in spring',
  s_season_autumn: 'in autumn',
  s_season_winter: 'in winter',
  sign_lead: 'What you will notice.',
  do_lead: 'What to do.',
  restart: 'Change my answers',

  top_title: 'Most likely on your answers',
  rest_title: 'The rest of the list, lower down for you',
  rest_note: 'All of these turn up in Spain. On your answers they are less likely than the three above, but the sign is worth knowing anyway.',

  signs_title: 'The general signs, whatever it turns out to be',
  signs_note: 'These are the five the guide tells every owner to watch for. Most of them are noticed on the first evening back.',

  prevention_title: 'What actually prevents it',
  prevention_note: 'Prevention is better than treatment here, and it is not close. Almost all of this is habit and an afternoon of small jobs, and it works on every pest above at once. Tick your way down it and print what is left.',
  g_food: 'Food and bins',
  g_food_note: 'The single biggest lever on this page, and it is a habit rather than a purchase.',
  g_ways: 'The ways in',
  g_ways_note: 'Nothing here is visible from the sofa, which is why it gets left. All three take an afternoon once.',
  g_outside: 'Outside the walls',
  g_away: 'Before you lock up for months',
  g_away_note: 'Two of the pests above are specifically pests of an empty house. This short list takes them off the board.',

  diy_title: 'You can handle this yourself',
  pro_title: 'This is not a job for you',

  winter_title: 'One thing about winter',
  winter_body: 'Most of this list is warm weather trouble, so a winter question has a shorter answer. What stays is what lives indoors and does not care what month it is: cockroaches coming up the pipes, rodents in a roof, and moths in a dry food store nobody has opened since summer.',

  cov_named_title: 'Where this ranking comes from',
  cov_partial_title: 'One honest note about your region',
  cov_none_title: 'We do not cover your region specifically',

  and: 'and',
  lower_names: true,
  shell_note: 'Practical guidance for property owners in Spain. Not legal advice.',
  disclaimer: 'This is prevention guidance drawn from a published guide to pests in Spanish homes, not a survey of your property. It names no product and no treatment beyond what that guide names. Anything already established, and anything involving rodents, is a job for a licensed pest control company who can see it.',

  names: {
    cockroaches: 'Cockroaches',
    rats: 'Rats',
    mosquitoes: 'Mosquitoes',
    ants: 'Ants',
    moths: 'Pantry moths',
    flies: 'Flies',
    fruitflies: 'Fruit flies',
  },

  why: {
    cockroaches_empty: 'Every property has pipes and cockroaches do not mind coming in up one, which puts them near the top whatever else you told us. A property that stands empty for months hands them free rein for long periods, and that is the condition the guide singles out.',
    cockroaches: 'Every property has pipes, and the guide is clear that cockroaches do not mind coming into a home that way. That is why they sit high here regardless of your other answers. Being lived in is genuine protection, because most of what keeps them out is daily habit.',
    rats_house_garden: 'A house with its own roof and a garden is precisely what the guide describes: rats are a real problem in rural settings, and in homes with roofs or gardens they can hide in.',
    rats_house: 'A house with its own roof is precisely what the guide describes: rats are a real problem in rural settings, and in homes with roofs or gardens they can hide in.',
    rats_house_inland: 'Inland, both halves of that apply at once.',
    rats_flat: 'An apartment gives them less to hide in than a house does, so they sit lower here.',
    rats_flat_inland: 'Inland is the exception the guide names, because rural settings are where they are a real problem.',
    mosquitoes_winter: 'The guide places mosquitoes in the warm months, so a winter question puts them well down the list. They come back with the weather.',
    mosquitoes_both: 'The guide names two conditions and you have both: mosquitoes are very common in Spain, especially in humid areas or where there is a lot of vegetation.',
    mosquitoes_one: 'The guide names two conditions and you have one: mosquitoes are very common in Spain, especially in humid areas or where there is a lot of vegetation.',
    mosquitoes_pool: 'A pool keeps the ground and the air around it damp.',
    mosquitoes_veg: 'Planting and trees are the vegetation half.',
    ants_inland: 'This is the one place the guide gets regionally specific. Ants are named as a particular nuisance in more rural areas, and interior villages are the example it gives.',
    ants: 'Ants turn up across Spain, but the guide puts them at their worst in rural areas and interior villages rather than on the coast.',
    moths_empty: 'This is the pest of an empty house. Pantry moths and cockroaches both get free rein over a long absence, and with moths the bill is the whole dry food store.',
    moths: 'Pantry moths are mostly a problem of dry food left standing for months. A property in regular use gets through its cupboards, which is most of the defence.',
    flies_winter: 'The guide describes flies as a nuisance of the warmer months, which puts them low for a winter question.',
    flies: 'Flies are a real nuisance in the warmer months, and what they are coming for is food left out and a bin that has been standing in Spanish heat.',
    fruitflies_garden: 'Fruit flies love hot and humid conditions, and the guide gives two examples of exactly what you have: well watered pot plants, and ripe Spanish fruit lying around.',
    fruitflies: 'Fruit flies want hot and humid conditions and something ripe to go at. Without planting or fruit sitting out they have less reason to be there.',
  },

  signs: {
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
  },

  action: {
    cockroaches: 'Insect sprays sold in any Spanish supermarket work well against cockroaches, and bay leaves at the back of the cupboards repel them for the price of a jar. An established infestation is a pest control job.',
    rats: 'Not yours. The guide is direct: with mice and rats you may have to take more drastic measures, and a pest control company is what actually clears vermin.',
    mosquitoes: 'Prevention rather than treatment. Window nets and a screen door are what keep them out, and basil, mint, lavender and lemongrass are the plants that repel them.',
    ants: 'Yours to handle. Keep food sealed and shut the ways in, and use a supermarket spray on the trail if it comes to that.',
    moths: 'Yours to handle, and mostly by emptying the cupboards. Bay leaves at the back of the shelf repel moths as well as cockroaches.',
    flies: 'Yours to handle. An electric fly swat or sticky paper deals with what is already inside, and supermarket sprays work well against flies. Nets stop the next lot.',
    fruitflies: 'Yours to handle. Take away the fruit and the standing damp in the pot saucers and they leave, because there is nothing else keeping them there.',
  },

  general_signs: [
    'The pest itself. Obvious, and still the one most owners see first.',
    'Signs they have been there: gnaw marks, droppings, dead plants, damaged fabrics and furniture.',
    'An unaccounted for smell.',
    'Pets behaving oddly, or spending time in a part of the house they did not use before.',
    'Strange noises. Hissing behind the cupboards is cockroaches. Scuttling in the roof is rats or mice.',
  ],

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

  coverage: {
    inland: 'Inland is the one place the guide behind this tool is regionally specific about, and it is specific about ants: they are worst in more rural areas, and interior villages are the example given. Rats get the same treatment, named as a real problem in rural settings. Everything else in your ranking comes from your property and the season.',
    costa_blanca: 'The guide names the Costa Blanca once, and it names the interior villages rather than the coast, for ants. Nothing in it is specific to your stretch of coastline. So the ranking above is built from your property, the season, and what the guide says about damp and vegetation, and not from anything about the Costa Blanca itself.',
    north: 'The guide behind this tool has nothing region specific about the north coast, and it is written around warm, dry Spain. Yours is neither. Treat the ranking as a starting point built from your property and the season rather than from your climate, and weigh damp related trouble higher than this page can.',
    none: 'The guide behind this tool says nothing specific about {region}. We would rather say that than invent a local pest for you. The ranking above still holds, because it is built from things you told us that the guide does cover: the season, whether there is vegetation and damp next to the building, whether it has its own roof and garden, and how long it stands empty.',
    region_costa_del_sol: 'the Costa del Sol',
    region_balearics: 'the Balearics',
    region_canaries: 'the Canaries',
    region_other: 'your region',
  },

  items: {
    food_sealed: {
      text: 'Put food away, in something sealed, every time',
      why: 'The guide puts this first of everything, and it is the part entirely inside your control. Flies, fruit flies and cockroaches are all heading for the same place.',
    },
    bins: {
      text: 'Empty the bins far more often than you would at home',
      why: 'Spanish heat turns waste faster, which is why the street bins are emptied so often. Your kitchen bin is on the same clock and nobody empties that one for you.',
    },
    fallen_fruit: {
      text: 'Pick up the fallen fruit and do not leave ripe fruit sitting out',
      why: 'Ripe fruit lying around is the thing fruit flies come for. It is the cheapest fix on this page and the one most often skipped.',
    },
    nets: {
      text: 'Fit window nets, and a screen door on the doorway you actually use',
      why: 'A window net is a mesh frame that fits on the outside of the window. It is what lets you sleep with the window open in Spain instead of choosing between heat and mosquitoes. A bead door does the same job on a doorway and plenty of people still swear by them.',
    },
    cupboards: {
      text: 'Clean out the backs of the cupboards and fill every hole and crack you find',
      why: 'A crack at the back of a cupboard with food in front of it is a door with a sign on it. This is the job that gets put off because nothing visible is wrong.',
    },
    plugs: {
      text: 'Put the plug in the drain overnight, and pour boiling water down the plugholes regularly',
      why: 'Cockroaches do not mind coming into a house up a pipe. A plug and a kettle is most of the defence against the pest the guide calls the worst of them.',
    },
    garden_trim: {
      text: 'Keep the garden cut and the hedges and trees trimmed back off the walls and the roofline',
      why: 'An overgrown garden is where the pests you do not want hide, and growth touching the building is a way up onto the roof for the ones that want the roof.',
    },
    pool_treated: {
      text: 'Keep the pool treated and filtering in the weeks you are not there, not only the weeks you are',
      why: 'Untreated water fills with bacteria and fungi, and the pool area is standing damp of exactly the kind mosquitoes are drawn to. Neither problem waits for your next visit.',
    },
    away_dry_food: {
      text: 'Empty the cupboards of every dry food before you fly: flour, pasta, grains, tea',
      why: 'Pantry moths and cockroaches love having free rein for long periods, and with moths the end of it is throwing out the whole dry store, usually the containers with it.',
    },
    away_bins: {
      text: 'Empty every bin and take the rubbish off the property, not onto the terrace',
      why: 'Anything left in a bin over a Spanish summer stops being rubbish and becomes bait.',
    },
    away_bay: {
      text: 'Put bay leaves at the back of any cupboard you leave stocked',
      why: 'They repel moths and cockroaches, they cost almost nothing, and they are the only thing on this list that keeps working with nobody in the house.',
    },
    away_plugs: {
      text: 'Leave the plugs in the drains',
      why: 'Same reason as the overnight plug, for months instead of a night.',
    },
  },

};

export default { en, no, sv, de, fr, nl };
