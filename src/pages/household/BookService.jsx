import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { DELHI_NCR_AREAS, getAreaCoordinates } from '../../lib/geoService'
import { rankWorkersForJob } from '../../lib/matchingEngine'
import { TRADES_TARIFF, TRADE_GROUPS } from '../../lib/serviceCategories'

export const ARRIVAL_BUFFER_MINUTES = 15

export const BASE_SLOT_STARTS = [
  { id: 'morning', period: 'Morning', startHour: 9, startMinute: 0 },
  { id: 'midday', period: 'Midday', startHour: 11, startMinute: 30 },
  { id: 'afternoon', period: 'Afternoon', startHour: 14, startMinute: 0 },
  { id: 'evening', period: 'Evening', startHour: 16, startMinute: 30 },
  { id: 'night', period: 'Night', startHour: 19, startMinute: 0 },
]

export function formatTime(hours, minutes) {
  const h = hours % 24
  const m = minutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  const paddedHour = String(displayHour).padStart(2, '0')
  const paddedMin = String(m).padStart(2, '0')
  return `${paddedHour}:${paddedMin} ${period}`
}

export function calculateEndTime(startHour, startMinute, durationHours) {
  const durationMinutes = Math.round(parseFloat(durationHours) * 60)
  // Include 15 minutes arrival buffer window
  const totalMinutes = startHour * 60 + startMinute + durationMinutes + ARRIVAL_BUFFER_MINUTES
  const endHour = Math.floor(totalMinutes / 60)
  const endMinute = totalMinutes % 60
  return {
    endHour,
    endMinute,
    formatted: formatTime(endHour, endMinute),
  }
}

export function getSlotGapLabel(durationHours) {
  const duration = parseFloat(durationHours || 2.0)
  const totalMinutes = Math.round(duration * 60) + ARRIVAL_BUFFER_MINUTES
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (m === 0) return `${h} hours gap`
  if (h === 0) return `${m} min gap`
  return `${h} hours ${m} min gap`
}

export function generateDynamicSlots(durationHours) {
  const duration = parseFloat(durationHours || 2.0)
  const gapLabel = getSlotGapLabel(duration)

  // Full day shifts (8 hours + 15 min arrival)
  if (duration >= 7.5) {
    return [
      {
        id: 'shift-1',
        period: 'Morning Shift',
        startHour: 9,
        startMinute: 0,
        value: `${formatTime(9, 0)} - ${calculateEndTime(9, 0, duration).formatted}`,
        label: `${formatTime(9, 0)} - ${calculateEndTime(9, 0, duration).formatted} (8h + 15m arrival: ${gapLabel})`,
      },
      {
        id: 'shift-2',
        period: 'General Shift',
        startHour: 10,
        startMinute: 0,
        value: `${formatTime(10, 0)} - ${calculateEndTime(10, 0, duration).formatted}`,
        label: `${formatTime(10, 0)} - ${calculateEndTime(10, 0, duration).formatted} (8h + 15m arrival: ${gapLabel})`,
      },
      {
        id: 'shift-3',
        period: 'Afternoon Shift',
        startHour: 12,
        startMinute: 0,
        value: `${formatTime(12, 0)} - ${calculateEndTime(12, 0, duration).formatted}`,
        label: `${formatTime(12, 0)} - ${calculateEndTime(12, 0, duration).formatted} (8h + 15m arrival: ${gapLabel})`,
      },
    ]
  }

  // Standard duration (1.5, 2.0, 3.0, 4.0 hrs etc. + 15 min arrival)
  return BASE_SLOT_STARTS.map((base) => {
    const startStr = formatTime(base.startHour, base.startMinute)
    const { formatted: endStr } = calculateEndTime(base.startHour, base.startMinute, duration)
    const slotValue = `${startStr} - ${endStr}`

    return {
      id: base.id,
      period: base.period,
      startHour: base.startHour,
      startMinute: base.startMinute,
      value: slotValue,
      label: `${slotValue} (${duration}h + 15m arrival: ${gapLabel})`,
    }
  })
}

