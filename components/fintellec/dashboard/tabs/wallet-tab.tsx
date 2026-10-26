'use client'

import React, { useState, useRef } from 'react'
import { Wallet, ShieldCheck, RefreshCw, Plus, RotateCcw } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

// ─── Card themes ─────────────────────────────────────────────────────────────
const CARD_THEMES = [
  {
    id: 'ocean',
    label: 'Ocean Night',
    swatch: '#003365',
    bg: 'linear-gradient(135deg, #003365 0%, #00162E 55%, #00a99e 100%)',
    accent: '#63dcd3',
    chip: '#00a99e',
    network: 'VISA',
  },
  {
    id: 'obsidian',
    label: 'Obsidian',
    swatch: '#0f0f0f',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f0f 50%, #16213e 100%)',
    accent: '#e2e8f0',
    chip: '#334155',
    network: 'VISA',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    swatch: '#4c1d95',
    bg: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 55%, #6d28d9 100%)',
    accent: '#c4b5fd',
    chip: '#7c3aed',
    network: 'RUPAY',
  },
  {
    id: 'gold',
    label: 'Reserve Gold',
    swatch: '#78350f',
    bg: 'linear-gradient(135deg, #451a03 0%, #1c0a00 55%, #92400e 100%)',
    accent: '#fde68a',
    chip: '#b45309',
    network: 'MASTERCARD',
  },
]

