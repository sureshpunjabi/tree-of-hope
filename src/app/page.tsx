import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerChildren'
import SplitText from '@/components/ui/SplitText'
import MagneticButton from '@/components/ui/MagneticButton'
import ParallaxImage from '@/components/ui/ParallaxImage'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── One moment. Nothing else. */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 sm:px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <SplitText
            as="h1"
            className="text-[clamp(2.75rem,7vw,6.5rem)] font-semibold text-[var(--color-text)] leading-[1.06] tracking-[-0.03em] mb-7"
            delay={100}
          >
            Show up. Stay.
          </SplitText>

          <ScrollReveal delay={500}>
            <p className="text-[clamp(1.05rem,2vw,1.35rem)] text-[var(--color-text-muted)] max-w-[520px] mx-auto leading-[1.5] mb-10 tracking-[-0.01em]">
              When someone you love is diagnosed, Tree&nbsp;of&nbsp;Hope turns a moment of helplessness into a circle of lasting&nbsp;support.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={700}>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              <MagneticButton strength={0.1} className="inline-block">
                <Link
                  href="/c/sarah"
                  className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em]"
                >
                  See a live tree
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.1} className="inline-block">
                <Link
                  href="#how"
                  className="inline-flex items-center justify-center text-[var(--color-hope)] font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em] hover:bg-[var(--color-hope)]/[0.06]"
                >
                  How it works
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── TREE IMAGE ─── Full-width moment of pause */}
      <section className="py-20 md:py-32 flex justify-center px-5">
        <ScrollReveal>
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.04] rounded-full blur-[100px] scale-[2]" />
            <ParallaxImage
              src="/tree-hero.png"
              alt="A bonsai tree in a glass dome"
              width={380}
              height={394}
              className="relative z-10 drop-shadow-xl"
              speed={0.12}
              priority
            />
          </div>
        </ScrollReveal>
      </section>

      {/* ─── THE RHYTHM ─── Three beats, maximum restraint */}
      <section id="how" className="py-28 md:py-44">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <SplitText
            as="h2"
            className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold text-[var(--color-text)] leading-[1.08] tracking-[-0.03em] text-center mb-20 md:mb-28"
          >
            Five days. One circle.
          </SplitText>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10">
            {[
              {
                num: '01',
                title: 'Gather',
                desc: 'People who care leave messages of hope — their leaves on a growing tree.',
              },
              {
                num: '02',
                title: 'Commit',
                desc: 'Each person chooses a small monthly amount. Pausable anytime, no questions asked.',
              },
              {
                num: '03',
                title: 'Shelter',
                desc: 'A private Sanctuary opens for patient and caregiver. Journal. Tools. Guided content.',
              },
            ].map((card) => (
              <StaggerItem key={card.num}>
                <div className="group">
                  <span className="text-[13px] font-medium tracking-[0.15em] text-[var(--color-text-muted)] uppercase block mb-5">
                    {card.num}
                  </span>
                  <h3
                    className="text-[28px] md:text-[32px] font-semibold text-[var(--color-text)] mb-3 tracking-[-0.02em] leading-[1.15]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                    {card.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── DARK SECTION ─── Dramatic contrast. Emotional gravity. */}
      <section className="section-dark py-32 md:py-48">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <ScrollReveal>
            <blockquote>
              <p
                className="text-[clamp(1.75rem,4vw,3.25rem)] font-normal text-[#f5f5f7] leading-[1.25] tracking-[-0.02em] mb-8"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                &ldquo;I didn&apos;t know how to help. I just knew I wanted to show up. This gave me a way.&rdquo;
              </p>
              <footer className="text-[14px] text-[#a1a1a6] tracking-[0.02em]">
                A supporter on Sarah&apos;s tree
              </footer>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── THREE SURFACES ─── Product architecture */}
      <section className="py-28 md:py-44">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-20 md:mb-28">
            <SplitText
              as="h2"
              className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold text-[var(--color-text)] leading-[1.08] tracking-[-0.03em]"
            >
              Three surfaces. One purpose.
            </SplitText>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Campaign',
                desc: 'Five days of gathering. Messages become leaves. Leaves become monthly commitments.',
                href: '/c/sarah',
                label: 'View example',
                bg: '#f5f0ea',
              },
              {
                title: 'Sanctuary',
                desc: 'A private space for patient and caregiver. Journal, tools, and 30 days of guided content.',
                href: '/sanctuary',
                label: 'Learn more',
                bg: '#eef3eb',
              },
              {
                title: 'Bridge',
                desc: 'Converts one-time GoFundMe generosity into sustained monthly support.',
                href: '/bridge',
                label: 'Learn more',
                bg: '#ebeef3',
              },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <Link href={card.href} className="block group">
                  <div
                    className="rounded-2xl p-8 md:p-9 transition-all duration-500 group-hover:scale-[1.015] group-hover:shadow-lg group-hover:shadow-black/[0.04]"
                    style={{ backgroundColor: card.bg }}
                  >
                    <h3
                      className="text-[24px] md:text-[28px] font-semibold text-[var(--color-text)] mb-3 tracking-[-0.02em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-[14px] text-[var(--color-text-muted)] leading-[1.6] mb-6">
                      {card.desc}
                    </p>
                    <span className="text-[14px] font-medium text-[var(--color-hope)] inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300">
                      {card.label}
                      <span className="text-[12px]">→</span>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── TRUST ─── Radical transparency, no gimmicks */}
      <section className="py-28 md:py-44 bg-[#f5f5f0]">
        <div className="max-w-[680px] mx-auto px-5 sm:px-8">
          <SplitText
            as="h2"
            className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold text-[var(--color-text)] leading-[1.1] tracking-[-0.03em] text-center mb-16 md:mb-20"
          >
            Radical transparency.
          </SplitText>

          <ScrollReveal delay={100}>
            <div className="space-y-px">
              {[
                {
                  q: 'Where do the funds go?',
                  a: 'Funds support the platform, Sanctuary infrastructure, and operations. They are not transferred to the individual.',
                },
                {
                  q: 'Can I pause my commitment?',
                  a: 'Yes. Pause for hardship anytime, no questions asked.',
                },
                {
                  q: 'Is my data private?',
                  a: 'The Sanctuary is fully private. Only the patient and caregiver can see journal entries and health data.',
                },
                {
                  q: 'What happens after 5 days?',
                  a: 'The tree completes. The Sanctuary opens. Over 30 days, guided content helps navigate what comes next.',
                },
              ].map((faq) => (
                <details
                  key={faq.q}
                  className="group border-b border-black/[0.06] last:border-0"
                >
                  <summary className="flex items-center justify-between cursor-pointer py-5 text-[var(--color-text)] text-[16px] font-medium tracking-[-0.01em]">
                    {faq.q}
                    <span className="text-[var(--color-text-muted)] group-open:rotate-45 transition-transform duration-300 text-[20px] leading-none ml-4 flex-shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="pb-5 text-[var(--color-text-muted)] text-[15px] leading-[1.6]">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FINAL CTA ─── One last breath */}
      <section className="py-32 md:py-48">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <ScrollReveal>
            <div className="mb-12 flex justify-center">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope"
                width={160}
                height={166}
                className="drop-shadow-md animate-float"
              />
            </div>
          </ScrollReveal>

          <SplitText
            as="h2"
            className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold text-[var(--color-text)] leading-[1.08] tracking-[-0.03em] mb-5"
          >
            Every tree starts with one leaf.
          </SplitText>

          <ScrollReveal delay={200}>
            <p className="text-[clamp(1rem,1.8vw,1.2rem)] text-[var(--color-text-muted)] mb-10 leading-[1.5] tracking-[-0.01em]">
              Be the first.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={350}>
            <MagneticButton strength={0.1} className="inline-block">
              <Link
                href="/c/sarah"
                className="inline-flex items-center justify-center bg-[var(--color-text)] hover:bg-[var(--color-text)]/80 text-white font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em]"
              >
                See Sarah&apos;s tree
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
