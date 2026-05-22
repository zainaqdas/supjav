'use client';

import { useState, useRef, useEffect } from 'react';
import type { VideoStream } from '@/lib/types';

interface VideoPlayerProps {
  streams: VideoStream[];
  poster?: string | null;
  title?: string;
}

export default function VideoPlayer({ streams, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentQuality, setCurrentQuality] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const stream = streams[currentQuality] || streams[0];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [stream?.url]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * duration;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.volume = Math.max(0, Math.min(1, pct));
    setVolume(video.volume);
    setIsMuted(video.volume === 0);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!stream?.url) {
    return (
      <div className="aspect-video bg-[#111] rounded-2xl flex items-center justify-center border border-white/5">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">No stream available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video bg-black rounded-2xl overflow-hidden group cursor-pointer border border-white/5"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={stream.url}
        poster={poster || undefined}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Big play button */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30" onClick={togglePlay}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-red-600/30 hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-4 px-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress hover:h-1.5 transition-all"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-blue-500 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-red-400 transition-colors">
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <div
                className="w-20 h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all"
                onClick={handleVolume}
              >
                <div className="h-full rounded-full bg-white" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
              </div>
            </div>

            {/* Time */}
            <span className="text-white/60 text-xs tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quality selector */}
            {streams.length > 1 && (
              <select
                value={currentQuality}
                onChange={(e) => setCurrentQuality(Number(e.target.value))}
                className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                {streams.map((s, i) => (
                  <option key={i} value={i} className="bg-[#1a1a2e] text-white">
                    {s.quality}
                  </option>
                ))}
              </select>
            )}

            {/* Current quality badge */}
            {stream.quality && (
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-xs font-medium">
                {stream.quality}
              </span>
            )}

            {/* Fullscreen */}
            <button
              onClick={() => videoRef.current?.requestFullscreen()}
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
