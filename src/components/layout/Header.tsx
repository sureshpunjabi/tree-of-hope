'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Menu, X, LogOut } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, loading, signOut } = useAuth()

  // Detect scroll for backdrop blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Extract first letter from email for avatar
  const getAvatarLetter = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[var(--color-bg)]/90 backdrop-blur-lg border-b border-[var(--color-border)]/50'
          : 'bg-[var(--color-bg)] border-b border-[var(--color-border)]'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clean text, serif font */}
          <Link
            href="/"
            className="flex items-center no-underline hover:opacity-90 transition-opacity duration-200"
          >
            <span
              className="text-lg font-semibold tracking-tight text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Tree of Hope
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/campaigns', label: 'Campaigns' },
              { href: '/sanctuary', label: 'Sanctuary' },
              { href: '/bridge', label: 'Bridge' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link px-4 py-2 text-[var(--color-text)] text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-10 h-10 bg-[var(--color-border)] rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                {/* User Avatar Circle */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-hope)] to-[var(--color-leaf-2)] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {getAvatarLetter(user.email || '')}
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)] max-w-[120px] truncate">
                    {user.email || ''}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-hope)] hover:bg-[var(--color-leaf-5)] hover:bg-opacity-20 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-hope)] transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="bg-[var(--color-hope)] text-white text-sm font-medium py-2 px-5 rounded-full hover:bg-[var(--color-hope-hover)] transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation with Slide-Down Animation */}
        <nav
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
          style={{
            transformOrigin: 'top',
            transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
          }}
        >
          <div className="border-t border-[var(--color-border)] py-4 space-y-1">
            {/* Mobile Nav Links */}
            {[
              { href: '/campaigns', label: 'Campaigns' },
              { href: '/sanctuary', label: 'Sanctuary' },
              { href: '/bridge', label: 'Bridge' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="border-t border-[var(--color-border)] mt-4 pt-4">
              {loading ? (
                <div className="px-4 py-2.5 w-full h-8 bg-[var(--color-border)] rounded-lg animate-pulse" />
              ) : user ? (
                <div className="space-y-3">
                  <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-hope)] to-[var(--color-leaf-2)] flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                      {getAvatarLetter(user.email || '')}
                    </div>
                    <span className="text-sm text-[var(--color-text-muted)] truncate">
                      {user.email || ''}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-sm font-medium text-[var(--color-hope)] hover:bg-[var(--color-leaf-5)] hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
                    className="block px-4 py-2.5 text-sm font-medium text-center text-[var(--color-text)] hover:bg-[var(--color-card)] rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-[var(--color-hope)] text-white text-sm font-medium text-center py-2 px-5 rounded-full hover:bg-[var(--color-hope-hover)] transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
