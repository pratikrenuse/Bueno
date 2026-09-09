import { Link } from 'react-router-dom';
import { directoryLinks } from './hubs.js';
import { BLOCK } from './copy.js';

// The block of internal links at the foot of both directory pages.
//
// WHY IT HAS TO BE ON THE PAGE, NOT ONLY IN THE PRERENDERED HTML
// seo/prerender.mjs writes a static block into every file, and createRoot().render()
// replaces it the instant the app boots. A crawler that runs JavaScript, which Google
// does, therefore sees the rendered page. Until this component existed the rendered page
// had no links out at all: the only way to reach another town was the <select>, and a
// <select> is not a link. Every town page was an orphan to the renderer even though the
// file it came from was full of links.
//
// So the links live in seo/hubs.js and are printed twice, here and in the static block,
// from that one definition. They cannot drift, because there is nothing to drift from.
//
// It is not a hidden SEO device. It is visible, it is at the bottom where a person looks
// when the answer they got was not quite the one they needed, and every link goes to a
// page that exists.
//
// Nothing here comes from Google. Town names and provinces come from localities.js, the
// category words from seo/copy.js. No business, no rating, no review.

export default function PageLinks({ hub, town, category, locale = 'en', className = '' }) {
  const links = directoryLinks({ hub, town, category, locale });
  if (!links.length) return null;

  return (
    <nav className={`pagelinks ${className}`.trim()} aria-label={BLOCK[locale].links}>
      <h2 className="pagelinks-title">{BLOCK[locale].links}</h2>
      <ul className="pagelinks-list">
        {links.map(l => (
          <li key={l.href + l.label}>
            <Link to={l.href}>{l.label}</Link>
            {l.note ? <span className="pagelinks-note">{l.note}</span> : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
