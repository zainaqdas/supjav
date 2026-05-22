import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Pages use page-level `revalidate` for ISR caching (60s-300s).
// No force-dynamic here — that would override page-level revalidate
// and cause every request to hit javtiful.com on every render.

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
