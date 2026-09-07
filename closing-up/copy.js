// All user-facing text for this tool. Kept in the tool folder rather than the six shared
// locale files, because a checklist generator carries far more copy than a calculator and
// it would swamp them. Same dot-path API as useT. Other locales fall back to en until
// they are translated.
export default {
  en: {
    eyebrow: 'Free tool',
    headline: 'Lock the door on a house that will be fine without you',
    body: 'Most of what goes wrong in an empty Spanish home is cheap to prevent and expensive to fix. This builds the last-day list for your property, in the order you should do it.',
    points: [
      'Five questions, then a printable list',
      'Different for two weeks and for a whole winter',
      'Covers water, power, pests, security and the bills that keep running',
    ],
    cta: 'Build my checklist',
    minutes: 'About a minute',

    q_away: 'How long will the property be empty?',
    q_away_hint: 'Roughly is fine. It changes what is worth doing and what is overkill.',
    away_short: 'Two to four weeks',
    away_short_d: 'A normal gap between visits',
    away_medium: 'One to three months',
    away_medium_d: 'A season away',
    away_long: 'More than three months',
    away_long_d: 'A whole winter or longer',

    q_season: 'What season are you leaving it in?',
    q_season_hint: 'Summer heat and winter damp break different things.',
    season_summer: 'Summer',
    season_summer_d: 'Heat, storms, and the pest season',
    season_winter: 'Winter',
    season_winter_d: 'Damp, cold nights, heavy rain',
    season_shoulder: 'Spring or autumn',
    season_shoulder_d: 'Mild, but the rain comes in autumn',

    q_type: 'What kind of property is it?',
    type_apartment: 'Apartment',
    type_apartment_d: 'In a block with a community',
    type_villa: 'House or villa',
    type_villa_d: 'Detached, with its own plot',

    q_extras: 'Does it have any of these?',
    q_extras_hint: 'Tap any that apply. Each one adds its own jobs.',
    extra_pool: 'A pool',
    extra_garden: 'A garden or plot',
    extra_aircon: 'Air conditioning',
    extra_none: 'None of these',

    q_checker: 'Will anyone look in on it while you are away?',
    q_checker_hint: 'A neighbour, a key holder, a management company. This is the single biggest difference between a small problem and a big one.',
    checker_yes: 'Yes, someone will check',
    checker_no: 'No, nobody will',

    result_headline: 'Your last day, in order',
    result_sub: 'Work down the list. The jobs are grouped by what they protect, and the ones that matter most for your situation come first.',
    restart: 'Change my answers',

    g_water: 'Water',
    g_water_note: 'A slow leak in an empty house is the most expensive thing on this page. Everything here takes minutes.',
    g_power: 'Power and appliances',
    g_pests: 'Pests',
    g_pests_note: 'An empty house is quiet, dark and has standing water in the traps. That is an invitation.',
    g_damp: 'Damp and air',
    g_security: 'Security and occupation',
    g_security_note: 'A property that visibly nobody visits is the one that gets tried. Most of this is about looking lived-in.',
    g_pool: 'Pool',
    g_garden: 'Garden',
    g_money: 'Money and paperwork',
    g_money_note: 'These keep running while you are away, and a failed direct debit is how the power gets cut off.',
    g_arrange: 'Arrange before you fly',
  },
};
