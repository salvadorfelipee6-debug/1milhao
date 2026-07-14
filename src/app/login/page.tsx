import type { Metadata } from 'next'
import { LoginClient } from './LoginClient'

export const metadata: Metadata = {
  title: 'Login anunciante — 1 Milhão de Influencer',
  description: 'Acesse o painel para editar seu bloco no mapa.',
}

export default function LoginPage() {
  return <LoginClient />
}
