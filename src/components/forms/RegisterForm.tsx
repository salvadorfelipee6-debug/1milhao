'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { GridStats, Niche } from '@/types'
import { NICHE_LABELS, PIXEL_PRICE } from '@/types'
import { ImageUpload } from './ImageUpload'

const MIN_PIXELS  = 1
const MAX_PIXELS  = 1000000

const NICHE_COLORS: Record<string, string> = {
  fitness:     '#FF6B35',
  moda:        '#E1306C',
  tecnologia:  '#405DE6',
  gastronomia: '#FCAF45',
  beleza:      '#C13584',
  viagens:     '#00B4D8',
  games:       '#7B2FBE',
  financas:    '#2EC4B6',
  outros:      '#888888',
}

interface RegisterFormProps { stats: GridStats }

function calcDims(n: number) {
  const side = Math.max(1, Math.round(Math.sqrt(n)))
  return { width: side, height: side, actual: side * side }
}

// ─── Mini preview canvas ──────────────────────────────────────
function BlockPreview({
  width, height, handle, niche, avatarUrl, color,
}: {
  width: number; height: number; handle: string
  niche: string; avatarUrl: string; color: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef    = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (avatarUrl) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload  = () => { imgRef.current = img; render() }
      img.onerror = () => { imgRef.current = null; render() }
      img.src = avatarUrl
    } else {
      imgRef.current = null
      render()
    }
  }, [avatarUrl])

  function render() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Fundo do "grid" simulado
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, W, H)

    // Células ao redor (contexto)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth   = 0.5
    const cellSize  = W / 30
    for (let x = 0; x < W; x += cellSize * 3) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y < H; y += cellSize * 3) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // Bloco principal centralizado
    const padding = W * 0.12
    const bx = padding, by = padding
    const bw = W - padding * 2, bh = H - padding * 2

    // Sombra
    ctx.shadowColor = color + '66'
    ctx.shadowBlur  = 14

    // Fill
    ctx.fillStyle = color + '33'
    ctx.fillRect(bx, by, bw, bh)
    ctx.shadowBlur = 0

    // Avatar
    if (imgRef.current) {
      ctx.save()
      ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip()
      ctx.globalAlpha = 0.4
      ctx.drawImage(imgRef.current, bx, by, bw, bh)
      ctx.restore()
    }

    // Borda
    ctx.strokeStyle = color
    ctx.lineWidth   = 1.5
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2)

    // Handle text
    if (handle && bw > 40) {
      const fs = Math.min(bw * 0.12, 11)
      ctx.save()
      ctx.globalAlpha  = 0.9
      ctx.fillStyle    = '#fff'
      ctx.font         = `bold ${fs}px Inter,sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      const text = '@' + handle
      const maxLen = Math.floor(bw / (fs * 0.6))
      ctx.fillText(
        text.length > maxLen ? text.slice(0, maxLen) + '…' : text,
        bx + bw / 2, by + bh / 2
      )
      ctx.restore()
    }

    // Tamanho
    ctx.fillStyle    = 'rgba(255,255,255,0.25)'
    ctx.font         = `${Math.min(8, W * 0.06)}px Inter,sans-serif`
    ctx.textAlign    = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${width}×${height}px`, W - 4, H - 3)
  }

  useEffect(() => { render() }, [width, height, handle, niche, color])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="w-full rounded-xl"
      style={{ aspectRatio: '1', display: 'block' }}
    />
  )
}

