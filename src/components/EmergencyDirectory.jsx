import React from 'react';
import { Phone, ShieldAlert, HeartPulse, Building2, Truck, ExternalLink, LifeBuoy } from 'lucide-react';

const EMERGENCY_SECTIONS = [
  {
    category: "🚨 กู้ชีพ กู้ภัย และการแพทย์ฉุกเฉิน",
    icon: HeartPulse,
    color: "from-rose-600 to-red-600",
    contacts: [
      { name: "สายด่วนการแพทย์ฉุกเฉิน / กู้ชีพทั่วไทย", phone: "1669", desc: "โทรฟรี 24 ชม. ประสานรถพยาบาลและเรือฉุกเฉิน", urgent: true },
      { name: "มูลนิธิกู้ภัยสว่างสระแก้วธรรมสถาน", phone: "037-241-090", desc: "ศูนย์กู้ภัยสระแก้ว มีเรือท้องแบนและทีมประดาน้ำ", urgent: true },
      { name: "มูลนิธิร่วมกตัญญู จุดสระแก้ว / อรัญประเทศ", phone: "037-231-111", desc: "กู้ชีพ-กู้ภัย ช่วยเหลือผู้ประสบภัยและอพยพ", urgent: true },
      { name: "โรงพยาบาลสมเด็จพระยุพราชสระแก้ว", phone: "037-243-018", desc: "ศูนย์รับส่งต่อผู้ป่วยฉุกเฉิน อ.เมืองสระแก้ว", urgent: false },
      { name: "โรงพยาบาลอรัญประเทศ", phone: "037-233-038", desc: "ห้องฉุกเฉิน รพ.อรัญประเทศ 24 ชม.", urgent: false },
      { name: "โรงพยาบาลวังน้ำเย็น", phone: "037-251-108", desc: "ห้องฉุกเฉิน รพ.วังน้ำเย็น", urgent: false }
    ]
  },
  {
    category: "🛡️ กรมป้องกันและบรรเทาสาธารณภัย (ปภ.) & ท้องถิ่น",
    icon: ShieldAlert,
    color: "from-amber-600 to-orange-600",
    contacts: [
      { name: "สายด่วน ปภ. (แจ้งเหตุด่วนภัยพิบัติ)", phone: "1784", desc: "ศูนย์เตือนภัยพิบัติแห่งชาติ 24 ชั่วโมง", urgent: true },
      { name: "สำนักงาน ปภ. จังหวัดสระแก้ว", phone: "037-425-475", desc: "ศูนย์ประสานงานบรรเทาสาธารณภัย จ.สระแก้ว", urgent: true },
      { name: "เทศบาลเมืองสระแก้ว (งานป้องกันฯ)", phone: "037-421-123", desc: "ประสานขอกระสอบทราย ติดตั้งเครื่องสูบน้ำ", urgent: false },
      { name: "เทศบาลเมืองอรัญประเทศ (งานป้องกันฯ)", phone: "037-231-017", desc: "ศูนย์อำนวยการช่วยเหลือผู้ประสบภัยน้ำท่วมอรัญประเทศ", urgent: false },
      { name: "ที่ว่าการอำเภอเมืองสระแก้ว", phone: "037-241-334", desc: "ศูนย์ประสานงานช่วยเหลือระดับอำเภอ", urgent: false },
      { name: "ที่ว่าการอำเภออรัญประเทศ", phone: "037-231-155", desc: "ศูนย์ประสานงานช่วยเหลือ อ.อรัญประเทศ", urgent: false }
    ]
  },
  {
    category: "🚗 การจราจร ทางหลวง และตำรวจ",
    icon: Truck,
    color: "from-blue-600 to-indigo-600",
    contacts: [
      { name: "สายด่วนตำรวจทางหลวง", phone: "1193", desc: "สอบถามเส้นทางน้ำท่วม ทางขาด ทางเลี่ยง ทั่วประเทศ 24 ชม.", urgent: true },
      { name: "แขวงทางหลวงสระแก้ว", phone: "037-241-234", desc: "แจ้งจุดน้ำท่วมทางหลวง สะพานชำรุด ดินสไลด์", urgent: false },
      { name: "สายด่วนทางหลวงชนบท", phone: "1146", desc: "สอบถามและแจ้งข้อมูลถนนทางหลวงชนบท", urgent: false },
      { name: "สถานีตำรวจภูธรเมืองสระแก้ว (สภ.เมือง)", phone: "037-241-011", desc: "แจ้งเหตุและประสานงานความปลอดภัย", urgent: false },
      { name: "สถานีตำรวจภูธรอรัญประเทศ (สภ.อรัญฯ)", phone: "037-231-203", desc: "แจ้งเหตุด่วน อ.อรัญประเทศ", urgent: false }
    ]
  }
];

export default function EmergencyDirectory() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-2">
          <Phone className="w-6 h-6 text-emerald-400" />
          <span>ศูนย์รวมเบอร์โทรฉุกเฉินและหน่วยงาน จ.สระแก้ว</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          บันทึกหรือกดโทรออกได้ทันทีจากมือถือ หากติดอยู่ในบ้านระดับน้ำสูงโปรดโทร 1669 หรือกู้ภัยสว่างสระแก้ว
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {EMERGENCY_SECTIONS.map((section, idx) => {
          const IconComp = section.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${section.color} text-white shadow`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {section.category}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.contacts.map((c, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      c.urgent
                        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-heading font-bold text-sm text-white">
                          {c.name}
                        </h4>
                        {c.urgent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shrink-0">
                            ด่วน 24 ชม.
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 mb-3">
                        {c.desc}
                      </p>
                    </div>

                    <a
                      href={`tel:${c.phone}`}
                      className={`w-full flex items-center justify-center gap-2 font-bold py-2 px-3 rounded-xl text-xs shadow transition-transform active:scale-95 no-underline ${
                        c.urgent
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      <span>โทร: {c.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
