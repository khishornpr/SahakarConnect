import fs from 'fs'

let content = fs.readFileSync('src/context/I18nContext.jsx', 'utf8')

// Replace keys and values for artisansUnit, supervisedArtisans, etc.
content = content.replaceAll('artisansUnit:', 'workersUnit:')
content = content.replaceAll('"artisansUnit":', '"workersUnit":')
content = content.replaceAll('\'artisansUnit\':', '\'workersUnit\':')

content = content.replaceAll('supervisedArtisans', 'supervisedWorkers')
content = content.replaceAll('jobDetailsArtisan', 'jobDetailsWorker')

// Replace remaining occurrences in strings
content = content.replaceAll('artisans', 'workers')
content = content.replaceAll('Artisans', 'Workers')
content = content.replaceAll('artisan', 'worker')
content = content.replaceAll('Artisan', 'Worker')

fs.writeFileSync('src/context/I18nContext.jsx', content, 'utf8')
console.log('Successfully updated I18nContext.jsx: artisan -> worker')
