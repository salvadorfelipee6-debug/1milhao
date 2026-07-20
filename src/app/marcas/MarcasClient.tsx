'use client'

import { useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { NICHE_LABELS } from '@/types'
import type { schema } from '@/lib/db'
import { SendBriefingButton } from '@/components/proposals/SendBriefingButton'

type Block = schema.Block

const NICHE_COLORS: Record<string, string> = {
  fitness:     '#FF6B35',
  moda:        '#E1306C',
  tecnologia:  '#405DE6',
  gastronomia: '#FCAF45',
  beleza:      '#C13584',
  viagens:     '#00B4D8',
  games:       '#7B2FBE',
  financas:    '#2EC4B6',
  familia:     '#F5A623',
  humor:       '#F8E71C',
  educacao:    '#7ED321',
  outros:      '#888888',
}

const NICHES = [
  { key: '',            label: 'Todos' },
  { key: 'fitness',     label: 'Fitness' },
  { key: 'moda',        label: 'Moda' },
  { key: 'tecnologia',  label: 'Tecnologia' },
  { key: 'gastronomia', label: 'Gastronomia' },
  { key: 'beleza',      label: 'Beleza' },
  { key: 'viagens',     label: 'Viagens' },
  { key: 'games',       label: 'Games' },
  { key: 'financas',    label: 'Finanças' },
  { key: 'familia',     label: 'Família' },
  { key: 'humor',       label: 'Humor' },
  { key: 'educacao',    label: 'Educação' },
  { key: 'outros',      label: 'Outros' },
]

const SIZE_FILTERS = [
  { label: 'Qualquer tamanho', min: 0 },
  { label: 'Micro (100+)',     min: 100 },
  { label: 'Pequeno (400+)',   min: 400 },
  { label: 'Médio (900+)',     min: 900 },
  { label: 'Grande (2.500+)',  min: 2500 },
  { label: 'Premium (10k+)',   min: 10000 },
]

interface Props {
  blocks:            Block[]
  initialNiche:      string
  initialKeyword:    string
  initialCity:       string
  initialMinPixels:  number
  initialUgcOnly:    boolean
}

export function MarcasClient({ blocks, initialNiche, initialKeyword, initialCity, initialMinPixels, initialUgcOnly }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const [niche,     setNiche]     = useState(initialNiche)
  const [keyword,   setKeyword]   = useState(initialKeyword)
  const [city,      setCity]      = useState(initialCity)
  const [minPixels, setMinPixels] = useState(initialMinPixels)
  const [ugcOnly,   setUgcOnly]   = useState(initialUgcOnly)
  const [expanded,  setExpanded]  = useState<string | null>(null)

  function applyFilters(n: string, k: string, c: string, mp: number, ugc: boolean) {
    const params = new URLSearchParams()
    if (n)   params.set('niche',     n)
    if (k)   params.set('keyword',   k)
    if (c)   params.set('city',      c)
    if (mp)  params.set('minPixels', mp.toString())
    if (ugc) params.set('ugc',       '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleNiche(n: string) {
    setNiche(n)
    applyFilters(n, keyword, city, minPixels, ugcOnly)
  }

  function handleSize(mp: number) {
    setMinPixels(mp)
    applyFilters(niche, keyword, city, mp, ugcOnly)
  }

  function handleUgcToggle() {
    const next = !ugcOnly
    setUgcOnly(next)
    applyFilters(niche, keyword, city, minPixels, next)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters(niche, keyword, city, minPixels, ugcOnly)
  }

  function clearAll() {
    setNiche(''); setKeyword(''); setCity(''); setMinPixels(0); setUgcOnly(false)
    applyFilters('', '', '', 0, false)
  }

  const filtered = useMemo(() => {
    return blocks.filter(b => {
      const matchNiche     = !niche     || b.niche === niche
      const matchKeyword   = !keyword   || b.instagramHandle.includes(keyword.toLowerCase()) || (b.displayName?.toLowerCase().includes(keyword.toLowerCase()) ?? false) || (b.bio?.toLowerCase().includes(keyword.toLowerCase()) ?? false)
      const matchCity      = !city      || (b.city?.toLowerCase().includes(city.toLowerCase()) ?? false)
      const matchMinPixels = !minPixels || b.pixelCount >= minPixels
      const matchUgc       = !ugcOnly   || !!(b as any).isUgcCreator
      return matchNiche && matchKeyword && matchCity && matchMinPixels && matchUgc
    })
  }, [blocks, niche, keyword, city, minPixels, ugcOnly])

  const hasFilters = !!(niche || keyword || city || minPixels || ugcOnly)

  return (
    <div className="space-y-6">

      {/* Painel de filtros */}
      <div className="rounded-2xl border border-white/8 bg-dark-2 p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/55">
          Filtre o influencer ideal
        </p>

        {/* Busca + cidade */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 flex overflow-hidden rounded-xl border border-white/10 focus-within:border-white/20">
            <span className="flex items-center pl-3 text-white/55">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Busque por @, nome, palavra-chave na bio..."
              className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/40 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Cidade..."
              className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/20"
            />
            <button type="submit" className="btn-gold px-4 text-sm shrink-0">
              Buscar
            </button>
          </div>
        </form>

        {/* Nicho */}
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-white/50">Nicho</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map(n => (
              <button
                key={n.key}
                onClick={() => handleNiche(n.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  niche === n.key
                    ? 'text-dark'
                    : 'border border-white/10 text-white/65 hover:border-white/20 hover:text-white/70'
                }`}
                style={niche === n.key ? { background: n.key ? NICHE_COLORS[n.key] : '#FFD700' } : {}}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tamanho */}
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-white/50">Tamanho do bloco</p>
          <div className="flex flex-wrap gap-2">
            {SIZE_FILTERS.map(s => (
              <button
                key={s.min}
                onClick={() => handleSize(s.min)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  minPixels === s.min
                    ? 'bg-gold text-dark'
                    : 'border border-white/10 text-white/65 hover:border-white/20 hover:text-white/70'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Criadores UGC */}
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-white/50">Tipo de criador</p>
          <button
            onClick={handleUgcToggle}
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              ugcOnly
                ? 'border border-violet-400/40 bg-violet-500/15 text-violet-300'
                : 'border border-white/10 text-white/65 hover:border-white/20 hover:text-white/70'
            }`}
          >
            🎬 Só criadores UGC
          </button>
          <p className="mt-1.5 text-[10px] text-white/45">
            Criador que faz vídeo pra você usar na sua própria página — não precisa ter seguidores.
          </p>
        </div>

        {/* Limpar */}
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-white/55 hover:text-white/60">
            ✕ Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Resultado */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          {filtered.length} influencer{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-white/55">
          Clique para ver o perfil completo e entrar em contato
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-dark-2 py-16 text-center">
          <p className="text-3xl">🔍</p>
          <p className="mt-3 text-sm text-white/70">Nenhum influencer encontrado com esses filtros</p>
          <button onClick={clearAll} className="mt-3 text-xs text-gold hover:underline">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(b => {
            const initials   = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
            const color      = b.colorHex || '#E1306C'
            const nicheLabel = NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche
            const igUrl      = `https://instagram.com/${b.instagramHandle}`
            const whatsappUrl = (b as any).whatsappUrl
              ? `https://wa.me/${((b as any).whatsappUrl).replace(/\D/g, '')}`
              : null
            const isOpen = expanded === b.id

            return (
              <div
                key={b.id}
                className="rounded-2xl border border-white/5 bg-dark-2 overflow-hidden transition-all hover:border-white/10"
              >
                {/* Header colorido */}
                <div
                  className="h-16 relative flex items-end px-4 pb-0"
                  style={{ background: `linear-gradient(135deg, ${color}44, ${color}22)` }}
                >
                  <div
                    className="absolute -bottom-5 left-4 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white border-2 border-dark-2"
                    style={{ background: color }}
                  >
                    {b.avatarUrl
                      ? <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                      : initials}
                  </div>
                </div>

                <div className="p-4 pt-7">
                  {/* Nome + nicho */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">@{b.instagramHandle}</p>
                      {b.displayName && (
                        <p className="truncate text-[11px] text-white/65">{b.displayName}</p>
                      )}
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: color + '22', color }}
                    >
                      {nicheLabel}
                    </span>
                  </div>

                  {(b as any).isUgcCreator && (
                    <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-300">
                      🎬 Criador UGC
                    </span>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {b.followers && (
                      <div className="rounded-lg bg-white/4 px-1 py-1.5 text-center">
                        <p className="text-xs font-bold text-gold">{b.followers}</p>
                        <p className="text-[9px] text-white/55">seguidores</p>
                      </div>
                    )}
                    <div className="rounded-lg bg-white/4 px-1 py-1.5 text-center">
                      <p className="text-xs font-bold text-gold">{b.pixelCount.toLocaleString('pt-BR')}</p>
                      <p className="text-[9px] text-white/55">pixels</p>
                    </div>
                    <div className="rounded-lg bg-white/4 px-1 py-1.5 text-center">
                      <p className="text-xs font-bold text-white/70">{b.pixelWidth}×{b.pixelHeight}</p>
                      <p className="text-[9px] text-white/55">tamanho</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {b.bio && (
                    <p className="mb-3 text-[11px] leading-relaxed text-white/65 line-clamp-2">{b.bio}</p>
                  )}

                  {/* Cidade */}
                  {b.city && (
                    <p className="mb-3 text-[11px] text-white/55">📍 {b.city}</p>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2">
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-opacity hover:opacity-90"
                        style={{ background: '#25D366', color: '#fff' }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Contato via WhatsApp
                      </a>
                    ) : (
                      <a
                        href={igUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-opacity hover:opacity-90"
                        style={{ background: '#E1306C22', border: '0.5px solid #E1306C55', color: '#E1306C' }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        Contato via Instagram
                      </a>
                    )}
                    <Link
                      href={`/influencer/${b.instagramHandle}`}
                      className="flex items-center justify-center rounded-xl px-3 py-2.5 text-xs transition-all"
                      style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      Ver perfil
                    </Link>
                  </div>

                  <SendBriefingButton
                    blockId={(b as any).id}
                    instagramHandle={b.instagramHandle}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gold/25 bg-gold/8 py-2.5 text-xs font-bold text-gold transition-all hover:bg-gold/12"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CTA — seja um influencer */}
      <div className="rounded-2xl border border-white/8 bg-dark-2 p-6 text-center">
        <p className="text-sm font-bold text-white mb-1">Você é um influencer?</p>
        <p className="text-xs text-white/65 mb-4">
          Garanta seu espaço permanente no mapa e apareça para marcas como essa.
        </p>
        <Link href="/comprar" className="btn-gold px-6 py-2.5 text-sm">
          Garantir meu espaço — a partir de R$ 0,99 →
        </Link>
      </div>

    </div>
  )
}
