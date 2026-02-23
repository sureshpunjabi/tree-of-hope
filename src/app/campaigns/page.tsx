import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { getDayNumber } from '@/lib/utils'
import ScrollReveal from '@/components/ui/ScrollReveal'
import SplitText from '@/components/ui/SplitText'
import MagneticButton from '@/components/ui/MagneticButton'
import HeroAtmosphere from '@/components/ui/HeroAtmosphere'
import CampaignEmptyState from '@/components/campaign/CampaignEmptyState'

export const dynamic = 'force-dynamic'

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
        <HeroAtmosphere />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <ScrollReveal>
              <p className="text-[13px] font-medium tracking-[0.2em] uppercase text-[var(--color-hope)] mb-5">
                Active Campaigns
              </p>
            </ScrollReveal>
            <SplitText
              as="h1"
              className="text-[clamp(2.8rem,7vw,5.5rem)] font-semibold text-[var(--color-text)] leading-[1.05] tracking-[-0.03em] mb-6"
            >
              Trees growing right now.
            </SplitText>
            <ScrollReveal delay={300}>
              <p className="text-[clamp(1rem,2vw,1.25rem)] text-[var(--color-text-muted)] leading-relaxed max-w-xl mx-auto">
                Each tree represents a circle of care forming around someone who needs it.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── CAMPAIGN GRID ─── */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {allCampaigns.length === 0 ? (
            <CampaignEmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCampaigns.map((campaign, index) => {
                const dayNumber = getDayNumber(new Date(campaign.created_at))
                const isGathering = dayNumber <= 5
                const progress = Math.min((dayNumber / 5) * 100, 100)

                return (
                  <ScrollReveal key={campaign.id} delay={index * 80}>
                    <Link
                      href={`/c/${campaign.slug}`}
                      className="group block rounded-2xl border border-black/[0.06] bg-white p-7 md:p-8 hover:shadow-xl hover:shadow-black/[0.04] hover:border-[var(--color-hope)]/20 transition-all duration-500 hover:-translate-y-1"
                    >
                      {/* Status badge */}
                      <div className="flex items-center gap-2 mb-5">
                        <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium tracking-wide ${isGathering ? 'text-[var(--color-hope)]' : 'text-[var(--color-text-muted)]'}`}>
                          {isGathering && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-hope)] animate-pulse" />
                          )}
                          {isGathering ? `Day ${dayNumber} of 5` : 'Circle formed'}
                        </span>
                      </div>

                      {/* Name */}
                      <h3
                        className="text-[26px] md:text-[28px] font-semibold text-[var(--color-text)] mb-3 tracking-[-0.02em] leading-tight group-hover:text-[var(--color-hope)] transition-colors duration-300"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {campaign.patient_name}
                      </h3>

                      {/* Story */}
                      <p className="text-[14px] text-[var(--color-text-muted)] mb-6 line-clamp-2 leading-[1.65]">
                        {campaign.story || campaign.title}
                      </p>

                      {/* Progress bar */}
                      {isGathering && (
                        <div className="mb-5">
                          <div className="h-[3px] bg-black/[0.04] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[var(--color-hope)] to-[var(--color-leaf-1)] rounded-full transition-all duration-1000"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-5 text-[13px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                            <path d="M8 12l3 3 5-5" />
                          </svg>
                          {campaign.leaf_count || 0} leaves
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          {campaign.supporter_count || 0} supporters
                        </span>
                      </div>

                      {/* Arrow hint */}
                      <div className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-hope)] opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                        Visit tree <span className="text-[11px]">→</span>
                      </div>
                    </Link>
                  </ScrollReveal>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── START A TREE CTA ─── */}
      <section className="py-16 md:py-32" style={{ backgroundColor: 'rgba(245, 245, 240, 0.5)' }}>
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <ScrollReveal>
            <p className="text-[13px] font-medium tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-5">
              Know someone who needs support?
            </p>
          </ScrollReveal>
          <SplitText
            as="h2"
            className="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold text-[var(--color-text)] leading-[1.08] tracking-[-0.03em] mb-5"
          >
            Plant a tree for them.
          </SplitText>
          <ScrollReveal delay={200}>
            <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.65] mb-10 max-w-md mx-auto">
              In five days, you can build a circle of monthly supporters around someone facing a health crisis. It starts with one leaf.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={350}>
            <MagneticButton strength={0.1} className="inline-block">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3.5 px-10 rounded-full text-[15px] transition-all duration-500 tracking-[0.01em] hover:shadow-xl hover:shadow-[var(--color-hope)]/20 hover:scale-[1.02]"
              >
                Start a campaign
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
