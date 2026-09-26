import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FLOODS_FILE = path.join(DATA_DIR, 'floods.json');
const SOS_FILE = path.join(DATA_DIR, 'sos.json');

// Mock Data เริ่มต้นสำหรับจังหวัดสระแก้ว (พิกัดจริง)
const INITIAL_FLOODS = [
  {
    id: "flood-1",
    title: "ทางหลวง 33 ช่วงหน้าตลาดอรัญประเทศ",
    district: "อรัญประเทศ",
    subdistrict: "อรัญประเทศ",
    lat: 13.6872,
    lng: 102.5085,
    severity: "danger", // danger (แดง), warning (เหลือง), safe (เขียว-ทางเลี่ยง)
    waterLevel: "50 - 80 ซม. (ระดับเอว)",
    passableFor: "ห้ามรถทุกชนิดผ่านเด็ดขาด กระแสน้ำเชี่ยว",
    recommendedRoute: "ให้เลี่ยงไปใช้ถนนบายพาสเลี่ยงเมืองอรัญประเทศ หรือเส้นทางเลียบคลองลึกฝั่งเหนือ",
    description: "มีน้ำล้นตลิ่งจากคลองพรมโหด เอ่อเข้าท่วมถนนสายหลักระดับน้ำสูง รถเล็กห้ามผ่านเด็ดขาด มีเจ้าหน้าที่กั้นกรวยเตือน",
    reporterName: "ทีมอาสาอรัญ",
    contactPhone: "089-123-4567",
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "active"
  },
  {
    id: "flood-2",
    title: "สี่แยกสระแก้ว มุ่งหน้าเทศบาลเมืองสระแก้ว",
    district: "เมืองสระแก้ว",
    subdistrict: "สระแก้ว",
    lat: 13.8143,
    lng: 102.0722,
    severity: "warning",
    waterLevel: "20 - 30 ซม. (ปริ่มฟุตบาท)",
    passableFor: "รถกระบะยกสูงผ่านได้ / มอเตอร์ไซค์และรถเก๋งโปรดหลีกเลี่ยง",
    recommendedRoute: "ใช้ถนนเส้นตัดใหม่หลัง รพ.สมเด็จพระยุพราชสระแก้ว สัญจรได้ปกติ",
    description: "น้ำรอการระบาย มีน้ำท่วมขังเลนซ้ายสุด รถชะลอตัว สามารถวิ่งเลนขวาได้แต่ต้องใช้ความเร็วต่ำ",
    reporterName: "ชมรมกู้ชีพเมืองสระแก้ว",
    contactPhone: "081-999-8888",
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: "active"
  },
  {
    id: "flood-3",
    title: "เส้นทางเลี่ยงปลอดภัย: ถนนสาย 359 (สระแก้ว - เขาหินซ้อน)",
    district: "เมืองสระแก้ว",
    subdistrict: "สระขวัญ",
    lat: 13.7915,
    lng: 102.0150,
    severity: "safe",
    waterLevel: "ไม่มีน้ำท่วมขัง ถนนแห้งปกติ",
    passableFor: "รถทุกชนิดสัญจรได้ตามปกติ",
    recommendedRoute: "ใช้เป็นเส้นทางหลักในการเดินทางระหว่างกรุงเทพฯ - ปราจีนบุรี - สระแก้ว แทนเส้นทางในตัวเมือง",
    description: "ถนน 4 เลนสภาพดี การจราจรคล่องตัว ไม่มีน้ำท่วมขัง แนะนำสำหรับผู้เดินทางไกล",
    reporterName: "แขวงทางหลวงสระแก้ว",
    contactPhone: "037-241234",
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "active"
  },
  {
    id: "flood-4",
    title: "สะพานข้ามคลองพระปรง ต.ศาลาลำดวน",
    district: "เมืองสระแก้ว",
    subdistrict: "ศาลาลำดวน",
    lat: 13.8520,
    lng: 101.9950,
    severity: "danger",
    waterLevel: "น้ำล้นตลิ่งข้ามคอสะพาน สูง 60 ซม.",
    passableFor: "ห้ามผ่าน คอสะพานเริ่มชำรุด",
    recommendedRoute: "ให้เลี่ยงไปใช้สะพานบ้านแก้งแทน",
    description: "กระแสน้ำพัดแรงมาก ขอให้ประชาชนอย่านำรถฝ่าทางน้ำไหล อาจถูกพัดตกข้างทาง",
    reporterName: "ผู้ใหญ่บ้านหมู่ 3",
    contactPhone: "084-555-1234",
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    status: "active"
  },
  {
    id: "flood-handdaeng",
    title: "⛔ สะพานข้ามคลองหันแดง (ทางหลวง 33) — ห้ามผ่าน น้ำท่วมสูง",
    district: "เมืองสระแก้ว",
    subdistrict: "สระแก้ว",
    lat: 13.7745,
    lng: 101.9632,
    radius: 700,
    severity: "danger",
    waterLevel: "น้ำล้นข้ามสะพาน สูงมากกว่า 80 ซม. กระแสน้ำเชี่ยว",
    passableFor: "ห้ามรถทุกชนิดผ่านเด็ดขาด ทั้งรถกระบะ มอเตอร์ไซค์ และรถยนต์ทุกประเภท",
    recommendedRoute: "จากกรุงเทพฯ: ใช้ทางหลวง 33 → แยกบินบุรี → เลี้ยวซ้ายแถว 7-Eleven → สท.3015 → สท.3039 → สท.4034 → สระแก้ว | จากจันทบุรี: ใช้ทางหลวง 317 ผ่าน อ.สอยดาว → อ.วังน้ำเย็น → อ.เขาฉกรรจ์ → สระแก้ว",
    description: "ประกาศจากตำรวจภูธรจังหวัดสระแก้ว: สะพานข้ามคลองหันแดงบนทางหลวงหมายเลข 33 มีน้ำท่วมสูงมาก ห้ามยานพาหนะทุกชนิดผ่านเด็ดขาด กระแสน้ำแรงมาก อาจทำให้รถถูกพัดตกสะพานได้ โปรดใช้เส้นทางเลี่ยงน้ำท่วมตามคำแนะนำของเจ้าหน้าที่",
    reporterName: "ตำรวจภูธรจังหวัดสระแก้ว (ประชาสัมพันธ์)",
    contactPhone: "191",
    isSample: false,
    updatedAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "route-bkk-sakaeo",
    title: "✅ เส้นทางเลี่ยงน้ำท่วม กรุงเทพฯ → สระแก้ว (สท.3015 → 3039 → 4034)",
    district: "วัฒนานคร",
    subdistrict: "วัฒนานคร",
    lat: 13.7985,
    lng: 102.1050,
    radius: 500,
    severity: "safe",
    waterLevel: "ไม่มีน้ำท่วม ถนนแห้งปกติ",
    passableFor: "รถทุกชนิดสัญจรได้ตามปกติ รวมถึงรถเก๋งและมอเตอร์ไซค์",
    recommendedRoute: "ทางหลวง 33 → ถึงแยกบินบุรี → เลี้ยวซ้ายบริเวณร้านสะดวกซื้อ 7-Eleven → สท.3015 → สท.3039 → สท.4034 → เข้าสู่ ส.ท.เมืองสระแก้ว (หลีกเลี่ยงสะพานข้ามคลองหันแดง)",
    description: "เส้นทางเลี่ยงน้ำท่วมสำหรับผู้เดินทางจากกรุงเทพฯ-ปราจีนบุรี มุ่งหน้าสระแก้ว ตามประกาศของตำรวจภูธรจังหวัดสระแก้ว ขั้นตอน: 1.ใช้ทางหลวงหมายเลข 33 มุ่งหน้าปราจีนบุรี 2.ถึงแยกบินบุรี มุ่งหน้าแยกหนองสังข์ 3.เลี้ยวซ้ายบริเวณร้านสะดวกซื้อ 7-Eleven 4.ใช้เส้นทางหลวงชนบท สท.3015→สท.3039→สท.4034 5.เดินทางเข้าสู่ สท.เมืองสระแก้ว โดยหลีกเลี่ยงสะพานข้ามคลองหันแดง",
    reporterName: "ตำรวจภูธรจังหวัดสระแก้ว (ประชาสัมพันธ์)",
    contactPhone: "191",
    isSample: false,
    updatedAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "route-chanthaburi-sakaeo",
    title: "✅ เส้นทางปลอดภัย จันทบุรี → สระแก้ว (ทางหลวง 317)",
    district: "วังน้ำเย็น",
    subdistrict: "วังน้ำเย็น",
    lat: 13.4850,
    lng: 102.1750,
    radius: 500,
    severity: "safe",
    waterLevel: "ไม่มีน้ำท่วม รถยนต์ขนาดเล็กเดินทางได้ตามปกติ",
    passableFor: "รถยนต์ขนาดเล็กทุกชนิดเดินทางได้ตามปกติ (แนะนำให้ติดตามสถานการณ์น้ำอย่างต่อเนื่อง)",
    recommendedRoute: "ใช้ทางหลวงหมายเลข 317 → ผ่าน อ.สอยดาว → ผ่าน อ.วังน้ำเย็น → ผ่าน อ.เขาฉกรรจ์ → เดินทางเข้าสู่จังหวัดสระแก้ว",
    description: "เส้นทางปลอดภัยสำหรับผู้เดินทางจากจันทบุรีมุ่งหน้าสระแก้ว ใช้ทางหลวงหมายเลข 317 ผ่านอำเภอสอยดาว วังน้ำเย็น และเขาฉกรรจ์ รถยนต์ขนาดเล็กสามารถเดินทางได้ตามปกติ สถานการณ์น้ำและสภาพเส้นทางอาจเปลี่ยนแปลงได้ตลอดเวลา โปรดตรวจสอบข้อมูลก่อนออกเดินทาง",
    reporterName: "ตำรวจภูธรจังหวัดสระแก้ว (ประชาสัมพันธ์)",
    contactPhone: "191",
    isSample: false,
    updatedAt: new Date().toISOString(),
    status: "active"
  }
];

