'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { sound } from '@/lib/sound'

interface HeroCinematicIntroProps {
  onComplete: () => void
  onSkip?: () => void
  onIntroTick?: (progress: number) => void
  w: number
  h: number
  isMobile: boolean
}

// 23 Rupee Glyph Anchor Points normalized around center (0, 0) in pixels
const RUPEE_GLYPH_TARGETS = [
  // 1. Top horizontal bar: 6 points from x=-88 to +88, y=-95
  [-88, -95], [-53, -95], [-18, -95], [18, -95], [53, -95], [88, -95],
  // 2. Second horizontal bar: 5 points from x=-62 to +42, y=-55
  [-62, -55], [-36, -55], [-10, -55], [16, -55], [42, -55],
  // 3. Vertical stem: 3 points
  [-46, -75], [-46, -25], [-46, 0],
  // 4. Upper curve loop: 4 points
  [18, -84], [30, -62], [30, -36], [18, -16],
  // 5. Diagonal right leg: 5 points
  [3, 26], [22, 48], [41, 70], [60, 92], [79, 114]
] as const

// Map 14 perimeter coins from the Rupee glyph to the 14 orbit angles around ellipse
const PERIMETER_MAP = [
  5,   // Orbit 0 (0 deg, right tip): [88, -95]
  17,  // Orbit 1 (26 deg, lower right): [18, -16]
  19,  // Orbit 2 (51 deg, leg): [22, 48]
  21,  // Orbit 3 (77 deg, leg): [60, 92]
  22,  // Orbit 4 (103 deg, leg tip): [79, 114]
  18,  // Orbit 5 (129 deg, leg top): [3, 26]
  13,  // Orbit 6 (154 deg, stem bot): [-46, 0]
  6,   // Orbit 7 (180 deg, mid bar left): [-62, -55]
  11,  // Orbit 8 (206 deg, stem top): [-46, -75]
  0,   // Orbit 9 (231 deg, top bar left): [-88, -95]
  1,   // Orbit 10 (257 deg, top bar): [-53, -95]
  2,   // Orbit 11 (283 deg, top center): [-18, -95]
  3,   // Orbit 12 (309 deg, top right): [18, -95]
  4    // Orbit 13 (334 deg, top right): [53, -95]
]

const clamp = (v: number) => Math.max(0, Math.min(1, v))

