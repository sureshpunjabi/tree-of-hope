'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg)]">
      {/* Gradient top border */}
      <div
        className="h-px bg-gradient-to-r from-transparent via-[var(--color-hope)] to-transparent"
        style={{ opacity: 0.3 }}
      />

      {/* Main footer content */}
      <div className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Four Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <h3
                className="text-xl font-semibold mb-2 text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Tree of Hope
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Growing community, one commitment at a time.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/campaigns"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-300 hover:translate-x-0.5 transform inline-block"
                  >
                    Campaigns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sanctuary"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-300 hover:translate-x-0.5 transform inline-block"
                  >
                    Sanctuary
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bridge"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-300 hover:translate-x-0.5 transform inline-block"
                  >
                    Bridge
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-300 hover:translate-x-0.5 transform inline-block"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-300 hover:translate-x-0.5 transform inline-block"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-300 hover:translate-x-0.5 transform inline-block"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">
                Trust
              </h4>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Tree of Hope is committed to transparency and responsible stewardship of community contributions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © 2026 Tree of Hope. All rights reserved.
          </p>
          <p
            className="text-xs text-[var(--color-text-muted)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Made with care
          </p>
        </div>
      </div>
    </footer>
  )
}
