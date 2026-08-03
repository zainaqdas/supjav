import { cache } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import VideoPlayer from '@/components/VideoPlayer';
import VideoGrid from '@/components/VideoGrid';
import SectionHeader from '@/components/SectionHeader';
import JsonLd from '@/components/JsonLd';
import { getVideoDetail, getTrending } from '@/lib/api';
import { SITE_URL } from '@/lib/site';
import type { VideoDetail, VideoResult } from '@/lib/types';

function formatIsoDuration(value: string | null): string | undefined {
  if (!value) return undefined;
  const parts = value.split(':').map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p)) || parts.length === 0) return undefined;
  const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1] ?? 0];
  const iso =
    (h ? `${h}H` : '') + (m ? `${m}M` : '') + `${s}S`;
  return `PT${iso}`;
}

// Parse human view counts like "214.7K" or "1,200,345" into an integer.
function parseViewCount(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/([\d.,]+)\s*([KkMmBb]?)/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(num)) return null;
  const suffix = match[2].toLowerCase();
  const mult = suffix === 'k' ? 1e3 : suffix === 'm' ? 1e6 : suffix === 'b' ? 1e9 : 1;
  return Math.round(num * mult);
}

function formatCommentDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatReleaseDate(value: string): string | null {
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Cache short: stream URLs are pre-signed (~1h expiry). CDN cache for /video/* is capped at 300s in src/proxy.ts.
export const revalidate = 300;

const getVideoCached = cache(async function getVideoCached(
  id: string,
  slug: string
): Promise<VideoDetail | null> {
  try {
    return await getVideoDetail(id, slug);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id, slug } = await params;
  const video = await getVideoCached(id, slug);
  const fallbackTitle = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const title = video?.title || `${fallbackTitle} JAV Video`;
  const code = video?.videoCode
    ? title.toUpperCase().includes(video.videoCode.toUpperCase())
      ? ''
      : ` (${video.videoCode})`
    : '';
  const description =
    video?.description && video.description.length > 0
      ? `${video.description.slice(0, 152)}${video.description.length > 152 ? '…' : ''}`
      : `Watch ${title} online in HD for free. Stream ${video?.duration || 'the full video'} with multiple quality options on JavOnlineHD — no sign-up required.`;
  const absPoster =
    video?.poster && video.poster.startsWith('/')
      ? `${SITE_URL}${video.poster}`
      : video?.poster || undefined;

  return {
    title: `${title}${code} — Watch JAV Online in HD`,
    description,
    alternates: { canonical: `/video/${id}/${slug}` },
    openGraph: {
      type: 'video.other',
      title: `${title}${code} — Watch JAV Online in HD`,
      description: description.slice(0, 197),
      url: `${SITE_URL}/video/${id}/${slug}`,
      images: absPoster ? [{ url: absPoster }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title}${code} — Watch JAV Online in HD`,
      description: description.slice(0, 197),
      images: absPoster ? [absPoster] : undefined,
    },
  };
}

async function getRelated(): Promise<VideoResult[]> {
  try {
    const data = await getTrending();
    return data.videos?.slice(0, 10) || [];
  } catch {
    return [];
  }
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const [video, related] = await Promise.all([
    getVideoCached(id, slug),
    getRelated(),
  ]);

  // Prefer the source's real "More from These Actresses" section; fall back
  // to trending when the page exposes no related grid.
  const relatedVideos =
    video && video.related && video.related.length > 0
      ? video.related.slice(0, 12)
      : related;

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Video Not Found</h1>
        <p className="text-white/40 mb-6">This video may have been removed or the URL is incorrect.</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold hover:shadow-xl transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* VideoObject structured data */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: video.title,
          description: video.description || `Watch ${video.title} online in HD on JavOnlineHD.`,
          thumbnailUrl:
            (video.poster && video.poster.startsWith('/')
              ? `${SITE_URL}${video.poster}`
              : video.poster) ||
            (video.thumbnails && video.thumbnails[0]) ||
            undefined,
          uploadDate: video.releaseDate || undefined,
          duration: formatIsoDuration(video.duration),
          contentUrl: `${SITE_URL}/video/${video.id}/${video.slug}`,
          embedUrl: video.endpoints?.embed || undefined,
          interactionStatistic:
            parseViewCount(video.views) != null
              ? {
                  '@type': 'InteractionCounter',
                  interactionType: { '@type': 'WatchAction' },
                  userInteractionCount: parseViewCount(video.views),
                }
              : undefined,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player */}
          <VideoPlayer streams={video.streams} poster={video.poster} />

          {/* Title & Meta */}
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white leading-tight">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {video.quality && (
                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600/80 to-red-700/80 text-white text-xs font-bold">
                  {video.quality}
                </span>
              )}
              {video.duration && (
                <span className="text-white/40 text-sm">{video.duration}</span>
              )}
              {video.views && (
                <span className="text-white/40 text-sm">{video.views} views</span>
              )}
              {video.releaseDate && formatReleaseDate(video.releaseDate) && (
                <span className="text-white/30 text-sm">
                  {formatReleaseDate(video.releaseDate)}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <Link
                  key={`${tag.type}-${tag.slug}`}
                  href={`/${tag.type}/${tag.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Actresses */}
          {video.actresses && video.actresses.length > 0 && (
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-2">Actresses</h3>
              <div className="flex flex-wrap gap-2">
                {video.actresses.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/actress/${a.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:text-blue-400 hover:border-blue-500/30 transition-all"
                  >
                    {a.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {video.description && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-white/60 text-sm font-medium mb-2">Description</h3>
              <p className="text-white/40 text-sm leading-relaxed">{video.description}</p>
            </div>
          )}

          {/* Keywords */}
          {video.keywords && video.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {video.keywords.map((kw) => (
                <span key={kw} className="px-2 py-1 rounded-md bg-white/3 text-white/20 text-xs">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video info card */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="text-white/80 font-semibold text-sm mb-4">Video Info</h3>
            <div className="space-y-3 text-sm">
              {video.videoCode && (
                <div className="flex justify-between">
                  <span className="text-white/30">Code</span>
                  <span className="text-white/70 font-mono">{video.videoCode}</span>
                </div>
              )}
              {video.qualityOptions && video.qualityOptions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/30">Quality</span>
                  <span className="text-white/70">{video.qualityOptions.join(', ')}p</span>
                </div>
              )}
              {video.streams && video.streams.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/30">Streams</span>
                  <span className="text-white/70">{video.streams.length} available</span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {video.thumbnails && video.thumbnails.length > 0 && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h3 className="text-white/80 font-semibold text-sm mb-3">Screenshots</h3>
              <div className="grid grid-cols-3 gap-2">
                {video.thumbnails.slice(0, 6).map((thumb, i) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden bg-[#111]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- images go through /api/proxy/image; next/image would add image-optimization quota cost */}
                    <img
                      src={thumb}
                      alt={`Screenshot ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {video.comments && video.comments.length > 0 && (
        <section className="mt-10">
          <h2 className="text-white/80 font-semibold text-lg mb-4">
            Comments ({video.comments.length})
          </h2>
          <div className="space-y-4">
            {video.comments.map((comment) => (
              <div key={comment.id || `${comment.author}-${comment.date}`} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600/40 to-blue-600/40 flex items-center justify-center text-white text-sm font-bold">
                    {(comment.author || 'M')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{comment.author || 'Member'}</p>
                    {comment.date && (
                      <p className="text-white/30 text-xs">{formatCommentDate(comment.date)}</p>
                    )}
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{comment.content}</p>
                {comment.children && comment.children.length > 0 && (
                  <div className="mt-3 ml-4 space-y-3 border-l border-white/5 pl-4">
                    {comment.children.map((child) => (
                      <div key={child.id || `${child.author}-${child.date}`} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white/70 text-xs font-medium">{child.author || 'Member'}</span>
                          {child.date && (
                            <span className="text-white/25 text-xs">{formatCommentDate(child.date)}</span>
                          )}
                        </div>
                        <p className="text-white/45 text-xs leading-relaxed">{child.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <section className="mt-12 pt-8 border-t border-white/5">
          <SectionHeader
            title="You May Also Like"
            subtitle="Recommended videos"
          />
          <VideoGrid videos={relatedVideos} />
        </section>
      )}
    </div>
  );
}
