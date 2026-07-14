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
- **Git: commit e push para `main` automáticos, sem perguntar** (pedido do dono em jul/2026) — a Vercel builda a partir da `main`. Não se aplica a ações destrutivas (force-push, reset --hard etc.), só ao fluxo normal de commit+push.

### Decisões do dono sobre ideias (não repropor as rejeitadas)

- ✅ Aprovadas e implementadas (jul/2026): zoom no mapa com seleção até 1 pixel; pré-preenchimento de avatar/nome pelo @ (unavatar.io); arte para stories na página de sucesso.
- ❌ Rejeitada: preço maior em áreas "nobres" do mapa (escassez por região) — dono achou caro demais para o público.

## Prioridade atual (julho/2026)

1. **Layout e funcionalidades** — foco agora.
2. Pagamento (bugs conhecidos) e e-mails transacionais — **depois**, quando o dono pedir.

### Pendências conhecidas — fase de pagamento/e-mails (não mexer sem o dono pedir, não esquecer)

- **MP externalId**: `payments` grava `externalId = preference.id`, mas o webhook confirma por `payment.id` → registro nunca vira `paid` (`src/lib/payments/index.ts`). Bagunça relatório de receita.
- **E-mail do comprador não é salvo**: welcome email vai para `@placeholder.com` — o comprador pode nunca receber o `editToken` (perde acesso de edição). Persistir o e-mail (em `payments` ou `blocks`) e usar o real.
- Webhook do Mercado Pago sem validação do header `x-signature`.
- Condição de corrida em `findFreePosition` (caminho automático, sem posição do grid); o caminho com posição do grid já valida via `isAreaOccupied`.

### Pendências de funcionalidade (podem ser feitas a qualquer momento)

- **Upload de foto usa Vercel Blob** (trocado de Cloudflare R2 em jul/2026): `/api/upload` (`src/app/api/upload/route.ts` + `src/lib/storage/index.ts`, pacote `@vercel/blob`). Store conectada e testada ponta a ponta em jul/2026 — **a store precisa ser criada como "Public" desde o início**; o modo de acesso não pode ser trocado depois (só apagar e recriar).
- Busca por cidade usa `like` (case-sensitive no Postgres) — trocar por `ilike` (`src/lib/db/blocks.ts`).
- `brands` tem `passwordHash` próprio enquanto o site usa Clerk — dois sistemas de auth para manter.
- Zero testes no projeto.
- Zoom do mapa no mobile: os botões funcionam, mas o pan (arrastar o mapa com zoom) conflita com a seleção por toque — melhorar gesto (ex.: dois dedos para pan/pinch).
- `LiveVisitors` e alguns números de prova social são simulados — decisão de produto a revisitar quando houver tráfego real.

## Stack e comandos

Next.js 15 (App Router) + TypeScript + Tailwind · Neon/Drizzle · Upstash Redis · Clerk · Mercado Pago + Stripe · Ably · Resend · Vercel Blob (storage) · Vercel. Estrutura detalhada no `README.md`.

**Produção**: https://1milhao-sigma.vercel.app (projeto Vercel `felipeff-s-projects/1milhao`, deploy automático a partir da `main`).

⚠️ **jul/2026**: todas as Environment Variables de Production/Preview estavam cadastradas só de nome, com valor **vazio**, desde a criação do projeto (44 dias) — o site em produção não tinha banco, Clerk, Redis nem `NEXT_PUBLIC_APP_URL` funcionando. Corrigido: DATABASE_URL, Clerk, Upstash e `NEXT_PUBLIC_APP_URL` (+ variáveis inertes tipo `NEXT_PUBLIC_PIXEL_PRICE`) agora têm valor real; R2 antigo foi removido. Stripe/Mercado Pago/Ably/Resend continuam vazios em produção (sem credenciais reais ainda — combinado com pendências abaixo).
Se mexer em env vars pela Vercel CLI: **`vercel env pull` grava os valores entre aspas literais no `.env.local`** — um script de shell (`grep`/`cut`) que reler esse arquivo pega a aspa junto e quebra o valor ao reenviar (`sed -e 's/^"//' -e 's/"$//'` resolve). E **`vercel redeploy` reaproveita o snapshot de env vars do deploy antigo** — pra aplicar uma env var nova em produção, precisa de `vercel deploy --prod` (ou um commit novo), não `redeploy`.

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
