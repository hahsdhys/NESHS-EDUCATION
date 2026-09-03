const TARGET_DOMAIN = 'https://rough-art-8c28.ecobseducation.workers.dev';

export const cleanMediaUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  const clean = url.trim();
  if (clean.startsWith('blob:')) return '';

  try {
    const parsedUrl = new URL(clean);
    const pathname = parsedUrl.pathname.replace(/^\/+/, '');
    const encodedPath = pathname.split('/').map(segment => {
      try { return encodeURIComponent(decodeURIComponent(segment)); } catch { return encodeURIComponent(segment); }
    }).join('/');
    return encodedPath ? `${TARGET_DOMAIN}/${encodedPath}` : '';
  } catch {
    const relativePath = clean.split('?')[0].replace(/^\/+/, '');
    if (!relativePath) return '';
    const encodedPath = relativePath.split('/').map(segment => {
      try { return encodeURIComponent(decodeURIComponent(segment)); } catch { return encodeURIComponent(segment); }
    }).join('/');
    return `${TARGET_DOMAIN}/${encodedPath}`;
  }
};