export function getTodayDateString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getTomorrowDateString() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const y = tomorrow.getFullYear()
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const d = String(tomorrow.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSlotAvailable(slot, dateStr) {
  const todayStr = getTodayDateString()
  if (dateStr > todayStr) return true
  if (dateStr < todayStr) return false

  // Selected date is TODAY: compare slot start time with current local time
  const now = new Date()
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes()
  const slotStartTotalMinutes = slot.startHour * 60 + slot.startMinute

  // Only upcoming slots whose start time is in the future are permitted
  return slotStartTotalMinutes > currentTotalMinutes
}

export default function HouseholdBookService() {
  const [searchParams] = useSearchParams()
  const defaultTrade = searchParams.get('trade') || 'Electrician'

  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const formRef = useRef(null)
  const detailsInputRef = useRef(null)

  const [trade, setTrade] = useState(defaultTrade)
  const [tradeGroupFilter, setTradeGroupFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState(DELHI_NCR_AREAS[0].name)
  const [address, setAddress] = useState('B-42, South Extension Part 2, New Delhi')
  const [estimatedHours, setEstimatedHours] = useState('2.0')

  // Dynamic slots based on estimated work duration + 15 min arrival buffer
  const dynamicSlots = generateDynamicSlots(estimatedHours)

  // Initialize with today or tomorrow based on availability
  const todayStr = getTodayDateString()
  const todayAvailableSlots = dynamicSlots.filter((s) => isSlotAvailable(s, todayStr))
  const initialDate = todayAvailableSlots.length > 0 ? todayStr : getTomorrowDateString()
  const initialSlot =
    todayAvailableSlots.length > 0 ? todayAvailableSlots[0].value : dynamicSlots[0].value

  const [scheduledDate, setScheduledDate] = useState(initialDate)
  const [timeSlot, setTimeSlot] = useState(initialSlot)

  const [rankedWorkers, setRankedWorkers] = useState([])
  const [selectedWorkerId, setSelectedWorkerId] = useState(null)
  const [showScoreModalFor, setShowScoreModalFor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const currentTariff = TRADES_TARIFF.find((tItem) => tItem.trade === trade) || TRADES_TARIFF[0]
  const estimatedTotal = Math.round(parseFloat(estimatedHours || 1.5) * currentTariff.rate)

  const isSelectedDateToday = scheduledDate === getTodayDateString()
  const currentSlots = generateDynamicSlots(estimatedHours)
  const availableSlotsForSelectedDate = currentSlots.filter((s) => isSlotAvailable(s, scheduledDate))
  const hasNoSlotsAvailable = availableSlotsForSelectedDate.length === 0
  const currentSlotGap = getSlotGapLabel(estimatedHours)

  // When estimatedHours or scheduledDate changes, adapt timeSlot to match the new duration + 15m arrival
  useEffect(() => {
    const slots = generateDynamicSlots(estimatedHours)
    const today = getTodayDateString()

    if (scheduledDate < today) {
      const todaySlots = slots.filter((s) => isSlotAvailable(s, today))
      if (todaySlots.length > 0) {
        setScheduledDate(today)
        setTimeSlot(todaySlots[0].value)
      } else {
        setScheduledDate(getTomorrowDateString())
        setTimeSlot(slots[0].value)
      }
      return
    }

    // Check if the current timeSlot is valid for the new duration and date
    const matchingSlot = slots.find((s) => s.value === timeSlot)
    const available = slots.filter((s) => isSlotAvailable(s, scheduledDate))

    if (!matchingSlot || !isSlotAvailable(matchingSlot, scheduledDate)) {
      if (available.length > 0) {
        setTimeSlot(available[0].value)
      } else if (slots.length > 0) {
        setTimeSlot(slots[0].value)
      }
    }
  }, [estimatedHours, scheduledDate])

  useEffect(() => {
    let ignore = false
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

      if (!ignore) {
        setRankedWorkers(ranked)
        if (ranked.length > 0) {
          setSelectedWorkerId(ranked[0].user_id)
        } else {
          setSelectedWorkerId(null)
        }
        setLoading(false)
      }
    }
    loadWorkersAndMatch()
    return () => {
      ignore = true
    }
  }, [trade, area])

  function handleSelectTrade(selectedTrade) {
    setTrade(selectedTrade)
    setTitle(`${selectedTrade} Service Request`)

    // Smooth scroll to the service requirements form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Auto-focus the service detail input with blinking cursor ready to type immediately
    setTimeout(() => {
      if (detailsInputRef.current) {
        detailsInputRef.current.focus()
        const textLen = detailsInputRef.current.value.length
        detailsInputRef.current.setSelectionRange(0, textLen)
      }
    }, 250)
  }

  const filteredTrades = TRADES_TARIFF.filter((tItem) => {
    const matchesGroup = tradeGroupFilter === 'All' || tItem.group === tradeGroupFilter
    if (!matchesGroup) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const tradeName = (t(tItem.trade, tItem.trade) || tItem.trade).toLowerCase()
    const desc = (t(tItem.descKey, tItem.descKey) || tItem.descKey || '').toLowerCase()
    const group = tItem.group.toLowerCase()
    return tradeName.includes(q) || desc.includes(q) || group.includes(q)
  })

  async function handleBookService(e) {
    e.preventDefault()

    const today = getTodayDateString()
    if (scheduledDate < today) {
      alert('Cannot book past dates. Please select today or a future date.')
      return
    }

    const slots = generateDynamicSlots(estimatedHours)
    const selectedSlotConfig = slots.find((s) => s.value === timeSlot)
    if (!selectedSlotConfig || !isSlotAvailable(selectedSlotConfig, scheduledDate)) {
      alert('The selected time slot is in the past or unavailable. Please choose an upcoming time slot or future date.')
      return
    }

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
          <span>{t('bookServiceBadge', 'Guaranteed Fair Rates • Quick Matching')}</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('bookServiceHeading', 'Book a Service')}
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {t('bookServiceSubheading', 'Standard hourly rates • 100% verified skilled workers')}
        </p>
      </div>

      {/* Trade Category Selector Cards */}
      <div className="space-y-3.5">
        <div className="flex flex-col gap-3">
          {/* Top Search Filter and Trade Count */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 min-w-[260px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchTradesPlaceholder', 'Search trades (e.g. Electrician, Painting, Wall work, Cleaning...)')}
                className={`w-full pl-9 pr-8 py-2.5 border rounded-xl text-xs outline-none transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00] shadow-inner'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00] shadow-sm'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs font-black uppercase tracking-wider text-slate-400 self-center sm:self-auto shrink-0">
              {filteredTrades.length} / {TRADES_TARIFF.length} {t('tradesCount', 'Trades Available')}
            </div>
          </div>

          {/* Group Filter Tabs with Home Improvement / Renovation Heading */}
          <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border text-xs overflow-x-auto ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
            {['All', ...TRADE_GROUPS].map((group) => {
              const isSelected = tradeGroupFilter === group
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
                  onClick={() => setTradeGroupFilter(group)}
                  aria-selected={isSelected}
                  data-selected={isSelected ? 'true' : undefined}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
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

        {/* Trade Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredTrades.map((tItem) => {
            const isSelected = trade === tItem.trade
            return (
              <button
                key={tItem.trade}
                type="button"
                onClick={() => handleSelectTrade(tItem.trade)}
                aria-selected={isSelected}
                data-selected={isSelected ? 'true' : undefined}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#ff6b00] bg-[#ff6b00]/10 shadow-[0_0_25px_rgba(255,107,0,0.35)] cursor-default ring-1 ring-[#ff6b00]'
                    : isDark
                    ? 'bg-[#12151b] border-white/[0.08] hover:border-white/20 cursor-pointer hover:scale-105'
                    : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer hover:scale-105'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{tItem.icon}</span>
                  {isSelected && <span className="text-[#ff7a00] font-black text-sm">✓</span>}
                </div>
                <div className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={tItem.trade}>
                  {t(tItem.trade, tItem.trade)}
                </div>
                <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
                  ₹{tItem.rate}/hr
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {tItem.minHoursLabel || `Min ${tItem.minHours} hrs`}
                </div>
              </button>
            )
          })}
          {filteredTrades.length === 0 && (
            <div className={`col-span-full p-8 text-center rounded-2xl border ${isDark ? 'bg-[#12151b] border-white/[0.08] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span className="text-3xl mb-2 block">🔍</span>
              <p className="text-sm font-bold">No matching trades found for &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setTradeGroupFilter('All')
                }}
                className="mt-3 px-4 py-1.5 flow-btn-primary text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Form & Matching Workspace */}
      <div ref={formRef} className="scroll-mt-6">
        <form onSubmit={handleBookService} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Job Details */}
          <div className="lg:col-span-7 flow-card glow-orange-hover p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.06]">
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Service Details & Schedule
              </h2>
              <span className="text-xs font-mono font-bold text-[#ff7a00] bg-[#ff6b00]/15 px-2.5 py-0.5 rounded-lg border border-[#ff6b00]/30">
                {trade}
              </span>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Service Title / Requirement <span className="text-rose-400">*</span>
              </label>
              <input
                ref={detailsInputRef}
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`example: ${trade} needed for home repair`}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-all outline-none focus:ring-2 focus:ring-[#ff6b00]/60 ${
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
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-all outline-none focus:ring-2 focus:ring-[#ff6b00]/60 ${
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

            {/* Date & Dynamic Duration + 15 min Arrival Buffer Slot Scheduling */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Scheduled Date <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {isSelectedDateToday ? '📅 Today' : '📅 Future Date'}
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    min={getTodayDateString()}
                    value={scheduledDate}
                    onChange={(e) => {
                      const val = e.target.value
                      const today = getTodayDateString()
                      if (val < today) {
                        setScheduledDate(today)
                      } else {
                        setScheduledDate(val)
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                      isDark
                        ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Past dates are disabled. Only today & future dates permitted.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Preferred Time Slot <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                      ⏱️ +15m Arrival Included
                    </span>
                  </div>
                  <select
                    value={timeSlot}
                    disabled={hasNoSlotsAvailable}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                      hasNoSlotsAvailable
                        ? 'opacity-50 cursor-not-allowed bg-slate-900 border-white/[0.04] text-slate-500'
                        : isDark
                        ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                    }`}
                  >
                    {currentSlots.map((slot) => {
                      const isAvailable = isSlotAvailable(slot, scheduledDate)
                      return (
                        <option
                          key={slot.value}
                          value={slot.value}
                          disabled={!isAvailable}
                        >
                          {slot.value} {isAvailable ? `(Available • ${currentSlotGap})` : '(Past / Closed)'}
                        </option>
                      )
                    })}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isSelectedDateToday
                      ? `Slots: ${estimatedHours}h work + 15m arrival (${currentSlotGap}). Past slots locked.`
                      : `Dynamic slots for ${estimatedHours}h work + 15m arrival (${currentSlotGap}).`}
                  </p>
                </div>
              </div>

              {/* Visual Interactive Time Slot Badges Computed Dynamically */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-400">
                    Select Time Window ({estimatedHours}h work + 15m arrival = <span className="text-emerald-400 font-bold">{currentSlotGap}</span>):
                  </div>
                  <div className="text-[10px] font-mono text-[#ff7a00] font-bold">
                    Total: ₹{estimatedTotal}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {currentSlots.map((slot) => {
                    const isAvailable = isSlotAvailable(slot, scheduledDate)
                    const isSelected = timeSlot === slot.value && isAvailable

                    return (
                      <button
                        key={slot.value}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setTimeSlot(slot.value)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all relative ${
                          !isAvailable
                            ? 'opacity-40 cursor-not-allowed bg-slate-900/60 border-white/[0.04] text-slate-500 line-through'
                            : isSelected
                            ? 'border-[#ff6b00] bg-[#ff6b00]/15 text-white font-bold shadow-[0_0_15px_rgba(255,107,0,0.25)] ring-1 ring-[#ff6b00]'
                            : isDark
                            ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:border-white/20 cursor-pointer hover:scale-[1.02]'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 cursor-pointer hover:scale-[1.02]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                            {slot.period}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              !isAvailable
                                ? 'bg-rose-950/70 text-rose-400 border border-rose-500/20'
                                : isSelected
                                ? 'bg-[#ff6b00] text-slate-950 font-black'
                                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {!isAvailable ? 'CLOSED' : isSelected ? 'SELECTED' : 'OPEN'}
                          </span>
                        </div>
                        <div className="font-bold text-[11px] truncate text-emerald-400">
                          {slot.value}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {estimatedHours}h work + 15m arrival ({currentSlotGap})
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notification Banner for Closed Same-Day Slots */}
              {isSelectedDateToday && hasNoSlotsAvailable && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>All same-day {currentSlotGap} slots for today have passed or are closed. Earliest available date is tomorrow ({getTomorrowDateString()}).</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScheduledDate(getTomorrowDateString())}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shrink-0 hover:bg-amber-400 cursor-pointer shadow"
                  >
                    Switch to Tomorrow ({getTomorrowDateString()}) →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Dispatch & Cost Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Transparent Cost Breakdown Card */}
            <div className="flow-card glow-emerald-hover p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-white/[0.06]">
                <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Statutory Fair Wage Estimate
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  100% Direct Payout
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Selected Trade Rate:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{currentTariff.rate}/hr ({trade})
                  </span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Estimated Work Duration:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {estimatedHours} Hours
                  </span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Arrival & Setup Buffer:</span>
                  <span className="text-amber-400 font-bold">+15 Minutes (Free Buffer)</span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Scheduled Time Slot Window:</span>
                  <span className="text-emerald-400 font-bold font-mono">{timeSlot}</span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Statutory Co-op Admin Fee:</span>
                  <span className="text-amber-400 font-bold">5% (Included)</span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>Worker Accident Insurance:</span>
                  <span className="text-cyan-400 font-bold">PMSBY Covered</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline">
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Total Estimated Payable:
                  </span>
                  <span className="text-2xl font-black text-emerald-400">₹{estimatedTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || hasNoSlotsAvailable}
                className={`w-full py-3.5 flow-btn-primary font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  hasNoSlotsAvailable ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                {submitting ? (
                  <span>Booking in Progress...</span>
                ) : hasNoSlotsAvailable ? (
                  <span>⚠️ Same-Day Slots Closed — Select Future Date</span>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Confirm Booking & Dispatch Worker</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Geo-Clustered Worker Recommendations */}
            <div className="flow-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-black text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Nearest Verified Workers ({trade})
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Clustered by locality proximity & verified skill badge score
                  </p>
                </div>
                {loading && <span className="text-xs text-[#ff7a00] animate-pulse">Matching...</span>}
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {rankedWorkers.slice(0, 3).map((w, idx) => {
                  const isSelected = selectedWorkerId === w.user_id
                  return (
                    <div
                      key={w.id || w.user_id}
                      onClick={() => setSelectedWorkerId(w.user_id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#ff6b00] bg-[#ff6b00]/10'
                          : isDark
                          ? 'bg-[#161a22] border-white/[0.06] hover:border-white/20'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">
                              {w.profiles?.full_name || `Worker #${idx + 1}`}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.2 text-[9px] font-black rounded bg-emerald-500 text-slate-950">
                                TOP MATCH
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#ff7a00] font-semibold mt-0.5">
                            ★ {w.rating_avg || 4.9} ({w.total_jobs_completed || 12} jobs) • {w.area || area}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowScoreModalFor(w)
                          }}
                          className="text-[10px] text-slate-400 hover:text-[#ff7a00] underline font-bold"
                        >
                          Score Breakdown
                        </button>
                      </div>
                    </div>
                  )
                })}

                {rankedWorkers.length === 0 && !loading && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active verified workers in this specific cluster right now. Booking will broadcast to nearby cooperative pool.
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Match Score Modal */}
      {showScoreModalFor &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`p-6 rounded-2xl max-w-sm w-full space-y-4 border ${isDark ? 'bg-[#12151b] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <h3 className="text-sm font-bold">AI Match Score Breakdown</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Proximity Score:</span>
                  <span className="font-mono text-emerald-400">{showScoreModalFor.proximityScore} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Rating & Feedback Weight:</span>
                  <span className="font-mono text-emerald-400">{showScoreModalFor.ratingScore} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Workload Fairness Factor:</span>
                  <span className="font-mono text-emerald-400">{showScoreModalFor.fairnessScore} pts</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-black">
                  <span>Total Composite Match:</span>
                  <span className="text-[#ff7a00] font-mono">{showScoreModalFor.score} / 100</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreModalFor(null)}
                className="w-full py-2 flow-btn-primary font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
