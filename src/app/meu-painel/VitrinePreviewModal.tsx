'use client'

import { NICHE_LABELS, NICHE_COLORS, type CustomLink } from '@/types'
import { SOCIAL_CONFIG } from '@/lib/socialConfig'

interface Socials {
  whatsappUrl?: string
  youtubeUrl?:  string
  tiktokUrl?:   string
  twitterUrl?:  string
  facebookUrl?: string
  kwaiUrl?:     string
  onlyfansUrl?: string
  spotifyUrl?:  string
}

interface Props {
  onClose:     () => void
  displayName: string
  handle:      string
  niche:       string
  city:        string
  followers:   string
  bio:         string
  avatarUrl:   string
  pixelCount:  number
  pixelWidth:  number
  pixelHeight: number
  socials:     Socials
  customLinks: CustomLink[]
}

export function VitrinePreviewModal({
  onClose, displayName, handle, niche, city, followers, bio, avatarUrl,
  pixelCount, pixelWidth, pixelHeight, socials, customLinks,
}: Props) {
  const color      = NICHE_COLORS[niche as keyof typeof NICHE_COLORS] || '#E1306C'
  const nicheLabel = NICHE_LABELS[niche as keyof typeof NICHE_LABELS] ?? niche
  const initials   = (displayName || handle).slice(0, 2).toUpperCase()

  const activeSocials = SOCIAL_CONFIG.filter(s =>
    s.key === 'instagramUrl' || !!(socials as any)[s.key]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-black/80 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div className="mb-3 flex w-full max-w-sm shrink-0 items-center justify-between">
        <p className="text-xs font-bold text-white/80">👁 Prévia da sua Vitrine 1M</p>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white"
        >
          Fechar ✕
        </button>
      </div>

      {/* "Phone frame" */}
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm shrink-0 overflow-hidden rounded-[2rem] border-4 border-white/10 bg-dark shadow-2xl"
      >
        <div className="relative max-h-[75vh] overflow-y-auto px-4 py-8">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 60%)` }} />
          </div>

          <div className="relative z-10">
            <div
              className="mb-0 h-24 overflow-hidden rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${color}55, ${color}15)` }}
            />

            <div className="relative -mt-9 mb-4 flex items-end justify-between px-1">
              <div
                className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-4 text-xl font-bold text-white"
                style={{ background: color, borderColor: '#0d0d0d' }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  : initials}
              </div>
              <div
                className="rounded-xl px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: 'rgba(255,215,0,0.15)', border: '0.5px solid rgba(255,215,0,0.35)', color: '#FFD700' }}
              >
                ✦ 1 Milhão
              </div>
            </div>

            <div className="mb-3">
              <h1 className="text-xl font-bold leading-tight text-white">{displayName || 'Seu nome'}</h1>
              <p className="text-sm font-semibold" style={{ color }}>@{handle}</p>
              <p className="mt-1 text-xs text-white/65">
                {nicheLabel}{city ? ` · ${city}` : ''}
              </p>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {followers && (
                <div className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{followers}</p>
                  <p className="text-[9px] uppercase tracking-wide text-white/55">seguidores</p>
                </div>
              )}
              <div className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{pixelCount.toLocaleString('pt-BR')}</p>
                <p className="text-[9px] uppercase tracking-wide text-white/55">pixels</p>
              </div>
              <div className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold text-white/70">{pixelWidth}×{pixelHeight}</p>
                <p className="text-[9px] uppercase tracking-wide text-white/55">tamanho</p>
              </div>
            </div>

            {bio && <p className="mb-4 text-sm leading-relaxed text-white/70">{bio}</p>}

            <div
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-[#111]"
              style={{ background: 'var(--grad-gold)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              {socials.whatsappUrl ? 'Anunciar via WhatsApp' : 'Anunciar com esse influencer'}
            </div>

            <div className="mb-3">
              <p className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/50">
                <span className="h-px flex-1 bg-white/10" />
                Redes sociais
                <span className="h-px flex-1 bg-white/10" />
              </p>
              <div className="grid grid-cols-2 gap-2">
                {activeSocials.map(s => (
                  <div
                    key={s.key}
                    className="flex items-center gap-2 rounded-2xl px-3 py-3"
                    style={{ background: s.bg, color: s.fg }}
                  >
                    {s.icon}
                    <span className="text-xs font-bold">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {customLinks.filter(l => l.label).length > 0 && (
              <div className="mb-2 space-y-2">
                <p className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/50">
                  <span className="h-px flex-1 bg-white/10" />
                  Links
                  <span className="h-px flex-1 bg-white/10" />
                </p>
                {customLinks.filter(l => l.label).map((link, i) => (
                  <div
                    key={i}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#fff' }}
                  >
                    {link.emoji && <span className="text-base">{link.emoji}</span>}
                    <span className="flex-1 text-xs font-semibold">{link.label}</span>
                    <span className="text-[10px] text-white/55">↗</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 max-w-sm shrink-0 text-center text-[11px] text-white/45">
        Isso é só uma prévia — salve as alterações para atualizar sua página de verdade.
      </p>
    </div>
  )
}
