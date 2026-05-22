import Link from 'next/link';
import PreviewVideo from './PreviewVideo';
import type { VideoResult } from '@/lib/types';

interface VideoCardProps {
  video: VideoResult;
  index?: number;
}

export default function VideoCard({ video, index = 0 }: VideoCardProps) {
  return (
    <Link
      href={`/video/${video.id}/${video.slug}`}
      className="video-card group block glass-card overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[#111]">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Preview video on hover */}
        {video.previewVideo && (
          <PreviewVideo src={video.previewVideo} />
        )}

        {/* Overlay */}
        <div className="video-overlay">
          <div className="w-full">
            <p className="text-white text-xs font-medium line-clamp-2 leading-relaxed">
              {video.title}
            </p>
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-xs font-medium backdrop-blur-sm">
            {video.duration}
          </div>
        )}

        {/* Quality badge */}
        {video.quality && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold backdrop-blur-sm"
            style={{
              background: video.quality === 'FHD' || video.quality === '4K'
                ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                : video.quality === 'HD'
                ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                : 'rgba(255,255,255,0.15)',
            }}
          >
            {video.quality}
          </div>
        )}

        {/* Badges */}
        {video.badges && video.badges.length > 0 && video.badges[0] !== video.quality && video.badges[0] !== video.duration && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600/90 to-blue-600/90 text-white text-[10px] font-semibold backdrop-blur-sm uppercase tracking-wider">
            {video.badges[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-white/90 text-sm font-medium line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-white/40">
          {video.views && <span>{video.views} views</span>}
          {video.timeAgo && <span>{video.timeAgo}</span>}
        </div>
      </div>
    </Link>
  );
}
