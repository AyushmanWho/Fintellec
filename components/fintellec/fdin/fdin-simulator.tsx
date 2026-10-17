'use client'

import { useState, useMemo } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  X,
  CreditCard,
  Briefcase,
  Clock,
  Gauge,
  HelpCircle,
  Sliders,
  DollarSign,
  Flame,
  ShieldAlert
} from 'lucide-react'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'
import { sound } from '@/lib/sound'

// ==========================================
// COLOR PALETTE CONSTANTS (FROM OFFICIAL PALETTE)
// ==========================================
const COLORS = {
  navy: '#003365', // Primary Text
  freshMint: '#63DCD3', // Primary Brand
  deepTeal: '#00A99E', // Secondary Brand
  softMint: '#B8F2EC', // Light Accent
  iceMint: '#EFFAFA', // Main Background
  white: '#FFFFFF', // White Surface
  mutedNavy: '#52728A', // Secondary Text
  paleMint: '#D5EFEC', // Border
  dangerRed: '#EF4444', // Danger Line & Breaches
  warningAmber: '#F59E0B', // Caution
  successGreen: '#10B981', // On-Track
}

export function FdinSimulator() {
  const [archetype, setArchetype] = useState<'student' | 'proprietor'>('student')

  return (
    <section
      id="simulator"
      aria-labelledby="simulator-title"
      className="relative py-24 md:py-36 overflow-hidden scroll-mt-20"
      style={{
        background:
          'radial-gradient(75% 55% at 15% 30%, rgba(99, 220, 211, 0.22) 0%, transparent 70%), radial-gradient(80% 60% at 85% 70%, rgba(0, 169, 158, 0.14) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #E9F8F5 50%, #FFFFFF 100%)',
      }}
    >
      {/* Background Soft Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-[900px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(99,220,211,0.18),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal/30 bg-teal/5 text-teal text-xs font-mono tracking-[0.22em] uppercase mb-5 shadow-sm">
            <Sliders className="size-3.5" />
            FDIN · Decision Intelligence Engine
          </div>
          <h2
            id="simulator-title"
            className="text-balance text-[clamp(2.4rem,5.2vw,4.5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-navy"
          >
            Real-time consequences.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-bright">
              Zero judgment.
            </span>
          </h2>
          <p className="mt-4 text-steel text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Every decision triggers an instant ripple across your future. Simulate discretionary purchases or business overhead before locking in.
          </p>

          {/* Archetype Segmented Switcher */}
          <div className="mt-10 inline-flex p-1.5 rounded-full bg-white border border-mint shadow-md">
            <button
              type="button"
              onClick={() => {
                setArchetype('student')
                sound.snap('high')
              }}
              className={cn(
                'flex items-center gap-2.5 px-6 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300',
                archetype === 'student'
                  ? 'bg-navy text-white shadow-md'
                  : 'text-steel hover:text-navy',
              )}
            >
              <CreditCard className="size-4" />
              Student & Young Professional
            </button>
            <button
              type="button"
              onClick={() => {
                setArchetype('proprietor')
                sound.snap('high')
              }}
              className={cn(
                'flex items-center gap-2.5 px-6 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300',
                archetype === 'proprietor'
                  ? 'bg-navy text-white shadow-md'
                  : 'text-steel hover:text-navy',
              )}
            >
              <Briefcase className="size-4" />
              Sole Proprietor & Agency
            </button>
          </div>
        </div>

        {/* Dynamic Surface Render based on Archetype */}
        <div className="mt-14">
          {archetype === 'student' ? <StudentSimulator /> : <SoleProprietorSimulator />}
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// PART B1: STUDENT EXPERIENCE — DECISION & TRAJECTORY SIMULATOR (STU-01)
// =========================================================================
function StudentSimulator() {
  const [purchaseName, setPurchaseName] = useState('Gaming Laptop')
  const [cost, setCost] = useState(65000)
  const [paymentPlan, setPaymentPlan] = useState<'upfront' | '3emi' | '6emi' | 'lockout'>('6emi')
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '12M'>('12M')
  const [scrubIndex, setScrubIndex] = useState<number | null>(null)
  const [showCohortModal, setShowCohortModal] = useState(false)

  const quickPicks = ['Gaming Laptop', 'Goa Trip', 'Smart Watch', 'Phone Upgrade', 'Gym Membership']

  // Monthly base income & fixed expense defaults for Student archetype
  const monthlyAllowance = 28000
  const monthlyFixed = 14000
  const criticalBuffer = 5000
  const startingBalance = 24000

  // Trajectory Simulation Calculation
  const trajectoryData = useMemo(() => {
    const monthsCount = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].slice(0, monthsCount)

    let currentBase = startingBalance
    let currentSim = startingBalance

    const points = months.map((month, idx) => {
      // Baseline: allowance - fixed savings rate
      const netMonthly = monthlyAllowance - monthlyFixed
      currentBase += netMonthly

      // Deductions based on chosen payment structure
      let deduction = 0
      if (paymentPlan === 'upfront') {
        if (idx === 0) deduction = cost
      } else if (paymentPlan === '3emi') {
        if (idx < 3) deduction = Math.round(cost / 3)
      } else if (paymentPlan === '6emi') {
        if (idx < 6) deduction = Math.round(cost / 6)
      } else if (paymentPlan === 'lockout') {
        // Locked from spending until saved
        if (idx < 4) deduction = Math.round(cost / 4)
      }

      currentSim += netMonthly - deduction

      const isBreach = currentSim < criticalBuffer

      return {
        month,
        baseline: currentBase,
        simulated: currentSim,
        deduction,
        isBreach,
      }
    })

    return points
  }, [cost, paymentPlan, timeRange])

  // Multi-Goal Collisions computed
  const goalCollisions = useMemo(() => {
    const isEmiStrain = paymentPlan === '6emi' && cost >= 50000
    const delayMonths = isEmiStrain ? 2.5 : cost > 30000 ? 1.2 : 0
    const cushionBreach = trajectoryData.some((p) => p.isBreach)

    return {
      travelGoal: {
        title: 'Goa Trip Fund (Target: Nov 2026)',
        delayedMonths: delayMonths,
        monthlyReduction: isEmiStrain ? '₹3,000 → ₹1,200' : '₹3,000 → ₹2,400',
        impactType: delayMonths > 2 ? 'caution' : delayMonths > 0 ? 'mild' : 'optimal',
      },
      emergencyReserve: {
        title: 'Minimum Cushion Reserve (₹5,000)',
        breached: cushionBreach,
        lowestBalance: Math.min(...trajectoryData.map((d) => d.simulated)),
        impactType: cushionBreach ? 'breach' : 'optimal',
      },
    }
  }, [cost, paymentPlan, trajectoryData])

  // Chart coordinate math
  const maxVal = Math.max(
    ...trajectoryData.map((d) => Math.max(d.baseline, d.simulated)),
    70000,
  )
  const minVal = Math.min(
    ...trajectoryData.map((d) => Math.min(d.baseline, d.simulated)),
    0,
  )
  const range = maxVal - minVal || 1

  const chartW = 760
  const chartH = 260
  const pad = { t: 20, b: 35, l: 50, r: 25 }

  const getY = (val: number) => {
    return chartH - pad.b - ((val - minVal) / range) * (chartH - pad.t - pad.b)
  }
  const getX = (idx: number) => {
    return pad.l + (idx / (trajectoryData.length - 1)) * (chartW - pad.l - pad.r)
  }

  const baselinePath = trajectoryData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.baseline)}`)
    .join(' ')

  const simulatedPath = trajectoryData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.simulated)}`)
    .join(' ')

  const criticalY = getY(criticalBuffer)

  const activePoint = scrubIndex !== null ? trajectoryData[scrubIndex] : trajectoryData[trajectoryData.length - 1]
  const activeX = scrubIndex !== null ? getX(scrubIndex) : getX(trajectoryData.length - 1)

  return (
    <div className="space-y-8">
      {/* Top Header / Workspace Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-mint/70 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-2.5 rounded-full bg-teal animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-steel font-medium">
            Personal Workspace · Student Archetype
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Financial IQ Chip */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-aqua border border-mint text-navy text-xs font-mono font-medium">
            <Sparkles className="size-3.5 text-teal" />
            Financial IQ: <span className="font-bold text-teal">680</span>
          </div>
          {/* Liquid Cash Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-mint text-navy text-xs font-mono font-medium shadow-sm">
            Buffer: <span className="text-teal font-bold">{inr(startingBalance)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Decision Builder (Input) + Visualizer Chart */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Input Card: Decision Builder (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-mint/80 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-steel font-semibold">
                Decision Builder
              </span>
              <span className="text-[10px] font-mono text-teal bg-aqua px-2.5 py-0.5 rounded-full border border-mint">
                Real-Time Simulation
              </span>
            </div>

            {/* Purchase Item Field */}
            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                Evaluating Purchase or Commitment
              </label>
              <input
                type="text"
                value={purchaseName}
                onChange={(e) => setPurchaseName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-mint bg-aqua/40 px-4 py-2.5 text-sm font-medium text-navy placeholder:text-steel/60 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                placeholder="e.g. Gaming Laptop, Trip, Phone"
              />
              {/* Autocomplete chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickPicks.map((pick) => (
                  <button
                    key={pick}
                    type="button"
                    onClick={() => {
                      setPurchaseName(pick)
                      sound.snap('low')
                      if (pick === 'Gaming Laptop') setCost(65000)
                      if (pick === 'Goa Trip') setCost(22000)
                      if (pick === 'Smart Watch') setCost(18000)
                      if (pick === 'Phone Upgrade') setCost(54000)
                      if (pick === 'Gym Membership') setCost(12000)
                    }}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-mono transition-colors',
                      purchaseName === pick
                        ? 'bg-teal text-white font-semibold'
                        : 'bg-aqua text-steel hover:text-navy border border-mint/60',
                    )}
                  >
                    {pick}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Cost Input */}
            <div className="mt-6">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                  Estimated Total Cost
                </label>
                <span className="font-mono text-xs text-steel">Drag or type</span>
              </div>
              <div className="mt-2 relative flex items-center">
                <span className="absolute left-4 text-xl font-medium text-teal font-serif">₹</span>
                <input
                  type="number"
                  value={cost}
                  step={1000}
                  min={5000}
                  max={150000}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-mint bg-aqua/40 pl-9 pr-4 py-2.5 text-2xl font-bold tracking-tight text-navy focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal tabular-nums"
                />
              </div>
              <input
                type="range"
                min={5000}
                max={120000}
                step={1000}
                value={cost}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setCost(val)
                  sound.tick(700 + val / 70)
                }}
                className="fin-range mt-3 w-full"
              />
            </div>

            {/* Payment Structure Selector */}
            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                Payment Structure
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: 'upfront', label: 'Full Upfront', sub: 'Instant hit' },
                  { id: '3emi', label: '3-Month EMI', sub: `${inr(Math.round(cost / 3))}/mo` },
                  { id: '6emi', label: '6-Month EMI', sub: `${inr(Math.round(cost / 6))}/mo` },
                  { id: 'lockout', label: 'Savings Lockout', sub: 'Zero debt risk' },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setPaymentPlan(plan.id as any)
                      sound.snap('high')
                    }}
                    className={cn(
                      'rounded-xl border p-2.5 text-left transition-all',
                      paymentPlan === plan.id
                        ? 'border-teal bg-navy text-white shadow-sm'
                        : 'border-mint bg-white hover:border-teal/60 text-navy',
                    )}
                  >
                    <div className="text-xs font-semibold">{plan.label}</div>
                    <div
                      className={cn(
                        'text-[10px] font-mono mt-0.5',
                        paymentPlan === plan.id ? 'text-bright' : 'text-steel',
                      )}
                    >
                      {plan.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Peer Cohort Button Link */}
          <div className="mt-6 pt-5 border-t border-mint/60 flex items-center justify-between">
            <span className="text-xs text-steel">Need behavioral context?</span>
            <button
              type="button"
              onClick={() => {
                setShowCohortModal(true)
                sound.chime()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-teal hover:text-navy transition-colors"
            >
              <Users className="size-3.5" />
              See Cohort Insights →
            </button>
          </div>
        </div>

        {/* Visualizer: 12-Month Trajectory Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-mint/80 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-navy">
                  Financial Trajectory Projection
                </h3>
                <p className="text-xs font-mono text-steel mt-0.5">
                  Simulating net liquid cash balance over time
                </p>
              </div>

              {/* Range Selectors: 3M | 6M | 12M */}
              <div className="flex rounded-full bg-aqua p-1 border border-mint">
                {(['3M', '6M', '12M'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTimeRange(r)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-mono font-medium transition-colors',
                      timeRange === r
                        ? 'bg-navy text-white font-bold'
                        : 'text-steel hover:text-navy',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div
              className="mt-6 relative w-full h-[270px] select-none"
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const relX = e.clientX - rect.left
                const ratio = (relX - pad.l) / (chartW - pad.l - pad.r)
                const clampedRatio = Math.max(0, Math.min(1, ratio))
                const idx = Math.round(clampedRatio * (trajectoryData.length - 1))
                setScrubIndex(idx)
              }}
              onPointerLeave={() => setScrubIndex(null)}
            >
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" fill="none">
                {/* Horizontal Guide Lines */}
                <line x1={pad.l} y1={getY(20000)} x2={chartW - pad.r} y2={getY(20000)} stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1={pad.l} y1={getY(40000)} x2={chartW - pad.r} y2={getY(40000)} stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1={pad.l} y1={getY(60000)} x2={chartW - pad.r} y2={getY(60000)} stroke="#E2E8F0" strokeDasharray="3 3" />

                {/* Critical Buffer Line (Red Dashed) */}
                <line
                  x1={pad.l}
                  y1={criticalY}
                  x2={chartW - pad.r}
                  y2={criticalY}
                  stroke={COLORS.dangerRed}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text x={pad.l + 6} y={criticalY - 6} fill={COLORS.dangerRed} fontSize="9" fontFamily="monospace">
                  SAFETY BUFFER ({inr(criticalBuffer)})
                </text>

                {/* Baseline Trendline (Solid Charcoal/Navy) */}
                <path d={baselinePath} stroke="#475569" strokeWidth="2" fill="none" opacity="0.6" />

                {/* Simulated Impact Trajectory (Solid Mint/Teal) */}
                <path d={simulatedPath} stroke={COLORS.deepTeal} strokeWidth="3" fill="none" strokeLinecap="round" />

                {/* Scrubber vertical line indicator */}
                {scrubIndex !== null && (
                  <>
                    <line
                      x1={activeX}
                      y1={pad.t}
                      x2={activeX}
                      y2={chartH - pad.b}
                      stroke={COLORS.navy}
                      strokeWidth="1.5"
                      strokeDasharray="2 3"
                    />
                    <circle cx={activeX} cy={getY(activePoint.simulated)} r="5" fill={COLORS.freshMint} stroke={COLORS.deepTeal} strokeWidth="2.5" />
                    <circle cx={activeX} cy={getY(activePoint.baseline)} r="4" fill="#475569" />
                  </>
                )}

                {/* X Axis Month Labels */}
                {trajectoryData.map((d, i) => (
                  <text
                    key={d.month}
                    x={getX(i)}
                    y={chartH - 12}
                    textAnchor="middle"
                    fill="#52728A"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.month}
                  </text>
                ))}
              </svg>

              {/* Scrubber Tooltip Bubble */}
              {scrubIndex !== null && (
                <div
                  className="absolute pointer-events-none -top-2 transform -translate-x-1/2 rounded-xl bg-navy text-white px-3 py-2 text-[11px] font-mono shadow-xl border border-teal/40"
                  style={{ left: `${(activeX / chartW) * 100}%` }}
                >
                  <div className="font-bold text-bright">{activePoint.month} Forecast</div>
                  <div className="flex justify-between gap-3 mt-1">
                    <span className="text-steel">Simulated:</span>
                    <span className={cn('font-semibold', activePoint.isBreach ? 'text-red-400' : 'text-white')}>
                      {inr(activePoint.simulated)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-[10px] text-white/60">
                    <span>Baseline:</span>
                    <span>{inr(activePoint.baseline)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-mono text-steel border-t border-mint/50 pt-3">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-4 bg-[#475569]" />
                Baseline Path (No Purchase)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-4 bg-teal rounded-full" />
                Simulated {paymentPlan.toUpperCase()} Trajectory
              </div>
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-4 border-b-2 border-dashed border-red-500" />
                Buffer Limit ({inr(criticalBuffer)})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact & Alternative Paths Row */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Multi-Goal Collision Matrix (6 cols) */}
        <div className="md:col-span-6 rounded-3xl bg-white border border-mint/80 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-navy">
              Active Goal Impacts & Delays
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-steel">
              Collision Matrix
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {/* Goal Item 1: Travel */}
            <div className="rounded-2xl border border-mint bg-aqua/30 p-4 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy">
                  {goalCollisions.travelGoal.title}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase',
                    goalCollisions.travelGoal.impactType === 'caution'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                  )}
                >
                  {goalCollisions.travelGoal.delayedMonths > 0
                    ? `Delayed by ${goalCollisions.travelGoal.delayedMonths} Months`
                    : 'On Track'}
                </span>
              </div>
              <p className="mt-2 text-xs font-mono text-steel">
                Monthly allocation adjusted from {goalCollisions.travelGoal.monthlyReduction}.
              </p>
            </div>

            {/* Goal Item 2: Emergency Reserve */}
            <div className="rounded-2xl border border-mint bg-aqua/30 p-4 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy">
                  {goalCollisions.emergencyReserve.title}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase',
                    goalCollisions.emergencyReserve.breached
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                  )}
                >
                  {goalCollisions.emergencyReserve.breached ? 'Breaches Threshold' : 'Safe Cushion'}
                </span>
              </div>
              <p className="mt-2 text-xs font-mono text-steel">
                {goalCollisions.emergencyReserve.breached
                  ? `Lowest projected balance falls to ${inr(goalCollisions.emergencyReserve.lowestBalance)}.`
                  : 'Maintains healthy liquid reserves above critical threshold throughout.'}
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Path Guidance Cards (6 cols) */}
        <div className="md:col-span-6 rounded-3xl bg-white border border-mint/80 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-navy">
              Alternative Smart Paths
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-steel">
              Trade-Off Engine
            </span>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {/* Alternative Card 1: Delay */}
            <div className="rounded-2xl border border-mint hover:border-teal p-5 bg-aqua/20 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal font-semibold">
                  Path 01 · Timing
                </span>
                <h4 className="mt-2 text-sm font-semibold text-navy">
                  Delay Purchase by 45 Days
                </h4>
                <div className="mt-3 inline-block rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-mono font-semibold text-emerald-700">
                  0 Goal Delays Induced
                </div>
                <p className="mt-2 text-xs text-steel leading-relaxed">
                  Allows allowance cushion to compound enough to avoid breaching the ₹5,000 threshold.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentPlan('lockout')}
                className="mt-4 w-full rounded-xl bg-navy hover:bg-teal text-white py-2 text-xs font-medium transition-colors"
              >
                Simulate 45-Day Delay
              </button>
            </div>

            {/* Alternative Card 2: Tier Adjustment */}
            <div className="rounded-2xl border border-mint hover:border-teal p-5 bg-aqua/20 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal font-semibold">
                  Path 02 · Spec Tier
                </span>
                <h4 className="mt-2 text-sm font-semibold text-navy">
                  Opt for Tier-2 Model ({inr(Math.round(cost * 0.75))})
                </h4>
                <div className="mt-3 inline-block rounded-md bg-amber-50 px-2 py-1 text-[11px] font-mono font-semibold text-amber-700">
                  Goa Trip Delayed 10 Days Only
                </div>
                <p className="mt-2 text-xs text-steel leading-relaxed">
                  Saves 25% upfront cost while preserving 90% of core performance specs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCost((prev) => Math.round(prev * 0.75))}
                className="mt-4 w-full rounded-xl bg-navy hover:bg-teal text-white py-2 text-xs font-medium transition-colors"
              >
                Apply Tier-2 Cost
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Peer Cohort Insights Drawer / Modal (Modal STU-02) */}
      {showCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-mint p-6 md:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowCohortModal(false)}
              className="absolute top-5 right-5 size-8 rounded-full bg-aqua text-navy hover:bg-mint flex items-center justify-center transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-teal font-semibold">
              <Users className="size-4" />
              Cohort Behavioral Insights (STU-02)
            </div>
            <h3 className="mt-2 text-xl font-semibold text-navy">
              Anonymized Peer Data
            </h3>
            <p className="text-xs text-steel">
              Based on 1,420 users in your income bracket evaluating similar commitments.
            </p>

            {/* Primary Stat Callout Box */}
            <div className="mt-6 rounded-2xl bg-aqua/50 border border-mint p-5">
              <div className="text-4xl font-bold font-mono text-teal">64%</div>
              <p className="mt-2 text-xs text-navy font-medium leading-relaxed">
                of students in your income bracket who chose a 6-month EMI reported noticeable financial strain by Month 3.
              </p>
            </div>

            {/* Horizontal Distribution Stacked Bar */}
            <div className="mt-6">
              <span className="text-xs font-semibold text-navy">Outcome Distribution</span>
              <div className="mt-2 flex h-4 w-full rounded-full overflow-hidden">
                <div className="w-[22%] bg-emerald-500" title="22% Met all goals" />
                <div className="w-[48%] bg-amber-400" title="48% Delayed non-essential" />
                <div className="w-[30%] bg-red-500" title="30% Regretted structure" />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div>
                  <span className="size-2 rounded-full inline-block bg-emerald-500 mr-1" />
                  <span className="text-navy font-bold">22%</span> Met all goals
                </div>
                <div>
                  <span className="size-2 rounded-full inline-block bg-amber-400 mr-1" />
                  <span className="text-navy font-bold">48%</span> Delayed later
                </div>
                <div>
                  <span className="size-2 rounded-full inline-block bg-red-500 mr-1" />
                  <span className="text-navy font-bold">30%</span> Regretted timing
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentPlan('3emi')
                  setShowCohortModal(false)
                }}
                className="flex-1 rounded-xl bg-teal hover:bg-navy text-white py-2.5 text-xs font-semibold transition-colors"
              >
                Apply Recommendation (3-Month EMI)
              </button>
              <button
                type="button"
                onClick={() => setShowCohortModal(false)}
                className="rounded-xl border border-mint px-4 py-2.5 text-xs font-medium text-steel hover:text-navy transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =========================================================================