const INITIAL_SOS = [
  {
    id: "sos-1",
    name: "คุณสมหมาย บุญชู",
    phone: "081-234-5678",
    lat: 13.6845,
    lng: 102.5120,
    address: "บ้านเลขที่ 45/2 ชุมชนวัดชนะไชยศรี ซอย 4 ต.อรัญประเทศ อ.อรัญประเทศ",
    urgentNeeds: ["เรืออพยพด่วน", "น้ำดื่มสะอาด", "อาหารพร้อมทาน"],
    victimsCount: "ผู้ใหญ่ 3 คน, ผู้ป่วยติดเตียง 1 คน (ยายอายุ 82)",
    accessRoute: "เข้าทางซอยข้างวัดชนะไชยศรีประมาณ 200 เมตร ตอนนี้น้ำสูงระดับอก รถกระบะเข้าไม่ได้ ต้องใช้เรือท้องแบนหรือเรือกู้ภัยเท่านั้น",
    status: "pending", // pending, in_progress, resolved
    assignedTo: "",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: "มีเสบียงเหลือถึงแค่เย็นนี้ แบตมือถือเหลือ 20%"
  },
  {
    id: "sos-2",
    name: "คุณนารีรัตน์ (ตัวแทนหมู่บ้าน)",
    phone: "086-789-0123",
    lat: 13.8210,
    lng: 102.0650,
    address: "หมู่ 5 บ้านเนินสะอาด ต.สระแก้ว อ.เมืองสระแก้ว",
    urgentNeeds: ["น้ำดื่มและข้าวกล่อง", "นมผงเด็กอ่อน", "ยาลดไข้/แก้ท้องเสีย"],
    victimsCount: "ประมาณ 12 คน (มีเด็กเล็ก 2 คน ทารก 1 คน)",
    accessRoute: "ปากทางเข้าน้ำท่วมหัวเข่า รถยกสูงพอเข้าได้ แต่ในซอยลึกน้ำท่วมสูง จุดสังเกตหน้าซอยมีป้ายร้านซ่อมมอเตอร์ไซค์",
    status: "in_progress",
    assignedTo: "ทีมกู้ภัยสว่างสระแก้ว ชุดที่ 2",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: "กำลังนำเรือและถุงยังชีพเข้าไปจุดรวมพลศาลาหมู่บ้าน"
  }
];

