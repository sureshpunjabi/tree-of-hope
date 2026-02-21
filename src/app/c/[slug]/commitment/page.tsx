'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { trackEvent } from '@/lib/analytics'
import { STRIPE_PRODUCTS } from '@/lib/stripe'
import { cn } from '@/lib/utils'

type JoiningGiftTier = 'seedling' | 'sapling' | 'mightyOak' | null
type MonthlyTier = 'nurture' | 'sustain' | 'flourish' | null

export default function CommitmentPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [patientName, setPatientName] = useState<string>('this patient')
  const [joiningGift, setJoiningGift] = useState<JoiningGiftTier>(null)
  const [monthlyTier, setMonthlyTier] = useState<MonthlyTier>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track page view on mount
  useEffect(() => {
    trackEvent('commitment_viewed', { slug })

    // Fetch campaign data to get patient name
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/public/campaigns/${slug}`)
        if (response.ok) {
          const data = await response.json()
          const campaign = data.campaign || data
          setPatientName(campaign.patient_name || campaign.title || 'this patient')
        }
      } catch (err) {
        console.error('Failed to fetch campaign:', err)
      }
    }

    fetchCampaign()
  }, [slug])

  const joiningGiftTiers = [
    {
      id: 'seedling' as const,
      name: 'Seedling',
      price: 9.99,
      description: 'A seed of support',
    },
    {
      id: 'sapling' as const,
      name: 'Sapling',
      price: 24.99,
      description: 'Watch it grow',
    },
    {
      id: 'mightyOak' as const,
      name: 'Mighty Oak',
      price: 99.0,
      description: 'Deep roots of care',
    },
  ]

  const monthlyTiers = [
    {
      id: 'nurture' as const,
      name: 'Nurture',
      price: 9,
      description: 'Steady presence',
    },
    {
      id: 'sustain' as const,
      name: 'Sustain',
      price: 19,
      description: 'Growing support',
      featured: true,
    },
    {
      id: 'flourish' as const,
      name: 'Flourish',
      price: 35,
      description: 'Full canopy of care',
    },
  ]

  const calculateTotal = () => {
    let total = 0

    if (joiningGift) {
      const giftAmount =
        STRIPE_PRODUCTS.joiningGifts[joiningGift].amount / 100
      total += giftAmount
    }

    if (monthlyTier) {
      const monthlyAmount =
        STRIPE_PRODUCTS.monthlyTiers[monthlyTier].amount / 100
      total += monthlyAmount
    }

    return total.toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!monthlyTier) {
      setError('Please select a monthly commitment tier')
      return
    }

    setLoading(true)
    setError(null)

    try {
      trackEvent('checkout_started', {
        slug,
        joiningGift: joiningGift || 'none',
        monthlyTier,
      })

      const response = await fetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: slug,
          monthly_tier: monthlyTier,
          joining_gift_tier: joiningGift,
          success_url: `${window.location.origin}/c/${slug}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/c/${slug}/commitment`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Failed to initiate checkout. Please try again.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      )
      setLoading(false)
    }
  }

  const handleTierSelect = (tier: JoiningGiftTier | MonthlyTier, type: 'joining' | 'monthly') => {
    if (type === 'joining') {
      setJoiningGift(tier as JoiningGiftTier)
    } else {
      setMonthlyTier(tier as MonthlyTier)
      trackEvent('tier_selected', { slug, tier })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section — PRD design */}
      <div className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1
                className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Make a commitment.
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] mb-2">
                Today is a one-time start. Monthly support continues quietly in the background.
              </p>
              <p className="text-[var(--color-text-muted)]">
                You can pause for hardship at any time.
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

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: Joining Gift */}
        <div className="mb-16">
          <h2
            className="font-serif font-bold text-2xl md:text-3xl text-[var(--color-text)] mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Joining Gift (optional)
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            Make an optional one-time contribution to get started
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {joiningGiftTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleTierSelect(tier.id, 'joining')}
                className={cn(
                  'tier-card relative rounded-lg border-2 p-6 text-left transition-all duration-200',
                  joiningGift === tier.id
                    ? 'border-[var(--color-hope)] bg-amber-50 ring-2 ring-[var(--color-hope)] ring-opacity-20'
                    : 'border-[var(--color-border)] hover:border-[var(--color-hope)]'
                )}
              >
                {/* Radio indicator */}
                <div
                  className={cn(
                    'absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all',
                    joiningGift === tier.id
                      ? 'border-[var(--color-hope)] bg-[var(--color-hope)]'
                      : 'border-[var(--color-border)]'
                  )}
                >
                  {joiningGift === tier.id && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg text-[var(--color-text)] mb-1">
                  {tier.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  {tier.description}
                </p>
                <p className="font-serif text-3xl font-bold text-[var(--color-hope)]">
                  ${tier.price.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Monthly Commitment */}
        <div className="mb-16">
          <h2
            className="font-serif font-bold text-2xl md:text-3xl text-[var(--color-text)] mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Monthly Commitment (required)
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            Choose a monthly contribution. Commit to supporting this patient's journey.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {monthlyTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleTierSelect(tier.id, 'monthly')}
                className={cn(
                  'tier-card relative rounded-lg border-2 p-6 text-left transition-all duration-200',
                  tier.featured && 'ring-2 ring-[var(--color-hope)] ring-opacity-20',
                  monthlyTier === tier.id
                    ? 'border-[var(--color-hope)] bg-amber-50'
                    : 'border-[var(--color-border)] hover:border-[var(--color-hope)]'
                )}
              >
                {/* Featured badge */}
                {tier.featured && (
                  <div className="absolute top-3 right-3 bg-[var(--color-hope)] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most chosen
                  </div>
                )}

                {/* Radio indicator */}
                <div
                  className={cn(
                    'absolute bottom-6 right-6 w-5 h-5 rounded-full border-2 transition-all',
                    monthlyTier === tier.id
                      ? 'border-[var(--color-hope)] bg-[var(--color-hope)]'
                      : 'border-[var(--color-border)]'
                  )}
                >
                  {monthlyTier === tier.id && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg text-[var(--color-text)] mb-1">
                  {tier.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  {tier.description}
                </p>
                <p className="font-serif text-3xl font-bold text-[var(--color-hope)]">
                  ${tier.price}/mo
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Bar */}
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 md:p-8 sticky bottom-0 z-40 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text-muted)] mb-2">
                Order summary
              </p>
              <div className="space-y-1">
                {joiningGift && (
                  <div className="text-sm text-[var(--color-text)]">
                    {joiningGiftTiers.find((t) => t.id === joiningGift)?.name} —{' '}
                    ${joiningGiftTiers.find((t) => t.id === joiningGift)?.price.toFixed(2)}
                  </div>
                )}
                {monthlyTier && (
                  <div className="text-sm text-[var(--color-text)]">
                    {monthlyTiers.find((t) => t.id === monthlyTier)?.name} (monthly) —{' '}
                    ${monthlyTiers.find((t) => t.id === monthlyTier)?.price}/mo
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-hope)]">
                  Total first payment: ${calculateTotal()}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!monthlyTier || loading}
              className={cn(
                'btn-primary whitespace-nowrap px-8 py-3 rounded-full font-semibold transition-all duration-200',
                monthlyTier
                  ? 'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white cursor-pointer'
                  : 'bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
              )}
            >
              {loading ? 'Processing...' : 'Continue to checkout'}
            </button>
          </div>
        </div>
      </form>

      {/* Trust Language */}
      <div className="mt-32 py-12 bg-amber-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="trust-language">
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Tree of Hope is a for-profit service. Your contribution funds the
              Sanctuary and ongoing platform operations. It is not sent to the
              patient.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
