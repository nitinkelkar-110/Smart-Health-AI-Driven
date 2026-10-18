import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  RotateCcw,
  Globe,
  User,
  Search,
  Building2,
  PlayCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Eye,
  Bot,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n';
import { LanguageCode, UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    globalLanguage,
    setGlobalLanguage,
    globalLanguages,
    isHighContrast,
    setIsHighContrast,
    userRole,
    setUserRole,
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    alerts,
    resetDemoData,
    runDemoScenario,
    activeScenarioMessage,
    clearActiveScenarioMessage,
    isInsightsOpen,
    setIsInsightsOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setActiveTab,
  } = useApp();

  const t = getTranslation(language);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;

  const scenarios = [
    { id: 1, label: 'Scenario 1: 48h Medicine Shortage', desc: 'PHC Paud runs low on ORS sachets' },
    { id: 2, label: 'Scenario 2: Identify Usable Surplus', desc: 'CHC Haveli has +850 ORS surplus' },
    { id: 3, label: 'Scenario 3: Recommend Safe Transfer', desc: 'System calculates 250 units transfer' },
    { id: 4, label: 'Scenario 4: Approve Transfer', desc: 'DHO locks reserved donor stock' },
    { id: 5, label: 'Scenario 5: Confirm Receipt & Clear Alert', desc: 'Paud inventory jumps & alert clears!' },
    { id: 6, label: 'Scenario 6: Flag At-Risk Facility', desc: 'Staff deficit & diagnostic test failure' },
    { id: 7, label: 'Scenario 7: Assign & Resolve Intervention', desc: 'Dispatch roving doctor & log audit' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Top Banner if Active Scenario is Triggered */}
      {activeScenarioMessage && (
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-800 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-teal-200">DEMO WORKFLOW:</span>
            <span>{activeScenarioMessage}</span>
          </div>
          <button
            onClick={clearActiveScenarioMessage}
            className="p-1 hover:bg-white/20 rounded-md transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Sidebar Toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  {t.brandName}
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {t.demoSyntheticBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Pune Zilla Health Operations • 12 Facilities
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Facility Filter & Demo Scenarios Runner */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Facility Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{t.allFacilities}</option>
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.type} • {fac.block})
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Demo Scenarios Runner */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioMenu((prev: boolean) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-600 hover:to-emerald-700 transition shadow-xs cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{t.runScenario}</span>
            </button>

            {showScenarioMenu && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Judge Demo Scenarios</span>
                  <span className="text-[10px] text-slate-400">1-Click Automated Steps</span>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {scenarios.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        runDemoScenario(s.id);
                        setShowScenarioMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 hover:text-teal-900 transition flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                    >
                      <span className="font-semibold text-slate-800">{s.label}</span>
                      <span className="text-[11px] text-slate-500">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: Language, Accessibility, Notifications, Role, AI Assistant */}
        <div className="flex items-center gap-2">
          {/* Quick Ask AI Button */}
          <button
            onClick={() => setActiveTab('assistant')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg text-xs font-semibold hover:from-teal-700 hover:to-emerald-700 transition shadow-2xs cursor-pointer"
            title="Open MediGrid Intelligence Assistant"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t.navMediGuideAI}</span>
          </button>

          {/* Worldwide Language Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-teal-600 mr-1.5" />
            <select
              value={globalLanguage.code}
              onChange={(e) => {
                const found = globalLanguages.find((l) => l.code === e.target.value);
                if (found) {
                  setGlobalLanguage(found);
                }
              }}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer max-w-[130px]"
            >
              {!['en','hi','mr','bn','ta','te','gu','kn','ml','pa','ur','sa','ar','es','fr','de','ru','zh','ja','ko','pt','he','fa','sw'].includes(globalLanguage.code) && (
                <option value={globalLanguage.code}>
                  {globalLanguage.nativeName} ({globalLanguage.name})
                </option>
              )}
              <optgroup label="India & Regional">
                <option value="en">English (Global)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="ur">اردو (Urdu • RTL)</option>
                <option value="sa">संस्कृतम् (Sanskrit)</option>
              </optgroup>
              <optgroup label="Worldwide & Middle East">
                <option value="ar">العربية (Arabic • RTL)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="pt">Português (Portuguese)</option>
                <option value="he">עברית (Hebrew • RTL)</option>
                <option value="fa">فارسی (Persian • RTL)</option>
                <option value="sw">Kiswahili (Swahili)</option>
              </optgroup>
            </select>
          </div>

          {/* High Contrast Accessibility Toggle */}
          <button
            onClick={() => setIsHighContrast((prev) => !prev)}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              isHighContrast
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent'
            }`}
            title={isHighContrast ? 'Disable high contrast' : 'Enable high contrast accessibility mode'}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Role Selector */}
          <div className="hidden xl:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="DISTRICT_ADMIN">{t.roleDistrictAdmin}</option>
              <option value="MEDICAL_OFFICER">{t.roleMedicalOfficer}</option>
              <option value="LOGISTICS_COORDINATOR">{t.roleLogisticsCoordinator}</option>
              <option value="PHARMACIST">{t.rolePharmacist}</option>
            </select>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset demo state back to default synthetic health data?')) {
                resetDemoData();
              }
            }}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title={t.resetDemoData}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev: boolean) => !prev)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="System Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    Live Telemetry Alerts ({activeAlerts.length})
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('alerts');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-teal-600 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {activeAlerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No active critical alerts
                    </div>
                  ) : (
                    activeAlerts.slice(0, 4).map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          setActiveTab('alerts');
                          setShowNotifications(false);
                        }}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-semibold ${
                              alert.severity === 'CRITICAL'
                                ? 'text-red-600'
                                : alert.severity === 'HIGH'
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {alert.facilityName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Copilot Toggle (Right Drawer) */}
          <button
            onClick={() => setIsInsightsOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isInsightsOpen
                ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle AI Operational Insights"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Insights</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 bg-teal-100 text-teal-800 rounded">
              Beta
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
