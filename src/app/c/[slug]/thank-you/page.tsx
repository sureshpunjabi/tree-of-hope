'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, Share2, MessageCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { getBaseUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ThankYouPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const sessionId = searchParams.get('session_id')

  const [patientName, setPatientName] = useState<string>('this patient')
  const [campaignUrl, setCampaignUrl] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/c/${slug}`
    setCampaignUrl(url)

    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/public/campaigns/${slug}`)
        if (response.ok) {
          const data = await response.json()
          const campaign = data.campaign || data
          setPatientName(campaign.patient_name || campaign.title || 'this patient')
        }
      } catch (err) {
        console.error('Failed to fetch campaign:', err)
      }
    }

    fetchCampaign()

    if (sessionId) {
      trackEvent('checkout_succeeded', { slug, sessionId })
    }
  }, [slug, sessionId])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleWhatsAppShare = () => {
    const message = `I'm nurturing a tree of hope for ${patientName}'s health journey. Come add your leaf of support and commit to monthly care.`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)} ${encodeURIComponent(campaignUrl)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleSMSShare = () => {
    const message = `I'm supporting ${patientName}'s Tree of Hope. Add your leaf and commit to monthly care: ${campaignUrl}`
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    window.location.href = smsUrl
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 lg:py-56">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-light tracking-wide text-[var(--color-hope)] mb-6">
              A moment of gratitude
            </p>
            <h1
              className="text-6xl md:text-7xl font-light text-[var(--color-text)] leading-[1.2] mb-8"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              You showed up. That&apos;s everything.
            </h1>
            <p className="text-base md:text-lg text-[var(--color-text-muted)] mb-12 leading-relaxed font-light italic max-w-2xl mx-auto">
              "One person can't change everything. But one person showing up can change everything for one person."
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-sm transition-all duration-200 hover:shadow-md"
              >
                <Share2 className="w-4 h-4" />
                {copySuccess ? 'Copied!' : 'Share the tree'}
              </button>
              <Link
                href={`/c/${slug}`}
                className="inline-flex items-center justify-center text-[var(--color-text)] hover:text-[var(--color-hope)] font-medium py-3 px-8 rounded-full text-sm transition-colors duration-200"
              >
                View the Tree
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center mt-20">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-110" />
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope"
                width={400}
                height={414}
                className="relative z-10 drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMITMENT SUMMARY ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-light tracking-wide text-[var(--color-hope)] mb-3">
              Your commitment
            </p>
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              You&apos;re in the circle.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-bg)] rounded-2xl p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                Status
              </p>
              <p
                className="text-3xl font-semibold text-[var(--color-hope)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Active
              </p>
              <p className="text-[var(--color-text-muted)] mt-3 text-sm">
                Your monthly support renews automatically
              </p>
            </div>

            <div className="bg-[var(--color-bg)] rounded-2xl p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                Next renewal
              </p>
              <p
                className="text-3xl font-semibold text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-[var(--color-text-muted)] mt-3 text-sm">
                Manage anytime at your account settings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SHARE ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-5xl md:text-6xl font-light text-[var(--color-text)] leading-tight mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              The most powerful thing you can do now
            </h2>
            <p className="text-base text-[var(--color-text-muted)] font-light">
              is invite one more person into the circle.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCopyLink}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200',
                copySuccess
                  ? 'bg-[var(--color-hope)]/10 text-[var(--color-hope)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]'
              )}
            >
              <div className="flex items-center gap-3">
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">{copySuccess ? 'Copied!' : 'Copy campaign link'}</span>
              </div>
              {copySuccess && <span className="text-[var(--color-hope)]">✓</span>}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-3 p-4 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)] transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share on WhatsApp</span>
            </button>

            <button
              onClick={handleSMSShare}
              className="w-full flex items-center gap-3 p-4 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)] transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Share via SMS</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16 md:py-20 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/me/commitment"
              className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-medium py-3 px-8 rounded-full text-sm transition-all duration-200 hover:shadow-md"
            >
              View your commitment
            </Link>
            <Link
              href={`/c/${slug}`}
              className="inline-flex items-center justify-center text-[var(--color-text)] hover:text-[var(--color-hope)] font-medium py-3 px-8 rounded-full text-sm transition-colors duration-200"
            >
              Back to the Tree
            </Link>
          </div>
        </div>
      </section>

      {/* Trust language footer */}
      <section className="py-8 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Tree of Hope is a for-profit service. Your contribution funds the Sanctuary and ongoing platform operations. We are committed to transparency and responsible stewardship.
          </p>
        </div>
      </section>
    </div>
  )
}
