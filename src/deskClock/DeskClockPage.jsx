import React, { useState, useEffect } from 'react';
import { Clock, Timer, Maximize, Minimize, Settings as SettingsIcon } from 'lucide-react';
import FlipClock from '../components/FlipClock.jsx';
import PrayerTime from '../components/PrayerTime.jsx';
import PomodoroTimer from '../components/PomodoroTimer.jsx';
import CityPickerModal from '../components/CityPickerModal.jsx';
import AdjustModal from '../components/AdjustModal.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import { getSettings, saveSettings, getPomodoroState, isPomodoroActive } from '../utils/storage.js';
import { getTranslations } from '../utils/i18n.js';
import './DeskClockPage.css';

export default function DeskClockPage() {
  const [activeView, setActiveView] = useState('clock'); // 'clock' | 'pomodoro'
  const [settings, setSettings] = useState(null);
  const [pomodoroState, setPomodoroState] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals state
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      if (s?.accentColor) {
        document.documentElement.style.setProperty('--zen-accent', s.accentColor);
      }
    });

    getPomodoroState().then((p) => {
      setPomodoroState(p);
      if (isPomodoroActive(p)) {
        setActiveView('pomodoro');
      }
    });

    // Listen to reactive storage changes
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      const handleStorageChange = (changes, area) => {
        if (area === 'local') {
          if (changes.zen_settings) {
            const newSettings = changes.zen_settings.newValue;
            setSettings(newSettings);
            if (newSettings?.accentColor) {
              document.documentElement.style.setProperty('--zen-accent', newSettings.accentColor);
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

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Failed to exit fullscreen:', err);
      });
    }
  };

  const handleUpdateSettings = async (partial) => {
    const updated = await saveSettings(partial);
    setSettings(updated);
    if (updated.accentColor) {
      document.documentElement.style.setProperty('--zen-accent', updated.accentColor);
    }
  };

  const handlePomodoroAction = (type, payload = {}) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type, ...payload }, () => {
        getPomodoroState().then(setPomodoroState);
      });
    }
  };

  const language = settings?.language || 'id';
  const t = getTranslations(language);

  return (
    <div className="deskclock-container">
      {/* Top Header Controls Bar */}
      <header className="deskclock-top-bar">
        <div className="deskclock-left">
          <div className="deskclock-brand">
            <Clock size={16} className="brand-icon" />
            <span className="brand-name">Zen Clock</span>
          </div>
        </div>

        <nav className="deskclock-tab-nav">
          <button
            className={`deskclock-tab-btn ${activeView === 'clock' ? 'active' : ''}`}
            onClick={() => setActiveView('clock')}
            title="Clock & Prayer Times"
          >
            <Clock size={15} />
            <span>{t.ui.navClock}</span>
          </button>
          <button
            className={`deskclock-tab-btn ${activeView === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setActiveView('pomodoro')}
            title="Pomodoro Timer"
          >
            <Timer size={15} />
            <span>{t.ui.navPomodoro}</span>
            {isPomodoroActive(pomodoroState) && <span className="pomodoro-active-dot" />}
          </button>
        </nav>

        <div className="deskclock-actions">
          <button
            className="deskclock-icon-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
          <button
            className="deskclock-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* Main Display: Ambient Clock or Pomodoro */}
      <main className="deskclock-main">
        {activeView === 'clock' ? (
          <>
            <FlipClock language={language} variant="full" />
            <PrayerTime
              settings={settings}
              onOpenCityPicker={() => setIsCityPickerOpen(true)}
              onOpenAdjustModal={() => setIsAdjustOpen(true)}
              onOpenThemeModal={() => setIsSettingsOpen(true)}
              onToggleNotify={() =>
                handleUpdateSettings({ notifyPrayer: !settings?.notifyPrayer })
              }
            />
          </>
        ) : (
          <div className="deskclock-pomodoro-wrapper">
            <PomodoroTimer
              language={language}
              settings={settings}
              pomodoroState={pomodoroState}
              onPomodoroAction={handlePomodoroAction}
              variant="full"
            />
          </div>
        )}
      </main>

      {/* Modals */}
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
        onOpenCityPicker={() => {
          setIsSettingsOpen(false);
          setIsCityPickerOpen(true);
        }}
        onOpenAdjustModal={() => {
          setIsSettingsOpen(false);
          setIsAdjustOpen(true);
        }}
      />
    </div>
  );
}
