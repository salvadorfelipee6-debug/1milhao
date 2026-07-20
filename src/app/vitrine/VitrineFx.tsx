'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { SOCIAL_CONFIG } from '@/lib/socialConfig'

// Efeitos da página /vitrine: cards de benefício com holofote que segue o
// mouse + comparativo VS com "relógio da assinatura" cobrando ao vivo.

// ─── Card com holofote ───────────────────────────────────────
function SpotlightCard({
  accent,
  index,
  children,
}: {
  accent:   string
  index:    number
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative h-full overflow-hidden rounded-2xl p-px"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      {/* Borda que acende na cor do card, seguindo o mouse */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), ${accent}88, transparent 70%)` }}
      />
      <div className="relative h-full overflow-hidden rounded-[15px] bg-dark-2 p-5">
        {/* Holofote interno */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), ${accent}1f, transparent 65%)` }}
        />
        {children}
      </div>
    </motion.div>
  )
}

interface Feature {
  icon:   string
  title:  string
  desc:   string
  accent: string
}

export function FeatureCardsFx({ features }: { features: Feature[] }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {features.map((f, i) => (
        <SpotlightCard key={f.title} accent={f.accent} index={i}>
          <div className="relative flex items-start gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
              style={{
                background: `linear-gradient(135deg, ${f.accent}33, ${f.accent}14)`,
                border:     `1px solid ${f.accent}55`,
                boxShadow:  `0 0 18px ${f.accent}22`,
              }}
            >
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{f.desc}</p>
            </div>
          </div>
        </SpotlightCard>
      ))}
    </div>
  )
}

// ─── Comparativo VS com relógio da assinatura ────────────────
const MENSALIDADE = 29

export function ComparativoFx() {
  const ref     = React.useRef<HTMLDivElement>(null)
  const inView  = useInView(ref, { once: true, margin: '-80px' })
  const [months, setMonths] = React.useState(0)

  // Cada tick = 1 mês de assinatura cobrado. Não para nunca — esse é o ponto.
  React.useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setMonths(m => m + 1), 1300)
    return () => clearInterval(id)
  }, [inView])

  const total = (months * MENSALIDADE).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div ref={ref} className="relative">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-10">

        {/* Assinatura — o relógio nunca para */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-dark-2 p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/80">
            Ferramenta de assinatura
          </p>

          <div className="relative mt-3">
            <p className="font-display text-4xl text-red-400 md:text-5xl" aria-live="off">
              R$ {total}
            </p>
            {/* +R$29 flutuando a cada mês cobrado */}
            <AnimatePresence>
              {months > 0 && (
                <motion.span
                  key={months}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: -18 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1 }}
                  className="absolute -top-1 right-0 text-sm font-bold text-red-400"
                >
                  +R$ {MENSALIDADE}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-1 text-xs text-white/60">
            mês {months || 1} · R$ {MENSALIDADE}/mês · <span className="text-red-400/90">e nunca para de cobrar</span>
          </p>

          <ul className="mt-4 space-y-1.5 text-xs text-white/60">
            <li>✕ Cobra todo mês, pra sempre</li>
            <li>✕ Cancelou, sumiu sua página</li>
            <li>✕ Recursos bons só no plano caro</li>
            <li>✕ Você é mais um no meio de milhões</li>
          </ul>
        </motion.div>

        {/* Vitrine 1M — parado no 0,99 desde o dia 1 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gold/5 p-6"
          style={{ boxShadow: '0 0 40px rgba(255,215,0,0.10)' }}
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Vitrine 1M
          </p>

          <p className="mt-3 font-display text-4xl text-gold md:text-5xl">
            R$ 0,99
          </p>
          <p className="mt-1 text-xs text-white/65">
            mês {months || 1} · <span className="font-semibold text-gold">mesmo preço: pago uma vez, no dia 1</span>
          </p>

          <ul className="mt-4 space-y-1.5 text-xs text-white/70">
            <li>✓ Vitalício — paga uma vez, é seu</li>
            <li>✓ Estatísticas, QR e mídia kit inclusos</li>
            <li>✓ Marcas te encontram e mandam proposta</li>
            <li>✓ Bônus: pixel no mapa + roleta + ranking</li>
          </ul>
        </motion.div>
      </div>

      {/* Medalha VS no centro */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.3 }}
        className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg text-black"
          style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0 30px rgba(255,215,0,0.5), 0 0 0 4px #080808' }}
        >
          VS
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Exemplo vivo: "veja como fica sua página" ───────────────
// Modal que sobrepõe a /vitrine com uma Vitrine 1M modelo, toda preenchida.
// Perfil de demonstração: todos os links apontam pro Instagram real
// (as outras redes não são perfis oficiais); contatos são fictícios.

const EX_IG = 'https://www.instagram.com/rafaellassantosoficial/'

const EXEMPLO = {
  displayName: 'Rafaella Santos',
  handle:      'rafaellassantosoficial',
  nicheLabel:  'Moda & Estilo',
  color:       '#C13584',
  city:        'São Paulo - SP',
  followers:   '312k',
  bio:         'Moda, lifestyle e bastidores de quem vive de conteúdo. Parcerias que combinam comigo de verdade. 📩 parcerias@rafaellasantos.com.br',
  whatsapp:    '(11) 98765-4321',
  pixelCount:  900,
  pixelW:      30,
  pixelH:      30,
  customLinks: [
    { emoji: '🛍', label: 'Minha lojinha' },
    { emoji: '💄', label: 'Curso de automaquiagem' },
    { emoji: '📸', label: 'Press kit / mídia kit' },
  ],
}

// Todas as redes no exemplo (menos OnlyFans — não cabe num perfil demo)
const EX_SOCIALS = SOCIAL_CONFIG.filter(s => s.key !== 'onlyfansUrl')

function ExemploModal({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const c = EXEMPLO.color

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-black/85 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Exemplo de Vitrine 1M preenchida"
    >
      <div className="mb-3 flex w-full max-w-sm shrink-0 items-center justify-between">
        <p className="text-xs font-bold text-white/80">👀 Assim fica a sua página</p>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white"
        >
          Fechar ✕
        </button>
      </div>

      {/* Phone frame */}
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm shrink-0 overflow-hidden rounded-[2rem] border-4 border-white/10 bg-dark shadow-2xl"
      >
        <div className="relative max-h-[72vh] overflow-y-auto px-4 py-6">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${c}18 0%, transparent 60%)` }} />
          </div>

          <div className="relative z-10">
            <div className="h-24 overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${c}55, ${c}15)` }} />

            <div className="relative -mt-9 mb-4 flex items-end justify-between px-1">
              <div
                className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-4 text-xl font-bold text-white"
                style={{ background: c, borderColor: '#0d0d0d' }}
              >
                RS
                {/* Foto real do perfil, puxada pelo @ (mesma técnica do cadastro);
                    se falhar, some e ficam as iniciais */}
                <img
                  src={`https://unavatar.io/instagram/${EXEMPLO.handle}?fallback=false`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              <div
                className="rounded-xl px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: 'rgba(255,215,0,0.15)', border: '0.5px solid rgba(255,215,0,0.35)', color: '#FFD700' }}
              >
                ✦ 1 Milhão
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-xl font-bold leading-tight text-white">{EXEMPLO.displayName}</h2>
              <p className="text-sm font-semibold" style={{ color: c }}>@{EXEMPLO.handle}</p>
              <p className="mt-1 text-xs text-white/65">{EXEMPLO.nicheLabel} · {EXEMPLO.city}</p>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{EXEMPLO.followers}</p>
                <p className="text-[9px] uppercase tracking-wide text-white/55">seguidores</p>
              </div>
              <div className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold" style={{ color: '#FFD700' }}>{EXEMPLO.pixelCount.toLocaleString('pt-BR')}</p>
                <p className="text-[9px] uppercase tracking-wide text-white/55">pixels</p>
              </div>
              <div className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-bold text-white/70">{EXEMPLO.pixelW}×{EXEMPLO.pixelH}</p>
                <p className="text-[9px] uppercase tracking-wide text-white/55">tamanho</p>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-white/70">{EXEMPLO.bio}</p>

            <a
              href={EX_IG}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1.5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-[#111] transition-opacity hover:opacity-90"
              style={{ background: 'var(--grad-gold)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              Anunciar via WhatsApp
            </a>
            <p className="mb-3 text-center text-[10px] text-white/45">
              WhatsApp do exemplo: {EXEMPLO.whatsapp} (fictício)
            </p>

            <div className="mb-3">
              <p className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/50">
                <span className="h-px flex-1 bg-white/10" />
                Redes sociais
                <span className="h-px flex-1 bg-white/10" />
              </p>
              <div className="grid grid-cols-2 gap-2">
                {EX_SOCIALS.map(s => (
                  <a
                    key={s.key}
                    href={EX_IG}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-2xl px-3 py-3 transition-transform hover:scale-[1.03]"
                    style={{ background: s.bg, color: s.fg }}
                  >
                    {s.icon}
                    <span className="text-xs font-bold">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mb-2 space-y-2">
              <p className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/50">
                <span className="h-px flex-1 bg-white/10" />
                Links
                <span className="h-px flex-1 bg-white/10" />
              </p>
              {EXEMPLO.customLinks.map(link => (
                <a
                  key={link.label}
                  href={EX_IG}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#fff' }}
                >
                  <span className="text-base">{link.emoji}</span>
                  <span className="flex-1 text-xs font-semibold">{link.label}</span>
                  <span className="text-[10px] text-white/55">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fecho de venda dentro do overlay */}
      <div className="mt-4 shrink-0 text-center" onClick={e => e.stopPropagation()}>
        <Link href="/comprar?pixels=1" className="btn-gold px-8 py-3.5 text-sm">
          Quero a minha assim — R$ 0,99 →
        </Link>
        <p className="mt-2 max-w-sm text-[10px] text-white/45">
          Perfil de demonstração · dados de contato fictícios · links levam ao Instagram real
        </p>
      </div>
    </motion.div>
  )
}

export function ExemploButton() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost px-7 py-4 text-sm">
        👀 Ver um exemplo pronto
      </button>
      <AnimatePresence>
        {open && <ExemploModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
