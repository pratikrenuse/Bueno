// All user-facing text for the quote checker, in six languages. The lines to put back to
// the contractor live here under q.<id> and always.<id>; the Spanish version of each line
// lives in flags.js, next to the logic that decides which of them you need. Same dot-path
// API as useT.
import no from './locales/no.js';
import sv from './locales/sv.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import nl from './locales/nl.js';

const en = {
  eyebrow: 'Free tool',
  headline: 'Check a builder quote before you sign it',
  body: 'Most bad building jobs in Spain are visible in the quote, and most of them are visible as something missing rather than as something wrong. Twelve questions, then a red flag count and the exact words to put back to the contractor.',
  points: [
    'Twelve questions about the quote in front of you',
    'Every unresolved item comes with the question to ask, in English and in Spanish',
    'What changes if the job is obra mayor rather than obra menor',
  ],
  cta: 'Check my quote',
  minutes: 'About two minutes',

  q_written: 'Is the quote in writing?',
  q_written_hint: 'A presupuesto is the normal Spanish word for it. Look for the company trading name, address and CIF on the document.',
  written_formal: 'Yes, a written presupuesto with the company details on it',
  written_informal: 'Written, but it is a message with a total in it',
  written_informal_d: 'An email or a WhatsApp with a number and no company details',
  written_verbal: 'No, we agreed it verbally',

  q_itemised: 'Is the price broken down?',
  q_itemised_hint: 'Partidas is the word for the line items. You are looking for trades and materials separated, not one figure at the bottom.',
  itemised_full: 'Yes, line by line, with materials and labour separate',
  itemised_partial: 'A few headings, but most of it is grouped',
  itemised_total: 'No, it is one total',

  q_iva: 'Does it say whether IVA is included?',
  q_iva_hint: 'This is the single most common surprise on a Spanish renovation bill. It should be a line on the quote, not a conversation.',
  iva_stated: 'Yes, it says either way',
  iva_silent: 'No, it does not mention IVA',
  iva_unsure: 'I am not sure',

  q_fixed: 'Is it a closed price or an estimate?',
  q_fixed_hint: 'Precio cerrado means the price is fixed. An estimate is perfectly normal on an old property. Silence about which one you are holding is not.',
  fixed_closed: 'It says the price is closed',
  fixed_variable: 'It says the price can move, and why',
  fixed_silent: 'It does not say either way',

  q_registered: 'Have you seen proof the business is registered?',
  q_registered_hint: 'A CIF for a company, or an autonomo registration for a sole trader, plus a certificate that they are up to date with tax and social security. Asking for these is routine here and is not an accusation.',
  registered_seen: 'Yes, I have seen the documents',
  registered_told: 'No, I have been told they are registered',
  registered_unsure: 'I do not know what I should be asking for',

  q_insurance: 'Have you seen their liability insurance?',
  q_insurance_hint: 'Responsabilidad civil. It covers the damage the work does to someone else, which for an apartment usually means the flat below.',
  insurance_seen: 'Yes, I have seen the policy and the dates',
  insurance_told: 'No, I have been told they have it',
  insurance_unsure: 'It has not come up',

  q_licence: 'Does the work need a town hall licence, and who is applying?',
  q_licence_hint: 'Almost all building work in Spain needs either a licence or a declaration to the ayuntamiento, including work that feels minor. The question is who is doing it.',
  licence_contractor: 'It needs one, and the contractor is applying',
  licence_contractor_d: 'And that is written down somewhere',
  licence_owner: 'It needs one, and I am applying',
  licence_none_needed: 'The contractor says no licence is needed',
  licence_unsure: 'Nobody has said',

  q_deposit: 'How much is being asked for up front?',
  q_deposit_hint: 'Some money before materials are ordered is normal. What matters is what it buys and whether the rest is tied to work you can see.',
  deposit_none: 'Nothing before work starts',
  deposit_small: 'A modest amount for materials, with an invoice',
  deposit_half: 'About half the total',
  deposit_most: 'Most or all of it, before anything starts',
  deposit_unsure: 'It has not been discussed yet',

  q_cash: 'Has cash, or payment without an invoice, been suggested?',
  q_cash_hint: 'Sin factura is the phrase. It usually arrives as an offer of a lower price, which is what makes it tempting.',
  cash_no: 'No, everything is invoiced',
  cash_part: 'Part of it in cash, or part without an invoice',
  cash_all: 'The whole job, cash, no invoice',

  q_dates: 'Are there start and completion dates in writing?',
  q_dates_hint: 'Renovations here do run over and a good contractor will say so. A written date is not a punishment, it is something to talk about from abroad.',
  dates_written: 'Yes, both are written down',
  dates_verbal: 'We discussed dates, nothing is written',
  dates_none: 'No dates at all',

  q_price: 'How does the price compare with your other quotes?',
  q_price_hint: 'For this to mean anything the quotes have to be for the same written specification. If they are not, that is the thing to fix first.',
  price_inline: 'It is in line with the others',
  price_below: 'It is far below the others',
  price_only: 'It is the only quote I have',

  q_bank: 'How did you get the bank details?',
  q_bank_hint: 'This is the question that protects the largest amount of money on the page, and it takes one phone call to answer.',
  bank_verified: 'Confirmed by voice, on a number I already had',
  bank_email: 'They came by email or message and I have not checked them',
  bank_changed: 'The details changed at some point',
  bank_none_yet: 'No money has been discussed yet',

  result_stop: 'Do not sign this yet',
  result_stop_sub: 'One of your answers is the kind that costs owners the whole job rather than part of it. That does not make this contractor dishonest, and it does not mean walking away. It means the thing gets fixed before any money moves, and everything below tells you how to say so.',
  result_rework: 'Not ready to sign, but nothing here is fatal',
  result_rework_sub: 'There are enough gaps that you would be signing on trust rather than on a document. Every one of them is answerable, and a contractor who answers them well is the one you want. Work down the red list first.',
  result_fixable: 'Close. A few things to put right first',
  result_fixable_sub: 'Nothing here suggests you are being taken advantage of. There are gaps in the paperwork, and paperwork gaps are what turn an ordinary disagreement into an expensive one. Ask for these before you sign.',
  result_confirm: 'Nothing is wrong. Some things are unconfirmed',
  result_confirm_sub: 'You have no red flags, which is genuinely uncommon at this stage. What is left is a short list of things nobody has said either way, and each of them is one question.',
  result_clear: 'This quote stands up',
  result_clear_sub: 'Everything a Spanish quote should carry is on it. That is a good sign about how the job will run as well as about the paperwork. The questions below are still worth putting, because they are the ones a scorecard cannot answer for you.',

  restart: 'Change my answers',
  score_title: 'Your score',
  score_red: 'Red flags',
  score_amber: 'Unconfirmed',
  score_clear: 'Checks out',
  score_total: 'Questions asked',

  g_critical: 'Fix these before any money moves',
  g_critical_note: 'Each of these on its own is enough to stop a signature. Not because the contractor is dishonest, but because if it does go wrong here, it goes wrong for the whole amount.',
  g_red: 'Resolve these before you sign',
  g_red_note: 'One line each, in words you can send as they are. The Spanish version is there to be copied into a message.',
  g_amber: 'Confirm these',
  g_amber_note: 'Not warnings. Things nobody has said either way, which is a different problem and an easier one.',
  g_always: 'Ask these whatever the answers were',
  g_always_note: 'The questions no scorecard can settle for you.',
  g_clear: 'What already checks out',
  g_clear_note: 'Worth knowing what you have, not only what is missing.',

  say_in_spanish: 'Say it in Spanish:',
  ask_in_spanish: 'Ask in Spanish:',
  count_line_one: '{red} red flag, {amber} unconfirmed, out of {total} questions.',
  count_line_many: '{red} red flags, {amber} unconfirmed, out of {total} questions.',
  score_para: 'A red flag is not proof of anything. It is something missing from the quote, and every one of them has a question that resolves it. What matters is how the contractor answers, not that you asked.',
  obra_title: 'If this turns out to be obra mayor rather than obra menor',
  obra_p1: 'Spanish building work splits into two kinds, and which one you are doing changes who has to be involved before anyone lifts a tool. Obra menor is work that leaves the structure, the footprint and the use of the property alone: painting, retiling, replacing a window in the same opening at the same size, built in furniture, repairing a facade or a fence. Obra mayor is work that changes the structure, the volume, the layout or the use: new rooms or floors, extending the living space, adding a garage, enclosing a porch or veranda, digging out a basement, reinforcing beams or a roof. A swimming pool counts as an extension.',
  obra_p2: 'Your ayuntamiento decides which category your job falls into, and municipalities draw the line in different places. Ask them, or have a technical architect ask, before you accept anybody else\'s view of it. A contractor who tells you no licence is needed is giving you an answer that was never his to give.',
  obra_lead: 'What changes if it is obra mayor:',
  obra_steps: [
    'A technical project is required, drawn by an architect or a technical architect (arquitecto tecnico), and proof of their registration goes into the licence file. Your builder cannot draw it.',
    'The licence has to be granted before work starts. Processing time varies by region and runs longer where the project is complex or a neighbour objects.',
    'The ayuntamiento charges fees and a construction tax on the licence. Both are set municipally, so ask the town hall for the figures for your address rather than working from a number you read somewhere.',
    'If the property is in a community of owners, or the work touches anything communal, you need the community authorisation as well. It is issued as a certificate and signed before a notary, and it may mean waiting for a meeting.',
    'At the end the architect issues the certificate of completion, the certificado final de obra.',
    'If the work changed the built area, it then has to be declared before a notary and entered in the land registry, so that the deeds describe the building that is actually there.',
  ],
  deeds_title: 'Why the deeds part matters later',
  deeds_p: 'Unlicensed work is usually invisible until you sell. At that point the notary and the buyer both want the extension to appear on the deeds, and a buyer\'s lawyer who finds built space that is not registered will either hold the price or hold the sale. There is a retrospective route through an antiquity certificate, but whether you qualify depends on how long ago the work was finished, the qualifying period differs by region and by when the work was done, and an architect has to attend to certify the age. It is slower and less certain than applying first, which is the entire argument for doing it in the right order.',
  shell_note: 'Practical guidance for property owners in Spain. Not legal advice.',
  disclaimer: 'This is practical guidance, not legal advice. It checks the quote in front of you, which is not the same as checking the contractor. Whether your particular job needs a licence, and which kind, is decided by your ayuntamiento, and for anything structural that answer should come from a technical architect before you sign.',

  q: {
    written: {
      clear: 'The quote is a proper written presupuesto',
      ask: 'Please send the presupuesto in writing, on your company paper, with your full trading name, address and CIF on it.',
      prevents: 'A quote you cannot produce later is a quote that did not exist. The company details are also how you check the business is real, and how a lawyer or your insurer identifies who you dealt with.',
    },
    itemised: {
      clear: 'The price is broken down line by line',
      ask: 'Can you break it down by trade, with materials and labour separate, and quantities where it makes sense?',
      prevents: 'One total tells you nothing and cannot be compared with anything. It also makes a mid-job extra impossible to argue about, because nobody wrote down what the first number included.',
    },
    iva: {
      clear: 'The quote says clearly whether IVA is included',
      ask: 'Does this price include IVA? Please write the IVA line on the quote either way.',
      prevents: 'A quote that is silent on IVA is the most common way a Spanish renovation ends up costing more than the number the owner agreed to. It is one line, and asking for it costs nothing.',
    },
    fixed: {
      clear: 'The quote says whether the price is closed or can move',
      ask: 'Is this a closed price or an estimate? If it can move, write down what would move it and how you tell me before it does.',
      prevents: 'An estimate is not dishonest. Silence about which one you are holding is what leaves you arguing about a final bill you had no way to predict. Prices that move should move for reasons written down in advance.',
    },
    registered: {
      clear: 'You have seen proof the business is registered and up to date',
      ask: 'Can you send me your CIF or autonomo registration, and a certificate that you are up to date with Hacienda and the Seguridad Social?',
      prevents: 'An unregistered trade cannot give you a valid invoice, which means no guarantee you can enforce and no record of what you paid. The up to date certificate is a normal request here and takes a registered business minutes to produce.',
    },
    insurance: {
      clear: 'You have seen a current third party liability policy',
      ask: 'Can you send me your responsabilidad civil policy, with the dates of cover?',
      prevents: 'Something falls onto a neighbour car, or water gets into the flat below. Without the contractor policy that becomes your problem and your home insurance claim, and the dates matter because a policy that lapses mid-job covers nothing.',
    },
    licence: {
      clear: 'It is written down who applies for the licence',
      ask: 'Does this work need a licence from the ayuntamiento? Who applies, you or me, and can we put that in the contract with the licence reference before work starts?',
      prevents: 'Both parties assuming the other one applied is how work starts without a licence. Whoever applies, you are the owner, so the consequence of there not being one lands on your property and on your sale, not on the builder.',
      ask_none_needed: 'I would rather confirm that with the ayuntamiento than take it as read. Can you put in writing that you consider no licence is required, and why?',
    },
    deposit: {
      clear: 'The deposit is proportionate and receipted',
      ask: 'What exactly does this deposit pay for? I would like an invoice for it, and a payment schedule tied to stages I can see finished.',
      prevents: 'Money paid before anything exists is money with nothing behind it. Staged payments against work you can walk in and look at keep your position and the contractor incentive pointing the same way.',
      ask_most: 'I am not able to pay most of it before work starts. Can we agree a payment schedule tied to stages, with an invoice for each one?',
    },
    cash: {
      clear: 'Everything is invoiced and paid by transfer',
      ask: 'I need an invoice for every payment, and I will pay everything by bank transfer.',
      prevents: 'Without an invoice there is no proof you paid, no guarantee to enforce and nothing to put against the cost of the property when you eventually sell. Spain also caps cash payments where a business is involved, and the penalty for going over it falls on both sides, so a contractor splitting payments to stay under a limit is asking you to carry his risk. Your gestor can tell you what the current limit is.',
    },
    dates: {
      clear: 'Start and completion dates are in writing',
      ask: 'What start date and completion date can we put in writing, and what happens if it runs over?',
      prevents: 'Renovations here do run over, and a good contractor will tell you that. A date in writing is not there to punish anyone. It is there so that a delay becomes a conversation rather than a silence you cannot do anything about from another country.',
    },
    price: {
      clear: 'The price sits alongside other quotes you have',
      ask: 'Your price is noticeably below the others I have. Can you tell me what is included here that I might be comparing wrongly, and what is not included at all?',
      prevents: 'A price far below the others is usually explained by something that has been left out, by materials of a different grade, or by work nobody intends to declare. Sometimes it is genuinely a better price. The question tells you which, and a good contractor answers it happily.',
      ask_only: 'Get two more quotes for the same written specification before you sign this one.',
    },
    bank: {
      clear: 'The bank details were verified by voice, on a number you already had',
      ask: 'Before I transfer anything, I will call you on the number I already have to confirm the account. Please do not send bank details by email.',
      prevents: 'Criminals impersonate builders, agents and lawyers to foreign owners here, intercepting email and altering the account number, usually with a reason to hurry. A payment sent to the wrong account is very rarely recovered. Thirty seconds on a number you dialled yourself defeats the whole thing.',
      ask_changed: 'The account details have changed, so I will not transfer anything until I have confirmed the new account by voice on the number I already had. Please expect that call.',
    },
  },

  always: {
    subcontract: {
      text: 'Do you do all of this yourself, or is any of it subcontracted, and to whom?',
      why: 'The company you checked may not be the company on site, and a subcontractor is not covered by the main contractor insurance unless someone has arranged it.',
    },
    materials: {
      text: 'Which brand and model of material is in the price?',
      why: 'A named material is one you can check against what arrives. First quality is not a specification and cannot be checked against anything.',
    },
    references: {
      text: 'Can I see a job you have finished nearby, and speak to that customer?',
      why: 'This is the check that actually works here. Word of mouth in your own area beats any document, and a contractor with finished work nearby is usually pleased to show it.',
    },
    guarantee: {
      text: 'What guarantee is there on the work, and for how long?',
      why: 'A guarantee only exists on top of an invoice. Ask what it covers as well as how long it runs.',
    },
    changes: {
      text: 'Put every change in writing, including the ones agreed on site.',
      why: 'Verbal variations agreed at the property are the most common reason a final bill does not match the quote, and neither side remembers it the same way.',
    },
    second_quote: {
      text: 'If the answer to any of this feels wrong, get a second quote.',
      why: 'Nothing on this page is a substitute for that instinct. Scams and bad jobs both rely on the owner feeling that asking again would be rude, and on the pressure of having flown out for the week.',
    },
  },
};

export default { en, no, sv, de, fr, nl };
