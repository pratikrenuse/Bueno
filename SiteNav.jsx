import { useLocale, useT } from './i18n.jsx';
import { Link } from 'react-router-dom';

// The site's menu. Four destinations, on every page, in the sticky header.
//
// Before this the header held a brand mark and a language switcher and nothing else, so
// the only way between the calculators and the two directories was to scroll to the
// footer or go back to the home page. On the home page the links are anchors to the three
// sections; everywhere else they are ordinary routes.
//
// `active` dims the link for the page you are already on, so the menu says where you are
// as well as where you can go.
export default function SiteNav({ active, home = false }) {
  const t = useT();
  const { locale } = useLocale();
  const lp = (p) => (locale === 'en' ? p : `/${locale}${p}`);

  const items = [
    { key: 'trades', label: t('nav.menu_trades'), to: lp('/spain-directory'), anchor: '#directory' },
    { key: 'tools',  label: t('nav.menu_tools'),  to: lp('/'),                anchor: '#tools' },
    { key: 'pros',   label: t('nav.menu_pros'),   to: lp('/spain-professionals'), anchor: '#professionals' },
    { key: 'rights', label: t('nav.menu_rights'), to: lp('/your-rights'),          anchor: '#rights' },
  ];

  return (
    <nav className="site-nav" aria-label="Main">
      {items.map(i => (
        home
          ? <a key={i.key} href={i.anchor} className="site-nav-link">{i.label}</a>
          : <Link key={i.key} to={i.to} className={`site-nav-link${active === i.key ? ' current' : ''}`}
              aria-current={active === i.key ? 'page' : undefined}>{i.label}</Link>
      ))}
    </nav>
  );
}
