'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { trackEvent } from '@/lib/analytics'
import { STRIPE_PRODUCTS, CommitmentType } from '@/lib/stripe-products'
import { cn } from '@/lib/utils'

export default function CommitmentPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [patientName, setPatientName] = useState<string>('this patient')
  const [selected, setSelected] = useState<CommitmentType>('leaf')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      trackEvent('checkout_started', {
        slug,
        commitment_type: selected,
      })

      const response = await fetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: slug,
          commitment_type: selected,
          success_url: `${window.location.origin}/c/${slug}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/c/${slug}/commitment`,
        }),
      })

      const data = await response.json()

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

  const product = STRIPE_PRODUCTS[selected]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <form onSubmit={handleSubmit}>
        {/* Hero */}
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-6">
              Show up for {patientName}
            </p>
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-[var(--color-text)] tracking-[-0.02em] leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Choose how you show up.
            </h1>
            <p className="text-[15px] md:text-base text-[var(--color-text-muted)] leading-[1.7] max-w-xl mx-auto">
              Every contribution builds a living Sanctuary. Pick the level that feels right.
              You can change or pause anytime.
            </p>
          </div>
        </section>

        {/* Commitment options */}
        <section className="py-20 md:py-28 bg-[var(--color-bg)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Plant a Leaf — $35/mo */}
              <button
                type="button"
                onClick={() => {
                  setSelected('leaf')
                  trackEvent('tier_selected', { slug, tier: 'leaf' })
                }}
                className={cn(
                  'group relative rounded-lg p-8 text-left transition-all duration-300',
                  selected === 'leaf'
                    ? 'border-l-4 border-[var(--color-hope)] bg-[var(--color-hope)]/[0.02]'
                    : 'border-l-4 border-transparent'
                )}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-[var(--color-hope)] opacity-100" />
                <div className="relative z-10">
                  <p
                    className="text-4xl font-light text-[var(--color-hope)] mb-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    $35<span className="text-lg font-light text-[var(--color-text-muted)]">/mo</span>
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-hope)] mb-4">
                    Most popular
                  </p>
                  <h3
                    className="text-lg font-light text-[var(--color-text)] mb-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Plant a Leaf
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Show up for someone you love. $35/month builds their Sanctuary.
                  </p>
                </div>
              </button>

              {/* Fund a Tree — $500/mo */}
              <button
                type="button"
                onClick={() => {
                  setSelected('sponsor')
                  trackEvent('tier_selected', { slug, tier: 'sponsor' })
                }}
                className={cn(
                  'group relative rounded-lg p-8 text-left transition-all duration-300',
                  selected === 'sponsor'
                    ? 'border-l-4 border-[var(--color-hope)] bg-[var(--color-hope)]/[0.02]'
                    : 'border-l-4 border-transparent'
                )}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-[var(--color-hope)] opacity-100" />
                <div className="relative z-10">
                  <p
                    className="text-4xl font-light text-[var(--color-hope)] mb-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    $500<span className="text-lg font-light text-[var(--color-text-muted)]">/mo</span>
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-hope)] mb-4">
                    Sponsor
                  </p>
                  <h3
                    className="text-lg font-light text-[var(--color-text)] mb-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Fund a Tree
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Sponsor the entire Tree and its Sanctuary.
                    Your name appears on the Tree as a founding supporter.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 md:py-28 bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <blockquote>
              <p
                className="text-2xl md:text-3xl font-light text-[var(--color-text)] leading-relaxed mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                &ldquo;$35 a month is less than my streaming service. But it means {patientName} knows I&rsquo;m here.&rdquo;
              </p>
              <footer className="text-sm tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
                — A supporter
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Demo mode overlay */}
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
                Your selections have been saved.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-hope)]/[0.06] text-[var(--color-hope)] text-[13px] font-medium">
                <span className="w-2 h-2 rounded-full bg-[var(--color-hope)] animate-pulse" />
                Demo mode — no charges will be made
              </div>
            </div>
          </section>
        )}

        {/* Sticky summary bar */}
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
              <div className="flex items-baseline gap-2">
                <p
                  className="text-4xl md:text-4xl font-light text-[var(--color-hope)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  ${(product.amount / 100).toFixed(0)}<span className="text-lg font-light text-[var(--color-text-muted)]">/mo</span>
                </p>
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-text-muted)]">
                  {selected === 'leaf' ? 'Plant a Leaf' : 'Fund a Tree'}
                </p>
              </div>

              <div className="w-full md:w-auto flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-none whitespace-nowrap py-3 md:py-4 px-6 md:px-8 rounded-lg font-light text-sm md:text-base transition-all duration-200 bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white cursor-pointer hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to checkout'}
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex flex-wrap justify-center gap-6 md:gap-10 text-xs text-[var(--color-text-muted)]">
              <span>Secure checkout via Stripe</span>
              <span>Pause anytime for hardship</span>
              <span>Your data stays private</span>
            </div>
          </div>
        </section>
      </form>

      {/* Trust language */}
      <section className="py-8 bg-[var(--color-bg)]">
        <div className="trust-language">
          <p>
            Tree of Hope is a for-profit service. Your contribution funds the Sanctuary
            and ongoing operations. It is not sent to the patient.
          </p>
        </div>
      </section>
    </div>
  )
}
