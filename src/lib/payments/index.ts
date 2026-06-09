import 'server-only'
import Stripe from 'stripe'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { db, schema } from '../db'
import { eq } from 'drizzle-orm'
import { activateBlock } from '../db/blocks'
import { publishBlockActivated } from '../realtime'
import { sendWelcomeEmail } from '../email'

// ─── Clientes ─────────────────────────────────────────────
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// ─── Preço por pixel ──────────────────────────────────────
export const PIXEL_PRICE_BRL = 0.99

export function calculatePrice(pixelCount: number) {
  return Math.round(pixelCount * PIXEL_PRICE_BRL * 100) / 100
}

export function calculateDimensions(pixelCount: number) {
  const side = Math.max(10, Math.round(Math.sqrt(pixelCount)))
  return {
    width:  side,
    height: side,
    actual: side * side,
  }
}

// ─── Stripe ───────────────────────────────────────────────
export async function createStripeCheckout({
  blockId, pixelCount, email, instagramHandle,
}: {
  blockId: string; pixelCount: number; email: string; instagramHandle: string
}) {
  const price = calculatePrice(pixelCount)

  const session = await stripe.checkout.sessions.create({
    mode:                 'payment',
    payment_method_types: ['card'],
    customer_email:       email,
    line_items: [{
      quantity:   1,
      price_data: {
        currency:     'brl',
        unit_amount:  Math.round(price * 100),
        product_data: {
          name:        `${pixelCount.toLocaleString('pt-BR')} pixels — 1 Milhão de Influencer`,
          description: `Espaço permanente de @${instagramHandle} na grade`,
        },
      },
    }],
    metadata:    { blockId, pixelCount: pixelCount.toString(), instagramHandle },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/comprar/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/comprar?cancelado=1`,
    expires_at:  Math.floor(Date.now() / 1000) + 30 * 60,
  })

  await db.insert(schema.payments).values({
    blockId,
    provider:   'stripe',
    externalId: session.id,
    pixelCount,
    amountBrl:  price.toString(),
    status:     'pending',
  })

  return session.url!
}

export async function handleStripeWebhook(payload: string, signature: string) {
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    throw new Error('Webhook Stripe inválido')
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status !== 'paid') return
    const { blockId, instagramHandle } = session.metadata!
    await confirmPayment({ blockId: blockId!, externalId: session.id, instagramHandle: instagramHandle! })
  }
}

// ─── Mercado Pago ─────────────────────────────────────────
export async function createMercadoPagoPreference({
  blockId, pixelCount, email, instagramHandle,
}: {
  blockId: string; pixelCount: number; email: string; instagramHandle: string
}) {
  const price  = calculatePrice(pixelCount)
  const client = new Preference(mp)

  const preference = await client.create({
    body: {
      items: [{
        id:          blockId,
        title:       `${pixelCount.toLocaleString('pt-BR')} pixels — 1 Milhão de Influencer`,
        description: `Espaço permanente de @${instagramHandle}`,
        quantity:    1,
        unit_price:  price,
        currency_id: 'BRL',
      }],
      payer:        { email },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/comprar/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/comprar?cancelado=1`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/comprar/pendente`,
      },
      auto_return:          'approved',
      external_reference:   blockId,
      notification_url:     `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`,
      statement_descriptor: '1MILHAOINFLUENCER',
    },
  })

  await db.insert(schema.payments).values({
    blockId,
    provider:   'mercadopago',
    externalId: preference.id ?? '',
    pixelCount,
    amountBrl:  price.toString(),
    status:     'pending',
  })

  return { preferenceId: preference.id, initPoint: preference.init_point, pixUrl: null }
}

export async function handleMercadoPagoWebhook(body: { type: string; data: { id: string } }) {
  if (body.type !== 'payment') return

  const res     = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  })
  const payment = await res.json()
  if (payment.status !== 'approved') return

  const blockId = payment.external_reference as string
  const block   = await db.query.blocks.findFirst({ where: (b, { eq }) => eq(b.id, blockId) })
  if (!block) return

  await confirmPayment({ blockId, externalId: body.data.id, instagramHandle: block.instagramHandle })
}

async function confirmPayment({ blockId, externalId, instagramHandle }: {
  blockId: string; externalId: string; instagramHandle: string
}) {
  await db.update(schema.payments)
    .set({ status: 'paid', paidAt: new Date() })
    .where(eq(schema.payments.externalId, externalId))

  await activateBlock(blockId)

  const block = await db.query.blocks.findFirst({ where: (b, { eq }) => eq(b.id, blockId) })
  if (!block) return

  await publishBlockActivated(block)

  await sendWelcomeEmail({
    to:              block.editToken ? `${block.instagramHandle}@placeholder.com` : '',
    displayName:     block.displayName,
    instagramHandle: block.instagramHandle,
    pixelCount:      block.pixelCount,
    niche:           block.niche,
    editToken:       block.editToken ?? '',
    blockId:         block.id,
  })
}