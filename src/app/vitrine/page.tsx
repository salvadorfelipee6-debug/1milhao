import type { Metadata } from 'next'
import Link from 'next/link'
import { SocialLinks } from '@/components/ui/social-links'
import { Reveal } from '@/components/ui/Reveal'
import { SOCIAL_CONFIG } from '@/lib/socialConfig'

export const metadata: Metadata = {
  title: 'Vitrine 1M — link na bio vitalício por R$ 0,99',
  description:
    'Seu link na bio completo — todas as redes, links, estatísticas, QR code e mídia kit — por R$ 0,99 pagos uma única vez. Vitalício, sem mensalidade, sem surpresas.',
}

// Redes exibidas na demo animada (nomes + tiles oficiais do socialConfig)
const DEMO_KEYS = ['instagramUrl', 'youtubeUrl', 'tiktokUrl', 'spotifyUrl', 'twitterUrl'] as const

const FEATURES = [
  { icon: '🔗', title: 'Sua página própria',        desc: '1milhao.com.br/influencer/seuarroba — pronta pra colar na bio do Instagram.' },
  { icon: '📱', title: 'Todas as suas redes',        desc: 'Instagram, YouTube, TikTok, X, Facebook, Kwai, OnlyFans, Spotify e WhatsApp em botões oficiais.' },
  { icon: '🧩', title: 'Até 6 links livres',          desc: 'Loja, curso, portfólio, PIX, o que você quiser — com emoji e nome próprios.' },
  { icon: '📊', title: 'Estatísticas reais',          desc: 'Visitas e cliques por rede e por link, direto no seu painel. Sem achismo.' },
  { icon: '🎯', title: 'QR code pronto',              desc: 'Gere o QR da sua página pra usar em card, banner ou stories.' },
  { icon: '📸', title: 'Mídia kit automático',        desc: 'Página de mídia kit gerada com seus números — baixe em imagem e mande pra marcas.' },
  { icon: '💼', title: 'Propostas de marcas',         desc: 'Marcas enviam briefing direto pra você. Aceita ou recusa no painel.' },
  { icon: '🗺️', title: 'Pixel no mapa incluso',       desc: 'Seu R$ 0,99 já compra 1 pixel no mapa — você entra na roleta e no ranking.' },
]

export default function VitrinePage() {
  const socials = SOCIAL_CONFIG
    .filter(s => (DEMO_KEYS as readonly string[]).includes(s.key))
    .map(s => ({ name: s.label === 'X / Twitter' ? 'X' : s.label, bg: s.bg, fg: s.fg, icon: s.icon }))

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark px-4 pb-16 pt-24 lg:pt-16">

      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[400px] rounded-full bg-pink/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="mb-4 hidden text-xs text-white/55 transition-colors hover:text-white/80 lg:inline-block">
            ← Voltar pro mapa
          </Link>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
            🔗 Vitrine 1M · seu link na bio
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white md:text-7xl">
            UM LINK NA BIO<br />
            <span className="animate-title-glow" style={{ color: '#FFD700' }}>SEU PARA SEMPRE</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
            Ferramentas de link na bio cobram mensalidade pra sempre.
            Aqui você paga <strong className="text-gold">R$ 0,99 uma única vez</strong> e
            a página é sua <strong className="text-white/90">pra sempre</strong>. Sem surpresas.
          </p>
        </div>

        {/* Demo animada — logos saltando sobre os nomes (cicla sozinha no celular) */}
        <Reveal className="mt-10">
          <div
            className="rounded-3xl border border-white/10 bg-dark-2 px-4 py-14"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)',
              backgroundSize:  '16px 16px',
            }}
          >
            <SocialLinks socials={socials} />
            <p className="mt-8 text-center text-[11px] text-white/50">
              Assim os visitantes veem suas redes — repare que ela se mexe sozinha 😉
            </p>
          </div>
        </Reveal>

        {/* CTA topo */}
        <div className="mt-6 text-center">
          <Link href="/comprar?pixels=1" className="btn-gold px-9 py-4 text-base">
            Criar minha Vitrine — R$ 0,99 →
          </Link>
          <p className="mt-2 text-[11px] text-white/55">
            Pagamento único · vitalício · pronto em 2 minutos
          </p>
        </div>

        {/* Tudo que vem nos R$ 0,99 */}
        <Reveal className="mt-16 text-center">
          <h2 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            TUDO ISSO NOS<br /><span className="text-gold">R$ 0,99</span>
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Não é versão grátis capada. É o produto inteiro, de uma vez, pra sempre.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 90}>
              <div className="h-full rounded-2xl border border-white/5 bg-dark-2 p-5 transition-all hover:-translate-y-0.5 hover:border-white/10">
                <div className="mb-2 text-2xl">{f.icon}</div>
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/65">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Comparativo assinatura vs vitalício */}
        <Reveal className="mt-16">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-dark-2 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/55">
                Ferramentas de assinatura
              </p>
              <p className="mt-2 font-display text-3xl text-white/80">R$ 20–50<span className="text-base text-white/55">/mês</span></p>
              <ul className="mt-3 space-y-1.5 text-xs text-white/60">
                <li>✕ Cobra todo mês, pra sempre</li>
                <li>✕ Cancelou, sumiu sua página</li>
                <li>✕ Recursos bons só no plano pago</li>
                <li>✕ Você é mais um no meio de milhões</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                Vitrine 1M
              </p>
              <p className="mt-2 font-display text-3xl text-gold">R$ 0,99<span className="text-base text-white/65"> uma vez</span></p>
              <ul className="mt-3 space-y-1.5 text-xs text-white/70">
                <li>✓ Vitalício — paga uma vez, é seu</li>
                <li>✓ Estatísticas, QR e mídia kit inclusos</li>
                <li>✓ Marcas te encontram e mandam proposta</li>
                <li>✓ Bônus: pixel no mapa + roleta + ranking</li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Sem surpresas */}
        <Reveal className="mt-10">
          <div className="rounded-2xl border border-white/10 bg-dark-2 p-6 text-center">
            <p className="text-sm font-bold text-white">🤝 Sem surpresas — é R$ 0,99 e acabou</p>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-white/65">
              O link é vitalício e o seu espaço no mapa também. Sem mensalidade, sem renovação,
              sem taxa escondida, sem "premium" depois. Se um dia você quiser um bloco maior
              no mapa pra aparecer mais, aí sim é opcional — e continua sendo pagamento único.
            </p>
          </div>
        </Reveal>

        {/* CTA final */}
        <Reveal className="mt-12 text-center">
          <h2 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            SUA BIO MERECE<br /><span className="text-gold">UM LINK VITALÍCIO</span>
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/comprar?pixels=1" className="btn-gold px-10 py-4 text-base">
              Criar minha Vitrine — R$ 0,99 →
            </Link>
            <Link href="/" className="btn-ghost px-7 py-4 text-sm">
              Ver o mapa
            </Link>
          </div>
          <p className="mt-3 text-xs text-white/50">
            Do primeiro seguidor ao próximo milhão — começa com um link.
          </p>
        </Reveal>
      </div>
    </main>
  )
}
