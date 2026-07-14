import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getBlockByHandle } from '@/lib/db/blocks'
import { blockContactEmail } from '@/lib/payments'
import { sendWelcomeEmail } from '@/lib/email'
import { rateLimit } from '@/lib/cache'

const bodySchema = z.object({
  instagramHandle: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimit(`recover:${ip}`)
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 1 minuto.' },
        { status: 429 }
      )
    }

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Informe seu @ do Instagram.' }, { status: 400 })
    }

    const handle = parsed.data.instagramHandle.toLowerCase().replace('@', '').trim()
    const block  = await getBlockByHandle(handle)

    if (block?.editToken) {
      await sendWelcomeEmail({
        to:              blockContactEmail(block.instagramHandle),
        displayName:     block.displayName,
        instagramHandle: block.instagramHandle,
        pixelCount:      block.pixelCount,
        niche:           block.niche,
        editToken:       block.editToken,
        blockId:         block.id,
      })
    }

    // Resposta genérica — não revela se o @ existe ou não
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/auth/recover:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
