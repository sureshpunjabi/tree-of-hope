'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { trackEvent } from '@/lib/analytics'
import SanctuaryShell from '@/components/sanctuary/SanctuaryShell'
import {
  Heart,
  Calendar,
  Pill,
  ListChecks,
  ChevronRight,
} from 'lucide-react'

export default function ToolsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) { router.push(`/s/${slug}/claim`); return }
    if (authLoading || !slug || !user) return
    trackEvent('tool_used', { tool: 'tools_hub' }, slug, user.id)
  }, [authLoading, user, slug, router])

  const tools = [
    {
      href: `/s/${slug}/wellness`,
      icon: Heart,
      label: 'Wellness Log',
      desc: 'Track how you feel day to day. Notice patterns. Understand your body.',
      color: 'rgba(239, 68, 68, 0.08)',
      iconColor: 'text-red-500',
    },
    {
      href: `/s/${slug}/appointments`,
      icon: Calendar,
      label: 'My Calendar',
      desc: 'Keep track of upcoming visits so nothing falls through the cracks.',
      color: 'rgba(59, 130, 246, 0.08)',
      iconColor: 'text-blue-500',
    },
    {
      href: `/s/${slug}/medications`,
      icon: Pill,
      label: 'My Routine',
      desc: 'Manage what you take so you don\'t have to hold it all in your head.',
      color: 'rgba(168, 85, 247, 0.08)',
      iconColor: 'text-purple-500',
    },
    {
      href: `/s/${slug}/tasks`,
      icon: ListChecks,
      label: 'My Goals',
      desc: 'Small steps, tracked. Because progress looks different for everyone.',
      color: 'rgba(74, 103, 65, 0.08)',
      iconColor: 'text-[var(--color-hope)]',
    },
  ]

  return (
    <SanctuaryShell title="Your Tools" subtitle="Everything in one place" showBack>
      <div className="space-y-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-start gap-5 rounded-2xl p-6 border border-black/[0.04] transition-all duration-300 hover:border-black/[0.08] hover:shadow-lg hover:shadow-black/[0.03] hover:scale-[1.01]"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: tool.color }}
              >
                <Icon className={`w-5 h-5 ${tool.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[16px] font-semibold text-[var(--color-text)] tracking-[-0.01em]">
                    {tool.label}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
                <p className="text-[13px] text-[var(--color-text-muted)] leading-[1.5]">
                  {tool.desc}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </SanctuaryShell>
  )
}
