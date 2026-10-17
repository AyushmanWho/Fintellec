'use client'

import React from 'react'
import { LineChart, TrendingUp, Sparkles, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

export function InvestmentsTab() {
  const { user } = useAuth()
  const activeUser = user || { hideBalance: false }

  const sips = [
    { name: 'Nifty 50 Index Fund', type: 'Equity / Large Cap', monthly: 2500, totalInvested: 35000, currentValue: 41200, returns: '+17.7%' },
    { name: 'Parag Parikh Flexi Cap', type: 'Equity / Flexi', monthly: 1500, totalInvested: 18000, currentValue: 21900, returns: '+21.6%' },
    { name: 'Sovereign Gold Bond', type: 'Gold / Sovereign', monthly: 500, totalInvested: 6000, currentValue: 7100, returns: '+18.3%' },
  ]

  return (
    <div className="space-y-8 pb-28 pt-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
            SYSTEM ENGINE / APP / INVESTMENTS
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            Compounding Engine & Portfolio
          </h1>
          <p className="text-sm text-steel">
            Automated disciplined SIP allocations protected from impulsive discretionary liquidations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
            Portfolio XIRR: +19.4%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {sips.map((sip) => (
          <div key={sip.name} className="rounded-3xl border border-mint/80 bg-white/95 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-aqua px-2.5 py-0.5 text-[10px] font-mono font-bold text-navy uppercase">
                {sip.type}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                {sip.returns}
              </span>
            </div>

            <h3 className="mt-4 text-base font-bold text-navy">{sip.name}</h3>
            <p className="font-mono text-xs text-steel">Monthly SIP: ₹{sip.monthly.toLocaleString('en-IN')}</p>

            <div className="mt-4 pt-3 border-t border-mint/40 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-mono uppercase text-steel">Current Value</span>
                <div className="text-xl font-extrabold font-mono text-navy">
                  {activeUser.hideBalance ? '₹••••' : `₹${sip.currentValue.toLocaleString('en-IN')}`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-steel">Invested</span>
                <div className="text-xs font-mono text-steel">
                  {activeUser.hideBalance ? '₹••••' : `₹${sip.totalInvested.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-navy bg-navy p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] font-bold text-bright uppercase tracking-wider">
            10-YEAR TIME MACHINE PROJECTION
          </span>
          <h4 className="text-lg font-bold mt-1">Simulate Your 10-Year Growth Trajectory</h4>
          <p className="text-xs text-mint/80 max-w-xl mt-1">
            Redirecting ₹1,500 of monthly late-night impulse spending into your Nifty 50 index allocation compounds to over ₹4,20,000 by 2036.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.chime()
            window.location.hash = '#time-machine'
          }}
          className="rounded-full bg-bright px-5 py-2.5 text-xs font-bold text-navy hover:bg-bright/90 transition-all shrink-0 shadow-md"
        >
          Launch Time Machine
        </button>
      </div>
    </div>
  )
}
