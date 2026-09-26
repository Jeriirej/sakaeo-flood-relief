import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Loader2, 
  Clock, 
  Car, 
  Navigation,
  Sparkles
} from 'lucide-react';

export default function UpdateFloodModal({ 
  isOpen, 
  onClose, 
  floodItem, 
  onUpdateSuccess 
}) {
  const [severity, setSeverity] = useState('warning');
  const [waterLevel, setWaterLevel] = useState('');
  const [passableFor, setPassableFor] = useState('');
  const [recommendedRoute, setRecommendedRoute] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (floodItem) {
      setSeverity(floodItem.severity || 'warning');
      setWaterLevel(floodItem.waterLevel || '');
      setPassableFor(floodItem.passableFor || '');
      setRecommendedRoute(floodItem.recommendedRoute || '');
      setUpdateNote('');
      setReporterName('');
    }
  }, [floodItem]);

  if (!isOpen || !floodItem) return null;

  // Quick preset handlers
  const handleQuickReceding = () => {
    setSeverity('warning');
    setWaterLevel('ลดลงเหลือประมาณ 15 - 20 ซม.');
    setPassableFor('มอเตอร์ไซค์และรถเก๋งเริ่มสัญจรผ่านได้ช้าๆ');
    setUpdateNote('น้ำลดระดับลงแล้ว รถเล็กเริ่มวิ่งผ่านได้ แต่ยังต้องระวัง');
  };

  const handleQuickCleared = () => {
    setSeverity('safe');
    setWaterLevel('น้ำแห้งแล้ว ถนนแห้งปกติ');
    setPassableFor('รถทุกชนิดสัญจรได้ตามปกติ 100%');
    setRecommendedRoute('เปิดการจราจรตามปกติ ไม่ต้องใช้ทางเลี่ยง');
    setUpdateNote('ระดับน้ำลดลงจนเข้าสู่ภาวะปกติ สามารถเดินทางได้ปลอดภัย');
  };

  const handleQuickRising = () => {
    setSeverity('danger');
    setWaterLevel('ระดับน้ำเพิ่มสูงขึ้น กระแสน้ำเชี่ยว');
    setPassableFor('ห้ามรถทุกชนิดผ่านเด็ดขาด มีอันตราย');
    setUpdateNote('มวลน้ำเพิ่มระดับสูงขึ้น ขอให้หลีกเลี่ยงเส้นทางนี้ทันที');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/floods/${floodItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity,
          waterLevel,
          passableFor,
          recommendedRoute,
          updateNote: updateNote || `อัปเดตสถานะ: ${waterLevel}`,
          reporterName: reporterName || 'พลเมืองดีในพื้นที่'
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      const updatedData = await res.json();
      alert('อัปเดตสถานการณ์ล่าสุดเรียบร้อยแล้ว ขอบคุณที่ร่วมรายงานความเคลื่อนไหว!');
      onUpdateSuccess && onUpdateSuccess(updatedData);
      onClose();
    } catch (err) {
      alert(err.message || 'ไม่สามารถอัปเดตได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                อัปเดตสถานการณ์ล่าสุด
              </h3>
              <p className="text-xs text-amber-100 truncate max-w-xs">
                {floodItem.title}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Quick preset buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              เลือกสถานะด่วน (กดเพื่อใส่ข้อมูลทันที):
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleQuickReceding}
                className="p-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 text-amber-300 font-semibold flex flex-col items-center text-center transition-all"
              >
                <ArrowDownCircle className="w-4 h-4 mb-0.5 text-amber-400" />
                <span className="text-[11px]">💧 น้ำลดลงแล้ว</span>
              </button>

              <button
                type="button"
                onClick={handleQuickCleared}
                className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 font-semibold flex flex-col items-center text-center transition-all"
              >
                <CheckCircle2 className="w-4 h-4 mb-0.5 text-emerald-400" />
                <span className="text-[11px]">✅ น้ำแห้ง/ผ่านได้</span>
              </button>

              <button
                type="button"
                onClick={handleQuickRising}
                className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-semibold flex flex-col items-center text-center transition-all"
              >
                <ArrowUpCircle className="w-4 h-4 mb-0.5 text-red-400" />
                <span className="text-[11px]">⚠️ น้ำเพิ่มสูงขึ้น</span>
              </button>
            </div>
          </div>

          {/* Severity status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ระดับความรุนแรง
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSeverity('danger')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs font-medium ${
                  severity === 'danger'
                    ? 'bg-red-600/30 border-red-500 text-red-200 font-bold ring-2 ring-red-500'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                🔴 ทางขาด/ห้ามผ่าน
              </button>
              <button
                type="button"
                onClick={() => setSeverity('warning')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs font-medium ${
                  severity === 'warning'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold ring-2 ring-amber-500'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                🟡 รถเล็กโปรดเลี่ยง
              </button>
              <button
                type="button"
                onClick={() => setSeverity('safe')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs font-medium ${
                  severity === 'safe'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                🟢 ทางเลี่ยงสัญจรได้
              </button>
            </div>
          </div>

          {/* Water level input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ระดับน้ำปัจจุบัน *
            </label>
            <input
              type="text"
              value={waterLevel}
              onChange={(e) => setWaterLevel(e.target.value)}
              placeholder="เช่น ลดลงเหลือ 15 ซม. / หรือ เพิ่มขึ้น 70 ซม."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
              required
            />
          </div>

          {/* Passable vehicles */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ยานพาหนะที่ผ่านได้ ณ ตอนนี้ *
            </label>
            <input
              type="text"
              value={passableFor}
              onChange={(e) => setPassableFor(e.target.value)}
              placeholder="เช่น มอเตอร์ไซค์และรถเก๋งผ่านได้แล้ว / หรือ รถทุกชนิดห้ามผ่าน"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
              required
            />
          </div>

          {/* Detour recommendations */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              คำแนะนำเส้นทางเลี่ยง (ถ้ามี)
            </label>
            <input
              type="text"
              value={recommendedRoute}
              onChange={(e) => setRecommendedRoute(e.target.value)}
              placeholder="เช่น ให้ใช้บายพาสอรัญฯ หรือ สัญจรได้ตามปกติแล้ว"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Update notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ข้อความแจ้งเตือน / สภาพจริงในพื้นที่ *
            </label>
            <textarea
              rows={2}
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              placeholder="เช่น ตอนนี้ฝนหยุดตก น้ำลดระดับลงอย่างต่อเนื่อง คาดว่า 1-2 ชม. จะกลับสู่ภาวะปกติ"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
              required
            />
          </div>

          {/* Reporter name */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-0.5">
              ชื่อผู้แจ้งอัปเดต (เช่น อาสาสมัครในพื้นที่, ปภ., ประชาชน)
            </label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="เช่น อาสาอรัญ / พี่วินมอเตอร์ไซค์แยกสระแก้ว"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg text-xs transition-all active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>บันทึกการเปลี่ยนแปลงสถานการณ์</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
