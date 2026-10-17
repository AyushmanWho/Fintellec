'use client'

import { useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, Plane, Repeat, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { useInView } from '@/hooks/use-motion'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CATEGORIES } from './bigger-picture'

const OCT_SPEND = 38420
const SUBS = [
  { name: 'Video streaming', cost: 649, idle: false },
  { name: 'Gym app', cost: 299, idle: true },
  { name: 'Cloud storage', cost: 130, idle: true },
  { name: 'Music', cost: 119, idle: false },
]

type Insight = {
  Icon: LucideIcon
  title: string
  note: string
  viz: ReactNode
  pos: string
  line: string
}

const INSIGHTS: Insight[] = [
  {
    Icon: UtensilsCrossed,
    title: 'Eating out is 18% higher than last month.',
    note: 'Most of the increase came from weekend orders.',
    pos: 'md:left-0 md:top-6',
    line: 'M 26 16 C 30 16, 32 24, 35 30',
    viz: (
      <div className="space-y-2">
        {[
          { m: 'Sep', v: 5200, w: '78%', c: 'bg-mint' },
          { m: 'Oct', v: 6140, w: '92%', c: 'bg-teal' },
        ].map((b) => (
          <div key={b.m} className="flex items-center gap-3 text-xs">
            <span className="w-7 font-mono text-steel">{b.m}</span>
            <span className="h-1.5 flex-1 rounded-full bg-aqua">
              <span className={cn('block h-full rounded-full', b.c)} style={{ width: b.w }} />
            </span>
            <span className="w-14 text-right font-mono text-navy">{inr(b.v)}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    Icon: Plane,
    title: "You're 72% of the way to your travel goal.",
    note: 'About ₹19,600 to go at your current pace.',
    pos: 'md:right-0 md:top-[34%]',
    line: 'M 74 50 C 71 50, 70 50, 67 50',
    viz: (
      <div>
        <div className="h-1.5 w-full rounded-full bg-aqua">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-bright to-teal" />
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs">
          <span className="text-navy">{inr(50400)}</span>
          <span className="text-steel">{inr(70000)}</span>
        </div>
      </div>
    ),
  },
  {
    Icon: Repeat,
    title: 'Review recurring subscriptions to identify potential savings.',
    note: "Two haven't been opened in over 30 days.",
    pos: 'md:left-[6%] md:bottom-0',
    line: 'M 31 66 C 34 66, 35 68, 38 70',
    viz: (
      <ul className="divide-y divide-navy/[0.06] text-xs">
        {SUBS.map((s) => (
          <li key={s.name} className="flex items-center justify-between py-1.5">
            <span className={cn('flex items-center gap-2', s.idle ? 'text-navy' : 'text-steel')}>
              <span className={cn('size-1.5 rounded-full', s.idle ? 'bg-navy' : 'bg-mint')} aria-hidden />
              {s.name}
              {s.idle && <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-teal">idle</span>}
            </span>
            <span className="font-mono text-navy">{inr(s.cost)}/mo</span>
          </li>
        ))}
      </ul>
    ),
  },
]

function Donut({ highlight }: { highlight: number | null }) {
  let acc = 0
  return (
    <svg viewBox="0 0 400 400" className="size-full" aria-hidden fill="none">
      <circle cx="200" cy="200" r="186" stroke="#65DED2" strokeOpacity="0.18" strokeWidth="14" />
      <circle
        className="spin-slow"
        cx="200"
        cy="200"
        r="186"
        stroke="#07877F"
        strokeWidth="1.6"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="34 66"
      />
      <circle cx="200" cy="200" r="186" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.8" />
      {CATEGORIES.map((c, i) => {
        const start = acc
        acc += c.share * 100
        const focus = (highlight === 0 && i === 0) || (highlight === 2 && c.name === 'Subscriptions')
        return (
          <circle
            key={c.name}
            cx="200"
            cy="200"
            r="150"
            stroke={c.color}
            strokeWidth={focus ? 18 : 10}
            pathLength={100}
            strokeDasharray={`${Math.max(0.5, c.share * 100 - 1.2)} 100`}
            strokeDashoffset={-start}
            transform="rotate(-90 200 200)"
            style={{ transition: 'stroke-width 400ms' }}
          />
        )
      })}
      <circle cx="200" cy="200" r="122" stroke="#063568" strokeOpacity="0.06" />
    </svg>
  )
}

export function Insights() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { threshold: 0.25 })
  const [hover, setHover] = useState<number | null>(null)

  return (
    <section aria-labelledby="insights-title" className="relative overflow-hidden bg-gradient-to-b from-white to-aqua py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2
            id="insights-title"
            className="text-balance text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.045em] text-navy md:col-span-7"
          >
            Small insights.
            <br />
            <span className="text-teal">Better decisions.</span>
          </h2>
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-pretty text-base leading-relaxed text-steel md:text-lg">
              Notice the patterns. Make more intentional choices.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-mint bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
              Illustrative demo data · no accounts connected
            </p>
          </div>
        </div>

        <div ref={ref} data-inview={inView} className="group/ins relative mt-16 md:mt-10 md:h-[780px]">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 hidden size-full md:block"
            fill="none"
          >
            {INSIGHTS.map((ins, i) => (
              <path
                key={i}
                d={ins.line}
                pathLength={1}
                stroke="#07877F"
                strokeOpacity={hover === i ? 1 : 0.45}
                strokeWidth={hover === i ? 2 : 1.2}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="1 1"
                style={{
                  strokeDashoffset: inView ? 0 : 1,
                  transition: `stroke-dashoffset 1.2s cubic-bezier(.6,0,.2,1) ${0.6 + i * 0.25}s, stroke-opacity 300ms, stroke-width 300ms`,
                }}
              />
            ))}
          </svg>

          <div className="relative mx-auto aspect-square w-full max-w-[420px] md:absolute md:left-1/2 md:top-1/2 md:w-[440px] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2">
            <div
              className={cn(
                'size-full transition-all duration-[1400ms] ease-[cubic-bezier(.2,.8,.2,1)]',
                inView ? 'rotate-0 scale-100 opacity-100' : '-rotate-12 scale-90 opacity-0',
              )}
            >
              <Donut highlight={hover} />
            </div>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">October spending</p>
                <p className="mt-2 text-[clamp(2.5rem,6vw,3.75rem)] font-medium leading-none tracking-[-0.05em] text-navy tabular-nums">
                  {inr(OCT_SPEND)}
                </p>
                <p className="mt-2 text-xs text-teal">−4.7% vs September</p>
              </div>
            </div>
          </div>

          <ul className="relative mt-12 grid gap-5 md:static md:mt-0 md:block">
            {INSIGHTS.map(({ Icon, title, note, viz, pos }, i) => (
              <li
                key={title}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                className={cn(
                  'group w-full rounded-3xl border border-mint/80 bg-white/75 p-6 backdrop-blur-md transition-[clip-path,transform,border-color,box-shadow] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:border-teal/50 hover:shadow-[0_30px_60px_-34px_rgba(6,53,104,0.45)] focus-visible:border-teal md:absolute md:w-[330px]',
                  pos,
                  inView ? '[clip-path:inset(0_0_0_0_round_24px)]' : '[clip-path:inset(0_0_100%_0_round_24px)]',
                )}
                style={{ transitionDuration: '900ms, 300ms, 300ms, 300ms', transitionDelay: inView ? `${0.3 + i * 0.25}s, 0s, 0s, 0s` : '0s' }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-aqua text-teal">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">{`Insight 0${i + 1}`}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 text-teal transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
                <p className="mt-5 text-pretty text-lg font-medium leading-snug tracking-tight text-navy">{title}</p>
                <div className="mt-5">{viz}</div>
                <p className="mt-4 text-sm text-steel">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
