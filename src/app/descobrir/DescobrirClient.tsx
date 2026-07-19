'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { BlockForGrid } from '@/lib/db/blocks'
import { NICHE_LABELS, NICHE_EMOJI, NICHE_COLORS } from '@/types'
import { SOCIAL_CONFIG } from '@/lib/socialConfig'

// ─── Roleta demo: mapa vazio ─────────────────────────────────
// Gira "vagas abertas" por nicho (sem gente fake) — a página nasce viva
// e cada carta vendida é uma vaga real do mapa.
const DEMO_SLOTS = (Object.keys(NICHE_LABELS) as (keyof typeof NICHE_LABELS)[]).map(n => ({
  niche: n,
  label: NICHE_LABELS[n],
  emoji: NICHE_EMOJI[n],
  color: NICHE_COLORS[n],
}))

function DemoRoleta() {
  const [idx, setIdx]           = useState(0)
  const [spinning, setSpinning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const busyRef    = useRef(false)

  function spin() {
    if (busyRef.current) return
    busyRef.current = true
    setSpinning(true)
    const steps = 8 + Math.floor(Math.random() * 4)
    let i = 0
    const tick = (delay: number) => {
      timeoutRef.current = setTimeout(() => {
        setIdx(Math.floor(Math.random() * DEMO_SLOTS.length))
        i++
        if (i < steps) tick(delay * 1.22)
        else {
          setSpinning(false)
          busyRef.current = false
        }
      }, delay)
    }
    tick(65)
  }

  // Gira sozinha de tempos em tempos — a página nunca fica parada
  useEffect(() => {
    spin()
    const auto = setInterval(spin, 5000)
    return () => {
      clearInterval(auto)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slot = DEMO_SLOTS[idx] ?? DEMO_SLOTS[0]!

  return (
    <>
      <div
        className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-150"
        style={{
          background: '#111',
          transform:  spinning ? 'scale(0.97)' : 'scale(1)',
          filter:     spinning ? 'blur(1.5px) saturate(1.4)' : 'none',
        }}
        aria-live="polite"
      >
        <div
          className="relative h-28"
          style={{ background: `linear-gradient(135deg, ${slot.color}66, ${slot.color}18)` }}
        >
          <div
            className="absolute -bottom-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full text-3xl"
            style={{ background: slot.color + '33', border: `4px solid #111`, boxShadow: `0 0 30px ${slot.color}55` }}
          >
            {slot.emoji}
          </div>
        </div>

        <div className="px-6 pb-6 pt-14 text-center">
          <p className="text-lg font-bold text-white">@seuarroba</p>
          <p className="mt-0.5 text-xs text-white/60">
            {slot.emoji} {slot.label} · <span style={{ color: slot.color }}>vaga aberta</span>
          </p>

          <p className="mt-3 inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-gold">
            seus futuros seguidores
          </p>

          <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-white/70">
            Esta vaga de {slot.label} ainda não tem dono. Quem entrar primeiro
            aparece em todos os giros — sem dividir a atenção com ninguém.
          </p>

          <Link
            href="/comprar"
            className="btn-gold mt-5 flex w-full items-center justify-center py-3.5 text-sm"
          >
            Garantir esta vaga — R$ 0,99 →
          </Link>
          <Link
            href="/"
            className="mt-2 block w-full rounded-2xl border border-white/10 py-3 text-xs font-semibold text-white/60 transition-all hover:border-white/20 hover:text-white/80"
          >
            Ver o mapa →
          </Link>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="btn-gold mt-5 w-full py-4 text-base disabled:opacity-60"
      >
        {spinning ? 'Girando…' : '🎰 Girar de novo'}
      </button>
      <p className="mt-3 text-center text-[11px] text-white/55">
        O mapa acabou de abrir — a roleta está girando as primeiras vagas.
      </p>
    </>
  )
}

interface DescobrirClientProps {
  blocks:           BlockForGrid[]
  totalInfluencers: number
}

export function DescobrirClient({ blocks, totalInfluencers }: DescobrirClientProps) {
  const [niche, setNiche]       = useState<string>('')
  const [current, setCurrent]   = useState<BlockForGrid | null>(blocks[0] ?? null)
  const [spinning, setSpinning] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queueRef   = useRef<number[]>([])
  const posRef     = useRef(0)
  const viewedRef  = useRef<Set<string>>(new Set())
  const spinRef    = useRef<() => void>(() => {})

  const pool = useMemo(
    () => (niche ? blocks.filter(b => b.niche === niche) : blocks),
    [blocks, niche],
  )

  // Nichos presentes no mapa, com contagem — só mostra chip de nicho que existe
  const nichesPresent = useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of blocks) counts.set(b.niche, (counts.get(b.niche) ?? 0) + 1)
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [blocks])

  function shuffleQueue() {
    const q = pool.map((_, i) => i)
    for (let i = q.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = q[i]!
      q[i] = q[j]!
      q[j] = t
    }
    queueRef.current = q
    posRef.current   = 0
  }

  function pickNext(): BlockForGrid | null {
    if (pool.length === 0) return null
    if (posRef.current >= queueRef.current.length) shuffleQueue()
    const idx = queueRef.current[posRef.current++] ?? 0
    return pool[idx] ?? null
  }

  function trackView(b: BlockForGrid) {
    if (viewedRef.current.has(b.id)) return
    viewedRef.current.add(b.id)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: b.id, eventType: 'view' }),
    }).catch(() => {})
  }

  function track(b: BlockForGrid, eventType: string) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: b.id, eventType }),
    }).catch(() => {})
  }

  function spin() {
    if (pool.length === 0 || spinning) return
    setSpinning(true)
    const steps = 8 + Math.floor(Math.random() * 5)
    let i = 0
    const tick = (delay: number) => {
      timeoutRef.current = setTimeout(() => {
        i++
        if (i < steps) {
          // Flashes rápidos de perfis aleatórios enquanto a roleta gira
          setCurrent(pool[Math.floor(Math.random() * pool.length)] ?? null)
          tick(delay * 1.22)
        } else {
          const next = pickNext()
          setCurrent(next)
          setSpinning(false)
          if (next) trackView(next)
        }
      }, delay)
    }
    tick(65)
  }
  spinRef.current = spin

  // Refaz a fila quando muda o filtro de nicho; gira uma vez ao carregar
  useEffect(() => {
    shuffleQueue()
    if (pool.length > 0) spinRef.current()
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool])

  // Espaço ou seta direita giram de novo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'ArrowRight') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return
        e.preventDefault()
        spinRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const igUrl = current ? `https://instagram.com/${current.instagramHandle}` : '#'
  const nicheLabel = current
    ? (NICHE_LABELS[current.niche as keyof typeof NICHE_LABELS] ?? current.niche)
    : ''
  const initials = current
    ? (current.displayName || current.instagramHandle).slice(0, 2).toUpperCase()
    : ''

  const activeSocials = current
    ? SOCIAL_CONFIG.filter(
        s => s.key === 'instagramUrl' || !!(current as Record<string, unknown>)[s.key],
      ).map(s => ({
        ...s,
        href: s.key === 'instagramUrl'
          ? igUrl
          : (current as Record<string, unknown>)[s.key] as string,
      }))
    : []

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark px-4 pb-16 pt-24 lg:pt-16">

      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[400px] rounded-full bg-pink/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 hidden text-xs text-white/55 transition-colors hover:text-white/80 lg:inline-block">
            ← Voltar pro mapa
          </Link>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-pink">
            🎰 Roleta de influencers
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            DESCUBRA SEU PRÓXIMO<br />
            <span className="text-gold">INFLUENCER FAVORITO</span>
          </h1>
          <p className="mt-4 text-sm text-white/65">
            Um perfil novo a cada giro. Siga com 1 toque
            {totalInfluencers > 0 && (
              <> · {totalInfluencers.toLocaleString('pt-BR')} no mapa</>
            )}
            .
          </p>
        </div>

        {/* Filtro por nicho */}
        {nichesPresent.length > 1 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setNiche('')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                niche === ''
                  ? 'bg-gold text-black'
                  : 'border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
              }`}
            >
              Todos
            </button>
            {nichesPresent.map(([n, count]) => (
              <button
                key={n}
                onClick={() => setNiche(n)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  niche === n
                    ? 'bg-gold text-black'
                    : 'border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                }`}
              >
                {NICHE_EMOJI[n as keyof typeof NICHE_EMOJI] ?? ''}{' '}
                {NICHE_LABELS[n as keyof typeof NICHE_LABELS] ?? n} ({count})
              </button>
            ))}
          </div>
        )}

        {/* Card do perfil sorteado — ou roleta demo de vagas se o mapa está vazio */}
        {blocks.length === 0 ? (
          <DemoRoleta />
        ) : current ? (
          <div
            className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-150"
            style={{
              background: '#111',
              transform:  spinning ? 'scale(0.97)' : 'scale(1)',
              filter:     spinning ? 'blur(1.5px) saturate(1.4)' : 'none',
            }}
            aria-live="polite"
          >
            {/* Faixa com a cor do nicho + avatar */}
            <div
              className="relative h-28"
              style={{ background: `linear-gradient(135deg, ${current.colorHex}66, ${current.colorHex}18)` }}
            >
              <div
                className="absolute -bottom-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white"
                style={{ background: current.colorHex, border: '4px solid #111', boxShadow: `0 0 30px ${current.colorHex}55` }}
              >
                {current.avatarUrl
                  ? <img src={current.avatarUrl} alt="" className="h-full w-full object-cover" />
                  : initials}
              </div>
            </div>

            <div className="px-6 pb-6 pt-14 text-center">
              <p className="text-lg font-bold text-white">@{current.instagramHandle}</p>
              <p className="mt-0.5 text-xs text-white/60">
                {current.displayName && <span>{current.displayName} · </span>}
                {nicheLabel}
                {current.city ? ` · ${current.city}` : ''}
              </p>

              {current.followers && (
                <p className="mt-3 inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-gold">
                  {current.followers} seguidores
                </p>
              )}

              {current.bio && (
                <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-white/70">
                  "{current.bio}"
                </p>
              )}

              {/* Redes */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {activeSocials.map(s => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track(current, `social:${s.key}`)}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{ background: s.bg, color: s.fg, boxShadow: `0 0 12px ${s.glow}` }}
                    aria-label={s.label}
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* CTA seguir */}
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(current, 'social:instagramUrl')}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(45deg,#833AB4,#E1306C 60%,#F77737)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Seguir @{current.instagramHandle}
              </a>

              <Link
                href={`/influencer/${current.instagramHandle}`}
                className="mt-2 block w-full rounded-2xl border border-white/10 py-3 text-xs font-semibold text-white/60 transition-all hover:border-white/20 hover:text-white/80"
              >
                Ver página completa →
              </Link>
            </div>
          </div>
        ) : (
          /* Nicho filtrado sem ninguém ainda */
          <div className="rounded-3xl border border-gold/20 bg-gold/5 p-10 text-center">
            <p className="mb-2 text-4xl">🎰</p>
            <p className="font-display text-2xl tracking-wide text-white">
              NINGUÉM DESSE NICHO AINDA
            </p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-white/65">
              Seja o primeiro do seu nicho a aparecer na roleta — sem concorrência, todos os giros são seus.
            </p>
            <Link href="/comprar" className="btn-gold mt-6 inline-block px-8 py-3.5 text-sm">
              Garantir meu espaço — R$ 0,99 →
            </Link>
          </div>
        )}

        {/* Botão girar */}
        {pool.length > 0 && (
          <button
            onClick={spin}
            disabled={spinning}
            className="btn-gold mt-5 w-full py-4 text-base disabled:opacity-60"
          >
            {spinning ? 'Girando…' : '🎰 Girar de novo'}
          </button>
        )}
        {pool.length > 1 && (
          <p className="mt-2 hidden text-center text-[11px] text-white/45 lg:block">
            Dica: aperte <kbd className="rounded border border-white/15 px-1.5 py-0.5">espaço</kbd> para girar
          </p>
        )}

        {/* CTA de conversão — quem gira também quer aparecer */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-dark-2 p-6 text-center">
          <p className="text-sm font-bold text-white">
            Quer aparecer nessa roleta e <span className="text-gold">ganhar seguidores</span>?
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-white/65">
            Está começando? É assim que seus primeiros seguidores te encontram.
            Já é grande? Mais um canal girando a seu favor, com botão de seguir a 1 clique.
            Pagamento único a partir de R$ 0,99, apareça pra sempre.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/comprar" className="btn-gold px-7 py-3 text-sm">
              Entrar no mapa →
            </Link>
            <Link href="/" className="btn-ghost px-6 py-3 text-sm">
              Ver o mapa
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
