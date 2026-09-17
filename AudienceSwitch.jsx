import { useLocale, LLink } from './i18n.jsx';
import { AUDIENCES, audienceLabels } from './audiences.js';

// The "who is this for" switch. Three links, one of them marked as the current section.
//
// It is ordinary links, not a toggle, because each audience is a real page with its own
// URL: a crawler can follow it, a person can bookmark it, and the back button works.
// `tone` is 'dark' on the navy home hero and 'light' on white pages.
export default function AudienceSwitch({ current = 'owners', tone = 'light' }) {
  const { locale } = useLocale();
  const L = audienceLabels(locale);

  return (
    <nav className={`aud-switch aud-switch-${tone}`} aria-label={L.switch_label}>
      <span className="aud-switch-lead">{L.lead}</span>
      <span className="aud-switch-items">
        {AUDIENCES.map(a => (
          <LLink
            key={a.key}
            to={a.path}
            className={`aud-switch-link${a.key === current ? ' current' : ''}`}
            aria-current={a.key === current ? 'page' : undefined}
          >
            {L[a.key]}
          </LLink>
        ))}
      </span>
    </nav>
  );
}
