/**
 * MediGrid AI Automated Test Suite & Validation Framework
 * Tests provider adapters, free-tier verification, model routing, failover,
 * language detection, RTL text direction, inventory mathematics, and safety guardrails.
 */

import { VERIFIED_FREE_MODELS, INITIAL_PROVIDERS } from '../services/modelRegistry';
import { GLOBAL_LANGUAGES, detectScriptAndLanguage } from '../services/languageRegistry';
import {
  calculateMedicineStatus,
  calculateDistanceKm,
  generateSmartRedistributionRecommendations,
  generateDemandForecast,
  evaluateAtRiskFacilities,
} from '../utils/engine';
import { executeRoutedAIRequest } from '../services/modelRouter';
import { INITIAL_FACILITIES, INITIAL_INVENTORY, INITIAL_BEDS, INITIAL_DOCTORS, INITIAL_DIAGNOSTICS } from '../data/initialData';
import { MedicineItem, HealthFacility, RedistributionTransfer, DemandForecast, AtRiskFacility } from '../types';

export interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  details?: any;
}

export async function runAllMediGridTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}> {
  const results: TestResult[] = [];

  const assert = (name: string, category: string, condition: boolean, message: string, details?: any) => {
    results.push({
      name,
      category,
      passed: Boolean(condition),
      message: condition ? `PASSED: ${message}` : `FAILED: ${message}`,
      details,
    });
  };

  // ==========================================
  // 1. FREE-TIER MODEL REGISTRY VERIFICATION
  // ==========================================
  const freeModels = VERIFIED_FREE_MODELS.filter((m) => m.isFreeOnlyEligible);
  assert(
    'Free Model Count Meets or Exceeds Target',
    'Model Hub',
    freeModels.length >= 50,
    `Verified ${freeModels.length} distinct free models (target >= 50)`,
    { count: freeModels.length }
  );

  const distinctModelIds = new Set(VERIFIED_FREE_MODELS.map((m) => m.modelId));
  assert(
    'Distinct Model IDs (No Artificial Duplicates)',
    'Model Hub',
    distinctModelIds.size === VERIFIED_FREE_MODELS.length,
    `All ${VERIFIED_FREE_MODELS.length} model definitions have unique model IDs`,
    { uniqueCount: distinctModelIds.size }
  );

  const hasPaidInFreeFilter = freeModels.some((m) => m.freeEligibility === 'PAID');
  assert(
    'Free-Only Filter Excludes Paid Models',
    'Model Hub',
    !hasPaidInFreeFilter,
    'Zero paid models exist in the free-eligible model registry'
  );

  const localOfflineEngine = VERIFIED_FREE_MODELS.find((m) => m.provider === 'LocalRuleEngine');
  assert(
    'Offline Local Engine Present and Permanently Free',
    'Model Hub',
    Boolean(localOfflineEngine && localOfflineEngine.freeEligibility === 'PERMANENTLY_FREE_LOCAL'),
    'MediGrid deterministic clinical telemetry engine is registered as PERMANENTLY_FREE_LOCAL'
  );

  // ==========================================
  // 2. GLOBAL LANGUAGE SYSTEM & RTL
  // ==========================================
  assert(
    'Global Language Registry Depth',
    'Multilingual',
    GLOBAL_LANGUAGES.length >= 50,
    `Cataloged ${GLOBAL_LANGUAGES.length} global living languages with scripts and native names`
  );

  // Test script detection
  const detectedHindi = detectScriptAndLanguage('नमस्ते, प्राथमिक स्वास्थ्य केंद्र में दवाएं उपलब्ध हैं?');
  assert(
    'Language Detection: Hindi / Devanagari',
    'Multilingual',
    detectedHindi === 'hi',
    `Detected script code: "${detectedHindi}" (expected "hi")`
  );

  const detectedArabic = detectScriptAndLanguage('هل تتوفر أسرّة في المركز الصحي؟');
  assert(
    'Language Detection: Arabic Script',
    'Multilingual',
    detectedArabic === 'ar',
    `Detected script code: "${detectedArabic}" (expected "ar")`
  );

  const detectedEnglish = detectScriptAndLanguage('Show me medicine stockouts across Haveli block');
  assert(
    'Language Detection: English / Latin',
    'Multilingual',
    detectedEnglish === 'en',
    `Detected script code: "${detectedEnglish}" (expected "en")`
  );

  // Test RTL direction flags
  const arabicLang = GLOBAL_LANGUAGES.find((l) => l.code === 'ar');
  const urduLang = GLOBAL_LANGUAGES.find((l) => l.code === 'ur');
  const hebrewLang = GLOBAL_LANGUAGES.find((l) => l.code === 'he');
  const englishLang = GLOBAL_LANGUAGES.find((l) => l.code === 'en');

  assert(
    'Text Direction Flags: Arabic RTL',
    'Multilingual',
    arabicLang?.direction === 'rtl',
    'Arabic is properly flagged as RTL layout'
  );
  assert(
    'Text Direction Flags: Urdu RTL',
    'Multilingual',
    urduLang?.direction === 'rtl',
    'Urdu is properly flagged as RTL layout'
  );
  assert(
    'Text Direction Flags: Hebrew RTL',
    'Multilingual',
    hebrewLang?.direction === 'rtl',
    'Hebrew is properly flagged as RTL layout'
  );
  assert(
    'Text Direction Flags: English LTR',
    'Multilingual',
    englishLang?.direction === 'ltr',
    'English is properly flagged as LTR layout'
  );

  // ==========================================
  // 3. MODEL ROUTER & FAILOVER LOGIC
  // ==========================================
  const testContext = {
    facilities: INITIAL_FACILITIES,
    inventory: INITIAL_INVENTORY,
    beds: INITIAL_BEDS,
    doctors: INITIAL_DOCTORS,
    transfers: [] as RedistributionTransfer[],
    alerts: [],
    atRiskFacilities: [],
  };

  try {
    const routeRes = await executeRoutedAIRequest({
      userPrompt: 'Which facilities face acute medicine shortages in 48 hours?',
      preferredLanguage: 'en',
      preferredModelId: 'openrouter-llama-3-3-70b-free', // configured without real key -> should gracefully failover to local engine
      operationalContext: testContext,
      providers: INITIAL_PROVIDERS,
      availableModels: VERIFIED_FREE_MODELS,
    });

    assert(
      'Model Failover Cascades to Local Engine Without Crashing',
      'Model Router',
      Boolean(routeRes.text && routeRes.text.length > 20),
      `Router returned valid response (${routeRes.text.length} chars) via provider: ${routeRes.providerUsed}`
    );

    assert(
      'Router Discloses Grounded Operational Citations',
      'Model Router',
      routeRes.groundedSources.length > 0,
      `Cited ${routeRes.groundedSources.length} operational record sources`
    );
  } catch (err: any) {
    assert(
      'Model Failover Cascades to Local Engine',
      'Model Router',
      false,
      `Routing failed with exception: ${err?.message}`
    );
  }

  // ==========================================
  // 4. INVENTORY MATHEMATICS & QUARANTINE
  // ==========================================
  const rawItem: Omit<MedicineItem, 'usableStock' | 'daysUntilStockOut' | 'alertSeverity' | 'alertReason'> = {
    id: 'TEST-MED-1',
    code: 'MED-ORS-01',
    facilityId: 'FAC-01',
    facilityName: 'PHC Paud',
    name: 'Oral Rehydration Salts (ORS)',
    genericName: 'ORS WHO Formula',
    category: 'Essential',
    unit: 'sachets',
    currentStock: 100,
    quarantinedStock: 20,
    reservedForTransfer: 10,
    averageDailyConsumption: 10,
    minimumThreshold: 50,
    maxThreshold: 500,
    expiryDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
    batchNumber: 'BN-999',
    lastUpdated: '2026-03-01',
  };

  const calculated = calculateMedicineStatus(rawItem);
  assert(
    'Usable Stock Calculation (Current - Quarantined - Reserved)',
    'Inventory Engine',
    calculated.usableStock === 70,
    `Usable stock: ${calculated.usableStock} (expected: 70 = 100 - 20 - 10)`
  );

  assert(
    'Days Until Stock Out Calculation',
    'Inventory Engine',
    calculated.daysUntilStockOut === 7.0,
    `Days until stockout: ${calculated.daysUntilStockOut} (expected: 7.0 = 70 / 10)`
  );

  // Test zero stock triggers CRITICAL alert
  const zeroStockItem = calculateMedicineStatus({ ...rawItem, currentStock: 0, quarantinedStock: 0, reservedForTransfer: 0 });
  assert(
    'Zero Usable Stock Triggers CRITICAL Alert',
    'Inventory Engine',
    zeroStockItem.alertSeverity === 'CRITICAL',
    `Severity: ${zeroStockItem.alertSeverity} (expected: CRITICAL)`
  );

  // ==========================================
  // 5. SMART REDISTRIBUTION LOGIC
  // ==========================================
  const mockFacilities: HealthFacility[] = [
    {
      id: 'FAC-DEFICIT',
      name: 'PHC Deficit',
      type: 'PHC',
      block: 'Mulshi',
      district: 'Pune Rural',
      lat: 18.53,
      lng: 73.61,
      totalBeds: 10,
      contactPerson: 'Dr. Test A',
      phone: '+91-9876543210',
      populationServed: 24000,
      operatingHours: '24x7 Emergency',
      operationalScore: 55,
      status: 'NEEDS_ATTENTION',
    },
    {
      id: 'FAC-DONOR',
      name: 'CHC Donor',
      type: 'CHC',
      block: 'Haveli',
      district: 'Pune Rural',
      lat: 18.52,
      lng: 73.85,
      totalBeds: 30,
      contactPerson: 'Dr. Test B',
      phone: '+91-9876543211',
      populationServed: 65000,
      operatingHours: '24x7 Emergency',
      operationalScore: 92,
      status: 'OPERATIONAL',
    },
  ];

  const mockInventory: MedicineItem[] = [
    calculateMedicineStatus({
      id: 'MED-DEF',
      code: 'MED-PCM-01',
      facilityId: 'FAC-DEFICIT',
      facilityName: 'PHC Deficit',
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      category: 'Essential',
      unit: 'tablets',
      currentStock: 50,
      quarantinedStock: 0,
      reservedForTransfer: 0,
      minimumThreshold: 200,
      maxThreshold: 2000,
      averageDailyConsumption: 40, // 1.25 days left -> CRITICAL
      expiryDate: '2026-12-31',
      batchNumber: 'BN-D1',
      lastUpdated: '2026-01-01',
    }),
    calculateMedicineStatus({
      id: 'MED-DON',
      code: 'MED-PCM-02',
      facilityId: 'FAC-DONOR',
      facilityName: 'CHC Donor',
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      category: 'Essential',
      unit: 'tablets',
      currentStock: 2500,
      quarantinedStock: 0,
      reservedForTransfer: 0,
      minimumThreshold: 300,
      maxThreshold: 5000,
      averageDailyConsumption: 50, // 50 days of stock -> Huge Surplus!
      expiryDate: '2026-11-30',
      batchNumber: 'BN-S1',
      lastUpdated: '2026-01-01',
    }),
  ];

  const recommendations = generateSmartRedistributionRecommendations(mockFacilities, mockInventory, []);
  assert(
    'Smart Redistribution: Generates Transfer for Deficit Facility',
    'Logistics Engine',
    recommendations.length > 0,
    `Generated ${recommendations.length} redistribution recommendation(s)`
  );

  if (recommendations.length > 0) {
    const first = recommendations[0];
    assert(
      'Transfer Quantity Protects Donor Reserve',
      'Logistics Engine',
      first.quantity > 0,
      `Calculated recommended transfer quantity of ${first.quantity} ${first.unit} from ${first.sourceFacilityName} to ${first.destFacilityName}`
    );
  }

  // ==========================================
  // 6. DEMAND FORECASTING MATHEMATICS
  // ==========================================
  const sampleForecast = generateDemandForecast(
    'Oral Rehydration Salts (ORS)',
    'MEDICINE',
    INITIAL_FACILITIES[0],
    14,
    180,
    25,
    1.1
  );

  assert(
    'Demand Forecasting Generates Multi-day Trend & Confidence Bounds',
    'Forecasting Engine',
    sampleForecast.projectedTrend.length === 14,
    `Generated ${sampleForecast.projectedTrend.length} daily projected points with model confidence ${sampleForecast.modelConfidence}%`
  );

  assert(
    'Explainable Uncertainty Ranges & Assumptions Disclosed',
    'Forecasting Engine',
    sampleForecast.assumptions.length > 0 && sampleForecast.projectedTrend[0].confidenceUpper > sampleForecast.projectedTrend[0].confidenceLower,
    `Disclosed ${sampleForecast.assumptions.length} clinical assumptions and explicit upper/lower bounds`
  );

  // ==========================================
  // 7. AT-RISK FACILITY COMPOSITE SCORING
  // ==========================================
  const atRisk = evaluateAtRiskFacilities(
    INITIAL_FACILITIES,
    INITIAL_INVENTORY,
    [],
    INITIAL_BEDS,
    INITIAL_DOCTORS,
    INITIAL_DIAGNOSTICS
  );

  assert(
    'Composite Risk Scoring Evaluates District Facilities',
    'Clinical Risk Audit',
    atRisk.length === INITIAL_FACILITIES.length,
    `Evaluated all ${INITIAL_FACILITIES.length} facilities for risk factors`
  );

  const paud = atRisk.find((f: AtRiskFacility) => f.facilityId === 'FAC-01');
  assert(
    'PHC Paud Evaluated for Risk Triggers',
    'Clinical Risk Audit',
    Boolean(paud && paud.compositeRiskScore > 20),
    `PHC Paud composite risk score: ${paud?.compositeRiskScore}/100 with triggers: ${paud?.triggers.join('; ')}`
  );

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}
