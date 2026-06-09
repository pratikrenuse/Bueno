import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './Home.jsx';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './i18n.jsx';

// Auto-discover tool folders: each tool exports default Component + meta from index.jsx.
// Tools live at /<slug>/index.jsx at the repo root (existing repo convention).
const toolModules = import.meta.glob('./*/index.jsx', { eager: true });
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