// Helper read/write
function readData(filePath, fallbackData) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
      return fallbackData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallbackData;
  }
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// APIs
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET & POST Flood reports
app.get('/api/floods', (req, res) => {
  const floods = readData(FLOODS_FILE, INITIAL_FLOODS);
  res.json(floods);
});

app.post('/api/floods', (req, res) => {
  const { title, district, subdistrict, lat, lng, severity, waterLevel, passableFor, recommendedRoute, description, reporterName, contactPhone, radius } = req.body;
  
  if (!title || !lat || !lng) {
    return res.status(400).json({ error: 'Title, Latitude, and Longitude are required' });
  }

  const floods = readData(FLOODS_FILE, INITIAL_FLOODS);
  const parsedRadius = parseInt(radius) || (severity === 'danger' ? 600 : severity === 'warning' ? 350 : 250);

  const newFlood = {
    id: `flood-${Date.now()}`,
    title,
    district: district || 'ไม่ระบุอำเภอ',
    subdistrict: subdistrict || '',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    radius: parsedRadius,
    severity: severity || 'warning',
    waterLevel: waterLevel || 'ไม่ระบุ',
    passableFor: passableFor || 'โปรดระมัดระวัง',
    recommendedRoute: recommendedRoute || '',
    description: description || '',
    reporterName: reporterName || 'พลเมืองดี',
    contactPhone: contactPhone || '',
    isSample: false,
    updatedAt: new Date().toISOString(),
    status: 'active'
  };

  floods.unshift(newFlood);
  writeData(FLOODS_FILE, floods);
  res.status(201).json(newFlood);
});

