import type { Metadata } from 'next'
import { Suspense } from 'react'
import { searchBlocks, getGridStats } from '@/lib/db/blocks'
import { NICHE_LABELS } from '@/types'
import Link from 'next/link'
import { RankingClient } from './RankingClient'

export const metadata: Metadata = {
  title: 'Ranking — 1 Milhão de Influencer',
  description: 'Encontre os maiores influencers do mapa. Filtre por nicho, cidade e tamanho.',
}

interface PageProps {
  searchParams: Promise<{ niche?: string; keyword?: string; city?: string }>
}

export default async function RankingPage({ searchParams }: PageProps) {
  const params  = await searchParams
  const niche   = params.niche   || ''
  const keyword = params.keyword || ''
  const city    = params.city    || ''

  const [blocks, stats] = await Promise.all([
    searchBlocks({ niche: niche || undefined, keyword: keyword || undefined, city: city || undefined, limit: 100 }),
    getGridStats(),
  ])

  return (
    <main className="min-h-screen bg-dark px-4 py-16">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
            Mapa ao vivo
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white md:text-7xl">
            RANKING DE<br />
            <span className="text-gold">INFLUENCERS</span>
          </h1>
          <p className="mt-4 text-sm text-white/65">
            {stats.active.toLocaleString('pt-BR')} influencers · {stats.sold.toLocaleString('pt-BR')} pixels vendidos
          </p>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/5" />}>
          <RankingClient blocks={blocks} initialNiche={niche} initialKeyword={keyword} initialCity={city} />
        </Suspense>

      </div>
    </main>
  )
}
