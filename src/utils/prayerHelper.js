import { Coordinates, CalculationParameters, Rounding, Madhab, PrayerTimes } from 'adhan';
import { getTranslations } from './i18n.js';

/**
 * Standard Kemenag (Kementerian Agama RI) calculation parameters:
 * - Fajr Angle: 20° (sudut subuh Kemenag RI)
 * - Isha Angle: 18° (sudut isya Kemenag RI)
 * - Madhab: Syafi'i (standar Indonesia)
 * - Ihtiyat (safety buffer): +2 menit pada setiap waktu sholat sesuai ketetapan BHR Kemenag
 *   Subuh +2, Terbit -2, Dzuhur +2, Ashar +2, Maghrib +2, Isya +2
 * - Rounding: Up (membulatkan detik ke atas ke menit berikutnya)
 */
export const DEFAULT_KEMENAG_IHTIYAT = {
  fajr: 2,
  sunrise: -2,
  dhuhr: 2,
  asr: 2,
  maghrib: 2,
  isha: 2,
};

export const PRAYER_NAMES = {
  fajr: 'Subuh',
  sunrise: 'Terbit',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya',
};

export const POPULAR_CITIES = [
  { name: 'Jakarta', region: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
  { name: 'Surabaya', region: 'Jawa Timur', lat: -7.2575, lng: 112.7521, timezone: 'Asia/Jakarta' },
  { name: 'Bandung', region: 'Jawa Barat', lat: -6.9175, lng: 107.6191, timezone: 'Asia/Jakarta' },
  { name: 'Medan', region: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, timezone: 'Asia/Jakarta' },
  { name: 'Semarang', region: 'Jawa Tengah', lat: -6.9667, lng: 110.4167, timezone: 'Asia/Jakarta' },
  { name: 'Makassar', region: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, timezone: 'Asia/Makassar' },
  { name: 'Palembang', region: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, timezone: 'Asia/Jakarta' },
  { name: 'Tangerang', region: 'Banten', lat: -6.1783, lng: 106.6319, timezone: 'Asia/Jakarta' },
  { name: 'Tangerang Selatan', region: 'Banten', lat: -6.2888, lng: 106.7179, timezone: 'Asia/Jakarta' },
  { name: 'Depok', region: 'Jawa Barat', lat: -6.4025, lng: 106.7942, timezone: 'Asia/Jakarta' },
  { name: 'Bekasi', region: 'Jawa Barat', lat: -6.2383, lng: 106.9756, timezone: 'Asia/Jakarta' },
  { name: 'Bogor', region: 'Jawa Barat', lat: -6.5971, lng: 106.806, timezone: 'Asia/Jakarta' },
  { name: 'Yogyakarta', region: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695, timezone: 'Asia/Jakarta' },
  { name: 'Surakarta (Solo)', region: 'Jawa Tengah', lat: -7.5755, lng: 110.8243, timezone: 'Asia/Jakarta' },
  { name: 'Malang', region: 'Jawa Timur', lat: -7.9666, lng: 112.6326, timezone: 'Asia/Jakarta' },
  { name: 'Denpasar', region: 'Bali', lat: -8.6705, lng: 115.2126, timezone: 'Asia/Makassar' },
  { name: 'Banda Aceh', region: 'Aceh', lat: 5.5483, lng: 95.3238, timezone: 'Asia/Jakarta' },
  { name: 'Padang', region: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, timezone: 'Asia/Jakarta' },
  { name: 'Pekanbaru', region: 'Riau', lat: 0.5071, lng: 101.4478, timezone: 'Asia/Jakarta' },
  { name: 'Batam', region: 'Kepulauan Riau', lat: 1.1301, lng: 104.0529, timezone: 'Asia/Jakarta' },
  { name: 'Bandar Lampung', region: 'Lampung', lat: -5.45, lng: 105.2667, timezone: 'Asia/Jakarta' },
  { name: 'Pontianak', region: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, timezone: 'Asia/Jakarta' },
  { name: 'Banjarmasin', region: 'Kalimantan Selatan', lat: -3.3194, lng: 114.5908, timezone: 'Asia/Makassar' },
  { name: 'Balikpapan', region: 'Kalimantan Timur', lat: -1.2379, lng: 116.8529, timezone: 'Asia/Makassar' },
  { name: 'Samarinda', region: 'Kalimantan Timur', lat: -0.5022, lng: 117.1536, timezone: 'Asia/Makassar' },
  { name: 'Manado', region: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421, timezone: 'Asia/Makassar' },
  { name: 'Mataram', region: 'Nusa Tenggara Barat', lat: -8.5833, lng: 116.1167, timezone: 'Asia/Makassar' },
  { name: 'Kupang', region: 'Nusa Tenggara Timur', lat: -10.1772, lng: 123.607, timezone: 'Asia/Makassar' },
  { name: 'Ambon', region: 'Maluku', lat: -3.6554, lng: 128.1908, timezone: 'Asia/Jayapura' },
  { name: 'Jayapura', region: 'Papua', lat: -2.5916, lng: 140.669, timezone: 'Asia/Jayapura' },
  { name: 'Makkah', region: 'Saudi Arabia', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh' },
  { name: 'Madinah', region: 'Saudi Arabia', lat: 24.5247, lng: 39.5692, timezone: 'Asia/Riyadh' },
  { name: 'Kuala Lumpur', region: 'Malaysia', lat: 3.139, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Singapore', region: 'Singapore', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
];

/**
 * Returns prayer display name, automatically renaming Dhuhr to "Jum'at" on Fridays.
 */
export function getPrayerName(key, lang = 'id', date = null) {
  if (!key) return '';
  const normalizedKey = key.toLowerCase();

  let targetDate;
  if (date instanceof Date && !isNaN(date.getTime())) {
    targetDate = date;
  } else if (typeof date === 'number' || typeof date === 'string') {
    const parsed = new Date(date);
    targetDate = !isNaN(parsed.getTime()) ? parsed : new Date();
  } else {
    targetDate = new Date();
  }

  // Friday prayer rule: Dhuhr -> Jum'at for both ID and EN
  if (normalizedKey === 'dhuhr' && targetDate.getDay() === 5) {
    return "Jum'at";
  }

  const t = getTranslations(lang);
  return (t.prayers && t.prayers[normalizedKey]) || PRAYER_NAMES[normalizedKey] || key;
}

/**
 * Generates Kemenag calculation parameters with optional custom minute adjustments.
 */
export function getKemenagCalculationParameters(customAdjustments = {}) {
  const params = new CalculationParameters('Other', 20, 18);
  params.madhab = Madhab.Shafi;
  params.rounding = Rounding.Up;

  params.adjustments = {
    fajr: DEFAULT_KEMENAG_IHTIYAT.fajr + (Number(customAdjustments?.fajr) || 0),
    sunrise: DEFAULT_KEMENAG_IHTIYAT.sunrise + (Number(customAdjustments?.sunrise) || 0),
    dhuhr: DEFAULT_KEMENAG_IHTIYAT.dhuhr + (Number(customAdjustments?.dhuhr) || 0),
    asr: DEFAULT_KEMENAG_IHTIYAT.asr + (Number(customAdjustments?.asr) || 0),
    maghrib: DEFAULT_KEMENAG_IHTIYAT.maghrib + (Number(customAdjustments?.maghrib) || 0),
    isha: DEFAULT_KEMENAG_IHTIYAT.isha + (Number(customAdjustments?.isha) || 0),
  };

  return params;
}

/**
 * Formats a Date object to HH:mm string (24-hour), optionally in a specific IANA timezone.
 */
export function formatTimeHHMM(date, timezone = null) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '--:--';

  if (timezone) {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      // Fallback to local time if timezone identifier is invalid
    }
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Calculates prayer times for given coordinates and target date.
 */
export function calculatePrayerTimes(coords, date = new Date(), adjustments = {}, lang = 'id') {
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return null;
  }

  const coordinates = new Coordinates(coords.lat, coords.lng);
  const params = getKemenagCalculationParameters(adjustments);
  const times = new PrayerTimes(coordinates, date, params);

  let next = times.nextPrayer(date);
  let nextTime = times.timeForPrayer(next);

  // If next is 'none' or date is past Isha, rollover to tomorrow's Fajr
  if (next === 'none' || !nextTime || nextTime <= date) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
    next = 'fajr';
    nextTime = tomorrowTimes.fajr;
  }

  const remainingSeconds = nextTime ? Math.max(0, Math.floor((nextTime.getTime() - date.getTime()) / 1000)) : 0;
  const nextKey = (next && next !== 'none') ? next.toLowerCase() : 'fajr';
  const nextPrayerDisplayName = getPrayerName(nextKey, lang, nextTime);

  const tz = coords.timezone || null;

  const allPrayers = [
    { key: 'fajr', name: getPrayerName('fajr', lang, times.fajr), time: formatTimeHHMM(times.fajr, tz), date: times.fajr },
    { key: 'sunrise', name: getPrayerName('sunrise', lang, times.sunrise), time: formatTimeHHMM(times.sunrise, tz), date: times.sunrise },
    { key: 'dhuhr', name: getPrayerName('dhuhr', lang, times.dhuhr), time: formatTimeHHMM(times.dhuhr, tz), date: times.dhuhr },
    { key: 'asr', name: getPrayerName('asr', lang, times.asr), time: formatTimeHHMM(times.asr, tz), date: times.asr },
    { key: 'maghrib', name: getPrayerName('maghrib', lang, times.maghrib), time: formatTimeHHMM(times.maghrib, tz), date: times.maghrib },
    { key: 'isha', name: getPrayerName('isha', lang, times.isha), time: formatTimeHHMM(times.isha, tz), date: times.isha },
  ];

  return {
    times,
    nextKey,
    nextPrayerName: nextPrayerDisplayName,
    nextPrayerTime: nextTime,
    remainingSeconds,
    allPrayers,
  };
}

/**
 * Human-readable countdown string: "X jam Y menit" or "X hrs Y mins".
 */
export function formatCountdownHoursMinutes(totalSeconds, lang = 'id') {
  const t = getTranslations(lang);
  if (totalSeconds <= 0) return t.countdown.now;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    const hrLabel = hours > 1 && lang === 'en' ? t.countdown.hours : t.countdown.hourSingular;
    const minLabel = minutes > 1 && lang === 'en' ? t.countdown.minutes : t.countdown.minuteSingular;
    return `${hours} ${hrLabel} ${minutes} ${minLabel}`;
  }

  if (minutes > 0) {
    const minLabel = minutes > 1 && lang === 'en' ? t.countdown.minutes : t.countdown.minuteSingular;
    return `${minutes} ${minLabel}`;
  }

  return t.countdown.lessThanMinute;
}

