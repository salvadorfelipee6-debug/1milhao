import { NextRequest, NextResponse } from 'next/server'
import { createAblyToken } from '@/lib/realtime'

export async function GET(req: NextRequest) {
  try {
    // Gera um clientId anônimo único por sessão
    const clientId = crypto.randomUUID()
    const token    = await createAblyToken(clientId)
    return NextResponse.json(token)
  } catch (err) {
    console.error('Ably token error:', err)
    return NextResponse.json({ error: 'Token error' }, { status: 500 })
  }
}
