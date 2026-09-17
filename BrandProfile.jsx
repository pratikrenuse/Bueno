import { useEffect, useState } from 'react';
import { useCopy } from './ToolShell.jsx';

// The professional's own branding, shared by every professional tool.
//
// An agent or lawyer enters their name, firm and contact details once, and every document
// the professional tools produce carries them. It lives in this browser only: there is no
// account, nothing is sent anywhere, and clearing the browser clears it. That is on
// purpose. A login is the first thing a busy agent abandons, and client documents do not
// need a server.
//
// localStorage can be missing or throw (private windows, blocked storage), so every read
// and write is wrapped and the tools work without it; the details then last for the visit.

const KEY = 's247_pro_profile_v1';
const EMPTY = { name: '', firm: '', role: '', phone: '', email: '', web: '', logo: '' };
const LOGO_MAX_BYTES = 200 * 1024;

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    const out = { ...EMPTY };
    for (const k of Object.keys(EMPTY)) if (typeof parsed[k] === 'string') out[k] = parsed[k];
    return out;
  } catch {
    return { ...EMPTY };
  }
}

function save(p) {
  try { window.localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch { return false; }
}

export function hasProfile(p) {
  return !!(p && (p.name || p.firm));
}

export function useBrandProfile() {
  const [profile, setProfile] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => { setProfile(load()); setReady(true); }, []);
  const update = (next) => { setProfile(next); save(next); };
  const clear = () => { setProfile({ ...EMPTY }); try { window.localStorage.removeItem(KEY); } catch { /* storage unavailable */ } };
  return { profile, update, clear, ready };
}

