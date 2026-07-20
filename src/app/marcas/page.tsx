import type { Metadata } from 'next'
import { Suspense } from 'react'
import { searchBlocks, getGridStats } from '@/lib/db/blocks'
import { MarcasClient } from './MarcasClient'

export const metadata: Metadata = {
  title: 'Para Marcas — 1 Milhão de Influencer',
  description: 'Encontre o influencer ideal para sua campanha. Filtre por nicho, cidade, seguidores e tamanho de audiência.',
}

interface PageProps {
  searchParams: Promise<{
    niche?:      string
    keyword?:    string
    city?:       string
    minPixels?:  string
    ugc?:        string
  }>
}

export default async function MarcasPage({ searchParams }: PageProps) {
  const params     = await searchParams
  const niche      = params.niche      || ''
  const keyword    = params.keyword    || ''
  const city       = params.city       || ''
  const minPixels  = params.minPixels  ? Number(params.minPixels) : undefined
  const ugcOnly    = params.ugc === '1'

  const [blocks, stats] = await Promise.all([
    searchBlocks({
      niche:     niche     || undefined,
      keyword:   keyword   || undefined,
      city:      city      || undefined,
      minPixels: minPixels || undefined,
      ugcOnly,
      limit:     200,
    }),
    getGridStats(),
  ])

  return (
    <main className="min-h-screen bg-dark">

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gold/6 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="badge-gold mb-4 inline-flex">
            <span className="mr-2">🏢</span>
            Portal de Marcas
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white md:text-7xl">
            ENCONTRE O<br />
            <span className="text-gold">INFLUENCER</span><br />
            IDEAL
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/65">
            {stats.active.toLocaleString('pt-BR')} influencers cadastrados. Filtre por nicho, cidade e audiência. Entre em contato direto pelo WhatsApp ou Instagram.
          </p>

          {/* Stats rápidas */}
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-6 border-t border-white/6 pt-8">
            {[
              { n: stats.active.toLocaleString('pt-BR'), l: 'influencers' },
              { n: '12',                                  l: 'nichos' },
              { n: '100%',                                l: 'contato direto' },
              { n: 'grátis',                              l: 'para marcas' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="font-display text-2xl text-gold">{s.n}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/50">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Busca */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/5" />}>
            <MarcasClient
              blocks={blocks}
              initialNiche={niche}
              initialKeyword={keyword}
              initialCity={city}
              initialMinPixels={minPixels ?? 0}
              initialUgcOnly={ugcOnly}
            />
          </Suspense>
        </div>
      </section>

    </main>
  )
}
