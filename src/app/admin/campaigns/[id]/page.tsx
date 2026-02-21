'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'

interface Campaign {
  id: string
  slug: string
  title: string
  patient_name: string
  story?: string
  status: 'active' | 'draft' | 'paused'
  leaf_count: number
  supporter_count: number
  monthly_total_cents: number
  sanctuary_id?: string
  bridge_id?: string
  created_at: string
  updated_at: string
}

interface Leaf {
  id: string
  author_name: string
  message: string
  is_hidden: boolean
  created_at: string
  is_public: boolean
}

export default function CampaignEditorPage() {
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editData, setEditData] = useState({
    title: '',
    story: '',
    status: 'draft' as 'active' | 'draft' | 'paused',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch campaign
        const campaignResponse = await fetch(`/api/admin/campaigns/${campaignId}`)
        if (!campaignResponse.ok) {
          throw new Error('Failed to fetch campaign')
        }
        const campaignData = await campaignResponse.json()
        const fetchedCampaign = campaignData.data || campaignData
        setCampaign(fetchedCampaign)

        setEditData({
          title: fetchedCampaign.title,
          story: fetchedCampaign.story || '',
          status: fetchedCampaign.status,
        })

        // Fetch leaves
        const leavesResponse = await fetch(
          `/api/admin/campaigns/${campaignId}/leaves`
        )
        if (leavesResponse.ok) {
          const leavesData = await leavesResponse.json()
          setLeaves(leavesData.data || leavesData || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      fetchData()
    }
  }, [campaignId])

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        throw new Error('Failed to save campaign')
      }

      const updated = await response.json()
      setCampaign(updated.data || updated)
      setSuccess(true)
      setEditing(false)

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleLeaf = async (leafId: string, currentHidden: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/campaigns/${campaignId}/leaves/${leafId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_hidden: !currentHidden,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update leaf')
      }

      // Update local state
      setLeaves((prev) =>
        prev.map((leaf) =>
          leaf.id === leafId
            ? { ...leaf, is_hidden: !currentHidden }
            : leaf
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update leaf')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-[var(--color-border)] border-t-[var(--color-hope)] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--color-text-muted)]">Loading campaign...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!campaign) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Campaign not found
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
            {campaign.title}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            For {campaign.patient_name}
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
            Campaign updated successfully!
          </div>
        )}

        {/* Campaign Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium mb-3">Campaign Links</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-blue-600 mb-1">Public Campaign</p>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded border border-blue-200 flex-1 text-xs font-mono text-[var(--color-text)]">
                  /c/{campaign.slug}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`/c/${campaign.slug}`)
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition"
                >
                  Copy
                </button>
              </div>
            </div>

            {campaign.bridge_id && (
              <div>
                <p className="text-xs text-blue-600 mb-1">Bridge Campaign</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded border border-blue-200 flex-1 text-xs font-mono text-[var(--color-text)]">
                    /b/{campaign.slug}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`/b/${campaign.slug}`)
                    }}
                    className="px-3 py-2 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {campaign.sanctuary_id && (
              <Link
                href={`/s/${campaign.slug}`}
                className="inline-block text-xs text-blue-600 hover:text-blue-700 font-medium underline"
              >
                View Sanctuary →
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">
              Leaves
            </p>
            <p className="text-3xl font-serif font-bold text-[var(--color-text)] mt-2">
              {campaign.leaf_count}
            </p>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">
              Supporters
            </p>
            <p className="text-3xl font-serif font-bold text-[var(--color-text)] mt-2">
              {campaign.supporter_count}
            </p>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">
              Monthly Revenue
            </p>
            <p className="text-3xl font-serif font-bold text-[var(--color-text)] mt-2">
              {formatCurrency(campaign.monthly_total_cents)}
            </p>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">
              Status
            </p>
            <p className={`text-lg font-semibold mt-2 ${
              campaign.status === 'active'
                ? 'text-green-600'
                : campaign.status === 'draft'
                  ? 'text-yellow-600'
                  : 'text-gray-600'
            }`}>
              {campaign.status}
            </p>
          </div>
        </div>

        {/* Campaign Editor */}
        <form
          onSubmit={handleSaveChanges}
          className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-6"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-[var(--color-text)]">
                Campaign Details
              </h2>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium text-sm"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  />
                </div>

                {/* Story */}
                <div>
                  <label htmlFor="story" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Story
                  </label>
                  <textarea
                    id="story"
                    value={editData.story}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        story: e.target.value,
                      }))
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        status: e.target.value as 'active' | 'draft' | 'paused',
                      }))
                    }
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    disabled={saving}
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
                    Title
                  </p>
                  <p className="text-[var(--color-text)]">{campaign.title}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">
                    Story
                  </p>
                  <p className="text-[var(--color-text)] whitespace-pre-wrap">
                    {campaign.story || 'No story provided'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Leaves Management */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-serif font-bold text-[var(--color-text)]">
              Leaves ({leaves.length})
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Manage supporter leaves and hide/unhide them from the public tree
            </p>
          </div>

          {leaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leaf) => (
                    <tr
                      key={leaf.id}
                      className="border-b border-[var(--color-border)] hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                        {leaf.author_name || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text)] max-w-xs truncate">
                        {leaf.message}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                        {new Date(leaf.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                            leaf.is_hidden
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {leaf.is_hidden ? 'Hidden' : 'Visible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() =>
                            handleToggleLeaf(leaf.id, leaf.is_hidden)
                          }
                          className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium"
                        >
                          {leaf.is_hidden ? 'Unhide' : 'Hide'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--color-text-muted)]">
              No leaves yet. Share this campaign to get supporters to plant leaves!
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
