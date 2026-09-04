import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function OfficerHelp() {
  const { isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const modules = [
    {
      id: 'dashboard',
      icon: '🏛️',
      title: 'Dispute Docket & Case Queue',
      path: '/officer/dashboard',
      description: 'Statutory bench for reviewing filed worker and household disputes, inspecting evidence, and issuing binding rulings.',
      steps: [
        'Filter disputes by status ("All", "Pending", "Resolved", "Closed") or case type.',
        'Click on any Case ID to open the detailed Evidence & Adjudication Inspector.',
        'Inspect the claimant statement, uploaded documents/photos, linked Geo-Dispatch logs, and job tariff details.',
      ],
    },
    {
      id: 'cases',
      icon: '🗂️',
      title: 'Dispute Registry & Conciliation Records',
      path: '/officer/cases',
      description: 'Comprehensive historical archive of labor conciliations, wage enforcement orders, and statutory settlements.',
      steps: [
        'Search across full case database by Case ID, worker name, or household client.',
        'Review past recorded rulings and conciliation settlements.',
        'Audit compliance with statutory fair wage thresholds and safety mandates.',
      ],
    },
    {
      id: 'ruling',
      icon: '⚖️',
      title: 'Evidence Review & Binding Rulings Workflow',
      path: '/officer/dashboard',
      description: 'Step-by-step procedure for recording statutory dispute resolutions and releasing escrow funds.',
      steps: [
        'Step 1 (Evidence Audit): Inspect timestamped chats, site photos, and completion logs.',
        'Step 2 (Record Hearing Notes): Enter official conciliation findings and legal rationale into the case record.',
        'Step 3 (Select Outcome): Order full wage disbursement to worker, escrow refund to household, or split conciliation settlement.',
        'Step 4 (Submit Ruling): Click "Record Official Ruling" to execute the judgment and notify all parties.',
      ],
    },
  ]

  const faqs = [
    {
      q: 'Are rulings issued by the Labor Officer legally binding?',
      a: 'Yes. Under the cooperative dispute framework, decisions recorded by registered Labor Department Officers are binding on cooperative escrow settlements and platform standings.',
    },
    {
      q: 'How does the system ensure evidence integrity?',
      a: 'All evidence attachments (photos, chat logs, bills) and Geo-Dispatch timestamps are cryptographically anchored to prevent tampering.',
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
              <span>Labor Officer Manual</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Labor Protection Officer Adjudication Manual
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Operational standard for statutory conciliation hearings, evidence verification, dispute adjudication, and binding escrow settlement orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/officer/dashboard"
              className="flow-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>Adjudication Docket 🏛️</span>
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
            placeholder="🔍 Search adjudication procedures, evidence rules, statutory rulings..."
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
          ⚖️ Adjudication Procedures & Legal Protocols
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
                  Adjudication Step:
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
          <span>Statutory Compliance FAQs</span>
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
