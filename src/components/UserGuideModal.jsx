import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  MapPin, 
  ShieldAlert, 
  Navigation, 
  Phone, 
  Search, 
  PlusCircle, 
  Home, 
  Utensils, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ArrowRight,
  BookOpen,
  ChevronRight,
  Info
} from 'lucide-react';

export default function UserGuideModal({ 
  isOpen, 
  onClose,
  initialMode = 'prompt' // 'prompt' (ถามก่อน) หรือ 'guide' (หน้าคู่มือเต็ม)
}) {
  const [currentView, setCurrentView] = useState(initialMode); // 'prompt' | 'guide'
  const [activeGuideTab, setActiveGuideTab] = useState('sos'); // 'sos' | 'pins' | 'navigate' | 'search' | 'report'

  // Sync mode when opened
  React.useEffect(() => {
    if (isOpen) {
      setCurrentView(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // 1. หน้าต่างถามตอนเข้าเว็บ: "ต้องการให้สอนวิธีใช้งานไหม?"
  if (currentView === 'prompt') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div 
          className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 font-sans select-none overflow-hidden"
          style={{ fontFamily: "'Prompt', sans-serif" }}
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500 rounded-b-full shadow-lg"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Center Graphic */}
          <div className="flex flex-col items-center text-center mt-2 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/50 mb-3 border border-cyan-400/30">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-2">
              <span>🌊 ยินดีต้อนรับสู่ระบบช่วยเหลือผู้ประสบภัย</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
              ต้องการให้สอนวิธีใช้งานไหมครับ?
            </h3>
            
            <p className="text-sm text-slate-300 leading-relaxed px-2">
              คู่มือสั้นๆ เข้าใจง่าย เพื่อให้ทุกคนและผู้สูงอายุสามารถ <strong>ขอความช่วยเหลือ</strong>, <strong>ดูเส้นทางน้ำท่วม</strong> และ <strong>ค้นหาจุดปลอดภัย</strong> ได้อย่างรวดเร็ว
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setCurrentView('guide')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-cyan-950/60 text-sm sm:text-base transition-all transform active:scale-98 border border-cyan-400/40 cursor-pointer"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>📖 สอนวิธีใช้งานเว็บไซต์ (เข้าใจง่าย 1 นาที)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-3 px-4 rounded-2xl border border-slate-700 transition-colors text-sm cursor-pointer"
            >
              <span>ข้าม / เข้าใช้งานหน้าเว็บทันที</span>
            </button>
          </div>

          {/* Quick Hotline Note */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-rose-300 font-medium">
              🚨 เหตุฉุกเฉินวิกฤต โทรสายด่วนได้ทันที: <strong>1669</strong> (กู้ชีพ) หรือ <strong>1784</strong> (ปภ.)
            </span>
          </div>

        </div>
      </div>
    );
  }

  // 2. หน้าต่างคู่มือการใช้งานเต็มรูปแบบ (User Guide Modal)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
        style={{ fontFamily: "'Prompt', sans-serif" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                คู่มือแนะนำวิธีใช้งานเว็บไซต์
              </h2>
              <p className="text-xs text-slate-400">
                สรุปวิธีใช้งานหลัก เข้าใจง่าย สำหรับทุกคนและผู้สูงอายุ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="ปิดคู่มือ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveGuideTab('sos')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeGuideTab === 'sos'
                ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>🚨 1. ขอความช่วยเหลือ</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('pins')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeGuideTab === 'pins'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>🗺️ 2. ความหมายของหมุด</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('navigate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeGuideTab === 'navigate'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>🧭 3. ดูข้อมูล & นำทาง</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('search')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeGuideTab === 'search'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>🔍 4. ค้นหา & เช็กเส้นทาง</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('report')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeGuideTab === 'report'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>📍 5. แจ้งน้ำท่วม</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: ขอความช่วยเหลือ (SOS) */}
          {activeGuideTab === 'sos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-red-950/40 border-2 border-red-500/60 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-red-400 font-bold text-base mb-2">
                  <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 animate-bounce" />
                  <span>วิธีขอความช่วยเหลือด่วนเมื่อติดน้ำท่วม (SOS)</span>
                </div>
                
                <ol className="space-y-3 text-slate-200 text-sm sm:text-base leading-relaxed list-decimal list-inside">
                  <li>
                    <strong>กดปุ่มสีแดง "ขอความช่วยเหลือ (SOS)"</strong>: อยู่ที่แถบด้านบนของหน้าเว็บ (หรือแถบเมนูด้านล่างบนมือถือ)
                  </li>
                  <li>
                    <strong>กรอกชื่อ และเบอร์โทรศัพท์</strong>: ที่กู้ภัยสามารถโทรติดต่อกลับได้
                  </li>
                  <li>
                    <strong>ระบุสิ่งที่ต้องการด่วน</strong>: เช่น เรืออพยพ, อาหาร-น้ำดื่ม, หรือยารักษาโรค
                  </li>
                  <li>
                    <strong>กดปุ่ม "ดึงพิกัด GPS" หรือจิ้มบนแผนที่</strong>: เพื่อให้ทีมกู้ภัยรู้ตำแหน่งบ้านหรือจุดที่ติดอยู่ได้อย่างแม่นยำ
                  </li>
                  <li>
                    <strong>กดส่งข้อมูล</strong>: หมุด SOS พร้อมไฟกะพริบจะขึ้นบนแผนที่ทันที เพื่อให้กู้ภัยและคนในพื้นที่เห็น
                  </li>
                </ol>

                <div className="mt-4 p-3 bg-red-900/50 border border-red-400/40 rounded-xl text-xs sm:text-sm text-red-100 font-medium">
                  ⚠️ <strong>สำคัญมาก:</strong> เว็บนี้เป็นสื่อกลางช่วยประสานงาน หากตกอยู่ในสถานการณ์ฉุกเฉินอันตรายถึงชีวิต <strong>โปรดโทร 1669 (สายด่วนกู้ชีพ) หรือ 1784 (ปภ.) ทันที</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ความหมายของสัญลักษณ์หมุดบนแผนที่ */}
          {activeGuideTab === 'pins' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs sm:text-sm text-slate-300 mb-2">
                บนแผนที่จะมีหมุดสีต่างๆ และมี <strong>ป้ายชื่อชุมชน/จุดปักหมุดลอยอยู่บนหัวหมุด</strong> เพื่อให้เข้าใจได้ทันที:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* แดง */}
                <div className="flex items-start gap-3 p-3 bg-red-950/40 border border-red-500/40 rounded-xl">
                  <span className="text-2xl shrink-0">⛔</span>
                  <div>
                    <h4 className="text-red-300 font-bold text-sm">หมุดสีแดง (น้ำท่วมสูง)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      น้ำท่วมสูง ลึก หรือกระแสน้ำเชี่ยว <strong>ห้ามรถทุกชนิดผ่านเด็ดขาด</strong>
                    </p>
                  </div>
                </div>

                {/* เหลือง */}
                <div className="flex items-start gap-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div>
                    <h4 className="text-amber-300 font-bold text-sm">หมุดสีเหลือง (เฝ้าระวัง)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      น้ำท่วมผิวจราจรบางส่วน รถยกสูงผ่านได้ชะลอความเร็ว <strong>รถเล็กโปรดระวังหรือเลี่ยง</strong>
                    </p>
                  </div>
                </div>

                {/* เขียว */}
                <div className="flex items-start gap-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                  <span className="text-2xl shrink-0">✅</span>
                  <div>
                    <h4 className="text-emerald-300 font-bold text-sm">หมุดสีเขียว (ทางเลี่ยงปลอดภัย)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      เส้นทางถนนแห้ง สัญจรได้ปกติ แนะนำให้ใช้เดินทางเลี่ยงพื้นที่น้ำท่วม
                    </p>
                  </div>
                </div>

                {/* ฟ้า */}
                <div className="flex items-start gap-3 p-3 bg-sky-950/40 border border-sky-500/40 rounded-xl">
                  <span className="text-2xl shrink-0">🏠</span>
                  <div>
                    <h4 className="text-sky-300 font-bold text-sm">หมุดสีฟ้า (ศูนย์พักพิงชั่วคราว)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      หอประชุม, วัด, โรงเรียน ที่เปิดรองรับผู้ประสบภัย มีที่พักและห้องน้ำ
                    </p>
                  </div>
                </div>

                {/* ส้ม */}
                <div className="flex items-start gap-3 p-3 bg-orange-950/40 border border-orange-500/40 rounded-xl">
                  <span className="text-2xl shrink-0">🍲</span>
                  <div>
                    <h4 className="text-orange-300 font-bold text-sm">หมุดสีส้ม (จุดแจกอาหาร/บริจาค)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      โรงครัวประกอบอาหารสด แจกข้าวกล่อง น้ำดื่ม และเปิดรับของบริจาค
                    </p>
                  </div>
                </div>

                {/* น้ำเงิน */}
                <div className="flex items-start gap-3 p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl">
                  <span className="text-2xl shrink-0">🛡️</span>
                  <div>
                    <h4 className="text-blue-300 font-bold text-sm">หมุดสีน้ำเงิน (ศูนย์กู้ภัย 24 ชม.)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      ฐานบัญชาการกู้ภัย จุดรวมพลเรือและเจ้าหน้าที่พร้อมเบอร์โทร 24 ชม.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ดูรายละเอียด & นำทาง */}
          {activeGuideTab === 'navigate' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-white font-bold text-base flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-400" />
                  <span>การแตะดูข้อมูลบนแผนที่ & ระบบนำทาง</span>
                </h4>

                <div className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="font-bold text-cyan-400 shrink-0">1.</span>
                    <span><strong>แตะที่ป้ายหรือตัวหมุดใดก็ได้:</strong> สามารถกดที่ป้ายข้อความลอย หรือกดที่ตัวหมุด เพื่อเปิดดูรายละเอียดระดับน้ำ เส้นทางเลี่ยง และเวลาอัปเดตล่าสุด</span>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="font-bold text-emerald-400 shrink-0">2.</span>
                    <span><strong>ปุ่มสีแดง "นำทางด้วย Google Maps":</strong> กดปุ่มนี้แล้วระบบจะเปิดแอป Google Maps นำทางคุณไปยังจุดพักพิงหรือจุดหมายทันทีโดยไม่ต้องพิมพ์พิกัดเอง</span>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="font-bold text-green-400 shrink-0">3.</span>
                    <span><strong>ปุ่มสีเขียว "โทรติดต่อ":</strong> สามารถแตะเพื่อโทรออกหาสายด่วน กู้ภัย หรือศูนย์พักพิงได้ทันที ตัวหนังสือสีขาวชัดเจน อ่านง่าย</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ค้นหา & เช็กเส้นทาง */}
          {activeGuideTab === 'search' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-indigo-300 font-bold text-base flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-400" />
                  <span>วิธีค้นหาสถานที่ & ตรวจสอบเส้นทางเลี่ยงน้ำท่วม</span>
                </h4>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 list-disc list-inside">
                  <li>
                    <strong>ช่องค้นหาด้านบน:</strong> พิมพ์ชื่ออำเภอ เช่น <em>"อรัญประเทศ"</em>, <em>"เขาฉกรรจ์"</em> หรือชื่อสถานที่ เช่น <em>"ตลาดโรงเกลือ"</em> แผนที่จะซูมไปยังจุดนั้นทันที
                  </li>
                  <li>
                    <strong>ปุ่ม "เช็กเส้นทาง":</strong> อยู่ที่แถบด้านบน กดแล้วเลือกต้นทางและปลายทาง ระบบจะตรวจสอบว่าเส้นทางที่คุณจะไปมีจุดน้ำท่วมขวางทางอยู่หรือไม่ พร้อมแนะนำเส้นทางปลอดภัย
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: แจ้งน้ำท่วม */}
          {activeGuideTab === 'report' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-amber-300 font-bold text-base flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" />
                  <span>วิธีช่วยปักหมุดแจ้งเตือนน้ำท่วม (จิตอาสา/คนท้องถิ่น)</span>
                </h4>

                <p className="text-xs sm:text-sm text-slate-200">
                  หากท่านพบเจอน้ำท่วมจุดใหม่ หรือระดับน้ำลดลงแล้ว สามารถช่วยแจ้งเตือนผู้อื่นได้:
                </p>

                <ol className="space-y-2 text-xs sm:text-sm text-slate-200 list-decimal list-inside">
                  <li>กดปุ่ม <strong>"แจ้งน้ำท่วม"</strong> ที่แถบเมนู</li>
                  <li>พิมพ์ชื่อถนน หรือจุดที่น้ำท่วม (เช่น <em>"หน้าวัด..."</em>, <em>"แยกไฟแดง..."</em>)</li>
                  <li>เลือกระดับความรุนแรง (🔴 ท่วมสูงผ่านไม่ได้ หรือ 🟡 เฝ้าระวัง)</li>
                  <li>กด <strong>"ดึง GPS"</strong> หรือจิ้มตำแหน่งบนแผนที่</li>
                  <li>กดบันทึก ข้อมูลและป้ายชื่อจะปรากฏบนแผนที่ทันทีแบบอัตโนมัติ</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            💡 สามารถเปิดอ่านคู่มือนี้ใหม่ได้ตลอดเวลาที่ปุ่ม <strong>"คู่มือใช้งาน"</strong> ในเมนูด้านบน
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-cyan-950/50 text-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>เข้าใจแล้ว / เริ่มใช้งานเว็บไซต์</span>
          </button>
        </div>

      </div>
    </div>
  );
}
