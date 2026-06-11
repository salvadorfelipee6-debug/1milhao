import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { MobileNav } from '@/components/ui/MobileNav'

const bebasNeue = Bebas_Neue({
  weight:   '400',
  subsets:  ['latin'],
  variable: '--font-bebas',
  display:  'swap',
})

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    template: '%s | 1 Milhão de Influencer',
    default:  '1 Milhão de Influencer — O mapa permanente dos influencers do Brasil',
  },
  description: '1.000.000 de pixels. Cada pixel, um influencer.',
}

export const viewport: Viewport = {
  themeColor:   '#FFD700',
  colorScheme:  'dark',
  width:        'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${bebasNeue.variable} ${inter.variable}`}>
        <body className="bg-dark text-white antialiased">
          <MobileNav />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}