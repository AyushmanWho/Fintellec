'use client'

import { useRef } from 'react'
import { useScrollProgress } from '@/hooks/use-motion'
import { cn } from '@/lib/utils'

/** A scroll-scrubbed ribbon that draws left→right as it passes through the viewport (reversible). */
export function RibbonDivider({ className, d }: { className?: string; d: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useScrollProgress(
    ref,
    (p) => {
      const k = Math.min(1, p * 1.6)
      ref.current?.style.setProperty('--draw', `${((1 - k) * 100).toFixed(2)}%`)
    },
    0.95,
  )
  return (
    <div ref={ref} aria-hidden className={cn('pointer-events-none', className)}>
      <svg
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="size-full"
        style={{ clipPath: 'inset(0 var(--draw, 100%) 0 0)' }}
        fill="none"
      >
        <path d={d} stroke="#65DED2" strokeOpacity="0.16" strokeWidth="16" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d={d} stroke="#07877F" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d={d} stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