// ─── Componente principal ─────────────────────────────────────
export function RegisterForm({ stats }: RegisterFormProps) {
  const searchParams = useSearchParams()

  // Lê params da seleção do grid
  const gridPixels = searchParams.get('pixels') ? Number(searchParams.get('pixels')) : null
  const gridX      = searchParams.get('x')
  const gridY      = searchParams.get('y')
  const gridW      = searchParams.get('w')
  const gridH      = searchParams.get('h')

  // Se já escolheu o espaço (seleção no mapa ou card de preço), pula direto pro perfil
  const [step,     setStep]     = useState<1 | 2 | 3>(
    (gridW && gridH) || gridPixels ? 2 : 1
  )
  const [pixels,   setPixels]   = useState(gridPixels ?? 400)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [provider, setProvider] = useState<'stripe' | 'mercadopago'>('mercadopago')

  const [form, setForm] = useState({
    instagramHandle: '',
    displayName:     '',
    niche:           '' as Niche | '',
    city:            '',
    followers:       '',
    bio:             '',
    videoUrl:        '',
    avatarUrl:       '',
    email:           '',
    websiteUrl:      '',
    whatsappUrl:     '',
    youtubeUrl:      '',
    tiktokUrl:       '',
    twitterUrl:      '',
    facebookUrl:     '',
    kwaiUrl:         '',
    onlyfansUrl:     '',
    spotifyUrl:      '',
  })

  const [customLinks, setCustomLinks] = useState<{ label: string; url: string; emoji: string }[]>([])

  function addCustomLink() {
    if (customLinks.length >= 6) return
    setCustomLinks(prev => [...prev, { label: '', url: '', emoji: '🔗' }])
  }
  function removeCustomLink(i: number) {
    setCustomLinks(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateCustomLink(i: number, field: 'label' | 'url' | 'emoji', value: string) {
    setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  const setField = useCallback((k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
  }, [])

  // ─── Pré-preenchimento pelo @ ────────────────────────────
  const [avatarLookup, setAvatarLookup] = useState<'idle' | 'loading' | 'done'>('idle')

  // Ao sair do campo @: busca a foto do perfil (unavatar.io) e sugere o nome
  function prefillFromHandle() {
    const handle = form.instagramHandle.replace('@', '').trim().toLowerCase()
    if (!handle) return
    if (!form.displayName.trim()) {
      setField('displayName', handle.charAt(0).toUpperCase() + handle.slice(1))
    }
    if (form.avatarUrl || avatarLookup !== 'idle') return
    setAvatarLookup('loading')
    const url = `https://unavatar.io/instagram/${encodeURIComponent(handle)}?fallback=false`
    const img = new window.Image()
    img.onload  = () => { setField('avatarUrl', url); setAvatarLookup('done') }
    img.onerror = () => setAvatarLookup('done')
    img.src = url
  }

  // Dimensões — se veio do grid usa w×h, senão calcula
  const dims = gridW && gridH
    ? { width: Number(gridW), height: Number(gridH), actual: Number(gridW) * Number(gridH) }
    : calcDims(pixels)

  const price     = (dims.actual * PIXEL_PRICE).toFixed(2)
  const blockColor = form.niche ? (NICHE_COLORS[form.niche] ?? '#E1306C') : '#FFD700'

  // ─── Validação por step ──────────────────────────────────
  function canGoStep2() {
    return dims.actual >= MIN_PIXELS
  }
  function canGoStep3() {
    return (
      form.instagramHandle.trim().length > 0 &&
      form.displayName.trim().length > 0 &&
      form.niche !== '' &&
      form.email.includes('@')
    )
  }

  // ─── Submit ──────────────────────────────────────────────
  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          instagramHandle: form.instagramHandle.replace('@', '').toLowerCase(),
          pixelCount:      dims.actual,
          pixelX:          gridX ? Number(gridX) : undefined,
          pixelY:          gridY ? Number(gridY) : undefined,
          pixelWidth:      gridW ? Number(gridW) : undefined,
          pixelHeight:     gridH ? Number(gridH) : undefined,
          paymentProvider: provider,
          customLinks:     customLinks.filter(l => l.label && l.url),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro desconhecido.'); return }
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
      else if (data.initPoint) window.location.href = data.initPoint
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Steps ───────────────────────────────────────────────
  const stepLabels = ['Espaço', 'Perfil', 'Pagamento']

  return (
    <div className="space-y-6">

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const s = (i + 1) as 1 | 2 | 3
          const active   = step === s
          const done     = step > s
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => done && setStep(s)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  active ? 'bg-gold text-dark'
                  : done  ? 'bg-gold/30 text-gold cursor-pointer'
                  :         'bg-white/8 text-white/55'
                }`}
              >
                {done ? '✓' : s}
              </button>
              <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-white/55'}`}>
                {label}
              </span>
              {i < 2 && <div className={`h-px flex-1 ${step > s ? 'bg-gold/40' : 'bg-white/8'}`} />}
            </div>
          )
        })}
      </div>

      {/* ── STEP 1: Espaço ── */}
      {step === 1 && (
        <div className="space-y-4">

          {/* Preview + calculadora lado a lado */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/55">
                Preview do bloco
              </p>
              <div className="overflow-hidden rounded-xl border border-white/8 bg-dark-2">
                <BlockPreview
                  width={dims.width}
                  height={dims.height}
                  handle={form.instagramHandle || 'seuarroba'}
                  niche={form.niche}
                  avatarUrl={form.avatarUrl}
                  color={blockColor}
                />
              </div>
              <p className="mt-1.5 text-center text-[10px] text-white/50">
                {dims.width}×{dims.height} px
              </p>
            </div>

            <div className="col-span-3 space-y-4">
              <div className="card-dark rounded-2xl p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/55">
                  {gridW && gridH
                    ? '✅ Área selecionada no grid'
                    : 'Quantos pixels você quer?'}
                </p>

                {gridW && gridH ? (
                  <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-center">
                    <p className="font-display text-2xl text-gold">{dims.width}×{dims.height}</p>
                    <p className="text-xs text-white/65">pixels selecionados no mapa</p>
                  </div>
                ) : (
                  <>
                    <input
                      type="range"
                      min={1}
                      max={Math.min(MAX_PIXELS, stats.available)}
                      step={1}
                      value={pixels}
                      onChange={e => setPixels(Number(e.target.value))}
                      className="w-full accent-pink"
                    />
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        { label: '1px',      n: 1 },
                        { label: '100px',    n: 100 },
                        { label: '400px',    n: 400 },
                        { label: '900px',    n: 900 },
                        { label: '2.500px',  n: 2500 },
                        { label: '10.000px', n: 10000 },
                      ].map(pkg => (
                        <button key={pkg.n} type="button" onClick={() => setPixels(pkg.n)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            pixels === pkg.n
                              ? 'bg-pink text-white'
                              : 'border border-white/10 text-white/65 hover:border-white/20 hover:text-white/70'
                          }`}
                        >
                          {pkg.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-white/4 py-2">
                    <p className="font-display text-xl text-white">
                      {dims.actual.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-white/55">pixels</p>
                  </div>
                  <div className="rounded-xl bg-gold/8 py-2">
                    <p className="font-display text-xl text-gold">
                      R${price.replace('.', ',')}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-white/55">pagamento único</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => canGoStep2() && setStep(2)}
            disabled={!canGoStep2()}
            className="btn-gold w-full py-3.5 text-sm disabled:opacity-40"
          >
            Continuar → Montar perfil
          </button>
        </div>
      )}

      {/* ── STEP 2: Perfil ── */}
      {step === 2 && (
        <div className="space-y-4">

          <div className="grid grid-cols-5 gap-4">
            {/* Preview ao vivo */}
            <div className="col-span-2 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
                Preview ao vivo
              </p>
              <div className="overflow-hidden rounded-xl border border-white/8 bg-dark-2">
                <BlockPreview
                  width={dims.width}
                  height={dims.height}
                  handle={form.instagramHandle || 'seuarroba'}
                  niche={form.niche}
                  avatarUrl={form.avatarUrl}
                  color={blockColor}
                />
              </div>
              {/* Mini popup preview */}
              {(form.instagramHandle || form.displayName) && (
                <div className="rounded-xl border border-white/8 bg-dark-2 p-2.5 text-[11px]">
                  <p className="font-bold text-white truncate">
                    @{form.instagramHandle || 'seuarroba'}
                  </p>
                  {form.niche && (
                    <p className="text-white/65" style={{ color: blockColor + 'bb' }}>
                      {NICHE_LABELS[form.niche as Niche]}
                    </p>
                  )}
                  {form.bio && (
                    <p className="mt-1 text-white/60 leading-relaxed line-clamp-2">{form.bio}</p>
                  )}
                </div>
              )}
            </div>

            {/* Campos */}
            <div className="col-span-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-white/70">
                    @ Instagram <span className="text-pink">*</span>
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-white/8 focus-within:border-white/20">
                    <span className="flex items-center bg-white/4 px-2.5 text-sm text-white/55">@</span>
                    <input
                      type="text"
                      value={form.instagramHandle}
                      onChange={e => { setField('instagramHandle', e.target.value); setAvatarLookup('idle') }}
                      onBlur={prefillFromHandle}
                      placeholder="seuarroba"
                      className="flex-1 bg-transparent px-2.5 py-2.5 text-sm text-white placeholder-white/35 outline-none"
                    />
                  </div>
                  {avatarLookup === 'loading' && (
                    <p className="mt-1 text-[10px] text-gold/80">Buscando sua foto de perfil…</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-white/70">
                    Nome <span className="text-pink">*</span>
                  </label>
                  <input type="text" value={form.displayName}
                    onChange={e => setField('displayName', e.target.value)}
                    placeholder="Seu nome ou marca" className="input-dark" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-white/70">
                    Nicho <span className="text-pink">*</span>
                  </label>
                  <select value={form.niche} onChange={e => setField('niche', e.target.value)} className="select-dark">
                    <option value="">Selecione...</option>
                    {Object.entries(NICHE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-white/70">Cidade</label>
                  <input type="text" value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    placeholder="São Paulo, SP" className="input-dark" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-white/70">Seguidores</label>
                <input type="text" value={form.followers}
                  onChange={e => setField('followers', e.target.value)}
                  placeholder="ex: 50k, 1.2M" className="input-dark" />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-white/70">
                  Bio curta
                  <span className="ml-1.5 font-normal opacity-50">({form.bio.length}/120)</span>
                </label>
                <textarea value={form.bio} onChange={e => setField('bio', e.target.value)}
                  placeholder="Aparece no popup quando clicam no seu bloco..."
                  className="input-dark resize-none" rows={2} maxLength={120} />
              </div>

              <ImageUpload value={form.avatarUrl} onChange={v => setField('avatarUrl', v)} />

              {/* WhatsApp para anunciantes */}
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">💰</span>
                  <div>
                    <label className="block text-xs font-bold text-gold mb-0.5">
                      WhatsApp para receber propostas
                    </label>
                    <p className="text-[11px] text-white/65 leading-relaxed">
                      Quando uma marca clicar em <strong className="text-white/60">"Anunciar"</strong> no seu bloco, ela será direcionada direto para o seu WhatsApp. Coloque seu número com DDD.
                    </p>
                  </div>
                </div>
                <div className="flex overflow-hidden rounded-xl border border-white/10 focus-within:border-gold/40">
                  <span className="flex items-center bg-white/4 px-3 text-sm">📱</span>
                  <input
                    type="tel"
                    value={(form as any).whatsappUrl || ''}
                    onChange={e => setField('whatsappUrl' as any, e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none"
                  />
                </div>
              </div>

              {/* Redes sociais */}
              <div className="rounded-xl border border-white/8 bg-white/2 p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/65">
                    Suas redes sociais
                  </label>
                  <span className="text-[10px] text-white/50">opcional</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed mb-2">
                  Aparecem como botões no seu perfil. Marcas e seguidores clicam diretamente. Cole o link completo de cada perfil.
                </p>
                {([
                  { key: 'youtubeUrl',  label: 'YouTube',     placeholder: 'https://youtube.com/@seucanal',  color: '#ff0000',
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                  { key: 'tiktokUrl',   label: 'TikTok',       placeholder: 'https://tiktok.com/@seuarroba',  color: '#ffffff',
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg> },
                  { key: 'twitterUrl',  label: 'X / Twitter',  placeholder: 'https://x.com/seuarroba',        color: '#ffffff',
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { key: 'facebookUrl', label: 'Facebook',     placeholder: 'https://facebook.com/suapagina', color: '#1877f2',
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { key: 'kwaiUrl',     label: 'Kwai',         placeholder: 'https://kwai.com/@seuarroba',    color: '#ff8c00',
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 10.5l-6 3.5V9l6 3.5z"/></svg> },
                  { key: 'onlyfansUrl', label: 'OnlyFans',     placeholder: 'https://onlyfans.com/seuarroba', color: '#00aeef',
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg> },
                  { key: 'spotifyUrl',  label: 'Spotify',      placeholder: 'https://open.spotify.com/...',   color: '#1ed760',
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
                ] as const).map(s => (
                  <div key={s.key} className="flex overflow-hidden rounded-lg border border-white/8 focus-within:border-white/20">
                    <span
                      className="flex w-9 items-center justify-center shrink-0"
                      style={{ background: s.color + '22', color: s.color }}
                    >
                      {s.svg}
                    </span>
                    <input
                      type="url"
                      value={(form as any)[s.key] || ''}
                      onChange={e => setField(s.key as any, e.target.value)}
                      placeholder={s.placeholder}
                      className="flex-1 bg-transparent px-2.5 py-2 text-xs text-white placeholder-white/35 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-white/70">Mídia kit / site (opcional)</label>
                <input type="url" value={form.websiteUrl}
                  onChange={e => setField('websiteUrl', e.target.value)}
                  placeholder="Link do seu mídia kit ou site pessoal..." className="input-dark" />
              </div>

              {/* Links personalizados */}
              <div className="rounded-xl border border-white/8 bg-white/2 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/65">
                      Links personalizados
                    </label>
                    <p className="text-[11px] text-white/55 mt-0.5">Loja, curso, mídia kit, portfólio, WhatsApp...</p>
                  </div>
                  <span className="text-[10px] text-white/50">{customLinks.length}/6</span>
                </div>

                {customLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={link.emoji}
                      onChange={e => updateCustomLink(i, 'emoji', e.target.value)}
                      placeholder="🔗"
                      className="w-10 rounded-lg border border-white/8 bg-transparent px-2 py-2 text-center text-sm text-white outline-none focus:border-white/20"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      value={link.label}
                      onChange={e => updateCustomLink(i, 'label', e.target.value)}
                      placeholder="Nome do link"
                      className="flex-1 rounded-lg border border-white/8 bg-transparent px-2.5 py-2 text-xs text-white placeholder-white/35 outline-none focus:border-white/20"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={e => updateCustomLink(i, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 rounded-lg border border-white/8 bg-transparent px-2.5 py-2 text-xs text-white placeholder-white/35 outline-none focus:border-white/20"
                    />
                    <button type="button" onClick={() => removeCustomLink(i)}
                      className="text-white/55 hover:text-red-400 text-sm">✕</button>
                  </div>
                ))}

                {customLinks.length < 6 && (
                  <button type="button" onClick={addCustomLink}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 py-2 text-xs text-white/55 hover:border-white/30 hover:text-white/70 transition-all">
                    + Adicionar link
                  </button>
                )}
              </div>

              {/* Mensagem de incentivo — link na bio */}
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-sm font-bold text-gold">Use como link na bio do Instagram!</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/70">
                      Após garantir seu espaço, você terá uma página profissional em{' '}
                      <span className="text-white/70 font-semibold">1milhao.com.br/influencer/seuarroba</span>{' '}
                      com todas as suas redes, links e botão de contato para marcas.{' '}
                      <span className="text-gold/80">Substitua o Linktree de vez.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)}
              className="btn-ghost flex-1 py-3 text-sm">
              ← Voltar
            </button>
            <button type="button" onClick={() => canGoStep3() && setStep(3)}
              disabled={!canGoStep3()}
              className="btn-gold flex-[3] py-3.5 text-sm disabled:opacity-40">
              Continuar → Pagamento
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Pagamento ── */}
      {step === 3 && (
        <div className="space-y-4">

          {/* Resumo do pedido */}
          <div className="card-dark rounded-2xl p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/55">
              Resumo do pedido
            </p>
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-dark-2">
                <BlockPreview
                  width={dims.width}
                  height={dims.height}
                  handle={form.instagramHandle}
                  niche={form.niche}
                  avatarUrl={form.avatarUrl}
                  color={blockColor}
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold text-white">@{form.instagramHandle}</p>
                <p className="text-sm text-white/65">
                  {form.displayName}
                  {form.niche && ` · ${NICHE_LABELS[form.niche as Niche]}`}
                </p>
                <p className="text-sm text-white/65">
                  {dims.width}×{dims.height} px · {dims.actual.toLocaleString('pt-BR')} pixels
                  {gridX && gridY && ` · posição (${gridX},${gridY})`}
                </p>
                <p className="font-display text-lg text-gold">
                  R${price.replace('.', ',')}
                  <span className="ml-2 text-xs font-normal text-white/55">pagamento único · vitalício</span>
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="card-dark rounded-2xl p-5">
            <label className="mb-1.5 block text-xs font-semibold text-white/70">
              Seu e-mail <span className="text-pink">*</span>
            </label>
            <input type="email" value={form.email}
              onChange={e => setField('email', e.target.value)}
              placeholder="seuemail@exemplo.com" className="input-dark" required />
            <p className="mt-1.5 text-[11px] text-white/50">
              Você receberá o link de edição do seu bloco por aqui.
            </p>
          </div>

          {/* Forma de pagamento */}
          <div className="card-dark rounded-2xl p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
              Forma de pagamento
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'mercadopago', label: 'Pix / Cartão BR', sub: 'Mercado Pago', icon: '🇧🇷' },
                { id: 'stripe',      label: 'Cartão Global',    sub: 'Stripe',        icon: '💳' },
              ] as const).map(opt => (
                <button key={opt.id} type="button" onClick={() => setProvider(opt.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    provider === opt.id
                      ? 'border-gold/40 bg-gold/5'
                      : 'border-white/8 hover:border-white/15'
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <p className="mt-1 text-xs font-bold text-white">{opt.label}</p>
                  <p className="text-[10px] text-white/55">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1 py-3 text-sm">
              ← Voltar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !form.email}
              className="btn-gold flex-[3] py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Processando...'
                : `Pagar R$${price.replace('.', ',')} e garantir espaço →`}
            </button>
          </div>

          <p className="text-center text-xs text-white/45">
            Pagamento único · Vitalício · Sem renovação.<br />
            Ao continuar você concorda com os{' '}
            <a href="/termos" className="underline hover:text-white/65">termos de uso</a>.
          </p>
        </div>
      )}
    </div>
  )
}