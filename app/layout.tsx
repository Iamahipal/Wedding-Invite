import type { Metadata, Viewport } from 'next'
import {
  Cormorant_Garamond,
  Playfair_Display,
  Inter,
  Tiro_Devanagari_Hindi,
} from 'next/font/google'
import { couple, weddingDateDisplay } from '@/data/wedding'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const tiro = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: '400',
  variable: '--font-tiro',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mahipal-niharika.vercel.app'
const title = `${couple.groom.firstName} & ${couple.bride.firstName} — ${weddingDateDisplay.full}`
const description = `Together with our families, we invite you to celebrate our wedding in ${weddingDateDisplay.city} on ${weddingDateDisplay.full}. ${couple.hashtag}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'Wedding Invitation',
  keywords: ['wedding', 'invitation', couple.groom.fullName, couple.bride.fullName, 'Jaipur'],
  // This is what makes the link render as a rich card in WhatsApp & Instagram.
  openGraph: {
    type: 'website',
    url: siteUrl,
    title,
    description,
    siteName: `${couple.groom.firstName} & ${couple.bride.firstName}`,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    // A wedding invitation should not be in search results.
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
  // Never lock zoom — pinch-to-zoom is an accessibility requirement.
  maximumScale: 5,
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${cormorant.variable} ${playfair.variable} ${inter.variable} ${tiro.variable}`}
    >
      <body className="bg-midnight text-ivory antialiased">
        <a href="#rsvp" className="sr-only-focusable">
          Skip to RSVP
        </a>
        {children}
      </body>
    </html>
  )
}
