'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
  count?: number;
  className?: string;
}

interface FloatingElement {
  id: number;
  size: number;
  startX: number;
  startY: number;
  opacity: number;
  duration: number;
  color: string;
}

export default function FloatingElements({
  count = 6,
  className = '',
}: FloatingElementsProps) {
  const colors = [
    'rgba(34, 197, 94, 0.08)',   // green-500
    'rgba(22, 163, 74, 0.08)',   // green-600
    'rgba(5, 150, 105, 0.08)',   // emerald-600
    'rgba(6, 182, 212, 0.06)',   // cyan-500
    'rgba(16, 185, 129, 0.07)',  // emerald-500
    'rgba(74, 222, 128, 0.07)',  // lime-400
  ];

  const elements = useMemo(() => {
    const generatedElements: FloatingElement[] = [];

    for (let i = 0; i < count; i++) {
      generatedElements.push({
        id: i,
        size: Math.random() * 8 + 4, // 4-12px
        startX: Math.random() * 100, // 0-100% viewport width
        startY: Math.random() * 100, // 0-100% viewport height
        opacity: Math.random() * 0.06 + 0.04, // 0.04-0.1
        duration: Math.random() * 15 + 15, // 15-30s
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    return generatedElements;
  }, [count]);

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {elements.map((element) => (
        <motion.div
          key={element.id}
          style={{
            position: 'absolute',
            left: `${element.startX}%`,
            top: `${element.startY}%`,
            width: element.size,
            height: element.size,
            borderRadius: '50%',
            backgroundColor: element.color,
            pointerEvents: 'none',
          }}
          animate={{
            y: [-20, -1200],
            x: [0, Math.sin(element.id) * 30 - 15],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
