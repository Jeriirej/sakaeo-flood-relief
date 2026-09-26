import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Crosshair, 
  Loader2, 
  ShieldAlert,
  Car,
  Bike
} from 'lucide-react';
import { getCurrentLocation } from '../utils/geo';

const DISTRICTS = [
  'เมืองสระแก้ว',
  'อรัญประเทศ',
  'วังน้ำเย็น',
  'วัฒนานคร',
  'ตาพระยา',
  'เขาฉกรรจ์',
  'คลองหาด',
  'วังสมบูรณ์',
  'โคกสูง'
];

export default function ReportFloodModal({ 
  isOpen, 
  onClose, 
  onSubmitSuccess, 
  onPickLocationFromMap 
}) {
  const [formData, setFormData] = useState({
    title: '',
    district: 'อรัญประเทศ',
    subdistrict: '',
    lat: '',
    lng: '',
    severity: 'danger', // danger, warning, safe
    radius: 400, // รัศมีเป็นเมตร
    waterLevel: '30 - 50 ซม. (ระดับหัวเข่า)',
    passableFor: 'มอเตอร์ไซค์และรถเก๋งผ่านไม่ได้ / รถยกสูงผ่านได้ช้าๆ',
    recommendedRoute: '',
    description: '',
    reporterName: '',
    contactPhone: ''
  });

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAutoGPS = async () => {
    setLocating(true);
    try {
      const loc = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        lat: loc.lat.toFixed(6),
        lng: loc.lng.toFixed(6)
      }));
    } catch (err) {
      alert(err.message || 'ไม่สามารถดึงตำแหน่ง GPS ได้');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('โปรดระบุชื่อถนน หรือจุดที่น้ำท่วม');
      return;
    }
    if (!formData.lat || !formData.lng) {
      alert('โปรดระบุพิกัดตำแหน่ง (กดปุ่มดึง GPS หรือจิ้มเลือกบนแผนที่)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/floods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      const data = await res.json();
      alert('บันทึกข้อมูลรายงานเส้นทางน้ำท่วมเรียบร้อยแล้ว ขอบคุณที่ร่วมแบ่งปันข้อมูลเพื่อความปลอดภัย');
      onSubmitSuccess && onSubmitSuccess(data);
      onClose();
    } catch (err) {
      alert(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg sm:text-xl">
                รายงานเส้นทางน้ำท่วม / แจ้งทางเลี่ยง
              </h3>
              <p className="text-xs text-amber-100">
                ร่วมมาร์คพิกัดและบอกสภาพเส้นทางให้คนขี่รถหลีกเลี่ยง
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-sm text-slate-200">
          
          {/* Severity Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              สถานะเส้นทาง / ความรุนแรง *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  severity: 'danger',
                  passableFor: 'ห้ามรถทุกชนิดผ่านเด็ดขาด กระแสน้ำเชี่ยว/ทางขาด' 
                })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  formData.severity === 'danger'
                    ? 'bg-red-600/30 border-red-500 text-red-200 font-bold ring-2 ring-red-500'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-base mb-0.5">🔴</div>
                <div className="text-xs font-bold">ทางขาด/ห้ามผ่าน</div>
                <div className="text-[10px] text-slate-400">รถทุกชนิดผ่านไม่ได้</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  severity: 'warning',
                  passableFor: 'มอเตอร์ไซค์/รถเก๋งโปรดเลี่ยง รถยกสูงผ่านได้' 
                })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  formData.severity === 'warning'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold ring-2 ring-amber-500'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-base mb-0.5">🟡</div>
                <div className="text-xs font-bold">น้ำท่วมขัง/เฝ้าระวัง</div>
                <div className="text-[10px] text-slate-400">รถเล็กโปรดหลีกเลี่ยง</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  severity: 'safe',
                  passableFor: 'รถทุกชนิดสัญจรได้ตามปกติ',
                  waterLevel: 'ไม่มีน้ำท่วมขัง ถนนแห้ง'
                })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  formData.severity === 'safe'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-base mb-0.5">🟢</div>
                <div className="text-xs font-bold">เส้นทางเลี่ยงปลอดภัย</div>
                <div className="text-[10px] text-slate-400">สัญจรได้ตามปกติ</div>
              </button>
            </div>
          </div>

          {/* Location Title & District */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ชื่อถนน / แยก / จุดเกิดเหตุ *
              </label>
              <input
                type="text"
                placeholder="เช่น ถนนสุวรรณศร กม. 250, แยกไฟแดงอรัญประเทศ"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                อำเภอ *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>อ.{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS Coordinates Picker */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-heading font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>มาร์คพิกัดบนแผนที่ *</span>
              </label>
              {formData.lat && formData.lng && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  {formData.lat}, {formData.lng}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAutoGPS}
                disabled={locating}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3 rounded-lg text-xs font-medium"
              >
                <Crosshair className={`w-3.5 h-3.5 text-rose-400 ${locating ? 'animate-spin' : ''}`} />
                <span>ใช้ GPS พิกัดปัจจุบัน</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onPickLocationFromMap && onPickLocationFromMap((coords) => {
                    setFormData(prev => ({
                      ...prev,
                      lat: coords.lat.toFixed(6),
                      lng: coords.lng.toFixed(6)
                    }));
                  });
                }}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3 rounded-lg text-xs font-medium"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>แตะเลือกบนแผนที่</span>
              </button>
            </div>
          </div>

          {/* Flood Radius / Area Coverage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>ความกว้างของพื้นที่น้ำท่วม (รัศมีวงกลมบนแผนที่) *</span>
              <span className="text-amber-400 font-bold font-mono">~{formData.radius} เมตร</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'จุดตัด 150ม.', val: 150 },
                { label: 'ชุมชน 350ม.', val: 350 },
                { label: 'ช่วงถนน 700ม.', val: 700 },
                { label: 'กว้างมาก 1.2กม.', val: 1200 },
              ].map(r => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setFormData({ ...formData, radius: r.val })}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-medium border text-center transition-all ${
                    formData.radius === r.val
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold ring-1 ring-amber-500'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Water level & Passable Vehicles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ระดับน้ำโดยประมาณ
              </label>
              <input
                type="text"
                placeholder="เช่น ปริ่มขอบทาง, 30 ซม., มิดหัวเข่า, 1 เมตร"
                value={formData.waterLevel}
                onChange={(e) => setFormData({ ...formData, waterLevel: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ยานพาหนะที่ผ่านได้ / ไม่ได้
              </label>
              <input
                type="text"
                placeholder="เช่น รถเก๋ง มอเตอร์ไซค์ห้ามผ่าน / รถกระบะผ่านได้"
                value={formData.passableFor}
                onChange={(e) => setFormData({ ...formData, passableFor: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* RECOMMENDED BYPASS ROUTE (KEY REQUIREMENT) */}
          <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-600/30">
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              แนะนำเส้นทางเลี่ยง (สำหรับคนขี่รถ/ผู้สัญจร)
            </label>
            <textarea
              rows={2}
              placeholder="เช่น ให้เลี่ยงไปใช้ถนนเลียบทางรถไฟ หรือใช้ถนนบายพาสเลี่ยงเมืองสาย 359 แทน"
              value={formData.recommendedRoute}
              onChange={(e) => setFormData({ ...formData, recommendedRoute: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Description & Contact */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              รายละเอียดเพิ่มเติม / สภาพกระแสน้ำ
            </label>
            <textarea
              rows={2}
              placeholder="เช่น กระแสน้ำไหลแรงมาก มีเสาไฟล้มขวางทาง หรือมีเจ้าหน้าที่คอยโบกรถอยู่"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">ชื่อผู้แจ้ง (ไม่บังคับ)</label>
              <input
                type="text"
                placeholder="เช่น อาสาเมืองสระแก้ว"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">เบอร์โทรติดต่อ (ไม่บังคับ)</label>
              <input
                type="tel"
                placeholder="เช่น 08x-xxx-xxxx"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              />
            </div>
          </div>

          {/* Footer */}
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
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-950/60 transition-all text-xs active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>บันทึกและแสดงบนแผนที่</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
