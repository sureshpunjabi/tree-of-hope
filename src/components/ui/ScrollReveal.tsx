'use client'

import { useRef, useEffect, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is in viewport, make it visible
            if (ref.current) {
              ref.current.classList.remove('opacity-0')
              ref.current.classList.add('opacity-100')

              // Remove translate classes based on direction
              if (direction === 'up') {
                ref.current.classList.remove('translate-y-[30px]')
              } else if (direction === 'down') {
                ref.current.classList.remove('-translate-y-[30px]')
              } else if (direction === 'left') {
                ref.current.classList.remove('translate-x-[30px]')
              } else if (direction === 'right') {
                ref.current.classList.remove('-translate-x-[30px]')
              }
              ref.current.classList.add('translate-0')
            }
            // Disconnect after first intersection to keep it visible
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [direction])

  // Determine initial translate class based on direction
  const getInitialTranslate = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-[30px]'
      case 'down':
        return '-translate-y-[30px]'
      case 'left':
        return 'translate-x-[30px]'
      case 'right':
        return '-translate-x-[30px]'
      default:
        return 'translate-y-[30px]'
    }
  }

  return (
    <div
      ref={ref}
      className={`opacity-0 ${getInitialTranslate()} ${className}`}
      style={{
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
