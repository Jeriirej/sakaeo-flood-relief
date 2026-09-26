import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Navigation, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { getGoogleMapsDirectionsUrl, getGoogleMapsViewUrl, formatThaiDateTime } from '../utils/geo';

export default function RescueDashboard({ 
  sosRequests = [], 
  rescueCenters = [],
  onUpdateStatus, 
  onFocusMapLocation 
}) {
  const [activeStatusFilter, setActiveStatusFilter] = useState('all'); // all, pending, in_progress, resolved
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Filtered requests (เฉพาะผู้ประสบภัย)
  const filteredList = sosRequests.filter(item => {
    if (activeStatusFilter !== 'all' && item.status !== activeStatusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchPhone = item.phone?.toLowerCase().includes(q);
      const matchAddress = item.address?.toLowerCase().includes(q);
      const matchRoute = item.accessRoute?.toLowerCase().includes(q);
      const matchNeeds = Array.isArray(item.urgentNeeds) 
        ? item.urgentNeeds.some(n => n.toLowerCase().includes(q))
        : item.urgentNeeds?.toLowerCase().includes(q);
      return matchName || matchPhone || matchAddress || matchRoute || matchNeeds;
    }
    return true;
  });

  const pendingCount = sosRequests.filter(r => r.status === 'pending').length;
  const inProgressCount = sosRequests.filter(r => r.status === 'in_progress').length;
  const resolvedCount = sosRequests.filter(r => r.status === 'resolved').length;

  const handleStatusChange = async (id, newStatus, currentAssignedTo) => {
    let assigned = currentAssignedTo;
    if (newStatus === 'in_progress' && !assigned) {
      const input = prompt('โปรดระบุชื่อทีมกู้ภัย / อาสาสมัคร ที่รับเคสนี้ (เช่น กู้ภัยสว่างสระแก้ว ชุดที่ 2):');
      if (input !== null) {
        assigned = input;
      }
    }

    setUpdatingId(id);
    try {
      await onUpdateStatus(id, newStatus, assigned);
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-800/50 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-950/60 shrink-0">
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-2xl text-white">
                ศูนย์กู้ภัยและจัดส่งความช่วยเหลือ จ.สระแก้ว
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40">
                Rescue Hub
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              รวบรวมฐานปฏิบัติการกู้ภัย และพิกัด GPS ผู้ประสบภัยที่ต้องการความช่วยเหลือ พร้อมปุ่มนำทางทันที
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="bg-slate-900/80 border border-rose-500/40 px-4 py-2.5 rounded-2xl flex-1 md:flex-none text-center">
            <div className="text-xl font-heading font-bold text-rose-400 animate-pulse">{pendingCount}</div>
            <div className="text-[11px] text-slate-400">รอความช่วยเหลือ</div>
          </div>
          <div className="bg-slate-900/80 border border-amber-500/40 px-4 py-2.5 rounded-2xl flex-1 md:flex-none text-center">
            <div className="text-xl font-heading font-bold text-amber-400">{inProgressCount}</div>
            <div className="text-[11px] text-slate-400">กำลังเดินทาง</div>
          </div>
          <div className="bg-slate-900/80 border border-emerald-500/40 px-4 py-2.5 rounded-2xl flex-1 md:flex-none text-center">
            <div className="text-xl font-heading font-bold text-emerald-400">{resolvedCount}</div>
            <div className="text-[11px] text-slate-400">ช่วยเหลือแล้ว</div>
          </div>
        </div>
      </div>

      {/* Official Rescue Operations Centers & Bases (ฐานกู้ภัยหลัก 24 ชม. - แยกต่างหากจากผู้ประสบภัย) */}
      {rescueCenters.length > 0 && (
        <div className="bg-slate-900/90 border border-blue-900/50 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <ShieldAlert className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <span>ฐานปฏิบัติการกู้ภัย & ศูนย์ประสานงานฉุกเฉิน (จ.สระแก้ว)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    เปิด 24 ชม.
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  ประชาชนหรืออาสาสมัครสามารถโทรขอกำลังเรือท้องแบน รถยกสูง หรือแจ้งขอความช่วยเหลือได้โดยตรง
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rescueCenters.map(rc => (
              <div 
                key={rc.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-bold text-sky-400">{rc.type}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      อ.{rc.district}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-white mt-1.5 leading-snug">
                    {rc.name}
                  </h4>

                  <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{rc.address}</span>
                  </p>

                  <div className="bg-slate-900/90 rounded-xl p-2.5 mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">ความพร้อม:</span>
                      <span className="text-emerald-400 font-bold">{rc.operatingHours}</span>
                    </div>
                    {rc.equipment && (
                      <div className="text-[11px]">
                        <span className="text-slate-400">ยุทโธปกรณ์:</span> {rc.equipment}
                      </div>
                    )}
                    {rc.services && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {rc.services.map((srv, idx) => (
                          <span key={idx} className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded-md">
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <a
                    href={`tel:${rc.phone}`}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow-md no-underline transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทร: {rc.phone}</span>
                  </a>

                  {onFocusMapLocation && (
                    <button
                      onClick={() => onFocusMapLocation(rc)}
                      className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>ดูบนแผนที่</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Victims SOS Queue Title */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
            <span>🚨 รายการขอความช่วยเหลือจากผู้ประสบภัย (SOS Queue)</span>
          </h3>
          <p className="text-xs text-slate-400">
            พิกัดประชาชนในพื้นที่ที่ส่งเรื่องขอความช่วยเหลือผ่านระบบ
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeStatusFilter === 'all'
                ? 'bg-slate-700 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด ({sosRequests.length})
          </button>

          <button
            onClick={() => setActiveStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeStatusFilter === 'pending'
                ? 'bg-red-600 text-white font-bold shadow'
                : 'text-red-400 hover:bg-red-950/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            รอช่วยด่วน ({pendingCount})
          </button>

          <button
            onClick={() => setActiveStatusFilter('in_progress')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeStatusFilter === 'in_progress'
                ? 'bg-amber-600 text-white font-bold shadow'
                : 'text-amber-400 hover:bg-amber-950/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            กำลังเข้าช่วย ({inProgressCount})
          </button>

          <button
            onClick={() => setActiveStatusFilter('resolved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeStatusFilter === 'resolved'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-emerald-400 hover:bg-emerald-950/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ช่วยเหลือแล้ว ({resolvedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, เบอร์, สิ่งที่ต้องการ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* SOS Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <ShieldAlert className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="font-heading font-medium text-lg text-slate-300">ไม่พบรายการขอความช่วยเหลือในหมวดนี้</p>
          <p className="text-xs text-slate-500 mt-1">
            หากมีผู้ประสบภัยแจ้งเหตุผ่านระบบ ข้อมูลและพิกัด GPS จะปรากฏที่นี่ทันที
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isUpdating = updatingId === item.id;
            const googleNavUrl = getGoogleMapsDirectionsUrl(item.lat, item.lng);

            return (
              <div 
                key={item.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                  item.status === 'pending'
                    ? 'border-red-500/60 shadow-red-950/20'
                    : item.status === 'in_progress'
                    ? 'border-amber-500/60 shadow-amber-950/20'
                    : 'border-emerald-500/40 bg-slate-900/60 opacity-80'
                }`}
              >
                {/* Top Status & Timestamp */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/50 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          รอความช่วยเหลือด่วน
                        </span>
                      )}
                      {item.status === 'in_progress' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600/30 text-amber-300 border border-amber-500/50 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          กำลังเข้าช่วยเหลือ
                        </span>
                      )}
                      {item.status === 'resolved' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ช่วยเหลือสำเร็จแล้ว
                        </span>
                      )}

                      {item.isSample && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ⚠️ ข้อมูลตัวอย่างทดสอบ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatThaiDateTime(item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Victim Details & Phone */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-rose-400" />
                        <span>ผู้ประสบภัย: <strong className="text-slate-200">{item.victimsCount || 'ไม่ระบุ'}</strong></span>
                      </div>
                    </div>

                    {/* Direct Call Button */}
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-md transition-transform active:scale-95 shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                      <span>โทร: {item.phone}</span>
                    </a>
                  </div>

                  {/* Urgent Needs Tags */}
                  {item.urgentNeeds && item.urgentNeeds.length > 0 && (
                    <div className="py-3 border-b border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                        <span>สิ่งที่ต้องการด่วน:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(item.urgentNeeds) ? item.urgentNeeds : [item.urgentNeeds]).map((need, i) => (
                          <span 
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-950/60 border border-rose-500/40 text-rose-200"
                          >
                            ⚠️ {need}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Access Route & Navigation Description */}
                  <div className="py-3 space-y-2 border-b border-slate-800 text-xs">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>เส้นทางเข้าถึง / คำแนะนำสำหรับกู้ภัย:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        {item.accessRoute}
                      </p>
                    </div>

                    {item.address && (
                      <p className="text-slate-400 text-[11px]">
                        <strong>ที่อยู่/จุดสังเกต:</strong> {item.address}
                      </p>
                    )}

                    {item.assignedTo && (
                      <div className="bg-blue-950/40 border border-blue-800/40 p-2 rounded-lg text-blue-200 text-xs flex items-center gap-2">
                        <span className="font-bold">ทีมที่รับผิดชอบ:</span> {item.assignedTo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: GOOGLE MAPS NAVIGATION & STATUS UPDATER */}
                <div className="pt-4 space-y-2">
                  
                  {/* Primary Button: Open in Google Maps */}
                  <a
                    href={googleNavUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-950/60 text-sm transition-all transform active:scale-95 no-underline border border-indigo-400/40"
                  >
                    <Navigation className="w-5 h-5 text-cyan-300" />
                    <span>ส่งพิกัดเข้า Google Maps นำทางทันที 🧭</span>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                  </a>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-[11px] text-slate-400 shrink-0">เปลี่ยนสถานะ:</span>
                    
                    {item.status !== 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'in_progress', item.assignedTo)}
                        disabled={isUpdating}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 font-semibold transition-colors"
                      >
                        รับเคส / กำลังเดินทาง
                      </button>
                    )}

                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'resolved', item.assignedTo)}
                        disabled={isUpdating}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 font-semibold transition-colors"
                      >
                        ช่วยเหลือเสร็จสิ้น
                      </button>
                    )}

                    {item.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'pending', '')}
                        disabled={isUpdating}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium"
                        title="ย้อนกลับเป็นรอความช่วยเหลือ"
                      >
                        รีเซ็ต
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
