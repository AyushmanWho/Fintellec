'use client'

import React from 'react'
import { X, Bell, AlertTriangle, CheckCircle2, Shield, Moon } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

export function NotificationsModal() {
  const { isNotificationsOpen, setIsNotificationsOpen } = useAuth()
  if (!isNotificationsOpen) return null

  const notes = [
    { id: '1', title: 'Goal Collision Warning', desc: 'Goa Trip Fund target projected date delayed by +2.5 Months due to recent discretionary expenses.', time: '10m ago', icon: AlertTriangle, color: 'text-orange-500 bg-orange-50' },
    { id: '2', title: 'Budget Velocity Alert', desc: '37% of monthly allowance consumed in 14 days. Current burn rate is sustainable.', time: '2h ago', icon: CheckCircle2, color: 'text-teal bg-aqua' },
    { id: '3', title: 'Circadian Impulse Guard Armed', desc: 'High-risk checkout window (1:00 AM – 3:30 AM) active. 15-minute reflection delays enabled.', time: 'Yesterday', icon: Moon, color: 'text-navy bg-mint/50' },
    { id: '4', title: 'UPI Account Telemetry Synced', desc: 'HDFC Bank ending in •••• 4091 refreshed. Zero unexpected mandate deductions.', time: '1d ago', icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 sm:pr-8 bg-navy/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-3xl border border-mint/90 bg-white p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-mint/60 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-teal" />
            <h3 className="font-bold text-navy text-sm">Notifications (9+)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(false)
              sound.tick()
            }}
            className="rounded-full p-1 text-steel hover:text-navy"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-mint/40 max-h-96 overflow-y-auto">
          {notes.map((n) => {
            const Icon = n.icon
            return (
              <div key={n.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-navy">{n.title}</h4>
                    <p className="mt-0.5 text-[11px] text-steel leading-relaxed">{n.desc}</p>
                    <span className="font-mono text-[9px] text-steel/80 mt-1 block">{n.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
