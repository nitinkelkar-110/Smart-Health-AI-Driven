import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Check,
  Filter,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AlertNotification, AlertSeverity } from '../types';

export const AlertsNotifications: React.FC = () => {
  const { alerts, acknowledgeAlertItem, resolveAlertItem, selectedFacilityId, setSelectedFacilityId, facilities } =
    useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesFacility =
      selectedFacilityId === 'ALL' || alert.facilityId === selectedFacilityId;
    const matchesSeverity =
      severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && !alert.isResolved) ||
      (statusFilter === 'RESOLVED' && alert.isResolved);

    return matchesFacility && matchesSeverity && matchesStatus;
  });

  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = activeAlerts.filter((a) => a.severity === 'HIGH').length;
  const resolvedCount = alerts.filter((a) => a.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Alerts & Notifications Center
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Rule-Based Autonomous Dispatch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-dimensional operational incident logging with audit tracking and administrative acknowledgement.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'ACTIVE'
                ? 'bg-teal-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'RESOLVED'
                ? 'bg-teal-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'ALL'
                ? 'bg-teal-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All History ({alerts.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Unresolved Incidents</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{activeAlerts.length}</div>
          <span className="text-[11px] text-slate-400">Awaiting intervention</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Critical Severity</span>
          <div className="mt-2 text-2xl font-extrabold text-red-600">{criticalCount}</div>
          <span className="text-[11px] text-red-500 font-medium">Immediate patient care risk</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">High Priority</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{highCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">&lt; 72h operational horizon</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Successfully Remediated</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{resolvedCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Logged in district audit</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Facilities</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong>{filteredAlerts.length}</strong> incident notifications
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No alerts found matching the active filters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-4 space-y-2.5 shadow-2xs transition-all ${
                  alert.isResolved
                    ? 'border-slate-200 opacity-70'
                    : isCritical
                    ? 'border-red-300 bg-red-50/10'
                    : isHigh
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-red-100 text-red-700'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                    <span className="text-xs text-slate-400 font-mono">({alert.id})</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{alert.timestamp}</span>
                    {alert.facilityName && (
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {alert.facilityName}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {alert.isAcknowledged ? (
                      <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Acknowledged by District Officer
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-medium">
                        Unacknowledged Incident
                      </span>
                    )}

                    {alert.isResolved && (
                      <span className="text-[11px] text-emerald-700 font-medium">
                        • Resolved by: {alert.resolvedBy || 'DHO'}
                      </span>
                    )}
                  </div>

                  {!alert.isResolved && (
                    <div className="flex items-center gap-2">
                      {!alert.isAcknowledged && (
                        <button
                          onClick={() => acknowledgeAlertItem(alert.id)}
                          className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition font-medium"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveAlertItem(alert.id)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-bold shadow-2xs"
                      >
                        Resolve Alert
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Configurable Alert Escalation Rules */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900">Configured Rule-Based Alert Trigger Escalations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
            <strong className="text-red-900 block font-bold mb-1">CRITICAL ESCALATION:</strong>
            Medicine stock exhaustion (0 units), predicted runout &le; 24h, or bed saturation &ge; 100%. Automatic SMS alert dispatched to Dy. DHO.
          </div>
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <strong className="text-amber-900 block font-bold mb-1">HIGH ESCALATION:</strong>
            Stock-out predicted within 3 days, doctor staffing below minimum shift requirement, or essential diagnostic offline.
          </div>
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
            <strong className="text-teal-900 block font-bold mb-1">MEDIUM / LOW ESCALATION:</strong>
            Stock below configured threshold buffer or batch expiry within 30 days. Logged for standard restocking cycle.
          </div>
        </div>
      </div>
    </div>
  );
};
