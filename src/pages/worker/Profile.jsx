import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerProfile() {
  const { user, profile } = useAuth()
  const { isDark } = useTheme()
  const [workerInfo, setWorkerInfo] = useState(null)
  const [ratingsList, setRatingsList] = useState([])

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  async function loadProfile() {
    const { data: worker } = await supabase.from('workers').select('*').eq('user_id', user.id).single()
    setWorkerInfo(worker)

    const { data: ratings } = await supabase
      .from('ratings')
      .select('*')
      .eq('rated_user_id', user.id)
      .order('created_at', { ascending: false })
    setRatingsList(ratings || [])
  }

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
                {workerInfo?.is_verified ? (
                  <span className="status-pill-emerald">
                    ✓ Verified KYC
                  </span>
                ) : (
                  <span className="status-pill-orange">
                    Verification Pending
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {profile?.email} • {profile?.phone || '+91 98112 34567'}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-4 p-3.5 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">Reputation Score</div>
              <div className="text-base font-black text-yellow-400">★ {workerInfo?.rating || '5.0'} / 5.0</div>
            </div>
            <div className={`h-8 w-px ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`}></div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Jobs</div>
              <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {workerInfo?.completed_jobs_count || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#ff7a00] uppercase tracking-wider">Craft & Specializations</h3>
            <div>
              <label className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Primary Trade</label>
              <div className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {workerInfo?.primary_trade || 'Electrician'}
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Experience</label>
              <div className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {workerInfo?.experience_years || 5} Years Certified Experience
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
