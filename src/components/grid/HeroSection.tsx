'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { GridStats } from '@/types'
import { LiveVisitors } from '@/components/ui/LiveVisitors'

// Canvas com pixels flutuantes no background
function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      canvas!.width  = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = ['#FFD700', '#E1306C', '#405DE6', '#833AB4', '#1ed760', '#00B4D8']
    const pixels = Array.from({ length: 40 }, () => ({
      x:     Math.random() * canvas!.width,
      y:     Math.random() * canvas!.height,
      size:  4 + Math.random() * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] as string,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    (Math.random() - 0.5) * 0.3,
      alpha: 0.03 + Math.random() * 0.08,
    }))

    let frame: number
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of pixels) {
        p.x += p.vx; p.y += p.vy
        if (p.x < -p.size) p.x = canvas!.width + p.size
        if (p.x > canvas!.width + p.size) p.x = -p.size
        if (p.y < -p.size) p.y = canvas!.height + p.size
        if (p.y > canvas!.height + p.size) p.y = -p.size
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = p.alpha
        ctx!.fillRect(p.x, p.y, p.size, p.size)
      }
      ctx!.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}

interface HeroSectionProps { stats: GridStats }

export function HeroSection({ stats }: HeroSectionProps) {
  const pct   = Math.round((stats.sold / 1_000_000) * 100)
  const avail = (1_000_000 - stats.sold).toLocaleString('pt-BR')

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-dark">

      {/* Canvas de pixels animados */}
      <PixelBackground />

      {/* Gradientes de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gold/6 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-pink/5 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[500px] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-28 text-center">

        {/* Badges ao vivo */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="badge-gold inline-flex items-center">
            <span className="animate-pulse-dot mr-2 h-1.5 w-1.5 rounded-full bg-gold" />
            {avail} pixels disponíveis · ao vivo
          </div>
          <LiveVisitors />
        </div>

        {/* Título */}
        <h1 className="mb-6 font-display leading-none tracking-wide">
          <span className="block text-[clamp(32px,8vw,80px)] text-white/90">
            O MAPA DE
          </span>
          <span
            className="animate-float block text-[clamp(64px,16vw,160px)]"
            style={{
              color: '#FFD700',
              textShadow: '0 0 80px rgba(255,215,0,0.4), 0 0 160px rgba(255,215,0,0.15)',
            }}
          >
            1
          </span>
          <span className="block text-[clamp(28px,7vw,72px)] text-white/90">
            MILHÃO DE
          </span>
          <span
            className="block text-[clamp(24px,5vw,56px)] tracking-[0.15em]"
            style={{
              background: 'linear-gradient(135deg, #E1306C, #833AB4, #405DE6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            INFLUENCERS
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/40 md:text-lg">
          <span className="font-semibold text-white/70">1.000.000 de pixels.</span>{' '}
          Cada pixel, um influencer. Compre seu espaço uma vez e apareça para marcas e seguidores{' '}
          <span className="font-semibold text-white/70">para sempre.</span>
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
            { n: '1.000.000',                        l: 'pixels totais' },
            { n: stats.sold.toLocaleString('pt-BR'), l: 'já vendidos' },
            { n: stats.active.toString(),            l: 'influencers' },
            { n: 'R$ 0,10',                          l: 'por pixel' },
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
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width:      `${Math.max(pct, 0.5)}%`,
                background: 'linear-gradient(90deg, #FFD700, #E1306C)',
              }}
            />
          </div>
        </div>

      </div>
    </section>
  )
}