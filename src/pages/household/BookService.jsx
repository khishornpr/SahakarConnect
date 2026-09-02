import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { DELHI_NCR_AREAS, getAreaCoordinates } from '../../lib/geoService'
import { rankWorkersForJob } from '../../lib/matchingEngine'

const TRADES_TARIFF = [
  { trade: 'Electrician', rate: 350, icon: '⚡', minHours: 1.5 },
  { trade: 'Plumber', rate: 350, icon: '🚰', minHours: 1.5 },
  { trade: 'Carpenter', rate: 400, icon: '🪚', minHours: 2.0 },
  { trade: 'Painter', rate: 380, icon: '🎨', minHours: 3.0 },
  { trade: 'Cleaner', rate: 280, icon: '✨', minHours: 2.5 },
  { trade: 'Domestic Helper', rate: 300, icon: '🧹', minHours: 2.0 },
  { trade: 'Caregiver', rate: 320, icon: '🩺', minHours: 4.0 },
  { trade: 'Appliance Technician', rate: 400, icon: '🔧', minHours: 1.5 },
]

export const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:30 AM - 01:30 PM',
  '02:00 PM - 04:00 PM',
  '04:30 PM - 06:30 PM',
  '07:00 PM - 08:30 PM',
]

export default function HouseholdBookService() {
  const [searchParams] = useSearchParams()
  const defaultTrade = searchParams.get('trade') || 'Electrician'

  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [trade, setTrade] = useState(defaultTrade)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState(DELHI_NCR_AREAS[0].name)
  const [address, setAddress] = useState('B-42, South Extension Part 2, New Delhi')
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0])
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0])
  const [estimatedHours, setEstimatedHours] = useState('2.0')

  const [workers, setWorkers] = useState([])
  const [rankedWorkers, setRankedWorkers] = useState([])
  const [selectedWorkerId, setSelectedWorkerId] = useState(null)
  const [showScoreModalFor, setShowScoreModalFor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const currentTariff = TRADES_TARIFF.find((tItem) => tItem.trade === trade) || TRADES_TARIFF[0]
  const estimatedTotal = Math.round(parseFloat(estimatedHours || 1.5) * currentTariff.rate)

  useEffect(() => {
    loadWorkersAndMatch()
  }, [trade, area])

  async function loadWorkersAndMatch() {
    setLoading(true)
    const { data: workerList } = await supabase.from('workers').select('*, profiles(*)')
    const { data: recentJobs } = await supabase
      .from('jobs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

    const coords = getAreaCoordinates(area)
    const ranked = rankWorkersForJob(
      {
        trade_category: trade,
        area,
        latitude: coords.lat,
        longitude: coords.lng,
      },
      workerList || [],
      recentJobs || []
    )

    setWorkers(workerList || [])
    setRankedWorkers(ranked)
    if (ranked.length > 0) {
      setSelectedWorkerId(ranked[0].user_id)
    } else {
      setSelectedWorkerId(null)
    }
    setLoading(false)
  }

  async function handleBookService(e) {
    e.preventDefault()
    setSubmitting(true)

    const coords = getAreaCoordinates(area)
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString()

    const newJob = {
      household_id: user.id,
      assigned_worker_id: selectedWorkerId,
      title: title || `${trade} Service Request`,
      description: description || `Standard cooperative ${trade.toLowerCase()} service requested by customer.`,
      trade_category: trade,
      status: selectedWorkerId ? 'assigned' : 'requested',
      area,
      address,
      latitude: coords.lat,
      longitude: coords.lng,
      scheduled_date: scheduledDate,
      scheduled_time_slot: timeSlot,
      estimated_hours: parseFloat(estimatedHours || 2.0),
      estimated_amount: estimatedTotal,
      otp_code: otpCode,
    }

    const { error } = await supabase.from('jobs').insert(newJob)
    setSubmitting(false)

    if (error) {
      alert(`Error creating booking: ${error.message}`)
    } else {
      navigate('/household/bookings')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
            isDark ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]' : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}
        >
          <span>✨</span>
          <span>SIH26089 Features 4 & 5 • Guaranteed Cooperative Fair Rates & AI Dispatch</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Book Verified Cooperative Craftsperson
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Guaranteed standard hourly pricing • 5% statutory cooperative reserve • 100% fair artisan compensation
        </p>
      </div>

      {/* Trade Category Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRADES_TARIFF.map((tItem) => {
          const isSelected = trade === tItem.trade
          return (
            <button
              key={tItem.trade}
              type="button"
              onClick={() => setTrade(tItem.trade)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-[#ff6b00] bg-[#ff6b00]/10 shadow-[0_0_25px_rgba(255,107,0,0.35)] scale-[1.02]'
                  : isDark
                  ? 'bg-[#12151b] border-white/[0.08] hover:border-white/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-2xl mb-2 block">{tItem.icon}</span>
                {isSelected && <span className="text-[#ff7a00] font-black text-sm">✓</span>}
              </div>
              <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t(tItem.trade, tItem.trade)}
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
                ₹{tItem.rate}/hr
              </div>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Min {tItem.minHours} hrs
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Form & Matching Workspace */}
      <form onSubmit={handleBookService} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-7 flow-card glow-orange-hover p-6 sm:p-7 space-y-4">
          <h2 className={`text-base font-black border-b pb-3 ${isDark ? 'text-white border-white/[0.06]' : 'text-slate-900 border-slate-100'}`}>
            Service Details & Schedule
          </h2>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Service Title / Requirement
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. ${trade} needed for home repair`}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-all ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Detailed Description / Tools Needed
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, required tools, parts to be replaced..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-all ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Locality / Cluster
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                }`}
              >
                {DELHI_NCR_AREAS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({a.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Estimated Work Hours
              </label>
              <select
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                }`}
              >
                <option value="1.5">1.5 Hours (Quick Fix)</option>
                <option value="2.0">2.0 Hours (Standard)</option>
                <option value="3.0">3.0 Hours (Comprehensive)</option>
                <option value="4.0">4.0 Hours (Half Day)</option>
                <option value="8.0">8.0 Hours (Full Day)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Complete Service Address & Landmark
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat No., Tower, Street, Landmark"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-all ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Scheduled Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Preferred Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                }`}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: AI Artisan Matching & Live Bill Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Matched Artisan Picker */}
          <div className="flow-card glow-orange-hover p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  AI Matched Artisans ({rankedWorkers.length})
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Multi-factor Fair-Rotation Ranking
                </p>
              </div>
              <span className="status-pill-emerald">Live Match</span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {rankedWorkers.map((w, idx) => {
                const isSelected = selectedWorkerId === w.user_id
                return (
                  <div
                    key={w.user_id}
                    onClick={() => setSelectedWorkerId(w.user_id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ff6b00] bg-[#ff6b00]/10 shadow-[0_0_15px_rgba(255,107,0,0.25)]'
                        : isDark
                        ? 'bg-[#161a22] border-white/[0.06] hover:border-white/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff6b00] to-[#ffaa00] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {w.profiles?.full_name || 'Artisan Member'}
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            📍 {w.distanceKm} km away • ★ {w.rating || '5.0'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowScoreModalFor(w)
                        }}
                        className="text-[10px] text-[#ff7a00] hover:underline font-bold"
                      >
                        Match Breakdown ℹ️
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] text-[10px]">
                      <span className="text-emerald-400 font-bold">Fair Allocation Score: {w.matchScore} pts</span>
                      <span className="text-slate-400">{w.jobsInLastWeek} jobs this wk</span>
                    </div>
                  </div>
                )
              })}
              {rankedWorkers.length === 0 && !loading && (
                <div className={`p-6 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No craftsperson in this cluster currently. Broadcast request to regional co-op queue.
                </div>
              )}
            </div>
          </div>

          {/* Transparent Tariff & Cooperative Fund Summary */}
          <div className="flow-card glow-emerald-hover p-6 space-y-4">
            <h3 className={`text-base font-black border-b pb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Transparent Fair Billing Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Artisan Base Tariff ({estimatedHours} hrs @ ₹{currentTariff.rate}/hr):</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{estimatedTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Direct Artisan Take-Home (95%):</span>
                <span>₹{(estimatedTotal * 0.95 - 10).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Cooperative Operational Reserve (5%):</span>
                <span>₹{(estimatedTotal * 0.05).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-cyan-400 font-semibold">
                <span>Artisan Social Security & Welfare Fund:</span>
                <span>₹10.00</span>
              </div>
              <div className={`flex justify-between items-center pt-3 border-t text-sm font-black ${isDark ? 'border-white/[0.08] text-white' : 'border-slate-200 text-slate-900'}`}>
                <span>Total Estimated Payable:</span>
                <span className="text-2xl text-emerald-400 font-black">₹{estimatedTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 flow-btn-primary text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? 'Generating Booking...' : '✓ Confirm & Dispatch Cooperative Artisan'}
            </button>
          </div>
        </div>
      </form>

      {/* Match Breakdown Modal */}
      {showScoreModalFor &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div
              className={`rounded-2xl max-w-md w-full p-6 space-y-4 border ${
                isDark ? 'bg-[#12151b] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="text-base font-black">AI Fair-Allocation Breakdown</h3>
                  <p className="text-xs text-slate-400">{showScoreModalFor.profiles?.full_name}</p>
                </div>
                <button onClick={() => setShowScoreModalFor(null)} className="font-bold text-sm">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 space-y-1">
                  <div className="font-bold text-[#ff7a00]">Total Match Score: {showScoreModalFor.matchScore} / 100 pts</div>
                  <p className="text-[11px] text-slate-300">
                    Calculated using geo-proximity, verified skill rating, and weekly job-rotation equity.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>📍 Proximity ({showScoreModalFor.distanceKm} km):</span>
                    <strong className="text-emerald-400">+{showScoreModalFor.proximityScore || 35} pts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>★ Quality Rating ({showScoreModalFor.rating || '5.0'} / 5.0):</span>
                    <strong className="text-yellow-400">+{showScoreModalFor.ratingScore || 30} pts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>⚖️ Fair Work Rotation Equity:</span>
                    <strong className="text-cyan-400">+{showScoreModalFor.rotationScore || 25} pts</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowScoreModalFor(null)}
                className="w-full py-2.5 flow-btn-primary text-xs font-bold rounded-xl"
              >
                Close Breakdown
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
