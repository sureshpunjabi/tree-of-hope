'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg)]">
      {/* Subtle separator */}
      <div className="h-px bg-black/[0.04]" />

      <div className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {/* Compact layout */}
          <div className="flex flex-col md:flex-row md:justify-between gap-12 md:gap-8">
            {/* Brand */}
            <div className="md:max-w-xs">
              <p
                className="text-[15px] font-semibold text-[var(--color-text)] mb-1.5"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Tree of Hope
              </p>
              <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
                Growing community, one<br />commitment at a time.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16 md:gap-20">
              <div>
                <ul className="space-y-2.5">
                  {['Campaigns', 'Sanctuary', 'Bridge'].map((item) => (
                    <li key={item}>
                      <Link
                        href={`/${item.toLowerCase()}`}
                        className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ul className="space-y-2.5">
                  {['Privacy', 'Terms', 'Contact'].map((item) => (
                    <li key={item}>
                      <Link
                        href={`/${item.toLowerCase()}`}
                        className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
                      >
                        {item}
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
            &copy; 2026 Tree of Hope. All rights reserved.
          </p>
          <p className="text-[12px] text-[var(--color-text-muted)]">
            This is a for-profit service. Contributions fund the platform, not the individual.
          </p>
        </div>
      </div>
    </footer>
  )
}
