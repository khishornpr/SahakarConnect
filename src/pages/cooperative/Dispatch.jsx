import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { TRADES_LIST } from '../../lib/serviceCategories'

export default function CooperativeDispatch() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [jobs, setJobs] = useState([])
  const [selectedTrade, setSelectedTrade] = useState('all')

  useEffect(() => {
    let ignore = false
    async function loadDispatchBoard() {
      const { data: jobList } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
      if (!ignore) {
        setJobs(jobList || [])
      }
    }
    loadDispatchBoard()
    return () => {
      ignore = true
    }
  }, [])

  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'requested', 'assigned', 'in_progress', 'completed'

  const filteredJobs = jobs.filter((j) => {
    if (selectedTrade !== 'all' && j.trade_category !== selectedTrade) return false
    if (priorityFilter === 'emergency' && !j.is_emergency && j.priority !== 'EMERGENCY') return false
    if (priorityFilter === 'standard' && (j.is_emergency || j.priority === 'EMERGENCY')) return false
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    return true
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return 'status-pill-blue'
      case 'assigned':
        return 'status-pill-purple'
      case 'in_progress':
        return 'status-pill-orange'
      case 'completed':
        return 'status-pill-emerald'
      case 'cancelled':
        return 'status-pill-rose'
      default:
        return 'status-pill-orange'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'requested':
        return t('requested', 'REQUESTED')
      case 'assigned':
        return t('assigned', 'ASSIGNED')
      case 'in_progress':
        return t('inProgress', 'IN PROGRESS')
      case 'completed':
        return t('completed', 'COMPLETED')
      case 'cancelled':
        return t('cancelled', 'CANCELLED')
      default:
        return status.toUpperCase()
    }
  }

  const emergencyCount = jobs.filter((j) => j.is_emergency || j.priority === 'EMERGENCY').length
  const requestedCount = jobs.filter((j) => j.status === 'requested').length
  const assignedCount = jobs.filter((j) => j.status === 'assigned').length
  const inProgressCount = jobs.filter((j) => j.status === 'in_progress').length
  const completedCount = jobs.filter((j) => j.status === 'completed').length

  const dispatchStatuses = [
    { id: 'all', label: 'All Dispatches', count: jobs.length, badgeClass: 'bg-slate-500/20 text-slate-300' },
    { id: 'requested', label: 'Requested', count: requestedCount, badgeClass: 'bg-blue-500/20 text-blue-300' },
    { id: 'assigned', label: 'Assigned', count: assignedCount, badgeClass: 'bg-purple-500/20 text-purple-300' },
    { id: 'in_progress', label: 'In Progress', count: inProgressCount, badgeClass: 'bg-amber-500/20 text-amber-300' },
    { id: 'completed', label: 'Completed', count: completedCount, badgeClass: 'bg-emerald-500/20 text-emerald-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]' : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}
          >
            <span>📍</span>
            <span>{t('geoDispatch', 'Geo-Dispatch Control')}</span>
          </div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('geoDispatchHeading', 'Geo-Spatial Service Dispatch Monitor')}
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('geoDispatchSub', 'Real-time feed of household requests and matching assignments across Delhi-NCR cooperative clusters')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Toggle */}
          <div className={`flex p-1 rounded-xl border text-xs ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setPriorityFilter('all')}
              aria-selected={priorityFilter === 'all'}
              data-selected={priorityFilter === 'all' ? 'true' : undefined}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                priorityFilter === 'all'
                  ? 'flow-btn-primary cursor-default'
                  : 'text-slate-400 hover:text-white cursor-pointer'
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setPriorityFilter('emergency')}
              aria-selected={priorityFilter === 'emergency'}
              data-selected={priorityFilter === 'emergency' ? 'true' : undefined}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                priorityFilter === 'emergency'
                  ? 'bg-rose-600 text-white shadow-md cursor-default'
                  : 'text-rose-400 hover:text-rose-300 cursor-pointer'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>🚨 SOS ({emergencyCount})</span>
            </button>
          </div>

          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border outline-none transition-all ${
              isDark
                ? 'bg-[#161a22] border-white/[0.08] text-slate-200 focus:border-[#ff6b00]'
                : 'bg-white border-slate-300 text-slate-800 focus:border-[#ff6b00]'
            }`}
          >
            <option value="all">{t('allTradeCategories', 'All Trade Categories')}</option>
            {TRADES_LIST.map((tr) => (
              <option key={tr} value={tr}>
                {t(tr, tr)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DEDICATED STATUS FILTER BOX (4 DISPATCH STATUSES) */}
      <div className={`p-4 rounded-2xl border space-y-2.5 ${
        isDark ? 'bg-[#12151b] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Dispatch Status Filter
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Showing {filteredJobs.length} of {jobs.length} total dispatch tickets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {dispatchStatuses.map((st) => {
            const isSelected = statusFilter === st.id
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                aria-selected={isSelected}
                data-selected={isSelected ? 'true' : undefined}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2 text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#ff6b00] border-[#ff6b00] text-white shadow-md'
                    : isDark
                    ? 'bg-[#161a22] border-white/[0.06] text-slate-300 hover:border-white/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{st.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-black/30 text-white' : st.badgeClass
                }`}>
                  {st.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className={`p-12 sm:p-16 rounded-2xl border text-center flex flex-col items-center justify-center space-y-4 ${
          isDark 
            ? 'bg-[#12151b] border-white/[0.08] text-slate-400 shadow-xl' 
            : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00] shadow-[0_0_20px_rgba(255,107,0,0.15)]">
            📍
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('noDispatchesAvailable', 'No Data Available')}
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('noDispatchesFilterDesc', 'There are currently no active dispatch tickets matching the selected status or trade category filters.')}
            </p>
          </div>
          {(statusFilter !== 'all' || selectedTrade !== 'all' || priorityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all')
                setSelectedTrade('all')
                setPriorityFilter('all')
              }}
              className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#ff6b00] to-[#ff8533] hover:from-[#e05e00] hover:to-[#ff6b00] text-white shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>↺</span>
              <span>{t('resetAllFilters', 'Reset All Filters')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const isEmergency = job.is_emergency || job.priority === 'EMERGENCY'
            return (
              <div
                key={job.id}
                className={`flow-card p-5 space-y-3 flex flex-col justify-between transition-all ${
                  isEmergency
                    ? isDark
                      ? 'border-rose-500/70 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/50'
                      : 'border-rose-300 bg-rose-50/50 shadow-md ring-1 ring-rose-300'
                    : 'glow-orange-hover'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[#ff7a00] tracking-wide">
                        {t(job.trade_category, job.trade_category)}
                      </span>
                      {isEmergency && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
                          <span>🚨</span>
                          <span>EMERGENCY</span>
                        </span>
                      )}
                    </div>
                    <span className={getStatusBadge(job.status)}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {job.title}
                    </h3>
                    <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {job.description}
                    </p>
                  </div>

                  <div className={`text-xs space-y-1 pt-2 border-t ${isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="truncate">{job.address}</span>
                    </div>
                    <div className="font-mono text-[11px] text-cyan-400">
                      Geo: ({job.latitude}, {job.longitude})
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🕒</span>
                      <span className={isEmergency ? 'text-rose-400 font-bold' : ''}>
                        {job.scheduled_date} • {job.scheduled_time_slot}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center pt-3 border-t text-xs ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    {t('assigned', 'Assigned')}:{' '}
                    <strong className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      {job.worker?.full_name || t('unassigned', 'Unassigned')}
                    </strong>
                  </span>
                  <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{job.final_amount || job.estimated_amount}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
