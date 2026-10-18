import React, { useState } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Phone,
  UserCheck,
  Building2,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DoctorAttendanceRecord } from '../types';

export const DoctorAttendance: React.FC = () => {
  const { doctors, facilities, submitDoctorAttendanceRecord, selectedFacilityId, setSelectedFacilityId } =
    useApp();

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DoctorAttendanceRecord | null>(null);
  const [formPresent, setFormPresent] = useState(2);
  const [formAbsent, setFormAbsent] = useState(0);
  const [formOnLeave, setFormOnLeave] = useState(1);

  const filteredDoctors = doctors.filter(
    (d) => selectedFacilityId === 'ALL' || d.facilityId === selectedFacilityId
  );

  const totalScheduled = filteredDoctors.reduce((acc, d) => acc + d.scheduledDoctors, 0);
  const totalPresent = filteredDoctors.reduce((acc, d) => acc + d.presentDoctors, 0);
  const totalAbsent = filteredDoctors.reduce((acc, d) => acc + d.absentDoctors, 0);
  const totalOnLeave = filteredDoctors.reduce((acc, d) => acc + d.onLeaveDoctors, 0);
  const deficitCentres = filteredDoctors.filter((d) => d.isStaffingDeficit);

  const overallAttendanceRate =
    totalScheduled > 0 ? Math.round((totalPresent / totalScheduled) * 1000) / 10 : 0;

  const handleOpenRecordModal = (record: DoctorAttendanceRecord) => {
    setSelectedRecord(record);
    setFormPresent(record.presentDoctors);
    setFormAbsent(record.absentDoctors);
    setFormOnLeave(record.onLeaveDoctors);
    setShowRecordModal(true);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    submitDoctorAttendanceRecord(selectedRecord.facilityId, formPresent, formAbsent, formOnLeave);
    setShowRecordModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Attendance Monitoring</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Shift-wise clinical duty attendance, minimum requirement audits, and automated staffing deficit flags.
          </p>
        </div>
      </div>

      {/* Staffing Deficit Alert Banner */}
      {deficitCentres.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-amber-950 text-sm">Active Staffing Deficit Alert</h2>
            <p className="mt-0.5 text-amber-800">
              {deficitCentres.map((c) => c.alertNote).join(' • ')}
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              District action: Medical Officer roster re-allocation initiated. Contact DHO logistics cell.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Scheduled Shifts</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalScheduled}</div>
          <span className="text-[11px] text-slate-400">Total rostered doctors today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Doctors on Duty (Present)</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{totalPresent}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Physicians at clinic</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Approved Leave / Absent</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {totalOnLeave} <span className="text-xs text-slate-400 font-normal">Leave</span> •{' '}
            {totalAbsent} <span className="text-xs text-red-500 font-normal">Absent</span>
          </div>
          <span className="text-[11px] text-slate-400">Excludes unverified cases</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Attendance Rate</span>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              overallAttendanceRate < 75 ? 'text-amber-600' : 'text-teal-700'
            }`}
          >
            {overallAttendanceRate}%
          </div>
          <span className="text-[11px] text-slate-400">
            {deficitCentres.length} facility below mandatory minimum
          </span>
        </div>
      </div>

      {/* Doctor Attendance Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((docRecord) => {
          return (
            <div
              key={docRecord.facilityId}
              className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                docRecord.isStaffingDeficit ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{docRecord.facilityName}</h2>
                    <span className="text-xs text-slate-500 font-medium">
                      Minimum Required: {docRecord.minimumRequired} Doctors
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      docRecord.isStaffingDeficit
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {docRecord.isStaffingDeficit ? 'Staffing Deficit' : 'Requirement Met'}
                  </span>
                </div>

                {/* Big Metric */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Shift Attendance
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900">
                      {docRecord.presentDoctors}{' '}
                      <span className="text-sm text-slate-400 font-semibold">
                        / {docRecord.scheduledDoctors}
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-xl">
                      {docRecord.attendancePercentage}% Rate
                    </span>
                  </div>
                </div>

                {/* Doctor Shift Entries */}
                <div className="mt-4 space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Duty Roster
                  </span>
                  {docRecord.roster.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{doc.doctorName}</span>
                        <span className="text-[11px] text-slate-500">{doc.specialty}</span>
                        <span className="text-[10px] text-slate-400 block">{doc.shift}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'ON_LEAVE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {docRecord.lastUpdated}
                </span>

                <button
                  onClick={() => handleOpenRecordModal(docRecord)}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition"
                >
                  Log Attendance
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Attendance Modal */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveAttendance}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Shift Attendance</h3>
                <p className="text-xs text-slate-500">{selectedRecord.facilityName}</p>
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
                <label className="block text-slate-600 font-medium mb-1">
                  Doctors Present (Max {selectedRecord.scheduledDoctors})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedRecord.scheduledDoctors}
                  value={formPresent}
                  onChange={(e) => setFormPresent(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Absent</label>
                  <input
                    type="number"
                    min="0"
                    value={formAbsent}
                    onChange={(e) => setFormAbsent(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">On Approved Leave</label>
                  <input
                    type="number"
                    min="0"
                    value={formOnLeave}
                    onChange={(e) => setFormOnLeave(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-amber-600"
                  />
                </div>
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
                Submit Shift Attendance
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
