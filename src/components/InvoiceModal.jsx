import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { generateInvoiceData } from '../lib/invoiceGenerator'
import { downloadInvoicePdf, getInvoicePdfFilename } from '../lib/pdfExporter'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/I18nContext'

export default function InvoiceModal({ job, worker, household, wageLedgerItem, onClose }) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const invoiceCardRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    function handleBeforePrint() {
      document.body.classList.add('printing-invoice')
    }
    function handleAfterPrint() {
      document.body.classList.remove('printing-invoice')
    }
    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
      document.body.classList.remove('printing-invoice')
    }
  }, [])

  if (!job) return null

  const inv = generateInvoiceData(job, worker, household, wageLedgerItem)

  // Clean customer & worker names to avoid duplicate role tags or design decorations
  const customerBaseName = (inv.customer?.name || 'Customer')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim() || 'Customer'
  const workerBaseName = (inv.worker?.name || 'Worker')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim() || 'Worker'

  const customerDisplayName = `${customerBaseName} (Customer)`
  const workerDisplayName = `${workerBaseName} (Worker)`

  async function handleDownloadPdf() {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const filename = getInvoicePdfFilename(inv)
      await downloadInvoicePdf(
        {
          ...inv,
          customer: { ...inv.customer, name: customerDisplayName },
          worker: { ...inv.worker, name: workerDisplayName },
        },
        filename
      )
    } catch (err) {
      console.error('Failed to export invoice PDF:', err)
    } finally {
      setTimeout(() => setIsGenerating(false), 300)
    }
  }

  function handlePrint() {
    document.body.classList.add('printing-invoice')
    window.print()
    setTimeout(() => {
      document.body.classList.remove('printing-invoice')
    }, 1000)
  }

  const hourlyTariff = Math.round(inv.financials.grossAmount / (inv.job.estimatedHours || 1))

  const modalContent = (
    <div className="invoice-modal-overlay fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:bg-transparent print:static print:block print:overflow-visible">
      <div
        ref={invoiceCardRef}
        className={`printable-invoice-card rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border my-auto max-h-[92vh] overflow-y-auto transition-colors print:bg-white print:text-slate-900 print:border-slate-200 print:shadow-none print:max-h-none print:overflow-visible ${
          isDark
            ? 'bg-[#12151b] text-white border-white/[0.1] shadow-black/80'
            : 'bg-white text-slate-900 border-slate-200 shadow-xl'
        }`}
      >
        {/* Header with Federation Emblem */}
        <div className={`flex flex-col sm:flex-row justify-between items-start gap-3 border-b pb-5 print:border-slate-200 ${
          isDark ? 'border-white/[0.08]' : 'border-slate-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                🤝
              </span>
              <div>
                <h2 className={`text-base sm:text-lg font-black tracking-tight print:text-emerald-900 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-900'
                }`}>
                  {inv.society.name}
                </h2>
                <div className={`text-[10px] font-bold uppercase tracking-wider print:text-slate-500 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Registration No: {inv.society.regNo}
                </div>
              </div>
            </div>
            <p className={`text-[11px] sm:pl-10.5 print:text-slate-500 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {inv.society.address} • Phone: {inv.society.phone}
            </p>
          </div>

          <div className="sm:text-right self-start sm:self-auto">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border inline-block sm:block shadow-sm print:text-emerald-800 print:bg-emerald-50 print:border-emerald-300 ${
              isDark
                ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40'
                : 'text-emerald-800 bg-emerald-50 border-emerald-300'
            }`}>
              {inv.invoiceNo}
            </span>
            <span className={`text-[10px] mt-1 block print:text-slate-500 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>Date: {inv.date}</span>
          </div>
        </div>

        {/* Customer & Worker Details Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border text-xs print:bg-slate-50 print:border-slate-200 print:text-slate-800 ${
          isDark
            ? 'bg-[#161a22] border-white/[0.08] text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-1">
            <span className={`text-[10px] uppercase font-bold block tracking-wider print:text-slate-500 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Customer:
            </span>
            <strong className={`text-sm font-bold block print:text-slate-900 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>{customerDisplayName}</strong>
            <p className={`leading-relaxed print:text-slate-600 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>{inv.customer.address}</p>
          </div>

          <div className={`space-y-1 sm:border-l sm:pl-4 print:border-slate-200 ${
            isDark ? 'sm:border-white/[0.08]' : 'sm:border-slate-200'
          }`}>
            <span className={`text-[10px] uppercase font-bold block tracking-wider print:text-slate-500 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Assigned Worker:
            </span>
            <strong className={`text-sm font-bold block print:text-slate-900 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>{workerDisplayName}</strong>
            <p className={`font-semibold print:text-emerald-700 ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>{inv.worker.trade} Trade • Verified Member</p>
          </div>
        </div>

        {/* Line Items Table with horizontal scroll container */}
        <div className={`border rounded-xl overflow-x-auto text-xs print:border-slate-200 ${
          isDark ? 'border-white/[0.08]' : 'border-slate-200'
        }`}>
          <table className="w-full text-left table-fixed min-w-[480px]">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[16%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className={`font-bold border-b print:bg-slate-100 print:text-slate-700 print:border-slate-200 ${
              isDark
                ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3 font-bold">Service Task</th>
                <th className="px-3 py-3 text-center font-bold whitespace-nowrap">Duration</th>
                <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Standard Tariff</th>
                <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Total Amount</th>
              </tr>
            </thead>
            <tbody className={`divide-y print:divide-slate-100 ${
              isDark ? 'divide-white/[0.06]' : 'divide-slate-100'
            }`}>
              <tr>
                <td className="px-4 py-3.5 pr-2">
                  <div className={`font-bold print:text-slate-900 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>{inv.job.title}</div>
                  <div className={`text-[11px] mt-0.5 leading-normal print:text-slate-500 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>{inv.job.description}</div>
                </td>
                <td className={`px-3 py-3.5 text-center font-medium whitespace-nowrap print:text-slate-700 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {inv.job.estimatedHours} hrs
                </td>
                <td className={`px-3 py-3.5 text-right whitespace-nowrap print:text-slate-600 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  ₹ {hourlyTariff} / hr
                </td>
                <td className={`px-4 py-3.5 text-right font-black text-sm whitespace-nowrap print:text-emerald-700 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  ₹ {inv.financials.grossAmount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment & Fair Wage Breakdown */}
        <div className={`p-4 sm:p-5 rounded-xl space-y-2.5 text-xs border transition-colors print:bg-slate-50 print:text-slate-900 print:border-slate-200 ${
          isDark
            ? 'bg-[#0b0d11] text-white border-white/[0.08]'
            : 'bg-slate-50 text-slate-900 border-slate-200'
        }`}>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
            <span className={`text-[10px] uppercase font-bold tracking-wider print:text-emerald-700 ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              Payment & Worker Wage Settlement
            </span>
            <span className={`text-[10px] font-medium print:text-slate-500 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Statutory Cooperative Ledger
            </span>
          </div>

          <div className={`flex justify-between items-center gap-4 print:text-slate-800 ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            <span>Total Customer Payment (Gross Amount):</span>
            <span className={`font-bold shrink-0 print:text-slate-950 ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>₹ {inv.financials.grossAmount}</span>
          </div>

          <div className={`flex justify-between items-center gap-4 print:text-amber-700 ${
            isDark ? 'text-amber-300' : 'text-amber-700'
          }`}>
            <span>Less: Co-op 5% Maintenance Contribution:</span>
            <span className="font-bold shrink-0">- ₹ {inv.financials.cooperativeFeeAmount}</span>
          </div>

          <div className={`flex justify-between items-center gap-4 print:text-sky-700 ${
            isDark ? 'text-cyan-300' : 'text-sky-700'
          }`}>
            <span>Less: Worker Welfare & Social Security Fund:</span>
            <span className="font-bold shrink-0">- ₹ {inv.financials.welfareFundAmount}</span>
          </div>

          <div className={`h-px my-2 print:bg-slate-200 ${
            isDark ? 'bg-white/[0.08]' : 'bg-slate-200'
          }`}></div>

          <div className={`flex flex-col sm:flex-row justify-between sm:items-end gap-2 text-sm font-black pt-0.5 print:text-emerald-700 ${
            isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            <div className="space-y-0.5">
              <span className={`block text-sm font-black print:text-emerald-700 ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>Direct Worker Take-Home Pay:</span>
              <span className={`text-[10px] font-normal block print:text-slate-500 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Amount Calculation: ₹ {inv.financials.grossAmount} - ₹ {inv.financials.cooperativeFeeAmount} - ₹ {inv.financials.welfareFundAmount} = ₹ {inv.financials.netWorkerPayout}
              </span>
            </div>
            <span className={`text-base font-black shrink-0 print:text-emerald-700 ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>₹ {inv.financials.netWorkerPayout}</span>
          </div>

          <div className={`text-[10px] pt-2 flex flex-wrap justify-between gap-2 border-t mt-2 print:text-slate-500 print:border-slate-200 ${
            isDark
              ? 'text-slate-400 border-white/[0.08]'
              : 'text-slate-500 border-slate-200'
          }`}>
            <span>Payment Mode: {inv.financials.paymentMode}</span>
            <span className={`font-bold print:text-emerald-700 ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>✓ {inv.financials.paymentStatus}</span>
          </div>
        </div>

        {/* Completion Notes */}
        <div className={`text-[11px] italic p-3 rounded-lg border print:bg-slate-50 print:border-slate-200 print:text-slate-600 ${
          isDark
            ? 'bg-[#161a22] border-white/[0.08] text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          &quot;{inv.job.completionNotes}&quot;
        </div>

        {/* Actions Button Bar: Save as PDF, Print, Cancel */}
        <div className={`flex flex-wrap items-center justify-end gap-3 pt-3 print:hidden no-pdf border-t ${
          isDark ? 'border-white/[0.08]' : 'border-slate-100'
        }`}>
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
                ? 'bg-[#161a22] text-slate-200 hover:bg-[#1e232e] border-white/[0.1]'
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
                ? 'bg-[#161a22] text-slate-300 hover:bg-[#1e232e] border-white/[0.08]'
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
