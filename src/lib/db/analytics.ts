import 'server-only'
import { db, schema } from '.'
import { eq, and, gte, sql } from 'drizzle-orm'

export interface BlockStats {
  views:        number
  advertiseClicks: number
  shares:       number
  socialClicks: { key: string; count: number }[]
  customLinkClicks: { index: number; count: number }[]
}

// Estatísticas dos últimos 7 dias de um bloco, pro dono ver no painel
export async function getBlockStats(blockId: string): Promise<BlockStats> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select({
      eventType: schema.analytics.eventType,
      count:     sql<number>`count(*)::int`,
    })
    .from(schema.analytics)
    .where(and(eq(schema.analytics.blockId, blockId), gte(schema.analytics.eventDate, since)))
    .groupBy(schema.analytics.eventType)

  let views = 0
  let advertiseClicks = 0
  let shares = 0
  const socialClicks: { key: string; count: number }[] = []
  const customLinkClicks: { index: number; count: number }[] = []

  for (const row of rows) {
    if (row.eventType === 'view')             views = row.count
    else if (row.eventType === 'advertise_click') advertiseClicks = row.count
    else if (row.eventType === 'share')        shares = row.count
    else if (row.eventType.startsWith('social:'))
      socialClicks.push({ key: row.eventType.slice('social:'.length), count: row.count })
    else if (row.eventType.startsWith('custom_link:'))
      customLinkClicks.push({ index: Number(row.eventType.slice('custom_link:'.length)), count: row.count })
  }

  socialClicks.sort((a, b) => b.count - a.count)
  customLinkClicks.sort((a, b) => a.index - b.index)

  return { views, advertiseClicks, shares, socialClicks, customLinkClicks }
}
