'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TreeVisualization } from '@/components/tree/TreeVisualization'
import { trackEvent } from '@/lib/analytics'

interface BridgeData {
  success: boolean
  campaign?: {
    id: string
    slug: string
    title: string
    patient_name: string
    story?: string
    monthly_total_cents: number
    supporter_count?: number
    leaf_count?: number
  }
  bridge?: {
    id: string
    gofundme_url: string
    gofundme_raised_cents?: number
    gofundme_donor_count?: number
    claimed_by?: string
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

export default function BridgeOrganiserPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [data, setData] = useState<BridgeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

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

        // Track organiser viewed
        await trackEvent('bridge_organiser_viewed', {
          campaign_id: result.campaign?.id,
          campaign_slug: slug,
          bridge_id: result.bridge?.id,
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

  const handleClaim = async () => {
    if (!data?.bridge?.id) {
      setClaimError('Bridge information is missing')
      return
    }

    try {
      setClaiming(true)
      setClaimError(null)

      // For now, redirect to magic link auth
      // In production, this would check if user is authenticated first
      const authUrl = new URL('/auth/magic-link', typeof window !== 'undefined' ? window.location.origin : '')
      authUrl.searchParams.set('callback', `/b/${slug}/organiser`)
      authUrl.searchParams.set('bridge_id', data.bridge.id)

      window.location.href = authUrl.toString()
    } catch (err) {
      console.error('Error claiming bridge:', err)
      setClaimError('Failed to claim tree. Please try again.')
    } finally {
      setClaiming(false)
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
          <Link href="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const campaign = data.campaign
  const bridge = data.bridge
  const leaves = data.leaves || []
  const leafCount = leaves.length

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4">
            Someone planted a Tree of Hope for{' '}
            <span className="text-[var(--color-hope)]">{campaign.patient_name}</span>
          </h1>
        </div>

        {/* Body Text */}
        <div className="bg-white rounded-lg p-6 md:p-8 border border-[var(--color-border)] shadow-sm mb-12">
          <p className="text-lg text-[var(--color-text)] leading-relaxed">
            You created <strong>{campaign.patient_name}'s</strong> GoFundMe, and people responded
            beautifully. Now <strong>{leafCount} people</strong> have added leaves to{' '}
            <strong>{campaign.patient_name}'s</strong> Tree of Hope — messages of hope and ongoing
            monthly support that funds a private Sanctuary.
          </p>
        </div>

        {/* Tree Visualization */}
        {leafCount > 0 && (
          <div className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm mb-12">
            <TreeVisualization
              leaves={transformedLeaves}
              patientName={campaign.patient_name}
              onLeafClick={() => {}}
            />
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white rounded-lg p-8 border border-[var(--color-border)] shadow-sm mb-12">
          <h2 className="font-serif font-bold text-2xl text-[var(--color-text)] mb-6">
            As the organiser, you can:
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-leaf-1)] font-bold mt-1">✓</span>
              <span className="text-[var(--color-text)]">
                Claim this Tree and manage it on {campaign.patient_name}'s behalf
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-leaf-1)] font-bold mt-1">✓</span>
              <span className="text-[var(--color-text)]">
                Invite {campaign.patient_name} to their private Sanctuary
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-leaf-1)] font-bold mt-1">✓</span>
              <span className="text-[var(--color-text)]">
                See who's supporting (we don't show amounts — it's about community, not charity)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--color-leaf-1)] font-bold mt-1">✓</span>
              <span className="text-[var(--color-text)]">
                Share the Tree with more people and grow the community
              </span>
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {claimError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800">{claimError}</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-12">
          <button
            onClick={handleClaim}
            disabled={claiming}
            className={cn(
              'btn-primary inline-flex items-center justify-center gap-2 flex-1 sm:flex-none',
              'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
              'text-white font-semibold py-3 px-8 rounded-full',
              'transition-all duration-200 hover:shadow-lg',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {claiming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Claiming...</span>
              </>
            ) : (
              <>
                <span>Claim {campaign.patient_name}'s Tree</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Not the organiser */}
        <div className="text-center mb-12 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-[var(--color-text)] mb-3">Not the right person?</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Forward this link to{' '}
            <strong>{campaign.patient_name}</strong>'s GoFundMe organiser so they can claim it.
          </p>
        </div>

        {/* Learn More Links */}
        <div className="text-center space-y-3">
          <Link
            href={`/b/${slug}`}
            className="text-[var(--color-hope)] font-semibold hover:underline inline-block"
          >
            What is Tree of Hope?
          </Link>
        </div>
      </div>
    </div>
  )
}
