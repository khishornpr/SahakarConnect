import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'

export default function CooperativeWorkers() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [workers, setWorkers] = useState([])
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  async function loadWorkers() {
    const { data } = await supabase.from('workers').select('*, profiles(*)')
    setWorkers(data || [])
  }

  useEffect(() => {
    let ignore = false
    async function init() {
      const { data } = await supabase.from('workers').select('*, profiles(*)')
      if (!ignore) {
        setWorkers(data || [])
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  async function toggleVerification(workerUserId, currentStatus) {
    setUpdatingId(workerUserId)
    const newStatus = !currentStatus
    await supabase.from('workers').update({
      is_verified: newStatus,
      trade_verification_status: newStatus ? 'verified' : 'pending',
    }).eq('user_id', workerUserId)
    await loadWorkers()
    setUpdatingId(null)
  }

  const filtered = workers.filter((w) => {
    const isFullyVerified = w.is_verified && w.trade_verification_status !== 'pending'
    if (filter === 'verified') return isFullyVerified
    if (filter === 'pending') return !isFullyVerified
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('workerRosterHeading', 'Member Worker Roster & Verification Queue')}
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('workerRosterSub', 'Administer worker onboarding, inspect government ID / trade credentials, and approve verification requests')}
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'verified'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-selected={filter === f}
              data-selected={filter === f ? 'true' : undefined}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                filter === f
                  ? 'flow-btn-primary cursor-default'
                  : isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:text-white cursor-pointer hover:scale-105'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer hover:scale-105'
              }`}
            >
              {f === 'pending' ? '⏳ Pending Verification' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flow-card glow-orange-hover overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3.5">Worker Name</th>
                <th className="px-4 py-3.5">Primary Trade</th>
                <th className="px-4 py-3.5">Base Locality</th>
                <th className="px-4 py-3.5">KYC Document</th>
                <th className="px-4 py-3.5">Reputation</th>
                <th className="px-4 py-3.5">Verification Status</th>
                <th className="px-4 py-3.5">Admin Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-200'}`}>
              {filtered.map((w) => {
                const isFullyVerified = w.is_verified && w.trade_verification_status !== 'pending'
                return (
                  <tr key={w.id} className="interactive-row">
                    <td className="px-4 py-3.5">
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {w.profiles?.full_name || 'Worker'}
                      </div>
                      <div className="text-[11px] text-slate-400">{w.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{w.primary_trade}</span>
                        {!isFullyVerified && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{w.experience_years} yrs experience</div>
                    </td>
                    <td className={`px-4 py-3.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>📍 {w.area}</td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {w.gov_id_type}: {w.gov_id_masked}
                      </span>
                      <span className="text-[10px] text-cyan-400 underline cursor-pointer">{w.kyc_document_url}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-yellow-500">★ {w.rating || '5.0'}</span>
                      <span className="text-[10px] text-slate-500 block">{w.completed_jobs_count} completed</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isFullyVerified ? (
                        <span className="status-pill-emerald font-bold">
                          ✓ VERIFIED
                        </span>
                      ) : (
                        <span className="status-pill-orange font-bold animate-pulse">
                          ⏳ VERIFICATION IN PROGRESS
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleVerification(w.user_id, isFullyVerified)}
                        disabled={updatingId === w.user_id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isFullyVerified
                            ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40'
                            : 'flow-btn-primary shadow-md hover:scale-105'
                        }`}
                      >
                        {updatingId === w.user_id
                          ? 'Updating...'
                          : isFullyVerified
                          ? 'Revoke Status'
                          : '✓ Approve & Verify'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
