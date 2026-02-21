import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── Cathedral-like, full viewport, centered silence */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center py-32 md:py-48">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tiny label: silence */}
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-12 md:mb-16">
            A moment that changes everything
          </p>

          {/* Main headline: emotional and human */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-light text-[var(--color-text)] leading-[1.1] mb-8 md:mb-12"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            When someone you love is diagnosed, the world doesn't stop. But something inside you does.
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed">
            Tree of Hope builds a circle of people around one person — for as long as they need it.
          </p>

          {/* Single green CTA */}
          <Link
            href="#rhythm"
            className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-8 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            See how it works
          </Link>

          {/* Tree image with subtle glow, floating */}
          <div className="mt-20 md:mt-32 flex justify-center">
            <div className="relative">
              {/* Subtle green glow */}
              <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.04] rounded-full blur-3xl scale-125" />
              <Image
                src="/tree-hero.png"
                alt="A bonsai tree growing in a glass dome — the Tree of Hope"
                width={300}
                height={310}
                className="relative z-10 drop-shadow-2xl animate-float"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE RHYTHM ─── Breathing room, three emotional beats */}
      <section id="rhythm" className="relative py-32 md:py-48 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="text-center mb-16 md:mb-24">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-6">
              The rhythm
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.2]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Five days. One community. A lifetime of support.
            </h2>
          </div>

          {/* Three minimal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <ScrollReveal delay={0}>
              <div className="pt-8 border-t-2 border-[var(--color-hope)]">
                <h3
                  className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  The Gathering
                </h3>
                <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                  For five days, people who care leave messages of hope — their leaves on a growing tree.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="pt-8 border-t-2 border-[var(--color-hope)]">
                <h3
                  className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  The Commitment
                </h3>
                <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                  Each person chooses a monthly amount. Small, sustainable, pausable for hardship.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="pt-8 border-t-2 border-[var(--color-hope)]">
                <h3
                  className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  The Sanctuary
                </h3>
                <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                  A private space opens for the patient and caregiver. Journal. Tools. Guided content. Held.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── EMOTIONAL PAUSE ─── Full-width quote, cream background */}
      <section className="relative py-32 md:py-48 bg-[#f9f7f3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <blockquote>
              <p
                className="text-4xl md:text-5xl font-light italic text-[var(--color-text)] leading-[1.3] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                "I didn't know how to help. I just knew I wanted to show up. This gave me a way."
              </p>
              <footer className="text-lg text-[var(--color-text-muted)]">
                — A supporter on Sarah's tree
              </footer>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── THREE SURFACES ─── Product overview with refined cards */}
      <section className="relative py-32 md:py-48 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section intro */}
          <div className="text-center mb-16 md:mb-24">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-6">
              What we build
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.2]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Three surfaces, one purpose.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Campaign Tree */}
            <ScrollReveal delay={0}>
              <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#f0ebe4] to-[#e8e0d5] p-8 md:p-10 hover:shadow-xl transition-all duration-300">
                <h3
                  className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Campaign Tree
                </h3>
                <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                  A five-day micro-campaign where supporters leave messages and commit to monthly giving.
                </p>
                <Link
                  href="/c/sarah"
                  className="inline-flex items-center text-[var(--color-hope)] font-semibold hover:underline text-sm"
                >
                  View example →
                </Link>
              </div>
            </ScrollReveal>

            {/* Sanctuary */}
            <ScrollReveal delay={150}>
              <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#e8f0e4] to-[#d5e0d2] p-8 md:p-10 hover:shadow-xl transition-all duration-300">
                <h3
                  className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Sanctuary
                </h3>
                <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                  A private space for the patient and caregiver with guided daily content, journal, and tools.
                </p>
                <Link
                  href="/sanctuary"
                  className="inline-flex items-center text-[var(--color-hope)] font-semibold hover:underline text-sm"
                >
                  Learn more →
                </Link>
              </div>
            </ScrollReveal>

            {/* Bridge */}
            <ScrollReveal delay={300}>
              <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#e4e8f0] to-[#d2d5e0] p-8 md:p-10 hover:shadow-xl transition-all duration-300">
                <h3
                  className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Bridge
                </h3>
                <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                  Connects GoFundMe donors to ongoing monthly support through Tree of Hope.
                </p>
                <Link
                  href="/bridge"
                  className="inline-flex items-center text-[var(--color-hope)] font-semibold hover:underline text-sm"
                >
                  Learn more →
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── TRUST / FAQ ─── Radical transparency */}
      <section className="relative py-32 md:py-48 bg-[#f9f7f3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section intro */}
          <div className="text-center mb-16 md:mb-24">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-text-muted)] mb-6">
              Built on trust
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.2]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              We believe in radical transparency.
            </h2>
          </div>

          {/* FAQ Accordion */}
          <ScrollReveal>
            <div className="space-y-4">
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
                  className="group bg-white rounded-lg border border-[var(--color-border)] overflow-hidden transition-all duration-300"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-[var(--color-text)] text-lg hover:bg-gray-50 transition-colors duration-200">
                    {faq.q}
                    <span className="text-[var(--color-text-muted)] group-open:rotate-45 transition-transform duration-300 text-2xl leading-none">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FINAL CTA ─── Last emotional moment */}
      <section className="relative py-32 md:py-48 bg-white">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Floating tree */}
            <div className="mb-12 md:mb-16 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.04] rounded-full blur-3xl scale-125" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={250}
                  height={259}
                  className="relative z-10 drop-shadow-lg animate-float"
                />
              </div>
            </div>

            {/* Headline */}
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] mb-6 leading-[1.2]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Every tree starts with a single leaf.
            </h2>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed">
              See the rhythm. Feel the community. Join the circle.
            </p>

            {/* Two CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/c/sarah"
                className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-8 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                See a live Tree
              </Link>
              <Link
                href="/campaigns"
                className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-8 rounded-full text-base transition-all duration-200"
              >
                Start a campaign
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── TRUST FOOTER ─── Small but clear */}
      <section className="py-8 md:py-12 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Tree of Hope is a for-profit service. Your contribution funds the Sanctuary and ongoing platform operations. It is not sent to the patient.
          </p>
        </div>
      </section>
    </div>
  )
}
