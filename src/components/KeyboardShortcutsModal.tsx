/**
 * Keyboard Shortcuts Modal for Quantum Circuit Builder
 * Displays all available hotkeys categorized for quick navigation and circuit editing.
 * Integrates with ShortcutManager for dynamic keybindings, customizable preferences,
 * and JSON import/export persisted in localStorage.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Command,
  Keyboard,
  Sparkles,
  Cpu,
  Zap,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  Edit2,
  FileText,
  Search,
} from 'lucide-react';
import {
  ShortcutManager,
  ShortcutDefinition,
  ShortcutCategory,
} from '../utils/shortcutManager';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [actions, setActions] = useState<ShortcutDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ShortcutCategory | 'all'>('all');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Rebind / Customize state
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingKeysInput, setEditingKeysInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with ShortcutManager
  useEffect(() => {
    setActions(ShortcutManager.getAllActions());

    const unsubscribe = ShortcutManager.subscribe(() => {
      setActions(ShortcutManager.getAllActions());
    });

    return () => unsubscribe();
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingActionId) {
          setEditingActionId(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, editingActionId]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleExportJSON = () => {
    try {
      ShortcutManager.exportToFile('quantum-shortcuts-preferences.json');
      showNotification('success', 'Exported shortcut preferences to JSON file');
    } catch {
      showNotification('error', 'Failed to export shortcuts file');
    }
  };

  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await ShortcutManager.importFromFile(file);
      if (result.success) {
        showNotification(
          'success',
          `Imported successfully! (${result.count} shortcuts updated and saved to localStorage)`
        );
      } else {
        showNotification('error', result.error || 'Failed to import shortcuts JSON');
      }
    } catch {
      showNotification('error', 'Unexpected error reading keybindings file');
    }
  };

  const handleResetDefaults = () => {
    ShortcutManager.resetToDefaults();
    showNotification('info', 'Reset all shortcuts to default keybindings');
  };

  const handleStartEdit = (action: ShortcutDefinition) => {
    setEditingActionId(action.id);
    setEditingKeysInput(action.keys.join(', '));
  };

  const handleSaveEdit = (actionId: string) => {
    const tokens = editingKeysInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      showNotification('error', 'Please provide at least one valid key combo');
      return;
    }

    const ok = ShortcutManager.setBinding(actionId, tokens);
    if (ok) {
      showNotification('success', 'Updated key binding successfully');
      setEditingActionId(null);
    } else {
      showNotification('error', 'Failed to save shortcut');
    }
  };

  if (!isOpen) return null;

  const categories: ShortcutCategory[] = [
    'Circuit Editing',
    'Gate Palette Hotkeys',
    'Navigation & Tools',
  ];

  const filteredActions = actions.filter((action) => {
    const matchesCategory =
      activeCategory === 'all' || action.category === activeCategory;
    const matchesSearch =
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.keys.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#091122] p-6 shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        {/* Hidden File Input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 shadow-md shadow-cyan-950">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Circuit Builder Hotkeys</h3>
                <span className="rounded bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  SHORTCUT MANAGER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Keyboard shortcuts with JSON export/import and persistent localStorage sync.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`mt-3 flex items-center justify-between px-3.5 py-2 rounded-lg border text-xs font-medium animate-fade-in shrink-0 ${
              notification.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                : notification.type === 'error'
                ? 'border-rose-500/40 bg-rose-950/50 text-rose-300'
                : 'border-cyan-500/40 bg-cyan-950/50 text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              ) : (
                <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Top Control Bar: Search & Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search shortcut name or hotkey..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Manager Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-700 transition-all shadow-sm"
              title="Export current key bindings to a JSON file"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleTriggerImport}
              className="flex items-center gap-1.5 rounded-lg border border-violet-800/60 bg-violet-950/40 px-2.5 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-900/50 hover:border-violet-700 transition-all shadow-sm"
              title="Import key bindings from a JSON file"
            >
              <Upload className="h-3.5 w-3.5 text-violet-400" />
              <span>Import JSON</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
              title="Reset all bindings to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-3 flex items-center gap-1 border-b border-slate-800/80 pb-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Shortcuts ({actions.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'Circuit Editing' && <Zap className="h-3 w-3 text-cyan-400" />}
              {cat === 'Gate Palette Hotkeys' && <Cpu className="h-3 w-3 text-violet-400" />}
              {cat === 'Navigation & Tools' && <Command className="h-3 w-3 text-amber-400" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Shortcuts List Content */}
        <div className="mt-3 space-y-4 overflow-y-auto pr-1 flex-1 min-h-[300px]">
          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
              <AlertCircle className="h-8 w-8 text-slate-500 mb-2" />
              <p>No shortcuts found matching &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            categories
              .filter(
                (cat) => activeCategory === 'all' || activeCategory === cat
              )
              .map((cat) => {
                const categoryActions = filteredActions.filter((a) => a.category === cat);
                if (categoryActions.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {cat === 'Circuit Editing' && <Zap className="h-3.5 w-3.5 text-cyan-400" />}
                      {cat === 'Gate Palette Hotkeys' && <Cpu className="h-3.5 w-3.5 text-violet-400" />}
                      {cat === 'Navigation & Tools' && <Command className="h-3.5 w-3.5 text-amber-400" />}
                      <span>{cat}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categoryActions.map((action) => {
                        const isCustomized =
                          JSON.stringify(action.keys) !== JSON.stringify(action.defaultKeys);
                        const isEditing = editingActionId === action.id;

                        return (
                          <div
                            key={action.id}
                            className={`flex flex-col justify-between rounded-xl border p-2.5 transition-all ${
                              isEditing
                                ? 'border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-950/50'
                                : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-white">
                                    {action.name}
                                  </span>
                                  {isCustomized && (
                                    <span className="rounded bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                  {action.description}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  isEditing ? setEditingActionId(null) : handleStartEdit(action)
                                }
                                className="rounded p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors shrink-0"
                                title="Rebind / customize hotkey"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Editing input or displayed keys */}
                            {isEditing ? (
                              <div className="mt-2.5 pt-2 border-t border-cyan-800/40">
                                <label className="text-[10px] text-slate-400 block mb-1">
                                  Enter key combos separated by comma (e.g. &apos;Alt+C, Shift+Delete&apos;):
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editingKeysInput}
                                    onChange={(e) => setEditingKeysInput(e.target.value)}
                                    placeholder="e.g. Ctrl+Z, Alt+C, H"
                                    className="flex-1 rounded border border-cyan-600/50 bg-slate-950 px-2 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveEdit(action.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveEdit(action.id)}
                                    className="rounded bg-cyan-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingActionId(null)}
                                    className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2.5 flex items-center justify-end gap-1.5 flex-wrap">
                                {action.keys.map((combo, comboIdx) => (
                                  <div
                                    key={comboIdx}
                                    className="flex items-center gap-1"
                                  >
                                    {ShortcutManager.formatDisplayKeys(combo).map(
                                      (k, kIdx, arr) => (
                                        <React.Fragment key={kIdx}>
                                          <kbd className="inline-flex min-w-[22px] h-5 items-center justify-center rounded border border-slate-700 bg-slate-950 px-1.5 font-mono text-[10px] font-bold text-cyan-300 shadow-sm shadow-slate-950">
                                            {k}
                                          </kbd>
                                          {kIdx < arr.length - 1 && (
                                            <span className="text-slate-500 text-[10px] font-mono">
                                              +
                                            </span>
                                          )}
                                        </React.Fragment>
                                      )
                                    )}
                                    {comboIdx < action.keys.length - 1 && (
                                      <span className="text-slate-600 text-[10px] font-medium mx-0.5">
                                        or
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              All key bindings persist in <span className="text-slate-300 font-mono">localStorage</span> alongside learner progress.
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 font-bold text-xs text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
