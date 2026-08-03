import { ImageResponse } from 'next/og';

export const alt = 'Watch JAV Online in HD — Free Japanese Adult Video Streaming | JavOnlineHD';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: '#0a0a0f',
        }}
      >
        {/* Decorative glow circles */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            left: -160,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(220,38,38,0.45), rgba(220,38,38,0.05))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            right: -140,
            width: 640,
            height: 640,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.45), rgba(37,99,235,0.05))',
          }}
        />
        {/* Thin accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #dc2626, #3b82f6)',
          }}
        />

        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 28 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: '16px solid transparent',
                borderBottom: '16px solid transparent',
                borderLeft: '26px solid #ffffff',
                marginLeft: 6,
              }}
            />
          </div>
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>
            <span style={{ color: '#ffffff' }}>JavOnline</span>
            <span style={{ color: '#f87171' }}>HD</span>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 34, color: 'rgba(255,255,255,0.85)', marginBottom: 18 }}>
          Watch JAV Online in HD — Free Streaming
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: 'rgba(255,255,255,0.5)',
            gap: 14,
            marginTop: 8,
          }}
        >
          Censored &amp; Uncensored&nbsp;·&nbsp;Categories&nbsp;·&nbsp;Actresses&nbsp;·&nbsp;Studios
        </div>
      </div>
    ),
    { ...size }
  );
}
