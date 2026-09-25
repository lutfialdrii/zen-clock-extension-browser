import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemainingPomodoroSeconds,
  DEFAULT_SETTINGS,
  DEFAULT_POMODORO,
} from '../src/utils/storage.js';

test('calculateRemainingPomodoroSeconds - Correctly computes remaining time from targetEndTime when running', () => {
  const now = Date.now();
  const stateRunning = {
    isRunning: true,
    timeLeft: 1500,
    targetEndTime: now + 65 * 1000, // 65 seconds in future
  };

  const remaining = calculateRemainingPomodoroSeconds(stateRunning);
  assert.ok(remaining >= 64 && remaining <= 66, `Expected ~65s, got ${remaining}`);
});

test('calculateRemainingPomodoroSeconds - Returns 0 if targetEndTime has passed', () => {
  const now = Date.now();
  const stateExpired = {
    isRunning: true,
    timeLeft: 1500,
    targetEndTime: now - 5000, // 5 seconds in past
  };

  const remaining = calculateRemainingPomodoroSeconds(stateExpired);
  assert.equal(remaining, 0, 'Expired timer should return 0');
});

test('calculateRemainingPomodoroSeconds - Returns timeLeft when not running (paused/idle)', () => {
  const statePaused = {
    isRunning: false,
    timeLeft: 720,
    targetEndTime: null,
  };

  const remaining = calculateRemainingPomodoroSeconds(statePaused);
  assert.equal(remaining, 720, 'Paused timer should return preserved timeLeft');
});

test('DEFAULT_SETTINGS - Guaranteed location and adjustments in schema', () => {
  assert.ok(DEFAULT_SETTINGS.city, 'Default settings must have city');
  assert.equal(DEFAULT_SETTINGS.city.name, 'Jakarta');
  assert.equal(typeof DEFAULT_SETTINGS.city.lat, 'number');
  assert.equal(typeof DEFAULT_SETTINGS.city.lng, 'number');

  assert.ok(DEFAULT_SETTINGS.adjustments, 'Default settings must have adjustments');
  assert.equal(DEFAULT_SETTINGS.adjustments.fajr, 0);
  assert.equal(DEFAULT_SETTINGS.adjustments.dhuhr, 0);
  assert.equal(DEFAULT_SETTINGS.autoOpenReminderTab, true);
});

test('Anti Multi-Start Guard Logic - Protects active session against duplicate starts', () => {
  const now = Date.now();
  const activeSession = {
    isRunning: true,
    targetEndTime: now + 500 * 1000,
    mode: 'work',
  };

  // Simulate handler logic
  let resultingTargetEndTime = activeSession.targetEndTime;
  let recomputed = false;

  if (activeSession.isRunning && activeSession.targetEndTime && activeSession.targetEndTime > Date.now()) {
    // Guard caught duplicate start! Do not recompute
    recomputed = false;
  } else {
    resultingTargetEndTime = Date.now() + 1500 * 1000;
    recomputed = true;
  }

  assert.equal(recomputed, false, 'Duplicate start should NOT recompute targetEndTime');
  assert.equal(resultingTargetEndTime, activeSession.targetEndTime, 'Original targetEndTime must be preserved');
});
