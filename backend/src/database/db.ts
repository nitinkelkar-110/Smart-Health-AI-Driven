/**
 * MediGrid AI — Backend Database Service
 * Provides full operational district telemetry persistence with seed hydration,
 * transfer approval/dispatch workflow, inventory adjustments, and alert tracking.
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
  status: 'PROPOSED' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'REJECTED' | 'COMPLETED';
  proposedAt: string;
  approvedBy?: string;
  approvedTimestamp?: string;
  dispatchedTimestamp?: string;
  receivedTimestamp?: string;
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

export interface BedRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  totalBeds: number;
  occupiedBeds: number;
  unavailableBeds: number;
  availableBeds: number;
  occupancyRate: number;
  lastUpdated: string;
}

export interface DoctorRosterEntry {
  id: string;
  doctorName: string;
  specialty: string;
  shift: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'UNREPORTED';
  contactNumber: string;
  registrationNumber?: string;
  qualifications?: string;
  experienceYears?: number;
}

export interface DoctorRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  scheduledDoctors: number;
  presentDoctors: number;
  absentDoctors: number;
  onLeaveDoctors: number;
  minimumRequired: number;
  attendanceRate: number;
  isStaffingDeficit: boolean;
  alertNote?: string;
  roster: DoctorRosterEntry[];
  lastUpdated: string;
}

export interface PatientRecord {
  id: string;
  tokenNumber: number;
  uhid: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  facilityId: string;
  facilityName: string;
  department: string;
  chiefComplaint: string;
  triagePriority: 'P1 - Resuscitation' | 'P2 - Emergent' | 'P3 - Urgent' | 'P4 - Non-Urgent';
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    temperature: string;
  };
  attendingDoctor: string;
  registrationTime: string;
  status: 'Waiting' | 'In Consultation' | 'Observation' | 'Admitted' | 'Discharged';
  bedNumber?: string;
}

export interface FootfallRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  opdCount: number;
  ipdCount: number;
  emergencyCount: number;
  totalToday: number;
  surgeStatus: 'NORMAL' | 'SURGE' | 'CRITICAL';
  recordDate: string;
}

export interface DiagnosticRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  testName: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DEVICE_CALIBRATING';
  dailyVolume: number;
}

export interface AuditRecord {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  details: string;
  facilityId?: string;
  timestamp: string;
  ipAddress?: string;
}

class DistrictDatabase {
  public facilities: FacilityRecord[] = [];
  public inventory: InventoryRecord[] = [];
  public transfers: TransferRecord[] = [];
  public alerts: AlertRecord[] = [];
  public beds: BedRecord[] = [];
  public doctors: DoctorRecord[] = [];
  public patients: PatientRecord[] = [];
  public footfalls: FootfallRecord[] = [];
  public diagnostics: DiagnosticRecord[] = [];
  public auditLogs: AuditRecord[] = [];


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
        name: 'Oral Rehydration Salts (ORS)',
        genericName: 'WHO Formula ORS Sachet 20.5g',
        category: 'Essential',
        currentStock: 80,
        minimumThreshold: 200,
        quarantinedStock: 0,
        reservedForTransfer: 0,
        usableStock: 80,
        unit: 'sachets',
        batchNumber: 'ORS-24-A109',
        expiryDate: '2027-08-15',
        averageDailyConsumption: 45.0,
        daysUntilStockOut: 1.8,
        alertSeverity: 'CRITICAL',
        daysToExpiry: 665,
      },
      {
        id: 'INV-02',
        facilityId: 'FAC-02',
        facilityName: 'CHC Haveli',
        name: 'Oral Rehydration Salts (ORS)',
        genericName: 'WHO Formula ORS Sachet 20.5g',
        category: 'Essential',
        currentStock: 1850,
        minimumThreshold: 400,
        quarantinedStock: 0,
        reservedForTransfer: 250,
        usableStock: 1600,
        unit: 'sachets',
        batchNumber: 'ORS-24-H204',
        expiryDate: '2027-11-20',
        averageDailyConsumption: 50.0,
        daysUntilStockOut: 32.0,
        alertSeverity: 'NORMAL',
        daysToExpiry: 760,
      },
      {
        id: 'INV-03',
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
        id: 'INV-04',
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
        id: 'INV-05',
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
        id: 'INV-06',
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
        medicineId: 'INV-03',
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
        medicineId: 'INV-05',
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
      {
        id: 'ALT-03',
        facilityId: 'FAC-01',
        facilityName: 'PHC Paud',
        category: 'MEDICINE_SHORTAGE',
        severity: 'CRITICAL',
        message: 'Oral Rehydration Salts (ORS) will exhaust within 42 hours at current consumption rate.',
        timestamp: new Date().toISOString(),
        isAcknowledged: false,
      },
    ];

    this.beds = this.facilities.map((f) => {
      const occupied = Math.round(f.totalBeds * 0.75);
      return {
        id: `BED-${f.id}`,
        facilityId: f.id,
        facilityName: f.name,
        totalBeds: f.totalBeds,
        occupiedBeds: occupied,
        unavailableBeds: 1,
        availableBeds: Math.max(0, f.totalBeds - occupied - 1),
        occupancyRate: Math.round((occupied / f.totalBeds) * 100),
        lastUpdated: new Date().toISOString(),
      };
    });

    this.doctors = [
      {
        id: 'DOC-FAC-01',
        facilityId: 'FAC-01',
        facilityName: 'PHC Paud',
        scheduledDoctors: 5,
        presentDoctors: 2,
        absentDoctors: 1,
        onLeaveDoctors: 2,
        minimumRequired: 3,
        attendanceRate: 40.0,
        isStaffingDeficit: true,
        alertNote: 'Staffing deficit: 2 of 5 scheduled Medical Officers reported on duty during peak Monday surge.',
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-01', doctorName: 'Dr. Ramesh Bhosale', specialty: 'General Medicine / MO', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98220 14512', registrationNumber: 'MMC/2011/04/1042', qualifications: 'MBBS, DNB', experienceYears: 14 },
          { id: 'DOC-02', doctorName: 'Dr. Sneha Chitnis', specialty: 'Obstetrics & Gynaecology', shift: 'General (9 AM - 5 PM)', status: 'ON_LEAVE', contactNumber: '+91 98220 54123', registrationNumber: 'MMC/2015/08/2190', qualifications: 'MBBS, DGO', experienceYears: 10 },
          { id: 'DOC-03', doctorName: 'Dr. Rahul Kamble', specialty: 'Paediatrics', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98220 98711', registrationNumber: 'MMC/2018/11/3341', qualifications: 'MBBS, DCH', experienceYears: 7 },
          { id: 'DOC-04', doctorName: 'Dr. Anand Kulkarni', specialty: 'General Surgery / Emergency', shift: 'Evening (2 PM - 8 PM)', status: 'ON_LEAVE', contactNumber: '+91 98220 44556', registrationNumber: 'MMC/2009/03/0891', qualifications: 'MBBS, MS', experienceYears: 16 },
          { id: 'DOC-05', doctorName: 'Dr. Tanuja Shinde', specialty: 'Ayush Medical Officer', shift: 'Morning (8 AM - 2 PM)', status: 'ABSENT', contactNumber: '+91 98220 22334', registrationNumber: 'MCIM/2016/05/4412', qualifications: 'BAMS, MD', experienceYears: 9 },
        ],
      },
      {
        id: 'DOC-FAC-02',
        facilityId: 'FAC-02',
        facilityName: 'CHC Haveli',
        scheduledDoctors: 8,
        presentDoctors: 7,
        absentDoctors: 0,
        onLeaveDoctors: 1,
        minimumRequired: 6,
        attendanceRate: 87.5,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-11', doctorName: 'Dr. Anita Deshmukh', specialty: 'Medical Superintendent', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98221 87634', registrationNumber: 'MMC/2005/02/0341', qualifications: 'MBBS, MD', experienceYears: 20 },
          { id: 'DOC-12', doctorName: 'Dr. Sandeep Jadhav', specialty: 'Orthopaedics', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98221 11229', registrationNumber: 'MMC/2010/06/1823', qualifications: 'MBBS, MS (Ortho)', experienceYears: 15 },
          { id: 'DOC-13', doctorName: 'Dr. Pallavi Gore', specialty: 'Anaesthesia & ICU', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98221 33441', registrationNumber: 'MMC/2014/09/2456', qualifications: 'MBBS, DA', experienceYears: 11 },
          { id: 'DOC-14', doctorName: 'Dr. Suresh Iyer', specialty: 'General Surgery', shift: 'Evening (2 PM - 8 PM)', status: 'PRESENT', contactNumber: '+91 98221 55667', registrationNumber: 'MMC/2008/04/0912', qualifications: 'MBBS, MS', experienceYears: 17 },
          { id: 'DOC-15', doctorName: 'Dr. Priya Nair', specialty: 'Obstetrics & Gynaecology', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98221 77889', registrationNumber: 'MMC/2016/07/3104', qualifications: 'MBBS, MD', experienceYears: 9 },
          { id: 'DOC-16', doctorName: 'Dr. Mahesh Kadam', specialty: 'Paediatrics & Neonatology', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98221 88990', registrationNumber: 'MMC/2017/12/3890', qualifications: 'MBBS, DCH', experienceYears: 8 },
          { id: 'DOC-17', doctorName: 'Dr. Sunita Kulkarni', specialty: 'Radiology & Sonography', shift: 'General (9 AM - 5 PM)', status: 'ON_LEAVE', contactNumber: '+91 98221 22331', registrationNumber: 'MMC/2012/03/1567', qualifications: 'MBBS, DMRD', experienceYears: 13 },
          { id: 'DOC-18', doctorName: 'Dr. Arvind Patel', specialty: 'Casualty Medical Officer', shift: 'Night (8 PM - 8 AM)', status: 'PRESENT', contactNumber: '+91 98221 44552', registrationNumber: 'MMC/2019/01/4120', qualifications: 'MBBS, MEM', experienceYears: 6 },
        ],
      },
      {
        id: 'DOC-FAC-03',
        facilityId: 'FAC-03',
        facilityName: 'PHC Wagholi',
        scheduledDoctors: 3,
        presentDoctors: 3,
        absentDoctors: 0,
        onLeaveDoctors: 0,
        minimumRequired: 2,
        attendanceRate: 100.0,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-31', doctorName: 'Dr. Meena Gaikwad', specialty: 'Medical Officer In-Charge', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98227 33445', registrationNumber: 'MMC/2013/05/2019', qualifications: 'MBBS, DPH', experienceYears: 12 },
          { id: 'DOC-32', doctorName: 'Dr. Rajesh Sharma', specialty: 'General Physician / NCD', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98224 45678', registrationNumber: 'MMC/2018/02/3421', qualifications: 'MBBS', experienceYears: 7 },
          { id: 'DOC-33', doctorName: 'Dr. Pooja Patil', specialty: 'Ayush Medical Officer', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98224 99001', registrationNumber: 'MCIM/2019/08/4890', qualifications: 'BAMS', experienceYears: 6 },
        ],
      },
      {
        id: 'DOC-FAC-04',
        facilityId: 'FAC-04',
        facilityName: 'PHC Velhe',
        scheduledDoctors: 3,
        presentDoctors: 3,
        absentDoctors: 0,
        onLeaveDoctors: 0,
        minimumRequired: 2,
        attendanceRate: 100.0,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-21', doctorName: 'Dr. Vikas Shinde', specialty: 'Medical Officer In-Charge', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98225 11223', registrationNumber: 'MMC/2016/04/2890', qualifications: 'MBBS', experienceYears: 9 },
          { id: 'DOC-22', doctorName: 'Dr. Kavita Kulkarni', specialty: 'Obstetrics & Child Health', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98225 99123', registrationNumber: 'MMC/2015/09/2311', qualifications: 'MBBS, DGO', experienceYears: 10 },
          { id: 'DOC-23', doctorName: 'Dr. Rahul Jadhav', specialty: 'Emergency & Casualty MO', shift: 'Evening (2 PM - 8 PM)', status: 'PRESENT', contactNumber: '+91 98225 44332', registrationNumber: 'MMC/2020/03/5012', qualifications: 'MBBS', experienceYears: 5 },
        ],
      },
      {
        id: 'DOC-FAC-05',
        facilityId: 'FAC-05',
        facilityName: 'CHC Daund',
        scheduledDoctors: 6,
        presentDoctors: 5,
        absentDoctors: 0,
        onLeaveDoctors: 1,
        minimumRequired: 4,
        attendanceRate: 83.3,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-51', doctorName: 'Dr. Suresh Pawar', specialty: 'Medical Superintendent / Surgeon', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98226 99887', registrationNumber: 'MMC/2004/01/0198', qualifications: 'MBBS, MS', experienceYears: 21 },
          { id: 'DOC-52', doctorName: 'Dr. Deepak Shirole', specialty: 'General Medicine & Diabetology', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98232 88901', registrationNumber: 'MMC/2011/07/1678', qualifications: 'MBBS, MD', experienceYears: 14 },
          { id: 'DOC-53', doctorName: 'Dr. Swati Gholap', specialty: 'Obstetrics & Gynaecology', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98233 12456', registrationNumber: 'MMC/2014/10/2567', qualifications: 'MBBS, DGO', experienceYears: 11 },
          { id: 'DOC-54', doctorName: 'Dr. Manoj Deshpande', specialty: 'Paediatrician', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98226 33221', registrationNumber: 'MMC/2009/11/1102', qualifications: 'MBBS, MD', experienceYears: 16 },
          { id: 'DOC-55', doctorName: 'Dr. Sunita More', specialty: 'Anaesthesia', shift: 'General (9 AM - 5 PM)', status: 'ON_LEAVE', contactNumber: '+91 98229 55678', registrationNumber: 'MMC/2016/03/2987', qualifications: 'MBBS, DA', experienceYears: 9 },
          { id: 'DOC-56', doctorName: 'Dr. Alok Gupta', specialty: 'Orthopaedic Surgeon', shift: 'Evening (2 PM - 8 PM)', status: 'PRESENT', contactNumber: '+91 98226 77654', registrationNumber: 'MMC/2017/05/3345', qualifications: 'MBBS, DNB', experienceYears: 8 },
        ],
      },
      {
        id: 'DOC-FAC-06',
        facilityId: 'FAC-06',
        facilityName: 'PHC Khed',
        scheduledDoctors: 3,
        presentDoctors: 2,
        absentDoctors: 0,
        onLeaveDoctors: 1,
        minimumRequired: 2,
        attendanceRate: 66.7,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-61', doctorName: 'Dr. Sujata Shinde', specialty: 'Medical Officer In-Charge', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98228 11234', registrationNumber: 'MMC/2015/06/2289', qualifications: 'MBBS, DCH', experienceYears: 10 },
          { id: 'DOC-62', doctorName: 'Dr. Ganesh Thorat', specialty: 'General Practitioner', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98228 55661', registrationNumber: 'MMC/2021/08/5421', qualifications: 'MBBS', experienceYears: 4 },
          { id: 'DOC-63', doctorName: 'Dr. Rahul Jadhav', specialty: 'Ayush Medical Officer', shift: 'Morning (8 AM - 2 PM)', status: 'ON_LEAVE', contactNumber: '+91 98228 77882', registrationNumber: 'MCH/2018/04/3201', qualifications: 'BHMS', experienceYears: 7 },
        ],
      },
      {
        id: 'DOC-FAC-07',
        facilityId: 'FAC-07',
        facilityName: 'CHC Junnar',
        scheduledDoctors: 6,
        presentDoctors: 5,
        absentDoctors: 0,
        onLeaveDoctors: 1,
        minimumRequired: 4,
        attendanceRate: 83.3,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-71', doctorName: 'Dr. Arun Jagtap', specialty: 'Medical Superintendent', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98228 77665', registrationNumber: 'MMC/2007/03/0789', qualifications: 'MBBS, MD', experienceYears: 18 },
          { id: 'DOC-72', doctorName: 'Dr. Vikrant Shinde', specialty: 'General Surgery & Trauma', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98226 77890', registrationNumber: 'MMC/2012/08/1745', qualifications: 'MBBS, MS', experienceYears: 13 },
          { id: 'DOC-73', doctorName: 'Dr. Neha Deshmukh', specialty: 'Gynaecologist', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98227 44332', registrationNumber: 'MMC/2016/11/3198', qualifications: 'MBBS, MS (OBG)', experienceYears: 9 },
          { id: 'DOC-74', doctorName: 'Dr. Vishal Bansode', specialty: 'Paediatrician', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98227 66554', registrationNumber: 'MMC/2018/01/3567', qualifications: 'MBBS, DCH', experienceYears: 7 },
          { id: 'DOC-75', doctorName: 'Dr. Shilpa Rao', specialty: 'Ophthalmology', shift: 'General (9 AM - 5 PM)', status: 'ON_LEAVE', contactNumber: '+91 98227 88991', registrationNumber: 'MMC/2013/04/1982', qualifications: 'MBBS, DOMS', experienceYears: 12 },
          { id: 'DOC-76', doctorName: 'Dr. Prakash Tambe', specialty: 'Casualty Medical Officer', shift: 'Night (8 PM - 8 AM)', status: 'PRESENT', contactNumber: '+91 98227 11225', registrationNumber: 'MMC/2020/09/5190', qualifications: 'MBBS', experienceYears: 5 },
        ],
      },
      {
        id: 'DOC-FAC-08',
        facilityId: 'FAC-08',
        facilityName: 'PHC Shirur',
        scheduledDoctors: 3,
        presentDoctors: 2,
        absentDoctors: 0,
        onLeaveDoctors: 1,
        minimumRequired: 2,
        attendanceRate: 66.7,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-81', doctorName: 'Dr. Kavita Joshi', specialty: 'Medical Officer In-Charge', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98229 55443', registrationNumber: 'MMC/2014/02/2156', qualifications: 'MBBS, DGO', experienceYears: 11 },
          { id: 'DOC-82', doctorName: 'Dr. Sanjay Patil', specialty: 'General Medicine & NCD', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98224 45678', registrationNumber: 'MMC/2017/07/3409', qualifications: 'MBBS', experienceYears: 8 },
          { id: 'DOC-83', doctorName: 'Dr. Nilesh Pawar', specialty: 'Ayush Medical Officer', shift: 'Morning (8 AM - 2 PM)', status: 'ON_LEAVE', contactNumber: '+91 98229 88776', registrationNumber: 'MCIM/2019/10/4789', qualifications: 'BAMS', experienceYears: 6 },
        ],
      },
      {
        id: 'DOC-FAC-09',
        facilityId: 'FAC-09',
        facilityName: 'PHC Bhor',
        scheduledDoctors: 3,
        presentDoctors: 2,
        absentDoctors: 1,
        onLeaveDoctors: 0,
        minimumRequired: 2,
        attendanceRate: 66.7,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-91', doctorName: 'Dr. Deepak More', specialty: 'Medical Officer In-Charge', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98230 12345', registrationNumber: 'MMC/2015/12/2678', qualifications: 'MBBS', experienceYears: 10 },
          { id: 'DOC-92', doctorName: 'Dr. Amit Salunke', specialty: 'General Practitioner', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98230 44567', registrationNumber: 'MMC/2020/02/4980', qualifications: 'MBBS', experienceYears: 5 },
          { id: 'DOC-93', doctorName: 'Dr. Madhuri Joshi', specialty: 'Ayush Medical Officer', shift: 'Morning (8 AM - 2 PM)', status: 'ABSENT', contactNumber: '+91 98230 77889', registrationNumber: 'MCIM/2018/06/3910', qualifications: 'BAMS', experienceYears: 7 },
        ],
      },
      {
        id: 'DOC-FAC-10',
        facilityId: 'FAC-10',
        facilityName: 'PHC Purandar (Saswad)',
        scheduledDoctors: 3,
        presentDoctors: 3,
        absentDoctors: 0,
        onLeaveDoctors: 0,
        minimumRequired: 2,
        attendanceRate: 100.0,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-101', doctorName: 'Dr. Pooja Nimbalkar', specialty: 'Medical Officer In-Charge', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98231 66789', registrationNumber: 'MMC/2013/09/2087', qualifications: 'MBBS, DNB', experienceYears: 12 },
          { id: 'DOC-102', doctorName: 'Dr. Sachin Jagtap', specialty: 'General Duty MO', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98231 22334', registrationNumber: 'MMC/2019/04/4231', qualifications: 'MBBS', experienceYears: 6 },
          { id: 'DOC-103', doctorName: 'Dr. Varsha Chavan', specialty: 'Ayush Medical Officer', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98231 88990', registrationNumber: 'MCIM/2017/01/3654', qualifications: 'BAMS', experienceYears: 8 },
        ],
      },
      {
        id: 'DOC-FAC-11',
        facilityId: 'FAC-11',
        facilityName: 'CHC Baramati',
        scheduledDoctors: 6,
        presentDoctors: 5,
        absentDoctors: 0,
        onLeaveDoctors: 1,
        minimumRequired: 4,
        attendanceRate: 83.3,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-111', doctorName: 'Dr. Ashok Patil', specialty: 'Chief Medical Superintendent', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98232 55667', registrationNumber: 'MMC/2003/05/0142', qualifications: 'MBBS, MD', experienceYears: 22 },
          { id: 'DOC-112', doctorName: 'Dr. Smita Gaikwad', specialty: 'Obstetrician & Gynaecologist', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98232 11223', registrationNumber: 'MMC/2011/04/1620', qualifications: 'MBBS, MD', experienceYears: 14 },
          { id: 'DOC-113', doctorName: 'Dr. Vinod Kale', specialty: 'General & Laparoscopic Surgeon', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98232 77889', registrationNumber: 'MMC/2013/11/2199', qualifications: 'MBBS, MS', experienceYears: 12 },
          { id: 'DOC-114', doctorName: 'Dr. Shweta Kadam', specialty: 'Paediatrician', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98232 99001', registrationNumber: 'MMC/2017/09/3512', qualifications: 'MBBS, DCH', experienceYears: 8 },
          { id: 'DOC-115', doctorName: 'Dr. Nitin More', specialty: 'Anaesthesiologist', shift: 'General (9 AM - 5 PM)', status: 'ON_LEAVE', contactNumber: '+91 98232 33445', registrationNumber: 'MMC/2015/02/2419', qualifications: 'MBBS, DA', experienceYears: 10 },
          { id: 'DOC-116', doctorName: 'Dr. Ananya Mukherjee', specialty: 'Dental Surgeon', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98232 66778', registrationNumber: 'MDC/2016/08/1945', qualifications: 'BDS, MDS', experienceYears: 9 },
        ],
      },
      {
        id: 'DOC-FAC-12',
        facilityId: 'FAC-12',
        facilityName: 'PHC Narayangaon',
        scheduledDoctors: 3,
        presentDoctors: 3,
        absentDoctors: 0,
        onLeaveDoctors: 0,
        minimumRequired: 2,
        attendanceRate: 100.0,
        isStaffingDeficit: false,
        lastUpdated: new Date().toISOString(),
        roster: [
          { id: 'DOC-121', doctorName: 'Dr. Swati Gholap', specialty: 'Medical Officer In-Charge', shift: 'General (9 AM - 5 PM)', status: 'PRESENT', contactNumber: '+91 98233 12456', registrationNumber: 'MMC/2012/10/1899', qualifications: 'MBBS, DPH', experienceYears: 13 },
          { id: 'DOC-122', doctorName: 'Dr. Pravin Kulkarni', specialty: 'Highway Trauma & Emergency MO', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98233 44556', registrationNumber: 'MMC/2018/05/3671', qualifications: 'MBBS, MEM', experienceYears: 7 },
          { id: 'DOC-123', doctorName: 'Dr. Radhika Joshi', specialty: 'Ayush MO / ANC Counselor', shift: 'Morning (8 AM - 2 PM)', status: 'PRESENT', contactNumber: '+91 98233 77889', registrationNumber: 'MCIM/2020/07/5201', qualifications: 'BAMS', experienceYears: 5 },
        ],
      },
    ];

    this.patients = [
      { id: 'PAT-001', tokenNumber: 101, uhid: 'ABHA-MH-2026-1042', name: 'Aarav Rajesh Deshmukh', age: 7, gender: 'M', facilityId: 'FAC-01', facilityName: 'PHC Paud', department: 'Pediatrics', chiefComplaint: 'High grade fever 102.4°F with acute chills, bodyache and vomiting for 2 days', triagePriority: 'P3 - Urgent', vitals: { bp: '100/65', pulse: 108, spo2: 98, temperature: '102.4°F' }, attendingDoctor: 'Dr. Rahul Kamble', registrationTime: '08:15 AM', status: 'In Consultation' },
      { id: 'PAT-002', tokenNumber: 102, uhid: 'ABHA-MH-2026-1043', name: 'Sunita Tanaji Pawar', age: 28, gender: 'F', facilityId: 'FAC-01', facilityName: 'PHC Paud', department: 'Antenatal Care (ANC)', chiefComplaint: '32 weeks gestation routine 3rd trimester antenatal checkup with mild bilateral pedal edema', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '124/82', pulse: 78, spo2: 99, temperature: '98.4°F' }, attendingDoctor: 'Dr. Ramesh Bhosale', registrationTime: '08:30 AM', status: 'Waiting' },
      { id: 'PAT-003', tokenNumber: 103, uhid: 'ABHA-MH-2026-1044', name: 'Tanaji Mahadev Mane', age: 59, gender: 'M', facilityId: 'FAC-01', facilityName: 'PHC Paud', department: 'Emergency', chiefComplaint: 'Retrosternal squeezing chest discomfort with diaphoresis and radiating left arm pain', triagePriority: 'P1 - Resuscitation', vitals: { bp: '162/98', pulse: 96, spo2: 93, temperature: '98.6°F' }, attendingDoctor: 'Dr. Ramesh Bhosale', registrationTime: '08:45 AM', status: 'Observation', bedNumber: 'Emergency-01' },
      { id: 'PAT-004', tokenNumber: 104, uhid: 'ABHA-MH-2026-1045', name: 'Amit Ashok Chavan', age: 11, gender: 'M', facilityId: 'FAC-01', facilityName: 'PHC Paud', department: 'Pediatrics', chiefComplaint: 'Acute watery diarrhea (7 episodes) with moderate dehydration and dry buccal mucosa', triagePriority: 'P2 - Emergent', vitals: { bp: '95/60', pulse: 112, spo2: 98, temperature: '99.1°F' }, attendingDoctor: 'Dr. Rahul Kamble', registrationTime: '09:05 AM', status: 'Admitted', bedNumber: 'Ped-02' },
      { id: 'PAT-005', tokenNumber: 105, uhid: 'ABHA-MH-2026-1046', name: 'Shweta Milind Thorat', age: 27, gender: 'F', facilityId: 'FAC-01', facilityName: 'PHC Paud', department: 'Antenatal Care (ANC)', chiefComplaint: 'First trimester severe morning sickness, inability to retain oral fluids, severe fatigue', triagePriority: 'P3 - Urgent', vitals: { bp: '106/70', pulse: 84, spo2: 99, temperature: '98.5°F' }, attendingDoctor: 'Dr. Ramesh Bhosale', registrationTime: '09:20 AM', status: 'In Consultation' },
      { id: 'PAT-006', tokenNumber: 106, uhid: 'ABHA-MH-2026-1047', name: 'Sanjay Dattatray Bhosale', age: 50, gender: 'M', facilityId: 'FAC-01', facilityName: 'PHC Paud', department: 'General OPD', chiefComplaint: 'Chronic lower back ache with radiating pain to right calf and numbness in great toe', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '130/84', pulse: 74, spo2: 98, temperature: '98.2°F' }, attendingDoctor: 'Dr. Ramesh Bhosale', registrationTime: '09:40 AM', status: 'Waiting' },
      { id: 'PAT-007', tokenNumber: 201, uhid: 'ABHA-MH-2026-2081', name: 'Ganpatrao Tukaram Patil', age: 64, gender: 'M', facilityId: 'FAC-02', facilityName: 'CHC Haveli', department: 'Geriatrics & NCD', chiefComplaint: 'Type-2 Diabetes mellitus review with fasting blood sugar 246 mg/dL, polyuria and blurred vision', triagePriority: 'P3 - Urgent', vitals: { bp: '148/92', pulse: 82, spo2: 97, temperature: '98.4°F' }, attendingDoctor: 'Dr. Anita Deshmukh', registrationTime: '08:20 AM', status: 'In Consultation' },
      { id: 'PAT-008', tokenNumber: 202, uhid: 'ABHA-MH-2026-2082', name: 'Priya Sandeep Shinde', age: 22, gender: 'F', facilityId: 'FAC-02', facilityName: 'CHC Haveli', department: 'General OPD', chiefComplaint: 'Acute spasmodic dysmenorrhea with severe lower abdominal colic and nausea', triagePriority: 'P3 - Urgent', vitals: { bp: '112/74', pulse: 86, spo2: 99, temperature: '98.6°F' }, attendingDoctor: 'Dr. Priya Nair', registrationTime: '08:35 AM', status: 'Waiting' },
      { id: 'PAT-009', tokenNumber: 203, uhid: 'ABHA-MH-2026-2083', name: 'Manju Devi Sharma', age: 48, gender: 'F', facilityId: 'FAC-02', facilityName: 'CHC Haveli', department: 'General OPD', chiefComplaint: 'Persistent epigastric burning sensation, sour belching and postprandial dyspepsia for 3 weeks', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '128/80', pulse: 76, spo2: 98, temperature: '98.2°F' }, attendingDoctor: 'Dr. Anita Deshmukh', registrationTime: '08:50 AM', status: 'Waiting' },
      { id: 'PAT-010', tokenNumber: 204, uhid: 'ABHA-MH-2026-2084', name: 'Archana Vinayak Deshpande', age: 41, gender: 'F', facilityId: 'FAC-02', facilityName: 'CHC Haveli', department: 'General OPD', chiefComplaint: 'Bilateral ocular redness, itching and mucopurulent discharge consistent with conjunctivitis', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '118/76', pulse: 72, spo2: 99, temperature: '98.4°F' }, attendingDoctor: 'Dr. Anita Deshmukh', registrationTime: '09:00 AM', status: 'Waiting' },
      { id: 'PAT-011', tokenNumber: 205, uhid: 'ABHA-MH-2026-2085', name: 'Vikram Sambhaji Gaikwad', age: 45, gender: 'M', facilityId: 'FAC-02', facilityName: 'CHC Haveli', department: 'Emergency & Trauma', chiefComplaint: 'Two-wheeler road skid trauma with 6cm deep contaminated laceration over right knee', triagePriority: 'P2 - Emergent', vitals: { bp: '136/88', pulse: 94, spo2: 98, temperature: '98.8°F' }, attendingDoctor: 'Dr. Sandeep Jadhav', registrationTime: '09:15 AM', status: 'Observation', bedNumber: 'Trauma-02' },
      { id: 'PAT-012', tokenNumber: 206, uhid: 'ABHA-MH-2026-2086', name: 'Suresh Narayanan Iyer', age: 68, gender: 'M', facilityId: 'FAC-02', facilityName: 'CHC Haveli', department: 'Emergency / ICU', chiefComplaint: 'Acute exacerbation of Chronic Obstructive Pulmonary Disease with tachypnea and cyanosis', triagePriority: 'P1 - Resuscitation', vitals: { bp: '155/94', pulse: 118, spo2: 88, temperature: '99.4°F' }, attendingDoctor: 'Dr. Pallavi Gore', registrationTime: '09:25 AM', status: 'Admitted', bedNumber: 'ICU-01' },
      { id: 'PAT-013', tokenNumber: 301, uhid: 'ABHA-MH-2026-3012', name: 'Rohan Amit Verma', age: 14, gender: 'M', facilityId: 'FAC-03', facilityName: 'PHC Wagholi', department: 'Emergency', chiefComplaint: 'Colles-type left wrist deformity with acute swelling and pain after bicycle fall', triagePriority: 'P3 - Urgent', vitals: { bp: '110/72', pulse: 90, spo2: 99, temperature: '98.6°F' }, attendingDoctor: 'Dr. Rajesh Sharma', registrationTime: '08:40 AM', status: 'Observation' },
      { id: 'PAT-014', tokenNumber: 302, uhid: 'ABHA-MH-2026-3013', name: 'Gurpreet Singh Sandhu', age: 35, gender: 'M', facilityId: 'FAC-03', facilityName: 'PHC Wagholi', department: 'General OPD', chiefComplaint: 'Sudden onset generalized erythematous hives and facial pruritus following food intake', triagePriority: 'P3 - Urgent', vitals: { bp: '122/80', pulse: 88, spo2: 98, temperature: '98.5°F' }, attendingDoctor: 'Dr. Meena Gaikwad', registrationTime: '09:10 AM', status: 'In Consultation' },
      { id: 'PAT-015', tokenNumber: 303, uhid: 'ABHA-MH-2026-3014', name: 'Farhan Zahir Shaikh', age: 16, gender: 'M', facilityId: 'FAC-03', facilityName: 'PHC Wagholi', department: 'General OPD', chiefComplaint: 'Intense nocturnal itching with excoriated papules on finger webs (hostel room cluster)', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '114/70', pulse: 75, spo2: 99, temperature: '98.2°F' }, attendingDoctor: 'Dr. Pooja Patil', registrationTime: '09:30 AM', status: 'Waiting' },
      { id: 'PAT-016', tokenNumber: 401, uhid: 'ABHA-MH-2026-4021', name: 'Lakshmi Ramaswamy Sundaram', age: 52, gender: 'F', facilityId: 'FAC-04', facilityName: 'PHC Velhe', department: 'General OPD', chiefComplaint: 'Degenerative osteoarthritis bilateral knees with joint crepitus and impaired mobility', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '134/86', pulse: 76, spo2: 98, temperature: '98.4°F' }, attendingDoctor: 'Dr. Vikas Shinde', registrationTime: '08:30 AM', status: 'In Consultation' },
      { id: 'PAT-017', tokenNumber: 402, uhid: 'ABHA-MH-2026-4022', name: 'Rahul Vilas Wagh', age: 26, gender: 'M', facilityId: 'FAC-04', facilityName: 'PHC Velhe', department: 'Emergency', chiefComplaint: 'Class-III stray dog bite puncture wounds over right calf with active capillary bleeding', triagePriority: 'P2 - Emergent', vitals: { bp: '126/82', pulse: 92, spo2: 98, temperature: '98.8°F' }, attendingDoctor: 'Dr. Rahul Jadhav', registrationTime: '08:55 AM', status: 'In Consultation' },
      { id: 'PAT-018', tokenNumber: 403, uhid: 'ABHA-MH-2026-4023', name: 'Arvind Jayantilal Patel', age: 46, gender: 'M', facilityId: 'FAC-04', facilityName: 'PHC Velhe', department: 'General OPD', chiefComplaint: 'Acute purulent maxillary sinusitis with periorbital throbbing headache and fever', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '128/84', pulse: 80, spo2: 98, temperature: '100.2°F' }, attendingDoctor: 'Dr. Vikas Shinde', registrationTime: '09:20 AM', status: 'Waiting' },
      { id: 'PAT-019', tokenNumber: 501, uhid: 'ABHA-MH-2026-5091', name: 'Mohammed Asif Ansari', age: 38, gender: 'M', facilityId: 'FAC-05', facilityName: 'CHC Daund', department: 'General OPD', chiefComplaint: 'Chronic productive cough (>3 weeks) with low evening pyrexia, weight loss, hemoptysis streaks', triagePriority: 'P3 - Urgent', vitals: { bp: '120/78', pulse: 84, spo2: 96, temperature: '99.8°F' }, attendingDoctor: 'Dr. Deepak Shirole', registrationTime: '08:30 AM', status: 'In Consultation' },
      { id: 'PAT-020', tokenNumber: 502, uhid: 'ABHA-MH-2026-5092', name: 'Savita Baburao Shirole', age: 33, gender: 'F', facilityId: 'FAC-05', facilityName: 'CHC Daund', department: 'Maternity', chiefComplaint: 'Full-term pregnancy G2P1 admitted in active labor with regular uterine contractions every 3 min', triagePriority: 'P1 - Resuscitation', vitals: { bp: '128/84', pulse: 88, spo2: 99, temperature: '98.6°F' }, attendingDoctor: 'Dr. Swati Gholap', registrationTime: '08:45 AM', status: 'Admitted', bedNumber: 'Maternity-03' },
      { id: 'PAT-021', tokenNumber: 503, uhid: 'ABHA-MH-2026-5093', name: 'Vandana Hemant Kulkarni', age: 63, gender: 'F', facilityId: 'FAC-05', facilityName: 'CHC Daund', department: 'General Surgery', chiefComplaint: 'Diabetic neuro-ischemic plantar ulcer over 1st metatarsal head with surrounding cellulitis', triagePriority: 'P2 - Emergent', vitals: { bp: '144/88', pulse: 86, spo2: 97, temperature: '99.2°F' }, attendingDoctor: 'Dr. Suresh Pawar', registrationTime: '09:10 AM', status: 'Observation', bedNumber: 'Surg-01' },
      { id: 'PAT-022', tokenNumber: 601, uhid: 'ABHA-MH-2026-6011', name: 'Ananya Bhaskar Joshi', age: 4, gender: 'F', facilityId: 'FAC-06', facilityName: 'PHC Khed', department: 'Pediatrics', chiefComplaint: 'Acute bronchopneumonia with intercostal retractions, grunting and tachypnea (RR 46/min)', triagePriority: 'P2 - Emergent', vitals: { bp: '92/58', pulse: 128, spo2: 92, temperature: '101.8°F' }, attendingDoctor: 'Dr. Sujata Shinde', registrationTime: '08:40 AM', status: 'Admitted', bedNumber: 'Ped-01' },
      { id: 'PAT-023', tokenNumber: 602, uhid: 'ABHA-MH-2026-6012', name: 'Nitin Prabhakar More', age: 37, gender: 'M', facilityId: 'FAC-06', facilityName: 'PHC Khed', department: 'Emergency', chiefComplaint: 'Blunt occupational head trauma at warehouse, 4cm scalp laceration requiring primary repair', triagePriority: 'P3 - Urgent', vitals: { bp: '132/86', pulse: 82, spo2: 98, temperature: '98.4°F' }, attendingDoctor: 'Dr. Ganesh Thorat', registrationTime: '09:15 AM', status: 'Observation' },
      { id: 'PAT-024', tokenNumber: 701, uhid: 'ABHA-MH-2026-7041', name: 'Deepa Venkat Reddy', age: 29, gender: 'F', facilityId: 'FAC-07', facilityName: 'CHC Junnar', department: 'General OPD', chiefComplaint: 'Acute follicular tonsillitis with severe odynophagia, trismus and cervical lymphadenitis', triagePriority: 'P3 - Urgent', vitals: { bp: '116/74', pulse: 88, spo2: 99, temperature: '101.6°F' }, attendingDoctor: 'Dr. Arun Jagtap', registrationTime: '08:30 AM', status: 'In Consultation' },
      { id: 'PAT-025', tokenNumber: 702, uhid: 'ABHA-MH-2026-7042', name: 'Harish Devendra Salunke', age: 42, gender: 'M', facilityId: 'FAC-07', facilityName: 'CHC Junnar', department: 'Emergency & Surgery', chiefComplaint: 'Acute right iliac fossa abdominal pain, rebound tenderness, high fever (suspected appendicitis)', triagePriority: 'P2 - Emergent', vitals: { bp: '130/85', pulse: 104, spo2: 98, temperature: '101.2°F' }, attendingDoctor: 'Dr. Vikrant Shinde', registrationTime: '09:00 AM', status: 'Admitted', bedNumber: 'Surg-03' },
      { id: 'PAT-026', tokenNumber: 801, uhid: 'ABHA-MH-2026-8051', name: 'Sneha Nilesh Jadhav', age: 31, gender: 'F', facilityId: 'FAC-08', facilityName: 'PHC Shirur', department: 'Antenatal Care (ANC)', chiefComplaint: 'Gestational hypertension (BP 154/98 mmHg) in 28th week of gestation with trace proteinuria', triagePriority: 'P2 - Emergent', vitals: { bp: '154/98', pulse: 86, spo2: 98, temperature: '98.6°F' }, attendingDoctor: 'Dr. Kavita Joshi', registrationTime: '08:45 AM', status: 'In Consultation' },
      { id: 'PAT-027', tokenNumber: 802, uhid: 'ABHA-MH-2026-8052', name: 'Santosh Bapu Shinde', age: 39, gender: 'M', facilityId: 'FAC-08', facilityName: 'PHC Shirur', department: 'General OPD', chiefComplaint: 'Superficial 2nd-degree mechanical friction burn over left forearm from sugarcane crusher', triagePriority: 'P3 - Urgent', vitals: { bp: '124/80', pulse: 80, spo2: 99, temperature: '98.5°F' }, attendingDoctor: 'Dr. Sanjay Patil', registrationTime: '09:15 AM', status: 'Observation' },
      { id: 'PAT-028', tokenNumber: 803, uhid: 'ABHA-MH-2026-8053', name: 'Suman Ramprasad Gupta', age: 55, gender: 'F', facilityId: 'FAC-08', facilityName: 'PHC Shirur', department: 'General OPD', chiefComplaint: 'Chronic fatigue, periorbital puffiness, cold intolerance (suboptimally controlled hypothyroidism)', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '136/88', pulse: 66, spo2: 98, temperature: '97.8°F' }, attendingDoctor: 'Dr. Sanjay Patil', registrationTime: '09:35 AM', status: 'Waiting' },
      { id: 'PAT-029', tokenNumber: 901, uhid: 'ABHA-MH-2026-9021', name: 'Rajesh Pandurang Kulkarni', age: 62, gender: 'M', facilityId: 'FAC-09', facilityName: 'PHC Bhor', department: 'NCD Clinic', chiefComplaint: 'Hypertensive urgency with severe occipital headache, dizziness and epistaxis (BP 182/108 mmHg)', triagePriority: 'P2 - Emergent', vitals: { bp: '182/108', pulse: 92, spo2: 96, temperature: '98.4°F' }, attendingDoctor: 'Dr. Deepak More', registrationTime: '08:40 AM', status: 'Admitted', bedNumber: 'Bed-05' },
      { id: 'PAT-030', tokenNumber: 902, uhid: 'ABHA-MH-2026-9022', name: 'Rekha Manohar Gaikwad', age: 54, gender: 'F', facilityId: 'FAC-09', facilityName: 'PHC Bhor', department: 'General OPD', chiefComplaint: 'Generalized anxiety symptoms with persistent sleep disturbance and tension band headaches', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '130/82', pulse: 82, spo2: 98, temperature: '98.6°F' }, attendingDoctor: 'Dr. Amit Salunke', registrationTime: '09:05 AM', status: 'Waiting' },
      { id: 'PAT-031', tokenNumber: 1001, uhid: 'ABHA-MH-2026-1011', name: 'Pooja Santosh Rathod', age: 19, gender: 'F', facilityId: 'FAC-10', facilityName: 'PHC Purandar (Saswad)', department: 'General OPD', chiefComplaint: 'Severe nutritional microcytic hypochromic anemia (Hb 6.8 g/dL) with syncope upon standing', triagePriority: 'P2 - Emergent', vitals: { bp: '98/62', pulse: 106, spo2: 97, temperature: '98.2°F' }, attendingDoctor: 'Dr. Pooja Nimbalkar', registrationTime: '08:50 AM', status: 'Observation', bedNumber: 'Obs-01' },
      { id: 'PAT-032', tokenNumber: 1002, uhid: 'ABHA-MH-2026-1012', name: 'Meera Krishnan Nair', age: 25, gender: 'F', facilityId: 'FAC-10', facilityName: 'PHC Purandar (Saswad)', department: 'General OPD', chiefComplaint: 'Acute urinary tract infection with burning micturition, increased frequency and lower abdominal pain', triagePriority: 'P3 - Urgent', vitals: { bp: '114/72', pulse: 78, spo2: 99, temperature: '99.0°F' }, attendingDoctor: 'Dr. Sachin Jagtap', registrationTime: '09:20 AM', status: 'In Consultation' },
      { id: 'PAT-033', tokenNumber: 1101, uhid: 'ABHA-MH-2026-1105', name: 'Balasaheb Vishnu Jagtap', age: 71, gender: 'M', facilityId: 'FAC-11', facilityName: 'CHC Baramati', department: 'Urology & Geriatrics', chiefComplaint: 'Acute urinary retention secondary to benign prostatic hyperplasia, catheterized at triage', triagePriority: 'P2 - Emergent', vitals: { bp: '146/90', pulse: 84, spo2: 97, temperature: '98.4°F' }, attendingDoctor: 'Dr. Vinod Kale', registrationTime: '08:30 AM', status: 'Admitted', bedNumber: 'Ward-04' },
      { id: 'PAT-034', tokenNumber: 1201, uhid: 'ABHA-MH-2026-1201', name: 'Neha Sachin Kadam', age: 8, gender: 'F', facilityId: 'FAC-12', facilityName: 'PHC Narayangaon', department: 'Immunization & Wellness', chiefComplaint: 'National immunization schedule school-age booster and preventive health assessment', triagePriority: 'P4 - Non-Urgent', vitals: { bp: '102/66', pulse: 88, spo2: 99, temperature: '98.4°F' }, attendingDoctor: 'Dr. Swati Gholap', registrationTime: '09:00 AM', status: 'Discharged' },
      { id: 'PAT-035', tokenNumber: 1202, uhid: 'ABHA-MH-2026-1202', name: 'Kavita Dilip Kale', age: 36, gender: 'F', facilityId: 'FAC-12', facilityName: 'PHC Narayangaon', department: 'Highway Emergency Post', chiefComplaint: 'Highway auto collision cervical strain injury with shoulder contusions, neurological exam intact', triagePriority: 'P3 - Urgent', vitals: { bp: '124/80', pulse: 84, spo2: 98, temperature: '98.6°F' }, attendingDoctor: 'Dr. Pravin Kulkarni', registrationTime: '09:25 AM', status: 'Observation', bedNumber: 'Trauma-01' },
    ];


    this.footfalls = this.facilities.map((f) => ({
      id: `FT-${f.id}`,
      facilityId: f.id,
      facilityName: f.name,
      opdCount: f.type === 'CHC' ? 180 : 65,
      ipdCount: f.type === 'CHC' ? 24 : 8,
      emergencyCount: f.type === 'CHC' ? 12 : 3,
      totalToday: f.type === 'CHC' ? 216 : 76,
      surgeStatus: f.id === 'FAC-01' ? 'SURGE' : 'NORMAL',
      recordDate: new Date().toISOString().split('T')[0],
    }));

    this.diagnostics = [
      { id: 'DX-01', facilityId: 'FAC-01', facilityName: 'PHC Paud', testName: 'Rapid Malaria Antigen (Pf/Pv)', status: 'OUT_OF_STOCK', dailyVolume: 12 },
      { id: 'DX-02', facilityId: 'FAC-01', facilityName: 'PHC Paud', testName: 'Hemoglobin (Hb Meter)', status: 'AVAILABLE', dailyVolume: 35 },
      { id: 'DX-03', facilityId: 'FAC-02', facilityName: 'CHC Haveli', testName: 'Digital X-Ray Chest', status: 'AVAILABLE', dailyVolume: 42 },
      { id: 'DX-04', facilityId: 'FAC-02', facilityName: 'CHC Haveli', testName: 'Automated CBC Analyzer', status: 'AVAILABLE', dailyVolume: 60 },
    ];

    this.auditLogs = [
      {
        id: 'AUD-001',
        action: 'SYSTEM_BOOT',
        performedBy: 'MediGrid AI Telemetry Daemon',
        role: 'SYSTEM',
        details: 'Ingested telemetry for 12 district facilities. Database synchronized.',
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      },
    ];
  }

  public getTelemetryBundle() {
    return {
      facilities: this.facilities,
      inventory: this.inventory,
      transfers: this.transfers,
      alerts: this.alerts,
      beds: this.beds,
      doctors: this.doctors,
      patients: this.patients,
      footfalls: this.footfalls,
      diagnostics: this.diagnostics,
      auditLogs: this.auditLogs,
    };
  }

  public addPatient(patient: Omit<PatientRecord, 'id' | 'tokenNumber' | 'registrationTime'>): PatientRecord {
    const tokenNumber = (this.patients.length > 0 ? Math.max(...this.patients.map((p) => p.tokenNumber)) : 100) + 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newPatient: PatientRecord = {
      ...patient,
      id: `PAT-${Date.now().toString().slice(-4)}`,
      tokenNumber,
      registrationTime: timeStr,
    };
    this.patients.unshift(newPatient);

    this.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-6)}`,
      action: 'PATIENT_REGISTERED',
      performedBy: 'Triage Desk',
      role: 'MEDICAL_OFFICER',
      facilityId: newPatient.facilityId,
      details: `New patient registered: ${newPatient.name} (${newPatient.uhid}), Priority: ${newPatient.triagePriority}, Dept: ${newPatient.department}`,
      timestamp: new Date().toISOString(),
    });

    return newPatient;
  }

  public updatePatient(id: string, updates: Partial<PatientRecord>): PatientRecord | null {
    const p = this.patients.find((item) => item.id === id);
    if (!p) return null;
    Object.assign(p, updates);
    return p;
  }

  public updateDoctorAttendance(
    facilityId: string,
    present: number,
    absent: number,
    onLeave: number,
    note?: string
  ): DoctorRecord | null {
    const doc = this.doctors.find((d) => d.facilityId === facilityId);
    if (!doc) return null;
    doc.presentDoctors = present;
    doc.absentDoctors = absent;
    doc.onLeaveDoctors = onLeave;
    doc.attendanceRate = Math.round((present / doc.scheduledDoctors) * 100);
    doc.isStaffingDeficit = present < doc.minimumRequired;
    if (note) doc.alertNote = note;
    doc.lastUpdated = new Date().toISOString();

    this.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-6)}`,
      action: 'DOCTOR_ATTENDANCE_LOGGED',
      performedBy: 'Facility Medical Superintendent',
      role: 'MEDICAL_OFFICER',
      facilityId,
      details: `Doctor attendance updated for ${doc.facilityName}: ${present}/${doc.scheduledDoctors} present. Deficit: ${doc.isStaffingDeficit}`,
      timestamp: new Date().toISOString(),
    });

    return doc;
  }

  public approveTransfer(transferId: string, officerName?: string) {
    const tr = this.transfers.find((t) => t.id === transferId);
    if (!tr) return null;
    tr.status = 'APPROVED';
    tr.approvedBy = officerName || 'Dr. S. Kulkarni (District Health Officer)';
    tr.approvedTimestamp = new Date().toISOString();

    // Lock donor reserved quantity
    const donorInv = this.inventory.find((i) => i.facilityId === tr.sourceFacilityId && i.name === tr.medicineName);
    if (donorInv) {
      donorInv.reservedForTransfer += tr.quantity;
      donorInv.usableStock = Math.max(0, donorInv.currentStock - donorInv.quarantinedStock - donorInv.reservedForTransfer);
    }

    this.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-6)}`,
      action: 'TRANSFER_APPROVED',
      performedBy: tr.approvedBy,
      role: 'DISTRICT_ADMIN',
      facilityId: tr.destFacilityId,
      details: `Approved redistribution of ${tr.quantity} ${tr.unit} of ${tr.medicineName} to ${tr.destFacilityName}`,
      timestamp: new Date().toISOString(),
    });

    return tr;
  }

  public updateTransferStatus(transferId: string, status: TransferRecord['status']) {
    const tr = this.transfers.find((t) => t.id === transferId);
    if (!tr) return null;
    tr.status = status;
    if (status === 'DISPATCHED') tr.dispatchedTimestamp = new Date().toISOString();
    if (status === 'RECEIVED' || status === 'COMPLETED') {
      tr.receivedTimestamp = new Date().toISOString();
      // Deduct from donor, credit to destination
      const donor = this.inventory.find((i) => i.facilityId === tr.sourceFacilityId && i.name === tr.medicineName);
      if (donor) {
        donor.currentStock = Math.max(0, donor.currentStock - tr.quantity);
        donor.reservedForTransfer = Math.max(0, donor.reservedForTransfer - tr.quantity);
        donor.usableStock = Math.max(0, donor.currentStock - donor.quarantinedStock - donor.reservedForTransfer);
      }
      const recipient = this.inventory.find((i) => i.facilityId === tr.destFacilityId && i.name === tr.medicineName);
      if (recipient) {
        recipient.currentStock += tr.quantity;
        recipient.usableStock = Math.max(0, recipient.currentStock - recipient.quarantinedStock - recipient.reservedForTransfer);
        recipient.daysUntilStockOut = recipient.averageDailyConsumption > 0 ? Number((recipient.usableStock / recipient.averageDailyConsumption).toFixed(1)) : 99;
        recipient.alertSeverity = recipient.daysUntilStockOut <= 1.5 ? 'CRITICAL' : recipient.daysUntilStockOut <= 3.0 ? 'HIGH' : 'NORMAL';
      }
    }
    return tr;
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.isAcknowledged = true;
    }
    return alert;
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryRecord>) {
    const item = this.inventory.find((i) => i.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    item.usableStock = Math.max(0, item.currentStock - item.quarantinedStock - item.reservedForTransfer);
    item.daysUntilStockOut = item.averageDailyConsumption > 0 ? Number((item.usableStock / item.averageDailyConsumption).toFixed(1)) : 99;
    return item;
  }
}


export const db = new DistrictDatabase();
