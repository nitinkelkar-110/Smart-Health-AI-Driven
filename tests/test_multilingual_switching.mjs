/**
 * Automated Verification: Language Switching Bug Fix
 * Tests Hindi -> Marathi shift and all 24+ global languages
 */

import { translations, getTranslation } from '../src/i18n/index.js';
import { GLOBAL_LANGUAGES } from '../src/services/languageRegistry.js';
import { queryRuleBasedAssistant } from '../src/services/aiService.js';
import { INITIAL_FACILITIES, INITIAL_INVENTORY, INITIAL_BEDS, INITIAL_DOCTORS, INITIAL_ALERTS } from '../src/data/initialData.js';

let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${label}`);
  } else {
    failed++;
    console.error(`[FAIL] ${label}`);
  }
}

console.log('=== MULTILINGUAL SWITCHING VALIDATION ===\n');

// 1. Verify Hindi vs Marathi shift
const hi = getTranslation('hi');
const mr = getTranslation('mr');

check('Marathi differs from Hindi on Dashboard title', mr.dashboardTitle !== hi.dashboardTitle);
check('Marathi uses "जिल्हा डॅशबोर्ड" for Nav', mr.navDistrictDashboard === 'जिल्हा डॅशबोर्ड');
check('Hindi uses "जिला डैशबोर्ड" for Nav', hi.navDistrictDashboard === 'जिला डैशबोर्ड');
check('Marathi uses "आरोग्य केंद्रे"', mr.navHealthCentres === 'आरोग्य केंद्रे');
check('Hindi uses "स्वास्थ्य केंद्र"', hi.navHealthCentres === 'स्वास्थ्य केंद्र');
check('Marathi uses "औषध साठा (इन्व्हेंटरी)"', mr.navMedicineInventory === 'औषध साठा (इन्व्हेंटरी)');
check('Hindi uses "दवा भंडार (इन्वेंट्री)"', hi.navMedicineInventory === 'दवा भंडार (इन्वेंट्री)');
check('Marathi brand is distinct', mr.brandName.includes('मेडिग्रीड') && hi.brandName.includes('मेडिग्रिड'));

// 2. Verify all other 22 global languages
const languagesToTest = [
  'bn', 'ta', 'te', 'gu', 'kn', 'ml', 'pa', 'ur', 'sa',
  'ar', 'es', 'fr', 'de', 'ru', 'zh', 'ja', 'ko', 'pt',
  'he', 'fa', 'sw'
];

for (const langCode of languagesToTest) {
  const t = getTranslation(langCode);
  check(`Language [${langCode}] returns localized dashboardTitle`, t.dashboardTitle && t.dashboardTitle !== translations.en.dashboardTitle);
  check(`Language [${langCode}] returns localized navDistrictDashboard`, t.navDistrictDashboard && t.navDistrictDashboard !== translations.en.navDistrictDashboard);
}

// 3. Test Rule-Based AI Assistant language outputs
const context = {
  facilities: INITIAL_FACILITIES,
  inventory: INITIAL_INVENTORY,
  beds: INITIAL_BEDS,
  doctors: INITIAL_DOCTORS,
  transfers: [],
  alerts: INITIAL_ALERTS,
  atRiskFacilities: [],
};

const respHi = queryRuleBasedAssistant('medicine shortage', context, 'hi');
const respMr = queryRuleBasedAssistant('medicine shortage', context, 'mr');
const respEn = queryRuleBasedAssistant('medicine shortage', context, 'en');

check('AI Assistant responds in Hindi when lang=hi', respHi.includes('स्वास्थ्य केंद्रों में दवाओं की कमी') || respHi.includes('आवश्यक दवाओं की कोई गंभीर कमी'));
check('AI Assistant responds in Marathi when lang=mr', respMr.includes('आरोग्य केंद्रांमध्ये औषध तुटवड्याचा धोका') || respMr.includes('औषधांचा गंभीर तुटवडा नाही'));
check('AI Assistant responds in English when lang=en', respEn.includes('Facilities Facing Projected Medicine Shortages') || respEn.includes('All health facilities currently report adequate'));
check('AI Assistant Marathi response differs from Hindi response', respMr !== respHi);

// 4. Test Surplus & Redistribution AI responses in Marathi and Hindi
const respSurplusMr = queryRuleBasedAssistant('surplus excess inventory', context, 'mr');
const respSurplusHi = queryRuleBasedAssistant('surplus excess inventory', context, 'hi');
check('AI Surplus response in Marathi contains Marathi phrases', respSurplusMr.includes('पुरेशा अतिरिक्त साठ्यासह') || respSurplusMr.includes('अतिरिक्त साठा'));
check('AI Surplus response in Hindi contains Hindi phrases', respSurplusHi.includes('पर्याप्त अधिशेष वाले केंद्र') || respSurplusHi.includes('अधिशेष'));
check('AI Surplus Marathi response differs from Hindi', respSurplusMr !== respSurplusHi);

console.log('\n========================================');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
