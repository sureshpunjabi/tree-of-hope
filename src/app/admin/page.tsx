'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'

interface Campaign {
  id: string
  slug: string
  title: string
  patient_name: string
  status: 'active' | 'draft' | 'paused'
  leaf_count: number
  supporter_count: number
  monthly_total_cents: number
  created_at: string
}

interface AdminStats {
  total_active: number
  total_draft: number
  total_paused: number
  total_supporters: number
  total_monthly_revenue: number
  bridge_pipeline_count: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch campaigns
        const campaignsResponse = await fetch('/api/admin/campaigns')
        if (!campaignsResponse.ok) {
          throw new Error('Failed to fetch campaigns')
        }
        const campaignsData = await campaignsResponse.json()
        const campaignsList = campaignsData.data || campaignsData || []
        setCampaigns(campaignsList)

        // Calculate stats
        const activeCount = campaignsList.filter(
          (c: Campaign) => c.status === 'active'
        ).length
        const draftCount = campaignsList.filter(
          (c: Campaign) => c.status === 'draft'
        ).length
        const pausedCount = campaignsList.filter(
          (c: Campaign) => c.status === 'paused'
        ).length

        const totalSupporters = campaignsList.reduce(
          (sum: number, c: Campaign) => sum + (c.supporter_count || 0),
          0
        )

        const totalMonthly = campaignsList.reduce(
          (sum: number, c: Campaign) => sum + (c.monthly_total_cents || 0),
          0
        )

        // Fetch bridge data
        let bridgeCount = 0
        try {
          const bridgeResponse = await fetch('/api/admin/bridge')
          if (bridgeResponse.ok) {
            const bridgeData = await bridgeResponse.json()
            const bridgeList = bridgeData.data || bridgeData || []
            bridgeCount = bridgeList.filter(
              (b: any) => b.status === 'scouted'
            ).length
          }
        } catch (err) {
          // Bridge data is optional
        }

        setStats({
          total_active: activeCount,
          total_draft: draftCount,
          total_paused: pausedCount,
          total_supporters: totalSupporters,
          total_monthly_revenue: totalMonthly,
          bridge_pipeline_count: bridgeCount,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Tree of Hope Admin
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Dashboard & campaign management
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/campaigns/new"
            className="bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 hover:shadow-md inline-block"
          >
            + New Campaign
          </Link>
          <Link
            href="/admin/bridge"
            className="border-2 border-[var(--color-hope)] text-[var(--color-hope)] hover:bg-[var(--color-hope)] hover:text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 inline-block"
          >
            Bridge Scanner
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && !loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Campaigns */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Total Campaigns
              </div>
              <div className="text-4xl font-bold text-[var(--color-text)] mt-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {stats.total_active + stats.total_draft + stats.total_paused}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-3 space-y-1">
                <div>Active: <span className="font-semibold">{stats.total_active}</span></div>
                <div>Draft: <span className="font-semibold">{stats.total_draft}</span></div>
                <div>Paused: <span className="font-semibold">{stats.total_paused}</span></div>
              </div>
            </div>

            {/* Total Supporters */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Total Supporters
              </div>
              <div className="text-4xl font-bold text-[var(--color-text)] mt-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {stats.total_supporters.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-3">
                Across all campaigns
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Monthly Revenue
              </div>
              <div className="text-4xl font-bold text-[var(--color-text)] mt-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {formatCurrency(stats.total_monthly_revenue)}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-3">
                From recurring commitments
              </div>
            </div>

            {/* Bridge Pipeline */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Bridge Pipeline
              </div>
              <div className="text-4xl font-bold text-[var(--color-text)] mt-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {stats.bridge_pipeline_count}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-3">
                Campaigns scouted
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-[var(--color-border)] rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Recent Campaigns */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>
              Recent Campaigns
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Leaves
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Supporters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Monthly
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 10).map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-[var(--color-border)] hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-[var(--color-text)]">
                            {campaign.title}
                          </div>
                          <div className="text-sm text-[var(--color-text-muted)]">
                            {campaign.patient_name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            /{campaign.slug}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)]">
                        {campaign.leaf_count}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)]">
                        {campaign.supporter_count}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)]">
                        {formatCurrency(campaign.monthly_total_cents)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/campaigns/${campaign.id}`}
                          className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--color-text-muted)]">
              No campaigns yet. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
