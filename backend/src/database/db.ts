/**
 * MediGrid AI — Backend Database Service
 * Provides in-memory operational state with seed hydration,
 * and optional live Supabase synchronization.
 */

export interface FacilityRecord {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'Sub-District Hospital';
  block: string;
  district: string;
  latitude: number;
  longitude: number;
  totalBeds: number;
  contactPerson: string;
  phone: string;
  populationServed: number;
  operatingHours: string;
  operationalScore: number;
  status: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL_INTERVENTION';
}

export interface InventoryRecord {
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
  alertSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
  daysToExpiry: number;
}

export interface TransferRecord {
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
  status: 'PROPOSED' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'REJECTED';
  proposedAt: string;
  approvedBy?: string;
  reason: string;
}

export interface AlertRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  category: 'MEDICINE_SHORTAGE' | 'DOCTOR_ABSENCE' | 'BED_CAPACITY' | 'DIAGNOSTIC_OUTAGE' | 'EXPIRY_RISK';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
}

class DistrictDatabase {
  public facilities: FacilityRecord[] = [];
  public inventory: InventoryRecord[] = [];
  public transfers: TransferRecord[] = [];
  public alerts: AlertRecord[] = [];

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.facilities = [
      {
        id: 'FAC-01',
        name: 'PHC Paud',
        type: 'PHC',
        block: 'Mulshi',
        district: 'Pune Rural',
        latitude: 18.5332,
        longitude: 73.6128,
        totalBeds: 12,
        contactPerson: 'Dr. Ramesh Bhosale',
        phone: '+91 98220 14512',
        populationServed: 28400,
        operatingHours: '24/7 Emergency & OPD (8am - 2pm)',
        operationalScore: 58,
        status: 'CRITICAL_INTERVENTION',
      },
      {
        id: 'FAC-02',
        name: 'CHC Haveli',
        type: 'CHC',
        block: 'Haveli',
        district: 'Pune Rural',
        latitude: 18.5204,
        longitude: 73.8567,
        totalBeds: 30,
        contactPerson: 'Dr. Anita Deshmukh',
        phone: '+91 98221 87634',
        populationServed: 64200,
        operatingHours: '24/7 Full Facility',
        operationalScore: 92,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-03',
        name: 'PHC Wagholi',
        type: 'PHC',
        block: 'Haveli',
        district: 'Pune Rural',
        latitude: 18.5808,
        longitude: 73.9787,
        totalBeds: 10,
        contactPerson: 'Dr. Sanjay Patil',
        phone: '+91 98224 45678',
        populationServed: 34500,
        operatingHours: '24/7 Emergency & OPD (8am - 2pm)',
        operationalScore: 84,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-04',
        name: 'PHC Velhe',
        type: 'PHC',
        block: 'Velhe',
        district: 'Pune Rural',
        latitude: 18.2974,
        longitude: 73.6375,
        totalBeds: 8,
        contactPerson: 'Dr. Kavita Kulkarni',
        phone: '+91 98225 99123',
        populationServed: 19800,
        operatingHours: 'Day OPD & On-Call Emergency',
        operationalScore: 61,
        status: 'DEGRADED',
      },
      {
        id: 'FAC-05',
        name: 'CHC Junnar',
        type: 'CHC',
        block: 'Junnar',
        district: 'Pune Rural',
        latitude: 19.2067,
        longitude: 73.8763,
        totalBeds: 35,
        contactPerson: 'Dr. Vikrant Shinde',
        phone: '+91 98226 77890',
        populationServed: 78900,
        operatingHours: '24/7 Full Facility',
        operationalScore: 88,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-06',
        name: 'PHC Otur',
        type: 'PHC',
        block: 'Junnar',
        district: 'Pune Rural',
        latitude: 19.2612,
        longitude: 73.9167,
        totalBeds: 10,
        contactPerson: 'Dr. Meena Gaikwad',
        phone: '+91 98227 33451',
        populationServed: 24100,
        operatingHours: 'Day OPD & Primary Maternity',
        operationalScore: 74,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-07',
        name: 'PHC Khed',
        type: 'PHC',
        block: 'Khed',
        district: 'Pune Rural',
        latitude: 18.8475,
        longitude: 73.9134,
        totalBeds: 12,
        contactPerson: 'Dr. Rahul Jadhav',
        phone: '+91 98228 11234',
        populationServed: 31200,
        operatingHours: '24/7 Emergency & OPD',
        operationalScore: 79,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-08',
        name: 'CHC Chakan',
        type: 'CHC',
        block: 'Khed',
        district: 'Pune Rural',
        latitude: 18.7615,
        longitude: 73.8576,
        totalBeds: 28,
        contactPerson: 'Dr. Sunita More',
        phone: '+91 98229 55678',
        populationServed: 58700,
        operatingHours: '24/7 Industrial & Trauma Center',
        operationalScore: 86,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-09',
        name: 'PHC Bhor',
        type: 'PHC',
        block: 'Bhor',
        district: 'Pune Rural',
        latitude: 18.1500,
        longitude: 73.8447,
        totalBeds: 10,
        contactPerson: 'Dr. Amit Salunke',
        phone: '+91 98230 44567',
        populationServed: 22800,
        operatingHours: 'Day OPD & On-Call Emergency',
        operationalScore: 69,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-10',
        name: 'PHC Saswad',
        type: 'PHC',
        block: 'Purandar',
        district: 'Pune Rural',
        latitude: 18.3444,
        longitude: 74.0286,
        totalBeds: 14,
        contactPerson: 'Dr. Pooja Nimbalkar',
        phone: '+91 98231 66789',
        populationServed: 36100,
        operatingHours: '24/7 Emergency & Maternity',
        operationalScore: 89,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-11',
        name: 'CHC Daund',
        type: 'CHC',
        block: 'Daund',
        district: 'Pune Rural',
        latitude: 18.4658,
        longitude: 74.5815,
        totalBeds: 32,
        contactPerson: 'Dr. Deepak Shirole',
        phone: '+91 98232 88901',
        populationServed: 71400,
        operatingHours: '24/7 Full Facility',
        operationalScore: 91,
        status: 'OPERATIONAL',
      },
      {
        id: 'FAC-12',
        name: 'PHC Narayangaon',
        type: 'PHC',
        block: 'Junnar',
        district: 'Pune Rural',
        latitude: 19.1205,
        longitude: 73.9781,
        totalBeds: 12,
        contactPerson: 'Dr. Swati Gholap',
        phone: '+91 98233 12456',
        populationServed: 29300,
        operatingHours: '24/7 Highway Emergency Post',
        operationalScore: 82,
        status: 'OPERATIONAL',
      },
    ];

