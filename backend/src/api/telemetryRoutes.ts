import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';

export const telemetryRouter = Router();

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
  if (facilityId) {
    items = items.filter((i) => i.facilityId === facilityId);
  }
  res.json({
    success: true,
    count: items.length,
    inventory: items,
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

// POST /api/transfers/approve
telemetryRouter.post('/transfers/approve', (req: Request, res: Response): void => {
  const { transferId, officerName } = req.body;
  const transfer = db.transfers.find((t) => t.id === transferId);
  if (!transfer) {
    res.status(404).json({ success: false, error: 'Transfer not found' });
    return;
  }
  transfer.status = 'APPROVED';
  transfer.approvedBy = officerName || 'District Health Officer (Pune)';
  res.json({
    success: true,
    message: `Transfer ${transferId} approved for dispatch.`,
    transfer,
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
