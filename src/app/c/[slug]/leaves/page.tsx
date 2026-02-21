'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LeafModal } from '@/components/tree/LeafModal'

interface Leaf {
  id: string
  campaign_id: string
  author_name: string
  message: string
  position_x: number | null
  position_y: number | null
  is_public: boolean
  is_hidden: boolean
  created_at: string
}

interface Campaign {
  id: string
  slug: string
  title: string
  patient_name: string
}

export default function LeavesPage() {
  const params = useParams()
  const slug = params.slug as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [selectedLeaf, setSelectedLeaf] = useState<Leaf | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/campaigns/${slug}`)
        if (!response.ok) {
          setError('Campaign not found')
          return
        }

        const data = await response.json()
        setCampaign(data.campaign)
        setLeaves(data.leaves || [])
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const handleLeafClick = (leaf: Leaf) => {
    setSelectedLeaf(leaf)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedLeaf(null), 300)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-hope)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading leaves...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Campaign not found'}</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const isEmpty = leaves.length === 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-50 to-[var(--color-bg)] py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/c/${slug}`}
            className="inline-flex items-center text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to campaign
          </Link>

          <h1 className="font-serif font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-2">
            Messages of Hope
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            for {campaign.patient_name}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isEmpty ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="font-serif text-2xl font-bold text-[var(--color-text)] mb-2">
              No leaves yet
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
              Every tree starts with a single leaf. Be the first to plant one and
              share a message of hope.
            </p>
            <Link
              href={`/c/${slug}/leaf`}
              className={cn(
                'btn-primary inline-flex items-center justify-center',
                'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                'text-white font-semibold py-3 px-8 rounded-full',
                'transition-all duration-200 hover:shadow-lg'
              )}
            >
              <span className="text-lg">🌱</span>
              Write the first leaf
            </Link>
          </div>
        ) : (
          /* Leaves Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaves.map((leaf) => (
              <div
                key={leaf.id}
                onClick={() => handleLeafClick(leaf)}
                className={cn(
                  'bg-white rounded-lg p-6 border border-[var(--color-border)]',
                  'hover:shadow-md transition-all duration-200 cursor-pointer',
                  'hover:border-[var(--color-hope)]'
                )}
              >
                {/* Author and Date */}
                <div className="mb-4">
                  <h3 className="font-serif font-bold text-lg text-[var(--color-text)] break-words">
                    {leaf.author_name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {new Date(leaf.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Message Preview */}
                <p className="text-[var(--color-text)] leading-relaxed line-clamp-3">
                  {leaf.message}
                </p>

                {/* Read More Indicator */}
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-hope)] font-medium">
                    Read more →
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button at Bottom */}
        {!isEmpty && (
          <div className="mt-12 text-center">
            <p className="text-[var(--color-text-muted)] mb-6">
              Touched by these leaves?
            </p>
            <Link
              href={`/c/${slug}/leaf`}
              className={cn(
                'btn-primary inline-flex items-center justify-center',
                'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                'text-white font-semibold py-3 px-8 rounded-full',
                'transition-all duration-200 hover:shadow-lg'
              )}
            >
              <span className="text-lg">🌱</span>
              Add your own leaf
            </Link>
          </div>
        )}
      </div>

      {/* Leaf Modal */}
      <LeafModal
        leaf={selectedLeaf}
        onClose={handleCloseModal}
        isOpen={isModalOpen}
      />
    </div>
  )
}