// Clear sample / test data API
app.post('/api/clear-sample', (req, res) => {
  let floods = readData(FLOODS_FILE, INITIAL_FLOODS);
  let sosList = readData(SOS_FILE, INITIAL_SOS);

  // Filter out sample data
  floods = floods.filter(item => !item.isSample && !item.id.startsWith('flood-1') && !item.id.startsWith('flood-2') && !item.id.startsWith('flood-3') && !item.id.startsWith('flood-4'));
  sosList = sosList.filter(item => !item.isSample && !item.id.startsWith('sos-1') && !item.id.startsWith('sos-2'));

  writeData(FLOODS_FILE, floods);
  writeData(SOS_FILE, sosList);

  res.json({ 
    success: true, 
    message: 'ลบข้อมูลตัวอย่างทั้งหมดเรียบร้อยแล้ว ฐานข้อมูลพร้อมรับข้อมูลจริงจากประชาชน',
    remainingFloods: floods.length,
    remainingSos: sosList.length
  });
});

app.patch('/api/floods/:id', (req, res) => {
  const { id } = req.params;
  const { severity, waterLevel, passableFor, recommendedRoute, description, radius, reporterName, updateNote } = req.body;

  let floods = readData(FLOODS_FILE, INITIAL_FLOODS);
  const target = floods.find(item => item.id === id);

  if (!target) {
    return res.status(404).json({ error: 'ไม่พบจุดน้ำท่วมที่ระบุ' });
  }

  if (severity) target.severity = severity;
  if (waterLevel) target.waterLevel = waterLevel;
  if (passableFor) target.passableFor = passableFor;
  if (recommendedRoute !== undefined) target.recommendedRoute = recommendedRoute;
  if (description !== undefined) target.description = description;
  if (radius) target.radius = parseInt(radius);
  if (reporterName) target.reporterName = reporterName;

  target.updatedAt = new Date().toISOString();

  // Record update history
  if (!target.updateHistory) target.updateHistory = [];
  target.updateHistory.unshift({
    timestamp: target.updatedAt,
    reporterName: reporterName || 'พลเมืองดีในพื้นที่',
    note: updateNote || `อัปเดตสถานะ: ${waterLevel || severity || 'มีการเปลี่ยนแปลง'}`,
    severity: target.severity,
    waterLevel: target.waterLevel
  });

  writeData(FLOODS_FILE, floods);
  res.json(target);
});

app.delete('/api/floods/:id', (req, res) => {
  const { id } = req.params;
  let floods = readData(FLOODS_FILE, INITIAL_FLOODS);
  floods = floods.filter(item => item.id !== id);
  writeData(FLOODS_FILE, floods);
  res.json({ success: true });
});

// GET & POST SOS Requests
app.get('/api/sos', (req, res) => {
  const sosList = readData(SOS_FILE, INITIAL_SOS);
  res.json(sosList);
});

