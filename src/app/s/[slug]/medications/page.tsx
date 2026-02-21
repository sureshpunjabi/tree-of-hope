'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

interface Medication {
  id: string
  name: string
  dosage?: string
  frequency?: string
  reason?: string
  notes?: string
  active: boolean
}

export default function MedicationsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    reason: '',
    notes: '',
  })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
      return
    }

    if (authLoading || !slug || !user) return

    const fetchMedications = async () => {
      try {
        const response = await fetch(
          `/api/sanctuary/${slug}/medications?user_id=${user.id}`
        )
        if (!response.ok) throw new Error('Failed to fetch medications')
        const result = await response.json()
        const sorted = (result.medications || []).sort((a: Medication, b: Medication) => {
          if (a.active && !b.active) return -1
          if (!a.active && b.active) return 1
          return a.name.localeCompare(b.name)
        })
        setMedications(sorted)
        trackEvent('tool_used', { tool: 'medications' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load medications')
      } finally {
        setLoading(false)
      }
    }

    fetchMedications()
  }, [authLoading, user, slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/sanctuary/${slug}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          active: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to save medication')

      const result = await response.json()
      setMedications([result.medication, ...medications])
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        reason: '',
        notes: '',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medication')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/sanctuary/${slug}/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (!response.ok) throw new Error('Failed to update medication')

      const result = await response.json()
      const sorted = medications
        .map((m) => (m.id === id ? result.medication : m))
        .sort((a, b) => {
          if (a.active && !b.active) return -1
          if (!a.active && b.active) return 1
          return a.name.localeCompare(b.name)
        })
      setMedications(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medication')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return

    try {
      const response = await fetch(`/api/sanctuary/${slug}/medications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete medication')

      setMedications(medications.filter((m) => m.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medication')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)]">Loading medications...</p>
        </div>
      </div>
    )
  }

  const activeMedications = medications.filter((m) => m.active)
  const inactiveMedications = medications.filter((m) => !m.active)

  return (
    <div className="sanctuary-bg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] sticky top-0 z-40">
        <div className="page-container flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Medications</h1>
          <Link href={`/s/${slug}/tools`} className="btn-secondary text-sm">
            ← Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* New Medication Button or Form */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full btn-primary mb-8"
          >
            New Medication
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Add medication</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Medication Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Aspirin"
                required
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Dosage
                </label>
                <input
                  id="dosage"
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 10mg"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Frequency
                </label>
                <input
                  id="frequency"
                  type="text"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="e.g., Once daily"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Reason / Condition
              </label>
              <input
                id="reason"
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., High blood pressure"
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !formData.name.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Medication'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Medications List */}
        {medications.length > 0 ? (
          <div className="space-y-6">
            {/* Active Medications */}
            {activeMedications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Active</h2>
                <div className="space-y-4">
                  {activeMedications.map((med) => (
                    <div key={med.id} className="card">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--color-text)]">
                            {med.name}
                          </h3>
                          {med.dosage && (
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {med.dosage}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(med.id, med.active)}
                            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-hope)] font-medium"
                          >
                            Mark inactive
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {med.frequency && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Frequency: {med.frequency}
                        </p>
                      )}
                      {med.reason && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                          For: {med.reason}
                        </p>
                      )}
                      {med.notes && (
                        <p className="text-sm text-[var(--color-text)] mt-2">
                          {med.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Medications */}
            {inactiveMedications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-muted)] mb-4">Inactive</h2>
                <div className="space-y-4">
                  {inactiveMedications.map((med) => (
                    <div key={med.id} className="card opacity-75">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--color-text)] line-through">
                            {med.name}
                          </h3>
                          {med.dosage && (
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {med.dosage}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(med.id, med.active)}
                            className="text-sm text-[var(--color-leaf-1)] hover:text-color-leaf-2 font-medium"
                          >
                            Mark active
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !showForm ? (
          <div className="card text-center py-12">
            <p className="text-[var(--color-text-muted)] mb-4 text-lg">
              No medications yet. Add one to stay on track.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add your first medication
            </button>
          </div>
        ) : null}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)]">
        <div className="page-container flex justify-around py-4">
          <Link
            href={`/s/${slug}/journal`}
            className="flex flex-col items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-leaf-1)] transition-colors"
          >
            <span className="text-xl">📔</span>
            <span className="text-xs font-medium">Journal</span>
          </Link>
          <Link
            href={`/s/${slug}`}
            className="flex flex-col items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-leaf-1)] transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">Today</span>
          </Link>
          <Link
            href={`/s/${slug}/tools`}
            className="flex flex-col items-center gap-1 text-[var(--color-leaf-1)] transition-colors"
          >
            <span className="text-xl">🛠️</span>
            <span className="text-xs font-medium">Tools</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
