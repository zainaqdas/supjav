// Single source of truth for the production origin.
// Used for canonical URLs, sitemap entries, OG/Twitter tags, and JSON-LD.
export const SITE_URL = 'https://javhdonline.vercel.app';

export function absUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