// Rate limiting map for anti-spam (IP -> timestamp)
const sosRateLimitMap = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || '127.0.0.1';
}

app.post('/api/sos', (req, res) => {
  const { name, phone, lat, lng, address, urgentNeeds, victimsCount, accessRoute, notes } = req.body;

  // 1. ตรวจสอบเบอร์โทรศัพท์ (บังคับกรอก และต้องเป็นตัวเลข 9-10 หลัก)
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
    return res.status(400).json({ 
      error: 'กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้จริงอย่างน้อย 9-10 หลัก (เช่น 081-234-5678) เพื่อให้ทีมกู้ภัยสามารถติดต่อยืนยันก่อนเดินทาง' 
    });
  }

  // 2. ตรวจสอบพิกัด GPS
  if (!lat || !lng) {
    return res.status(400).json({ error: 'กรุณาระบุพิกัด GPS หรือกดปุ่ม "ดึงพิกัด GPS อัตโนมัติ" เพื่อให้ทีมกู้ภัยเดินทางไปได้ถูกต้อง' });
  }

  // 3. ระบบกันสแปม (Rate Limit ป้องกันการกดยิงซ้ำรัวๆ)
  const clientIp = getClientIp(req);
  const now = Date.now();
  const lastSubmit = sosRateLimitMap.get(clientIp);

  if (lastSubmit && (now - lastSubmit) < 45000) {
    const remainingSec = Math.ceil((45000 - (now - lastSubmit)) / 1000);
    return res.status(429).json({ 
      error: `คุณเพิ่งส่งคำขอความช่วยเหลือไป กรุณารออีก ${remainingSec} วินาที หรือหากมีเหตุฉุกเฉินวิกฤตโปรดโทรสายด่วน 1669 ทันที` 
    });
  }

  // บันทึกเวลาล่าสุดที่ส่ง
  sosRateLimitMap.set(clientIp, now);

  // ล้างแคชที่เก่าเกิน 10 นาที เพื่อไม่ให้กินหน่วยความจำ
  if (sosRateLimitMap.size > 1000) {
    for (const [ip, time] of sosRateLimitMap.entries()) {
      if (now - time > 600000) sosRateLimitMap.delete(ip);
    }
  }

  const sosList = readData(SOS_FILE, INITIAL_SOS);
  const newSos = {
    id: `sos-${Date.now()}`,
    name: name?.trim() || 'ผู้ประสบภัย (ไม่ประสงค์ออกนาม)',
    phone: phone.trim(),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    address: address?.trim() || 'ไม่ระบุที่อยู่แน่ชัด (ใช้พิกัด GPS)',
    urgentNeeds: Array.isArray(urgentNeeds) ? urgentNeeds : [urgentNeeds].filter(Boolean),
    victimsCount: victimsCount?.trim() || 'ไม่ระบุจำนวน',
    accessRoute: accessRoute?.trim() || 'โปรดระวังกระแสน้ำและตรวจสอบสภาพเส้นทางก่อนเข้า',
    notes: notes?.trim() || '',
    status: 'pending',
    assignedTo: '',
    createdAt: new Date().toISOString()
  };

  sosList.unshift(newSos);
  writeData(SOS_FILE, sosList);
  res.status(201).json(newSos);
});

app.patch('/api/sos/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, notes } = req.body;

  const sosList = readData(SOS_FILE, INITIAL_SOS);
  const target = sosList.find(item => item.id === id);

  if (!target) {
    return res.status(404).json({ error: 'SOS request not found' });
  }

  if (status) target.status = status;
  if (assignedTo !== undefined) target.assignedTo = assignedTo;
  if (notes !== undefined) target.notes = notes;
  target.updatedAt = new Date().toISOString();

  writeData(SOS_FILE, sosList);
  res.json(target);
});

app.delete('/api/sos/:id', (req, res) => {
  const { id } = req.params;
  let sosList = readData(SOS_FILE, INITIAL_SOS);
  sosList = sosList.filter(item => item.id !== id);
  writeData(SOS_FILE, sosList);
  res.json({ success: true });
});

