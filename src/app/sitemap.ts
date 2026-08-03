import type { MetadataRoute } from 'next';
import { getCategories, getActresses, getChannels } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

// Rebuild at most once a day — the source's entity lists don't change often.
export const revalidate = 86400;

const BASE = SITE_URL;

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

  if (cats?.categories) {
    for (const c of cats.categories) {
      entries.push({
        url: `${BASE}/category/${c.slug}`,
        changeFrequency: 'daily',
        priority: 0.6,
      });
    }
  }

  if (acts?.actresses) {
    for (const a of acts.actresses) {
      entries.push({
        url: `${BASE}/actress/${a.slug}`,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  if (chs?.channels) {
    for (const c of chs.channels) {
      entries.push({
        url: `${BASE}/channel/${c.slug}`,
        changeFrequency: 'daily',
        priority: 0.5,
      });
    }
  }

  return entries;
}
