// Copy for the parts of this tool that were rebuilt onto the rules base.
//
// The older screens still read en.json through useT, which is where the rest of the funnel
// lives. Everything below is new, and it lives here for the same reason the newer tools
// keep their copy beside them: a sentence that describes a rule should sit next to the code
// that reads the rule, so the two cannot drift apart.
//
// English only for now, with the same fallback the other tools use. Two of these sentences
// carry a legal position and a translation that softens one of them would be worse than an
// English sentence a reader can look up.

export default {
  en: {
    year_q: 'Which tax year are you working out?',
    year_hint: 'The year the income belonged to, not the year you file it. A Spanish return is always filed in the year after the one it covers.',

    revision_q_since: 'Was your cadastral value revised with effect from 1 January 2012 or later?',
    revision_hint_since: 'For this tax year the lower rate applies where the value was revised from 2012 onwards. Find the revision on your IBI bill, or ask the Catastro.',
    revision_yes: 'Yes, it was',
    revision_no: 'No, it was not',
    revision_unsure: 'I am not sure',

    rate_assumed: 'You told us you are not sure. We have used the higher of the two rates in the rule, {high} percent. Where the value was revised the rate is {low} percent and the tax is lower. Both figures come from the source below.',

    panel_rate_basis: 'Imputed rate on the cadastral value',
    panel_period_year: 'Accrual year {year}. Modelo 210.',

    deadline_title: 'When this one is filed',
    deadline_imputed_label: 'Imputed income return',
    deadline_rental_label: 'Rental income return',
    deadline_window: '{from} to {to}',
    deadline_debit: 'Direct debit closes {date}, {n} days before filing does. That gap is the most common way an owner believes they have paid and has not.',
    deadline_rental_unknown: 'Rental income for that year sat in the old quarterly regime, and we do not hold a confirmed filing window for it. We would rather say so than date it by guesswork.',

    gross_title: 'This figure is on the gross rent',
    gross_eu: 'Costs are deductible for residents of the EU and the EEA, and this tool never asked you what yours were. So the number above is the tax on the full rent, before any deduction. Your real figure will be lower. The rental tax calculator on this site collects the costs and does the deduction.',
    gross_non_eu: 'Costs are not deductible for a resident outside the EU and the EEA, so the gross rent is the base and this figure is the whole of it.',
    gross_link: 'Work out the rent with costs deducted',

    not_covered_title: 'We do not have a confirmed figure for {year}',
    not_covered_body: 'The lower imputed rate is stated for 2023, 2024 and 2025. Whether it carries into a later year is not settled yet, and we will not put a rate on a screen that we cannot source. The window for that year does not open until the following April, so there is time. Come back and this will be here when it is confirmed.',
    not_covered_mixed: 'The rent above is priced. The part that falls on your own use of the property is not, for the reason below.',

    mixed_title: 'Why this is a range',
    mixed_body: 'The imputed charge falls only on the days the property was not let, and this tool does not ask you for that split. The low end taxes the rent alone. The high end adds a full year of imputed income on top. Your figure sits between them, closer to the low end the more you let it.',

    surcharge_title: 'What filing late costs',
    surcharge_body: 'It is a surcharge, not a fine, and no penalty may be added on top of it. It starts at {base} percent, adds {per_month} percent for each complete month of delay to a maximum of {max} percent, and from month {from_month} becomes a flat {flat} percent with late-payment interest. Which of those applies to you depends on the day you file, which this tool does not ask for.',
    surcharge_link: 'Work out the surcharge on a specific return',

    filing_hint: 'Modelo 210 is the Spanish non-resident property tax return. It is filed once a year, and the window depends on the tax year and on whether the property was let. Your window is on the results screen.',

    liability_disclaimer: 'An estimate, and a rough one. It assumes the same figure in every earlier year, which is rarely exactly true. How far back the tax office may go is set by the assessment window, and we do not hold a confirmed rule for that period, so we have not built one into the count. Your gestor or the tax office will give you the figure that binds you.',
  },
};
