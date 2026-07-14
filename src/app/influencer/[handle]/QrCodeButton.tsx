'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

export function QrCodeButton({ url, blockId }: { url: string; blockId: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function open() {
    setLoading(true)
    try {
      const png = await QRCode.toDataURL(url, {
        width:   480,
        margin:  2,
        color:   { dark: '#0d0d0d', light: '#ffffff' },
      })
      setDataUrl(png)
      fetch('/api/track', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ blockId, eventType: 'qr_generate' }),
      }).catch(() => {})
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={open}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
        style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17.5V20" />
        </svg>
        {loading ? '...' : 'QR code'}
      </button>

      {dataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setDataUrl(null)}
        >
          <div
            className="popup-enter w-full max-w-xs rounded-2xl border border-white/10 bg-dark-2 p-5 text-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-bold text-white">Seu QR code</p>
            <img src={dataUrl} alt="QR code do perfil" className="mx-auto rounded-xl" />
            <p className="mt-3 text-[11px] text-white/50">Aponte a câmera pra abrir seu perfil direto</p>
            <div className="mt-4 flex gap-2">
              <a
                href={dataUrl}
                download="1milhao-qrcode.png"
                className="btn-gold flex-1 py-2.5 text-xs"
              >
                Baixar
              </a>
              <button
                onClick={() => setDataUrl(null)}
                className="btn-ghost flex-1 py-2.5 text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
