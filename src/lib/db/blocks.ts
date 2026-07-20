import 'server-only'
import { db, schema } from '.'
import { eq, and, gte, sql, desc, ilike, or } from 'drizzle-orm'
import { redis } from '../cache'

const CACHE_KEY   = 'blocks:all'
const CACHE_TTL   = 60 * 5  // 5 minutos

export type BlockForGrid = Pick<
  schema.Block,
  | 'id' | 'instagramHandle' | 'displayName' | 'niche' | 'city'
  | 'followers' | 'bio' | 'videoUrl' | 'websiteUrl' | 'avatarUrl'
  | 'colorHex' | 'pixelX' | 'pixelY' | 'pixelWidth' | 'pixelHeight'
  | 'pixelCount'
  | 'whatsappUrl' | 'youtubeUrl' | 'tiktokUrl' | 'twitterUrl'
  | 'facebookUrl' | 'kwaiUrl' | 'onlyfansUrl' | 'spotifyUrl'
  | 'isUgcCreator'
>

// Retorna todos os blocos ativos para montar a grade
// Usa cache Redis de 5 minutos
export async function getActiveBlocksForGrid(): Promise<BlockForGrid[]> {
  const cached = await redis.get(CACHE_KEY)
  if (cached) return cached

  const blocks = await db
    .select({
      id:              schema.blocks.id,
      instagramHandle: schema.blocks.instagramHandle,
      displayName:     schema.blocks.displayName,
      niche:           schema.blocks.niche,
      city:            schema.blocks.city,
      followers:       schema.blocks.followers,
      bio:             schema.blocks.bio,
      videoUrl:        schema.blocks.videoUrl,
      websiteUrl:      schema.blocks.websiteUrl,
      avatarUrl:       schema.blocks.avatarUrl,
      colorHex:        schema.blocks.colorHex,
      pixelX:          schema.blocks.pixelX,
      pixelY:          schema.blocks.pixelY,
      pixelWidth:      schema.blocks.pixelWidth,
      pixelHeight:     schema.blocks.pixelHeight,
      pixelCount:      schema.blocks.pixelCount,
      whatsappUrl:     schema.blocks.whatsappUrl,
      youtubeUrl:      schema.blocks.youtubeUrl,
      tiktokUrl:       schema.blocks.tiktokUrl,
      twitterUrl:      schema.blocks.twitterUrl,
      facebookUrl:     schema.blocks.facebookUrl,
      kwaiUrl:         schema.blocks.kwaiUrl,
      onlyfansUrl:     schema.blocks.onlyfansUrl,
      spotifyUrl:      schema.blocks.spotifyUrl,
      isUgcCreator:    schema.blocks.isUgcCreator,
    })
    .from(schema.blocks)
    .where(eq(schema.blocks.status, 'active'))
    .orderBy(desc(schema.blocks.pixelCount))

  await redis.set(CACHE_KEY, blocks, { ex: CACHE_TTL })
  return blocks
}

// Invalida o cache quando um novo bloco é ativado
export async function invalidateBlocksCache() {
  await redis.del(CACHE_KEY)
}

// Retorna estatísticas gerais da grade
export async function getGridStats() {
  const cached = await redis.get('grid:stats')
  if (cached) return cached

  const result = await db
    .select({
      sold:   sql<number>`COALESCE(SUM(${schema.blocks.pixelCount}), 0)`,
      active: sql<number>`COUNT(*)`,
    })
    .from(schema.blocks)
    .where(eq(schema.blocks.status, 'active'))

  const stats = {
    sold:      Number(result[0]?.sold   ?? 0),
    active:    Number(result[0]?.active ?? 0),
    available: 1_000_000 - Number(result[0]?.sold ?? 0),
    total:     1_000_000,
    percent:   Math.round((Number(result[0]?.sold ?? 0) / 10_000)),
  }

  await redis.set('grid:stats', stats, { ex: 60 })
  return stats
}

// Últimas ativações reais — alimenta o feed de atividade da home (sem números
// inventados: some/renderiza vazio quando não há nada recente de verdade).
export async function getRecentActivations(limit = 8) {
  const rows = await db
    .select({
      instagramHandle: schema.blocks.instagramHandle,
      displayName:      schema.blocks.displayName,
      avatarUrl:        schema.blocks.avatarUrl,
      colorHex:         schema.blocks.colorHex,
      pixelCount:       schema.blocks.pixelCount,
      niche:            schema.blocks.niche,
      createdAt:        schema.blocks.createdAt,
    })
    .from(schema.blocks)
    .where(eq(schema.blocks.status, 'active'))
    .orderBy(desc(schema.blocks.createdAt))
    .limit(limit)

  return rows
}

