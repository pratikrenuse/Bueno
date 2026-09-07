import DirectoryView from '../DirectoryView.jsx';
import { PROFESSIONALS, PROFESSIONAL_BY_SLUG } from '../spain-directory/categories.js';

// Estate agents and property lawyers. Kept as its own page rather than two more buttons
// on the trades rail, because the job is a different one: a burst pipe is an emergency and
// you want a phone number, buying a house is a decision and you want to compare. Mixing
// them would make both worse.
//
// `extraNote` adds a line to the disclosure that the trades page does not need. A bad
// plumber costs money; a bad lawyer can cost you the property, so the page says plainly
// that a star rating is not a substitute for checking someone is registered with the
// local Colegio de Abogados.
export default function SpainProfessionals() {
  return (
    <DirectoryView
      categories={PROFESSIONALS}
      bySlug={PROFESSIONAL_BY_SLUG}
      defaultCategory="real-estate"
      path="/spain-professionals"
      keys={{ eyebrow: 'prof_eyebrow', headline: 'prof_headline', lede: 'prof_lede', metaTitle: 'prof_meta_title' }}
      extraNote="prof_note"
    />
  );
}
