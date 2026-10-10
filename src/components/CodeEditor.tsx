/**
 * Integrated Quantum Code Editor
 * Bi-directionally synchronizes with the visual circuit builder.
 */

import React, { useState, useEffect } from 'react';
import { Circuit, SimulationResult } from '../types/quantum';
import { CodeConverter } from '../engine/codeConverter';
import { QuantumSimulator } from '../engine/quantumSimulator';
import {
  Play,
  Copy,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  FileCode2,
  Sparkles,
} from 'lucide-react';

interface CodeEditorProps {
  circuit: Circuit;
  onUpdateCircuit: (circuit: Circuit) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ circuit, onUpdateCircuit }) => {
  const [code, setCode] = useState<string>('');
  const [parseErrors, setParseErrors] = useState<{ line: number; message: string }[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Sync code whenever circuit prop changes from outside
  useEffect(() => {
    const qiskitCode = CodeConverter.circuitToQiskit(circuit);
    setCode(qiskitCode);
    setParseErrors([]);
    setSimResult(QuantumSimulator.simulate(circuit));
  }, [circuit]);

  const handleRunCode = () => {
    const parseRes = CodeConverter.parseQiskit(code);
    if (!parseRes.success || !parseRes.circuit) {
      setParseErrors(parseRes.errors);
      return;
    }

    setParseErrors([]);
    onUpdateCircuit(parseRes.circuit);
    const sim = QuantumSimulator.simulate(parseRes.circuit);
    setSimResult(sim);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuit.name.toLowerCase().replace(/\s+/g, '_')}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadExample = (exampleType: string) => {
    let exampleCode = '';
    switch (exampleType) {
      case 'bell':
        exampleCode = `# Bell State |Φ⁺⟩ Preparation
from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()`;
        break;
      case 'superposition':
        exampleCode = `# 3-Qubit Equal Superposition
from qiskit import QuantumCircuit

qc = QuantumCircuit(3)
qc.h(0)
qc.h(1)
qc.h(2)
qc.measure_all()`;
        break;
      case 'grover':
        exampleCode = `# Grover 2-Qubit Search for |11⟩
from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
# Superposition
qc.h(0)
qc.h(1)
# Oracle for |11⟩
qc.cz(0, 1)
# Diffusion
qc.h(0)
qc.h(1)
qc.x(0)
qc.x(1)
qc.cz(0, 1)
qc.x(0)
qc.x(1)
qc.h(0)
qc.h(1)
qc.measure_all()`;
        break;
      default:
        exampleCode = CodeConverter.circuitToQiskit(circuit);
    }

    setCode(exampleCode);
    const parseRes = CodeConverter.parseQiskit(exampleCode);
    if (parseRes.success && parseRes.circuit) {
      onUpdateCircuit(parseRes.circuit);
      setSimResult(QuantumSimulator.simulate(parseRes.circuit));
    }
  };

  return (
    <div className="space-y-4">
      {/* Code Editor Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunCode}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Run & Simulate Code
          </button>

          <button
            onClick={() => {
              setCode(CodeConverter.circuitToQiskit(circuit));
              setParseErrors([]);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Sync from Visual Circuit
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            Download .py
          </button>
        </div>

        {/* Load Preset Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Presets:</span>
          <select
            onChange={(e) => handleLoadExample(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-cyan-400 focus:outline-none"
          >
            <option value="">Load Example Program...</option>
            <option value="bell">Bell State (|00⟩ + |11⟩)/√2</option>
            <option value="superposition">3-Qubit Superposition</option>
            <option value="grover">Grover Search (2-Qubit)</option>
          </select>
        </div>
      </div>

      {/* Editor & Results Panels Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Python Code Input Area */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/90 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-cyan-400" />
              <span>quantum_program.py (Qiskit 1.0+ Subset)</span>
            </div>
            <span className="text-[11px] text-slate-500">Python 3.x</span>
          </div>

          <div className="p-3">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full resize-none font-mono text-xs text-cyan-200 bg-transparent focus:outline-none leading-relaxed selection:bg-cyan-500/30"
              placeholder="# Write Qiskit code here..."
            />
          </div>

          {/* Error Banner */}
          {parseErrors.length > 0 && (
            <div className="border-t border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                <AlertCircle className="h-4 w-4" />
                <span>Syntax & Validation Errors</span>
              </div>
              {parseErrors.map((err, idx) => (
                <div key={idx} className="font-mono text-[11px] pl-5">
                  Line {err.line}: {err.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Simulation Output Panel */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs font-semibold text-slate-200">CODE EXECUTION RESULTS</span>
            {simResult && (
              <span className="font-mono text-xs text-emerald-400">
                Norm: {simResult.norm.toFixed(4)} (100% unitary)
              </span>
            )}
          </div>

          {simResult ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300">
                <div className="text-slate-400 mb-1 text-[11px]">Computed State Probability Distribution:</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {simResult.stateVector.slice(0, 8).map((sv) => (
                    <div
                      key={sv.basis}
                      className="flex items-center justify-between rounded bg-slate-900 px-2 py-1 border border-slate-800/60"
                    >
                      <span className="font-bold text-cyan-300">{sv.basis}</span>
                      <span className="text-slate-400">{(sv.probability * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphical probability bars */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">Visual Probability Distribution:</span>
                {simResult.stateVector.slice(0, 6).map((sv) => (
                  <div key={sv.basis} className="flex items-center gap-2 text-xs">
                    <span className="w-12 font-mono text-slate-300">{sv.basis}</span>
                    <div className="h-2.5 flex-1 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${sv.probability * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-slate-400">
                      {(sv.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Qiskit Code Subset Compatibility</span>
                </div>
                Supported commands: <code className="text-cyan-300">QuantumCircuit(n)</code>,{' '}
                <code className="text-cyan-300">qc.h(q)</code>,{' '}
                <code className="text-cyan-300">qc.x(q)</code>,{' '}
                <code className="text-cyan-300">qc.cx(c, t)</code>,{' '}
                <code className="text-cyan-300">qc.cz(c, t)</code>,{' '}
                <code className="text-cyan-300">qc.rx(theta, q)</code>,{' '}
                <code className="text-cyan-300">qc.barrier()</code>,{' '}
                <code className="text-cyan-300">qc.measure_all()</code>.
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
              Click &quot;Run &amp; Simulate Code&quot; to execute program.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
