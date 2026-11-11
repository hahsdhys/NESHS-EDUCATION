// Tap feedback: a glass water wave that expands from the exact point you touch or
// click on any button, link or control. It lives in its own overlay element
// (not inside the button), so it never gets clipped and never changes layout.
// It stays off when Reduced Motion is on, either in the portal's Settings
// (html[data-reduced-motion="true"]) or in the device's own setting.

const TARGETS = 'button, a[href], [role="button"], [role="tab"], select, summary, label[for], input[type="checkbox"], input[type="radio"]';

const motionIsReduced = () => {
  if (document.documentElement.dataset.reducedMotion === 'true') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function installTapEffects() {
  if (typeof document === 'undefined') return () => {};

  const onPointerDown = e => {
    if (e.button !== undefined && e.button > 0) return;
    if (motionIsReduced()) return;
    const el = e.target instanceof Element ? e.target.closest(TARGETS) : null;
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;

    const color = getComputedStyle(el).getPropertyValue('--echo-glow').trim() || '#c4f542';
    const size = Math.min(Math.max(el.getBoundingClientRect().width, 56), 220);
    // A glass water wave: three clear, refracting rings that spread out one
    // after another from the touch point, plus a small droplet at the centre.
    const dot = document.createElement('span');
    dot.className = 'tap-ripple';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${size * 1.5}px;height:${size * 1.5}px;--wave:${color}`;
    for (let i = 0; i < 4; i += 1) {
      const ring = document.createElement('i');
      ring.className = i === 3 ? 'tap-drop' : 'tap-ring';
      ring.style.animationDelay = `${i * 110}ms`;
      dot.appendChild(ring);
    }
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1500);
  };

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  return () => document.removeEventListener('pointerdown', onPointerDown);
}
