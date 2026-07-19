import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'Amanah Berkah Haromain — Travel Umroh & Haji Terpercaya',
  description:
    'Wujudkan niat suci Anda bersama Amanah Berkah Haromain (ABH). Travel Umroh berizin resmi PPIU & PIHK dari Kemenag RI, memberikan pelayanan terbaik dan amanah.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1a56db',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
