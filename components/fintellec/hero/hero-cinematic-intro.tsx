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

// Hermite smoothstep
const smoothstep = (min: number, max: number, value: number) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

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
  const soundRupeeChimeRef = useRef(false)

  // Seeded physical particles for the pour sequence (23 coins matching the Rupee glyph)
  const particlesRef = useRef(
    Array.from({ length: 23 }, (_, i) => {
      const fromLeft = i % 2 === 0
      const stagger = 0.12 + (i * 0.024)
      return {
        id: i,
        fromLeft,
        stagger,
        // Floor landing target spread
        floorX: (0.24 + Math.random() * 0.52),
        floorY: 0.74 + (Math.random() * 0.04 - 0.02),
        // Random tilt angle on landing
        landRot: (Math.random() - 0.5) * 60,
        // Current state
        x: fromLeft ? 0.10 : 0.90,
        y: 0.14,
        vx: fromLeft ? (3.8 + Math.random() * 2.5) : (-3.8 - Math.random() * 2.5),
        vy: 1.2 + Math.random() * 1.5,
        rot: 0,
        scale: 0.85,
        alpha: 0
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
    const DURATION = 4800 // 4.8 seconds total cinematic experience

    const animate = (now: number) => {
      const dt = now - startTimeRef.current
      setElapsed(dt)
      const progress = Math.min(1, dt / DURATION)
      onIntroTick?.(progress)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // DPR scaling for razor-sharp rendering on Retina/4K
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.resetTransform()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      // -----------------------------------------------------------
      // PHASE 1: WINE GLASSES POURING COINS (t: 0.0 to 1.4s)
      // -----------------------------------------------------------
      const pourPhase = smoothstep(0.0, 0.28, progress)
      const glassesRetract = smoothstep(0.26, 0.36, progress)
      const glassesAlpha = (1 - glassesRetract) * smoothstep(0.02, 0.08, progress)

      if (glassesAlpha > 0.01) {
        ctx.save()
        ctx.globalAlpha = glassesAlpha

        // 1. Left Crystal Wine Glass (tilts rightward into pour)
        const leftTilt = smoothstep(0.05, 0.22, progress) * 54
        const leftX = w * (0.09 - glassesRetract * 0.12)
        const leftY = h * 0.16
        drawCrystalGlass(ctx, leftX, leftY, leftTilt, false)

        // 2. Right Crystal Wine Glass (tilts leftward into pour)
        const rightTilt = smoothstep(0.07, 0.24, progress) * -54
        const rightX = w * (0.91 + glassesRetract * 0.12)
        const rightY = h * 0.16
        drawCrystalGlass(ctx, rightX, rightY, rightTilt, true)

        ctx.restore()
      }

      // -----------------------------------------------------------
      // PHASE 2 & 3: COIN PHYSICS, ANTIGRAVITY & RUPEE TO ORBIT
      // -----------------------------------------------------------
      const antigravityPhase = smoothstep(0.28, 0.52, progress)
      const rupeeHold = smoothstep(0.50, 0.58, progress)
      const orbitExpand = smoothstep(0.58, 0.82, progress)
      const stageFade = smoothstep(0.86, 0.98, progress)

      // Center of assembly
      const centerX = w * 0.5
      const centerY = h * 0.45
      const Rx = isMobile ? w * 0.42 : w * 0.44
      const Ry = isMobile ? h * 0.40 : h * 0.44

      // Glyph scale dynamically calibrated to screen size
      const glyphScale = isMobile ? 0.75 : Math.min(1.15, Math.max(0.85, w / 1100))

      particlesRef.current.forEach((p, idx) => {
        let curX = p.x * w
        let curY = p.y * h
        let curAlpha = 1
        let curScale = isMobile ? 26 : 30
        let curRot = p.rot

        // 1. Pouring physics (progress < 0.28)
        if (progress < 0.32) {
          const coinT = Math.max(0, progress - p.stagger)
          if (coinT <= 0) {
            curAlpha = 0
          } else {
            curAlpha = Math.min(1, coinT * 8)
            // Parabolic fall trajectory from glass lip
            const startX = p.fromLeft ? w * 0.11 : w * 0.89
            const startY = h * 0.18
            const targetFloorX = p.floorX * w
            const targetFloorY = p.floorY * h

            const fallProgress = Math.min(1, coinT / 0.16)
            const easeFall = fallProgress * fallProgress

            curX = startX + (targetFloorX - startX) * fallProgress
            curY = startY + (targetFloorY - startY) * easeFall
            curRot = p.landRot * fallProgress

            // Gentle bounce on floor impact
            if (fallProgress >= 1) {
              const bounceT = Math.max(0, coinT - 0.16)
              const bounce = Math.sin(bounceT * 28) * Math.max(0, 14 - bounceT * 45)
              curY -= Math.max(0, bounce)

              // Subtle metallic clink on initial floor impact
              if (!soundClinksRef.current[idx]) {
                soundClinksRef.current[idx] = true
                if (idx % 3 === 0) {
                  sound.clink(2800 + Math.random() * 800)
                }
              }
            }
          }
        }
        // 2. Antigravity Lift into Rupee Glyph (progress 0.28 -> 0.58)
        else if (progress < 0.58) {
          const floorX = p.floorX * w
          const floorY = p.floorY * h
          const targetRupee = RUPEE_GLYPH_TARGETS[idx] || [0, 0]
          const rupeeX = centerX + targetRupee[0] * glyphScale
          const rupeeY = centerY + targetRupee[1] * glyphScale

          const liftEase = smoothstep(0.28 + (idx * 0.005), 0.50 + (idx * 0.003), progress)
          // Ease with natural spring deceleration
          const spring = Math.sin(liftEase * Math.PI * 0.5)

          curX = floorX + (rupeeX - floorX) * spring
          curY = floorY + (rupeeY - floorY) * spring
          curRot = p.landRot * (1 - spring)
          curAlpha = 1

          // Rupee crystallization shine & achievement chime
          if (progress > 0.50) {
            const shinePulse = Math.sin((progress - 0.50) / 0.08 * Math.PI)
            curScale += shinePulse * 4

            if (!soundRupeeChimeRef.current) {
              soundRupeeChimeRef.current = true
              sound.chime()
            }
          }
        }
        // 3. Rupee Morphs into Orbit & Master Coin (progress 0.58 -> 0.86)
        else {
          const targetRupee = RUPEE_GLYPH_TARGETS[idx] || [0, 0]
          const rupeeX = centerX + targetRupee[0] * glyphScale
          const rupeeY = centerY + targetRupee[1] * glyphScale

          const perimeterIdx = PERIMETER_MAP.indexOf(idx)
          const isPerimeter = perimeterIdx !== -1

          if (isPerimeter) {
            // Expand to the 14-coin wide red ellipse orbit!
            const orbitAngle = perimeterIdx * (Math.PI * 2 / 14)
            const targetOrbitX = centerX + Math.cos(orbitAngle) * Rx
            const targetOrbitY = centerY + Math.sin(orbitAngle) * Ry

            const expandEase = smoothstep(0.58 + perimeterIdx * 0.008, 0.82, progress)
            curX = rupeeX + (targetOrbitX - rupeeX) * expandEase
            curY = rupeeY + (targetOrbitY - rupeeY) * expandEase
            curScale = (isMobile ? 26 : 30) * (1 + expandEase * 0.12)
            curAlpha = 1 - stageFade
          } else {
            // 9 inner coins implode into center (0, 0) to spawn the Master Coin!
            const implodeEase = smoothstep(0.58, 0.72, progress)
            curX = rupeeX + (centerX - rupeeX) * implodeEase
            curY = rupeeY + (centerY - rupeeY) * implodeEase
            curScale = (isMobile ? 26 : 30) * (1 - implodeEase * 0.7)
            curAlpha = (1 - implodeEase)
          }
        }

        if (curAlpha > 0.01) {
          drawMintedSilverCoin(ctx, curX, curY, curScale, curRot, curAlpha)
        }
      })

      // -----------------------------------------------------------
      // PHASE 4: CENTRAL SPECULAR BURST & LENS FLARE (progress 0.70 to 0.86)
      // -----------------------------------------------------------
      if (progress > 0.68 && progress < 0.86) {
        const flareP = (progress - 0.68) / 0.18
        const flareAlpha = Math.sin(flareP * Math.PI)
        ctx.save()
        ctx.globalAlpha = flareAlpha * 0.85
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(centerX, centerY, 55 * flareP, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)'
        ctx.lineWidth = 2
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
  }, [w, h, isMobile, onComplete])

  if (isSkipped) return null

  const isEnding = elapsed > 4400

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-auto select-none ${
        isEnding ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: elapsed < 3300 ? '#FFFFFF' : 'transparent',
        transition: 'background-color 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
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
  isFlipped: boolean
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((tiltDeg * Math.PI) / 180)
  if (isFlipped) ctx.scale(-1, 1)

  // Crystal Glass Bowl & Stem Gradient
  const grad = ctx.createLinearGradient(-35, 0, 35, 120)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
  grad.addColorStop(0.3, 'rgba(241, 245, 249, 0.35)')
  grad.addColorStop(0.7, 'rgba(203, 213, 225, 0.25)')
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.9)')

  // 1. Crystal Bowl
  ctx.beginPath()
  ctx.moveTo(-32, 0)
  ctx.bezierCurveTo(-34, 55, -18, 75, 0, 82)
  ctx.bezierCurveTo(18, 75, 34, 55, 32, 0)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.stroke()

  // 2. Silver Coins Inside Glass Bowl
  ctx.save()
  const coinBowlGrad = ctx.createLinearGradient(-12, 26, 12, 54)
  coinBowlGrad.addColorStop(0, '#FFFFFF')
  coinBowlGrad.addColorStop(0.45, '#E2E8F0')
  coinBowlGrad.addColorStop(1, '#94A3B8')
  ctx.beginPath()
  ctx.arc(0, 42, 14, 0, Math.PI * 2)
  ctx.arc(-8, 30, 13, 0, Math.PI * 2)
  ctx.arc(10, 34, 13, 0, Math.PI * 2)
  ctx.fillStyle = coinBowlGrad
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()
  ctx.restore()

  // 3. Top Rim Ellipse
  ctx.beginPath()
  ctx.ellipse(0, 0, 32, 8, 0, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 2.2
  ctx.stroke()

  // 4. Elegant Stem
  ctx.beginPath()
  ctx.moveTo(0, 82)
  ctx.lineTo(0, 142)
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.stroke()

  // 5. Circular Base
  ctx.beginPath()
  ctx.ellipse(0, 142, 24, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.85)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 6. Specular Highlight Caustic
  ctx.beginPath()
  ctx.moveTo(-24, 15)
  ctx.bezierCurveTo(-26, 45, -14, 65, 0, 72)
  ctx.lineWidth = 3
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()

  ctx.restore()
}

// -----------------------------------------------------------
// DRAW REALISTIC MINTED SILVER RUPEE COIN
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
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 6

  // 2. Multi-stop Metallic Specular Radial Sheen
  const coinGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.05, 0, 0, r)
  coinGrad.addColorStop(0, '#FFFFFF')
  coinGrad.addColorStop(0.2, '#F1F5F9')
  coinGrad.addColorStop(0.55, '#CBD5E1')
  coinGrad.addColorStop(0.85, '#94A3B8')
  coinGrad.addColorStop(1, '#64748B')

  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = coinGrad
  ctx.fill()

  // Reset shadow for crisp inner grooves
  ctx.shadowColor = 'transparent'

  // 3. Beveled Chrome Rim
  ctx.lineWidth = 2
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()

  // 4. Milled Inner Groove Ring
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2)
  ctx.lineWidth = 0.8
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)'
  ctx.stroke()

  // 5. Embossed Die-Cast ₹ Symbol
  ctx.fillStyle = '#0F172A'
  ctx.font = `bold ${Math.round(r * 1.05)}px "Times New Roman", Baskerville, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('₹', 0, 0.5)

  ctx.restore()
}
