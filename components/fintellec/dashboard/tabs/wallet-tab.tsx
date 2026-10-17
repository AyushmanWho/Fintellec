'use client'

import React from 'react'
import { Wallet, CreditCard, ArrowUpRight, ShieldCheck, RefreshCw, Plus, Building } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

export function WalletTab() {
  const { user, setIsOnboardingOpen } = useAuth()
  const activeUser = user || {
    name: 'Investor',
    email: 'investor@fintellec.com',
    archetype: 'student',
    balance: 0,
    income: 25000,
    savings: 0,
    avatar: 'AI',
    hideBalance: false,
  }

  const accounts = [
    {
      name: 'Primary Account (Salary / UPI)',
      number: 'Active Primary',
      balance: activeUser.balance,
      type: 'Checking / UPI',
      status: 'Live Synced',
    },
    {
      name: 'Emergency Savings Vault',
      number: 'Dedicated Reserve',
      balance: activeUser.savings,
      type: 'Vault',
      status: 'Protected',
    },
  ]

  return (
    <div className="space-y-8 pb-28 pt-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
            SYSTEM ENGINE / APP / WALLET
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            Linked Accounts & Liquid Runway
          </h1>
          <p className="text-sm text-steel">
            Real-time balance synchronization across your UPI handles, cards, and offline reserves.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOnboardingOpen(true)
            sound.snap('high')
          }}
          className="flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal/90 transition-all"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>Adjust Opening Balance</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {accounts.map((acc) => (
          <div key={acc.name} className="rounded-3xl border border-mint/80 bg-white/95 p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-aqua px-2.5 py-0.5 text-[10px] font-mono font-bold text-navy uppercase">
                {acc.type}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                {acc.status}
              </span>
            </div>

            <h3 className="mt-4 text-base font-bold text-navy">{acc.name}</h3>
            <p className="font-mono text-xs text-steel">{acc.number}</p>

            <div className="mt-4 pt-3 border-t border-mint/40">
              <span className="text-[10px] font-mono uppercase text-steel">Available Liquidity</span>
              <div className="text-3xl font-extrabold font-mono text-navy mt-0.5">
                {activeUser.hideBalance ? '₹••••' : `₹${acc.balance.toLocaleString('en-IN')}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-teal/30 bg-aqua/50 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-teal text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-navy text-sm">Account Aggregator Protocol (RBI Certified)</h4>
            <p className="text-xs text-steel">Encrypted end-to-end telemetry. Bank credentials are never stored on Fintellec servers.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => sound.chime()}
          className="flex items-center gap-1.5 rounded-full border border-mint bg-white px-3.5 py-1.5 text-xs font-semibold text-navy hover:border-teal"
        >
          <RefreshCw className="size-3 text-teal" />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  )
}
