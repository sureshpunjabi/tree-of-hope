'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import SanctuaryShell from '@/components/sanctuary/SanctuaryShell'
import ReactMarkdown from 'react-markdown'
import {
  BookOpen,
  Calendar,
  Pill,
  Heart,
  ListChecks,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

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
      content?: string
      content_markdown?: string
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

    if (authLoading || !slug || !user) return

    const fetchSanctuaryData = async () => {
      try {
        const response = await fetch(`/api/sanctuary/${slug}`)
        if (!response.ok) throw new Error('Failed to fetch sanctuary data')
        const result = await response.json()
        setData(result)
        trackEvent('sanctuary_day_viewed', { dayNumber: result.today?.dayNumber }, slug, user?.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sanctuary')
      } finally {
        setLoading(false)
      }
    }

    fetchSanctuaryData()
  }, [authLoading, user, slug, router])

  const dayNumber = data?.today?.dayNumber || 1
  const maxDays = 30
  const progressPercent = (dayNumber / maxDays) * 100
  const content = data?.today?.content

  const quickActions = [
    { href: `/s/${slug}/journal`, icon: BookOpen, label: 'Journal', desc: 'Write your thoughts' },
    { href: `/s/${slug}/wellness`, icon: Heart, label: 'Wellness', desc: 'How are you feeling' },
    { href: `/s/${slug}/appointments`, icon: Calendar, label: 'Calendar', desc: 'Upcoming visits' },
    { href: `/s/${slug}/medications`, icon: Pill, label: 'Routine', desc: 'Track your routine' },
    { href: `/s/${slug}/tasks`, icon: ListChecks, label: 'Goals', desc: 'Things to do' },
  ]

  return (
    <SanctuaryShell>
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl h-40 skeleton" />
          ))}
        </div>
      ) : error || !data ? (
        <div className="text-center py-20">
          <p className="text-[var(--color-text-muted)] mb-6">{error || 'Unable to load your Sanctuary.'}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[var(--color-hope)] text-white font-medium py-3 px-7 rounded-full text-[15px] transition-all duration-300 hover:bg-[var(--color-hope-hover)]"
          >
            Go home
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Day header + progress */}
          <div className="animate-fade-in-up">
            <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-2">
              Your Sanctuary
            </p>
            <h1
              className="text-[clamp(2rem,4vw,2.75rem)] font-semibold text-[var(--color-text)] leading-[1.1] tracking-[-0.02em] mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Day {dayNumber} of {maxDays}.
            </h1>

            {/* Progress bar */}
            <div className="relative">
              <div className="h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, var(--color-hope), var(--color-leaf-1))',
                  }}
                />
              </div>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-2">
                {dayNumber} of {maxDays} days
              </p>
            </div>
          </div>

          {/* Today's content card */}
          {content && (
            <div
              className="rounded-2xl p-7 border border-black/[0.04] animate-fade-in-up-delay-1"
              style={{ backgroundColor: 'rgba(245, 245, 240, 0.6)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[var(--color-hope)]" />
                <span className="text-[12px] font-medium tracking-[0.1em] uppercase text-[var(--color-hope)]">
                  Today&apos;s reflection
                </span>
              </div>

              <h2
                className="text-[24px] font-semibold text-[var(--color-text)] mb-5 tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {content.title}
              </h2>

              <div className="text-[15px] text-[var(--color-text-muted)] leading-[1.7] prose-sanctuary">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h3 className="text-[18px] font-semibold mt-6 mb-3 text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>{children}</h3>
                    ),
                    h2: ({ children }) => (
                      <h3 className="text-[16px] font-semibold mt-5 mb-3 text-[var(--color-text)]" style={{ fontFamily: 'var(--font-serif)' }}>{children}</h3>
                    ),
                    p: ({ children }) => <p className="mb-4 text-[var(--color-text-muted)]">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1.5 text-[var(--color-text-muted)]">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1.5 text-[var(--color-text-muted)]">{children}</ol>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-[var(--color-hope)] pl-4 italic text-[var(--color-text)] mb-4 py-1">{children}</blockquote>
                    ),
                  }}
                >
                  {content.content_markdown || content.content || ''}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Reflection prompt */}
          {content?.reflection_prompt && (
            <div
              className="rounded-2xl p-7 relative overflow-hidden animate-fade-in-up-delay-2"
              style={{ background: 'linear-gradient(135deg, rgba(74, 103, 65, 0.06) 0%, rgba(200, 230, 201, 0.08) 100%)' }}
            >
              <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-[var(--color-hope)] mb-3">
                Reflect
              </p>
              <p
                className="text-[18px] text-[var(--color-text)] leading-[1.5] font-medium tracking-[-0.01em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {content.reflection_prompt}
              </p>
              <Link
                href={`/s/${slug}/journal`}
                className="inline-flex items-center gap-1.5 mt-5 text-[14px] font-medium text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] transition-colors duration-300"
              >
                Write about it
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Quick actions grid */}
          <div className="animate-fade-in-up-delay-3">
            <p className="text-[13px] font-medium tracking-[0.15em] uppercase text-[var(--color-text-muted)] mb-4">
              Your tools
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-2xl p-5 border border-black/[0.04] transition-all duration-300 hover:border-black/[0.08] hover:shadow-lg hover:shadow-black/[0.03] hover:scale-[1.02]"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-hope)]/[0.08] flex items-center justify-center mb-3 group-hover:bg-[var(--color-hope)]/[0.12] transition-colors duration-300">
                      <Icon className="w-4.5 h-4.5 text-[var(--color-hope)]" />
                    </div>
                    <p className="text-[14px] font-medium text-[var(--color-text)] tracking-[-0.01em]">
                      {action.label}
                    </p>
                    <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                      {action.desc}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* No content fallback */}
          {!content && (
            <div
              className="rounded-2xl p-8 text-center border border-black/[0.04]"
              style={{ backgroundColor: 'rgba(245, 245, 240, 0.5)' }}
            >
              <p className="text-[var(--color-text-muted)] mb-5 text-[15px] leading-[1.6]">
                Today&apos;s reflection is on its way. In the meantime, take a moment to write.
              </p>
              <Link
                href={`/s/${slug}/journal`}
                className="inline-flex items-center justify-center bg-[var(--color-hope)] text-white font-medium py-3 px-7 rounded-full text-[15px] transition-all duration-300 hover:bg-[var(--color-hope-hover)]"
              >
                Open journal
              </Link>
            </div>
          )}
        </div>
      )}
    </SanctuaryShell>
  )
}
