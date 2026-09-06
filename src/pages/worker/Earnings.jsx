import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import InvoiceModal from '../../components/InvoiceModal'

export default function WorkerEarnings() {
  const { user, profile } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [ledger, setLedger] = useState([])
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null)

  useEffect(() => {
    let ignore = false
    async function loadLedger() {
      if (!user) return
      const { data } = await supabase
        .from('wage_ledger')
        .select('*, job(*)')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
      if (!ignore) {
        setLedger(data || [])
      }
    }
    loadLedger()
    return () => {
      ignore = true
    }
  }, [user])

  const totalGross = ledger.reduce((acc, row) => acc + (row.gross_amount || 0), 0)
  const totalCoopFee = ledger.reduce((acc, row) => acc + (row.cooperative_fee_amount || 0), 0)
  const totalWelfare = ledger.reduce((acc, row) => acc + (row.welfare_fund_amount || 0), 0)
  const totalNet = ledger.reduce((acc, row) => acc + (row.net_payout || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
            isDark
              ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]'
              : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}
        >
          <span>⚡</span>
          <span>SIH26089 Feature 7 • {t('fairWageLedger', 'Fair Wage Ledger')}</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('fairWageLedger', 'Cooperative Fair Wage Ledger')}
        </h1>
        <p className={`text-xs mt-1 max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          100% transparent statutory accounting of gross customer billings, cooperative 5% retention, and net payouts
        </p>
      </div>

      {/* Summary KPI Cards with FlowBoard Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross */}
        <div className="flow-card glow-orange-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('grossAmount', 'Gross Billed to Customers')}
              </span>
              <div className={`text-2xl font-black mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ₹{totalGross.toLocaleString()}
              </div>
            </div>
            <div className="flow-icon-badge-orange shrink-0">
              <span className="text-xl">💼</span>
            </div>
          </div>
          <div className={`text-xs mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Service Value</div>
        </div>

        {/* Co-op 5% */}
        <div className="flow-card glow-orange-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('coopFee', 'Cooperative 5% Retained')}
              </span>
              <div className={`text-2xl font-black mt-1.5 ${isDark ? 'text-[#ff7a00]' : 'text-amber-600'}`}>₹{totalCoopFee.toLocaleString()}</div>
            </div>
            <div className="flow-icon-badge-orange shrink-0">
              <span className="text-xl">🏛️</span>
            </div>
          </div>
          <div className={`text-xs mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Federation operations</div>
        </div>

        {/* Welfare Fund */}
        <div className="flow-card glow-orange-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('welfareCorpus', 'Welfare & Insurance Fund')}
              </span>
              <div className={`text-2xl font-black mt-1.5 ${isDark ? 'text-cyan-400' : 'text-teal-600'}`}>₹{totalWelfare.toLocaleString()}</div>
            </div>
            <div className="flow-icon-badge-orange shrink-0">
              <span className="text-xl">🛡️</span>
            </div>
          </div>
          <div className={`text-xs mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹10/job welfare corpus</div>
        </div>

        {/* Net Direct Disbursed */}
        <div className="flow-card glow-emerald-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('netDisbursed', 'Net Direct Disbursed')}
              </span>
              <div className={`text-2xl font-black mt-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>₹{totalNet.toLocaleString()}</div>
            </div>
            <div className="flow-icon-badge-emerald shrink-0">
              <span className="text-xl">💰</span>
            </div>
          </div>
          <div className={`text-xs mt-2 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Settled to your Bank/UPI</div>
        </div>
      </div>

      {/* Wage Ledger Table */}
      <div className="flow-card glow-orange-hover p-6 space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Per-Job Dissection & Payout Audit
            </h2>
          </div>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Auto-generated upon digital completion
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3.5">Job ID</th>
                <th className="px-4 py-3.5">Completion Date</th>
                <th className="px-4 py-3.5">Gross Amount</th>
                <th className="px-4 py-3.5">Co-op Fee (5%)</th>
                <th className="px-4 py-3.5">Welfare Fund</th>
                <th className={`px-4 py-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Net Worker Payout</th>
                <th className="px-4 py-3.5">Invoice Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-200'}`}>
              {ledger.map((row) => (
                <tr key={row.id} className={`interactive-row ${isDark ? '' : 'hover:bg-slate-50'}`}>
                  <td className={`px-4 py-3.5 font-mono font-bold ${isDark ? 'text-[#ff7a00]' : 'text-amber-700'}`}>{row.job_id}</td>
                  <td className={`px-4 py-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className={`px-4 py-3.5 font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{row.gross_amount}
                  </td>
                  <td className={`px-4 py-3.5 font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>- ₹{row.cooperative_fee_amount}</td>
                  <td className={`px-4 py-3.5 font-bold ${isDark ? 'text-cyan-400' : 'text-teal-700'}`}>- ₹{row.welfare_fund_amount}</td>
                  <td className={`px-4 py-3.5 font-black text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>₹{row.net_payout}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelectedInvoiceItem(row)}
                      className="px-3 py-1 flow-btn-primary rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span>📄</span>
                      <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        💼
                      </div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Data Available
                      </div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No completed work wage records generated in your ledger yet.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceItem && (
        <InvoiceModal
          job={selectedInvoiceItem.job || { id: selectedInvoiceItem.job_id, title: 'Completed Service Task', estimated_amount: selectedInvoiceItem.gross_amount }}
          worker={{ full_name: profile?.full_name || 'Member Worker' }}
          household={{ full_name: 'Priya Sharma' }}
          wageLedgerItem={selectedInvoiceItem}
          onClose={() => setSelectedInvoiceItem(null)}
        />
      )}
    </div>
  )
}
