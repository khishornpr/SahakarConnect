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
      title: t('helpCoopDashTitle', 'Executive Dashboard & Financial Overview'),
      desc: t('helpCoopDashDesc', 'High-level operational and financial summary of the entire cooperative federation.'),
      howTo: [
        t('helpCoopDashStep1', 'Monitor high-level metrics: Total Gross Merchandise Value (GMV), active fleet utilization, completed jobs, and trust rating.'),
        t('helpCoopDashStep2', 'Switch between interactive revenue, expense, and cash flow charts (Bar, Line, Smooth Area, or Combo).'),
        t('helpCoopDashStep3', 'Check real-time liquidity projections and 30-day financial outlook.'),
      ],
    },
    {
      id: 'workers',
      icon: '👥',
      title: t('helpCoopWorkersTitle', 'Worker Registry & Verification Queue'),
      desc: t('helpCoopWorkersDesc', 'Verify member-worker KYC credentials and approve craft trade updates.'),
      howTo: [
        t('helpCoopWorkersStep1', 'Filter the worker roster by "All", "⏳ Pending Verification", or "✓ Verified".'),
        t('helpCoopWorkersStep2', 'Review submitted government ID documents and certified craft experience.'),
        t('helpCoopWorkersStep3', 'When a worker requests a primary trade or experience change, review their submission and click "✓ Approve & Verify" to activate their certified status.'),
        t('helpCoopWorkersStep4', 'Suspend or review workers who fail safety compliance or receive repeated low ratings.'),
      ],
    },
    {
      id: 'dispatch',
      icon: '📍',
      title: t('helpCoopDispatchTitle', 'Geo-Dispatch & Fleet Matrix'),
      desc: t('helpCoopDispatchDesc', 'Monitor real-time service assignments and respond to priority SOS emergencies.'),
      howTo: [
        t('helpCoopDispatchStep1', 'View live service dispatch requests categorized by trade category, zone, and priority.'),
        t('helpCoopDispatchStep2', 'Filter for Emergency SOS requests that appear with high-priority red alert styling.'),
        t('helpCoopDispatchStep3', 'Reassign field workers or adjust dispatch allocations when transit delays occur.'),
      ],
    },
    {
      id: 'financials',
      icon: '🔍',
      title: t('helpCoopFinTitle', 'Financials & AI Anomaly Detection'),
      desc: t('helpCoopFinDesc', 'Audit the immutable transaction ledger and investigate automated fraud alerts.'),
      howTo: [
        t('helpCoopFinStep1', 'Inspect the real-time transaction stream with cryptographic audit hashes and timestamped escrow releases.'),
        t('helpCoopFinStep2', 'Review AI Anomaly alerts detecting suspicious tariff spikes, rapid repeat requests, or unusual escrow hold patterns.'),
        t('helpCoopFinStep3', 'Manage the collective welfare fund reserves that fund worker insurance and emergency medical advances.'),
      ],
    },
    {
      id: 'demand-forecast',
      icon: '📈',
      title: t('helpCoopDemandTitle', 'AI Demand Planning & Surge Forecasting'),
      desc: t('helpCoopDemandDesc', 'Predictive seasonal and district-level labor demand forecasting.'),
      howTo: [
        t('helpCoopDemandStep1', 'Examine machine learning forecasts predicting service demand across Delhi-NCR districts (South, West, Central, East, North, NCR).'),
        t('helpCoopDemandStep2', 'Identify upcoming seasonal shortages in specific trades (example: AC Repair in Summer, Painting before festivals).'),
        t('helpCoopDemandStep3', 'Plan targeted worker onboarding and Skill Academy training schedules ahead of demand surges.'),
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
              <span>{t('federationAdminManual', 'Federation Admin Manual')}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('helpUserManual', 'Help & User Manual')}
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('helpCoopBannerDesc', 'Complete administrator guide for worker verification, fleet dispatching, financial audits, and demand forecasting.')}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: How this portal works */}
      <div className={`p-6 sm:p-8 rounded-2xl border flow-card ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>🔄</span>
          <span>{t('section1HowPortalWorks', '1. How this portal works')}</span>
        </h2>
        <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {t('helpCoopHowItWorksDesc', "The Cooperative Admin Portal is the federation's central command system. Administrators use this portal to verify worker credentials, oversee automated geo-dispatching, monitor fair wage disbursements, detect financial anomalies, and forecast future labor demand using predictive AI models.")}
        </p>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-3">
            {t('coreAdminFlowTitle', 'Core Administrative Flow (Step-by-Step)')}
          </h3>
          <ol className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('helpStep1WorkerCred', 'Worker Credential Verification:')}</strong> {t('helpStep1WorkerCredDesc', 'Review newly registered workers and pending trade/experience changes in the Worker Registry, then grant verified certification status.')}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('helpStep2Dispatch', 'Live Dispatch Oversight:')}</strong> {t('helpStep2DispatchDesc', 'Monitor active service bookings across municipal zones and manage high-priority emergency SOS responses.')}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('helpStep3Financial', 'Financial & Audit Management:')}</strong> {t('helpStep3FinancialDesc', 'Audit the escrow ledger, track welfare fund allocations, and investigate AI anomaly alerts to prevent fraud.')}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('helpStep4Demand', 'Demand Planning & Upskilling:')}</strong> {t('helpStep4DemandDesc', 'Use AI predictive forecasts to identify upcoming labor demand surges and schedule targeted onboarding drives.')}
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
            <span>{t('section2FeatureGuide', '2. Feature-by-feature guide')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('helpClickAccordionDesc', 'Click on any section below to see administrative controls and operational instructions.')}
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
                    <span className="text-xs font-bold text-[#ff7a00]">{isOpen ? t('hideText', 'Hide ▲') : t('readGuideText', 'Read Guide ▼')}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className={`p-4 pt-2 border-t text-xs space-y-2 ${
                    isDark ? 'border-white/[0.06] bg-black/20 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
                  }`}>
                    <div className="font-bold text-[#ff7a00] text-[11px] uppercase tracking-wider mb-1">
                      {t('adminProceduresLabel', 'Administrative Procedures:')}
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

      {/* SECTION 3: Mandatory Procedures */}
      <div className={`p-6 sm:p-8 rounded-2xl border flow-card ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>📌</span>
          <span>{t('section3MandatoryProcedures', '3. Mandatory Procedures')}</span>
        </h2>
        <ul className="space-y-2.5 text-xs">
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>{t('helpMandatory1Title', 'Review pending verifications daily:')}</strong> {t('helpMandatory1Desc', 'Clear the "Pending Verification" queue promptly so newly certified workers can immediately start accepting service requests.')}</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>{t('helpMandatory2Title', 'Check demand forecast weekly:')}</strong> {t('helpMandatory2Desc', 'Use the AI demand forecasting tool every Monday to identify which trade categories will face shortages in specific municipal zones.')}</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>{t('helpMandatory3Title', 'Investigate anomaly flags quickly:')}</strong> {t('helpMandatory3Desc', 'If an AI Anomaly is detected on a transaction, audit the job details before releasing escrow funds.')}</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>{t('helpMandatory4Title', 'Monitor emergency SOS alerts:')}</strong> {t('helpMandatory4Desc', 'Ensure emergency dispatch tickets are attended to immediately by coordinating with the local Zonal Rapid Response team.')}</span>
          </li>
        </ul>
      </div>

      {/* SECTION 4: Need more help? */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark
          ? 'bg-gradient-to-r from-orange-950/60 via-amber-950/30 to-[#12151b] border-orange-500/40 text-white shadow-[0_0_30px_rgba(255,107,0,0.15)]'
          : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 border-2 border-orange-200/90 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3.5">
          <span className={`text-3xl p-2.5 rounded-2xl shrink-0 ${
            isDark ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-white border border-orange-200 shadow-xs'
          }`}>
            🏛️
          </span>
          <div>
            <h4 className={`text-sm font-black ${isDark ? 'text-orange-300' : 'text-orange-950'}`}>{t('section4NeedMoreHelp', '4. Need more help?')}</h4>
            <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isDark ? 'text-orange-200/90' : 'text-orange-900/90'}`}>
              {t('helpContactFederationDesc', 'Contact the Central Cooperative Federation Technical Support Desk for administrative or technical assistance.')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="mailto:admin-support@sahakar.in"
            className="px-4 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            ✉️ {t('contactFedTechDesk', 'Contact Federation Tech Desk')}
          </a>
          <a
            href="tel:1800112233"
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all whitespace-nowrap border cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/10'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            📞 1800-11-2233 (Ext 4)
          </a>
        </div>
      </div>
    </div>
  )
}

