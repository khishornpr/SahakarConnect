import { useState } from 'react'
import { useTranslation, INDIAN_LANGUAGES } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import LanguageModal from './LanguageModal'

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation()
  const { isDark } = useTheme()
  const [showModal, setShowModal] = useState(false)

  const currentLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === language) ||
    INDIAN_LANGUAGES.find((l) => l.code === 'en') ||
    { code: 'en', name: 'English', englishName: 'English' }

  return (
    <>
      <div
        className={`inline-flex items-center rounded-xl p-0.5 sm:p-1 text-[11px] sm:text-xs border transition-all shrink-0 select-none ${
          isDark
            ? 'bg-[#0a0f1d] border-cyan-500/30 shadow-[0_0_15px_rgba(0,0,0,0.4)]'
            : 'bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            language === 'hi'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          हिन्दी
        </button>

        {/* Third Slot: If another official Indian language is selected, show that language name, otherwise show Others */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
            language !== 'en' && language !== 'hi'
              ? 'bg-teal-600 text-white shadow-sm font-black'
              : isDark
              ? 'text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/80'
              : 'text-emerald-700 hover:text-emerald-800 hover:bg-slate-200/60'
          }`}
        >
          <span className="text-xs">🌐</span>
          <span className="truncate max-w-[50px] sm:max-w-[80px]">
            {language !== 'en' && language !== 'hi' ? currentLangObj.name : 'More'}
          </span>
        </button>
      </div>

      <LanguageModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
