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
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const role = profile?.role || 'worker'

  const navItems = {
    worker: [
      { path: '/worker/dashboard', label: t('overview', 'Dashboard'), icon: '📊' },
      { path: '/worker/jobs', label: t('activeJobs', 'Active Jobs'), icon: '⚡' },
      { path: '/worker/earnings', label: t('fairWageLedger', 'Wage Ledger'), icon: '💰' },
      { path: '/worker/complaints', label: t('raiseComplaint', 'Raise Complaint'), icon: '⚖️' },
      { path: '/worker/learning', label: t('learningUpskilling', 'Learning & Upskilling'), icon: '🎓' },
      { path: '/worker/profile', label: t('skillProfile', 'Skill Profile'), icon: '👤' },
      { path: '/worker/welfare', label: t('welfareInsurance', 'Welfare & Insurance'), icon: '🛡️' },
      { path: '/worker/help', label: t('helpManual', 'Help / Manual'), icon: '📖' },
    ],
    household: [
      { path: '/household/dashboard', label: t('dashboard', 'Dashboard'), icon: '📊' },
      { path: '/household/book', label: t('bookService', 'Book Service'), icon: '✨' },
      { path: '/household/bookings', label: t('myBookings', 'My Bookings'), icon: '📋' },
      { path: '/household/invoices', label: t('digitalInvoices', 'Digital Invoices'), icon: '🧾' },
      { path: '/household/help', label: t('helpManual', 'Help / Manual'), icon: '📖' },
    ],
    cooperative: [
      { path: '/cooperative/dashboard', label: t('federationOverview', 'Dashboard'), icon: '📊' },
      { path: '/cooperative/workers', label: t('workerVerification', 'Worker Registry'), icon: '👥' },
      { path: '/cooperative/dispatch', label: t('geoDispatch', 'Geo-Dispatch'), icon: '📍' },
      { path: '/cooperative/financials', label: t('financialsAnomalies', 'Financials & Audit'), icon: '🔍' },
      { path: '/cooperative/demand-forecast', label: t('demandPlanning', 'AI Forecasting'), icon: '📈' },
      { path: '/cooperative/help', label: t('helpManual', 'Help / Manual'), icon: '📖' },
    ],
    officer: [
      { path: '/officer/dashboard', label: t('adjudicationQueue', 'Adjudication Queue'), icon: '🏛️' },
      { path: '/officer/cases', label: t('disputeRegistry', 'Dispute Registry'), icon: '🗂️' },
      { path: '/officer/help', label: t('helpManual', 'Help / Manual'), icon: '📖' },
    ],
    labor_officer: [
      { path: '/officer/dashboard', label: t('adjudicationQueue', 'Adjudication Queue'), icon: '🏛️' },
      { path: '/officer/cases', label: t('disputeRegistry', 'Dispute Registry'), icon: '🗂️' },
      { path: '/officer/help', label: t('helpManual', 'Help / Manual'), icon: '📖' },
    ],
    labor: [
      { path: '/officer/dashboard', label: t('adjudicationQueue', 'Adjudication Queue'), icon: '🏛️' },
      { path: '/officer/cases', label: t('disputeRegistry', 'Dispute Registry'), icon: '🗂️' },
      { path: '/officer/help', label: t('helpManual', 'Help / Manual'), icon: '📖' },
    ],
    manager: [
      { path: '/manager/dashboard', label: t('zonalDashboard', 'Zonal Dashboard'), icon: '👔' },
      { path: '/manager/workers', label: t('teamRoster', 'Team Roster'), icon: '👥' },
      { path: '/manager/reports', label: t('financialReports', 'Financial Reports'), icon: '📑' },
      { path: '/manager/help', label: t('helpManual', 'Help / Manual'), icon: '📖' },
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
        </div>

        {/* Navigation Section */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
          <div>
            <div className="px-3 text-xs font-extrabold tracking-wider uppercase text-slate-400 mb-2">
              {t('mainMenu', 'MAIN MENU')}
            </div>
            <nav className="space-y-1.5">
              {items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-selected={isActive ? 'true' : undefined}
                    aria-selected={isActive ? 'true' : undefined}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden group ${
                      isActive
                        ? 'sidebar-link-active'
                        : isDark
                        ? 'sidebar-link-inactive text-slate-200'
                        : 'sidebar-link-inactive text-slate-700'
                    }`}
                  >
                    <span className={`text-base transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_#ffffff]"></span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Rapid Response SOS Trigger */}
          <div>
            <div className="px-3 text-xs font-extrabold tracking-wider uppercase text-slate-400 mb-2">
              {t('rapidResponse', 'RAPID RESPONSE')}
            </div>
            <button
              type="button"
              onClick={() => setShowEmergency(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all sidebar-sos-btn neon-pulse-rose cursor-pointer bg-[#181d26] border border-rose-500/60 text-rose-300"
            >
              <span className="animate-pulse text-base">🚨</span>
              <span className="truncate">{t('emergencySosButton', '30-Min Emergency SOS')}</span>
            </button>
          </div>

          {/* FlowBoard Welfare / Pro Banner Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#181d26] to-[#12151c] border border-white/[0.08] space-y-2 glow-orange-hover">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span>🚀</span>
              <span>{t('cooperativeWelfare', 'Cooperative Welfare')}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('welfareCardSub', '100% fair wages with social security fund coverage.')}
            </p>
            <Link
              to={role === 'worker' ? '/worker/welfare' : '/cooperative/financials'}
              className="w-full text-center py-2 font-bold text-xs rounded-lg shadow-md transition-all sidebar-welfare-btn flow-btn-primary flex items-center justify-center gap-1.5"
            >
              <span>{t('viewProtectionPlan', 'View Protection Plan')}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar with touch-friendly buttons & readable text */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-2 flex justify-around items-center backdrop-blur-xl border-t transition-colors ${
          isDark ? 'bg-[#0f1217]/95 border-white/[0.08] text-white' : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        {items.slice(0, 3).map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-xs transition-all min-h-[46px] justify-center ${
                isActive ? 'mobile-nav-link-active font-black scale-105' : 'mobile-nav-link-inactive text-slate-300'
              }`}
            >
              <span className="text-xl leading-tight">{item.icon}</span>
              <span className="truncate max-w-[78px] mt-0.5 font-bold">{item.label}</span>
            </Link>
          )
        })}

        {/* Emergency SOS Button */}
        <button
          type="button"
          onClick={() => setShowEmergency(true)}
          className="flex flex-col items-center py-1 px-2.5 text-rose-400 text-xs font-black min-h-[46px] justify-center hover:scale-105 transition-transform cursor-pointer"
        >
          <span className="text-xl leading-tight animate-pulse">🚨</span>
          <span className="mt-0.5">SOS</span>
        </button>

        {/* Mobile Full Menu / Drawer Trigger */}
        <button
          type="button"
          onClick={() => setShowMobileDrawer(true)}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-xs font-bold min-h-[46px] justify-center transition-all cursor-pointer ${
            showMobileDrawer ? 'text-[#ff7a00] mobile-nav-link-active' : 'text-slate-300 hover:text-white hover:scale-105'
          }`}
        >
          <span className="text-xl leading-tight">☰</span>
          <span className="truncate max-w-[78px] mt-0.5 font-bold">{t('menu', 'Menu')}</span>
        </button>
      </div>

      {/* Mobile Drawer Navigation Popout */}
      {showMobileDrawer && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-fade-in-up">
          <div className={`p-6 rounded-t-3xl border-t space-y-4 max-h-[85vh] overflow-y-auto ${
            isDark ? 'bg-[#0f1217] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff5500] to-[#ff8c00] text-white flex items-center justify-center font-black text-sm shadow-md">
                  ⚡
                </span>
                <span className="font-black text-base">SahakarConnect</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* User Quick Info */}
            <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff6b00] to-[#ffaa00] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black truncate">{profile?.full_name}</div>
                <div className="text-[10px] text-slate-400 truncate">{profile?.email}</div>
              </div>
            </div>

            {/* All Portal Navigation Links */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-1 mb-1">
                {t('allPages', 'ALL PAGES')}
              </div>
              {items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileDrawer(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'sidebar-link-active'
                        : isDark
                        ? 'sidebar-link-inactive text-slate-200'
                        : 'sidebar-link-inactive text-slate-700'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Emergency SOS Drawer Action */}
            <button
              type="button"
              onClick={() => {
                setShowMobileDrawer(false)
                setShowEmergency(true)
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black sidebar-sos-btn bg-rose-950/80 border border-rose-500/50 text-rose-300 cursor-pointer"
            >
              <span>🚨</span>
              <span>{t('emergencySosButton', '30-Min Emergency SOS')}</span>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => {
                setShowMobileDrawer(false)
                signOut()
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDark ? 'bg-slate-900 border-white/[0.08] text-rose-400 hover:bg-rose-950/60' : 'bg-slate-100 border-slate-200 text-rose-600 hover:bg-rose-50'
              }`}
            >
              <span>🚪</span>
              <span>{t('signOut', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      )}

      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </>
  )
}
