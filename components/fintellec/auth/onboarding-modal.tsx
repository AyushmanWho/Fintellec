'use client'

import React, { useState } from 'react'
import { CheckCircle2, Sparkles, ArrowRight, Wallet, TrendingUp, Sliders, Target, Shield } from 'lucide-react'
import { useAuth } from './auth-context'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function OnboardingModal() {
  const { user, completeOnboarding, isOnboardingOpen } = useAuth()

  const [balanceInput, setBalanceInput] = useState<string>('0')
  const [incomeInput, setIncomeInput] = useState<string>('30000')
  const [savingsPct, setSavingsPct] = useState<number>(20)
  const [goalName, setGoalName] = useState<string>('')
  const [goalTarget, setGoalTarget] = useState<string>('')
  const [workspaceChoice, setWorkspaceChoice] = useState<'personal' | 'business'>('personal')

  if (!isOnboardingOpen || !user) return null

  const parsedBalance = parseFloat(balanceInput) || 0
  const parsedIncome = parseFloat(incomeInput) || 0
  const targetSavings = Math.round((parsedIncome * savingsPct) / 100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    completeOnboarding({
      balance: parsedBalance,
      monthlyIncome: parsedIncome,
      savings: targetSavings,
      workspace: workspaceChoice,
      firstGoal: goalName.trim()
        ? {
            name: goalName.trim(),
            target: parseFloat(goalTarget) || 25000,
          }
        : undefined,
    })
    sound.triumph()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-mint/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        {/* Glow Accent */}
        <div className="absolute -right-12 -top-12 size-36 rounded-full bg-teal/20 blur-3xl pointer-events-none" />

        {/* User Greeting */}
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-navy text-base font-bold text-bright shadow-md overflow-hidden shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="size-full object-cover" />
            ) : (
              user.avatar || 'U'
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal">
                FIRST-TIME SETUP
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-mono font-bold text-emerald-800">
                Fresh Slate
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-navy">
              Welcome, {user.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-xs text-steel">
              Let&apos;s calibrate your real cockpit. Enter your opening numbers to get started.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* 1. Opening Balance */}
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Starting Liquid Balance in Bank / Cash (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-steel font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border border-mint bg-white pl-8 pr-3.5 py-2.5 text-base font-mono font-bold text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 shadow-2xs"
                autoFocus
              />
            </div>
            <p className="mt-1 text-[11px] text-steel">
              What you have available right now across your bank accounts or cash. (Can be 0).
            </p>
          </div>

          {/* 2. Monthly Income */}
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Expected Monthly Inflow / Salary / Allowance (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-steel font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder="30000"
                className="w-full rounded-2xl border border-mint bg-white pl-8 pr-3.5 py-2.5 text-base font-mono font-bold text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 shadow-2xs"
              />
            </div>
            <p className="mt-1 text-[11px] text-steel">
              Your standard monthly incoming revenue to measure safe daily spending.
            </p>
          </div>

          {/* 3. First Savings Target (Optional) */}
          <div className="rounded-2xl border border-mint/70 bg-aqua/30 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy mb-2">
              <Target className="size-3.5 text-teal" />
              <span>Set Your First Goal (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="e.g. Emergency Cushion / Goa Trip"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="rounded-xl border border-mint bg-white px-3 py-2 text-xs text-navy outline-none focus:border-teal"
              />
              <input
                type="number"
                placeholder="Target Amount (e.g. 25000)"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="rounded-xl border border-mint bg-white px-3 py-2 text-xs font-mono text-navy outline-none focus:border-teal"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-steel">
              You can also add or change goals anytime inside the Goals Collision Matrix.
            </p>
          </div>

          {/* 4. Financial Archetype */}
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Select Your Archetype
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setWorkspaceChoice('personal')
                  sound.tick()
                }}
                className={cn(
                  'rounded-xl border p-2.5 text-left transition-all',
                  workspaceChoice === 'personal'
                    ? 'border-teal bg-aqua ring-2 ring-teal/20'
                    : 'border-mint/80 bg-white hover:bg-aqua/30',
                )}
              >
                <div className="font-bold text-xs text-navy">Personal</div>
                <div className="text-[10px] text-steel">Salaried / Student budgeting</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWorkspaceChoice('business')
                  sound.tick()
                }}
                className={cn(
                  'rounded-xl border p-2.5 text-left transition-all',
                  workspaceChoice === 'business'
                    ? 'border-teal bg-aqua ring-2 ring-teal/20'
                    : 'border-mint/80 bg-white hover:bg-aqua/30',
                )}
              >
                <div className="font-bold text-xs text-navy">Freelance / Agency</div>
                <div className="text-[10px] text-steel">Volatile retainers & FCR tracking</div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal py-3 text-sm font-bold text-white shadow-md hover:bg-teal/90 active:scale-98 transition-all"
            >
              <span>Launch My Fresh Cockpit</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
