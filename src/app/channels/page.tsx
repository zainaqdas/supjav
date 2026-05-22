import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { getChannels } from '@/lib/api';
import type { ChannelItem } from '@/lib/types';

export default async function ChannelsPage() {
  const data = await getChannels().catch(() => ({ channels: [] as ChannelItem[] }));
  const channels = data.channels || [];

  if (!channels.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-white/30">No channels found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <SectionHeader
          title="Channels"
          subtitle={`${channels.length} channels & studios`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {channels.map((ch, i) => (
          <Link
            key={ch.slug}
            href={`/channel/${ch.slug}`}
            className="glass-card p-5 flex flex-col items-center text-center gap-3 animate-fade-in-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-red-600/20 flex items-center justify-center border border-white/5">
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white/70 text-sm font-medium line-clamp-1">{ch.name}</h3>
              {ch.videoCount !== null && (
                <span className="text-white/30 text-xs">{ch.videoCount.toLocaleString()} videos</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
