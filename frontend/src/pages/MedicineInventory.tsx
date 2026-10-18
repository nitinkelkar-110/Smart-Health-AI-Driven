import React, { useState } from 'react';
import {
  Pill,
  Search,
  Plus,
  Minus,
  Download,
  AlertTriangle,
  Clock,
  History,
  ShieldAlert,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n';
import { MedicineItem, MedicineCategory, AlertSeverity } from '../types';

export const MedicineInventory: React.FC = () => {
  const {
    inventory,
    facilities,
    transactions,
    recordMedicineConsumption,
    addMedicineStock,
    quarantineStock,
    selectedFacilityId,
    setSelectedFacilityId,
    language,
    setActiveTab,
  } = useApp();

  const t = getTranslation(language);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [showQuarantineModal, setShowQuarantineModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MedicineItem | null>(null);

  // Form State
  const [formQuantity, setFormQuantity] = useState<number>(50);
  const [formBatch, setFormBatch] = useState<string>('');
  const [formExpiry, setFormExpiry] = useState<string>('2027-10-15');
  const [formNotes, setFormNotes] = useState<string>('');

  // Extract categories
  const categories: MedicineCategory[] = [
    'Essential',
    'Antibiotic',
    'Maternal & Child',
    'Emergency',
    'Chronic Care',
    'Vaccine',
    'IV Fluids',
  ];

  // Filter Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFacility =
      selectedFacilityId === 'ALL' || item.facilityId === selectedFacilityId;

    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;

    const matchesSeverity =
      severityFilter === 'ALL' || item.alertSeverity === severityFilter;

    return matchesSearch && matchesFacility && matchesCategory && matchesSeverity;
  });

  // KPI calculations
  const totalUsableUnits = filteredInventory.reduce((acc, i) => acc + i.usableStock, 0);
  const criticalShortages = filteredInventory.filter(
    (i) => i.alertSeverity === 'CRITICAL' || i.alertSeverity === 'HIGH'
  ).length;
  const expiredOrQuarantined = filteredInventory.reduce((acc, i) => acc + i.quarantinedStock, 0);

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'Medicine Name',
      'Generic Name',
      'Category',
      'Facility',
      'Usable Stock',
      'Quarantined Stock',
      'Reserved Transfer',
      'Daily Usage',
      'Days Left',
      'Min Threshold',
      'Expiry Date',
      'Batch',
      'Severity',
      'Alert Reason',
    ];

    const rows = filteredInventory.map((item) => [
      `"${item.name}"`,
      `"${item.genericName}"`,
      `"${item.category}"`,
      `"${item.facilityName}"`,
      item.usableStock,
      item.quarantinedStock,
      item.reservedForTransfer,
      item.averageDailyConsumption,
      item.daysUntilStockOut,
      item.minimumThreshold,
      item.expiryDate,
      `"${item.batchNumber}"`,
      `"${item.alertSeverity}"`,
      `"${item.alertReason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medigrid_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenConsume = (item: MedicineItem) => {
    setSelectedItem(item);
    setFormQuantity(item.averageDailyConsumption || 10);
    setFormNotes(`Routine clinic dispensing for ${item.facilityName}`);
    setShowConsumeModal(true);
  };

  const handleOpenAdd = (item?: MedicineItem) => {
    setSelectedItem(item || filteredInventory[0] || null);
    setFormQuantity(200);
    setFormBatch(`BATCH-${Date.now().toString().slice(-4)}`);
    setFormExpiry('2027-12-31');
    setFormNotes('Central warehouse restocking supply');
    setShowAddModal(true);
  };

  const handleOpenQuarantine = (item: MedicineItem) => {
    setSelectedItem(item);
    setFormQuantity(10);
    setFormNotes('Packaging damaged or cold-chain temperature excursion');
    setShowQuarantineModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.navMedicineInventory}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-facility medicine stock ledger, consumption tracking, and shortage warnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit History ({transactions.length})</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.actionExportCSV}</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.actionAddStock}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Filtered Records</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{filteredInventory.length}</div>
          <span className="text-[11px] text-slate-400">Medicines Monitored</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Usable Units</span>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">
            {totalUsableUnits.toLocaleString()}
          </div>
          <span className="text-[11px] text-teal-600">Available across centres</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Urgent Shortage Risks</span>
          <div className="mt-2 text-2xl font-extrabold text-red-600">{criticalShortages}</div>
          <span className="text-[11px] text-red-500 font-medium">&lt; 3 days buffer</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Quarantined / Damaged</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-700">{expiredOrQuarantined}</div>
          <span className="text-[11px] text-slate-400">Excluded from usable stock</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by medicine name, generic name, batch, or facility..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Facility:</span>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Facilities (12)</option>
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Alert:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (&le; 1.5 days)</option>
              <option value="HIGH">High (&le; 3 days)</option>
              <option value="MEDIUM">Medium (&le; 7 days)</option>
              <option value="LOW">Low (Below threshold)</option>
              <option value="NORMAL">Normal Buffer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Medicine & Details</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Usable Stock</th>
                <th className="py-3 px-4">Daily Run-rate</th>
                <th className="py-3 px-4">Stock-Out Est.</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Alert Severity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No medicine inventory records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isCritical = item.alertSeverity === 'CRITICAL';
                  const isHigh = item.alertSeverity === 'HIGH';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isCritical ? 'bg-red-50/20' : isHigh ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.genericName} • <span className="font-mono">{item.batchNumber}</span>
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.facilityName}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-extrabold text-sm text-slate-900">
                          {item.usableStock.toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">{item.unit}</span>
                        {item.quarantinedStock > 0 && (
                          <div className="text-[10px] text-red-500">
                            ({item.quarantinedStock} quarantined)
                          </div>
                        )}
                        {item.reservedForTransfer > 0 && (
                          <div className="text-[10px] text-teal-600 font-medium">
                            ({item.reservedForTransfer} reserved transfer)
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {item.averageDailyConsumption} {item.unit}/day
                      </td>

                      <td className="py-3 px-4">
                        <div
                          className={`font-extrabold text-sm ${
                            isCritical
                              ? 'text-red-600 animate-pulse'
                              : isHigh
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.daysUntilStockOut} Days
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {item.daysUntilStockOut <= 1
                            ? '< 24 Hours!'
                            : item.daysUntilStockOut <= 3
                            ? 'Urgent Reorder'
                            : 'Stable'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {item.minimumThreshold} {item.unit}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{item.expiryDate}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCritical
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isHigh
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : item.alertSeverity === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.alertSeverity === 'LOW'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {item.alertSeverity}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[180px]" title={item.alertReason}>
                            {item.alertReason}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Record Daily Consumption Button */}
                          <button
                            onClick={() => handleOpenConsume(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Record Dispensing / Consumption"
                          >
                            <Minus className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          {/* Add Stock Button */}
                          <button
                            onClick={() => handleOpenAdd(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Add Incoming Stock Batch"
                          >
                            <Plus className="w-3.5 h-3.5 text-teal-600" />
                          </button>

                          {/* Quarantine Damaged Button */}
                          <button
                            onClick={() => handleOpenQuarantine(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
                            title="Quarantine Damaged/Expired Stock"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL 1: Record Consumption */}
      {showConsumeModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Medicine Dispensing</h3>
                <p className="text-xs text-slate-500">{selectedItem.name} • {selectedItem.facilityName}</p>
              </div>
              <button onClick={() => setShowConsumeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Quantity Dispensed ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.usableStock}
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-hidden focus:border-teal-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Current Usable: {selectedItem.usableStock} {selectedItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Notes / Prescription Registry</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Daily OPD dispensing batch..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowConsumeModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  recordMedicineConsumption(selectedItem.id, formQuantity, formNotes);
                  setShowConsumeModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
              >
                Deduct & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Incoming Stock */}
      {showAddModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Incoming Supply</h3>
                <p className="text-xs text-slate-500">{selectedItem.name} • {selectedItem.facilityName}</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Quantity Received ({selectedItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Batch Number</label>
                <input
                  type="text"
                  value={formBatch}
                  onChange={(e) => setFormBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Supplier / Delivery Challan</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addMedicineStock(selectedItem.id, formQuantity, formBatch, formExpiry, formNotes);
                  setShowAddModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quarantine Damaged / Expired */}
      {showQuarantineModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Quarantine Stock</h3>
                <p className="text-xs text-slate-500">Excludes non-usable stock from calculations</p>
              </div>
              <button onClick={() => setShowQuarantineModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Quantity to Quarantine ({selectedItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.usableStock}
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-red-600 text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Reason for Quarantine</label>
                <select
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                >
                  <option value="Packaging damaged or contaminated">Packaging damaged or contaminated</option>
                  <option value="Batch expired during storage">Batch expired during storage</option>
                  <option value="Cold-chain temperature excursion">Cold-chain temperature excursion</option>
                  <option value="Recalled by Drug Controller Authority">Recalled by Drug Controller Authority</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowQuarantineModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  quarantineStock(selectedItem.id, formQuantity, formNotes);
                  setShowQuarantineModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
              >
                Confirm Quarantine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Transaction History Drawer */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Inventory Transaction History</h3>
                <p className="text-xs text-slate-500">Immutable ledger of dispensings, deliveries, and inter-facility transfers</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No inventory transactions logged yet. Use the action buttons above to record consumption or incoming stock.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 text-xs flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.type === 'TRANSFER_IN' || tx.type === 'STOCK_ADD'
                              ? 'bg-teal-100 text-teal-800'
                              : tx.type === 'DAMAGE_WRITE_OFF'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <span className="font-bold text-slate-900">{tx.medicineName}</span>
                        <span className="text-slate-400">({tx.facilityName})</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{tx.notes}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm text-slate-900 block">
                        {tx.type === 'CONSUMPTION' || tx.type === 'TRANSFER_OUT' ? '-' : '+'}
                        {tx.quantity}
                      </span>
                      <span className="text-[10px] text-slate-400">{tx.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
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
