import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Skip static generation at build time — pages render at request time (SSR)
// because the scraper API calls javtiful.com and are too slow for build-time pre-rendering.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Javtiful Stream - Watch HD Videos',
  description: 'Stream the latest HD videos with our modern streaming platform. Browse categories, actresses, channels, and trending content.',
  keywords: 'streaming, videos, HD, categories, actresses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
