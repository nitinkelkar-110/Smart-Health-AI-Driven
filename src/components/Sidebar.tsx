import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Pill,
  TrendingUp,
  Users,
  Bed,
  Stethoscope,
  FlaskConical,
  ArrowRightLeft,
  AlertTriangle,
  Bell,
  FileText,
  Bot,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n';

export const Sidebar: React.FC = () => {
  const {
    language,
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    atRiskFacilities,
    transfers,
    alerts,
    inventory,
    aiModels,
  } = useApp();

  const t = getTranslation(language);

  // Badge counters
  const criticalStockouts = inventory.filter(
    (i) => i.alertSeverity === 'CRITICAL' || i.alertSeverity === 'HIGH'
  ).length;
  const pendingTransfers = transfers.filter(
    (tr) => tr.status === 'RECOMMENDED' || tr.status === 'APPROVED'
  ).length;
  const urgentAtRisk = atRiskFacilities.filter(
    (f) => f.riskSeverity === 'CRITICAL' || f.riskSeverity === 'HIGH'
  ).length;
  const unresolvedAlerts = alerts.filter((a) => !a.isResolved).length;

  const navItems = [
    {
      id: 'dashboard',
      label: t.navDistrictDashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'facilities',
      label: t.navHealthCentres,
      icon: Building2,
      badge: null,
    },
    {
      id: 'inventory',
      label: t.navMedicineInventory,
      icon: Pill,
      badge: criticalStockouts > 0 ? { count: criticalStockouts, color: 'bg-red-500' } : null,
    },
    {
      id: 'forecast',
      label: t.navDemandForecast,
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'footfall',
      label: t.navPatientFootfall,
      icon: Users,
      badge: null,
    },
    {
      id: 'beds',
      label: t.navBedAvailability,
      icon: Bed,
      badge: null,
    },
    {
      id: 'doctors',
      label: t.navDoctorAttendance,
      icon: Stethoscope,
      badge: null,
    },
    {
      id: 'diagnostics',
      label: t.navDiagnosticAudit,
      icon: FlaskConical,
      badge: null,
    },
    {
      id: 'redistribution',
      label: t.navResourceRedistribution,
      icon: ArrowRightLeft,
      badge: pendingTransfers > 0 ? { count: pendingTransfers, color: 'bg-teal-600' } : null,
      highlight: true,
    },
    {
      id: 'at-risk',
      label: t.navAtRiskFacilities,
      icon: AlertTriangle,
      badge: urgentAtRisk > 0 ? { count: urgentAtRisk, color: 'bg-amber-500' } : null,
    },
    {
      id: 'alerts',
      label: t.navAlertsNotifications,
      icon: Bell,
      badge: unresolvedAlerts > 0 ? { count: unresolvedAlerts, color: 'bg-red-500' } : null,
    },
    {
      id: 'reports',
      label: t.navReportsAnalytics,
      icon: FileText,
      badge: null,
    },
    {
      id: 'assistant',
      label: t.navMediGuideAI,
      icon: Bot,
      badge: { count: 'AI', color: 'bg-gradient-to-r from-teal-500 to-cyan-600' },
      highlight: true,
    },
    {
      id: 'model-hub',
      label: t.navModelHub,
      icon: Cpu,
      badge: {
        count: `${aiModels.filter((m) => m.isFreeOnlyEligible).length} Free`,
        color: 'bg-emerald-600',
      },
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative bg-white border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        className="absolute -right-3 top-5 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs flex items-center justify-center transition hover:scale-110"
        title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-teal-50 text-teal-800 shadow-2xs font-bold border border-teal-200/80'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${item.highlight && !isActive ? 'border border-dashed border-teal-300/70' : ''}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <div
                className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!isSidebarCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!isSidebarCollapsed && item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 shadow-2xs ${item.badge.color}`}
                >
                  {item.badge.count}
                </span>
              )}

              {isSidebarCollapsed && item.badge && (
                <span
                  className={`absolute right-1 top-2 w-2 h-2 rounded-full ${item.badge.color}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-slate-700">Autonomous Monitoring</p>
              <p className="text-[10px] text-slate-400">Sync: 100% Operational</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Autonomous Monitoring: Active">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        )}
      </div>
    </aside>
  );
};
