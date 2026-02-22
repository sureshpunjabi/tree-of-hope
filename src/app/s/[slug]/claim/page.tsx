'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

export default function SanctuaryClaimPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const slug = params?.slug as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Send magic link
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirect_to: `/s/${slug}` }),
      })

      if (!response.ok) {
        throw new Error('Failed to send magic link')
      }

      setSubmitted(true)
      trackEvent('magic_link_sent', { email }, slug)

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/s/${slug}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      trackEvent('magic_link_sent_failed', { email }, slug)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sanctuary-bg min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-4xl font-bold text-center mb-4 text-[var(--color-text)]">
            A Sanctuary has been prepared for you
          </h1>

          <p className="text-center text-[var(--color-text-muted)] mb-8 leading-relaxed">
            Welcome to your Sanctuary. This is a private space — just for you and anyone you choose to invite. Over the next 30 days, we'll walk with you. One day at a time.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">
                Check your email for your magic link. We're redirecting you now...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Claim your Sanctuary'}
              </button>
            </form>
          )}

          <p className="trust-language mt-8">
            We'll send you a secure magic link to access your Sanctuary. No password needed. Your privacy is our promise.
          </p>
        </div>
      </div>
    </div>
  )
}
