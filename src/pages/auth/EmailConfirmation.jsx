import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'
import { supabase } from '../../lib/supabase'
import LanguageToggle from '../../components/LanguageToggle'

export default function EmailConfirmation() {
  const { isDark, toggleTheme } = useTheme()
  const { profile, verifyConfirmationToken, resendVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error' | 'manual'
  const [message, setMessage] = useState('Verifying your email address...')
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('')
  const [countdown, setCountdown] = useState(3)

  function handleVerificationSuccess() {
    setStatus('success')
    setMessage('Your email has been confirmed! Activating your SahakarConnect account...')
  }

  useEffect(() => {
    async function processEmailConfirmation() {
      // 1. Check Search Parameters (PKCE Flow / Token Hash)
      const searchParams = new URLSearchParams(location.search)
      const tokenHash = searchParams.get('token_hash') || searchParams.get('token')
      const type = searchParams.get('type') || 'signup'
      const code = searchParams.get('code')

      // 2. Check Hash Fragment (Implicit Grant / SPA token redirect)
      const hash = location.hash || window.location.hash
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      try {
        if (tokenHash) {
          // Verify via Token Hash
          const { error } = await verifyConfirmationToken({
            token_hash: tokenHash,
            type,
          })
          if (error) throw error
          handleVerificationSuccess()
          return
        }

        if (code && supabase.auth.exchangeCodeForSession) {
          // Verify PKCE Auth Code
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          handleVerificationSuccess()
          return
        }

        if (accessToken && refreshToken && supabase.auth.setSession) {
          // Set session from hash tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
          handleVerificationSuccess()
          return
        }

        // Check if user is already authenticated & confirmed
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          handleVerificationSuccess()
          return
        }

        // No tokens found in URL — allow manual confirmation
        setStatus('manual')
        setMessage('Please click the link in your email or enter your email to resend.')
      } catch (err) {
        console.error('[Email Confirmation Error]', err)
        setStatus('error')
        setMessage(err.message || 'Verification link is invalid or has expired.')
      }
    }

    processEmailConfirmation()
  }, [location, verifyConfirmationToken])

  // Automatic redirect countdown on success
  useEffect(() => {
    let timer = null
    if (status === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            const roleRedirects = {
              worker: '/worker/dashboard',
              household: '/household/dashboard',
              cooperative: '/cooperative/dashboard',
            }
            navigate(roleRedirects[profile?.role] || '/')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [status, profile, navigate])

  async function handleResend(e) {
    e.preventDefault()
    if (!resendEmail) return
    setResendStatus('Resending confirmation email...')
    try {
      const { error } = await resendVerification(resendEmail)
      if (error) {
        setResendStatus(`Failed: ${error.message}`)
      } else {
        setResendStatus('✅ Confirmation email sent! Please check your inbox.')
      }
    } catch {
      setResendStatus('Failed to resend confirmation email.')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-orange-500 selection:text-white transition-colors duration-300">
      {/* Dynamic Panoramic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0b0d11]"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/20 blur-[120px]"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-orange-600/15 blur-[120px]"></div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      {/* Top Floating Controls */}
      <div className="fixed top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 flex items-center gap-1.5 sm:gap-3">
        <LanguageToggle />
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Dark and Light Mode"
          className="p-2 sm:p-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-amber-400 shadow-lg backdrop-blur-md hover:scale-105 transition-all cursor-pointer"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Confirmation Glass Card */}
      <div className="relative z-10 w-full max-w-md my-6 px-4">
        <div
          className={`rounded-[28px] sm:rounded-3xl border p-5 sm:p-9 backdrop-blur-xl shadow-2xl text-center transition-all ${
            isDark
              ? 'bg-[#12151b]/95 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
              : 'bg-white/95 border-slate-200 shadow-xl'
          }`}
        >
          {/* Header Brand */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/30">
              ⚡
            </div>
            <div className="text-left">
              <span className="block font-black text-base tracking-tight gradient-text-emerald">
                SahakarConnect
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Email Verification
              </span>
            </div>
          </div>

          {/* STATE 1: Verifying */}
          {status === 'verifying' && (
            <div className="py-6 space-y-4 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <span className="w-8 h-8 rounded-full border-3 border-emerald-400/30 border-t-emerald-400 animate-spin"></span>
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Verifying Account...
              </h2>
              <p className="text-xs text-slate-400">{message}</p>
            </div>
          )}

          {/* STATE 2: Success */}
          {status === 'success' && (
            <div className="py-6 space-y-5 animate-fade-in-up">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 text-3xl shadow-[0_0_40px_rgba(16,185,129,0.35)]">
                ✓
              </div>
              <div>
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Email Confirmed!
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Your email has been verified. Welcome to SahakarConnect.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                🚀 Redirecting to dashboard in {countdown}s...
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                Go to Dashboard Now →
              </button>
            </div>
          )}

          {/* STATE 3: Error / Expired */}
          {status === 'error' && (
            <div className="py-4 space-y-5 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 text-2xl">
                ⚠️
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Verification Failed
                </h2>
                <p className="text-xs text-rose-400/90 mt-1 max-w-xs mx-auto">{message}</p>
              </div>

              <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Enter email to request a fresh link:
                </label>
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none ${
                    isDark
                      ? 'bg-slate-950/70 border-white/10 text-white focus:border-orange-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500'
                  }`}
                />
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md transition-all cursor-pointer"
                >
                  Resend Verification Email
                </button>
                {resendStatus && (
                  <p className="text-xs text-amber-400 text-center">{resendStatus}</p>
                )}
              </form>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  <span>←</span> Return to Login
                </Link>
              </div>
            </div>
          )}

          {/* STATE 4: Manual / Direct Visit */}
          {status === 'manual' && (
            <div className="py-4 space-y-5 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl">
                ✉️
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Check Your Inbox
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Click the confirmation link sent to your registered email to activate your account.
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Didn&apos;t receive it? Resend link:
                </label>
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none ${
                    isDark
                      ? 'bg-slate-950/70 border-white/10 text-white focus:border-orange-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500'
                  }`}
                />
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md transition-all cursor-pointer"
                >
                  Send Verification Email
                </button>
                {resendStatus && (
                  <p className="text-xs text-amber-400 text-center">{resendStatus}</p>
                )}
              </form>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  <span>←</span> Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
