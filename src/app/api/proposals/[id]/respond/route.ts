import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { respondToProposal } from '@/lib/db/proposals'

const bodySchema = z.object({
  token:  z.string().min(1),
  status: z.enum(['accepted', 'declined']),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })

    const rows = await db
      .select({ id: schema.blocks.id })
      .from(schema.blocks)
      .where(eq(schema.blocks.editToken, parsed.data.token))
      .limit(1)

    if (!rows[0]) return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })

    const ok = await respondToProposal(id, rows[0].id, parsed.data.status)
    if (!ok) return NextResponse.json({ error: 'Proposta não encontrada.' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/proposals/[id]/respond:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
