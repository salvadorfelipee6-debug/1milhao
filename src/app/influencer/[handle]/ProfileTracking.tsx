'use client'

import { useEffect } from 'react'

function track(blockId: string, eventType: string) {
  fetch('/api/track', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ blockId, eventType }),
  }).catch(() => {})
}

export function ProfileTracking({ blockId }: { blockId: string }) {
  useEffect(() => {
    track(blockId, 'view')

    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]')
      if (!el) return
      track(blockId, el.dataset.track!)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [blockId])

  return null
}
