// Utility functions for Social & LINE Sharing and Clipboard

export function getLineShareUrl(text) {
  return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    }
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}

export function formatFloodShareText(flood) {
  const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${flood.lat},${flood.lng}`;
  return `🌊 [แจ้งเตือนน้ำท่วมสระแก้ว]\n` +
    `📍 จุดเกิดเหตุ: ${flood.title} (อ.${flood.district})\n` +
    `⚠️ ระดับน้ำ: ${flood.waterLevel}\n` +
    `🚗 สภาพทาง: ${flood.passableFor}\n` +
    (flood.recommendedRoute ? `💡 ทางเลี่ยง: ${flood.recommendedRoute}\n` : '') +
    `🧭 นำทาง Google Maps: ${gmapUrl}\n` +
    `🌐 ติดตามสถานการณ์สด: ${window.location.origin}`;
}

export function formatSosShareText(sos) {
  const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${sos.lat},${sos.lng}`;
  return `🆘 [ขอกำลังกู้ภัยช่วยด่วน! น้ำท่วมสระแก้ว]\n` +
    `👤 ผู้ขอความช่วยเหลือ: ${sos.name}\n` +
    `📞 เบอร์โทรติดต่อ: ${sos.phone}\n` +
    `👥 ผู้ประสบภัย: ${sos.victimsCount || 'ไม่ระบุ'}\n` +
    `📦 สิ่งที่ต้องการ: ${Array.isArray(sos.urgentNeeds) ? sos.urgentNeeds.join(', ') : sos.urgentNeeds}\n` +
    `📍 เส้นทางเข้าถึง: ${sos.accessRoute}\n` +
    `🧭 พิกัดนำทาง Google Maps: ${gmapUrl}\n` +
    `⚡ วิงวอนทีมกู้ภัยช่วยประสานงานด่วน!`;
}

export function formatShelterShareText(shelter) {
  const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`;
  return `🏠 [ศูนย์พักพิงชั่วคราวน้ำท่วม สระแก้ว]\n` +
    `📍 สถานที่: ${shelter.name} (อ.${shelter.district})\n` +
    `👥 ความจุ: ${shelter.capacity}\n` +
    `📞 โทรสอบถาม: ${shelter.phone}\n` +
    `🧭 นำทาง Google Maps: ${gmapUrl}\n` +
    `เปิดรับผู้ประสบภัยตลอด 24 ชั่วโมง มีอาหาร น้ำดื่ม และแพทย์ดูแล`;
}

export function formatMyLocationShareText(lat, lng) {
  const gmapUrl = `https://maps.google.com/?q=${lat},${lng}`;
  return `📍 [ตำแหน่งพิกัด GPS ปัจจุบันของฉัน]\n` +
    `🧭 พิกัด: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n` +
    `🗺️ เปิดดูบน Google Maps: ${gmapUrl}\n` +
    `กำลังอยู่ในพื้นที่น้ำท่วม จ.สระแก้ว`;
}

export function formatDonationShareText(donation) {
  const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${donation.lat},${donation.lng}`;
  return `🍲 [จุดแจกอาหาร & ศูนย์รับบริจาค น้ำท่วมสระแก้ว]\n` +
    `📍 สถานที่: ${donation.title} (อ.${donation.district})\n` +
    `⚠️ ข้อสำคัญ: โปรดโทรเช็กก่อนเดินทางที่เบอร์ 📞 ${donation.contactPhone}\n` +
    `🕒 เวลาเปิดแจก/เปิดรับ: ${donation.operatingHours}\n` +
    `📦 สิ่งของที่มีแจก: ${donation.itemsAvailable}\n` +
    `🧭 นำทาง Google Maps: ${gmapUrl}`;
}

