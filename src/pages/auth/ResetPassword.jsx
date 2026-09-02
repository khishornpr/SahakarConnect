import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'
import { supabase } from '../../lib/supabase'
import LanguageToggle from '../../components/LanguageToggle'
import ThemeToggle from '../../components/ThemeToggle'

export default function ResetPassword() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  // Read email & resetToken from state or sessionStorage
  const [email] = useState(() => {
    return location.state?.email || sessionStorage.getItem('sahakar_reset_email') || ''
  })
  const [resetToken] = useState(() => {
    return location.state?.resetToken || sessionStorage.getItem('sahakar_reset_token') || ''
  })

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Strict Gating: If no valid resetToken or email, redirect back to /forgot-password
  useEffect(() => {
    if (!resetToken || !email) {
      console.warn('[ResetPassword] Missing reset token or email. Redirecting to /forgot-password')
      navigate('/forgot-password')
    }
  }, [resetToken, email, navigate])

  // Countdown redirect on success
  useEffect(() => {
    let timer = null
    if (isSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate('/login')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isSuccess, navigate])

  // Password Strength Calculation (0 to 100)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 8) score += 30
    if (pass.length >= 12) score += 15
    if (/[A-Z]/.test(pass)) score += 20
    if (/[0-9]/.test(pass)) score += 20
    if (/[^A-Za-z0-9]/.test(pass)) score += 15

    if (score < 40) return { score, label: 'Weak', color: 'bg-rose-500' }
    if (score < 75) return { score, label: 'Fair', color: 'bg-amber-500' }
    return { score, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength(newPassword)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Client-side validations
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)
    try {
      // Invoke Supabase Edge Function 'reset-password'
      const { data, error: funcError } = await supabase.functions.invoke('reset-password', {
        body: {
          email,
          resetToken,
          newPassword,
        },
      })

      if (funcError || !data?.success) {
        const errorMsg =
          funcError?.message ||
          data?.error ||
          'Failed to reset password. Your reset session may have expired.'
        setError(errorMsg)
        setLoading(false)
        return
      }

      // Cleanup stored tokens
      sessionStorage.removeItem('sahakar_reset_token')
      sessionStorage.removeItem('sahakar_reset_email')

      setIsSuccess(true)
    } catch (err) {
      console.error('[reset-password error]', err)
      setError('An unexpected error occurred. Please try again.')
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
              SIH26089 • Account Recovery
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* ----------------- MAIN CONTENT ----------------- */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-16 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Context */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-2 h-24 sm:h-36 bg-gradient-to-b from-[#e5a65e] via-[#d8964d] to-transparent rounded-full shadow-[0_0_15px_rgba(229,166,94,0.7)] shrink-0"></div>
            <div>
              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-none ${
                  isDark ? 'text-white drop-shadow-md' : 'text-slate-900'
                }`}
              >
                Set New<br />
                <strong className={`font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>Password</strong>
              </h1>
              <p
                className={`text-xs sm:text-base mt-3 sm:mt-4 max-w-md leading-relaxed ${
                  isDark ? 'text-slate-200 font-light' : 'text-slate-800 font-medium'
                }`}
              >
                Create a new password of at least 8 characters.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Step 3 Card */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div
            className={`w-full max-w-[460px] border rounded-[28px] sm:rounded-[32px] p-5 sm:p-9 backdrop-blur-2xl transition-all duration-300 ${
              isDark
                ? 'bg-[#12151c]/92 border-white/[0.12] shadow-[0_30px_80px_rgba(0,0,0,0.85)]'
                : 'bg-white/94 border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.12)]'
            }`}
          >
            {isSuccess ? (
              /* Success Celebration State */
              <div className="text-center py-4 space-y-5 animate-fade-in-up">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  ✓
                </div>

                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Password Reset!
                  </h2>
                  <p className={`text-xs mt-2 max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Your password has been successfully updated via Supabase Edge Function security.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  🚀 Redirecting to Sign In in {countdown}s...
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  Sign In with New Password →
                </button>
              </div>
            ) : (
              /* Form State */
              <>
                {/* Stepper Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e8b070] to-[#d8964d] text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                      3
                    </span>
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      New Password
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Step 3 of 3</span>
                </div>

                <div className="mb-5">
                  <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Create New Password
                  </h2>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Resetting password for: <span className="font-semibold text-[#e5a65e]">{email}</span>
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-fade-in-up">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password Input */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('newPassword', 'New Password')}
                    </label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-xs focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e] focus:ring-1 focus:ring-[#e5a65e]/50'
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d] focus:ring-1 focus:ring-[#d8964d]/40'
                        }`}
                        required
                        minLength={8}
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

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-1 px-1">
                      <div className="flex justify-between text-[11px]">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                          Strength: <strong className="text-slate-200">{strength.label}</strong>
                        </span>
                        <span className="text-slate-500">{newPassword.length} chars</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password Input */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('confirmPassword', 'Confirm New Password')}
                    </label>
                    <div className="relative flex items-center">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type your new password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-xs focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e] focus:ring-1 focus:ring-[#e5a65e]/50'
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d] focus:ring-1 focus:ring-[#d8964d]/40'
                        }`}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors cursor-pointer flex items-center justify-center ${
                          isDark ? 'text-slate-400 hover:text-[#e5a65e]' : 'text-slate-500 hover:text-[#d8964d]'
                        }`}
                      >
                        {showConfirmPassword ? (
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

                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#e8b070] to-[#d8964d] hover:from-[#f0be82] hover:to-[#e0a259] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(232,176,112,0.35)] transition-all disabled:opacity-50 mt-3 cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password & Finish →'}
                  </button>
                </form>

                <div className={`text-center mt-5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Remember your old password?{' '}
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
          <span className="font-semibold">Your password is securely hashed via Supabase Auth</span>
        </div>
      </footer>
    </div>
  )
}
