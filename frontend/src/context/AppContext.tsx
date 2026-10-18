import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  HealthFacility,
  MedicineItem,
  InventoryTransaction,
  PatientFootfallRecord,
  BedAvailabilityRecord,
  DoctorAttendanceRecord,
  DiagnosticTestRecord,
  RedistributionTransfer,
  AtRiskFacility,
  AlertNotification,
  AuditLog,
  LanguageCode,
  UserRole,
  PatientRecord,
  PatientVisitStatus,
} from '../types';
import {
  AIModel,
  AIProviderConfig,
  AIProviderName,
  ChatConversation,
  ChatMessage,
  GlobalLanguage,
} from '../types/aiHub';
import {
  INITIAL_FACILITIES,
  INITIAL_INVENTORY,
  INITIAL_FOOTFALLS,
  INITIAL_BEDS,
  INITIAL_DOCTORS,
  INITIAL_DIAGNOSTICS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PATIENTS,
} from '../data/initialData';

import {
  INITIAL_PROVIDERS,
  VERIFIED_FREE_MODELS,
  discoverLiveProviderModels,
} from '../services/modelRegistry';
import { GLOBAL_LANGUAGES, getLanguageByCode } from '../services/languageRegistry';
import {
  calculateMedicineStatus,
  generateSmartRedistributionRecommendations,
  evaluateAtRiskFacilities,
} from '../utils/engine';

interface AppContextType {
  // State
  facilities: HealthFacility[];
  inventory: MedicineItem[];
  transactions: InventoryTransaction[];
  footfalls: PatientFootfallRecord[];
  beds: BedAvailabilityRecord[];
  doctors: DoctorAttendanceRecord[];
  patients: PatientRecord[];
  diagnostics: DiagnosticTestRecord[];

  transfers: RedistributionTransfer[];
  atRiskFacilities: AtRiskFacility[];
  alerts: AlertNotification[];
  auditLogs: AuditLog[];
  
