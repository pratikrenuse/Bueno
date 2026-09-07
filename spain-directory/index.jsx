import DirectoryView from '../DirectoryView.jsx';
import { CATEGORIES, CATEGORY_BY_SLUG } from './categories.js';

// The trades directory. All of the behaviour lives in DirectoryView so this page and
// /spain-professionals cannot drift apart: a fix to ranking, caching, attribution or
// layout lands on both at once.
export default function SpainDirectory() {
  return (
    <DirectoryView
      categories={CATEGORIES}
      bySlug={CATEGORY_BY_SLUG}
      defaultCategory="plumber"
      path="/spain-directory"
      navActive="trades"
      keys={{ eyebrow: 'eyebrow', headline: 'headline', lede: 'lede', metaTitle: 'meta_title' }}
    />
  );
}
