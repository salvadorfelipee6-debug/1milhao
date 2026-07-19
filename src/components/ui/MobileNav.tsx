'use client'

import { useState } from 'react'
import Link from 'next/link'

const links = [
  { label: '🎰 Descobrir influencers', href: '/descobrir' },
  { label: 'Como funciona',     href: '/#como-funciona' },
  { label: 'Preços',            href: '/#precos' },
  { label: 'Ranking',           href: '/ranking' },
  { label: 'Para marcas',       href: '/marcas' },
  { label: 'Login anunciante',  href: '/login' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Navbar fixa no topo — só mobile */}
      <nav className="fixed top-8 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}
      >
        <Link href="/" className="font-display text-base text-white">
          1M <span style={{ color: '#FFD700' }}>INFLUENCER</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/comprar"
            className="rounded-lg px-3 py-1.5 text-xs font-bold"
            style={{ background: '#FFD700', color: '#111' }}
          >
            Garantir →
          </Link>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            aria-label="Menu"
          >
            <span className={`h-0.5 w-4 rounded-full bg-white transition-all ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-4 rounded-full bg-white transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-4 rounded-full bg-white transition-all ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Menu aberto */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 flex flex-col pt-20 px-6"
            style={{ background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)', borderLeft: '0.5px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              {links.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  {l.label}
                  <span className="text-white/45">→</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 border-t border-white/5 pt-6">
              <Link
                href="/comprar"
                onClick={() => setOpen(false)}
                className="block rounded-2xl py-4 text-center text-sm font-bold"
                style={{ background: '#FFD700', color: '#111' }}
              >
                Garantir meu espaço — a partir de R$ 0,99 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
