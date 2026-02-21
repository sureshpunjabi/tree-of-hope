import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[var(--color-bg)]">
      <div className="max-w-lg mx-auto px-4 text-center">
        <Image
          src="/tree-hero.png"
          alt="Tree of Hope"
          width={120}
          height={124}
          className="mx-auto mb-12 opacity-40"
        />
        <h1
          className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          This path doesn't lead anywhere yet.
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] mb-10 leading-relaxed">
          But every journey starts somewhere. Let's take you back to familiar ground.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
