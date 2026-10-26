'use client'

import React, { useState } from 'react'
import {
  Eye,
  EyeOff,
  Plus,
  Wallet,
  TrendingDown,
  PiggyBank,
  Info,
  ArrowUpRight,
  Sparkles,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  Receipt,
  Target,
} from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function DashboardTab() {
  const {
    user,
    toggleHideBalance,
    setIsAddExpenseOpen,
    setIsAddGoalOpen,
    setIsIqModalOpen,
    setIsCohortDrawerOpen,
    setActiveTab,
    setIsOnboardingOpen,
    expenses,
    deleteExpense,
    goals,
  } = useAuth()

  const [trendRange, setTrendRange] = useState<'3M' | '6M' | '12M'>('12M')
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

  if (!user) return null

  const monthlyIncome = user.monthlyIncome || 30000
  const expensePct = monthlyIncome > 0 ? Math.round((user.monthlyExpense / monthlyIncome) * 100) : 0
  const healthPct = Math.max(0, 100 - expensePct)

  // Chart data based on user data
  const monthsData = [
    { month: 'Jun', spend: Math.round(user.monthlyExpense * 0.7), save: Math.round(user.balance * 0.6) },
    { month: 'Jul', spend: Math.round(user.monthlyExpense * 0.9), save: Math.round(user.balance * 0.8) },
    { month: 'Aug', spend: Math.round(user.monthlyExpense * 0.8), save: Math.round(user.balance * 0.9) },
    { month: 'Sep', spend: Math.round(user.monthlyExpense * 0.6), save: Math.round(user.balance * 0.95) },
    { month: 'Oct', spend: user.monthlyExpense, save: user.balance },
  ]

  const displayData = trendRange === '3M' ? monthsData.slice(-3) : monthsData

  // Format currency
  const formatMoney = (amount: number) => {
    if (user.hideBalance) return '₹••••'
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Active delayed goals count
  const delayedGoals = goals.filter((g) => g.status === 'caution' || g.status === 'critical')

  // Category visual styles for ledger
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'food':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'tech':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'impulse':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'travel':
        return 'bg-sky-50 text-sky-700 border-sky-200'
      case 'bills':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'lifestyle':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
      default:
        return 'bg-aqua text-teal border-mint/60'
    }
  }

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* 1. Header Greeting & Top Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet">
            HELLO
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
              <span className="font-highlight text-teal">{user.name.split(' ')[0]}</span>{' '}
              <span className="inline-block animate-wave">👋</span>
            </h1>
          </div>
          <p className="mt-1 text-sm text-steel">
            Here&apos;s how your money is doing today.{' '}
            <span className="hidden sm:inline font-mono text-xs text-navy/70 tabular-nums">
              {user.balance > 0
                ? `(₹${user.balance.toLocaleString('en-IN')} available — active liquid buffer)`
                : `(Ready to track your first expense or configure your balance)`}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleHideBalance}
            className="fintellec-specular-card flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-navy transition-all active:scale-95"
          >
            {user.hideBalance ? (
              <>
                <EyeOff className="size-3.5 text-steel" />
                <span>Show balance</span>
              </>
            ) : (
              <>
                <Eye className="size-3.5 text-steel" />
                <span>Hide balance</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddExpenseOpen(true)
              sound.snap('high')
            }}
            className="flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal/90 hover:shadow-md active:scale-95"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Calibration Reminder if never completed */}
      {!user.hasCompletedOnboarding && (
        <div className="fintellec-specular-card flex items-center justify-between rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-teal" />
            <div>
              <p className="text-xs font-bold text-navy">First-Time Setup Required</p>
              <p className="text-[11px] text-steel">Calibrate your actual opening balance and monthly income to power the decision engine.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOnboardingOpen(true)
              sound.snap('high')
            }}
            className="rounded-full bg-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal hover:text-navy transition-all"
          >
            Calibrate Now
          </button>
        </div>
      )}

      {/* 2. Four Primary Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Balance */}
        <div className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-lg transition-transform hover:-translate-y-0.5">
          <div className="absolute -right-8 -top-8 size-28 rounded-full bg-teal/20 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-mint/80 uppercase">
              TOTAL BALANCE
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-bright">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-bright tabular-nums">
              {formatMoney(user.balance)}
            </div>
            <p className="mt-1 text-xs text-mint/70 font-mono">
              Available liquid runway
            </p>
          </div>
        </div>

        {/* Card 2: Monthly Expense */}
        <div className="fintellec-specular-card rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-steel uppercase">
              MONTHLY EXPENSE
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <TrendingDown className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-navy tabular-nums">
              {formatMoney(user.monthlyExpense)}
            </div>
            <p className="mt-1 text-xs text-steel">
              <span className="font-semibold text-emerald-500 tabular-nums">{expensePct}%</span> of monthly income
            </p>
          </div>
        </div>

        {/* Card 3: Savings */}
        <div className="fintellec-specular-card rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-steel uppercase">
              SAVINGS
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <PiggyBank className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-navy tabular-nums">
              {formatMoney(user.savings)}
            </div>
            <p className="mt-1 text-xs text-steel tabular-nums">
              Target: ₹{(monthlyIncome * 0.2).toLocaleString('en-IN')}/mo
            </p>
          </div>
        </div>

        {/* Card 4: Financial IQ */}
        <div 
          onClick={() => {
            setIsIqModalOpen(true)
            sound.tick()
          }}
          className="fintellec-specular-card group cursor-pointer rounded-3xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-steel uppercase group-hover:text-teal transition-colors">
              FINANCIAL IQ
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500 border border-purple-400/30 transition-transform group-hover:scale-110">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5 text-3xl font-extrabold tracking-tight text-navy tabular-nums">
              <span>{user.financialIq}</span>
              <span className="text-sm font-semibold text-steel">/100</span>
            </div>
            <p className="mt-1 text-xs text-steel group-hover:text-teal transition-colors">
              Tap for factor breakdown →
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Cashflow Trend & Budget Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cashflow Trend Area Chart */}
        <div className="fintellec-specular-card rounded-3xl p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-steel">
                CASHFLOW TREND
              </span>
              <h2 className="text-lg font-bold text-navy">
                Spend vs Allocation Trajectory
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-navy font-medium">
                  <span className="size-2 rounded-full bg-teal" /> SPEND
                </span>
                <span className="flex items-center gap-1.5 text-navy font-medium">
                  <span className="size-2 rounded-full bg-bright" /> SAVE
                </span>
              </div>

              <div className="flex rounded-full border border-mint bg-aqua/50 p-0.5 text-xs font-mono">
                {(['3M', '6M', '12M'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setTrendRange(r)
                      sound.tick()
                    }}
                    className={cn(
                      'rounded-full px-2 py-0.5 transition-colors',
                      trendRange === r ? 'bg-navy text-white font-semibold' : 'text-steel hover:text-navy',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="mt-6 h-56 w-full relative">
            <svg className="size-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A99E" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00A99E" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63DCD3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#63DCD3" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <line x1="0" y1="40" x2="600" y2="40" stroke="#E2F5F3" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#E2F5F3" strokeDasharray="3 3" />
              <line x1="0" y1="160" x2="600" y2="160" stroke="#E2F5F3" strokeDasharray="3 3" />

              {/* Spend Curve */}
              <path
                d="M 0 140 C 150 145, 300 135, 450 140 C 520 145, 600 150, 600 150 L 600 200 L 0 200 Z"
                fill="url(#spendGrad)"
              />
              <path
                d="M 0 140 C 150 145, 300 135, 450 140 C 520 145, 600 150, 600 150"
                fill="none"
                stroke="#00A99E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Save Curve */}
              <path
                d="M 0 85 C 150 80, 300 70, 450 75 C 520 80, 600 80, 600 80 L 600 200 L 0 200 Z"
                fill="url(#saveGrad)"
              />
              <path
                d="M 0 85 C 150 80, 300 70, 450 75 C 520 80, 600 80, 600 80"
                fill="none"
                stroke="#63DCD3"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {displayData.map((d, i) => {
                const x = (i / (displayData.length - 1)) * 580 + 10
                return (
                  <g key={d.month} className="cursor-pointer" onMouseEnter={() => setHoveredMonth(i)}>
                    <circle cx={x} cy={140} r="3.5" fill="#00A99E" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={x} cy={80} r="3.5" fill="#63DCD3" stroke="#003365" strokeWidth="2" />
                  </g>
                )
              })}
            </svg>

            <div className="mt-2 flex justify-between text-[11px] font-mono text-steel">
              {displayData.map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Health Gauge */}
        <div className="fintellec-specular-card flex flex-col justify-between rounded-3xl p-6">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-steel">
              BUDGET HEALTH
            </span>
            <p className="mt-1 text-xs text-steel">
              Discretionary burn vs safe monthly cap
            </p>
          </div>

          <div className="relative my-4 flex flex-col items-center justify-center">
            <div className="relative size-40">
              <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E2F5F3"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={healthPct > 50 ? '#00A99E' : '#F59E0B'}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthPct / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold tracking-tight text-navy tabular-nums">{healthPct}%</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet">
                  HEALTHY
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-mint/60 bg-aqua/50 p-3 text-center">
            <p className="text-xs text-navy font-medium tabular-nums">
              You&apos;ve spent <span className="font-bold text-teal">₹{user.monthlyExpense.toLocaleString('en-IN')}</span> of your ₹{monthlyIncome.toLocaleString('en-IN')} monthly budget.
            </p>
            <p className="mt-0.5 text-[11px] text-steel tabular-nums">
              Burn rate: {expensePct}% consumed
            </p>
          </div>
        </div>
      </div>

      {/* 4. Active Goal Collision Card & Live Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Goal Collision Alert Box */}
        <div className="fintellec-specular-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {delayedGoals.length > 0 ? (
                <AlertTriangle className="size-5 text-orange-500" />
              ) : (
                <CheckCircle2 className="size-5 text-teal" />
              )}
              <h3 className="font-bold text-navy text-sm">Goal Collision Engine</h3>
            </div>
            <span className={cn(
              'rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold',
              delayedGoals.length > 0 ? 'bg-orange-100 text-orange-800' : 'bg-emerald-50 text-emerald-800'
            )}>
              {delayedGoals.length > 0 ? `${delayedGoals.length} Collision` : 'All Safe'}
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-mint p-4 text-center">
              <Target className="mx-auto size-6 text-teal opacity-70" />
              <p className="mt-2 text-xs font-semibold text-navy">No Active Goals Configured</p>
              <p className="mt-1 text-[11px] text-steel">
                Add a goal to activate real-time collision detection on purchases.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsAddGoalOpen(true)
                  sound.snap('high')
                }}
                className="mt-3 rounded-full bg-teal px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal/90 shadow-2xs"
              >
                + Add Your First Goal
              </button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-xs leading-relaxed text-steel">
                {delayedGoals.length > 0
                  ? `Simulated expenses are inducing delay on ${delayedGoals[0].name}.`
                  : 'All your goals are on track. Your current discretionary spending creates zero delay.'}
              </p>

              <div className="mt-4 space-y-2">
                {goals.slice(0, 3).map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-xl bg-aqua/40 p-2.5 text-xs border border-mint/60">
                    <span className="text-navy font-medium truncate">{g.name}</span>
                    <span className={cn('font-mono font-semibold tabular-nums', g.delayMonths > 0 ? 'text-orange-500' : 'text-teal')}>
                      {g.delayMonths > 0 ? `+${g.delayMonths} Mo Delay` : 'On Track'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('goals')
                  sound.snap('high')
                }}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy py-2 text-xs font-semibold text-white shadow-xs hover:bg-navy/90 transition-all"
              >
                <span>Open Goal Collision Matrix</span>
                <ArrowUpRight className="size-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Live Ledger / Recent Transactions (Operable & Clean) */}
        <div className="fintellec-specular-card rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-steel">
                LIVE LEDGER
              </span>
              <h3 className="text-base font-bold text-navy">Recent Transactions</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddExpenseOpen(true)
                sound.snap('high')
              }}
              className="text-xs font-semibold text-teal hover:underline"
            >
              + Log new
            </button>
          </div>

          {expenses.length === 0 ? (
            /* Clean Slate Empty State for New Users */
            <div className="my-6 rounded-2xl border border-dashed border-mint/80 bg-aqua/30 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white border border-mint shadow-2xs text-teal">
                <Receipt className="size-6" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-navy">Your Ledger is Clean</h4>
              <p className="mt-1 text-xs text-steel max-w-sm mx-auto">
                No transactions recorded yet. Tap below to log your first coffee, groceries, or subscription.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsAddExpenseOpen(true)
                  sound.snap('high')
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-xs font-bold text-white hover:bg-teal/90 shadow-sm transition-all"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Record First Expense</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-mint/40">
              {expenses.map((exp) => (
                <div key={exp.id} className="group flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex size-9 items-center justify-center rounded-xl border text-sm', getCategoryStyle(exp.category))}>
                      {exp.category === 'food' && '☕'}
                      {exp.category === 'tech' && '💻'}
                      {exp.category === 'impulse' && '🌙'}
                      {exp.category === 'travel' && '🚕'}
                      {exp.category === 'bills' && '📄'}
                      {exp.category === 'lifestyle' && '🛍️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-navy">{exp.title}</span>
                        {exp.category === 'impulse' && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[9px] font-mono text-red-600 font-semibold">
                            Impulse
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-steel">
                        {exp.date} • {exp.time} • <span className="font-mono">{exp.account}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-navy">
                        -{formatMoney(exp.amount)}
                      </div>
                      <span className="text-[10px] text-steel font-mono">Deducted</span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="opacity-0 group-hover:opacity-100 text-steel hover:text-red-600 p-1 rounded-md transition-opacity"
                      title="Remove transaction"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
