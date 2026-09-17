import AudienceHub from '../AudienceHub.jsx';
import copy from './copy.js';

// The estate agents' section. The page itself is AudienceHub; this file only decides which
// tools appear under which stage. `key` cards are professional tools, `share` cards are
// owner tools the agent sends to a client, by folder name.
const SECTIONS = [
  { key: 'win', items: [
    { key: 'seller_pack', path: '/seller-pack' },
    { share: 'sale-tax' },
  ] },
  { key: 'close', items: [
    { key: 'deal_checklist', path: '/deal-checklist' },
    { key: 'purchase_costs', path: '/purchase-costs' },
    { key: 'aml_file', path: '/aml-file' },
    { key: 'poa_planner', path: '/poa-planner' },
    { share: 'day-counter' },
    { share: 'utility-setup' },
  ] },
  { key: 'after', items: [
    { share: 'tax-calculator' },
    { share: 'rental-tax' },
    { share: 'rental-vat' },
    { share: 'closing-up' },
    { share: 'maintenance-schedule' },
  ] },
];

export default function ForAgents() {
  return <AudienceHub audience="agents" copy={copy} sections={SECTIONS} />;
}
