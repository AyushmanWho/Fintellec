'use client'

import React, { useState } from 'react'
import {
  BarChart3,
  PieChart,
  Clock,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Sliders,
  DollarSign,
  Layers,
} from 'lucide-react'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function AnalyticsTab() {
  const [stressScenario, setStressScenario] = useState<'conservative' | 'baseline' | 'aggressive'>('baseline')

  // FCR metrics based on scenario
  const fcrValues = {
    conservative: { pct: 54, color: 'text-red-600', band: 'Red Danger Zone (>50%)', retainers: '1.8 Retainers', hours: '11.5 Hours' },
    baseline: { pct: 36, color: 'text-amber-500', band: 'Yellow Moderate (30-50%)', retainers: '1.2 Retainers', hours: '7.5 Hours' },
    aggressive: { pct: 24, color: 'text-emerald-600', band: 'Green Safe (<30%)', retainers: '0.8 Retainers', hours: '4.8 Hours' },
  }

  const currentFcr = fcrValues[stressScenario]

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* Header */}
      <div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
          SYSTEM ENGINE / APP / ANALYTICS
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          Commitment Intelligence & Risk Analytics
        </h1>
        <p className="text-sm text-steel">
          Fixed overhead stress testing, impulse heat maps, and freelance workload unit conversion.
        </p>
      </div>

      {/* 1. Sole Proprietor & Agency Intelligence (PRD Screen SOL-01) */}
      <div className="rounded-3xl border border-mint/90 bg-white/95 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-mint/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-mono font-bold text-bright uppercase">
                SOL-01 Engine
              </span>
              <h2 className="text-lg font-bold text-navy">Fixed Commitment Ratio (FCR)</h2>
            </div>
            <p className="mt-1 text-xs text-steel">
              Formula: FCR = Fixed Monthly Overhead / Lowest Historical Monthly Revenue
            </p>
          </div>

          {/* Stress Scenario Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-steel font-mono hidden sm:inline">Stress Test:</span>
            <div className="flex rounded-full border border-mint bg-aqua/50 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setStressScenario('conservative')
                  sound.warning()
                }}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  stressScenario === 'conservative' ? 'bg-red-600 text-white font-bold' : 'text-steel hover:text-navy',
                )}
              >
                -30% Drop
              </button>
              <button
                type="button"
                onClick={() => {
                  setStressScenario('baseline')
                  sound.tick()
                }}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  stressScenario === 'baseline' ? 'bg-navy text-white font-bold' : 'text-steel hover:text-navy',
                )}
              >
                Baseline
              </button>
              <button
                type="button"
                onClick={() => {
                  setStressScenario('aggressive')
                  sound.snap('high')
                }}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  stressScenario === 'aggressive' ? 'bg-emerald-600 text-white font-bold' : 'text-steel hover:text-navy',
                )}
              >
                +20% Growth
              </button>
            </div>
          </div>
        </div>

        {/* FCR 180° Radial Arc Gauge */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-aqua/40 p-5 border border-mint/60">
            <div className="relative size-48">
              <svg className="size-full" viewBox="0 0 200 120">
                {/* 180 degree semicircle track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#D3EFEA"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Dynamic colored arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={stressScenario === 'conservative' ? '#DC2626' : stressScenario === 'baseline' ? '#F59E0B' : '#059669'}
                  strokeWidth="14"
                  strokeDasharray="251.2"
                  strokeDashoffset={`${251.2 * (1 - currentFcr.pct / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center text-center">
                <span className={cn('text-3xl font-extrabold font-mono', currentFcr.color)}>
                  {currentFcr.pct}%
                </span>
                <span className="text-[10px] font-mono font-bold uppercase text-steel">
                  FCR INDEX
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold text-navy text-center">
              Risk Band: <span className={currentFcr.color}>{currentFcr.band}</span>
            </p>
          </div>

          {/* Unit Conversion Cards (Emergent PRD Feature) */}
          <div className="flex flex-col justify-between space-y-3 lg:col-span-2">
            <div className="rounded-2xl border border-mint/70 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider font-mono">
                <Briefcase className="size-3.5 text-teal" />
                <span>Client Retainer Unit Conversion</span>
              </div>
              <p className="mt-2 text-sm text-navy leading-snug">
                Requires <strong className="text-teal font-mono text-base">{currentFcr.retainers} / month</strong> at your average retainer rate to fully offset this commitment structure.
              </p>
              <p className="mt-1 text-[11px] text-steel">
                Based on historical median retainer of ₹15,000/mo.
              </p>
            </div>

            <div className="rounded-2xl border border-mint/70 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider font-mono">
                <Clock className="size-3.5 text-teal" />
                <span>Billable Hours Break-Even</span>
              </div>
              <p className="mt-2 text-sm text-navy leading-snug">
                Requires <strong className="text-teal font-mono text-base">{currentFcr.hours} / month</strong> of additional billable work to break even without touching emergency cushion.
              </p>
              <p className="mt-1 text-[11px] text-steel">
                Calculated at effective hourly rate of ₹1,800/hr.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Impulse Hours Heat Map & Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Category Spend */}
        <div className="rounded-3xl border border-mint/80 bg-white/95 p-6 shadow-xs">
          <h2 className="text-base font-bold text-navy">Category Spend Allocation</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Food & Dining', pct: 34, color: 'bg-teal', amount: '₹1,420' },
              { label: 'Tech & Subscriptions', pct: 26, color: 'bg-navy', amount: '₹820' },
              { label: 'Late-Night Impulse', pct: 18, color: 'bg-red-400', amount: '₹540' },
              { label: 'Commute & Travel', pct: 12, color: 'bg-bright', amount: '₹360' },
              { label: 'Miscellaneous', pct: 10, color: 'bg-steel', amount: '₹220' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-navy">{cat.label}</span>
                  <span className="font-mono text-steel">{cat.amount} ({cat.pct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-aqua overflow-hidden">
                  <div className={cn('h-full rounded-full', cat.color)} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impulse Hours Heatmap */}
        <div className="rounded-3xl border border-mint/80 bg-white/95 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy">Impulse Risk Window</h2>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-red-600">
              Midnight Vulnerability
            </span>
          </div>

          <p className="mt-2 text-xs text-steel">
            Your spending patterns show a <strong>3.4x spike in impulse checkout transactions</strong> between <strong>1:00 AM and 3:30 AM</strong>.
          </p>

          <div className="mt-5 grid grid-cols-6 gap-2 text-center text-[10px] font-mono">
            {['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM'].map((hr, idx) => (
              <div
                key={hr}
                className={cn(
                  'rounded-xl p-2.5 border transition-all',
                  idx === 1 || idx === 2
                    ? 'border-red-300 bg-red-100/80 text-red-700 font-bold'
                    : 'border-mint bg-aqua/50 text-steel',
                )}
              >
                <div>{hr}</div>
                <div className="mt-1 text-[9px] opacity-75">{idx === 1 || idx === 2 ? 'HIGH RISK' : 'LOW'}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-aqua/40 p-3 text-xs text-navy border border-mint/60">
            Circadian Impulse Guard is <strong>Active</strong>. Transactions after 1:00 AM trigger a 15-minute cool-off pause.
          </div>
        </div>
      </div>
    </div>
  )
}