/**
 * Formats countdown to digital clock format "HH:MM:SS".
 */
export function formatCountdownDigits(totalSeconds) {
  if (totalSeconds <= 0) return '00:00:00';
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Default tolerance window for prayer alerts (15 minutes in seconds).
 * Ensures background alarm batching or brief computer sleep doesn't miss the adzan.
 */
export const PRAYER_ALERT_WINDOW_SECONDS = 15 * 60;

/**
 * Pure evaluation function to determine if prayer alert should fire
 */
export function shouldTriggerPrayerAlert(
  now,
  prayerDate,
  lastRemindedId,
  reminderId,
  maxWindowSecs = PRAYER_ALERT_WINDOW_SECONDS
) {
  if (!prayerDate || !(prayerDate instanceof Date) || isNaN(prayerDate.getTime())) return false;
  if (lastRemindedId === reminderId) return false;

  const diffSecs = Math.floor((now.getTime() - prayerDate.getTime()) / 1000);
  return diffSecs >= 0 && diffSecs <= maxWindowSecs;
}

/**
 * Returns list of upcoming fardh prayers today that should have exact alarms scheduled
 */
export function getUpcomingPrayerAlarms(allPrayers, now = new Date()) {
  if (!Array.isArray(allPrayers)) return [];
  const nowMs = now.getTime();

  return allPrayers
    .filter((p) => p.key !== 'sunrise' && p.date && p.date.getTime() > nowMs)
    .map((p) => ({
      key: p.key,
      name: p.name,
      time: p.time,
      alarmName: `ZEN_PRAYER_EXACT_${p.key}`,
      timestamp: p.date.getTime(),
    }));
}

