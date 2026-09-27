import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  Trash2, 
  MessageSquare, 
  MapPin, 
  Key, 
  Lock, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  Copy, 
  CheckCircle2, 
  Dices, 
  LifeBuoy, 
  Utensils, 
  Phone,
  Download,
  Upload,
  Database,
  FileJson,
  CheckCheck,
  XCircle
} from 'lucide-react';
import { formatThaiDateTime } from '../utils/geo';

export default function AdminDashboardModal({ 
  isOpen, 
  onClose, 
  floods = [], 
  sosRequests = [], 
  donations = [], 
  onRefreshAllData,
  onDeleteFlood,
  onDeleteSos,
  onDeleteDonation
}) {
  const [activeTab, setActiveTab] = useState('feedbacks'); // feedbacks, points, security, backup
  const [pointsSubTab, setPointsSubTab] = useState('all'); // all, floods, sos, donations
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Export / Import Data State (ต้องประกาศก่อน if (!isOpen) return null ตามกฎ React Hooks)
  const [importStatus, setImportStatus] = useState(null); // null | { type: 'loading'|'success'|'error', text: string }
  const [isExporting, setIsExporting] = useState(false);

  // Security Settings State
  const [currentSecretKey, setCurrentSecretKey] = useState('');
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState({ type: '', text: '' });

  // Safe Array Wrappers ป้องกัน Props หรือ State เป็น null/undefined
  const safeFloods = Array.isArray(floods) ? floods : [];
  const safeSos = Array.isArray(sosRequests) ? sosRequests : [];
  const safeDonations = Array.isArray(donations) ? donations : [];
  const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];

  // Fetch Feedbacks & Current Secret Key
  const fetchFeedbacksAndConfig = async () => {
    setLoadingFeedbacks(true);
    try {
      const [fbRes, confRes] = await Promise.all([
        fetch('/api/feedbacks').catch(() => null),
        fetch('/api/admin/config').catch(() => null)
      ]);

      if (fbRes && fbRes.ok) {
        const fbData = await fbRes.json();
        setFeedbacks(Array.isArray(fbData) ? fbData : []);
      }

      if (confRes && confRes.ok) {
        const confData = await confRes.json();
        setCurrentSecretKey(confData?.secretKey || '');
        setNewSecretKey(confData?.secretKey || '');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFeedbacksAndConfig();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle feedback read status
  const handleToggleFeedbackStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'read' ? 'unread' : 'read';
      const res = await fetch(`/api/feedbacks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('คุณต้องการลบข้อความ Feedback นี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate 48-char random alphanumeric key
  const handleGenerateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewSecretKey(result);
  };

  // Save Security Settings
  const handleSaveSecuritySettings = async (e) => {
    e.preventDefault();
    setSettingsNotice({ type: '', text: '' });

    const trimmedKey = (newSecretKey || '').trim();
    if (trimmedKey.length !== 48) {
      setSettingsNotice({ type: 'error', text: `Secret Key ต้องยาว 48 ตัวอักษรพอดี (ปัจจุบัน: ${trimmedKey.length} ตัวอักษร)` });
      return;
    }

    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newSecretKey: newSecretKey.trim(),
          newPassword: newPassword.trim() ? newPassword.trim() : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentSecretKey(data.secretKey);
        setNewPassword('');
        setSettingsNotice({ type: 'success', text: 'บันทึกการตั้งค่าความปลอดภัยเรียบร้อยแล้ว!' });
      } else {
        setSettingsNotice({ type: 'error', text: data.error || 'ไม่สามารถบันทึกได้' });
      }
    } catch (err) {
      setSettingsNotice({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(newSecretKey || currentSecretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // ===== Export / Import Data =====
  // Export ข้อมูลทั้งหมดเป็นไฟล์ JSON
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [floodsRes, sosRes, donationsRes, centersRes, sheltersRes] = await Promise.all([
        fetch('/api/floods').catch(() => null),
        fetch('/api/sos').catch(() => null),
        fetch('/api/donations').catch(() => null),
        fetch('/api/rescue-centers').catch(() => null),
        fetch('/api/shelters').catch(() => null),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        floods: floodsRes?.ok ? await floodsRes.json() : [],
        sos: sosRes?.ok ? await sosRes.json() : [],
        donations: donationsRes?.ok ? await donationsRes.json() : [],
        rescueCenters: centersRes?.ok ? await centersRes.json() : [],
        shelters: sheltersRes?.ok ? await sheltersRes.json() : [],
      };

      // สร้างไฟล์ JSON แล้วให้ browser download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `sakaeo-flood-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการ Export ข้อมูล: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Import ข้อมูลจากไฟล์ JSON ที่ export ไว้
  const handleImportData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset input

    setImportStatus({ type: 'loading', text: 'กำลังอ่านไฟล์...' });

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.floods && !data.sos && !data.donations) {
        setImportStatus({ type: 'error', text: 'ไฟล์ไม่ถูกต้อง — ต้องเป็นไฟล์ backup จากระบบนี้เท่านั้น' });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      const importCollection = async (items, endpoint) => {
        for (const item of (items || [])) {
          // ข้ามข้อมูลตัวอย่าง (isSample)
          if (item.isSample) continue;
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            });
            if (res.ok) successCount++;
            else errorCount++;
          } catch {
            errorCount++;
          }
        }
      };

      setImportStatus({ type: 'loading', text: 'กำลังนำเข้าข้อมูลน้ำท่วม...' });
      await importCollection(data.floods, '/api/floods');

      setImportStatus({ type: 'loading', text: 'กำลังนำเข้าข้อมูล SOS...' });
      await importCollection(data.sos, '/api/sos');

      setImportStatus({ type: 'loading', text: 'กำลังนำเข้าจุดแจก/บริจาค...' });
      await importCollection(data.donations, '/api/donations');

      if (onRefreshAllData) onRefreshAllData();

      setImportStatus({
        type: 'success',
        text: `นำเข้าข้อมูลสำเร็จ ${successCount} รายการ${errorCount > 0 ? ` (ล้มเหลว ${errorCount} รายการ)` : ''}`
      });
      setTimeout(() => setImportStatus(null), 6000);
    } catch (err) {
      setImportStatus({ type: 'error', text: 'อ่านไฟล์ไม่ได้ — ตรวจสอบว่าไฟล์เป็น JSON ที่ถูกต้อง' });
    }
  };

  const unreadFeedbackCount = safeFeedbacks.filter(f => f?.status !== 'read').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[94vh] max-h-[850px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-white">
                  แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                  MASTER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                จัดการลบจุดบนแผนที่ • อ่านข้อเสนอแนะ • ตั้งค่า Secret Key 48 ตัวอักษร
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Scrollable on mobile) */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-2 sm:px-6 gap-1 sm:gap-2 shrink-0 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'feedbacks'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>กล่องข้อเสนอแนะ (Feedbacks)</span>
            {unreadFeedbackCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-600 text-white animate-pulse">
                {unreadFeedbackCount} ใหม่
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('points')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'points'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>จัดการและลบจุดบนแผนที่ ({safeFloods.length + safeSos.length + safeDonations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'security'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Secret Key & รหัสผ่าน</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'backup'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Export / Import</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-900/60">
          
          {/* TAB 1: FEEDBACKS */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">
                    ข้อเสนอแนะจากประชาชน / ผู้ใช้งาน ({feedbacks.length})
                  </h4>
                  <p className="text-xs text-slate-400">
                    สิ่งที่ประชาชนแจ้งเข้ามาว่าอยากให้เว็บแก้ไข หรือปรับปรุงเพิ่มเติม
                  </p>
                </div>
                <button
                  onClick={fetchFeedbacksAndConfig}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingFeedbacks ? 'animate-spin' : ''}`} />
                  <span>รีเฟรช</span>
                </button>
              </div>

              {safeFeedbacks.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs sm:text-sm">
                  💬 ยังไม่มีข้อเสนอแนะส่งเข้ามาในขณะนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {safeFeedbacks.map(item => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.status === 'read'
                          ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                          : 'bg-slate-800/90 border-cyan-500/40 shadow-lg text-slate-100'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            (item?.category || '').includes('แก้ไข') 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {item?.category || 'ข้อเสนอแนะ'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatThaiDateTime(item?.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleFeedbackStatus(item.id, item.status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                              item.status === 'read'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                            }`}
                          >
                            {item.status === 'read' ? 'ทำเป็นยังไม่อ่าน' : '✓ มาร์กอ่านแล้ว'}
                          </button>

                          <button
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                            title="ลบข้อความนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        {item.message}
                      </p>

                      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>ส่งโดย: <strong>{item.name || 'ผู้ใช้งาน'}</strong></span>
                        {item.contactInfo && (
                          <span className="text-cyan-400">ติดต่อ: {item.contactInfo}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE & DELETE MAP POINTS */}
          {activeTab === 'points' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">
                    จัดการลบจุดต่างๆ บนแผนที่
                  </h4>
                  <p className="text-xs text-slate-400">
                    Admin สามารถเลือกกดลบจุดน้ำท่วม, คำขอ SOS หรือจุดแจกอาหารที่ผิดพลาดได้ทันที
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => setPointsSubTab('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      pointsSubTab === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setPointsSubTab('floods')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      pointsSubTab === 'floods' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    น้ำท่วม ({safeFloods.length})
                  </button>
                  <button
                    onClick={() => setPointsSubTab('sos')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      pointsSubTab === 'sos' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SOS ({safeSos.length})
                  </button>
                  <button
                    onClick={() => setPointsSubTab('donations')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      pointsSubTab === 'donations' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    จุดบริจาค ({safeDonations.length})
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {/* FLOODS */}
                {(pointsSubTab === 'all' || pointsSubTab === 'floods') && safeFloods.map(item => (
                  <div key={item.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          item.severity === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          item.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {item.severity === 'danger' ? '🔴 ทางขาด' : item.severity === 'warning' ? '🟡 เฝ้าระวัง' : '🟢 ปลอดภัย'}
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm truncate">{item.title}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">
                        {item.district ? `อ.${item.district}` : ''} • ระดับน้ำ: {item.waterLevel || 'ไม่ระบุ'} • รายงาน: {item.reporterName || 'ไม่ระบุ'}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (window.confirm(`Admin: ต้องการลบจุด "${item.title}" ออกจากแผนที่ใช่หรือไม่?`)) {
                          if (onDeleteFlood) await onDeleteFlood(item.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow shrink-0 transition-transform active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบจุดนี้</span>
                    </button>
                  </div>
                ))}

                {/* SOS */}
                {(pointsSubTab === 'all' || pointsSubTab === 'sos') && safeSos.map(item => (
                  <div key={item.id} className="bg-slate-800/80 border border-rose-600/40 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-600 text-white">
                          🚨 SOS ผู้ประสบภัย
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm truncate">{item.name}</span>
                        <span className="text-yellow-300 font-mono text-xs">({item.phone})</span>
                      </div>
                      <div className="text-slate-300 text-[11px] truncate">
                        📍 {item.district ? `อ.${item.district}` : (item.address ? item.address.slice(0, 30) : 'พิกัด GPS')} {item.landmark ? `(${item.landmark})` : ''} • ต้องการ: {Array.isArray(item.urgentNeeds) ? item.urgentNeeds.join(', ') : (item.urgentNeeds || '-')}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (window.confirm(`Admin: ต้องการลบคำขอ SOS ของ "${item.name}" ใช่หรือไม่?`)) {
                          if (onDeleteSos) await onDeleteSos(item.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow shrink-0 transition-transform active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ SOS</span>
                    </button>
                  </div>
                ))}

                {/* DONATIONS */}
                {(pointsSubTab === 'all' || pointsSubTab === 'donations') && safeDonations.map(item => (
                  <div key={item.id} className="bg-slate-800/80 border border-orange-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-600 text-white">
                          🍲 จุดแจก/บริจาค
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm truncate">{item.title}</span>
                      </div>
                      <div className="text-slate-300 text-[11px] truncate">
                        📞 {item.contactPhone || '-'} • ผู้จัดตั้ง: {item.organizerName || '-'} • {item.district ? `อ.${item.district}` : ''}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (window.confirm(`Admin: ต้องการลบจุดแจกบริจาค "${item.title}" ใช่หรือไม่?`)) {
                          if (onDeleteDonation) await onDeleteDonation(item.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow shrink-0 transition-transform active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบจุดบริจาค</span>
                    </button>
                  </div>
                ))}

                {safeFloods.length === 0 && safeSos.length === 0 && safeDonations.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    ไม่มีรายการจุดใดๆ ในขณะนี้
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & SECRET KEY SETTINGS */}
          {activeTab === 'security' && (
            <div className="max-w-xl mx-auto space-y-5">
              <div>
                <h4 className="font-heading font-bold text-base text-white">
                  ตั้งค่าความปลอดภัย & Secret Search Key (48 ตัวอักษร)
                </h4>
                <p className="text-xs text-slate-400">
                  วิธีเข้าสู่ระบบ Admin ทำได้โดยนำ Secret Key ด้านล่างนี้ไปพิมพ์ลงในช่องค้นหาบนแผนที่
                </p>
              </div>

              {settingsNotice.text && (
                <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  settingsNotice.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/80 border border-rose-600/60 text-rose-200'
                }`}>
                  {settingsNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{settingsNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveSecuritySettings} className="space-y-4">
                
                {/* 48-char Secret Key Field */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Secret Search Key (ต้องยาว 48 ตัวอักษรพอดี):</span>
                    </label>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      (newSecretKey || '').trim().length === 48 
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' 
                        : 'bg-rose-950 border border-rose-500 text-rose-300'
                    }`}>
                      {(newSecretKey || '').trim().length} / 48 ตัว
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newSecretKey}
                      onChange={e => setNewSecretKey(e.target.value)}
                      placeholder="กรอก Key ภาษาอังกฤษและตัวเลข 48 ตัวอักษร"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 pr-20"
                    />
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-400">
                      * สามารถกดปุ่มสุ่มเพื่อสร้างคีย์ 48 ตัวใหม่ได้ทันที
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateRandomKey}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>🎲 สุ่ม Key 48 ตัวใหม่</span>
                    </button>
                  </div>
                </div>

                {/* Change Admin Password */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>เปลี่ยนรหัสผ่าน Admin ใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน):</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    * รหัสผ่านเดิมคือ <span className="font-mono text-amber-300">admin</span> หากไม่ได้เปลี่ยน
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าความปลอดภัย'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 4: EXPORT / IMPORT BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-violet-400" />
                  สำรอง & กู้คืนข้อมูล (Backup & Restore)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Export ข้อมูลทั้งหมดเป็นไฟล์ JSON เก็บไว้ แล้วนำกลับมา Import ได้ทุกเมื่อ
                </p>
              </div>

              {/* Status Indicator */}
              {importStatus && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium ${
                  importStatus.type === 'loading' ? 'bg-blue-900/40 border-blue-700 text-blue-300' :
                  importStatus.type === 'success' ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300' :
                  'bg-red-900/40 border-red-700 text-red-300'
                }`}>
                  {importStatus.type === 'loading' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
                  {importStatus.type === 'success' && <CheckCheck className="w-4 h-4 shrink-0" />}
                  {importStatus.type === 'error' && <XCircle className="w-4 h-4 shrink-0" />}
                  <span className="text-xs">{importStatus.text}</span>
                </div>
              )}

              {/* Export Card */}
              <div className="bg-slate-800/80 border border-violet-700/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">📤 Export — ดาวน์โหลดสำรองข้อมูล</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ดาวน์โหลดข้อมูลทั้งหมด (จุดน้ำท่วม, SOS, จุดแจก) เป็นไฟล์ .json เก็บไว้ในเครื่อง
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isExporting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /><span>กำลัง Export...</span></>
                  ) : (
                    <><Download className="w-4 h-4" /><span>Export ข้อมูลทั้งหมด (.json)</span></>
                  )}
                </button>
                <p className="text-[11px] text-slate-500">
                  💡 แนะนำ: Export ทุกครั้งก่อน deploy โค้ดใหม่ขึ้น GitHub เพื่อป้องกันข้อมูลหาย
                </p>
              </div>

              {/* Import Card */}
              <div className="bg-slate-800/80 border border-amber-700/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">📥 Import — กู้คืนข้อมูล</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      อัปโหลดไฟล์ .json ที่ Export ไว้ก่อนหน้า เพื่อกู้คืนข้อมูลที่หายไปหลัง deploy
                    </div>
                  </div>
                </div>

                <label className="block w-full cursor-pointer">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportData}
                    className="hidden"
                    disabled={importStatus?.type === 'loading'}
                  />
                  <div className={`w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    importStatus?.type === 'loading'
                      ? 'border-slate-600 text-slate-500 cursor-not-allowed'
                      : 'border-amber-600/60 text-amber-300 hover:border-amber-500 hover:bg-amber-900/20 active:scale-95'
                  }`}>
                    <FileJson className="w-4 h-4" />
                    <span>{importStatus?.type === 'loading' ? 'กำลังนำเข้า...' : 'เลือกไฟล์ Backup (.json) เพื่อ Import'}</span>
                  </div>
                </label>

                <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    ข้อควรระวังก่อน Import
                  </p>
                  <ul className="text-[11px] text-amber-200/70 space-y-1 list-disc list-inside">
                    <li>ข้อมูลที่ Import จะถูก <strong>เพิ่มเข้า</strong> ไปในฐานข้อมูลปัจจุบัน ไม่ได้แทนที่</li>
                    <li>ถ้า deploy ใหม่แล้วข้อมูลหาย → Import ได้เลย ข้อมูลจะกลับมา</li>
                    <li>ข้อมูลตัวอย่าง (isSample) จะถูกข้ามไปอัตโนมัติ</li>
                    <li>รองรับเฉพาะไฟล์ที่ Export จากระบบนี้เท่านั้น</li>
                  </ul>
                </div>
              </div>

              {/* Workflow Guide */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-300">📋 ขั้นตอนป้องกันข้อมูลหาย (ทำทุกครั้งก่อน deploy)</p>
                <ol className="text-[11px] text-slate-400 space-y-1.5 list-decimal list-inside">
                  <li>เข้า Admin Dashboard → แท็บ Export/Import</li>
                  <li>กด <span className="text-violet-300 font-semibold">Export ข้อมูลทั้งหมด</span> → บันทึกไฟล์ไว้ในเครื่อง</li>
                  <li>ลากโฟลเดอร์ <code className="bg-slate-700 px-1 rounded text-amber-300">src/</code> ขึ้น GitHub → Render auto-deploy</li>
                  <li>รอ deploy เสร็จ → เข้า Admin Dashboard อีกครั้ง</li>
                  <li>กด <span className="text-amber-300 font-semibold">Import</span> → เลือกไฟล์ที่บันทึกไว้ → ข้อมูลกลับมาครบ ✅</li>
                </ol>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
