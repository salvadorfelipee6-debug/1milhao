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
  if (!brand) throw new Error('Falha ao criar marca.')
  return brand
}

// Marcas não têm login próprio — cada briefing já vem com os dados de contato.
// Reaproveita a coluna clerkUserId (chave de identidade opaca e única) com uma
// chave sintética baseada no e-mail, pra não duplicar marca a cada envio.
export async function getOrCreateBrandByEmail(data: {
  companyName:     string
  segment?:        string
  contactName:     string
  contactEmail:    string
  contactWhatsapp?: string
}) {
  const key = `email:${data.contactEmail.trim().toLowerCase()}`
  const existing = await getBrandByClerkUserId(key)
  if (existing) return existing
  return createBrand({ clerkUserId: key, ...data })
}
