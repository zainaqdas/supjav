import { Suspense } from 'react';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import VideoGrid from '@/components/VideoGrid';
import VideoCard from '@/components/VideoCard';
import SortSelector from '@/components/SortSelector';
import { getMain, getTrending, getCensored, getUncensored } from '@/lib/api';
import type { VideoResult } from '@/lib/types';

// ISR: cache for 60s to reduce calls to source website
export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const [latest, trending, censored, uncensored] = await Promise.all([
    getMain(1, sort).catch(() => ({ videos: [] as VideoResult[], totalPages: 1, page: 1 })),
    getTrending(1).catch(() => ({ videos: [] as VideoResult[] })),
    getCensored(1).catch(() => ({ videos: [] as VideoResult[] })),
    getUncensored(1).catch(() => ({ videos: [] as VideoResult[] })),
  ]);
  const mainVideos = latest.videos || [];
  const trendingVideos = trending.videos || [];
  const censoredVideos = censored.videos || [];
  const uncensoredVideos = uncensored.videos || [];

  // Get hero videos (first 4 for featured)
  const heroVideos = mainVideos.slice(0, 4);
  const remainingVideos = mainVideos.slice(4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-blue-950/10 to-[#0a0a0f] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/50 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Streaming Now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-4">
              <span className="gradient-text">Watch & Stream</span>
              <br />
              <span className="text-white">in Stunning HD</span>
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Browse thousands of HD videos across categories, actresses, and channels.
              Start streaming instantly with our modern platform.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link
                href="/trending"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-xl hover:shadow-red-600/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Trending Now
              </Link>
              <Link
                href="/categories"
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Featured grid */}
          {heroVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {heroVideos.map((video, i) => (
                <VideoCard key={`hero-${video.id}`} video={video} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Videos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <SectionHeader
            title="Latest Uploads"
            subtitle="Fresh content added regularly"
            href="/search?q=new"
            linkLabel="View More"
          />
          <Suspense>
            <SortSelector />
          </Suspense>
        </div>
        <VideoGrid videos={remainingVideos.slice(0, 15)} />
      </section>

      {/* Censored Section */}
      {censoredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/20 via-blue-950/20 to-[#0a0a0f] border border-white/5 p-6 lg:p-10">
            <SectionHeader
              title="Censored"
              subtitle="Latest censored JAV videos"
              href="/censored"
              linkLabel="See All Censored"
            />
            <VideoGrid videos={censoredVideos.slice(0, 10)} />
          </div>
        </section>
      )}

      {/* Uncensored Section */}
      {uncensoredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/20 via-red-950/20 to-[#0a0a0f] border border-white/5 p-6 lg:p-10">
            <SectionHeader
              title="Uncensored"
              subtitle="Latest uncensored JAV videos"
              href="/uncensored"
              linkLabel="See All Uncensored"
            />
            <VideoGrid videos={uncensoredVideos.slice(0, 10)} />
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trendingVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/20 via-blue-950/20 to-[#0a0a0f] border border-white/5 p-6 lg:p-10">
            <SectionHeader
              title="Trending Now"
              subtitle="Most popular videos this week"
              href="/trending"
              linkLabel="See All Trending"
            />
            <VideoGrid videos={trendingVideos.slice(0, 10)} />
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Explore" subtitle="Discover content by category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Amateur', slug: 'amateur', color: 'from-red-600/20 to-red-800/20' },
            { label: 'Beautiful Girl', slug: 'beautiful-girl', color: 'from-blue-600/20 to-blue-800/20' },
            { label: 'Married Woman', slug: 'married-woman', color: 'from-red-600/20 to-blue-800/20' },
            { label: 'Mature Woman', slug: 'mature-woman', color: 'from-blue-600/20 to-red-800/20' },
            { label: 'Big Tits', slug: 'big-tits', color: 'from-red-600/20 to-red-800/20' },
            { label: 'School Girls', slug: 'school-girls', color: 'from-blue-600/20 to-blue-800/20' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`group p-4 rounded-2xl bg-gradient-to-br ${cat.color} border border-white/5 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1`}
            >
              <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
