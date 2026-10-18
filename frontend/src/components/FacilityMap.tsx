import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { HealthFacility, RedistributionTransfer } from '../types';

interface FacilityMapProps {
  facilities: HealthFacility[];
  transfers?: RedistributionTransfer[];
  selectedFacilityId?: string;
  onSelectFacility?: (id: string) => void;
  height?: string;
}

// Custom SVG Icons for Leaflet markers
const createMarkerIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 11px;
        cursor: pointer;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export const FacilityMap: React.FC<FacilityMapProps> = ({
  facilities,
  transfers = [],
  selectedFacilityId,
  onSelectFacility,
  height = '420px',
}) => {
  // Center roughly on Pune District Rural
  const defaultCenter: [number, number] = [18.5204, 73.8567];

  const getValidCoords = (fac: any): [number, number] | null => {
    if (!fac) return null;
    const lat =
      typeof fac.lat === 'number' && !isNaN(fac.lat)
        ? fac.lat
        : typeof fac.latitude === 'number' && !isNaN(fac.latitude)
        ? fac.latitude
        : null;
    const lng =
      typeof fac.lng === 'number' && !isNaN(fac.lng)
        ? fac.lng
        : typeof fac.longitude === 'number' && !isNaN(fac.longitude)
        ? fac.longitude
        : null;

    if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lat, lng];
    }
    return null;
  };

  const getStatusColor = (status: HealthFacility['status']) => {
    switch (status) {
      case 'CRITICAL_INTERVENTION':
        return '#ef4444'; // Red
      case 'NEEDS_ATTENTION':
        return '#f59e0b'; // Amber
      case 'OPERATIONAL':
      default:
        return '#0d9488'; // Teal
    }
  };

  // Find facility coords map
  const coordsMap = new Map<string, [number, number]>();
  facilities.forEach((f) => {
    const coords = getValidCoords(f);
    if (coords) coordsMap.set(f.id, coords);
  });

  // Active transfer routes to draw on the map
  const activeRoutes = transfers
    .filter((t) => t.status === 'RECOMMENDED' || t.status === 'APPROVED' || t.status === 'DISPATCHED')
    .map((t) => {
      const src = coordsMap.get(t.sourceFacilityId);
      const dst = coordsMap.get(t.destFacilityId);
      if (src && dst) {
        return {
          id: t.id,
          positions: [src, dst] as [[number, number], [number, number]],
          transfer: t,
        };
      }
      return null;
    })
    .filter(Boolean) as {
    id: string;
    positions: [[number, number], [number, number]];
    transfer: RedistributionTransfer;
  }[];

  return (
    <div style={{ height, width: '100%', position: 'relative' }} className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Transfer Route Polylines */}
        {activeRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions}
            pathOptions={{
              color: route.transfer.status === 'APPROVED' ? '#0284c7' : '#f59e0b',
              weight: 3,
              dashArray: '6, 8',
              opacity: 0.8,
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className="font-semibold text-slate-800">
                  {route.transfer.status === 'APPROVED' ? 'Approved Transfer' : 'Recommended Transfer'}
                </span>
                <p className="mt-1 text-slate-600">
                  <strong>{route.transfer.medicineName}</strong>: {route.transfer.quantity} {route.transfer.unit}
                </p>
                <p className="text-slate-500">
                  {route.transfer.sourceFacilityName} &rarr; {route.transfer.destFacilityName}
                </p>
                <p className="text-slate-400 mt-1">
                  Distance: {route.transfer.distanceKm} km • ETA: ~{route.transfer.etaHours} hrs
                </p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Health Centre Markers */}
        {facilities.map((fac) => {
          const coords = getValidCoords(fac);
          if (!coords) return null;
          const isSelected = selectedFacilityId === fac.id;
          const color = isSelected ? '#4338ca' : getStatusColor(fac.status);
          const label = fac.type === 'PHC' ? 'P' : 'C';

          return (
            <Marker
              key={fac.id}
              position={coords}
              icon={createMarkerIcon(color, label)}
              eventHandlers={{
                click: () => onSelectFacility && onSelectFacility(fac.id),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                    <span className="font-bold text-sm text-slate-900">{fac.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        fac.status === 'CRITICAL_INTERVENTION'
                          ? 'bg-red-100 text-red-700'
                          : fac.status === 'NEEDS_ATTENTION'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {fac.type}
                    </span>
                  </div>
                  <div className="mt-2 text-xs space-y-1 text-slate-600">
                    <div>
                      <span className="text-slate-400">Block:</span> {fac.block}
                    </div>
                    <div>
                      <span className="text-slate-400">Total Beds:</span> {fac.totalBeds}
                    </div>
                    <div>
                      <span className="text-slate-400">Population:</span>{' '}
                      {fac.populationServed.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-slate-400">Contact:</span> {fac.contactPerson}
                    </div>
                    <div className="pt-1">
                      <span className="font-medium text-slate-700">Health Index:</span>{' '}
                      <span className="font-semibold text-teal-600">{fac.operationalScore}/100</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-slate-200/80 z-[1000] text-xs flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
          <span className="text-slate-600 font-medium">Operational</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Needs Attention</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Critical Intervention</span>
        </div>
        {activeRoutes.length > 0 && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-sky-600 inline-block"></span>
            <span className="text-slate-600 font-medium">Active Transfer Route</span>
          </div>
        )}
      </div>
    </div>
  );
};
