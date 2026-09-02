import fs from 'fs'

const newTradesTranslations = {
  en: {
    'AC Technician / HVAC Repair': 'AC Technician / HVAC Repair',
    'Mason / Tile & Flooring Work': 'Mason / Tile & Flooring Work',
    'Welder / Grill & Gate Fabrication': 'Welder / Grill & Gate Fabrication',
    'Locksmith': 'Locksmith',
    'Pest Control Technician': 'Pest Control Technician',
    'RO / Water Purifier Technician': 'RO / Water Purifier Technician',
    'Solar Panel Installer/Maintenance': 'Solar Panel Installer/Maintenance',
    'Deep Cleaning Specialist (kitchen/chimney)': 'Deep Cleaning Specialist (kitchen/chimney)',
    'Sofa & Carpet Shampooing': 'Sofa & Carpet Shampooing',
    'Water Tank Cleaning': 'Water Tank Cleaning',
    'Vehicle Washing (two-wheeler/car)': 'Vehicle Washing (two-wheeler/car)',
    'Elderly Care Attendant': 'Elderly Care Attendant',
    'Child Care / Babysitter': 'Child Care / Babysitter',
    'Cook / Household Chef': 'Cook / Household Chef',
    'Laundry & Ironing Service': 'Laundry & Ironing Service',
    'Gardener / Landscaping': 'Gardener / Landscaping',
    'Movers & Packers': 'Movers & Packers',
    'Event Setup Help (tent/decoration)': 'Event Setup Help (tent/decoration)',
    coopServiceCategories: 'Cooperative Service Categories',
    standardTariffSub: 'Standardized Non-Exploitative Hourly Tariffs • 100% Cooperative Direct',
    selectTradeCategory: 'Select Trade Category',
    tradesCount: 'Trades Available',
    allTradeSpecializations: 'All Trade Specializations',
  },
  ta: {
    'AC Technician / HVAC Repair': 'ஏசி மெக்கானிக் / பழுதுபார்ப்பு',
    'Mason / Tile & Flooring Work': 'கொத்தனார் / டைல்ஸ் & தரை வேலை',
    'Welder / Grill & Gate Fabrication': 'வெல்டர் / கிரில் & கேட் தயாரிப்பு',
    'Locksmith': 'பூட்டு & சாவி மெக்கானிக்',
    'Pest Control Technician': 'பூச்சி கட்டுப்பாடு நிபுணர்',
    'RO / Water Purifier Technician': 'RO / குடிநீர் சுத்திகரிப்பு நிபுணர்',
    'Solar Panel Installer/Maintenance': 'சோலார் பேனல் பொருத்துதல் & பராமரிப்பு',
    'Deep Cleaning Specialist (kitchen/chimney)': 'ஆழ்ந்த தூய்மை நிபுணர் (சமையலறை/சிம்னி)',
    'Sofa & Carpet Shampooing': 'சோபா & கார்பெட் ஷாம்பூ வாஷ்',
    'Water Tank Cleaning': 'தண்ணீர் தொட்டி சுத்தம் செய்தல்',
    'Vehicle Washing (two-wheeler/car)': 'வாகன கழுவுதல் (இருசக்கர/கார்)',
    'Elderly Care Attendant': 'முதியோர் பராமரிப்பாளர்',
    'Child Care / Babysitter': 'குழந்தை பராமரிப்பாளர்',
    'Cook / Household Chef': 'சமையல் கலைஞர் / வீட்டு செஃப்',
    'Laundry & Ironing Service': 'சலவை & இஸ்திரி சேவை',
    'Gardener / Landscaping': 'தோட்டக்காரர் / நிலவடிவமைப்பு',
    'Movers & Packers': 'ஷிப்டிங் & பேக்கர்ஸ் சேவை',
    'Event Setup Help (tent/decoration)': 'நிகழ்வு அமைப்பு உதவி (கூடாரம்/அலங்காரம்)',
    coopServiceCategories: 'கூட்டுறவு சேவை பிரிவுகள்',
    standardTariffSub: 'சட்டபூர்வ நியாயமான மணிநேர கட்டணங்கள் • 100% நேரடி கூட்டுறவு',
    selectTradeCategory: 'சேவை தொழிலை தேர்வு செய்க',
    tradesCount: 'தொழில்கள் உள்ளன',
    allTradeSpecializations: 'அனைத்து தொழில் பிரிவுகளும்',
  },
  hi: {
    'AC Technician / HVAC Repair': 'एसी तकनीशियन / एचवीएसी मरम्मत',
    'Mason / Tile & Flooring Work': 'राजमिस्त्री / टाइल और फर्श कार्य',
    'Welder / Grill & Gate Fabrication': 'वेल्डर / ग्रिल और गेट फैब्रिकेशन',
    'Locksmith': 'ताला-चाबी मिस्त्री',
    'Pest Control Technician': 'कीट नियंत्रण तकनीशियन',
    'RO / Water Purifier Technician': 'आरओ / जल शोधक तकनीशियन',
    'Solar Panel Installer/Maintenance': 'सोलर पैनल स्थापना / रखरखाव',
    'Deep Cleaning Specialist (kitchen/chimney)': 'गहरी सफाई विशेषज्ञ (रसोई/चिमनी)',
    'Sofa & Carpet Shampooing': 'सोफा और कालीन शैम्पू धुलाई',
    'Water Tank Cleaning': 'पानी की टंकी की सफाई',
    'Vehicle Washing (two-wheeler/car)': 'वाहन धुलाई (दोपहिया/कार)',
    'Elderly Care Attendant': 'बुजुर्ग देखभाल सहायक',
    'Child Care / Babysitter': 'शिशु देखभाल / बेबीसिटर',
    'Cook / Household Chef': 'रसोइया / घरेलू बावर्ची',
    'Laundry & Ironing Service': 'धुलाई और इस्त्री सेवा',
    'Gardener / Landscaping': 'माली / बागवानी सेवा',
    'Movers & Packers': 'मूवर्स एंड पैकर्स',
    'Event Setup Help (tent/decoration)': 'कार्यक्रम व्यवस्था सहायता (टेंट/सजावट)',
    coopServiceCategories: 'सहकारी सेवा श्रेणियां',
    standardTariffSub: 'मानकीकृत गैर-शोषक प्रति घंटा दरें • 100% प्रत्यक्ष सहकारी',
    selectTradeCategory: 'व्यापार श्रेणी चुनें',
    tradesCount: 'उपलब्ध कार्य',
    allTradeSpecializations: 'सभी व्यापार विशेषज्ञताएं',
  },
  mr: {
    'AC Technician / HVAC Repair': 'एसी तंत्रज्ञ / एचव्हीएसी दुरुस्ती',
    'Mason / Tile & Flooring Work': 'गवंडी / टाइल्स आणि फरशी काम',
    'Welder / Grill & Gate Fabrication': 'वेल्डर / ग्रिल आणि गेट फॅब्रिकेशन',
    'Locksmith': 'कुलूप-किल्ली कारागीर',
    'Pest Control Technician': 'कीटक नियंत्रण तंत्रज्ञ',
    'RO / Water Purifier Technician': 'आरओ / वॉटर प्युरिफायर तंत्रज्ञ',
    'Solar Panel Installer/Maintenance': 'सौर पॅनेल बसवणे / देखभाल',
    'Deep Cleaning Specialist (kitchen/chimney)': 'खोल स्वच्छता तज्ज्ञ (स्वयंपाकघर/चिमणी)',
    'Sofa & Carpet Shampooing': 'सोफा आणि गालिचा शाम्पू स्वच्छता',
    'Water Tank Cleaning': 'पाण्याची टाकी स्वच्छता',
    'Vehicle Washing (two-wheeler/car)': 'वाहन धुलाई (दुचाकी/कार)',
    'Elderly Care Attendant': 'ज्येष्ठ नागरिक काळजीवाहक',
    'Child Care / Babysitter': 'बाल संगोपन / बेबीसिटर',
    'Cook / Household Chef': 'स्वयंपाकी / घरगुती शेफ',
    'Laundry & Ironing Service': 'धुलाई आणि इस्त्री सेवा',
    'Gardener / Landscaping': 'माळी / बागकाम',
    'Movers & Packers': 'मूव्हर्स आणि पॅकर्स',
    'Event Setup Help (tent/decoration)': 'कार्यक्रम व्यवस्था मदत (मंडप/सजावट)',
    coopServiceCategories: 'सहकारी सेवा वर्गवारी',
    standardTariffSub: 'प्रमाणित योग्य तास दर • १००% थेट सहकारी संस्था',
    selectTradeCategory: 'सेवा वर्ग निवडा',
    tradesCount: 'उपलब्ध सेवा',
    allTradeSpecializations: 'सर्व सेवा विशेषीकरणे',
  },
  te: {
    'AC Technician / HVAC Repair': 'ఏసీ టెక్నీషియన్ / రిపేర్',
    'Mason / Tile & Flooring Work': 'మేస్త్రీ / టైల్స్ మరియు ఫ్లోరింగ్ పని',
    'Welder / Grill & Gate Fabrication': 'వెల్డర్ / గ్రిల్ & గేట్ తయారీ',
    'Locksmith': 'తాళాలు & తాళంచెవుల నిపుణుడు',
    'Pest Control Technician': 'పురుగుల నియంత్రణ నిపుణుడు',
    'RO / Water Purifier Technician': 'RO / వాటర్ ప్యూరిఫైయర్ టెక్నీషియన్',
    'Solar Panel Installer/Maintenance': 'సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్ / నిర్వహణ',
    'Deep Cleaning Specialist (kitchen/chimney)': 'డీప్ క్లీనింగ్ స్పెషలిస్ట్ (వంటగది/చిమ్నీ)',
    'Sofa & Carpet Shampooing': 'సోఫా & కార్పెట్ షాంపూ క్లీనింగ్',
    'Water Tank Cleaning': 'నీటి ట్యాంక్ క్లీనింగ్',
    'Vehicle Washing (two-wheeler/car)': 'వాహన వాషింగ్ (బైక్/కార్)',
    'Elderly Care Attendant': 'వృద్ధుల సంరక్షకుడు',
    'Child Care / Babysitter': 'పిల్లల సంరక్షకురాలు',
    'Cook / Household Chef': 'వంట మనిషి / గృహ చెఫ్',
    'Laundry & Ironing Service': 'లాండ్రీ & ఇస్త్రీ సేవ',
    'Gardener / Landscaping': 'తోటమాలి / ల్యాండ్‌స్కేపింగ్',
    'Movers & Packers': 'మూవర్స్ & ప్యాకర్స్',
    'Event Setup Help (tent/decoration)': 'ఈవెంట్ సెటప్ సహాయం (టెంట్/డెకరేషన్)',
    coopServiceCategories: 'సహకార సేవా విభాగాలు',
    standardTariffSub: 'ప్రామాణిక గంట వేతనాలు • 100% ప్రత్యక్ష సహకార సంస్థ',
    selectTradeCategory: 'సేవా విభాగాన్ని ఎంచుకోండి',
    tradesCount: 'అందుబాటులో ఉన్న పనులు',
    allTradeSpecializations: 'అన్ని పని విభాగాలు',
  },
  kn: {
    'AC Technician / HVAC Repair': 'ಎಸಿ ತಂತ್ರಜ್ಞ / ರಿಪೇರಿ',
    'Mason / Tile & Flooring Work': 'ಮೇಸ್ತ್ರಿ / ಟೈಲ್ಸ್ ಮತ್ತು ಫ್ಲೋರಿಂಗ್ ಕೆಲಸ',
    'Welder / Grill & Gate Fabrication': 'ವೆಲ್ಡರ್ / ಗ್ರಿಲ್ & ಗೇಟ್ ಕೆಲಸ',
    'Locksmith': 'ಬೀಗ & ಕೀ ತಜ್ಞ',
    'Pest Control Technician': 'ಕೀಟ ನಿಯಂತ್ರಣ ತಂತ್ರಜ್ಞ',
    'RO / Water Purifier Technician': 'ಆರ್‌ಒ / ವಾಟರ್ ಪ್ಯೂರಿಫೈಯರ್ ತಂತ್ರಜ್ಞ',
    'Solar Panel Installer/Maintenance': 'ಸೌರ ಫಲಕ ಅಳವಡಿಕೆ / ನಿರ್ವಹಣೆ',
    'Deep Cleaning Specialist (kitchen/chimney)': 'ಆಳವಾದ ಶುಚಿಗೊಳಿಸುವಿಕೆ ತಜ್ಞ',
    'Sofa & Carpet Shampooing': 'ಸೋಫಾ & ಕಾರ್ಪೆಟ್ ಶಾಂಪೂ ವಾಶ್',
    'Water Tank Cleaning': 'ನೀರಿನ ಟ್ಯಾಂಕ್ ಶುಚಿಗೊಳಿಸುವಿಕೆ',
    'Vehicle Washing (two-wheeler/car)': 'ವಾಹನ ತೊಳೆಯುವಿಕೆ (ಬೈಕ್/ಕಾರ್)',
    'Elderly Care Attendant': 'ಹಿರಿಯ ನಾಗರಿಕರ ಆರೈಕೆದಾರ',
    'Child Care / Babysitter': 'ಮಕ್ಕಳ ಆರೈಕೆದಾರ',
    'Cook / Household Chef': 'ಅಡುಗೆಯವರು / ಮನೆ ಬಾಣಸಿಗ',
    'Laundry & Ironing Service': 'ಲಾಂಡ್ರಿ & ಇಸ್ತ್ರಿ ಸೇವೆ',
    'Gardener / Landscaping': 'ತೋಟಗಾರ / ಲ್ಯಾಂಡ್‌ಸ್ಕೇಪಿಂಗ್',
    'Movers & Packers': 'ಮೂವರ್ಸ್ & ಪ್ಯಾಕರ್ಸ್',
    'Event Setup Help (tent/decoration)': 'ಕಾರ್ಯಕ್ರಮ ವ್ಯವಸ್ಥೆ ಸಹಾಯ (ಟೆಂಟ್/ಅಲಂಕಾರ)',
    coopServiceCategories: 'ಸಹಕಾರಿ ಸೇವಾ ವರ್ಗಗಳು',
    standardTariffSub: 'ಪ್ರಮಾಣಿತ ಗಂಟೆಯ ದರಗಳು • 100% ನೇರ ಸಹಕಾರಿ',
    selectTradeCategory: 'ಸೇವಾ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    tradesCount: 'ಲಭ್ಯವಿರುವ ಕೆಲಸಗಳು',
    allTradeSpecializations: 'ಎಲ್ಲಾ ಸೇವಾ ಪರಿಣತಿಗಳು',
  },
  bn: {
    'AC Technician / HVAC Repair': 'এসি টেকনিশিয়ান / মেরামত',
    'Mason / Tile & Flooring Work': 'রাজমিস্ত্রি / টাইলস ও মেঝে কাজ',
    'Welder / Grill & Gate Fabrication': 'ওয়েল্ডার / গ্রিল ও গেট নির্মাণ',
    'Locksmith': 'তালা-চাবি মিস্ত্রি',
    'Pest Control Technician': 'কীটপতঙ্গ নিয়ন্ত্রণ কর্মী',
    'RO / Water Purifier Technician': 'আরও / জল পরিশোধক মেকানিক',
    'Solar Panel Installer/Maintenance': 'সোলার প্যানেল স্থাপন ও রক্ষণাবেক্ষণ',
    'Deep Cleaning Specialist (kitchen/chimney)': 'ডিপ ক্লিনিং বিশেষজ্ঞ (রান্নাঘর/চিমনি)',
    'Sofa & Carpet Shampooing': 'সোফা ও কার্পেট শ্যাম্পু ওয়াশ',
    'Water Tank Cleaning': 'জলের ট্যাঙ্ক পরিষ্কার',
    'Vehicle Washing (two-wheeler/car)': 'যানবাহন ধোয়া (বাইক/গাড়ি)',
    'Elderly Care Attendant': 'বয়স্কদের সেবাকারী',
    'Child Care / Babysitter': 'শিশু যত্নকারী / বেবিসিটার',
    'Cook / Household Chef': 'পাচক / বাড়ির বাবুর্চি',
    'Laundry & Ironing Service': 'লন্ড্রি ও ইস্ত্রি পরিষেবা',
    'Gardener / Landscaping': 'মালী / বাগান পরিচর্যা',
    'Movers & Packers': 'মুভার্স অ্যান্ড প্যাকার্স',
    'Event Setup Help (tent/decoration)': 'ইভেন্ট সেটআপ সাহায্য (প্যান্ডেল/সাজসজ্জা)',
    coopServiceCategories: 'সমবায় পরিষেবা বিভাগসমূহ',
    standardTariffSub: 'মানসম্মত ঘণ্টাপ্রতি দর • ১০০% সরাসরি সমবায় ব্যবস্থা',
    selectTradeCategory: 'কাজের বিভাগ বেছে নিন',
    tradesCount: 'উপলব্ধ পরিষেবা',
    allTradeSpecializations: 'সকল কাজের বিশেষীকরণ',
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
console.log('Successfully injected and deduplicated service category translations in I18nContext.jsx!')
