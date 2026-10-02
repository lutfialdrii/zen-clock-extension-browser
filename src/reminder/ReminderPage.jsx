import React, { useState, useEffect } from 'react';
import { Check, Clock, Compass } from 'lucide-react';
import { getSettings } from '../utils/storage.js';
import { getTranslations } from '../utils/i18n.js';
import { getPrayerName, calculatePrayerTimes } from '../utils/prayerHelper.js';
import './ReminderPage.css';

export default function ReminderPage() {
  const [settings, setSettings] = useState(null);
  const [now, setNow] = useState(new Date());

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);
  const prayerParam = searchParams.get('prayer') || hashParams.get('prayer') || 'dhuhr';
  const cityParam = searchParams.get('city') || hashParams.get('city');
  const timeParam = searchParams.get('time') || hashParams.get('time');

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      if (s?.accentColor) {
        document.documentElement.style.setProperty('--zen-accent', s.accentColor);
      }
    });

    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const language = settings?.language || 'id';
  const t = getTranslations(language);
  const cityName = cityParam || settings?.city?.name || 'Jakarta';
  const prayerDisplayName = getPrayerName(prayerParam, language, now);

  // Determine scheduled prayer time (from URL parameter or dynamic calculation from user settings)
  let prayerTimeDisplay = timeParam;
  if (!prayerTimeDisplay && settings?.city) {
    const prayerCalc = calculatePrayerTimes(
      settings.city,
      now,
      settings?.adjustments,
      language
    );
    const matched = prayerCalc?.allPrayers?.find(
      (p) => p.key === prayerParam.toLowerCase()
    );
    if (matched) {
      prayerTimeDisplay = matched.time;
    }
  }
  if (!prayerTimeDisplay) {
    prayerTimeDisplay = '--:--';
  }

  const handleClose = () => {
    window.close();
  };

  const handleOpenDeskClock = () => {
    window.location.href = 'clock.html';
  };

  return (
    <div className="reminder-container">
      <div className="reminder-card">
        <div className="reminder-icon-ring">
          <Compass size={40} className="reminder-compass" />
        </div>

        <div className="reminder-badge">
          <span>{cityName}</span>
          <span className="bullet">•</span>
          <span>{prayerTimeDisplay}</span>
        </div>

        <h1 className="reminder-title">
          {t.reminder.title.replace('{name}', prayerDisplayName)}
        </h1>

        <div className="quran-quote-card">
          <div className="arabic-verse" dir="rtl" lang="ar">
            إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا
          </div>
          <p className="quran-translation">{t.reminder.quranQuote}</p>
          <div className="quran-reference">{t.reminder.quranSurah}</div>
        </div>

        <div className="reminder-actions">
          <button className="reminder-btn-primary" onClick={handleClose}>
            <Check size={18} />
            <span>{t.reminder.readyToPray.replace(/^[✓✔]\s*/, '')}</span>
          </button>
          <button className="reminder-btn-secondary" onClick={handleOpenDeskClock}>
            <Clock size={16} />
            <span>{t.reminder.openDeskClock.replace(/^[⏱️]\s*/, '')}</span>
          </button>
        </div>

        <p className="reminder-disclaimer">{t.reminder.disclaimer}</p>
      </div>
    </div>
  );
}