// Busca bloco por handle do Instagram
export async function getBlockByHandle(handle: string) {
  const rows = await db
    .select()
    .from(schema.blocks)
    .where(
      and(
        eq(schema.blocks.instagramHandle, handle),
        eq(schema.blocks.status, 'active')
      )
    )
    .limit(1)
  return rows[0] ?? null
}

// Busca bloco por ID
export async function getBlockById(id: string) {
  const rows = await db
    .select()
    .from(schema.blocks)
    .where(eq(schema.blocks.id, id))
    .limit(1)
  return rows[0] ?? null
}

// Verifica se handle já está cadastrado
export async function isHandleTaken(handle: string): Promise<boolean> {
  const rows = await db
    .select({ id: schema.blocks.id })
    .from(schema.blocks)
    .where(
      and(
        eq(schema.blocks.instagramHandle, handle),
        sql`${schema.blocks.status} != 'suspended'`
      )
    )
    .limit(1)
  return rows.length > 0
}

// Verifica se uma área do grid já está (parcialmente) ocupada
// Conta blocos pending também — área fica reservada durante o pagamento
export async function isAreaOccupied(
  x: number,
  y: number,
  w: number,
  h: number
): Promise<boolean> {
  const rows = await db
    .select({ id: schema.blocks.id })
    .from(schema.blocks)
    .where(
      and(
        sql`${schema.blocks.status} != 'suspended'`,
        sql`${schema.blocks.pixelX} < ${x + w}`,
        sql`${schema.blocks.pixelX} + ${schema.blocks.pixelWidth} > ${x}`,
        sql`${schema.blocks.pixelY} < ${y + h}`,
        sql`${schema.blocks.pixelY} + ${schema.blocks.pixelHeight} > ${y}`
      )
    )
    .limit(1)
  return rows.length > 0
}

// Busca blocos com filtros (para portal de marcas)
export async function searchBlocks({
  niche,
  city,
  minPixels,
  keyword,
  ugcOnly,
  limit = 48,
  offset = 0,
}: {
  niche?:     string
  city?:      string
  minPixels?: number
  keyword?:   string
  ugcOnly?:   boolean
  limit?:     number
  offset?:    number
}) {
  const conditions = [eq(schema.blocks.status, 'active')]

  if (niche) {
    conditions.push(eq(schema.blocks.niche, niche as schema.Block['niche']))
  }
  if (city) {
    conditions.push(ilike(schema.blocks.city!, `%${city}%`))
  }
  if (minPixels) {
    conditions.push(gte(schema.blocks.pixelCount, minPixels))
  }
  if (ugcOnly) {
    conditions.push(eq(schema.blocks.isUgcCreator, true))
  }
  if (keyword) {
    conditions.push(
      or(
        ilike(schema.blocks.instagramHandle, `%${keyword}%`),
        ilike(schema.blocks.displayName, `%${keyword}%`)
      )!
    )
  }

  return db
    .select()
    .from(schema.blocks)
    .where(and(...conditions))
    // Busca de UGC ordena por mais recente — marca não liga pra seguidores
    // aqui, quer ver quem chegou agora. Busca normal continua por tamanho.
    .orderBy(ugcOnly ? desc(schema.blocks.createdAt) : desc(schema.blocks.pixelCount))
    .limit(limit)
    .offset(offset)
}

// Encontra posição livre na grade para um novo bloco
export async function findFreePosition(
  width: number,
  height: number
): Promise<{ x: number; y: number } | null> {
  const GRID_COLS = 1000
  const GRID_ROWS = 1000

  // Busca todos os blocos ocupados
  const occupied = await db
    .select({
      x: schema.blocks.pixelX,
      y: schema.blocks.pixelY,
      w: schema.blocks.pixelWidth,
      h: schema.blocks.pixelHeight,
    })
    .from(schema.blocks)
    .where(sql`${schema.blocks.status} != 'suspended'`)

  // Monta mapa de ocupação (Set de "x,y")
  const map = new Set<string>()
  for (const b of occupied) {
    for (let dx = 0; dx < b.w; dx++) {
      for (let dy = 0; dy < b.h; dy++) {
        map.add(`${b.x + dx},${b.y + dy}`)
      }
    }
  }

  // Busca varredura linha por linha
  for (let y = 0; y <= GRID_ROWS - height; y++) {
    for (let x = 0; x <= GRID_COLS - width; x++) {
      let free = true
      outer: for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < height; dy++) {
          if (map.has(`${x + dx},${y + dy}`)) {
            free = false
            break outer
          }
        }
      }
      if (free) return { x, y }
    }
  }

  return null  // Grade cheia
}

// Ativa um bloco após pagamento confirmado
export async function activateBlock(blockId: string) {
  await db
    .update(schema.blocks)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(schema.blocks.id, blockId))

  await invalidateBlocksCache()
  await redis.del('grid:stats')
}

