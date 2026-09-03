import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      title: 'Zonal Command Dashboard',
      path: '/manager/dashboard',
      description: 'Regional operational overview tracking active on-duty workers, live dispatches, dispute cases, and welfare fund health.',
      steps: [
        'Review real-time municipal metrics: Active Team Capacity, Completed Dispatches, and Escalated Grievances.',
        'Monitor regional customer ratings and worker satisfaction indices.',
        'Use quick action buttons to dispatch field support or review open labor dockets.',
      ],
    },
    {
      id: 'workers',
      icon: '👥',
      title: 'Team Roster & Field Operations',
      path: '/manager/workers',
      description: 'Supervise assigned zonal workers, verify on-duty presence, evaluate performance metrics, and track KYC credentials.',
      steps: [
        'Filter zonal workforce by trade specialization and locality.',
        'Inspect worker completed job statistics, client ratings (★), and verification statuses.',
        'Assign training interventions to workers with quality or timeliness flags.',
      ],
    },
    {
      id: 'reports',
      icon: '📑',
      title: 'Zonal Financial & Audit Reports',
      path: '/manager/reports',
      description: 'Generate itemized wage distribution summaries, dispute compensation payouts, and quarterly compliance reports.',
      steps: [
        'Review zone-wide GMV, wage disbursements, and 2% welfare fund allocations.',
        'Track conciliation payouts ordered by the Labor Protection Officer.',
        'Export verifiable PDF and spreadsheet reports for municipal labor audits.',
      ],
    },
    {
      id: 'sos',
      icon: '🚨',
      title: 'Rapid Emergency Response Protocol',
      path: null,
      description: 'Handle high-priority field incidents, worker distress signals, or urgent customer safety escalations.',
      steps: [
        'Respond immediately to incoming Emergency SOS tickets with live GPS coordinates.',
        'Deploy the nearest Zonal Support Vehicle or contact local emergency authorities.',
        'Log incident reports and update the Labor Department Officer bench.',
      ],
    },
  ]

  const faqs = [
    {
      q: 'How do I resolve on-site worker disputes before statutory escalation?',
      a: 'Zonal Managers can act as conciliation mediators for minor disputes. If the issue involves non-payment or safety violations, it must be referred to the official Labor Department Officer docket.',
    },
    {
      q: 'How are zonal welfare funds disbursed to workers?',
      a: 'Welfare disbursements (medical advance, tool grants) are approved jointly by the Zonal Manager and Federation Admin based on verified tenure and contribution history.',
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
              <span>Manager Operations Manual</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Zonal Manager Operating Handbook
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Standard operational procedures for field team supervision, emergency response management, and regional financial reporting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/manager/dashboard"
              className="flow-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>Manager Dashboard 👔</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search zonal protocols, worker roster oversight, emergency response..."
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
          📋 Zonal Manager Tools & Workflows
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
                {m.path && (
                  <Link
                    to={m.path}
                    className="text-[11px] font-bold text-[#ff7a00] hover:underline shrink-0"
                  >
                    Open ↗
                  </Link>
                )}
              </div>

              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-black/30 border-white/[0.05]' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff7a00]">
                  Operating Protocol:
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
          <span>Manager Operations FAQs</span>
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
    </div>
  )
}
