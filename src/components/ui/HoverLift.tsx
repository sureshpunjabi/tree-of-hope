'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function HoverLift({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
