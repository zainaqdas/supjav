import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';

const inter = Inter({ subsets: ['latin'] });

// Pages use page-level `revalidate` for ISR caching (60s-300s).
// No force-dynamic here — that would override page-level revalidate
// and cause every request to hit javtiful.com on every render.

const SITE_URL = 'https://javhdonline.vercel.app';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Watch JAV Online in HD — Free Japanese Adult Video Streaming | JavOnlineHD',
    template: '%s | JavOnlineHD',
  },
  description:
    'Watch JAV online in HD for free. Stream the latest censored and uncensored Japanese adult videos, browse by category, actress, and studio, and enjoy instant HD playback on any device — no sign-up required.',
  keywords: [
    'watch JAV online',
    'JAV streaming',
    'free JAV videos',
    'JAV HD',
    'Japanese adult video',
    'uncensored JAV',
    'censored JAV',
    'JAV movies online',
    'JAV actresses',
    'JAV categories',
    'JAV studios',
    'JAV online free',
    'watch Japanese adult videos',
  ],
  applicationName: 'JavOnlineHD',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'JavOnlineHD',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Watch JAV Online in HD — Free Japanese Adult Video Streaming | JavOnlineHD',
    description:
      'Stream the latest censored and uncensored JAV movies in HD. Browse by category, actress, and studio — free, instant, no sign-up.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch JAV Online in HD — Free Japanese Adult Video Streaming | JavOnlineHD',
    description:
      'Stream the latest censored and uncensored JAV movies in HD. Browse by category, actress, and studio — free, instant, no sign-up.',
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'JavOnlineHD',
            alternateName: 'JavOnline HD',
            url: SITE_URL,
            description:
              'Free JAV streaming platform — watch censored and uncensored Japanese adult videos in HD, browse by category, actress, and studio.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
