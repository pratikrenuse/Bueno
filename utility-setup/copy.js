// All user-facing text for the utility setup planner, including the item text and the
// "why" behind each item, keyed by id under items. steps.js keeps the logic that decides
// whether an item applies. Same dot-path API as useT.
import no from './locales/no.js';
import sv from './locales/sv.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import nl from './locales/nl.js';

// English is here; the other five languages live in locales/, one file each, with the
// same key paths. steps.js reads items, gate rows and contacts from these keys.
const en = {
  eyebrow: 'Free tool',
  headline: 'Get the utilities on, in the order they have to happen',
  body: 'Power, water, gas, internet and the council charge are five separate processes with five different counters, and two of them cannot start until something else is finished. This puts your six answers in order and tells you what each one needs.',
  points: [
    'Six questions, then an ordered list you can print',
    'Shows what is blocked, and by what',
    'The document pack, the contact, and the bill each one creates',
  ],
  cta: 'Build my order of play',
  minutes: 'About a minute',

  q_stage: 'Where are you with the property?',
  q_stage_hint: 'The work is the same either way. The order changes, and so does who you can still ask for documents.',
  stage_buying: 'I am buying, or I have just completed',
  stage_buying_d: 'The supplies are still in the seller name, or just moved',
  stage_owner: 'I already own it',
  stage_owner_d: 'Something is already set up and I am changing or fixing it',

  q_supply: 'What is the state of the supplies today?',
  q_supply_hint: 'If nobody has been to the property recently, say so. Guessing here is what produces a wasted month.',
  supply_live: 'Connected and working',
  supply_live_d: 'There is power and water at the property now',
  supply_dormant: 'Connected, but the property has been empty a long time',
  supply_dormant_d: 'The meters are there. Whether the supply is still live is the question.',
  supply_off: 'Cut off, or never connected',
  supply_off_d: 'Nothing at the meter, or no meter at all',
  supply_unknown: 'I do not know yet',
  supply_unknown_d: 'Nobody has been to check',

  q_nie: 'Do you have your NIE?',
  q_nie_hint: 'The NIE is the Spanish foreigner identity number. It is the number a supply contract is issued against, so it decides how much of this list you can start.',
  nie_have: 'Yes, I have the certificate',
  nie_applied: 'Applied for, still waiting',
  nie_none: 'Not yet',

  q_account: 'Do you have a Spanish account for the bills?',
  q_account_hint: 'Almost everything here is paid by direct debit, and several providers offer no other method.',
  account_spanish: 'Yes, a Spanish account in my name',
  account_foreign: 'I have a euro account, but not a Spanish one',
  account_foreign_d: 'A euro IBAN issued outside Spain',
  account_none: 'No, not yet',

  q_type: 'What kind of property is it?',
  q_type_hint: 'It changes who you talk to, and whether some of these are yours to contract at all.',
  type_apartment: 'Apartment',
  type_apartment_d: 'In a block, with a community of owners',
  type_villa: 'House or villa',
  type_villa_d: 'On its own plot, in or near a town',
  type_rural: 'Rural or isolated',
  type_rural_d: 'Outside the village network, or in the campo',

  q_plan: 'Take over what is there, or switch supplier?',
  q_plan_hint: 'There is a right order to this, and doing it the other way round is how people lose the supply.',
  plan_takeover: 'Take over what is already there',
  plan_takeover_d: 'Fastest, and the supply stays live',
  plan_switch: 'I want to switch supplier',
  plan_switch_d: 'Better tariff, or a provider who deals with me in my language',
  plan_unsure: 'I have not decided',

  result_nie: 'Start with the NIE. Everything below waits on it.',
  result_nie_sub: 'Electricity, water and gas contracts are issued to a named person with a Spanish identity number, and the ayuntamiento will not register a change of ownership without one. You can still gather documents and book an installer today. You cannot put anything in your name.',
  result_installer: 'Book the electrical installer first. The rest can be done from a phone.',
  result_installer_sub: 'A supply that has been off cannot be energised on a certificate nobody has issued yet, and the installer has to visit to issue one. That is the longest lead time on this page, so it goes first even though it is not the first thing anyone thinks of.',
  result_account: 'You can contract the supplies. Paying for them is the part that is not ready.',
  result_account_sub: 'Nothing here is blocked, but the direct debits are, and a supply contract with no working direct debit behind it is the version of this that fails three months from now while you are in another country.',
  result_clear: 'Nothing is blocking you. Here is the order.',
  result_clear_sub: 'You have the two things that gate the rest, so this is now a sequence rather than a wait. Work down it. The lead times are at the top and the things you can do from a phone are lower.',

  restart: 'Change my answers',

  who_title: 'Who you actually deal with',
  gates_title: 'What is blocked, and by what',

  g_gates: 'First. What everything else is waiting for',
  g_gates_note: 'None of these are utility jobs. They are the reason utility jobs fail.',
  g_folder: 'The folder you will be asked for, every single time',
  g_folder_note: 'Every supplier and the ayuntamiento ask for the same four things. Scan them once, and keep them somewhere you can reach from abroad.',
  g_elec: 'Electricity',
  g_elec_note: 'You choose the supplier and you contact them directly, by phone or online.',
  g_water: 'Water',
  g_water_note: 'The one utility you do not choose. Start at the ayuntamiento, which either bills you itself or names the company holding the concession for your street.',
  g_gas: 'Gas',
  g_gas_note: 'Only some towns have a mains supply. Where there is none, gas is a delivery contract with a local depot, not a connection.',
  g_net: 'Internet and phone',
  g_net_note: 'Nothing legal turns on this one, which is why it is down here. It is also the one with an engineer appointment, so book it around a visit.',
  g_council: 'The ayuntamiento: refuse, and everything else billed to the property',
  g_council_note: 'Nobody sends a welcome letter for this. The charge exists whether or not anyone has told you about it.',
  g_dd: 'Direct debits. This is the part that actually breaks',
  g_dd_note: 'Everything here takes minutes now and is genuinely hard to fix from another country. A returned direct debit for power is how supply gets cut off while the owner is abroad.',
  g_ongoing: 'What each of these commits you to, from now on',
  g_ongoing_note: 'Setting a supply up is a day. Keeping it is a calendar.',

  shell_note: 'Practical guidance for property owners in Spain. Not legal advice.',
  gates_para: 'These four are not independent. The NIE has to exist before anything goes into your name, the account has to exist before a direct debit can be attached to it, and on a property that has been off supply the installation certificate has to exist before anyone will turn the power back on. Doing them in another order is what turns a week into a season.',
  epc_title: 'If you will sell this property, or let it to a new tenant',
  epc_p1: 'A registered energy performance certificate is required to sell, and to let to a new tenant. It is not part of getting the supplies on, and it is not something a supplier issues. A certified technician visits, rates the property and registers the certificate with your region.',
  epc_p2: 'Maximum validity is {default_years} years, except where the rating is G, in which case it is {g_years}. A large part of the older coastal stock is rated E, F or G, so if the property came with a certificate, find the letter as well as the date before you assume how long you have. Renewing a tenancy with the same tenant does not itself trigger the obligation. A new tenant does.',
  epc_p3: 'Breaches are sanctioned, and enforcement is devolved to the regions. We have not been able to source the penalty bands from the primary text, so we do not print a figure for them here.',
  source_label: 'Source',
  disclaimer: 'This is practical guidance, not legal advice. Municipal practice genuinely differs between town halls, so where this list says to ask your ayuntamiento, that is because the answer is theirs to give and not ours.',

  gate: {
    contract: 'Put a contract in your name',
    contract_waiting: 'Waiting on the NIE certificate',
    contract_blocked: 'Blocked until you have a NIE',
    open: 'Open to you now',
    dd: 'Pay by direct debit',
    dd_foreign: 'Possible, but test it before you rely on it',
    dd_blocked: 'Blocked until you have an account',
    power: 'Get the power turned on',
    power_off: 'Needs an installation certificate first',
    power_dormant: 'May need an installation certificate first',
    power_unknown: 'Unknown until someone looks at the meter',
    power_live: 'Already live, so this is a change of holder',
    water: 'Open the water contract',
    water_value: 'The ayuntamiento, once the NIE and proof of ownership are in hand',
  },

  contacts: {
    electricity: { label: 'Electricity', value: 'The supplier you choose, direct. Faults at the meter belong to the distribution company, which you do not choose.' },
    water: { label: 'Water', value: 'The ayuntamiento, or the company holding its concession. There is no choice of supplier.' },
    gas: { label: 'Gas', value: 'Mains: the supplier, like electricity. Bottled or tank: the local depot.' },
    internet: { label: 'Internet', value: 'The provider, direct. Nothing goes through the town hall.' },
    refuse: { label: 'Refuse', value: 'The ayuntamiento. Billed to the property, on its own calendar.' },
  },

  items: {
    gate_nie_apply: {
      text: 'Apply for the NIE before you contact a single supplier',
      why: 'Electricity, water and gas contracts are issued against a Spanish identity number, and the ayuntamiento will not register a change of ownership on the water without one. Every group below this waits for it.',
    },
    gate_nie_cert: {
      text: 'Get the certificate itself in your hand, and photograph it',
      why: 'The reference number from the appointment is not the document. Suppliers ask for the certificate, and each one asks separately, so you will send it four or five times.',
    },
    gate_account_open: {
      text: 'Open a Spanish account before you sign any supply contract',
      why: 'Direct debit is the normal method here and for some providers the only one. Signing first and arranging payment afterwards means going back to every provider individually, which is a far longer job than doing it in the same conversation.',
    },
    gate_iban_test: {
      text: 'Test the foreign IBAN on one bill before you rely on it for all of them',
      why: 'Under SEPA rules a provider must accept any euro IBAN. In practice ayuntamientos, water concessions and smaller providers still reject one or key it in wrongly, and the failure reaches you as an unpaid bill rather than as a refusal.',
    },
    gate_installer: {
      text: 'Book the electrical installer now, before you choose a supplier',
      why: 'The visit is the bottleneck, not the paperwork. Choosing a tariff is an evening. Getting an installer to a property in August is not.',
    },
    doc_id: {
      text: 'Passport or national ID, and a scan of it',
      why: 'Asked for when you contract, and asked for again by anyone who has to change something on the account later.',
    },
    doc_nie: {
      text: 'The NIE certificate',
      why: 'This is the number the contract is issued against, and it is what links the supply to you rather than to the address.',
    },
    doc_iban: {
      text: 'The Spanish IBAN, and the account holder name exactly as the bank writes it',
      why: 'A name that does not match is one of the most common reasons a direct debit mandate is quietly rejected weeks after you signed.',
    },
    doc_ownership: {
      text: 'Proof of your right to the property: the escritura, a nota simple, or the rental contract',
      why: 'Suppliers will not put a supply in the name of someone who cannot show a connection to the address.',
    },
    buy_last_bills: {
      text: 'The last bill for every supply, from the seller, at the notary',
      why: 'Each one carries the supply point reference, the CUPS on power and gas, and the contracted power. Without it you are asking a supplier to find your property by address, which is slow and occasionally finds the wrong one. After completion the seller has no reason to answer the phone.',
    },
    buy_paid_up: {
      text: 'Written confirmation from the seller that every supply bill is paid up to date',
      why: 'Debt sitting on a supply point can hold up a change of holder, and it is far easier to raise before completion than to chase afterwards.',
    },
    buy_meter_photos: {
      text: 'A photograph of every meter on the day you get the keys',
      why: 'The reading on handover day is what settles who pays for what was used before you arrived. It takes thirty seconds and it is unarguable.',
    },
    buy_no_cancel: {
      text: 'Ask the seller in writing not to cancel anything',
      why: 'A change of holder on a live supply is a form. A new connection on a dead one is a certificate, a technician and a wait. Sellers cancel supplies to stop their own bills, and they do it without telling anyone.',
    },
    elec_boletin: {
      text: 'Have an authorised installer issue the electrical installation certificate, the boletin or CIE',
      why: 'A supplier will not energise a supply that has been off for a long period without a current certificate, and only an installer who has seen the property can issue one. How long counts as long enough is set regionally, so assume you need one and let the installer tell you otherwise.',
    },
    elec_supply_point: {
      text: 'Ask whether the supply point still exists or was given up',
      why: 'A supply that was suspended is a reconnection. A supply that was cancelled is a new connection, priced and scheduled differently. The supplier can tell you in a minute from the CUPS, and it changes what you should be budgeting.',
    },
    elec_titularidad: {
      text: 'Ask specifically for a cambio de titularidad, a change of holder',
      why: 'It keeps the supply live and moves it into your name in one step. Cancelling and contracting again instead drops the supply, and getting it back is a charge and a wait rather than a phone call.',
    },
    elec_name_first: {
      text: 'Put the contract into your name first. Switch supplier second',
      why: 'You cannot move a contract that is not yours, and while it stays in the seller name they can cancel it from under you. Change the holder, live with the tariff for one cycle, then switch.',
    },
    elec_three_questions: {
      text: 'Before you sign the new tariff, ask three things: fixed or indexed price, minimum term, and what the standing charge is',
      why: 'The unit price is what gets advertised. For a property that is empty half the year, the standing charge and a minimum term matter more than the unit price does.',
    },
    elec_potencia: {
      text: 'Check the contracted power, the potencia contratada, on the last bill before you accept it',
      why: 'The standing charge is set by the contracted power and it is charged whether the property is occupied or empty all winter. A holiday home carrying the potencia a full-time family needed pays for that every month of the year, and lowering it is one phone call.',
    },
    elec_phase: {
      text: 'Ask whether the supply is single phase or three phase, and what the installation will actually carry',
      why: 'Pool pump, air conditioning and an induction hob together are a different load from what an old house was wired for. Raising the contracted power beyond what the installation allows means a new certificate and possibly work at the meter, and that is a much better conversation to have before the builders leave.',
    },
    elec_block: {
      text: 'Ask the administrador de fincas what is billed to the block and what is billed to you',
      why: 'Stair lighting, the lift and the pool pump are the community supply and reach you inside the community fee. Only your own meter belongs on your contract.',
    },
    elec_no_mains: {
      text: 'If there is no mains connection, get a written study and price before you assume there will be one',
      why: 'Bringing a new supply to an isolated plot is a project with a quote attached, not a contract change. Owners find this out after they have bought, and by then solar with storage is often the honest answer rather than the alternative one.',
    },
    water_counter: {
      text: 'Go to the ayuntamiento, register the change of ownership, and open the new contract',
      why: 'This is the one supply that is not on any comparison site. The town hall either bills you directly or tells you which company holds the concession for your street, and there is no second option to shop for.',
    },
    water_folder: {
      text: 'Take the same folder. ID, NIE, IBAN and proof of ownership',
      why: 'They ask for exactly what the suppliers ask for. A missing document here is a second trip rather than a follow-up email.',
    },
    water_no_connection: {
      text: 'If there is no water connection at all, start this before anything else on the page',
      why: 'Connecting a property that has never been connected is a municipal works process rather than a contract change, and it runs in months rather than days. Everything else on this list can wait for it more easily than it can wait for them.',
    },
    water_own_meter: {
      text: 'Check whether your flat has its own meter or the block shares one',
      why: 'Some blocks hold a single water contract and split it through the community accounts. If yours does, there is nothing for you to contract, and the risk turns into paying a bill that was never yours.',
    },
    water_well: {
      text: 'If the water comes from a well, a borehole or a deposit, ask to see the abstraction paperwork',
      why: 'Taking groundwater is authorised by the river basin authority, the Confederacion Hidrografica. Either the authorisation transferred with the property or it never existed, and there is no way to tell by looking at the pump.',
    },
    water_deposit: {
      text: 'If there is a deposit and a delivery, find out who delivers and what the lead time is in August',
      why: 'A tank that runs dry in the week the whole coast is refilling theirs is the kind of problem that has no paperwork solution.',
    },
    water_meter_access: {
      text: 'Ask where the meter is and whether the reader can physically reach it',
      why: 'A meter behind a locked gate gets estimated readings. Estimates are corrected eventually, and the correction arrives as one bill rather than as several.',
    },
    water_other_charges: {
      text: 'Ask the ayuntamiento what else is billed to this property',
      why: 'The refuse charge and sometimes the sewerage charge ride on the water bill or come from the same office. Asking once at the counter is much cheaper than finding out through a demand.',
    },
    gas_mains: {
      text: 'Find out whether the street has mains gas before you shop for a gas tariff',
      why: 'Mains gas reaches a minority of Spanish addresses. In much of the country the honest answer is that there is nothing to contract and the question is closed.',
    },
    gas_bottles: {
      text: 'If it runs on bottles, find the local depot and ask how delivery works when nobody is there',
      why: 'A bottle contract is with a depot, not a national supplier. A delivery that needs someone at the door is not much use to an owner who visits twice a year, and the neighbour arrangement is the actual answer most people end up with.',
    },
    gas_inspection: {
      text: 'If there is a gas installation, diarise the periodic safety inspection',
      why: 'A gas installation has to be inspected on a set cycle, at your cost, and the inspector needs to get inside. It is a job to schedule around a visit rather than to be surprised by while you are in another country.',
    },
    gas_old_install: {
      text: 'Expect an inspection before an old gas installation goes back into service',
      why: 'An installation that has been out of use for years is not simply switched on again, and finding that out on the day you arrive with the family is the wrong day.',
    },
    gas_combined: {
      text: 'Price a combined gas and electricity tariff, then price them separately as well',
      why: 'Combined tariffs are common here and sometimes genuinely cheaper. Sometimes they are two average prices instead of two good ones, and the only way to know is to ask for both.',
    },
    net_coverage: {
      text: 'Check coverage at the exact address, not the town',
      why: 'Fibre availability changes street by street on the coast and stops abruptly outside the villages. The town being covered means very little.',
    },
    net_keep_line: {
      text: 'Keep any existing line running until the new one works',
      why: 'Cancelling first leaves you with no connection and no way to manage anything else remotely, and reinstalling is a second engineer appointment you have to be present for.',
    },
    net_min_term: {
      text: 'Check the minimum term, and what happens to the router if you cancel',
      why: 'Minimum terms are normal here and the equipment usually has to go back. Both are far cheaper to know now than at the point of leaving.',
    },
    net_block_fibre: {
      text: 'Ask the administrador whether the block already has fibre to the door, and what route new cabling must take',
      why: 'Communities set rules about drilling and trunking, and an engineer who ignores them gets stopped by a neighbour halfway through the job.',
    },
    net_no_fibre: {
      text: 'Ask what the answer is if fibre does not reach you',
      why: 'Fixed wireless and mobile routers are the normal answer inland. The equipment and the contract are different, so it is worth knowing before you sign a minimum term for something that will not be installed.',
    },
    council_register: {
      text: 'Register the change of ownership for the refuse charge, the tasa de basura',
      why: 'It is charged to the property on the municipality own calendar, and until somebody tells the council otherwise the bill keeps going to the previous owner. The debt does not.',
    },
    council_billing: {
      text: 'Ask how it is billed and how often, because it differs between municipalities',
      why: 'Some bill it with the water, some once a year on its own, some alongside the IBI. There is no national answer, only your town hall answer, and it is a two minute question at the counter.',
    },
    council_dd: {
      text: 'Set the direct debit for it while you are standing there',
      why: 'A municipal charge that goes unpaid moves into an enforcement procedure with a surcharge added, and the first you hear of it is a letter in Spanish arriving at a property you are not in.',
    },
    council_ibi: {
      text: 'While you are at the counter, check the IBI is domiciled to the same account',
      why: 'It comes from the same office, it is billed once a year, and a once a year payment is exactly the kind an owner abroad misses.',
    },
    council_community: {
      text: 'Ask whether the community handles refuse collection for the block',
      why: 'The bins may well be communal. The charge is still yours, and the two facts get confused often enough to be worth ten seconds.',
    },
    dd_same_time: {
      text: 'Set the domiciliacion up in the same conversation as the contract',
      why: 'Adding it afterwards is a separate process with each provider, one at a time, and several will only accept the instruction from you rather than from a bank.',
    },
    dd_name: {
      text: 'Give the account holder name exactly as the bank holds it',
      why: 'A mandate in a slightly different name is a mandate that gets rejected, and the rejection surfaces as an unpaid bill rather than as an error you were told about.',
    },
    dd_date: {
      text: 'Expect the provider to choose the collection date, not you',
      why: 'Spanish providers set their own collection dates and they are not obliged to fit your salary date in another country. An account topped up on a schedule that suits home is an account that is empty on the day they collect.',
    },
    dd_buffer: {
      text: 'Keep a standing buffer in the account rather than the exact amount',
      why: 'Bills move with consumption and with the season. A debit for a few euros more than you left behind is a returned debit exactly like any other.',
    },
    dd_returned: {
      text: 'Treat a returned debit for power as urgent, not as admin',
      why: 'A returned direct debit is how supply gets cut off while the owner is abroad. Reconnection is slow and it costs, and in the meantime the fridge, the alarm and the dehumidifier are all off and nobody is there to notice.',
    },
    dd_receipts: {
      text: 'Download and keep the payment receipt for every direct debit',
      why: 'Each one carries the customer reference number the provider needs before it will change anything. It is the single document that makes moving a direct debit possible later, and it is much easier to save now than to reconstruct.',
    },
    dd_change_bank: {
      text: 'If you ever change bank, expect to tell every provider yourself',
      why: 'There is no automatic switching service here of the kind some countries have. You give each provider the change, some accept it only from the customer, and until each one confirms it nothing has actually moved.',
    },
    dd_old_account: {
      text: 'Leave the old account funded for one full billing cycle after any change',
      why: 'If a payment falls due shortly after you request a change, the provider may still take that one from the old account. The change is real only once you have watched a full cycle land on the new one.',
    },
    dd_first_bill: {
      text: 'Check the first bill after any change, for the amount and for the account',
      why: 'This is the point at which a mistake is still small and still yours to fix.',
    },
    dd_foreign_start: {
      text: 'Start with the ayuntamiento if you are using a foreign IBAN',
      why: 'Municipal counters and water concessions are where a non-Spanish IBAN is most likely to be refused or mistyped. If it is going to fail, it fails there, and you want to know that before four other providers are relying on it.',
    },
    on_cycle: {
      text: 'Bills arrive on the provider cycle, not on yours',
      why: 'Monthly, every two months or quarterly depending on who you are with and where the property is. Note which, so that a bill that does not arrive is something you notice rather than something you discover.',
    },
    on_standing: {
      text: 'A standing charge runs whether or not anybody is in the property',
      why: 'Power and water both charge for being connected. An empty holiday home has a floor to its bills, and the contracted power is usually the only real lever on it.',
    },
    on_gas_inspection: {
      text: 'The gas installation has to be inspected periodically, at your cost, with someone there',
      why: 'It is not optional and it needs access, which for an owner abroad means planning rather than reacting.',
    },
    on_estimates: {
      text: 'Readings get estimated when nobody can reach the meter',
      why: 'Estimates are corrected eventually and the correction is not spread out. It arrives whole.',
    },
    on_refuse: {
      text: 'The refuse charge continues for as long as you own the property',
      why: 'It attaches to the property, not to whether anyone uses it or whether the bins were ever put out.',
    },
    on_tariff: {
      text: 'Look at the tariff once a year rather than never',
      why: 'Tariffs roll over quietly. A yearly look at the standing charge and the contracted power is usually where the money is, rather than in the unit price everybody compares.',
    },
    on_community: {
      text: 'The community fee is separate from all of this, and it does not stop',
      why: 'Community debt attaches to the property in Spain, not to the owner who ran it up, so it follows the house and it follows a sale.',
    },
  },
};

export default { en, no, sv, de, fr, nl };
