export const cleanMediaUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('blob:')) return '';

  const fileName = url.split('/').pop();
  const encodedName = encodeURIComponent(decodeURIComponent(fileName));

  return `https://pub-020adfa3657b43cab1abad0ba2d6ba57.r2.dev/announcements/${encodedName}`;
};