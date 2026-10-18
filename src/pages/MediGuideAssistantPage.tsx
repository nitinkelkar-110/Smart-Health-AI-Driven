import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Globe,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askMediGuide } from '../services/aiService';
import { LanguageCode } from '../types';

export const MediGuideAssistantPage: React.FC = () => {
  const {
    facilities,
    inventory,
    beds,
    doctors,
    transfers,
    alerts,
    atRiskFacilities,
    language,
    setLanguage,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; timestamp: string }[]
  >([
    {
      role: 'assistant',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं मेडिगाइड (MediGuide AI) हूँ। मैं जिले के सभी १२ स्वास्थ्य केंद्रों की वास्तविक स्थिति, दवाइयों की कमी, बिस्तर उपलब्धता और डॉक्टर उपस्थिति का विश्लेषण कर सकता हूँ। नीचे दिए गए सुझाए गए प्रश्नों पर क्लिक करें या अपना प्रश्न लिखें।'
          : language === 'mr'
          ? 'नमस्कार! मी मेडिगाईड (MediGuide AI) आहे. मी जिल्ह्यातील १२ प्राथमिक व ग्रामीण आरोग्य केंद्रांची थेट माहिती, औषध तुटवडा, खाटा उपलब्धता व डॉक्टर उपस्थिती विश्लेषित करू शकतो.'
          : 'Hello! I am MediGuide AI, your district health operations copilot. I analyze live telemetry, demand forecasts, bed occupancy, and smart redistribution transfers across all 12 PHCs & CHCs in the district. Ask me any operational query below or select a suggested prompt.',
      timestamp: 'Just now',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [
          {
            role: 'assistant',
            text:
              language === 'hi'
                ? 'नमस्ते! मैं मेडिगाइड (MediGuide AI) हूँ। मैं जिले के सभी १२ स्वास्थ्य केंद्रों की वास्तविक स्थिति, दवाइयों की कमी, बिस्तर उपलब्धता और डॉक्टर उपस्थिति का विश्लेषण कर सकता हूँ। नीचे दिए गए सुझाए गए प्रश्नों पर क्लिक करें या अपना प्रश्न लिखें।'
                : language === 'mr'
                ? 'नमस्कार! मी मेडिगाईड (MediGuide AI) आहे. मी जिल्ह्यातील १२ प्राथमिक व ग्रामीण आरोग्य केंद्रांची थेट माहिती, औषध तुटवडा, खाटा उपलब्धता व डॉक्टर उपस्थिती विश्लेषित करू शकतो.'
                : 'Hello! I am MediGuide AI, your district health operations copilot. I analyze live telemetry, demand forecasts, bed occupancy, and smart redistribution transfers across all 12 PHCs & CHCs in the district. Ask me any operational query below or select a suggested prompt.',
            timestamp: 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [language]);

  const suggestedPrompts = [
    {
      en: 'Which PHCs may run out of medicines this week?',
      hi: 'इस जिले में किन स्वास्थ्य केंद्रों में दवाइयों की कमी है?',
      mr: 'या आठवड्यात कोणत्या केंद्रात औषध तुटवडा आहे?',
    },
    {
      en: 'Which facilities currently report available beds?',
      hi: 'कौन से स्वास्थ्य केंद्रों में बिस्तर उपलब्ध हैं?',
      mr: 'कोणत्या केंद्रात खाटा उपलब्ध आहेत?',
    },
    {
      en: 'Show facilities with staffing below their requirements.',
      hi: 'स्टाफिंग कमी वाले स्वास्थ्य केंद्र दिखाएं।',
      mr: 'डॉक्टर तुटवडा असलेली केंद्रे दाखवा.',
    },
    {
      en: 'Summarize all critical alerts across the district.',
      hi: 'जिले के सभी गंभीर अलर्ट का सारांश दें।',
      mr: 'जिल्ह्यातील सर्व गंभीर अलर्ट्सचा सारांश द्या.',
    },
    {
      en: 'Which centres have unused medicine inventory?',
      hi: 'किन केंद्रों में अतिरिक्त अधिशेष दवाएं हैं?',
      mr: 'कोणत्या केंद्रात अतिरिक्त साठा उपलब्ध आहे?',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userEntry = {
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askMediGuide(
        query,
        {
          facilities,
          inventory,
          beds,
          doctors,
          transfers,
          alerts,
          atRiskFacilities,
        },
        language
      );

      const assistantEntry = {
        role: 'assistant' as const,
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantEntry]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          text: 'Error processing question. Please check telemetry feeds.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              MediGuide Multilingual AI Copilot
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Grounding on Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Multilingual operational reasoning answering inventory, bed occupancy, and redistribution logistics queries in English, Hindi, and Marathi.
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <Globe className="w-4 h-4 text-slate-400 ml-1.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              language === 'en' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              language === 'hi' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              language === 'mr' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Recommended Live Telemetry Inquiries (1-Click Query):</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p, idx) => {
            const promptText = (p as Record<string, string>)[language] || p.en;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-200 transition text-xs font-medium shadow-2xs text-left"
              >
                &ldquo;{promptText}&rdquo;
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={index}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-2xs space-y-1 relative group ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-xs font-medium'
                      : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs sm:text-sm">{msg.text}</div>
                  <div
                    className={`text-[10px] mt-2 flex items-center justify-between gap-4 ${
                      isUser ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        className="opacity-0 group-hover:opacity-100 transition hover:text-slate-600 flex items-center gap-1"
                        title="Copy Response"
                      >
                        {copiedIdx === index ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></span>
                <span>Synthesizing multi-facility telemetry & logistics records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'मेडिगाइड से जिला स्वास्थ्य संचालन, दवाओं की कमी या बिस्तरों के बारे में पूछें...'
                  : language === 'mr'
                  ? 'मेडिगाईडला आरोग्य संचलन किंवा तुटवड्याबद्दल प्रश्न विचारा...'
                  : 'Ask MediGuide about shortages, doctor attendance, available beds, or transfers...'
              }
              className="flex-1 text-xs sm:text-sm bg-transparent focus:outline-hidden text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition disabled:opacity-40 flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Powered by MediGrid Operational Reasoning Engine</span>
            <button
              onClick={() =>
                setMessages([
                  {
                    role: 'assistant',
                    text: 'Conversation cleared. How can I assist with district health operations?',
                    timestamp: 'Just now',
                  },
                ])
              }
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
