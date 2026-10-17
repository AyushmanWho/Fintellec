'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { sound } from '@/lib/sound'
import { Disc, ChevronUp, ChevronDown } from 'lucide-react'

const CHAPTERS = [
  { id: 'top', label: '01 · The Fluid Coin' },
  { id: 'philosophy', label: '02 · Core Philosophy' },
  { id: 'simulator', label: '03 · FDIN Decision Engine' },
  { id: 'money-insights', label: '04 · The Bigger Picture' },
  { id: 'how-it-works', label: '05 · Trajectory & Flow' },
  { id: 'anatomy', label: '06 · Exploded Anatomy' },
  { id: 'savings', label: '07 · Dynamic Vaults' },
  { id: 'time-machine', label: '08 · 10Y Compounding' },
]

export function DigitalCrown() {
  const [scrollPct, setScrollPct] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [activeChapter, setActiveChapter] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const lastTickScroll = useRef(0)
  const dragStartY = useRef(0)
  const dragStartScroll = useRef(0)

  const handleScroll = useCallback(() => {
    const docH = document.documentElement.scrollHeight - window.innerHeight
    if (docH <= 0) return
    const current = window.scrollY
    const pct = Math.min(1, Math.max(0, current / docH))
    setScrollPct(pct)
    setRotation((pct * 1440) % 360)

    // Haptic tick every 35px scrolled
    if (Math.abs(current - lastTickScroll.current) > 36) {
      sound.crownTick(2000 + Math.sin(pct * Math.PI) * 600)
      lastTickScroll.current = current
    }

    // Determine active chapter based on section positions
    CHAPTERS.forEach((ch, idx) => {
      const el = document.getElementById(ch.id)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.2) {
          setActiveChapter(idx)
        }
      }
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Drag interaction on the crown
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    dragStartY.current = e.clientY
    dragStartScroll.current = window.scrollY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaY = e.clientY - dragStartY.current
    const docH = document.documentElement.scrollHeight - window.innerHeight
    // Map drag sensitivity to scroll
    const targetScroll = dragStartScroll.current + deltaY * 3.5
    window.scrollTo({
      top: Math.max(0, Math.min(docH, targetScroll)),
      behavior: 'auto',
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // Ignore
    }
  }

  const scrollToChapter = (id: string, idx: number) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveChapter(idx)
      sound.snap('high')
    }
  }

  return (
    <aside
      aria-label="Tactile Digital Crown Scrubber"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center select-none"
    >
      {/* Chapter Tooltip Preview on Hover */}
      <div
        className={`pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap transition-all duration-300 ${
          isHovered || isDragging ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <div className="rounded-xl border border-mint/90 bg-white/95 px-3 py-2 shadow-[0_12px_30px_-10px_rgba(0,51,101,0.25)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-teal animate-pulse" />
            <span className="font-mono text-[11px] font-semibold text-navy">
              {CHAPTERS[activeChapter].label}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-steel">
            <span>Progress: {Math.round(scrollPct * 100)}%</span>
            <span className="text-teal font-medium">Scrub Crown ↕</span>
          </div>
        </div>
      </div>

      {/* Up Step Button */}
      <button
        type="button"
        aria-label="Scroll to previous chapter"
        onClick={() => {
          const next = Math.max(0, activeChapter - 1)
          scrollToChapter(CHAPTERS[next].id, next)
        }}
        className="size-6 flex items-center justify-center rounded-full bg-white/70 border border-mint/80 text-steel hover:text-navy hover:bg-white shadow-xs backdrop-blur-sm transition-colors mb-1.5"
      >
        <ChevronUp className="size-3.5" />
      </button>

      {/* Titanium Knurled Digital Crown Rotary Dial */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title="Drag up or down to scrub page"
        className={`relative h-28 w-7 cursor-ns-resize rounded-full border border-white/80 p-0.5 shadow-[0_12px_32px_-8px_rgba(0,51,101,0.3)] backdrop-blur-md transition-transform duration-200 ${
          isDragging ? 'scale-105 ring-2 ring-teal/50' : 'hover:scale-102'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,250,250,0.7) 100%)',
        }}
      >
        {/* Knurled Ridges Tube (Rotates on scroll) */}
        <div className="relative size-full overflow-hidden rounded-full border border-steel/20 bg-gradient-to-r from-steel/20 via-white/80 to-steel/25">
          <div
            className="absolute inset-y-0 -inset-x-4 will-change-transform"
            style={{
              transform: `translateY(${(-rotation * 0.4) % 18}px)`,
              backgroundImage:
                'repeating-linear-gradient(180deg, rgba(0,51,101,0.18) 0px, rgba(0,51,101,0.18) 2px, transparent 2px, transparent 6px)',
            }}
          />

          {/* Center Red/Mint Apple-Watch style crown indicator line */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-teal via-bright to-teal shadow-[0_0_8px_#63DCD3]" />

          {/* Crown light sheen reflection */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-black/15" />
        </div>
      </div>

      {/* Down Step Button */}
      <button
        type="button"
        aria-label="Scroll to next chapter"
        onClick={() => {
          const next = Math.min(CHAPTERS.length - 1, activeChapter + 1)
          scrollToChapter(CHAPTERS[next].id, next)
        }}
        className="size-6 flex items-center justify-center rounded-full bg-white/70 border border-mint/80 text-steel hover:text-navy hover:bg-white shadow-xs backdrop-blur-sm transition-colors mt-1.5"
      >
        <ChevronDown className="size-3.5" />
      </button>

      {/* Discrete Chapter Waypoint Dots */}
      <div className="mt-2 flex flex-col items-center gap-1.5 py-1">
        {CHAPTERS.map((ch, idx) => {
          const isActive = activeChapter === idx
          return (
            <button
              key={ch.id}
              type="button"
              aria-label={`Jump to ${ch.label}`}
              onClick={() => scrollToChapter(ch.id, idx)}
              className={`rounded-full transition-all duration-300 ${
                isActive
                  ? 'h-3.5 w-1.5 bg-teal shadow-[0_0_8px_#00A99E]'
                  : 'size-1.5 bg-steel/30 hover:bg-steel/60 hover:scale-125'
              }`}
            />
          )
        })}
      </div>
    </aside>
  )
}
