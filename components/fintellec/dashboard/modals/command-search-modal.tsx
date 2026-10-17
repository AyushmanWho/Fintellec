'use client'

import React, { useState } from 'react'
import {
  Search,
  X,
  LayoutDashboard,
  BarChart3,
  Wallet,
  Target,
  LineChart,
  FileText,
  User,
  Plus,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

export function CommandSearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setActiveTab,
    setIsAddExpenseOpen,
    setIsAddGoalOpen,
    toggleHideBalance,
    setIsCohortDrawerOpen,
    setWorkspace,
  } = useAuth()
  const [query, setQuery] = useState('')

  if (!isSearchOpen) return null

  const items = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation', action: () => setActiveTab('dashboard') },
    { label: 'Go to Multi-Goal Collision Matrix', icon: Target, category: 'Navigation', action: () => setActiveTab('goals') },
    { label: 'Go to Commitment & FCR Analytics', icon: BarChart3, category: 'Navigation', action: () => setActiveTab('analytics') },
    { label: 'Go to Wallet & Bank Accounts', icon: Wallet, category: 'Navigation', action: () => setActiveTab('wallet') },
    { label: 'Go to Investments & Compounding', icon: LineChart, category: 'Navigation', action: () => setActiveTab('investments') },
    { label: 'Go to Audited Reports', icon: FileText, category: 'Navigation', action: () => setActiveTab('reports') },
    { label: 'Go to Profile & Financial IQ', icon: User, category: 'Navigation', action: () => setActiveTab('profile') },
    { label: 'Log New Expense (+ Add Expense)', icon: Plus, category: 'Quick Action', action: () => setIsAddExpenseOpen(true) },
    { label: 'Add New Goal (+ Target)', icon: Target, category: 'Quick Action', action: () => setIsAddGoalOpen(true) },
    { label: 'Toggle Privacy / Hide Balance', icon: Eye, category: 'Quick Action', action: () => toggleHideBalance() },
    { label: 'Open Peer Cohort Telemetry Drawer (STU-02)', icon: Sparkles, category: 'Insights', action: () => setIsCohortDrawerOpen(true) },
    { label: 'Switch to Freelance / Agency Workspace', icon: Sliders, category: 'Workspace', action: () => setWorkspace('business') },
    { label: 'Switch to Personal Workspace', icon: Sliders, category: 'Workspace', action: () => setWorkspace('personal') },
  ]

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-navy/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-3xl border border-mint/90 bg-white/95 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-mint/70 px-5 py-3.5">
          <Search className="size-4 text-teal" />
          <input
            type="text"
            placeholder="Type a command, goal, expense, or tab..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-steel"
            autoFocus
          />
          <kbd className="rounded border border-mint/80 bg-aqua/50 px-1.5 py-0.5 font-mono text-[10px] text-steel">
            ESC
          </kbd>
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(false)
              sound.tick()
            }}
            className="rounded-full p-1 text-steel hover:text-navy"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-steel">
              No matching commands found. Try searching &quot;goals&quot;, &quot;expense&quot;, or &quot;workspace&quot;.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action()
                    setIsSearchOpen(false)
                    sound.snap('high')
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-aqua/80 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-white border border-mint/60 text-navy group-hover:text-teal shadow-2xs">
                      <Icon className="size-3.5" />
                    </div>
                    <span className="font-semibold text-navy">{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-steel bg-white/70 px-2 py-0.5 rounded-full border border-mint/40">
                    {item.category}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
