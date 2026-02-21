import Link from 'next/link'
import Image from 'next/image'

export default function SanctuaryPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                Private space
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Your
                <br />
                <span className="text-[var(--color-hope)]">Sanctuary.</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                When a Tree completes its five-day gathering, a private Sanctuary opens
                for the patient and caregiver. Over 30 days, guided content helps you
                navigate what comes next.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/c/sarah"
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  View an example
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-hope)] to-transparent opacity-[0.08] rounded-full blur-3xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--color-hope)] to-transparent opacity-[0.06] rounded-full blur-2xl scale-100" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope Sanctuary"
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

      {/* ─── FEATURES ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              What&apos;s inside
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Everything the Sanctuary holds.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '📖',
                title: 'Daily Guided Content',
                desc: '30 days of gentle, curated guidance — from breathing exercises to care coordination.',
                gradient: 'from-[#f0ebe4] to-[#e8e0d5]',
              },
              {
                icon: '📝',
                title: 'Private Journal',
                desc: 'A space to write what you need to. Mood tracking, daily reflections, entirely private.',
                gradient: 'from-[#e8f0e4] to-[#d5e0d2]',
              },
              {
                icon: '🍃',
                title: 'Leaves of Hope',
                desc: 'Read the messages people have written for you, whenever you need them.',
                gradient: 'from-[#e4e8f0] to-[#d2d5e0]',
              },
              {
                icon: '🛠️',
                title: 'Care Tools',
                desc: 'Track appointments, medications, symptoms, and tasks. Simple tools that grow with you.',
                gradient: 'from-[#f0e4e8] to-[#e0d2d5]',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`bg-gradient-to-b ${item.gradient} rounded-3xl p-8 md:p-10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3
                  className="text-2xl font-bold text-[var(--color-text)] mb-3"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy notice */}
      <section className="py-8 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed">
            The Sanctuary is entirely private. Only the patient and caregiver can access it.
            Journal entries, care tools, and personal data are never shared with supporters.
          </p>
        </div>
      </section>
    </div>
  )
}
