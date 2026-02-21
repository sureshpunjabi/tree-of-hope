import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { getDayNumber } from '@/lib/utils'
import ScrollReveal from '@/components/ui/ScrollReveal'

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
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-light tracking-[0.25em] uppercase text-[var(--color-hope)] mb-6">
              ACTIVE CAMPAIGNS
            </p>
            <h1
              className="text-6xl md:text-7xl font-light text-[var(--color-text)] leading-[1.05] mb-8"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Trees growing right now.
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto">
              Each tree represents a circle of care forming around someone who needs it.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CAMPAIGN GRID ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allCampaigns.length === 0 ? (
            <div className="text-center py-20">
              <h2
                className="text-4xl md:text-5xl font-light text-[var(--color-text)] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                No active campaigns yet.
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto">
                Check back soon, or contact us to start a tree for someone you love.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCampaigns.map((campaign, index) => {
                const dayNumber = getDayNumber(new Date(campaign.created_at))
                const isGathering = dayNumber <= 5

                return (
                  <ScrollReveal key={campaign.id} delay={index * 100}>
                    <Link
                      href={`/c/${campaign.slug}`}
                      className="group block bg-white border-t-2 border-[var(--color-hope)] p-6 md:p-8 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-baseline gap-4 mb-4">
                        <span className="text-sm font-light text-[var(--color-text-muted)]">
                          {isGathering ? `Gathering · Day ${dayNumber} of 5` : 'Circle formed'}
                        </span>
                      </div>

                      <h3
                        className="text-3xl font-light text-[var(--color-text)] mb-4 group-hover:text-[var(--color-hope)] transition-colors"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {campaign.patient_name}
                      </h3>

                      <p className="text-[var(--color-text-muted)] mb-6 line-clamp-2 leading-relaxed text-base">
                        {campaign.story || campaign.title}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
                        <span>{campaign.leaf_count || 0} leaves</span>
                        <span>{campaign.supporter_count || 0} supporters</span>
                      </div>
                    </Link>
                  </ScrollReveal>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
