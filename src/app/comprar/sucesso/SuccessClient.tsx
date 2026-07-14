'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Ably from 'ably'
import type { GridBlock } from '@/types'
import { NICHE_LABELS } from '@/types'

// ─── Mini canvas que "acende" o bloco ────────────────────
function BlockLitCanvas({ block }: { block: GridBlock }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef  = useRef<number>(0)
  const startRef  = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const color = block.colorHex || '#FFD700'

    // Pré-carrega avatar
    let img: HTMLImageElement | null = null
    if (block.avatarUrl) {
      img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = block.avatarUrl
    }

    function draw(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t       = Math.min(elapsed / 1200, 1) // 1.2s para acender

      ctx!.clearRect(0, 0, W, H)

      // Fundo grid
      ctx!.fillStyle = '#0d0d0d'
      ctx!.fillRect(0, 0, W, H)

      // Células de contexto (simulando grade ao redor)
      ctx!.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx!.lineWidth   = 0.5
      const cs = W / 20
      for (let x = 0; x < W; x += cs * 2) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke()
      }
      for (let y = 0; y < H; y += cs * 2) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke()
      }

      // Easing suave
      const ease = 1 - Math.pow(1 - t, 3)

      // Glow pulsando após acender
      const glow     = t >= 1 ? (Math.sin(ts / 600) * 0.5 + 0.5) * 0.4 + 0.1 : 0
      const padding  = W * 0.12
      const bx       = padding, by = padding
      const bw       = W - padding * 2, bh = H - padding * 2

      // Glow externo
      ctx!.shadowColor = color
      ctx!.shadowBlur  = 20 + glow * 30
      ctx!.globalAlpha = ease * (0.6 + glow * 0.4)
      ctx!.fillStyle   = color + '22'
      ctx!.fillRect(bx - 8, by - 8, bw + 16, bh + 16)
      ctx!.shadowBlur  = 0

      // Fill do bloco
      ctx!.globalAlpha = ease
      ctx!.fillStyle   = color + '33'
      ctx!.fillRect(bx, by, bw, bh)

      // Avatar
      if (img?.complete && img.naturalWidth > 0) {
        ctx!.save()
        ctx!.beginPath(); ctx!.rect(bx, by, bw, bh); ctx!.clip()
        ctx!.globalAlpha = ease * 0.4
        ctx!.drawImage(img, bx, by, bw, bh)
        ctx!.restore()
      }

      // Borda
      ctx!.globalAlpha = ease
      ctx!.shadowColor = color
      ctx!.shadowBlur  = 8 + glow * 16
      ctx!.strokeStyle = color
      ctx!.lineWidth   = 2
      ctx!.strokeRect(bx + 1, by + 1, bw - 2, bh - 2)
      ctx!.shadowBlur  = 0

      // Handle
      if (bw > 60) {
        const fs = Math.min(bw * 0.11, 13)
        ctx!.save()
        ctx!.globalAlpha   = ease * 0.95
        ctx!.fillStyle     = '#fff'
        ctx!.font          = `bold ${fs}px Inter,sans-serif`
        ctx!.textAlign     = 'center'
        ctx!.textBaseline  = 'middle'
        const txt    = '@' + block.instagramHandle
        const maxLen = Math.floor(bw / (fs * 0.6))
        ctx!.fillText(txt.length > maxLen ? txt.slice(0, maxLen) + '…' : txt, bx + bw / 2, by + bh / 2)
        ctx!.restore()
      }

      ctx!.globalAlpha = 1

      if (t < 1 || true) {
        frameRef.current = requestAnimationFrame(draw)
      }
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [block])

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={280}
      className="w-full rounded-2xl"
      style={{ aspectRatio: '1', display: 'block' }}
    />
  )
}

// ─── Confete simples em canvas ────────────────────────────
function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 80 }, () => ({
      x:   Math.random() * canvas.width,
      y:   -20 - Math.random() * 100,
      r:   3 + Math.random() * 5,
      vx:  (Math.random() - 0.5) * 3,
      vy:  2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      vr:  (Math.random() - 0.5) * 0.2,
      color: ['#FFD700','#E1306C','#833AB4','#405DE6','#1ed760'][Math.floor(Math.random() * 5)] ?? '#FFD700',
    }))

    let frame: number
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      let alive = false
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.05
        if (p.y < canvas!.height + 20) alive = true
        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rot)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = Math.max(0, 1 - p.y / canvas!.height)
        ctx!.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
        ctx!.restore()
      }
      if (alive) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

