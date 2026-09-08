import { useT } from '../i18n.jsx';
import { EXPLAINER_PARTS, partKey, askKey, nameKey } from './professions.js';

// The profession explainer.
//
// This is the block that earns the page. Before a reader can weigh three abogados against
// each other they have to know what an abogado is for, whether they need one at all, and
// what a fair conversation about money sounds like. A directory that skips that is a list
// of strangers.
//
// It is open by default and it sits ABOVE the results, not in a disclosure underneath.
// Somebody who arrived from a search engine reads it before the names mean anything.
//
// It states no prices. `cost` describes how a profession charges, never how much, and the
// note underneath says so plainly, because a reader who sees no number should know that is
// a decision and not an omission.
export default function ProfessionNote({ slug, variant = 'full' }) {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  if (!slug) return null;

  const asks = t(`calc_directory.${askKey(slug)}`);
  const questions = Array.isArray(asks) ? asks : [];

  return (
    <section className={`pros-note pros-note-${variant}`} aria-labelledby={`pros-note-${slug}`}>
      <p className="pros-note-eyebrow">{tt('pro_ex_eyebrow')}</p>
      <h2 className="pros-note-title" id={`pros-note-${slug}`}>{tt(nameKey(slug))}</h2>

      <div className="pros-note-grid">
        {EXPLAINER_PARTS.map(part => (
          <div className="pros-note-part" key={part.key}>
            <h3 className="pros-note-label">{tt(part.label)}</h3>
            <p className="pros-note-body">{tt(partKey(slug, part.key))}</p>
            {part.key === 'cost' && <p className="pros-note-caveat">{tt('pro_ex_cost_note')}</p>}
          </div>
        ))}

        {questions.length > 0 && (
          <div className="pros-note-part pros-note-ask">
            <h3 className="pros-note-label">{tt('pro_ex_ask')}</h3>
            <ol className="pros-note-questions">
              {questions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
