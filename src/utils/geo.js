// Utility functions for Geolocation and Google Maps Navigation

/**
 * Generate Google Maps Turn-by-Turn Navigation URL
 * Opens directly in the Google Maps app on iOS/Android or Google Maps in browser
 */
export function getGoogleMapsDirectionsUrl(lat, lng) {
  if (!lat || !lng) return '#';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}&travelmode=driving`;
}

/**
 * Generate Google Maps View / Search URL
 */
export function getGoogleMapsViewUrl(lat, lng, label = '') {
  if (!lat || !lng) return '#';
  const query = label ? `${encodeURIComponent(label)}+(${lat},${lng})` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Get current device GPS coordinates with high accuracy
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด GPS'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = 'ไม่สามารถระบุตำแหน่ง GPS ได้';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'โปรดอนุญาตให้เบราว์เซอร์เข้าถึงตำแหน่ง (GPS) ของคุณ';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'ไม่พบสัญญาณตำแหน่ง GPS ในขณะนี้';
            break;
          case error.TIMEOUT:
            msg = 'หมดเวลาค้นหาสัญญาณตำแหน่ง GPS';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Format date time to Thai format
 */
export function formatThaiDateTime(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.';
  } catch {
    return isoString;
  }
}

/**
 * Check if coordinate is in or near Sa Kaeo province bounds
 */
export const SAKAEO_CENTER = {
  lat: 13.8143,
  lng: 102.0722,
};
