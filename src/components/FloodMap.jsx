import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle,
  Tooltip,
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import { 
  Navigation, 
  Phone, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Layers, 
  Crosshair, 
  Share2, 
  Clock, 
  Car, 
  ShieldAlert,
  Users,
  Package,
  ExternalLink,
  CircleDot,
  Edit3,
  MessageSquarePlus,
  Home,
  MessageCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  X,
  Search,
  Utensils,
  HeartHandshake,
  Trash2,
  MapPin
} from 'lucide-react';
import { createCustomMarkerIcon, getShortLocationLabel, getShortShelterLabel } from '../utils/mapIcons';
import { getGoogleMapsDirectionsUrl, getGoogleMapsViewUrl, formatThaiDateTime, getCurrentLocation, SAKAEO_CENTER } from '../utils/geo';
import { 
  getLineShareUrl, 
  formatFloodShareText, 
  formatSosShareText, 
  formatShelterShareText, 
  formatMyLocationShareText,
  formatDonationShareText,
  copyToClipboard 
} from '../utils/share';

// Helper component to smoothly center map
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

// Helper component to ensure Leaflet renders correctly inside dynamic flexbox
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

// Click listener to pick coordinate
function MapClickHandler({ onLocationSelect, isSelectingLocation }) {
  useMapEvents({
    click(e) {
      if (isSelectingLocation && onLocationSelect) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
}

export default function FloodMap({ 
  floods = [], 
  sosRequests = [], 
  rescueCenters = [],
  donations = [],
  shelters = [],
  isAdmin = false,
  relocatingFlood = null,
  onStartRelocateFlood,
  onCancelRelocate,
  onSaveRelocatedCoordinate,
  onSelectCoordinate, 
  isSelectingLocation = false,
  selectedTempCoord = null,
  onNavigateToSos,
  onOpenReportModal,
  onOpenReportModalWithCoords,
  onOpenSosModal,
  onOpenUpdateModal,
  onOpenDonationModal,
  onOpenSafetyModal,
  onDeleteDonation,
  onClearSelectedCoord,
  onTriggerAdminLogin
}) {
  const [filterType, setFilterType] = useState('all'); // all, danger, warning, safe, sos, rescueCenter, donation, shelter
  const [districtFilter, setDistrictFilter] = useState('all');
  const [showRadius, setShowRadius] = useState(true); // Toggle circles
  const [showSosDetails, setShowSosDetails] = useState(true); // โชว์ข้อมูลผู้ขอความช่วยเหลือขึ้นมาเลย (ปิดได้สำหรับคนอยากดูเฉพาะเส้นทาง)
  const [mapCenter, setMapCenter] = useState([SAKAEO_CENTER.lat, SAKAEO_CENTER.lng]);
  const [mapZoom, setMapZoom] = useState(10);
  const [myLocation, setMyLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Map Tile Mode: 'standard' (OSM) | 'esri-satellite' (ESRI World Imagery + Labels) | 'esri-topo' (ESRI Topographic)
  const [mapTileMode, setMapTileMode] = useState(() => {
    try {
      const saved = localStorage.getItem('sakaeo_map_tile_mode');
      if (saved === 'google-satellite' || saved === 'esri-satellite') return 'esri-satellite';
      if (saved === 'google-roadmap' || saved === 'esri-topo') return 'esri-topo';
      return saved || 'standard';
    } catch {
      return 'standard';
    }
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const handleSelectMapTile = (mode) => {
    setMapTileMode(mode);
    setShowLayerMenu(false);
    try {
      localStorage.setItem('sakaeo_map_tile_mode', mode);
    } catch {}
  };

  // Admin Relocate Marker Confirmation State
  const [pendingRelocationCoords, setPendingRelocationCoords] = useState(null); // { id, title, oldLat, oldLng, newLat, newLng }
  const [savingRelocation, setSavingRelocation] = useState(false);

  // Auto center map when entering relocate mode
  useEffect(() => {
    if (relocatingFlood && relocatingFlood.lat && relocatingFlood.lng) {
      setMapCenter([relocatingFlood.lat, relocatingFlood.lng]);
      setMapZoom(16);
    }
  }, [relocatingFlood]);

  // Mobile Separate Detail Popup Modal State
  const [mobileDetailItem, setMobileDetailItem] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const sosMarkerRefs = useRef({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map Search State & Landmarks
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [parsedCoord, setParsedCoord] = useState(null); // พิกัดที่ parse ได้จากช่องค้นหา

  // ฟังก์ชันตรวจจับและ parse พิกัด lat,lng จากข้อความ
  const parseCoordinate = (text) => {
    const trimmed = text.trim();
    // รองรับรูปแบบ: "13.6872, 102.5085" หรือ "13.6872,102.5085" หรือ "13.6872 102.5085"
    const coordRegex = /^(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)$/;
    const match = trimmed.match(coordRegex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      // ตรวจสอบว่าอยู่ในช่วงพิกัดประเทศไทย (lat: 5-21, lng: 97-106)
      if (lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106) {
        return { lat, lng };
      }
    }
    return null;
  };

  const SAKAEO_LANDMARKS = [
    { name: 'บ้านทับใหม่ (ต.โนนหมากเค็ง)', district: 'วัฒนานคร', lat: 13.7845, lng: 102.3210, category: 'ชุมชนที่น้ำท่วม' },
    { name: 'ตลาดโรงเกลือ (ด่านพรมแดนคลองลึก)', district: 'อรัญประเทศ', lat: 13.6648, lng: 102.5492, category: 'ตลาด/การค้า' },
    { name: 'ตลาดสดเทศบาลเมืองอรัญประเทศ', district: 'อรัญประเทศ', lat: 13.6930, lng: 102.5080, category: 'ตลาด' },
    { name: 'วัดชนะไชยศรี (ชุมชนวัดเกาะ)', district: 'อรัญประเทศ', lat: 13.6852, lng: 102.5115, category: 'วัด/โรงครัว' },
    { name: 'วัดอนุบรรพต (เขาน้อย)', district: 'อรัญประเทศ', lat: 13.6990, lng: 102.5280, category: 'วัด/จุดสูง' },
    { name: 'โรงพยาบาลอรัญประเทศ', district: 'อรัญประเทศ', lat: 13.6890, lng: 102.5060, category: 'โรงพยาบาล' },
    { name: 'สถานีรถไฟอรัญประเทศ', district: 'อรัญประเทศ', lat: 13.6912, lng: 102.5098, category: 'สถานีรถไฟ' },
    { name: 'สี่แยกสระแก้ว (ถนน 33 ตัด 317)', district: 'เมืองสระแก้ว', lat: 13.8143, lng: 102.0722, category: 'สี่แยกหลัก' },
    { name: 'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว', district: 'เมืองสระแก้ว', lat: 13.8200, lng: 102.0715, category: 'โรงพยาบาล' },
    { name: 'ศาลากลางจังหวัดสระแก้ว', district: 'เมืองสระแก้ว', lat: 13.7942, lng: 102.1388, category: 'ศูนย์ราชการ' },
    { name: 'อุทยานแห่งชาติปางสีดา', district: 'เมืองสระแก้ว', lat: 14.0410, lng: 102.2030, category: 'อุทยาน' },
    { name: 'อ่างเก็บน้ำพระปรง', district: 'วัฒนานคร', lat: 13.9850, lng: 102.4820, category: 'อ่างเก็บน้ำ' },
    { name: 'ตลาดเทศบาลตำบลวัฒนานคร', district: 'วัฒนานคร', lat: 13.7485, lng: 102.3080, category: 'ตลาด' },
    { name: 'ตลาดเมืองวังน้ำเย็น', district: 'วังน้ำเย็น', lat: 13.5020, lng: 102.1780, category: 'ตลาด' },
    { name: 'เขาฉกรรจ์', district: 'เขาฉกรรจ์', lat: 13.6580, lng: 102.0290, category: 'จุดชมวิว/จุดสูง' },
    { name: 'สะพานข้ามคลองหันแดง (ทล.33 น้ำท่วมสูง ห้ามผ่าน)', district: 'เมืองสระแก้ว', lat: 13.7745, lng: 101.9632, category: 'จุดน้ำท่วมวิกฤต' },
    { name: 'ทางเลี่ยง สท.3015 - สท.3039 - สท.4034 (กรุงเทพฯ สู่สระแก้ว)', district: 'วัฒนานคร', lat: 13.8450, lng: 102.0150, category: 'เส้นทางเลี่ยงน้ำท่วม' },
    { name: 'ทางหลวง 317 (จันทบุรี สู่สระแก้ว ผ่านวังน้ำเย็น)', district: 'วังน้ำเย็น', lat: 13.5850, lng: 102.1200, category: 'เส้นทางปลอดภัย' }
  ];

  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    // ตรวจจับพิกัด — ถ้า parse ได้ให้แสดง item พิเศษด้านบนก่อน
    const coord = parseCoordinate(searchQuery);
    const coordItem = coord ? [{
      name: `📍 ไปยังพิกัด: ${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`,
      district: 'กรอกข้อมูลน้ำท่วมที่จุดนี้ได้เลย',
      lat: coord.lat,
      lng: coord.lng,
      category: 'พิกัด',
      isCoordItem: true,
      coordData: coord
    }] : [];
    const normalResults = [
      ...SAKAEO_LANDMARKS.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.district.includes(searchQuery)),
      ...floods.filter(f => f.title?.toLowerCase().includes(searchQuery.toLowerCase()) || f.district?.includes(searchQuery)).map(f => ({ name: f.title, district: f.district, lat: f.lat, lng: f.lng, category: 'จุดน้ำท่วม/ทางเลี่ยง' })),
      ...donations.filter(d => d.title?.toLowerCase().includes(searchQuery.toLowerCase()) || d.district?.includes(searchQuery)).map(d => ({ name: d.title, district: d.district, lat: d.lat, lng: d.lng, category: 'จุดแจก/บริจาค' })),
      ...rescueCenters.filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.district?.includes(searchQuery)).map(r => ({ name: r.name, district: r.district, lat: r.lat, lng: r.lng, category: 'ศูนย์กู้ภัย' })),
      ...shelters.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.district?.includes(searchQuery)).map(s => ({ name: s.name, district: s.district, lat: s.lat, lng: s.lng, category: 'ศูนย์พักพิง' }))
    ];
    return [...coordItem, ...normalResults].slice(0, 7);
  })();

  const handleSelectSearchResult = (target) => {
    setMapCenter([target.lat, target.lng]);
    setMapZoom(16);
    setShowSearchDropdown(false);

    // กรณีเป็น coordinate item พิเศษ — ซูมไปพิกัด + เปิด ReportFloodModal พร้อมพิกัด
    if (target.isCoordItem && target.coordData) {
      setSearchQuery(`${target.coordData.lat.toFixed(5)}, ${target.coordData.lng.toFixed(5)}`);
      if (onOpenReportModalWithCoords) {
        onOpenReportModalWithCoords({ lat: target.coordData.lat, lng: target.coordData.lng });
      }
      return;
    }

    setSearchQuery(target.name);

    if (isMobile) {
      const floodMatch = floods.find(f => f.title === target.name);
      if (floodMatch) {
        setMobileDetailItem({ type: 'flood', data: floodMatch });
        return;
      }
      const donationMatch = donations.find(d => d.title === target.name);
      if (donationMatch) {
        setMobileDetailItem({ type: 'donation', data: donationMatch });
        return;
      }
      const rescueMatch = rescueCenters.find(r => r.name === target.name);
      if (rescueMatch) {
        setMobileDetailItem({ type: 'rescueCenter', data: rescueMatch });
        return;
      }
      const shelterMatch = shelters.find(s => s.name === target.name);
      if (shelterMatch) {
        setMobileDetailItem({ type: 'shelter', data: shelterMatch });
        return;
      }
    }
  };

  const handleCopy = async (id, text) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // จัดการการพิมพ์ค้นหา พร้อมดักจับ Secret Key 48 ตัวอักษรสำหรับเข้า Admin Dashboard
  const handleSearchInputChange = async (val) => {
    setSearchQuery(val);
    setShowSearchDropdown(true);

    // อัพเดต parsedCoord เพื่อให้ searchResults ใช้งานได้ทันที
    setParsedCoord(parseCoordinate(val));

    const trimmed = val.trim();
    if (trimmed.length === 48) {
      try {
        const res = await fetch('/api/admin/verify-secret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secretKey: trimmed })
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setSearchQuery('');
          setShowSearchDropdown(false);
          setParsedCoord(null);
          if (onTriggerAdminLogin) {
            onTriggerAdminLogin();
          }
        }
      } catch (err) {
        console.error('Error verifying secret key:', err);
      }
    }
  };

  // ดึงพิกัดของฉัน
  const handleLocateMe = async () => {
    setLocating(true);
    try {
      const loc = await getCurrentLocation();
      setMyLocation([loc.lat, loc.lng]);
      setMapCenter([loc.lat, loc.lng]);
      setMapZoom(14);
    } catch (err) {
      alert(err.message || 'ไม่สามารถดึงตำแหน่งปัจจุบันได้');
    } finally {
      setLocating(false);
    }
  };

  // Filter Floods
  const filteredFloods = floods.filter(item => {
    if (filterType === 'sos' || filterType === 'rescueCenter' || filterType === 'donation' || filterType === 'shelter') return false;
    if (filterType !== 'all' && item.severity !== filterType) return false;
    if (districtFilter !== 'all' && item.district !== districtFilter) return false;
    return true;
  });

  // Filter SOS (ผู้ประสบภัยจริง ที่รอความช่วยเหลือ)
  const filteredSos = sosRequests.filter(item => {
    if (filterType !== 'all' && filterType !== 'sos') return false;
    return item.status !== 'resolved';
  });

  // Filter Rescue Centers (ศูนย์กู้ภัย & ฐานปฏิบัติการช่วยเหลือ แยกต่างหากจากผู้ประสบภัย)
  const filteredRescueCenters = rescueCenters.filter(item => {
    if (filterType !== 'all' && filterType !== 'rescueCenter') return false;
    if (districtFilter !== 'all' && item.district !== districtFilter) return false;
    return true;
  });

  // Filter Donations & Relief Kitchens (จุดแจกอาหารและรับบริจาค)
  const filteredDonations = donations.filter(item => {
    if (filterType !== 'all' && filterType !== 'donation') return false;
    if (districtFilter !== 'all' && item.district !== districtFilter) return false;
    return true;
  });

  // Filter Shelters
  const filteredShelters = shelters.filter(item => {
    if (filterType !== 'all' && filterType !== 'shelter') return false;
    if (districtFilter !== 'all' && item.district !== districtFilter) return false;
    return true;
  });

  // Unique Districts for filter
  const districts = ['ทั้งหมด', 'อรัญประเทศ', 'เมืองสระแก้ว', 'วังน้ำเย็น', 'วัฒนานคร', 'ตาพระยา', 'เขาฉกรรจ์', 'คลองหาด', 'วังสมบูรณ์', 'โคกสูง'];

  return (
    <div className="relative w-full h-full flex-1 min-h-0 bg-slate-950 overflow-hidden flex flex-col">
      {/* Map Control Bar (Floating Filters & Search) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex flex-col gap-2 max-w-full sm:max-w-[calc(100vw-32px)] lg:max-w-5xl pointer-events-none">
        
        {/* Search on Map Floating Box */}
        <div className="relative w-full sm:w-80 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl flex items-center px-3 py-1.5 gap-2">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchInputChange(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="🔍 ค้นหา หรือวางพิกัด เช่น 13.6872, 102.5085 ..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                  setParsedCoord(null);
                }}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-56 overflow-y-auto">
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(res)}
                  className={`px-3 py-2 cursor-pointer border-b border-slate-800/60 last:border-0 flex items-center justify-between gap-2 ${
                    res.isCoordItem
                      ? 'bg-emerald-900/40 hover:bg-emerald-800/60 border-b border-emerald-700/40'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${res.isCoordItem ? 'text-emerald-300' : 'text-white'}`}>{res.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      {res.isCoordItem ? (
                        <span className="text-emerald-400 font-medium">📝 {res.district}</span>
                      ) : (
                        <>
                          <span>อ.{res.district}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-medium">{res.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {res.isCoordItem ? (
                    <span className="text-emerald-400 text-xs shrink-0">+ แจ้ง</span>
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type Filter Pills */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-1 overflow-x-auto pointer-events-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-slate-100 text-slate-900 font-bold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ทั้งหมด ({floods.length + filteredSos.length + filteredRescueCenters.length + filteredDonations.length + filteredShelters.length})
          </button>
          
          <button
            onClick={() => setFilterType('danger')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
              filterType === 'danger'
                ? 'bg-red-600 text-white font-bold shadow'
                : 'text-red-400 hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            ทางขาด ({floods.filter(f => f.severity === 'danger').length})
          </button>

          <button
            onClick={() => setFilterType('warning')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
              filterType === 'warning'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-amber-300 hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            เฝ้าระวัง ({floods.filter(f => f.severity === 'warning').length})
          </button>

          <button
            onClick={() => setFilterType('safe')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
              filterType === 'safe'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ทางเลี่ยง ({floods.filter(f => f.severity === 'safe').length})
          </button>

          <button
            onClick={() => setFilterType('sos')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
              filterType === 'sos'
                ? 'bg-rose-600 text-white shadow ring-2 ring-rose-400'
                : 'text-rose-400 hover:bg-rose-950/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            SOS ผู้ประสบภัย ({filteredSos.length})
          </button>

          <button
            onClick={() => setFilterType('rescueCenter')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
              filterType === 'rescueCenter'
                ? 'bg-blue-600 text-white shadow ring-2 ring-blue-400'
                : 'text-blue-400 hover:bg-blue-950/50'
            }`}
            title="ศูนย์กู้ภัย & ฐานช่วยเหลือ (กดเพื่อดูเบอร์โทรขอเรือและทีมช่วย)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            ศูนย์กู้ภัย ({filteredRescueCenters.length})
          </button>

          <button
            onClick={() => setFilterType('donation')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
              filterType === 'donation'
                ? 'bg-orange-600 text-white shadow ring-2 ring-orange-400'
                : 'text-orange-400 hover:bg-orange-950/50'
            }`}
            title="จุดแจกอาหาร โรงครัว และรับบริจาคสิ่งของ"
          >
            <Utensils className="w-3.5 h-3.5 text-orange-300" />
            จุดแจก/บริจาค ({filteredDonations.length})
          </button>

          <button
            onClick={() => setFilterType('shelter')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
              filterType === 'shelter'
                ? 'bg-sky-600 text-white shadow ring-2 ring-sky-400'
                : 'text-sky-400 hover:bg-sky-950/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            ศูนย์พักพิง ({filteredShelters.length})
          </button>
        </div>

        {/* District Selector & Quick Actions (ตั้งจุดบริจาค / คู่มือเอาชีวิตรอด) */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {districts.map(d => (
              <option key={d} value={d === 'ทั้งหมด' ? 'all' : d}>
                {d === 'ทั้งหมด' ? '📍 ทุกอำเภอ' : `อ.${d}`}
              </option>
            ))}
          </select>

          {/* ปุ่มเพิ่มจุดบริจาค/เปิดโรงครัว */}
          <button
            type="button"
            onClick={onOpenDonationModal}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-2.5 py-1 rounded-xl text-xs shadow-lg flex items-center gap-1 border border-amber-400/40 transition-transform active:scale-95"
            title="ผู้มีจิตศรัทธาสามารถตั้งจุดแจกอาหารหรือเปิดรับบริจาคเองได้"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-amber-200" />
            <span>➕ ตั้งจุดแจก/บริจาค</span>
          </button>

          {/* ปุ่มคู่มือเอาชีวิตรอด */}
          <button
            type="button"
            onClick={onOpenSafetyModal}
            className="bg-red-950/90 hover:bg-red-900 text-red-200 font-bold px-2.5 py-1 rounded-xl text-xs shadow-lg flex items-center gap-1 border border-red-600/50 transition-colors"
            title="ข้อควรระวังสำคัญ: อันตรายจากไฟดูด, สัตว์มีพิษ, โรคฉี่หนู"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            <span>⚠️ ข้อควรระวัง</span>
          </button>

          {/* Toggle Flood Circles / Radius */}
          <button
            onClick={() => setShowRadius(!showRadius)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg border ${
              showRadius
                ? 'bg-rose-600/90 text-white border-rose-500 shadow-rose-950/40'
                : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="เปิด/ปิดการแสดงวงกลมรัศมีพื้นที่น้ำท่วม"
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>รัศมีน้ำท่วม: {showRadius ? 'เปิด' : 'ปิด'}</span>
          </button>

          {/* Toggle SOS Information (เปิด/ปิดป้ายข้อมูลผู้ขอความช่วยเหลือ เพื่อดูเฉพาะเส้นทางได้) */}
          {filteredSos.length > 0 && (
            <button
              onClick={() => setShowSosDetails(!showSosDetails)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg border ${
                showSosDetails
                  ? 'bg-red-600 text-white border-red-400 shadow-red-950/50'
                  : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={showSosDetails ? 'กดเพื่อซ่อนป้ายข้อมูล SOS (ดูเฉพาะเส้นทางน้ำท่วม)' : 'กดเพื่อแสดงป้ายข้อมูล SOS'}
            >
              {showSosDetails ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>ข้อมูล SOS: {showSosDetails ? 'เปิด' : 'ปิด (ดูแค่ทาง)'}</span>
            </button>
          )}

          {filterType === 'donation' && filteredDonations.length === 0 && (
            <div className="bg-orange-950/95 border border-orange-500/70 text-orange-200 text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn">
              <span>🍲 ยังไม่มีการปักหมุดจุดแจกอาหารในขณะนี้</span>
              <button
                type="button"
                onClick={onOpenDonationModal}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-2.5 py-0.5 rounded-lg text-[11px] shadow transition-colors"
              >
                ➕ ตั้งจุดแจก/บริจาคแรก
              </button>
            </div>
          )}

          {selectedTempCoord && (
            <div className="bg-blue-950/95 border border-blue-500/80 text-blue-200 text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center justify-between gap-2 pointer-events-auto animate-fadeIn">
              <span className="truncate">🎯 จุดที่เลือก: {selectedTempCoord.lat.toFixed(4)}, {selectedTempCoord.lng.toFixed(4)}</span>
              <button
                type="button"
                onClick={() => onClearSelectedCoord && onClearSelectedCoord()}
                className="bg-blue-600 hover:bg-rose-600 text-white font-bold px-2 py-0.5 rounded-lg text-[11px] shrink-0 transition-colors"
                title="ลบจุดที่เลือกนี้ออกจากแผนที่"
              >
                ✖ ล้างจุด
              </button>
            </div>
          )}

          {isSelectingLocation && (
            <div className="bg-amber-500/90 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg animate-pulse flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              <span>แตะบนแผนที่เพื่อเลือกจุดเกิดเหตุ</span>
            </div>
          )}

          {relocatingFlood && (
            <div className="bg-blue-600/95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl border border-blue-400 flex items-center justify-between gap-2 max-w-sm animate-pulse">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate">กำลังปรับพิกัด: <span className="text-amber-300 underline">{relocatingFlood.title}</span> (ลากหมุดไปวางบนถนนจริง)</span>
              </div>
              {onCancelRelocate && (
                <button
                  type="button"
                  onClick={onCancelRelocate}
                  className="bg-slate-900/80 hover:bg-slate-900 text-[10px] text-slate-200 px-2 py-0.5 rounded-lg border border-slate-700 shrink-0 transition-colors"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2 pointer-events-auto items-end">
        
        {/* Layer Selector Popup Menu */}
        {showLayerMenu && (
          <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-2 mb-1 w-60 flex flex-col gap-1 text-xs animate-fadeIn text-slate-200 font-sans z-30">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
              <span>เลือกรูปแบบแผนที่</span>
              <button 
                type="button"
                onClick={() => setShowLayerMenu(false)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. แผนที่ถนนมาตรฐาน OSM */}
            <button
              type="button"
              onClick={() => handleSelectMapTile('standard')}
              className={`flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                mapTileMode === 'standard' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <div>
                  <div className="text-xs">แผนที่ถนนปกติ</div>
                  <div className="text-[10px] text-slate-400 font-normal">สว่าง คลีน ประหยัดเน็ต</div>
                </div>
              </div>
              {mapTileMode === 'standard' && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
            </button>

            {/* 2. ภาพถ่ายดาวเทียม ESRI ArcGIS (ถูกต้องตามลิขสิทธิ์ + ซ้อนชื่อถนน) */}
            <button
              type="button"
              onClick={() => handleSelectMapTile('esri-satellite')}
              className={`flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                mapTileMode === 'esri-satellite' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🛰️</span>
                <div>
                  <div className="text-xs">ดาวเทียม ESRI (คมชัด)</div>
                  <div className="text-[10px] text-slate-400 font-normal">เห็นหลังคาบ้าน ชุมชน & ลำน้ำจริง</div>
                </div>
              </div>
              {mapTileMode === 'esri-satellite' && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
            </button>

            {/* 3. แผนที่ภูมิประเทศ ESRI Topographic */}
            <button
              type="button"
              onClick={() => handleSelectMapTile('esri-topo')}
              className={`flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                mapTileMode === 'esri-topo' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⛰️</span>
                <div>
                  <div className="text-xs">ภูมิประเทศ & ความสูง</div>
                  <div className="text-[10px] text-slate-400 font-normal">แนวภูเขา ลุ่มน้ำ ทิศทางน้ำหลาก</div>
                </div>
              </div>
              {mapTileMode === 'esri-topo' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          </div>
        )}

        {/* ปุ่มสลับชั้นแผนที่ (Layer Switcher) */}
        <button
          type="button"
          onClick={() => setShowLayerMenu(prev => !prev)}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-90 border ${
            mapTileMode === 'esri-satellite'
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-cyan-950/60'
              : mapTileMode === 'esri-topo'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
              : 'bg-slate-900/95 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title="เปลี่ยนรูปแบบแผนที่ (ถนนปกติ / ภาพถ่ายดาวเทียม ESRI / ภูมิประเทศ)"
        >
          <Layers className="w-5 h-5 text-cyan-400" />
          <span className="text-[9px] font-bold mt-0.5 leading-none">
            {mapTileMode === 'esri-satellite' ? 'ดาวเทียม' : mapTileMode === 'esri-topo' ? 'ภูมิประเทศ' : 'แผนที่'}
          </span>
        </button>

        {/* GPS Locate Me */}
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="w-12 h-12 rounded-2xl bg-slate-900/95 hover:bg-slate-800 text-rose-400 border border-slate-700 flex items-center justify-center shadow-2xl transition-all transform active:scale-90"
          title="ตำแหน่งปัจจุบันของฉัน (GPS)"
        >
          <Crosshair className={`w-6 h-6 ${locating ? 'animate-spin text-amber-400' : ''}`} />
        </button>

        <button
          onClick={() => {
            setMapCenter([SAKAEO_CENTER.lat, SAKAEO_CENTER.lng]);
            setMapZoom(10);
          }}
          className="w-12 h-12 rounded-2xl bg-slate-900/95 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shadow-2xl transition-all transform active:scale-90"
          title="รีเซ็ตกลับมุมมอง จ.สระแก้ว"
        >
          <Compass className="w-6 h-6" />
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        maxZoom={20}
        minZoom={7}
        scrollWheelZoom={true}
        className="w-full h-full flex-1 min-h-0"
      >
        <MapResizeHandler />
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <MapClickHandler 
          onLocationSelect={onSelectCoordinate} 
          isSelectingLocation={isSelectingLocation} 
        />

        {/* Dynamic Map Tile Layer (OSM / ESRI World Imagery + Labels / ESRI Topo) */}
        {mapTileMode === 'esri-satellite' && (
          <>
            <TileLayer
              key="esri-imagery"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={18}
              maxZoom={20}
            />
            <TileLayer
              key="esri-labels"
              attribution='&copy; Esri &mdash; Boundaries & Places'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={18}
              maxZoom={20}
            />
          </>
        )}

        {mapTileMode === 'esri-topo' && (
          <TileLayer
            key="esri-topo"
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={18}
            maxZoom={20}
          />
        )}

        {mapTileMode === 'standard' && (
          <TileLayer
            key="standard-osm"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxNativeZoom={19}
            maxZoom={20}
          />
        )}

        {/* My Current Location Marker with Share GPS Buttons */}
        {myLocation && (
          <Marker 
            position={myLocation}
            icon={createCustomMarkerIcon('picker')}
            eventHandlers={{
              click: () => {
                if (isMobile) {
                  setMobileDetailItem({ type: 'myLocation', data: { lat: myLocation[0], lng: myLocation[1] } });
                }
              }
            }}
          >
            {!isMobile && (
              <Popup maxWidth={280}>
                <div className="p-1.5 text-slate-900">
                  <p className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1">
                    <span>📍 ตำแหน่งปัจจุบันของคุณ (GPS)</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1 font-mono bg-slate-100 p-1.5 rounded-lg">
                    พิกัด: {myLocation[0].toFixed(5)}, {myLocation[1].toFixed(5)}
                  </p>

                  <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-200">
                    <a
                      href={getLineShareUrl(formatMyLocationShareText(myLocation[0], myLocation[1]))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-1.5 px-2.5 rounded-xl text-xs no-underline shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>แชร์พิกัดของฉันเข้า LINE 📲</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy('my-loc', formatMyLocationShareText(myLocation[0], myLocation[1]))}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-2.5 rounded-xl text-xs border border-slate-300"
                    >
                      {copiedId === 'my-loc' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">คัดลอกพิกัดแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>คัดลอกพิกัด & ลิงก์แผนที่</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        )}

        {/* Temporary Selected Picker Marker (When reporting) */}
        {selectedTempCoord && (
          <Marker
            position={[selectedTempCoord.lat, selectedTempCoord.lng]}
            icon={createCustomMarkerIcon('picker')}
            eventHandlers={{
              click: () => {
                if (isMobile) {
                  setMobileDetailItem({ type: 'temp', data: selectedTempCoord });
                }
              }
            }}
          >
            {!isMobile && (
              <Popup>
                <div className="p-1 text-slate-900 space-y-2 min-w-[180px]">
                  <p className="font-bold text-sm text-blue-600 flex items-center gap-1">
                    <span>🎯 จุดที่คุณเลือก</span>
                  </p>
                  <p className="text-xs text-slate-600 font-mono bg-slate-100 p-1.5 rounded">
                    พิกัด: {selectedTempCoord.lat.toFixed(5)}, {selectedTempCoord.lng.toFixed(5)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onClearSelectedCoord && onClearSelectedCoord()}
                    className="w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-2.5 rounded-lg border border-rose-300 transition-colors shadow-sm text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>ลบ/ยกเลิกจุดที่เลือกนี้</span>
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        )}

        {/* Flood Radius Circles */}
        {showRadius && filteredFloods.map(item => {
          const rad = item.radius || (item.severity === 'danger' ? 650 : item.severity === 'warning' ? 450 : 250);
          const color = item.severity === 'danger' ? '#dc2626' : item.severity === 'warning' ? '#f59e0b' : '#10b981';
          return (
            <Circle
              key={`circle-flood-${item.id}`}
              center={[item.lat, item.lng]}
              radius={rad}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: item.severity === 'danger' ? 0.28 : item.severity === 'warning' ? 0.22 : 0.16,
                weight: 2,
                dashArray: item.severity === 'danger' ? '6, 6' : item.severity === 'warning' ? '4, 4' : null
              }}
            />
          );
        })}

        {/* SOS Alert Circles */}
        {showRadius && filteredSos.map(item => (
          <Circle
            key={`circle-sos-${item.id}`}
            center={[item.lat, item.lng]}
            radius={item.radius || 250}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.32,
              weight: 2,
              dashArray: '3, 4'
            }}
          />
        ))}

        {/* Flood Condition Markers */}
        {filteredFloods.map(item => {
          const isBeingRelocated = relocatingFlood?.id === item.id;
          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              draggable={isBeingRelocated}
              zIndexOffset={isBeingRelocated ? 1000 : 0}
              icon={createCustomMarkerIcon(item.severity, { 
                label: isBeingRelocated ? `📍 ลากฉัน (${getShortLocationLabel(item)})` : getShortLocationLabel(item) 
              })}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setPendingRelocationCoords({
                    id: item.id,
                    title: item.title,
                    oldLat: item.lat,
                    oldLng: item.lng,
                    newLat: position.lat,
                    newLng: position.lng
                  });
                },
                click: () => {
                  if (isMobile) {
                    setMobileDetailItem({ type: 'flood', data: item });
                  }
                }
              }}
            >
              {isBeingRelocated && (
                <Tooltip permanent direction="top" offset={[0, -20]} className="custom-tooltip font-bold text-xs bg-blue-900 text-white border border-blue-400">
                  📍 ลากไปวางบนถนนจริงแล้วปล่อยมือ
                </Tooltip>
              )}
              {!isMobile && (
                <Popup className="custom-popup" maxWidth={320}>
                <div className="p-1 text-slate-900 text-sm">
                  
                  {/* Sample data alert notice */}
                  {item.isSample && (
                    <div className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded mb-1.5 flex items-center gap-1">
                      <span>ℹ️ ข้อมูลตัวอย่างจำลองเพื่อทดสอบระบบ</span>
                    </div>
                  )}

                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {item.severity === 'danger' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                          🔴 ทางขาด / ห้ามผ่านเด็ดขาด
                        </span>
                      )}
                      {item.severity === 'warning' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          🟡 เฝ้าระวัง / รถเล็กเลี่ยง
                        </span>
                      )}
                      {item.severity === 'safe' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          🟢 เส้นทางเลี่ยงสัญจรได้
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatThaiDateTime(item.updatedAt)}
                    </span>
                  </div>

                  {/* Road Title */}
                  <h4 className="font-bold text-base text-slate-900 leading-snug mb-1">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600 mb-2">
                    <span>📍 อ.{item.district} {item.subdistrict ? `ต.${item.subdistrict}` : ''}</span>
                    <div className="flex items-center gap-1">
                      {item.reportCount > 1 && (
                        <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-0.5" title="มีผู้ใช้ร่วมแจ้งยืนยันจุดนี้และระบบรวมเป็นจุดเดียวกัน">
                          👥 ยืนยัน {item.reportCount} คน
                        </span>
                      )}
                      <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        รัศมี ~{item.radius || 400} ม.
                      </span>
                    </div>
                  </div>

                  {/* Water Level & Vehicles */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-2 space-y-1 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="font-semibold text-slate-700 shrink-0">ระดับน้ำ:</span>
                      <span className="font-bold text-rose-600">{item.waterLevel}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <span className="text-slate-800">{item.passableFor}</span>
                    </div>
                  </div>

                  {/* Recommended Bypass Route */}
                  {item.recommendedRoute && (
                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg mb-2 text-xs">
                      <p className="font-bold text-emerald-800 flex items-center gap-1 mb-0.5">
                        <Navigation className="w-3.5 h-3.5" /> เส้นทางเลี่ยงที่แนะนำ:
                      </p>
                      <p className="text-emerald-950 leading-relaxed">
                        {item.recommendedRoute}
                      </p>
                    </div>
                  )}

                  {/* Latest update note if exists */}
                  {item.updateHistory && item.updateHistory.length > 0 && (
                    <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg mb-2 text-[11px] text-amber-950">
                      <div className="font-bold flex items-center gap-1 text-amber-900">
                        <span>🔔 มีการอัปเดตล่าสุด:</span>
                      </div>
                      <p className="text-slate-800 font-medium mt-0.5">{item.updateHistory[0].note}</p>
                      <span className="text-[10px] text-slate-500">
                        ({formatThaiDateTime(item.updateHistory[0].timestamp)} โดย {item.updateHistory[0].reporterName})
                      </span>
                    </div>
                  )}

                  {/* Additional Description */}
                  {item.description && (
                    <p className="text-xs text-slate-600 mb-2.5 bg-white p-2 rounded border border-slate-100">
                      {item.description}
                    </p>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-200">
                    
                    {/* ADMIN RELOCATE BUTTON */}
                    {isAdmin && onStartRelocateFlood && !isBeingRelocated && (
                      <button
                        type="button"
                        onClick={() => onStartRelocateFlood(item)}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl shadow text-xs transition-transform active:scale-95 border border-blue-400"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>🛠️ ลากปรับพิกัดหมุดนี้ให้ตรงถนนจริง (Admin)</span>
                      </button>
                    )}

                    {/* LIVE UPDATE STATUS BUTTON (NEW CROWDSOURCING FEATURE) */}
                    <button
                      type="button"
                      onClick={() => onOpenUpdateModal && onOpenUpdateModal(item)}
                      className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-2 px-3 rounded-xl shadow text-xs transition-transform active:scale-95 border border-amber-400"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                      <span>📢 อัปเดตสถานการณ์จุดนี้ (น้ำลด / น้ำเพิ่ม)</span>
                    </button>

                    {/* GOOGLE MAPS NAVIGATION BUTTON (FIXED ULTRA-CLEAR CONTRAST) */}
                    <a
                      href={getGoogleMapsDirectionsUrl(item.lat, item.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-google-maps w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl shadow-md text-xs font-bold transition-transform active:scale-95 no-underline"
                      style={{ color: '#ffffff', backgroundColor: '#1a73e8', textDecoration: 'none' }}
                    >
                      <Navigation className="w-4 h-4 text-white shrink-0" style={{ color: '#ffffff' }} />
                      <span className="text-white font-bold" style={{ color: '#ffffff' }}>
                        เปิดแอป Google Maps นำทางไปจุดนี้ 🧭
                      </span>
                    </a>

                    {/* SHARE BUTTONS */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <a
                        href={getLineShareUrl(formatFloodShareText(item))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-1.5 px-2 rounded-lg text-[11px] no-underline shadow-sm transition-colors"
                        title="ส่งต่อเข้ากลุ่ม LINE"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>แชร์เข้า LINE</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, formatFloodShareText(item))}
                        className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 px-2 rounded-lg text-[11px] border border-slate-300 transition-colors"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">คัดลอกแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>คัดลอกข้อความ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {item.contactPhone && (
                      <a
                        href={`tel:${item.contactPhone}`}
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 px-3 rounded-lg text-xs no-underline border border-slate-300"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>โทรสอบถามข้อมูล: {item.contactPhone}</span>
                      </a>
                    )}
                  </div>

                </div>
              </Popup>
              )}
            </Marker>
          );
        })}

        {/* SOS Emergency Markers (เด่นกว่าทุกจุดด้วยไฟไซเรน และป้ายข้อมูลโชว์ขึ้นมาเลย) */}
        {filteredSos.map(item => {
          const handleSosCardClick = (e) => {
            if (e) {
              if (e.stopPropagation) e.stopPropagation();
              if (e.originalEvent && e.originalEvent.stopPropagation) e.originalEvent.stopPropagation();
            }
            if (isMobile) {
              setMobileDetailItem({ type: 'sos', data: item });
            } else {
              const markerInstance = sosMarkerRefs.current[item.id];
              if (markerInstance) {
                markerInstance.openPopup();
              }
            }
          };

          return (
            <Marker
              key={item.id}
              ref={el => { if (el) sosMarkerRefs.current[item.id] = el; }}
              position={[item.lat, item.lng]}
              icon={createCustomMarkerIcon('sos')}
              zIndexOffset={3000}
              eventHandlers={{
                click: handleSosCardClick
              }}
            >
              {/* ป้ายข้อมูลโชว์ขึ้นมาเลยโดยไม่ต้องกด (ปิดได้สำหรับคนอยากดูเฉพาะทาง) */}
              {showSosDetails && !isMobile && (
                <Tooltip 
                  permanent 
                  direction="top" 
                  offset={[0, -46]} 
                  className="sos-permanent-tooltip cursor-pointer"
                  eventHandlers={{
                    click: handleSosCardClick
                  }}
                >
                  <div 
                    onClick={handleSosCardClick}
                    className="bg-slate-950/95 backdrop-blur-md text-white border-2 border-red-500 rounded-2xl p-2.5 shadow-2xl min-w-[190px] max-w-[240px] pointer-events-auto transform hover:scale-105 transition-transform cursor-pointer"
                    title="คลิกเพื่อดูรายละเอียดและนำทาง"
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-red-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        🚨 ขอความช่วยเหลือด่วน
                      </span>
                      <span className="text-[9px] bg-red-900/80 text-white px-1.5 py-0.2 rounded font-mono">
                        {item.status === 'in_progress' ? 'กู้ภัยกำลังช่วย' : 'รอช่วย'}
                      </span>
                    </div>
                    
                    <div className="font-heading font-bold text-white text-xs sm:text-sm truncate mt-1">
                      {item.name}
                    </div>

                    {item.urgentNeeds && item.urgentNeeds.length > 0 && (
                      <div className="text-[11px] text-amber-300 font-medium line-clamp-1 mt-0.5">
                        ⚠️ {Array.isArray(item.urgentNeeds) ? item.urgentNeeds.join(', ') : item.urgentNeeds}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-300 flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-800">
                      <span className="text-emerald-400 font-bold">📞 {item.phone}</span>
                      <span className="text-rose-300 font-bold flex items-center gap-0.5 underline">
                        แตะดูข้อมูล & นำทาง 🧭
                      </span>
                    </div>
                  </div>
                </Tooltip>
              )}

            {!isMobile && (
              <Popup className="custom-popup" maxWidth={330}>
              <div className="p-1 text-slate-900 text-sm">
                
                {/* SOS Header */}
                <div className="flex items-center justify-between gap-2 border-b border-rose-200 pb-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    ขอความช่วยเหลือฉุกเฉิน (SOS)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formatThaiDateTime(item.createdAt)}
                  </span>
                </div>

                {item.isSample && (
                  <div className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-semibold px-2 py-1 rounded mb-2 flex items-center gap-1">
                    <span>⚠️ รายการนี้เป็น <strong>ข้อมูลตัวอย่าง</strong> เพื่อทดสอบระบบส่งพิกัดเข้า Google Maps</span>
                  </div>
                )}

                <h4 className="font-bold text-base text-slate-900 mb-1">
                  {item.name}
                </h4>

                {/* Victims & Needs */}
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-2 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="font-semibold text-slate-700">ผู้ประสบภัย:</span>
                    <span className="text-slate-900 font-bold">{item.victimsCount}</span>
                  </div>

                  {item.urgentNeeds && item.urgentNeeds.length > 0 && (
                    <div className="flex items-start gap-1.5">
                      <Package className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">ต้องการด่วน: </span>
                        <span className="font-bold text-rose-700">
                          {Array.isArray(item.urgentNeeds) ? item.urgentNeeds.join(', ') : item.urgentNeeds}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Access Route Details */}
                <div className="bg-slate-50 p-2 rounded border border-slate-200 mb-2 text-xs">
                  <p className="font-semibold text-slate-700 mb-0.5">เส้นทางเข้าถึง / จุดสังเกต:</p>
                  <p className="text-slate-800 leading-relaxed">{item.accessRoute}</p>
                  {item.address && (
                    <p className="text-slate-500 text-[11px] mt-1 border-t border-slate-200 pt-1">
                      ที่อยู่: {item.address}
                    </p>
                  )}
                </div>

                {/* GOOGLE MAPS NAVIGATION (FOR RESCUE) */}
                <div className="space-y-1.5">
                  <a
                    href={getGoogleMapsDirectionsUrl(item.lat, item.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs transition-transform active:scale-95 no-underline border border-rose-400"
                    style={{ color: '#ffffff', textDecoration: 'none' }}
                  >
                    <Navigation className="w-4 h-4 text-white shrink-0" style={{ color: '#ffffff' }} />
                    <span className="text-white font-bold" style={{ color: '#ffffff' }}>
                      กู้ภัย: ส่งพิกัดเข้า Google Maps เพื่อนำทางทันที 🧭
                    </span>
                  </a>

                  <a
                    href={`tel:${item.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs no-underline transition-colors border border-emerald-400/40"
                    style={{ color: '#ffffff', textDecoration: 'none' }}
                  >
                    <Phone className="w-4 h-4 text-white shrink-0" style={{ color: '#ffffff' }} />
                    <span className="font-bold text-white tracking-wide" style={{ color: '#ffffff' }}>
                      โทรติดต่อผู้ประสบภัย: {item.phone}
                    </span>
                  </a>

                  {/* LINE Share & Copy */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <a
                      href={getLineShareUrl(formatSosShareText(item))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-1.5 px-2 rounded-lg text-[11px] no-underline shadow-sm"
                      title="ส่งต่อเข้ากลุ่ม LINE กู้ภัย"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>ส่งเคสเข้า LINE</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, formatSosShareText(item))}
                      className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 px-2 rounded-lg text-[11px] border border-slate-300"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>คัดลอกข้อความ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </Popup>
            )}
          </Marker>
          );
        })}

        {/* Rescue Center Markers (ศูนย์กู้ภัย & ฐานประสานงานช่วยเหลือ 24 ชม. - แยกต่างหากจากผู้ประสบภัย) */}
        {filteredRescueCenters.map(rc => (
          <Marker
            key={rc.id}
            position={[rc.lat, rc.lng]}
            icon={createCustomMarkerIcon('rescueCenter')}
            zIndexOffset={2500}
            eventHandlers={{
              click: () => {
                if (isMobile) {
                  setMobileDetailItem({ type: 'rescueCenter', data: rc });
                }
              }
            }}
          >
            {!isMobile && (
              <>
                <Tooltip
                  direction="top"
                  offset={[0, -42]}
                  opacity={0.95}
                  className="custom-map-tooltip"
                >
                  <div className="text-[11px] font-sans">
                    <div className="font-bold text-sky-400 flex items-center gap-1">
                      <span>🛡️ ฐานกู้ภัย 24 ชม.</span>
                    </div>
                    <div className="text-white font-semibold truncate max-w-[210px]">{rc.name}</div>
                    <div className="text-amber-300 font-mono">📞 {rc.phone} (กดโทรขอเรือ/ทีมช่วย)</div>
                  </div>
                </Tooltip>

                <Popup className="custom-popup" maxWidth={340}>
              <div className="p-1 text-slate-900 text-sm">
                
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-blue-200 pb-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-700 text-white flex items-center gap-1 shadow-sm">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                    <span>ศูนย์กู้ภัย & ฐานช่วยเหลือ 24 ชม.</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    อ.{rc.district}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-base text-slate-950 mb-1 leading-snug">
                  {rc.name}
                </h4>

                <p className="text-xs text-slate-600 mb-2">
                  📍 {rc.address}
                </p>

                {/* Services & Capabilities */}
                <div className="bg-blue-50/90 border border-blue-200 p-2.5 rounded-xl mb-2 text-xs space-y-1.5">
                  <div className="text-blue-950 font-bold flex items-center gap-1">
                    <span>🕒 สถานะ:</span>
                    <span className="text-emerald-700 font-extrabold">{rc.operatingHours}</span>
                  </div>
                  
                  {rc.equipment && (
                    <div className="text-slate-800 text-[11px]">
                      <strong>ยุทโธปกรณ์:</strong> {rc.equipment}
                    </div>
                  )}

                  {rc.coverageArea && (
                    <div className="text-slate-600 text-[11px]">
                      <strong>พื้นที่ดูแล:</strong> {rc.coverageArea}
                    </div>
                  )}

                  {rc.services && rc.services.length > 0 && (
                    <div className="pt-1 border-t border-blue-200/60">
                      <div className="text-[11px] font-bold text-blue-900 mb-1">บริการและความช่วยเหลือ:</div>
                      <div className="flex flex-wrap gap-1">
                        {rc.services.map((srv, idx) => (
                          <span key={idx} className="bg-white border border-blue-300 text-blue-900 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button: CALL FOR HELP DIRECTLY */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200">
                  <a
                    href={`tel:${rc.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold py-2.5 px-3 rounded-xl shadow-md text-xs no-underline transition-all transform active:scale-95"
                    style={{ color: '#ffffff', textDecoration: 'none' }}
                  >
                    <Phone className="w-4 h-4 animate-bounce" />
                    <span>📞 โทรขอความช่วยเหลือทันที: {rc.phone}</span>
                  </a>

                  {/* Secondary phone if available */}
                  {rc.secondaryPhone && (
                    <a
                      href={`tel:${rc.secondaryPhone}`}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 px-2 rounded-lg text-xs no-underline border border-slate-300"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>สายด่วนสำรอง: {rc.secondaryPhone}</span>
                    </a>
                  )}

                  {/* Directions to Rescue Center */}
                  <a
                    href={getGoogleMapsDirectionsUrl(rc.lat, rc.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl shadow text-xs transition-transform active:scale-95 no-underline"
                    style={{ color: '#ffffff', textDecoration: 'none' }}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>นำทางไปศูนย์กู้ภัยด้วย Google Maps 🧭</span>
                  </a>

                  {/* Quick SOS button from here */}
                  <button
                    type="button"
                    onClick={() => onOpenSosModal && onOpenSosModal()}
                    className="w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold py-1.5 px-2 rounded-xl text-xs transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>แจ้งปักหมุดขอความช่วยเหลือในระบบ (SOS)</span>
                  </button>
                </div>

              </div>
            </Popup>
            </>
            )}
          </Marker>
        ))}

        {/* Shelter Markers */}
        {filteredShelters.map(s => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={createCustomMarkerIcon('shelter', { label: getShortShelterLabel(s) })}
            eventHandlers={{
              click: () => {
                if (isMobile) {
                  setMobileDetailItem({ type: 'shelter', data: s });
                }
              }
            }}
          >
            {!isMobile && (
              <Popup className="custom-popup" maxWidth={320}>
              <div className="p-1 text-slate-900 text-sm">
                
                <div className="flex items-center justify-between gap-2 border-b border-sky-200 pb-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-600 text-white flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    ศูนย์พักพิงชั่วคราว
                  </span>
                  <span className="text-[11px] text-slate-500">
                    อ.{s.district}
                  </span>
                </div>

                <h4 className="font-bold text-base text-slate-900 mb-1">
                  {s.name}
                </h4>

                <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-lg mb-2 text-xs space-y-1">
                  <div className="text-sky-900 font-bold">
                    👥 ความจุ: {s.capacity}
                  </div>
                  {s.facilities && (
                    <div className="text-[11px] text-slate-600">
                      <strong>บริการ:</strong> {s.facilities.join(', ')}
                    </div>
                  )}
                </div>

                {s.address && (
                  <p className="text-xs text-slate-600 mb-2">
                    📍 {s.address}
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200">
                  <a
                    href={getGoogleMapsDirectionsUrl(s.lat, s.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow text-xs transition-transform active:scale-95 no-underline"
                    style={{ color: '#ffffff', textDecoration: 'none' }}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>นำทางด้วย Google Maps ไปศูนย์พักพิง 🧭</span>
                  </a>

                  <div className="grid grid-cols-2 gap-1.5">
                    <a
                      href={`tel:${s.phone}`}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs no-underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>โทร: {s.phone}</span>
                    </a>

                    <a
                      href={getLineShareUrl(formatShelterShareText(s))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-1.5 px-2 rounded-lg text-xs no-underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>แชร์ LINE</span>
                    </a>
                  </div>
                </div>

              </div>
            </Popup>
            )}
          </Marker>
        ))}

        {/* Donation Points & Relief Kitchens Markers (จุดแจกอาหาร & ศูนย์รับบริจาค) */}
        {filteredDonations.map(d => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={createCustomMarkerIcon('donation', { label: d.title ? (d.title.length > 15 ? d.title.substring(0, 14) + '…' : d.title) : 'จุดแจก/บริจาค' })}
            zIndexOffset={2200}
            eventHandlers={{
              click: () => {
                if (isMobile) {
                  setMobileDetailItem({ type: 'donation', data: d });
                }
              }
            }}
          >
            {!isMobile && (
              <>
                <Tooltip
                  direction="top"
                  offset={[0, -40]}
                  opacity={0.95}
                  className="custom-map-tooltip"
                >
                  <div className="text-[11px] font-sans">
                    <div className="font-bold text-amber-400 flex items-center gap-1">
                      <span>🍲 {d.type === 'food_distribution' ? 'โรงครัว/แจกอาหาร' : d.type === 'relief_supplies' ? 'แจกถุงยังชีพ' : 'จุดรับบริจาค'}</span>
                    </div>
                    <div className="text-white font-semibold truncate max-w-[210px]">{d.title}</div>
                    <div className="text-yellow-300 font-mono">📞 {d.contactPhone} (โทรเช็กก่อนเดินทาง)</div>
                  </div>
                </Tooltip>

                <Popup className="custom-popup" maxWidth={340}>
              <div className="p-1 text-slate-900 text-sm">
                
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-orange-200 pb-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-600 text-white flex items-center gap-1 shadow-sm">
                    <Utensils className="w-3.5 h-3.5 text-white" />
                    <span>{d.type === 'food_distribution' ? 'โรงครัวแจกอาหารสด' : d.type === 'relief_supplies' ? 'จุดแจกถุงยังชีพ' : 'ศูนย์รับบริจาคสิ่งของ'}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    อ.{d.district}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-base text-slate-950 mb-1 leading-snug">
                  {d.title}
                </h4>

                {d.address && (
                  <p className="text-xs text-slate-600 mb-1">
                    📍 {d.address}
                  </p>
                )}

                {/* ⚠️ ป้ายเตือนตัวใหญ่เด่นชัดมาก: บังคับโทรเช็กก่อนเดินทางเสมอตามคำสั่งผู้ใช้ */}
                <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-3 my-2 text-center shadow-md animate-pulse">
                  <div className="flex items-center justify-center gap-1.5 text-red-700 font-heading font-black text-sm sm:text-base tracking-wide">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>⚠️ กรุณาโทรเช็กก่อนเดินทางทุกครั้ง!</span>
                  </div>
                  <p className="text-xs text-red-800 mt-1 font-bold leading-relaxed">
                    โปรดโทรสอบถามว่าอาหารหรือของแจกยังมีอยู่หรือไม่ หรือจุดรับบริจาคยังเปิดอยู่จริงหรือไม่ เพื่อไม่ให้เสียเวลาเดินทาง
                  </p>
                </div>

                {/* Big Green Direct Phone Call Button */}
                <a
                  href={`tel:${d.contactPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 text-white font-black py-2.5 px-3 rounded-xl shadow-lg text-sm sm:text-base no-underline transition-all transform active:scale-95 border-2 border-emerald-400/50"
                  style={{ color: '#ffffff', textDecoration: 'none' }}
                >
                  <Phone className="w-5 h-5 animate-bounce" />
                  <span>📞 โทรเช็กข้อมูล: {d.contactPhone}</span>
                </a>

                {/* Info block */}
                <div className="bg-orange-50/80 border border-orange-200 p-2.5 rounded-xl my-2 text-xs space-y-1">
                  <div className="text-slate-800">
                    <strong>🕒 เวลาเปิดแจก/เปิดรับ:</strong> <span className="text-orange-950 font-bold">{d.operatingHours}</span>
                  </div>
                  {d.itemsAvailable && (
                    <div className="text-slate-800">
                      <strong>📦 สิ่งของที่มีแจก:</strong> <span className="text-slate-900">{d.itemsAvailable}</span>
                    </div>
                  )}
                  {d.organizerName && (
                    <div className="text-slate-600 text-[11px]">
                      <strong>ผู้จัดตั้ง:</strong> {d.organizerName}
                    </div>
                  )}
                  {d.notes && (
                    <div className="text-slate-600 text-[11px] pt-1 border-t border-orange-200/60">
                      <strong>คำแนะนำ:</strong> {d.notes}
                    </div>
                  )}
                </div>

                {/* Navigation and LINE Share */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200">
                  <a
                    href={getGoogleMapsDirectionsUrl(d.lat, d.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-bold py-2 px-3 rounded-xl shadow text-xs transition-transform active:scale-95 no-underline"
                    style={{ color: '#ffffff', textDecoration: 'none' }}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>นำทางด้วย Google Maps ไปจุดนี้ 🧭</span>
                  </a>

                  <a
                    href={getLineShareUrl(formatDonationShareText(d))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-1.5 px-3 rounded-xl text-xs no-underline shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>แชร์จุดแจกอาหารนี้เข้า LINE</span>
                  </a>

                  {/* Delete / Close Donation Point Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmDelete = window.confirm(`คุณต้องการลบจุด "${d.title}" ออกจากแผนที่ใช่หรือไม่?\n\n(เช่น อาหารแจกหมดแล้ว หรือปิดจุดตั้งโรงครัว/รับบริจาคแล้ว)`);
                      if (!confirmDelete) return;
                      if (onDeleteDonation) {
                        await onDeleteDonation(d.id);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-3 rounded-xl text-xs border border-rose-200 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>🗑️ ลบจุดนี้ / แจ้งปิดจุดแจกบริจาค</span>
                  </button>
                </div>

              </div>
            </Popup>
            </>
            )}
          </Marker>
        ))}

      </MapContainer>

      {/* Floating SOS Quick Alert Card on Map (มีข้อมูลขึ้นมาโชว์เลย แต่กดยกเลิก/ปิดได้สำหรับคนที่อยากดูเส้นทางอย่างเดียว) */}
      {showSosDetails && filteredSos.length > 0 && (
        <div className="absolute bottom-4 left-3 right-16 sm:right-auto z-20 max-w-sm pointer-events-auto animate-fadeIn">
          <div className="bg-slate-950/95 backdrop-blur-md border-2 border-red-500/80 rounded-2xl p-3 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="font-heading font-bold text-xs text-red-300">
                  จุดขอความช่วยเหลือฉุกเฉิน ({filteredSos.length} จุด)
                </span>
              </div>
              <button
                onClick={() => setShowSosDetails(false)}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center gap-1"
                title="ซ่อนข้อมูล SOS เพื่อดูเฉพาะเส้นทางน้ำท่วม"
              >
                <X className="w-3 h-3 text-rose-400" />
                <span>ซ่อน (ดูแค่ทาง)</span>
              </button>
            </div>

            <div className="text-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate text-sm">{filteredSos[0].name}</span>
                <a
                  href={`tel:${filteredSos[0].phone}`}
                  className="text-emerald-400 font-bold text-xs flex items-center gap-1 hover:underline ml-2 shrink-0 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40"
                >
                  <Phone className="w-3 h-3" />
                  {filteredSos[0].phone}
                </a>
              </div>
              <div className="text-xs text-amber-300 font-medium truncate">
                ต้องการ: {Array.isArray(filteredSos[0].urgentNeeds) ? filteredSos[0].urgentNeeds.join(', ') : filteredSos[0].urgentNeeds}
              </div>
              {filteredSos[0].address && (
                <div className="text-[11px] text-slate-400 truncate">
                  พิกัด/ที่อยู่: {filteredSos[0].address}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800">
              <button
                onClick={() => {
                  setMapCenter([filteredSos[0].lat, filteredSos[0].lng]);
                  setMapZoom(16);
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1 border border-slate-700 transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                <span>ซูมไปจุดนี้</span>
              </button>
              <a
                href={getGoogleMapsDirectionsUrl(filteredSos[0].lat, filteredSos[0].lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1 no-underline shadow-lg shadow-rose-950/50 transition-all border border-rose-400/50"
                style={{ color: '#ffffff' }}
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>กู้ภัยนำทาง 🧭</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 📱 Mobile Separate Detail Popup Modal (ป๊อปอัปแยกสำหรับมือถือ ไม่ทับซ้อนแผนที่) */}
      {mobileDetailItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setMobileDetailItem(null)}
        >
          <div 
            className="w-full max-h-[85vh] sm:max-w-lg bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Pill on mobile */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-2 shrink-0 sm:hidden" />

            {/* Header with Title and Close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {mobileDetailItem.type === 'flood' && (
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    mobileDetailItem.data.severity === 'danger'
                      ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                      : mobileDetailItem.data.severity === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  }`}>
                    {mobileDetailItem.data.severity === 'danger' ? '🔴 ทางขาด / ห้ามผ่าน' : mobileDetailItem.data.severity === 'warning' ? '🟡 เฝ้าระวัง / รถเล็กเลี่ยง' : '🟢 เส้นทางเลี่ยงสัญจรได้'}
                  </span>
                )}
                {mobileDetailItem.type === 'sos' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>ขอความช่วยเหลือฉุกเฉิน (SOS)</span>
                  </span>
                )}
                {mobileDetailItem.type === 'donation' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-600 text-white flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{mobileDetailItem.data.type === 'food_distribution' ? 'โรงครัวแจกอาหารสด' : mobileDetailItem.data.type === 'relief_supplies' ? 'จุดแจกถุงยังชีพ' : 'จุดรับบริจาค'}</span>
                  </span>
                )}
                {mobileDetailItem.type === 'rescueCenter' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                    <span>ศูนย์กู้ภัย & ฐานช่วยเหลือ 24 ชม.</span>
                  </span>
                )}
                {mobileDetailItem.type === 'shelter' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-600 text-white flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    <span>ศูนย์พักพิงชั่วคราว</span>
                  </span>
                )}
                {mobileDetailItem.type === 'myLocation' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-600 text-white flex items-center gap-1">
                    <span>📍 พิกัดของคุณ</span>
                  </span>
                )}
                {mobileDetailItem.type === 'temp' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1">
                    <span>🎯 จุดที่คุณเลือก</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setMobileDetailItem(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-8 text-sm">
              
              {/* 1. FLOOD DETAIL */}
              {mobileDetailItem.type === 'flood' && (() => {
                const item = mobileDetailItem.data;
                return (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400 mt-1">
                        <span>📍 อ.{item.district} {item.subdistrict ? `ต.${item.subdistrict}` : ''}</span>
                        <div className="flex items-center gap-1.5">
                          {item.reportCount > 1 && (
                            <span className="text-[11px] text-amber-300 bg-amber-950/80 border border-amber-500/60 px-2 py-0.5 rounded-full font-bold">
                              👥 ยืนยัน {item.reportCount} คน (รวมจุด)
                            </span>
                          )}
                          <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                            รัศมี ~{item.radius || 400} ม.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Water level & passable info */}
                    <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-slate-400 shrink-0">ระดับน้ำ:</span>
                        <span className="font-bold text-rose-400 text-sm">{item.waterLevel}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Car className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-slate-200">{item.passableFor}</span>
                      </div>
                    </div>

                    {/* Recommended Bypass Route */}
                    {item.recommendedRoute && (
                      <div className="bg-emerald-950/70 border border-emerald-500/50 p-3 rounded-2xl text-xs space-y-1">
                        <p className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                          <Navigation className="w-4 h-4 text-emerald-400" /> เส้นทางเลี่ยงที่แนะนำ:
                        </p>
                        <p className="text-emerald-100 leading-relaxed">
                          {item.recommendedRoute}
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <div className="bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-xl text-xs text-slate-300">
                        {item.description}
                      </div>
                    )}

                    {/* Update History */}
                    {item.updateHistory && item.updateHistory.length > 0 && (
                      <div className="bg-amber-950/60 border border-amber-500/40 p-2.5 rounded-xl text-xs text-amber-200">
                        <div className="font-bold text-amber-300">🔔 อัปเดตล่าสุด:</div>
                        <p className="mt-0.5">{item.updateHistory[0].note}</p>
                        <span className="text-[10px] text-amber-400/80">
                          ({formatThaiDateTime(item.updateHistory[0].timestamp)} โดย {item.updateHistory[0].reporterName})
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {isAdmin && onStartRelocateFlood && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileDetailItem(null);
                            onStartRelocateFlood(item);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl shadow text-xs active:scale-95 border border-blue-400"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>🛠️ ลากปรับพิกัดหมุดนี้ให้ตรงถนนจริง (Admin)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => { setMobileDetailItem(null); onOpenUpdateModal && onOpenUpdateModal(item); }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold py-2.5 px-3 rounded-xl shadow text-xs active:scale-95"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>📢 อัปเดตสถานการณ์จุดนี้ (น้ำลด / น้ำเพิ่ม)</span>
                      </button>

                      <a
                        href={getGoogleMapsDirectionsUrl(item.lat, item.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs no-underline active:scale-95"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>เปิดแอป Google Maps นำทางไปจุดนี้ 🧭</span>
                      </a>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={getLineShareUrl(formatFloodShareText(item))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2 px-2 rounded-xl text-xs no-underline"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>แชร์เข้า LINE</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, formatFloodShareText(item))}
                          className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-2 rounded-xl text-xs border border-slate-700"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">คัดลอกแล้ว!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-400" />
                              <span>คัดลอกข้อความ</span>
                            </>
                          )}
                        </button>
                      </div>

                      {item.contactPhone && (
                        <a
                          href={`tel:${item.contactPhone}`}
                          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 px-3 rounded-xl text-xs border border-slate-700 no-underline"
                        >
                          <Phone className="w-4 h-4" />
                          <span>โทรสอบถามข้อมูล: {item.contactPhone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 2. SOS DETAIL */}
              {mobileDetailItem.type === 'sos' && (() => {
                const item = mobileDetailItem.data;
                return (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        เวลาที่แจ้ง: {formatThaiDateTime(item.createdAt)}
                      </p>
                    </div>

                    <div className="bg-rose-950/60 border border-rose-500/50 p-3 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="text-slate-300">จำนวนผู้ประสบภัย:</span>
                        <span className="font-bold text-white text-sm">{item.victimsCount} คน</span>
                      </div>
                      {item.urgentNeeds && (
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-300">ต้องการด่วน: </span>
                            <span className="font-bold text-amber-300">
                              {Array.isArray(item.urgentNeeds) ? item.urgentNeeds.join(', ') : item.urgentNeeds}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-xs space-y-1">
                      <p className="font-semibold text-slate-300">เส้นทางเข้าถึง / จุดสังเกต:</p>
                      <p className="text-slate-200 leading-relaxed">{item.accessRoute}</p>
                      {item.address && (
                        <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-700 mt-1">
                          ที่อยู่: {item.address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <a
                        href={getGoogleMapsDirectionsUrl(item.lat, item.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-2.5 px-3 rounded-xl shadow-lg text-xs no-underline active:scale-95"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>กู้ภัย: ส่งพิกัดเข้า Google Maps นำทางทันที 🧭</span>
                      </a>

                      <a
                        href={`tel:${item.phone}`}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl shadow text-xs no-underline active:scale-95 border border-emerald-400/40"
                        style={{ color: '#ffffff', textDecoration: 'none' }}
                      >
                        <Phone className="w-4 h-4 text-white shrink-0" style={{ color: '#ffffff' }} />
                        <span className="font-bold text-white tracking-wide" style={{ color: '#ffffff' }}>
                          โทรติดต่อผู้ประสบภัย: {item.phone}
                        </span>
                      </a>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={getLineShareUrl(formatSosShareText(item))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2 px-2 rounded-xl text-xs no-underline"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>ส่งเคสเข้า LINE</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, formatSosShareText(item))}
                          className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-2 rounded-xl text-xs border border-slate-700"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">คัดลอกแล้ว!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-400" />
                              <span>คัดลอกข้อความ</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. DONATION DETAIL */}
              {mobileDetailItem.type === 'donation' && (() => {
                const d = mobileDetailItem.data;
                return (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white leading-snug">
                        {d.title}
                      </h3>
                      {d.address && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          📍 {d.address} (อ.{d.district})
                        </p>
                      )}
                    </div>

                    {/* Warning banner to call first */}
                    <div className="bg-rose-950/70 border border-rose-500/70 rounded-2xl p-3 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-rose-300 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>⚠️ กรุณาโทรเช็กก่อนเดินทางทุกครั้ง!</span>
                      </div>
                      <p className="text-[11px] text-rose-200">
                        โทรสอบถามว่าอาหารหรือของแจกยังมีอยู่หรือไม่ เพื่อไม่ให้เสียเวลาเดินทาง
                      </p>
                    </div>

                    {/* Big Call Button */}
                    <a
                      href={`tel:${d.contactPhone}`}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white font-black py-3 px-3 rounded-2xl shadow-lg text-sm no-underline active:scale-95 border border-emerald-400/50"
                    >
                      <Phone className="w-4 h-4 animate-bounce" />
                      <span>📞 โทรเช็กข้อมูล: {d.contactPhone}</span>
                    </a>

                    <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-xs space-y-1.5">
                      <div>
                        <span className="text-slate-400">🕒 เวลาเปิดแจก/เปิดรับ: </span>
                        <span className="font-bold text-orange-300">{d.operatingHours}</span>
                      </div>
                      {d.itemsAvailable && (
                        <div>
                          <span className="text-slate-400">📦 สิ่งของที่มีแจก: </span>
                          <span className="font-medium text-white">{d.itemsAvailable}</span>
                        </div>
                      )}
                      {d.organizerName && (
                        <div className="text-[11px] text-slate-400">
                          ผู้จัดตั้ง: {d.organizerName}
                        </div>
                      )}
                      {d.notes && (
                        <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-700 mt-1">
                          คำแนะนำ: {d.notes}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <a
                        href={getGoogleMapsDirectionsUrl(d.lat, d.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-2.5 px-3 rounded-xl shadow text-xs no-underline active:scale-95"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>นำทางด้วย Google Maps ไปจุดนี้ 🧭</span>
                      </a>

                      <a
                        href={getLineShareUrl(formatDonationShareText(d))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2 px-3 rounded-xl text-xs no-underline"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>แชร์จุดแจกอาหารนี้เข้า LINE</span>
                      </a>

                      <button
                        type="button"
                        onClick={async () => {
                          const confirmDelete = window.confirm(`คุณต้องการลบจุด "${d.title}" ออกจากแผนที่ใช่หรือไม่?`);
                          if (!confirmDelete) return;
                          setMobileDetailItem(null);
                          if (onDeleteDonation) {
                            await onDeleteDonation(d.id);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold py-2 px-3 rounded-xl text-xs border border-rose-600/50"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span>🗑️ ลบจุดนี้ / แจ้งปิดจุดแจกบริจาค</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 4. RESCUE CENTER DETAIL */}
              {mobileDetailItem.type === 'rescueCenter' && (() => {
                const rc = mobileDetailItem.data;
                return (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white leading-snug">
                        {rc.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        📍 {rc.address} (อ.{rc.district})
                      </p>
                    </div>

                    <a
                      href={`tel:${rc.phone}`}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black py-3 px-3 rounded-2xl shadow-lg text-sm no-underline active:scale-95"
                    >
                      <Phone className="w-4 h-4 animate-bounce" />
                      <span>📞 โทรขอความช่วยเหลือทันที: {rc.phone}</span>
                    </a>

                    <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-xs space-y-1.5">
                      <div>
                        <span className="text-slate-400">🕒 สถานะ: </span>
                        <span className="font-bold text-emerald-400">{rc.operatingHours}</span>
                      </div>
                      {rc.equipment && (
                        <div>
                          <span className="text-slate-400">ยุทโธปกรณ์: </span>
                          <span className="text-slate-200">{rc.equipment}</span>
                        </div>
                      )}
                      {rc.coverageArea && (
                        <div>
                          <span className="text-slate-400">พื้นที่ดูแล: </span>
                          <span className="text-slate-200">{rc.coverageArea}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <a
                        href={getGoogleMapsDirectionsUrl(rc.lat, rc.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl shadow text-xs no-underline active:scale-95"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>นำทางไปศูนย์กู้ภัยด้วย Google Maps 🧭</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => { setMobileDetailItem(null); onOpenSosModal && onOpenSosModal(); }}
                        className="w-full flex items-center justify-center gap-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-bold py-2.5 px-3 rounded-xl text-xs border border-rose-600/50"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>แจ้งปักหมุดขอความช่วยเหลือในระบบ (SOS)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 5. SHELTER DETAIL */}
              {mobileDetailItem.type === 'shelter' && (() => {
                const s = mobileDetailItem.data;
                return (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white leading-snug">
                        {s.name}
                      </h3>
                      {s.address && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          📍 {s.address} (อ.{s.district})
                        </p>
                      )}
                    </div>

                    <div className="bg-sky-950/60 border border-sky-500/40 p-3 rounded-2xl text-xs space-y-1.5">
                      <div>
                        <span className="text-slate-300">👥 ความจุ: </span>
                        <span className="font-bold text-sky-300">{s.capacity}</span>
                      </div>
                      {s.facilities && (
                        <div className="text-slate-200">
                          บริการ: {s.facilities.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <a
                        href={getGoogleMapsDirectionsUrl(s.lat, s.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold py-2.5 px-3 rounded-xl shadow text-xs no-underline active:scale-95"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>นำทางด้วย Google Maps ไปศูนย์พักพิง 🧭</span>
                      </a>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${s.phone}`}
                          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-2 rounded-xl text-xs no-underline"
                        >
                          <Phone className="w-4 h-4" />
                          <span>โทร: {s.phone}</span>
                        </a>

                        <a
                          href={getLineShareUrl(formatShelterShareText(s))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2 px-2 rounded-xl text-xs no-underline"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>แชร์ LINE</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 6. MY LOCATION DETAIL */}
              {mobileDetailItem.type === 'myLocation' && (() => {
                const loc = mobileDetailItem.data;
                return (
                  <div className="space-y-3">
                    <p className="font-bold text-sm text-cyan-400">
                      📍 พิกัดปัจจุบันของคุณ (GPS)
                    </p>
                    <p className="text-xs font-mono bg-slate-800 p-2 rounded-xl text-slate-300">
                      พิกัด: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                    </p>
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <a
                        href={getLineShareUrl(formatMyLocationShareText(loc.lat, loc.lng))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#06C755] text-white font-bold py-2.5 px-3 rounded-xl text-xs no-underline"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>แชร์พิกัดของฉันเข้า LINE 📲</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy('my-loc', formatMyLocationShareText(loc.lat, loc.lng))}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs border border-slate-700"
                      >
                        {copiedId === 'my-loc' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">คัดลอกพิกัดแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-400" />
                            <span>คัดลอกพิกัด & ลิงก์แผนที่</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 7. TEMP PICKER DETAIL */}
              {mobileDetailItem.type === 'temp' && (() => {
                const coord = mobileDetailItem.data;
                return (
                  <div className="space-y-3">
                    <p className="font-bold text-sm text-blue-400">
                      🎯 จุดที่คุณเลือก
                    </p>
                    <p className="text-xs font-mono bg-slate-800 p-2 rounded-xl text-slate-300">
                      พิกัด: {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDetailItem(null);
                        onClearSelectedCoord && onClearSelectedCoord();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>ลบ/ยกเลิกจุดที่เลือกนี้ออกจากแผนที่</span>
                    </button>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {/* Admin Marker Relocation Confirmation Modal */}
      {pendingRelocationCoords && (
        <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-blue-500/80 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">บันทึกตำแหน่งพิกัดใหม่?</h3>
                <p className="text-xs text-slate-400">ข้อมูลรายละเอียดเดิมทั้งหมดยังคงอยู่ครบถ้วน 100%</p>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 space-y-2 text-xs">
              <div className="font-bold text-amber-400 truncate">{pendingRelocationCoords.title}</div>
              <div className="flex justify-between text-slate-400">
                <span>พิกัดเดิม:</span>
                <span className="font-mono text-slate-300">{pendingRelocationCoords.oldLat.toFixed(5)}, {pendingRelocationCoords.oldLng.toFixed(5)}</span>
              </div>
              <div className="flex justify-between text-blue-400 font-semibold border-t border-slate-700/60 pt-1">
                <span>พิกัดใหม่ที่ลาก:</span>
                <span className="font-mono text-emerald-400 font-bold">{pendingRelocationCoords.newLat.toFixed(5)}, {pendingRelocationCoords.newLng.toFixed(5)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingRelocationCoords(null)}
                disabled={savingRelocation}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                ลากปรับใหม่
              </button>
              <button
                type="button"
                onClick={async () => {
                  setSavingRelocation(true);
                  try {
                    if (onSaveRelocatedCoordinate) {
                      await onSaveRelocatedCoordinate(
                        pendingRelocationCoords.id,
                        pendingRelocationCoords.newLat,
                        pendingRelocationCoords.newLng
                      );
                    }
                  } finally {
                    setSavingRelocation(false);
                    setPendingRelocationCoords(null);
                  }
                }}
                disabled={savingRelocation}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
              >
                {savingRelocation ? 'กำลังบันทึก...' : '✅ ยืนยันบันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
