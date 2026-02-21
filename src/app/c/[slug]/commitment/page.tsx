'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { trackEvent } from '@/lib/analytics'
import { STRIPE_PRODUCTS } from '@/lib/stripe-products'
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

  useEffect(() => {
    trackEvent('commitment_viewed', { slug })

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
      icon: '🌱',
    },
    {
      id: 'sapling' as const,
      name: 'Sapling',
      price: 24.99,
      description: 'Watch it grow',
      icon: '🌿',
    },
    {
      id: 'mightyOak' as const,
      name: 'Mighty Oak',
      price: 99.0,
      description: 'Deep roots of care',
      icon: '🌳',
    },
  ]

  const monthlyTiers = [
    {
      id: 'nurture' as const,
      name: 'Nurture',
      price: 9,
      description: 'Steady presence',
      icon: '💚',
    },
    {
      id: 'sustain' as const,
      name: 'Sustain',
      price: 19,
      description: 'Growing support',
      featured: true,
      icon: '🌿',
    },
    {
      id: 'flourish' as const,
      name: 'Flourish',
      price: 35,
      description: 'Full canopy of care',
      icon: '🌳',
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

      const data = await response.json()

      // Handle demo mode gracefully
      if (data.demo) {
        setError(data.error)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

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
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                Make a commitment
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Support with
                <br />
                <span className="text-[var(--color-hope)]">roots that hold.</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
                Today is a one-time start. Monthly support continues quietly in the
                background. You can pause for hardship at any time.
              </p>
            </div>

            <div className="relative hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-110" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={400}
                  height={414}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMITMENT FORM ─── */}
      <form onSubmit={handleSubmit}>
        {/* Joining Gift Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
                Optional
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Joining Gift
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mt-4 max-w-lg mx-auto">
                Make an optional one-time contribution to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {joiningGiftTiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierSelect(tier.id, 'joining')}
                  className={cn(
                    'relative rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1',
                    joiningGift === tier.id
                      ? 'bg-gradient-to-b from-[#e8f0e4] to-[#d5e0d2] ring-2 ring-[var(--color-hope)] shadow-lg'
                      : 'bg-[var(--color-bg)] hover:shadow-lg border border-[var(--color-border)]'
                  )}
                >
                  <div className="text-3xl mb-4">{tier.icon}</div>
                  <h3
                    className="text-lg font-bold text-[var(--color-text)] mb-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {tier.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    {tier.description}
                  </p>
                  <p
                    className="text-3xl font-bold text-[var(--color-hope)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    ${tier.price.toFixed(2)}
                  </p>

                  {joiningGift === tier.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[var(--color-hope)] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Monthly Commitment Section */}
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
                Required
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Monthly Commitment
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mt-4 max-w-lg mx-auto">
                Choose a monthly contribution. Pause anytime for hardship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {monthlyTiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierSelect(tier.id, 'monthly')}
                  className={cn(
                    'relative rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1',
                    tier.featured && !monthlyTier && 'ring-2 ring-[var(--color-hope)] ring-opacity-40',
                    monthlyTier === tier.id
                      ? 'bg-gradient-to-b from-[#e8f0e4] to-[#d5e0d2] ring-2 ring-[var(--color-hope)] shadow-lg'
                      : 'bg-white hover:shadow-lg border border-[var(--color-border)]'
                  )}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-hope)] text-white text-xs font-bold px-4 py-1 rounded-full tracking-wider uppercase">
                      Most chosen
                    </div>
                  )}

                  <div className="text-3xl mb-4">{tier.icon}</div>
                  <h3
                    className="text-lg font-bold text-[var(--color-text)] mb-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {tier.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    {tier.description}
                  </p>
                  <p
                    className="text-3xl font-bold text-[var(--color-hope)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    ${tier.price}<span className="text-lg font-normal text-[var(--color-text-muted)]">/mo</span>
                  </p>

                  {monthlyTier === tier.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[var(--color-hope)] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SUMMARY BAR (Sticky on mobile) ─── */}
        <section className="border-t border-[var(--color-border)] bg-white sticky bottom-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              <div className="flex-1 hidden md:block">
                <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
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
                  <p
                    className="text-xl font-bold text-[var(--color-hope)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Total first payment: ${calculateTotal()}
                  </p>
                </div>
              </div>

              {/* Mobile: compact summary + button */}
              <div className="flex md:hidden items-center justify-between w-full gap-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">First payment</p>
                  <p
                    className="text-xl font-bold text-[var(--color-hope)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    ${calculateTotal()}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!monthlyTier || loading}
                  className={cn(
                    'whitespace-nowrap py-3 px-8 rounded-full font-semibold text-sm transition-all duration-200',
                    monthlyTier
                      ? 'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white cursor-pointer hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </div>

              {/* Desktop button */}
              <button
                type="submit"
                disabled={!monthlyTier || loading}
                className={cn(
                  'hidden md:block whitespace-nowrap py-4 px-10 rounded-full font-semibold text-base transition-all duration-200',
                  monthlyTier
                    ? 'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white cursor-pointer hover:shadow-lg hover:-translate-y-0.5 pulse-cta'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {loading ? 'Processing...' : 'Continue to checkout'}
              </button>
            </div>

            {/* Trust signals */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure checkout via Stripe
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pause anytime for hardship
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Your data stays private
              </span>
            </div>
          </div>
        </section>
      </form>

      {/* Trust language footer */}
      <section className="py-8 bg-[var(--color-bg)]">
        <div className="trust-language">
          <p>
            Tree of Hope is a for-profit service. Your contribution funds the Sanctuary
            and ongoing platform operations. It is not sent to the patient.
          </p>
        </div>
      </section>
    </div>
  )
}
