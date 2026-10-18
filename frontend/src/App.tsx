import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InsightsDrawer } from './components/InsightsDrawer';

// Pages
import { DistrictDashboard } from './pages/DistrictDashboard';
import { HealthCentres } from './pages/HealthCentres';
import { MedicineInventory } from './pages/MedicineInventory';
import { AIDemandForecast } from './pages/AIDemandForecast';
import { PatientFootfall } from './pages/PatientFootfall';
import { BedAvailability } from './pages/BedAvailability';
import { DoctorAttendance } from './pages/DoctorAttendance';
import { DiagnosticTestAudit } from './pages/DiagnosticTestAudit';
import { SmartResourceRedistribution } from './pages/SmartResourceRedistribution';
import { AtRiskFacilities } from './pages/AtRiskFacilities';
import { AlertsNotifications } from './pages/AlertsNotifications';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { MediGridIntelligenceChat } from './pages/MediGridIntelligenceChat';
import { AIModelHub } from './pages/AIModelHub';
import { Settings } from './pages/Settings';

// Global Search Command Palette (Ctrl+K)
import { Search, Building2, Pill, ArrowRightLeft, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedFacilityId, facilities, inventory, transfers } =
    useApp();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter global search results
  const matchingFacilities = globalSearch.trim()
    ? facilities.filter((f) => f.name.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 4)
    : [];
  const matchingMedicines = globalSearch.trim()
    ? inventory.filter((i) => i.name.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 4)
    : [];

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DistrictDashboard />;
      case 'facilities':
        return <HealthCentres />;
      case 'inventory':
        return <MedicineInventory />;
      case 'forecast':
        return <AIDemandForecast />;
      case 'footfall':
        return <PatientFootfall />;
      case 'beds':
        return <BedAvailability />;
      case 'doctors':
        return <DoctorAttendance />;
      case 'diagnostics':
        return <DiagnosticTestAudit />;
      case 'redistribution':
        return <SmartResourceRedistribution />;
      case 'at-risk':
        return <AtRiskFacilities />;
      case 'alerts':
        return <AlertsNotifications />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'assistant':
        return <MediGridIntelligenceChat />;
      case 'model-hub':
        return <AIModelHub />;
      case 'settings':
        return <Settings />;
      default:
        return <DistrictDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <Header />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActivePage()}
        </main>

        {/* Right Collapsible AI Insights Panel */}
        <InsightsDrawer />
      </div>

      {/* Global Quick Search Modal (Ctrl+K) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-2">
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search health centres, medicines, or transfers (Esc to close)..."
                className="flex-1 text-sm bg-transparent focus:outline-hidden text-slate-900 placeholder:text-slate-400"
              />
              <button onClick={() => setShowSearchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-3 space-y-3 text-xs">
              {globalSearch.trim() === '' ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  Type a health facility name (e.g. &ldquo;Paud&rdquo;, &ldquo;Haveli&rdquo;) or medicine (&ldquo;ORS&rdquo;, &ldquo;Amoxicillin&rdquo;)
                </div>
              ) : (
                <>
                  {matchingFacilities.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                        Health Centres
                      </span>
                      <div className="space-y-1">
                        {matchingFacilities.map((fac) => (
                          <div
                            key={fac.id}
                            onClick={() => {
                              setSelectedFacilityId(fac.id);
                              setActiveTab('facilities');
                              setShowSearchModal(false);
                            }}
                            className="p-2 hover:bg-teal-50 rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-900">{fac.name}</span>
                            <span className="text-[10px] text-slate-400">
                              {fac.type} • {fac.block}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingMedicines.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                        Medicines & Stock
                      </span>
                      <div className="space-y-1">
                        {matchingMedicines.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedFacilityId(m.facilityId);
                              setActiveTab('inventory');
                              setShowSearchModal(false);
                            }}
                            className="p-2 hover:bg-teal-50 rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">{m.name}</span>
                              <span className="text-[10px] text-slate-400 block">{m.facilityName}</span>
                            </div>
                            <span className="font-extrabold text-teal-700">
                              {m.usableStock} {m.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingFacilities.length === 0 && matchingMedicines.length === 0 && (
                    <div className="py-4 text-center text-slate-400 text-xs">
                      No matching records found.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
