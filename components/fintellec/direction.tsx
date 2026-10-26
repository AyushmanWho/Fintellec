'use client'

import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Coffee, ShoppingBag, TrainFront } from 'lucide-react'
import { useScrollProgress } from '@/hooks/use-motion'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'

const TRACK_PATH = 'M 20 230 C 90 40, 190 250, 260 50'
const SPENT = 9400
const BUDGETS = [8000, 12000, 16000]

function TrackVisual() {
  const tokens = [
    { Icon: Coffee, delay: '0s' },
    { Icon: TrainFront, delay: '-3s' },
    { Icon: ShoppingBag, delay: '-6s' },
  ]
  return (
    <div className="relative size-[280px]">
      <svg viewBox="0 0 280 280" className="absolute inset-0 size-full" fill="none" aria-hidden>
        <circle cx="140" cy="140" r="128" stroke="#07877F" strokeOpacity="0.1" />
        <path d={TRACK_PATH} stroke="#65DED2" strokeOpacity="0.25" strokeWidth="10" strokeLinecap="round" />
        <path d={TRACK_PATH} stroke="#07877F" strokeWidth="1.5" strokeLinecap="round" />
        <path d={TRACK_PATH} stroke="#fff" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
      </svg>
      {tokens.map(({ Icon, delay }, i) => (
        <span
          key={i}
          className="travel absolute left-0 top-0 -ml-[18px] -mt-[18px] grid size-9 place-items-center rounded-full border border-violet/20 bg-violet-soft text-violet shadow-[0_10px_24px_-10px_rgba(101,71,215,0.45)] backdrop-blur"
          style={{ offsetPath: `path('${TRACK_PATH}')`, animationDelay: delay } as CSSProperties}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      ))}
    </div>
  )
}

