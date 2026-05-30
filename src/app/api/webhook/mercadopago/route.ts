import { NextRequest, NextResponse } from 'next/server'
import { handleMercadoPagoWebhook } from '@/lib/payments'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await handleMercadoPagoWebhook(body)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('MP webhook error:', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
