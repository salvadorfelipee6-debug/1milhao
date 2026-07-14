import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getBrandByClerkUserId } from '@/lib/db/brands'
import { createProposal, getProposalsForBrand } from '@/lib/db/proposals'
import { getBlockById } from '@/lib/db/blocks'
import { rateLimit } from '@/lib/cache'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const brand = await getBrandByClerkUserId(userId)
  if (!brand) return NextResponse.json({ proposals: [] })

  const proposals = await getProposalsForBrand(brand.id)
  return NextResponse.json({ proposals })
}

const bodySchema = z.object({
  blockId:      z.string().uuid(),
  message:      z.string().min(10).max(1000),
  budget:       z.string().max(50).optional(),
  campaignType: z.string().max(80).optional(),
  deadline:     z.string().max(50).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Faça login como marca para enviar um briefing.' }, { status: 401 })

    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimit(`proposal:${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, { status: 429 })
    }

    const brand = await getBrandByClerkUserId(userId)
    if (!brand) {
      return NextResponse.json({ error: 'Complete seu perfil de marca antes de enviar um briefing.', needsOnboarding: true }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Preencha a mensagem do briefing (mínimo 10 caracteres).' }, { status: 400 })
    }

    const block = await getBlockById(parsed.data.blockId)
    if (!block) return NextResponse.json({ error: 'Influencer não encontrado.' }, { status: 404 })

    const proposal = await createProposal({ brandId: brand.id, ...parsed.data })
    return NextResponse.json({ ok: true, proposal })
  } catch (err) {
    console.error('POST /api/proposals:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
