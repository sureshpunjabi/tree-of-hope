'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { LeafModal } from '@/components/tree/LeafModal'
import ScrollReveal from '@/components/ui/ScrollReveal'
import SplitText from '@/components/ui/SplitText'
import MagneticButton from '@/components/ui/MagneticButton'

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
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-hope)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-[var(--color-text-muted)]">Loading leaves...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[15px] text-[var(--color-text-muted)] mb-6">{error || 'Campaign not found'}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-[14px] transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const isEmpty = leaves.length === 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <Link
            href={`/c/${slug}`}
            className="inline-flex items-center text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-hope)] font-medium mb-8 transition-colors duration-300"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {campaign.patient_name}&apos;s tree
          </Link>

          <SplitText
            as="h1"
            className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold text-[var(--color-text)] leading-[1.06] tracking-[-0.03em] mb-5"
            delay={100}
          >
            Messages of hope.
          </SplitText>

          <ScrollReveal delay={400}>
            <p className="text-[clamp(1rem,1.6vw,1.15rem)] text-[var(--color-text-muted)] max-w-[440px] mx-auto leading-[1.55] tracking-[-0.01em]">
              {isEmpty
                ? `Be the first to write a message for ${campaign.patient_name}.`
                : `${leaves.length} ${leaves.length === 1 ? 'person has' : 'people have'} written for ${campaign.patient_name}.`}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── LEAVES GRID ─── */}
      <section className="pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {isEmpty ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[var(--color-hope)]/[0.08] flex items-center justify-center mx-auto mb-6">
                <span className="text-[24px]">🌿</span>
              </div>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-8 max-w-sm mx-auto leading-[1.6]">
                Every tree starts with a single leaf. Write one and invite others to do the same.
              </p>
              <MagneticButton strength={0.08} className="inline-block">
                <Link
                  href={`/c/${slug}/leaf`}
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-[14px] transition-all duration-300"
                >
                  Write the first leaf
                </Link>
              </MagneticButton>
            </div>
          ) : (
            <>
              {/* Masonry grid */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {leaves.map((leaf, i) => (
                  <ScrollReveal key={leaf.id} delay={Math.min(i * 50, 250)}>
                    <button
                      onClick={() => handleLeafClick(leaf)}
                      className="break-inside-avoid w-full text-left rounded-2xl p-7 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/[0.06] backdrop-blur-sm border border-black/[0.04] group cursor-pointer"
                      style={{ backgroundColor: 'rgba(245, 245, 240, 0.6)' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-hope)]/[0.08] flex items-center justify-center mb-5 group-hover:bg-[var(--color-hope)]/[0.14] transition-colors duration-500">
                        <span className="text-[14px]">🌿</span>
                      </div>
                      <p
                        className="text-[15px] text-[var(--color-text)] leading-[1.7] mb-5 line-clamp-4"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        &ldquo;{leaf.message}&rdquo;
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[var(--color-hope)]" />
                          <p className="text-[13px] font-medium text-[var(--color-text-muted)]">
                            {leaf.author_name}
                          </p>
                        </div>
                        <span className="text-[12px] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Read →
                        </span>
                      </div>
                    </button>
                  </ScrollReveal>
                ))}
              </div>

              {/* Bottom CTA */}
              <ScrollReveal>
                <div className="text-center mt-16 pt-16 border-t border-black/[0.06]">
                  <p className="text-[15px] text-[var(--color-text-muted)] mb-6 leading-[1.6]">
                    Touched by these messages?
                  </p>
                  <MagneticButton strength={0.08} className="inline-block">
                    <Link
                      href={`/c/${slug}/leaf`}
                      className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-[14px] transition-all duration-300"
                    >
                      Add your leaf
                    </Link>
                  </MagneticButton>
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      </section>

      {/* Leaf Modal */}
      <LeafModal
        leaf={selectedLeaf}
        onClose={handleCloseModal}
        isOpen={isModalOpen}
      />
    </div>
  )
}
