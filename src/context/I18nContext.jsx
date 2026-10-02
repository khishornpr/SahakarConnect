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

// Bidirectional reverse lookup from English strings/values to canonical dictionary keys
const EN_VALUE_TO_KEY = {}
const EN_LOWER_TO_KEY = {}
const NORM_TO_KEY = {}

function normalizeString(str) {
  if (typeof str !== 'string') return ''
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,:;!?]+$/, '')
    .replace(/\s+/g, ' ')
}

if (translations.en) {
  for (const [key, val] of Object.entries(translations.en)) {
    if (typeof val === 'string' && val.trim()) {
      EN_VALUE_TO_KEY[val] = key
      EN_VALUE_TO_KEY[val.trim()] = key
      EN_LOWER_TO_KEY[val.trim().toLowerCase()] = key
      NORM_TO_KEY[normalizeString(val)] = key
      NORM_TO_KEY[normalizeString(key)] = key
    }
  }
}

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

const DUMMY_STRINGS = new Set([
  'கூட்டுறவு சேவை விவரம்',
  'सहकारी सेवा विवरण',
  'सहकारी सेवा तपशील',
  'సహకార సేవా వివరాలు',
  'സഹകരണ സേവന വിവരങ്ങൾ',
  'ಕಾರ್ಮಿಕ / ಸಹಕಾರಿ ಸೇವಾ ವಿವರಗಳು',
  'ಸಹಕಾರಿ ಸೇವಾ ವಿವರಗಳು',
  'সমবায় পরিষেবা বিবরণ',
  'સહકારી સેવા વિગતો',
  'ਸਹਿਕਾਰੀ ਸੇਵਾ ਵੇਰਵੇ',
  'ସମବାୟ ସେବା ବିବରଣୀ',
  'کوآپریٹو سروس کی تفصیلات',
  'সমবায় সেৱাৰ বিৱৰণ',
  'सहकारि-सेवा-विवरणम्',
  'सहकारी सेवा म्हायती',
  'सहकारी कामी बिबरण',
  'ڪوآپريٽو سروس جا تفصيل',
  'समबाय खामानिनि खौरां',
  'کوآپریٹو خدمتچ تفصیل',
])

function isValidTranslation(text) {
  return text && typeof text === 'string' && !DUMMY_STRINGS.has(text.trim())
}

function resolveCanonicalKey(key, fallback) {
  if (typeof key !== 'string') return key
  const trimmed = key.trim()
  if (EN_VALUE_TO_KEY[key]) return EN_VALUE_TO_KEY[key]
  if (EN_VALUE_TO_KEY[trimmed]) return EN_VALUE_TO_KEY[trimmed]
  if (EN_LOWER_TO_KEY[trimmed.toLowerCase()]) return EN_LOWER_TO_KEY[trimmed.toLowerCase()]
  if (NORM_TO_KEY[normalizeString(key)]) return NORM_TO_KEY[normalizeString(key)]
  
  if (fallback && typeof fallback === 'string') {
    const fTrimmed = fallback.trim()
    if (EN_VALUE_TO_KEY[fallback]) return EN_VALUE_TO_KEY[fallback]
    if (EN_VALUE_TO_KEY[fTrimmed]) return EN_VALUE_TO_KEY[fTrimmed]
    if (EN_LOWER_TO_KEY[fTrimmed.toLowerCase()]) return EN_LOWER_TO_KEY[fTrimmed.toLowerCase()]
    if (NORM_TO_KEY[normalizeString(fallback)]) return NORM_TO_KEY[normalizeString(fallback)]
  }
  return null
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
    if (language === 'ur' || language === 'ks' || language === 'sd') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }, [language])

  const t = (key, fallback) => {
    if (!key && key !== 0) return fallback !== undefined ? fallback : ''

    if (typeof key !== 'string') return key

    // Check for leading emoji or symbols (e.g. "⚡ Open Service Requests", "📍 B-42...")
    const emojiMatch = key.match(/^([\p{Emoji}\u2600-\u27BF\u2300-\u23FF\u2B50\u2705\u274C\u26A1\uD83C-\uDBFF\uDC00-\uDFFF\s*•→✓✕🔐⚡📍🕒⭐📄📋★]+)(.*)$/u)
    let prefix = ''
    let cleanKey = key
    if (emojiMatch && emojiMatch[2] && emojiMatch[2].trim().length > 1) {
      prefix = emojiMatch[1]
      cleanKey = emojiMatch[2].trim()
    }

    const canonicalKey = resolveCanonicalKey(cleanKey, fallback)

    // 1. If English is selected, return English canonical dictionary entry
    if (language === 'en') {
      if (translations.en && isValidTranslation(translations.en[cleanKey])) {
        return prefix + translations.en[cleanKey]
      }
      if (canonicalKey && translations.en && isValidTranslation(translations.en[canonicalKey])) {
        return prefix + translations.en[canonicalKey]
      }
      if (fallback !== undefined) return fallback
      return key
    }

    // 2. If a specific language is selected, look up the translation in that language
    let localizedText = null
    const langDict = translations[language]

    if (langDict) {
      if (isValidTranslation(langDict[cleanKey])) {
        localizedText = langDict[cleanKey]
      } else if (isValidTranslation(langDict[key])) {
        localizedText = langDict[key]
        prefix = ''
      } else if (canonicalKey && isValidTranslation(langDict[canonicalKey])) {
        localizedText = langDict[canonicalKey]
      } else if (fallback && isValidTranslation(langDict[fallback])) {
        localizedText = langDict[fallback]
      } else if (translations.en && translations.en[cleanKey] && isValidTranslation(langDict[translations.en[cleanKey]])) {
        localizedText = langDict[translations.en[cleanKey]]
      } else {
        // Try normalized lookup
        const norm = normalizeString(cleanKey)
        for (const [dictKey, dictVal] of Object.entries(langDict)) {
          if (normalizeString(dictKey) === norm && isValidTranslation(dictVal)) {
            localizedText = dictVal
            break
          }
        }
      }
    }

    // Check direct cognate language fallback (e.g. Konkani -> Marathi, Maithili -> Hindi, Dogri -> Punjabi, Bodo -> Assamese)
    if (!localizedText) {
      const cognateCode = COGNATE_FALLBACKS[language]
      if (cognateCode && translations[cognateCode]) {
        const cogDict = translations[cognateCode]
        if (isValidTranslation(cogDict[cleanKey])) {
          localizedText = cogDict[cleanKey]
        } else if (isValidTranslation(cogDict[key])) {
          localizedText = cogDict[key]
          prefix = ''
        } else if (canonicalKey && isValidTranslation(cogDict[canonicalKey])) {
          localizedText = cogDict[canonicalKey]
        } else if (fallback && isValidTranslation(cogDict[fallback])) {
          localizedText = cogDict[fallback]
        }
      }
    }

    // 3. Return translated text in the specified language
    if (isValidTranslation(localizedText)) {
      return prefix + localizedText
    }

    // 4. If no translation exists at all, fall back to English or fallback text
    if (translations.en && isValidTranslation(translations.en[cleanKey])) {
      return prefix + translations.en[cleanKey]
    }
    if (canonicalKey && translations.en && isValidTranslation(translations.en[canonicalKey])) {
      return prefix + translations.en[canonicalKey]
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
