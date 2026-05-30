import Link from 'next/link'
import { getTopBlocks } from '@/lib/db/blocks'
import { NICHE_LABELS } from '@/types'

// ─── Como Funciona ────────────────────────────────────────
export function HowItWorksSection() {
  const steps = [
    { n: '01', icon: '🔢', title: 'Escolha seus pixels',  desc: 'Mínimo 100px (10×10) por R$ 10. Quanto mais pixels, maior e mais visível seu bloco na grade.' },
    { n: '02', icon: '✍️', title: 'Monte seu perfil',      desc: 'Adicione @, nicho, bio, foto e um vídeo de apresentação. Marcas veem tudo no popup.' },
    { n: '03', icon: '💳', title: 'Pague uma única vez',   desc: 'Pix instantâneo ou cartão. R$ 0,10 por pixel. Sem mensalidade, sem renovação.' },
    { n: '04', icon: '🗺️', title: 'Apareça para sempre',   desc: 'Seu bloco entra no mapa em tempo real. Marcas te acham com um hover. Para sempre.' },
  ]

  return (
    <section id="como-funciona" className="bg-dark-2 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-pink">
            Como funciona
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            4 PASSOS PARA<br />
            <span className="text-gold">APARECER</span>
          </h2>
          <p className="mt-4 text-sm text-white/35">
            Sem assinatura. Sem renovação. Pague uma vez, apareça sempre.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(s => (
            <div key={s.n} className="card-dark rounded-2xl p-6 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 font-display text-sm tracking-wider text-gold">
                {s.n}
              </div>
              <div className="mb-3 text-3xl">{s.icon}</div>
              <h3 className="mb-2 text-sm font-bold text-white">{s.title}</h3>
              <p className="text-xs leading-relaxed text-white/40">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Preços ───────────────────────────────────────────────
export function PricingSection() {
  const plans = [
    { name: 'Micro',   pixels: 100,   side: 10,  price: '10',    featured: false },
    { name: 'Básico',  pixels: 400,   side: 20,  price: '40',    featured: false },
    { name: 'Médio',   pixels: 900,   side: 30,  price: '90',    featured: true  },
    { name: 'Grande',  pixels: 2500,  side: 50,  price: '250',   featured: false },
    { name: 'Premium', pixels: 10000, side: 100, price: '1.000', featured: false },
    { name: 'Marca',   pixels: 40000, side: 200, price: '4.000', featured: false },
  ]

  return (
    <section id="precos" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
            Preços
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            ESCOLHA<br />
            <span className="text-gold">SEU ESPAÇO</span>
          </h2>
          <p className="mt-4 text-sm text-white/35">
            Cada real investido é permanente. Não existe renovação.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(p => (
            <div
              key={p.name}
              className={`relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1 ${
                p.featured
                  ? 'border border-gold/30 bg-gold/5'
                  : 'card-dark'
              }`}
            >
              {p.featured && (
                <div className="absolute right-3 top-3">
                  <span className="badge-gold text-[9px]">Mais popular</span>
                </div>
              )}

              {/* Preview do bloco */}
              <div
                className="mb-4 rounded-lg border border-pink/20 bg-pink/10"
                style={{
                  width:  Math.min(p.side, 80) + 'px',
                  height: Math.min(p.side, 80) + 'px',
                }}
              />

              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{p.name}</p>
              <p className="mt-1 text-xs text-white/20">
                {p.pixels.toLocaleString('pt-BR')} pixels · {p.side}×{p.side}
              </p>

              <p className="mt-3 font-display text-4xl text-white">
                R${p.price}
              </p>
              <p className="mt-1 text-[10px] text-white/25">pagamento único · vitalício</p>

              <Link
                href={`/comprar?pixels=${p.pixels}`}
                className={`mt-4 block rounded-xl py-2.5 text-center text-xs font-bold transition-all ${
                  p.featured
                    ? 'btn-gold'
                    : 'border border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'
                }`}
              >
                Escolher
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Ranking ──────────────────────────────────────────────
export async function RankingSection() {
  const top = await getTopBlocks(10)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <section className="bg-dark-2 px-4 py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-purple">
            Ranking
          </p>
          <h2 className="font-display text-5xl tracking-wide text-white md:text-6xl">
            OS MAIORES<br />
            <span className="text-gold">BLOCOS</span>
          </h2>
        </div>

        <div className="space-y-2">
          {top.map((b, i) => {
            const initials = (b.displayName || b.instagramHandle).slice(0, 2).toUpperCase()
            return (
              <Link
                key={b.id}
                href={`/influencer/${b.instagramHandle}`}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-dark-3 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-white/10"
              >
                <span className="w-8 text-center text-xl">
                  {medals[i] ?? `#${i + 1}`}
                </span>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: b.colorHex }}
                >
                  {b.avatarUrl
                    ? <img src={b.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    @{b.instagramHandle}
                  </p>
                  <p className="text-xs text-white/30">
                    {NICHE_LABELS[b.niche as keyof typeof NICHE_LABELS] ?? b.niche}
                    {b.city ? ` · ${b.city}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gold">
                    {b.pixelCount.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] text-white/25">pixels</p>
                </div>
              </Link>
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

// ─── Footer CTA ───────────────────────────────────────────
export function FooterCTA() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-5xl tracking-wide text-white md:text-7xl">
          SUA VEZ<br />
          <span className="text-gold">DE APARECER</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/40">
          Pixels esgotando. Quando acabar, acabou. Espaço permanente a partir de R$ 10.
        </p>
        <Link href="/comprar" className="btn-gold mt-8 inline-flex px-10 py-4 text-base">
          Garantir meu espaço permanente →
        </Link>

        {/* Footer links */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 border-t border-white/5 pt-10 text-xs text-white/20">
          {['Início', 'Como funciona', 'Preços', 'Ranking', 'Para marcas', 'Meu painel', 'Termos'].map(l => (
            <a key={l} href="#" className="hover:text-white/50">{l}</a>
          ))}
        </div>
        <p className="mt-6 text-[11px] text-white/15">
          © {new Date().getFullYear()} 1 Milhão de Influencer · Todos os direitos reservados
        </p>
      </div>
    </section>
  )
}
