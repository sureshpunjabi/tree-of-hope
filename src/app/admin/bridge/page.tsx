'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'

type BridgeStatus = 'scouted' | 'pre-built' | 'active' | 'claimed'

interface BridgeCampaign {
  id: string
  slug: string
  gofundme_url: string
  title: string
  organiser_name: string
  amount_raised_cents: number
  goal_amount_cents: number
  donor_count: number
  category: string
  status: BridgeStatus
  outreach_count: number
  created_at: string
}

interface PipelineStats {
  scouted: number
  prebuilt: number
  active: number
  claimed: number
}

export default function BridgeScannerPage() {
  const [campaigns, setCampaigns] = useState<BridgeCampaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<BridgeCampaign[]>([])
  const [stats, setStats] = useState<PipelineStats>({
    scouted: 0,
    prebuilt: 0,
    active: 0,
    claimed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | BridgeStatus>('all')
  const [showScoutForm, setShowScoutForm] = useState(false)
  const [scouting, setScouting] = useState(false)

  const [scoutForm, setScoutForm] = useState({
    gofundme_url: '',
    title: '',
    organiser_name: '',
    amount_raised_dollars: '',
    goal_amount_dollars: '',
    donor_count: '',
    category: '',
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [campaigns, activeFilter])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/bridge')
      if (!response.ok) {
        throw new Error('Failed to fetch bridge campaigns')
      }

      const data = await response.json()
      const bridgeCampaigns = data.data || data || []
      setCampaigns(bridgeCampaigns)

      // Calculate stats
      const newStats = {
        scouted: bridgeCampaigns.filter((c: BridgeCampaign) => c.status === 'scouted').length,
        prebuilt: bridgeCampaigns.filter((c: BridgeCampaign) => c.status === 'pre-built').length,
        active: bridgeCampaigns.filter((c: BridgeCampaign) => c.status === 'active').length,
        claimed: bridgeCampaigns.filter((c: BridgeCampaign) => c.status === 'claimed').length,
      }
      setStats(newStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = () => {
    if (activeFilter === 'all') {
      setFilteredCampaigns(campaigns)
    } else {
      setFilteredCampaigns(
        campaigns.filter((c) => c.status === activeFilter)
      )
    }
  }

  const handleScoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setScouting(true)
    setError(null)

    try {
      // Validate required fields
      if (!scoutForm.gofundme_url.trim()) {
        throw new Error('GoFundMe URL is required')
      }

      const response = await fetch('/api/admin/bridge/scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofundme_url: scoutForm.gofundme_url,
          title: scoutForm.title || undefined,
          organiser_name: scoutForm.organiser_name || undefined,
          amount_raised_cents: scoutForm.amount_raised_dollars
            ? parseInt(scoutForm.amount_raised_dollars) * 100
            : undefined,
          goal_amount_cents: scoutForm.goal_amount_dollars
            ? parseInt(scoutForm.goal_amount_dollars) * 100
            : undefined,
          donor_count: scoutForm.donor_count
            ? parseInt(scoutForm.donor_count)
            : undefined,
          category: scoutForm.category || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to scout campaign')
      }

      // Reset form and refresh
      setScoutForm({
        gofundme_url: '',
        title: '',
        organiser_name: '',
        amount_raised_dollars: '',
        goal_amount_dollars: '',
        donor_count: '',
        category: '',
      })
      setShowScoutForm(false)
      await fetchCampaigns()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setScouting(false)
    }
  }

  const handleStatusChange = async (
    campaignId: string,
    newStatus: BridgeStatus
  ) => {
    try {
      const response = await fetch(`/api/admin/bridge/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update bridge campaign status')
      }

      await fetchCampaigns()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text)]">
            GoFundMe Bridge Scanner
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Discover and pre-build Tree of Hope campaigns from GoFundMe
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Scout Form Toggle */}
        {!showScoutForm ? (
          <button
            onClick={() => setShowScoutForm(true)}
            className="btn-primary"
          >
            + Scout New Campaign
          </button>
        ) : (
          <form
            onSubmit={handleScoutSubmit}
            className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-4"
          >
            <h2 className="text-lg font-serif font-bold text-[var(--color-text)]">
              Scout New GoFundMe Campaign
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GoFundMe URL */}
              <div className="md:col-span-2">
                <label htmlFor="gofundme_url" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  GoFundMe URL *
                </label>
                <input
                  type="url"
                  id="gofundme_url"
                  value={scoutForm.gofundme_url}
                  onChange={(e) =>
                    setScoutForm((prev) => ({
                      ...prev,
                      gofundme_url: e.target.value,
                    }))
                  }
                  placeholder="https://www.gofundme.com/..."
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  required
                  disabled={scouting}
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Campaign Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={scoutForm.title}
                  onChange={(e) =>
                    setScoutForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Campaign title"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  disabled={scouting}
                />
              </div>

              {/* Organiser Name */}
              <div>
                <label htmlFor="organiser_name" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Organiser Name
                </label>
                <input
                  type="text"
                  id="organiser_name"
                  value={scoutForm.organiser_name}
                  onChange={(e) =>
                    setScoutForm((prev) => ({
                      ...prev,
                      organiser_name: e.target.value,
                    }))
                  }
                  placeholder="Organiser name"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  disabled={scouting}
                />
              </div>

              {/* Amount Raised */}
              <div>
                <label htmlFor="amount_raised" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Amount Raised ($)
                </label>
                <input
                  type="number"
                  id="amount_raised"
                  value={scoutForm.amount_raised_dollars}
                  onChange={(e) =>
                    setScoutForm((prev) => ({
                      ...prev,
                      amount_raised_dollars: e.target.value,
                    }))
                  }
                  placeholder="5000"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  disabled={scouting}
                />
              </div>

              {/* Goal Amount */}
              <div>
                <label htmlFor="goal_amount" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Goal Amount ($)
                </label>
                <input
                  type="number"
                  id="goal_amount"
                  value={scoutForm.goal_amount_dollars}
                  onChange={(e) =>
                    setScoutForm((prev) => ({
                      ...prev,
                      goal_amount_dollars: e.target.value,
                    }))
                  }
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  disabled={scouting}
                />
              </div>

              {/* Donor Count */}
              <div>
                <label htmlFor="donor_count" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Donor Count
                </label>
                <input
                  type="number"
                  id="donor_count"
                  value={scoutForm.donor_count}
                  onChange={(e) =>
                    setScoutForm((prev) => ({
                      ...prev,
                      donor_count: e.target.value,
                    }))
                  }
                  placeholder="150"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  disabled={scouting}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={scoutForm.category}
                  onChange={(e) =>
                    setScoutForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Medical, Emergency, etc."
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  disabled={scouting}
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-[var(--color-border)] pt-4">
              <button
                type="submit"
                disabled={scouting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scouting ? 'Scouting...' : 'Add to Pipeline'}
              </button>
              <button
                type="button"
                onClick={() => setShowScoutForm(false)}
                disabled={scouting}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Pipeline Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">Pipeline Summary</p>
          <p className="text-lg font-bold text-blue-700 mt-2">
            Pipeline: <span className="text-[var(--color-text)]">{stats.scouted}</span> scouted →{' '}
            <span className="text-[var(--color-text)]">{stats.prebuilt}</span> pre-built →{' '}
            <span className="text-[var(--color-text)]">{stats.active}</span> active →{' '}
            <span className="text-[var(--color-text)]">{stats.claimed}</span> claimed
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'scouted', 'pre-built', 'active', 'claimed'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() =>
                  setActiveFilter(status === 'all' ? 'all' : (status as BridgeStatus))
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeFilter === status
                    ? 'bg-[var(--color-hope)] text-white'
                    : 'bg-white border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'All Campaigns' : status.replace('-', ' ').toUpperCase()}
                {status !== 'all' && (
                  <span className="ml-2 font-semibold">
                    {status === 'scouted'
                      ? stats.scouted
                      : status === 'pre-built'
                        ? stats.prebuilt
                        : status === 'active'
                          ? stats.active
                          : stats.claimed}
                  </span>
                )}
              </button>
            )
          )}
        </div>

        {/* Campaigns List */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-serif font-bold text-[var(--color-text)]">
              Bridge Campaigns ({filteredCampaigns.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Organiser
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Raised / Goal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Donors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-[var(--color-border)] hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--color-text)]">
                            {campaign.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {campaign.category}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                        {campaign.organiser_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                        ${(campaign.amount_raised_cents / 100).toFixed(0)} / $
                        {(campaign.goal_amount_cents / 100).toFixed(0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                        {campaign.donor_count}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'claimed'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : campaign.status === 'pre-built'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {campaign.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {campaign.status === 'scouted' && (
                            <>
                              <Link
                                href={`/admin/bridge/${campaign.id}`}
                                className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                              >
                                Pre-build
                              </Link>
                              <button
                                onClick={() =>
                                  handleStatusChange(campaign.id, 'scouted')
                                }
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                              >
                                Skip
                              </button>
                            </>
                          )}
                          {campaign.status === 'pre-built' && (
                            <>
                              <Link
                                href={`/admin/bridge/${campaign.id}`}
                                className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() =>
                                  handleStatusChange(campaign.id, 'active')
                                }
                                className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                              >
                                Activate
                              </button>
                            </>
                          )}
                          {campaign.status === 'active' && (
                            <Link
                              href={`/admin/bridge/${campaign.id}`}
                              className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                            >
                              View
                            </Link>
                          )}
                          {campaign.status === 'claimed' && (
                            <Link
                              href={`/admin/bridge/${campaign.id}`}
                              className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                            >
                              View Tree
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--color-text-muted)]">
              No campaigns in this category yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
