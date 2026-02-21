import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The Bridge.
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] mb-4 leading-relaxed">
                GoFundMe gives the money. Tree of Hope gives the community.
              </p>
              <p className="text-[var(--color-text-muted)] mb-8">
                The Bridge connects GoFundMe donors to ongoing, monthly support
                through Tree of Hope. One-time gifts help in the moment.
                A Tree of Hope sustains what comes after.
              </p>

              <Link
                href="/campaigns"
                className={cn(
                  'inline-flex items-center justify-center',
                  'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                  'text-white font-semibold py-3 px-8 rounded-full text-base',
                  'transition-all duration-200 hover:shadow-lg'
                )}
              >
                View campaigns
              </Link>
            </div>
            <div className="hidden md:flex justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope Bridge"
                width={460}
                height={476}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-12 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-[var(--color-text)] mb-8"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Two kinds of giving.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">GoFundMe</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>One-time gift</li>
                <li>Immediate financial help</li>
                <li>Wide reach</li>
                <li>Funds go directly to organiser</li>
              </ul>
              <p className="mt-4 text-sm text-[var(--color-text-muted)] italic">
                Keep giving. It matters.
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-[var(--color-hope)] p-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">Tree of Hope</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>Monthly commitment</li>
                <li>Ongoing emotional support</li>
                <li>Close circle of care</li>
                <li>Private Sanctuary for patient</li>
                <li>Care tools for 30+ days</li>
                <li>Pause anytime for hardship</li>
              </ul>
              <p className="mt-4 text-sm text-[var(--color-text-muted)] italic">
                Start growing. It stays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-8 border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed">
            Tree of Hope is a for-profit service. Your contribution funds the
            Sanctuary and ongoing platform operations. It is not sent to the patient.
          </p>
        </div>
      </section>
    </div>
  )
}
