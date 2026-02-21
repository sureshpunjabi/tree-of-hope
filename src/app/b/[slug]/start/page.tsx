'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import { STRIPE_PRODUCTS, type MonthlyTier, type JoiningGiftTier } from '@/lib/stripe'

interface BridgeData {
  success: boolean
  campaign?: {
    id: string
    slug: string
    title: string
    patient_name: string
    story?: string
    current_cents: number
    supporter_count?: number
    leaf_count?: number
  }
  bridge?: {
    id: string
    gofundme_url: string
    gofundme_raised_cents?: number
    gofundme_donor_count?: number
  }
  leaves?: Array<{
    id: string
    author_name: string
    message: string
    position_x: number | null
    position_y: number | null
    created_at: string
  }>
  error?: string
}

interface FormData {
  name: string
  email: string
  message: string
  monthlyTier: MonthlyTier | ''
  joiningGiftTier: JoiningGiftTier | ''
}

export default function BridgeActivatePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const formRef = useRef<HTMLFormElement>(null)

  const [campaign, setCampaign] = useState<BridgeData['campaign'] | null>(null)
  const [bridge, setBridge] = useState<BridgeData['bridge'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    monthlyTier: '',
    joiningGiftTier: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/bridge/${slug}`)
        const result: BridgeData = await response.json()

        if (!result.success || !result.campaign) {
          setError(result.error || 'Failed to load campaign')
          return
        }

        setCampaign(result.campaign)
        setBridge(result.bridge || null)

        // Track activation started
        await trackEvent('bridge_activate_started', {
          campaign_id: result.campaign.id,
          campaign_slug: slug,
        })
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const handleFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormError(null)
  }

  const handleTierChange = (tier: MonthlyTier) => {
    setFormData((prev) => ({
      ...prev,
      monthlyTier: tier,
    }))
    setFormError(null)
  }

  const handleGiftTierChange = (tier: JoiningGiftTier | '') => {
    setFormData((prev) => ({
      ...prev,
      joiningGiftTier: tier,
    }))
  }

  const handleFormFocus = async () => {
    if (campaign?.id) {
      await trackEvent('bridge_activate_form_focused', {
        campaign_id: campaign.id,
        campaign_slug: slug,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    // Validate form
    if (!formData.name.trim()) {
      setFormError('Please enter your name')
      return
    }

    if (!formData.email.trim()) {
      setFormError('Please enter your email address')
      return
    }

    if (!formData.message.trim()) {
      setFormError('Please write a message of hope')
      return
    }

    if (!formData.monthlyTier) {
      setFormError('Please select a monthly commitment')
      return
    }

    if (!campaign?.id) {
      setFormError('Campaign information is missing')
      return
    }

    try {
      setSubmitting(true)

      // Track submission
      await trackEvent('bridge_activate_submitted', {
        campaign_id: campaign.id,
        campaign_slug: slug,
        monthly_tier: formData.monthlyTier,
        has_joining_gift: !!formData.joiningGiftTier,
      })

      // Get current URL for success/cancel
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const successUrl = `${baseUrl}/c/${slug}/thank-you`
      const cancelUrl = `${baseUrl}/b/${slug}/start`

      // Call bridge activate API
      const response = await fetch('/api/bridge/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          author_name: formData.name,
          message: formData.message,
          email: formData.email,
          monthly_tier: formData.monthlyTier,
          joining_gift_tier: formData.joiningGiftTier || undefined,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setFormError(result.error || 'Failed to process your leaf. Please try again.')
        return
      }

      // Track checkout started
      await trackEvent('bridge_checkout_started', {
        campaign_id: campaign.id,
        campaign_slug: slug,
        leaf_id: result.leaf_id,
      })

      // Redirect to Stripe checkout
      if (result.checkout_url) {
        window.location.href = result.checkout_url
      } else {
        setFormError('Failed to create checkout session. Please try again.')
      }
    } catch (err) {
      console.error('Error submitting leaf:', err)
      setFormError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-leaf-1)] border-t-[var(--color-hope)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text)] mb-3">
            Campaign not found
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            {error || 'We couldn\'t find the campaign you\'re looking for.'}
          </p>
          <Link href="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4">
            Add your leaf to{' '}
            <span className="text-[var(--color-hope)]">{campaign.patient_name}'s</span> Tree
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            Your message and commitment will help them feel supported every single day.
          </p>
        </div>

        {/* Main Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Write Your Leaf */}
          <section className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm">
            <h2 className="font-serif font-bold text-2xl text-[var(--color-text)] mb-6">
              Write your leaf
            </h2>

            <div className="space-y-6">
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
                  value={formData.name}
                  onChange={handleFormInputChange}
                  onFocus={handleFormFocus}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)]"
                  required
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
                  value={formData.email}
                  onChange={handleFormInputChange}
                  onFocus={handleFormFocus}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)]"
                  required
                />
              </div>

              {/* Message Input */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-[var(--color-text)] mb-2"
                >
                  Your message of hope
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleFormInputChange}
                  onFocus={handleFormFocus}
                  placeholder="Write something that would mean the world to them..."
                  rows={6}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] resize-none"
                  required
                />
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  {formData.message.length} characters
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Choose Commitment */}
          <section className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm">
            <h2 className="font-serif font-bold text-2xl text-[var(--color-text)] mb-3">
              Choose your commitment
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              Your leaf is your message. Your commitment is your presence. Choose how you'd like to
              show up for <strong>{campaign.patient_name}</strong> each month.
            </p>

            {/* Monthly Tier Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {/* Nurture Tier */}
              <button
                type="button"
                onClick={() => handleTierChange('nurture')}
                className={cn(
                  'p-6 rounded-lg border-2 transition-all duration-200 text-left',
                  formData.monthlyTier === 'nurture'
                    ? 'border-[var(--color-hope)] bg-amber-50'
                    : 'border-[var(--color-border)] bg-white hover:border-[var(--color-leaf-1)]'
                )}
              >
                <p className="font-serif font-bold text-lg text-[var(--color-text)]">Nurture</p>
                <p className="text-3xl font-bold text-[var(--color-hope)] my-2">$9</p>
                <p className="text-sm text-[var(--color-text-muted)]">per month</p>
              </button>

              {/* Sustain Tier */}
              <button
                type="button"
                onClick={() => handleTierChange('sustain')}
                className={cn(
                  'p-6 rounded-lg border-2 transition-all duration-200 text-left',
                  formData.monthlyTier === 'sustain'
                    ? 'border-[var(--color-hope)] bg-amber-50'
                    : 'border-[var(--color-border)] bg-white hover:border-[var(--color-leaf-1)]'
                )}
              >
                <p className="font-serif font-bold text-lg text-[var(--color-text)]">Sustain</p>
                <p className="text-3xl font-bold text-[var(--color-hope)] my-2">$19</p>
                <p className="text-sm text-[var(--color-text-muted)]">per month</p>
              </button>

              {/* Flourish Tier */}
              <button
                type="button"
                onClick={() => handleTierChange('flourish')}
                className={cn(
                  'p-6 rounded-lg border-2 transition-all duration-200 text-left',
                  formData.monthlyTier === 'flourish'
                    ? 'border-[var(--color-hope)] bg-amber-50'
                    : 'border-[var(--color-border)] bg-white hover:border-[var(--color-leaf-1)]'
                )}
              >
                <p className="font-serif font-bold text-lg text-[var(--color-text)]">Flourish</p>
                <p className="text-3xl font-bold text-[var(--color-hope)] my-2">$35</p>
                <p className="text-sm text-[var(--color-text-muted)]">per month</p>
              </button>
            </div>

            {/* Joining Gift Section */}
            <div className="border-t border-[var(--color-border)] pt-8">
              <p className="font-semibold text-[var(--color-text)] mb-4">
                Optional: Add a joining gift (one-time)
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Seedling */}
                <button
                  type="button"
                  onClick={() =>
                    handleGiftTierChange(formData.joiningGiftTier === 'seedling' ? '' : 'seedling')
                  }
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-200 text-sm text-left',
                    formData.joiningGiftTier === 'seedling'
                      ? 'border-[var(--color-leaf-1)] bg-green-50'
                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-leaf-1)]'
                  )}
                >
                  <p className="font-semibold text-[var(--color-text)]">Seedling</p>
                  <p className="text-[var(--color-hope)] font-bold">$9.99</p>
                </button>

                {/* Sapling */}
                <button
                  type="button"
                  onClick={() =>
                    handleGiftTierChange(formData.joiningGiftTier === 'sapling' ? '' : 'sapling')
                  }
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-200 text-sm text-left',
                    formData.joiningGiftTier === 'sapling'
                      ? 'border-[var(--color-leaf-1)] bg-green-50'
                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-leaf-1)]'
                  )}
                >
                  <p className="font-semibold text-[var(--color-text)]">Sapling</p>
                  <p className="text-[var(--color-hope)] font-bold">$24.99</p>
                </button>

                {/* Mighty Oak */}
                <button
                  type="button"
                  onClick={() =>
                    handleGiftTierChange(
                      formData.joiningGiftTier === 'mightyOak' ? '' : 'mightyOak'
                    )
                  }
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-200 text-sm text-left',
                    formData.joiningGiftTier === 'mightyOak'
                      ? 'border-[var(--color-leaf-1)] bg-green-50'
                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-leaf-1)]'
                  )}
                >
                  <p className="font-semibold text-[var(--color-text)]">Mighty Oak</p>
                  <p className="text-[var(--color-hope)] font-bold">$99.00</p>
                </button>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-800">{formError}</p>
            </div>
          )}

          {/* Trust Language */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <p className="text-sm text-[var(--color-text)]">
              <strong>Tree of Hope is a for-profit service.</strong> Your contribution funds the
              Sanctuary and ongoing platform operations. It is not sent to the patient.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'btn-primary inline-flex items-center justify-center gap-2 flex-1 sm:flex-none',
                'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                'text-white font-semibold py-4 px-8 rounded-full',
                'transition-all duration-200 hover:shadow-lg text-lg',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  <span>Plant your leaf & commit</span>
                </>
              )}
            </button>
          </div>

          {/* GoFundMe Link */}
          {bridge?.gofundme_url && (
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Want to help with a one-time donation?{' '}
                <a
                  href={bridge.gofundme_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-hope)] font-semibold hover:underline"
                >
                  View their GoFundMe
                </a>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
