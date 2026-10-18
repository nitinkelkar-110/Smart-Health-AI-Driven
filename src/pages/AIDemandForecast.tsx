import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Building2,
  AlertTriangle,
  Info,
  Sliders,
  RotateCcw,
  Pill,
  Users,
  Bed,
  FlaskConical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { generateDemandForecast } from '../utils/engine';

export const AIDemandForecast: React.FC = () => {
  const { facilities, inventory, footfalls, beds, diagnostics } = useApp();

  // Forecast Horizon
  const [horizon, setHorizon] = useState<7 | 14 | 30>(14);

  // Category
  const [targetCategory, setTargetCategory] = useState<'MEDICINE' | 'PATIENTS' | 'BEDS' | 'DIAGNOSTICS'>('MEDICINE');

  // Selected Facility
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('FAC-01'); // Defaults to PHC Paud

  // Selected Item
  const [selectedMedicineName, setSelectedMedicineName] = useState<string>('Oral Rehydration Salts (ORS)');

  // Interactive What-If Simulation Sliders
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.2); // +20% monsoon surge default
  const [runRateAdjustment, setRunRateAdjustment] = useState<number>(0); // manual ± adjustment

  const selectedFacility = useMemo(() => {
    return facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
  }, [facilities, selectedFacilityId]);

  // Determine base run rate and current stock based on targetCategory
  const { baseRate, currentStock, unit, targetLabel } = useMemo(() => {
    if (targetCategory === 'MEDICINE') {
      const invItem = inventory.find(
        (i) => i.facilityId === selectedFacilityId && i.name.includes(selectedMedicineName.split(' ')[0])
      ) || inventory[0];

      return {
        baseRate: Math.max(1, invItem.averageDailyConsumption + runRateAdjustment),
        currentStock: invItem.usableStock,
        unit: invItem.unit,
        targetLabel: invItem.name,
      };
    } else if (targetCategory === 'PATIENTS') {
      const foot = footfalls.find((f) => f.facilityId === selectedFacilityId);
      const rate = foot ? Math.round(foot.totalPatients / 7) : 22;
      return {
        baseRate: Math.max(5, rate + runRateAdjustment),
        currentStock: selectedFacility.totalBeds * 15, // capacity proxy
        unit: 'patients/day',
        targetLabel: `${selectedFacility.name} Patient Admissions`,
      };
    } else if (targetCategory === 'BEDS') {
      const bed = beds.find((b) => b.facilityId === selectedFacilityId);
      return {
        baseRate: Math.max(1, (bed?.occupiedBeds || 6) + runRateAdjustment),
        currentStock: bed?.totalBeds || 12,
        unit: 'beds',
        targetLabel: `${selectedFacility.name} Inpatient Bed Census`,
      };
    } else {
      const diag = diagnostics.find((d) => d.facilityId === selectedFacilityId);
      return {
        baseRate: Math.max(1, (diag?.dailyTestsDone || 20) + runRateAdjustment),
        currentStock: 150, // reagent test buffer proxy
        unit: 'tests/day',
        targetLabel: `${selectedFacility.name} Diagnostic Reagent Run-rate`,
      };
    }
  }, [targetCategory, selectedFacilityId, selectedMedicineName, runRateAdjustment, inventory, footfalls, beds, diagnostics, selectedFacility]);

  // Compute forecast
  const forecast = useMemo(() => {
    return generateDemandForecast(
      targetLabel,
      targetCategory,
      selectedFacility,
      horizon,
      currentStock,
      baseRate,
      surgeMultiplier
    );
  }, [targetLabel, targetCategory, selectedFacility, horizon, currentStock, baseRate, surgeMultiplier]);

  // Format Recharts data combining history and projection
  const combinedChartData = useMemo(() => {
    const data: any[] = [];

    // Historical
    forecast.historicalTrend.forEach((h) => {
      data.push({
        date: h.date.slice(5),
        actual: h.actual,
        projected: null,
        confidenceUpper: null,
        confidenceLower: null,
      });
    });

    // Bridge point
    if (forecast.historicalTrend.length > 0 && forecast.projectedTrend.length > 0) {
      const lastHist = forecast.historicalTrend[forecast.historicalTrend.length - 1];
      data[data.length - 1].projected = lastHist.actual;
    }

    // Projected
    forecast.projectedTrend.forEach((p) => {
      data.push({
        date: p.date.slice(5),
        actual: null,
        projected: p.projected,
        confidenceUpper: p.confidenceUpper,
        confidenceLower: p.confidenceLower,
      });
    });

    return data;
  }, [forecast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Demand Forecast</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Deterministic Epidemiological Model
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            7, 14, and 30-day proactive demand anticipation incorporating clinical consumption velocity and seasonal factors.
          </p>
        </div>

        {/* Horizon Pill Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setHorizon(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              horizon === 7 ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => setHorizon(14)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              horizon === 14 ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Next 14 Days
          </button>
          <button
            onClick={() => setHorizon(30)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              horizon === 30 ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Next 30 Days
          </button>
        </div>
      </div>

      {/* Target Category & Facility Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTargetCategory('MEDICINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              targetCategory === 'MEDICINE'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Essential Medicines</span>
          </button>
          <button
            onClick={() => setTargetCategory('PATIENTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              targetCategory === 'PATIENTS'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Footfall</span>
          </button>
          <button
            onClick={() => setTargetCategory('BEDS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              targetCategory === 'BEDS'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Hospital Beds</span>
          </button>
          <button
            onClick={() => setTargetCategory('DIAGNOSTICS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              targetCategory === 'DIAGNOSTICS'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Diagnostic Tests</span>
          </button>
        </div>

        {/* Facility & Medicine Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.block})
                </option>
              ))}
            </select>
          </div>

          {targetCategory === 'MEDICINE' && (
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Pill className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={selectedMedicineName}
                onChange={(e) => setSelectedMedicineName(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="Oral Rehydration Salts (ORS)">Oral Rehydration Salts (ORS)</option>
                <option value="Paracetamol 500mg Tablets">Paracetamol 500mg Tablets</option>
                <option value="Amoxicillin 500mg Capsules">Amoxicillin 500mg Capsules</option>
                <option value="Anti-Rabies Vaccine (ARV)">Anti-Rabies Vaccine (ARV)</option>
                <option value="Iron Folic Acid (IFA) Tablets">Iron Folic Acid (IFA)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Forecast Metrics Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Current Stock / Buffer</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {currentStock.toLocaleString()} <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <span className="text-[11px] text-teal-600 font-medium">Verified usable stock</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">
            {horizon}-Day Projected Demand
          </span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-700">
            {forecast.projectedDemandTotal.toLocaleString()} <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <span className="text-[11px] text-slate-400">Cumulative estimated consumption</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Estimated Shortage Date</span>
          <div
            className={`mt-2 text-xl font-extrabold ${
              forecast.estimatedShortageDate ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {forecast.estimatedShortageDate ? forecast.estimatedShortageDate : 'No Shortage In Horizon'}
          </div>
          <span className="text-[11px] text-slate-400">
            {forecast.estimatedShortageDate ? 'Exhaustion threshold reached' : 'Current reserve sufficient'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Recommended Replenishment</span>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">
            {forecast.recommendedReplenishment.toLocaleString()} <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <span className="text-[11px] text-slate-400">Includes 20% safety margin</span>
        </div>
      </div>

      {/* Main Interactive Forecast Chart with Confidence Band */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Demand Forecast Trajectory: {targetLabel}
            </h2>
            <p className="text-xs text-slate-500">
              Past 7 days historical actuals (solid teal) &rarr; Next {horizon} days projected demand curve with upper/lower bounds.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3 h-0.5 bg-teal-600 inline-block"></span> Actual
            </span>
            <span className="flex items-center gap-1.5 font-medium text-indigo-700">
              <span className="w-3 h-0.5 bg-indigo-600 border-dashed border-t inline-block"></span> Projected
            </span>
            <span className="flex items-center gap-1.5 font-medium text-indigo-400">
              <span className="w-3 h-3 bg-indigo-100 rounded-sm inline-block"></span> 95% Confidence Band
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                dataKey="confidenceUpper"
                stroke="transparent"
                fill="url(#forecastBand)"
                name="Upper Bound (95%)"
              />
              <Area
                type="monotone"
                dataKey="confidenceLower"
                stroke="transparent"
                fill="#ffffff"
                name="Lower Bound (95%)"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0d9488' }}
                name="Historical Actual"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#4f46e5"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#4f46e5' }}
                name="AI Projected Demand"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Simulation Sliders & Mathematical Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive "What-If" Simulation Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Interactive "What-If" Simulation Parameters</h3>
            </div>
            <button
              onClick={() => {
                setSurgeMultiplier(1.05);
                setRunRateAdjustment(0);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Parameters</span>
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Adjust seasonal surge and clinic run-rate sliders below to immediately see real-time recalculations.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            {/* Surge Multiplier Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Seasonal Risk & Outbreak Factor:</span>
                <span className="text-teal-700 font-bold">
                  {((surgeMultiplier - 1) * 100).toFixed(0)}% Surge ({surgeMultiplier}x)
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.05"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>-20% Low Season</span>
                <span>Normal Baseline (1.0x)</span>
                <span>+100% Monsoon / Epidemic Surge</span>
              </div>
            </div>

            {/* Run Rate Adjustment Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Run-rate Adjustment:</span>
                <span className="text-indigo-700 font-bold">
                  {runRateAdjustment > 0 ? `+${runRateAdjustment}` : runRateAdjustment} {unit}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={runRateAdjustment}
                onChange={(e) => setRunRateAdjustment(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>-20 units</span>
                <span>0 (Default)</span>
                <span>+50 units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explainable Assumptions Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Explainable Mathematical Assumptions</h3>
          </div>
          <p className="text-xs text-slate-500">
            MediGrid AI uses transparent, deterministic statistical forecasting with seasonal adjustments.
          </p>

          <div className="space-y-2 pt-1">
            {forecast.assumptions.map((asm, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
                <span>{asm}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-xs text-teal-900 font-medium">
            <strong>Demonstration Example:</strong> &ldquo;{selectedFacility.name} may run out of {selectedMedicineName.split(' ')[0]} within{' '}
            {forecast.estimatedShortageDate ? '2 days' : 'the forecast horizon'} if current consumption rate continues.&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
};
