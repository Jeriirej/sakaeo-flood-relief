import React from 'react';
import { 
  X, 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  Phone, 
  HeartPulse, 
  HelpCircle,
  Activity,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

export default function FloodSafetyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fadeIn select-none">
      <div className="bg-slate-900 border border-red-500/50 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-5 py-3.5 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                คู่มือเอาชีวิตรอด & ข้อควรระวังฉุกเฉิน
              </h3>
              <p className="text-[11px] text-red-100">
                วิธีปฏิบัติตนเพื่อความปลอดภัยในภาวะอุทกภัย จ.สระแก้ว
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-slate-200">

          {/* 1. Electrocution Hazard (Top Priority) */}
          <div className="bg-gradient-to-r from-red-950/90 to-slate-900 border-2 border-red-500 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-red-400 font-heading font-bold text-base">
              <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />
              <span>1. อันตรายจากไฟดูด / ไฟฟ้ารั่ว (สาเหตุเสียชีวิตอันดับ 1)</span>
            </div>
            <div className="mt-2 space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">⚡</span>
                <span><strong>ตัดเบรกเกอร์/คัตเอาต์ชั้นล่างทันที</strong> เมื่อน้ำเริ่มเอ่อท่วมถึงระดับเต้ารับหรือปลั๊กไฟ</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">⚡</span>
                <span><strong>ถอดปลั๊กเครื่องใช้ไฟฟ้าทุกชนิด</strong> และยกขึ้นที่สูง ห้ามเสียบปลั๊กหรือเปิดสวิตช์ขณะตัวเปียกหรือยืนแช่น้ำ</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">⚡</span>
                <span><strong>ห้ามเข้าใกล้เสาไฟฟ้า โคมไฟส่องสว่าง หรือป้ายไฟ</strong> ที่มีน้ำท่วมขังเกิน 3-5 เมตรเด็ดขาด</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-red-800/60 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-yellow-300 font-bold">แจ้งเหตุไฟฟ้าขัดข้อง/ตัดไฟฉุกเฉิน:</span>
              <a
                href="tel:1129"
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>โทร กฟภ. 1129</span>
              </a>
            </div>
          </div>

          {/* 2. Venomous Animals */}
          <div className="bg-slate-950/80 border border-amber-600/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-heading font-bold text-sm sm:text-base">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              <span>2. ระวังสัตว์มีพิษหนีน้ำ (งู ตะขาบ แมงป่อง)</span>
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-slate-300">
              <p>• สัตว์มีพิษจะหนีน้ำขึ้นที่สูง เช่น <strong>ที่นอน ตู้เสื้อผ้า หลังคา ขื่อบ้าน หรือในรองเท้าบูต</strong></p>
              <p>• ใช้ไม้เคาะหรือใช้ไฟฉายส่องตรวจสอบทุกครั้งก่อนหยิบจับสิ่งของในที่มืด</p>
              <p>• <strong>หากถูกสัตว์มีพิษกัด:</strong> อย่าขันชะเนาะ (ห้ามรัดแน่นเกินไป) ให้ล้างแผลด้วยน้ำสะอาด พยายามให้บริเวณที่ถูกกัดอยู่นิ่งที่สุด และโทรแจ้ง <strong>1669</strong> ทันที</p>
            </div>
          </div>

          {/* 3. Water-borne Diseases */}
          <div className="bg-slate-950/80 border border-sky-600/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sky-400 font-heading font-bold text-sm sm:text-base">
              <HeartPulse className="w-5 h-5 text-sky-400" />
              <span>3. โรคติดต่อที่มากับน้ำท่วม</span>
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-slate-300">
              <p>• <strong>โรคฉี่หนู (Leptospirosis):</strong> หลีกเลี่ยงการเดินลุยน้ำด้วยเท้าเปล่า โดยเฉพาะผู้ที่มีบาดแผล ให้สวมรองเท้าบูตยางหรือสวมถุงพลาสติกหุ้ม</p>
              <p>• <strong>โรคน้ำกัดเท้า:</strong> ล้างเท้าด้วยน้ำสะอาดและสบู่ทุกครั้งหลังลุยน้ำ แล้วเช็ดให้แห้งสนิท</p>
              <p>• <strong>โรคตาแดง / ท้องเสีย:</strong> ดื่มเฉพาะน้ำดื่มบรรจุขวดหรือน้ำต้มสุกเท่านั้น ห้ามนำน้ำท่วมมาล้างหน้าหรือแปรงฟัน</p>
            </div>
          </div>

          {/* 4. Safe Evacuation Guidelines */}
          <div className="bg-slate-950/80 border border-emerald-600/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-heading font-bold text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>4. ข้อควรปฏิบัติในการอพยพ & การขอความช่วยเหลือ</span>
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-slate-300">
              <p>• อย่าเดินฝ่ากระแสน้ำไหลเชี่ยวที่สูงเกินระดับหัวเข่า เพราะกระแสน้ำแรงอาจพัดพาร่างให้ล้มได้</p>
              <p>• รถเก๋งและมอเตอร์ไซค์ <strong>ห้ามลุยน้ำลึกเกิน 20-30 ซม.</strong> เครื่องยนต์อาจดับกลางทาง</p>
              <p>• เตรียมกระเป๋ายังชีพ: เอกสารสำคัญ ยาประจำตัว ไฟฉาย นกหวีด และพาวเวอร์แบงก์ชาร์จมือถือ</p>
              <p>• หากติดค้างในบ้าน: ผูกผ้าสีสด หรือเป่านกหวีด/ส่งสัญญาณไฟฉาย เพื่อให้ทีมเรือกู้ภัยมองเห็น</p>
            </div>
          </div>

          {/* Emergency Hotline summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">สายด่วนช่วยเหลือฉุกเฉิน จ.สระแก้ว:</span>
            <div className="flex items-center gap-2 font-mono font-bold">
              <a href="tel:1669" className="text-rose-400 hover:underline">กู้ชีพ 1669</a>
              <span className="text-slate-600">|</span>
              <a href="tel:1784" className="text-amber-400 hover:underline">ปภ. 1784</a>
              <span className="text-slate-600">|</span>
              <a href="tel:1129" className="text-yellow-400 hover:underline">การไฟฟ้า 1129</a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            รับทราบและปิดหน้านี้
          </button>
        </div>

      </div>
    </div>
  );
}
