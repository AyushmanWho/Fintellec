'use client'

import { useState } from 'react'
import { sound } from '@/lib/sound'
import { inr, inrCompact } from '@/lib/format'
import { Clock, TrendingUp, Sparkles, Award, Shield, Layers, ArrowRight } from 'lucide-react'

const YEARS = [0, 1, 3, 5, 7, 10]

const MILESTONES: Record<number, { title: string; badge: string; joke: string; icon: string }> = {
  0: {
    title: 'Genesis: Starting The Rhythm',
    badge: 'DAY ONE',
    joke: 'Still questioning whether a ₹15 tapri chai needs to be entered in a budget spreadsheet.',
    icon: '🌱',
  },
  1: {
    title: 'Freedom Scooty Paid in Cash',
    badge: '1-YEAR BUFFER',
    joke: 'Parents secretly proud. WhatsApp family group is genuinely stunned by your financial calm.',
    icon: '🛵',
  },
  3: {
    title: 'Dream Workspace & 6-Month Runway',
    badge: 'RUNWAY ESTABLISHED',
    joke: 'Looking at flight tickets to Europe without reflexively closing the browser tab in panic.',
    icon: '💻',
  },
  5: {
    title: 'Down Payment Ready & Zero Panic',
    badge: 'MOMENTUM ACCELERATING',
    joke: 'Extended relatives start asking you for mutual fund and tax advice at wedding buffets.',
    icon: '🏡',
  },
  7: {
    title: 'Car Bought Without Crushing EMIs',
    badge: 'DEBT IMMUNITY',
    joke: 'Zero loan calls, zero high-interest traps, 100% peaceful sleep on Sunday nights.',
    icon: '🚗',
  },
  10: {
    title: 'Financial Sovereignty & Early Freedom',
    badge: 'COMPOUND SOVEREIGNTY',
    joke: 'Compound interest now generates more money in one week than your entire first annual salary.',
    icon: '🏝️',
  },
}

