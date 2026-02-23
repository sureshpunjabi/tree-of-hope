'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg)]">
      {/* Subtle separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />

      <div className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {/* Compact layout */}
          <div className="flex flex-col md:flex-row md:justify-between gap-12 md:gap-8">
            {/* Brand */}
            <div className="md:max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                {/* Tree icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--color-hope)]">
                  <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M12 13C12 13 7 10 7 6.5C7 3 12 2 12 2C12 2 17 3 17 6.5C17 10 12 13 12 13Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 18C8 18 4 16 4 12C4 9 7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  <path d="M16 18C16 18 20 16 20 12C20 9 17 7 17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
                <p
                  className="text-[15px] font-semibold text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Tree of Hope
                </p>
              </div>
              <p className="text-[13px] text-[var(--color-text-muted)] leading-[1.65]">
                Turning moments of care into sustained circles of support. One leaf at a time.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16 md:gap-20">
              <div>
                <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--color-text-muted)] mb-3">
                  Platform
                </p>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Campaigns', href: '/campaigns' },
                    { label: 'Sanctuary', href: '/sanctuary' },
                    { label: 'Bridge', href: '/bridge' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--color-text-muted)] mb-3">
                  Company
                </p>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Privacy', href: '/privacy' },
                    { label: 'Terms', href: '/terms' },
                    { label: 'Contact', href: '/contact' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p className="text-[12px] text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} Tree of Hope. All rights reserved.
          </p>
          <p className="text-[12px] text-[var(--color-text-muted)] opacity-70">
            This is a for-profit service. Contributions fund the platform, not the individual.
          </p>
        </div>
      </div>
    </footer>
  )
}
