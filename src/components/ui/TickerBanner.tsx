'use client'

export function TickerBanner() {
  const items = [
    '⚡ COMPRE SEU PIXEL APENAS R$ 0,99',
    '🔥 Espaço permanente no mapa dos influencers do Brasil',
    '💎 Pagamento único · sem renovação · vitalício',
    '📍 991.200 pixels disponíveis — garanta o seu agora',
    '✨ Link-in-bio profissional incluso gratuitamente',
    '🚀 Marcas buscando influencers agora nesse mapa',
  ]

  // Duplica para loop infinito
  const allItems = [...items, ...items]

  return (
    <div
      className="overflow-hidden"
      style={{ background: '#FFD700', height: '28px', display: 'flex', alignItems: 'center' }}
    >
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: 'ticker 22s linear infinite' }}
      >
        {allItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3"
            style={{ fontSize: '11px', fontWeight: 500, color: '#111', padding: '0 28px' }}
          >
            {item}
            <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: '14px' }}>·</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}