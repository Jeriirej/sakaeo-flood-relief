import L from 'leaflet';

// Custom SVG-based DivIcons for reliable rendering without asset path issues
export function createCustomMarkerIcon(type, options = {}) {
  let bgColor = '#ef4444'; // red default
  let borderColor = '#991b1b';
  let iconSvg = '';
  let className = 'custom-leaflet-marker';

  if (type === 'danger') {
    // 🔴 น้ำท่วมสูง/ผ่านไม่ได้ - มีป้ายชื่อชุมชน/จุดปักหมุดสั้นๆ ด้านบน
    const labelText = options.label || 'น้ำท่วมสูง';
    const cleanLabel = labelText.replace(/^(⛔|🔴|⚠️)\s*/, '');
    const html = `
      <div style="position: relative; width: 42px; height: 42px;">
        <!-- Top Badge -->
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #fca5a5;
          font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1.5px solid #ef4444;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 4px;
          pointer-events: none;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ef4444; flex-shrink: 0;"></span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cleanLabel}</span>
        </div>

        <!-- Main Pin -->
        <div style="
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.7), 0 4px 12px rgba(0,0,0,0.5);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker danger-flood-marker',
      html: html,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  } else if (type === 'warning') {
    // 🟡 เฝ้าระวัง/รถเล็กห้ามผ่าน - มีป้ายชื่อชุมชน/จุดปักหมุดสั้นๆ ด้านบน
    const labelText = options.label || 'เฝ้าระวัง';
    const cleanLabel = labelText.replace(/^(⚠️|🟡)\s*/, '');
    const html = `
      <div style="position: relative; width: 42px; height: 42px;">
        <!-- Top Badge -->
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #fde047;
          font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1.5px solid #eab308;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 4px;
          pointer-events: none;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #eab308; flex-shrink: 0;"></span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cleanLabel}</span>
        </div>

        <!-- Main Pin -->
        <div style="
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px rgba(234, 179, 8, 0.7), 0 4px 12px rgba(0,0,0,0.5);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1917" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker warning-flood-marker',
      html: html,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  } else if (type === 'safe') {
    // 🟢 เส้นทางเลี่ยงปลอดภัย - มีป้ายกำกับข้อความด้านบนเหมือนศูนย์กู้ภัย
    const labelText = options.label || 'เส้นทางปลอดภัย';
    const cleanLabel = labelText.replace(/^✅\s*/, '');
    const html = `
      <div style="position: relative; width: 42px; height: 42px;">
        <!-- Top Badge -->
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #4ade80;
          font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1.5px solid #22c55e;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 4px;
          pointer-events: none;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">✅ ${cleanLabel}</span>
        </div>

        <!-- Main Pin -->
        <div style="
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.7), 0 4px 12px rgba(0,0,0,0.5);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker safe-route-marker',
      html: html,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  } else if (type === 'sos') {
    // 🆘 ขอความช่วยเหลือฉุกเฉิน - เด่นกว่าทุกหมุดด้วยไฟไซเรนและป้ายช่วยด่วน
    const labelText = options.label || 'ช่วยด่วน';
    const cleanLabel = labelText.replace(/^(🚨|🆘)\s*/, '');
    bgColor = '#dc2626';
    borderColor = '#ffffff';
    className += ' pulse-sos-marker';
    iconSvg = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="#dc2626" stroke-width="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span style="font-weight: 900; font-size: 10px; color: white; letter-spacing: 0.5px; margin-top: 1px;">SOS</span>
      </div>
    `;

    const html = `
      <div style="position: relative; width: 44px; height: 44px;">
        <!-- Top Eye-catching Badge -->
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #dc2626;
          color: white;
          font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 9999px;
          border: 1.5px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 3px;
          pointer-events: none;
        ">
          <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #ffffff;"></span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">🚨 ${cleanLabel}</span>
        </div>

        <!-- Main Beacon Pin -->
        <div style="
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.9), 0 4px 12px rgba(0,0,0,0.5);
          width: 44px;
          height: 44px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            ${iconSvg}
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: className,
      html: html,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });
  } else if (type === 'shelter') {
    // 🏠 ศูนย์พักพิงชั่วคราว - มีป้ายชื่อศูนย์/ชุมชนด้านบน
    const labelText = options.label || 'ศูนย์พักพิง';
    const cleanLabel = labelText.replace(/^(🏠|⛺)\s*/, '');
    const html = `
      <div style="position: relative; width: 42px; height: 42px;">
        <!-- Top Badge -->
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #7dd3fc;
          font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1.5px solid #0284c7;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 4px;
          pointer-events: none;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; flex-shrink: 0;"></span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">🏠 ${cleanLabel}</span>
        </div>

        <!-- Main Pin -->
        <div style="
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.7), 0 4px 12px rgba(0,0,0,0.5);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker shelter-marker',
      html: html,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  } else if (type === 'rescueCenter') {
    // 🛡️ ศูนย์กู้ภัย / จุดประสานงานช่วยเหลือ (แยกจากผู้ประสบภัย)
    const labelText = options.label || 'ศูนย์กู้ภัย 24 ชม.';
    const cleanLabel = labelText.replace(/^🛡️\s*/, '');
    const html = `
      <div style="position: relative; width: 44px; height: 44px;">
        <!-- Top Badge -->
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #38bdf8;
          font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 9999px;
          border: 1.5px solid #38bdf8;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 3px;
          pointer-events: none;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">🛡️ ${cleanLabel}</span>
        </div>

        <!-- Main Pin -->
        <div style="
          background: linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%);
          border: 2.5px solid #fbbf24;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.7), 0 4px 12px rgba(0,0,0,0.5);
          width: 42px;
          height: 42px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker rescue-center-marker',
      html: html,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -42],
    });
  } else if (type === 'donation') {
    // 🍲 จุดแจกอาหาร / โรงครัว / จุดรับบริจาค
    const labelText = options.label || 'จุดแจก/บริจาค';
    const cleanLabel = labelText.replace(/^(🍲|📦)\s*/, '');
    const html = `
      <div style="position: relative; width: 42px; height: 42px;">
        <!-- Top Badge -->
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: #7c2d12;
          color: #fed7aa;
          font-family: 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 9999px;
          border: 1.5px solid #f97316;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 3px;
          pointer-events: none;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #fb923c;"></span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">🍲 ${cleanLabel}</span>
        </div>

        <!-- Main Pin -->
        <div style="
          background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px rgba(249, 115, 22, 0.7), 0 4px 12px rgba(0,0,0,0.5);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/>
              <path d="M19 8V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/>
              <path d="M12 3v5"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker donation-marker',
      html: html,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  } else if (type === 'picker') {
    // 📍 หมุดเลือกพิกัด
    bgColor = '#3b82f6';
    borderColor = '#1d4ed8';
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `;
  }

  const html = `
    <div style="
      background-color: ${bgColor};
      border: 2.5px solid ${borderColor};
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      width: 38px;
      height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
        ${iconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    className: className,
    html: html,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

/**
 * สกัดชื่อชุมชนหรือจุดปักหมุดสั้นๆ สำหรับแสดงบนหัวหมุด
 */
export function getShortLocationLabel(item) {
  if (!item) return '';
  if (item.shortLabel && item.shortLabel.trim()) return item.shortLabel.trim();

  let title = (item.title || '').trim();

  // ตัด emojis ด้านหน้า
  title = title.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}⛔✅⚠️🚨📍🛡️🍲🏠\s]+/u, '').trim();

  // 1. ถ้าผู้ใช้พิมพ์ชื่อจุดมาสั้นกระชับอยู่แล้ว (ไม่เกิน 15 ตัวอักษร) และไม่ใช่รหัสทางหลวงยาวๆ ให้ใช้ชื่อนั้นได้ทันที
  if (title.length > 0 && title.length <= 15 && !title.startsWith('ทางหลวง') && !title.startsWith('ทล.') && !title.includes('กม.')) {
    return title;
  }

  // 2. จุดสำคัญ/ชุมชน/สะพานที่รู้จัก
  if (title.includes('สะพานข้ามคลองหันแดง') || title.includes('คลองหันแดง')) return 'สะพานคลองหันแดง';
  if (title.includes('สะพานข้ามคลองพระสะทึง') || title.includes('คลองพระสะทึง')) return 'คลองพระสะทึง';
  if (title.includes('ตลาดโรงเกลือ')) return 'ตลาดโรงเกลือ';
  if (title.includes('คลองหมี')) return 'ชุมชนคลองหมี';
  if (title.includes('วัดถ้ำเขาฉกรรจ์')) return 'วัดถ้ำเขาฉกรรจ์';
  if (title.includes('โรงไฟฟ้า')) return 'โค้งโรงไฟฟ้า';
  if (title.includes('หนองผูกเต่า')) return 'รร.หนองผูกเต่า';
  if (title.includes('โคกสัมพันธ์')) return 'ฝายโคกสัมพันธ์';
  if (title.includes('หนองหว้า')) return 'ต.หนองหว้า';
  if (title.includes('รางรถไฟ')) return 'ทางรถไฟวัฒนานคร';
  if (title.includes('พรหมโหด')) return 'ริมคลองพรหมโหด';
  if (title.includes('ทับใหม่')) return 'บ้านทับใหม่';
  if (title.includes('คลองผักขม')) return 'บ้านคลองผักขม';
  if (title.includes('โนนสาวเอ้') || title.includes('ท่าข้าม')) return 'ท่าข้าม-โนนสาวเอ้';
  if (title.includes('วังท่าช้าง')) return 'แยกวังท่าช้าง';
  if (title.includes('สระขวัญ')) return 'สี่แยกสระขวัญ';
  if (title.includes('ทุ่งมหาเจริญ')) return 'บ้านทุ่งมหาเจริญ';
  if (title.includes('แซร์ออ')) return 'สระแก้ว-แซร์ออ';
  if (title.includes('นายาว')) return 'บ้านนายาว';
  if (title.includes('วังน้ำเย็น') && title.includes('317')) return 'ทล.317 วังน้ำเย็น';
  if (title.includes('จันทบุรี') && (title.includes('317') || title.includes('ปลอดภัย'))) return 'ทล.317 จันทบุรี';
  if (title.includes('กรุงเทพฯ')) return 'เลี่ยง กทม.-สระแก้ว';

  // 3. ตรวจจับข้อความในวงเล็บ
  const parenMatch = title.match(/\(([^)]+)\)/);
  if (parenMatch) {
    let inner = parenMatch[1].trim();
    inner = inner.replace(/กม\.\s*[\d\+\.\-]+/g, '').trim();
    inner = inner.replace(/ทั้งขาเข้า-ขาออก/g, '').trim();
    inner = inner.replace(/อ\.[^\s\)]+/g, '').trim();
    inner = inner.replace(/มวลน้ำ[^\)]+/g, '').trim();
    inner = inner.replace(/ทางขาด/g, '').trim();
    inner = inner.replace(/ต\.[^\s\)]+/g, '').trim();
    inner = inner.replace(/ช่วงเข้า/g, '').trim();
    inner = inner.replace(/\s*-\s*/g, '-').trim();
    inner = inner.replace(/^,\s*|,\s*$/g, '').trim();
    if (inner.length >= 3 && inner.length <= 16) {
      return inner;
    }
  }

  // 4. ตัดคำนำหน้าทางหลวง/ถนน เพื่อดึงเฉพาะชื่อสถานที่
  let clean = title.replace(/^(ทางหลวงชนบท|ทางหลวงแผ่นดิน|ทางหลวงหมายเลข|ทางหลวง|ทล\.|ถ\.|ถนน)\s*[\d\w\u0E00-\u{0E7F}\.]*\s*/u, '').trim();
  clean = clean.split(/[—–\(\-,]/)[0].trim();
  if (clean.length >= 2 && clean.length <= 15) {
    return clean;
  }

  // 5. ตำบล
  if (item.subdistrict && item.subdistrict.trim()) {
    return 'ต.' + item.subdistrict.replace(/^ต\./, '').trim();
  }

  // 6. ตัดความยาวถ้ายังยาวเกินไป
  if (clean.length > 15) clean = clean.substring(0, 14) + '…';
  return clean || (item.district ? 'อ.' + item.district : 'จุดน้ำท่วม');
}

