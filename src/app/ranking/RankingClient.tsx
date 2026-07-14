'use client'

import { useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { NICHE_LABELS } from '@/types'
import type { schema } from '@/lib/db'

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

const MEDALS = ['🥇', '🥈', '🥉']

const NICHES = [
  { key: '',            label: 'Todos os nichos' },
  { key: 'fitness',     label: 'Fitness' },
  { key: 'moda',        label: 'Moda & Estilo' },
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

interface RankingClientProps {
  blocks:         Block[]
  initialNiche:   string
  initialKeyword: string
  initialCity:    string
}

export function RankingClient({ blocks, initialNiche, initialKeyword, initialCity }: RankingClientProps) {
  const router   = useRouter()
  const pathname = usePathname()

  const [niche,   setNiche]   = useState(initialNiche)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [city,    setCity]    = useState(initialCity)
  const [view,    setView]    = useState<'list' | 'grid'>('list')

  function applyFilters(n: string, k: string, c: string) {
    const params = new URLSearchParams()
    if (n) params.set('niche',   n)
    if (k) params.set('keyword', k)
    if (c) params.set('city',    c)
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleNiche(n: string) {
    setNiche(n)
    applyFilters(n, keyword, city)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters(niche, keyword, city)
  }

  // Filtragem client-side para resposta imediata
  const filtered = useMemo(() => {
    return blocks.filter(b => {
      const matchNiche   = !niche   || b.niche === niche
      const matchKeyword = !keyword || b.instagramHandle.includes(keyword.toLowerCase()) || (b.displayName?.toLowerCase().includes(keyword.toLowerCase()) ?? false)
      const matchCity    = !city    || (b.city?.toLowerCase().includes(city.toLowerCase()) ?? false)
      return matchNiche && matchKeyword && matchCity
    })
  }, [blocks, niche, keyword, city])

  const maxPixels = filtered[0]?.pixelCount ?? 1

  return (
    <div className="space-y-6">

      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex flex-1 overflow-hidden rounded-xl border border-white/10 bg-dark-2 focus-within:border-white/20">
          <span className="flex items-center pl-3 text-white/55">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Buscar por @ ou nome..."
            className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/40 outline-none"
          />
        </div>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Cidade..."
          className="w-32 rounded-xl border border-white/10 bg-dark-2 px-3 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/20"
        />
        <button type="submit" className="btn-gold px-4 py-3 text-sm">
          Buscar
        </button>
        {/* Toggle lista/grid */}
        <div className="flex overflow-hidden rounded-xl border border-white/10">
          <button type="button" onClick={() => setView('list')}
            className={`px-3 py-3 text-sm transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white/60'}`}>
            ☰
          </button>
          <button type="button" onClick={() => setView('grid')}
            className={`px-3 py-3 text-sm transition-all ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white/60'}`}>
            ⊞
          </button>
        </div>
      </form>

      {/* Filtros de nicho */}
      <div className="flex flex-wrap gap-2">
        {NICHES.map(n => (
          <button
            key={n.key}
            onClick={() => handleNiche(n.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              niche === n.key
                ? 'text-dark'
                : 'border border-white/10 text-white/65 hover:border-white/20 hover:text-white/70'
            }`}
            style={niche === n.key ? {
              background: n.key ? NICHE_COLORS[n.key] : '#FFD700',
            } : {}}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Contagem */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/55">
          {filtered.length} influencer{filtered.length !== 1 ? 's' : ''}
          {niche ? ` em ${NICHE_LABELS[niche as keyof typeof NICHE_LABELS]}` : ''}
          {city ? ` · ${city}` : ''}
        </p>
        {(niche || keyword || city) && (
          <button
            onClick={() => { setNiche(''); setKeyword(''); setCity(''); applyFilters('', '', '') }}
            className="text-xs text-white/55 hover:text-white/60"
          >
            limpar filtros ✕
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-dark-2 py-16 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-3 text-sm text-white/65">Nenhum influencer encontrado</p>
          <p className="mt-1 text-xs text-white/45">Tente outros filtros</p>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-2">
          {filtered.map((b, i) => {
            const initials  = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
            const color     = b.colorHex || '#E1306C'
            const pct       = Math.round((b.pixelCount / maxPixels) * 100)
            const nicheLabel = NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche

            return (
              <Link
                key={b.id}
                href={`/influencer/${b.instagramHandle}`}
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-dark-2 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-white/10 hover:bg-dark-3"
              >
                {/* Posição */}
                <div className="w-8 shrink-0 text-center">
                  {i < 3 ? (
                    <span className="text-lg">{MEDALS[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-white/45">#{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
                  style={{ background: color }}
                >
                  {b.avatarUrl
                    ? <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                    : initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">@{b.instagramHandle}</p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: color + '22', color }}
                    >
                      {nicheLabel}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    {/* Barra de progresso proporcional */}
                    <div className="flex-1 h-1 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="text-[11px] text-white/55 shrink-0">
                      {b.city ? `${b.city} · ` : ''}{b.pixelWidth}×{b.pixelHeight}px
                    </span>
                  </div>
                </div>

                {/* Pixels + seguidores */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-gold">{b.pixelCount.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-white/50">pixels</p>
                </div>
                {b.followers && (
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-sm font-bold text-white/70">{b.followers}</p>
                    <p className="text-[10px] text-white/50">seguidores</p>
                  </div>
                )}

                {/* Seta */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/45 group-hover:text-white/70 transition-colors"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            )
          })}
        </div>
      ) : (
        /* View em grid */
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((b, i) => {
            const initials   = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
            const color      = b.colorHex || '#E1306C'
            const nicheLabel = NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche

            return (
              <Link
                key={b.id}
                href={`/influencer/${b.instagramHandle}`}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-dark-2 p-4 transition-all hover:-translate-y-0.5 hover:border-white/10"
              >
                {i < 3 && (
                  <span className="absolute right-2 top-2 text-sm">{MEDALS[i]}</span>
                )}
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
                  style={{ background: color }}
                >
                  {b.avatarUrl
                    ? <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                    : initials}
                </div>
                <p className="truncate text-center text-xs font-bold text-white">@{b.instagramHandle}</p>
                <p className="mt-0.5 text-center text-[10px]" style={{ color: color + 'bb' }}>{nicheLabel}</p>
                <div className="mt-2 text-center">
                  <p className="text-sm font-bold text-gold">{b.pixelCount.toLocaleString('pt-BR')}</p>
                  <p className="text-[9px] text-white/50">pixels</p>
                </div>
                {b.followers && (
                  <p className="mt-1 text-center text-[10px] text-white/55">{b.followers} seguidores</p>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* CTA para marcas */}
      <div className="rounded-2xl border border-gold/15 bg-gold/5 p-6 text-center">
        <p className="text-sm font-bold text-gold mb-1">Você é uma marca?</p>
        <p className="text-xs text-white/65 mb-4">
          Use os filtros acima para encontrar o influencer ideal para sua campanha. Clique no perfil e entre em contato direto.
        </p>
        <Link href="/marcas" className="btn-gold px-6 py-2.5 text-sm">
          Acessar portal de marcas →
        </Link>
      </div>

    </div>
  )
}
