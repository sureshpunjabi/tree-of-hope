'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface TextRevealProps {
  children: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export default function TextReveal({ children, className = '', style, delay = 0, as: Tag = 'h1' }: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const words = children.split(' ')

  return (
    <Tag ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.08,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}
