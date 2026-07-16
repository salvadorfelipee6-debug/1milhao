'use client'

import { useState, useRef, useEffect } from 'react'
import { loadCities, searchCities, type City } from '@/lib/cities'

interface Props {
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
}

export function CityAutocomplete({ value, onChange, placeholder = 'São Paulo, SP' }: Props) {
  const [all, setAll]           = useState<City[] | null>(null)
  const [open, setOpen]         = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function ensureLoaded() {
    if (all === null) loadCities().then(setAll)
  }

  const results = all ? searchCities(all, value) : []

  function pick(c: City) {
    onChange(`${c.nome}, ${c.uf}`)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        onFocus={() => { ensureLoaded(); setOpen(true) }}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlight(0) }}
        onKeyDown={e => {
          if (!open || results.length === 0) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => (h + 1) % results.length) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => (h - 1 + results.length) % results.length) }
          else if (e.key === 'Enter') { e.preventDefault(); const c = results[highlight]; if (c) pick(c) }
          else if (e.key === 'Escape') setOpen(false)
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="input-dark"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-dark-2 shadow-xl">
          {results.map((c, i) => (
            <button
              key={`${c.nome}-${c.uf}`}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => pick(c)}
              className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                i === highlight ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              {c.nome}, {c.uf}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
