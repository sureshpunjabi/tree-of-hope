'use client'

import { useEffect } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Home, BookOpen, Wrench, Sparkles } from 'lucide-react'

interface SanctuaryShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
}

export default function SanctuaryShell({
  children,
  title,
  subtitle,
  showBack = false,
  backHref,
}: SanctuaryShellProps) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const slug = params?.slug as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/s/${slug}/claim`)
    }
  }, [authLoading, user, slug, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--color-hope)]/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-[var(--color-hope)] animate-pulse" />
          </div>
          <p className="text-[13px] text-[var(--color-text-muted)] tracking-wide">
            Opening your Sanctuary...
          </p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const navItems = [
    { href: `/s/${slug}`, icon: Home, label: 'Today' },
    { href: `/s/${slug}/journal`, icon: BookOpen, label: 'Journal' },
    { href: `/s/${slug}/tools`, icon: Wrench, label: 'Tools' },
  ]

  const isActive = (href: string) => {
    if (href === `/s/${slug}`) return pathname === `/s/${slug}`
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      {(title || showBack) && (
        <div
          className="sticky top-0 z-40 backdrop-blur-2xl backdrop-saturate-150 border-b border-black/[0.04]"
          style={{ backgroundColor: 'rgba(251, 250, 248, 0.72)' }}
        >
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <div className="flex justify-between items-center h-14">
              <div>
                {title && (
                  <h1
                    className="text-[20px] font-semibold text-[var(--color-text)] tracking-[-0.02em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-[12px] text-[var(--color-text-muted)] tracking-wide mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              {showBack && (
                <Link
                  href={backHref || `/s/${slug}`}
                  className="text-[13px] font-medium text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] transition-colors duration-300"
                >
                  Back
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        {children}
      </div>

      {/* Bottom Navigation — Glassmorphic pill bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-center pb-5 px-5">
          <nav
            className="flex items-center gap-1 px-2 py-2 rounded-full border border-black/[0.06]"
            style={{
              backgroundColor: 'rgba(251, 250, 248, 0.80)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            {navItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                    active
                      ? 'bg-[var(--color-hope)] text-white shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-black/[0.03]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
