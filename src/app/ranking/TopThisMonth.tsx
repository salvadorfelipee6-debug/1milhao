import Link from 'next/link'
import { NICHE_LABELS } from '@/types'

interface Block {
  instagramHandle: string
  displayName:     string
  avatarUrl:       string | null
  colorHex:        string
  pixelCount:      number
  niche:            string
}

const MES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function TopThisMonth({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null
  const mesLabel = MES[new Date().getMonth()]

  return (
    <div className="mb-8">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
        🔥 Destaque de {mesLabel}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {blocks.map((b, i) => {
          const initials   = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
          const nicheLabel = NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche
          return (
            <Link
              key={b.instagramHandle}
              href={`/influencer/${b.instagramHandle}`}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/8 bg-dark-2 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-gold/30"
            >
              <span className="text-sm font-bold text-white/40">#{i + 1}</span>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
                style={{ background: b.colorHex || '#E1306C' }}
              >
                {b.avatarUrl
                  ? <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                  : initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">@{b.instagramHandle}</p>
                <p className="text-[11px] text-white/55">{nicheLabel} · {b.pixelCount.toLocaleString('pt-BR')}px</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
