import React, { useMemo, useState } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Phone, 
  Clock, 
  MapPin, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  HeartPulse, 
  LifeBuoy, 
  Navigation
} from 'lucide-react';
import { getLocalOfficialsForSos, PROVINCIAL_EMERGENCY_HOTLINES, SAKAEO_DISTRICTS } from '../utils/districtContacts';
import { formatThaiDateTime } from '../utils/geo';

export default function SosOverdueModal({ 
  isOpen, 
  onClose, 
  mySos, 
  onResolve, 
  onOpenSosModal 
}) {
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // คำนวณระยะเวลาที่รอมาแล้ว
  const timeDiff = useMemo(() => {
    if (!mySos || !mySos.createdAt) return { hours: 5, minutes: 0 };
    const diffMs = Math.max(0, Date.now() - new Date(mySos.createdAt).getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }, [mySos?.createdAt]);

  // ดึงเบอร์เจ้าหน้าที่ในพื้นที่ (รองรับการสลับดูอำเภออื่นได้ทันที)
  const localData = useMemo(() => {
    if (!mySos) return getLocalOfficialsForSos({ district: selectedDistrict || 'เมืองสระแก้ว' });
    const targetSos = selectedDistrict ? { ...mySos, district: selectedDistrict } : mySos;
    return getLocalOfficialsForSos(targetSos);
  }, [mySos, selectedDistrict]);

  const handleResolveSafe = () => {
    if (!mySos) return;
    const ok = window.confirm('คุณได้รับการช่วยเหลือหรือปลอดภัยแล้วใช่หรือไม่? (ระบบจะปิดการแจ้งเตือนนี้อย่างถาวร)');
    if (ok) {
      if (onResolve) onResolve(mySos.id, 'resolved');
      onClose();
    }
  };

  if (!isOpen || !mySos) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border-2 border-rose-500/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100 font-sans"
        style={{ fontFamily: "'Prompt', sans-serif" }}
      >
        {/* Top Emergency Pulse Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse shrink-0" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-4 sm:p-5 border-b border-rose-900/60 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center shrink-0 text-rose-400 mt-0.5 shadow-lg shadow-rose-950/60">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  เตือนภัยฉุกเฉิน (รอเกิน 5 ชม.)
                </span>
                <span className="text-xs text-rose-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  รอมาแล้ว {timeDiff.hours} ชม. {timeDiff.minutes > 0 ? `${timeDiff.minutes} นาที` : ''}
                </span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white mt-1 leading-snug">
                ยังไม่ได้รับการช่วยเหลือใช่ไหม? โทรหาเจ้าหน้าที่ด่วน
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                คำขอ SOS ของคุณถูกส่งเข้าสู่ระบบแล้ว หากสถานการณ์เริ่มวิกฤต หรือระดับน้ำสูงขึ้น แนะนำให้กดโทรติดต่อเจ้าหน้าที่ในพื้นที่ของคุณโดยตรงทันที
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
            title="ปิดหน้าต่างนี้ (เพื่อดูสถานการณ์ต่อ)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Quick Recap of My SOS */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">คำขอของคุณ: <strong className="text-white">{mySos.name}</strong> ({mySos.phone})</span>
              <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                สถานะ: {mySos.status === 'in_progress' ? 'กำลังประสานงานช่วยเหลือ' : 'รอการตอบรับ'}
              </span>
            </div>
            <div className="text-slate-300">
              📍 พื้นที่: <strong>{localData.districtName}</strong> {mySos.address ? `• ${mySos.address}` : ''}
            </div>
            {mySos.urgentNeeds?.length > 0 && (
              <div className="text-amber-200">
                🚨 สิ่งที่ต้องการ: {Array.isArray(mySos.urgentNeeds) ? mySos.urgentNeeds.join(', ') : mySos.urgentNeeds}
              </div>
            )}
          </div>

          {/* Section 1: Local Officials for this District */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <h4 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>เบอร์โทรเจ้าหน้าที่ ({localData.districtName})</span>
              </h4>
              
              {/* Dropdown สลับดูเบอร์อำเภออื่นได้ทันที */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-[11px] text-slate-400">สลับดูอำเภออื่น:</span>
                <select
                  value={selectedDistrict || localData.districtName}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-slate-800 text-rose-300 font-bold border border-rose-500/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-rose-400 cursor-pointer shadow"
                >
                  {SAKAEO_DISTRICTS.map(d => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      อ.{d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {localData.contacts.map((contact, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs sm:text-sm truncate">
                      {contact.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {contact.role}
                    </div>
                  </div>

                  <a
                    href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-lg shadow-emerald-950/40 transition-transform active:scale-95 no-underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทร {contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Provincial Emergency Hotlines (24 Hours) */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white flex items-center gap-1.5 mb-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span>สายด่วนฉุกเฉินหลัก (โทรฟรีตลอด 24 ชั่วโมง)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1669 Hotline Button (Most Prominent) */}
              <a
                href="tel:1669"
                className="col-span-1 sm:col-span-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xl transition-transform active:scale-98 no-underline border border-red-400/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="font-black text-base leading-tight">สายด่วนการแพทย์ฉุกเฉิน 1669</div>
                    <div className="text-xs text-rose-100">รถพยาบาลฉุกเฉิน • เรือพยาบาล • โทรฟรี 24 ชม.</div>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white text-red-600 font-black text-xs shrink-0 shadow">
                  กดโทร 1669
                </div>
              </a>

              {/* กู้ภัยสว่างสระแก้ว & ปภ. */}
              <a
                href="tel:037241090"
                className="bg-slate-800/90 hover:bg-slate-750 border border-slate-700 p-3 rounded-2xl flex items-center justify-between no-underline text-white active:scale-95 transition-transform"
              >
                <div>
                  <div className="font-bold text-xs">กู้ภัยสว่างสระแก้วธรรมสถาน</div>
                  <div className="text-[11px] text-slate-400">เรือท้องแบน • ทีมประดาน้ำ</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                  037-241-090
                </span>
              </a>

              <a
                href="tel:1784"
                className="bg-slate-800/90 hover:bg-slate-750 border border-slate-700 p-3 rounded-2xl flex items-center justify-between no-underline text-white active:scale-95 transition-transform"
              >
                <div>
                  <div className="font-bold text-xs">สายด่วน ปภ. ภัยพิบัติ 1784</div>
                  <div className="text-[11px] text-slate-400">ศูนย์เตือนภัยและอพยพ 24 ชม.</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                  1784
                </span>
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950/95 p-3.5 sm:p-4 border-t border-slate-800 flex flex-col gap-2 shrink-0">
          
          {/* ปุ่มหลัก: ได้รับการช่วยเหลือแล้ว / ปลอดภัยแล้ว */}
          <button
            type="button"
            onClick={handleResolveSafe}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 active:scale-[0.98]"
            title="กดเมื่อได้รับการช่วยเหลือแล้ว เพื่อไม่ให้ระบบแจ้งเตือนอีก"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>ได้รับการช่วยเหลือแล้ว / ปลอดภัยแล้ว (หยุดการแจ้งเตือน)</span>
          </button>

          {/* แถวล่าง: ปุ่มอัปเดตข้อมูลพิกัด + ปุ่มปิดหน้าต่าง */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {onOpenSosModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSosModal();
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 hover:border-amber-500/40 transition-colors active:scale-[0.98]"
                title="แก้ไขพิกัด หรือเพิ่มสิ่งที่ต้องการด่วน"
              >
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">อัปเดตข้อมูล/พิกัด</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1 transition-colors active:scale-[0.98] ${
                !onOpenSosModal ? 'col-span-2' : ''
              }`}
            >
              <span>ปิดหน้าต่าง (ดูสถานการณ์ต่อ)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
