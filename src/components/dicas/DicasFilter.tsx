'use client'

import { useMemo, useState } from 'react'
import type { DicaArticle } from '@/lib/content/dicas'
import { DicaCard } from './DicaCard'

export function DicasFilter({ dicas }: { dicas: DicaArticle[] }) {
  const [category, setCategory] = useState('')

  const categories = useMemo(() => {
    const seen = new Map<string, string>() // categoria -> cor de destaque
    for (const d of dicas) if (!seen.has(d.category)) seen.set(d.category, d.accent)
    return Array.from(seen.entries())
  }, [dicas])

  const filtered = category ? dicas.filter(d => d.category === category) : dicas

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setCategory('')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            category === ''
              ? 'bg-gold text-black'
              : 'border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
          }`}
        >
          Todas ({dicas.length})
        </button>
        {categories.map(([cat, accent]) => {
          const count = dicas.filter(d => d.category === cat).length
          const active = category === cat
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
              style={
                active
                  ? { background: accent, color: '#0a0a0a' }
                  : { border: `1px solid ${accent}40`, color: accent + 'cc', background: 'transparent' }
              }
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((dica, i) => (
          <DicaCard key={dica.slug} dica={dica} delay={(i % 4) * 80} />
        ))}
      </div>
    </>
  )
}