export function TimeMachine() {
  const [yearIndex, setYearIndex] = useState(3) // Default to 5 Years
  const [monthlySip, setMonthlySip] = useState(15000)

  const activeYear = YEARS[yearIndex]
  const milestone = MILESTONES[activeYear]

  // Monthly compound interest formula: r = 13.5% CAGR
  const r = 0.135 / 12
  const n = activeYear * 12
  const totalInvested = monthlySip * n
  const totalCompounded =
    activeYear === 0
      ? monthlySip
      : Math.round(monthlySip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r))
  const totalGains = Math.max(0, totalCompounded - totalInvested)

  const handleYearChange = (newIdx: number) => {
    setYearIndex(newIdx)
    const y = YEARS[newIdx]
    sound.tick(1600 + y * 180)
    if (y === 5 || y === 10) {
      sound.chime()
    }
  }

  // Coin stack height count
  const coinCount = Math.max(1, Math.min(24, Math.round(activeYear * 2.3 + 1)))

  return (
    <section
      id="time-machine"
      aria-labelledby="time-machine-title"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-aqua/60 to-white py-24 md:py-36"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(99,220,211,0.2),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal/30 bg-teal/5 text-teal text-xs font-mono tracking-[0.22em] uppercase mb-4 shadow-xs">
            <Clock className="size-3.5" />
            The Compounding Time Machine
          </div>
          <h2
            id="time-machine-title"
            className="text-balance text-[clamp(2.4rem,5.4vw,4.8rem)] font-medium leading-[0.96] tracking-[-0.04em] text-navy"
          >
            Fast-forward your freedom by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-bright to-teal">
              10 years.
            </span>
          </h2>
          <p className="mt-4 text-steel text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Drag the titanium dial to witness compound interest do the heavy lifting while you live your life.
          </p>
        </div>

        {/* The Compounding Machine Canvas */}
        <div className="mt-14 rounded-3xl border border-mint/90 bg-white/90 p-6 md:p-10 shadow-[0_25px_60px_-20px_rgba(0,51,101,0.25)] backdrop-blur-md">
          {/* Top Controls Grid: Monthly SIP Slider & Scrubber */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Monthly SIP Configuration (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-mint/70 bg-aqua/50 p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
                  Monthly Commitment
                </span>
                <span className="font-mono text-lg font-bold text-navy tabular-nums">
                  {inr(monthlySip)} <span className="text-xs font-normal text-steel">/mo</span>
                </span>
              </div>

              <input
                type="range"
                min="5000"
                max="50000"
                step="2500"
                value={monthlySip}
                onChange={(e) => {
                  setMonthlySip(Number(e.target.value))
                  sound.crownTick()
                }}
                className="mt-4 w-full accent-teal cursor-pointer"
              />

              <div className="mt-2 flex justify-between font-mono text-[10px] text-steel">
                <span>₹5,000 / mo</span>
                <span>Assumes 13.5% CAGR</span>
                <span>₹50,000 / mo</span>
              </div>
            </div>

            {/* Time Scrubber Dial (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
                  Compounding Horizon
                </span>
                <span className="font-mono text-xs text-teal font-bold bg-aqua px-2.5 py-0.5 rounded-full border border-mint">
                  Year {activeYear} of 10
                </span>
              </div>

              {/* Segmented Horizon Step Dial */}
              <div className="mt-4 grid grid-cols-6 gap-2">
                {YEARS.map((y, idx) => {
                  const isActive = yearIndex === idx
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearChange(idx)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl py-3 border transition-all duration-300 ${
                        isActive
                          ? 'bg-navy text-white border-navy shadow-md scale-105'
                          : 'bg-white border-mint/80 text-steel hover:border-teal hover:text-navy'
                      }`}
                    >
                      <span className="text-xs">{MILESTONES[y].icon}</span>
                      <span className="font-mono text-xs font-bold mt-1">{y === 0 ? 'Today' : `${y}Y`}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Results Visualizer Matrix */}
          <div className="mt-10 pt-8 border-t border-navy/10 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Visual 3D Physical Coin Stack & Telemetry (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-aqua/60 to-white border border-mint/70 p-8 min-h-[300px]">
              {/* Dynamic Coin Stacking Engine */}
              <div className="relative h-44 w-40 flex flex-col-reverse items-center justify-start">
                {Array.from({ length: coinCount }, (_, i) => (
                  <div
                    key={i}
                    className="h-3 w-28 rounded-full border border-white/90 shadow-xs transition-all duration-300 -mt-1.5"
                    style={{
                      background:
                        i === coinCount - 1
                          ? 'linear-gradient(90deg, #63DCD3 0%, #B8F2EC 50%, #00A99E 100%)'
                          : 'linear-gradient(90deg, #00A99E 0%, #63DCD3 50%, #003365 100%)',
                      transform: `translateY(${i * -0.5}px) scale(${1 - (coinCount - i) * 0.008})`,
                    }}
                  />
                ))}
                {/* Glowing Compounding Beam */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-10 rounded-full bg-teal/25 blur-lg"
                />
              </div>

              <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-steel">
                Physical Compounding Momentum · {coinCount} Wealth Layers
              </p>
            </div>

            {/* Compounding Financial Breakdown & Life Milestone (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Grand Total Value */}
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-steel font-medium">
                  Projected Portfolio Value
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-[clamp(2.6rem,5vw,4.2rem)] font-bold tracking-tight text-navy tabular-nums leading-none">
                    {inr(totalCompounded)}
                  </span>
                  <span className="font-mono text-sm font-semibold text-teal bg-teal/10 px-2.5 py-0.5 rounded-full border border-teal/20">
                    +{inrCompact(totalGains)} Pure Interest
                  </span>
                </div>
              </div>

              {/* Principal vs Gains Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-steel">Your Rupee Deposits: {inr(totalInvested)}</span>
                  <span className="text-teal font-semibold">Compounded Growth: {inr(totalGains)}</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-steel/15 overflow-hidden flex">
                  <div
                    className="h-full bg-navy transition-all duration-500"
                    style={{
                      width: `${totalCompounded > 0 ? (totalInvested / totalCompounded) * 100 : 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-teal to-bright transition-all duration-500"
                    style={{
                      width: `${totalCompounded > 0 ? (totalGains / totalCompounded) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Unlocked Life Milestone Card (Fold Money Style) */}
              <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{milestone.icon}</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal">
                    {milestone.badge}
                  </span>
                </div>
                <h4 className="mt-1 text-base font-semibold text-navy">{milestone.title}</h4>
                <p className="mt-1.5 text-xs text-steel leading-relaxed">
                  💡 {milestone.joke}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