/**
 * สกัดชื่อศูนย์พักพิงสั้นๆ สำหรับแสดงบนหัวหมุด
 */
export function getShortShelterLabel(shelter) {
  if (!shelter) return 'ศูนย์พักพิง';
  if (shelter.shortLabel) return shelter.shortLabel;

  let name = (shelter.name || '').trim();
  name = name.replace(/^ศูนย์พักพิงชั่วคราว\s*/, '').replace(/^ศูนย์พักพิง\s*/, '').replace(/^จุดพักพิงและศูนย์รวมพลกู้ภัย\s*/, '').trim();

  if (name.includes('หอประชุมเทศบาลเมืองอรัญประเทศ') || name.includes('เทศบาลเมืองอรัญ')) return 'หอประชุมเทศบาลอรัญฯ';
  if (name.includes('โรงเรียนอรัญประเทศ') || name.includes('รร.อรัญประเทศ')) return 'รร.อรัญประเทศ';
  if (name.includes('วัดสระแก้ว')) return 'วัดสระแก้ว';
  if (name.includes('วัดชนะไชยศรี')) return 'วัดชนะไชยศรี';
  if (name.includes('หอประชุมอำเภอเมือง')) return 'หอประชุม อ.เมือง';
  if (name.includes('หอประชุมอำเภอวัฒนานคร')) return 'หอประชุม อ.วัฒนานคร';
  if (name.includes('วัดเทพาวาส')) return 'วัดเทพาวาส';
  if (name.length > 15) return name.substring(0, 14) + '…';
  return name || 'ศูนย์พักพิง';
}

