'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Moon, ShieldAlert, BedDouble, Droplets } from 'lucide-react'
import { clamp, smoothPath, getSplinePoint, type Vec } from '@/lib/smooth-path'
import { inr, inrCompact } from '@/lib/format'
import { useReducedMotion } from '@/hooks/use-motion'
import { cn } from '@/lib/utils'
import { sound } from '@/lib/sound'
import { useCircadian } from '../circadian-context'
import { GlassCoin } from './glass-coin'
import { Wallet } from './wallet'
import { buildScenes, sceneAt, GOAL, GRAPH_MAX, GRAPH_MONTHS, GRAPH_VALUES, KEYS, type SceneSet } from './scene'

// Hermite cubic smoothstep for buttery, organic S-curve transitions
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min))
  return x * x * (3 - 2 * x)
}

const FEATURES = [
  {
    id: 'track',
    number: '01',
    eyebrow: 'TRACK',
    title: 'Know where it goes.',
    caption: 'Every rupee accounted for. Even that 2 AM biryani you promised you would never order again.',
    tag: 'No judgment. Just math.',
    kickerColor: '#63dcd3',
    tagColor: 'text-mint/90 bg-teal/20 border-teal/40',
    glowColor: 'rgba(99, 220, 211, 0.45)',
  },
  {
    id: 'plan',
    number: '02',
    eyebrow: 'PLAN',
    title: 'Give goals a place.',
    caption: 'Because "saving next month" has been active on your WhatsApp group since 2021.',
    tag: 'Goa Trip 2026? Finally.',
    kickerColor: '#fb923c',
    tagColor: 'text-amber-200 bg-amber-500/20 border-amber-400/40',
    glowColor: 'rgba(251, 146, 60, 0.35)',
  },
  {
    id: 'insights',
    number: '03',
    eyebrow: 'INSIGHTS',
    title: 'See the bigger picture.',
    caption: 'Discover why 14 forgotten OTT trials are acting like silent, rent-free roommates.',
    tag: 'Gym: Paid. Visited: 0.',
    kickerColor: '#a78bfa',
    tagColor: 'text-purple-200 bg-purple-500/20 border-purple-400/40',
    glowColor: 'rgba(167, 139, 250, 0.35)',
  },
] as const

