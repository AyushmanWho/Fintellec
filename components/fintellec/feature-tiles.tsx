'use client'

import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Activity, ArrowUpRight, RotateCcw, Sparkles, Wallet } from 'lucide-react'

function TrackVisual({ replay }: { replay: number }) {
  return (
    <div key={replay} className="fintellec-tile-visual fintellec-track-visual" aria-hidden="true">
      <div className="fintellec-mini-label"><span className="fintellec-live-dot" /> SPENDING FLOW</div>
      <svg viewBox="0 0 320 150" className="fintellec-tile-svg" fill="none">
        <path d="M8 120H312M8 88H312M8 56H312M8 24H312" stroke="#003365" strokeOpacity=".09" strokeDasharray="3 7" />
        <path d="M10 103C36 96 42 58 70 70S104 113 132 81 172 39 198 58 236 92 260 49 292 34 310 22V140H10Z" fill="url(#track-fill)" />
        <path className="fintellec-chart-line" d="M10 103C36 96 42 58 70 70S104 113 132 81 172 39 198 58 236 92 260 49 292 34 310 22" stroke="url(#track-line)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="310" cy="22" r="7" fill="#63DCD3" fillOpacity=".3" />
        <circle cx="310" cy="22" r="3.5" fill="#00A99E" stroke="white" strokeWidth="1.5" />
        <defs>
          <linearGradient id="track-fill" x1="160" y1="20" x2="160" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#63DCD3" stopOpacity=".32"/><stop offset="1" stopColor="#63DCD3" stopOpacity="0"/></linearGradient>
          <linearGradient id="track-line" x1="10" y1="80" x2="310" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#63DCD3"/><stop offset="1" stopColor="#00A99E"/></linearGradient>
        </defs>
      </svg>
      <div className="fintellec-visual-footer"><span>Pattern detected</span><strong>+18% clarity</strong></div>
    </div>
  )
}

function BudgetVisual({ replay }: { replay: number }) {
  const bars = [38, 61, 48, 78, 64, 91, 73]
  return (
    <div key={replay} className="fintellec-tile-visual fintellec-budget-visual" aria-hidden="true">
      <div className="fintellec-mini-label"><span className="fintellec-live-dot" /> MONTHLY PLAN</div>
      <div className="fintellec-budget-ring-wrap">
        <div className="fintellec-budget-ring"><div><strong>72%</strong><span>on track</span></div></div>
        <div className="fintellec-budget-bars">
          {bars.map((height, i) => <span key={i} style={{ height: `${height}%`, ['--bar-i' as string]: i } as CSSProperties} />)}
        </div>
      </div>
      <div className="fintellec-visual-footer"><span>Flexible budget</span><strong>₹12,000</strong></div>
    </div>
  )
}

function InsightVisual({ replay }: { replay: number }) {
  return (
    <div key={replay} className="fintellec-tile-visual fintellec-insight-visual" aria-hidden="true">
      <div className="fintellec-mini-label"><span className="fintellec-live-dot" /> SMART INSIGHT</div>
      <div className="fintellec-insight-orbit">
        <span className="fintellec-orbit orbit-one" /><span className="fintellec-orbit orbit-two" />
        <span className="fintellec-insight-core"><Sparkles size={25} strokeWidth={1.6} /></span>
        <span className="fintellec-orbit-dot orbit-dot-one" /><span className="fintellec-orbit-dot orbit-dot-two" />
      </div>
      <div className="fintellec-insight-callout"><span>Opportunity found</span><strong>Save ₹1,250/mo</strong></div>
      <div className="fintellec-visual-footer"><span>Based on sample patterns</span><strong>Explore →</strong></div>
    </div>
  )
}

type Tile = {
  number: string
  title: string
  description: string
  caption: string
  href: string
  icon: typeof Activity
  visual: typeof TrackVisual
  className: string
}

