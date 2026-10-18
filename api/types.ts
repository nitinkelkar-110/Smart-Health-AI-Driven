/**
 * MediGrid AI — Unified Shared API Types & Contracts
 * Used across frontend client and backend gateway.
 */

export type ApiRole = 'DISTRICT_ADMIN' | 'MEDICAL_OFFICER' | 'LOGISTICS_COORDINATOR' | 'PHARMACIST';
export type ApiAlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
export type ApiTransferStatus = 'PROPOSED' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'REJECTED';

export interface ApiHealthFacility {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'Sub-District Hospital';
  block: string;
  district: string;
  latitude: number;
  longitude: number;
  totalBeds: number;
  availableBeds: number;
  criticalCareBeds: number;
  contactPerson: string;
  phone: string;
  populationServed: number;
  operatingHours: string;
  operationalScore: number;
  status: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL_SHORTAGE';
}

export interface ApiMedicineItem {
  id: string;
  facilityId: string;
  facilityName: string;
  name: string;
  genericName: string;
  category: string;
  currentStock: number;
  minimumThreshold: number;
  quarantinedStock: number;
  reservedForTransfer: number;
  usableStock: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  averageDailyConsumption: number;
  daysUntilStockOut: number;
  alertSeverity: ApiAlertSeverity;
  daysToExpiry: number;
}

export interface ApiRedistributionTransfer {
  id: string;
  medicineId: string;
  medicineName: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  destFacilityId: string;
  destFacilityName: string;
  quantity: number;
  unit: string;
  distanceKm: number;
  priorityScore: number;
  status: ApiTransferStatus;
  proposedAt: string;
  approvedBy?: string;
}

export interface ApiAlertNotification {
  id: string;
  facilityId: string;
  facilityName: string;
  category: 'MEDICINE_SHORTAGE' | 'DOCTOR_ABSENCE' | 'BED_CAPACITY' | 'DIAGNOSTIC_OUTAGE' | 'EXPIRY_RISK';
  severity: ApiAlertSeverity;
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
}

// AI Gateway Contracts
export interface ApiChatRequest {
  prompt: string;
  language?: string;
  modelId?: string;
  taskType?: 'chat' | 'healthcare' | 'reasoning' | 'translation';
  operationalContext?: any;
}

export interface ApiChatResponse {
  success: boolean;
  text: string;
  modelUsed: string;
  providerUsed: string;
  latencyMs: number;
  failoverAttempts: number;
  groundedSources: string[];
  telemetry?: {
    id: string;
    timestamp: string;
    taskType: string;
    detectedLanguage: string;
    targetLanguage: string;
  };
}

export interface ApiProviderStatus {
  id: string;
  displayName: string;
  status: 'ONLINE' | 'OFFLINE' | 'UNCONFIGURED';
  isServerConfigured: boolean;
  maskedKeyPreview: string; // e.g. "••••••••9a7b" or "SERVER_MANAGED" — NEVER raw key!
  modelsCount: number;
}

export interface ApiConfigureKeyRequest {
  providerId: string;
  apiKey: string;
  baseUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
