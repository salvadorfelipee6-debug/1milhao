import type { Metadata } from 'next'
import { getGridStats } from '@/lib/db/blocks'
import { RegisterForm } from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: 'Garantir meu espaço',
  description: 'Compre pixels no 1 Milhão de Influencer. Pagamento único e vitalício a partir de R$ 10.',
}

export default async function ComprarPage() {
  const stats = await getGridStats()

  return (
    <main className="min-h-screen bg-dark px-4 py-16">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="badge-gold mb-4 inline-flex">
            <span className="animate-pulse-dot mr-2 h-1.5 w-1.5 rounded-full bg-gold" />
            {stats.available.toLocaleString('pt-BR')} pixels disponíveis
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white md:text-7xl">
            GARANTA<br />
            <span className="text-gold">SEU ESPAÇO</span>
          </h1>
          <p className="mt-4 text-sm text-white/40">
            Pagamento único · Vitalício · Seu bloco fica no mapa para sempre
          </p>
        </div>

        {/* Formulário completo de cadastro e pagamento */}
        <RegisterForm stats={stats} />

      </div>
    </main>
  )
}
