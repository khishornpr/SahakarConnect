import { useState } from 'react'
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
            ⚖️
          </span>
          <div>
            <h4 className={`text-sm font-black ${isDark ? 'text-orange-300' : 'text-orange-950'}`}>Need more help with statutory rulings?</h4>
            <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isDark ? 'text-orange-200/90' : 'text-orange-900/90'}`}>
              Contact the State Labor Commissioner Secretariat or platform technical legal counsel.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="mailto:legal-officer@sahakar.in"
            className="px-4 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            ✉️ Email Legal Desk
          </a>
          <a
            href="tel:1800112233"
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all whitespace-nowrap border cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/10'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            📞 1800-11-2233 (Ext 2)
          </a>
        </div>
      </div>
    </div>
  )
}
