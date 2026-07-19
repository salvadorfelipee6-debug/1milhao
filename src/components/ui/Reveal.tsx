'use client'

import { useEffect, useRef, useState } from 'react'

// Wrapper de scroll-reveal: filho entra com fade+slide quando aparece na tela.
// Uso: <Reveal delay={120}><Card /></Reveal> — delay em ms pra escalonar grids.
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?:    number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// Número que conta de 0 até o valor quando entra na tela.
export function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting || started.current) return
      started.current = true
      obs.disconnect()
      const t0 = performance.now()
      function frame(t: number) {
        const p = Math.min(1, (t - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(Math.round(value * eased))
        if (p < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value, duration])

  return <span ref={ref}>{display.toLocaleString('pt-BR')}</span>
}
