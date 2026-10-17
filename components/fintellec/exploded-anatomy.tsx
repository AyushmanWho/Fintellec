'use client'

import { useRef, useState, useEffect } from 'react'
import { Cpu, Layers, ShieldCheck, Zap } from 'lucide-react'
import { clamp } from '@/lib/smooth-path'
import { useReducedMotion } from '@/hooks/use-motion'
import { cn } from '@/lib/utils'
import { sound } from '@/lib/sound'

interface LayerSpec {
  id: string
  number: string
  name: string
  tagline: string
  icon: typeof Zap
  badge: string
  description: string
  specs: { label: string; val: string }[]
  color: string
}

const LAYERS: LayerSpec[] = [
  {
    id: 'surface',
    number: '01',
    name: 'Tactical Glass Face',
    tagline: 'Sub-Second Settlement Surface',
    icon: Zap,
    badge: '0.4s LATENCY',
    description:
      'Ultra-thin frosted gorilla glass with embedded high-frequency NFC and zero-latency UPI routing directly to your primary liquid account.',
    specs: [
      { label: 'Settlement Speed', val: '< 400ms' },
      { label: 'Surface Glass', val: 'Frosted 9H' },
      { label: 'NFC Protocol', val: 'UPI Tap & Pay' },
    ],
    color: '#63DCD3',
  },
  {
    id: 'neural',
    number: '02',
    name: 'Neural Logic Core',
    tagline: 'On-Device Transaction Intelligence',
    icon: Cpu,
    badge: 'ZERO LEAKAGE',
    description:
      'Autonomous real-time expense classifier. Dissects every incoming transaction, spots phantom recurring subscriptions, and predicts lifestyle creep before it happens.',
    specs: [
      { label: 'Neural Engine', val: 'Fin-1 Core' },
      { label: 'Categorization', val: 'Instant Auto-Tag' },
      { label: 'Privacy', val: 'Zero Data Sharing' },
    ],
    color: '#00A99E',
  },
  {
    id: 'vault',
    number: '03',
    name: 'Compounding Vault',
    tagline: 'Automated Micro-Roundup Sweeps',
    icon: ShieldCheck,
    badge: '7.8% YIELD PIPELINE',
    description:
      'The foundational liquidity ledger. Every spare rupee from daily purchases is seamlessly swept into your high-yield emergency reserve.',
    specs: [
      { label: 'Auto-Roundup', val: 'Nearest ₹10 / ₹50' },
      { label: 'Safety Backing', val: '100% Insured' },
      { label: 'Compounding', val: 'Daily Accrual' },
    ],
    color: '#B8F2EC',
  },
]

