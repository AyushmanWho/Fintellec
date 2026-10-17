'use client'

import React, { useState } from 'react'
import { X, Check, Shield, Lock, ArrowRight, UserCheck, KeyRound, Sparkles } from 'lucide-react'
import { useAuth } from './auth-context'
import { sound } from '@/lib/sound'

export function GoogleSignInModal() {
  const { isGoogleModalOpen, setIsGoogleModalOpen, loginWithGoogle, triggerRealGoogleLogin, isFirebaseReady } = useAuth()
  const [customMode, setCustomMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isGoogleModalOpen) return null

  const handleRealGoogleClick = async () => {
    setFirebaseError(null)
    setLoading(true)
    try {
      if (!isFirebaseReady) {
        setFirebaseError('Firebase keys not yet detected in .env.local. Add your NEXT_PUBLIC_FIREBASE_... credentials to test the real popup, or use 1-click Google sign in below.')
        setLoading(false)
        sound.warning()
        return
      }
      await triggerRealGoogleLogin()
    } catch (err: any) {
      setFirebaseError(err?.message || 'Google popup was cancelled or failed.')
      sound.warning()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-modal="true" 
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-mint/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setIsGoogleModalOpen(false)
            sound.tick()
          }}
          className="absolute right-5 top-5 rounded-full p-1.5 text-steel hover:bg-mint/30 hover:text-navy transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Google Branding Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-aqua border border-mint/80 shadow-inner">
            <svg className="size-8" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.89 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-xl font-bold tracking-tight text-navy">
            Sign in with Google
          </h3>
          <p className="mt-1 text-xs text-steel">
            Unlock your live <span className="font-semibold text-teal">Fintellec Cockpit</span> & calibrate your numbers
          </p>
        </div>

        {/* Real Firebase Google Login Button */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleRealGoogleClick}
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-navy/15 bg-white p-3.5 text-center font-semibold text-navy shadow-xs transition-all hover:border-teal hover:bg-aqua/30 active:scale-[0.99]"
          >
            <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.89 0 12s.45 3.86 1.24 5.42l4.04-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span className="text-sm">
              {loading ? 'Opening Google...' : 'Sign in with Google Popup'}
            </span>
            <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-mono text-teal font-bold">
              Firebase
            </span>
          </button>

          {/* Firebase Status / Notice Banner */}
          {firebaseError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-900 animate-in fade-in duration-150">
              <p className="font-semibold">{firebaseError}</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-mint/70" />
            <span className="font-mono text-[10px] uppercase text-steel">Or One-Click Test Account</span>
            <div className="h-px flex-1 bg-mint/70" />
          </div>

          {/* Account Selector Card */}
          {!customMode ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => loginWithGoogle('Ayushman Gupta', 'ayushmangupta201@gmail.com')}
                className="group flex w-full items-center justify-between rounded-2xl border border-teal/40 bg-aqua/70 p-3 text-left transition-all hover:border-teal hover:bg-aqua hover:shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-teal text-xs font-bold text-white shadow-xs">
                    AG
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-navy text-xs">Ayushman Gupta</span>
                      <span className="rounded-full bg-mint/80 px-1.5 py-0.2 text-[9px] font-mono font-medium text-navy">Verified</span>
                    </div>
                    <p className="text-[11px] text-steel font-mono">ayushmangupta201@gmail.com</p>
                  </div>
                </div>
                <div className="flex size-7 items-center justify-center rounded-full bg-white text-teal shadow-2xs transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomMode(true)
                  sound.tick()
                }}
                className="w-full rounded-xl border border-mint/70 bg-white/70 py-2 text-xs font-medium text-navy/80 hover:bg-aqua/60 hover:text-navy transition-colors"
              >
                Custom Google Account & Email
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!name.trim()) return
                loginWithGoogle(name.trim(), email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`)
              }}
              className="space-y-3 pt-1"
            >
              <div>
                <label className="block text-xs font-medium text-navy mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayushman Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-mint bg-white px-3.5 py-2 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy mb-1">Google Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ayushmangupta201@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-mint bg-white px-3.5 py-2 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 rounded-xl border border-mint py-2 text-xs font-semibold text-steel hover:bg-aqua/60"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal py-2 text-xs font-semibold text-white shadow-md hover:bg-teal/90"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Guarantee */}
        <div className="mt-5 rounded-2xl border border-mint/60 bg-aqua/40 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-navy/90">
            <Shield className="size-3.5 text-teal" />
            <span>Zero-Knowledge Data Vault</span>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-steel">
            Upon signing in, you will be prompted to calibrate your opening balance & monthly income.
          </p>
        </div>
      </div>
    </div>
  )
}
