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

const clamp = (v: number) => Math.max(0, Math.min(1, v))

// Quintic Hermite Smootherstep for buttery C2 transitions
const smootherstep = (min: number, max: number, value: number) => {
  const u = clamp((value - min) / (max - min))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

const smoothstep = (min: number, max: number, value: number) => {
  const u = clamp((value - min) / (max - min))
  return u * u * (3 - 2 * u)
}

const RING_COIN_COUNT = 14

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
  const hasImpactedRef = useRef(false)
  const burstAudioTriggeredRef = useRef<{ [key: number]: boolean }>({})

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
    const DURATION = 1800 // 1.8s snappy, punchy luxury tech product reveal (Slice / Apple grade)

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

      const centerX = w * 0.5
      const centerY = h * 0.45
      const Rx = isMobile ? w * 0.42 : w * 0.44
      const Ry = isMobile ? h * 0.40 : h * 0.44

      const baseCoinDiameter = isMobile ? 48 : Math.min(68, Math.max(54, w * 0.046))
      const masterCoinDiameter = isMobile ? 86 : 108

      // -----------------------------------------------------------
      // 1. MASTER COIN PLUNGE & METALLIC IMPACT (progress 0.00 -> 0.22)
      // -----------------------------------------------------------
      const impactPoint = 0.22
      let masterY = centerY
      let masterScale = 1.0
      let masterAlpha = 1.0

      if (progress < impactPoint) {
        // Accelerating fall from above
        const fallU = progress / impactPoint
        const easeFall = fallU * fallU
        masterY = centerY - (1 - easeFall) * 160
        masterScale = 0.85 + easeFall * 0.15
        masterAlpha = Math.min(1, fallU * 4)
      } else {
        // Tactile impact shockwave trigger
        if (!hasImpactedRef.current) {
          hasImpactedRef.current = true
          sound.coinImpact(0.9, 1.0)
          sound.clink(2900)
        }

        // Micro-bounce rebound upon impact
        const bounceT = progress - impactPoint
        if (bounceT < 0.12) {
          const rebound = Math.sin((bounceT / 0.12) * Math.PI) * 10
          masterY = centerY - rebound
        } else {
          masterY = centerY
        }

        // Master coin smoothly dissolves out into the DOM master coin between 0.65 -> 0.82
        masterAlpha = 1 - smoothstep(0.68, 0.82, progress)
      }

      // Draw Master Coin while intro canvas is active
      if (masterAlpha > 0.01) {
        drawMasterBullionCoin(ctx, centerX, masterY, masterCoinDiameter * masterScale, masterAlpha)
      }

      // -----------------------------------------------------------
      // 2. KINETIC SHOCKWAVE EXPANSION (progress 0.22 -> 0.70)
      // -----------------------------------------------------------
      if (progress >= impactPoint && progress < 0.75) {
        const shockU = (progress - impactPoint) / (0.75 - impactPoint)
        const maxRadius = Math.max(w, h) * 0.65
        const shockR = shockU * maxRadius
        const shockAlpha = (1 - shockU) * 0.75

        ctx.save()
        // Concentric acoustic wave ring
        ctx.beginPath()
        ctx.arc(centerX, centerY, shockR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(99, 220, 211, ${shockAlpha * 0.6})`
        ctx.lineWidth = Math.max(1, 4 * (1 - shockU))
        ctx.stroke()

        // Inner specular ring
        ctx.beginPath()
        ctx.arc(centerX, centerY, shockR * 0.82, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${shockAlpha * 0.8})`
        ctx.lineWidth = Math.max(1, 2 * (1 - shockU))
        ctx.stroke()
        ctx.restore()
      }

      // -----------------------------------------------------------
      // 3. 14 SATELLITE COINS BURST RADIALLY INTO WIDE ORBIT (progress 0.22 -> 0.90)
      // -----------------------------------------------------------
      if (progress >= impactPoint) {
        const stageFade = smootherstep(0.72, 0.92, progress)

        for (let i = 0; i < RING_COIN_COUNT; i++) {
          const baseAngle = (i / RING_COIN_COUNT) * Math.PI * 2
          const coinDelay = impactPoint + (i * 0.005)

          if (progress < coinDelay) continue

          // Outward eruption progress with Slice-style spring overshoot
          const burstU = clamp((progress - coinDelay) / 0.44)

          // Play staggered micro-clink during initial outward burst
          if (!burstAudioTriggeredRef.current[i] && burstU > 0.15) {
            burstAudioTriggeredRef.current[i] = true
            if (i % 3 === 0) {
              sound.clink(2600 + (i * 120))
            }
          }

          // Spring physics: expands outward with overshoot (1.08x), snaps back to 1.0x
          const springOvershoot = Math.sin(burstU * Math.PI) * 0.09 * (1 - burstU)
          const radiusScale = smootherstep(0, 1, burstU) + springOvershoot

          // Rotation continues smoothly into orbit speed
          const orbitSpin = (progress - impactPoint) * 0.45
          const currentAngle = baseAngle + orbitSpin

          const coinX = centerX + Math.cos(currentAngle) * (Rx * radiusScale)
          const coinY = centerY + Math.sin(currentAngle) * (Ry * radiusScale)

          // 3D rotation: tumbles during burst, settles upright facing the camera
          const tumble = (1 - burstU) * Math.PI * 2
          const coinScale = baseCoinDiameter * (0.65 + burstU * 0.35)
          const coinAlpha = Math.min(1, burstU * 5) * (1 - stageFade)

          if (coinAlpha > 0.01) {
            drawSatelliteCoin(ctx, coinX, coinY, coinScale, tumble, coinAlpha)
          }
        }
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

  const isEnding = elapsed > 1650

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-auto select-none ${
        isEnding ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: elapsed < 1200 ? '#FFFFFF' : 'transparent',
        transition: 'background-color 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full pointer-events-none"
      />

      {/* Discreet Glassmorphic Skip Pill */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/10 hover:bg-slate-900/15 backdrop-blur-md border border-slate-300/40 text-slate-800 text-[10px] font-medium tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
        aria-label="Skip intro"
      >
        <span>Skip</span>
        <span className="text-[9px] opacity-60">ESC</span>
      </button>
    </div>
  )
}

// -----------------------------------------------------------
// DRAW MINTED MASTER BULLION COIN (Central Luxury Showpiece)
// -----------------------------------------------------------
function drawMasterBullionCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  diameter: number,
  alpha: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = alpha

  const r = diameter * 0.5

  // 1. Ambient Drop Shadow
  ctx.save()
  ctx.shadowColor = 'rgba(15, 23, 42, 0.25)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 10
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.06)'
  ctx.fill()
  ctx.restore()

  // 2. Multi-Stop Specular Silver Bullion Core
  const coinGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.05, 0, 0, r)
  coinGrad.addColorStop(0, '#FFFFFF')
  coinGrad.addColorStop(0.20, '#F8FAFC')
  coinGrad.addColorStop(0.50, '#E2E8F0')
  coinGrad.addColorStop(0.80, '#94A3B8')
  coinGrad.addColorStop(1, '#64748B')

  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = coinGrad
  ctx.fill()

  // 3. Mirror-Polished Chrome Rim
  ctx.lineWidth = 3.0
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()

  // 4. Precision Milled Inner Groove Ring
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2)
  ctx.lineWidth = 1.2
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)'
  ctx.stroke()

  // 5. Embossed Die-Cast ₹ Symbol
  ctx.save()
  const fontSize = Math.round(r * 1.05)
  ctx.font = `bold ${fontSize}px "Times New Roman", Baskerville, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Sub-pixel 3D embossing highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillText('₹', 0.5, 2.0)

  // Crisp navy-slate die-cast face
  ctx.fillStyle = '#0a192f'
  ctx.fillText('₹', 0, 0.5)

  // Brand Sub-inscription
  ctx.font = `700 ${Math.round(r * 0.16)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.letterSpacing = '2px'
  ctx.fillStyle = '#007f73'
  ctx.fillText('FINTELLEC', 0, r * 0.58)
  ctx.restore()

  ctx.restore()
}

