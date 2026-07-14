import type { Metadata } from 'next'
import { notFound }       from 'next/navigation'
import Link               from 'next/link'
import { getBlockByHandle, getGridStats } from '@/lib/db/blocks'
import { NICHE_LABELS }   from '@/types'
import type { CustomLink } from '@/types'
import { ShareButton }    from './ShareButton'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const block = await getBlockByHandle(handle)
  if (!block) return { title: 'Influencer não encontrado' }
  return {
    title:       `@${block.instagramHandle} — ${block.displayName}`,
    description: block.bio ?? `${block.displayName} · ${NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS]} · ${block.followers ?? ''} seguidores`,
    openGraph: {
      type:   'profile',
      title:  `@${block.instagramHandle} no 1 Milhão de Influencer`,
      images: block.avatarUrl ? [{ url: block.avatarUrl }] : [],
    },
  }
}

export const revalidate = 300

// Cada rede vira um "selo" sólido na cor oficial do app — não um chip discreto
const SOCIAL_CONFIG = [
  { key: 'instagramUrl', label: 'Instagram',   bg: 'linear-gradient(135deg, #833AB4, #E1306C 60%, #F77737)', fg: '#ffffff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { key: 'youtubeUrl',    label: 'YouTube',    bg: '#FF0000', fg: '#ffffff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { key: 'tiktokUrl',     label: 'TikTok',     bg: '#000000', fg: '#ffffff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg> },
  { key: 'twitterUrl',    label: 'X / Twitter', bg: '#000000', fg: '#ffffff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { key: 'facebookUrl',   label: 'Facebook',   bg: '#1877F2', fg: '#ffffff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { key: 'kwaiUrl',       label: 'Kwai',       bg: '#FF8800', fg: '#ffffff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 10.5l-6 3.5V9l6 3.5z"/></svg> },
  { key: 'onlyfansUrl',   label: 'OnlyFans',   bg: '#00AEEF', fg: '#ffffff',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg> },
  { key: 'spotifyUrl',    label: 'Spotify',    bg: '#1ED760', fg: '#111111',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
] as const

export default async function InfluencerProfilePage({ params }: Props) {
  const { handle } = await params
  const [block, stats] = await Promise.all([
    getBlockByHandle(handle),
    getGridStats(),
  ])
  if (!block) notFound()

  const shareUrl   = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/influencer/${block.instagramHandle}`
  const igUrl      = `https://instagram.com/${block.instagramHandle}`
  const whatsappUrl = (block as any).whatsappUrl
    ? `https://wa.me/${((block as any).whatsappUrl).replace(/\D/g, '')}`
    : null
  const advertiseUrl = whatsappUrl || (block as any).websiteUrl || igUrl
  const initials   = (block.displayName || block.instagramHandle).slice(0, 2).toUpperCase()
  const nicheLabel = NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS] ?? block.niche
  const color      = block.colorHex || '#E1306C'

  // Redes ativas — Instagram sempre aparece (vem do @, não é campo salvo), as demais só quando preenchidas
  const activeSocials = SOCIAL_CONFIG
    .filter(s => s.key === 'instagramUrl' || !!(block as any)[s.key])
    .map(s => ({ ...s, href: s.key === 'instagramUrl' ? igUrl : (block as any)[s.key] as string }))

  // Links personalizados
  let customLinks: CustomLink[] = []
  try {
    const raw = (block as any).customLinks
    if (raw) customLinks = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {}

  const jsonLd = {
    '@context':   'https://schema.org',
    '@type':      'Person',
    name:         block.displayName,
    alternateName:`@${block.instagramHandle}`,
    description:  block.bio,
    url:          igUrl,
    sameAs:       [igUrl],
    jobTitle:     nicheLabel,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen bg-dark">

        {/* Background gradiente */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 60%)` }} />
        </div>

        <div className="relative z-10 mx-auto max-w-sm px-4 py-10">

          {/* Cover + Avatar */}
          <div
            className="relative mb-0 h-32 overflow-hidden rounded-2xl bg-pixel-grid"
            style={{ background: `linear-gradient(135deg, ${color}55, ${color}15)` }}
          />

          <div className="relative -mt-11 mb-5 flex items-end justify-between px-2">
            <div className="relative animate-fade-up">
              <div
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 text-2xl font-bold text-white"
                style={{ background: color, borderColor: '#0d0d0d', boxShadow: `0 8px 32px ${color}55` }}
              >
                {block.avatarUrl
                  ? <img src={block.avatarUrl} alt="" className="h-full w-full object-cover" />
                  : initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                style={{ background: '#FFD700', borderColor: '#0d0d0d', color: '#111' }}
                title="Espaço ativo no mapa"
              >
                ✓
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
              <div
                className="rounded-xl px-3 py-1.5 text-xs font-semibold"
                style={{ background: 'rgba(255,215,0,0.15)', border: '0.5px solid rgba(255,215,0,0.35)', color: '#FFD700' }}
              >
                ✦ 1 Milhão
              </div>
              <ShareButton url={shareUrl} />
            </div>
          </div>

          {/* Nome + info */}
          <div className="mb-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <h1 className="text-2xl font-bold leading-tight text-white">{block.displayName}</h1>
            <p className="text-sm font-semibold" style={{ color }}>{`@${block.instagramHandle}`}</p>
            <p className="mt-1 text-xs text-white/65">
              {nicheLabel}{block.city ? ` · ${block.city}` : ''}
            </p>
          </div>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2 animate-fade-up" style={{ animationDelay: '160ms' }}>
            {block.followers && (
              <div className="rounded-xl py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{block.followers}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/55">seguidores</p>
              </div>
            )}
            <div className="rounded-xl py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{block.pixelCount.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/55">pixels</p>
            </div>
            <div className="rounded-xl py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-bold text-white/70">{block.pixelWidth}×{block.pixelHeight}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/55">tamanho</p>
            </div>
          </div>

          {/* Bio */}
          {block.bio && (
            <p className="mb-5 text-sm leading-relaxed text-white/70 animate-fade-up" style={{ animationDelay: '180ms' }}>{block.bio}</p>
          )}

          {/* BOTÃO DE ANUNCIAR — destaque máximo */}
          <a
            href={advertiseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-glow-pulse mb-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-[#111] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ background: 'var(--grad-gold)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            {whatsappUrl ? 'Anunciar via WhatsApp' : 'Anunciar com esse influencer'}
          </a>

          {/* Redes sociais — selos sólidos na cor oficial de cada app */}
          <div className="mb-3">
            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
              <span className="h-px flex-1 bg-white/10" />
              Redes sociais
              <span className="h-px flex-1 bg-white/10" />
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {activeSocials.map(s => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97]"
                  style={{ background: s.bg, color: s.fg, boxShadow: `0 6px 18px -4px ${typeof s.bg === 'string' && s.bg.startsWith('#') ? s.bg + '77' : 'rgba(0,0,0,0.4)'}` }}
                >
                  {s.icon}
                  <span className="text-sm font-bold">{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links personalizados */}
          {customLinks.length > 0 && (
            <div className="mb-3 space-y-2">
              <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
                <span className="h-px flex-1 bg-white/10" />
                Links
                <span className="h-px flex-1 bg-white/10" />
              </p>
              {customLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 hover:opacity-90"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#fff' }}
                >
                  {link.emoji && <span className="text-lg">{link.emoji}</span>}
                  <span className="flex-1 text-sm font-semibold">{link.label}</span>
                  <span className="text-xs text-white/55">↗</span>
                </a>
              ))}
            </div>
          )}

          {/* Card do mapa */}
          <Link
            href={`/?highlight=${block.instagramHandle}`}
            className="mb-6 mt-1 flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-gold/30"
            style={{ background: 'rgba(255,215,0,0.06)', border: '0.5px solid rgba(255,215,0,0.2)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
              style={{ background: color + '33', border: `1px solid ${color}`, color }}
            >
              {block.pixelWidth}×{block.pixelHeight}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gold">Espaço permanente no mapa</p>
              <p className="text-[10px] text-white/55">1 Milhão de Influencer · ver meu bloco →</p>
            </div>
            <span className="text-white/40">→</span>
          </Link>

          {/* Footer */}
          <div className="text-center">
            <p className="text-[11px] text-white/45">
              Powered by{' '}
              <Link href="/" className="text-gold/50 hover:text-gold/80">
                1 Milhão de Influencer
              </Link>
            </p>
            <p className="mt-2 text-[10px] text-white/40">
              Quer um link na bio como esse?{' '}
              <Link href="/comprar" className="underline hover:text-white/65">
                Garanta seu espaço →
              </Link>
            </p>
          </div>

        </div>
      </main>
    </>
  )
}