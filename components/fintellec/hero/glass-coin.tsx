'use client'

import { useId, useState } from 'react'
import { sound } from '@/lib/sound'
import { Sparkles, RotateCcw } from 'lucide-react'

const RUPEE = 'M150 128 H252 M150 166 H252 M170 128 C 246 128, 246 214, 170 214 H158 L246 298'

const FINANCIAL_TOSSES = [
  {
    side: 'HEADS' as const,
    prompt: 'Order that ₹380 Midnight Biryani',
    tip: 'Calories are fleeting, but pure happiness is compounding.',
  },
  {
    side: 'TAILS' as const,
    prompt: 'Drink warm water and go to sleep',
    tip: 'Your bank balance will send you a thank-you letter tomorrow morning.',
  },
  {
    side: 'HEADS' as const,
    prompt: 'Split the dinner bill equally',
    tip: 'Even though Bunty ordered 2 mocktails and garlic naan for the whole table.',
  },
  {
    side: 'TAILS' as const,
    prompt: 'Itemized UPI split down to 50 paise',
    tip: 'Protect your peace and your monthly budget. Dignity above polite silence.',
  },
  {
    side: 'HEADS' as const,
    prompt: 'Buy that mechanical keyboard',
    tip: 'Convince yourself it is a mandatory ergonomic productivity enhancement.',
  },
  {
    side: 'TAILS' as const,
    prompt: 'Cancel 3 forgotten streaming services',
    tip: 'You have not opened that Scandinavian crime thriller app since 2023 anyway.',
  },
  {
    side: 'HEADS' as const,
    prompt: 'Add ₹1,000 to your index fund SIP',
    tip: 'Feel like a veteran hedge fund titan before brushing your teeth.',
  },
  {
    side: 'TAILS' as const,
    prompt: 'Resist the 10-minute grocery flash sale',
    tip: 'Do you really urgently need artisanal truffle mayonnaise at 11:45 PM?',
  },
]

