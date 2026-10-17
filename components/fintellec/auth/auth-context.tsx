'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { sound } from '@/lib/sound'
import { loginWithRealGoogle, logoutRealGoogle, isFirebaseConfigured } from '@/lib/firebase'

export interface UserProfile {
  name: string
  email: string
  avatar: string
  photoURL?: string
  balance: number
  monthlyExpense: number
  savings: number
  monthlyIncome?: number
  financialIq: number
  streakDays: number
  hideBalance: boolean
  workspace: 'personal' | 'business'
  hasCompletedOnboarding?: boolean
}

export interface ExpenseItem {
  id: string
  title: string
  amount: number
  category: 'food' | 'tech' | 'travel' | 'lifestyle' | 'bills' | 'impulse'
  date: string
  time: string
  account: string
  impactNote?: string
}

export interface GoalItem {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyAllocation: number
  originalDate: string
  currentDate: string
  delayMonths: number
  priority: 'high' | 'medium' | 'low'
  status: 'on-track' | 'caution' | 'critical'
  cushionDaysRemaining?: number
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  activeTab: 'dashboard' | 'analytics' | 'wallet' | 'goals' | 'investments' | 'reports' | 'profile'
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'wallet' | 'goals' | 'investments' | 'reports' | 'profile') => void
  loginWithGoogle: (customName?: string, customEmail?: string) => Promise<void>
  triggerRealGoogleLogin: () => Promise<void>
  logout: () => void
  toggleHideBalance: () => void
  setWorkspace: (ws: 'personal' | 'business') => void
  completeOnboarding: (params: {
    balance: number
    monthlyIncome: number
    savings: number
    workspace: 'personal' | 'business'
    firstGoal?: { name: string; target: number }
  }) => void
  isFirebaseReady: boolean

  // Modals & Drawers
  isGoogleModalOpen: boolean
  setIsGoogleModalOpen: (open: boolean) => void
  isOnboardingOpen: boolean
  setIsOnboardingOpen: (open: boolean) => void
  isAddExpenseOpen: boolean
  setIsAddExpenseOpen: (open: boolean) => void
  isAddGoalOpen: boolean
  setIsAddGoalOpen: (open: boolean) => void
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  isIqModalOpen: boolean
  setIsIqModalOpen: (open: boolean) => void
  isCohortDrawerOpen: boolean
  setIsCohortDrawerOpen: (open: boolean) => void
  isNotificationsOpen: boolean
  setIsNotificationsOpen: (open: boolean) => void

  // Data & Mutators
  expenses: ExpenseItem[]
  goals: GoalItem[]
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'date' | 'time'>) => void
  deleteExpense: (id: string) => void
  addGoal: (goal: { name: string; targetAmount: number; currentAmount: number; monthlyAllocation: number; targetDate: string; priority: 'high' | 'medium' | 'low' }) => void
  deleteGoal: (id: string) => void
  clearAllData: () => void
  previewLandingMode: boolean
  setPreviewLandingMode: (mode: boolean) => void
}

