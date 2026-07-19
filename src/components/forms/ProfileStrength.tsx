'use client'

// Medidor "Força do perfil" — pontua ao vivo o que já foi preenchido e mostra
// o que falta pra ganhar mais seguidores. Usado no painel e no cadastro.

interface Fields {
  avatarUrl?:   string
  bio?:         string
  city?:        string
  followers?:   string
  whatsappUrl?: string
  videoUrl?:    string
  youtubeUrl?:  string
  tiktokUrl?:   string
  twitterUrl?:  string
  facebookUrl?: string
  kwaiUrl?:     string
  onlyfansUrl?: string
  spotifyUrl?:  string
}

const EXTRA_SOCIALS: (keyof Fields)[] = [
  'youtubeUrl', 'tiktokUrl', 'twitterUrl', 'facebookUrl', 'kwaiUrl', 'onlyfansUrl', 'spotifyUrl',
]

export function ProfileStrength({
  fields,
  customLinksCount = 0,
}: {
  fields:            Fields
  customLinksCount?: number
}) {
  const checks = [
    { done: !!fields.avatarUrl?.trim(),                       pts: 20, label: 'Foto de perfil',       tip: 'Blocos com foto chamam o olho no mapa e na roleta' },
    { done: !!fields.bio?.trim(),                             pts: 15, label: 'Bio',                  tip: 'Quem lê uma bio boa clica em Seguir' },
    { done: EXTRA_SOCIALS.some(k => !!fields[k]?.trim()),     pts: 20, label: 'Outra rede social',    tip: 'YouTube, TikTok, X… mais portas de entrada' },
    { done: !!fields.whatsappUrl?.trim(),                     pts: 15, label: 'WhatsApp de propostas', tip: 'Sem ele, marcas não têm como te chamar' },
    { done: !!fields.city?.trim(),                            pts: 10, label: 'Cidade',               tip: 'Você entra nas buscas por região' },
    { done: !!fields.followers?.trim(),                       pts: 10, label: 'Seguidores',           tip: 'Prova social no seu card' },
    { done: customLinksCount > 0,                             pts: 10, label: 'Link personalizado',   tip: 'Loja, curso, portfólio… sua Vitrine completa' },
  ]

  const score   = checks.reduce((s, c) => s + (c.done ? c.pts : 0), 0)
  const missing = checks.filter(c => !c.done).sort((a, b) => b.pts - a.pts)

  const level =
    score >= 100 ? { label: 'Imbatível 🏆',    color: '#22c55e' }
    : score >= 70 ? { label: 'Quase lá 🔥',     color: '#FFD700' }
    : score >= 40 ? { label: 'No caminho 💪',   color: '#FFA500' }
    :               { label: 'Começando 🌱',    color: '#E1306C' }

  return (
    <div className="rounded-2xl border border-white/8 bg-dark-2 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
        <p className="text-xs font-bold text-white whitespace-nowrap">⚡ Força do perfil</p>
        <p className="text-xs font-bold whitespace-nowrap" style={{ color: level.color }}>
          {score}% · {level.label}
        </p>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(score, 5)}%`,
            background: `linear-gradient(90deg, ${level.color}, ${level.color}cc)`,
            boxShadow: `0 0 12px ${level.color}66`,
          }}
        />
      </div>

      {missing.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-white/55">
            Pra ficar mais forte
          </p>
          {missing.slice(0, 3).map(m => (
            <div key={m.label} className="flex items-baseline gap-2 text-[11px]">
              <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 font-bold text-gold">
                +{m.pts}
              </span>
              <span className="font-semibold text-white/80">{m.label}</span>
              <span className="hidden text-white/55 sm:inline">— {m.tip}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-white/70">
          Perfil completo! Quem cair no seu card da roleta vê tudo — é assim que visita vira seguidor.
        </p>
      )}
    </div>
  )
}
