import React, { useState, useEffect } from 'react';
import { Clock, Timer, Settings as SettingsIcon, Maximize2 } from 'lucide-react';
import FlipClock from '../components/FlipClock.jsx';
import PrayerTime from '../components/PrayerTime.jsx';
import PomodoroTimer from '../components/PomodoroTimer.jsx';
import CityPickerModal from '../components/CityPickerModal.jsx';
import AdjustModal from '../components/AdjustModal.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import { getSettings, saveSettings, getPomodoroState, savePomodoroState, isPomodoroActive } from '../utils/storage.js';
import { getTranslations } from '../utils/i18n.js';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('clock'); // 'clock' | 'pomodoro'
  const [settings, setSettings] = useState(null);
  const [pomodoroState, setPomodoroState] = useState(null);

  // Modals state
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial data loading & theme application
  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      if (s?.accentColor) {
        document.documentElement.style.setProperty('--zen-accent', s.accentColor);
        document.documentElement.style.setProperty('--accent-color', s.accentColor);
      }
    });

    getPomodoroState().then((p) => {
      setPomodoroState(p);
      if (isPomodoroActive(p)) {
        setActiveTab('pomodoro');
      }
    });

    // Check prayer times immediately on popup open
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'CHECK_PRAYER_NOW' });
    }

    // Listen to reactive storage changes
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      const handleStorageChange = (changes, area) => {
        if (area === 'local') {
          if (changes.zen_settings) {
            const newSettings = changes.zen_settings.newValue;
            setSettings(newSettings);
            if (newSettings?.accentColor) {
              document.documentElement.style.setProperty('--zen-accent', newSettings.accentColor);
              document.documentElement.style.setProperty('--accent-color', newSettings.accentColor);
            }
          }
          if (changes.zen_pomodoro) {
            setPomodoroState(changes.zen_pomodoro.newValue);
          }
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);

  const handleUpdateSettings = async (partial) => {
    const updated = await saveSettings(partial);
    setSettings(updated);
    if (updated.accentColor) {
      document.documentElement.style.setProperty('--zen-accent', updated.accentColor);
      document.documentElement.style.setProperty('--accent-color', updated.accentColor);
    }
  };

  const handlePomodoroAction = (type, payload = {}) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type, ...payload }, (res) => {
        getPomodoroState().then(setPomodoroState);
      });
    }
  };

  const handleOpenDeskClock = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('clock.html') });
    } else {
      window.open('clock.html', '_blank');
    }
  };

  const language = settings?.language || 'id';
  const t = getTranslations(language);

  return (
    <div className="popup-container">
      {/* Top Header Navbar */}
      <header className="popup-header">
        <div className="brand-badge">
          <Clock size={16} className="brand-icon" />
          <span className="brand-name">Zen Clock</span>
        </div>

        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'clock' ? 'active' : ''}`}
            onClick={() => setActiveTab('clock')}
            title="Clock & Prayer Times"
          >
            <Clock size={14} />
            <span>{t.ui.navClock}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setActiveTab('pomodoro')}
            title="Pomodoro Timer"
          >
            <Timer size={14} />
            <span>{t.ui.navPomodoro}</span>
            {isPomodoroActive(pomodoroState) && <span className="pomodoro-active-dot" />}
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="icon-action-btn"
            onClick={() => setIsSettingsOpen(true)}
            title={t.ui.settings}
            aria-label={t.ui.settings}
          >
            <SettingsIcon size={14} />
          </button>
          <button
            className="icon-action-btn"
            onClick={handleOpenDeskClock}
            title={language === 'en' ? 'Open Desk Clock' : 'Buka Desk Clock'}
            aria-label="Desk Clock"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="popup-content">
        {activeTab === 'clock' && (
          <div className="tab-panel clock-panel">
            <FlipClock language={language} variant="popup" />
            <PrayerTime
              settings={settings}
              onOpenCityPicker={() => setIsCityPickerOpen(true)}
              onOpenAdjustModal={() => setIsAdjustOpen(true)}
              onOpenThemeModal={() => setIsSettingsOpen(true)}
              onToggleNotify={() =>
                handleUpdateSettings({ notifyPrayer: !settings?.notifyPrayer })
              }
            />
          </div>
        )}

        {activeTab === 'pomodoro' && (
          <div className="tab-panel pomodoro-panel">
            <PomodoroTimer
              language={language}
              settings={settings}
              pomodoroState={pomodoroState}
              onPomodoroAction={handlePomodoroAction}
            />
          </div>
        )}
      </main>

      {/* Interactive Modals */}
      <CityPickerModal
        isOpen={isCityPickerOpen}
        onClose={() => setIsCityPickerOpen(false)}
        currentCity={settings?.city}
        onSelectCity={(city) => handleUpdateSettings({ city })}
        language={language}
      />

      <AdjustModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        adjustments={settings?.adjustments}
        onSaveAdjustments={(adjustments) => handleUpdateSettings({ adjustments })}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleUpdateSettings}
      />
    </div>
  );
}
