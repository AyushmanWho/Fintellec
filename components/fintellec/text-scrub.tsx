'use client'

import { useRef, useState, useEffect } from 'react'
import { clamp } from '@/lib/smooth-path'
import { useReducedMotion } from '@/hooks/use-motion'

interface WordProps {
  children: string
  progress: number
  range: [number, number]
  highlight?: boolean
  highlightColor?: string
  glowColor?: string
}

function ScrubWord({ children, progress, range, highlight, highlightColor = '#00A99E', glowColor = 'rgba(99, 220, 211, 0.55)' }: WordProps) {
  const [start, end] = range
  const p = clamp((progress - start) / (end - start))

  return (
    <span
      className="inline-block transition-colors duration-150 mr-[0.28em] select-none"
      style={{
        color: highlight
          ? p > 0.4
            ? highlightColor
            : 'rgba(0, 51, 101, 0.16)'
          : p > 0.4
            ? '#003365'
            : 'rgba(0, 51, 101, 0.18)',
        opacity: 0.18 + p * 0.82,
        transform: `translateY(${(1 - p) * 3}px)`,
        textShadow:
          highlight && p > 0.6
            ? `0 0 24px ${glowColor}`
            : 'none',
      }}
    >
      {children}
    </span>
  )
}

export function TextScrub() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setProgress(1)
      return
    }

    const container = containerRef.current
    if (!container) return

    let frame = 0
    let cachedTop = 0
    let cachedTotal = 0

    const updateMetrics = () => {
      if (!container) return
      cachedTop = container.offsetTop
      const windowH = window.innerHeight
      cachedTotal = Math.max(1, container.offsetHeight - windowH * 0.3)
    }
    updateMetrics()
    window.addEventListener('resize', updateMetrics, { passive: true })

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const windowH = window.innerHeight
        const currentTop = cachedTop - window.scrollY
        const current = windowH * 0.75 - currentTop
        setProgress(clamp(current / cachedTotal))
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateMetrics)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduced])

  const phrase1 = 'Most financial apps tell you where your money went.'.split(' ')
  const phrase2 = 'Fintellec gives every rupee a mission before it leaves your hands.'.split(' ')
  const phrase3 = 'Zero spreadsheets. Real-time clarity. Pure compounding momentum.'.split(' ')

  const allWords = [...phrase1, ...phrase2, ...phrase3]
  const total = allWords.length

  let currentIndex = 0

  return (
    <section
      id="philosophy"
      ref={containerRef}
      className="relative py-28 md:py-48 px-6 md:px-12 overflow-hidden scroll-mt-20"
      style={{
        background:
          'radial-gradient(70% 50% at 50% 15%, rgba(99, 220, 211, 0.28) 0%, transparent 68%), radial-gradient(55% 45% at 85% 70%, rgba(184, 242, 236, 0.35) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #F0FAF9 45%, #FFFFFF 100%)',
      }}
      aria-label="Fintellec philosophy"
    >
      {/* Background ambient Apple glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(99,220,211,0.18),transparent_65%)] blur-2xl"
      />

      <div className="relative mx-auto max-w-[1200px] text-center">
        {/* Apple style subhead kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal/30 bg-teal/5 text-teal text-xs font-mono tracking-[0.24em] uppercase mb-8">
          <span className="size-1.5 rounded-full bg-teal animate-pulse" />
          The Core Philosophy
        </div>

        {/* Apple Scrub Typography */}
        <h2 className="text-balance text-[clamp(2.4rem,5.6vw,4.8rem)] font-medium leading-[1.08] tracking-[-0.04em] text-navy">
          <div>
            {phrase1.map((word) => {
              const idx = currentIndex++
              const range: [number, number] = [idx / total, (idx + 1) / total]
              return (
                <ScrubWord key={idx} progress={progress} range={range}>
                  {word}
                </ScrubWord>
              )
            })}
          </div>

          <div className="mt-4 md:mt-6">
            {phrase2.map((word) => {
              const idx = currentIndex++
              const range: [number, number] = [idx / total, (idx + 1) / total]
              const cleanWord = word.replace(/[^a-zA-Z]/g, '')
              const isRupee = cleanWord === 'rupee'
              const isHighlight = ['Fintellec', 'mission', 'rupee'].includes(cleanWord)
              return (
                <ScrubWord
                  key={idx}
                  progress={progress}
                  range={range}
                  highlight={isHighlight}
                  highlightColor={isRupee ? '#F59E0B' : '#00A99E'}
                  glowColor={isRupee ? 'rgba(245, 158, 11, 0.55)' : 'rgba(99, 220, 211, 0.55)'}
                >
                  {word}
                </ScrubWord>
              )
            })}
          </div>

          <div className="mt-6 md:mt-8 text-[clamp(1.4rem,2.8vw,2.4rem)] font-normal text-steel tracking-[-0.02em]">
            {phrase3.map((word) => {
              const idx = currentIndex++
              const range: [number, number] = [idx / total, (idx + 1) / total]
              return (
                <ScrubWord key={idx} progress={progress} range={range}>
                  {word}
                </ScrubWord>
              )
            })}
          </div>
        </h2>



        {/* Fold Money Style Witty Microcopy Footnote */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-mint/80 bg-white/70 px-4 py-1.5 shadow-xs backdrop-blur-sm">
          <img src="/fintellec-f.png" alt="" aria-hidden="true" className="h-7 w-auto shrink-0" />
          <p className="font-mono text-[11px] text-steel">
            Tested on 14,800 real UPI transactions — including ₹10 tapri chai, ₹40 auto surcharges, and that gym subscription you swore you'd use.
          </p>
        </div>
      </div>
    </section>
  )
}
