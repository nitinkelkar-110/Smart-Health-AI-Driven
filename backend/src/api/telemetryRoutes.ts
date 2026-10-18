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
