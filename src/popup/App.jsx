import React, { useState } from 'react';
import { Clock, Timer, Settings, Maximize2 } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('clock'); // 'clock' | 'pomodoro' | 'settings'

  const handleOpenDeskClock = () => {
    chrome.tabs.create({ url: 'clock.html' });
  };

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
            <Clock size={15} />
            <span>Clock</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setActiveTab('pomodoro')}
            title="Pomodoro Timer"
          >
            <Timer size={15} />
            <span>Pomodoro</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Settings size={15} />
          </button>
        </nav>

        <button 
          className="icon-action-btn"
          onClick={handleOpenDeskClock}
          title="Open Fullscreen Desk Clock"
        >
          <Maximize2 size={14} />
        </button>
      </header>

      {/* Main Content Body */}
      <main className="popup-content">
        {activeTab === 'clock' && (
          <div className="placeholder-panel">
            <h3>3D Flip Clock & Prayer Times</h3>
            <p>Ready to be connected to components in implementation phase.</p>
          </div>
        )}

        {activeTab === 'pomodoro' && (
          <div className="placeholder-panel">
            <h3>Pomodoro Timer</h3>
            <p>Background-synchronized timer engine ready to connect.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="placeholder-panel">
            <h3>Settings</h3>
            <p>City, theme accent color, prayer adjustments, and reminder options.</p>
          </div>
        )}
      </main>
    </div>
  );
}
