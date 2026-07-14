'use client'

import { useState, useRef } from 'react'

export function ImageUpload({
  value, onChange,
}: { value: string; onChange: (url: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        onChange(data.url)
      } else {
        setError(data.error ?? 'Erro ao enviar imagem.')
      }
    } catch {
      setError('Erro de conexão ao enviar imagem.')
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-white/70">
        Foto / Logo do bloco
      </label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10">
          <img src={value} alt="preview" className="h-24 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white/70 hover:text-white"
          >
            trocar
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border py-5 text-center transition-all ${
            dragging
              ? 'border-gold/50 bg-gold/5'
              : 'border-dashed border-white/15 hover:border-white/30'
          }`}
        >
          {uploading ? (
            <p className="text-xs text-white/65">Enviando...</p>
          ) : (
            <>
              <span className="text-2xl">🖼️</span>
              <p className="text-xs font-semibold text-white/70">
                Arraste ou clique para enviar
              </p>
              <p className="text-[10px] text-white/50">JPG, PNG, WebP · máx 2MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}

      {/* Fallback URL */}
      {!value && (
        <div className="mt-2">
          <input
            type="url"
            placeholder="Ou cole uma URL de imagem..."
            className="input-dark text-xs"
            onChange={e => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
