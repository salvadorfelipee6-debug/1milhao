'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { GridBlock, GridStats } from '@/types'
import { BlockPopup } from '../popup/BlockPopup'
import { NICHE_COLORS, NICHE_LABELS } from '@/types'
import { useRouter } from 'next/navigation'

interface PixelGridProps {
  initialBlocks: GridBlock[]
  stats:         GridStats
}

const GRID_COLS = 1000
const GRID_ROWS = 1000
const PIXEL_PRICE = 0.10
const CELL_UNIT = 10 // cada unidade de seleção = 10 pixels da grade

export function PixelGrid({ initialBlocks, stats }: PixelGridProps) {
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const blocksRef       = useRef<GridBlock[]>(initialBlocks)
  const router          = useRouter()

  // Estado de seleção por arrasto
  const isDragging      = useRef(false)
  const dragStart       = useRef<{ gx: number; gy: number } | null>(null)
  const dragEnd         = useRef<{ gx: number; gy: number } | null>(null)
  const hoverCell       = useRef<{ gx: number; gy: number } | null>(null)

  const [selection, setSelection]       = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<GridBlock | null>(null)
  const [tooltip, setTooltip]           = useState<{ x: number; y: number; text: string } | null>(null)
  const [niche, setNiche]               = useState('all')

  // ─── Helpers ─────────────────────────────────────────────

  function getCellSize(canvas: HTMLCanvasElement) {
    return canvas.width / GRID_COLS
  }

  function canvasToGrid(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const rect  = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (clientX - rect.left) * scaleX
    const cy = (clientY - rect.top)  * scaleY
    const cs = getCellSize(canvas)
    // Snap para unidades de CELL_UNIT
    const gx = Math.floor(Math.floor(cx / cs) / CELL_UNIT) * CELL_UNIT
    const gy = Math.floor(Math.floor(cy / cs) / CELL_UNIT) * CELL_UNIT
    return { gx, gy }
  }

  function getBlockAt(canvas: HTMLCanvasElement, clientX: number, clientY: number): GridBlock | null {
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (clientX - rect.left) * scaleX
    const cy = (clientY - rect.top)  * scaleY
    const cs = getCellSize(canvas)
    const gx = Math.floor(cx / cs)
    const gy = Math.floor(cy / cs)
    const filtered = niche === 'all' ? blocksRef.current : blocksRef.current.filter(b => b.niche === niche)
    for (const b of filtered) {
      if (gx >= b.pixelX && gx < b.pixelX + b.pixelWidth &&
          gy >= b.pixelY && gy < b.pixelY + b.pixelHeight) return b
    }
    return null
  }

  function getSelectionRect() {
    if (!dragStart.current || !dragEnd.current) return null
    const x1 = Math.min(dragStart.current.gx, dragEnd.current.gx)
    const y1 = Math.min(dragStart.current.gy, dragEnd.current.gy)
    const x2 = Math.max(dragStart.current.gx, dragEnd.current.gx) + CELL_UNIT
    const y2 = Math.max(dragStart.current.gy, dragEnd.current.gy) + CELL_UNIT
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
  }

  function isOccupied(x: number, y: number, w: number, h: number): boolean {
    for (const b of blocksRef.current) {
      const overlapX = x < b.pixelX + b.pixelWidth  && x + w > b.pixelX
      const overlapY = y < b.pixelY + b.pixelHeight && y + h > b.pixelY
      if (overlapX && overlapY) return true
    }
    return false
  }

  // ─── Draw ─────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cs = getCellSize(canvas)
    const filtered = niche === 'all' ? blocksRef.current : blocksRef.current.filter(b => b.niche === niche)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fundo
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grade sutil
    if (cs > 0.5) {
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < GRID_COLS; x += CELL_UNIT) {
        ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < GRID_ROWS; y += CELL_UNIT) {
        ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(canvas.width, y * cs); ctx.stroke()
      }
    }

    // Hover cell highlight (quando não está arrastando)
    if (!isDragging.current && hoverCell.current) {
      const { gx, gy } = hoverCell.current
      ctx.fillStyle = 'rgba(255,215,0,0.06)'
      ctx.fillRect(gx * cs, gy * cs, CELL_UNIT * cs, CELL_UNIT * cs)
    }

    // Blocos existentes
    for (const b of filtered) {
      const x = b.pixelX * cs, y = b.pixelY * cs
      const w = b.pixelWidth * cs, h = b.pixelHeight * cs
      const color = b.colorHex || '#E1306C'
      ctx.fillStyle = color + '44'
      ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = color + 'cc'
      ctx.lineWidth = Math.max(0.5, cs * 0.3)
      ctx.strokeRect(x + ctx.lineWidth/2, y + ctx.lineWidth/2, w - ctx.lineWidth, h - ctx.lineWidth)
      const fontSize = w * 0.13
      if (fontSize > 7 && w > 30) {
        ctx.save()
        ctx.globalAlpha = 0.8
        ctx.fillStyle   = '#fff'
        ctx.font        = `bold ${Math.min(fontSize, 12)}px Inter,sans-serif`
        ctx.textAlign   = 'center'
        ctx.textBaseline = 'middle'
        let handle = '@' + b.instagramHandle
        const maxLen = Math.floor(w / (fontSize * 0.55))
        if (handle.length > maxLen) handle = handle.slice(0, maxLen) + '…'
        ctx.fillText(handle, x + w/2, y + h/2)
        ctx.restore()
      }
    }

    // Área de seleção em tempo real (durante arrasto)
    const selRect = getSelectionRect()
    if (selRect) {
      const { x, y, w, h } = selRect
      const occupied = isOccupied(x, y, w, h)
      const fillColor   = occupied ? 'rgba(255,60,60,0.15)'  : 'rgba(255,215,0,0.12)'
      const strokeColor = occupied ? 'rgba(255,60,60,0.8)'   : 'rgba(255,215,0,0.9)'
      ctx.fillStyle   = fillColor
      ctx.fillRect(x * cs, y * cs, w * cs, h * cs)
      ctx.strokeStyle = strokeColor
      ctx.lineWidth   = 2
      ctx.setLineDash([4, 3])
      ctx.strokeRect(x * cs + 1, y * cs + 1, w * cs - 2, h * cs - 2)
      ctx.setLineDash([])
    }
  }, [niche])

  // ─── Resize ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    function resize() {
      const wrapper = canvas!.parentElement!
      const size = Math.min(wrapper.offsetWidth, 1000)
      canvas!.width = size; canvas!.height = size
      draw()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    return () => ro.disconnect()
  }, [draw])

  // ─── Mouse / Touch events ─────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onMouseMove(e: MouseEvent) {
      const block = getBlockAt(canvas!, e.clientX, e.clientY)
      if (isDragging.current) {
        dragEnd.current = canvasToGrid(canvas!, e.clientX, e.clientY)
        const sel = getSelectionRect()
        setSelection(sel)
        canvas!.style.cursor = 'crosshair'
        setTooltip(null)
        draw()
        return
      }
      hoverCell.current = canvasToGrid(canvas!, e.clientX, e.clientY)
      if (block) {
        canvas!.style.cursor = 'pointer'
        const rect = canvas!.getBoundingClientRect()
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 12,
          text: `@${block.instagramHandle} · ${block.followers ?? ''} seguidores`,
        })
      } else {
        canvas!.style.cursor = 'cell'
        setTooltip(null)
      }
      draw()
    }

    function onMouseDown(e: MouseEvent) {
      const block = getBlockAt(canvas!, e.clientX, e.clientY)
      if (block) { setSelectedBlock(block); return }
      // Inicia seleção
      const cell = canvasToGrid(canvas!, e.clientX, e.clientY)
      isDragging.current = true
      dragStart.current  = cell
      dragEnd.current    = cell
      setSelection(null)
    }

    function onMouseUp(e: MouseEvent) {
      if (!isDragging.current) return
      isDragging.current = false
      const sel = getSelectionRect()
      if (sel && (sel.w >= CELL_UNIT || sel.h >= CELL_UNIT)) {
        if (!isOccupied(sel.x, sel.y, sel.w, sel.h)) {
          setSelection(sel)
        } else {
          dragStart.current = null
          dragEnd.current   = null
          setSelection(null)
        }
      } else {
        dragStart.current = null
        dragEnd.current   = null
        setSelection(null)
      }
      draw()
    }

    function onMouseLeave() {
      hoverCell.current = null
      if (!isDragging.current) draw()
    }

    canvas.addEventListener('mousemove',  onMouseMove)
    canvas.addEventListener('mousedown',  onMouseDown)
    canvas.addEventListener('mouseup',    onMouseUp)
    canvas.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mouseup',    onMouseUp)

    return () => {
      canvas.removeEventListener('mousemove',  onMouseMove)
      canvas.removeEventListener('mousedown',  onMouseDown)
      canvas.removeEventListener('mouseup',    onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mouseup',    onMouseUp)
    }
  }, [niche, draw])

  useEffect(() => { draw() }, [niche, draw])

  // ─── Painel de seleção ────────────────────────────────────
  const selPixels = selection ? selection.w * selection.h : 0
  const selPrice  = (selPixels * PIXEL_PRICE).toFixed(2)
  const selOccupied = selection ? isOccupied(selection.x, selection.y, selection.w, selection.h) : false

  function handleBuySelection() {
    if (!selection) return
    router.push(`/comprar?pixels=${selPixels}&x=${selection.x}&y=${selection.y}&w=${selection.w}&h=${selection.h}`)
  }

  function clearSelection() {
    dragStart.current = null
    dragEnd.current   = null
    setSelection(null)
    draw()
  }

  const niches = [
    { key: 'all', label: 'Todos' },
    { key: 'fitness', label: 'Fitness' },
    { key: 'moda', label: 'Moda' },
    { key: 'tecnologia', label: 'Tecnologia' },
    { key: 'gastronomia', label: 'Gastronomia' },
    { key: 'beleza', label: 'Beleza' },
    { key: 'viagens', label: 'Viagens' },
    { key: 'games', label: 'Games' },
    { key: 'financas', label: 'Finanças' },
  ]

  return (
    <div className="space-y-3">

      {/* Instrução */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-white/30">
          👆 Clique num bloco para ver o perfil · <span className="text-gold/60">Clique e arraste numa área livre para reservar seu espaço</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {niches.map(n => (
            <button key={n.key} onClick={() => setNiche(n.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                niche === n.key ? 'bg-pink text-white' : 'border border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-dark-2">
        <canvas ref={canvasRef} id="pixel-canvas"
          aria-label="Grade de pixels — arraste para selecionar seu espaço"
        />

        {/* Tooltip */}
        {tooltip && (
          <div className="pointer-events-none absolute z-20 rounded-lg bg-black/90 px-2.5 py-1.5 text-xs text-white/80 backdrop-blur-sm"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}>
            {tooltip.text}
          </div>
        )}

        {/* Painel de seleção — aparece ao arrastar */}
        {selection && !selOccupied && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-gold/30 bg-dark-2/95 px-5 py-3 backdrop-blur-md shadow-2xl">
            <div className="text-center">
              <p className="font-display text-xl text-gold">{selPixels.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">pixels</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-display text-xl text-white">{selection.w}×{selection.h}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">tamanho</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-display text-xl text-gold">R${selPrice.replace('.',',')}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">único</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <button onClick={handleBuySelection}
              className="btn-gold px-4 py-2 text-sm font-bold">
              Garantir esse espaço →
            </button>
            <button onClick={clearSelection}
              className="text-white/30 hover:text-white/60 text-lg leading-none">
              ✕
            </button>
          </div>
        )}

        {/* Aviso de área ocupada */}
        {selection && selOccupied && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-dark-2/95 px-5 py-3 backdrop-blur-md">
            <p className="text-sm text-red-400">⚠️ Área ocupada — selecione outro espaço</p>
            <button onClick={clearSelection} className="text-white/30 hover:text-white/60">✕</button>
          </div>
        )}

        {/* Botões de zoom */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
          {['+','−','⊡'].map((l, i) => (
            <button key={l}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-dark-2/90 text-sm text-white/50 hover:text-white backdrop-blur-sm">
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between text-xs text-white/25">
        <span>{stats.sold.toLocaleString('pt-BR')} / 1.000.000 pixels vendidos</span>
        <span>{stats.available.toLocaleString('pt-BR')} disponíveis</span>
      </div>

      {/* Popup do bloco */}
      {selectedBlock && <BlockPopup block={selectedBlock} onClose={() => setSelectedBlock(null)} />}
    </div>
  )
}
