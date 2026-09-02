import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

export default function CooperativeWorkers() {
  const { isDark } = useTheme()
  const [workers, setWorkers] = useState([])
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    loadWorkers()
  }, [])

  async function loadWorkers() {
    const { data } = await supabase.from('workers').select('*, profiles(*)')
    setWorkers(data || [])
  }

  async function toggleVerification(workerUserId, currentStatus) {
    setUpdatingId(workerUserId)
    const newStatus = !currentStatus
    await supabase.from('workers').update({ is_verified: newStatus }).eq('user_id', workerUserId)
    await loadWorkers()
    setUpdatingId(null)
  }

  const filtered = workers.filter((w) => {
    if (filter === 'verified') return w.is_verified
    if (filter === 'pending') return !w.is_verified
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Member Worker Roster & Verification Queue
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Administer artisan onboarding, inspect government ID / trade credentials, and toggle verified status
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'verified'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                filter === f
                  ? 'flow-btn-primary'
                  : isDark
                  ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {f === 'pending' ? '⏳ Pending KYC' : f}
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
                <th className="px-4 py-3.5">Artisan Name</th>
                <th className="px-4 py-3.5">Primary Trade</th>
                <th className="px-4 py-3.5">Base Locality</th>
                <th className="px-4 py-3.5">KYC Document</th>
                <th className="px-4 py-3.5">Reputation</th>
                <th className="px-4 py-3.5">Verification Status</th>
                <th className="px-4 py-3.5">Admin Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-200'}`}>
              {filtered.map((w) => (
                <tr key={w.id} className="interactive-row">
                  <td className="px-4 py-3.5">
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {w.profiles?.full_name || 'Worker'}
                    </div>
                    <div className="text-[11px] text-slate-400">{w.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{w.primary_trade}</span>
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
                    {w.is_verified ? (
                      <span className="status-pill-emerald">
                        ✓ VERIFIED
                      </span>
                    ) : (
                      <span className="status-pill-orange">
                        ⏳ PENDING REVIEW
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleVerification(w.user_id, w.is_verified)}
                      disabled={updatingId === w.user_id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        w.is_verified
                          ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40'
                          : 'flow-btn-primary'
                      }`}
                    >
                      {updatingId === w.user_id
                        ? 'Updating...'
                        : w.is_verified
                        ? 'Revoke Status'
                        : '✓ Approve & Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
