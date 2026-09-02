import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import LanguageToggle from '../../components/LanguageToggle'
import ThemeToggle from '../../components/ThemeToggle'

export default function VerifyPin() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // Extract email from location state or sessionStorage
  const [email] = useState(() => {
    return location.state?.email || sessionStorage.getItem('sahakar_reset_email') || ''
  })

  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendStatus, setResendStatus] = useState('')

  // 10-minute expiry countdown (600 seconds)
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(30)

  const pinInput0 = useRef(null)
  const pinInput1 = useRef(null)
  const pinInput2 = useRef(null)
  const pinInput3 = useRef(null)
  const pinInputRefs = [pinInput0, pinInput1, pinInput2, pinInput3]

  // Redirect to /forgot-password if email is completely missing
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
    } else {
      // Focus first digit on load
      pinInput0.current?.focus()
    }
  }, [email, navigate])

  // Expiry Countdown Timer
  useEffect(() => {
    let timer = null
    if (secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [secondsLeft])

  // Resend Cooldown Timer
  useEffect(() => {
    let cooldownTimer = null
    if (!canResend && resendCooldown > 0) {
      cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(cooldownTimer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(cooldownTimer)
  }, [canResend, resendCooldown])

  // Format seconds to mm:ss
  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Handle single digit input with auto-advance
  function handlePinChange(index, value) {
    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue.length > 1) {
      // Handle paste
      handlePinPaste(cleanValue)
      return
    }

    const newDigits = [...pinDigits]
    newDigits[index] = cleanValue.slice(-1)
    setPinDigits(newDigits)
    setError('')

    // Auto-advance to next input
    if (cleanValue && index < 3) {
      pinInputRefs[index + 1].current?.focus()
    }

    // If all 4 filled, automatically submit
    if (newDigits.every((d) => d !== '') && index === 3 && cleanValue) {
      verifyPinCode(newDigits.join(''))
    }
  }

  // Handle Backspace Key Navigation
  function handlePinKeyDown(index, e) {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus()
    }
  }

  // Handle Paste of full 4-digit code
  function handlePinPaste(pastedData) {
    const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('')
    if (digits.length > 0) {
      const newDigits = ['', '', '', '']
      digits.forEach((d, i) => {
        if (i < 4) newDigits[i] = d
      })
      setPinDigits(newDigits)
      setError('')
      const nextIndex = Math.min(digits.length, 3)
      pinInputRefs[nextIndex].current?.focus()

      if (newDigits.every((d) => d !== '')) {
        verifyPinCode(newDigits.join(''))
      }
    }
  }

  // Submit PIN to Edge Function
  async function verifyPinCode(fullPin) {
    const pin = fullPin || pinDigits.join('')
    if (pin.length !== 4) {
      setError('Please enter all 4 digits of your PIN code.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const { data, error: funcError } = await supabase.functions.invoke('verify-pin', {
        body: { email, pin },
      })

      if (funcError || !data?.verified) {
        const errorMsg = funcError?.message || data?.error || 'Invalid or expired PIN code.'
        setError(errorMsg)
        setLoading(false)
        return
      }

      // Store reset token securely in sessionStorage for Step 3
      const token = data.resetToken
      sessionStorage.setItem('sahakar_reset_token', token)

      // Navigate to Reset Password page
      navigate('/reset-password', {
        state: { email, resetToken: token },
      })
    } catch (err) {
      console.error('[verify-pin error]', err)
      setError('Failed to verify PIN. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend PIN via Edge Function
  async function handleResendPin() {
    if (!canResend) return
    setResendStatus('Resending 4-digit PIN...')
    setError('')
    try {
      await supabase.functions.invoke('forgot-password', {
        body: { email },
      })
      setResendStatus('✅ New 4-digit PIN code dispatched via Resend!')
      setSecondsLeft(600) // Reset 10m timer
      setCanResend(false)
      setResendCooldown(30)
      setPinDigits(['', '', '', ''])
      pinInputRefs[0].current?.focus()
    } catch {
      setResendStatus('Failed to resend PIN code. Please try again.')
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
      </header>

      {/* ----------------- MAIN VIEWPORT CONTENT ----------------- */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-16 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Reset Password Typography */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-2 h-24 sm:h-36 bg-gradient-to-b from-[#e5a65e] via-[#d8964d] to-transparent rounded-full shadow-[0_0_15px_rgba(229,166,94,0.7)] shrink-0"></div>
            <div>
              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-none ${
                  isDark ? 'text-white drop-shadow-md' : 'text-slate-900'
                }`}
              >
                Verify<br />
                <strong className={`font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>4-Digit PIN</strong>
              </h1>
              <p
                className={`text-xs sm:text-base mt-3 sm:mt-4 max-w-md leading-relaxed ${
                  isDark ? 'text-slate-200 font-light' : 'text-slate-800 font-medium'
                }`}
              >
                Enter the 4-digit code sent to your email to confirm your identity.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Step 2 Card */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div
            className={`w-full max-w-[460px] border rounded-[28px] sm:rounded-[32px] p-5 sm:p-9 backdrop-blur-2xl transition-all duration-300 ${
              isDark
                ? 'bg-[#12151c]/92 border-white/[0.12] shadow-[0_30px_80px_rgba(0,0,0,0.85)]'
                : 'bg-white/94 border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.12)]'
            }`}
          >
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-5 pb-3 sm:mb-6 sm:pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e8b070] to-[#d8964d] text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                  2
                </span>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Verify PIN
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Step 2 of 3</span>
            </div>

            <div className="mb-4 sm:mb-5">
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Enter 4-Digit Code
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                We sent a PIN code to: <span className="font-semibold text-[#e5a65e] break-all">{email}</span>
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-fade-in-up">
                {error}
              </div>
            )}

            {/* Resend Status Banner */}
            {resendStatus && (
              <div className="mb-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-3 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-fade-in-up">
                {resendStatus}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                verifyPinCode()
              }}
              className="space-y-5"
            >
              {/* 4 Digit Input Boxes with responsive widths */}
              <div className="flex justify-center gap-2 sm:gap-4 my-4 sm:my-6">
                {pinDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinInputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    onPaste={(e) => {
                      e.preventDefault()
                      handlePinPaste(e.clipboardData.getData('text'))
                    }}
                    className={`w-11 h-14 sm:w-14 sm:h-16 md:w-16 md:h-18 text-center text-xl sm:text-2xl font-black rounded-xl sm:rounded-2xl border transition-all duration-200 outline-none ${
                      digit
                        ? 'border-[#e5a65e] text-[#e5a65e] shadow-[0_0_15px_rgba(229,166,94,0.35)] scale-105'
                        : isDark
                        ? 'bg-[#181c24] border-white/[0.1] text-white focus:border-[#e5a65e] focus:bg-[#1f242e]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#d8964d] focus:bg-white'
                    }`}
                  />
                ))}
              </div>

              {/* Countdown Expiry & Resend Timer Row */}
              <div className="flex items-center justify-between text-xs py-1 px-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-400">
                  <span>⏳ Expires in:</span>
                  <span
                    className={`font-mono font-bold ${
                      secondsLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                    }`}
                  >
                    {formatTimer(secondsLeft)}
                  </span>
                </div>

                <div>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendPin}
                      className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline cursor-pointer"
                    >
                      Resend PIN 🔄
                    </button>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      Resend in {resendCooldown}s
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || pinDigits.some((d) => !d) || secondsLeft === 0}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#e8b070] to-[#d8964d] hover:from-[#f0be82] hover:to-[#e0a259] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(232,176,112,0.35)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying PIN...' : 'Verify PIN & Continue →'}
              </button>
            </form>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.08] text-xs">
              <Link
                to="/forgot-password"
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Change Email
              </Link>
              <Link
                to="/login"
                className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline"
              >
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
