'use client'

import { useEffect, useRef, useState } from 'react'
import type { GridBlock } from '@/types'
import { NICHE_LABELS } from '@/types'

interface BlockPopupProps {
  block:   GridBlock
  onClose: () => void
}

// 'instagramUrl' não é um campo salvo — o Instagram vem do @handle (sempre presente),
// os demais só entram quando preenchidos. Ver getActiveBlocksForGrid em src/lib/db/blocks.ts.
const SOCIAL_CONFIG = [
  { key: 'instagramUrl',  label: 'Instagram',   color: '#e1306c', bg: 'rgba(225,48,108,0.12)', border: 'rgba(225,48,108,0.3)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { key: 'youtubeUrl',    label: 'YouTube',     color: '#ff0000', bg: 'rgba(255,0,0,0.08)',     border: 'rgba(255,0,0,0.25)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { key: 'tiktokUrl',     label: 'TikTok',      color: '#ffffff', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg> },
  { key: 'twitterUrl',    label: 'X / Twitter', color: '#ffffff', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { key: 'facebookUrl',   label: 'Facebook',    color: '#1877f2', bg: 'rgba(24,119,242,0.08)',  border: 'rgba(24,119,242,0.25)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { key: 'kwaiUrl',       label: 'Kwai',        color: '#ff8c00', bg: 'rgba(255,140,0,0.08)',   border: 'rgba(255,140,0,0.25)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 10.5l-6 3.5V9l6 3.5z"/></svg> },
  { key: 'onlyfansUrl',   label: 'OnlyFans',    color: '#00aeef', bg: 'rgba(0,174,239,0.08)',   border: 'rgba(0,174,239,0.25)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg> },
  { key: 'spotifyUrl',    label: 'Spotify',     color: '#1ed760', bg: 'rgba(30,215,96,0.08)',   border: 'rgba(30,215,96,0.25)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
] as const

export function BlockPopup({ block, onClose }: BlockPopupProps) {
  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: block.id, eventType: 'popup_open' }),
    }).catch(() => {})
  }, [block.id])

  function track(eventType: string) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: block.id, eventType }),
    }).catch(() => {})
  }

  function getEmbedUrl(url: string): string | null {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`
    return null
  }

  function handlePlayVideo() {
    if (!block.videoUrl) return
    const embed = getEmbedUrl(block.videoUrl)
    if (embed) { setVideoEmbedUrl(embed); track('video_play') }
    else { window.open(block.videoUrl, '_blank', 'noopener') }
  }

  const initials    = (block.displayName || block.instagramHandle).slice(0, 2).toUpperCase()
  const igUrl       = `https://instagram.com/${block.instagramHandle}`
  const whatsappUrl = (block as any).whatsappUrl
    ? `https://wa.me/${((block as any).whatsappUrl).replace(/\D/g, '')}`
    : null
  const advertiseUrl = whatsappUrl || (block as any).websiteUrl || igUrl

  // Instagram sempre aparece (vem do @, não é campo salvo); as demais só quando preenchidas
  const activeSocials = SOCIAL_CONFIG
    .filter(s => s.key === 'instagramUrl' || !!(block as any)[s.key])
    .map(s => ({ ...s, href: s.key === 'instagramUrl' ? igUrl : (block as any)[s.key] as string }))

  const nicheLabel = NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS] ?? block.niche

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de @${block.instagramHandle}`}
    >
      <div className="popup-enter relative w-full max-w-sm overflow-hidden shadow-2xl sm:rounded-2xl" style={{ background: '#111', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px 16px 0 0' }}>

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:text-white"
          style={{ background: 'rgba(0,0,0,0.5)', border: '0.5px solid rgba(255,255,255,0.1)' }}
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Header com gradiente da cor do nicho */}
        <div
          className="relative flex h-28 w-full items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${block.colorHex}55, ${block.colorHex}22)` }}
        >
          {videoEmbedUrl ? (
            <iframe src={videoEmbedUrl} className="h-full w-full border-0" allow="autoplay; fullscreen" allowFullScreen />
          ) : block.videoUrl ? (
            <button
              onClick={handlePlayVideo}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.9)', color: block.colorHex }}
              aria-label="Assistir vídeo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
            </button>
          ) : null}

          {/* Avatar posicionado na borda inferior */}
          <div
            className="absolute -bottom-8 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
            style={{ background: block.colorHex, border: '3px solid #111' }}
          >
            {block.avatarUrl
              ? <img src={block.avatarUrl} alt="" className="h-full w-full object-cover" />
              : initials}
          </div>
        </div>

        {/* Corpo */}
        <div className="p-4 pt-12">

          {/* Nome + nicho */}
          <div className="mb-3">
            <p className="font-bold text-white text-base">@{block.instagramHandle}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {block.displayName && <span className="text-white/60">{block.displayName} · </span>}
              {nicheLabel}
              {block.city ? ` · ${block.city}` : ''}
            </p>
          </div>

          {/* Stats */}
          <div
            className="grid gap-2 mb-3 pb-3"
            style={{
              gridTemplateColumns: `repeat(${[block.followers, true, block.pixelCount].filter(Boolean).length}, 1fr)`,
              borderBottom: '0.5px solid rgba(255,255,255,0.07)',
            }}
          >
            {block.followers && (
              <div className="rounded-xl py-2 px-1 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{block.followers}</p>
                <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>seguidores</p>
              </div>
            )}
            <div className="rounded-xl py-2 px-1 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{block.pixelCount.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>pixels</p>
            </div>
            <div className="rounded-xl py-2 px-1 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{block.pixelWidth}×{block.pixelHeight}</p>
              <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>tamanho</p>
            </div>
          </div>

          {/* Bio */}
          {block.bio && (
            <p className="mb-3 text-xs leading-relaxed pb-3" style={{ color: 'rgba(255,255,255,0.45)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              {block.bio}
            </p>
          )}

          {/* Redes sociais */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Redes sociais</p>
            <div className="flex flex-wrap gap-2">
              {activeSocials.map(s => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track(`social:${s.key}`)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ background: s.bg, border: `0.5px solid ${s.border}`, color: s.color }}
                >
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Botões de ação — seguir é a ação nº 1 (visitante vira seguidor) */}
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('social:instagramUrl')}
            className="mb-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(45deg,#833AB4,#E1306C 60%,#F77737)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Seguir @{block.instagramHandle}
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={advertiseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('advertise_click')}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: '#FFD700', color: '#111' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              {whatsappUrl ? 'Anunciar via WhatsApp' : 'Anunciar'}
            </a>
            <a
              href={`/influencer/${block.instagramHandle}`}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all hover:border-white/20 hover:text-white/80"
              style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
            >
              Ver página completa
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          {/* Share nativo */}
          {'share' in navigator && (
            <button
              onClick={() => {
                navigator.share({
                  title: `@${block.instagramHandle} — 1 Milhão de Influencer`,
                  url: `${window.location.origin}/influencer/${block.instagramHandle}`,
                })
                track('share')
              }}
              className="mt-2 w-full rounded-xl py-2 text-xs transition-colors"
              style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}
            >
              Compartilhar perfil ↗
            </button>
          )}
        </div>
      </div>
    </div>
  )
}