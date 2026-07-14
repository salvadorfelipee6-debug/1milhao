# 1 Milhão de Influencer

Mapa permanente dos influencers do Brasil: 1.000.000 de pixels, cada bloco é um perfil.
Comunicação com o usuário e toda a copy do site: **português brasileiro**.

## Visão do produto (o que guia toda decisão)

- Plataforma para **quem está começando E quem já é grande** aparecer mais. O pequeno compra 1 pixel, o grande compra milhares — todos ganham visibilidade real (mapa, ranking, portal de marcas, link-in-bio).
- **Qualquer quantidade a partir de 1 pixel, R$ 0,99/pixel**, pagamento único e vitalício. Nunca escrever mínimo de 100px, R$ 10, R$ 0,10 ou R$ 99 como mínimo — são valores antigos.
- **Do clique até a compra no menor atrito possível.** Cada tela, campo ou passo a mais no funil precisa se justificar. Selecionou área no mapa → já cai montando o perfil.
- Depois da compra: preenchimento do perfil fácil, e benefícios claros (link-in-bio, popup com redes, propostas de marcas, ranking).

## Postura esperada do Claude

- **Seja propositivo e ousado.** Em toda conversa sobre layout/funcionalidade, sugira ativamente ideias que possam revolucionar o site — não espere ser perguntado. Ideias de crescimento viral, gamificação, prova social, urgência, novas fontes de receita.
- Ao sugerir, priorize o que reduz atrito de compra ou aumenta o motivo para voltar ao site.
- Pode implementar melhorias reversíveis de layout/copy sem pedir permissão; mudanças de escopo grandes, confirmar antes.

### Decisões do dono sobre ideias (não repropor as rejeitadas)

- ✅ Aprovadas e implementadas (jul/2026): zoom no mapa com seleção até 1 pixel; pré-preenchimento de avatar/nome pelo @ (unavatar.io); arte para stories na página de sucesso.
- ❌ Rejeitada: preço maior em áreas "nobres" do mapa (escassez por região) — dono achou caro demais para o público.

## Prioridade atual (julho/2026)

1. **Layout e funcionalidades** — foco agora.
2. Pagamento (bugs conhecidos) e e-mails transacionais — **depois**, quando o dono pedir.

### Pendências conhecidas para a fase de pagamento (não mexer agora, não esquecer)

- MP: `payments` grava `externalId = preference.id`, mas o webhook confirma por `payment.id` → registro nunca vira `paid` (`src/lib/payments/index.ts`).
- E-mail de boas-vindas vai para `@placeholder.com` — o e-mail real do comprador não é persistido em lugar nenhum.
- Webhook do Mercado Pago sem validação do header `x-signature`.
- Condição de corrida em `findFreePosition` (duas compras simultâneas podem sobrepor blocos).

## Stack e comandos

Next.js 15 (App Router) + TypeScript + Tailwind · Neon/Drizzle · Upstash Redis · Clerk · Mercado Pago + Stripe · Ably · Resend · R2 · Vercel. Estrutura detalhada no `README.md`.

```bash
npm run dev          # dev server (Turbopack)
npm run typecheck    # tsc --noEmit — rodar antes de encerrar mudanças
npm run build
npm run db:push      # schema → banco
```

## Convenções do código

- Copy sempre pt-BR, tom direto e vendedor; visual dark com dourado (`gold`), rosa (`pink`) e cores de nicho (`NICHE_COLORS` em `src/types`).
- **Contraste**: texto sobre fundo escuro nunca abaixo de `text-white/40` (e /40 só para o mínimo decorativo, ex. copyright). Escala em uso: /55 rótulos discretos · /60–/65 texto de apoio · /70+ corpo. Não reintroduzir /15–/35.
- Arquivos de componente/página SEMPRE com extensão `.tsx` — já houve rota quebrada por `page` sem extensão em `src/app/comprar/sucesso/`.
- Preço/regra de negócio: `PIXEL_PRICE = 0.99` aparece duplicado em `src/lib/payments/index.ts`, `HeroSection.tsx` e `RegisterForm.tsx` — se mudar, mudar em todos (ou centralizar).
- Seções da home ficam em `src/components/grid/sections.tsx` (HowItWorks, Pricing, Ranking, SocialProof, FAQ, FooterCTA); `HowItWorksSection.tsx`/`PricingSection.tsx` são só re-exports.
- Blocos são sempre quadrados quando vêm do slider (`side²`); seleção livre no grid vem por query params `?pixels&x&y&w&h` para `/comprar`.
