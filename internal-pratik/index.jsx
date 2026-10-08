import { useEffect } from 'react'

// The Facebook post deck moved to /internal-poornima on 8 October 2026, so the name says who
// the posts are for. This route stays so an old bookmark or an old email link still lands in
// the right place. No meta.js here either, so it is on no grid and in no sitemap.

export default function MovedToPoornima() {
  useEffect(() => { window.location.replace('/internal-poornima') }, [])
  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: '#010221', color: '#fff', padding: 24, textAlign: 'center',
      font: '15px/1.6 system-ui, sans-serif',
    }}>
      <p>
        This deck has moved to{' '}
        <a href="/internal-poornima" style={{ color: '#CBEFFF' }}>/internal-poornima</a>.
      </p>
    </div>
  )
}
