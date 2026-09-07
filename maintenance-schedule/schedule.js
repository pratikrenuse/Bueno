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

const has = (a, k) => a.features.includes(k);
const coastal = a => a.location === 'coastal';
const older = a => a.age === 'pre1980' || a.age === '8090';
const absent = a => a.visits === 'rare' || a.visits === 'few';

export function buildSchedule(a, c) {
  const groups = [];

  // --- Do this first. Only what the answers actually flagged. ----------------
  const first = [];

  if (a.age === 'unsure') {
    first.push({
      text: 'Find the year the building was finished before you plan anything else',
      why: 'The Catastro record for your reference number carries the year of construction, and your escritura usually repeats it. It changes what you are looking for. A roof that has taken forty Spanish summers is a different roof from one that has taken ten, and the age of the building is also one of the things an insurer prices on.',
    });
  }

  if (coastal(a) && older(a)) {
    first.push({
      text: 'Walk the outside and look for rust bloom on every metal fixing: railings, gate hinges, window grilles, satellite and aircon brackets',
      why: 'Salt gets into metal fixtures and the point where you notice it is usually past the point where cleaning still helps. On a building this age the fixings are the original ones, and replacing a single bracket is a morning. Replacing a whole railing run is not.',
    });
  }

  if (has(a, 'pool') && absent(a)) {
    first.push({
      text: 'Put the pool on a standing service arrangement, before anything else on this page',
      why: 'A pool has to be cleaned, treated and filtered whether or not you are in the country. Water left untreated fills with bacteria and fungi, and once it reaches that it has to be drained and deep cleaned, which is one of the most expensive things that happens to a Spanish property.',
    });
  }

  if (has(a, 'solar')) {
    first.push({
      text: 'Get it in writing that your policy covers the solar system',
      why: 'Basic cover in Spain is written around the obvious things: fire, flood, explosion. A solar installation often sits outside it and has to be added as extra cover. The moment you discover which of those is true should not be the moment you need it.',
    });
  }

  if (has(a, 'garden') && a.visits === 'rare') {
    first.push({
      text: 'Book the garden to be cut while you are away, not the week before you arrive',
      why: 'Spanish growing conditions turn an unattended plot into an overgrown one in a single season, and an overgrown garden is where the pests you do not want live. Cutting it for your arrival tidies the view. Cutting it in between is what actually protects the building.',
    });
  }

  if (coastal(a) && has(a, 'aircon') && !older(a)) {
    first.push({
      text: 'Look at the outdoor aircon unit and its bracket for salt corrosion',
      why: 'The outdoor unit is metal, it lives outside, and on the coast that is the combination that kills it. A corroded bracket is cheap now and an emergency in August.',
    });
  }

  if (first.length) {
    groups.push({ title: c('g_first'), note: c('g_first_note'), items: first });
  }

  // --- Spring. Undo the winter, get in front of the summer. ------------------
  const spring = [
    {
      text: 'Clear the gutters and downpipes of the winter leaf fall and sludge',
      why: 'A blocked gutter puts the rain down the face of the wall instead of away from it. Water tracking down render is how a paint problem turns into a structural one, and it does that quietly.',
    },
    {
      text: 'Walk the whole facade and look for damp patches, blown render and cracks in the paintwork',
      why: 'The paint is what keeps water out of the plaster and brickwork behind it. Once water is behind it, repainting no longer fixes anything. Reseal or repaint now, while it is dry and mild enough for the paint to cure and UV resistant paint is worth the difference.',
    },
    {
      text: 'Run every tap, flush every toilet and start every appliance you did not use over winter',
      why: 'March is when a winter leak announces itself. A leak you find in a wet room costs a plumber. The same leak found later, in the ceiling below, costs a plumber and a ceiling.',
    },
    {
      text: 'Look for damp inside wardrobes on external walls and in the corners of north facing rooms',
      why: 'A Spanish winter is wetter than most owners expect, and a closed room holds it. Mould found in March is wiped off. Mould found in July is a wall.',
    },
  ];

  if (has(a, 'aircon')) {
    spring.push({
      text: 'Clean the filters and run the aircon through a full cycle before you need it',
      why: 'A filter left dirty since last summer makes the unit work harder for less cold air, and shortens its life doing it. The other reason to do it now is that the week the heat arrives is the week nobody can come out to you.',
    });
  }

  if (coastal(a)) {
    spring.push({
      text: 'Wash the salt off the window runners, shutter mechanisms and door furniture, then work every handle through its full travel',
      why: 'Salt corrodes the moving parts long before it marks the frame, so a shutter that has gone stiff is usually a seized mechanism rather than a broken slat. Five minutes with fresh water is the whole job.',
    });
  }

  if (older(a)) {
    spring.push({
      text: 'Check the window and door frames for warping and rot, and replace any seal that has gone hard',
      why: 'Hot humid air warps and rots frames, and it does it fastest on the coast. A building of this age is unlikely to have double glazing, so the seal is the only thing you have. A perished one costs you cooling every hour of the summer.',
    });
  }

  if (has(a, 'garden')) {
    spring.push({
      text: 'Cut back, replant and get the irrigation running while you can watch it',
      why: 'Growth you leave in spring is a fortnight of work in September. Running the irrigation while you are standing there is also the only reliable way to find the line that has split over winter.',
    });
  }

  if (has(a, 'pool')) {
    spring.push({
      text: 'Open the pool, balance the water and get the filtration running before the water warms',
      why: 'Treating clear water is a routine. Recovering green water is a job, and sometimes a drain and a deep clean.',
    });
  }

  groups.push({ title: c('g_spring'), note: c('note_spring'), items: spring });

  // --- Summer. Outdoor systems under load, so faults show. -------------------
  const summer = [
    {
      text: 'Check the outdoor pipework and the irrigation while they are running hard',
      why: 'Summer is the only season the outdoor system carries real load, so it is the only season a slow leak gives itself away. A weeping irrigation joint runs for months without anyone noticing, and you pay for every litre of it.',
    },
    {
      text: 'Descale the kettle, the shower heads and the appliance filters',
      why: 'Hard water is common in Valencia, on the Costa Blanca and on the Costa del Sol. The limescale you can see in the kettle is the same limescale building up out of sight in the pipework and inside the washing machine. Treating appliances regularly is most of what makes them last.',
    },
    {
      text: 'Read your insurance policy against how the property is actually used now',
      why: 'Policies here run a year at a time, so the useful question in summer is not the price. It is whether the cover still matches reality: whether the building and the contents are both covered, whether liability is in there, and whether the policy knows the property stands empty for long stretches.',
    },
    {
      text: 'Read the community fee invoice line by line when it arrives',
      why: 'If the community is saving for a specific piece of work, that is your building being repaired and your share being collected for it. Knowing what for is also how you find out about roof or terrace work happening above you.',
    },
  ];

  if (has(a, 'pool')) {
    summer.push({
      text: 'Keep the filtration running and the water treated through the hottest weeks, whether or not you are in the country',
      why: 'In high summer untreated water goes from clear to bacterial quickly, and the recovery is not a bottle of chlorine. It is a drain and a deep clean.',
    });
  }

  if (coastal(a)) {
    summer.push({
      text: 'Price a water softener if the limescale keeps coming back',
      why: 'On the Costa Blanca and the Costa del Sol the water is hard enough that appliances are consumables. A softener is not glamorous and it is usually cheaper than the second boiler.',
    });
  }

  if (has(a, 'aircon') && a.visits === 'monthly') {
    summer.push({
      text: 'Rinse the aircon filters again mid season if the units run daily',
      why: 'A filter that took a spring clean will be loaded again by July if the unit is on every day. This is a ten minute job that keeps the running cost down.',
    });
  }

  groups.push({ title: c('g_summer'), note: c('note_summer'), items: summer });

  // --- Autumn. The heaviest season. Everything sits in front of the rain. ----
  const autumn = [];

  if (a.type === 'house') {
    autumn.push({
      text: 'Get on the roof, or get someone on it, and look for cracked, slipped and brittle tiles',
      why: 'Terracotta goes brittle after years of UV, so a roof that has held for decades can start failing all at once. The crack that is nothing in September is a wet ceiling after the first real November rain, and a patch is a fraction of the cost of relaying an area.',
    });
  } else {
    autumn.push({
      text: 'Ask the administrador when the roof and the communal terraces were last inspected, and what is planned',
      why: 'You do not own the roof but you pay for it and you live under it. Terracotta goes brittle with UV and communal roof work is the single most common source of water coming into a flat from above.',
    });
  }

  autumn.push({
    text: 'Clear the gutters again before the heavy rain',
    why: 'This is the clear out that matters. Autumn brings the heaviest rain of the Spanish year down onto a gutter holding a whole summer of dust and leaf drop.',
  });

  autumn.push({
    text: 'Test the alarm properly, from outside the property, and confirm the alerts actually arrive on your phone',
    why: 'A system nobody has tested is a sticker on a window. An unoccupied property is exactly the kind that gets tried, and autumn is when most foreign owners stop coming.',
  });

  autumn.push({
    text: 'Repaint the scuffs and make good the small damage from the summer',
    why: 'Dry, mild autumn is the last decent window for paint to cure properly. A mark left through the winter takes the damp into the plaster behind it and stops being a paint job.',
  });

  if (has(a, 'boiler')) {
    autumn.push({
      text: 'Have the boiler serviced now',
      why: 'Before you need it, and before every engineer in the area is booked for the first cold week. A service in October is an appointment. A service in January is a wait.',
    });
  }

  if (has(a, 'garden')) {
    autumn.push({
      text: 'Cut back everything touching the walls and the roofline',
      why: 'Growth against the building holds water against it through the wet months, and a branch on the roofline is a bridge for anything that wants to get in under the tiles.',
    });
  }

  if (has(a, 'pool')) {
    autumn.push({
      text: 'Move the pool to a reduced winter run rather than switching the pump off',
      why: 'A pump that never runs is what turns a pool green over winter. Green water in March costs far more to put right than the electricity would have cost to prevent it.',
    });
  }

  autumn.push({
    text: 'Ask your ayuntamiento which months your IBI and rubbish tax fall in, and write them on this schedule',
    why: 'Both are billed against the property and the months differ from one municipality to the next. Some places bill IBI twice in the year. The dates are knowable, but only locally, and nobody will chase you abroad before they charge interest.',
  });

  groups.push({
    title: c('g_autumn'),
    note: a.visits === 'rare' ? c('note_autumn_rare') : c('note_autumn'),
    items: autumn,
  });

  // --- Winter. Mostly desk work, which suits an owner who is not there. ------
  const winter = [
    {
      text: 'After the first heavy rain, check the ceilings under the roof and under any terrace, and the top corners of external walls',
      why: 'This is when a roof or terrace problem finally announces itself, and it announces itself as a stain long before it announces itself as a drip. Finding it in December leaves you the whole spring to fix it in dry weather.',
    },
    {
      text: 'Deep clean the tile and stone floors with a product made for natural stone',
      why: 'The ceramic and stone is half the reason you bought the place. The wrong cleaner etches the surface, and that shine does not come back. Winter is when the property is quiet enough to do it properly.',
    },
    {
      text: 'Go back through last year: utilities, community fees, insurance, taxes and anything you did not recognise',
      why: 'This is where a wrong tariff or a charge nobody agreed to shows up. Most non resident owners are still on the electricity contract they signed the week they got the keys, and nobody is going to move them off it.',
    },
    {
      text: 'Ring round on the electricity, water and internet contracts',
      why: 'Tariffs move and nobody moves you with them. An hour on the phone in a quiet month is the highest paid hour in this schedule.',
    },
  ];

  if (a.location === 'inland') {
    winter.push({
      text: 'Protect the outdoor pipework and anything holding water against a freeze',
      why: 'Interior Spain gets genuinely cold, and the combination of hard frost and very hot summers is harder on a building than either alone. A pipe that splits on a January night does not flood until it thaws, which is usually when nobody is watching it.',
    });
  }

  if (a.visits === 'monthly') {
    winter.push({
      text: 'Run the heating and the hot water on every visit, even a short one',
      why: 'A system that sits unused all winter is a system that fails on the first cold evening you need it. Running it is also how you notice a pressure drop, which is a leak somewhere you have not found yet.',
    });
  }

  groups.push({ title: c('g_winter'), note: c('note_winter'), items: winter });

  // --- What has to happen when you are not there. ---------------------------
  if (absent(a)) {
    const away = [];

    if (a.visits === 'rare') {
      away.push({
        text: 'Batch the whole autumn block into your one visit, and bring the spring gutter clear forward into it',
        why: 'Everything in the autumn list sits in front of the weather that tests it, so a single visit buys the most there. The spring jobs that cannot move are the ones that need dry weather to cure, and those are the ones to hand over.',
      });
    }

    away.push({
      text: 'Give one named person a key, your number and written permission to go in',
      why: 'The difference between a small problem and a large one is how many weeks it runs unseen. Without something in writing a keyholder may hesitate at exactly the moment you need them not to.',
    });

    away.push({
      text: 'Agree that they go in after any storm, and send you photographs each time',
      why: 'A dated photograph is how you find water damage while it is still a stain, and it is also the evidence you will want if you ever claim on it.',
    });

    away.push({
      text: 'Put the alarm on a monitored contract and have the engineer check it on their schedule, not yours',
      why: 'An alarm only does its job if it is maintained, and you are not there to maintain it. Unoccupied property is what it is for.',
    });

    if (has(a, 'pool')) {
      away.push({
        text: 'Standing pool visits, booked as a routine rather than called each time',
        why: 'Calling a pool service each time means the pool is already wrong before anyone looks at it.',
      });
    }

    if (has(a, 'garden')) {
      away.push({
        text: 'A mid season cut booked into the calendar',
        why: 'One cut in the middle of the growing season is the difference between a tidy plot and clearing a season of growth off the walls.',
      });
    }

    away.push({
      text: 'Check the account the direct debits leave from before each long absence',
      why: 'A returned direct debit for water or power is how supply gets cut off, and reconnecting from another country is slow, expensive and always at the worst time.',
    });

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
