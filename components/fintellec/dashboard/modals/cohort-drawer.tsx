'use client'

import React from 'react'
import { X, Users, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

export function CohortDrawer() {
  const { isCohortDrawerOpen, setIsCohortDrawerOpen } = useAuth()
  if (!isCohortDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative h-full w-full max-w-md bg-white border-l border-mint p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-mint/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-teal text-white">
                <Users className="size-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold text-teal uppercase tracking-widest">
                  SCREEN STU-02
                </span>
                <h3 className="font-bold text-navy text-base">Peer Cohort Insights</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCohortDrawerOpen(false)
                sound.tick()
              }}
              className="rounded-full p-1.5 text-steel hover:bg-aqua hover:text-navy transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Anonymized Cohort Benchmark Alert */}
          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/80 p-4">
            <div className="flex items-center gap-1.5 font-bold text-xs text-orange-900">
              <AlertTriangle className="size-4 text-orange-600" />
              <span>Empirical Cohort Warning</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-orange-950 font-medium">
              &quot;64% of young earners in your income bracket (₹25k–₹45k) who chose 6-month EMI financing reported moderate-to-severe cashflow strain by Month 3.&quot;
            </p>
          </div>

          {/* Tri-Color Behavioral Distribution Bar */}
          <div className="mt-6 rounded-2xl border border-mint/80 bg-aqua/40 p-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-navy">
              COHORT BEHAVIOR DISTRIBUTION
            </span>
            <p className="text-[11px] text-steel mt-0.5">Based on 1,420 anonymized peer telemetry streams</p>

            {/* Distribution Bar */}
            <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full shadow-inner">
              <div className="bg-emerald-500 transition-all" style={{ width: '22%' }} title="22% Kept Purchase on Track" />
              <div className="bg-amber-400 transition-all" style={{ width: '48%' }} title="48% Delayed Non-Essential Spending" />
              <div className="bg-rose-500 transition-all" style={{ width: '30%' }} title="30% Regretted Timing / Loan Structure" />
            </div>

            {/* Legend */}
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-navy">
                  <span className="size-2 rounded-full bg-emerald-500" /> Kept on track
                </span>
                <span className="font-bold text-emerald-700">22%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-navy">
                  <span className="size-2 rounded-full bg-amber-400" /> Cut non-essential spend
                </span>
                <span className="font-bold text-amber-700">48%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-navy">
                  <span className="size-2 rounded-full bg-rose-500" /> Regretted purchase timing
                </span>
                <span className="font-bold text-rose-700">30%</span>
              </div>
            </div>
          </div>

          {/* Peer Wisdom / Fold Realism */}
          <div className="mt-6 rounded-2xl border border-mint/70 bg-white p-4 shadow-2xs">
            <span className="font-mono text-[10px] font-bold text-steel uppercase tracking-wider">
              WHAT THE 22% WINNERS DID DIFFERENTLY:
            </span>
            <ul className="mt-2 space-y-2 text-xs text-navy">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-teal shrink-0 mt-0.5" />
                <span>Delayed the checkout date by 30-45 days until secondary buffer was intact.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-teal shrink-0 mt-0.5" />
                <span>Selected a 3-month tenure or Tier-2 specification instead of maxing EMI tenure.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-mint/60 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsCohortDrawerOpen(false)
              sound.triumph()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal py-3 text-xs font-bold text-white shadow-md hover:bg-teal/90 active:scale-98 transition-all"
          >
            <span>Apply Cohort Recommendation</span>
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsCohortDrawerOpen(false)}
            className="w-full py-2 text-xs font-semibold text-steel hover:text-navy text-center"
          >
            Dismiss Insights
          </button>
        </div>
      </div>
    </div>
  )
}