// ─── Arte para stories (1080×1920) ────────────────────────
async function generateStoryImage(block: GridBlock, shareUrl: string): Promise<Blob | null> {
  const W = 1080, H = 1920
  const canvas  = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const color = block.colorHex || '#FFD700'

  // Fundo
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(0, 0, W, H)

  // Grade sutil
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth   = 1
  ctx.beginPath()
  for (let x = 0; x <= W; x += 54) { ctx.moveTo(x, 0); ctx.lineTo(x, H) }
  for (let y = 0; y <= H; y += 54) { ctx.moveTo(0, y); ctx.lineTo(W, y) }
  ctx.stroke()

  // Glow central
  const grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 700)
  grad.addColorStop(0, 'rgba(255,215,0,0.12)')
  grad.addColorStop(1, 'rgba(255,215,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Título
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font      = 'bold 62px Inter, sans-serif'
  ctx.fillText('GARANTI MEU ESPAÇO', W / 2, 320)
  ctx.fillStyle = '#FFD700'
  ctx.font      = 'bold 76px Inter, sans-serif'
  ctx.fillText('NO MAPA DOS', W / 2, 420)
  ctx.fillText('INFLUENCERS', W / 2, 515)

  // Bloco central
  const bs = 480
  const bx = (W - bs) / 2, by = 660
  ctx.shadowColor = color
  ctx.shadowBlur  = 80
  ctx.fillStyle   = color + '33'
  ctx.fillRect(bx, by, bs, bs)
  ctx.shadowBlur  = 0

  // Avatar (só entra se o servidor da imagem permitir CORS — senão o canvas trava o download)
  if (block.avatarUrl) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new window.Image()
        i.crossOrigin = 'anonymous'
        i.onload  = () => resolve(i)
        i.onerror = reject
        i.src = block.avatarUrl!
      })
      ctx.save()
      ctx.beginPath(); ctx.rect(bx, by, bs, bs); ctx.clip()
      ctx.globalAlpha = 0.45
      ctx.drawImage(img, bx, by, bs, bs)
      ctx.restore()
      ctx.globalAlpha = 1
    } catch { /* segue sem avatar */ }
  }

  ctx.strokeStyle = color
  ctx.lineWidth   = 6
  ctx.strokeRect(bx, by, bs, bs)

  // Handle no bloco
  ctx.fillStyle = '#ffffff'
  ctx.font      = 'bold 56px Inter, sans-serif'
  ctx.fillText('@' + block.instagramHandle, W / 2, by + bs / 2 + 20)

  // Stats
  ctx.fillStyle = '#FFD700'
  ctx.font      = 'bold 54px Inter, sans-serif'
  ctx.fillText(`${block.pixelCount.toLocaleString('pt-BR')} pixels · vitalício`, W / 2, by + bs + 120)

  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font      = '40px Inter, sans-serif'
  ctx.fillText('Pagamento único · Para sempre no mapa', W / 2, by + bs + 190)

  // Link
  ctx.fillStyle = '#FFD700'
  ctx.font      = 'bold 44px Inter, sans-serif'
  ctx.fillText(shareUrl.replace(/^https?:\/\//, ''), W / 2, 1700)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font      = '36px Inter, sans-serif'
  ctx.fillText('1 Milhão de Influencer', W / 2, 1770)

  return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png'))
}

// ─── Página principal ─────────────────────────────────────
export function SuccessClient() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [block,   setBlock]   = useState<GridBlock | null>(null)
  const [status,  setStatus]  = useState<'waiting' | 'confirmed' | 'timeout'>('waiting')
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [generating, setGenerating] = useState(false)

  const sessionId = searchParams.get('session_id')       // Stripe
  const blockId   = searchParams.get('block_id')         // fallback manual

  // Conecta Ably e aguarda o bloco ser ativado
  useEffect(() => {
    let ably: Ably.Realtime | null = null

    async function connect() {
      try {
        ably = new Ably.Realtime({ authUrl: '/api/ably-token' })
        const channel = ably.channels.get('1milhao:grid')

        channel.subscribe('block-activated', (msg) => {
          const b = msg.data as GridBlock
          // Se veio session_id, aceita qualquer bloco recém-ativado
          // (o webhook pode demorar alguns segundos)
          setBlock(b)
          setStatus('confirmed')
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 4000)
        })
      } catch {
        // silencia erro de conexão
      }
    }

    connect()

    // Timeout de 30s — se não receber via Ably, busca na API
    const timeout = setTimeout(async () => {
      if (status === 'waiting') {
        // Tenta buscar pelo session_id ou block_id
        const id = blockId ?? sessionId
        if (id) {
          try {
            const res  = await fetch(`/api/block?id=${id}`)
            const data = await res.json()
            if (data.block) {
              setBlock(data.block)
              setStatus('confirmed')
              setShowConfetti(true)
              setTimeout(() => setShowConfetti(false), 4000)
              return
            }
          } catch { /* silencia */ }
        }
        setStatus('timeout')
      }
    }, 30_000)

    return () => {
      clearTimeout(timeout)
      ably?.close()
    }
  }, [])

  const shareUrl = block
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/?highlight=${block.instagramHandle}`
    : ''

  async function copyShare() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Gera a arte e abre o share nativo (mobile) ou baixa o PNG
  async function shareStory() {
    if (!block || generating) return
    setGenerating(true)
    try {
      const blob = await generateStoryImage(block, shareUrl)
      if (!blob) return
      const file = new File([blob], `1milhao-${block.instagramHandle}.png`, { type: 'image/png' })
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return } catch { /* usuário cancelou */ }
      }
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  const nicheLabel = block
    ? (NICHE_LABELS[block.niche as keyof typeof NICHE_LABELS] ?? block.niche)
    : ''

  return (
    <main className="relative min-h-screen bg-dark px-4 py-16 overflow-hidden">

      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gold/6 blur-[120px]" />
      </div>

      {showConfetti && <Confetti />}

      <div className="relative z-10 mx-auto max-w-lg text-center">

        {/* ── Aguardando confirmação ── */}
        {status === 'waiting' && (
          <div className="space-y-6">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-2 border-white/10 border-t-gold" />
            <div>
              <h1 className="font-display text-4xl text-white">PROCESSANDO</h1>
              <p className="mt-2 text-sm text-white/65">
                Confirmando seu pagamento e acendendo seu bloco no mapa...
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-dark-2 p-4 text-sm text-white/55">
              <p>Isso costuma levar menos de 10 segundos.</p>
              <p className="mt-1">Não feche essa página.</p>
            </div>
          </div>
        )}

        {/* ── Confirmado ── */}
        {status === 'confirmed' && block && (
          <div className="space-y-8">

            {/* Badge */}
            <div className="badge-gold inline-flex">
              <span className="mr-2">✨</span>
              Bloco ativado no mapa!
            </div>

            {/* Título */}
            <div>
              <h1 className="font-display text-6xl leading-none tracking-wide text-white md:text-8xl">
                SEU<br />
                <span className="text-gold">ESPAÇO</span><br />
                É SEU!
              </h1>
              <p className="mt-4 text-sm text-white/65">
                Permanente. Vitalício. Para sempre no mapa.
              </p>
            </div>

            {/* Canvas animado */}
            <div className="mx-auto w-56 overflow-hidden rounded-2xl border border-gold/20 shadow-[0_0_60px_rgba(255,215,0,0.15)]">
              <BlockLitCanvas block={block} />
            </div>

            {/* Info do bloco */}
            <div className="rounded-2xl border border-white/8 bg-dark-2 p-5 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white overflow-hidden"
                  style={{ background: block.colorHex || '#E1306C' }}
                >
                  {block.avatarUrl
                    ? <img src={block.avatarUrl} alt="" className="h-full w-full object-cover" />
                    : block.instagramHandle.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">@{block.instagramHandle}</p>
                  <p className="text-xs text-white/65">
                    {nicheLabel}
                    {block.city ? ` · ${block.city}` : ''}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-display text-lg text-gold">
                    {block.pixelCount.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] text-white/55">pixels</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center border-t border-white/5 pt-3">
                <div>
                  <p className="text-sm font-bold text-white">{block.pixelWidth}×{block.pixelHeight}</p>
                  <p className="text-[10px] text-white/55">tamanho</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {block.pixelX},{block.pixelY}
                  </p>
                  <p className="text-[10px] text-white/55">posição</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gold">∞</p>
                  <p className="text-[10px] text-white/55">vitalício</p>
                </div>
              </div>
            </div>

            {/* Destaque link-in-bio */}
            <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-left">
              <p className="text-sm font-bold text-gold mb-1">✨ Sua página profissional está pronta!</p>
              <p className="text-xs leading-relaxed text-white/70">
                Use <span className="text-white/80 font-semibold">1milhao.com.br/influencer/{block.instagramHandle}</span>{' '}
                como link na bio do Instagram. Substitua o Linktree agora mesmo.
              </p>
            </div>

            {/* Compartilhar */}
            <div className="space-y-3">
              <p className="text-xs text-white/55 uppercase tracking-widest">
                Compartilhe seu espaço
              </p>

              {/* Arte pronta para o stories — loop viral */}
              <button
                onClick={shareStory}
                disabled={generating}
                className="btn-gold w-full py-3.5 text-sm disabled:opacity-50"
              >
                {generating ? 'Gerando arte...' : '📲 Postar no Stories — arte pronta'}
              </button>
              <p className="text-[11px] text-white/50">
                Baixe a imagem com seu bloco e poste marcando a gente. Seus seguidores encontram você no mapa pelo link.
              </p>

              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-dark-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white/70 outline-none"
                />
                <button
                  onClick={copyShare}
                  className="border-l border-white/10 px-4 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                >
                  {copied ? '✓ copiado' : 'copiar'}
                </button>
              </div>

              {/* Botões de share */}
              <div className="flex gap-2 justify-center">
                <a
                  href={`https://instagram.com/${block.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-dark-2 px-4 py-2.5 text-xs font-semibold text-white/60 hover:border-pink/30 hover:text-white transition-all"
                >
                  📸 Meu Instagram
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=Garanti%20meu%20espa%C3%A7o%20permanente%20no%20mapa%20dos%201%20milh%C3%A3o%20de%20influencers!%20%F0%9F%8E%AF&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-dark-2 px-4 py-2.5 text-xs font-semibold text-white/60 hover:border-white/20 hover:text-white transition-all"
                >
                  𝕏 Twitter
                </a>
                <a
                  href={`https://wa.me/?text=Garanti%20meu%20espa%C3%A7o%20permanente%20no%20mapa%20dos%201%20milh%C3%A3o%20de%20influencers!%20${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-dark-2 px-4 py-2.5 text-xs font-semibold text-white/60 hover:border-green-500/30 hover:text-white transition-all"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Link href="/" className="btn-gold py-4 text-base">
                Ver meu bloco no mapa ao vivo →
              </Link>
              <Link href={`/influencer/${block.instagramHandle}`} className="btn-ghost py-3 text-sm">
                Ver minha página de link-in-bio
              </Link>
              <Link href={block.editToken ? `/meu-painel?token=${block.editToken}` : '/meu-painel'} className="btn-ghost py-3 text-sm">
                Ir para meu painel
              </Link>
            </div>

            <p className="text-xs text-white/45">
              Você receberá um e-mail com o link para editar seu bloco a qualquer momento.
            </p>
          </div>
        )}

        {/* ── Timeout ── */}
        {status === 'timeout' && (
          <div className="space-y-6">
            <div className="text-4xl">⏳</div>
            <div>
              <h1 className="font-display text-4xl text-white">QUASE LÁ</h1>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Seu pagamento foi recebido mas a confirmação está demorando um pouco mais que o esperado.
                Isso é normal — seu bloco aparecerá no mapa em breve.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-dark-2 p-5 text-sm text-white/65 space-y-2">
              <p>✅ Pagamento recebido</p>
              <p>⏳ Bloco sendo ativado...</p>
              <p className="text-[11px] text-white/50 mt-3">
                Você receberá um e-mail assim que seu espaço estiver ativo no mapa.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/" className="btn-gold py-3">
                Ver o mapa ao vivo →
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="btn-ghost py-3 text-sm"
              >
                Verificar novamente
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}