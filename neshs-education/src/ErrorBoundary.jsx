import React from 'react';
import { logError } from './siteUtils.js';

// Catches render crashes so visitors see a friendly screen, not a blank page.
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { logError('react', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#0f1513', color: '#f2f4f2', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <img src="/logo-256.webp" alt="ECHOES NESHS logo" width="64" height="64" style={{ borderRadius: '22%', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ opacity: 0.75, lineHeight: 1.5, margin: '0 0 20px' }}>
            The page hit an unexpected problem. Your saved data is safe. Reload to try again.
          </p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: 999, border: 0, background: '#10996E', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Reload the page</button>
        </div>
      </div>
    );
  }
}
