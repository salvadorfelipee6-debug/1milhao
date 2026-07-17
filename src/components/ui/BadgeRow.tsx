import type { Badge } from '@/types'

export function BadgeRow({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(b => (
        <span
          key={b.key}
          title={b.desc}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{ background: `${b.color}1a`, border: `0.5px solid ${b.color}55`, color: b.color }}
        >
          <span>{b.icon}</span>
          {b.label}
        </span>
      ))}
    </div>
  )
}
