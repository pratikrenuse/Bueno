import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './lib/i18n.jsx';

// Auto-discover tool folders: each tool exports default Component + meta from index.jsx.
// Tools live at /tools/<slug>/index.jsx, mirroring the existing repo convention.
const toolModules = import.meta.glob('../tools/*/index.jsx', { eager: true });
const tools = Object.entries(toolModules).map(([path, mod]) => {
  const slug = path.split('/').slice(-2, -1)[0];
  return {
    slug,
    Component: mod.default,
    meta: mod.meta || {},
  };
});

// Build child routes once; reused for both default and /:lang shells.
const toolRoutes = tools.map(({ slug, Component }) => ({
  path: slug,
  element: <Component />,
}));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      ...toolRoutes,
      // Localised tree under /:lang
      {
        path: ':lang',
        children: [
          { index: true, element: <Home /> },
          ...toolRoutes,
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

// Re-export for tools that need locale-supported language list
export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
