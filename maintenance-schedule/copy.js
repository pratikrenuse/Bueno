// All user-facing text for the maintenance schedule.
//
// Kept in the tool folder rather than the shared locale files, for the same reason
// closing-up keeps its own: a generator carries far more copy than a calculator.
//
// English is here. The other five languages live in locales/, one file each, with the
// same key paths. The schedule items are keyed by id under items, and schedule.js only
// decides which ids apply.
import no from './locales/no.js';
import sv from './locales/sv.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import nl from './locales/nl.js';

const en = {
  eyebrow: 'Free tool',
  headline: 'The jobs your property needs, in the month it needs them',
  body: 'Spanish sun, salt air and a short wet winter each break something different, and they do it at different times of year. This builds the twelve-month schedule for your building, in the season each job belongs in.',
  points: [
    'Five questions, then a printable year',
    'Every job says what it prevents',
    'Different for a flat you visit monthly and a villa you see once a year',
  ],
  cta: 'Build my schedule',
  minutes: 'About a minute',

  q_type: 'What kind of property is it?',
  type_apartment: 'Apartment',
  type_apartment_d: 'In a block, with a community and an administrador',
  type_house: 'House or villa',
  type_house_d: 'Detached or terraced, with its own roof and plot',

  q_location: 'How close is it to the sea?',
  q_location_hint: 'This changes more than anything else you will tell us. Salt air corrodes metal, mechanisms and outdoor units far faster than inland air does.',
  location_coastal: 'On or near the coast',
  location_coastal_d: 'You can smell the sea from the terrace',
  location_inland: 'Inland',
  location_inland_d: 'A town or village away from the coast',

  q_age: 'Roughly when was it built, or last properly renovated?',
  q_age_hint: 'A rough band is enough. If you have no idea, say so and the schedule will start by telling you how to find out.',
  age_pre1980: 'Before 1980',
  age_pre1980_d: 'Original frames, seals and fixings unless someone replaced them',
  age_8090: 'The 1980s or 1990s',
  age_8090_d: 'Old enough that the roof has had thirty Spanish summers',
  age_2000s: 'The 2000s',
  age_2000s_d: 'The first render and paint cycle is due or overdue',
  age_newer: 'Newer than that',
  age_newer_d: 'Built or fully renovated in the last fifteen years or so',
  age_unsure: 'I am not sure',
  age_unsure_d: 'We will tell you where the year is written down',

  q_features: 'Which of these does it have?',
  q_features_hint: 'Tap any that apply. Each one brings its own jobs and its own season.',
  feature_pool: 'A pool',
  feature_garden: 'A garden or plot',
  feature_aircon: 'Air conditioning',
  feature_solar: 'Solar panels',
  feature_boiler: 'A boiler or hot water heating',
  feature_none: 'None of these',

  q_visits: 'How often are you actually there?',
  q_visits_hint: 'This decides whether the year can be spread out or has to be batched into the visits you get.',
  visits_monthly: 'Monthly, near enough',
  visits_monthly_d: 'You can do jobs in the season they belong in',
  visits_few: 'A few times a year',
  visits_few_d: 'Most jobs have to wait for a visit',
  visits_rare: 'Once a year or less',
  visits_rare_d: 'One trip has to carry the whole year',

  result_headline: 'Your year, season by season',
  result_sub: 'Work down it. Each job says what it prevents, and the ones at the top will not wait for a season.',
  result_sub_calm: 'Work down it. Each job says what it prevents, and each one sits in the season it belongs in.',
  restart: 'Change my answers',

  g_first: 'Do this first',
  g_first_note: 'These came out of your answers and they do not belong to a season. They are the ones that get more expensive the longer they sit.',
  g_spring: 'Spring, March to May',
  g_summer: 'Summer, June to August',
  g_autumn: 'Autumn, September to November',
  g_winter: 'Winter, December to February',
  g_absent: 'What has to happen when you are not there',

  note_spring: 'Spring is for undoing the winter and getting ahead of the summer. Everything here wants dry, mild weather.',
  note_summer: 'Summer is the only season the outdoor systems are under real load, which makes it the only season their faults show.',
  note_autumn: 'Autumn carries the most work in the Spanish year. Everything here sits in front of the weather that tests it.',
  note_winter: 'Most of this you can do from your kitchen table at home. It is the desk half of owning a property here.',

  note_autumn_rare: 'If the year gives you one visit, make it this one. Roof, gutters, alarm and boiler all sit in front of the weather that finds them out, and you can add the spring gutter clear to the same trip.',
  note_absent_rare: 'You are there once a year. That means most of this list is somebody else standing in for you, and arranging that is the real job.',
  note_absent_few: 'A few visits a year leaves gaps of months. These are the things that cannot wait for the next time you fly out.',

  limit_title: 'What this schedule cannot tell you',
  limit_body: 'Dates for IBI, rubbish tax and community fees are set locally and differ between municipalities, and some places bill the same tax twice a year. Treat this as a planning framework and let your ayuntamiento and your community set the actual dates. Nothing on this page is a deadline.',

  shell_note: 'Practical guidance for property owners in Spain. Not legal advice.',
  disclaimer: 'This is practical maintenance guidance, not legal, tax or insurance advice. What your policy covers is whatever your policy says, and the only dates that bind you are the ones your ayuntamiento, your community and your tax office publish.',

  items: {
    unsure_year: {
      text: 'Find the year the building was finished before you plan anything else',
      why: 'The Catastro record for your reference number carries the year of construction, and your escritura usually repeats it. It changes what you are looking for. A roof that has taken forty Spanish summers is a different roof from one that has taken ten, and the age of the building is also one of the things an insurer prices on.',
    },
    coastal_rust: {
      text: 'Walk the outside and look for rust bloom on every metal fixing: railings, gate hinges, window grilles, satellite and aircon brackets',
      why: 'Salt gets into metal fixtures and the point where you notice it is usually past the point where cleaning still helps. On a building this age the fixings are the original ones, and replacing a single bracket is a morning. Replacing a whole railing run is not.',
    },
    pool_service: {
      text: 'Put the pool on a standing service arrangement, before anything else on this page',
      why: 'A pool has to be cleaned, treated and filtered whether or not you are in the country. Water left untreated fills with bacteria and fungi, and once it reaches that it has to be drained and deep cleaned, which is one of the most expensive things that happens to a Spanish property.',
    },
    solar_cover: {
      text: 'Get it in writing that your policy covers the solar system',
      why: 'Basic cover in Spain is written around the obvious things: fire, flood, explosion. A solar installation often sits outside it and has to be added as extra cover. The moment you discover which of those is true should not be the moment you need it.',
    },
    garden_away: {
      text: 'Book the garden to be cut while you are away, not the week before you arrive',
      why: 'Spanish growing conditions turn an unattended plot into an overgrown one in a single season, and an overgrown garden is where the pests you do not want live. Cutting it for your arrival tidies the view. Cutting it in between is what actually protects the building.',
    },
    aircon_salt: {
      text: 'Look at the outdoor aircon unit and its bracket for salt corrosion',
      why: 'The outdoor unit is metal, it lives outside, and on the coast that is the combination that kills it. A corroded bracket is cheap now and an emergency in August.',
    },
    gutters_spring: {
      text: 'Clear the gutters and downpipes of the winter leaf fall and sludge',
      why: 'A blocked gutter puts the rain down the face of the wall instead of away from it. Water tracking down render is how a paint problem turns into a structural one, and it does that quietly.',
    },
    facade: {
      text: 'Walk the whole facade and look for damp patches, blown render and cracks in the paintwork',
      why: 'The paint is what keeps water out of the plaster and brickwork behind it. Once water is behind it, repainting no longer fixes anything. Reseal or repaint now, while it is dry and mild enough for the paint to cure and UV resistant paint is worth the difference.',
    },
    taps: {
      text: 'Run every tap, flush every toilet and start every appliance you did not use over winter',
      why: 'March is when a winter leak announces itself. A leak you find in a wet room costs a plumber. The same leak found later, in the ceiling below, costs a plumber and a ceiling.',
    },
    damp_wardrobes: {
      text: 'Look for damp inside wardrobes on external walls and in the corners of north facing rooms',
      why: 'A Spanish winter is wetter than most owners expect, and a closed room holds it. Mould found in March is wiped off. Mould found in July is a wall.',
    },
    aircon_filters: {
      text: 'Clean the filters and run the aircon through a full cycle before you need it',
      why: 'A filter left dirty since last summer makes the unit work harder for less cold air, and shortens its life doing it. The other reason to do it now is that the week the heat arrives is the week nobody can come out to you.',
    },
    salt_wash: {
      text: 'Wash the salt off the window runners, shutter mechanisms and door furniture, then work every handle through its full travel',
      why: 'Salt corrodes the moving parts long before it marks the frame, so a shutter that has gone stiff is usually a seized mechanism rather than a broken slat. Five minutes with fresh water is the whole job.',
    },
    frames: {
      text: 'Check the window and door frames for warping and rot, and replace any seal that has gone hard',
      why: 'Hot humid air warps and rots frames, and it does it fastest on the coast. A building of this age is unlikely to have double glazing, so the seal is the only thing you have. A perished one costs you cooling every hour of the summer.',
    },
    garden_spring: {
      text: 'Cut back, replant and get the irrigation running while you can watch it',
      why: 'Growth you leave in spring is a fortnight of work in September. Running the irrigation while you are standing there is also the only reliable way to find the line that has split over winter.',
    },
    pool_open: {
      text: 'Open the pool, balance the water and get the filtration running before the water warms',
      why: 'Treating clear water is a routine. Recovering green water is a job, and sometimes a drain and a deep clean.',
    },
    outdoor_pipes: {
      text: 'Check the outdoor pipework and the irrigation while they are running hard',
      why: 'Summer is the only season the outdoor system carries real load, so it is the only season a slow leak gives itself away. A weeping irrigation joint runs for months without anyone noticing, and you pay for every litre of it.',
    },
    descale: {
      text: 'Descale the kettle, the shower heads and the appliance filters',
      why: 'Hard water is common in Valencia, on the Costa Blanca and on the Costa del Sol. The limescale you can see in the kettle is the same limescale building up out of sight in the pipework and inside the washing machine. Treating appliances regularly is most of what makes them last.',
    },
    insurance_read: {
      text: 'Read your insurance policy against how the property is actually used now',
      why: 'Policies here run a year at a time, so the useful question in summer is not the price. It is whether the cover still matches reality: whether the building and the contents are both covered, whether liability is in there, and whether the policy knows the property stands empty for long stretches.',
    },
    community_invoice: {
      text: 'Read the community fee invoice line by line when it arrives',
      why: 'If the community is saving for a specific piece of work, that is your building being repaired and your share being collected for it. Knowing what for is also how you find out about roof or terrace work happening above you.',
    },
    pool_summer: {
      text: 'Keep the filtration running and the water treated through the hottest weeks, whether or not you are in the country',
      why: 'In high summer untreated water goes from clear to bacterial quickly, and the recovery is not a bottle of chlorine. It is a drain and a deep clean.',
    },
    softener: {
      text: 'Price a water softener if the limescale keeps coming back',
      why: 'On the Costa Blanca and the Costa del Sol the water is hard enough that appliances are consumables. A softener is not glamorous and it is usually cheaper than the second boiler.',
    },
    aircon_rinse: {
      text: 'Rinse the aircon filters again mid season if the units run daily',
      why: 'A filter that took a spring clean will be loaded again by July if the unit is on every day. This is a ten minute job that keeps the running cost down.',
    },
    roof_house: {
      text: 'Get on the roof, or get someone on it, and look for cracked, slipped and brittle tiles',
      why: 'Terracotta goes brittle after years of UV, so a roof that has held for decades can start failing all at once. The crack that is nothing in September is a wet ceiling after the first real November rain, and a patch is a fraction of the cost of relaying an area.',
    },
    roof_flat: {
      text: 'Ask the administrador when the roof and the communal terraces were last inspected, and what is planned',
      why: 'You do not own the roof but you pay for it and you live under it. Terracotta goes brittle with UV and communal roof work is the single most common source of water coming into a flat from above.',
    },
    gutters_autumn: {
      text: 'Clear the gutters again before the heavy rain',
      why: 'This is the clear out that matters. Autumn brings the heaviest rain of the Spanish year down onto a gutter holding a whole summer of dust and leaf drop.',
    },
    alarm_test: {
      text: 'Test the alarm properly, from outside the property, and confirm the alerts actually arrive on your phone',
      why: 'A system nobody has tested is a sticker on a window. An unoccupied property is exactly the kind that gets tried, and autumn is when most foreign owners stop coming.',
    },
    repaint: {
      text: 'Repaint the scuffs and make good the small damage from the summer',
      why: 'Dry, mild autumn is the last decent window for paint to cure properly. A mark left through the winter takes the damp into the plaster behind it and stops being a paint job.',
    },
    boiler: {
      text: 'Have the boiler serviced now',
      why: 'Before you need it, and before every engineer in the area is booked for the first cold week. A service in October is an appointment. A service in January is a wait.',
    },
    garden_walls: {
      text: 'Cut back everything touching the walls and the roofline',
      why: 'Growth against the building holds water against it through the wet months, and a branch on the roofline is a bridge for anything that wants to get in under the tiles.',
    },
    pool_winter: {
      text: 'Move the pool to a reduced winter run rather than switching the pump off',
      why: 'A pump that never runs is what turns a pool green over winter. Green water in March costs far more to put right than the electricity would have cost to prevent it.',
    },
    ibi_dates: {
      text: 'Ask your ayuntamiento which months your IBI and rubbish tax fall in, and write them on this schedule',
      why: 'Both are billed against the property and the months differ from one municipality to the next. Some places bill IBI twice in the year. The dates are knowable, but only locally, and nobody will chase you abroad before they charge interest.',
    },
    ceilings: {
      text: 'After the first heavy rain, check the ceilings under the roof and under any terrace, and the top corners of external walls',
      why: 'This is when a roof or terrace problem finally announces itself, and it announces itself as a stain long before it announces itself as a drip. Finding it in December leaves you the whole spring to fix it in dry weather.',
    },
    floors: {
      text: 'Deep clean the tile and stone floors with a product made for natural stone',
      why: 'The ceramic and stone is half the reason you bought the place. The wrong cleaner etches the surface, and that shine does not come back. Winter is when the property is quiet enough to do it properly.',
    },
    review_year: {
      text: 'Go back through last year: utilities, community fees, insurance, taxes and anything you did not recognise',
      why: 'This is where a wrong tariff or a charge nobody agreed to shows up. Most non resident owners are still on the electricity contract they signed the week they got the keys, and nobody is going to move them off it.',
    },
    ring_round: {
      text: 'Ring round on the electricity, water and internet contracts',
      why: 'Tariffs move and nobody moves you with them. An hour on the phone in a quiet month is the highest paid hour in this schedule.',
    },
    freeze: {
      text: 'Protect the outdoor pipework and anything holding water against a freeze',
      why: 'Interior Spain gets genuinely cold, and the combination of hard frost and very hot summers is harder on a building than either alone. A pipe that splits on a January night does not flood until it thaws, which is usually when nobody is watching it.',
    },
    heating_run: {
      text: 'Run the heating and the hot water on every visit, even a short one',
      why: 'A system that sits unused all winter is a system that fails on the first cold evening you need it. Running it is also how you notice a pressure drop, which is a leak somewhere you have not found yet.',
    },
    batch_autumn: {
      text: 'Batch the whole autumn block into your one visit, and bring the spring gutter clear forward into it',
      why: 'Everything in the autumn list sits in front of the weather that tests it, so a single visit buys the most there. The spring jobs that cannot move are the ones that need dry weather to cure, and those are the ones to hand over.',
    },
    keyholder: {
      text: 'Give one named person a key, your number and written permission to go in',
      why: 'The difference between a small problem and a large one is how many weeks it runs unseen. Without something in writing a keyholder may hesitate at exactly the moment you need them not to.',
    },
    storm_photos: {
      text: 'Agree that they go in after any storm, and send you photographs each time',
      why: 'A dated photograph is how you find water damage while it is still a stain, and it is also the evidence you will want if you ever claim on it.',
    },
    alarm_monitored: {
      text: 'Put the alarm on a monitored contract and have the engineer check it on their schedule, not yours',
      why: 'An alarm only does its job if it is maintained, and you are not there to maintain it. Unoccupied property is what it is for.',
    },
    pool_visits: {
      text: 'Standing pool visits, booked as a routine rather than called each time',
      why: 'Calling a pool service each time means the pool is already wrong before anyone looks at it.',
    },
    garden_cut: {
      text: 'A mid season cut booked into the calendar',
      why: 'One cut in the middle of the growing season is the difference between a tidy plot and clearing a season of growth off the walls.',
    },
    dd_account: {
      text: 'Check the account the direct debits leave from before each long absence',
      why: 'A returned direct debit for water or power is how supply gets cut off, and reconnecting from another country is slow, expensive and always at the worst time.',
    },
  },
};

export default { en, no, sv, de, fr, nl };
