import Link from 'next/link'
import Image from 'next/image'

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                GoFundMe + Tree of Hope
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The
                <br />
                <span className="text-[var(--color-hope)]">Bridge.</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                GoFundMe gives the money. Tree of Hope gives the community.
                One-time gifts help in the moment. A Tree of Hope sustains what comes after.
              </p>
              <Link
                href="/campaigns"
                className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                View campaigns
              </Link>
            </div>

            <div className="relative hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-hope)] to-transparent opacity-[0.08] rounded-full blur-3xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--color-hope)] to-transparent opacity-[0.06] rounded-full blur-2xl scale-100" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope Bridge"
                  width={460}
                  height={476}
                  className="relative z-10 drop-shadow-2xl transition-all duration-300 hover:drop-shadow-3xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              Compare
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Two kinds of giving.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--color-bg)] rounded-3xl p-8 md:p-10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3
                className="text-2xl font-bold text-[var(--color-text)] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                GoFundMe
              </h3>
              <div className="space-y-3 text-[var(--color-text-muted)]">
                <p>One-time gift</p>
                <p>Immediate financial help</p>
                <p>Wide reach</p>
                <p>Funds go directly to organiser</p>
              </div>
              <p className="mt-6 text-sm text-[var(--color-text-muted)] italic border-t border-[var(--color-border)] pt-6">
                Keep giving. It matters.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#e8f0e4] to-[#d5e0d2] rounded-3xl p-8 md:p-10 ring-2 ring-[var(--color-hope)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3
                className="text-2xl font-bold text-[var(--color-text)] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Tree of Hope
              </h3>
              <div className="space-y-3 text-[var(--color-text-muted)]">
                <p>Monthly commitment</p>
                <p>Ongoing emotional support</p>
                <p>Close circle of care</p>
                <p>Private Sanctuary for patient</p>
                <p>Care tools for 30+ days</p>
                <p>Pause anytime for hardship</p>
              </div>
              <p className="mt-6 text-sm text-[var(--color-text-muted)] italic border-t border-[var(--color-hope)] border-opacity-30 pt-6">
                Start growing. It stays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-8 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed">
            Tree of Hope is a for-profit service. Your contribution funds the Sanctuary
            and ongoing platform operations. It is not sent to the patient.
          </p>
        </div>
      </section>
    </div>
  )
}
