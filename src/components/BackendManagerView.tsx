/**
 * Quantum Backend Manager
 * Reports genuine availability for Local Browser Simulator and documented external adapters.
 */

import React, { useState } from 'react';
import { BackendManager, QUANTUM_BACKENDS } from '../engine/backendAdapters';
import { QuantumBackend } from '../types/quantum';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Cpu,
  Info,
} from 'lucide-react';

export const BackendManagerView: React.FC = () => {
  const [selectedBackend, setSelectedBackend] = useState<QuantumBackend>(QUANTUM_BACKENDS[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const bridgeSnippet = BackendManager.generateBridgeSnippet(selectedBackend.id);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(bridgeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Quantum Hardware & Backend Manager</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Modular simulation adapters, hardware bridge interfaces, and runtime connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Active Execution Backend:</span>
          <span className="flex items-center gap-1.5 rounded-lg border border-emerald-800/80 bg-emerald-950/60 px-2.5 py-1 font-mono font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Local Browser State-Vector Engine
          </span>
        </div>
      </div>

      {/* Honest Backend Disclaimer */}
      <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-amber-300">
          <Info className="h-4 w-4" />
          <span>Scientific Execution Transparency Policy</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          External quantum SDKs (Qiskit Aer, PennyLane Lightning, Google Cirq) execute natively inside
          Python C++ environments and cannot execute client-side inside a browser without a Python bridge service.
          This platform accurately marks external backends as available or requiring bridge configuration,
          ensuring zero fabricated simulation results.
        </p>
      </div>

      {/* Backend Adapters Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUANTUM_BACKENDS.map((b) => {
          const isSelected = selectedBackend.id === b.id;
          const isConnected = b.status === 'connected';

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBackend(b)}
              className={`cursor-pointer rounded-xl border p-4 shadow-lg transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/40'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100">{b.name}</span>
                <span
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-bold ${
                    isConnected
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isConnected ? 'Active Default' : 'Adapter Spec'}
                </span>
              </div>

              <div className="mt-1 text-[11px] text-slate-500 font-mono">{b.provider}</div>

              <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {b.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Max: {b.maxQubits} Qubits</span>
                <span>{b.supportsNoise ? 'Noise: Yes' : 'Ideal only'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Backend Integration Spec & Python Bridge */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">
              ADAPTER SPECIFICATION
            </span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedBackend.name}</h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={selectedBackend.apiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              <span>Official SDK Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy Bridge Code'}</span>
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs space-y-1.5">
          <div className="font-semibold text-slate-300">Prerequisites & Runtime Requirements:</div>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
            {selectedBackend.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Starter Bridge Python Code */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono">
            <Code2 className="h-4 w-4" />
            <span>Python REST Bridge Endpoint Implementation</span>
          </div>
          <pre className="overflow-x-auto text-[11px] font-mono text-cyan-200/90 leading-relaxed">
            {bridgeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
