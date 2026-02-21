import Link from 'next/link'
import { TrustBadge } from '@/components/layout/TrustBadge'
import { HeroTree } from './hero-tree'
import { cn } from '@/lib/utils'
import { Leaf, Heart, Shield } from 'lucide-react'

export default function HomePage() {
  const steps = [
    {
      icon: Leaf,
      title: 'Write a Leaf',
      description:
        'Add a message of hope to someone\'s Tree. It\'s personal, it\'s permanent, and it matters.',
    },
    {
      icon: Heart,
      title: 'Commit Monthly',
      description:
        'Choose a monthly contribution from $9. Your presence matters more than the amount.',
    },
    {
      icon: Shield,
      title: 'Fund their Sanctuary',
      description:
        'Your support creates a private 30-day guided space with care tools, daily support, and community.',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-[var(--color-bg)] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h1
            className="font-serif font-bold text-5xl md:text-6xl text-[var(--color-text)] text-center mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Every tree starts with a single leaf
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] text-center mb-12 leading-relaxed max-w-3xl mx-auto">
            Tree of Hope turns community support into lasting care. Write a message of hope.
            Commit to monthly support. Fund a private Sanctuary for someone going through a
            health crisis.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/campaigns"
              className={cn(
                'btn-primary inline-flex items-center justify-center',
                'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                'text-white font-semibold py-4 px-10 rounded-full text-lg',
                'transition-all duration-200 hover:shadow-lg'
              )}
            >
              Find a Tree
            </Link>

            <Link
              href="/admin/campaigns/new"
              className={cn(
                'btn-secondary inline-flex items-center justify-center',
                'border-2 border-[var(--color-border)] hover:border-[var(--color-hope)]',
                'text-[var(--color-trunk)] font-semibold py-4 px-10 rounded-full text-lg',
                'transition-all duration-200 hover:bg-amber-50'
              )}
            >
              Start a Tree
            </Link>
          </div>

          {/* Hero Illustration */}
          <HeroTree />
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 md:py-16 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] text-center mb-8">
            Built on Trust
          </h2>
          <div className="flex justify-center mb-8">
            <TrustBadge />
          </div>
          <p className="text-center text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Every contribution is secure, transparent, and directly supports real people facing
            health challenges. Your impact is visible and meaningful.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] text-center mb-12">
            How It Works
          </h2>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-[var(--color-hope)] bg-opacity-10 p-4 rounded-lg">
                      <Icon className="w-8 h-8 text-[var(--color-hope)]" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--color-hope)] to-green-600 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to help someone grow?
          </h2>
          <p className="text-lg text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
            Every leaf matters. Every commitment counts. Every Sanctuary heals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/campaigns"
              className="inline-block bg-white text-[var(--color-hope)] font-semibold py-4 px-10 rounded-full hover:shadow-lg transition-all"
            >
              Explore Trees
            </Link>
            <Link
              href="/admin/campaigns/new"
              className="inline-block border-2 border-white text-white font-semibold py-4 px-10 rounded-full hover:bg-white hover:bg-opacity-10 transition-all"
            >
              Create a Tree
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
