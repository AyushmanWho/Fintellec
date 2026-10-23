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
        className="pointer-events-none absolute left-1/2 top-[92%] h-20 w-[84%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 30, 60, 0.22) 0%, transparent 70%)',
        }}
      />
      {/* Caustic light projection pool */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-full opacity-60 will-change-transform"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(99,220,211,0.5) 0%, rgba(99,220,211,0.25) 35%, rgba(0,169,158,0.12) 52%, transparent 72%)',
        }}
      />
      {/* Rotating Caustic Refraction Rays */}
      <div
        aria-hidden
        className="caustic-spin pointer-events-none absolute -inset-16 rounded-full opacity-40 will-change-transform"
        style={{
          transform: 'translateZ(0)',
          background:
            'conic-gradient(from 0deg at 50% 50%, rgba(99,220,211,0.5) 0deg, transparent 35deg, rgba(184,242,236,0.6) 70deg, transparent 110deg, rgba(99,220,211,0.45) 160deg, transparent 210deg, rgba(0,169,158,0.5) 260deg, transparent 315deg, rgba(99,220,211,0.5) 360deg)',
          maskImage: 'radial-gradient(circle, black 35%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle, black 35%, transparent 72%)',
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
            background:
              'radial-gradient(circle at 35% 25%, #FFFFFF 0%, #F1F4F8 22%, #D5DDE5 48%, #A8B5C2 72%, #7B8B9B 92%, #556270 100%)',
            boxShadow:
              'inset 0 0 0 1.5px rgba(255,255,255,0.95), inset -18px -24px 50px rgba(45,55,72,0.45), inset 16px 20px 40px rgba(255,255,255,0.9), 0 35px 70px -25px rgba(15,23,42,0.45)',
          }}
        />

        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="0.3" stopColor="#E2E8F0" stopOpacity="0.85" />
              <stop offset="0.65" stopColor="#718096" stopOpacity="0.6" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={`${id}-glyph`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.45" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#94A3B8" />
            </linearGradient>
            <path id={`${id}-text`} d="M200,200 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0" />
          </defs>
          <circle cx="200" cy="200" r="194" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="2.5" />
          <circle
            cx="200"
            cy="200"
            r="182"
            fill="none"
            stroke="#475569"
            strokeOpacity="0.3"
            strokeWidth="7"
            strokeDasharray="1.2 4.2"
          />
          <circle cx="200" cy="200" r="168" fill="none" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="132" fill="none" stroke="#475569" strokeOpacity="0.22" strokeWidth="1" />
          <g className="coin-spin">
            <text
              fill="#334155"
              fillOpacity="0.75"
              fontSize="10.5"
              letterSpacing="4"
              fontWeight="600"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              <textPath href={`#${id}-text`} textLength="930" lengthAdjust="spacing">
                FINTELLEC · MONEY IN MOTION · TRACK · PLAN · SAVE · FINTELLEC · MONEY IN MOTION ·
              </textPath>
            </text>
          </g>
          <g transform="translate(0 -13)" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Realistic metallic coin embossed drop shadows and chrome highlights */}
            <path d={RUPEE} stroke="#1E293B" strokeOpacity="0.4" strokeWidth="16" transform="translate(3 5)" />
            <path d={RUPEE} stroke="#FFFFFF" strokeOpacity="0.95" strokeWidth="16" transform="translate(-2 -2)" />
            <path d={RUPEE} stroke={`url(#${id}-glyph)`} strokeWidth="13" />
          </g>
        </svg>

        <div aria-hidden className="absolute inset-[6px] overflow-hidden rounded-full">
          <div className="coin-sheen absolute -inset-y-16 left-1/2 w-24 -ml-12 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm" />
        </div>
      </div>

      {/* Interactive Toss Trigger Pill (Hover / idle guide) */}
      <div className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <div className="flex items-center gap-1.5 rounded-full border border-mint/90 bg-white/80 px-3 py-1 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-teal">
          <img src="/fintellec-f.png" alt="" aria-hidden="true" className="h-4 w-auto shrink-0" />
          <span className="font-mono text-[10px] font-medium tracking-wide text-navy">
            {flipping ? 'Airborne in 3D...' : 'Tap coin to toss for financial decisions'}
          </span>
        </div>
      </div>

      {/* 3D Decision Result Toast (Fold Money Style Humor) */}
      {decision && (
        <div className={`pointer-events-auto absolute -top-24 left-1/2 z-20 w-80 -translate-x-1/2 rounded-2xl border bg-white/95 p-4 shadow-[0_20px_50px_-15px_rgba(0,51,101,0.3)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 ${
          decision.side === 'HEADS' ? 'border-amber-400/60 shadow-[0_20px_50px_-15px_rgba(245,158,11,0.25)]' : 'border-teal/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
              decision.side === 'HEADS' ? 'bg-amber-500/15 text-amber-600' : 'bg-teal/10 text-teal'
            }`}>
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
