import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── Full-viewport immersive hero inspired by charity:water */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                Micro-campaign fundraising
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] lg:text-[4rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Care with roots.
                <br />
                <span className="text-[var(--color-hope)]">Kindness in motion.</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                A five-day gathering builds a circle of support. Then a private
                Sanctuary holds what matters — for as long as it&apos;s needed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/c/sarah"
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  See a live Tree
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
                >
                  Get started
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Soft glow behind tree */}
                <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-110" />
                <Image
                  src="/tree-hero.png"
                  alt="A bonsai tree growing in a glass dome — the Tree of Hope"
                  width={500}
                  height={518}
                  className="relative z-10 drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── Inspired by charity:water's impact numbers */}
      <section className="border-y border-[var(--color-border)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--color-border)]">
            {[
              { number: '5', label: 'Day gathering' },
              { number: '30', label: 'Day Sanctuary' },
              { number: '3', label: 'Monthly tiers' },
              { number: '∞', label: 'Kindness' },
            ].map((stat) => (
              <div key={stat.label} className="py-8 md:py-10 px-6 text-center">
                <div
                  className="text-3xl md:text-4xl font-bold text-[var(--color-hope)] mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {stat.number}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── Horizontal card grid inspired by Headspace */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              How it works
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Five steps. One community.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Share the link',
                desc: 'A campaign page is created for your person. Share it with their community.',
                icon: '🔗',
              },
              {
                step: '02',
                title: 'Add a leaf',
                desc: 'Each supporter writes a message of hope — their leaf on the tree.',
                icon: '🍃',
              },
              {
                step: '03',
                title: 'Make a commitment',
                desc: 'Choose a monthly tier. Pause anytime for hardship.',
                icon: '💚',
              },
              {
                step: '04',
                title: 'Gather for 5 days',
                desc: 'The tree grows as the community comes together over five days.',
                icon: '🌳',
              },
              {
                step: '05',
                title: 'Sanctuary opens',
                desc: 'A private space with guided content, journal, and care tools.',
                icon: '🏡',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold tracking-widest text-[var(--color-hope)] mb-2 uppercase">
                  Step {item.step}
                </div>
                <h3
                  className="text-lg font-bold text-[var(--color-text)] mb-2"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
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

      {/* ─── PRODUCTS ─── Three product surfaces, card grid inspired by Headspace */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              Three surfaces
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Everything a community needs.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Campaign Tree */}
            <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#f0ebe4] to-[#e8e0d5] p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-6">🌿</div>
              <h3
                className="text-2xl font-bold text-[var(--color-text)] mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Campaign Tree
              </h3>
              <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                A five-day micro-campaign where supporters leave messages and commit to monthly giving.
              </p>
              <Link
                href="/c/sarah"
                className="inline-flex items-center text-[var(--color-hope)] font-semibold hover:underline"
              >
                View example →
              </Link>
            </div>

            {/* Sanctuary */}
            <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#e8f0e4] to-[#d5e0d2] p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-6">🏡</div>
              <h3
                className="text-2xl font-bold text-[var(--color-text)] mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Sanctuary
              </h3>
              <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                A private space for the patient and caregiver with guided daily content, journal, and tools.
              </p>
              <Link
                href="/sanctuary"
                className="inline-flex items-center text-[var(--color-hope)] font-semibold hover:underline"
              >
                Learn more →
              </Link>
            </div>

            {/* Bridge */}
            <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#e4e8f0] to-[#d2d5e0] p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-6">🌉</div>
              <h3
                className="text-2xl font-bold text-[var(--color-text)] mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Bridge
              </h3>
              <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                Connects GoFundMe donors to ongoing monthly support through Tree of Hope.
              </p>
              <Link
                href="/bridge"
                className="inline-flex items-center text-[var(--color-hope)] font-semibold hover:underline"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST ─── Clean centered section inspired by CaringBridge */}
      <section id="trust" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
            Transparency
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-8 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Clear, calm answers.
          </h2>

          <div className="space-y-6 text-left">
            {[
              {
                q: 'Where do the funds go?',
                a: 'Funds support Tree of Hope — the platform, Sanctuary infrastructure, and operations. Funds are not transferred to the individual.',
              },
              {
                q: 'Can I pause my commitment?',
                a: 'Yes. You can pause for hardship at any time, no questions asked. Life is bigger than any subscription.',
              },
              {
                q: 'Is my data private?',
                a: 'The Sanctuary is fully private. Journal entries, medication logs, and appointments are visible only to the patient and caregiver who claimed it.',
              },
              {
                q: 'What happens after 5 days?',
                a: 'The public tree completes and the private Sanctuary opens. Over 30 days, guided content helps navigate what comes next.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-[var(--color-text)] text-lg hover:bg-gray-50 transition-colors">
                  {faq.q}
                  <span className="text-[var(--color-text-muted)] group-open:rotate-45 transition-transform text-2xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── Centered call-to-action with tree */}
      <section className="py-20 md:py-28 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/tree-hero.png"
            alt="Tree of Hope"
            width={200}
            height={207}
            className="mx-auto mb-10 drop-shadow-lg"
          />
          <h2
            className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Every tree starts with a single leaf.
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-xl mx-auto leading-relaxed">
            See the rhythm: a five-day gathering, then a Sanctuary that holds what matters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/c/sarah"
              className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              View a live Tree
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
            >
              Browse campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* Trust language footer */}
      <section className="py-8 bg-[var(--color-bg)]">
        <div className="trust-language">
          <p>
            Tree of Hope is a for-profit service. Your contribution funds the Sanctuary
            and ongoing platform operations. It is not sent to the patient.
          </p>
        </div>
      </section>
    </div>
  )
}
