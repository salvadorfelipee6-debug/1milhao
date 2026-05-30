import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/lib/db'
import { rateLimit } from '@/lib/cache'

const schema_ = z.object({
  blockId:   z.string().uuid(),
  eventType: z.enum(['view','popup_open','ig_click','advertise_click','video_play']),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anon'
    // Rate limit generoso — 60 eventos por minuto por IP
    const { success } = await rateLimit(`track:${ip}`)
    if (!success) return NextResponse.json({ ok: false })

    const body   = await req.json()
    const parsed = schema_.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false })

    const { blockId, eventType } = parsed.data

    // Insere evento de analytics de forma assíncrona (não bloqueia o cliente)
    await db.insert(schema.analytics).values({
      blockId,
      eventType,
      ip: ip.slice(0, 45),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}

