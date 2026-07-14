'use client'

import { useState } from 'react'

export function ShareButton({ url, blockId }: { url: string; blockId: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    fetch('/api/track', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ blockId, eventType: 'share' }),
    }).catch(() => {})

    try {
      if (typeof navigator.share === 'function' && /Mobi/i.test(navigator.userAgent)) {
        await navigator.share({ url })
        return
      }
    } catch {
      // usuário cancelou o share nativo — segue para copiar
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
      style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)' }}
    >
      {copied ? (
        <>✓ copiado</>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
          </svg>
          compartilhar
        </>
      )}
    </button>
  )
}
