import React, { useState } from 'react';
import {
  Bed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Building2,
  X,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BedAvailabilityRecord } from '../types';

export const BedAvailability: React.FC = () => {
  const { beds, facilities, updateBedRecord, selectedFacilityId, setSelectedFacilityId } = useApp();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBedRecord, setSelectedBedRecord] = useState<BedAvailabilityRecord | null>(null);

  // Form State
  const [formOccupied, setFormOccupied] = useState<number>(0);
  const [formUnavailable, setFormUnavailable] = useState<number>(0);
  const [formGeneral, setFormGeneral] = useState<number>(0);
  const [formMaternity, setFormMaternity] = useState<number>(0);
  const [formPediatric, setFormPediatric] = useState<number>(0);
  const [formEmergency, setFormEmergency] = useState<number>(0);

  // Filter
  const filteredBeds = beds.filter(
    (b) => selectedFacilityId === 'ALL' || b.facilityId === selectedFacilityId
  );

  const totalBeds = filteredBeds.reduce((acc, b) => acc + b.totalBeds, 0);
  const totalOccupied = filteredBeds.reduce((acc, b) => acc + b.occupiedBeds, 0);
  const totalAvailable = filteredBeds.reduce((acc, b) => acc + b.availableBeds, 0);
  const totalUnavailable = filteredBeds.reduce((acc, b) => acc + b.unavailableBeds, 0);
  const districtOccupancyRate =
    totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 1000) / 10 : 0;

  const handleOpenEdit = (record: BedAvailabilityRecord) => {
    setSelectedBedRecord(record);
    setFormOccupied(record.occupiedBeds);
    setFormUnavailable(record.unavailableBeds);
    setFormGeneral(record.specialtyBeds.general);
    setFormMaternity(record.specialtyBeds.maternity);
    setFormPediatric(record.specialtyBeds.pediatric);
    setFormEmergency(record.specialtyBeds.emergency);
    setShowEditModal(true);
  };

  const handleSaveBedRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedRecord) return;

    updateBedRecord(selectedBedRecord.facilityId, formOccupied, formUnavailable, {
      general: formGeneral,
      maternity: formMaternity,
      pediatric: formPediatric,
      emergency: formEmergency,
    });

    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bed Availability Monitoring</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time inpatient, maternity, and emergency bed census with verified timestamp tracking.
          </p>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl text-slate-600 text-xs self-start sm:self-auto">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Informational only • Does not make automated clinical transfer decisions.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total District Beds</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalBeds}</div>
          <span className="text-[11px] text-slate-400">Configured inpatient capacity</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Available Beds</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{totalAvailable}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Ready for admission</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Occupied Beds</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-700">{totalOccupied}</div>
          <span className="text-[11px] text-slate-400">Current active inpatients</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">District Occupancy Rate</span>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              districtOccupancyRate >= 90
                ? 'text-red-600'
                : districtOccupancyRate >= 80
                ? 'text-amber-600'
                : 'text-teal-700'
            }`}
          >
            {districtOccupancyRate}%
          </div>
          <span className="text-[11px] text-slate-400">
            {totalUnavailable} temporarily under sanitation
          </span>
        </div>
      </div>

      {/* Bed Cards Grid by Facility */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBeds.map((record) => {
          const isOvercrowded = record.occupancyRate >= 100;
          const isNearCapacity = record.occupancyRate >= 85 && !isOvercrowded;

          return (
            <div
              key={record.facilityId}
              className={`bg-white rounded-2xl border transition-all shadow-2xs p-5 flex flex-col justify-between ${
                isOvercrowded
                  ? 'border-red-300 ring-1 ring-red-200'
                  : isNearCapacity
                  ? 'border-amber-300'
                  : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{record.facilityName}</h2>
                    <span className="text-xs text-slate-400">Verified by {record.verifiedBy}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOvercrowded
                        ? 'bg-red-100 text-red-700'
                        : isNearCapacity
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {record.occupancyStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Occupancy Big Meter */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Bed Occupancy:</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {record.occupiedBeds} / {record.totalBeds} ({record.occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOvercrowded ? 'bg-red-500' : isNearCapacity ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${Math.min(100, record.occupancyRate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Available & Unavailable counters */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl">
                    <span className="text-[10px] block font-medium">Available Now</span>
                    <span className="text-base font-bold">{record.availableBeds} Beds</span>
                  </div>
                  <div className="bg-slate-50 text-slate-600 p-2 rounded-xl">
                    <span className="text-[10px] block font-medium">Under Cleaning</span>
                    <span className="text-base font-bold">{record.unavailableBeds} Beds</span>
                  </div>
                </div>

                {/* Specialty Bed Breakdown */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">General Ward:</span>
                    <span className="font-semibold text-slate-800">{record.specialtyBeds.general}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Maternity & Delivery:</span>
                    <span className="font-semibold text-slate-800">{record.specialtyBeds.maternity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pediatric Care:</span>
                    <span className="font-semibold text-slate-800">{record.specialtyBeds.pediatric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency & Triage:</span>
                    <span className="font-semibold text-slate-800">{record.specialtyBeds.emergency}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {record.lastVerified}
                </span>

                <button
                  onClick={() => handleOpenEdit(record)}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition"
                >
                  Update Census
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Bed Census Modal */}
      {showEditModal && selectedBedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveBedRecord}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Bed Census</h3>
                <p className="text-xs text-slate-500">{selectedBedRecord.facilityName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Occupied Beds (Max {selectedBedRecord.totalBeds})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedBedRecord.totalBeds}
                    value={formOccupied}
                    onChange={(e) => setFormOccupied(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Under Maintenance</label>
                  <input
                    type="number"
                    min="0"
                    value={formUnavailable}
                    onChange={(e) => setFormUnavailable(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="block font-semibold text-slate-700 mb-2">Specialty Breakdown</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500">General</label>
                    <input
                      type="number"
                      min="0"
                      value={formGeneral}
                      onChange={(e) => setFormGeneral(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Maternity</label>
                    <input
                      type="number"
                      min="0"
                      value={formMaternity}
                      onChange={(e) => setFormMaternity(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Pediatric</label>
                    <input
                      type="number"
                      min="0"
                      value={formPediatric}
                      onChange={(e) => setFormPediatric(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Emergency</label>
                    <input
                      type="number"
                      min="0"
                      value={formEmergency}
                      onChange={(e) => setFormEmergency(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Save Census
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