const TILES: Tile[] = [
  { number: '01', title: 'Track with clarity.', description: 'See where your money goes and spot the patterns that are easy to miss.', caption: 'SPENDING, SORTED', href: '#money-insights', icon: Activity, visual: TrackVisual, className: 'track' },
  { number: '02', title: 'Plan with intention.', description: 'Give everyday spending a structure while keeping room for what matters.', caption: 'BUDGETS, IN RHYTHM', href: '#how-it-works', icon: Wallet, visual: BudgetVisual, className: 'budget' },
  { number: '03', title: 'Move forward smarter.', description: 'Turn your patterns into clear next steps for your goals and future self.', caption: 'INSIGHTS, IN MOTION', href: '#savings', icon: Sparkles, visual: InsightVisual, className: 'insight' },
]

export function FeatureTiles() {
  const [replay, setReplay] = useState<Record<string, number>>({})

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    card.dataset.glassTilt = 'active'
    card.style.setProperty('--glass-tilt-x', `${((0.5 - y) * 5).toFixed(2)}deg`)
    card.style.setProperty('--glass-tilt-y', `${((x - 0.5) * 5.5).toFixed(2)}deg`)
    card.style.setProperty('--glass-spot-x', `${(x * 100).toFixed(1)}%`)
    card.style.setProperty('--glass-spot-y', `${(y * 100).toFixed(1)}%`)
  }

  const resetPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const card = event.currentTarget
    delete card.dataset.glassTilt
    card.style.removeProperty('--glass-tilt-x')
    card.style.removeProperty('--glass-tilt-y')
    card.style.removeProperty('--glass-spot-x')
    card.style.removeProperty('--glass-spot-y')
  }

  return (
    <section id="features" aria-labelledby="fintellec-features-title" className="fintellec-feature-section">
      <div className="fintellec-feature-orb fintellec-feature-orb-one" aria-hidden="true" />
      <div className="fintellec-feature-orb fintellec-feature-orb-two" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="fintellec-feature-heading">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-teal">A clearer relationship with money</p>
            <h2 id="fintellec-features-title" className="mt-5 max-w-3xl text-balance text-[clamp(2.7rem,6vw,5.6rem)] font-medium leading-[.94] tracking-[-.05em] text-navy">
              Less guesswork. <span className="text-teal">More direction.</span>
            </h2>
          </div>
          <p className="max-w-md text-pretty text-base leading-relaxed text-steel md:text-lg">A calmer way to understand your money, make a plan, and see what your choices could change.</p>
        </div>

        <div className="fintellec-feature-grid">
          {TILES.map((tile) => {
            const Icon = tile.icon
            const Visual = tile.visual
            return (
              <article
                key={tile.number}
                className={`fintellec-glass-tile fintellec-glass-tile-${tile.className}`}
                data-3d-card="true"
                onPointerMove={handlePointerMove}
                onPointerLeave={resetPointer}
              >
                <div className="fintellec-tile-top" data-card-layer="top">
                  <span className="fintellec-tile-number">{tile.number} / 03</span>
                  <span className="fintellec-tile-icon"><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></span>
                </div>
                <h3 data-card-layer="title">{tile.title}</h3>
                <p className="fintellec-tile-description" data-card-layer="description">{tile.description}</p>
                <Visual replay={replay[tile.number] ?? 0} />
                <div className="fintellec-tile-bottom">
                  <span>{tile.caption}</span>
                  <a href={tile.href} aria-label={`Explore ${tile.title}`}><ArrowUpRight size={17} aria-hidden="true" /></a>
                </div>
                <button
                  className="fintellec-tile-replay"
                  type="button"
                  onClick={() => setReplay((current) => ({ ...current, [tile.number]: (current[tile.number] ?? 0) + 1 }))}
                  aria-label={`Replay ${tile.title} illustration`}
                >
                  <RotateCcw size={12} aria-hidden="true" /> Replay visual
                </button>
              </article>
            )
          })}
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-steel/75">Illustrative demo visuals · no financial accounts connected</p>
      </div>
    </section>
  )
}
