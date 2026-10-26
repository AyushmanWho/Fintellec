'use client'

import React from 'react'
import { X, Trophy, ShieldCheck, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

export function FinancialIqModal() {
  const { isIqModalOpen, setIsIqModalOpen, user } = useAuth()
  if (!isIqModalOpen || !user) return null

  const factors = [
    { title: 'Payment Discipline & Zero-Bounce', weight: '35%', score: 85, color: 'bg-emerald-500', desc: 'No bounced UPI or debit card mandates in the last 180 days.' },
    { title: 'Safe Buffer Runway (Days)', weight: '30%', score: 42, color: 'bg-teal', desc: '42 days of operational liquid cash preserved in primary accounts.' },
    { title: 'Discretionary Burn Control', weight: '20%', score: 36, color: 'bg-amber-500', desc: 'Late night 1 AM - 3 AM impulse purchases slightly eroding score.' },
    { title: 'Goal Trajectory Resilience', weight: '15%', score: 55, color: 'bg-orange-400', desc: 'Secondary Goa Trip goal currently delayed by 2.5 months.' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-mint/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
        <button
          type="button"
          onClick={() => {
            setIsIqModalOpen(false)
            sound.tick()
          }}
          className="absolute right-5 top-5 rounded-full p-1.5 text-steel hover:bg-mint/30 hover:text-navy transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-teal text-white shadow-xs">
            <Trophy className="size-6" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet">
              SCORING METHODOLOGY
            </span>
            <h2 className="text-xl font-extrabold text-navy">Financial IQ Breakdown</h2>
          </div>
        </div>

        {/* Current Score Pill */}
        <div className="mt-5 rounded-2xl border border-teal/40 bg-aqua/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-steel font-mono uppercase">Current Rating</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-navy">{user.financialIq}</span>
              <span className="text-sm font-semibold text-steel font-mono">/ 100</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                Grade: Developing
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-steel font-mono uppercase">Next Milestone</p>
            <span className="text-sm font-bold text-teal font-mono">65/100 (Resilient)</span>
          </div>
        </div>

        {/* Factors List */}
        <div className="mt-5 space-y-3.5">
          {factors.map((f) => (
            <div key={f.title} className="rounded-xl border border-mint/60 bg-white p-3 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-navy">{f.title}</span>
                <span className="font-mono text-steel text-[11px]">Weight: {f.weight}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-aqua overflow-hidden">
                <div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.score}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-steel">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Fold Cheeky Action Advice */}
        <div className="mt-5 rounded-2xl border border-mint/80 bg-aqua/40 p-3.5 text-xs text-navy">
          <div className="flex items-center gap-1.5 font-bold text-teal">
            <Sparkles className="size-3.5" />
            <span>How to gain +12 IQ points this week:</span>
          </div>
          <p className="mt-1 text-[11px] text-steel leading-relaxed">
            Resist 1 midnight food delivery order and apply the 45-day delay to any purchase over ₹5,000. Your wallet will thank you, and your score will leap to 62.
          </p>
        </div>
      </div>
    </div>
  )
}
