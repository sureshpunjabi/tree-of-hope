'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TreeVisualization } from '@/components/tree/TreeVisualization'
import { TrustBadge } from '@/components/layout/TrustBadge'
import { trackEvent } from '@/lib/analytics'

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

export default function BridgeLandingPage() {
  const params = useParams()
  const slug = params.slug as string
  const [data, setData] = useState<BridgeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/bridge/${slug}`)
        const result: BridgeData = await response.json()

        if (!result.success) {
          setError(result.error || 'Failed to load campaign')
          return
        }

        setData(result)

        // Track landing view
        await trackEvent('bridge_landing_view', {
          campaign_id: result.campaign?.id,
          campaign_slug: slug,
        })
      } catch (err) {
        console.error('Error fetching bridge data:', err)
        setError('Failed to load campaign. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const handleGoFundMeClick = async () => {
    if (data?.campaign?.id) {
      await trackEvent('bridge_gofundme_clicked', {
        campaign_id: data.campaign.id,
        campaign_slug: slug,
      })
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

  if (error || !data?.campaign) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text)] mb-3">
            Campaign not found
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            {error || 'We couldn\'t find the campaign you\'re looking for.'}
          </p>
          <Link
            href="/"
            className="btn-primary inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const campaign = data.campaign
  const bridge = data.bridge
  const leaves = data.leaves || []
  const gofundmeRaised = bridge?.gofundme_raised_cents
    ? (bridge.gofundme_raised_cents / 100).toFixed(0)
    : '0'
  const gofundmeDonors = bridge?.gofundme_donor_count || 0

  const transformedLeaves = leaves.map((leaf) => ({
    id: leaf.id,
    author_name: leaf.author_name || 'Anonymous',
    message: leaf.message || '',
    position_x: leaf.position_x,
    position_y: leaf.position_y,
    created_at: leaf.created_at,
  }))

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-amber-50 to-[var(--color-bg)] py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-[var(--color-hope)] mb-3">
              Tree of Hope
            </p>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[var(--color-text)] text-center mb-12">
            A Tree is growing for{' '}
            <span className="text-[var(--color-hope)]">{campaign.patient_name}</span>
          </h1>

          {/* Tree Visualization */}
          <div className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm mb-12">
            <TreeVisualization
              leaves={transformedLeaves}
              patientName={campaign.patient_name}
              onLeafClick={() => {}}
            />
          </div>

          {/* Body Text */}
          <div className="bg-white rounded-lg p-6 md:p-8 border border-[var(--color-border)] shadow-sm mb-12">
            <p className="text-lg text-[var(--color-text)] leading-relaxed">
              <strong>{campaign.patient_name}'s</strong> GoFundMe has raised{' '}
              <strong>${gofundmeRaised}</strong> from{' '}
              <strong>{gofundmeDonors} generous people</strong>. Tree of Hope is what comes next —
              ongoing support, messages of hope, and a private Sanctuary for{' '}
              <strong>{campaign.patient_name}'s</strong> journey.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {/* View GoFundMe */}
            {bridge?.gofundme_url && (
              <a
                href={bridge.gofundme_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGoFundMeClick}
                className={cn(
                  'btn-secondary inline-flex items-center justify-center gap-2',
                  'border-2 border-[var(--color-border)] hover:border-[var(--color-trunk)]',
                  'text-[var(--color-trunk)] font-semibold py-3 px-8 rounded-full',
                  'transition-all duration-200 hover:bg-amber-50'
                )}
              >
                <span>View their GoFundMe</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Add Your Leaf */}
            <Link
              href={`/b/${slug}/start`}
              className={cn(
                'btn-primary inline-flex items-center justify-center gap-2',
                'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                'text-white font-semibold py-3 px-8 rounded-full',
                'transition-all duration-200 hover:shadow-lg'
              )}
            >
              <Leaf className="w-5 h-5" />
              <span>Add your leaf to the Tree</span>
            </Link>
          </div>

          {/* FAQ Section - Collapsible */}
          <div className="mb-12">
            <button
              onClick={() => setExpandedFaq(!expandedFaq)}
              className="w-full bg-white rounded-lg p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-serif font-bold text-lg md:text-xl text-[var(--color-text)] text-left">
                  What is Tree of Hope?
                </h3>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-[var(--color-text-muted)] transition-transform flex-shrink-0',
                    expandedFaq && 'rotate-180'
                  )}
                />
              </div>

              {expandedFaq && (
                <div className="mt-6 text-left">
                  <p className="text-lg text-[var(--color-text)] leading-relaxed">
                    GoFundMe gives the money. Tree of Hope gives the community. When someone you care
                    about is going through a health crisis, they need more than a one-time donation.
                    They need people who show up, month after month, with words of hope and practical
                    support. That's what a Tree of Hope provides — and it funds a private Sanctuary
                    where <strong>{campaign.patient_name}</strong> gets daily guidance, care tools, and a
                    space that's just for them.
                  </p>
                </div>
              )}
            </button>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-[var(--color-text)] text-center mb-8">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-lg p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-leaf-1)] rounded-full mb-4">
                  <span className="text-white font-serif font-bold text-lg">1</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[var(--color-text)] mb-3">
                  Write a Leaf
                </h3>
                <p className="text-[var(--color-text-muted)]">
                  Share a message of hope for {campaign.patient_name}. Your words matter.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-lg p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-leaf-2)] rounded-full mb-4">
                  <span className="text-white font-serif font-bold text-lg">2</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[var(--color-text)] mb-3">
                  Choose Your Commitment
                </h3>
                <p className="text-[var(--color-text-muted)]">
                  Pick a monthly tier starting from $9. Show up consistently.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-lg p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-hope)] rounded-full mb-4">
                  <span className="text-white font-serif font-bold text-lg">3</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[var(--color-text)] mb-3">
                  Fund the Sanctuary
                </h3>
                <p className="text-[var(--color-text-muted)]">
                  Your commitment funds {campaign.patient_name}'s private Sanctuary and care tools.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Language */}
          <div className="mb-8">
            <TrustBadge />
          </div>
        </div>
      </div>
    </div>
  )
}