// Quintic Hermite Smootherstep: 0 initial & final velocity + 0 initial & final acceleration
// Guarantees C2 buttery, organic smoothness with zero visual hitches
const smootherstep = (min: number, max: number, value: number) => {
  const u = clamp((value - min) / (max - min))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

// Cubic smoothstep for lightweight blends
const smoothstep = (min: number, max: number, value: number) => {
  const u = clamp((value - min) / (max - min))
  return u * u * (3 - 2 * u)
}

const TOTAL_COINS = 68

export function HeroCinematicIntro({
  onComplete,
  onSkip,
  onIntroTick,
  w,
  h,
  isMobile
}: HeroCinematicIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isSkipped, setIsSkipped] = useState(false)
  const startTimeRef = useRef(0)
  const rafRef = useRef(0)
  const soundClinksRef = useRef<{ [key: number]: boolean }>({})
  const lastClinkTimeRef = useRef(0)
  const soundRupeeChimeRef = useRef(false)

  // Seeded physical particles: 68 coins in total
  // Coins 0..22 = 23 Rupee Glyph Anchor Coins
  // Coins 23..67 = 45 Ambient Cascade Coins that create the luxurious torrential shower
  const particlesRef = useRef(
    Array.from({ length: TOTAL_COINS }, (_, i) => {
      const fromLeft = i % 2 === 0
      // Continuous staggered pour stream from t = 0.03 to 0.26
      const stagger = 0.03 + (i * 0.0034) + (Math.random() * 0.012)
      // Generous floor distribution spread across the bottom plane
      const floorSpread = fromLeft
        ? 0.18 + Math.random() * 0.44
        : 0.38 + Math.random() * 0.44
      const floorY = 0.72 + (Math.random() * 0.07 - 0.035)

      return {
        id: i,
        fromLeft,
        stagger,
        floorX: floorSpread,
        floorY,
        landRot: (Math.random() - 0.5) * 75,
        bounceFreq: 22 + Math.random() * 8,
        bounceHeight: 18 + Math.random() * 10,
        swirlAngle: (i * 0.4) + Math.random() * 0.6,
        swirlSpeed: 2.5 + Math.random() * 1.5,
        // Relative size variation for natural physical realism
        sizeFactor: 0.94 + Math.random() * 0.14
      }
    })
  )

  const handleSkip = useCallback(() => {
    setIsSkipped(true)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    sound.snap('high')
    onIntroTick?.(1.0)
    onSkip?.()
    onComplete()
  }, [onComplete, onSkip, onIntroTick])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleSkip()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSkip])

  useEffect(() => {
    startTimeRef.current = performance.now()
    const DURATION = 5000 // 5.0 seconds opulent cinematic experience

    const animate = (now: number) => {
      const dt = now - startTimeRef.current
      setElapsed(dt)
      const progress = Math.min(1, dt / DURATION)
      onIntroTick?.(progress)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // DPR scaling for razor-sharp rendering on Retina/4K displays
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.resetTransform()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      // -----------------------------------------------------------
      // PHASE 1: WINE GLASSES POURING COINS (t: 0.0 to 1.5s)
      // -----------------------------------------------------------
      const glassesRetract = smootherstep(0.25, 0.38, progress)
      const glassesAlpha = (1 - glassesRetract) * smoothstep(0.01, 0.06, progress)

      if (glassesAlpha > 0.01) {
        ctx.save()
        ctx.globalAlpha = glassesAlpha

        // Scale wine glasses to 1.35x to match the large silver coins
        const glassScale = isMobile ? 1.05 : 1.35

        // 1. Left Crystal Wine Glass (tilts rightward into lavish pour)
        const leftTilt = smootherstep(0.04, 0.22, progress) * 58
        const leftX = w * (0.07 - glassesRetract * 0.12)
        const leftY = h * 0.15
        drawCrystalGlass(ctx, leftX, leftY, leftTilt, false, glassScale)

        // 2. Right Crystal Wine Glass (tilts leftward into lavish pour)
        const rightTilt = smootherstep(0.05, 0.23, progress) * -58
        const rightX = w * (0.93 + glassesRetract * 0.12)
        const rightY = h * 0.15
        drawCrystalGlass(ctx, rightX, rightY, rightTilt, true, glassScale)

        ctx.restore()
      }

      // -----------------------------------------------------------
      // PHASE 2 & 3: COIN PHYSICS, ANTIGRAVITY LIFT & RUPEE TO ORBIT
      // -----------------------------------------------------------
      const centerX = w * 0.5
      const centerY = h * 0.45
      const Rx = isMobile ? w * 0.42 : w * 0.44
      const Ry = isMobile ? h * 0.40 : h * 0.44

      // Large coin diameter calibrated to match DOM ring coins (52px to 68px)
      const baseCoinDiameter = isMobile ? 48 : Math.min(68, Math.max(54, w * 0.046))

      // Glyph scale calibrated so the larger coins assemble into a bold, legible ₹ symbol
      const glyphScale = isMobile ? 0.95 : Math.min(1.42, Math.max(1.10, w / 920))

      const stageFade = smootherstep(0.86, 0.99, progress)

      particlesRef.current.forEach((p, idx) => {
        const isGlyphCoin = idx < 23
        const coinT = Math.max(0, progress - p.stagger)

        if (coinT <= 0) return

        // --- 1. FALL & FLOOR BOUNCE TRAJECTORY ---
        const startX = p.fromLeft ? w * 0.09 : w * 0.91
        const startY = h * 0.16
        const targetFloorX = p.floorX * w
        const targetFloorY = p.floorY * h

        const fallU = Math.min(1, coinT / 0.17)
        const easeFall = fallU * fallU // Natural gravity acceleration

        const fallX = startX + (targetFloorX - startX) * fallU
        let fallY = startY + (targetFloorY - startY) * easeFall
        let curRot = p.landRot * fallU

        // Damped harmonic floor bounce
        if (fallU >= 1) {
          const bT = coinT - 0.17
          const bounce = Math.sin(bT * p.bounceFreq) * Math.max(0, p.bounceHeight - bT * 48)
          fallY -= Math.max(0, bounce)

          // Metallic silver coin clink on floor contact (throttled to avoid sound clutter)
          if (!soundClinksRef.current[idx]) {
            soundClinksRef.current[idx] = true
            const nowTime = performance.now()
            if (nowTime - lastClinkTimeRef.current > 45 && (idx % 2 === 0)) {
              lastClinkTimeRef.current = nowTime
              sound.clink(2600 + Math.random() * 900)
            }
          }
        }

        let curX = fallX
        let curY = fallY
        let curAlpha = Math.min(1, coinT * 7)
        let curDiameter = baseCoinDiameter * p.sizeFactor

        // --- 2. ANTIGRAVITY LIFT & MORPH STAGES ---
        if (isGlyphCoin) {
          // A. 23 Anchor Coins: Lift into Rupee Glyph
          const targetRupee = RUPEE_GLYPH_TARGETS[idx] || [0, 0]
          const rupeeX = centerX + targetRupee[0] * glyphScale
          const rupeeY = centerY + targetRupee[1] * glyphScale

          // Quintic smootherstep lift (C2 smooth, 0 jerk)
          const liftProgress = smootherstep(0.28 + (idx * 0.003), 0.50 + (idx * 0.002), progress)

          // Interpolate from floor to Rupee position
          let activeX = targetFloorX + (rupeeX - targetFloorX) * liftProgress
          let activeY = targetFloorY + (rupeeY - targetFloorY) * liftProgress
          curRot = p.landRot * (1 - liftProgress)

          // Rupee crystallization shine & achievement chime
          if (progress > 0.50 && progress < 0.60) {
            const shinePulse = Math.sin(((progress - 0.50) / 0.10) * Math.PI)
            curDiameter += shinePulse * 6

            if (!soundRupeeChimeRef.current) {
              soundRupeeChimeRef.current = true
              sound.chime()
            }
          }

          // B. Rupee Morphs into 14-Coin Orbit and Center Flare
          if (progress >= 0.56) {
            const perimeterIdx = PERIMETER_MAP.indexOf(idx)
            const isPerimeter = perimeterIdx !== -1

            if (isPerimeter) {
              // 14 perimeter coins expand out along the wide red ellipse orbit
              const orbitAngle = perimeterIdx * ((Math.PI * 2) / 14)
              const targetOrbitX = centerX + Math.cos(orbitAngle) * Rx
              const targetOrbitY = centerY + Math.sin(orbitAngle) * Ry

              const expandProgress = smootherstep(0.56 + perimeterIdx * 0.006, 0.82, progress)
              activeX = rupeeX + (targetOrbitX - rupeeX) * expandProgress
              activeY = rupeeY + (targetOrbitY - rupeeY) * expandProgress
              curAlpha = 1 - stageFade
            } else {
              // 9 inner coins implode into center (0, 0) to ignite the central flare & master coin
              const implodeProgress = smootherstep(0.56, 0.72, progress)
              activeX = rupeeX + (centerX - rupeeX) * implodeProgress
              activeY = rupeeY + (centerY - rupeeY) * implodeProgress
              curDiameter = curDiameter * (1 - implodeProgress * 0.65)
              curAlpha = 1 - implodeProgress
            }
          }

          // Blending from fall position into active lift/morph position
          if (progress < 0.32) {
            const blendToLift = smoothstep(0.26, 0.32, progress)
            curX = fallX + (activeX - fallX) * blendToLift
            curY = fallY + (activeY - fallY) * blendToLift
          } else {
            curX = activeX
            curY = activeY
          }
        } else {
          // C. 45 Ambient Cascade Coins:
          // They fall in large numbers to create the lavish cascade, bounce,
          // then gracefully float upward in zero-gravity and softly dissolve into the center
          if (progress >= 0.28) {
            const ambientLift = smootherstep(0.28 + ((idx % 12) * 0.004), 0.50, progress)
            const swirlR = (1 - ambientLift) * (w * 0.22)
            const swirlTheta = p.swirlAngle + progress * p.swirlSpeed
            const ambTargetX = centerX + Math.cos(swirlTheta) * swirlR
            const ambTargetY = centerY + Math.sin(swirlTheta) * (swirlR * 0.55)

            const ambX = targetFloorX + (ambTargetX - targetFloorX) * ambientLift
            const ambY = targetFloorY + (ambTargetY - targetFloorY) * ambientLift

            const blend = smoothstep(0.28, 0.33, progress)
            curX = fallX + (ambX - fallX) * blend
            curY = fallY + (ambY - fallY) * blend

            // Fade ambient coins softly as the ₹ symbol crystallizes
            const ambientFade = 1 - smoothstep(0.42, 0.54, progress)
            curAlpha *= ambientFade
          }
        }

        if (curAlpha > 0.01) {
          drawMintedSilverCoin(ctx, curX, curY, curDiameter, curRot, curAlpha)
        }
      })

      // -----------------------------------------------------------
      // PHASE 4: CENTRAL SPECULAR BURST & LENS FLARE (progress 0.68 to 0.86)
      // -----------------------------------------------------------
      if (progress > 0.66 && progress < 0.86) {
        const flareP = (progress - 0.66) / 0.20
        const flareAlpha = Math.sin(flareP * Math.PI)
        ctx.save()
        ctx.globalAlpha = flareAlpha * 0.90

        // Soft radial glow
        const flareGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80 * flareP)
        flareGrad.addColorStop(0, '#FFFFFF')
        flareGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.8)')
        flareGrad.addColorStop(0.7, 'rgba(203, 213, 225, 0.3)')
        flareGrad.addColorStop(1, 'transparent')

        ctx.fillStyle = flareGrad
        ctx.beginPath()
        ctx.arc(centerX, centerY, 80 * flareP, 0, Math.PI * 2)
        ctx.fill()

        // Crisp 4-point lens star flash
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2.4 * flareAlpha
        ctx.beginPath()
        ctx.moveTo(centerX - 90 * flareP, centerY)
        ctx.lineTo(centerX + 90 * flareP, centerY)
        ctx.moveTo(centerX, centerY - 90 * flareP)
        ctx.lineTo(centerX, centerY + 90 * flareP)
        ctx.stroke()

        ctx.restore()
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [w, h, isMobile, onComplete, onIntroTick])

  if (isSkipped) return null

  const isEnding = elapsed > 4600

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-auto select-none ${
        isEnding ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: elapsed < 3500 ? '#FFFFFF' : 'transparent',
        transition: 'background-color 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full pointer-events-none"
      />

      {/* Elegant Skip Pill */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/10 hover:bg-slate-900/15 backdrop-blur-md border border-slate-300/40 text-slate-800 text-[11px] font-medium tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
        aria-label="Skip cinematic intro"
      >
        <span>Skip intro</span>
        <span className="text-[9px] opacity-60">ESC</span>
      </button>
    </div>
  )
}

// -----------------------------------------------------------
// DRAW LUXURY CRYSTAL WINE GLASS (SVG-grade high-precision canvas rendering)
// -----------------------------------------------------------
function drawCrystalGlass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tiltDeg: number,
  isFlipped: boolean,
  scale: number = 1.0
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale * (isFlipped ? -1 : 1), scale)
  ctx.rotate((tiltDeg * Math.PI) / 180)

  // Crystal Glass Bowl & Stem Gradient
  const grad = ctx.createLinearGradient(-38, 0, 38, 130)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.92)')
  grad.addColorStop(0.3, 'rgba(241, 245, 249, 0.40)')
  grad.addColorStop(0.7, 'rgba(203, 213, 225, 0.30)')
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)')

  // 1. Crystal Bowl
  ctx.beginPath()
  ctx.moveTo(-36, 0)
  ctx.bezierCurveTo(-38, 60, -20, 82, 0, 90)
  ctx.bezierCurveTo(20, 82, 38, 60, 36, 0)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
  ctx.lineWidth = 2.2
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.stroke()

  // 2. Silver Coins Inside Glass Bowl
  ctx.save()
  const coinBowlGrad = ctx.createLinearGradient(-15, 25, 15, 60)
  coinBowlGrad.addColorStop(0, '#FFFFFF')
  coinBowlGrad.addColorStop(0.4, '#F1F5F9')
  coinBowlGrad.addColorStop(0.7, '#CBD5E1')
  coinBowlGrad.addColorStop(1, '#94A3B8')

  ctx.beginPath()
  ctx.arc(0, 48, 18, 0, Math.PI * 2)
  ctx.arc(-10, 35, 17, 0, Math.PI * 2)
  ctx.arc(12, 40, 17, 0, Math.PI * 2)
  ctx.fillStyle = coinBowlGrad
  ctx.fill()
  ctx.lineWidth = 1.6
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()
  ctx.restore()

  // 3. Top Rim Ellipse
  ctx.beginPath()
  ctx.ellipse(0, 0, 36, 9, 0, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)'
  ctx.lineWidth = 2.4
  ctx.stroke()

  // 4. Elegant Stem
  ctx.beginPath()
  ctx.moveTo(0, 90)
  ctx.lineTo(0, 155)
  ctx.lineWidth = 3.2
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.stroke()

  // 5. Circular Base
  ctx.beginPath()
  ctx.ellipse(0, 155, 28, 6, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.90)'
  ctx.lineWidth = 1.8
  ctx.stroke()

  // 6. Specular Highlight Caustic
  ctx.beginPath()
  ctx.moveTo(-28, 15)
  ctx.bezierCurveTo(-30, 50, -16, 72, 0, 80)
  ctx.lineWidth = 3.2
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()

  ctx.restore()
}

