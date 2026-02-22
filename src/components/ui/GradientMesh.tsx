'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated gradient mesh background for dark sections.
 * Creates a living, organic feel with slowly shifting color blobs.
 */
export default function GradientMesh({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.3, y: 0.4, r: 0.5, color: [30, 60, 40], speed: 0.0004 },
      { x: 0.7, y: 0.6, r: 0.45, color: [25, 50, 35], speed: 0.0003 },
      { x: 0.5, y: 0.3, r: 0.4, color: [35, 65, 45], speed: 0.0005 },
      { x: 0.2, y: 0.7, r: 0.35, color: [20, 42, 30], speed: 0.00035 },
      { x: 0.8, y: 0.3, r: 0.35, color: [25, 55, 38], speed: 0.00045 },
    ];

    let raf: number;
    const animate = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;

      // Base dark green fill — consistent deep forest tone
      ctx.fillStyle = '#1a2e1f';
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((blob, i) => {
        const ox = Math.sin(time * blob.speed + i) * 0.1;
        const oy = Math.cos(time * blob.speed * 0.7 + i * 2) * 0.1;

        const gradient = ctx.createRadialGradient(
          (blob.x + ox) * w, (blob.y + oy) * h, 0,
          (blob.x + ox) * w, (blob.y + oy) * h, blob.r * Math.max(w, h)
        );

        const [r, g, b] = blob.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.12)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
