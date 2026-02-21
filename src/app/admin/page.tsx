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

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
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

  const statCards = [
    {
      icon: '🌿',
      label: 'Total Campaigns',
      value: stats ? stats.total_active + stats.total_draft + stats.total_paused : 0,
      subtext: `${stats?.total_active || 0} active`,
      gradient: 'from-emerald-50 to-green-50',
    },
    {
      icon: '👥',
      label: 'Total Supporters',
      value: stats?.total_supporters.toLocaleString() || 0,
      subtext: 'Across all campaigns',
      gradient: 'from-blue-50 to-cyan-50',
    },
    {
      icon: '💳',
      label: 'Monthly Revenue',
      value: stats ? formatCurrency(stats.total_monthly_revenue) : '$0',
      subtext: 'From recurring commitments',
      gradient: 'from-amber-50 to-orange-50',
    },
    {
      icon: '🌉',
      label: 'Bridge Pipeline',
      value: stats?.bridge_pipeline_count || 0,
      subtext: 'Campaigns scouted',
      gradient: 'from-purple-50 to-pink-50',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1
            className="text-4xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {getGreeting()}
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            Dashboard & campaign management
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center gap-2 bg-[var(--color-hope)] hover:shadow-lg text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>+</span>
            <span>New Campaign</span>
          </Link>
          <Link
            href="/admin/bridge"
            className="inline-flex items-center gap-2 border-2 border-[var(--color-hope)] text-[var(--color-hope)] hover:bg-[var(--color-hope)] hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>🌉</span>
            <span>Bridge Scanner</span>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && !loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 border border-white/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                      {card.label}
                    </div>
                    <div
                      className="text-3xl font-bold text-[var(--color-text)] mb-2"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {card.value}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {card.subtext}
                    </div>
                  </div>
                  <div className="text-3xl opacity-50">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[var(--color-border)] animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Recent Campaigns */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-[var(--color-border)]">
            <h2
              className="text-2xl font-bold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Recent Campaigns
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Leaves
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Supporters
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Monthly
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 10).map((campaign, index) => (
                    <tr
                      key={campaign.id}
                      className={`transition-colors duration-200 ${
                        index !== campaigns.length - 1
                          ? 'border-b border-[var(--color-border)]'
                          : ''
                      } hover:bg-[var(--color-bg)]`}
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
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                            campaign.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : campaign.status === 'draft'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-medium">
                        {campaign.leaf_count}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-medium">
                        {campaign.supporter_count}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text)] font-medium">
                        {formatCurrency(campaign.monthly_total_cents)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/campaigns/${campaign.id}`}
                          className="text-[var(--color-hope)] hover:text-[var(--color-hope)] font-semibold text-sm transition-colors duration-200 hover:underline"
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
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🌳</div>
              <p className="text-[var(--color-text-muted)]">
                No campaigns yet. Create one to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
