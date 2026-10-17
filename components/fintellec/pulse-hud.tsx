'use client'

import { useState, useEffect, useRef } from 'react'
import { sound } from '@/lib/sound'
import { Activity, Volume2, VolumeX, ShieldCheck, Heart, X, AlertTriangle, Coffee, Moon } from 'lucide-react'
import { useCircadian } from './circadian-context'

export function PulseHud() {
  const { isNight } = useCircadian()
  const [bpm, setBpm] = useState(72)
  const [isSpiking, setIsSpiking] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(0)

  // Monitor scroll velocity to dynamically accelerate ECG heart rate
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleScroll = () => {
      const now = performance.now()
      const currentY = window.scrollY
      const dt = Math.max(1, now - lastScrollTime.current)
      const dy = Math.abs(currentY - lastScrollY.current)
      const velocity = dy / dt

      lastScrollY.current = currentY
      lastScrollTime.current = now

      if (velocity > 1.8) {
        // High scroll velocity triggers emergency cardiac pulse acceleration
        setIsSpiking(true)
        setBpm(Math.min(136, Math.round(92 + velocity * 14)))
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          setIsSpiking(false)
          setBpm(72)
        }, 1800)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeout)
    }
  }, [])

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !audioEnabled
    setAudioEnabled(next)
    sound.enabled = next
    if (next) sound.snap('high')
  }

  return (
    <aside aria-label="Financial Pulse Vitality HUD" className="fixed left-4 md:left-6 bottom-5 z-40 select-none">
      {/* Expanded Financial Vitals Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vitals-title"
          className="mb-3 w-80 rounded-2xl border border-teal/40 bg-white/95 p-4 shadow-[0_20px_50px_-15px_rgba(0,51,101,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center justify-between border-b border-navy/10 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-teal" />
              </span>
              <h3 id="vitals-title" className="font-mono text-xs font-semibold uppercase tracking-wider text-navy">
                Financial Vitals Monitor
              </h3>
            </div>
            <button
              type="button"
              aria-label="Close Vitals Monitor"
              onClick={() => {
                setIsOpen(false)
                sound.snap('low')
              }}
              className="rounded-full p-1 text-steel hover:bg-navy/5 hover:text-navy"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Vitals Diagnostics Matrix */}
          <div className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-aqua/50 p-2 border border-mint/60">
              <span className="text-steel">Cash Runway Saturation:</span>
              <span className="font-mono font-bold text-teal">99.4% O₂ (Clean)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-aqua/50 p-2 border border-mint/60">
              <span className="text-steel">Financial Blood Pressure:</span>
              <span className="font-mono font-bold text-navy">120/80 (₹0 CC Debt)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-aqua/50 p-2 border border-mint/60">
              <span className="text-steel">Excel Spreadsheets Harmed:</span>
              <span className="font-mono font-bold text-teal">0 (#REF! Extinct)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-aqua/50 p-2 border border-mint/60">
              <span className="text-steel">Savings Rate Efficiency:</span>
              <span className="font-mono font-bold text-teal">96.8% (Target Met)</span>
            </div>
          </div>

          {/* Audio Synthesizer Control */}
          <div className="mt-3.5 flex items-center justify-between rounded-xl border border-mint bg-white p-2">
            <div className="flex items-center gap-2 text-xs font-medium text-navy">
              {audioEnabled ? <Volume2 className="size-3.5 text-teal" /> : <VolumeX className="size-3.5 text-steel" />}
              <span>Tactile Audio Haptics</span>
            </div>
            <button
              type="button"
              onClick={toggleAudio}
              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold transition-colors ${
                audioEnabled ? 'bg-teal text-white' : 'bg-steel/15 text-steel'
              }`}
            >
              {audioEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Fold Money Style Disclaimer */}
          <p className="mt-3 text-[10px] italic leading-tight text-steel/80">
            * Warning: Viewing bank balance immediately after returning from a Goa trip may cause temporary arrhythmia.
          </p>
        </div>
      )}

      {/* Docked Pill HUD Barometer */}
      <div
        onClick={() => {
          setIsOpen(!isOpen)
          sound.snap('high')
        }}
        className={`group flex items-center gap-3 rounded-full border bg-white/90 px-3.5 py-2 shadow-[0_12px_32px_-12px_rgba(0,51,101,0.25)] backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-102 ${
          isSpiking ? 'border-bright ring-2 ring-bright/40' : 'border-mint/90 hover:border-teal/50'
        }`}
      >
        {/* Animated ECG Pulse Waveform SVG */}
        <div className="relative h-4 w-12 overflow-hidden">
          <svg viewBox="0 0 100 30" className="size-full overflow-visible" preserveAspectRatio="none">
            <polyline
              points="0,15 20,15 30,15 35,4 40,26 45,8 50,18 55,15 70,15 75,5 80,25 85,15 100,15"
              fill="none"
              stroke={isSpiking ? '#00A99E' : '#00A99E'}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ecg-animate"
            />
          </svg>
        </div>

        {/* BPM Vitality Indicator */}
        <div className="flex items-center gap-1.5">
          <Heart
            className={`size-3.5 transition-transform duration-200 ${
              isSpiking ? 'text-teal animate-ping' : 'text-teal animate-pulse'
            }`}
          />
          <span className="font-mono text-xs font-semibold text-navy">
            {bpm} <span className="text-[10px] font-normal text-steel">BPM</span>
          </span>
        </div>

        {/* Status Chip */}
        <span
          className={`hidden rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider md:inline-block ${
            isNight
              ? 'bg-navy/80 text-bright font-semibold border border-teal/40'
              : isSpiking
                ? 'bg-bright/20 text-navy font-semibold'
                : 'bg-aqua text-teal'
          }`}
        >
          {isNight ? 'Dark Mode Active' : isSpiking ? 'High Velocity' : 'Vitals Stable'}
        </span>

        {/* Sound Quick Toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          title={audioEnabled ? 'Mute haptic sound' : 'Enable haptic sound'}
          className="rounded-full p-1 text-steel/70 hover:text-navy hover:bg-navy/5"
        >
          {audioEnabled ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
        </button>
      </div>
    </aside>
  )
}
