import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  RotateCcw,
  Plus,
  X,
  FileCheck2,
  Send,
  Eye,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FacilityMap } from '../components/FacilityMap';
import { RedistributionTransfer, TransferStatus } from '../types';

export const SmartResourceRedistribution: React.FC = () => {
  const {
    transfers,
    facilities,
    approveTransfer,
    dispatchTransfer,
    receiveTransfer,
    rejectTransfer,
    setActiveTab,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTransfer, setSelectedTransfer] = useState<RedistributionTransfer | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustedQty, setAdjustedQty] = useState<number>(100);

  // Filter transfers
  const filteredTransfers = transfers.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const pendingRecommendations = transfers.filter((t) => t.status === 'RECOMMENDED');
  const approvedTransfers = transfers.filter((t) => t.status === 'APPROVED');
  const inTransitTransfers = transfers.filter((t) => t.status === 'DISPATCHED');
  const receivedTransfers = transfers.filter((t) => t.status === 'RECEIVED');

  const handleOpenApproveModal = (t: RedistributionTransfer) => {
    setSelectedTransfer(t);
    setAdjustedQty(t.quantity);
    setShowAdjustModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Smart Resource Redistribution Engine
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Core Optimization Algorithm
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated surplus-to-deficit matching protecting minimum reserves and coordinating inter-facility clinical logistics.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('inventory')}
          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>View Inventory Levels &rarr;</span>
        </button>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Pending AI Recommendations</span>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">
            {pendingRecommendations.length}
          </div>
          <span className="text-[11px] text-teal-600 font-medium">Ready for DHO approval</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Approved for Dispatch</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-700">
            {approvedTransfers.length}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">Stock reserved at donor</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Transit (Ambulance)</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {inTransitTransfers.length}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">In transit between PHCs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Completed & Verified</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {receivedTransfers.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Stock credited & alert cleared</span>
        </div>
      </div>

      {/* GIS Interactive Transfer Routes Map */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Inter-Facility Transfer Logistics Map</h2>
            <p className="text-xs text-slate-500">Geospatial vector routes connecting surplus donor facilities to recipient clinics</p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Haversine Road Distance Calculation
          </span>
        </div>
        <FacilityMap facilities={facilities} transfers={transfers} height="320px" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'ALL'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Transfers ({transfers.length})
        </button>
        <button
          onClick={() => setStatusFilter('RECOMMENDED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'RECOMMENDED'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Recommended ({pendingRecommendations.length})
        </button>
        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'APPROVED'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Approved ({approvedTransfers.length})
        </button>
        <button
          onClick={() => setStatusFilter('DISPATCHED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'DISPATCHED'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          In Transit ({inTransitTransfers.length})
        </button>
        <button
          onClick={() => setStatusFilter('RECEIVED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'RECEIVED'
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed ({receivedTransfers.length})
        </button>
      </div>

      {/* Transfers Cards Grid */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No transfers found for the selected status.
          </div>
        ) : (
          filteredTransfers.map((tr) => {
            const isRec = tr.status === 'RECOMMENDED';
            const isApproved = tr.status === 'APPROVED';
            const isDispatched = tr.status === 'DISPATCHED';
            const isReceived = tr.status === 'RECEIVED';

            return (
              <div
                key={tr.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-5 space-y-4"
              >
                {/* Card Top Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      TR
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{tr.medicineName}</span>
                        <span className="font-mono text-[11px] text-slate-400">({tr.id})</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Created on {tr.createdTimestamp.slice(0, 16)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tr.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tr.priority} PRIORITY
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isReceived
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDispatched
                          ? 'bg-amber-100 text-amber-800'
                          : isApproved
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {tr.status}
                    </span>
                  </div>
                </div>

                {/* Transfer Route Details (Source & Destination) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                  {/* Source */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Donor Facility (Usable Surplus)
                    </span>
                    <span className="font-bold text-sm text-slate-900 mt-1 block">
                      {tr.sourceFacilityName}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                      Confirms safe reserve preserved
                    </span>
                  </div>

                  {/* Middle: Quantity & Distance */}
                  <div className="flex flex-col items-center justify-center text-center border-y md:border-y-0 md:border-x border-slate-200 py-2 md:py-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Transfer Allocation
                    </span>
                    <span className="text-lg font-black text-teal-700 mt-0.5">
                      {tr.quantity} {tr.unit}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{tr.distanceKm} km</span>
                      <span>•</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>~{tr.etaHours} hrs transit</span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Recipient Facility (Projected Deficit)
                    </span>
                    <span className="font-bold text-sm text-slate-900 mt-1 block">
                      {tr.destFacilityName}
                    </span>
                    <span className="text-[11px] text-red-600 font-semibold mt-0.5 block">
                      Shortage alleviated
                    </span>
                  </div>
                </div>

                {/* Explainability Statement */}
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-700">
                  <div className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Algorithmic Rationale & Clinical Validation:</span>
                  </div>
                  <p className="leading-relaxed text-slate-600 text-[11px]">{tr.reason}</p>
                </div>

                {/* Card Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="text-[11px] text-slate-400">
                    {tr.approvedBy && <span>Approved by: {tr.approvedBy} • </span>}
                    {tr.receivedBy && <span>Received by: {tr.receivedBy}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* RECOMMENDED State Actions */}
                    {isRec && (
                      <>
                        <button
                          onClick={() => rejectTransfer(tr.id, 'Declined by Administrator')}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleOpenApproveModal(tr)}
                          className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Lock Reserve</span>
                        </button>
                      </>
                    )}

                    {/* APPROVED State Actions */}
                    {isApproved && (
                      <button
                        onClick={() => dispatchTransfer(tr.id)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Ambulance Transport</span>
                      </button>
                    )}

                    {/* DISPATCHED State Actions */}
                    {isDispatched && (
                      <button
                        onClick={() => receiveTransfer(tr.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm Receipt & Update Stock</span>
                      </button>
                    )}

                    {/* RECEIVED State Status */}
                    {isReceived && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Transfer Completed & Audited</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Adjust Quantity / Approval Confirmation Modal */}
      {showAdjustModal && selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Approve Redistribution Transfer</h3>
                <p className="text-xs text-slate-500">{selectedTransfer.medicineName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="font-bold text-slate-900">{selectedTransfer.sourceFacilityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-slate-900">{selectedTransfer.destFacilityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Road Transit:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedTransfer.distanceKm} km (~{selectedTransfer.etaHours} hrs)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Approved Quantity ({selectedTransfer.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustedQty}
                  onChange={(e) => setAdjustedQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-teal-700 text-sm focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Algorithm suggested {selectedTransfer.quantity} {selectedTransfer.unit}. You can modify if needed.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  approveTransfer(selectedTransfer.id, adjustedQty);
                  setShowAdjustModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Confirm Approval & Reserve Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
