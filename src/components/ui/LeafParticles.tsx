'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  shape: number; // 0-2 different leaf shapes
  life: number;
  maxLife: number;
}

const COLORS = [
  'rgba(74, 103, 65, 0.12)',   // hope green
  'rgba(102, 187, 106, 0.10)', // leaf-1
  'rgba(129, 199, 132, 0.08)', // leaf-2
  'rgba(165, 214, 167, 0.07)', // leaf-3
  'rgba(200, 230, 201, 0.06)', // leaf-4
  'rgba(93, 64, 55, 0.06)',    // trunk brown
];

export default function LeafParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      size: 4 + Math.random() * 8,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: 0.15 + Math.random() * 0.35,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      opacity: 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.floor(Math.random() * 3),
      life: 0,
      maxLife: 800 + Math.random() * 600,
    });

    // Initialize particles
    for (let i = 0; i < 25; i++) {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particlesRef.current.push(p);
    }

    const drawLeaf = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      if (p.shape === 0) {
        // Simple oval leaf
        ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
      } else if (p.shape === 1) {
        // Pointed leaf
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size * 0.6, -p.size * 0.3, 0, p.size);
        ctx.quadraticCurveTo(-p.size * 0.6, -p.size * 0.3, 0, -p.size);
      } else {
        // Round leaf
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
      }
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Fade in/out
        if (p.life < 60) {
          p.opacity = p.life / 60;
        } else if (p.life > p.maxLife - 60) {
          p.opacity = (p.maxLife - p.life) / 60;
        } else {
          p.opacity = 1;
        }

        // Movement with wind
        const wind = Math.sin(Date.now() * 0.0003 + p.y * 0.01) * 0.15;
        p.x += p.speedX + wind;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Mouse repulsion (subtle)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.5;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        drawLeaf(ctx, p);

        // Recycle
        if (p.life >= p.maxLife || p.y > canvas.height + 30) {
          particles[i] = createParticle();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
