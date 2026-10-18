# MediGrid AI — Multilingual Healthcare Intelligence & Autonomous Operational Telemetry Platform

> **Healthcare Intelligence Without Language Barriers**  
> *A full-stack, modular, scalable, multi-model AI platform coordinating essential healthcare resources for Primary Health Centres (PHCs), Community Health Centres (CHCs), healthcare workers, and district administrators.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Zero-Paid-API](https://img.shields.io/badge/Free%20Tier-Guaranteed-green.svg)](#free-tier-guarantee)
[![Automated Tests](https://img.shields.io/badge/Tests-18%2F18%20Passing-brightgreen.svg)](#automated-testing)

---

## 🌟 Executive Overview & Core Vision

Primary Health Centres (PHCs) and Community Health Centres (CHCs) form the foundational backbone of rural healthcare. Yet district health administrators face persistent operational crises:
1. **Medicine Stock-Outs**: Essential drugs (ORS, Amoxicillin, anti-snake venom) run out without early warning.
2. **Unmanaged Patient Footfall**: Seasonal epidemic surges overwhelm rural triage without visibility.
3. **Bed Visibility Gaps**: Inpatient occupancy rates across general, maternity, and pediatric wards are invisible between facilities.
4. **Doctor Attendance Deficits**: Staffing drops below statutory norms without proactive alerting.
5. **Diagnostic Failures**: Point-of-care test kits and lab reagents run dry without automated rerouting.
6. **Language Barriers**: Administrative directives and operational instructions fail to reach ground-level healthcare workers in their native language or writing system.

**MediGrid AI** solves these systemic bottlenecks through two tightly integrated pillars:
- **MediGrid Healthcare Resource Management Platform**: Real-time telemetry, transparent demand forecasting, automated at-risk facility detection, and an **inter-facility resource redistribution engine** with audited dispatch and receipt workflows.
- **MediGrid Intelligence (Dedicated AI Copilot)**: A multi-model engine routing across **50+ verified free model options**, supporting worldwide living languages, Web Speech voice input/output, and non-inventive retrieval-grounded clinical responses.

---

## 🔒 Free-Tier & Offline Guarantee (No Paid API Required)

MediGrid AI is architected so that **it never requires a paid API merely to start or evaluate the application**:
- **Offline Clinical Telemetry Engine**: Embedded deterministic clinical reasoning that answers operational queries with 0ms external network latency and zero credit deduction.
- **Strict Free-Only Filtering**: All third-party providers default to verified `:free` tiers (OpenRouter free tier, Groq LPU developer free tier, Google Gemini free tier, Hugging Face serverless, Cloudflare free neurons, and Ollama local models).
- **Zero Paid Escalation**: The automatic model router will **never silently switch to a paid model or deplete credits**. If third-party APIs hit rate limits or go offline, the system safely falls back to local and embedded models.
- **Honest Disclosures**: Third-party models are never falsely claimed to be trained from scratch by the application. Every response includes model and provider attribution badges.

---

## 🧠 Multi-Model AI Engine: MediGrid AI Model Hub

The **MediGrid AI Model Hub** connects to multiple AI providers through a standardized adapter architecture:

### 1. Supported AI Providers
1. **OpenRouter**: Curated collection of verified `:free` models with zero credit deduction.
2. **Groq Cloud**: High-speed LPU inference developer free tier (Llama 3.3 70B, Mixtral 8x7B).
3. **Google AI Studio (Gemini)**: Official Gemini 1.5/2.0 Flash free tier.
4. **Hugging Face**: Serverless inference for open-weights community models.
5. **Cloudflare Workers AI**: Edge inference with daily free neuron allowances.
6. **Ollama (Local Offline)**: 100% free, private, on-premise inference with zero internet requirement.
7. **MediGrid Clinical Rule Engine**: Embedded deterministic domain engine.

### 2. Live Dynamic Model Registry (50+ Verified Free Models)
The platform catalogs **over 50 genuinely distinct, verified free models**, including:
- `meta-llama/llama-3.3-70b-instruct:free`
- `deepseek/deepseek-r1:free`
- `qwen/qwen-2.5-7b-instruct:free`
- `google/gemini-2.0-flash-exp:free`
- `google/gemma-2-9b-it:free`
- `mistralai/mistral-7b-instruct:free`
- `groq/llama-3.3-70b-versatile`
- `groq/mixtral-8x7b-32768`
- `gemini-1.5-flash-free`
- `ollama/qwen2.5-coder:1.5b`
- `ollama/smollm2:1.7b`
- `cloudflare/meta-llama-3-8b`
- ...and 38+ additional verified free options.

### 3. Dynamic Model Discovery
Administrators can trigger live model catalog refreshing directly from provider APIs (e.g. OpenRouter `/models`, Ollama `/api/tags`). An administrator can also manually register custom endpoints.

---

## ⚡ Intelligent Model Router & Automatic Failover

When an operator queries MediGrid Intelligence:
1. **Language Detection**: Automatically identifies the input script (Latin, Devanagari, Arabic, etc.).
2. **Task Classification**: Categorizes the prompt into `'healthcare'`, `'reasoning'`, `'translation'`, `'summarization'`, or `'chat'`.
3. **Candidate Queue Assembly**: Ranks verified free models matching the required capabilities and estimated latency.
4. **Resilient Execution with Circuit Breakers**: Attempts execution with request timeouts.
5. **Cascade Failover**: If an external provider encounters a rate limit (HTTP 429), provider outage (HTTP 503), or timeout, the router automatically fails over to the next candidate model in the queue without user disruption.
6. **Guaranteed Local Landing**: The fallback chain always terminates at the embedded offline clinical telemetry engine.
7. **Grounded RAG Citations**: Operates on live facility records, bed matrices, and stock ledgers, citing specific sources (e.g. `PHC Paud stock ledger`, `Haveli bed census`). Never invents statistics or medical diagnoses.

---

## 🌍 Global Multilingual System & Full RTL Layout

Designed for worldwide accessibility across all living languages:
- **100+ Languages Cataloged**: Structured registry containing ISO codes, scripts, regions, native names, and speech capability flags.
- **South Asian & Indian Languages**: English, Hindi (`हिन्दी`), Marathi (`मराठी`), Bengali (`বাংলা`), Tamil (`தமிழ்`), Telugu (`తెలుగు`), Gujarati (`ગુજરાતી`), Kannada (`ಕನ್ನಡ`), Malayalam (`മലയാളം`), Punjabi (`ਪੰਜਾਬੀ`), Urdu (`اردو`), Sanskrit (`संस्कृतम्`), Assamese, Odia, Nepali, and more.
- **Global & Middle Eastern Languages**: Arabic (`العربية`), Hebrew (`עברית`), Persian (`فارسی`), Spanish, French, German, Russian, Chinese, Japanese, Korean, Portuguese, Swahili, and more.
- **Bi-Directional Layout (RTL & LTR)**: Native `dir="rtl"` text direction and UI alignment for Arabic, Urdu, Persian, and Hebrew.
- **Entity Preservation**: Clinical drug names (e.g. `Paracetamol 500mg`), batch numbers (`BN-402`), and numeric dosages are protected from distortion during translation.

---

## 🎙️ Voice & Accessibility Architecture

- **Microphone Speech-to-Text (STT)**: Web Speech Recognition API with real-time interim transcription and locale matching.
- **Text-to-Speech (TTS) Voice Responses**: High-fidelity speech synthesis with native voice matching, pause/resume, and adjustable playback speeds (`0.8x`, `1.0x`, `1.25x`).
- **High-Contrast Accessibility Mode**: Instant toggle for low-vision environments in rural health centres.
- **Low-Bandwidth Mode**: Strips heavy animations and minimizes payload size for 2G/3G connectivity.
- **Keyboard Navigation**: Full keyboard shortcuts (`Ctrl+K` for global command palette, Enter to submit, Shift+Enter for new line).

---

## 🏥 Complete Healthcare Operations Suite (15 Modules)

| # | Module | Core Functionality |
|---|---|---|
| 1 | **District Dashboard** | 8 KPI telemetry metrics, Leaflet GIS map with health pins, patient trends, bed occupancy, and shortage indicators. |
| 2 | **Health Centres Directory** | Complete profiles of all 12 PHCs and CHCs in Pune Rural District with bed, doctor, and health index ratings. |
| 3 | **Medicine Inventory** | Batch-level ledger, stock-out forecasting, consumption recording, stock-in additions, quarantine, and CSV export. |
| 4 | **AI Demand Forecast** | 7, 14, and 30-day projection curves with 95% confidence bounds, shortage intersection dates, and what-if sliders. |
| 5 | **Patient Footfall** | OPD, IPD, and emergency census, hourly arrival distribution curves, peak hours, and surge alarms. |
| 6 | **Bed Availability** | Live bed census across General, Maternity, Pediatric, and Emergency wards with occupancy rate meters. |
| 7 | **Doctor Attendance** | Roster shift logging, minimum requirement tracking, and staffing deficit alerts. |
| 8 | **Diagnostic Test Audit** | Point-of-care availability (Blood Glucose, Hb, Malaria, Dengue, Urine, USG) with alternate facility rerouting. |
| 9 | **Smart Resource Redistribution** | Automated surplus-to-deficit matching with approve/dispatch/receipt workflow and transfer routes map. |
| 10 | **At-Risk Facilities** | Multi-factor risk scoring (0–100) combining medicine, staff, bed, and test triggers with intervention logging. |
| 11 | **Alerts & Notifications** | Incident logging with severity filters, administrative acknowledgment, and resolution tracking. |
| 12 | **Reports & Analytics** | Monthly stock-out prevention metrics, facility benchmarking, statutory CSV audit export, and **Automated Test Runner**. |
| 13 | **MediGrid Intelligence** | Multilingual conversational copilot with streaming, voice STT/TTS, model selector, and grounded citations. |
| 14 | **AI Model Hub** | Model catalog with 50+ free models, Free Models Only filter, provider configurations, and latency tests. |
| 15 | **Settings** | Algorithmic thresholds, API credentials, Supabase connection status, and JSON database export. |

---

## 🧪 Automated Testing & Verification

MediGrid AI includes an extensive automated verification suite covering:
- Provider adapters & free-tier eligibility boundaries
- Live model registry capacity ($\ge 50$ distinct models)
- Multilingual script detection & RTL layout flags
- Usable stock calculations deducting quarantined and reserved units
- Smart redistribution safeguards ensuring donor mandatory reserves
- Demand forecasting confidence intervals and assumptions
- Composite risk scoring across multi-factor facility telemetry

### 1. Run Tests via CLI
```bash
npm test
```

### 2. Run Tests in Web UI
Navigate to **Reports & Analytics** $\rightarrow$ Click **"Run Automated Tests"** to execute all 18 tests live in the browser with pass/fail badges and detailed assertion logs.

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-org/medigrid-ai.git
cd medigrid-ai
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at: `http://localhost:5173/`

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## 🚀 Easy GitHub Push Guide

### Option 1: One-Click Script (Recommended)
Double-click [`push_to_github.bat`](file:///c:/Users/hp/Desktop/VELONX/push_to_github.bat) or run in terminal:
```bash
# In Windows Terminal or Command Prompt:
.\push_to_github.bat

# Or using npm:
npm run push
```
The script will prompt for your GitHub repository URL (if not already set), stage and commit your changes, and push branch `main` to GitHub automatically!

### Option 2: Standard Git Commands
```bash
# 1. Create a repository on GitHub (https://github.com/new)
# 2. Link your remote (replace with your GitHub repo URL):
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Ensure branch is main and push:
git branch -M main
git push -u origin main
```

---

## 📁 4-Tier Project Architecture

```text
VELONX/
├── frontend/                     # Standalone React 19 + Vite UI
├── backend/                      # Secure Express Server & AI Gateway (Port 3001)
├── database/                     # PostgreSQL / SQLite Schema, Seeds & Queries
├── api/                          # Shared API Contracts & OpenAPI 3.0 Specs
├── push_to_github.bat            # One-click Windows GitHub deployment script
└── package.json                  # Root Monorepo Orchestrator
```

### 4. Optional: Configure Third-Party API Keys (Server-Side Only)
All third-party API keys are strictly kept on the server and are **never exposed to client browsers**:
- Add your keys to [`backend/.env`](file:///c:/Users/hp/Desktop/VELONX/backend/.env):
  ```env
  GEMINI_API_KEY=AIzaSy...
  GROQ_API_KEY=gsk_...
  OPENROUTER_API_KEY=sk-or-v1-...
  ```
- `.gitignore` automatically prevents `.env` and credentials from being committed to GitHub.


## 🛡️ Security, Privacy & Compliance

- **No Patient PII Transmission**: Real-time patient identifiers are never forwarded to external LLM providers. Demonstrations use synthetic telemetry.
- **Server-Side Key Isolation**: Privileged database credentials remain isolated in environment variables.
- **Statutory Audit Trail**: Every clinical inventory quarantine, transfer approval, dispatch, and administrative intervention is recorded with timestamp, operator ID, and IP address.
- **Row-Level Security (RLS)**: PostgreSQL schema includes 19 tables with role-based policies for District Health Officers, Medical Officers, Pharmacists, and Logistics Coordinators.

---

## 👥 Contributors & Acknowledgments
Built with ❤️ for rural healthcare workers, Medical Officers, and District Health Teams striving to eliminate stock-outs and healthcare inequalities.
#   S m a r t - H e a l t h - A I - D r i v e n  
 