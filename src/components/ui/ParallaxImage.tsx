'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

interface ParallaxImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  speed?: number
  priority?: boolean
}

export default function ParallaxImage({ src, alt, width, height, className = '', speed = 0.3, priority = false }: ParallaxImageProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100])

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
        />
      </motion.div>
    </div>
  )
}
