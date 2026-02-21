import { Suspense } from 'react'
import VerifyPageContent from './verify-content'

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageLoading />}>
      <VerifyPageContent />
    </Suspense>
  )
}

function VerifyPageLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-hope)] mx-auto mb-4" />
        <p className="text-[var(--color-text-muted)]">Verifying your email...</p>
      </div>
    </div>
  )
}
