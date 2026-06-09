import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import { LocaleProvider } from '../i18n.jsx'

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
          {/* Locale-prefixed (e.g. /no, /sv) */}
          <Route path="/:lang" element={<Home />} />
          {toolRoutes.map(({ slug, Component }) => (
            <Route key={`l-${slug}`} path={`/:lang/${slug}`} element={<Component />} />
          ))}
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  )
}
