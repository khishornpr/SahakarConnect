import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/I18nContext'

export default function PaymentModal({ job, isOpen, onClose, onPaymentSuccess }) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [method, setMethod] = useState('upi')
  const [upiId, setUpiId] = useState('priya@okhdfcbank')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  if (isOpen === false || !job) return null

  const amount = job.final_amount || job.estimated_amount || 650
  const coopFee = (amount * 0.05).toFixed(0)
  const welfare = 10
  const netWage = amount - coopFee - welfare

  async function handlePay() {
    setProcessing(true)

    // Simulate Payment Gateway write to wage ledger
    setTimeout(async () => {
      await supabase.from('wage_ledger').insert({
        job_id: job.id,
        worker_id: job.assigned_worker_id,
        cooperative_id: 'coop1',
        gross_amount: amount,
        cooperative_fee_pct: 5.0,
        cooperative_fee_amount: parseFloat(coopFee),
        welfare_fund_amount: welfare,
        net_payout: netWage,
        payment_mode: method.toUpperCase(),
        payment_status: 'completed',
        is_anomalous: false,
      })

      await supabase.from('jobs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', job.id)

      setProcessing(false)
      setSuccess(true)
      if (onPaymentSuccess) onPaymentSuccess()
      setTimeout(() => {
        onClose()
      }, 1500)
    }, 1500)
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl space-y-4 border my-auto max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#12151b] border-white/[0.08] text-white shadow-[0_0_40px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`flex justify-between items-start border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <div>
            <div className="status-pill-emerald mb-1">
              Secure Payment
            </div>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Pay for Service</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className={`font-bold text-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center text-emerald-400 bg-emerald-950/60 rounded-xl font-bold text-sm border border-emerald-500/40 space-y-1">
            <div className="text-3xl mb-1">✅</div>
            <div>Payment Successful!</div>
            <p className="text-xs text-emerald-300 font-normal">
              Direct pay sent to worker&apos;s account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount Summary */}
            <div className={`p-4 rounded-xl space-y-1.5 text-xs border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-900 text-white border-slate-800'}`}>
              <div className="flex justify-between items-center text-slate-300">
                <span>Total to Pay:</span>
                <span className="text-xl font-black text-emerald-400">₹{amount}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.08]">
                <span>Worker Take-Home: ₹{netWage}</span>
                <span>Co-op 5% + ₹10 Welfare</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: '📱' },
                  { id: 'rupay', label: 'Card', icon: '💳' },
                  { id: 'netbanking', label: 'NetBanking', icon: '🏦' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      method === m.id
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : isDark
                        ? 'border-white/[0.08] bg-[#161a22] text-slate-400 hover:text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-base">{m.icon}</div>
                    <div className="mt-1">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {method === 'upi' && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs outline-none transition-all ${
                    isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-emerald-400' : 'border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={processing}
              className="w-full py-3 flow-btn-emerald text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay ₹{amount}</span>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              Direct and secure digital payment.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