function InteractiveWalletTile({
  feature,
  tileRef,
}: {
  feature: (typeof FEATURES)[number]
  tileRef: (node: HTMLDivElement | null) => void
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, spotX: 50, spotY: 50, active: false })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    const rotX = (0.5 - py) * 22
    const rotY = (px - 0.5) * 22

    setTilt({
      x: rotX,
      y: rotY,
      spotX: Math.round(px * 100),
      spotY: Math.round(py * 100),
      active: true,
    })
  }

  const handleMouseLeave = () => {
    setTilt((prev) => ({ ...prev, x: 0, y: 0, active: false }))
  }

  return (
    <article
      ref={tileRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`fintellec-wallet-reveal__tile fintellec-wallet-reveal__tile--${feature.id} group cursor-pointer pointer-events-auto select-none will-change-transform`}
    >
      {/* Dynamic Cursor Spotlight Sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[22px] transition-opacity duration-300 z-10"
        style={{
          opacity: tilt.active ? 1 : 0,
          background: `radial-gradient(circle 140px at ${tilt.spotX}% ${tilt.spotY}%, ${feature.glowColor}, rgba(99, 220, 211, 0.12) 42%, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* 3D Tilted Inner Content */}
      <div
        className="w-full flex-1 flex flex-col items-start gap-[8px] will-change-transform"
        style={{
          transform: tilt.active
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(12px)`
            : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: tilt.active
            ? 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="w-full flex items-center justify-between">
          <span className="fintellec-wallet-reveal__tile-kicker" style={{ color: feature.kickerColor }}>
            {feature.number} / {feature.eyebrow}
          </span>
          <span className={cn('text-[9px] font-mono tracking-wide px-2 py-0.5 rounded-full border', feature.tagColor)}>
            {feature.tag}
          </span>
        </div>
        <div className={`fintellec-wallet-reveal__tile-art fintellec-wallet-reveal__tile-art--${feature.id}`} aria-hidden="true">
          {feature.id === 'track' && <><i /><i /><i /><i /><i /></>}
          {feature.id === 'plan' && <><span>₹</span><b>GOAL</b></>}
          {feature.id === 'insights' && <><i /><i /><i /><i /><i /><i /></>}
        </div>
        <h2>{feature.title}</h2>
        <p>{feature.caption}</p>
      </div>
    </article>
  )
}

const PARTICLES = 18
const DOT_INDICES = Array.from({ length: 14 }, (_, i) => i)
const DATA_INDICES = Array.from({ length: 12 }, (_, i) => i + 1)
const STEPS = ['Coin', 'Flow', 'Graph', 'Wallet', 'Goal']

const CAPTIONS = [
  { n: '01', t: 'The flow', h: 'Money is never still.', p: 'Every payment, transfer and top-up is part of one continuous stream.' },
  { n: '02', t: 'The graph', h: 'The stream becomes a pattern.', p: 'Twelve months of saving, drawn from the very same line.' },
  { n: '03', t: 'The wallet', h: 'Patterns flow into places.', p: 'Balances, cards and goals — separated into clear, calm layers.' },
  { n: '04', t: 'The destination', h: 'Every rupee arrives somewhere.', p: 'The flow settles around what you are saving for.' },
]

const HERO_START = 0.285
const HERO_SPAN = 1 - HERO_START

export function Hero() {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState<SceneSet | null>(null)
  const [alive] = useState(true)
  const { isNight } = useCircadian()
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const ripplesRef = useRef<{ x: number; y: number; time: number }[]>([])

  // Wallet Chapter Refs
  const walletWorldRef = useRef<HTMLDivElement>(null)
  const walletCopyRef = useRef<HTMLDivElement>(null)
  const walletCoinRef = useRef<HTMLDivElement>(null)
  const walletBodyRef = useRef<HTMLDivElement>(null)
  const walletLidRef = useRef<HTMLDivElement>(null)
  const magneticFieldRef = useRef<HTMLDivElement>(null)
  const coinShadowRef = useRef<HTMLDivElement>(null)
  const coinPulseRef = useRef(0)
  const meterRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])

  // 3D Coin Ring Cascade Refs (Pinterest-Inspired Masterpiece)
  const coinRingStageRef = useRef<HTMLDivElement>(null)
  const coinRingRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleWalletCoinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    coinPulseRef.current = performance.now()
    sound.snap('high')
  }

  // Chapter 1.5: Thread Convergence Refs
  const threadsSvgRef = useRef<SVGSVGElement>(null)
  const threadPaths = useRef<(SVGPathElement | null)[]>([])
  const threadCores = useRef<(SVGPathElement | null)[]>([])
  const threadPulses = useRef<(SVGPathElement | null)[]>([])
  const fusionSparkRef = useRef<SVGGElement>(null)

  // Hero Chapter Refs
  const heroSvgBackRef = useRef<SVGSVGElement>(null)
  const heroSvgFrontRef = useRef<SVGSVGElement>(null)
  const ribbon = useRef<(SVGPathElement | null)[]>([])
  const highlights = useRef<(SVGPathElement | null)[]>([])
  const drawPath = useRef<SVGPathElement>(null)
  const area = useRef<SVGPathElement>(null)
  const mask = useRef<SVGPathElement>(null)
  const grid = useRef<SVGGElement>(null)
  const dots = useRef<(SVGGElement | null)[]>([])
  const values = useRef<(SVGTextElement | null)[]>([])
  const months = useRef<(SVGTextElement | null)[]>([])
  const particles = useRef<(SVGCircleElement | null)[]>([])
  const ringGroup = useRef<SVGGElement>(null)
  const ringTrack = useRef<SVGCircleElement>(null)
  const ringProg = useRef<SVGCircleElement>(null)
  const ringText = useRef<SVGGElement>(null)
  const ringPct = useRef<SVGTextElement>(null)
  const ringSub = useRef<SVGTextElement>(null)
  const ringName = useRef<SVGTextElement>(null)
  const coin = useRef<HTMLDivElement>(null)
  const wallet = useRef<HTMLDivElement>(null)
  const headline = useRef<HTMLDivElement>(null)
  const headlineElements = useRef<{
    primary: HTMLElement | null
    secondary: HTMLElement | null
    eyebrow: HTMLElement | null
    body: HTMLElement | null
  }>({ primary: null, secondary: null, eyebrow: null, body: null })
  const cinematicVeil = useRef<HTMLDivElement>(null)
  const captions = useRef<(HTMLDivElement | null)[]>([])
  const progressBar = useRef<HTMLSpanElement>(null)
  const steps = useRef<(HTMLLIElement | null)[]>([])
  const progressFooterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScene(buildScenes(el.clientWidth, el.clientHeight)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!scene) return
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    const { w, h, box } = scene
    let lastPct = ''
    let lastSplit = -1
    let lastReveal = -1
    let lastGraphVisible = true
    let lastHeadlineVisible = true

    const render = (progress: number, t: number) => {
      // ----------------------------------------------------
      // CHAPTER 1: WALLET REVEAL (0.00 to 0.28 of total progress)
      // ----------------------------------------------------
      const wP = clamp(progress / 0.26)
      const handoff = smoothstep(0.24, 0.295, progress)
      const isWalletActive = progress < 0.30

      if (walletWorldRef.current) {
        walletWorldRef.current.style.display = isWalletActive ? 'block' : 'none'
        walletWorldRef.current.style.opacity = String(1 - handoff)
      }

      if (isWalletActive) {
        // 1. Rupee Coin in 3D: Levitates with cursor tilt at rest, rotates continuously, tilts naturally, then drops into wallet
        const mx = pointerRef.current?.x ?? (w * 0.5)
        const my = pointerRef.current?.y ?? (h * 0.5)
        const curDistX = clamp((mx - w * 0.5) / (w * 0.5))
        const curDistY = clamp((my - h * 0.5) / (h * 0.5))
        const cursorInfluence = 1 - smoothstep(0.0, 0.16, wP)
        const cursorTiltX = -curDistY * 20 * cursorInfluence
        const cursorTiltY = curDistX * 24 * cursorInfluence
        const idleFloat = Math.sin(t * 1.8) * 8 * cursorInfluence

        const pulseElapsed = performance.now() - coinPulseRef.current
        const pulseBoost = pulseElapsed < 450 ? Math.sin((pulseElapsed / 450) * Math.PI) * 0.14 : 0

        const spinDeg = wP * 960
        const tiltX = Math.sin(wP * Math.PI * 3.2) * 14
        const tiltZ = Math.sin(wP * Math.PI * 2.2) * 9
        const drop = smoothstep(0.16, 0.35, wP)
        const dropY = drop * 155
        const coinScale = Math.max(0.18, 1 - drop * 0.72) + pulseBoost
        const coinFade = 1 - smoothstep(0.33, 0.40, wP)

        if (walletCoinRef.current) {
          walletCoinRef.current.style.opacity = String(coinFade)
          walletCoinRef.current.style.transform = `translate3d(calc(-50% + ${curDistX * 12 * cursorInfluence}px), calc(-50% + ${dropY + idleFloat}px), 0) rotateY(${spinDeg + cursorTiltY}deg) rotateX(${tiltX + cursorTiltX}deg) rotateZ(${tiltZ}deg) scale(${coinScale})`
        }

        // Magnetic induction flux field & contact shadow dynamics
        const magFade = (1 - smoothstep(0.12, 0.28, wP)) * (1 - handoff)
        const pulseGlow = pulseElapsed < 450 ? Math.sin((pulseElapsed / 450) * Math.PI) * 0.4 : 0
        if (magneticFieldRef.current) {
          magneticFieldRef.current.style.opacity = String(Math.min(1, magFade * 0.92 + pulseGlow))
          magneticFieldRef.current.style.transform = `translate3d(calc(-50% + ${curDistX * 8 * cursorInfluence}px), calc(-50% + ${dropY * 0.35}px), 0) scale(${Math.max(0.4, 1 - drop * 0.3 + pulseGlow * 0.25)})`
        }
        if (coinShadowRef.current) {
          const shadowScale = Math.max(0.38, 1 - drop * 0.52 - idleFloat * 0.02)
          coinShadowRef.current.style.opacity = String((0.85 - drop * 0.45) * magFade)
          coinShadowRef.current.style.transform = `translate3d(calc(-50% + ${curDistX * 6 * cursorInfluence}px), calc(-50% + ${dropY * 0.55}px), 0) scale(${shadowScale})`
        }

        // 1.1 3D COIN RING ARRAY CASCADE (Pinterest/Blender reference)
        if (coinRingStageRef.current) {
          const ringCount = 12
          const isMob = scene?.mobile ?? false
          const baseRadius = isMob ? 100 : 152
          // As user scrolls, ring slightly expands before peeling off
          const expand = smoothstep(0.04, 0.16, wP) * 35
          const R = baseRadius + expand
          
          // Base 3D tilt angles (matching the isometric oblique perspective of the Blender render)
          const baseTiltX = 58 + cursorTiltX * 0.4 - smoothstep(0.12, 0.30, wP) * 25
          const baseTiltZ = -18 + cursorTiltY * 0.4
          
          // Continuous rotation speed: fast at rest, slows as user scrubs into the routing sequence
          const spinSpeed = 0.75 * (1 - smoothstep(0.10, 0.28, wP) * 0.85)
          const currentSpin = (t * spinSpeed) + (wP * 4.5)

          // Overall ring visibility: fades out as coins complete their cascade into the ledger & wallet
          const ringFade = 1 - smoothstep(0.48, 0.62, wP)
          coinRingStageRef.current.style.opacity = String(ringFade * (1 - handoff))

          for (let i = 0; i < ringCount; i++) {
            const coinEl = coinRingRefs.current[i]
            if (!coinEl) continue

            const baseAngle = (i / ringCount) * Math.PI * 2
            const angle = baseAngle + currentSpin

            // Orbit ellipse coordinates in 3D
            let x = Math.cos(angle) * R
            let y = Math.sin(angle) * R * Math.cos(baseTiltX * (Math.PI / 180))
            let z = Math.sin(angle) * R * Math.sin(baseTiltX * (Math.PI / 180))
            let rotY = angle * (180 / Math.PI)
            let rotX = baseTiltX * 0.4
            let coinScale = 0.82 + (z / (R * 2)) * 0.35

            // Cascade: Coins stream downward in a 3D spiral into the opening leather wallet!
            const walletDropStart = 0.14 + (i / ringCount) * 0.16
            const walletDropEnd = walletDropStart + 0.18
            const dropP = clamp((wP - walletDropStart) / (walletDropEnd - walletDropStart))
            if (dropP > 0) {
              const ease = dropP * dropP * (3 - 2 * dropP)
              // Converge x toward wallet center with gentle spiral
              const spiral = Math.sin(dropP * Math.PI * 2 + i) * 20 * (1 - ease)
              x = (x + spiral) * (1 - ease * 0.95)
              y = y * (1 - ease) + (145 + (i % 3) * 8) * ease
              z = z * (1 - ease) - ease * 85
              coinScale = coinScale * (1 - ease * 0.65)
              rotX = rotX * (1 - ease) + 30 * ease
              rotY = rotY + ease * 180
            }

            coinEl.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg) scale(${coinScale.toFixed(3)})`
            coinEl.style.zIndex = String(Math.round(z + 300))
          }
        }

        // 2. Leather Wallet Body rests physically below coin, then glides in & swings its lid open in synchronization with the coin
        const walletIn = smoothstep(0.0, 0.18, wP)
        const walletOpen = smoothstep(0.14, 0.35, wP)
        if (walletBodyRef.current) {
          const walletFade = 1 - smoothstep(0.79, 0.91, wP)
          const baseVisibility = 0.88 + walletIn * 0.12
          walletBodyRef.current.style.opacity = String(baseVisibility * walletFade)
          walletBodyRef.current.style.transform = `translate3d(-50%, calc(-50% + ${(1 - walletIn) * 35 - walletOpen * 12}px), 0) scale(${0.92 + walletIn * 0.08 + walletOpen * 0.04})`
        }
        if (walletLidRef.current) {
          const lidAngle = walletOpen * (1 - handoff)
          walletLidRef.current.style.transform = `rotateX(${-lidAngle * 86}deg) translateY(${-lidAngle * 10}px)`
        }

        // 3. Headline copy clears out smoothly before the feature cards emerge
        if (walletCopyRef.current) {
          const copyFade = smoothstep(0.20, 0.35, wP)
          walletCopyRef.current.style.opacity = String(1 - copyFade)
          walletCopyRef.current.style.transform = `translate3d(0, ${-copyFade * 32}px, 0) scale(${1 - copyFade * 0.04})`
        }

        // 4. Feature Cards: emerge from open wallet, surge with border luminance, and converge inward
        tileRefs.current.forEach((tile, index) => {
          if (!tile) return
          let visibility: number
          let x = 0
          let y: number
          let rotate = 0

          if (scene.mobile) {
            const start = 0.38 + index * 0.11
            const enter = smoothstep(start, start + 0.06, wP)
            const leave = smoothstep(start + 0.10, start + 0.16, wP)
            visibility = enter * (1 - leave) * (1 - handoff)
            y = 35 - enter * 95 - leave * 35
            tile.style.transform = `translate3d(-50%, ${y}px, 0) scale(${0.82 + enter * 0.2 - leave * 0.04 - handoff * 0.1})`
          } else {
            const cardStart = 0.36 + index * 0.045
            const cardEnter = smoothstep(cardStart, cardStart + 0.16, wP)
            const cardExit = smoothstep(0.76, 0.92, wP)
            visibility = cardEnter * (1 - cardExit) * (1 - handoff)
            const spread = Math.min(1.08, Math.max(0.72, w / 1220))
            const positions = [-265, 0, 265]
            x = positions[index] * spread * cardEnter * (1 - handoff * 0.45)
            y = 35 - cardEnter * (index === 1 ? 165 : 138) - cardExit * 65 - handoff * 30
            rotate = [-6, 0, 6][index] * cardEnter * (1 - handoff)
            const exitScale = (1 - cardExit * 0.06) * (1 - handoff * 0.12)
            tile.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotate(${rotate}deg) scale(${(0.72 + cardEnter * 0.30) * exitScale})`
          }

          // Electric border luminance surge during handoff
          if (handoff > 0.04) {
            tile.style.borderColor = `rgba(99, 220, 211, ${Math.min(1, 0.65 + handoff * 0.35)})`
            tile.style.boxShadow = `0 0 24px rgba(99, 220, 211, ${handoff * 0.65}), inset 0 0 12px rgba(255, 255, 255, ${handoff * 0.5})`
          } else {
            tile.style.borderColor = ''
            tile.style.boxShadow = ''
          }

          tile.style.opacity = String(visibility)
          tile.style.pointerEvents = visibility > 0.05 ? 'auto' : 'none'
          tile.style.visibility = visibility > 0.01 ? 'visible' : 'hidden'
        })

        if (meterRef.current) {
          meterRef.current.style.opacity = String(0.74 * (1 - smoothstep(0.75, 0.88, wP)) * (1 - handoff))
        }
      }

      // ----------------------------------------------------
      // CHAPTER 2 PROGRESS SETUP
      // ----------------------------------------------------
      const heroP = clamp((progress - HERO_START) / HERO_SPAN)
      const heroIntro = smoothstep(HERO_START, HERO_START + 0.032, progress)
      const s = sceneAt(scene, heroP)

      // ----------------------------------------------------
      // CHAPTER 1.5: THE THREAD CONVERGENCE (Laser Darts & Single Shine)
      // ----------------------------------------------------
      if (threadsSvgRef.current) {
        if (handoff > 0.02 && handoff < 0.82) {
          threadsSvgRef.current.style.display = 'block'
          threadsSvgRef.current.style.visibility = 'visible'
          threadsSvgRef.current.style.opacity = '1'

          const tx = s.coinX
          const ty = s.coinY
          const spread = Math.min(1.08, Math.max(0.72, w / 1220))

          // Card Origin coordinates
          const origins = scene.mobile
            ? [
                [w * 0.5, h * 0.69 + 35 - 95],
                [w * 0.5, h * 0.69 + 35 - 130],
                [w * 0.5, h * 0.69 + 35 - 165],
              ]
            : [
                [w * 0.5 - 265 * spread, h * 0.68 + 35 - 138],
                [w * 0.5, h * 0.68 + 35 - 165],
                [w * 0.5 + 265 * spread, h * 0.68 + 35 - 138],
              ]

          // 3 Cubic Bezier Curves converging toward the Coin
          const d0 = `M ${origins[0][0].toFixed(1)},${origins[0][1].toFixed(1)} C ${(origins[0][0] - 50).toFixed(1)},${((origins[0][1] + ty) * 0.55).toFixed(1)} ${(tx - 80).toFixed(1)},${(ty + 55).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`
          const d1 = `M ${origins[1][0].toFixed(1)},${origins[1][1].toFixed(1)} C ${origins[1][0].toFixed(1)},${((origins[1][1] + ty) * 0.45).toFixed(1)} ${(tx - 25).toFixed(1)},${(ty + 65).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`
          const d2 = `M ${origins[2][0].toFixed(1)},${origins[2][1].toFixed(1)} C ${(origins[2][0] + 50).toFixed(1)},${((origins[2][1] + ty) * 0.55).toFixed(1)} ${(tx + 80).toFixed(1)},${(ty + 55).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`
          const curves = [d0, d1, d2]

          // Laser dart dynamics: head shoots to coin, tail follows and contracts into coin
          const head = smoothstep(0.04, 0.56, handoff) * 1000
          const tail = smoothstep(0.36, 0.70, handoff) * 1000
          const dartLen = Math.max(0, head - tail)
          const dartOffset = -tail

          for (let i = 0; i < 3; i++) {
            const p = threadPaths.current[i]
            if (p) {
              p.setAttribute('d', curves[i])
              p.setAttribute('stroke-dasharray', `${dartLen.toFixed(1)} 1000`)
              p.setAttribute('stroke-dashoffset', `${dartOffset.toFixed(1)}`)
            }
            const core = threadCores.current[i]
            if (core) {
              core.setAttribute('d', curves[i])
              core.setAttribute('stroke-dasharray', `${dartLen.toFixed(1)} 1000`)
              core.setAttribute('stroke-dashoffset', `${dartOffset.toFixed(1)}`)
            }
            const pulse = threadPulses.current[i]
            if (pulse) {
              pulse.setAttribute('d', curves[i])
              const pulseLen = Math.min(dartLen * 0.45, 80)
              pulse.setAttribute('stroke-dasharray', `${pulseLen.toFixed(1)} 1000`)
              pulse.setAttribute('stroke-dashoffset', `${(dartOffset - (dartLen - pulseLen) * 0.5).toFixed(1)}`)
            }
          }

          // Single Shine: Flash bursts sharply once upon impact and immediately vanishes
          if (fusionSparkRef.current) {
            const sparkT = smoothstep(0.52, 0.78, handoff)
            const sparkScale = Math.sin(sparkT * Math.PI)
            if (sparkScale > 0.005) {
              fusionSparkRef.current.style.display = 'block'
              fusionSparkRef.current.style.opacity = String(sparkScale)
              fusionSparkRef.current.setAttribute(
                'transform',
                `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${(sparkScale * 1.5).toFixed(2)}) rotate(${((t * 110) % 360).toFixed(1)})`,
              )
            } else {
              fusionSparkRef.current.style.display = 'none'
              fusionSparkRef.current.style.opacity = '0'
            }
          }
        } else {
          // Immediately vanish completely: zero lingering lines, zero flares
          threadsSvgRef.current.style.display = 'none'
          threadsSvgRef.current.style.visibility = 'hidden'
          threadsSvgRef.current.style.opacity = '0'
          if (fusionSparkRef.current) {
            fusionSparkRef.current.style.display = 'none'
            fusionSparkRef.current.style.opacity = '0'
          }
        }
      }

      // ----------------------------------------------------
      // CHAPTER 2: HERO SCENE (Fluid Ribbon Flow & Graph)
      // ----------------------------------------------------
      if (heroSvgBackRef.current) {
        heroSvgBackRef.current.style.opacity = String(heroIntro)
        heroSvgBackRef.current.style.visibility = heroIntro > 0.005 ? 'visible' : 'hidden'
      }
      if (heroSvgFrontRef.current) {
        heroSvgFrontRef.current.style.opacity = String(heroIntro)
        heroSvgFrontRef.current.style.visibility = heroIntro > 0.005 ? 'visible' : 'hidden'
      }

      const amp = reduced ? 0 : s.amp * heroIntro

      // Magnetic liquid ribbon calculation with cursor pull and ripple shockwaves
      const now = performance.now()
      ripplesRef.current = ripplesRef.current.filter((r) => now - r.time < 1300)
      const mx = pointerRef.current?.x ?? -9999
      const my = pointerRef.current?.y ?? -9999

      const pts: Vec[] = s.a.map(([x, y], i) => {
        let px = x + amp * Math.cos(t * 0.42 + i * 1.3) * w * 0.004
        let py = y + amp * Math.sin(t * 0.55 + i * 0.9) * h * 0.012

        // 1. Magnetic elastic deflection towards cursor
        const distToCursor = Math.hypot(px - mx, py - my)
        if (distToCursor < 260) {
          const pullFactor = 1 - distToCursor / 260
          const pull = Math.sin(pullFactor * Math.PI) * 44
          const angle = Math.atan2(my - py, mx - px)
          px += Math.cos(angle) * pull
          py += Math.sin(angle) * pull
        }

        // 2. Click ripple shockwaves
        for (const r of ripplesRef.current) {
          const dt = (now - r.time) / 1000
          const waveRadius = dt * 680
          const distToRipple = Math.hypot(px - r.x, py - r.y)
          const waveDiff = Math.abs(distToRipple - waveRadius)
          if (waveDiff < 85) {
            const decay = Math.max(0, 1 - dt / 1.3)
            const waveAmp = Math.sin((distToRipple - waveRadius) * 0.09) * 26 * decay
            py += waveAmp
          }
        }

        return [px, py]
      })

      const d = smoothPath(pts)
      for (const el of ribbon.current) el?.setAttribute('d', d)
      const offset = -((t * 55) % 1000)
      highlights.current.forEach((el, i) => {
        if (!el) return
        el.setAttribute('d', d)
        el.style.strokeDashoffset = String(offset - (i % 2) * 520)
      })

      // Half-disc mask: the ribbon passes behind the top of the glass coin and in front of the bottom.
      const mr = s.coinR * clamp(s.coinO * 1.6) * 0.97
      mask.current?.setAttribute(
        'd',
        mr < 1 ? 'M0,0' : `M${s.coinX - mr},${s.coinY} A${mr},${mr} 0 0 1 ${s.coinX + mr},${s.coinY} Z`,
      )
      mask.current?.setAttribute('transform', `rotate(-14 ${s.coinX} ${s.coinY})`)

      if (coin.current) {
        const coinFade = smoothstep(0.38, 0.62, handoff)
        const coinAlpha = Math.max(coinFade, heroIntro) * s.coinO
        if (coinAlpha > 0.01) {
          coin.current.style.transform = `translate3d(${(s.coinX - 200).toFixed(1)}px, ${(s.coinY - 200).toFixed(1)}px, 0) scale(${(s.coinR / 200).toFixed(3)})`
          coin.current.style.opacity = String(coinAlpha)
          coin.current.style.visibility = 'visible'
        } else {
          coin.current.style.opacity = '0'
          coin.current.style.visibility = 'hidden'
        }
      }
      if (wallet.current) {
        const walletAlpha = s.walletO * heroIntro
        if (walletAlpha > 0.01) {
          wallet.current.style.transform = `translate3d(${(s.walletX - 120).toFixed(1)}px, ${(s.walletY - 80).toFixed(1)}px, 0) scale(${s.walletS.toFixed(3)})`
          wallet.current.style.opacity = String(walletAlpha)
          if (Math.abs(s.split - lastSplit) > 0.002) {
            wallet.current.style.setProperty('--split', s.split.toFixed(3))
            lastSplit = s.split
          }
          wallet.current.style.visibility = 'visible'
        } else {
          wallet.current.style.opacity = '0'
          wallet.current.style.visibility = 'hidden'
        }
      }

      // Graph drawing along the same path
      const drawT = clamp((heroP - (KEYS[1] + 0.05)) / (KEYS[2] - KEYS[1] - 0.04))
      if (drawPath.current) {
        drawPath.current.setAttribute('d', d)
        drawPath.current.style.strokeDashoffset = String(1 - drawT)
        drawPath.current.style.opacity = String(s.graph * heroIntro)
      }
      if (area.current) {
        area.current.setAttribute(
          'd',
          s.graph > 0.01 ? `${d} L${pts[13][0].toFixed(1)},${box.bottom} L${pts[0][0].toFixed(1)},${box.bottom} Z` : 'M0,0',
        )
        area.current.style.opacity = String(s.graph * drawT * heroIntro)
      }
      if (grid.current) grid.current.style.opacity = String(s.graph * heroIntro)

      DOT_INDICES.forEach((i) => {
        const g = dots.current[i]
        if (!g) return
        const reveal = clamp(drawT * 13 - i + 1)
        const o = s.dots[i] * (1 - s.graph + s.graph * reveal) * heroIntro
        if (o > 0.01) {
          g.setAttribute('transform', `translate(${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)})`)
          g.style.opacity = String(o)
          g.style.visibility = 'visible'
        } else {
          g.style.opacity = '0'
          g.style.visibility = 'hidden'
        }
      })
      if (s.graph > 0.005) {
        DATA_INDICES.forEach((i) => {
          const reveal = clamp(drawT * 13 - i + 1) * s.graph * heroIntro
          const v = values.current[i]
          if (v) {
            v.setAttribute('x', pts[i][0].toFixed(1))
            v.setAttribute('y', (pts[i][1] - 16).toFixed(1))
            v.style.opacity = String(reveal)
          }
          const mo = months.current[i]
          if (mo) {
            mo.setAttribute('x', pts[i][0].toFixed(1))
            mo.style.opacity = String(s.graph * 0.9 * heroIntro)
          }
        })
        lastGraphVisible = true
      } else if (lastGraphVisible) {
        DATA_INDICES.forEach((i) => {
          if (values.current[i]) values.current[i]!.style.opacity = '0'
          if (months.current[i]) months.current[i]!.style.opacity = '0'
        })
        lastGraphVisible = false
      }

      // Savings ring
      const goalRatio = GOAL.saved / GOAL.target
      const ringAlpha = s.ringO * heroIntro
      if (ringGroup.current) ringGroup.current.style.opacity = String(ringAlpha)
      if (ringAlpha > 0.01) {
        for (const c of [ringTrack.current, ringProg.current]) {
          if (!c) continue
          c.setAttribute('cx', String(s.ringX))
          c.setAttribute('cy', String(s.ringY))
          c.setAttribute('r', String(s.ringR))
        }
        if (ringProg.current) {
          ringProg.current.style.strokeDasharray = `${(s.ringFill * goalRatio * 100).toFixed(2)} 100`
          ringProg.current.setAttribute('transform', `rotate(-90 ${s.ringX} ${s.ringY})`)
        }
        const textO = clamp((heroP - KEYS[3] - 0.04) / (KEYS[4] - KEYS[3] - 0.04)) * heroIntro
        if (ringText.current) ringText.current.style.opacity = String(textO)
        const small = Math.max(10, s.ringR * 0.075)
        if (ringPct.current) {
          const pct = `${Math.round(s.ringFill * goalRatio * 100)}%`
          if (pct !== lastPct) {
            ringPct.current.textContent = pct
            lastPct = pct
          }
          ringPct.current.setAttribute('x', String(s.ringX))
          ringPct.current.setAttribute('y', String(s.ringY + s.ringR * 0.12))
          ringPct.current.style.fontSize = `${s.ringR * 0.4}px`
        }
        if (ringName.current) {
          ringName.current.setAttribute('x', String(s.ringX))
          ringName.current.setAttribute('y', String(s.ringY - s.ringR * 0.32))
          ringName.current.style.fontSize = `${small}px`
          ringName.current.textContent = GOAL.name.toUpperCase()
        }
        if (ringSub.current) {
          ringSub.current.setAttribute('x', String(s.ringX))
          ringSub.current.setAttribute('y', String(s.ringY + s.ringR * 0.36))
          ringSub.current.style.fontSize = `${small}px`
          ringSub.current.textContent = `${inr(GOAL.saved)} of ${inr(GOAL.target)}`
        }
      }

      // Particles travel along the live ribbon - pure analytical Bezier spline evaluation (0 DOM root-finding)
      if ((heroP > 0.02 || reduced) && heroIntro > 0.1) {
        particles.current.forEach((c, i) => {
          if (!c) return
          const f = reduced ? (i + 0.5) / PARTICLES : (t * 0.026 + i / PARTICLES + Math.sin(i * 7.1) * 0.02 + 1) % 1
          const pt = getSplinePoint(pts, f)
          c.setAttribute('cx', pt[0].toFixed(1))
          c.setAttribute('cy', pt[1].toFixed(1))
          c.style.opacity = String(Math.sin(f * Math.PI) * (0.35 + (((i * 37) % 10) / 10) * 0.6) * heroIntro)
        })
      } else {
        particles.current.forEach((c) => {
          if (c) c.style.opacity = '0'
        })
      }

      // Cinematic palette transition: in daylight mode, background is crisp white; in night mode, veil is deep navy
      const reveal = reduced ? 1 : clamp((heroP - 0.22) / 0.18)
      if (Math.abs(reveal - lastReveal) > 0.005) {
        if (cinematicVeil.current) {
          cinematicVeil.current.style.opacity = isNight ? String(0.94 * (1 - reveal)) : '0'
        }
        // Cache headline elements once to avoid 240 DOM querySelector traversals per second
        if (headline.current && !headlineElements.current.primary) {
          headlineElements.current = {
            primary: headline.current.querySelector<HTMLElement>('[data-cinematic-primary]'),
            secondary: headline.current.querySelector<HTMLElement>('[data-cinematic-secondary]'),
            eyebrow: headline.current.querySelector<HTMLElement>('[data-cinematic-eyebrow]'),
            body: headline.current.querySelector<HTMLElement>('[data-cinematic-body]'),
          }
        }
        const { primary, secondary, eyebrow, body } = headlineElements.current
        if (primary) primary.style.color = isNight ? `color-mix(in srgb, #FFFFFF ${(1 - reveal) * 100}%, #003365)` : '#003365'
        if (secondary) secondary.style.color = '#00A99E'
        if (eyebrow) eyebrow.style.color = '#00A99E'
        if (body) body.style.color = '#52728A'
        lastReveal = reveal
      }

      // Opening copy stays rock-solid through Scene 1, then gracefully glides out
      // completely BEFORE Scene 2 ("Money is never still") begins, eliminating text collision and ghosting
      const hOut = smoothstep(0.12, 0.28, heroP)
      if (headline.current) {
        const headlineO = heroIntro * (1 - hOut)
        if (headlineO > 0.005) {
          const scale = 1 - hOut * 0.075
          const yOffset = (1 - heroIntro) * 20 - hOut * 70
          headline.current.style.opacity = String(headlineO)
          headline.current.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
          headline.current.style.transformOrigin = 'left center'
          headline.current.style.visibility = 'visible'
          lastHeadlineVisible = true
        } else if (lastHeadlineVisible) {
          headline.current.style.opacity = '0'
          headline.current.style.visibility = 'hidden'
          lastHeadlineVisible = false
        }
      }

      captions.current.forEach((c, i) => {
        if (!c) return
        const k = KEYS[i + 1]
        const o = (i === 3 ? clamp((heroP - (k - 0.11)) / 0.06) : clamp((0.115 - Math.abs(heroP - k)) / 0.055)) * heroIntro
        if (o > 0.01) {
          c.style.opacity = String(o)
          c.style.transform = `translate3d(0, ${((1 - o) * 18).toFixed(1)}px, 0)`
          c.style.visibility = 'visible'
        } else {
          c.style.opacity = '0'
          c.style.visibility = 'hidden'
        }
      })

      if (progressBar.current) {
        progressBar.current.style.transform = `scaleX(${heroP.toFixed(3)})`
      }
      if (progressFooterRef.current) {
        progressFooterRef.current.style.opacity = String(heroIntro)
        progressFooterRef.current.style.visibility = heroIntro > 0.05 ? 'visible' : 'hidden'
      }

      let activeStep = 0
      KEYS.forEach((k, i) => {
        if (heroP >= k - 0.08) activeStep = i
      })
      steps.current.forEach((li, i) => li?.setAttribute('data-active', String(i <= activeStep)))
    }

    let raf = 0
    let smooth = -1
    let cachedTotal = 0
    let cachedOffsetTop = 0

    const updateMetrics = () => {
      cachedOffsetTop = section.offsetTop
      cachedTotal = Math.max(1, section.offsetHeight - window.innerHeight)
    }
    updateMetrics()
    window.addEventListener('resize', updateMetrics, { passive: true })

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      // Read compositor scroll position directly without forcing layout reflow
      const scrollY = window.scrollY
      const currentTop = cachedOffsetTop - scrollY
      const target = reduced ? 0 : clamp(-currentTop / cachedTotal)

      // Responsive snappy lerp (0.28 factor eliminates sluggish drag while maintaining butter-smooth 60-120fps glide)
      smooth = smooth < 0 || reduced ? target : smooth + (target - smooth) * 0.28
      if (Math.abs(target - smooth) < 0.0001) smooth = target
      render(smooth, reduced ? 0 : now / 1000)
    }

    const io = new IntersectionObserver(([entry]) => {
      stage.dataset.paused = String(!entry.isIntersecting)
      if (entry.isIntersecting) {
        updateMetrics()
        if (!raf) raf = requestAnimationFrame(frame)
      }
      if (!entry.isIntersecting && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    io.observe(section)

    return () => {
      io.disconnect()
      window.removeEventListener('resize', updateMetrics)
      cancelAnimationFrame(raf)
    }
  }, [scene, reduced])

  const goToFlow = () => {
    const sec = sectionRef.current
    if (!sec) return
    const total = sec.offsetHeight - window.innerHeight
    const targetP = HERO_START + HERO_SPAN * KEYS[1]
    window.scrollTo({ top: sec.offsetTop + total * targetP, behavior: reduced ? 'auto' : 'smooth' })
  }

  const labelEvery = scene?.mobile ? 3 : 2

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Your money. In motion."
      aria-describedby="hero-motion-description"
      className={reduced ? 'relative min-h-svh' : 'relative h-[490vh] md:h-[560vh]'}
    >
      <p id="hero-motion-description" className="sr-only">
        An illustrative visual story follows a stream of money as it becomes a savings chart,
        flows into a wallet, and settles around a savings goal. The figures shown are sample data.
      </p>
      <div
        ref={stageRef}
        className="hero-stage sticky top-0 h-svh w-full overflow-hidden"
        onPointerMove={(e) => {
          pointerRef.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerLeave={() => {
          pointerRef.current = null
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button, a, input, select')) return
          const rect = e.currentTarget.getBoundingClientRect()
          ripplesRef.current.push({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            time: performance.now(),
          })
          sound.click()
        }}
      >
        {/* Background Canvas (Circadian aware: 9 AM Mint vs 2 AM Midnight) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-all duration-700"
          style={{
            background: isNight
              ? 'radial-gradient(65% 65% at 65% 45%, rgba(99,220,211,0.18), transparent 70%), linear-gradient(180deg, #000B18 0%, #001326 100%)'
              : '#FFFFFF',
          }}
        />

        {/* 2 AM Floating Nocturnal Embers */}
        {isNight && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            {[12, 28, 48, 68, 85].map((left, idx) => (
              <div
                key={idx}
                className="night-ember absolute bottom-12 size-2 rounded-full bg-amber-400/60 blur-[1px]"
                style={{
                  left: `${left}%`,
                  animationDelay: `${idx * 1.2}s`,
                  animationDuration: `${5.5 + idx * 0.9}s`,
                }}
              />
            ))}
          </div>
        )}

        <div
          ref={cinematicVeil}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            opacity: isNight ? 0.94 : 0,
            background:
              'radial-gradient(75% 45% at 50% 0%, rgba(0, 169, 158, 0.22) 0%, transparent 70%), radial-gradient(60% 50% at 85% 18%, rgba(99, 220, 211, 0.16) 0%, transparent 65%), radial-gradient(80% 60% at 50% 75%, rgba(0, 169, 158, 0.24) 0%, transparent 70%), linear-gradient(180deg, #001022 0%, #001e3b 28%, #002d54 58%, #001c38 88%, #001224 100%)',
            transition: reduced ? 'none' : 'opacity 120ms linear',
          }}
        />

        {/* ==================================================== */}
        {/* CHAPTER 1: WALLET WORLD (Opening Act)                 */}
        {/* ==================================================== */}
        <div ref={walletWorldRef} className="pointer-events-none absolute inset-0 z-[5]">
          <div className="fintellec-wallet-reveal__grain" aria-hidden="true" />
          <div className="fintellec-wallet-reveal__ambient" aria-hidden="true" />

          {/* Intro Copy */}
          <div ref={walletCopyRef} className="fintellec-wallet-reveal__copy">
            <p className="fintellec-wallet-reveal__eyebrow">MONEY, IN MOTION</p>
            <h1 className="fintellec-wallet-reveal__headline">
              Every rupee has<br /><span className="font-highlight">a place to go.</span>
            </h1>
          </div>

          {/* 3D Rupee Coin Ring Array (Pinterest-Inspired Blender Array) */}
          <div
            ref={coinRingStageRef}
            className="fintellec-coin-ring-stage"
            aria-hidden="true"
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  coinRingRefs.current[idx] = el
                }}
                className="fintellec-ring-coin"
              >
                <span className="fintellec-ring-coin__symbol">₹</span>
                <span className="fintellec-ring-coin__rim" />
              </div>
            ))}
          </div>


          {/* Dynamic Contact Drop Shadow directly below coin */}
          <div
            ref={coinShadowRef}
            className="pointer-events-none absolute left-1/2 top-[72.2%] z-[2] -translate-x-1/2 -translate-y-1/2 w-[clamp(110px,14vw,170px)] h-[22px] rounded-[100%] bg-navy/20 blur-md will-change-transform"
            aria-hidden="true"
          />

          {/* 3D Rupee Coin (Clickable for Magnetic Pulse) */}
          <div
            ref={walletCoinRef}
            onClick={handleWalletCoinClick}
            className="fintellec-wallet-reveal__coin pointer-events-auto cursor-pointer select-none transition-[box-shadow] duration-200 hover:shadow-[0_0_0_6px_rgba(203,213,225,.9),0_0_55px_rgba(255,255,255,.95),0_15px_35px_rgba(15,23,42,.22)]"
            aria-label="Fintellec rupee coin - click to pulse magnetic field"
            title="Click to pulse magnetic levitation field"
          >
            <span>₹</span>
            <small>FINTELLEC</small>
          </div>

          {/* Leather Wallet Body with 3D opening lid */}
          <div ref={walletBodyRef} className="fintellec-wallet-reveal__wallet" aria-hidden="true">
            <div className="fintellec-wallet-reveal__wallet-inside">
              <span className="fintellec-wallet-reveal__pocket-mark">₹</span>
              <span className="fintellec-wallet-reveal__pocket-shine" />
            </div>
            <div className="fintellec-wallet-reveal__wallet-body">
              <span className="fintellec-wallet-reveal__wallet-brand">FINTELLEC</span>
              <span className="fintellec-wallet-reveal__wallet-seam" />
              <span className="fintellec-wallet-reveal__wallet-clasp" />
            </div>
            <div ref={walletLidRef} className="fintellec-wallet-reveal__wallet-lid">
              <span className="fintellec-wallet-reveal__lid-emblem">F</span>
              <span className="fintellec-wallet-reveal__lid-stitch" />
            </div>
          </div>

          {/* 3 Interactive Feature Cards */}
          <div className="fintellec-wallet-reveal__tiles" aria-label="Wallet features">
            {FEATURES.map((feature, index) => (
              <InteractiveWalletTile
                key={feature.id}
                feature={feature}
                tileRef={(node) => {
                  tileRefs.current[index] = node
                }}
              />
            ))}
          </div>


        </div>

        {/* ==================================================== */}
        {/* CHAPTER 1.5: THE THREAD CONVERGENCE (Laser Handoff)  */}
        {/* ==================================================== */}
        <svg
          ref={threadsSvgRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[6] size-full overflow-visible"
          viewBox={`0 0 ${scene?.w ?? 1440} ${scene?.h ?? 900}`}
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <defs>
            <linearGradient id="thread-grad-0" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#63DCD3" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#EFFAFA" stopOpacity="1" />
              <stop offset="100%" stopColor="#00A99E" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="thread-grad-1" x1="0.5" y1="1" x2="0.5" y2="0">
              <stop offset="0%" stopColor="#B8F2EC" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#63DCD3" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="thread-grad-2" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#63DCD3" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#EFFAFA" stopOpacity="1" />
              <stop offset="100%" stopColor="#00A99E" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* 3 Laser Base Beams */}
          <g>
            <path
              ref={(el) => { threadPaths.current[0] = el }}
              fill="none"
              stroke="url(#thread-grad-0)"
              strokeWidth="3.2"
              strokeLinecap="round"
              pathLength={1000}
            />
            <path
              ref={(el) => { threadPaths.current[1] = el }}
              fill="none"
              stroke="url(#thread-grad-1)"
              strokeWidth="3.6"
              strokeLinecap="round"
              pathLength={1000}
            />
            <path
              ref={(el) => { threadPaths.current[2] = el }}
              fill="none"
              stroke="url(#thread-grad-2)"
              strokeWidth="3.2"
              strokeLinecap="round"
              pathLength={1000}
            />
          </g>

          {/* Core White Laser Filaments */}
          <g>
            <path
              ref={(el) => { threadCores.current[0] = el }}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              pathLength={1000}
            />
            <path
              ref={(el) => { threadCores.current[1] = el }}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              pathLength={1000}
            />
            <path
              ref={(el) => { threadCores.current[2] = el }}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              pathLength={1000}
            />
          </g>

          {/* Traveling High-Speed Data Pulses */}
          <g>
            <path
              ref={(el) => { threadPulses.current[0] = el }}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength={1000}
              strokeDasharray="90 310"
            />
            <path
              ref={(el) => { threadPulses.current[1] = el }}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={1000}
              strokeDasharray="110 330"
            />
            <path
              ref={(el) => { threadPulses.current[2] = el }}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength={1000}
              strokeDasharray="90 310"
            />
          </g>

          {/* Fusion Spark at Convergence Point */}
          <g ref={fusionSparkRef} style={{ opacity: 0 }}>
            {/* Crisp 4-Point Star Lens Flare */}
            <circle r="4" fill="#FFFFFF" />
            <circle r="18" fill="#63DCD3" fillOpacity="0.18" />
            <circle r="10" fill="#63DCD3" fillOpacity="0.45" />
            <line x1="-36" y1="0" x2="36" y2="0" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="0" y1="-36" x2="0" y2="36" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="-20" y1="-20" x2="20" y2="20" stroke="#63DCD3" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-20" y1="20" x2="20" y2="-20" stroke="#63DCD3" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>

        {/* ==================================================== */}
        {/* CHAPTER 2: HERO SCENE (Fluid Coin & Ribbon Flow)     */}
        {/* ==================================================== */}
        {scene && (
          <>
            {/* Ribbon layer behind the glass coin */}
            <svg
              ref={heroSvgBackRef}
              aria-hidden
              className="absolute inset-0 z-[2] size-full pointer-events-none"
              style={{ opacity: 0, visibility: 'hidden' }}
              viewBox={`0 0 ${scene.w} ${scene.h}`}
            >
              <defs>
                <linearGradient id="rb-grad-b" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={scene.w} y2="0">
                  <stop offset="0" stopColor="#B8F2EC" />
                  <stop offset="0.35" stopColor="#63DCD3" />
                  <stop offset="0.7" stopColor="#00A99E" />
                  <stop offset="1" stopColor="#63DCD3" />
                </linearGradient>
              </defs>
              <g fill="none" strokeLinecap="round">
                <path ref={(el) => { ribbon.current[0] = el }} stroke="#63DCD3" strokeOpacity="0.14" strokeWidth="14" />
                <path ref={(el) => { ribbon.current[1] = el }} stroke="url(#rb-grad-b)" strokeWidth="2.6" />
              </g>
            </svg>

            <div ref={coin} className="pointer-events-auto absolute left-0 top-0 z-[3] will-change-transform">
              <GlassCoin />
            </div>

            {/* Front SVG layer */}
            <svg
              ref={heroSvgFrontRef}
              aria-hidden
              className="absolute inset-0 z-[4] size-full pointer-events-none"
              style={{ opacity: 0, visibility: 'hidden' }}
              viewBox={`0 0 ${scene.w} ${scene.h}`}
            >
              <defs>
                <linearGradient id="rb-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={scene.w} y2="0">
                  <stop offset="0" stopColor="#B8F2EC" />
                  <stop offset="0.35" stopColor="#63DCD3" />
                  <stop offset="0.7" stopColor="#00A99E" />
                  <stop offset="1" stopColor="#63DCD3" />
                </linearGradient>
                <linearGradient id="rb-area" gradientUnits="userSpaceOnUse" x1="0" y1={scene.box.top} x2="0" y2={scene.box.bottom}>
                  <stop offset="0" stopColor="#63DCD3" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#63DCD3" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#63DCD3" />
                  <stop offset="1" stopColor="#00A99E" />
                </linearGradient>
                <mask id="coin-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={scene.w} height={scene.h}>
                  <rect width={scene.w} height={scene.h} fill="white" />
                  <path ref={mask} fill="black" />
                </mask>
              </defs>

              <g ref={grid} style={{ opacity: 0 }}>
                {[0, 10000, 20000, 30000].map((v) => {
                  const y = scene.box.bottom - (v / GRAPH_MAX) * (scene.box.bottom - scene.box.top)
                  return (
                    <g key={v}>
                      <line x1={scene.box.x0} x2={scene.box.x1} y1={y} y2={y} stroke="#003365" strokeOpacity={v === 0 ? 0.18 : 0.07} />
                      {v > 0 && (
                        <text x={scene.box.x0} y={y - 7} fill="#52728a" fontSize="10" style={{ fontFamily: 'var(--font-nunito)' }}>
                          {inrCompact(v)}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>

              <path ref={area} fill="url(#rb-area)" style={{ opacity: 0 }} />

              <g mask="url(#coin-mask)" fill="none" strokeLinecap="round">
                <path ref={(el) => { ribbon.current[2] = el }} stroke="#63DCD3" strokeOpacity="0.07" strokeWidth="24" />
                <path ref={(el) => { ribbon.current[3] = el }} stroke="#63DCD3" strokeOpacity="0.18" strokeWidth="9" />
                <path
                  ref={(el) => {
                    ribbon.current[4] = el
                  }}
                  stroke="url(#rb-grad)"
                  strokeWidth="2.6"
                />
                <path ref={(el) => { ribbon.current[5] = el }} stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
                <path
                  ref={(el) => { highlights.current[0] = el }}
                  pathLength={1000}
                  stroke="#63DCD3"
                  strokeOpacity="0.35"
                  strokeWidth="8"
                  strokeDasharray="70 930"
                />
                <path
                  ref={(el) => { highlights.current[1] = el }}
                  pathLength={1000}
                  stroke="#fff"
                  strokeWidth="2.4"
                  strokeDasharray="60 940"
                />
                <g fill="#fff">
                  {Array.from({ length: PARTICLES }, (_, i) => (
                    <circle
                      key={i}
                      ref={(el) => { particles.current[i] = el }}
                      r={i % 3 === 0 ? 2.4 : 1.4}
                      stroke="#63DCD3"
                      strokeWidth="1"
                      style={{ opacity: 0 }}
                    />
                  ))}
                </g>
              </g>

              <path
                ref={drawPath}
                fill="none"
                pathLength={1}
                stroke="#00A99E"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeDasharray="1 1"
                style={{ opacity: 0, strokeDashoffset: 1 }}
              />

              {DOT_INDICES.map((i) => (
                <g key={i} ref={(el) => { dots.current[i] = el }} style={{ opacity: 0 }}>
                  <circle r="11" fill="#63DCD3" fillOpacity="0.22" />
                  <circle r="4.2" fill="#fff" stroke="#00A99E" strokeWidth="2" />
                </g>
              ))}

              <g fill="#003365" fontSize="11" textAnchor="middle" style={{ fontFamily: 'var(--font-nunito)' }}>
                {DATA_INDICES.map((i) =>
                  i % labelEvery === 0 || i === 12 ? (
                    <text key={i} ref={(el) => { values.current[i] = el }} style={{ opacity: 0 }}>
                      {inrCompact(GRAPH_VALUES[i - 1])}
                    </text>
                  ) : null,
                )}
              </g>
              <g fill="#52728a" fontSize="10" textAnchor="middle" letterSpacing="1">
                {DATA_INDICES.map((i) =>
                  !scene.mobile || i % 2 === 0 ? (
                    <text key={i} ref={(el) => { months.current[i] = el }} y={scene.box.bottom + 26} style={{ opacity: 0 }}>
                      {GRAPH_MONTHS[i - 1].toUpperCase()}
                    </text>
                  ) : null,
                )}
              </g>

              <g ref={ringGroup} style={{ opacity: 0 }}>
                <circle ref={ringTrack} fill="rgba(255,255,255,0.35)" stroke="#B8F2EC" strokeWidth="10" />
                <circle
                  ref={ringProg}
                  fill="none"
                  stroke="url(#ring-grad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  pathLength={100}
                />
                <g ref={ringText} textAnchor="middle" style={{ opacity: 0 }}>
                  <text ref={ringName} fill="#52728a" letterSpacing="2.5">
                    {GOAL.name.toUpperCase()}
                  </text>
                  <text ref={ringPct} fill="#003365" fontWeight="500" letterSpacing="-2">
                    0%
                  </text>
                  <text ref={ringSub} fill="#00A99E" style={{ fontFamily: 'var(--font-nunito)' }}>
                    {`${inr(GOAL.saved)} of ${inr(GOAL.target)}`}
                  </text>
                </g>
              </g>
            </svg>

            <div ref={wallet} className="absolute left-0 top-0 z-[3] will-change-transform">
              <Wallet />
            </div>
          </>
        )}

        {/* Hero copy */}
        <div
          ref={headline}
          className="pointer-events-none absolute inset-0 z-[4] mx-auto flex max-w-[1440px] flex-col justify-start px-6 pt-[17svh] md:justify-center md:px-12 md:pt-0"
        >
          <div className="pointer-events-auto max-w-[36rem]">
            <p
              data-cinematic-eyebrow
              className={cn(
                'text-[11px] font-medium uppercase tracking-[0.32em] transition-all duration-700 ease-out',
                isNight ? 'text-violet font-semibold' : 'text-violet',
                alive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
            >
              Financial clarity, reimagined.
            </p>

            <h1 className="mt-5 text-[clamp(3rem,8.6vw,7.6rem)] font-medium leading-[0.9] tracking-[-0.045em]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  data-cinematic-primary
                  className={cn(
                    'block text-navy transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    alive ? 'translate-y-0 opacity-100' : 'translate-y-[115%] opacity-0',
                  )}
                  style={{ transitionDelay: alive ? '120ms' : '0ms' }}
                >
                  Your money.
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  data-cinematic-secondary
                  className={cn(
                    'block transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] text-teal',
                    alive ? 'translate-y-0 opacity-100' : 'translate-y-[115%] opacity-0',
                  )}
                  style={{ transitionDelay: alive ? '280ms' : '0ms' }}
                >
                  In motion.
                </span>
              </span>
            </h1>
            <p
              data-cinematic-body
              className={cn(
                'mt-6 max-w-[26rem] text-pretty text-base leading-relaxed text-steel md:text-lg transition-all duration-700 ease-out',
                alive ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
              )}
              style={{ transitionDelay: alive ? '440ms' : '0ms' }}
            >
              Understand your spending. Find your rhythm. Make your money work towards what matters.
            </p>
            <div
              className={cn(
                'mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 transition-all duration-700 ease-out',
                alive ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-5 opacity-0 scale-95',
              )}
              style={{ transitionDelay: alive ? '580ms' : '0ms' }}
            >
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 rounded-full bg-violet px-6 py-3.5 text-sm font-medium text-white shadow-[0_18px_40px_-18px_rgba(101,71,215,0.72)] transition-colors hover:bg-teal"
              >
                Explore Fintellec
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
              <button
                type="button"
                onClick={goToFlow}
                className="group inline-flex items-center gap-2 text-sm font-medium text-navy underline-offset-4 hover:text-violet hover:underline"
              >
                Discover the experience
                <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
              </button>
            </div>
            <p
              className={cn(
                'mt-10 hidden text-xs tracking-wide text-steel/80 md:block transition-all duration-700 ease-out',
                alive ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionDelay: alive ? '720ms' : '0ms' }}
            >
              Less financial noise. More room to grow.
            </p>
          </div>
        </div>

        {/* Scene captions */}
        <div className="pointer-events-none absolute inset-x-0 top-[13svh] z-[4] mx-auto max-w-[1440px] px-6 md:top-[16svh] md:px-12">
          {CAPTIONS.map((c, i) => (
            <div
              key={c.n}
              ref={(el) => { captions.current[i] = el }}
              className="absolute max-w-[22rem] md:max-w-sm"
              style={{ opacity: 0, visibility: 'hidden' }}
            >
              <h2 className="text-balance text-3xl font-medium leading-[1.02] tracking-[-0.03em] text-navy md:text-[2.75rem]">
                {c.h}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel md:text-base">{c.p}</p>
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}
