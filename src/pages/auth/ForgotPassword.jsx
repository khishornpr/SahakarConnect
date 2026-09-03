import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'
import { supabase } from '../../lib/supabase'
import LanguageToggle from '../../components/LanguageToggle'
import ThemeToggle from '../../components/ThemeToggle'

export default function ForgotPassword() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const sanitizedEmail = email.trim()
    if (!sanitizedEmail) {
      setError('Please enter your registered email address.')
      return
    }

    setLoading(true)
    try {
      // Invoke Supabase Edge Function 'forgot-password'
      const { data, error: funcError } = await supabase.functions.invoke('forgot-password', {
        body: { email: sanitizedEmail },
      })

      if (funcError) {
        console.error('[forgot-password function error]', funcError)
      }

      // Save email for next PIN verification step
      sessionStorage.setItem('sahakar_reset_email', sanitizedEmail)

      setSuccessMsg(
        data?.message || 'If this email is registered, a 4-digit PIN code has been dispatched.'
      )

      // Automatically transition to Verify PIN page after 1.2s
      setTimeout(() => {
        navigate('/verify-pin', { state: { email: sanitizedEmail } })
      }, 1200)
    } catch (err) {
      console.error('[forgot-password error]', err)
      // Always show generic message to prevent enumeration
      setSuccessMsg('If this email is registered, a 4-digit verification code has been dispatched.')
      setTimeout(() => {
        navigate('/verify-pin', { state: { email: sanitizedEmail } })
      }, 1200)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* ----------------- FULL-SCREEN IMMERSIVE PANORAMIC BACKGROUND ----------------- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={isDark ? '/login-bg-dark.jpg' : '/login-bg-light.jpg'}
          alt="Luxury Architectural Panoramic Background"
          className="w-full h-full object-cover object-center"
        />
        {isDark ? (
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/80 backdrop-brightness-[0.88]"></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-white/85 backdrop-brightness-[0.98]"></div>
        )}
      </div>

      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-3.5 sm:px-10 pt-4 sm:pt-8 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border backdrop-blur-xl flex items-center justify-center shadow-lg transition-all shrink-0 ${
              isDark
                ? 'bg-black/60 border-white/20 text-[#e5a65e] shadow-[0_0_20px_rgba(229,166,94,0.3)]'
                : 'bg-white/90 border-slate-300 text-[#d8964d]'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M12 12L3 7M12 12l9-5" />
            </svg>
          </div>
          <div className="min-w-0">
            <span
              className={`text-[11px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] uppercase drop-shadow-sm block truncate ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              SAHAKARCONNECT
            </span>
            <span className={`text-[9px] sm:text-[10px] hidden sm:block font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              SIH26089 • Account Recovery
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>      {/* ----------------- MAIN VIEWPORT CONTENT ----------------- */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-16 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Reset Password Typography */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-2 h-24 sm:h-36 bg-gradient-to-b from-[#e5a65e] via-[#d8964d] to-transparent rounded-full shadow-[0_0_15px_rgba(229,166,94,0.7)] shrink-0"></div>
            <div>
              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-none ${
                  isDark ? 'text-white drop-shadow-md' : 'text-slate-900'
                }`}
              >
                Reset<br />
                <strong className={`font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>Password</strong>
              </h1>
              <p
                className={`text-xs sm:text-base mt-3 sm:mt-4 max-w-md leading-relaxed ${
                  isDark ? 'text-slate-200 font-light' : 'text-slate-800 font-medium'
                }`}
              >
                Recover access to your account in 3 quick steps.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Step 1 Card */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div
            className={`w-full max-w-[460px] border rounded-[28px] sm:rounded-[32px] p-5 sm:p-9 backdrop-blur-2xl transition-all duration-300 ${
              isDark
                ? 'bg-[#12151c]/92 border-white/[0.12] shadow-[0_30px_80px_rgba(0,0,0,0.85)]'
                : 'bg-white/94 border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.12)]'
            }`}
          >
            {/* Progress Stepper Bar */}
            <div className="flex items-center justify-between mb-5 pb-3 sm:mb-6 sm:pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e8b070] to-[#d8964d] text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                  1
                </span>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Request PIN
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Step 1 of 3</span>
            </div>

            <div className="mb-4 sm:mb-5">
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('forgotPassword', 'Forgot Password?')}
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Enter your email address and we will send you a 4-digit reset PIN.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-fade-in-up">
                {error}
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-3 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-fade-in-up">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('emailAddress', 'Email Address')}
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example: ramesh.worker@sahakar.in"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs focus:outline-none transition-all ${
                      isDark
                        ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e] focus:ring-1 focus:ring-[#e5a65e]/50'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d] focus:ring-1 focus:ring-[#d8964d]/40'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Demo Helper Pill */}
              <div className="flex items-center justify-between text-[11px] px-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Quick Demo:
                </span>
                <button
                  type="button"
                  onClick={() => setEmail('ramesh.worker@sahakar.in')}
                  className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline transition-colors cursor-pointer"
                >
                  Use ramesh.worker@sahakar.in ⚡
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#e8b070] to-[#d8964d] hover:from-[#f0be82] hover:to-[#e0a259] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(232,176,112,0.35)] transition-all disabled:opacity-50 mt-3 cursor-pointer"
              >
                {loading ? 'Dispatching Secure Code...' : 'Send 4-Digit Reset PIN →'}
              </button>
            </form>

            <div className={`text-center mt-5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Remembered your password?{' '}
              <Link to="/login" className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline">
                Back to Sign In
              </Link>
            </div>
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
          <span className="font-semibold">Your session is protected with Supabase Edge Security</span>
        </div>
      </footer>
    </div>
  )
}
