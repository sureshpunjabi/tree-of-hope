import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-32 md:py-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[var(--color-hope)] mb-4">
                GoFundMe + Tree of Hope
              </p>
              <h1
                className="text-6xl md:text-7xl font-light text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The
                <br />
                <span className="text-[var(--color-hope)]">Bridge.</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                One-time generosity is beautiful. Sustained care is transformational.
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
      <section className="py-32 md:py-48 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[var(--color-hope)] mb-3">
              Two kinds of giving
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Different paths. Same heart.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <h3
                  className="text-3xl font-light text-[var(--color-text)] mb-8"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  GoFundMe
                </h3>
                <div className="space-y-4">
                  <div className="pb-4 border-b border-[var(--color-border)]">
                    <p className="text-[var(--color-text-muted)]">One-time gift</p>
                  </div>
                  <div className="pb-4 border-b border-[var(--color-border)]">
                    <p className="text-[var(--color-text-muted)]">Immediate financial help</p>
                  </div>
                  <div className="pb-4 border-b border-[var(--color-border)]">
                    <p className="text-[var(--color-text-muted)]">Wide reach</p>
                  </div>
                  <div className="pb-4">
                    <p className="text-[var(--color-text-muted)]">Funds go directly to organiser</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <div className="relative lg:flex lg:justify-center">
              <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center text-2xl font-light text-[var(--color-hope)]">
                →
              </div>
              <ScrollReveal>
                <div className="bg-gradient-to-b from-[#e8f0e4] to-[#d5e0d2] rounded-2xl p-10 md:p-12">
                  <h3
                    className="text-3xl font-light text-[var(--color-text)] mb-8"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Tree of Hope
                  </h3>
                  <div className="space-y-4">
                    <div className="pb-4 border-b border-[var(--color-hope)] border-opacity-40">
                      <p className="text-[var(--color-text)]">Monthly commitment</p>
                    </div>
                    <div className="pb-4 border-b border-[var(--color-hope)] border-opacity-40">
                      <p className="text-[var(--color-text)]">Ongoing emotional support</p>
                    </div>
                    <div className="pb-4 border-b border-[var(--color-hope)] border-opacity-40">
                      <p className="text-[var(--color-text)]">Close circle of care</p>
                    </div>
                    <div className="pb-4 border-b border-[var(--color-hope)] border-opacity-40">
                      <p className="text-[var(--color-text)]">Private Sanctuary for patient</p>
                    </div>
                    <div className="pb-4 border-b border-[var(--color-hope)] border-opacity-40">
                      <p className="text-[var(--color-text)]">Care tools for 30+ days</p>
                    </div>
                    <div className="pb-4">
                      <p className="text-[var(--color-text)]">Pause anytime for hardship</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW THE BRIDGE WORKS ─── */}
      <section className="py-32 md:py-48 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[var(--color-hope)] mb-3">
              The journey
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              How the Bridge works.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'We find',
                desc: 'We discover GoFundMe campaigns in the health space — people facing real struggles.',
              },
              {
                num: '2',
                title: 'We invite',
                desc: 'We reach out to organisers with a gentle invitation to build something lasting.',
              },
              {
                num: '3',
                title: 'We connect',
                desc: 'Their supporters discover Tree of Hope and become part of an ongoing circle of care.',
              },
            ].map((item, idx) => (
              <ScrollReveal key={idx}>
                <div className="relative">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-hope)] text-white font-light text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                      {item.num}
                    </div>
                  </div>
                  <h3
                    className="text-2xl font-light text-[var(--color-text)] mb-3"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 bg-[var(--color-bg)]">
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
