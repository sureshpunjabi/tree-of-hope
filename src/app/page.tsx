import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerChildren'
import SplitText from '@/components/ui/SplitText'
import MagneticButton from '@/components/ui/MagneticButton'
import InteractiveTree from '@/components/ui/InteractiveTree'
import GradientMesh from '@/components/ui/GradientMesh'
import HeroAtmosphere from '@/components/ui/HeroAtmosphere'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── Cinematic, breathing, premium */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 sm:px-8 pt-20 pb-12 overflow-hidden">
        {/* Atmospheric particles */}
        <HeroAtmosphere />

        {/* Warm radial background wash */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(200,185,155,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-[900px] mx-auto text-center">
          {/* Headline */}
          <SplitText
            as="h1"
            className="text-[clamp(3.8rem,10vw,9rem)] font-bold text-[var(--color-text)] leading-[0.98] tracking-[-0.04em] mb-6"
            delay={100}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Give hope.
          </SplitText>

          <ScrollReveal delay={400}>
            <p
              className="text-[clamp(1.15rem,2.4vw,1.6rem)] text-[var(--color-text-muted)] max-w-[460px] mx-auto leading-[1.5] mb-12 tracking-[-0.005em]"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
            >
              When we care for someone,<br />something grows.
            </p>
          </ScrollReveal>

          {/* Terrarium image — floating with warm glow */}
          <ScrollReveal delay={550}>
            <div className="relative mx-auto mb-12 w-[min(380px,75vw)]">
              {/* Warm halo behind image */}
              <div
                className="absolute inset-[-20%] rounded-full blur-3xl opacity-[0.08] z-0"
                style={{ background: 'radial-gradient(circle, rgba(140,180,120,0.8) 0%, rgba(200,180,140,0.4) 50%, transparent 70%)' }}
              />
              <div className="relative z-10 animate-float aspect-square">
                <Image
                  src="/terrarium-hero.png"
                  alt="A bonsai tree growing inside a glass dome terrarium"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
                  sizes="(max-width: 640px) 75vw, 380px"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={750}>
            <MagneticButton strength={0.12} className="inline-block">
              <Link
                href="/c/sarah"
                className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-4 px-12 rounded-full text-[16px] transition-all duration-500 tracking-[0.02em] hover:shadow-xl hover:shadow-[var(--color-hope)]/25 hover:scale-[1.03]"
              >
                Contribute
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent to-[var(--color-text)] animate-pulse" />
        </div>
      </section>

      {/* ─── INTERACTIVE TREE ─── Living, breathing, canvas-drawn */}
      <section className="py-16 md:py-24 flex justify-center px-5">
        <ScrollReveal>
          <InteractiveTree />
        </ScrollReveal>
      </section>

      {/* ─── THE RHYTHM ─── Three beats, maximum restraint */}
      <section id="how" className="py-16 md:py-44">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <SplitText
            as="h2"
            className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold text-[var(--color-text)] leading-[1.08] tracking-[-0.03em] text-center mb-12 md:mb-28"
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

      {/* ─── DARK SECTION ─── Gradient mesh + emotional gravity */}
      <section className="relative py-20 md:py-48 overflow-hidden">
        <GradientMesh />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
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

      {/* ─── THREE SURFACES ─── Product architecture with glass cards */}
      <section className="py-16 md:py-44">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12 md:mb-28">
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
                bg: 'rgba(245, 240, 234, 0.7)',
                border: 'rgba(200, 180, 160, 0.2)',
              },
              {
                title: 'Sanctuary',
                desc: 'A private space for patient and caregiver. Journal, tools, and 30 days of guided content.',
                href: '/sanctuary',
                label: 'Learn more',
                bg: 'rgba(238, 243, 235, 0.7)',
                border: 'rgba(160, 200, 160, 0.2)',
              },
              {
                title: 'Bridge',
                desc: 'Converts one-time GoFundMe generosity into sustained monthly support.',
                href: '/bridge',
                label: 'Learn more',
                bg: 'rgba(235, 238, 243, 0.7)',
                border: 'rgba(160, 170, 200, 0.2)',
              },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <Link href={card.href} className="block group">
                  <div
                    className="rounded-2xl p-8 md:p-9 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-black/[0.06] backdrop-blur-sm border"
                    style={{ backgroundColor: card.bg, borderColor: card.border }}
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
                      <span className="text-[12px] transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── TRUST ─── Radical transparency, no gimmicks */}
      <section className="py-16 md:py-44" style={{ backgroundColor: 'rgba(245, 245, 240, 0.5)' }}>
        <div className="max-w-[680px] mx-auto px-5 sm:px-8">
          <SplitText
            as="h2"
            className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold text-[var(--color-text)] leading-[1.1] tracking-[-0.03em] text-center mb-10 md:mb-20"
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
      <section className="py-20 md:py-48">
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
                className="inline-flex items-center justify-center bg-[var(--color-text)] hover:bg-[var(--color-text)]/80 text-white font-medium py-3.5 px-8 rounded-full text-[15px] transition-all duration-300 tracking-[-0.01em] hover:shadow-lg hover:shadow-black/10"
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
