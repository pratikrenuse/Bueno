// Builds the ordered utility plan from the six answers.
//
// The value of this tool is the sequence and the dependencies, which prose hides. Three
// of them matter more than everything else:
//
//   1. The NIE gates contracting. A supply contract is issued to a named person with a
//      Spanish identity number, so without it nothing goes into your name.
//   2. The Spanish account gates the direct debits, and the direct debits are how the
//      supply stays on once you leave the country.
//   3. On a property that has been off supply, the electrical installation certificate
//      gates energisation, and it needs a physical visit. It is the longest lead time on
//      the page and almost nobody puts it first.
//
// Same rule as the other generators: every item earns its place by preventing something
// specific, and the "why" says what. No figures anywhere in this file. The gas inspection
// cost, the certificate cost and the antiquity periods that appear in the source articles
// are not in the rules base, so they are described and not quoted.

const off = a => a.supply === 'off';
const dormant = a => a.supply === 'dormant';
const unknownSupply = a => a.supply === 'unknown';
const mayNeedBoletin = a => off(a) || dormant(a) || unknownSupply(a);
const buying = a => a.stage === 'buying';

// --- the gates ------------------------------------------------------------------------
// Returned separately from the list because this is the answer, and the answer goes above
// the list rather than inside it.
export function buildGates(a) {
  const nieOpen = a.nie !== 'have';
  const accountOpen = a.account !== 'spanish';
  const supplyOpen = mayNeedBoletin(a);

  const verdict = nieOpen ? 'nie' : supplyOpen ? 'installer' : accountOpen ? 'account' : 'clear';

  const rows = [
    {
      label: 'Put a contract in your name',
      value: nieOpen
        ? (a.nie === 'applied' ? 'Waiting on the NIE certificate' : 'Blocked until you have a NIE')
        : 'Open to you now',
      strong: nieOpen,
    },
    {
      label: 'Pay by direct debit',
      value: a.account === 'spanish'
        ? 'Open to you now'
        : a.account === 'foreign'
          ? 'Possible, but test it before you rely on it'
          : 'Blocked until you have an account',
      strong: accountOpen,
    },
    {
      label: 'Get the power turned on',
      value: off(a)
        ? 'Needs an installation certificate first'
        : dormant(a)
          ? 'May need an installation certificate first'
          : unknownSupply(a)
            ? 'Unknown until someone looks at the meter'
            : 'Already live, so this is a change of holder',
      strong: supplyOpen,
    },
    {
      label: 'Open the water contract',
      value: 'The ayuntamiento, once the NIE and proof of ownership are in hand',
    },
  ];

  return { verdict, rows, nieOpen, accountOpen, supplyOpen };
}

