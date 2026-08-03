import { Suspense } from 'react';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import VideoGrid from '@/components/VideoGrid';
import VideoCard from '@/components/VideoCard';
import SortSelector from '@/components/SortSelector';
import { getVideos, getTrending, getCensored, getUncensored } from '@/lib/api';
import type { VideoResult } from '@/lib/types';

// ISR: cache for 1 hour to reduce calls to source website
export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const [latest, trending, censored, uncensored] = await Promise.all([
    getVideos(1, sort).catch(() => ({ videos: [] as VideoResult[], totalPages: 1, page: 1, totalResults: 0 })),
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
              Free JAV Streaming — No Sign-Up
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-4">
              <span className="gradient-text">Watch JAV Online</span>
              <br />
              <span className="text-white">in HD — Free & Instant</span>
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Stream thousands of free Japanese adult videos in HD. Browse censored and
              uncensored JAV by category, actress, and studio — on any device, instantly.
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
            href="/videos"
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

      {/* SEO Content — What is JavOnlineHD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/5 p-6 lg:p-12">
          <div className="absolute -top-24 right-0 w-[400px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-blue-500" />
                About the Platform
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                <span className="gradient-text">What is JavOnlineHD?</span>
              </h2>
              <p className="text-white/40">
                The free way to watch JAV online — organized by the categories, actresses, and studios you love.
              </p>
            </div>

            <div className="space-y-6 text-white/50 text-[15px] leading-relaxed">
              <div>
                <h3 className="text-white/90 text-lg font-semibold mb-2">Watch JAV Online in HD — Free &amp; Instant</h3>
                <p>
                  JavOnlineHD is a free JAV streaming platform built for fans of Japanese adult video who want a fast,
                  modern way to watch JAV online. Instead of wading through cluttered tube sites, you get a clean,
                  searchable library of JAV movies organized by the categories, actresses, and studios you care about.
                  Whether you are hunting for the newest uncensored JAV release, a classic censored movie from a
                  favorite studio, or the complete filmography of a specific actress, JavOnlineHD puts it one click
                  away. Every video streams instantly in crisp HD with multiple quality options — no downloads, no
                  accounts, no paywalls.
                </p>
              </div>

              <div>
                <h3 className="text-white/90 text-lg font-semibold mb-2">Censored vs. Uncensored JAV — Both Covered</h3>
                <p>
                  The first question every JAV fan asks is &ldquo;censored or uncensored?&rdquo; JavOnlineHD covers
                  both ends of the spectrum. The dedicated censored section collects the standard mosaic-covered
                  releases from mainstream Japanese studios, while the uncensored section is home to fully unmasked
                  titles. A reducing-mosaic section rounds things out for releases with partial or light mosaic
                  treatment. Browse each style independently, filter by popularity or release date, or jump straight
                  from a censored scene to the uncensored version of the same code — whatever your preference, it is
                  one click away.
                </p>
              </div>

              <div>
                <h3 className="text-white/90 text-lg font-semibold mb-2">Browse by Actress, Studio, and Category</h3>
                <p>
                  Search is only the start. JavOnlineHD is organized the way JAV is made — by the people and labels
                  behind it. Actress pages gather every video from your favorite JAV actresses into one filmography
                  with video counts, so you can follow a star&rsquo;s career from debut to latest release. Studio and
                  channel pages track the output of the industry&rsquo;s biggest labels. Category pages span the full
                  range of JAV genres — amateur, beautiful girl, married woman, mature woman, big tits, school girls,
                  and hundreds more — making new discoveries effortless.
                </p>
              </div>

              <div>
                <h3 className="text-white/90 text-lg font-semibold mb-2">Trending, Fresh Uploads, and Deep Search</h3>
                <p>
                  New releases land on the homepage daily, with a dedicated latest-videos feed, weekly trending
                  charts, and a fast full-text search that matches titles, JAV codes, and actresses. Note a video by
                  its code, read comments from other viewers, and let our recommendations surface your next favorite
                  scene. The more you explore, the more the platform reveals — curated sections like censored,
                  uncensored, and reducing mosaic make it easy to find exactly the style you are in the mood for.
                </p>
              </div>

              <div>
                <h3 className="text-white/90 text-lg font-semibold mb-2">Fast on Every Device</h3>
                <p>
                  More than three-quarters of adult content is consumed on mobile, so JavOnlineHD is built
                  mobile-first. The responsive layout adapts to any screen, the video player is touch-friendly with
                  quality selection and fullscreen support, and edge caching keeps pages fast around the world. Our
                  smart image delivery keeps thumbnails loading quickly on any connection, so browsing stays smooth
                  whether you are on Wi-Fi or mobile data.
                </p>
              </div>

              <div>
                <h3 className="text-white/90 text-lg font-semibold mb-2">A Responsible Way to Watch JAV Online</h3>
                <p>
                  JavOnlineHD is strictly for adults 18 and over. Every title is clearly labeled with its code and
                  description so you always know what you are watching. We keep the platform fast, clean, and free of
                  intrusive ads, and we protect the experience for real viewers by blocking AI crawlers and scrapers
                  that could degrade performance. Your privacy matters — no sign-up, no tracking wall, just the videos.
                </p>
              </div>

              <div>
                <h3 className="text-white/90 text-lg font-semibold mb-2">Start Watching</h3>
                <p>
                  Whether you are a longtime collector hunting a rare studio release or a newcomer exploring Japanese
                  adult video for the first time, JavOnlineHD is the fastest way to watch JAV online in HD — free,
                  unlimited, and always updated. Start with the latest uploads, check what is trending, or search for
                  your favorite actress by name or code. Your next favorite video is one click away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
