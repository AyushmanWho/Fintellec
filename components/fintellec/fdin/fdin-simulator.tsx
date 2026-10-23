'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  Users,
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'
import { sound } from '@/lib/sound'

// =========================================================================
// ARCHETYPE CONFIGURATIONS (STUDENT vs YOUNG PROFESSIONAL)
// =========================================================================
type ArchetypeKey = 'student' | 'professional'

interface ArchetypeConfig {
  id: ArchetypeKey
  name: string
  subtitle: string
  pillBadge: string
  financialIQ: number
  startingBalance: number
  monthlyInflow: number
  monthlyInflowLabel: string
  monthlyFixed: number
  monthlyFixedLabel: string
  criticalBuffer: number
  criticalBufferLabel: string
  minCost: number
  maxCost: number
  stepCost: number
  defaultPurchase: string
  defaultCost: number
  defaultPlan: 'upfront' | '3emi' | '6emi' | 'lockout'
  quickPicks: Array<{ name: string; cost: number }>
  primaryGoal: {
    title: string
    targetMonthly: number
    reducedMonthly: number
  }
  emergencyReserveName: string
  cohortTitle: string
  cohortSampleSize: string
  cohortRiskStat: string
  cohortRiskText: string
  smartPath1: {
    tag: string
    title: string
    badge: string
    desc: string
    buttonText: string
  }
  smartPath2: {
    tag: string
    title: string
    badge: string
    desc: string
    buttonText: string
    discountFactor: number
  }
}

const ARCHETYPES: Record<ArchetypeKey, ArchetypeConfig> = {
  student: {
    id: 'student',
    name: 'Student',
    subtitle: 'Allowance, side-gigs, hostel living & semester goals',
    pillBadge: 'Student Workspace · Campus Life',
    financialIQ: 680,
    startingBalance: 24000,
    monthlyInflow: 28000,
    monthlyInflowLabel: 'Allowance & Stipend',
    monthlyFixed: 14000,
    monthlyFixedLabel: 'Hostel, Dining & Subscriptions',
    criticalBuffer: 5000,
    criticalBufferLabel: 'Hostel Safety Cushion',
    minCost: 5000,
    maxCost: 120000,
    stepCost: 1000,
    defaultPurchase: 'Gaming Laptop',
    defaultCost: 65000,
    defaultPlan: '6emi',
    quickPicks: [
      { name: 'Gaming Laptop', cost: 65000 },
      { name: 'Goa Trip', cost: 22000 },
      { name: 'Smart Watch', cost: 18000 },
      { name: 'Phone Upgrade', cost: 54000 },
      { name: 'Gym Membership', cost: 12000 },
      { name: 'Used Commuter Bike', cost: 36000 },
    ],
    primaryGoal: {
      title: 'Goa Trip Fund (Target: Nov 2026)',
      targetMonthly: 3000,
      reducedMonthly: 1200,
    },
    emergencyReserveName: 'Hostel Cushion Reserve (₹5,000)',
    cohortTitle: 'Student Behavioral Insights',
    cohortSampleSize: '1,420 campus interns & students',
    cohortRiskStat: '64%',
    cohortRiskText: 'of students in your allowance bracket choosing 6-month EMIs reported noticeable financial crunch before semester end.',
    smartPath1: {
      tag: 'Path 01 · Timing',
      title: 'Delay Purchase by 45 Days',
      badge: '0 Goal Delays Induced',
      desc: 'Allows allowance cushion to compound enough to avoid breaching the critical ₹5,000 buffer.',
      buttonText: 'Simulate 45-Day Delay',
    },
    smartPath2: {
      tag: 'Path 02 · Student Discount',
      title: 'Opt for Student Discount / Tier-2',
      badge: 'Goa Trip Delayed 10 Days Only',
      desc: 'Saves 25% upfront cost while preserving 90% of core performance specs.',
      buttonText: 'Apply 25% Student Discount',
      discountFactor: 0.75,
    },
  },
  professional: {
    id: 'professional',
    name: 'Young Professional',
    subtitle: 'Salaried career, rent deposits, lifestyle upgrades & investments',
    pillBadge: 'Career Workspace · Young Professional',
    financialIQ: 740,
    startingBalance: 120000,
    monthlyInflow: 85000,
    monthlyInflowLabel: 'Monthly In-Hand Salary',
    monthlyFixed: 38000,
    monthlyFixedLabel: 'Rent, EMIs, Utilities & Living',
    criticalBuffer: 30000,
    criticalBufferLabel: '6-Month Emergency Runway',
    minCost: 15000,
    maxCost: 350000,
    stepCost: 5000,
    defaultPurchase: 'MacBook Pro M3 Max',
    defaultCost: 145000,
    defaultPlan: '6emi',
    quickPicks: [
      { name: 'MacBook Pro M3 Max', cost: 145000 },
      { name: 'Europe Vacation', cost: 180000 },
      { name: 'Rental Security Deposit', cost: 95000 },
      { name: 'EV Scooter / Bike', cost: 125000 },
      { name: 'Home Office Ergonomics', cost: 42000 },
      { name: 'Health Insurance Premium', cost: 24000 },
    ],
    primaryGoal: {
      title: 'First Home Equity Fund (Target: 2028)',
      targetMonthly: 20000,
      reducedMonthly: 8500,
    },
    emergencyReserveName: 'Emergency Living Runway (₹30,000)',
    cohortTitle: 'Professional Peer Insights',
    cohortSampleSize: '2,840 early-career tech & finance professionals',
    cohortRiskStat: '58%',
    cohortRiskText: 'of early-career professionals locking ₹1.4L+ on 6-month EMIs delayed their emergency savings targets by over 4 months.',
    smartPath1: {
      tag: 'Path 01 · Bonus Timing',
      title: 'Fund 60% from Quarterly Bonus',
      badge: '0 Runway Dip Induced',
      desc: 'Locks purchase until performance bonus arrives, keeping monthly salary buffer completely untouched.',
      buttonText: 'Simulate Bonus Timing',
    },
    smartPath2: {
      tag: 'Path 02 · Smart Refurbished',
      title: 'Opt for Certified Refurbished Model',
      badge: 'Equity Goal Delayed 12 Days Only',
      desc: 'Saves 25% upfront capital with full Apple warranty, preventing runway compromise.',
      buttonText: 'Apply 25% Refurbished Cost',
      discountFactor: 0.75,
    },
  },
}