const DEFAULT_NEW_USER: UserProfile = {
  name: 'New Member',
  email: 'user@fintellec.io',
  avatar: 'NM',
  balance: 0,
  monthlyExpense: 0,
  savings: 0,
  monthlyIncome: 30000,
  financialIq: 70,
  streakDays: 1,
  hideBalance: false,
  workspace: 'personal',
  hasCompletedOnboarding: false,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_NEW_USER)
  const [isExplicitlyLoggedIn, setIsExplicitlyLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'wallet' | 'goals' | 'investments' | 'reports' | 'profile'>('dashboard')
  const [previewLandingMode, setPreviewLandingMode] = useState(false)
  
  // Modals
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isIqModalOpen, setIsIqModalOpen] = useState(false)
  const [isCohortDrawerOpen, setIsCohortDrawerOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Real operational data — starts completely clean for fresh users
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [goals, setGoals] = useState<GoalItem[]>([])

  // Load persisted session and user-specific data
  useEffect(() => {
    try {
      // Check if user session exists
      const savedUserStr = localStorage.getItem('fintellec_auth_user')
      if (savedUserStr) {
        const savedUser: UserProfile = JSON.parse(savedUserStr)
        setUser(savedUser)
        setIsExplicitlyLoggedIn(true)

        // Load user's real saved expenses
        const savedExpStr = localStorage.getItem(`fintellec_expenses_${savedUser.email}`)
        if (savedExpStr) {
          setExpenses(JSON.parse(savedExpStr))
        }

        // Load user's real saved goals
        const savedGoalsStr = localStorage.getItem(`fintellec_goals_${savedUser.email}`)
        if (savedGoalsStr) {
          setGoals(JSON.parse(savedGoalsStr))
        }

        // If user never calibrated, prompt onboarding
        if (!savedUser.hasCompletedOnboarding) {
          setIsOnboardingOpen(true)
        }
      }
    } catch (err) {
      console.warn('Error reading stored session:', err)
    }
  }, [])

  // Listen to ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
        sound.snap('high')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loginWithGoogle = async (customName?: string, customEmail?: string) => {
    const name = customName || 'New User'
    const email = customEmail || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`
    const avatar = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

    // Check if this email already had an existing profile
    let existingProfile: UserProfile | null = null
    try {
      const saved = localStorage.getItem(`fintellec_profile_${email}`)
      if (saved) existingProfile = JSON.parse(saved)
    } catch {}

    const newUser: UserProfile = existingProfile || {
      ...DEFAULT_NEW_USER,
      name,
      email,
      avatar,
      balance: 0,
      monthlyExpense: 0,
      savings: 0,
      hasCompletedOnboarding: false,
    }

    setUser(newUser)
    setIsExplicitlyLoggedIn(true)
    setPreviewLandingMode(false)
    setIsGoogleModalOpen(false)

    // Load any existing expenses or goals for this email
    try {
      localStorage.setItem('fintellec_auth_user', JSON.stringify(newUser))
      const savedExp = localStorage.getItem(`fintellec_expenses_${email}`)
      setExpenses(savedExp ? JSON.parse(savedExp) : [])
      const savedG = localStorage.getItem(`fintellec_goals_${email}`)
      setGoals(savedG ? JSON.parse(savedG) : [])
    } catch {}

    sound.chime()

    // Trigger onboarding calibration if first time
    if (!newUser.hasCompletedOnboarding) {
      setTimeout(() => setIsOnboardingOpen(true), 350)
    }
  }

  const triggerRealGoogleLogin = async () => {
    try {
      sound.snap('high')
      const googleUser = await loginWithRealGoogle()
      if (!googleUser) return

      let existingProfile: UserProfile | null = null
      try {
        const saved = localStorage.getItem(`fintellec_profile_${googleUser.email}`)
        if (saved) existingProfile = JSON.parse(saved)
      } catch {}

      const newUser: UserProfile = existingProfile || {
        ...DEFAULT_NEW_USER,
        name: googleUser.name,
        email: googleUser.email,
        photoURL: googleUser.photoURL,
        avatar: googleUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'G',
        balance: 0,
        monthlyExpense: 0,
        savings: 0,
        hasCompletedOnboarding: false,
      }

      setUser(newUser)
      setIsExplicitlyLoggedIn(true)
      setPreviewLandingMode(false)
      setIsGoogleModalOpen(false)

      try {
        localStorage.setItem('fintellec_auth_user', JSON.stringify(newUser))
        const savedExp = localStorage.getItem(`fintellec_expenses_${googleUser.email}`)
        setExpenses(savedExp ? JSON.parse(savedExp) : [])
        const savedG = localStorage.getItem(`fintellec_goals_${googleUser.email}`)
        setGoals(savedG ? JSON.parse(savedG) : [])
      } catch {}

      sound.chime()

      if (!newUser.hasCompletedOnboarding) {
        setTimeout(() => setIsOnboardingOpen(true), 350)
      }
    } catch (err: any) {
      console.error('Firebase Login Error:', err)
      throw err
    }
  }

  const completeOnboarding = (params: {
    balance: number
    monthlyIncome: number
    savings: number
    workspace: 'personal' | 'business'
    firstGoal?: { name: string; target: number }
  }) => {
    if (!user) return

    const updatedUser: UserProfile = {
      ...user,
      balance: params.balance,
      monthlyIncome: params.monthlyIncome,
      savings: params.savings,
      workspace: params.workspace,
      monthlyExpense: 0,
      hasCompletedOnboarding: true,
    }

    setUser(updatedUser)
    setIsOnboardingOpen(false)

    // Optionally create user's first real goal if provided
    let newGoalsList = goals
    if (params.firstGoal && params.firstGoal.name.trim() && params.firstGoal.target > 0) {
      const g: GoalItem = {
        id: `goal-${Date.now()}`,
        name: params.firstGoal.name.trim(),
        targetAmount: params.firstGoal.target,
        currentAmount: params.savings > 0 ? params.savings : 0,
        monthlyAllocation: Math.round(params.monthlyIncome * 0.15),
        originalDate: '6 Months',
        currentDate: '6 Months',
        delayMonths: 0,
        priority: 'high',
        status: 'on-track',
        cushionDaysRemaining: Math.round((params.balance / (params.monthlyIncome / 30)) || 30),
      }
      newGoalsList = [g]
      setGoals(newGoalsList)
    }

    try {
      localStorage.setItem('fintellec_auth_user', JSON.stringify(updatedUser))
      localStorage.setItem(`fintellec_profile_${user.email}`, JSON.stringify(updatedUser))
      localStorage.setItem(`fintellec_goals_${user.email}`, JSON.stringify(newGoalsList))
    } catch {}

    sound.triumph()
  }

  const addExpense = (newExp: Omit<ExpenseItem, 'id' | 'date' | 'time'>) => {
    const now = new Date()
    const item: ExpenseItem = {
      ...newExp,
      id: `exp-${Date.now()}`,
      date: 'Today',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    const updatedExpenses = [item, ...expenses]
    setExpenses(updatedExpenses)

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        balance: Math.max(0, user.balance - newExp.amount),
        monthlyExpense: user.monthlyExpense + newExp.amount,
        financialIq: newExp.category === 'impulse' ? Math.max(30, user.financialIq - 3) : Math.min(100, user.financialIq + 1),
      }
      setUser(updatedUser)

      try {
        localStorage.setItem('fintellec_auth_user', JSON.stringify(updatedUser))
        localStorage.setItem(`fintellec_profile_${user.email}`, JSON.stringify(updatedUser))
        localStorage.setItem(`fintellec_expenses_${user.email}`, JSON.stringify(updatedExpenses))
      } catch {}
    }

    // Check goal collision dynamically
    if (newExp.amount > 1000 && goals.length > 0) {
      const updatedGoals = goals.map((g, idx) => {
        if (idx === 0) {
          return {
            ...g,
            delayMonths: +(g.delayMonths + 0.5).toFixed(1),
            status: 'caution' as const,
          }
        }
        return g
      })
      setGoals(updatedGoals)
      if (user) {
        try {
          localStorage.setItem(`fintellec_goals_${user.email}`, JSON.stringify(updatedGoals))
        } catch {}
      }
    }

    sound.crownTick()
  }

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id)
    const updated = expenses.filter((e) => e.id !== id)
    setExpenses(updated)

    if (user && target) {
      const updatedUser: UserProfile = {
        ...user,
        balance: user.balance + target.amount,
        monthlyExpense: Math.max(0, user.monthlyExpense - target.amount),
      }
      setUser(updatedUser)
      try {
        localStorage.setItem('fintellec_auth_user', JSON.stringify(updatedUser))
        localStorage.setItem(`fintellec_profile_${user.email}`, JSON.stringify(updatedUser))
        localStorage.setItem(`fintellec_expenses_${user.email}`, JSON.stringify(updated))
      } catch {}
    }
    sound.tick()
  }

  const addGoal = (newGoal: {
    name: string
    targetAmount: number
    currentAmount: number
    monthlyAllocation: number
    targetDate: string
    priority: 'high' | 'medium' | 'low'
  }) => {
    const item: GoalItem = {
      id: `goal-${Date.now()}`,
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount,
      monthlyAllocation: newGoal.monthlyAllocation,
      originalDate: newGoal.targetDate,
      currentDate: newGoal.targetDate,
      delayMonths: 0,
      priority: newGoal.priority,
      status: 'on-track',
      cushionDaysRemaining: user ? Math.round(user.balance / ((user.monthlyIncome || 30000) / 30)) : 30,
    }
    const updated = [...goals, item]
    setGoals(updated)

    if (user) {
      try {
        localStorage.setItem(`fintellec_goals_${user.email}`, JSON.stringify(updated))
      } catch {}
    }
    sound.snap('high')
  }

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id)
    setGoals(updated)
    if (user) {
      try {
        localStorage.setItem(`fintellec_goals_${user.email}`, JSON.stringify(updated))
      } catch {}
    }
    sound.tick()
  }

  const clearAllData = () => {
    if (!user) return
    const resetUser: UserProfile = {
      ...user,
      balance: 0,
      monthlyExpense: 0,
      savings: 0,
      hasCompletedOnboarding: false,
    }
    setUser(resetUser)
    setExpenses([])
    setGoals([])

    try {
      localStorage.setItem('fintellec_auth_user', JSON.stringify(resetUser))
      localStorage.removeItem(`fintellec_expenses_${user.email}`)
      localStorage.removeItem(`fintellec_goals_${user.email}`)
      localStorage.removeItem(`fintellec_profile_${user.email}`)
    } catch {}

    setIsOnboardingOpen(true)
    sound.sadSlide()
  }

  const logout = () => {
    if (isFirebaseConfigured) {
      logoutRealGoogle().catch(() => {})
    }
    setUser(DEFAULT_NEW_USER)
    setIsExplicitlyLoggedIn(false)
    setPreviewLandingMode(false)
    setIsOnboardingOpen(false)
    setExpenses([])
    setGoals([])
    try {
      localStorage.removeItem('fintellec_auth_user')
    } catch {}
    sound.sadSlide()
  }

  const toggleHideBalance = () => {
    if (!user) return
    const updated = { ...user, hideBalance: !user.hideBalance }
    setUser(updated)
    try {
      localStorage.setItem('fintellec_auth_user', JSON.stringify(updated))
    } catch {}
    sound.tick(updated.hideBalance ? 1400 : 2200)
  }

  const setWorkspace = (ws: 'personal' | 'business') => {
    if (!user) return
    const updated = { ...user, workspace: ws }
    setUser(updated)
    try {
      localStorage.setItem('fintellec_auth_user', JSON.stringify(updated))
    } catch {}
    sound.snap('low')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isExplicitlyLoggedIn,
        activeTab,
        setActiveTab,
        loginWithGoogle,
        triggerRealGoogleLogin,
        logout,
        toggleHideBalance,
        setWorkspace,
        completeOnboarding,
        isFirebaseReady: isFirebaseConfigured,
        isGoogleModalOpen,
        setIsGoogleModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isAddGoalOpen,
        setIsAddGoalOpen,
        isSearchOpen,
        setIsSearchOpen,
        isIqModalOpen,
        setIsIqModalOpen,
        isCohortDrawerOpen,
        setIsCohortDrawerOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        expenses,
        goals,
        addExpense,
        deleteExpense,
        addGoal,
        deleteGoal,
        clearAllData,
        previewLandingMode,
        setPreviewLandingMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
