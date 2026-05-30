import type { Metadata } from 'next'
import { notFound }        from 'next/navigation'
import Link                from 'next/link'
import { getBlockByHandle, getGridStats } from '@/lib/db/blocks'
import { NICHE_LABELS }    from '@/types'

interface Props {
  params: { handle: string }
}

// Gera metadata dinâmica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const block = await getBlockByHandle(params.handle)
  if (!block) return { title: 'Influencer não encontrado' }

  return {
    title:       `@${block.instagramHandle} — ${block.displayName}`,
    description: block.bio ?? `${block.displayName} no 1 Milhão de Influencer · ${block.niche} · ${block.followers ?? ''} seguidores`,
    openGraph: {
      type:        'profile',
      title:       `@${block.instagramHandle} no 1 Milhão de Influencer`,
      description: block.bio ?? block.niche,
      images:      block.avatarUrl ? [{ url: block.avatarUrl }] : [],
    },
    twitter: {
      card:        'summary',
      title:       `@${block.instagramHandle}`,
      description: block.bio ?? block.niche,
      images:      block.avatarUrl ? [block.avatarUrl] : [],
    },
  }
}

// Revalida a cada 5 minutos (ISR)
export const revalidate = 300

export default async function InfluencerProfilePage({ params }: Props) {
  const [block, stats] = await Promise.all([
    getBlockByHandle(params.handle),
    getGridStats(),
  ])

  if (!block) notFound()

  const igUrl  = `https://instagram.com/${block.instagramHandle}`
  const advUrl = block.websiteUrl || igUrl
  const initials = (block.displayName || block.instagramHandle).slice(0, 2).toUpperCase()

  // Schema.org JSON-LD
  const jsonLd = {
    '@context':   'https://schema.org',
    '@type':      'Person',
    name:         block.displayName,
    alternateName:`@${block.instagramHandle}`,
    description:  block.bio,
    url:          igUrl,
    sameAs:       [igUrl],
    jobTitle:     NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS],
    address: block.city ? {
      '@type':          'PostalAddress',
      addressLocality:   block.city,
      addressCountry:   'BR',
    } : undefined,
  }

  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-dark px-4 py-12">
        <div className="mx-auto max-w-md">

          {/* Voltar */}
          <Link
            href="/#grade"
            className="mb-6 flex items-center gap-2 text-sm text-white/30 hover:text-white/60"
          >
            ← Voltar para o mapa
          </Link>

          {/* Card do perfil */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-dark-2">

            {/* Cover colorida */}
            <div
              className="h-24"
              style={{
                background: `linear-gradient(135deg, ${block.colorHex}44, ${block.colorHex}99)`,
              }}
            />

            <div className="p-5">
              {/* Avatar */}
              <div className="-mt-12 mb-3">
                <div
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-dark-2 text-xl font-bold text-white"
                  style={{ background: block.colorHex }}
                >
                  {block.avatarUrl ? (
                    <img
                      src={block.avatarUrl}
                      alt={`@${block.instagramHandle}`}
                      className="h-full w-full object-cover"
                    />
                  ) : initials}
                </div>
              </div>

              {/* Identidade */}
              <h1 className="text-xl font-bold text-white">
                {block.displayName}
              </h1>
              <p className="text-sm font-semibold text-pink">
                @{block.instagramHandle}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS] ?? block.niche}
                {block.city ? ` · ${block.city}` : ''}
              </p>

              {/* Stats */}
              <div className="my-4 flex gap-5 border-y border-white/6 py-4">
                {block.followers && (
                  <div>
                    <p className="text-lg font-bold text-white">{block.followers}</p>
                    <p className="text-[10px] uppercase tracking-wide text-white/30">seguidores</p>
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-white">
                    {block.pixelCount.toLocaleString('pt-BR')}px
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-white/30">pixels</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {new Date(block.createdAt).getFullYear()}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-white/30">membro desde</p>
                </div>
              </div>

              {/* Bio */}
              {block.bio && (
                <p className="mb-4 text-sm leading-relaxed text-white/60">
                  {block.bio}
                </p>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-insta flex-1 py-3 text-sm"
                >
                  Seguir no Instagram
                </a>
                <a
                  href={advUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost flex-1 py-3 text-sm"
                >
                  Anunciar
                </a>
              </div>

              {/* Membro permanente */}
              <p className="mt-4 text-center text-[11px] text-white/20">
                Membro permanente do 1 Milhão de Influencer
              </p>
            </div>
          </div>

          {/* CTA para quem visita */}
          <div className="mt-8 rounded-2xl border border-gold/15 bg-gold/5 p-5 text-center">
            <p className="mb-1 text-sm font-bold text-gold">
              Quer aparecer no mapa também?
            </p>
            <p className="mb-4 text-xs text-white/40">
              {stats.available.toLocaleString('pt-BR')} pixels disponíveis · a partir de R$ 10
            </p>
            <Link href="/comprar" className="btn-gold px-6 py-2.5 text-sm">
              Garantir meu espaço →
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}
