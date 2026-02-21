'use client'

import { useEffect } from 'react'

export default function CheckoutPage() {
  useEffect(() => {
    // This page is a pass-through. In a real scenario, Stripe hosting would
    // handle the redirect. This page ensures the user sees a loading state.
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Spinner */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-hope)] to-amber-400 rounded-full animate-spin" />
            <div className="absolute inset-1 bg-[var(--color-bg)] rounded-full" />
          </div>
        </div>

        <h1
          className="font-serif font-bold text-2xl md:text-3xl text-[var(--color-text)] mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Redirecting to secure checkout...
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Please wait while we prepare your payment information. You'll be redirected to our
          secure payment processor shortly.
        </p>

        {/* Info card */}
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
          <p className="text-sm text-[var(--color-text-muted)]">
            If you're not redirected automatically within a few seconds,{' '}
            <button
              onClick={() => window.history.back()}
              className="text-[var(--color-hope)] hover:underline font-semibold"
            >
              please try again
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
