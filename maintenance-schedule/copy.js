// All user-facing text for the maintenance schedule.
//
// Kept in the tool folder rather than the shared locale files, for the same reason
// closing-up keeps its own: a generator carries far more copy than a calculator.
export default {
  en: {
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
  },
};