// รายการเบอร์โทรฉุกเฉิน จ.สระแก้ว
app.get('/api/emergency-contacts', (req, res) => {
  res.json([
    {
      category: "หน่วยกู้ชีพ กู้ภัย และการแพทย์ฉุกเฉิน",
      contacts: [
        { name: "สายด่วนแจ้งเหตุฉุกเฉิน / กู้ชีพ", phone: "1669", desc: "โทรฟรี 24 ชม. ทั่วประเทศ", urgent: true },
        { name: "มูลนิธิกู้ภัยสว่างสระแก้วธรรมสถาน", phone: "037-241-090", desc: "ศูนย์กู้ภัยสระแก้ว พร้อมเรือท้องแบนและทีมประดาน้ำ", urgent: true },
        { name: "มูลนิธิร่วมกตัญญู จุดสระแก้ว / อรัญประเทศ", phone: "037-231-111", desc: "กู้ชีพ-กู้ภัย ช่วยเหลือผู้ประสบภัยน้ำท่วม", urgent: true },
        { name: "โรงพยาบาลสมเด็จพระยุพราชสระแก้ว", phone: "037-243-018", desc: "ศูนย์รับส่งต่อผู้ป่วยฉุกเฉินเมืองสระแก้ว", urgent: false },
        { name: "โรงพยาบาลอรัญประเทศ", phone: "037-233-038", desc: "ห้องฉุกเฉิน รพ.อรัญประเทศ", urgent: false }
      ]
    },
    {
      category: "หน่วยงานป้องกันภัยและบรรเทาสาธารณภัย (ปภ.)",
      contacts: [
        { name: "ปภ. จังหวัดสระแก้ว (สายด่วน)", phone: "1784", desc: "แจ้งเหตุด่วนภัยพิบัติ 24 ชั่วโมง", urgent: true },
        { name: "สำนักงาน ปภ. จังหวัดสระแก้ว", phone: "037-425-475", desc: "ศูนย์ประสานงานบรรเทาสาธารณภัย จ.สระแก้ว", urgent: false },
        { name: "เทศบาลเมืองสระแก้ว (งานป้องกันฯ)", phone: "037-421-123", desc: "ประสานขอกระสอบทรายและสูบน้ำในเขตเทศบาล", urgent: false },
        { name: "เทศบาลเมืองอรัญประเทศ", phone: "037-231-017", desc: "ศูนย์อำนวยการแก้ไขปัญหาน้ำท่วมอรัญประเทศ", urgent: false }
      ]
    },
    {
      category: "การเดินทาง สัญจร และตำรวจทางหลวง",
      contacts: [
        { name: "สภ.เมืองสระแก้ว", phone: "037-241-011", desc: "สถานีตำรวจภูธรเมืองสระแก้ว", urgent: false },
        { name: "สภ.อรัญประเทศ", phone: "037-231-203", desc: "สถานีตำรวจภูธรอรัญประเทศ", urgent: false }
      ]
    }
  ]);
});

// ศูนย์พักพิงชั่วคราว จ.สระแก้ว
const SHELTERS_FILE = path.join(DATA_DIR, 'shelters.json');
app.get('/api/shelters', (req, res) => {
  const shelters = readData(SHELTERS_FILE, []);
  res.json(shelters);
});

// ศูนย์กู้ภัยและฐานปฏิบัติการช่วยเหลือ จ.สระแก้ว (แยกกับผู้ประสบภัย)
const RESCUE_CENTERS_FILE = path.join(DATA_DIR, 'rescue_centers.json');
app.get('/api/rescue-centers', (req, res) => {
  const centers = readData(RESCUE_CENTERS_FILE, []);
  res.json(centers);
});

// จุดแจกอาหาร โรงครัว และจุดรับบริจาคสิ่งของ (ประชาชน/ผู้ใจบุญเพิ่มเองได้)
const DONATIONS_FILE = path.join(DATA_DIR, 'donations.json');
app.get('/api/donations', (req, res) => {
  const donations = readData(DONATIONS_FILE, []);
  res.json(donations);
});

