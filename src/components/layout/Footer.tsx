'use client'

import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-16">
      {/* Gradient Top Border */}
      <div className="h-1 bg-gradient-to-r from-green-100 via-green-400 to-green-100 dark:from-green-900 dark:via-green-600 dark:to-green-900" />

      <div className="bg-[var(--color-bg)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div>
              <h3
                className="text-2xl font-bold mb-3 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                <span>🌱</span> Tree of Hope
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
                Growing community, one leaf at a time. A sanctuary for healing
                and connection.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4
                className="font-semibold mb-6 text-[var(--color-text)] uppercase tracking-wide text-sm"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Product
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/campaigns"
                    className="text-[var(--color-text-muted)] hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                  >
                    Campaigns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sanctuary"
                    className="text-[var(--color-text-muted)] hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                  >
                    Sanctuary
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bridge"
                    className="text-[var(--color-text-muted)] hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                  >
                    Bridge
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4
                className="font-semibold mb-6 text-[var(--color-text)] uppercase tracking-wide text-sm"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-[var(--color-text-muted)] hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-[var(--color-text-muted)] hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-[var(--color-text-muted)] hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Stay Connected Column */}
            <div>
              <h4
                className="font-semibold mb-6 text-[var(--color-text)] uppercase tracking-wide text-sm"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Stay Connected
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  <a
                    href="mailto:hello@treeofhope.com"
                    className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                  >
                    hello@treeofhope.com
                  </a>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] italic">
                  Newsletter coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Trust Language Section */}
          <div className="border-y border-[var(--color-border)] py-8 mb-8">
            <p className="text-sm text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
              Tree of Hope is a for-profit service. Your contribution funds the
              Sanctuary and ongoing platform operations. It is not sent directly
              to the patient. We are committed to transparency and responsible
              stewardship of every contribution.
            </p>
          </div>

          {/* Copyright Bar */}
          <div className="text-center">
            <p className="text-xs text-[var(--color-text-muted)] tracking-wide">
              &copy; {year} Tree of Hope. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
