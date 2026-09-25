import React, { useState, useEffect } from 'react';
import { MapPin, Bell, BellOff, Map, Edit3, SlidersHorizontal, Palette, ExternalLink } from 'lucide-react';
import { calculatePrayerTimes, formatCountdownHoursMinutes } from '../utils/prayerHelper.js';
import { getTranslations } from '../utils/i18n.js';
import './PrayerTime.css';

export default function PrayerTime({
  settings,
  onOpenCityPicker,
  onOpenAdjustModal,
  onOpenThemeModal,
  onToggleNotify,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const language = settings?.language || 'id';
  const city = settings?.city || { name: 'Jakarta', region: 'DKI Jakarta', lat: -6.2088, lng: 106.8456 };
  const adjustments = settings?.adjustments || {};
  const notifyEnabled = settings?.notifyPrayer !== false;

  const t = getTranslations(language);

  // Update clock every 10 seconds for countdown calculations
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const prayerCalc = calculatePrayerTimes(city, currentTime, adjustments, language);
  if (!prayerCalc) return null;

  const { nextPrayerName, nextKey, nextPrayerTime, allPrayers, remainingSeconds } = prayerCalc;
  const timeString = formatCountdownHoursMinutes(remainingSeconds, language);

  const handleOpenDeskClock = (e) => {
    e.stopPropagation();
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('clock.html') });
    } else {
      window.open('clock.html', '_blank');
    }
  };

  return (
    <div
      className="prayer-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className="prayer-display"
        onClick={() => setIsOpen(!isOpen)}
        title={
          language === 'en'
            ? `Next prayer ${nextPrayerName} in ${timeString}`
            : `Waktu ${nextPrayerName} berikutnya tiba dalam ${timeString}`
        }
      >
        <MapPin size={15} className="prayer-icon-pin" />
        <span className="prayer-summary-text">
          {nextPrayerName} {t.countdown.in} {timeString}
        </span>
        <button
          className="notify-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleNotify) onToggleNotify();
          }}
          title={notifyEnabled ? t.ui.notifActive : t.ui.notifInactive}
          aria-label={notifyEnabled ? t.ui.notifActive : t.ui.notifInactive}
        >
          {notifyEnabled ? <Bell size={13} /> : <BellOff size={13} className="muted" />}
        </button>
      </div>

      <div className={`prayer-details ${isOpen ? 'open' : ''}`}>
        <div className="prayer-actions-bar">
          <div
            className="prayer-location clickable"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenCityPicker) onOpenCityPicker();
            }}
            title={t.ui.clickToChangeCity}
          >
            <div className="prayer-location-left">
              <Map size={13} />
              <span className="prayer-location-name">{city.name}</span>
            </div>
            <Edit3 size={12} className="prayer-location-edit-icon" />
          </div>

          <div className="prayer-actions-row">
            <button
              className="prayer-sub-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenAdjustModal) onOpenAdjustModal();
              }}
              title={t.ui.adjustTime}
            >
              <SlidersHorizontal size={12} />
              <span>{t.ui.adjustTime}</span>
            </button>
            <button
              className="prayer-sub-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenThemeModal) onOpenThemeModal();
              }}
              title={t.ui.themeColor}
            >
              <Palette size={12} />
              <span>{t.ui.themeColor}</span>
            </button>
          </div>
        </div>

        <div className="prayer-schedule-list">
          {allPrayers.map((prayer) => {
            const isNext = prayer.key === nextKey;
            return (
              <div
                key={prayer.key}
                className={`prayer-row ${isNext ? 'active-next' : ''}`}
              >
                <span className="prayer-row-name">{prayer.name}</span>
                <span className="prayer-row-time">{prayer.time}</span>
              </div>
            );
          })}
        </div>

        <div className="prayer-footer-bar">
          <button
            className="prayer-desk-btn"
            onClick={handleOpenDeskClock}
            title={language === 'en' ? 'Open Full Desk Clock' : 'Buka Desk Clock Layar Penuh'}
          >
            <ExternalLink size={12} />
            <span>Desk Clock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
