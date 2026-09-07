import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'
import { exportElementToPdf } from '../../lib/pdfExporter'

export default function ManagerReports() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [ledger, setLedger] = useState([])
  const [downloading, setDownloading] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const reportContainerRef = useRef(null)

  useEffect(() => {
    let ignore = false
    async function loadLedger() {
      const { data } = await supabase.from('wage_ledger').select('*').order('created_at', { ascending: false })
      if (!ignore) setLedger(data || [])
    }
    loadLedger()
    return () => {
      ignore = true
    }
  }, [])

  const totalGross = ledger.reduce((sum, item) => sum + (item.gross_amount || 0), 0)
  const totalCoopFee = ledger.reduce((sum, item) => sum + (item.cooperative_fee_amount || 0), 0)
  const totalWelfare = ledger.reduce((sum, item) => sum + (item.welfare_fund_amount || 0), 0)
  const totalNet = ledger.reduce((sum, item) => sum + (item.net_payout || 0), 0)

  function exportCSV() {
    setDownloading(true)
    const headers = ['Ledger ID', 'Worker ID', 'Date', 'Gross Amount (INR)', 'Coop Fee (5%)', 'Welfare Fund', 'Net Take-Home Payout (INR)', 'Payment Mode', 'Status']
    const rows = ledger.map((l) => [
      l.id,
      l.worker_id,
      new Date(l.created_at).toLocaleDateString(),
      l.gross_amount,
      l.cooperative_fee_amount,
      l.welfare_fund_amount,
      l.net_payout,
      l.payment_mode,
      l.payment_status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SahakarConnect_Team_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setDownloading(false), 800)
  }

  async function handleDownloadPdf() {
    if (!reportContainerRef.current || isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const dateStr = new Date().toISOString().split('T')[0]
      await exportElementToPdf(reportContainerRef.current, `SahakarConnect_Zonal_Financial_Report_${dateStr}.pdf`, {
        backgroundColor: isDark ? '#0f1217' : '#ffffff',
      })
    } catch (err) {
      console.error('Failed to generate report PDF:', err)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div ref={reportContainerRef} className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span>📑</span>
            <span>{t('financialAuditPayrollSummary', 'Financial Audit & Payroll Summary')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('zonalTeamFinancialReport', 'Zonal Team Financial Report')}
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('zonalFinancialReportDesc', 'Comprehensive payroll ledger, statutory 5% cooperative retentions, welfare fund contributions, and direct worker bank payouts.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden no-pdf">
          <button
            type="button"
            onClick={exportCSV}
            disabled={downloading}
            className="px-4 py-2 flow-btn-primary text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>📥</span>
            <span>{downloading ? t('exportingCsv', 'Exporting CSV...') : t('downloadCsvExport', 'Download CSV Export')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 flow-btn-emerald text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isGeneratingPdf ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                <span>{t('generatingPdf', 'Generating...')}</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>{t('saveAsPdf', 'Save as PDF')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <span>🖨️</span>
            <span>{t('print', 'Print')}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flow-card p-4 space-y-1">
          <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('totalBilledVolume', 'Total Billed Volume')}</span>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{totalGross.toLocaleString()}</div>
          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('hundredPctGrossValue', '100% Gross Value')}</span>
        </div>

        <div className="flow-card p-4 space-y-1">
          <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-[#ff7a00]' : 'text-amber-700'}`}>{t('coopFeeRetained5', 'Co-op Fee Retained (5%)')}</span>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-[#ff7a00]' : 'text-amber-600'}`}>₹{totalCoopFee.toLocaleString()}</div>
          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('statutoryCeiling', 'Statutory Ceiling')}</span>
        </div>

        <div className="flow-card p-4 space-y-1">
          <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-cyan-400' : 'text-teal-700'}`}>{t('welfarePoolPmsby', 'Welfare Pool (PMSBY)')}</span>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-cyan-400' : 'text-teal-600'}`}>₹{totalWelfare.toLocaleString()}</div>
          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('workerSafetyCorpus', 'Worker Safety Corpus')}</span>
        </div>

        <div className="flow-card p-4 space-y-1">
          <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{t('netDisbursedToWorkers', 'Net Disbursed to Workers')}</span>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>₹{totalNet.toLocaleString()}</div>
          <span className={`text-[10px] ${isDark ? 'text-emerald-400/80' : 'text-emerald-700 font-medium'}`}>{t('effectivePayoutRate', '94.5% Effective Payout')}</span>
        </div>
      </div>

      {/* Full Audit Table */}
      <div className="flow-card p-5 space-y-3">
        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('detailedWageDisbursementLedger', 'Detailed Wage & Disbursement Ledger')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-3 font-bold">Ledger ID</th>
                <th className="py-3 px-3 font-bold">Worker ID</th>
                <th className="py-3 px-3 font-bold">Date</th>
                <th className="py-3 px-3 font-bold">Gross Tariff</th>
                <th className="py-3 px-3 font-bold">Co-op Fee (5%)</th>
                <th className="py-3 px-3 font-bold">Welfare Fund</th>
                <th className="py-3 px-3 font-bold">Net Payout</th>
                <th className="py-3 px-3 font-bold">Mode</th>
                <th className="py-3 px-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        📊
                      </div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Data Available
                      </div>
                      <p className="text-xs text-slate-400">
                        No financial audit report ledger records available to display.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                ledger.map((l) => (
                  <tr key={l.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-3 font-mono font-bold ${isDark ? 'text-[#ff7a00]' : 'text-amber-700'}`}>{l.id}</td>
                    <td className={`py-3 px-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{l.worker_id}</td>
                    <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(l.created_at).toLocaleDateString()}</td>
                    <td className={`py-3 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{l.gross_amount}</td>
                    <td className={`py-3 px-3 font-semibold ${isDark ? 'text-[#ff7a00]' : 'text-amber-700'}`}>₹{l.cooperative_fee_amount}</td>
                    <td className={`py-3 px-3 font-semibold ${isDark ? 'text-cyan-400' : 'text-teal-700'}`}>₹{l.welfare_fund_amount}</td>
                    <td className={`py-3 px-3 font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>₹{l.net_payout}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {l.payment_mode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={l.is_anomalous ? 'status-pill-rose' : 'status-pill-emerald'}>
                        {l.is_anomalous ? 'FLAGGED' : 'COMPLETED'}
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
