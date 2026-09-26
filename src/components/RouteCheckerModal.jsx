import React, { useState } from 'react';
import { 
  X, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  Car, 
  ExternalLink 
} from 'lucide-react';
import { getGoogleMapsDirectionsUrl } from '../utils/geo';

const DISTRICT_COORDS = {
  'เมืองสระแก้ว': { lat: 13.8143, lng: 102.0722 },
  'อรัญประเทศ': { lat: 13.6930, lng: 102.5030 },
  'วัฒนานคร': { lat: 13.7480, lng: 102.3150 },
  'วังน้ำเย็น': { lat: 13.5020, lng: 102.1780 },
  'ตาพระยา': { lat: 14.0040, lng: 102.8050 },
  'เขาฉกรรจ์': { lat: 13.6550, lng: 102.0300 },
  'คลองหาด': { lat: 13.4500, lng: 102.3100 },
  'วังสมบูรณ์': { lat: 13.3800, lng: 102.1500 },
  'โคกสูง': { lat: 13.8300, lng: 102.6100 }
};

export default function RouteCheckerModal({ isOpen, onClose, floods = [] }) {
  const [origin, setOrigin] = useState('เมืองสระแก้ว');
  const [destination, setDestination] = useState('อรัญประเทศ');
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  const districts = Object.keys(DISTRICT_COORDS);

  // Analyze potential hazards between origin and destination
  const getRouteHazards = () => {
    // Collect hazards related to origin or destination or corridor
    const hazards = floods.filter(f => {
      const matchOrigin = f.district === origin;
      const matchDest = f.district === destination;
      // Between Mueang and Aranyaprathet passes through Watthana Nakhon
      const isCorridor = (origin === 'เมืองสระแก้ว' && destination === 'อรัญประเทศ') || 
                         (origin === 'อรัญประเทศ' && destination === 'เมืองสระแก้ว');
      const inBetween = isCorridor && f.district === 'วัฒนานคร';
      return matchOrigin || matchDest || inBetween;
    });

    const dangerPoints = hazards.filter(h => h.severity === 'danger');
    const warningPoints = hazards.filter(h => h.severity === 'warning');
    const safePoints = floods.filter(f => f.severity === 'safe');

    return { dangerPoints, warningPoints, safePoints, totalHazards: dangerPoints.length + warningPoints.length };
  };

  const handleCheck = () => {
    setChecked(true);
  };

  const { dangerPoints, warningPoints, safePoints, totalHazards } = getRouteHazards();
  const destCoord = DISTRICT_COORDS[destination] || DISTRICT_COORDS['อรัญประเทศ'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Navigation className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                เช็กความปลอดภัยเส้นทางก่อนเดินทาง
              </h3>
              <p className="text-xs text-blue-200">
                ตรวจสอบจุดน้ำท่วมและคำนวณทางเลี่ยงระหว่างอำเภอในสระแก้ว
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Origin and Destination Selection */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>จุดเริ่มต้น (ต้นทาง)</span>
                </label>
                <select
                  value={origin}
                  onChange={(e) => { setOrigin(e.target.value); setChecked(false); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {districts.map(d => (
                    <option key={d} value={d}>อ.{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>จุดหมายปลายทาง</span>
                </label>
                <select
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setChecked(false); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {districts.map(d => (
                    <option key={d} value={d} disabled={d === origin}>อ.{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheck}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>กดตรวจสอบความปลอดภัยเส้นทางนี้</span>
            </button>
          </div>

          {/* Results Analysis */}
          {checked && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              {totalHazards > 0 ? (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 space-y-2">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                    <span>⚠️ ตรวจพบจุดน้ำท่วม {totalHazards} จุดบนเส้นทางนี้!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    มีมวลน้ำท่วมขังและเส้นทางขาดในเส้นทางระหว่าง <strong>อ.{origin} ➡️ อ.{destination}</strong> โดยเฉพาะรถเล็กและจักรยานยนต์โปรดระมัดระวังสูงสุด
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>เส้นทางนี้ปลอดภัยในเบื้องต้น</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    ไม่พบรายงานน้ำท่วมวิกฤตบนเส้นทางหลัก สามารถสัญจรได้ด้วยความระมัดระวังตามปกติ
                  </p>
                </div>
              )}

              {/* Danger list */}
              {dangerPoints.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                    🔴 จุดที่ห้ามผ่านเด็ดขาด ({dangerPoints.length} จุด):
                  </span>
                  {dangerPoints.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-950 border border-red-500/30 text-xs space-y-1">
                      <div className="font-bold text-white">{p.title}</div>
                      <div className="text-rose-400 font-medium">ระดับน้ำ: {p.waterLevel} ({p.passableFor})</div>
                      {p.recommendedRoute && (
                        <div className="text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/30 text-[11px]">
                          💡 แนะนำ: {p.recommendedRoute}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Warning list */}
              {warningPoints.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    🟡 จุดน้ำท่วมขัง รถเล็กควรเลี่ยง ({warningPoints.length} จุด):
                  </span>
                  {warningPoints.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-1">
                      <div className="font-bold text-white">{p.title}</div>
                      <div className="text-amber-300">{p.waterLevel} - {p.passableFor}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Button */}
              <div className="pt-2">
                <a
                  href={getGoogleMapsDirectionsUrl(destCoord.lat, destCoord.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 no-underline"
                >
                  <Navigation className="w-4 h-4 text-cyan-300" />
                  <span>เปิด Google Maps เพื่อเริ่มการนำทางเลี่ยงน้ำท่วม</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
