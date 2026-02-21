'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import Link from 'next/link'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function VerifyPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const verifyToken = async () => {
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      // Track magic link opened
      trackEvent('magic_link_opened', { type })

      if (!tokenHash || !type) {
        setStatus('error')
        setErrorMessage('Invalid verification link. Missing token or type.')
        trackEvent('sign_in_failed', { reason: 'missing_token_or_type' })
        return
      }

      try {
        // Verify the OTP token
        const supabase = getSupabase()
        if (!supabase) {
          setStatus('error')
          setErrorMessage('Authentication service unavailable.')
          return
        }
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'recovery' | 'magiclink' | 'email_change',
        })

        if (error) {
          setStatus('error')
          setErrorMessage(
            error.message || 'Verification failed. Please try signing in again.'
          )
          trackEvent('sign_in_failed', { reason: error.message })
          return
        }

        if (data.user) {
          // Track successful sign in
          trackEvent('sign_in_success', { userId: data.user.id })

          setStatus('success')

          // Redirect to home after 2 seconds
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      } catch (err) {
        console.error('Verification error:', err)
        setStatus('error')
        setErrorMessage('An unexpected error occurred. Please try again.')
        trackEvent('sign_in_failed', {
          reason: err instanceof Error ? err.message : 'unknown_error',
        })
      }
    }

    verifyToken()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Content — Left */}
          <div>
            {status === 'loading' && (
              <div className="text-center md:text-left">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-hope)] mb-4 md:mx-0 mx-auto" />
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                  Verifying...
                </h1>
                <p className="text-lg text-[var(--color-text-muted)]">
                  Checking your email verification
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                  Email Verified!
                </h1>
                <p className="text-lg text-[var(--color-text-muted)] mb-6 leading-relaxed">
                  Your email has been verified successfully. Redirecting you to the home page...
                </p>
                <Link href="/" className="inline-block bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 hover:shadow-lg">
                  Go to Home
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-6">
                  <AlertCircle className="w-16 h-16 text-red-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                  Verification Failed
                </h1>
                <p className="text-lg text-red-600 mb-6">{errorMessage}</p>
                <Link href="/" className="inline-block bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)] text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 hover:shadow-lg">
                  Back to Home
                </Link>
              </div>
            )}
          </div>

          {/* Tree Image — Right */}
          <div className="hidden md:flex justify-end">
            <Image
              src="/tree-hero.png"
              alt="Tree of Hope"
              width={340}
              height={352}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
