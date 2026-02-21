'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'

interface Tool {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'evolving'
  href: string
}

export default function ToolsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
      return
    }

    if (authLoading || !slug || !user) return

    trackEvent('tool_used', { tool: 'tools_hub' }, slug, user.id)
  }, [authLoading, user, slug, router])

  const tools: Tool[] = [
    {
      id: 'appointments',
      name: 'Appointments',
      description: 'Track your appointments',
      icon: '📅',
      status: 'active',
      href: `/s/${slug}/appointments`,
    },
    {
      id: 'medications',
      name: 'Medications',
      description: 'Manage your medications',
      icon: '💊',
      status: 'active',
      href: `/s/${slug}/medications`,
    },
    {
      id: 'symptoms',
      name: 'Symptoms',
      description: 'Log how you\'re feeling',
      icon: '📊',
      status: 'evolving',
      href: `/s/${slug}/symptoms`,
    },
    {
      id: 'tasks',
      name: 'Tasks',
      description: 'Care tasks and to-dos',
      icon: '✓',
      status: 'evolving',
      href: `/s/${slug}/tasks`,
    },
  ]

  const activeTools = tools.filter((t) => t.status === 'active')
  const evolvingTools = tools.filter((t) => t.status === 'evolving')

  if (authLoading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)]">Loading tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sanctuary-bg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] sticky top-0 z-40">
        <div className="page-container flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Your Care Tools</h1>
          <Link href={`/s/${slug}`} className="btn-secondary text-sm">
            ← Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container py-8">
        {/* Active Tools Section */}
        {activeTools.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="card group hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-[var(--color-text-muted)]">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Evolving Tools Section */}
        {evolvingTools.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">Coming Soon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {evolvingTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="evolving-state group transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-[var(--color-text-muted)] mb-4">
                    {tool.description}
                  </p>
                  <p className="text-sm text-[var(--color-leaf-1)] font-medium">
                    We're growing this tool with our early families. It'll be ready soon — and your experience is helping shape it.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
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
