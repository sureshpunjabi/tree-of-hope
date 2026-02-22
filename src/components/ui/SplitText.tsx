'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  style?: React.CSSProperties;
}

export default function SplitText({
  children,
  className = '',
  delay = 0,
  as = 'h2',
  style,
}: SplitTextProps) {
  const words = children.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay / 1000,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  const Component = motion[as as keyof typeof motion] as any;

  return (
    <Component
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {words.map((word, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            marginRight: '0.25em',
          }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            variants={wordVariants}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
