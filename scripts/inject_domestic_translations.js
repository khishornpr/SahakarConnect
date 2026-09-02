import fs from 'fs'

const newTradesTranslations = {
  en: {
    'Dishwashing & Kitchen Utility': 'Dishwashing & Kitchen Utility',
    'House Organization & Wardrobe Setup': 'House Organization & Wardrobe Setup',
    'Domestic works': 'Domestic Works',
  },
  ta: {
    'Dishwashing & Kitchen Utility': 'பாத்திரம் கழுவுதல் & சமையலறை பயன்பாடு',
    'House Organization & Wardrobe Setup': 'வீட்டு வார்டுரோப் & பொருள் அமைப்பு',
    'Domestic works': 'வீட்டு வேலைகள்',
  },
  hi: {
    'Dishwashing & Kitchen Utility': 'बर्तन धुलाई और रसोई उपयोगिता',
    'House Organization & Wardrobe Setup': 'घर अलमारी और व्यवस्थापन',
    'Domestic works': 'घरेलू कार्य',
  },
  mr: {
    'Dishwashing & Kitchen Utility': 'भांडी घासणे आणि स्वयंपाकघर मदत',
    'House Organization & Wardrobe Setup': 'घर आणि कपाट व्यवस्थापन',
    'Domestic works': 'घरगुती कामे',
  },
  te: {
    'Dishwashing & Kitchen Utility': 'గిన్నెలు కడగడం & వంటగది సహాయం',
    'House Organization & Wardrobe Setup': 'ఇంటి వార్డ్‌రోబ్ & అమరిక',
    'Domestic works': 'గృహ పనులు',
  },
  kn: {
    'Dishwashing & Kitchen Utility': 'ಪಾತ್ರೆ ತೊಳೆಯುವುದು & ಅಡುಗೆಮನೆ ಕೆಲಸ',
    'House Organization & Wardrobe Setup': 'ಮನೆ ಮತ್ತು ವಾರ್ಡ್ರೋಬ್ ಜೋಡಣೆ',
    'Domestic works': 'ಮನೆ ಕೆಲಸಗಳು',
  },
  bn: {
    'Dishwashing & Kitchen Utility': 'বাসন মাজা ও রান্নাঘরের কাজ',
    'House Organization & Wardrobe Setup': 'ঘর ও পোশাকের আলমারি গোছানো',
    'Domestic works': 'গৃহস্থালির কাজ',
  },
}

let i18nContent = fs.readFileSync('src/context/I18nContext.jsx', 'utf8')

function injectDict(content, langKey, entries) {
  const regex = new RegExp('(\\s+' + langKey + ':\\s*\\{)')
  const match = content.match(regex)
  if (!match) return content

  const startIdx = match.index + match[0].length
  const lines = Object.entries(entries)
    .map(([k, v]) => `\n    ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('')

  return content.slice(0, startIdx) + lines + content.slice(startIdx)
}

for (const [lang, dict] of Object.entries(newTradesTranslations)) {
  i18nContent = injectDict(i18nContent, lang, dict)
}

fs.writeFileSync('src/context/I18nContext.jsx', i18nContent, 'utf8')

// Run deduplication
const lines = i18nContent.split('\n')
const resultLines = []
let currentLang = null
let currentLangKeys = new Set()
let inTranslations = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  
  if (line.includes('export const translations = {')) {
    inTranslations = true
    resultLines.push(line)
    continue
  }

  if (inTranslations) {
    const langMatch = line.match(/^\s{2}['"]?([a-z]{2,3})['"]?:\s*\{/)
    if (langMatch) {
      currentLang = langMatch[1]
      currentLangKeys = new Set()
      resultLines.push(line)
      continue
    }

    if (line.match(/^\s{2}\},?/)) {
      currentLang = null
      currentLangKeys = new Set()
      resultLines.push(line)
      continue
    }

    if (currentLang) {
      const keyMatch = line.match(/^\s+['"]?([^'":]+)['"]?:\s*(.+)/)
      if (keyMatch) {
        const key = keyMatch[1]
        if (currentLangKeys.has(key)) {
          continue
        } else {
          currentLangKeys.add(key)
          resultLines.push(line)
          continue
        }
      }
    }
  }

  resultLines.push(line)
}

fs.writeFileSync('src/context/I18nContext.jsx', resultLines.join('\n'), 'utf8')
console.log('Successfully injected domestic works translations in I18nContext.jsx!')
