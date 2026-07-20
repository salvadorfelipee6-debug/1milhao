// Conteúdo das Dicas de Crescimento — hardcoded de propósito (só 4 artigos por
// enquanto, sem CMS). Se crescer muito, migrar pra tabela no banco.

export type DicaBlock =
  | { kind: 'tip';     n: number; title: string; body: string }
  | { kind: 'callout'; type: 'atencao' | 'funciona'; text: string }

export interface DicaArticle {
  slug:      string
  category:  string
  icon:      string
  accent:    string
  readTime:  string
  title:     string
  excerpt:   string
  summary:   string[]
  blocks:    DicaBlock[]
  closing:   { text: string; ctaLabel: string; ctaHref: string }
}

export const DICAS: DicaArticle[] = [
  {
    slug:     'ferramentas-gratuitas-para-crescer',
    category: 'Ferramentas',
    icon:     '🧰',
    accent:   '#405DE6',
    readTime: '6 min',
    title:    'Ferramentas gratuitas pra editar, agendar e crescer',
    excerpt:  'Seis ferramentas que resolvem 90% do trabalho sem custar nada — e uma pegadinha comum na hora de escolher onde colocar seu link na bio.',
    summary: [
      'Edição sem pagar nada: CapCut e InShot já resolvem quase tudo.',
      'Agendar posts do Instagram/Facebook de graça, direto do computador.',
      'Pesquisar o que está bombando antes de gravar, não depois.',
    ],
    blocks: [
      { kind: 'tip', n: 1, title: 'CapCut — edição',
        body: 'Grátis, com legenda automática, templates de corte rápido e remoção de fundo. Exporte sempre vertical (1080×1920) — é o formato que Reels, TikTok e Shorts aceitam sem cortar nada.' },
      { kind: 'tip', n: 2, title: 'Meta Business Suite — agendamento',
        body: 'Agenda posts do Instagram e Facebook de graça, direto do computador. Programa a semana inteira num sábado de manhã em vez de lembrar de postar todo dia.' },
      { kind: 'tip', n: 3, title: 'Canva — artes e capas',
        body: 'Templates prontos pra capa de destaque, carrossel e thumbnail. O plano grátis já resolve praticamente tudo que um criador precisa no dia a dia.' },
      { kind: 'tip', n: 4, title: 'TubeBuddy — SEO no YouTube',
        body: 'Extensão gratuita de navegador que sugere título, tags e melhor horário de postar com base no que já funciona no seu nicho.' },
      { kind: 'tip', n: 5, title: 'Google Trends + busca do Instagram',
        body: 'Antes de gravar, pesquisa se o assunto está em alta. Conteúdo em cima de tendência tem mais chance de aparecer pra quem ainda não te segue.' },
      { kind: 'callout', type: 'atencao',
        text: 'Cuidado com "grátis" que cobra depois: a maioria das ferramentas de link na bio libera estatística, remover marca d’água e mais de um link em destaque só no plano pago — R$ 20 a R$ 50 por mês, pra sempre.' },
      { kind: 'tip', n: 6, title: 'Link na bio que não vira mensalidade',
        body: 'Se o plano é nunca mais pagar recorrência por isso, dá pra resolver com pagamento único — sem trocar de ferramenta daqui a um ano quando o preço subir de novo.' },
    ],
    closing: {
      text:     'Guarda essas seis ferramentas — mas não guarda seu link na bio numa que cobra mensalidade pra sempre.',
      ctaLabel: 'Ver a Vitrine 1M (R$ 0,99, vitalício) →',
      ctaHref:  '/vitrine',
    },
  },
  {
    slug:     'video-de-apresentacao-ugc',
    category: 'UGC',
    icon:     '🎬',
    accent:   '#833AB4',
    readTime: '7 min',
    title:    'Como gravar seu vídeo de apresentação pra virar criador UGC',
    excerpt:  'Você não precisa de seguidores nem de estúdio pra fechar com marcas — precisa de um vídeo de 30 segundos bem feito e um portfólio com variedade.',
    summary: [
      'Janela + celular já resolve 80% da qualidade que uma marca espera.',
      'O vídeo de apresentação tem uma estrutura fixa de 30 a 40 segundos.',
      'Portfólio bom tem de 3 a 5 vídeos variados — não um só.',
    ],
    blocks: [
      { kind: 'tip', n: 1, title: 'Luz',
        body: 'Fique de frente pra uma janela, nunca de costas. Luz natural entre 9h e 16h já é melhor que a maioria dos ring lights baratos vendidos por aí.' },
      { kind: 'tip', n: 2, title: 'Áudio importa mais que imagem',
        body: 'Um fone com microfone comum já resolve. A marca decide se contrata ouvindo se te entendeu bem — não pela nitidez do vídeo.' },
      { kind: 'tip', n: 3, title: 'Enquadramento',
        body: 'Vertical (9:16), celular na altura dos olhos, um respiro em cima da cabeça sem exagerar no espaço vazio.' },
      { kind: 'tip', n: 4, title: 'Roteiro de 30 a 40 segundos',
        body: '0-3s: gancho ("Se sua marca vende roupa, continua assistindo"). 3-15s: quem você é e seu nicho. 15-30s: que tipo de vídeo você faz (unboxing, review, testemunhal). 30-40s: CTA claro — "me chama, te mostro meu portfólio".' },
      { kind: 'callout', type: 'funciona',
        text: 'Grave em ambientes diferentes — casa, rua, carro. Mostra que você não depende de um cenário só, o que passa mais confiança pra marca fechar.' },
      { kind: 'tip', n: 5, title: 'Portfólio: 3 a 5 vídeos, não 1',
        body: 'Grave variações: um unboxing, um review, um testemunhal de um produto que você já usa de verdade. A marca quer ver que você entrega formatos diferentes, não decorar uma fala só.' },
      { kind: 'callout', type: 'atencao',
        text: 'Erro comum: decorar o roteiro palavra por palavra. Fica robótico. Decore os tópicos, não as frases — a naturalidade converte mais que a perfeição.' },
    ],
    closing: {
      text:     'Depois de gravar, seu portfólio precisa de um endereço fixo pra marca encontrar.',
      ctaLabel: 'Montar meu perfil de criador UGC →',
      ctaHref:  '/ugc',
    },
  },
  {
    slug:     'como-gravar-videos-melhores',
    category: 'Produção',
    icon:     '📹',
    accent:   '#E1306C',
    readTime: '6 min',
    title:    'Como gravar vídeos melhores usando só o celular',
    excerpt:  'Lente limpa e luz de frente resolvem mais que qualquer efeito de edição. Os primeiros 3 segundos decidem se alguém fica ou passa o vídeo.',
    summary: [
      'Lente limpa e luz de frente resolvem mais que qualquer app de edição.',
      'Os 3 primeiros segundos decidem se alguém continua assistindo.',
      'Legenda sempre — a maioria assiste sem som, rolando o feed no trabalho.',
    ],
    blocks: [
      { kind: 'tip', n: 1, title: 'Limpe a lente antes de gravar',
        body: 'Parece bobo, mas é o erro mais comum. Um pano de óculos no bolso resolve — a diferença de nitidez é imediata.' },
      { kind: 'tip', n: 2, title: 'Luz de frente, nunca de costas',
        body: 'Janela ou luz do ambiente na sua frente. De costas pra luz, você vira silhueta e a câmera escurece o resto da cena tentando compensar.' },
      { kind: 'tip', n: 3, title: 'Estabilização antes de gimbal',
        body: 'Apoie o celular em qualquer superfície firme antes de pensar em comprar equipamento. Um tripé de mesa custa menos que um lanche.' },
      { kind: 'tip', n: 4, title: 'Grave em 4K, edite em 1080p',
        body: 'Celulares modernos gravam em 4K — grave assim, dá mais nitidez pra cortar e dar zoom depois. Mas exporte o final em 1080p: arquivo menor, sobe mais rápido, ninguém percebe diferença no feed.' },
      { kind: 'tip', n: 5, title: 'O hook é nos primeiros 3 segundos',
        body: 'Comece pela parte mais interessante, não pela introdução. "Isso mudou minha rotina" prende muito mais que "Oi gente, hoje eu vim falar sobre...".' },
      { kind: 'tip', n: 6, title: 'Legenda sempre',
        body: 'A maioria assiste no mudo, rolando o feed no trabalho ou na fila do mercado. O CapCut gera automático em poucos segundos — sem desculpa pra pular essa etapa.' },
      { kind: 'callout', type: 'funciona',
        text: 'Grave sempre um pouco mais de conteúdo do que precisa. Sobra material pra cortar só os melhores momentos em vez de forçar um vídeo inteiro mediano.' },
      { kind: 'callout', type: 'atencao',
        text: 'Vídeo com efeito em cima de efeito cansa. Corte seco e direto costuma reter mais atenção do que transição chamativa.' },
    ],
    closing: {
      text:     'Vídeo bom sem gente pra assistir não cresce sozinho — depois de gravar, garanta que ele chegue em quem ainda não te segue.',
      ctaLabel: 'Aparecer pra quem está descobrindo agora →',
      ctaHref:  '/descobrir',
    },
  },
  {
    slug:     'como-crescer-nas-redes',
    category: 'Crescimento',
    icon:     '📈',
    accent:   '#FFD700',
    readTime: '8 min',
    title:    'Como crescer nas redes de verdade: o que funciona',
    excerpt:  'Sem fórmula mágica, sem viral garantido — só o que realmente move o ponteiro: consistência, retenção e uma última milha bem resolvida.',
    summary: [
      'Consistência bate talento: postar 3x/semana por 2 meses cresce mais que um vídeo viral isolado.',
      'O mesmo vídeo em 3 plataformas triplica o alcance pelo mesmo trabalho.',
      'Retenção importa mais que curtida — é isso que o algoritmo mede primeiro.',
    ],
    blocks: [
      { kind: 'tip', n: 1, title: 'Escolha um nicho e fique nele por 60 dias',
        body: 'O algoritmo entende do que você fala quando você fala sempre da mesma coisa. Pular de assunto em assunto reseta esse aprendizado toda vez.' },
      { kind: 'tip', n: 2, title: 'Poste o mesmo vídeo em 3 lugares',
        body: 'Reels, TikTok e YouTube Shorts aceitam o mesmo arquivo vertical. É o mesmo trabalho de gravação rendendo três vezes o alcance.' },
      { kind: 'tip', n: 3, title: 'Retenção importa mais que curtida',
        body: 'As plataformas priorizam quem assiste até o fim, não quem curte. Um vídeo mais curto e direto geralmente retém melhor que um longo com enrolação no início.' },
      { kind: 'tip', n: 4, title: 'Responda comentários na primeira hora',
        body: 'Sinaliza pro algoritmo que o post está gerando conversa — o que aumenta o alcance inicial justamente na janela que mais importa.' },
      { kind: 'callout', type: 'atencao',
        text: 'Crescer rápido demais sem nicho definido (um viral aleatório) costuma trazer seguidor que não engaja depois — pior pras métricas futuras do que crescer devagar e certo.' },
      { kind: 'tip', n: 5, title: 'CTA claro em todo vídeo',
        body: '"Segue pra não perder o próximo" funciona melhor que nada. Se você não pedir, a taxa de conversão de espectador pra seguidor despenca.' },
      { kind: 'callout', type: 'funciona',
        text: 'Dia e horário importam menos que constância. É melhor postar sempre terça e sexta às 19h do que testar sete horários diferentes por semana.' },
      { kind: 'tip', n: 6, title: 'Link na bio sempre atualizado',
        body: 'De nada adianta crescer visualização se quem clica na sua bio não acha pra onde ir. É a última milha do crescimento — a página que transforma visita em seguidor, contato ou venda.' },
    ],
    closing: {
      text:     'Toda essa consistência não serve de muito se quem clica no seu link não sabe o que fazer depois.',
      ctaLabel: 'Deixar meu link na bio pronto →',
      ctaHref:  '/vitrine',
    },
  },
]

export function getDicaBySlug(slug: string): DicaArticle | undefined {
  return DICAS.find(d => d.slug === slug)
}
