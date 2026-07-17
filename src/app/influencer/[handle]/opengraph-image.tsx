import { ImageResponse } from 'next/og'
import { getBlockByHandle } from '@/lib/db/blocks'
import { NICHE_LABELS } from '@/types'

export const alt = 'Perfil no 1 Milhão de Influencer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const block = await getBlockByHandle(handle)

  const color      = block?.colorHex || '#E1306C'
  const displayName = block?.displayName || handle
  const nicheLabel  = block ? (NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS] ?? block.niche) : ''
  const initials    = displayName.slice(0, 2).toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          background: `linear-gradient(135deg, ${color}33 0%, #0d0d0d 55%)`,
          padding: 64, position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              width: 180, height: 180, borderRadius: 40, display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              background: color, border: '6px solid #0d0d0d', color: '#fff',
              fontSize: 64, fontWeight: 700, boxShadow: `0 20px 60px ${color}55`,
            }}
          >
            {block?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={block.avatarUrl} width={180} height={180} style={{ objectFit: 'cover' }} alt="" />
            ) : initials}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, color: '#fff' }}>
              {displayName}
            </div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, color }}>
              @{handle}
            </div>
            {block && (
              <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
                {nicheLabel}{block.city ? ` · ${block.city}` : ''}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 56 }}>
          {block?.followers && (
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 32px' }}>
              <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, color: '#FFD700' }}>{block.followers}</div>
              <div style={{ display: 'flex', fontSize: 20, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2 }}>seguidores</div>
            </div>
          )}
          {block && (
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 32px' }}>
              <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, color: '#FFD700' }}>{block.pixelCount.toLocaleString('pt-BR')}</div>
              <div style={{ display: 'flex', fontSize: 20, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2 }}>pixels</div>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, position: 'absolute',
            bottom: 56, right: 64, background: 'rgba(255,215,0,0.15)',
            border: '2px solid rgba(255,215,0,0.4)', borderRadius: 16,
            padding: '14px 26px', fontSize: 28, fontWeight: 700, color: '#FFD700',
          }}
        >
1 MILHÃO DE INFLUENCER
        </div>
      </div>
    ),
    { ...size }
  )
}
