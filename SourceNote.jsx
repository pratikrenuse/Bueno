import { rule } from './rules/index.js';

// The mandatory source line. Every figure a tool displays shows where it came from and
// when it was checked, next to the number, not in a footnote.
//
// This is not decoration. It is the difference between a calculator a reader can trust
// and one they have to take on faith, and it is item 5 of the correctness protocol.
//
// Pass one rule id, or several. A rule with status "partial" also renders its caveat,
// because a partial rule is one where something could not be confirmed and the reader
// is entitled to know which part.

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SourceNote({ ids, label }) {
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
  if (!list.length) return null;

  const rules = list.map(rule);
  const caveats = rules.filter(r => r.status === 'partial' && r.notes);

  return (
    <div className="tk-source">
      <span className="tk-source-label">{label || 'Source'}</span>
      <ul className="tk-source-list">
        {rules.map(r => (
          <li key={r.id}>
            <a href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.ref}</a>
            <span className="tk-source-meta">{r.source.name}. Checked {fmtDate(r.source.read_on)}.</span>
          </li>
        ))}
      </ul>
      {caveats.length > 0 && (
        <p className="tk-source-caveat">
          <strong>One caveat.</strong> {caveats.map(c => c.notes).join(' ')}
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
