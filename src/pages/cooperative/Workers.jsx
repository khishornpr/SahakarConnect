import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'

export default function CooperativeWorkers() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [workers, setWorkers] = useState([])
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'verify' | 'approve' | 'revoke', worker: obj }
  const [feedbackMsg, setFeedbackMsg] = useState('')

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

  async function handleExecuteConfirm() {
    if (!confirmModal) return
    const { type, worker } = confirmModal
    setUpdatingId(worker.user_id)
    setConfirmModal(null)

    if (type === 'verify') {
      await supabase.from('workers').update({
        is_verified: true,
      }).eq('user_id', worker.user_id)
      setFeedbackMsg(`KYC verification confirmed for ${worker.profiles?.full_name || 'Worker'}`)
    } else if (type === 'approve') {
      await supabase.from('workers').update({
        is_verified: true,
        trade_verification_status: 'verified',
      }).eq('user_id', worker.user_id)
      setFeedbackMsg(`${worker.profiles?.full_name || 'Worker'} marked as Verified & Approved`)
    } else if (type === 'revoke') {
      await supabase.from('workers').update({
        is_verified: false,
        trade_verification_status: 'pending',
      }).eq('user_id', worker.user_id)
      setFeedbackMsg(`Status revoked for ${worker.profiles?.full_name || 'Worker'}`)
    }

    await loadWorkers()
    setUpdatingId(null)
    setTimeout(() => setFeedbackMsg(''), 3500)
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
                  ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:text-white cursor-pointer'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {f === 'pending' ? '⏳ Pending Verification' : f}
            </button>
          ))}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in-up">
          <span>✅</span>
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="flow-card glow-orange-hover overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">Worker Name</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Primary Trade</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Base Locality</th>
                <th className="px-4 py-3.5 whitespace-nowrap">KYC Document</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Reputation</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Verification Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Verification</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Admin Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-200'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        👥
                      </div>
                      <div className="space-y-1">
                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          No Data Available
                        </div>
                        <p className="text-xs text-slate-400">
                          No workers found matching your selected verification status or trade category filter.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const isFullyVerified = w.is_verified && w.trade_verification_status !== 'pending'
                  const isKycVerified = Boolean(w.is_verified)
                  return (
                    <tr key={w.id} className="interactive-row">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {w.profiles?.full_name || 'Worker'}
                        </div>
                        <div className="text-[11px] text-slate-400">{w.profiles?.email}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
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
                      <td className={`px-4 py-3.5 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>📍 {w.area}</td>
                      <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                        <span className={`block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {w.gov_id_type}: {w.gov_id_masked}
                        </span>
                        <span className="text-[10px] text-cyan-400 underline cursor-pointer">{w.kyc_document_url}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-extrabold text-yellow-500">★ {w.rating || '5.0'}</span>
                        <span className="text-[10px] text-slate-500 block">{w.completed_jobs_count} completed</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
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
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ type: 'verify', worker: w })}
                          disabled={updatingId === w.user_id || isKycVerified}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap inline-flex items-center justify-center ${
                            isKycVerified
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer'
                          }`}
                        >
                          {isKycVerified ? '✓ Verified' : 'Verify KYC'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ type: isFullyVerified ? 'revoke' : 'approve', worker: w })}
                          disabled={updatingId === w.user_id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center ${
                            isFullyVerified
                              ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40'
                              : !isKycVerified
                              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md'
                              : 'flow-btn-primary shadow-md'
                          }`}
                        >
                          {updatingId === w.user_id
                            ? 'Updating...'
                            : isFullyVerified
                            ? 'Revoke Status'
                            : !isKycVerified
                            ? '⚠️ Approve Worker'
                            : '✓ Verified & Approved'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div
              className={`rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border ${
                isDark
                  ? 'bg-[#12151b] border-white/[0.1] text-white shadow-[0_0_50px_rgba(0,0,0,0.85)]'
                  : 'bg-white border-slate-200 text-slate-900 shadow-xl'
              }`}
            >
              {/* Modal Header */}
              <div className={`flex justify-between items-start border-b pb-3.5 ${
                isDark ? 'border-white/[0.08]' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {confirmModal.type === 'verify'
                      ? '🛡️'
                      : confirmModal.type === 'approve'
                      ? !confirmModal.worker.is_verified
                        ? '⚠️'
                        : '✅'
                      : '⛔'}
                  </span>
                  <div>
                    <h3 className="text-base font-black tracking-tight">
                      {confirmModal.type === 'verify'
                        ? 'Confirm KYC Document Verification'
                        : confirmModal.type === 'approve'
                        ? !confirmModal.worker.is_verified
                          ? 'Warning: Approve Unverified Worker?'
                          : 'Confirm Worker Approval'
                        : 'Confirm Status Revocation'}
                    </h3>
                    <p className={`text-[11px] font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {confirmModal.type === 'verify'
                        ? 'Validate government ID & KYC records'
                        : confirmModal.type === 'approve'
                        ? !confirmModal.worker.is_verified
                          ? 'KYC Verification not yet completed'
                          : 'Enable automatic dispatch allocations'
                        : 'Pause active dispatch allocations'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Prominent Warning Banner if Approving an Unverified Worker */}
              {confirmModal.type === 'approve' && !confirmModal.worker.is_verified && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 space-y-1 animate-pulse">
                  <div className="flex items-center gap-1.5 font-black text-xs text-amber-400 uppercase tracking-wider">
                    <span>⚠️</span>
                    <span>Warning: Verification Status Is Not Verified</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    This worker has <strong>not completed KYC document verification</strong> ({confirmModal.worker.gov_id_type || 'Gov ID'}). Approving an unverified worker bypasses standard federation safety and compliance checks.
                  </p>
                </div>
              )}

              {/* Worker Summary Card */}
              <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Worker Name:</span>
                  <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {confirmModal.worker.profiles?.full_name || 'Worker'}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Primary Trade:</span>
                  <span className="font-semibold text-emerald-400">{confirmModal.worker.primary_trade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">KYC Document:</span>
                  <span className="font-mono text-cyan-400">
                    {confirmModal.worker.gov_id_type}: {confirmModal.worker.gov_id_masked}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">KYC Status:</span>
                  <span className={confirmModal.worker.is_verified ? 'status-pill-emerald font-bold' : 'status-pill-orange font-bold'}>
                    {confirmModal.worker.is_verified ? '✓ VERIFIED' : '⏳ NOT VERIFIED'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Locality:</span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{confirmModal.worker.area}</span>
                </div>
              </div>

              {/* Explanatory Prompt */}
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {confirmModal.type === 'verify' && (
                  <>
                    Are you sure you want to verify the government ID and credentials for{' '}
                    <strong>{confirmModal.worker.profiles?.full_name || 'this worker'}</strong>?
                  </>
                )}
                {confirmModal.type === 'approve' && (
                  <>
                    {!confirmModal.worker.is_verified ? (
                      <>
                        Are you sure you want to proceed and grant <strong>Verified & Approved</strong> status to{' '}
                        <strong>{confirmModal.worker.profiles?.full_name || 'this worker'}</strong> despite the pending KYC status?
                      </>
                    ) : (
                      <>
                        Are you sure you want to grant full <strong>Verified & Approved</strong> status to{' '}
                        <strong>{confirmModal.worker.profiles?.full_name || 'this worker'}</strong>? This enables active geo-dispatch job matching across Delhi-NCR cooperative clusters.
                      </>
                    )}
                  </>
                )}
                {confirmModal.type === 'revoke' && (
                  <>
                    Are you sure you want to revoke the verified status of{' '}
                    <strong>{confirmModal.worker.profiles?.full_name || 'this worker'}</strong>? This will pause automated job dispatch allocations.
                  </>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteConfirm}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                    confirmModal.type === 'revoke'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : confirmModal.type === 'approve' && !confirmModal.worker.is_verified
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                      : 'flow-btn-primary'
                  }`}
                >
                  {confirmModal.type === 'verify'
                    ? 'Confirm Verification'
                    : confirmModal.type === 'approve'
                    ? !confirmModal.worker.is_verified
                      ? 'Confirm & Approve (With Warning)'
                      : 'Confirm Verified & Approved'
                    : 'Confirm Revocation'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
