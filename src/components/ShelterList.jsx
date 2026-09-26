import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  Phone, 
  Users, 
  Navigation, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  Search,
  Sparkles,
  Bed
} from 'lucide-react';
import { getGoogleMapsDirectionsUrl } from '../utils/geo';
import { getLineShareUrl, formatShelterShareText, copyToClipboard } from '../utils/share';

export default function ShelterList({ shelters = [], onFocusOnMap }) {
  const [districtFilter, setDistrictFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = shelters.filter(s => {
    if (districtFilter !== 'all' && s.district !== districtFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopy = async (shelter) => {
    const text = formatShelterShareText(shelter);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(shelter.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const districts = ['ทั้งหมด', 'อรัญประเทศ', 'เมืองสระแก้ว', 'วัฒนานคร', 'วังน้ำเย็น', 'ตาพระยา'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/50 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-950/60 shrink-0">
            <Home className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-2xl text-white">
                ศูนย์พักพิงชั่วคราว & จุดแจกจ่ายเสบียง จ.สระแก้ว
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Shelters
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              เปิดรับผู้ประสบภัยตลอด 24 ชั่วโมง มีอาหาร น้ำดื่ม แพทย์สนาม และจุดชาร์จแบตเตอรี่มือถือ
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-sky-500/40 px-4 py-2.5 rounded-2xl text-center">
          <div className="text-xl font-heading font-bold text-sky-400">{shelters.length} แห่ง</div>
          <div className="text-[11px] text-slate-400">เปิดให้บริการพร้อมรับคน</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            {districts.map(d => (
              <option key={d} value={d === 'ทั้งหมด' ? 'all' : d}>
                {d === 'ทั้งหมด' ? '📍 ทุกอำเภอ' : `อ.${d}`}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อศูนย์, โรงเรียน, วัด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Shelter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => {
          const lineUrl = getLineShareUrl(formatShelterShareText(s));
          const isCopied = copiedId === s.id;

          return (
            <div 
              key={s.id}
              className="bg-slate-900 border border-sky-600/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-sky-400 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    เปิดรับตลอด 24 ชม.
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    อ.{s.district}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-white mb-1">
                  {s.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-sky-300 bg-sky-950/40 p-2 rounded-xl border border-sky-800/40 mb-3">
                  <Users className="w-4 h-4 shrink-0 text-sky-400" />
                  <span>ความจุ: <strong>{s.capacity}</strong></span>
                </div>

                {/* Facilities */}
                {s.facilities && (
                  <div className="space-y-1 mb-3">
                    <span className="text-[11px] text-slate-400 font-semibold">สิ่งอำนวยความสะดวก:</span>
                    <div className="flex flex-wrap gap-1">
                      {s.facilities.map((fac, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                          ✓ {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {s.address && (
                  <p className="text-xs text-slate-400 mb-2">
                    <strong>ที่อยู่:</strong> {s.address}
                  </p>
                )}

                {s.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    ℹ️ {s.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <a
                  href={getGoogleMapsDirectionsUrl(s.lat, s.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md transition-transform active:scale-95 no-underline"
                >
                  <Navigation className="w-4 h-4" />
                  <span>นำทางด้วย Google Maps ไปศูนย์พักพิง 🧭</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${s.phone}`}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-2.5 rounded-xl text-xs no-underline transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทร: {s.phone}</span>
                  </a>

                  {/* LINE Share Button */}
                  <a
                    href={lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2 px-2.5 rounded-xl text-xs no-underline transition-colors"
                    title="ส่งต่อเข้ากลุ่ม LINE"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>แชร์เข้า LINE</span>
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
