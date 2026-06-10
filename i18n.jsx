import React, { createContext, useContext, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import en from './en.json';
import no from './no.json';
import sv from './sv.json';
import de from './de.json';
import fr from './fr.json';
import nl from './nl.json';

const DICTS = { en, no, sv, de, fr, nl };
export const SUPPORTED_LOCALES = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
export const LOCALE_LABELS = { en: 'English', no: 'Norsk', sv: 'Svenska', de: 'Deutsch', fr: 'Français', nl: 'Nederlands' };
export const DEFAULT_LOCALE = 'en';

const LocaleContext = createContext({ locale: DEFAULT_LOCALE });

export function LocaleProvider({ children }) {
  // Derive locale from the first path segment so it resolves reliably from the
  // layout level regardless of route nesting (e.g. /no/tax-calculator -> "no").
  const { pathname } = useLocation();
  const first = pathname.split('/').filter(Boolean)[0];
  const locale = SUPPORTED_LOCALES.includes(first) ? first : DEFAULT_LOCALE;
  const value = useMemo(() => ({ locale, dict: DICTS[locale] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

// Lookup a dot-path key from the active dictionary. Falls back to EN, then to the key.
export function useT() {
  const { dict } = useContext(LocaleContext);
  return function t(path) {
    const get = (obj, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    const v = get(dict, path);
    if (v != null) return v;
    const fallback = get(en, path);
    return fallback != null ? fallback : path;
  };
}

// Build a localised URL. Pass a path like "/tax-calculator" — returns "/no/tax-calculator" if NO.
export function useLocalisedPath() {
  const { locale } = useContext(LocaleContext);
  return function lp(path) {
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (locale === DEFAULT_LOCALE) return clean === '/' ? '/' : clean;
    return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
  };
}

// Locale-aware Link wrapper. Use <LLink to="/tax-calculator">...</LLink> anywhere.
export function LLink({ to, children, ...rest }) {
  const lp = useLocalisedPath();
  return <Link to={lp(to)} {...rest}>{children}</Link>;
}

// Compute the equivalent path in a different locale, for the language switcher.
export function useSwitchLocalePath() {
  const location = useLocation();
  return function switchTo(target) {
    const segments = location.pathname.split('/').filter(Boolean);
    const first = segments[0];
    const rest = SUPPORTED_LOCALES.includes(first) ? segments.slice(1) : segments;
    const prefix = target === DEFAULT_LOCALE ? '' : `/${target}`;
    const tail = rest.length ? `/${rest.join('/')}` : '';
    return `${prefix}${tail}` || '/';
  };
}
