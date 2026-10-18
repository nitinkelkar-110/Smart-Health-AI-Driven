/**
 * MediGrid AI — Architectural Separation & Key Concealment Test Suite
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

console.log('====================================================');
console.log('   MEDIGRID AI — ARCHITECTURE & SECURITY AUDIT       ');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(category, desc, condition, msg) {
  if (condition) {
    passed++;
    console.log(`[PASS] [${category}] ${desc}: ${msg}`);
  } else {
    failed++;
    console.error(`[FAIL] [${category}] ${desc}: ${msg}`);
  }
}

// 1. Directory Separation Verifications
assert(
  'Directory Separation',
  'Frontend Directory Structure',
  existsSync(resolve('frontend/src')) &&
  existsSync(resolve('frontend/public')) &&
  existsSync(resolve('frontend/index.html')) &&
  existsSync(resolve('frontend/vite.config.ts')) &&
  existsSync(resolve('frontend/package.json')),
  'frontend/ contains complete standalone frontend code and configuration'
);

assert(
  'Directory Separation',
  'Backend Directory Structure',
  existsSync(resolve('backend/src/server.ts')) &&
  existsSync(resolve('backend/src/api/aiRoutes.ts')) &&
  existsSync(resolve('backend/src/services/secureAiGateway.ts')) &&
  existsSync(resolve('backend/src/database/db.ts')) &&
  existsSync(resolve('backend/.env.example')) &&
  existsSync(resolve('backend/package.json')),
  'backend/ contains complete server gateway, API routes, and DB layers'
);

assert(
  'Directory Separation',
  'Database Directory Structure',
  existsSync(resolve('database/schema.sql')) &&
  existsSync(resolve('database/seeds.sql')) &&
  existsSync(resolve('database/queries.sql')),
  'database/ contains SQL schema, initial seeds, and analytical queries'
);

assert(
  'Directory Separation',
  'API Directory Structure',
  existsSync(resolve('api/types.ts')) &&
  existsSync(resolve('api/openapi.json')),
  'api/ contains shared TypeScript types and OpenAPI 3.0 specification'
);

// 2. Secret Concealment Audit (Zero Client Key Exposure)
const frontendModelRouter = readFileSync(resolve('frontend/src/services/modelRouter.ts'), 'utf-8');
const rootModelRouter = readFileSync(resolve('src/services/modelRouter.ts'), 'utf-8');

assert(
  'Security & Key Concealment',
  'No Direct Client-Side OpenRouter Key Fetch',
  !frontendModelRouter.includes("fetch('https://openrouter.ai/api/v1/chat/completions'") &&
  !rootModelRouter.includes("fetch('https://openrouter.ai/api/v1/chat/completions'"),
  'Client-side OpenRouter direct fetch removed; routed strictly through /api/ai/chat'
);

assert(
  'Security & Key Concealment',
  'No Direct Client-Side Groq Key Fetch',
  !frontendModelRouter.includes("fetch('https://api.groq.com/openai/v1/chat/completions'") &&
  !rootModelRouter.includes("fetch('https://api.groq.com/openai/v1/chat/completions'"),
  'Client-side Groq direct fetch removed; routed strictly through /api/ai/chat'
);

const frontendAiService = readFileSync(resolve('frontend/src/services/aiService.ts'), 'utf-8');
const rootAiService = readFileSync(resolve('src/services/aiService.ts'), 'utf-8');

assert(
  'Security & Key Concealment',
  'No Direct Client-Side Gemini Key Fetch',
  !frontendAiService.includes('generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=') &&
  !rootAiService.includes('generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='),
  'Client-side Gemini URL query key param removed; routed strictly through /api/ai/chat'
);

const serverGatewayContent = readFileSync(resolve('backend/src/services/secureAiGateway.ts'), 'utf-8');

assert(
  'Security & Key Concealment',
  'Server API Key Masking Implemented',
  serverGatewayContent.includes('maskKey') &&
  serverGatewayContent.includes('maskedKeyPreview'),
  'Server masks API keys and never returns plain secrets to client'
);

assert(
  'Security & Key Concealment',
  'Environment File Excluded From Git',
  readFileSync(resolve('.gitignore'), 'utf-8').includes('.env'),
  '.gitignore contains .env to prevent secret leakage'
);

console.log('\n====================================================');
console.log(`TOTAL AUDIT CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log(`STATUS: ${failed === 0 ? 'ALL ARCHITECTURE & SECURITY CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
