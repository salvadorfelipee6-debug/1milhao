import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SuccessClient } from './SuccessClient'

export const metadata: Metadata = {
  title: 'Espaço garantido! 🎉',
  description: 'Seu bloco está no mapa do 1 Milhão de Influencer.',
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <SuccessClient />
    </Suspense>
  )
}