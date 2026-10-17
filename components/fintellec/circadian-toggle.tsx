'use client'

import { useCircadian } from './circadian-context'
import { Sun, Moon } from 'lucide-react'

export function CircadianToggle() {
  const { setMode, isNight } = useCircadian()

  return (
    <div className="flex items-center">
      {/* Segmented Light / Dark Mode Toggle */}
      <div
        role="group"
        aria-label="Theme selector"
        className="relative inline-flex items-center rounded-full border border-mint/80 bg-white/80 p-0.5 shadow-xs backdrop-blur-md transition-colors"
      >
        {/* Animated Sliding Pill Thumb */}
        <span
          aria-hidden
          className={`absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isNight
              ? 'left-[calc(50%+1px)] bg-navy shadow-md'
              : 'left-0.5 bg-navy shadow-sm'
          }`}
        />

        {/* Light Mode Button */}
        <button
          type="button"
          aria-pressed={!isNight}
          onClick={() => setMode('day')}
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 font-mono text-[11px] font-medium transition-colors ${
            !isNight ? 'text-white' : 'text-steel hover:text-navy'
          }`}
        >
          <Sun className={`size-3.5 ${!isNight ? 'text-amber-300' : 'text-steel'}`} />
          <span>Light</span>
        </button>

        {/* Dark Mode Button */}
        <button
          type="button"
          aria-pressed={isNight}
          onClick={() => setMode('night')}
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 font-mono text-[11px] font-medium transition-colors ${
            isNight ? 'text-bright' : 'text-steel hover:text-navy'
          }`}
        >
          <Moon className={`size-3.5 ${isNight ? 'text-teal' : 'text-steel'}`} />
          <span>Dark</span>
        </button>
      </div>
    </div>
  )
}
