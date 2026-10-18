export type FacilityType = 'PHC' | 'CHC' | 'Sub-District Hospital';

export interface HealthFacility {
  id: string;
  name: string;
  type: FacilityType;
  block: string;
  district: string;
  lat: number;
  lng: number;
  totalBeds: number;
  contactPerson: string;
  phone: string;
  populationServed: number;
  operatingHours: string;
  operationalScore: number; // 0 to 100
  status: 'OPERATIONAL' | 'NEEDS_ATTENTION' | 'CRITICAL_INTERVENTION';
}

export type MedicineCategory = 
  | 'Essential' 
  | 'Antibiotic' 
  | 'Maternal & Child' 
  | 'Emergency' 
  | 'Chronic Care' 
  | 'Vaccine' 
  | 'IV Fluids';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';

export interface MedicineItem {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  unit: string;
  facilityId: string;
  facilityName: string;
  currentStock: number;
  quarantinedStock: number; // Damaged or expired
  reservedForTransfer: number; // Committed to pending transfers
  averageDailyConsumption: number;
  minimumThreshold: number;
  maxThreshold: number;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  lastUpdated: string;
  // Computed helpers
  usableStock: number;
  daysUntilStockOut: number;
  alertSeverity: AlertSeverity;
  alertReason: string;
}

export type TransactionType = 
  | 'CONSUMPTION' 
  | 'STOCK_ADD' 
  | 'TRANSFER_OUT' 
  | 'TRANSFER_IN' 
  | 'DAMAGE_WRITE_OFF' 
  | 'EXPIRED_QUARANTINE';

export interface InventoryTransaction {
  id: string;
  medicineId: string;
  medicineName: string;
  facilityId: string;
  facilityName: string;
  type: TransactionType;
  quantity: number;
  batchNumber: string;
  timestamp: string;
  recordedBy: string;
  notes: string;
}

export interface PatientFootfallRecord {
  facilityId: string;
  facilityName: string;
  date: string;
  opdCount: number;
  ipdCount: number;
  emergencyCount: number;
  totalPatients: number;
  normalCapacity: number;
  hourlyDistribution: { hour: string; count: number }[];
  peakHour: string;
  surgePercentage: number;
  warningFlag: boolean;
  warningReason?: string;
  lastReported: string;
}

export interface BedAvailabilityRecord {
  facilityId: string;
  facilityName: string;
  totalBeds: number;
  occupiedBeds: number;
  unavailableBeds: number; // under repair / sanitation
  availableBeds: number;
  occupancyRate: number; // percentage
  specialtyBeds: {
    general: number;
    maternity: number;
    pediatric: number;
    emergency: number;
  };
  lastVerified: string;
  verifiedBy: string;
  occupancyStatus: 'LOW' | 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERCROWDED';
}

export type DoctorStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'UNREPORTED';

export interface DoctorRosterEntry {
  id: string;
  doctorName: string;
  specialty: string;
  shift: 'Morning (8 AM - 2 PM)' | 'Evening (2 PM - 8 PM)' | 'Night (8 PM - 8 AM)' | 'General (9 AM - 5 PM)';
  status: DoctorStatus;
  contactNumber: string;
  registrationNumber?: string;
  qualifications?: string;
  experienceYears?: number;
}

export interface DoctorAttendanceRecord {
  facilityId: string;
  facilityName: string;
  date: string;
  scheduledDoctors: number;
  presentDoctors: number;
  absentDoctors: number;
  onLeaveDoctors: number;
  notReportedDoctors: number;
  minimumRequired: number;
  roster: DoctorRosterEntry[];
  attendancePercentage: number;
  isStaffingDeficit: boolean;
  alertNote?: string;
  lastUpdated: string;
}

export type TriagePriority = 'P1 - Resuscitation' | 'P2 - Emergent' | 'P3 - Urgent' | 'P4 - Non-Urgent';
export type PatientVisitStatus = 'Waiting' | 'In Consultation' | 'Observation' | 'Admitted' | 'Discharged';

