'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[var(--color-hope)]/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-[28px]">🌿</span>
          </div>
          <h1
            className="text-[32px] font-semibold text-[var(--color-text)] tracking-[-0.02em] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Something went wrong.
          </h1>
          <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
            We hit an unexpected bump. This has been noted, and we&apos;re looking into it.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-[var(--color-hope)] text-white font-medium py-3 px-7 rounded-full text-[15px] transition-all duration-300 hover:bg-[var(--color-hope-hover)] hover:shadow-lg hover:shadow-[var(--color-hope)]/20"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
