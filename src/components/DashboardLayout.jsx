import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'

export default function DashboardLayout() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const role = profile?.role || 'worker'

  const roleTitles = {
    worker: t('workerPortal', 'Cooperative Worker Portal'),
    household: t('householdPortal', 'Household Customer Portal'),
    cooperative: t('adminPortal', 'Federation Admin Portal'),
    manager: t('managerPortal', 'Zonal Manager Operations Hub'),
    officer: t('officerPortal', 'Labor Department Adjudication Portal'),
    labor_officer: t('officerPortal', 'Labor Department Adjudication Portal'),
    labor: t('officerPortal', 'Labor Department Adjudication Portal'),
  }

  const roleThemeBadge = {
    worker: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    household: isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200',
    cooperative: isDark ? 'bg-[#ff6b00]/10 text-[#ff7a00] border-[#ff6b00]/30' : 'bg-orange-50 text-orange-700 border-orange-200',
    manager: isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200',
    officer: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200',
    labor_officer: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200',
    labor: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

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
          className={`sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-all duration-300 border-b backdrop-blur-xl ${
            isDark
              ? 'bg-[#0f1217]/90 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              : 'bg-white/90 border-slate-200 shadow-sm'
          }`}
        >
          {/* Left Title / Greeting */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#ff5500] to-[#ff8c00] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-[0_0_15px_rgba(255,107,0,0.6)] shrink-0">
                ⚡
              </span>
              <span className={`font-black text-xs sm:text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('brandTitle', 'SahakarConnect')}
              </span>
            </div>

            <div className="hidden md:flex flex-col">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span>{t('greetingMorning', 'Good morning')}, <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile?.full_name?.split(' ')[0] || t('member', 'Member')}</span> 👋</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${roleThemeBadge[role]}`}>
                  {t(role + 'Role', role)}
                </span>
              </div>
              <div className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {roleTitles[role]}
              </div>
            </div>
          </div>

          {/* Right Controls: Date Badge + Notifications + Theme Toggle + Language Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* FlowBoard Date Badge */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:border-white/20'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <span>📅</span>
              <span>{currentDate}</span>
              <span className="text-slate-500 text-[10px]">⌄</span>
            </div>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm border transition-all ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:text-white glow-orange-hover'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🔔</span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#ff5500] text-white text-[8px] sm:text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(255,107,0,0.8)]">
                3
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <LanguageToggle />
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
