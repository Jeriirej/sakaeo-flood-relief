import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import FloodMap from './components/FloodMap';
import RescueDashboard from './components/RescueDashboard';
import RoadList from './components/RoadList';
import ShelterList from './components/ShelterList';
import EmergencyDirectory from './components/EmergencyDirectory';
import SosModal from './components/SosModal';
import ReportFloodModal from './components/ReportFloodModal';
import UpdateFloodModal from './components/UpdateFloodModal';
import RouteCheckerModal from './components/RouteCheckerModal';
import AddDonationModal from './components/AddDonationModal';
import FloodSafetyModal from './components/FloodSafetyModal';
import FeedbackModal from './components/FeedbackModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import WeatherAlertBanner from './components/WeatherAlertBanner';
import MySosBanner from './components/MySosBanner';
import { MapPin, Navigation, Home, LifeBuoy, PhoneCall } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map'); // map, routes, rescue, shelters, contacts
  
  // Local storage caching initialization for offline resilience
  const [floods, setFloods] = useState(() => {
    try {
      const cached = localStorage.getItem('sakaeo_floods_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [sosRequests, setSosRequests] = useState(() => {
    try {
      const cached = localStorage.getItem('sakaeo_sos_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Track user's own submitted SOS request from this device
  const [mySosId, setMySosId] = useState(() => {
    try {
      return localStorage.getItem('sakaeo_my_sos_id') || null;
    } catch {
      return null;
    }
  });

  const [shelters, setShelters] = useState(() => {
    try {
      const cached = localStorage.getItem('sakaeo_shelters_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Rescue Centers & Base Operations (ศูนย์กู้ภัย & ฐานปฏิบัติการช่วยเหลือ แยกจากผู้ประสบภัย)
  const [rescueCenters, setRescueCenters] = useState(() => {
    try {
      const cached = localStorage.getItem('sakaeo_rescue_centers_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Food Kitchens & Donation Distribution Points (จุดแจกอาหาร โรงครัว จุดรับบริจาค)
  const [donations, setDonations] = useState(() => {
    try {
      const cached = localStorage.getItem('sakaeo_donations_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [weatherAlert, setWeatherAlert] = useState(() => {
    try {
      const cached = localStorage.getItem('sakaeo_weather_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Battery saver mode
  const [batterySaver, setBatterySaver] = useState(() => {
    try {
      return localStorage.getItem('sakaeo_battery_saver') === 'true';
    } catch {
      return false;
    }
  });

  const toggleBatterySaver = () => {
    setBatterySaver(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sakaeo_battery_saver', String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Modals state
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRouteCheckerOpen, setIsRouteCheckerOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [selectedFloodToUpdate, setSelectedFloodToUpdate] = useState(null);
  const [reportInitialCoords, setReportInitialCoords] = useState(null); // พิกัดที่จะ pre-fill ใน ReportFloodModal

  // Map coordinate picking mode
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [locationPickerCallback, setLocationPickerCallback] = useState(null);
  const [tempPickerCoord, setTempPickerCoord] = useState(null);

  // Fetch all live data with offline cache sync
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [floodsRes, sosRes, sheltersRes, weatherRes, centersRes, donationsRes] = await Promise.all([
        fetch('/api/floods').catch(e => null),
        fetch('/api/sos').catch(e => null),
        fetch('/api/shelters').catch(e => null),
        fetch('/api/weather-alert').catch(e => null),
        fetch('/api/rescue-centers').catch(e => null),
        fetch('/api/donations').catch(e => null)
      ]);

      let hadSuccess = false;

      if (floodsRes && floodsRes.ok) {
        const floodsData = await floodsRes.json();
        setFloods(floodsData);
        localStorage.setItem('sakaeo_floods_cache', JSON.stringify(floodsData));
        hadSuccess = true;
      }

      if (sosRes && sosRes.ok) {
        const sosData = await sosRes.json();
        setSosRequests(sosData);
        localStorage.setItem('sakaeo_sos_cache', JSON.stringify(sosData));
        hadSuccess = true;
      }

      if (sheltersRes && sheltersRes.ok) {
        const sheltersData = await sheltersRes.json();
        setShelters(sheltersData);
        localStorage.setItem('sakaeo_shelters_cache', JSON.stringify(sheltersData));
        hadSuccess = true;
      }

      if (centersRes && centersRes.ok) {
        const centersData = await centersRes.json();
        setRescueCenters(centersData);
        localStorage.setItem('sakaeo_rescue_centers_cache', JSON.stringify(centersData));
        hadSuccess = true;
      }

      if (donationsRes && donationsRes.ok) {
        const donationsData = await donationsRes.json();
        setDonations(donationsData);
        localStorage.setItem('sakaeo_donations_cache', JSON.stringify(donationsData));
        hadSuccess = true;
      }

      if (weatherRes && weatherRes.ok) {
        const weatherData = await weatherRes.json();
        setWeatherAlert(weatherData);
        localStorage.setItem('sakaeo_weather_cache', JSON.stringify(weatherData));
        hadSuccess = true;
      }

      setIsOfflineMode(!hadSuccess);
    } catch (err) {
      console.warn('Network error, keeping offline cached data:', err);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh data every 20 seconds for real-time updates
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // เปิด ReportFloodModal พร้อมพิกัดที่ตั้งค่าล่วงหน้า (ถูกเรียกจาก FloodMap เมื่อผู้ใช้วางพิกัดในช่องค้นหา)
  const handleOpenReportModalWithCoords = (coords) => {
    setReportInitialCoords(coords);
    setIsReportModalOpen(true);
  };

  // Handle Pick Location from Map (used by SOS, Report, and Donation modals)
  const handleStartPickLocation = (callback, modalType) => {
    if (modalType === 'sos') setIsSosModalOpen(false);
    if (modalType === 'report') setIsReportModalOpen(false);
    if (modalType === 'donation') setIsDonationModalOpen(false);

    setIsSelectingLocation(true);
    setActiveTab('map');
    
    setLocationPickerCallback(() => (coords) => {
      callback(coords);
      setIsSelectingLocation(false);
      setTempPickerCoord(coords);
      // Re-open the corresponding modal
      if (modalType === 'sos') setIsSosModalOpen(true);
      if (modalType === 'report') setIsReportModalOpen(true);
      if (modalType === 'donation') setIsDonationModalOpen(true);
    });
  };

  const handleMapLocationSelected = (latlng) => {
    if (locationPickerCallback) {
      locationPickerCallback(latlng);
      setLocationPickerCallback(null);
    }
  };

  // Status Updater for Rescue
  const handleUpdateSosStatus = async (id, newStatus, assignedTo) => {
    try {
      const res = await fetch(`/api/sos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, assignedTo })
      });
      if (res.ok) {
        const updated = await res.json();
        setSosRequests(prev => prev.map(item => item.id === id ? updated : item));
      }
    } catch (err) {
      console.error('Error updating SOS status:', err);
    }
  };

  // จัดการลบจุดแจกอาหาร / โรงครัว / จุดรับบริจาค
  const handleDeleteDonation = async (id) => {
    try {
      const res = await fetch(`/api/donations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDonations(prev => {
          const updated = prev.filter(item => item.id !== id);
          localStorage.setItem('sakaeo_donations_cache', JSON.stringify(updated));
          return updated;
        });
        alert('ลบจุดแจกอาหาร/รับบริจาคเรียบร้อยแล้ว');
        return true;
      } else {
        const data = await res.json();
        alert(data.error || 'ไม่สามารถลบจุดแจกอาหารได้');
        return false;
      }
    } catch (err) {
      console.warn('Network error, deleting from local cache:', err);
      setDonations(prev => {
        const updated = prev.filter(item => item.id !== id);
        localStorage.setItem('sakaeo_donations_cache', JSON.stringify(updated));
        return updated;
      });
      alert('ลบจุดแจกอาหารออกจากเครื่องของคุณแล้ว');
      return true;
    }
  };

  // Admin ลบจุดน้ำท่วม
  const handleDeleteFlood = async (id) => {
    try {
      const res = await fetch(`/api/floods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFloods(prev => {
          const updated = prev.filter(item => item.id !== id);
          localStorage.setItem('sakaeo_floods_cache', JSON.stringify(updated));
          return updated;
        });
        alert('ลบจุดรายงานน้ำท่วมเรียบร้อยแล้ว');
        return true;
      }
    } catch (err) {
      console.warn('Error deleting flood:', err);
    }
  };

  // Admin ลบคำขอ SOS
  const handleDeleteSos = async (id) => {
    try {
      const res = await fetch(`/api/sos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSosRequests(prev => {
          const updated = prev.filter(item => item.id !== id);
          localStorage.setItem('sakaeo_sos_cache', JSON.stringify(updated));
          return updated;
        });
        alert('ลบคำขอความช่วยเหลือ SOS เรียบร้อยแล้ว');
        return true;
      }
    } catch (err) {
      console.warn('Error deleting SOS:', err);
    }
  };

  // Clear Sample Data
  const hasSampleData = floods.some(f => f.isSample) || sosRequests.some(s => s.isSample);

  const handleClearSampleData = async () => {
    const confirmDelete = window.confirm('คุณต้องการลบข้อมูลตัวอย่างจำลองทั้งหมดออกใช่หรือไม่? (จะเหลือเฉพาะข้อมูลจริงจากประชาชน)');
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/clear-sample', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'ลบข้อมูลตัวอย่างเรียบร้อยแล้ว');
        fetchData();
      }
    } catch (err) {
      alert('ไม่สามารถลบข้อมูลตัวอย่างได้');
    }
  };

  // จัดการยืนยันว่าปลอดภัยแล้ว หรือขอยกเลิกคำขอตนเอง
  const handleResolveMySos = async (id, action = 'resolved') => {
    try {
      const note = action === 'cancelled' 
        ? 'ผู้ประสบภัยกดยกเลิกคำขอด้วยตนเอง' 
        : 'ผู้ประสบภัยกดยืนยันว่าได้รับการช่วยเหลือและปลอดภัยแล้ว';

      await handleUpdateSosStatus(id, 'resolved', note);
      localStorage.removeItem('sakaeo_my_sos_id');
      localStorage.removeItem('sakaeo_my_sos_data');
      setMySosId(null);
      alert(action === 'cancelled' ? 'ยกเลิกคำขอเรียบร้อยแล้ว' : 'ขอบคุณที่แจ้งยืนยันความปลอดภัย ขอให้ท่านและครอบครัวปลอดภัยครับ');
    } catch (err) {
      console.error('Error resolving my SOS:', err);
    }
  };

  // ค้นหาข้อมูลคำขอของเครื่องนี้
  const mySos = mySosId ? sosRequests.find(s => s.id === mySosId) : null;

  const pendingSosCount = sosRequests.filter(s => s.status === 'pending').length;

  return (
    <div className={`h-screen h-[100dvh] max-h-screen w-full flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none ${batterySaver ? 'battery-saver' : ''}`}>
      
      {/* Offline Alert Indicator if network is down */}
      {isOfflineMode && (
        <div className="bg-amber-900/90 text-amber-200 text-xs px-3 py-1 text-center font-medium border-b border-amber-700 shrink-0">
          ⚠️ สัญญาณอินเทอร์เน็ตขาดหาย - กำลังแสดงข้อมูลที่บันทึกไว้ล่าสุดในเครื่องคุณ (Offline Mode)
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenRouteChecker={() => setIsRouteCheckerOpen(true)}
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
        pendingSosCount={pendingSosCount}
        hasSampleData={hasSampleData}
        onClearSampleData={handleClearSampleData}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        batterySaver={batterySaver}
        onToggleBatterySaver={toggleBatterySaver}
      />

      {/* Weather & River Gauges Live Ticker */}
      <WeatherAlertBanner weatherAlert={weatherAlert} />

      {/* My SOS Status Tracker & Quick Resolve Button */}
      <MySosBanner 
        mySos={mySos}
        onResolve={handleResolveMySos}
        onFocusOnMap={(sosItem) => {
          setActiveTab('map');
          setTempPickerCoord({ lat: sosItem.lat, lng: sosItem.lng });
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 min-h-0 w-full relative overflow-hidden flex flex-col">
        {activeTab === 'map' && (
          <FloodMap
            floods={floods}
            sosRequests={sosRequests}
            rescueCenters={rescueCenters}
            donations={donations}
            shelters={shelters}
            onSelectCoordinate={handleMapLocationSelected}
            isSelectingLocation={isSelectingLocation}
            selectedTempCoord={tempPickerCoord}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenReportModalWithCoords={handleOpenReportModalWithCoords}
            onOpenSosModal={() => setIsSosModalOpen(true)}
            onOpenUpdateModal={(flood) => setSelectedFloodToUpdate(flood)}
            onOpenDonationModal={() => setIsDonationModalOpen(true)}
            onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
            onDeleteDonation={handleDeleteDonation}
            onClearSelectedCoord={() => setTempPickerCoord(null)}
            onTriggerAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        )}

        {activeTab !== 'map' && (
          <div className="flex-1 min-h-0 overflow-y-auto w-full">
            {activeTab === 'routes' && (
              <RoadList
                floods={floods}
                onFocusOnMap={(floodItem) => {
                  setActiveTab('map');
                  setTempPickerCoord({ lat: floodItem.lat, lng: floodItem.lng });
                }}
              />
            )}

            {activeTab === 'shelters' && (
              <ShelterList
                shelters={shelters}
                onFocusOnMap={(shelterItem) => {
                  setActiveTab('map');
                  setTempPickerCoord({ lat: shelterItem.lat, lng: shelterItem.lng });
                }}
              />
            )}

            {activeTab === 'rescue' && (
              <RescueDashboard
                sosRequests={sosRequests}
                rescueCenters={rescueCenters}
                onUpdateStatus={handleUpdateSosStatus}
                onFocusMapLocation={(targetItem) => {
                  setActiveTab('map');
                  setTempPickerCoord({ lat: targetItem.lat, lng: targetItem.lng });
                }}
              />
            )}

            {activeTab === 'contacts' && (
              <EmergencyDirectory />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Docked at bottom, thumb-friendly, 100% viewport fit) */}
      <nav className="md:hidden bg-slate-900/98 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 w-full shrink-0 z-30 select-none px-1 py-1 safe-area-bottom">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'map' ? 'text-rose-400 font-bold bg-rose-500/15' : 'text-slate-400 active:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">แผนที่</span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'routes' ? 'text-rose-400 font-bold bg-rose-500/15' : 'text-slate-400 active:text-slate-200'
          }`}
        >
          <Navigation className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">สรุปทาง</span>
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'shelters' ? 'text-sky-400 font-bold bg-sky-500/15' : 'text-slate-400 active:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5 text-sky-400" />
          <span className="text-[10px] leading-tight font-medium">พักพิง</span>
        </button>

        <button
          onClick={() => setActiveTab('rescue')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl relative transition-all ${
            activeTab === 'rescue' ? 'text-amber-400 font-bold bg-amber-500/15' : 'text-slate-400 active:text-slate-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[10px] leading-tight font-medium">กู้ภัย</span>
          {pendingSosCount > 0 && (
            <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            activeTab === 'contacts' ? 'text-emerald-400 font-bold bg-emerald-500/15' : 'text-slate-400 active:text-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span className="text-[10px] leading-tight font-medium">เบอร์ฉุกเฉิน</span>
        </button>
      </nav>

      {/* SOS Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onSubmitSuccess={(newSos) => {
          setSosRequests(prev => [newSos, ...prev]);
          setMySosId(newSos.id);
          setActiveTab('map');
        }}
        onPickLocationFromMap={(callback) => handleStartPickLocation(callback, 'sos')}
      />

      {/* Report Flood / Detour Modal */}
      <ReportFloodModal
        isOpen={isReportModalOpen}
        onClose={() => { setIsReportModalOpen(false); setReportInitialCoords(null); }}
        onSubmitSuccess={(newFlood) => {
          setFloods(prev => [newFlood, ...prev]);
          setActiveTab('map');
          setReportInitialCoords(null);
        }}
        onPickLocationFromMap={(callback) => handleStartPickLocation(callback, 'report')}
        initialCoords={reportInitialCoords}
      />

      {/* Update Flood Status Modal (Live Crowd Updates) */}
      <UpdateFloodModal
        isOpen={!!selectedFloodToUpdate}
        onClose={() => setSelectedFloodToUpdate(null)}
        floodItem={selectedFloodToUpdate}
        onUpdateSuccess={(updatedFlood) => {
          setFloods(prev => prev.map(item => item.id === updatedFlood.id ? updatedFlood : item));
        }}
      />

      {/* Route Safety Checker Modal */}
      <RouteCheckerModal
        isOpen={isRouteCheckerOpen}
        onClose={() => setIsRouteCheckerOpen(false)}
        floods={floods}
      />

      {/* Crowdsourced Food Relief & Donation Setup Modal */}
      <AddDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onSubmitSuccess={(newDonation) => {
          setDonations(prev => [newDonation, ...prev]);
          setActiveTab('map');
          setTempPickerCoord({ lat: newDonation.lat, lng: newDonation.lng });
        }}
        onPickLocationFromMap={(callback) => handleStartPickLocation(callback, 'donation')}
      />

      {/* Flood Safety Precautions & Survival Guide Modal */}
      <FloodSafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      {/* User Suggestions & Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Admin Secret Login Modal (Triggered by 48-char Secret Key in Search) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(token, secretKey) => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Admin Master Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        floods={floods}
        sosRequests={sosRequests}
        donations={donations}
        onRefreshAllData={fetchData}
        onDeleteFlood={handleDeleteFlood}
        onDeleteSos={handleDeleteSos}
        onDeleteDonation={handleDeleteDonation}
      />

    </div>
  );
}
