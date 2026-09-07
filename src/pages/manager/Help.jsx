import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'

export default function ManagerHelp() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const modules = [
    {
      id: 'dashboard',
      icon: '👔',
      title: t('helpMgrModDashTitle', 'Zonal Command Dashboard'),
      path: '/manager/dashboard',
      description: t('helpMgrModDashDesc', 'Regional operational overview tracking active on-duty workers, live dispatches, dispute cases, and welfare fund health.'),
      steps: [
        t('helpMgrModDashStep1', 'Review real-time municipal metrics: Active Team Capacity, Completed Dispatches, and Escalated Grievances.'),
        t('helpMgrModDashStep2', 'Monitor regional customer ratings and worker satisfaction indices.'),
        t('helpMgrModDashStep3', 'Use quick action buttons to dispatch field support or review open labor dockets.'),
      ],
    },
    {
      id: 'workers',
      icon: '👥',
      title: t('helpMgrModWorkersTitle', 'Team Roster & Field Operations'),
      path: '/manager/workers',
      description: t('helpMgrModWorkersDesc', 'Supervise assigned zonal workers, verify on-duty presence, evaluate performance metrics, and track KYC credentials.'),
      steps: [
        t('helpMgrModWorkersStep1', 'Filter zonal workforce by trade specialization and locality.'),
        t('helpMgrModWorkersStep2', 'Inspect worker completed job statistics, client ratings (★), and verification statuses.'),
        t('helpMgrModWorkersStep3', 'Assign training interventions to workers with quality or timeliness flags.'),
      ],
    },
    {
      id: 'reports',
      icon: '📑',
      title: t('helpMgrModReportsTitle', 'Zonal Financial & Audit Reports'),
      path: '/manager/reports',
      description: t('helpMgrModReportsDesc', 'Generate itemized wage distribution summaries, dispute compensation payouts, and quarterly compliance reports.'),
      steps: [
        t('helpMgrModReportsStep1', 'Review zone-wide GMV, wage disbursements, and 2% welfare fund allocations.'),
        t('helpMgrModReportsStep2', 'Track conciliation payouts ordered by the Labor Protection Officer.'),
        t('helpMgrModReportsStep3', 'Export verifiable PDF and spreadsheet reports for municipal labor audits.'),
      ],
    },
    {
      id: 'sos',
      icon: '🚨',
      title: t('helpMgrModSosTitle', 'Rapid Emergency Response Protocol'),
      path: null,
      description: t('helpMgrModSosDesc', 'Handle high-priority field incidents, worker distress signals, or urgent customer safety escalations.'),
      steps: [
        t('helpMgrModSosStep1', 'Respond immediately to incoming Emergency SOS tickets with live GPS coordinates.'),
        t('helpMgrModSosStep2', 'Deploy the nearest Zonal Support Vehicle or contact local emergency authorities.'),
        t('helpMgrModSosStep3', 'Log incident reports and update the Labor Department Officer bench.'),
      ],
    },
  ]

  const faqs = [
    {
      q: t('helpMgrFaq1Q', 'How do I resolve on-site worker disputes before statutory escalation?'),
      a: t('helpMgrFaq1A', 'Zonal Managers can act as conciliation mediators for minor disputes. If the issue involves non-payment or safety violations, it must be referred to the official Labor Department Officer docket.'),
    },
    {
      q: t('helpMgrFaq2Q', 'How are zonal welfare funds disbursed to workers?'),
      a: t('helpMgrFaq2A', 'Welfare disbursements (medical advance, tool grants) are approved jointly by the Zonal Manager and Federation Admin based on verified tenure and contribution history.'),
    },
  ]

  const filtered = modules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flow-card p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-[#ff6b00]/30 glow-orange-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-[#ff6b00]/15 text-[#ff7a00] border border-[#ff6b00]/30">
              <span>📖</span>
              <span>{t('managerManualTag', 'Manager Operations Manual')}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('managerHandbookTitle', 'Zonal Manager Operating Handbook')}
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('managerHandbookDesc', 'Standard operational procedures for field team supervision, emergency response management, and regional financial reporting.')}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchMgrProtocolsPlaceholder', '🔍 Search zonal protocols, worker roster oversight, emergency response...')}
            className={`w-full px-4 py-3 rounded-xl text-xs font-semibold outline-none border transition-all ${
              isDark
                ? 'bg-[#12151c] border-white/[0.1] text-white focus:border-[#ff6b00] shadow-inner'
                : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00] shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* Module Overview Grid */}
      <div>
        <h2 className={`text-lg font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📋 {t('managerToolsAndWorkflows', 'Zonal Manager Tools & Workflows')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`p-5 rounded-2xl border transition-all flow-card glow-orange-hover space-y-3 ${
                isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">{m.icon}</span>
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.description}</p>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-black/30 border-white/[0.05]' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff7a00]">
                  {t('operatingProtocolLabel', 'Operating Protocol:')}
                </div>
                <ul className="space-y-1">
                  {m.steps.map((step, idx) => (
                    <li key={idx} className={`text-[11px] flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-[#ff7a00] font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className={`p-6 rounded-2xl border flow-card ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-base font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>❓</span>
          <span>{t('managerFaqsTitle', 'Manager Operations FAQs')}</span>
        </h2>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isDark ? 'border-white/[0.06] bg-black/20' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left text-xs font-bold flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>{faq.q}</span>
                  <span className="text-[#ff7a00] text-sm">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className={`p-3.5 pt-0 text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Need more help? */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark
          ? 'bg-gradient-to-r from-orange-950/60 via-amber-950/30 to-[#12151b] border-orange-500/40 text-white shadow-[0_0_30px_rgba(255,107,0,0.15)]'
          : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 border-2 border-orange-200/90 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3.5">
          <span className={`text-3xl p-2.5 rounded-2xl shrink-0 ${
            isDark ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-white border border-orange-200 shadow-xs'
          }`}>
            👔
          </span>
          <div>
            <h4 className={`text-sm font-black ${isDark ? 'text-orange-300' : 'text-orange-950'}`}>{t('needMoreHelpZonalOps', 'Need more help with zonal operations?')}</h4>
            <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isDark ? 'text-orange-200/90' : 'text-orange-900/90'}`}>
              {t('needMoreHelpZonalOpsDesc', 'Contact the Central Cooperative Federation Operations Hotline or submit an escalated zonal inquiry.')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="mailto:operations@sahakar.in"
            className="px-4 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            ✉️ {t('emailOpsDesk', 'Email Operations Desk')}
          </a>
          <a
            href="tel:1800112233"
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all whitespace-nowrap border cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/10'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            📞 1800-11-2233 (Ext 3)
          </a>
        </div>
      </div>
    </div>
  )
}

