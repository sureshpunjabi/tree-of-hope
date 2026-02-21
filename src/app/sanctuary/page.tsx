import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function SanctuaryPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-32 md:py-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[var(--color-hope)] mb-4">
                Private space
              </p>
              <h1
                className="text-6xl md:text-7xl font-light text-[var(--color-text)] leading-[1.1] mb-6"
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

      {/* ─── TESTIMONIAL BLOCKQUOTE ─── */}
      <section className="py-24 md:py-32 bg-[#f9f7f3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <blockquote className="text-center">
              <p
                className="text-4xl md:text-5xl font-light italic text-[var(--color-text)] leading-[1.3] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                "The Sanctuary didn't fix anything. But for the first time in weeks, I felt held."
              </p>
              <footer className="text-[var(--color-text-muted)] font-light">
                — A caregiver, day 12
              </footer>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-32 md:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[var(--color-hope)] mb-3">
              What&apos;s inside
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Everything the Sanctuary holds.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Daily Guided Content',
                desc: '30 days of gentle, curated guidance — from breathing exercises to care coordination.',
              },
              {
                title: 'Private Journal',
                desc: 'A space to write what you need to. Mood tracking, daily reflections, entirely private.',
              },
              {
                title: 'Leaves of Hope',
                desc: 'Read the messages people have written for you, whenever you need them.',
              },
              {
                title: 'Care Tools',
                desc: 'Track appointments, medications, symptoms, and tasks. Simple tools that grow with you.',
              },
            ].map((item) => (
              <ScrollReveal key={item.title}>
                <div
                  className="border-t-2 border-[var(--color-hope)] bg-white p-8 md:p-10 hover:shadow-lg transition-all duration-300"
                >
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

      {/* ─── 30 DAYS OF GUIDED CONTENT ─── */}
      <section className="py-32 md:py-48 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[var(--color-hope)] mb-3">
              Your journey
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              30 days of guided content.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                week: 'Week 1',
                title: 'Breathing room',
                desc: 'Gentle arrival, no pressure',
              },
              {
                week: 'Week 2',
                title: 'Finding footing',
                desc: 'Care coordination basics',
              },
              {
                week: 'Week 3',
                title: 'Deepening',
                desc: 'Emotional processing, journaling',
              },
              {
                week: 'Week 4',
                title: 'Looking ahead',
                desc: 'Building ongoing rhythms',
              },
            ].map((item) => (
              <ScrollReveal key={item.week}>
                <div className="border border-[var(--color-border)] rounded-lg p-8 bg-white hover:shadow-md transition-all duration-300">
                  <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
                    {item.week}
                  </p>
                  <h3
                    className="text-xl font-light text-[var(--color-text)] mb-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy notice */}
      <section className="py-12 bg-[var(--color-bg)]">
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
