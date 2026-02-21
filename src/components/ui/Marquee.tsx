'use client';

import { ReactNode, CSSProperties } from 'react';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}

export default function Marquee({
  children,
  className = '',
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
}: MarqueeProps) {
  const marqueeStyle: CSSProperties = {
    animationDuration: `${speed}s`,
    animationDirection: direction === 'right' ? 'reverse' : 'normal',
  };

  const containerStyle: CSSProperties = {
    overflow: 'hidden',
  };

  const innerStyle: CSSProperties = {
    display: 'flex',
    animation: 'marquee linear infinite',
    ...marqueeStyle,
    ...(pauseOnHover && {
      animationPlayState: 'paused',
    }),
  };

  return (
    <>
      <style>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
      <div style={containerStyle} className={className}>
        <div
          style={innerStyle}
          onMouseEnter={(e) => {
            if (pauseOnHover) {
              e.currentTarget.style.animationPlayState = 'paused';
            }
          }}
          onMouseLeave={(e) => {
            if (pauseOnHover) {
              e.currentTarget.style.animationPlayState = 'running';
            }
          }}
        >
          <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
            {children}
          </div>
          <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
