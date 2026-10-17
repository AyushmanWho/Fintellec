'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-motion'

const FEATURES = [
  {
    id: 'track',
    number: '01',
    eyebrow: 'TRACK',
    title: 'Know where it goes.',
    caption: 'Every rupee accounted for. Even that 2 AM biryani you promised you would never order again.',
    tag: 'No judgment. Just math.',
  },
  {
    id: 'plan',
    number: '02',
    eyebrow: 'PLAN',
    title: 'Give goals a place.',
    caption: 'Because "saving next month" has been active on your WhatsApp group since 2021.',
    tag: 'Goa Trip 2026? Finally.',
  },
  {
    id: 'insights',
    number: '03',
    eyebrow: 'INSIGHTS',
    title: 'See the bigger picture.',
    caption: 'Discover why 14 forgotten OTT trials are acting like silent, rent-free roommates.',
    tag: 'Gym: Paid. Visited: 0.',
  },
] as const

const clamp = (value: number) => Math.min(1, Math.max(0, value))

// Hermite cubic smoothstep for buttery, organic S-curve transitions
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min))
  return x * x * (3 - 2 * x)
}

// Ease out cubic
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value), 3)

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
          background: `radial-gradient(circle 140px at ${tilt.spotX}% ${tilt.spotY}%, rgba(184, 242, 236, 0.45), rgba(99, 220, 211, 0.12) 42%, transparent 75%)`,
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
          <span className="fintellec-wallet-reveal__tile-kicker">{feature.number} / {feature.eyebrow}</span>
          <span className="text-[9px] font-mono tracking-wide text-mint/80 bg-navy/60 px-2 py-0.5 rounded-full border border-mint/20">
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

/**
 * Scroll-controlled Fintellec brand scene.
 * Built with a high-framerate Inertial Physics Loop (Lerp) to ensure silky-smooth 60/120fps motion
 * regardless of whether scrolling with a notched mouse wheel, trackpad, or touch.
 */
