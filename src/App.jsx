import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'

// Auto-discovers every tool folder that has an index.jsx at the repo root.
// To add a new tool: create a new folder with index.jsx + meta.js. Nothing else needed.
const toolModules = import.meta.glob('../*/index.jsx', { eager: true })

const toolRoutes = Object.entries(toolModules).map(([path, module]) => ({
  routePath: `/${path.split('/')[1]}`,
  Component: module.default,
}))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {toolRoutes.map(({ routePath, Component }) => (
          <Route key={routePath} path={routePath} element={<Component />} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}
