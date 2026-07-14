import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/storage'
import { rateLimit } from '@/lib/cache'

const MAX_SIZE      = 2 * 1024 * 1024 // 2MB — mesmo limite anunciado na UI
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await rateLimit(`upload:${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, { status: 429 })
    }

    const form = await req.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato inválido. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Imagem muito grande (máx. 2MB).' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url    = await uploadImage(buffer, file.type)

    return NextResponse.json({ url })
  } catch (err) {
    console.error('POST /api/upload:', err)
    return NextResponse.json({ error: 'Erro ao enviar imagem.' }, { status: 500 })
  }
}
