import { NextResponse } from 'next/server'
import { getActiveBlocksForGrid, getGridStats } from '@/lib/db/blocks'

export const revalidate = 60

export async function GET() {
  try {
    const [blocks, stats] = await Promise.all([
      getActiveBlocksForGrid(),
      getGridStats(),
    ])
    return NextResponse.json({ blocks, stats })
  } catch (err) {
    console.error('GET /api/blocks:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
