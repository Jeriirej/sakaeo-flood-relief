import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Crosshair, 
  Clock, 
  HeartHandshake, 
  Utensils, 
  Package, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getCurrentLocation } from '../utils/geo';

export default function AddDonationModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  onPickLocationFromMap
}) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'food_distribution',
    organizerName: '',
    contactPhone: '',
    district: 'อรัญประเทศ',
    address: '',
    operatingHours: '09:00 - 15:00 น. (หรือจนกว่าของจะหมด)',
    itemsAvailable: '',
    notes: '',
    lat: '',
    lng: ''
  });

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const districts = ['อรัญประเทศ', 'เมืองสระแก้ว', 'วัฒนานคร', 'วังน้ำเย็น', 'ตาพระยา', 'เขาฉกรรจ์', 'คลองหาด', 'วังสมบูรณ์', 'โคกสูง'];

  // Handle GPS location
  const handleGetGPS = async () => {
    setLocating(true);
    setErrorMsg('');
    try {
      const loc = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        lat: loc.lat.toFixed(6),
        lng: loc.lng.toFixed(6)
      }));
    } catch (err) {
      setErrorMsg('ไม่สามารถดึงพิกัด GPS ได้ โปรดกด "เลือกจุดบนแผนที่" แทน');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('กรุณากรอกชื่อจุดแจกอาหาร หรือจุดรับบริจาค');
      return;
    }

    if (!formData.contactPhone.trim()) {
      setErrorMsg('⚠️ บังคับกรอกเบอร์โทรศัพท์ เพื่อให้ประชาชนโทรสอบถามก่อนเดินทางจริง');
      return;
    }

    // Phone validation
    const cleanPhone = formData.contactPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-10 หลัก)');
      return;
    }

    if (!formData.lat || !formData.lng) {
      setErrorMsg('กรุณาระบุพิกัดตำแหน่ง (กดดึง GPS หรือเลือกจากแผนที่)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      const savedItem = await res.json();
      if (onSubmitSuccess) onSubmitSuccess(savedItem);
      onClose();
      alert('บันทึกจุดแจกอาหาร/รับบริจาคเรียบร้อยแล้ว ขอขอบคุณในความมีน้ำใจช่วยเหลือพี่น้องผู้ประสบภัยครับ');
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn select-none">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-5 py-3.5 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                ตั้งจุดแจกอาหาร / โรงครัว / รับบริจาค
              </h3>
              <p className="text-[11px] text-amber-100">
                เปิดให้ผู้มีจิตศรัทธาหรือกลุ่มจิตอาสาปักหมุดจุดช่วยเหลือ
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Important Notice */}
          <div className="bg-amber-950/70 border border-amber-500/60 rounded-2xl p-3 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold text-xs sm:text-sm">
                ข้อกำหนดสำคัญ: ต้องระบุเบอร์โทรศัพท์ที่ติดต่อได้จริง
              </strong>
              <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                เนื่องจากสถานการณ์น้ำท่วมเปลี่ยนแปลงตลอดเวลา เพื่อไม่ให้ประชาชนหรือผู้ประสบภัยเดินทางมาเก้อ ระบบจะเน้นย้ำให้ผู้ใช้งานโทรสอบถามท่านก่อนเดินทางมาเสมอ
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              ชื่อจุดแจก / โรงครัว / จุดรับบริจาค <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="เช่น โรงครัวแจกข้าวกล่องวัดชนะไชยศรี, จุดรับบริจาคน้ำดื่มสี่แยกสระแก้ว"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Type of point */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'food_distribution' })}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                formData.type === 'food_distribution'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>แจกอาหาร/น้ำ</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'relief_supplies' })}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                formData.type === 'relief_supplies'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-orange-400" />
              <span>แจกถุงยังชีพ</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'donation_reception' })}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                formData.type === 'donation_reception'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>เปิดรับบริจาค</span>
            </button>
          </div>

          {/* Contact Phone & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                เบอร์โทรศัพท์ติดต่อ (บังคับ) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="เช่น 081-234-5678"
                  className="w-full bg-slate-950 border border-amber-500/60 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                ชื่อผู้จัดตั้ง / กลุ่มจิตอาสา
              </label>
              <input
                type="text"
                value={formData.organizerName}
                onChange={e => setFormData({ ...formData, organizerName: e.target.value })}
                placeholder="เช่น ชมรมคนรักสระแก้ว, กลุ่มเพื่อนอรัญ"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* District & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                อำเภอ
              </label>
              <select
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {districts.map(d => (
                  <option key={d} value={d}>อ.{d}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                สถานที่ตั้ง / จุดสังเกต
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="เช่น ศาลาการเปรียญวัด, เต็นท์หน้าตลาดสด"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Coordinate Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              พิกัดตำแหน่งบนแผนที่ <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={locating}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
              >
                <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-amber-400' : ''}`} />
                <span>{locating ? 'กำลังดึง GPS...' : 'ใช้พิกัดปัจจุบัน (GPS)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onPickLocationFromMap) {
                    onPickLocationFromMap((coords) => {
                      setFormData(prev => ({
                        ...prev,
                        lat: coords.lat.toFixed(6),
                        lng: coords.lng.toFixed(6)
                      }));
                    });
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>แตะเลือกจากแผนที่</span>
              </button>
            </div>

            {formData.lat && formData.lng && (
              <div className="mt-1.5 text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>พิกัดที่เลือก: {formData.lat}, {formData.lng}</span>
              </div>
            )}
          </div>

          {/* Operating Hours & Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                เวลาเปิดแจก / เวลาเปิดรับ
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                  placeholder="เช่น 09:00 - 16:00 น. หรือ แจกจนของหมด"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                สิ่งของที่มีแจก / ของที่ต้องการรับ
              </label>
              <input
                type="text"
                value={formData.itemsAvailable}
                onChange={e => setFormData({ ...formData, itemsAvailable: e.target.value })}
                placeholder="เช่น ข้าวกล่อง 500 กล่อง, น้ำดื่ม, ยาแก้คัน"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              คำแนะนำเพิ่มเติมสำหรับผู้ที่จะเดินทางมา
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="เช่น รถเล็กเข้าได้, โปรดนำถุงผ้ามาใส่ของ, หรือหากต้องการให้เรือนำไปส่งโปรดโทรแจ้ง"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-orange-950/50 transition-all flex items-center gap-1.5"
            >
              <HeartHandshake className="w-4 h-4 text-slate-950" />
              <span>{loading ? 'กำลังบันทึก...' : 'ยืนยันตั้งจุดช่วยเหลือ'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
