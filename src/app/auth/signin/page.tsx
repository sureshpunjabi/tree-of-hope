'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  if (user) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('sending')
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          redirectUrl: '/',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('sent')
        trackEvent('magic_link_sent', { source: 'signin' })
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Failed to send magic link')
        trackEvent('magic_link_sent_failed', { source: 'signin', error: data.error })
      }
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 sm:px-6 lg:px-8">
      <section className="w-full max-w-lg">
        <div className="text-center mb-12">
          <p className="text-sm font-light tracking-[0.25em] uppercase text-[var(--color-hope)] mb-6">
            WELCOME BACK
          </p>
          <h1
            className="text-6xl font-light text-[var(--color-text)] leading-tight mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Sign in.
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-muted)] font-light">
            We&apos;ll send you a magic link. No passwords.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="text-center">
            <h2
              className="text-4xl font-light text-[var(--color-text)] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Check your email
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
              We sent a sign-in link to <strong>{email}</strong>. Follow the link to continue.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Didn&apos;t receive it? Check your spam folder, or{' '}
              <button
                onClick={() => setStatus('idle')}
                className="text-[var(--color-hope)] hover:underline font-medium transition-colors"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
                className="w-full px-0 py-4 border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-hope)] transition-colors duration-200 text-base font-light"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
            </div>

            {status === 'error' && (
              <div className="text-center">
                <p className="text-red-600 text-sm font-light">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || !email.trim()}
              className="w-full bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-sm transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {status === 'sending' ? 'Sending link...' : 'Send sign-in link'}
            </button>
          </form>
        )}

        <p className="mt-12 text-center text-sm text-[var(--color-text-muted)] font-light">
          By signing in, you agree to our{' '}
          <Link href="/privacy" className="text-[var(--color-hope)] hover:underline font-medium transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