// =========================================================================
// IPHONE LIQUID GLASS CARD CONTAINER (SPECULAR SHEEN + SPOTLIGHT CAUSTIC)
// =========================================================================
function LiquidGlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseLeave={() => setMousePos(null)}
      className={cn('iphone-liquid-glass group relative overflow-hidden rounded-[28px]', className)}
    >
      {/* Curved Apple Specular Sheen */}
      <div className="iphone-glass-sheen" />

      {/* Interactive Cursor Spotlight Caustic Refraction */}
      {mousePos && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-200 z-1"
          style={{
            background: `radial-gradient(460px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.55), rgba(99, 220, 211, 0.16) 40%, transparent 70%)`,
          }}
        />
      )}

      {/* Card Inner Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">{children}</div>
    </div>
  )
}

// =========================================================================
// APPLE LIQUID GLASS NAVIGATION BAR TOGGLE (REEL_50 ENGINE)
// =========================================================================
function AppleLiquidToggle({
  archetypeKey,
  onChange,
}: {
  archetypeKey: ArchetypeKey
  onChange: (key: ArchetypeKey) => void
}) {
  const navRef = useRef<HTMLDivElement>(null)
  const studentBtnRef = useRef<HTMLButtonElement>(null)
  const profBtnRef = useRef<HTMLButtonElement>(null)
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  // Synchronize sliding pill geometry with the active button
  useEffect(() => {
    const activeBtn = archetypeKey === 'student' ? studentBtnRef.current : profBtnRef.current
    if (activeBtn) {
      setPillStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      })
    }
  }, [archetypeKey])

  // Mousemove listener for dynamic 3D optical glare refraction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return
    const rect = navRef.current.getBoundingClientRect()
    navRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`)
    navRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  return (
    <nav
      ref={navRef}
      onMouseMove={handleMouseMove}
      className="liquid-nav select-none shadow-[0_24px_60px_-15px_rgba(0,51,101,0.18)]"
      aria-label="Archetype selector"
    >
      {/* Dynamic 3D Optical Glare follows mouse */}
      <div className="liquid-glare-container">
        <div className="liquid-glare" />
      </div>

      <div className="liquid-nav-items">
        {/* Animated Sliding Active Navy Pill */}
        <div
          className="liquid-active-pill"
          style={{
            transform: `translateX(${pillStyle.left}px)`,
            width: pillStyle.width ? `${pillStyle.width}px` : undefined,
          }}
        />

        {/* Student Button */}
        <button
          ref={studentBtnRef}
          type="button"
          onClick={() => {
            onChange('student')
            sound.snap('high')
          }}
          className={cn(
            'liquid-nav-btn',
            archetypeKey === 'student' ? 'active' : 'bg-white/40 backdrop-blur-sm hover:bg-white/60',
          )}
        >
          <div className="liquid-btn-content">
            <GraduationCap
              className={cn(
                'size-4 transition-colors',
                archetypeKey === 'student' ? 'text-purple-300' : 'text-purple-600',
              )}
            />
            <span className="font-semibold text-sm">Student</span>
          </div>
        </button>

        {/* Young Professional Button */}
        <button
          ref={profBtnRef}
          type="button"
          onClick={() => {
            onChange('professional')
            sound.snap('high')
          }}
          className={cn(
            'liquid-nav-btn',
            archetypeKey === 'professional' ? 'active' : 'bg-white/40 backdrop-blur-sm hover:bg-white/60',
          )}
        >
          <div className="liquid-btn-content">
            <Briefcase
              className={cn(
                'size-4 transition-colors',
                archetypeKey === 'professional' ? 'text-bright' : 'text-teal',
              )}
            />
            <span className="font-semibold text-sm">Young Professional</span>
          </div>
        </button>
      </div>
    </nav>
  )
}

