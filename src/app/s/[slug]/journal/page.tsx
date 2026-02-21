'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood_score?: number
  created_at: string
}

const moodEmojis = ['😢', '😟', '😐', '🙂', '😄']

export default function JournalPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_score: 3,
  })
  const [submitting, setSubmitting] = useState(false)

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
      return
    }

    if (authLoading || !slug || !user) return

    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `/api/sanctuary/${slug}/journal?user_id=${user.id}`
        )
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

  if (authLoading || loading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)]">Loading your journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sanctuary-bg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] sticky top-0 z-40">
        <div className="page-container flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Your Journal</h1>
          <Link href={`/s/${slug}`} className="btn-secondary text-sm">
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

        {/* New Entry Button or Form */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full btn-primary mb-8"
          >
            New Entry
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Write a new entry</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your entry a title..."
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                How are you feeling today?
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Your thoughts, feelings, and reflections..."
                rows={6}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-hope)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Mood
              </label>
              <div className="flex justify-between gap-2">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood_score: index + 1 })}
                    className={`flex-1 text-3xl p-3 rounded-lg transition-all ${
                      formData.mood_score === index + 1
                        ? 'bg-[var(--color-leaf-2)] ring-2 ring-[var(--color-leaf-1)] scale-110'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !formData.content.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Entry'}
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

        {/* Entries List */}
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {entry.mood_score && (
                    <div className="text-2xl">
                      {moodEmojis[entry.mood_score - 1]}
                    </div>
                  )}
                </div>
                <p className="text-[var(--color-text)] line-clamp-3">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <div className="card text-center py-12">
            <p className="text-[var(--color-text-muted)] mb-4 text-lg">
              Your journal is waiting. Start writing whenever you're ready.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Write your first entry
            </button>
          </div>
        ) : null}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)]">
        <div className="page-container flex justify-around py-4">
          <Link
            href={`/s/${slug}/journal`}
            className="flex flex-col items-center gap-1 text-[var(--color-leaf-1)] transition-colors"
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
            className="flex flex-col items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-leaf-1)] transition-colors"
          >
            <span className="text-xl">🛠️</span>
            <span className="text-xs font-medium">Tools</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
