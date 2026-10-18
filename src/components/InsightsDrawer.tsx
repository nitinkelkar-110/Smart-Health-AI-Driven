import React, { useState } from 'react';
import {
  Sparkles,
  X,
  AlertTriangle,
  ArrowRightLeft,
  Users,
  Send,
  Bed,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askMediGuide } from '../services/aiService';

export const InsightsDrawer: React.FC = () => {
  const {
    isInsightsOpen,
    setIsInsightsOpen,
    setActiveTab,
    inventory,
    doctors,
    beds,
    facilities,
    transfers,
    alerts,
    atRiskFacilities,
    language,
  } = useApp();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isInsightsOpen) return null;

  // Derive dynamic insights from live telemetry
  const criticalMeds = inventory.filter(
    (i) => i.alertSeverity === 'CRITICAL' || i.alertSeverity === 'HIGH'
  );
  const staffDeficits = doctors.filter((d) => d.isStaffingDeficit);
  const saturatedBeds = beds.filter((b) => b.occupancyRate >= 90);
  const pendingRecs = transfers.filter((t) => t.status === 'RECOMMENDED');

  const handleAsk = async (queryText?: string) => {
    const textToAsk = queryText || question;
    if (!textToAsk.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: textToAsk }]);
    setQuestion('');
    setIsLoading(true);

    try {
      const answer = await askMediGuide(
        textToAsk,
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
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error querying AI service. Please verify network or key.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shadow-lg z-30 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-slate-900">AI Operational Insights</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">
            Beta
          </span>
        </div>
        <button
          onClick={() => setIsInsightsOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          title="Close Insights Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Dynamic Card 1: Capacity & Stock Risk */}
        {criticalMeds.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-50/80 to-rose-50/40 border border-red-100 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                SHORTAGE RISK
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <p className="font-semibold text-slate-900">
              {criticalMeds[0].facilityName} projected to run out of{' '}
              <span className="text-red-700 underline">{criticalMeds[0].name}</span> within{' '}
              {criticalMeds[0].daysUntilStockOut} days.
            </p>
            <ul className="mt-2 space-y-1 text-slate-600 list-disc list-inside text-[11px]">
              <li>Daily usage: {criticalMeds[0].averageDailyConsumption} {criticalMeds[0].unit}/day</li>
              <li>Remaining usable stock: {criticalMeds[0].usableStock} {criticalMeds[0].unit}</li>
            </ul>
            <button
              onClick={() => setActiveTab('redistribution')}
              className="mt-3 text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group"
            >
              <span>View Redistribution Options</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        )}

        {/* Dynamic Card 2: Redistribution Opportunity */}
        {pendingRecs.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/80 to-emerald-50/40 border border-teal-100 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                REDISTRIBUTION OPPORTUNITY
              </span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <p className="font-semibold text-slate-900">
              Surplus of {pendingRecs[0].quantity} {pendingRecs[0].unit} {pendingRecs[0].medicineName}{' '}
              available at {pendingRecs[0].sourceFacilityName}.
            </p>
            <p className="mt-1 text-slate-600 text-[11px]">
              Can be safely transferred to {pendingRecs[0].destFacilityName} without violating
              donor minimum reserve (Distance: {pendingRecs[0].distanceKm} km, ETA: {pendingRecs[0].etaHours}h).
            </p>
            <button
              onClick={() => setActiveTab('redistribution')}
              className="mt-3 text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group"
            >
              <span>Review Transfer</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        )}

        {/* Dynamic Card 3: Staffing Deficit */}
        {staffDeficits.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                STAFFING DEFICIT
              </span>
              <Users className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="font-semibold text-slate-900">
              {staffDeficits[0].facilityName} reports only {staffDeficits[0].presentDoctors} of{' '}
              {staffDeficits[0].scheduledDoctors} doctors present.
            </p>
            <p className="mt-1 text-slate-600 text-[11px]">
              Clinic staffing is below the mandatory requirement ({staffDeficits[0].minimumRequired} doctors).
              Review roving doctor dispatch.
            </p>
            <button
              onClick={() => setActiveTab('doctors')}
              className="mt-3 text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 group"
            >
              <span>Analyze Staffing</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        )}

        {/* Dynamic Card 4: Bed Saturation */}
        {saturatedBeds.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/40 border border-purple-100 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                BED SATURATION
              </span>
              <Bed className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="font-semibold text-slate-900">
              {saturatedBeds[0].facilityName} is at {saturatedBeds[0].occupancyRate}% occupancy ({saturatedBeds[0].occupiedBeds}/{saturatedBeds[0].totalBeds} beds).
            </p>
            <p className="mt-1 text-slate-600 text-[11px]">
              Divert elective admissions to neighboring CHC Haveli or CHC Daund.
            </p>
            <button
              onClick={() => setActiveTab('beds')}
              className="mt-3 text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 group"
            >
              <span>Inspect Bed Roster</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        )}

        {/* Chat Messages if queried */}
        {messages.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Copilot Conversation
            </span>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-teal-50 text-teal-900 ml-4 font-medium'
                    : 'bg-slate-100 text-slate-800 mr-4'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs italic flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                Analyzing district telemetry...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mini Interactive Prompt Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        {/* Quick Suggestion Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleAsk('Which PHCs may run out of medicines this week?')}
            className="text-[10px] whitespace-nowrap bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-full hover:bg-teal-50 hover:text-teal-700 transition"
          >
            Medicine Shortages?
          </button>
          <button
            onClick={() => handleAsk('Which facilities currently report available beds?')}
            className="text-[10px] whitespace-nowrap bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-full hover:bg-teal-50 hover:text-teal-700 transition"
          >
            Available Beds?
          </button>
          <button
            onClick={() => handleAsk('Show facilities with staffing below their requirements.')}
            className="text-[10px] whitespace-nowrap bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-full hover:bg-teal-50 hover:text-teal-700 transition"
          >
            Doctor Attendance?
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition shadow-2xs"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask MediGuide about operations..."
            className="flex-1 text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="p-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          Verified against live district telemetry • Multilingual
        </p>
      </div>
    </aside>
  );
};