export interface PatientRecord {
  id: string;
  tokenNumber: number;
  uhid: string; // ABHA / National Health ID format
  name: string; // Authentic Indian Demographic Name
  age: number;
  gender: 'M' | 'F' | 'Other';
  facilityId: string;
  facilityName: string;
  department: string;
  chiefComplaint: string;
  triagePriority: TriagePriority;
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    temperature: string;
  };
  attendingDoctor: string; // Authentic Indian Doctor Name
  registrationTime: string;
  status: PatientVisitStatus;
  bedNumber?: string;
}


export type DiagnosticTestStatus = 
  | 'AVAILABLE' 
  | 'LIMITED' 
  | 'UNAVAILABLE' 
  | 'MAINTENANCE' 
  | 'CONSUMABLES_OUT' 
  | 'NOT_REPORTED';

export interface DiagnosticTestRecord {
  id: string;
  name: string;
  category: 'Pathology' | 'Rapid Test' | 'Radiology' | 'Maternal Screening' | 'Point of Care';
  facilityId: string;
  facilityName: string;
  status: DiagnosticTestStatus;
  equipmentStatus: 'Operational' | 'Faulty' | 'Calibration Due' | 'Out of Order';
  reagentStatus: 'Adequate' | 'Critical Low' | 'Exhausted' | 'N/A';
  dailyTestsDone: number;
  lastVerified: string;
  expectedRestoration?: string;
  alternativeFacilities: { facilityName: string; distanceKm: number; isAvailable: boolean }[];
}

export interface DemandForecast {
  id: string;
  facilityId: string;
  facilityName: string;
  targetItem: string;
  category: 'MEDICINE' | 'PATIENTS' | 'BEDS' | 'DIAGNOSTICS';
  horizonDays: 7 | 14 | 30;
  historicalTrend: { date: string; actual: number }[];
  projectedTrend: { date: string; projected: number; confidenceUpper: number; confidenceLower: number }[];
  currentStockOrCapacity: number;
  projectedDemandTotal: number;
  estimatedShortageDate: string | null;
  recommendedReplenishment: number;
  assumptions: string[];
  seasonalFactorDescription: string;
  modelConfidence: number; // 0 to 100%
}

export type TransferStatus = 
  | 'RECOMMENDED' 
  | 'APPROVED' 
  | 'DISPATCHED' 
  | 'RECEIVED' 
  | 'REJECTED' 
  | 'CANCELLED';

export interface RedistributionTransfer {
  id: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  destFacilityId: string;
  destFacilityName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unit: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: TransferStatus;
  reason: string;
  distanceKm: number;
  etaHours: number;
  createdTimestamp: string;
  approvedBy?: string;
  approvedTimestamp?: string;
  dispatchedTimestamp?: string;
  receivedTimestamp?: string;
  receivedBy?: string;
  auditNotes?: string;
}

export interface AtRiskFacility {
  id: string;
  facilityId: string;
  facilityName: string;
  block: string;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  compositeRiskScore: number; // 0 to 100
  triggers: string[];
  operationalDataSnapshot: {
    stockShortages: number;
    doctorDeficit: boolean;
    bedOccupancy: number;
    unavailableTests: number;
    footfallSurge: number;
  };
  recommendedInterventions: string[];
  status: 'AWAITING_INTERVENTION' | 'IN_PROGRESS' | 'RESOLVED';
  assignedOfficer?: string;
  notes?: string;
  lastUpdated: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  type: 
    | 'STOCK_OUT' 
    | 'PREDICTED_SHORTAGE' 
    | 'EXPIRY' 
    | 'BED_SHORTAGE' 
    | 'FOOTFALL_SURGE' 
    | 'STAFF_DEFICIT' 
    | 'DIAGNOSTIC_UNAVAILABLE' 
    | 'UNRESOLVED_INTERVENTION' 
    | 'TRANSFER_UPDATE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  facilityId?: string;
  facilityName?: string;
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
  isResolved: boolean;
  resolvedBy?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  facilityId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export type LanguageCode = string;

export type UserRole = 
  | 'DISTRICT_ADMIN' 
  | 'MEDICAL_OFFICER' 
  | 'LOGISTICS_COORDINATOR' 
  | 'PHARMACIST';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  facilityId?: string;
  district: string;
}
