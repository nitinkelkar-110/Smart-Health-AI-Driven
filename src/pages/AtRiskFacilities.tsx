import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  User,
  X,
  FileCheck2,
  Pill,
  Stethoscope,
  Bed,
  FlaskConical,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AtRiskFacility } from '../types';

export const AtRiskFacilities: React.FC = () => {
  const {
    atRiskFacilities,
    assignInterventionOfficer,
    resolveInterventionAction,
    setActiveTab,
    setSelectedFacilityId,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedFacility, setSelectedFacility] = useState<AtRiskFacility | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [officerName, setOfficerName] = useState('Dr. S. Kulkarni (Dy. DHO)');
  const [interventionNotes, setInterventionNotes] = useState('');

  const filtered = atRiskFacilities.filter((f) => {
    if (severityFilter === 'ALL') return true;
    return f.riskSeverity === severityFilter;
  });

  const criticalCount = atRiskFacilities.filter((f) => f.riskSeverity === 'CRITICAL').length;
  const highCount = atRiskFacilities.filter((f) => f.riskSeverity === 'HIGH').length;

  const handleOpenAssign = (fac: AtRiskFacility) => {
    setSelectedFacility(fac);
    setOfficerName(fac.assignedOfficer || 'Dr. S. Kulkarni (Dy. DHO)');
    setInterventionNotes('Emergency clinical support team dispatched.');
    setShowAssignModal(true);
  };

  const handleOpenResolve = (fac: AtRiskFacility) => {
    setSelectedFacility(fac);
    setInterventionNotes('Medicine transferred, diagnostic reagent restocked, and mobile doctor deployed.');
    setShowResolveModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              At-Risk Facilities Detection
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
              Automated Multi-Factor Scoring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Synthesizes medicine stock, doctor rosters, bed saturation, and diagnostic availability into transparent intervention flags.
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${severityFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            All Flagged ({atRiskFacilities.length})
          </button>
          <button
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${severityFilter === 'CRITICAL'
                ? 'bg-red-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('HIGH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${severityFilter === 'HIGH'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            High Priority ({highCount})
          </button>
        </div>
      </div>

      {/* Flagged Facilities List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No health centres currently meet the risk threshold criteria.
          </div>
        ) : (
          filtered.map((item) => {
            const isCritical = item.riskSeverity === 'CRITICAL';
            const isResolved = item.status === 'RESOLVED';
            const isInProgress = item.status === 'IN_PROGRESS';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-2xs transition-all ${isCritical ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200/90'
                  }`}
              >
                {/* Top strip */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {item.compositeRiskScore}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-slate-900">{item.facilityName}</h2>
                        <span className="text-xs text-slate-400">({item.block} Block)</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Composite Operational Stress Index: <strong>{item.compositeRiskScore}/100</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isCritical
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {item.riskSeverity} PRIORITY
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Supporting Telemetry Snapshot Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Pill className="w-3.5 h-3.5" />
                      <span>Medicine Stockouts</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {item.operationalDataSnapshot.stockShortages} at risk
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Doctor Attendance</span>
                    </div>
                    <span
                      className={`font-bold text-sm ${item.operationalDataSnapshot.doctorDeficit ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                    >
                      {item.operationalDataSnapshot.doctorDeficit ? 'Deficit Active' : 'Adequate'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Bed className="w-3.5 h-3.5" />
                      <span>Bed Saturation</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {item.operationalDataSnapshot.bedOccupancy}% Occupied
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Diagnostic Tests</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {item.operationalDataSnapshot.unavailableTests} offline
                    </span>
                  </div>
                </div>

                {/* Triggering Conditions Box */}
                <div className="p-3 bg-red-50/40 rounded-xl border border-red-100 text-xs">
                  <span className="font-bold text-red-900 block mb-1">Active Risk Triggers:</span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside text-[11px]">
                    {item.triggers.map((trig, idx) => (
                      <li key={idx}>{trig}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Interventions Box */}
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs">
                  <span className="font-bold text-teal-900 block mb-1">
                    Recommended District Administrative Interventions:
                  </span>
                  <ol className="space-y-1 text-slate-700 list-decimal list-inside text-[11px]">
                    {item.recommendedInterventions.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ol>
                </div>

                {/* Footer Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    {item.assignedOfficer ? (
                      <span>
                        Assigned Officer: <strong>{item.assignedOfficer}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Awaiting Officer Assignment</span>
                    )}
                    <span className="text-slate-400"> • Last verified: {item.lastUpdated}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFacilityId(item.facilityId);
                        setActiveTab('redistribution');
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 border border-slate-200 transition"
                    >
                      Redistribution Options
                    </button>

                    {!isResolved && (
                      <button
                        onClick={() => handleOpenAssign(item)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold transition"
                      >
                        Assign Officer
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => handleOpenResolve(item)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve Intervention</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Officer Modal */}
      {showAssignModal && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign District Officer</h3>
                <p className="text-xs text-slate-500">{selectedFacility.facilityName}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Responsible Officer</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Administrative Directives</label>
                <textarea
                  rows={3}
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  assignInterventionOfficer(selectedFacility.facilityId, officerName, interventionNotes);
                  setShowAssignModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Intervention Modal */}
      {showResolveModal && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Mark Intervention Resolved</h3>
                <p className="text-xs text-slate-500">{selectedFacility.facilityName}</p>
              </div>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Confirming resolution documents remediation actions and restores facility status to Operational in the District Dashboard.
              </p>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Remediation Summary & Notes</label>
                <textarea
                  rows={3}
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolveInterventionAction(selectedFacility.facilityId, interventionNotes);
                  setShowResolveModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                Mark Resolved & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
