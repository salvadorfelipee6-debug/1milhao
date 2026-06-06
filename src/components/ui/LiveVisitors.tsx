'use client'

import { useEffect, useState } from 'react'

// Perfil de tráfego por hora (0-23) — multiplicador base
const HOUR_PROFILE = [
  0.15, // 00h - madrugada baixa
  0.10, // 01h
  0.08, // 02h
  0.07, // 03h
  0.08, // 04h
  0.12, // 05h
  0.20, // 06h - acordando
  0.35, // 07h
  0.50, // 08h - manhã
  0.60, // 09h
  0.65, // 10h
  0.62, // 11h
  0.55, // 12h - almoço cai um pouco
  0.50, // 13h
  0.45, // 14h - tarde menor
  0.48, // 15h
  0.55, // 16h
  0.65, // 17h - saindo do trabalho
  0.78, // 18h
  0.88, // 19h - noite sobe
  0.95, // 20h - pico
  1.00, // 21h - pico máximo
  0.92, // 22h
  0.70, // 23h
]

const MIN_VISITORS = 300
const MAX_VISITORS = 3759

function getBaseVisitors(): number {
  const now    = new Date()
  // Horário de Brasília (UTC-3)
  const hour   = (now.getUTCHours() - 3 + 24) % 24
  const mult   = HOUR_PROFILE[hour]
  return Math.round(MIN_VISITORS + (MAX_VISITORS - MIN_VISITORS) * mult)
}

function jitter(base: number): number {
  // Variação aleatória de ±4%
  const pct = (Math.random() - 0.5) * 0.08
  const val = Math.round(base * (1 + pct))
  return Math.max(MIN_VISITORS, Math.min(MAX_VISITORS, val))
}

export function LiveVisitors({ className }: { className?: string }) {
  const [count,    setCount]    = useState<number | null>(null)
  const [trend,    setTrend]    = useState<'up' | 'down' | 'same'>('same')
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Valor inicial
    const initial = jitter(getBaseVisitors())
    setCount(initial)

    let prev = initial

    // Atualiza a cada 7-13 segundos (intervalo aleatório)
    function schedule() {
      const delay = 7000 + Math.random() * 6000
      return setTimeout(() => {
        const base = getBaseVisitors()
        const next = jitter(base)
        setTrend(next > prev ? 'up' : next < prev ? 'down' : 'same')
        setCount(next)
        setAnimated(true)
        setTimeout(() => setAnimated(false), 600)
        prev = next
        timer = schedule()
      }, delay)
    }

    let timer = schedule()
    return () => clearTimeout(timer)
  }, [])

  if (count === null) return null

  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      {/* Dot pulsante */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
      </span>

      {/* Número */}
      <span
        className="font-display text-sm tabular-nums transition-all duration-300"
        style={{
          color:     trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : '#ffffff',
          transform: animated ? 'scale(1.12)' : 'scale(1)',
        }}
      >
        {count.toLocaleString('pt-BR')}
      </span>

      {/* Seta de tendência */}
      {trend !== 'same' && (
        <span className="text-xs" style={{ color: trend === 'up' ? '#4ade80' : '#f87171' }}>
          {trend === 'up' ? '↑' : '↓'}
        </span>
      )}

      <span className="text-xs text-white/40">pessoas no mapa agora</span>
    </div>
  )
}
