import { getServiceSupabase } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

// Skin colour definitions — matches the campaign_skins table
const SKIN_COLOURS: Record<string, { hope: string; hopeHover: string; bg?: string }> = {
  classic: {
    hope: '#6B7F5E',
    hopeHover: '#5a6d4e',
  },
  modern: {
    hope: '#4A5D3A',
    hopeHover: '#3d4e30',
  },
}

export default async function CampaignLayout({ children, params }: LayoutProps) {
  const { slug } = await params
  const supabase = getServiceSupabase()

  // Fetch campaign + its skin in one query
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('skin_id, campaign_skins(slug)')
    .eq('slug', slug)
    .single()

  // Resolve skin — default to classic if not set
  const skinSlug = (campaign?.campaign_skins as any)?.slug || 'classic'
  const colours = SKIN_COLOURS[skinSlug] || SKIN_COLOURS.classic

  return (
    <div
      data-skin={skinSlug}
      style={{
        '--color-hope': colours.hope,
        '--color-hope-hover': colours.hopeHover,
        ...(colours.bg ? { '--color-bg': colours.bg } : {}),
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
