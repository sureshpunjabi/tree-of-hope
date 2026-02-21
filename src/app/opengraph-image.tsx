import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Tree of Hope — Community fundraising with roots'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFFAF5',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div style={{ fontSize: '72px', marginBottom: '8px' }}>🌿</div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#3E2723',
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: '900px',
              fontFamily: 'serif',
            }}
          >
            Tree of Hope
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#795548',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            Every tree starts with a single leaf. Turn community support into lasting care.
          </div>
          <div
            style={{
              marginTop: '16px',
              padding: '14px 40px',
              backgroundColor: '#4A6741',
              color: 'white',
              borderRadius: '40px',
              fontSize: '22px',
              fontWeight: 600,
            }}
          >
            treeofhope.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
