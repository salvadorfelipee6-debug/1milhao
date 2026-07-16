'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { NICHE_LABELS, NICHE_COLORS, NICHE_EMOJI } from '@/types'
import type { CustomLink } from '@/types'
import { ImageUpload } from '@/components/forms/ImageUpload'
import { CityAutocomplete } from '@/components/forms/CityAutocomplete'
import { VitrinePreviewModal } from './VitrinePreviewModal'

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

interface Stats {
  views:            number
  advertiseClicks:  number
  shares:           number
  socialClicks:     { key: string; count: number }[]
  customLinkClicks: { index: number; count: number }[]
}

interface ProposalItem {
  id:               string
  message:          string
  budget:           string | null
  campaignType:     string | null
  deadline:         string | null
  status:           string
  sentAt:           string | Date
  companyName:      string
  segment:          string | null
  contactName:      string
  contactEmail:     string
  contactWhatsapp:  string | null
}

interface Props {
  block:               Block
  token:               string
  initialCustomLinks:  CustomLink[]
  stats:               Stats
  initialProposals:    ProposalItem[]
}

const SOCIAL_LABELS: Record<string, string> = {
  instagramUrl: 'Instagram',
  youtubeUrl:   'YouTube',
  tiktokUrl:    'TikTok',
  twitterUrl:   'X / Twitter',
  facebookUrl:  'Facebook',
  kwaiUrl:      'Kwai',
  onlyfansUrl:  'OnlyFans',
  spotifyUrl:   'Spotify',
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

export function PainelClient({ block, token, initialCustomLinks, stats, initialProposals }: Props) {
  const [proposals, setProposals] = useState<ProposalItem[]>(initialProposals)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  async function respond(id: string, status: 'accepted' | 'declined') {
    setRespondingId(id)
    try {
      const res = await fetch(`/api/proposals/${id}/respond`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, status }),
      })
      if (res.ok) {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      }
    } finally {
      setRespondingId(null)
    }
  }
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
  const [tab,         setTab]         = useState<'perfil' | 'redes' | 'links' | 'estatisticas' | 'propostas'>('perfil')
  const [previewOpen, setPreviewOpen] = useState(false)

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
          <p className="text-xs text-white/65 mt-0.5">
            {block.pixelWidth}×{block.pixelHeight}px · {block.pixelCount.toLocaleString('pt-BR')} pixels
          </p>
          <p className="text-xs text-white/55 mt-0.5">
            Posição: {block.pixelX},{block.pixelY} no mapa
          </p>
          <Link
            href={`/?highlight=${block.instagramHandle}`}
            className="mt-2 inline-block rounded-lg border border-white/10 px-3 py-1 text-xs text-white/70 hover:text-white/80"
          >
            Ver no mapa ↗
          </Link>
        </div>
      </div>

      {/* Vitrine 1M — explica o conceito e conecta o formulário à página pública */}
      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <p className="text-xs font-bold text-gold mb-1">✨ Sua Vitrine 1M</p>
        <p className="text-[11px] leading-relaxed text-white/65 mb-3">
          Tudo que você preenche aqui embaixo aparece nessa mini página — o seu "cartão de visitas" tipo Linktree — que abre quando alguém clica no link da sua bio.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70 truncate">
            {profileUrl}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(profileUrl)}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:text-white transition-colors"
          >
            copiar
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="rounded-lg py-2 text-xs font-bold transition-all"
            style={{ background: 'rgba(255,215,0,0.15)', border: '0.5px solid rgba(255,215,0,0.3)', color: '#FFD700' }}
          >
            👁 Ver prévia ao vivo
          </button>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 py-2 text-center text-xs text-white/70 hover:text-white/80"
          >
            Abrir página real ↗
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-dark-2 p-1">
        {(['perfil', 'redes', 'links', 'propostas', 'estatisticas'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-white/10 text-white' : 'text-white/65 hover:text-white/60'
            }`}
          >
            {t === 'perfil' ? 'Perfil' : t === 'redes' ? 'Redes' : t === 'links' ? 'Links' : t === 'propostas' ? '💼' : '📊'}
            {t === 'propostas' && proposals.filter(p => p.status === 'sent').length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-[#111]">
                {proposals.filter(p => p.status === 'sent').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Perfil */}
      {tab === 'perfil' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/70">Nome de exibição</label>
              <input type="text" value={form.displayName}
                onChange={e => setField('displayName', e.target.value)}
                className="input-dark" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/70">Nicho</label>
              <select value={form.niche} onChange={e => setField('niche', e.target.value)} className="select-dark">
                {NICHE_OPTIONS.map(([k, v]) => (
                  <option key={k} value={k}>{NICHE_EMOJI[k as keyof typeof NICHE_EMOJI]} {v}</option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-white/45">Define sua cor no mapa e seu ranking por categoria</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/70">Cidade</label>
              <CityAutocomplete value={form.city} onChange={v => setField('city', v)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/70">Seguidores</label>
              <input type="text" value={form.followers}
                onChange={e => setField('followers', e.target.value)}
                placeholder="ex: 50k" className="input-dark" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">
              Bio curta <span className="font-normal opacity-50">({form.bio.length}/120)</span>
            </label>
            <textarea value={form.bio} onChange={e => setField('bio', e.target.value)}
              maxLength={120} rows={2} className="input-dark resize-none" />
          </div>
          <ImageUpload value={form.avatarUrl} onChange={v => setField('avatarUrl', v)} />
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Vídeo de apresentação</label>
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
            <p className="text-[11px] text-white/65">Marcas clicam em "Anunciar" e vão direto para cá.</p>
            <div className="flex overflow-hidden rounded-xl border border-white/10 mt-2 focus-within:border-gold/40">
              <span className="flex items-center bg-white/4 px-3 text-sm">📱</span>
              <input type="tel" value={form.whatsappUrl}
                onChange={e => setField('whatsappUrl', e.target.value)}
                placeholder="(11) 99999-9999" className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none" />
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
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white placeholder-white/35 outline-none" />
            </div>
          ))}
        </div>
      )}

      {/* Tab: Links */}
      {tab === 'links' && (
        <div className="space-y-3">
          <p className="text-xs text-white/65">Adicione links livres — loja, curso, mídia kit, portfólio...</p>
          {customLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={link.emoji ?? '🔗'}
                onChange={e => updateCustomLink(i, 'emoji', e.target.value)}
                className="w-10 rounded-lg border border-white/8 bg-transparent px-2 py-2.5 text-center text-sm text-white outline-none focus:border-white/20"
                maxLength={2} />
              <input type="text" value={link.label}
                onChange={e => updateCustomLink(i, 'label', e.target.value)}
                placeholder="Nome do link"
                className="flex-1 rounded-lg border border-white/8 bg-transparent px-2.5 py-2.5 text-xs text-white placeholder-white/35 outline-none focus:border-white/20" />
              <input type="url" value={link.url}
                onChange={e => updateCustomLink(i, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-white/8 bg-transparent px-2.5 py-2.5 text-xs text-white placeholder-white/35 outline-none focus:border-white/20" />
              <button type="button" onClick={() => removeCustomLink(i)}
                className="text-white/55 hover:text-red-400 text-sm px-1">✕</button>
            </div>
          ))}
          {customLinks.length < 6 && (
            <button type="button" onClick={addCustomLink}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-3 text-xs text-white/55 hover:border-white/30 hover:text-white/70 transition-all">
              + Adicionar link
            </button>
          )}
        </div>
      )}

      {/* Tab: Propostas */}
      {tab === 'propostas' && (
        <div className="space-y-3">
          <p className="text-xs text-white/65">Briefings de marcas que querem falar com você.</p>

          {proposals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 py-8 text-center">
              <p className="text-sm text-white/65">Nenhuma proposta ainda.</p>
              <p className="mt-1 text-xs text-white/45">Quando uma marca enviar um briefing, aparece aqui.</p>
            </div>
          ) : (
            proposals.map(p => (
              <div key={p.id} className="rounded-xl border border-white/8 bg-dark-2 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{p.companyName}</p>
                    {p.segment && <p className="text-[11px] text-white/55">{p.segment}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    p.status === 'accepted' ? 'bg-green-500/15 text-green-400'
                    : p.status === 'declined' ? 'bg-red-500/15 text-red-400'
                    : p.status === 'sent' ? 'bg-gold/15 text-gold'
                    : 'bg-white/10 text-white/60'
                  }`}>
                    {p.status === 'accepted' ? 'Aceita' : p.status === 'declined' ? 'Recusada' : p.status === 'sent' ? 'Novo' : 'Lida'}
                  </span>
                </div>

                <div className="mb-2 flex flex-wrap gap-1.5 text-[11px]">
                  {p.campaignType && <span className="rounded-lg bg-white/5 px-2 py-1 text-white/70">{p.campaignType}</span>}
                  {p.budget       && <span className="rounded-lg bg-white/5 px-2 py-1 text-white/70">💰 {p.budget}</span>}
                  {p.deadline     && <span className="rounded-lg bg-white/5 px-2 py-1 text-white/70">⏰ {p.deadline}</span>}
                </div>

                <p className="mb-3 text-xs leading-relaxed text-white/70">{p.message}</p>

                {p.status === 'accepted' ? (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-xs">
                    <p className="mb-1 font-semibold text-green-400">Contato liberado</p>
                    <p className="text-white/70">{p.contactName} · {p.contactEmail}</p>
                    {p.contactWhatsapp && <p className="text-white/70">WhatsApp: {p.contactWhatsapp}</p>}
                  </div>
                ) : p.status === 'declined' ? (
                  <p className="text-xs text-white/45">Você recusou essa proposta.</p>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(p.id, 'accepted')}
                      disabled={respondingId === p.id}
                      className="flex-1 rounded-lg bg-green-500/15 py-2 text-xs font-bold text-green-400 hover:bg-green-500/25 disabled:opacity-50"
                    >
                      ✓ Aceitar
                    </button>
                    <button
                      onClick={() => respond(p.id, 'declined')}
                      disabled={respondingId === p.id}
                      className="flex-1 rounded-lg bg-white/5 py-2 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-50"
                    >
                      ✕ Recusar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Estatísticas */}
      {tab === 'estatisticas' && (
        <div className="space-y-4">
          <p className="text-xs text-white/65">Últimos 7 dias — atualiza conforme as visitas acontecem.</p>

          {stats.views === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 py-8 text-center">
              <p className="text-sm text-white/65">Ainda sem dados.</p>
              <p className="mt-1 text-xs text-white/45">Assim que alguém visitar seu perfil, as estatísticas aparecem aqui.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-dark-2 border border-white/8 py-3 text-center">
                  <p className="font-display text-2xl text-gold">{stats.views}</p>
                  <p className="text-[10px] text-white/55">visitas</p>
                </div>
                <div className="rounded-xl bg-dark-2 border border-white/8 py-3 text-center">
                  <p className="font-display text-2xl text-gold">{stats.advertiseClicks}</p>
                  <p className="text-[10px] text-white/55">cliques em anunciar</p>
                </div>
                <div className="rounded-xl bg-dark-2 border border-white/8 py-3 text-center">
                  <p className="font-display text-2xl text-gold">{stats.shares}</p>
                  <p className="text-[10px] text-white/55">compartilhamentos</p>
                </div>
              </div>

              {stats.socialClicks.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-white/70">Cliques por rede social</p>
                  <div className="space-y-1.5">
                    {stats.socialClicks.map(s => (
                      <div key={s.key} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                        <span className="text-white/70">{SOCIAL_LABELS[s.key] ?? s.key}</span>
                        <span className="font-bold text-gold">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.customLinkClicks.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-white/70">Cliques por link</p>
                  <div className="space-y-1.5">
                    {stats.customLinkClicks.map(c => (
                      <div key={c.index} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                        <span className="text-white/70">{customLinks[c.index]?.label ?? `Link ${c.index + 1}`}</span>
                        <span className="font-bold text-gold">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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

      <p className="text-center text-xs text-white/45">
        Alterações aparecem no mapa em até 5 minutos.
      </p>

      {previewOpen && (
        <VitrinePreviewModal
          onClose={() => setPreviewOpen(false)}
          displayName={form.displayName}
          handle={block.instagramHandle}
          niche={form.niche}
          city={form.city}
          followers={form.followers}
          bio={form.bio}
          avatarUrl={form.avatarUrl}
          pixelCount={block.pixelCount}
          pixelWidth={block.pixelWidth}
          pixelHeight={block.pixelHeight}
          socials={{
            whatsappUrl: form.whatsappUrl,
            youtubeUrl:  form.youtubeUrl,
            tiktokUrl:   form.tiktokUrl,
            twitterUrl:  form.twitterUrl,
            facebookUrl: form.facebookUrl,
            kwaiUrl:     form.kwaiUrl,
            onlyfansUrl: form.onlyfansUrl,
            spotifyUrl:  form.spotifyUrl,
          }}
          customLinks={customLinks}
        />
      )}
    </div>
  )
}
