import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SmoothScroll from '@/components/ui/SmoothScroll'
import ScrollProgress from '@/components/ui/ScrollProgress'
import LeafParticles from '@/components/ui/LeafParticles'
import CustomCursor from '@/components/ui/CustomCursor'
import NoiseOverlay from '@/components/ui/NoiseOverlay'
import ScrollColorMorph from '@/components/ui/ScrollColorMorph'
import CinematicEntrance from '@/components/ui/CinematicEntrance'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4A6741',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://tree-of-hope-olive.vercel.app'),
  title: {
    default: 'Tree of Hope',
    template: '%s | Tree of Hope',
  },
  description:
    'Tree of Hope turns community love into lasting support. Plant a leaf, show up monthly, and help build a private Sanctuary for patients and caregivers.',
  keywords: [
    'tree of hope',
    'community support',
    'show up',
    'sanctuary',
    'health',
    'leaves of hope',
  ],
  authors: [{ name: 'Tree of Hope' }],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Tree of Hope',
    description:
      'Every tree starts with a single leaf. Show up for someone you love.',
    type: 'website',
    url: 'https://tree-of-hope-olive.vercel.app',
    siteName: 'Tree of Hope',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tree of Hope - Show up for someone you love',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tree of Hope',
    description:
      'Every tree starts with a single leaf. Show up for someone you love.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="lenis">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen text-[var(--color-text)]" style={{ backgroundColor: 'var(--dynamic-bg, var(--color-bg))' }}>
        <ScrollProgress />
        <LeafParticles />
        <NoiseOverlay />
        <CustomCursor />
        <ScrollColorMorph />
        <CinematicEntrance>
          <SmoothScroll>
            <AuthProvider>
              <Header />
              <main className="flex-1 relative z-10">{children}</main>
              <Footer />
            </AuthProvider>
          </SmoothScroll>
        </CinematicEntrance>
      </body>
    </html>
  )
}
