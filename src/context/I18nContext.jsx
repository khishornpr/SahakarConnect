import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../translations/index.js'

export const INDIAN_LANGUAGES = [
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', region: 'Tamil Nadu, Puducherry' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', region: 'National / North & Central India' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', region: 'Maharashtra, Goa' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', region: 'West Bengal, Tripura' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', region: 'Andhra Pradesh, Telangana' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', region: 'Gujarat, DNH & DD' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', region: 'Karnataka' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', region: 'Kerala, Lakshadweep' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', region: 'Punjab, Delhi, Haryana' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', region: 'Odisha' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', region: 'National / J&K, Telangana, UP' },
  { code: 'as', name: 'অসমীয়া', englishName: 'Assamese', region: 'Assam' },
  { code: 'sa', name: 'संस्कृतम्', englishName: 'Sanskrit', region: 'Ancient Classical' },
  { code: 'ne', name: 'नेपाली', englishName: 'Nepali', region: 'Sikkim, West Bengal' },
  { code: 'kok', name: 'कोंकणी', englishName: 'Konkani', region: 'Goa, Maharashtra' },
  { code: 'mai', name: 'मैथिली', englishName: 'Maithili', region: 'Bihar, Jharkhand' },
  { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santali', region: 'Jharkhand, WB, Odisha' },
  { code: 'doi', name: 'डोगरी', englishName: 'Dogri', region: 'Jammu & Kashmir' },
  { code: 'sd', name: 'सिन्धी', englishName: 'Sindhi', region: 'National' },
  { code: 'mni', name: 'মৈতৈলোন্', englishName: 'Manipuri', region: 'Manipur' },
  { code: 'brx', name: 'बड़ो', englishName: 'Bodo', region: 'Assam, Bodoland' },
  { code: 'ks', name: 'कश्मीरी', englishName: 'Kashmiri', region: 'Jammu & Kashmir' },
  { code: 'en', name: 'English', englishName: 'English', region: 'Official' },
]

export { translations }

// Cognate language fallback map for regional Indic languages
const COGNATE_FALLBACKS = {
  kok: 'mr',  // Konkani -> Marathi
  mai: 'hi',  // Maithili -> Hindi
  doi: 'pa',  // Dogri -> Punjabi
  brx: 'as',  // Bodo -> Assamese
  mni: 'bn',  // Manipuri -> Bengali
  sd: 'hi',   // Sindhi -> Hindi
  ks: 'ur',   // Kashmiri -> Urdu
  sa: 'hi',   // Sanskrit -> Hindi
  sat: 'hi',  // Santali -> Hindi
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('sahakar_lang') || 'en'
    } catch {
      return 'en'
    }
  })

  // Synchronize document lang & dir attributes
  useEffect(() => {
    document.documentElement.lang = language
    if (language === 'ur') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }, [language])

  const t = (key, fallback) => {
    // 1. If English is selected, return English canonical dictionary entry
    if (language === 'en') {
      if (translations.en && translations.en[key]) {
        return translations.en[key]
      }
      return fallback !== undefined ? fallback : key
    }

    // 2. If a specific language is selected, look up the translation in that language
    let localizedText = null
    const langDict = translations[language]

    if (langDict) {
      if (langDict[key]) {
        localizedText = langDict[key]
      } else if (fallback && langDict[fallback]) {
        localizedText = langDict[fallback]
      } else if (translations.en && translations.en[key] && langDict[translations.en[key]]) {
        localizedText = langDict[translations.en[key]]
      }
    }

    // Check direct cognate language fallback (e.g. Konkani -> Marathi, Maithili -> Hindi, Bodo -> Assamese)
    if (!localizedText) {
      const cognateCode = COGNATE_FALLBACKS[language]
      if (cognateCode && translations[cognateCode]) {
        const cogDict = translations[cognateCode]
        if (cogDict[key]) {
          localizedText = cogDict[key]
        } else if (fallback && cogDict[fallback]) {
          localizedText = cogDict[fallback]
        }
      }
    }

    // Check Hindi (Indic base) fallback for any missing regional phrases before falling back to English
    if (!localizedText && translations.hi) {
      if (translations.hi[key]) {
        localizedText = translations.hi[key]
      } else if (fallback && translations.hi[fallback]) {
        localizedText = translations.hi[fallback]
      }
    }

    // 3. Return translated text in the specified language
    if (localizedText && typeof localizedText === 'string') {
      return localizedText
    }

    // 4. If no translation exists at all, fall back to English or fallback text
    if (translations.en && translations.en[key]) {
      return translations.en[key]
    }

    return fallback !== undefined ? fallback : key
  }

  const changeLanguage = (code) => {
    setLanguage(code)
    try {
      localStorage.setItem('sahakar_lang', code)
    } catch (e) {
      console.warn('Failed to save language to localStorage', e)
    }
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t, languages: INDIAN_LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
