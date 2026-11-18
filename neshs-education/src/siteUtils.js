// Small shared helpers: timeouts, rate limiting, error logging, analytics.

export const SITE_URL = 'https://neshs-educ.vercel.app';
export const SITE_NAME = 'ECHOES NESHS';
export const SCHOOL_MAP_QUERY = 'Nasugbu East Senior High School, Lumbangan, Nasugbu, Batangas, Philippines';

// fetch that gives up instead of hanging forever (API timeouts).
export const fetchWithTimeout = async (url, options = {}, ms = 20000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: options.signal || controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('The request took too long. Check your connection and try again.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

// Retry a failed network call a couple of times with a short back-off.
export const withRetry = async (fn, tries = 2, delayMs = 800) => {
  let lastErr;
  for (let i = 0; i <= tries; i += 1) {
    try { return await fn(); } catch (err) {
      lastErr = err;
      if (i < tries) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
};

// Client-side rate limiter: allow `max` actions per `windowMs`.
export const createLimiter = (max, windowMs) => {
  let hits = [];
  return {
    // Returns 0 when allowed, otherwise the seconds to wait.
    check() {
      const now = Date.now();
      hits = hits.filter(t => now - t < windowMs);
      if (hits.length >= max) return Math.ceil((windowMs - (now - hits[0])) / 1000);
      hits.push(now);
      return 0;
    }
  };
};

// Error logging: keeps the last 30 errors on this device and in the console.
const LOG_KEY = 'neshs_error_log';
export const readErrorLog = () => {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return []; }
};
export const clearErrorLog = () => { try { localStorage.removeItem(LOG_KEY); } catch { /* ignore */ } };
export const logError = (source, error) => {
  const entry = {
    t: new Date().toISOString(),
    source,
    message: String(error?.message || error || 'Unknown error').slice(0, 300),
    where: typeof location !== 'undefined' ? location.pathname : ''
  };
  console.error(`[${source}]`, error);
  try {
    const log = readErrorLog();
    log.unshift(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 30)));
  } catch { /* storage unavailable */ }
};

export const installErrorLogging = () => {
  window.addEventListener('error', e => logError('window.error', e.error || e.message));
  window.addEventListener('unhandledrejection', e => logError('unhandledrejection', e.reason));
};

// Google Analytics loads only when a measurement ID is set (VITE_GA_ID).
export const installAnalytics = () => {
  const id = import.meta.env?.VITE_GA_ID;
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
};

export const trackPage = (title) => {
  try { window.gtag?.('event', 'page_view', { page_title: title }); } catch { /* ignore */ }
};
