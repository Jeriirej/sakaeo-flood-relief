import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  AlertOctagon, 
  Phone, 
  User, 
  Users, 
  Navigation, 
  CheckCircle, 
  Crosshair, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { getCurrentLocation, SAKAEO_CENTER } from '../utils/geo';

const URGENT_ITEMS = [
  "เรืออพยพ / เรือท้องแบน",
  "น้ำดื่มสะอาด และ ข้าวกล่อง",
  "ผู้ป่วยติดเตียง / ยารักษาโรคประจำตัว",
  "เด็กเล็ก / นมผง / แพมเพิส",
  "คนชรา / ผู้พิการ เคลื่อนย้ายลำบาก",
  "ไฟฉาย / พาวเวอร์แบงก์ / ไฟส่องสว่าง",
  "สัตว์เลี้ยง (สุนัข/แมว/สัตว์เลี้ยง)"
];

export default function SosModal({ isOpen, onClose, onSubmitSuccess, onPickLocationFromMap }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    lat: '',
    lng: '',
    address: '',
    urgentNeeds: [],
    victimsCount: '',
    accessRoute: '',
    notes: ''
  });

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Handle GPS Auto-detect
  const handleAutoGPS = async () => {
    setLocating(true);
    setLocationStatus(null);
    setErrorMessage('');
    try {
      const loc = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        lat: loc.lat.toFixed(6),
        lng: loc.lng.toFixed(6)
      }));
      setLocationStatus('success');
    } catch (err) {
      console.error(err);
      setLocationStatus('error');
      setErrorMessage(err.message || 'ไม่สามารถดึงตำแหน่ง GPS ได้ โปรดระบุเองหรือเลือกบนแผนที่');
    } finally {
      setLocating(false);
    }
  };

  const handleToggleNeed = (item) => {
    setFormData(prev => {
      const exists = prev.urgentNeeds.includes(item);
      return {
        ...prev,
        urgentNeeds: exists 
          ? prev.urgentNeeds.filter(i => i !== item)
          : [...prev.urgentNeeds, item]
      };
    });
  };

  // ดึงหรือสร้าง Device ID ถาวรสำหรับเครื่องนี้
  const getDeviceId = () => {
    let devId = localStorage.getItem('sakaeo_device_id');
    if (!devId) {
      devId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('sakaeo_device_id', devId);
    }
    return devId;
  };

  const existingSosId = localStorage.getItem('sakaeo_my_sos_id');

  // ดึงข้อมูลเดิมมาช่วยเติม ถ้าเคยกดส่งจากเครื่องนี้
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('sakaeo_my_sos_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          name: prev.name || parsed.name || '',
          phone: prev.phone || parsed.phone || '',
          address: prev.address || parsed.address || '',
          victimsCount: prev.victimsCount || parsed.victimsCount || '',
          accessRoute: prev.accessRoute || parsed.accessRoute || ''
        }));
      }
    } catch {}
  }, []);

  // เช็ก cooldown กันสแปม (ถ้าเป็นการอัปเดตจากเครื่องเดิม ให้รอน้อยลงเหลือ 10 วิ)
  const lastSosTime = parseInt(localStorage.getItem('sakaeo_last_sos_time') || '0', 10);
  const now = Date.now();
  const secondsSinceLast = Math.floor((now - lastSosTime) / 1000);
  const cooldownLimit = existingSosId ? 10 : 45;
  const isCooldown = secondsSinceLast < cooldownLimit;
  const cooldownRemaining = cooldownLimit - secondsSinceLast;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบเบอร์โทรศัพท์อย่างเข้มงวด
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      alert('⚠️ โปรดระบุเบอร์โทรศัพท์ที่ติดต่อได้จริงอย่างน้อย 9-10 หลัก เพื่อให้ทีมกู้ภัยสามารถโทรติดต่อยืนยันก่อนเดินทาง');
      return;
    }
    
    if (!formData.lat || !formData.lng) {
      alert('⚠️ โปรดระบุพิกัด GPS เพื่อให้ทีมกู้ภัยไปถูกตำแหน่ง (กดปุ่ม "ดึงพิกัด GPS อัตโนมัติ" หรือเลือกจากแผนที่)');
      return;
    }

    if (isCooldown) {
      alert(`⚠️ ระบบกำลังประสานงานคำขอของคุณ กรุณารออีก ${cooldownRemaining} วินาที หรือหากมีเหตุวิกฤตโปรดโทร 1669 ทันที`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        deviceId: getDeviceId(),
        previousSosId: existingSosId || undefined
      };

      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      // บันทึกคำขอความช่วยเหลือลงในเครื่องตนเอง (localStorage) เพื่อติดตามสถานะ
      localStorage.setItem('sakaeo_my_sos_id', data.id);
      localStorage.setItem('sakaeo_my_sos_data', JSON.stringify(data));
      localStorage.setItem('sakaeo_last_sos_time', Date.now().toString());

      if (data.isUpdate) {
        alert('🔄 ตรวจพบคำขอเดิมของคุณ: ระบบได้อัปเดตพิกัดล่าสุดและความต้องการเพิ่มเติมเข้าสู่คำขอเดิมเรียบร้อยแล้ว (ไม่สร้างหมุดซ้ำบนแผนที่) ทีมกู้ภัยได้รับข้อมูลล่าสุดทันที!');
      } else {
        alert('✅ ส่งข้อมูลขอความช่วยเหลือเรียบร้อยแล้ว! ข้อมูลได้ถูกบันทึกไว้ในเครื่องคุณ และส่งถึงทีมกู้ภัยแล้ว ท่านสามารถติดตามสถานะการช่วยเหลือได้ที่แถบด้านบนของหน้าจอ');
      }

      onSubmitSuccess && onSubmitSuccess(data);
      onClose();
    } catch (err) {
      alert(err.message || 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง หรือโทรสายด่วน 1669');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-red-600/70 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg sm:text-xl">
                {existingSosId ? 'อัปเดตคำขอความช่วยเหลือฉุกเฉิน (SOS)' : 'ขอความช่วยเหลือฉุกเฉิน (SOS)'}
              </h3>
              <p className="text-xs text-rose-100">
                ส่งพิกัด GPS และสิ่งที่ต้องการด่วนถึงทีมกู้ภัยสระแก้ว
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

        {/* Notice for repeat user */}
        {existingSosId && (
          <div className="bg-amber-950/90 border-b border-amber-500/50 px-4 py-2 text-xs text-amber-200 flex items-center gap-2">
            <span className="text-base shrink-0">🔄</span>
            <span>
              <strong>ตรวจพบคำขอเดิมจากเครื่องนี้:</strong> หากส่งซ้ำ ระบบจะ<strong>อัปเดตพิกัดและสิ่งของที่ต้องการ</strong>เข้าสู่คำขอเดิมทันที เพื่อให้กู้ภัยเห็นข้อมูลล่าสุดและไม่เกิดหมุดซ้ำ
            </span>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-sm text-slate-200">
          
          {/* GPS Section (Most Critical) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-heading font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>พิกัด GPS ตำแหน่งที่ต้องการความช่วยเหลือ *</span>
              </label>
              {locationStatus === 'success' && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> ระบุพิกัดสำเร็จ
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              พิกัด GPS จำเป็นอย่างยิ่ง เพื่อให้ทีมกู้ภัยสามารถกดนำทางด้วย Google Maps เข้าถึงบ้านท่านได้อย่างแม่นยำ
            </p>

            {/* GPS Trigger Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleAutoGPS}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-95 text-xs"
              >
                {locating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังค้นหาพิกัด GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4" />
                    <span>กดเพื่อดึงพิกัด GPS อัตโนมัติ 📍</span>
                  </>
                )}
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
                    setLocationStatus('success');
                  });
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-2.5 px-3 rounded-xl transition-all text-xs"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>จิ้มเลือกพิกัดบนแผนที่</span>
              </button>
            </div>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400">ละติจูด (Latitude):</span>
                <input
                  type="text"
                  placeholder="เช่น 13.814300"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500 mt-0.5"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">ลองจิจูด (Longitude):</span>
                <input
                  type="text"
                  placeholder="เช่น 102.072200"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500 mt-0.5"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded-lg border border-rose-900">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                เบอร์โทรศัพท์ติดต่อกลับ (สำคัญมาก) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ชื่อผู้ขอความช่วยเหลือ / ตัวแทน
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="เช่น สมหมาย บุญชู"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Victims Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              จำนวนผู้ประสบภัย และกลุ่มเปราะบาง
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="เช่น ผู้ใหญ่ 4 คน, คนชรา 1 คน, ผู้ป่วยติดเตียง 1 คน"
                value={formData.victimsCount}
                onChange={(e) => setFormData({ ...formData, victimsCount: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Urgent Needs (Checkboxes) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              สิ่งที่ต้องการเร่งด่วน (เลือกได้หลายข้อ)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {URGENT_ITEMS.map((item) => {
                const checked = formData.urgentNeeds.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleNeed(item)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left transition-all border ${
                      checked
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      checked ? 'bg-rose-600 border-rose-500 text-white' : 'border-slate-600'
                    }`}>
                      {checked && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Access Route & Directions (KEY REQUIREMENT) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              เส้นทางเข้าถึง / จุดสังเกต / คำเตือนสำหรับคนไปช่วย *
            </label>
            <textarea
              rows={2}
              placeholder="เช่น เข้าทางซอยข้างวัดชนะไชยศรี ตอนนี้น้ำท่วมระดับเอว รถกระบะเข้าไม่ได้ ต้องใช้เรือ / อยู่บนชั้น 2 ของบ้านสีฟ้า"
              value={formData.accessRoute}
              onChange={(e) => setFormData({ ...formData, accessRoute: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
              required
            />
          </div>

          {/* Address / Landmark */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ที่อยู่ / ชุมชน / ตำบล / อำเภอ
            </label>
            <input
              type="text"
              placeholder="เช่น บ้านเลขที่ 12 หมู่ 3 ต.อรัญประเทศ อ.อรัญประเทศ"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          {/* Submit Actions */}
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
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-rose-950/60 transition-all text-xs active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>ยืนยันส่งขอความช่วยเหลือ (SOS)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
