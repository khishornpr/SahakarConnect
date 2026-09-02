import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerTransactions() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState({ type: '', dateFrom: '', dateTo: '', search: '' })

  useEffect(() => {
    let ignore = false
    async function loadTransactions() {
      if (!user) return
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter.type) query = query.eq('type', filter.type)
      if (filter.dateFrom) query = query.gte('created_at', filter.dateFrom)
      if (filter.dateTo) query = query.lte('created_at', filter.dateTo)

      const { data } = await query
      let results = data || []
      if (filter.search) {
        results = results.filter(tItem => tItem.remarks?.toLowerCase().includes(filter.search.toLowerCase()))
      }
      if (!ignore) {
        setTransactions(results)
      }
    }
    loadTransactions()
    return () => {
      ignore = true
    }
  }, [user, filter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('transactions', 'Transactions')}
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('transactionsSub', 'Official ledger of payouts, bonus distributions, and welfare credits')}
        </p>
      </div>

      <div className="flow-card glow-orange-hover p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t('searchRemarks', 'Search remarks...')}
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className={`px-3 py-2 border rounded-xl text-xs outline-none ${
            isDark ? 'bg-[#161a22] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        />
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className={`px-3 py-2 border rounded-xl text-xs outline-none ${
            isDark ? 'bg-[#161a22] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <option value="">{t('allTypes', 'All Types')}</option>
          <option value="credit">{t('credit', 'Credit')}</option>
          <option value="debit">{t('debit', 'Debit')}</option>
        </select>
        <input
          type="date"
          value={filter.dateFrom}
          onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
          className={`px-3 py-2 border rounded-xl text-xs outline-none ${
            isDark ? 'bg-[#161a22] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        />
        <input
          type="date"
          value={filter.dateTo}
          onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
          className={`px-3 py-2 border rounded-xl text-xs outline-none ${
            isDark ? 'bg-[#161a22] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        />
      </div>

      <div className="flow-card glow-orange-hover overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3">{t('colId', 'ID')}</th>
                <th className="px-4 py-3">{t('colType', 'Type')}</th>
                <th className="px-4 py-3">{t('colAmount', 'Amount')}</th>
                <th className="px-4 py-3">{t('colDate', 'Date')}</th>
                <th className="px-4 py-3">{t('colStatus', 'Status')}</th>
                <th className="px-4 py-3">{t('colRemarks', 'Remarks')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
              {transactions.map((tItem) => (
                <tr key={tItem.id} className={`transition-colors ${isDark ? 'hover:bg-[#161a22]' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3 font-mono text-[#ff7a00]">{tItem.id?.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tItem.type === 'credit'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {tItem.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{tItem.amount?.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(tItem.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 capitalize">{tItem.status}</td>
                  <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tItem.remarks}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {t('noTransactionsFound', 'No transactions found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
