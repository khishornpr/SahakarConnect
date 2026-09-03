import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'

export default function HouseholdHelp() {
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
      title: 'Dashboard & Tariff Catalog',
      desc: 'Browse standardized, fair hourly rates across all household service categories.',
      howTo: [
        'Explore verified craft categories (Electrician, Plumber, Painter, House Cleaning, Cook, Appliance Repair, etc.).',
        'Check standardized hourly rates (example: ₹180/hr Electrician, ₹160/hr Plumber) with 100% direct worker pay.',
        'View quick summaries of your current active service bookings.',
      ],
    },
    {
      id: 'book',
      icon: '✨',
      title: 'Book a Service (AI Worker Matching)',
      desc: 'Schedule a certified tradesperson matched by proximity, craft rating, and verified skills.',
      howTo: [
        '1. Select Trade: Choose the exact craft you need help with.',
        '2. Enter Details: Type your service address, preferred date and time slot, and special instructions.',
        '3. Select Matched Worker: Review recommended nearby verified workers with their ratings and past completed works.',
        '4. Confirm Booking: Click "Confirm & Dispatch Worker" to lock your request in cooperative escrow.',
      ],
    },
    {
      id: 'bookings',
      icon: '📋',
      title: 'My Bookings & Job Start OTP',
      desc: 'Track live worker arrival, manage security OTPs, and rate service quality.',
      howTo: [
        'Track Real-Time Status: Watch your booking move from "Assigned" ➡️ "En Route" ➡️ "In Progress" ➡️ "Completed".',
        '4-Digit Job Start OTP: When the worker arrives at your door, give them the 4-digit OTP shown on your booking card to authorize work commencement.',
        'Payment & Rating: When work is finished, complete your payment and leave a star rating (1 to 5 stars) with constructive feedback.',
        'Report Issue: If there is any problem, click "Report Issue" to open a dispute with a Labor Officer.',
      ],
    },
    {
      id: 'invoices',
      icon: '🧾',
      title: 'Digital Invoices & Statements',
      desc: 'Access itemized, transparent billing records with zero middleman markups.',
      howTo: [
        'View complete invoice history for all completed household service tasks.',
        'Inspect the clear breakdown of labor hours, materials, and cooperative welfare contribution.',
        'Download official PDF invoice receipts for your home records or tax filing.',
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
              <span>Customer Help & Manual</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Help & User Manual
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Everything you need to know about booking verified tradespeople, OTP verification, invoices, and support.
            </p>
          </div>

          <Link
            to="/household/book"
            className="flow-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>Book a Service ✨</span>
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
          The SahakarConnect Household Portal gives you direct access to background-verified, skilled cooperative workers at fair, standardized hourly tariffs. Your payments are protected in secure escrow, and jobs only start when you share your 4-digit arrival OTP.
        </p>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-3">
            Core Booking Flow (Step-by-Step)
          </h3>
          <ol className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Choose Trade & Schedule:</strong> Select the required service trade, enter your house address, and pick your preferred time slot.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Select Verified Worker:</strong> Choose from recommended nearby cooperative members based on ratings and completed jobs.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Provide Job Start OTP:</strong> When the worker arrives physically at your address, give them the 4-digit OTP shown on your booking screen to begin work.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Review, Pay & Rate:</strong> Once the service is finished, review the itemized time and tariff, complete the payment, and rate your experience.
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
            Click on any section below to expand detailed instructions.
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
                      How to use this feature:
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
            <span><strong>Add clear address & landmarks:</strong> Providing complete location details helps the AI match closer workers who can reach you quickly without delays.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Do not share the OTP over phone:</strong> Only give the 4-digit Job Start OTP after the worker arrives in person at your door.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Rate worker quality honestly:</strong> Your feedback directly supports honest, skilled workers and helps maintain high cooperative quality standards.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Use Report Issue for disputes:</strong> If you notice incomplete work or accidental damage, report it through the booking card immediately to freeze escrow funds for investigation.</span>
          </li>
        </ul>
      </div>

      {/* SECTION 4: Need more help? */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-transparent border border-orange-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤝</span>
          <div>
            <h4 className="text-xs font-bold text-orange-300">4. Need more help?</h4>
            <p className="text-[11px] text-orange-200/80 mt-0.5">
              Our cooperative customer service desk is available to assist you with bookings, invoices, or service feedback.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="mailto:support@sahakar.in"
            className="px-4 py-2 bg-[#ff6b00] hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
          >
            ✉️ Email Support
          </a>
          <a
            href="tel:1800112233"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap border border-white/10"
          >
            📞 1800-11-2233
          </a>
        </div>
      </div>
    </div>
  )
}
