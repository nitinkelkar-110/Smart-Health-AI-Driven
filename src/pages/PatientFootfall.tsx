import React, { useState } from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  Plus,
  Building2,
  Calendar,
  X,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const PatientFootfall: React.FC = () => {
  const { footfalls, facilities, recordFootfall, selectedFacilityId, setSelectedFacilityId } = useApp();

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [modalFacilityId, setModalFacilityId] = useState(facilities[0].id);
  const [opdCount, setOpdCount] = useState(140);
  const [ipdCount, setIpdCount] = useState(8);
  const [emergencyCount, setEmergencyCount] = useState(10);
  const [peakHour, setPeakHour] = useState('10:00 AM - 11:00 AM');

  // Filter footfalls
  const filteredFootfalls = footfalls.filter((f) => {
    return selectedFacilityId === 'ALL' || f.facilityId === selectedFacilityId;
  });

  const totalPatientsToday = filteredFootfalls.reduce((acc, f) => acc + f.totalPatients, 0);
  const totalOpd = filteredFootfalls.reduce((acc, f) => acc + f.opdCount, 0);
  const totalEmergency = filteredFootfalls.reduce((acc, f) => acc + f.emergencyCount, 0);
  const surgedFacilities = filteredFootfalls.filter((f) => f.warningFlag);

  // Hourly distribution aggregate (for primary selected or first record)
  const primaryRecord = filteredFootfalls[0] || footfalls[0];
  const hourlyData = primaryRecord?.hourlyDistribution || [];

  // Facility-wise comparison bar chart data
  const comparisonData = footfalls.map((f) => ({
    name: f.facilityName.replace('PHC ', '').replace('CHC ', ''),
    opd: f.opdCount,
    ipd: f.ipdCount,
    emergency: f.emergencyCount,
    capacity: f.normalCapacity,
  }));

  const handleSaveFootfall = (e: React.FormEvent) => {
    e.preventDefault();
    recordFootfall(modalFacilityId, opdCount, ipdCount, emergencyCount, peakHour);
    setShowRecordModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Footfall Monitoring</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracks operational visits, peak triage influx hours, and automated overcrowding alerts without storing PII.
          </p>
        </div>

        <button
          onClick={() => setShowRecordModal(true)}
          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Daily Census</span>
        </button>
      </div>

      {/* Overcrowding Alert Banner if active */}
      {surgedFacilities.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-amber-950 text-sm">Overcrowding Surge Warning</h2>
            <p className="mt-0.5 text-amber-800">
              {surgedFacilities.map((s) => s.warningReason).join(' • ')}
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              Recommended action: Review Medical Officer shifts and activate triage nurse buffer.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Patients Today</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {totalPatientsToday.toLocaleString()}
          </div>
          <span className="text-[11px] text-teal-600 font-medium">Recorded admissions & visits</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Outpatient (OPD) Visits</span>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">
            {totalOpd.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Primary consultations</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Emergency Influx</span>
          <div className="mt-2 text-2xl font-extrabold text-red-600">
            {totalEmergency.toLocaleString()}
          </div>
          <span className="text-[11px] text-red-500 font-medium">Triage required</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Peak Visiting Window</span>
          <div className="mt-2 text-lg font-extrabold text-indigo-700">
            {primaryRecord?.peakHour || '10:00 AM - 11:30 AM'}
          </div>
          <span className="text-[11px] text-slate-400">Highest physician demand</span>
        </div>
      </div>

      {/* Charts: Hourly Distribution & Facility Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Arrivals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Hourly Arrival Curve: {primaryRecord?.facilityName}
              </h2>
              <p className="text-xs text-slate-500">Arrival density per operational hour</p>
            </div>
            <span className="text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full font-bold">
              Peak: 10:00 AM
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" name="Patients Arrived" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility Load vs Design Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Facility Patient Load vs Capacity</h2>
              <p className="text-xs text-slate-500">Comparing total OPD visits against standard design capacity</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="opd" name="OPD Visits" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Design Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footfall Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Facility Census Logs</h2>
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
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">OPD</th>
                <th className="py-3 px-4">IPD</th>
                <th className="py-3 px-4">Emergency</th>
                <th className="py-3 px-4">Total Census</th>
                <th className="py-3 px-4">Surge vs Normal</th>
                <th className="py-3 px-4">Peak Window</th>
                <th className="py-3 px-4">Last Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFootfalls.map((f) => (
                <tr key={f.facilityId} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{f.facilityName}</td>
                  <td className="py-3 px-4">{f.date}</td>
                  <td className="py-3 px-4">{f.opdCount}</td>
                  <td className="py-3 px-4">{f.ipdCount}</td>
                  <td className="py-3 px-4">{f.emergencyCount}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{f.totalPatients}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        f.surgePercentage > 30
                          ? 'text-red-600'
                          : f.surgePercentage > 0
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {f.surgePercentage > 0 ? `+${f.surgePercentage}%` : `${f.surgePercentage}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{f.peakHour}</td>
                  <td className="py-3 px-4 text-slate-400">{f.lastReported}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Census Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveFootfall}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Patient Census</h3>
                <p className="text-xs text-slate-500">Authorized medical officer daily logging</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecordModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Health Facility</label>
                <select
                  value={modalFacilityId}
                  onChange={(e) => setModalFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">OPD Visits</label>
                  <input
                    type="number"
                    min="0"
                    value={opdCount}
                    onChange={(e) => setOpdCount(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Inpatient (IPD)</label>
                  <input
                    type="number"
                    min="0"
                    value={ipdCount}
                    onChange={(e) => setIpdCount(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Emergency</label>
                  <input
                    type="number"
                    min="0"
                    value={emergencyCount}
                    onChange={(e) => setEmergencyCount(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Observed Peak Hours</label>
                <input
                  type="text"
                  value={peakHour}
                  onChange={(e) => setPeakHour(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRecordModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Save & Update Surge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
