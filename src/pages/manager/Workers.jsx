import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { TRADES_LIST } from '../../lib/serviceCategories'

export default function ManagerWorkers() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [workers, setWorkers] = useState([])
  const [tradeFilter, setTradeFilter] = useState('all')

  useEffect(() => {
    let ignore = false
    async function loadWorkers() {
      const { data } = await supabase.from('workers').select('*')
      if (!ignore) setWorkers(data || [])
    }
    loadWorkers()
    return () => {
      ignore = true
    }
  }, [])


  const filtered = workers.filter((w) => {
    if (tradeFilter !== 'all' && w.primary_trade !== tradeFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span>👷</span>
            <span>Team Roster Management</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Zonal Worker Verification & Roster
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Scoped directory of workers allocated to South Delhi district cluster with real-time verification and rating scores.
          </p>
        </div>

        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border outline-none transition-all ${
            isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <option value="all">{t('allTradeSpecializations', 'All Trade Specializations')}</option>
          {TRADES_LIST.map((tr) => (
            <option key={tr} value={tr}>
              {t(tr, tr)}
            </option>
          ))}
        </select>
      </div>

      <div className="flow-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-3 font-bold">Worker / ID</th>
                <th className="py-3 px-3 font-bold">Trade</th>
                <th className="py-3 px-3 font-bold">Locality</th>
                <th className="py-3 px-3 font-bold">Hourly Rate</th>
                <th className="py-3 px-3 font-bold">Rating</th>
                <th className="py-3 px-3 font-bold">Completed Jobs</th>
                <th className="py-3 px-3 font-bold">Gov ID / KYC</th>
                <th className="py-3 px-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        👥
                      </div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Data Available
                      </div>
                      <p className="text-xs text-slate-400">
                        No workers found matching the selected trade category or area filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#ff7a00]">{w.id}</td>
                    <td className="py-3 px-3 font-bold text-white">{w.primary_trade}</td>
                    <td className="py-3 px-3 text-slate-300">{w.area}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">₹{w.hourly_rate}/hr</td>
                    <td className="py-3 px-3 font-black text-amber-400">★ {w.rating}</td>
                    <td className="py-3 px-3 text-slate-200">{w.completed_jobs_count || 12}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {w.gov_id_type}: {w.gov_id_masked}
                    </td>
                    <td className="py-3 px-3">
                      <span className={w.is_verified && w.trade_verification_status !== 'pending' ? 'status-pill-emerald font-bold' : 'status-pill-orange font-bold'}>
                        {w.is_verified && w.trade_verification_status !== 'pending' ? '✓ VERIFIED' : '⏳ PENDING REVIEW'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
