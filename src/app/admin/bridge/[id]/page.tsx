'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'

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
  status: 'scouted' | 'pre-built' | 'active' | 'claimed'
  campaign_id?: string
  created_at: string
}

interface Campaign {
  id: string
  patient_name: string
  title: string
  story: string
  slug: string
  status: 'draft' | 'active' | 'paused'
}

interface Outreach {
  id: string
  channel: string
  message: string
  response_status?: string
  created_at: string
}

export default function BridgeEditorPage() {
  const params = useParams()
  const bridgeId = params.id as string

  const [bridge, setBridge] = useState<BridgeCampaign | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [outreaches, setOutreaches] = useState<Outreach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editingCampaign, setEditingCampaign] = useState(false)
  const [savingCampaign, setSavingCampaign] = useState(false)

  const [campaignData, setCampaignData] = useState({
    patient_name: '',
    title: '',
    story: '',
  })

  const [showOutreachForm, setShowOutreachForm] = useState(false)
  const [sendingOutreach, setSendingOutreach] = useState(false)
  const [outreachData, setOutreachData] = useState({
    channel: 'email',
    message: '',
  })

  useEffect(() => {
    fetchData()
  }, [bridgeId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch bridge campaign
      const bridgeResponse = await fetch(`/api/admin/bridge/${bridgeId}`)
      if (!bridgeResponse.ok) {
        throw new Error('Failed to fetch bridge campaign')
      }
      const bridgeData = await bridgeResponse.json()
      const fetchedBridge = bridgeData.data || bridgeData
      setBridge(fetchedBridge)

      // Fetch linked campaign if exists
      if (fetchedBridge.campaign_id) {
        const campaignResponse = await fetch(
          `/api/admin/campaigns/${fetchedBridge.campaign_id}`
        )
        if (campaignResponse.ok) {
          const campaignJson = await campaignResponse.json()
          const fetchedCampaign = campaignJson.data || campaignJson
          setCampaign(fetchedCampaign)
          setCampaignData({
            patient_name: fetchedCampaign.patient_name,
            title: fetchedCampaign.title,
            story: fetchedCampaign.story,
          })
        }
      }

      // Fetch outreach log
      const outreachResponse = await fetch(
        `/api/admin/bridge/${bridgeId}/outreach`
      )
      if (outreachResponse.ok) {
        const outreachJson = await outreachResponse.json()
        setOutreaches(outreachJson.data || outreachJson || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!campaign) return

    setSavingCampaign(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        throw new Error('Failed to save campaign')
      }

      const updated = await response.json()
      setCampaign(updated.data || updated)
      setSuccess(true)
      setEditingCampaign(false)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSavingCampaign(false)
    }
  }

  const handleSendOutreach = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSendingOutreach(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/bridge/${bridgeId}/outreach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outreachData),
      })

      if (!response.ok) {
        throw new Error('Failed to send outreach')
      }

      setOutreachData({
        channel: 'email',
        message: '',
      })
      setShowOutreachForm(false)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSendingOutreach(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-[var(--color-border)] border-t-[var(--color-hope)] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--color-text-muted)]">Loading bridge campaign...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!bridge) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Bridge campaign not found
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text)]">
            {bridge.title}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Bridge campaign from {bridge.organiser_name}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Changes saved successfully!
          </div>
        )}

        {/* GoFundMe Campaign Info */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <h2 className="text-lg font-serif font-bold text-[var(--color-text)] mb-4">
            GoFundMe Campaign Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                URL
              </p>
              <a
                href={bridge.gofundme_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] break-all font-medium"
              >
                {bridge.gofundme_url}
              </a>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                Category
              </p>
              <p className="text-[var(--color-text)]">{bridge.category}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                Amount Raised
              </p>
              <p className="text-2xl font-serif font-bold text-[var(--color-text)]">
                ${(bridge.amount_raised_cents / 100).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                Goal Amount
              </p>
              <p className="text-2xl font-serif font-bold text-[var(--color-text)]">
                ${(bridge.goal_amount_cents / 100).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                Donors
              </p>
              <p className="text-2xl font-serif font-bold text-[var(--color-text)]">
                {bridge.donor_count}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                Status
              </p>
              <p className={`text-lg font-semibold ${
                bridge.status === 'claimed'
                  ? 'text-green-600'
                  : bridge.status === 'active'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
              }`}>
                {bridge.status.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Tree of Hope Campaign */}
        {campaign ? (
          <form
            onSubmit={handleSaveCampaign}
            className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold text-[var(--color-text)]">
                  Tree of Hope Campaign
                </h2>
                {!editingCampaign && (
                  <button
                    type="button"
                    onClick={() => setEditingCampaign(true)}
                    className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingCampaign ? (
                <div className="space-y-4">
                  {/* Patient Name */}
                  <div>
                    <label htmlFor="patient_name" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      id="patient_name"
                      value={campaignData.patient_name}
                      onChange={(e) =>
                        setCampaignData((prev) => ({
                          ...prev,
                          patient_name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                      disabled={savingCampaign}
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="campaign_title" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      id="campaign_title"
                      value={campaignData.title}
                      onChange={(e) =>
                        setCampaignData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                      disabled={savingCampaign}
                    />
                  </div>

                  {/* Story */}
                  <div>
                    <label htmlFor="story" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Campaign Story
                    </label>
                    <textarea
                      id="story"
                      value={campaignData.story}
                      onChange={(e) =>
                        setCampaignData((prev) => ({
                          ...prev,
                          story: e.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                      disabled={savingCampaign}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                    <button
                      type="submit"
                      disabled={savingCampaign}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingCampaign ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCampaign(false)}
                      disabled={savingCampaign}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                      Patient Name
                    </p>
                    <p className="text-[var(--color-text)]">{campaign.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                      Campaign Title
                    </p>
                    <p className="text-[var(--color-text)]">{campaign.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                      Story
                    </p>
                    <p className="text-[var(--color-text)] whitespace-pre-wrap">
                      {campaign.story}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                      Campaign Slug
                    </p>
                    <code className="text-[var(--color-text)]">/c/{campaign.slug}</code>
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              No Tree of Hope campaign linked yet. Create one via the Bridge Scanner to pre-build a tree.
            </p>
          </div>
        )}

        {/* Outreach Log */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-[var(--color-text)]">
              Outreach Log ({outreaches.length})
            </h2>
            {!showOutreachForm && (
              <button
                onClick={() => setShowOutreachForm(true)}
                className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
              >
                + Log Outreach
              </button>
            )}
          </div>

          {showOutreachForm && (
            <div className="p-6 border-b border-[var(--color-border)]">
              <form
                onSubmit={handleSendOutreach}
                className="space-y-4"
              >
                {/* Channel */}
                <div>
                  <label htmlFor="channel" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Channel
                  </label>
                  <select
                    id="channel"
                    value={outreachData.channel}
                    onChange={(e) =>
                      setOutreachData((prev) => ({
                        ...prev,
                        channel: e.target.value,
                      }))
                    }
                    disabled={sendingOutreach}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                    <option value="message">Direct Message</option>
                    <option value="meeting">In-person Meeting</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Message / Summary
                  </label>
                  <textarea
                    id="message"
                    value={outreachData.message}
                    onChange={(e) =>
                      setOutreachData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Summary of outreach..."
                    disabled={sendingOutreach}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={sendingOutreach || !outreachData.message.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOutreach ? 'Logging...' : 'Log Outreach'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOutreachForm(false)}
                    disabled={sendingOutreach}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {outreaches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {outreaches.map((outreach) => (
                    <tr
                      key={outreach.id}
                      className="border-b border-[var(--color-border)] hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                          {outreach.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text)] max-w-xs truncate">
                        {outreach.message}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                        {new Date(outreach.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--color-text-muted)]">
              No outreach attempts logged yet.
            </div>
          )}
        </div>

        {/* Bridge URL */}
        {bridge.slug && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-3">Bridge Campaign URL</p>
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded border border-blue-200 flex-1 text-xs font-mono text-[var(--color-text)]">
                /b/{bridge.slug}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`/b/${bridge.slug}`)
                }}
                className="px-3 py-2 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
