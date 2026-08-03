import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about JavOnlineHD — a free JAV streaming platform for watching Japanese adult videos online in HD, organized by category, actress, and studio.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl lg:text-5xl font-bold text-center relative">
          <span className="gradient-text">About JavOnlineHD</span>
        </h1>
        <p className="text-white/40 text-center mt-3 max-w-2xl mx-auto">
          The free way to watch JAV online — fast, modern, and organized around the stars and studios you love.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8 text-white/50 text-[15px] leading-relaxed">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">Who We Are</h2>
          <p>
            JavOnlineHD is a free JAV streaming platform built for fans of Japanese adult video who want a clean,
            fast, and modern way to watch JAV online. We believe discovering great content should be effortless —
            no cluttered layouts, no intrusive ads, no sign-up walls. Just a searchable library of JAV movies,
            organized by the categories, actresses, and studios you actually care about.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">What We Offer</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><span className="text-white/70">Instant HD streaming</span> with multiple quality options on every video.</li>
            <li><span className="text-white/70">Censored, uncensored, and reducing-mosaic sections</span> — browse each style independently.</li>
            <li><span className="text-white/70">Actress, studio, and category pages</span> that group every release into one filmography.</li>
            <li><span className="text-white/70">Trending charts and fresh uploads</span> updated continuously.</li>
            <li><span className="text-white/70">A mobile-first design</span> that works beautifully on phones, tablets, and desktops.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">How It Works</h2>
          <p>
            JavOnlineHD is built with modern web technology — Next.js and TypeScript — and served with edge caching
            for fast page loads around the world. Video streams are delivered directly from high-speed CDNs, so
            playback starts quickly even on slower connections. Our smart image delivery keeps thumbnails loading
            fast, and the whole experience is free: no accounts, no paywalls, no hidden fees.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="text-white/90 text-lg font-semibold mb-2">A Responsible Platform</h2>
          <p>
            JavOnlineHD is strictly for adults aged 18 and over. Every title is clearly labeled with its code and
            description so you always know what you are watching. We keep the platform fast and clean, protect real
            viewers by blocking AI crawlers and scrapers, and never require personal information to enjoy the site.
          </p>
        </div>

        <div className="text-center pt-2">
          <p className="text-white/40 mb-4">Have a question or feedback?</p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
