'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const GRID_SIZE = 1000
const CANVAS_RES = 420

interface OccupiedBlock {
  pixelX: number; pixelY: number; pixelWidth: number; pixelHeight: number
}

interface Props {
  pixelWidth:  number
  pixelHeight: number
  value:       { x: number; y: number } | null
  onChange:    (pos: { x: number; y: number } | null) => void
}

function overlaps(
  x: number, y: number, w: number, h: number,
  ox: number, oy: number, ow: number, oh: number
) {
  return x < ox + ow && x + w > ox && y < oy + oh && y + h > oy
}

export function PositionPicker({ pixelWidth, pixelHeight, value, onChange }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [occupied, setOccupied]   = useState<OccupiedBlock[] | null>(null)
  const [hover,    setHover]      = useState<{ x: number; y: number } | null>(null)
  const [error,    setError]      = useState('')

  useEffect(() => {
    fetch('/api/blocks')
      .then(r => r.json())
      .then(data => setOccupied(data.blocks ?? []))
      .catch(() => setOccupied([]))
  }, [])

  const isFree = useCallback((x: number, y: number) => {
    if (x < 0 || y < 0 || x + pixelWidth > GRID_SIZE || y + pixelHeight > GRID_SIZE) return false
    if (!occupied) return false
    return !occupied.some(o => overlaps(x, y, pixelWidth, pixelHeight, o.pixelX, o.pixelY, o.pixelWidth, o.pixelHeight))
  }, [occupied, pixelWidth, pixelHeight])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas || !occupied) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = CANVAS_RES / GRID_SIZE

    ctx.clearRect(0, 0, CANVAS_RES, CANVAS_RES)
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, CANVAS_RES, CANVAS_RES)

    // Blocos ocupados
    ctx.fillStyle   = 'rgba(255,255,255,0.14)'
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth   = 1
    for (const o of occupied) {
      const x = o.pixelX * scale, y = o.pixelY * scale
      const w = Math.max(1.5, o.pixelWidth * scale), h = Math.max(1.5, o.pixelHeight * scale)
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
    }

    // Preview do cursor
    if (hover) {
      const free = isFree(hover.x, hover.y)
      const x = hover.x * scale, y = hover.y * scale
      const w = pixelWidth * scale, h = pixelHeight * scale
      ctx.fillStyle   = free ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.3)'
      ctx.strokeStyle = free ? 'rgba(34,197,94,0.9)'  : 'rgba(239,68,68,0.9)'
      ctx.lineWidth   = 1.5
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
    }

    // Seleção confirmada
    if (value) {
      const x = value.x * scale, y = value.y * scale
      const w = pixelWidth * scale, h = pixelHeight * scale
      ctx.fillStyle   = 'rgba(255,215,0,0.3)'
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth   = 2
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
    }
  }

  useEffect(() => { draw() }, [occupied, hover, value, pixelWidth, pixelHeight])

  function posFromEvent(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect  = canvas.getBoundingClientRect()
    const scale = GRID_SIZE / CANVAS_RES
    const cx = (clientX - rect.left) * (CANVAS_RES / rect.width)
    const cy = (clientY - rect.top)  * (CANVAS_RES / rect.height)
    let gx = Math.round(cx * scale - pixelWidth / 2)
    let gy = Math.round(cy * scale - pixelHeight / 2)
    gx = Math.max(0, Math.min(GRID_SIZE - pixelWidth,  gx))
    gy = Math.max(0, Math.min(GRID_SIZE - pixelHeight, gy))
    return { x: gx, y: gy }
  }

  function handleMove(clientX: number, clientY: number) {
    const pos = posFromEvent(clientX, clientY)
    if (pos) setHover(pos)
  }

  function handlePick(clientX: number, clientY: number) {
    const pos = posFromEvent(clientX, clientY)
    if (!pos) return
    if (!isFree(pos.x, pos.y)) {
      setError('Essa área já está ocupada — escolha outro ponto.')
      return
    }
    setError('')
    onChange(pos)
  }

  function pickRandom() {
    if (!occupied) return
    for (let i = 0; i < 300; i++) {
      const x = Math.floor(Math.random() * (GRID_SIZE - pixelWidth))
      const y = Math.floor(Math.random() * (GRID_SIZE - pixelHeight))
      if (isFree(x, y)) { setError(''); onChange({ x, y }); return }
    }
    // fallback: varredura sequencial
    for (let y = 0; y <= GRID_SIZE - pixelHeight; y += 10) {
      for (let x = 0; x <= GRID_SIZE - pixelWidth; x += 10) {
        if (isFree(x, y)) { setError(''); onChange({ x, y }); return }
      }
    }
    setError('Não achamos espaço livre — o mapa pode estar cheio nesse tamanho.')
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
          Escolha onde seu bloco fica no mapa
        </p>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-[10px] text-white/45 hover:text-white/70">
            limpar seleção
          </button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10">
        <canvas
          ref={canvasRef}
          width={CANVAS_RES}
          height={CANVAS_RES}
          className="block w-full cursor-crosshair"
          style={{ aspectRatio: '1' }}
          onMouseMove={e => handleMove(e.clientX, e.clientY)}
          onMouseLeave={() => setHover(null)}
          onClick={e => handlePick(e.clientX, e.clientY)}
          onTouchMove={e => { const t = e.touches[0]; if (t) handleMove(t.clientX, t.clientY) }}
          onTouchEnd={e => { const t = e.changedTouches[0]; if (t) handlePick(t.clientX, t.clientY) }}
        />
        {!occupied && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/60 text-xs text-white/50">
            Carregando mapa...
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[10px] text-white/45">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: 'rgba(255,215,0,0.6)', border: '1px solid #FFD700' }} />sua área</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-white/20" />ocupado</span>
        </div>
        <button type="button" onClick={pickRandom} className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-white/65 hover:border-white/25 hover:text-white/85">
          🎲 posição aleatória
        </button>
      </div>

      {value && (
        <p className="mt-1.5 text-[10px] text-gold/80">Posição escolhida: {value.x}, {value.y}</p>
      )}
      {error && <p className="mt-1.5 text-[10px] text-red-400">{error}</p>}
      {!value && !error && (
        <p className="mt-1.5 text-[10px] text-white/40">Clique num ponto livre do mapa (ou pule esta etapa — a gente escolhe um lugar livre por você).</p>
      )}
    </div>
  )
}
