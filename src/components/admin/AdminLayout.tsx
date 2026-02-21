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

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--color-border)] transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Title */}
          <div className="p-6 border-b border-[var(--color-border)]">
            <Link href="/admin" className="flex items-center gap-2 text-xl font-serif font-bold text-[var(--color-text)] hover:text-[var(--color-hope)] transition">
              <span>🌳</span>
              <span>Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition ${
                isActive('/admin') && !isActive('/admin/campaigns') && !isActive('/admin/bridge')
                  ? 'bg-[var(--color-hope)] text-white'
                  : 'text-[var(--color-text)] hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/admin/campaigns"
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition ${
                isActive('/admin/campaigns')
                  ? 'bg-[var(--color-hope)] text-white'
                  : 'text-[var(--color-text)] hover:bg-gray-100'
              }`}
            >
              Campaigns
            </Link>

            <Link
              href="/admin/bridge"
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition ${
                isActive('/admin/bridge')
                  ? 'bg-[var(--color-hope)] text-white'
                  : 'text-[var(--color-text)] hover:bg-gray-100'
              }`}
            >
              Bridge Scanner
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            <p className="mb-2">Tree of Hope Admin</p>
            <Link
              href="/"
              className="text-[var(--color-hope)] hover:text-[var(--color-hope-hover)] font-medium"
            >
              Back to Site →
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar for Mobile */}
        <div className="md:hidden bg-white border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between">
          <h1 className="font-serif font-bold text-[var(--color-text)]">
            Tree of Hope Admin
          </h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
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
        <div className="bg-white border-t border-[var(--color-border)] px-4 md:px-8 py-4 text-center text-sm text-[var(--color-text-muted)]">
          <p>Tree of Hope Admin Panel</p>
        </div>
      </div>
    </div>
  )
}
