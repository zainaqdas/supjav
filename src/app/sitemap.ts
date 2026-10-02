import type { MetadataRoute } from 'next';
import { getCategories, getActresses, getChannels, getVideos } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

// The sitemap walks the source's entity lists. Those are deep (hundreds of
// pages of actresses/channels), so bound both the number of pages walked per
// run and the total URL count.
const MAX_ENTITY_PAGES = 50;
const MAX_ENTITIES = 5000;
const MAX_VIDEOS = 480; // 20 listing pages at ~24 per page
const VIDEO_PAGES = MAX_VIDEOS / 24;
const MAX_URLS = 50_000; // protocol limit

// Lists change slowly; videos change hourly.
export const revalidate = 3600;

const BASE = SITE_URL;

/** Walk a paginated entity listing up to `maxPages`, reusing one fetcher. */
async function collectPages<T>(
  totalPages: number,
  maxPages: number,
  fetchPage: (page: number) => Promise<T[]>,
  limit: number
): Promise<T[]> {
  const out: T[] = [];
  const pages = Math.min(Math.max(totalPages, 1), maxPages);
  // Small batches to avoid a burst of upstream requests.
  for (let i = 0; i < pages; i += 5) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(5, pages - i) }, (_, k) =>
        fetchPage(i + k + 1).catch(() => [] as T[])
      )
    );
    for (const items of batch) out.push(...items);
    if (out.length >= limit) return out.slice(0, limit);
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/videos`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/trending`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/censored`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/uncensored`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/reducing-mosaic`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/categories`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/actresses`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/channels`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [cats, acts, chs] = await Promise.all([
    getCategories().catch(() => null),
    getActresses(1).catch(() => null),
    getChannels(1).catch(() => null),
  ]);

  // Categories: a single flat list, always included in full (capped).
  if (cats?.categories) {
    for (const c of cats.categories.slice(0, MAX_ENTITIES)) {
      entries.push({
        url: `${BASE}/category/${c.slug}`,
        changeFrequency: 'daily',
        priority: 0.6,
      });
    }
  }

  // Actresses & channels: previously only page 1 made it into the sitemap,
  // which left the overwhelming majority of these pages undiscovered.
  // Walk a bounded number of pages of each.
  if (acts?.actresses) {
    const all = await collectPages(
      acts.totalPages || 1,
      MAX_ENTITY_PAGES,
      (page) => getActresses(page).then((d) => d.actresses ?? []),
      MAX_ENTITIES
    );
    const seen = new Set<string>();
    for (const a of all) {
      if (seen.has(a.slug)) continue;
      seen.add(a.slug);
      entries.push({
        url: `${BASE}/actress/${a.slug}`,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  if (chs?.channels) {
    const all = await collectPages(
      chs.totalPages || 1,
      MAX_ENTITY_PAGES,
      (page) => getChannels(page).then((d) => d.channels ?? []),
      MAX_ENTITIES
    );
    const seen = new Set<string>();
    for (const c of all) {
      if (seen.has(c.slug)) continue;
      seen.add(c.slug);
      entries.push({
        url: `${BASE}/channel/${c.slug}`,
        changeFrequency: 'daily',
        priority: 0.5,
      });
    }
  }

  // Video pages were absent entirely. Include the most recent releases so the
  // richest page type is actually discoverable.
  const videos = await collectPages(
    VIDEO_PAGES,
    VIDEO_PAGES,
    (page) => getVideos(page).then((d) => d.videos ?? []),
    MAX_VIDEOS
  );
  const seenVideos = new Set<string>();
  for (const v of videos) {
    if (!v.id || !v.slug || seenVideos.has(v.id)) continue;
    seenVideos.add(v.id);
    entries.push({
      url: `${BASE}/video/${v.id}/${v.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return entries.slice(0, MAX_URLS);
}