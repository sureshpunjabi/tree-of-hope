'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import SanctuaryShell from '@/components/sanctuary/SanctuaryShell'
import { Plus, X, Trash2 } from 'lucide-react'

interface WellnessLog {
  id: string
  symptom: string
  severity: number
  notes?: string
  created_at: string
}

const severityLabel = (s: number) => {
  if (s <= 2) return 'Mild'
  if (s <= 4) return 'Moderate'
  if (s <= 6) return 'Noticeable'
  if (s <= 8) return 'Significant'
  return 'Intense'
}

const severityColor = (s: number) => {
  if (s <= 2) return 'bg-green-500'
  if (s <= 4) return 'bg-emerald-500'
  if (s <= 6) return 'bg-yellow-500'
  if (s <= 8) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function WellnessPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<WellnessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ symptom: '', severity: 5, notes: '' })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) { router.push(`/s/${slug}/claim`); return }
    if (authLoading || !slug || !user) return

    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/sanctuary/${slug}/symptoms?user_id=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setLogs((result.logs || []).sort((a: WellnessLog, b: WellnessLog) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
        trackEvent('tool_used', { tool: 'wellness' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
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
        body: JSON.stringify({ user_id: user.id, ...formData }),
      })
      if (!response.ok) throw new Error('Failed to save')
      const result = await response.json()
      setLogs([result.log, ...logs])
      setFormData({ symptom: '', severity: 5, notes: '' })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sanctuary/${slug}/symptoms/${id}`, { method: 'DELETE' })
      setLogs(logs.filter((l) => l.id !== id))
    } catch {
      setError('Failed to delete')
    }
  }

  return (
    <SanctuaryShell title="Wellness Log" subtitle="Track how you're feeling" showBack backHref={`/s/${slug}/tools`}>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-24 skeleton" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl p-4 text-[14px] text-red-700 bg-red-50 border border-red-100">{error}</div>
          )}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all duration-300 hover:bg-[var(--color-hope-hover)]"
            >
              <Plus className="w-4 h-4" />
              Log how you feel
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 border border-black/[0.06] space-y-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[var(--color-text)] tracking-[-0.01em]" style={{ fontFamily: 'var(--font-serif)' }}>
                  How are you feeling?
                </h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={formData.symptom}
                onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                placeholder="What are you noticing? (e.g., fatigue, headache)"
                required
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all"
              />

              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[13px] font-medium text-[var(--color-text-muted)]">Intensity</p>
                  <span className="text-[14px] font-semibold text-[var(--color-text)]">
                    {formData.severity}/10 — {severityLabel(formData.severity)}
                  </span>
                </div>
                <input
                  type="range" min="1" max="10"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                  className="w-full accent-[var(--color-hope)]"
                />
                <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mt-1">
                  <span>Mild</span><span>Intense</span>
                </div>
              </div>

              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes or context..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all resize-none"
              />

              <div className="flex gap-3">
                <button type="submit" disabled={submitting || !formData.symptom.trim()} className="flex-1 py-3 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all hover:bg-[var(--color-hope-hover)] disabled:opacity-40">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="py-3 px-6 rounded-full text-[var(--color-text-muted)] font-medium text-[15px] border border-black/[0.06] hover:bg-black/[0.02] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl p-5 border border-black/[0.04] transition-all duration-300 hover:shadow-md hover:shadow-black/[0.03]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-[15px] font-semibold text-[var(--color-text)]">{log.symptom}</h3>
                      <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                        {new Date(log.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(log.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${severityColor(log.severity)}`} style={{ width: `${log.severity * 10}%` }} />
                    </div>
                    <span className="text-[12px] font-medium text-[var(--color-text-muted)] w-16 text-right">
                      {log.severity}/10
                    </span>
                  </div>
                  {log.notes && <p className="text-[13px] text-[var(--color-text-muted)] leading-[1.5]">{log.notes}</p>}
                </div>
              ))}
            </div>
          ) : !showForm ? (
            <div className="text-center py-16">
              <p className="text-[22px] font-semibold text-[var(--color-text)] mb-2 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                Nothing logged yet.
              </p>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-6">
                Tracking how you feel helps you see patterns over time.
              </p>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[var(--color-hope)] text-white font-medium py-3 px-7 rounded-full text-[15px] transition-all hover:bg-[var(--color-hope-hover)]">
                <Plus className="w-4 h-4" />
                Log your first entry
              </button>
            </div>
          ) : null}
        </div>
      )}
    </SanctuaryShell>
  )
}
