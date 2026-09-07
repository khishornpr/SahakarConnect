import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'

export default function WorkerHelp() {
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
      title: t('helpWorkerFeatDashTitle', 'Dashboard (Overview)'),
      desc: t('helpWorkerFeatDashDesc', 'Your main screen for daily summary and quick actions.'),
      howTo: [
        t('helpWorkerFeatDashStep1', 'See your earnings for today, total jobs completed, trust rating, and welfare fund balance at a glance.'),
        t('helpWorkerFeatDashStep2', 'View your next upcoming job right from the top card.'),
        t('helpWorkerFeatDashStep3', 'Use quick buttons to jump directly to your active jobs, payment history, or welfare plan.'),
      ],
    },
    {
      id: 'jobs',
      icon: '⚡',
      title: t('helpWorkerFeatJobsTitle', 'Active Jobs & Job Lifecycle'),
      desc: t('helpWorkerFeatJobsDesc', 'Where you receive, manage, and complete service requests.'),
      howTo: [
        t('helpWorkerFeatJobsStep1', '1. View New Jobs: Check the customer name, address, scheduled time, and estimated pay.'),
        t('helpWorkerFeatJobsStep2', '2. Accept Job: Click "Accept Job" to confirm you will do the work.'),
        t('helpWorkerFeatJobsStep3', '3. On the Way: Click "On the Way" when you start traveling so the customer knows you are coming.'),
        t('helpWorkerFeatJobsStep4', '4. Start Work (OTP Required): When you reach the customer’s house, ask them for their 4-digit Job Start OTP and enter it in the app to start the timer.'),
        t('helpWorkerFeatJobsStep5', '5. Mark Complete: When finished, click "Mark Complete", rate the customer, and the payment is credited instantly to your wage ledger.'),
      ],
    },
    {
      id: 'earnings',
      icon: '💰',
      title: t('helpWorkerFeatEarningsTitle', 'Wage Ledger & Payouts'),
      desc: t('helpWorkerFeatEarningsDesc', 'Track every rupee you earn with full transparency and zero hidden cuts.'),
      howTo: [
        t('helpWorkerFeatEarningsStep1', 'View a complete list of your past completed jobs with exact payout amounts.'),
        t('helpWorkerFeatEarningsStep2', 'See the transparent 100% wage breakdown — zero platform commission taken.'),
        t('helpWorkerFeatEarningsStep3', 'See your 2% contribution to the collective welfare fund that covers your insurance.'),
        t('helpWorkerFeatEarningsStep4', 'Download GST-ready payment slips and invoices for your records.'),
      ],
    },
    {
      id: 'profile',
      icon: '👤',
      title: t('helpWorkerFeatProfileTitle', 'Skill Profile & Trade Verification'),
      desc: t('helpWorkerFeatProfileDesc', 'Manage your craft specialization and experience level.'),
      howTo: [
        t('helpWorkerFeatProfileStep1', 'Click "Edit Trade" to update your primary trade (example: Electrician, Plumber, Painter).'),
        t('helpWorkerFeatProfileStep2', 'Set your accurate experience in both Years and Months.'),
        t('helpWorkerFeatProfileStep3', 'When you save a new trade, your profile will show "⏳ Verification in Progress" until the cooperative admin reviews and approves your credentials.'),
        t('helpWorkerFeatProfileStep4', 'Once approved, your profile will display "✓ Verified", helping you get more job matches.'),
      ],
    },
    {
      id: 'complaints',
      icon: '⚖️',
      title: t('helpWorkerFeatComplaintsTitle', 'Grievances & Labor Redressal'),
      desc: t('helpWorkerFeatComplaintsDesc', 'Report payment issues, unsafe conditions, or customer disputes to official Labor Officers.'),
      howTo: [
        t('helpWorkerFeatComplaintsStep1', 'Click "+ Raise Complaint" to start a new dispute report.'),
        t('helpWorkerFeatComplaintsStep2', 'Choose the issue type: Non-Payment, Unsafe Job Site, Customer Dispute, or Harassment.'),
        t('helpWorkerFeatComplaintsStep3', 'Attach evidence if available (acceptable file formats: TXT, DOC, DOCX, PDF, PNG, JPEG, JPG).'),
        t('helpWorkerFeatComplaintsStep4', 'Submit to get a tracking Case ID. A Zonal Labor Officer will review and resolve the issue.'),
      ],
    },
    {
      id: 'learning',
      icon: '🎓',
      title: t('helpWorkerFeatLearningTitle', 'Learning & Upskilling Academy'),
      desc: t('helpWorkerFeatLearningDesc', 'Learn new skills, safety practices, and customer communication to earn badges.'),
      howTo: [
        t('helpWorkerFeatLearningStep1', 'Browse short, easy-to-follow video lessons and practical craft tutorials.'),
        t('helpWorkerFeatLearningStep2', 'Take quick quizzes after each module to test your knowledge.'),
        t('helpWorkerFeatLearningStep3', 'Earn skill certificates that appear on your profile to boost your priority for higher-paying jobs.'),
      ],
    },
    {
      id: 'welfare',
      icon: '🛡️',
      title: t('helpWorkerFeatWelfareTitle', 'Welfare & Insurance Coverage'),
      desc: t('helpWorkerFeatWelfareDesc', 'Access your social security and medical safety net provided by the cooperative.'),
      howTo: [
        t('helpWorkerFeatWelfareStep1', 'Check your accidental and health insurance policy active status.'),
        t('helpWorkerFeatWelfareStep2', 'View your accumulated welfare balance and pension contributions.'),
        t('helpWorkerFeatWelfareStep3', 'Apply for emergency medical advance assistance when in need.'),
      ],
    },
    {
      id: 'sos',
      icon: '🚨',
      title: t('helpWorkerFeatSosTitle', 'Emergency Rapid Response'),
      desc: t('helpWorkerFeatSosDesc', 'Quick emergency protocol for on-site accidents, medical issues, or physical hazards.'),
      howTo: [
        t('helpWorkerFeatSosStep1', 'Contact the 24/7 Zonal Co-op Emergency Rapid Response desk via Welfare & Insurance.'),
        t('helpWorkerFeatSosStep2', 'Select the emergency type (Medical Emergency, Physical Threat, or Severe Site Hazard).'),
        t('helpWorkerFeatSosStep3', 'Your live GPS coordinates and service logs are prioritized immediately by the Zonal Safety Officer.'),
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
              <span>{t('workerManualTag', 'Worker Portal User Manual')}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('helpUserManual', 'Help & User Manual')}
            </h1>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('workerManualDesc', 'Simple, step-by-step instructions on how to use every feature in your SahakarConnect Worker Portal.')}
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
          {t('workerHowItWorksDesc', 'The SahakarConnect Worker Portal connects you directly to nearby household customers without any middlemen taking a cut of your earnings. You receive job requests, verify work on-site with secure OTPs, get paid instantly to your wage ledger, and access collective social security welfare.')}
        </p>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-3">
            {t('coreDailyWorkflowTitle', 'Core Daily Workflow (Step-by-Step)')}
          </h3>
          <ol className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('workerFlowStep1Title', 'Receive & Accept Job:')}</strong> {t('workerFlowStep1Desc', 'Check incoming requests under Active Jobs with location and pay details, then click Accept.')}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('workerFlowStep2Title', 'Travel to Site:')}</strong> {t('workerFlowStep2Desc', 'Tap "On the Way" so the household can see your live arrival status.')}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('workerFlowStep3Title', 'Enter Job Start OTP:')}</strong> {t('workerFlowStep3Desc', 'When you arrive at the home, ask the customer for their 4-digit code and enter it to start work.')}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('workerFlowStep4Title', 'Complete Work & Instant Pay:')}</strong> {t('workerFlowStep4Desc', 'Mark the job complete. 100% of your earnings are credited immediately to your Wage Ledger with zero platform commission.')}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#ff6b00] text-white font-black text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t('workerFlowStep5Title', 'Build Reputation & Upskill:')}</strong> {t('workerFlowStep5Desc', 'Maintain high ratings, complete academy lessons, and keep your trade profile verified to get premium high-paying jobs.')}
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
            {t('helpHouseholdClickAccordionDesc', 'Click on any section below to see what it does and how to use it.')}
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
                      {t('howToUseThisPageLabel', 'How to use this page:')}
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
            <span><strong>{t('workerMandatory1Title', 'Always get the OTP before working:')}</strong> {t('workerMandatory1Desc', 'Never start physical labor without the customer providing their 4-digit Job Start OTP — it guarantees your job record and insurance protection.')}</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>{t('workerMandatory2Title', 'Keep skill details accurate:')}</strong> {t('workerMandatory2Desc', 'Make sure your primary trade and exact years/months of experience are up to date so the AI dispatcher routes matching jobs to you.')}</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>{t('workerMandatory3Title', 'Complete Academy Lessons:')}</strong> {t('workerMandatory3Desc', 'Workers who finish skill modules receive verified badges and receive priority in the high-demand job queue.')}</span>
          </li>
          <li className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-[#ff7a00] font-bold text-sm">•</span>
            <span><strong>{t('workerMandatory4Title', 'File disputes immediately:')}</strong> {t('workerMandatory4Desc', 'If a customer refuses payment or creates an unsafe environment, submit a complaint under the Grievances tab right away with photos or message receipts.')}</span>
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
            🤝
          </span>
          <div>
            <h4 className={`text-sm font-black ${isDark ? 'text-orange-300' : 'text-orange-950'}`}>{t('section4NeedMoreHelp', '4. Need more help?')}</h4>
            <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isDark ? 'text-orange-200/90' : 'text-orange-900/90'}`}>
              {t('workerNeedMoreHelpDesc', 'Contact your local Zonal Cooperative Federation Office or reach out to our dedicated support helpline.')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="mailto:support@sahakar.in"
            className="px-4 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-black shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            ✉️ {t('emailSupport', 'Email Support')}
          </a>
          <a
            href="tel:1800112233"
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all whitespace-nowrap border cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/10'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            📞 1800-11-2233
          </a>
        </div>
      </div>
    </div>
  )
}

