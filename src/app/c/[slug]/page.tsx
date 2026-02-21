import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getServiceSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { getDayNumber } from '@/lib/utils'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface PageProps {
  params: Promise<{
    slug: string
  }>
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── Cathedral-like, emotionally immersive */}
        <section className="relative overflow-hidden bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
              <div className="flex flex-col justify-center">
                <p className="text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-[var(--color-hope)] mb-8">
                  {isGathering ? `Day ${dayNumber} of 5 · Gathering` : 'Tree complete'}
                </p>
                <h1
                  className="text-6xl md:text-7xl font-light text-[var(--color-text)] leading-[1.05] mb-8"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {isGathering
                    ? <>We are gathering around <span className="text-[var(--color-hope)]">{campaign.patient_name}</span>.</>
                    : <>The circle has formed around <span className="text-[var(--color-hope)]">{campaign.patient_name}</span>.</>}
                </h1>
                <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 leading-relaxed max-w-2xl">
                  {isGathering
                    ? `A quiet circle is forming to sustain ${campaign.patient_name}'s Sanctuary. Add your leaf and join the community.`
                    : `The Tree is complete. ${totalSupporters} people have come together in support.`}
                </p>
                <div className="flex flex-wrap gap-4">
                  {campaign.status === 'active' && isGathering ? (
                    <>
                      <Link
                        href={`/c/${campaign.slug}/leaf`}
                        className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        Add your leaf
                      </Link>
                      <Link
                        href="#how-it-works"
                        className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-medium py-4 px-10 rounded-full text-base transition-all duration-200"
                      >
                        How it works
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/c/${campaign.slug}/commitment`}
                        className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        Join sustaining circle
                      </Link>
                      <Link
                        href="#leaves"
                        className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-medium py-4 px-10 rounded-full text-base transition-all duration-200"
                      >
                        View the Tree
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-110" />
                  <Image
                    src="/tree-hero.png"
                    alt={`${campaign.patient_name}'s Tree of Hope`}
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

      {/* ─── STATS BAR ─── Elegant, large numbers */}
      <ScrollReveal>
        <section className="border-y border-[var(--color-border)] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
              {[
                { number: isGathering ? `${dayNumber}` : '5', label: isGathering ? 'Day of gathering' : 'Days gathered' },
                { number: `${leaves.length}`, label: 'Leaves on tree' },
                { number: `${totalSupporters}`, label: 'Supporters joined' },
              ].map((stat) => (
                <div key={stat.label} className="py-12 md:py-16 px-6 text-center">
                  <div
                    className="text-5xl md:text-6xl font-light text-[var(--color-hope)] mb-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm text-[var(--color-text-muted)] font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ─── STORY ─── Full-width emotional blockquote */}
      {campaign.story && (
        <ScrollReveal>
          <section className="py-32 md:py-48" style={{ backgroundColor: '#f9f7f3' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-[var(--color-hope)] mb-8">
                The story
              </p>
              <h2
                className="text-5xl md:text-6xl font-light text-[var(--color-text)] mb-12 leading-[1.1]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {campaign.patient_name}&apos;s journey.
              </h2>
              <div
                className="text-xl md:text-2xl text-[var(--color-text)] whitespace-pre-wrap leading-relaxed font-light"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {campaign.story}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ─── HOW IT WORKS ─── Elegant numbered steps with thin green border */}
      <ScrollReveal>
        <section id="how-it-works" className="py-32 md:py-48 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <p className="text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-[var(--color-hope)] mb-8">
                How it works
              </p>
              <h2
                className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.1]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Three simple steps.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {[
                {
                  step: '01',
                  title: 'Add a leaf',
                  desc: 'Write a message of hope. It becomes a leaf on the tree — visible to the whole community.',
                },
                {
                  step: '02',
                  title: 'Make a commitment',
                  desc: 'Choose a monthly tier that fits your life. Pause anytime for hardship, no questions asked.',
                },
                {
                  step: '03',
                  title: 'Watch it grow',
                  desc: 'The tree grows as more people join. After 5 days, a private Sanctuary opens for the patient.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border-t-2 border-[var(--color-hope)] pt-8 hover:opacity-75 transition-opacity duration-300"
                >
                  <div className="text-xs font-medium tracking-[0.25em] text-[var(--color-hope)] mb-4 uppercase">
                    Step {item.step}
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ─── LEAVES ─── Elegant masonry-like cards with left border */}
      <ScrollReveal>
        <section id="leaves" className="py-32 md:py-48 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {leaves.length > 0 ? (
              <>
                <div className="text-center mb-20">
                  <p className="text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-[var(--color-hope)] mb-8">
                    Messages of hope
                  </p>
                  <h2
                    className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.1]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {leaves.length} {leaves.length === 1 ? 'leaf' : 'leaves'} on the tree.
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
                  {leaves.map((leaf, index) => {
                    const heights = ['md:row-span-1', 'md:row-span-1', 'md:row-span-2']
                    const heightClass = heights[index % heights.length]
                    return (
                      <div
                        key={leaf.id}
                        className={cn(
                          'bg-white rounded-lg border-l-4 border-l-[var(--color-hope)] border border-l-[var(--color-hope)] border-t-[var(--color-border)] border-r-[var(--color-border)] border-b-[var(--color-border)] p-8 hover:shadow-md transition-all duration-300 flex flex-col',
                          heightClass
                        )}
                      >
                        <p
                          className="text-sm md:text-base text-[var(--color-text)] leading-relaxed mb-6 flex-grow"
                          style={{ lineHeight: '1.75' }}
                        >
                          {leaf.message}
                        </p>
                        <div className="border-t border-[var(--color-border)] pt-4">
                          <p
                            className="font-light italic text-[var(--color-hope)] text-sm md:text-base"
                            style={{ fontFamily: 'var(--font-serif)' }}
                          >
                            — {leaf.author_name}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-2">
                            {new Date(leaf.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: new Date(leaf.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <h2
                  className="text-4xl md:text-5xl font-light text-[var(--color-text)] mb-6"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  No leaves yet.
                </h2>
                <p className="text-lg text-[var(--color-text-muted)] mb-12 max-w-md mx-auto leading-relaxed">
                  Be the first to support {campaign.patient_name}. Your leaf starts the tree.
                </p>
                {campaign.status === 'active' && (
                  <Link
                    href={`/c/${campaign.slug}/leaf`}
                    className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Add the first leaf
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* ─── FINAL CTA ─── Cathedral-like, full-height viewport sensation */}
      <ScrollReveal>
        <section className="min-h-screen bg-white border-t border-[var(--color-border)] flex items-center justify-center py-32 md:py-48">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Image
              src="/tree-hero.png"
              alt="Tree of Hope"
              width={200}
              height={207}
              className="mx-auto mb-16 drop-shadow-lg"
            />
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-light text-[var(--color-text)] mb-8 leading-[1.05]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {isGathering
                ? `Join ${campaign.patient_name}'s circle.`
                : `${campaign.patient_name}'s tree is complete.`}
            </h2>
            <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-16 max-w-2xl mx-auto leading-relaxed font-light">
              {isGathering
                ? 'Every leaf matters. Add yours and help this community grow.'
                : 'The Sanctuary is open. Monthly support continues quietly.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {campaign.status === 'active' && isGathering ? (
                <Link
                  href={`/c/${campaign.slug}/leaf`}
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Add your leaf
                </Link>
              ) : (
                <Link
                  href={`/c/${campaign.slug}/commitment`}
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Join sustaining circle
                </Link>
              )}
              <Link
                href="/campaigns"
                className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-medium py-4 px-10 rounded-full text-base transition-all duration-200"
              >
                Browse campaigns
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Trust language footer */}
      <section className="py-12 md:py-16 bg-[var(--color-bg)]">
        <div className="trust-language">
          <p className="text-sm text-[var(--color-text-muted)] text-center">
            Tree of Hope is a for-profit service. Your contribution funds the Sanctuary
            and ongoing platform operations. It is not sent to the patient.
          </p>
        </div>
      </section>
    </div>
  )
}
