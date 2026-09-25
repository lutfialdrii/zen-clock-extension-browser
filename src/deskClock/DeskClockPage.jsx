import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, Settings as SettingsIcon } from 'lucide-react';
import FlipClock from '../components/FlipClock.jsx';
import PrayerTime from '../components/PrayerTime.jsx';
import CityPickerModal from '../components/CityPickerModal.jsx';
import AdjustModal from '../components/AdjustModal.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import { getSettings, saveSettings } from '../utils/storage.js';
import './DeskClockPage.css';

export default function DeskClockPage() {
  const [settings, setSettings] = useState(null);
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

  const language = settings?.language || 'id';

  return (
    <div className="deskclock-container">
      {/* Top right quick controls */}
      <header className="deskclock-top-bar">
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
      </header>

      {/* Center 3D Flip Clock */}
      <main className="deskclock-main">
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
      />
    </div>
  );
}
