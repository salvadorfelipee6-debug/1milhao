export function GridSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filtros skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-7 animate-pulse rounded-full bg-white/5"
            style={{ width: `${60 + i * 12}px` }}
          />
        ))}
      </div>

      {/* Canvas skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-dark-2">
        <div className="aspect-square w-full animate-pulse bg-dark-3">
          {/* Simula blocos */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-2 opacity-20">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  background: ['#E1306C','#833AB4','#405DE6','#F77737'][i % 4],
                  opacity: Math.random() > 0.4 ? 0.6 : 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legenda skeleton */}
      <div className="flex">
        <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
        <div className="ml-auto h-4 w-40 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  )
}
