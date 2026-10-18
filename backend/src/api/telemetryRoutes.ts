import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';

export const telemetryRouter = Router();

// GET /api/telemetry — Full district bundle for instant initial hydration
telemetryRouter.get('/telemetry', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: db.getTelemetryBundle(),
  });
});

// POST /api/telemetry/reset — Reset database back to default state
telemetryRouter.post('/telemetry/reset', (_req: Request, res: Response): void => {
  db.seedDefaults();
  res.json({
    success: true,
    message: 'Database reset to initial district state.',
    data: db.getTelemetryBundle(),
  });
});

// GET /api/facilities
telemetryRouter.get('/facilities', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.facilities.length,
    facilities: db.facilities,
  });
});

// GET /api/inventory
telemetryRouter.get('/inventory', (req: Request, res: Response): void => {
  const facilityId = req.query.facilityId as string;
  let items = db.inventory;
  if (facilityId && facilityId !== 'ALL') {
    items = items.filter((i) => i.facilityId === facilityId);
  }
  res.json({
    success: true,
    count: items.length,
    inventory: items,
  });
});

// PUT /api/inventory/:id — Adjust stock / consumption
telemetryRouter.put('/inventory/:id', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const updated = db.updateInventoryItem(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Inventory record not found' });
    return;
  }
  res.json({
    success: true,
    item: updated,
  });
});

// GET /api/transfers
telemetryRouter.get('/transfers', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.transfers.length,
    transfers: db.transfers,
  });
});

// POST /api/transfers — Propose transfer
telemetryRouter.post('/transfers', (req: Request, res: Response): void => {
  const tr = req.body;
  if (!tr.medicineName || !tr.sourceFacilityId || !tr.destFacilityId) {
    res.status(400).json({ success: false, error: 'Missing required transfer fields' });
    return;
  }
  const newTransfer = {
    id: `TX-${Date.now().toString().slice(-6)}`,
    medicineId: tr.medicineId || 'INV-01',
    medicineName: tr.medicineName,
    sourceFacilityId: tr.sourceFacilityId,
    sourceFacilityName: tr.sourceFacilityName || 'CHC Haveli',
    destFacilityId: tr.destFacilityId,
    destFacilityName: tr.destFacilityName || 'PHC Paud',
    quantity: Number(tr.quantity) || 100,
    unit: tr.unit || 'units',
    distanceKm: Number(tr.distanceKm) || 25.0,
    priorityScore: Number(tr.priorityScore) || 90,
    status: 'PROPOSED' as const,
    proposedAt: new Date().toISOString(),
    reason: tr.reason || 'Operational stock redistribution requested',
  };
  db.transfers.unshift(newTransfer);
  res.json({
    success: true,
    transfer: newTransfer,
  });
});

// POST /api/transfers/approve — Approve transfer
telemetryRouter.post('/transfers/approve', (req: Request, res: Response): void => {
  const { transferId, officerName } = req.body;
  const transfer = db.approveTransfer(transferId, officerName);
  if (!transfer) {
    res.status(404).json({ success: false, error: 'Transfer not found' });
    return;
  }
  res.json({
    success: true,
    message: `Transfer ${transferId} approved for dispatch.`,
    transfer,
  });
});

// POST /api/transfers/:id/status — Status transitions (DISPATCHED, RECEIVED, etc.)
telemetryRouter.post('/transfers/:id/status', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const { status } = req.body;
  const updated = db.updateTransferStatus(id, status);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Transfer not found' });
    return;
  }
  res.json({
    success: true,
    transfer: updated,
  });
});

// GET /api/alerts
telemetryRouter.get('/alerts', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.alerts.length,
    alerts: db.alerts,
  });
});

// POST /api/alerts/:id/acknowledge
telemetryRouter.post('/alerts/:id/acknowledge', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const alert = db.acknowledgeAlert(id);
  if (!alert) {
    res.status(404).json({ success: false, error: 'Alert not found' });
    return;
  }
  res.json({
    success: true,
    alert,
  });
});

// GET /api/beds
telemetryRouter.get('/beds', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.beds.length,
    beds: db.beds,
  });
});

// GET /api/doctors
telemetryRouter.get('/doctors', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.doctors.length,
    doctors: db.doctors,
  });
});

