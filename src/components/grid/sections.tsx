import Link from 'next/link'
import { getTopBlocks, getGridStats } from '@/lib/db/blocks'
import { NICHE_LABELS, NICHE_COLORS } from '@/types'
import { Reveal } from '@/components/ui/Reveal'

// ─── Como Funciona ────────────────────────────────────────
export function HowItWorksSection() {
  const steps = [
    {
      n: '01', icon: '🎯',
      title: 'Escolha seus pixels',
      desc: 'A partir de 1 pixel por R$ 0,99. Quanto mais pixels, maior e mais visível seu bloco na grade.',
      color: '#FFD700',
    },
    {
      n: '02', icon: '✨',
      title: 'Monte seu perfil',
      desc: 'Adicione @, nicho, bio, foto e links das suas redes. Marcas e seguidores veem tudo no popup.',
      color: '#E1306C',
    },
    {
      n: '03', icon: '⚡',
      title: 'Pague uma única vez',
      desc: 'Pix instantâneo ou cartão. R$ 0,99 por pixel. Sem mensalidade, sem renovação. Nunca.',
      color: '#405DE6',
    },
    {
      n: '04', icon: '🚀',
      title: 'Ganhe seguidores',
      desc: 'Seu perfil entra no mapa, no ranking e na roleta de descoberta. Quem te encontra segue com 1 clique. Para sempre.',
      color: '#1ed760',
    },
  ]

  return (
    <section id="como-funciona" className="relative overflow-hidden px-4 py-24">
      {/* Fundo sutil */}
      <div className="pointer-events-none absolute inset-0 bg-dark-2" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-gold/3 blur-[100px]" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-pink/3 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-pink">
            Como funciona
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            4 PASSOS PARA<br />
            <span className="text-gold">GANHAR SEGUIDORES</span>
          </h2>
          <p className="mt-4 text-sm text-white/60">
            Começando do zero ou já com milhões: pague uma vez, apareça sempre.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
            <div
              className="group relative h-full overflow-hidden rounded-2xl border border-white/5 bg-dark-3 p-6 transition-all hover:-translate-y-1 hover:border-white/10"
            >
              {/* Número grande decorativo */}
              <div
                className="pointer-events-none absolute -right-3 -top-4 font-display text-8xl font-bold opacity-5"
                style={{ color: s.color }}
              >
                {i + 1}
              </div>

              {/* Badge do passo */}
              <div
                className="mb-4 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: s.color + '22', color: s.color }}
              >
                {s.n}
              </div>

              <div className="mb-3 text-3xl">{s.icon}</div>
              <h3 className="mb-2 text-sm font-bold text-white">{s.title}</h3>
              <p className="text-xs leading-relaxed text-white/65">{s.desc}</p>

              {/* Linha colorida no bottom */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
                style={{ background: s.color }}
              />
            </div>
            </Reveal>
          ))}
        </div>

        {/* CTA inline */}
        <div className="mt-12 text-center">
          <Link href="/comprar" className="btn-gold px-8 py-3.5 text-sm">
            Começar agora — a partir de R$ 0,99 →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Preços ───────────────────────────────────────────────
