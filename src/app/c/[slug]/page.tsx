import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { TrustBadge } from '@/components/layout/TrustBadge'
import { formatCurrency } from '@/lib/utils'
import CampaignTreeSection from './campaign-tree-section'

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
  target_cents: number
  current_cents: number
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {campaign.title}
              </h1>
              <p className="text-lg text-gray-600">
                Supporting {campaign.patient_name}
              </p>
            </div>
            <TrustBadge />
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(campaign.current_cents)} of{' '}
                  {formatCurrency(campaign.target_cents)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min((campaign.current_cents / campaign.target_cents) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {campaign.supporter_count || 0} supporters · {campaign.leaf_count || 0} leaves
            </div>
          </div>

          {/* Story Section */}
          {campaign.story && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {campaign.patient_name}'s Story
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{campaign.story}</p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tree Visualization */}
          <CampaignTreeSection leaves={leaves} patientName={campaign.patient_name} />

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Button */}
            <Link
              href={`/c/${campaign.slug}/checkout`}
              className={cn(
                'block w-full px-6 py-3 text-center font-semibold rounded-lg transition-all',
                campaign.status === 'active'
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              )}
            >
              {campaign.status === 'active' ? 'Support This Campaign' : 'Campaign Ended'}
            </Link>

            {/* Info Cards */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Quick Info
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
                  <dd className="text-sm font-semibold text-gray-900 capitalize">
                    {campaign.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Created</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Recent Leaves */}
            {leaves.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Recent Leaves
                </h3>
                <div className="space-y-3">
                  {leaves.slice(0, 3).map((leaf) => (
                    <div key={leaf.id} className="border-l-2 border-green-200 pl-3">
                      <p className="text-xs font-medium text-gray-500">
                        {leaf.author_name}
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {leaf.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Leaves Section */}
        {leaves.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All Leaves ({leaves.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaves.map((leaf) => (
                <div
                  key={leaf.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {leaf.author_name}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {leaf.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(leaf.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Leaves State */}
        {leaves.length === 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No leaves yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to support {campaign.patient_name}!
            </p>
            {campaign.status === 'active' && (
              <Link
                href={`/c/${campaign.slug}/checkout`}
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                Support This Campaign
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
