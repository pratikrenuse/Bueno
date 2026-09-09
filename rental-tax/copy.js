// Copy for the parts of this tool that were rebuilt onto the rules base.
//
// The rest of the funnel still reads en.json through useT. What is here is new, and it sits
// beside the code that reads the rules so a sentence and the figure it describes cannot
// drift apart. English only, with the same fallback the other tools use.

export default {
  en: {
    year_q: 'Which tax year is this?',
    year_hint: 'The year the rent belonged to, not the year you file it. It decides which filing window applies, and those windows moved recently.',

    days_hint_max: 'The property cannot be let for more days than the year holds. {max} days in {year}, so that is the most this box will take.',
    days_clamped: 'We have used {max} days, the number of days in {year}.',

    panel_period_year: 'Accrual year {year}. Modelo 210.',

    deadline_title: 'When this one is filed',
    deadline_window: 'Filed {from} to {to}',
    deadline_debit: 'Direct debit closes {date}, {n} days before filing does.',
    deadline_unknown: 'Rent for that year sat in the old quarterly regime, and we do not hold a confirmed filing window for it. We would rather say so than date it by guesswork.',
    deadline_quarterly_note: 'Guidance that describes quarterly filing on 20 April, July, October and January is out of date. The grouping period moved to annual for rent accrued from 2024.',

    method_title: 'Where these figures come from',
    method_body: 'The rate and the deductibility test below are read from primary sources, and you can click through to them. The list of deductible costs and the depreciation percentages are our reading of common practice rather than a rule we have quoted, so treat the deduction total as an estimate and let your gestor confirm it.',

    residency_hint: 'Residents of the EU and the EEA may deduct property costs and pay {eu} percent. Everyone else is taxed on the gross rent at {other} percent, with nothing deductible. Both figures come from the source below.',

    prorated_hint: 'These are prorated. We take the full annual amount, divide it by the {days} days in {year}, and multiply by the days you let the property. Enter the full annual figure. Leave anything that does not apply blank.',

    noneu_note: 'Costs are not deductible for a resident outside the EU and the EEA, so there is nothing more to enter. The tax is {other} percent of the gross rent.',

    about_body: 'Spain does not allow a resident outside the EU and the EEA to deduct property costs from rental income. The rate is {other} percent and the base is the gross rent. If your country has a double taxation treaty with Spain you may be able to claim relief at home, which is a question for an adviser there rather than one this tool can answer.',
  },
};
