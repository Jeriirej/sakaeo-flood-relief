import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, CheckCircle2, Monitor, HelpCircle } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);
  const [showInstalledToast, setShowInstalledToast] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Check if dismissed before
    const dismissed = localStorage.getItem('sakaeo_pwa_dismissed') === 'true';

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    if (isAppleDevice && !dismissed && !standalone) {
      setShowBanner(true);
    }

    // Android / Chrome / Edge beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed && !standalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Listen to menu button trigger
  useEffect(() => {
    const handleTriggerInstall = async () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      if (standalone) {
        setShowInstalledToast(true);
        setTimeout(() => setShowInstalledToast(false), 4000);
        return;
      }

      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            setShowBanner(false);
          }
          setDeferredPrompt(null);
        } catch {
          setShowGeneralGuide(true);
        }
      } else if (isIos) {
        setShowIosGuide(true);
      } else {
        // Fallback guide if browser doesn't expose prompt yet
        setShowGeneralGuide(true);
      }
    };

    window.addEventListener('trigger-pwa-install', handleTriggerInstall);
    return () => window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
  }, [deferredPrompt, isIos]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch {
        setShowGeneralGuide(true);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      setShowGeneralGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('sakaeo_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <>
      {/* Top Banner (Visible when promptable and not dismissed) */}
      {showBanner && !isStandalone && (
        <div className="bg-gradient-to-r from-rose-900/95 via-slate-900/98 to-slate-900/95 border-b border-rose-500/40 px-3 py-2 text-white shadow-xl z-30 relative select-none animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                  <span>ติดตั้งสระแก้วสู้ภัยน้ำท่วมเป็นแอปมือถือ</span>
                  <span className="text-[10px] bg-rose-500/30 text-rose-300 px-1 rounded font-normal">PWA</span>
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  เปิดเต็มจอ โหลดไวขึ้น และเปิดใช้งานได้แม้อยู่ในจุดสัญญาณเน็ตไม่ดี
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ติดตั้งแอป</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="ปิดการแจ้งเตือน"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already Installed Toast */}
      {showInstalledToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 border border-emerald-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>ท่านกำลังใช้งานผ่านแอปที่ติดตั้งแล้วเรียบร้อย 👍</span>
        </div>
      )}

      {/* iOS Safari Instruction Popup */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-sm w-full text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-rose-400 font-bold text-base">
              <Share className="w-5 h-5" />
              <span>วิธีติดตั้งบน iPhone / iPad</span>
            </div>

            <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <li>
                แตะที่ปุ่ม <strong className="text-white">แชร์ (Share ⎋)</strong> ที่แถบด้านล่างของ Safari
              </li>
              <li>
                เลื่อนลงมาแล้วเลือก <strong className="text-rose-400 font-semibold">"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong>
              </li>
              <li>
                แตะ <strong className="text-emerald-400 font-semibold">"เพิ่ม" (Add)</strong> ที่มุมบนขวา
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full mt-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* General Guide Popup (Android / Chrome / Edge) */}
      {showGeneralGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-sm w-full text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowGeneralGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-rose-400 font-bold text-base">
              <Smartphone className="w-5 h-5" />
              <span>วิธีติดตั้งลงอุปกรณ์ของคุณ</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>มือถือ Android (Chrome)</span>
                </div>
                <p className="text-slate-300">
                  แตะที่เมนู <strong className="text-white">จุดสามจุด (⋮)</strong> มุมขวาบนของเบราว์เซอร์ แล้วเลือก <strong className="text-amber-300">"ติดตั้งแอป"</strong> หรือ <strong className="text-amber-300">"เพิ่มลงในหน้าจอหลัก"</strong>
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1.5">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>คอมพิวเตอร์ (Chrome / Edge)</span>
                </div>
                <p className="text-slate-300">
                  คลิกที่ไอคอน <strong className="text-white">ติดตั้ง (⊞ หรือ ⬇)</strong> ที่ด้านขวาสุดของช่องกรอก URL (Address bar) ด้านบน
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGeneralGuide(false)}
              className="w-full mt-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
