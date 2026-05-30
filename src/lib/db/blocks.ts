import 'server-only'
import { db, schema } from '.'
import { eq, and, gte, sql, desc, like, or } from 'drizzle-orm'
import { redis } from '../cache'

const CACHE_KEY   = 'blocks:all'
const CACHE_TTL   = 60 * 5  // 5 minutos

export type BlockForGrid = Pick<
  schema.Block,
  | 'id' | 'instagramHandle' | 'displayName' | 'niche' | 'city'
  | 'followers' | 'bio' | 'videoUrl' | 'websiteUrl' | 'avatarUrl'
  | 'colorHex' | 'pixelX' | 'pixelY' | 'pixelWidth' | 'pixelHeight'
  | 'pixelCount'
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

// Busca blocos com filtros (para portal de marcas)
export async function searchBlocks({
  niche,
  city,
  minPixels,
  keyword,
  limit = 48,
  offset = 0,
}: {
  niche?:     string
  city?:      string
  minPixels?: number
  keyword?:   string
  limit?:     number
  offset?:    number
}) {
  const conditions = [eq(schema.blocks.status, 'active')]

  if (niche) {
    conditions.push(eq(schema.blocks.niche, niche as schema.Block['niche']))
  }
  if (city) {
    conditions.push(like(schema.blocks.city!, `%${city}%`))
  }
  if (minPixels) {
    conditions.push(gte(schema.blocks.pixelCount, minPixels))
  }
  if (keyword) {
    conditions.push(
      or(
        like(schema.blocks.instagramHandle, `%${keyword}%`),
        like(schema.blocks.displayName, `%${keyword}%`)
      )!
    )
  }

  return db
    .select()
    .from(schema.blocks)
    .where(and(...conditions))
    .orderBy(desc(schema.blocks.pixelCount))
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

// Top N blocos por pixels (ranking)
export async function getTopBlocks(limit = 50) {
  return db
    .select()
    .from(schema.blocks)
    .where(eq(schema.blocks.status, 'active'))
    .orderBy(desc(schema.blocks.pixelCount))
    .limit(limit)
}