app.post('/api/donations', (req, res) => {
  const { title, organizerName, contactPhone, lat, lng, district, address, operatingHours, itemsAvailable, notes, type } = req.body;

  if (!title || !contactPhone || !lat || !lng) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อจุดแจก/รับบริจาค, เบอร์โทรศัพท์ติดต่อ และระบุตำแหน่งบนแผนที่' });
  }

  // ตรวจสอบเบอร์โทรศัพท์ ต้องใส่เพื่อให้ประชาชนโทรเช็กก่อนเดินทางจริง
  const cleanPhone = String(contactPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.length < 9 || cleanPhone.length > 10) {
    return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-10 หลัก) เพื่อให้ประชาชนโทรสอบถามก่อนเดินทาง' });
  }

  const donations = readData(DONATIONS_FILE, []);
  const newDonation = {
    id: `donation-${Date.now()}`,
    title: String(title).trim(),
    type: type || 'food_distribution', // food_distribution, relief_supplies, donation_reception
    organizerName: String(organizerName || 'จิตอาสา / ผู้ใจบุญ').trim(),
    contactPhone: String(contactPhone).trim(),
    lat: Number(lat),
    lng: Number(lng),
    district: district || 'อรัญประเทศ',
    address: String(address || '').trim(),
    operatingHours: String(operatingHours || 'แจกจนกว่าของจะหมด').trim(),
    itemsAvailable: String(itemsAvailable || 'อาหารกล่อง / น้ำดื่ม').trim(),
    notes: String(notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  donations.unshift(newDonation);
  writeData(DONATIONS_FILE, donations);
  res.status(201).json(newDonation);
});

app.delete('/api/donations/:id', (req, res) => {
  const { id } = req.params;
  const donations = readData(DONATIONS_FILE, []);
  const initialLength = donations.length;
  const filtered = donations.filter(d => d.id !== id);

  if (filtered.length === initialLength) {
    return res.status(404).json({ error: 'ไม่พบจุดแจกอาหารหรือรับบริจาคนี้' });
  }

  writeData(DONATIONS_FILE, filtered);
  res.json({ message: 'ลบจุดแจกอาหาร/รับบริจาคเรียบร้อยแล้ว', id });
});

// --- FEEDBACKS API ---
const FEEDBACKS_FILE = path.join(DATA_DIR, 'feedbacks.json');

app.get('/api/feedbacks', (req, res) => {
  const feedbacks = readData(FEEDBACKS_FILE, []);
  res.json(feedbacks);
});

app.post('/api/feedbacks', (req, res) => {
  const { category, message, contactInfo, name } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความข้อเสนอแนะ' });
  }

  const feedbacks = readData(FEEDBACKS_FILE, []);
  const newFeedback = {
    id: `fb-${Date.now()}`,
    category: category || 'ข้อเสนอแนะทั่วไป',
    message: String(message).trim(),
    contactInfo: String(contactInfo || '').trim(),
    name: String(name || 'ผู้ใช้งาน').trim(),
    status: 'unread',
    createdAt: new Date().toISOString()
  };

  feedbacks.unshift(newFeedback);
  writeData(FEEDBACKS_FILE, feedbacks);
  res.status(201).json(newFeedback);
});

app.delete('/api/feedbacks/:id', (req, res) => {
  const { id } = req.params;
  const feedbacks = readData(FEEDBACKS_FILE, []);
  const filtered = feedbacks.filter(f => f.id !== id);
  writeData(FEEDBACKS_FILE, filtered);
  res.json({ message: 'ลบข้อเสนอแนะเรียบร้อยแล้ว', id });
});

app.patch('/api/feedbacks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const feedbacks = readData(FEEDBACKS_FILE, []);
  const item = feedbacks.find(f => f.id === id);
  if (!item) return res.status(404).json({ error: 'ไม่พบ feedback' });
  item.status = status || (item.status === 'read' ? 'unread' : 'read');
  writeData(FEEDBACKS_FILE, feedbacks);
  res.json(item);
});

// --- ADMIN & SECURITY API ---
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');

function getAdminConfig() {
  const defaultConf = {
    secretKey: "Xk9Pq2Lm8Ws4Vb7Nz1Yc5Rt3Df6Gh0Jm9Qa2Ws4Ed7Rf1Tg8",
    adminPassword: "admin",
    updatedAt: new Date().toISOString()
  };
  return readData(ADMIN_CONFIG_FILE, defaultConf);
}

