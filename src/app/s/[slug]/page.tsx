'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import ReactMarkdown from 'react-markdown'

interface SanctuaryData {
  campaign?: {
    id: string
    title: string
    sanctuary_start_date?: string
  }
  today?: {
    dayNumber: number
    content?: {
      id: string
      day_number: number
      title: string
      content: string
      reflection_prompt?: string
    } | null
  }
}

export default function SanctuaryHomePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<SanctuaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
      return
    }

    if (authLoading || !slug) return

    const fetchSanctuaryData = async () => {
      try {
        const response = await fetch(`/api/sanctuary/${slug}`)
        if (!response.ok) throw new Error('Failed to fetch sanctuary data')
        const result = await response.json()
        setData(result)
        trackEvent('sanctuary_day_viewed', { dayNumber: result.today?.dayNumber }, slug, user?.id)
        trackEvent('tool_used', { tool: 'sanctuary' }, slug, user?.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sanctuary')
      } finally {
        setLoading(false)
      }
    }

    fetchSanctuaryData()
  }, [authLoading, user, slug, router])

  if (authLoading || loading) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-color-text-muted">Loading your Sanctuary...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold text-color-text mb-2">Unable to load Sanctuary</h2>
          <p className="text-color-text-muted mb-4">{error}</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const dayNumber = data.today?.dayNumber || 1
  const maxDays = 30
  const progressPercent = (dayNumber / maxDays) * 100
  const content = data.today?.content

  return (
    <div className="sanctuary-bg min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-color-border sticky top-0 z-40">
        <div className="page-container flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-color-text">Day {dayNumber} of {maxDays}</h1>
          </div>
          <Link href="/" className="btn-secondary text-sm">
            ← Back
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="page-container mt-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-color-leaf-1 to-color-leaf-2 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-color-text-muted mt-2">
            {dayNumber} of {maxDays} days complete
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container py-8">
        {content ? (
          <div className="space-y-8">
            {/* Today's Content */}
            <div>
              <h2 className="text-3xl font-bold text-color-text mb-4">{content.title}</h2>
              <div className="prose prose-sm max-w-none text-color-text leading-relaxed">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-color-leaf-2 pl-4 italic text-color-text-muted mb-4" {...props} />
                    ),
                  }}
                >
                  {content.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Reflection Prompt */}
            {content.reflection_prompt && (
              <div className="bg-gradient-to-br from-color-leaf-4 to-color-sanctuary rounded-lg p-6 border-l-4 border-color-leaf-1">
                <p className="text-sm font-semibold text-color-text uppercase tracking-wide mb-2">
                  Reflection for today
                </p>
                <p className="text-lg text-color-text leading-relaxed">
                  {content.reflection_prompt}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href={`/s/${slug}/journal`}
                className="block p-4 bg-white border border-color-border rounded-lg hover:shadow-md transition-shadow text-center"
              >
                <div className="text-2xl mb-2">✍️</div>
                <p className="font-semibold text-color-text">Write in journal</p>
              </Link>
              <Link
                href={`/s/${slug}/tools`}
                className="block p-4 bg-white border border-color-border rounded-lg hover:shadow-md transition-shadow text-center"
              >
                <div className="text-2xl mb-2">🛠️</div>
                <p className="font-semibold text-color-text">View tools</p>
              </Link>
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-color-text-muted mb-4">
              Today's content is coming soon. Check back later.
            </p>
            <Link href={`/s/${slug}/journal`} className="btn-primary">
              Write in your journal
            </Link>
          </div>
        )}
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
            className="flex flex-col items-center gap-1 text-color-leaf-1 transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">Today</span>
          </Link>
          <Link
            href={`/s/${slug}/tools`}
            className="flex flex-col items-center gap-1 text-color-text-muted hover:text-color-leaf-1 transition-colors"
          >
            <span className="text-xl">🛠️</span>
            <span className="text-xs font-medium">Tools</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