export function WalletReveal() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const coinRef = useRef<HTMLDivElement>(null)
  const walletRef = useRef<HTMLDivElement>(null)
  const lidRef = useRef<HTMLDivElement>(null)
  const bloomRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const transitionRef = useRef<HTMLDivElement>(null)
  const meterRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let rafId = 0
    let target = 0
    let smooth = 0
    let isIntersecting = true
    let isRunning = false
    let scrollRange = 1
    let mobile = false

    const updateDimensions = () => {
      const stageHeight = stageRef.current?.offsetHeight ?? window.innerHeight
      scrollRange = Math.max(1, section.offsetHeight - stageHeight)
      mobile = window.innerWidth <= 640
    }

    const updateTarget = () => {
      const rect = section.getBoundingClientRect()
      target = reduced ? 0.72 : clamp(-rect.top / scrollRange)
      startLoop()
    }

    const render = (progress: number) => {
      // 1. Rupee Coin in 3D: Rotates continuously, tilts naturally, then drops smoothly into the wallet
      const spinDeg = progress * 960
      const tiltX = Math.sin(progress * Math.PI * 3.2) * 14
      const tiltZ = Math.sin(progress * Math.PI * 2.2) * 9
      const drop = smoothstep(0.16, 0.35, progress)
      const dropY = drop * 155
      const coinScale = Math.max(0.18, 1 - drop * 0.72)
      const coinFade = 1 - smoothstep(0.33, 0.40, progress)

      if (coinRef.current) {
        coinRef.current.style.opacity = String(coinFade)
        coinRef.current.style.transform = `translate3d(-50%, calc(-50% + ${dropY}px), 0) rotateY(${spinDeg}deg) rotateX(${tiltX}deg) rotateZ(${tiltZ}deg) scale(${coinScale})`
      }

      // 2. Leather Wallet Body glides in smoothly & swings its lid open in synchronization with the coin
      const walletIn = smoothstep(0.0, 0.20, progress)
      const walletOpen = smoothstep(0.14, 0.35, progress)
      if (walletRef.current) {
        const walletFade = 1 - smoothstep(0.79, 0.91, progress)
        walletRef.current.style.opacity = String(walletIn * walletFade)
        walletRef.current.style.transform = `translate3d(-50%, calc(-50% + ${(1 - walletIn) * 75 - walletOpen * 12}px), 0) scale(${0.84 + walletIn * 0.16 + walletOpen * 0.04})`
      }
      if (lidRef.current) {
        lidRef.current.style.transform = `rotateX(${-walletOpen * 86}deg) translateY(${-walletOpen * 10}px)`
      }

      // 3. Headline copy clears out smoothly before the feature cards emerge
      if (copyRef.current) {
        const copyFade = smoothstep(0.20, 0.35, progress)
        copyRef.current.style.opacity = String(1 - copyFade)
        copyRef.current.style.transform = `translate3d(0, ${-copyFade * 32}px, 0) scale(${1 - copyFade * 0.04})`
      }

      // 4. Feature Cards emerge from the open wallet with organic momentum
      tileRefs.current.forEach((tile, index) => {
        if (!tile) return
        let visibility: number
        let x = 0
        let y: number
        let rotate = 0

        if (mobile) {
          const start = 0.38 + index * 0.11
          const enter = smoothstep(start, start + 0.06, progress)
          const leave = smoothstep(start + 0.10, start + 0.16, progress)
          visibility = enter * (1 - leave)
          y = 35 - enter * 95 - leave * 35
          tile.style.transform = `translate3d(-50%, ${y}px, 0) scale(${0.82 + enter * 0.2 - leave * 0.04})`
        } else {
          const cardStart = 0.36 + index * 0.045
          const cardEnter = smoothstep(cardStart, cardStart + 0.16, progress)
          const cardExit = smoothstep(0.76, 0.88, progress)
          visibility = cardEnter * (1 - cardExit)
          const spread = Math.min(1.08, Math.max(0.72, window.innerWidth / 1220))
          const positions = [-265, 0, 265]
          x = positions[index] * spread * cardEnter
          y = 35 - cardEnter * (index === 1 ? 165 : 138) - cardExit * 65
          rotate = [-6, 0, 6][index] * cardEnter
          const exitScale = 1 - cardExit * 0.06
          tile.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotate(${rotate}deg) scale(${(0.72 + cardEnter * 0.30) * exitScale})`
        }
        tile.style.opacity = String(visibility)
        tile.style.pointerEvents = visibility > 0.05 ? 'auto' : 'none'
        tile.style.visibility = visibility > 0.01 ? 'visible' : 'hidden'
      })

      // 5. Mint-white Bloom: soft, luminous pocket aura without GPU overdraw choke
      const bloom = smoothstep(0.74, 0.88, progress)
      if (bloomRef.current) {
        const bloomFade = 1 - smoothstep(0.86, 0.94, progress)
        const bloomActive = bloom * bloomFade
        bloomRef.current.style.opacity = String(bloomActive)
        bloomRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${0.1 + bloom * 3.2})`
        bloomRef.current.style.visibility = bloomActive > 0.01 ? 'visible' : 'hidden'
      }

      // 6. Seamless direct dissolve into Hero (Pure hardware-accelerated crossfade)
      const handoff = reduced ? 0 : smoothstep(0.80, 0.94, progress)
      if (stageRef.current) {
        stageRef.current.style.pointerEvents = handoff >= 0.98 ? 'none' : 'auto'
        stageRef.current.style.setProperty('--wallet-scene-progress', String(progress))
      }
      if (transitionRef.current) {
        transitionRef.current.style.opacity = String(handoff)
      }
      if (meterRef.current) {
        meterRef.current.style.opacity = String(0.74 * (1 - smoothstep(0.75, 0.88, progress)))
      }
    }

    // Continuous Inertial Animation Loop (Spring-damped Lerp)
    const loop = () => {
      const diff = target - smooth
      if (Math.abs(diff) > 0.00008) {
        smooth += diff * 0.082
      } else {
        smooth = target
      }

      render(smooth)

      if (isIntersecting && Math.abs(target - smooth) >= 0.00008) {
        rafId = window.requestAnimationFrame(loop)
      } else {
        isRunning = false
        rafId = 0
      }
    }

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true
        rafId = window.requestAnimationFrame(loop)
      }
    }

    // IntersectionObserver to sleep when out of view
    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting
      if (entry.isIntersecting) {
        updateDimensions()
        updateTarget()
      } else if (rafId) {
        window.cancelAnimationFrame(rafId)
        rafId = 0
        isRunning = false
      }
    }, { threshold: 0.01 })
    observer.observe(section)

    updateDimensions()
    updateTarget()

    const onScroll = () => {
      if (isIntersecting) updateTarget()
    }

    const onResize = () => {
      updateDimensions()
      if (isIntersecting) updateTarget()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [reduced])

  return (
    <section ref={sectionRef} className="fintellec-wallet-reveal" aria-label="The Fintellec wallet story">
      <div ref={stageRef} className="fintellec-wallet-reveal__stage">
        <div className="fintellec-wallet-reveal__grain" aria-hidden="true" />
        <div className="fintellec-wallet-reveal__ambient" aria-hidden="true" />

        <div ref={copyRef} className="fintellec-wallet-reveal__copy">
          <p className="fintellec-wallet-reveal__eyebrow">MONEY, IN MOTION</p>
          <h1 className="fintellec-wallet-reveal__headline">
            Every rupee has<br /><span>a place to go.</span>
          </h1>
        </div>

        <div ref={coinRef} className="fintellec-wallet-reveal__coin" aria-label="Fintellec rupee coin">
          <span>₹</span>
          <small>FINTELLEC</small>
        </div>

        <div ref={walletRef} className="fintellec-wallet-reveal__wallet" aria-hidden="true">
          <div className="fintellec-wallet-reveal__wallet-inside">
            <span className="fintellec-wallet-reveal__pocket-mark">₹</span>
            <span className="fintellec-wallet-reveal__pocket-shine" />
          </div>
          <div className="fintellec-wallet-reveal__wallet-body">
            <span className="fintellec-wallet-reveal__wallet-brand">FINTELLEC</span>
            <span className="fintellec-wallet-reveal__wallet-seam" />
            <span className="fintellec-wallet-reveal__wallet-clasp" />
          </div>
          <div ref={lidRef} className="fintellec-wallet-reveal__wallet-lid">
            <span className="fintellec-wallet-reveal__lid-emblem">F</span>
            <span className="fintellec-wallet-reveal__lid-stitch" />
          </div>
        </div>

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

        <div ref={bloomRef} className="fintellec-wallet-reveal__bloom" aria-hidden="true" />
        <div ref={transitionRef} className="fintellec-wallet-reveal__transition" aria-hidden="true" />
        <div ref={meterRef} className="fintellec-wallet-reveal__scroll-meter" aria-hidden="true"><span>01</span><i /><span>04</span></div>
      </div>
    </section>
  )
}
