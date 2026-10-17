'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/use-motion'

/** Scroll-controlled entrance: coin -> wallet -> mint light -> the homepage. */
export function OpeningSequence() {
  const sectionRef = useRef<HTMLElement>(null)
  const coinRef = useRef<HTMLDivElement>(null)
  const walletRef = useRef<HTMLDivElement>(null)
  const lidRef = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const tilesRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const reduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let frame = 0
    let lastY = -1
    const clamp = (n: number) => Math.min(1, Math.max(0, n))
      
    const render = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const distance = Math.max(1, section.offsetHeight - window.innerHeight)
      const p = reduced ? 0 : clamp(-rect.top / distance)
      if (Math.abs(window.scrollY - lastY) < 0.5 && !reduced) return
      lastY = window.scrollY

      // Coin: slow turn, then a fast flip and a short drop into the wallet.
      const coin = coinRef.current
      if (coin) {
        const flip = clamp((p - 0.16) / 0.28)
        const drop = clamp((p - 0.36) / 0.18)
        const opacity = 1 - clamp((p - 0.52) / 0.12)
        coin.style.opacity = String(opacity)
        coin.style.transform = `translate3d(-50%, ${-p * 18 + drop * 150}px, 0) rotateY(${p * 220 + flip * 540}deg) rotateZ(${flip * 42}deg) scale(${1 - drop * 0.72})`
      }

      // Wallet rises into frame; its lid opens as the coin lands.
      const wallet = walletRef.current
      const lid = lidRef.current
      if (wallet) {
        const appear = clamp((p - 0.22) / 0.2)
        const open = clamp((p - 0.43) / 0.2)
        wallet.style.opacity = String(appear)
        wallet.style.transform = `translate3d(-50%, ${(1 - appear) * 90}px, 0) scale(${0.82 + appear * 0.18 + open * 0.08})`
      }
      if (lid) {
        const open = clamp((p - 0.43) / 0.22)
        lid.style.transform = `translate3d(0, ${-open * 44}px, 0) rotateX(${-open * 58}deg)`
      }

      // The light expands from the wallet until it becomes the page transition.
      if (lightRef.current) {
        const bloom = clamp((p - 0.57) / 0.34)
        lightRef.current.style.opacity = String(bloom)
        lightRef.current.style.transform = `translate(-50%, -50%) scale(${0.05 + bloom * 23})`
      }
      if (copyRef.current) {
        const out = clamp((p - 0.56) / 0.18)
        copyRef.current.style.opacity = String(1 - out)
        copyRef.current.style.transform = `translate3d(0, ${-out * 24}px, 0)`
      }

      // Three glass product tiles rise from the open wallet and fan into place.
      const tileProgress = clamp((p - 0.60) / 0.25)
      const sideOffset = window.innerWidth <= 520 ? window.innerWidth * 0.31 : window.innerWidth <= 760 ? window.innerWidth * 0.29 : 218
      const tileOffsets = [
        { x: -sideOffset, y: 18, rotate: -8 },
        { x: 0, y: -28, rotate: 0 },
        { x: sideOffset, y: 18, rotate: 8 },
      ]
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return
        const stagger = clamp((tileProgress - i * 0.12) / 0.72)
        const offset = tileOffsets[i]
        tile.style.opacity = String(stagger)
        tile.style.transform = `translate3d(calc(-50% + ${offset.x * stagger}px), ${70 - stagger * (70 - offset.y)}px, 0) rotate(${offset.rotate * stagger}deg) scale(${0.78 + stagger * 0.22})`
      })
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(render)
    }
    render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <section ref={sectionRef} className="fintellec-opening" aria-label="Welcome to Fintellec">
      <div className="fintellec-opening__sticky">
        <div className="fintellec-opening__grain" aria-hidden="true" />
        <div className="fintellec-opening__glow" aria-hidden="true" />
        <div ref={copyRef} className="fintellec-opening__copy">
          <p className="fintellec-opening__eyebrow">MONEY, IN MOTION</p>
          <h1>Every rupee has<br /><span>a place to go.</span></h1>
          <p className="fintellec-opening__hint">Scroll to open your world of money <span aria-hidden="true">↓</span></p>
        </div>

        <div ref={coinRef} className="fintellec-opening__coin" aria-label="A rupee coin">
          <div className="fintellec-opening__coin-edge" />
          <div className="fintellec-opening__coin-face">
            <span className="fintellec-opening__coin-mark">₹</span>
            <span className="fintellec-opening__coin-word">FINTELLEC</span>
          </div>
        </div>

        <div ref={walletRef} className="fintellec-opening__wallet" aria-hidden="true">
          <div className="fintellec-opening__wallet-inner" />
          <div className="fintellec-opening__wallet-body">
            <span className="fintellec-opening__wallet-brand">FINTELLEC</span>
            <span className="fintellec-opening__wallet-seam" />
            <span className="fintellec-opening__wallet-clasp" />
          </div>
          <div ref={lidRef} className="fintellec-opening__wallet-lid"><span>F</span></div>
        </div>
        <div ref={lightRef} className="fintellec-opening__light" aria-hidden="true" />
        <div ref={tilesRef} className="fintellec-opening__tiles" aria-label="Track, Plan and Insights features">
          <div ref={el => { tileRefs.current[0] = el }} className="fintellec-opening__tile fintellec-opening__tile--track">
            <span className="fintellec-opening__tile-kicker">01 / TRACK</span>
            <span className="fintellec-opening__tile-icon fintellec-opening__tile-icon--track" aria-hidden="true"><i /><i /><i /><i /><i /></span>
            <strong>Know where it goes.</strong>
            <span className="fintellec-opening__tile-caption">Every rupee, accounted for.</span>
          </div>
          <div ref={el => { tileRefs.current[1] = el }} className="fintellec-opening__tile fintellec-opening__tile--plan">
            <span className="fintellec-opening__tile-kicker">02 / PLAN</span>
            <span className="fintellec-opening__tile-icon fintellec-opening__tile-icon--plan" aria-hidden="true"><i>₹</i><b>+12%</b></span>
            <strong>Give goals a place.</strong>
            <span className="fintellec-opening__tile-caption">Small steps. Real progress.</span>
          </div>
          <div ref={el => { tileRefs.current[2] = el }} className="fintellec-opening__tile fintellec-opening__tile--insights">
            <span className="fintellec-opening__tile-kicker">03 / INSIGHTS</span>
            <span className="fintellec-opening__tile-icon fintellec-opening__tile-icon--insights" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
            <strong>See the bigger picture.</strong>
            <span className="fintellec-opening__tile-caption">Your habits, made clear.</span>
          </div>
        </div>
        <div className="fintellec-opening__progress" aria-hidden="true"><span>01</span><i /><span>04</span></div>
      </div>
    </section>
  )
}
