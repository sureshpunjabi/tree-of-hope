'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import SanctuaryShell from '@/components/sanctuary/SanctuaryShell'
import { Plus, X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

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
  const [formData, setFormData] = useState({ name: '', dosage: '', frequency: '', reason: '', notes: '' })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) { router.push(`/s/${slug}/claim`); return }
    if (authLoading || !slug || !user) return

    const fetchMedications = async () => {
      try {
        const response = await fetch(`/api/sanctuary/${slug}/medications?user_id=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        const sorted = (result.medications || []).sort((a: Medication, b: Medication) => {
          if (a.active && !b.active) return -1
          if (!a.active && b.active) return 1
          return a.name.localeCompare(b.name)
        })
        setMedications(sorted)
        trackEvent('tool_used', { tool: 'medications' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
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
        body: JSON.stringify({ user_id: user.id, ...formData, active: true }),
      })
      if (!response.ok) throw new Error('Failed to save')
      const result = await response.json()
      setMedications([result.medication, ...medications])
      setFormData({ name: '', dosage: '', frequency: '', reason: '', notes: '' })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/sanctuary/${slug}/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })
      if (!response.ok) throw new Error('Failed to update')
      const result = await response.json()
      setMedications(
        medications.map((m) => (m.id === id ? result.medication : m))
          .sort((a, b) => { if (a.active && !b.active) return -1; if (!a.active && b.active) return 1; return a.name.localeCompare(b.name) })
      )
    } catch { setError('Failed to update') }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sanctuary/${slug}/medications/${id}`, { method: 'DELETE' })
      setMedications(medications.filter((m) => m.id !== id))
    } catch { setError('Failed to delete') }
  }

  const activeMeds = medications.filter((m) => m.active)
  const inactiveMeds = medications.filter((m) => !m.active)

  return (
    <SanctuaryShell title="My Routine" subtitle="Track what you take" showBack backHref={`/s/${slug}/tools`}>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-24 skeleton" />)}</div>
      ) : (
        <div className="space-y-6">
          {error && <div className="rounded-xl p-4 text-[14px] text-red-700 bg-red-50 border border-red-100">{error}</div>}

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all hover:bg-[var(--color-hope-hover)]">
              <Plus className="w-4 h-4" /> Add to routine
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 border border-black/[0.06] space-y-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>Add to your routine</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X className="w-4 h-4" /></button>
              </div>

              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" required
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} placeholder="Dosage (e.g., 10mg)"
                  className="px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />
                <input type="text" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} placeholder="Frequency"
                  className="px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />
              </div>

              <input type="text" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason (optional)"
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />

              <div className="flex gap-3">
                <button type="submit" disabled={submitting || !formData.name.trim()} className="flex-1 py-3 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all hover:bg-[var(--color-hope-hover)] disabled:opacity-40">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="py-3 px-6 rounded-full text-[var(--color-text-muted)] font-medium text-[15px] border border-black/[0.06] hover:bg-black/[0.02] transition-all">Cancel</button>
              </div>
            </form>
          )}

          {medications.length > 0 ? (
            <div className="space-y-6">
              {activeMeds.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-3">Active</p>
                  <div className="space-y-2">
                    {activeMeds.map((med) => (
                      <div key={med.id} className="rounded-2xl p-5 border border-black/[0.04] flex items-start gap-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                        <button onClick={() => handleToggle(med.id, med.active)} className="mt-0.5 text-[var(--color-hope)]">
                          <ToggleRight className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold text-[var(--color-text)]">{med.name}</h3>
                          <p className="text-[13px] text-[var(--color-text-muted)]">
                            {[med.dosage, med.frequency].filter(Boolean).join(' · ') || 'No details'}
                          </p>
                          {med.reason && <p className="text-[12px] text-[var(--color-text-muted)] mt-1">For: {med.reason}</p>}
                        </div>
                        <button onClick={() => handleDelete(med.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inactiveMeds.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-3">Paused</p>
                  <div className="space-y-2">
                    {inactiveMeds.map((med) => (
                      <div key={med.id} className="rounded-2xl p-5 border border-black/[0.04] flex items-start gap-4 opacity-60" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                        <button onClick={() => handleToggle(med.id, med.active)} className="mt-0.5 text-[var(--color-text-muted)]">
                          <ToggleLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold text-[var(--color-text)] line-through">{med.name}</h3>
                          <p className="text-[13px] text-[var(--color-text-muted)]">{med.dosage || 'No details'}</p>
                        </div>
                        <button onClick={() => handleDelete(med.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !showForm ? (
            <div className="text-center py-16">
              <p className="text-[22px] font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Nothing here yet.</p>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-6">Keep track of what you take, so you don&apos;t have to remember.</p>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[var(--color-hope)] text-white font-medium py-3 px-7 rounded-full text-[15px] transition-all hover:bg-[var(--color-hope-hover)]">
                <Plus className="w-4 h-4" /> Add your first
              </button>
            </div>
          ) : null}
        </div>
      )}
    </SanctuaryShell>
  )
}
