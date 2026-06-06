import Link from 'next/link'
import type { GridStats } from '@/types'
import { LiveVisitors } from '@/components/ui/LiveVisitors'

export function HeroSection({ stats }: { stats: GridStats }) {
  const pct   = Math.round((stats.sold / 1_000_000) * 100)
  const avail = (1_000_000 - stats.sold).toLocaleString('pt-BR')

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-pixel-grid bg-dark">

      {/* Gradientes de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-pink/4 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-insta/4 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-28 text-center">

        {/* Badge ao vivo com visitantes */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="badge-gold inline-flex">
            <span className="animate-pulse-dot mr-2 h-1.5 w-1.5 rounded-full bg-gold" />
            {avail} pixels disponíveis · ao vivo
          </div>
          <LiveVisitors />
        </div>

        {/* Título principal */}
        <h1 className="mb-6 font-display leading-none tracking-wide">
          <span className="block text-[clamp(32px,8vw,80px)] text-white/90">
            O MAPA DE
          </span>
          <span className="animate-float block text-[clamp(64px,16vw,160px)] text-gold">
            1
          </span>
          <span className="block text-[clamp(28px,7vw,72px)] text-white/90">
            MILHÃO DE
          </span>
          <span className="text-insta block text-[clamp(24px,5vw,56px)] tracking-[0.15em]">
            INFLUENCERS
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/40 md:text-lg">
          <span className="text-white/70 font-semibold">1.000.000 de pixels.</span>{' '}
          Cada pixel, um influencer. Compre seu espaço uma vez e apareça para marcas e seguidores{' '}
          <span className="text-white/70 font-semibold">para sempre.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/comprar" className="btn-gold px-8 py-4 text-base">
            Garantir meu espaço — R$ 10
          </Link>
          <a href="#grade" className="btn-ghost px-8 py-4 text-base">
            Ver o mapa ao vivo ↓
          </a>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 flex max-w-lg flex-wrap justify-center gap-8 border-t border-white/6 pt-10">
          {[
            { n: '1.000.000',                         l: 'pixels totais' },
            { n: stats.sold.toLocaleString('pt-BR'),  l: 'já vendidos' },
            { n: stats.active.toString(),             l: 'influencers' },
            { n: 'R$ 0,10',                           l: 'por pixel' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="stat-number">{s.n}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-white/25">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Barra de progresso */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="mb-2 flex justify-between text-xs text-white/25">
            <span>{pct}% vendido</span>
            <span>{avail} restantes</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full"
              style={{
                width:      `${pct}%`,
                background: 'linear-gradient(90deg, #FFD700, #E1306C)',
                transition: 'width 1s ease',
              }}
            />
          </div>
        </div>

      </div>
    </section>
  )
}