// ตรวจสอบ Secret Key จากช่องค้นหา (ความยาว 48 ตัวอักษร)
app.post('/api/admin/verify-secret', (req, res) => {
  const { secretKey } = req.body;
  if (!secretKey) return res.status(400).json({ valid: false });
  const conf = getAdminConfig();
  if (secretKey.trim() === conf.secretKey.trim()) {
    return res.json({ valid: true });
  }
  return res.json({ valid: false });
});

// เข้าสู่ระบบ Admin ด้วยรหัสผ่าน
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const conf = getAdminConfig();
  if (password === conf.adminPassword) {
    const token = 'adm_token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    return res.json({ success: true, token, secretKey: conf.secretKey });
  }
  return res.status(401).json({ error: 'รหัสผ่าน Admin ไม่ถูกต้อง' });
});

// ดึงการตั้งค่า Admin (Secret Key ปัจจุบัน)
app.get('/api/admin/config', (req, res) => {
  const conf = getAdminConfig();
  res.json({ secretKey: conf.secretKey });
});

// อัปเดตรหัสผ่าน หรือเปลี่ยน Secret Key 48 ตัวอักษร
app.post('/api/admin/update-settings', (req, res) => {
  const { newSecretKey, newPassword } = req.body;
  const conf = getAdminConfig();

  if (newSecretKey) {
    if (newSecretKey.trim().length !== 48) {
      return res.status(400).json({ error: 'Secret Key ต้องมีความยาว 48 ตัวอักษรพอดี' });
    }
    conf.secretKey = newSecretKey.trim();
  }

  if (newPassword) {
    if (newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
    }
    conf.adminPassword = newPassword.trim();
  }

  conf.updatedAt = new Date().toISOString();
  writeData(ADMIN_CONFIG_FILE, conf);
  res.json({ message: 'บันทึกการตั้งค่าความปลอดภัยเรียบร้อยแล้ว', secretKey: conf.secretKey });
});

// Admin ลบจุดน้ำท่วม
app.delete('/api/floods/:id', (req, res) => {
  const { id } = req.params;
  const floods = readData(FLOODS_FILE, []);
  const filtered = floods.filter(f => f.id !== id);
  writeData(FLOODS_FILE, filtered);
  res.json({ message: 'ลบจุดรายงานน้ำท่วมเรียบร้อยแล้ว', id });
});

// Admin ลบคำขอ SOS
app.delete('/api/sos/:id', (req, res) => {
  const { id } = req.params;
  const sos = readData(SOS_FILE, []);
  const filtered = sos.filter(s => s.id !== id);
  writeData(SOS_FILE, filtered);
  res.json({ message: 'ลบคำขอความช่วยเหลือ SOS เรียบร้อยแล้ว', id });
});

// ข้อมูลเตือนภัยสภาพอากาศและระดับน้ำแม่น้ำสายหลัก
app.get('/api/weather-alert', (req, res) => {
  res.json({
    warningLevel: "red", // red, yellow, green
    headline: "ประกาศเตือนภัยน้ำท่วมฉับพลันและน้ำป่าไหลหลาก จ.สระแก้ว",
    forecastPeriod: "24 ชั่วโมงข้างหน้า",
    rainfallForecast: "มีฝนฟ้าคะนอง 70-80% ของพื้นที่ ฝนตกหนักถึงหนักมาก โดยเฉพาะ อ.เมือง, อรัญประเทศ, วัฒนานคร (ต.โนนหมากเค็ง/บ้านทับใหม่)",
    riverStations: [
      { name: "คลองพรหมโหด (อรัญประเทศ)", status: "วิกฤต (ล้นตลิ่ง 0.85 ม.)", trend: "ทรงตัว-เพิ่มขึ้นเล็กน้อย", color: "red" },
      { name: "คลองพระสะทึง (เมืองสระแก้ว)", status: "วิกฤต (ล้นตลิ่ง 0.60 ม.)", trend: "ระบายน้ำต่อเนื่อง", color: "red" },
      { name: "คลองพระปรง (เมืองสระแก้ว)", status: "เฝ้าระวัง (ระดับน้ำ 85%)", trend: "เฝ้าระวังน้ำหลาก", color: "yellow" }
    ],
    updatedAt: new Date().toISOString()
  });
});

// Serve Static React app if dist folder exists
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Sa Kaeo Flood Relief Server is running on http://localhost:${PORT}`);
});

