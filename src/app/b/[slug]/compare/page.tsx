'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

export default function BridgeComparePage() {
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    // Track page view
    trackEvent('bridge_compare_viewed', {
      campaign_slug: slug,
    })
  }, [slug])

  const features = {
    gofundme: [
      { label: 'One-time gift', included: true },
      { label: 'Immediate help', included: true },
      { label: 'Financial relief', included: true },
      { label: 'Wide reach', included: true },
    ],
    treeOfHope: [
      { label: 'Ongoing support', included: true },
      { label: 'Monthly care', included: true },
      { label: 'Emotional support', included: true },
      { label: 'Close circle', included: true },
      { label: 'Private Sanctuary', included: true },
      { label: 'Care tools', included: true },
      { label: '30-day guidance', included: true },
    ],
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-[var(--color-hope)] mb-3">Comparison</p>
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4">
            They work together
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            GoFundMe and Tree of Hope complement each other. Not in competition — in partnership.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* GoFundMe Column */}
          <div className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm">
            <h2 className="font-serif font-bold text-2xl text-[var(--color-text)] mb-8">
              GoFundMe
            </h2>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.gofundme.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-[var(--color-leaf-1)]" />
                  </div>
                  <span className="text-[var(--color-text)]">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="border-l-4 border-[var(--color-hope)] pl-4 py-4">
              <p className="text-lg italic text-[var(--color-text)]">
                "GoFundMe gives the money. Keep giving."
              </p>
            </div>
          </div>

          {/* Tree of Hope Column */}
          <div className="bg-white rounded-lg p-8 border border-2 border-[var(--color-hope)] shadow-sm">
            <h2 className="font-serif font-bold text-2xl text-[var(--color-text)] mb-8">
              Tree of Hope
            </h2>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.treeOfHope.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-[var(--color-leaf-1)]" />
                  </div>
                  <span className="text-[var(--color-text)]">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="border-l-4 border-[var(--color-hope)] pl-4 py-4">
              <p className="text-lg italic text-[var(--color-text)]">
                "Tree of Hope gives the community. Start growing."
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href={`/b/${slug}/start`}
            className={cn(
              'btn-primary inline-flex items-center justify-center',
              'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
              'text-white font-semibold py-3 px-8 rounded-full',
              'transition-all duration-200 hover:shadow-lg'
            )}
          >
            Add your leaf to the Tree
          </Link>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] text-center max-w-md mx-auto mt-6 leading-relaxed">
          Tree of Hope is a for-profit service. Your contribution funds the Sanctuary and ongoing platform operations. It is not sent to the patient.
        </p>
      </div>
    </div>
  )
}
