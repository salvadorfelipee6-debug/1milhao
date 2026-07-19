import type { Metadata } from 'next'
import { getActiveBlocksForGrid, getGridStats } from '@/lib/db/blocks'
import { DescobrirClient } from './DescobrirClient'

export const metadata: Metadata = {
  title: 'Descobrir influencers — 1 Milhão de Influencer',
  description:
    'Gire a roleta e descubra um influencer novo a cada clique. Siga com 1 toque. Quer aparecer aqui e ganhar seguidores? Garanta seu espaço a partir de R$ 0,99.',
}

export const revalidate = 60

export default async function DescobrirPage() {
  const [blocks, stats] = await Promise.all([
    getActiveBlocksForGrid(),
    getGridStats(),
  ])

  return <DescobrirClient blocks={blocks} totalInfluencers={stats.active} />
}
