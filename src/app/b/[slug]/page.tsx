'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
    monthly_total_cents: number
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

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
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[var(--color-border)] shadow-sm text-center">
            <h1
              className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Campaign not found
            </h1>
            <p className="text-[var(--color-text-muted)] mb-8 text-lg">
              {error || 'We couldn\'t find the campaign you\'re looking for.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              Back to Home
            </Link>
          </div>
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
  const leafCount = campaign.leaf_count || leaves.length

  const transformedLeaves = leaves.map((leaf) => ({
    id: leaf.id,
    author_name: leaf.author_name || 'Anonymous',
    message: leaf.message || '',
    position_x: leaf.position_x,
    position_y: leaf.position_y,
    created_at: leaf.created_at,
  }))

  const faqItems = [
    {
      q: 'What is Tree of Hope?',
      a: `GoFundMe gives the money. Tree of Hope gives the community. When someone you care about is going through a health crisis, they need more than a one-time donation. They need people who show up, month after month, with words of hope and practical support. That's what a Tree of Hope provides — and it funds a private Sanctuary where ${campaign.patient_name} gets daily guidance, care tools, and a space that's just for them.`,
    },
    {
      q: 'How does the monthly commitment work?',
      a: `Choose a monthly tier starting from $9. Your consistent support funds ${campaign.patient_name}'s private Sanctuary and ongoing care tools. You can pause anytime for hardship, no questions asked.`,
    },
    {
      q: 'What is the Sanctuary?',
      a: `A private space for ${campaign.patient_name} and their caregiver with guided daily content, a journal, care tools, and resources tailored to their journey. It opens after the five-day campaign gathers community support.`,
    },
    {
      q: 'Is this money going to the person directly?',
      a: `No. Your contribution funds the Sanctuary platform, guided content, and operations. It is not transferred to the individual. The GoFundMe campaign is separate and goes directly to the person.`,
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                Tree of Hope
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] lg:text-[4rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                A tree is growing for{' '}
                <span className="text-[var(--color-hope)]">{campaign.patient_name}</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                Their journey matters. Your monthly support funds a private Sanctuary with daily guidance, care tools, and community connection.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/b/${slug}/start`}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Leaf className="w-5 h-5" />
                  Add your leaf & commit
                </Link>
                {bridge?.gofundme_url && (
                  <a
                    href={bridge.gofundme_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleGoFundMeClick}
                    className="inline-flex items-center justify-center gap-2 border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
                  >
                    View GoFundMe
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Soft glow behind tree */}
                <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-110" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={500}
                  height={518}
                  className="relative z-10 drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="border-y border-[var(--color-border)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 md:grid-cols-3 divide-x divide-[var(--color-border)]">
            <div className="py-8 md:py-10 px-6 text-center">
              <div
                className="text-3xl md:text-4xl font-bold text-[var(--color-hope)] mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                ${gofundmeRaised}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] font-medium">
                Raised on GoFundMe
              </div>
            </div>
            <div className="py-8 md:py-10 px-6 text-center">
              <div
                className="text-3xl md:text-4xl font-bold text-[var(--color-hope)] mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {gofundmeDonors}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] font-medium">
                Generous donors
              </div>
            </div>
            <div className="py-8 md:py-10 px-6 text-center">
              <div
                className="text-3xl md:text-4xl font-bold text-[var(--color-hope)] mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {leafCount}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] font-medium">
                Leaves on the tree
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STORY SECTION ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Their story matters
            </h2>
          </div>
          <div className="prose prose-lg max-w-none text-[var(--color-text-muted)] leading-relaxed">
            <p className="text-lg text-[var(--color-text)]">
              <strong>{campaign.patient_name}'s</strong> GoFundMe campaign has raised{' '}
              <strong className="text-[var(--color-hope)]">${gofundmeRaised}</strong> from{' '}
              <strong className="text-[var(--color-hope)]">{gofundmeDonors} compassionate people</strong>. That one-time support is crucial. But healing needs more than money—it needs community showing up consistently, month after month, with messages of hope and practical care.
            </p>
            <p className="text-lg text-[var(--color-text)] mt-6">
              Tree of Hope is that community. When you commit to a monthly tier, you join a circle of supporters who send messages of encouragement and help fund a private Sanctuary—a guided, personalized space where <strong>{campaign.patient_name}</strong> and their caregiver have daily tools, care resources, and a place to process what comes next.
            </p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              How it works
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Three steps. One circle.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '🍃',
                title: 'Write a leaf',
                desc: `Share a message of hope for ${campaign.patient_name}. Your words become part of their story.`,
              },
              {
                step: '02',
                icon: '💚',
                title: 'Choose a commitment',
                desc: 'Pick a monthly tier starting from $9. You can pause anytime for hardship.',
              },
              {
                step: '03',
                icon: '🏡',
                title: 'Fund the Sanctuary',
                desc: `Your monthly support funds ${campaign.patient_name}'s private Sanctuary with guided care tools and community connection.`,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-gradient-to-b from-[#e8f0e4] to-[#d5e0d2] rounded-3xl border border-[var(--color-border)] p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-6">{item.icon}</div>
                <div className="text-xs font-bold tracking-widest text-[var(--color-hope)] mb-3 uppercase">
                  Step {item.step}
                </div>
                <h3
                  className="text-xl font-bold text-[var(--color-text)] mb-3"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TREE VISUALIZATION ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              The tree is growing
            </h2>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[var(--color-border)] shadow-lg">
            <TreeVisualization
              leaves={transformedLeaves}
              patientName={campaign.patient_name}
              onLeafClick={() => {}}
            />
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              Questions
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Clear answers.
            </h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-[var(--color-text)] text-lg hover:bg-gray-50 transition-colors">
                  {item.q}
                  <span className="text-[var(--color-text-muted)] group-open:rotate-45 transition-transform text-2xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST LANGUAGE FOOTER ─── */}
      <section className="py-12 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="trust-language text-center">
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Tree of Hope is a for-profit service. Your contribution funds the Sanctuary platform, guided content, and ongoing operations. It is not transferred to the patient. The GoFundMe campaign is a separate fundraiser that goes directly to the individual.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
