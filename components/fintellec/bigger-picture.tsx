'use client'

import { useMemo, useRef, useState } from 'react'
import { inr, inrCompact } from '@/lib/format'
import { smoothPath, type Vec } from '@/lib/smooth-path'
import { useInView, useTweenedNumber } from '@/hooks/use-motion'
import { cn } from '@/lib/utils'
import { RibbonDivider } from './ribbon-divider'

const PERIODS = {
  weekly: {
    label: 'This week · 5–11 Oct',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [1240, 860, 2150, 980, 1620, 3480, 2310],
    income: 16000,
  },
  monthly: {
    label: 'Last 6 months · May–Oct',
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    values: [41200, 38900, 44600, 36800, 40300, 38420],
    income: 312000,
  },
} as const
type Period = keyof typeof PERIODS

export const CATEGORIES = [
  { name: 'Food & dining', share: 0.31, color: '#07877F' },
  { name: 'Shopping', share: 0.22, color: '#65DED2' },
  { name: 'Bills & utilities', share: 0.2, color: '#063568' },
  { name: 'Transport', share: 0.15, color: '#5FA9C9' },
  { name: 'Other', share: 0.08, color: '#B9F0E9' },
  { name: 'Subscriptions', share: 0.04, color: '#9DD9D2' },
]

const W = 1000
const H = 380
const PAD = { l: 8, r: 8, t: 30, b: 8 }

function niceMax(v: number) {
  const step = v > 20000 ? 10000 : 1000
  return Math.ceil((v * 1.2) / step) * step
}

