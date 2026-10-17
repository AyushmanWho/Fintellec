'use client'

import { useState } from 'react'
import { useCircadian } from './circadian-context'
import { sound } from '@/lib/sound'
import { inr } from '@/lib/format'
import { ShieldAlert, X, Sparkles, CheckCircle2, ArrowRight, Droplets, Frown } from 'lucide-react'

export function LateNightModal() {
  const { showLateNightModal, setShowLateNightModal, recordSavings } = useCircadian()
  const [mathAnswer, setMathAnswer] = useState('')
  const [mathSolved, setMathSolved] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [guiltProceed, setGuiltProceed] = useState(false)

  if (!showLateNightModal) return null

  const handleMathCheck = (val: string) => {
    setMathAnswer(val)
    if (val.trim() === '133') {
      setMathSolved(true)
      sound.snap('high')
    }
  }

  const handleSaveMoney = () => {
    setSavedSuccess(true)
    recordSavings(540)
    setTimeout(() => {
      setShowLateNightModal(false)
      setSavedSuccess(false)
      setMathSolved(false)
      setMathAnswer('')
    }, 2400)
  }

  const handleProceedGuilt = () => {
    setGuiltProceed(true)
    sound.sadSlide()
    setTimeout(() => {
      setShowLateNightModal(false)
      setGuiltProceed(false)
      setMathSolved(false)
      setMathAnswer('')
    }, 2600)
  }

  const handleClose = () => {
    setShowLateNightModal(false)
    setMathSolved(false)
    setMathAnswer('')
    setSavedSuccess(false)
    setGuiltProceed(false)
    sound.snap('low')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="midnight-defense-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/70 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-[#001326] p-6 md:p-8 text-white shadow-[0_25px_70px_-20px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-300"
      >
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close midnight interception modal"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-steel hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400 shadow-xs">
            <ShieldAlert className="size-3.5 text-amber-400 animate-pulse" />
            2 AM Willpower Intercept
          </span>
          <span className="font-mono text-[10px] text-steel">Defense Protocol #402</span>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-teal/20 border border-teal text-bright">
              <CheckCircle2 className="size-9" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-white">Willpower Triumphant!</h3>
            <p className="mt-2 text-sm text-mint">
              ₹540 saved and transferred directly into your Goa Trip Vault.
            </p>
            <p className="mt-3 font-mono text-xs text-steel">
              Your 9 AM self is waking up tomorrow without pizza guilt.
            </p>
          </div>
        ) : guiltProceed ? (
          <div className="py-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500 text-amber-400">
              <Frown className="size-9" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-white">Proceeding with Heavy Sighs...</h3>
            <p className="mt-2 text-sm text-steel">
              Transaction unlocked. Please drink a glass of water and brush your teeth before sleeping.
            </p>
          </div>
        ) : (
          <>
            {/* Target Purchase Intercepted Card */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-steel">
                    Target Checkout Intercepted
                  </p>
                  <h3 id="midnight-defense-title" className="mt-0.5 text-base font-semibold text-white">
                    Midnight Double Cheese Pizza + Garlic Dip
                  </h3>
                  <p className="font-mono text-xs text-amber-400">Swiggy Delivery · 2:24 AM</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-bold text-white tabular-nums">₹540</span>
                  <p className="text-[10px] text-steel">including surge</p>
                </div>
              </div>
            </div>

            {/* Defense Questions Matrix */}
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs">
                <p className="font-medium text-mint">1. The Biological Reality Check</p>
                <p className="mt-1 text-steel leading-relaxed">
                  Are you actually hungry, or are you just lonely, exhausted, and doom-scrolling YouTube Shorts?
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-amber-400">2. High-School Math Lockout</p>
                  {mathSolved ? (
                    <span className="font-mono text-[10px] text-bright font-semibold">✓ UNLOCKED</span>
                  ) : (
                    <span className="font-mono text-[10px] text-steel">Required to reveal CVV</span>
                  )}
                </div>
                <p className="mt-1 text-steel">What is 19 × 7?</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={mathAnswer}
                    onChange={(e) => handleMathCheck(e.target.value)}
                    placeholder="Enter answer to unlock"
                    className="w-40 rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-xs text-white placeholder:text-steel/50 focus:border-amber-400 focus:outline-none"
                  />
                  {mathSolved && (
                    <span className="text-[11px] text-bright font-mono">
                      Math solved! But wait... is it worth it?
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs">
                <p className="font-medium text-mint">3. Opportunity Cost Breakdown</p>
                <p className="mt-1 font-mono text-[11px] text-steel leading-relaxed">
                  ₹540 = 2 weeks of Spotify Premium, or 1.5 days of hostel stay on your upcoming Goa trip.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleSaveMoney}
                className="group flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal to-bright py-3 px-4 font-semibold text-navy text-sm shadow-[0_10px_25px_-5px_rgba(0,169,158,0.5)] transition-all hover:scale-[1.02]"
              >
                <Droplets className="size-4" />
                Drink Cold Water & Sleep (Save ₹540)
              </button>
              <button
                type="button"
                onClick={handleProceedGuilt}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 px-4 text-xs font-mono text-steel hover:text-white hover:bg-white/10 transition-colors"
              >
                Proceed with Guilt
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
