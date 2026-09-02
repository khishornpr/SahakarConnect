import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { DELHI_NCR_AREAS } from '../../lib/geoService'
import { TRADES_LIST as TRADES } from '../../lib/serviceCategories'
import LanguageToggle from '../../components/LanguageToggle'
import ThemeToggle from '../../components/ThemeToggle'


export default function Register() {
  const [role, setRole] = useState('worker')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [trade, setTrade] = useState('Electrician')
  const [experience, setExperience] = useState('3')
  const [area, setArea] = useState(DELHI_NCR_AREAS[0].name)
  const [coopName, setCoopName] = useState('Delhi Shramik Sahakari Federation Ltd.')
  const [managerDistrict, setManagerDistrict] = useState('South Delhi')
  const [managedTrade, setManagedTrade] = useState('All Trades')
  const [departmentId, setDepartmentId] = useState('DEL-LAB-2026')
  const [designation, setDesignation] = useState('Assistant Labor Commissioner')
  const [jurisdiction, setJurisdiction] = useState('Delhi NCR Region')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [resendStatus, setResendStatus] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const { signUp, resendVerification, verifyConfirmationToken } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  // Resend Cooldown Timer
  useEffect(() => {
    let timer = null
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error, needsConfirmation } = await signUp(email, password, role, fullName, {
      trade,
      experience,
      area,
      coopName,
      district: role === 'manager' ? managerDistrict : role === 'officer' ? jurisdiction : area,
      managerDistrict,
      managedTrade,
      departmentId,
      designation,
      jurisdiction,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (needsConfirmation || !data?.session) {
      setIsRegistered(true)
    } else {
      navigate('/')
    }
  }

  async function handleResendEmail() {
    if (resendCooldown > 0 || !email) return
    setResendStatus('Resending verification email...')
    try {
      const { error } = await resendVerification(email)
      if (error) {
        setResendStatus(`Failed to resend: ${error.message}`)
      } else {
        setResendStatus('✅ Verification email sent! Please check your inbox.')
        setResendCooldown(60)
      }
    } catch {
      setResendStatus('Failed to resend email. Please try again.')
    }
  }

  async function handleDemoInstantVerify() {
    setResendStatus('⚡ Verifying account via demo bypass...')
    try {
      const { error } = await verifyConfirmationToken({ email, type: 'signup' })
      if (error) {
        setResendStatus(`Verification error: ${error.message}`)
      } else {
        navigate('/')
      }
    } catch {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* ----------------- FULL-SCREEN IMMERSIVE PANORAMIC BACKGROUND ----------------- */}
      <div className="fixed inset-0 z-0">
        <img
          src={isDark ? '/login-bg-dark.jpg' : '/login-bg-light.jpg'}
          alt="Luxury Architectural Panoramic Background"
          className="w-full h-full object-cover object-center"
        />
        {isDark ? (
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/75 backdrop-brightness-[0.88]"></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 to-white/80 backdrop-brightness-[0.98]"></div>
        )}
      </div>

      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl border backdrop-blur-xl flex items-center justify-center shadow-lg transition-all ${
              isDark
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
              className={`text-xs font-black tracking-[0.25em] uppercase drop-shadow-sm block ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              SAHAKARCONNECT
            </span>
            <span className={`text-[10px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              SIH26089 • Cooperative Registration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* ----------------- MAIN VIEWPORT CONTENT ----------------- */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-16 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Create Account Info */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-2 h-24 sm:h-36 bg-gradient-to-b from-[#e5a65e] via-[#d8964d] to-transparent rounded-full shadow-[0_0_15px_rgba(229,166,94,0.7)] shrink-0"></div>
            <div>
              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-none ${
                  isDark ? 'text-white drop-shadow-md' : 'text-slate-900'
                }`}
              >
                Create<br />
                <strong className={`font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>Account</strong>
              </h1>
              <p
                className={`text-xs sm:text-base mt-3 sm:mt-4 max-w-md leading-relaxed ${
                  isDark ? 'text-slate-200 font-light' : 'text-slate-800 font-medium'
                }`}
              >
                Join SahakarConnect to book or offer verified local services.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Floating Register Form Card */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div
            className={`w-full max-w-[480px] border rounded-[28px] sm:rounded-[32px] p-5 sm:p-9 backdrop-blur-2xl transition-all duration-300 ${
              isDark
                ? 'bg-[#12151c]/90 border-white/[0.12] shadow-[0_30px_80px_rgba(0,0,0,0.85)]'
                : 'bg-white/92 border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.12)]'
            }`}
          >
            {isRegistered ? (
              /* Verification Screen State */
              <div className="text-center py-2 space-y-5 animate-fade-in-up">
                {/* Mail Icon with Glowing Halo */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-orange-500/40 flex items-center justify-center text-3xl text-orange-400 shadow-[0_0_35px_rgba(255,107,0,0.3)]">
                  ✉️
                </div>

                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Verify Your Email
                  </h2>
                  <p className={`text-xs mt-2 max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    We sent a confirmation link to:
                  </p>
                  <div className="mt-1.5 inline-block font-mono font-bold text-xs px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
                    {email}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl text-left text-xs space-y-2 border ${
                    isDark ? 'bg-slate-900/60 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-amber-400">
                    <span>📋</span> Next Steps:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                    <li>Open your email inbox and check for the verification message.</li>
                    <li>Click the <strong>Confirm your email</strong> link.</li>
                    <li>You will be instantly redirected to your SahakarConnect dashboard.</li>
                  </ol>
                </div>

                {resendStatus && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-amber-300 animate-fade-in-up">
                    {resendStatus}
                  </div>
                )}

                {/* Resend & Demo Actions */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendCooldown > 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                      resendCooldown > 0
                        ? 'border-slate-800 text-slate-500 bg-slate-900/50 cursor-not-allowed'
                        : isDark
                        ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10 cursor-pointer'
                        : 'border-orange-500 text-orange-600 hover:bg-orange-50 cursor-pointer'
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend Email in ${resendCooldown}s` : 'Resend Verification Email'}
                  </button>

                  {/* Instant Demo Confirmation Helper for frictionless testing */}
                  <button
                    type="button"
                    onClick={handleDemoInstantVerify}
                    className="w-full py-2.5 px-4 rounded-xl text-[11px] font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡</span> Instant Verify (Demo Testing Mode)
                  </button>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                  >
                    <span>←</span> Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              /* Normal Signup Form State */
              <>
                <h2 className={`text-2xl font-black text-center tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Get Started
                </h2>
                <p className={`text-xs text-center mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Choose your persona and create an account
                </p>

                {/* 4 Role Switcher Tabs */}
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 border rounded-2xl my-5 ${
                    isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-100/90 border-slate-200'
                  }`}
                >
                  {[
                    { id: 'worker', label: '🛠️ Worker' },
                    { id: 'household', label: '🏡 Customer' },
                    { id: 'manager', label: '👔 Manager' },
                    { id: 'officer', label: '🏛️ Labor Officer' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`py-2 px-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                        role === r.id
                          ? 'bg-gradient-to-r from-[#e8b070] to-[#d8964d] text-slate-950 shadow-md'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none transition-all ${
                        isDark
                          ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e]'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d]'
                      }`}
                      required
                    />
                  </div>

                  {/* Email & Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e]'
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d]'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className={`w-full pl-3.5 pr-10 py-2.5 border rounded-xl text-xs focus:outline-none transition-all ${
                            isDark
                              ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e]'
                              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d]'
                          }`}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors cursor-pointer flex items-center justify-center ${
                            isDark ? 'text-slate-400 hover:text-[#e5a65e]' : 'text-slate-500 hover:text-[#d8964d]'
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
                  </div>

                  {/* Worker Specific Fields */}
                  {role === 'worker' && (
                    <div
                      className={`p-4 border rounded-2xl space-y-3 ${
                        isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#d8964d] uppercase tracking-wider">
                        Worker Trade & Cooperative Affiliation
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Primary Skill / Trade
                          </label>
                          <select
                            value={trade}
                            onChange={(e) => setTrade(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                              isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            {TRADES.map((tr) => (
                              <option key={tr} value={tr}>
                                {t(tr, tr)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Experience (Years)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="40"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                              isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Assigned Cooperative Society
                        </label>
                        <select
                          value={coopName}
                          onChange={(e) => setCoopName(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                            isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="Delhi Shramik Sahakari Federation Ltd.">
                            Delhi Shramik Sahakari Federation Ltd. (South Delhi)
                          </option>
                          <option value="Indraprastha Karigar Cooperative Society">
                            Indraprastha Karigar Cooperative Society (West Delhi)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Primary Base Work Area (NCR)
                        </label>
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                            isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          {DELHI_NCR_AREAS.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.name} ({a.district})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Household Specific */}
                  {role === 'household' && (
                    <div
                      className={`p-4 border rounded-2xl space-y-3 ${
                        isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#d8964d] uppercase tracking-wider">
                        Household Service Location
                      </div>
                      <div>
                        <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Area / Locality
                        </label>
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                            isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          {DELHI_NCR_AREAS.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.name} ({a.district})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Manager Specific */}
                  {role === 'manager' && (
                    <div
                      className={`p-4 border rounded-2xl space-y-3 ${
                        isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#d8964d] uppercase tracking-wider">
                        Zonal Management & Supervision
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Supervised District / Zone
                          </label>
                          <select
                            value={managerDistrict}
                            onChange={(e) => setManagerDistrict(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                              isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="South Delhi">South Delhi Zonal Unit</option>
                            <option value="West Delhi">West Delhi Zonal Unit</option>
                            <option value="Central Delhi">Central Delhi Operations</option>
                            <option value="North Delhi">North Delhi Cluster</option>
                            <option value="East Delhi">East Delhi Cluster</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Managed Trades Scope
                          </label>
                          <select
                            value={managedTrade}
                            onChange={(e) => setManagedTrade(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                              isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="All Trades">All Trades (Integrated)</option>
                            <option value="Electrical & Plumbing">Electrical & Plumbing</option>
                            <option value="Carpentry & Masonry">Carpentry & Masonry</option>
                            <option value="Home Hygiene & Care">Home Hygiene & Care</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Labor Officer Specific */}
                  {role === 'officer' && (
                    <div
                      className={`p-4 border rounded-2xl space-y-3 ${
                        isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#d8964d] uppercase tracking-wider">
                        Labor Department Credential
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Government / Officer ID
                          </label>
                          <input
                            type="text"
                            required
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            placeholder="e.g. DL-LAB-2026-88"
                            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                              isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Official Designation
                          </label>
                          <input
                            type="text"
                            required
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="e.g. Labor Welfare Officer"
                            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                              isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            District Jurisdiction
                          </label>
                          <select
                            value={jurisdiction}
                            onChange={(e) => setJurisdiction(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                              isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Delhi NCR Region">Delhi NCR (All Jurisdictions)</option>
                            <option value="South Delhi">South Delhi Division</option>
                            <option value="West Delhi">West Delhi Division</option>
                            <option value="North Delhi">North Delhi Division</option>
                            <option value="East Delhi">East Delhi Division</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#e8b070] to-[#d8964d] hover:from-[#f0be82] hover:to-[#e0a259] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(232,176,112,0.35)] transition-all disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {loading
                      ? 'Creating Account...'
                      : `Register as ${
                          role === 'worker'
                            ? 'Cooperative Worker'
                            : role === 'household'
                            ? 'Household Customer'
                            : role === 'manager'
                            ? 'Zonal Manager'
                            : 'Labor Department Officer'
                        }`}
                  </button>
                </form>

                <div className={`text-center mt-5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline">
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ----------------- BOTTOM FOOTER ----------------- */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-medium">
        <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          © 2026 SahakarConnect. All rights reserved. • Ministry of Cooperation & Labour Federations
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-semibold">Your data is secure with cooperative encryption</span>
        </div>
      </footer>
    </div>
  )
}
