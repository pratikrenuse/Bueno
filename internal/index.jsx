// The old 24/7 Spain Studio deck used to live here.
//
// It was an approval queue for social packages, reading studio_packages, and its GitHub
// publishing schedule had been failing daily without ever publishing anything. The schedule
// is off and the deck is retired. The table and its rows are untouched in Supabase, so
// nothing has been lost and this page can be brought back by restoring this file from git.
//
// The route stays so that an old bookmark lands somewhere honest rather than on the site's
// catch-all. Anyone arriving here wants the personal post deck, which is where this points.

export default function InternalRetired() {
  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: '#010221', color: '#fff', padding: 24, textAlign: 'center',
    }}>
      <div style={{ maxWidth: 460 }}>
        <p style={{ font: '600 15px/1 Georgia, serif', letterSpacing: '.08em', color: '#CBEFFF', margin: '0 0 18px' }}>
          24<span style={{ color: '#C9A96E' }}>/</span>7 SPAIN
        </p>
        <h1 style={{ font: '600 24px/1.25 Georgia, serif', margin: '0 0 12px' }}>
          The Studio deck has been retired
        </h1>
        <p style={{ font: '14px/1.6 system-ui, sans-serif', color: 'rgba(255,255,255,.75)', margin: '0 0 22px' }}>
          Its packages are still in the database, untouched. Nothing was deleted.
        </p>
        <a href="/internal-pratik" style={{
          display: 'inline-block', padding: '11px 18px', borderRadius: 9,
          background: '#5B7FCC', color: '#fff', textDecoration: 'none',
          font: '600 14px system-ui, sans-serif',
        }}>Go to my Facebook post deck</a>
      </div>
    </div>
  )
}