// Atualiza dados do perfil
export async function updateBlock(
  blockId: string,
  data: Partial<schema.NewBlock>
) {
  await db
    .update(schema.blocks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.blocks.id, blockId))

  await invalidateBlocksCache()
}

// Destaque do mês — quem mais garantiu espaço no calendário atual, sem mexer
// no ranking permanente (que continua por pixelCount total, para sempre).
export async function getTopThisMonth(limit = 5) {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)

  return db
    .select()
    .from(schema.blocks)
    .where(and(eq(schema.blocks.status, 'active'), sql`${schema.blocks.createdAt} >= ${start}`))
    .orderBy(desc(schema.blocks.pixelCount))
    .limit(limit)
}

// Top N blocos por pixels (ranking)
export async function getTopBlocks(limit = 50) {
  return db
    .select()
    .from(schema.blocks)
    .where(eq(schema.blocks.status, 'active'))
    .orderBy(desc(schema.blocks.pixelCount))
    .limit(limit)
}

// Posição real de um bloco no ranking geral e dentro do próprio nicho
export async function getBlockRanking(blockId: string) {
  const [block] = await db
    .select({ pixelCount: schema.blocks.pixelCount, niche: schema.blocks.niche })
    .from(schema.blocks)
    .where(eq(schema.blocks.id, blockId))
    .limit(1)
  if (!block) return null

  const [overall] = await db
    .select({ ahead: sql<number>`count(*)::int` })
    .from(schema.blocks)
    .where(and(eq(schema.blocks.status, 'active'), sql`${schema.blocks.pixelCount} > ${block.pixelCount}`))

  const [inNiche] = await db
    .select({ ahead: sql<number>`count(*)::int` })
    .from(schema.blocks)
    .where(and(
      eq(schema.blocks.status, 'active'),
      eq(schema.blocks.niche, block.niche),
      sql`${schema.blocks.pixelCount} > ${block.pixelCount}`
    ))

  const [totals] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(schema.blocks)
    .where(eq(schema.blocks.status, 'active'))

  const [totalsNiche] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(schema.blocks)
    .where(and(eq(schema.blocks.status, 'active'), eq(schema.blocks.niche, block.niche)))

  return {
    position:      (overall?.ahead ?? 0) + 1,
    total:         totals?.total ?? 0,
    nichePosition: (inNiche?.ahead ?? 0) + 1,
    nicheTotal:    totalsNiche?.total ?? 0,
  }
}

// Badges de marco — status colecionável, calculado (não é campo salvo).
// Fundador = entre os 100 primeiros cadastros ativos (por ordem de chegada,
// não por tamanho). Top 10 do nicho reaproveita getBlockRanking. Tamanho é
// por faixa de pixelCount, só a maior faixa alcançada.
export async function getBlockBadges(blockId: string): Promise<import('@/types').Badge[]> {
  const [block] = await db
    .select({ createdAt: schema.blocks.createdAt, pixelCount: schema.blocks.pixelCount, niche: schema.blocks.niche })
    .from(schema.blocks)
    .where(eq(schema.blocks.id, blockId))
    .limit(1)
  if (!block) return []

  const badges: import('@/types').Badge[] = []

  const [signupRank] = await db
    .select({ before: sql<number>`count(*)::int` })
    .from(schema.blocks)
    .where(and(eq(schema.blocks.status, 'active'), sql`${schema.blocks.createdAt} < ${block.createdAt}`))
  if ((signupRank?.before ?? 0) < 100) {
    badges.push({ key: 'founder', label: 'Fundador', desc: 'Um dos 100 primeiros espaços do mapa', color: '#FFD700', icon: '🏆' })
  }

  const ranking = await getBlockRanking(blockId)
  if (ranking && ranking.nichePosition <= 10 && ranking.nicheTotal >= 3) {
    badges.push({ key: 'top10-niche', label: 'Top 10 do nicho', desc: 'Entre os 10 maiores espaços da categoria', color: '#FFD700', icon: '⭐' })
  }

  const tiers: [number, string, string, string][] = [
    [10000, 'tier-imperio', 'Império', '👑'],
    [2500,  'tier-grande',  'Espaço grande', '🚀'],
    [900,   'tier-solido',  'Espaço sólido', '💪'],
    [100,   'tier-inicial', 'Primeiro espaço', '🌱'],
  ]
  const tier = tiers.find(([min]) => block.pixelCount >= min)
  if (tier) {
    const [, key, label, icon] = tier
    badges.push({ key, label, desc: `${block.pixelCount.toLocaleString('pt-BR')} pixels no mapa`, color: '#FFD700', icon })
  }

  return badges
}

