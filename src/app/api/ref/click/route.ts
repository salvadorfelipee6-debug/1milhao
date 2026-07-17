import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { incrementAffiliateClicks, getAffiliateByRefCode } from '@/lib/db/affiliates'
import { rateLimit } from '@/lib/cache'

const bodySchema = z.object({ refCode: z.string().min(1).max(100) })

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimit(`ref-click:${ip}`)
    if (!success) return NextResponse.json({ ok: true }) // silencioso, não é crítico

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ ok: true })

    const affiliate = await getAffiliateByRefCode(parsed.data.refCode)
    if (affiliate) await incrementAffiliateClicks(parsed.data.refCode)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/ref/click:', err)
    return NextResponse.json({ ok: true }) // não trava o fluxo de compra por causa de tracking
  }
}
