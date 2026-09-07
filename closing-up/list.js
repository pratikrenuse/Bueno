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

  // --- Water. First, always. A slow leak is the most expensive thing in an empty house.
  const water = [
    { text: 'Turn off the main stopcock (llave de paso)', why: 'One tap failing behind a wall while nobody is there is the single most expensive thing that happens to empty Spanish homes.' },
    { text: 'Open every tap for a few seconds afterwards to drain the pipes', why: 'Takes the pressure off the joints and stops water sitting in the run.' },
    { text: 'Turn off the water heater at the mains', why: 'A termo left heating an empty tank for three months costs money and shortens its life.' },
    { text: 'Check under the sinks and behind the washing machine for damp or crusting', why: 'A drip you can see now is a flood you cannot see in six weeks.' },
  ];
  if (!isShortish(a)) {
    water.push({ text: 'Empty and switch off the washing machine and dishwasher, and leave both doors ajar', why: 'Standing water in the drum goes stale and the seals grow mould shut.' });
  }
  if (a.season === 'winter' && a.type === 'villa') {
    water.push({ text: 'Drain any exposed outdoor pipework and disconnect hoses', why: 'Inland and at altitude a Spanish winter night does freeze, and a split outdoor pipe floods when it thaws.' });
  }
  groups.push({ title: c('g_water'), note: c('g_water_note'), items: water });

  // --- Power.
  const power = [
    { text: 'Unplug everything you are not leaving running', why: 'Protects against surges during summer storms and cuts the standby draw.' },
    { text: 'Decide what stays on: fridge, alarm, router, timers', why: 'Anything on that list needs the power left on at the consumer unit, so decide it before you throw switches.' },
  ];
  if (isShortish(a)) {
    power.push({ text: 'Leave the fridge running with the door closed', why: 'For a few weeks it is less trouble than emptying and defrosting it.' });
  } else {
    power.push({ text: 'Empty the fridge and freezer, defrost, clean and leave the doors propped open', why: 'A power cut you never hear about turns a full freezer into a smell you will not get out.' });
  }
  if (has(a, 'aircon')) {
    power.push({ text: 'Run the aircon on fan-only for twenty minutes, then switch it off at the unit', why: 'Dries the internal coil so it does not sit wet and grow mould over the closed season.' });
    power.push({ text: 'Clean or rinse the filters before you go, not when you come back', why: 'Two minutes now, versus arriving to a unit that smells and moves no air.' });
  }
  groups.push({ title: c('g_power'), items: power });

  // --- Pests.
  const pests = [
    { text: 'Empty the bins and take the rubbish out of the building', why: 'Not to the terrace. Off the property.' },
    { text: 'Move all open food into sealed containers, or take it with you', why: 'Flour, rice, cereal and pet food are what an ant trail is heading for.' },
    { text: 'Pour a little cooking oil into every drain and the toilet bowls', why: 'The oil floats and slows evaporation, so the U-bend keeps its water seal and cockroaches cannot come up a dry pipe.' },
    { text: 'Close the toilet lids and put a weight on them', why: 'Cheap, and it works.' },
    { text: 'Check the door and window seals for gaps you can see daylight through', why: 'Anything you can post a coin through, something can walk through.' },
  ];
  if (a.season === 'summer' || a.season === 'shoulder') {
    pests.push({ text: 'Clear standing water from saucers, buckets, and the pool cover', why: 'Tiger mosquito breeds in a bottle cap of water and will still be there when you get back.' });
  }
  if (a.type === 'villa' && has(a, 'garden')) {
    pests.push({ text: 'Cut back anything touching the walls or roof', why: 'Branches against the building are a bridge for rodents and processionary caterpillar.' });
  }
  groups.push({ title: c('g_pests'), note: c('g_pests_note'), items: pests });

  // --- Damp and air.
  const damp = [
    { text: 'Leave interior doors and wardrobe doors open', why: 'Air needs to move through the whole flat, not sit in one room.' },
    { text: 'Pull furniture a few centimetres off external walls', why: 'The cold wall behind a wardrobe is where mould starts.' },
  ];
  if (a.season === 'winter' || isLong(a)) {
    damp.push({ text: 'Put moisture absorbers in the bathroom, the wardrobes and any north-facing room', why: 'A closed Spanish flat over winter is a humid box. This is the cheapest insurance on the page.' });
    damp.push({ text: 'Leave a window vent or persiana slat cracked if the property is secure enough', why: 'A little cross-ventilation beats a sealed room, provided nobody can reach it.' });
  }
  if (a.type === 'apartment') {
    damp.push({ text: 'Ask the administrador de fincas to tell you about any roof or terrace works', why: 'Community works above your flat while you are away are a common source of water damage you find out about far too late.' });
  }
  groups.push({ title: c('g_damp'), items: damp });

  // --- Security and occupation.
  // NOTE: no 48-hour rule. It does not exist in Spanish law. See rules/squatting.json.
  const sec = [
    { text: 'Set light timers in two different rooms, on different schedules', why: 'A property that visibly nobody visits is the one that gets tried.' },
    { text: 'Leave the persianas partly down, not fully shut', why: 'Fully shut for weeks says the owner is away as loudly as an open window does.' },
    { text: 'Photograph every room and keep the photos somewhere you can reach from abroad', why: 'This is your evidence of the state you left it in, and of the property being in personal use.' },
    { text: 'Take a photo of the meter readings', why: 'Settles any argument about a bill that arrives while you are away.' },
    { text: 'Do not leave keys in an outside safe or under anything', why: 'The people who look for them know all the places.' },
  ];
  if (a.checker === 'no') {
    sec.push({ text: 'Find someone. A neighbour, the community president, a key holder, anyone', why: 'This is the single biggest difference between a small problem and a big one. Nobody checking means nobody finds the leak, the break-in, or the occupation until you do.' });
  } else {
    sec.push({ text: 'Give your checker a key, your number, and written permission to enter', why: 'Without written permission they may hesitate exactly when you need them not to.' });
    sec.push({ text: 'Agree how often they will look, and ask for a photo each time', why: 'A dated photo is proof of the state of the property and of continued use.' });
  }
  if (isLong(a)) {
    sec.push({ text: 'Keep evidence that this is a home you use, not an empty investment', why: 'Under Spanish law a second home in genuine personal use can count as a morada, and the protection that follows from that is materially stronger than for a property that is simply empty. Photographs, dated stays, bills and a neighbour who can say you come and go all support it.' });
    sec.push({ text: 'If you own through a company, take advice now rather than later', why: 'The fast civil route for recovering a property is open to individuals, non-profits and public housing bodies. An owner holding through a company or an SL is not in that list and has to use the slower ordinary route.' });
  }
  sec.push({ text: 'Check your policy actually covers the property while unoccupied, and for how long', why: 'Many policies limit or exclude cover after a stated number of consecutive unoccupied days. Find the number before you rely on it.' });
  groups.push({ title: c('g_security'), note: c('g_security_note'), items: sec });

  // --- Pool.
  if (has(a, 'pool')) {
    const pool = [
      { text: 'Balance the water and shock it the day before you leave', why: 'Leaving it slightly over-treated is far better than under.' },
      { text: 'Set the pump timer for a reduced but real run each day', why: 'Turning the pump off entirely is what turns a pool green.' },
      { text: 'Drop the water level below the skimmers if nobody is topping it up', why: 'Evaporation over a Spanish summer is faster than people expect and a pump running dry burns out.' },
    ];
    if (!isShortish(a)) pool.push({ text: 'Book a pool service to visit while you are away', why: 'Cheaper than recovering a green pool, every time.' });
    if (a.season === 'winter') pool.push({ text: 'Cover it, and check the cover drains rather than pooling', why: 'A cover holding fifty litres of rainwater is a mosquito nursery and a tear waiting to happen.' });
    groups.push({ title: c('g_pool'), items: pool });
  }

  // --- Garden.
  if (has(a, 'garden')) {
    const garden = [
      { text: 'Set the irrigation timer and test it runs', why: 'Test it. A timer that has not run since last season often does not.' },
      { text: 'Move pots into shade and group them together', why: 'Grouped pots in shade hold moisture far longer than scattered ones in sun.' },
      { text: 'Cut the grass and strim right before you leave', why: 'Dry growth against a building is a fire risk and in many municipalities a legal obligation.' },
    ];
    if (isLong(a)) garden.push({ text: 'Arrange for someone to cut it once while you are away', why: 'Three months of growth is a different job from one month of growth.' });
    groups.push({ title: c('g_garden'), items: garden });
  }

  // --- Money and paperwork.
  const money = [
    { text: 'Check the balance on the account the direct debits come out of', why: 'A returned direct debit for water or power is how supply gets cut, and reconnection is slow and expensive from abroad.' },
    { text: 'Confirm the community fee is paid up to date', why: 'In Spain community debt attaches to the property, not to the owner, so it follows the house and it follows a sale.' },
    { text: 'Check nothing on the property expires while you are away', why: 'Insurance, the alarm contract, the energy certificate if you plan to sell or let.' },
    { text: 'Make sure your bank can reach you abroad', why: 'A card blocked for unusual activity while you are away also blocks the direct debits behind it.' },
  ];
  if (isLong(a)) {
    money.push({ text: 'Note your tax filing dates before you go', why: 'Non-resident filing dates moved recently. Imputed income for the year runs to 31 December, but if you pay by direct debit it closes on 23 December, and people miss that eight-day gap every year.' });
  }
  groups.push({ title: c('g_money'), note: c('g_money_note'), items: money });

  // --- Arrange before you fly.
  const arrange = [
    { text: 'Key holder briefed and contactable', why: '' },
    { text: 'Alarm or camera tested, and the alerts actually arriving on your phone', why: 'Test it from outside the property, not from the sofa.' },
    { text: 'Emergency numbers saved: plumber, electrician, locksmith, the administrador', why: 'Finding one from another country in a language you do not speak is the wrong time to start looking.' },
  ];
  if (!isShortish(a)) arrange.push({ text: 'Post redirected or someone emptying the letterbox', why: 'An overflowing letterbox is the clearest signal a property is empty.' });
  groups.push({ title: c('g_arrange'), items: arrange });

  return groups;
}
