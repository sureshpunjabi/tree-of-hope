'use client'

import Link from 'next/link'
import { getCurrentYear } from '@/lib/utils'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Tree of Hope
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Growing community, one leaf at a time.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="font-semibold mb-4 text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/campaigns"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors"
                >
                  Campaigns
                </Link>
              </li>
              <li>
                <Link
                  href="/sanctuary"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors"
                >
                  Sanctuary
                </Link>
              </li>
              <li>
                <Link
                  href="/bridge"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors"
                >
                  Bridge
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-semibold mb-4 text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-hope)] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Language */}
        <div className="trust-language mb-8">
          <p>
            Tree of Hope is a for-profit service. Your contribution funds the
            Sanctuary and ongoing platform operations. It is not sent to the
            patient.
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-[var(--color-border)] pt-8">
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            &copy; {year} Tree of Hope. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
