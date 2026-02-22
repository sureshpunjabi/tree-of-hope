'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import SanctuaryShell from '@/components/sanctuary/SanctuaryShell'
import { Plus, X, Trash2, Circle, CheckCircle2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  due_date?: string
  completed: boolean
  created_at: string
}

export default function TasksPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', due_date: '' })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) { router.push(`/s/${slug}/claim`); return }
    if (authLoading || !slug || !user) return

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/sanctuary/${slug}/tasks?user_id=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setTasks(
          (result.tasks || []).sort((a: Task, b: Task) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            return new Date(a.due_date || '9999').getTime() - new Date(b.due_date || '9999').getTime()
          })
        )
        trackEvent('tool_used', { tool: 'tasks' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [authLoading, user, slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim()) return
    setSubmitting(true)
    try {
      const response = await fetch(`/api/sanctuary/${slug}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, ...formData, completed: false }),
      })
      if (!response.ok) throw new Error('Failed to save')
      const result = await response.json()
      setTasks([result.task, ...tasks])
      setFormData({ title: '', description: '', due_date: '' })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/sanctuary/${slug}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (!response.ok) throw new Error('Failed to update')
      const result = await response.json()
      setTasks(
        tasks.map((t) => (t.id === id ? result.task : t))
          .sort((a, b) => { if (a.completed !== b.completed) return a.completed ? 1 : -1; return 0 })
      )
    } catch { setError('Failed to update') }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sanctuary/${slug}/tasks/${id}`, { method: 'DELETE' })
      setTasks(tasks.filter((t) => t.id !== id))
    } catch { setError('Failed to delete') }
  }

  const incomplete = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  return (
    <SanctuaryShell title="My Goals" subtitle="One step at a time" showBack backHref={`/s/${slug}/tools`}>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-20 skeleton" />)}</div>
      ) : (
        <div className="space-y-6">
          {error && <div className="rounded-xl p-4 text-[14px] text-red-700 bg-red-50 border border-red-100">{error}</div>}

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all hover:bg-[var(--color-hope-hover)]">
              <Plus className="w-4 h-4" /> Add a goal
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 border border-black/[0.06] space-y-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>What would you like to do?</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X className="w-4 h-4" /></button>
              </div>

              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Go for a short walk" required
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />

              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Details (optional)" rows={2}
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all resize-none" />

              <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 transition-all" />

              <div className="flex gap-3">
                <button type="submit" disabled={submitting || !formData.title.trim()} className="flex-1 py-3 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all hover:bg-[var(--color-hope-hover)] disabled:opacity-40">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="py-3 px-6 rounded-full text-[var(--color-text-muted)] font-medium text-[15px] border border-black/[0.06] hover:bg-black/[0.02] transition-all">Cancel</button>
              </div>
            </form>
          )}

          {tasks.length > 0 ? (
            <div className="space-y-6">
              {incomplete.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-3">To do</p>
                  <div className="space-y-2">
                    {incomplete.map((task) => (
                      <div key={task.id} className="rounded-2xl p-5 border border-black/[0.04] flex items-start gap-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                        <button onClick={() => handleToggle(task.id, task.completed)} className="mt-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors">
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold text-[var(--color-text)]">{task.title}</h3>
                          {task.description && <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">{task.description}</p>}
                          {task.due_date && (
                            <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                              Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <button onClick={() => handleDelete(task.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completed.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-3">Done</p>
                  <div className="space-y-2">
                    {completed.map((task) => (
                      <div key={task.id} className="rounded-2xl p-5 border border-black/[0.04] flex items-start gap-4 opacity-60" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
                        <button onClick={() => handleToggle(task.id, task.completed)} className="mt-0.5 text-[var(--color-hope)]">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold text-[var(--color-text)] line-through">{task.title}</h3>
                        </div>
                        <button onClick={() => handleDelete(task.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
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
              <p className="text-[22px] font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>No goals yet.</p>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-6">Small steps make a big difference.</p>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[var(--color-hope)] text-white font-medium py-3 px-7 rounded-full text-[15px] transition-all hover:bg-[var(--color-hope-hover)]">
                <Plus className="w-4 h-4" /> Set your first goal
              </button>
            </div>
          ) : null}
        </div>
      )}
    </SanctuaryShell>
  )
}
