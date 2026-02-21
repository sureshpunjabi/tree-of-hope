'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

interface SymptomLog {
  id: string
  symptom: string
  severity: number
  notes?: string
  created_at: string
}

export default function SymptomsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<SymptomLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    symptom: '',
    severity: 5,
    notes: '',
  })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
      return
    }

    if (authLoading || !slug || !user) return

    const fetchLogs = async () => {
      try {
        const response = await fetch(
          `/api/sanctuary/${slug}/symptoms?user_id=${user.id}`
        )
        if (!response.ok) throw new Error('Failed to fetch symptoms')
        const result = await response.json()
        setLogs((result.logs || []).sort((a: SymptomLog, b: SymptomLog) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
        trackEvent('tool_used', { tool: 'symptoms' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load symptoms')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [authLoading, user, slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.symptom.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/sanctuary/${slug}/symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
        }),
      })

      if (!response.ok) throw new Error('Failed to save symptom log')

      const result = await response.json()
      setLogs([result.log, ...logs])
      setFormData({
        symptom: '',
        severity: 5,
        notes: '',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save symptom log')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return

    try {
      const response = await fetch(`/api/sanctuary/${slug}/symptoms/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete log')

      setLogs(logs.filter((l) => l.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete log')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)]">Loading symptoms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sanctuary-bg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] sticky top-0 z-40">
        <div className="page-container flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Symptoms</h1>
          <Link href={`/s/${slug}/tools`} className="btn-secondary text-sm">
            ← Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container py-8">
        {/* Evolving State Message */}
        <div className="evolving-state mb-8">
          <p className="text-lg text-[var(--color-text)] mb-2 font-semibold">
            Growing with our families
          </p>
          <p className="text-[var(--color-text-muted)]">
            We're building this tool with our early families. It'll be ready soon — and your experience is helping shape it.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* New Log Button or Form */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full btn-primary mb-8"
          >
            Log a symptom
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Log your symptom</h2>

            <div>
              <label htmlFor="symptom" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Symptom
              </label>
              <input
                id="symptom"
                type="text"
                value={formData.symptom}
                onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                placeholder="e.g., Headache, nausea, fatigue"
                required
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Severity (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="severity"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-[var(--color-hope)] w-12 text-center">
                  {formData.severity}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional details..."
                rows={3}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !formData.symptom.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Log'}
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

        {/* Logs List */}
        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="card">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {log.symptom}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {new Date(log.created_at).toLocaleDateString('en-US', {
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
                    onClick={() => handleDelete(log.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Severity</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i < log.severity
                            ? 'bg-gradient-to-r from-color-leaf-1 to-color-hope'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{log.severity}/10</p>
                </div>
                {log.notes && (
                  <p className="text-sm text-[var(--color-text)]">
                    {log.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <div className="card text-center py-12">
            <p className="text-[var(--color-text-muted)] mb-4 text-lg">
              No symptoms logged yet. Track them to understand your patterns.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Log your first symptom
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
