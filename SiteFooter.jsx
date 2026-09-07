import { useT, LLink } from './i18n.jsx';

// The site's one real footer, used by every tool page.
//
// Before this, each tool ended with a single line of disclaimer text and nothing else,
// and it was hidden on intro screens, so most pages simply stopped. A visitor who reached
// the bottom of the tax calculator had no way to discover the other four tools. This
// gives every page the same ending: who we are, everything else we make, and the legal
// line the tool needs.
//
// `note` is the tool's own disclaimer, which used to live in the thin footer. It is kept
// rather than dropped, because on the calculators it is the "guidance only, not advice"
// line and it has to stay on the page.
//
// The old root-level Footer.jsx is dead: nothing imported it, its s247-footer classes
// were never in App.css and its footer.* translation keys never existed. Do not revive
// it, use this.

export default function SiteFooter({ note }) {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="s247f">
      <div className="s247f-top">
        <div className="s247f-brand">
          <span className="site-brand-name white">Spain 24/7</span>
          <span className="site-brand-powered white">{t('home.brand_sub')}</span>
        </div>

        <nav className="s247f-links" aria-label="Footer">
          <LLink to="/spain-directory">{t('nav.directory')}</LLink>
          <LLink to="/spain-professionals">{t('nav.professionals')}</LLink>
          <LLink to="/tax-calculator">{t('nav.tax')}</LLink>
          <LLink to="/cost-audit">{t('nav.cost')}</LLink>
          <LLink to="/rental-tax">{t('nav.rental')}</LLink>
          <LLink to="/mortgage-claim">{t('nav.claim')}</LLink>
        </nav>
      </div>

      <div className="s247f-bottom">
        <span>{note || t('home.footer_copy')}</span>
        <span className="s247f-copy">&copy; {year} Spain 24/7</span>
      </div>
    </footer>
  );
}
