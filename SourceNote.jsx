import { rule } from './rules/index.js';
import { useLocale } from './i18n.jsx';

const DATE_LOCALE = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };
const WORDS = {
  en: { source: 'Source', checked: 'Checked', caveat: 'One caveat.' },
  no: { source: 'Kilde', checked: 'Kontrollert', caveat: 'Ett forbehold.' },
  sv: { source: 'Källa', checked: 'Kontrollerad', caveat: 'En reservation.' },
  de: { source: 'Quelle', checked: 'Geprüft am', caveat: 'Ein Vorbehalt.' },
  fr: { source: 'Source', checked: 'Vérifié le', caveat: 'Une réserve.' },
  nl: { source: 'Bron', checked: 'Gecontroleerd op', caveat: 'Eén kanttekening.' },
};

// The mandatory source line. Every figure a tool displays shows where it came from and
// when it was checked, next to the number, not in a footnote.
//
// This is not decoration. It is the difference between a calculator a reader can trust
// and one they have to take on faith, and it is item 5 of the correctness protocol.
//
// Pass one rule id, or several. A rule with status "partial" also renders its caveat,
// because a partial rule is one where something could not be confirmed and the reader
// is entitled to know which part.

function fmtDate(iso, locale = 'en') {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(DATE_LOCALE[locale] || 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SourceNote({ ids, label }) {
  const { locale } = useLocale();
  const w = WORDS[locale] || WORDS.en;
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
  if (!list.length) return null;

  const rules = list.map(rule);
  const caveats = rules.filter(r => r.status === 'partial' && r.notes);

  return (
    <div className="tk-source">
      <span className="tk-source-label">{label || w.source}</span>
      <ul className="tk-source-list">
        {rules.map(r => (
          <li key={r.id}>
            <a href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.ref}</a>
            <span className="tk-source-meta">{r.source.name}. {w.checked} {fmtDate(r.source.read_on, locale)}.</span>
          </li>
        ))}
      </ul>
      {caveats.length > 0 && (
        <p className="tk-source-caveat">
          <strong>{w.caveat}</strong> {caveats.map(c => c.notes).join(' ')}
        </p>
      )}
    </div>
  );
}

// A short, honest line for the bottom of every result screen.
export function ToolDisclaimer({ children }) {
  return (
    <p className="tk-disclaimer">
      {children || 'This is an estimate based on the published rules on the dates shown. It is not tax or legal advice, and the figure that binds you is the one your gestor or the tax office produces.'}
    </p>
  );
}
