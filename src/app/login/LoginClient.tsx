'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function extractToken(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const fromUrl = url.searchParams.get('token')
    if (fromUrl) return fromUrl
  } catch {
    // não é uma URL completa — segue tentando outros formatos
  }

  const match = trimmed.match(/token=([a-zA-Z0-9]+)/)
  if (match?.[1]) return match[1]

  return trimmed
}

export function LoginClient() {
  const router = useRouter()
  const [tab, setTab] = useState<'link' | 'recuperar'>('link')

  const [linkInput, setLinkInput] = useState('')
  const [linkError, setLinkError] = useState('')
  const [entering,  setEntering]  = useState(false)

  const [handle,       setHandle]       = useState('')
  const [recovering,   setRecovering]   = useState(false)
  const [recovered,    setRecovered]    = useState(false)
  const [recoverError, setRecoverError] = useState('')

  function handleEnter() {
    setLinkError('')
    const token = extractToken(linkInput)
    if (!token || token.length < 10) {
      setLinkError('Cole o link completo ou o token de acesso que você recebeu por e-mail.')
      return
    }
    setEntering(true)
    router.push(`/meu-painel?token=${encodeURIComponent(token)}`)
  }

  async function handleRecover() {
    setRecoverError('')
    const clean = handle.trim().replace('@', '')
    if (!clean) {
      setRecoverError('Informe seu @ do Instagram.')
      return
    }
    setRecovering(true)
    try {
      const res = await fetch('/api/auth/recover', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ instagramHandle: clean }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setRecoverError(data.error ?? 'Erro ao processar. Tente novamente.')
        return
      }
      setRecovered(true)
    } catch {
      setRecoverError('Erro de conexão. Tente novamente.')
    } finally {
      setRecovering(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-dark px-4 py-20 overflow-hidden">

      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-gold/6 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-md">

        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <div className="badge-gold mb-4 inline-flex">
            <span className="mr-2">🔐</span>
            Área do anunciante
          </div>
          <h1 className="font-display text-5xl leading-none tracking-wide text-white md:text-6xl">
            ACESSE SEU
            <br />
            <span className="text-gold">PAINEL</span>
          </h1>
          <p className="mt-4 text-sm text-white/65">
            Edite seu bloco, suas redes sociais e seus links a qualquer momento.
          </p>
        </div>

        {/* Card */}
        <div className="card-dark p-6">

          {/* Tabs */}
          <div className="mb-5 flex gap-1 rounded-xl border border-white/8 bg-dark-2 p-1">
            <button
              onClick={() => setTab('link')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                tab === 'link' ? 'bg-white/10 text-white' : 'text-white/65 hover:text-white/80'
              }`}
            >
              Tenho meu link
            </button>
            <button
              onClick={() => setTab('recuperar')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                tab === 'recuperar' ? 'bg-white/10 text-white' : 'text-white/65 hover:text-white/80'
              }`}
            >
              Esqueci meu link
            </button>
          </div>

          {/* Tab: Tenho meu link */}
          {tab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/70">
                  Link ou token de acesso
                </label>
                <input
                  type="text"
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEnter()}
                  placeholder="Cole aqui o link do e-mail de boas-vindas"
                  className="input-dark"
                  autoFocus
                />
                <p className="mt-1.5 text-[11px] text-white/50">
                  Você recebeu esse link por e-mail quando seu bloco foi ativado.
                </p>
              </div>

              {linkError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                  {linkError}
                </div>
              )}

              <button
                onClick={handleEnter}
                disabled={entering}
                className="btn-gold w-full py-3.5 text-sm disabled:opacity-50"
              >
                {entering ? 'Entrando...' : 'Entrar no painel →'}
              </button>
            </div>
          )}

          {/* Tab: Esqueci meu link */}
          {tab === 'recuperar' && (
            <div className="space-y-4">
              {!recovered ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/70">
                      Seu @ do Instagram
                    </label>
                    <div className="flex overflow-hidden rounded-xl border border-white/10 bg-transparent focus-within:border-white/25">
                      <span className="flex items-center bg-white/4 px-3 text-sm text-white/50">@</span>
                      <input
                        type="text"
                        value={handle}
                        onChange={e => setHandle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRecover()}
                        placeholder="seuarroba"
                        className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/35 outline-none"
                        autoFocus
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-white/50">
                      Vamos reenviar o link de acesso para o e-mail usado na compra.
                    </p>
                  </div>

                  {recoverError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                      {recoverError}
                    </div>
                  )}

                  <button
                    onClick={handleRecover}
                    disabled={recovering}
                    className="btn-gold w-full py-3.5 text-sm disabled:opacity-50"
                  >
                    {recovering ? 'Enviando...' : 'Enviar link de acesso'}
                  </button>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="text-3xl">📬</div>
                  <div>
                    <p className="font-bold text-white">Verifique seu e-mail</p>
                    <p className="mt-1.5 text-sm text-white/65">
                      Se existir um bloco ativo com esse @, o link de acesso foi enviado
                      para o e-mail cadastrado na compra.
                    </p>
                  </div>
                  <button
                    onClick={() => { setRecovered(false); setHandle('') }}
                    className="btn-ghost w-full py-3 text-sm"
                  >
                    Tentar outro @
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/55">
            Ainda não tem um espaço no mapa?{' '}
            <Link href="/comprar" className="font-semibold text-gold hover:underline">
              Garanta o seu →
            </Link>
          </p>
          <p className="mt-2 text-xs text-white/45">
            <Link href="/" className="hover:text-white/65">
              ← Ver o mapa
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
