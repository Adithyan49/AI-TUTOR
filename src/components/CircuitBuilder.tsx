/**
 * Interactive Graphical Quantum Circuit Builder
 * Supports click-to-place, drag-to-place, timeline columns, multi-qubit gates, and real-time state feedback.
 */

import React, { useState, useEffect } from 'react';
import {
  Circuit,
  Gate,
  GateType,
  SimulationResult,
} from '../types/quantum';
import { QuantumSimulator } from '../engine/quantumSimulator';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ShortcutManager } from '../utils/shortcutManager';
import {
  Plus,
  Minus,
  Trash2,
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
  Keyboard,
  X,
} from 'lucide-react';

interface CircuitBuilderProps {
  circuit: Circuit;
  onChangeCircuit: (circuit: Circuit) => void;
  onNavigateToCode?: () => void;
  onNavigateToBloch?: () => void;
  onNavigateToSimulator?: () => void;
}

export const CircuitBuilder: React.FC<CircuitBuilderProps> = ({
  circuit,
  onChangeCircuit,
  onNavigateToCode,
  onNavigateToBloch,
  onNavigateToSimulator,
}) => {
  const [selectedGateType, setSelectedGateType] = useState<GateType>('H');
  const [rotationAngle, setRotationAngle] = useState<number>(Math.PI);
  const [targetQubitSelect, setTargetQubitSelect] = useState<number>(1);
  const [undoStack, setUndoStack] = useState<Circuit[]>([]);
  const [redoStack, setRedoStack] = useState<Circuit[]>([]);
  const [activeStepCol, setActiveStepCol] = useState<number | null>(null);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [shortcutNotice, setShortcutNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setShortcutNotice(msg);
    setTimeout(() => {
      setShortcutNotice((curr) => (curr === msg ? null : curr));
    }, 1600);
  };


  // Maximum timeline columns to show
  const maxCols = Math.max(10, ...circuit.gates.map((g) => g.col + 2));

  // Run real-time simulation on current circuit
  const simResult: SimulationResult = QuantumSimulator.simulate(circuit);

  const pushState = (newCircuit: Circuit) => {
    setUndoStack((prev) => [...prev.slice(-20), circuit]);
    setRedoStack([]);
    onChangeCircuit(newCircuit);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, circuit]);
    onChangeCircuit(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, circuit]);
    onChangeCircuit(next);
  };

  const handleAddQubit = () => {
    if (circuit.numQubits >= 6) return;
    pushState({
      ...circuit,
      numQubits: circuit.numQubits + 1,
    });
  };

  const handleRemoveQubit = () => {
    if (circuit.numQubits <= 1) return;
    const newNum = circuit.numQubits - 1;
    const filteredGates = circuit.gates.filter(
      (g) => g.qubit < newNum && (g.targetQubit === undefined || g.targetQubit < newNum)
    );
    pushState({
      ...circuit,
      numQubits: newNum,
      gates: filteredGates,
    });
  };

  const handleCellClick = (qubit: number, col: number) => {
    // If cell already has a gate
    const existingGate = circuit.gates.find(
      (g) => (g.qubit === qubit || g.targetQubit === qubit) && g.col === col
    );

    if (existingGate) {
      if (selectedGateId === existingGate.id) {
        // Second click on selected gate removes it
        const remaining = circuit.gates.filter((g) => g.id !== existingGate.id);
        pushState({ ...circuit, gates: remaining });
        setSelectedGateId(null);
        showNotice(`Removed ${existingGate.type} gate`);
      } else {
        // First click selects the gate
        setSelectedGateId(existingGate.id);
        showNotice(`${existingGate.type} selected (Backspace to delete)`);
      }
      return;
    }

    // Place new gate on empty slot
    setSelectedGateId(null);
    let targetQ: number | undefined = undefined;
    if (selectedGateType === 'CX' || selectedGateType === 'CZ' || selectedGateType === 'SWAP') {
      targetQ = targetQubitSelect === qubit ? (qubit === 0 ? 1 : 0) : targetQubitSelect;
      if (targetQ >= circuit.numQubits) {
        targetQ = qubit === 0 ? 1 : 0;
      }
    }

    const newGate: Gate = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: selectedGateType,
      qubit,
      targetQubit: targetQ,
      params:
        selectedGateType === 'RX' || selectedGateType === 'RY' || selectedGateType === 'RZ'
          ? { theta: rotationAngle }
          : undefined,
      col,
    };

    pushState({
      ...circuit,
      gates: [...circuit.gates, newGate],
    });
  };

  const handleDeleteSelectedGate = () => {
    if (selectedGateId) {
      const target = circuit.gates.find((g) => g.id === selectedGateId);
      const remaining = circuit.gates.filter((g) => g.id !== selectedGateId);
      pushState({ ...circuit, gates: remaining });
      setSelectedGateId(null);
      showNotice(target ? `Deleted ${target.type} gate` : 'Gate deleted');
    } else if (circuit.gates.length > 0) {
      const lastGate = circuit.gates[circuit.gates.length - 1];
      const remaining = circuit.gates.slice(0, -1);
      pushState({ ...circuit, gates: remaining });
      showNotice(`Deleted last ${lastGate.type} gate`);
    }
  };

  const handleClearCircuit = () => {
    pushState({
      ...circuit,
      gates: [],
    });
    setSelectedGateId(null);
    showNotice('Cleared all gates');
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    // Re-render when shortcuts are updated in ShortcutManager
    const unsubscribe = ShortcutManager.subscribe(() => {
      // Force effect re-evaluation
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in form inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Toggle Keyboard Shortcuts Modal
      if (ShortcutManager.matchesAction(e, 'openShortcuts')) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Escape: Close modal or deselect gate
      if (ShortcutManager.matchesAction(e, 'deselectGate')) {
        if (shortcutsModalOpen) {
          setShortcutsModalOpen(false);
        } else if (selectedGateId) {
          setSelectedGateId(null);
          showNotice('Deselected gate');
        }
        return;
      }

      // Delete or Backspace: Delete selected gate or last gate
      if (ShortcutManager.matchesAction(e, 'deleteGate')) {
        e.preventDefault();
        handleDeleteSelectedGate();
        return;
      }

      // Clear canvas
      if (ShortcutManager.matchesAction(e, 'clearCanvas')) {
        e.preventDefault();
        handleClearCircuit();
        return;
      }

      // Redo
      if (ShortcutManager.matchesAction(e, 'redo')) {
        e.preventDefault();
        handleRedo();
        showNotice('Redo');
        return;
      }

      // Undo
      if (ShortcutManager.matchesAction(e, 'undo')) {
        e.preventDefault();
        handleUndo();
        showNotice('Undo');
        return;
      }

      // Run simulation lab
      if (ShortcutManager.matchesAction(e, 'runSimulator')) {
        if (onNavigateToSimulator) {
          e.preventDefault();
          onNavigateToSimulator();
        }
        return;
      }

      // Add Qubit wire
      if (ShortcutManager.matchesAction(e, 'addQubit')) {
        e.preventDefault();
        handleAddQubit();
        showNotice('Added qubit wire');
        return;
      }

      // Remove Qubit wire
      if (ShortcutManager.matchesAction(e, 'removeQubit')) {
        e.preventDefault();
        handleRemoveQubit();
        showNotice('Removed qubit wire');
        return;
      }

      // Gate Palette Hotkeys
      if (ShortcutManager.matchesAction(e, 'selectH')) {
        setSelectedGateType('H');
        showNotice('Hadamard (H) selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectX')) {
        setSelectedGateType('X');
        showNotice('Pauli-X (X) selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectY')) {
        setSelectedGateType('Y');
        showNotice('Pauli-Y (Y) selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectZ')) {
        setSelectedGateType('Z');
        showNotice('Pauli-Z (Z) selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectCX')) {
        setSelectedGateType('CX');
        showNotice('CNOT (CX) selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectS')) {
        setSelectedGateType('S');
        showNotice('Phase (S) selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectT')) {
        setSelectedGateType('T');
        showNotice('T gate selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectMeasure')) {
        setSelectedGateType('MEASURE');
        showNotice('Measurement (M) selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectBarrier')) {
        setSelectedGateType('BARRIER');
        showNotice('Barrier selected');
        return;
      }
      if (ShortcutManager.matchesAction(e, 'selectIdentity')) {
        setSelectedGateType('I');
        showNotice('Identity (I) selected');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribe();
    };
  }, [
    circuit,
    selectedGateId,
    shortcutsModalOpen,
    undoStack,
    redoStack,
    onNavigateToSimulator,
  ]);

  const getGateColorClass = (type: GateType) => {
    switch (type) {
      case 'H':
        return 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/40 shadow-blue-500/20';
      case 'X':
      case 'Y':
      case 'Z':
        return 'bg-violet-600 hover:bg-violet-500 text-white border-violet-400/40 shadow-violet-500/20';
      case 'S':
      case 'T':
      case 'Sdg':
      case 'Tdg':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 shadow-indigo-500/20';
      case 'RX':
      case 'RY':
      case 'RZ':
        return 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400/40 shadow-purple-500/20';
      case 'CX':
      case 'CZ':
      case 'SWAP':
        return 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400/40 shadow-cyan-500/20';
      case 'MEASURE':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-emerald-500/20';
      case 'BARRIER':
        return 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-500';
      default:
        return 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500';
    }
  };

  const gatePaletteList: { type: GateType; label: string; desc: string }[] = [
    { type: 'H', label: 'H', desc: 'Hadamard: Creates equal superposition' },
    { type: 'X', label: 'X', desc: 'Pauli-X: Quantum NOT bit flip' },
    { type: 'Y', label: 'Y', desc: 'Pauli-Y: Bit + phase flip' },
    { type: 'Z', label: 'Z', desc: 'Pauli-Z: Phase flip (π shift)' },
    { type: 'S', label: 'S', desc: 'Phase gate (π/2 phase)' },
    { type: 'T', label: 'T', desc: 'π/4 phase rotation' },
    { type: 'CX', label: 'CNOT', desc: 'Controlled-NOT 2-qubit gate' },
    { type: 'CZ', label: 'CZ', desc: 'Controlled-Z phase flip' },
    { type: 'SWAP', label: 'SWAP', desc: 'Swap states of two qubits' },
    { type: 'RX', label: 'RX(θ)', desc: 'Rotation around X-axis' },
    { type: 'RY', label: 'RY(θ)', desc: 'Rotation around Y-axis' },
    { type: 'RZ', label: 'RZ(θ)', desc: 'Rotation around Z-axis' },
    { type: 'MEASURE', label: 'M', desc: 'Computational basis measurement' },
    { type: 'BARRIER', label: 'Barrier', desc: 'Visual timeline barrier' },
    { type: 'I', label: 'I', desc: 'Identity no-op' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Qubit Count Controls */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
            <span className="text-slate-400">Wires:</span>
            <span className="font-mono font-bold text-cyan-400">{circuit.numQubits} Qubits</span>
            <button
              onClick={handleRemoveQubit}
              disabled={circuit.numQubits <= 1}
              className="ml-1 rounded p-1 hover:bg-slate-800 disabled:opacity-30"
              title="Remove qubit wire"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              onClick={handleAddQubit}
              disabled={circuit.numQubits >= 6}
              className="rounded p-1 hover:bg-slate-800 disabled:opacity-30"
              title="Add qubit wire"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
              title="Undo last edit"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
              title="Redo last edit"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Clear Canvas */}
          <button
            onClick={handleClearCircuit}
            className="flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/20 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-900/40 transition-colors"
            title="Clear all gates (Alt + C)"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
            <kbd className="hidden sm:inline rounded bg-rose-950 border border-rose-800/50 px-1 py-0.2 text-[9px] font-mono text-rose-300">
              Alt+C
            </kbd>
          </button>

          {/* Delete Selected Gate Action (when a gate is selected) */}
          {selectedGateId && (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 px-2.5 py-1 text-xs text-amber-300 animate-pulse">
              <span>Selected Gate</span>
              <button
                onClick={handleDeleteSelectedGate}
                className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 hover:bg-amber-500/40 text-amber-200"
                title="Delete selected gate (Backspace or Delete)"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
                <kbd className="text-[9px] bg-slate-900 px-1 rounded text-amber-300">Del</kbd>
              </button>
              <button
                onClick={() => setSelectedGateId(null)}
                className="rounded p-0.5 text-amber-400 hover:text-white"
                title="Deselect (Escape)"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Keyboard Shortcuts Dialog Trigger */}
          <button
            onClick={() => setShortcutsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-100 transition-colors shadow-sm"
            title="View Circuit Builder Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Shortcuts</span>
            <kbd className="rounded bg-slate-900 border border-cyan-800/60 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300 font-bold">
              ?
            </kbd>
          </button>
        </div>

        {/* Real-time Circuit Depth, Gate Count & Shortcut Notice Pill */}
        <div className="flex items-center gap-3 text-xs">
          {shortcutNotice && (
            <div className="animate-fade-in flex items-center gap-1.5 rounded-full border border-cyan-500/60 bg-cyan-950/90 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-lg shadow-cyan-950/50">
              <Sparkles className="h-3 w-3 text-cyan-400 animate-spin" />
              <span>{shortcutNotice}</span>
            </div>
          )}

          <div className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1 font-mono text-slate-300">
            Depth: <span className="text-cyan-400 font-bold">{simResult.circuitDepth}</span> | Gates:{' '}
            <span className="text-violet-400 font-bold">{simResult.gateCount}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Simulated in {simResult.executionTimeMs.toFixed(1)}ms
          </div>
        </div>
      </div>

      {/* Gate Palette */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">GATE PALETTE (Select gate then click grid wire)</span>
          <span className="text-[11px] text-cyan-400/80">Click placed gate on timeline to delete</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {gatePaletteList.map((item) => {
            const isSelected = selectedGateType === item.type;
            return (
              <button
                key={item.type}
                onClick={() => setSelectedGateType(item.type)}
                className={`relative flex h-10 min-w-11 items-center justify-center rounded-lg border px-2.5 font-mono text-xs font-bold transition-all shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105 ' +
                      getGateColorClass(item.type)
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                }`}
                title={item.desc}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Gate Parameter Configuration Sub-Bar */}
        {(selectedGateType === 'CX' ||
          selectedGateType === 'CZ' ||
          selectedGateType === 'SWAP' ||
          selectedGateType === 'RX' ||
          selectedGateType === 'RY' ||
          selectedGateType === 'RZ') && (
          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs text-slate-300">
            {(selectedGateType === 'CX' ||
              selectedGateType === 'CZ' ||
              selectedGateType === 'SWAP') && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Target Qubit:</span>
                <select
                  value={targetQubitSelect}
                  onChange={(e) => setTargetQubitSelect(parseInt(e.target.value, 10))}
                  className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-cyan-400 focus:outline-none"
                >
                  {Array.from({ length: circuit.numQubits }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      q{idx}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedGateType === 'RX' ||
              selectedGateType === 'RY' ||
              selectedGateType === 'RZ') && (
              <div className="flex items-center gap-2.5">
                <Sliders className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-slate-400">Rotation Angle θ:</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    onClick={() => setRotationAngle(Math.PI / 4)}
                    className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] hover:bg-purple-900/40 text-purple-300"
                  >
                    π/4
                  </button>
                  <button
                    onClick={() => setRotationAngle(Math.PI / 2)}
                    className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] hover:bg-purple-900/40 text-purple-300"
                  >
                    π/2
                  </button>
                  <button
                    onClick={() => setRotationAngle(Math.PI)}
                    className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] hover:bg-purple-900/40 text-purple-300"
                  >
                    π
                  </button>
                </div>
                <span className="font-mono text-purple-300 text-xs">
                  {(rotationAngle / Math.PI).toFixed(2)}π rad
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Circuit Canvas Grid */}
      <div className="relative overflow-x-auto rounded-xl border border-slate-800 bg-[#070e20] p-6 shadow-2xl circuit-canvas-bg">
        <div className="min-w-[650px] space-y-6">
          {/* Timeline Column Headers */}
          <div className="flex items-center pl-24">
            {Array.from({ length: maxCols }).map((_, col) => (
              <div
                key={col}
                className="w-14 text-center font-mono text-[10px] text-slate-500"
              >
                col {col}
              </div>
            ))}
          </div>

          {/* Qubit Wires */}
          {Array.from({ length: circuit.numQubits }).map((_, qubit) => (
            <div key={qubit} className="relative flex items-center">
              {/* Qubit Label and Initial State */}
              <div className="flex w-24 items-center gap-2 pr-3 font-mono text-xs">
                <span className="font-bold text-cyan-400">q[{qubit}]</span>
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-400 border border-slate-800">
                  |0⟩
                </span>
              </div>

              {/* Wire Line */}
              <div className="absolute left-24 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-700/80" />

              {/* Column Slots */}
              <div className="relative z-10 flex items-center">
                {Array.from({ length: maxCols }).map((_, col) => {
                  const gateOnSlot = circuit.gates.find(
                    (g) => (g.qubit === qubit || g.targetQubit === qubit) && g.col === col
                  );

                  return (
                    <div
                      key={col}
                      onClick={() => handleCellClick(qubit, col)}
                      className="group flex h-14 w-14 cursor-pointer items-center justify-center"
                    >
                      {gateOnSlot ? (
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-xs font-bold shadow-md transition-all hover:scale-110 ${
                            gateOnSlot.id === selectedGateId
                              ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg shadow-amber-500/30 '
                              : ''
                          }${
                            gateOnSlot.qubit === qubit
                              ? getGateColorClass(gateOnSlot.type)
                              : 'bg-cyan-900/80 border-cyan-400 text-cyan-200'
                          }`}
                        >
                          {gateOnSlot.type === 'CX' ? (
                            gateOnSlot.qubit === qubit ? (
                              '•'
                            ) : (
                              '⊕'
                            )
                          ) : gateOnSlot.type === 'CZ' ? (
                            '•'
                          ) : gateOnSlot.type === 'SWAP' ? (
                            '✕'
                          ) : gateOnSlot.type === 'BARRIER' ? (
                            '|'
                          ) : (
                            gateOnSlot.type
                          )}
                        </div>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-800 opacity-40 transition-all group-hover:scale-150 group-hover:bg-cyan-400 group-hover:opacity-100" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live State & Quick Probability Preview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Probability Bars */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">COMPUTATIONAL BASIS PROBABILITIES</span>
            <span className="font-mono text-[11px] text-cyan-400">
              Total Norm: {simResult.norm.toFixed(4)}
            </span>
          </div>

          <div className="space-y-2">
            {simResult.stateVector.slice(0, 8).map((sv) => {
              const pct = (sv.probability * 100).toFixed(1);
              return (
                <div key={sv.basis} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-mono font-bold text-slate-300">{sv.basis}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-14 text-right font-mono text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Insights & Navigation Shortcuts */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>CIRCUIT DIAGNOSTIC SUMMARY</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Circuit holds <span className="text-cyan-300 font-mono">{circuit.gates.length}</span>{' '}
              operations with depth <span className="text-violet-300 font-mono">{simResult.circuitDepth}</span>.
              All operations are mathematically unitary and state vector preserves conservation of probability.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
            {onNavigateToCode && (
              <button
                onClick={onNavigateToCode}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800"
              >
                <span>Inspect in Python / Qiskit</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}

            {onNavigateToBloch && (
              <button
                onClick={onNavigateToBloch}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-cyan-300 hover:bg-slate-800"
              >
                <span>View on Bloch Sphere</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}

            {onNavigateToSimulator && (
              <button
                onClick={onNavigateToSimulator}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-emerald-300 hover:bg-slate-800"
              >
                <span>Run Shots & Noise</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
};
