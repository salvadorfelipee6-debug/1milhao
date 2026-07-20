import Link from 'next/link'
import type { DicaArticle } from '@/lib/content/dicas'
import { Reveal } from '@/components/ui/Reveal'

export function DicaCard({ dica, delay = 0 }: { dica: DicaArticle; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/dicas/${dica.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-dark-2 p-5 transition-all hover:-translate-y-1 hover:border-white/10"
      >
        <div className="mb-4 flex items-center justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
            style={{ background: dica.accent + '1f', border: `1px solid ${dica.accent}55` }}
          >
            {dica.icon}
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: dica.accent + '1a', color: dica.accent }}
          >
            {dica.category}
          </span>
        </div>

        <h3 className="mb-2 text-base font-bold leading-snug text-white">{dica.title}</h3>
        <p className="mb-4 flex-1 text-[13px] leading-relaxed text-white/60">{dica.excerpt}</p>

        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-white/45">
          <span>⏱ {dica.readTime} de leitura</span>
          <span className="font-semibold text-white/55 transition-colors group-hover:text-gold">
            Ler →
          </span>
        </div>

        <div
          className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
          style={{ background: dica.accent }}
        />
      </Link>
    </Reveal>
  )
}
