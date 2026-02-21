import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Tree of Hope',
  description:
    'Tree of Hope is a micro-campaign fundraising platform where supporters plant leaves of hope and commit to monthly support, funding a private Sanctuary for patients and caregivers.',
  keywords: [
    'fundraising',
    'micro-campaigns',
    'community',
    'support',
    'health',
    'sanctuary',
  ],
  authors: [{ name: 'Tree of Hope' }],
  openGraph: {
    title: 'Tree of Hope',
    description:
      'Every tree starts with a single leaf. Turn community support into lasting care.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
