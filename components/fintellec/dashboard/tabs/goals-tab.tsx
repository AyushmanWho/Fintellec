'use client'

import React from 'react'
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function GoalsTab() {
  const { goals, deleteGoal, setIsAddGoalOpen, setIsCohortDrawerOpen, user } = useAuth()

  const delayedGoals = goals.filter((g) => g.status === 'caution' || g.status === 'critical')

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
            SYSTEM ENGINE / APP / GOALS
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            Multi-Goal Collision Matrix
          </h1>
          <p className="text-sm text-steel">
            Tracks concurrent savings targets and models real-time delay friction from simulated purchases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAddGoalOpen(true)
              sound.snap('high')
            }}
            className="flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal/90 transition-all active:scale-95"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Add Goal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsCohortDrawerOpen(true)
              sound.chime()
            }}
            className="flex items-center gap-1.5 rounded-full border border-teal/40 bg-aqua px-3.5 py-2 text-xs font-semibold text-navy shadow-xs hover:border-teal hover:bg-white transition-all"
          >
            <Sparkles className="size-3.5 text-teal" />
            <span className="hidden sm:inline">Peer Cohort (STU-02)</span>
          </button>
        </div>
      </div>

      {/* Goal Collision Alert Banner */}
      {delayedGoals.length > 0 ? (
        <div className="rounded-3xl border border-orange-200 bg-orange-50/80 p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-navy">Goal Collision Detected</h2>
                  <span className="rounded-full bg-orange-200 px-2 py-0.5 font-mono text-[10px] font-bold text-orange-900">
                    CRITICAL DELAY
                  </span>
                </div>
                <p className="mt-1 text-xs text-steel leading-relaxed">
                  Discretionary spending velocity is inducing a <strong>+{delayedGoals[0].delayMonths} Month delay</strong> on <strong className="text-navy">{delayedGoals[0].name}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-steel">Cushion threshold:</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-mono font-bold text-navy shadow-2xs border border-orange-200">
                24 Days Left
              </span>
            </div>
          </div>
        </div>
      ) : goals.length > 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Zero Goal Collisions — All targets pacing cleanly towards completion</span>
          </div>
        </div>
      ) : null}

      {/* Concurrent Goals Grid */}
      {goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-mint bg-white/60 p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-aqua text-teal border border-mint">
            <Target className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-navy">No Goals Configured Yet</h3>
          <p className="mt-1 text-xs text-steel max-w-md mx-auto">
            Add targets like an Emergency Cushion, Goa Vacation, or Tech Upgrade to start monitoring automatic friction and delay recalculation.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsAddGoalOpen(true)
              sound.snap('high')
            }}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-teal px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal/90 transition-all"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>Create Your First Target</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            const isCaution = goal.status === 'caution'

            return (
              <div
                key={goal.id}
                className={cn(
                  'group relative rounded-3xl border p-5 shadow-xs transition-all hover:shadow-md bg-white/95',
                  isCaution ? 'border-orange-300 ring-1 ring-orange-200' : 'border-mint/80',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase',
                    goal.priority === 'high' ? 'bg-navy text-white' : 'bg-aqua text-steel',
                  )}>
                    {goal.priority} Priority
                  </span>

                  <div className="flex items-center gap-2">
                    {isCaution ? (
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-mono font-bold text-orange-700">
                        <AlertTriangle className="size-3" />
                        +{goal.delayMonths} Mo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                        <CheckCircle2 className="size-3" />
                        On Track
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 text-steel hover:text-red-600 transition-opacity p-0.5"
                      title="Delete goal"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-navy truncate">{goal.name}</h3>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="font-mono text-lg font-extrabold text-navy">
                      ₹{goal.currentAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-steel font-mono"> / ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-teal">{pct}%</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-aqua">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isCaution ? 'bg-gradient-to-r from-orange-400 to-amber-500' : 'bg-gradient-to-r from-teal to-bright',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Metric Breakdown */}
                <div className="mt-4 divide-y divide-mint/40 rounded-2xl bg-aqua/40 p-3 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-steel">Monthly Plan:</span>
                    <span className="font-mono font-semibold text-navy">
                      ₹{goal.monthlyAllocation.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-steel">Timeline:</span>
                    <span className={cn('font-mono font-bold', isCaution ? 'text-orange-700' : 'text-emerald-700')}>
                      {goal.currentDate}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Alternative Path Decision Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-teal" />
          <h2 className="text-base font-bold text-navy">Alternative Path Guidance</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card A: The Delay Path */}
          <div className="rounded-3xl border border-teal/40 bg-aqua/50 p-5 shadow-xs">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal">
              RECOMMENDED STRATEGY
            </span>
            <h3 className="mt-1 text-base font-bold text-navy">The 45-Day Delay Path</h3>
            <p className="mt-1 text-xs text-steel">
              Delaying pending big-ticket purchases by 45 days completely absorbs cashflow friction, resulting in <strong>0 goal delays induced</strong>.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-3 border border-mint">
              <div>
                <p className="text-xs font-semibold text-navy">Impact: 100% On-Track</p>
                <p className="text-[11px] text-steel font-mono">Resets delays on all active targets</p>
              </div>
              <button
                type="button"
                onClick={() => sound.triumph()}
                className="rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal/90 shadow-2xs"
              >
                Apply 45d Delay
              </button>
            </div>
          </div>

          {/* Card B: The Tier-2 Model Path */}
          <div className="rounded-3xl border border-mint/90 bg-white/95 p-5 shadow-xs">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-steel">
              COST OPTIMIZATION
            </span>
            <h3 className="mt-1 text-base font-bold text-navy">The Tier-2 Model Path</h3>
            <p className="mt-1 text-xs text-steel">
              Choosing a lower-tier specification saves up to 30% on principal cost, protecting secondary goals from slippage.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-aqua/60 p-3 border border-mint/70">
              <div>
                <p className="text-xs font-semibold text-navy">Save ~25-30% upfront</p>
                <p className="text-[11px] text-steel font-mono">Buffer runway remains healthy</p>
              </div>
              <button
                type="button"
                onClick={() => sound.snap('high')}
                className="rounded-full border border-mint bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:border-teal shadow-2xs"
              >
                Simulate Tier-2
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