// ─── 3D Card component ────────────────────────────────────────────────────────
function VirtualCard({
  theme,
  name,
  balance,
  hideBalance,
}: {
  theme: (typeof CARD_THEMES)[0]
  name: string
  balance: number
  hideBalance: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [flipped, setFlipped] = useState(false)
  const rafRef = useRef<number>(0)

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - 0.5) * 28
      const y = -((e.clientY - r.top) / r.height - 0.5) * 18
      setTilt({ x, y })
    })
  }

  function handleLeave() {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => setTilt({ x: 0, y: 0 }))
  }

  const balanceStr = hideBalance ? '₹ ••••••' : `₹ ${balance.toLocaleString('en-IN')}`

  return (
    <div
      style={{ perspective: '800px', perspectiveOrigin: '50% 50%' }}
      className="select-none"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={() => { setFlipped(f => !f); sound.snap('high') }}
        style={{
          width: '100%',
          maxWidth: 360,
          aspectRatio: '1.586',
          transformStyle: 'preserve-3d',
          transform: flipped
            ? `perspective(800px) rotateY(${180 + tilt.x}deg) rotateX(${tilt.y}deg)`
            : `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: flipped
            ? 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 80ms linear',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* ── Front face ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: theme.bg,
            borderRadius: 20,
            boxShadow: `0 32px 60px -16px rgba(0,0,0,0.7), 0 0 24px ${theme.accent}18`,
            border: `1px solid ${theme.accent}22`,
            overflow: 'hidden',
          }}
        >
          {/* Diagonal glass sheen */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none',
            background: `linear-gradient(135deg, ${theme.accent}20 0%, transparent 55%, ${theme.accent}10 100%)`,
          }} />
          {/* Holographic shimmer strip */}
          <div style={{
            position: 'absolute', top: '35%', left: '-20%', width: '140%', height: '1px',
            background: `linear-gradient(90deg, transparent, ${theme.accent}60, transparent)`,
            transform: 'rotate(-12deg)',
          }} />

          {/* Top row: network chip + logo */}
          <div style={{ position: 'absolute', top: 20, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* EMV chip */}
            <div style={{ width: 38, height: 28, borderRadius: 6, background: theme.chip, border: `1px solid ${theme.accent}44`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, padding: 5 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: `${theme.accent}55`, borderRadius: 1 }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 800, letterSpacing: 2, color: theme.accent, opacity: 0.9 }}>
              FINTELLEC
            </div>
          </div>

          {/* Card number */}
          <div style={{ position: 'absolute', top: '44%', left: 22, right: 22 }}>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 15, letterSpacing: 4, color: theme.accent, opacity: 0.85 }}>
              •••• &nbsp;•••• &nbsp;•••• &nbsp;4219
            </div>
          </div>

          {/* Bottom row: holder + expiry + network */}
          <div style={{ position: 'absolute', bottom: 20, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 8, color: `${theme.accent}66`, marginBottom: 3, letterSpacing: 1 }}>CARD HOLDER</div>
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 12, fontWeight: 700, color: theme.accent, textTransform: 'uppercase', letterSpacing: 1 }}>
                {name.split(' ').slice(0, 2).join(' ')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 8, color: `${theme.accent}66`, marginBottom: 3, letterSpacing: 1 }}>VALID THRU</div>
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 12, fontWeight: 700, color: theme.accent }}>09/28</div>
            </div>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 900, color: theme.accent, letterSpacing: -0.5 }}>
              {theme.network}
            </div>
          </div>

          {/* Balance watermark */}
          <div style={{
            position: 'absolute', top: '62%', left: 22, right: 22,
            fontFamily: 'var(--font-nunito)', fontSize: 22, fontWeight: 900,
            color: theme.accent, opacity: 0.65, letterSpacing: -0.5,
          }}>
            {balanceStr}
          </div>
        </div>

        {/* ── Back face ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: theme.bg,
            borderRadius: 20,
            boxShadow: `0 32px 60px -16px rgba(0,0,0,0.7)`,
            border: `1px solid ${theme.accent}22`,
            overflow: 'hidden',
          }}
        >
          {/* Mag stripe */}
          <div style={{ position: 'absolute', top: 36, left: 0, right: 0, height: 44, background: 'rgba(0,0,0,0.7)' }} />
          {/* Signature strip */}
          <div style={{
            position: 'absolute', top: 100, left: 22, right: 80, height: 32, borderRadius: 4,
            background: 'repeating-linear-gradient(90deg, #fff8 0px, #fff8 6px, #f0f0f066 6px, #f0f0f066 12px)',
            display: 'flex', alignItems: 'center', paddingLeft: 8,
          }}>
            <span style={{ fontFamily: 'var(--font-edu-hand)', fontSize: 16, color: '#003365', opacity: 0.8 }}>
              {name.split(' ')[0]}
            </span>
          </div>
          {/* CVV */}
          <div style={{ position: 'absolute', top: 104, right: 22, width: 52, height: 24, background: '#fff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 700, color: '#003365' }}>•••</span>
          </div>
          {/* Info */}
          <div style={{ position: 'absolute', bottom: 20, left: 22, right: 22 }}>
            <p style={{ fontFamily: 'var(--font-nunito)', fontSize: 9, color: `${theme.accent}60`, lineHeight: 1.6 }}>
              This card is issued by Fintellec Financial Services Ltd. If found, please call 1800-000-FINT.
            </p>
          </div>
          {/* Tap to flip hint */}
          <div style={{ position: 'absolute', top: 8, right: 16, fontFamily: 'var(--font-nunito)', fontSize: 9, color: `${theme.accent}44` }}>
            tap to flip
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Wallet tab ───────────────────────────────────────────────────────────────
export function WalletTab() {
  const { user, setIsOnboardingOpen } = useAuth()
  const [themeIdx, setThemeIdx] = useState(0)

  const activeUser = user || {
    name: 'Investor',
    email: 'investor@fintellec.com',
    archetype: 'student',
    balance: 0,
    income: 25000,
    savings: 0,
    avatar: 'AI',
    hideBalance: false,
  }

  const theme = CARD_THEMES[themeIdx]

  const accounts = [
    {
      name: 'Primary Account (Salary / UPI)',
      type: 'Checking / UPI',
      status: 'Live Synced',
      balance: activeUser.balance,
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      name: 'Emergency Savings Vault',
      type: 'Vault',
      status: 'Protected',
      balance: activeUser.savings,
      statusColor: 'text-sky-600 bg-sky-50 border-sky-200',
    },
  ]

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet">
            SYSTEM ENGINE / APP / WALLET
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            Linked Accounts &amp; Liquid Runway
          </h1>
          <p className="text-sm text-steel">
            Real-time balance synchronization across your UPI handles, cards, and offline reserves.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setIsOnboardingOpen(true); sound.snap('high') }}
          className="flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal/90 transition-all"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>Adjust Opening Balance</span>
        </button>
      </div>

      {/* ── 3D Card Customizer ── */}
      <div className="fintellec-specular-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          {/* Card preview */}
          <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
            <VirtualCard
              theme={theme}
              name={activeUser.name}
              balance={activeUser.balance}
              hideBalance={activeUser.hideBalance}
            />
            <p className="mt-3 text-center text-[11px] font-mono text-steel">
              Hover to tilt &nbsp;·&nbsp; tap to flip
            </p>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col gap-5 justify-center lg:pt-2 w-full">
            <div>
              <h3 className="text-base font-bold text-navy mb-1" style={{ fontFamily: 'var(--font-edu-hand)' }}>
                Card Theme
              </h3>
              <p className="text-xs text-steel font-mono">
                Choose the finish for your virtual Fintellec card.
              </p>
            </div>

            {/* Theme swatches */}
            <div className="grid grid-cols-2 gap-3">
              {CARD_THEMES.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { setThemeIdx(i); sound.snap('high') }}
                  className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-all"
                  style={{
                    background: i === themeIdx ? `${t.accent}12` : 'transparent',
                    border: `1.5px solid ${i === themeIdx ? t.accent : 'rgba(0,169,158,0.2)'}`,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: t.bg }} />
                  <div>
                    <p className="text-xs font-semibold text-navy leading-tight">{t.label}</p>
                    <p className="text-[10px] font-mono text-steel">{t.network}</p>
                  </div>
                  {i === themeIdx && (
                    <div className="ml-auto w-2 h-2 rounded-full" style={{ background: t.accent }} />
                  )}
                </button>
              ))}
            </div>

            {/* Linked balance summary */}
            <div className="flex gap-3">
              {accounts.map(acc => (
                <div key={acc.name} className="flex-1 rounded-2xl border border-mint/60 bg-aqua/40 p-3">
                  <p className="text-[9px] font-mono text-steel uppercase tracking-wider mb-1">{acc.type}</p>
                  <p className="text-lg font-mono font-extrabold text-navy">
                    {activeUser.hideBalance ? '₹••••' : `₹${acc.balance.toLocaleString('en-IN')}`}
                  </p>
                  <span className={`inline-block mt-1 rounded-full border px-1.5 py-0.5 text-[9px] font-mono font-bold ${acc.statusColor}`}>
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Account list (kept for detail) ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {accounts.map((acc) => (
          <div key={acc.name} className="fintellec-specular-card rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="rounded-full bg-aqua px-2.5 py-0.5 text-[10px] font-mono font-bold text-navy uppercase">
                {acc.type}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${acc.statusColor}`}>
                {acc.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-navy">{acc.name}</h3>
            <div className="mt-3 pt-3 border-t border-mint/40">
              <span className="text-[10px] font-mono uppercase text-steel">Available Liquidity</span>
              <div className="text-2xl font-extrabold font-mono text-navy mt-0.5">
                {activeUser.hideBalance ? '₹••••' : `₹${acc.balance.toLocaleString('en-IN')}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Security strip ── */}
      <div className="fintellec-specular-card rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-teal text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-navy text-sm">Account Aggregator Protocol (RBI Certified)</h4>
            <p className="text-xs text-steel">Encrypted end-to-end telemetry. Bank credentials are never stored on Fintellec servers.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => sound.chime()}
          className="flex items-center gap-1.5 rounded-full border border-mint bg-white px-3.5 py-1.5 text-xs font-semibold text-navy hover:border-teal transition-colors"
        >
          <RefreshCw className="size-3 text-teal" />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  )
}
