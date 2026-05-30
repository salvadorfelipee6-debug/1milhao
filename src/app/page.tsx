import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getActiveBlocksForGrid, getGridStats } from '@/lib/db/blocks'
import { HeroSection }       from '@/components/grid/HeroSection'
import { PixelGrid }         from '@/components/grid/PixelGrid'
import { HowItWorksSection } from '@/components/grid/HowItWorksSection'
import { PricingSection }    from '@/components/grid/PricingSection'
import { RankingSection }    from '@/components/grid/RankingSection'
import { FooterCTA }         from '@/components/grid/FooterCTA'
import { GridSkeleton }      from '@/components/grid/GridSkeleton'

export const metadata: Metadata = {
  title: '1 Milhão de Influencer — O mapa permanente dos influencers do Brasil',
  description:
    '1.000.000 de pixels. Cada pixel, um influencer. Compre seu espaço e apareça para marcas e seguidores para sempre. A partir de R$ 10.',
}

// Revalida a página a cada 60 segundos (ISR)
export const revalidate = 60

export default async function HomePage() {
  // Busca em paralelo no servidor
  const [blocks, stats] = await Promise.all([
    getActiveBlocksForGrid(),
    getGridStats(),
  ])

  return (
    <main>
      {/* Hero com contador ao vivo */}
      <HeroSection stats={stats} />

      {/* Grade de pixels — o coração do produto */}
      <section id="grade" className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="badge-gold mb-3 inline-flex">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
              Ao vivo agora
            </p>
            <h2 className="font-display text-4xl tracking-wide text-white md:text-6xl">
              O MAPA EM TEMPO REAL
            </h2>
            <p className="mt-3 text-sm text-white/40">
              Passe o mouse em qualquer bloco · Clique para ver o perfil completo
            </p>
          </div>

          {/* Suspense boundary — mostra skeleton enquanto carrega no cliente */}
          <Suspense fallback={<GridSkeleton />}>
            <PixelGrid
              initialBlocks={blocks}
              stats={stats}
            />
          </Suspense>
        </div>
      </section>

      <HowItWorksSection />
      <PricingSection />
      <RankingSection />
      <FooterCTA />
    </main>
  )
}
