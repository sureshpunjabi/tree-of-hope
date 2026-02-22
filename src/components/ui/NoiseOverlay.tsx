'use client';

import { useEffect, useRef } from 'react';

export default function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Small canvas, scaled up via CSS for performance
    canvas.width = 200;
    canvas.height = 200;

    const imageData = ctx.createImageData(200, 200);
    const data = imageData.data;

    const generateNoise = () => {
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 12; // Very subtle
      }
      ctx.putImageData(imageData, 0, 0);
    };

    generateNoise();

    // Regenerate slowly for subtle movement
    const interval = setInterval(generateNoise, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        width: '100vw',
        height: '100vh',
        opacity: 0.4,
        mixBlendMode: 'overlay',
      }}
      aria-hidden="true"
    />
  );
}
