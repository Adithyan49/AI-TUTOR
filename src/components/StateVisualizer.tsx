/**
 * Quantum State Visualizer
 * Comprehensive state vector inspection, complex amplitudes, Recharts probability charts, and Bell state experiment.
 */

import React from 'react';
import { Circuit, SimulationResult } from '../types/quantum';
import { QuantumSimulator } from '../engine/quantumSimulator';
import { ComplexMath } from '../engine/complex';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Sparkles, PieChart, Info, FlaskConical } from 'lucide-react';

interface StateVisualizerProps {
  circuit: Circuit;
  onLoadBellState?: () => void;
}

export const StateVisualizer: React.FC<StateVisualizerProps> = ({
  circuit,
  onLoadBellState,
}) => {
  const simResult: SimulationResult = QuantumSimulator.simulate(circuit, {
    shots: 1024,
  });

  const chartData = simResult.stateVector.map((sv) => ({
    basis: sv.basis,
    probability: Number((sv.probability * 100).toFixed(2)),
    amplitudeStr: ComplexMath.format(sv.amplitude),
    phaseDeg: Number(((sv.phase * 180) / Math.PI).toFixed(1)),
    shots: simResult.shotsResult?.[sv.basis] || 0,
  }));

  const isBellState =
    circuit.numQubits === 2 &&
    simResult.probabilities['|00⟩'] > 0.45 &&
    simResult.probabilities['|11⟩'] > 0.45 &&
    (simResult.probabilities['|01⟩'] || 0) < 0.05;

  return (
    <div className="space-y-5">
      {/* Dirac Ket State Expression Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          FULL STATE VECTOR EXPANSION (DIRAC NOTATION)
        </div>
        <div className="overflow-x-auto py-2 font-mono text-sm text-cyan-300">
          |ψ⟩ ={' '}
          {simResult.stateVector
            .filter((sv) => sv.probability > 0.001)
            .map((sv, idx) => {
              const ampFormatted = ComplexMath.format(sv.amplitude, 3);
              return (
                <span key={sv.basis}>
                  {idx > 0 && ' + '}
                  <span className="font-bold text-violet-300">({ampFormatted})</span>
                  <span className="text-cyan-400">{sv.basis}</span>
                </span>
              );
            })}
        </div>
        <div className="text-[11px] text-slate-500">
          State vector length: 2^{circuit.numQubits} = {simResult.stateVector.length} basis states | Norm ={' '}
          {simResult.norm.toFixed(4)}
        </div>
      </div>

      {/* Recharts Probability Distribution Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <PieChart className="h-4 w-4 text-cyan-400" />
            <span>MEASUREMENT PROBABILITY DISTRIBUTION (%)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">1024 Simulated Shots</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <XAxis
                dataKey="basis"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#64748b"
                unit="%"
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [`${value}%`, 'Probability']}
              />
              <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.probability > 0.01 ? '#06b6d4' : '#334155'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Vector Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 text-xs font-semibold text-slate-200">
          STATE-VECTOR AMPLITUDES & PHASES TABLE
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
              <tr>
                <th className="py-2.5 px-4">Basis State</th>
                <th className="py-2.5 px-4">Real (Re)</th>
                <th className="py-2.5 px-4">Imaginary (Im)</th>
                <th className="py-2.5 px-4">Complex Amp</th>
                <th className="py-2.5 px-4">Phase (deg)</th>
                <th className="py-2.5 px-4">Probability</th>
                <th className="py-2.5 px-4 text-right">Sampled Shots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {simResult.stateVector.map((sv) => {
                const probPct = (sv.probability * 100).toFixed(1);
                const phaseDeg = ((sv.phase * 180) / Math.PI).toFixed(1);
                return (
                  <tr key={sv.basis} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-cyan-300">{sv.basis}</td>
                    <td className="py-2.5 px-4 text-slate-400">{sv.amplitude.r.toFixed(4)}</td>
                    <td className="py-2.5 px-4 text-slate-400">{sv.amplitude.i.toFixed(4)}</td>
                    <td className="py-2.5 px-4 text-violet-300">{ComplexMath.format(sv.amplitude)}</td>
                    <td className="py-2.5 px-4 text-slate-400">{phaseDeg}°</td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">{probPct}%</td>
                    <td className="py-2.5 px-4 text-right text-emerald-400">
                      {simResult.shotsResult?.[sv.basis] || 0} / 1024
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bell State Experiment Section (Section 10 requirement) */}
      <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-400" />
            <span className="font-bold text-indigo-200 text-sm">
              EPR Bell State Experiment: Entanglement Correlation
            </span>
          </div>

          {onLoadBellState && (
            <button
              onClick={onLoadBellState}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
            >
              Load Bell Experiment Circuit
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Why are individual outcomes random while joint outcomes are correlated?</strong>
          <br />
          If you measure qubit 0 alone, the partial trace yields a completely mixed reduced density matrix
          ρ₀ = ½|0⟩⟨0| + ½|1⟩⟨1|, giving a 50/50 uniform coin-flip. The same holds true for qubit 1 alone.
          Yet because the joint quantum state is |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, the off-diagonal quantum coherence
          strictly forbids outcomes |01⟩ and |10⟩. The individual qubits behave completely randomly, yet their
          simultaneous joint measurements exhibit perfect non-local correlation!
        </p>
      </div>
    </div>
  );
};
