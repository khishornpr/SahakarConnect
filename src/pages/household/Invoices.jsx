import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import InvoiceModal from '../../components/InvoiceModal'

export default function HouseholdInvoices() {
  const { user, profile } = useAuth()
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
                      className="px-3 py-1 flow-btn-primary font-bold rounded-lg text-xs shadow-sm flex items-center gap-1 cursor-pointer"
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

      {/* Standard Invoice Modal with Client-Side PDF Generation & Auto-Download */}
      {selectedInvoice && (
        <InvoiceModal
          job={selectedInvoice}
          worker={selectedInvoice.worker || { full_name: 'Verified Cooperative Member', rating: 4.9 }}
          household={{
            full_name: profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Household Customer (Priya Sharma)')
          }}
          wageLedgerItem={selectedInvoice.wage_ledger?.[0]}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}
