'use client'

import React, { useEffect } from 'react'
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Target,
  LineChart,
  FileText,
  User,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

interface NavTabItem {
  id: 'dashboard' | 'analytics' | 'wallet' | 'goals' | 'investments' | 'reports' | 'profile'
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortcut: string
  badge?: string
}

const TABS: NavTabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, shortcut: '2' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, shortcut: '3' },
  { id: 'goals', label: 'Goals', icon: Target, shortcut: '4', badge: 'Alert' },
  { id: 'investments', label: 'Investments', icon: LineChart, shortcut: '5' },
  { id: 'reports', label: 'Reports', icon: FileText, shortcut: '6' },
  { id: 'profile', label: 'Profile', icon: User, shortcut: '7' },
]

export function DashboardBottomDock() {
  const { activeTab, setActiveTab, setIsCohortDrawerOpen } = useAuth()

  // Keyboard shortcut listener for tabs 1-7
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= TABS.length) {
        e.preventDefault()
        const selected = TABS[num - 1]
        setActiveTab(selected.id)
        sound.snap('high')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveTab])

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95vw] sm:max-w-max pointer-events-none">
      <nav
        aria-label="Bottom Navigation Dock"
        className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 rounded-full border border-mint/90 bg-white/90 p-1.5 shadow-[0_20px_50px_-15px_rgba(0,51,101,0.3)] backdrop-blur-xl transition-all duration-300"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                sound.snap(isActive ? 'low' : 'high')
              }}
              className={cn(
                'group relative flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-95',
                isActive
                  ? 'bg-navy text-white shadow-md shadow-navy/20'
                  : 'text-navy/70 hover:bg-aqua/80 hover:text-navy',
              )}
              title={`${tab.label} (Press ${tab.shortcut})`}
            >
              <Icon
                className={cn(
                  'size-4 transition-transform group-hover:scale-110',
                  isActive ? 'text-bright' : 'text-steel group-hover:text-teal',
                )}
              />
              <span className={cn('hidden md:inline font-sans', isActive && 'font-semibold')}>
                {tab.label}
              </span>

              {/* Collision Alert Chip on Goals */}
              {tab.badge && !isActive && (
                <span className="absolute -top-1 right-1 flex size-2 items-center justify-center rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
              )}

              {/* Keyboard Shortcut Indicator */}
              <span
                className={cn(
                  'hidden lg:inline text-[9px] font-mono opacity-40 ml-0.5',
                  isActive ? 'text-white' : 'text-steel',
                )}
              >
                {tab.shortcut}
              </span>
            </button>
          )
        })}

        {/* Separator */}
        <div className="h-6 w-px bg-mint/80 mx-1 hidden sm:block" />

        {/* Floating Ask Fintellec Pill */}
        <button
          type="button"
          onClick={() => {
            setIsCohortDrawerOpen(true)
            sound.chime()
          }}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal to-bright px-3.5 py-2 text-xs font-semibold text-navy shadow-sm transition-all hover:opacity-95 hover:shadow-md active:scale-95"
          title="Open Peer Telemetry & Insights"
        >
          <Sparkles className="size-3.5 fill-navy stroke-navy" />
          <span className="hidden sm:inline">Ask Fintellec</span>
        </button>
      </nav>
    </div>
  )
}
