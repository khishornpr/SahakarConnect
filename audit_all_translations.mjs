import fs from 'fs';

const files = fs.readdirSync('./src/translations').filter(f => f.endsWith('.js') && f !== 'index.js');
const en = (await import('./src/translations/en.js')).default;
const totalKeys = Object.keys(en).length;

console.log('Language Translation Quality Audit:');
console.log('-------------------------------------------------------------------------');

const stats = {};

for (const file of files) {
  const code = file.replace('.js', '');
  if (code === 'en') continue;
  
  const dict = (await import('./src/translations/' + file)).default;
  let missing = 0;
  let englishUntranslated = 0;
  let devanagariInNonDev = 0;
  let validTranslated = 0;

  const isDevanagariLang = ['hi', 'mr', 'ne', 'sa', 'kok', 'mai', 'doi', 'brx', 'sd'].includes(code);

  for (const [k, enVal] of Object.entries(en)) {
    const val = dict[k];
    if (!val) {
      missing++;
    } else if (val === enVal && typeof val === 'string' && val.length > 3 && /[a-zA-Z]{3,}/.test(val)) {
      englishUntranslated++;
    } else if (!isDevanagariLang && /[\u0900-\u0963\u0966-\u097F]/.test(val)) {
      devanagariInNonDev++;
    } else {
      validTranslated++;
    }
  }
  
  stats[code] = { total: totalKeys, missing, englishUntranslated, devanagariInNonDev, validTranslated };
  console.log(code.padEnd(5) + ' | Missing: ' + String(missing).padStart(4) + ' | English Leftover: ' + String(englishUntranslated).padStart(4) + ' | Hindi Script: ' + String(devanagariInNonDev).padStart(4) + ' | Valid: ' + String(validTranslated).padStart(4));
}
