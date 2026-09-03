import { useState, useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'

const PORTAL_NOTIFICATIONS = {
  worker: [
    { id: 'w1', icon: '💰', title: '₹1,850 Direct Wage Credited', desc: 'Net payout for Electrician Service #SHK-4102 transferred via instant UPI.', time: '2m ago', unread: true },
    { id: 'w2', icon: '⚡', title: 'High-Demand Surge in Sector 18', desc: 'Surge rates active: 1.3x on all Plumbing & Electrical calls till 8 PM.', time: '25m ago', unread: true },
    { id: 'w3', icon: '🛡️', title: 'Welfare Fund Verified', desc: 'Ayushman Bharat & accidental coverage active for Q3 with zero deductions.', time: '2h ago', unread: false },
  ],
  household: [
    { id: 'h1', icon: '🚗', title: 'Worker En Route (ETA: 12 min)', desc: 'Ramesh Kumar (Electrician, 4.9★) has departed towards your address.', time: '5m ago', unread: true },
    { id: 'h2', icon: '🧾', title: 'Invoice #SHK-8891 Ready', desc: 'Transparent bill of ₹1,200 generated with ₹0 middleman surcharge.', time: '1h ago', unread: true },
    { id: 'h3', icon: '⭐', title: 'Service Completed', desc: 'Please leave a verified cooperative rating for Sunita Devi (Sanitization).', time: '3h ago', unread: false },
  ],
  cooperative: [
    { id: 'c1', icon: '📊', title: 'Demand Spike Alert (+38%)', desc: 'AI forecast: North Delhi district expects 350+ AC servicing requests.', time: '10m ago', unread: true },
    { id: 'c2', icon: '🏛️', title: 'Batch Payout Disbursed', desc: '₹248,500 transferred to 68 member accounts directly with 0% leakages.', time: '45m ago', unread: true },
    { id: 'c3', icon: '⚖️', title: 'New Grievance Docket #GR-104', desc: 'Dispute submitted regarding tariff rate verification in Rohini cluster.', time: '3h ago', unread: false },
  ],
  manager: [
    { id: 'm1', icon: '📈', title: 'Zonal Target 92% Achieved', desc: 'East Delhi cluster exceeded weekly completion benchmark (141 jobs).', time: '15m ago', unread: true },
    { id: 'm2', icon: '⚡', title: 'GPS Roster Check-in', desc: '42 of 45 field technicians active and checked into assigned geo-fences.', time: '1h ago', unread: true },
    { id: 'm3', icon: '🛠️', title: 'Customer Reschedule Request', desc: 'Job #SHK-9921 requested evening shift change in Sector 62.', time: '2h ago', unread: false },
  ],
  officer: [
    { id: 'o1', icon: '⚖️', title: 'New Labor Grievance Filed', desc: 'Case #DL-2026-089 filed under Section 12-A Fair Compensation Rule.', time: '8m ago', unread: true },
    { id: 'o2', icon: '📜', title: 'Welfare Audit Compliance Due', desc: 'Quarterly Social Security Fund ledger audit submission due in 5 days.', time: '1h ago', unread: true },
    { id: 'o3', icon: '🔔', title: 'Adjudication Hearing Tomorrow', desc: 'Virtual docket review scheduled for 11:00 AM with Apex Co-op Board.', time: '4h ago', unread: false },
  ],
}

function getStoredNotifications(role, userId) {
  try {
    const key = `sahakar_notifications_${userId || role}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Error reading stored notifications:', e)
  }
  return PORTAL_NOTIFICATIONS[role] || PORTAL_NOTIFICATIONS.worker
}

export default function DashboardLayout() {
  const { profile, signOut } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const role = profile?.role || 'worker'

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(() => getStoredNotifications(role, profile?.id))

  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  // Sync notifications if role or user changes
  useEffect(() => {
    setNotifications(getStoredNotifications(role, profile?.id))
  }, [role, profile?.id])

  // Click outside listener for popovers
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  function handleMarkAllAsRead() {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, unread: false }))
      try {
        const key = `sahakar_notifications_${profile?.id || role}`
        localStorage.setItem(key, JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  function handleMarkSingleAsRead(id) {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      try {
        const key = `sahakar_notifications_${profile?.id || role}`
        localStorage.setItem(key, JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  function handleDismissNotif(id) {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      try {
        const key = `sahakar_notifications_${profile?.id || role}`
        localStorage.setItem(key, JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  const roleTitles = {
    worker: t('workerPortal', 'Cooperative Worker Portal'),
    household: t('householdPortal', 'Household Customer Portal'),
    cooperative: t('adminPortal', 'Federation Admin Portal'),
    manager: t('managerPortal', 'Zonal Manager Operations Hub'),
    officer: t('officerPortal', 'Labor Department Adjudication Portal'),
    labor_officer: t('officerPortal', 'Labor Department Adjudication Portal'),
    labor: t('officerPortal', 'Labor Department Adjudication Portal'),
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const userInitial = profile?.full_name?.trim()?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div
      className={`flex min-h-screen w-full transition-colors duration-300 relative overflow-x-hidden ${
        isDark ? 'bg-[#0b0d11] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background Ambient Glow Orbs in Dark Mode */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0 relative z-10">
        {/* FlowBoard Top Navigation Header */}
        <header
          className={`sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 border-b backdrop-blur-xl ${
            isDark
              ? 'bg-[#0f1217]/90 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              : 'bg-white/90 border-slate-200 shadow-sm'
          }`}
        >
          {/* Left Title / Greeting with "Welcome" */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff5500] to-[#ff8c00] text-white flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(255,107,0,0.6)] shrink-0">
                ⚡
              </span>
              <span className={`font-black text-xs sm:text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('brandTitle', 'SahakarConnect')}
              </span>
            </div>

            <div className="hidden md:flex items-center">
              <div className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {roleTitles[role]}
              </div>
            </div>
          </div>

          {/* Right Controls: Date Badge + Notifications + Theme Toggle + Language Toggle + Profile Avatar / Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* FlowBoard Date Badge */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-slate-200 hover:border-white/20'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <span>📅</span>
              <span>{currentDate}</span>
            </div>

            {/* Notification Bell with ALWAYS Shaking & Glowing Animation + Functional Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm border transition-all cursor-pointer neon-bell-button neon-glow-pulse-orange ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.15] text-slate-100 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="text-base sm:text-lg animate-bell-shake select-none">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff5500] text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,1)] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div
                  className={`absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in-up ${
                    isDark
                      ? 'bg-[#12151c]/95 border-white/[0.12] text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.15)]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔔</span>
                      <h3 className="text-sm font-black tracking-tight">{t('notifications', 'Notifications')}</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6b00]/20 text-[#ff7a00] border border-[#ff6b00]/40">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-[#ff7a00] hover:underline font-bold cursor-pointer"
                      >
                        {t('markAllRead', 'Mark all read')}
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        ✨ {t('noNotifications', 'You are all caught up!')}
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => item.unread && handleMarkSingleAsRead(item.id)}
                          className={`p-3 rounded-xl border transition-all flex items-start gap-3 relative group ${
                            item.unread ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            item.unread
                              ? isDark
                                ? 'bg-[#181d26] border-[#ff6b00]/30 shadow-[0_0_12px_rgba(255,107,0,0.1)] hover:border-[#ff6b00]/60'
                                : 'bg-orange-50/70 border-orange-200 hover:border-orange-300'
                              : isDark
                              ? 'bg-[#141720]/60 border-white/[0.04]'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span className="truncate">{item.title}</span>
                              {item.unread && (
                                <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse shrink-0 ml-1"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                              {item.desc}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                              {item.time}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDismissNotif(item.id)
                            }}
                            title="Dismiss"
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 text-xs transition-opacity cursor-pointer p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <LanguageToggle />

            {/* User Profile Avatar Box Button & Dropdown with Name, Email & Logout */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={`${profile?.full_name || 'User'} (Account & Logout)`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#ff6b00] to-[#ffaa00] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-[0_0_15px_rgba(255,107,0,0.5)] transition-all cursor-pointer border border-white/20 ${
                  showUserMenu ? 'ring-2 ring-[#ff6b00] scale-105' : 'hover:scale-105 hover:shadow-[0_0_25px_rgba(255,107,0,0.8)]'
                }`}
              >
                {userInitial}
              </button>

              {/* Popover Dropdown with Details & Logout */}
              {showUserMenu && (
                <div
                  className={`absolute right-0 mt-2.5 w-64 sm:w-72 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in-up transition-all ${
                    isDark
                      ? 'bg-[#12151c]/95 border-white/[0.12] text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.15)]'
                  }`}
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#ff6b00] to-[#ffaa00] text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black truncate flex items-center gap-1">
                        <span>{profile?.full_name || 'Authenticated Member'}</span>
                        <span className="text-[#ff7a00] text-xs">✓</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{profile?.email || 'user@sahakar.in'}</div>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut()
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.6)] cursor-pointer"
                    >
                      <span>🚪</span>
                      <span>{t('signOut', 'Sign Out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Workspace with smooth fade in */}
        <main className="flex-1 p-3 sm:p-6 lg:p-7 animate-fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
