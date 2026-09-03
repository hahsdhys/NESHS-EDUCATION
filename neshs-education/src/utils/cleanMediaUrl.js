const R2_PUBLIC_DOMAIN = 'https://pub-020adfa3657b43cab1abad0ba2d6ba57.r2.dev';

export const cleanMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  const value = url.trim();
  if (value.startsWith('blob:')) return '';

  let path = value;
  try {
    path = new URL(value).pathname;
  } catch {
    // Stored filenames and paths may be relative rather than full URLs.
  }

  const segments = path.split('/').filter(Boolean);
  if (!segments.length) return '';

  const encodedPath = segments
    .map(segment => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');

  return `${R2_PUBLIC_DOMAIN}/${encodedPath}`;
};