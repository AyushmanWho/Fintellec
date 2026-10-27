'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sound } from '@/lib/sound'
import { CircadianToggle } from './circadian-toggle'
import { useAuth } from './auth/auth-context'




export function SiteNav() {
  const { user, isAuthenticated, setIsGoogleModalOpen, setPreviewLandingMode } = useAuth()
  const [scrollY, setScrollY] = useState(0)
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(false)
  const [soundActive, setSoundActive] = useState(true)
  const noteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // When at the hero section where "Your money. In motion." sits (first 600px):
  // Keep navbar 100% transparent and hide the Fintellec logo so it never blocks or overlaps the "YOUR" headline.
  const inHeroTitle = scrollY < 1600
  const isScrolledPast = scrollY >= 1600

  useEffect(() => {
    return () => {
      if (noteTimer.current) clearTimeout(noteTimer.current)
    }
  }, [])

  const showNote = () => {
    setNote(true)
    clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(() => setNote(false), 3800)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
      <nav
        aria-label="Primary"
        className={cn(
          'relative mx-auto flex h-16 max-w-[1400px] items-center justify-between rounded-full px-4 transition-all duration-500 md:px-6',
          isScrolledPast || open
            ? 'border border-navy/10 bg-white/70 shadow-[0_12px_36px_-18px_rgba(0,51,101,0.15)] backdrop-blur-xl dark:bg-navy/70 dark:border-white/10 dark:shadow-[0_12px_36px_-18px_rgba(0,0,0,0.5)]'
            : '!border-transparent !bg-transparent !shadow-none !backdrop-blur-none',
        )}
        style={!isScrolledPast && !open ? { background: 'transparent', borderColor: 'transparent', boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none' } : undefined}
      >
        <a
          href="#top"
          aria-label="Fintellec home"
          className="flex items-center rounded-full py-1 opacity-100 translate-x-0 pointer-events-auto transition-all duration-300 ease-out"
        >
          <img
            src="/fintellec-logo-clean.png"
            alt="Fintellec — Track Smarter. Spend Wiser."
            className="h-10 w-auto object-contain sm:h-11"
          />
        </a>


        <div className="flex items-center gap-2 md:gap-3">
          <CircadianToggle />
          <button
            type="button"
            onClick={() => {
              const next = !soundActive
              setSoundActive(next)
              sound.enabled = next
              if (next) sound.snap('high')
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-mint bg-white/80 text-navy text-xs font-mono transition-colors hover:border-teal shadow-xs"
            title={soundActive ? 'Haptic Sound: ON' : 'Haptic Sound: MUTED'}
            aria-label="Toggle haptic sound effects"
          >
            {soundActive ? <Volume2 className="size-3.5 text-teal" /> : <VolumeX className="size-3.5 text-steel" />}
            <span className="hidden sm:inline text-[11px] font-semibold">{soundActive ? 'Sound' : 'Mute'}</span>
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setPreviewLandingMode(false)
                sound.snap('high')
              }}
              className="flex items-center gap-2 rounded-full border border-teal/40 bg-teal/15 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-teal hover:text-white transition-all shadow-xs"
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-navy text-[10px] text-bright font-bold">
                {user?.avatar || 'AG'}
              </div>
              <span className="hidden sm:inline">Open Cockpit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsGoogleModalOpen(true)
                sound.snap('high')
              }}
              className="flex items-center gap-1.5 rounded-full border border-mint bg-white px-3.5 py-1.5 text-xs font-semibold text-navy shadow-xs hover:border-teal hover:bg-aqua transition-all"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.89 0 12s.45 3.86 1.24 5.42l4.04-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Sign in</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                setPreviewLandingMode(false)
              } else {
                setIsGoogleModalOpen(true)
              }
              sound.snap('high')
            }}
            className="group hidden items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-teal sm:inline-flex"
          >
            {isAuthenticated ? 'Live Dashboard' : 'Explore Fintellec'}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full text-navy md:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="mx-auto mt-2 max-w-[1400px] rounded-3xl border border-mint/90 bg-aqua/90 p-5 backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                if (isAuthenticated) {
                  setPreviewLandingMode(false)
                } else {
                  setIsGoogleModalOpen(true)
                }
                sound.snap('high')
              }}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-navy px-5 py-3 text-sm font-medium text-white shadow-xs"
            >
              {isAuthenticated ? 'Open Cockpit' : 'Sign In with Google'} <ArrowUpRight className="size-4" aria-hidden />
            </button>
            <a
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-navy/20 bg-white/80 px-5 py-3 text-sm font-medium text-navy"
            >
              Explore Fintellec
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
