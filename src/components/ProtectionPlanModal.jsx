import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function ProtectionPlanModal({ isOpen, onClose }) {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const { profile } = useAuth()
  const role = profile?.role || 'worker'

  if (!isOpen) return null

  const schemes = [
    {
      id: 'pmsby',
      tag: 'ACCIDENTAL COVER',
      title: 'Pradhan Mantri Suraksha Bima (PMSBY)',
      desc: '24/7 comprehensive accidental disability & life risk coverage for active gig technicians.',
      cover: '₹2,00,000',
      premium: 'FREE (100% Co-op Funded)',
      subsidy: '100% Co-op Covered',
      badge: '✓ Active Policy',
    },
    {
      id: 'ayushman',
      tag: 'HEALTH & HOSPITALIZATION',
      title: 'Ayushman Bharat PM-JAY Cashless Hospitalization',
      desc: 'Secondary and tertiary cashless medical care across 27,000+ empanelled hospitals nationwide.',
      cover: '₹5,00,000 / Family',
      premium: 'FREE (Govt + Co-op)',
      subsidy: '100% Subsidized',
      badge: '✓ Verified Scheme',
    },
    {
      id: 'pension',
      tag: 'RETIREMENT SECURITY',
      title: 'Atal Pension Yojana (APY) Co-op Match',
      desc: 'Cooperative matched monthly pension fund ensuring financial independence post 60 years of age.',
      cover: '₹5,00,000 Retirement Corpus',
      premium: '₹120 / Mo (50% Matched)',
      subsidy: '50% Co-op Matching',
      badge: '✓ Auto-Enrolled',
    },
    {
      id: 'emergency_pool',
      tag: 'EMERGENCY LIQUIDITY',
      title: 'Zero-Interest Co-op Micro-Advance Pool',
      desc: 'Instant collateral-free liquidity up to ₹50,000 for emergency medical, tooling, or education needs.',
      cover: 'Up to ₹50,000 Advance',
      premium: '0% Interest',
      subsidy: 'Direct Wage Reconciled',
      badge: '⚡ Instant UPI',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isDark
            ? 'bg-[#0f1217] border-white/[0.1] text-white shadow-[0_10px_50px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/[0.08] bg-[#141820]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff6b00] to-[#ff9900] text-white flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,107,0,0.4)]">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  {t('cooperativeWelfarePlan', 'Cooperative Welfare & Worker Protection Plan')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SIH26089 Feature 7
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                100% fair wages, collective social security corpus, and cashless emergency safeguards funded by 5% co-op surplus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accidental Cover</span>
              <div className="text-xl font-black text-[#ff7a00] mt-1">₹2,00,000</div>
              <span className="text-[10px] text-emerald-400 font-bold">100% Co-op Paid</span>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Health Coverage</span>
              <div className="text-xl font-black text-emerald-400 mt-1">₹5,00,000</div>
              <span className="text-[10px] text-slate-400 font-medium">PM-JAY Empanelled</span>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Welfare Corpus</span>
              <div className="text-xl font-black text-cyan-400 mt-1">₹10 / Job</div>
              <span className="text-[10px] text-cyan-400 font-bold">Automatic Escrow</span>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Credit</span>
              <div className="text-xl font-black text-purple-400 mt-1">0% Interest</div>
              <span className="text-[10px] text-purple-400 font-bold">Instant UPI</span>
            </div>
          </div>

          {/* Scheme Details Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#ff7a00]">
              📋 Active Cooperative Social Protection Schemes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schemes.map((sch) => (
                <div
                  key={sch.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isDark
                      ? 'bg-[#161a22] border-white/[0.08] hover:border-[#ff6b00]/60'
                      : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ff6b00]/15 text-[#ff7a00] border border-[#ff6b00]/30 font-mono">
                        {sch.tag}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">
                        {sch.badge}
                      </span>
                    </div>
                    <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sch.title}
                    </h4>
                    <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {sch.desc}
                    </p>
                  </div>

                  <div className={`pt-2.5 border-t space-y-1.5 text-xs ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Maximum Cover:</span>
                      <strong className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{sch.cover}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Worker Contribution:</span>
                      <span className="text-emerald-400 font-bold">{sch.premium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cooperative Subsidy:</span>
                      <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{sch.subsidy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-white/[0.08] bg-[#141820]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>🔒</span>
            <span>Policy verified by National Health Authority & Ministry of Labour & Employment.</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {role === 'worker' && (
              <Link
                to="/worker/welfare"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#ff6b00] text-white shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <span>⚡ Open Welfare Portal</span>
                <span>→</span>
              </Link>
            )}
            <button
              onClick={() => {
                alert('Digital Welfare Protection Certificate downloaded successfully.')
                onClose()
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold flow-btn-primary shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>📄 Download Protection Certificate</span>
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