export function BiggerPicture() {
  const [period, setPeriod] = useState<Period>('weekly')
  const [active, setActive] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const inView = useInView(chartRef, { threshold: 0.3 })
  const data = PERIODS[period]

  const chart = useMemo(() => {
    const max = niceMax(Math.max(...data.values))
    const n = data.values.length
    const pts: Vec[] = data.values.map((v, i) => [
      PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r),
      H - PAD.b - (v / max) * (H - PAD.t - PAD.b),
    ])
    const line = smoothPath(pts, 0.9)
    const area = `${line} L${pts[n - 1][0]},${H} L${pts[0][0]},${H} Z`
    const ticks = [0.25, 0.5, 0.75].map((f) => ({ v: max * f, y: H - PAD.b - f * (H - PAD.t - PAD.b) }))
    const avg = data.values.reduce((a, b) => a + b, 0) / n
    const avgY = H - PAD.b - (avg / max) * (H - PAD.t - PAD.b)
    return { pts, line, area, ticks, avg, avgY }
  }, [data])

  const spent = data.values.reduce((a, b) => a + b, 0)
  const remaining = data.income - spent
  const tIncome = useTweenedNumber(data.income)
  const tSpent = useTweenedNumber(spent)
  const tRemaining = useTweenedNumber(remaining)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    chart.pts.forEach((p, i) => {
      if (Math.abs(p[0] - x) < Math.abs(chart.pts[best][0] - x)) best = i
    })
    setActive(best)
  }

  const switchTo = (p: Period) => {
    setActive(null)
    setPeriod(p)
  }

  const activePt = active !== null ? chart.pts[active] : null
  const activeVal = active !== null ? data.values[active] : 0
  const delta = active !== null ? Math.round((activeVal / chart.avg - 1) * 100) : 0

  return (
    <section
      id="money-insights"
      aria-labelledby="bigger-picture-title"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-aqua via-white to-white pb-28 pt-10 md:pb-40"
    >
      <RibbonDivider
        className="h-28 w-full md:h-40"
        d="M-20 40 C 240 40, 360 200, 620 170 S 980 30, 1180 90 S 1400 210, 1460 200"
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-teal">Money insights</p>
            <h2
              id="bigger-picture-title"
              className="mt-5 text-balance text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.045em] text-navy"
            >
              See the bigger <span className="text-teal">picture.</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-pretty text-base leading-relaxed text-steel md:text-lg">
              Your spending tells a story. Fintellec helps you understand it without making money complicated.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t border-navy/10 pt-8 md:mt-24">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-steel">Spending · {data.label}</p>
            <p className="mt-2 text-[clamp(2.75rem,7vw,6rem)] font-medium leading-none tracking-[-0.05em] text-navy tabular-nums">
              {inr(tSpent)}
            </p>
          </div>
          <div
            role="group"
            aria-label="Time period"
            className="relative inline-flex rounded-full border border-mint bg-white p-1 shadow-[0_10px_30px_-20px_rgba(6,53,104,0.4)]"
          >
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 w-24 rounded-full bg-navy transition-transform duration-500 ease-[cubic-bezier(.6,0,.2,1)]"
              style={{ transform: period === 'weekly' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            {(['weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => switchTo(p)}
                className={cn(
                  'relative z-10 w-24 rounded-full py-2 text-sm font-medium capitalize transition-colors duration-300',
                  period === p ? 'text-white' : 'text-navy/70 hover:text-navy',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-10">
          <div
            ref={chartRef}
            className="relative h-[280px] w-full touch-pan-y md:h-auto md:aspect-[1000/380]"
            onPointerMove={onMove}
            onPointerLeave={() => setActive(null)}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="bp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#65DED2" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#65DED2" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="bp-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#65DED2" />
                  <stop offset="1" stopColor="#07877F" />
                </linearGradient>
              </defs>
              {chart.ticks.map((t) => (
                <line key={t.v} x1="0" x2={W} y1={t.y} y2={t.y} stroke="#063568" strokeOpacity="0.07" vectorEffect="non-scaling-stroke" />
              ))}
              <line x1="0" x2={W} y1={H} y2={H} stroke="#063568" strokeOpacity="0.18" vectorEffect="non-scaling-stroke" />
              {inView && (
                <g key={period} className="chart-wipe">
                  <path d={chart.area} fill="url(#bp-area)" />
                  <path d={chart.line} fill="none" stroke="#65DED2" strokeOpacity="0.25" strokeWidth="12" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  <path d={chart.line} fill="none" stroke="url(#bp-line)" strokeWidth="2.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  <line
                    x1="0"
                    x2={W}
                    y1={chart.avgY}
                    y2={chart.avgY}
                    stroke="#063568"
                    strokeOpacity="0.3"
                    strokeDasharray="4 6"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )}
              {activePt && (
                <line x1={activePt[0]} x2={activePt[0]} y1={0} y2={H} stroke="#07877F" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />
              )}
            </svg>

            {chart.ticks.map((t) => (
              <span
                key={t.v}
                className="pointer-events-none absolute left-0 -translate-y-[calc(100%+4px)] font-mono text-[10px] text-steel"
                style={{ top: `${(t.y / H) * 100}%` }}
              >
                {inrCompact(t.v)}
              </span>
            ))}

            {inView && (
              <span
                className="pointer-events-none absolute right-0 -translate-y-[calc(100%+6px)] font-mono text-[10px] uppercase tracking-[0.18em] text-steel"
                style={{ top: `${(chart.avgY / H) * 100}%` }}
              >
                Avg {inr(chart.avg)}
              </span>
            )}

            {inView &&
              chart.pts.map((p, i) => (
                <button
                  key={`${period}-${i}`}
                  type="button"
                  aria-label={`${data.labels[i]}: ${inr(data.values[i])} spent`}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(i)}
                  className="chart-dot group absolute grid size-8 place-items-center rounded-full"
                  style={{ left: `${(p[0] / W) * 100}%`, top: `${(p[1] / H) * 100}%`, ['--i' as string]: i }}
                >
                  <span
                    className={cn(
                      'block rounded-full border-2 border-teal bg-white transition-all duration-300',
                      active === i ? 'size-4 shadow-[0_0_0_8px_rgba(101,222,210,0.3)]' : 'size-2.5',
                    )}
                  />
                </button>
              ))}

            {activePt && (
              <div
                role="status"
                className="pointer-events-none absolute z-20 min-w-40 rounded-2xl border border-mint bg-white/95 px-4 py-3 shadow-[0_20px_50px_-24px_rgba(6,53,104,0.5)] backdrop-blur"
                style={{
                  left: `${(activePt[0] / W) * 100}%`,
                  top: `${(activePt[1] / H) * 100}%`,
                  transform: `translate(${active === 0 ? '-12%' : active === chart.pts.length - 1 ? '-88%' : '-50%'}, calc(-100% - 22px))`,
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{data.labels[active!]}</p>
                <p className="mt-1 text-xl font-medium tracking-tight text-navy tabular-nums">{inr(activeVal)}</p>
                <p className={cn('mt-0.5 text-xs', delta > 0 ? 'text-navy/70' : 'text-teal')}>
                  {delta > 0 ? '+' : ''}
                  {delta}% vs average
                </p>
              </div>
            )}
          </div>

          <div className="relative mt-4 h-4">
            {chart.pts.map((p, i) => (
              <span
                key={`${period}-l-${i}`}
                className={cn(
                  'absolute -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors',
                  active === i ? 'text-navy' : 'text-steel',
                  i === 0 && 'translate-x-0',
                  i === chart.pts.length - 1 && '-translate-x-full',
                )}
                style={{ left: `${(p[0] / W) * 100}%` }}
              >
                {data.labels[i]}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-14 md:grid-cols-12">
          <dl className="grid grid-cols-3 gap-6 md:col-span-5 md:grid-cols-1 md:gap-8">
            {[
              { k: 'Income', v: tIncome, c: 'text-navy' },
              { k: 'Spent', v: tSpent, c: 'text-navy' },
              { k: 'Remaining', v: tRemaining, c: 'text-teal' },
            ].map((s) => (
              <div key={s.k} className="border-t border-navy/10 pt-4">
                <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-steel">{s.k}</dt>
                <dd className={cn('mt-2 text-xl font-medium tracking-tight tabular-nums md:text-4xl', s.c)}>{inr(s.v)}</dd>
              </div>
            ))}
          </dl>

          <div className="md:col-span-6 md:col-start-7">
            <div className="flex items-baseline justify-between border-t border-navy/10 pt-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-steel">Where it went</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/80">Illustrative demo data</p>
            </div>
            <div className="mt-6 flex h-2.5 w-full gap-1 overflow-hidden rounded-full" aria-hidden>
              {CATEGORIES.map((c) => (
                <span
                  key={c.name}
                  className="h-full rounded-full transition-[flex-grow] duration-700"
                  style={{ flexGrow: c.share, background: c.color }}
                />
              ))}
            </div>
            <ul className="mt-6 divide-y divide-navy/[0.07]">
              {CATEGORIES.map((c) => (
                <li key={c.name} className="flex items-center justify-between py-3 text-sm">
                  <span className="flex items-center gap-3 text-navy">
                    <span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden />
                    {c.name}
                  </span>
                  <span className="flex items-baseline gap-4 tabular-nums">
                    <span className="font-mono text-xs text-steel">{Math.round(c.share * 100)}%</span>
                    <span className="w-24 text-right font-medium text-navy">{inr(tSpent * c.share)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
