import Link from 'next/link'
import Image from 'next/image'
import { getServiceSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { getDayNumber } from '@/lib/utils'

interface Campaign {
  id: string
  slug: string
  title: string
  patient_name: string
  story?: string
  status: string
  created_at: string
  leaf_count?: number
  supporter_count?: number
}

export default async function CampaignsPage() {
  const supabase = getServiceSupabase()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const allCampaigns: Campaign[] = campaigns || []

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Active campaigns.
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                Each tree represents a circle of care forming around someone who needs it.
                Add your leaf and make a commitment.
              </p>
            </div>
            <div className="hidden md:flex justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope"
                width={380}
                height={393}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Grid */}
      <section className="py-8 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {allCampaigns.length === 0 ? (
            <div className="text-center py-16">
              <h2
                className="text-2xl font-bold text-[var(--color-text)] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                No active campaigns yet
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Check back soon, or contact us to start a Tree for someone you love.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCampaigns.map((campaign) => {
                const dayNumber = getDayNumber(new Date(campaign.created_at))
                const isGathering = dayNumber <= 5

                return (
                  <Link
                    key={campaign.id}
                    href={`/c/${campaign.slug}`}
                    className="group bg-white rounded-xl border border-[var(--color-border)] p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {isGathering ? `Day ${dayNumber} of 5` : 'Circle formed'}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          isGathering
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {isGathering ? 'Gathering' : 'Complete'}
                      </span>
                    </div>

                    <h3
                      className="font-bold text-lg text-[var(--color-text)] mb-1 group-hover:text-[var(--color-hope)] transition-colors"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {campaign.patient_name}
                    </h3>

                    <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
                      {campaign.story || campaign.title}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                      <span>{campaign.leaf_count || 0} leaves</span>
                      <span>{campaign.supporter_count || 0} supporters</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
