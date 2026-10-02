import fs from 'fs';
import path from 'path';
import { translations } from './src/translations/index.js';

const allLanguages = Object.keys(translations);
console.log(`Loaded ${allLanguages.length} languages.`);

const filesToAudit = [];

function getFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(full);
    } else if (full.endsWith('.jsx')) {
      filesToAudit.push(full);
    }
  }
}

getFiles('./src/pages');
getFiles('./src/components');

console.log(`Auditing ${filesToAudit.length} JSX files across all 5 portals and shared components...`);

const auditResults = [];

for (const file of filesToAudit) {
  const content = fs.readFileSync(file, 'utf-8');
  const usesTranslation = content.includes('useTranslation') || content.includes('t(');
  
  // Extract all t('key', 'fallback') or t(val, val) calls
  const tMatches = Array.from(content.matchAll(/\bt\(\s*(?:(['"`])(.*?)\1|([a-zA-Z0-9_$.]+))\s*(?:,\s*(['"`])(.*?)\4)?\s*\)/g));
  
  // Find potential hardcoded text in JSX tags: >Some English Text<
  const hardcodedMatches = [];
  const tagTextMatches = content.matchAll(/>\s*([A-Za-z][A-Za-z0-9 ,.?!:;()/'"–—+-]{3,})\s*</g);
  for (const m of tagTextMatches) {
    const text = m[1].trim();
    // Exclude common symbols, single letters, component syntax
    if (!text.startsWith('{') && !text.endsWith('}') && !text.includes('className') && text.length > 3) {
      hardcodedMatches.push(text);
    }
  }

    const normFile = file.replace(/\\/g, '/');
    auditResults.push({
      file,
      portal: normFile.includes('pages/worker') ? 'Worker' :
              normFile.includes('pages/household') ? 'Household' :
              normFile.includes('pages/cooperative') ? 'Cooperative' :
              normFile.includes('pages/officer') ? 'Officer' :
              normFile.includes('pages/manager') ? 'Manager' :
              normFile.includes('pages/auth') ? 'Auth' :
              normFile.includes('pages/') ? 'Other Pages' : 'Shared Components',
      usesTranslation,
      tCallCount: tMatches.length,
      untranslatedSnippets: hardcodedMatches
    });
}

console.log('\n=== PORTAL AUDIT SUMMARY ===');
const portalSummary = {};
for (const res of auditResults) {
  if (!portalSummary[res.portal]) {
    portalSummary[res.portal] = { totalFiles: 0, filesWithT: 0, totalTCalls: 0, potentialHardcodedCount: 0, untranslatedItems: [] };
  }
  const s = portalSummary[res.portal];
  s.totalFiles++;
  if (res.usesTranslation) s.filesWithT++;
  s.totalTCalls += res.tCallCount;
  s.potentialHardcodedCount += res.untranslatedSnippets.length;
  if (res.untranslatedSnippets.length > 0) {
    s.untranslatedItems.push({ file: res.file, snippets: res.untranslatedSnippets });
  }
}

for (const [portal, stat] of Object.entries(portalSummary)) {
  console.log(`\n[${portal} Portal]`);
  console.log(`- Files: ${stat.filesWithT}/${stat.totalFiles} use translations`);
  console.log(`- Total t() translation calls: ${stat.totalTCalls}`);
  console.log(`- Potential untranslated JSX tags: ${stat.potentialHardcodedCount}`);
  if (stat.untranslatedItems.length > 0) {
    for (const item of stat.untranslatedItems) {
      console.log(`  * ${item.file}:`, item.snippets.slice(0, 5));
    }
  }
}
