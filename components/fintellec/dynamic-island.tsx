'use client'

import { useState, useEffect, useRef } from 'react'
import { sound } from '@/lib/sound'
import { inr } from '@/lib/format'
import { Coffee, TrendingUp, ShieldCheck, Flame, ChevronDown, ChevronUp, Sparkles, X, Plus, Minus } from 'lucide-react'

const TICKER_ITEMS = [
  {
    icon: '☕',
    label: 'Tapri Chai',
    amount: '₹15',
    note: 'Logged 3m ago · Budget intact',
    color: '#00A99E',
  },
  {
    icon: '⚡',
    label: 'Zepto 10-Min Flash Sale',
    amount: '₹340',
    note: 'Resisted midnight cravings! +1 Streak',
    color: '#63DCD3',
  },
  {
    icon: '📈',
    label: 'Nifty 50 Index SIP',
    amount: '₹5,000',
    note: 'Executed · Compounding at +14.2% p.a.',
    color: '#003365',
  },
  {
    icon: '🛡️',
    label: 'Safe to spend today',
    amount: '₹1,240',
    note: 'Runway buffer: 8.5 months',
    color: '#00A99E',
  },
]

export function DynamicIsland() {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [cutCount, setCutCount] = useState(3) // 3 coffees/week cut
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Auto-rotate ticker items every 4 seconds when collapsed
  useEffect(() => {
    if (expanded) return
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % TICKER_ITEMS.length)
    }, 4200)
    return () => clearInterval(intervalRef.current)
  }, [expanded])

  const toggleExpand = () => {
    const next = !expanded
    setExpanded(next)
    if (next) {
      sound.snap('high')
    } else {
      sound.snap('low')
    }
  }

  const current = TICKER_ITEMS[index]
  const weeklyCut = cutCount * 280 // e.g. ₹280 per coffee/meal avoided
  const monthlySaved = weeklyCut * 4.33
  const fiveYearCompound = Math.round(monthlySaved * 60 * 1.38) // with ~12% compound

  return (
    <aside
      aria-label="Dynamic Horizon Omni-Dock"
      className="fixed top-18 md:top-20 left-1/2 -translate-x-1/2 z-40 select-none max-w-[92vw]"
    >
      <div
        onClick={toggleExpand}
        className={`group relative cursor-pointer rounded-full border border-mint/80 bg-white/90 shadow-[0_12px_36px_-12px_rgba(0,51,101,0.28)] backdrop-blur-xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          expanded
            ? 'rounded-3xl p-5 w-[360px] md:w-[420px] bg-white/95 border-teal/40 shadow-[0_25px_60px_-15px_rgba(0,51,101,0.35)]'
            : 'px-3.5 py-1.5 flex items-center gap-3 hover:scale-[1.02] hover:border-teal/60'
        }`}
      >
        {!expanded ? (
          /* Collapsed Pill State */
          <>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-teal" />
              </span>
              <span className="text-xs">{current.icon}</span>
              <span className="font-mono text-xs font-semibold text-navy">{current.amount}</span>
            </div>

            <div className="h-3 w-px bg-steel/20" />

            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="truncate font-mono text-[11px] text-steel">
                {current.label} · <span className="text-teal font-medium">{current.note}</span>
              </span>
            </div>

            <ChevronDown className="size-3 text-steel/60 transition-transform group-hover:translate-y-0.5" />
          </>
        ) : (
          /* Expanded Vision Pro / Dynamic Island HUD */
          <div onClick={(e) => e.stopPropagation()} className="space-y-4">
            <div className="flex items-center justify-between border-b border-navy/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-teal/15 text-teal text-xs">
                  🛸
                </span>
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
                    Instant Horizon Simulator
                  </h4>
                  <p className="text-[10px] text-steel">Real-time micro-cut compounding</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleExpand}
                className="rounded-full p-1 text-steel hover:bg-navy/5 hover:text-navy"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Micro-Cut Control */}
            <div className="rounded-2xl border border-mint/70 bg-aqua/50 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-navy">Cold brews or takeout avoided / week:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCutCount(Math.max(1, cutCount - 1))
                      sound.click()
                    }}
                    className="flex size-6 items-center justify-center rounded-full bg-white border border-mint text-navy hover:bg-mint/30 shadow-xs"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-5 text-center font-mono text-xs font-bold text-teal">{cutCount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCutCount(Math.min(10, cutCount + 1))
                      sound.click()
                    }}
                    className="flex size-6 items-center justify-center rounded-full bg-white border border-mint text-navy hover:bg-mint/30 shadow-xs"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              {/* Compounding Projection Result */}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-navy/10 pt-3">
                <div>
                  <p className="text-[10px] font-mono uppercase text-steel">Monthly Saved</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-navy">{inr(Math.round(monthlySaved))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono uppercase text-teal">5-Year Wealth (12% CAGR)</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-teal">{inr(fiveYearCompound)}</p>
                </div>
              </div>
            </div>

            {/* Witty Fold Money Milestone Unlocked */}
            <div className="rounded-xl border border-teal/20 bg-teal/5 p-2.5 flex items-center gap-2 text-xs">
              <Sparkles className="size-4 shrink-0 text-teal" />
              <p className="text-[11px] text-steel">
                <strong className="text-navy">Impact:</strong> That’s your next Goa flights and Airbnb paid in full, zero guilt.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleExpand}
              className="w-full rounded-xl bg-navy py-2 text-center font-mono text-xs font-medium text-white shadow-xs hover:bg-teal transition-colors"
            >
              Minimize Omni-Dock
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
