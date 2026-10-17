'use client'

import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useScrollProgress } from '@/hooks/use-motion'
import { smoothPath, type Vec } from '@/lib/smooth-path'

const CX = 600
const CY = 300
const R = 200
const CLOSING_PATH = (() => {
  const lead: Vec[] = [
    [-40, 470],
    [180, 540],
    [330, 470],
  ]
  const wrap: Vec[] = Array.from({ length: 11 }, (_, k) => {
    const a = Math.PI * 0.82 + k * ((Math.PI * 2 * 1.02) / 10)
    return [CX + Math.cos(a) * R * 1.12, CY + Math.sin(a) * R * 1.12]
  })
  const tail: Vec[] = [
    [900, 470],
    [1060, 420],
    [1240, 450],
  ]
  return smoothPath([...lead, ...wrap, ...tail])
})()

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const paths = useRef<(SVGPathElement | null)[]>([])
  const circle = useRef<SVGGElement>(null)

  useScrollProgress(
    ref,
    (p) => {
      const k = Math.min(1, p * 1.5)
      for (const el of paths.current) el?.style.setProperty('stroke-dashoffset', String(1 - k))
      if (circle.current) {
        circle.current.style.opacity = String(Math.min(1, k * 1.4))
        circle.current.style.transform = `scale(${0.9 + 0.1 * k})`
      }
    },
    0.9,
  )

  return (
    <section
      ref={ref}
      aria-labelledby="cta-title"
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(90% 70% at 50% 0%, rgba(255, 255, 255, 0.6) 0%, transparent 70%), radial-gradient(60% 50% at 80% 80%, rgba(99, 220, 211, 0.25) 0%, transparent 70%), linear-gradient(180deg, #E4F7F3 0%, #C4ECE5 50%, #AEE6DC 100%)',
      }}
    >
      <svg
        aria-hidden
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 size-full"
        fill="none"
      >
        <g ref={circle} style={{ transformOrigin: `${CX}px ${CY}px`, opacity: 0 }}>
          <circle cx={CX} cy={CY} r={R} fill="rgba(255,255,255,0.4)" stroke="#fff" strokeOpacity="0.9" />
          <circle cx={CX} cy={CY} r={R - 26} stroke="#07877F" strokeOpacity="0.12" strokeDasharray="1 6" />
        </g>
        {[
          { s: '#65DED2', o: 0.18, w: 18 },
          { s: '#07877F', o: 1, w: 2.4 },
          { s: '#fff', o: 0.8, w: 0.9 },
        ].map((l, i) => (
          <path
            key={l.w}
            ref={(el) => { paths.current[i] = el }}
            d={CLOSING_PATH}
            pathLength={1}
            strokeDasharray="1 1"
            stroke={l.s}
            strokeOpacity={l.o}
            strokeWidth={l.w}
            strokeLinecap="round"
            style={{ strokeDashoffset: 1 }}
          />
        ))}
      </svg>

      <div className="relative mx-auto flex min-h-[86svh] max-w-[1400px] flex-col items-center justify-center px-6 py-32 text-center md:px-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-teal">Begin</p>
        <h2
          id="cta-title"
          className="mt-6 max-w-4xl text-balance text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.05em] text-navy"
        >
          Your money story <span className="text-teal">starts here.</span>
        </h2>
        <p className="mt-7 max-w-md text-pretty text-base leading-relaxed text-steel md:text-lg">
          Get a clearer picture. Make more intentional choices. Build better habits.
        </p>
        <a
          href="#how-it-works"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-medium text-white shadow-[0_24px_50px_-20px_rgba(6,53,104,0.7)] transition-colors hover:bg-teal"
        >
          Explore Fintellec
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </a>
      </div>
    </section>
  )
}
