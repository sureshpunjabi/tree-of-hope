'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

interface Campaign {
  id: string
  slug: string
  title: string
  patient_name: string
}

interface FormState {
  name: string
  email: string
  message: string
  showPublicly: boolean
}

interface AuthState {
  status: 'form' | 'email-sent' | 'verifying' | 'error'
  email?: string
  resendCooldown: number
}

export default function WriteLeafPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    message: '',
    showPublicly: true,
  })

  const [authState, setAuthState] = useState<AuthState>({
    status: 'form',
    resendCooldown: 0,
  })

  const [submitting, setSubmitting] = useState(false)
  const [localStorageWarning, setLocalStorageWarning] = useState(false)

  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/campaigns/${slug}`)
        if (!response.ok) {
          setError('Campaign not found')
          return
        }
        const data = await response.json()
        setCampaign(data.campaign)
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }
    fetchCampaign()
  }, [slug])

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const handleMessageFocus = () => {
    trackEvent('leaf_started', { campaign_slug: slug })
  }

  useEffect(() => {
    if (authState.resendCooldown > 0) {
      resendTimerRef.current = setTimeout(() => {
        setAuthState((prev) => ({
          ...prev,
          resendCooldown: prev.resendCooldown - 1,
        }))
      }, 1000)
    }
    return () => {
      if (resendTimerRef.current) clearTimeout(resendTimerRef.current)
    }
  }, [authState.resendCooldown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, showPublicly: e.target.checked }))
  }

  const sendMagicLink = async (email: string) => {
    try {
      setSubmitting(true)
      setLocalStorageWarning(false)

      try {
        sessionStorage.setItem(
          `leaf-draft-${slug}`,
          JSON.stringify({
            name: form.name,
            email: form.email,
            message: form.message,
            showPublicly: form.showPublicly,
          })
        )
      } catch (err) {
        console.warn('localStorage unavailable:', err)
        setLocalStorageWarning(true)
      }

      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectUrl: `${window.location.origin}/c/${slug}/leaf?verifying=true`,
        }),
      })

      if (!response.ok) throw new Error('Failed to send magic link')

      setAuthState({ status: 'email-sent', email, resendCooldown: 60 })
      trackEvent('magic_link_sent', { campaign_slug: slug })
    } catch (err) {
      console.error('Error sending magic link:', err)
      setAuthState({ status: 'error', resendCooldown: 0 })
    } finally {
      setSubmitting(false)
    }
  }

  const submitLeaf = async () => {
    try {
      setSubmitting(true)
      setError(null)

      if (!campaign) throw new Error('Campaign not found')

      if (!user) {
        await sendMagicLink(form.email)
        return
      }

      const response = await fetch(`/api/campaigns/${campaign.id}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: form.showPublicly ? form.name : 'Anonymous',
          message: form.message,
          is_anonymous: !form.showPublicly,
          is_public: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit leaf')

      trackEvent('leaf_submitted', { campaign_slug: slug, author_name: form.name })

      try { sessionStorage.removeItem(`leaf-draft-${slug}`) } catch { /* Ignore */ }

      router.push(`/c/${slug}/commitment`)
    } catch (err) {
      console.error('Error submitting leaf:', err)
      setError('Failed to submit your leaf. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.email.trim()) { setError('Please enter your email'); return }
    if (!form.message.trim()) { setError('Please write a message'); return }
    await submitLeaf()
  }

  const handleResendMagicLink = () => {
    if (authState.email) sendMagicLink(authState.email)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-hope)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Campaign not found</p>
          <Link href="/" className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-3 px-8 rounded-full transition-all duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!campaign) return null

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <div className="text-center">
            <Link
              href={`/c/${slug}`}
              className="inline-flex items-center text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium mb-8 transition-colors text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {campaign.patient_name}&apos;s tree
            </Link>

            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[var(--color-hope)] mb-6">
              Add a leaf
            </p>
            <h1
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.2] mb-8"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Write one message of hope.
            </h1>
          </div>
        </div>
      </section>

      {/* ─── BLOCKQUOTE ─── */}
      <section className="py-12 md:py-16 border-t border-b border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <blockquote className="text-center">
            <p
              className="text-lg md:text-xl text-[var(--color-text-muted)] italic leading-relaxed"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              "The right words at the right time can carry someone through the hardest days."
            </p>
          </blockquote>
        </div>
      </section>

      {/* ─── FORM ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {authState.status === 'email-sent' ? (
            <div className="bg-[var(--color-bg)] rounded-3xl p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">✉️</div>
                <h2
                  className="text-3xl font-bold text-[var(--color-text)] mb-2"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Check your email
                </h2>
                <p className="text-[var(--color-text-muted)]">
                  We&apos;ve sent a magic link to <strong>{authState.email}</strong>
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    <strong>Didn&apos;t receive it?</strong> Check your spam folder.
                  </p>
                </div>

                <a
                  href="https://mail.google.com/mail/u/0/#search/tree+of+hope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-3 px-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                >
                  Open Gmail
                </a>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-[var(--color-text-muted)]">Still nothing?</p>
                <button
                  onClick={handleResendMagicLink}
                  disabled={authState.resendCooldown > 0}
                  className={cn(
                    'font-medium transition-colors',
                    authState.resendCooldown > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[var(--color-hope)] hover:text-[var(--color-hope-hover)]'
                  )}
                >
                  {authState.resendCooldown > 0
                    ? `Resend in ${authState.resendCooldown}s`
                    : 'Resend magic link'}
                </button>
              </div>

              {localStorageWarning && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Your form data wasn&apos;t saved locally. Keep this tab open until you verify your email.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="border-b border-[var(--color-border)] pb-6">
                <label htmlFor="name" className="block text-sm font-semibold text-[var(--color-text)] mb-4">
                  Your name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Sarah Chen"
                  className="w-full bg-transparent text-[var(--color-text)] placeholder-gray-400 focus:outline-none transition-colors py-2"
                />
              </div>

              <div className="border-b border-[var(--color-border)] pb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text)] mb-4">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-[var(--color-text)] placeholder-gray-400 focus:outline-none transition-colors py-2"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-4">
                  Used to verify your identity. Never shared.
                </p>
              </div>

              <div className="border-b border-[var(--color-border)] pb-6">
                <label htmlFor="message" className="block text-sm font-semibold text-[var(--color-text)] mb-4">
                  Your message
                </label>
                <textarea
                  ref={messageInputRef}
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleInputChange}
                  onFocus={handleMessageFocus}
                  placeholder="What would you want to hear if you were in their shoes?"
                  rows={8}
                  className="w-full bg-transparent text-[var(--color-text)] placeholder-gray-400 focus:outline-none transition-colors py-2 resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="showPublicly"
                  checked={form.showPublicly}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 rounded mt-1 border-[var(--color-border)] accent-[var(--color-hope)] cursor-pointer"
                />
                <label htmlFor="showPublicly" className="text-sm text-[var(--color-text)] cursor-pointer flex-1">
                  <span className="font-semibold">Show my name publicly</span>
                  <p className="text-[var(--color-text-muted)] mt-1">
                    Uncheck to remain anonymous. Your message will still be visible.
                  </p>
                </label>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-3 px-12 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>🌱 Add your leaf</>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  By submitting, you agree to our{' '}
                  <Link href="/privacy" className="underline hover:text-[var(--color-hope)]">
                    privacy policy
                  </Link>.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
