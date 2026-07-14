# 1 Milhão de Influencer

O mapa permanente dos influencers do Brasil. 1.000.000 de pixels, cada um um perfil.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router + Turbopack) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS |
| Banco | PostgreSQL via Neon (serverless) |
| ORM | Drizzle |
| Cache | Redis via Upstash |
| Auth | Clerk |
| Pagamento BR | Mercado Pago (Pix + cartão) |
| Pagamento Global | Stripe |
| Tempo real | Ably (WebSocket) |
| E-mail | Resend + React Email |
| Storage | Cloudflare R2 |
| Deploy | Vercel |

## Configuração local

### 1. Clone e instale

```bash
git clone https://github.com/seuusuario/1milhao.git
cd 1milhao
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas chaves
```

Serviços necessários (todos têm plano gratuito):

- **Neon** — banco Postgres: [neon.tech](https://neon.tech)
- **Clerk** — autenticação: [clerk.com](https://clerk.com)
- **Upstash** — Redis: [upstash.com](https://upstash.com)
- **Stripe** — pagamentos: [stripe.com](https://stripe.com)
- **Mercado Pago** — Pix: [mercadopago.com.br/developers](https://mercadopago.com.br/developers)
- **Ably** — WebSocket: [ably.com](https://ably.com)
- **Resend** — e-mail: [resend.com](https://resend.com)
- **Vercel Blob** — storage: conecte em Vercel dashboard → projeto → Storage

### 3. Crie as tabelas no banco

```bash
npm run db:push
```

### 4. Rode localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 5. Teste os webhooks localmente

Instale o Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Para Mercado Pago, use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
# Cole a URL pública no painel do MP como webhook
```

## Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Configure todas as variáveis de ambiente no dashboard da Vercel
em Settings → Environment Variables.

## Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx                  # Homepage (SSR + ISR)
│   ├── comprar/page.tsx          # Página de compra
│   ├── influencer/[handle]/page.tsx  # Perfil SSG
│   ├── meu-painel/page.tsx       # Dashboard do influencer
│   ├── marcas/page.tsx           # Portal de marcas
│   └── api/
│       ├── blocks/route.ts       # Lista de blocos
│       ├── payment/route.ts      # Criar pagamento
│       ├── webhook/stripe/       # Webhook Stripe
│       ├── webhook/mercadopago/  # Webhook MP
│       ├── track/route.ts        # Analytics
│       └── ably-token/route.ts   # Token WebSocket
├── components/
│   ├── grid/
│   │   ├── PixelGrid.tsx         # Canvas com WebSocket
│   │   ├── HeroSection.tsx       # Hero da homepage
│   │   └── sections.tsx          # Como funciona, preços, ranking
│   ├── popup/
│   │   └── BlockPopup.tsx        # Popup do influencer
│   └── forms/
│       └── RegisterForm.tsx      # Formulário de cadastro
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Tabelas Drizzle
│   │   ├── index.ts              # Conexão com Neon
│   │   └── blocks.ts             # Queries de blocos
│   ├── payments/index.ts         # Stripe + Mercado Pago
│   ├── realtime/index.ts         # Ably WebSocket
│   ├── email/index.tsx           # Resend + React Email
│   └── cache.ts                  # Redis + rate limiting
└── types/index.ts                # Tipos globais
```

## Comandos úteis

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run typecheck    # Verificação de tipos TypeScript
npm run db:push      # Envia schema para o banco (sem migrations)
npm run db:studio    # Interface visual do banco (Drizzle Studio)
npm run db:migrate   # Gera e aplica migrations
```

## Variáveis de ambiente obrigatórias

Veja `.env.example` para a lista completa com instruções de onde obter cada uma.

## Licença

MIT
