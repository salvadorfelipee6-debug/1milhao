import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DICAS, getDicaBySlug } from '@/lib/content/dicas'
import { DicaSpine } from '@/components/dicas/DicaSpine'
import { Reveal } from '@/components/ui/Reveal'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return DICAS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const dica = getDicaBySlug(slug)
  if (!dica) return { title: 'Dica não encontrada' }
  return {
    title:       `${dica.title} — Dicas de Crescimento`,
    description: dica.excerpt,
  }
}

export default async function DicaPage({ params }: Props) {
  const { slug } = await params
  const dica = getDicaBySlug(slug)
  if (!dica) notFound()

  const others = DICAS.filter(d => d.slug !== dica.slug).slice(0, 2)

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark px-4 pb-20 pt-24 lg:pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[380px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: dica.accent + '14' }} />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <Link href="/dicas" className="mb-8 inline-block text-xs text-white/55 transition-colors hover:text-white/80">
          ← Todas as dicas
        </Link>

        <Reveal>
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ background: dica.accent + '1f', border: `1px solid ${dica.accent}55` }}
            >
              {dica.icon}
            </div>
            <div>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: dica.accent + '1a', color: dica.accent }}
              >
                {dica.category}
              </span>
              <span className="ml-2 text-[11px] text-white/45">⏱ {dica.readTime}</span>
            </div>
          </div>

          <h1 className="font-display text-4xl leading-[1.05] tracking-wide text-white md:text-5xl">
            {dica.title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/65">
            {dica.excerpt}
          </p>
        </Reveal>

        {/* Resumo rápido pra quem só quer escanear */}
        <Reveal delay={80}>
          <div className="mt-8 rounded-2xl border border-white/8 bg-dark-2 p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/50">
              Resumo rápido
            </p>
            <ul className="space-y-2">
              {dica.summary.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/75">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: dica.accent }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-10">
          <DicaSpine blocks={dica.blocks} accent={dica.accent} />
        </div>

        {/* Fecho com CTA do produto, coerente com o assunto do artigo */}
        <Reveal delay={100}>
          <div
            className="mt-10 rounded-2xl border p-6 text-center"
            style={{ borderColor: dica.accent + '40', background: dica.accent + '0d' }}
          >
            <p className="text-sm font-bold text-white">{dica.closing.text}</p>
            <Link href={dica.closing.ctaHref} className="btn-gold mt-4 inline-block px-7 py-3 text-sm">
              {dica.closing.ctaLabel}
            </Link>
          </div>
        </Reveal>

        {others.length > 0 && (
          <div className="mt-14">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
              Continue lendo
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {others.map(o => (
                <Link
                  key={o.slug}
                  href={`/dicas/${o.slug}`}
                  className="group rounded-2xl border border-white/8 bg-dark-2 p-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
                >
                  <span className="text-lg">{o.icon}</span>
                  <p className="mt-2 text-sm font-bold text-white">{o.title}</p>
                  <p className="mt-1 text-xs text-white/55 transition-colors group-hover:text-gold">Ler →</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