export function FdinSimulator() {
  const [archetypeKey, setArchetypeKey] = useState<ArchetypeKey>('student')
  const config = ARCHETYPES[archetypeKey]

  return (
    <section
      id="simulator"
      aria-labelledby="simulator-title"
      className="relative py-24 md:py-36 overflow-hidden scroll-mt-20"
      style={{
        background:
          'radial-gradient(75% 55% at 15% 25%, rgba(99, 220, 211, 0.38) 0%, transparent 70%), radial-gradient(80% 60% at 85% 70%, rgba(0, 169, 158, 0.32) 0%, transparent 70%), linear-gradient(180deg, #F0FAF7 0%, #E3F7F3 45%, #EBF8F5 100%)',
      }}
    >
      {/* Background Liquid Aurora Mesh Blobs (Breathing color bodies from Reel_50 style53.css) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Blob 1 */}
        <div className="apple-liquid-blob w-[50vw] h-[50vw] -top-[10%] -left-[10%] bg-[#63DCD3]/55" style={{ animationDelay: '0s' }} />
        {/* Blob 2 */}
        <div className="apple-liquid-blob w-[45vw] h-[45vw] -bottom-[10%] -right-[10%] bg-[#00A99E]/45" style={{ animationDelay: '-5s' }} />
        {/* Blob 3 */}
        <div className="apple-liquid-blob w-[38vw] h-[38vw] top-[25%] left-[35%] bg-[#B8F2EC]/70" style={{ animationDelay: '-10s' }} />

        {/* Caustic Grid Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,51,101,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2
            id="simulator-title"
            className="text-balance text-[clamp(2.4rem,5.2vw,4.5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-navy"
          >
            Real-time consequences.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-bright to-teal">
              Zero judgment.
            </span>
          </h2>
          <p className="mt-4 text-steel text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Every decision triggers an instant ripple across your future. Simulate major purchases, EMIs, or lifestyle shifts before locking in.
          </p>

          {/* Apple Liquid Navigation Bar Toggle (Reel_50 Engine) */}
          <div className="mt-9 flex justify-center">
            <AppleLiquidToggle archetypeKey={archetypeKey} onChange={setArchetypeKey} />
          </div>
        </div>

        {/* Dynamic iPhone Glassmorphism Simulator */}
        <div className="mt-12">
          <IphoneGlassSimulator key={config.id} config={config} />
        </div>
      </div>
    </section>
  )
}

