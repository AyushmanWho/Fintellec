'use client'

import { useId, useState, type CSSProperties } from 'react'
import { Laptop, Plane, ShieldCheck, type LucideIcon } from 'lucide-react'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'

type Goal = { id: string; name: string; Icon: LucideIcon; saved: number; target: number }

const GOALS: Goal[] = [
  { id: 'laptop', name: 'New laptop', Icon: Laptop, saved: 31500, target: 85000 },
  { id: 'travel', name: 'Travel fund', Icon: Plane, saved: 50400, target: 70000 },
  { id: 'emergency', name: 'Emergency savings', Icon: ShieldCheck, saved: 62000, target: 150000 },
]

const MAX_CONTRIBUTION = 20000

function GoalRing({ basePct, totalPct, goal, saved }: { basePct: number; totalPct: number; goal: Goal; saved: number }) {
  const angle = totalPct * 3.6
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <svg viewBox="0 0 440 440" className="size-full" fill="none" aria-hidden>
        <defs>
          <linearGradient id="goal-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#65DED2" />
            <stop offset="1" stopColor="#07877F" />
          </linearGradient>
        </defs>
        <circle cx="220" cy="220" r="206" stroke="#07877F" strokeOpacity="0.12" strokeDasharray="1 7" />
        <circle cx="220" cy="220" r="168" fill="rgba(255,255,255,0.6)" stroke="#D7F5F1" strokeWidth="18" />
        <g transform="rotate(-90 220 220)">
          <circle
            cx="220"
            cy="220"
            r="168"
            stroke="#B9F0E9"
            strokeWidth="18"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${totalPct} 100`}
            style={{ transition: 'stroke-dasharray 700ms cubic-bezier(.4,0,.2,1)' }}
          />
          <circle
            cx="220"
            cy="220"
            r="168"
            stroke="url(#goal-grad)"
            strokeWidth="18"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${basePct} 100`}
            style={{ transition: 'stroke-dasharray 700ms cubic-bezier(.4,0,.2,1)' }}
          />
          {/* Ribbon trailing toward the goal */}
          <circle
            cx="220"
            cy="220"
            r="194"
            stroke="#65DED2"
            strokeOpacity="0.25"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${totalPct} 100`}
            style={{ transition: 'stroke-dasharray 700ms cubic-bezier(.4,0,.2,1)' }}
          />
          <circle
            cx="220"
            cy="220"
            r="194"
            stroke="#07877F"
            strokeWidth="1.6"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${totalPct} 100`}
            style={{ transition: 'stroke-dasharray 700ms cubic-bezier(.4,0,.2,1)' }}
          />
        </g>
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '220px 220px', transition: 'transform 700ms cubic-bezier(.4,0,.2,1)' }}>
          <circle cx="220" cy="26" r="12" fill="#65DED2" fillOpacity="0.3" />
          <circle cx="220" cy="26" r="5" fill="#fff" stroke="#07877F" strokeWidth="2" />
        </g>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <goal.Icon className="mx-auto size-5 text-teal" aria-hidden />
          <p className="mt-3 text-[clamp(3.5rem,9vw,6rem)] font-medium leading-none tracking-[-0.06em] text-navy tabular-nums">
            {Math.round(totalPct)}
            <span className="text-[0.45em] tracking-normal text-teal">%</span>
          </p>
          <p className="mt-3 font-mono text-xs text-steel">
            <span className="text-navy">{inr(saved)}</span> of {inr(goal.target)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function Savings() {
  const sliderId = useId()
  const [selected, setSelected] = useState('travel')
  const [contrib, setContrib] = useState<Record<string, number>>({ laptop: 0, travel: 5000, emergency: 0 })

  const goal = GOALS.find((g) => g.id === selected)!
  const amount = contrib[goal.id]
  const saved = Math.min(goal.target, goal.saved + amount)
  const basePct = (goal.saved / goal.target) * 100
  const totalPct = (saved / goal.target) * 100
  const remaining = goal.target - saved
  const monthsToGoal = amount > 0 ? Math.ceil((goal.target - goal.saved) / amount) : null

  return (
    <section
      id="savings"
      aria-labelledby="savings-title"
      className="relative scroll-mt-24 overflow-hidden py-24 md:py-36"
      style={{
        background:
          'radial-gradient(80% 60% at 50% 50%, rgba(99, 220, 211, 0.28) 0%, transparent 72%), radial-gradient(50% 40% at 85% 20%, rgba(184, 242, 236, 0.4) 0%, transparent 70%), linear-gradient(180deg, #E8F7F4 0%, #D8F4EF 50%, #EAF8F5 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 size-[640px] rounded-full bg-[radial-gradient(circle,rgba(101,222,210,0.28),transparent_65%)]"
      />
      <div className="relative mx-auto grid max-w-[1400px] gap-16 px-6 md:grid-cols-12 md:items-center md:px-12">
        <div className="md:col-span-6">
          <GoalRing basePct={basePct} totalPct={totalPct} goal={goal} saved={saved} />
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-teal">Savings goals</p>
          <h2
            id="savings-title"
            className="mt-5 text-balance text-[clamp(2.6rem,5.2vw,4.75rem)] font-medium leading-[0.92] tracking-[-0.045em] text-navy"
          >
            Make room for what <span className="text-teal">matters.</span>
          </h2>

          <div role="group" aria-label="Choose a goal" className="mt-10 flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={selected === g.id}
                onClick={() => setSelected(g.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                  selected === g.id ? 'border-navy bg-navy text-white' : 'border-mint bg-white/70 text-navy hover:border-teal',
                )}
              >
                <g.Icon className="size-4" aria-hidden />
                {g.name}
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-navy/10 pt-6">
            <div className="flex items-baseline justify-between">
              <label htmlFor={sliderId} className="text-[11px] font-medium uppercase tracking-[0.22em] text-steel">
                Monthly contribution
              </label>
              <output htmlFor={sliderId} className="text-2xl font-medium tracking-tight text-navy tabular-nums">
                {inr(amount)}
              </output>
            </div>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={MAX_CONTRIBUTION}
              step={500}
              value={amount}
              onChange={(e) => setContrib((c) => ({ ...c, [goal.id]: Number(e.target.value) }))}
              aria-valuetext={`${inr(amount)} per month toward ${goal.name}`}
              className="fin-range mt-4 w-full"
              style={{ '--val': `${(amount / MAX_CONTRIBUTION) * 100}%` } as CSSProperties}
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-steel">
              <span>₹0</span>
              <span>{inr(MAX_CONTRIBUTION)}</span>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-4">
            {[
              { k: 'Saved', v: inr(saved), c: 'text-navy' },
              { k: 'Target', v: inr(goal.target), c: 'text-navy' },
              { k: 'To go', v: inr(remaining), c: 'text-teal' },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-steel">{s.k}</dt>
                <dd className={cn('mt-1.5 text-base font-medium tracking-tight tabular-nums md:text-xl', s.c)}>{s.v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-pretty text-sm leading-relaxed text-steel" aria-live="polite">
            {remaining === 0
              ? `This month's contribution completes your ${goal.name.toLowerCase()} goal.`
              : monthsToGoal
                ? `At ${inr(amount)} a month, you'd reach this goal in about ${monthsToGoal} month${monthsToGoal === 1 ? '' : 's'}.`
                : 'Move the slider to see how a monthly contribution changes your progress.'}
          </p>

          <ul className="mt-10 space-y-4 border-t border-navy/10 pt-6">
            {GOALS.map((g) => {
              const s = Math.min(g.target, g.saved + contrib[g.id])
              return (
                <li key={g.id} className={cn('text-sm transition-opacity', selected === g.id ? 'opacity-100' : 'opacity-60')}>
                  <div className="flex justify-between">
                    <span className="text-navy">{g.name}</span>
                    <span className="font-mono text-xs text-steel">{Math.round((s / g.target) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-mint/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-bright to-teal transition-[width] duration-700"
                      style={{ width: `${(s / g.target) * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/80">
            Illustrative demo data · no money is moved
          </p>
        </div>
      </div>
    </section>
  )
}
