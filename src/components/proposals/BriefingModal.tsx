'use client'

import { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'

interface Props {
  blockId:         string
  instagramHandle: string
  onClose:         () => void
}

const CAMPAIGN_TYPES = [
  'Post pago',
  'Story pago',
  'Reels / vídeo',
  'Permuta (produto/serviço)',
  'Embaixador de marca',
  'Evento presencial',
  'Outro',
]

export function BriefingModal({ blockId, instagramHandle, onClose }: Props) {
  const { isSignedIn, isLoaded, user } = useUser()

  const [step,    setStep]    = useState<'loading' | 'onboarding' | 'form' | 'sent'>('loading')
  const [error,   setError]   = useState('')
  const [sending, setSending] = useState(false)

  const [brandForm, setBrandForm] = useState({
    companyName: '', segment: '', contactName: '', contactEmail: '', contactWhatsapp: '',
  })
  const [briefing, setBriefing] = useState({
    campaignType: CAMPAIGN_TYPES[0], budget: '', deadline: '', message: '',
  })

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setStep('onboarding'); return }

    setBrandForm(f => ({
      ...f,
      contactName:  user?.fullName ?? f.contactName,
      contactEmail: user?.primaryEmailAddress?.emailAddress ?? f.contactEmail,
    }))

    fetch('/api/brands')
      .then(r => r.json())
      .then(data => setStep(data.brand ? 'form' : 'onboarding'))
      .catch(() => setStep('onboarding'))
  }, [isLoaded, isSignedIn, user])

  async function submitBrand() {
    setError('')
    if (!brandForm.companyName.trim() || !brandForm.contactName.trim() || !brandForm.contactEmail.trim()) {
      setError('Preencha nome da empresa, contato e e-mail.')
      return
    }
    setSending(true)
    try {
      const res  = await fetch('/api/brands', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brandForm),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return }
      setStep('form')
    } catch {
      setError('Erro de conexão.')
    } finally {
      setSending(false)
    }
  }

  async function submitBriefing() {
    setError('')
    if (briefing.message.trim().length < 10) {
      setError('Escreva um pouco mais sobre a proposta (mínimo 10 caracteres).')
      return
    }
    setSending(true)
    try {
      const res  = await fetch('/api/proposals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, ...briefing }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao enviar.'); return }
      setStep('sent')
    } catch {
      setError('Erro de conexão.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="popup-enter w-full max-w-sm overflow-hidden bg-dark-2 sm:rounded-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px 16px 0 0' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="badge-gold inline-flex"><span className="mr-1.5">💼</span>Briefing pra @{instagramHandle}</p>
            <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
          </div>

          {step === 'loading' && (
            <div className="py-10 text-center text-sm text-white/55">Carregando...</div>
          )}

          {step === 'onboarding' && !isSignedIn && (
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-white/70">Entre com sua conta de marca pra enviar um briefing estruturado — sem isso, o influencer não consegue ver de onde veio a proposta.</p>
              <SignInButton mode="modal">
                <button className="btn-gold w-full py-3.5 text-sm">Entrar / Criar conta →</button>
              </SignInButton>
            </div>
          )}

          {step === 'onboarding' && isSignedIn && (
            <div className="space-y-3">
              <p className="mb-1 text-xs text-white/65">Primeira vez por aqui — só precisamos de alguns dados da sua empresa.</p>
              <input className="input-dark" placeholder="Nome da empresa"
                value={brandForm.companyName} onChange={e => setBrandForm(f => ({ ...f, companyName: e.target.value }))} />
              <input className="input-dark" placeholder="Segmento (ex: moda, beleza, tech)"
                value={brandForm.segment} onChange={e => setBrandForm(f => ({ ...f, segment: e.target.value }))} />
              <input className="input-dark" placeholder="Seu nome (contato)"
                value={brandForm.contactName} onChange={e => setBrandForm(f => ({ ...f, contactName: e.target.value }))} />
              <input className="input-dark" type="email" placeholder="E-mail de contato"
                value={brandForm.contactEmail} onChange={e => setBrandForm(f => ({ ...f, contactEmail: e.target.value }))} />
              <input className="input-dark" placeholder="WhatsApp (opcional)"
                value={brandForm.contactWhatsapp} onChange={e => setBrandForm(f => ({ ...f, contactWhatsapp: e.target.value }))} />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={submitBrand} disabled={sending} className="btn-gold w-full py-3 text-sm disabled:opacity-50">
                {sending ? 'Salvando...' : 'Continuar →'}
              </button>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/70">Tipo de campanha</label>
                <select className="select-dark" value={briefing.campaignType}
                  onChange={e => setBriefing(b => ({ ...b, campaignType: e.target.value }))}>
                  {CAMPAIGN_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/70">Orçamento</label>
                  <input className="input-dark" placeholder="R$ 500 - 1.000"
                    value={briefing.budget} onChange={e => setBriefing(b => ({ ...b, budget: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/70">Prazo</label>
                  <input className="input-dark" placeholder="até 30/07"
                    value={briefing.deadline} onChange={e => setBriefing(b => ({ ...b, deadline: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/70">Mensagem / briefing</label>
                <textarea className="input-dark resize-none" rows={4}
                  placeholder="Conte sobre a campanha, o que espera do influencer, deliverables..."
                  value={briefing.message} onChange={e => setBriefing(b => ({ ...b, message: e.target.value }))} />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={submitBriefing} disabled={sending} className="btn-gold w-full py-3.5 text-sm disabled:opacity-50">
                {sending ? 'Enviando...' : 'Enviar briefing →'}
              </button>
            </div>
          )}

          {step === 'sent' && (
            <div className="space-y-3 py-6 text-center">
              <div className="text-3xl">✅</div>
              <p className="font-bold text-white">Briefing enviado!</p>
              <p className="text-sm text-white/65">@{instagramHandle} vai ver sua proposta no painel dela e pode aceitar ou recusar. Acompanhe pelo seu login de marca.</p>
              <button onClick={onClose} className="btn-ghost w-full py-3 text-sm">Fechar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
