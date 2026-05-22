import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                J
              </div>
              <span className="text-lg font-bold">
                <span className="text-red-500">Jav</span>
                <span className="text-blue-400">tiful</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Modern streaming platform. Browse the latest HD content across categories, actresses, and channels.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">Browse</h4>
            <div className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/trending', label: 'Trending' },
                { href: '/categories', label: 'Categories' },
                { href: '/actresses', label: 'Actresses' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="block text-white/40 hover:text-red-400 text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* More */}
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">More</h4>
            <div className="space-y-2">
              {[
                { href: '/channels', label: 'Channels' },
                { href: '/censored', label: 'Censored' },
                { href: '/uncensored', label: 'Uncensored' },
                { href: '/reducing-mosaic', label: 'Reducing Mosaic' },
                { href: '/search?q=hd', label: 'HD Videos' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="block text-white/40 hover:text-red-400 text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">About</h4>
            <p className="text-white/30 text-sm leading-relaxed">
              Built with Next.js & TypeScript. Powered by a custom scraping API. Red & Blue theme.
            </p>
            <div className="flex gap-3 mt-4">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Javtiful Stream. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/20 text-xs">Privacy</span>
            <span className="text-white/20 text-xs">Terms</span>
            <span className="text-white/20 text-xs">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