// --- the ordered list -----------------------------------------------------------------
export function buildSteps(a, c) {
  const groups = [];

  // 1. The gates. Only appears when something is actually blocking, so an owner who is
  //    ready does not read a group of things that do not apply to them.
  const gates = [];
  if (a.nie === 'none') {
    gates.push({ text: 'Apply for the NIE before you contact a single supplier', why: 'Electricity, water and gas contracts are issued against a Spanish identity number, and the ayuntamiento will not register a change of ownership on the water without one. Every group below this waits for it.' });
  }
  if (a.nie === 'applied') {
    gates.push({ text: 'Get the certificate itself in your hand, and photograph it', why: 'The reference number from the appointment is not the document. Suppliers ask for the certificate, and each one asks separately, so you will send it four or five times.' });
  }
  if (a.account === 'none') {
    gates.push({ text: 'Open a Spanish account before you sign any supply contract', why: 'Direct debit is the normal method here and for some providers the only one. Signing first and arranging payment afterwards means going back to every provider individually, which is a far longer job than doing it in the same conversation.' });
  }
  if (a.account === 'foreign') {
    gates.push({ text: 'Test the foreign IBAN on one bill before you rely on it for all of them', why: 'Under SEPA rules a provider must accept any euro IBAN. In practice ayuntamientos, water concessions and smaller providers still reject one or key it in wrongly, and the failure reaches you as an unpaid bill rather than as a refusal.' });
  }
  if (mayNeedBoletin(a)) {
    gates.push({ text: 'Book the electrical installer now, before you choose a supplier', why: 'The visit is the bottleneck, not the paperwork. Choosing a tariff is an evening. Getting an installer to a property in August is not.' });
  }
  if (gates.length) groups.push({ title: c('g_gates'), note: c('g_gates_note'), items: gates });

  // 2. The document pack. Identical for every counter, which is the point.
  const folder = [
    { text: 'Passport or national ID, and a scan of it', why: 'Asked for when you contract, and asked for again by anyone who has to change something on the account later.' },
    { text: 'The NIE certificate', why: 'This is the number the contract is issued against, and it is what links the supply to you rather than to the address.' },
    { text: 'The Spanish IBAN, and the account holder name exactly as the bank writes it', why: 'A name that does not match is one of the most common reasons a direct debit mandate is quietly rejected weeks after you signed.' },
    { text: 'Proof of your right to the property: the escritura, a nota simple, or the rental contract', why: 'Suppliers will not put a supply in the name of someone who cannot show a connection to the address.' },
  ];
  if (buying(a)) {
    folder.push({ text: 'The last bill for every supply, from the seller, at the notary', why: 'Each one carries the supply point reference, the CUPS on power and gas, and the contracted power. Without it you are asking a supplier to find your property by address, which is slow and occasionally finds the wrong one. After completion the seller has no reason to answer the phone.' });
    folder.push({ text: 'Written confirmation from the seller that every supply bill is paid up to date', why: 'Debt sitting on a supply point can hold up a change of holder, and it is far easier to raise before completion than to chase afterwards.' });
    folder.push({ text: 'A photograph of every meter on the day you get the keys', why: 'The reading on handover day is what settles who pays for what was used before you arrived. It takes thirty seconds and it is unarguable.' });
    folder.push({ text: 'Ask the seller in writing not to cancel anything', why: 'A change of holder on a live supply is a form. A new connection on a dead one is a certificate, a technician and a wait. Sellers cancel supplies to stop their own bills, and they do it without telling anyone.' });
  }
  groups.push({ title: c('g_folder'), note: c('g_folder_note'), items: folder });

  // 3. Electricity. Ordered by lead time, longest first.
  const elec = [];
  if (mayNeedBoletin(a)) {
    elec.push({ text: 'Have an authorised installer issue the electrical installation certificate, the boletin or CIE', why: 'A supplier will not energise a supply that has been off for a long period without a current certificate, and only an installer who has seen the property can issue one. How long counts as long enough is set regionally, so assume you need one and let the installer tell you otherwise.' });
  }
  if (off(a) || unknownSupply(a)) {
    elec.push({ text: 'Ask whether the supply point still exists or was given up', why: 'A supply that was suspended is a reconnection. A supply that was cancelled is a new connection, priced and scheduled differently. The supplier can tell you in a minute from the CUPS, and it changes what you should be budgeting.' });
  }
  if (a.plan === 'takeover' || a.plan === 'unsure') {
    elec.push({ text: 'Ask specifically for a cambio de titularidad, a change of holder', why: 'It keeps the supply live and moves it into your name in one step. Cancelling and contracting again instead drops the supply, and getting it back is a charge and a wait rather than a phone call.' });
  }
  if (a.plan === 'switch') {
    elec.push({ text: 'Put the contract into your name first. Switch supplier second', why: 'You cannot move a contract that is not yours, and while it stays in the seller name they can cancel it from under you. Change the holder, live with the tariff for one cycle, then switch.' });
    elec.push({ text: 'Before you sign the new tariff, ask three things: fixed or indexed price, minimum term, and what the standing charge is', why: 'The unit price is what gets advertised. For a property that is empty half the year, the standing charge and a minimum term matter more than the unit price does.' });
  }
  elec.push({ text: 'Check the contracted power, the potencia contratada, on the last bill before you accept it', why: 'The standing charge is set by the contracted power and it is charged whether the property is occupied or empty all winter. A holiday home carrying the potencia a full-time family needed pays for that every month of the year, and lowering it is one phone call.' });
  if (a.type === 'villa' || a.type === 'rural') {
    elec.push({ text: 'Ask whether the supply is single phase or three phase, and what the installation will actually carry', why: 'Pool pump, air conditioning and an induction hob together are a different load from what an old house was wired for. Raising the contracted power beyond what the installation allows means a new certificate and possibly work at the meter, and that is a much better conversation to have before the builders leave.' });
  }
  if (a.type === 'apartment') {
    elec.push({ text: 'Ask the administrador de fincas what is billed to the block and what is billed to you', why: 'Stair lighting, the lift and the pool pump are the community supply and reach you inside the community fee. Only your own meter belongs on your contract.' });
  }
  if (a.type === 'rural') {
    elec.push({ text: 'If there is no mains connection, get a written study and price before you assume there will be one', why: 'Bringing a new supply to an isolated plot is a project with a quote attached, not a contract change. Owners find this out after they have bought, and by then solar with storage is often the honest answer rather than the alternative one.' });
  }
  groups.push({ title: c('g_elec'), note: c('g_elec_note'), items: elec });

  // 4. Water. Municipal, so it starts at a counter rather than a call centre.
  const water = [
    { text: 'Go to the ayuntamiento, register the change of ownership, and open the new contract', why: 'This is the one supply that is not on any comparison site. The town hall either bills you directly or tells you which company holds the concession for your street, and there is no second option to shop for.' },
    { text: 'Take the same folder. ID, NIE, IBAN and proof of ownership', why: 'They ask for exactly what the suppliers ask for. A missing document here is a second trip rather than a follow-up email.' },
  ];
  if (off(a) || unknownSupply(a)) {
    water.push({ text: 'If there is no water connection at all, start this before anything else on the page', why: 'Connecting a property that has never been connected is a municipal works process rather than a contract change, and it runs in months rather than days. Everything else on this list can wait for it more easily than it can wait for them.' });
  }
  if (a.type === 'apartment') {
    water.push({ text: 'Check whether your flat has its own meter or the block shares one', why: 'Some blocks hold a single water contract and split it through the community accounts. If yours does, there is nothing for you to contract, and the risk turns into paying a bill that was never yours.' });
  }
  if (a.type === 'rural') {
    water.push({ text: 'If the water comes from a well, a borehole or a deposit, ask to see the abstraction paperwork', why: 'Taking groundwater is authorised by the river basin authority, the Confederacion Hidrografica. Either the authorisation transferred with the property or it never existed, and there is no way to tell by looking at the pump.' });
    water.push({ text: 'If there is a deposit and a delivery, find out who delivers and what the lead time is in August', why: 'A tank that runs dry in the week the whole coast is refilling theirs is the kind of problem that has no paperwork solution.' });
  }
  water.push({ text: 'Ask where the meter is and whether the reader can physically reach it', why: 'A meter behind a locked gate gets estimated readings. Estimates are corrected eventually, and the correction arrives as one bill rather than as several.' });
  water.push({ text: 'Ask the ayuntamiento what else is billed to this property', why: 'The refuse charge and sometimes the sewerage charge ride on the water bill or come from the same office. Asking once at the counter is much cheaper than finding out through a demand.' });
  groups.push({ title: c('g_water'), note: c('g_water_note'), items: water });

  // 5. Gas. Often nothing to do, and saying so is the useful part.
  const gas = [
    { text: 'Find out whether the street has mains gas before you shop for a gas tariff', why: 'Mains gas reaches a minority of Spanish addresses. In much of the country the honest answer is that there is nothing to contract and the question is closed.' },
    { text: 'If it runs on bottles, find the local depot and ask how delivery works when nobody is there', why: 'A bottle contract is with a depot, not a national supplier. A delivery that needs someone at the door is not much use to an owner who visits twice a year, and the neighbour arrangement is the actual answer most people end up with.' },
    { text: 'If there is a gas installation, diarise the periodic safety inspection', why: 'A gas installation has to be inspected on a set cycle, at your cost, and the inspector needs to get inside. It is a job to schedule around a visit rather than to be surprised by while you are in another country.' },
  ];
  if (dormant(a) || off(a)) {
    gas.push({ text: 'Expect an inspection before an old gas installation goes back into service', why: 'An installation that has been out of use for years is not simply switched on again, and finding that out on the day you arrive with the family is the wrong day.' });
  }
  if (a.plan === 'switch') {
    gas.push({ text: 'Price a combined gas and electricity tariff, then price them separately as well', why: 'Combined tariffs are common here and sometimes genuinely cheaper. Sometimes they are two average prices instead of two good ones, and the only way to know is to ask for both.' });
  }
  groups.push({ title: c('g_gas'), note: c('g_gas_note'), items: gas });

  // 6. Internet.
  const net = [
    { text: 'Check coverage at the exact address, not the town', why: 'Fibre availability changes street by street on the coast and stops abruptly outside the villages. The town being covered means very little.' },
    { text: 'Keep any existing line running until the new one works', why: 'Cancelling first leaves you with no connection and no way to manage anything else remotely, and reinstalling is a second engineer appointment you have to be present for.' },
    { text: 'Check the minimum term, and what happens to the router if you cancel', why: 'Minimum terms are normal here and the equipment usually has to go back. Both are far cheaper to know now than at the point of leaving.' },
  ];
  if (a.type === 'apartment') {
    net.push({ text: 'Ask the administrador whether the block already has fibre to the door, and what route new cabling must take', why: 'Communities set rules about drilling and trunking, and an engineer who ignores them gets stopped by a neighbour halfway through the job.' });
  }
  if (a.type === 'rural') {
    net.push({ text: 'Ask what the answer is if fibre does not reach you', why: 'Fixed wireless and mobile routers are the normal answer inland. The equipment and the contract are different, so it is worth knowing before you sign a minimum term for something that will not be installed.' });
  }
  groups.push({ title: c('g_net'), note: c('g_net_note'), items: net });

  // 7. The council. The one nobody is told about.
  const council = [
    { text: 'Register the change of ownership for the refuse charge, the tasa de basura', why: 'It is charged to the property on the municipality own calendar, and until somebody tells the council otherwise the bill keeps going to the previous owner. The debt does not.' },
    { text: 'Ask how it is billed and how often, because it differs between municipalities', why: 'Some bill it with the water, some once a year on its own, some alongside the IBI. There is no national answer, only your town hall answer, and it is a two minute question at the counter.' },
    { text: 'Set the direct debit for it while you are standing there', why: 'A municipal charge that goes unpaid moves into an enforcement procedure with a surcharge added, and the first you hear of it is a letter in Spanish arriving at a property you are not in.' },
    { text: 'While you are at the counter, check the IBI is domiciled to the same account', why: 'It comes from the same office, it is billed once a year, and a once a year payment is exactly the kind an owner abroad misses.' },
  ];
  if (a.type === 'apartment') {
    council.push({ text: 'Ask whether the community handles refuse collection for the block', why: 'The bins may well be communal. The charge is still yours, and the two facts get confused often enough to be worth ten seconds.' });
  }
  groups.push({ title: c('g_council'), note: c('g_council_note'), items: council });

  // 8. Direct debits. Its own group, because this is where a working set of utilities
  //    quietly stops working.
  const dd = [
    { text: 'Set the domiciliacion up in the same conversation as the contract', why: 'Adding it afterwards is a separate process with each provider, one at a time, and several will only accept the instruction from you rather than from a bank.' },
    { text: 'Give the account holder name exactly as the bank holds it', why: 'A mandate in a slightly different name is a mandate that gets rejected, and the rejection surfaces as an unpaid bill rather than as an error you were told about.' },
    { text: 'Expect the provider to choose the collection date, not you', why: 'Spanish providers set their own collection dates and they are not obliged to fit your salary date in another country. An account topped up on a schedule that suits home is an account that is empty on the day they collect.' },
    { text: 'Keep a standing buffer in the account rather than the exact amount', why: 'Bills move with consumption and with the season. A debit for a few euros more than you left behind is a returned debit exactly like any other.' },
    { text: 'Treat a returned debit for power as urgent, not as admin', why: 'A returned direct debit is how supply gets cut off while the owner is abroad. Reconnection is slow and it costs, and in the meantime the fridge, the alarm and the dehumidifier are all off and nobody is there to notice.' },
    { text: 'Download and keep the payment receipt for every direct debit', why: 'Each one carries the customer reference number the provider needs before it will change anything. It is the single document that makes moving a direct debit possible later, and it is much easier to save now than to reconstruct.' },
    { text: 'If you ever change bank, expect to tell every provider yourself', why: 'There is no automatic switching service here of the kind some countries have. You give each provider the change, some accept it only from the customer, and until each one confirms it nothing has actually moved.' },
    { text: 'Leave the old account funded for one full billing cycle after any change', why: 'If a payment falls due shortly after you request a change, the provider may still take that one from the old account. The change is real only once you have watched a full cycle land on the new one.' },
    { text: 'Check the first bill after any change, for the amount and for the account', why: 'This is the point at which a mistake is still small and still yours to fix.' },
  ];
  if (a.account === 'foreign') {
    dd.push({ text: 'Start with the ayuntamiento if you are using a foreign IBAN', why: 'Municipal counters and water concessions are where a non-Spanish IBAN is most likely to be refused or mistyped. If it is going to fail, it fails there, and you want to know that before four other providers are relying on it.' });
  }
  groups.push({ title: c('g_dd'), note: c('g_dd_note'), items: dd });

  // 9. What it all commits you to. The part the setup guides leave out.
  const ongoing = [
    { text: 'Bills arrive on the provider cycle, not on yours', why: 'Monthly, every two months or quarterly depending on who you are with and where the property is. Note which, so that a bill that does not arrive is something you notice rather than something you discover.' },
    { text: 'A standing charge runs whether or not anybody is in the property', why: 'Power and water both charge for being connected. An empty holiday home has a floor to its bills, and the contracted power is usually the only real lever on it.' },
    { text: 'The gas installation has to be inspected periodically, at your cost, with someone there', why: 'It is not optional and it needs access, which for an owner abroad means planning rather than reacting.' },
    { text: 'Readings get estimated when nobody can reach the meter', why: 'Estimates are corrected eventually and the correction is not spread out. It arrives whole.' },
    { text: 'The refuse charge continues for as long as you own the property', why: 'It attaches to the property, not to whether anyone uses it or whether the bins were ever put out.' },
    { text: 'Look at the tariff once a year rather than never', why: 'Tariffs roll over quietly. A yearly look at the standing charge and the contracted power is usually where the money is, rather than in the unit price everybody compares.' },
  ];
  if (a.type === 'apartment') {
    ongoing.push({ text: 'The community fee is separate from all of this, and it does not stop', why: 'Community debt attaches to the property in Spain, not to the owner who ran it up, so it follows the house and it follows a sale.' });
  }
  groups.push({ title: c('g_ongoing'), note: c('g_ongoing_note'), items: ongoing });

  return groups;
}

// Who you deal with for each supply. Flat, because the answer differs per utility and
// that is exactly the thing owners get wrong.
export const CONTACTS = [
  { label: 'Electricity', value: 'The supplier you choose, direct. Faults at the meter belong to the distribution company, which you do not choose.' },
  { label: 'Water', value: 'The ayuntamiento, or the company holding its concession. There is no choice of supplier.' },
  { label: 'Gas', value: 'Mains: the supplier, like electricity. Bottled or tank: the local depot.' },
  { label: 'Internet', value: 'The provider, direct. Nothing goes through the town hall.' },
  { label: 'Refuse', value: 'The ayuntamiento. Billed to the property, on its own calendar.' },
];
