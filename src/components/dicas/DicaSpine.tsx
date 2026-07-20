import type { DicaBlock } from '@/lib/content/dicas'
import { Reveal } from '@/components/ui/Reveal'

// Lista numerada em espinha vertical (mesmo dispositivo visual do mapa de
// jornada que o dono gostou) — cada dica é um nó conectado por uma linha,
// com callouts de atenção (âmbar) e de "funciona bem" (verde) encaixados
// no meio da sequência.
export function DicaSpine({ blocks, accent }: { blocks: DicaBlock[]; accent: string }) {
  return (
    <div className="relative pl-8 sm:pl-9">
      <div
        className="absolute top-1.5 bottom-1.5 w-px"
        style={{ left: '11px', background: 'linear-gradient(rgba(255,255,255,0.18), rgba(255,255,255,0.06) 85%, transparent)' }}
      />
      <div className="space-y-5">
        {blocks.map((b, i) => (
          <Reveal key={i} delay={Math.min(i, 6) * 60}>
            {b.kind === 'tip' ? (
              <div className="relative">
                <div
                  className="absolute flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ left: '-32px', top: '1px', background: accent + '22', border: `1.5px solid ${accent}88`, color: accent }}
                >
                  {b.n}
                </div>
                <div className="rounded-2xl border border-white/8 bg-dark-2 p-4">
                  <p className="mb-1 text-sm font-bold text-white">{b.title}</p>
                  <p className="text-[13.5px] leading-relaxed text-white/65">{b.body}</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div
                  className="absolute flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                  style={{
                    left: '-32px', top: '1px',
                    background: b.type === 'atencao' ? 'rgba(253,186,85,0.15)' : 'rgba(52,211,153,0.15)',
                    border: `1.5px solid ${b.type === 'atencao' ? 'rgba(253,186,85,0.6)' : 'rgba(52,211,153,0.6)'}`,
                  }}
                >
                  {b.type === 'atencao' ? '⚠' : '✓'}
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: b.type === 'atencao' ? 'rgba(253,186,85,0.06)' : 'rgba(52,211,153,0.06)',
                    border: `1px solid ${b.type === 'atencao' ? 'rgba(253,186,85,0.25)' : 'rgba(52,211,153,0.25)'}`,
                  }}
                >
                  <p
                    className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: b.type === 'atencao' ? '#FDBA55' : '#34d399' }}
                  >
                    {b.type === 'atencao' ? 'Atenção' : 'Funciona bem'}
                  </p>
                  <p className="text-[13.5px] leading-relaxed text-white/75">{b.text}</p>
                </div>
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </div>
  )
}
