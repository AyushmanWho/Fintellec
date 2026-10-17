'use client'

import React, { useState } from 'react'
import { X, Target, Plus, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'

export function AddGoalModal() {
  const { isAddGoalOpen, setIsAddGoalOpen, addGoal } = useAuth()

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [monthlyAllocation, setMonthlyAllocation] = useState('')
  const [targetDate, setTargetDate] = useState('6 Months')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')

  if (!isAddGoalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseFloat(targetAmount) || 0
    if (!name.trim() || target <= 0) return

    addGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: parseFloat(currentAmount) || 0,
      monthlyAllocation: parseFloat(monthlyAllocation) || Math.round(target / 6),
      targetDate,
      priority,
    })

    setName('')
    setTargetAmount('')
    setCurrentAmount('0')
    setMonthlyAllocation('')
    setIsAddGoalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-mint/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
        <button
          type="button"
          onClick={() => {
            setIsAddGoalOpen(false)
            sound.tick()
          }}
          className="absolute right-5 top-5 rounded-full p-1.5 text-steel hover:bg-mint/30 hover:text-navy transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-teal text-white shadow-xs">
            <Target className="size-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal">
              COLLISION MATRIX ENGINE
            </span>
            <h2 className="text-xl font-extrabold text-navy">Add New Goal</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Goal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund, Goa Trip, Bike Down-Payment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Target Amount (₹)</label>
              <input
                type="number"
                min="100"
                required
                placeholder="e.g. 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-sm font-mono text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Already Saved (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-sm font-mono text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Monthly Plan (₹/mo)</label>
              <input
                type="number"
                min="0"
                placeholder="Auto-calculated if blank"
                value={monthlyAllocation}
                onChange={(e) => setMonthlyAllocation(e.target.value)}
                className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-xs font-mono text-navy outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Target Timeline</label>
              <select
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-xs text-navy outline-none focus:border-teal"
              >
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPriority(p)
                    sound.tick()
                  }}
                  className={`rounded-xl border py-2 text-xs font-semibold capitalize transition-all ${
                    priority === p
                      ? 'border-teal bg-aqua text-navy ring-2 ring-teal/20'
                      : 'border-mint/80 bg-white text-steel hover:bg-aqua/30'
                  }`}
                >
                  {p} Priority
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddGoalOpen(false)}
              className="flex-1 rounded-xl border border-mint py-2.5 text-xs font-semibold text-steel hover:bg-aqua/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-teal py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal/90 active:scale-95 transition-all"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

