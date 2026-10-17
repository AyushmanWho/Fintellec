'use client'

import React, { useState } from 'react'
import { X, Plus, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function AddExpenseModal() {
  const { isAddExpenseOpen, setIsAddExpenseOpen, addExpense, user } = useAuth()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<'food' | 'tech' | 'travel' | 'lifestyle' | 'bills' | 'impulse'>('food')
  const [account, setAccount] = useState('HDFC UPI')

  if (!isAddExpenseOpen) return null

  const parsedAmount = parseFloat(amount) || 0
  const causesCollision = parsedAmount >= 1000

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || parsedAmount <= 0) return

    addExpense({
      title: title.trim(),
      amount: parsedAmount,
      category,
      account,
      impactNote: causesCollision ? 'Induced delay on secondary goals' : 'Absorbed within discretionary budget',
    })

    setTitle('')
    setAmount('')
    setIsAddExpenseOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-mint/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
        <button
          type="button"
          onClick={() => {
            setIsAddExpenseOpen(false)
            sound.tick()
          }}
          className="absolute right-5 top-5 rounded-full p-1.5 text-steel hover:bg-mint/30 hover:text-navy transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
            LIVE LEDGER ENTRY
          </span>
          <h2 className="text-xl font-extrabold text-navy mt-0.5">Log Expense & Collision Check</h2>
          <p className="text-xs text-steel mt-0.5">
            Every transaction is run through your active Goal Collision Matrix in real-time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-navy mb-1">Expense Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Gourmet Burger / Uniqlo Jacket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-sm font-mono text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Account Source</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full rounded-xl border border-mint bg-white px-3.5 py-2.5 text-xs text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              >
                <option value="HDFC UPI">HDFC UPI (•••• 4091)</option>
                <option value="ICICI Visa">ICICI Visa (•••• 8823)</option>
                <option value="Cash Reserve">Cash Reserve</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'food', label: '☕ Dining', icon: '☕' },
                  { id: 'tech', label: '💻 Tech', icon: '💻' },
                  { id: 'travel', label: '🚕 Transit', icon: '🚕' },
                  { id: 'lifestyle', label: '🛍️ Lifestyle', icon: '🛍️' },
                  { id: 'bills', label: '📄 Fixed Bills', icon: '📄' },
                  { id: 'impulse', label: '🌙 Impulse', icon: '🌙' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id)
                    sound.tick()
                  }}
                  className={cn(
                    'rounded-xl border py-2 text-xs font-medium transition-all text-center',
                    category === cat.id
                      ? 'border-teal bg-aqua text-navy font-bold ring-2 ring-teal/20'
                      : 'border-mint/70 bg-white text-steel hover:bg-aqua/30',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-Time Collision Impact Simulator Box */}
          <div className={cn(
            'rounded-2xl p-3 text-xs transition-all border',
            causesCollision
              ? 'border-orange-300 bg-orange-50/80 text-orange-950'
              : 'border-emerald-200 bg-emerald-50/60 text-emerald-950',
          )}>
            <div className="flex items-center gap-1.5 font-bold">
              {causesCollision ? (
                <>
                  <AlertTriangle className="size-4 text-orange-600" />
                  <span>Collision Impact: Goa Trip Fund will be delayed by +0.5 Mo</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>No Collision: Within safe daily discretionary threshold</span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] opacity-80">
              New Projected Balance: <strong>₹{Math.max(0, (user?.balance || 0) - parsedAmount).toLocaleString('en-IN')}</strong>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="flex-1 rounded-xl border border-mint py-2.5 text-xs font-semibold text-steel hover:bg-aqua/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-teal py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal/90 transition-all active:scale-95"
            >
              Confirm & Deduct
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
