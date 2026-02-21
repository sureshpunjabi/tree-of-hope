import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function SanctuaryPage() {
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
                Your Sanctuary.
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] mb-4 leading-relaxed">
                A quiet place to hold what people have written.
                The Sanctuary is constantly evolving.
              </p>
              <p className="text-[var(--color-text-muted)] mb-8">
                When a Tree completes its five-day gathering, a private Sanctuary is created
                for the patient and caregiver. Over 30 days, guided content helps you navigate
                what comes next — one day at a time.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/c/sarah"
                  className={cn(
                    'inline-flex items-center justify-center',
                    'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                    'text-white font-semibold py-3 px-8 rounded-full text-base',
                    'transition-all duration-200 hover:shadow-lg'
                  )}
                >
                  View an example
                </Link>
                <Link
                  href="/#how-it-works"
                  className={cn(
                    'inline-flex items-center justify-center',
                    'border-2 border-[var(--color-border)] hover:border-[var(--color-text)]',
                    'text-[var(--color-text)] font-semibold py-3 px-8 rounded-full text-base',
                    'transition-all duration-200'
                  )}
                >
                  How it works
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope Sanctuary"
                width={460}
                height={476}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-12 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-[var(--color-text)] mb-8"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            What the Sanctuary holds.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div
                key={item.title}
                className="bg-white rounded-xl border border-[var(--color-border)] p-6"
              >
                <h3 className="font-semibold text-[var(--color-text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-8 border-t border-[var(--color-border)]">
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
