import 'server-only'
import { db, schema } from '.'
import { eq } from 'drizzle-orm'

export async function getBrandByClerkUserId(clerkUserId: string) {
  const rows = await db
    .select()
    .from(schema.brands)
    .where(eq(schema.brands.clerkUserId, clerkUserId))
    .limit(1)
  return rows[0] ?? null
}

export async function createBrand(data: {
  clerkUserId:     string
  companyName:     string
  segment?:        string
  contactName:     string
  contactEmail:    string
  contactWhatsapp?: string
}) {
  const [brand] = await db.insert(schema.brands).values(data).returning()
  return brand
}
