import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { BrandShapes } from '@/components/ui/shape-landing-hero'
import { FeatureCardsFx } from '../vitrine/VitrineFx'

export const metadata: Metadata = {
  title: 'Criador UGC — não precisa de seguidores pra trabalhar com marcas',
  description:
    'Faça vídeos pra marca usar na própria página dela. Não precisa de seguidores, precisa de conteúdo bom. Monte seu portfólio e tabela de preços por R$ 0,99, vitalício.',
}

const FEATURES = [
  { icon: '🚫', title: 'Não precisa de seguidores', desc: 'A marca usa seu vídeo na própria página dela — o que importa é o conteúdo, não quantas pessoas te seguem.', accent: '#833AB4' },
  { icon: '🎥', title: 'Portfólio de vídeos',         desc: 'Cole seus melhores trabalhos — unboxing, testemunhal, review. A marca assiste antes de te chamar.', accent: '#E1306C' },
  { icon: '💰', title: 'Tabela de preços',            desc: 'Deixe claro quanto cobra por Reels, Stories, unboxing... zero ida e volta negociando o óbvio.', accent: '#FFD700' },
  { icon: '🔍', title: 'Busca dedicada no /marcas',   desc: 'Marca que procura UGC filtra só criadores UGC, ordenado por quem chegou mais recente — sua vez de aparecer.', accent: '#405DE6' },
  { icon: '📩', title: 'Contato direto, sem agência',  desc: 'A marca te chama no WhatsApp ou Instagram. Sem intermediário, sem comissão pra ninguém.', accent: '#1ed760' },
  { icon: '🗺️', title: 'Pixel no mapa incluso',       desc: 'Seu R$ 0,99 já garante espaço permanente no mapa, com badge de criador UGC pra quem passar o mouse.', accent: '#FFA500' },
]

const COMPARE = [
  { row: 'O que você precisa ter',      influencer: 'Seguidores — de preferência muitos',        ugc: 'Um celular e conteúdo bom' },
  { row: 'Tempo até a primeira marca',  influencer: 'Meses ou anos construindo audiência',        ugc: 'Pode ser essa semana' },
  { row: 'Onde o vídeo aparece',        influencer: 'No seu próprio perfil',                      ugc: 'No perfil e nos anúncios da marca' },
  { row: 'O que a marca avalia',        influencer: 'Número de seguidores e engajamento',         ugc: 'Qualidade do vídeo no portfólio' },
]

export default function UgcPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-dark px-4 pb-16 pt-24 lg:pt-16">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[400px] rounded-full bg-pink/4 blur-[100px]" />
      </div>
      <BrandShapes />

      <div className="relative mx-auto max-w-3xl">

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="mb-4 hidden text-xs text-white/55 transition-colors hover:text-white/80 lg:inline-block">
            ← Voltar pro mapa
          </Link>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-violet-300">
            🎬 Criadores UGC
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white md:text-7xl">
            NÃO PRECISA DE<br />
            <span style={{ color: '#833AB4' }}>SEGUIDORES.</span><br />
            <span className="animate-title-glow" style={{ color: '#FFD700' }}>PRECISA DE CONTEÚDO BOM.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
            UGC é o vídeo que a <strong className="text-white/90">marca usa na própria página dela</strong> —
            testemunhal, unboxing, review. Ninguém pergunta seu número de seguidores.
            Pergunta se o vídeo é bom.
          </p>
        </div>

        {/* CTA topo */}
        <div className="mt-8 text-center">
          <Link href="/comprar?pixels=1&ugc=1" className="btn-gold px-9 py-4 text-base">
            Montar meu perfil de criador — R$ 0,99 →
          </Link>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-white/65">
            Como funciona: você garante um espaço no mapa (a partir de 1 pixel, R$ 0,99) e ativa o modo
            criador UGC — <strong className="text-gold">portfólio e tabela de preços inclusos</strong>,
            sem seguidores exigidos. Pagamento único, vitalício.
          </p>
        </div>

        {/* Features */}
        <Reveal className="mt-16 text-center">
          <h2 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            SEU KIT DE<br /><span style={{ color: '#833AB4' }}>CRIADOR UGC</span>
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Tudo que uma marca precisa ver antes de te chamar, num perfil só.
          </p>
        </Reveal>
        <FeatureCardsFx features={FEATURES} />

        {/* Comparativo influencer vs UGC */}
        <Reveal className="mt-16 text-center">
          <h2 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            VIRAR INFLUENCER<br /><span style={{ color: '#833AB4' }}>OU VIRAR CRIADOR UGC?</span>
          </h2>
          <p className="mt-3 text-sm text-white/60">
            São dois jogos diferentes. Aqui você pode jogar os dois — a página é a mesma.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-3 bg-dark-2 text-center text-[10px] font-bold uppercase tracking-widest">
            <div className="p-3 text-white/50">Critério</div>
            <div className="p-3 text-white/70">Influencer</div>
            <div className="p-3 text-violet-300" style={{ background: 'rgba(131,58,180,0.08)' }}>Criador UGC</div>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.row}
              className="grid grid-cols-3 text-xs"
              style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
            >
              <div className="border-t border-white/8 p-3 font-semibold text-white/60">{row.row}</div>
              <div className="border-t border-white/8 p-3 text-white/55">{row.influencer}</div>
              <div className="border-t border-white/8 p-3 font-semibold text-white/85" style={{ background: 'rgba(131,58,180,0.05)' }}>{row.ugc}</div>
            </div>
          ))}
        </Reveal>

        {/* Reforço: pode ser as duas coisas */}
        <Reveal className="mt-10">
          <div className="rounded-2xl border border-white/10 bg-dark-2 p-6 text-center">
            <p className="text-sm font-bold text-white">🌱 Já tem alguns seguidores? Ótimo — não é obrigatório escolher.</p>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-white/65">
              Ative o modo UGC e continue crescendo como influencer ao mesmo tempo: seu perfil aparece
              no mapa, na roleta de descoberta e no ranking normalmente — só ganha, além disso,
              portfólio e tabela de preços pra fechar com marcas.
            </p>
          </div>
        </Reveal>

        {/* CTA final */}
        <Reveal className="mt-12 text-center">
          <h2 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            SUA PRIMEIRA MARCA<br /><span style={{ color: '#833AB4' }}>PODE SER ESSA SEMANA</span>
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/comprar?pixels=1&ugc=1" className="btn-gold px-10 py-4 text-base">
              Montar meu perfil de criador — R$ 0,99 →
            </Link>
            <Link href="/marcas?ugc=1" className="btn-ghost px-7 py-4 text-sm">
              Ver quem já é criador UGC
            </Link>
          </div>
          <p className="mt-3 text-xs text-white/50">
            Do primeiro vídeo à primeira marca — sem precisar de seguidores pra começar.
          </p>
        </Reveal>
      </div>
    </main>
  )
}
