import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerWelfare() {
  const { isDark } = useTheme()
  const [schemes, setSchemes] = useState([])
  const [loanAmount, setLoanAmount] = useState(15000)

  useEffect(() => {
    supabase.from('welfare_schemes').select('*').then(({ data }) => setSchemes(data || []))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]' : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}
          >
            <span>🛡️</span>
            <span>SIH26089 Feature 7 • Worker Welfare & Social Security</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cooperative Welfare & Social Security
          </h1>
          <p className={`text-xs mt-1 max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Government subsidized insurance, accidental coverage, and emergency credit pool funded by 5% co-op surplus
          </p>
        </div>
      </div>

      {/* Welfare Scheme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schemes.map((sch) => (
          <div
            key={sch.id}
            className="flow-card glow-orange-hover p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#ff6b00]/20 text-[#ff7a00] border border-[#ff6b00]/40">
                  {sch.type.replace('_', ' ')}
                </span>
                <span className="status-pill-emerald">✓ Auto-Enrolled</span>
              </div>
              <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{sch.name}</h3>
              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{sch.description}</p>
            </div>

            <div className={`space-y-2 pt-4 border-t text-xs ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Max Cover:</span>
                <strong className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{sch.coverage_amount?.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Member Premium:</span>
                <span className="text-emerald-400 font-bold">
                  {sch.monthly_premium === 0 ? 'FREE (100% Co-op Funded)' : `₹${sch.monthly_premium}/month`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Govt/Co-op Subsidy:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{sch.govt_subsidy_pct}%</span>
              </div>
            </div>

            <button
              onClick={() => alert('Digital Welfare Card: Download request queued with National Health Authority / PMSBY API.')}
              className="w-full py-2.5 flow-btn-primary text-xs font-bold rounded-xl shadow-md transition-all"
            >
              📄 Download Digital Welfare Card
            </button>
          </div>
        ))}
      </div>

      {/* Emergency Credit & Welfare Loan Simulator */}
      <div className="flow-card glow-emerald-hover p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Emergency Cooperative Micro-Advance Pool (0% Interest)
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Collateral-free advance for health emergencies, tool upgrades, and family needs backed by verified member ledger
            </p>
          </div>
          <span className="status-pill-emerald">Instant UPI Disbursal</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Select Advance Amount:</span>
              <span className="text-[#ff7a00] font-black text-sm">₹{loanAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-[#ff6b00] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>₹5,000 (Micro)</span>
              <span>₹25,000 (Standard)</span>
              <span>₹50,000 (Maximum Limit)</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-50 border-slate-200'}`}>
            <div className="text-xs text-slate-400">Monthly Auto-Deduction (6 Months)</div>
            <div className="text-2xl font-black text-emerald-400">
              ₹{Math.round(loanAmount / 6).toLocaleString()} /mo
            </div>
            <div className="text-[11px] text-slate-500">Zero Interest • Directly reconciled from completed service jobs</div>
            <button
              onClick={() => alert(`Emergency advance request of ₹${loanAmount.toLocaleString()} submitted to Federation Board for instant verification.`)}
              className="w-full py-2 flow-btn-emerald text-xs font-bold rounded-xl shadow-sm"
            >
              ⚡ Request Instant Advance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
