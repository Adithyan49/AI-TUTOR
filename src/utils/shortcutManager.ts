/**
 * ShortcutManager Utility
 * Manages keyboard shortcut preferences for the Quantum Circuit Builder.
 * Allows importing and exporting key binding configurations via JSON,
 * and ensures preferences are persisted in localStorage alongside user progress data.
 */

export type ShortcutCategory = 'Circuit Editing' | 'Gate Palette Hotkeys' | 'Navigation & Tools';

export interface ShortcutDefinition {
  id: string;
  name: string;
  description: string;
  category: ShortcutCategory;
  defaultKeys: string[];
  keys: string[];
}

export interface ShortcutPreferencesExport {
  schemaVersion: number;
  appName: string;
  exportDate: string;
  description: string;
  bindings: Record<string, string[]>;
}

const LOCAL_STORAGE_KEYBINDINGS = 'ai_quantum_tutor_keybindings_v1';
const LOCAL_STORAGE_USER_PROGRESS = 'ai_quantum_tutor_user_progress_v1';

export const DEFAULT_SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  // Circuit Editing
  {
    id: 'deleteGate',
    name: 'Delete Gate',
    description: 'Delete selected gate or last placed gate',
    category: 'Circuit Editing',
    defaultKeys: ['Backspace', 'Delete'],
    keys: ['Backspace', 'Delete'],
  },
  {
    id: 'clearCanvas',
    name: 'Clear Canvas',
    description: 'Clear all gates from canvas',
    category: 'Circuit Editing',
    defaultKeys: ['Alt+C', 'Shift+Delete'],
    keys: ['Alt+C', 'Shift+Delete'],
  },
  {
    id: 'undo',
    name: 'Undo Edit',
    description: 'Undo last gate placement or modification',
    category: 'Circuit Editing',
    defaultKeys: ['Ctrl+Z'],
    keys: ['Ctrl+Z'],
  },
  {
    id: 'redo',
    name: 'Redo Edit',
    description: 'Redo previously undone action',
    category: 'Circuit Editing',
    defaultKeys: ['Ctrl+Y', 'Ctrl+Shift+Z'],
    keys: ['Ctrl+Y', 'Ctrl+Shift+Z'],
  },
  {
    id: 'addQubit',
    name: 'Add Qubit Wire',
    description: 'Add new qubit wire (up to 6 qubits)',
    category: 'Circuit Editing',
    defaultKeys: ['+', '='],
    keys: ['+', '='],
  },
  {
    id: 'removeQubit',
    name: 'Remove Qubit Wire',
    description: 'Remove lowest qubit wire',
    category: 'Circuit Editing',
    defaultKeys: ['-', '_'],
    keys: ['-', '_'],
  },

  // Gate Palette Hotkeys
  {
    id: 'selectH',
    name: 'Select Hadamard (H)',
    description: 'Select Hadamard gate (Superposition state creator)',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['H'],
    keys: ['H'],
  },
  {
    id: 'selectX',
    name: 'Select Pauli-X (NOT)',
    description: 'Select Pauli-X gate (Quantum bit-flip NOT)',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['X'],
    keys: ['X'],
  },
  {
    id: 'selectY',
    name: 'Select Pauli-Y',
    description: 'Select Pauli-Y bit & phase flip gate',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['Y'],
    keys: ['Y'],
  },
  {
    id: 'selectZ',
    name: 'Select Pauli-Z',
    description: 'Select Pauli-Z phase flip gate',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['Z'],
    keys: ['Z'],
  },
  {
    id: 'selectCX',
    name: 'Select CNOT (CX)',
    description: 'Select Controlled-NOT two-qubit entangling gate',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['C'],
    keys: ['C'],
  },
  {
    id: 'selectS',
    name: 'Select Phase S',
    description: 'Select Phase S gate (π/2 rotation around Z)',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['S'],
    keys: ['S'],
  },
  {
    id: 'selectT',
    name: 'Select T Gate',
    description: 'Select T gate (π/4 rotation around Z)',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['T'],
    keys: ['T'],
  },
  {
    id: 'selectMeasure',
    name: 'Select Measurement',
    description: 'Select computational basis measurement detector',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['M'],
    keys: ['M'],
  },
  {
    id: 'selectBarrier',
    name: 'Select Barrier',
    description: 'Select visual timeline barrier marker',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['B'],
    keys: ['B'],
  },
  {
    id: 'selectIdentity',
    name: 'Select Identity (I)',
    description: 'Select Identity no-op gate',
    category: 'Gate Palette Hotkeys',
    defaultKeys: ['I'],
    keys: ['I'],
  },

  // Navigation & Tools
  {
    id: 'openShortcuts',
    name: 'Shortcuts Cheat-Sheet',
    description: 'Toggle keyboard shortcuts reference modal',
    category: 'Navigation & Tools',
    defaultKeys: ['?'],
    keys: ['?'],
  },
  {
    id: 'runSimulator',
    name: 'Launch Simulation',
    description: 'Execute state vector simulation & open Quantum Lab',
    category: 'Navigation & Tools',
    defaultKeys: ['Ctrl+Enter'],
    keys: ['Ctrl+Enter'],
  },
  {
    id: 'deselectGate',
    name: 'Deselect / Close',
    description: 'Deselect active gate or close open modal',
    category: 'Navigation & Tools',
    defaultKeys: ['Escape'],
    keys: ['Escape'],
  },
];

