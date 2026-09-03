import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'

export default function CooperativeHelp() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [openSection, setOpenSection] = useState(null)

  const toggleAccordion = (id) => {
    setOpenSection(openSection === id ? null : id)
  }

  const features = [
    {
      id: 'dashboard',
      icon: '📊',
      title: 'Executive Dashboard & Financial Overview',
      desc: 'High-level operational and financial summary of the entire cooperative federation.',
      howTo: [
        'Monitor high-level metrics: Total Gross Merchandise Value (GMV), active fleet utilization, completed jobs, and trust rating.',
        'Switch between interactive revenue, expense, and cash flow charts (Bar, Line, Smooth Area, or Combo).',
        'Check real-time liquidity projections and 30-day financial outlook.',
      ],
    },
    {
      id: 'workers',
      icon: '👥',
      title: 'Worker Registry & Verification Queue',
      desc: 'Verify member-worker KYC credentials and approve craft trade updates.',
      howTo: [
        'Filter the worker roster by "All", "⏳ Pending Verification", or "✓ Verified".',
        'Review submitted government ID documents and certified craft experience.',
        'When a worker requests a primary trade or experience change, review their submission and click "✓ Approve & Verify" to activate their certified status.',
        'Suspend or review workers who fail safety compliance or receive repeated low ratings.',
      ],
    },
    {
      id: 'dispatch',
      icon: '📍',
      title: 'Geo-Dispatch & Fleet Matrix',
      desc: 'Monitor real-time service assignments and respond to priority SOS emergencies.',
      howTo: [
        'View live service dispatch requests categorized by trade category, zone, and priority.',
        'Filter for Emergency SOS requests that appear with high-priority red alert styling.',
        'Reassign field workers or adjust dispatch allocations when transit delays occur.',
      ],
    },
    {
      id: 'financials',
      icon: '🔍',
      title: 'Financials & AI Anomaly Detection',
      desc: 'Audit the immutable transaction ledger and investigate automated fraud alerts.',
      howTo: [
        'Inspect the real-time transaction stream with cryptographic audit hashes and timestamped escrow releases.',
        'Review AI Anomaly alerts detecting suspicious tariff spikes, rapid repeat requests, or unusual escrow hold patterns.',
        'Manage the collective welfare fund reserves that fund worker insurance and emergency medical advances.',
      ],
    },
    {
      id: 'demand-forecast',
      icon: '📈',
      title: 'AI Demand Planning & Surge Forecasting',
      desc: 'Predictive seasonal and district-level labor demand forecasting.',
      howTo: [
        'Examine machine learning forecasts predicting service demand across Delhi-NCR districts (South, West, Central, East, North, NCR).',
        'Identify upcoming seasonal shortages in specific trades (example: AC Repair in Summer, Painting before festivals).',
        'Plan targeted worker onboarding and Skill Academy training schedules ahead of demand surges.',
      ],
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flow-card p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-[#ff6b00]/30 glow-orange-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-[#ff6b00]/15 text-[#ff7a00] border border-[#ff6b00]/30">
              <span>📖</span>
              <span>Federation Admin Manual</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Help & User Manual
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Complete administrator guide for worker verification, fleet dispatching, financial audits, and demand forecasting.
            </p>
          </div>

          <Link
            to="/cooperative/dashboard"
            className="flow-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>Admin Dashboard 📊</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: How this portal works */}
      <div className={`p-6 sm:p-8 rounded-2xl border flow-card ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>🔄</span>
          <span>1. How this portal works</span>
        </h2>
        <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          The Cooperative Admin Portal is the federation's central command system. Administrators use this portal to verify worker credentials, oversee automated geo-dispatching, monitor fair wage disbursements, detect financial anomalies, and forecast future labor demand using predictive AI models.
        </p>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-3">
            Core Administrative Flow (Step-by-Step)
          </h3>
          <ol className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Worker Credential Verification:</strong> Review newly registered workers and pending trade/experience changes in the Worker Registry, then grant verified certification status.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Live Dispatch Oversight:</strong> Monitor active service bookings across municipal zones and manage high-priority emergency SOS responses.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Financial & Audit Management:</strong> Audit the escrow ledger, track welfare fund allocations, and investigate AI anomaly alerts to prevent fraud.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Demand Planning & Upskilling:</strong> Use AI predictive forecasts to identify upcoming labor demand surges and schedule targeted onboarding drives.
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* SECTION 2: Feature-by-feature guide (Collapsible Accordion) */}
      <div className={`p-6 sm:p-8 rounded-2xl border flow-card ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
        <div className="mb-4">
          <h2 className={`text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>📚</span>
            <span>2. Feature-by-feature guide</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click on any section below to see administrative controls and operational instructions.
          </p>
        </div>

        <div className="space-y-3">
          {features.map((feat) => {
            const isOpen = openSection === feat.id
            return (
              <div
                key={feat.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-[#ff6b00]/60 shadow-[0_0_15px_rgba(255,107,0,0.15)]'
                    : isDark
                    ? 'border-white/[0.08] hover:border-white/20'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isDark ? 'bg-[#12151c]' : 'bg-slate-50'}`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(feat.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">{feat.icon}</span>
                    <div className="min-w-0">
                      <h3 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {feat.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[#ff7a00]">{isOpen ? 'Hide ▲' : 'Read Guide ▼'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className={`p-4 pt-2 border-t text-xs space-y-2 ${
                    isDark ? 'border-white/[0.06] bg-black/20 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                  }`}>
                    <div className="font-bold text-[#ff7a00] text-[11px] uppercase tracking-wider mb-1">
                      Administrative Procedures:
                    </div>
                    <ul className="space-y-1.5 list-disc list-inside">
                      {feat.howTo.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 3: Tips & suggestions */}
      <div className={`p-6 sm:p-8 rounded-2xl border flow-card ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>💡</span>
          <span>3. Tips & suggestions</span>
        </h2>
        <ul className="space-y-2.5 text-xs">
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Review pending verifications daily:</strong> Clear the "Pending Verification" queue promptly so newly certified workers can immediately start accepting service requests.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Check demand forecast weekly:</strong> Use the AI demand forecasting tool every Monday to identify which trade categories will face shortages in specific municipal zones.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Investigate anomaly flags quickly:</strong> If an AI Anomaly is detected on a transaction, audit the job details before releasing escrow funds.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Monitor emergency SOS alerts:</strong> Ensure emergency dispatch tickets are attended to immediately by coordinating with the local Zonal Rapid Response team.</span>
          </li>
        </ul>
      </div>

      {/* SECTION 4: Need more help? */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-transparent border border-orange-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏛️</span>
          <div>
            <h4 className="text-xs font-bold text-orange-300">4. Need more help?</h4>
            <p className="text-[11px] text-orange-200/80 mt-0.5">
              Contact the Central Cooperative Federation Technical Support Desk for administrative or technical assistance.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="mailto:admin-support@sahakar.in"
            className="px-4 py-2 bg-[#ff6b00] hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
          >
            ✉️ Contact Federation Tech Desk
          </a>
          <a
            href="tel:1800112233"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap border border-white/10"
          >
            📞 1800-11-2233 (Ext 4)
          </a>
        </div>
      </div>
    </div>
  )
}
