'use client'

import { SiteNav } from '@/components/fintellec/site-nav'
import { Hero } from '@/components/fintellec/hero/hero'
import { TextScrub } from '@/components/fintellec/text-scrub'
import { FdinSimulator } from '@/components/fintellec/fdin/fdin-simulator'
import { BiggerPicture } from '@/components/fintellec/bigger-picture'
import { Direction } from '@/components/fintellec/direction'
import { ExplodedAnatomy } from '@/components/fintellec/exploded-anatomy'
import { Insights } from '@/components/fintellec/insights'
import { Savings } from '@/components/fintellec/savings'
import { TimeMachine } from '@/components/fintellec/time-machine'
import { FinalCta } from '@/components/fintellec/final-cta'
import { SiteFooter } from '@/components/fintellec/site-footer'
import { DigitalCrown } from '@/components/fintellec/digital-crown'
import { PulseHud } from '@/components/fintellec/pulse-hud'
import { CircadianProvider } from '@/components/fintellec/circadian-context'
import { AuthProvider, useAuth } from '@/components/fintellec/auth/auth-context'
import { GoogleSignInModal } from '@/components/fintellec/auth/google-sign-in-modal'
import { OnboardingModal } from '@/components/fintellec/auth/onboarding-modal'
import { DashboardShell } from '@/components/fintellec/dashboard/dashboard-shell'
import { MagneticSpotlight } from '@/components/fintellec/magnetic-spotlight'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { sound } from '@/lib/sound'

function MainContent() {
  const { isAuthenticated, previewLandingMode, setPreviewLandingMode } = useAuth()
  const isCockpitActive = isAuthenticated && !previewLandingMode

  return (
    <>
      {/* 1. Cockpit Dashboard View */}
      <div id="fintellec-cockpit-view" className={isCockpitActive ? 'block' : 'hidden'}>
        <DashboardShell />
      </div>

      {/* 2. Public Landing Page View */}
      <div id="fintellec-landing-view" className={isCockpitActive ? 'hidden' : 'block'}>
        {/* Return to Cockpit floating pill if user is previewing landing page while signed in */}
        {isAuthenticated && previewLandingMode && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={() => {
                setPreviewLandingMode(false)
                sound.snap('high')
              }}
              className="flex items-center gap-2 rounded-full border border-teal bg-navy px-4 py-2 text-xs font-bold text-white shadow-xl hover:bg-teal hover:text-navy transition-all"
            >
              <LayoutDashboard className="size-3.5 text-bright" />
              <span>Return to Live Cockpit</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        <SiteNav />
        <DigitalCrown />
        <PulseHud />
        <main className="fintellec-main-bridge">
          <Hero />
          <TextScrub />
          <FdinSimulator />
          <BiggerPicture />
          <Direction />
          <ExplodedAnatomy />
          <Insights />
          <Savings />
          <TimeMachine />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <CircadianProvider>
        <MagneticSpotlight />
        <GoogleSignInModal />
        <OnboardingModal />
        <MainContent />
      </CircadianProvider>
    </AuthProvider>
  )
}
