import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound }       from 'next/navigation'
import Link               from 'next/link'
import { getBlockByHandle, getGridStats, getBlockBadges } from '@/lib/db/blocks'
import { NICHE_LABELS }   from '@/types'
import type { CustomLink, UgcPortfolioItem, UgcRateCardItem } from '@/types'
import { ShareButton }    from './ShareButton'
import { ProfileTracking } from './ProfileTracking'
import { QrCodeButton }   from './QrCodeButton'
import { SendBriefingButton } from '@/components/proposals/SendBriefingButton'
import { SOCIAL_CONFIG }  from '@/lib/socialConfig'
import { BadgeRow }       from '@/components/ui/BadgeRow'

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
      type:  'profile',
      title: `@${block.instagramHandle} no 1 Milhão de Influencer`,
      // Imagem gerada dinamicamente por opengraph-image.tsx nesta mesma pasta —
      // não declarar `images` aqui, o Next já injeta sozinho pela convenção de arquivo.
    },
  }
}

export const revalidate = 300

export default async function InfluencerProfilePage({ params }: Props) {
  const { handle } = await params
  const [block, stats] = await Promise.all([
    getBlockByHandle(handle),
    getGridStats(),
  ])
  if (!block) notFound()
  const badges = await getBlockBadges(block.id)

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

  // UGC — portfólio de vídeos e tabela de preços por entrega
  const isUgc = !!(block as any).isUgcCreator
  let ugcPortfolio: UgcPortfolioItem[] = []
  let ugcRateCard:  UgcRateCardItem[]  = []
  try {
    const raw = (block as any).ugcPortfolio
    if (raw) ugcPortfolio = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {}
  try {
    const raw = (block as any).ugcRateCard
    if (raw) ugcRateCard = typeof raw === 'string' ? JSON.parse(raw) : raw
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
      <ProfileTracking blockId={block.id} />

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
                title="Sua Vitrine 1M — link na bio vitalício"
              >
                ✦ Vitrine 1M
              </div>
              <div className="flex gap-2">
                <ShareButton url={shareUrl} blockId={block.id} />
                <QrCodeButton url={shareUrl} blockId={block.id} />
              </div>
            </div>
          </div>

          {/* Nome + info */}
          <div className="mb-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <h1 className="text-2xl font-bold leading-tight text-white">{block.displayName}</h1>
            <p className="text-sm font-semibold" style={{ color }}>{`@${block.instagramHandle}`}</p>
            <p className="mt-1 text-xs text-white/65">
              {nicheLabel}{block.city ? ` · ${block.city}` : ''}
            </p>
            {isUgc && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-300">
                🎬 Criador UGC
              </span>
            )}
            {badges.length > 0 && (
              <div className="mt-2">
                <BadgeRow badges={badges} />
              </div>
            )}
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

          {/* Portfólio UGC — a marca vê o trabalho antes de decidir */}
          {isUgc && ugcPortfolio.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
                <span className="h-px flex-1 bg-white/10" />
                Portfólio
                <span className="h-px flex-1 bg-white/10" />
              </p>
              <div className="space-y-2">
                {ugcPortfolio.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track={`ugc_portfolio:${i}`}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(131,58,180,0.08)', border: '0.5px solid rgba(131,58,180,0.25)', color: '#fff' }}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs"
                      style={{ background: 'rgba(131,58,180,0.25)' }}
                    >
                      ▶
                    </span>
                    <span className="flex-1 text-sm font-semibold">{item.label}</span>
                    <span className="text-xs text-white/55">assistir ↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tabela de preços UGC */}
          {isUgc && ugcRateCard.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
                <span className="h-px flex-1 bg-white/10" />
                Tabela de preços
                <span className="h-px flex-1 bg-white/10" />
              </p>
              <div className="overflow-hidden rounded-xl border border-white/10">
                {ugcRateCard.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm ${i > 0 ? 'border-t border-white/8' : ''}`}
                    style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                  >
                    <span className="text-white/75">{item.deliverable}</span>
                    <span className="font-bold text-gold">{item.price}</span>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-white/45">Valores de referência — combine os detalhes direto com o criador.</p>
            </div>
          )}

          {/* BOTÃO DE SEGUIR — destaque máximo: quem chega por um link de bio é */}
          {/* seguidor na imensa maioria das vezes, não marca. Anunciar vem depois. */}
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="social:instagramUrl"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ background: 'linear-gradient(45deg,#833AB4,#E1306C 60%,#F77737)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Seguir @{block.instagramHandle}
          </a>

          {/* Para marcas — secundário: Anunciar + Briefing */}
          <div className="mb-3">
            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
              <span className="h-px flex-1 bg-white/10" />
              É uma marca?
              <span className="h-px flex-1 bg-white/10" />
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={advertiseUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="advertise_click"
                className="flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all hover:border-gold/30"
                style={{ background: 'rgba(255,215,0,0.06)', border: '0.5px solid rgba(255,215,0,0.25)', color: '#FFD700' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                {whatsappUrl ? 'WhatsApp' : 'Anunciar'}
              </a>
              <SendBriefingButton
                blockId={block.id}
                instagramHandle={block.instagramHandle}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/4 py-3 text-xs font-bold text-white/75 transition-all hover:border-white/20"
              />
            </div>
          </div>

          {/* Redes sociais — selos sólidos na cor oficial de cada app */}
          <div className="mb-3">
            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
              <span className="h-px flex-1 bg-white/10" />
              Redes sociais
              <span className="h-px flex-1 bg-white/10" />
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {activeSocials.map((s, i) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track={`social:${s.key}`}
                  className="animate-badge-pulse flex items-center gap-2.5 rounded-2xl px-4 py-3.5 transition-all hover:-translate-y-1 hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
                  style={{
                    background: s.bg,
                    color: s.fg,
                    animationDelay: `${i * 220}ms`,
                    ['--glow' as string]: s.glow,
                  } as CSSProperties}
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
                  data-track={`custom_link:${i}`}
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

          {/* Mídia kit */}
          <Link
            href={`/influencer/${block.instagramHandle}/midia-kit`}
            className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base" style={{ background: 'rgba(255,255,255,0.06)' }}>
              📋
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80">Mídia kit pronto pra marcas</p>
              <p className="text-[10px] text-white/50">Números, redes e contato num pager só · ver e baixar →</p>
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
              Quer uma Vitrine 1M como essa?{' '}
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