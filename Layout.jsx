import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import { LocaleProvider } from '../lib/i18n.jsx';

export default function Layout() {
  return (
    <LocaleProvider>
      <div className="s247-shell">
        <Nav />
        <main className="s247-main">
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration />
      </div>
    </LocaleProvider>
  );
}
