import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { generateInvoiceData } from '../lib/invoiceGenerator'
import { downloadInvoicePdf, getInvoicePdfFilename, exportElementToPdf } from '../lib/pdfExporter'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/I18nContext'

export default function InvoiceModal({ job, worker, household, wageLedgerItem, onClose }) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const invoiceCardRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)

  if (!job) return null

  const inv = generateInvoiceData(job, worker, household, wageLedgerItem)

  async function handleDownloadPdf() {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      await downloadInvoicePdf(inv)
    } catch (err) {
      console.error('Failed to generate invoice PDF:', err)
      try {
        if (invoiceCardRef.current) {
          const filename = getInvoicePdfFilename(inv)
          await exportElementToPdf(invoiceCardRef.current, filename)
        }
      } catch (fallbackErr) {
        console.error('Fallback export error:', fallbackErr)
      }
    } finally {
      setTimeout(() => setIsGenerating(false), 300)
    }
  }

  function handlePrint() {
    window.print()
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        ref={invoiceCardRef}
        className={`rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border print:m-0 print:p-2 print:border-none print:shadow-none my-auto max-h-[92vh] overflow-y-auto ${
          isDark
            ? 'bg-[#12151b] border-white/[0.08] text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header with Federation Emblem */}
        <div className={`flex flex-col sm:flex-row justify-between items-start gap-3 border-b pb-5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(16,185,129,0.4)] shrink-0">
                🤝
              </span>
              <div>
                <h2 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-emerald-400' : 'text-emerald-900'}`}>
                  {inv.society.name}
                </h2>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Registration No: {inv.society.regNo}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 sm:pl-10.5">
              {inv.society.address} • Phone: {inv.society.phone}
            </p>
          </div>

          <div className="sm:text-right self-start sm:self-auto">
            <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30 inline-block sm:block shadow-sm">
              {inv.invoiceNo}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Date: {inv.date}</span>
          </div>
        </div>

        {/* Customer & Worker Details Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border text-xs ${
            isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Customer:
            </span>
            <strong className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{inv.customer.name}</strong>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>{inv.customer.address}</p>
          </div>

          <div className={`space-y-1 sm:border-l sm:pl-4 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Assigned Worker:
            </span>
            <strong className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {inv.worker.name} (★ {inv.worker.rating})
            </strong>
            <p className="text-emerald-400 font-semibold">{inv.worker.trade} Trade</p>
          </div>
        </div>

        {/* Line Items Table with horizontal scroll container */}
        <div className={`border rounded-xl overflow-x-auto text-xs ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <table className="w-full text-left min-w-[340px]">
            <thead className={`font-bold border-b ${isDark ? 'bg-[#181d26] text-[#ff7a00] border-white/[0.06]' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              <tr>
                <th className="px-3.5 py-2.5">Service Task</th>
                <th className="px-3 py-2.5 text-center">Duration</th>
                <th className="px-3 py-2.5 text-right">Standard Rate</th>
                <th className="px-3.5 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
              <tr>
                <td className="px-3.5 py-3">
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{inv.job.title}</div>
                  <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{inv.job.description}</div>
                </td>
                <td className={`px-3 py-3 text-center font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {inv.job.estimatedHours} hrs
                </td>
                <td className={`px-3 py-3 text-right ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  ₹{(inv.financials.grossAmount / inv.job.estimatedHours).toFixed(0)}/hr
                </td>
                <td className="px-3.5 py-3 text-right font-black text-emerald-400 text-sm">
                  ₹{inv.financials.grossAmount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment & Fair Wage Breakdown */}
        <div className={`p-4 rounded-xl space-y-2 text-xs border ${isDark ? 'bg-[#181d26] border-white/[0.08]' : 'bg-slate-900 text-white border-slate-800'}`}>
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">
            Payment & Worker Wage Breakdown
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Total Customer Payment:</span>
            <span className="font-bold text-white">₹{inv.financials.grossAmount}</span>
          </div>

          <div className="flex justify-between text-amber-300">
            <span>Co-op 5% Maintenance Fee:</span>
            <span>- ₹{inv.financials.cooperativeFeeAmount}</span>
          </div>

          <div className="flex justify-between text-cyan-300">
            <span>Worker Welfare Fund:</span>
            <span>- ₹{inv.financials.welfareFundAmount}</span>
          </div>

          <div className={`h-px my-2 ${isDark ? 'bg-white/[0.08]' : 'bg-slate-800'}`}></div>

          <div className="flex justify-between items-center text-sm font-black text-emerald-400">
            <span>Direct Worker Take-Home Pay:</span>
            <span className="text-base font-black">₹{inv.financials.netWorkerPayout}</span>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
            <span>Payment Mode: {inv.financials.paymentMode}</span>
            <span className="text-emerald-400 font-bold">✓ {inv.financials.paymentStatus}</span>
          </div>
        </div>

        {/* Completion Notes */}
        <div className={`text-[11px] italic p-3 rounded-lg border ${isDark ? 'bg-[#161a22] border-white/[0.06] text-slate-400' : 'bg-slate-50 border-slate-200/60 text-slate-500'}`}>
          &quot;{inv.job.completionNotes}&quot;
        </div>

        {/* Actions Button Bar: Save as PDF, Print, Cancel */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 print:hidden no-pdf">
          {/* Save as PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="px-4 py-2 flow-btn-emerald text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGenerating ? (
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

          {/* Windows Print Dialog Button */}
          <button
            type="button"
            onClick={handlePrint}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-[#161a22] border-white/[0.12] text-slate-200 hover:text-white hover:border-[#ff6b00]'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
            }`}
          >
            <span>🖨️</span>
            <span>{t('print', 'Print')}</span>
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition-all border cursor-pointer ${
              isDark
                ? 'border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.05]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <span>{t('cancel', 'Cancel')}</span>
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
