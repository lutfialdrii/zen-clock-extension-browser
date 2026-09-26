import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORT_LINKS } from '../src/utils/supportLinks.js';
import { getTranslations } from '../src/utils/i18n.js';

test('SUPPORT_LINKS - Defines valid creator support URLs', () => {
  assert.ok(SUPPORT_LINKS, 'SUPPORT_LINKS must be defined');
  assert.equal(
    SUPPORT_LINKS.saweria.url,
    'https://saweria.co/lutfialdrii',
    'Saweria URL must match creator profile'
  );
  assert.equal(
    SUPPORT_LINKS.github.url,
    'https://github.com/lutfialdrii/zen-clock-extension-browser',
    'GitHub repository URL must match repository'
  );
  assert.ok(typeof SUPPORT_LINKS.saweria.labelId === 'string');
  assert.ok(typeof SUPPORT_LINKS.github.labelId === 'string');
});

test('i18n - Contains translations for creator support section in ID and EN', () => {
  const id = getTranslations('id');
  assert.ok(id.ui.supportCreator, 'Must have supportCreator in id');
  assert.ok(id.ui.supportCreatorDesc, 'Must have supportCreatorDesc in id');
  assert.ok(id.ui.supportSaweria, 'Must have supportSaweria in id');
  assert.ok(id.ui.supportGitHub, 'Must have supportGitHub in id');

  const en = getTranslations('en');
  assert.ok(en.ui.supportCreator, 'Must have supportCreator in en');
  assert.ok(en.ui.supportCreatorDesc, 'Must have supportCreatorDesc in en');
  assert.ok(en.ui.supportSaweria, 'Must have supportSaweria in en');
  assert.ok(en.ui.supportGitHub, 'Must have supportGitHub in en');
});
