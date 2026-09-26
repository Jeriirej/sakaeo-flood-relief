import React from 'react';
import { ShieldAlert, CheckCircle2, Clock, MapPin, XCircle, Phone, LifeBuoy } from 'lucide-react';

export default function MySosBanner({ mySos, onResolve, onFocusOnMap }) {
  if (!mySos || mySos.status === 'resolved') return null;

  const isPending = mySos.status === 'pending';
  const isInProgress = mySos.status === 'in_progress';

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-y sm:border-x sm:rounded-2xl border-rose-500/80 shadow-2xl p-3 sm:p-4 sm:mx-4 sm:my-2 animate-fadeIn z-30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/60 flex items-center justify-center shrink-0 mt-0.5 text-red-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-white text-sm sm:text-base">
                📌 ติดตามสถานะคำขอความช่วยเหลือของคุณ (SOS)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                isPending 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {isPending && <Clock className="w-3 h-3 animate-spin" />}
                {isInProgress && <LifeBuoy className="w-3 h-3 animate-spin text-blue-400" />}
                <span>{isPending ? 'รอทีมกู้ภัยตอบรับเคส' : `กำลังเข้าช่วยเหลือ: ${mySos.assignedTo || 'ทีมกู้ภัยสระแก้ว'}`}</span>
              </span>
            </div>

            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>ผู้แจ้ง: <strong className="text-white">{mySos.name}</strong></span>
              <span className="flex items-center gap-1 text-rose-300">
                <Phone className="w-3 h-3" />
                <strong>{mySos.phone}</strong>
              </span>
              {mySos.urgentNeeds?.length > 0 && (
                <span className="text-amber-200">
                  ต้องการ: {mySos.urgentNeeds.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800">
          
          {onFocusOnMap && (
            <button
              onClick={() => onFocusOnMap(mySos)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all"
              title="ดูหมุดพิกัดบนแผนที่"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>ดูบนแผนที่</span>
            </button>
          )}

          {/* ปุ่มยืนยันว่าปลอดภัยแล้ว */}
          <button
            onClick={() => {
              const ok = window.confirm('คุณได้รับการช่วยเหลือหรือปลอดภัยแล้วใช่หรือไม่? (ระบบจะเปลี่ยนสถานะเป็นช่วยเหลือเสร็จสิ้น)');
              if (ok) onResolve(mySos.id, 'resolved');
            }}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
            title="กดเมื่อได้รับความช่วยเหลือแล้ว หรือปลอดภัยแล้ว"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ได้รับการช่วยเหลือแล้ว / ปลอดภัยแล้ว</span>
          </button>

          {/* ปุ่มยกเลิกคำขอ */}
          <button
            onClick={() => {
              const ok = window.confirm('คุณต้องการยกเลิกคำขอความช่วยเหลือนี้ใช่หรือไม่?');
              if (ok) onResolve(mySos.id, 'cancelled');
            }}
            className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/80 text-xs transition-all"
            title="ยกเลิกคำขอนี้"
          >
            <XCircle className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
