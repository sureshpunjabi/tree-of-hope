'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-hope)] mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)]">
              Verifying your email...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Email Verified!
            </h1>
            <p className="text-[var(--color-text-muted)] mb-6">
              Your email has been verified successfully. Redirecting you to the home page...
            </p>
            <Link href="/" className="inline-block btn-primary">
              Go to Home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Verification Failed
            </h1>
            <p className="text-red-600 mb-6">{errorMessage}</p>
            <Link href="/" className="inline-block btn-primary">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
