import React, { useState } from 'react';
import { 
  AlertTriangle, 
  LifeBuoy, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  ShieldAlert, 
  PlusCircle, 
  RefreshCw, 
  Home, 
  Battery, 
  Compass,
  HeartHandshake,
  MessageSquare,
  BookOpen,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenSosModal, 
  onOpenReportModal, 
  onOpenRouteChecker, 
  onOpenDonationModal,
  onOpenSafetyModal,
  onOpenFeedbackModal,
  onOpenGuideModal,
  pendingSosCount = 0, 
  hasSampleData = false, 
  onClearSampleData, 
  onRefresh, 
  isRefreshing = false, 
  batterySaver = false, 
  onToggleBatterySaver 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 shadow-xl w-full max-w-full select-none">
      
      {/* Sample data notice banner */}
      {hasSampleData && (
        <div className="bg-amber-950/95 border-b border-amber-600/40 px-2.5 sm:px-3 py-1 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-1.5 w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-amber-400 shrink-0">ℹ️ โหมดทดสอบ:</span>
            <span className="truncate text-[11px] sm:text-xs">ข้อมูลตัวอย่างจำลองเพื่อทดสอบระบบ</span>
          </div>
          <button
            onClick={onClearSampleData}
            className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] sm:text-[11px] shadow transition-colors shrink-0"
            title="ลบข้อมูลตัวอย่างทั้งหมด เพื่อเตรียมรับข้อมูลจริงจากประชาชน"
          >
            🗑️ ลบข้อมูลตัวอย่าง
          </button>
        </div>
      )}

      {/* Top emergency announcement ticker (Infinite Loop Marquee) */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-950 border-b border-rose-800/60 py-1 text-[11px] sm:text-xs text-rose-200 flex items-center w-full overflow-hidden shrink-0 select-none shadow-inner">
        {/* Fixed Left Badge: เตือนภัย */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 bg-red-900 border-r border-red-700/60 z-10 shrink-0 font-bold text-white shadow-md">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
          </span>
          <span className="text-[11px] sm:text-xs tracking-wide">เตือนภัย & ข้อควรทราบ</span>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="flex-1 overflow-hidden relative min-w-0 flex items-center">
          <div className="animate-marquee-scroll flex items-center gap-12 py-0.5 text-rose-100 text-[11px] sm:text-xs font-medium cursor-default">
            <span>
              📢 <strong>ข้อควรทราบ:</strong> เว็บไซต์นี้เป็นเพียงสื่อกลางข้อมูลสำหรับประกอบการตัดสินใจเดินทางและตรวจสอบพื้นที่น้ำท่วม • <strong>การขอความช่วยเหลือผ่านเว็บไม่สามารถติดต่อกู้ภัยให้ได้โดยตรง</strong> หากมีเหตุฉุกเฉิน <strong>โปรดโทรสายด่วน 1669 / 1784 หรือเบอร์กู้ภัยในเว็บก่อนเสมอ</strong> แล้วจึงค่อยลงขอความช่วยเหลือ • เว็บไซต์ช่วยให้ผู้มีความสามารถในพื้นที่เห็นพิกัดเพื่อเข้าช่วยเหลือได้ทันท่วงที • ร่วมด้วยช่วยกันคนละไม้คนละมือ เพื่อให้ทุกคนปลอดภัย
            </span>
            <span className="text-amber-400 font-bold">✦ ✦ ✦</span>
            <span>
              📢 <strong>ข้อควรทราบ:</strong> เว็บไซต์นี้เป็นเพียงสื่อกลางข้อมูลสำหรับประกอบการตัดสินใจเดินทางและตรวจสอบพื้นที่น้ำท่วม • <strong>การขอความช่วยเหลือผ่านเว็บไม่สามารถติดต่อกู้ภัยให้ได้โดยตรง</strong> หากมีเหตุฉุกเฉิน <strong>โปรดโทรสายด่วน 1669 / 1784 หรือเบอร์กู้ภัยในเว็บก่อนเสมอ</strong> แล้วจึงค่อยลงขอความช่วยเหลือ • เว็บไซต์ช่วยให้ผู้มีความสามารถในพื้นที่เห็นพิกัดเพื่อเข้าช่วยเหลือได้ทันท่วงที • ร่วมด้วยช่วยกันคนละไม้คนละมือ เพื่อให้ทุกคนปลอดภัย
            </span>
            <span className="text-amber-400 font-bold">✦ ✦ ✦</span>
          </div>
        </div>

        {/* Fixed Right Hotline */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-white text-[11px] font-bold bg-red-900/90 px-3 py-0.5 border-l border-red-700/60 shrink-0 z-10">
          <span>สายด่วน 1669 / 1784</span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="w-full px-2.5 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-13 sm:h-15 gap-2">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('map')} 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group shrink-0 min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-heading font-bold text-sm sm:text-base lg:text-lg text-white tracking-wide truncate">
                  <span className="inline sm:hidden">สระแก้ว สู้ภัย</span>
                  <span className="hidden sm:inline">สระแก้ว สู้ภัยน้ำท่วม</span>
                </span>
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-600/30 text-rose-400 border border-rose-500/30 shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block truncate">
                ระบบรายงานเส้นทางน้ำท่วม & ศูนย์ขอความช่วยเหลือฉุกเฉิน
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop: Centered to balance layout & eliminate empty left gap) */}
          <nav className="hidden md:flex items-center justify-center gap-1 flex-1 mx-2 min-w-0">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>แผนที่น้ำท่วม</span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'routes'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-4 h-4 shrink-0" />
              <span>สรุปเส้นทาง</span>
            </button>

            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'shelters'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4 text-sky-400 shrink-0" />
              <span>ศูนย์พักพิง</span>
            </button>

            <button
              onClick={() => setActiveTab('rescue')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 relative whitespace-nowrap shrink-0 ${
                activeTab === 'rescue'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LifeBuoy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ศูนย์กู้ภัย</span>
              {pendingSosCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
                  {pendingSosCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'contacts'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>เบอร์ฉุกเฉิน</span>
            </button>
          </nav>

          {/* Desktop Toolbar (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* เช็กเส้นทาง */}
            <button
              onClick={onOpenRouteChecker}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all hover:border-cyan-500 hover:text-cyan-300"
              title="เช็กความปลอดภัยของเส้นทางก่อนออกเดินทาง"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden lg:inline">เช็กเส้นทาง</span>
            </button>

            {/* รายงานน้ำท่วม */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-all hover:border-amber-500 hover:text-amber-300"
              title="แจ้งจุดน้ำท่วมหรือรายงานเส้นทางเลี่ยง"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden lg:inline">แจ้งน้ำท่วม</span>
            </button>

            {/* จุดแจก/รับบริจาค */}
            <button
              onClick={onOpenDonationModal}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-all hover:border-orange-500 hover:text-orange-300"
              title="เพิ่มจุดแจกอาหาร โรงครัว หรือเปิดจุดรับบริจาค"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="hidden xl:inline">จุดแจก/บริจาค</span>
            </button>

            {/* ข้อควรระวังน้ำท่วม */}
            <button
              onClick={onOpenSafetyModal}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-all hover:border-amber-500 hover:text-amber-300"
              title="ข้อควรระวัง & คู่มือเอาชีวิตรอด (ไฟดูด, สัตว์มีพิษ, โรคติดต่อ)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden xl:inline">ข้อควรระวัง</span>
            </button>

            {/* ส่งข้อเสนอแนะ Feedback */}
            <button
              onClick={onOpenFeedbackModal}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-all hover:border-cyan-500 hover:text-cyan-300"
              title="ส่งข้อเสนอแนะหรือแจ้งสิ่งที่อยากให้ปรับปรุงแก้ไข"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden xl:inline">ข้อเสนอแนะ</span>
            </button>

            {/* คู่มือใช้งานเว็บไซต์ (สำหรับทุกคนและผู้สูงอายุ) */}
            <button
              onClick={onOpenGuideModal}
              className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-all hover:border-sky-500 hover:text-sky-300"
              title="คู่มือแนะนำวิธีใช้งานเว็บไซต์ (สำหรับทุกคนและผู้สูงอายุ)"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden xl:inline">คู่มือใช้งาน</span>
            </button>

            {/* โหมดประหยัดแบตเตอรี่ */}
            <button
              onClick={onToggleBatterySaver}
              className={`px-2 py-1.5 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold border transition-all ${
                batterySaver
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="เปิด/ปิดโหมดประหยัดแบตเตอรี่ (ลดการใช้พลังงานมือถือ)"
            >
              <Battery className={`w-3.5 h-3.5 ${batterySaver ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">{batterySaver ? 'แบต: ประหยัด' : 'ประหยัดแบต'}</span>
            </button>

            {/* ปุ่มรีเฟรชข้อมูลเรียลไทม์ */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-sm transition-all hover:border-slate-500"
              title="ดึงข้อมูลสถานการณ์สดล่าสุด"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* ปุ่มขอความช่วยเหลือ SOS Desktop */}
            <button
              onClick={onOpenSosModal}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold h-8 sm:h-9 px-3 sm:px-3.5 rounded-xl shadow-lg shadow-rose-950/60 transition-all transform active:scale-95 border border-rose-400/50 shrink-0"
              title="ขอความช่วยเหลือฉุกเฉิน (SOS)"
            >
              <span className="flex h-2 w-2 relative shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90 ${batterySaver ? 'hidden' : ''}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="tracking-wide text-xs sm:text-sm whitespace-nowrap">
                ขอความช่วยเหลือ (SOS)
              </span>
            </button>

          </div>

          {/* Mobile Right Bar (Spacious, Clean, Never crowded) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* ปุ่มรีเฟรช */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-sm transition-all active:scale-95 shrink-0"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* ปุ่มรวมเมนูเครื่องมือ */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-all active:scale-95 shrink-0 ${
                isMobileMenuOpen
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-900/30'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="เมนูเครื่องมือช่วยเหลือ"
            >
              {isMobileMenuOpen ? (
                <X className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Menu className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>เมนู</span>
            </button>

            {/* ปุ่ม SOS เด่น ปลอดภัย ไม่โดนเบียด ไม่ตกขอบ */}
            <button
              onClick={onOpenSosModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 active:scale-95 text-white font-black h-8 px-3 rounded-xl shadow-lg shadow-rose-950/60 border border-rose-400/50 shrink-0"
              title="ขอความช่วยเหลือฉุกเฉิน (SOS)"
            >
              <span className="flex h-2 w-2 relative shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90 ${batterySaver ? 'hidden' : ''}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="tracking-wider text-xs whitespace-nowrap">
                🚨 SOS
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu (Clean 2-Column Grid) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/98 border-t border-slate-800/90 px-3 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <span>⚡</span> เมนูเครื่องมือและบริการ
            </span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              aria-label="ปิดเมนู"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 1. เช็กเส้นทาง */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenRouteChecker(); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-cyan-300 truncate">เช็กเส้นทาง</div>
                <div className="text-[10px] text-slate-400 truncate">ตรวจทางปลอดภัย</div>
              </div>
            </button>

            {/* 2. แจ้งน้ำท่วม */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenReportModal(); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/30 flex items-center justify-center shrink-0">
                <PlusCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 truncate">แจ้งน้ำท่วม</div>
                <div className="text-[10px] text-slate-400 truncate">จุดเสี่ยง/น้ำท่วม</div>
              </div>
            </button>

            {/* 3. จุดแจก/รับบริจาค */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenDonationModal(); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-950 border border-orange-500/30 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4 text-orange-400" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-orange-300 truncate">จุดแจก/บริจาค</div>
                <div className="text-[10px] text-slate-400 truncate">โรงครัว & รับของ</div>
              </div>
            </button>

            {/* 4. ข้อควรระวัง */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenSafetyModal(); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 truncate">ข้อควรระวัง</div>
                <div className="text-[10px] text-slate-400 truncate">ไฟดูด/สัตว์มีพิษ</div>
              </div>
            </button>

            {/* 5. ข้อเสนอแนะ */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenFeedbackModal(); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-cyan-300 truncate">ข้อเสนอแนะ</div>
                <div className="text-[10px] text-slate-400 truncate">แจ้งปรับปรุงระบบ</div>
              </div>
            </button>

            {/* 6. คู่มือแนะนำวิธีใช้งาน */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenGuideModal(); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-sky-500/50 hover:bg-slate-800 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/30 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sky-300 truncate">คู่มือใช้งาน</div>
                <div className="text-[10px] text-slate-400 truncate">สอนใช้เว็บ 1 นาที</div>
              </div>
            </button>

            {/* 6. โหมดประหยัดแบต */}
            <button
              onClick={() => { onToggleBatterySaver(); }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left active:scale-[0.98] transition-all ${
                batterySaver 
                  ? 'bg-emerald-950/80 border-emerald-500/60' 
                  : 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                batterySaver ? 'bg-emerald-900 border-emerald-400/50' : 'bg-slate-700/60 border-slate-600'
              }`}>
                <Battery className={`w-4 h-4 ${batterySaver ? 'text-emerald-300' : 'text-slate-400'}`} />
              </div>
              <div className="min-w-0">
                <div className={`font-bold truncate ${batterySaver ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {batterySaver ? 'ประหยัดแบต: เปิด' : 'ประหยัดแบต: ปิด'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {batterySaver ? 'กำลังลดพลังงาน' : 'แตะเพื่อเปิดโหมด'}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
