// Single source of truth for the production origin.
// Used for canonical URLs, sitemap entries, OG/Twitter tags, and JSON-LD.
//
// Override with NEXT_PUBLIC_SITE_URL when deploying to a custom domain —
// otherwise every canonical, OG url and sitemap entry points at the default.
const DEFAULT_SITE_URL = 'https://javhdonline.vercel.app';

function normalizeSiteUrl(value: string): string {
  // Trim, drop any trailing slash. Validate loosely so a malformed env var
  // falls back to the default rather than breaking every canonical at build.
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s]+$/.test(trimmed)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[site] Ignoring invalid NEXT_PUBLIC_SITE_URL="${value}" — using ${DEFAULT_SITE_URL}`
      );
    }
    return DEFAULT_SITE_URL;
  }
  return trimmed;
}

export const SITE_URL: string = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
);

export const SITE_NAME = 'JavOnlineHD';

/** Join a site-relative path onto the canonical origin. */
export function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}