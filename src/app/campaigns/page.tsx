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
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                Active campaigns
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Trees growing
                <br />
                <span className="text-[var(--color-hope)]">right now.</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
                Each tree represents a circle of care forming around someone who needs it.
                Add your leaf and make a commitment.
              </p>
            </div>

            <div className="relative hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-hope)] to-transparent opacity-[0.08] rounded-full blur-3xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--color-hope)] to-transparent opacity-[0.06] rounded-full blur-2xl scale-100" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={460}
                  height={476}
                  className="relative z-10 drop-shadow-2xl transition-all duration-300 hover:drop-shadow-3xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CAMPAIGN GRID ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🌱</div>
              <h2
                className="text-3xl font-bold text-[var(--color-text)] mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                No active campaigns yet.
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-md mx-auto">
                Check back soon, or contact us to start a Tree for someone you love.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCampaigns.map((campaign) => {
                const dayNumber = getDayNumber(new Date(campaign.created_at))
                const isGathering = dayNumber <= 5

                return (
                  <Link
                    key={campaign.id}
                    href={`/c/${campaign.slug}`}
                    className="group bg-[var(--color-bg)] rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-muted)]">
                        {isGathering ? `Day ${dayNumber} of 5` : 'Circle formed'}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-bold px-3 py-1 rounded-full',
                          isGathering
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {isGathering ? 'Gathering' : 'Complete'}
                      </span>
                    </div>

                    <h3
                      className="text-2xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-hope)] transition-colors"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {campaign.patient_name}
                    </h3>

                    <p className="text-[var(--color-text-muted)] mb-6 line-clamp-2 leading-relaxed">
                      {campaign.story || campaign.title}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
                      <span className="font-medium">{campaign.leaf_count || 0} leaves</span>
                      <span className="font-medium">{campaign.supporter_count || 0} supporters</span>
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
