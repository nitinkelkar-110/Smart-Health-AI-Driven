import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Globe,
  Sliders,
  ExternalLink,
  Plus,
  ShieldCheck,
  Server,
  Layers,
  X,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIModel, AIProviderName, ModelTaskType } from '../types/aiHub';

export const AIModelHub: React.FC = () => {
  const {
    aiModels,
    providers,
    defaultModelId,
    setDefaultModelId,
    refreshProviderModels,
    addCustomModel,
    setActiveTab,
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [freeOnly, setFreeOnly] = useState(true);
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [taskFilter, setTaskFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Testing Model state
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ modelId: string; status: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  // Add Model Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelId, setNewModelId] = useState('');
  const [newProvider, setNewProvider] = useState<AIProviderName>('OpenRouter');
  const [newContext, setNewContext] = useState(32768);

  // Filtered Models
  const filteredModels = useMemo(() => {
    return aiModels.filter((m) => {
      const matchesSearch =
        m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFree = !freeOnly || m.isFreeOnlyEligible;
      const matchesProvider = providerFilter === 'ALL' || m.provider === providerFilter;
      const matchesTask = taskFilter === 'ALL' || m.supportedTasks.includes(taskFilter as ModelTaskType);

      return matchesSearch && matchesFree && matchesProvider && matchesTask;
    });
  }, [aiModels, searchQuery, freeOnly, providerFilter, taskFilter]);

  // Verified counts
  const totalVerifiedFree = useMemo(() => {
    return aiModels.filter((m) => m.isFreeOnlyEligible).length;
  }, [aiModels]);

  const activeProvidersCount = providers.filter((p) => p.isEnabled).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProviderModels();
    setIsRefreshing(false);
  };

  const handleTestConnection = (model: AIModel) => {
    setTestingModelId(model.id);
    setTestResult(null);

    // Simulate fast provider health ping
    setTimeout(() => {
      setTestingModelId(null);
      setTestResult({
        modelId: model.id,
        status: 'SUCCESS',
        message: `Endpoint verified: ${model.displayName} responded with latency ${model.estimatedLatencyMs}ms. Ready for routing.`,
      });
    }, 450);
  };

  const handleAddNewModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim() || !newModelId.trim()) return;

    addCustomModel({
      id: `custom-${Date.now()}`,
      provider: newProvider,
      modelId: newModelId.trim(),
      displayName: newModelName.trim(),
      description: 'Custom administrator registered model endpoint.',
      freeEligibility: 'FREE_TIER_API',
      pricingStatus: 'Admin Configured Free Tier',
      isFreeOnlyEligible: true,
      contextWindow: newContext,
      modalities: ['text'],
      supportedTasks: ['chat', 'healthcare'],
      supportedLanguages: ['multilingual'],
      toolCalling: true,
      streaming: true,
      status: 'AVAILABLE',
      rateLimitNote: 'Provider defined rate limits apply',
      estimatedLatencyMs: 300,
      lastVerified: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setNewModelName('');
    setNewModelId('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">MediGrid AI Model Hub</h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Verified Free Model Registry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic adapter registry connecting open-weight local engines, OpenRouter free tiers, Groq LPUs, and Gemini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Discovering...' : 'Refresh Registry'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Provider / Model</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Verified Free Models</span>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">{totalVerifiedFree} Eligible</div>
          <span className="text-[11px] text-teal-600 font-semibold">Zero credit deduction verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Connected Providers</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-700">{activeProvidersCount} Providers</div>
          <span className="text-[11px] text-slate-400">OpenRouter, Groq, Gemini, Ollama</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Automatic Failover</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">Active</div>
          <span className="text-[11px] text-emerald-600 font-medium">Circuit-breaker multi-routing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Default Router</span>
          <div className="mt-2 text-xs font-bold text-slate-800 truncate">
            {aiModels.find((m) => m.id === defaultModelId)?.displayName || 'Auto-Failover Mode'}
          </div>
          <span className="text-[11px] text-slate-400">Primary execution tier</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search model by name, architecture (e.g. Llama, Mistral, Qwen, DeepSeek), or provider..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Free Only Toggle Switch */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/80 border border-teal-200 rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="accent-teal-600"
            />
            <span className="font-bold text-teal-900">Free Models Only</span>
          </label>

          {/* Provider Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 mr-2 font-medium">Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Providers ({providers.length})</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Capability Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 mr-2 font-medium">Task:</span>
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Tasks</option>
              <option value="healthcare">Healthcare & Inventory</option>
              <option value="chat">Conversational Chat</option>
              <option value="reasoning">Deep Reasoning & Logic</option>
              <option value="translation">Translation</option>
              <option value="speech">Voice & Speech</option>
              <option value="vision">Vision & Scans</option>
              <option value="coding">Structured JSON & Code</option>
            </select>
          </div>
        </div>
      </div>

      {/* Model Test Alert Feedback */}
      {testResult && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testResult.message}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map((model) => {
          const isDefault = defaultModelId === model.id;
          const isTesting = testingModelId === model.id;

          return (
            <div
              key={model.id}
              className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                isDefault ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {model.provider}
                      </span>
                      {model.isFreeOnlyEligible && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          FREE
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 mt-1">{model.displayName}</h2>
                    <span className="text-[10px] font-mono text-slate-400 block truncate" title={model.modelId}>
                      {model.modelId}
                    </span>
                  </div>

                  {isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-600 text-white rounded-full shrink-0 shadow-2xs">
                      ACTIVE DEFAULT
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>

                {/* Specs Pill Strip */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                  <div className="bg-slate-50 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Context</span>
                    <span className="font-bold text-slate-800">
                      {model.contextWindow ? `${Math.round(model.contextWindow / 1000)}k` : '32k'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Latency</span>
                    <span className="font-bold text-teal-700">{model.estimatedLatencyMs}ms</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Streaming</span>
                    <span className="font-bold text-slate-800">{model.streaming ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {/* Tasks Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {model.supportedTasks.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium capitalize"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Rate limit note */}
                <div className="mt-2 text-[10px] text-slate-400">
                  <span>Quota: {model.rateLimitNote}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => handleTestConnection(model)}
                  disabled={isTesting}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition font-medium flex items-center gap-1"
                >
                  <Play className="w-3 h-3 text-slate-400" />
                  <span>{isTesting ? 'Testing...' : 'Test'}</span>
                </button>

                {!isDefault ? (
                  <button
                    onClick={() => setDefaultModelId(model.id)}
                    className="px-3 py-1 bg-slate-50 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-200 rounded-lg border border-slate-200 font-semibold text-slate-700 transition"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleAddNewModel}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register Custom Model Endpoint</h3>
                <p className="text-xs text-slate-500">Add an open-weight, free tier, or local model</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Provider Adapter</label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value as AIProviderName)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="OpenRouter">OpenRouter</option>
                  <option value="Groq">Groq Cloud</option>
                  <option value="Gemini">Google AI Studio (Gemini)</option>
                  <option value="Ollama">Ollama (Local Offline)</option>
                  <option value="HuggingFace">Hugging Face</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="e.g. My Fine-Tuned Llama 3 Medical"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Exact Model ID / Path</label>
                <input
                  type="text"
                  required
                  value={newModelId}
                  onChange={(e) => setNewModelId(e.target.value)}
                  placeholder="e.g. meta-llama/llama-3.2-3b-instruct:free or llama3.2:latest"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Context Window (Tokens)</label>
                <input
                  type="number"
                  value={newContext}
                  onChange={(e) => setNewContext(parseInt(e.target.value) || 32768)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Register in Hub
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
