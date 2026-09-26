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
  ShieldCheck,
  ShieldAlert,
  ArrowRight
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

      {/* Official Police Travel Advisory Section (ประชาสัมพันธ์เส้นทางเข้าสู่จังหวัดสระแก้ว) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Navigation className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ประกาศด่วน
                </span>
                <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                  เส้นทางเข้าสู่จังหวัดสระแก้ว
                </h3>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                โปรดตรวจสอบเส้นทางก่อนออกเดินทาง และขับขี่ด้วยความระมัดระวัง • ตำรวจภูธรจังหวัดสระแก้ว ห่วงใยประชาชน
              </p>
            </div>
          </div>
          <a
            href="tel:191"
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>สอบถามเส้นทาง / แจ้งเหตุ โทร. 191</span>
          </a>
        </div>

        {/* 2 Routes Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Route 1: กรุงเทพฯ -> สระแก้ว */}
          <div className="bg-slate-950/80 border border-red-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-sm sm:text-base text-white">
                    กรุงเทพฯ ➔ สระแก้ว
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  แนะนำเส้นทางเลี่ยง
                </span>
              </div>

              {/* Danger Warning Pill */}
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-red-300">หลีกเลี่ยงเด็ดขาด: </span>
                  <span className="text-red-200">สะพานข้ามคลองหันแดง (ทล.33 น้ำท่วมสูง ห้ามรถทุกชนิดผ่าน)</span>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/60 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>ใช้ทางหลวงหมายเลข 33 มุ่งหน้าจังหวัดปราจีนบุรี</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/60 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>ถึงแยกกบินทร์บุรี มุ่งหน้าแยกหนองสังข์</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/60 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>เลี้ยวซ้ายบริเวณข้างร้านสะดวกซื้อ 7-Eleven</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/60 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <span>ใช้เส้นทางหลวงชนบท <strong className="text-emerald-300">สท.3015 ➔ สท.3039 ➔ สท.4034</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/60 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                  <span>เดินทางเข้าสู่ สภ.เมืองสระแก้ว โดยปลอดภัย</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onFocusOnMap && onFocusOnMap({ lat: 13.7745, lng: 101.9632 })}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-700/50 text-red-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>ดูจุดสะพานคลองหันแดง</span>
              </button>
              <button
                onClick={() => onFocusOnMap && onFocusOnMap({ lat: 13.8450, lng: 102.0150 })}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                <span>ดูเส้นทางเลี่ยง</span>
              </button>
            </div>
          </div>

          {/* Route 2: จันทบุรี -> สระแก้ว */}
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-sm sm:text-base text-white">
                    จันทบุรี ➔ สระแก้ว
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  สัญจรได้ตามปกติ
                </span>
              </div>

              {/* Status Banner */}
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300">รถยนต์ขนาดเล็กเดินทางได้ตามปกติ: </span>
                  <span className="text-emerald-200">เส้นทางสัญจรปลอดภัย แต่ขอให้เพิ่มความระมัดระวัง</span>
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ใช้ <strong>ทางหลวงหมายเลข 317</strong> มุ่งหน้าสระแก้ว</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ผ่าน <strong>อำเภอสอยดาว</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ผ่าน <strong>อำเภอวังน้ำเย็น</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ผ่าน <strong>อำเภอเขาฉกรรจ์</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-cyan-300 font-semibold">เดินทางเข้าสู่จังหวัดสระแก้วโดยสวัสดิภาพ</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onFocusOnMap && onFocusOnMap({ lat: 13.5850, lng: 102.1200 })}
                className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>ดูแนวเส้นทาง ทล.317 บนแผนที่</span>
              </button>
            </div>
          </div>

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
