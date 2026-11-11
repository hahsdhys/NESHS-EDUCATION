import { useEffect, useState } from 'react';

// Full-screen loading screen: a frosted-glass card with a "RECONNECTING..."
// badge and an ECHOES wordmark that a diagonal light wave sweeps across.
export default function LoadingScreen({ label = 'RECONNECTING' }) {
  const [dots, setDots] = useState(3);
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d % 3) + 1), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="echoes-loader" role="status" aria-live="polite" aria-label="Loading NESHS Portal">
      <div className="echoes-loader-card">
        <div className="echoes-loader-badge">
          <span className="echoes-loader-dot" aria-hidden="true"><i /><b /></span>
          <span className="echoes-loader-label">{label}<span aria-hidden="true">{'.'.repeat(dots)}</span></span>
        </div>
        <h1 className="echoes-loader-title">ECHOES</h1>
      </div>
    </div>
  );
}
