'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

interface Appointment {
  id: string
  title: string
  provider?: string
  location?: string
  date_time: string
  description?: string
}

export default function AppointmentsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    location: '',
    date_time: '',
    description: '',
  })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
      return
    }

    if (authLoading || !slug || !user) return

    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `/api/sanctuary/${slug}/appointments?user_id=${user.id}`
        )
        if (!response.ok) throw new Error('Failed to fetch appointments')
        const result = await response.json()
        const sorted = (result.appointments || []).sort(
          (a: Appointment, b: Appointment) =>
            new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        )
        setAppointments(sorted)
        trackEvent('tool_used', { tool: 'appointments' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [authLoading, user, slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim() || !formData.date_time) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/sanctuary/${slug}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
        }),
      })

      if (!response.ok) throw new Error('Failed to save appointment')

      const result = await response.json()
      const sorted = [...appointments, result.appointment].sort(
        (a, b) =>
          new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      )
      setAppointments(sorted)
      setFormData({
        title: '',
        provider: '',
        location: '',
        date_time: '',
        description: '',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      const response = await fetch(`/api/sanctuary/${slug}/appointments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete appointment')

      setAppointments(appointments.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)]">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sanctuary-bg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] sticky top-0 z-40">
        <div className="page-container flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Appointments</h1>
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

        {/* New Appointment Button or Form */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full btn-primary mb-8"
          >
            New Appointment
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Add appointment</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Appointment Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Therapy session"
                required
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Provider
                </label>
                <input
                  id="provider"
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Office address"
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="date_time" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Date & Time
              </label>
              <input
                id="date_time"
                type="datetime-local"
                value={formData.date_time}
                onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                required
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Notes
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !formData.title.trim() || !formData.date_time}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Appointment'}
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

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="card">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {apt.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {new Date(apt.date_time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
                {apt.provider && (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Provider: {apt.provider}
                  </p>
                )}
                {apt.location && (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Location: {apt.location}
                  </p>
                )}
                {apt.description && (
                  <p className="text-sm text-[var(--color-text)] mt-2">
                    {apt.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <div className="card text-center py-12">
            <p className="text-[var(--color-text-muted)] mb-4 text-lg">
              No appointments yet. Add one to stay organized.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add your first appointment
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
