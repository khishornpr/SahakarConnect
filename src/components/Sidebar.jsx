import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import EmergencyModal from './EmergencyModal'

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const location = useLocation()
  const [showEmergency, setShowEmergency] = useState(false)
  const role = profile?.role || 'worker'

  const navItems = {
    worker: [
      { path: '/worker/dashboard', label: t('overview', 'Dashboard'), icon: '📊' },
      { path: '/worker/jobs', label: t('activeJobs', 'Active Jobs'), icon: '⚡' },
      { path: '/worker/earnings', label: t('fairWageLedger', 'Wage Ledger'), icon: '💰' },
      { path: '/worker/profile', label: t('skillProfile', 'Skill Profile'), icon: '👤' },
      { path: '/worker/welfare', label: t('welfareInsurance', 'Welfare & Insurance'), icon: '🛡️' },
    ],
    household: [
      { path: '/household/dashboard', label: t('dashboard', 'Dashboard'), icon: '📊' },
      { path: '/household/book', label: t('bookService', 'Book Service'), icon: '✨' },
      { path: '/household/bookings', label: t('myBookings', 'My Bookings'), icon: '📋' },
      { path: '/household/invoices', label: t('digitalInvoices', 'Digital Invoices'), icon: '🧾' },
    ],
    cooperative: [
      { path: '/cooperative/dashboard', label: t('federationOverview', 'Dashboard'), icon: '📊' },
      { path: '/cooperative/workers', label: t('workerVerification', 'Artisan Registry'), icon: '👥' },
      { path: '/cooperative/dispatch', label: t('geoDispatch', 'Geo-Dispatch'), icon: '📍' },
      { path: '/cooperative/financials', label: t('financialsAnomalies', 'Financials & Audit'), icon: '🔍' },
      { path: '/cooperative/demand-forecast', label: t('demandPlanning', 'AI Forecasting'), icon: '📈' },
    ],
  }

  const items = navItems[role] || []

  return (
    <>
      {/* Desktop FlowBoard Sidebar */}
      <aside
        className={`hidden md:flex w-64 shrink-0 min-h-screen flex-col z-30 sticky top-0 h-screen transition-colors duration-300 backdrop-blur-xl ${
          isDark
            ? 'bg-[#0f1217]/95 border-r border-white/[0.08] text-white shadow-[4px_0_24px_rgba(0,0,0,0.5)]'
            : 'bg-white border-r border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff5500] to-[#ff8c00] text-white flex items-center justify-center font-black text-xl shadow-[0_0_22px_rgba(255,107,0,0.65)] shrink-0 transition-transform hover:scale-105">
              ⚡
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-black tracking-tight flex items-center gap-1.5 truncate">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>{t('brandTitle', 'SahakarConnect')}</span>
              </h1>
              <p className="text-[11px] text-[#ff7a00] font-bold tracking-wide truncate flex items-center gap-1">
                <span>{t('subTagline', 'Smart Labour Co-op')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </p>
            </div>
          </div>

          {/* Search Shortcut Bar */}
          <div className="mt-4 relative">
            <span className="absolute left-3 top-2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              readOnly
              placeholder={t('searchPlaceholder', 'Search portal...')}
              className={`w-full pl-8 pr-10 py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-slate-300 placeholder-slate-500 hover:border-white/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 hover:border-slate-300'
              }`}
            />
            <span className={`absolute right-2.5 top-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              isDark ? 'bg-[#0b0d11] border-white/[0.1] text-slate-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              ⌘K
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
          <div>
            <div className="px-3 text-[10px] font-extrabold tracking-wider uppercase text-slate-500 mb-2">
              {t('mainMenu', 'MAIN MENU')}
            </div>
            <nav className="space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'flow-nav-active'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-[#181d26] glow-orange-hover'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Emergency SOS Button with High-Impact Glow */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="px-3 text-[10px] font-extrabold tracking-wider uppercase text-slate-500 mb-2">
              {t('rapidResponse', 'RAPID RESPONSE')}
            </div>
            <button
              type="button"
              onClick={() => setShowEmergency(true)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all glow-rose-hover neon-pulse-rose ${
                isDark
                  ? 'bg-[#181d26] border border-rose-500/50 text-rose-300 hover:border-rose-400'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              <span className="animate-pulse text-base">🚨</span>
              <span className="truncate">{t('emergencySosButton', '30-Min Emergency SOS')}</span>
            </button>
          </div>

          {/* FlowBoard Welfare / Pro Banner Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#181d26] to-[#12151c] border border-white/[0.08] space-y-2 glow-orange-hover">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span>🚀</span>
              <span>{t('cooperativeWelfare', 'Cooperative Welfare')}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {t('welfareCardSub', '100% statutory fair wages with social security fund coverage.')}
            </p>
            <Link
              to={role === 'worker' ? '/worker/welfare' : '/cooperative/financials'}
              className="w-full block text-center py-1.5 flow-btn-primary font-bold text-[11px] rounded-lg shadow-md transition-all"
            >
              {t('viewProtectionPlan', 'View Protection Plan')}
            </Link>
          </div>
        </div>

        {/* FlowBoard User Footer Card */}
        <div className={`p-4 border-t ${isDark ? 'border-white/[0.06] bg-[#0b0d11]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff6b00] to-[#ffaa00] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_12px_rgba(255,107,0,0.5)] shrink-0">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold flex items-center gap-1 truncate">
                <span className={`truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.full_name}</span>
                <span className="text-[#ff7a00] text-xs">✓</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{profile?.email}</div>
            </div>
          </div>

          <button
            onClick={signOut}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              isDark
                ? 'bg-[#161a22] hover:bg-rose-950/60 hover:text-rose-300 border border-white/[0.06] text-slate-300'
                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
            }`}
          >
            <span>🚪</span>
            <span>{t('signOut', 'Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 py-1.5 flex justify-around items-center backdrop-blur-xl ${
          isDark ? 'bg-[#0f1217]/95 border-t border-white/[0.08] text-white' : 'bg-white/95 border-t border-slate-200 text-slate-900'
        }`}
      >
        {items.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] transition-all ${
                isActive ? 'text-[#ff7a00] font-black scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate max-w-[65px]">{item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setShowEmergency(true)}
          className="flex flex-col items-center py-1 px-2 text-rose-500 text-[10px] font-black"
        >
          <span className="text-lg animate-pulse">🚨</span>
          <span>SOS</span>
        </button>
      </div>

      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </>
  )
}
