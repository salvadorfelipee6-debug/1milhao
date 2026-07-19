'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Linha de nomes de redes: no hover a logo salta acima da palavra (estilo
// app icon). Sem mouse (celular / idle), cicla sozinha por tempo pra página
// nunca ficar parada.

export interface SocialItem {
  name:  string
  bg:    string           // fundo do tile da logo (cor sólida ou gradiente)
  icon:  React.ReactNode  // glyph da rede (svg, herda currentColor)
  fg?:   string           // cor do glyph (padrão branco)
  href?: string
}

interface SocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  socials:      SocialItem[]
  autoCycleMs?: number   // 0 desliga o ciclo automático
}

export function SocialLinks({ socials, autoCycleMs = 2000, className, ...props }: SocialLinksProps) {
  const [hovered, setHovered]   = React.useState<string | null>(null)
  const [rotation, setRotation] = React.useState<number>(0)
  const manualRef  = React.useRef(false)
  const cycleRef   = React.useRef(0)

  // Ciclo automático: só age enquanto o mouse não está em cima
  React.useEffect(() => {
    if (!autoCycleMs || socials.length === 0) return
    const id = setInterval(() => {
      if (manualRef.current) return
      cycleRef.current = (cycleRef.current + 1) % (socials.length + 1)
      const next = socials[cycleRef.current]
      setRotation(Math.random() * 20 - 10)
      setHovered(next ? next.name : null)  // última posição: pausa sem logo
    }, autoCycleMs)
    return () => clearInterval(id)
  }, [autoCycleMs, socials])

  function enter(name: string) {
    manualRef.current = true
    setRotation(Math.random() * 20 - 10)
    setHovered(name)
  }
  function leave() {
    manualRef.current = false
    setHovered(null)
  }

  return (
    <div
      className={cn('flex flex-wrap items-center justify-center gap-0', className)}
      {...props}
    >
      {socials.map(social => {
        const Tag = social.href ? 'a' : 'div'
        return (
          <Tag
            key={social.name}
            {...(social.href
              ? { href: social.href, target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className={cn(
              'relative cursor-pointer px-4 py-2 transition-opacity duration-200 sm:px-5',
              hovered && hovered !== social.name ? 'opacity-40' : 'opacity-100',
            )}
            onMouseEnter={() => enter(social.name)}
            onMouseLeave={leave}
          >
            <span className="block text-base font-semibold text-white/85 sm:text-lg">
              {social.name}
            </span>
            <AnimatePresence>
              {hovered === social.name && (
                <motion.div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-full w-full items-center justify-center"
                  animate={{ scale: 1 }}
                >
                  <motion.div
                    key={social.name}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl"
                    style={{ background: social.bg, color: social.fg ?? '#ffffff' }}
                    initial={{ y: -40, rotate: rotation, opacity: 0, filter: 'blur(2px)' }}
                    animate={{ y: -52, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -40, opacity: 0, filter: 'blur(2px)' }}
                    transition={{ duration: 0.2 }}
                  >
                    {social.icon}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Tag>
        )
      })}
    </div>
  )
}
