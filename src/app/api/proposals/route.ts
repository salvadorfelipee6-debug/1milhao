import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateBrandByEmail } from '@/lib/db/brands'
import { createProposal } from '@/lib/db/proposals'
import { getBlockById } from '@/lib/db/blocks'
import { rateLimit } from '@/lib/cache'

const bodySchema = z.object({
  blockId:         z.string().uuid(),
  companyName:     z.string().min(1).max(150),
  segment:         z.string().max(80).optional(),
  contactName:     z.string().min(1).max(150),
  contactEmail:    z.string().email(),
  contactWhatsapp: z.string().max(30).optional(),
  message:         z.string().min(10).max(1000),
  budget:          z.string().max(50).optional(),
  campaignType:    z.string().max(80).optional(),
  deadline:        z.string().max(50).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimit(`proposal:${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, { status: 429 })
    }

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Preencha os dados da empresa e a mensagem do briefing (mínimo 10 caracteres).' }, { status: 400 })
    }

    const { blockId, companyName, segment, contactName, contactEmail, contactWhatsapp, ...briefing } = parsed.data

    const block = await getBlockById(blockId)
    if (!block) return NextResponse.json({ error: 'Influencer não encontrado.' }, { status: 404 })

    const brand = await getOrCreateBrandByEmail({ companyName, segment, contactName, contactEmail, contactWhatsapp })
    const proposal = await createProposal({ brandId: brand.id, blockId, ...briefing })
    return NextResponse.json({ ok: true, proposal })
  } catch (err) {
    console.error('POST /api/proposals:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
