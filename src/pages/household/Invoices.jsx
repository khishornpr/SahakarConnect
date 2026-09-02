import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

export default function HouseholdInvoices() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    let ignore = false
    async function loadInvoices() {
      if (!user) return
      const { data } = await supabase
        .from('jobs')
        .select('*, wage_ledger(*)')
        .eq('household_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
      if (!ignore) {
        setInvoices(data || [])
      }
    }
    loadInvoices()
    return () => {
      ignore = true
    }
  }, [user])

  function printInvoice() {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('digitalInvoicesHeading', 'Digital Invoices & Service Receipts')}
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {t('invoicesSubheading', 'Official GST-compliant service receipts backed by Labour Cooperative Federation')}
        </p>
      </div>

      <div className="flow-card glow-orange-hover overflow-hidden">
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {t('completedInvoices', 'Completed Service Invoices')} ({invoices.length})
          </h2>
          <span className="status-pill-emerald">
            {t('officialSocietyReceipts', 'Official Society Receipts')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3.5 font-bold">{t('colInvoiceNo', 'Invoice No.')}</th>
                <th className="px-4 py-3.5 font-bold">{t('colTitle', 'Service Title')}</th>
                <th className="px-4 py-3.5 font-bold">{t('colTrade', 'Trade')}</th>
                <th className="px-4 py-3.5 font-bold">{t('colDate', 'Date')}</th>
                <th className="px-4 py-3.5 font-bold">{t('colAmountPaid', 'Amount Paid')}</th>
                <th className="px-4 py-3.5 font-bold">{t('colAction', 'Action')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
              {invoices.map((inv) => (
                <tr key={inv.id} className="interactive-row">
                  <td className="px-4 py-3.5 font-mono text-[#ff7a00] font-bold">
                    INV-{inv.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className={`px-4 py-3.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{inv.title}</td>
                  <td className={`px-4 py-3.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t(inv.trade_category, inv.trade_category)}</td>
                  <td className={`px-4 py-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(inv.completed_at || inv.created_at).toLocaleDateString()}
                  </td>
                  <td className={`px-4 py-3.5 font-black text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    ₹{inv.final_amount || inv.estimated_amount}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1 flow-btn-primary font-bold rounded-lg text-xs shadow-sm flex items-center gap-1"
                    >
                      <span>{t('viewAndPrint', 'View & Print 📄')}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {t('noInvoicesFound', 'No completed service invoices found yet.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal Preview & Print */}
      {selectedInvoice &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div
              className={`rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 border print:m-0 print:p-4 ${
                isDark ? 'bg-[#12151b] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className={`flex justify-between items-start border-b pb-4 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤝</span>
                    <span className="font-black text-lg text-emerald-400">
                      {t('federationName', 'Delhi Shramik Sahakari Federation Ltd.')}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('federationReg', 'Reg No: DEL/LAB-COOP/2021/894 • Under Multi-State Cooperative Societies Act')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    INV-{selectedInvoice.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500">{t('colDate', 'Date')}: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {t('billedTo', 'Billed To (Household):')}
                  </span>
                  <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.email}</strong>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{selectedInvoice.address}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {t('serviceProvidedBy', 'Service Provided By:')}
                  </span>
                  <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedInvoice.worker?.full_name || t('verifiedWorker', 'Verified Member Worker')}
                  </strong>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    {t(selectedInvoice.trade_category, selectedInvoice.trade_category)}
                  </span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className={`border rounded-xl overflow-hidden text-xs ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                <table className="w-full text-left">
                  <thead className={isDark ? 'bg-[#161a22] text-slate-400 font-bold' : 'bg-slate-50 text-slate-600 font-bold'}>
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Hours</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
                    <tr>
                      <td className="p-3 font-semibold">{selectedInvoice.title}</td>
                      <td className="p-3 text-center">{selectedInvoice.estimated_hours || 2} hrs</td>
                      <td className="p-3 text-right">₹350/hr</td>
                      <td className="p-3 text-right font-bold">₹{selectedInvoice.final_amount || selectedInvoice.estimated_amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Fare:</span>
                    <span>₹{selectedInvoice.final_amount || selectedInvoice.estimated_amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Statutory Co-op & Welfare:</span>
                    <span>Included (5%)</span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t font-black text-sm ${isDark ? 'border-white/[0.08] text-white' : 'border-slate-200 text-slate-900'}`}>
                    <span>Total Settled (UPI):</span>
                    <span className="text-emerald-400">₹{selectedInvoice.final_amount || selectedInvoice.estimated_amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/[0.06] print:hidden">
                <button
                  type="button"
                  onClick={printInvoice}
                  className="px-5 py-2 flow-btn-emerald font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <span>🖨️</span>
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
