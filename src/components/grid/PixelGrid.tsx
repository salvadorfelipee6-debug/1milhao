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

const GRID_COLS   = 1000
const GRID_ROWS   = 1000
const PIXEL_PRICE = 0.10
const CELL_UNIT   = 10

interface RichTooltip {
  x: number
  y: number
  block?:     GridBlock
  emptyCell?: { gx: number; gy: number }
}

export function PixelGrid({ initialBlocks, stats }: PixelGridProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const blocksRef    = useRef<GridBlock[]>(initialBlocks)
  const router       = useRouter()

  const isDragging   = useRef(false)
  const dragStart    = useRef<{ gx: number; gy: number } | null>(null)
  const dragEnd      = useRef<{ gx: number; gy: number } | null>(null)
  const hoverCell    = useRef<{ gx: number; gy: number } | null>(null)
  const animFrameRef = useRef<number>(0)

  const [selection,     setSelection]     = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [selScreenPos,  setSelScreenPos]  = useState<{ left: number; top: number; right: number; bottom: number } | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<GridBlock | null>(null)
  const [richTooltip,   setRichTooltip]   = useState<RichTooltip | null>(null)
  const [niche,         setNiche]         = useState('all')
  const [selAnimated,   setSelAnimated]   = useState(false)

  // ─── Helpers ──────────────────────────────────────────────────

  function getCellSize(canvas: HTMLCanvasElement) {
    return canvas.width / GRID_COLS
  }

  function canvasToGrid(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (clientX - rect.left) * scaleX
    const cy = (clientY - rect.top)  * scaleY
    const cs = getCellSize(canvas)
    const gx = Math.floor(Math.floor(cx / cs) / CELL_UNIT) * CELL_UNIT
    const gy = Math.floor(Math.floor(cy / cs) / CELL_UNIT) * CELL_UNIT
    return { gx, gy }
  }

  function canvasToGridExact(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (clientX - rect.left) * scaleX
    const cy = (clientY - rect.top)  * scaleY
    const cs = getCellSize(canvas)
    return { gx: Math.floor(cx / cs), gy: Math.floor(cy / cs) }
  }

  function getBlockAt(canvas: HTMLCanvasElement, clientX: number, clientY: number): GridBlock | null {
    const { gx, gy } = canvasToGridExact(canvas, clientX, clientY)
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

  function getSelectionScreenPos(sel: { x: number; y: number; w: number; h: number }) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect   = canvas.getBoundingClientRect()
    const cs     = rect.width / GRID_COLS
    const left   = rect.left   + sel.x * cs
    const top    = rect.top    + sel.y * cs
    const right  = rect.left   + (sel.x + sel.w) * cs
    const bottom = rect.top    + (sel.y + sel.h) * cs
    return { left, top, right, bottom }
  }

  // ─── Draw ─────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cs       = getCellSize(canvas)
    const filtered = niche === 'all' ? blocksRef.current : blocksRef.current.filter(b => b.niche === niche)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fundo
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grade sutil
    if (cs > 0.5) {
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'
      ctx.lineWidth   = 0.5
      for (let x = 0; x < GRID_COLS; x += CELL_UNIT) {
        ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < GRID_ROWS; y += CELL_UNIT) {
        ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(canvas.width, y * cs); ctx.stroke()
      }
    }

    // Hover highlight melhorado
    if (!isDragging.current && hoverCell.current) {
      const { gx, gy } = hoverCell.current
      // Glow ao redor
      ctx.fillStyle = 'rgba(255,215,0,0.04)'
      ctx.fillRect((gx - CELL_UNIT) * cs, (gy - CELL_UNIT) * cs, CELL_UNIT * cs * 3, CELL_UNIT * cs * 3)
      // Fill central
      ctx.fillStyle = 'rgba(255,215,0,0.10)'
      ctx.fillRect(gx * cs, gy * cs, CELL_UNIT * cs, CELL_UNIT * cs)
      // Borda dourada
      ctx.strokeStyle = 'rgba(255,215,0,0.55)'
      ctx.lineWidth   = 1
      ctx.strokeRect(gx * cs + 0.5, gy * cs + 0.5, CELL_UNIT * cs - 1, CELL_UNIT * cs - 1)
    }

    // Blocos existentes
    for (const b of filtered) {
      const x = b.pixelX * cs, y = b.pixelY * cs
      const w = b.pixelWidth * cs, h = b.pixelHeight * cs
      const color = b.colorHex || '#E1306C'

      ctx.shadowColor = color + '55'
      ctx.shadowBlur  = Math.max(2, cs * 2)
      ctx.fillStyle   = color + '44'
      ctx.fillRect(x, y, w, h)
      ctx.shadowBlur  = 0

      ctx.strokeStyle = color + 'cc'
      ctx.lineWidth   = Math.max(0.5, cs * 0.3)
      ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth)

      // Avatar sobreposto
      if (b.avatarUrl && (b as any)._img) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(x, y, w, h)
        ctx.clip()
        ctx.globalAlpha = 0.35
        ctx.drawImage((b as any)._img, x, y, w, h)
        ctx.restore()
      }

      const fontSize = w * 0.13
      if (fontSize > 7 && w > 30) {
        ctx.save()
        ctx.globalAlpha   = 0.9
        ctx.fillStyle     = '#fff'
        ctx.font          = `bold ${Math.min(fontSize, 12)}px Inter,sans-serif`
        ctx.textAlign     = 'center'
        ctx.textBaseline  = 'middle'
        let handle = '@' + b.instagramHandle
        const maxLen = Math.floor(w / (fontSize * 0.55))
        if (handle.length > maxLen) handle = handle.slice(0, maxLen) + '…'
        ctx.fillText(handle, x + w / 2, y + h / 2)
        ctx.restore()
      }
    }

    // Área de seleção em tempo real
    const selRect = getSelectionRect()
    if (selRect) {
      const { x, y, w, h } = selRect
      const occupied    = isOccupied(x, y, w, h)
      const fillColor   = occupied ? 'rgba(255,60,60,0.15)'  : 'rgba(255,215,0,0.14)'
      const strokeColor = occupied ? 'rgba(255,60,60,0.9)'   : 'rgba(255,215,0,1)'

      ctx.fillStyle = fillColor
      ctx.fillRect(x * cs, y * cs, w * cs, h * cs)

      ctx.strokeStyle = strokeColor
      ctx.lineWidth   = 1.5
      ctx.setLineDash([5, 4])
      ctx.strokeRect(x * cs + 1, y * cs + 1, w * cs - 2, h * cs - 2)
      ctx.setLineDash([])

      // Cantos em L
      const cornerSize = Math.min(8, w * cs * 0.15)
      ctx.strokeStyle  = strokeColor
      ctx.lineWidth    = 2.5
      const corners: [number, number, number, number][] = [
        [x * cs,       y * cs,       1,  1],
        [(x + w) * cs, y * cs,      -1,  1],
        [x * cs,       (y + h) * cs, 1, -1],
        [(x + w) * cs, (y + h) * cs,-1, -1],
      ]
      for (const [cx2, cy2, dx, dy] of corners) {
        ctx.beginPath()
        ctx.moveTo(cx2 + dx * cornerSize, cy2)
        ctx.lineTo(cx2, cy2)
        ctx.lineTo(cx2, cy2 + dy * cornerSize)
        ctx.stroke()
      }
    }
  }, [niche])

  // ─── Resize ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    function resize() {
      const wrapper = canvas!.parentElement!
      const size    = Math.min(wrapper.offsetWidth, 1000)
      canvas!.width = size; canvas!.height = size
      draw()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    return () => ro.disconnect()
  }, [draw])

  // ─── Mouse + Touch events ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onMouseMove(e: MouseEvent) {
      const block = getBlockAt(canvas!, e.clientX, e.clientY)

      if (isDragging.current) {
        dragEnd.current = canvasToGrid(canvas!, e.clientX, e.clientY)
        setSelection(getSelectionRect())
        canvas!.style.cursor = 'crosshair'
        setRichTooltip(null)
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      hoverCell.current = canvasToGrid(canvas!, e.clientX, e.clientY)
      const rect = canvas!.getBoundingClientRect()
      const tx   = e.clientX - rect.left
      const ty   = e.clientY - rect.top

      if (block) {
        canvas!.style.cursor = 'pointer'
        setRichTooltip({ x: tx, y: ty, block })
      } else {
        canvas!.style.cursor = 'cell'
        setRichTooltip({ x: tx, y: ty, emptyCell: hoverCell.current ?? undefined })
      }

      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = requestAnimationFrame(draw)
    }

    function onMouseDown(e: MouseEvent) {
      const block = getBlockAt(canvas!, e.clientX, e.clientY)
      if (block) { setSelectedBlock(block); return }
      const cell = canvasToGrid(canvas!, e.clientX, e.clientY)
      isDragging.current = true
      dragStart.current  = cell
      dragEnd.current    = cell
      setSelection(null)
      setRichTooltip(null)
    }

    function onMouseUp() {
      if (!isDragging.current) return
      isDragging.current = false
      setRichTooltip(null)
      const sel = getSelectionRect()
      if (sel && (sel.w >= CELL_UNIT || sel.h >= CELL_UNIT)) {
        if (!isOccupied(sel.x, sel.y, sel.w, sel.h)) {
          setSelection(sel)
          setSelScreenPos(getSelectionScreenPos(sel))
          setSelAnimated(false)
          setTimeout(() => setSelAnimated(true), 10)
        } else {
          dragStart.current = null; dragEnd.current = null; setSelection(null); setSelScreenPos(null)
        }
      } else {
        dragStart.current = null; dragEnd.current = null; setSelection(null); setSelScreenPos(null)
      }
      draw()
    }

    function onMouseLeave() {
      hoverCell.current = null
      setRichTooltip(null)
      if (!isDragging.current) draw()
    }

    // Touch
    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      const t    = e.touches[0]
      const block = getBlockAt(canvas!, t.clientX, t.clientY)
      if (block) { setSelectedBlock(block); return }
      const cell = canvasToGrid(canvas!, t.clientX, t.clientY)
      isDragging.current = true
      dragStart.current  = cell
      dragEnd.current    = cell
      setSelection(null)
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      if (!isDragging.current) return
      const t = e.touches[0]
      dragEnd.current = canvasToGrid(canvas!, t.clientX, t.clientY)
      setSelection(getSelectionRect())
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = requestAnimationFrame(draw)
    }

    function onTouchEnd() {
      if (!isDragging.current) return
      isDragging.current = false
      const sel = getSelectionRect()
      if (sel && (sel.w >= CELL_UNIT || sel.h >= CELL_UNIT)) {
        if (!isOccupied(sel.x, sel.y, sel.w, sel.h)) {
          setSelection(sel)
          setSelScreenPos(getSelectionScreenPos(sel))
          setSelAnimated(false)
          setTimeout(() => setSelAnimated(true), 10)
        } else {
          dragStart.current = null; dragEnd.current = null; setSelection(null); setSelScreenPos(null)
        }
      } else {
        dragStart.current = null; dragEnd.current = null; setSelection(null); setSelScreenPos(null)
      }
      draw()
    }

    canvas.addEventListener('mousemove',  onMouseMove)
    canvas.addEventListener('mousedown',  onMouseDown)
    canvas.addEventListener('mouseup',    onMouseUp)
    canvas.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
    canvas.addEventListener('touchend',   onTouchEnd)
    window.addEventListener('mouseup',    onMouseUp)

    return () => {
      canvas.removeEventListener('mousemove',  onMouseMove)
      canvas.removeEventListener('mousedown',  onMouseDown)
      canvas.removeEventListener('mouseup',    onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
      canvas.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('mouseup',    onMouseUp)
    }
  }, [niche, draw])

  useEffect(() => { draw() }, [niche, draw])

  // ─── Painel de seleção ─────────────────────────────────────────
  const selPixels   = selection ? selection.w * selection.h : 0
  const selPrice    = (selPixels * PIXEL_PRICE).toFixed(2)
  const selOccupied = selection ? isOccupied(selection.x, selection.y, selection.w, selection.h) : false

  function handleBuySelection() {
    if (!selection) return
    router.push(`/comprar?pixels=${selPixels}&x=${selection.x}&y=${selection.y}&w=${selection.w}&h=${selection.h}`)
  }

  function clearSelection() {
    dragStart.current = null; dragEnd.current = null
    setSelection(null); setSelScreenPos(null); draw()
  }

  // Posição inteligente do tooltip — evita sair da tela
  function tooltipStyle(x: number, y: number): React.CSSProperties {
    const goLeft  = x > 260
    const goAbove = y > 160
    return {
      left:      goLeft  ? undefined : x + 12,
      right:     goLeft  ? `calc(100% - ${x}px + 12px)` : undefined,
      top:       goAbove ? undefined : y + 12,
      bottom:    goAbove ? `calc(100% - ${y}px + 12px)` : undefined,
      transform: 'none',
    }
  }

  const niches = [
    { key: 'all',         label: 'Todos' },
    { key: 'fitness',     label: 'Fitness' },
    { key: 'moda',        label: 'Moda' },
    { key: 'tecnologia',  label: 'Tecnologia' },
    { key: 'gastronomia', label: 'Gastronomia' },
    { key: 'beleza',      label: 'Beleza' },
    { key: 'viagens',     label: 'Viagens' },
    { key: 'games',       label: 'Games' },
    { key: 'financas',    label: 'Finanças' },
  ]

  return (
    <div className="space-y-3">

      {/* Instrução + filtros */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-white/30">
          👆 Clique num bloco para ver o perfil ·{' '}
          <span className="text-gold/60">Arraste numa área livre para reservar</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {niches.map(n => (
            <button key={n.key} onClick={() => setNiche(n.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                niche === n.key
                  ? 'bg-pink text-white'
                  : 'border border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-dark-2">
        <canvas
          ref={canvasRef}
          id="pixel-canvas"
          aria-label="Grade de pixels — arraste para selecionar seu espaço"
        />

        {/* ── Tooltip: bloco ocupado ── */}
        {richTooltip?.block && !isDragging.current && (() => {
          const b          = richTooltip.block!
          const initials   = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
          const nicheLabel = NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche
          const blockPx    = b.pixelWidth * b.pixelHeight
          return (
            <div
              className="pointer-events-none absolute z-20 w-56 rounded-xl border border-white/10 bg-dark-2/95 p-3 shadow-2xl backdrop-blur-md"
              style={tooltipStyle(richTooltip.x, richTooltip.y)}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                  style={{ background: b.colorHex || '#E1306C' }}
                >
                  {b.avatarUrl
                    ? <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                    : initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">@{b.instagramHandle}</p>
                  {b.displayName && (
                    <p className="truncate text-[11px] text-white/40">{b.displayName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center mb-2.5">
                {b.followers != null && (
                  <div className="rounded-lg bg-white/5 px-1 py-1.5">
                    <p className="text-[11px] font-bold text-gold leading-none">
                      {b.followers >= 1000 ? `${(b.followers / 1000).toFixed(0)}k` : b.followers}
                    </p>
                    <p className="text-[9px] text-white/30 mt-0.5">seguidores</p>
                  </div>
                )}
                <div className="rounded-lg bg-white/5 px-1 py-1.5">
                  <p className="text-[11px] font-bold text-gold leading-none">
                    {blockPx.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[9px] text-white/30 mt-0.5">pixels</p>
                </div>
                <div className="rounded-lg bg-white/5 px-1 py-1.5">
                  <p className="text-[11px] font-bold text-white/70 leading-none">
                    {b.pixelWidth}×{b.pixelHeight}
                  </p>
                  <p className="text-[9px] text-white/30 mt-0.5">tamanho</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: b.colorHex || '#E1306C' }} />
                <span className="text-[11px] text-white/50">{nicheLabel}</span>
                {b.city && <span className="text-[11px] text-white/30">· {b.city}</span>}
              </div>

              {b.bio && (
                <p className="mt-2 text-[11px] leading-relaxed text-white/40 line-clamp-2 border-t border-white/5 pt-2">
                  {b.bio}
                </p>
              )}

              <p className="mt-2 text-[10px] text-white/20">clique para ver perfil completo</p>
            </div>
          )
        })()}

        {/* ── Tooltip: área livre ── */}
        {richTooltip?.emptyCell && !richTooltip.block && !isDragging.current && (
          <div
            className="pointer-events-none absolute z-20 rounded-lg border border-gold/20 bg-dark-2/90 px-3 py-2 backdrop-blur-sm"
            style={tooltipStyle(richTooltip.x, richTooltip.y)}
          >
            <p className="text-[11px] text-gold/80 font-semibold">Área livre</p>
            <p className="text-[10px] text-white/40 mt-0.5">
              pos. {richTooltip.emptyCell.gx},{richTooltip.emptyCell.gy}
            </p>
            <p className="text-[10px] text-white/30 mt-1">↖ Arraste para selecionar</p>
          </div>
        )}

        {/* ── Painel de seleção ── */}
        {selection && !selOccupied && (() => {
          const pos = getSelectionScreenPos(selection)
          if (!pos) return null
          const centerX  = (pos.left + pos.right) / 2
          const spaceBelow = window.innerHeight - pos.bottom
          const goAbove  = spaceBelow < 80
          return (
            <div
              className="fixed z-50 flex items-center gap-3 rounded-2xl border border-gold/30 bg-dark-2/95 px-5 py-3 backdrop-blur-md shadow-2xl"
              style={{
                left:       `${centerX}px`,
                top:        goAbove ? undefined : `${pos.bottom + 12}px`,
                bottom:     goAbove ? `${window.innerHeight - pos.top + 12}px` : undefined,
                transform:  `translateX(-50%) translateY(${selAnimated ? '0px' : '8px'})`,
                opacity:    selAnimated ? 1 : 0,
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
            >
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
                <p className="font-display text-xl text-gold">R${selPrice.replace('.', ',')}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide">único</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <button onClick={handleBuySelection} className="btn-gold px-4 py-2 text-sm font-bold">
                Garantir esse espaço →
              </button>
              <button onClick={clearSelection} className="text-white/30 hover:text-white/60 text-lg leading-none">
                ✕
              </button>
            </div>
          )
        })()}

        {/* ── Área ocupada ── */}
        {selection && selOccupied && (() => {
          const pos = getSelectionScreenPos(selection)
          if (!pos) return null
          const centerX = (pos.left + pos.right) / 2
          return (
            <div
              className="fixed z-50 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-dark-2/95 px-5 py-3 backdrop-blur-md"
              style={{ left: `${centerX}px`, top: `${pos.bottom + 12}px`, transform: 'translateX(-50%)' }}
            >
              <p className="text-sm text-red-400">⚠️ Área ocupada — selecione outro espaço</p>
              <button onClick={clearSelection} className="text-white/30 hover:text-white/60">✕</button>
            </div>
          )
        })()}

        {/* ── Botões de zoom ── */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
          {['+', '−', '⊡'].map((l) => (
            <button key={l}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-dark-2/90 text-sm text-white/50 hover:text-white backdrop-blur-sm"
            >
              {l}
            </button>
          ))}
        </div>

        {/* ── Dica mobile ── */}
        <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1.5 text-[10px] text-white/40 backdrop-blur-sm md:hidden">
          Toque e arraste para selecionar
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between text-xs text-white/25">
        <span>{stats.sold.toLocaleString('pt-BR')} / 1.000.000 pixels vendidos</span>
        <span>{stats.available.toLocaleString('pt-BR')} disponíveis</span>
      </div>

      {/* Popup do bloco */}
      {selectedBlock && (
        <BlockPopup block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}
    </div>
  )
}