import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
import { cn } from '@/lib/utils'
import { getDayNumber } from '@/lib/utils'
import ScrollReveal from '@/components/ui/ScrollReveal'
import SplitText from '@/components/ui/SplitText'
import CountUp from '@/components/ui/CountUp'
import MagneticButton from '@/components/ui/MagneticButton'
import GradientMesh from '@/components/ui/GradientMesh'
import ShareTreeButton from '@/components/campaign/ShareTreeButton'
import InteractiveTree from '@/components/ui/InteractiveTree'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = getServiceSupabase()
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('patient_name, title, slug')
    .eq('slug', slug)
    .single()

  if (!campaign) return {}

  const title = `${campaign.patient_name}'s Tree of Hope`
  const description = `Join the circle of support around ${campaign.patient_name}. Add your leaf and show up with lasting commitment.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://tree-of-hope-olive.vercel.app/c/${slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

interface Campaign {
  id: string
  slug: string
  title: string
  patient_name: string
  story?: string
  monthly_total_cents: number
  status: string
  created_at: string
  updated_at: string
  leaf_count?: number
  supporter_count?: number
}

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

export default async function CampaignPage({ params }: PageProps) {
  const supabase = getServiceSupabase()
  const { slug } = await params

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single()

  if (campaignError || !campaign) {
    return notFound()
  }

  const { data: leavesData } = await supabase
    .from('leaves')
    .select('*')
    .eq('campaign_id', campaign.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const leaves: Leaf[] = leavesData || []
  const dayNumber = getDayNumber(new Date(campaign.created_at))
  const isGathering = dayNumber <= 5
  const totalSupporters = campaign.supporter_count || leaves.length || 0

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── Centered, Apple-tier */}
      <section className="relative min-h-[85svh] flex flex-col items-center justify-center px-5 sm:px-8 text-center">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-6">
            {isGathering ? `Day ${dayNumber} of 5` : 'Tree complete'}
          </p>

          <SplitText
            as="h1"
            className="text-[clamp(2.75rem,6.5vw,5.5rem)] font-semibold text-[var(--color-text)] leading-[1.06] tracking-[-0.03em] mb-6"
            delay={100}
          >
            {isGathering
              ? `Gathering around ${campaign.patient_name}.`
              : `${campaign.patient_name}'s circle.`}
          </SplitText>

          <ScrollReveal delay={500}>
            <p className="text-[clamp(1rem,1.8vw,1.25rem)] text-[var(--color-text-muted)] max-w-[480px] mx-auto leading-[1.5] mb-10 tracking-[-0.01em]">
              {isGathering
                ? `Add your leaf and join the community sustaining ${campaign.patient_name}'s Sanctuary.`
                : `${totalSupporters} people have come together in support.`}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={700}>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              {campaign.status === 'active' && isGathering ? (
                <>
                  <MagneticButton strength={0.1} className="inline-block">
                    <Link
                      href={`/c/${campaign.slug}/leaf`}
                      className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em]"
                    >
                      Add your leaf
                    </Link>
                  </MagneticButton>
                  <MagneticButton strength={0.1} className="inline-block">
                    <Link
                      href="#how-it-works"
                      className="inline-flex items-center justify-center text-[var(--color-hope)] font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em] hover:bg-[var(--color-hope)]/[0.06]"
                    >
                      How it works
                    </Link>
                  </MagneticButton>
                </>
              ) : (
                <MagneticButton strength={0.1} className="inline-block">
                  <Link
                    href={`/c/${campaign.slug}/commitment`}
                    className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em]"
                  >
                    Join the circle
                  </Link>
                </MagneticButton>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── INTERACTIVE TREE ─── Spring physics, magnetic cursor */}
      <section className="py-8 md:py-16 flex justify-center px-5">
        <div className="w-full max-w-[600px]">
          <InteractiveTree />
        </div>
      </section>

      {/* ─── STATS ─── Clean, minimal */}
      <ScrollReveal>
        <section className="border-y border-black/[0.06]">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 divide-x divide-black/[0.06]">
              {[
                { number: isGathering ? dayNumber : 5, label: isGathering ? 'Day' : 'Days' },
                { number: leaves.length, label: 'Leaves' },
                { number: totalSupporters, label: 'Supporters' },
              ].map((stat) => (
                <div key={stat.label} className="py-10 md:py-14 text-center">
                  <div
                    className="text-[clamp(2.5rem,5vw,3.75rem)] font-semibold text-[var(--color-text)] mb-1 tracking-[-0.03em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    <CountUp end={stat.number} />
                  </div>
                  <div className="text-[13px] text-[var(--color-text-muted)] tracking-[0.05em]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ─── STORY ─── */}
      {campaign.story && (
        <section className="py-16 md:py-40">
          <div className="max-w-[680px] mx-auto px-5 sm:px-8">
            <ScrollReveal>
              <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-5">
                The story
              </p>
              <h2
                className="text-[clamp(2rem,4vw,3rem)] font-semibold text-[var(--color-text)] mb-8 tracking-[-0.02em] leading-[1.1]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {campaign.patient_name}&apos;s journey.
              </h2>
              <div className="text-[17px] text-[var(--color-text-muted)] whitespace-pre-wrap leading-[1.7]">
                {campaign.story}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-16 md:py-40 bg-[#f5f5f0]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <SplitText
            as="h2"
            className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold text-[var(--color-text)] leading-[1.08] tracking-[-0.03em] text-center mb-12 md:mb-20"
          >
            Three simple steps.
          </SplitText>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-10">
            {[
              {
                num: '01',
                title: 'Add a leaf',
                desc: 'Write a message of hope. It becomes a leaf on the tree.',
              },
              {
                num: '02',
                title: 'Commit',
                desc: 'Choose a monthly amount. Pause anytime, no questions asked.',
              },
              {
                num: '03',
                title: 'Watch it grow',
                desc: 'After 5 days, a private Sanctuary opens for the patient.',
              },
            ].map((item) => (
              <ScrollReveal key={item.num}>
                <div>
                  <span className="text-[13px] font-medium tracking-[0.15em] text-[var(--color-text-muted)] uppercase block mb-5">
                    {item.num}
                  </span>
                  <h3
                    className="text-[24px] md:text-[28px] font-semibold text-[var(--color-text)] mb-3 tracking-[-0.02em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LEAVES ─── */}
      <section id="leaves" className="py-16 md:py-40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {leaves.length > 0 ? (
            <>
              <SplitText
                as="h2"
                className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold text-[var(--color-text)] leading-[1.08] tracking-[-0.03em] text-center mb-6"
              >
                {`${leaves.length} ${leaves.length === 1 ? 'leaf' : 'leaves'} on the tree.`}
              </SplitText>
              <p className="text-[15px] text-[var(--color-text-muted)] text-center mb-16 max-w-[420px] mx-auto leading-[1.6]">
                Each message is a promise to show up.
              </p>

              {/* Masonry-inspired staggered grid */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {leaves.map((leaf, i) => (
                  <ScrollReveal key={leaf.id} delay={Math.min(i * 60, 300)}>
                    <div
                      className="break-inside-avoid rounded-2xl p-7 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/[0.06] backdrop-blur-sm border border-black/[0.04] group"
                      style={{ backgroundColor: 'rgba(245, 245, 240, 0.6)' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-hope)]/[0.08] flex items-center justify-center mb-5 group-hover:bg-[var(--color-hope)]/[0.14] transition-colors duration-500">
                        <span className="text-[14px]">🌿</span>
                      </div>
                      <p
                        className="text-[15px] text-[var(--color-text)] leading-[1.7] mb-5"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        &ldquo;{leaf.message}&rdquo;
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[var(--color-hope)]" />
                        <p className="text-[13px] font-medium text-[var(--color-text-muted)]">
                          {leaf.author_name}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <h2
                className="text-[clamp(2rem,4vw,3rem)] font-semibold text-[var(--color-text)] mb-4 tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                No leaves yet.
              </h2>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-10 max-w-[400px] mx-auto leading-[1.6]">
                Be the first to support {campaign.patient_name}.
              </p>
              {campaign.status === 'active' && (
                <MagneticButton strength={0.1} className="inline-block">
                  <Link
                    href={`/c/${campaign.slug}/leaf`}
                    className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em]"
                  >
                    Add the first leaf
                  </Link>
                </MagneticButton>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── SHARE ─── Viral growth engine */}
      <section className="py-20 md:py-28" style={{ backgroundColor: 'rgba(245, 245, 240, 0.5)' }}>
        <div className="max-w-lg mx-auto px-5 sm:px-8 text-center">
          <ScrollReveal>
            <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-5">
              Spread the word
            </p>
            <h2
              className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-[var(--color-text)] tracking-[-0.02em] mb-4 leading-[1.15]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Share {campaign.patient_name}&apos;s tree.
            </h2>
            <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.6] mb-8">
              Every share is an invitation for someone to show up.
            </p>
            <ShareTreeButton slug={campaign.slug} patientName={campaign.patient_name} />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-20 md:py-40 overflow-hidden">
        <GradientMesh />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <ScrollReveal>
            <Image
              src="/tree-hero.png"
              alt="Tree of Hope"
              width={120}
              height={124}
              className="mx-auto mb-10 drop-shadow-md invert opacity-90"
            />
            <h2
              className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold text-[#f5f5f7] leading-[1.08] tracking-[-0.03em] mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {isGathering
                ? `Join ${campaign.patient_name}'s circle.`
                : `The circle is complete.`}
            </h2>
            <p className="text-[clamp(1rem,1.8vw,1.15rem)] text-[#a1a1a6] mb-10 leading-[1.5]">
              Every leaf matters.
            </p>
            {campaign.status === 'active' && isGathering && (
              <MagneticButton strength={0.1} className="inline-block">
                <Link
                  href={`/c/${campaign.slug}/leaf`}
                  className="inline-flex items-center justify-center bg-white hover:bg-white/90 text-[#1d1d1f] font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em]"
                >
                  Add your leaf
                </Link>
              </MagneticButton>
            )}
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
