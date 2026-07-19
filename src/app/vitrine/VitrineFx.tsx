'use client'

import * as React from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

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
