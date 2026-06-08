'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { NICHE_LABELS, NICHE_COLORS } from '@/types'
import type { CustomLink } from '@/types'

const NICHE_OPTIONS = Object.entries(NICHE_LABELS) as [string, string][]

interface Block {
  id:              string
  instagramHandle: string
  displayName:     string
  niche:           string
  city:            string | null
  followers:       string | null
  bio:             string | null
  videoUrl:        string | null
  websiteUrl:      string | null
  avatarUrl:       string | null
  colorHex:        string
  pixelX:          number
  pixelY:          number
  pixelWidth:      number
  pixelHeight:     number
  pixelCount:      number
  whatsappUrl?:    string | null
  youtubeUrl?:     string | null
  tiktokUrl?:      string | null
  twitterUrl?:     string | null
  facebookUrl?:    string | null
  kwaiUrl?:        string | null
  onlyfansUrl?:    string | null
  spotifyUrl?:     string | null
}

interface Props {
  block:               Block
  token:               string
  initialCustomLinks:  CustomLink[]
}

// Mini canvas preview
function BlockPreview({ block, handle, niche, avatarUrl }: {
  block: Block; handle: string; niche: string; avatarUrl: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef    = useRef<HTMLImageElement | null>(null)
  const color     = NICHE_COLORS[niche as keyof typeof NICHE_COLORS] || block.colorHex || '#E1306C'

  useEffect(() => {
    if (avatarUrl) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload  = () => { imgRef.current = img; draw() }
      img.onerror = () => { imgRef.current = null; draw() }
      img.src = avatarUrl
    } else {
      imgRef.current = null
      draw()
    }
  }, [avatarUrl])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height

    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, W, H)

    const p = W * 0.1
    const bx = p, by = p, bw = W - p * 2, bh = H - p * 2

    ctx.shadowColor = color + '66'
    ctx.shadowBlur  = 12
    ctx.fillStyle   = color + '33'
    ctx.fillRect(bx, by, bw, bh)
    ctx.shadowBlur  = 0

    if (imgRef.current) {
      ctx.save()
      ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip()
      ctx.globalAlpha = 0.4
      ctx.drawImage(imgRef.current, bx, by, bw, bh)
      ctx.restore()
    }

    ctx.strokeStyle = color
    ctx.lineWidth   = 1.5
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2)

    if (handle && bw > 30) {
      const fs = Math.min(bw * 0.12, 11)
      ctx.save()
      ctx.globalAlpha  = 0.9
      ctx.fillStyle    = '#fff'
      ctx.font         = `bold ${fs}px Inter,sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      const txt = '@' + handle
      ctx.fillText(txt.length > 10 ? txt.slice(0, 9) + '…' : txt, bx + bw / 2, by + bh / 2)
      ctx.restore()
    }
  }

  useEffect(() => { draw() }, [handle, niche, color])

  return (
    <canvas ref={canvasRef} width={160} height={160}
      className="w-full rounded-xl" style={{ aspectRatio: '1', display: 'block' }} />
  )
}

export function PainelClient({ block, token, initialCustomLinks }: Props) {
  const [form, setForm] = useState({
    displayName:  block.displayName,
    niche:        block.niche,
    city:         block.city         || '',
    followers:    block.followers    || '',
    bio:          block.bio          || '',
    videoUrl:     block.videoUrl     || '',
    avatarUrl:    block.avatarUrl    || '',
    websiteUrl:   block.websiteUrl   || '',
    whatsappUrl:  block.whatsappUrl  || '',
    youtubeUrl:   block.youtubeUrl   || '',
    tiktokUrl:    block.tiktokUrl    || '',
    twitterUrl:   block.twitterUrl   || '',
    facebookUrl:  block.facebookUrl  || '',
    kwaiUrl:      block.kwaiUrl      || '',
    onlyfansUrl:  block.onlyfansUrl  || '',
    spotifyUrl:   block.spotifyUrl   || '',
  })

  const [customLinks, setCustomLinks] = useState<CustomLink[]>(initialCustomLinks)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')
  const [tab,         setTab]         = useState<'perfil' | 'redes' | 'links'>('perfil')

  const setField = useCallback((k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
  }, [])

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/painel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, ...form, customLinks }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Erro de conexão.')
    } finally {
      setSaving(false)
    }
  }

  function addCustomLink() {
    if (customLinks.length >= 6) return
    setCustomLinks(prev => [...prev, { label: '', url: '', emoji: '🔗' }])
  }
  function removeCustomLink(i: number) {
    setCustomLinks(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateCustomLink(i: number, field: keyof CustomLink, value: string) {
    setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/influencer/${block.instagramHandle}`
  const color = NICHE_COLORS[form.niche as keyof typeof NICHE_COLORS] || block.colorHex

  return (
    <div className="space-y-5">

      {/* Info do bloco */}
      <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-dark-2 p-4">
        <div className="w-24 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-dark-3">
          <BlockPreview
            block={block}
            handle={block.instagramHandle}
            niche={form.niche}
            avatarUrl={form.avatarUrl}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">@{block.instagramHandle}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {block.pixelWidth}×{block.pixelHeight}px · {block.pixelCount.toLocaleString('pt-BR')} pixels
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            Posição: {block.pixelX},{block.pixelY} no mapa
          </p>
          <div className="mt-2 flex gap-2">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1 text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,215,0,0.15)', border: '0.5px solid rgba(255,215,0,0.3)', color: '#FFD700' }}
            >
              Ver minha página ↗
            </a>
            <Link
              href={`/?highlight=${block.instagramHandle}`}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/50 hover:text-white/80"
            >
              Ver no mapa ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Link da bio */}
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
        <p className="text-xs font-bold text-gold mb-1">🔗 Seu link para a bio do Instagram</p>
        <div className="flex items-center gap-2 mt-2">
          <code className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70 truncate">
            {profileUrl}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(profileUrl)}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white transition-colors"
          >
            copiar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-dark-2 p-1">
        {(['perfil', 'redes', 'links'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'perfil' ? 'Perfil' : t === 'redes' ? 'Redes sociais' : 'Links'}
          </button>
        ))}
      </div>

      {/* Tab: Perfil */}
      {tab === 'perfil' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Nome de exibição</label>
              <input type="text" value={form.displayName}
                onChange={e => setField('displayName', e.target.value)}
                className="input-dark" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Nicho</label>
              <select value={form.niche} onChange={e => setField('niche', e.target.value)} className="select-dark">
                {NICHE_OPTIONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Cidade</label>
              <input type="text" value={form.city}
                onChange={e => setField('city', e.target.value)}
                placeholder="São Paulo, SP" className="input-dark" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Seguidores</label>
              <input type="text" value={form.followers}
                onChange={e => setField('followers', e.target.value)}
                placeholder="ex: 50k" className="input-dark" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">
              Bio curta <span className="font-normal opacity-50">({form.bio.length}/120)</span>
            </label>
            <textarea value={form.bio} onChange={e => setField('bio', e.target.value)}
              maxLength={120} rows={2} className="input-dark resize-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">Foto / Avatar (URL)</label>
            <input type="url" value={form.avatarUrl}
              onChange={e => setField('avatarUrl', e.target.value)}
              placeholder="https://..." className="input-dark" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">Vídeo de apresentação</label>
            <input type="url" value={form.videoUrl}
              onChange={e => setField('videoUrl', e.target.value)}
              placeholder="YouTube, Reels, TikTok..." className="input-dark" />
          </div>
        </div>
      )}

      {/* Tab: Redes */}
      {tab === 'redes' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 mb-1">
            <p className="text-xs font-bold text-gold mb-0.5">💰 WhatsApp para receber propostas</p>
            <p className="text-[11px] text-white/40">Marcas clicam em "Anunciar" e vão direto para cá.</p>
            <div className="flex overflow-hidden rounded-xl border border-white/10 mt-2 focus-within:border-gold/40">
              <span className="flex items-center bg-white/4 px-3 text-sm">📱</span>
              <input type="tel" value={form.whatsappUrl}
                onChange={e => setField('whatsappUrl', e.target.value)}
                placeholder="(11) 99999-9999" className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none" />
            </div>
          </div>
          {([
            { key: 'youtubeUrl',  label: 'YouTube',    color: '#ff0000', placeholder: 'https://youtube.com/@seucanal',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
            { key: 'tiktokUrl',   label: 'TikTok',     color: '#ffffff', placeholder: 'https://tiktok.com/@seuarroba',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg> },
            { key: 'twitterUrl',  label: 'X / Twitter', color: '#ffffff', placeholder: 'https://x.com/seuarroba',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { key: 'facebookUrl', label: 'Facebook',   color: '#1877f2', placeholder: 'https://facebook.com/suapagina',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            { key: 'kwaiUrl',     label: 'Kwai',       color: '#ff8c00', placeholder: 'https://kwai.com/@seuarroba',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 10.5l-6 3.5V9l6 3.5z"/></svg> },
            { key: 'onlyfansUrl', label: 'OnlyFans',   color: '#00aeef', placeholder: 'https://onlyfans.com/seuarroba',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg> },
            { key: 'spotifyUrl',  label: 'Spotify',    color: '#1ed760', placeholder: 'https://open.spotify.com/...',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
          ] as const).map(s => (
            <div key={s.key} className="flex overflow-hidden rounded-xl border border-white/8 focus-within:border-white/20">
              <span className="flex w-9 items-center justify-center shrink-0" style={{ background: s.color + '22', color: s.color }}>
                {s.icon}
              </span>
              <input type="url" value={(form as any)[s.key] || ''}
                onChange={e => setField(s.key as any, e.target.value)}
                placeholder={s.placeholder}
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none" />
            </div>
          ))}
        </div>
      )}

      {/* Tab: Links */}
      {tab === 'links' && (
        <div className="space-y-3">
          <p className="text-xs text-white/40">Adicione links livres — loja, curso, mídia kit, portfólio...</p>
          {customLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={link.emoji ?? '🔗'}
                onChange={e => updateCustomLink(i, 'emoji', e.target.value)}
                className="w-10 rounded-lg border border-white/8 bg-transparent px-2 py-2.5 text-center text-sm text-white outline-none focus:border-white/20"
                maxLength={2} />
              <input type="text" value={link.label}
                onChange={e => updateCustomLink(i, 'label', e.target.value)}
                placeholder="Nome do link"
                className="flex-1 rounded-lg border border-white/8 bg-transparent px-2.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-white/20" />
              <input type="url" value={link.url}
                onChange={e => updateCustomLink(i, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-white/8 bg-transparent px-2.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-white/20" />
              <button type="button" onClick={() => removeCustomLink(i)}
                className="text-white/30 hover:text-red-400 text-sm px-1">✕</button>
            </div>
          ))}
          {customLinks.length < 6 && (
            <button type="button" onClick={addCustomLink}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-3 text-xs text-white/30 hover:border-white/30 hover:text-white/50 transition-all">
              + Adicionar link
            </button>
          )}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-2xl py-4 text-sm font-bold transition-all disabled:opacity-50"
        style={{ background: saved ? '#22c55e' : '#FFD700', color: '#111' }}
      >
        {saving ? 'Salvando...' : saved ? '✓ Salvo com sucesso!' : 'Salvar alterações'}
      </button>

      <p className="text-center text-xs text-white/20">
        Alterações aparecem no mapa em até 5 minutos.
      </p>
    </div>
  )
}
