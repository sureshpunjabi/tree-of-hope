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
  const [demoMode, setDemoMode] = useState(false)

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
      description: 'A modest gift of support',
    },
    {
      id: 'sapling' as const,
      name: 'Sapling',
      price: 24.99,
      description: 'A meaningful contribution',
    },
    {
      id: 'mightyOak' as const,
      name: 'Mighty Oak',
      price: 99.0,
      description: 'A generous foundation of care',
    },
  ]

  const monthlyTiers = [
    {
      id: 'nurture' as const,
      name: 'Nurture',
      price: 9,
      description: 'A quiet, steady presence',
    },
    {
      id: 'sustain' as const,
      name: 'Sustain',
      price: 19,
      description: 'Sustained, growing support',
      featured: true,
    },
    {
      id: 'flourish' as const,
      name: 'Flourish',
      price: 35,
      description: 'Deep, full commitment to care',
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
        setDemoMode(true)
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
      <section className="relative overflow-hidden bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-light tracking-[0.25em] uppercase text-[var(--color-hope)] mb-8">
                Make a commitment
              </p>
              <h1
                className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.15] mb-8"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Support with<br />
                <span className="text-[var(--color-hope)]">roots that hold.</span>
              </h1>
              <p className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-lg">
                Today is a one-time start. Monthly support continues quietly in the
                background. You can pause for hardship at any time.
              </p>
            </div>

            <div className="relative hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.04] rounded-full blur-3xl scale-110" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={400}
                  height={414}
                  className="relative z-10 drop-shadow-xl"
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
            <div className="text-center mb-16">
              <p className="text-xs font-light tracking-[0.25em] uppercase text-[var(--color-hope)] mb-6">
                Optional
              </p>
              <h2
                className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Joining Gift
              </h2>
              <p className="text-base text-[var(--color-text-muted)] mt-6 max-w-xl mx-auto leading-relaxed">
                Make an optional one-time contribution to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {joiningGiftTiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierSelect(tier.id, 'joining')}
                  className={cn(
                    'group relative rounded-lg p-8 text-left transition-all duration-300',
                    joiningGift === tier.id
                      ? 'border-l-4 border-[var(--color-hope)]'
                      : 'border-l-4 border-transparent'
                  )}
                >
                  {/* Top border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-[var(--color-hope)] opacity-100" />

                  <div className="relative z-10">
                    <p
                      className="text-4xl font-light text-[var(--color-hope)] mb-6"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      ${tier.price.toFixed(2)}
                    </p>
                    <h3
                      className="text-lg font-light text-[var(--color-text)] mb-2"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {tier.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {tier.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 md:py-28 bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <blockquote>
              <p
                className="text-2xl md:text-3xl font-light text-[var(--color-text)] leading-relaxed mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                "I chose $19 a month. It's less than my streaming subscription, but it means Sarah knows I'm here."
              </p>
              <footer className="text-sm tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
                — A supporter
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Monthly Commitment Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-xs font-light tracking-[0.25em] uppercase text-[var(--color-hope)] mb-6">
                Required
              </p>
              <h2
                className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Monthly Commitment
              </h2>
              <p className="text-base text-[var(--color-text-muted)] mt-6 max-w-xl mx-auto leading-relaxed">
                Choose a monthly contribution. Pause anytime for hardship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {monthlyTiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierSelect(tier.id, 'monthly')}
                  className={cn(
                    'group relative rounded-lg p-8 text-left transition-all duration-300',
                    monthlyTier === tier.id
                      ? 'border-l-4 border-[var(--color-hope)]'
                      : 'border-l-4 border-transparent'
                  )}
                >
                  {/* Top border */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-[var(--color-hope)] opacity-100" />

                  <div className="relative z-10">
                    <p
                      className="text-4xl font-light text-[var(--color-hope)] mb-1"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      ${tier.price}<span className="text-lg font-light text-[var(--color-text-muted)]">/mo</span>
                    </p>

                    {tier.featured && (
                      <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-hope)] mb-4">
                        Most chosen
                      </p>
                    )}

                    <h3
                      className="text-lg font-light text-[var(--color-text)] mb-2"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {tier.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {tier.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DEMO MODE OVERLAY ─── */}
        {demoMode && (
          <section className="py-20 md:py-28 bg-[var(--color-bg)]">
            <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-hope)]/10 flex items-center justify-center mx-auto mb-8">
                <span className="text-[28px]">🌱</span>
              </div>
              <h2
                className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-[var(--color-text)] tracking-[-0.02em] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Payments launching soon.
              </h2>
              <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.7] mb-8 max-w-md mx-auto">
                We&apos;re putting the final touches on secure checkout.
                Your selections have been saved — we&apos;ll let you know the moment this goes live.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-hope)]/[0.06] text-[var(--color-hope)] text-[13px] font-medium">
                <span className="w-2 h-2 rounded-full bg-[var(--color-hope)] animate-pulse" />
                Demo mode — no charges will be made
              </div>
            </div>
          </section>
        )}

        {/* ─── SUMMARY BAR (Sticky on mobile) ─── */}
        <section className={cn(
          "border-t border-[var(--color-border)] bg-white sticky bottom-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]",
          demoMode && "hidden"
        )}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {error && (
              <div className="mb-4 p-4 bg-[var(--color-hope)]/[0.06] border border-[var(--color-hope)]/20 text-[var(--color-text)] rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
              {/* Total amount - desktop */}
              <div className="hidden md:flex items-baseline gap-2">
                <p
                  className="text-4xl font-light text-[var(--color-hope)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  ${calculateTotal()}
                </p>
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
                  First payment
                </p>
              </div>

              {/* Mobile: compact total */}
              <div className="flex md:hidden items-baseline gap-2">
                <p
                  className="text-2xl font-light text-[var(--color-hope)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  ${calculateTotal()}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">First payment</p>
              </div>

              {/* Buttons */}
              <div className="w-full md:w-auto flex gap-3">
                <button
                  type="submit"
                  disabled={!monthlyTier || loading}
                  className={cn(
                    'flex-1 md:flex-none whitespace-nowrap py-3 md:py-4 px-6 md:px-8 rounded-lg font-light text-sm md:text-base transition-all duration-200',
                    monthlyTier
                      ? 'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white cursor-pointer hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </div>

            {/* Trust signals - minimal text only */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex flex-wrap justify-center gap-6 md:gap-10 text-xs text-[var(--color-text-muted)]">
              <span>Secure checkout via Stripe</span>
              <span>Pause anytime for hardship</span>
              <span>Your data stays private</span>
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
