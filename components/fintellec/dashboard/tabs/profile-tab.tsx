'use client'

import React from 'react'
import { User, Shield, LogOut, ExternalLink, Trophy, CheckCircle2, Sliders, Moon } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function ProfileTab() {
  const { user, logout, setWorkspace, setIsIqModalOpen, setPreviewLandingMode, setIsOnboardingOpen, clearAllData } = useAuth()
  const activeUser = user || {
    name: 'Ayush (Investor)',
    email: 'investor@fintellec.com',
    archetype: 'student',
    balance: 0,
    income: 25000,
    savings: 0,
    avatar: 'A',
    workspace: 'personal' as const,
  }

  return (
    <div className="space-y-8 pb-28 pt-2">
      <div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
          SYSTEM ENGINE / APP / PROFILE
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          User Settings & Financial Identity
        </h1>
        <p className="text-sm text-steel">
          Manage your verified Google connection, multi-workspace routing, and behavioral scoring factors.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-mint/80 bg-white/95 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-navy text-2xl font-bold text-bright shadow-md">
              {activeUser.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-navy">{activeUser.name}</h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                  <Shield className="size-3" />
                  Google Verified
                </span>
              </div>
              <p className="font-mono text-xs text-steel">{activeUser.email}</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-xs text-steel">
                  Liquid Balance: <strong className="text-navy font-mono">₹{activeUser.balance.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-steel">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboardingOpen(true)
                    sound.tick()
                  }}
                  className="text-xs font-semibold text-teal hover:underline"
                >
                  Edit Opening Balance & Income
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors shadow-2xs"
          >
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="rounded-3xl border border-mint/80 bg-white/95 p-6 shadow-sm">
        <h3 className="text-base font-bold text-navy">Active Financial Archetype & Workspace</h3>
        <p className="text-xs text-steel mt-1">
          Switches between personal lifestyle budgeting and sole proprietor / freelancer revenue stress-testing.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setWorkspace('personal')}
            className={cn(
              'rounded-2xl border p-4 text-left transition-all',
              activeUser.workspace === 'personal'
                ? 'border-teal bg-aqua/70 ring-2 ring-teal/30 shadow-xs'
                : 'border-mint/70 bg-white hover:bg-aqua/30',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy">Personal Workspace</span>
              {activeUser.workspace === 'personal' && <CheckCircle2 className="size-4 text-teal" />}
            </div>
            <p className="mt-1 text-xs text-steel">
              For salaried & students. Tracks daily discretionary spend, vacations, and impulse guards.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setWorkspace('business')}
            className={cn(
              'rounded-2xl border p-4 text-left transition-all',
              activeUser.workspace === 'business'
                ? 'border-teal bg-aqua/70 ring-2 ring-teal/30 shadow-xs'
                : 'border-mint/70 bg-white hover:bg-aqua/30',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy">Freelance / Agency Workspace</span>
              {user?.workspace === 'business' && <CheckCircle2 className="size-4 text-teal" />}
            </div>
            <p className="mt-1 text-xs text-steel">
              For sole proprietors. Calculates Fixed Commitment Ratio (FCR), retainer units, and seasonal dips.
            </p>
          </button>
        </div>
      </div>

      {/* Financial IQ Breakdown Trigger */}
      <div className="rounded-3xl border border-teal/40 bg-aqua/50 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-teal text-white shadow-xs">
            <Trophy className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-navy text-sm">Financial IQ: {user?.financialIq ?? 84}/100 (Discipline Level 2)</h4>
            <p className="text-xs text-steel">Payment discipline 35% • Buffer health 30% • Discretionary burn 20% • Goal trajectory 15%</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsIqModalOpen(true)
            sound.snap('high')
          }}
          className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy/90 shadow-2xs"
        >
          View Full Breakdown
        </button>
      </div>

      {/* Quick Navigation to Landing Page & Reset */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-mint/60 bg-white/70 p-4 flex items-center justify-between">
          <span className="text-xs font-medium text-navy">Want to revisit the public interactive homepage?</span>
          <button
            type="button"
            onClick={() => {
              setPreviewLandingMode(true)
              sound.tick()
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-teal hover:underline"
          >
            <span>Preview Landing Page</span>
            <ExternalLink className="size-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-900">Reset to Fresh First-Time User Slate</p>
            <p className="text-[11px] text-red-700">Wipes all logged expenses, goals, and test data to restart onboarding.</p>
          </div>
          <button
            type="button"
            onClick={clearAllData}
            className="rounded-full border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-2xs transition-colors"
          >
            Wipe & Reset
          </button>
        </div>
      </div>
    </div>
  )
}
