import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  ArrowRight,
  Building2,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DiagnosticTestRecord, DiagnosticTestStatus } from '../types';

export const DiagnosticTestAudit: React.FC = () => {
  const { diagnostics, facilities, updateDiagnosticStatus, selectedFacilityId, setSelectedFacilityId } =
    useApp();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<DiagnosticTestRecord | null>(null);
  const [statusVal, setStatusVal] = useState<DiagnosticTestStatus>('AVAILABLE');
  const [reagentVal, setReagentVal] = useState<DiagnosticTestRecord['reagentStatus']>('Adequate');

  const filteredDiagnostics = diagnostics.filter(
    (d) => selectedFacilityId === 'ALL' || d.facilityId === selectedFacilityId
  );

  const totalTests = filteredDiagnostics.length;
  const availableCount = filteredDiagnostics.filter((d) => d.status === 'AVAILABLE').length;
  const offlineCount = filteredDiagnostics.filter(
    (d) => d.status === 'UNAVAILABLE' || d.status === 'CONSUMABLES_OUT' || d.status === 'MAINTENANCE'
  ).length;

  const handleOpenUpdate = (test: DiagnosticTestRecord) => {
    setSelectedTest(test);
    setStatusVal(test.status);
    setReagentVal(test.reagentStatus);
    setShowUpdateModal(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    updateDiagnosticStatus(selectedTest.id, statusVal, reagentVal);
    setShowUpdateModal(false);
  };

  const getStatusBadge = (status: DiagnosticTestStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'LIMITED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONSUMABLES_OUT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MAINTENANCE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'UNAVAILABLE':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Diagnostic Test Availability Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracks essential point-of-care laboratory tests, reagent reserves, and automated alternate facility routing.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Essential Diagnostics</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalTests}</div>
          <span className="text-[11px] text-slate-400">Services audited</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Fully Operational</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{availableCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Reagents & equipment ready</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tests Offline / Stalled</span>
          <div className="mt-2 text-2xl font-extrabold text-red-600">{offlineCount}</div>
          <span className="text-[11px] text-red-500 font-medium">Rerouting required</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average Tests Per Day</span>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">
            {filteredDiagnostics.reduce((acc, d) => acc + d.dailyTestsDone, 0)}
          </div>
          <span className="text-[11px] text-slate-400">Total lab patient volume</span>
        </div>
      </div>

      {/* Diagnostic Service Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Diagnostic Service Availability Matrix</h2>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Facilities</option>
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Test Name & Category</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reagents</th>
                <th className="py-3 px-4">Equipment Status</th>
                <th className="py-3 px-4">Daily Volume</th>
                <th className="py-3 px-4">Alternate Facility Reroute</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiagnostics.map((test) => {
                const isOffline =
                  test.status === 'CONSUMABLES_OUT' ||
                  test.status === 'MAINTENANCE' ||
                  test.status === 'UNAVAILABLE';

                return (
                  <tr
                    key={test.id}
                    className={`hover:bg-slate-50 transition ${isOffline ? 'bg-red-50/20' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{test.name}</span>
                      <span className="text-[10px] text-slate-400">{test.category}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">{test.facilityName}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          test.status
                        )}`}
                      >
                        {test.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          test.reagentStatus === 'Exhausted'
                            ? 'text-red-600 font-bold'
                            : test.reagentStatus === 'Critical Low'
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-700'
                        }`}
                      >
                        {test.reagentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">{test.equipmentStatus}</td>

                    <td className="py-3 px-4 font-bold text-slate-900">{test.dailyTestsDone}/day</td>

                    <td className="py-3 px-4">
                      {test.alternativeFacilities && test.alternativeFacilities.length > 0 ? (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-teal-700">
                            {test.alternativeFacilities[0].facilityName}
                          </span>{' '}
                          <span className="text-slate-400">
                            ({test.alternativeFacilities[0].distanceKm} km away)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenUpdate(test)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition text-[11px]"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Diagnostic Status Modal */}
      {showUpdateModal && selectedTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveStatus}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Diagnostic Service Status</h3>
                <p className="text-xs text-slate-500">{selectedTest.name} • {selectedTest.facilityName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Service Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as DiagnosticTestStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="AVAILABLE">Available (Fully Operational)</option>
                  <option value="LIMITED">Limited Availability</option>
                  <option value="CONSUMABLES_OUT">Consumables / Reagents Unavailable</option>
                  <option value="MAINTENANCE">Equipment Maintenance</option>
                  <option value="UNAVAILABLE">Temporarily Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Reagent Buffer Status</label>
                <select
                  value={reagentVal}
                  onChange={(e) => setReagentVal(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="Adequate">Adequate Buffer</option>
                  <option value="Critical Low">Critical Low (Reorder Needed)</option>
                  <option value="Exhausted">Exhausted (Stock-Out)</option>
                  <option value="N/A">Not Applicable</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Save & Update Matrix
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
