import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getServiceSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { getDayNumber } from '@/lib/utils'

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
      {/* ─── HERO ─── Immersive hero with glow effect */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                {isGathering ? `Day ${dayNumber} of 5 · Gathering` : 'Tree complete'}
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] lg:text-[4rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {isGathering
                  ? <>We are gathering around <span className="text-[var(--color-hope)]">{campaign.patient_name}.</span></>
                  : <>The circle has formed around <span className="text-[var(--color-hope)]">{campaign.patient_name}.</span></>}
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                {isGathering
                  ? `A quiet circle is forming to sustain ${campaign.patient_name}'s Sanctuary. Add your leaf and join the community.`
                  : `The Tree is complete. ${totalSupporters} people have come together in support.`}
              </p>
              <div className="flex flex-wrap gap-4">
                {campaign.status === 'active' && isGathering ? (
                  <>
                    <Link
                      href={`/c/${campaign.slug}/leaf`}
                      className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Add your leaf
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
                    >
                      How it works
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/c/${campaign.slug}/commitment`}
                      className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Join sustaining circle
                    </Link>
                    <Link
                      href="#leaves"
                      className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
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

      {/* ─── STATS BAR ─── */}
      <section className="border-y border-[var(--color-border)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
            {[
              { number: isGathering ? `${dayNumber}` : '5', label: isGathering ? 'Day of gathering' : 'Days gathered' },
              { number: `${leaves.length}`, label: 'Leaves on tree' },
              { number: `${totalSupporters}`, label: 'Supporters joined' },
            ].map((stat) => (
              <div key={stat.label} className="py-8 md:py-10 px-6 text-center">
                <div
                  className="text-3xl md:text-4xl font-bold text-[var(--color-hope)] mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {stat.number}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STORY ─── */}
      {campaign.story && (
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              The story
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {campaign.patient_name}&apos;s journey.
            </h2>
            <p className="text-lg text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">
              {campaign.story}
            </p>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              How it works
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Three simple steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add a leaf',
                desc: 'Write a message of hope. It becomes a leaf on the tree — visible to the whole community.',
                icon: '🍃',
              },
              {
                step: '02',
                title: 'Make a commitment',
                desc: 'Choose a monthly tier that fits your life. Pause anytime for hardship, no questions asked.',
                icon: '💚',
              },
              {
                step: '03',
                title: 'Watch it grow',
                desc: 'The tree grows as more people join. After 5 days, a private Sanctuary opens for the patient.',
                icon: '🌳',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[var(--color-bg)] rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold tracking-widest text-[var(--color-hope)] mb-2 uppercase">
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

      {/* ─── LEAVES ─── */}
      <section id="leaves" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {leaves.length > 0 ? (
            <>
              <div className="text-center mb-16">
                <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
                  Messages of hope
                </p>
                <h2
                  className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {leaves.length} {leaves.length === 1 ? 'leaf' : 'leaves'} on the tree.
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaves.map((leaf) => (
                  <div
                    key={leaf.id}
                    className="bg-white rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8f0e4] to-[#d5e0d2] flex items-center justify-center text-lg">
                        🍃
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--color-text)] text-sm">
                          {leaf.author_name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(leaf.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      {leaf.message}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🌱</div>
              <h2
                className="text-3xl font-bold text-[var(--color-text)] mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                No leaves yet.
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-md mx-auto">
                Be the first to support {campaign.patient_name}. Your leaf starts the tree.
              </p>
              {campaign.status === 'active' && (
                <Link
                  href={`/c/${campaign.slug}/leaf`}
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Add the first leaf
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 md:py-28 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/tree-hero.png"
            alt="Tree of Hope"
            width={160}
            height={166}
            className="mx-auto mb-10 drop-shadow-lg"
          />
          <h2
            className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {isGathering
              ? `Join ${campaign.patient_name}'s circle.`
              : `${campaign.patient_name}'s tree is complete.`}
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-xl mx-auto leading-relaxed">
            {isGathering
              ? 'Every leaf matters. Add yours and help this community grow.'
              : 'The Sanctuary is open. Monthly support continues quietly.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {campaign.status === 'active' && isGathering ? (
              <Link
                href={`/c/${campaign.slug}/leaf`}
                className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Add your leaf
              </Link>
            ) : (
              <Link
                href={`/c/${campaign.slug}/commitment`}
                className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Join sustaining circle
              </Link>
            )}
            <Link
              href="/campaigns"
              className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
            >
              Browse campaigns
            </Link>
          </div>
        </div>
      </section>

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
