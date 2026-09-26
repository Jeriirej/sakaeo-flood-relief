import React, { useState } from 'react';
import { 
  Navigation, 
  Car, 
  Bike, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Phone, 
  Search, 
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { getGoogleMapsDirectionsUrl, getGoogleMapsViewUrl, formatThaiDateTime } from '../utils/geo';

export default function RoadList({ 
  floods = [], 
  onFocusOnMap 
}) {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredFloods = floods.filter(item => {
    if (districtFilter !== 'all' && item.district !== districtFilter) return false;
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDistrict = item.district?.toLowerCase().includes(q);
      const matchPassable = item.passableFor?.toLowerCase().includes(q);
      const matchRoute = item.recommendedRoute?.toLowerCase().includes(q);
      return matchTitle || matchDistrict || matchPassable || matchRoute;
    }
    return true;
  });

  const districts = ['ทั้งหมด', 'อรัญประเทศ', 'เมืองสระแก้ว', 'วังน้ำเย็น', 'วัฒนานคร', 'ตาพระยา', 'เขาฉกรรจ์', 'คลองหาด', 'วังสมบูรณ์', 'โคกสูง'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title & Guidance Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-amber-400" />
            <span>สรุปรายงานเส้นทางน้ำท่วม & เส้นทางเลี่ยง (จ.สระแก้ว)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            เช็กสภาพถนนก่อนออกเดินทาง มอเตอร์ไซค์และรถยนต์ควรหลีกเลี่ยงเส้นทางสีแดงและสีเหลือง
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500/40 text-red-300 font-medium">
            🔴 ทางขาด / ห้ามผ่าน
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 font-medium">
            🟡 รถเล็กโปรดเลี่ยง
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-medium">
            🟢 ทางเลี่ยงปลอดภัย
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                severityFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด ({floods.length})
            </button>
            <button
              onClick={() => setSeverityFilter('danger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                severityFilter === 'danger' ? 'bg-red-600 text-white font-bold' : 'text-red-400 hover:bg-red-950/40'
              }`}
            >
              ทางขาด ({floods.filter(f => f.severity === 'danger').length})
            </button>
            <button
              onClick={() => setSeverityFilter('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                severityFilter === 'warning' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              เฝ้าระวัง ({floods.filter(f => f.severity === 'warning').length})
            </button>
            <button
              onClick={() => setSeverityFilter('safe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                severityFilter === 'safe' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              ทางเลี่ยง ({floods.filter(f => f.severity === 'safe').length})
            </button>
          </div>

          {/* District selector */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {districts.map(d => (
              <option key={d} value={d === 'ทั้งหมด' ? 'all' : d}>
                {d === 'ทั้งหมด' ? '📍 ทุกอำเภอ' : `อ.${d}`}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อถนน, จุดน้ำท่วม, ทางเลี่ยง..."
            value={search}
            onChange={(e) => setSearchQuery ? setSearchQuery(e.target.value) : setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Roads List */}
      <div className="space-y-3">
        {filteredFloods.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            <p className="font-heading text-slate-300">ไม่พบข้อมูลเส้นทางตามเงื่อนไขที่เลือก</p>
          </div>
        ) : (
          filteredFloods.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all hover:border-slate-600 ${
                item.severity === 'danger'
                  ? 'border-red-500/50 hover:border-red-400'
                  : item.severity === 'warning'
                  ? 'border-amber-500/50 hover:border-amber-400'
                  : 'border-emerald-500/50 hover:border-emerald-400'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.severity === 'danger' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/40">
                        🔴 ทางขาด / ห้ามผ่านเด็ดขาด
                      </span>
                    )}
                    {item.severity === 'warning' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600/30 text-amber-300 border border-amber-500/40">
                        🟡 รถเล็กหลีกเลี่ยง / เฝ้าระวัง
                      </span>
                    )}
                    {item.severity === 'safe' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40">
                        🟢 เส้นทางเลี่ยงปลอดภัย
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      อ.{item.district} {item.subdistrict ? `ต.${item.subdistrict}` : ''}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto lg:ml-0">
                      <Clock className="w-3.5 h-3.5" />
                      {formatThaiDateTime(item.updatedAt)}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-white">
                    {item.title}
                  </h3>

                  {/* Level & Passable */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400">ระดับน้ำ: </span>
                      <strong className="text-rose-400">{item.waterLevel}</strong>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400">การสัญจร: </span>
                      <strong className="text-amber-300">{item.passableFor}</strong>
                    </div>
                  </div>

                  {/* Bypass Recommendation */}
                  {item.recommendedRoute && (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs">
                      <strong className="text-emerald-400 flex items-center gap-1.5 mb-0.5">
                        <Navigation className="w-3.5 h-3.5" /> เส้นทางเลี่ยงที่แนะนำ:
                      </strong>
                      <p className="text-emerald-200 leading-relaxed font-sans">
                        {item.recommendedRoute}
                      </p>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-400 font-sans">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Google Maps Button */}
                  <a
                    href={getGoogleMapsDirectionsUrl(item.lat, item.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs transition-transform active:scale-95 no-underline"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>เปิดนำทางใน Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>

                  {/* Focus on Web Map */}
                  <button
                    onClick={() => onFocusOnMap && onFocusOnMap(item)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-xl text-xs font-medium transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>ดูบนแผนที่เว็บ</span>
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
