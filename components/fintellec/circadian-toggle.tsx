'use client'

import { useCircadian } from './circadian-context'
import { Sun, Moon, ShieldAlert } from 'lucide-react'
import { inr } from '@/lib/format'

export function CircadianToggle() {
  const { mode, setMode, isNight, savedTonight, setShowLateNightModal } = useCircadian()

  return (
    <div className="flex items-center gap-2">
      {/* Segmented Circadian Pill */}
      <div
        role="group"
        aria-label="Circadian Willpower Mode Selector"
        className="relative inline-flex items-center rounded-full border border-mint/80 bg-white/80 p-0.5 shadow-xs backdrop-blur-md transition-colors"
      >
        {/* Animated Sliding Pill Thumb */}
        <span
          aria-hidden
          className={`absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isNight
              ? 'left-[calc(50%+1px)] bg-gradient-to-r from-navy to-[#001f3f] shadow-md'
              : 'left-0.5 bg-navy shadow-sm'
          }`}
        />

        {/* 9 AM Clarity Button */}
        <button
          type="button"
          aria-pressed={!isNight}
          onClick={() => setMode('day')}
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 font-mono text-[11px] font-medium transition-colors ${
            !isNight ? 'text-white' : 'text-steel hover:text-navy'
          }`}
        >
          <Sun className={`size-3.5 ${!isNight ? 'text-amber-300' : 'text-steel'}`} />
          <span className="hidden sm:inline">9 AM Clarity</span>
          <span className="sm:hidden">9 AM</span>
        </button>

        {/* 2 AM Danger Zone Button */}
        <button
          type="button"
          aria-pressed={isNight}
          onClick={() => setMode('night')}
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 font-mono text-[11px] font-medium transition-colors ${
            isNight ? 'text-amber-300' : 'text-steel hover:text-navy'
          }`}
        >
          <Moon className={`size-3.5 ${isNight ? 'text-amber-400 animate-pulse' : 'text-steel'}`} />
          <span className="hidden sm:inline">2 AM Danger</span>
          <span className="sm:hidden">2 AM</span>
        </button>
      </div>

      {/* Active Defense Quick Trigger Button in 2 AM Mode */}
      {isNight && (
        <button
          type="button"
          onClick={() => setShowLateNightModal(true)}
          className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-amber-300 shadow-xs hover:bg-amber-500/20 transition-all animate-in fade-in zoom-in-95"
        >
          <ShieldAlert className="size-3 text-amber-400" />
          <span className="hidden md:inline">Test Intercept</span>
          <span>+{inr(savedTonight)} Saved</span>
        </button>
      )}
    </div>
  )
}
