import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { invalidateBlocksCache } from '@/lib/db/blocks'
import { redis } from '@/lib/cache'

const urlOrEmpty = z.string().url().optional().or(z.literal(''))

const bodySchema = z.object({
  token:        z.string().min(1),
  displayName:  z.string().min(1).max(150),
  niche:        z.enum(['fitness','moda','tecnologia','gastronomia','beleza','viagens','games','financas','familia','humor','educacao','outros']),
  city:         z.string().max(80).optional(),
  followers:    z.string().max(30).optional(),
  bio:          z.string().max(120).optional(),
  videoUrl:     urlOrEmpty,
  avatarUrl:    urlOrEmpty,
  websiteUrl:   urlOrEmpty,
  whatsappUrl:  z.string().max(30).optional(),
  youtubeUrl:   urlOrEmpty,
  tiktokUrl:    urlOrEmpty,
  twitterUrl:   urlOrEmpty,
  facebookUrl:  urlOrEmpty,
  kwaiUrl:      urlOrEmpty,
  onlyfansUrl:  urlOrEmpty,
  spotifyUrl:   urlOrEmpty,
  customLinks:  z.array(z.object({
    label: z.string().max(60),
    url:   z.string().url(),
    emoji: z.string().max(4).optional(),
  })).max(6).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const { token, customLinks, ...data } = parsed.data

    // Busca bloco pelo editToken
    const rows = await db
      .select({ id: schema.blocks.id })
      .from(schema.blocks)
      .where(eq(schema.blocks.editToken, token))
      .limit(1)

    if (!rows[0]) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
    }

    const blockId = rows[0].id

    await db
      .update(schema.blocks)
      .set({
        displayName:  data.displayName,
        niche:        data.niche,
        city:         data.city       || null,
        followers:    data.followers  || null,
        bio:          data.bio        || null,
        videoUrl:     data.videoUrl   || null,
        avatarUrl:    data.avatarUrl  || null,
        websiteUrl:   data.websiteUrl || null,
        whatsappUrl:  data.whatsappUrl || null,
        youtubeUrl:   data.youtubeUrl  || null,
        tiktokUrl:    data.tiktokUrl   || null,
        twitterUrl:   data.twitterUrl  || null,
        facebookUrl:  data.facebookUrl || null,
        kwaiUrl:      data.kwaiUrl     || null,
        onlyfansUrl:  data.onlyfansUrl || null,
        spotifyUrl:   data.spotifyUrl  || null,
        customLinks:  customLinks ? JSON.stringify(customLinks) : null,
        updatedAt:    new Date(),
      })
      .where(eq(schema.blocks.id, blockId))

    await invalidateBlocksCache()
    await redis.del('grid:stats')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/painel:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
