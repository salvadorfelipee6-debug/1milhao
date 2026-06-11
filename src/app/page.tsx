import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getActiveBlocksForGrid, getGridStats } from '@/lib/db/blocks'
import { HeroSection }       from '@/components/grid/HeroSection'
import { PixelGrid }         from '@/components/grid/PixelGrid'
import { HowItWorksSection }  from '@/components/grid/HowItWorksSection'
import { PricingSection }     from '@/components/grid/PricingSection'
import { RankingSection }     from '@/components/grid/RankingSection'
import { SocialProofSection } from '@/components/grid/SocialProofSection'
import { FAQSection }         from '@/components/grid/FAQSection'
import { FooterCTA }          from '@/components/grid/FooterCTA'
import { GridSkeleton }      from '@/components/grid/GridSkeleton'
import { TickerBanner }      from '@/components/ui/TickerBanner'

export const metadata: Metadata = {
  title: '1 Milhão de Influencer — O mapa permanente dos influencers do Brasil',
  description: '1.000.000 de pixels. Cada pixel, um influencer. Compre seu espaço e apareça para marcas e seguidores para sempre. A partir de R$ 99.',
}

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{ highlight?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params    = await searchParams
  const highlight = params.highlight || ''

  const [blocks, stats] = await Promise.all([
    getActiveBlocksForGrid(),
    getGridStats(),
  ])

  return (
    <main>
      {/* Faixa ticker */}
      <TickerBanner />

      {/* Hero com grid embutido */}
      <HeroSection stats={stats} blocks={blocks} highlight={highlight || undefined} />

      {/* Grid completo */}
      <section id="grade" className="px-4 pb-12 pt-4">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<GridSkeleton />}>
            <PixelGrid initialBlocks={blocks} stats={stats} highlight={highlight || undefined} />
          </Suspense>
        </div>
      </section>

      <HowItWorksSection />
      <PricingSection />
      <RankingSection />
      <SocialProofSection />
      <FAQSection />
      <FooterCTA />
    </main>
  )
}