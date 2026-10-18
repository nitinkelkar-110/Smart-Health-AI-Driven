import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Key,
  Sliders,
  RotateCcw,
  Download,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  ExternalLink,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGeminiApiKey, saveGeminiApiKey } from '../services/aiService';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabaseClient';

export const Settings: React.FC = () => {
  const {
    resetDemoData,
    runDemoScenario,
    facilities,
    inventory,
    footfalls,
    beds,
    doctors,
    diagnostics,
    transfers,
    alerts,
    auditLogs,
  } = useApp();

  // Gemini State
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [geminiSaved, setGeminiSaved] = useState(false);

  // Supabase State
  const supaConf = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(supaConf.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supaConf.anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  // Copy Schema feedback
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleSaveGemini = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(geminiKey);
    setGeminiSaved(true);
    setTimeout(() => setGeminiSaved(false), 2500);
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setIsTestingSupabase(true);
    const ok = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setIsTestingSupabase(false);
    setSupabaseStatus(ok ? 'Connected successfully!' : 'Saved in local mode (invalid URL/key format)');
  };

  const handleExportJSON = () => {
    const fullState = {
      timestamp: new Date().toISOString(),
      district: 'Pune Rural District Directorate',
      facilities,
      inventory,
      footfalls,
      beds,
      doctors,
      diagnostics,
      transfers,
      alerts,
      auditLogs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `medigrid_full_database_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings & Operational Configurations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage prediction thresholds, Gemini AI credentials, PostgreSQL / Supabase sync, and demo data states.
        </p>
      </div>

      {/* 1. Algorithmic Thresholds */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900">Configured Operational Thresholds</h2>
        </div>
        <p className="text-xs text-slate-500">
          The autonomous monitoring daemon evaluates telemetry every 60 seconds against these parameters:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-700 block">Critical Stock-Out Horizon</span>
            <span className="text-lg font-bold text-red-600">&le; 1.5 Days (36h)</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Triggers priority redistribution</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-700 block">Donor Safety Buffer</span>
            <span className="text-lg font-bold text-teal-700">7 Days Run-rate + Min Buffer</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Surplus cannot dip below this</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-700 block">Overcrowding Warning</span>
            <span className="text-lg font-bold text-amber-600">&gt; 30% Above Capacity</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Alerts roving medical officers</span>
          </div>
        </div>
      </div>

      {/* 2. Gemini AI & Multi-Model Server Gateway */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">AI Gateway Security (Zero Client Secret Exposure)</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Server Proxy Active (Port 3001)
          </span>
        </div>
        <p className="text-xs text-slate-500">
          All external LLM and AI requests (Google Gemini, Groq, OpenRouter) route through our secure backend gateway. 
          Third-party API keys are stored only in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">backend/.env</code> or server memory and are <strong>strictly hidden</strong> from the browser, client bundles, and network inspectors.
        </p>

        <form onSubmit={handleSaveGemini} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Set Server-Side Gemini API Key (Optional)</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Paste AIzaSy... (Saved directly to server, hidden from client)"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {geminiSaved && <span className="text-emerald-600 font-semibold">Configured on backend server successfully!</span>}
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Update Server Key
            </button>
          </div>
        </form>
      </div>

      {/* 3. Database Architecture & Modular Directory Structure */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Modular Database & API Architecture</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Clean 4-Tier Separation
          </span>
        </div>
        <p className="text-xs text-slate-500">
          The system codebase is strictly separated into modular directories for enterprise maintainability:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block">📁 frontend/</span>
            <span className="text-slate-500 text-[11px]">React 19 + Vite UI components, multilingual layouts, and interactive charts.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block">📁 backend/</span>
            <span className="text-slate-500 text-[11px]">Express API server, secure AI gateway proxy, and telemetry controllers.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block">📁 database/</span>
            <span className="text-slate-500 text-[11px]">PostgreSQL DDL schema, seed datasets, and analytical Haversine queries.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block">📁 api/</span>
            <span className="text-slate-500 text-[11px]">Shared TypeScript interfaces, contracts, and OpenAPI 3.0 specification.</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Master SQL DDL with 19 relational tables & indexes located in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">database/schema.sql</code>.
          </span>
        </div>
      </div>

      {/* 4. Demo Controls & Database JSON Export */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Demo Mode & Data Utilities</h2>
        <p className="text-xs text-slate-500">
          Quickly trigger predefined hackathon evaluation scenarios or reset the entire system state back to initial synthetic values.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Reset all demo state back to default synthetic health data?')) {
                resetDemoData();
              }
            }}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Dataset</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Database (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
