import type { Metadata } from 'next'
import { DICAS } from '@/lib/content/dicas'
import { DicasFilter } from '@/components/dicas/DicasFilter'
import { Reveal } from '@/components/ui/Reveal'

export const metadata: Metadata = {
  title: 'Dicas de Crescimento — 1 Milhão de Influencer',
  description: 'Ferramentas gratuitas, como gravar vídeo de apresentação pra UGC, como gravar vídeos melhores e como crescer nas redes de verdade. Dicas práticas, sem enrolação.',
}

export default function DicasPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-dark px-4 pb-20 pt-24 lg:pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
            Sem enrolação
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white md:text-7xl">
            DICAS DE<br /><span className="text-gold">CRESCIMENTO</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/70">
            Ferramentas grátis, como gravar vídeo, como crescer de verdade. Feito pra quem está
            começando a ganhar seguidores e pra quem já é grande e quer continuar crescendo.
          </p>
        </Reveal>

        <DicasFilter dicas={DICAS} />
      </div>
    </main>
  )
}
