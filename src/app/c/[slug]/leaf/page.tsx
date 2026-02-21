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

  // Fetch campaign data
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

  // Pre-fill name and email if user is authenticated
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  // Track leaf_started on first focus
  const handleMessageFocus = () => {
    trackEvent('leaf_started', {
      campaign_slug: slug,
    })
  }

  // Resend cooldown timer
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      showPublicly: e.target.checked,
    }))
  }

  const sendMagicLink = async (email: string) => {
    try {
      setSubmitting(true)
      setLocalStorageWarning(false)

      // Store form data in localStorage as backup
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

      // Send magic link
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectUrl: `${window.location.origin}/c/${slug}/leaf?verifying=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send magic link')
      }

      setAuthState({
        status: 'email-sent',
        email,
        resendCooldown: 60,
      })

      trackEvent('magic_link_sent', {
        campaign_slug: slug,
      })
    } catch (err) {
      console.error('Error sending magic link:', err)
      setAuthState({
        status: 'error',
        resendCooldown: 0,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const submitLeaf = async () => {
    try {
      setSubmitting(true)
      setError(null)

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      // If not authenticated, send magic link first
      if (!user) {
        await sendMagicLink(form.email)
        return
      }

      // Submit leaf
      const response = await fetch(
        `/api/campaigns/${campaign.id}/leaves`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization not needed for public leaf submission
          },
          body: JSON.stringify({
            author_name: form.showPublicly ? form.name : 'Anonymous',
            message: form.message,
            is_anonymous: !form.showPublicly,
            is_public: true,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit leaf')
      }

      trackEvent('leaf_submitted', {
        campaign_slug: slug,
        author_name: form.name,
      })

      // Clear draft
      try {
        sessionStorage.removeItem(`leaf-draft-${slug}`)
      } catch {
        // Ignore
      }

      // Redirect to commitment page
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

    if (!form.name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!form.email.trim()) {
      setError('Please enter your email')
      return
    }

    if (!form.message.trim()) {
      setError('Please write a message')
      return
    }

    await submitLeaf()
  }

  const handleResendMagicLink = () => {
    if (authState.email) {
      sendMagicLink(authState.email)
    }
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
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header — PRD design: text left, tree right */}
      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Link
                href={`/c/${slug}`}
                className="inline-flex items-center text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium mb-4 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to campaign
              </Link>

              <h1
                className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Add a leaf.
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                Write one message of hope for <span className="font-semibold">{campaign.patient_name}</span>.
                Keep it simple and true.
              </p>
            </div>
            <div className="hidden md:flex justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope"
                width={340}
                height={352}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {authState.status === 'email-sent' ? (
          /* Email Verification State */
          <div className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Check your email
              </h2>
              <p className="text-[var(--color-text-muted)]">
                We've sent a magic link to <strong>{authState.email}</strong>
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Spam folder tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  <strong>Didn't receive it?</strong> Check your spam folder.
                </p>
              </div>

              {/* Gmail link */}
              <a
                href="https://mail.google.com/mail/u/0/#search/tree+of+hope"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'block text-center py-3 px-4 rounded-lg',
                  'bg-blue-50 border border-blue-200 text-blue-700',
                  'hover:bg-blue-100 transition-colors font-medium'
                )}
              >
                Open Gmail
              </a>
            </div>

            {/* Resend link */}
            <div className="text-center space-y-2">
              <p className="text-sm text-[var(--color-text-muted)]">
                Still nothing?
              </p>
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

            {/* Storage warning */}
            {localStorageWarning && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Your form data wasn't saved locally. We
                  recommend keeping this tab open until you verify your email.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[var(--color-text)] mb-2"
              >
                Your name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Sarah Chen"
                className={cn(
                  'w-full px-4 py-3 rounded-lg border',
                  'bg-white border-[var(--color-border)]',
                  'text-[var(--color-text)] placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]',
                  'transition-colors'
                )}
              />
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[var(--color-text)] mb-2"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={cn(
                  'w-full px-4 py-3 rounded-lg border',
                  'bg-white border-[var(--color-border)]',
                  'text-[var(--color-text)] placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]',
                  'transition-colors'
                )}
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                We use this to verify your identity and authenticate your leaf.
              </p>
            </div>

            {/* Message Input */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-[var(--color-text)] mb-2"
              >
                Your message
              </label>
              <textarea
                ref={messageInputRef}
                id="message"
                name="message"
                value={form.message}
                onChange={handleInputChange}
                onFocus={handleMessageFocus}
                placeholder="Share a word of encouragement, a memory, or why you're supporting this cause..."
                rows={6}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border',
                  'bg-white border-[var(--color-border)]',
                  'text-[var(--color-text)] placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]',
                  'transition-colors resize-none',
                  'font-sans'
                )}
              />
            </div>

            {/* Show publicly checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="showPublicly"
                checked={form.showPublicly}
                onChange={handleCheckboxChange}
                className={cn(
                  'w-5 h-5 rounded mt-1',
                  'border-[var(--color-border)] accent-[var(--color-hope)]',
                  'cursor-pointer'
                )}
              />
              <label
                htmlFor="showPublicly"
                className="text-sm text-[var(--color-text)] cursor-pointer flex-1"
              >
                <span className="font-semibold">Show my name publicly</span>
                <p className="text-[var(--color-text-muted)] mt-1">
                  Uncheck this if you'd prefer to remain anonymous. Your message
                  will still be visible, but your name won't be shown.
                </p>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'w-full btn-primary inline-flex items-center justify-center',
                  'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                  'text-white font-semibold py-3 px-8 rounded-full',
                  'transition-all duration-200 hover:shadow-lg',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="text-lg">🌱</span>
                    Add your leaf to {campaign.patient_name}'s Tree
                  </>
                )}
              </button>
            </div>

            {/* Trust language */}
            <div className="text-center pt-4">
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Your message and profile information are handled securely. By
                submitting, you agree to our{' '}
                <Link href="/privacy" className="underline hover:text-[var(--color-hope)]">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
