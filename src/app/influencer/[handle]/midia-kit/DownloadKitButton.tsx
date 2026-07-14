'use client'

import { useState } from 'react'

interface KitData {
  displayName:     string
  instagramHandle: string
  niche:           string
  city:            string | null
  followers:       string | null
  bio:             string | null
  avatarUrl:       string | null
  colorHex:        string
  pixelCount:      number
  ranking:         { position: number; total: number; nichePosition: number; nicheTotal: number } | null
  socials:         string[]
  whatsappUrl:     string | null
}

const SOCIAL_COLORS: Record<string, string> = {
  Instagram: '#E1306C', YouTube: '#FF0000', TikTok: '#000000',
  'X / Twitter': '#000000', Facebook: '#1877F2', Kwai: '#FF8800',
  OnlyFans: '#00AEEF', Spotify: '#1ED760',
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

async function generateKitImage(data: KitData): Promise<Blob | null> {
  // Desenha num canvas "de rascunho" bem alto, depois recorta só até onde
  // o conteúdo realmente termina — a altura final varia com bio/redes/links.
  const W = 1080, SCRATCH_H = 1800
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = SCRATCH_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const color = data.colorHex || '#FFD700'

  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(0, 0, W, SCRATCH_H)

  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= W; x += 48) { ctx.moveTo(x, 0); ctx.lineTo(x, SCRATCH_H) }
  for (let y = 0; y <= SCRATCH_H; y += 48) { ctx.moveTo(0, y); ctx.lineTo(W, y) }
  ctx.stroke()

  const grad = ctx.createRadialGradient(W / 2, 180, 50, W / 2, 180, 600)
  grad.addColorStop(0, color + '33')
  grad.addColorStop(1, color + '00')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, 500)

  // Título
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 28px Inter, sans-serif'
  ctx.fillText('MÍDIA KIT', W / 2, 90)

  // Avatar
  const avatarSize = 200, avatarY = 130
  if (data.avatarUrl) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new window.Image()
        i.crossOrigin = 'anonymous'
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = data.avatarUrl!
      })
      ctx.save()
      ctx.beginPath()
      const r = 32
      const ax = (W - avatarSize) / 2
      ;(ctx as any).roundRect?.(ax, avatarY, avatarSize, avatarSize, r)
      ctx.clip()
      ctx.drawImage(img, ax, avatarY, avatarSize, avatarSize)
      ctx.restore()
    } catch {
      ctx.fillStyle = color
      ctx.fillRect((W - avatarSize) / 2, avatarY, avatarSize, avatarSize)
    }
  } else {
    ctx.fillStyle = color
    ctx.fillRect((W - avatarSize) / 2, avatarY, avatarSize, avatarSize)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 72px Inter, sans-serif'
    ctx.fillText(data.displayName.slice(0, 2).toUpperCase(), W / 2, avatarY + avatarSize / 2 + 24)
  }
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.strokeRect((W - avatarSize) / 2, avatarY, avatarSize, avatarSize)

  // Nome + handle
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 46px Inter, sans-serif'
  ctx.fillText(data.displayName, W / 2, avatarY + avatarSize + 70)
  ctx.fillStyle = color
  ctx.font = 'bold 32px Inter, sans-serif'
  ctx.fillText(`@${data.instagramHandle}`, W / 2, avatarY + avatarSize + 115)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '26px Inter, sans-serif'
  ctx.fillText(`${data.niche}${data.city ? ' · ' + data.city : ''}`, W / 2, avatarY + avatarSize + 155)

  // Stats
  const statsY = avatarY + avatarSize + 210
  const stats: { label: string; value: string }[] = []
  if (data.followers) stats.push({ label: 'seguidores', value: data.followers })
  stats.push({ label: 'pixels no mapa', value: data.pixelCount.toLocaleString('pt-BR') })
  if (data.ranking) stats.push({ label: `em ${data.niche.toLowerCase()}`, value: `#${data.ranking.nichePosition}` })

  const colW = W / stats.length
  stats.forEach((s, i) => {
    const cx = colW * i + colW / 2
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 44px Inter, sans-serif'
    ctx.fillText(s.value, cx, statsY)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '20px Inter, sans-serif'
    ctx.fillText(s.label, cx, statsY + 34)
  })

  // Linha divisória
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, statsY + 70); ctx.lineTo(W - 80, statsY + 70); ctx.stroke()

  // Bio
  let cursorY = statsY + 130
  if (data.bio) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '28px Inter, sans-serif'
    const lines = wrapText(ctx, data.bio, W - 200).slice(0, 3)
    for (const line of lines) {
      ctx.fillText(line, W / 2, cursorY)
      cursorY += 38
    }
    cursorY += 30
  }

  // Redes (pills coloridas)
  if (data.socials.length > 0) {
    ctx.font = 'bold 24px Inter, sans-serif'
    const paddingX = 24, gap = 14, pillH = 52
    const widths = data.socials.map(s => ctx.measureText(s).width + paddingX * 2)
    const totalW = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1)
    let x = (W - totalW) / 2
    for (let i = 0; i < data.socials.length; i++) {
      const label = data.socials[i]!
      const w = widths[i]!
      const bg = SOCIAL_COLORS[label] ?? '#333'
      ctx.fillStyle = bg
      ;(ctx as any).roundRect?.(x, cursorY, w, pillH, pillH / 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.fillText(label, x + w / 2, cursorY + pillH / 2 + 8)
      x += w + gap
    }
    cursorY += pillH + 50
  }

  // Selo de diferencial — reforça que o espaço no mapa é real e permanente
  const badgeText = '✦ Espaço permanente no mapa oficial · pagamento único'
  ctx.font = 'bold 22px Inter, sans-serif'
  const badgeW = ctx.measureText(badgeText).width + 56
  ctx.fillStyle = color + '22'
  ;(ctx as any).roundRect?.((W - badgeW) / 2, cursorY, badgeW, 56, 28)
  ctx.fill()
  ctx.strokeStyle = color + '55'
  ctx.lineWidth = 1.5
  ;(ctx as any).roundRect?.((W - badgeW) / 2, cursorY, badgeW, 56, 28)
  ctx.stroke()
  ctx.fillStyle = '#FFD700'
  ctx.fillText(badgeText, W / 2, cursorY + 36)
  cursorY += 56 + 60

  // Linha divisória + footer
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, cursorY); ctx.lineTo(W - 80, cursorY); ctx.stroke()
  cursorY += 45

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '22px Inter, sans-serif'
  ctx.fillText('Gerado por 1 Milhão de Influencer', W / 2, cursorY)
  cursorY += 34
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 24px Inter, sans-serif'
  ctx.fillText(`1milhaoinfluencer.com.br/influencer/${data.instagramHandle}`, W / 2, cursorY)
  cursorY += 50

  // Recorta o canvas final na altura real do conteúdo
  const finalH = Math.min(cursorY, SCRATCH_H)
  const output = document.createElement('canvas')
  output.width = W
  output.height = finalH
  const outCtx = output.getContext('2d')
  if (!outCtx) return null
  outCtx.drawImage(canvas, 0, 0, W, finalH, 0, 0, W, finalH)

  return new Promise(resolve => output.toBlob(b => resolve(b), 'image/png'))
}

export function DownloadKitButton({ data }: { data: KitData }) {
  const [generating, setGenerating] = useState(false)

  async function download() {
    setGenerating(true)
    try {
      const blob = await generateKitImage(data)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `midia-kit-${data.instagramHandle}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button onClick={download} disabled={generating} className="btn-gold w-full py-4 text-sm disabled:opacity-50">
      {generating ? 'Gerando imagem...' : '⬇️ Baixar mídia kit em imagem'}
    </button>
  )
}
