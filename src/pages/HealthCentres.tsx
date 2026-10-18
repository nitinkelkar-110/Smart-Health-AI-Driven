import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Phone,
  User,
  Users,
  Bed,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  X,
  Stethoscope,
  Pill,
  FlaskConical,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HealthFacility } from '../types';

export const HealthCentres: React.FC = () => {
  const {
    facilities,
    inventory,
    beds,
    doctors,
    diagnostics,
    selectedFacilityId,
    setSelectedFacilityId,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PHC' | 'CHC'>('ALL');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');
  const [inspectedFacility, setInspectedFacility] = useState<HealthFacility | null>(() => {
    if (selectedFacilityId !== 'ALL') {
      return facilities.find((f) => f.id === selectedFacilityId) || null;
    }
    return null;
  });

  // Extract unique blocks
  const blocks = Array.from(new Set(facilities.map((f) => f.block)));

  // Filter facilities
  const filtered = facilities.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || fac.type === typeFilter;
    const matchesBlock = blockFilter === 'ALL' || fac.block === blockFilter;

    return matchesSearch && matchesType && matchesBlock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Health Centres Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comprehensive telemetry, capacity specifications, and clinical staff directory across 12 facilities.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility by name, block, or Medical Officer..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Type */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="PHC">Primary Health Centres (PHC)</option>
              <option value="CHC">Community Health Centres (CHC)</option>
            </select>
          </div>

          {/* Block Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Block:</span>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Blocks</option>
              {blocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((fac) => {
          const facBed = beds.find((b) => b.facilityId === fac.id);
          const facDoc = doctors.find((d) => d.facilityId === fac.id);
          const facInv = inventory.filter((i) => i.facilityId === fac.id);
          const shortageCount = facInv.filter(
            (i) => i.alertSeverity === 'CRITICAL' || i.alertSeverity === 'HIGH'
          ).length;

          return (
            <div
              key={fac.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fac.type === 'PHC'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {fac.type}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Block: <strong className="text-slate-700">{fac.block}</strong>
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-teal-700 transition-colors">
                      {fac.name}
                    </h2>
                  </div>

                  {/* Health Score Pill */}
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl inline-block ${
                        fac.operationalScore >= 80
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : fac.operationalScore >= 65
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {fac.operationalScore}/100
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Health Score</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="block text-[10px] text-slate-400">Total Beds</span>
                    <span className="text-xs font-bold text-slate-800">
                      {facBed ? `${facBed.occupiedBeds}/${facBed.totalBeds}` : fac.totalBeds}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="block text-[10px] text-slate-400">Doctor Shift</span>
                    <span
                      className={`text-xs font-bold ${
                        facDoc?.isStaffingDeficit ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {facDoc ? `${facDoc.presentDoctors}/${facDoc.scheduledDoctors}` : '-'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="block text-[10px] text-slate-400">Shortages</span>
                    <span
                      className={`text-xs font-bold ${
                        shortageCount > 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {shortageCount > 0 ? `${shortageCount} Critical` : '0 Safe'}
                    </span>
                  </div>
                </div>

                {/* Contact and Coverage Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{fac.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Population: {fac.populationServed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.operatingHours}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    fac.status === 'CRITICAL_INTERVENTION'
                      ? 'text-red-600'
                      : fac.status === 'NEEDS_ATTENTION'
                      ? 'text-amber-600'
                      : 'text-teal-700'
                  }`}
                >
                  {fac.status === 'CRITICAL_INTERVENTION' && <ShieldAlert className="w-3.5 h-3.5" />}
                  {fac.status === 'OPERATIONAL' && <CheckCircle className="w-3.5 h-3.5" />}
                  {fac.status.replace('_', ' ')}
                </span>

                <button
                  onClick={() => setInspectedFacility(fac)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:border-teal-300 transition flex items-center gap-1 shadow-2xs"
                >
                  <span>Detailed Telemetry</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Facility Inspection Modal */}
      {inspectedFacility && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {inspectedFacility.type}
                  </span>
                  <span className="text-xs text-slate-500">Block: {inspectedFacility.block}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{inspectedFacility.name}</h2>
                <p className="text-xs text-slate-500">
                  Coordinates: {inspectedFacility.lat}, {inspectedFacility.lng} • Serves{' '}
                  {inspectedFacility.populationServed.toLocaleString()} residents
                </p>
              </div>
              <button
                onClick={() => setInspectedFacility(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operational Health Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Health Index</span>
                <span className="text-base font-extrabold text-teal-700">
                  {inspectedFacility.operationalScore}/100
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Total Beds</span>
                <span className="text-base font-extrabold text-slate-800">
                  {inspectedFacility.totalBeds}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Contact Doctor</span>
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  {inspectedFacility.contactPerson}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Facility Status</span>
                <span
                  className={`text-xs font-bold ${
                    inspectedFacility.status === 'CRITICAL_INTERVENTION'
                      ? 'text-red-600'
                      : inspectedFacility.status === 'NEEDS_ATTENTION'
                      ? 'text-amber-600'
                      : 'text-teal-700'
                  }`}
                >
                  {inspectedFacility.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Medicine Inventory at this facility */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Medicine Inventory Telemetry</span>
              </h3>
              <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Medicine</th>
                      <th className="py-2 px-3">Stock</th>
                      <th className="py-2 px-3">Daily Run-rate</th>
                      <th className="py-2 px-3">Days Left</th>
                      <th className="py-2 px-3">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory
                      .filter((i) => i.facilityId === inspectedFacility.id)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-white transition">
                          <td className="py-2 px-3 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-2 px-3">
                            {item.usableStock} {item.unit}
                          </td>
                          <td className="py-2 px-3">{item.averageDailyConsumption}/day</td>
                          <td className="py-2 px-3 font-bold">
                            <span
                              className={
                                item.daysUntilStockOut <= 3
                                  ? 'text-red-600'
                                  : item.daysUntilStockOut <= 7
                                  ? 'text-amber-600'
                                  : 'text-slate-700'
                              }
                            >
                              {item.daysUntilStockOut} days
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                item.alertSeverity === 'CRITICAL'
                                  ? 'bg-red-100 text-red-700'
                                  : item.alertSeverity === 'HIGH'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {item.alertSeverity}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedFacilityId(inspectedFacility.id);
                  setActiveTab('inventory');
                  setInspectedFacility(null);
                }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Filter Inventory for this Facility &rarr;</span>
              </button>
              <button
                onClick={() => setInspectedFacility(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
