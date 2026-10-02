import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Generated rather than a static file so the Sitemap URL always tracks
 * SITE_URL — a static public/robots.txt would silently keep pointing at the
 * default origin after a custom-domain deploy.
 *
 * The AI-crawler disallow list mirrors the user-agent blocklist enforced with
 * a hard 403 in src/proxy.ts. Keep the two in sync.
 */
const BLOCKED_BOTS = [
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'Google-Extended',
  'PerplexityBot',
  'Bytespider',
  'Amazonbot',
  'Applebot-Extended',
  'CCBot',
  'AI2Bot',
  'ai_crawler',
  'Meta-ExternalAgent',
  'Cohere-ai',
  'ImagesiftBot',
  'anthropic-ai',
  'Diffbot',
  'PetalBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // Explicitly deny the AI/training crawlers for compliant crawlers that
      // honour robots.txt (the rest are stopped at the edge).
      ...BLOCKED_BOTS.map((userAgent) => ({
        userAgent,
        disallow: ['/'],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}