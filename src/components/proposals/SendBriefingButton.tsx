'use client'

import { useState } from 'react'
import { BriefingModal } from './BriefingModal'

interface Props {
  blockId:         string
  instagramHandle: string
  className?:      string
}

export function SendBriefingButton({ blockId, instagramHandle, className }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className ?? 'flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/25 bg-gold/8 py-3.5 text-sm font-bold text-gold transition-all hover:bg-gold/12 active:scale-[0.98]'}
      >
        💼 Enviar briefing de campanha
      </button>
      {open && (
        <BriefingModal
          blockId={blockId}
          instagramHandle={instagramHandle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
