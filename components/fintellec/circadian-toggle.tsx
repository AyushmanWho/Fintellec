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
        className={`relative inline-flex items-center rounded-full border p-0.5 shadow-xs backdrop-blur-md transition-colors ${
          isNight
            ? 'border-teal/40 bg-[#00162B]/90'
            : 'border-mint/80 bg-white/80'
        }`}
      >
        {/* Animated Sliding Pill Thumb */}
        <span
          aria-hidden
          className={`absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isNight
              ? 'left-[calc(50%+1px)] bg-teal/25 border border-bright/40 shadow-[0_0_12px_rgba(99,220,211,0.3)]'
              : 'left-0.5 bg-[#003365] shadow-sm'
          }`}
        />

        {/* Light Mode Button */}
        <button
          type="button"
          aria-pressed={!isNight}
          onClick={() => setMode('day')}
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 font-mono text-[11px] font-medium transition-colors ${
            !isNight ? 'text-white' : 'text-steel hover:text-white'
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
            isNight ? 'text-bright font-semibold' : 'text-steel hover:text-navy'
          }`}
        >
          <Moon className={`size-3.5 ${isNight ? 'text-bright' : 'text-steel'}`} />
          <span>Dark</span>
        </button>
      </div>
    </div>
  )
}
