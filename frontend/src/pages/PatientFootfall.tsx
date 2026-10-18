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
  Search,
  UserCheck,
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  Filter,
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
import { TriagePriority, PatientVisitStatus } from '../types';

export const PatientFootfall: React.FC = () => {
  const {
    footfalls,
    facilities,
    recordFootfall,
    selectedFacilityId,
    setSelectedFacilityId,
    patients,
    registerPatient,
    updatePatientStatus,
    doctors,
  } = useApp();

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [modalFacilityId, setModalFacilityId] = useState(facilities[0]?.id || 'FAC-01');
  const [opdCount, setOpdCount] = useState(140);
  const [ipdCount, setIpdCount] = useState(8);
  const [emergencyCount, setEmergencyCount] = useState(10);
  const [peakHour, setPeakHour] = useState('10:00 AM - 11:00 AM');

  // Patient Register Filtering State
  const [patientSearch, setPatientSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TriagePriority>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PatientVisitStatus>('ALL');

  // New Patient Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState<number>(35);
  const [newPatientGender, setNewPatientGender] = useState<'M' | 'F' | 'Other'>('M');
  const [newPatientFacilityId, setNewPatientFacilityId] = useState(facilities[0]?.id || 'FAC-01');
  const [newPatientDepartment, setNewPatientDepartment] = useState('General OPD');
  const [newPatientComplaint, setNewPatientComplaint] = useState('');
  const [newPatientPriority, setNewPatientPriority] = useState<TriagePriority>('P3 - Urgent');
  const [newPatientBp, setNewPatientBp] = useState('120/80');
  const [newPatientPulse, setNewPatientPulse] = useState(76);
  const [newPatientSpo2, setNewPatientSpo2] = useState(98);
  const [newPatientTemp, setNewPatientTemp] = useState('98.6°F');
  const [newPatientPhone, setNewPatientPhone] = useState('+91 98231 44512');
  const [newPatientDoctor, setNewPatientDoctor] = useState('');

  // Filter footfalls
  const filteredFootfalls = footfalls.filter((f) => {
    return selectedFacilityId === 'ALL' || f.facilityId === selectedFacilityId;
  });

  const totalPatientsToday = filteredFootfalls.reduce((acc, f) => acc + f.totalPatients, 0);
  const totalOpd = filteredFootfalls.reduce((acc, f) => acc + f.opdCount, 0);
  const totalEmergency = filteredFootfalls.reduce((acc, f) => acc + f.emergencyCount, 0);
  const surgedFacilities = filteredFootfalls.filter((f) => f.warningFlag);

  // Filtered Patients List
  const filteredPatients = patients.filter((p) => {
    const matchesFacility = selectedFacilityId === 'ALL' || p.facilityId === selectedFacilityId;
    const matchesPriority = priorityFilter === 'ALL' || p.triagePriority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const query = patientSearch.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.uhid.toLowerCase().includes(query) ||
      p.chiefComplaint.toLowerCase().includes(query) ||
      p.attendingDoctor.toLowerCase().includes(query) ||
      p.facilityName.toLowerCase().includes(query) ||
      p.department.toLowerCase().includes(query);

    return matchesFacility && matchesPriority && matchesStatus && matchesQuery;
  });

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

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientComplaint.trim()) return;

    const fac = facilities.find((f) => f.id === newPatientFacilityId) || facilities[0];
    const facRecord = doctors.find((d) => d.facilityId === newPatientFacilityId);
    const facRoster = facRecord?.roster || [];
    const presentDocs = facRoster.filter((doc) => doc.status === 'PRESENT');
    const doctorName =
      newPatientDoctor ||
      (presentDocs.length > 0 ? presentDocs[0].doctorName : (facRoster[0]?.doctorName || 'Dr. Anand Deshmukh, MBBS'));

    const randNum = Math.floor(1000 + Math.random() * 9000);

    registerPatient({
      uhid: `ABHA-MH-2026-${randNum}`,
      name: newPatientName.trim(),
      age: newPatientAge,
      gender: newPatientGender,
      facilityId: fac.id,
      facilityName: fac.name,
      department: newPatientDepartment || 'General OPD',
      chiefComplaint: newPatientComplaint.trim(),
      triagePriority: newPatientPriority,
      status: 'Waiting',
      vitals: {
        bp: newPatientBp || '120/80',
        pulse: newPatientPulse || 75,
        spo2: newPatientSpo2 || 98,
        temperature: newPatientTemp.includes('°') ? newPatientTemp : `${newPatientTemp}°F`,
      },
      attendingDoctor: doctorName,
    });

    // Reset Form
    setNewPatientName('');
    setNewPatientComplaint('');
    setShowPatientModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Footfall & Triage Register</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time outpatient footfalls, Ayushman Bharat ABHA intake register, and emergency triage priority queues across Maharashtra health centres.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPatientModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Register Patient (OPD/Emergency)</span>
          </button>

          <button
            onClick={() => setShowRecordModal(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Daily Census</span>
          </button>
        </div>
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

      {/* Live District Patient Triage & OPD Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <HeartPulse className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Live District Patient Triage & OPD Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                {filteredPatients.length} Active Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ayushman Bharat Digital Mission (ABDM) connected real-time queue with Indian triage categories, verified vitals, and assigned Medical Officers.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, ABHA, doctor..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="P1 - Resuscitation">P1 - Resuscitation (Red)</option>
              <option value="P2 - Emergent">P2 - Emergent (Orange)</option>
              <option value="P3 - Urgent">P3 - Urgent (Yellow)</option>
              <option value="P4 - Non-Urgent">P4 - Routine (Green)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Observation">Observation</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
        </div>

        {/* Priority Legend Bar */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-4 text-[11px] text-slate-600 flex-wrap">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Triage Protocol:
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <strong>P1 - Resuscitation</strong>: Immediate (&lt;5 min)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <strong>P2 - Emergent</strong>: Emergency (&lt;15 min)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <strong>P3 - Urgent</strong>: Urgent (&lt;60 min)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <strong>P4 - Non-Urgent</strong>: Ambulatory / Routine
          </span>
        </div>

        {/* Patient Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Token & Time</th>
                <th className="py-3 px-4">Patient Profile (ABHA UHID)</th>
                <th className="py-3 px-4">Health Centre</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Vitals</th>
                <th className="py-3 px-4">Triage</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-medium text-slate-600">No patients matching current criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing the search or changing the facility filter.</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const triageBadge =
                    patient.triagePriority === 'P1 - Resuscitation'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : patient.triagePriority === 'P2 - Emergent'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : patient.triagePriority === 'P3 - Urgent'
                      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  const statusBadge =
                    patient.status === 'Waiting'
                      ? 'bg-amber-100 text-amber-800'
                      : patient.status === 'In Consultation'
                      ? 'bg-blue-100 text-blue-800'
                      : patient.status === 'Observation'
                      ? 'bg-purple-100 text-purple-800'
                      : patient.status === 'Admitted'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-100 text-slate-600';

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition">
                      {/* Token & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          TK-{patient.tokenNumber}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {patient.registrationTime}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{patient.name}</span>
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {patient.age}y • {patient.gender}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-teal-700 mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          <span>{patient.uhid}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Dept: {patient.department} {patient.bedNumber ? `• Bed ${patient.bedNumber}` : ''}
                        </div>
                      </td>

                      {/* Facility */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                        {patient.facilityName}
                      </td>

                      {/* Chief Complaint */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <span className="font-medium text-slate-800">{patient.chiefComplaint}</span>
                      </td>

                      {/* Vitals */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                          <div>
                            <span className="text-slate-400">BP:</span>{' '}
                            <span className="font-semibold text-slate-700">{patient.vitals.bp}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">SpO2:</span>{' '}
                            <span
                              className={`font-semibold ${
                                patient.vitals.spo2 < 94 ? 'text-red-600 font-bold' : 'text-slate-700'
                              }`}
                            >
                              {patient.vitals.spo2}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Pulse:</span>{' '}
                            <span className="font-semibold text-slate-700">{patient.vitals.pulse} bpm</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Temp:</span>{' '}
                            <span className="font-semibold text-slate-700">
                              {patient.vitals.temperature}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Triage */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${triageBadge}`}
                        >
                          {patient.triagePriority}
                        </span>
                      </td>

                      {/* Attending Doctor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{patient.attendingDoctor}</span>
                        </div>
                      </td>

                      {/* Status & Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={patient.status}
                            onChange={(e) => updatePatientStatus(patient.id, e.target.value as PatientVisitStatus)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border-0 cursor-pointer ${statusBadge}`}
                          >
                            <option value="Waiting">Waiting</option>
                            <option value="In Consultation">In Consultation</option>
                            <option value="Observation">Observation</option>
                            <option value="Admitted">Admitted</option>
                            <option value="Discharged">Discharged</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <form
            onSubmit={handleRegisterPatient}
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <UserCheck className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ABHA Patient Registration</h3>
                  <p className="text-xs text-slate-500">Ayushman Bharat Digital Health Intake</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Full Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Patient Full Name (Indian Demographic)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Patil, Sunita Kulkarni"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Age & Gender</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="115"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(parseInt(e.target.value) || 30)}
                      className="w-16 px-2 py-2 border border-slate-200 rounded-xl font-bold"
                    />
                    <select
                      value={newPatientGender}
                      onChange={(e) => setNewPatientGender(e.target.value as 'M' | 'F' | 'Other')}
                      className="flex-1 px-1.5 py-2 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="M">M</option>
                      <option value="F">F</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Facility & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned Facility</label>
                  <select
                    value={newPatientFacilityId}
                    onChange={(e) => {
                      setNewPatientFacilityId(e.target.value);
                      const roster = doctors.find((d) => d.facilityId === e.target.value)?.roster || [];
                      if (roster.length > 0) setNewPatientDoctor(roster[0].doctorName);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Attending Medical Officer</label>
                  <select
                    value={newPatientDoctor}
                    onChange={(e) => setNewPatientDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    {(doctors.find((d) => d.facilityId === newPatientFacilityId)?.roster || []).map((doc) => (
                      <option key={doc.id} value={doc.doctorName}>
                        {doc.doctorName} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Chief Clinical Complaint</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High fever with rigors, Acute abdominal pain, Labored breathing"
                  value={newPatientComplaint}
                  onChange={(e) => setNewPatientComplaint(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Triage Priority & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Emergency Triage Priority</label>
                  <select
                    value={newPatientPriority}
                    onChange={(e) => setNewPatientPriority(e.target.value as TriagePriority)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="P1 - Resuscitation">P1 - Resuscitation (Red)</option>
                    <option value="P2 - Emergent">P2 - Emergent (Orange)</option>
                    <option value="P3 - Urgent">P3 - Urgent (Yellow)</option>
                    <option value="P4 - Non-Urgent">P4 - Routine (Green)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. General OPD, Emergency"
                    value={newPatientDepartment}
                    onChange={(e) => setNewPatientDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-slate-700 font-bold mb-2">Initial Clinical Vitals</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">BP (mmHg)</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={newPatientBp}
                      onChange={(e) => setNewPatientBp(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={newPatientPulse}
                      onChange={(e) => setNewPatientPulse(parseInt(e.target.value) || 75)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">SpO2 (%)</label>
                    <input
                      type="number"
                      value={newPatientSpo2}
                      onChange={(e) => setNewPatientSpo2(parseInt(e.target.value) || 98)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Temp</label>
                    <input
                      type="text"
                      placeholder="98.6°F"
                      value={newPatientTemp}
                      onChange={(e) => setNewPatientTemp(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98231 XXXXX"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue OPD Token & Register</span>
              </button>
            </div>
          </form>
        </div>
      )}

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
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
