'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="bg-[var(--color-bg)] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12">
            {/* Brand Column */}
            <div>
              <h3
                className="text-lg font-semibold mb-2 text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Tree of Hope
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Growing community, one commitment at a time.
              </p>
            </div>

            {/* Links Column */}
            <div>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link
                    href="/campaigns"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-200"
                  >
                    Campaigns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sanctuary"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-200"
                  >
                    Sanctuary
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bridge"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-200"
                  >
                    Bridge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-200"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors duration-200"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
                Tree of Hope is a for-profit service. Your contribution funds the Sanctuary and ongoing platform operations. We are committed to transparency and responsible stewardship.
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                © 2026 Tree of Hope. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