type ShortcutChangeListener = (bindings: Record<string, string[]>) => void;

function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export class ShortcutManager {
  private static cachedBindings: Record<string, string[]> | null = null;
  private static listeners: Set<ShortcutChangeListener> = new Set();

  /**
   * Load key bindings from localStorage, falling back to embedded user progress
   * or default bindings if none exist yet.
   */
  static loadKeyBindings(): Record<string, string[]> {
    if (this.cachedBindings) {
      return { ...this.cachedBindings };
    }

    const defaultBindings: Record<string, string[]> = {};
    for (const def of DEFAULT_SHORTCUT_DEFINITIONS) {
      defaultBindings[def.id] = [...def.defaultKeys];
    }

    try {
      const storage = getLocalStorage();
      if (storage) {
        // 1. Check dedicated keybindings storage
        const raw = storage.getItem(LOCAL_STORAGE_KEYBINDINGS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            this.cachedBindings = { ...defaultBindings, ...parsed };
            return { ...this.cachedBindings };
          }
        }

        // 2. Check user progress storage (for progress synchronization)
        const progressRaw = storage.getItem(LOCAL_STORAGE_USER_PROGRESS);
        if (progressRaw) {
          const progress = JSON.parse(progressRaw);
          if (progress?.keyBindings && typeof progress.keyBindings === 'object') {
            const merged = { ...defaultBindings, ...progress.keyBindings };
            this.cachedBindings = merged;
            this.saveKeyBindings(merged);
            return { ...merged };
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored keybindings:', e);
    }

    this.cachedBindings = defaultBindings;
    return { ...defaultBindings };
  }

  /**
   * Save key bindings to localStorage and sync into UserProgress to persist
   * alongside all learner progress data.
   */
  static saveKeyBindings(bindings: Record<string, string[]>): void {
    this.cachedBindings = { ...bindings };

    try {
      const storage = getLocalStorage();
      if (storage) {
        // Save to dedicated key
        storage.setItem(LOCAL_STORAGE_KEYBINDINGS, JSON.stringify(bindings));

        // Sync alongside UserProgress in localStorage
        const progressRaw = storage.getItem(LOCAL_STORAGE_USER_PROGRESS);
        if (progressRaw) {
          try {
            const progress = JSON.parse(progressRaw);
            progress.keyBindings = bindings;
            storage.setItem(LOCAL_STORAGE_USER_PROGRESS, JSON.stringify(progress));
          } catch {
            // Ignore progress JSON parse failure
          }
        }
      }
    } catch (e) {
      console.error('Failed to save key bindings to localStorage:', e);
    }

    this.notifyListeners();
  }

  /**
   * Get all shortcut actions with their active keys populated.
   */
  static getAllActions(): ShortcutDefinition[] {
    const activeBindings = this.loadKeyBindings();
    return DEFAULT_SHORTCUT_DEFINITIONS.map((def) => ({
      ...def,
      keys: activeBindings[def.id] || [...def.defaultKeys],
    }));
  }

  /**
   * Get keys assigned to a specific action id.
   */
  static getBinding(actionId: string): string[] {
    const activeBindings = this.loadKeyBindings();
    if (activeBindings[actionId]) {
      return activeBindings[actionId];
    }
    const def = DEFAULT_SHORTCUT_DEFINITIONS.find((d) => d.id === actionId);
    return def ? [...def.defaultKeys] : [];
  }

  /**
   * Set keys for a specific action and persist.
   */
  static setBinding(actionId: string, keys: string[]): boolean {
    const def = DEFAULT_SHORTCUT_DEFINITIONS.find((d) => d.id === actionId);
    if (!def) return false;

    const bindings = this.loadKeyBindings();
    bindings[actionId] = keys.map((k) => k.trim()).filter(Boolean);
    this.saveKeyBindings(bindings);
    return true;
  }

  /**
   * Reset all bindings to system defaults.
   */
  static resetToDefaults(): Record<string, string[]> {
    const defaultBindings: Record<string, string[]> = {};
    for (const def of DEFAULT_SHORTCUT_DEFINITIONS) {
      defaultBindings[def.id] = [...def.defaultKeys];
    }
    this.saveKeyBindings(defaultBindings);
    return defaultBindings;
  }

  /**
   * Export current key bindings to a formatted JSON string.
   */
  static exportKeyBindingsJSON(): string {
    const bindings = this.loadKeyBindings();
    const payload: ShortcutPreferencesExport = {
      schemaVersion: 1,
      appName: 'AI Quantum Tutor',
      exportDate: new Date().toISOString(),
      description: 'Quantum Circuit Builder keyboard shortcut preferences',
      bindings,
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Trigger browser file download of current preferences as a JSON file.
   */
  static exportToFile(filename = 'quantum-circuit-shortcuts.json'): void {
    const jsonStr = this.exportKeyBindingsJSON();
    if (typeof window === 'undefined') return;

    try {
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to trigger shortcut file download:', e);
    }
  }

  /**
   * Import key bindings from a JSON string. Validates schema and key format,
   * updates localStorage, and notifies listeners.
   */
  static importKeyBindingsJSON(jsonContent: string): {
    success: boolean;
    count?: number;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON payload: root must be an object' };
      }

      // Support either direct { bindings: { ... } } or raw { actionId: [...] }
      const rawBindings = parsed.bindings && typeof parsed.bindings === 'object'
        ? parsed.bindings
        : parsed;

      const validActionIds = new Set(DEFAULT_SHORTCUT_DEFINITIONS.map((d) => d.id));
      const newBindings: Record<string, string[]> = this.loadKeyBindings();
      let importedCount = 0;

      for (const [actionId, keys] of Object.entries(rawBindings)) {
        if (validActionIds.has(actionId) && Array.isArray(keys)) {
          const sanitizedKeys = (keys as unknown[])
            .filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
            .map((k) => k.trim());
          if (sanitizedKeys.length > 0) {
            newBindings[actionId] = sanitizedKeys;
            importedCount++;
          }
        }
      }

      if (importedCount === 0) {
        return {
          success: false,
          error: 'No valid shortcut action bindings found in the provided JSON file',
        };
      }

      this.saveKeyBindings(newBindings);
      return { success: true, count: importedCount };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown parsing error';
      return { success: false, error: `Malformed JSON: ${msg}` };
    }
  }

  /**
   * Import key bindings from a File object (e.g. from an <input type="file">).
   */
  static async importFromFile(file: File): Promise<{
    success: boolean;
    count?: number;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          resolve(this.importKeyBindingsJSON(text));
        } else {
          resolve({ success: false, error: 'Could not read file contents as text' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read shortcut JSON file' });
      };
      reader.readAsText(file);
    });
  }

  /**
   * Test whether a KeyboardEvent matches an action's configured shortcuts.
   */
  static matchesAction(e: KeyboardEvent, actionId: string): boolean {
    const keys = this.getBinding(actionId);
    if (!keys || keys.length === 0) return false;

    for (const keyCombo of keys) {
      if (this.isEventMatch(e, keyCombo)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if an event matches a key combo descriptor like 'Alt+C', 'Ctrl+Z', 'Backspace', '?'
   */
  private static isEventMatch(e: KeyboardEvent, comboStr: string): boolean {
    const tokens = comboStr.split('+').map((t) => t.trim().toLowerCase());
    
    // Check modifiers
    const requiresCtrl = tokens.includes('ctrl') || tokens.includes('cmd') || tokens.includes('meta');
    const requiresAlt = tokens.includes('alt');
    const requiresShift = tokens.includes('shift');

    const eventCtrl = e.ctrlKey || e.metaKey;
    const eventAlt = e.altKey;
    const eventShift = e.shiftKey;

    if (requiresCtrl !== eventCtrl) return false;
    if (requiresAlt !== eventAlt) return false;

    // Filter out modifier tokens to find the base key
    const baseKeyTokens = tokens.filter(
      (t) => t !== 'ctrl' && t !== 'cmd' && t !== 'meta' && t !== 'alt' && t !== 'shift'
    );

    if (baseKeyTokens.length === 0) return false;
    const targetKey = baseKeyTokens[0];

    // Special cases
    if (targetKey === '?' && (e.key === '?' || (e.key === '/' && eventShift))) {
      return true;
    }

    if (requiresShift && !eventShift) return false;

    // Case-insensitive comparison for regular keys
    const eventKeyLower = e.key.toLowerCase();
    if (eventKeyLower === targetKey) return true;

    // Common key mappings
    if (targetKey === 'enter' && (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter')) {
      return true;
    }
    if (targetKey === 'delete' && (e.key === 'Delete' || e.key === 'Del')) {
      return true;
    }
    if (targetKey === 'backspace' && e.key === 'Backspace') {
      return true;
    }
    if (targetKey === 'escape' && (e.key === 'Escape' || e.key === 'Esc')) {
      return true;
    }
    if (targetKey === '+' && (e.key === '+' || e.key === '=')) {
      return true;
    }
    if (targetKey === '-' && (e.key === '-' || e.key === '_')) {
      return true;
    }

    return false;
  }

  /**
   * Human-friendly representation of keys array for UI display.
   */
  static formatDisplayKeys(keyCombo: string): string[] {
    return keyCombo.split('+').map((part) => {
      const trimmed = part.trim();
      if (trimmed.toLowerCase() === 'ctrl') return 'Ctrl';
      if (trimmed.toLowerCase() === 'alt') return 'Alt';
      if (trimmed.toLowerCase() === 'shift') return 'Shift';
      if (trimmed.toLowerCase() === 'enter') return 'Enter';
      return trimmed.toUpperCase();
    });
  }

  /**
   * Register a listener for keybinding changes. Returns unsubscribe function.
   */
  static subscribe(listener: ShortcutChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const bindings = this.loadKeyBindings();
    this.listeners.forEach((listener) => {
      try {
        listener(bindings);
      } catch (e) {
        console.error('Error in shortcut change listener:', e);
      }
    });
  }
}
