import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import VideoGrid from '@/components/VideoGrid';
import SectionHeader from '@/components/SectionHeader';
import { getVideoDetail, getTrending } from '@/lib/api';
import type { VideoDetail, VideoResult } from '@/lib/types';

async function getVideo(id: string, slug: string): Promise<VideoDetail | null> {
  try {
    return await getVideoDetail(id, slug);
  } catch {
    return null;
  }
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
    getVideo(id, slug),
    getRelated(),
  ]);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player */}
          <VideoPlayer streams={video.streams} poster={video.poster} title={video.title} />

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
              {video.releaseDate && (
                <span className="text-white/30 text-sm">
                  {new Date(video.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
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

      {/* Related Videos */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-white/5">
          <SectionHeader
            title="You May Also Like"
            subtitle="Recommended videos"
          />
          <VideoGrid videos={related} />
        </section>
      )}
    </div>
  );
}
