/**
 * Dedicated Quantum Simulator Laboratory
 * Features configurable shot sampling, seed reproducibility, execution timings,
 * and educational noise modeling compared side-by-side with ideal state-vectors.
 */

import React, { useState } from 'react';
import { Circuit, SimulationResult } from '../types/quantum';
import { QuantumSimulator } from '../engine/quantumSimulator';
import { Play, Cpu, Sliders, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QuantumSimulatorLabProps {
  circuit: Circuit;
}

export const QuantumSimulatorLab: React.FC<QuantumSimulatorLabProps> = ({ circuit }) => {
  const [shots, setShots] = useState<number>(1024);
  const [seed, setSeed] = useState<number>(42);
  const [enableNoise, setEnableNoise] = useState<boolean>(false);
  const [noiseRate, setNoiseRate] = useState<number>(0.05); // 5% depolarizing error

  // Run ideal simulation
  const idealResult: SimulationResult = QuantumSimulator.simulate(circuit, {
    shots,
    seed,
    applyNoise: false,
  });

  // Run educational noisy simulation
  const noisyResult: SimulationResult = QuantumSimulator.simulate(circuit, {
    shots,
    seed,
    applyNoise: enableNoise,
    noiseErrorRate: noiseRate,
  });

  return (
    <div className="space-y-5">
      {/* Configuration Controls Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm md:grid-cols-4">
        {/* Shots Configuration */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase">Shots Count</label>
          <select
            value={shots}
            onChange={(e) => setShots(parseInt(e.target.value, 10))}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-cyan-400 focus:outline-none"
          >
            <option value="128">128 shots (Fast sample)</option>
            <option value="512">512 shots</option>
            <option value="1024">1024 shots (Standard)</option>
            <option value="4096">4096 shots (High fidelity)</option>
            <option value="8192">8192 shots (Research tier)</option>
          </select>
        </div>

        {/* Deterministic Seed */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase">RNG Seed (Reproducibility)</label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value, 10) || 1)}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
          />
        </div>

        {/* Educational Noise Toggle */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase">Educational Noise Model</label>
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => setEnableNoise(!enableNoise)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                enableNoise
                  ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-600/30'
                  : 'border border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              {enableNoise ? 'Noise ON (Active)' : 'Ideal (Noise OFF)'}
            </button>
          </div>
        </div>

        {/* Noise Error Rate Slider */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase">
            Depolarizing Rate: {(noiseRate * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            disabled={!enableNoise}
            value={noiseRate}
            onChange={(e) => setNoiseRate(parseFloat(e.target.value))}
            className="mt-2 w-full accent-amber-400 disabled:opacity-30"
          />
        </div>
      </div>

      {/* Execution Benchmark Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[10px] text-slate-500 uppercase">Simulation Engine</div>
          <div className="mt-1 text-sm font-bold text-slate-100">State-Vector Matrix</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[10px] text-slate-500 uppercase">Execution Duration</div>
          <div className="mt-1 text-sm font-bold text-cyan-400 font-mono">
            {idealResult.executionTimeMs.toFixed(2)} ms
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[10px] text-slate-500 uppercase">State Vector Norm</div>
          <div className="mt-1 text-sm font-bold text-emerald-400 font-mono">
            {idealResult.norm.toFixed(5)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="text-[10px] text-slate-500 uppercase">Active Qubits</div>
          <div className="mt-1 text-sm font-bold text-violet-400 font-mono">
            {circuit.numQubits} Qubits (2^{circuit.numQubits} states)
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Ideal vs Noisy Simulation */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Ideal Simulation Column */}
        <div className="rounded-xl border border-cyan-900/50 bg-slate-900/60 p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">IDEAL STATE-VECTOR SIMULATION</span>
            </div>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800">
              100% Coherent
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {idealResult.stateVector.slice(0, 8).map((sv) => {
              const shotsCount = idealResult.shotsResult?.[sv.basis] || 0;
              const probPct = (sv.probability * 100).toFixed(1);

              return (
                <div key={sv.basis} className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-cyan-300">{sv.basis}</span>
                    <span className="text-slate-400">{probPct}% probability</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${probPct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
                    <span>Amp: {sv.amplitude.r.toFixed(3)} + {sv.amplitude.i.toFixed(3)}i</span>
                    <span>Measured: {shotsCount} shots</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Noisy Simulation Column */}
        <div className="rounded-xl border border-amber-900/50 bg-slate-900/60 p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                EDUCATIONAL NOISY SIMULATION
              </span>
            </div>
            <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-800">
              {enableNoise ? `Depolarizing p=${noiseRate}` : 'Noise Disabled'}
            </span>
          </div>

          {enableNoise ? (
            <div className="space-y-3 font-mono text-xs">
              {noisyResult.stateVector.slice(0, 8).map((sv) => {
                const shotsCount = noisyResult.shotsResult?.[sv.basis] || 0;
                const probPct = (sv.probability * 100).toFixed(1);

                return (
                  <div key={sv.basis} className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-amber-300">{sv.basis}</span>
                      <span className="text-slate-400">{probPct}% probability</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${probPct}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
                      <span>Measured: {shotsCount} shots</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-xs text-slate-400">
              <Zap className="h-8 w-8 text-slate-600 mb-2" />
              <p>Enable the Educational Noise Model above to simulate decoherence and depolarizing gate errors.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
