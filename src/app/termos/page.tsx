import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — 1 Milhão de Influencer',
  description: 'Termos de uso e política de privacidade do 1 Milhão de Influencer.',
}

export default function TermosPage() {
  const sections = [
    {
      title: '1. Sobre o serviço',
      content: `O 1 Milhão de Influencer é uma plataforma digital onde influencers brasileiros podem adquirir espaço permanente em um mapa de pixels de 1.000.000 de posições. Ao comprar pixels, o influencer garante visibilidade permanente para marcas e seguidores, sem qualquer cobrança recorrente.`,
    },
    {
      title: '2. Pagamento e permanência',
      content: `O pagamento é único e vitalício. Após a confirmação do pagamento, o bloco do influencer é ativado no mapa e permanece ativo indefinidamente, sem necessidade de renovação ou pagamento adicional. Não realizamos reembolsos após a ativação do bloco, exceto em casos de erro técnico comprovado de nossa parte.`,
    },
    {
      title: '3. Conteúdo do perfil',
      content: `O influencer é inteiramente responsável pelo conteúdo inserido em seu perfil, incluindo foto, bio, links e redes sociais. É proibido inserir conteúdo ilegal, ofensivo, enganoso ou que viole direitos de terceiros. Reservamo-nos o direito de remover ou suspender perfis que violem estas diretrizes, sem reembolso.`,
    },
    {
      title: '4. Imagens e direitos autorais',
      content: `Ao fazer upload de imagens, o usuário declara ter os direitos necessários para utilizá-las. O 1 Milhão de Influencer não se responsabiliza por conteúdo enviado pelos usuários. Imagens que violem direitos autorais ou propriedade intelectual serão removidas mediante notificação formal.`,
    },
    {
      title: '5. Privacidade e dados',
      content: `Coletamos apenas os dados necessários para operar o serviço: nome, @ do Instagram, e-mail, e informações do perfil público. Não vendemos dados a terceiros. O e-mail é usado exclusivamente para envio do link de edição e comunicações sobre o serviço. Você pode solicitar a exclusão dos seus dados a qualquer momento pelo e-mail de contato.`,
    },
    {
      title: '6. Disponibilidade do serviço',
      content: `Nos esforçamos para manter o serviço disponível 24 horas por dia, 7 dias por semana. No entanto, não garantimos disponibilidade ininterrupta e nos reservamos o direito de realizar manutenções programadas. Em caso de instabilidades, o bloco do usuário é preservado e restaurado assim que o serviço voltar ao normal.`,
    },
    {
      title: '7. Modificações nos termos',
      content: `Podemos atualizar estes termos periodicamente. Alterações significativas serão comunicadas por e-mail aos usuários cadastrados. O uso continuado do serviço após notificação implica aceitação dos novos termos.`,
    },
    {
      title: '8. Limitação de responsabilidade',
      content: `O 1 Milhão de Influencer não se responsabiliza por parcerias, negócios ou acordos realizados entre influencers e marcas através da plataforma. Somos uma plataforma de visibilidade, não uma agência de marketing ou intermediador de contratos.`,
    },
    {
      title: '9. Foro e legislação',
      content: `Estes termos são regidos pela legislação brasileira. Eventuais disputas serão resolvidas no foro da comarca de domicílio do usuário, conforme o Código de Defesa do Consumidor.`,
    },
    {
      title: '10. Contato',
      content: `Para dúvidas, solicitações ou reclamações, entre em contato pelo Instagram da plataforma ou pelo e-mail de suporte. Respondemos em até 48 horas úteis.`,
    },
  ]

  return (
    <main className="min-h-screen bg-dark px-4 py-16">
      <div className="mx-auto max-w-2xl">

        {/* Voltar */}
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-white/55 hover:text-white/60 transition-colors">
          ← Voltar para o início
        </Link>

        {/* Header */}
        <div className="mb-12">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">
            Legal
          </p>
          <h1 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            TERMOS<br />
            <span className="text-gold">DE USO</span>
          </h1>
          <p className="mt-4 text-sm text-white/65">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Intro */}
        <div className="mb-10 rounded-2xl border border-gold/15 bg-gold/5 p-5">
          <p className="text-sm leading-relaxed text-white/60">
            Ao comprar pixels ou utilizar o 1 Milhão de Influencer, você concorda com estes termos.
            Leia com atenção antes de prosseguir. Em caso de dúvidas, entre em contato conosco.
          </p>
        </div>

        {/* Seções */}
        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title} className="border-t border-white/5 pt-8">
              <h2 className="mb-3 text-sm font-bold text-white">{s.title}</h2>
              <p className="text-sm leading-relaxed text-white/70">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-white/5 pt-10 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} 1 Milhão de Influencer · Todos os direitos reservados
          </p>
          <Link href="/" className="mt-4 inline-block text-xs text-gold/50 hover:text-gold transition-colors">
            Voltar para o mapa →
          </Link>
        </div>

      </div>
    </main>
  )
}