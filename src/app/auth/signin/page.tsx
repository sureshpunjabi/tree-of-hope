'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  // If already signed in, redirect to home
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
        trackEvent('magic_link_failed', { source: 'signin', error: data.error })
      }
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Sign In Form */}
            <div>
              <h1
                className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Sign in.
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] mb-8">
                We&apos;ll email you a link. No passwords.
              </p>

              {status === 'sent' ? (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-8">
                  <h2
                    className="text-xl font-bold text-[var(--color-text)] mb-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Check your email
                  </h2>
                  <p className="text-[var(--color-text-muted)] mb-4">
                    We sent a sign-in link to <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Didn&apos;t receive it? Check your spam folder, or{' '}
                    <button
                      onClick={() => setStatus('idle')}
                      className="text-[var(--color-hope)] hover:underline font-medium"
                    >
                      try again
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] focus:border-transparent"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending' || !email.trim()}
                    className={cn(
                      'w-full inline-flex items-center justify-center',
                      'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                      'text-white font-semibold py-3 px-8 rounded-full text-base',
                      'transition-all duration-200 hover:shadow-lg',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send link'}
                  </button>
                </form>
              )}

              <p className="mt-6 text-sm text-[var(--color-text-muted)]">
                By signing in, you agree to our{' '}
                <Link href="/privacy" className="text-[var(--color-hope)] hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Right: Tree Image */}
            <div className="hidden md:flex justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope"
                width={460}
                height={476}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
