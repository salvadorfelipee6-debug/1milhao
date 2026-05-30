import { NextRequest, NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/lib/payments'

// Necessário para receber o body raw do Stripe


export async function POST(req: NextRequest) {
  const payload   = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  try {
    await handleStripeWebhook(payload, signature)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 400 }
    )
  }
}

