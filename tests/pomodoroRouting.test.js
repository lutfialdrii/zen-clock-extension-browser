import test from 'node:test';
import assert from 'node:assert/strict';
import { isPomodoroActive } from '../src/utils/storage.js';

test('isPomodoroActive - Returns true when running with future targetEndTime', () => {
  const activeState = {
    isRunning: true,
    timeLeft: 1200,
    targetEndTime: Date.now() + 500 * 1000,
  };
  assert.equal(isPomodoroActive(activeState), true);
});

test('isPomodoroActive - Returns false when isRunning is false', () => {
  const pausedState = {
    isRunning: false,
    timeLeft: 1200,
    targetEndTime: null,
  };
  assert.equal(isPomodoroActive(pausedState), false);
});

test('isPomodoroActive - Returns false when null or undefined', () => {
  assert.equal(isPomodoroActive(null), false);
  assert.equal(isPomodoroActive(undefined), false);
});

test('isPomodoroActive - Returns false when targetEndTime is in the past', () => {
  const expiredState = {
    isRunning: true,
    timeLeft: 0,
    targetEndTime: Date.now() - 1000,
  };
  assert.equal(isPomodoroActive(expiredState), false);
});

test('Auto-route logic - Determines default tab correctly', () => {
  const activeSession = {
    isRunning: true,
    targetEndTime: Date.now() + 600 * 1000,
  };
  const idleSession = {
    isRunning: false,
    targetEndTime: null,
  };

  const computeInitialTab = (pomodoro) => {
    return isPomodoroActive(pomodoro) ? 'pomodoro' : 'clock';
  };

  assert.equal(computeInitialTab(activeSession), 'pomodoro');
  assert.equal(computeInitialTab(idleSession), 'clock');
});
