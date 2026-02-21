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

  // Fetch campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single()

  if (campaignError || !campaign) {
    return notFound()
  }

  // Fetch leaves
  const { data: leavesData } = await supabase
    .from('leaves')
    .select('*')
    .eq('campaign_id', campaign.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const leaves: Leaf[] = leavesData || []

  // Calculate day number (1-5 for active gathering)
  const dayNumber = getDayNumber(new Date(campaign.created_at))
  const isGathering = dayNumber <= 5
  const totalSupporters = campaign.supporter_count || leaves.length || 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section — PRD design: text left, tree right */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Campaign Info */}
            <div>
              {/* Day badge */}
              {campaign.status === 'active' && (
                <span className="inline-block text-sm text-[var(--color-text-muted)] mb-4">
                  {isGathering ? `Day ${dayNumber} of 5` : 'Closed'}
                </span>
              )}

              <h1
                className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {isGathering
                  ? `We are gathering around ${campaign.patient_name}.`
                  : `The circle has formed around ${campaign.patient_name}.`}
              </h1>

              <p className="text-lg text-[var(--color-text-muted)] mb-2 leading-relaxed">
                {isGathering
                  ? `A quiet circle has formed to sustain ${campaign.patient_name}'s Sanctuary.`
                  : `The Tree is complete.`}
              </p>

              {totalSupporters > 0 && (
                <p className="text-[var(--color-text)] mb-6">
                  {totalSupporters} {totalSupporters === 1 ? 'person has' : 'people have'} joined.
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                {campaign.status === 'active' && isGathering ? (
                  <>
                    <Link
                      href={`/c/${campaign.slug}/leaf`}
                      className={cn(
                        'inline-flex items-center justify-center',
                        'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                        'text-white font-semibold py-3 px-8 rounded-full text-base',
                        'transition-all duration-200 hover:shadow-lg'
                      )}
                    >
                      Add your leaf
                    </Link>
                    <Link
                      href="#how-it-works"
                      className={cn(
                        'inline-flex items-center justify-center',
                        'border-2 border-[var(--color-border)] hover:border-[var(--color-text)]',
                        'text-[var(--color-text)] font-semibold py-3 px-8 rounded-full text-base',
                        'transition-all duration-200'
                      )}
                    >
                      How it works
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/c/${campaign.slug}/commitment`}
                      className={cn(
                        'inline-flex items-center justify-center',
                        'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                        'text-white font-semibold py-3 px-8 rounded-full text-base',
                        'transition-all duration-200 hover:shadow-lg'
                      )}
                    >
                      Join sustaining circle
                    </Link>
                    <Link
                      href="#leaves"
                      className={cn(
                        'inline-flex items-center justify-center',
                        'border-2 border-[var(--color-border)] hover:border-[var(--color-text)]',
                        'text-[var(--color-text)] font-semibold py-3 px-8 rounded-full text-base',
                        'transition-all duration-200'
                      )}
                    >
                      View the Tree
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right: Bonsai Tree */}
            <div className="flex justify-center md:justify-end">
              <Image
                src="/tree-hero.png"
                alt={`${campaign.patient_name}'s Tree of Hope`}
                width={460}
                height={476}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      {campaign.story && (
        <section className="py-12 border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-2xl font-bold text-[var(--color-text)] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {campaign.patient_name}&apos;s Story
            </h2>
            <p className="text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">
              {campaign.story}
            </p>
          </div>
        </section>
      )}

      {/* Leaves Section */}
      <section id="leaves" className="py-12 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {leaves.length > 0 ? (
            <>
              <h2
                className="text-2xl font-bold text-[var(--color-text)] mb-8"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Leaves on the Tree ({leaves.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leaves.map((leaf) => (
                  <div
                    key={leaf.id}
                    className="bg-white rounded-lg border border-[var(--color-border)] p-5 hover:shadow-sm transition-shadow"
                  >
                    <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
                      {leaf.author_name}
                    </p>
                    <p className="text-[var(--color-text)] leading-relaxed">
                      {leaf.message}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-3">
                      {new Date(leaf.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2
                className="text-2xl font-bold text-[var(--color-text)] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                No leaves yet
              </h2>
              <p className="text-[var(--color-text-muted)] mb-8">
                Be the first to support {campaign.patient_name}.
              </p>
              {campaign.status === 'active' && (
                <Link
                  href={`/c/${campaign.slug}/leaf`}
                  className={cn(
                    'inline-flex items-center justify-center',
                    'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                    'text-white font-semibold py-3 px-8 rounded-full text-base',
                    'transition-all duration-200 hover:shadow-lg'
                  )}
                >
                  Add your leaf
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust Language */}
      <section className="py-8 border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed">
            Tree of Hope is a for-profit service. Your contribution funds the
            Sanctuary and ongoing platform operations. It is not sent to the
            patient.
          </p>
        </div>
      </section>
    </div>
  )
}
