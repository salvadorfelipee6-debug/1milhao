'use client'

import { useState, useCallback } from 'react'
import { z } from 'zod'
import type { GridStats, Niche } from '@/types'
import { NICHE_LABELS } from '@/types'

const PIXEL_PRICE = 0.10
const MIN_PIXELS  = 100
const MAX_PIXELS  = 40000

interface RegisterFormProps {
  stats: GridStats
}

function calcDims(n: number) {
  const side = Math.max(10, Math.round(Math.sqrt(n)))
  return { width: side, height: side, actual: side * side }
}

export function RegisterForm({ stats }: RegisterFormProps) {
  // ─── State ──────────────────────────────────────────────
  const [step,    setStep]    = useState<1 | 2 | 3>(1)
  const [pixels,  setPixels]  = useState(400)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [provider, setProvider] = useState<'stripe' | 'mercadopago'>('mercadopago')

  const [form, setForm] = useState({
    instagramHandle: '',
    displayName:     '',
    niche:           '' as Niche | '',
    city:            '',
    followers:       '',
    bio:             '',
    videoUrl:        '',
    websiteUrl:      '',
    avatarUrl:       '',
    email:           '',
  })

  const dims  = calcDims(pixels)
  const price = (dims.actual * PIXEL_PRICE).toFixed(2)

  // ─── Helpers ────────────────────────────────────────────
  const setField = useCallback((k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
  }, [])

  // ─── Submit ─────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.instagramHandle) return setError('Informe o @ do Instagram.')
    if (!form.displayName)     return setError('Informe seu nome de exibição.')
    if (!form.niche)           return setError('Selecione seu nicho.')
    if (!form.email)           return setError('Informe seu e-mail.')

    setLoading(true)

    try {
      const res = await fetch('/api/payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          instagramHandle: form.instagramHandle.replace('@', '').toLowerCase(),
          pixelCount:      dims.actual,
          paymentProvider: provider,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro desconhecido.')
        return
      }

      // Redireciona para checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl  // Stripe
      } else if (data.initPoint) {
        window.location.href = data.initPoint    // Mercado Pago
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* CALCULADORA DE PREÇO */}
      <div className="card-dark rounded-2xl p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">
          Quantos pixels você quer?
        </p>

        <input
          type="range"
          min={MIN_PIXELS}
          max={Math.min(MAX_PIXELS, stats.available)}
          step={100}
          value={pixels}
          onChange={e => setPixels(Number(e.target.value))}
          className="w-full accent-pink"
        />

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-display text-2xl text-white">
              {dims.actual.toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/30">pixels</p>
          </div>
          <div>
            <p className="font-display text-2xl text-white">
              {dims.width}×{dims.height}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/30">na grade</p>
          </div>
          <div>
            <p className="font-display text-2xl text-gold">
              R${price.replace('.', ',')}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/30">pagamento único</p>
          </div>
        </div>

        {/* Pacotes rápidos */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: 'Micro',   n: 100 },
            { label: 'Básico',  n: 400 },
            { label: 'Médio',   n: 900 },
            { label: 'Grande',  n: 2500 },
            { label: 'Premium', n: 10000 },
          ].map(pkg => (
            <button
              key={pkg.n}
              type="button"
              onClick={() => setPixels(pkg.n)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                pixels === pkg.n
                  ? 'bg-pink text-white'
                  : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {pkg.label}
              <span className="ml-1 opacity-50">R${(pkg.n * PIXEL_PRICE).toFixed(0)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DADOS DO INSTAGRAM */}
      <div className="card-dark rounded-2xl p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Seus dados do Instagram
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">
              @ do Instagram <span className="text-pink">*</span>
            </label>
            <div className="flex overflow-hidden rounded-xl border border-white/8 focus-within:border-white/20">
              <span className="flex items-center bg-white/4 px-3 text-sm text-white/30">@</span>
              <input
                type="text"
                value={form.instagramHandle}
                onChange={e => setField('instagramHandle', e.target.value)}
                placeholder="seuarroba"
                className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/20 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">
              Nome de exibição <span className="text-pink">*</span>
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={e => setField('displayName', e.target.value)}
              placeholder="Seu nome ou marca"
              className="input-dark"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">
              Nicho <span className="text-pink">*</span>
            </label>
            <select
              value={form.niche}
              onChange={e => setField('niche', e.target.value)}
              className="select-dark"
              required
            >
              <option value="">Selecione...</option>
              {Object.entries(NICHE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">Cidade</label>
            <input
              type="text"
              value={form.city}
              onChange={e => setField('city', e.target.value)}
              placeholder="São Paulo, SP"
              className="input-dark"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">Seguidores</label>
            <input
              type="text"
              value={form.followers}
              onChange={e => setField('followers', e.target.value)}
              placeholder="ex: 50k"
              className="input-dark"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/50">
            Bio curta
            <span className="ml-2 font-normal opacity-50">({form.bio.length}/120)</span>
          </label>
          <textarea
            value={form.bio}
            onChange={e => setField('bio', e.target.value)}
            placeholder="Aparece no popup quando clicam no seu bloco..."
            className="input-dark resize-none"
            rows={2}
            maxLength={120}
          />
        </div>
      </div>

      {/* MÍDIA E LINKS */}
      <div className="card-dark rounded-2xl p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Mídia e links
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">
              Vídeo de apresentação
            </label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={e => setField('videoUrl', e.target.value)}
              placeholder="YouTube, Reels, TikTok..."
              className="input-dark"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/50">
              Foto de perfil (URL)
            </label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={e => setField('avatarUrl', e.target.value)}
              placeholder="https://..."
              className="input-dark"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/50">
            Link para anunciantes
          </label>
          <input
            type="url"
            value={form.websiteUrl}
            onChange={e => setField('websiteUrl', e.target.value)}
            placeholder="WhatsApp, mídia kit, link do Instagram..."
            className="input-dark"
          />
        </div>
      </div>

      {/* EMAIL E PAGAMENTO */}
      <div className="card-dark rounded-2xl p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/50">
            Seu e-mail <span className="text-pink">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="input-dark"
            required
          />
          <p className="mt-1.5 text-[11px] text-white/25">
            Você receberá o link de edição do seu bloco por aqui.
          </p>
        </div>

        {/* Escolha de pagamento */}
        <div>
          <p className="mb-2 text-xs font-semibold text-white/30 uppercase tracking-widest">
            Forma de pagamento
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'mercadopago', label: 'Pix / Cartão BR', sub: 'Mercado Pago', icon: '🇧🇷' },
              { id: 'stripe',      label: 'Cartão Global',    sub: 'Stripe',        icon: '💳' },
            ] as const).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setProvider(opt.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  provider === opt.id
                    ? 'border-gold/40 bg-gold/5'
                    : 'border-white/8 hover:border-white/15'
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                <p className="mt-1 text-xs font-bold text-white">{opt.label}</p>
                <p className="text-[10px] text-white/30">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? 'Processando...'
          : `Reservar ${dims.actual.toLocaleString('pt-BR')} pixels por R$ ${price.replace('.', ',')} →`
        }
      </button>

      <p className="text-center text-xs text-white/20">
        Pagamento único · Vitalício · Seu espaço fica no mapa para sempre.<br />
        Ao continuar você concorda com os{' '}
        <a href="/termos" className="underline hover:text-white/40">termos de uso</a>.
      </p>
    </form>
  )
}
