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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
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

  const getAvatarLetter = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-700',
        scrolled
          ? 'backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.08]'
          : 'bg-transparent'
      )}
      style={scrolled ? { backgroundColor: 'rgba(251, 250, 248, 0.72)' } : undefined}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center no-underline hover:opacity-70 transition-opacity duration-300"
          >
            <span
              className="text-[15px] font-semibold tracking-tight text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Tree of Hope
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {[
              { href: '/campaigns', label: 'Campaigns' },
              { href: '/sanctuary', label: 'Sanctuary' },
              { href: '/bridge', label: 'Bridge' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link px-3.5 py-1.5 text-[var(--color-text)]/70 hover:text-[var(--color-text)] text-[13px] font-normal transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 bg-[var(--color-border)] rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-hope)] flex items-center justify-center text-white text-xs font-medium">
                    {getAvatarLetter(user.email || '')}
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] max-w-[100px] truncate">
                    {user.email || ''}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth/signin"
                  className="text-[13px] text-[var(--color-text)]/70 hover:text-[var(--color-text)] transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="bg-[var(--color-text)] text-white text-[13px] font-medium py-1.5 px-4 rounded-full hover:bg-[var(--color-text)]/80 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1.5 text-[var(--color-text)] hover:opacity-60 transition-opacity duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
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
          <div className="border-t border-black/[0.04] py-4 space-y-1">
            {[
              { href: '/campaigns', label: 'Campaigns' },
              { href: '/sanctuary', label: 'Sanctuary' },
              { href: '/bridge', label: 'Bridge' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-[var(--color-text)] hover:text-[var(--color-hope)] transition-colors duration-200 text-[15px]"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-black/[0.04] mt-4 pt-4">
              {loading ? (
                <div className="px-4 py-2 w-full h-8 bg-[var(--color-border)] rounded-lg animate-pulse" />
              ) : user ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-hope)] flex items-center justify-center text-white text-xs font-medium">
                      {getAvatarLetter(user.email || '')}
                    </div>
                    <span className="text-sm text-[var(--color-text-muted)] truncate">
                      {user.email || ''}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-[var(--color-text)] text-white text-sm font-medium text-center py-2 px-5 rounded-full hover:bg-[var(--color-text)]/80 transition-all duration-200"
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
