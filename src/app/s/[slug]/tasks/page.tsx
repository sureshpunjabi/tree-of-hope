'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
  })

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
      return
    }

    if (authLoading || !slug || !user) return

    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `/api/sanctuary/${slug}/tasks?user_id=${user.id}`
        )
        if (!response.ok) throw new Error('Failed to fetch tasks')
        const result = await response.json()
        const sorted = (result.tasks || []).sort((a: Task, b: Task) => {
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          return new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime()
        })
        setTasks(sorted)
        trackEvent('tool_used', { tool: 'tasks' }, slug, user.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks')
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
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          completed: false,
        }),
      })

      if (!response.ok) throw new Error('Failed to save task')

      const result = await response.json()
      setTasks([...tasks, result.task])
      setFormData({
        title: '',
        description: '',
        due_date: '',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleComplete = async (id: string, currentCompleted: boolean) => {
    try {
      const response = await fetch(`/api/sanctuary/${slug}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      const result = await response.json()
      const sorted = tasks
        .map((t) => (t.id === id ? result.task : t))
        .sort((a, b) => {
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          return new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime()
        })
      setTasks(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/sanctuary/${slug}/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

      setTasks(tasks.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-color-text-muted">Loading tasks...</p>
        </div>
      </div>
    )
  }

  const incompleteTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  return (
    <div className="sanctuary-bg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-color-border sticky top-0 z-40">
        <div className="page-container flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-color-text">Tasks</h1>
          <Link href={`/s/${slug}/tools`} className="btn-secondary text-sm">
            ← Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container py-8">
        {/* Evolving State Message */}
        <div className="evolving-state mb-8">
          <p className="text-lg text-color-text mb-2 font-semibold">
            Growing with our families
          </p>
          <p className="text-color-text-muted">
            We're building this tool with our early families. It'll be ready soon — and your experience is helping shape it.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* New Task Button or Form */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full btn-primary mb-8"
          >
            New Task
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
            <h2 className="text-xl font-bold text-color-text">Add a new task</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-color-text mb-2">
                Task
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Call doctor for test results"
                required
                className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-hope bg-white text-color-text placeholder-color-text-muted"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-color-text mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any details..."
                rows={3}
                className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-hope bg-white text-color-text placeholder-color-text-muted resize-none"
              />
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-color-text mb-2">
                Due Date
              </label>
              <input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-color-border rounded-lg focus:outline-none focus:ring-2 focus:ring-color-hope bg-white text-color-text placeholder-color-text-muted"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !formData.title.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Add Task'}
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

        {/* Tasks List */}
        {tasks.length > 0 ? (
          <div className="space-y-6">
            {/* Incomplete Tasks */}
            {incompleteTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-color-text mb-4">To Do</h2>
                <div className="space-y-3">
                  {incompleteTasks.map((task) => (
                    <div
                      key={task.id}
                      className="card flex items-start gap-4"
                    >
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 border-color-border hover:border-color-leaf-1 transition-colors flex items-center justify-center"
                      >
                        {task.completed && (
                          <span className="text-color-leaf-1 font-bold">✓</span>
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-color-text">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-color-text-muted mt-1">
                            {task.description}
                          </p>
                        )}
                        {task.due_date && (
                          <p className="text-xs text-color-text-muted mt-2">
                            Due: {new Date(task.due_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-color-text-muted mb-4">Done</h2>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="card opacity-75 flex items-start gap-4"
                    >
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-color-leaf-1 border-2 border-color-leaf-1 hover:bg-color-leaf-2 transition-colors flex items-center justify-center"
                      >
                        <span className="text-white font-bold">✓</span>
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-color-text line-through">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-color-text-muted mt-1 line-through">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !showForm ? (
          <div className="card text-center py-12">
            <p className="text-color-text-muted mb-4 text-lg">
              No tasks yet. Create one to stay organized.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add your first task
            </button>
          </div>
        ) : null}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-color-border">
        <div className="page-container flex justify-around py-4">
          <Link
            href={`/s/${slug}/journal`}
            className="flex flex-col items-center gap-1 text-color-text-muted hover:text-color-leaf-1 transition-colors"
          >
            <span className="text-xl">📔</span>
            <span className="text-xs font-medium">Journal</span>
          </Link>
          <Link
            href={`/s/${slug}`}
            className="flex flex-col items-center gap-1 text-color-text-muted hover:text-color-leaf-1 transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">Today</span>
          </Link>
          <Link
            href={`/s/${slug}/tools`}
            className="flex flex-col items-center gap-1 text-color-leaf-1 transition-colors"
          >
            <span className="text-xl">🛠️</span>
            <span className="text-xs font-medium">Tools</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
