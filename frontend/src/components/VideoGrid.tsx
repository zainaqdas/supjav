import VideoCard from './VideoCard';
import type { VideoResult } from '@/lib/types';

interface VideoGridProps {
  videos: VideoResult[];
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <p className="text-white/30">No videos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {videos.map((video, i) => (
        <VideoCard key={`${video.id}-${video.slug}`} video={video} index={i} />
      ))}
    </div>
  );
}