// -----------------------------------------------------------
// DRAW REALISTIC MINTED SILVER RUPEE COIN (Bold, High-Resolution Detail)
// -----------------------------------------------------------
function drawMintedSilverCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  diameter: number,
  rotDeg: number,
  alpha: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rotDeg * Math.PI) / 180)
  ctx.globalAlpha = alpha

  const r = diameter * 0.5

  // 1. Soft Ambient Drop Shadow
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 7

  // 2. Multi-stop Metallic Specular Radial Sheen (Pure Silver Bullion)
  const coinGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.05, 0, 0, r)
  coinGrad.addColorStop(0, '#FFFFFF')
  coinGrad.addColorStop(0.18, '#F8FAFC')
  coinGrad.addColorStop(0.48, '#E2E8F0')
  coinGrad.addColorStop(0.78, '#94A3B8')
  coinGrad.addColorStop(1, '#64748B')

  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = coinGrad
  ctx.fill()

  // Reset shadow for razor-sharp inner details
  ctx.shadowColor = 'transparent'

  // 3. Beveled Chrome Rim
  ctx.lineWidth = 2.4
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()

  // 4. Micro-Milled Inner Groove Ring
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2)
  ctx.lineWidth = 1.0
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)'
  ctx.stroke()

  // 5. Embossed Die-Cast ₹ Symbol with realistic metallic depth
  ctx.save()
  const fontSize = Math.round(r * 1.08)
  ctx.font = `bold ${fontSize}px "Times New Roman", Baskerville, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Subtle bottom specular highlight bevel for 3D pressed look
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.fillText('₹', 0.5, 1.8)

  // Crisp navy-slate pressed symbol
  ctx.fillStyle = '#0a192f'
  ctx.fillText('₹', 0, 0.5)
  ctx.restore()

  // 6. Polished Diagonal Specular Light Glint
  ctx.beginPath()
  ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.35, r * 0.16, -Math.PI / 4, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.fill()

  ctx.restore()
}