// PART C: SOLE PROPRIETOR EXPERIENCE — COMMITMENT DASHBOARD (SOL-01)
// =========================================================================
function SoleProprietorSimulator() {
  const [toolName, setToolName] = useState('Adobe Creative Suite + SaaS Tooling')
  const [recurringCost, setRecurringCost] = useState(4500)
  const [lockInMonths, setLockInMonths] = useState<0 | 6 | 12>(6)
  const [penalty, setPenalty] = useState(8000)
  const [revenueScenario, setRevenueScenario] = useState<'conservative' | 'baseline' | 'aggressive' | 'crisis'>('baseline')

  // Financial baseline numbers
  const lowestMonthlyRevenue = 40000
  const baselineMonthlyRevenue = 85000
  const existingFixedOverhead = 14200
  const averageHourlyRate = 1200
  const clientRetainerRate = 25000

  // Total new overhead
  const totalOverhead = existingFixedOverhead + recurringCost

  // Fixed Commitment Ratio (FCR) calculation
  // Formula: FCR = Fixed Overhead / Lowest Monthly Revenue
  const fcrPercent = Math.round((totalOverhead / lowestMonthlyRevenue) * 100)

  // Risk bands: Green (<30%), Yellow (30-50%), Red (>50%)
  const fcrRisk = fcrPercent > 50 ? 'high' : fcrPercent >= 30 ? 'medium' : 'low'

  // Operational conversions
  const additionalRetainersNeeded = (recurringCost / clientRetainerRate).toFixed(1)
  const billableHoursNeeded = (recurringCost / averageHourlyRate).toFixed(1)

  // Total liability over contract lock-in
  const totalContractLiability = recurringCost * (lockInMonths || 1) + (lockInMonths ? penalty : 0)

  // PRD 7.1 Crisis Edge Case Calculations (Zero Inflow Burn-Only Runway)
  const initialReserves = 160000
  const daysUntilDepletion = Math.max(1, Math.floor((initialReserves / totalOverhead) * 30))
  const daysWithoutTool = Math.max(1, Math.floor((initialReserves / existingFixedOverhead) * 30))
  const daysSavedIfToolCancelled = Math.max(1, daysWithoutTool - daysUntilDepletion)

  // Revenue Stress-Test Months Data
  const stressTestData = useMemo(() => {
    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
    const multiplier =
      revenueScenario === 'conservative'
        ? 0.7
        : revenueScenario === 'aggressive'
          ? 1.2
          : revenueScenario === 'crisis'
            ? 0.0 // Zero inflow (PRD 7.1)
            : 1.0

    let runwayBalance = initialReserves // Starting operational buffer

    return months.map((m, idx) => {
      const revenue = Math.round(baselineMonthlyRevenue * multiplier)
      const net = revenue - totalOverhead
      runwayBalance += net

      // Check danger state
      const isNegativeState =
        revenueScenario === 'crisis'
          ? true
          : revenueScenario === 'conservative' && idx >= 3

      return {
        month: m,
        revenue,
        overhead: totalOverhead,
        net,
        runwayBalance: Math.max(0, runwayBalance),
        isDanger: isNegativeState,
      }
    })
  }, [revenueScenario, totalOverhead, initialReserves])

  return (
    <div className="space-y-8">
      {/* Top Header / Business Health Metric Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-mint/70 shadow-sm">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-teal font-semibold">
            Solo Practice / Agency Workspace
          </span>
          <h3 className="text-base font-semibold text-navy">
            Monthly Revenue Range: ₹40,000 – ₹1,20,000 / mo
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-aqua border border-mint text-navy font-mono text-xs font-semibold">
            Operational Runway: <span className="text-teal font-bold">4.2 Months</span>
          </div>
        </div>
      </div>

      {/* Grid: FCR Gauge & Tool Evaluator Card */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* FCR Gauge Card (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-mint/80 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-steel font-semibold">
                Stability Metric
              </span>
              <span
                className={cn(
                  'text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase',
                  fcrRisk === 'high'
                    ? 'bg-red-100 text-red-700'
                    : fcrRisk === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800',
                )}
              >
                {fcrRisk.toUpperCase()} RISK
              </span>
            </div>

            <h3 className="mt-2 text-lg font-semibold text-navy">
              Fixed Commitment Ratio (FCR)
            </h3>
            <p className="text-xs font-mono text-steel mt-0.5">
              Fixed Overhead ÷ Lowest Monthly Revenue
            </p>

            {/* 180-Degree Semi-Circle Radial Gauge SVG */}
            <div className="relative mt-6 flex flex-col items-center">
              <svg viewBox="0 0 240 130" className="w-[240px] h-[130px]">
                {/* Background Arc */}
                <path
                  d="M 20 120 A 100 100 0 0 1 220 120"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Active Colored Arc */}
                <path
                  d="M 20 120 A 100 100 0 0 1 220 120"
                  fill="none"
                  stroke={fcrRisk === 'high' ? COLORS.dangerRed : fcrRisk === 'medium' ? COLORS.warningAmber : COLORS.deepTeal}
                  strokeWidth="20"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${Math.min(100, fcrPercent)} 100`}
                  style={{ transition: 'stroke-dasharray 700ms ease, stroke 400ms ease' }}
                />
              </svg>

              <div className="absolute bottom-2 text-center">
                <span className="text-4xl font-bold font-mono tracking-tight text-navy tabular-nums">
                  {fcrPercent}%
                </span>
                <span className="block text-[10px] font-mono text-steel uppercase tracking-widest mt-0.5">
                  FCR Ratio
                </span>
              </div>
            </div>

            {/* Color Bands Legend */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-1.5 text-emerald-800">
                &lt; 30% Safe
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-1.5 text-amber-800">
                30–50% Moderate
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-1.5 text-red-800">
                &gt; 50% High Risk
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-mint/60 pt-4 text-xs font-mono text-steel">
            Formula: <span className="text-navy">{inr(totalOverhead)}</span> ÷ {inr(lowestMonthlyRevenue)}
          </div>
        </div>

        {/* Input Card: Overhead Evaluator Form (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-mint/80 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-steel font-semibold">
              New Overhead Evaluator
            </span>
            <span className="text-xs font-mono text-teal">Screen SOL-01</span>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {/* Field 1: Commitment Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                Commitment Name
              </label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-mint bg-aqua/30 px-4 py-2.5 text-sm font-medium text-navy focus:border-teal focus:outline-none"
              />
            </div>

            {/* Field 2: Recurring Cost */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                Monthly Recurring Cost
              </label>
              <div className="mt-1.5 relative flex items-center">
                <span className="absolute left-3.5 font-serif text-teal font-semibold">₹</span>
                <input
                  type="number"
                  value={recurringCost}
                  step={500}
                  onChange={(e) => setRecurringCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-mint bg-aqua/30 pl-8 pr-4 py-2 text-base font-bold text-navy focus:border-teal focus:outline-none"
                />
              </div>
            </div>

            {/* Field 3: Contract Commitment Lock-In */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                Contract Lock-In
              </label>
              <div className="mt-1.5 flex rounded-xl bg-aqua/60 p-1 border border-mint">
                {[
                  { m: 0, label: 'None' },
                  { m: 6, label: '6 Mos' },
                  { m: 12, label: '12 Mos' },
                ].map((l) => (
                  <button
                    key={l.m}
                    type="button"
                    onClick={() => setLockInMonths(l.m as any)}
                    className={cn(
                      'flex-1 rounded-lg py-1.5 text-xs font-mono transition-colors',
                      lockInMonths === l.m
                        ? 'bg-navy text-white font-bold'
                        : 'text-steel hover:text-navy',
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Early Termination Penalty */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                  Early Termination Penalty
                </label>
                <span className="text-xs font-mono text-steel">
                  Total Exposure: <span className="text-navy font-bold">{inr(totalContractLiability)}</span>
                </span>
              </div>
              <input
                type="number"
                value={penalty}
                step={1000}
                onChange={(e) => setPenalty(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-mint bg-aqua/30 px-4 py-2 text-sm font-semibold text-navy focus:border-teal focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stress-Test Section */}
      <div className="rounded-3xl bg-white border border-mint/80 p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-navy">
              Revenue Stress-Test & Cash Flow
            </h3>
            <p className="text-xs font-mono text-steel mt-0.5">
              Simulating overhead impact against revenue fluctuation models
            </p>
          </div>

          {/* Revenue Scenario Pills */}
          <div className="flex flex-wrap rounded-full bg-aqua p-1 border border-mint text-xs font-mono">
            {[
              { id: 'conservative', label: 'Conservative (-30%)' },
              { id: 'baseline', label: 'Baseline Average' },
              { id: 'aggressive', label: 'Aggressive (+20%)' },
              { id: 'crisis', label: '⚠️ Crisis Mode (Zero Inflow)' },
            ].map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setRevenueScenario(sc.id as any)
                  if (sc.id === 'crisis') {
                    sound.warning()
                  } else {
                    sound.snap('low')
                  }
                }}
                className={cn(
                  'rounded-full px-3.5 py-1.5 transition-all',
                  revenueScenario === sc.id
                    ? sc.id === 'crisis'
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/30'
                      : 'bg-navy text-white font-bold'
                    : sc.id === 'crisis'
                      ? 'text-red-600 hover:bg-red-50 font-semibold'
                      : 'text-steel hover:text-navy',
                )}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stress-Test Data Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {stressTestData.map((st) => (
            <div
              key={st.month}
              className={cn(
                'rounded-2xl border p-3.5 text-center transition-all',
                st.isDanger
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : 'border-mint bg-aqua/20 text-navy',
              )}
            >
              <div className="text-[11px] font-mono text-steel">{st.month}</div>
              <div className="mt-1 font-mono text-xs font-bold tabular-nums">
                {inr(st.net)}
              </div>
              <div
                className={cn(
                  'mt-1 text-[9px] font-mono uppercase tracking-wider',
                  st.isDanger ? 'text-red-700 font-bold' : 'text-teal',
                )}
              >
                {st.isDanger ? 'Danger Zone' : 'Positive'}
              </div>
            </div>
          ))}
        </div>

        {/* Commitment Drift / Burn-Rate Banner */}
        {revenueScenario === 'crisis' ? (
          <div className="mt-6 rounded-2xl p-5 border border-red-300 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 text-red-950 space-y-3 shadow-md animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-red-700 font-bold font-mono text-sm uppercase tracking-wider">
                <Flame className="size-5 text-red-600 animate-bounce" />
                Burn-Only Runway Visualizer · PRD Edge Case 7.1
              </div>
              <div className="rounded-full bg-red-600 text-white px-3.5 py-1 font-mono text-xs font-bold shadow-sm tracking-wide">
                {daysUntilDepletion} DAYS REMAINING
              </div>
            </div>
            <p className="text-xs md:text-sm leading-relaxed text-red-900 font-medium">
              <strong>Zero Inflow Scenario:</strong> With revenue at ₹0, your operational cash reserves of <strong>{inr(initialReserves)}</strong> will be completely exhausted in approximately <strong>{daysUntilDepletion} days</strong> ({Math.ceil(daysUntilDepletion / 30)} months) at your current total overhead burn rate of <strong>{inr(totalOverhead)}/mo</strong>.
            </p>
            <div className="pt-2 border-t border-red-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-red-700 font-semibold">
                🛡️ Defense Protocol: De-committing from &ldquo;{toolName}&rdquo; saves {inr(recurringCost)}/mo
              </span>
              <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-md font-bold">
                Extends Runway by +{daysSavedIfToolCancelled} Days
              </span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'mt-6 rounded-2xl p-4 flex items-center gap-3 border text-xs md:text-sm font-medium',
              revenueScenario === 'conservative'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900',
            )}
          >
            {revenueScenario === 'conservative' ? (
              <>
                <AlertTriangle className="size-5 text-red-600 shrink-0" />
                <span>
                  <strong>High Risk Warning:</strong> If revenue drops to your historical -30% July low, this commitment creates a negative cash flow state by Month 4.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Safe Commitment:</strong> Projected cash flow stays positive and maintains 4+ months operational runway across selected scenario.
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Operational Workload & Unit Conversion Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Card 1: Client Retainer Unit Conversion */}
        <div className="rounded-3xl bg-white border border-mint/80 p-6 shadow-sm flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-aqua border border-mint flex items-center justify-center shrink-0">
            <Briefcase className="size-6 text-teal" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-steel font-semibold">
              Workload Conversion
            </span>
            <h4 className="text-xl font-bold font-mono text-navy mt-1">
              +{additionalRetainersNeeded} Client Retainers / mo
            </h4>
            <p className="mt-1 text-xs text-steel leading-relaxed">
              Required billable capacity increase to fully offset this recurring {inr(recurringCost)} commitment without cutting profit margin.
            </p>
          </div>
        </div>

        {/* Card 2: Billable Hours Break-Even */}
        <div className="rounded-3xl bg-white border border-mint/80 p-6 shadow-sm flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-aqua border border-mint flex items-center justify-center shrink-0">
            <Clock className="size-6 text-teal" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-steel font-semibold">
              Hourly Break-Even
            </span>
            <h4 className="text-xl font-bold font-mono text-navy mt-1">
              {billableHoursNeeded} Billable Hours / mo
            </h4>
            <p className="mt-1 text-xs text-steel leading-relaxed">
              Additional work required at your current average hourly rate ({inr(averageHourlyRate)}/hr) solely to cover this new tool's overhead.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
