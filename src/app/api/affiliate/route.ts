import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { getOrCreateAffiliate, setAffiliatePixKey } from '@/lib/db/affiliates'

async function blockByToken(token: string) {
  const rows = await db.select().from(schema.blocks).where(eq(schema.blocks.editToken, token)).limit(1)
  return rows[0] ?? null
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token obrigatório.' }, { status: 401 })

  const block = await blockByToken(token)
  if (!block) return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })

  const affiliate = await getOrCreateAffiliate(block.id, block.instagramHandle)
  return NextResponse.json({ affiliate })
}

const bodySchema = z.object({ token: z.string().min(1), pixKey: z.string().max(200) })

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })

  const block = await blockByToken(parsed.data.token)
  if (!block) return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })

  await setAffiliatePixKey(block.id, parsed.data.pixKey)
  return NextResponse.json({ ok: true })
}
