// Tap feedback: a soft ripple that expands from the exact point you touch or
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
    const dot = document.createElement('span');
    dot.className = 'tap-ripple';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;background:${color}`;
    document.body.appendChild(dot);
    const remove = () => dot.remove();
    dot.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 900);
  };

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  return () => document.removeEventListener('pointerdown', onPointerDown);
}
