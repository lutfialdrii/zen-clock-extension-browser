import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import FlipUnit from './FlipUnit.jsx';
import { getTranslations } from '../utils/i18n.js';
import './PomodoroTimer.css';

export default function PomodoroTimer({
  language = 'id',
  settings,
  pomodoroState,
  onPomodoroAction,
}) {
  const [localTimeLeft, setLocalTimeLeft] = useState(
    pomodoroState?.timeLeft ?? (settings?.workDuration ? settings.workDuration * 60 : 25 * 60)
  );
  const [isRunning, setIsRunning] = useState(!!pomodoroState?.isRunning);
  const [mode, setMode] = useState(pomodoroState?.mode || 'work');

  // Synchronize with external Pomodoro state updates (from storage or service worker)
  useEffect(() => {
    if (!pomodoroState) return;

    setIsRunning(!!pomodoroState.isRunning);
    setMode(pomodoroState.mode || 'work');

    if (pomodoroState.isRunning && pomodoroState.targetEndTime) {
      const remaining = Math.max(0, Math.round((pomodoroState.targetEndTime - Date.now()) / 1000));
      setLocalTimeLeft(remaining);
    } else if (typeof pomodoroState.timeLeft === 'number') {
      setLocalTimeLeft(pomodoroState.timeLeft);
    }
  }, [pomodoroState]);

  // Local ticker when running for smooth 1-second countdown in UI
  useEffect(() => {
    let timer = null;
    if (isRunning && pomodoroState?.targetEndTime) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.round((pomodoroState.targetEndTime - Date.now()) / 1000));
        setLocalTimeLeft(remaining);
        if (remaining <= 0) {
          setIsRunning(false);
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, pomodoroState?.targetEndTime]);

  const togglePlay = () => {
    if (isRunning) {
      if (onPomodoroAction) {
        onPomodoroAction('PAUSE_POMODORO');
      } else if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'PAUSE_POMODORO' });
      }
      setIsRunning(false);
    } else {
      if (onPomodoroAction) {
        onPomodoroAction('START_POMODORO', { timeLeft: localTimeLeft, mode });
      } else if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'START_POMODORO', timeLeft: localTimeLeft, mode });
      }
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    if (onPomodoroAction) {
      onPomodoroAction('RESET_POMODORO', { mode });
    } else if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'RESET_POMODORO', mode });
    }
    setIsRunning(false);
    const duration = (mode === 'work' ? (settings?.workDuration || 25) : (settings?.breakDuration || 5)) * 60;
    setLocalTimeLeft(duration);
  };

  const handleSwitchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setIsRunning(false);
    const duration = (newMode === 'work' ? (settings?.workDuration || 25) : (settings?.breakDuration || 5)) * 60;
    setLocalTimeLeft(duration);

    if (onPomodoroAction) {
      onPomodoroAction('SWITCH_POMODORO_MODE', { mode: newMode });
    } else if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'SWITCH_POMODORO_MODE', mode: newMode });
    }
  };

  const minutes = Math.floor(localTimeLeft / 60);
  const seconds = localTimeLeft % 60;
  const t = getTranslations(language);

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-header">
        <button
          className={`pomodoro-pill-tab ${mode === 'work' ? 'active' : ''}`}
          onClick={() => handleSwitchMode('work')}
        >
          {t.ui.work} ({settings?.workDuration || 25}m)
        </button>
        <button
          className={`pomodoro-pill-tab ${mode === 'break' ? 'active' : ''}`}
          onClick={() => handleSwitchMode('break')}
        >
          {t.ui.break} ({settings?.breakDuration || 5}m)
        </button>
      </div>

      <div className="flip-clock pomodoro-flip-clock">
        <FlipUnit digit={minutes} />
        <FlipUnit digit={seconds} />
      </div>

      <div className="pomodoro-controls">
        <button
          className={`pomodoro-btn-primary ${isRunning ? 'active-running' : ''}`}
          onClick={togglePlay}
          aria-label={isRunning ? t.ui.pause : t.ui.start}
          title={isRunning ? t.ui.pause : t.ui.start}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} className="play-icon" />}
        </button>
        <button
          className="pomodoro-btn-secondary"
          onClick={handleReset}
          aria-label={t.ui.reset}
          title={t.ui.reset}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
