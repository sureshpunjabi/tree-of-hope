'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Redirect old /symptoms path to new /wellness path
export default function SymptomsRedirect() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  useEffect(() => {
    router.replace(`/s/${slug}/wellness`)
  }, [slug, router])

  return null
}
