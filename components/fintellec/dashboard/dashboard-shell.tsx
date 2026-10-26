'use client'

import React from 'react'
import { useAuth } from '../auth/auth-context'
import { DashboardHeader } from './dashboard-header'
import { DashboardBottomDock } from './dashboard-bottom-dock'
import { DashboardTab } from './tabs/dashboard-tab'
import { GoalsTab } from './tabs/goals-tab'
import { AnalyticsTab } from './tabs/analytics-tab'
import { WalletTab } from './tabs/wallet-tab'
import { InvestmentsTab } from './tabs/investments-tab'
import { ReportsTab } from './tabs/reports-tab'
import { ProfileTab } from './tabs/profile-tab'
import { AddExpenseModal } from './modals/add-expense-modal'
import { AddGoalModal } from './modals/add-goal-modal'
import { CommandSearchModal } from './modals/command-search-modal'
import { FinancialIqModal } from './modals/financial-iq-modal'
import { CohortDrawer } from './modals/cohort-drawer'
import { NotificationsModal } from './modals/notifications-modal'
import { ExternalLink } from 'lucide-react'
import { sound } from '@/lib/sound'

export function DashboardShell() {
  const { activeTab, setPreviewLandingMode } = useAuth()

  return (
    <div className="fintellec-micro-grid min-h-screen bg-[#EFFBFA] text-[#003365] transition-colors duration-500 selection:bg-teal selection:text-white">
      {/* Top Cockpit Mode Pill Bar */}
      <div className="bg-navy px-4 py-1.5 text-center text-[11px] font-mono text-white/90 flex items-center justify-center gap-2">
        <span className="flex size-2 rounded-full bg-bright animate-pulse" />
        <span>Live Fintellec Cockpit Mode Active</span>
        <span className="opacity-40">•</span>
        <button
          type="button"
          onClick={() => {
            setPreviewLandingMode(true)
            sound.tick()
          }}
          className="underline text-bright hover:text-white transition-colors font-medium flex items-center gap-1"
        >
          <span>Preview Landing Page</span>
          <ExternalLink className="size-3" />
        </button>
      </div>

      {/* Main App Header */}
      <DashboardHeader />

      {/* Main Tab Viewport */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-28">
        <div data-tab-pane="dashboard" className={activeTab === 'dashboard' ? 'block' : 'hidden'}><DashboardTab /></div>
        <div data-tab-pane="analytics" className={activeTab === 'analytics' ? 'block' : 'hidden'}><AnalyticsTab /></div>
        <div data-tab-pane="wallet" className={activeTab === 'wallet' ? 'block' : 'hidden'}><WalletTab /></div>
        <div data-tab-pane="goals" className={activeTab === 'goals' ? 'block' : 'hidden'}><GoalsTab /></div>
        <div data-tab-pane="investments" className={activeTab === 'investments' ? 'block' : 'hidden'}><InvestmentsTab /></div>
        <div data-tab-pane="reports" className={activeTab === 'reports' ? 'block' : 'hidden'}><ReportsTab /></div>
        <div data-tab-pane="profile" className={activeTab === 'profile' ? 'block' : 'hidden'}><ProfileTab /></div>
      </main>

      {/* Bottom Floating Navigation Dock (As requested by user!) */}
      <DashboardBottomDock />

      {/* Modals & Slide-over Drawers */}
      <AddExpenseModal />
      <AddGoalModal />
      <CommandSearchModal />
      <FinancialIqModal />
      <CohortDrawer />
      <NotificationsModal />
    </div>
  )
}
