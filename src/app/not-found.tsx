import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 to-blue-600/20 mx-auto flex items-center justify-center mb-6 border border-white/5">
        <span className="text-5xl font-bold gradient-text">404</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-white/40 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5 inline-block"
      >
        Back to Home
      </Link>
    </div>
  );
}
