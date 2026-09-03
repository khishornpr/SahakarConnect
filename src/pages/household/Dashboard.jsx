import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'
import { POPULAR_SERVICES, TRADE_GROUPS } from '../../lib/serviceCategories'


export default function HouseholdDashboard() {
  const { user, profile } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [activeBookings, setActiveBookings] = useState([])
  const [pastBookings, setPastBookings] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('All')

  const displayedServices =
    selectedGroup === 'All'
      ? POPULAR_SERVICES
      : POPULAR_SERVICES.filter((s) => s.group === selectedGroup)

  useEffect(() => {
    let ignore = false
    async function loadBookings() {
      if (!user) return
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('household_id', user.id)
        .order('created_at', { ascending: false })

      const list = data || []
      if (!ignore) {
        setActiveBookings(list.filter((j) => ['requested', 'assigned', 'in_progress'].includes(j.status)))
        setPastBookings(list.filter((j) => j.status === 'completed'))
      }
    }
    loadBookings()
    return () => {
      ignore = true
    }
  }, [user])

  return (
    <div className="space-y-6">
      {/* FlowBoard Welcome Banner */}
      <div
        className={`p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden transition-all glow-orange-hover border ${
          isDark
            ? 'bg-gradient-to-r from-[#141822] via-[#10131a] to-[#141822] border-white/[0.08] text-white shadow-xl'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="relative z-10 space-y-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isDark
                ? 'bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-[#ff7a00]'
                : 'bg-orange-50 border border-orange-200 text-orange-800'
            }`}
          >
            <span>🏡</span>
            <span>{t('householdPortalBadge', 'Verified Cooperative Household Portal')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('welcome', 'Welcome')}, {profile?.full_name || 'Member'} 👋
          </h1>
          <p className={`text-xs sm:text-sm max-w-xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('householdTagline', 'Book verified cooperative craftspeople with guaranteed fair statutory rates & worker social security.')}
          </p>
        </div>

        <Link
          to="/household/book"
          className="flow-btn-primary px-6 py-3.5 text-xs font-black uppercase tracking-wider self-start md:self-auto flex items-center gap-2 shrink-0 shadow-lg"
        >
          <span>✨ {t('bookService', 'Book Service')}</span>
          <span>→</span>
        </Link>
      </div>

      {/* Quick Service Categories Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('coopServiceCategories', 'Cooperative Service Categories')} ({POPULAR_SERVICES.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('standardTariffSub', 'Standardized Non-Exploitative Hourly Tariffs • 100% Cooperative Direct')}
            </p>
          </div>

          {/* Group Filter Tabs */}
          <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-xl border text-xs ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
            {['All', ...TRADE_GROUPS].map((group) => {
              const isSelected = (selectedGroup || 'All') === group
              const label =
                group === 'All'
                  ? t('allTrades', 'All Trades')
                  : group.includes('Home')
                  ? '🏠 Home Improvement'
                  : group.includes('Repair')
                  ? '🔧 Repair'
                  : group.includes('Cleaning')
                  ? '🧹 Cleaning'
                  : group.includes('Domestic')
                  ? '🍳 Domestic'
                  : group.includes('Care')
                  ? '🩺 Care'
                  : '🌿 Outdoor'
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  aria-selected={isSelected}
                  data-selected={isSelected ? 'true' : undefined}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    isSelected
                      ? 'flow-btn-primary shadow-sm cursor-default'
                      : isDark
                      ? 'text-slate-400 hover:text-white cursor-pointer hover:scale-105'
                      : 'text-slate-600 hover:text-slate-900 cursor-pointer hover:scale-105'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {displayedServices.map((s) => (
            <Link
              key={s.trade}
              to={`/household/book?trade=${encodeURIComponent(s.trade)}`}
              className={`p-4 rounded-2xl text-center group flex flex-col items-center justify-between transition-all duration-300 border glow-orange-hover ${
                isDark
                  ? 'bg-[#12151b] border-white/[0.08] text-white hover:border-[#ff6b00] shadow-md'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-[#ff6b00] shadow-sm'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all border ${
                  isDark
                    ? 'bg-[#181d26] border-white/[0.08] text-[#ff7a00] group-hover:border-[#ff6b00]'
                    : 'bg-orange-50 border-orange-100 text-[#ff7a00]'
                }`}
              >
                {s.icon}
              </div>
              <div className="mt-3 w-full">
                <div
                  className={`text-xs font-bold truncate group-hover:text-[#ff7a00] transition-colors ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                  title={s.trade}
                >
                  {t(s.trade, s.trade)}
                </div>
                <div
                  className={`text-[10px] font-mono font-bold mt-1 px-2.5 py-0.5 rounded-lg border ${
                    isDark
                      ? 'bg-black/50 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {s.rate}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Service Requests vs Past Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Bookings Pane */}
        <div className="flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Active Service Bookings ({activeBookings.length})
            </h2>
            <Link to="/household/bookings" className="text-xs text-[#ff7a00] hover:underline font-bold">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl text-xs space-y-2 border transition-all hover:border-[#ff6b00] ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.06] text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.title}</span>
                    <p className="text-[#ff7a00] text-[11px] mt-0.5 font-bold">
                      {t(b.trade_category, b.trade_category)} • {b.scheduled_time_slot}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#ff6b00]/20 text-[#ff7a00] border border-[#ff6b00]/40 uppercase">
                    {b.status}
                  </span>
                </div>
                <div className={`flex justify-between items-center pt-2 border-t ${isDark ? 'border-white/[0.06] text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                  <span>{t('assignedWorker', 'Assigned Worker')}: <strong className="text-emerald-400 font-bold">{b.worker?.full_name || t('matchingNearestWorker', 'Matching nearest worker...')}</strong></span>
                  <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{b.estimated_amount}</span>
                </div>
              </div>
            ))}
            {activeBookings.length === 0 && (
              <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-[#161a22]/50 border-white/[0.04] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <p className="text-xs font-semibold">{t('noActiveBookings', 'No active bookings right now.')}</p>
                <Link to="/household/book" className="text-xs text-[#ff7a00] font-bold mt-1 inline-flex items-center gap-1">
                  <span>+ {t('scheduleCoopWorker', 'Schedule a cooperative worker')}</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Completed Services */}
        <div className="flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Completed Services & Digital Invoices
            </h2>
            <Link to="/household/invoices" className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1">
              <span>{t('invoices', 'Invoices')}</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {pastBookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl text-xs space-y-2 border transition-all hover:border-[#ff6b00] ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.06] text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.title}</span>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completed by {b.worker?.full_name || 'Cooperative Member'}</p>
                  </div>
                  <span className="status-pill-emerald">
                    ✓ COMPLETED
                  </span>
                </div>
                <div className={`flex justify-between items-center pt-2 border-t ${isDark ? 'border-white/[0.06] text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                  <span>Total Billed: <strong className={isDark ? 'text-white' : 'text-slate-900'}>₹{b.final_amount || b.estimated_amount}</strong></span>
                  <Link to="/household/invoices" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
                    <span>Download Invoice 📄</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
            {pastBookings.length === 0 && (
              <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-[#161a22]/50 border-white/[0.04] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                No completed bookings yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
