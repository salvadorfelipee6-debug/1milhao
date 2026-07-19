'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { GridStats, GridBlock } from '@/types'
import { LiveVisitors } from '@/components/ui/LiveVisitors'
import { ActivityFeed } from '@/components/ui/ActivityFeed'
import { CountUp } from '@/components/ui/Reveal'
import { BrandShapes } from '@/components/ui/shape-landing-hero'
import { SocialLinks } from '@/components/ui/social-links'
import { SOCIAL_CONFIG } from '@/lib/socialConfig'

const HERO_SOCIAL_KEYS = ['instagramUrl', 'youtubeUrl', 'tiktokUrl', 'spotifyUrl'] as const
const HERO_SOCIALS = SOCIAL_CONFIG
  .filter(s => (HERO_SOCIAL_KEYS as readonly string[]).includes(s.key))
  .map(s => ({ name: s.label === 'X / Twitter' ? 'X' : s.label, bg: s.bg, fg: s.fg, icon: s.icon }))
import { NICHE_COLORS } from '@/types'

interface Activation {
  instagramHandle: string
  displayName:     string
  avatarUrl:       string | null
  colorHex:        string
  pixelCount:      number
  niche:            string
  createdAt:        string | Date
}

interface HeroSectionProps {
  stats:     GridStats
  blocks:    GridBlock[]
  highlight?: string
  activations?: Activation[]
}

// Mini canvas do grid no hero
function MiniGrid({ blocks }: { blocks: GridBlock[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef  = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      canvas!.width  = canvas!.offsetWidth  || 420
      canvas!.height = canvas!.offsetHeight || 480
      draw(0)
    }

    function draw(ts: number) {
      const W = canvas!.width, H = canvas!.height
      ctx!.fillStyle = '#0d0d0d'
      ctx!.fillRect(0, 0, W, H)

      // Grade sutil
      ctx!.strokeStyle = 'rgba(255,255,255,0.025)'
      ctx!.lineWidth   = 0.5
      const cs = W / 300  // mostra 300 pixels de largura
      for (let x = 0; x < W; x += cs * 10) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke()
      }
      for (let y = 0; y < H; y += cs * 10) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke()
      }

      // Blocos reais
      for (const b of blocks.slice(0, 30)) {
        const bx = b.pixelX * cs, by = b.pixelY * cs
        const bw = b.pixelWidth * cs, bh = b.pixelHeight * cs
        if (bx > W || by > H) continue
        const color = b.colorHex || '#E1306C'

        ctx!.shadowColor = color + '55'
        ctx!.shadowBlur  = 6
        ctx!.fillStyle   = color + '44'
        ctx!.fillRect(bx, by, bw, bh)
        ctx!.shadowBlur  = 0
        ctx!.strokeStyle = color + 'cc'
        ctx!.lineWidth   = 1
        ctx!.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1)

        if (bw > 16 && bh > 16) {
          const initials = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
          const r = Math.min(bw, bh) * 0.22
          ctx!.beginPath(); ctx!.arc(bx + bw/2, by + bh/2, r, 0, Math.PI * 2)
          ctx!.fillStyle = color + 'cc'; ctx!.fill()
          ctx!.fillStyle = 'rgba(0,0,0,0.85)'
          ctx!.font = `bold ${Math.max(6, r * 0.85)}px Inter,sans-serif`
          ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle'
          ctx!.fillText(initials, bx + bw/2, by + bh/2)
        }
      }

      // Seleção animada pulsante
      const pulse = Math.sin(ts / 400) * 0.3 + 0.7
      const sx = 140 * cs, sy = 80 * cs, sw = 60 * cs, sh = 60 * cs
      ctx!.strokeStyle = `rgba(255,215,0,${pulse})`
      ctx!.lineWidth   = 1.5
      ctx!.setLineDash([5, 4])
      ctx!.strokeRect(sx, sy, sw, sh)
      ctx!.setLineDash([])
      ctx!.fillStyle = `rgba(255,215,0,${0.06 * pulse})`
      ctx!.fillRect(sx, sy, sw, sh)

      // Cantos em L
      const cornerSize = 8
      ctx!.strokeStyle = `rgba(255,215,0,${pulse})`
      ctx!.lineWidth   = 2
      for (const [cx, cy, dx, dy] of [
        [sx, sy, 1, 1], [sx+sw, sy, -1, 1],
        [sx, sy+sh, 1, -1], [sx+sw, sy+sh, -1, -1],
      ] as [number,number,number,number][]) {
        ctx!.beginPath()
        ctx!.moveTo(cx + dx * cornerSize, cy)
        ctx!.lineTo(cx, cy)
        ctx!.lineTo(cx, cy + dy * cornerSize)
        ctx!.stroke()
      }

      ctx!.globalAlpha = 1
      frameRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [blocks])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  )
}

