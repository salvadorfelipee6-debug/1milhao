import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Fallback da página de sucesso: busca o bloco pelo UUID
// ou pelo externalId do pagamento (ex.: session_id do Stripe)
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ block: null }, { status: 400 })
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let block = null
    if (isUuid) {
      block = await db.query.blocks.findFirst({
        where: (b, { eq }) => eq(b.id, id),
      }) ?? null
    } else {
      const payment = await db.query.payments.findFirst({
        where: (p, { eq }) => eq(p.externalId, id),
      })
      if (payment) {
        block = await db.query.blocks.findFirst({
          where: (b, { eq }) => eq(b.id, payment.blockId),
        }) ?? null
      }
    }

    // Só confirma blocos já ativados — pending continua aguardando
    if (!block || block.status !== 'active') {
      return NextResponse.json({ block: null })
    }
    return NextResponse.json({ block })
  } catch (err) {
    console.error('GET /api/block:', err)
    return NextResponse.json({ block: null }, { status: 500 })
  }
}
