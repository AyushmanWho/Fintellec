'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { sound } from '@/lib/sound'

type CircadianMode = 'day' | 'night' // 'day' = 9 AM Clarity, 'night' = 2 AM Danger Zone

interface CircadianContextType {
  mode: CircadianMode
  setMode: (mode: CircadianMode) => void
  toggleMode: () => void
  isNight: boolean
  showLateNightModal: boolean
  setShowLateNightModal: (v: boolean) => void
  savedTonight: number
  recordSavings: (amount: number) => void
}

const CircadianContext = createContext<CircadianContextType | undefined>(undefined)

export function CircadianProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<CircadianMode>('day')
  const [showLateNightModal, setShowLateNightModal] = useState(false)
  const [savedTonight, setSavedTonight] = useState(480)

  const setMode = (newMode: CircadianMode) => {
    setModeState(newMode)
    if (newMode === 'night') {
      sound.nightShift()
    } else {
      sound.dayShift()
    }
  }

  const toggleMode = () => {
    const next = mode === 'day' ? 'night' : 'day'
    setMode(next)
  }

  const recordSavings = (amount: number) => {
    setSavedTonight((prev) => prev + amount)
    sound.triumph()
  }

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'night') {
      root.classList.add('circadian-night')
      root.setAttribute('data-circadian', 'night')
    } else {
      root.classList.remove('circadian-night')
      root.setAttribute('data-circadian', 'day')
    }
  }, [mode])

  return (
    <CircadianContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isNight: mode === 'night',
        showLateNightModal,
        setShowLateNightModal,
        savedTonight,
        recordSavings,
      }}
    >
      {children}
    </CircadianContext.Provider>
  )
}

export function useCircadian() {
  const context = useContext(CircadianContext)
  if (!context) {
    throw new Error('useCircadian must be used within a CircadianProvider')
  }
  return context
}
