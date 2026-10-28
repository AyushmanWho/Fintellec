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
const RUPEE_GLYPH_TARGETS: readonly [number, number][] = [
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
]

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
const smootherstep = (min: number, max: number, value: number) => {
  const u = clamp((value - min) / (max - min))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

const smoothstep = (min: number, max: number, value: number) => {
  const u = clamp((value - min) / (max - min))
  return u * u * (3 - 2 * u)
}

const TOTAL_COINS = 68

// Physical Coin State Interface for Real Rigid Body Dynamics
interface PhysicalCoin {
  id: number
  fromLeft: boolean
  stagger: number

  // Coordinates
  x: number
  y: number
  z: number

  // Velocities (pixels/second)
  vx: number
  vy: number
  vz: number

  // 3D Euler Angles (radians)
  pitch: number
  roll: number
  yaw: number

  // Angular velocities (radians/second)
  vPitch: number
  vRoll: number
  vYaw: number

  // Restitution & Contact Mechanics
  bounceCount: number
  floorY: number
  settled: boolean
  wobblePhase: number
  wobbleAmp: number
  restitution: number

  // Classification
  isGlyphCoin: boolean
  isPerimeter: boolean
  perimeterIdx: number
  sizeFactor: number
  alpha: number
  spawned: boolean
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
  const lastTimeRef = useRef(0)
  const rafRef = useRef(0)
  const lastAudioImpactTimeRef = useRef(0)
  const soundRupeeChimeRef = useRef(false)

  // Initialize 68 Coins with Real Physical Rigid-Body States
  const coinsRef = useRef<PhysicalCoin[]>(
    Array.from({ length: TOTAL_COINS }, (_, i) => {
      const fromLeft = i % 2 === 0
      const isGlyphCoin = i < 23
      const perimeterIdx = isGlyphCoin ? PERIMETER_MAP.indexOf(i) : -1
      const isPerimeter = perimeterIdx !== -1

      // Staggered ejection timeline: rapid pour so all 68 coins are airborne by t = 0.13
      const stagger = 0.02 + (i * 0.0016) + (Math.random() * 0.008)
      const floorY = 0.73 + (Math.random() * 0.06 - 0.03)

      return {
        id: i,
        fromLeft,
        stagger,
        x: 0,
        y: 0,
        z: (Math.random() - 0.5) * 80,
        vx: 0,
        vy: 0,
        vz: 0,
        pitch: (Math.random() - 0.5) * Math.PI,
        roll: (Math.random() - 0.5) * Math.PI,
        yaw: (Math.random() - 0.5) * Math.PI,
        vPitch: (Math.random() - 0.5) * 14,
        vRoll: (Math.random() - 0.5) * 18,
        vYaw: (Math.random() - 0.5) * 12,
        bounceCount: 0,
        floorY,
        settled: false,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 0.35 + Math.random() * 0.25,
        restitution: 0.46 + Math.random() * 0.12,
        isGlyphCoin,
        isPerimeter,
        perimeterIdx,
        sizeFactor: 0.94 + Math.random() * 0.14,
        alpha: 0,
        spawned: false
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
    lastTimeRef.current = performance.now()
    const DURATION = 5600 // 5.6s timeline for complete physical fall & dramatic antigravity

    const animate = (now: number) => {
      const dt = Math.min(0.034, Math.max(0.001, (now - lastTimeRef.current) / 1000))
      lastTimeRef.current = now

      const timeElapsed = now - startTimeRef.current
      setElapsed(timeElapsed)
      const progress = Math.min(1, timeElapsed / DURATION)
      onIntroTick?.(progress)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Retina/4K DPR scaling
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.resetTransform()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      // Center and Orbit Radii
      const centerX = w * 0.5
      const centerY = h * 0.45
      const Rx = isMobile ? w * 0.42 : w * 0.44
      const Ry = isMobile ? h * 0.40 : h * 0.44

      // Large coin diameter (54px to 68px matching DOM ring coins 1:1)
      const baseCoinDiameter = isMobile ? 48 : Math.min(68, Math.max(54, w * 0.046))
      const glyphScale = isMobile ? 0.95 : Math.min(1.42, Math.max(1.10, w / 920))

      // -----------------------------------------------------------
      // PHASE 1: WINE GLASSES POURING COINS (Fast pour so all coins fall completely)
      // -----------------------------------------------------------
      const glassesRetract = smootherstep(0.18, 0.32, progress)
      const glassesAlpha = (1 - glassesRetract) * smoothstep(0.01, 0.05, progress)

      if (glassesAlpha > 0.01) {
        ctx.save()
        ctx.globalAlpha = glassesAlpha
        const glassScale = isMobile ? 1.05 : 1.35

        // Left Wine Glass tilts rightward (0 to 58 deg)
        const leftTilt = smootherstep(0.02, 0.12, progress) * 58
        const leftX = w * (0.07 - glassesRetract * 0.12)
        const leftY = h * 0.15
        drawCrystalGlass(ctx, leftX, leftY, leftTilt, false, glassScale)

        // Right Wine Glass tilts leftward (0 to -58 deg)
        const rightTilt = smootherstep(0.02, 0.12, progress) * -58
        const rightX = w * (0.93 + glassesRetract * 0.12)
        const rightY = h * 0.15
        drawCrystalGlass(ctx, rightX, rightY, rightTilt, true, glassScale)

        ctx.restore()
      }

      // Ground Plane Specular Sheen (Grounded Floor where coins fall and rest)
      const floorVisualAlpha = smoothstep(0.06, 0.18, progress) * (1 - smoothstep(0.38, 0.48, progress))
      if (floorVisualAlpha > 0.01) {
        ctx.save()
        ctx.globalAlpha = floorVisualAlpha * 0.35
        const floorGrad = ctx.createRadialGradient(centerX, h * 0.74, 40, centerX, h * 0.74, w * 0.44)
        floorGrad.addColorStop(0, 'rgba(203, 213, 225, 0.45)')
        floorGrad.addColorStop(0.5, 'rgba(226, 232, 240, 0.18)')
        floorGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = floorGrad
        ctx.beginPath()
        ctx.ellipse(centerX, h * 0.74, w * 0.44, 18, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // -----------------------------------------------------------
      // REAL RIGID-BODY PHYSICS INTEGRATION (GRAVITY, DRAG, RESTITUTION, SPRINGS)
      // -----------------------------------------------------------
      const GRAVITY = 3100 // Strong authoritative gravity: all coins hit floor quickly and settle
      const AIR_DRAG = 0.00025
      const FRICTION = 0.28

      // Key Milestones:
      // progress < 0.38: Complete fall, multiple bounces, and resting on floor plane
      // progress >= 0.38: Antigravity lifts resting coins off the floor
      // progress >= 0.62: Rupee glyph morphs into 14-coin orbit and 9-coin center implosion
      const isAntigravityActive = progress >= 0.38
      const isMorphActive = progress >= 0.62
      const stageFade = smootherstep(0.86, 0.99, progress)

      coinsRef.current.forEach((coin) => {
        // 1. Spawning / Ejection mechanics from tilted wine glass rim
        if (!coin.spawned) {
          if (progress >= coin.stagger) {
            coin.spawned = true
            const startX = coin.fromLeft ? w * 0.09 : w * 0.91
            const startY = h * 0.165
            coin.x = startX
            coin.y = startY

            // Physical ejection velocity tangent to wine glass lip
            const ejectSpeed = 240 + Math.random() * 220
            const dirX = coin.fromLeft ? 1 : -1
            coin.vx = dirX * ejectSpeed * (0.75 + Math.random() * 0.4)
            coin.vy = -(60 + Math.random() * 120) // Initial upward launch arc over rim
            coin.vz = (Math.random() - 0.5) * 160
            coin.alpha = 1
          } else {
            return // Not yet poured
          }
        }

        const realFloorY = h * coin.floorY

        // ---------------------------------------------------------
        // A. REAL BALLISTIC GRAVITY & FLOOR IMPACT (progress < 0.28)
        // ---------------------------------------------------------
        if (!isAntigravityActive) {
          // Air Drag
          const speedSq = coin.vx * coin.vx + coin.vy * coin.vy
          coin.vx -= coin.vx * Math.sqrt(speedSq) * AIR_DRAG * dt
          coin.vy += (GRAVITY - coin.vy * Math.sqrt(speedSq) * AIR_DRAG) * dt

          // Update position
          coin.x += coin.vx * dt
          coin.y += coin.vy * dt
          coin.z += coin.vz * dt

          // Update 3D Euler rotations (tumbling in air)
          coin.pitch += coin.vPitch * dt
          coin.roll += coin.vRoll * dt
          coin.yaw += coin.vYaw * dt

          // Floor Collision Detection & Damped Restitution
          if (coin.y >= realFloorY) {
            coin.y = realFloorY

            if (coin.vy > 0) {
              const impactSpeed = Math.abs(coin.vy)

              // Metallic Coin Impact Sound Synthesis
              if (impactSpeed > 75) {
                const nowTime = performance.now()
                if (nowTime - lastAudioImpactTimeRef.current > 32) {
                  lastAudioImpactTimeRef.current = nowTime
                  const intensity = Math.min(1.0, impactSpeed / 750)
                  const pitchMultiplier = 0.88 + (coin.id % 7) * 0.04
                  sound.coinImpact(intensity, pitchMultiplier)
                }
              }

              // Restitution: bounce back upward with coefficient e
              coin.vy = -coin.vy * coin.restitution
              coin.vx *= (1 - FRICTION)
              coin.bounceCount++

              // Ground friction induces rolling torque
              coin.vRoll = coin.vRoll * 0.65 - (coin.vx / (baseCoinDiameter * 0.5)) * 0.4
              coin.vPitch *= 0.55
              coin.vYaw *= 0.55

              // Threshold check for settling into Euler's wobble
              if (impactSpeed < 55 && coin.bounceCount >= 2) {
                coin.settled = true
                coin.vy = 0
              }
            } else {
              coin.vy = 0
            }
          }

          // Euler's Disk Wobble Dynamics once settled on the floor
          if (coin.settled) {
            coin.y = realFloorY
            coin.vx *= Math.pow(0.1, dt) // Fast linear roll deceleration
            coin.wobbleAmp = Math.max(0, coin.wobbleAmp - dt * 1.6)

            // Precession frequency increases as amplitude decays
            const freq = 18 + (1 - coin.wobbleAmp) * 32
            coin.wobblePhase += freq * dt
            coin.pitch = coin.wobbleAmp * Math.sin(coin.wobblePhase)
            coin.roll += coin.vx * dt * 0.05
          }
        }

        // ---------------------------------------------------------
        // B. ANTIGRAVITY LIFT & SPRING HARMONIC ATTRACTOR (progress >= 0.28)
        // ---------------------------------------------------------
        else {
          if (coin.isGlyphCoin) {
            // Anchor Rupee Target Coordinates
            const targetRupee = RUPEE_GLYPH_TARGETS[coin.id] || [0, 0]
            const rupeeTargetX = centerX + targetRupee[0] * glyphScale
            const rupeeTargetY = centerY + targetRupee[1] * glyphScale

            let targetX = rupeeTargetX
            let targetY = rupeeTargetY
            let targetZ = 0

            // If morphing to wide orbit or center flash
            if (isMorphActive) {
              if (coin.isPerimeter) {
                const orbitAngle = coin.perimeterIdx * ((Math.PI * 2) / 14)
                const targetOrbitX = centerX + Math.cos(orbitAngle) * Rx
                const targetOrbitY = centerY + Math.sin(orbitAngle) * Ry
                const morphU = smootherstep(0.62 + coin.perimeterIdx * 0.005, 0.84, progress)
                targetX = rupeeTargetX + (targetOrbitX - rupeeTargetX) * morphU
                targetY = rupeeTargetY + (targetOrbitY - rupeeTargetY) * morphU
                coin.alpha = 1 - stageFade
              } else {
                // 9 inner coins implode into center (0, 0)
                const implodeU = smootherstep(0.62, 0.74, progress)
                targetX = rupeeTargetX + (centerX - rupeeTargetX) * implodeU
                targetY = rupeeTargetY + (centerY - rupeeTargetY) * implodeU
                coin.alpha = 1 - implodeU
              }
            }

            // Critically-Damped Spring Harmonic Physics (Hooke's Law + Stokes Drag)
            // F = -k*(x - target) - c*v
            const SPRING_K = 22.0
            const DAMPING_C = 8.8 // Near-critical damping for smooth, non-oscillating settling
            const ax = SPRING_K * (targetX - coin.x) - DAMPING_C * coin.vx
            const ay = SPRING_K * (targetY - coin.y) - DAMPING_C * coin.vy
            const az = SPRING_K * (targetZ - coin.z) - DAMPING_C * coin.vz

            coin.vx += ax * dt
            coin.vy += ay * dt
            coin.vz += az * dt
            coin.x += coin.vx * dt
            coin.y += coin.vy * dt
            coin.z += coin.vz * dt

            // Rotational alignment: coins orient smoothly to face the camera flat
            coin.pitch *= Math.pow(0.04, dt)
            coin.roll *= Math.pow(0.04, dt)
            coin.yaw *= Math.pow(0.04, dt)

            // Rupee crystallization shine & achievement chime
            if (progress > 0.54 && progress < 0.64) {
              if (!soundRupeeChimeRef.current) {
                soundRupeeChimeRef.current = true
                sound.chime()
              }
            }
          } else {
            // 45 Ambient Coins: Lift upward in microgravity, swirl gently and dissolve
            const ambientFade = 1 - smoothstep(0.44, 0.58, progress)
            coin.alpha = ambientFade

            const swirlSpeed = 3.2
            const swirlTheta = (coin.id * 0.4) + progress * swirlSpeed
            const vortexR = (1 - smoothstep(0.38, 0.58, progress)) * (w * 0.22)
            const ambTargetX = centerX + Math.cos(swirlTheta) * vortexR
            const ambTargetY = centerY + Math.sin(swirlTheta) * (vortexR * 0.5)

            // Gentle spring pull into magnetic vortex
            coin.vx += 14.0 * (ambTargetX - coin.x) * dt - 5.5 * coin.vx * dt
            coin.vy += 14.0 * (ambTargetY - coin.y) * dt - 5.5 * coin.vy * dt
            coin.x += coin.vx * dt
            coin.y += coin.vy * dt

            coin.pitch += coin.vPitch * 0.3 * dt
            coin.roll += coin.vRoll * 0.3 * dt
          }
        }

        // Draw 3D Physical Coin with Foreshortening and Specular Glint
        if (coin.alpha > 0.01) {
          const coinScale = baseCoinDiameter * coin.sizeFactor
          drawPhysical3DCoin(
            ctx,
            coin.x,
            coin.y,
            coinScale,
            coin.pitch,
            coin.roll,
            coin.yaw,
            coin.alpha
          )
        }
      })

      // -----------------------------------------------------------
      // PHASE 4: CENTRAL SPECULAR BURST & LENS FLARE (progress 0.66 to 0.86)
      // -----------------------------------------------------------
      if (progress > 0.66 && progress < 0.86) {
        const flareP = (progress - 0.66) / 0.20
        const flareAlpha = Math.sin(flareP * Math.PI)
        ctx.save()
        ctx.globalAlpha = flareAlpha * 0.90

        // Soft radial bloom
        const flareGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 85 * flareP)
        flareGrad.addColorStop(0, '#FFFFFF')
        flareGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)')
        flareGrad.addColorStop(0.7, 'rgba(203, 213, 225, 0.35)')
        flareGrad.addColorStop(1, 'transparent')

        ctx.fillStyle = flareGrad
        ctx.beginPath()
        ctx.arc(centerX, centerY, 85 * flareP, 0, Math.PI * 2)
        ctx.fill()

        // Crisp 4-point lens star flare
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2.4 * flareAlpha
        ctx.beginPath()
        ctx.moveTo(centerX - 95 * flareP, centerY)
        ctx.lineTo(centerX + 95 * flareP, centerY)
        ctx.moveTo(centerX, centerY - 95 * flareP)
        ctx.lineTo(centerX, centerY + 95 * flareP)
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

  const isEnding = elapsed > 5200

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-auto select-none ${
        isEnding ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: elapsed < 4000 ? '#FFFFFF' : 'transparent',
        transition: 'background-color 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full pointer-events-none"
      />

      {/* Glassmorphic Skip Pill */}
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
// DRAW LUXURY CRYSTAL WINE GLASS (SVG-Grade Precision Canvas Rendering)
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

  // Crystal Glass Specular Gradient
  const grad = ctx.createLinearGradient(-38, 0, 38, 130)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.94)')
  grad.addColorStop(0.3, 'rgba(241, 245, 249, 0.42)')
  grad.addColorStop(0.7, 'rgba(203, 213, 225, 0.32)')
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
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)'
  ctx.stroke()

  // 2. Stacked Silver Coins Inside Glass Bowl
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

  // 4. Crystal Stem
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
// DRAW PHYSICAL 3D COIN WITH FORESHORTENING, ROTATIONAL RIM & DIE-CAST DEPTH
// -----------------------------------------------------------
function drawPhysical3DCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  diameter: number,
  pitchRad: number,
  rollRad: number,
  yawRad: number,
  alpha: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rollRad)
  ctx.globalAlpha = alpha

  const r = diameter * 0.5

  // 3D Foreshortening ratio based on pitch angle
  // Real coin projects as an ellipse with minor axis = r * |cos(pitch)|
  const aspect = Math.max(0.12, Math.abs(Math.cos(pitchRad)))
  const ry = r * aspect
  const rimThickness = Math.max(2, (1 - aspect) * 6)

  // 1. Soft Ambient Contact Shadow
  ctx.save()
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 6
  ctx.beginPath()
  ctx.ellipse(0, rimThickness * 0.5, r, Math.max(2, ry * 0.85), 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.08)'
  ctx.fill()
  ctx.restore()

  // 2. 3D Beveled Milled Rim (Visible when coin is tilted in 3D)
  if (aspect < 0.90) {
    const rimGrad = ctx.createLinearGradient(-r, 0, r, 0)
    rimGrad.addColorStop(0, '#64748B')
    rimGrad.addColorStop(0.3, '#CBD5E1')
    rimGrad.addColorStop(0.7, '#FFFFFF')
    rimGrad.addColorStop(1, '#475569')

    ctx.fillStyle = rimGrad
    ctx.beginPath()
    ctx.ellipse(0, rimThickness, r, ry, 0, 0, Math.PI)
    ctx.ellipse(0, 0, r, ry, 0, Math.PI, 0, true)
    ctx.closePath()
    ctx.fill()
  }

  // 3. Metallic Silver Bullion Radial Specular Face
  const faceGrad = ctx.createRadialGradient(-r * 0.35, -ry * 0.35, r * 0.05, 0, 0, r)
  faceGrad.addColorStop(0, '#FFFFFF')
  faceGrad.addColorStop(0.20, '#F8FAFC')
  faceGrad.addColorStop(0.50, '#E2E8F0')
  faceGrad.addColorStop(0.80, '#94A3B8')
  faceGrad.addColorStop(1, '#64748B')

  ctx.beginPath()
  ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = faceGrad
  ctx.fill()

  // 4. Chrome Rim Bevel
  ctx.lineWidth = 2.0
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()

  // 5. Micro-Milled Inner Ring (Only when face is sufficiently open)
  if (aspect > 0.35) {
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 0.84, ry * 0.84, 0, 0, Math.PI * 2)
    ctx.lineWidth = 0.9
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)'
    ctx.stroke()

    // 6. Embossed Die-Cast ₹ Symbol with Realistic Foreshortened Depth
    ctx.save()
    // Vertically squashed font to match 3D perspective
    const fontPx = Math.round(r * 1.05)
    ctx.font = `bold ${fontPx}px "Times New Roman", Baskerville, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Apply vertical scale matrix for foreshortening
    ctx.scale(1, aspect)

    // Lower bright specular bevel shadow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.fillText('₹', 0.5, 1.8)

    // Dark navy-slate die-cast symbol
    ctx.fillStyle = '#0a192f'
    ctx.fillText('₹', 0, 0.5)
    ctx.restore()
  }

  // 7. Specular Gleam Glint (Flashes across coin face during 3D rotation)
  const glintAlpha = Math.max(0, Math.sin(pitchRad * 2 + rollRad)) * 0.35
  if (glintAlpha > 0.05 && aspect > 0.25) {
    ctx.save()
    ctx.globalAlpha = alpha * glintAlpha
    ctx.beginPath()
    ctx.ellipse(-r * 0.25, -ry * 0.25, r * 0.4, ry * 0.25, -Math.PI / 4, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}
