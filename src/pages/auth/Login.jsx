import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import LanguageToggle from '../../components/LanguageToggle'
import ThemeToggle from '../../components/ThemeToggle'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('worker')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isUnconfirmed, setIsUnconfirmed] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  const { signIn, resendVerification } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  // Role metadata and demo hints
  const ROLE_CONFIGS = {
    worker: {
      id: 'worker',
      label: `⚡ ${t('workerRole', 'Worker')}`,
      demoEmail: 'ramesh.worker@sahakar.in',
      hint: 'Ramesh Kumar (Electrician)',
    },
    household: {
      id: 'household',
      label: `🏡 ${t('customerRole', 'Customer')}`,
      demoEmail: 'priya.customer@sahakar.in',
      hint: 'Priya Sharma (Household)',
    },
    cooperative: {
      id: 'cooperative',
      label: `🏛️ ${t('coopAdminRole', 'Co-op Admin')}`,
      demoEmail: 'admin@delhicoop.in',
      hint: 'Meena Iyer (Co-op Officer)',
    },
    manager: {
      id: 'manager',
      label: '👔 Manager',
      demoEmail: 'manager.delhi@sahakar.in',
      hint: 'Rajiv Deshmukh (Zonal Manager)',
    },
    officer: {
      id: 'officer',
      label: '⚖️ Labor Officer',
      demoEmail: 'officer.delhi@gov.in',
      hint: 'Sanjay Verma (Labor Officer)',
    },
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResendStatus('')
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.')
      return
    }
    setLoading(true)
    const { error, isUnconfirmed: unconfirmedFlag } = await signIn(email.trim(), password)
    setLoading(false)
    if (error) {
      if (unconfirmedFlag || error.message?.toLowerCase().includes('email not confirmed')) {
        setIsUnconfirmed(true)
        setError('Please verify your email before logging in. Check your inbox or click below to resend the confirmation link.')
      } else {
        setIsUnconfirmed(false)
        setError(error.message || 'Invalid email or password. Please try again.')
      }
    } else {
      navigate('/')
    }
  }

  async function handleResendConfirmation() {
    if (!email) return
    setResendStatus('Resending confirmation email...')
    try {
      const { error } = await resendVerification(email.trim())
      if (error) {
        setResendStatus(`Failed: ${error.message}`)
      } else {
        setResendStatus('✅ Verification email sent! Please check your inbox.')
      }
    } catch {
      setResendStatus('Failed to resend confirmation email.')
    }
  }

  function handleSelectRoleTab(roleType) {
    setSelectedRole(roleType)
    setError('')
    // Only switch the active role tab - do NOT automatically login
  }

  function handleFillDemoCredentials(demoEmail) {
    setEmail(demoEmail)
    setPassword('demo123')
    setError('')
  }

  return (
    <div className="w-full relative font-sans select-none">
      {/* ========================================================================= */}
      {/*                     DESKTOP LAYOUT (md breakpoint and up)                 */}
      {/* ========================================================================= */}
      <div className="hidden md:flex h-screen max-h-screen w-full relative flex-col justify-between overflow-hidden">
        {/* Full-Screen Immersive Panoramic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src={isDark ? '/login-bg-dark.jpg' : '/login-bg-light.jpg'}
            alt="Luxury Architectural Panoramic Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Ambient Contrast Overlay */}
          {isDark ? (
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/80 backdrop-brightness-[0.88]"></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-white/85 backdrop-brightness-[0.98]"></div>
          )}
        </div>

        {/* Desktop Top Navbar */}
        <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-3 sm:pt-4 pb-1 flex items-center justify-between shrink-0">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border backdrop-blur-xl flex items-center justify-center shadow-lg transition-all ${isDark
                ? 'bg-black/60 border-white/20 text-[#e5a65e] shadow-[0_0_20px_rgba(229,166,94,0.3)]'
                : 'bg-white/90 border-slate-300 text-[#d8964d]'
                }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M12 12L3 7M12 12l9-5" />
              </svg>
            </div>
            <div>
              <span
                className={`text-xs sm:text-sm font-black tracking-[0.25em] uppercase drop-shadow-sm block ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                {t('brandTitle', 'SAHAKARCONNECT')}
              </span>
              <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('loginSubHeader', 'SIH26089 • Cooperative Service Marketplace')}
              </span>
            </div>
          </div>

          {/* Floating Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </header>

        {/* Desktop Main Viewport Content */}
        <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 py-2 sm:py-4 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center overflow-hidden">
          {/* Left Side: Welcome Typography & Cooperative Badges */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-7">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-3 h-32 sm:h-52 bg-gradient-to-b from-[#e5a65e] via-[#d8964d] to-transparent rounded-full shadow-[0_0_18px_rgba(229,166,94,0.75)] shrink-0 mt-1"></div>
              <div>
                <h1
                  className={`text-5xl sm:text-7xl lg:text-7xl xl:text-8xl font-light tracking-tight leading-[1.02] ${isDark ? 'text-white drop-shadow-lg' : 'text-slate-900'
                    }`}
                >
                  {t('welcome', 'Welcome')}<br />
                  <strong className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {t('back', 'Back')}
                  </strong>
                </h1>
                <p
                  className={`text-lg sm:text-2xl lg:text-3xl mt-4 sm:mt-5 max-w-xl leading-snug font-normal ${isDark ? 'text-slate-100 drop-shadow-sm' : 'text-slate-800'
                    }`}
                >
                  {t('loginHeroGreeting', 'Glad to see you again.')}<br />
                  <span className="font-semibold text-[#e5a65e]">{t('loginHeroSub', "Let's continue where you left off.")}</span>
                </p>
              </div>
            </div>

            {/* Quick Highlight Chips */}
            <div className="flex flex-wrap gap-3 pt-1 pl-0 sm:pl-9">
              <span
                className={`px-4 py-2 rounded-full text-sm sm:text-base font-bold border backdrop-blur-md flex items-center gap-2 ${isDark
                  ? 'bg-black/50 border-white/10 text-slate-100 shadow-md'
                  : 'bg-white/85 border-slate-300 text-slate-800 shadow-sm'
                  }`}
              >
                <span className="text-base sm:text-lg">⚡</span> {t('statutoryFairWageChip', '100% Fair Wages')}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm sm:text-base font-bold border backdrop-blur-md flex items-center gap-2 ${isDark
                  ? 'bg-black/50 border-white/10 text-emerald-300 shadow-md'
                  : 'bg-white/85 border-slate-300 text-emerald-800 shadow-sm'
                  }`}
              >
                <span className="text-base sm:text-lg">🛡️</span> {t('societyWelfareFundChip', 'Worker Welfare & Safety')}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm sm:text-base font-bold border backdrop-blur-md flex items-center gap-2 ${isDark
                  ? 'bg-black/50 border-white/10 text-[#e5a65e] shadow-md'
                  : 'bg-white/85 border-slate-300 text-orange-800 shadow-sm'
                  }`}
              >
                <span className="text-base sm:text-lg">📍</span> {t('aiGeoDispatchChip', 'Fast Local Matching')}
              </span>
            </div>
          </div>

          {/* Right Side: Floating Glassmorphic Login Card */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
            <div
              className={`w-full max-w-[430px] border rounded-2xl sm:rounded-3xl p-4 sm:p-5 backdrop-blur-2xl transition-all duration-300 ${
                isDark
                  ? 'bg-[#12151c]/90 border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.85)] hover:border-[#e5a65e]/40'
                  : 'bg-white/92 border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:border-orange-300'
              }`}
            >
              {/* Header: Icon at Top-Left, Login text Center */}
              <div className="relative mb-3 flex items-center justify-center min-h-[40px]">
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${isDark
                    ? 'bg-[#1e232e] border-white/[0.1] text-[#e5a65e] shadow-[0_0_15px_rgba(229,166,94,0.25)]'
                    : 'bg-orange-50 border-orange-200 text-[#d8964d] shadow-sm'
                    }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M12 12L3 7M12 12l9-5" />
                  </svg>
                </div>

                <div className="text-center px-10">
                  <h2 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('loginTitle', 'Login')}
                  </h2>
                  <p className={`text-xs mt-0.5 truncate font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('loginSubtitle', 'Select persona & enter credentials')}
                  </p>
                </div>
              </div>

              {/* Persona Switcher Tabs */}
              <div className="space-y-1.5">
                <div
                  className={`p-1 border rounded-xl grid grid-cols-3 gap-1 ${
                    isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-100/90 border-slate-200'
                  }`}
                >
                  {[ROLE_CONFIGS.worker, ROLE_CONFIGS.household, ROLE_CONFIGS.cooperative].map((p) => {
                    const isActive = selectedRole === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-selected={isActive ? 'true' : undefined}
                        data-selected={isActive ? 'true' : undefined}
                        onClick={() => !isActive && handleSelectRoleTab(p.id)}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#e8b070] to-[#d8964d] text-slate-950 shadow-sm cursor-default'
                            : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-white/[0.06] hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(232,176,112,0.35)] cursor-pointer'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-white hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(216,150,77,0.35)] cursor-pointer'
                        }`}
                      >
                        <span className="truncate">{p.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div
                  className={`p-1 border rounded-xl grid grid-cols-2 gap-1 ${
                    isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-100/90 border-slate-200'
                  }`}
                >
                  {[ROLE_CONFIGS.manager, ROLE_CONFIGS.officer].map((p) => {
                    const isActive = selectedRole === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-selected={isActive ? 'true' : undefined}
                        data-selected={isActive ? 'true' : undefined}
                        onClick={() => !isActive && handleSelectRoleTab(p.id)}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#e8b070] to-[#d8964d] text-slate-950 shadow-sm cursor-default'
                            : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-white/[0.06] hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(232,176,112,0.35)] cursor-pointer'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-white hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(216,150,77,0.35)] cursor-pointer'
                        }`}
                      >
                        <span className="truncate">{p.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Desktop Demo Credential Auto-Fill Card */}
              <div
                className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                  isDark
                    ? 'bg-[#181d26]/80 border-white/[0.08] shadow-inner'
                    : 'bg-orange-50/70 border-orange-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 border ${
                      isDark
                        ? 'bg-[#12151c] border-white/[0.08] text-[#e8b070]'
                        : 'bg-white border-orange-200 text-orange-600'
                    }`}
                  >
                    ⚡
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {ROLE_CONFIGS[selectedRole]?.hint}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {ROLE_CONFIGS[selectedRole]?.demoEmail}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFillDemoCredentials(ROLE_CONFIGS[selectedRole]?.demoEmail)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                    isDark
                      ? 'bg-[#e8b070]/15 border-[#e8b070]/40 text-[#e8b070] hover:bg-[#e8b070]/25 shadow-sm'
                      : 'bg-[#d8964d] border-[#c4833b] text-slate-950 hover:bg-[#c4833b] shadow-xs'
                  }`}
                >
                  Auto-Fill ⚡
                </button>
              </div>

              {/* Desktop Error Message & Email Unconfirmed Banner */}
              {error && (
                <div
                  className={`mt-2.5 border text-xs p-2.5 rounded-xl shadow-md transition-all ${isUnconfirmed
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm leading-none">{isUnconfirmed ? '✉️' : '⚠️'}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{error}</p>

                      {isUnconfirmed && (
                        <div className="mt-2 pt-1.5 border-t border-amber-500/30 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={handleResendConfirmation}
                            className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
                          >
                            Resend Confirmation Email →
                          </button>
                          {resendStatus && (
                            <span className="text-[11px] text-amber-300 font-medium">
                              {resendStatus}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Form */}
              <form onSubmit={handleSubmit} className="mt-2.5 space-y-2.5">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {t('emailAddress', 'Email Address')}
                  </label>
                  <div className="relative flex items-center">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={ROLE_CONFIGS[selectedRole]?.demoEmail || 'you@example.com'}
                      className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-all ${isDark
                        ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e] focus:ring-1 focus:ring-[#e5a65e]/50'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d] focus:ring-1 focus:ring-[#d8964d]/40'
                        }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {t('password', 'Password')}
                  </label>
                  <div className="relative flex items-center">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className={`w-full pl-9 pr-10 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-all ${isDark
                        ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e] focus:ring-1 focus:ring-[#e5a65e]/50'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d] focus:ring-1 focus:ring-[#d8964d]/40'
                        }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors cursor-pointer flex items-center justify-center ${isDark ? 'text-slate-400 hover:text-[#e5a65e]' : 'text-slate-500 hover:text-[#d8964d]'
                        }`}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#d8964d] hover:text-[#b8762d] transition-colors font-medium cursor-pointer"
                  >
                    {t('forgotPassword', 'Forgot Password?')}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#e8b070] to-[#d8964d] hover:from-[#ffd099] hover:to-[#f0ab5d] text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(232,176,112,0.45)] hover:shadow-[0_0_25px_rgba(232,176,112,0.95),0_0_55px_rgba(232,176,112,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer group disabled:opacity-50 hover:scale-[1.02] hover:-translate-y-0.5"
                >
                  <span>{loading ? t('authenticating', 'Authenticating...') : t('loginBtn', 'Login')}</span>
                  <span className="group-hover:translate-x-1.5 transition-transform font-bold">→</span>
                </button>
              </form>

              <div className={`text-center mt-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('dontHaveAccount', "Don't have an account?")}{' '}
                <Link
                  to="/register"
                  className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline transition-colors"
                >
                  {t('signUpLink', 'Sign up')}
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Desktop Bottom Footer */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] font-medium shrink-0">
          <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
            {t('loginFooterRights', '© 2026 SahakarConnect. All rights reserved. • Ministry of Cooperation & Labour Federations')}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-semibold">{t('loginFooterSecure', 'Your data is secure with cooperative encryption')}</span>
          </div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/*                     MOBILE LAYOUT (below md breakpoint)                   */}
      {/* ========================================================================= */}
      <div className="flex md:hidden min-h-screen w-full relative flex-col justify-between overflow-x-hidden font-sans select-none">
        {/* Mobile Fixed Background Image & Ambient Contrast Overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src={isDark ? '/login-bg-dark.jpg' : '/login-bg-light.jpg'}
            alt="Luxury Architectural Panoramic Background"
            className="w-full h-full object-cover object-center"
          />
          {isDark ? (
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black/95 backdrop-brightness-[0.85]"></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95 backdrop-brightness-[0.98]"></div>
          )}
        </div>

        {/* Mobile Top Header Bar */}
        <header className="relative z-10 w-full px-4 pt-3.5 pb-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl border backdrop-blur-xl flex items-center justify-center shadow-md ${isDark
                ? 'bg-black/60 border-white/20 text-[#e5a65e] shadow-[0_0_15px_rgba(229,166,94,0.25)]'
                : 'bg-white/95 border-slate-300 text-[#d8964d]'
                }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M12 12L3 7M12 12l9-5" />
              </svg>
            </div>
            <div>
              <span className={`text-xs font-black tracking-[0.2em] uppercase block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('brandTitle', 'SAHAKARCONNECT')}
              </span>
              <span className={`text-[10px] block font-medium leading-none mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('loginSubHeader', 'SIH26089 • Cooperative Marketplace')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </header>

        {/* Mobile Main Scrollable Content */}
        <main className="relative z-10 w-full px-4 py-2 my-auto flex flex-col items-center">
          {/* Mobile Compact Hero Greeting */}
          <div className="w-full max-w-md text-left mb-3">
            <h1 className={`text-2xl font-black tracking-tight leading-tight flex items-baseline gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{t('welcome', 'Welcome')}</span>
              <span className="text-[#e5a65e]">{t('back', 'Back')}</span>
            </h1>
            <p className={`text-xs mt-0.5 font-normal ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('loginHeroGreeting', 'Glad to see you again.')} <span className="text-[#e5a65e] font-medium">{t('loginHeroSub', "Let's continue where you left off.")}</span>
            </p>
          </div>

          {/* Mobile Role Switcher - Horizontal Scrollable Chip Row */}
          <div className="w-full max-w-md mb-3">
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Select Persona
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x -mx-1 px-1">
              {[ROLE_CONFIGS.worker, ROLE_CONFIGS.household, ROLE_CONFIGS.cooperative, ROLE_CONFIGS.manager, ROLE_CONFIGS.officer].map((p) => {
                const isActive = selectedRole === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-selected={isActive ? 'true' : undefined}
                    data-selected={isActive ? 'true' : undefined}
                    onClick={() => !isActive && handleSelectRoleTab(p.id)}
                    className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#e8b070] to-[#d8964d] text-slate-950 border-[#c4833b] shadow-md shadow-orange-500/20 ring-1 ring-[#e5a65e]'
                        : isDark
                        ? 'bg-[#181c24]/90 border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                        : 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile Floating Glassmorphic Login Card */}
          <div
            className={`w-full max-w-md border rounded-2xl p-4 sm:p-5 backdrop-blur-2xl transition-all duration-300 shadow-xl ${
              isDark
                ? 'bg-[#12151c]/90 border-white/[0.12] shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
                : 'bg-white/92 border-slate-200 shadow-[0_10px_35px_rgba(0,0,0,0.1)]'
            }`}
          >
            {/* Mobile Demo Auto-Fill Banner (Enhanced Touch Target) */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 mb-3 transition-all ${
                isDark
                  ? 'bg-[#181d26]/90 border-white/[0.08]'
                  : 'bg-orange-50/80 border-orange-200/80'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${
                    isDark
                      ? 'bg-[#12151c] border-white/[0.08] text-[#e8b070]'
                      : 'bg-white border-orange-200 text-orange-600'
                  }`}
                >
                  ⚡
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {ROLE_CONFIGS[selectedRole]?.hint}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {ROLE_CONFIGS[selectedRole]?.demoEmail}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleFillDemoCredentials(ROLE_CONFIGS[selectedRole]?.demoEmail)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-[#e8b070]/15 border-[#e8b070]/40 text-[#e8b070] hover:bg-[#e8b070]/25'
                    : 'bg-[#d8964d] border-[#c4833b] text-slate-950 hover:bg-[#c4833b]'
                }`}
              >
                Auto-Fill ⚡
              </button>
            </div>

            {/* Mobile Error Message & Confirmation Banner */}
            {error && (
              <div
                className={`mb-3 border text-xs p-3 rounded-xl shadow-md transition-all ${isUnconfirmed
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none shrink-0">{isUnconfirmed ? '✉️' : '⚠️'}</span>
                  <div className="flex-1">
                    <p className="font-semibold leading-relaxed">{error}</p>
                    {isUnconfirmed && (
                      <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          className="min-h-[44px] px-3 py-2 rounded-lg bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors shadow-sm cursor-pointer flex items-center justify-center active:scale-95"
                        >
                          Resend Confirmation Email →
                        </button>
                        {resendStatus && (
                          <span className="text-[11px] text-amber-300 font-medium text-center">
                            {resendStatus}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Form with ~48px touch targets */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Input */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {t('emailAddress', 'Email Address')}
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ROLE_CONFIGS[selectedRole]?.demoEmail || 'you@example.com'}
                    className={`w-full min-h-[48px] h-12 pl-11 pr-4 border rounded-xl text-sm focus:outline-none transition-all ${isDark
                      ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e] focus:ring-1 focus:ring-[#e5a65e]/50'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d] focus:ring-1 focus:ring-[#d8964d]/40'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Password Input with Large Touch-Area Visibility Toggle */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {t('password', 'Password')}
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`w-full min-h-[48px] h-12 pl-11 pr-12 border rounded-xl text-sm focus:outline-none transition-all ${isDark
                      ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e] focus:ring-1 focus:ring-[#e5a65e]/50'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d] focus:ring-1 focus:ring-[#d8964d]/40'
                      }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg transition-colors cursor-pointer flex items-center justify-center active:scale-95 ${isDark ? 'text-slate-400 hover:text-[#e5a65e]' : 'text-slate-500 hover:text-[#d8964d]'
                      }`}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link with generous tap area */}
              <div className="flex justify-end pt-0.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#d8964d] hover:text-[#b8762d] transition-colors font-medium py-1 px-1 cursor-pointer"
                >
                  {t('forgotPassword', 'Forgot Password?')}
                </Link>
              </div>

              {/* Primary Login Button (~48px height) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] h-12 py-3 px-4 bg-gradient-to-r from-[#e8b070] to-[#d8964d] hover:from-[#ffd099] hover:to-[#f0ab5d] text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(232,176,112,0.45)] flex items-center justify-center gap-2 transition-all cursor-pointer group disabled:opacity-50 active:scale-98"
              >
                <span>{loading ? t('authenticating', 'Authenticating...') : t('loginBtn', 'Login')}</span>
                <span className="font-bold">→</span>
              </button>
            </form>

            {/* Sign up Link */}
            <div className={`text-center mt-3.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('dontHaveAccount', "Don't have an account?")}{' '}
              <Link
                to="/register"
                className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline transition-colors py-1 inline-block"
              >
                {t('signUpLink', 'Sign up')}
              </Link>
            </div>
          </div>

          {/* Mobile Quick Highlight Chips */}
          <div className="w-full max-w-md flex flex-wrap justify-center gap-2 mt-4 mb-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 ${isDark
                ? 'bg-black/50 border-white/10 text-slate-200 shadow-sm'
                : 'bg-white/85 border-slate-300 text-slate-800 shadow-xs'
                }`}
            >
              <span>⚡</span> {t('statutoryFairWageChip', '100% Fair Wages')}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 ${isDark
                ? 'bg-black/50 border-white/10 text-emerald-300 shadow-sm'
                : 'bg-white/85 border-slate-300 text-emerald-800 shadow-xs'
                }`}
            >
              <span>🛡️</span> {t('societyWelfareFundChip', 'Worker Welfare & Safety')}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 ${isDark
                ? 'bg-black/50 border-white/10 text-[#e5a65e] shadow-sm'
                : 'bg-white/85 border-slate-300 text-orange-800 shadow-xs'
                }`}
            >
              <span>📍</span> {t('aiGeoDispatchChip', 'Fast Local Matching')}
            </span>
          </div>
        </main>

        {/* Mobile Bottom Footer */}
        <footer className="relative z-10 w-full px-4 py-3 flex flex-col items-center gap-1 text-[11px] font-medium text-center shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-semibold">{t('loginFooterSecure', 'Your data is secure with cooperative encryption')}</span>
          </div>
          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('loginFooterRights', '© 2026 SahakarConnect. All rights reserved. • Ministry of Cooperation & Labour Federations')}
          </div>
        </footer>
      </div>
    </div>
  )
}