// -----------------------------------------------------------
// DRAW SATELLITE REVOLVING COIN (Minted Silver Satellite)
// -----------------------------------------------------------
function drawSatelliteCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  diameter: number,
  tumbleRad: number,
  alpha: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tumbleRad)
  ctx.globalAlpha = alpha

  const r = diameter * 0.5

  // 1. Soft Shadow
  ctx.save()
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 4
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'
  ctx.fill()
  ctx.restore()

  // 2. Silver Bullion Core
  const coinGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.05, 0, 0, r)
  coinGrad.addColorStop(0, '#FFFFFF')
  coinGrad.addColorStop(0.20, '#F8FAFC')
  coinGrad.addColorStop(0.50, '#E2E8F0')
  coinGrad.addColorStop(0.80, '#94A3B8')
  coinGrad.addColorStop(1, '#64748B')

  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = coinGrad
  ctx.fill()

  // 3. Beveled Chrome Rim
  ctx.lineWidth = 2.0
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()

  // 4. Milled Inner Groove
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2)
  ctx.lineWidth = 0.8
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)'
  ctx.stroke()

  // 5. Embossed ₹ Symbol
  ctx.save()
  ctx.font = `bold ${Math.round(r * 1.05)}px "Times New Roman", Baskerville, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.fillText('₹', 0.5, 1.5)
  ctx.fillStyle = '#0a192f'
  ctx.fillText('₹', 0, 0.5)
  ctx.restore()

  ctx.restore()
}
