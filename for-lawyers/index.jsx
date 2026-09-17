import AudienceHub from '../AudienceHub.jsx';
import copy from './copy.js';

// The lawyers' section. Same page as the agents' hub, different tools. The branded sale
// checklist is shared with agents; the rest are owner tools a lawyer sends to a client.
const SECTIONS = [
  { key: 'deal', items: [
    { key: 'deal_checklist', path: '/deal-checklist' },
    { key: 'purchase_costs', path: '/purchase-costs' },
    { key: 'poa_planner', path: '/poa-planner' },
    { share: 'sale-tax' },
  ] },
  { key: 'estate', items: [
    { key: 'inheritance_roadmap', path: '/inheritance-roadmap' },
  ] },
  { key: 'tax', items: [
    { share: 'tax-calculator' },
    { share: 'rental-tax' },
    { share: 'rental-vat' },
    { share: 'late-surcharge' },
    { share: 'day-counter' },
  ] },
  { key: 'rights', items: [
    { share: 'your-rights' },
    { share: 'storm-claim' },
    { share: 'contractor-check' },
    { share: 'mortgage-claim' },
  ] },
];

const UPCOMING = ['nota', 'lau'];

export default function ForLawyers() {
  return <AudienceHub audience="lawyers" copy={copy} sections={SECTIONS} upcoming={UPCOMING} />;
}
