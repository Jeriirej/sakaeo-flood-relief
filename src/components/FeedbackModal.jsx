import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose }) {
  const [category, setCategory] = useState('อยากให้เว็บแก้ไข/ปรับปรุงอะไร');
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('กรุณากรอกข้อความข้อเสนอแนะหรือสิ่งที่อยากให้แก้ไขครับ');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          contactInfo: contactInfo.trim(),
          name: name.trim()
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setMessage('');
          setContactInfo('');
          setName('');
          onClose();
        }, 2200);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'เกิดข้อผิดพลาด ไม่สามารถส่งข้อมูลได้');
      }
    } catch (err) {
      setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                ส่งข้อเสนอแนะ / แจ้งสิ่งที่อยากให้แก้ไข
              </h3>
              <p className="text-xs text-slate-400">
                ร่วมพัฒนาเว็บสระแก้วสู้ภัยน้ำท่วมให้มีประโยชน์สูงสุด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="font-heading font-bold text-lg text-white">
              ขอบคุณสำหรับข้อเสนอแนะ!
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              ทีมงานได้รับข้อความเรียบร้อยแล้ว และจะนำไปพิจารณาปรับปรุงแก้ไขระบบให้ดียิ่งขึ้นครับ
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {errorMsg && (
              <div className="bg-rose-950/80 border border-rose-600/60 text-rose-200 p-2.5 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category Select */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                หมวดหมู่ข้อเสนอแนะ:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
              >
                <option value="อยากให้เว็บแก้ไข/ปรับปรุงอะไร">💡 อยากให้เว็บแก้ไข / ปรับปรุงอะไร</option>
                <option value="แจ้งปัญหาการใช้งาน/พบบั๊ก">🐛 แจ้งปัญหาการใช้งาน / พบบั๊ก</option>
                <option value="แนะนำข้อมูลพื้นที่/จุดน้ำท่วม">📍 แนะนำข้อมูลพื้นที่ / จุดน้ำท่วมเพิ่มเติม</option>
                <option value="เพิ่มจุดช่วยเหลือ/ศูนย์กู้ภัย">🛡️ แนะนำจุดช่วยเหลือ / ศูนย์กู้ภัย</option>
                <option value="อื่นๆ">💬 ข้อเสนอแนะอื่นๆ</option>
              </select>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                รายละเอียดข้อเสนอแนะหรือสิ่งที่อยากให้แก้ไข <span className="text-rose-400">*</span>:
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="เช่น อยากให้เพิ่มปุ่มแชร์เข้ากลุ่ม Facebook, ปรับตัวหนังสือให้ใหญ่ขึ้นบนมือถือ, หรือมีข้อผิดพลาดตรงหน้าแผนที่..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm leading-relaxed"
              ></textarea>
            </div>

            {/* User Name & Contact (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">
                  ชื่อหรือนามแฝง (ไม่บังคับ):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="เช่น ประชาชนชาวอรัญ"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">
                  เบอร์โทรหรือ LINE ID (ไม่บังคับ):
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  placeholder="สำหรับติดต่อกลับกรณีจำเป็น"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors text-xs"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อเสนอแนะ'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
