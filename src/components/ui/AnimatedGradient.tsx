'use client';

import { useMemo } from 'react';

interface AnimatedGradientProps {
  className?: string;
  colors?: string[];
  speed?: number;
}

export default function AnimatedGradient({
  className = '',
  colors = ['#4A6741', '#66BB6A', '#FFFAF5', '#D7CCC8'],
  speed = 8,
}: AnimatedGradientProps) {
  const gradientCSS = useMemo(() => {
    const gradientString = colors.join(', ');
    return `
      @keyframes animatedGradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `;
  }, [colors]);

  const gradientString = colors.join(', ');

  return (
    <>
      <style>{gradientCSS}</style>
      <div
        className={`absolute inset-0 z-0 ${className}`}
        style={{
          background: `linear-gradient(135deg, ${gradientString})`,
          backgroundSize: '400% 400%',
          animation: `animatedGradient ${speed}s ease infinite`,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
