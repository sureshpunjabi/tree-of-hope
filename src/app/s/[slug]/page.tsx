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
      <div className="sanctuary-bg min-h-screen flex items-center justify-center relative overflow-hidden">
        <style>{`
          @keyframes pulse-tree {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .pulse-tree {
            animation: pulse-tree 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .shimmer-overlay {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
        `}</style>
        <div className="text-center">
          <div className="relative">
            <div className="text-8xl mb-6 pulse-tree">🌳</div>
            <div className="shimmer-overlay absolute inset-0 rounded-full" />
          </div>
          <p className="text-[var(--color-text-muted)] font-medium">Loading your Sanctuary...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="sanctuary-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-lg max-w-md text-center border border-[var(--color-border)]">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">Unable to load Sanctuary</h2>
          <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">{error}</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-[var(--color-leaf-1)] text-white rounded-full font-semibold hover:bg-[var(--color-leaf-2)] transition-colors"
          >
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
    <div className="sanctuary-bg min-h-screen pb-24">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .progress-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes lift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .hover-lift:hover {
          animation: lift 0.3s ease-out forwards;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] sticky top-0 z-40 shadow-sm">
        <div className="page-container flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>Day {dayNumber} of {maxDays}</h1>
          </div>
          <Link href="/" className="px-4 py-2 bg-[var(--color-leaf-1)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-leaf-2)] transition-colors">
            ← Back
          </Link>
        </div>

        {/* Progress Bar with Shimmer */}
        <div className="page-container mt-4">
          <div className="bg-[var(--color-leaf-4)] rounded-full h-3 overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-[var(--color-leaf-1)] to-[var(--color-leaf-2)] h-full transition-all duration-500 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="progress-shimmer absolute inset-0" />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-2 font-medium">
            {dayNumber} of {maxDays} days complete
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container py-8">
        {content ? (
          <div className="space-y-8">
            {/* Today's Content Card */}
            <div className="bg-white rounded-3xl p-8 border border-[var(--color-border)] shadow-sm">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-serif)' }}>{content.title}</h2>
              <div className="prose prose-sm max-w-none text-[var(--color-text)] leading-relaxed">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }} {...props} />,
                    h2: ({ node, ...props }) => <h3 className="text-lg font-bold mt-6 mb-3 text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }} {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-[var(--color-text)]" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-[var(--color-text)]" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-[var(--color-text)]" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1 text-[var(--color-text)]" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-[var(--color-leaf-2)] pl-4 italic text-[var(--color-text-muted)] mb-4 py-2" {...props} />
                    ),
                  }}
                >
                  {content.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Reflection Prompt Card */}
            {content.reflection_prompt && (
              <div className="bg-gradient-to-br from-[var(--color-leaf-4)] via-[var(--color-sanctuary)] to-[var(--color-leaf-3)] rounded-3xl p-8 border border-[var(--color-leaf-1)] shadow-md relative overflow-hidden">
                <div className="absolute top-2 right-2 text-3xl opacity-10">🌿</div>
                <p className="text-xs font-bold text-[var(--color-leaf-1)] uppercase tracking-widest mb-3">
                  Reflection for Today
                </p>
                <p className="text-lg text-[var(--color-text)] leading-relaxed font-medium">
                  {content.reflection_prompt}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href={`/s/${slug}/journal`}
                className="hover-lift block p-6 bg-white border border-[var(--color-border)] rounded-3xl text-center transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="text-4xl mb-3">✍️</div>
                <p className="font-bold text-[var(--color-text)] text-lg">Write in journal</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Express your thoughts</p>
              </Link>
              <Link
                href={`/s/${slug}/tools`}
                className="hover-lift block p-6 bg-white border border-[var(--color-border)] rounded-3xl text-center transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="text-4xl mb-3">🛠️</div>
                <p className="font-bold text-[var(--color-text)] text-lg">View tools</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Healing resources</p>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-[var(--color-border)] text-center shadow-sm">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
              Today's content is coming soon. Check back later.
            </p>
            <Link 
              href={`/s/${slug}/journal`} 
              className="inline-block px-6 py-3 bg-[var(--color-leaf-1)] text-white rounded-full font-semibold hover:bg-[var(--color-leaf-2)] transition-colors"
            >
              Write in your journal
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Pill Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] shadow-lg">
        <div className="page-container flex justify-center gap-4 py-4">
          <Link
            href={`/s/${slug}/journal`}
            className="flex flex-col items-center gap-1 px-6 py-3 rounded-full bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-leaf-4)] hover:text-[var(--color-leaf-1)] transition-all duration-200"
          >
            <span className="text-xl">📔</span>
            <span className="text-xs font-semibold">Journal</span>
          </Link>
          <div
            className="flex flex-col items-center gap-1 px-6 py-3 rounded-full bg-[var(--color-leaf-4)] text-[var(--color-leaf-1)] transition-all duration-200"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-semibold">Today</span>
          </div>
          <Link
            href={`/s/${slug}/tools`}
            className="flex flex-col items-center gap-1 px-6 py-3 rounded-full bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-leaf-4)] hover:text-[var(--color-leaf-1)] transition-all duration-200"
          >
            <span className="text-xl">🛠️</span>
            <span className="text-xs font-semibold">Tools</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
