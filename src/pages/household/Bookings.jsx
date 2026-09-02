import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'
import RatingModal from '../../components/RatingModal'
import PaymentModal from '../../components/PaymentModal'

export default function HouseholdBookings() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [ratingModalJob, setRatingModalJob] = useState(null)
  const [paymentModalJob, setPaymentModalJob] = useState(null)

  useEffect(() => {
    if (user) loadBookings()
  }, [user])

  async function loadBookings() {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('household_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(data || [])
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'active') return ['requested', 'assigned', 'in_progress'].includes(b.status)
    if (activeTab === 'completed') return b.status === 'completed'
    return true
  })

  const getStepIndex = (status) => {
    switch (status) {
      case 'requested':
        return 1
      case 'assigned':
        return 2
      case 'in_progress':
        return 3
      case 'completed':
        return 4
      default:
        return 1
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'requested':
        return t('requested', 'Requested')
      case 'assigned':
        return t('assigned', 'Assigned')
      case 'in_progress':
        return t('inProgress', 'In Progress')
      case 'completed':
        return t('completed', 'Completed')
      case 'cancelled':
        return t('cancelled', 'Cancelled')
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]' : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}
          >
            <span>⭐</span>
            <span>{t('bookingsBannerBadge', 'SIH26089 Features 5 & 6 • Lifecycle Tracking & Digital Settlement')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('serviceBookingsHeading', 'Service Bookings & Live Tracking')}
          </h1>
          <p className={`text-xs mt-1 max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('serviceBookingsSubheading', 'Monitor real-time lifecycle progression of your household service requests')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex p-1 rounded-xl border text-xs ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
            {[
              { id: 'all', label: t('all', 'All') },
              { id: 'active', label: t('active', 'Active') },
              { id: 'completed', label: t('completed', 'Completed') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-lg capitalize font-bold transition-all ${
                  activeTab === tab.id
                    ? 'flow-btn-primary'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            to="/household/book"
            className="flow-btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all self-start sm:self-auto"
          >
            {t('bookServiceBtn', '+ Book Service')}
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((b) => {
          const step = getStepIndex(b.status)
          return (
            <div
              key={b.id}
              className="flow-card glow-orange-hover p-6 space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.title}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/20 text-[#ff7a00] border border-[#ff6b00]/40 uppercase">
                      {getStatusLabel(b.status)}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t(b.trade_category, b.trade_category)} • {b.address}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {t('tariffAmountLabel', 'Tariff Amount')}
                  </span>
                  <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{b.final_amount || b.estimated_amount}
                  </span>
                </div>
              </div>

              {/* Progress Stepper with Rich Neon Glow */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                  {[
                    { idx: 1, label: t('stepRequested', '1. Requested') },
                    { idx: 2, label: t('stepAssigned', '2. Artisan Assigned') },
                    { idx: 3, label: t('stepInProgress', '3. In Progress') },
                    { idx: 4, label: t('stepCompleted', '4. Completed') },
                  ].map((s) => {
                    const isDone = step >= s.idx
                    const isCurrent = step === s.idx
                    return (
                      <div key={s.idx} className="space-y-1.5">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isDone
                              ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff9900] shadow-[0_0_12px_rgba(255,107,0,0.6)]'
                              : isDark
                              ? 'bg-slate-800'
                              : 'bg-slate-200'
                          }`}
                        ></div>
                        <span
                          className={`block truncate ${
                            isCurrent
                              ? 'text-[#ff7a00] font-black'
                              : isDone
                              ? isDark
                                ? 'text-slate-200'
                                : 'text-slate-800'
                              : 'text-slate-500'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* OTP Banner (If assigned / in_progress) */}
              {['assigned', 'in_progress'].includes(b.status) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#ff6b00]/15 via-[#ff6b00]/10 to-transparent border border-[#ff6b00]/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#ff7a00] flex items-center gap-1.5">
                      <span>🔐</span>
                      <span>Customer Verification OTP</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Share this 4-digit security code with the artisan only after the task is completed satisfactorily.
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-[#ff6b00] text-white font-mono font-black text-xl tracking-widest text-center shadow-[0_0_15px_rgba(255,107,0,0.5)] shrink-0">
                    {b.otp_code || '4829'}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-xs ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Scheduled: <strong>{b.scheduled_date} ({b.scheduled_time_slot})</strong>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'completed' && (
                    <>
                      <button
                        onClick={() => setRatingModalJob(b)}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1 ${
                          isDark
                            ? 'bg-[#1c222d] border-amber-500/40 text-amber-300 hover:bg-[#252d3c]'
                            : 'bg-amber-50 border-amber-300 text-amber-900'
                        }`}
                      >
                        ★ Rate Artisan
                      </button>
                      <button
                        onClick={() => setPaymentModalJob(b)}
                        className="px-3.5 py-1.5 flow-btn-emerald text-xs font-bold rounded-xl shadow-sm flex items-center gap-1"
                      >
                        <span>💳</span>
                        <span>Pay UPI/Card</span>
                      </button>
                      <Link
                        to="/household/invoices"
                        className="px-3.5 py-1.5 flow-btn-primary font-bold rounded-xl shadow-sm flex items-center gap-1"
                      >
                        <span>📄</span>
                        <span>Invoice</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredBookings.length === 0 && (
          <div className="flow-card p-12 text-center text-slate-500 text-xs">
            No bookings in this filter category.
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModalJob && (
        <RatingModal
          job={ratingModalJob}
          currentUserRole="household"
          currentUserId={user.id}
          targetUser={{ full_name: ratingModalJob.worker?.full_name || 'Cooperative Artisan' }}
          onClose={() => setRatingModalJob(null)}
          onRatingSubmitted={() => loadBookings()}
        />
      )}

      {/* Payment Modal */}
      {paymentModalJob && (
        <PaymentModal
          job={paymentModalJob}
          onClose={() => setPaymentModalJob(null)}
          onPaymentSuccess={() => {
            setPaymentModalJob(null)
            loadBookings()
          }}
        />
      )}
    </div>
  )
}
