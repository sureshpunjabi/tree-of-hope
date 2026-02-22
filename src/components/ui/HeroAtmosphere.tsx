'use client';

import { useEffect, useRef } from 'react';

/**
 * Floating dust motes / warm light particles behind the hero.
 * Pure canvas — lightweight and GPU-friendly.
 */
export default function HeroAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particles — soft warm motes
    interface Mote {
      x: number; y: number;
      vx: number; vy: number;
      size: number; opacity: number;
      phase: number; speed: number;
      color: string;
    }

    const W = () => canvas.width / dpr;
    const H = () => canvas.height / dpr;

    const motes: Mote[] = [];
    const MOTE_COUNT = 18;

    const warmColors = [
      'rgba(180, 160, 120,', // warm gold
      'rgba(160, 180, 140,', // soft sage
      'rgba(200, 180, 150,', // cream gold
      'rgba(140, 170, 130,', // muted green
      'rgba(190, 170, 140,', // warm tan
    ];

    for (let i = 0; i < MOTE_COUNT; i++) {
      motes.push({
        x: Math.random() * 1200,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.12,
        size: 2 + Math.random() * 4,
        opacity: 0.08 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        color: warmColors[Math.floor(Math.random() * warmColors.length)],
      });
    }

    const animate = (t: number) => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // Warm ambient radial glow behind terrarium area
      const grd = ctx.createRadialGradient(w / 2, h * 0.55, 20, w / 2, h * 0.55, w * 0.4);
      grd.addColorStop(0, 'rgba(200, 180, 140, 0.06)');
      grd.addColorStop(0.5, 'rgba(180, 200, 160, 0.03)');
      grd.addColorStop(1, 'rgba(200, 180, 140, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Draw motes
      for (const m of motes) {
        const pulse = Math.sin(t * 0.001 * m.speed + m.phase) * 0.5 + 0.5;
        const sway = Math.sin(t * 0.0005 + m.phase) * 15;

        m.x += m.vx + Math.sin(t * 0.0003 + m.phase) * 0.08;
        m.y += m.vy;

        // Wrap
        if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;

        const drawX = m.x + sway;
        const drawY = m.y;
        const alpha = m.opacity * (0.4 + pulse * 0.6);
        const s = m.size * (0.8 + pulse * 0.4);

        ctx.beginPath();
        ctx.arc(drawX, drawY, s, 0, Math.PI * 2);
        ctx.fillStyle = m.color + alpha + ')';
        ctx.fill();

        // Soft glow
        ctx.beginPath();
        ctx.arc(drawX, drawY, s * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = m.color + (alpha * 0.2) + ')';
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
