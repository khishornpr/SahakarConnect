import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerHelp() {
  const { isDark } = useTheme()
  const [openSection, setOpenSection] = useState(null)

  const toggleAccordion = (id) => {
    setOpenSection(openSection === id ? null : id)
  }

  const features = [
    {
      id: 'dashboard',
      icon: '📊',
      title: 'Dashboard (Overview)',
      desc: 'Your main screen for daily summary and quick actions.',
      howTo: [
        'See your earnings for today, total jobs completed, trust rating, and welfare fund balance at a glance.',
        'View your next upcoming job right from the top card.',
        'Use quick buttons to jump directly to your active jobs, payment history, or welfare plan.',
      ],
    },
    {
      id: 'jobs',
      icon: '⚡',
      title: 'Active Jobs & Job Lifecycle',
      desc: 'Where you receive, manage, and complete service requests.',
      howTo: [
        '1. View New Jobs: Check the customer name, address, scheduled time, and estimated pay.',
        '2. Accept Job: Click "Accept Job" to confirm you will do the work.',
        '3. On the Way: Click "On the Way" when you start traveling so the customer knows you are coming.',
        '4. Start Work (OTP Required): When you reach the customer’s house, ask them for their 4-digit Job Start OTP and enter it in the app to start the timer.',
        '5. Mark Complete: When finished, click "Mark Complete", rate the customer, and the payment is credited instantly to your wage ledger.',
      ],
    },
    {
      id: 'earnings',
      icon: '💰',
      title: 'Wage Ledger & Payouts',
      desc: 'Track every rupee you earn with full transparency and zero hidden cuts.',
      howTo: [
        'View a complete list of your past completed jobs with exact payout amounts.',
        'See the transparent 100% wage breakdown — zero platform commission taken.',
        'See your 2% contribution to the collective welfare fund that covers your insurance.',
        'Download GST-ready payment slips and invoices for your records.',
      ],
    },
    {
      id: 'profile',
      icon: '👤',
      title: 'Skill Profile & Trade Verification',
      desc: 'Manage your craft specialization and experience level.',
      howTo: [
        'Click "Edit Trade" to update your primary trade (example: Electrician, Plumber, Painter).',
        'Set your accurate experience in both Years and Months.',
        'When you save a new trade, your profile will show "⏳ Verification in Progress" until the cooperative admin reviews and approves your credentials.',
        'Once approved, your profile will display "✓ Verified", helping you get more job matches.',
      ],
    },
    {
      id: 'complaints',
      icon: '⚖️',
      title: 'Grievances & Labor Redressal',
      desc: 'Report payment issues, unsafe conditions, or customer disputes to official Labor Officers.',
      howTo: [
        'Click "+ Raise Complaint" to start a new dispute report.',
        'Choose the issue type: Non-Payment, Unsafe Job Site, Customer Dispute, or Harassment.',
        'Attach evidence if available (acceptable file formats: TXT, DOC, DOCX, PDF, PNG, JPEG, JPG).',
        'Submit to get a tracking Case ID. A Zonal Labor Officer will review and resolve the issue.',
      ],
    },
    {
      id: 'learning',
      icon: '🎓',
      title: 'Learning & Upskilling Academy',
      desc: 'Learn new skills, safety practices, and customer communication to earn badges.',
      howTo: [
        'Browse short, easy-to-follow video lessons and practical craft tutorials.',
        'Take quick quizzes after each module to test your knowledge.',
        'Earn skill certificates that appear on your profile to boost your priority for higher-paying jobs.',
      ],
    },
    {
      id: 'welfare',
      icon: '🛡️',
      title: 'Welfare & Insurance Coverage',
      desc: 'Access your social security and medical safety net provided by the cooperative.',
      howTo: [
        'Check your accidental and health insurance policy active status.',
        'View your accumulated welfare balance and pension contributions.',
        'Apply for emergency medical advance assistance when in need.',
      ],
    },
    {
      id: 'sos',
      icon: '🚨',
      title: 'Emergency Rapid Response',
      desc: 'Quick emergency protocol for on-site accidents, medical issues, or physical hazards.',
      howTo: [
        'Contact the 24/7 Zonal Co-op Emergency Rapid Response desk via Welfare & Insurance.',
        'Select the emergency type (Medical Emergency, Physical Threat, or Severe Site Hazard).',
        'Your live GPS coordinates and service logs are prioritized immediately by the Zonal Safety Officer.',
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
              <span>Worker Portal User Manual</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Help & User Manual
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Simple, step-by-step instructions on how to use every feature in your SahakarConnect Worker Portal.
            </p>
          </div>

          <Link
            to="/worker/dashboard"
            className="flow-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>Go to Dashboard 📊</span>
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
          The SahakarConnect Worker Portal connects you directly to nearby household customers without any middlemen taking a cut of your earnings. You receive job requests, verify work on-site with secure OTPs, get paid instantly to your wage ledger, and access collective social security welfare.
        </p>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-3">
            Core Daily Workflow (Step-by-Step)
          </h3>
          <ol className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Receive & Accept Job:</strong> Check incoming requests under <em>Active Jobs</em> with location and pay details, then click Accept.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Travel to Site:</strong> Tap "On the Way" so the household can see your live arrival status.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Enter Job Start OTP:</strong> When you arrive at the home, ask the customer for their 4-digit code and enter it to start work.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Complete Work & Instant Pay:</strong> Mark the job complete. 100% of your earnings are credited immediately to your Wage Ledger with zero platform commission.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Build Reputation & Upskill:</strong> Maintain high ratings, complete academy lessons, and keep your trade profile verified to get premium high-paying jobs.
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
            Click on any section below to see what it does and how to use it.
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
                      How to use this page:
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

      {/* SECTION 3: Mandatory Requirements */}
      <div className={`p-6 sm:p-8 rounded-2xl border flow-card ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span>📌</span>
          <span>3. Mandatory Requirements</span>
        </h2>
        <ul className="space-y-2.5 text-xs">
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Always get the OTP before working:</strong> Never start physical labor without the customer providing their 4-digit Job Start OTP — it guarantees your job record and insurance protection.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Keep skill details accurate:</strong> Make sure your primary trade and exact years/months of experience are up to date so the AI dispatcher routes matching jobs to you.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>Complete Academy Lessons:</strong> Workers who finish skill modules receive verified badges and receive priority in the high-demand job queue.</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>File disputes immediately:</strong> If a customer refuses payment or creates an unsafe environment, submit a complaint under the <em>Grievances</em> tab right away with photos or message receipts.</span>
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
              Contact your local Zonal Cooperative Federation Office or reach out to our dedicated support helpline.
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
