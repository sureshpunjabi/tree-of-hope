'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    patient_name: '',
    title: '',
    slug: '',
    story: '',
    status: 'draft' as 'draft' | 'active',
    seed_sanctuary: false,
  })

  const handlePatientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      patient_name: value,
      slug: slugify(value),
    }))
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      slug: slugify(e.target.value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.patient_name.trim()) {
        throw new Error('Patient name is required')
      }
      if (!formData.title.trim()) {
        throw new Error('Campaign title is required')
      }
      if (!formData.slug.trim()) {
        throw new Error('Slug is required')
      }

      // Create campaign
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          title: formData.title,
          slug: formData.slug,
          story: formData.story,
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create campaign')
      }

      const campaign = await response.json()
      const campaignId = campaign.data?.id || campaign.id

      // Optionally seed sanctuary
      if (formData.seed_sanctuary) {
        try {
          await fetch('/api/admin/sanctuary/seed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: campaignId,
            }),
          })
        } catch (err) {
          // Sanctuary seeding is optional, don't fail campaign creation
          console.warn('Failed to seed sanctuary:', err)
        }
      }

      setSuccess(true)
      // Redirect to campaign editor
      setTimeout(() => {
        router.push(`/admin/campaigns/${campaignId}`)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text)]">
            Create New Campaign
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Build a micro-campaign to support someone in need
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
            Campaign created successfully! Redirecting...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-[var(--color-border)] rounded-lg p-6">
          {/* Patient Name */}
          <div>
            <label htmlFor="patient_name" className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              id="patient_name"
              value={formData.patient_name}
              onChange={handlePatientNameChange}
              placeholder="e.g., Sarah Johnson"
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
              required
              disabled={loading}
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              The name of the person this campaign supports
            </p>
          </div>

          {/* Campaign Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="e.g., Help Sarah with Cancer Treatment"
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
              required
              disabled={loading}
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              The public-facing title of the campaign
            </p>
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Campaign Slug *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-muted)]">/c/</span>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="sarah-johnson"
                className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Auto-generated from patient name, but you can customize it. Must be unique.
            </p>
          </div>

          {/* Story */}
          <div>
            <label htmlFor="story" className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Campaign Story
            </label>
            <textarea
              id="story"
              value={formData.story}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  story: e.target.value,
                }))
              }
              placeholder="Share Sarah's story... (Markdown supported)"
              rows={8}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] text-[var(--color-text)]"
              disabled={loading}
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Tell the story of why support matters. Markdown formatting is supported.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
              Campaign Status *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as 'draft' | 'active',
                    }))
                  }
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-[var(--color-text)]">
                  Draft (Not public yet)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as 'draft' | 'active',
                    }))
                  }
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-[var(--color-text)]">
                  Active (Live now)
                </span>
              </label>
            </div>
          </div>

          {/* Seed Sanctuary */}
          <div className="border-t border-[var(--color-border)] pt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.seed_sanctuary}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seed_sanctuary: e.target.checked,
                  }))
                }
                disabled={loading}
                className="w-4 h-4 mt-1"
              />
              <div>
                <span className="text-[var(--color-text)] font-medium">
                  Create & seed sanctuary content
                </span>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Automatically creates 30 sanctuary days for the patient to track their journey
                </p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="border-t border-[var(--color-border)] pt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
