import type { Metadata } from 'next'
import { Suspense } from 'react'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PainelClient } from './PainelClient'
import { getBlockStats } from '@/lib/db/analytics'
import type { CustomLink } from '@/types'

export const metadata: Metadata = {
  title: 'Meu Painel — 1 Milhão de Influencer',
  description: 'Edite seu bloco no mapa.',
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function MeuPainelPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">🔐</div>
          <h1 className="font-display text-3xl text-white">ACESSO NEGADO</h1>
          <p className="text-sm text-white/65">
            Você precisa do link de edição enviado para o seu e-mail após a compra.
          </p>
          <p className="text-xs text-white/45">
            Não encontrou o e-mail? Verifique sua caixa de spam ou entre em contato.
          </p>
        </div>
      </main>
    )
  }

  const rows = await db
    .select()
    .from(schema.blocks)
    .where(eq(schema.blocks.editToken, token))
    .limit(1)

  const block = rows[0]
  if (!block) notFound()

  let customLinks: CustomLink[] = []
  try {
    const raw = (block as any).customLinks
    if (raw) customLinks = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {}

  const stats = await getBlockStats(block.id)

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="badge-gold mb-3 inline-flex">
            <span className="mr-2">⚙️</span>
            Meu Painel
          </p>
          <h1 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            EDITAR<br />
            <span className="text-gold">MEU BLOCO</span>
          </h1>
          <p className="mt-3 text-sm text-white/65">
            Alterações aparecem no mapa em até 5 minutos.
          </p>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/5" />}>
          <PainelClient block={block as any} token={token} initialCustomLinks={customLinks} stats={stats} />
        </Suspense>
      </div>
    </main>
  )
}
