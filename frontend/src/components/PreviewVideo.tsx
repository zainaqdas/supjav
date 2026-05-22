'use client';

interface PreviewVideoProps {
  src: string;
}

export default function PreviewVideo({ src }: PreviewVideoProps) {
  return (
    <video
      src={src}
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      onMouseEnter={(e) => {
        (e.target as HTMLVideoElement).play().catch(() => {});
      }}
      onMouseLeave={(e) => {
        const video = e.target as HTMLVideoElement;
        video.pause();
        video.currentTime = 0;
      }}
    />
  );
}
