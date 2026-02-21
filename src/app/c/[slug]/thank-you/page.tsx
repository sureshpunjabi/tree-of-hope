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
  const [commitment, setCommitment] = useState<{
    tier: string
    monthlyAmount: number
  } | null>(null)

  useEffect(() => {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/c/${slug}`
    setCampaignUrl(url)

    // Fetch campaign data
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

    // Track successful checkout
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
    const message = `I'm nurturing a tree of hope for ${patientName}'s health journey. Come add your leaf of support and commit to monthly care. 🌱`
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
      {/* Hero Section — PRD design */}
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                className="font-bold text-5xl md:text-6xl text-[var(--color-text)] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Thank you.
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] mb-6 leading-relaxed">
                Your leaf is now part of the Tree of Hope.
              </p>
              <p className="text-[var(--color-text-muted)] mb-8">
                If you'd like, share this page with someone else in the circle.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    'inline-flex items-center justify-center gap-2',
                    'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                    'text-white font-semibold py-3 px-8 rounded-full text-base',
                    'transition-all duration-200 hover:shadow-lg'
                  )}
                >
                  <Share2 className="w-4 h-4" />
                  {copySuccess ? 'Copied!' : 'Share'}
                </button>

                <Link
                  href={`/c/${slug}`}
                  className={cn(
                    'inline-flex items-center justify-center',
                    'border-2 border-[var(--color-border)] hover:border-[var(--color-text)]',
                    'text-[var(--color-text)] font-semibold py-3 px-8 rounded-full text-base',
                    'transition-all duration-200'
                  )}
                >
                  View the Tree
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope"
                width={460}
                height={476}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Commitment Summary Card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-8 shadow-sm">
          <h2
            className="font-serif font-bold text-2xl text-[var(--color-text)] mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Your Commitment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-2">Monthly Tier</p>
              <p className="font-serif text-3xl font-bold text-[var(--color-hope)]">
                Active
              </p>
              <p className="text-[var(--color-text-muted)] mt-1">
                Your monthly support will renew automatically
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-2">Next Renewal</p>
              <p className="font-serif text-3xl font-bold text-[var(--color-trunk)]">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
              <p className="text-[var(--color-text-muted)] mt-1">
                Your membership renews monthly
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              You'll receive confirmation emails for each month's support
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              To manage your commitment, visit your account settings or contact support@treeofhope.com
            </p>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-amber-50 rounded-lg border border-[var(--color-border)] p-8">
          <h2
            className="font-serif font-bold text-2xl text-[var(--color-text)] mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Invite others to add their leaves
          </h2>
          <p className="text-[var(--color-text-muted)] mb-6">
            Share {patientName}'s Tree and help grow the community of support
          </p>

          <div className="space-y-3">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200',
                copySuccess
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-[var(--color-border)] hover:border-[var(--color-hope)]'
              )}
            >
              <div className="flex items-center gap-3">
                <Copy className="w-5 h-5" />
                <span className="font-medium">
                  {copySuccess ? 'Copied!' : 'Copy campaign link'}
                </span>
              </div>
              {copySuccess && <span className="text-green-600">✓</span>}
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-[var(--color-border)] hover:border-green-400 hover:bg-green-50 transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share on WhatsApp</span>
            </button>

            {/* SMS Share Button */}
            <button
              onClick={handleSMSShare}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-[var(--color-border)] hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Share via SMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/me/commitment"
            className={cn(
              'btn-primary inline-flex items-center justify-center',
              'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
              'text-white font-semibold py-3 px-8 rounded-full',
              'transition-all duration-200 hover:shadow-lg'
            )}
          >
            View your commitment
          </Link>

          <Link
            href={`/c/${slug}`}
            className={cn(
              'btn-secondary inline-flex items-center justify-center',
              'border-2 border-[var(--color-border)] hover:border-[var(--color-hope)]',
              'text-[var(--color-trunk)] font-semibold py-3 px-8 rounded-full',
              'transition-all duration-200 hover:bg-amber-50'
            )}
          >
            Back to the Tree
          </Link>
        </div>
      </div>

      {/* Trust Language */}
      <div className="py-12 bg-amber-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="trust-language">
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Tree of Hope is a for-profit service. Your contribution funds the
              Sanctuary and ongoing platform operations. It is not sent to the
              patient.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
