'use client'

import { motion } from 'framer-motion'
import { Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Formas de vidro flutuantes (adaptado do kokonut/shadcn pro nosso tema
// dourado/rosa/roxo). ElegantShape é o bloco reutilizável — o hero da home
// e a /vitrine usam só ele; HeroGeometric fica como seção completa avulsa.

export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-white/[0.08]',
}: {
  className?: string
  delay?:     number
  width?:     number
  height?:    number
  rotate?:    number
  gradient?:  string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn('absolute', className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r to-transparent',
            gradient,
            'backdrop-blur-[2px] border-2 border-white/[0.15]',
            'shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]',
            'after:absolute after:inset-0 after:rounded-full',
            'after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]',
          )}
        />
      </motion.div>
    </motion.div>
  )
}

// Conjunto padrão de formas nas cores da marca — pronto pra jogar num hero
export function BrandShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <ElegantShape
        delay={0.3} width={600} height={140} rotate={12}
        gradient="from-yellow-500/[0.13]"
        className="left-[-10%] top-[12%] md:left-[-5%] md:top-[18%]"
      />
      <ElegantShape
        delay={0.5} width={500} height={120} rotate={-15}
        gradient="from-pink-500/[0.14]"
        className="right-[-5%] top-[72%] md:right-[0%] md:top-[76%]"
      />
      <ElegantShape
        delay={0.4} width={300} height={80} rotate={-8}
        gradient="from-violet-500/[0.14]"
        className="left-[3%] bottom-[6%] md:left-[8%] md:bottom-[10%]"
      />
      <ElegantShape
        delay={0.6} width={220} height={60} rotate={20}
        gradient="from-amber-500/[0.15]"
        className="right-[12%] top-[8%] md:right-[18%] md:top-[12%]"
      />
      <ElegantShape
        delay={0.7} width={150} height={40} rotate={-25}
        gradient="from-rose-500/[0.14]"
        className="left-[18%] top-[4%] md:left-[24%] md:top-[8%]"
      />
    </div>
  )
}

export function HeroGeometric({
  badge  = '1 Milhão de Influencer',
  title1 = 'Do primeiro seguidor',
  title2 = 'Ao próximo milhão',
  children,
}: {
  badge?:    string
  title1?:   string
  title2?:   string
  children?: React.ReactNode
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 1, delay: 0.5 + i * 0.2, ease: [0.25, 0.4, 0.25, 1] as const },
    }),
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-dark">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.05] via-transparent to-pink-500/[0.05] blur-3xl" />
      <BrandShapes />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            custom={0} variants={fadeUpVariants} initial="hidden" animate="visible"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 md:mb-12"
          >
            <Circle className="h-2 w-2 fill-gold/80 text-gold/80" />
            <span className="text-sm tracking-wide text-white/60">{badge}</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="mb-6 font-display text-5xl tracking-wide sm:text-7xl md:mb-8 md:text-8xl">
              <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                {title1}
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-gold to-pink-400 bg-clip-text text-transparent">
                {title2}
              </span>
            </h1>
          </motion.div>

          {children && (
            <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
              {children}
            </motion.div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/80" />
    </div>
  )
}
