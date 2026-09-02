import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/I18nContext'

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme()
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Neon Dark and White Mode"
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95 shrink-0 ${
        isDark
          ? 'bg-slate-900 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
          : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 shadow-sm'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500'}`}></span>
      </span>
      <span className="text-sm">{isDark ? '⚡' : '☀️'}</span>
      <span className="font-bold hidden sm:inline">
        {isDark ? t('neonDarkMode', 'Neon Glow') : t('lightMode', 'White Mode')}
      </span>
    </button>
  )
}
