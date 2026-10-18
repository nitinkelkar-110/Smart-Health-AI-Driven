import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Square,
  ThumbsUp,
  AlertTriangle,
  Layers,
  ChevronDown,
  Search,
  Plus,
  Trash2,
  Cpu,
  ShieldCheck,
  Clock,
  Radio,
  ExternalLink,
  Info,
  CheckCircle2,
  Sliders,
  X,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { executeRoutedAIRequest } from '../services/modelRouter';
import { voiceAssistant } from '../services/voiceService';
import { GLOBAL_LANGUAGES } from '../services/languageRegistry';
import { AIModel, ChatMessage, GlobalLanguage } from '../types/aiHub';
import { getTranslation } from '../i18n';

export const MediGridIntelligenceChat: React.FC = () => {
  const {
    facilities,
    inventory,
    beds,
    doctors,
    transfers,
    alerts,
    atRiskFacilities,
    aiModels,
    providers,
    defaultModelId,
    setDefaultModelId,
    globalLanguage,
    setGlobalLanguage,
    globalLanguages,
    isHighContrast,
    setIsHighContrast,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    deleteConversation,
    addMessageToCurrentConversation,
    updateMessageInCurrentConversation,
    clearCurrentConversation,
    setActiveTab,
  } = useApp();

  // Active Conversation
  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === currentConversationId) ||
      conversations[0] || {
        id: 'fallback',
        title: 'Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferredLanguage: globalLanguage.code,
        messages: [],
      }
    );
  }, [conversations, currentConversationId, globalLanguage.code]);

  // UI State
  const [inputText, setInputText] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string>(
    activeConversation.selectedModelId || defaultModelId
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchConvoQuery, setSearchConvoQuery] = useState('');

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Modals & Panels
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [showModelDetailsModal, setShowModelDetailsModal] = useState<AIModel | null>(null);
  const [filterLangContinent, setFilterLangContinent] = useState<string>('ALL');

  // Abort controller reference for stopping generation
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation.messages, streamBuffer, isGenerating]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Currently selected model object
  const activeModel = useMemo(() => {
    if (selectedModelId === 'auto') return null;
    return aiModels.find((m) => m.id === selectedModelId) || aiModels[0];
  }, [aiModels, selectedModelId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchConvoQuery.trim()) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchConvoQuery.toLowerCase())
    );
  }, [conversations, searchConvoQuery]);

  // Filter languages in modal
  const filteredLanguages = useMemo(() => {
    return globalLanguages.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(languageSearch.toLowerCase()) ||
        l.code.toLowerCase().includes(languageSearch.toLowerCase()) ||
        l.script.toLowerCase().includes(languageSearch.toLowerCase()) ||
        l.region.toLowerCase().includes(languageSearch.toLowerCase());

      const matchesRegion =
        filterLangContinent === 'ALL' ||
        (filterLangContinent === 'India' && l.region.toLowerCase().includes('india')) ||
        (filterLangContinent === 'Global' && l.region.toLowerCase().includes('global')) ||
        (filterLangContinent === 'MiddleEast' && (l.direction === 'rtl' || l.region.includes('Middle East')));

      return matchesSearch && matchesRegion;
    });
  }, [globalLanguages, languageSearch, filterLangContinent]);

  // Localized Suggested Prompts based on active language
  const suggestedPrompts = useMemo(() => {
    const code = globalLanguage.code;
    if (code === 'mr') {
      return [
        {
          title: 'औषध तुटवडा',
          prompt: 'पुणे जिल्ह्यातील कोणत्या प्राथमिक आरोग्य केंद्रांमध्ये पुढील ४८ ते ७२ तासांत औषध तुटवडा होण्याची शक्यता आहे?',
          badge: 'इन्व्हेंटरी RAG',
        },
        {
          title: 'स्मार्ट पुनर्वितरण',
          prompt: 'अतिरिक्त साठा असलेल्या केंद्रांकडून प्रा.आ. केंद्र पौडसाठी ओआरएस पाकिटांचे इष्टतम पुनर्वितरण काढा.',
          badge: 'लॉजिस्टिक्स',
        },
        {
          title: 'खाटा उपलब्धता तक्ता',
          prompt: 'सर्व १२ आरोग्य केंद्रांमधील प्रसूती, सामान्य आणि आपत्कालीन खाटांची सद्यस्थिती दाखवा.',
          badge: 'थेट टेलीमेट्री',
        },
        {
          title: 'डॉक्टर उपस्थिती ऑडिट',
          prompt: 'आज कोणत्या आरोग्य केंद्रांमध्ये किमान आवश्यकतेपेक्षा कमी डॉक्टर उपस्थित आहेत?',
          badge: 'कर्मचारी उपस्थिती',
        },
        {
          title: 'गंभीर अलर्ट्स',
          prompt: 'जिल्ह्यातील सर्व प्रलंबित आणि अतिगंभीर अलर्ट्सचा सारांश द्या.',
          badge: 'आरोग्य सूचना',
        },
      ];
    }
    if (code === 'hi') {
      return [
        {
          title: 'दवाइयों की कमी',
          prompt: 'पुणे जिले के किन प्राथमिक स्वास्थ्य केंद्रों में अगले 48 से 72 घंटों में दवाओं की कमी होने की संभावना है?',
          badge: 'इन्वेंट्री RAG',
        },
        {
          title: 'स्मार्ट पुनर्वितरण',
          prompt: 'अधिशेष केंद्रों से पीएचसी पौड के लिए ओआरएस पैकेट के पुनर्वितरण की गणना करें।',
          badge: 'रसद समन्वय',
        },
        {
          title: 'बिस्तर उपलब्धता',
          prompt: 'सभी 12 केंद्रों में उपलब्ध प्रसूति, सामान्य और आपातकालीन बिस्तरों का विवरण दें।',
          badge: 'बिस्तर टेलीमेट्री',
        },
        {
          title: 'डॉक्टर उपस्थिति',
          prompt: 'आज किन केंद्रों में न्यूनतम आवश्यक संख्या से कम डॉक्टर उपस्थित हैं?',
          badge: 'मानव संसाधन',
        },
        {
          title: 'गंभीर अलर्ट',
          prompt: 'जिले के सभी सक्रिय अति-गंभीर अलर्ट का सारांश दें।',
          badge: 'अलर्ट सारांश',
        },
      ];
    }
    return [
      {
        title: 'Medicine Shortages',
        prompt: 'Which PHCs in Pune district face imminent medicine stock-outs in the next 48 to 72 hours?',
        badge: 'Inventory RAG',
      },
      {
        title: 'Smart Redistribution',
        prompt: 'Calculate an optimal resource redistribution for ORS sachets from surplus facilities to PHC Paud.',
        badge: 'Logistics',
      },
      {
        title: 'Bed Capacity Matrix',
        prompt: 'Provide a breakdown of available maternity, general, and emergency beds across all 12 facilities.',
        badge: 'Bed Telemetry',
      },
      {
        title: 'Staffing Audit',
        prompt: 'Which facilities report doctor attendance deficits below statutory minimums today?',
        badge: 'Human Resources',
      },
      {
        title: 'Emergency Guidance',
        prompt: 'What are the verified protocols and escalation phone lines for severe pediatric dehydration in rural areas?',
        badge: 'Clinical Protocol',
      },
    ];
  }, [globalLanguage.code]);

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isGenerating) return;

    setInputText('');
    setVoiceError(null);

    // Create user message
    const userMsgId = `msg-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessageToCurrentConversation(userMessage);

    // Prepare generation
    setIsGenerating(true);
    setStreamBuffer('');
    const assistantMsgId = `msg-reply-${Date.now()}`;

    // Add placeholder streaming message
    const placeholderMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      modelUsed: activeModel ? activeModel.displayName : 'Intelligent Router Auto-Select',
      providerUsed: activeModel ? activeModel.provider : 'LocalRuleEngine',
    };
    addMessageToCurrentConversation(placeholderMsg);

    try {
      abortControllerRef.current = new AbortController();

      // Call Model Router
      const result = await executeRoutedAIRequest({
        userPrompt: prompt,
        preferredLanguage: globalLanguage.code,
        preferredModelId: selectedModelId,
        operationalContext: {
          facilities,
          inventory,
          beds,
          doctors,
          transfers,
          alerts,
          atRiskFacilities,
        },
        providers,
        availableModels: aiModels,
      });

      // Stream the response out smoothly for realistic experience
      const fullText = result.text;
      let currentIdx = 0;
      const chunkSize = Math.max(4, Math.floor(fullText.length / 30));

      const streamTimer = setInterval(() => {
        currentIdx += chunkSize;
        if (currentIdx >= fullText.length) {
          clearInterval(streamTimer);
          setIsGenerating(false);
          updateMessageInCurrentConversation(assistantMsgId, {
            content: fullText,
            isStreaming: false,
            modelUsed: result.modelUsed.displayName,
            providerUsed: result.providerUsed,
            latencyMs: result.latencyMs,
            groundedSources: result.groundedSources,
          });
        } else {
          updateMessageInCurrentConversation(assistantMsgId, {
            content: fullText.slice(0, currentIdx),
          });
        }
      }, 25);
    } catch (err: any) {
      setIsGenerating(false);
      updateMessageInCurrentConversation(assistantMsgId, {
        content: `Error routing request: ${err?.message || 'Model service temporarily unreachable. Switched to offline clinical telemetry.'}`,
        isStreaming: false,
        error: String(err),
      });
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  // Retry Response
  const handleRetry = (lastMsgIndex: number) => {
    const prevMessages = activeConversation.messages;
    const userMessage = prevMessages[lastMsgIndex - 1];
    if (userMessage && userMessage.role === 'user') {
      handleSendMessage(userMessage.content);
    }
  };

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice: Speech-to-Text
  const handleToggleListening = () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    const started = voiceAssistant.startListening(
      globalLanguage.code,
      (res) => {
        setInputText(res.transcript);
        if (res.isFinal) {
          setIsListening(false);
        }
      },
      (err) => {
        setVoiceError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (started) {
      setIsListening(true);
    }
  };

  // Voice: Text-to-Speech
  const handleSpeak = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      voiceAssistant.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    const success = voiceAssistant.speak(
      text,
      globalLanguage.code,
      speechRate,
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );

    if (!success) {
      setSpeakingMessageId(null);
    }
  };

  return (
    <div
      className={`h-[calc(100vh-5.5rem)] flex bg-slate-50 text-slate-800 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm transition-all ${
        isHighContrast ? 'contrast-125 saturate-150' : ''
      }`}
      dir={globalLanguage.direction}
    >
      {/* ================= LEFT CONVERSATION SIDEBAR ================= */}
      <div className="w-72 bg-white border-r border-slate-200/80 flex flex-col shrink-0 hidden md:flex">
        {/* New Chat Button & Search */}
        <div className="p-3 border-b border-slate-100 space-y-2">
          <button
            onClick={() => createNewConversation(globalLanguage.code, selectedModelId)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{globalLanguage.code === 'mr' ? 'नवीन सल्लामसलत' : globalLanguage.code === 'hi' ? 'नया परामर्श' : 'New Consultation'}</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchConvoQuery}
              onChange={(e) => setSearchConvoQuery(e.target.value)}
              placeholder={globalLanguage.code === 'mr' ? 'संभाषण इतिहास शोधा...' : globalLanguage.code === 'hi' ? 'परामर्श इतिहास खोजें...' : 'Search chat history...'}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {globalLanguage.code === 'mr' ? 'अलिकडील संभाषणे' : globalLanguage.code === 'hi' ? 'हालिया परामर्श' : 'Recent Consultations'} ({filteredConversations.length})
          </div>

          {filteredConversations.map((convo) => {
            const isActive = convo.id === activeConversation.id;
            return (
              <div
                key={convo.id}
                onClick={() => setCurrentConversationId(convo.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/70 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex-1 truncate pr-2">
                  <div className="truncate">{convo.title}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {convo.messages.length} messages • {new Date(convo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(convo.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-md transition"
                    title="Delete consultation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Free Models Count & Provider Status */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified Free Models
            </span>
            <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {aiModels.filter((m) => m.isFreeOnlyEligible).length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('model-hub')}
            className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-teal-300 cursor-pointer transition text-xs font-medium text-slate-700"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>AI Model Hub</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ================= RIGHT MAIN CHAT PANE ================= */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Header Bar */}
        <div className="px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 bg-white z-10">
          {/* Identity & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  MediGrid Intelligence
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Grounded RAG
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Healthcare Intelligence Without Language Barriers
              </p>
            </div>
          </div>

          {/* Controls: Model Selector, Global Language, Clear */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Model Selector Dropdown */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Cpu className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer max-w-[190px] truncate"
              >
                <option value="auto">Auto-Router (Best Free Model)</option>
                {aiModels
                  .filter((m) => m.isFreeOnlyEligible)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName} ({m.provider})
                    </option>
                  ))}
              </select>
            </div>

            {/* Global Language Selector Button */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer"
              title="Change Global Interface & AI Response Language"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{globalLanguage.nativeName} ({globalLanguage.name})</span>
              {globalLanguage.direction === 'rtl' && (
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">RTL</span>
              )}
            </button>

            {/* Clear Conversation */}
            <button
              onClick={() => {
                if (window.confirm('Clear all messages in this consultation?')) {
                  clearCurrentConversation();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Clear messages"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Translation & Clinical Disclaimer Bar */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-1.5 text-[11px] text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Clinical Guardrail:</strong> Operating on authorized Pune Rural District telemetry. Machine translations preserve medicine names and dosages strictly. For emergency patient triage, consult local MO directly.
            </span>
          </div>
          <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">
            Non-inventive Grounding Enabled
          </span>
        </div>

        {/* Chat Message Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {/* Welcome Card if chat is empty */}
          {activeConversation.messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  Welcome to MediGrid Intelligence
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Ask clinical resource questions, detect medicine stockouts, calculate transfer redistribution, or check bed and doctor telemetry.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                {suggestedPrompts.slice(0, 4).map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sp.prompt)}
                    className="p-3 bg-white rounded-xl border border-slate-200/90 hover:border-teal-300 hover:shadow-xs transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 group-hover:text-teal-700 transition">
                        {sp.title}
                      </span>
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md font-medium">
                        {sp.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{sp.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {activeConversation.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isAssistant = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                    isUser
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-br from-teal-600 to-emerald-600'
                  }`}
                >
                  {isUser ? <span className="text-xs font-bold">You</span> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col gap-1.5 max-w-[85%] rounded-2xl p-4 text-xs shadow-2xs ${
                    isUser
                      ? 'bg-slate-800 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 gap-2 mb-0.5">
                    <span className="font-semibold text-slate-500">
                      {isUser ? 'Operator Request' : 'MediGrid Intelligence'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Text with basic markdown rendering */}
                  <div className="leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-teal-600 animate-pulse align-middle"></span>
                    )}
                  </div>

                  {/* Grounded RAG Sources Accordion */}
                  {msg.groundedSources && msg.groundedSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Verified Operational Telemetry Sources Cited:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {msg.groundedSources.map((src, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80"
                          >
                            • {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Footer: Model disclosure badge & Action buttons */}
                  {isAssistant && !msg.isStreaming && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600">
                          Powered by MediGrid Intelligence
                        </span>
                        {msg.modelUsed && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] border border-slate-200">
                            {msg.modelUsed} ({msg.providerUsed})
                          </span>
                        )}
                        {msg.latencyMs && (
                          <span className="text-slate-400">
                            • {msg.latencyMs}ms
                          </span>
                        )}
                      </div>

                      {/* Controls: Speak, Copy, Like, Retry */}
                      <div className="flex items-center gap-1">
                        {/* Text to Speech Button */}
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={`p-1.5 rounded-md hover:bg-slate-100 transition ${
                            speakingMessageId === msg.id ? 'text-teal-600 font-bold bg-teal-50' : 'text-slate-500'
                          }`}
                          title="Read aloud"
                        >
                          {speakingMessageId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Thumbs up / Feedback */}
                        <button
                          onClick={() =>
                            updateMessageInCurrentConversation(msg.id, {
                              liked: !msg.liked,
                            })
                          }
                          className={`p-1.5 rounded-md transition ${
                            msg.liked
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title="Mark helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Retry Button */}
                        <button
                          onClick={() => handleRetry(index)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                          title="Regenerate with failover"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pill Carousel */}
        {activeConversation.messages.length > 0 && !isGenerating && (
          <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Suggested:
            </span>
            {suggestedPrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sp.prompt)}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200/80 hover:border-teal-300 rounded-full text-slate-600 transition cursor-pointer"
              >
                {sp.title}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar & Controls */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2">
          {voiceError && (
            <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
              <span>{voiceError}</span>
              <button onClick={() => setVoiceError(null)} className="text-red-500 hover:text-red-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/20 rounded-2xl p-2 transition">
            {/* Microphone Voice STT Button */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-xs'
                  : 'text-slate-500 hover:text-teal-700 hover:bg-slate-200/60'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak via microphone (Speech-to-Text)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask MediGrid in ${globalLanguage.nativeName} or English... (Enter to send, Shift+Enter for new line)`}
              className="flex-1 max-h-36 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none py-1.5"
            />

            {/* Stop Generation or Send Button */}
            {isGenerating ? (
              <button
                onClick={handleStopGeneration}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3"
                title="Stop response generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                  inputText.trim()
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>
              Autonomous Multi-Model Routing • Zero paid API required • Offline Local Engine guaranteed
            </span>
            <span>
              TTS Speed:{' '}
              <button
                onClick={() => setSpeechRate((r) => (r === 1.0 ? 1.25 : r === 1.25 ? 0.8 : 1.0))}
                className="hover:text-teal-700 underline font-medium"
              >
                {speechRate}x
              </button>
            </span>
          </div>
        </div>
      </div>

      {/* ================= GLOBAL MULTILINGUAL SELECTOR MODAL ================= */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600" />
                  Select Global Language ({globalLanguages.length} Languages Cataloged)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Comprehensive worldwide living languages with Unicode, RTL scripts, and voice synthesis support.
                </p>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Region Filter Bar */}
            <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50/70">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  placeholder="Search language name, native script, ISO code, or country..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto text-xs">
                {['ALL', 'India', 'MiddleEast', 'Global'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setFilterLangContinent(reg)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      filterLangContinent === reg
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {reg === 'MiddleEast' ? 'Middle East (RTL)' : reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredLanguages.map((lang) => {
                const isSelected = lang.code === globalLanguage.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => {
                      setGlobalLanguage(lang);
                      setShowLanguageModal(false);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 shadow-2xs'
                        : 'border-slate-200/90 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{lang.name}</div>
                        <div className="text-sm font-semibold text-teal-700">{lang.nativeName}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {lang.code}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{lang.region}</span>
                      <div className="flex items-center gap-1">
                        {lang.direction === 'rtl' && (
                          <span className="px-1 bg-amber-100 text-amber-800 rounded font-bold">RTL</span>
                        )}
                        {lang.speechOutputSupported && (
                          <span title="Voice TTS supported">🔊</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Selected: <strong>{globalLanguage.name}</strong> ({globalLanguage.direction.toUpperCase()} layout)</span>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
