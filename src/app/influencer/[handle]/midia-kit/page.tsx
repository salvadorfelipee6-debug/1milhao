import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlockByHandle, getBlockRanking } from '@/lib/db/blocks'
import { NICHE_LABELS } from '@/types'
import type { CustomLink } from '@/types'
import { SOCIAL_CONFIG } from '@/lib/socialConfig'
import { DownloadKitButton } from './DownloadKitButton'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const block = await getBlockByHandle(handle)
  if (!block) return { title: 'Mídia kit não encontrado' }
  return {
    title: `Mídia Kit — @${block.instagramHandle}`,
    description: `Mídia kit de ${block.displayName} — 1 Milhão de Influencer`,
  }
}

export const revalidate = 300

export default async function MidiaKitPage({ params }: Props) {
  const { handle } = await params
  const block = await getBlockByHandle(handle)
  if (!block) notFound()

  const ranking = await getBlockRanking(block.id)
  const nicheLabel = NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS] ?? block.niche
  const color = block.colorHex || '#E1306C'
  const initials = (block.displayName || block.instagramHandle).slice(0, 2).toUpperCase()
  const whatsappUrl = (block as any).whatsappUrl
    ? `https://wa.me/${((block as any).whatsappUrl).replace(/\D/g, '')}`
    : null

  const activeSocials = SOCIAL_CONFIG
    .filter(s => s.key === 'instagramUrl' || !!(block as any)[s.key])
    .map(s => ({ ...s, href: s.key === 'instagramUrl' ? `https://instagram.com/${block.instagramHandle}` : (block as any)[s.key] as string }))

  let customLinks: CustomLink[] = []
  try {
    const raw = (block as any).customLinks
    if (raw) customLinks = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {}

  const kitData = {
    displayName: block.displayName,
    instagramHandle: block.instagramHandle,
    niche: nicheLabel,
    city: block.city,
    followers: block.followers,
    bio: block.bio,
    avatarUrl: block.avatarUrl,
    colorHex: color,
    pixelCount: block.pixelCount,
    ranking,
    socials: activeSocials.map(s => s.label),
    whatsappUrl: (block as any).whatsappUrl ?? null,
  }

  return (
    <main className="min-h-screen bg-dark px-4 py-10">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 60%)` }} />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <Link href={`/influencer/${block.instagramHandle}`} className="text-xs text-white/50 hover:text-white/75">
            ← voltar ao perfil
          </Link>
          <p className="badge-gold inline-flex"><span className="mr-1.5">📋</span>Mídia Kit</p>
        </div>

        {/* Card principal */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-dark-2">
          {/* Header colorido */}
          <div className="relative h-24 bg-pixel-grid" style={{ background: `linear-gradient(135deg, ${color}66, ${color}1a)` }} />

          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 flex items-end gap-4">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 text-xl font-bold text-white"
                style={{ background: color, borderColor: 'var(--dark-2)', boxShadow: `0 8px 24px ${color}55` }}
              >
                {block.avatarUrl ? <img src={block.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-white">{block.displayName}</h1>
                <p className="text-sm font-semibold" style={{ color }}>@{block.instagramHandle}</p>
              </div>
            </div>

            <p className="mb-4 text-xs text-white/60">{nicheLabel}{block.city ? ` · ${block.city}` : ''}</p>

            {block.bio && <p className="mb-5 text-sm leading-relaxed text-white/70">{block.bio}</p>}

            {/* Números */}
            <div className="mb-5 grid grid-cols-2 gap-2">
              {block.followers && (
                <div className="rounded-xl bg-white/5 py-3 text-center">
                  <p className="font-display text-xl text-gold">{block.followers}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/55">seguidores</p>
                </div>
              )}
              <div className="rounded-xl bg-white/5 py-3 text-center">
                <p className="font-display text-xl text-gold">{block.pixelCount.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/55">pixels no mapa</p>
              </div>
              {ranking && (
                <>
                  <div className="rounded-xl bg-white/5 py-3 text-center">
                    <p className="font-display text-xl text-gold">#{ranking.nichePosition}</p>
                    <p className="text-[10px] uppercase tracking-wide text-white/55">em {nicheLabel.toLowerCase()}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 py-3 text-center">
                    <p className="font-display text-xl text-gold">#{ranking.position}</p>
                    <p className="text-[10px] uppercase tracking-wide text-white/55">no ranking geral</p>
                  </div>
                </>
              )}
            </div>

            {/* Redes */}
            {activeSocials.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-[10px] uppercase tracking-widest text-white/50">Presença digital</p>
                <div className="flex flex-wrap gap-2">
                  {activeSocials.map(s => (
                    <span
                      key={s.key}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      style={{ background: s.bg, color: s.fg }}
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links extra */}
            {customLinks.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-[10px] uppercase tracking-widest text-white/50">Também confira</p>
                <div className="space-y-1.5">
                  {customLinks.map((l, i) => (
                    <p key={i} className="text-xs text-white/65">{l.emoji} {l.label}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Contato */}
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
              <p className="mb-1 text-xs font-bold text-gold">📩 Para propostas de campanha</p>
              <p className="text-xs text-white/65">
                Envie um briefing estruturado direto pelo perfil, ou fale via WhatsApp{whatsappUrl ? '' : ' (assim que disponível)'}.
              </p>
              <div className="mt-3 flex gap-2">
                <Link href={`/influencer/${block.instagramHandle}`} className="btn-gold flex-1 py-2.5 text-xs">
                  Enviar briefing →
                </Link>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 py-2.5 text-xs">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <DownloadKitButton data={kitData} />
        </div>

        <p className="mt-4 text-center text-[10px] text-white/40">
          Gerado automaticamente por{' '}
          <Link href="/" className="text-gold/60 hover:text-gold/80">1 Milhão de Influencer</Link>
        </p>
      </div>
    </main>
  )
}
