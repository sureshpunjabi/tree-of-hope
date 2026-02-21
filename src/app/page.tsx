import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section — matches PRD screenbook */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h1
                className="font-bold text-5xl md:text-6xl text-[var(--color-text)] mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Care with roots.{' '}
                <br />
                Kindness in motion.
              </h1>

              <p className="text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed max-w-lg">
                Tree of Hope gathers a local circle in five days, then leaves behind a
                private Sanctuary for the patient and caregiver.
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
                  href="#how-it-works"
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

            {/* Right: Bonsai Tree Image */}
            <div className="flex justify-center md:justify-end">
              <Image
                src="/tree-hero.png"
                alt="A bonsai tree growing in a glass dome — the Tree of Hope"
                width={460}
                height={476}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-8 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                How Tree of Hope works.
              </h2>

              <ol className="space-y-4 text-[var(--color-text)] text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-text-muted)] font-semibold">1.</span>
                  <span>Add a leaf.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-text-muted)] font-semibold">2.</span>
                  <span>Make a commitment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-text-muted)] font-semibold">3.</span>
                  <span>The Tree completes in five days.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-text-muted)] font-semibold">4.</span>
                  <span>The Sanctuary continues, constantly evolving.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-text-muted)] font-semibold">5.</span>
                  <span>At 12 months, the Book of Life is created.</span>
                </li>
              </ol>

              <div className="flex flex-wrap gap-4 mt-8">
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
                  href="#trust"
                  className={cn(
                    'inline-flex items-center justify-center',
                    'border-2 border-[var(--color-border)] hover:border-[var(--color-text)]',
                    'text-[var(--color-text)] font-semibold py-3 px-8 rounded-full text-base',
                    'transition-all duration-200'
                  )}
                >
                  FAQ
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope bonsai"
                width={380}
                height={393}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Clear Answers Section */}
      <section id="trust" className="py-16 md:py-20 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Clear, calm answers.
              </h2>

              <p className="text-lg text-[var(--color-text-muted)] mb-4 leading-relaxed">
                Funds support Tree of Hope and the ecosystem that powers the Sanctuary.
                Funds are not transferred to the individual.
              </p>

              <p className="text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed">
                Privacy is built in. You can pause your commitment for hardship at any time.
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
                  href="mailto:hello@treeofhope.com"
                  className={cn(
                    'inline-flex items-center justify-center',
                    'border-2 border-[var(--color-border)] hover:border-[var(--color-text)]',
                    'text-[var(--color-text)] font-semibold py-3 px-8 rounded-full text-base',
                    'transition-all duration-200'
                  )}
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope bonsai"
                width={380}
                height={393}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Example Tree Section */}
      <section className="py-16 md:py-20 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                An example Tree.
              </h2>

              <p className="text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed">
                See the rhythm: a five-day gathering, then a Sanctuary that holds what matters.
              </p>

              <Link
                href="/c/sarah"
                className={cn(
                  'inline-flex items-center justify-center',
                  'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                  'text-white font-semibold py-3 px-8 rounded-full text-base',
                  'transition-all duration-200 hover:shadow-lg'
                )}
              >
                Open example
              </Link>
            </div>

            <div className="flex justify-center md:justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope bonsai"
                width={460}
                height={476}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
