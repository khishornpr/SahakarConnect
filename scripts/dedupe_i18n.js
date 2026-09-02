import fs from 'fs'

let content = fs.readFileSync('src/context/I18nContext.jsx', 'utf8')

// We will find each lang object in `export const translations = { ... }`
// and remove duplicate property definitions inside each lang block.

const lines = content.split('\n')
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
    // Check if new language section starts like "  ta: {" or "  'ta': {"
    const langMatch = line.match(/^\s{2}['"]?([a-z]{2,3})['"]?:\s*\{/)
    if (langMatch) {
      currentLang = langMatch[1]
      currentLangKeys = new Set()
      resultLines.push(line)
      continue
    }

    // Check if language section ends like "  },"
    if (line.match(/^\s{2}\},?/)) {
      currentLang = null
      currentLangKeys = new Set()
      resultLines.push(line)
      continue
    }

    // Check if key line inside language
    if (currentLang) {
      const keyMatch = line.match(/^\s+['"]?([a-zA-Z0-9_]+)['"]?:\s*(.+)/)
      if (keyMatch) {
        const key = keyMatch[1]
        if (currentLangKeys.has(key)) {
          // Skip duplicate key
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
console.log('Successfully deduplicated keys in I18nContext.jsx!')
