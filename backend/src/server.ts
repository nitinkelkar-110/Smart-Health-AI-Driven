import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiRouter } from './api/aiRoutes.js';
import { telemetryRouter } from './api/telemetryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration — allows local dev server on Vite 5173
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// High-capacity JSON parser for district batches and telemetry
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MediGrid AI Secure Backend Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apiKeysHidden: true,
  });
});

// Mount modular sub-routers
app.use('/api/ai', aiRouter);
app.use('/api', telemetryRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Backend Server Error]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  MEDIGRID AI SECURE BACKEND GATEWAY                `);
  console.log(`  Listening on: http://localhost:${PORT}             `);
  console.log(`  API Keys Concealed: YES (Server-Side Proxy Mode)   `);
  console.log(`====================================================`);
});

export default app;