  // App UI State
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedFacilityId: string;
  setSelectedFacilityId: (id: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  isInsightsOpen: boolean;
  setIsInsightsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // AI Model Hub & MediGrid Intelligence
  aiModels: AIModel[];
  providers: AIProviderConfig[];
  defaultModelId: string;
  setDefaultModelId: (id: string) => void;
  updateProviderApiKey: (providerId: AIProviderName, apiKey: string, baseUrl?: string) => void;
  toggleProviderEnabled: (providerId: AIProviderName) => void;
  refreshProviderModels: () => Promise<void>;
  addCustomModel: (model: AIModel) => void;

  // Global Multilingual System & Accessibility
  globalLanguage: GlobalLanguage;
  setGlobalLanguage: (lang: GlobalLanguage) => void;
  globalLanguages: GlobalLanguage[];
  isHighContrast: boolean;
  setIsHighContrast: (v: boolean | ((prev: boolean) => boolean)) => void;
  isLowBandwidth: boolean;
  setIsLowBandwidth: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Conversations State
  conversations: ChatConversation[];
  currentConversationId: string;
  setCurrentConversationId: (id: string) => void;
  createNewConversation: (preferredLang?: string, modelId?: string) => string;
  deleteConversation: (id: string) => void;
  addMessageToCurrentConversation: (message: ChatMessage) => void;
  updateMessageInCurrentConversation: (messageId: string, updates: Partial<ChatMessage>) => void;
  clearCurrentConversation: () => void;
  
  // Actions
  recordMedicineConsumption: (medicineId: string, quantity: number, notes?: string) => void;
  addMedicineStock: (
    medicineId: string,
    quantity: number,
    batchNumber: string,
    expiryDate: string,
    notes?: string
  ) => void;
  quarantineStock: (medicineId: string, quantity: number, reason: string) => void;
  
  approveTransfer: (transferId: string, adjustedQuantity?: number) => void;
  dispatchTransfer: (transferId: string) => void;
  receiveTransfer: (transferId: string) => void;
  rejectTransfer: (transferId: string, reason?: string) => void;
  
  recordFootfall: (
    facilityId: string,
    opd: number,
    ipd: number,
    emergency: number,
    peakHour?: string
  ) => void;
  updateBedRecord: (
    facilityId: string,
    occupiedBeds: number,
    unavailableBeds: number,
    specialtyBeds: { general: number; maternity: number; pediatric: number; emergency: number }
  ) => void;
  submitDoctorAttendanceRecord: (
    facilityId: string,
    present: number,
    absent: number,
    onLeave: number
  ) => void;
  registerPatient: (
    patient: Omit<PatientRecord, 'id' | 'tokenNumber' | 'registrationTime'>
  ) => void;
  updatePatientStatus: (patientId: string, status: PatientVisitStatus) => void;
  updateDiagnosticStatus: (

    testId: string,
    status: DiagnosticTestRecord['status'],
    reagentStatus?: DiagnosticTestRecord['reagentStatus']
  ) => void;
  
  assignInterventionOfficer: (facilityId: string, officer: string, notes?: string) => void;
  resolveInterventionAction: (facilityId: string, notes?: string) => void;
  acknowledgeAlertItem: (alertId: string) => void;
  resolveAlertItem: (alertId: string) => void;
  
  resetDemoData: () => void;
  runDemoScenario: (scenarioNumber: number) => void;
  activeScenarioMessage: string | null;
  clearActiveScenarioMessage: () => void;
}

const STORAGE_PREFIX = 'medigrid_v1_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage or fallback to synthetic initial data
  const loadStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [facilities, setFacilities] = useState<HealthFacility[]>(() =>
    loadStored('facilities', INITIAL_FACILITIES)
  );
  const [inventory, setInventory] = useState<MedicineItem[]>(() =>
    loadStored('inventory', INITIAL_INVENTORY)
  );
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() =>
    loadStored('transactions', [])
  );
  const [footfalls, setFootfalls] = useState<PatientFootfallRecord[]>(() =>
    loadStored('footfalls', INITIAL_FOOTFALLS)
  );
  const [beds, setBeds] = useState<BedAvailabilityRecord[]>(() =>
    loadStored('beds', INITIAL_BEDS)
  );
  const [doctors, setDoctors] = useState<DoctorAttendanceRecord[]>(() => {
    const stored = loadStored<DoctorAttendanceRecord[]>('doctors', INITIAL_DOCTORS);
    if (!stored || stored.length < INITIAL_DOCTORS.length || !stored.some((d) => d.roster && d.roster.length > 0)) {
      return INITIAL_DOCTORS;
    }
    return stored;
  });
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    const stored = loadStored<PatientRecord[]>('patients', INITIAL_PATIENTS);
    if (!stored || stored.length === 0) {
      return INITIAL_PATIENTS;
    }
    return stored;
  });
  const [diagnostics, setDiagnostics] = useState<DiagnosticTestRecord[]>(() =>

    loadStored('diagnostics', INITIAL_DIAGNOSTICS)
  );
  const [transfers, setTransfers] = useState<RedistributionTransfer[]>(() => {
    const stored = loadStored<RedistributionTransfer[]>('transfers', []);
    if (stored.length > 0) return stored;
    // Initial generated recommendations
    return generateSmartRedistributionRecommendations(
      INITIAL_FACILITIES,
      INITIAL_INVENTORY,
      []
    );
  });
  const [alerts, setAlerts] = useState<AlertNotification[]>(() =>
    loadStored('alerts', INITIAL_ALERTS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStored('audit_logs', INITIAL_AUDIT_LOGS)
  );

  // Global Multilingual & Accessibility State
  const [globalLanguage, setGlobalLanguageState] = useState<GlobalLanguage>(() => {
    const storedGlobal = loadStored<GlobalLanguage | null>('global_language', null);
    if (storedGlobal && storedGlobal.code) return storedGlobal;
    const storedLang = loadStored<string | null>('language', null);
    if (storedLang) {
      const found = GLOBAL_LANGUAGES.find((l) => l.code === storedLang) || getLanguageByCode(storedLang);
      if (found) return found;
    }
    return GLOBAL_LANGUAGES[0]; // English
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const storedLang = loadStored<string | null>('language', null);
    if (storedLang) return storedLang;
    const storedGlobal = loadStored<GlobalLanguage | null>('global_language', null);
    if (storedGlobal?.code) return storedGlobal.code;
    return 'en';
  });

  // UI State
  const [userRole, setUserRole] = useState<UserRole>('DISTRICT_ADMIN');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeScenarioMessage, setActiveScenarioMessage] = useState<string | null>(null);

  // AI Model Hub State
  const [aiModels, setAiModels] = useState<AIModel[]>(() =>
    loadStored('ai_models', VERIFIED_FREE_MODELS)
  );
  const [providers, setProviders] = useState<AIProviderConfig[]>(() =>
    loadStored('ai_providers', INITIAL_PROVIDERS)
  );
  const [defaultModelId, setDefaultModelId] = useState<string>(() =>
    loadStored('default_model_id', 'medigrid-clinical-v1')
  );

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() =>
    loadStored('high_contrast', false)
  );
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(() =>
    loadStored('low_bandwidth', false)
  );

  // Chat Conversations State
  const [conversations, setConversations] = useState<ChatConversation[]>(() =>
    loadStored('conversations', [
      {
        id: 'conv-default-1',
        title: 'District Telemetry & Inventory Inquiries',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferredLanguage: 'en',
        selectedModelId: 'medigrid-clinical-v1',
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content:
              'Welcome to **MediGrid Intelligence** — Healthcare Intelligence Without Language Barriers.\n\nI have authorized access to live operational telemetry for all **12 Primary & Community Health Centres in Pune Rural District**, including medicine stock balances, doctor attendance rosters, bed occupancy rates, and pending redistribution transfers.\n\nAsk me any operational question, test multi-model routing across 50+ free models, or speak via microphone in your native language.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'MediGrid Clinical Telemetry Engine v1',
            providerUsed: 'LocalRuleEngine',
            latencyMs: 15,
            groundedSources: [
              'Pune District Health Directive Telemetry',
              'Medicine Inventory Ledger (22 Batches)',
              'Bed Availability Roster',
            ],
          },
        ],
      },
    ])
  );
  const [currentConversationId, setCurrentConversationId] = useState<string>(
    () => conversations[0]?.id || 'conv-default-1'
  );

  // Unified Language Switcher (updates both language and globalLanguage synchronously)
  const setGlobalLanguage = (lang: GlobalLanguage) => {
    setGlobalLanguageState(lang);
    setLanguageState(lang.code);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang.direction;
      document.documentElement.lang = lang.code;
    }
    localStorage.setItem(STORAGE_PREFIX + 'global_language', JSON.stringify(lang));
    localStorage.setItem(STORAGE_PREFIX + 'language', JSON.stringify(lang.code));
  };

  const setLanguage = (code: string) => {
    const found = GLOBAL_LANGUAGES.find((l) => l.code === code) || getLanguageByCode(code);
    setGlobalLanguage(found);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = globalLanguage.direction;
      document.documentElement.lang = globalLanguage.code;
    }
  }, [globalLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isHighContrast) {
        document.documentElement.classList.add('contrast-more');
      } else {
        document.documentElement.classList.remove('contrast-more');
      }
    }
  }, [isHighContrast]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'facilities', JSON.stringify(facilities));
    localStorage.setItem(STORAGE_PREFIX + 'inventory', JSON.stringify(inventory));
    localStorage.setItem(STORAGE_PREFIX + 'transactions', JSON.stringify(transactions));
    localStorage.setItem(STORAGE_PREFIX + 'footfalls', JSON.stringify(footfalls));
    localStorage.setItem(STORAGE_PREFIX + 'beds', JSON.stringify(beds));
    localStorage.setItem(STORAGE_PREFIX + 'doctors', JSON.stringify(doctors));
    localStorage.setItem(STORAGE_PREFIX + 'patients', JSON.stringify(patients));
    localStorage.setItem(STORAGE_PREFIX + 'diagnostics', JSON.stringify(diagnostics));
    localStorage.setItem(STORAGE_PREFIX + 'transfers', JSON.stringify(transfers));
    localStorage.setItem(STORAGE_PREFIX + 'alerts', JSON.stringify(alerts));
    localStorage.setItem(STORAGE_PREFIX + 'audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem(STORAGE_PREFIX + 'ai_models', JSON.stringify(aiModels));
    localStorage.setItem(STORAGE_PREFIX + 'ai_providers', JSON.stringify(providers));
    localStorage.setItem(STORAGE_PREFIX + 'default_model_id', JSON.stringify(defaultModelId));
    localStorage.setItem(STORAGE_PREFIX + 'language', JSON.stringify(language));
    localStorage.setItem(STORAGE_PREFIX + 'global_language', JSON.stringify(globalLanguage));
    localStorage.setItem(STORAGE_PREFIX + 'high_contrast', JSON.stringify(isHighContrast));
    localStorage.setItem(STORAGE_PREFIX + 'low_bandwidth', JSON.stringify(isLowBandwidth));
    localStorage.setItem(STORAGE_PREFIX + 'conversations', JSON.stringify(conversations));
  }, [
    facilities,
    inventory,
    transactions,
    footfalls,
    beds,
    doctors,
    patients,
    diagnostics,
    transfers,
    alerts,
    auditLogs,
    aiModels,
    providers,
    defaultModelId,
    language,
    globalLanguage,
    isHighContrast,
    isLowBandwidth,
    conversations,
  ]);

  // Live Backend Database Synchronization & Hydration
  useEffect(() => {
    let isMounted = true;
    const syncBackendDatabase = async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            if (Array.isArray(json.data.facilities) && json.data.facilities.length > 0) {
              setFacilities(json.data.facilities);
            }
            if (Array.isArray(json.data.inventory) && json.data.inventory.length > 0) {
              setInventory(json.data.inventory);
            }
            if (Array.isArray(json.data.transfers) && json.data.transfers.length > 0) {
              setTransfers(json.data.transfers);
            }
            if (Array.isArray(json.data.alerts) && json.data.alerts.length > 0) {
              setAlerts(json.data.alerts);
            }
            if (Array.isArray(json.data.doctors) && json.data.doctors.length > 0) {
              setDoctors(json.data.doctors);
            }
            if (Array.isArray(json.data.patients) && json.data.patients.length > 0) {
              setPatients(json.data.patients);
            }
          }
        }
      } catch {
        // Fallback to local storage state
      }
    };


    syncBackendDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute dynamically evaluated at-risk facilities
  const atRiskFacilities = useMemo(() => {
    return evaluateAtRiskFacilities(facilities, inventory, footfalls, beds, doctors, diagnostics);
  }, [facilities, inventory, footfalls, beds, doctors, diagnostics]);

  // Helper: append audit log
  const addAuditLog = (action: string, details: string, facilityId?: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      action,
      performedBy: userRole === 'DISTRICT_ADMIN' ? 'District Health Officer (DHO)' : 'Authorized Staff',
      role: userRole,
      facilityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipAddress: '10.14.2.14',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Re-run recommendation generator whenever inventory or transfers change
  const refreshRecommendations = (
    currentInv: MedicineItem[],
    currentTransfers: RedistributionTransfer[]
  ) => {
    const existingActive = currentTransfers.filter(
      (t) => t.status !== 'REJECTED' && t.status !== 'CANCELLED'
    );
    const newRecs = generateSmartRedistributionRecommendations(
      facilities,
      currentInv,
      existingActive
    );

    // Merge without replacing ongoing approved/dispatched transfers
    const nonRecommended = currentTransfers.filter((t) => t.status !== 'RECOMMENDED');
    const existingRecIds = new Set(nonRecommended.map((t) => t.destFacilityId + t.medicineName));
    const filteredNewRecs = newRecs.filter(
      (nr) => !existingRecIds.has(nr.destFacilityId + nr.medicineName)
    );

    setTransfers([...nonRecommended, ...filteredNewRecs]);
  };

  // 1. Record Medicine Consumption
  const recordMedicineConsumption = (medicineId: string, quantity: number, notes?: string) => {
    setInventory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === medicineId) {
          const newCurrent = Math.max(0, item.currentStock - quantity);
          return calculateMedicineStatus({
            ...item,
            currentStock: newCurrent,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
          });
        }
        return item;
      });

      const target = prev.find((i) => i.id === medicineId);
      if (target) {
        const tx: InventoryTransaction = {
          id: `TX-${Date.now().toString().slice(-6)}`,
          medicineId: target.id,
          medicineName: target.name,
          facilityId: target.facilityId,
          facilityName: target.facilityName,
          type: 'CONSUMPTION',
          quantity,
          batchNumber: target.batchNumber,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          recordedBy: 'Duty Pharmacist',
          notes: notes || `Recorded daily patient dispensing of ${quantity} ${target.unit}`,
        };
        setTransactions((prevTx) => [tx, ...prevTx]);
        addAuditLog(
          'CONSUMPTION_RECORDED',
          `Dispensed ${quantity} ${target.unit} of ${target.name} at ${target.facilityName}`,
          target.facilityId
        );
      }

      refreshRecommendations(updated, transfers);
      return updated;
    });
  };

  // 2. Add Stock
  const addMedicineStock = (
    medicineId: string,
    quantity: number,
    batchNumber: string,
    expiryDate: string,
    notes?: string
  ) => {
    setInventory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === medicineId) {
          const newCurrent = item.currentStock + quantity;
          return calculateMedicineStatus({
            ...item,
            currentStock: newCurrent,
            batchNumber: batchNumber || item.batchNumber,
            expiryDate: expiryDate || item.expiryDate,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
          });
        }
        return item;
      });

      const target = prev.find((i) => i.id === medicineId);
      if (target) {
        const tx: InventoryTransaction = {
          id: `TX-${Date.now().toString().slice(-6)}`,
          medicineId: target.id,
          medicineName: target.name,
          facilityId: target.facilityId,
          facilityName: target.facilityName,
          type: 'STOCK_ADD',
          quantity,
          batchNumber: batchNumber || target.batchNumber,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          recordedBy: 'Central Store Logistics',
          notes: notes || `Received batch shipment of ${quantity} ${target.unit}`,
        };
        setTransactions((prevTx) => [tx, ...prevTx]);
        addAuditLog(
          'STOCK_ADDED',
          `Added ${quantity} ${target.unit} of ${target.name} (Batch: ${batchNumber}) to ${target.facilityName}`,
          target.facilityId
        );
      }

      refreshRecommendations(updated, transfers);
      return updated;
    });
  };

  // 3. Quarantine Stock
  const quarantineStock = (medicineId: string, quantity: number, reason: string) => {
    setInventory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === medicineId) {
          const newQuarantined = item.quarantinedStock + quantity;
          return calculateMedicineStatus({
            ...item,
            quarantinedStock: newQuarantined,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
          });
        }
        return item;
      });

      const target = prev.find((i) => i.id === medicineId);
      if (target) {
        const tx: InventoryTransaction = {
          id: `TX-${Date.now().toString().slice(-6)}`,
          medicineId: target.id,
          medicineName: target.name,
          facilityId: target.facilityId,
          facilityName: target.facilityName,
          type: 'DAMAGE_WRITE_OFF',
          quantity,
          batchNumber: target.batchNumber,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          recordedBy: 'Quality Assurance Inspector',
          notes: reason,
        };
        setTransactions((prevTx) => [tx, ...prevTx]);
        addAuditLog(
          'STOCK_QUARANTINED',
          `Quarantined ${quantity} ${target.unit} of ${target.name} at ${target.facilityName}. Reason: ${reason}`,
          target.facilityId
        );
      }

      refreshRecommendations(updated, transfers);
      return updated;
    });
  };

  // 4. Approve Transfer (Locks donor's stock in reservedForTransfer)
  const approveTransfer = (transferId: string, adjustedQuantity?: number) => {
    const tr = transfers.find((t) => t.id === transferId);
    if (!tr) return;

    const finalQty = adjustedQuantity && adjustedQuantity > 0 ? adjustedQuantity : tr.quantity;

    // Lock quantity at donor
    setInventory((prev) => {
      return prev.map((item) => {
        if (item.facilityId === tr.sourceFacilityId && item.name === tr.medicineName) {
          const newReserved = item.reservedForTransfer + finalQty;
          return calculateMedicineStatus({
            ...item,
            reservedForTransfer: newReserved,
          });
        }
        return item;
      });
    });

    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            quantity: finalQty,
            status: 'APPROVED',
            approvedBy: 'Dr. S. Kulkarni (DHO)',
            approvedTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        }
        return t;
      })
    );

    addAuditLog(
      'TRANSFER_APPROVED',
      `Approved redistribution of ${finalQty} ${tr.unit} ${tr.medicineName} from ${tr.sourceFacilityName} to ${tr.destFacilityName}`,
      tr.destFacilityId
    );

    // Sync with backend database
    fetch('/api/transfers/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId, officerName: 'Dr. S. Kulkarni (DHO)' }),
    }).catch(() => {});
  };

  // 5. Dispatch Transfer
  const dispatchTransfer = (transferId: string) => {
    const tr = transfers.find((t) => t.id === transferId);
    if (!tr) return;

    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'DISPATCHED',
            dispatchedTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        }
        return t;
      })
    );

    addAuditLog(
      'TRANSFER_DISPATCHED',
      `Dispatched ambulance delivery of ${tr.quantity} ${tr.unit} ${tr.medicineName} to ${tr.destFacilityName}`,
      tr.sourceFacilityId
    );

    // Sync with backend database
    fetch(`/api/transfers/${transferId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DISPATCHED' }),
    }).catch(() => {});
  };

  // 6. Confirm Receipt (The core hackathon workflow climax!)
  const receiveTransfer = (transferId: string) => {
    const tr = transfers.find((t) => t.id === transferId);
    if (!tr) return;

    // Deduct from donor, credit to destination
    setInventory((prev) => {
      const updated = prev.map((item) => {
        // Donor: subtract from currentStock and release reserved
        if (item.facilityId === tr.sourceFacilityId && item.name === tr.medicineName) {
          const newCurrent = Math.max(0, item.currentStock - tr.quantity);
          const newReserved = Math.max(0, item.reservedForTransfer - tr.quantity);
          return calculateMedicineStatus({
            ...item,
            currentStock: newCurrent,
            reservedForTransfer: newReserved,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
          });
        }
        // Destination: add to currentStock
        if (item.facilityId === tr.destFacilityId && item.name === tr.medicineName) {
          const newCurrent = item.currentStock + tr.quantity;
          return calculateMedicineStatus({
            ...item,
            currentStock: newCurrent,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
          });
        }
        return item;
      });

      // Automatically resolve/clear shortage alerts for the destination facility & medicine
      setAlerts((prevAlerts) =>
        prevAlerts.map((alt) => {
          if (
            alt.facilityId === tr.destFacilityId &&
            alt.title.toLowerCase().includes(tr.medicineName.toLowerCase())
          ) {
            return {
              ...alt,
              isResolved: true,
              resolvedBy: 'Auto-Resolved via Confirmed Transfer ' + tr.id,
            };
          }
          return alt;
        })
      );

      refreshRecommendations(updated, transfers);
      return updated;
    });

    // Mark transfer received
    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'RECEIVED',
            receivedTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            receivedBy: 'Medical Officer In-Charge',
          };
        }
        return t;
      })
    );

    // Record two transactions: TRANSFER_OUT and TRANSFER_IN
    const txOut: InventoryTransaction = {
      id: `TX-${Date.now().toString().slice(-6)}-OUT`,
      medicineId: tr.medicineId,
      medicineName: tr.medicineName,
      facilityId: tr.sourceFacilityId,
      facilityName: tr.sourceFacilityName,
      type: 'TRANSFER_OUT',
      quantity: tr.quantity,
      batchNumber: 'BATCH-RELOC',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      recordedBy: 'District Logistics Officer',
      notes: `Smart Redistribution dispatched to ${tr.destFacilityName}`,
    };

    const txIn: InventoryTransaction = {
      id: `TX-${Date.now().toString().slice(-6)}-IN`,
      medicineId: tr.medicineId,
      medicineName: tr.medicineName,
      facilityId: tr.destFacilityId,
      facilityName: tr.destFacilityName,
      type: 'TRANSFER_IN',
      quantity: tr.quantity,
      batchNumber: 'BATCH-RELOC',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      recordedBy: 'Pharmacist In-Charge',
      notes: `Received and stocked from ${tr.sourceFacilityName} via MediGrid AI transfer`,
    };

    setTransactions((prevTx) => [txIn, txOut, ...prevTx]);

    addAuditLog(
      'TRANSFER_COMPLETED',
      `Successfully received ${tr.quantity} ${tr.unit} ${tr.medicineName} at ${tr.destFacilityName}. Shortage alleviated and alert cleared.`,
      tr.destFacilityId
    );

    // Delightful celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#059669', '#0284c7', '#38bdf8'],
      });
    } catch {
      // safe fallback
    }

    // Sync with backend database
    fetch(`/api/transfers/${transferId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECEIVED' }),
    }).catch(() => {});
  };

  // 7. Reject Transfer
  const rejectTransfer = (transferId: string, reason?: string) => {
    const tr = transfers.find((t) => t.id === transferId);
    if (!tr) return;

    // If was approved, unreserve stock at donor
    if (tr.status === 'APPROVED') {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.facilityId === tr.sourceFacilityId && item.name === tr.medicineName) {
            return calculateMedicineStatus({
              ...item,
              reservedForTransfer: Math.max(0, item.reservedForTransfer - tr.quantity),
            });
          }
          return item;
        })
      );
    }

    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'REJECTED',
            auditNotes: reason || 'Transfer declined by Medical Officer',
          };
        }
        return t;
      })
    );

    addAuditLog(
      'TRANSFER_REJECTED',
      `Transfer ${transferId} (${tr.medicineName}) rejected. Reason: ${reason || 'Administrator declined'}`,
      tr.destFacilityId
    );
  };

  // 8. Record Footfall
  const recordFootfall = (
    facilityId: string,
    opd: number,
    ipd: number,
    emergency: number,
    peakHour?: string
  ) => {
    setFootfalls((prev) => {
      const fac = facilities.find((f) => f.id === facilityId);
      const normalCap = fac ? (fac.type === 'CHC' ? 350 : 130) : 120;
      const total = opd + ipd + emergency;
      const surge = Math.round(((total - normalCap) / normalCap) * 1000) / 10;

      const record: PatientFootfallRecord = {
        facilityId,
        facilityName: fac?.name || 'Facility',
        date: new Date().toISOString().split('T')[0],
        opdCount: opd,
        ipdCount: ipd,
        emergencyCount: emergency,
        totalPatients: total,
        normalCapacity: normalCap,
        hourlyDistribution: [
          { hour: '08:00', count: Math.round(opd * 0.12) },
          { hour: '09:00', count: Math.round(opd * 0.22) },
          { hour: '10:00', count: Math.round(opd * 0.3) },
          { hour: '11:00', count: Math.round(opd * 0.2) },
          { hour: '12:00', count: Math.round(opd * 0.1) },
          { hour: '13:00', count: Math.round(opd * 0.06) },
        ],
        peakHour: peakHour || '10:00 AM - 11:00 AM',
        surgePercentage: surge,
        warningFlag: surge > 30,
        warningReason:
          surge > 30
            ? `${fac?.name} reported patient footfall ${surge}% above normal capacity. Review staffing and triage resources.`
            : undefined,
        lastReported: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const filtered = prev.filter((f) => f.facilityId !== facilityId);
      return [record, ...filtered];
    });

    addAuditLog(
      'FOOTFALL_RECORDED',
      `Recorded daily patient count (${opd} OPD, ${ipd} IPD, ${emergency} ER) at ${facilityId}`,
      facilityId
    );
  };

  // 9. Update Bed Availability
  const updateBedRecord = (
    facilityId: string,
    occupiedBeds: number,
    unavailableBeds: number,
    specialtyBeds: { general: number; maternity: number; pediatric: number; emergency: number }
  ) => {
    setBeds((prev) => {
      return prev.map((b) => {
        if (b.facilityId === facilityId) {
          const available = Math.max(0, b.totalBeds - occupiedBeds - unavailableBeds);
          const occRate = Math.round((occupiedBeds / b.totalBeds) * 1000) / 10;
          let status: BedAvailabilityRecord['occupancyStatus'] = 'OPTIMAL';
          if (occRate >= 100) status = 'OVERCROWDED';
          else if (occRate >= 85) status = 'NEAR_CAPACITY';
          else if (occRate < 40) status = 'LOW';

          return {
            ...b,
            occupiedBeds,
            unavailableBeds,
            availableBeds: available,
            occupancyRate: occRate,
            specialtyBeds,
            occupancyStatus: status,
            lastVerified: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return b;
      });
    });

    addAuditLog('BED_STATUS_UPDATED', `Updated bed census at ${facilityId}: ${occupiedBeds} occupied`, facilityId);
  };

  // 10. Submit Doctor Attendance
  const submitDoctorAttendanceRecord = (
    facilityId: string,
    present: number,
    absent: number,
    onLeave: number
  ) => {
    setDoctors((prev) => {
      return prev.map((doc) => {
        if (doc.facilityId === facilityId) {
          const scheduled = doc.scheduledDoctors;
          const attPct = Math.round((present / scheduled) * 1000) / 10;
          const isDeficit = present < doc.minimumRequired;

          return {
            ...doc,
            presentDoctors: present,
            absentDoctors: absent,
            onLeaveDoctors: onLeave,
            attendancePercentage: attPct,
            isStaffingDeficit: isDeficit,
            alertNote: isDeficit
              ? `${doc.facilityName} has ${present} of ${scheduled} doctors present (Required: ${doc.minimumRequired}). Verify staffing coverage.`
              : undefined,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return doc;
      });
    });

    addAuditLog('DOCTOR_ATTENDANCE_LOGGED', `Recorded doctor shift attendance at ${facilityId}: ${present} present`, facilityId);

    // Sync to backend API gateway in background
    fetch('/api/doctors/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        presentDoctors: present,
        absentDoctors: absent,
        onLeaveDoctors: onLeave,
      }),
    }).catch(() => {});
  };

  // 10b. Register Patient
  const registerPatient = (
    patientData: Omit<PatientRecord, 'id' | 'tokenNumber' | 'registrationTime'>
  ) => {
    const tokenNumber =
      (patients.length > 0 ? Math.max(...patients.map((p) => p.tokenNumber)) : 100) + 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newPatient: PatientRecord = {
      ...patientData,
      id: `PAT-${Date.now().toString().slice(-4)}`,
      tokenNumber,
      registrationTime: timeStr,
    };

    setPatients((prev) => [newPatient, ...prev]);

    addAuditLog(
      'PATIENT_REGISTERED',
      `Registered patient ${newPatient.name} (${newPatient.uhid}) at ${newPatient.facilityName} - Priority: ${newPatient.triagePriority}`,
      newPatient.facilityId
    );

    // Background sync to backend database
    fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    }).catch(() => {});
  };

  // 10c. Update Patient Status
  const updatePatientStatus = (patientId: string, status: PatientVisitStatus) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status } : p))
    );

    addAuditLog('PATIENT_STATUS_UPDATED', `Updated patient ${patientId} status to ${status}`);

    fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  // 11. Update Diagnostic Status

  const updateDiagnosticStatus = (
    testId: string,
    status: DiagnosticTestRecord['status'],
    reagentStatus?: DiagnosticTestRecord['reagentStatus']
  ) => {
    setDiagnostics((prev) => {
      return prev.map((d) => {
        if (d.id === testId) {
          return {
            ...d,
            status,
            reagentStatus: reagentStatus || d.reagentStatus,
            lastVerified: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return d;
      });
    });

    addAuditLog('DIAGNOSTIC_STATUS_UPDATED', `Diagnostic test ${testId} status updated to ${status}`);
  };

  // 12. Interventions
  const assignInterventionOfficer = (facilityId: string, officer: string, notes?: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, status: 'NEEDS_ATTENTION' } : f))
    );
    addAuditLog('INTERVENTION_ASSIGNED', `Assigned ${officer} to oversee remediation at ${facilityId}`, facilityId);
  };

  const resolveInterventionAction = (facilityId: string, notes?: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, status: 'OPERATIONAL' } : f))
    );
    addAuditLog('INTERVENTION_RESOLVED', `Intervention resolved for ${facilityId}. Notes: ${notes || 'Action completed.'}`, facilityId);
  };

  // 13. Alerts
  const acknowledgeAlertItem = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isAcknowledged: true } : a))
    );
    // Sync with backend database
    fetch(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' }).catch(() => {});
  };

  const resolveAlertItem = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isResolved: true, resolvedBy: 'District Health Officer' } : a))
    );
    addAuditLog('ALERT_RESOLVED', `Alert ${alertId} resolved manually by DHO.`);
  };

  // 14. Reset Demo Data
  const resetDemoData = () => {
    localStorage.clear();
    setFacilities(INITIAL_FACILITIES);
    setInventory(INITIAL_INVENTORY);
    setTransactions([]);
    setFootfalls(INITIAL_FOOTFALLS);
    setBeds(INITIAL_BEDS);
    setDoctors(INITIAL_DOCTORS);
    setPatients(INITIAL_PATIENTS);
    setDiagnostics(INITIAL_DIAGNOSTICS);

    const recs = generateSmartRedistributionRecommendations(INITIAL_FACILITIES, INITIAL_INVENTORY, []);
    setTransfers(recs);
    setAlerts(INITIAL_ALERTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSelectedFacilityId('ALL');
    setActiveScenarioMessage('Demo state restored to baseline synthetic dataset.');

    // Reset backend database
    fetch('/api/telemetry/reset', { method: 'POST' }).catch(() => {});
  };


  // 15. Run Demo Scenarios (1 to 7)
  const runDemoScenario = (scenarioNum: number) => {
    switch (scenarioNum) {
      case 1:
        // Scenario 1: Facility predicted to run out of medicine within 48h
        setActiveTab('inventory');
        setSelectedFacilityId('FAC-01');
        setActiveScenarioMessage(
          'SCENARIO 1: PHC Paud has only 80 ORS sachets left (< 1.8 days of supply). High-severity stock-out alert triggered!'
        );
        break;

      case 2:
        // Scenario 2: Another facility has sufficient usable surplus
        setActiveTab('inventory');
        setSelectedFacilityId('FAC-02');
        setActiveScenarioMessage(
          'SCENARIO 2: CHC Haveli has 1,450 ORS sachets (+850 units usable surplus above its mandatory 7-day reserve).'
        );
        break;

      case 3:
        // Scenario 3: The system recommends a safe resource transfer
        setActiveTab('redistribution');
        setActiveScenarioMessage(
          'SCENARIO 3: Smart Redistribution Engine calculated safe transfer of 250 ORS from CHC Haveli to PHC Paud (22.4 km).'
        );
        break;

      case 4:
        // Scenario 4: Administrator approves and tracks transfer
        setActiveTab('redistribution');
        const rec = transfers.find((t) => t.status === 'RECOMMENDED' && t.medicineName.includes('ORS'));
        if (rec) {
          approveTransfer(rec.id);
          setActiveScenarioMessage(
            `SCENARIO 4: Transfer ${rec.id} approved! 250 ORS units locked as reserved at CHC Haveli. Ready for dispatch.`
          );
        } else {
          setActiveScenarioMessage('Transfer already approved or in dispatch.');
        }
        break;

      case 5:
        // Scenario 5: Inventory changes and shortage alerts recalculate
        setActiveTab('inventory');
        setSelectedFacilityId('FAC-01');
        const appTr = transfers.find(
          (t) => (t.status === 'APPROVED' || t.status === 'DISPATCHED') && t.medicineName.includes('ORS')
        );
        if (appTr) {
          receiveTransfer(appTr.id);
          setActiveScenarioMessage(
            'SCENARIO 5: Transfer received! PHC Paud stock jumped from 80 to 330 units (7.3 days safe). Shortage alert auto-cleared!'
          );
        } else {
          setActiveScenarioMessage('No approved transfer pending receipt. Run Scenario 4 first.');
        }
        break;

      case 6:
        // Scenario 6: Facility automatically flagged due to staffing or diagnostic issue
        setActiveTab('at-risk');
        setSelectedFacilityId('FAC-01');
        setActiveScenarioMessage(
          'SCENARIO 6: PHC Paud flagged with Critical Risk score (85/100) due to doctor deficit (2/5 present) and offline Malaria tests.'
        );
        break;

      case 7:
        // Scenario 7: Administrator assigns and resolves an intervention
        setActiveTab('at-risk');
        assignInterventionOfficer('FAC-01', 'Dr. S. Kulkarni (Dy. DHO)', 'Emergency mobile doctor dispatched from CHC Haveli.');
        setActiveScenarioMessage(
          'SCENARIO 7: Intervention assigned to Dr. S. Kulkarni. Mobile doctor roster deployed and logged to audit trail!'
        );
        break;

      default:
        break;
    }
  };

  const clearActiveScenarioMessage = () => setActiveScenarioMessage(null);

  // Provider Configuration & Model Discovery Handlers
  const updateProviderApiKey = (providerId: AIProviderName, apiKey: string, baseUrl?: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === providerId) {
          return {
            ...p,
            apiKey,
            baseUrl: baseUrl || p.baseUrl,
            status: apiKey.trim() || !p.requiresApiKey ? 'ONLINE' : 'UNCONFIGURED',
            lastTested: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    addAuditLog('PROVIDER_CONFIG_UPDATE', `Updated API credential and endpoint configuration for ${providerId}`);
  };

  const toggleProviderEnabled = (providerId: AIProviderName) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === providerId) {
          return { ...p, isEnabled: !p.isEnabled };
        }
        return p;
      })
    );
  };

  const refreshProviderModels = async () => {
    const newlyFound: AIModel[] = [];
    for (const p of providers) {
      if (p.isEnabled) {
        try {
          const discovered = await discoverLiveProviderModels(p.id, p.baseUrl, p.apiKey);
          if (discovered.length > 0) {
            newlyFound.push(...discovered);
          }
        } catch {
          // ignore
        }
      }
    }

    if (newlyFound.length > 0) {
      setAiModels((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const toAdd = newlyFound.filter((m) => !existingIds.has(m.id));
        return [...prev, ...toAdd];
      });
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }
  };

  const addCustomModel = (model: AIModel) => {
    setAiModels((prev) => [model, ...prev]);
    addAuditLog('CUSTOM_MODEL_REGISTERED', `Registered custom model ${model.displayName} (${model.provider})`);
  };

  // Chat Conversation Handlers
  const createNewConversation = (preferredLang?: string, modelId?: string): string => {
    const newId = `conv-${Date.now()}`;
    const newConvo: ChatConversation = {
      id: newId,
      title: 'New Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferredLanguage: preferredLang || globalLanguage.code,
      selectedModelId: modelId || defaultModelId,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Hello! I am **MediGrid Intelligence**. How can I assist you with clinical resources, facility forecasting, or operational logistics today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: defaultModelId,
          providerUsed: 'LocalRuleEngine',
          latencyMs: 10,
        },
      ],
    };
    setConversations((prev) => [newConvo, ...prev]);
    setCurrentConversationId(newId);
    return newId;
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fallbackId = `conv-${Date.now()}`;
        return [
          {
            id: fallbackId,
            title: 'New Inquiries',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            preferredLanguage: 'en',
            messages: [],
          },
        ];
      }
      return remaining;
    });
    if (currentConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining[0]) setCurrentConversationId(remaining[0].id);
    }
  };

  const addMessageToCurrentConversation = (message: ChatMessage) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConversationId) {
          const nextMessages = [...c.messages, message];
          let title = c.title;
          if (c.title === 'New Consultation' || c.title === 'New Inquiries') {
            const firstUser = nextMessages.find((m) => m.role === 'user');
            if (firstUser) {
              title = firstUser.content.slice(0, 36) + (firstUser.content.length > 36 ? '...' : '');
            }
          }
          return {
            ...c,
            title,
            updatedAt: new Date().toISOString(),
            messages: nextMessages,
          };
        }
        return c;
      })
    );
  };

  const updateMessageInCurrentConversation = (messageId: string, updates: Partial<ChatMessage>) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
          };
        }
        return c;
      })
    );
  };

  const clearCurrentConversation = () => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [],
          };
        }
        return c;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        facilities,
        inventory,
        transactions,
        footfalls,
        beds,
        doctors,
        patients,
        diagnostics,
        transfers,
        atRiskFacilities,
        alerts,
        auditLogs,

        language,
        setLanguage,
        userRole,
        setUserRole,
        selectedFacilityId,
        setSelectedFacilityId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isInsightsOpen,
        setIsInsightsOpen,
        activeTab,
        setActiveTab,

        // AI Model Hub & MediGrid Intelligence
        aiModels,
        providers,
        defaultModelId,
        setDefaultModelId,
        updateProviderApiKey,
        toggleProviderEnabled,
        refreshProviderModels,
        addCustomModel,

        // Global Multilingual & Accessibility
        globalLanguage,
        setGlobalLanguage,
        globalLanguages: GLOBAL_LANGUAGES,
        isHighContrast,
        setIsHighContrast,
        isLowBandwidth,
        setIsLowBandwidth,

        // Conversations
        conversations,
        currentConversationId,
        setCurrentConversationId,
        createNewConversation,
        deleteConversation,
        addMessageToCurrentConversation,
        updateMessageInCurrentConversation,
        clearCurrentConversation,

        recordMedicineConsumption,
        addMedicineStock,
        quarantineStock,

        approveTransfer,
        dispatchTransfer,
        receiveTransfer,
        rejectTransfer,

        recordFootfall,
        updateBedRecord,
        submitDoctorAttendanceRecord,
        registerPatient,
        updatePatientStatus,
        updateDiagnosticStatus,


        assignInterventionOfficer,
        resolveInterventionAction,
        acknowledgeAlertItem,
        resolveAlertItem,

        resetDemoData,
        runDemoScenario,
        activeScenarioMessage,
        clearActiveScenarioMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
