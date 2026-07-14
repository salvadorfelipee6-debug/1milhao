import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getBrandByClerkUserId, createBrand } from '@/lib/db/brands'

const bodySchema = z.object({
  companyName:     z.string().min(1).max(150),
  segment:         z.string().max(80).optional(),
  contactName:     z.string().min(1).max(150),
  contactEmail:    z.string().email(),
  contactWhatsapp: z.string().max(30).optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const brand = await getBrandByClerkUserId(userId)
  return NextResponse.json({ brand })
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const existing = await getBrandByClerkUserId(userId)
    if (existing) return NextResponse.json({ brand: existing })

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const brand = await createBrand({ clerkUserId: userId, ...parsed.data })
    return NextResponse.json({ brand })
  } catch (err) {
    console.error('POST /api/brands:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