export function HeroSection({ stats, blocks, highlight, activations = [] }: HeroSectionProps) {
  const pct   = Math.round((stats.sold / 1_000_000) * 100)
  const avail = (1_000_000 - stats.sold).toLocaleString('pt-BR')

  // Auto-scroll para o grid após 6 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      const grade = document.getElementById('grade')
      if (grade) grade.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative overflow-hidden bg-dark">

      {/* Glow de fundo + pixels flutuando */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[400px] rounded-full bg-pink/4 blur-[80px]" />
        {[
          { top: '18%', left: '6%',  size: 10, color: '#FFD700', dur: '9s',  delay: '0s' },
          { top: '64%', left: '3%',  size: 7,  color: '#E1306C', dur: '11s', delay: '1.2s' },
          { top: '30%', left: '44%', size: 8,  color: '#833AB4', dur: '10s', delay: '0.6s' },
          { top: '78%', left: '38%', size: 6,  color: '#FFD700', dur: '12s', delay: '2s' },
          { top: '10%', left: '30%', size: 5,  color: '#405DE6', dur: '9.5s', delay: '1.6s' },
          { top: '50%', left: '48%', size: 6,  color: '#1ed760', dur: '13s', delay: '0.3s' },
        ].map((p, i) => (
          <span
            key={i}
            className="pixel-drift"
            style={{
              top: p.top, left: p.left,
              width: p.size, height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}88`,
              ['--drift-dur' as string]: p.dur,
              ['--drift-delay' as string]: p.delay,
            }}
          />
        ))}
      </div>

      {/* Formas de vidro flutuantes nas cores da marca */}
      <BrandShapes />

      {/* Layout duas colunas */}
      <div className="relative z-10 grid min-h-[calc(100vh-28px)] grid-cols-1 lg:grid-cols-2">

        {/* ── Coluna esquerda: copy ── */}
        <div className="flex flex-col justify-center px-6 py-16 pt-20 lg:px-12 lg:py-16 lg:pt-16">

          {/* Badges */}
          <div className="mb-6 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] text-red-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              {avail} pixels restantes
            </div>
            <LiveVisitors />
            <ActivityFeed activations={activations} />
          </div>

          {/* Título */}
          <h1 className="mb-4 font-display leading-none tracking-wide">
            <span className="block text-[clamp(28px,5vw,52px)] text-white/90">O MAPA PERMANENTE</span>
            <span className="block text-[clamp(28px,5vw,52px)] text-white/90">DOS</span>
            <span
              className="animate-title-glow block text-[clamp(36px,7vw,72px)]"
              style={{ color: '#FFD700' }}
            >
              INFLUENCERS
            </span>
            <span
              className="block text-[clamp(24px,4vw,48px)]"
              style={{ background: 'linear-gradient(135deg,#E1306C,#833AB4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              DO BRASIL
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="mb-6 max-w-md text-sm leading-relaxed text-white/75 lg:text-base">
            <strong className="text-gold">Do primeiro seguidor ao próximo milhão.</strong>{' '}
            Está começando? Quem explora o mapa e gira a roleta descobre você — e segue com 1 clique.
            Já é grande? Bloco gigante, topo do ranking e propostas de marcas.{' '}
            <strong className="text-white/85">R$ 0,99 por pixel, uma única vez, seu pra sempre.</strong>
          </p>

          {/* CTAs */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Link href="/comprar" className="btn-gold px-7 py-3.5 text-sm">
              Garantir meu espaço — a partir de R$ 0,99 →
            </Link>
            <Link href="/descobrir" className="btn-ghost px-6 py-3.5 text-sm">
              🎰 Descobrir influencers
            </Link>
          </div>

          <p className="-mt-4 mb-5 text-xs text-white/55">
            É uma marca procurando influencers?{' '}
            <Link href="/marcas" className="text-white/75 underline underline-offset-2 transition-colors hover:text-white">
              Acesse o portal de marcas →
            </Link>
          </p>

          {/* Redes num link só — demo viva do link na bio */}
          <Link href="/vitrine" className="group mb-6 block" aria-label="Conheça o link na bio Vitrine 1M">
            <p className="mb-0 text-[10px] font-semibold uppercase tracking-widest text-white/55 transition-colors group-hover:text-gold">
              Todas as suas redes num link só — incluso no seu espaço ↗
            </p>
            <SocialLinks socials={HERO_SOCIALS} autoCycleMs={2200} className="-ml-4 justify-start" />
          </Link>

          {/* Stats — contraste aumentado */}
          <div className="flex gap-0 border-t border-white/15 pt-6">
            {[
              { n: <CountUp value={stats.sold} />,   l: 'pixels vendidos' },
              { n: <CountUp value={stats.active} />, l: 'influencers' },
              { n: 'R$0,99',                         l: 'por pixel' },
              { n: '∞',                              l: 'vitalício' },
            ].map((s, i) => (
              <div key={s.l} className={`flex-1 text-center ${i > 0 ? 'border-l border-white/15' : ''}`}>
                <p className="font-display text-xl text-gold">{s.n}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/65">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Barra de progresso — mais visível */}
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-white/70">
              <span>{pct}% do mapa ocupado</span>
              <span>{avail} disponíveis</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(pct, 0.5)}%`, background: 'linear-gradient(90deg,#FFD700,#E1306C)' }}
              />
            </div>
          </div>
        </div>

        {/* ── Coluna direita: mini grid clicável → vai para #grade ── */}
        <a
          href="#grade"
          className="relative hidden border-l border-white/5 lg:block cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('grade')?.scrollIntoView({ behavior: 'smooth' })
          }}
          aria-label="Ver o mapa completo e selecionar sua área"
        >
          <MiniGrid blocks={blocks} />

          {/* Overlay clicável com instrução */}
          <div className="absolute inset-0 bg-transparent transition-all hover:bg-white/2" />

          {/* Overlay esquerdo */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-dark to-transparent" />

          {/* Badge ao vivo */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-green-500/20 bg-black/70 px-3 py-1.5 text-[11px] text-green-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            Ao vivo agora
          </div>

          {/* CTA sobre o grid */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-gold/30 bg-black/85 px-5 py-2.5 text-center backdrop-blur-sm">
            <p className="text-sm font-bold text-gold">Clique para selecionar sua área →</p>
            <p className="text-[10px] text-white/65 mt-0.5">Arraste no mapa e garanta seu espaço</p>
          </div>
        </a>

      </div>

      {/* Header da seção do mapa — já visível */}
      <div id="grade" className="relative z-10 border-t border-white/10 px-6 py-5 lg:px-12">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="badge-gold inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              Ao vivo agora
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">O MAPA EM TEMPO REAL</h2>
              <p className="text-xs text-white/70">Passe o mouse em qualquer bloco · Clique para ver o perfil completo</p>
            </div>
          </div>
          <Link href="/comprar" className="hidden btn-gold px-5 py-2.5 text-sm sm:inline-flex">
            Garantir espaço →
          </Link>
        </div>
      </div>
    </section>
  )
}