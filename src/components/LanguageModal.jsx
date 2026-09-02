import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation, INDIAN_LANGUAGES } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'

export default function LanguageModal({ isOpen, onClose }) {
  const { language, setLanguage } = useTranslation()
  const { isDark } = useTheme()
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const filtered = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.englishName.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (code) => {
    setLanguage(code)
    onClose()
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className={`rounded-2xl max-w-2xl w-full p-5 sm:p-6 my-auto shadow-2xl space-y-4 relative max-h-[88vh] flex flex-col border transition-all ${
          isDark
            ? 'bg-[#0a0f1d] border-cyan-500/40 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex justify-between items-start border-b pb-3.5 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>🇮🇳</span>
              <span>Official Scheduled Languages of India (Eighth Schedule)</span>
            </div>
            <h2 className={`text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>🌐</span>
              <span>Select Language • भाषा चयन</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Choose from all 22 official constitutionally recognized Indian languages
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative shrink-0">
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language (e.g. Tamil, Marathi, বাংলা, తెలుగు, Gujarati, Punjabi)..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 transition-all ${
              isDark
                ? 'bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 placeholder-slate-500 focus:ring-cyan-400/30'
                : 'bg-slate-50 border border-slate-300 focus:border-emerald-500 text-slate-900 placeholder-slate-400 focus:ring-emerald-500/20'
            }`}
          />
        </div>

        {/* Language Grid with Official Names in Selection Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 overflow-y-auto pr-1 flex-1 max-h-80">
          {filtered.map((lang) => {
            const isSelected = language === lang.code
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                      : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800/90 hover:border-cyan-500/40 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-black ${isSelected ? (isDark ? 'text-white' : 'text-emerald-900') : (isDark ? 'text-slate-100' : 'text-slate-900')}`}>
                    {lang.name}
                  </span>
                  {isSelected && (
                    <span className="text-emerald-500 text-xs font-black">✓ Active</span>
                  )}
                </div>
                <div className={`text-[11px] font-medium mt-0.5 ${isSelected ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                  {lang.englishName}
                </div>
                <div className={`text-[9px] mt-1 truncate ${isDark ? 'text-cyan-400/80' : 'text-slate-400'}`}>
                  {lang.region}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
