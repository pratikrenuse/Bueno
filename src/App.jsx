import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Areas from '../seo/Areas.jsx'
import { LocaleProvider, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../i18n.jsx'
import StaticPage from '../seo/StaticPage.jsx'

// The locale prefixes, spelled out. A bare /:lang param also matched /answers, /about and any
// mistyped URL, and drew the home page at all of them.
const LANGS = SUPPORTED_LOCALES.filter(l => l !== DEFAULT_LOCALE)

// Auto-discovers every tool folder that has an index.jsx at the repo root.
// To add a new tool: create a new folder with index.jsx + meta.js. Nothing else needed.
const toolModules = import.meta.glob('../*/index.jsx', { eager: true })

const toolRoutes = Object.entries(toolModules).map(([path, module]) => ({
  slug: path.split('/')[1],
  Component: module.default,
}))

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <Routes>
          {/* Default (English) */}
          <Route path="/" element={<Home />} />
          {toolRoutes.map(({ slug, Component }) => (
            <Route key={slug} path={`/${slug}`} element={<Component />} />
          ))}
          {/* Sub-paths under a tool, which is how the two directories address a town and a
              category: /spain-directory/javea/plumber. They used to be query strings, and a
              query string cannot be a static file, cannot be a canonical URL, and is not
              reliably indexed. A path can be all three. The trailing splat means a tool
              opts in simply by reading the extra segments; every other tool ignores them. */}
          {toolRoutes.map(({ slug, Component }) => (
            <Route key={`s-${slug}`} path={`/${slug}/*`} element={<Component />} />
          ))}
          {/* Area hubs. These exist so no town page is an orphan: the town picker is a
              <select>, which is not a link and passes nothing to a crawler. */}
          <Route path="/areas" element={<Areas />} />
          <Route path="/areas/:province" element={<Areas />} />
          <Route path="/coast/:coast" element={<Areas />} />
          {/* /coast on its own is published nowhere, but it is the obvious thing to try
              after seeing /coast/costa-blanca. It shows the index rather than a blank. */}
          <Route path="/coast" element={<Areas />} />

          {/* Locale-prefixed (e.g. /no, /sv) */}
          {LANGS.map(lang => [
            <Route key={`h-${lang}`} path={`/${lang}`} element={<Home />} />,
            ...toolRoutes.map(({ slug, Component }) => (
              <Route key={`l-${lang}-${slug}`} path={`/${lang}/${slug}`} element={<Component />} />
            )),
            ...toolRoutes.map(({ slug, Component }) => (
              <Route key={`ls-${lang}-${slug}`} path={`/${lang}/${slug}/*`} element={<Component />} />
            )),
            <Route key={`a-${lang}`} path={`/${lang}/areas`} element={<Areas />} />,
            <Route key={`ap-${lang}`} path={`/${lang}/areas/:province`} element={<Areas />} />,
            <Route key={`cc-${lang}`} path={`/${lang}/coast/:coast`} element={<Areas />} />,
            <Route key={`c-${lang}`} path={`/${lang}/coast`} element={<Areas />} />,
          ])}

          {/* Everything else: a prerendered page with no component of its own (answers,
              about), or a real not-found that tells crawlers not to index it. */}
          <Route path="*" element={<StaticPage />} />
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  )
}