export function ExplodedAnatomy() {
  const sectionRef = useRef<HTMLElement>(null)
  const [separation, setSeparation] = useState(0.85) // 0 = unified, 1 = fully exploded
  const [selectedLayer, setSelectedLayer] = useState<string>('neural')
  const [mouseRot, setMouseRot] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const section = sectionRef.current
    if (!section) return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = section.getBoundingClientRect()
        const windowH = window.innerHeight
        // Explode as user scrolls through the middle 50% of the section
        const total = rect.height - windowH * 0.4
        const current = windowH * 0.7 - rect.top
        const p = clamp(current / total)
        setSeparation(0.15 + p * 0.85)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduced])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setMouseRot({
      x: -py * 16,
      y: px * 22,
    })
  }

  const handleMouseLeave = () => {
    setMouseRot({ x: 0, y: 0 })
  }

  const activeSpec = LAYERS.find((l) => l.id === selectedLayer) || LAYERS[1]

  // Layer separation offsets
  const topZ = separation * 140
  const topY = -separation * 65
  const midZ = 0
  const botZ = -separation * 140
  const botY = separation * 65

  return (
    <section
      ref={sectionRef}
      id="anatomy"
      aria-labelledby="anatomy-title"
      className="relative overflow-hidden bg-[#001c38] text-white py-24 md:py-36 selection:bg-teal selection:text-navy"
    >
      {/* Ambient Apple Studio Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[850px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(0,169,158,0.22),rgba(99,220,211,0.06)_40%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 bottom-10 w-[500px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(0,51,101,0.4),transparent_60%)] blur-2xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-bright/40 bg-bright/10 text-bright text-xs font-mono tracking-[0.22em] uppercase mb-5 shadow-[0_0_15px_rgba(99,220,211,0.2)]">
            <Layers className="size-3.5" />
            Deconstructed Architecture
          </div>
          <h2
            id="anatomy-title"
            className="text-balance text-[clamp(2.5rem,5.5vw,5rem)] font-medium leading-[0.94] tracking-[-0.04em] text-white"
          >
            The anatomy of a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bright via-mint to-teal">
              frictionless rupee.
            </span>
          </h2>
          <p className="mt-5 text-steel/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Engineered layer by layer. Explore the hardware-grade financial architecture that powers real-time budgeting, micro-savings, and zero-leakage wealth.
          </p>
        </div>

        {/* 3D Exploded Stage + Interactive Inspector */}
        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* 3D Exploded Stage (7 cols) */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 relative h-[520px] md:h-[620px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            style={{ perspective: '1100px' }}
          >
            {/* 3D Transform Container */}
            <div
              className="relative w-[340px] md:w-[440px] h-[220px] md:h-[275px] transition-transform duration-200 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${48 + mouseRot.x}deg) rotateY(${mouseRot.y}deg) rotateZ(-34deg)`,
              }}
            >
              {/* Laser Connector Beams Linking the Layers */}
              {separation > 0.3 && (
                <div
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{ transformStyle: 'preserve-3d' }}
                  aria-hidden="true"
                >
                  <div
                    className="absolute top-4 left-4 w-[1px] bg-gradient-to-b from-bright/70 via-teal to-bright/70 shadow-[0_0_8px_#63DCD3]"
                    style={{
                      height: `${separation * 280}px`,
                      transform: `translateZ(${botZ}px)`,
                    }}
                  />
                  <div
                    className="absolute top-4 right-4 w-[1px] bg-gradient-to-b from-bright/70 via-teal to-bright/70 shadow-[0_0_8px_#63DCD3]"
                    style={{
                      height: `${separation * 280}px`,
                      transform: `translateZ(${botZ}px)`,
                    }}
                  />
                  <div
                    className="absolute bottom-4 left-4 w-[1px] bg-gradient-to-b from-bright/70 via-teal to-bright/70 shadow-[0_0_8px_#63DCD3]"
                    style={{
                      height: `${separation * 280}px`,
                      transform: `translateZ(${botZ}px)`,
                    }}
                  />
                  <div
                    className="absolute bottom-4 right-4 w-[1px] bg-gradient-to-b from-bright/70 via-teal to-bright/70 shadow-[0_0_8px_#63DCD3]"
                    style={{
                      height: `${separation * 280}px`,
                      transform: `translateZ(${botZ}px)`,
                    }}
                  />
                </div>
              )}

              {/* LAYER 1: Top Surface Glass */}
              <div
                onClick={() => setSelectedLayer('surface')}
                className={cn(
                  'absolute inset-0 rounded-[28px] p-6 flex flex-col justify-between border cursor-pointer transition-all duration-500 backdrop-blur-md',
                  selectedLayer === 'surface'
                    ? 'border-bright shadow-[0_0_40px_rgba(99,220,211,0.5)] ring-2 ring-bright/60'
                    : 'border-white/35 hover:border-bright/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
                )}
                style={{
                  transform: `translate3d(0, ${topY}px, ${topZ}px)`,
                  background:
                    'linear-gradient(135deg, rgba(239, 250, 250, 0.35) 0%, rgba(99, 220, 211, 0.18) 50%, rgba(0, 51, 101, 0.45) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-bold text-white drop-shadow">₹</span>
                    <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-bright font-semibold">
                      FINTELLEC
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/80 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                      TAP & PAY
                    </span>
                    <Zap className="size-4 text-bright" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs text-white/90 tracking-widest">4829 ···· ···· 9012</p>
                  <p className="font-mono text-[9px] text-bright/80 uppercase tracking-widest">
                    SURFACE LAYER · NFC MATRIX
                  </p>
                </div>
              </div>

              {/* LAYER 2: Neural Core (Middle) */}
              <div
                onClick={() => setSelectedLayer('neural')}
                className={cn(
                  'absolute inset-0 rounded-[28px] p-6 flex flex-col justify-between border cursor-pointer transition-all duration-500 backdrop-blur-lg',
                  selectedLayer === 'neural'
                    ? 'border-bright shadow-[0_0_45px_rgba(99,220,211,0.6)] ring-2 ring-bright/70'
                    : 'border-teal/40 hover:border-bright/70 shadow-[0_20px_50px_rgba(0,0,0,0.6)]',
                )}
                style={{
                  transform: `translate3d(0, 0, ${midZ}px)`,
                  background:
                    'linear-gradient(145deg, rgba(0, 51, 101, 0.95) 0%, rgba(0, 25, 55, 0.98) 60%, rgba(0, 169, 158, 0.25) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
                    FIN-1 NEURAL SILICON
                  </span>
                  <Cpu className="size-5 text-bright animate-pulse" />
                </div>

                {/* Circuit Grid Art */}
                <div className="relative my-auto flex items-center justify-center">
                  <div className="size-16 rounded-xl border border-teal/50 bg-teal/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,169,158,0.35)]">
                    <span className="font-mono text-[9px] font-bold text-bright tracking-wider text-center">
                      CORE<br />LOGIC
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-steel">
                  <span>REAL-TIME CLASSIFIER</span>
                  <span className="text-bright font-semibold">0% LEAKAGE</span>
                </div>
              </div>

              {/* LAYER 3: Compounding Vault (Base) */}
              <div
                onClick={() => setSelectedLayer('vault')}
                className={cn(
                  'absolute inset-0 rounded-[28px] p-6 flex flex-col justify-between border cursor-pointer transition-all duration-500 backdrop-blur-lg',
                  selectedLayer === 'vault'
                    ? 'border-bright shadow-[0_0_40px_rgba(99,220,211,0.5)] ring-2 ring-bright/60'
                    : 'border-white/25 hover:border-bright/70 shadow-[0_25px_60px_rgba(0,0,0,0.7)]',
                )}
                style={{
                  transform: `translate3d(0, ${botY}px, ${botZ}px)`,
                  background:
                    'linear-gradient(145deg, rgba(7, 83, 111, 0.85) 0%, rgba(0, 30, 60, 0.98) 70%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mint">
                    PRIMARY LIQUIDITY VAULT
                  </span>
                  <ShieldCheck className="size-4 text-mint" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-steel">RESERVE ACCRUAL</span>
                    <span className="text-mint font-semibold">+₹12,480 / MO</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-navy border border-teal/30 overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-bright to-teal rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[9px] text-steel">
                  <span>100% INSURED LEDGER</span>
                  <span className="text-bright">ROUND-UP AUTO SWEEP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Layer Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Layer Selection Tabs */}
            <div className="flex rounded-2xl bg-white/5 p-1.5 border border-white/10 backdrop-blur-md">
              {LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => {
                    setSelectedLayer(layer.id)
                    sound.chime()
                  }}
                  className={cn(
                    'flex-1 rounded-xl py-2 px-3 text-xs font-mono font-medium transition-all text-center',
                    selectedLayer === layer.id
                      ? 'bg-bright text-navy shadow-lg font-bold'
                      : 'text-steel hover:text-white',
                  )}
                >
                  {layer.number} {layer.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Active Layer Details Card */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div
                className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full blur-3xl pointer-events-none"
                style={{ background: activeSpec.color, opacity: 0.2 }}
                aria-hidden="true"
              />

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-bright font-bold tracking-[0.2em]">
                  LAYER {activeSpec.number}
                </span>
                <span className="rounded-full border border-teal/40 bg-teal/15 px-3 py-1 font-mono text-[10px] text-bright font-semibold">
                  {activeSpec.badge}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-medium tracking-tight text-white">
                {activeSpec.name}
              </h3>
              <p className="font-mono text-xs text-bright/80 mt-1">{activeSpec.tagline}</p>

              <p className="mt-4 text-sm leading-relaxed text-steel/90">
                {activeSpec.description}
              </p>

              {/* Technical Specs Grid */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                {activeSpec.specs.map((s) => (
                  <div key={s.label}>
                    <dt className="text-[10px] font-mono uppercase tracking-wider text-steel">{s.label}</dt>
                    <dd className="mt-1 font-mono text-xs font-semibold text-white">{s.val}</dd>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Explode Scrubber Slider */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-steel uppercase tracking-wider">3D Explosion Level</span>
                <span className="text-bright font-semibold">{Math.round(separation * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={separation}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setSeparation(val)
                  sound.tick(1200 + val * 1200)
                }}
                className="fin-range mt-3 w-full"
                aria-label="3D card layer separation slider"
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] text-steel">
                <button
                  type="button"
                  onClick={() => {
                    setSeparation(0)
                    sound.snap('low')
                  }}
                  className="hover:text-bright transition-colors"
                >
                  Unified Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSeparation(1)
                    sound.snap('high')
                  }}
                  className="hover:text-bright transition-colors"
                >
                  Fully Exploded
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
