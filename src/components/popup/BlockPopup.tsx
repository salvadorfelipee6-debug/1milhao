'use client'

import { useEffect, useRef, useState } from 'react'
import type { GridBlock } from '@/types'
import { NICHE_LABELS } from '@/types'

interface BlockPopupProps {
  block:   GridBlock
  onClose: () => void
}

export function BlockPopup({ block, onClose }: BlockPopupProps) {
  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Bloqueia scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Rastreia abertura do popup
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: block.id, eventType: 'popup_open' }),
    }).catch(() => {})
  }, [block.id])

  function getEmbedUrl(url: string): string | null {
    // YouTube
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
    // Vimeo
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`
    return null
  }

  function handlePlayVideo() {
    if (!block.videoUrl) return
    const embed = getEmbedUrl(block.videoUrl)
    if (embed) {
      setVideoEmbedUrl(embed)
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId: block.id, eventType: 'video_play' }),
      }).catch(() => {})
    } else {
      // TikTok/Reels — abre em nova aba
      window.open(block.videoUrl, '_blank', 'noopener')
    }
  }

  function handleIgClick() {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: block.id, eventType: 'ig_click' }),
    }).catch(() => {})
  }

  function handleAdvertiseClick() {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: block.id, eventType: 'advertise_click' }),
    }).catch(() => {})
  }

  const initials = (block.displayName || block.instagramHandle).slice(0, 2).toUpperCase()
  const igUrl    = `https://instagram.com/${block.instagramHandle}`
  const advUrl   = block.websiteUrl || igUrl

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de @${block.instagramHandle}`}
    >
      <div className="popup-enter relative w-full max-w-sm overflow-hidden rounded-2xl bg-dark-2 shadow-2xl">

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/60 backdrop-blur-sm hover:text-white"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Área de vídeo */}
        <div
          className="relative flex h-44 w-full items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${block.colorHex}44, ${block.colorHex}88)`,
          }}
        >
          {videoEmbedUrl ? (
            <iframe
              src={videoEmbedUrl}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              {block.videoUrl ? (
                <button
                  onClick={handlePlayVideo}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-pink shadow-lg transition-transform hover:scale-110"
                  aria-label="Assistir vídeo"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                </button>
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                  style={{ background: block.colorHex }}
                >
                  {initials}
                </div>
              )}
              {block.videoUrl && (
                <span className="text-xs text-white/60">Ver vídeo de apresentação</span>
              )}
            </div>
          )}
        </div>

        {/* Corpo do popup */}
        <div className="p-4">
          {/* Header do perfil */}
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: block.colorHex }}
            >
              {block.avatarUrl ? (
                <img
                  src={block.avatarUrl}
                  alt={`@${block.instagramHandle}`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : initials}
            </div>
            <div>
              <p className="font-bold text-white">@{block.instagramHandle}</p>
              <p className="text-xs text-white/40">
                {NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS] ?? block.niche}
                {block.city ? ` · ${block.city}` : ''}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-3 flex gap-4 border-y border-white/6 py-3">
            {block.followers && (
              <div>
                <p className="text-sm font-bold text-white">{block.followers}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide">seguidores</p>
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-white">{block.pixelCount.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">pixels</p>
            </div>
          </div>

          {/* Bio */}
          {block.bio && (
            <p className="mb-4 text-sm leading-relaxed text-white/60">{block.bio}</p>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleIgClick}
              className="btn-insta flex-1 py-2.5 text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
              </svg>
              Seguir
            </a>
            <a
              href={advUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAdvertiseClick}
              className="btn-ghost flex-1 py-2.5 text-sm"
            >
              Anunciar
            </a>

            {/* Share nativo (mobile) */}
            {'share' in navigator && (
              <button
                onClick={() => navigator.share({
                  title: `@${block.instagramHandle} — 1 Milhão de Influencer`,
                  url: `${window.location.origin}/influencer/${block.instagramHandle}`,
                })}
                className="btn-ghost px-3 py-2.5"
                aria-label="Compartilhar"
              >
                ↗
              </button>
            )}
          </div>

          {/* Link para o perfil completo */}
          <a
            href={`/influencer/${block.instagramHandle}`}
            className="mt-3 block text-center text-xs text-white/25 hover:text-white/50"
          >
            Ver página completa →
          </a>
        </div>
      </div>
    </div>
  )
}
