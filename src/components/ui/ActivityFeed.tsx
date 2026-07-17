'use client'

import { useEffect, useState } from 'react'
import { NICHE_LABELS } from '@/types'

interface Activation {
  instagramHandle: string
  displayName:     string
  avatarUrl:       string | null
  colorHex:        string
  pixelCount:      number
  niche:            string
  createdAt:        string | Date
}

function relativeTime(date: Date, now: number): string {
  const diffMin = Math.max(0, Math.round((now - date.getTime()) / 60000))
  if (diffMin < 1)  return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.round(diffH / 24)
  return `há ${diffD}d`
}

// Feed de atividade real — só mostra ativações de verdade, sem número inventado.
// Some por completo quando não há nada recente (não finge tráfego que não existe).
export function ActivityFeed({ activations }: { activations: Activation[] }) {
  const [mounted, setMounted] = useState(false)
  const [index,   setIndex]   = useState(0)
  const [now,     setNow]     = useState(0)

  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
  }, [])

  useEffect(() => {
    if (activations.length < 2) return
    const t = setInterval(() => setIndex(i => (i + 1) % activations.length), 4500)
    return () => clearInterval(t)
  }, [activations.length])

  if (!mounted || activations.length === 0) return null

  const a = activations[index]
  if (!a) return null
  const nicheLabel = NICHE_LABELS[a.niche as keyof typeof NICHE_LABELS] ?? a.niche
  const initials   = (a.displayName || a.instagramHandle).slice(0, 2).toUpperCase()

  return (
    <div
      key={index}
      className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-white/75 backdrop-blur-sm"
    >
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full text-[8px] font-bold text-white"
        style={{ background: a.colorHex || '#E1306C' }}
      >
        {a.avatarUrl
          ? <img src={a.avatarUrl} alt="" className="h-full w-full object-cover" />
          : initials}
      </div>
      <span>
        <strong className="text-white/90">@{a.instagramHandle}</strong> garantiu {a.pixelCount.toLocaleString('pt-BR')} pixels em {nicheLabel}
        <span className="text-white/45"> · {relativeTime(new Date(a.createdAt), now)}</span>
      </span>
    </div>
  )
}