function PlanVisual({ budget }: { budget: number }) {
  const scale = 0.58 + 0.42 * (budget / 16000)
  const used = Math.min(1, SPENT / budget)
  const over = SPENT > budget
  return (
    <div className="relative size-[280px]">
      <svg viewBox="0 0 280 280" className="absolute inset-0 size-full" fill="none" aria-hidden>
        <g style={{ transform: `scale(${scale})`, transformOrigin: '140px 140px', transition: 'transform 900ms cubic-bezier(.6,0,.2,1)' }}>
          <circle cx="140" cy="140" r="126" stroke="#07877F" strokeOpacity="0.5" strokeDasharray="2 6" strokeWidth="1.5" />
          <circle cx="140" cy="140" r="108" stroke="#B9F0E9" strokeWidth="8" />
          <circle
            cx="140"
            cy="140"
            r="108"
            stroke={over ? '#063568' : '#07877F'}
            strokeWidth="8"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${used * 100} 100`}
            transform="rotate(-90 140 140)"
            style={{ transition: 'stroke-dasharray 900ms cubic-bezier(.6,0,.2,1), stroke 400ms' }}
          />
        </g>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-medium tracking-tight text-navy tabular-nums">{inr(SPENT)}</p>
          <p className={cn('mt-1 font-mono text-[10px] uppercase tracking-[0.18em]', over ? 'text-navy' : 'text-teal')}>
            {over ? `${inr(SPENT - budget)} over` : `${inr(budget - SPENT)} left`}
          </p>
        </div>
      </div>
    </div>
  )
}

function SaveVisual() {
  const coins = [
    { fx: '-120px', fy: '-90px', delay: '0s' },
    { fx: '130px', fy: '-60px', delay: '-1.2s' },
    { fx: '-100px', fy: '110px', delay: '-2.4s' },
    { fx: '120px', fy: '100px', delay: '-3.6s' },
  ]
  return (
    <div className="relative size-[280px]">
      <svg viewBox="0 0 280 280" className="absolute inset-0 size-full" fill="none" aria-hidden>
        <defs>
          <linearGradient id="save-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#65DED2" />
            <stop offset="1" stopColor="#07877F" />
          </linearGradient>
        </defs>
        <circle cx="140" cy="140" r="96" fill="rgba(255,255,255,0.5)" stroke="#B9F0E9" strokeWidth="6" />
        <circle
          cx="140"
          cy="140"
          r="96"
          stroke="url(#save-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="72 100"
          transform="rotate(-90 140 140)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {coins.map((c, i) => (
          <span
            key={i}
            aria-hidden
            className="coin-in absolute grid size-11 place-items-center rounded-full border border-violet/20 text-sm font-medium text-violet shadow-[0_10px_24px_-10px_rgba(101,71,215,0.45)]"
            style={
              {
                '--fx': c.fx,
                '--fy': c.fy,
                animationDelay: c.delay,
                background: 'radial-gradient(circle at 32% 28%, #fff 0%, #F1EEFF 45%, #D8D0FF 100%)',
              } as CSSProperties
            }
          >
            ₹
          </span>
        ))}
        <div className="text-center">
          <p className="text-4xl font-medium tracking-tight text-navy">72%</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-teal">Travel fund</p>
        </div>
      </div>
    </div>
  )
}

type StageProps = {
  n: string
  title: string
  heading: string
  body: string
  visual: ReactNode
  extra?: ReactNode
  active: boolean
  side: 'left' | 'right'
  pos: { x: string; y: string }
}

function Stage({ n, title, heading, body, visual, extra, active, side, pos }: StageProps) {
  return (
    <div
      data-active={active}
      className="group relative flex flex-col items-start gap-8 py-14 pl-12 md:absolute md:left-[var(--x)] md:top-[var(--y)] md:block md:size-0 md:p-0"
      style={{ '--x': pos.x, '--y': pos.y } as CSSProperties}
    >
      <div className="rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.97)_55%,rgba(255,255,255,0)_71%)] scale-90 opacity-40 transition-all duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100 md:absolute md:left-0 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2">
        {visual}
      </div>
      <div
        className={cn(
          'max-w-sm transition-all duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] [clip-path:inset(0_0_100%_0)] group-data-[active=true]:[clip-path:inset(0_0_0_0)] md:absolute md:top-0 md:w-80 md:-translate-y-1/2',
          side === 'right' ? 'md:left-[190px]' : 'md:right-[190px] md:text-right',
        )}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-violet">
          {n} — {title}
        </p>
        <h3 className="mt-3 text-balance text-3xl font-medium leading-[1.02] tracking-[-0.03em] text-navy md:text-4xl">
          {heading}
        </h3>
        <p className="mt-3 text-pretty leading-relaxed text-steel">{body}</p>
        {extra}
      </div>
    </div>
  )
}

export function Direction() {
  const ref = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0)
  const [budget, setBudget] = useState(12000)

  useScrollProgress(
    ref,
    (p) => {
      ref.current?.style.setProperty('--reveal', `${((1 - p) * 100).toFixed(2)}%`)
      setStage(p > 0.8 ? 3 : p > 0.47 ? 2 : p > 0.12 ? 1 : 0)
    },
    0.62,
  )

  return (
    <section
      id="how-it-works"
      aria-labelledby="direction-title"
      className="fintellec-micro-grid relative scroll-mt-24 pb-24 pt-24 md:pt-36 transition-colors duration-500"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <h2
          id="direction-title"
          className="text-balance text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.045em] text-navy max-w-4xl"
        >
          Every rupee has a <span className="font-highlight text-teal">direction.</span>
        </h2>
        <p className="mt-6 max-w-xl text-pretty text-steel md:text-lg">
          Three movements, one continuous flow — from knowing where money goes to arriving where you want it.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto mt-10 max-w-[1400px] px-6 md:mt-0 md:h-[230vh] md:min-h-[1500px] md:px-12">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 hidden size-full md:block"
          style={{ clipPath: 'inset(0 0 var(--reveal, 100%) 0)' }}
          fill="none"
        >
          {[
            { s: '#65DED2', o: 0.16, w: 16 },
            { s: '#07877F', o: 1, w: 2.2 },
            { s: '#fff', o: 0.7, w: 0.8 },
          ].map((l) => (
            <path
              key={l.w}
              d="M 50 0 C 50 7, 28 6, 28 16 C 28 31, 72 34, 72 50 C 72 66, 36 68, 36 84 C 36 93, 52 95, 54 100"
              stroke={l.s}
              strokeOpacity={l.o}
              strokeWidth={l.w}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <svg
          aria-hidden
          viewBox="0 0 20 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-y-0 left-4 w-10 md:hidden"
          style={{ clipPath: 'inset(0 0 var(--reveal, 100%) 0)' }}
          fill="none"
        >
          <path d="M 10 0 C 2 16, 18 30, 10 50 C 2 70, 18 84, 10 100" stroke="#65DED2" strokeOpacity="0.2" strokeWidth="12" vectorEffect="non-scaling-stroke" />
          <path d="M 10 0 C 2 16, 18 30, 10 50 C 2 70, 18 84, 10 100" stroke="#07877F" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>

        <Stage
          n="01"
          title="Track"
          heading="Know where it goes."
          body="Transactions sort themselves into clear spending categories, so nothing slips past quietly."
          visual={<TrackVisual />}
          active={stage >= 1}
          side="right"
          pos={{ x: '28%', y: '16%' }}
          extra={
            <ul className="mt-5 divide-y divide-navy/[0.07] border-y border-navy/[0.07] text-sm">
              {[
                ['Chai & snacks', '−₹120', 'text-navy'],
                ['Metro top-up', '−₹500', 'text-navy'],
                ['Freelance payout', '+₹8,000', 'text-teal'],
              ].map(([k, v, c]) => (
                <li key={k} className="flex justify-between gap-6 py-2">
                  <span className="text-steel">{k}</span>
                  <span className={cn('font-mono', c)}>{v}</span>
                </li>
              ))}
            </ul>
          }
        />
        <Stage
          n="02"
          title="Plan"
          heading="Budgets that fit real life."
          body="Set a boundary that bends with your month — not one that breaks on the first weekend."
          visual={<PlanVisual budget={budget} />}
          active={stage >= 2}
          side="left"
          pos={{ x: '72%', y: '50%' }}
          extra={
            <div className="mt-5 flex flex-wrap items-center gap-2 md:justify-end" role="group" aria-label="Monthly budget">
              <span className="mr-1 text-xs text-steel">Monthly budget</span>
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={budget === b}
                  onClick={() => setBudget(b)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 font-mono text-xs transition-colors',
                    budget === b ? 'border-violet bg-violet text-white' : 'border-mint bg-white text-navy hover:border-teal',
                  )}
                >
                  {`₹${b / 1000}k`}
                </button>
              ))}
            </div>
          }
        />
        <Stage
          n="03"
          title="Save"
          heading="Move toward what matters."
          body="Small, steady contributions gather into goals you can actually see getting closer."
          visual={<SaveVisual />}
          active={stage >= 3}
          side="right"
          pos={{ x: '36%', y: '84%' }}
          extra={
            <p className="mt-5 font-mono text-xs text-teal">
              {inr(50400)} of {inr(70000)} · illustrative
            </p>
          }
        />
      </div>
    </section>
  )
}
