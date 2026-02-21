'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊', isRoot: true },
    { href: '/admin/campaigns', label: 'Campaigns', icon: '🌿' },
    { href: '/admin/bridge', label: 'Bridge Scanner', icon: '🌉' },
  ]

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3E2723] transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Title */}
          <div className="p-6 border-b border-white/10">
            <Link
              href="/admin"
              className="flex items-center gap-3 font-serif text-xl font-bold text-white hover:text-[var(--color-hope)] transition duration-200"
            >
              <span className="text-2xl">🌳</span>
              <span>Tree of Hope</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const active = item.isRoot
                ? isActive('/admin') && !isActive('/admin/campaigns') && !isActive('/admin/bridge')
                : isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium transition duration-200 ${
                    active
                      ? 'bg-[var(--color-hope)] text-white shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="px-4 py-2">
            <div className="h-px bg-white/10"></div>
          </div>

          {/* Footer */}
          <div className="p-4 space-y-3">
            <p className="text-xs text-white/60 uppercase tracking-wide font-medium">
              Admin Panel
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-[var(--color-hope)] font-medium text-sm transition duration-200"
            >
              <span>←</span>
              <span>Back to Site</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar for Mobile */}
        <div className="md:hidden bg-white border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between shadow-sm">
          <h1 className="font-serif font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>🌳</span>
            Admin
          </h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition duration-200 text-[var(--color-text)]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Footer */}
        <div className="bg-white border-t border-[var(--color-border)] px-4 md:px-8 py-6 text-center text-sm text-[var(--color-text-muted)]">
          <p>Tree of Hope Admin Panel</p>
        </div>
      </div>
    </div>
  )
}