// =========================================================================
// IPHONE GLASSMORPHISM SIMULATOR ENGINE (UNIFIED & INTERACTIVE)
// =========================================================================
function IphoneGlassSimulator({ config }: { config: ArchetypeConfig }) {
  const [purchaseName, setPurchaseName] = useState(config.defaultPurchase)
  const [cost, setCost] = useState(config.defaultCost)
  const [paymentPlan, setPaymentPlan] = useState<'upfront' | '3emi' | '6emi' | 'lockout'>(config.defaultPlan)
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '12M'>('12M')
  const [scrubIndex, setScrubIndex] = useState<number | null>(null)
  const [showCohortModal, setShowCohortModal] = useState(false)

  // Reset local state when archetype flips
  useEffect(() => {
    setPurchaseName(config.defaultPurchase)
    setCost(config.defaultCost)
    setPaymentPlan(config.defaultPlan)
    setScrubIndex(null)
  }, [config])

  // Trajectory Simulation Calculation
  const trajectoryData = useMemo(() => {
    const monthsCount = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12
    const allMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    const months = allMonths.slice(0, monthsCount)

    let currentBase = config.startingBalance
    let currentSim = config.startingBalance

    return months.map((month, idx) => {
      // Baseline net monthly savings
      const netMonthly = config.monthlyInflow - config.monthlyFixed
      currentBase += netMonthly

      // Deductions based on chosen plan
      let deduction = 0
      if (paymentPlan === 'upfront') {
        if (idx === 0) deduction = cost
      } else if (paymentPlan === '3emi') {
        if (idx < 3) deduction = Math.round(cost / 3)
      } else if (paymentPlan === '6emi') {
        if (idx < 6) deduction = Math.round(cost / 6)
      } else if (paymentPlan === 'lockout') {
        // Disciplined pre-lockout: split over 4 months, zero ongoing debt
        if (idx < 4) deduction = Math.round(cost / 4)
      }

      currentSim += netMonthly - deduction
      const isBreach = currentSim < config.criticalBuffer

      return {
        month,
        baseline: currentBase,
        simulated: currentSim,
        deduction,
        isBreach,
      }
    })
  }, [cost, paymentPlan, timeRange, config])

  // Multi-Goal Collisions Calculation
  const goalCollisions = useMemo(() => {
    const isEmiStrain = paymentPlan === '6emi' && cost >= (config.id === 'student' ? 50000 : 120000)
    const delayMonths = isEmiStrain ? 2.5 : cost > (config.id === 'student' ? 30000 : 75000) ? 1.2 : 0
    const cushionBreach = trajectoryData.some((p) => p.isBreach)
    const lowestBalance = Math.min(...trajectoryData.map((d) => d.simulated))

    return {
      travelGoal: {
        title: config.primaryGoal.title,
        delayedMonths: delayMonths,
        monthlyReduction: isEmiStrain
          ? `${inr(config.primaryGoal.targetMonthly)} → ${inr(config.primaryGoal.reducedMonthly)}`
          : `${inr(config.primaryGoal.targetMonthly)} → ${inr(Math.round(config.primaryGoal.targetMonthly * 0.8))}`,
      },
      emergencyReserve: {
        title: config.emergencyReserveName,
        breached: cushionBreach,
        lowestBalance,
      },
    }
  }, [cost, paymentPlan, trajectoryData, config])

  // Chart Coordinate Math
  const maxVal = Math.max(
    ...trajectoryData.map((d) => Math.max(d.baseline, d.simulated)),
    config.startingBalance * 1.8,
  )
  const minVal = Math.min(
    ...trajectoryData.map((d) => Math.min(d.baseline, d.simulated)),
    0,
  )
  const range = maxVal - minVal || 1

  const chartW = 760
  const chartH = 260
  const pad = { t: 20, b: 35, l: 55, r: 25 }

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

  const areaPath = `${simulatedPath} L ${getX(trajectoryData.length - 1)} ${chartH - pad.b} L ${getX(0)} ${chartH - pad.b} Z`

  const criticalY = getY(config.criticalBuffer)
  const activePoint = scrubIndex !== null ? trajectoryData[scrubIndex] : trajectoryData[trajectoryData.length - 1]
  const activeX = scrubIndex !== null ? getX(scrubIndex) : getX(trajectoryData.length - 1)

  return (
    <div className="space-y-8">
      {/* --------------------------------------------------------------- */}
      {/* 1. IPHONE FROSTED TOP STATUS BAR                                */}
      {/* --------------------------------------------------------------- */}
      <LiquidGlassCard className="p-4 md:px-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'size-2.5 rounded-full animate-pulse',
                config.id === 'student'
                  ? 'bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.85)]'
                  : 'bg-teal shadow-[0_0_10px_rgba(0,169,158,0.85)]',
              )}
            />
            <span className="font-mono text-xs uppercase tracking-wider text-navy font-semibold">
              {config.pillBadge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Financial IQ Frosted Badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full iphone-liquid-inset text-navy text-xs font-mono font-medium shadow-xs">
              <img src="/fintellec-f.png" alt="" aria-hidden="true" className="h-4 w-auto shrink-0" />
              <span>Financial IQ:</span>
              <span className="font-bold bg-gradient-to-r from-amber-500 to-teal bg-clip-text text-transparent">{config.financialIQ}</span>
            </div>

            {/* Liquid Cash Cushion Badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-navy text-white text-xs font-mono font-medium shadow-sm border border-teal/40">
              <span className="text-bright font-normal">Buffer:</span>
              <span className="font-bold text-white">{inr(config.startingBalance)}</span>
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* --------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN GRID (DECISION BUILDER + TRAJECTORY CHART)    */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-8 lg:grid-cols-12 items-stretch">
        {/* Left Column: Decision Builder Card (5 cols) */}
        <LiquidGlassCard className="lg:col-span-5 p-6 md:p-8">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-steel font-semibold">
                Decision Builder
              </span>
              <span className="text-[10px] font-mono text-teal iphone-liquid-inset px-3 py-1 rounded-full font-semibold shadow-xs">
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
                className="mt-2 w-full iphone-liquid-inset rounded-2xl px-4 py-3 text-sm font-semibold text-navy placeholder:text-steel/50 focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-all"
                placeholder="e.g. Laptop, Trip, Deposit"
              />

              {/* Quick Pick Apple Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {config.quickPicks.map((pick) => (
                  <button
                    key={pick.name}
                    type="button"
                    onClick={() => {
                      setPurchaseName(pick.name)
                      setCost(pick.cost)
                      sound.snap('low')
                    }}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-mono transition-all duration-200 select-none',
                      purchaseName === pick.name
                        ? 'bg-teal text-white font-semibold shadow-[0_3px_12px_rgba(0,169,158,0.4)] border border-teal-300/50'
                        : 'iphone-liquid-inset text-steel hover:text-navy hover:bg-white/60',
                    )}
                  >
                    {pick.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Total Cost with Native Glass Slider */}
            <div className="mt-6">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                  Estimated Total Cost
                </label>
                <span className="font-mono text-xs text-steel">Drag or type</span>
              </div>

              <div className="mt-2 relative flex items-center">
                <span className="absolute left-4 text-xl font-medium text-teal font-serif select-none">₹</span>
                <input
                  type="number"
                  value={cost}
                  step={config.stepCost}
                  min={config.minCost}
                  max={config.maxCost * 1.25}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full iphone-liquid-inset rounded-2xl pl-10 pr-4 py-3 text-2xl font-bold tracking-tight text-navy focus:border-teal/60 focus:outline-none focus:ring-2 focus:ring-teal/20 transition-all tabular-nums"
                />
              </div>

              <input
                type="range"
                min={config.minCost}
                max={config.maxCost}
                step={config.stepCost}
                value={cost}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setCost(val)
                  sound.tick(700 + val / 150)
                }}
                className="fin-range mt-3.5 w-full cursor-pointer"
              />
            </div>

            {/* Payment Structure (iPhone Control Tiles) */}
            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                Payment Structure
              </label>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
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
                      'rounded-2xl p-3.5 text-left transition-all duration-200 select-none iphone-glass-tile',
                      paymentPlan === plan.id && 'iphone-glass-tile-active',
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

          {/* Peer Cohort Link */}
          <div className="mt-6 pt-5 border-t border-navy/10 flex items-center justify-between">
            <span className="text-xs text-steel">Need behavioral context?</span>
            <button
              type="button"
              onClick={() => {
                setShowCohortModal(true)
                sound.chime()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-teal hover:text-navy transition-colors select-none iphone-liquid-inset px-3 py-1.5 rounded-full"
            >
              <Users className="size-3.5" />
              <span>See Cohort Insights →</span>
            </button>
          </div>
        </LiquidGlassCard>

        {/* Right Column: Financial Trajectory Chart Card (7 cols) */}
        <LiquidGlassCard className="lg:col-span-7 p-6 md:p-8">
          <div>
            {/* Card Header & Time Range Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-navy">
                  Financial Trajectory Projection
                </h3>
                <p className="text-xs font-mono text-steel mt-0.5">
                  Simulating net liquid cash balance over time
                </p>
              </div>

              {/* iOS Range Switcher */}
              <div className="flex rounded-full iphone-liquid-inset p-1 shadow-xs">
                {(['3M', '6M', '12M'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setTimeRange(r)
                      sound.snap('low')
                    }}
                    className={cn(
                      'rounded-full px-3.5 py-1 text-xs font-mono font-semibold transition-all select-none',
                      timeRange === r
                        ? 'bg-navy text-white shadow-xs'
                        : 'text-steel hover:text-navy',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Glass Chart Canvas */}
            <div
              className="mt-6 relative w-full h-[270px] select-none rounded-2xl iphone-liquid-inset p-2 shadow-inner"
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
                <defs>
                  <linearGradient id="sim-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00A99E" />
                    <stop offset="100%" stopColor="#63DCD3" />
                  </linearGradient>
                  <linearGradient id="sim-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A99E" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#63DCD3" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#63DCD3" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Grid Guidelines */}
                <line x1={pad.l} y1={getY(maxVal * 0.25)} x2={chartW - pad.r} y2={getY(maxVal * 0.25)} stroke="#003365" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={pad.l} y1={getY(maxVal * 0.50)} x2={chartW - pad.r} y2={getY(maxVal * 0.50)} stroke="#003365" strokeOpacity="0.08" strokeDasharray="3 3" />
                <line x1={pad.l} y1={getY(maxVal * 0.75)} x2={chartW - pad.r} y2={getY(maxVal * 0.75)} stroke="#003365" strokeOpacity="0.08" strokeDasharray="3 3" />

                {/* Liquid Gradient Area Under Simulated Curve */}
                <path d={areaPath} fill="url(#sim-area)" />

                {/* Critical Safety Buffer Line */}
                <line
                  x1={pad.l}
                  y1={criticalY}
                  x2={chartW - pad.r}
                  y2={criticalY}
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text x={pad.l + 6} y={criticalY - 6} fill="#EF4444" fontSize="9" fontFamily="monospace" fontWeight="600">
                  SAFETY BUFFER ({inr(config.criticalBuffer)})
                </text>

                {/* Baseline Trendline */}
                <path d={baselinePath} stroke="#475569" strokeWidth="2" fill="none" opacity="0.45" />

                {/* Simulated Impact Trajectory Line */}
                <path d={simulatedPath} stroke="url(#sim-grad)" strokeWidth="3.2" fill="none" strokeLinecap="round" />

                {/* Scrubber vertical line indicator */}
                {scrubIndex !== null && (
                  <>
                    <line
                      x1={activeX}
                      y1={pad.t}
                      x2={activeX}
                      y2={chartH - pad.b}
                      stroke="#003365"
                      strokeWidth="1.5"
                      strokeDasharray="2 3"
                    />
                    <circle cx={activeX} cy={getY(activePoint.simulated)} r="6" fill="#63DCD3" stroke="#003365" strokeWidth="2.5" />
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

              {/* Scrubber Glass Tooltip Popover */}
              {scrubIndex !== null && (
                <div
                  className="absolute pointer-events-none -top-3 transform -translate-x-1/2 rounded-2xl bg-navy/95 backdrop-blur-xl text-white px-3.5 py-2.5 text-[11px] font-mono shadow-2xl border border-teal/40"
                  style={{ left: `${(activeX / chartW) * 100}%` }}
                >
                  <div className="font-bold text-bright">{activePoint.month} Forecast</div>
                  <div className="flex justify-between gap-4 mt-1">
                    <span className="text-steel">Simulated:</span>
                    <span className={cn('font-semibold', activePoint.isBreach ? 'text-red-400 font-bold' : 'text-white')}>
                      {inr(activePoint.simulated)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-[10px] text-white/60">
                    <span>Baseline:</span>
                    <span>{inr(activePoint.baseline)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-mono text-steel border-t border-navy/10 pt-3">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-4 bg-[#475569]" />
                <span>Baseline (No Purchase)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-4 bg-teal rounded-full" />
                <span>Simulated {paymentPlan.toUpperCase()} Path</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-4 border-b-2 border-dashed border-red-500" />
                <span>Buffer Limit ({inr(config.criticalBuffer)})</span>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* 3. BOTTOM ROW: COLLISION MATRIX + SMART ALTERNATIVE PATHS      */}
      {/* --------------------------------------------------------------- */}
      <div className="grid gap-8 md:grid-cols-12 items-stretch">
        {/* Goal Collision Matrix (6 cols) */}
        <LiquidGlassCard className="md:col-span-6 p-6 md:p-8">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy">
                Active Goal Impacts & Delays
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-steel iphone-liquid-inset px-2.5 py-0.5 rounded-full font-semibold">
                Collision Matrix
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {/* Primary Savings Goal Impact */}
              <div className="rounded-2xl iphone-liquid-inset p-4.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy">
                    {goalCollisions.travelGoal.title}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase',
                      goalCollisions.travelGoal.delayedMonths > 0
                        ? 'bg-amber-500/15 text-amber-900 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-900 border border-emerald-500/30',
                    )}
                  >
                    {goalCollisions.travelGoal.delayedMonths > 0
                      ? `Delayed by ${goalCollisions.travelGoal.delayedMonths} Months`
                      : 'On Track'}
                  </span>
                </div>
                <p className="mt-2 text-xs font-mono text-steel">
                  Monthly allocation adjusted to {goalCollisions.travelGoal.monthlyReduction}.
                </p>
              </div>

              {/* Emergency Reserve Cushion Impact */}
              <div className="rounded-2xl iphone-liquid-inset p-4.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy">
                    {goalCollisions.emergencyReserve.title}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase',
                      goalCollisions.emergencyReserve.breached
                        ? 'bg-red-500/15 text-red-900 border border-red-500/30'
                        : 'bg-emerald-500/15 text-emerald-900 border border-emerald-500/30',
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
        </LiquidGlassCard>

        {/* Alternative Smart Paths (6 cols) */}
        <LiquidGlassCard className="md:col-span-6 p-6 md:p-8">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy">
                Alternative Smart Paths
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-steel iphone-liquid-inset px-2.5 py-0.5 rounded-full font-semibold">
                Trade-Off Engine
              </span>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3.5">
              {/* Alternative Path 1: Timing */}
              <div className="rounded-2xl iphone-liquid-inset hover:border-teal/50 p-4.5 flex flex-col justify-between transition-all shadow-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal font-semibold">
                    {config.smartPath1.tag}
                  </span>
                  <h4 className="mt-1.5 text-sm font-semibold text-navy">
                    {config.smartPath1.title}
                  </h4>
                  <div className="mt-2.5 inline-block rounded-md bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold">
                    {config.smartPath1.badge}
                  </div>
                  <p className="mt-2 text-xs text-steel leading-relaxed">
                    {config.smartPath1.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentPlan('lockout')
                    sound.snap('high')
                  }}
                  className="mt-4 w-full rounded-xl bg-navy hover:bg-teal text-white py-2.5 text-xs font-semibold transition-colors shadow-xs"
                >
                  {config.smartPath1.buttonText}
                </button>
              </div>

              {/* Alternative Path 2: Tier Spec / Discount */}
              <div className="rounded-2xl iphone-liquid-inset hover:border-teal/50 p-4.5 flex flex-col justify-between transition-all shadow-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal font-semibold">
                    {config.smartPath2.tag}
                  </span>
                  <h4 className="mt-1.5 text-sm font-semibold text-navy">
                    {config.smartPath2.title} ({inr(Math.round(cost * config.smartPath2.discountFactor))})
                  </h4>
                  <div className="mt-2.5 inline-block rounded-md bg-amber-500/15 text-amber-900 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold">
                    {config.smartPath2.badge}
                  </div>
                  <p className="mt-2 text-xs text-steel leading-relaxed">
                    {config.smartPath2.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCost((prev) => Math.round(prev * config.smartPath2.discountFactor))
                    sound.snap('high')
                  }}
                  className="mt-4 w-full rounded-xl bg-navy hover:bg-teal text-white py-2.5 text-xs font-semibold transition-colors shadow-xs"
                >
                  {config.smartPath2.buttonText}
                </button>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* 4. IPHONE FROSTED PEER COHORT MODAL SHEET                      */}
      {/* --------------------------------------------------------------- */}
      {showCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[32px] iphone-liquid-glass p-6 md:p-8 shadow-[0_30px_90px_rgba(0,51,101,0.3)]">
            <div className="iphone-glass-sheen" />

            <div className="relative z-10">
              <button
                type="button"
                onClick={() => setShowCohortModal(false)}
                className="absolute top-0 right-0 size-8 rounded-full iphone-liquid-inset hover:bg-white text-navy flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-2 font-mono text-xs text-teal font-semibold">
                <Users className="size-4" />
                <span>{config.cohortTitle}</span>
              </div>

              <h3 className="mt-2 text-xl font-semibold text-navy">
                Anonymized Peer Data
              </h3>
              <p className="text-xs text-steel mt-0.5">
                {config.cohortSampleSize}
              </p>

              {/* Stat Callout Bubble */}
              <div className="mt-5 rounded-2xl iphone-liquid-inset border-teal/30 p-5">
                <div className="text-4xl font-bold font-mono text-teal">{config.cohortRiskStat}</div>
                <p className="mt-2 text-xs text-navy font-medium leading-relaxed">
                  {config.cohortRiskText}
                </p>
              </div>

              {/* Outcome Distribution */}
              <div className="mt-5">
                <span className="text-xs font-semibold text-navy">Outcome Distribution</span>
                <div className="mt-2 flex h-3.5 w-full rounded-full overflow-hidden shadow-inner">
                  <div className="w-[26%] bg-emerald-500" title="Met all goals" />
                  <div className="w-[46%] bg-amber-400" title="Delayed non-essential goals" />
                  <div className="w-[28%] bg-red-500" title="Regretted structure timing" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="size-2 rounded-full inline-block bg-emerald-500 mr-1" />
                    <span className="text-navy font-bold">26%</span> Met all goals
                  </div>
                  <div>
                    <span className="size-2 rounded-full inline-block bg-amber-400 mr-1" />
                    <span className="text-navy font-bold">46%</span> Delayed goals
                  </div>
                  <div>
                    <span className="size-2 rounded-full inline-block bg-red-500 mr-1" />
                    <span className="text-navy font-bold">28%</span> Felt strain
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentPlan('3emi')
                    setShowCohortModal(false)
                    sound.snap('high')
                  }}
                  className="flex-1 rounded-xl bg-teal hover:bg-navy text-white py-2.5 text-xs font-semibold transition-colors shadow-sm"
                >
                  Apply Recommendation (3-Month EMI)
                </button>
                <button
                  type="button"
                  onClick={() => setShowCohortModal(false)}
                  className="rounded-xl iphone-liquid-inset hover:bg-white px-4 py-2.5 text-xs font-medium text-steel hover:text-navy transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
