import 'server-only'
import { db, schema } from '.'
import { eq, sql } from 'drizzle-orm'

export async function getAffiliateByBlockId(blockId: string) {
  const rows = await db.select().from(schema.affiliates).where(eq(schema.affiliates.blockId, blockId)).limit(1)
  return rows[0] ?? null
}

export async function getAffiliateByRefCode(refCode: string) {
  const rows = await db.select().from(schema.affiliates).where(eq(schema.affiliates.refCode, refCode)).limit(1)
  return rows[0] ?? null
}

// Todo bloco ativo pode virar afiliado — o link é criado sob demanda na
// primeira vez que o painel pede (refCode = o próprio @, já único).
export async function getOrCreateAffiliate(blockId: string, instagramHandle: string) {
  const existing = await getAffiliateByBlockId(blockId)
  if (existing) return existing

  const [affiliate] = await db
    .insert(schema.affiliates)
    .values({ blockId, refCode: instagramHandle })
    .onConflictDoNothing()
    .returning()

  return affiliate ?? (await getAffiliateByBlockId(blockId))
}

export async function incrementAffiliateClicks(refCode: string) {
  await db
    .update(schema.affiliates)
    .set({ totalClicks: sql`${schema.affiliates.totalClicks} + 1` })
    .where(eq(schema.affiliates.refCode, refCode))
}

export async function incrementAffiliateSignups(refCode: string) {
  await db
    .update(schema.affiliates)
    .set({ totalSignups: sql`${schema.affiliates.totalSignups} + 1` })
    .where(eq(schema.affiliates.refCode, refCode))
}

export async function setAffiliatePixKey(blockId: string, pixKey: string) {
  await db.update(schema.affiliates).set({ pixKey }).where(eq(schema.affiliates.blockId, blockId))
}