// Shrink an uploaded logo to a small PNG so it fits comfortably in local storage and
// prints sharply. Anything that cannot be read as an image is refused.
function readLogo(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('type')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('read'));
      img.onload = () => {
        const scale = Math.min(1, 480 / img.width, 160 / img.height);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const url = canvas.toDataURL('image/png');
        if (url.length > LOGO_MAX_BYTES * 1.37) { reject(new Error('size')); return; }
        resolve(url);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const COPY = {
  en: {
    title: 'Your branding',
    intro: 'Documents from these tools carry your name and contact details, not ours. They are kept in this browser only. Nothing is sent to us.',
    set: 'Set up', edit: 'Edit my details', done: 'Save details', clear: 'Remove my details',
    empty: 'Not set up yet. Your documents will print without a letterhead until you add your details.',
    name: 'Your name', firm: 'Agency or firm', role: 'Your role', phone: 'Phone', email: 'Email', web: 'Website',
    logo: 'Logo', logo_hint: 'PNG or JPG. It is resized to fit a letterhead.', logo_remove: 'Remove logo',
    logo_err_type: 'That file is not an image.', logo_err_size: 'That logo is too large. Try a smaller file.', logo_err_read: 'That image could not be read.',
    saved: 'Saved in this browser.',
  },
  no: {
    title: 'Din profil',
    intro: 'Dokumentene fra disse verktøyene bærer ditt navn og dine kontaktdetaljer, ikke våre. De lagres bare i denne nettleseren. Ingenting sendes til oss.',
    set: 'Satt opp', edit: 'Endre detaljene mine', done: 'Lagre detaljene', clear: 'Fjern detaljene mine',
    empty: 'Ikke satt opp ennå. Dokumentene skrives ut uten brevhode til du legger inn detaljene dine.',
    name: 'Navnet ditt', firm: 'Byrå eller firma', role: 'Rollen din', phone: 'Telefon', email: 'E-post', web: 'Nettside',
    logo: 'Logo', logo_hint: 'PNG eller JPG. Den skaleres til et brevhode.', logo_remove: 'Fjern logo',
    logo_err_type: 'Den filen er ikke et bilde.', logo_err_size: 'Logoen er for stor. Prøv en mindre fil.', logo_err_read: 'Bildet kunne ikke leses.',
    saved: 'Lagret i denne nettleseren.',
  },
  sv: {
    title: 'Din profil',
    intro: 'Dokumenten från de här verktygen bär ditt namn och dina kontaktuppgifter, inte våra. De sparas bara i den här webbläsaren. Ingenting skickas till oss.',
    set: 'Klart', edit: 'Ändra mina uppgifter', done: 'Spara uppgifterna', clear: 'Ta bort mina uppgifter',
    empty: 'Inte ifyllt ännu. Dokumenten skrivs ut utan brevhuvud tills du lägger till dina uppgifter.',
    name: 'Ditt namn', firm: 'Byrå eller företag', role: 'Din roll', phone: 'Telefon', email: 'E-post', web: 'Webbplats',
    logo: 'Logotyp', logo_hint: 'PNG eller JPG. Den skalas om för att passa ett brevhuvud.', logo_remove: 'Ta bort logotyp',
    logo_err_type: 'Den filen är inte en bild.', logo_err_size: 'Logotypen är för stor. Prova en mindre fil.', logo_err_read: 'Bilden kunde inte läsas.',
    saved: 'Sparat i den här webbläsaren.',
  },
  de: {
    title: 'Ihr Briefkopf',
    intro: 'Die Dokumente dieser Tools tragen Ihren Namen und Ihre Kontaktdaten, nicht unsere. Sie werden nur in diesem Browser gespeichert. Nichts wird an uns gesendet.',
    set: 'Eingerichtet', edit: 'Meine Angaben bearbeiten', done: 'Angaben speichern', clear: 'Meine Angaben entfernen',
    empty: 'Noch nicht eingerichtet. Ihre Dokumente werden ohne Briefkopf gedruckt, bis Sie Ihre Angaben ergänzen.',
    name: 'Ihr Name', firm: 'Agentur oder Kanzlei', role: 'Ihre Funktion', phone: 'Telefon', email: 'E-Mail', web: 'Website',
    logo: 'Logo', logo_hint: 'PNG oder JPG. Es wird auf Briefkopfgröße verkleinert.', logo_remove: 'Logo entfernen',
    logo_err_type: 'Diese Datei ist kein Bild.', logo_err_size: 'Das Logo ist zu groß. Bitte eine kleinere Datei wählen.', logo_err_read: 'Das Bild konnte nicht gelesen werden.',
    saved: 'In diesem Browser gespeichert.',
  },
  fr: {
    title: 'Votre en-tête',
    intro: 'Les documents de ces outils portent votre nom et vos coordonnées, pas les nôtres. Ils sont conservés dans ce navigateur uniquement. Rien ne nous est envoyé.',
    set: 'Configuré', edit: 'Modifier mes coordonnées', done: 'Enregistrer', clear: 'Supprimer mes coordonnées',
    empty: "Pas encore configuré. Vos documents s'imprimeront sans en-tête tant que vous n'aurez pas ajouté vos coordonnées.",
    name: 'Votre nom', firm: 'Agence ou cabinet', role: 'Votre fonction', phone: 'Téléphone', email: 'E-mail', web: 'Site web',
    logo: 'Logo', logo_hint: 'PNG ou JPG. Il est redimensionné pour un en-tête.', logo_remove: 'Retirer le logo',
    logo_err_type: "Ce fichier n'est pas une image.", logo_err_size: 'Ce logo est trop lourd. Essayez un fichier plus petit.', logo_err_read: "Cette image n'a pas pu être lue.",
    saved: 'Enregistré dans ce navigateur.',
  },
  nl: {
    title: 'Uw briefhoofd',
    intro: 'Documenten uit deze tools dragen uw naam en contactgegevens, niet de onze. Ze worden alleen in deze browser bewaard. Er wordt niets naar ons verzonden.',
    set: 'Ingesteld', edit: 'Mijn gegevens wijzigen', done: 'Gegevens opslaan', clear: 'Mijn gegevens verwijderen',
    empty: 'Nog niet ingesteld. Uw documenten worden zonder briefhoofd afgedrukt tot u uw gegevens toevoegt.',
    name: 'Uw naam', firm: 'Kantoor of bedrijf', role: 'Uw functie', phone: 'Telefoon', email: 'E-mail', web: 'Website',
    logo: 'Logo', logo_hint: 'PNG of JPG. Het wordt verkleind tot briefhoofdformaat.', logo_remove: 'Logo verwijderen',
    logo_err_type: 'Dat bestand is geen afbeelding.', logo_err_size: 'Dat logo is te groot. Probeer een kleiner bestand.', logo_err_read: 'Die afbeelding kon niet worden gelezen.',
    saved: 'Opgeslagen in deze browser.',
  },
};

const FIELDS = [
  ['name', 'text', 'name'], ['firm', 'text', 'organization'], ['role', 'text', 'organization-title'],
  ['phone', 'tel', 'tel'], ['email', 'email', 'email'], ['web', 'url', 'url'],
];

export function BrandProfileEditor({ startOpen = false }) {
  const c = useCopy(COPY);
  const { profile, update, clear, ready } = useBrandProfile();
  const [open, setOpen] = useState(startOpen);
  const [draft, setDraft] = useState(profile);
  const [logoErr, setLogoErr] = useState('');
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => { if (ready) setDraft(profile); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLogo = async (e) => {
    setLogoErr('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const url = await readLogo(file);
      setDraft(d => ({ ...d, logo: url }));
    } catch (err) {
      setLogoErr(c(`logo_err_${err.message}`));
    }
    e.target.value = '';
  };

  const submit = (e) => {
    e.preventDefault();
    const clean = {};
    for (const k of Object.keys(EMPTY)) clean[k] = String(draft[k] || '').slice(0, k === 'logo' ? 400000 : 120).trim();
    update(clean);
    setOpen(false);
    setSavedNote(true);
  };

  return (
    <section className="bp-card" aria-labelledby="bp-title">
      <div className="bp-head">
        <div>
          <h2 id="bp-title" className="bp-title">{c('title')}</h2>
          <p className="bp-intro">{c('intro')}</p>
        </div>
        {!open && (
          <button type="button" className="btn-back bp-edit" onClick={() => { setDraft(profile); setOpen(true); setSavedNote(false); }}>
            {c('edit')}
          </button>
        )}
      </div>

      {!open && (
        hasProfile(profile)
          ? <div className="bp-preview"><BrandHeader profile={profile} /></div>
          : <p className="bp-empty">{c('empty')}</p>
      )}
      {!open && savedNote && <p className="bp-saved" role="status">{c('saved')}</p>}

      {open && (
        <form className="bp-form" onSubmit={submit}>
          <div className="bp-grid">
            {FIELDS.map(([k, type, auto]) => (
              <label key={k} className="bp-field">
                <span className="tk-label">{c(k)}</span>
                <input className="value-input tk-input bp-input" type={type} autoComplete={auto}
                  value={draft[k]} maxLength={120}
                  onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} />
              </label>
            ))}
          </div>
          <div className="bp-logo-row">
            <label className="bp-field">
              <span className="tk-label">{c('logo')}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogo} className="bp-file" />
              <span className="tk-hint tk-hint-tight">{c('logo_hint')}</span>
            </label>
            {draft.logo && (
              <div className="bp-logo-preview">
                <img src={draft.logo} alt="" />
                <button type="button" className="bp-link" onClick={() => setDraft(d => ({ ...d, logo: '' }))}>{c('logo_remove')}</button>
              </div>
            )}
          </div>
          {logoErr && <p className="bp-error" role="alert">{logoErr}</p>}
          <div className="bp-actions">
            <button type="submit" className="btn-primary">{c('done')}</button>
            {hasProfile(profile) && (
              <button type="button" className="bp-link" onClick={() => { clear(); setDraft({ ...EMPTY }); setOpen(false); }}>{c('clear')}</button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}

// The letterhead printed at the top of every professional document.
export function BrandHeader({ profile }) {
  if (!hasProfile(profile)) return null;
  const contact = [profile.phone, profile.email, profile.web].filter(Boolean);
  return (
    <div className="bp-letterhead">
      {profile.logo && <img className="bp-letterhead-logo" src={profile.logo} alt={profile.firm || profile.name} />}
      <div className="bp-letterhead-text">
        {profile.firm && <span className="bp-lh-firm">{profile.firm}</span>}
        {(profile.name || profile.role) && (
          <span className="bp-lh-name">{[profile.name, profile.role].filter(Boolean).join(', ')}</span>
        )}
        {contact.length > 0 && <span className="bp-lh-contact">{contact.join('  ·  ')}</span>}
      </div>
    </div>
  );
}

// The signature block at the end of a client letter.
export function BrandSignature({ profile }) {
  if (!hasProfile(profile)) return null;
  return (
    <p className="bp-signature">
      {profile.name && <span>{profile.name}</span>}
      {profile.role && <span>{profile.role}</span>}
      {profile.firm && <span>{profile.firm}</span>}
      {[profile.phone, profile.email].filter(Boolean).map(x => <span key={x}>{x}</span>)}
    </p>
  );
}
