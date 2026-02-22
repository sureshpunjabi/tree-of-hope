'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import SanctuaryShell from '@/components/sanctuary/SanctuaryShell'
import { Plus, X, Trash2, MapPin, User } from 'lucide-react'

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
  const [formData, setFormData] = useState({ title: '', provider: '', location: '', date_time: '', description: '' })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) { router.push(`/s/${slug}/claim`); return }
    if (authLoading || !slug || !user) return

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/sanctuary/${slug}/appointments?user_id=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setAppointments(
          (result.appointments || []).sort((a: Appointment, b: Appointment) =>
            new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
          )
        )
        trackEvent('tool_used', { tool: 'appointments' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
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
        body: JSON.stringify({ user_id: user.id, ...formData }),
      })
      if (!response.ok) throw new Error('Failed to save')
      const result = await response.json()
      setAppointments(
        [...appointments, result.appointment].sort((a, b) =>
          new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        )
      )
      setFormData({ title: '', provider: '', location: '', date_time: '', description: '' })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sanctuary/${slug}/appointments/${id}`, { method: 'DELETE' })
      setAppointments(appointments.filter((a) => a.id !== id))
    } catch { setError('Failed to delete') }
  }

  const isUpcoming = (dt: string) => new Date(dt) > new Date()
  const upcoming = appointments.filter((a) => isUpcoming(a.date_time))
  const past = appointments.filter((a) => !isUpcoming(a.date_time))

  return (
    <SanctuaryShell title="My Calendar" subtitle="Keep track of visits" showBack backHref={`/s/${slug}/tools`}>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-24 skeleton" />)}</div>
      ) : (
        <div className="space-y-6">
          {error && <div className="rounded-xl p-4 text-[14px] text-red-700 bg-red-50 border border-red-100">{error}</div>}

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all hover:bg-[var(--color-hope-hover)]">
              <Plus className="w-4 h-4" /> New appointment
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 border border-black/[0.06] space-y-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>Add appointment</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X className="w-4 h-4" /></button>
              </div>

              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="What is it for?" required
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} placeholder="Provider"
                  className="px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Location"
                  className="px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />
              </div>

              <input type="datetime-local" value={formData.date_time} onChange={(e) => setFormData({ ...formData, date_time: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />

              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Notes (optional)" rows={2}
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all resize-none" />

              <div className="flex gap-3">
                <button type="submit" disabled={submitting || !formData.title.trim() || !formData.date_time} className="flex-1 py-3 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all hover:bg-[var(--color-hope-hover)] disabled:opacity-40">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="py-3 px-6 rounded-full text-[var(--color-text-muted)] font-medium text-[15px] border border-black/[0.06] hover:bg-black/[0.02] transition-all">Cancel</button>
              </div>
            </form>
          )}

          {appointments.length > 0 ? (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-3">Upcoming</p>
                  <div className="space-y-2">
                    {upcoming.map((apt) => (
                      <div key={apt.id} className="rounded-2xl p-5 border border-black/[0.04]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-[15px] font-semibold text-[var(--color-text)]">{apt.title}</h3>
                            <p className="text-[13px] text-[var(--color-hope)] font-medium mt-0.5">
                              {new Date(apt.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {' at '}
                              {new Date(apt.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                          <button onClick={() => handleDelete(apt.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[12px] text-[var(--color-text-muted)]">
                          {apt.provider && <span className="flex items-center gap-1"><User className="w-3 h-3" />{apt.provider}</span>}
                          {apt.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{apt.location}</span>}
                        </div>
                        {apt.description && <p className="text-[13px] text-[var(--color-text-muted)] mt-2">{apt.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-3">Past</p>
                  <div className="space-y-2">
                    {past.map((apt) => (
                      <div key={apt.id} className="rounded-2xl p-5 border border-black/[0.04] opacity-60" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-[15px] font-semibold text-[var(--color-text)]">{apt.title}</h3>
                            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                              {new Date(apt.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <button onClick={() => handleDelete(apt.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !showForm ? (
            <div className="text-center py-16">
              <p className="text-[22px] font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>No appointments yet.</p>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-6">Stay organized by tracking your upcoming visits.</p>
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
