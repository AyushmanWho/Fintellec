'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Plus, Flame, Trophy, Bell, LogOut, ExternalLink, ChevronDown, Check, Volume2, VolumeX, Moon, Sun, Shield } from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import { sound } from '@/lib/sound'
import { useCircadian } from '../circadian-context'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const {
    user,
    logout,
    setIsAddExpenseOpen,
    setIsSearchOpen,
    setIsIqModalOpen,
    setIsNotificationsOpen,
    setWorkspace,
    setPreviewLandingMode,
    setActiveTab,
  } = useAuth()
  const { isNight, toggleMode } = useCircadian()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [soundActive, setSoundActive] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-mint/70 bg-white/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Workspace Switcher */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard')
              sound.tick()
            }}
            className="flex items-center gap-2 group text-left"
          >
            <img src="/fintellec-logo.png" alt="Fintellec" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
          </button>

          {/* Workspace Pill */}
          <div className="hidden items-center sm:flex">
            <div className="flex items-center rounded-full border border-mint bg-aqua/60 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setWorkspace('personal')}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  user.workspace === 'personal'
                    ? 'bg-navy text-white shadow-xs font-semibold'
                    : 'text-steel hover:text-navy',
                )}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setWorkspace('business')}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  user.workspace === 'business'
                    ? 'bg-teal text-white shadow-xs font-semibold'
                    : 'text-steel hover:text-navy',
                )}
              >
                Freelance/Agency
              </button>
            </div>
          </div>
        </div>

        {/* Center Search Bar (⌘ K) */}
        <div className="hidden max-w-md flex-1 px-4 md:block">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true)
              sound.snap('high')
            }}
            className="flex w-full items-center justify-between rounded-full border border-mint/90 bg-aqua/50 px-4 py-2 text-xs text-steel transition-all hover:border-teal hover:bg-white hover:shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-teal transition-transform group-hover:scale-110" />
              <span>Search expenses, goals, wallet, simulations...</span>
            </div>
            <kbd className="flex items-center gap-0.5 rounded-md border border-mint/80 bg-white/90 px-1.5 py-0.5 font-mono text-[10px] text-navy shadow-2xs">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Expense Button */}
          <button
            type="button"
            onClick={() => {
              setIsAddExpenseOpen(true)
              sound.snap('high')
            }}
            className="hidden items-center gap-1.5 rounded-full bg-teal px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal/90 hover:shadow-md active:scale-95 sm:inline-flex"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>

          {/* Streak Badge */}
          <div
            className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50/80 px-2.5 py-1 text-xs font-mono font-semibold text-orange-700 shadow-2xs"
            title="Active Daily Money Discipline Streak"
          >
            <Flame className="size-3.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{user.streakDays}d</span>
          </div>

          {/* Financial IQ Badge */}
          <button
            type="button"
            onClick={() => {
              setIsIqModalOpen(true)
              sound.snap('low')
            }}
            className="flex items-center gap-1.5 rounded-full border border-teal/40 bg-aqua px-2.5 py-1 text-xs font-mono font-semibold text-navy transition-all hover:border-teal hover:bg-white shadow-2xs"
            title="Financial IQ Score (Tap to see factor breakdown)"
          >
            <Trophy className="size-3.5 text-teal" />
            <span>IQ {user.financialIq}</span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(true)
              sound.tick()
            }}
            className="relative rounded-full border border-mint bg-white p-2 text-navy transition-colors hover:border-teal hover:bg-aqua shadow-2xs"
            aria-label="View notifications"
          >
            <Bell className="size-4 text-navy/80" />
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-teal text-[9px] font-bold text-white shadow-xs">
              9+
            </span>
          </button>

          {/* Circadian Shift Toggle */}
          <button
            type="button"
            onClick={() => {
              toggleMode()
              sound.nightShift()
            }}
            className="rounded-full border border-mint bg-white p-2 text-navy hover:border-teal hover:bg-aqua transition-colors shadow-2xs hidden sm:flex"
            title={isNight ? 'Night Mode Active' : 'Day Mode Active'}
          >
            {isNight ? <Moon className="size-4 text-bright" /> : <Sun className="size-4 text-orange-400" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundActive
              setSoundActive(next)
              sound.enabled = next
              if (next) sound.snap('high')
            }}
            className="rounded-full border border-mint bg-white p-2 text-navy hover:border-teal hover:bg-aqua transition-colors shadow-2xs hidden sm:flex"
            title={soundActive ? 'Sound: On' : 'Sound: Muted'}
          >
            {soundActive ? <Volume2 className="size-4 text-teal" /> : <VolumeX className="size-4 text-steel" />}
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen((prev) => !prev)
                sound.tick()
              }}
              className="flex items-center gap-2 rounded-full border border-mint bg-white/90 p-1 pl-1.5 pr-2.5 transition-all hover:border-teal hover:shadow-xs"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-bright shadow-inner">
                {user.avatar}
              </div>
              <span className="hidden text-xs font-semibold text-navy md:inline">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="size-3 text-steel transition-transform" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-mint bg-white p-2 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="border-b border-mint/60 px-3 py-2.5">
                  <p className="text-xs font-bold text-navy">{user.name}</p>
                  <p className="text-[11px] text-steel font-mono truncate">{user.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-teal font-medium">
                    <Shield className="size-3" />
                    <span>Google Verified Session</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewLandingMode(true)
                      setUserMenuOpen(false)
                      sound.tick()
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-navy hover:bg-aqua/80 transition-colors"
                  >
                    <span>View Public Landing Page</span>
                    <ExternalLink className="size-3.5 text-steel" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile')
                      setUserMenuOpen(false)
                      sound.tick()
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-navy hover:bg-aqua/80 transition-colors"
                  >
                    <span>Account Settings</span>
                  </button>
                </div>

                <div className="border-t border-mint/60 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
