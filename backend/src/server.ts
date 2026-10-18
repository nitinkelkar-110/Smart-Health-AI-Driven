import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { aiRouter } from './api/aiRoutes.js';
import { telemetryRouter } from './api/telemetryRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration — allows local dev server on Vite 5173
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001'],
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

// Production Static Asset Serving (Frontend React bundle)
const candidateDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
];

let activeDistPath: string | null = null;
for (const p of candidateDistPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    activeDistPath = p;
    break;
  }
}

if (activeDistPath) {
  app.use(express.static(activeDistPath));

  // SPA fallback for client-side routes (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }
    const targetFile = path.join(activeDistPath!, 'index.html');
    if (fs.existsSync(targetFile)) {
      return res.sendFile(targetFile);
    }
    next();
  });
}

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
  console.log(`  MEDIGRID AI FULL-STACK ENGINE                     `);
  console.log(`  Listening on: http://localhost:${PORT}             `);
  console.log(`  API Keys Concealed: YES (Server-Side Proxy Mode)   `);
  console.log(`  Static Web App Serving: ${activeDistPath ? 'ACTIVE' : 'DEV PROXY MODE'} `);
  console.log(`====================================================`);
});

export default app;
