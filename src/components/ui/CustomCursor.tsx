'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Don't show on touch devices
    if ('ontouchstart' in window) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (hidden) setHidden(false);
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // Detect hoverable elements
    const checkHover = () => {
      const el = document.elementFromPoint(target.current.x, target.current.y);
      if (el) {
        const isHoverable = el.closest('a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]');
        setHovering(!!isHoverable);
      }
    };

    const interval = setInterval(checkHover, 100);

    // Smooth follow animation
    let raf: number;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%) scale(${clicking ? 0.8 : hovering ? 1.8 : 1})`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${clicking ? 0.6 : hovering ? 2.2 : 1})`;
      }

      raf = requestAnimationFrame(animate);
    };
    animate();

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const style = document.createElement('style');
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      clearInterval(interval);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = '';
      style.remove();
    };
  }, [hidden, hovering, clicking]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      {/* Trail (outer ring) */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `1.5px solid ${hovering ? 'var(--color-hope)' : 'rgba(74,103,65,0.3)'}`,
          transition: 'width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s',
          opacity: hidden ? 0 : hovering ? 0.8 : 0.4,
          mixBlendMode: 'difference' as const,
        }}
        aria-hidden="true"
      />
      {/* Dot (inner) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--color-hope)',
          transition: 'width 0.2s, height 0.2s, opacity 0.2s',
          opacity: hidden ? 0 : 1,
        }}
        aria-hidden="true"
      />
    </>
  );
}
