'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import CountUp from './CountUp'

/**
 * Animated impact statistics section.
 * Numbers count up when scrolled into view.
 * Apple-style minimal design with large typography.
 */
export default function ImpactNumbers() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { value: 5, suffix: ' days', label: 'To build a circle of care' },
    { value: 30, suffix: ' days', label: 'Of guided Sanctuary content' },
    { value: 100, suffix: '%', label: 'Private & transparent' },
  ]

  return (
    <section
      ref={ref}
      className="py-16 md:py-28"
      style={{ backgroundColor: 'rgba(245, 245, 240, 0.4)' }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="transition-all duration-700"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <div
                className="text-[clamp(3rem,6vw,4.5rem)] font-semibold text-[var(--color-text)] tracking-[-0.04em] leading-none mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {isInView ? (
                  <CountUp end={stat.value} duration={1.8} suffix={stat.suffix} />
                ) : (
                  <span>0{stat.suffix}</span>
                )}
              </div>
              <p className="text-[14px] text-[var(--color-text-muted)] tracking-[-0.01em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
