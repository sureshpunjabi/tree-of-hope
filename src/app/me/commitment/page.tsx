'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency } from '@/lib/utils'

interface Commitment {
  id: string
  stripe_subscription_id: string | null
  monthly_amount_cents: number
  joining_gift_cents: number
  status: 'active' | 'paused' | 'cancelled' | 'past_due'
  pause_reason: string | null
  pause_note: string | null
  created_at: string
  campaign: {
    id: string
    slug: string
    title: string
    patient_name: string
  } | null
}

export default function MyCommitmentPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pausingId, setPausingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) {
      fetchCommitments()
    }
  }, [user, authLoading, router])

  const fetchCommitments = async () => {
    try {
      const response = await fetch('/api/me/commitment', {
        headers: {
          Authorization: `Bearer ${(await (await import('@/lib/supabase')).supabase.auth.getSession()).data.session?.access_token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCommitments(data.commitments || [])
      }
    } catch {
      setError('Failed to load commitments')
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async (commitmentId: string) => {
    setPausingId(commitmentId)
    try {
      const session = (await (await import('@/lib/supabase')).supabase.auth.getSession()).data.session
      const response = await fetch('/api/me/commitment/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          commitment_id: commitmentId,
          reason: 'hardship',
        }),
      })
      if (response.ok) {
        await fetchCommitments()
      }
    } catch {
      setError('Failed to pause commitment')
    } finally {
      setPausingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-muted)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Content */}
            <div>
              <h1
                className="font-bold text-4xl md:text-5xl text-[var(--color-text)] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Your commitment.
              </h1>
              <p className="text-[var(--color-text-muted)] mb-8">
                A steady presence. Quietly sustained.
              </p>

              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}

              {commitments.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-8">
                  <p className="text-[var(--color-text-muted)] mb-4">
                    You don&apos;t have any active commitments yet.
                  </p>
                  <Link
                    href="/campaigns"
                    className={cn(
                      'inline-flex items-center justify-center',
                      'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                      'text-white font-semibold py-3 px-8 rounded-full text-base',
                      'transition-all duration-200 hover:shadow-lg'
                    )}
                  >
                    Find a campaign
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {commitments.map((commitment) => (
                    <div
                      key={commitment.id}
                      className="bg-white rounded-xl border border-[var(--color-border)] p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-[var(--color-text)]">
                            {commitment.campaign?.patient_name || 'Campaign'}
                          </h3>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {commitment.campaign?.title}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'text-xs font-medium px-3 py-1 rounded-full',
                            commitment.status === 'active' && 'bg-green-100 text-green-800',
                            commitment.status === 'paused' && 'bg-yellow-100 text-yellow-800',
                            commitment.status === 'cancelled' && 'bg-gray-100 text-gray-600',
                            commitment.status === 'past_due' && 'bg-red-100 text-red-800'
                          )}
                        >
                          {commitment.status.charAt(0).toUpperCase() + commitment.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Status</span>
                          <span className="text-[var(--color-text)]">
                            {commitment.status === 'active' ? 'Active' : commitment.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Monthly</span>
                          <span className="text-[var(--color-text)]">
                            {formatCurrency(commitment.monthly_amount_cents)}/mo
                          </span>
                        </div>
                        {commitment.joining_gift_cents > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[var(--color-text-muted)]">Joining gift</span>
                            <span className="text-[var(--color-text)]">
                              {formatCurrency(commitment.joining_gift_cents)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Since</span>
                          <span className="text-[var(--color-text)]">
                            {new Date(commitment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {commitment.status === 'active' && (
                        <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex gap-3">
                          <button
                            onClick={() => handlePause(commitment.id)}
                            disabled={pausingId === commitment.id}
                            className={cn(
                              'inline-flex items-center justify-center',
                              'bg-[var(--color-hope)] hover:bg-[var(--color-hope-hover)]',
                              'text-white font-semibold py-2 px-6 rounded-full text-sm',
                              'transition-all duration-200 hover:shadow-lg',
                              'disabled:opacity-50'
                            )}
                          >
                            {pausingId === commitment.id ? 'Pausing...' : 'Pause for hardship'}
                          </button>
                          {commitment.campaign && (
                            <Link
                              href={`/c/${commitment.campaign.slug}`}
                              className={cn(
                                'inline-flex items-center justify-center',
                                'border-2 border-[var(--color-border)] hover:border-[var(--color-text)]',
                                'text-[var(--color-text)] font-semibold py-2 px-6 rounded-full text-sm',
                                'transition-all duration-200'
                              )}
                            >
                              View Tree
                            </Link>
                          )}
                        </div>
                      )}

                      {commitment.status === 'paused' && (
                        <p className="mt-4 text-sm text-[var(--color-text-muted)] italic">
                          Life is bigger than any subscription. Your tree stays standing,
                          your Sanctuary stays open, and we&apos;ll be here when you&apos;re
                          ready to resume. No questions asked.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Tree Image */}
            <div className="hidden md:flex justify-end sticky top-24">
              <Image
                src="/tree-hero.png"
                alt="Tree of Hope"
                width={380}
                height={393}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
