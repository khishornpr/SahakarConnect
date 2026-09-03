import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/I18nContext'

export default function Unauthorized() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#0b0d11]' : 'bg-slate-100'}`}>
      <div className="flow-card glow-orange-hover p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-4xl font-black text-rose-500">403</h1>
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('accessRestricted', 'Access Restricted')}</h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          You do not have the required cooperative federation credentials to access this protected portal.
        </p>
        <Link
          to="/"
          className="inline-block flow-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow"
        >
          Return to Portal Switcher
        </Link>
      </div>
    </div>
  )
}
