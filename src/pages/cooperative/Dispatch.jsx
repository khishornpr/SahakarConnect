import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

export default function CooperativeDispatch() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [jobs, setJobs] = useState([])
  const [workers, setWorkers] = useState([])
  const [selectedTrade, setSelectedTrade] = useState('all')

  useEffect(() => {
    loadDispatchBoard()
  }, [])

  async function loadDispatchBoard() {
    const { data: jobList } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    const { data: workerList } = await supabase.from('workers').select('*, profiles(*)')
    setJobs(jobList || [])
    setWorkers(workerList || [])
  }

  const filteredJobs = jobs.filter((j) => {
    if (selectedTrade !== 'all' && j.trade_category !== selectedTrade) return false
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
          <option value="Electrician">{t('Electrician', 'Electrician')}</option>
          <option value="Plumber">{t('Plumber', 'Plumber')}</option>
          <option value="Carpenter">{t('Carpenter', 'Carpenter')}</option>
          <option value="Painter">{t('Painter', 'Painter')}</option>
          <option value="Cleaner">{t('Cleaner', 'Cleaner')}</option>
          <option value="Domestic Helper">{t('Domestic Helper', 'Domestic Helper')}</option>
          <option value="Caregiver">{t('Caregiver', 'Caregiver')}</option>
          <option value="Appliance Technician">{t('Appliance Technician', 'Appliance Technician')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="flow-card glow-orange-hover p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black uppercase text-[#ff7a00] tracking-wide">
                  {t(job.trade_category, job.trade_category)}
                </span>
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
                  <span>{job.scheduled_date} • {job.scheduled_time_slot}</span>
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
        ))}
      </div>
    </div>
  )
}
