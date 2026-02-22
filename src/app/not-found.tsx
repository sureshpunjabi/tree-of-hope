import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="max-w-md mx-auto text-center">
        <Image
          src="/tree-hero.png"
          alt="Tree of Hope"
          width={100}
          height={104}
          className="mx-auto mb-10 opacity-30"
        />
        <h1
          className="text-[clamp(2rem,4vw,3rem)] font-semibold text-[var(--color-text)] mb-4 leading-[1.15] tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          This path doesn&apos;t lead anywhere yet.
        </h1>
        <p className="text-[15px] text-[var(--color-text-muted)] mb-10 leading-[1.7]">
          But every journey starts somewhere. Let&apos;s take you back to familiar ground.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-[15px] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-hope)]/20"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