/** A 400×400 sculptural glass coin with optical caustics & 3D decision toss */
export function GlassCoin() {
  const id = useId().replace(/:/g, '')
  const [flipping, setFlipping] = useState(false)
  const [decision, setDecision] = useState<typeof FINANCIAL_TOSSES[number] | null>(null)
  const [tossCount, setTossCount] = useState(0)

  const handleToss = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (flipping) return

    setFlipping(true)
    sound.coinToss()

    // Random decision outcome
    const pick = FINANCIAL_TOSSES[Math.floor(Math.random() * FINANCIAL_TOSSES.length)]

    setTimeout(() => {
      setDecision(pick)
      setFlipping(false)
      setTossCount((c) => c + 1)
      sound.chime()
    }, 1300)
  }

  return (
    <div className="relative size-[400px] [perspective:1400px]">
      {/* 1. Optical Glass Caustics & 3D Refractive Underglow (Feature 2) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[92%] h-20 w-[84%] -translate-x-1/2 rounded-[50%] bg-navy/20 blur-2xl"
      />
      {/* Caustic light projection pool */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-full opacity-60 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(99,220,211,0.55) 0%, rgba(0,169,158,0.2) 50%, transparent 72%)',
          filter: 'blur(34px)',
        }}
      />
      {/* Rotating Caustic Refraction Rays */}
      <div
        aria-hidden
        className="caustic-spin pointer-events-none absolute -inset-16 rounded-full opacity-40 mix-blend-color-dodge"
        style={{
          background:
            'conic-gradient(from 0deg at 50% 50%, rgba(99,220,211,0.65) 0deg, transparent 35deg, rgba(184,242,236,0.7) 70deg, transparent 110deg, rgba(99,220,211,0.5) 160deg, transparent 210deg, rgba(0,169,158,0.6) 260deg, transparent 315deg, rgba(99,220,211,0.65) 360deg)',
          filter: 'blur(18px)',
        }}
      />
      {/* Optical Chromatic Aberration Fringe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-30"
        style={{
          boxShadow: '0 0 50px 10px rgba(99,220,211,0.3), inset 0 0 35px rgba(0,169,158,0.25)',
        }}
      />

      {/* 2. Tactile 3D Coin & Interactive Toss Sandbox (Feature 6) */}
      <div
        onClick={handleToss}
        title="Click coin to toss for financial decisions"
        className={`group relative size-full cursor-pointer select-none [transform-style:preserve-3d] ${
          flipping ? 'coin-flipping' : 'coin-sway'
        }`}
      >
        <div
          className="absolute inset-[6px] rounded-full transition-transform duration-300 group-hover:scale-[1.015]"
          style={{
            backdropFilter: 'blur(5px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(5px) saturate(1.4)',
            background:
              'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.85) 0%, rgba(234,249,247,0.42) 36%, rgba(185,240,233,0.25) 62%, rgba(101,222,210,0.35) 100%)',
            boxShadow:
              'inset 0 0 0 1px rgba(255,255,255,0.85), inset -22px -28px 60px rgba(7,135,127,0.22), inset 16px 20px 44px rgba(255,255,255,0.7), 0 50px 90px -40px rgba(6,53,104,0.42)',
          }}
        />

        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#B9F0E9" stopOpacity="0.6" />
              <stop offset="0.7" stopColor="#07877F" stopOpacity="0.45" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id={`${id}-glyph`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#B9F0E9" />
              <stop offset="1" stopColor="#65DED2" />
            </linearGradient>
            <path id={`${id}-text`} d="M200,200 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0" />
          </defs>
          <circle cx="200" cy="200" r="194" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="2" />
          <circle
            cx="200"
            cy="200"
            r="182"
            fill="none"
            stroke="#07877F"
            strokeOpacity="0.2"
            strokeWidth="7"
            strokeDasharray="1.2 4.2"
          />
          <circle cx="200" cy="200" r="168" fill="none" stroke="#fff" strokeOpacity="0.85" />
          <circle cx="200" cy="200" r="132" fill="none" stroke="#07877F" strokeOpacity="0.14" />
          <g className="coin-spin">
            <text
              fill="#07877F"
              fillOpacity="0.5"
              fontSize="10.5"
              letterSpacing="4"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              <textPath href={`#${id}-text`} textLength="930" lengthAdjust="spacing">
                FINTELLEC · MONEY IN MOTION · TRACK · PLAN · SAVE · FINTELLEC · MONEY IN MOTION ·
              </textPath>
            </text>
          </g>
          <g transform="translate(0 -13)" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={RUPEE} stroke="#07877F" strokeOpacity="0.25" strokeWidth="16" transform="translate(4 6)" />
            <path d={RUPEE} stroke="#fff" strokeOpacity="0.95" strokeWidth="16" transform="translate(-3 -3)" />
            <path d={RUPEE} stroke={`url(#${id}-glyph)`} strokeWidth="13" />
          </g>
        </svg>

        <div aria-hidden className="absolute inset-[6px] overflow-hidden rounded-full">
          <div className="coin-sheen absolute -inset-y-16 left-1/2 w-20 -ml-10 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-md" />
        </div>
      </div>

      {/* Interactive Toss Trigger Pill (Hover / idle guide) */}
      <div className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <div className="flex items-center gap-1.5 rounded-full border border-mint/90 bg-white/80 px-3 py-1 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-teal">
          <Sparkles className="size-3 text-teal" />
          <span className="font-mono text-[10px] font-medium tracking-wide text-navy">
            {flipping ? 'Airborne in 3D...' : 'Tap coin to toss for financial decisions'}
          </span>
        </div>
      </div>

      {/* 3D Decision Result Toast (Fold Money Style Humor) */}
      {decision && (
        <div className="pointer-events-auto absolute -top-24 left-1/2 z-20 w-80 -translate-x-1/2 rounded-2xl border border-teal/40 bg-white/95 p-4 shadow-[0_20px_50px_-15px_rgba(0,51,101,0.3)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-teal">
              <span>🪙</span> {decision.side} · #{tossCount}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleToss(e)
              }}
              className="flex items-center gap-1 text-[10px] font-medium text-steel hover:text-teal"
            >
              <RotateCcw className="size-3" /> Flip again
            </button>
          </div>
          <p className="mt-2 text-sm font-semibold text-navy leading-snug">{decision.prompt}</p>
          <p className="mt-1 text-xs text-steel leading-relaxed">{decision.tip}</p>
        </div>
      )}
    </div>
  )
}