    this.inventory = [
      {
        id: 'INV-01',
        facilityId: 'FAC-01',
        facilityName: 'PHC Paud',
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        category: 'Antibiotics',
        currentStock: 120,
        minimumThreshold: 400,
        quarantinedStock: 0,
        reservedForTransfer: 0,
        usableStock: 120,
        unit: 'capsules',
        batchNumber: 'AMX-2024-B1',
        expiryDate: '2025-11-30',
        averageDailyConsumption: 85.0,
        daysUntilStockOut: 1.4,
        alertSeverity: 'CRITICAL',
        daysToExpiry: 408,
      },
      {
        id: 'INV-02',
        facilityId: 'FAC-02',
        facilityName: 'CHC Haveli',
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        category: 'Antibiotics',
        currentStock: 2850,
        minimumThreshold: 600,
        quarantinedStock: 0,
        reservedForTransfer: 300,
        usableStock: 2550,
        unit: 'capsules',
        batchNumber: 'AMX-2024-B9',
        expiryDate: '2026-04-15',
        averageDailyConsumption: 95.0,
        daysUntilStockOut: 26.8,
        alertSeverity: 'NORMAL',
        daysToExpiry: 544,
      },
      {
        id: 'INV-03',
        facilityId: 'FAC-01',
        facilityName: 'PHC Paud',
        name: 'Anti-Snake Venom 10ml',
        genericName: 'Polyvalent Snake Antivenom IP',
        category: 'Emergency & Critical Care',
        currentStock: 2,
        minimumThreshold: 15,
        quarantinedStock: 0,
        reservedForTransfer: 0,
        usableStock: 2,
        unit: 'vials',
        batchNumber: 'ASV-2024-E2',
        expiryDate: '2025-08-10',
        averageDailyConsumption: 3.0,
        daysUntilStockOut: 0.7,
        alertSeverity: 'CRITICAL',
        daysToExpiry: 296,
      },
      {
        id: 'INV-04',
        facilityId: 'FAC-02',
        facilityName: 'CHC Haveli',
        name: 'Anti-Snake Venom 10ml',
        genericName: 'Polyvalent Snake Antivenom IP',
        category: 'Emergency & Critical Care',
        currentStock: 38,
        minimumThreshold: 10,
        quarantinedStock: 0,
        reservedForTransfer: 6,
        usableStock: 32,
        unit: 'vials',
        batchNumber: 'ASV-2024-S1',
        expiryDate: '2026-06-30',
        averageDailyConsumption: 2.5,
        daysUntilStockOut: 12.8,
        alertSeverity: 'NORMAL',
        daysToExpiry: 620,
      },
    ];

    this.transfers = [
      {
        id: 'TX-2024-001',
        medicineId: 'INV-01',
        medicineName: 'Amoxicillin 500mg',
        sourceFacilityId: 'FAC-02',
        sourceFacilityName: 'CHC Haveli',
        destFacilityId: 'FAC-01',
        destFacilityName: 'PHC Paud',
        quantity: 300,
        unit: 'capsules',
        distanceKm: 25.8,
        priorityScore: 94,
        status: 'PROPOSED',
        proposedAt: new Date().toISOString(),
        reason: 'PHC Paud has only 1.4 days of stock remaining while CHC Haveli maintains safe 26-day reserve.',
      },
      {
        id: 'TX-2024-002',
        medicineId: 'INV-03',
        medicineName: 'Anti-Snake Venom 10ml',
        sourceFacilityId: 'FAC-02',
        sourceFacilityName: 'CHC Haveli',
        destFacilityId: 'FAC-01',
        destFacilityName: 'PHC Paud',
        quantity: 6,
        unit: 'vials',
        distanceKm: 25.8,
        priorityScore: 98,
        status: 'PROPOSED',
        proposedAt: new Date().toISOString(),
        reason: 'Urgent critical shortage: only 2 vials remain at PHC Paud (Mulshi monsoon hill corridor).',
      },
    ];

    this.alerts = [
      {
        id: 'ALT-01',
        facilityId: 'FAC-01',
        facilityName: 'PHC Paud',
        category: 'MEDICINE_SHORTAGE',
        severity: 'CRITICAL',
        message: 'Anti-Snake Venom stock (2 vials) will deplete in less than 24 hours at current run-rate.',
        timestamp: new Date().toISOString(),
        isAcknowledged: false,
      },
      {
        id: 'ALT-02',
        facilityId: 'FAC-04',
        facilityName: 'PHC Velhe',
        category: 'DOCTOR_ABSENCE',
        severity: 'HIGH',
        message: 'Only 1 of 2 scheduled Medical Officers in attendance during morning OPD surge.',
        timestamp: new Date().toISOString(),
        isAcknowledged: false,
      },
    ];
  }
}

export const db = new DistrictDatabase();
