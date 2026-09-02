import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { DELHI_NCR_AREAS } from '../../lib/geoService'
import LanguageToggle from '../../components/LanguageToggle'
import ThemeToggle from '../../components/ThemeToggle'

const TRADES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Domestic Helper',
  'Caregiver',
  'Driver',
  'Gardener',
  'Cleaner',
  'Appliance Technician',
]

export default function Register() {
  const [role, setRole] = useState('worker')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [trade, setTrade] = useState('Electrician')
  const [experience, setExperience] = useState('3')
  const [area, setArea] = useState(DELHI_NCR_AREAS[0].name)
  const [coopName, setCoopName] = useState('Delhi Shramik Sahakari Federation Ltd.')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signUp(email, password, role, fullName, {
      trade,
      experience,
      area,
      coopName,
    })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
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
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Side: Create Account Info */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <div className="flex items-start gap-5">
            <div className="w-2 h-28 sm:h-36 bg-gradient-to-b from-[#e5a65e] via-[#d8964d] to-transparent rounded-full shadow-[0_0_15px_rgba(229,166,94,0.7)] shrink-0"></div>
            <div>
              <h1
                className={`text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-none ${
                  isDark ? 'text-white drop-shadow-md' : 'text-slate-900'
                }`}
              >
                Create<br />
                <strong className={`font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>Account</strong>
              </h1>
              <p
                className={`text-sm sm:text-base mt-4 max-w-md leading-relaxed ${
                  isDark ? 'text-slate-200 font-light' : 'text-slate-800 font-medium'
                }`}
              >
                Join India&apos;s leading cooperative-owned digital service marketplace today.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Floating Register Form */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div
            className={`w-full max-w-[480px] border rounded-[32px] p-7 sm:p-9 backdrop-blur-2xl transition-all duration-300 ${
              isDark
                ? 'bg-[#12151c]/90 border-white/[0.12] shadow-[0_30px_80px_rgba(0,0,0,0.85)]'
                : 'bg-white/92 border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.12)]'
            }`}
          >
            <h2 className={`text-2xl font-black text-center tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Get Started
            </h2>
            <p className={`text-xs text-center mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Choose your persona and create an account
            </p>

            {/* Role Tabs */}
            <div
              className={`grid grid-cols-3 gap-1.5 p-1 border rounded-2xl my-5 ${
                isDark ? 'bg-[#181c24] border-white/[0.06]' : 'bg-slate-100/90 border-slate-200'
              }`}
            >
              {[
                { id: 'worker', label: '🛠️ Worker' },
                { id: 'household', label: '🏡 Customer' },
                { id: 'cooperative', label: '🏛️ Co-op Admin' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
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
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none transition-all ${
                      isDark
                        ? 'bg-[#181c24] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#e5a65e]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8964d]'
                    }`}
                    required
                    minLength={6}
                  />
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
                    Worker Skill Profiling
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Trade Category
                      </label>
                      <select
                        value={trade}
                        onChange={(e) => setTrade(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                          isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        {TRADES.map((tItem) => (
                          <option key={tItem} value={tItem}>
                            {tItem}
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
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-xl text-xs outline-none ${
                          isDark ? 'bg-[#12151c] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Operating Cluster Area
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#e8b070] to-[#d8964d] hover:from-[#f0be82] hover:to-[#e0a259] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(232,176,112,0.35)] transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? 'Creating Account...' : `Register as ${role === 'worker' ? 'Cooperative Worker' : role === 'household' ? 'Household Customer' : 'Federation Admin'}`}
              </button>
            </form>

            <div className={`text-center mt-5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Already have an account?{' '}
              <Link to="/login" className="text-[#d8964d] hover:text-[#b8762d] font-bold hover:underline">
                Sign In
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
          <span className="font-semibold">Your data is secure with cooperative encryption</span>
        </div>
      </footer>
    </div>
  )
}
