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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                Welcome back
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Sign in.
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                We&apos;ll email you a link. No passwords needed.
              </p>

              {status === 'sent' ? (
                <div className="bg-white rounded-3xl border border-[var(--color-border)] p-8 md:p-10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-5xl mb-4">✉️</div>
                  <h2
                    className="text-2xl font-bold text-[var(--color-text)] mb-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Check your email
                  </h2>
                  <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">
                    We sent a sign-in link to <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold tracking-widest uppercase text-[var(--color-text)] mb-3">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
                      <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending' || !email.trim()}
                    className="w-full inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:-translate-y-0"
                  >
                    {status === 'sending' ? 'Sending link...' : 'Send sign-in link'}
                  </button>
                </form>
              )}

              <p className="mt-8 text-sm text-[var(--color-text-muted)] leading-relaxed">
                By signing in, you agree to our{' '}
                <Link href="/privacy" className="text-[var(--color-hope)] hover:underline font-medium transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="relative hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-hope)] to-transparent opacity-[0.08] rounded-full blur-3xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--color-hope)] to-transparent opacity-[0.06] rounded-full blur-2xl scale-100" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={460}
                  height={476}
                  className="relative z-10 drop-shadow-2xl transition-all duration-300 hover:drop-shadow-3xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
