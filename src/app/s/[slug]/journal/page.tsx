'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import SanctuaryShell from '@/components/sanctuary/SanctuaryShell'
import { Plus, X } from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood_score?: number
  created_at: string
}

const moodLabels = ['Struggling', 'Difficult', 'Okay', 'Good', 'Great']
const moodColors = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-green-100 text-green-700 border-green-200',
]

export default function JournalPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', mood_score: 3 })
  const [submitting, setSubmitting] = useState(false)

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) { router.push(`/s/${slug}/claim`); return }
    if (authLoading || !slug || !user) return

    const fetchEntries = async () => {
      try {
        const response = await fetch(`/api/sanctuary/${slug}/journal?user_id=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch entries')
        const result = await response.json()
        setEntries(result.entries || [])
        trackEvent('tool_used', { tool: 'journal' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entries')
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [authLoading, user, slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.content.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/sanctuary/${slug}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: formData.title || 'Untitled',
          content: formData.content,
          mood_score: formData.mood_score,
        }),
      })
      if (!response.ok) throw new Error('Failed to save entry')
      const result = await response.json()
      setEntries([result.entry, ...entries])
      setFormData({ title: '', content: '', mood_score: 3 })
      setShowForm(false)
      trackEvent('journal_entry_created', { mood_score: formData.mood_score }, slug, user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SanctuaryShell title="Journal" subtitle="Your private space to reflect" showBack>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-28 skeleton" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl p-4 text-[14px] text-red-700 bg-red-50 border border-red-100">
              {error}
            </div>
          )}

          {/* New entry button / form */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all duration-300 hover:bg-[var(--color-hope-hover)] hover:shadow-lg hover:shadow-[var(--color-hope)]/20"
            >
              <Plus className="w-4 h-4" />
              New entry
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 border border-black/[0.06] space-y-5"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-[18px] font-semibold text-[var(--color-text)] tracking-[-0.01em]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  What&apos;s on your mind?
                </h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title (optional)"
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 focus:border-[var(--color-hope)]/40 transition-all"
              />

              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write freely. This is yours alone."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-white text-[var(--color-text)] text-[15px] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)]/30 focus:border-[var(--color-hope)]/40 transition-all resize-none leading-[1.6]"
              />

              {/* Mood selector */}
              <div>
                <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-3">How are you feeling?</p>
                <div className="flex gap-2">
                  {moodLabels.map((label, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood_score: index + 1 })}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all duration-200 ${
                        formData.mood_score === index + 1
                          ? `${moodColors[index]} scale-105 shadow-sm`
                          : 'bg-black/[0.02] text-[var(--color-text-muted)] border-transparent hover:bg-black/[0.04]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !formData.content.trim()}
                  className="flex-1 py-3 rounded-full bg-[var(--color-hope)] text-white font-medium text-[15px] transition-all duration-300 hover:bg-[var(--color-hope-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="py-3 px-6 rounded-full text-[var(--color-text-muted)] font-medium text-[15px] border border-black/[0.06] hover:bg-black/[0.02] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Entries */}
          {entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl p-6 border border-black/[0.04] transition-all duration-300 hover:shadow-md hover:shadow-black/[0.03]"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[var(--color-text)] tracking-[-0.01em]">
                        {entry.title}
                      </h3>
                      <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    {entry.mood_score && (
                      <span className={`text-[11px] font-medium px-3 py-1 rounded-full border ${moodColors[entry.mood_score - 1]}`}>
                        {moodLabels[entry.mood_score - 1]}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-[var(--color-text-muted)] leading-[1.6] line-clamp-3">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          ) : !showForm ? (
            <div className="text-center py-16">
              <p
                className="text-[22px] font-semibold text-[var(--color-text)] mb-2 tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Your journal is waiting.
              </p>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-6">
                Start writing whenever you&apos;re ready.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-hope)] text-white font-medium py-3 px-7 rounded-full text-[15px] transition-all duration-300 hover:bg-[var(--color-hope-hover)]"
              >
                <Plus className="w-4 h-4" />
                Write your first entry
              </button>
            </div>
          ) : null}
        </div>
      )}
    </SanctuaryShell>
  )
}
