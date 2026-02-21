import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerChildren'
import TiltCard from '@/components/ui/TiltCard'
import ParallaxImage from '@/components/ui/ParallaxImage'
import SplitText from '@/components/ui/SplitText'
import MagneticButton from '@/components/ui/MagneticButton'
import AnimatedGradient from '@/components/ui/AnimatedGradient'
import FloatingElements from '@/components/ui/FloatingElements'
import Marquee from '@/components/ui/Marquee'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── Cathedral-like, full viewport, centered silence */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center py-32 md:py-48">
        <AnimatedGradient colors={['#4A6741', '#66BB6A', '#FFFAF5', '#f0ebe4']} speed={12} />
        <FloatingElements count={5} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal delay={0} direction="down">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[var(--color-hope)] mb-12 md:mb-16">
              A moment that changes everything
            </p>
          </ScrollReveal>

          <SplitText
            as="h1"
            className="text-5xl md:text-6xl lg:text-7xl font-light text-[var(--color-text)] leading-[1.1] mb-8 md:mb-12"
            delay={200}
          >
            When someone you love is diagnosed, the world doesn&apos;t stop. But something inside you does.
          </SplitText>

          <ScrollReveal delay={600}>
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed">
              Tree of Hope builds a circle of people around one person — for as long as they need it.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={800}>
            <MagneticButton strength={0.15} className="inline-block">
              <Link
                href="#rhythm"
                className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-hope)]/20"
              >
                See how it works
              </Link>
            </MagneticButton>
          </ScrollReveal>

          {/* Tree image with parallax */}
          <div className="mt-20 md:mt-32 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-150" />
              <ParallaxImage
                src="/tree-hero.png"
                alt="A bonsai tree growing in a glass dome — the Tree of Hope"
                width={300}
                height={310}
                className="relative z-10 drop-shadow-2xl"
                speed={0.15}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST MARQUEE ─── Infinite scroll social proof */}
      <section className="py-6 bg-white border-y border-[var(--color-border)]/50 overflow-hidden">
        <Marquee speed={40} pauseOnHover>
          {[
            'Built with radical transparency',
            'Pause anytime for hardship',
            'Private Sanctuary for patients',
            '30 days of guided content',
            'No passwords — magic links only',
            'Community-funded care',
            'Built with radical transparency',
            'Pause anytime for hardship',
          ].map((text, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-8 text-sm text-[var(--color-text-muted)] whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-hope)] mr-3 opacity-60" />
              {text}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ─── THE RHYTHM ─── Breathing room, three emotional beats */}
      <section id="rhythm" className="relative py-32 md:py-48 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-24">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[var(--color-hope)] mb-6">
                The rhythm
              </p>
            </div>
          </ScrollReveal>

          <SplitText
            as="h2"
            className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.2] text-center mb-16 md:mb-24"
          >
            Five days. One community. A lifetime of support.
          </SplitText>

          {/* Three minimal cards — staggered entrance */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                title: 'The Gathering',
                desc: 'For five days, people who care leave messages of hope — their leaves on a growing tree.',
                num: '01',
              },
              {
                title: 'The Commitment',
                desc: 'Each person chooses a monthly amount. Small, sustainable, pausable for hardship.',
                num: '02',
              },
              {
                title: 'The Sanctuary',
                desc: 'A private space opens for the patient and caregiver. Journal. Tools. Guided content. Held.',
                num: '03',
              },
            ].map((card) => (
              <StaggerItem key={card.num}>
                <div className="pt-8 border-t-2 border-[var(--color-hope)] group">
                  <span className="text-xs font-medium tracking-[0.2em] text-[var(--color-hope)] uppercase mb-4 block">
                    {card.num}
                  </span>
                  <h3
                    className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4 group-hover:text-[var(--color-hope)] transition-colors duration-500"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── EMOTIONAL PAUSE ─── Full-width quote, cream background */}
      <section className="relative py-32 md:py-48 bg-[#f9f7f3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <blockquote>
              <div className="mb-8">
                <span className="text-7xl md:text-8xl text-[var(--color-hope)] opacity-20 leading-none" style={{ fontFamily: 'var(--font-serif)' }}>&ldquo;</span>
              </div>
              <p
                className="text-3xl md:text-4xl lg:text-5xl font-light italic text-[var(--color-text)] leading-[1.3] mb-8"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                I didn&apos;t know how to help. I just knew I wanted to show up. This gave me a way.
              </p>
              <footer className="text-base text-[var(--color-text-muted)] tracking-wide">
                <span className="inline-block w-8 h-px bg-[var(--color-hope)] mr-3 align-middle opacity-50" />
                A supporter on Sarah&apos;s tree
              </footer>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── THREE SURFACES ─── Product overview with 3D tilt cards */}
      <section className="relative py-32 md:py-48 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-6">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[var(--color-hope)] mb-6">
                What we build
              </p>
            </div>
          </ScrollReveal>

          <SplitText
            as="h2"
            className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.2] text-center mb-16 md:mb-24"
          >
            Three surfaces, one purpose.
          </SplitText>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Campaign Tree',
                desc: 'A five-day micro-campaign where supporters leave messages and commit to monthly giving.',
                href: '/c/sarah',
                label: 'View example',
                gradient: 'from-[#f0ebe4] to-[#e8e0d5]',
              },
              {
                title: 'Sanctuary',
                desc: 'A private space for the patient and caregiver with guided daily content, journal, and tools.',
                href: '/sanctuary',
                label: 'Learn more',
                gradient: 'from-[#e8f0e4] to-[#d5e0d2]',
              },
              {
                title: 'Bridge',
                desc: 'Connects GoFundMe donors to ongoing monthly support through Tree of Hope.',
                href: '/bridge',
                label: 'Learn more',
                gradient: 'from-[#e4e8f0] to-[#d2d5e0]',
              },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <TiltCard tiltAmount={6} scale={1.01} glare>
                  <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-b ${card.gradient} p-8 md:p-10`}>
                    <h3
                      className="text-2xl md:text-3xl font-light text-[var(--color-text)] mb-4"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                      {card.desc}
                    </p>
                    <Link
                      href={card.href}
                      className="inline-flex items-center text-[var(--color-hope)] font-semibold hover:underline text-sm group/link"
                    >
                      {card.label}
                      <span className="ml-1 group-hover/link:translate-x-1 transition-transform duration-200">→</span>
                    </Link>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── TRUST / FAQ ─── Radical transparency */}
      <section className="relative py-32 md:py-48 bg-[#f9f7f3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-6">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[var(--color-hope)] mb-6">
                Built on trust
              </p>
            </div>
          </ScrollReveal>

          <SplitText
            as="h2"
            className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-[1.2] text-center mb-16 md:mb-24"
          >
            We believe in radical transparency.
          </SplitText>

          <ScrollReveal delay={150}>
            <div className="space-y-3">
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
                  className="group bg-white rounded-xl border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:border-[var(--color-hope)]/30"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-[var(--color-text)] text-lg hover:bg-gray-50/50 transition-colors duration-200">
                    {faq.q}
                    <span className="text-[var(--color-hope)] group-open:rotate-45 transition-transform duration-300 text-2xl leading-none ml-4 flex-shrink-0">
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
      <section className="relative py-32 md:py-48 bg-white overflow-hidden">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-12 md:mb-16 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-150" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={250}
                  height={259}
                  className="relative z-10 drop-shadow-lg animate-float"
                />
              </div>
            </div>

            <SplitText
              as="h2"
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] mb-6 leading-[1.2]"
            >
              Every tree starts with a single leaf.
            </SplitText>

            <ScrollReveal delay={200}>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed">
                See the rhythm. Feel the community. Join the circle.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <MagneticButton strength={0.12} className="inline-block">
                  <Link
                    href="/c/sarah"
                    className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-hope)]/20"
                  >
                    See a live Tree
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.12} className="inline-block">
                  <Link
                    href="/campaigns"
                    className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-300"
                  >
                    Start a campaign
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>
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
