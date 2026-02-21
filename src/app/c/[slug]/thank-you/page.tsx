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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-4">
                You did it
              </p>
              <h1
                className="text-5xl md:text-[3.5rem] lg:text-[4rem] font-bold text-[var(--color-text)] leading-[1.1] mb-6"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Thank you.
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                Your leaf is now part of the Tree. If you&apos;d like, share this page
                with someone else in the circle.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Share2 className="w-4 h-4" />
                  {copySuccess ? 'Copied!' : 'Share the tree'}
                </button>
                <Link
                  href={`/c/${slug}`}
                  className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
                >
                  View the Tree
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-hope)] opacity-[0.06] rounded-full blur-3xl scale-110" />
                <Image
                  src="/tree-hero.png"
                  alt="Tree of Hope"
                  width={500}
                  height={518}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMITMENT SUMMARY ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              Your commitment
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              You&apos;re in the circle.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-bg)] rounded-3xl p-8">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                Status
              </p>
              <p
                className="text-3xl font-bold text-[var(--color-hope)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Active
              </p>
              <p className="text-[var(--color-text-muted)] mt-2 text-sm">
                Your monthly support renews automatically
              </p>
            </div>

            <div className="bg-[var(--color-bg)] rounded-3xl p-8">
              <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                Next renewal
              </p>
              <p
                className="text-3xl font-bold text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-[var(--color-text-muted)] mt-2 text-sm">
                Manage anytime at your account settings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SHARE ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-hope)] mb-3">
              Spread the word
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Invite others to join.
            </h2>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCopyLink}
              className={cn(
                'w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-0.5',
                copySuccess
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-[var(--color-border)] hover:border-[var(--color-hope)] hover:shadow-md'
              )}
            >
              <div className="flex items-center gap-3">
                <Copy className="w-5 h-5" />
                <span className="font-medium">{copySuccess ? 'Copied!' : 'Copy campaign link'}</span>
              </div>
              {copySuccess && <span className="text-green-600 font-bold">✓</span>}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-3 p-5 rounded-2xl border-2 border-[var(--color-border)] hover:border-green-400 hover:bg-green-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share on WhatsApp</span>
            </button>

            <button
              onClick={handleSMSShare}
              className="w-full flex items-center gap-3 p-5 rounded-2xl border-2 border-[var(--color-border)] hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Share via SMS</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16 md:py-20 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/me/commitment"
              className="inline-flex items-center justify-center bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-4 px-10 rounded-full text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              View your commitment
            </Link>
            <Link
              href={`/c/${slug}`}
              className="inline-flex items-center justify-center border-2 border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] font-semibold py-4 px-10 rounded-full text-base transition-all duration-200"
            >
              Back to the Tree
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
