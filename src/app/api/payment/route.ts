import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/lib/db'
import {
  calculateDimensions,
  createStripeCheckout,
  createMercadoPagoPreference,
} from '@/lib/payments'
import {
  findFreePosition,
  isHandleTaken,
  getGridStats,
} from '@/lib/db/blocks'
import { rateLimit } from '@/lib/cache'
import { NICHE_COLORS } from '@/types'
import crypto from 'crypto'

const urlOrEmpty = z.string().url().optional().or(z.literal(''))

const bodySchema = z.object({
  instagramHandle:  z.string().min(1).max(100).regex(/^[a-zA-Z0-9._]+$/),
  displayName:      z.string().min(1).max(150),
  niche:            z.enum(['fitness','moda','tecnologia','gastronomia','beleza','viagens','games','financas','familia','humor','educacao','outros']),
  city:             z.string().max(80).optional(),
  followers:        z.string().max(30).optional(),
  bio:              z.string().max(120).optional(),
  videoUrl:         urlOrEmpty,
  websiteUrl:       urlOrEmpty,
  avatarUrl:        urlOrEmpty,
  email:            z.string().email(),
  pixelCount:       z.number().int().min(100).max(40000),
  paymentProvider:  z.enum(['stripe', 'mercadopago']),
  // Redes sociais
  whatsappUrl:      z.string().max(30).optional(),
  youtubeUrl:       urlOrEmpty,
  tiktokUrl:        urlOrEmpty,
  twitterUrl:       urlOrEmpty,
  facebookUrl:      urlOrEmpty,
  kwaiUrl:          urlOrEmpty,
  onlyfansUrl:      urlOrEmpty,
  spotifyUrl:       urlOrEmpty,
  // Coordenadas opcionais (quando vem da seleção do grid)
  pixelX:           z.number().int().optional(),
  pixelY:           z.number().int().optional(),
  pixelWidth:       z.number().int().optional(),
  pixelHeight:      z.number().int().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting — máximo 5 tentativas por IP por minuto
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 1 minuto.' },
        { status: 429 }
      )
    }

    // Valida body
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data   = parsed.data
    const handle = data.instagramHandle.toLowerCase().replace('@', '')

    // Verifica se handle já existe
    if (await isHandleTaken(handle)) {
      return NextResponse.json(
        { error: 'Este @ do Instagram já está cadastrado.' },
        { status: 409 }
      )
    }

    // Verifica pixels disponíveis
    const stats = await getGridStats()
    if (stats.available < data.pixelCount) {
      return NextResponse.json(
        { error: 'Pixels insuficientes disponíveis.' },
        { status: 409 }
      )
    }

    // Calcula dimensões — usa coordenadas do grid se fornecidas
    const dims = (data.pixelWidth && data.pixelHeight)
      ? { width: data.pixelWidth, height: data.pixelHeight, actual: data.pixelWidth * data.pixelHeight }
      : calculateDimensions(data.pixelCount)

    // Posição — usa a selecionada no grid ou encontra uma livre
    let pos: { x: number; y: number }
    if (data.pixelX !== undefined && data.pixelY !== undefined) {
      pos = { x: data.pixelX, y: data.pixelY }
    } else {
      const found = await findFreePosition(dims.width, dims.height)
      if (!found) {
        return NextResponse.json(
          { error: 'Grade cheia — não foi possível encontrar espaço.' },
          { status: 409 }
        )
      }
      pos = found
    }

    // Cor baseada no nicho
    const colorHex  = NICHE_COLORS[data.niche] ?? '#E1306C'
    const editToken = crypto.randomBytes(32).toString('hex')

    // Insere bloco como pendente
    const [block] = await db
      .insert(schema.blocks)
      .values({
        userId:          'anonymous',
        instagramHandle: handle,
        displayName:     data.displayName,
        niche:           data.niche,
        city:            data.city       ?? null,
        followers:       data.followers  ?? null,
        bio:             data.bio        ?? null,
        videoUrl:        data.videoUrl   || null,
        websiteUrl:      data.websiteUrl || null,
        avatarUrl:       data.avatarUrl  || null,
        colorHex,
        // Redes sociais
        whatsappUrl:     data.whatsappUrl  || null,
        youtubeUrl:      data.youtubeUrl   || null,
        tiktokUrl:       data.tiktokUrl    || null,
        twitterUrl:      data.twitterUrl   || null,
        facebookUrl:     data.facebookUrl  || null,
        kwaiUrl:         data.kwaiUrl      || null,
        onlyfansUrl:     data.onlyfansUrl  || null,
        spotifyUrl:      data.spotifyUrl   || null,
        // Posição
        pixelX:          pos.x,
        pixelY:          pos.y,
        pixelWidth:      dims.width,
        pixelHeight:     dims.height,
        pixelCount:      dims.actual,
        status:          'pending',
        editToken,
      })
      .returning()

    if (!block) throw new Error('Falha ao inserir bloco')

    // Cria sessão de pagamento
    if (data.paymentProvider === 'stripe') {
      const checkoutUrl = await createStripeCheckout({
        blockId:         block.id,
        pixelCount:      dims.actual,
        email:           data.email,
        instagramHandle: handle,
      })
      return NextResponse.json({ checkoutUrl, blockId: block.id })
    } else {
      const { preferenceId, initPoint } = await createMercadoPagoPreference({
        blockId:         block.id,
        pixelCount:      dims.actual,
        email:           data.email,
        instagramHandle: handle,
      })
      return NextResponse.json({ preferenceId, initPoint, blockId: block.id })
    }
  } catch (err) {
    console.error('POST /api/payment:', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}