// POST /api/doctors/attendance — Log doctor attendance for a facility
telemetryRouter.post('/doctors/attendance', (req: Request, res: Response): void => {
  const { facilityId, presentDoctors, absentDoctors, onLeaveDoctors, alertNote } = req.body;
  if (!facilityId) {
    res.status(400).json({ success: false, error: 'facilityId is required' });
    return;
  }
  const updated = db.updateDoctorAttendance(
    facilityId,
    Number(presentDoctors) || 0,
    Number(absentDoctors) || 0,
    Number(onLeaveDoctors) || 0,
    alertNote
  );
  if (!updated) {
    res.status(404).json({ success: false, error: 'Facility doctor record not found' });
    return;
  }
  res.json({
    success: true,
    message: 'Doctor attendance updated successfully',
    doctorRecord: updated,
  });
});

// GET /api/patients — Live district patient triage and OPD queue
telemetryRouter.get('/patients', (req: Request, res: Response): void => {
  const facilityId = req.query.facilityId as string;
  const status = req.query.status as string;
  const priority = req.query.priority as string;
  const search = (req.query.search as string || '').toLowerCase().trim();

  let patients = db.patients;

  if (facilityId && facilityId !== 'ALL') {
    patients = patients.filter((p) => p.facilityId === facilityId);
  }
  if (status && status !== 'ALL') {
    patients = patients.filter((p) => p.status === status);
  }
  if (priority && priority !== 'ALL') {
    patients = patients.filter((p) => p.triagePriority === priority);
  }
  if (search) {
    patients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.uhid.toLowerCase().includes(search) ||
        p.chiefComplaint.toLowerCase().includes(search) ||
        p.attendingDoctor.toLowerCase().includes(search) ||
        p.department.toLowerCase().includes(search)
    );
  }

  res.json({
    success: true,
    count: patients.length,
    totalRegistered: db.patients.length,
    patients,
  });
});

// POST /api/patients — Register new incoming patient
telemetryRouter.post('/patients', (req: Request, res: Response): void => {
  const {
    uhid,
    name,
    age,
    gender,
    facilityId,
    facilityName,
    department,
    chiefComplaint,
    triagePriority,
    vitals,
    attendingDoctor,
    status,
    bedNumber,
  } = req.body;

  if (!name || !facilityId || !chiefComplaint) {
    res.status(400).json({
      success: false,
      error: 'Missing required patient fields: name, facilityId, and chiefComplaint are mandatory',
    });
    return;
  }

  const newPatient = db.addPatient({
    uhid: uhid || `ABHA-MH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    age: Number(age) || 30,
    gender: gender || 'Other',
    facilityId,
    facilityName: facilityName || 'District Health Facility',
    department: department || 'General OPD',
    chiefComplaint,
    triagePriority: triagePriority || 'P3 - Urgent',
    vitals: vitals || { bp: '120/80', pulse: 80, spo2: 98, temperature: '98.6°F' },
    attendingDoctor: attendingDoctor || 'Dr. Ramesh Bhosale',
    status: status || 'Waiting',
    bedNumber,
  });

  res.status(201).json({
    success: true,
    message: 'Patient registered successfully at triage desk',
    patient: newPatient,
  });
});

// PUT /api/patients/:id — Update patient status / consultation progress
telemetryRouter.put('/patients/:id', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const updated = db.updatePatient(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Patient not found' });
    return;
  }
  res.json({
    success: true,
    message: 'Patient record updated',
    patient: updated,
  });
});

// GET /api/footfalls
telemetryRouter.get('/footfalls', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.footfalls.length,
    footfalls: db.footfalls,
  });
});

// GET /api/diagnostics
telemetryRouter.get('/diagnostics', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.diagnostics.length,
    diagnostics: db.diagnostics,
  });
});

// GET /api/doctors — Get duty rosters and attendance for all facilities
telemetryRouter.get('/doctors', (req: Request, res: Response): void => {
  const { facilityId } = req.query;
  let records = db.doctors;
  if (facilityId && typeof facilityId === 'string') {
    records = records.filter((d) => d.facilityId === facilityId);
  }
  res.json({
    success: true,
    count: records.length,
    doctors: records,
  });
});

// POST /api/doctors/attendance — Update attendance report for a facility
telemetryRouter.post('/doctors/attendance', (req: Request, res: Response): void => {
  const { facilityId, present, absent, onLeave, note } = req.body;
  if (!facilityId || present === undefined) {
    res.status(400).json({
      success: false,
      error: 'facilityId and present count are required',
    });
    return;
  }

  const updated = db.updateDoctorAttendance(
    String(facilityId),
    Number(present) || 0,
    Number(absent) || 0,
    Number(onLeave) || 0,
    note ? String(note) : undefined
  );

  if (!updated) {
    res.status(404).json({ success: false, error: 'Facility doctor record not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Doctor attendance updated successfully',
    record: updated,
  });
});

