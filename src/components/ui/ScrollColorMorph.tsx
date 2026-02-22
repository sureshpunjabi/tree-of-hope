'use client';

import { useEffect, useRef } from 'react';

/**
 * Morphs the page background color as the user scrolls.
 * Creates a living, breathing feel to the page.
 */
export default function ScrollColorMorph() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const colors = [
      { r: 251, g: 250, b: 248 }, // #FBFAF8 - warm cream (top)
      { r: 247, g: 245, b: 240 }, // slightly warmer
      { r: 245, g: 243, b: 238 }, // warm middle
      { r: 248, g: 247, b: 243 }, // cooling back
      { r: 251, g: 250, b: 248 }, // back to cream
    ];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const update = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);

      // Map progress to color stops
      const segment = progress * (colors.length - 1);
      const index = Math.floor(segment);
      const t = segment - index;
      const from = colors[Math.min(index, colors.length - 1)];
      const to = colors[Math.min(index + 1, colors.length - 1)];

      const r = Math.round(lerp(from.r, to.r, t));
      const g = Math.round(lerp(from.g, to.g, t));
      const b = Math.round(lerp(from.b, to.b, t));

      document.documentElement.style.setProperty('--dynamic-bg', `rgb(${r}, ${g}, ${b})`);

      rafRef.current = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return null; // Pure logic component
}