export function PricingSection() {
  const plans = [
    { name: 'Micro',   pixels: 1,      side: 1,   price: '0,99',   niche: 'fitness',     featured: false, tag: 'seu primeiro passo' },
    { name: 'Básico',  pixels: 100,    side: 10,  price: '99',     niche: 'tecnologia',  featured: false, tag: 'pra quem tá começando' },
    { name: 'Médio',   pixels: 900,    side: 30,  price: '891',    niche: 'moda',        featured: true,  tag: 'criador em crescimento' },
    { name: 'Grande',  pixels: 2500,   side: 50,  price: '2.475',  niche: 'viagens',     featured: false, tag: 'destaque no mapa' },
    { name: 'Premium', pixels: 10000,  side: 100, price: '9.900',  niche: 'games',       featured: false, tag: 'pra quem já é grande' },
    { name: 'Marca',   pixels: 40000,  side: 200, price: '39.600', niche: 'financas',    featured: false, tag: 'presença de gigante' },
  ]

  return (
    <section id="precos" className="relative overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/4 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
            Preços
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            ESCOLHA<br />
            <span className="text-gold">SEU ESPAÇO</span>
          </h2>
          <p className="mt-4 text-sm text-white/60">
            Tem tamanho pra cada fase: do primeiro pixel de quem tá começando ao quarteirão de quem já é gigante. R$ 0,99/pixel, permanente.
          </p>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p, i) => {
            const color = NICHE_COLORS[p.niche as keyof typeof NICHE_COLORS] || '#E1306C'
            const previewSize = Math.min(p.side, 72)

            return (
              <Reveal key={p.name} delay={(i % 3) * 100}>
              <div
                className={`group relative h-full overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-1 ${
                  p.featured
                    ? 'border border-gold/30 bg-gold/5'
                    : 'border border-white/5 bg-dark-2 hover:border-white/10'
                }`}
              >
                {p.featured && (
                  <div className="absolute right-3 top-3">
                    <span className="badge-gold text-[9px]">Mais popular</span>
                  </div>
                )}

                {/* Preview do bloco com cor real */}
                <div className="mb-4 relative">
                  <div
                    className="rounded-lg"
                    style={{
                      width:      previewSize + 'px',
                      height:     previewSize + 'px',
                      background: color + '33',
                      border:     `1.5px solid ${color}66`,
                      boxShadow:  p.featured ? `0 0 20px ${color}33` : `0 0 8px ${color}22`,
                    }}
                  />
                  {/* Mini grid simulado */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `repeating-linear-gradient(0deg, ${color}44 0px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, ${color}44 0px, transparent 1px, transparent 8px)`,
                      width:  previewSize + 'px',
                      height: previewSize + 'px',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-white/55">{p.name}</p>
                <p className="mt-0.5 text-xs font-semibold" style={{ color: color + 'cc' }}>{p.tag}</p>
                <p className="mt-0.5 text-xs text-white/45">
                  {p.pixels.toLocaleString('pt-BR')} pixels · {p.side}×{p.side}
                </p>

                <p className="mt-3 font-display text-4xl text-white">
                  R${p.price}
                </p>
                <p className="mt-0.5 text-[10px] text-white/50">pagamento único · vitalício</p>

                <Link
                  href={`/comprar?pixels=${p.pixels}`}
                  className={`mt-4 block rounded-xl py-2.5 text-center text-xs font-bold transition-all ${
                    p.featured
                      ? 'btn-gold'
                      : 'border border-white/10 text-white/70 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  Escolher
                </Link>
              </div>
              </Reveal>
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-white/50">
          Não sabe qual escolher? Comece com o Micro por R$ 0,99 e expanda quando quiser.
        </p>
      </div>
    </section>
  )
}

// ─── Ranking ──────────────────────────────────────────────
export async function RankingSection() {
  const top     = await getTopBlocks(10)
  const medals  = ['🥇', '🥈', '🥉']

  return (
    <section className="relative overflow-hidden bg-dark-2 px-4 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-gold/4 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <Reveal className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#833AB4' }}>
            Ranking
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            OS MAIORES<br />
            <span className="text-gold">BLOCOS</span>
          </h2>
        </Reveal>

        <div className="space-y-2">
          {top.map((b, i) => {
            const initials = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
            const color    = b.colorHex || '#E1306C'
            return (
              <Reveal key={b.id} delay={i * 60}>
              <Link
                href={`/influencer/${b.instagramHandle}`}
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-dark-3 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-white/10"
              >
                <span className="w-8 shrink-0 text-center text-lg">
                  {medals[i] ?? <span className="text-sm font-bold text-white/45">#{i + 1}</span>}
                </span>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
                  style={{ background: color }}
                >
                  {b.avatarUrl
                    ? <img src={b.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-white">@{b.instagramHandle}</p>
                  <p className="text-xs text-white/55">
                    {NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche}
                    {b.city ? ` · ${b.city}` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-gold">{b.pixelCount.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-white/50">pixels</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/40 group-hover:text-white/65 transition-colors"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              </Reveal>
            )
          })}
        </div>

        <div className="mt-6 text-center">
          <Link href="/ranking" className="btn-ghost px-6 py-2.5 text-sm">
            Ver ranking completo →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Prova Social ─────────────────────────────────────────
export async function SocialProofSection() {
  const [top, stats] = await Promise.all([getTopBlocks(6), getGridStats()])

  return (
    <section className="relative overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/4 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <Reveal className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-pink">
            Quem já garantiu
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            OS PRIMEIROS<br />
            <span className="text-gold">DO MAPA</span>
          </h2>
          <p className="mt-4 text-sm text-white/60">
            Esses influencers já garantiram seu espaço permanente. O seu ainda está disponível.
          </p>
        </Reveal>

        {/* Cards dos early adopters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((b, cardIdx) => {
            const initials   = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
            const color      = b.colorHex || '#E1306C'
            const nicheLabel = NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche

            return (
              <Reveal key={b.id} delay={(cardIdx % 3) * 100}>
              <Link
                href={`/influencer/${b.instagramHandle}`}
                className="group relative block h-full overflow-hidden rounded-2xl border border-white/5 bg-dark-2 p-5 transition-all hover:-translate-y-1 hover:border-white/10"
              >
                {/* Badge early adopter */}
                <div className="absolute right-3 top-3 rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-bold text-gold">
                  Early adopter
                </div>

                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white"
                    style={{ background: color }}
                  >
                    {b.avatarUrl
                      ? <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                      : initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">@{b.instagramHandle}</p>
                    <p className="text-xs" style={{ color: color + 'bb' }}>{nicheLabel}</p>
                  </div>
                </div>

                {/* Bio */}
                {b.bio && (
                  <p className="mb-4 text-xs leading-relaxed text-white/70 line-clamp-2">
                    "{b.bio}"
                  </p>
                )}

                {/* Stats */}
                <div className="flex gap-3 border-t border-white/5 pt-3">
                  {b.followers && (
                    <div>
                      <p className="text-sm font-bold text-gold">{b.followers}</p>
                      <p className="text-[9px] uppercase tracking-wide text-white/50">seguidores</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gold">{b.pixelCount.toLocaleString('pt-BR')}</p>
                    <p className="text-[9px] uppercase tracking-wide text-white/50">pixels</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/60">{b.pixelWidth}×{b.pixelHeight}</p>
                    <p className="text-[9px] uppercase tracking-wide text-white/50">tamanho</p>
                  </div>
                  {b.city && (
                    <div className="ml-auto text-right">
                      <p className="text-xs text-white/55">📍 {b.city}</p>
                    </div>
                  )}
                </div>

                {/* Hover: ver perfil */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-2xl bg-gradient-to-t from-dark-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs font-semibold text-gold">Ver perfil completo →</span>
                </div>
              </Link>
              </Reveal>
            )
          })}
        </div>

        {/* Counters de prova social */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: '🗺️', n: stats.available.toLocaleString('pt-BR'), l: 'pixels disponíveis' },
            { icon: '⚡', n: 'R$ 0,99',  l: 'por pixel' },
            { icon: '∞',  n: 'vitalício', l: 'sem renovação' },
            { icon: '🔗', n: 'gratuito',  l: 'link-in-bio incluso' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 80}>
            <div className="h-full rounded-2xl border border-white/5 bg-dark-2 p-5 text-center">
              <div className="mb-2 text-2xl animate-float" style={{ animationDelay: `${i * 0.4}s` }}>{s.icon}</div>
              <p className="font-display text-xl text-gold">{s.n}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-white/55">{s.l}</p>
            </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/comprar" className="btn-gold px-8 py-3.5 text-sm">
            Garantir meu espaço agora →
          </Link>
          <p className="mt-3 text-xs text-white/50">
            Seja um dos primeiros. Quando o mapa encher, não haverá mais espaço.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────
export function FAQSection() {
  const faqs = [
    {
      category: 'Para Influencers',
      color: '#FFD700',
      items: [
        {
          q: 'O que é o 1 Milhão de Influencer?',
          a: 'É um mapa digital permanente com 1.000.000 de pixels onde cada influencer compra seu espaço. Você aparece para marcas e seguidores para sempre, sem pagar mensalidade.',
        },
        {
          q: 'Estou começando do zero. Funciona pra mim?',
          a: 'Sim — foi feito pra isso. Por R$ 0,99 você já entra no mapa, na roleta de descoberta e no ranking do seu nicho: os mesmos lugares onde os grandes aparecem. Quem está começando é descoberto por quem navega; quem já é grande usa o espaço pra multiplicar a audiência que já tem. Os dois saem ganhando seguidores.',
        },
        {
          q: 'Não tenho seguidores. Ainda dá pra trabalhar com marcas?',
          a: 'Dá — é exatamente pra isso que existe o modo Criador UGC. Você ativa no cadastro (ou depois no painel), monta um portfólio de vídeos e uma tabela de preços, e aparece numa busca dedicada no portal de marcas. Marca de UGC não olha seguidores, olha o vídeo. Detalhes em /ugc.',
        },
        {
          q: 'Como eu ganho seguidores aqui?',
          a: 'De vários jeitos ao mesmo tempo: seu bloco aparece no mapa com sua foto; seu perfil entra na roleta de descoberta (/descobrir), onde visitantes giram e seguem com 1 clique; você aparece no ranking por nicho e cidade; e ganha uma página Vitrine 1M com todas as suas redes. Cada visita e clique aparece nas estatísticas do seu painel.',
        },
        {
          q: 'Quanto custa e como funciona o pagamento?',
          a: 'R$ 0,99 por pixel, a partir de 1 pixel. O pagamento é único — você paga uma vez e seu espaço fica no mapa para sempre. Aceitamos Pix e cartão de crédito.',
        },
        {
          q: 'O que aparece no meu bloco?',
          a: 'Sua foto ou logo, seu @, nome, nicho e cidade. Quando alguém passa o mouse no seu bloco, aparece um popup completo com suas redes sociais, bio e botão de contato para marcas.',
        },
        {
          q: 'Posso editar meu perfil depois de comprar?',
          a: 'Sim! Você recebe um link de edição no e-mail após a compra. Com ele você pode atualizar foto, bio, redes sociais e links personalizados a qualquer momento, sem custo adicional.',
        },
        {
          q: 'O que é o link-in-bio incluso?',
          a: 'Cada influencer ganha uma página em 1milhao.com.br/influencer/seuarroba — uma página profissional com todas as suas redes, links e botão de contato para marcas. Substitui o Linktree gratuitamente.',
        },
        {
          q: 'Quanto maior meu bloco, mais visível fico?',
          a: 'Sim. Blocos maiores ocupam mais espaço no mapa e são mais fáceis de ver. Mas mesmo o menor bloco aparece no mapa e no ranking, e tem a mesma página de perfil completa.',
        },
      ],
    },
    {
      category: 'Para Marcas',
      color: '#E1306C',
      items: [
        {
          q: 'Como encontro influencers para minha campanha?',
          a: 'Acesse o portal de marcas em /marcas e filtre por nicho (fitness, moda, tecnologia...), cidade e tamanho de audiência. Clique no perfil e entre em contato direto pelo WhatsApp ou Instagram.',
        },
        {
          q: 'O contato com os influencers é direto?',
          a: 'Sim, 100% direto. Não há intermediários nem taxas de agência. Você clica em "Anunciar" no perfil do influencer e é redirecionado direto para o WhatsApp ou Instagram dele.',
        },
        {
          q: 'É grátis para marcas usar o portal?',
          a: 'Sim. O portal de marcas é completamente gratuito. Você pode buscar, filtrar e entrar em contato com qualquer influencer sem pagar nada.',
        },
        {
          q: 'Quais informações vejo sobre cada influencer?',
          a: 'Número de seguidores, nicho, cidade, bio, todas as redes sociais e links. Tudo que você precisa para avaliar se o influencer é o parceiro certo para sua campanha.',
        },
      ],
    },
  ]

  return (
    <section id="faq" className="relative overflow-hidden bg-dark-2 px-4 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-gold/3 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <Reveal className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
            Dúvidas frequentes
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            PERGUNTAS &<br />
            <span className="text-gold">RESPOSTAS</span>
          </h2>
        </Reveal>

        <div className="space-y-10">
          {faqs.map(cat => (
            <div key={cat.category}>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: cat.color + '22', color: cat.color }}
              >
                {cat.category}
              </div>
              <div className="space-y-2">
                {cat.items.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-white/5 bg-dark-3 transition-all open:border-white/10"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-white list-none">
                      {item.q}
                      <span
                        className="shrink-0 text-lg text-white/55 transition-transform group-open:rotate-45"
                        style={{ lineHeight: 1 }}
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-sm leading-relaxed text-white/70">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-gold/15 bg-gold/5 p-6 text-center">
          <p className="text-sm font-bold text-gold mb-1">Ainda tem dúvidas?</p>
          <p className="text-xs text-white/65 mb-4">
            Entre em contato pelo Instagram ou e-mail — respondemos em até 24h.
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-6 py-2.5 text-sm"
          >
            Falar com a gente →
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Footer CTA ───────────────────────────────────────────
export async function FooterCTA() {
  const stats = await getGridStats()
  const footerLinks = [
    { label: 'Início',         href: '/' },
    { label: 'Como funciona',  href: '#como-funciona' },
    { label: 'Preços',         href: '#precos' },
    { label: 'Descobrir influencers', href: '/descobrir' },
    { label: 'Link na bio (Vitrine 1M)', href: '/vitrine' },
    { label: 'Dicas de crescimento', href: '/dicas' },
    { label: 'Sou criador(a) UGC', href: '/ugc' },
    { label: 'Ranking',        href: '/ranking' },
    { label: 'Para marcas',       href: '/marcas' },
    { label: 'Login anunciante',  href: '/login' },
    { label: 'Termos',            href: '/termos' },
  ]

  return (
    <section className="relative overflow-hidden px-4 py-24">
      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <Reveal>
        {/* Urgência */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs text-red-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          Pixels esgotando — {stats.available.toLocaleString('pt-BR')} restantes
        </div>

        <h2 className="font-display text-5xl tracking-wide text-white md:text-7xl">
          SEUS PRÓXIMOS SEGUIDORES<br />
          <span className="animate-title-glow" style={{ color: '#FFD700' }}>ESTÃO AQUI</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/65">
          Começando do zero ou já com milhões: quando acabar, acabou. Espaço permanente a partir de R$ 0,99. Sem renovação. Para sempre.
        </p>
        </Reveal>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/comprar" className="btn-gold px-10 py-4 text-base">
            Garantir meu espaço permanente →
          </Link>
          <Link href="/marcas" className="btn-ghost px-8 py-4 text-sm">
            Sou uma marca
          </Link>
        </div>

        {/* Garantias */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-white/50">
          {['✓ Pagamento único', '✓ Sem mensalidade', '✓ Vitalício', '✓ Suporte por e-mail'].map(g => (
            <span key={g}>{g}</span>
          ))}
        </div>

        {/* Footer links */}
        <div className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/5 pt-10 text-xs text-white/45">
          {footerLinks.map(l => (
            <Link key={l.label} href={l.href} className="hover:text-white/70 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-[11px] text-white/40">
          © {new Date().getFullYear()} 1 Milhão de Influencer · Todos os direitos reservados
        </p>
      </div>
    </section>
  )
}