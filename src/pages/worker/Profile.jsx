import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { SERVICE_CATEGORIES, getCategoryByTrade } from '../../lib/serviceCategories'

export function formatExperience(years, months) {
  const y = Math.floor(years || 0)
  const m = months !== undefined && months !== null ? Number(months) : Math.round(((years || 0) % 1) * 12)
  const parts = []
  if (y > 0) parts.push(`${y} ${y === 1 ? 'Year' : 'Years'}`)
  if (m > 0) parts.push(`${m} ${m === 1 ? 'Month' : 'Months'}`)
  if (parts.length === 0) return '0 Months'
  return parts.join(' ')
}

export default function WorkerProfile() {
  const { user, profile } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [workerInfo, setWorkerInfo] = useState(null)
  const [ratingsList, setRatingsList] = useState([])
  const [jobsList, setJobsList] = useState([])
  const [editingTrade, setEditingTrade] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState('')
  const [experienceYears, setExperienceYears] = useState(5)
  const [experienceMonths, setExperienceMonths] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState('')

  useEffect(() => {
    let ignore = false
    async function loadProfile() {
      if (!user) return
      const { data: worker } = await supabase.from('workers').select('*').eq('user_id', user.id).single()
      if (ignore) return
      setWorkerInfo(worker)
      setSelectedTrade(worker?.primary_trade || 'Electrician')
      const rawExp = worker?.experience_years ?? 5
      setExperienceYears(Math.floor(rawExp))
      setExperienceMonths(worker?.experience_months ?? Math.round((rawExp % 1) * 12))

      const { data: ratings } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_user_id', user.id)
        .order('created_at', { ascending: false })
      if (ignore) return
      setRatingsList(ratings || [])

      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_worker_id', user.id)
      if (!ignore) {
        setJobsList(jobs || [])
      }
    }
    loadProfile()
    return () => {
      ignore = true
    }
  }, [user])

  async function handleSaveTrade() {
    if (!user || !selectedTrade) return
    const isTradeChanged =
      selectedTrade !== (workerInfo?.primary_trade || 'Electrician') ||
      Number(experienceYears) !== Math.floor(workerInfo?.experience_years || 5) ||
      Number(experienceMonths) !== Number(workerInfo?.experience_months || 0)
    
    const cat = getCategoryByTrade(selectedTrade)
    const totalExpYears = Number(experienceYears) + (Number(experienceMonths) / 12)
    const updatePayload = {
      primary_trade: selectedTrade,
      experience_years: Number(totalExpYears.toFixed(2)),
      experience_months: Number(experienceMonths) || 0,
      hourly_rate: cat.rate,
      skills: cat.skills,
      is_verified: isTradeChanged ? false : (workerInfo?.is_verified ?? true),
      trade_verification_status: isTradeChanged ? 'pending' : (workerInfo?.trade_verification_status || 'verified'),
    }
    const { error } = await supabase.from('workers').update(updatePayload).eq('user_id', user.id)
    if (!error) {
      setWorkerInfo((prev) => ({ ...prev, ...updatePayload }))
      setEditingTrade(false)
      if (isTradeChanged) {
        setSaveSuccess(`Trade change to "${selectedTrade}" submitted to Admin Dept for verification!`)
      } else {
        setSaveSuccess('Primary trade & experience details updated!')
      }
      setTimeout(() => setSaveSuccess(''), 5000)
    }
  }

  const currentCategory = getCategoryByTrade(workerInfo?.primary_trade || selectedTrade)
  const completedJobs = jobsList.filter((j) => j.status === 'completed')
  const totalWorks = completedJobs.length > 0 ? completedJobs.length : (workerInfo?.completed_jobs_count || 0)
  const currentTradeName = workerInfo?.primary_trade || selectedTrade || 'Electrician'
  
  // Exact count of completed jobs in the active trade
  const currentTradeWorks = completedJobs.filter((j) => {
    const jobTrade = (j.trade_category || j.service_category || j.trade || j.title || '').toLowerCase()
    const target = currentTradeName.toLowerCase()
    return jobTrade.includes(target) || target.includes(jobTrade)
  }).length

  // Calculate prior trades where remaining works were completed
  const otherTradeJobs = completedJobs.filter((j) => {
    const jobTrade = (j.trade_category || j.service_category || j.trade || j.title || '').toLowerCase()
    const target = currentTradeName.toLowerCase()
    return !jobTrade.includes(target) && !target.includes(jobTrade)
  })
  const otherTradesSet = new Set(
    otherTradeJobs.map((j) => j.trade_category || j.service_category || j.trade).filter(Boolean)
  )
  const priorTradeName = otherTradesSet.size > 0
    ? Array.from(otherTradesSet).join(', ')
    : 'Electrician'
  const priorWorksCount = totalWorks - currentTradeWorks
  const isPendingVerification = !workerInfo?.is_verified || workerInfo?.trade_verification_status === 'pending'

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Worker Skill Profile & Certification
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Verified cooperative identity, trade certifications, and household rating reputation
        </p>
      </div>

      <div className="flow-card glow-orange-hover p-6">
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-[#ff7a00] flex items-center justify-center font-bold text-3xl shadow-[0_0_20px_rgba(255,107,0,0.3)]">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.full_name}</h2>
                {isPendingVerification ? (
                  <span className="status-pill-orange flex items-center gap-1.5 animate-pulse font-bold">
                    <span>⏳</span>
                    <span>Verification in Progress</span>
                  </span>
                ) : (
                  <span className="status-pill-emerald flex items-center gap-1 font-bold">
                    <span>✓</span>
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {profile?.email} • {profile?.phone || '+91 98112 34567'}
              </p>
            </div>
          </div>

          {/* Stats Bar with Total Works & Current Trade Total Works */}
          <div className={`flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-3.5 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-right sm:text-left">
              <div className="text-[10px] uppercase font-bold text-slate-500">{t('reputationScore', 'Reputation Score')}</div>
              <div className="text-base font-black text-yellow-400">★ {workerInfo?.rating || '5.0'} / 5.0</div>
            </div>
            <div className={`h-8 w-px ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`}></div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-500">{t('totalWorks', 'Total Works')}</div>
              <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {totalWorks}
              </div>
            </div>
            <div className={`h-8 w-px ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`}></div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 truncate">
                <span>{currentCategory.icon}</span>
                <span className="truncate">{currentTradeName} Works</span>
              </div>
              <div className="text-base font-black text-[#ff7a00]">
                {currentTradeWorks}{' '}
                <span className="text-[10px] font-bold text-slate-400">
                  {currentTradeWorks === 0 && totalWorks > 0
                    ? `(${priorWorksCount} as ${priorTradeName})`
                    : currentTradeWorks < totalWorks
                    ? `(${currentTradeWorks}/${totalWorks} • ${priorWorksCount} as ${priorTradeName})`
                    : `(${currentTradeWorks}/${totalWorks} Works)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#ff7a00] uppercase tracking-wider">Craft & Specializations</h3>
            </div>

            {saveSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                ✓ {saveSuccess}
              </div>
            )}

            {isPendingVerification && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-md">
                <span className="text-lg shrink-0">⏳</span>
                <div>
                  <span className="font-bold block text-amber-300">Verification In Progress</span>
                  <span className="text-[11px] text-amber-200/90 leading-relaxed block mt-0.5">
                    Your craft credentials for <strong>{workerInfo?.primary_trade}</strong> ({formatExperience(workerInfo?.experience_years ?? experienceYears, workerInfo?.experience_months ?? experienceMonths)} exp) have been submitted to the Cooperative Admin Department. Until verified, your status will show <strong>Verification in Progress</strong>. Once approved by Admin, it will automatically update to <strong>Verified</strong>.
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('primaryTrade', 'Primary Trade')}
              </label>
              {editingTrade ? (
                <div className="mt-2 p-3.5 rounded-2xl border bg-gradient-to-b from-transparent to-orange-500/5 space-y-3 border-[#ff6b00]/30 shadow-md">
                  <div>
                    <label className={`text-[11px] font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Select New Primary Trade
                    </label>
                    <select
                      value={selectedTrade}
                      onChange={(e) => setSelectedTrade(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs outline-none font-bold cursor-pointer ${
                        isDark ? 'bg-[#12151c] border-white/[0.1] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                      }`}
                    >
                      {SERVICE_CATEGORIES.map((c) => (
                        <option key={c.trade} value={c.trade}>
                          {c.icon} {t(c.trade, c.trade)} ({c.rateFormatted})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Experience in this Trade
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Years</label>
                        <select
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-xl text-xs outline-none font-bold cursor-pointer ${
                            isDark ? 'bg-[#12151c] border-white/[0.1] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                          }`}
                        >
                          {Array.from({ length: 41 }, (_, i) => (
                            <option key={i} value={i}>
                              {i} {i === 1 ? 'Year' : 'Years'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Months</label>
                        <select
                          value={experienceMonths}
                          onChange={(e) => setExperienceMonths(parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-xl text-xs outline-none font-bold cursor-pointer ${
                            isDark ? 'bg-[#12151c] border-white/[0.1] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                          }`}
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                              {i} {i === 1 ? 'Month' : 'Months'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Save Primary Trade with Cancel on the Right Side */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveTrade}
                      className="px-4 py-2 flow-btn-primary text-xs font-bold rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all"
                    >
                      Save Primary Trade
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrade(workerInfo?.primary_trade || 'Electrician')
                        const rawExp = workerInfo?.experience_years ?? 5
                        setExperienceYears(Math.floor(rawExp))
                        setExperienceMonths(workerInfo?.experience_months ?? Math.round((rawExp % 1) * 12))
                        setEditingTrade(false)
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#161a22] border-white/[0.1] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`text-sm font-bold mt-1 flex items-center justify-between gap-2 p-3 rounded-xl border ${
                  isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <span className="text-base">{currentCategory.icon}</span>
                    <span>{t(workerInfo?.primary_trade || 'Electrician', workerInfo?.primary_trade || 'Electrician')}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">({currentCategory.rateFormatted})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingTrade(true)}
                    className="text-xs text-[#ff7a00] hover:underline font-bold cursor-pointer"
                  >
                    Edit Trade ✏️
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Experience</label>
              <div className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {formatExperience(workerInfo?.experience_years ?? experienceYears, workerInfo?.experience_months ?? experienceMonths)} Certified Experience
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Endorsed Skill Badges
              </label>
              <div className="flex flex-wrap gap-2">
                {(workerInfo?.skills || ['Wiring', 'Switchboard Repair', 'Inverter Installation', 'MCB Tripping']).map((s) => (
                  <span
                    key={s}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isDark
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#ff7a00] uppercase tracking-wider">Federation & KYC Compliance</h3>
            <div>
              <label className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cooperative Society</label>
              <div className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Delhi Shramik Sahakari Federation Ltd. (Reg: DEL/LAB-COOP/2021/894)
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Identity Document</label>
              <div className={`text-sm font-mono mt-0.5 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {workerInfo?.gov_id_type || 'Aadhaar'}: {workerInfo?.gov_id_masked || 'XXXX-XXXX-8921'}
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Service Base Locality</label>
              <div className={`text-sm mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                📍 {workerInfo?.area || 'South Extension, New Delhi'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certified Training & Upskilling Badges */}
      <div className="flow-card glow-orange-hover p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Certified Training & Upskilling Badges
            </h3>
          </div>
          <span className="status-pill-emerald text-[11px]">
            Co-op Verified
          </span>
        </div>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Earned through successfully passing practical exams and interactive safety modules at the Sahakar Training Academy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <span className="text-2xl">🏆</span>
            <div>
              <strong className="text-xs block">Electrical Safety (LOTO)</strong>
              <span className="text-[10px] text-slate-400">Score: 100% • Verified</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            isDark ? 'bg-purple-950/20 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
          }`}>
            <span className="text-2xl">⭐</span>
            <div>
              <strong className="text-xs block">5-Star Customer Etiquette</strong>
              <span className="text-[10px] text-slate-400">Score: 100% • Verified</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            isDark ? 'bg-blue-950/20 border-blue-500/30 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            <span className="text-2xl">⚡</span>
            <div>
              <strong className="text-xs block">Smart Relay Specialist</strong>
              <span className="text-[10px] text-slate-400">In Progress (50%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Household Reviews */}
      <div className="flow-card glow-orange-hover p-6">
        <h3 className={`text-base font-black mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Household Ratings & Feedback ({ratingsList.length})
        </h3>
        <div className="space-y-3">
          {ratingsList.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-bold text-sm">
                  {'★'.repeat(r.score)} ({r.score}/5)
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className={`text-xs italic ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>&quot;{r.review_text}&quot;</p>
              {r.tags && r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {r.tags.map((tItem) => (
                    <span
                      key={tItem}
                      className={`text-[10px] px-2 py-0.5 rounded-md border ${
                        isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      🏷️ {tItem}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {ratingsList.length === 0 && (
            <div className={`p-6 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No customer ratings received yet. Ratings from completed tasks will show here automatically.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
