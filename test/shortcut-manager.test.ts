/**
 * Automated Test Suite for ShortcutManager Utility
 * Validates export, import, localStorage persistence, and event matching.
 */

import { ShortcutManager } from '../src/utils/shortcutManager';
import { StorageManager } from '../src/utils/storage';

// In-memory mock for localStorage in Node test environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  length: 0,
  key: () => null,
} as unknown as Storage;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  console.log('--- Testing ShortcutManager ---');

  // Test 1: Defaults loading
  const defaults = ShortcutManager.loadKeyBindings();
  assert(Array.isArray(defaults['deleteGate']), 'deleteGate binding should exist');
  assert(defaults['deleteGate'].includes('Backspace'), 'deleteGate should include Backspace');
  console.log('✅ PASS: Default keybindings loaded correctly');

  // Test 2: Set customized binding & persistence
  ShortcutManager.setBinding('deleteGate', ['D', 'Backspace']);
  const updated = ShortcutManager.getBinding('deleteGate');
  assert(updated.includes('D'), 'deleteGate should now include D');

  // Verify persistence in localStorage
  const rawKeybindings = localStorage.getItem('ai_quantum_tutor_keybindings_v1');
  assert(rawKeybindings !== null, 'localStorage should store keybindings');
  const parsedStorage = JSON.parse(rawKeybindings!);
  assert(parsedStorage.deleteGate.includes('D'), 'localStorage should have updated binding');
  console.log('✅ PASS: Keybinding persistence in localStorage verified');

  // Test 3: Export to JSON
  const exportedJSON = ShortcutManager.exportKeyBindingsJSON();
  assert(typeof exportedJSON === 'string', 'Exported JSON must be a string');
  const parsedExport = JSON.parse(exportedJSON);
  assert(parsedExport.appName === 'AI Quantum Tutor', 'Exported JSON has appName');
  assert(parsedExport.bindings.deleteGate.includes('D'), 'Exported JSON reflects current bindings');
  console.log('✅ PASS: Keybindings export to JSON verified');

  // Test 4: Import from JSON
  const customConfig = JSON.stringify({
    schemaVersion: 1,
    appName: 'AI Quantum Tutor',
    bindings: {
      clearCanvas: ['Ctrl+Shift+K'],
      selectH: ['Alt+H'],
    },
  });

  const importResult = ShortcutManager.importKeyBindingsJSON(customConfig);
  assert(importResult.success === true, 'Import should succeed');
  assert(importResult.count === 2, 'Import count should match updated keys');
  assert(ShortcutManager.getBinding('clearCanvas').includes('Ctrl+Shift+K'), 'clearCanvas updated');
  assert(ShortcutManager.getBinding('selectH').includes('Alt+H'), 'selectH updated');
  console.log('✅ PASS: Keybindings import from JSON verified');

  // Test 5: Error handling on malformed JSON
  const malformedResult = ShortcutManager.importKeyBindingsJSON('{ malformed JSON ');
  assert(malformedResult.success === false, 'Importing malformed JSON should return failure');
  console.log('✅ PASS: Malformed JSON handled gracefully');

  // Test 6: StorageManager sync with UserProgress
  const progress = StorageManager.loadProgress();
  assert(progress.keyBindings !== undefined, 'UserProgress should contain keyBindings');
  assert(progress.keyBindings!['clearCanvas'].includes('Ctrl+Shift+K'), 'UserProgress synchronized');
  console.log('✅ PASS: UserProgress & StorageManager persistence synchronized');

  // Test 7: Reset to defaults
  ShortcutManager.resetToDefaults();
  assert(!ShortcutManager.getBinding('deleteGate').includes('D'), 'deleteGate restored to default');
  console.log('✅ PASS: Reset to defaults verified');

  console.log('All ShortcutManager tests passed successfully!\n');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
