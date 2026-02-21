'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Menu, X, LogOut } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 no-underline hover:opacity-90 transition-opacity"
          >
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Tree of Hope
            </span>
            <span className="text-xl">🍃</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/campaigns"
              className="text-[var(--color-text)] hover:text-[var(--color-hope)] transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/sanctuary"
              className="text-[var(--color-text)] hover:text-[var(--color-hope)] transition-colors"
            >
              Sanctuary
            </Link>
            <Link
              href="/bridge"
              className="text-[var(--color-text)] hover:text-[var(--color-hope)] transition-colors"
            >
              Bridge
            </Link>

            {loading ? (
              <div className="w-8 h-8 bg-[var(--color-border)] rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-hope)] hover:bg-[var(--color-leaf-5)] hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-hope)] transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[var(--color-border)] py-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/campaigns"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors"
              >
                Campaigns
              </Link>
              <Link
                href="/sanctuary"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors"
              >
                Sanctuary
              </Link>
              <Link
                href="/bridge"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors"
              >
                Bridge
              </Link>

              {loading ? (
                <div className="px-4 py-2 w-full h-8 bg-[var(--color-border)] rounded-lg animate-pulse" />
              ) : user ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 text-sm text-[var(--color-text-muted)]">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm font-medium text-[var(--color-hope)] hover:bg-[var(--color-leaf-5)] hover:bg-opacity-20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-center text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block btn-primary text-sm text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
