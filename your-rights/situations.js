// The situations an owner abroad actually turns up with, and what each one hangs on.
//
// This file is the spine, not the words. Every period comes from the rules base and every
// reader-facing sentence comes from copy.js, in all six site languages. What is left here
// is the structure a translator must never be able to change by accident:
//
//   key      the situation, and the key its copy lives under in copy.js
//   clock    the rule ids the result shows, in the order it shows them
//   cover    which chapter of a home policy would ordinarily be the place to look
//
// `cover` is a prompt to read a document, never a statement that the owner is covered.

export const SITUATIONS = [
  {
    key: 'neighbour_damage',
    clock: ['limit.extracontractual', 'limit.insurance.own_claim'],
    cover: 'reclamacion',
  },
  {
    key: 'community_decision',
    clock: ['limit.community.challenge', 'limit.community.challenge.absent', 'limit.community.challenge.standing'],
    cover: 'defensa',
  },
  {
    key: 'community_debt',
    clock: ['limit.contract.general', 'limit.community.buyer_liability'],
    cover: 'defensa',
  },
  {
    key: 'tenant_arrears',
    clock: ['limit.rent.arrears', 'limit.interruption', 'limit.interruption.guarantor'],
    cover: 'rental',
  },
  {
    key: 'deposit',
    clock: ['limit.deposit.return'],
    cover: 'defensa',
  },
  {
    key: 'builder',
    clock: ['limit.building.guarantee', 'limit.building.action', 'limit.building.scope', 'limit.contract.general'],
    cover: 'defensa',
  },
  {
    key: 'hidden_defect',
    clock: ['limit.hidden_defects', 'limit.contract.annulment', 'limit.contract.general'],
    cover: 'defensa',
  },
  {
    key: 'insurer_refused',
    clock: ['limit.insurance.own_claim'],
    cover: 'defensa',
  },
];

export const SITUATION_BY_KEY = Object.fromEntries(SITUATIONS.map(s => [s.key, s]));

// The phrase the owner types into their own policy document. It is not translated, because
// the document is in Spanish. Everything said about the chapter lives in copy.js.
export const COVER_CHAPTER = {
  defensa: { find: 'Defensa juridica' },
  reclamacion: { find: 'Reclamacion de danos' },
  rental: { find: 'Arrendamiento' },
};
