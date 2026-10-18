import React from 'react';
import {
  Building2,
  AlertTriangle,
  Pill,
  Users,
  Bed,
  Stethoscope,
  FlaskConical,
  ArrowRightLeft,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n';
import { FacilityMap } from '../components/FacilityMap';

export const DistrictDashboard: React.FC = () => {
  const {
    facilities,
    inventory,
    footfalls,
    beds,
    doctors,
    diagnostics,
    transfers,
    atRiskFacilities,
    language,
    setActiveTab,
    setSelectedFacilityId,
  } = useApp();

  const t = getTranslation(language);

  // Computed Metrics
  const totalFacilities = facilities.length;
  const requiringIntervention = atRiskFacilities.filter(
    (f) => f.riskSeverity === 'CRITICAL' || f.riskSeverity === 'HIGH'
  ).length;

  const criticalMedicines = inventory.filter(
    (i) => i.alertSeverity === 'CRITICAL' || i.alertSeverity === 'HIGH'
  ).length;

  const totalPatientsToday = footfalls.reduce((acc, f) => acc + f.totalPatients, 0);
  const totalBedsAvailable = beds.reduce((acc, b) => acc + b.availableBeds, 0);
  const totalBedsAll = beds.reduce((acc, b) => acc + b.totalBeds, 0);

  const totalScheduledDocs = doctors.reduce((acc, d) => acc + d.scheduledDoctors, 0);
  const totalPresentDocs = doctors.reduce((acc, d) => acc + d.presentDoctors, 0);
  const doctorAttendancePct =
    totalScheduledDocs > 0 ? Math.round((totalPresentDocs / totalScheduledDocs) * 1000) / 10 : 0;

  const unavailableTestsCount = diagnostics.filter(
    (d) => d.status === 'UNAVAILABLE' || d.status === 'CONSUMABLES_OUT' || d.status === 'MAINTENANCE'
  ).length;

  const pendingTransfersCount = transfers.filter(
    (t) => t.status === 'RECOMMENDED' || t.status === 'APPROVED'
  ).length;

  // Patient Footfall Trend Chart Data
  const footfallChartData = [
    { day: 'Mon', visits: 1240, emergency: 110, avgWait: 18 },
    { day: 'Tue', visits: 1080, emergency: 85, avgWait: 14 },
    { day: 'Wed', visits: 1150, emergency: 92, avgWait: 16 },
    { day: 'Thu', visits: 990, emergency: 74, avgWait: 12 },
    { day: 'Fri', visits: 1120, emergency: 88, avgWait: 15 },
    { day: 'Sat', visits: 1310, emergency: 125, avgWait: 22 },
    { day: 'Today (Sun)', visits: totalPatientsToday || 1285, emergency: 98, avgWait: 17 },
  ];

  // Medicine Stock vs Consumption Run-rate Chart Data
  const medicineStockData = inventory.slice(0, 7).map((item) => ({
    name: item.name.split(' ')[0],
    stock: item.usableStock,
    threshold: item.minimumThreshold,
    dailyUsage: item.averageDailyConsumption,
  }));

  // Bed Occupancy by Facility
  const bedOccupancyData = beds.slice(0, 6).map((b) => ({
    facility: b.facilityName.replace('PHC ', '').replace('CHC ', ''),
    occupied: b.occupiedBeds,
    available: b.availableBeds,
    rate: b.occupancyRate,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.dashboardTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.dashboardSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Telemetry Ingest Active
          </span>
          <button
            onClick={() => setActiveTab('redistribution')}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Smart Redistribution</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 lg:gap-4">
        {/* 1. Total Facilities */}
        <div
          onClick={() => setActiveTab('facilities')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.totalFacilities}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalFacilities}</span>
            <span className="text-[11px] text-teal-600 font-semibold">8 PHCs • 4 CHCs</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Pune Rural Directorate</p>
        </div>

        {/* 2. Facilities Requiring Intervention */}
        <div
          onClick={() => setActiveTab('at-risk')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.requiringIntervention}</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600">{requiringIntervention}</span>
            <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
              High Priority
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">PHC Paud & PHC Velhe</p>
        </div>

        {/* 3. Medicines At Risk */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.medicinesAtRisk}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{criticalMedicines}</span>
            <span className="text-[11px] text-amber-600 font-semibold">&lt; 72h supply</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">ORS, Amoxicillin, ARV</p>
        </div>

        {/* 4. Patients Today */}
        <div
          onClick={() => setActiveTab('footfall')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.totalPatientsToday}</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalPatientsToday.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-600 flex items-center font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +14%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Peak: 10:00 AM - 11:30 AM</p>
        </div>

        {/* 5. Available Beds */}
        <div
          onClick={() => setActiveTab('beds')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.availableBeds}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalBedsAvailable}</span>
            <span className="text-[11px] text-slate-500">/ {totalBedsAll} total</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {Math.round(((totalBedsAll - totalBedsAvailable) / totalBedsAll) * 100)}% district occupancy
          </p>
        </div>

        {/* 6. Doctor Attendance */}
        <div
          onClick={() => setActiveTab('doctors')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.doctorAttendance}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{doctorAttendancePct}%</span>
            <span className="text-[11px] text-slate-500 font-semibold">
              {totalPresentDocs}/{totalScheduledDocs}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600 font-medium">1 facility below minimum</p>
        </div>

        {/* 7. Unavailable Tests */}
        <div
          onClick={() => setActiveTab('diagnostics')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.unavailableTests}</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700">{unavailableTestsCount}</span>
            <span className="text-[11px] text-purple-600 font-medium">Kits exhausted</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Malaria & Dengue rapid kits</p>
        </div>

        {/* 8. Pending Transfers */}
        <div
          onClick={() => setActiveTab('redistribution')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group border-teal-200 bg-teal-50/20"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="text-teal-800 font-semibold">{t.pendingTransfers}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-800">{pendingTransfersCount}</span>
            <span className="text-[11px] text-teal-700 font-bold bg-teal-100 px-1.5 py-0.5 rounded">
              Ready to Dispatch
            </span>
          </div>
          <p className="mt-1 text-[11px] text-teal-600 font-medium">Surplus matching active</p>
        </div>
      </div>

      {/* Interactive Charts Section (Matching inspiration images) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Patient Footfall & Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">District Patient Footfall & Surge</h2>
              <p className="text-xs text-slate-500">Weekly patient visits across all 12 facilities</p>
            </div>
            <button
              onClick={() => setActiveTab('footfall')}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1"
            >
              <span>View Footfall</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={footfallChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                  name="Total Patients"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Medicine Inventory vs Threshold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Critical Medicine Stock vs Buffer</h2>
              <p className="text-xs text-slate-500">Current usable units vs required safety threshold</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1"
            >
              <span>View Inventory</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medicineStockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="stock" name="Current Usable Stock" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threshold" name="Safety Threshold" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* GIS Map & Bed Saturation Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive GIS Health Map */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">District Geospatial Telemetry & Transfer Routes</h2>
              <p className="text-xs text-slate-500">Live operational status and active redistribution transfers</p>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">12 Geo-Mapped Centres</span>
          </div>
          <div className="flex-1 min-h-[360px]">
            <FacilityMap
              facilities={facilities}
              transfers={transfers}
              onSelectFacility={(id) => {
                setSelectedFacilityId(id);
                setActiveTab('facilities');
              }}
              height="360px"
            />
          </div>
        </div>

        {/* Right: Bed Availability Progress Stack */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Bed Occupancy Status</h2>
              <button
                onClick={() => setActiveTab('beds')}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
              >
                Inspect All
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Real-time bed utilization across critical centres</p>

            <div className="space-y-3.5">
              {beds.slice(0, 5).map((bedRecord) => {
                const isOver = bedRecord.occupancyRate >= 95;
                const isNear = bedRecord.occupancyRate >= 80 && !isOver;

                return (
                  <div key={bedRecord.facilityId} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-800 truncate">{bedRecord.facilityName}</span>
                      <span
                        className={`font-semibold ${
                          isOver ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-slate-600'
                        }`}
                      >
                        {bedRecord.occupiedBeds}/{bedRecord.totalBeds} ({bedRecord.occupancyRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, bedRecord.occupancyRate)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Capacity Rule:</span> Facilities with &gt;90%
            occupancy are automatically flagged for elective referral rerouting.
          </div>
        </div>
      </div>

      {/* Facilities Operational Snapshot Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Facility Operational Telemetry Overview</h2>
            <p className="text-xs text-slate-500">Live summary across all 12 Primary and Community Health Centres</p>
          </div>
          <button
            onClick={() => setActiveTab('facilities')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Open Facility Directory</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Facility Name</th>
                <th className="py-3 px-4">Type & Block</th>
                <th className="py-3 px-4">Health Index</th>
                <th className="py-3 px-4">Bed Occupancy</th>
                <th className="py-3 px-4">Doctor Shift</th>
                <th className="py-3 px-4">Medicine Shortages</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilities.map((fac) => {
                const facInv = inventory.filter((i) => i.facilityId === fac.id);
                const shortages = facInv.filter(
                  (i) => i.alertSeverity === 'CRITICAL' || i.alertSeverity === 'HIGH'
                ).length;
                const facBed = beds.find((b) => b.facilityId === fac.id);
                const facDoc = doctors.find((d) => d.facilityId === fac.id);

                return (
                  <tr key={fac.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{fac.name}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{fac.type}</span>
                      <span className="text-slate-400"> • {fac.block}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-teal-700">
                      {fac.operationalScore}/100
                    </td>
                    <td className="py-3 px-4">
                      {facBed ? (
                        <span>
                          {facBed.occupiedBeds}/{facBed.totalBeds} ({facBed.occupancyRate}%)
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {facDoc ? (
                        <span className={facDoc.isStaffingDeficit ? 'text-amber-600 font-bold' : ''}>
                          {facDoc.presentDoctors}/{facDoc.scheduledDoctors} Present
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {shortages > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-[11px]">
                          {shortages} At Risk
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium text-[11px]">Buffer Safe</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fac.status === 'CRITICAL_INTERVENTION'
                            ? 'bg-red-100 text-red-700'
                            : fac.status === 'NEEDS_ATTENTION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {fac.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedFacilityId(fac.id);
                          setActiveTab('facilities');
                        }}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-900 transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
