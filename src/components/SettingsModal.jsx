import React, { useState } from 'react';
import { Settings, X, Check, Palette, Globe, Bell, Clock, Compass, MapPin, Sliders, ChevronRight, Heart, Coffee, Star, ExternalLink } from 'lucide-react';
import { getTranslations } from '../utils/i18n.js';
import { SUPPORT_LINKS } from '../utils/supportLinks.js';
import './Modals.css';

function formatTzBadge(timezone) {
  if (!timezone) return null;
  if (timezone === 'Asia/Jakarta') return 'WIB';
  if (timezone === 'Asia/Makassar') return 'WITA';
  if (timezone === 'Asia/Jayapura') return 'WIT';
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}

const PRESET_THEMES = [
  { name: 'Warm Amber', hex: '#fbbf24' },
  { name: 'Cyberpunk Cyan', hex: '#06b6d4' },
  { name: 'Emerald Forest', hex: '#10b981' },
  { name: 'Rose Velvet', hex: '#f43f5e' },
  { name: 'Violet Eclipse', hex: '#8b5cf6' },
  { name: 'Coral Sunset', hex: '#f97316' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenCityPicker,
  onOpenAdjustModal,
}) {
  const language = settings?.language || 'id';
  const t = getTranslations(language);

  const [localSettings, setLocalSettings] = useState({
    accentColor: settings?.accentColor || '#fbbf24',
    language: settings?.language || 'id',
    autoOpenReminderTab: settings?.autoOpenReminderTab !== false,
    notifyPrayer: settings?.notifyPrayer !== false,
    notifyPomodoro: settings?.notifyPomodoro !== false,
    workDuration: settings?.workDuration || 25,
    breakDuration: settings?.breakDuration || 5,
  });

  const [customHex, setCustomHex] = useState('');
  const [testStatus, setTestStatus] = useState('');

  if (!isOpen) return null;

  const handleTestPrayerAlert = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'TEST_PRAYER_ALERT', prayerKey: 'dhuhr' }, () => {
        setTestStatus(language === 'en' ? 'Alert Sent!' : 'Pengingat Terkirim!');
        setTimeout(() => setTestStatus(''), 3000);
      });
    }
  };

  const handleApplyCustomHex = () => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(customHex)) {
      setLocalSettings((prev) => ({ ...prev, accentColor: customHex }));
      setCustomHex('');
    }
  };

  const handleOpenCityPicker = () => {
    onSaveSettings(localSettings);
    if (onOpenCityPicker) {
      onOpenCityPicker();
    }
  };

  const handleOpenAdjustModal = () => {
    onSaveSettings(localSettings);
    if (onOpenAdjustModal) {
      onOpenAdjustModal();
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const city = settings?.city || { name: 'Jakarta', region: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' };
  const tzBadge = formatTzBadge(city.timezone);
  const hasCustomAdjustments = settings?.adjustments && Object.values(settings.adjustments).some((v) => Number(v) !== 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Settings size={16} className="modal-title-icon" />
            <h3 className="modal-title">{t.ui.settings}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="settings-scroll-area">
          {/* Section: Location & Prayer Times */}
          <div className="settings-section">
            <div className="section-label">
              <MapPin size={13} />
              <span>{t.ui.locationAndPrayer}</span>
            </div>

            {/* City Selection Row */}
            <div
              className="settings-action-row"
              onClick={handleOpenCityPicker}
              role="button"
              tabIndex={0}
              title={language === 'en' ? 'Click to select or search city' : 'Klik untuk memilih atau mencari kota'}
            >
              <div className="action-row-left">
                <div className="action-row-icon">
                  <MapPin size={14} />
                </div>
                <div className="action-row-info">
                  <div className="action-row-title-wrap">
                    <span className="action-row-title">{city.name}</span>
                    {tzBadge && <span className="action-row-badge">{tzBadge}</span>}
                  </div>
                  <span className="action-row-desc">
                    {city.region || (language === 'en' ? 'Select city / location' : 'Pilih kota / lokasi')}
                  </span>
                </div>
              </div>
              <div className="action-row-right">
                <span className="action-row-btn-text">{t.ui.change}</span>
                <ChevronRight size={14} className="action-row-chevron" />
              </div>
            </div>

            {/* Adjust Prayer Times Row */}
            <div
              className="settings-action-row"
              onClick={handleOpenAdjustModal}
              role="button"
              tabIndex={0}
              title={language === 'en' ? 'Adjust minute offsets for prayer times' : 'Sesuaikan koreksi menit jadwal sholat'}
            >
              <div className="action-row-left">
                <div className="action-row-icon">
                  <Sliders size={14} />
                </div>
                <div className="action-row-info">
                  <div className="action-row-title-wrap">
                    <span className="action-row-title">{t.ui.adjustPrayerTimes}</span>
                    {hasCustomAdjustments && (
                      <span className="action-row-badge active">
                        {language === 'en' ? 'Adjusted' : 'Disesuaikan'}
                      </span>
                    )}
                  </div>
                  <span className="action-row-desc">{t.ui.adjustPrayerTimesDesc}</span>
                </div>
              </div>
              <div className="action-row-right">
                <span className="action-row-btn-text">{t.ui.adjust}</span>
                <ChevronRight size={14} className="action-row-chevron" />
              </div>
            </div>
          </div>

          {/* Section: Language */}
          <div className="settings-section">
            <div className="section-label">
              <Globe size={13} />
              <span>{language === 'en' ? 'Language' : 'Bahasa'}</span>
            </div>
            <div className="segmented-control">
              <button
                className={`segmented-btn ${localSettings.language === 'id' ? 'active' : ''}`}
                onClick={() => setLocalSettings((prev) => ({ ...prev, language: 'id' }))}
              >
                Bahasa Indonesia
              </button>
              <button
                className={`segmented-btn ${localSettings.language === 'en' ? 'active' : ''}`}
                onClick={() => setLocalSettings((prev) => ({ ...prev, language: 'en' }))}
              >
                English
              </button>
            </div>
          </div>

          {/* Section: Theme Color */}
          <div className="settings-section">
            <div className="section-label">
              <Palette size={13} />
              <span>{t.ui.themeColor}</span>
            </div>
            <div className="theme-color-palette">
              {PRESET_THEMES.map((theme) => {
                const isSelected = localSettings.accentColor.toLowerCase() === theme.hex.toLowerCase();
                return (
                  <button
                    key={theme.hex}
                    className={`theme-color-circle ${isSelected ? 'selected' : ''}`}
                    style={{ backgroundColor: theme.hex }}
                    onClick={() => setLocalSettings((prev) => ({ ...prev, accentColor: theme.hex }))}
                    title={theme.name}
                    aria-label={theme.name}
                  >
                    {isSelected && <Check size={14} className="color-check-icon" />}
                  </button>
                );
              })}
            </div>
            <div className="custom-hex-row">
              <input
                type="text"
                className="custom-hex-input"
                placeholder={t.ui.customHexPlaceholder || 'Hex kustom (#fbbf24)'}
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                maxLength={7}
              />
              <button
                className="custom-hex-btn"
                onClick={handleApplyCustomHex}
                disabled={!/^#([0-9A-F]{3}){1,2}$/i.test(customHex)}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Section: Prayer Reminders (Parameterized) */}
          <div className="settings-section">
            <div className="section-label">
              <Compass size={13} />
              <span>{language === 'en' ? 'Prayer Reminders' : 'Pengingat Waktu Sholat'}</span>
            </div>
            
            <div className="setting-toggle-row">
              <div className="toggle-info">
                <span className="toggle-title">
                  {language === 'en' ? 'Auto-Open Reminder Tab' : 'Buka Otomatis Tab Pengingat'}
                </span>
                <span className="toggle-desc">
                  {language === 'en'
                    ? 'Automatically opens a serene reminder tab upon prayer arrival.'
                    : 'Membuka tab hening baru secara otomatis saat waktu adzan tiba.'}
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localSettings.autoOpenReminderTab}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, autoOpenReminderTab: e.target.checked }))
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-toggle-row">
              <div className="toggle-info">
                <span className="toggle-title">
                  {language === 'en' ? 'Desktop Notification' : 'Notifikasi Desktop'}
                </span>
                <span className="toggle-desc">
                  {language === 'en'
                    ? 'Show system notification popup with prayer details.'
                    : 'Tampilkan notifikasi desktop saat masuk waktu sholat.'}
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localSettings.notifyPrayer}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, notifyPrayer: e.target.checked }))
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="test-alert-row">
              <button
                type="button"
                className="test-alert-btn"
                onClick={handleTestPrayerAlert}
              >
                <Bell size={13} />
                <span>{testStatus || (language === 'en' ? 'Test Prayer Alert & Tab' : 'Uji Notifikasi & Tab Pengingat')}</span>
              </button>
              <span className="test-alert-hint">
                {language === 'en'
                  ? 'Triggers a simulated alert to test tab opening & system notifications.'
                  : 'Memicu pengingat uji coba untuk memastikan pembukaan tab dan notifikasi OS berfungsi.'}
              </span>
            </div>
          </div>

          {/* Section: Pomodoro Settings */}
          <div className="settings-section">
            <div className="section-label">
              <Clock size={13} />
              <span>{language === 'en' ? 'Pomodoro Settings' : 'Pengaturan Pomodoro'}</span>
            </div>

            <div className="setting-toggle-row">
              <div className="toggle-info">
                <span className="toggle-title">
                  {language === 'en' ? 'Pomodoro Notifications' : 'Notifikasi Pomodoro'}
                </span>
                <span className="toggle-desc">
                  {language === 'en'
                    ? 'Alert when work or break session finishes.'
                    : 'Beri notifikasi saat sesi kerja atau istirahat selesai.'}
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localSettings.notifyPomodoro}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, notifyPomodoro: e.target.checked }))
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="duration-inputs-row">
              <div className="duration-input-box">
                <label className="duration-label">{t.ui.work} (mins)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  className="duration-num-input"
                  value={localSettings.workDuration}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      workDuration: Math.max(5, Math.min(60, Number(e.target.value) || 25)),
                    }))
                  }
                />
              </div>

              <div className="duration-input-box">
                <label className="duration-label">{t.ui.break} (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="duration-num-input"
                  value={localSettings.breakDuration}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      breakDuration: Math.max(1, Math.min(30, Number(e.target.value) || 5)),
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Section: Support the Creator */}
          <div className="settings-section support-section">
            <div className="section-label">
              <Heart size={13} className="support-header-icon" />
              <span>{t.ui.supportCreator}</span>
            </div>
            <p className="support-desc">{t.ui.supportCreatorDesc}</p>

            <div className="support-cards-grid">
              <a
                href={SUPPORT_LINKS.saweria.url}
                target="_blank"
                rel="noopener noreferrer"
                className="support-card saweria-card"
                title={t.ui.supportSaweria}
              >
                <div className="support-card-left">
                  <div className="support-icon-wrap saweria-icon-wrap">
                    <Coffee size={15} />
                  </div>
                  <div className="support-card-text">
                    <span className="support-card-title">{t.ui.supportSaweria}</span>
                    <span className="support-card-desc">{t.ui.supportSaweriaDesc}</span>
                  </div>
                </div>
                <ExternalLink size={13} className="support-external-icon" />
              </a>

              <a
                href={SUPPORT_LINKS.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="support-card github-card"
                title={t.ui.supportGitHub}
              >
                <div className="support-card-left">
                  <div className="support-icon-wrap github-icon-wrap">
                    <Star size={15} />
                  </div>
                  <div className="support-card-text">
                    <span className="support-card-title">{t.ui.supportGitHub}</span>
                    <span className="support-card-desc">{t.ui.supportGitHubDesc}</span>
                  </div>
                </div>
                <ExternalLink size={13} className="support-external-icon" />
              </a>
            </div>
          </div>
        </div>

        <div className="modal-footer-actions">
          <button className="modal-btn-secondary" onClick={onClose}>
            {language === 'en' ? 'Cancel' : 'Batal'}
          </button>
          <button className="modal-btn-primary" onClick={handleSave}>
            {language === 'en' ? 'Save Settings' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
}
