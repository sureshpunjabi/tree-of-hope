'use client';

import { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glare?: boolean;
  scale?: number;
}

export default function TiltCard({
  children,
  className = '',
  tiltAmount = 8,
  glare = true,
  scale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

  const rotateXSpring = useSpring(rotateX, {
    stiffness: 300,
    damping: 30,
  });

  const rotateYSpring = useSpring(rotateY, {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotationX = (mouseY / (rect.height / 2)) * -tiltAmount;
    const rotationY = (mouseX / (rect.width / 2)) * tiltAmount;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    // Update glare position
    if (glare) {
      const glareX = (mouseX / (rect.width / 2)) * 50 + 50;
      const glareY = (mouseY / (rect.height / 2)) * 50 + 50;
      setGlarePosition({ x: glareX, y: glareY });
    }
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <motion.div
      ref={ref}
      className={`${className}`}
      style={{
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
        }}
        whileHover={{ scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full h-full"
      >
        {children}

        {glare && isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-inherit"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)`,
              opacity: 0.1,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
